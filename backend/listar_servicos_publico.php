<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexao.php';

// Pega o ID do barbeiro da URL
$barbeiro_id = isset($_GET['barbeiro_id']) ? intval($_GET['barbeiro_id']) : 0;

if (!$barbeiro_id) {
    echo json_encode(['success' => false, 'message' => 'ID não fornecido.']);
    exit;
}

try {
    // Busca os serviços desse barbeiro
    $stmt = $pdo->prepare("SELECT id, nome_servico, preco, duracao_minutos FROM servicos WHERE barbeiro_id = ? ORDER BY nome_servico");
    $stmt->execute([$barbeiro_id]);
    $servicos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'servicos' => $servicos]);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
}
?>