<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexao.php';
session_start();

// Só conta notificações se o barbeiro estiver logado
if (!isset($_SESSION['user_id']) || $_SESSION['user_tipo'] != 'barbeiro') {
    echo json_encode(['total' => 0]);
    exit;
}

$barbeiro_id = $_SESSION['user_id'];

try {
    // Conta quantos agendamentos estão pendentes para esse barbeiro
    $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM agendamentos WHERE barbeiro_id = ? AND status = 'pendente'");
    $stmt->execute([$barbeiro_id]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    $total = $result ? intval($result['total']) : 0;

    echo json_encode(['total' => $total]);
} catch (Exception $e) {
    echo json_encode(['total' => 0]);
}
?>