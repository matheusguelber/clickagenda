<?php
$host = 'localhost';
$db   = 'agendamento_barbeiro';
$user = 'root';
$pass = ''; // coloque a senha do seu MySQL, se houver

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Erro de conexão: ' . $e->getMessage()]);
    exit;
}
?>
