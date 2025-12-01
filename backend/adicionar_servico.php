<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexao.php'; // Conexão PDO em $pdo

// Inicia a sessão para saber QUEM está logado
session_start();

// Segurança: Verifica se o usuário está logado
if (!isset($_SESSION['user_id']) || $_SESSION['user_tipo'] != 'barbeiro') {
    http_response_code(403); // Proibido
    echo json_encode(['success' => false, 'message' => 'Acesso não autorizado.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Pega o ID do barbeiro que está logado
        $barbeiro_id = $_SESSION['user_id'];
        
        // Pega os dados do formulário
        $nome_servico = trim($_POST['nome_servico'] ?? '');
        $preco = $_POST['preco'] ?? 0;
        $duracao = $_POST['duracao'] ?? 0;

        if (!$nome_servico || $preco <= 0 || $duracao <= 0) {
            echo json_encode(['success' => false, 'message' => 'Todos os campos são obrigatórios.']);
            exit;
        }

        // Insere o serviço na tabela 'servicos', ligando-o ao barbeiro
        $stmt = $pdo->prepare(
            "INSERT INTO servicos (barbeiro_id, nome_servico, preco, duracao_minutos) 
             VALUES (?, ?, ?, ?)"
        );
        $stmt->execute([$barbeiro_id, $nome_servico, $preco, $duracao]);

        echo json_encode(['success' => true, 'message' => 'Serviço adicionado com sucesso!']);
    
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Erro no banco de dados: ' . $e->getMessage()]);
    }
}
?>