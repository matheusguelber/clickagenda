<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexao.php';
session_start();

if (!isset($_SESSION['user_id']) || $_SESSION['user_tipo'] != 'barbeiro') {
    echo json_encode(['success' => false, 'notificacoes' => []]);
    exit;
}

$barbeiro_id = $_SESSION['user_id'];

try {
    // Busca os 5 últimos agendamentos pendentes
    $stmt = $pdo->prepare("
        SELECT a.id, a.cliente_nome, a.data, a.hora, s.nome_servico 
        FROM agendamentos a
        JOIN servicos s ON a.servico_id = s.id
        WHERE a.barbeiro_id = ? AND a.status = 'pendente'
        ORDER BY a.data ASC, a.hora ASC
        LIMIT 5
    ");
    $stmt->execute([$barbeiro_id]);
    $notificacoes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Formata dados para exibição
    foreach ($notificacoes as &$notif) {
        $notif['data_formatada'] = date('d/m', strtotime($notif['data']));
        $notif['hora_formatada'] = substr($notif['hora'], 0, 5);
    }

    echo json_encode(['success' => true, 'notificacoes' => $notificacoes]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'notificacoes' => []]);
}
?>