<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexao.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Instancia a API
        $api = new SupabaseAPI();

        $barbeiro_id = intval($_POST['barbeiro_id'] ?? 0);
        $servico_id = intval($_POST['servico_id'] ?? 0);
        $cliente_nome = trim($_POST['cliente_nome'] ?? '');
        $cliente_telefone = trim($_POST['cliente_telefone'] ?? '');
        $data = $_POST['data'] ?? '';
        $hora = $_POST['hora'] ?? '';
        $observacoes = trim($_POST['observacoes'] ?? '');

        // 1. Validação básica
        if (!$barbeiro_id || !$servico_id || !$cliente_nome || !$cliente_telefone || !$data || !$hora) {
            echo json_encode(['success' => false, 'message' => 'Todos os campos obrigatórios devem ser preenchidos.']);
            exit;
        }

        // 2. Validação de data passada
        $data_agendamento = new DateTime($data);
        $hoje = new DateTime();
        $hoje->setTime(0, 0, 0);
        
        if ($data_agendamento < $hoje) {
            echo json_encode(['success' => false, 'message' => 'Não é possível agendar em datas passadas.']);
            exit;
        }

        // 3. Verifica horário de funcionamento (Supabase)
        $dia_semana = date('w', strtotime($data));
        
        $regra = $api->selectOne('configuracao_horarios', [
            'dia_semana' => $dia_semana,
            'barbeiro_id' => $barbeiro_id
        ]);

        if ($regra) {
            if ($regra['aberto'] == 0) {
                echo json_encode(['success' => false, 'message' => 'O barbeiro não atende neste dia da semana.']);
                exit;
            }
            
            // Corrige formato HH:MM:SS para comparação
            $hora_input = substr($hora, 0, 5); // 09:00
            $hora_inicio = substr($regra['hora_inicio'], 0, 5);
            $hora_fim = substr($regra['hora_fim'], 0, 5);

            if ($hora_input < $hora_inicio || $hora_input >= $hora_fim) {
                echo json_encode(['success' => false, 'message' => "Horário indisponível. Atendimento das {$hora_inicio} às {$hora_fim}"]);
                exit;
            }
        }

        // 4. Verifica conflito de horário (Supabase)
        // Busca agendamentos no mesmo dia/hora/barbeiro
        $conflitos = $api->select('agendamentos', [
            'barbeiro_id' => $barbeiro_id,
            'data' => $data,
            'hora' => $hora
        ]);

        // Verifica manualmente se algum NÃO está cancelado
        $ocupado = false;
        if (is_array($conflitos)) {
            foreach ($conflitos as $c) {
                if (isset($c['status']) && $c['status'] !== 'cancelado') {
                    $ocupado = true;
                    break;
                }
            }
        }
        
        if ($ocupado) {
            echo json_encode(['success' => false, 'message' => 'Este horário já está ocupado.']);
            exit;
        }

        // 5. Salva o agendamento (INSERT)
        $novoAgendamento = [
            'barbeiro_id' => $barbeiro_id,
            'servico_id' => $servico_id,
            'cliente_nome' => $cliente_nome,
            'cliente_telefone' => $cliente_telefone,
            'data' => $data,
            'hora' => $hora,
            'observacoes' => $observacoes,
            'status' => 'pendente'
        ];

        $resultado = $api->insert('agendamentos', $novoAgendamento);

        // O insert retorna o objeto inserido (array) ou lança erro
        echo json_encode([
            'success' => true, 
            'message' => 'Agendamento realizado com sucesso!',
            'agendamento_id' => $resultado[0]['id'] ?? 0 // Tenta pegar o ID gerado
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
    }
}
?>