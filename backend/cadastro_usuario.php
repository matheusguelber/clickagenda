<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexao.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nome = trim($_POST['nome'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $senha = $_POST['senha'] ?? '';
    $tipo = 'barbeiro'; // Padrão

    if (empty($nome) || empty($email) || empty($senha)) {
        echo json_encode(['success' => false, 'message' => 'Preencha todos os campos.']);
        exit;
    }

    try {
        $api = new SupabaseAPI();

        // Verifica se email já existe
        $existente = $api->select('usuarios', ['email' => $email]);
        
        // Supabase retorna array vazio se não achar, ou array com dados se achar
        if (!empty($existente)) {
            echo json_encode(['success' => false, 'message' => 'E-mail já cadastrado.']);
            exit;
        }

        // Hash da senha
        $senhaHash = password_hash($senha, PASSWORD_DEFAULT);

        // Gera o Slug (URL amigável) baseado no nome
        // Ex: "João Silva" vira "joao-silva"
        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $nome)));
        // Adiciona um número aleatório no fim para garantir que seja único
        $slug .= '-' . rand(100, 999);

        // Insere no banco
        // REMOVIDO: 'data_cadastro' (O Supabase usa created_at automático)
        $dados = [
            'nome' => $nome,
            'email' => $email,
            'senha' => $senhaHash,
            'tipo' => $tipo,
            'slug' => $slug
        ];
        
        $api->insert('usuarios', $dados);

        echo json_encode(['success' => true, 'message' => 'Cadastro realizado com sucesso!']);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Erro ao cadastrar: ' . $e->getMessage()]);
    }
}
?>