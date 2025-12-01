<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexao.php';
session_start();

// Verifica se está logado
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
        // Inicia uma transação (para garantir que tudo seja feito ou nada seja feito)
        $pdo->beginTransaction();

        // 1. PRIMEIRO: Deleta os agendamentos ligados a esse serviço
        // Isso resolve o erro SQLSTATE[23000]
        $stmt = $pdo->prepare("DELETE FROM agendamentos WHERE servico_id = ? AND barbeiro_id = ?");
        $stmt->execute([$id, $barbeiro_id]);

        // 2. SEGUNDO: Deleta o serviço
        $stmt = $pdo->prepare("DELETE FROM servicos WHERE id = ? AND barbeiro_id = ?");
        $stmt->execute([$id, $barbeiro_id]);

        if ($stmt->rowCount() > 0) {
            // Confirma as alterações
            $pdo->commit();
            echo json_encode(['success' => true, 'message' => 'Serviço excluído com sucesso!']);
        } else {
            // Se não achou o serviço para deletar
            $pdo->rollBack();
            echo json_encode(['success' => false, 'message' => 'Serviço não encontrado.']);
        }

    } catch (PDOException $e) {
        // Se der qualquer erro, desfaz tudo
        $pdo->rollBack();
        echo json_encode(['success' => false, 'message' => 'Erro ao excluir: ' . $e->getMessage()]);
    }
}
?>