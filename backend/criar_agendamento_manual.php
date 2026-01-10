<?php
header('Content-Type: application/json; charset=utf-8');
require_once 'conexao.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Não autorizado']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $barbeiro_id = $_SESSION['user_id'];
    $servico_id = $_POST['servico_id'];
    $cliente_nome = $_POST['cliente_nome'];
    $cliente_telefone = $_POST['cliente_telefone'];
    $data = $_POST['data'];
    $hora = $_POST['hora'];
    $observacoes = $_POST['observacoes'] ?? '';

    try {
        $supabase = new SupabaseAPI();

        // 1. Verifica se o horário está livre (status != cancelado)
        // Como a API básica só tem filtro 'eq' (igual), buscamos pelo horário exato
        $conflitos = $supabase->select('agendamentos', [
            'barbeiro_id' => $barbeiro_id,
            'data' => $data,
            'hora' => $hora
        ]);

        $ocupado = false;
        foreach ($conflitos as $ag) {
            if ($ag['status'] !== 'cancelado') {
                $ocupado = true;
                break;
            }
        }

        if ($ocupado) {
            echo json_encode(['success' => false, 'message' => 'Horário já ocupado.']);
            exit;
        }

        // 2. Insere o agendamento
        $dados = [
            'barbeiro_id' => $barbeiro_id,
            'servico_id' => $servico_id,
            'cliente_nome' => $cliente_nome,
            'cliente_telefone' => $cliente_telefone,
            'data' => $data,
            'hora' => $hora,
            'observacoes' => $observacoes,
            'status' => 'confirmado' // Agendamento manual já entra confirmado
        ];

        $supabase->insert('agendamentos', $dados);

        echo json_encode(['success' => true, 'message' => 'Agendamento criado com sucesso!']);

    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}
?>