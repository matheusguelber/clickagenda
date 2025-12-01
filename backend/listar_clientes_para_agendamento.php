<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexao.php';

session_start();

if (!isset($_SESSION['user_id']) || $_SESSION['user_tipo'] != 'barbeiro') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Acesso não autorizado.']);
    exit;
}

try {
    $barbeiro_id = $_SESSION['user_id'];
    
    // Busca clientes únicos que já agendaram com este barbeiro
    $stmt = $pdo->prepare("
        SELECT DISTINCT 
            cliente_nome,
            cliente_telefone
        FROM agendamentos
        WHERE barbeiro_id = ?
        ORDER BY cliente_nome ASC
    ");
    $stmt->execute([$barbeiro_id]);
    $clientes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'clientes' => $clientes
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
}
?>