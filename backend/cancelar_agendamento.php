<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexao.php';

session_start();

// Verifica se o usuário está logado
if (!isset($_SESSION['user_id']) || $_SESSION['user_tipo'] != 'barbeiro') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Acesso não autorizado.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $barbeiro_id = $_SESSION['user_id'];
        $agendamento_id = intval($_POST['agendamento_id'] ?? 0);
        
        if (!$agendamento_id) {
            echo json_encode(['success' => false, 'message' => 'ID do agendamento inválido.']);
            exit;
        }
        
        // Verifica se o agendamento pertence ao barbeiro logado
        $stmt = $pdo->prepare("SELECT id FROM agendamentos WHERE id = ? AND barbeiro_id = ?");
        $stmt->execute([$agendamento_id, $barbeiro_id]);
        
        if ($stmt->rowCount() === 0) {
            echo json_encode(['success' => false, 'message' => 'Agendamento não encontrado ou não autorizado.']);
            exit;
        }
        
        // Atualiza o status para cancelado
        $stmt = $pdo->prepare("UPDATE agendamentos SET status = 'cancelado' WHERE id = ?");
        $stmt->execute([$agendamento_id]);
        
        echo json_encode(['success' => true, 'message' => 'Agendamento cancelado com sucesso!']);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Erro no banco: ' . $e->getMessage()]);
    }
}
?>