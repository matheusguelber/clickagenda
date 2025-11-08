<?php
require 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nome = $_POST['nome'];
    $email = $_POST['email'];
    $senha = password_hash($_POST['senha'], PASSWORD_DEFAULT);  // Hash seguro
    $tipo = $_POST['tipo'];  // 'barbeiro' ou 'cliente'
    $telefone = $_POST['telefone'];

    $stmt = $pdo->prepare("INSERT INTO usuarios (nome, email, senha, tipo, telefone) VALUES (?, ?, ?, ?, ?)");
    if ($stmt->execute([$nome, $email, $senha, $tipo, $telefone])) {
        echo json_encode(['success' => true, 'message' => 'Usuário cadastrado com sucesso!']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Erro ao cadastrar.']);
    }
}
?>