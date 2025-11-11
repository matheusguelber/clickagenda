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

try {
    // Pega o ID do barbeiro que está logado
    $barbeiro_id = $_SESSION['user_id'];
    
    // Busca todos os serviços que pertencem a ESSE barbeiro
    $stmt = $pdo->prepare("SELECT nome_servico, preco, duracao_minutos FROM servicos WHERE barbeiro_id = ? ORDER BY nome_servico");
    $stmt->execute([$barbeiro_id]);
    
    $servicos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Envia a lista de serviços de volta como JSON
    echo json_encode(['success' => true, 'servicos' => $servicos]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro no banco de dados: ' . $e->getMessage()]);
}
?>