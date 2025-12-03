<?php
// Configuração do WhatsApp - Suporte para QR Code e Código

header('Content-Type: application/json');
require_once 'conexao.php';
session_start();

// Endereço do servidor Node do WhatsApp
define('WHATSAPP_SERVER', 'http://168.138.133.246:3000');

function getBarbeiroId() {
    if (isset($_POST['barbeiro_id'])) return intval($_POST['barbeiro_id']);
    if (isset($_GET['barbeiro_id'])) return intval($_GET['barbeiro_id']);
    if (isset($_SESSION['user_id'])) return intval($_SESSION['user_id']);
    return null;
}

function fazerRequisicao($endpoint, $metodo = 'GET', $dados = null, $timeout = 30) {
    $url = WHATSAPP_SERVER . $endpoint;
    $ch = curl_init($url);
    
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
    
    if ($metodo === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        if ($dados) {
            // Envia o método e telefone como JSON para o Node
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($dados));
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        }
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($error) return ['success' => false, 'message' => 'Erro Curl: ' . $error];
    
    $result = json_decode($response, true);
    return $result ?? ['success' => false, 'message' => 'Erro JSON do Node'];
}

// Rotas da API do WhatsApp

// STATUS
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'status') {
    $barbeiroId = getBarbeiroId();
    if (!$barbeiroId) { echo json_encode(['success'=>false, 'status'=>'no_session']); exit; }
    echo json_encode(fazerRequisicao("/status/{$barbeiroId}"));
    exit;
}

// CONECTAR (QR ou CODE)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'connect') {
    $barbeiroId = getBarbeiroId();
    $metodo = $_POST['metodo'] ?? 'qr'; // Pega o mÃ©todo enviado pelo JS
    $telefone = $_POST['telefone'] ?? null;
    
    if (!$barbeiroId) { echo json_encode(['success'=>false, 'message'=>'Sem ID']); exit; }
    
    // Monta os dados para o Node
    $dados = ['metodo' => $metodo];
    if ($metodo === 'code') {
        $dados['telefone'] = $telefone;
    }
    
    // Envia para o Node
    echo json_encode(fazerRequisicao("/connect/{$barbeiroId}", 'POST', $dados, 60));
    exit;
}

// OUTRAS ROTAS (Disconnect, Reset, Send) - Mantidas simples para economizar espaÃ§o
if (isset($_POST['action']) && $_POST['action'] === 'disconnect') {
    echo json_encode(fazerRequisicao("/disconnect/" . getBarbeiroId(), 'POST')); exit;
}
if (isset($_POST['action']) && $_POST['action'] === 'reset') {
    echo json_encode(fazerRequisicao("/reset/" . getBarbeiroId(), 'POST')); exit;
}
if (isset($_POST['action']) && $_POST['action'] === 'send') {
    echo json_encode(fazerRequisicao("/send/" . getBarbeiroId(), 'POST', [
        'telefone' => $_POST['telefone'], 'mensagem' => $_POST['mensagem']
    ])); exit;
}
?>