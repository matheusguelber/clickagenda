<?php
require_once __DIR__ . '/backend/conexao.php';

$slug = $_GET['barbeiro'] ?? '';

if (!$slug) {
    die('Link inválido. Verifique se copiou corretamente.');
}

$stmt = $pdo->prepare("SELECT id, nome, telefone FROM usuarios WHERE slug = ? AND tipo = 'barbeiro'");
$stmt->execute([$slug]);
$barbeiro = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$barbeiro) {
    die('Barbearia não encontrada.');
}

$stmt = $pdo->prepare("SELECT id, nome_servico, preco, duracao_minutos FROM servicos WHERE barbeiro_id = ? ORDER BY nome_servico");
$stmt->execute([$barbeiro['id']]);
$servicos = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agendar com <?php echo htmlspecialchars($barbeiro['nome']); ?></title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <link rel="stylesheet" href="css/style.css">
    <style>
        .booking-page {
            min-height: 100vh;
            background: linear-gradient(135deg, var(--primary) 0%, #2a2a3e 100%);
            padding: 2rem 0;
        }
        
        .booking-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            padding: 2rem;
            box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        }
        
        .barbershop-header {
            text-align: center;
            margin-bottom: 2rem;
            padding-bottom: 2rem;
            border-bottom: 2px solid var(--bg);
        }
        
        .barbershop-header h1 {
            color: var(--primary);
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
        }
        
        .barbershop-header h1 i {
            color: var(--secondary);
        }
        
        .barbershop-header p {
            color: var(--text-light);
        }
        
        .service-selection {
            margin-bottom: 2rem;
        }
        
        .service-option {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 1rem;
            border: 2px solid var(--bg);
            border-radius: 8px;
            margin-bottom: 0.75rem;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .service-option:hover {
            border-color: var(--secondary);
            background: #fff9e6;
        }
        
        .service-option.selected {
            border-color: var(--secondary);
            background: #fff9e6;
        }
        
        .service-option input[type="radio"] {
            margin-right: 1rem;
        }
        
        .service-info h4 {
            color: var(--primary);
            margin-bottom: 0.25rem;
        }
        
        .service-details {
            display: flex;
            gap: 1rem;
            color: var(--text-light);
            font-size: 0.9rem;
        }
        
        .service-price {
            font-size: 1.25rem;
            font-weight: bold;
            color: var(--secondary);
        }
        
        .success-message {
            display: none;
            text-align: center;
            padding: 2rem;
        }
        
        .success-message.active {
            display: block;
        }
        
        .success-message i {
            font-size: 4rem;
            color: #27ae60;
            margin-bottom: 1rem;
        }
        
        .success-message h3 {
            color: var(--primary);
            margin-bottom: 1rem;
        }
    </style>
</head>
<body>
    <div class="booking-page">
        <div class="booking-container">
            <div class="barbershop-header">
                <h1>
                    <i class="fas fa-cut"></i>
                    <?php echo htmlspecialchars($barbeiro['nome']); ?>
                </h1>
                <p>Escolha o serviço e agende seu horário</p>
            </div>

            <form id="booking-form" class="booking-form">
                <input type="hidden" name="barbeiro_id" value="<?php echo $barbeiro['id']; ?>">
                
                <div class="form-group">
                    <label>Seu Nome Completo</label>
                    <input type="text" name="cliente_nome" placeholder="Digite seu nome" required>
                </div>

                <div class="form-group">
                    <label>Seu WhatsApp</label>
                    <input type="tel" name="cliente_telefone" placeholder="(00) 00000-0000" required>
                </div>

                <div class="service-selection">
                    <label style="display: block; margin-bottom: 1rem; font-weight: 600; color: var(--primary);">
                        Escolha o Serviço
                    </label>
                    
                    <?php if (empty($servicos)): ?>
                        <p style="color: var(--text-light); text-align: center; padding: 2rem;">
                            Esta barbearia ainda não cadastrou serviços.
                        </p>
                    <?php else: ?>
                        <?php foreach ($servicos as $servico): ?>
                            <label class="service-option">
                                <div style="display: flex; align-items: center; gap: 1rem; flex: 1;">
                                    <input type="radio" name="servico_id" value="<?php echo $servico['id']; ?>" required>
                                    <div class="service-info">
                                        <h4><?php echo htmlspecialchars($servico['nome_servico']); ?></h4>
                                        <div class="service-details">
                                            <span><i class="fas fa-clock"></i> <?php echo $servico['duracao_minutos']; ?> min</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="service-price">
                                    R$ <?php echo number_format($servico['preco'], 2, ',', '.'); ?>
                                </div>
                            </label>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </div>

                <div class="form-group">
                    <label>Data do Agendamento</label>
                    <input type="date" name="data" required min="<?php echo date('Y-m-d'); ?>">
                </div>

                <div class="form-group">
                    <label>Horário Preferido</label>
                    <input type="time" name="hora" required>
                </div>

                <div class="form-group">
                    <label>Observações (opcional)</label>
                    <textarea name="observacoes" rows="3" placeholder="Alguma observação especial?"></textarea>
                </div>

                <button type="submit" class="btn btn-primary" style="width: 100%;">
                    <i class="fas fa-check-circle"></i> Confirmar Agendamento
                </button>
            </form>

            <div class="success-message" id="success-message">
                <i class="fas fa-check-circle"></i>
                <h3>Agendamento Realizado!</h3>
                <p>Em breve você receberá uma confirmação no WhatsApp.</p>
                <button class="btn btn-secondary" onclick="location.reload()">
                    Fazer Outro Agendamento
                </button>
            </div>
        </div>
    </div>

    <script>
        document.getElementById('booking-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            
            fetch('backend/processar_agendamento.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    document.querySelector('.booking-form').style.display = 'none';
                    document.getElementById('success-message').classList.add('active');
                } else {
                    alert('Erro: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Erro:', error);
                alert('Erro ao processar agendamento. Tente novamente.');
            });
        });

        document.querySelectorAll('.service-option').forEach(option => {
            option.addEventListener('click', function() {
                document.querySelectorAll('.service-option').forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');
            });
        });
    </script>
</body>
</html>