<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexao.php'; // Conexão PDO em $pdo

// 1. INICIA A SESSÃO
// Isto é o mais importante. É a "memória" do servidor.
session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $email = trim($_POST['email'] ?? '');
        $senha = $_POST['senha'] ?? '';

        if (!$email || !$senha) {
            echo json_encode(['success' => false, 'message' => 'E-mail e senha são obrigatórios.']);
            exit;
        }

        // Busca o usuário na nova tabela 'usuarios'
        $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE email = ?");
        $stmt->execute([$email]);
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

        // Verifica se o usuário existe E se a senha está correta
        if ($usuario && password_verify($senha, $usuario['senha'])) {
            
            // 2. GUARDA OS DADOS NA SESSÃO
            // Agora, o servidor "sabe" quem está logado.
            $_SESSION['user_id'] = $usuario['id'];
            $_SESSION['user_tipo'] = $usuario['tipo'];
            $_SESSION['user_nome'] = $usuario['nome'];

            // Envia a resposta de sucesso
            echo json_encode([
                'success' => true, 
                'message' => 'Login realizado com sucesso!',
                'tipo' => $usuario['tipo'] // O JS usa isto para saber qual dashboard mostrar
            ]);

        } else {
            echo json_encode(['success' => false, 'message' => 'E-mail ou senha incorretos.']);
        }

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Erro no banco de dados: ' . $e->getMessage()]);
    }
}
?>