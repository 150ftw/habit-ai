class Simulator {
    constructor() {
        this.state = {
            energy: 8,
            motivation: 5,
            workload: 15
        };
        this.history = [];
        this.totalReward = 0;
        this.stepCount = 0;
        this.habitScore = 100;
        this.lastAction = null;
        this.dayIndex = 0; // 0-4 (Mon-Fri)
        this.hour = 9; // Start at 9 AM
        this.days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        this.workDoneToday = 0;
        this.dailyRecap = null;
        this.weeklyWorkDone = 0;
        this.isFinished = false;
    }

    reset() {
        this.state = {
            energy: 8,
            motivation: 5,
            workload: 15
        };
        this.history = [];
        this.totalReward = 0;
        this.stepCount = 0;
        this.habitScore = 100;
        this.lastAction = null;
        this.dayIndex = 0;
        this.hour = 9;
        this.workDoneToday = 0;
        this.dailyRecap = null;
        this.weeklyWorkDone = 0;
        this.isFinished = false;
        this.recordHistory('Reset');
        return this.state;
    }

    addWorkload(amount = 15) {
        this.state.workload = this.clamp(this.state.workload + amount, 0, 50);
        this.recordHistory('New Tasks');
        return this.state;
    }

    clamp(val, min, max) {
        return Math.max(min, Math.min(max, val));
    }

    step(action) {
        this.stepCount++;
        this.lastAction = action;
        this.advanceTime();
        let reward = 0;

        switch (action) {
            case 'WORK':
                if (this.state.energy >= 2) {
                    this.state.energy -= 2;
                    this.state.workload -= 2;
                    this.state.motivation += 1;
                    this.workDoneToday += 2;
                    this.weeklyWorkDone += 2;
                    reward = 10; // High reward for productivity
                } else {
                    this.state.energy -= 1;
                    this.state.motivation -= 2;
                    reward = -5; // Penalty for working while exhausted
                }
                break;

            case 'REST':
                if (this.state.energy < 10) {
                    this.state.energy += 3;
                    this.state.motivation += 1;
                    reward = 2; // Positive reward for necessary rest
                } else {
                    reward = -2; // Penalty for over-resting
                }
                break;

            case 'SCROLL':
                this.state.energy -= 1;
                this.state.motivation -= 2;
                reward = 1; // Instant gratification (small reward)
                
                // Long term penalty
                if (this.state.motivation < 3) {
                    reward -= 5;
                }
                break;
        }

        // Clamp values
        this.state.energy = this.clamp(this.state.energy, 0, 10);
        this.state.motivation = this.clamp(this.state.motivation, 0, 10);
        this.state.workload = this.clamp(this.state.workload, 0, 50);

        this.totalReward += reward;
        this.calculateHabitScore();
        this.recordHistory(action, reward);

        return {
            state: { ...this.state },
            reward,
            totalReward: this.totalReward,
            dailyRecap: this.dailyRecap,
            isFinished: this.isFinished
        };
    }

    advanceTime() {
        this.hour++;
        this.dailyRecap = null;
        
        if (this.hour > 20) { // Day ends at 8 PM
            const currentDay = this.days[this.dayIndex];
            this.dailyRecap = {
                day: currentDay,
                workDone: this.workDoneToday,
                tasksLeft: this.state.workload,
                score: this.habitScore
            };

            // Check if Week is Finished (Friday 8 PM)
            if (this.dayIndex === 4) {
                this.isFinished = true;
                return;
            }

            this.hour = 9; // New day starts at 9 AM
            this.dayIndex = (this.dayIndex + 1) % 5;
            this.workDoneToday = 0; // Reset daily counter
            this.addWorkload(15); // Automatically add work every new day
        }
    }

    getTimeString() {
        return `${this.days[this.dayIndex]} ${this.hour.toString().padStart(2, '0')}:00`;
    }

    calculateHabitScore() {
        // Simple logic: ratio of Work vs Scroll
        const actions = this.history.map(h => h.action);
        const workCount = actions.filter(a => a === 'WORK').length;
        const scrollCount = actions.filter(a => a === 'SCROLL').length;
        
        if (this.history.length === 0) {
            this.habitScore = 100;
            return;
        }

        const score = (workCount / (workCount + scrollCount + 0.1)) * 100;
        this.habitScore = Math.round(this.clamp(score, 0, 100));
    }

    recordHistory(action, reward = 0) {
        this.history.push({
            step: this.stepCount,
            action: action,
            ...this.state,
            reward: reward,
            totalReward: this.totalReward
        });

        // Keep last 50 steps
        if (this.history.length > 50) {
            this.history.shift();
        }
    }

    getStatus() {
        if (this.state.energy < 2) return "Burnout Risk";
        if (this.state.workload === 0) return "Project Complete";
        if (this.lastAction === 'SCROLL') return "Procrastinating";
        if (this.state.motivation > 7 && this.state.energy > 5) return "Highly Focused";
        return "Steady";
    }
}
