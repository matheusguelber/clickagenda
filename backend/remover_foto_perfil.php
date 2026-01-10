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
    // Busca o caminho da foto atual para poder apagar
    $stmt = $pdo->prepare("SELECT foto_perfil FROM usuarios WHERE id = ?");
    $stmt->execute([$id]);
    $caminhoFoto = $stmt->fetchColumn();

    // Se existir o arquivo, apaga do servidor
    if ($caminhoFoto && file_exists(__DIR__ . '/../' . $caminhoFoto)) {
        unlink(__DIR__ . '/../' . $caminhoFoto);
    }

    // Limpa o campo da foto no banco de dados
    $stmt = $pdo->prepare("UPDATE usuarios SET foto_perfil = NULL WHERE id = ?");
    $stmt->execute([$id]);

    // Remove a foto da sessão do usuário
    unset($_SESSION['user_foto']);

    echo json_encode(['success' => true, 'message' => 'Foto removida com sucesso!']);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Erro no banco de dados.']);
}
?>