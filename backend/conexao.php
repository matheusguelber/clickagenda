<?php
// conexao.php - Agora atua como centralizador da API
require_once __DIR__ . '/SupabaseAPI.php';

// Inicia sessão se não estiver iniciada
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Timezone
date_default_timezone_set('America/Sao_Paulo');
?>