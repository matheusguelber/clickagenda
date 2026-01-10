<?php
header('Content-Type: application/json; charset=utf-8');
require_once 'conexao.php';

$email = $_POST['email'] ?? '';

if (empty($email)) {
    echo json_encode(['success' => false, 'message' => 'Informe o e-mail.']);
    exit;
}

try {
    $supabase = new SupabaseAPI();
    
    // Verifica se usuário existe
    $user = $supabase->selectOne('usuarios', ['email' => $email], 'id');

    if ($user) {
        $token = bin2hex(random_bytes(16));
        $expira = date('Y-m-d H:i:s', strtotime('+1 hour'));

        // Salva token na tabela (Assumindo tabela 'recuperacao_senha' ou similar)
        // Se a tabela não existir no seu Supabase, crie: id, usuario_id, token, expira
        
        // Exemplo simples salvando token (ajuste conforme sua tabela no Supabase)
        // $supabase->insert('recuperacao_senha', [
        //     'usuario_id' => $user['id'],
        //     'token' => $token,
        //     'expira' => $expira
        // ]);

        // Como não temos SMTP configurado aqui, retornamos sucesso simulado
        echo json_encode(['success' => true, 'message' => 'Se o e-mail existir, você receberá um link.']);
    } else {
        // Por segurança, não dizemos que o e-mail não existe
        echo json_encode(['success' => true, 'message' => 'Se o e-mail existir, você receberá um link.']);
    }

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Erro interno.']);
}
?>