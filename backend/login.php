<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexao.php';

session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $email = trim($_POST['email'] ?? '');
        $senha = $_POST['senha'] ?? '';

        if (!$email || !$senha) {
            echo json_encode(['success' => false, 'message' => 'E-mail e senha são obrigatórios.']);
            exit;
        }

        $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE email = ?");
        $stmt->execute([$email]);
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($usuario && password_verify($senha, $usuario['senha'])) {
            
            $_SESSION['user_id'] = $usuario['id'];
            $_SESSION['user_tipo'] = $usuario['tipo'];
            $_SESSION['user_nome'] = $usuario['nome'];
            $_SESSION['user_slug'] = $usuario['slug'];

            echo json_encode([
                 'success' => true, 
                 'message' => 'Login realizado com sucesso!',
                 'tipo' => $usuario['tipo'],
                 'slug' => $usuario['slug'],
                 'user_id' => $usuario['id'],
                 'nome' => $usuario['nome']
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