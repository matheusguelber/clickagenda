<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexao.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Não autorizado']);
    exit;
}

$id = $_GET['id'] ?? 0;
$barbeiro_id = $_SESSION['user_id'];

try {
    $api = new SupabaseAPI();

    // Busca o agendamento pelo ID e garante que pertence ao barbeiro logado
    $agendamento = $api->selectOne(
        'agendamentos', 
        ['id' => $id, 'barbeiro_id' => $barbeiro_id]
    );

    if ($agendamento) {
        // Ajusta a hora para mostrar só horas e minutos
        if(isset($agendamento['hora'])) {
            $agendamento['hora'] = substr($agendamento['hora'], 0, 5);
        }
        echo json_encode(['success' => true, 'data' => $agendamento]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Agendamento não encontrado']);
    }

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>