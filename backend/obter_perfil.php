<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexao.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Usuário não está logado']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT nome, email, telefone FROM usuarios WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode(['success' => true, 'dados' => $user]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Erro ao buscar dados']);
}
?>