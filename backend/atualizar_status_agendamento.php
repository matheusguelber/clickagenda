<?php
// Atualizar Status Agendamento - Multi-Sessao
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexao.php';

session_start();

if (!isset($_SESSION['user_id']) || $_SESSION['user_tipo'] != 'barbeiro') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Acesso negado']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $barbeiro_id = $_SESSION['user_id'];
        $agendamento_id = intval($_POST['agendamento_id'] ?? 0);
        $status = $_POST['status'] ?? '';
        
        if (!$agendamento_id || !in_array($status, ['pendente', 'confirmado', 'cancelado'])) {
            echo json_encode(['success' => false, 'message' => 'Dados invalidos']);
            exit;
        }
        
        $stmt = $pdo->prepare("SELECT id FROM agendamentos WHERE id = ? AND barbeiro_id = ?");
        $stmt->execute([$agendamento_id, $barbeiro_id]);
        
        if ($stmt->rowCount() === 0) {
            echo json_encode(['success' => false, 'message' => 'Agendamento nao encontrado']);
            exit;
        }
        
        $stmt = $pdo->prepare("UPDATE agendamentos SET status = ? WHERE id = ?");
        $stmt->execute([$status, $agendamento_id]);
        
        $response = [
            'success' => true,
            'message' => $status === 'confirmado' ? 'Agendamento confirmado!' : 'Status atualizado!',
            'whatsapp_sent' => false
        ];
        
        if ($status === 'confirmado') {
            $resultado = enviarWhatsAppConfirmacao($agendamento_id, $barbeiro_id, $pdo);
            
            if ($resultado['whatsapp_sent']) {
                $response['message'] = 'Agendamento confirmado! Mensagem enviada via WhatsApp.';
                $response['whatsapp_sent'] = true;
            } else if (isset($resultado['whatsapp_error'])) {
                $response['message'] = 'Agendamento confirmado! (WhatsApp: ' . $resultado['whatsapp_error'] . ')';
                $response['whatsapp_error'] = $resultado['whatsapp_error'];
            }
        }
        
        echo json_encode($response);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
    }
}

function enviarWhatsAppConfirmacao($agendamento_id, $barbeiro_id, $pdo) {
    try {
        $stmt = $pdo->prepare("
            SELECT 
                a.cliente_nome,
                a.cliente_telefone,
                a.data,
                a.hora,
                s.nome_servico,
                s.preco,
                u.nome as barbeiro_nome
            FROM agendamentos a
            JOIN servicos s ON a.servico_id = s.id
            JOIN usuarios u ON a.barbeiro_id = u.id
            WHERE a.id = ?
        ");
        $stmt->execute([$agendamento_id]);
        $agendamento = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$agendamento) {
            return ['whatsapp_sent' => false, 'whatsapp_error' => 'Agendamento nao encontrado'];
        }

        $data_formatada = date('d/m/Y', strtotime($agendamento['data']));
        $hora_formatada = date('H:i', strtotime($agendamento['hora']));
        $preco_formatado = number_format($agendamento['preco'], 2, ',', '.');

        $mensagem = "Ola *{$agendamento['cliente_nome']}*!\n\n";
        $mensagem .= "Seu agendamento foi *CONFIRMADO*\n\n";
        $mensagem .= "*Barbearia:* {$agendamento['barbeiro_nome']}\n";
        $mensagem .= "*Servico:* {$agendamento['nome_servico']}\n";
        $mensagem .= "*Data:* {$data_formatada}\n";
        $mensagem .= "*Horario:* {$hora_formatada}\n";
        $mensagem .= "*Valor:* R$ {$preco_formatado}\n\n";
        $mensagem .= "Estamos te aguardando! Qualquer duvida, nos chame no WhatsApp.";

        return enviarViaNodeServer($barbeiro_id, $agendamento['cliente_telefone'], $mensagem);

    } catch (Exception $e) {
        return ['whatsapp_sent' => false, 'whatsapp_error' => $e->getMessage()];
    }
}

function enviarViaNodeServer($barbeiro_id, $telefone, $mensagem) {
    $nodeServer = 'http://168.138.133.246:3000';
    
    $dados = [
        'telefone' => $telefone,
        'mensagem' => $mensagem
    ];

    $ch = curl_init($nodeServer . "/send/{$barbeiro_id}");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($dados));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $erro = curl_error($ch);
    curl_close($ch);

    if ($erro) {
        return ['whatsapp_sent' => false, 'whatsapp_error' => 'Erro de conexao'];
    }

    if ($httpCode !== 200) {
        return ['whatsapp_sent' => false, 'whatsapp_error' => 'Servidor indisponivel'];
    }

    $resultado = json_decode($response, true);
    
    if (isset($resultado['success']) && $resultado['success']) {
        return ['whatsapp_sent' => true];
    } else {
        return ['whatsapp_sent' => false, 'whatsapp_error' => $resultado['message'] ?? 'Erro desconhecido'];
    }
}
?>