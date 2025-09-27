// ===== DASHBOARD CHARTS & ANALYTICS =====
// Modern dashboard with beautiful charts and analytics

let progressChart, skillsChart;

// Initialize charts when dashboard is loaded
function initializeDashboardCharts() {
    console.log('📊 Initializing dashboard charts...');
    
    // Initialize Progress Chart
    initializeProgressChart();
    
    // Initialize Skills Chart
    initializeSkillsChart();
    
    // Initialize Activity Heatmap
    initializeActivityHeatmap();
    
    console.log('✅ Dashboard charts initialized successfully!');
}

// Progress Chart (Line Chart)
function initializeProgressChart() {
    const ctx = document.getElementById('progressChart');
    if (!ctx) return;
    
    // Sample data - in real app, this would come from user progress
    const progressData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
            label: 'Points Earned',
            data: [65, 45, 80, 55, 95, 70, 85],
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#667eea',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8
        }]
    };
    
    progressChart = new Chart(ctx, {
        type: 'line',
        data: progressData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#64748b'
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    },
                    ticks: {
                        color: '#64748b'
                    }
                }
            },
            elements: {
                point: {
                    hoverBackgroundColor: '#667eea'
                }
            }
        }
    });
}

// Skills Chart (Doughnut Chart)
function initializeSkillsChart() {
    const ctx = document.getElementById('skillsChart');
    if (!ctx) return;
    
    const skillsData = {
        labels: ['Grammar', 'Vocabulary', 'Speaking', 'Listening', 'Reading'],
        datasets: [{
            data: [85, 75, 60, 90, 70],
            backgroundColor: [
                '#667eea',
                '#f093fb',
                '#4facfe',
                '#43e97b',
                '#fa709a'
            ],
            borderWidth: 0,
            hoverOffset: 4
        }]
    };
    
    skillsChart = new Chart(ctx, {
        type: 'doughnut',
        data: skillsData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: {
                            family: 'Inter',
                            size: 12
                        },
                        color: '#64748b'
                    }
                }
            },
            elements: {
                arc: {
                    borderRadius: 4
                }
            }
        }
    });
}

// Activity Heatmap (GitHub-style)
function initializeActivityHeatmap() {
    const container = document.getElementById('activityHeatmap');
    if (!container) return;
    
    // Generate last 30 days
    const days = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        // Random activity level for demo
        const activityLevel = Math.floor(Math.random() * 5);
        
        days.push({
            date: date,
            level: activityLevel,
            title: `${date.toDateString()}: ${activityLevel > 0 ? `${activityLevel * 2} points earned` : 'No activity'}`
        });
    }
    
    // Create heatmap
    container.innerHTML = days.map(day => 
        `<div class="heatmap-day level-${day.level}" 
              title="${day.title}"
              data-date="${day.date.toISOString()}"></div>`
    ).join('');
    
    // Add hover effects and tooltips
    container.querySelectorAll('.heatmap-day').forEach(day => {
        day.addEventListener('mouseenter', function() {
            // Simple tooltip (you can enhance this with a proper tooltip library)
            this.style.position = 'relative';
        });
    });
}

// Update charts with real user data
function updateChartsWithUserData(userData) {
    if (!userData) return;
    
    console.log('📊 Updating charts with user data:', userData);
    
    // Update progress chart with real data
    if (progressChart && userData.weeklyProgress) {
        progressChart.data.datasets[0].data = userData.weeklyProgress;
        progressChart.update();
    }
    
    // Update skills chart with real data
    if (skillsChart && userData.skillsBreakdown) {
        skillsChart.data.datasets[0].data = userData.skillsBreakdown;
        skillsChart.update();
    }
}

// Animate stat cards with count-up effect
function animateStatCards() {
    const statValues = document.querySelectorAll('.stat-value');
    
    statValues.forEach(element => {
        const finalValue = parseInt(element.textContent) || 0;
        let currentValue = 0;
        const increment = finalValue / 50; // 50 steps
        
        const timer = setInterval(() => {
            currentValue += increment;
            if (currentValue >= finalValue) {
                currentValue = finalValue;
                clearInterval(timer);
            }
            
            // Handle different formats
            if (element.textContent.includes('days')) {
                element.textContent = `${Math.floor(currentValue)} days`;
            } else {
                element.textContent = Math.floor(currentValue).toString();
            }
        }, 20);
    });
}

// Add page animations
function addPageAnimations() {
    // Animate learning path cards
    const pathCards = document.querySelectorAll('.path-card');
    pathCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('animate-slide-in-right');
    });
    
    // Animate stat cards
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('animate-slide-in-left');
    });
    
    // Animate chart cards
    const chartCards = document.querySelectorAll('.chart-card');
    chartCards.forEach((card, index) => {
        card.style.animationDelay = `${(index + 3) * 0.1}s`;
        card.classList.add('animate-bounce-in');
    });
}

// Enhanced dashboard initialization
function enhancedDashboardInit() {
    console.log('🚀 Initializing enhanced dashboard...');
    
    // Initialize charts
    setTimeout(() => {
        initializeDashboardCharts();
    }, 500);
    
    // Animate stat cards
    setTimeout(() => {
        animateStatCards();
    }, 800);
    
    // Add page animations
    setTimeout(() => {
        addPageAnimations();
    }, 300);
    
    // Update with real data if available
    if (currentUser && userStats) {
        setTimeout(() => {
            updateChartsWithUserData({
                weeklyProgress: [
                    userStats.points * 0.1,
                    userStats.points * 0.15,
                    userStats.points * 0.2,
                    userStats.points * 0.18,
                    userStats.points * 0.25,
                    userStats.points * 0.12,
                    userStats.points * 0.3
                ],
                skillsBreakdown: [
                    userStats.level * 15,
                    userStats.level * 12,
                    userStats.level * 8,
                    userStats.level * 18,
                    userStats.level * 10
                ]
            });
        }, 1500);
    }
    
    console.log('✅ Enhanced dashboard initialized!');
}

// Add floating action elements
function addFloatingElements() {
    // Create floating help button
    const helpButton = document.createElement('div');
    helpButton.className = 'floating-help';
    helpButton.innerHTML = '💡';
    helpButton.title = 'Quick Help';
    helpButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        background: var(--gradient-primary);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        cursor: pointer;
        z-index: 1000;
        box-shadow: var(--shadow-medium);
        transition: all 0.3s ease;
    `;
    
    helpButton.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.1)';
        this.classList.add('animate-pulse');
    });
    
    helpButton.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
        this.classList.remove('animate-pulse');
    });
    
    helpButton.addEventListener('click', function() {
        showQuickHelp();
    });
    
    document.body.appendChild(helpButton);
}

function showQuickHelp() {
    alert('🎉 Welcome to LinguaLeap!\n\n📚 Navigate through different learning paths\n📊 Track your progress on the dashboard\n🎯 Take AI-powered quizzes\n🛠️ Use AI tools for practice\n\nHappy Learning! 🚀');
}

// Export functions for use in main app
window.enhancedDashboardInit = enhancedDashboardInit;
window.addFloatingElements = addFloatingElements;
window.updateChartsWithUserData = updateChartsWithUserData;

console.log('✅ Dashboard charts module loaded successfully!');