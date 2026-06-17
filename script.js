// Gerenciador de Estado da Aplicação
class TaskManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.form = document.getElementById('task-form');
        this.container = document.getElementById('tasks-container');
        this.statsContainer = document.getElementById('stats');

        this.init();
    }

    init() {
        this.form.addEventListener('submit', (e) => this.handleAddTask(e));
        this.render();
    }

    // Algoritmo de "IA" de Alto Nível: Calcula Score de Prioridade Baseado em Matriz de Decisão
    calculateAiScore(impact, deadline) {
        const today = new Date();
        const dueDate = new Date(deadline);
        const timeDiff = dueDate - today;
        const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        // Quanto menor o prazo e maior o impacto, maior a urgência
        const urgencyWeight = daysLeft <= 0 ? 10 : Math.max(1, 10 - daysLeft);
        const impactWeight = parseInt(impact) * 3;

        return (urgencyWeight + impactWeight).toFixed(1);
    }

    handleAddTask(e) {
        e.preventDefault();

        const title = document.getElementById('task-title').value;
        const date = document.getElementById('task-date').value;
        const impact = document.getElementById('task-impact').value;

        const aiScore = this.calculateAiScore(impact, date);

        const newTask = {
            id: crypto.randomUUID(),
            title,
            date,
            impact,
            aiScore,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.push(newTask);
        this.saveAndRefresh();
        this.form.reset();
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.saveAndRefresh();
    }

    toggleTask(id) {
        this.tasks = this.tasks.map(task => {
            if (task.id === id) task.completed = !task.completed;
            return task;
        });
        this.saveAndRefresh();
    }

    saveAndRefresh() {
        // Ordena automaticamente por Score de IA (Maior prioridade primeiro)
        this.tasks.sort((a, b) => b.aiScore - a.aiScore);
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
        this.render();
    }

    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        this.statsContainer.innerHTML = `📊 Concluídas: <b>${completed}/${total}</b>`;
    }

    getScoreBadgeColor(score) {
        if (score >= 12) return 'bg-red-500/10 text-red-400 border-red-500/20';
        if (score >= 7) return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }

    render() {
        this.container.innerHTML = '';

        if (this.tasks.length === 0) {
            this.container.innerHTML = `
                <div class="text-center p-8 border border-dashed border-slate-700 rounded-2xl text-slate-500 text-sm">
                    Nenhuma tarefa na fila. Adicione uma acima para ativar a IA.
                </div>
            `;
            this.updateStats();
            return;
        }

        this.tasks.forEach(task => {
            const badgeColor = this.getScoreBadgeColor(task.aiScore);
            const isCompleted = task.completed;

            const card = document.createElement('div');
            card.className = `task-card bg-slate-800 border ${isCompleted ? 'border-slate-800 opacity-60' : 'border-slate-700'} p-4 rounded-xl flex justify-between items-center transition-all hover:border-slate-600`;
            
            card.innerHTML = `
                <div class="flex items-center gap-3">
                    <input type="checkbox" ${isCompleted ? 'checked' : ''} class="w-4 h-4 rounded border-slate-600 text-blue-500 focus:ring-0 focus:ring-offset-0 bg-slate-900 cursor-pointer">
                    <div>
                        <p class="text-sm font-semibold ${isCompleted ? 'line-through text-slate-500' : 'text-slate-200'}">${task.title}</p>
                        <p class="text-xs text-slate-400 mt-0.5">Prazo: ${task.date.split('-').reverse().join('/')}</p>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <span class="text-xs px-2.5 py-1 rounded-md border font-mono ${badgeColor}">
                        Score: ${task.aiScore}
                    </span>
                    <button class="delete-btn text-slate-500 hover:text-red-400 text-sm p-1 transition-colors">
                        ✕
                    </button>
                </div>
            `;

            // Eventos do Card
            card.querySelector('input').addEventListener('change', () => this.toggleTask(task.id));
            card.querySelector('.delete-btn').addEventListener('click', () => this.deleteTask(task.id));

            this.container.appendChild(card);
        });

        this.updateStats();
    }
}

// Inicializa a aplicação
document.addEventListener('DOMContentLoaded', () => {
    new TaskManager();
});
