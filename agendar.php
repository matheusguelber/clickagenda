<?php
// Exibe erros para facilitar o debug (remova depois se quiser)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Usa __DIR__ para garantir que o caminho funcione no Linux/Ubuntu
require_once __DIR__ . '/backend/conexao.php';

$slug = $_GET['barbeiro'] ?? '';
if (!$slug) { die("Link inválido."); }

try {
    $api = new SupabaseAPI();

    // BUSCA O BARBEIRO
    // Removi o filtro 'tipo' => 'barbeiro' para evitar erro caso o cadastro esteja como 'admin' ou outro
    // Buscamos apenas pelo SLUG que é único.
    $barbeiro = $api->selectOne('usuarios', ['slug' => $slug]);

    if (!$barbeiro) { 
        // Debug detalhado se não encontrar
        echo "<h3>Barbearia não encontrada.</h3>";
        echo "<p>O sistema buscou pelo slug: <strong>" . htmlspecialchars($slug) . "</strong></p>";
        echo "<p>Verifique no Supabase se a coluna 'slug' está exatamente igual (sem espaços extras).</p>";
        exit;
    }

} catch (Exception $e) {
    die("Erro na API: " . $e->getMessage());
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agendar - <?php echo htmlspecialchars($barbeiro['nome']); ?></title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <link rel="stylesheet" href="css/toast.css">
    <style>
        :root { --primary: #1a1a2e; --accent: #d4af37; --bg: #f4f6f8; }
        body { font-family: 'Segoe UI', sans-serif; background: var(--bg); margin: 0; padding: 20px; display: flex; justify-content: center; }
        .booking-container { background: white; width: 100%; max-width: 500px; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: var(--primary); color: white; padding: 2rem; text-align: center; }
        .header h1 { margin: 0; font-size: 1.5rem; }
        .header p { margin: 5px 0 0; opacity: 0.8; font-size: 0.9rem; }
        .step-box { padding: 1.5rem; border-bottom: 1px solid #eee; }
        .step-title { font-weight: bold; color: var(--primary); margin-bottom: 1rem; display: flex; align-items: center; gap: 10px; }
        .step-number { background: var(--accent); color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; }
        .service-list { display: grid; gap: 10px; }
        .service-item { border: 2px solid #eee; padding: 15px; border-radius: 10px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: 0.2s; }
        .service-item:hover { border-color: var(--accent); background: #fffbf0; }
        .service-item.selected { border-color: var(--accent); background: #fff9e6; box-shadow: 0 0 0 1px var(--accent); }
        input[type="date"], .form-input { width: 100%; padding: 12px; border: 2px solid #eee; border-radius: 8px; font-size: 1rem; font-family: inherit; box-sizing: border-box; margin-bottom: 10px; }
        .time-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(70px, 1fr)); gap: 10px; margin-top: 10px; }
        .time-btn { padding: 10px 5px; background: white; border: 1px solid #ddd; border-radius: 8px; font-size: 0.9rem; cursor: pointer; text-align: center; transition: 0.2s; }
        .time-btn:hover { border-color: var(--accent); color: var(--accent); }
        .time-btn.selected { background: var(--accent); color: var(--primary); border-color: var(--accent); font-weight: bold; }
        .time-btn.disabled { background: #f5f5f5; color: #ccc; border-color: #eee; cursor: not-allowed; text-decoration: line-through; pointer-events: none; }
        .btn-submit { width: 100%; padding: 15px; background: #27ae60; color: white; border: none; font-size: 1.1rem; font-weight: bold; cursor: pointer; margin-top: 10px; border-radius: 0 0 16px 16px; }
        .btn-submit:disabled { background: #ccc; cursor: not-allowed; }
        .loading { text-align: center; color: #666; font-style: italic; padding: 20px; }
    </style>
</head>
<body>
<div id="toast-container"></div>
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
            <div id="lista-servicos" class="service-list"><div class="loading">Carregando...</div></div>
        </div>
        <div class="step-box">
            <div class="step-title"><span class="step-number">2</span> Escolha o Dia</div>
            <input type="date" id="data_input" name="data" required min="<?php echo date('Y-m-d'); ?>">
        </div>
        <div class="step-box" id="step-horarios" style="opacity: 0.5; pointer-events: none;">
            <div class="step-title"><span class="step-number">3</span> Escolha o Horário</div>
            <div id="grid-horarios" class="time-grid"><p style="grid-column: 1/-1; color: #888; font-size: 0.9rem;">Selecione uma data acima.</p></div>
        </div>
        <div class="step-box">
            <div class="step-title"><span class="step-number">4</span> Seus Dados</div>
            <input type="text" name="cliente_nome" class="form-input" placeholder="Seu Nome Completo" required>
            <input type="tel" name="cliente_telefone" id="phone" class="form-input" placeholder="WhatsApp (00) 00000-0000" required>
            <input type="text" name="observacoes" class="form-input" placeholder="Observações (Opcional)">
        </div>
        <button type="submit" class="btn-submit">CONFIRMAR AGENDAMENTO</button>
    </form>

    <div id="success-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 10000; align-items: center; justify-content: center;">
        <div style="background: white; border-radius: 16px; padding: 2rem; max-width: 400px; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
            <div style="font-size: 3rem; margin-bottom: 1rem;">✅</div>
            <h2 style="color: #27ae60; margin-top: 0; margin-bottom: 1.5rem; font-size: 1.5rem;">Agendamento Confirmado!</h2>
            
            <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem; text-align: left;">
                <p style="margin: 0 0 0.75rem 0; color: #666;"><strong>Nome:</strong> <span id="success-nome"></span></p>
                <p style="margin: 0 0 0.75rem 0; color: #666;"><strong>Telefone:</strong> <span id="success-telefone"></span></p>
                <p style="margin: 0 0 0.75rem 0; color: #666;"><strong>Serviço:</strong> <span id="success-servico"></span></p>
                <p style="margin: 0 0 0.75rem 0; color: #666;"><strong>Data:</strong> <span id="success-data"></span></p>
                <p style="margin: 0; color: #666;"><strong>Horário:</strong> <span id="success-hora"></span></p>
            </div>
            
            <p style="color: #666; font-size: 0.9rem; margin-bottom: 1.5rem;">Você receberá um WhatsApp de confirmação em breve!</p>
            
            <button onclick="document.getElementById('success-modal').style.display='none'; document.getElementById('booking-form').reset(); setTimeout(() => window.location.reload(), 300);" style="background: #27ae60; color: white; border: none; padding: 12px 30px; border-radius: 8px; font-size: 1rem; font-weight: bold; cursor: pointer;">OK</button>
        </div>
    </div>
</div>
<script>
// ===== FUNÇÃO DE TOAST SIMPLES =====
function showToastError(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-left: 4px solid #e74c3c;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        font-family: Arial, sans-serif;
    `;
    toast.innerHTML = `
        <strong style="color: #e74c3c;">❌ Erro</strong><br>
        <small style="color: #666;">${message}</small>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
}

// ===== SCRIPT DE AGENDAMENTO =====

const barbeiroId = document.getElementById('barbeiro_id').value;
const dataInput = document.getElementById('data_input');
const gridHorarios = document.getElementById('grid-horarios');
const stepHorarios = document.getElementById('step-horarios');

fetch(`backend/listar_servicos_publico.php?barbeiro_id=${barbeiroId}&t=${Date.now()}`)
    .then(res => res.json())
    .then(data => {
        const container = document.getElementById('lista-servicos');
        container.innerHTML = '';
        
        if(Array.isArray(data) && data.length > 0) {
            data.forEach(s => {
                const div = document.createElement('div');
                div.className = 'service-item';
                
                const precoFormatado = parseFloat(s.preco).toFixed(2);
                
                div.innerHTML = `
                    <span>
                        <strong>${s.nome_servico}</strong> 
                        <small>(${s.duracao || s.duracao_minutos} min)</small>
                    </span>
                    <span style="color: var(--accent); font-weight: bold;">R$ ${precoFormatado}</span>
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
    })
    .catch(err => {
        console.error(err);
        document.getElementById('lista-servicos').innerHTML = '<p>Erro ao carregar serviços.</p>';
    });

dataInput.addEventListener('change', async function() {
    const data = this.value;
    if(!data) return;
    stepHorarios.style.opacity = '1'; stepHorarios.style.pointerEvents = 'auto';
    gridHorarios.innerHTML = '<div class="loading">Verificando...</div>';
    try {
        const reqRegra = await fetch(`backend/obter_horarios.php?barbeiro_id=${barbeiroId}&data=${data}`);
        const regra = await reqRegra.json();
        if(!regra.sucesso || regra.aberto == 0) {
            gridHorarios.innerHTML = '<p style="color: #e74c3c; grid-column: 1/-1; text-align: center;">🚫 Fechado neste dia.</p>'; return;
        }
        const reqOcupados = await fetch(`backend/buscar_horarios_ocupados.php?barbeiro_id=${barbeiroId}&data=${data}`);
        const ocupados = await reqOcupados.json();
        gerarBotoesHorario(regra.hora_inicio, regra.hora_fim, ocupados, data);
    } catch (err) { gridHorarios.innerHTML = '<p>Erro ao carregar horários.</p>'; }
});

function gerarBotoesHorario(inicio, fim, ocupados, dataSelecionada) {
    gridHorarios.innerHTML = '';
    let atual = new Date(`2000-01-01T${inicio}`);
    let final = new Date(`2000-01-01T${fim}`);
    let agora = new Date();
    let temHorario = false;
    while (atual < final) {
        let horaString = atual.toTimeString().substring(0, 5);
        let bloqueado = false;
        if (new Date().toISOString().split('T')[0] === dataSelecionada) {
            let dataSlot = new Date(`${dataSelecionada}T${horaString}`);
            if (dataSlot < agora) bloqueado = true;
        }
        if (ocupados && ocupados.includes(horaString)) bloqueado = true;
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
        atual.setMinutes(atual.getMinutes() + 30);
    }
    if (!temHorario) gridHorarios.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Sem horários vagos.</p>';
}

document.getElementById('booking-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Validações
    if(!document.getElementById('servico_id').value) { 
        showToastError('Selecione um serviço!');
        return; 
    }
    if(!document.getElementById('hora_input').value) { 
        showToastError('Selecione um horário!');
        return; 
    }
    
    const btn = document.querySelector('.btn-submit');
    const textoOriginal = btn.innerText;
    btn.innerText = 'AGENDANDO...'; 
    btn.disabled = true;
    
    fetch('backend/processar_agendamento.php', { 
        method: 'POST', 
        body: new FormData(this) 
    })
    .then(res => res.json())
    .then(data => {
        if(data.success) {
            const formData = new FormData(document.getElementById('booking-form'));
            const nomeServico = document.querySelector('.service-item.selected span strong').textContent;
            const dataParts = formData.get('data').split('-');
            const dataFormatada = `${dataParts[2]}/${dataParts[1]}/${dataParts[0]}`;
            
            document.getElementById('success-nome').textContent = formData.get('cliente_nome');
            document.getElementById('success-telefone').textContent = formData.get('cliente_telefone');
            document.getElementById('success-servico').textContent = nomeServico;
            document.getElementById('success-data').textContent = dataFormatada;
            document.getElementById('success-hora').textContent = formData.get('hora');
            
            document.getElementById('success-modal').style.display = 'flex';
        } else {
            showToastError(data.message || 'Erro ao processar o agendamento');
            btn.innerText = textoOriginal; 
            btn.disabled = false;
        }
    })
    .catch(err => { 
        console.error(err);
        showToastError('Erro de conexão ao processar.'); 
        btn.innerText = textoOriginal; 
        btn.disabled = false; 
    });
});

document.addEventListener('click', function(e) {
    if (e.target && e.target.textContent.includes('OK') && 
        e.target.parentElement && e.target.parentElement.id === 'success-modal') {
        document.getElementById('booking-form').reset();
        document.getElementById('success-modal').style.display = 'none';
        setTimeout(() => { window.location.reload(); }, 300);
    }
});
document.getElementById('phone').addEventListener('input', function (e) {
    var x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
    e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
});
</script>
<script src="js/toast.js"></script>
</body>
</html>