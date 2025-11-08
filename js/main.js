// ===== NAVEGAÇÃO E VISUALIZAÇÃO =====

function showDashboard() {
    document.querySelector('.hero').classList.add('hidden');
    document.querySelector('.features').classList.add('hidden');
    document.querySelector('.dashboard').classList.remove('hidden');
}

function showLogin() {
    showModal('login');
}

/**
 * Alterna entre seções do dashboard
 * @param {string} section - Nome da seção a ser exibida
 */
function showSection(section) {
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    sidebarItems.forEach(item => item.classList.remove('active'));
    
    // Adiciona classe active ao item clicado
    event.target.closest('.sidebar-item').classList.add('active');

    // Oculta todas as seções
    document.getElementById('overview-section').classList.add('hidden');
    document.getElementById('services-section').classList.add('hidden');

    // Exibe a seção solicitada
    if (section === 'overview') {
        document.getElementById('overview-section').classList.remove('hidden');
    } else if (section === 'services') {
        document.getElementById('services-section').classList.remove('hidden');
    } else {
        alert('Seção "' + section + '" em desenvolvimento!');
        document.getElementById('overview-section').classList.remove('hidden');
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
    // Formulário de Agendamento
    const appointmentForm = document.getElementById('appointment-form');
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleAppointmentSubmit(this);
        });
    }

    // Formulário de Serviço
    const serviceForm = document.getElementById('service-form');
    if (serviceForm) {
        serviceForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleServiceSubmit(this);
        });
    }
}


/**
 * Processa envio do formulário de agendamento
 * @param {HTMLFormElement} form - Formulário de agendamento
 */
function handleAppointmentSubmit(form) {
    const formData = new FormData(form);
    
    // ========================================================
    // CORREÇÃO NGROK 1: Caminho relativo
    // ========================================================
    fetch('backend/agendar.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message);  // Ex.: "Agendamento realizado!"
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
 * @param {HTMLFormElement} form - Formulário de serviço
 */
function handleServiceSubmit(form) {
    const formData = new FormData(form);
    
    // ========================================================
    // CORREÇÃO NGROK 2: Caminho relativo
    // ========================================================
    fetch('backend/adicionar_servico.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message);  // Ex.: "Serviço adicionado!"
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

/**
 * Edita um agendamento
 * @param {number} appointmentId - ID do agendamento
 */
function editAppointment(appointmentId) {
    showModal('new-appointment');
    console.log('Editando agendamento:', appointmentId);
}

/**
 * Deleta um agendamento
 * @param {number} appointmentId - ID do agendamento
 */
function deleteAppointment(appointmentId) {
    if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
        // possivel requisição DELETE para o backend
        // fetch('/api/appointments/' + appointmentId, {
        //     method: 'DELETE'
        // })
        
        alert('Agendamento cancelado! (Demo)');
        console.log('Deletando agendamento:', appointmentId);
    }
}

// ===== SERVIÇOS =====

/**
 * Seleciona/deseleciona um serviço
 * @param {HTMLElement} serviceCard
 */
function toggleService(serviceCard) {
    serviceCard.classList.toggle('selected');
}

// ===== CALENDÁRIO =====
function initializeCalendar() {
    const calendarDays = document.querySelectorAll('.calendar-day');
    
    calendarDays.forEach(day => {
        day.addEventListener('click', function() {
            // Exibir agendamentos do dia selecionado
            console.log('Dia selecionado:', this.textContent);
        
        });
    });
}

// ===== ANIMAÇÕES =====
function initializePageTransition() {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s';
        document.body.style.opacity = '1';
    }, 100);
}

// ===== UTILITÁRIOS =====

/**
 * Formata valor monetário
 * @param {number} value
 * @returns {string}
 */
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

/**
 * Formata data
 * @param {Date} date 
 */
function formatDate(date) {
    return new Intl.DateTimeFormat('pt-BR').format(date);
}

/**
 * Valida formato de email
 * @param {string} email - Email a ser validado
 * @returns {boolean} True se válido
 */
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

/**
 * Alterna visibilidade da senha
 * @param {string} inputId 
 */
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

/**
 * telefone padrao brasil
 * @param {string} value - 
 * @returns {string} 
 */
function phoneMask(value) {
    if (!value) return '';
    value = value.replace(/\D/g, '');
    value = value.replace(/(\d{2})(\d)/, '($1) $2');
    value = value.replace(/(\d)(\d{4})$/, '$1-$2');
    return value;
}

/**
 * Verifica força da senha
 * @param {string} password - Senha a ser verificada
 * @returns {Object} Objeto com força e texto
 */
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
            
            // ========================================================
            // CORREÇÃO NGROK 3: Caminho relativo
            // ========================================================
            fetch('backend/login.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert(data.message);  // Ex.: "Login realizado!"
                    closeModal('login');
                    showDashboard();
                    // Salva dados do usuário
                    localStorage.setItem('user_tipo', data.tipo);
                    localStorage.setItem('user_id', data.user_id || '');  // Adicione no PHP se precisar
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
            
            // Coletar dados do formulário
            const formData = new FormData(this);
            
            // DEBUG (OPCIONAL)
            console.log("----- DADOS QUE ESTÃO SENDO ENVIADOS (CADASTRO) -----");
            for (let [key, value] of formData.entries()) {
                console.log(key + ': ' + value);
            }
            console.log("---------------------------------------------------");
            
            
            // ========================================================
            // CORREÇÃO NGROK 4: Caminho relativo
            // ========================================================
            fetch('backend/cadastro_usuario.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert(data.message);  // Ex.: "Usuário cadastrado com sucesso!"
                    closeModal('login');
                    showDashboard();
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

    // pedir para redefinir senha
    const forgotLink = document.querySelector('.forgot-link');
    if (forgotLink) {
        forgotLink.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Em breve você receberá um e-mail com instruções para recuperar sua senha!');
        });
    }
}

// ===== INICIALIZAÇÃO =====

/**
 */
document.addEventListener('DOMContentLoaded', function() {
    initializeForms();        // Inicializa forms de agendamento/serviço
    initializeLoginForms();   // Inicializa forms de login/cadastro
    initializeCalendar();
    initializePageTransition();
    
    console.log('ClickAgenda inicializado com sucesso!');
});

// ===== EXPORTAÇÕES

// export {
//     showDashboard,
//     showLogin,
//     showSection,
//     showModal,
//     closeModal,
//     formatCurrency,
//     formatDate,
//     validateEmail
// };