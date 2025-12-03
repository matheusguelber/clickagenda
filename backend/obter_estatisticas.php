<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexao.php';

session_start();

// Só deixa continuar se o usuário for barbeiro e estiver logado
if (!isset($_SESSION['user_id']) || $_SESSION['user_tipo'] != 'barbeiro') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Acesso não autorizado.']);
    exit;
}

try {
    $barbeiro_id = $_SESSION['user_id'];
    
    // Conta quantos agendamentos tem hoje
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as total 
        FROM agendamentos 
        WHERE barbeiro_id = ? AND data = CURDATE() AND status != 'cancelado'
    ");
    $stmt->execute([$barbeiro_id]);
    $agendamentos_hoje = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Conta quantos clientes diferentes já agendaram
    $stmt = $pdo->prepare("
        SELECT COUNT(DISTINCT cliente_telefone) as total 
        FROM agendamentos 
        WHERE barbeiro_id = ?
    ");
    $stmt->execute([$barbeiro_id]);
    $total_clientes = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Soma o valor total dos serviços confirmados no mês
    $stmt = $pdo->prepare("
        SELECT COALESCE(SUM(s.preco), 0) as total 
        FROM agendamentos a
        JOIN servicos s ON a.servico_id = s.id
        WHERE a.barbeiro_id = ? 
        AND MONTH(a.data) = MONTH(CURDATE())
        AND YEAR(a.data) = YEAR(CURDATE())
        AND a.status = 'confirmado'
    ");
    $stmt->execute([$barbeiro_id]);
    $faturamento_mes = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    $faturamento_formatado = number_format($faturamento_mes, 2, ',', '.');
    
    // Calcula a taxa de presença (quantos compareceram vs total de agendamentos)
    $stmt = $pdo->prepare("
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'confirmado' THEN 1 ELSE 0 END) as confirmados
        FROM agendamentos 
        WHERE barbeiro_id = ? AND data < CURDATE()
    ");
    $stmt->execute([$barbeiro_id]);
    $resultado = $stmt->fetch(PDO::FETCH_ASSOC);
    
    $taxa_presenca = '0%';
    if ($resultado['total'] > 0) {
        $percentual = round(($resultado['confirmados'] / $resultado['total']) * 100);
        $taxa_presenca = $percentual . '%';
    }
    
    echo json_encode([
        'success' => true,
        'estatisticas' => [
            'agendamentos_hoje' => $agendamentos_hoje,
            'total_clientes' => $total_clientes,
            'faturamento_mes' => $faturamento_formatado,
            'taxa_presenca' => $taxa_presenca
        ]
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro no banco: ' . $e->getMessage()]);
}
?>