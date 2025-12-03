<?php
require 'config.php';

$user_id = $_GET['user_id'];  // ID do usuário que está logado
$tipo = $_GET['tipo'];  // Pode ser 'barbeiro' ou 'cliente'

if ($tipo === 'barbeiro') {
    $stmt = $pdo->prepare("SELECT a.*, u.nome AS cliente_nome, s.nome AS servico_nome FROM agendamentos a JOIN usuarios u ON a.cliente_id = u.id JOIN servicos s ON a.servico_id = s.id WHERE a.barbeiro_id = ?");
} else {
    $stmt = $pdo->prepare("SELECT a.*, u.nome AS barbeiro_nome, s.nome AS servico_nome FROM agendamentos a JOIN usuarios u ON a.barbeiro_id = u.id JOIN servicos s ON a.servico_id = s.id WHERE a.cliente_id = ?");
}

$stmt->execute([$user_id]);
$agendamentos = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($agendamentos);
?>