<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexao.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Não autorizado']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nome = trim($_POST['nome']);
    $email = trim($_POST['email']);
    $telefone = trim($_POST['telefone']);
    $id = $_SESSION['user_id'];

    if (empty($nome) || empty($email)) {
        echo json_encode(['success' => false, 'message' => 'Nome e E-mail são obrigatórios']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("UPDATE usuarios SET nome = ?, email = ?, telefone = ? WHERE id = ?");
        $stmt->execute([$nome, $email, $telefone, $id]);
        
        // Atualiza o nome na sessão para refletir a alteração
        $_SESSION['user_nome'] = $nome;
        
        echo json_encode(['success' => true, 'message' => 'Dados atualizados com sucesso!']);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erro: E-mail já pode estar em uso.']);
    }
}
?>