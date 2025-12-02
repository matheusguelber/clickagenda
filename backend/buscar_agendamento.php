<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexao.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false]);
    exit;
}

$id = $_GET['id'] ?? 0;
$barbeiro_id = $_SESSION['user_id'];

try {
    $stmt = $pdo->prepare("SELECT * FROM agendamentos WHERE id = ? AND barbeiro_id = ?");
    $stmt->execute([$id, $barbeiro_id]);
    $agendamento = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($agendamento) {
        // Formata a hora para HH:MM (remove os segundos se tiver)
        $agendamento['hora'] = substr($agendamento['hora'], 0, 5);
        echo json_encode(['success' => true, 'data' => $agendamento]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Agendamento não encontrado']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>