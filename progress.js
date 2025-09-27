// ===== PROGRESS PAGE FUNCTIONALITY =====

console.log('📊 Loading Progress Page...');

document.addEventListener('DOMContentLoaded', function() {
    initializeProgressPage();
});

function initializeProgressPage() {
    loadProgressData();
    loadCourseProgress();
    createProgressChart();
    updateUserInterface();
}

function loadProgressData() {
    const currentUser = LinguaLeap.getCurrentUser();
    if (!currentUser) return;
    
    const progress = LinguaLeap.getUserProgress() || {};
    
    // Update overview cards
    const userStreak = document.getElementById('userStreak');
    const userXP = document.getElementById('userXP');
    const completedLessons = document.getElementById('completedLessons');
    const userBadges = document.getElementById('userBadges');
    
    if (userStreak) {
        animateNumber(userStreak, 0, progress.streak || 7, 1000);
    }
    
    if (userXP) {
        animateNumber(userXP, 0, progress.totalXP || 1250, 1500);
    }
    
    if (completedLessons) {
        const lessonsCount = progress.completedLessons ? progress.completedLessons.length : 13;
        animateNumber(completedLessons, 0, lessonsCount, 1200);
    }
    
    if (userBadges) {
        const badgesCount = progress.badges ? progress.badges.length : 2;
        animateNumber(userBadges, 0, badgesCount, 800);
    }
    
    // Update detailed statistics
    updateDetailedStats(progress);
}

function updateDetailedStats(progress) {
    const timeSpent = document.getElementById('timeSpent');
    const averageAccuracy = document.getElementById('averageAccuracy');
    const wordsLearned = document.getElementById('wordsLearned');
    const daysActive = document.getElementById('daysActive');
    
    if (timeSpent) {
        const hours = Math.floor((progress.stats?.timeSpent || 0) / 60) || 12;
        timeSpent.textContent = hours + ' hours';
    }
    
    if (averageAccuracy) {
        const accuracy = progress.stats?.accuracy || 87;
        animateNumber(averageAccuracy, 0, accuracy, 1000, '%');
    }
    
    if (wordsLearned) {
        const words = progress.stats?.wordsLearned || 287;
        animateNumber(wordsLearned, 0, words, 1300);
    }
    
    if (daysActive) {
        const days = Math.ceil((progress.streak || 7) * 1.5);
        animateNumber(daysActive, 0, days, 900);
    }
}

function loadCourseProgress() {
    const coursesProgress = document.getElementById('coursesProgress');
    const courses = LinguaLeap.getCourses();
    const currentUser = LinguaLeap.getCurrentUser();
    
    if (!coursesProgress || !currentUser) return;
    
    coursesProgress.innerHTML = '';
    
    courses.forEach(course => {
        const progress = calculateCourseProgress(course);
        const courseCard = createCourseProgressCard(course, progress);
        coursesProgress.appendChild(courseCard);
    });
}

function calculateCourseProgress(course) {
    const currentUser = LinguaLeap.getCurrentUser();
    const userProgress = LinguaLeap.getUserProgress() || {};
    
    // Simulate course progress
    if (course.id === 'spanish-fundamentals') {
        return {
            completed: 13,
            total: course.totalLessons || 20,
            percentage: 65
        };
    } else {
        return {
            completed: 0,
            total: course.totalLessons || 18,
            percentage: 0
        };
    }
}

function createCourseProgressCard(course, progress) {
    const card = document.createElement('div');
    card.className = 'course-progress-card';
    card.innerHTML = `
        <div class="course-info">
            <img src="${course.image}" alt="${course.title}" class="course-thumbnail">
            <div class="course-details">
                <h4>${course.title}</h4>
                <p>${course.language} • ${course.level}</p>
                <span class="progress-text">${progress.completed}/${progress.total} lessons</span>
            </div>
        </div>
        <div class="course-progress-bar">
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress.percentage}%"></div>
            </div>
            <span class="progress-percentage">${progress.percentage}%</span>
        </div>
        <button class="btn secondary" onclick="continueCourse('${course.id}')">
            <i class="fas fa-play"></i> Continue
        </button>
    `;
    return card;
}

function createProgressChart() {
    const canvas = document.getElementById('progressChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Sample data for the week
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const lessonsData = [2, 3, 1, 4, 2, 3, 2];
    const practiceData = [1, 2, 3, 2, 4, 1, 3];
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw chart
    drawBarChart(ctx, canvas, days, lessonsData, practiceData);
}

function drawBarChart(ctx, canvas, labels, data1, data2) {
    const padding = 40;
    const chartWidth = canvas.width - (padding * 2);
    const chartHeight = canvas.height - (padding * 2);
    const barWidth = chartWidth / labels.length / 3;
    const maxValue = Math.max(...data1, ...data2);
    
    // Draw bars
    labels.forEach((label, index) => {
        const x = padding + (index * chartWidth / labels.length);
        const y1 = padding + chartHeight - (data1[index] / maxValue) * chartHeight;
        const y2 = padding + chartHeight - (data2[index] / maxValue) * chartHeight;
        const height1 = (data1[index] / maxValue) * chartHeight;
        const height2 = (data2[index] / maxValue) * chartHeight;
        
        // Draw lessons bar (primary color)
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(x, y1, barWidth, height1);
        
        // Draw practice bar (secondary color)
        ctx.fillStyle = '#2196F3';
        ctx.fillRect(x + barWidth + 5, y2, barWidth, height2);
        
        // Draw labels
        ctx.fillStyle = '#666';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(label, x + barWidth, canvas.height - 10);
    });
}

function animateNumber(element, start, end, duration, suffix = '') {
    const startTime = performance.now();
    const range = end - start;
    
    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const current = Math.floor(start + (range * progress));
        element.textContent = current.toLocaleString() + suffix;
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    }
    
    requestAnimationFrame(updateNumber);
}

function continueCourse(courseId) {
    console.log('📚 Continuing course:', courseId);
    window.location.href = `lesson.html?course=${courseId}`;
}

function updateUserInterface() {
    const currentUser = LinguaLeap.getCurrentUser();
    if (currentUser) {
        const userAvatar = document.getElementById('userAvatar');
        if (userAvatar) {
            userAvatar.src = currentUser.avatar;
        }
    }
}

// Navigation functions
function goHome() {
    window.location.href = 'index.html';
}

function goToCourses() {
    window.location.href = 'courses.html';
}

function goToPractice() {
    window.location.href = 'practice.html';
}

function goToProfile() {
    window.location.href = 'profile.html';
}

function toggleUserMenu() {
    if (confirm('Do you want to logout?')) {
        LinguaLeap.logoutUser();
        window.location.href = 'index.html';
    }
}