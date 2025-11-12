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
    
    $stmt = $pdo->prepare("
        SELECT 
            a.cliente_nome,
            a.cliente_telefone,
            COUNT(a.id) as total_agendamentos,
            COALESCE(SUM(s.preco), 0) as total_gasto
        FROM agendamentos a
        JOIN servicos s ON a.servico_id = s.id
        WHERE a.barbeiro_id = ? AND a.status != 'cancelado'
        GROUP BY a.cliente_nome, a.cliente_telefone
        ORDER BY total_agendamentos DESC
    ");
    $stmt->execute([$barbeiro_id]);
    $clientes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($clientes as &$cliente) {
        $cliente['total_gasto'] = number_format($cliente['total_gasto'], 2, ',', '.');
    }
    
    echo json_encode([
        'success' => true,
        'clientes' => $clientes
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
}
?>