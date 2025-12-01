<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexao.php';
session_start();

if (!isset($_SESSION['user_id']) || $_SESSION['user_tipo'] != 'barbeiro') {
    echo json_encode(['success' => false, 'message' => 'Acesso não autorizado.']);
    exit;
}

try {
    $barbeiro_id = $_SESSION['user_id'];
    
    // CORREÇÃO AQUI: Adicionei "id" na lista de campos
    $stmt = $pdo->prepare("SELECT id, nome_servico, preco, duracao_minutos FROM servicos WHERE barbeiro_id = ? ORDER BY nome_servico");
    $stmt->execute([$barbeiro_id]);
    
    $servicos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'servicos' => $servicos]);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Erro no banco de dados: ' . $e->getMessage()]);
}
?>