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

function showModal(modalId) {
    document.getElementById(modalId + '-modal').classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId + '-modal').classList.remove('active');
}

window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
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
    
    const cliente = formData.get('cliente');
    
    // Se selecionou "novo cliente", abre campos adicionais
    if (cliente === 'novo') {
        alert('Funcionalidade de cadastro rápido em desenvolvimento.\n\nPor enquanto, o cliente precisa fazer o primeiro agendamento pelo link público.');
        return;
    }
    
    if (!cliente) {
        alert('Selecione um cliente.');
        return;
    }
    
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Criando...';
    
    fetch('backend/criar_agendamento_manual.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        if (data.success) {
            closeModal('new-appointment');
            form.reset();
            carregarTodosAgendamentos();
            carregarProximosAgendamentos();
            carregarEstatisticas();
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao criar agendamento. Tente novamente.');
    })
    .finally(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-check"></i> Confirmar Agendamento';
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
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const btn = this.querySelector('button[type="submit"]');
        const textoOriginal = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verificando...';
        btn.disabled = true;
        
        const formData = new FormData(this);
        
        fetch('backend/login.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // ? SALVA TUDO NO LOCALSTORAGE
                localStorage.setItem('user_id', data.user_id);
                localStorage.setItem('user_nome', data.nome);
                localStorage.setItem('user_tipo', data.tipo);
                localStorage.setItem('user_slug', data.slug || '');
                localStorage.setItem('user_foto', data.foto || ''); // Foto pode ser null
                
                alert(data.message);
                closeModal('login');
                
                // ? ATUALIZA A INTERFACE
                atualizarBotaoAuth();
                showDashboard();
                
                // ? RECARREGA PARA APLICAR MUDAN�AS
                setTimeout(() => location.reload(), 500);
            } else {
                alert(data.message);
            }
        })
        .catch(err => {
            console.error(err);
            alert('Erro de conex�o com o servidor.');
        })
        .finally(() => {
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
    const foto = localStorage.getItem('user_foto');
    
    // Elementos do SISTEMA NOVO (com avatar)
    const guestNav = document.getElementById('guest-nav');
    const userNav = document.getElementById('user-nav');
    const userInitials = document.getElementById('user-initials');
    const profileName = document.getElementById('profile-name');
    const userAvatar = document.querySelector('.user-avatar');
    const bell = document.getElementById('notification-bell');

    // Elemento do SISTEMA ANTIGO (bot�o simples) - mant�m compatibilidade
    const btnAuth = document.getElementById('btn-auth');

    if (userId) {
        // ========================================
        // USU�RIO LOGADO
        // ========================================
        
        // SISTEMA NOVO: Esconde guest-nav e mostra user-nav
        if (guestNav) guestNav.style.display = 'none';
        if (userNav) userNav.style.display = 'flex';
        
        // Atualiza nome e iniciais
        if (nome) {
            const initials = nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
            if (userInitials) userInitials.textContent = initials;
            if (profileName) profileName.textContent = nome;
        }
        
        // Atualiza foto de perfil
        if (userAvatar) {
            if (foto && foto !== 'null' && foto !== '' && foto !== 'undefined') {
                // Tem foto: mostra a imagem
                userAvatar.style.backgroundImage = `url('${foto}')`;
                userAvatar.style.backgroundSize = 'cover';
                userAvatar.style.backgroundPosition = 'center';
                if (userInitials) userInitials.style.display = 'none'; // Esconde iniciais
            } else {
                // Sem foto: mostra iniciais
                userAvatar.style.backgroundImage = 'none';
                if (userInitials) userInitials.style.display = 'flex'; // Mostra iniciais
            }
        }
        
        // Mostra sino de notifica��es se for barbeiro
        if (localStorage.getItem('user_tipo') === 'barbeiro') {
            if (bell) {
                bell.style.display = 'block';
                // Inicia monitoramento (se a fun��o existir)
                if (typeof iniciarSistemaNotificacao === 'function') {
                    iniciarSistemaNotificacao();
                }
            }
        } else {
            if (bell) bell.style.display = 'none';
        }
        
        // SISTEMA ANTIGO: Atualiza bot�o (compatibilidade)
        if (btnAuth) {
            btnAuth.innerHTML = `<i class="fas fa-user"></i> ${nome.split(' ')[0]} | Sair`;
            btnAuth.onclick = fazerLogout;
        }
        
        console.log('? Usu�rio autenticado:', nome);
        
    } else {
        // ========================================
        // USU�RIO DESLOGADO
        // ========================================
        
        // SISTEMA NOVO: Mostra guest-nav e esconde user-nav
        if (guestNav) guestNav.style.display = 'flex';
        if (userNav) userNav.style.display = 'none';
        
        // Esconde sino
        if (bell) bell.style.display = 'none';
        
        // SISTEMA ANTIGO: Atualiza bot�o (compatibilidade)
        if (btnAuth) {
            btnAuth.innerHTML = '<i class="fas fa-sign-in-alt"></i> Entrar';
            btnAuth.onclick = showLogin;
        }
        
        console.log('? Usu�rio n�o autenticado');
    }
}

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

function editarAgendamento(agendamentoId) {
    alert('Funcionalidade de edição em desenvolvimento! ID: ' + agendamentoId);
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
// SISTEMA DE NOTIFICAÇÕES E WHATSAPP
// ==================================================

let ultimoTotalPendentes = 0; // Memória do total anterior

function iniciarSistemaNotificacao() {
    // Só roda se for barbeiro logado
    if (localStorage.getItem('user_id') && localStorage.getItem('user_tipo') === 'barbeiro') {
        const bell = document.getElementById('notification-bell');
        if(bell) bell.style.display = 'flex'; // Flex para alinhar badge e ícone
        
        verificarNotificacoes();
        setInterval(verificarNotificacoes, 10000); // 10 segundos
    } else {
        // Esconde se não estiver logado (segurança extra)
        document.getElementById('notification-bell').style.display = 'none';
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
        const bellIcon = document.querySelector('#notification-bell i');
        const audio = document.getElementById('notification-sound');
        
        if (totalAtual > 0) {
            badge.style.display = 'flex'; // Garante que aparece
            badge.innerText = totalAtual;
            bellIcon.classList.add('fa-shake');
        } else {
            badge.style.display = 'none';
            bellIcon.classList.remove('fa-shake');
        }

        // TOCA O SOM SE O NÚMERO AUMENTOU
        if (totalAtual > ultimoTotalPendentes) {
            if(audio) {
                audio.currentTime = 0;
                audio.play().catch(e => console.log("Som bloqueado (falta interação)"));
            }
        }

        ultimoTotalPendentes = totalAtual;
    })
    .catch(err => console.log("Erro polling"));
}

function verPendentes() {
    showSection('appointments');
    const filtro = document.getElementById('filter-status');
    if(filtro) {
        filtro.value = 'pendente';
        carregarTodosAgendamentos();
    }
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
// WHATSAPP - COM FEEDBACK VISUAL MELHORADO
// ========================================

let whatsappStatusInterval = null;
let pollingSpeed = 'slow';
let isConnecting = false;

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
    console.log('?? Timeout - QR Code expirado');
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

function conectarWhatsApp() {
    if (isConnecting) {
    console.log('?? J� est� conectando... aguarde');
    return; // ?? Sem alert - apenas ignora
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
    alert('Erro: Fa�a login primeiro');
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
                    <p style="color: #666; font-size: 0.9rem; margin-top: 0.5rem;">Isso pode levar at� 60 segundos</p>
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

    function resetarWhatsApp() {
    if (!confirm('Isso ir� limpar a sess�o do WhatsApp.\n\nVoc� precisar� escanear o QR Code novamente.\n\nContinuar?')) {
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

const style = document.createElement('style');
style.textContent = `
    @keyframes loading {
        0% { transform: translateX(-100%); }
        50% { transform: translateX(200%); }
        100% { transform: translateX(-100%); }
    }
`;
document.head.appendChild(style);

document.addEventListener('visibilitychange', () => {
    if (document.hidden && pollingSpeed === 'fast') {
        setPollingSpeed('slow');
    }
});

// ===== INICIALIZAÇÃO =====

document.addEventListener('DOMContentLoaded', function() {
    initializeForms();
    initializeLoginForms();
    initializeCalendar();
    initializeHamburgerMenu(); 
    initializeServiceForm();
    
    // Verifica login e notificações ao carregar
    atualizarBotaoAuth();
    const settingsSection = document.getElementById('settings-section');
    if (settingsSection && !settingsSection.classList.contains('hidden')) {
        iniciarMonitoramentoWhatsApp();
    }

    console.log('ClickAgenda inicializado com sucesso!');
});