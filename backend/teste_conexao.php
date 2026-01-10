<?php
// ===== TESTE DE CONEXÃO SUPABASE =====
// Acesse: http://localhost/clickagenda/backend/teste_conexao.php

header('Content-Type: application/json; charset=utf-8');

// Configurações
$host = 'db.ssaepcempokkrrmvzqgp.supabase.co';
$port = 5432;
$db   = 'postgres';
$user = 'postgres';
$pass = 'caZoQBKFdVfGjPpk';

echo json_encode(['step' => 'Iniciando teste de conexão...']) . "\n";

try {
    // Tenta conectar
    $dsn = "pgsql:host={$host};port={$port};dbname={$db}";
    
    echo json_encode(['step' => 'DSN montado', 'dsn' => $dsn]) . "\n";
    
    $pdo = new PDO(
        $dsn,
        $user,
        $pass,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_TIMEOUT => 10
        ]
    );
    
    echo json_encode(['step' => '✅ CONEXÃO ESTABELECIDA!']) . "\n";
    
    // Testa uma query simples
    $stmt = $pdo->query("SELECT version()");
    $version = $stmt->fetch();
    
    echo json_encode([
        'success' => true,
        'message' => 'Conectado com sucesso ao Supabase!',
        'database_version' => $version['version']
    ]) . "\n";
    
    // Testa se as tabelas existem
    $stmt = $pdo->query("
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
    ");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    echo json_encode([
        'tables_found' => count($tables),
        'tables' => $tables
    ]) . "\n";
    
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'code' => $e->getCode(),
        'error_info' => $e->errorInfo
    ]) . "\n";
}
?>