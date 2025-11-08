<?php
header('Content-Type: application/json; charset=utf-8');
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Inclui a conexão com o banco de dados
require_once __DIR__ . '/conexao.php'; // Garante que $pdo esteja disponível

// Inicia a sessão para armazenar dados do usuário se o login for bem-sucedido
session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $email = trim($_POST['email'] ?? '');
        $senha = $_POST['senha'] ?? '';

        if (!$email || !$senha) {
            echo json_encode(['success' => false, 'message' => 'E-mail e senha são obrigatórios.']);
            exit;
        }

        // 1. Encontrar o usuário pelo e-mail
        $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE email = ?");
        $stmt->execute([$email]);
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

        // 2. Verificar se o usuário existe
        if (!$usuario) {
            echo json_encode(['success' => false, 'message' => 'E-mail não encontrado.']);
            exit;
        }

        // 3. Verificar a senha
        // password_verify() compara a senha digitada ($senha) com o hash salvo no banco ($usuario['senha'])
        if (password_verify($senha, $usuario['senha'])) {
            
            // Senha correta!
            
            // Armazena dados do usuário na sessão (para uso futuro)
            $_SESSION['user_id'] = $usuario['id'];
            $_SESSION['user_nome'] = $usuario['nome'];
            $_SESSION['user_tipo'] = $usuario['tipo'];

            // Envia a resposta de sucesso para o JavaScript
            echo json_encode([
                'success' => true, 
                'message' => 'Login realizado com sucesso!',
                'user_id' => $usuario['id'], // Envia dados de volta para o main.js
                'tipo' => $usuario['tipo']
            ]);

        } else {
            // Senha incorreta
            echo json_encode(['success' => false, 'message' => 'Senha incorreta.']);
        }

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Erro no banco de dados: ' . $e->getMessage()]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Erro geral: ' . $e->getMessage()]);
    }
}
?>