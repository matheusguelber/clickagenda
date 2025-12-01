<?php
// backend/listar_notificacoes.php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexao.php';
session_start();

// 1. Segurança: Apenas barbeiro logado pode ver
if (!isset($_SESSION['user_id']) || $_SESSION['user_tipo'] != 'barbeiro') {
    echo json_encode(['success' => false, 'notificacoes' => []]);
    exit;
}

$barbeiro_id = $_SESSION['user_id'];

try {
    // 2. Busca agendamentos PENDENTES com detalhes
    $stmt = $pdo->prepare("
        SELECT 
            a.id, 
            a.cliente_nome, 
            a.data, 
            a.hora, 
            s.nome_servico 
        FROM agendamentos a
        JOIN servicos s ON a.servico_id = s.id
        WHERE a.barbeiro_id = ? AND a.status = 'pendente'
        ORDER BY a.data ASC, a.hora ASC
        LIMIT 10
    ");
    $stmt->execute([$barbeiro_id]);
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 3. Formata datas para ficar amigável (Ex: "Hoje", "Amanhã" ou "25/11")
    foreach ($result as &$row) {
        $dataObj = new DateTime($row['data']);
        $hoje = new DateTime();
        $amanha = new DateTime('+1 day');
        
        if ($dataObj->format('Y-m-d') == $hoje->format('Y-m-d')) {
            $row['data_formatada'] = 'Hoje';
        } elseif ($dataObj->format('Y-m-d') == $amanha->format('Y-m-d')) {
            $row['data_formatada'] = 'Amanhã';
        } else {
            $row['data_formatada'] = $dataObj->format('d/m');
        }
        
        $row['hora_formatada'] = substr($row['hora'], 0, 5);
    }

    echo json_encode(['success' => true, 'notificacoes' => $result]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>