<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexao.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Não logado']);
    exit;
}

try {
    $api = new SupabaseAPI();
    $id = $_SESSION['user_id'];

    // Busca os dados do usuário no Supabase
    $usuario = $api->selectOne('usuarios', ['id' => $id]);

    if ($usuario) {
        echo json_encode([
            'success' => true,
            'dados' => [
                'nome' => $usuario['nome'],
                'email' => $usuario['email'],
                'telefone' => $usuario['telefone'] ?? '' // Usa vazio se não tiver telefone
            ]
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Usuário não encontrado']);
    }

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Erro ao buscar perfil: ' . $e->getMessage()]);
}
?>