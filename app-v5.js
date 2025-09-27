// ===== LINGUALEAP V5.0 - MAIN APPLICATION =====

// Global variables
let currentUser = null;
let userProgress = {};
let availableCourses = [];
let userSettings = {};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 LinguaLeap V5.0 Starting...');
    
    // Initialize Firebase
    initializeFirebase();
    
    // Set up event listeners
    setupEventListeners();
    
    // Check authentication status
    checkAuthStatus();
    
    // Show loading screen initially
    showLoadingScreen();
});

// Initialize Firebase connection
function initializeFirebase() {
    try {
        if (typeof firebase !== 'undefined') {
            console.log('✅ Firebase loaded successfully');
            
            // Set up auth state listener
            firebase.auth().onAuthStateChanged((user) => {
                handleAuthStateChange(user);
            });
            
        } else {
            console.error('❌ Firebase not loaded');
            showNotification('Firebase connection failed', 'error');
        }
    } catch (error) {
        console.error('❌ Firebase initialization error:', error);
        showNotification('Unable to connect to server', 'error');
    }
}

// Handle authentication state changes
function handleAuthStateChange(user) {
    if (user) {
        // User is signed in
        currentUser = user;
        loadUserData();
        showMainApp();
    } else {
        // User is signed out
        currentUser = null;
        showAuthContainer();
    }
}

// Check initial authentication status
function checkAuthStatus() {
    // Check if user data exists in localStorage
    const savedUser = localStorage.getItem('lingualeap_user');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            loadUserData();
            showMainApp();
        } catch (error) {
            console.error('Error parsing saved user data:', error);
            localStorage.removeItem('lingualeap_user');
            showAuthContainer();
        }
    } else {
        showAuthContainer();
    }
}

// Set up all event listeners
function setupEventListeners() {
    // Authentication forms
    const loginForm = document.getElementById('loginFormElement');
    const signupForm = document.getElementById('signupFormElement');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
    
    // Sign out button
    const signOutBtn = document.getElementById('signOutBtn');
    if (signOutBtn) {
        signOutBtn.addEventListener('click', handleSignOut);
    }
    
    // Navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', handleNavigation);
    });
    
    // Practice buttons
    const practiceButtons = document.querySelectorAll('.practice-btn');
    practiceButtons.forEach(btn => {
        btn.addEventListener('click', handlePracticeStart);
    });
    
    // Quick action cards
    const actionCards = document.querySelectorAll('.action-card');
    actionCards.forEach(card => {
        card.addEventListener('click', handleQuickAction);
    });
    
    // Continue learning button
    const continueBtn = document.querySelector('.continue-btn');
    if (continueBtn) {
        continueBtn.addEventListener('click', handleContinueLearning);
    }
    
    // Filter tabs
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', handleFilterChange);
    });
    
    // Library tabs
    const libraryTabs = document.querySelectorAll('.library-tab');
    libraryTabs.forEach(tab => {
        tab.addEventListener('click', handleLibraryTabChange);
    });
}

// Show loading screen
function showLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    const authContainer = document.getElementById('authContainer');
    const mainApp = document.getElementById('mainApp');
    
    if (loadingScreen) loadingScreen.style.display = 'flex';
    if (authContainer) authContainer.style.display = 'none';
    if (mainApp) mainApp.style.display = 'none';
    
    // Animate loading progress
    const progressFill = document.querySelector('.loading-progress .progress-fill');
    if (progressFill) {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setTimeout(() => {
                    hideLoadingScreen();
                }, 500);
            }
            progressFill.style.width = progress + '%';
        }, 200);
    } else {
        setTimeout(hideLoadingScreen, 2000);
    }
}

// Hide loading screen
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.style.display = 'none';
    }
}

// Show authentication container
function showAuthContainer() {
    hideLoadingScreen();
    
    const authContainer = document.getElementById('authContainer');
    const mainApp = document.getElementById('mainApp');
    
    if (authContainer) authContainer.style.display = 'flex';
    if (mainApp) mainApp.style.display = 'none';
    
    console.log('🔐 Showing authentication');
}

// Show main application
function showMainApp() {
    hideLoadingScreen();
    
    const authContainer = document.getElementById('authContainer');
    const mainApp = document.getElementById('mainApp');
    
    if (authContainer) authContainer.style.display = 'none';
    if (mainApp) mainApp.style.display = 'flex';
    
    // Load initial data
    loadDashboardData();
    loadCourses();
    loadLibraryContent();
    
    console.log('✅ Main app loaded');
}

// Handle user login
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    if (!email || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    try {
        console.log('🔐 Attempting login...');
        
        // For demo purposes, we'll simulate authentication
        // In production, this would connect to your actual authentication system
        const loginResult = await simulateLogin(email, password);
        
        if (loginResult.success) {
            currentUser = loginResult.user;
            
            // Save user data
            if (rememberMe) {
                localStorage.setItem('lingualeap_user', JSON.stringify(currentUser));
            }
            
            // Save to server
            await saveUserLoginToServer(currentUser);
            
            showNotification('Login successful! Welcome back.', 'success');
            showMainApp();
            
        } else {
            showNotification(loginResult.error || 'Login failed', 'error');
        }
        
    } catch (error) {
        console.error('❌ Login error:', error);
        showNotification('Login failed. Please try again.', 'error');
    }
}

// Handle user signup
async function handleSignup(e) {
    e.preventDefault();
    
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;
    
    // Validation
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
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
        console.log('📝 Creating account...');
        
        // For demo purposes, we'll simulate account creation
        const signupResult = await simulateSignup({
            firstName,
            lastName,
            email,
            password
        });
        
        if (signupResult.success) {
            currentUser = signupResult.user;
            
            // Save user data
            localStorage.setItem('lingualeap_user', JSON.stringify(currentUser));
            
            // Save to server
            await saveNewUserToServer(currentUser);
            
            showNotification('Account created successfully! Welcome to LinguaLeap.', 'success');
            showMainApp();
            
        } else {
            showNotification(signupResult.error || 'Signup failed', 'error');
        }
        
    } catch (error) {
        console.error('❌ Signup error:', error);
        showNotification('Account creation failed. Please try again.', 'error');
    }
}

// Handle user sign out
async function handleSignOut() {
    try {
        console.log('🔐 Signing out...');
        
        // Clear local storage
        localStorage.removeItem('lingualeap_user');
        
        // Update server
        if (currentUser) {
            await saveUserLogoutToServer(currentUser.id);
        }
        
        currentUser = null;
        userProgress = {};
        
        showNotification('Signed out successfully', 'success');
        showAuthContainer();
        
    } catch (error) {
        console.error('❌ Sign out error:', error);
        showNotification('Sign out failed', 'error');
    }
}

// Load user data and progress
async function loadUserData() {
    if (!currentUser) return;
    
    try {
        console.log('📊 Loading user data...');
        
        // Load user progress from server
        const progressData = await loadUserProgressFromServer(currentUser.id);
        if (progressData.success) {
            userProgress = progressData.data;
        }
        
        // Update UI with user data
        updateUserInterface();
        
    } catch (error) {
        console.error('❌ Error loading user data:', error);
        // Use default data if server fails
        userProgress = getDefaultUserProgress();
        updateUserInterface();
    }
}

// Update user interface with data
function updateUserInterface() {
    if (!currentUser) return;
    
    // Update user name displays
    const userDisplayName = document.getElementById('userDisplayName');
    const welcomeUserName = document.getElementById('welcomeUserName');
    
    const displayName = currentUser.firstName || 'Learner';
    
    if (userDisplayName) userDisplayName.textContent = displayName;
    if (welcomeUserName) welcomeUserName.textContent = displayName;
    
    // Update user level
    const userCurrentLevel = document.getElementById('userCurrentLevel');
    const currentLevel = document.getElementById('currentLevel');
    
    if (userCurrentLevel) userCurrentLevel.textContent = userProgress.level || 'Beginner';
    if (currentLevel) currentLevel.textContent = userProgress.levelNumber || '1';
    
    // Update stats
    const userStreak = document.getElementById('userStreak');
    const todayTime = document.getElementById('todayTime');
    const totalXP = document.getElementById('totalXP');
    
    if (userStreak) userStreak.textContent = userProgress.streak || '0';
    if (todayTime) todayTime.textContent = formatTime(userProgress.todayMinutes || 0);
    if (totalXP) totalXP.textContent = userProgress.totalXP || '0';
    
    console.log('✅ User interface updated');
}

// Load dashboard data
async function loadDashboardData() {
    try {
        console.log('📊 Loading dashboard data...');
        
        // This would load real data from your server
        // For now, we'll use sample data
        
        // Update progress bars with animation
        animateProgressBars();
        
    } catch (error) {
        console.error('❌ Error loading dashboard data:', error);
    }
}

// Load available courses
async function loadCourses() {
    try {
        console.log('📚 Loading courses...');
        
        // Load courses from server
        const coursesData = await loadCoursesFromServer();
        
        if (coursesData.success) {
            availableCourses = coursesData.courses;
            renderCourses(availableCourses);
        } else {
            // Use default courses if server fails
            availableCourses = getDefaultCourses();
            renderCourses(availableCourses);
        }
        
    } catch (error) {
        console.error('❌ Error loading courses:', error);
        availableCourses = getDefaultCourses();
        renderCourses(availableCourses);
    }
}

// Render courses in the UI
function renderCourses(courses) {
    const coursesGrid = document.getElementById('coursesGrid');
    if (!coursesGrid) return;
    
    coursesGrid.innerHTML = '';
    
    courses.forEach(course => {
        const courseCard = createCourseCard(course);
        coursesGrid.appendChild(courseCard);
    });
}

// Create course card element
function createCourseCard(course) {
    const card = document.createElement('div');
    card.className = `course-card ${course.enrolled ? 'enrolled' : ''} ${course.difficulty.toLowerCase()}`;
    
    card.innerHTML = `
        <div class="course-header">
            <div class="course-flag">${course.flag}</div>
            <div class="course-info">
                <h3>${course.name}</h3>
                <p>${course.difficulty} • ${course.lessons} lessons</p>
            </div>
            <div class="course-badge">${course.enrolled ? 'Enrolled' : 'New'}</div>
        </div>
        <div class="course-description">
            <p>${course.description}</p>
        </div>
        <div class="course-progress">
            ${course.enrolled ? `
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${course.progress}%"></div>
                </div>
                <span class="progress-text">${course.progress}% Complete</span>
            ` : `
                <div class="course-features">
                    <span><i class="fas fa-clock"></i> ${course.duration}</span>
                    <span><i class="fas fa-users"></i> ${course.students} students</span>
                </div>
            `}
        </div>
        <div class="course-actions">
            <button class="course-btn ${course.enrolled ? 'continue' : 'start'}" 
                    onclick="${course.enrolled ? 'continueCourse' : 'startCourse'}('${course.id}')">
                <i class="fas fa-${course.enrolled ? 'play' : 'rocket'}"></i>
                ${course.enrolled ? 'Continue' : 'Start Course'}
            </button>
        </div>
    `;
    
    return card;
}

// Load library content
async function loadLibraryContent() {
    try {
        console.log('📖 Loading library content...');
        
        // Load different types of content
        await loadVideos();
        await loadArticles();
        await loadPodcasts();
        await loadBooks();
        
    } catch (error) {
        console.error('❌ Error loading library content:', error);
    }
}

// Handle navigation between sections
function handleNavigation(e) {
    e.preventDefault();
    
    const targetSection = e.currentTarget.dataset.section;
    if (!targetSection) return;
    
    // Remove active class from all nav items and sections
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Add active class to clicked nav item
    e.currentTarget.classList.add('active');
    
    // Show target section
    const targetElement = document.getElementById(targetSection + 'Section');
    if (targetElement) {
        targetElement.classList.add('active');
    }
    
    console.log(`🧭 Navigated to: ${targetSection}`);
}

// Handle practice start
function handlePracticeStart(e) {
    const practiceType = e.currentTarget.dataset.type;
    console.log(`🎯 Starting practice: ${practiceType}`);
    
    // Save practice session start
    savePracticeSession(practiceType);
    
    showNotification(`Starting ${practiceType} practice...`, 'info');
    
    // Here you would open the actual practice interface
}

// Handle quick actions
function handleQuickAction(e) {
    const actionType = e.currentTarget.classList[1]; // Gets the specific action class
    console.log(`⚡ Quick action: ${actionType}`);
    
    showNotification(`Starting ${actionType} practice...`, 'info');
    
    // Save action to user progress
    saveQuickAction(actionType);
}

// Handle continue learning
function handleContinueLearning() {
    console.log('📖 Continuing learning...');
    
    // Update user progress
    updateLearningProgress();
    
    showNotification('Continuing your lesson...', 'info');
    
    // Here you would open the current lesson
}

// Switch between login and signup forms
function switchToSignup() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    if (loginForm) loginForm.classList.remove('active');
    if (signupForm) signupForm.classList.add('active');
}

function switchToLogin() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    if (signupForm) signupForm.classList.remove('active');
    if (loginForm) loginForm.classList.add('active');
}

// Toggle password visibility
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const toggle = input.nextElementSibling;
    const icon = toggle.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Show notification toast
function showNotification(message, type = 'info', duration = 4000) {
    const toast = document.getElementById('notificationToast');
    if (!toast) return;
    
    const toastIcon = toast.querySelector('.toast-icon i');
    const toastTitle = toast.querySelector('.toast-message h4');
    const toastText = toast.querySelector('.toast-message p');
    
    // Set icon based on type
    toastIcon.className = `fas fa-${
        type === 'success' ? 'check-circle' : 
        type === 'error' ? 'exclamation-circle' : 
        type === 'warning' ? 'exclamation-triangle' : 
        'info-circle'
    }`;
    
    // Set title based on type
    toastTitle.textContent = 
        type === 'success' ? 'Success!' : 
        type === 'error' ? 'Error!' : 
        type === 'warning' ? 'Warning!' : 
        'Info';
    
    toastText.textContent = message;
    
    // Set color based on type
    toast.className = `notification-toast ${type} show`;
    
    // Auto hide after duration
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
    
    // Close button functionality
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.onclick = () => {
        toast.classList.remove('show');
    };
}

// Utility function to format time
function formatTime(minutes) {
    if (minutes < 60) {
        return minutes + 'm';
    } else {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return hours + 'h ' + remainingMinutes + 'm';
    }
}

// Animate progress bars
function animateProgressBars() {
    const progressBars = document.querySelectorAll('.progress-fill');
    progressBars.forEach(bar => {
        const targetWidth = bar.style.width;
        bar.style.width = '0%';
        
        setTimeout(() => {
            bar.style.width = targetWidth;
        }, 500);
    });
}

// Get default user progress
function getDefaultUserProgress() {
    return {
        level: 'Beginner',
        levelNumber: 1,
        streak: 0,
        todayMinutes: 0,
        totalXP: 0,
        completedLessons: 0,
        achievements: []
    };
}

// Get default courses
function getDefaultCourses() {
    return [
        {
            id: 'spanish-beginner',
            name: 'Spanish',
            flag: '🇪🇸',
            difficulty: 'Beginner',
            lessons: 24,
            description: 'Learn Spanish from scratch with our comprehensive beginner course',
            duration: '3 months',
            students: '125k',
            enrolled: true,
            progress: 35
        },
        {
            id: 'french-beginner',
            name: 'French',
            flag: '🇫🇷',
            difficulty: 'Beginner',
            lessons: 28,
            description: 'Master French fundamentals with interactive lessons and practice',
            duration: '4 months',
            students: '98k',
            enrolled: false,
            progress: 0
        },
        {
            id: 'german-intermediate',
            name: 'German',
            flag: '🇩🇪',
            difficulty: 'Intermediate',
            lessons: 32,
            description: 'Advance your German skills with complex grammar and vocabulary',
            duration: '5 months',
            students: '76k',
            enrolled: false,
            progress: 0
        }
    ];
}

// Make functions globally available
window.switchToSignup = switchToSignup;
window.switchToLogin = switchToLogin;
window.togglePassword = togglePassword;

console.log('🚀 LinguaLeap V5.0 Main App initialized!');
