<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/SupabaseAPI.php';
session_start();

if (!isset($_SESSION['user_id']) || $_SESSION['user_tipo'] != 'barbeiro') {
    echo json_encode(['total' => 0]);
    exit;
}

try {
    $supabase = new SupabaseAPI();
    $barbeiro_id = $_SESSION['user_id'];

    // Buscamos apenas os IDs dos agendamentos pendentes para contar
    $pendentes = $supabase->select('agendamentos', [
        'barbeiro_id' => $barbeiro_id,
        'status' => 'pendente'
    ], 'id');

    echo json_encode(['total' => count($pendentes)]);
} catch (Exception $e) {
    echo json_encode(['total' => 0]);
}