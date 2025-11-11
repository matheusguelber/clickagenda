// ===== NAVEGAÇÃO E VISUALIZAÇÃO =====

function showDashboard() {
    document.querySelector('.hero').classList.add('hidden');
    document.querySelector('.features').classList.add('hidden');
    // Mostra o dashboard do barbeiro por padrão
    document.getElementById('dashboard-barbeiro').classList.remove('hidden');
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
    event.target.closest('.sidebar-item').classList.add('active');

    // Oculta todas as seções
    document.getElementById('overview-section').classList.add('hidden');
    document.getElementById('services-section').classList.add('hidden');
    // Adiciona aqui futuras secções (ex: 'clients', 'settings') se precisares
    // document.getElementById('clients-section').classList.add('hidden');
    // document.getElementById('settings-section').classList.add('hidden');


    // Exibe a seção solicitada
    if (section === 'overview') {
        document.getElementById('overview-section').classList.remove('hidden');
    } else if (section === 'services') {
        document.getElementById('services-section').classList.remove('hidden');
        carregarServicos();
    } else {
         // Fallback para 'overview' se a secção não for encontrada
        document.getElementById('overview-section').classList.remove('hidden');
        // (Opcional: podes manter o teu alerta)
        // alert('Seção "' + section + '" em desenvolvimento!');
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


/**
 * Processa envio do formulário de agendamento
 * (Esta função não está a ser usada no dashboard do barbeiro, mas deixamos aqui)
 */
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

/**
 * Processa envio do formulário de serviço
 * (Esta função não está a ser usada no dashboard do barbeiro, mas deixamos aqui)
 */
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

                    // Esconde as seções iniciais
                    document.querySelector('.hero').classList.add('hidden');
                    document.querySelector('.features').classList.add('hidden');

                    // Mostra o dashboard correto
                    if (data.tipo === 'barbeiro') {
                        document.getElementById('dashboard-barbeiro').classList.remove('hidden');
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
    
    console.log('ClickAgenda inicializado com sucesso!');
});