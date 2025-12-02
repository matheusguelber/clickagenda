// ===== NAVEGAÇÃO E VISUALIZAÇÃO =====

function showDashboard() {
    // Verifica se o usuário está logado
    const userId = localStorage.getItem('user_id');
    const userTipo = localStorage.getItem('user_tipo');
    
    if (!userId || !userTipo) {
        // Se não estiver logado, abre o modal de login
        showModal('login');
        return;
    }
    
    // Se estiver logado, mostra o dashboard
    document.querySelector('.hero').classList.add('hidden');
    document.querySelector('.features').classList.add('hidden');
    
    if (userTipo === 'barbeiro') {
        document.getElementById('dashboard-barbeiro').classList.remove('hidden');
        carregarDadosDashboard();
    } else {
        alert("Dashboard de cliente ainda não implementado.");
    }
}

function showLogin() {
    showModal('login');
}

/**
 * Alterna entre seções do dashboard
 * @param {string} section - Nome da seção a ser exibida
 */
function showSection(section) {
    // 1. Atualiza a Sidebar (Visual do botão ativo)
    const sidebarItems = document.querySelectorAll('#dashboard-barbeiro .sidebar-item');
    sidebarItems.forEach(item => item.classList.remove('active'));
    
    // Adiciona classe active ao item clicado
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    } else if (event && event.target) {
        // Fallback caso o currentTarget não seja capturado
        const item = event.target.closest('.sidebar-item');
        if(item) item.classList.add('active');
    }

    // 2. ESCONDE TODAS AS SEÇÕES
    const sections = [
        'overview-section',
        'appointments-section', 
        'clients-section',
        'services-section',
        'my-link-section',
        'settings-section'
    ];
    
    sections.forEach(sectionId => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.classList.add('hidden');
        }
    });

    // 3. MOSTRA APENAS A SEÇÃO ESCOLHIDA
    let targetSection = null;
    
    switch(section) {
        case 'overview':
            targetSection = document.getElementById('overview-section');
            if (targetSection) {
                targetSection.classList.remove('hidden');
                carregarDadosDashboard();
            }
            break;
            
        case 'appointments':
            targetSection = document.getElementById('appointments-section');
            if (targetSection) {
                targetSection.classList.remove('hidden');
                carregarTodosAgendamentos();
            }
            break;
            
        case 'clients':
            targetSection = document.getElementById('clients-section');
            if (targetSection) {
                targetSection.classList.remove('hidden');
                carregarClientes();
            }
            break;
            
        case 'services':
            targetSection = document.getElementById('services-section');
            if (targetSection) {
                targetSection.classList.remove('hidden');
                carregarServicos();
            }
            break;
            
        case 'my-link':
            targetSection = document.getElementById('my-link-section');
            if (targetSection) {
                targetSection.classList.remove('hidden');
                carregarLinkAgendamento();
                carregarConfiguracoesHorario(); 
            }
            break;

        case 'settings':
            targetSection = document.getElementById('settings-section');
            if (targetSection) {
                targetSection.classList.remove('hidden');
            }
            break;
            
        default:
            targetSection = document.getElementById('overview-section');
            if (targetSection) {
                targetSection.classList.remove('hidden');
                carregarDadosDashboard();
            }
    }
}

// ===== MODAIS =====

// ==================================================
// CONTROLE DE MODAIS (COM SUPORTE AO BOTÃO VOLTAR)
// ==================================================

function showModal(modalId) {
    const modal = document.getElementById(modalId + '-modal');
    if (modal) {
        modal.classList.add('active');
        
        // TRUQUE: Adiciona um estado no histórico do navegador
        // Isso faz o botão "Voltar" do celular fechar o modal em vez de sair do site
        window.history.pushState({ modalOpen: true, id: modalId }, "");
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId + '-modal');
    
    // Se o modal estiver aberto, fecha
    if (modal && modal.classList.contains('active')) {
        // Volta o histórico manualmente (simula o botão voltar)
        // Isso dispara o evento 'popstate' abaixo, que fecha o modal visualmente
        window.history.back();
    }
}

// Escuta quando o usuário aperta o botão "Voltar" do celular ou navegador
window.addEventListener('popstate', function(event) {
    // Procura qualquer modal que esteja aberto
    const openModals = document.querySelectorAll('.modal.active');
    
    if (openModals.length > 0) {
        // Se tiver modal aberto, fecha ele visualmente
        openModals.forEach(modal => modal.classList.remove('active'));
    } else {
        // Se não tiver modal, segue a navegação normal (troca de abas)
        checkUrlHash();
    }
});

// Fecha ao clicar fora (Fundo escuro)
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        // Se clicar no fundo escuro, simula o botão voltar para fechar
        window.history.back();
    }
}

// ===== FORMULÁRIOS =====

function initializeForms() {
    const appointmentForm = document.getElementById('appointment-form');
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            criarAgendamentoManual();
        });
    }
}

// Função para abrir o modal e carregar dados
function abrirModalNovoAgendamento() {
    carregarClientesParaAgendamento();
    carregarServicosParaAgendamento();
    
    // Define data mínima como hoje
    const inputData = document.querySelector('#appointment-form input[name="data"]');
    if (inputData) {
        const hoje = new Date().toISOString().split('T')[0];
        inputData.setAttribute('min', hoje);
        inputData.value = hoje;
    }
    
    showModal('new-appointment');
}

// Carrega clientes do banco de dados
function carregarClientesParaAgendamento() {
    const selectCliente = document.querySelector('#appointment-form select[name="cliente"]');
    if (!selectCliente) return;
    
    selectCliente.innerHTML = '<option value="">Carregando clientes...</option>';
    
    fetch('backend/listar_clientes_para_agendamento.php')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.clientes) {
                if (data.clientes.length === 0) {
                    selectCliente.innerHTML = '<option value="">Nenhum cliente cadastrado ainda</option>';
                    return;
                }
                
                selectCliente.innerHTML = '<option value="">Selecione o cliente</option>';
                
                data.clientes.forEach(cliente => {
                    const option = document.createElement('option');
                    option.value = `${cliente.cliente_nome}|${cliente.cliente_telefone}`;
                    option.textContent = `${cliente.cliente_nome} - ${cliente.cliente_telefone}`;
                    selectCliente.appendChild(option);
                });
                
                // Adiciona opção para novo cliente
                const optionNovo = document.createElement('option');
                optionNovo.value = 'novo';
                optionNovo.textContent = '+ Adicionar Novo Cliente';
                optionNovo.style.fontWeight = 'bold';
                optionNovo.style.color = '#d4af37';
                selectCliente.appendChild(optionNovo);
            } else {
                selectCliente.innerHTML = '<option value="">Erro ao carregar clientes</option>';
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            selectCliente.innerHTML = '<option value="">Erro ao carregar clientes</option>';
        });
}

// Carrega serviços do banco de dados
function carregarServicosParaAgendamento() {
    const selectServico = document.querySelector('#appointment-form select[name="servico_id"]');
    if (!selectServico) return;
    
    selectServico.innerHTML = '<option value="">Carregando serviços...</option>';
    
    fetch('backend/listar_servicos.php')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.servicos) {
                if (data.servicos.length === 0) {
                    selectServico.innerHTML = '<option value="">Nenhum serviço cadastrado</option>';
                    const mensagem = document.createElement('p');
                    mensagem.style.color = '#e74c3c';
                    mensagem.style.fontSize = '0.9rem';
                    mensagem.style.marginTop = '0.5rem';
                    mensagem.innerHTML = '⚠️ Cadastre seus serviços primeiro na aba "Serviços"';
                    selectServico.parentElement.appendChild(mensagem);
                    return;
                }
                
                selectServico.innerHTML = '<option value="">Selecione o serviço</option>';
                
                data.servicos.forEach(servico => {
                    const option = document.createElement('option');
                    option.value = servico.id;
                    const preco = parseFloat(servico.preco).toFixed(2).replace('.', ',');
                    option.textContent = `${servico.nome_servico} - R$ ${preco} (${servico.duracao_minutos} min)`;
                    selectServico.appendChild(option);
                });
            } else {
                selectServico.innerHTML = '<option value="">Erro ao carregar serviços</option>';
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            selectServico.innerHTML = '<option value="">Erro ao carregar serviços</option>';
        });
}

// Cria agendamento manual
function criarAgendamentoManual() {
    const form = document.getElementById('appointment-form');
    const formData = new FormData(form);
    
    const clienteSelect = document.getElementById('cliente-select');
    const clienteValue = clienteSelect.value;
    
    // Validação específica
    if (clienteValue === 'novo') {
        const nome = formData.get('novo_nome');
        const tel = formData.get('novo_telefone');
        if (!nome || !tel || tel.length < 10) {
            alert("Por favor, preencha o nome e telefone do novo cliente.");
            return;
        }
        // Substitui o valor "novo" pelos dados reais para o backend
        formData.set('cliente', `${nome}|${tel}`);
    } else if (!clienteValue) {
        alert('Selecione um cliente.');
        return;
    }
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
    
    fetch('backend/criar_agendamento_manual.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("✅ " + data.message);
            closeModal('new-appointment');
            form.reset();
            document.getElementById('novos-campos-cliente').style.display = 'none'; // Esconde de novo
            
            carregarTodosAgendamentos();
            carregarProximosAgendamentos();
            carregarEstatisticas();
            
            // Se cadastrou novo, recarrega a lista de clientes para aparecer na próxima
            if(clienteValue === 'novo') carregarClientesParaAgendamento();
            
        } else {
            alert("❌ Erro: " + data.message);
        }
    })
    .catch(error => {
        console.error(error);
        alert('Erro de conexão.');
    })
    .finally(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    });
}

// ===== AGENDAMENTOS =====

function editAppointment(appointmentId) {
    alert('Funcionalidade de edição em desenvolvimento! ID: ' + appointmentId);
}

function deleteAppointment(appointmentId) {
    if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
        console.log('Deletando agendamento (visual):', appointmentId);
    }
}

// (Mantenha todo o código anterior de NAVEGAÇÃO, MODAIS, FORMS, AGENDAMENTOS e CLIENTES igual ao que te mandei antes, até chegar na parte de SERVIÇOS)

// ===== SERVIÇOS (Atualizado) =====

function toggleService(serviceCard) {
    serviceCard.classList.toggle('selected');
}

function initializeServiceForm() {
    const serviceForm = document.getElementById('form-adicionar-servico');
    
    if (serviceForm) {
        serviceForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            
            fetch('backend/adicionar_servico.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                if (data.success) {
                    serviceForm.reset();
                    carregarServicos();
                }
            });
        });
    }
    const editForm = document.getElementById('form-editar-servico');
    if (editForm) {
        editForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            
            fetch('backend/editar_servico.php', {
                method: 'POST',
                body: formData
            })
            .then(res => res.json())
            .then(data => {
                alert(data.message);
                if(data.success) {
                    closeModal('edit-service');
                    carregarServicos(); 
                }
            });
        });
    }
}

function carregarServicos() {
    const listaDiv = document.getElementById('lista-de-servicos');
    if (!listaDiv) return;

    listaDiv.innerHTML = '<p>Atualizando lista...</p>';

    // O TRUQUE ANTI-CACHE
    const timestamp = new Date().getTime();

    fetch('backend/listar_servicos.php?t=' + timestamp)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                listaDiv.innerHTML = ''; 
                
                if (data.servicos.length === 0) {
                    listaDiv.innerHTML = '<p>Ainda não tens serviços cadastrados.</p>';
                    return;
                }

                data.servicos.forEach(servico => {
                    const precoFormatado = new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                    }).format(servico.preco);

                    const servicoHTML = `
                        <div class="service-card" style="position: relative;">
                            <h4><i class="fas fa-cut"></i> ${servico.nome_servico}</h4>
                            <div class="service-price">${precoFormatado}</div>
                            <p style="margin-bottom: 10px;">Duração: ${servico.duracao_minutos} min</p>
                            
                            <div style="border-top: 1px solid #eee; padding-top: 10px; display: flex; gap: 10px; justify-content: flex-end;">
                                <button class="btn-icon btn-edit" 
                                    onclick="abrirModalEditarServico(${servico.id}, '${servico.nome_servico}', ${servico.preco}, ${servico.duracao_minutos})" 
                                    title="Editar">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn-icon btn-delete" 
                                    onclick="excluirServico(${servico.id})" 
                                    title="Excluir">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    `;
                    listaDiv.innerHTML += servicoHTML;
                });
                
            } else {
                listaDiv.innerHTML = `<p style="color: red;">${data.message}</p>`;
            }
        });
}

function abrirModalEditarServico(id, nome, preco, duracao) {
    document.getElementById('edit-servico-id').value = id;
    document.getElementById('edit-servico-nome').value = nome;
    document.getElementById('edit-servico-preco').value = preco;
    document.getElementById('edit-servico-duracao').value = duracao;
    showModal('edit-service');
}

function excluirServico(id) {
    if(confirm("Tem certeza que deseja excluir este serviço?")) {
        const formData = new FormData();
        formData.append('id', id);

        fetch('backend/excluir_servico.php', {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            alert(data.message);
            if(data.success) {
                carregarServicos(); 
            }
        });
    }
}

// ===== CALENDÁRIO =====
function initializeCalendar() {
    const calendarDays = document.querySelectorAll('.calendar-day');
    calendarDays.forEach(day => {
        day.addEventListener('click', function() {
            console.log('Dia selecionado:', this.textContent);
        });
    });
}

function gerarCalendarioSemana() {
    const calendarGrid = document.querySelector('.calendar-grid');
    if (!calendarGrid) return;
    
    calendarGrid.innerHTML = '';
    
    const hoje = new Date();
    const diaSemana = hoje.getDay(); 
    const domingo = new Date(hoje);
    domingo.setDate(hoje.getDate() - diaSemana);
    
    const diasSemana = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
    
    for (let i = 0; i < 7; i++) {
        const dia = new Date(domingo);
        dia.setDate(domingo.getDate() + i);
        
        const diaNumero = dia.getDate();
        const mesAtual = dia.getMonth() === hoje.getMonth();
        const ehHoje = dia.toDateString() === hoje.toDateString();
        
        const diaElement = document.createElement('div');
        diaElement.className = 'calendar-day';
        
        if (ehHoje) {
            diaElement.classList.add('today');
        }
        
        if (!mesAtual) {
            diaElement.style.opacity = '0.5';
        }
        
        diaElement.innerHTML = `
            <strong>${diasSemana[i]}</strong><br>${diaNumero}
        `;
        
        diaElement.onclick = function() {
            document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
            this.classList.add('selected');
        };
        
        calendarGrid.appendChild(diaElement);
    }
}

// ===== UTILITÁRIOS =====

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function formatDate(date) {
    return new Intl.DateTimeFormat('pt-BR').format(date);
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// ===== LOGIN / CADASTRO =====

function switchToLogin() {
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('register-form').classList.add('hidden');
}

function switchToRegister() {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.remove('hidden');
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.parentElement.querySelector('.toggle-password i');
    
    if (input.type === 'password') {
        input.type = 'text';
        button.classList.remove('fa-eye');
        button.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        button.classList.remove('fa-eye-slash');
        button.classList.add('fa-eye');
    }
}

function phoneMask(value) {
    if (!value) return '';
    value = value.replace(/\D/g, '');
    value = value.replace(/(\d{2})(\d)/, '($1) $2');
    value = value.replace(/(\d)(\d{4})$/, '$1-$2');
    return value;
}

function checkPasswordStrength(password) {
    if (!password) return { level: '', text: '' };
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/\d/)) strength++;
    if (password.match(/[^a-zA-Z\d]/)) strength++;
    
    if (strength <= 1) return { level: 'weak', text: 'Senha fraca' };
    else if (strength <= 2) return { level: 'medium', text: 'Senha média' };
    else return { level: 'strong', text: 'Senha forte! ✓' };
}

function initializeLoginForms() {
    // Máscara de telefone
    const phoneInput = document.getElementById('phone-input');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            e.target.value = phoneMask(e.target.value);
        });
    }

    // Força da senha
    const registerPassword = document.getElementById('register-password');
    const strengthContainer = document.getElementById('password-strength');
    if (registerPassword && strengthContainer) {
        registerPassword.addEventListener('input', function() {
            const strength = checkPasswordStrength(this.value);
            const fill = document.getElementById('strength-fill');
            const text = document.getElementById('strength-text');
            
            if (this.value) {
                strengthContainer.classList.add('active');
                fill.className = 'strength-fill ' + strength.level;
                text.className = 'strength-text ' + strength.level;
                text.textContent = strength.text;
            } else {
                strengthContainer.classList.remove('active');
            }
        });
    }

    // Login Submit
    // Login Submit (COM DIAGNÓSTICO DE ERRO)
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Feedback visual no botão
            const btn = this.querySelector('button[type="submit"]');
            const textoOriginal = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verificando...';
            btn.disabled = true;
            
            const formData = new FormData(this);
            
            fetch('backend/login.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.text()) // 1. Pega como TEXTO primeiro (para ver o erro)
            .then(text => {
                console.log("Resposta crua do PHP:", text); // Mostra no Console (F12)

                try {
                    // 2. Tenta transformar em JSON
                    const data = JSON.parse(text);
                    
                    if (data.success) {
                        // Sucesso! Salva os dados
                        localStorage.setItem('user_id', data.user_id);
                        localStorage.setItem('user_nome', data.nome);
                        localStorage.setItem('user_tipo', data.tipo);
                        localStorage.setItem('user_slug', data.slug);
                        localStorage.setItem('user_foto', data.foto || ''); // Salva a foto se tiver

                        alert(data.message);
                        closeModal('login');
                        atualizarBotaoAuth();
                        showDashboard();
                        
                        // Recarrega para aplicar as mudanças visuais
                        setTimeout(() => location.reload(), 500);
                    } else {
                        alert(data.message); // Senha errada ou usuário não encontrado
                    }
                } catch (erroJson) {
                    // 3. SE DER ERRO AQUI, O PHP QUEBROU
                    // Mostra o erro real na tela
                    alert("ERRO FATAL NO PHP:\n----------------\n" + text.substring(0, 400));
                }
            })
            .catch(err => {
                console.error(err);
                alert('Erro de conexão com o servidor (404 ou Rede).');
            })
            .finally(() => {
                // Restaura o botão
                btn.innerHTML = textoOriginal;
                btn.disabled = false;
            });
        });
    }

    // Register Submit
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-password-confirm').value;
            
            if (password !== confirmPassword) {
                alert('As senhas não coincidem!');
                return;
            }
            
            const formData = new FormData(this);
            
            fetch('backend/cadastro_usuario.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert(data.message + "\n\nAgora, faça o login para continuar.");
                    switchToLogin();
                } else {
                    alert('Erro: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Erro:', error);
                alert('Erro ao conectar ao servidor.');
            });
        });
    }

    // Recuperar Senha
    const forgotLink = document.querySelector('.forgot-link');
    if (forgotLink) {
        forgotLink.addEventListener('click', function(e) {
            e.preventDefault();
            solicitarRecuperacaoSenha();
        });
    }
}

function solicitarRecuperacaoSenha() {
    const email = prompt('Digite seu e-mail cadastrado:');
    if (!email) return;
    if (!validateEmail(email)) {
        alert('Por favor, digite um e-mail válido.');
        return;
    }
    
    const formData = new FormData();
    formData.append('email', email);
    
    fetch('backend/esqueci_senha.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => alert(data.message))
    .catch(error => alert('Erro ao conectar ao servidor.'));
}

function atualizarBotaoAuth() {
    const userId = localStorage.getItem('user_id');
    const nome = localStorage.getItem('user_nome');
    
    const guestNav = document.getElementById('guest-nav');
    const userNav = document.getElementById('user-nav');
    const userInitials = document.getElementById('user-initials');
    const profileName = document.getElementById('profile-name');

    if (userId) {
        // LOGADO
        if(guestNav) guestNav.style.display = 'none';
        if(userNav) userNav.style.display = 'flex'; // Flex garante que fiquem lado a lado
        
        // Coloca Iniciais e Nome
        if (nome) {
            const initials = nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
            if(userInitials) userInitials.textContent = initials;
            if(profileName) profileName.textContent = nome;
        }
    } else {
        // DESLOGADO
        if(guestNav) guestNav.style.display = 'flex';
        if(userNav) userNav.style.display = 'none';
    }
}

// Abre/Fecha menu de perfil
function toggleProfileDropdown() {
    const dd = document.getElementById('profile-dropdown');
    if(dd) dd.classList.toggle('active');
}

// Função de Logout
function fazerLogout() {
    if (confirm('Sair do sistema?')) {
        localStorage.clear();
        window.location.hash = '';
        location.reload();
    }
}

// Fecha ao clicar fora
window.addEventListener('click', function(e) {
    const pWrapper = document.querySelector('.profile-wrapper');
    const pDd = document.getElementById('profile-dropdown');
    
    // Se o clique não foi no avatar nem no menu, fecha
    if (pDd && pWrapper && !pWrapper.contains(e.target)) {
        pDd.classList.remove('active');
    }
});

// Abre/Fecha menu de perfil
function toggleProfileDropdown() {
    const dd = document.getElementById('profile-dropdown');
    if(dd) dd.classList.toggle('active');
}

// Função de Logout (Atualizada para usar a nova lógica)
function fazerLogout() {
    if (confirm('Deseja realmente sair?')) {
        localStorage.clear();
        window.location.hash = '';
        location.reload(); // Recarrega para limpar tudo
    }
}

// Fecha dropdowns se clicar fora
window.addEventListener('click', function(e) {
    // Fecha Perfil
    const profileWrapper = document.querySelector('.profile-wrapper');
    const profileDd = document.getElementById('profile-dropdown');
    if (profileDd && profileWrapper && !profileWrapper.contains(e.target)) {
        profileDd.classList.remove('active');
    }
    
    // Fecha Notificações (Já existia, mas reforçando)
    const notifWrapper = document.getElementById('notification-bell');
    const notifDd = document.getElementById('notification-dropdown');
    if (notifDd && notifWrapper && !notifWrapper.contains(e.target)) {
        notifDd.classList.remove('active');
    }
});

function handleAuthButton() {
    const userId = localStorage.getItem('user_id');
    if (userId) fazerLogout();
    else showLogin();
}

function fazerLogout() {
    if (confirm('Tem certeza que deseja sair?')) {
        localStorage.clear();
        document.getElementById('dashboard-barbeiro').classList.add('hidden');
        document.querySelector('.hero').classList.remove('hidden');
        document.querySelector('.features').classList.remove('hidden');
        atualizarBotaoAuth();
        alert('Você saiu com sucesso!');
    }
}

// ===== DASHBOARD: ESTATÍSTICAS E AGENDAMENTOS =====

function carregarDadosDashboard() {
    carregarEstatisticas();
    carregarProximosAgendamentos();
    gerarCalendarioSemana();
}

function carregarEstatisticas() {
    fetch('backend/obter_estatisticas.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const stats = data.estatisticas;
                const statCards = document.querySelectorAll('.stat-card');
                if (statCards.length >= 4) {
                    statCards[0].querySelector('.stat-number').textContent = stats.agendamentos_hoje || 0;
                    statCards[1].querySelector('.stat-number').textContent = stats.total_clientes || 0;
                    statCards[2].querySelector('.stat-number').textContent = 'R$ ' + (stats.faturamento_mes || '0,00');
                    statCards[3].querySelector('.stat-number').textContent = stats.taxa_presenca || '0%';
                }
            }
        })
        .catch(error => console.error('Erro estatísticas:', error));
}

function carregarProximosAgendamentos() {
    fetch('backend/obter_agendamentos.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const lista = document.querySelector('.appointments-list');
                const agendamentos = data.agendamentos;
                
                lista.innerHTML = '<h3>Próximos Agendamentos</h3>';
                
                if (agendamentos.length === 0) {
                    lista.innerHTML += '<p style="text-align: center; color: var(--text-light); padding: 2rem;">Nenhum agendamento próximo.</p>';
                    return;
                }
                
                agendamentos.forEach(agendamento => {
                    const itemHTML = `
                        <div class="appointment-item">
                            <div class="appointment-info">
                                <div class="appointment-time">${agendamento.hora}</div>
                                <div class="appointment-details">
                                    <h4>${agendamento.cliente_nome}</h4>
                                    <p><i class="fas fa-cut"></i> ${agendamento.servico_nome} • R$ ${agendamento.preco}</p>
                                    <small style="color: var(--text-light);"><i class="fas fa-calendar"></i> ${agendamento.data_formatada}</small>
                                </div>
                            </div>
                            <div class="appointment-actions">
                                <button class="btn-icon btn-edit" onclick="editarAgendamento(${agendamento.id})" title="Editar"><i class="fas fa-edit"></i></button>
                                <button class="btn-icon btn-delete" onclick="cancelarAgendamento(${agendamento.id})" title="Cancelar"><i class="fas fa-trash"></i></button>
                            </div>
                        </div>
                    `;
                    lista.innerHTML += itemHTML;
                });
            }
        })
        .catch(error => console.error('Erro agendamentos:', error));
}

function carregarTodosAgendamentos() {
    const status = document.getElementById('filter-status')?.value || 'todos';
    const data = document.getElementById('filter-date')?.value || '';
    
    const params = new URLSearchParams();
    if (status !== 'todos') params.append('status', status);
    if (data) params.append('data', data);
    
    const lista = document.getElementById('lista-agendamentos-completa');
    lista.style.display = 'grid';
    lista.style.gap = '1rem';
    lista.style.marginTop = '1rem';
    lista.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">Carregando...</p>';
    
    fetch('backend/listar_todos_agendamentos.php?' + params.toString())
        .then(response => response.json())
        .then(data => {
            if (!data.success || data.agendamentos.length === 0) {
                lista.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">Nenhum agendamento encontrado.</p>';
                return;
            }
            
            lista.innerHTML = '';
            
            data.agendamentos.forEach(ag => {
                let statusColor = '#f39c12';
                let statusBg = '#fff3cd';
                let statusText = 'PENDENTE';
                
                if (ag.status === 'confirmado') { statusColor = '#27ae60'; statusBg = '#d4edda'; statusText = 'CONFIRMADO'; }
                else if (ag.status === 'cancelado') { statusColor = '#e74c3c'; statusBg = '#f8d7da'; statusText = 'CANCELADO'; }
                
                const card = document.createElement('div');
                card.style.cssText = `
                    background: white; border-radius: 12px; padding: 1.5rem;
                    border-left: 4px solid ${statusColor}; box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                    display: grid; grid-template-columns: 1fr auto; gap: 1rem; align-items: center;
                    ${ag.status === 'cancelado' ? 'opacity: 0.7;' : ''}
                `;
                
                let botoesHTML = '';
                if (ag.status === 'pendente') {
                    botoesHTML = `
                        <div style="display: flex; gap: 0.5rem; flex-direction: column;">
                            <button onclick="confirmarAgendamento(${ag.id}, '${ag.cliente_telefone}', '${ag.cliente_nome}', '${ag.data_formatada}', '${ag.hora}')" 
                                    style="width: 45px; height: 45px; border-radius: 10px; border: none; background: #27ae60; color: white; cursor: pointer;" 
                                    title="Confirmar e Enviar WhatsApp">
                                <i class="fas fa-check"></i>
                            </button>
                            <button onclick="cancelarAgendamento(${ag.id})" 
                                    style="width: 45px; height: 45px; border-radius: 10px; border: none; background: #e74c3c; color: white; cursor: pointer;" 
                                    title="Cancelar">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    `;
                }
                
                card.innerHTML = `
                    <div>
                        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.75rem; flex-wrap: wrap;">
                            <span style="background: ${statusBg}; color: ${statusColor}; padding: 0.35rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 700;">${statusText}</span>
                            <span style="color: #666; font-size: 0.9rem;"><i class="fas fa-calendar" style="color: #d4af37;"></i> ${ag.data_formatada}</span>
                            <span style="color: #666; font-size: 0.9rem;"><i class="fas fa-clock" style="color: #d4af37;"></i> ${ag.hora}</span>
                        </div>
                        <h4 style="color: #1a1a2e; margin-bottom: 0.5rem; font-size: 1.1rem;"><i class="fas fa-user" style="color: #d4af37;"></i> ${ag.cliente_nome}</h4>
                        <p style="color: #666; margin-bottom: 0.25rem; font-size: 0.9rem;"><i class="fas fa-phone" style="color: #d4af37; width: 14px;"></i> ${ag.cliente_telefone}</p>
                        <p style="color: #333; margin-bottom: 0.25rem; font-size: 0.95rem;"><i class="fas fa-cut" style="color: #d4af37; width: 14px;"></i> ${ag.servico_nome} • <strong>R$ ${ag.preco}</strong></p>
                        ${ag.observacoes ? `<p style="color: #666; font-size: 0.85rem; margin-top: 0.5rem; font-style: italic;"><i class="fas fa-comment" style="color: #d4af37;"></i> ${ag.observacoes}</p>` : ''}
                    </div>
                    ${botoesHTML}
                `;
                lista.appendChild(card);
            });
        })
        .catch(error => {
            console.error('Erro:', error);
            lista.innerHTML = '<p style="text-align: center; color: red;">Erro ao carregar agendamentos.</p>';
        });
}

function cancelarAgendamento(agendamentoId) {
    if (!confirm('Tem certeza que deseja cancelar este agendamento?')) return;
    
    const formData = new FormData();
    formData.append('agendamento_id', agendamentoId);
    
    fetch('backend/cancelar_agendamento.php', { method: 'POST', body: formData })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        if (data.success) {
            carregarTodosAgendamentos();
            carregarEstatisticas();
            carregarProximosAgendamentos();
            verificarNotificacoes();
        }
    })
    .catch(error => alert('Erro ao cancelar agendamento.'));
}

function confirmarAgendamento(agendamentoId, telefone, nome, data, hora) {
    if(!confirm("Deseja confirmar este agendamento?")) return;

    const formData = new FormData();
    formData.append('agendamento_id', agendamentoId);
    formData.append('status', 'confirmado');
    
    fetch('backend/atualizar_status_agendamento.php', { method: 'POST', body: formData })
    .then(response => response.json())
    .then(resp => {
        if (resp.success) {
            // Mensagem de sucesso com info do WhatsApp
            if (resp.whatsapp_sent) {
                alert("✅ Agendamento Confirmado!\n\n📱 Mensagem enviada via WhatsApp para o cliente.");
            } else if (resp.whatsapp_error) {
                alert("✅ Agendamento Confirmado!\n\n⚠️ " + resp.message);
            } else {
                alert("✅ " + resp.message);
            }
            
            // Recarrega os dados
            carregarTodosAgendamentos();
            carregarEstatisticas();
            carregarProximosAgendamentos();
            verificarNotificacoes();
        } else {
            alert("❌ Erro: " + resp.message);
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao confirmar agendamento.');
    });
}

function cancelarAgendamento(agendamentoId) {
    if (!confirm('Tem certeza que deseja cancelar este agendamento?\n\nO cliente será notificado via WhatsApp.')) return;
    
    const formData = new FormData();
    formData.append('agendamento_id', agendamentoId);
    
    fetch('backend/cancelar_agendamento.php', { method: 'POST', body: formData })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Busca o agendamento para enviar WhatsApp de cancelamento
            fetch('backend/obter_agendamentos.php')
            .then(res => res.json())
            .then(agendamentos => {
                // Aqui você pode chamar a função de envio de WhatsApp de cancelamento
                if (data.whatsapp_sent) {
                    alert("✅ Agendamento Cancelado!\n\n📱 Cliente notificado via WhatsApp.");
                } else {
                    alert("✅ " + data.message);
                }
                carregarTodosAgendamentos();
                carregarEstatisticas();
                carregarProximosAgendamentos();
                verificarNotificacoes();
            });
        } else {
            alert("❌ Erro: " + data.message);
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao cancelar agendamento.');
    });
}

function cancelarAgendamento(agendamentoId) {
    if (!confirm('Tem certeza que deseja cancelar este agendamento?\n\nO cliente será notificado via WhatsApp.')) return;
    
    const formData = new FormData();
    formData.append('agendamento_id', agendamentoId);
    
    fetch('backend/cancelar_agendamento.php', { method: 'POST', body: formData })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Busca o agendamento para enviar WhatsApp de cancelamento
            fetch('backend/obter_agendamentos.php')
            .then(res => res.json())
            .then(agendamentos => {
                // Aqui você pode chamar a função de envio de WhatsApp de cancelamento
                if (data.whatsapp_sent) {
                    alert("✅ Agendamento Cancelado!\n\n📱 Cliente notificado via WhatsApp.");
                } else {
                    alert("✅ " + data.message);
                }
                carregarTodosAgendamentos();
                carregarEstatisticas();
                carregarProximosAgendamentos();
                verificarNotificacoes();
            });
        } else {
            alert("❌ Erro: " + data.message);
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao cancelar agendamento.');
    });
}

function limparFiltros() {
    document.getElementById('filter-status').value = 'todos';
    document.getElementById('filter-date').value = '';
    carregarTodosAgendamentos();
}

// ==================================================
// FUNÇÕES DE EDIÇÃO DE AGENDAMENTO
// ==================================================

function editarAgendamento(id) {
    // 1. Abre o modal
    showModal('edit-appointment');
    
    // 2. Elementos
    const selectServico = document.getElementById('edit_servico_id');
    
    // 3. Carrega Serviços e Depois os Dados do Agendamento
    fetch('backend/listar_servicos.php').then(r=>r.json()).then(d => {
        selectServico.innerHTML = '';
        d.servicos.forEach(s => {
            selectServico.innerHTML += `<option value="${s.id}">${s.nome_servico} - R$ ${s.preco}</option>`;
        });

        // Busca dados do agendamento
        fetch(`backend/buscar_agendamento.php?id=${id}`)
        .then(r => r.json())
        .then(resp => {
            if (resp.success) {
                const dados = resp.data;
                document.getElementById('edit_agendamento_id').value = dados.id;
                document.getElementById('edit_cliente_nome').value = dados.cliente_nome;
                document.getElementById('edit_data').value = dados.data;
                document.getElementById('edit_hora').value = dados.hora;
                document.getElementById('edit_observacoes').value = dados.observacoes || '';
                selectServico.value = dados.servico_id;
            } else {
                alert('Erro ao carregar dados.');
                closeModal('edit-appointment');
            }
        });
    });
}

// Função que salva a edição (Deve ser chamada na inicialização)
function initializeEditForm() {
    const form = document.getElementById('form-editar-agendamento');
    if (form) {
        // Remove listeners antigos para evitar duplicidade
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);
        
        newForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            
            fetch('backend/salvar_edicao_agendamento.php', { method: 'POST', body: formData })
            .then(res => res.json())
            .then(data => {
                alert(data.message);
                if (data.success) {
                    closeModal('edit-appointment');
                    carregarTodosAgendamentos();
                    carregarProximosAgendamentos();
                }
            });
        });
    }
}

// ===== CLIENTES =====

function carregarClientes() {
    const lista = document.getElementById('lista-clientes');
    lista.style.display = 'grid';
    lista.style.gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';
    lista.style.gap = '1.5rem';
    lista.style.marginTop = '1.5rem';
    lista.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem; grid-column: 1/-1;">Carregando clientes...</p>';
    
    fetch('backend/listar_clientes.php')
        .then(response => response.json())
        .then(data => {
            const totalCountSpan = document.getElementById('total-clientes-count');
            if (totalCountSpan && data.clientes) totalCountSpan.textContent = data.clientes.length;
            
            if (!data.success || !data.clientes || data.clientes.length === 0) {
                lista.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem; grid-column: 1/-1;">Nenhum cliente encontrado.</p>';
                return;
            }
            
            lista.innerHTML = '';
            data.clientes.forEach(cliente => {
                const iniciais = cliente.cliente_nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
                const card = document.createElement('div');
                card.className = 'client-card'; // Usando a classe CSS definida anteriormente
                card.style.cssText = `background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%); border-radius: 16px; padding: 0; border: 1px solid #e9ecef; overflow: hidden; transition: all 0.3s;`;
                
                card.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 1rem; padding: 1.25rem; background: linear-gradient(135deg, #1a1a2e 0%, #2a2a3e 100%);">
                        <div style="width: 50px; height: 50px; min-width: 50px; border-radius: 14px; background: linear-gradient(135deg, #d4af37 0%, #f4a261 100%); display: flex; align-items: center; justify-content: center; font-size: 1.25rem; color: white; font-weight: bold; box-shadow: 0 4px 12px rgba(212, 175, 55, 0.4);">${iniciais}</div>
                        <div style="flex: 1; min-width: 0;">
                            <h4 style="color: white; margin: 0 0 0.25rem 0; font-size: 1rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${cliente.cliente_nome}</h4>
                            <p style="color: rgba(255, 255, 255, 0.8); font-size: 0.85rem; display: flex; align-items: center; gap: 0.35rem; margin: 0;"><i class="fas fa-phone" style="color: #d4af37; font-size: 0.75rem;"></i> ${cliente.cliente_telefone}</p>
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0; padding: 1.25rem;">
                        <div style="padding: 0.75rem; text-align: center; border-right: 1px solid #e9ecef;">
                            <i class="fas fa-calendar-check" style="font-size: 1.25rem; color: #d4af37; margin-bottom: 0.35rem; display: block; opacity: 0.7;"></i>
                            <span style="font-size: 1.5rem; font-weight: 800; color: #1a1a2e; display: block; line-height: 1; margin-bottom: 0.25rem;">${cliente.total_agendamentos}</span>
                            <span style="font-size: 0.7rem; color: #999; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; display: block;">Agendamentos</span>
                        </div>
                        <div style="padding: 0.75rem; text-align: center;">
                            <i class="fas fa-coins" style="font-size: 1.25rem; color: #d4af37; margin-bottom: 0.35rem; display: block; opacity: 0.7;"></i>
                            <span style="font-size: 1.5rem; font-weight: 800; color: #1a1a2e; display: block; line-height: 1; margin-bottom: 0.25rem;">R$ ${cliente.total_gasto}</span>
                            <span style="font-size: 0.7rem; color: #999; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; display: block;">Total Gasto</span>
                        </div>
                    </div>
                `;
                lista.appendChild(card);
            });
        })
        .catch(error => {
            console.error('Erro:', error);
            lista.innerHTML = '<p style="text-align: center; color: red; grid-column: 1/-1;">Erro ao carregar clientes.</p>';
        });
}

function buscarClientes() {
    const termo = document.getElementById('search-client').value.toLowerCase();
    const cards = document.querySelectorAll('#lista-clientes > div'); 
    
    cards.forEach(card => {
        const texto = card.textContent.toLowerCase();
        card.style.display = texto.includes(termo) ? 'block' : 'none';
    });
}

// ===== NAVEGAÇÃO EXTERNA =====

function navegarParaInicio() {
    document.getElementById('dashboard-barbeiro').classList.add('hidden');
    document.querySelector('.hero').classList.remove('hidden');
    document.querySelector('.features').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function navegarParaFuncionalidades() {
    document.getElementById('dashboard-barbeiro').classList.add('hidden');
    document.querySelector('.hero').classList.remove('hidden');
    document.querySelector('.features').classList.remove('hidden');
    setTimeout(() => {
        document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
    }, 100);
}

function navegarParaDashboard() {
    showDashboard();
}

function initializeHamburgerMenu() {
    const toggleButton = document.getElementById('hamburger-toggle');
    const menu = document.getElementById('nav-links-menu');
    if (toggleButton && menu) {
        toggleButton.addEventListener('click', function() {
            menu.classList.toggle('active');
        });
    }
}

// ===== LÓGICA DE LINK E HORÁRIOS (NOVO) =====

function carregarLinkAgendamento() {
    const slug = localStorage.getItem('user_slug');
    if (!slug) {
        alert('Erro: Slug não encontrado. Faça login novamente.');
        return;
    }
    
    const baseUrl = window.location.origin + window.location.pathname.replace('/index.html', '').replace(/\/$/, '');
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    
    const linkCompleto = cleanBaseUrl + '/agendar.php?barbeiro=' + slug;
    const inputLink = document.getElementById('link-agendamento');
    
    if (inputLink) {
        inputLink.value = linkCompleto;
    }
}

function copiarLink() {
    const inputLink = document.getElementById('link-agendamento');
    inputLink.select();
    inputLink.setSelectionRange(0, 99999);
    
    try {
        document.execCommand('copy');
        alert('✅ Link copiado com sucesso!');
    } catch (err) {
        alert('Erro ao copiar. Por favor, copie manualmente.');
    }
}

function abrirPreview() {
    const inputLink = document.getElementById('link-agendamento');
    if(inputLink && inputLink.value) {
        window.open(inputLink.value, '_blank');
    } else {
        alert("Link não carregado.");
    }
}

function toggleInputs(dayIndex) {
    const checkbox = document.querySelector(`input[name="aberto_${dayIndex}"]`);
    const inicio = document.querySelector(`input[name="inicio_${dayIndex}"]`);
    const fim = document.querySelector(`input[name="fim_${dayIndex}"]`);
    const statusText = checkbox.closest('.day-status').querySelector('.status-text');

    if (checkbox.checked) {
        inicio.disabled = false;
        fim.disabled = false;
        statusText.textContent = "Aberto";
        statusText.style.color = "var(--primary)";
    } else {
        inicio.disabled = true;
        fim.disabled = true;
        statusText.textContent = "Fechado";
        statusText.style.color = "#999";
    }
}

function salvarConfiguracoesHorario() {
    const horarios = [];
    for (let i = 0; i <= 6; i++) {
        const checkbox = document.querySelector(`input[name="aberto_${i}"]`);
        const inicio = document.querySelector(`input[name="inicio_${i}"]`);
        const fim = document.querySelector(`input[name="fim_${i}"]`);
        
        horarios.push({
            dia_semana: i,
            aberto: checkbox.checked,
            hora_inicio: inicio.value,
            hora_fim: fim.value
        });
    }

    fetch('backend/configurar_horarios.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: 'horarios=' + encodeURIComponent(JSON.stringify(horarios))
    })
    .then(res => res.json())
    .then(data => alert(data.message))
    .catch(err => alert('Erro ao salvar.'));
}

function carregarConfiguracoesHorario() {
    fetch('backend/configurar_horarios.php')
    .then(res => res.json())
    .then(data => {
        if (data.success && data.horarios) {
            for (const dia in data.horarios) {
                const regra = data.horarios[dia];
                const i = regra.dia_semana;
                const checkbox = document.querySelector(`input[name="aberto_${i}"]`);
                const inicio = document.querySelector(`input[name="inicio_${i}"]`);
                const fim = document.querySelector(`input[name="fim_${i}"]`);
                
                if (checkbox && inicio && fim) {
                    checkbox.checked = (regra.aberto == 1);
                    inicio.value = regra.hora_inicio.substring(0, 5);
                    fim.value = regra.hora_fim.substring(0, 5);
                    toggleInputs(i);
                }
            }
        }
    })
    .catch(err => console.log("Ainda não há horários configurados ou erro de conexão."));
}

// ==================================================
// SISTEMA DE NOTIFICAÇÕES (MOBILE OPTIMIZED)
// ==================================================

// Variável global para controlar se o número aumentou
let ultimoTotalPendentes = 0;

// 1. TRUQUE PARA DESTRAVAR ÁUDIO NO IPHONE/ANDROID
// O som só toca se o usuário já tiver clicado na tela pelo menos uma vez.
function unlockAudio() {
    const audio = document.getElementById('notification-sound');
    if (audio) {
        // Toca e pausa imediatamente só para o navegador liberar o recurso
        audio.play().then(() => {
            audio.pause();
            audio.currentTime = 0;
        }).catch(() => {}); // Ignora erros se já estiver tocando
    }
    // Remove os ouvintes para não ficar rodando a cada clique
    document.removeEventListener('click', unlockAudio);
    document.removeEventListener('touchstart', unlockAudio);
}

// Adiciona os ouvintes no documento todo
document.addEventListener('click', unlockAudio);
document.addEventListener('touchstart', unlockAudio);


function iniciarSistemaNotificacao() {
    // Só roda se for barbeiro logado
    if (localStorage.getItem('user_id') && localStorage.getItem('user_tipo') === 'barbeiro') {
        const bell = document.getElementById('notification-bell');
        // Usamos 'block' ou deixamos o CSS controlar via classe, 'flex' as vezes quebra no mobile dependendo do CSS pai
        if(bell) bell.style.display = 'block'; 
        
        verificarNotificacoes();
        setInterval(verificarNotificacoes, 10000); // 10 segundos
    } else {
        const bell = document.getElementById('notification-bell');
        if(bell) bell.style.display = 'none';
    }
}

function verificarNotificacoes() {
    const userId = localStorage.getItem('user_id');
    if (!userId) return;

    fetch('backend/verificar_notificacoes.php')
    .then(res => res.json())
    .then(data => {
        const totalAtual = parseInt(data.total);
        const badge = document.getElementById('notification-badge');
        const bellIcon = document.querySelector('#notification-bell i'); // Seleciona o ícone dentro da div
        const audio = document.getElementById('notification-sound');
        
        // Atualiza a bolinha vermelha
        if (totalAtual > 0) {
            if(badge) {
                badge.style.display = 'flex'; // Flex centraliza o número
                badge.innerText = totalAtual > 9 ? '9+' : totalAtual;
            }
            // Adiciona animação de balançar se tiver ícone
            if(bellIcon) bellIcon.classList.add('fa-shake');
        } else {
            if(badge) badge.style.display = 'none';
            if(bellIcon) bellIcon.classList.remove('fa-shake');
        }

        // LÓGICA DE TOCAR O SOM
        // Se o número aumentou (ex: de 0 pra 1, ou de 1 pra 2)
        if (totalAtual > ultimoTotalPendentes) {
            console.log(`🔔 Nova notificação detectada! (Total: ${totalAtual})`);
            
            if(audio) {
                audio.volume = 1.0; // Garante volume máximo
                audio.currentTime = 0; // Rebobina
                
                // Tenta tocar (promessa para tratar erro de bloqueio)
                const playPromise = audio.play();
                
                if (playPromise !== undefined) {
                    playPromise.then(_ => {
                        console.log("🔊 Som tocou com sucesso.");
                    })
                    .catch(error => {
                        console.warn("🔇 O navegador bloqueou o som. O usuário precisa interagir com a página primeiro.");
                    });
                }
            }

            // Vibra o celular (Android) - Padrão: Vibra, Pausa, Vibra
            if (navigator.vibrate) {
                try { navigator.vibrate([200, 100, 200]); } catch(e){}
            }
        }

        // Atualiza a memória
        ultimoTotalPendentes = totalAtual;
    })
    .catch(err => console.log("Erro polling notificações", err));
}

function verPendentes() {
    showSection('appointments');
    // Pequeno delay para garantir que a div da lista carregou antes de filtrar
    setTimeout(() => {
        const filtro = document.getElementById('filter-status');
        if(filtro) {
            filtro.value = 'pendente';
            carregarTodosAgendamentos();
        }
    }, 100);
}

// ===== EDIÇÃO E EXCLUSÃO DE SERVIÇOS =====

function abrirModalEditarServico(id, nome, preco, duracao) {
    // Preenche os campos do modal
    document.getElementById('edit-servico-id').value = id;
    document.getElementById('edit-servico-nome').value = nome;
    document.getElementById('edit-servico-preco').value = preco;
    document.getElementById('edit-servico-duracao').value = duracao;
    
    // Abre o modal
    showModal('edit-service');
}

function excluirServico(id) {
    if(confirm("Tem certeza que deseja excluir este serviço?")) {
        const formData = new FormData();
        formData.append('id', id);

        fetch('backend/excluir_servico.php', {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            alert(data.message);
            if(data.success) {
                carregarServicos(); // Recarrega a lista
            }
        });
    }
}


// ========================================
// WHATSAPP - FUNÇÕES PARA RECUPERAR
// ========================================

// ===== 1. VARIÁVEIS GLOBAIS =====
let whatsappStatusInterval = null;
let pollingSpeed = 'slow';
let isConnecting = false;

// ===== 2. MONITORAMENTO =====
function iniciarMonitoramentoWhatsApp() {
    console.log("🔌 Iniciando monitoramento WhatsApp...");
    verificarStatusWhatsApp();
    
    if (whatsappStatusInterval) clearInterval(whatsappStatusInterval);
    whatsappStatusInterval = setInterval(verificarStatusWhatsApp, 10000);
}

function pararMonitoramentoWhatsApp() {
    if (whatsappStatusInterval) {
        clearInterval(whatsappStatusInterval);
        whatsappStatusInterval = null;
    }
}

function setPollingSpeed(speed) {
    pollingSpeed = speed;
    
    if (whatsappStatusInterval) {
        clearInterval(whatsappStatusInterval);
    }
    
    const interval = speed === 'fast' ? 3000 : 10000;
    whatsappStatusInterval = setInterval(verificarStatusWhatsApp, interval);
    console.log(`⏱️ Polling ajustado para: ${interval}ms`);
}

// ===== 3. VERIFICAR STATUS =====
function verificarStatusWhatsApp() {
    const barbeiroId = localStorage.getItem('user_id');
    if (!barbeiroId) return;
    
    fetch(`backend/whatsapp_config.php?action=status&barbeiro_id=${barbeiroId}`)
    .then(res => res.json())
    .then(data => {
        console.log('📊 Status WhatsApp:', data);
        
        const indicator = document.getElementById('whatsapp-status-indicator');
        if (!indicator) return;
        
        const dot = indicator.querySelector('.status-dot');
        const text = indicator.querySelector('.status-text');
        
        const qrDisplay = document.getElementById('qr-code-display');
        const connecting = document.getElementById('whatsapp-connecting');
        const connected = document.getElementById('whatsapp-connected');
        const disconnected = document.getElementById('whatsapp-disconnected');
        
        [qrDisplay, connecting, connected, disconnected].forEach(el => {
            if (el) el.style.display = 'none';
        });
        
        if (data.connected) {
            console.log('✅ WhatsApp conectado!');
            dot.style.background = '#25D366';
            text.textContent = 'Conectado';
            text.style.color = '#25D366';
            if (connected) connected.style.display = 'block';
            
            document.getElementById('btn-connect-whatsapp').style.display = 'none';
            document.getElementById('btn-disconnect-whatsapp').style.display = 'inline-flex';
            
            isConnecting = false;
            
            if (pollingSpeed === 'fast') {
                setPollingSpeed('slow');
            }
            
        } else if (data.status === 'qr_ready' && data.qrCode) {
            console.log('📱 QR Code disponível!');
            dot.style.background = '#FFA500';
            text.textContent = 'Escaneie o QR Code';
            text.style.color = '#FFA500';
            if (connecting) connecting.style.display = 'none';
            
            if (qrDisplay) {
                qrDisplay.style.display = 'block';
                const qrImg = document.getElementById('qr-code-image');
                if (qrImg) {
                    qrImg.src = data.qrCode;
                }
            }
            
            document.getElementById('btn-connect-whatsapp').style.display = 'none';
            document.getElementById('btn-disconnect-whatsapp').style.display = 'inline-flex';
            
            isConnecting = false;
            
            if (pollingSpeed !== 'fast') {
                setPollingSpeed('fast');
            }
            
        } else if (data.status === 'connecting' || data.status === 'authenticated') {
            console.log('⏳ Conectando WhatsApp...');
            dot.style.background = '#FFA500';
            text.textContent = 'Conectando...';
            text.style.color = '#FFA500';
            
            if (connecting) connecting.style.display = 'block';
            
            document.getElementById('btn-connect-whatsapp').style.display = 'none';
            document.getElementById('btn-disconnect-whatsapp').style.display = 'inline-flex';
            
            if (pollingSpeed !== 'fast') {
                setPollingSpeed('fast');
            }
            
        } else if (data.status === 'timeout') {
            console.log('⏰ Timeout - QR Code expirado');
            dot.style.background = '#e74c3c';
            text.textContent = 'QR Code Expirado';
            text.style.color = '#e74c3c';
            
            if (disconnected) {
                disconnected.style.display = 'block';
                disconnected.innerHTML = `
                    <i class="fas fa-clock" style="font-size: 3rem; color: #e74c3c; margin-bottom: 1rem;"></i>
                    <p style="color: #e74c3c; font-weight: bold;">Tempo Esgotado</p>
                    <p style="color: #666; font-size: 0.9rem;">O QR Code expirou. Clique em "Conectar WhatsApp" novamente.</p>
                `;
            }
            
            [qrDisplay, connecting, connected].forEach(el => {
                if (el) el.style.display = 'none';
            });
            
            document.getElementById('btn-connect-whatsapp').style.display = 'inline-flex';
            document.getElementById('btn-disconnect-whatsapp').style.display = 'none';
            
            isConnecting = false;
            setPollingSpeed('slow');

        } else if (data.status === 'no_session') {
            console.log('🆕 Nenhuma sessão encontrada');
            dot.style.background = '#999';
            text.textContent = 'Não configurado';
            text.style.color = '#666';
            
            if (disconnected) {
                disconnected.style.display = 'block';
                disconnected.innerHTML = `
                    <i class="fab fa-whatsapp" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                    <p style="color: #666; margin-bottom: 0;">WhatsApp não está conectado</p>
                    <p style="color: #999; font-size: 0.85rem; margin-top: 0.5rem;">Clique no botão abaixo para conectar</p>
                `;
            }
            
            document.getElementById('btn-connect-whatsapp').style.display = 'inline-flex';
            document.getElementById('btn-disconnect-whatsapp').style.display = 'none';
            
            isConnecting = false;
            
        } else {
            console.log('⚪ WhatsApp desconectado');
            dot.style.background = '#ccc';
            text.textContent = 'Desconectado';
            text.style.color = '#666';
            
            if (disconnected) disconnected.style.display = 'block';
            
            document.getElementById('btn-connect-whatsapp').style.display = 'inline-flex';
            document.getElementById('btn-disconnect-whatsapp').style.display = 'none';
            
            isConnecting = false;
            
            if (pollingSpeed === 'fast') {
                setPollingSpeed('slow');
            }
        }
    })
    .catch(err => {
        console.error('❌ Erro ao verificar status WhatsApp:', err);
        
        const disconnected = document.getElementById('whatsapp-disconnected');
        if (disconnected) {
            disconnected.style.display = 'block';
            disconnected.innerHTML = `
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #e74c3c; margin-bottom: 1rem;"></i>
                <p style="color: #e74c3c; font-weight: bold;">Erro de Comunicação</p>
                <p style="color: #666; font-size: 0.85rem;">Não foi possível conectar com o servidor WhatsApp.</p>
            `;
        }
        
        isConnecting = false;
    });
}

// ===== 4. CONECTAR =====
function conectarWhatsApp() {
    if (isConnecting) {
        console.log('⏳ Já está conectando... aguarde');
        return;
    }    
    isConnecting = true;
    
    const btnConnect = document.getElementById('btn-connect-whatsapp');
    const originalText = btnConnect.innerHTML;
    
    btnConnect.disabled = true;
    btnConnect.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Iniciando...';
    
    const connecting = document.getElementById('whatsapp-connecting');
    const disconnected = document.getElementById('whatsapp-disconnected');
    const qrDisplay = document.getElementById('qr-code-display');
    
    if (disconnected) disconnected.style.display = 'none';
    if (qrDisplay) qrDisplay.style.display = 'none';
    
    if (connecting) {
        connecting.style.display = 'block';
        connecting.innerHTML = `
            <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #FFA500; margin-bottom: 1rem;"></i>
            <p style="font-weight: bold; color: #333;">Iniciando conexão WhatsApp...</p>
            <p style="color: #666; font-size: 0.9rem; margin-top: 0.5rem;">Aguarde alguns segundos</p>
        `;
    }
    
    const dot = document.querySelector('#whatsapp-status-indicator .status-dot');
    const text = document.querySelector('#whatsapp-status-indicator .status-text');
    if (dot) dot.style.background = '#FFA500';
    if (text) {
        text.textContent = 'Iniciando...';
        text.style.color = '#FFA500';
    }
    
    const barbeiroId = localStorage.getItem('user_id');
    if (!barbeiroId) {
        alert('Erro: Faça login primeiro');
        return;
    }

    const formData = new FormData();
    formData.append('action', 'connect');
    formData.append('barbeiro_id', barbeiroId);

    fetch('backend/whatsapp_config.php', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        console.log('📡 Resposta da conexão:', data);
        
        if (data.success) {
            console.log('✅ Conexão iniciada com sucesso!');
            
            setPollingSpeed('fast');
            
            if (connecting) {
                connecting.innerHTML = `
                    <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #25D366; margin-bottom: 1rem;"></i>
                    <p style="font-weight: bold; color: #25D366;">Gerando QR Code...</p>
                    <p style="color: #666; font-size: 0.9rem; margin-top: 0.5rem;">Isso pode levar até 60 segundos</p>
                `;
            }
            
            setTimeout(verificarStatusWhatsApp, 1000);
            setTimeout(verificarStatusWhatsApp, 3000);
            setTimeout(verificarStatusWhatsApp, 6000);
            setTimeout(verificarStatusWhatsApp, 10000);
            setTimeout(verificarStatusWhatsApp, 15000);
            
        } else {
            console.error('❌ Erro ao conectar:', data.message);
            alert('Erro ao conectar: ' + data.message);
            isConnecting = false;
            verificarStatusWhatsApp();
        }
    })
    .catch(err => {
        console.error('❌ Erro de rede:', err);
        alert('Erro ao conectar. Verifique se o servidor WhatsApp está rodando.');
        isConnecting = false;
        verificarStatusWhatsApp();
    })
    .finally(() => {
        btnConnect.disabled = false;
        btnConnect.innerHTML = originalText;
    });
}

// ===== 5. DESCONECTAR =====
function desconectarWhatsApp() {
    if (!confirm('Deseja realmente desconectar o WhatsApp?')) return;
    
    const barbeiroId = localStorage.getItem('user_id');
    const formData = new FormData();
    formData.append('action', 'disconnect');
    formData.append('barbeiro_id', barbeiroId);    
    fetch('backend/whatsapp_config.php', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        isConnecting = false;
        verificarStatusWhatsApp();
        setPollingSpeed('slow');
    });
}

// ===== 6. RESETAR =====
function resetarWhatsApp() {
    if (!confirm('Isso irá limpar a sessão do WhatsApp.\n\nVocê precisará escanear o QR Code novamente.\n\nContinuar?')) {
        return;
    }
    
    const barbeiroId = localStorage.getItem('user_id');
    const formData = new FormData();
    formData.append('action', 'reset');
    formData.append('barbeiro_id', barbeiroId);
    fetch('backend/whatsapp_config.php', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        isConnecting = false;
        verificarStatusWhatsApp();
    })
    .catch(err => {
        alert('Erro ao resetar sessão');
        console.error(err);
    });
}

// ===== 7. TESTAR MENSAGEM =====
function testarMensagemWhatsApp() {
    const telefone = prompt('Digite o número de WhatsApp para teste:\n(Ex: 19999999999)');
    if (!telefone) return;
    
    const nome = prompt('Digite o nome para o teste:', 'Teste Cliente');
    if (!nome) return;
    
    const hoje = new Date();
    const dataFormatada = hoje.toLocaleDateString('pt-BR');
    const horaFormatada = hoje.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    const mensagem = `Olá *${nome}*! 👋\n\nEsta é uma mensagem de teste do ClickAgenda.\n\n📅 ${dataFormatada}\n⏰ ${horaFormatada}`;
    
    const barbeiroId = localStorage.getItem('user_id');
    const formData = new FormData();
    formData.append('action', 'send');
    formData.append('barbeiro_id', barbeiroId);
    formData.append('telefone', telefone);
    formData.append('mensagem', mensagem);    
    
    fetch('backend/whatsapp_config.php', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('✅ Mensagem de teste enviada com sucesso!');
        } else {
            alert('❌ Erro: ' + data.message);
        }
    })
    .catch(err => {
        alert('Erro ao enviar mensagem de teste');
        console.error(err);
    });
}

// ===== 8. ENVIAR WHATSAPP AUTOMÁTICO =====
function enviarWhatsAppAutomatico(telefone, nomeCliente, data, hora) {
    const mensagem = `Olá *${nomeCliente}*! 👋💈\n\nPassando para confirmar seu horário na Barbearia da Nay.\n\n📅 *Data:* ${data}\n⏰ *Horário:* ${hora}\n\nEstá tudo certo! Te aguardo.`;
    
    const barbeiroId = localStorage.getItem('user_id');
    const formData = new FormData();
    formData.append('action', 'send');
    formData.append('barbeiro_id', barbeiroId);
    formData.append('telefone', telefone);
    formData.append('mensagem', mensagem);
    
    return fetch('backend/whatsapp_config.php', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json());
}

// ===== 9. STYLE ANIMATION =====
const style = document.createElement('style');
style.textContent = `
    @keyframes loading {
        0% { transform: translateX(-100%); }
        50% { transform: translateX(200%); }
        100% { transform: translateX(-100%); }
    }
`;
document.head.appendChild(style);

// ===== 10. LISTENER VISIBILITY =====
document.addEventListener('visibilitychange', () => {
    if (document.hidden && pollingSpeed === 'fast') {
        setPollingSpeed('slow');
    }
});


// ==================================================
// LÓGICA DE NOTIFICAÇÕES (Estilo YouTube)
// ==================================================

// 1. Alternar (Abrir/Fechar) o Painel
function toggleNotificationDropdown(event) {
    if (event) {
        event.stopPropagation(); // Impede que o clique feche o menu instantaneamente
        event.preventDefault();
    }

    const dropdown = document.getElementById('notification-dropdown');
    if (!dropdown) return;

    // Alterna classe 'active'
    dropdown.classList.toggle('active');

    // Se abriu, carrega a lista atualizada
    if (dropdown.classList.contains('active')) {
        carregarListaNotificacoes();
        
        // Fecha o menu de perfil se estiver aberto (para não sobrepor)
        const profileDd = document.getElementById('profile-dropdown');
        if(profileDd) profileDd.classList.remove('active');
    }
}

// 2. Buscar dados e montar o HTML
function carregarListaNotificacoes() {
    const listContent = document.getElementById('notif-list-content');
    if (!listContent) return;

    // Loading state
    listContent.innerHTML = '<div style="padding:20px; text-align:center; color:#666;"><i class="fas fa-spinner fa-spin"></i> Carregando...</div>';

    fetch('backend/listar_notificacoes.php')
        .then(res => res.json())
        .then(data => {
            listContent.innerHTML = ''; // Limpa loading

            if (data.success && data.notificacoes.length > 0) {
                data.notificacoes.forEach(notif => {
                    const item = document.createElement('div');
                    item.className = 'notif-item';
                    
                    // Ao clicar no item, vai para a agenda
                    item.onclick = function() {
                        verPendentes();
                        document.getElementById('notification-dropdown').classList.remove('active');
                    };

                    item.innerHTML = `
                        <div class="notif-icon-circle">
                            <i class="fas fa-user-clock"></i>
                        </div>
                        <div class="notif-content">
                            <span class="notif-title">${notif.cliente_nome}</span>
                            <span class="notif-subtitle">Solicitou: <strong>${notif.nome_servico}</strong></span>
                            <span class="notif-time">
                                <i class="far fa-clock"></i> ${notif.data_formatada} às ${notif.hora_formatada}
                            </span>
                        </div>
                    `;
                    listContent.appendChild(item);
                });
            } else {
                listContent.innerHTML = `
                    <div class="notif-empty">
                        <i class="far fa-bell-slash" style="font-size: 2rem; margin-bottom: 10px; opacity: 0.5;"></i>
                        <p>Tudo limpo! Nenhuma notificação.</p>
                    </div>
                `;
            }
        })
        .catch(err => {
            console.error(err);
            listContent.innerHTML = '<div class="notif-empty">Erro ao carregar.</div>';
        });
}

// 3. Fechar ao clicar fora (Listener Global)
window.addEventListener('click', function(e) {
    const dropdown = document.getElementById('notification-dropdown');
    const bell = document.getElementById('notification-bell');

    if (dropdown && bell) {
        // Se o clique NÃO foi no dropdown E NÃO foi no sino
        if (!dropdown.contains(e.target) && !bell.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    }
});

// ==================================================
// GERENCIAMENTO DE PERFIL E SENHA
// ==================================================

// Carrega os dados do banco para preencher os inputs
function carregarDadosPerfil() {
    fetch('backend/obter_perfil.php')
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            // 1. Preenche os campos de texto
            document.getElementById('perfil-nome').value = data.dados.nome;
            document.getElementById('perfil-email').value = data.dados.email;
            document.getElementById('perfil-telefone').value = data.dados.telefone || '';

            // 2. Lógica das Iniciais
            const nome = data.dados.nome;
            let iniciais = "US"; // Padrão se der erro
            
            if (nome) {
                // Pega as duas primeiras letras e deixa maiúsculo
                iniciais = nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
            }

            // 3. Atualiza a Bolinha Grande
            const previewContainer = document.getElementById('settings-profile-preview');
            const fotoSalva = localStorage.getItem('user_foto');
            
            // Se tiver foto, mostra a foto. Se não, mostra as iniciais.
            if (fotoSalva && fotoSalva !== 'null' && fotoSalva !== '') {
                 previewContainer.innerHTML = `<img src="${fotoSalva}" alt="Foto">`;
            } else {
                // AQUI ESTÁ A MÁGICA: Força o HTML das iniciais com a cor certa
                previewContainer.innerHTML = `<span id="settings-profile-initials" style="font-size: 2.5rem; font-weight: bold; color: #1a1a2e;">${iniciais}</span>`;
                
                // Garante que o fundo fique dourado (igual ao de cima)
                previewContainer.style.backgroundColor = "#d4af37";
            }
        }
    });
}

// Listener para Salvar Perfil
const formPerfil = document.getElementById('form-perfil');
if (formPerfil) {
    formPerfil.addEventListener('submit', function(e) {
        e.preventDefault();
        const fd = new FormData(this);
        
        fetch('backend/atualizar_perfil.php', { method: 'POST', body: fd })
        .then(res => res.json())
        .then(data => {
            alert(data.message);
            if (data.success) {
                // Atualiza o nome no menu e no localStorage
                localStorage.setItem('user_nome', fd.get('nome'));
                atualizarBotaoAuth(); 
            }
        });
    });
}

// Listener para Alterar Senha
const formSenha = document.getElementById('form-senha');
if (formSenha) {
    formSenha.addEventListener('submit', function(e) {
        e.preventDefault();
        const fd = new FormData(this);
        
        fetch('backend/alterar_senha.php', { method: 'POST', body: fd })
        .then(res => res.json())
        .then(data => {
            alert(data.message);
            if (data.success) {
                formSenha.reset();
            }
        });
    });
}

// ==================================================
// UPLOAD DE FOTO DE PERFIL
// ==================================================

const fotoInput = document.getElementById('upload-foto-input');

if (fotoInput) {
    fotoInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        // 1. Validações básicas no frontend
        const extensoesValidas = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!extensoesValidas.includes(file.type)) {
            alert('Por favor, selecione uma imagem JPG ou PNG.');
            return;
        }
        if (file.size > 2 * 1024 * 1024) { // 2MB
            alert('A imagem é muito grande. O máximo é 2MB.');
            return;
        }

        // 2. Mostra Feedback Visual (Carregando...)
        const statusText = document.getElementById('upload-status-text');
        const btn = fotoInput.nextElementSibling; // O botão "Alterar Foto"
        const textoOriginalBtn = btn.innerHTML;
        
        statusText.textContent = 'Enviando... Aguarde.';
        statusText.style.color = 'var(--primary)';
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        btn.disabled = true;

        // 3. Prepara e envia o formulário
        const formData = new FormData();
        formData.append('foto_perfil', file);

        fetch('backend/upload_foto_perfil.php', {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                // SUCESSO
                statusText.textContent = '✅ Foto atualizada com sucesso!';
                statusText.style.color = '#27ae60';
                
                // Salva no localStorage para carregar rápido depois
                localStorage.setItem('user_foto', data.caminho);
                
                // Atualiza a foto em todos os lugares
                atualizarFotoEmTodaPagina(data.caminho);

            } else {
                // ERRO DO BACKEND
                statusText.textContent = '❌ Erro: ' + data.message;
                statusText.style.color = '#e74c3c';
                alert(data.message);
            }
        })
        .catch(err => {
            // ERRO DE REDE
            console.error(err);
            statusText.textContent = '❌ Erro de conexão ao enviar.';
            statusText.style.color = '#e74c3c';
        })
        .finally(() => {
            // Restaura o botão
            btn.innerHTML = textoOriginalBtn;
            btn.disabled = false;
            fotoInput.value = ''; // Limpa o input para poder selecionar a mesma foto se quiser
        });
    });
}

// Função auxiliar para atualizar a imagem no Header e nas Configurações
function atualizarFotoEmTodaPagina(caminhoFoto) {
    // 1. Atualiza no Header (Lá em cima, na barra de navegação)
    const headerAvatar = document.querySelector('.user-avatar');
    if (headerAvatar) {
        if (caminhoFoto) {
            // Se tem foto, coloca ela como imagem de fundo
            headerAvatar.style.backgroundImage = `url('${caminhoFoto}')`;
            headerAvatar.style.backgroundSize = 'cover';
            headerAvatar.style.backgroundPosition = 'center';
            headerAvatar.textContent = ''; // Esconde as iniciais
        } else {
            // Se não tem foto, reseta para mostrar as iniciais
            headerAvatar.style.backgroundImage = 'none';
            // O texto das iniciais é recolocado pela função atualizarBotaoAuth
        }
    }

    // 2. Atualiza na Tela de Configurações (O preview grande)
    const previewContainer = document.getElementById('settings-profile-preview');
    if (previewContainer) {
        if (caminhoFoto) {
            previewContainer.innerHTML = `<img src="${caminhoFoto}" alt="Foto de Perfil">`;
        } else {
            const nome = localStorage.getItem('user_nome') || 'U S';
            const iniciais = nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
            previewContainer.innerHTML = `<span id="settings-profile-initials">${iniciais}</span>`;
        }
    }
}

function removerFotoPerfil() {
    if (!confirm("Tem certeza que deseja remover sua foto de perfil?")) return;

    const btnRemove = document.querySelector('.btn-remove');
    const originalHtml = btnRemove.innerHTML;
    btnRemove.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    fetch('backend/remover_foto_perfil.php', { method: 'POST' })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            // Limpa do LocalStorage
            localStorage.removeItem('user_foto');
            
            // Atualiza a tela (passando null, ele gera as iniciais)
            atualizarFotoEmTodaPagina(null);
            
            alert('Foto removida!');
        } else {
            alert('Erro: ' + data.message);
        }
    })
    .catch(err => console.error(err))
    .finally(() => {
        btnRemove.innerHTML = originalHtml;
    });
}

// Função visual para mostrar campos
function verificarNovoCliente(select) {
    const divNovos = document.getElementById('novos-campos-cliente');
    const inputNome = divNovos.querySelector('input[name="novo_nome"]');
    const inputTel = divNovos.querySelector('input[name="novo_telefone"]');

    if (select.value === 'novo') {
        divNovos.style.display = 'block';
        inputNome.setAttribute('required', 'true');
        inputTel.setAttribute('required', 'true');
        inputNome.focus();
    } else {
        divNovos.style.display = 'none';
        inputNome.removeAttribute('required');
        inputTel.removeAttribute('required');
        inputNome.value = '';
        inputTel.value = '';
    }
}

// ==================================================
// EDIÇÃO DE AGENDAMENTO
// ==================================================

function editarAgendamento(id) {
    // 1. Abre o modal
    showModal('edit-appointment');
    
    // 2. Carrega a lista de serviços no select primeiro
    const selectServico = document.getElementById('edit_servico_id');
    fetch('backend/listar_servicos.php').then(r=>r.json()).then(d => {
        selectServico.innerHTML = '';
        d.servicos.forEach(s => {
            selectServico.innerHTML += `<option value="${s.id}">${s.nome_servico} - R$ ${s.preco}</option>`;
        });

        // 3. Depois busca os dados do agendamento para preencher
        fetch(`backend/buscar_agendamento.php?id=${id}`)
        .then(r => r.json())
        .then(resp => {
            if (resp.success) {
                const dados = resp.data;
                
                document.getElementById('edit_agendamento_id').value = dados.id;
                document.getElementById('edit_cliente_nome').value = dados.cliente_nome; // Apenas visual
                document.getElementById('edit_data').value = dados.data;
                document.getElementById('edit_hora').value = dados.hora;
                document.getElementById('edit_observacoes').value = dados.observacoes;
                
                // Seleciona o serviço correto
                selectServico.value = dados.servico_id;
            } else {
                alert('Erro ao carregar dados.');
                closeModal('edit-appointment');
            }
        });
    });
}

// Inicializa o formulário de edição
function initializeEditForm() {
    const form = document.getElementById('form-editar-agendamento');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            
            fetch('backend/salvar_edicao_agendamento.php', {
                method: 'POST',
                body: formData
            })
            .then(res => res.json())
            .then(data => {
                alert(data.message);
                if (data.success) {
                    closeModal('edit-appointment');
                    // Atualiza as listas
                    carregarTodosAgendamentos();
                    carregarProximosAgendamentos();
                }
            });
        });
    }
}

// ===== INICIALIZAÇÃO =====

// ==================================================
// INICIALIZAÇÃO E CORREÇÃO DO F5
// ==================================================

document.addEventListener('DOMContentLoaded', function() {
    // 1. Inicializa tudo o que já existia no seu código
    initializeForms();
    initializeLoginForms();
    initializeCalendar();
    initializeHamburgerMenu(); 
    initializeServiceForm();
    initializeEditForm();
    
    // 2. Verifica autenticação
    const userId = localStorage.getItem('user_id');
    atualizarBotaoAuth();

    if (userId) {
        // --- AQUI ESTÁ A CORREÇÃO DO F5 ---
        // Se estiver logado, verifica o final do link (#dashboard, #clients) para abrir a tela certa
        checkUrlHash(); 
        
        // Se for barbeiro, ativa o sino de notificações
        if (localStorage.getItem('user_tipo') === 'barbeiro') {
            const bell = document.getElementById('notification-bell');
            if (bell) bell.style.display = 'block'; // ou 'flex'
            // iniciarSistemaNotificacao(); // (Descomente se a função já existir no seu código)
        }
    } else {
        // Se NÃO estiver logado, força a tela inicial limpa
        window.location.hash = '';
        showSectionInternal('home');
    }

    console.log('ClickAgenda inicializado com sucesso!');
});

// ==================================================
// FUNÇÕES DE NAVEGAÇÃO
// ==================================================

// Ouve quando a URL muda (ex: quando você clica em voltar no navegador)
window.addEventListener('hashchange', checkUrlHash);

function checkUrlHash() {
    // Pega o nome da seção da URL (tira o #)
    const hash = window.location.hash.replace('#', '');
    const userId = localStorage.getItem('user_id');

    if (!userId) return; // Se não logado, ignora

    // Roteador simples: define qual seção interna abrir
    if (hash === 'dashboard' || hash === '' || hash === 'overview') {
        showSectionInternal('overview');
    } else if (hash === 'appointments') {
        showSectionInternal('appointments');
    } else if (hash === 'clients') {
        showSectionInternal('clients');
    } else if (hash === 'services') {
        showSectionInternal('services');
    } else if (hash === 'my-link') {
        showSectionInternal('my-link');
    } else if (hash === 'settings') {
        showSectionInternal('settings');
    }
}

// Função usada pelos botões do menu (onclick="showSection('clients')")
function showSection(sectionName) {
    window.location.hash = sectionName; // Muda a URL -> O 'hashchange' acima detecta e troca a tela
}

// Função que realmente esconde/mostra as divs
function showSectionInternal(sectionId) {
    // Se for 'home', esconde dashboard e mostra o site
    if (sectionId === 'home') {
        document.querySelector('.hero').classList.remove('hidden');
        document.querySelector('.features').classList.remove('hidden');
        document.getElementById('dashboard-barbeiro').classList.add('hidden');
        return;
    }

    // Se for dashboard, esconde o site e mostra o painel
    document.querySelector('.hero').classList.add('hidden');
    document.querySelector('.features').classList.add('hidden');
    document.getElementById('dashboard-barbeiro').classList.remove('hidden');

    // Atualiza a cor do botão no menu lateral
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.remove('active');
        // Tenta achar o botão correspondente para marcar como ativo
        if (item.getAttribute('onclick') && item.getAttribute('onclick').includes(sectionId)) {
            item.classList.add('active');
        }
    });

    // Esconde todas as seções internas
    const sections = ['overview', 'appointments', 'clients', 'services', 'my-link', 'settings'];
    sections.forEach(s => {
        const el = document.getElementById(s + '-section');
        if (el) el.classList.add('hidden');
    });

    // Mostra a seção alvo
    const target = document.getElementById(sectionId + '-section');
    if (target) {
        target.classList.remove('hidden');
    }

if (sectionId === 'overview') carregarDadosDashboard();
    if (sectionId === 'appointments') carregarTodosAgendamentos();
    if (sectionId === 'clients') carregarClientes();
    if (sectionId === 'services') carregarServicos();
    if (sectionId === 'my-link') carregarLinkAgendamento();
    
    // ADICIONE ISSO:
    if (sectionId === 'settings') {
        // Carrega horários (se existir a função)
        if(typeof carregarConfiguracoesHorario === 'function') carregarConfiguracoesHorario();
        // Carrega dados do perfil
        carregarDadosPerfil();
    }
}

// ========================================
// FUNÇÕES JAVASCRIPT - WHATSAPP MULTI-MÉTODO
// Adicionar no main.js
// ========================================

// Variável global para armazenar o método escolhido
let metodoConexaoWhatsApp = null;

// 1. SUBSTITUIR a função conectarWhatsApp() existente por esta:
function conectarWhatsApp() {
    // Abre o modal de escolha
    showModal('whatsapp-method');
}

// 2. Escolher método (QR ou Code)
function escolherMetodo(metodo) {
    metodoConexaoWhatsApp = metodo;
    closeModal('whatsapp-method');
    
    if (metodo === 'qr') {
        // Abre modal do QR Code
        showModal('whatsapp-qr');
        conectarWhatsAppMetodo('qr');
    } else if (metodo === 'code') {
        // Abre modal do Código
        showModal('whatsapp-code');
        // Volta para o primeiro passo
        document.getElementById('code-step-phone').style.display = 'block';
        document.getElementById('code-step-display').style.display = 'none';
        document.getElementById('phone-code-input').value = '';
    }
}

// 3. Conectar via QR Code
function conectarWhatsAppMetodo(metodo) {
    if (metodo === 'qr') {
        // Mostra loading
        document.getElementById('qr-loading').style.display = 'block';
        document.getElementById('qr-display').style.display = 'none';
        document.getElementById('qr-error').style.display = 'none';
        
        const barbeiroId = localStorage.getItem('user_id');
        const formData = new FormData();
        formData.append('action', 'connect');
        formData.append('barbeiro_id', barbeiroId);
        formData.append('metodo', 'qr');
        
        fetch('backend/whatsapp_config.php', {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                // Inicia polling rápido para pegar o QR Code
                setPollingSpeed('fast');
                monitorarQRCode();
            } else {
                mostrarErroQR(data.message);
            }
        })
        .catch(err => {
            console.error(err);
            mostrarErroQR('Erro de conexão com o servidor');
        });
    }
}

// 4. Monitorar QR Code (Polling)
let qrMonitorInterval = null;
function monitorarQRCode() {
    if (qrMonitorInterval) clearInterval(qrMonitorInterval);
    
    qrMonitorInterval = setInterval(() => {
        const barbeiroId = localStorage.getItem('user_id');
        
        fetch(`backend/whatsapp_config.php?action=status&barbeiro_id=${barbeiroId}`)
        .then(res => res.json())
        .then(data => {
            console.log('Status QR:', data);
            
            if (data.qrCode) {
                // QR Code gerado!
                document.getElementById('qr-loading').style.display = 'none';
                document.getElementById('qr-display').style.display = 'block';
                document.getElementById('qr-image').src = data.qrCode;
            }
            
            if (data.connected) {
                // Conectado!
                clearInterval(qrMonitorInterval);
                closeModal('whatsapp-qr');
                alert('✅ WhatsApp conectado com sucesso!');
                verificarStatusWhatsApp();
                setPollingSpeed('slow');
            }
            
            if (data.status === 'timeout' || data.status === 'qr_expired') {
                clearInterval(qrMonitorInterval);
                mostrarErroQR('QR Code expirou. Tente novamente.');
            }
        })
        .catch(err => {
            console.error(err);
            clearInterval(qrMonitorInterval);
            mostrarErroQR('Erro ao buscar QR Code');
        });
    }, 3000); // 3 segundos
}

function mostrarErroQR(mensagem) {
    document.getElementById('qr-loading').style.display = 'none';
    document.getElementById('qr-display').style.display = 'none';
    document.getElementById('qr-error').style.display = 'block';
    document.getElementById('qr-error-msg').textContent = mensagem;
}

// 5. Solicitar Código de Emparelhamento
function solicitarCodigo() {
    const telefone = document.getElementById('phone-code-input').value.trim();
    
    if (!telefone) {
        alert('Por favor, digite o número do WhatsApp');
        return;
    }
    
    // Limpa formatação
    const telefoneLimpo = telefone.replace(/\D/g, '');
    
    if (telefoneLimpo.length < 10 || telefoneLimpo.length > 11) {
        alert('Número inválido. Digite com DDD (10 ou 11 dígitos)');
        return;
    }
    
    // Muda para o passo 2
    document.getElementById('code-step-phone').style.display = 'none';
    document.getElementById('code-step-display').style.display = 'block';
    
    // Mostra loading
    document.getElementById('code-loading').style.display = 'block';
    document.getElementById('code-display').style.display = 'none';
    document.getElementById('code-error').style.display = 'none';
    
    const barbeiroId = localStorage.getItem('user_id');
    const formData = new FormData();
    formData.append('action', 'connect');
    formData.append('barbeiro_id', barbeiroId);
    formData.append('metodo', 'code');
    formData.append('telefone', telefoneLimpo);
    
    fetch('backend/whatsapp_config.php', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            // Inicia polling para pegar o código
            setPollingSpeed('fast');
            monitorarCodigo();
        } else {
            mostrarErroCodigo(data.message);
        }
    })
    .catch(err => {
        console.error(err);
        mostrarErroCodigo('Erro de conexão com o servidor');
    });
}

// 6. Monitorar Código (Polling)
let codeMonitorInterval = null;
function monitorarCodigo() {
    if (codeMonitorInterval) clearInterval(codeMonitorInterval);
    
    codeMonitorInterval = setInterval(() => {
        const barbeiroId = localStorage.getItem('user_id');
        
        fetch(`backend/whatsapp_config.php?action=status&barbeiro_id=${barbeiroId}`)
        .then(res => res.json())
        .then(data => {
            console.log('Status Código:', data);
            
            if (data.pairingCode) {
                // Código gerado!
                document.getElementById('code-loading').style.display = 'none';
                document.getElementById('code-display').style.display = 'block';
                document.getElementById('pairing-code-display').textContent = data.pairingCode;
            }
            
            if (data.connected) {
                // Conectado!
                clearInterval(codeMonitorInterval);
                closeModal('whatsapp-code');
                alert('✅ WhatsApp conectado com sucesso!');
                verificarStatusWhatsApp();
                setPollingSpeed('slow');
            }
            
            if (data.status === 'timeout' || data.status === 'code_expired') {
                clearInterval(codeMonitorInterval);
                mostrarErroCodigo('Código expirou. Tente novamente.');
            }
        })
        .catch(err => {
            console.error(err);
            clearInterval(codeMonitorInterval);
            mostrarErroCodigo('Erro ao buscar código');
        });
    }, 3000); // 3 segundos
}

function mostrarErroCodigo(mensagem) {
    document.getElementById('code-loading').style.display = 'none';
    document.getElementById('code-display').style.display = 'none';
    document.getElementById('code-error').style.display = 'block';
    document.getElementById('code-error-msg').textContent = mensagem;
}

// 7. Voltar para escolha de método
function voltarEscolha() {
    // Para os monitoramentos
    if (qrMonitorInterval) clearInterval(qrMonitorInterval);
    if (codeMonitorInterval) clearInterval(codeMonitorInterval);
    
    // Volta para slow
    setPollingSpeed('slow');
    
    // Abre o modal de escolha novamente
    setTimeout(() => {
        showModal('whatsapp-method');
    }, 300);
}

// 8. Voltar para inserir número (no modal de código)
function voltarParaNumero() {
    document.getElementById('code-step-phone').style.display = 'block';
    document.getElementById('code-step-display').style.display = 'none';
    if (codeMonitorInterval) clearInterval(codeMonitorInterval);
}

// 9. Limpar intervalos ao fechar modais
window.addEventListener('beforeunload', () => {
    if (qrMonitorInterval) clearInterval(qrMonitorInterval);
    if (codeMonitorInterval) clearInterval(codeMonitorInterval);
});

// Quando o usuário fecha o modal manualmente
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('close-modal')) {
        if (qrMonitorInterval) clearInterval(qrMonitorInterval);
        if (codeMonitorInterval) clearInterval(codeMonitorInterval);
        setPollingSpeed('slow');
    }
});