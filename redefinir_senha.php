<?php
require_once __DIR__ . '/backend/conexao.php';

$token = $_GET['token'] ?? '';
$mensagem = '';
$token_valido = false;

if ($token) {
    // Verifica se o token existe e não expirou
    $stmt = $pdo->prepare("
        SELECT t.*, u.email 
        FROM tokens_recuperacao t
        JOIN usuarios u ON t.usuario_id = u.id
        WHERE t.token = ? AND t.expiracao > NOW() AND t.usado = FALSE
    ");
    $stmt->execute([$token]);
    $resultado = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($resultado) {
        $token_valido = true;
    } else {
        $mensagem = 'Este link expirou ou é inválido. Solicite um novo link de recuperação.';
    }
} else {
    $mensagem = 'Link inválido.';
}

// Processa a redefinição
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $token_valido) {
    $nova_senha = $_POST['nova_senha'] ?? '';
    $confirma_senha = $_POST['confirma_senha'] ?? '';
    
    if ($nova_senha !== $confirma_senha) {
        $mensagem = 'As senhas não coincidem!';
    } elseif (strlen($nova_senha) < 6) {
        $mensagem = 'A senha deve ter pelo menos 6 caracteres!';
    } else {
        $senha_hash = password_hash($nova_senha, PASSWORD_DEFAULT);
        
        // Atualiza a senha
        $stmt = $pdo->prepare("UPDATE usuarios SET senha = ? WHERE id = ?");
        $stmt->execute([$senha_hash, $resultado['usuario_id']]);
        
        // Marca o token como usado
        $stmt = $pdo->prepare("UPDATE tokens_recuperacao SET usado = TRUE WHERE token = ?");
        $stmt->execute([$token]);
        
        $mensagem = 'success';
    }
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Redefinir Senha - ClickAgenda</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <link rel="stylesheet" href="css/style.css">
    <style>
        body {
            background: linear-gradient(135deg, #1a1a2e 0%, #2a2a3e 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .reset-container {
            background: white;
            border-radius: 16px;
            padding: 2.5rem;
            max-width: 500px;
            width: 100%;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }
        .reset-header {
            text-align: center;
            margin-bottom: 2rem;
        }
        .reset-header i {
            font-size: 3rem;
            color: #d4af37;
            margin-bottom: 1rem;
        }
        .reset-header h1 {
            color: #1a1a2e;
            margin-bottom: 0.5rem;
        }
        .alert {
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1.5rem;
            text-align: center;
        }
        .alert-error {
            background: #fee;
            color: #c33;
            border: 1px solid #fcc;
        }
        .alert-success {
            background: #dfd;
            color: #3a3;
            border: 1px solid #bfb;
        }
        .btn-voltar {
            display: inline-block;
            margin-top: 1rem;
            color: #d4af37;
            text-decoration: none;
        }
        .btn-voltar:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="reset-container">
        <div class="reset-header">
            <i class="fas fa-key"></i>
            <h1>Redefinir Senha</h1>
            <p style="color: #666;">Crie uma nova senha para sua conta</p>
        </div>

        <?php if ($mensagem === 'success'): ?>
            <div class="alert alert-success">
                <i class="fas fa-check-circle"></i>
                <strong>Senha redefinida com sucesso!</strong>
                <p>Você já pode fazer login com sua nova senha.</p>
            </div>
            <a href="index.html" class="btn btn-primary" style="width: 100%; text-align: center;">
                <i class="fas fa-sign-in-alt"></i> Fazer Login
            </a>
        
        <?php elseif (!$token_valido): ?>
            <div class="alert alert-error">
                <i class="fas fa-exclamation-triangle"></i>
                <p><?php echo htmlspecialchars($mensagem); ?></p>
            </div>
            <a href="index.html" class="btn btn-secondary" style="width: 100%; text-align: center;">
                <i class="fas fa-arrow-left"></i> Voltar ao Início
            </a>
        
        <?php else: ?>
            <?php if ($mensagem && $mensagem !== 'success'): ?>
                <div class="alert alert-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <?php echo htmlspecialchars($mensagem); ?>
                </div>
            <?php endif; ?>

            <form method="POST">
                <div class="form-group">
                    <label>Nova Senha</label>
                    <div class="input-with-icon">
                        <i class="fas fa-lock"></i>
                        <input type="password" name="nova_senha" id="nova-senha" placeholder="Mínimo 6 caracteres" required>
                        <button type="button" class="toggle-password" onclick="togglePasswordField('nova-senha', this)">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>

                <div class="form-group">
                    <label>Confirmar Nova Senha</label>
                    <div class="input-with-icon">
                        <i class="fas fa-lock"></i>
                        <input type="password" name="confirma_senha" id="confirma-senha" placeholder="Digite novamente" required>
                        <button type="button" class="toggle-password" onclick="togglePasswordField('confirma-senha', this)">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>

                <button type="submit" class="btn btn-primary" style="width: 100%;">
                    <i class="fas fa-check"></i> Redefinir Senha
                </button>

                <div style="text-align: center; margin-top: 1.5rem;">
                    <a href="index.html" class="btn-voltar">
                        <i class="fas fa-arrow-left"></i> Voltar ao login
                    </a>
                </div>
            </form>
        <?php endif; ?>
    </div>

    <script>
        function togglePasswordField(inputId, button) {
            const input = document.getElementById(inputId);
            const icon = button.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        }
    </script>
</body>
</html>