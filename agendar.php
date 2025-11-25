<?php
require_once 'backend/conexao.php';

// 1. Identificar o Barbeiro pelo Slug na URL
$slug = $_GET['barbeiro'] ?? '';

if (!$slug) {
    die("Link inválido. Barbeiro não identificado.");
}

// Busca dados do barbeiro
$stmt = $pdo->prepare("SELECT id, nome, telefone FROM usuarios WHERE slug = ? AND tipo = 'barbeiro'");
$stmt->execute([$slug]);
$barbeiro = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$barbeiro) {
    die("Barbearia não encontrada.");
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agendar - <?php echo htmlspecialchars($barbeiro['nome']); ?></title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        /* === ESTILO VISUAL "SMART" === */
        :root { --primary: #1a1a2e; --accent: #d4af37; --bg: #f4f6f8; }
        body { font-family: 'Segoe UI', sans-serif; background: var(--bg); margin: 0; padding: 20px; display: flex; justify-content: center; }
        
        .booking-container { 
            background: white; width: 100%; max-width: 500px; border-radius: 16px; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.1); overflow: hidden; 
        }
        
        .header { background: var(--primary); color: white; padding: 2rem; text-align: center; }
        .header h1 { margin: 0; font-size: 1.5rem; }
        .header p { margin: 5px 0 0; opacity: 0.8; font-size: 0.9rem; }

        .step-box { padding: 1.5rem; border-bottom: 1px solid #eee; }
        .step-title { font-weight: bold; color: var(--primary); margin-bottom: 1rem; display: flex; align-items: center; gap: 10px; }
        .step-number { background: var(--accent); color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; }

        /* 1. Serviços */
        .service-list { display: grid; gap: 10px; }
        .service-item { 
            border: 2px solid #eee; padding: 15px; border-radius: 10px; cursor: pointer; 
            display: flex; justify-content: space-between; align-items: center; transition: 0.2s;
        }
        .service-item:hover { border-color: var(--accent); background: #fffbf0; }
        .service-item.selected { border-color: var(--accent); background: #fff9e6; box-shadow: 0 0 0 1px var(--accent); }
        
        /* 2. Calendário */
        input[type="date"] { 
            width: 100%; padding: 12px; border: 2px solid #eee; border-radius: 8px; 
            font-size: 1rem; font-family: inherit; cursor: pointer;
        }

        /* 3. Grid de Horários (O SEGREDO) */
        .time-grid { 
            display: grid; grid-template-columns: repeat(auto-fill, minmax(70px, 1fr)); gap: 10px; margin-top: 10px; 
        }
        .time-btn { 
            padding: 10px 5px; background: white; border: 1px solid #ddd; border-radius: 8px; 
            font-size: 0.9rem; cursor: pointer; text-align: center; transition: 0.2s;
        }
        .time-btn:hover { border-color: var(--accent); color: var(--accent); }
        .time-btn.selected { background: var(--accent); color: var(--primary); border-color: var(--accent); font-weight: bold; }
        
        /* Horários Bloqueados */
        .time-btn.disabled { 
            background: #f5f5f5; color: #ccc; border-color: #eee; 
            cursor: not-allowed; text-decoration: line-through; pointer-events: none;
        }

        /* Inputs de texto */
        .form-input { width: 100%; padding: 12px; border: 2px solid #eee; border-radius: 8px; margin-bottom: 10px; box-sizing: border-box; }

        .btn-submit { 
            width: 100%; padding: 15px; background: #27ae60; color: white; border: none; 
            font-size: 1.1rem; font-weight: bold; cursor: pointer; margin-top: 10px; border-radius: 0 0 16px 16px;
        }
        .btn-submit:disabled { background: #ccc; cursor: not-allowed; }
        
        .hidden { display: none; }
        .loading { text-align: center; color: #666; font-style: italic; padding: 20px; }
    </style>
</head>
<body>

<div class="booking-container">
    <div class="header">
        <h1><i class="fas fa-cut"></i> <?php echo htmlspecialchars($barbeiro['nome']); ?></h1>
        <p>Agende seu horário em segundos</p>
    </div>

    <form id="booking-form">
        <input type="hidden" id="barbeiro_id" name="barbeiro_id" value="<?php echo $barbeiro['id']; ?>">
        <input type="hidden" id="servico_id" name="servico_id" required>
        <input type="hidden" id="hora_input" name="hora" required>

        <div class="step-box">
            <div class="step-title"><span class="step-number">1</span> Escolha o Serviço</div>
            <div id="lista-servicos" class="service-list">
                <div class="loading">Carregando serviços...</div>
            </div>
        </div>

        <div class="step-box">
            <div class="step-title"><span class="step-number">2</span> Escolha o Dia</div>
            <input type="date" id="data_input" name="data" required min="<?php echo date('Y-m-d'); ?>">
        </div>

        <div class="step-box" id="step-horarios" style="opacity: 0.5; pointer-events: none;">
            <div class="step-title"><span class="step-number">3</span> Escolha o Horário</div>
            <div id="grid-horarios" class="time-grid">
                <p style="grid-column: 1/-1; color: #888; font-size: 0.9rem;">Selecione uma data acima para ver os horários.</p>
            </div>
        </div>

        <div class="step-box">
            <div class="step-title"><span class="step-number">4</span> Seus Dados</div>
            <input type="text" name="cliente_nome" class="form-input" placeholder="Seu Nome Completo" required>
            <input type="tel" name="cliente_telefone" id="phone" class="form-input" placeholder="Seu WhatsApp (00) 00000-0000" required>
            <input type="text" name="observacoes" class="form-input" placeholder="Alguma observação? (Opcional)">
        </div>

        <button type="submit" class="btn-submit">CONFIRMAR AGENDAMENTO</button>
    </form>
</div>

<script>
const barbeiroId = document.getElementById('barbeiro_id').value;
const dataInput = document.getElementById('data_input');
const gridHorarios = document.getElementById('grid-horarios');
const stepHorarios = document.getElementById('step-horarios');

// 1. CARREGAR SERVIÇOS
fetch(`backend/listar_servicos_publico.php?barbeiro_id=${barbeiroId}`)
    .then(res => res.json())
    .then(data => {
        const container = document.getElementById('lista-servicos');
        container.innerHTML = '';
        
        if(data.success && data.servicos.length > 0) {
            data.servicos.forEach(s => {
                const div = document.createElement('div');
                div.className = 'service-item';
                div.innerHTML = `
                    <span><strong>${s.nome_servico}</strong> <small>(${s.duracao_minutos} min)</small></span>
                    <span style="color: var(--accent); font-weight: bold;">R$ ${parseFloat(s.preco).toFixed(2)}</span>
                `;
                div.onclick = () => {
                    document.querySelectorAll('.service-item').forEach(el => el.classList.remove('selected'));
                    div.classList.add('selected');
                    document.getElementById('servico_id').value = s.id;
                };
                container.appendChild(div);
            });
        } else {
            container.innerHTML = '<p>Nenhum serviço disponível.</p>';
        }
    });

// 2. QUANDO MUDAR A DATA -> CARREGAR HORÁRIOS
dataInput.addEventListener('change', async function() {
    const data = this.value;
    if(!data) return;

    stepHorarios.style.opacity = '1';
    stepHorarios.style.pointerEvents = 'auto';
    gridHorarios.innerHTML = '<div class="loading">Verificando disponibilidade...</div>';

    try {
        // A. Buscar regra do dia (Aberto/Fechado)
        const reqRegra = await fetch(`backend/obter_horarios.php?barbeiro_id=${barbeiroId}&data=${data}`);
        const regra = await reqRegra.json();

        if(!regra.sucesso || regra.aberto == 0) {
            gridHorarios.innerHTML = '<p style="color: #e74c3c; grid-column: 1/-1; text-align: center;">🚫 Fechado neste dia.</p>';
            return;
        }

        // B. Buscar horários ocupados
        const reqOcupados = await fetch(`backend/buscar_horarios_ocupados.php?barbeiro_id=${barbeiroId}&data=${data}`);
        const ocupados = await reqOcupados.json(); 

        // C. Gerar Botões
        gerarBotoesHorario(regra.hora_inicio, regra.hora_fim, ocupados, data);

    } catch (err) {
        gridHorarios.innerHTML = '<p>Erro ao carregar horários.</p>';
    }
});

function gerarBotoesHorario(inicio, fim, ocupados, dataSelecionada) {
    gridHorarios.innerHTML = '';
    
    let atual = new Date(`2000-01-01T${inicio}`);
    let final = new Date(`2000-01-01T${fim}`);
    let agora = new Date();
    let temHorario = false;

    // Loop de 30 em 30 minutos
    while (atual < final) {
        let horaString = atual.toTimeString().substring(0, 5); // "09:00"
        
        // Verifica passado (se for hoje e hora já passou)
        let bloqueado = false;
        if (new Date().toISOString().split('T')[0] === dataSelecionada) {
            let dataSlot = new Date(`${dataSelecionada}T${horaString}`);
            if (dataSlot < agora) bloqueado = true;
        }

        // Verifica se já está agendado
        if (ocupados.includes(horaString)) bloqueado = true;

        // Cria o botão
        const btn = document.createElement('div');
        btn.className = `time-btn ${bloqueado ? 'disabled' : ''}`;
        btn.innerText = horaString;

        if (!bloqueado) {
            btn.onclick = () => {
                document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                document.getElementById('hora_input').value = horaString;
            };
            temHorario = true;
        }

        gridHorarios.appendChild(btn);
        atual.setMinutes(atual.getMinutes() + 30); // Incremento de 30 min
    }

    if (!temHorario) {
        gridHorarios.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Sem horários vagos hoje.</p>';
    }
}

// 3. ENVIAR FORMULÁRIO
document.getElementById('booking-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    if(!document.getElementById('servico_id').value) { alert('Selecione um serviço!'); return; }
    if(!document.getElementById('hora_input').value) { alert('Selecione um horário!'); return; }

    const btn = document.querySelector('.btn-submit');
    const textoOriginal = btn.innerText;
    btn.innerText = 'AGENDANDO...';
    btn.disabled = true;

    const formData = new FormData(this);

    fetch('backend/processar_agendamento.php', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if(data.success) {
            alert('✅ Agendamento realizado com sucesso!');
            window.location.reload();
        } else {
            alert('❌ ' + data.message);
            btn.innerText = textoOriginal;
            btn.disabled = false;
        }
    })
    .catch(err => {
        alert('Erro ao processar.');
        btn.innerText = textoOriginal;
        btn.disabled = false;
    });
});

// Máscara Telefone
document.getElementById('phone').addEventListener('input', function (e) {
    var x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
    e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
});
</script>

</body>
</html>