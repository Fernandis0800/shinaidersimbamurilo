class TaskManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        
        // Carrega configurações customizadas do site ou usa o padrão
        this.siteConfig = JSON.parse(localStorage.getItem('siteConfig')) || {
            name: "TaskFlow AI",
            subtitle: "Gerenciamento de tarefas com priorização inteligente.",
            theme: "from-blue-400 to-emerald-400"
        };

        // Hash SHA-256 gerado para a senha "admin123"
        this.adminHash = "240951435b14e8c0f438335300d72bde758e461f52e3e44d8b875bc37433639e";

        this.initElements();
        this.init();
    }

    initElements() {
        this.form = document.getElementById('task-form');
        this.container = document.getElementById('tasks-container');
        this.statsContainer = document.getElementById('stats');
        
        // Elementos de Customização e Admin
        this.adminBtn = document.getElementById('admin-login-btn');
        this.adminPanel = document.getElementById('admin-panel');
        this.logoutBtn = document.getElementById('admin-logout-btn');
        this.saveCustomBtn = document.getElementById('save-custom-btn');
        
        // Campos para alterar dados
        this.customNameInput = document.getElementById('custom-name');
        this.customSubtitleInput = document.getElementById('custom-subtitle');
        this.customThemeInput = document.getElementById('custom-theme');
    }

    init() {
        this.form.addEventListener('submit', (e) => this.handleAddTask(e));
        this.adminBtn.addEventListener('click', () => this.handleAdminLogin());
        this.logoutBtn.addEventListener('click', () => this.handleAdminLogout());
        this.saveCustomBtn.addEventListener('click', () => this.handleSaveCustomization());

        this.applyCustomization();
        this.render();
        this.checkAdminSession();
    }

    // Função de Criptografia Rápida WebCrypto API (Nível Profissional)
    async sha256(string) {
        const utf8 = new TextEncoder().encode(string);
        const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(bytes => bytes.toString(16).padStart(2, '0')).join('');
    }

    // Login seguro
    async handleAdminLogin() {
        const password = prompt("Digite a Chave Mestra de Administrador:");
        if (!password) return;

        const inputHash = await this.sha256(password);

        if (inputHash === this.adminHash) {
            sessionStorage.setItem('isAdmin', 'true');
            this.showAdminPanel();
            alert("Acesso concedido, Chefe! Painel de controle liberado.");
        } else {
            alert("Acesso Negado. Senha incorreta.");
        }
    }

    checkAdminSession() {
        if (sessionStorage.getItem('isAdmin') === 'true') {
            this.showAdminPanel();
        }
    }

    showAdminPanel() {
        this.adminPanel.classList.remove('hidden');
        this.customNameInput.value = this.siteConfig.name;
        this.customSubtitleInput.value = this.siteConfig.subtitle;
        this.customThemeInput.value = this.siteConfig.theme;
    }

    handleAdminLogout() {
        sessionStorage.removeItem('isAdmin');
        this.adminPanel.classList.add('hidden');
    }

    // Aplica e salva as mudanças visuais que você fizer
    handleSaveCustomization() {
        this.siteConfig.name = this.customNameInput.value;
        this.siteConfig.subtitle = this.customSubtitleInput.value;
        this.siteConfig.theme = this.customThemeInput.value;

        localStorage.setItem('siteConfig', JSON.stringify(this.siteConfig));
        this.applyCustomization();
        alert("Site personalizado com sucesso!");
    }

    applyCustomization() {
        const nameEl = document.getElementById('site-name');
        const subtitleEl = document.getElementById('site-subtitle');
        const titleTag = document.getElementById('site-title-tag');
        const submitBtn = document.getElementById('submit-btn');

        // Altera os textos
        nameEl.innerText = this.siteConfig.name;
        subtitleEl.innerText = this.siteConfig.subtitle;
        titleTag.innerText = this.siteConfig.name + " - Dashboard";

        // Reseta as classes de gradiente antigas e aplica o novo tema
        nameEl.className = `text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r ${this.siteConfig.theme}`;
        
        // Altera a cor do botão principal para combinar com o tema escolhido
        const mainColor = this.siteConfig.theme.split(' ')[0].replace('from-', '');
        submitBtn.className = `w-full bg-${mainColor.replace('-400', '-500').replace('-500', '-600')} text-white font-medium text-sm py-2.5 rounded-lg transition-all shadow-lg`;
    }

    // --- Lógica de Negócio do App (Permanece robusta) ---
    calculateAiScore(impact, deadline) {
        const today = new Date();
        const dueDate = new Date(deadline);
        const daysLeft = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
        const urgencyWeight = daysLeft <= 0 ? 10 : Math.max(1, 10 - daysLeft);
        const impactWeight = parseInt(impact) * 3;
        return (urgencyWeight + impactWeight).toFixed(1);
    }

    handleAddTask(e) {
        e.preventDefault();
        const title = document.getElementById('task-title').value;
        const date = document.getElementById('task-date').value;
        const impact = document.getElementById('task-impact').value;

        this.tasks.push({
            id: crypto.randomUUID(),
            title, date, impact,
            aiScore: this.calculateAiScore(impact, date),
            completed: false
        });

        this.saveAndRefresh();
        this.form.reset();
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.saveAndRefresh();
    }

    toggleTask(id) {
        this.tasks = this.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
        this.saveAndRefresh();
    }

    saveAndRefresh() {
        this.tasks.sort((a, b) => b.aiScore - a.aiScore);
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
        this.render();
    }

    updateStats() {
        this.statsContainer.innerHTML = `📊 Tarefas: <b>${this.tasks.filter(t=>t.completed).length}/${this.tasks.length}</b>`;
    }

    render() {
        this.container.innerHTML = '';
        if (this.tasks.length === 0) {
            this.container.innerHTML = `<div class="text-center p-8 border border-dashed border-slate-700 rounded-2xl text-slate-500 text-sm">Fila limpa.</div>`;
            this.updateStats();
            return;
        }

        this.tasks.forEach(task => {
            const card = document.createElement('div');
            card.className = `bg-slate-800 border ${task.completed ? 'border-slate-800 opacity-50' : 'border-slate-700'} p-4 rounded-xl flex justify-between items-center transition-all`;
            card.innerHTML = `
                <div class="flex items-center gap-3">
                    <input type="checkbox" ${task.completed ? 'checked' : ''} class="w-4 h-4 rounded bg-slate-900 cursor-pointer">
                    <div>
                        <p class="text-sm font-semibold ${task.completed ? 'line-through text-slate-500' : 'text-slate-200'}">${task.title}</p>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <span class="text-xs px-2 py-0.5 rounded border border-slate-600 font-mono text-slate-400">Score: ${task.aiScore}</span>
                    <button class="del-btn text-slate-500 hover:text-red-400 text-sm">✕</button>
                </div>
            `;
            card.querySelector('input').addEventListener('change', () => this.toggleTask(task.id));
            card.querySelector('.del-btn').addEventListener('click', () => this.deleteTask(task.id));
            this.container.appendChild(card);
        });
        this.updateStats();
    }
}

document.addEventListener('DOMContentLoaded', () => new TaskManager());
