<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexao.php';

// Inicia sessão se necessário
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $senha = trim($_POST['senha'] ?? '');

    if (empty($email) || empty($senha)) {
        echo json_encode(['success' => false, 'message' => 'Preencha todos os campos.']);
        exit;
    }

    try {
        $api = new SupabaseAPI();
        
        // Busca o usuário pelo email
        $user = $api->selectOne('usuarios', ['email' => $email]);

        // Verifica se achou o usuário e se a senha confere
        // Nota: Se você não usa criptografia (password_hash), troque por: if ($user && $user['senha'] == $senha)
        if ($user && password_verify($senha, $user['senha'])) { 
            
            // Salva na sessão do PHP
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_nome'] = $user['nome'];
            $_SESSION['user_tipo'] = $user['tipo'];
            $_SESSION['user_slug'] = $user['slug'];
            $_SESSION['user_foto'] = $user['foto_perfil']; // <--- Importante salvar na sessão também

            // Retorna os dados para o JavaScript salvar no LocalStorage
            echo json_encode([
                'success' => true,
                'user_id' => $user['id'],
                'nome' => $user['nome'],
                'tipo' => $user['tipo'],
                'slug' => $user['slug'],
                'foto' => $user['foto_perfil'] // <--- AQUI ESTÁ A CORREÇÃO! (Antes devia estar faltando)
            ]);
        } else {
             echo json_encode(['success' => false, 'message' => 'Email ou senha incorretos.']);
        }

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Erro interno: ' . $e->getMessage()]);
    }
}
?>