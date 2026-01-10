<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexao.php';

$barbeiro_id = $_GET['barbeiro_id'] ?? 0;
$data = $_GET['data'] ?? '';

if (!$barbeiro_id || !$data) {
    echo json_encode([]);
    exit;
}

try {
    // Instancia a API
    $api = new SupabaseAPI();

    // Busca agendamentos desse barbeiro nessa data
    // Trazemos 'hora' e 'status' para filtrar via PHP
    $agendamentos = $api->select(
        'agendamentos', 
        ['barbeiro_id' => $barbeiro_id, 'data' => $data], 
        'hora, status'
    );

    $ocupados = [];

    if (is_array($agendamentos)) {
        foreach ($agendamentos as $ag) {
            // Ignora se estiver cancelado
            if (isset($ag['status']) && $ag['status'] === 'cancelado') {
                continue;
            }
            
            // Se tiver hora, formata e adiciona na lista
            if (isset($ag['hora'])) {
                $ocupados[] = substr($ag['hora'], 0, 5); // Pega HH:MM
            }
        }
    }

    echo json_encode($ocupados);

} catch (Exception $e) {
    // Retorna array vazio em caso de erro para não travar o front
    echo json_encode([]);
}
?>