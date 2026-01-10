<?php
header('Content-Type: application/json; charset=utf-8');
require_once 'conexao.php';

$barbeiro_id = isset($_GET['barbeiro_id']) ? intval($_GET['barbeiro_id']) : 0;

if ($barbeiro_id === 0) {
    echo json_encode([]);
    exit;
}

try {
    $supabase = new SupabaseAPI();
    $servicos = $supabase->select('servicos', ['barbeiro_id' => $barbeiro_id]);
    
    // Ordenar por preço (opcional, feito via PHP)
    usort($servicos, function($a, $b) {
        return $a['preco'] <=> $b['preco'];
    });

    echo json_encode($servicos);
} catch (Exception $e) {
    echo json_encode([]);
}
?>