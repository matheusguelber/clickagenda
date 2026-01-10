<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexao.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'clientes' => []]);
    exit;
}

$termo = isset($_GET['termo']) ? strtolower(trim($_GET['termo'])) : '';
$barbeiro_id = $_SESSION['user_id'];

try {
    $api = new SupabaseAPI();
    
    // Busca nome e telefone dos agendamentos
    $dados = $api->select('agendamentos', ['barbeiro_id' => $barbeiro_id], 'cliente_nome, cliente_telefone');
    
    $clientesUnicos = [];
    $telefonesVistos = [];

    if (is_array($dados)) {
        // Inverte para pegar os nomes mais recentes primeiro
        $dados = array_reverse($dados);

        foreach ($dados as $linha) {
            $nome = $linha['cliente_nome'];
            $tel = $linha['cliente_telefone'];
            
            // Filtro de busca (se houver termo)
            if ($termo && (strpos(strtolower($nome), $termo) === false && strpos($tel, $termo) === false)) {
                continue;
            }

            if (!in_array($tel, $telefonesVistos)) {
                $telefonesVistos[] = $tel;
                
                // MANTENHA AS CHAVES IGUAIS AO QUE O JS ESPERA
                $clientesUnicos[] = [
                    'cliente_nome' => $nome,     // Antes estava 'nome'
                    'cliente_telefone' => $tel   // Antes estava 'telefone'
                ];
            }
        }
    }

    // Retorna no máximo 15 resultados
    echo json_encode([
        'success' => true,
        'clientes' => array_slice($clientesUnicos, 0, 15)
    ]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'clientes' => []]);
}
?>