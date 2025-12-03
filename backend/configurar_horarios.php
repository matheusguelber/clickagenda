<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexao.php';
session_start();

// Só deixa continuar se o usuário for barbeiro
if (!isset($_SESSION['user_id']) || $_SESSION['user_tipo'] != 'barbeiro') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Acesso não autorizado.']);
    exit;
}

$barbeiro_id = $_SESSION['user_id'];

// Salva as configurações de horários (POST)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $jsonHorarios = $_POST['horarios'] ?? '';
    $horarios = json_decode($jsonHorarios, true);

    if (!is_array($horarios)) {
        echo json_encode(['success' => false, 'message' => 'Dados inválidos.']);
        exit;
    }

    try {
        $pdo->beginTransaction();

        $sql = "INSERT INTO configuracao_horarios (barbeiro_id, dia_semana, hora_inicio, hora_fim, aberto) 
                VALUES (?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                hora_inicio = VALUES(hora_inicio), 
                hora_fim = VALUES(hora_fim), 
                aberto = VALUES(aberto)";
        
        $stmt = $pdo->prepare($sql);

        foreach ($horarios as $dia) {
            $dia_semana = intval($dia['dia_semana']);
            $aberto = $dia['aberto'] ? 1 : 0;
            // Se o dia estiver fechado ou sem horário, usa padrão, mas o que vale é o flag 'aberto'
            $inicio = ($aberto && !empty($dia['hora_inicio'])) ? $dia['hora_inicio'] : '09:00:00';
            $fim = ($aberto && !empty($dia['hora_fim'])) ? $dia['hora_fim'] : '18:00:00';

            $stmt->execute([$barbeiro_id, $dia_semana, $inicio, $fim, $aberto]);
        }

        $pdo->commit();
        echo json_encode(['success' => true, 'message' => 'Configurações salvas com sucesso!']);

    } catch (PDOException $e) {
        $pdo->rollBack();
        echo json_encode(['success' => false, 'message' => 'Erro no banco: ' . $e->getMessage()]);
    }
} 

// Carrega as configurações de horários (GET)
else if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $pdo->prepare("SELECT * FROM configuracao_horarios WHERE barbeiro_id = ?");
        $stmt->execute([$barbeiro_id]);
        $dados = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $horariosMap = [];
        foreach ($dados as $linha) {
            $horariosMap[$linha['dia_semana']] = $linha;
        }

        echo json_encode(['success' => true, 'horarios' => $horariosMap]);

    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
    }
}
?>