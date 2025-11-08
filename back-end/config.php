<?php
$host = 'localhost';
$dbname = 'agendamento_barbeiro';
$username = 'root';  // ou o usuário que você usa no phpMyAdmin
$password = '';      // ou a senha que você usa no phpMyAdmin

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "✅ Conexão bem-sucedida!";
} catch (PDOException $e) {
    die("❌ Erro na conexão: " . $e->getMessage());
}
?>