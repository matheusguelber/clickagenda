<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexao.php';
session_start();

// Só deixa continuar se o usuário estiver logado
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Não autorizado']);
    exit;
}

if (!isset($_FILES['foto_perfil']) || $_FILES['foto_perfil']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['success' => false, 'message' => 'Erro no upload da imagem.']);
    exit;
}

$id = $_SESSION['user_id'];
$arquivo = $_FILES['foto_perfil'];

// Valida o tipo e o tamanho da imagem enviada
$extensoesPermitidas = ['jpg', 'jpeg', 'png'];
$extensao = strtolower(pathinfo($arquivo['name'], PATHINFO_EXTENSION));
if (!in_array($extensao, $extensoesPermitidas)) {
    echo json_encode(['success' => false, 'message' => 'Apenas JPG e PNG são permitidos.']);
    exit;
}

if ($arquivo['size'] > 2 * 1024 * 1024) { // 2MB
    echo json_encode(['success' => false, 'message' => 'A imagem deve ter no máximo 2MB.']);
    exit;
}

// Cria um nome único para o arquivo e define o caminho
// Se a pasta de uploads não existir, cria ela
$pastaUploads = __DIR__ . '/../uploads/perfis/';
if (!is_dir($pastaUploads)) {
    mkdir($pastaUploads, 0755, true);
}

// Usa o ID do usuário e o timestamp para evitar arquivos duplicados
$novoNome = 'perfil_' . $id . '_' . time() . '.' . $extensao;
$caminhoCompleto = $pastaUploads . $novoNome;
$caminhoRelativo = 'uploads/perfis/' . $novoNome; // Isso que salva no banco

// Move o arquivo para a pasta e atualiza o banco de dados
if (move_uploaded_file($arquivo['tmp_name'], $caminhoCompleto)) {
    try {
        // Se já tinha foto, apaga a antiga para liberar espaço
        $stmtOld = $pdo->prepare("SELECT foto_perfil FROM usuarios WHERE id = ?");
        $stmtOld->execute([$id]);
        $oldFoto = $stmtOld->fetchColumn();
        if ($oldFoto && file_exists(__DIR__ . '/../' . $oldFoto)) {
            unlink(__DIR__ . '/../' . $oldFoto);
        }

        // Salva o caminho da nova foto no banco
        $stmt = $pdo->prepare("UPDATE usuarios SET foto_perfil = ? WHERE id = ?");
        $stmt->execute([$caminhoRelativo, $id]);
        
        // Atualiza a foto na sessão do usuário
        $_SESSION['user_foto'] = $caminhoRelativo;
        
        echo json_encode(['success' => true, 'message' => 'Foto de perfil atualizada!', 'caminho' => $caminhoRelativo]);
    } catch (PDOException $e) {
        // Se der erro ao salvar no banco, apaga o arquivo novo
        unlink($caminhoCompleto);
        echo json_encode(['success' => false, 'message' => 'Erro ao atualizar banco de dados.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Erro ao salvar o arquivo no servidor.']);
}
?>