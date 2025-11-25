<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexao.php';

$barbeiro_id = isset($_GET['barbeiro_id']) ? intval($_GET['barbeiro_id']) : 0; 
$data_solicitada = $_GET['data'] ?? ''; 

if ($barbeiro_id === 0 || empty($data_solicitada)) {
    // Se não passar dados, retornamos sucesso=false mas sem quebrar
    echo json_encode(['sucesso' => false, 'mensagem' => 'Dados incompletos.']);
    exit;
}

$dia_semana = date('w', strtotime($data_solicitada));

try {
    $stmt = $pdo->prepare("SELECT aberto, hora_inicio, hora_fim FROM configuracao_horarios WHERE dia_semana = ? AND barbeiro_id = ?");
    $stmt->execute([$dia_semana, $barbeiro_id]);
    $linha = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($linha) {
        echo json_encode([
            'sucesso' => true,
            'aberto' => (int)$linha['aberto'],
            'hora_inicio' => $linha['hora_inicio'],
            'hora_fim' => $linha['hora_fim']
        ]);
    } else {
        // Se não configurou, assumimos fechado ou um horário padrão (aqui assumi fechado para segurança)
        echo json_encode(['sucesso' => false, 'aberto' => 0, 'mensagem' => 'Não configurado']);
    }
} catch (PDOException $e) {
    echo json_encode(['sucesso' => false, 'mensagem' => 'Erro: ' . $e->getMessage()]);
}
?>