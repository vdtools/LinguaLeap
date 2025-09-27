// ===== LINGUALEAP MODERN APP V5.0 =====

// Global variables
let currentUser = null;
let isLoggedIn = false;
let userProgress = {};
let courses = [];
let chapters = [];

// API Base URL - Change this to your server URL
const API_BASE_URL = 'https://your-server.com/api'; // Change this to your actual server

// Local storage keys
const STORAGE_KEYS = {
    USER: 'lingualeap_user',
    TOKEN: 'lingualeap_token',
    PROGRESS: 'lingualeap_progress'
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 LinguaLeap V5.0 Starting...');
    
    // Show loading screen
    showLoadingScreen();
    
    // Check if user is already logged in
    checkAuthState();
    
    // Set up event listeners
    setupEventListeners();
    
    // Hide loading screen after initialization
    setTimeout(() => {
        hideLoadingScreen();
        showLandingPage();
    }, 2000);
});

// ===== LOADING SCREEN =====
function showLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.style.display = 'flex';
    }
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.style.display = 'none';
    }
}

// ===== AUTHENTICATION STATE =====
function checkAuthState() {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const userData = localStorage.getItem(STORAGE_KEYS.USER);
    
    if (token && userData) {
        try {
            currentUser = JSON.parse(userData);
            isLoggedIn = true;
            console.log('✅ User already logged in:', currentUser.name);
            // Load user dashboard instead of landing page
            setTimeout(() => {
                loadUserDashboard();
            }, 2500);
        } catch (error) {
            console.error('❌ Error parsing user data:', error);
            clearAuthData();
        }
    }
}

function clearAuthData() {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.PROGRESS);
    currentUser = null;
    isLoggedIn = false;
}

// ===== PAGE NAVIGATION =====
function showLandingPage() {
    if (!isLoggedIn) {
        const landingPage = document.getElementById('landingPage');
        const userDashboard = document.getElementById('userDashboard');
        
        if (landingPage) landingPage.style.display = 'block';
        if (userDashboard) userDashboard.style.display = 'none';
    }
}

function loadUserDashboard() {
    const landingPage = document.getElementById('landingPage');
    const userDashboard = document.getElementById('userDashboard');
    
    if (landingPage) landingPage.style.display = 'none';
    if (userDashboard) {
        userDashboard.style.display = 'block';
        createDashboardContent();
    }
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Signup form
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
    
    // Modal close events
    window.addEventListener('click', function(event) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ===== MODAL FUNCTIONS =====
function showLogin() {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.style.display = 'block';
        // Clear form
        const form = document.getElementById('loginForm');
        if (form) form.reset();
    }
}

function showSignup() {
    const signupModal = document.getElementById('signupModal');
    if (signupModal) {
        signupModal.style.display = 'block';
        // Clear form
        const form = document.getElementById('signupForm');
        if (form) form.reset();
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

function switchToSignup() {
    closeModal('loginModal');
    showSignup();
}

function switchToLogin() {
    closeModal('signupModal');
    showLogin();
}

// ===== AUTHENTICATION HANDLERS =====
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    if (!email || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    try {
        showLoadingButton('loginForm');
        
        // Call login API
        const response = await loginUser(email, password);
        
        if (response.success) {
            // Save user data
            currentUser = response.user;
            isLoggedIn = true;
            
            // Save to localStorage
            localStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
            
            if (rememberMe) {
                // Set longer expiration for remember me
                localStorage.setItem('remember_me', 'true');
            }
            
            showNotification('Login successful! Welcome back.', 'success');
            closeModal('loginModal');
            
            // Load dashboard
            setTimeout(() => {
                loadUserDashboard();
            }, 1000);
            
        } else {
            showNotification(response.message || 'Login failed', 'error');
        }
        
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Login failed. Please try again.', 'error');
    } finally {
        hideLoadingButton('loginForm');
    }
}

async function handleSignup(event) {
    event.preventDefault();
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;
    
    // Validation
    if (!name || !email || !password || !confirmPassword) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return;
    }
    
    if (!agreeTerms) {
        showNotification('Please agree to the terms and conditions', 'error');
        return;
    }
    
    try {
        showLoadingButton('signupForm');
        
        // Call signup API
        const response = await registerUser(name, email, password);
        
        if (response.success) {
            // Save user data
            currentUser = response.user;
            isLoggedIn = true;
            
            // Save to localStorage
            localStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
            
            showNotification('Account created successfully! Welcome to LinguaLeap.', 'success');
            closeModal('signupModal');
            
            // Load dashboard
            setTimeout(() => {
                loadUserDashboard();
            }, 1000);
            
        } else {
            showNotification(response.message || 'Signup failed', 'error');
        }
        
    } catch (error) {
        console.error('Signup error:', error);
        showNotification('Signup failed. Please try again.', 'error');
    } finally {
        hideLoadingButton('signupForm');
    }
}

// ===== API FUNCTIONS =====

// Mock API functions - Replace these with actual API calls to your server
async function loginUser(email, password) {
    // This is a mock function - replace with actual API call
    return new Promise((resolve) => {
        setTimeout(() => {
            // Simulate API response
            if (email === 'demo@lingualeap.com' && password === 'demo123') {
                resolve({
                    success: true,
                    token: 'mock_token_' + Date.now(),
                    user: {
                        id: 1,
                        name: 'Demo User',
                        email: email,
                        avatar: null,
                        joinDate: new Date().toISOString(),
                        level: 'Beginner',
                        currentCourse: 'Spanish'
                    }
                });
            } else {
                resolve({
                    success: false,
                    message: 'Invalid email or password'
                });
            }
        }, 1000);
    });
    
    /* 
    // Actual API call example:
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
    });
    return await response.json();
    */
}

async function registerUser(name, email, password) {
    // This is a mock function - replace with actual API call
    return new Promise((resolve) => {
        setTimeout(() => {
            // Simulate API response
            resolve({
                success: true,
                token: 'mock_token_' + Date.now(),
                user: {
                    id: Date.now(),
                    name: name,
                    email: email,
                    avatar: null,
                    joinDate: new Date().toISOString(),
                    level: 'Beginner',
                    currentCourse: null
                }
            });
        }, 1000);
    });
    
    /* 
    // Actual API call example:
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password })
    });
    return await response.json();
    */
}

async function fetchUserProgress() {
    // Mock function - replace with actual API call
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                progress: {
                    totalLessons: 50,
                    completedLessons: 15,
                    currentStreak: 5,
                    totalPoints: 1250,
                    achievements: ['First Lesson', 'Week Warrior']
                }
            });
        }, 500);
    });
}

async function fetchCourses() {
    // Mock function - replace with actual API call
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                courses: [
                    {
                        id: 1,
                        name: 'Spanish',
                        description: 'Learn Spanish from beginner to advanced',
                        chapters: 12,
                        enrolled: true,
                        progress: 30
                    },
                    {
                        id: 2,
                        name: 'French',
                        description: 'Master French language and culture',
                        chapters: 10,
                        enrolled: false,
                        progress: 0
                    },
                    {
                        id: 3,
                        name: 'German',
                        description: 'Comprehensive German learning course',
                        chapters: 15,
                        enrolled: false,
                        progress: 0
                    }
                ]
            });
        }, 500);
    });
}

// ===== DASHBOARD CREATION =====
async function createDashboardContent() {
    const dashboard = document.getElementById('userDashboard');
    if (!dashboard) return;
    
    // Show loading
    dashboard.innerHTML = '<div class="dashboard-loading">Loading your dashboard...</div>';
    
    try {
        // Fetch user data
        const [progressData, coursesData] = await Promise.all([
            fetchUserProgress(),
            fetchCourses()
        ]);
        
        if (progressData.success) {
            userProgress = progressData.progress;
        }
        
        if (coursesData.success) {
            courses = coursesData.courses;
        }
        
        // Create dashboard HTML
        const dashboardHTML = `
            <div class="dashboard-container">
                <!-- Dashboard Header -->
                <header class="dashboard-header">
                    <div class="dashboard-nav">
                        <div class="nav-brand">
                            <i class="fas fa-language"></i>
                            <span>LinguaLeap</span>
                        </div>
                        <div class="user-menu">
                            <div class="user-info">
                                <span>Welcome, ${currentUser.name}</span>
                                <button class="btn-secondary" onclick="logout()">Logout</button>
                            </div>
                        </div>
                    </div>
                </header>
                
                <!-- Dashboard Content -->
                <main class="dashboard-main">
                    <div class="dashboard-grid">
                        <!-- Progress Overview -->
                        <section class="progress-section">
                            <div class="section-header">
                                <h2>Your Progress</h2>
                                <p>Keep up the great work!</p>
                            </div>
                            
                            <div class="progress-cards">
                                <div class="progress-card">
                                    <div class="progress-icon">
                                        <i class="fas fa-book-open"></i>
                                    </div>
                                    <div class="progress-info">
                                        <h3>${userProgress.completedLessons || 0}</h3>
                                        <p>Lessons Completed</p>
                                    </div>
                                </div>
                                
                                <div class="progress-card">
                                    <div class="progress-icon">
                                        <i class="fas fa-fire"></i>
                                    </div>
                                    <div class="progress-info">
                                        <h3>${userProgress.currentStreak || 0}</h3>
                                        <p>Day Streak</p>
                                    </div>
                                </div>
                                
                                <div class="progress-card">
                                    <div class="progress-icon">
                                        <i class="fas fa-star"></i>
                                    </div>
                                    <div class="progress-info">
                                        <h3>${userProgress.totalPoints || 0}</h3>
                                        <p>Total Points</p>
                                    </div>
                                </div>
                            </div>
                        </section>
                        
                        <!-- Courses Section -->
                        <section class="courses-section">
                            <div class="section-header">
                                <h2>Your Courses</h2>
                                <p>Continue your learning journey</p>
                            </div>
                            
                            <div class="courses-grid">
                                ${courses.map(course => createCourseCard(course)).join('')}
                            </div>
                        </section>
                    </div>
                </main>
            </div>
        `;
        
        dashboard.innerHTML = dashboardHTML;
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
        dashboard.innerHTML = '<div class="dashboard-error">Error loading dashboard. Please refresh the page.</div>';
    }
}

function createCourseCard(course) {
    return `
        <div class="course-card ${course.enrolled ? 'enrolled' : ''}">
            <div class="course-header">
                <h3>${course.name}</h3>
                <span class="course-chapters">${course.chapters} chapters</span>
            </div>
            <p class="course-description">${course.description}</p>
            
            ${course.enrolled ? `
                <div class="course-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${course.progress}%"></div>
                    </div>
                    <span class="progress-text">${course.progress}% complete</span>
                </div>
                <button class="btn-primary" onclick="continueLesson(${course.id})">
                    Continue Learning
                </button>
            ` : `
                <button class="btn-outline" onclick="enrollInCourse(${course.id})">
                    Enroll Now
                </button>
            `}
        </div>
    `;
}

// ===== COURSE FUNCTIONS =====
function continueLesson(courseId) {
    showNotification(`Opening lesson for course ${courseId}...`, 'info');
    // Implement lesson navigation
}

function enrollInCourse(courseId) {
    showNotification(`Enrolling in course ${courseId}...`, 'info');
    // Implement course enrollment
}

// ===== UTILITY FUNCTIONS =====
function showLoadingButton(formId) {
    const form = document.getElementById(formId);
    const button = form.querySelector('button[type="submit"]');
    if (button) {
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Please wait...';
    }
}

function hideLoadingButton(formId) {
    const form = document.getElementById(formId);
    const button = form.querySelector('button[type="submit"]');
    if (button) {
        button.disabled = false;
        if (formId === 'loginForm') {
            button.innerHTML = 'Sign In';
        } else if (formId === 'signupForm') {
            button.innerHTML = 'Create Account';
        }
    }
}

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'warning': return 'exclamation-triangle';
        default: return 'info-circle';
    }
}

function logout() {
    // Clear all data
    clearAuthData();
    
    // Show notification
    showNotification('Logged out successfully', 'success');
    
    // Reload page to landing
    setTimeout(() => {
        location.reload();
    }, 1000);
}

function showDemo() {
    showNotification('Demo feature coming soon!', 'info');
}

// ===== CSS for Dashboard (Add to modern-styles.css) =====
const dashboardStyles = `
<style>
.dashboard {
    min-height: 100vh;
    background: var(--gray-50);
}

.dashboard-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0;
}

.dashboard-header {
    background: var(--white);
    border-bottom: 1px solid var(--gray-200);
    position: sticky;
    top: 0;
    z-index: 100;
}

.dashboard-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-4) var(--spacing-6);
}

.user-menu {
    display: flex;
    align-items: center;
    gap: var(--spacing-4);
}

.user-info {
    display: flex;
    align-items: center;
    gap: var(--spacing-4);
    font-weight: 500;
    color: var(--gray-700);
}

.dashboard-main {
    padding: var(--spacing-8) var(--spacing-6);
}

.dashboard-grid {
    display: grid;
    gap: var(--spacing-8);
}

.progress-section,
.courses-section {
    background: var(--white);
    border-radius: var(--radius-xl);
    padding: var(--spacing-8);
    box-shadow: var(--shadow-md);
    border: 1px solid var(--gray-200);
}

.progress-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--spacing-6);
    margin-top: var(--spacing-6);
}

.progress-card {
    display: flex;
    align-items: center;
    gap: var(--spacing-4);
    padding: var(--spacing-6);
    background: var(--gray-50);
    border-radius: var(--radius-lg);
    border: 1px solid var(--gray-200);
}

.progress-icon {
    width: 50px;
    height: 50px;
    background: var(--primary-color);
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--white);
    font-size: var(--font-size-lg);
}

.progress-info h3 {
    font-size: var(--font-size-2xl);
    font-weight: 700;
    color: var(--gray-900);
    margin-bottom: var(--spacing-1);
}

.progress-info p {
    color: var(--gray-600);
    font-size: var(--font-size-sm);
}

.courses-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--spacing-6);
    margin-top: var(--spacing-6);
}

.course-card {
    padding: var(--spacing-6);
    border: 2px solid var(--gray-200);
    border-radius: var(--radius-lg);
    transition: var(--transition-normal);
    background: var(--white);
}

.course-card:hover {
    border-color: var(--primary-color);
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
}

.course-card.enrolled {
    border-color: var(--primary-color);
    background: linear-gradient(135deg, var(--white) 0%, var(--gray-50) 100%);
}

.course-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-3);
}

.course-header h3 {
    font-size: var(--font-size-lg);
    font-weight: 600;
    color: var(--gray-900);
}

.course-chapters {
    background: var(--gray-100);
    color: var(--gray-600);
    padding: var(--spacing-1) var(--spacing-3);
    border-radius: var(--radius-md);
    font-size: var(--font-size-xs);
    font-weight: 500;
}

.course-description {
    color: var(--gray-600);
    margin-bottom: var(--spacing-4);
    line-height: 1.5;
}

.course-progress {
    margin-bottom: var(--spacing-4);
}

.progress-bar {
    width: 100%;
    height: 8px;
    background: var(--gray-200);
    border-radius: var(--radius-sm);
    overflow: hidden;
    margin-bottom: var(--spacing-2);
}

.progress-fill {
    height: 100%;
    background: var(--primary-color);
    border-radius: var(--radius-sm);
    transition: var(--transition-normal);
}

.progress-text {
    font-size: var(--font-size-sm);
    color: var(--gray-600);
    font-weight: 500;
}

.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--white);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-xl);
    border-left: 4px solid var(--primary-color);
    z-index: 9999;
    animation: slideInRight 0.3s ease;
}

.notification-success {
    border-left-color: var(--success-color);
}

.notification-error {
    border-left-color: var(--error-color);
}

.notification-warning {
    border-left-color: var(--warning-color);
}

.notification-content {
    display: flex;
    align-items: center;
    gap: var(--spacing-3);
    padding: var(--spacing-4) var(--spacing-6);
}

.notification-close {
    background: none;
    border: none;
    color: var(--gray-400);
    cursor: pointer;
    font-size: var(--font-size-sm);
    margin-left: var(--spacing-3);
}

@keyframes slideInRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

.dashboard-loading,
.dashboard-error {
    text-align: center;
    padding: var(--spacing-20);
    font-size: var(--font-size-lg);
    color: var(--gray-600);
}

.dashboard-error {
    color: var(--error-color);
}
</style>
`;

// Add dashboard styles to head
if (!document.querySelector('#dashboard-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'dashboard-styles';
    styleElement.innerHTML = dashboardStyles.replace('<style>', '').replace('</style>', '');
    document.head.appendChild(styleElement);
}