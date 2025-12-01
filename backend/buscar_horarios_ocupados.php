<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexao.php';

$barbeiro_id = isset($_GET['barbeiro_id']) ? intval($_GET['barbeiro_id']) : 0;
$data = $_GET['data'] ?? '';

if (!$barbeiro_id || !$data) {
    echo json_encode([]);
    exit;
}

try {
    // Busca horários ocupados (ignora cancelados)
    $stmt = $pdo->prepare("SELECT hora FROM agendamentos WHERE barbeiro_id = ? AND data = ? AND status != 'cancelado'");
    $stmt->execute([$barbeiro_id, $data]);
    $ocupados = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    // Formata para garantir HH:MM (ex: 09:00)
    $ocupadosFormatados = array_map(function($hora) {
        return substr($hora, 0, 5);
    }, $ocupados);

    echo json_encode($ocupadosFormatados);
} catch (PDOException $e) {
    echo json_encode([]);
}
?>