<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexao.php'; // Adicionei __DIR__ por segurança

// Fix de sessão
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Não autorizado']);
    exit;
}

// CORREÇÃO: O JavaScript envia 'agendamento_id', não 'id'
$id = $_POST['agendamento_id'] ?? 0; 
$barbeiro_id = $_SESSION['user_id'];

if (!$id) {
    echo json_encode(['success' => false, 'message' => 'ID inválido recebido.']);
    exit;
}

try {
    $api = new SupabaseAPI();
    
    // Tenta atualizar
    // O Supabase retorna os dados que foram alterados
    $resultado = $api->update('agendamentos', 
        ['id' => $id, 'barbeiro_id' => $barbeiro_id], 
        ['status' => 'cancelado']
    );

    // Verificação Extra: Se o array vier vazio, significa que não achou o agendamento
    if (is_array($resultado) && count($resultado) > 0) {
        echo json_encode(['success' => true, 'message' => 'Agendamento cancelado com sucesso.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Erro: Agendamento não encontrado ou já cancelado.']);
    }

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Erro ao cancelar: ' . $e->getMessage()]);
}
?>