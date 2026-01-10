<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexao.php'; // Isso carrega a classe SupabaseAPI

// 1. Correção do erro de sessão: Verifica se já existe antes de iniciar
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (!isset($_SESSION['user_id']) || $_SESSION['user_tipo'] != 'barbeiro') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Acesso não autorizado.']);
    exit;
}

try {
    // Instancia a API (Substitui o $pdo)
    $api = new SupabaseAPI();
    $barbeiro_id = $_SESSION['user_id'];
    
    // === PASSO 1: Configurar Filtros ===
    $filtros = ['barbeiro_id' => $barbeiro_id];
    
    // Se foi passado um status e não é 'todos'
    if (isset($_GET['status']) && $_GET['status'] !== 'todos') {
        $filtros['status'] = $_GET['status'];
    }
    
    // Se foi passada uma data
    if (isset($_GET['data']) && !empty($_GET['data'])) {
        $filtros['data'] = $_GET['data'];
    }
    
    // === PASSO 2: Buscar Dados no Supabase ===
    
    // Busca os agendamentos
    $agendamentosRaw = $api->select('agendamentos', $filtros);
    
    // Busca TODOS os serviços desse barbeiro (para podermos pegar o nome e preço)
    // Como não temos JOIN, buscamos a lista de serviços para cruzar os dados
    $servicosRaw = $api->select('servicos', ['barbeiro_id' => $barbeiro_id]);
    
    // Cria um mapa de serviços para facilitar a busca: [id_servico => dados_servico]
    $mapaServicos = [];
    if (is_array($servicosRaw)) {
        foreach ($servicosRaw as $s) {
            $mapaServicos[$s['id']] = $s;
        }
    }
    
    // === PASSO 3: Processar e Juntar os Dados (Simulando o JOIN) ===
    $resultado = [];
    
    if (is_array($agendamentosRaw)) {
        // Ordenação via PHP (Do mais recente para o mais antigo)
        // Isso substitui o "ORDER BY a.data DESC, a.hora DESC"
        usort($agendamentosRaw, function($a, $b) {
            return strtotime($b['data'] . ' ' . $b['hora']) - strtotime($a['data'] . ' ' . $a['hora']);
        });

        // Limite manual (simulando LIMIT 50)
        $agendamentosRaw = array_slice($agendamentosRaw, 0, 50);

        foreach ($agendamentosRaw as $ag) {
            // Pega os dados do serviço correspondente
            $servicoId = $ag['servico_id'];
            $dadosServico = isset($mapaServicos[$servicoId]) ? $mapaServicos[$servicoId] : null;
            
            // Define nome e preço (com fallback se o serviço tiver sido excluído)
            $nomeServico = $dadosServico ? $dadosServico['nome_servico'] : 'Serviço Removido';
            $preco = $dadosServico ? $dadosServico['preco'] : 0;
            
            // Formatação de Datas (Substitui DATE_FORMAT do SQL)
            $dateObj = new DateTime($ag['data']);
            $horaObj = new DateTime($ag['hora']);
            
            // Monta o objeto final igual o Frontend espera
            $resultado[] = [
                'id' => $ag['id'],
                'cliente_nome' => $ag['cliente_nome'],
                'cliente_telefone' => $ag['cliente_telefone'],
                'data' => $ag['data'], // Formato YYYY-MM-DD para input
                'hora' => $horaObj->format('H:i'), // Formato HH:MM
                'status' => $ag['status'],
                'observacoes' => $ag['observacoes'] ?? '',
                'servico_nome' => $nomeServico,
                'preco' => number_format($preco, 2, ',', '.'),
                'data_formatada' => $dateObj->format('d/m/Y')
            ];
        }
    }
    
    echo json_encode([
        'success' => true,
        'agendamentos' => $resultado
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
}
?>