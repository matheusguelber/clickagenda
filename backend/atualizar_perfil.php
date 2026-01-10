<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexao.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Não autorizado']);
    exit;
}

try {
    $api = new SupabaseAPI();
    $id = $_SESSION['user_id'];
    
    // Pega os dados enviados pelo formulário
    $nome = trim($_POST['nome'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $telefone = trim($_POST['telefone'] ?? '');

    if (empty($nome) || empty($email)) {
        echo json_encode(['success' => false, 'message' => 'Nome e Email são obrigatórios.']);
        exit;
    }

    // Monta os dados para atualizar
    $dadosAtualizar = [
        'nome' => $nome,
        'email' => $email,
        'telefone' => $telefone
    ];

    // Envia o UPDATE para o Supabase
    $api->update('usuarios', ['id' => $id], $dadosAtualizar);

    // Atualiza a sessão para o nome novo aparecer no topo do site sem precisar relogar
    $_SESSION['user_nome'] = $nome;

    echo json_encode(['success' => true, 'message' => 'Perfil atualizado com sucesso!']);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Erro ao atualizar: ' . $e->getMessage()]);
}
?>