<?php
header('Content-Type: application/json; charset=utf-8');
require_once 'conexao.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Não autorizado']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'];
    $servico_id = $_POST['servico_id'];
    $data = $_POST['data'];
    $hora = $_POST['hora'];
    $observacoes = $_POST['observacoes'];
    $barbeiro_id = $_SESSION['user_id'];

    try {
        $supabase = new SupabaseAPI();
        
        $supabase->update('agendamentos', 
            ['id' => $id, 'barbeiro_id' => $barbeiro_id],
            [
                'servico_id' => $servico_id,
                'data' => $data,
                'hora' => $hora,
                'observacoes' => $observacoes
            ]
        );

        echo json_encode(['success' => true, 'message' => 'Agendamento editado com sucesso!']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Erro ao atualizar.']);
    }
}
?>