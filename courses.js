// ===== COURSES PAGE FUNCTIONALITY =====

console.log('📚 Loading Courses Page...');

document.addEventListener('DOMContentLoaded', function() {
    initializeCoursesPage();
});

function initializeCoursesPage() {
    loadCourses();
    setupCourseFilters();
    updateUserInterface();
}

function loadCourses() {
    const coursesGrid = document.getElementById('coursesGrid');
    const courses = LinguaLeap.getCourses();
    
    coursesGrid.innerHTML = '';
    
    courses.forEach(course => {
        const courseCard = createCourseCard(course);
        coursesGrid.appendChild(courseCard);
    });
}

function createCourseCard(course) {
    const card = document.createElement('div');
    card.className = 'course-card-full';
    card.innerHTML = `
        <div class="course-image">
            <img src="${course.image}" alt="${course.title}">
            <div class="course-level">${course.level}</div>
        </div>
        <div class="course-content">
            <h3>${course.title}</h3>
            <p>${course.description}</p>
            <div class="course-meta">
                <span><i class="fas fa-book"></i> ${course.totalLessons} Lessons</span>
                <span><i class="fas fa-clock"></i> ${course.estimatedTime}</span>
                <span><i class="fas fa-globe"></i> ${course.language}</span>
            </div>
            <div class="course-actions">
                <button class="btn primary" onclick="startCourse('${course.id}')">
                    <i class="fas fa-play"></i> Start Learning
                </button>
                <button class="btn secondary" onclick="viewCourseDetails('${course.id}')">
                    <i class="fas fa-info"></i> Details
                </button>
            </div>
        </div>
    `;
    return card;
}

function setupCourseFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active to clicked
            this.classList.add('active');
            
            const filter = this.dataset.filter;
            filterCourses(filter);
        });
    });
}

function filterCourses(filter) {
    const courseCards = document.querySelectorAll('.course-card-full');
    
    courseCards.forEach(card => {
        if (filter === 'all') {
            card.style.display = 'block';
        } else {
            const level = card.querySelector('.course-level').textContent.toLowerCase();
            if (level.includes(filter)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        }
    });
}

function startCourse(courseId) {
    console.log('🚀 Starting course:', courseId);
    
    // Update user's current course
    const currentUser = LinguaLeap.getCurrentUser();
    if (currentUser) {
        const progress = LinguaLeap.getUserProgress() || {};
        progress.currentCourse = courseId;
        LinguaLeap.updateUserProgress(progress);
    }
    
    // Redirect to lesson page
    window.location.href = `lesson.html?course=${courseId}&lesson=1`;
}

function viewCourseDetails(courseId) {
    const course = LinguaLeap.getCourseById(courseId);
    if (course) {
        window.location.href = `course-details.html?id=${courseId}`;
    }
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

function goToPractice() {
    window.location.href = 'practice.html';
}

function goToProgress() {
    window.location.href = 'progress.html';
}

function goToProfile() {
    window.location.href = 'profile.html';
}

function toggleUserMenu() {
    // Simple logout for now
    if (confirm('Do you want to logout?')) {
        LinguaLeap.logoutUser();
        window.location.href = 'index.html';
    }
}