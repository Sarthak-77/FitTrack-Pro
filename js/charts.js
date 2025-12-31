/**
 * Charts.js - Data Visualization Library
 * Handles Chart.js initialization and management for FitTrack Pro
 */

// Chart.js configuration and utilities
window.ChartManager = {
    charts: {},
    defaultColors: {
        primary: '#6366f1',
        secondary: '#ec4899',
        accent: '#8b5cf6',
        success: '#10b981',
        warning: '#f59e0b',
        info: '#3b82f6'
    },

    /**
     * Create a line chart for trends
     */
    createTrendChart(canvasId, data, label) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        // Destroy existing chart if it exists
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        this.charts[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: label,
                    data: data.values,
                    borderColor: this.defaultColors.primary,
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: this.defaultColors.primary,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(30, 41, 59, 0.9)',
                        backdropFilter: 'blur(10px)',
                        padding: 12,
                        borderColor: 'rgba(99, 102, 241, 0.5)',
                        borderWidth: 1,
                        titleColor: '#f8fafc',
                        bodyColor: '#94a3b8',
                        displayColors: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#94a3b8',
                            font: {
                                size: 11
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#94a3b8',
                            font: {
                                size: 11
                            }
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                }
            }
        });

        return this.charts[canvasId];
    },

    /**
     * Create a doughnut chart for progress
     */
    createProgressChart(canvasId, value, max, color) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        const percentage = (value / max) * 100;
        const remaining = 100 - percentage;

        this.charts[canvasId] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [percentage, remaining],
                    backgroundColor: [
                        color || this.defaultColors.primary,
                        'rgba(255, 255, 255, 0.05)'
                    ],
                    borderWidth: 0,
                    cutout: '75%'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: false
                    }
                },
                animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: 1500,
                    easing: 'easeInOutQuart'
                }
            }
        });

        return this.charts[canvasId];
    },

    /**
     * Create a bar chart
     */
    createBarChart(canvasId, data, label) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: label,
                    data: data.values,
                    backgroundColor: 'rgba(99, 102, 241, 0.8)',
                    borderColor: this.defaultColors.primary,
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(30, 41, 59, 0.9)',
                        padding: 12,
                        borderColor: 'rgba(99, 102, 241, 0.5)',
                        borderWidth: 1
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: '#94a3b8'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#94a3b8'
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                }
            }
        });

        return this.charts[canvasId];
    },

    /**
     * Update chart data
     */
    updateChart(canvasId, newData) {
        const chart = this.charts[canvasId];
        if (!chart) return;

        chart.data.datasets[0].data = newData.values;
        if (newData.labels) {
            chart.data.labels = newData.labels;
        }
        chart.update('active');
    },

    /**
     * Destroy a chart
     */
    destroyChart(canvasId) {
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
            delete this.charts[canvasId];
        }
    },

    /**
     * Destroy all charts
     */
    destroyAll() {
        Object.keys(this.charts).forEach(id => {
            this.charts[id].destroy();
        });
        this.charts = {};
    }
};

// Animated counter utility
function animateCounter(element, start, end, duration = 1000) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.round(current).toLocaleString();
    }, 16);
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ChartManager, animateCounter };
}
