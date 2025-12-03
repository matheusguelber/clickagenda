// Funções para mostrar notificações toast na tela

function showToast(message, type = 'info', title = '') {
    const container = document.getElementById('toast-container');
    if (!container) {
        console.error('Container de toast não encontrado!');
        alert(message);
        return;
    }
    
    if (!title) {
        switch(type) {
            case 'success': title = 'Sucesso!'; break;
            case 'error': title = 'Erro!'; break;
            case 'warning': title = 'Atenção!'; break;
            default: title = 'Informação';
        }
    }
    
    let icon = '';
    switch(type) {
        case 'success': icon = 'fas fa-check-circle'; break;
        case 'error': icon = 'fas fa-exclamation-circle'; break;
        case 'warning': icon = 'fas fa-exclamation-triangle'; break;
        default: icon = 'fas fa-info-circle';
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="${icon}"></i>
        </div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
        <div class="toast-progress"></div>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('closing');
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

function showSuccess(message, title = 'Sucesso!') {
    showToast(message, 'success', title);
}

function showError(message, title = 'Erro!') {
    showToast(message, 'error', title);
}

function showWarning(message, title = 'Atenção!') {
    showToast(message, 'warning', title);
}

function showInfo(message, title = 'Informação') {
    showToast(message, 'info', title);
}

function showConfirm(message, title = 'Confirmar?', options = {}) {
    return new Promise((resolve) => {
        let modalContainer = document.getElementById('confirm-modal');
        
        if (!modalContainer) {
            modalContainer = document.createElement('div');
            modalContainer.id = 'confirm-modal';
            modalContainer.className = 'confirm-modal';
            document.body.appendChild(modalContainer);
        }
        
        const isDanger = options.danger || false;
        const confirmText = options.confirmText || 'Confirmar';
        const cancelText = options.cancelText || 'Cancelar';
        
        modalContainer.innerHTML = `
            <div class="confirm-content">
                <div class="confirm-icon ${isDanger ? 'danger' : 'warning'}">
                    <i class="fas ${isDanger ? 'fa-exclamation-triangle' : 'fa-question-circle'}"></i>
                </div>
                <h3 class="confirm-title">${title}</h3>
                <p class="confirm-message">${message}</p>
                <div class="confirm-buttons">
                    <button class="confirm-btn confirm-btn-cancel" id="confirm-cancel">
                        ${cancelText}
                    </button>
                    <button class="confirm-btn ${isDanger ? 'confirm-btn-danger' : 'confirm-btn-confirm'}" id="confirm-yes">
                        ${confirmText}
                    </button>
                </div>
            </div>
        `;
        
        modalContainer.classList.add('active');
        
        document.getElementById('confirm-yes').onclick = () => {
            modalContainer.classList.remove('active');
            resolve(true);
        };
        
        document.getElementById('confirm-cancel').onclick = () => {
            modalContainer.classList.remove('active');
            resolve(false);
        };
        
        modalContainer.onclick = (e) => {
            if (e.target === modalContainer) {
                modalContainer.classList.remove('active');
                resolve(false);
            }
        };
    });
}