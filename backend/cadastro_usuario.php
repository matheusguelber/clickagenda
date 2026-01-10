<?php
header('Content-Type: application/json; charset=utf-8');
require_once 'conexao.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nome = trim($_POST['nome']);
    $email = trim($_POST['email']);
    $senha = $_POST['senha'];
    $tipo = 'barbeiro'; // Padrão

    if (empty($nome) || empty($email) || empty($senha)) {
        echo json_encode(['success' => false, 'message' => 'Preencha todos os campos.']);
        exit;
    }

    try {
        $supabase = new SupabaseAPI();

        // Verifica se email já existe
        $existente = $supabase->select('usuarios', ['email' => $email]);
        if (!empty($existente)) {
            echo json_encode(['success' => false, 'message' => 'E-mail já cadastrado.']);
            exit;
        }

        // Hash da senha
        $senhaHash = password_hash($senha, PASSWORD_DEFAULT);

        // Insere
        $dados = [
            'nome' => $nome,
            'email' => $email,
            'senha' => $senhaHash,
            'tipo' => $tipo,
            'data_cadastro' => date('Y-m-d H:i:s')
        ];
        
        $supabase->insert('usuarios', $dados);

        echo json_encode(['success' => true, 'message' => 'Cadastro realizado com sucesso!']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Erro ao cadastrar: ' . $e->getMessage()]);
    }
}
?>