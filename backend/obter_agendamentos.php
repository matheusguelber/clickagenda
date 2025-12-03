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
    
    // Pega os próximos agendamentos (a partir de hoje, que não foram cancelados)
    $stmt = $pdo->prepare("
        SELECT 
            a.id,
            a.cliente_nome,
            a.cliente_telefone,
            a.data,
            a.hora,
            a.status,
            s.nome_servico as servico_nome,
            s.preco,
            DATE_FORMAT(a.data, '%d/%m/%Y') as data_formatada,
            DATE_FORMAT(a.hora, '%H:%i') as hora
        FROM agendamentos a
        JOIN servicos s ON a.servico_id = s.id
        WHERE a.barbeiro_id = ? 
        AND a.data >= CURDATE()
        AND a.status != 'cancelado'
        ORDER BY a.data ASC, a.hora ASC
        LIMIT 10
    ");
    $stmt->execute([$barbeiro_id]);
    $agendamentos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Deixa o preço no formato brasileiro
    foreach ($agendamentos as &$agendamento) {
        $agendamento['preco'] = number_format($agendamento['preco'], 2, ',', '.');
    }
    
    echo json_encode([
        'success' => true,
        'agendamentos' => $agendamentos
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro no banco: ' . $e->getMessage()]);
}
?>