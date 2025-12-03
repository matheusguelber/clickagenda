<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexao.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $nome = trim($_POST['nome'] ?? '');
        $email = trim($_POST['email'] ?? '');
        $senha = $_POST['senha'] ?? '';
        $telefone = trim($_POST['telefone'] ?? '');
        $tipo = 'barbeiro'; 

        if (!$nome || !$email || !$senha) {
            echo json_encode(['success' => false, 'message' => 'Campos obrigatórios ausentes.']);
            exit;
        }

        // Cria um identificador único para a barbearia
        $slug_base = strtolower(preg_replace('/[^a-z0-9]+/i', '-', $nome));
        $slug_base = trim($slug_base, '-');
        
        // Se já existir, coloca um número no final para não repetir
        $slug = $slug_base;
        $contador = 1;
        
        while (true) {
            $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE slug = ?");
            $stmt->execute([$slug]);
            if ($stmt->rowCount() == 0) {
                break;
            }
            $slug = $slug_base . '-' . $contador;
            $contador++;
        }

        $senha_hash = password_hash($senha, PASSWORD_DEFAULT);

        $stmt = $pdo->prepare("INSERT INTO usuarios (nome, email, slug, senha, telefone, tipo) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$nome, $email, $slug, $senha_hash, $telefone, $tipo]);

        echo json_encode(['success' => true, 'message' => 'Barbeiro cadastrado com sucesso!']);
    
    } catch (PDOException $e) {
        http_response_code(500);
        if ($e->errorInfo[1] == 1062) {
            echo json_encode(['success' => false, 'message' => 'Este e-mail já está em uso.']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro no banco de dados: ' . $e->getMessage()]);
        }
    }
}
?>