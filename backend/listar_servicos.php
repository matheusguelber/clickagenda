<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/SupabaseAPI.php';
session_start();

// Verifica se o barbeiro está logado
if (!isset($_SESSION['user_id']) || $_SESSION['user_tipo'] != 'barbeiro') {
    echo json_encode(['success' => false, 'message' => 'Acesso não autorizado.']);
    exit;
}

try {
    $supabase = new SupabaseAPI();
    $barbeiro_id = $_SESSION['user_id'];
    
    // Busca os serviços do barbeiro logado
    // Note que usamos 'duracao' (nome novo da coluna)
    $servicos = $supabase->select('servicos', ['barbeiro_id' => $barbeiro_id], 'id,nome_servico,preco,duracao');

    // Se o retorno for nulo, retornamos um array vazio
    if (!$servicos) {
        $servicos = [];
    }

    echo json_encode(['success' => true, 'servicos' => $servicos]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
}