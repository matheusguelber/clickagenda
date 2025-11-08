<?php
require 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $cliente_id = $_POST['cliente_id'];  // ID do cliente logado
    $barbeiro_id = $_POST['barbeiro_id'];
    $servico_id = $_POST['servico_id'];
    $data = $_POST['data'];
    $hora = $_POST['hora'];

    // Verificar se o horário está disponível
    $stmt = $pdo->prepare("SELECT * FROM horarios_disponiveis WHERE barbeiro_id = ? AND data = ? AND hora_inicio <= ? AND hora_fim >= ? AND disponivel = TRUE");
    $stmt->execute([$barbeiro_id, $data, $hora, $hora]);
    if ($stmt->rowCount() > 0) {
        // Inserir agendamento
        $stmt = $pdo->prepare("INSERT INTO agendamentos (cliente_id, barbeiro_id, servico_id, data, hora) VALUES (?, ?, ?, ?, ?)");
        if ($stmt->execute([$cliente_id, $barbeiro_id, $servico_id, $data, $hora])) {
            // Marcar horário como indisponível
            $pdo->prepare("UPDATE horarios_disponiveis SET disponivel = FALSE WHERE barbeiro_id = ? AND data = ? AND hora_inicio <= ? AND hora_fim >= ?")->execute([$barbeiro_id, $data, $hora, $hora]);
            echo json_encode(['success' => true, 'message' => 'Agendamento realizado!']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro ao agendar.']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Horário indisponível.']);
    }
}
?>