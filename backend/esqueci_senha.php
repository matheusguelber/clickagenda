<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexao.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . '/../vendor/autoload.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $email = trim($_POST['email'] ?? '');

        if (!$email) {
            echo json_encode(['success' => false, 'message' => 'Por favor, informe seu e-mail.']);
            exit;
        }

        // Verifica se o email existe
        $stmt = $pdo->prepare("SELECT id, nome FROM usuarios WHERE email = ?");
        $stmt->execute([$email]);
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$usuario) {
            // Por segurança, não informamos se o email existe ou não
            echo json_encode(['success' => true, 'message' => 'Se o e-mail estiver cadastrado, você receberá as instruções em breve.']);
            exit;
        }

        // Gera um token único
        $token = bin2hex(random_bytes(32));
        $expiracao = date('Y-m-d H:i:s', strtotime('+1 hour'));

        // Salva o token no banco
        $stmt = $pdo->prepare("
            INSERT INTO tokens_recuperacao (usuario_id, token, expiracao) 
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE token = ?, expiracao = ?
        ");
        $stmt->execute([$usuario['id'], $token, $expiracao, $token, $expiracao]);

        // Envia o email
        $mail = new PHPMailer(true);

        try {
            // Configurações do servidor SMTP
            $mail->isSMTP();
            $mail->Host       = 'smtp.gmail.com';
            $mail->SMTPAuth   = true;
            $mail->Username   = 'clickagenda3@gmail.com';
            $mail->Password   = 'chog xnqd ydeo pjqn';  
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = 587;
            $mail->CharSet    = 'UTF-8';

            // Remetente e destinatário
            $mail->setFrom('contato@clickagenda.com.br', 'ClickAgenda');
            $mail->addAddress($email, $usuario['nome']);

            // Conteúdo do email
            $link_recuperacao = "http://" . $_SERVER['HTTP_HOST'] . "/clickagenda/redefinir_senha.php?token=" . $token;
            
            $mail->isHTML(true);
            $mail->Subject = 'Recuperação de Senha - ClickAgenda';
            $mail->Body    = "
                <html>
                <head>
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #1a1a2e 0%, #2a2a3e 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f5f5f5; padding: 30px; border-radius: 0 0 10px 10px; }
                        .button { display: inline-block; background: #d4af37; color: #1a1a2e; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
                        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <h1>✂️ ClickAgenda</h1>
                        </div>
                        <div class='content'>
                            <h2>Olá, {$usuario['nome']}!</h2>
                            <p>Recebemos uma solicitação para redefinir sua senha.</p>
                            <p>Clique no botão abaixo para criar uma nova senha:</p>
                            <p style='text-align: center;'>
                                <a href='{$link_recuperacao}' class='button'>Redefinir Senha</a>
                            </p>
                            <p><small>Ou copie e cole este link no navegador:<br>{$link_recuperacao}</small></p>
                            <p style='color: #e74c3c; margin-top: 20px;'><strong>⚠️ Este link expira em 1 hora!</strong></p>
                            <p>Se você não solicitou esta alteração, ignore este e-mail.</p>
                        </div>
                        <div class='footer'>
                            <p>© 2025 ClickAgenda - Todos os direitos reservados</p>
                        </div>
                    </div>
                </body>
                </html>
            ";

            $mail->send();
            echo json_encode(['success' => true, 'message' => 'E-mail enviado com sucesso! Confira sua caixa de entrada.']);

        } catch (Exception $e) {
            error_log("Erro ao enviar email: {$mail->ErrorInfo}");
            echo json_encode(['success' => false, 'message' => 'Erro ao enviar e-mail. Tente novamente mais tarde.']);
        }

    } catch (PDOException $e) {
        http_response_code(500);
        error_log("Erro no banco: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Erro no servidor. Tente novamente.']);
    }
}
?>