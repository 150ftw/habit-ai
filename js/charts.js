class DashboardCharts {
    constructor() {
        this.productivityChart = null;
        this.trendsChart = null;
        this.initCharts();
    }

    initCharts() {
        const ctxProd = document.getElementById('productivity-chart').getContext('2d');
        const ctxTrends = document.getElementById('trends-chart').getContext('2d');

        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    labels: { color: '#a0a0c0', font: { family: 'Outfit' } }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#a0a0c0' }
                },
                y: {
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#a0a0c0' },
                    beginAtZero: true,
                    max: 10
                }
            },
            animation: { duration: 400 }
        };

        this.productivityChart = new Chart(ctxProd, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Reward',
                    data: [],
                    borderColor: '#ff00ff',
                    backgroundColor: 'rgba(255, 0, 255, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2
                }]
            },
            options: { ...chartOptions, scales: { ...chartOptions.scales, y: { ...chartOptions.scales.y, max: undefined } } }
        });

        this.trendsChart = new Chart(ctxTrends, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Energy',
                        data: [],
                        borderColor: '#00f3ff',
                        tension: 0.4,
                        borderWidth: 2,
                        pointRadius: 0
                    },
                    {
                        label: 'Motivation',
                        data: [],
                        borderColor: '#ff00ff',
                        tension: 0.4,
                        borderWidth: 2,
                        pointRadius: 0
                    },
                    {
                        label: 'Workload',
                        data: [],
                        borderColor: '#39ff14',
                        tension: 0.4,
                        borderWidth: 2,
                        pointRadius: 0
                    }
                ]
            },
            options: { 
                ...chartOptions, 
                scales: { 
                    ...chartOptions.scales, 
                    y: { ...chartOptions.scales.y, max: 50 } 
                } 
            }
        });
    }

    update(history) {
        const labels = history.map(h => h.step);
        
        // Update Productivity (Reward) Chart
        this.productivityChart.data.labels = labels;
        this.productivityChart.data.datasets[0].data = history.map(h => h.totalReward);
        this.productivityChart.update('none');

        // Update Trends Chart
        if (history.length > 0) {
            this.trendsChart.data.labels = labels;
            this.trendsChart.data.datasets[0].data = history.map(h => h.energy);
            this.trendsChart.data.datasets[1].data = history.map(h => h.motivation);
            this.trendsChart.data.datasets[2].data = history.map(h => h.workload);
            this.trendsChart.update('none');
        }
    }

    reset() {
        this.productivityChart.data.labels = [];
        this.productivityChart.data.datasets[0].data = [];
        this.productivityChart.update();

        this.trendsChart.data.labels = [];
        this.trendsChart.data.datasets.forEach(ds => ds.data = []);
        this.trendsChart.update();
    }
}
