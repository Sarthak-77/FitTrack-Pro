/**
 * FitTrack Pro Main Application Logic
 */

// Configuration Constants
const CONFIG = {
    GOALS: {
        STEPS: 10000,
        CALORIES: 3000,
        WATER: 2500
    },
    ANIMATION: {
        COUNTER_DURATION: 1500,
        WATER_INTERVAL: 50,
        CHART_DELAY: 100,
        BAR_ANIMATION_DELAY: 100
    },
    HISTORY_DAYS: 7,
    RECENT_ACTIVITIES_COUNT: 4
};

// Helper function to wait for dataManager to be available
async function waitForDataManager() {
    let attempts = 0;
    while (!window.dataManager && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
    }
    if (!window.dataManager) {
        throw new Error('dataManager not available after 5 seconds');
    }
    return window.dataManager;
}

document.addEventListener('DOMContentLoaded', async () => {
    updateClock();
    setInterval(updateClock, 1000);

    try {
        // CRITICAL: Wait for dataManager to be available from data.js
        console.log('[Init] Waiting for dataManager...');
        await waitForDataManager();
        console.log('[Init] dataManager found:', window.dataManager);

        // Ensure user is loaded ON THE WINDOW.DATAMANAGER INSTANCE
        await window.dataManager.ensureUser();
        console.log('[Init] User ensured:', window.dataManager.user);

        // Initialize page-specific logic
        const path = window.location.pathname;
        if (path.includes('index.html') || path === '/') {
            initDashboard();
        } else if (path.includes('activity.html')) {
            initActivityLog();
        } else if (path.includes('meals.html')) {
            initMealPlanner();
        } else if (path.includes('insights.html')) {
            initInsights();
        }
    } catch (error) {
        console.error('[Init] Failed to initialize:', error);
    }
});

function updateClock() {
    const clockElement = document.getElementById('live-clock');
    if (clockElement) {
        const now = new Date();
        clockElement.textContent = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }
}

// --- Dashboard Logic ---
async function initDashboard() {
    console.log('[Dashboard] Starting initialization...');
    console.log('[Dashboard] window.dataManager:', window.dataManager);
    console.log('[Dashboard] window.dataManager.user:', window.dataManager?.user);

    const stats = await window.dataManager.getTodayStats();
    console.log('[Dashboard] getTodayStats returned:', stats);

    // Safety check
    if (!stats) {
        console.error('[Dashboard] Failed to load or create today\'s stats');
        console.error('[Dashboard] User:', window.dataManager?.user);
        console.error('[Dashboard] This should not happen after ensureUser() was called!');
        return;
    }

    console.log('[Dashboard] Stats loaded successfully:', stats);

    // Animate counters
    animateCounter(document.getElementById('step-count'), 0, stats.steps, CONFIG.ANIMATION.COUNTER_DURATION);
    animateCounter(document.getElementById('calorie-count'), 0, stats.calories_burned, CONFIG.ANIMATION.COUNTER_DURATION);

    // Update water count with animation
    const waterEl = document.getElementById('water-count');
    let currentWater = 0;
    const waterInterval = setInterval(() => {
        currentWater += Math.ceil(stats.water_intake / 30);
        if (currentWater >= stats.water_intake) {
            currentWater = stats.water_intake;
            clearInterval(waterInterval);
        }
        waterEl.textContent = `${currentWater}ml`;
    }, CONFIG.ANIMATION.WATER_INTERVAL);

    // Create Chart.js progress circles with semantic colors
    setTimeout(() => {
        ChartManager.createProgressChart('steps-chart', stats.steps, CONFIG.GOALS.STEPS, '#3b82f6');      // Blue for steps
        ChartManager.createProgressChart('calories-chart', stats.calories_burned, CONFIG.GOALS.CALORIES, '#f97316'); // Orange for calories
        ChartManager.createProgressChart('water-chart', stats.water_intake, CONFIG.GOALS.WATER, '#06b6d4');  // Cyan for water

        // Create weekly trend chart
        createWeeklyTrendChart();
    }, 100);

    // Load recent activities
    loadRecentActivities();
}

async function createWeeklyTrendChart() {
    const history = await window.dataManager.getHistory();

    // Generate last 7 days labels
    const labels = [];
    const today = new Date();
    for (let i = CONFIG.HISTORY_DAYS - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
    }

    // Use actual history data or generate sample data
    const stepsData = history.steps.length >= 7 ? history.steps.slice(-7) :
        [6500, 8200, 7800, 9100, 6800, 8500, history.steps[history.steps.length - 1] || 0];

    ChartManager.createTrendChart('weekly-trend-chart', {
        labels: labels,
        values: stepsData
    }, 'Steps');
}

async function loadRecentActivities() {
    const container = document.getElementById('recent-activities');
    if (!container) return;

    const activities = (await window.dataManager.getActivities()).slice(-CONFIG.RECENT_ACTIVITIES_COUNT);

    if (activities.length === 0) {
        container.innerHTML = '<p class="text-center text-muted">No recent activities. Start logging your workouts!</p>';
        return;
    }

    container.innerHTML = '';
    activities.reverse().forEach((activity, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.style.animationDelay = `${index * 0.1}s`;
        card.innerHTML = `
            <div class="flex justify-between items-center">
                <div>
                    <h3 style="margin-bottom: 0.5rem;">${activity.name}</h3>
                    <p class="text-sm text-muted">${activity.duration} minutes • ${activity.type}</p>
                </div>
                <div class="text-right">
                    <div style="font-size: 1.5rem; font-weight: 700; background: var(--gradient-main); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;">
                        ${activity.calories}
                    </div>
                    <p class="text-xs text-muted">kcal</p>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function updateProgress(elementId, value, max) {
    const element = document.getElementById(elementId);
    if (element) {
        const percentage = Math.min((value / max) * 100, 100);
        element.style.setProperty('--progress', `${percentage}%`);
        // For circular progress, we might update a stroke-dasharray or conic-gradient
        element.style.background = `conic-gradient(var(--primary-color) ${percentage}%, var(--background-card) 0)`;
    }
}

// --- Activity Log Logic ---
async function initActivityLog() {
    await renderActivities();

    const form = document.getElementById('add-activity-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('activity-name').value;
            const duration = parseInt(document.getElementById('activity-duration').value);
            const calories = parseInt(document.getElementById('activity-calories').value);
            const type = document.getElementById('activity-type').value; // Morning/Afternoon/Evening

            if (name && duration && calories) {
                await window.dataManager.addActivity({ name, duration, calories, type });
                await renderActivities();
                showModal('Activity Added Successfully!');
                form.reset();
            }
        });
    }

    // Filtering
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            await renderActivities(e.target.dataset.filter);
        });
    });
}

async function renderActivities(filter = 'all') {
    const list = document.getElementById('activity-list');
    if (!list) return;

    const activities = await window.dataManager.getActivities();
    list.innerHTML = '';

    const filtered = filter === 'all' ? activities : activities.filter(a => a.type.toLowerCase() === filter.toLowerCase());

    if (filtered.length === 0) {
        list.innerHTML = '<p class="text-center text-muted">No activities found.</p>';
        return;
    }

    filtered.forEach(activity => {
        const item = document.createElement('div');
        item.className = 'activity-item card flex justify-between items-center animate-fade-in';
        item.innerHTML = `
            <div>
                <h3>${activity.name}</h3>
                <p class="text-sm text-muted">${activity.duration} mins • ${activity.type}</p>
            </div>
            <div class="flex items-center gap-3">
                <div class="text-accent font-bold">
                    ${activity.calories} kcal
                </div>
                <button class="btn-icon text-danger" onclick="deleteActivity('${activity.id}')" title="Delete Activity">&times;</button>
            </div>
        `;
        list.appendChild(item);
    });
}

// Global functions for activity management
window.deleteActivity = async function (id) {
    // Ensure dataManager is initialized
    await window.dataManager.ensureUser();
    if (confirm('Are you sure you want to delete this activity?')) {
        await window.dataManager.deleteActivity(id);
        await renderActivities();
        showModal('Activity deleted successfully!');
    }
};

window.editActivity = async function (id) {
    // Ensure dataManager is initialized
    await window.dataManager.ensureUser();
    const activities = await window.dataManager.getActivities();
    const activity = activities.find(a => a.id === id);

    if (!activity) {
        alert('Activity not found. Please refresh the page and try again.');
        return;
    }

    // Prompt for new values
    const name = prompt('Activity Name:', activity.name);
    if (name === null) return; // User cancelled

    const duration = prompt('Duration (minutes):', activity.duration);
    if (duration === null) return;

    const calories = prompt('Calories Burned:', activity.calories);
    if (calories === null) return;

    const type = prompt('Time of Day (Morning/Afternoon/Evening):', activity.type);
    if (type === null) return;

    // Validate inputs
    if (name && duration && calories && type) {
        const result = await window.dataManager.updateActivity(id, {
            name: name.trim(),
            duration: parseInt(duration),
            calories: parseInt(calories),
            type: type.trim()
        });

        if (result && result.error) {
            alert('Failed to update activity: ' + (result.error.message || 'Unknown error'));
        } else {
            await renderActivities();
            showModal('Activity updated successfully!');
        }
    } else {
        alert('Please fill in all fields');
    }
};

// --- Meal Planner Logic ---
async function initMealPlanner() {
    await renderMeals();
    await updateTotalCalories();
    // Meal addition is now handled by the modal in meals.html
}

async function renderMeals() {
    const meals = await window.dataManager.getMeals();
    ['breakfast', 'lunch', 'dinner'].forEach(type => {
        const container = document.getElementById(`${type}-list`);
        if (!container) return;

        container.innerHTML = '';
        meals[type].forEach(meal => {
            const el = document.createElement('div');
            el.className = 'meal-item flex justify-between items-center mb-2 animate-fade-in';
            el.innerHTML = `
                <span>${meal.name}</span>
                <div class="flex items-center gap-2">
                    <span class="text-sm text-muted">${meal.calories} kcal</span>
                    <button class="btn-icon text-danger" onclick="deleteMeal('${type}', '${meal.id}')">&times;</button>
                </div>
            `;
            container.appendChild(el);
        });
    });
}

// Expose to global scope for meals.html inline script
window.renderMeals = renderMeals;

// Global scope for onclick handler
window.deleteMeal = async function (type, id) {
    await window.dataManager.removeMeal(type, id);
    await renderMeals();
    await updateTotalCalories();
};

async function updateTotalCalories() {
    const meals = await window.dataManager.getMeals();
    let total = 0;
    Object.values(meals).forEach(list => {
        list.forEach(m => total += m.calories);
    });
    const el = document.getElementById('total-calories');
    if (el) el.textContent = total;
}

// Expose to global scope for meals.html inline script
window.updateTotalCalories = updateTotalCalories;

// --- Insights Logic ---
async function initInsights() {
    const history = await window.dataManager.getHistory();

    // Calculate dynamic max values with 20% padding to prevent overflow
    const maxSteps = Math.max(...history.steps, 10000); // Minimum 10k for scale
    const maxCalories = Math.max(...history.calories, 2000); // Minimum 2k for scale

    // Add 20% padding so the line doesn't touch the top
    const stepsMax = Math.ceil(maxSteps * 1.2);
    const caloriesMax = Math.ceil(maxCalories * 1.2);

    // Calculate actual day names for the last 7 days
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const actualDays = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        actualDays.push(dayNames[date.getDay()]);
    }

    // Update day labels in the DOM
    const stepsLabels = document.getElementById('steps-labels');
    const caloriesLabels = document.getElementById('calories-labels');
    if (stepsLabels) {
        stepsLabels.innerHTML = actualDays.map(day => `<span>${day}</span>`).join('');
    }
    if (caloriesLabels) {
        caloriesLabels.innerHTML = actualDays.map(day => `<span>${day}</span>`).join('');
    }

    // Render smooth line charts with gradient fills
    renderLineChart('steps-chart', history.steps, stepsMax, '#3b82f6'); // Blue for steps
    renderLineChart('calories-chart', history.calories, caloriesMax, '#f97316'); // Orange for calories

    document.getElementById('reset-btn').addEventListener('click', async () => {
        if (confirm('Are you sure you want to reset all data?')) {
            await window.dataManager.resetDashboard();
        }
    });

    document.getElementById('download-btn').addEventListener('click', () => {
        showModal('Summary Downloaded! (Simulated)');
    });
}

function renderLineChart(elementId, data, max, color = '#667eea') {
    const container = document.getElementById(elementId);
    if (!container) return;

    container.innerHTML = '';

    // Create SVG for smooth line chart
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '256');
    svg.setAttribute('viewBox', '0 0 700 256');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.style.cssText = 'display: block;';

    // Calculate actual day names for the last 7 days
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push(dayNames[date.getDay()]);
    }

    const width = 700;
    const height = 256;
    const padding = 20;
    const chartHeight = height - padding * 2;
    const chartWidth = width - padding * 2;
    const pointSpacing = chartWidth / (data.length - 1);

    // Create gradient
    const gradientId = `gradient-${elementId}`;
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.setAttribute('id', gradientId);
    gradient.setAttribute('x1', '0%');
    gradient.setAttribute('y1', '0%');
    gradient.setAttribute('x2', '0%');
    gradient.setAttribute('y2', '100%');

    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('style', `stop-color:${color};stop-opacity:0.6`);

    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('style', `stop-color:${color};stop-opacity:0.05`);

    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    defs.appendChild(gradient);
    svg.appendChild(defs);

    // Calculate points
    const points = data.map((value, index) => {
        const x = padding + (index * pointSpacing);
        const y = padding + chartHeight - (value / max) * chartHeight;
        return { x, y, value, day: days[index] };
    });

    // Create path for area fill
    let areaPath = `M ${padding} ${height - padding}`;
    points.forEach(point => {
        areaPath += ` L ${point.x} ${point.y}`;
    });
    areaPath += ` L ${width - padding} ${height - padding} Z`;

    const area = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    area.setAttribute('d', areaPath);
    area.setAttribute('fill', `url(#${gradientId})`);
    area.setAttribute('opacity', '0');
    svg.appendChild(area);

    // Create smooth line path using curves
    let linePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
        const current = points[i];
        const next = points[i + 1];
        const midX = (current.x + next.x) / 2;
        linePath += ` Q ${current.x} ${current.y}, ${midX} ${(current.y + next.y) / 2}`;
        linePath += ` Q ${next.x} ${next.y}, ${next.x} ${next.y}`;
    }

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    line.setAttribute('d', linePath);
    line.setAttribute('fill', 'none');
    line.setAttribute('stroke', color);
    line.setAttribute('stroke-width', '3');
    line.setAttribute('stroke-linecap', 'round');
    line.setAttribute('stroke-linejoin', 'round');

    // Animate line drawing
    const lineLength = line.getTotalLength();
    line.style.strokeDasharray = lineLength;
    line.style.strokeDashoffset = lineLength;
    svg.appendChild(line);

    // Add data points with tooltips
    points.forEach((point, index) => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', point.x);
        circle.setAttribute('cy', point.y);
        circle.setAttribute('r', '0');
        circle.setAttribute('fill', '#fff');
        circle.setAttribute('stroke', color);
        circle.setAttribute('stroke-width', '3');
        circle.style.cursor = 'pointer';
        circle.style.transition = 'r 0.3s ease';

        // Tooltip
        const tooltip = document.createElement('div');
        tooltip.style.cssText = `
            position: absolute;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s ease;
            z-index: 1000;
        `;
        tooltip.textContent = `${point.day}: ${point.value}`;

        circle.addEventListener('mouseenter', (e) => {
            circle.setAttribute('r', '6');
            tooltip.style.opacity = '1';
            const rect = container.getBoundingClientRect();
            tooltip.style.left = `${point.x * (rect.width / width)}px`;
            tooltip.style.top = `${point.y * (rect.height / height) - 40}px`;
        });

        circle.addEventListener('mouseleave', () => {
            circle.setAttribute('r', '4');
            tooltip.style.opacity = '0';
        });

        svg.appendChild(circle);
        container.style.position = 'relative';
        container.appendChild(tooltip);

        // Animate circle appearance
        setTimeout(() => {
            circle.setAttribute('r', '4');
        }, 500 + index * 100);
    });

    container.appendChild(svg);

    // Trigger animations
    setTimeout(() => {
        line.style.transition = 'stroke-dashoffset 1.5s ease-out';
        line.style.strokeDashoffset = '0';
        area.style.transition = 'opacity 1s ease-out';
        area.style.opacity = '1';
    }, 100);
}

// --- Shared UI ---
function showModal(message) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay active';
    overlay.innerHTML = `
        <div class="modal">
            <h3 class="mb-2 text-success">Success</h3>
            <p>${message}</p>
            <button class="btn btn-primary mt-4" onclick="this.closest('.modal-overlay').remove()">OK</button>
        </div>
    `;
    document.body.appendChild(overlay);
}
