<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexao.php';
session_start();

if (!isset($_SESSION['user_id']) || $_SESSION['user_tipo'] != 'barbeiro') {
    echo json_encode(['success' => false, 'message' => 'Não autorizado.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'];
    $barbeiro_id = $_SESSION['user_id'];

    try {
        $stmt = $pdo->prepare("DELETE FROM servicos WHERE id=? AND barbeiro_id=?");
        $stmt->execute([$id, $barbeiro_id]);

        echo json_encode(['success' => true, 'message' => 'Serviço excluído!']);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erro ao excluir.']);
    }
}
?>