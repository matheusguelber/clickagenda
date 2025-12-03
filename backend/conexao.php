<?php
// ===== LIMPA TUDO ANTES =====
@ob_end_clean();
@ob_start();

// ===== CONFIGURAÇÃO =====
$host = 'localhost';
$db   = 'clickagenda';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$db;charset=utf8mb4",
        $user,
        $pass,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
        ]
    );
} catch (PDOException $e) {
    // ===== NÃO FAZ NADA AQUI! =====
    // Deixa a resposta ser tratada pelo arquivo que incluiu conexao.php
    throw $e;
}
?>