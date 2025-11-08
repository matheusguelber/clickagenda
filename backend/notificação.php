<?php
require 'config.php';

// Exemplo: Enviar notificação após agendamento
$agendamento_id = $_POST['agendamento_id'];
$stmt = $pdo->prepare("SELECT a.*, u.email FROM agendamentos a JOIN usuarios u ON a.cliente_id = u.id WHERE a.id = ?");
$stmt->execute([$agendamento_id]);
$agendamento = $stmt->fetch(PDO::FETCH_ASSOC);

// Simulação de envio (substitua por PHPMailer ou similar)
mail($agendamento['email'], 'Lembrete de Agendamento', 'Seu agendamento para ' . $agendamento['data'] . ' às ' . $agendamento['hora'] . ' foi confirmado.');
echo json_encode(['success' => true, 'message' => 'Notificação enviada!']);
?>