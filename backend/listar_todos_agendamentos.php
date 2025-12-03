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
    
    $sql = "
        SELECT 
            a.id,
            a.cliente_nome,
            a.cliente_telefone,
            a.data,
            a.hora,
            a.status,
            a.observacoes,
            s.nome_servico as servico_nome,
            s.preco,
            DATE_FORMAT(a.data, '%d/%m/%Y') as data_formatada,
            DATE_FORMAT(a.hora, '%H:%i') as hora
        FROM agendamentos a
        JOIN servicos s ON a.servico_id = s.id
        WHERE a.barbeiro_id = ?
    ";
    
    $params = [$barbeiro_id];
    
    // Se foi passado um status, filtra os agendamentos por ele
    if (isset($_GET['status']) && $_GET['status'] !== 'todos') {
        $sql .= " AND a.status = ?";
        $params[] = $_GET['status'];
    }
    
    // Se foi passada uma data, filtra os agendamentos por ela
    if (isset($_GET['data']) && !empty($_GET['data'])) {
        $sql .= " AND a.data = ?";
        $params[] = $_GET['data'];
    }
    
    $sql .= " ORDER BY a.data DESC, a.hora DESC LIMIT 50";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $agendamentos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($agendamentos as &$agendamento) {
        $agendamento['preco'] = number_format($agendamento['preco'], 2, ',', '.');
    }
    
    echo json_encode([
        'success' => true,
        'agendamentos' => $agendamentos
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
}
?>