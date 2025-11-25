<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexao.php';
session_start();

if (!isset($_SESSION['user_id']) || $_SESSION['user_tipo'] != 'barbeiro') {
    echo json_encode(['success' => false, 'message' => 'Não autorizado.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'];
    $nome = $_POST['nome_servico'];
    $preco = $_POST['preco'];
    $duracao = $_POST['duracao'];
    $barbeiro_id = $_SESSION['user_id'];

    try {
        // Garante que só edita se o serviço pertencer ao barbeiro logado
        $stmt = $pdo->prepare("UPDATE servicos SET nome_servico=?, preco=?, duracao_minutos=? WHERE id=? AND barbeiro_id=?");
        $stmt->execute([$nome, $preco, $duracao, $id, $barbeiro_id]);

        echo json_encode(['success' => true, 'message' => 'Serviço atualizado!']);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erro ao atualizar.']);
    }
}
?>