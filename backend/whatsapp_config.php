<?php
// ========================================
// WhatsApp Config - Multi-Método (QR + Código)
// ========================================

header('Content-Type: application/json');
require_once 'conexao.php';
session_start();

// 🔥 IP CORRETO da VM WhatsApp
define('WHATSAPP_SERVER', 'http://168.138.133.246:3000');

/**
 * Pega o ID do barbeiro da sessão ou do request
 */
function getBarbeiroId() {
    if (isset($_POST['barbeiro_id'])) {
        return intval($_POST['barbeiro_id']);
    }
    
    if (isset($_GET['barbeiro_id'])) {
        return intval($_GET['barbeiro_id']);
    }
    
    if (isset($_SESSION['user_id'])) {
        return intval($_SESSION['user_id']);
    }
    
    return null;
}

/**
 * Faz requisição para o servidor Node.js WhatsApp
 */
function fazerRequisicao($endpoint, $metodo = 'GET', $dados = null, $timeout = 30) {
    $url = WHATSAPP_SERVER . $endpoint;
    $ch = curl_init($url);
    
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
    
    if ($metodo === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        if ($dados) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($dados));
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        }
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($error) {
        return [
            'success' => false, 
            'message' => 'Erro de conexão: ' . $error
        ];
    }
    
    if ($httpCode !== 200) {
        return [
            'success' => false, 
            'message' => 'Servidor retornou código: ' . $httpCode
        ];
    }
    
    $result = json_decode($response, true);
    return $result ?? [
        'success' => false, 
        'message' => 'Resposta inválida do servidor'
    ];
}

// ========================================
// ROTAS DA API
// ========================================

// 🔥 STATUS (GET)
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'status') {
    $barbeiroId = getBarbeiroId();
    
    if (!$barbeiroId) {
        echo json_encode([
            'success' => false,
            'connected' => false,
            'status' => 'no_session',
            'message' => 'Faça login primeiro'
        ]);
        exit;
    }
    
    $result = fazerRequisicao("/status/{$barbeiroId}");
    echo json_encode($result);
    exit;
}

// 🔥 CONECTAR (POST) - SUPORTA QR E CÓDIGO
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'connect') {
    $barbeiroId = getBarbeiroId();
    $metodo = $_POST['metodo'] ?? 'qr'; // 'qr' ou 'code'
    $telefone = $_POST['telefone'] ?? null;
    
    if (!$barbeiroId) {
        echo json_encode([
            'success' => false,
            'message' => 'ID do barbeiro não encontrado. Faça login novamente.'
        ]);
        exit;
    }
    
    // Valida telefone se for método code
    if ($metodo === 'code' && empty($telefone)) {
        echo json_encode([
            'success' => false,
            'message' => 'Número de telefone é obrigatório para método código'
        ]);
        exit;
    }
    
    // Prepara dados da requisição
    $dados = ['metodo' => $metodo];
    if ($metodo === 'code') {
        $dados['telefone'] = $telefone;
    }
    
    $result = fazerRequisicao("/connect/{$barbeiroId}", 'POST', $dados, 60);
    echo json_encode($result);
    exit;
}

// 🔥 DESCONECTAR (POST)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'disconnect') {
    $barbeiroId = getBarbeiroId();
    
    if (!$barbeiroId) {
        echo json_encode([
            'success' => false,
            'message' => 'ID do barbeiro não encontrado'
        ]);
        exit;
    }
    
    $result = fazerRequisicao("/disconnect/{$barbeiroId}", 'POST');
    echo json_encode($result);
    exit;
}

// 🔥 RESETAR (POST)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'reset') {
    $barbeiroId = getBarbeiroId();
    
    if (!$barbeiroId) {
        echo json_encode([
            'success' => false,
            'message' => 'ID do barbeiro não encontrado'
        ]);
        exit;
    }
    
    $result = fazerRequisicao("/reset/{$barbeiroId}", 'POST');
    echo json_encode($result);
    exit;
}

// 🔥 ENVIAR MENSAGEM (POST)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'send') {
    $barbeiroId = getBarbeiroId();
    $telefone = $_POST['telefone'] ?? '';
    $mensagem = $_POST['mensagem'] ?? '';
    
    if (!$barbeiroId) {
        echo json_encode([
            'success' => false,
            'message' => 'ID do barbeiro não encontrado'
        ]);
        exit;
    }
    
    if (empty($telefone) || empty($mensagem)) {
        echo json_encode([
            'success' => false, 
            'message' => 'Telefone e mensagem são obrigatórios'
        ]);
        exit;
    }
    
    $result = fazerRequisicao("/send/{$barbeiroId}", 'POST', [
        'telefone' => $telefone,
        'mensagem' => $mensagem
    ]);
    
    echo json_encode($result);
    exit;
}

// Ação inválida
echo json_encode([
    'success' => false, 
    'message' => 'Ação inválida ou método não permitido'
]);
?>