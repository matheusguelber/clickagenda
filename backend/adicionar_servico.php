<?php
require 'config.php';
session_start();

if (!isset($_SESSION['user_id']) || $_SESSION['user_tipo'] !== 'barbeiro') {
    echo json_encode(['success' => false, 'message' => 'Acesso negado.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $barbeiro_id = $_SESSION['user_id'];
    $nome = $_POST['nome'];
    $preco = $_POST['preco'];
    $duracao = $_POST['duracao'];
    
    $stmt = $pdo->prepare("INSERT INTO servicos (barbeiro_id, nome, preco, duracao_minutos) VALUES (?, ?, ?, ?)");
    if ($stmt->execute([$barbeiro_id, $nome, $preco, $duracao])) {
        echo json_encode(['success' => true, 'message' => 'Serviço adicionado!']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Erro ao adicionar.']);
    }
}
?>