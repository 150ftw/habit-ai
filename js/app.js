document.addEventListener('DOMContentLoaded', () => {
    const simulator = new Simulator();
    const charts = new DashboardCharts();

    // UI Elements
    const energyBar = document.getElementById('energy-bar');
    const motivationBar = document.getElementById('motivation-bar');
    const workloadBar = document.getElementById('workload-bar');
    
    const energyVal = document.getElementById('energy-val');
    const motivationVal = document.getElementById('motivation-val');
    const workloadVal = document.getElementById('workload-val');
    
    const agentStatusText = document.getElementById('agent-status');
    const totalRewardText = document.getElementById('total-reward');
    const simTimeText = document.getElementById('sim-time');
    const habitScoreText = document.getElementById('habit-score');
    const lastActionText = document.getElementById('last-action-text');
    const simLog = document.getElementById('sim-log');
    const recapContent = document.getElementById('daily-recap-content');
    const weeklyReport = document.getElementById('weekly-report');
    const weeklyWork = document.getElementById('weekly-work');
    const weeklyScore = document.getElementById('weekly-score');
    const weeklyReward = document.getElementById('weekly-reward');
    const weeklySummary = document.getElementById('weekly-summary-text');
    const btnRestart = document.getElementById('btn-restart');

    const btnWork = document.getElementById('action-work');
    const btnRest = document.getElementById('action-rest');
    const btnScroll = document.getElementById('action-scroll');
    const btnAuto = document.getElementById('btn-auto');
    const btnReset = document.getElementById('btn-reset');
    const btnNewWork = document.getElementById('btn-new-work');
    const speedRange = document.getElementById('speed-range');
    const launcherPage = document.getElementById('launcher-page');
    const dashboardView = document.getElementById('dashboard-view');
    const personalityCards = document.querySelectorAll('.personality-card');
    const btnTeam = document.getElementById('btn-team');
    const teamInfo = document.getElementById('team-info');

    let autoInterval = null;
    let isTraining = false;
    let currentPersonality = 'average';

    function updateUI() {
        const state = simulator.state;
        
        // Progress Bars
        energyBar.style.width = `${state.energy * 10}%`;
        motivationBar.style.width = `${state.motivation * 10}%`;
        workloadBar.style.width = `${state.workload * 10}%`;
        
        // Values
        energyVal.textContent = `${state.energy}/10`;
        motivationVal.textContent = `${state.motivation}/10`;
        workloadVal.textContent = `${state.workload}/10`;
        
        // HUD
        agentStatusText.textContent = simulator.getStatus();
        totalRewardText.textContent = simulator.totalReward.toFixed(2);
        simTimeText.textContent = simulator.getTimeString();
        habitScoreText.textContent = `${simulator.habitScore}%`;
        lastActionText.textContent = simulator.lastAction || '-';

        // Charts
        charts.update(simulator.history);
        
        // Animations
        if (state.energy < 2) energyBar.classList.add('pulse');
        else energyBar.classList.remove('pulse');
    }

    function handleAction(action) {
        const result = simulator.step(action);
        updateUI();
        addLogEntry(action, result.reward);
        
        if (result.dailyRecap) {
            updateRecap(result.dailyRecap);
        }

        if (result.isFinished) {
            showWeeklyReport();
        }
        
        showToast(`Action: ${action}`, action === 'WORK' ? 'cyan' : action === 'REST' ? 'magenta' : 'red');
    }

    function showWeeklyReport() {
        if (isTraining) toggleAuto();
        
        weeklyWork.textContent = simulator.weeklyWorkDone;
        weeklyScore.textContent = `${simulator.habitScore}%`;
        weeklyReward.textContent = simulator.totalReward.toFixed(2);
        
        let summary = "";
        if (simulator.habitScore > 95) {
            summary = "Elite Performance! You maintained near-perfect focus. A rare display of peak human potential.";
        } else if (simulator.habitScore > 75) {
            summary = "Great Work! You were highly productive with minimal distractions. A solid, high-performing week.";
        } else if (simulator.habitScore > 40) {
            summary = "Average Week. You got the work done, but procrastination took a significant chunk of your time and potential.";
        } else if (simulator.habitScore > 15) {
            summary = "Poor Week. Procrastination won the battle. You struggled to maintain focus and the backlog is out of control.";
        } else {
            summary = "System Failure. Total burnout or chronic procrastination detected. A complete lack of productive output.";
        }
        
        weeklySummary.textContent = summary;
        weeklyReport.classList.remove('hidden');
    }

    function updateRecap(recap) {
        const comment = recap.workDone > 12 ? "Exceptional productivity! Peak performance." : 
                        recap.workDone > 8 ? "Solid day's work. Well done." : 
                        recap.workDone > 4 ? "Average day. Could be better." :
                        recap.workDone > 0 ? "You're lagging behind. Focus!" :
                        "Zero progress made. Disappointing.";
        
        recapContent.innerHTML = `
            <div class="recap-row"><span>Day:</span> <span>${recap.day}</span></div>
            <div class="recap-row"><span>Tasks Done:</span> <span class="text-lime">${recap.workDone}</span></div>
            <div class="recap-row"><span>Backlog:</span> <span class="text-magenta">${recap.tasksLeft}</span></div>
            <div class="recap-row"><span>Daily Score:</span> <span class="text-cyan">${recap.score}%</span></div>
            <div class="recap-comment">Manager: "${comment}"</div>
        `;
    }

    function addLogEntry(action, reward) {
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const rewardColor = reward >= 0 ? 'text-lime' : 'text-red';
        entry.innerHTML = `[${timestamp}] <span class="text-white">${action}</span>: <span class="${rewardColor}">${reward >= 0 ? '+' : ''}${reward}</span>`;
        
        simLog.prepend(entry);
        if (simLog.children.length > 20) simLog.lastChild.remove();
    }

    function toggleAuto() {
        isTraining = !isTraining;
        if (isTraining) {
            btnAuto.innerHTML = '<i data-lucide="pause-circle"></i> Stop Training';
            btnAuto.classList.replace('btn-outline', 'btn-primary');
            startSimulation();
        } else {
            btnAuto.innerHTML = '<i data-lucide="zap"></i> Start Training';
            btnAuto.classList.replace('btn-primary', 'btn-outline');
            clearInterval(autoInterval);
        }
        lucide.createIcons();
    }

    function startSimulation() {
        clearInterval(autoInterval);
        autoInterval = setInterval(() => {
            const { energy, motivation, workload } = simulator.state;
            let action;

            // Tune heuristic based on personality
            let impulseChance = 0.15; // Average
            let procrastinationBias = 0.5;

            if (currentPersonality === 'incredible') {
                impulseChance = 0.05;
                procrastinationBias = 0.1;
            } else if (currentPersonality === 'poor') {
                impulseChance = 0.4;
                procrastinationBias = 0.8;
            }

            const isImpulsive = Math.random() < impulseChance;
            
            if (isImpulsive && workload > 0) {
                // If impulsive, choose between Scroll and Rest
                action = Math.random() < procrastinationBias ? 'SCROLL' : 'REST';
            } else if (energy < 3) {
                action = 'REST';
            } else if (motivation < 3) {
                action = 'SCROLL';
            } else if (workload > 0) {
                action = 'WORK';
            } else {
                action = Math.random() > 0.7 ? 'SCROLL' : 'REST';
            }
            
            handleAction(action);
        }, speedRange.value);
    }

    function showToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.getElementById('toast-container').appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 500);
        }, 2000);
    }

    // Event Listeners
    btnWork.addEventListener('click', () => handleAction('WORK'));
    btnRest.addEventListener('click', () => handleAction('REST'));
    btnScroll.addEventListener('click', () => handleAction('SCROLL'));
    
    btnAuto.addEventListener('click', toggleAuto);
    btnReset.addEventListener('click', () => {
        simulator.reset();
        charts.reset();
        updateUI();
        if (isTraining) toggleAuto();
    });

    btnNewWork.addEventListener('click', () => {
        simulator.addWorkload(15);
        updateUI();
        showToast('New tasks added!', 'magenta');
        addLogEntry('NEW TASKS', 0);
    });

    btnRestart.addEventListener('click', () => {
        weeklyReport.classList.add('hidden');
        launcherPage.classList.remove('hidden');
        dashboardView.classList.add('blurred');
        simulator.reset();
        charts.reset();
        updateUI();
        recapContent.innerHTML = '<div class="recap-placeholder">Day summary will appear here at 20:00...</div>';
    });

    speedRange.addEventListener('input', () => {
        if (isTraining) startSimulation();
    });

    // Launcher Logic
    personalityCards.forEach(card => {
        card.addEventListener('click', () => {
            currentPersonality = card.dataset.personality;
            launcherPage.classList.add('hidden');
            dashboardView.classList.remove('blurred');
            
            // Auto-start simulation after selection
            if (!isTraining) toggleAuto();
            showToast(`Scenario: ${card.querySelector('h3').textContent} started`, 'cyan');
        });
    });

    btnTeam.addEventListener('click', () => {
        teamInfo.classList.toggle('hidden');
    });

    // Initial Update
    updateUI();
});

// Toast Styles
const style = document.createElement('style');
style.textContent = `
    #toast-container {
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        z-index: 1000;
    }
    .toast {
        padding: 0.75rem 1.5rem;
        border-radius: 0.5rem;
        background: var(--card-bg);
        backdrop-filter: blur(10px);
        border: 1px solid var(--glass-border);
        color: white;
        font-family: var(--font-mono);
        font-size: 0.8rem;
        animation: slideIn 0.3s ease;
    }
    .toast-cyan { border-color: var(--neon-cyan); color: var(--neon-cyan); }
    .toast-magenta { border-color: var(--neon-magenta); color: var(--neon-magenta); }
    .toast-red { border-color: var(--neon-red); color: var(--neon-red); }
    
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    .fade-out { opacity: 0; transition: opacity 0.5s; }
`;
document.head.appendChild(style);
