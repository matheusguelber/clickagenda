<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/SupabaseAPI.php';
session_start();

if (!isset($_SESSION['user_id']) || $_SESSION['user_tipo'] != 'barbeiro') {
    exit(json_encode(['success' => false, 'message' => 'Não autorizado']));
}

$barbeiro_id = $_SESSION['user_id'];
$supabase = new SupabaseAPI();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $horarios = json_decode($_POST['horarios'] ?? '[]', true);

    try {
        foreach ($horarios as $dia) {
            $dia_semana = intval($dia['dia_semana']);
            $dados = [
                'barbeiro_id' => $barbeiro_id,
                'dia_semana'  => $dia_semana,
                'hora_inicio' => $dia['hora_inicio'] ?: '09:00:00',
                'hora_fim'    => $dia['hora_fim'] ?: '18:00:00',
                'aberto'      => $dia['aberto'] ? true : false
            ];

            // Verifica se já existe para atualizar ou inserir
            $existe = $supabase->select('configuracao_horarios', [
                'barbeiro_id' => $barbeiro_id,
                'dia_semana' => $dia_semana
            ]);

            if ($existe) {
                $supabase->update('configuracao_horarios', ['id' => $existe[0]['id']], $dados);
            } else {
                $supabase->insert('configuracao_horarios', $dados);
            }
        }
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
} else {
    // Carregamento (GET)
    $dados = $supabase->select('configuracao_horarios', ['barbeiro_id' => $barbeiro_id]);
    echo json_encode(['success' => true, 'dados' => $dados]);
}