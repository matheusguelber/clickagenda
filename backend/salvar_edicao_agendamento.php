<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexao.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Não autorizado']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'];
    $servico_id = $_POST['servico_id'];
    $data = $_POST['data'];
    $hora = $_POST['hora'];
    $observacoes = $_POST['observacoes'];
    $barbeiro_id = $_SESSION['user_id'];

    try {
        $stmt = $pdo->prepare("
            UPDATE agendamentos 
            SET servico_id = ?, data = ?, hora = ?, observacoes = ? 
            WHERE id = ? AND barbeiro_id = ?
        ");
        $stmt->execute([$servico_id, $data, $hora, $observacoes, $id, $barbeiro_id]);

        echo json_encode(['success' => true, 'message' => 'Agendamento atualizado com sucesso!']);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erro ao atualizar: ' . $e->getMessage()]);
    }
}
?>