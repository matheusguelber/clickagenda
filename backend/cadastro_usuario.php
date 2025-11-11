<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexao.php'; // Conexão PDO em $pdo

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $nome = trim($_POST['nome'] ?? '');
        $email = trim($_POST['email'] ?? '');
        $senha = $_POST['senha'] ?? '';
        $telefone = trim($_POST['telefone'] ?? '');
        
        // Esta é a parte nova:
        // Assume que este formulário regista SEMPRE um barbeiro.
        $tipo = 'barbeiro'; 

        if (!$nome || !$email || !$senha) {
            echo json_encode(['success' => false, 'message' => 'Campos obrigatórios ausentes.']);
            exit;
        }

        // Criptografa a senha (como já fazias, está perfeito)
        $senha_hash = password_hash($senha, PASSWORD_DEFAULT);

        // Atualiza o INSERT para a nova tabela 'usuarios'
        $stmt = $pdo->prepare("INSERT INTO usuarios (nome, email, senha, telefone, tipo) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$nome, $email, $senha_hash, $telefone, $tipo]);

        echo json_encode(['success' => true, 'message' => 'Barbeiro cadastrado com sucesso!']);
    
    } catch (PDOException $e) {
        http_response_code(500);
        // Verifica se é o erro de e-mail duplicado
        if ($e->errorInfo[1] == 1062) {
            echo json_encode(['success' => false, 'message' => 'Este e-mail já está em uso.']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro no banco de dados: ' . $e->getMessage()]);
        }
    }
}
?>