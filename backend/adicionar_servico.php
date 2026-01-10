<?php
header('Content-Type: application/json; charset=utf-8');
require_once 'conexao.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Não autorizado']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nome = $_POST['nome_servico'];
    $preco = str_replace(',', '.', $_POST['preco']); // Trata vírgula
    $duracao = $_POST['duracao'];
    $barbeiro_id = $_SESSION['user_id'];

    try {
        $supabase = new SupabaseAPI();
        
        $dados = [
            'barbeiro_id' => $barbeiro_id,
            'nome_servico' => $nome,
            'preco' => floatval($preco),
            'duracao' => intval($duracao)
        ];

        $supabase->insert('servicos', $dados);
        
        echo json_encode(['success' => true, 'message' => 'Serviço adicionado!']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}
?>