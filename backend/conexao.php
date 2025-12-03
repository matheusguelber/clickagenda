<?php
$host = 'localhost';
$db   = 'clickagenda';
$user = 'root';
$pass = ''; // Se seu MySQL tiver senha, coloque aqui

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Erro de conexão: ' . $e->getMessage()]);
    exit;
}
?>
