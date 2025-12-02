<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexao.php';

session_start();

// Verifica se o usuário está logado
if (!isset($_SESSION['user_id']) || $_SESSION['user_tipo'] != 'barbeiro') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Acesso não autorizado.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $barbeiro_id = $_SESSION['user_id'];
        $agendamento_id = intval($_POST['agendamento_id'] ?? 0);
        
        if (!$agendamento_id) {
            echo json_encode(['success' => false, 'message' => 'ID do agendamento inválido.']);
            exit;
        }
        
        // Verifica se o agendamento pertence ao barbeiro logado
        $stmt = $pdo->prepare("SELECT id FROM agendamentos WHERE id = ? AND barbeiro_id = ?");
        $stmt->execute([$agendamento_id, $barbeiro_id]);
        
        if ($stmt->rowCount() === 0) {
            echo json_encode(['success' => false, 'message' => 'Agendamento não encontrado ou não autorizado.']);
            exit;
        }
        
        // Atualiza o status para cancelado
        $stmt = $pdo->prepare("UPDATE agendamentos SET status = 'cancelado' WHERE id = ?");
        $stmt->execute([$agendamento_id]);
        
        // Prepara resposta
        $response = [
            'success' => true,
            'message' => 'Agendamento cancelado com sucesso!',
            'whatsapp_sent' => false
        ];
        
        // Envia WhatsApp de cancelamento
        $resultado = enviarWhatsAppCancelamento($agendamento_id, $barbeiro_id, $pdo);
        
        if ($resultado['whatsapp_sent']) {
            $response['message'] .= ' ✅ Cliente notificado via WhatsApp.';
            $response['whatsapp_sent'] = true;
        } else if (isset($resultado['whatsapp_error'])) {
            $response['message'] .= ' ⚠️ (WhatsApp indisponível)';
            $response['whatsapp_error'] = $resultado['whatsapp_error'];
        }
        
        echo json_encode($response);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Erro no banco: ' . $e->getMessage()]);
    }
}

/**
 * Envia mensagem WhatsApp informando cancelamento
 * 🔥 ATUALIZADO: Multi-sessão com barbeiro_id
 */
function enviarWhatsAppCancelamento($agendamento_id, $barbeiro_id, $pdo) {
    try {
        // Busca informações do agendamento
        $stmt = $pdo->prepare("
            SELECT 
                a.cliente_nome,
                a.cliente_telefone,
                a.data,
                a.hora,
                s.nome_servico,
                s.preco,
                u.nome as barbeiro_nome,
                u.telefone as barbeiro_telefone
            FROM agendamentos a
            JOIN servicos s ON a.servico_id = s.id
            JOIN usuarios u ON a.barbeiro_id = u.id
            WHERE a.id = ?
        ");
        $stmt->execute([$agendamento_id]);
        $agendamento = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$agendamento) {
            return ['whatsapp_sent' => false, 'whatsapp_error' => 'Agendamento não encontrado'];
        }

        // Formata datas
        $data_formatada = date('d/m/Y', strtotime($agendamento['data']));
        $hora_formatada = date('H:i', strtotime($agendamento['hora']));

        // Monta a mensagem de cancelamento
        $mensagem = "Olá *{$agendamento['cliente_nome']}*! 👋\n\n";
        $mensagem .= "Seu agendamento foi *CANCELADO* ❌\n\n";
        $mensagem .= "*Barbearia:* {$agendamento['barbeiro_nome']}\n";
        $mensagem .= "*Serviço:* {$agendamento['nome_servico']}\n";
        $mensagem .= "*📅 Data:* {$data_formatada}\n";
        $mensagem .= "*⏰ Horário:* {$hora_formatada}\n\n";
        $mensagem .= "Se deseja reagendar, acesse nosso link de agendamento ou nos chame no WhatsApp. 📞\n";
        
        if (!empty($agendamento['barbeiro_telefone'])) {
            $mensagem .= "Tel: {$agendamento['barbeiro_telefone']}";
        }

        // 🔥 ENVIA COM BARBEIRO_ID
        return enviarViaNodeServer($barbeiro_id, $agendamento['cliente_telefone'], $mensagem);

    } catch (Exception $e) {
        return ['whatsapp_sent' => false, 'whatsapp_error' => $e->getMessage()];
    }
}

/**
 * Envia mensagem via Node.js WhatsApp Server (Multi-Sessão)
 * 🔥 ATUALIZADO: IP da VM + barbeiro_id na URL
 */
function enviarViaNodeServer($barbeiro_id, $telefone, $mensagem) {
    // 🔥 IP CORRETO da VM WhatsApp
    $nodeServer = 'http://168.138.133.246:3000';
    
    $dados = [
        'telefone' => $telefone,
        'mensagem' => $mensagem
    ];

    // 🔥 ENDPOINT COM ID DO BARBEIRO
    $ch = curl_init($nodeServer . "/send/{$barbeiro_id}");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 3);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($dados));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $erro = curl_error($ch);
    curl_close($ch);

    if ($erro) {
        return ['whatsapp_sent' => false, 'whatsapp_error' => 'Erro de conexão: ' . $erro];
    }

    if ($httpCode !== 200) {
        return ['whatsapp_sent' => false, 'whatsapp_error' => 'Servidor retornou: ' . $httpCode];
    }

    $resultado = json_decode($response, true);
    
    if (isset($resultado['success']) && $resultado['success']) {
        return ['whatsapp_sent' => true];
    } else {
        return ['whatsapp_sent' => false, 'whatsapp_error' => $resultado['message'] ?? 'Erro desconhecido'];
    }
}
?>