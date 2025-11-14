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
    const sidebarItems = document.querySelectorAll('#dashboard-barbeiro .sidebar-item');
    sidebarItems.forEach(item => item.classList.remove('active'));
    
    // Adiciona classe active ao item clicado
    if (event && event.target) {
        event.target.closest('.sidebar-item').classList.add('active');
    }

    // Oculta TODAS as seções
    const sections = [
        'overview-section',
        'appointments-section', 
        'clients-section',
        'services-section',
        'my-link-section'
    ];
    
    sections.forEach(sectionId => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.classList.add('hidden');
        }
    });

    // Exibe a seção solicitada
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

/**
 * Abre um modal específico
 * @param {string} modalId - ID do modal sem sufixo '-modal'
 */
function showModal(modalId) {
    document.getElementById(modalId + '-modal').classList.add('active');
}

/**
 * Fecha um modal específico
 * @param {string} modalId
 */
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
    // Formulário de Agendamento (do modal antigo, podes remover se não for usar)
    const appointmentForm = document.getElementById('appointment-form');
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // handleAppointmentSubmit(this); // Esta função não está definida, mas tudo bem
        });
    }

    // Formulário de Serviço (do modal antigo, podes remover se não for usar)
    const serviceForm = document.getElementById('service-form');
    if (serviceForm) {
        serviceForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // handleServiceSubmit(this); // Esta função não está definida
        });
    }
}


function handleAppointmentSubmit(form) {
    const formData = new FormData(form);
    
    fetch('backend/agendar.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            closeModal('new-appointment');
            form.reset();
        } else {
            alert('Erro: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Erro na requisição:', error);
        alert('Erro ao conectar ao servidor.');
    });
}


function handleServiceSubmit(form) {
    const formData = new FormData(form);
    
    fetch('backend/adicionar_servico.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            closeModal('new-service');
            form.reset();
        } else {
            alert('Erro: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Erro na requisição:', error);
        alert('Erro ao conectar ao servidor.');
    });
}

// ===== AGENDAMENTOS =====

function editAppointment(appointmentId) {
    showModal('new-appointment');
    console.log('Editando agendamento:', appointmentId);
}

function deleteAppointment(appointmentId) {
    if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
        alert('Agendamento cancelado! (Demo)');
        console.log('Deletando agendamento:', appointmentId);
    }
}

// ===== SERVIÇOS =====

function toggleService(serviceCard) {
    serviceCard.classList.toggle('selected');
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

// ===== ANIMAÇÕES =====
function initializePageTransition() {
    // Podes reativar isto se quiseres
    // document.body.style.opacity = '0';
    // setTimeout(() => {
    //     document.body.style.transition = 'opacity 0.5s';
    //     document.body.style.opacity = '1';
    // }, 100);
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

// ===== FUNÇÕES DE LOGIN/CADASTRO =====

function switchToLogin() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
}

function switchToRegister() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
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
    if (!password) {
        return { level: '', text: '' };
    }
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/\d/)) strength++;
    if (password.match(/[^a-zA-Z\d]/)) strength++;
    
    if (strength <= 1) {
        return { level: 'weak', text: 'Senha fraca - adicione mais caracteres' };
    } else if (strength <= 2) {
        return { level: 'medium', text: 'Senha média - tente adicionar números ou símbolos' };
    } else {
        return { level: 'strong', text: 'Senha forte! ✓' };
    }
}

/**
 * Inicializa formulários de login
 */
function initializeLoginForms() {
    // Máscara de telefone
    const phoneInput = document.getElementById('phone-input');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            e.target.value = phoneMask(e.target.value);
        });
    }

    // Indicador de força da senha
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

    // Login Form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            
            fetch('backend/login.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert(data.message);
                    closeModal('login');
                    
                    localStorage.setItem('user_tipo', data.tipo);
                    localStorage.setItem('user_id', data.user_id || '');
                    localStorage.setItem('user_slug', data.slug || '');
                    localStorage.setItem('user_nome', data.nome || '');
                    atualizarBotaoAuth();
                    // Esconde as seções iniciais
                    document.querySelector('.hero').classList.add('hidden');
                    document.querySelector('.features').classList.add('hidden');

                    // Mostra o dashboard correto
                    if (data.tipo === 'barbeiro') {
                    document.getElementById('dashboard-barbeiro').classList.remove('hidden');
                    carregarDadosDashboard();
                    } else { 
                        // (No futuro, se tiver dashboard de cliente)
                        // document.getElementById('dashboard-cliente').classList.remove('hidden');
                        alert("Tipo de usuário 'cliente' ainda não tem dashboard.");
                    }

                } else {
                    alert('Erro: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Erro na requisição:', error);
                alert('Erro ao conectar ao servidor.');
            });
        });
    }

    // Register Form
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
            if (password.length < 6) {
                alert('A senha deve ter pelo menos 6 caracteres!');
                return;
            }
            
            const formData = new FormData(this);
            
            fetch('backend/cadastro_usuario.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                // ========================================================
                // INÍCIO DA ALTERAÇÃO
                // ========================================================
                if (data.success) {
                    // Manda uma mensagem e troca para o login
                    alert(data.message + "\n\nAgora, faça o login para continuar.");
                    switchToLogin(); // Volta para a tela de login
                } else {
                    // Se der erro (ex: e-mail duplicado), mostra o erro
                    alert('Erro: ' + data.message);
                }
                // ========================================================
                // FIM DA ALTERAÇÃO
                // ========================================================
            })
            .catch(error => {
                console.error('Erro na requisição:', error);
                alert('Erro ao conectar ao servidor.');
            });
        });
    }

    // pedir para redefinir senha
    const forgotLink = document.querySelector('.forgot-link');
    if (forgotLink) {
        forgotLink.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Em breve você receberá um e-mail com instruções para recuperar sua senha!');
        });
    }
}

/**
 * Inicializa o menu hamburger para telemóveis
 */
function initializeHamburgerMenu() {
    const toggleButton = document.getElementById('hamburger-toggle');
    const menu = document.getElementById('nav-links-menu');

    if (toggleButton && menu) {
        toggleButton.addEventListener('click', function() {
            // Adiciona ou remove a classe ".active" do menu
            menu.classList.toggle('active');
        });
    }
}

/**
 * Inicializa o formulário de adicionar serviço
 */
function initializeServiceForm() {
    const serviceForm = document.getElementById('form-adicionar-servico');
    
    if (serviceForm) {
        serviceForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Impede o recarregamento da página
            
            const formData = new FormData(this);
            
            fetch('backend/adicionar_servico.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                alert(data.message); // Mostra "Serviço adicionado!" ou "Acesso não autorizado."
                if (data.success) {
                    serviceForm.reset();
                    carregarServicos(); // Limpa o formulário
                    // (No futuro, aqui também atualizamos a lista de serviços)
                }
            })
            .catch(error => {
                console.error('Erro na requisição:', error);
                alert('Erro ao conectar ao servidor.');
            });
        });
    }
}

/**
 * Busca os serviços do barbeiro no backend e os exibe na lista
 */
function carregarServicos() {
    const listaDiv = document.getElementById('lista-de-servicos');
    if (!listaDiv) return; // Sai se o elemento não existir

    // Mostra um "loading"
    listaDiv.innerHTML = '<p>A carregar serviços...</p>';

    fetch('backend/listar_servicos.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Limpa o "loading"
                listaDiv.innerHTML = ''; 
                
                if (data.servicos.length === 0) {
                    listaDiv.innerHTML = '<p>Ainda não tens serviços cadastrados.</p>';
                    return;
                }

                // Cria o HTML para cada serviço
                data.servicos.forEach(servico => {
                    // Converte o preço (ex: 45.00) para R$ 45,00
                    const precoFormatado = new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                    }).format(servico.preco);

                    const servicoHTML = `
                        <div class="service-card">
                            <h4><i class="fas fa-cut"></i> ${servico.nome_servico}</h4>
                            <div class="service-price">${precoFormatado}</div>
                            <p>Duração: ${servico.duracao_minutos} min</p>
                        </div>
                    `;
                    // Adiciona o HTML do serviço à lista
                    listaDiv.innerHTML += servicoHTML;
                });
                
            } else {
                listaDiv.innerHTML = `<p style="color: red;">${data.message}</p>`;
            }
        })
        .catch(error => {
            console.error('Erro ao carregar serviços:', error);
            listaDiv.innerHTML = '<p style="color: red;">Erro ao ligar ao servidor.</p>';
        });
}

// ===== FUNÇÕES DO LINK DE AGENDAMENTO =====

function carregarLinkAgendamento() {
    const slug = localStorage.getItem('user_slug');
    if (!slug) {
        alert('Erro: Slug não encontrado. Faça login novamente.');
        return;
    }
    
    const linkCompleto = window.location.origin + '/clickagenda/agendar.php?barbeiro=' + slug;
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
        alert('✅ Link copiado com sucesso! Cole no WhatsApp, Instagram ou onde preferir.');
    } catch (err) {
        alert('Erro ao copiar. Por favor, copie manualmente o link.');
    }
}

function abrirPreview() {
    const slug = localStorage.getItem('user_slug');
    if (!slug) {
        alert('Erro: Slug não encontrado.');
        return;
    }
    
    const url = window.location.origin + '/clickagenda/agendar.php?barbeiro=' + slug;
    window.open(url, '_blank');
}

// ===== CARREGAR DADOS DO DASHBOARD =====

/**
 * Carrega todos os dados do dashboard do barbeiro logado
 */
function carregarDadosDashboard() {
    carregarEstatisticas();
    carregarProximosAgendamentos();
    gerarCalendarioSemana();
}

/**
 * Carrega as estatísticas do barbeiro (cards de números)
 */
function carregarEstatisticas() {
    fetch('backend/obter_estatisticas.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Atualiza os cards de estatísticas
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
        .catch(error => console.error('Erro ao carregar estatísticas:', error));
}

/**
 * Carrega os próximos agendamentos do barbeiro
 */
function carregarProximosAgendamentos() {
    fetch('backend/obter_agendamentos.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const lista = document.querySelector('.appointments-list');
                const agendamentos = data.agendamentos;
                
                // Mantém o título e remove agendamentos antigos
                lista.innerHTML = '<h3>Próximos Agendamentos</h3>';
                
                if (agendamentos.length === 0) {
                    lista.innerHTML += '<p style="text-align: center; color: var(--text-light); padding: 2rem;">Nenhum agendamento próximo.</p>';
                    return;
                }
                
                // Adiciona os agendamentos reais
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
                                <button class="btn-icon btn-edit" onclick="editarAgendamento(${agendamento.id})" title="Editar">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn-icon btn-delete" onclick="cancelarAgendamento(${agendamento.id})" title="Cancelar">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    `;
                    lista.innerHTML += itemHTML;
                });
            }
        })
        .catch(error => console.error('Erro ao carregar agendamentos:', error));
}

/**
 * Cancela um agendamento
 */
function cancelarAgendamento(agendamentoId) {
    if (!confirm('Tem certeza que deseja cancelar este agendamento?')) {
        return;
    }
    
    const formData = new FormData();
    formData.append('agendamento_id', agendamentoId);
    
    fetch('backend/cancelar_agendamento.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        if (data.success) {
            carregarTodosAgendamentos(); // Recarrega a lista
            carregarEstatisticas(); // Atualiza estatísticas
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao cancelar agendamento.');
    });
}

/**
 * Edita um agendamento (placeholder para implementação futura)
 */
function editarAgendamento(agendamentoId) {
    alert('Funcionalidade de edição em desenvolvimento! ID: ' + agendamentoId);
    // Futuramente: abrir modal com dados do agendamento
}

// ===== SISTEMA DE AUTENTICAÇÃO (LOGIN/LOGOUT) =====

/**
 * Atualiza o botão de login/logout baseado no estado de autenticação
 */
function atualizarBotaoAuth() {
    const btnAuth = document.getElementById('btn-auth');
    const userId = localStorage.getItem('user_id');
    const userName = localStorage.getItem('user_nome');
    
    if (!btnAuth) return;
    
    if (userId) {
        // Usuário está logado
        btnAuth.innerHTML = '<i class="fas fa-sign-out-alt"></i> Sair';
        btnAuth.onclick = fazerLogout;
        
        // Opcional: Mostrar nome do usuário
        if (userName) {
            btnAuth.innerHTML = `<i class="fas fa-user"></i> ${userName.split(' ')[0]} | Sair`;
        }
    } else {
        // Usuário não está logado
        btnAuth.innerHTML = '<i class="fas fa-sign-in-alt"></i> Entrar';
        btnAuth.onclick = handleAuthButton;
    }
}

/**
 * Gerencia o clique no botão de autenticação
 */
function handleAuthButton() {
    const userId = localStorage.getItem('user_id');
    
    if (userId) {
        fazerLogout();
    } else {
        showLogin();
    }
}

/**
 * Faz logout do usuário
 */
function fazerLogout() {
    if (confirm('Tem certeza que deseja sair?')) {
        // Limpa os dados do localStorage
        localStorage.removeItem('user_id');
        localStorage.removeItem('user_tipo');
        localStorage.removeItem('user_nome');
        localStorage.removeItem('user_slug');
        
        // Esconde o dashboard
        document.getElementById('dashboard-barbeiro').classList.add('hidden');
        
        // Mostra as seções iniciais
        document.querySelector('.hero').classList.remove('hidden');
        document.querySelector('.features').classList.remove('hidden');
        
        // Atualiza o botão
        atualizarBotaoAuth();
        
        alert('Você saiu com sucesso!');
    }
}

// ===== SEÇÃO DE AGENDAMENTOS COMPLETOS =====

/**
 * Carrega todos os agendamentos com filtros
 */
function carregarTodosAgendamentos() {
    const status = document.getElementById('filter-status')?.value || 'todos';
    const data = document.getElementById('filter-date')?.value || '';
    
    const params = new URLSearchParams();
    if (status !== 'todos') params.append('status', status);
    if (data) params.append('data', data);
    
    const lista = document.getElementById('lista-agendamentos-completa');
    
    // Aplica estilos ao container
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
                const card = document.createElement('div');
                
                // Define cores por status
                let statusColor = '#f39c12';
                let statusBg = '#fff3cd';
                let statusText = 'PENDENTE';
                
                if (ag.status === 'confirmado') {
                    statusColor = '#27ae60';
                    statusBg = '#d4edda';
                    statusText = 'CONFIRMADO';
                } else if (ag.status === 'cancelado') {
                    statusColor = '#e74c3c';
                    statusBg = '#f8d7da';
                    statusText = 'CANCELADO';
                }
                
                card.style.cssText = `
                    background: white;
                    border-radius: 12px;
                    padding: 1.5rem;
                    border-left: 4px solid ${statusColor};
                    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                    transition: all 0.3s;
                    display: grid;
                    grid-template-columns: 1fr auto;
                    gap: 1rem;
                    align-items: center;
                    ${ag.status === 'cancelado' ? 'opacity: 0.7;' : ''}
                `;
                
                // Monta o HTML do conteúdo
                let botoesHTML = '';
                
                // Só mostra botões se o status for PENDENTE
                if (ag.status === 'pendente') {
                    botoesHTML = `
                        <div style="display: flex; gap: 0.5rem; flex-direction: column;">
                            <button onclick="confirmarAgendamento(${ag.id})" style="
                                width: 45px;
                                height: 45px;
                                border-radius: 10px;
                                border: none;
                                background: #27ae60;
                                color: white;
                                cursor: pointer;
                                transition: all 0.3s;
                                font-size: 1.1rem;
                            " onmouseover="this.style.transform='scale(1.1)'; this.style.background='#229954';" 
                               onmouseout="this.style.transform='scale(1)'; this.style.background='#27ae60';"
                               title="Confirmar">
                                <i class="fas fa-check"></i>
                            </button>
                            <button onclick="cancelarAgendamento(${ag.id})" style="
                                width: 45px;
                                height: 45px;
                                border-radius: 10px;
                                border: none;
                                background: #e74c3c;
                                color: white;
                                cursor: pointer;
                                transition: all 0.3s;
                                font-size: 1.1rem;
                            " onmouseover="this.style.transform='scale(1.1)'; this.style.background='#c0392b';" 
                               onmouseout="this.style.transform='scale(1)'; this.style.background='#e74c3c';"
                               title="Cancelar">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    `;
                }
                
                card.innerHTML = `
                    <div>
                        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.75rem; flex-wrap: wrap;">
                            <span style="
                                background: ${statusBg};
                                color: ${statusColor};
                                padding: 0.35rem 0.75rem;
                                border-radius: 20px;
                                font-size: 0.75rem;
                                font-weight: 700;
                                letter-spacing: 0.5px;
                            ">${statusText}</span>
                            <span style="color: #666; font-size: 0.9rem;">
                                <i class="fas fa-calendar" style="color: #d4af37;"></i> ${ag.data_formatada}
                            </span>
                            <span style="color: #666; font-size: 0.9rem;">
                                <i class="fas fa-clock" style="color: #d4af37;"></i> ${ag.hora}
                            </span>
                        </div>
                        
                        <h4 style="color: #1a1a2e; margin-bottom: 0.5rem; font-size: 1.1rem;">
                            <i class="fas fa-user" style="color: #d4af37;"></i> ${ag.cliente_nome}
                        </h4>
                        
                        <p style="color: #666; margin-bottom: 0.25rem; font-size: 0.9rem;">
                            <i class="fas fa-phone" style="color: #d4af37; width: 14px;"></i> ${ag.cliente_telefone}
                        </p>
                        
                        <p style="color: #333; margin-bottom: 0.25rem; font-size: 0.95rem;">
                            <i class="fas fa-cut" style="color: #d4af37; width: 14px;"></i> ${ag.servico_nome} • <strong>R$ ${ag.preco}</strong>
                        </p>
                        
                        ${ag.observacoes ? `
                            <p style="color: #666; font-size: 0.85rem; margin-top: 0.5rem; font-style: italic;">
                                <i class="fas fa-comment" style="color: #d4af37;"></i> ${ag.observacoes}
                            </p>
                        ` : ''}
                    </div>
                    
                    ${botoesHTML}
                `;
                
                // Hover effect
                card.onmouseenter = function() {
                    if (ag.status !== 'cancelado') {
                        this.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)';
                        this.style.transform = 'translateY(-2px)';
                    }
                };
                card.onmouseleave = function() {
                    this.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                    this.style.transform = 'translateY(0)';
                };
                
                lista.appendChild(card);
            });
        })
        .catch(error => {
            console.error('Erro:', error);
            lista.innerHTML = '<p style="text-align: center; color: red;">Erro ao carregar agendamentos.</p>';
        });
}

/**
 * Confirma um agendamento
 */
function confirmarAgendamento(agendamentoId) {
    const formData = new FormData();
    formData.append('agendamento_id', agendamentoId);
    formData.append('status', 'confirmado');
    
    fetch('backend/atualizar_status_agendamento.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        if (data.success) {
            // Recarrega TUDO para garantir que atualiza
            carregarTodosAgendamentos();
            carregarEstatisticas();
            carregarProximosAgendamentos();
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao confirmar agendamento.');
    });
}

/**
 * Limpa os filtros de agendamentos
 */
function limparFiltros() {
    document.getElementById('filter-status').value = 'todos';
    document.getElementById('filter-date').value = '';
    carregarTodosAgendamentos();
}

// ===== SEÇÃO DE CLIENTES =====

/**
 * Carrega lista de clientes
 */
function carregarClientes() {
    const lista = document.getElementById('lista-clientes');
    
    // Aplica o estilo de grid diretamente (mais compacto)
    lista.style.display = 'grid';
    lista.style.gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';
    lista.style.gap = '1.5rem';
    lista.style.marginTop = '1.5rem';
    
    // Mostra loading
    lista.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem; grid-column: 1/-1;">Carregando clientes...</p>';
    
    fetch('backend/listar_clientes.php')
        .then(response => response.json())
        .then(data => {
            const totalCountSpan = document.getElementById('total-clientes-count');
            if (totalCountSpan && data.clientes) {
                totalCountSpan.textContent = data.clientes.length;
            }
            
            if (!data.success || !data.clientes || data.clientes.length === 0) {
                lista.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem; grid-column: 1/-1;">Nenhum cliente encontrado.</p>';
                return;
            }
            
            // LIMPA a lista
            lista.innerHTML = '';
            
            // Gera os cards
            data.clientes.forEach(cliente => {
                const iniciais = cliente.cliente_nome
                    .split(' ')
                    .map(n => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();
                
                // Cria o card com estilos inline (mais compacto)
                const card = document.createElement('div');
                card.style.cssText = `
                    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
                    border-radius: 16px;
                    padding: 0;
                    border: 1px solid #e9ecef;
                    overflow: hidden;
                    transition: all 0.3s;
                `;
                
                card.innerHTML = `
                    <div style="
                        display: flex;
                        align-items: center;
                        gap: 1rem;
                        padding: 1.25rem;
                        background: linear-gradient(135deg, #1a1a2e 0%, #2a2a3e 100%);
                    ">
                        <div style="
                            width: 50px;
                            height: 50px;
                            min-width: 50px;
                            border-radius: 14px;
                            background: linear-gradient(135deg, #d4af37 0%, #f4a261 100%);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 1.25rem;
                            color: white;
                            font-weight: bold;
                            box-shadow: 0 4px 12px rgba(212, 175, 55, 0.4);
                        ">${iniciais}</div>
                        <div style="flex: 1; min-width: 0;">
                            <h4 style="
                                color: white;
                                margin: 0 0 0.25rem 0;
                                font-size: 1rem;
                                font-weight: 700;
                                white-space: nowrap;
                                overflow: hidden;
                                text-overflow: ellipsis;
                            ">${cliente.cliente_nome}</h4>
                            <p style="
                                color: rgba(255, 255, 255, 0.8);
                                font-size: 0.85rem;
                                display: flex;
                                align-items: center;
                                gap: 0.35rem;
                                margin: 0;
                            ">
                                <i class="fas fa-phone" style="color: #d4af37; font-size: 0.75rem;"></i> 
                                ${cliente.cliente_telefone}
                            </p>
                        </div>
                    </div>
                    <div style="
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 0;
                        padding: 1.25rem;
                    ">
                        <div style="
                            padding: 0.75rem;
                            text-align: center;
                            border-right: 1px solid #e9ecef;
                        ">
                            <i class="fas fa-calendar-check" style="
                                font-size: 1.25rem;
                                color: #d4af37;
                                margin-bottom: 0.35rem;
                                display: block;
                                opacity: 0.7;
                            "></i>
                            <span style="
                                font-size: 1.5rem;
                                font-weight: 800;
                                color: #1a1a2e;
                                display: block;
                                line-height: 1;
                                margin-bottom: 0.25rem;
                            ">${cliente.total_agendamentos}</span>
                            <span style="
                                font-size: 0.7rem;
                                color: #999;
                                text-transform: uppercase;
                                font-weight: 600;
                                letter-spacing: 0.5px;
                                display: block;
                            ">Agendamentos</span>
                        </div>
                        <div style="
                            padding: 0.75rem;
                            text-align: center;
                        ">
                            <i class="fas fa-coins" style="
                                font-size: 1.25rem;
                                color: #d4af37;
                                margin-bottom: 0.35rem;
                                display: block;
                                opacity: 0.7;
                            "></i>
                            <span style="
                                font-size: 1.5rem;
                                font-weight: 800;
                                color: #1a1a2e;
                                display: block;
                                line-height: 1;
                                margin-bottom: 0.25rem;
                            ">R$ ${cliente.total_gasto}</span>
                            <span style="
                                font-size: 0.7rem;
                                color: #999;
                                text-transform: uppercase;
                                font-weight: 600;
                                letter-spacing: 0.5px;
                                display: block;
                            ">Total Gasto</span>
                        </div>
                    </div>
                `;
                
                // Adiciona hover effect
                card.onmouseenter = function() {
                    this.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                    this.style.transform = 'translateY(-4px)';
                    this.style.borderColor = '#d4af37';
                };
                card.onmouseleave = function() {
                    this.style.boxShadow = 'none';
                    this.style.transform = 'translateY(0)';
                    this.style.borderColor = '#e9ecef';
                };
                
                lista.appendChild(card);
            });
        })
        .catch(error => {
            console.error('Erro:', error);
            lista.innerHTML = '<p style="text-align: center; color: red; grid-column: 1/-1;">Erro ao carregar clientes.</p>';
        });
}

/**
 * Busca clientes por nome ou telefone
 */
function buscarClientes() {
    const termo = document.getElementById('search-client').value.toLowerCase();
    const cards = document.querySelectorAll('.client-card');
    
    cards.forEach(card => {
        const texto = card.textContent.toLowerCase();
        if (texto.includes(termo)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

/**
 * Navega para a página inicial (Hero + Features)
 */
function navegarParaInicio() {
    // Esconde o dashboard
    document.getElementById('dashboard-barbeiro').classList.add('hidden');
    
    // Mostra as seções iniciais
    document.querySelector('.hero').classList.remove('hidden');
    document.querySelector('.features').classList.remove('hidden');
    
    // Scroll suave para o topo
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Navega para a seção de funcionalidades
 */
function navegarParaFuncionalidades() {
    // Esconde o dashboard se estiver aberto
    document.getElementById('dashboard-barbeiro').classList.add('hidden');
    
    // Mostra as seções iniciais
    document.querySelector('.hero').classList.remove('hidden');
    document.querySelector('.features').classList.remove('hidden');
    
    // Scroll suave até a seção de funcionalidades
    setTimeout(() => {
        document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
    }, 100);
}

/**
 * Navega para o dashboard (se logado)
 */
function navegarParaDashboard() {
    const userId = localStorage.getItem('user_id');
    const userTipo = localStorage.getItem('user_tipo');
    
    if (!userId || !userTipo) {
        // Se não estiver logado, abre o modal de login
        showModal('login');
        return;
    }
    
    showDashboard();
}

/**
 * Gera o calendário da semana atual
 */
function gerarCalendarioSemana() {
    const calendarGrid = document.querySelector('.calendar-grid');
    if (!calendarGrid) return;
    
    // Limpa o calendário
    calendarGrid.innerHTML = '';
    
    // Pega a data de hoje
    const hoje = new Date();
    const diaSemana = hoje.getDay(); // 0 = Domingo, 1 = Segunda, etc.
    
    // Calcula o domingo da semana atual
    const domingo = new Date(hoje);
    domingo.setDate(hoje.getDate() - diaSemana);
    
    // Dias da semana
    const diasSemana = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
    
    // Gera os 7 dias da semana
    for (let i = 0; i < 7; i++) {
        const dia = new Date(domingo);
        dia.setDate(domingo.getDate() + i);
        
        const diaNumero = dia.getDate();
        const mesAtual = dia.getMonth() === hoje.getMonth();
        const ehHoje = dia.toDateString() === hoje.toDateString();
        
        // Verifica se tem agendamentos neste dia (vamos fazer isso depois)
        const temAgendamento = false; // Por enquanto false
        
        // Cria o elemento do dia
        const diaElement = document.createElement('div');
        diaElement.className = 'calendar-day';
        
        if (ehHoje) {
            diaElement.classList.add('today');
        }
        
        if (temAgendamento) {
            diaElement.classList.add('has-appointment');
        }
        
        if (!mesAtual) {
            diaElement.style.opacity = '0.5';
        }
        
        diaElement.innerHTML = `
            <strong>${diasSemana[i]}</strong><br>${diaNumero}
        `;
        
        // Adiciona evento de clique
        diaElement.onclick = function() {
            // Remove seleção anterior
            document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
            // Adiciona seleção ao dia clicado
            this.classList.add('selected');
            // Filtra agendamentos deste dia (implementar depois)
            console.log('Dia clicado:', dia.toISOString().split('T')[0]);
        };
        
        calendarGrid.appendChild(diaElement);
    }
}


// Modal de recuperação de senha
    const forgotLink = document.querySelector('.forgot-link');
    if (forgotLink) {
        forgotLink.addEventListener('click', function(e) {
            e.preventDefault();
            solicitarRecuperacaoSenha();
        });
    }



/**
 * Solicita recuperação de senha
 */
function solicitarRecuperacaoSenha() {
    const email = prompt('Digite seu e-mail cadastrado:');
    
    if (!email) {
        return;
    }
    
    if (!validateEmail(email)) {
        alert('Por favor, digite um e-mail válido.');
        return;
    }
    
    const formData = new FormData();
    formData.append('email', email);
    
    // Mostra mensagem de carregamento
    const btnOriginal = event.target;
    const textoOriginal = btnOriginal.textContent;
    btnOriginal.textContent = 'Enviando...';
    btnOriginal.disabled = true;
    
    fetch('backend/esqueci_senha.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao conectar ao servidor.');
    })
    .finally(() => {
        btnOriginal.textContent = textoOriginal;
        btnOriginal.disabled = false;
    });
}


// ===== INICIALIZAÇÃO =====

/**
 */
document.addEventListener('DOMContentLoaded', function() {
    initializeForms();
    initializeLoginForms();
    initializeCalendar();
    initializePageTransition();
    initializeHamburgerMenu(); 
    initializeServiceForm(); // <-- Adicionámos isto no passo anterior
    atualizarBotaoAuth();
    console.log('ClickAgenda inicializado com sucesso!');
});