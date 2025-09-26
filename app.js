// App State Management
let currentUser = null;
let currentPage = 'dashboard';
let userStats = {
    points: 0,
    level: 1,
    dailyStreak: 0
};

// DOM Elements
const elements = {
    loading: document.getElementById('loading'),
    loginPage: document.getElementById('loginPage'),
    mainApp: document.getElementById('mainApp'),
    googleSignIn: document.getElementById('googleSignIn'),
    logoutBtn: document.getElementById('logoutBtn'),
    menuToggle: document.getElementById('menuToggle'),
    themeToggle: document.getElementById('themeToggle'),
    sidebar: document.querySelector('.sidebar'),
    userName: document.getElementById('userName'),
    userAvatar: document.getElementById('userAvatar'),
    welcomeName: document.getElementById('welcomeName'),
    dailyStreak: document.getElementById('dailyStreak'),
    totalPoints: document.getElementById('totalPoints'),
    currentLevel: document.getElementById('currentLevel')
};

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 LinguaLeap App Starting...');
    
    // Wait for Firebase to be ready
    setTimeout(() => {
        if (window.firebaseUtils) {
            // Test Firebase connection
            window.firebaseUtils.testFirebaseConnection();
            
            // Setup event listeners
            setupEventListeners();
            
            // Check authentication state
            window.firebaseUtils.auth.onAuthStateChanged(handleAuthStateChange);
            
            // Initialize theme
            initializeTheme();
        } else {
            console.error('Firebase not initialized properly!');
            hideLoading();
            alert('Failed to connect to Firebase. Please refresh the page.');
        }
    }, 1000);
});

// Event Listeners Setup
function setupEventListeners() {
    // Google Sign In
    elements.googleSignIn?.addEventListener('click', handleGoogleSignIn);
    
    // Logout
    elements.logoutBtn?.addEventListener('click', handleLogout);
    
    // Mobile Menu Toggle
    elements.menuToggle?.addEventListener('click', toggleMobileMenu);
    
    // Theme Toggle
    elements.themeToggle?.addEventListener('click', toggleTheme);
    
    // Navigation Links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.getAttribute('data-page');
            navigateToPage(page);
        });
    });
    
    // Path Buttons
    document.querySelectorAll('.path-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const page = btn.getAttribute('data-page');
            navigateToPage(page);
        });
    });
    
    // Back Buttons
    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const page = btn.getAttribute('data-page');
            navigateToPage(page);
        });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && 
            !elements.sidebar?.contains(e.target) && 
            !elements.menuToggle?.contains(e.target)) {
            elements.sidebar?.classList.remove('open');
        }
    });
}

// Authentication Handlers
async function handleGoogleSignIn() {
    try {
        showLoading('Signing in...');
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await window.firebaseUtils.auth.signInWithPopup(provider);
        const user = result.user;
        
        console.log('✅ Google Sign-in successful:', user.displayName);
        
        // Check if user exists in Firestore
        const userData = await window.firebaseUtils.fetchData('userProgress', user.uid);
        
        if (!userData) {
            // New user - create initial data
            console.log('New user detected. Creating progress document...');
            const initialData = {
                beginnerJourney: { 'bj-1': 'in_progress' },
                grammarDeepDive: { 'gdd-1': 'in_progress' },
                points: 0,
                level: 1,
                dailyStreak: 0,
                lastLogin: null
            };
            
            await window.firebaseUtils.uploadData('userProgress', user.uid, initialData);
            console.log('✅ Progress document created successfully.');
        }
        
        hideLoading();
    } catch (error) {
        console.error('❌ Error during sign-in:', error);
        alert('Sign-in failed. Please try again.');
        hideLoading();
    }
}

async function handleLogout() {
    try {
        await window.firebaseUtils.auth.signOut();
        console.log('✅ User signed out successfully');
    } catch (error) {
        console.error('❌ Error during sign-out:', error);
    }
}

async function handleAuthStateChange(user) {
    if (user) {
        console.log('✅ User is signed in:', user.displayName);
        currentUser = user;
        await loadUserData();
        showMainApp();
    } else {
        console.log('👋 User is signed out');
        currentUser = null;
        showLoginPage();
    }
}

// User Data Management
async function loadUserData() {
    if (!currentUser) return;
    
    try {
        showLoading('Loading your data...');
        
        // Update daily streak
        await window.firebaseUtils.updateDailyStreak(currentUser.uid);
        
        // Fetch updated stats
        const statsResult = await window.firebaseUtils.getUserDashboardStats(currentUser.uid);
        
        if (statsResult.success) {
            userStats = statsResult.data;
            updateUserInterface();
        } else {
            console.error('Failed to fetch user stats:', statsResult.error);
        }
        
        hideLoading();
    } catch (error) {
        console.error('Error loading user data:', error);
        hideLoading();
    }
}

function updateUserInterface() {
    if (!currentUser) return;
    
    // Update user profile
    if (elements.userName) {
        elements.userName.textContent = currentUser.displayName || 'User';
    }
    
    if (elements.userAvatar) {
        elements.userAvatar.src = currentUser.photoURL || 'https://via.placeholder.com/40';
    }
    
    if (elements.welcomeName) {
        const firstName = currentUser.displayName?.split(' ')[0] || 'friend';
        elements.welcomeName.textContent = firstName;
    }
    
    // Update stats
    if (elements.dailyStreak) {
        elements.dailyStreak.textContent = `${userStats.dailyStreak} days`;
    }
    
    if (elements.totalPoints) {
        elements.totalPoints.textContent = userStats.points.toString();
    }
    
    if (elements.currentLevel) {
        elements.currentLevel.textContent = userStats.level.toString();
    }
}

// UI State Management
function showLoading(message = 'Loading...') {
    if (elements.loading) {
        elements.loading.querySelector('p').textContent = message;
        elements.loading.classList.remove('hidden');
    }
}

function hideLoading() {
    if (elements.loading) {
        elements.loading.classList.add('hidden');
    }
}

function showLoginPage() {
    hideLoading();
    elements.loginPage?.classList.remove('hidden');
    elements.mainApp?.classList.add('hidden');
}

function showMainApp() {
    hideLoading();
    elements.loginPage?.classList.add('hidden');
    elements.mainApp?.classList.remove('hidden');
    navigateToPage('dashboard');
}

// Navigation System
function navigateToPage(pageName) {
    if (currentPage === pageName) return;
    
    console.log(`🧭 Navigating to: ${pageName}`);
    
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show target page
    const targetPage = document.getElementById(`${pageName}Page`);
    if (targetPage) {
        targetPage.classList.add('active');
        currentPage = pageName;
        
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-page') === pageName) {
                link.classList.add('active');
            }
        });
        
        // Close mobile menu
        if (window.innerWidth <= 768) {
            elements.sidebar?.classList.remove('open');
        }
        
        // Page-specific logic
        handlePageSpecificLogic(pageName);
    } else {
        console.error(`Page not found: ${pageName}Page`);
    }
}

function handlePageSpecificLogic(pageName) {
    switch (pageName) {
        case 'dashboard':
            // Refresh stats if needed
            if (currentUser) {
                updateUserInterface();
            }
            break;
        case 'beginner':
            // Load beginner progress
            loadBeginnerProgress();
            break;
        case 'grammar':
            // Load grammar progress
            loadGrammarProgress();
            break;
        default:
            break;
    }
}

// Progress Loading Functions
async function loadBeginnerProgress() {
    if (!currentUser) return;
    
    try {
        showLoading('Loading lessons...');
        
        // Load lessons from Firebase
        const lessonsData = await window.firebaseUtils.fetchData('lessons', 'beginnerJourney');
        const userData = await window.firebaseUtils.fetchData('userProgress', currentUser.uid);
        
        if (lessonsData) {
            displayLessons('beginnerPage', lessonsData, userData?.beginnerJourney || {});
        } else {
            displayNoLessons('beginnerPage', 'Beginner\'s Journey');
        }
        
        hideLoading();
    } catch (error) {
        console.error('Error loading beginner progress:', error);
        hideLoading();
        displayNoLessons('beginnerPage', 'Beginner\'s Journey');
    }
}

async function loadGrammarProgress() {
    if (!currentUser) return;
    
    try {
        showLoading('Loading lessons...');
        
        // Load lessons from Firebase
        const lessonsData = await window.firebaseUtils.fetchData('lessons', 'grammarDeepDive');
        const userData = await window.firebaseUtils.fetchData('userProgress', currentUser.uid);
        
        if (lessonsData) {
            displayLessons('grammarPage', lessonsData, userData?.grammarDeepDive || {});
        } else {
            displayNoLessons('grammarPage', 'Grammar Deep Dive');
        }
        
        hideLoading();
    } catch (error) {
        console.error('Error loading grammar progress:', error);
        hideLoading();
        displayNoLessons('grammarPage', 'Grammar Deep Dive');
    }
}

// Display lessons dynamically
function displayLessons(pageId, lessonsData, userProgress) {
    const page = document.getElementById(pageId);
    const lessonsGrid = page.querySelector('.lessons-grid');
    
    if (!lessonsGrid) {
        console.error('Lessons grid not found in page:', pageId);
        return;
    }
    
    let html = '';
    
    if (lessonsData && Object.keys(lessonsData).length > 0) {
        Object.keys(lessonsData).forEach(lessonId => {
            const lesson = lessonsData[lessonId];
            const progress = userProgress[lessonId] || 'not_started';
            const progressPercent = getProgressPercent(progress);
            const isLocked = shouldBeLocked(lessonId, userProgress);
            
            html += `
                <div class="lesson-card ${isLocked ? 'locked' : ''}">
                    <h3>${lesson.title}</h3>
                    <p>${lesson.description}</p>
                    <div class="lesson-meta">
                        <span class="difficulty">📊 ${lesson.difficulty || 'Beginner'}</span>
                        <span class="duration">⏱️ ${lesson.duration || 15} min</span>
                    </div>
                    <div class="lesson-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progressPercent}%"></div>
                        </div>
                        <span>${progressPercent}% Complete</span>
                    </div>
                    <button class="lesson-btn" 
                            onclick="startLesson('${lessonId}', '${pageId.replace('Page', '')}')"
                            ${isLocked ? 'disabled' : ''}>
                        ${isLocked ? '🔒 Locked' : (progress === 'completed' ? 'Review Lesson' : 'Start Lesson')}
                    </button>
                </div>
            `;
        });
    } else {
        html = `
            <div class="no-lessons">
                <h3>No lessons available yet</h3>
                <p>Lessons are being prepared. Please check back later!</p>
                <button class="lesson-btn" onclick="window.open('admin.html', '_blank')">
                    📚 Go to Admin Panel
                </button>
            </div>
        `;
    }
    
    lessonsGrid.innerHTML = html;
}

function displayNoLessons(pageId, courseName) {
    const page = document.getElementById(pageId);
    const lessonsGrid = page.querySelector('.lessons-grid');
    
    if (lessonsGrid) {
        lessonsGrid.innerHTML = `
            <div class="no-lessons">
                <h3>No ${courseName} lessons available</h3>
                <p>Lessons are being prepared. Please check back later!</p>
                <button class="lesson-btn" onclick="window.open('admin.html', '_blank')">
                    📚 Go to Admin Panel
                </button>
            </div>
        `;
    }
}

function getProgressPercent(progress) {
    switch(progress) {
        case 'completed': return 100;
        case 'in_progress': return 50;
        case 'not_started':
        default: return 0;
    }
}

function shouldBeLocked(lessonId, userProgress) {
    // Simple locking logic - first lesson is always unlocked
    const lessonNumber = parseInt(lessonId.split('-')[1]);
    if (lessonNumber === 1) return false;
    
    // Check if previous lesson is completed
    const prevLessonId = lessonId.split('-')[0] + '-' + (lessonNumber - 1);
    return userProgress[prevLessonId] !== 'completed';
}

async function startLesson(lessonId, courseType) {
    console.log(`🚀 Starting lesson: ${lessonId} from ${courseType}`);
    
    try {
        showLoading('Loading lesson content...');
        
        // Load lesson content
        const lessonsData = await window.firebaseUtils.fetchData('lessons', courseType === 'beginner' ? 'beginnerJourney' : 'grammarDeepDive');
        const lesson = lessonsData[lessonId];
        
        if (lesson && lesson.content) {
            // Mark lesson as in progress
            await updateLessonProgress(lessonId, courseType, 'in_progress');
            
            // Display lesson content (this would typically open a new view)
            displayLessonContent(lesson, lessonId, courseType);
        } else {
            showAlert('Lesson content not found', 'error');
        }
        
        hideLoading();
    } catch (error) {
        console.error('Error starting lesson:', error);
        hideLoading();
        alert('Failed to load lesson. Please try again.');
    }
}

function displayLessonContent(lesson, lessonId, courseType) {
    // For now, just show an alert with lesson info
    // In a full implementation, this would open a dedicated lesson view
    const sectionsCount = lesson.content.sections ? lesson.content.sections.length : 0;
    
    const message = `
Lesson: ${lesson.title}

Description: ${lesson.description}

Content Sections: ${sectionsCount}

This lesson is now marked as "In Progress" in your profile.

💡 Tip: Use the Admin Panel to add detailed lesson content with exercises, vocabulary, and interactive elements.
    `;
    
    alert(message);
    
    // Refresh the current page to show updated progress
    const currentPageName = courseType === 'beginner' ? 'beginner' : 'grammar';
    navigateToPage(currentPageName);
}

async function updateLessonProgress(lessonId, courseType, status) {
    if (!currentUser) return;
    
    try {
        const progressField = courseType === 'beginner' ? 'beginnerJourney' : 'grammarDeepDive';
        const userData = await window.firebaseUtils.fetchData('userProgress', currentUser.uid);
        
        if (userData) {
            if (!userData[progressField]) {
                userData[progressField] = {};
            }
            userData[progressField][lessonId] = status;
            
            // Update points if lesson completed
            if (status === 'completed') {
                userData.points = (userData.points || 0) + 10;
                // Check for level up
                const newLevel = Math.floor(userData.points / 100) + 1;
                if (newLevel > userData.level) {
                    userData.level = newLevel;
                    showAlert(`🎉 Level up! You are now Level ${newLevel}!`, 'success');
                }
            }
            
            await window.firebaseUtils.uploadData('userProgress', currentUser.uid, userData);
            
            // Update UI
            await loadUserData();
        }
    } catch (error) {
        console.error('Error updating lesson progress:', error);
    }
}

// Mobile Menu Functions
function toggleMobileMenu() {
    elements.sidebar?.classList.toggle('open');
}

// Theme Management
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Update theme toggle button
    if (elements.themeToggle) {
        elements.themeToggle.textContent = theme === 'light' ? '🌙' : '☀️';
    }
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Alert function for user feedback
function showAlert(message, type = 'success') {
    // Create alert container if it doesn't exist
    let container = document.getElementById('alert-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'alert-container';
        container.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 1000;';
        document.body.appendChild(container);
    }
    
    const alert = document.createElement('div');
    alert.style.cssText = `
        background: ${type === 'success' ? '#c6f6d5' : '#fed7d7'};
        color: ${type === 'success' ? '#22543d' : '#742a2a'};
        border: 1px solid ${type === 'success' ? '#9ae6b4' : '#feb2b2'};
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 1rem;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        max-width: 300px;
        font-family: Inter, sans-serif;
    `;
    
    alert.innerHTML = `
        ${message}
        <button onclick="this.parentElement.remove()" 
                style="float: right; background: none; border: none; font-size: 1.2rem; cursor: pointer; margin-left: 10px;">&times;</button>
    `;
    
    container.appendChild(alert);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alert.parentElement) {
            alert.remove();
        }
    }, 5000);
}

// Error Handling
window.addEventListener('error', (error) => {
    console.error('💥 Global error:', error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('💥 Unhandled promise rejection:', event.reason);
    event.preventDefault();
});

// Responsive Design Helpers
function handleResize() {
    if (window.innerWidth > 768) {
        elements.sidebar?.classList.remove('open');
    }
}

window.addEventListener('resize', debounce(handleResize, 100));

// Export for debugging
window.appDebug = {
    currentUser,
    currentPage,
    userStats,
    navigateToPage,
    loadUserData,
    elements
};

console.log('✅ LinguaLeap App Initialized!');
console.log('🐛 Debug tools available at window.appDebug');