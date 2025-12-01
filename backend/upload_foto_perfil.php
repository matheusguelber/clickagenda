<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexao.php';
session_start();

// 1. Segurança
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

// 2. Validação (Tipo e Tamanho)
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

// 3. Cria nome único e caminho
// Importante: criar a pasta 'uploads/perfis' na raiz do projeto se não existir
$pastaUploads = __DIR__ . '/../uploads/perfis/';
if (!is_dir($pastaUploads)) {
    mkdir($pastaUploads, 0755, true);
}

// Nome do arquivo = ID do usuário + Timestamp (para evitar cache)
$novoNome = 'perfil_' . $id . '_' . time() . '.' . $extensao;
$caminhoCompleto = $pastaUploads . $novoNome;
$caminhoRelativo = 'uploads/perfis/' . $novoNome; // Isso que salva no banco

// 4. Move o arquivo e atualiza o banco
if (move_uploaded_file($arquivo['tmp_name'], $caminhoCompleto)) {
    try {
        // Tenta apagar a foto antiga para não encher o servidor
        $stmtOld = $pdo->prepare("SELECT foto_perfil FROM usuarios WHERE id = ?");
        $stmtOld->execute([$id]);
        $oldFoto = $stmtOld->fetchColumn();
        if ($oldFoto && file_exists(__DIR__ . '/../' . $oldFoto)) {
            unlink(__DIR__ . '/../' . $oldFoto);
        }

        // Atualiza com a nova foto
        $stmt = $pdo->prepare("UPDATE usuarios SET foto_perfil = ? WHERE id = ?");
        $stmt->execute([$caminhoRelativo, $id]);
        
        // Atualiza a sessão
        $_SESSION['user_foto'] = $caminhoRelativo;
        
        echo json_encode(['success' => true, 'message' => 'Foto de perfil atualizada!', 'caminho' => $caminhoRelativo]);
    } catch (PDOException $e) {
        // Se der erro no banco, apaga o arquivo que subiu
        unlink($caminhoCompleto);
        echo json_encode(['success' => false, 'message' => 'Erro ao atualizar banco de dados.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Erro ao salvar o arquivo no servidor.']);
}
?>