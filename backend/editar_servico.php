<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexao.php';
session_start();

if (!isset($_SESSION['user_id']) || $_SESSION['user_tipo'] != 'barbeiro') {
    echo json_encode(['success' => false, 'message' => 'Não autorizado.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Força conversão para garantir que o ID é número
    $id = isset($_POST['id']) ? intval($_POST['id']) : 0;
    $nome = trim($_POST['nome_servico'] ?? '');
    $preco = $_POST['preco'] ?? 0;
    $duracao = $_POST['duracao'] ?? 0;
    $barbeiro_id = $_SESSION['user_id'];

    if ($id <= 0 || empty($nome)) {
        echo json_encode(['success' => false, 'message' => 'Dados inválidos.']);
        exit;
    }

    try {
        // Atualiza apenas se o ID bater E o dono for o barbeiro logado
        $stmt = $pdo->prepare("UPDATE servicos SET nome_servico=?, preco=?, duracao_minutos=? WHERE id=? AND barbeiro_id=?");
        $stmt->execute([$nome, $preco, $duracao, $id, $barbeiro_id]);

        echo json_encode(['success' => true, 'message' => 'Serviço atualizado com sucesso!']);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erro ao atualizar: ' . $e->getMessage()]);
    }
}
?>