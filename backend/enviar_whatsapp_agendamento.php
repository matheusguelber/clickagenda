<?php
// ========================================
// enviar_whatsapp_agendamento.php
// COMPLETO E ATUALIZADO - Multi-Sessão
// ========================================

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexao.php';

/**
 * Envia mensagem WhatsApp para confirmação ou cancelamento de agendamento
 * 
 * POST params:
 * - agendamento_id: ID do agendamento
 * - acao: 'confirmado' ou 'cancelado'
 */

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $agendamento_id = intval($_POST['agendamento_id'] ?? 0);
        $acao = $_POST['acao'] ?? ''; // 'confirmado' ou 'cancelado'
        
        if (!$agendamento_id || !in_array($acao, ['confirmado', 'cancelado'])) {
            echo json_encode(['success' => false, 'message' => 'Parâmetros inválidos']);
            exit;
        }

        // 1. Busca informações do agendamento
        $stmt = $pdo->prepare("
            SELECT 
                a.id,
                a.barbeiro_id,
                a.cliente_nome,
                a.cliente_telefone,
                a.data,
                a.hora,
                a.status,
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
            echo json_encode(['success' => false, 'message' => 'Agendamento não encontrado']);
            exit;
        }

        // 2. Formata a data e hora
        $data_formatada = date('d/m/Y', strtotime($agendamento['data']));
        $hora_formatada = date('H:i', strtotime($agendamento['hora']));
        $preco_formatado = number_format($agendamento['preco'], 2, ',', '.');

        // 3. Monta a mensagem conforme a ação
        if ($acao === 'confirmado') {
            $mensagem = "Olá *{$agendamento['cliente_nome']}*! 👋✂️\n\n";
            $mensagem .= "Seu agendamento foi *CONFIRMADO* ✅\n\n";
            $mensagem .= "*Barbearia:* {$agendamento['barbeiro_nome']}\n";
            $mensagem .= "*Serviço:* {$agendamento['nome_servico']}\n";
            $mensagem .= "*📅 Data:* {$data_formatada}\n";
            $mensagem .= "*⏰ Horário:* {$hora_formatada}\n";
            $mensagem .= "*💰 Valor:* R$ {$preco_formatado}\n\n";
            $mensagem .= "Estamos te aguardando! Qualquer dúvida, nos chame no WhatsApp. 🙂\n";
            
            if (!empty($agendamento['barbeiro_telefone'])) {
                $mensagem .= "📞 {$agendamento['barbeiro_telefone']}";
            }
        } else {
            // CANCELADO
            $mensagem = "Olá *{$agendamento['cliente_nome']}*! 👋\n\n";
            $mensagem .= "Seu agendamento foi *CANCELADO* ❌\n\n";
            $mensagem .= "*Barbearia:* {$agendamento['barbeiro_nome']}\n";
            $mensagem .= "*Serviço:* {$agendamento['nome_servico']}\n";
            $mensagem .= "*📅 Data:* {$data_formatada}\n";
            $mensagem .= "*⏰ Horário:* {$hora_formatada}\n\n";
            $mensagem .= "Se deseja reagendar, acesse nosso link de agendamento ou nos chame no WhatsApp. 🙂\n";
            
            if (!empty($agendamento['barbeiro_telefone'])) {
                $mensagem .= "📞 {$agendamento['barbeiro_telefone']}";
            }
        }

        // 4. Envia via WhatsApp (usando a sessão do barbeiro)
        $barbeiro_id = $agendamento['barbeiro_id'];
        $resultado = enviarWhatsAppViaNode($barbeiro_id, $agendamento['cliente_telefone'], $mensagem);

        if ($resultado['success']) {
            echo json_encode([
                'success' => true,
                'message' => 'Mensagem WhatsApp enviada com sucesso!',
                'whatsapp_sent' => true
            ]);
        } else {
            // Mesmo que falhe o WhatsApp, o agendamento já foi confirmado/cancelado no banco
            echo json_encode([
                'success' => true,
                'message' => 'Agendamento atualizado. WhatsApp não disponível no momento.',
                'whatsapp_sent' => false,
                'whatsapp_error' => $resultado['message'] ?? 'Erro desconhecido'
            ]);
        }

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Erro no banco: ' . $e->getMessage()]);
    }
}

/**
 * Envia mensagem via Node.js WhatsApp Server (Multi-Sessão)
 * 
 * @param int $barbeiro_id ID do barbeiro (para usar sua sessão WhatsApp)
 * @param string $telefone Telefone do destinatário
 * @param string $mensagem Texto da mensagem
 * @return array ['success' => bool, 'message' => string]
 */
function enviarWhatsAppViaNode($barbeiro_id, $telefone, $mensagem) {
    // 🔥 IP da VM WhatsApp
    $nodeServer = 'http://168.138.133.246:3000';
    
    $dados = [
        'telefone' => $telefone,
        'mensagem' => $mensagem
    ];

    // 🔥 ATUALIZADO: Endpoint com ID do barbeiro
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
        return ['success' => false, 'message' => 'Erro de conexão: ' . $erro];
    }

    if ($httpCode !== 200) {
        return ['success' => false, 'message' => 'Servidor retornou: ' . $httpCode];
    }

    $resultado = json_decode($response, true);
    return $resultado ?? ['success' => false, 'message' => 'Resposta inválida'];
}
?>
