<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexao.php';

session_start();

if (!isset($_SESSION['user_id']) || $_SESSION['user_tipo'] != 'barbeiro') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Acesso não autorizado.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $barbeiro_id = $_SESSION['user_id'];
        $agendamento_id = intval($_POST['agendamento_id'] ?? 0);
        $status = $_POST['status'] ?? '';
        
        if (!$agendamento_id || !in_array($status, ['pendente', 'confirmado', 'cancelado'])) {
            echo json_encode(['success' => false, 'message' => 'Dados inválidos.']);
            exit;
        }
        
        // Verifica se pertence ao barbeiro
        $stmt = $pdo->prepare("SELECT id FROM agendamentos WHERE id = ? AND barbeiro_id = ?");
        $stmt->execute([$agendamento_id, $barbeiro_id]);
        
        if ($stmt->rowCount() === 0) {
            echo json_encode(['success' => false, 'message' => 'Agendamento não encontrado.']);
            exit;
        }
        
        // Atualiza o status
        $stmt = $pdo->prepare("UPDATE agendamentos SET status = ? WHERE id = ?");
        $stmt->execute([$status, $agendamento_id]);
        
        $mensagem = $status === 'confirmado' ? 'Agendamento confirmado!' : 'Agendamento cancelado!';
        
        echo json_encode(['success' => true, 'message' => $mensagem]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
    }
}
?>