<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexao.php';

// Fix do Notice de sessão
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (!isset($_SESSION['user_id']) || $_SESSION['user_tipo'] != 'barbeiro') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Acesso não autorizado.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Instancia a API
        $api = new SupabaseAPI();
        
        $barbeiro_id = $_SESSION['user_id'];
        $agendamento_id = intval($_POST['agendamento_id'] ?? 0);
        $status = $_POST['status'] ?? '';
        
        if (!$agendamento_id || !in_array($status, ['pendente', 'confirmado', 'cancelado'])) {
            echo json_encode(['success' => false, 'message' => 'Dados inválidos.']);
            exit;
        }
        
        // 1. Verifica se o agendamento existe e pertence ao barbeiro
        $agendamento = $api->selectOne('agendamentos', [
            'id' => $agendamento_id,
            'barbeiro_id' => $barbeiro_id
        ]);
        
        if (!$agendamento) {
            echo json_encode(['success' => false, 'message' => 'Agendamento não encontrado.']);
            exit;
        }
        
        // 2. Atualiza o status
        $api->update('agendamentos', ['id' => $agendamento_id], ['status' => $status]);
        
        // Prepara a resposta
        $response = [
            'success' => true,
            'message' => $status === 'confirmado' ? 'Agendamento confirmado!' : 'Agendamento cancelado!',
            'whatsapp_sent' => false
        ];
        
        // 3. Se mudou para confirmado ou cancelado, tenta mandar WhatsApp
        if (in_array($status, ['confirmado', 'cancelado'])) {
            $acao = $status;
            // Passamos a $api em vez do $pdo
            $resultado = enviarWhatsAppAgendamento($agendamento_id, $acao, $barbeiro_id, $api);
            
            if ($resultado['whatsapp_sent']) {
                $response['message'] .= ' ✅ Mensagem WhatsApp enviada!';
                $response['whatsapp_sent'] = true;
            } else if (isset($resultado['whatsapp_error'])) {
                $response['message'] .= ' ⚠️ (WhatsApp: ' . $resultado['whatsapp_error'] . ')';
                $response['whatsapp_error'] = $resultado['whatsapp_error'];
            }
        }
        
        echo json_encode($response);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
    }
}

/**
 * Envia mensagem WhatsApp - Adaptado para SupabaseAPI (Sem JOINs)
 */
function enviarWhatsAppAgendamento($agendamento_id, $acao, $barbeiro_id, $api) {
    try {
        // Como não temos JOIN, buscamos os dados em etapas
        
        // 1. Busca Agendamento
        $agendamento = $api->selectOne('agendamentos', ['id' => $agendamento_id]);
        if (!$agendamento) return ['whatsapp_sent' => false, 'whatsapp_error' => 'Agendamento sumiu'];

        // 2. Busca Serviço (pelo ID que estava no agendamento)
        $servico = $api->selectOne('servicos', ['id' => $agendamento['servico_id']]);
        
        // 3. Busca Barbeiro (pelo ID que estava no agendamento)
        $barbeiro = $api->selectOne('usuarios', ['id' => $agendamento['barbeiro_id']]);

        // Monta um array consolidado igual ao que o SQL retornava antes
        $dadosCompletos = [
            'cliente_nome' => $agendamento['cliente_nome'],
            'cliente_telefone' => $agendamento['cliente_telefone'],
            'data' => $agendamento['data'],
            'hora' => $agendamento['hora'],
            'nome_servico' => $servico ? $servico['nome_servico'] : 'Serviço não listado',
            'preco' => $servico ? $servico['preco'] : 0,
            'barbeiro_nome' => $barbeiro ? $barbeiro['nome'] : 'Barbearia',
            'barbeiro_telefone' => $barbeiro ? $barbeiro['telefone'] : ''
        ];

        // Formatação
        $data_formatada = date('d/m/Y', strtotime($dadosCompletos['data']));
        $hora_formatada = date('H:i', strtotime($dadosCompletos['hora']));
        $preco_formatado = number_format($dadosCompletos['preco'], 2, ',', '.');

        // Cria o texto
        if ($acao === 'confirmado') {
            $mensagem = "Olá *{$dadosCompletos['cliente_nome']}*! 👋💈\n\n";
            $mensagem .= "Seu agendamento foi *CONFIRMADO* ✅\n\n";
            $mensagem .= "*Barbearia:* {$dadosCompletos['barbeiro_nome']}\n";
            $mensagem .= "*Serviço:* {$dadosCompletos['nome_servico']}\n";
            $mensagem .= "*📅 Data:* {$data_formatada}\n";
            $mensagem .= "*⏰ Horário:* {$hora_formatada}\n";
            $mensagem .= "*💰 Valor:* R$ {$preco_formatado}\n\n";
            $mensagem .= "Estamos te aguardando! Qualquer dúvida, nos chame no WhatsApp. 😊\n";
            
            if (!empty($dadosCompletos['barbeiro_telefone'])) {
                $mensagem .= "📞 {$dadosCompletos['barbeiro_telefone']}";
            }
        } else {
            $mensagem = "Olá *{$dadosCompletos['cliente_nome']}*! 👋\n\n";
            $mensagem .= "Seu agendamento foi *CANCELADO* ❌\n\n";
            $mensagem .= "*Barbearia:* {$dadosCompletos['barbeiro_nome']}\n";
            $mensagem .= "*Serviço:* {$dadosCompletos['nome_servico']}\n";
            $mensagem .= "*📅 Data:* {$data_formatada}\n";
            $mensagem .= "*⏰ Horário:* {$hora_formatada}\n\n";
            $mensagem .= "Se deseja reagendar, acesse nosso link de agendamento ou nos chame no WhatsApp. 📞\n";
            
            if (!empty($dadosCompletos['barbeiro_telefone'])) {
                $mensagem .= "Tel: {$dadosCompletos['barbeiro_telefone']}";
            }
        }

        return enviarViaNodeServer($barbeiro_id, $dadosCompletos['cliente_telefone'], $mensagem);

    } catch (Exception $e) {
        return ['whatsapp_sent' => false, 'whatsapp_error' => $e->getMessage()];
    }
}

/**
 * Envia mensagem via Node.js WhatsApp Server
 * Mantida igual (apenas log de erro ajustado)
 */
function enviarViaNodeServer($barbeiro_id, $telefone, $mensagem) {
    $nodeServer = 'http://168.138.133.246:3000';
    
    $dados = [
        'telefone' => $telefone,
        'mensagem' => $mensagem
    ];

    // Tenta rota com ID
    $ch = curl_init($nodeServer . "/send/{$barbeiro_id}");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 3);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($dados));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    // Importante para XAMPP local
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); 

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $erro = curl_error($ch);
    curl_close($ch);

    // Fallback rota sem ID
    if ($httpCode === 404) {
        $ch = curl_init($nodeServer . "/send");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 3);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($dados));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $erro = curl_error($ch);
        curl_close($ch);
    }

    if ($erro) {
        return ['whatsapp_sent' => false, 'whatsapp_error' => 'Erro Conexão Node: ' . $erro];
    }

    if ($httpCode !== 200) {
        return ['whatsapp_sent' => false, 'whatsapp_error' => "Node Server Code {$httpCode}"];
    }

    $resultado = json_decode($response, true);
    
    if (isset($resultado['success']) && $resultado['success']) {
        return ['whatsapp_sent' => true];
    } else {
        return ['whatsapp_sent' => false, 'whatsapp_error' => $resultado['message'] ?? 'Erro desconhecido'];
    }
}
?>