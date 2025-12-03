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

        // Procura o usuário pelo e-mail informado
        $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE email = ?");
        $stmt->execute([$email]);
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

        // Confere se a senha está correta
        if ($usuario && password_verify($senha, $usuario['senha'])) {
            
            // Guarda os dados do usuário na sessão
            $_SESSION['user_id'] = $usuario['id'];
            $_SESSION['user_tipo'] = $usuario['tipo'];
            $_SESSION['user_nome'] = $usuario['nome'];
            $_SESSION['user_slug'] = $usuario['slug'];
            $_SESSION['user_foto'] = $usuario['foto_perfil']; // Salva foto na sessão

            // Envia resposta em JSON para o frontend
            echo json_encode([
                 'success' => true, 
                 'message' => 'Login realizado com sucesso!',
                 'tipo' => $usuario['tipo'],        // CORRIGIDO: $usuario
                 'slug' => $usuario['slug'],        // CORRIGIDO: $usuario
                 'user_id' => $usuario['id'],       // CORRIGIDO: $usuario
                 'nome' => $usuario['nome'],        // CORRIGIDO: $usuario
                 'foto' => $usuario['foto_perfil']  // CORRIGIDO: $usuario
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