<?php
header('Content-Type: application/json; charset=utf-8');
require_once 'conexao.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Não autorizado']);
    exit;
}

$id = $_SESSION['user_id'];
$senha_atual = $_POST['senha_atual'];
$nova_senha = $_POST['nova_senha'];

try {
    $supabase = new SupabaseAPI();
    
    // Busca a senha atual (hash)
    $user = $supabase->selectOne('usuarios', ['id' => $id], 'senha');

    if ($user && password_verify($senha_atual, $user['senha'])) {
        $novaHash = password_hash($nova_senha, PASSWORD_DEFAULT);
        
        $supabase->update('usuarios', ['id' => $id], ['senha' => $novaHash]);
        
        echo json_encode(['success' => true, 'message' => 'Senha alterada com sucesso!']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Senha atual incorreta.']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Erro ao alterar senha.']);
}
?>