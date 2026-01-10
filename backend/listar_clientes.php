<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexao.php';

// Fix de sessão
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (!isset($_SESSION['user_id'])) {
    // Retorna estrutura padrão vazia se não logado
    echo json_encode(['success' => false, 'clientes' => []]);
    exit;
}

try {
    $api = new SupabaseAPI();
    $barbeiro_id = $_SESSION['user_id'];

    // 1. Busca todos os agendamentos (para contar histórico)
    // Precisamos do servico_id para calcular o gasto total
    $agendamentos = $api->select('agendamentos', ['barbeiro_id' => $barbeiro_id]);

    // 2. Busca todos os serviços (para pegar o preço)
    $servicos = $api->select('servicos', ['barbeiro_id' => $barbeiro_id]);
    
    // Mapeia preços: [id_servico => preco]
    $mapaPrecos = [];
    if (is_array($servicos)) {
        foreach ($servicos as $s) {
            $mapaPrecos[$s['id']] = floatval($s['preco']);
        }
    }

    // 3. Agrupa por cliente (Telefone é a chave única)
    $clientesMap = [];

    if (is_array($agendamentos)) {
        foreach ($agendamentos as $ag) {
            $tel = trim($ag['cliente_telefone']);
            
            // Se o telefone estiver vazio, pula
            if (empty($tel)) continue;

            $precoServico = isset($mapaPrecos[$ag['servico_id']]) ? $mapaPrecos[$ag['servico_id']] : 0;

            if (!isset($clientesMap[$tel])) {
                // Cria o cliente se não existe
                $clientesMap[$tel] = [
                    'cliente_nome' => $ag['cliente_nome'], // O JS espera 'cliente_nome'
                    'cliente_telefone' => $tel,            // O JS espera 'cliente_telefone'
                    'total_agendamentos' => 0,
                    'total_gasto' => 0,
                    'ultimo_corte_raw' => $ag['data'] // Para ordenar depois
                ];
            }

            // Atualiza estatísticas
            $clientesMap[$tel]['total_agendamentos']++;
            
            // Soma ao gasto apenas se não foi cancelado (opcional, aqui somamos tudo ou filtramos)
            if ($ag['status'] !== 'cancelado') {
                $clientesMap[$tel]['total_gasto'] += $precoServico;
            }

            // Atualiza data do último corte se esta for mais recente
            if ($ag['data'] > $clientesMap[$tel]['ultimo_corte_raw']) {
                $clientesMap[$tel]['ultimo_corte_raw'] = $ag['data'];
                // Atualiza o nome também, caso o cliente tenha mudado no último agendamento
                $clientesMap[$tel]['cliente_nome'] = $ag['cliente_nome'];
            }
        }
    }

    // 4. Formata para lista e ajusta casas decimais
    $listaFinal = [];
    foreach ($clientesMap as $c) {
        $c['total_gasto'] = number_format($c['total_gasto'], 2, ',', '.');
        unset($c['ultimo_corte_raw']); // Remove auxiliar
        $listaFinal[] = $c;
    }

    // Retorna no formato que o main.js espera
    echo json_encode([
        'success' => true,
        'clientes' => $listaFinal
    ]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>