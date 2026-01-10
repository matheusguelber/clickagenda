<?php
header('Content-Type: application/json; charset=utf-8');
require_once 'conexao.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode([]);
    exit;
}

try {
    $supabase = new SupabaseAPI();
    $barbeiro_id = $_SESSION['user_id'];

    // Busca agendamentos pendentes
    $agendamentos = $supabase->select('agendamentos', [
        'barbeiro_id' => $barbeiro_id,
        'status' => 'pendente'
    ]);
    
    // Para pegar os nomes dos serviços, precisamos fazer uma segunda busca
    // (Simulando JOIN no PHP)
    $servicos = $supabase->select('servicos', ['barbeiro_id' => $barbeiro_id]);
    $mapaServicos = array_column($servicos, 'nome_servico', 'id');

    $resultado = [];
    foreach ($agendamentos as $ag) {
        $resultado[] = [
            'id' => $ag['id'],
            'cliente_nome' => $ag['cliente_nome'],
            'data_formatada' => date('d/m', strtotime($ag['data'])),
            'hora_formatada' => substr($ag['hora'], 0, 5),
            'servico_nome' => $mapaServicos[$ag['servico_id']] ?? 'Serviço removido'
        ];
    }

    echo json_encode($resultado);

} catch (Exception $e) {
    echo json_encode([]);
}
?>