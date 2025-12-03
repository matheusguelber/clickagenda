<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexao.php';
session_start();

// Só deixa continuar se o usuário for barbeiro
if (!isset($_SESSION['user_id']) || $_SESSION['user_tipo'] != 'barbeiro') {
    echo json_encode(['success' => false, 'message' => 'Não autorizado.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'] ?? null;
    $barbeiro_id = $_SESSION['user_id'];

    if (!$id) {
        echo json_encode(['success' => false, 'message' => 'ID inválido.']);
        exit;
    }

    try {
        // Começa uma transação para garantir que tudo ou nada seja feito
        $pdo->beginTransaction();

        // Primeiro apaga todos os agendamentos que usam esse serviço
        // Isso evita erro de restrição do banco
        $stmt = $pdo->prepare("DELETE FROM agendamentos WHERE servico_id = ? AND barbeiro_id = ?");
        $stmt->execute([$id, $barbeiro_id]);

        // Depois apaga o serviço em si
        $stmt = $pdo->prepare("DELETE FROM servicos WHERE id = ? AND barbeiro_id = ?");
        $stmt->execute([$id, $barbeiro_id]);

        if ($stmt->rowCount() > 0) {
            // Se deu tudo certo, confirma no banco
            $pdo->commit();
            echo json_encode(['success' => true, 'message' => 'Serviço excluído com sucesso!']);
        } else {
            // Se não encontrou o serviço, desfaz tudo
            $pdo->rollBack();
            echo json_encode(['success' => false, 'message' => 'Serviço não encontrado.']);
        }

    } catch (PDOException $e) {
        // Se acontecer algum erro, desfaz tudo
        $pdo->rollBack();
        echo json_encode(['success' => false, 'message' => 'Erro ao excluir: ' . $e->getMessage()]);
    }
}
?>