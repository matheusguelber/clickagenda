<?php
header('Content-Type: application/json; charset=utf-8');
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/conexao.php'; // conexão PDO em $pdo

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $nome = trim($_POST['nome'] ?? '');
        $email = trim($_POST['email'] ?? '');
        $senha = $_POST['senha'] ?? '';
        $telefone = trim($_POST['telefone'] ?? '');
        $tipo = $_POST['tipo'] ?? 'barbeiro'; // padrão

        if (!$nome || !$email || !$senha) {
            echo json_encode(['success' => false, 'message' => 'Campos obrigatórios ausentes.']);
            exit;
        }

        $senha_hash = password_hash($senha, PASSWORD_DEFAULT);

        $stmt = $pdo->prepare("INSERT INTO usuarios (nome, email, senha, tipo, telefone) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$nome, $email, $senha_hash, $tipo, $telefone]);

        echo json_encode(['success' => true, 'message' => 'Usuário cadastrado com sucesso!']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Erro no banco de dados: ' . $e->getMessage()]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Erro geral: ' . $e->getMessage()]);
    }
}
?>
