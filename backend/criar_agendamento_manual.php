<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexao.php';

session_start();

if (!isset($_SESSION['user_id']) || $_SESSION['user_tipo'] != 'barbeiro') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Acesso não autorizado.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $barbeiro_id = $_SESSION['user_id'];
        
        // Pega dados do formulário
        $cliente_info = $_POST['cliente'] ?? '';
        $servico_id = intval($_POST['servico_id'] ?? 0);
        $data = $_POST['data'] ?? '';
        $hora = $_POST['hora'] ?? '';
        $observacoes = trim($_POST['observacoes'] ?? '');
        
        // Separa nome e telefone do cliente (formato: "Nome|Telefone")
        $cliente_parts = explode('|', $cliente_info);
        $cliente_nome = $cliente_parts[0] ?? '';
        $cliente_telefone = $cliente_parts[1] ?? '';
        
        // Validações
        if (empty($cliente_nome) || empty($cliente_telefone)) {
            echo json_encode(['success' => false, 'message' => 'Cliente inválido.']);
            exit;
        }
        
        if (!$servico_id) {
            echo json_encode(['success' => false, 'message' => 'Selecione um serviço.']);
            exit;
        }
        
        if (empty($data) || empty($hora)) {
            echo json_encode(['success' => false, 'message' => 'Data e horário são obrigatórios.']);
            exit;
        }
        
        // Valida se a data não é no passado
        $data_agendamento = new DateTime($data);
        $hoje = new DateTime();
        $hoje->setTime(0, 0, 0);
        
        if ($data_agendamento < $hoje) {
            echo json_encode(['success' => false, 'message' => 'Não é possível agendar em datas passadas.']);
            exit;
        }
        
        // Valida se já existe agendamento neste horário
        $stmt = $pdo->prepare("
            SELECT id FROM agendamentos 
            WHERE barbeiro_id = ? AND data = ? AND hora = ? AND status != 'cancelado'
        ");
        $stmt->execute([$barbeiro_id, $data, $hora]);
        
        if ($stmt->rowCount() > 0) {
            echo json_encode(['success' => false, 'message' => 'Este horário já está ocupado.']);
            exit;
        }
        
        // Insere o agendamento
        $stmt = $pdo->prepare("
            INSERT INTO agendamentos 
            (barbeiro_id, servico_id, cliente_nome, cliente_telefone, data, hora, observacoes, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, 'confirmado')
        ");
        $stmt->execute([
            $barbeiro_id, 
            $servico_id, 
            $cliente_nome, 
            $cliente_telefone, 
            $data, 
            $hora, 
            $observacoes
        ]);
        
        echo json_encode([
            'success' => true, 
            'message' => 'Agendamento criado com sucesso!',
            'agendamento_id' => $pdo->lastInsertId()
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Erro ao criar agendamento: ' . $e->getMessage()]);
    }
}
?>