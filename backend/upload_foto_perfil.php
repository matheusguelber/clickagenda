<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexao.php';

// Fix do Notice de sessão
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

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

// Valida o tipo e o tamanho
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

// === UPLOAD LOCAL (XAMPP) ===
// Cria pasta se não existir
$pastaUploads = __DIR__ . '/../uploads/perfis/';
if (!is_dir($pastaUploads)) {
    mkdir($pastaUploads, 0755, true);
}

// Define nome único
$novoNome = 'perfil_' . $id . '_' . time() . '.' . $extensao;
$caminhoCompleto = $pastaUploads . $novoNome;
$caminhoRelativo = 'uploads/perfis/' . $novoNome; // O que vai para o banco

if (move_uploaded_file($arquivo['tmp_name'], $caminhoCompleto)) {
    try {
        // === MUDANÇA AQUI: USAR API DO SUPABASE ===
        $api = new SupabaseAPI();

        // 1. Busca foto antiga para apagar do computador (opcional, mas bom para limpeza)
        $usuarioAntigo = $api->selectOne('usuarios', ['id' => $id]);
        $oldFoto = $usuarioAntigo['foto_perfil'] ?? null;

        if ($oldFoto && file_exists(__DIR__ . '/../' . $oldFoto)) {
            // Tenta apagar a antiga, mas ignora erro se falhar
            @unlink(__DIR__ . '/../' . $oldFoto);
        }

        // 2. Salva o caminho da nova foto no Supabase
        $api->update('usuarios', ['id' => $id], ['foto_perfil' => $caminhoRelativo]);
        
        // 3. Atualiza a sessão
        $_SESSION['user_foto'] = $caminhoRelativo;
        
        echo json_encode([
            'success' => true, 
            'message' => 'Foto de perfil atualizada!', 
            'caminho' => $caminhoRelativo
        ]);

    } catch (Exception $e) {
        // Se der erro no banco, apaga a imagem que acabamos de subir para não ficar lixo
        @unlink($caminhoCompleto);
        echo json_encode(['success' => false, 'message' => 'Erro ao salvar no banco: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Erro ao salvar o arquivo no servidor.']);
}
?>