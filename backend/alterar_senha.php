<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexao.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Não autorizado']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $senha_atual = $_POST['senha_atual'];
    $nova_senha = $_POST['nova_senha'];
    $confirmar_senha = $_POST['confirmar_senha'];
    $id = $_SESSION['user_id'];

    if ($nova_senha !== $confirmar_senha) {
        echo json_encode(['success' => false, 'message' => 'A nova senha e a confirmação não coincidem.']);
        exit;
    }

    if (strlen($nova_senha) < 6) {
        echo json_encode(['success' => false, 'message' => 'A nova senha deve ter pelo menos 6 caracteres.']);
        exit;
    }

    try {
        // 1. Busca a senha atual (hash) no banco
        $stmt = $pdo->prepare("SELECT senha FROM usuarios WHERE id = ?");
        $stmt->execute([$id]);
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

        // 2. Verifica se a senha atual digitada bate com a do banco
        if (!password_verify($senha_atual, $usuario['senha'])) {
            echo json_encode(['success' => false, 'message' => 'Sua senha atual está incorreta.']);
            exit;
        }

        // 3. Atualiza para a nova senha
        $nova_hash = password_hash($nova_senha, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("UPDATE usuarios SET senha = ? WHERE id = ?");
        $stmt->execute([$nova_hash, $id]);

        echo json_encode(['success' => true, 'message' => 'Senha alterada com sucesso!']);

    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erro no banco de dados.']);
    }
}
?>