<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexao.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Não autorizado']);
    exit;
}

$id = $_SESSION['user_id'];

try {
    // 1. Busca o caminho da foto atual para deletar o arquivo
    $stmt = $pdo->prepare("SELECT foto_perfil FROM usuarios WHERE id = ?");
    $stmt->execute([$id]);
    $caminhoFoto = $stmt->fetchColumn();

    // 2. Se existir arquivo físico, apaga
    if ($caminhoFoto && file_exists(__DIR__ . '/../' . $caminhoFoto)) {
        unlink(__DIR__ . '/../' . $caminhoFoto);
    }

    // 3. Limpa o campo no banco de dados (define como NULL)
    $stmt = $pdo->prepare("UPDATE usuarios SET foto_perfil = NULL WHERE id = ?");
    $stmt->execute([$id]);

    // 4. Limpa a sessão
    unset($_SESSION['user_foto']);

    echo json_encode(['success' => true, 'message' => 'Foto removida com sucesso!']);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Erro no banco de dados.']);
}
?>