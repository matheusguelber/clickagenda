<?php
// ========================================
// WhatsApp Config - Multi-Sessгo COMPLETO
// ========================================

header('Content-Type: application/json');
require_once 'conexao.php';
session_start();

// ?? IP CORRETO da VM WhatsApp
define('WHATSAPP_SERVER', 'http://168.138.133.246:3000');

/**
 * Pega o ID do barbeiro da sessгo ou do request
 */
function getBarbeiroId() {
    // Tenta pegar do POST
    if (isset($_POST['barbeiro_id'])) {
        return intval($_POST['barbeiro_id']);
    }
    
    // Tenta pegar do GET
    if (isset($_GET['barbeiro_id'])) {
        return intval($_GET['barbeiro_id']);
    }
    
    // Tenta pegar da sessгo PHP
    if (isset($_SESSION['user_id'])) {
        return intval($_SESSION['user_id']);
    }
    
    return null;
}

/**
 * Faz requisiзгo para o servidor Node.js WhatsApp
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
            'message' => 'Erro de conexгo: ' . $error
        ];
    }
    
    if ($httpCode !== 200) {
        return [
            'success' => false, 
            'message' => 'Servidor retornou cуdigo: ' . $httpCode
        ];
    }
    
    $result = json_decode($response, true);
    return $result ?? [
        'success' => false, 
        'message' => 'Resposta invбlida do servidor'
    ];
}

// ========================================
// ROTAS DA API
// ========================================

// ?? STATUS (GET)
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'status') {
    $barbeiroId = getBarbeiroId();
    
    if (!$barbeiroId) {
        echo json_encode([
            'success' => false,
            'connected' => false,
            'status' => 'no_session',
            'message' => 'Faзa login primeiro'
        ]);
        exit;
    }
    
    $result = fazerRequisicao("/status/{$barbeiroId}");
    echo json_encode($result);
    exit;
}

// ?? CONECTAR (POST)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'connect') {
    $barbeiroId = getBarbeiroId();
    
    if (!$barbeiroId) {
        echo json_encode([
            'success' => false,
            'message' => 'ID do barbeiro nгo encontrado. Faзa login novamente.'
        ]);
        exit;
    }
    
    $result = fazerRequisicao("/connect/{$barbeiroId}", 'POST', [], 60);
    echo json_encode($result);
    exit;
}

// ?? DESCONECTAR (POST)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'disconnect') {
    $barbeiroId = getBarbeiroId();
    
    if (!$barbeiroId) {
        echo json_encode([
            'success' => false,
            'message' => 'ID do barbeiro nгo encontrado'
        ]);
        exit;
    }
    
    $result = fazerRequisicao("/disconnect/{$barbeiroId}", 'POST');
    echo json_encode($result);
    exit;
}

// ?? RESETAR (POST)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'reset') {
    $barbeiroId = getBarbeiroId();
    
    if (!$barbeiroId) {
        echo json_encode([
            'success' => false,
            'message' => 'ID do barbeiro nгo encontrado'
        ]);
        exit;
    }
    
    $result = fazerRequisicao("/reset/{$barbeiroId}", 'POST');
    echo json_encode($result);
    exit;
}

// ?? ENVIAR MENSAGEM (POST)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'send') {
    $barbeiroId = getBarbeiroId();
    $telefone = $_POST['telefone'] ?? '';
    $mensagem = $_POST['mensagem'] ?? '';
    
    if (!$barbeiroId) {
        echo json_encode([
            'success' => false,
            'message' => 'ID do barbeiro nгo encontrado'
        ]);
        exit;
    }
    
    if (empty($telefone) || empty($mensagem)) {
        echo json_encode([
            'success' => false, 
            'message' => 'Telefone e mensagem sгo obrigatуrios'
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

// Aзгo invбlida
echo json_encode([
    'success' => false, 
    'message' => 'Aзгo invбlida ou mйtodo nгo permitido'
]);
?>