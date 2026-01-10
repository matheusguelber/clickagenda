<?php
header('Content-Type: application/json; charset=utf-8');
require_once 'conexao.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'];
    $nome = $_POST['nome_servico'];
    $preco = str_replace(',', '.', $_POST['preco']);
    $duracao = $_POST['duracao'];
    $barbeiro_id = $_SESSION['user_id'];

    try {
        $supabase = new SupabaseAPI();
        
        // Atualiza garantindo que o serviço pertence ao barbeiro
        $supabase->update('servicos', 
            ['id' => $id, 'barbeiro_id' => $barbeiro_id],
            [
                'nome_servico' => $nome,
                'preco' => floatval($preco),
                'duracao' => intval($duracao)
            ]
        );
        
        echo json_encode(['success' => true, 'message' => 'Serviço atualizado!']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}
?>