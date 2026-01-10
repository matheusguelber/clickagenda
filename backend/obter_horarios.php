<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/SupabaseAPI.php';

$barbeiro_id = isset($_GET['barbeiro_id']) ? intval($_GET['barbeiro_id']) : 0; 
$data_solicitada = $_GET['data'] ?? ''; 

if ($barbeiro_id === 0 || empty($data_solicitada)) {
    echo json_encode(['sucesso' => false, 'mensagem' => 'Dados incompletos.']);
    exit;
}

$dia_semana = date('w', strtotime($data_solicitada));

try {
    $supabase = new SupabaseAPI();
    
    // Busca a configuração para o dia da semana específico
    $filtros = [
        'dia_semana' => $dia_semana,
        'barbeiro_id' => $barbeiro_id
    ];
    
    $resultado = $supabase->select('configuracao_horarios', $filtros);
    $linha = $resultado[0] ?? null;

    if ($linha) {
        echo json_encode([
            'sucesso' => true,
            'aberto' => (int)$linha['aberto'],
            'hora_inicio' => $linha['hora_inicio'],
            'hora_fim' => $linha['hora_fim']
        ]);
    } else {
        echo json_encode(['sucesso' => false, 'aberto' => 0, 'mensagem' => 'Não configurado']);
    }
} catch (Exception $e) {
    echo json_encode(['sucesso' => false, 'mensagem' => $e->getMessage()]);
}