<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexao.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $barbeiro_id = intval($_POST['barbeiro_id'] ?? 0);
        $servico_id = intval($_POST['servico_id'] ?? 0);
        $cliente_nome = trim($_POST['cliente_nome'] ?? '');
        $cliente_telefone = trim($_POST['cliente_telefone'] ?? '');
        $data = $_POST['data'] ?? '';
        $hora = $_POST['hora'] ?? '';
        $observacoes = trim($_POST['observacoes'] ?? '');

        // 1. Validação Básica
        if (!$barbeiro_id || !$servico_id || !$cliente_nome || !$cliente_telefone || !$data || !$hora) {
            echo json_encode(['success' => false, 'message' => 'Todos os campos obrigatórios devem ser preenchidos.']);
            exit;
        }

        // 2. Validação de Data Passada
        $data_agendamento = new DateTime($data);
        $hoje = new DateTime();
        $hoje->setTime(0, 0, 0);
        
        if ($data_agendamento < $hoje) {
            echo json_encode(['success' => false, 'message' => 'Não é possível agendar em datas passadas.']);
            exit;
        }

        // 3. (NOVO) Validação do Horário de Funcionamento
        $dia_semana = date('w', strtotime($data));
        $stmt = $pdo->prepare("SELECT aberto, hora_inicio, hora_fim FROM configuracao_horarios WHERE dia_semana = ? AND barbeiro_id = ?");
        $stmt->execute([$dia_semana, $barbeiro_id]);
        $regra = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($regra) {
            if ($regra['aberto'] == 0) {
                echo json_encode(['success' => false, 'message' => 'O barbeiro não atende neste dia da semana.']);
                exit;
            }
            
            $hora_ts = strtotime($hora);
            $inicio_ts = strtotime($regra['hora_inicio']);
            $fim_ts = strtotime($regra['hora_fim']);

            if ($hora_ts < $inicio_ts || $hora_ts >= $fim_ts) {
                echo json_encode(['success' => false, 'message' => "Horário indisponível. Atendimento das " . date('H:i', $inicio_ts) . " às " . date('H:i', $fim_ts)]);
                exit;
            }
        }

        // 4. Validação de Conflito (Já agendado?)
        $stmt = $pdo->prepare("SELECT id FROM agendamentos WHERE barbeiro_id = ? AND data = ? AND hora = ? AND status != 'cancelado'");
        $stmt->execute([$barbeiro_id, $data, $hora]);
        
        if ($stmt->rowCount() > 0) {
            echo json_encode(['success' => false, 'message' => 'Este horário já está ocupado.']);
            exit;
        }

        // 5. Inserir Agendamento
        $stmt = $pdo->prepare("
            INSERT INTO agendamentos (barbeiro_id, servico_id, cliente_nome, cliente_telefone, data, hora, observacoes, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, 'pendente')
        ");
        $stmt->execute([$barbeiro_id, $servico_id, $cliente_nome, $cliente_telefone, $data, $hora, $observacoes]);

        echo json_encode([
            'success' => true, 
            'message' => 'Agendamento realizado com sucesso!',
            'agendamento_id' => $pdo->lastInsertId()
        ]);

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Erro no banco de dados: ' . $e->getMessage()]);
    }
}
?>