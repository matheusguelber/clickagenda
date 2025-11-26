<?php
// backend/whatsapp_config.php
header('Content-Type: application/json');
require_once 'conexao.php';

define('WHATSAPP_SERVER', 'http://localhost:3000');

function fazerRequisicao($endpoint, $metodo = 'GET', $dados = null) {
    $url = WHATSAPP_SERVER . $endpoint;
    $ch = curl_init($url);
    
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    if ($metodo === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        if ($dados) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($dados));
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        }
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode !== 200) {
        return ['success' => false, 'message' => 'Erro ao conectar com servidor WhatsApp'];
    }
    
    return json_decode($response, true);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'status') {
    $result = fazerRequisicao('/status');
    echo json_encode($result);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'connect') {
    $result = fazerRequisicao('/connect', 'POST');
    echo json_encode($result);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'disconnect') {
    $result = fazerRequisicao('/disconnect', 'POST');
    echo json_encode($result);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'send') {
    $telefone = $_POST['telefone'] ?? '';
    $mensagem = $_POST['mensagem'] ?? '';
    
    if (empty($telefone) || empty($mensagem)) {
        echo json_encode(['success' => false, 'message' => 'Telefone e mensagem são obrigatórios']);
        exit;
    }
    
    $result = fazerRequisicao('/send', 'POST', [
        'telefone' => $telefone,
        'mensagem' => $mensagem
    ]);
    
    echo json_encode($result);
    exit;
}

echo json_encode(['success' => false, 'message' => 'Ação inválida']);
?>