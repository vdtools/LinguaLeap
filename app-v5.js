// ===== LINGUALEAP V5.0 - MAIN APPLICATION =====

console.log('🚀 LinguaLeap V5.0 Starting...');

// Global variables
let currentUser = null;
let currentView = 'dashboard';
let userMenuOpen = false;

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('📱 DOM loaded, initializing app...');
    initializeApp();
});

// ===== INITIALIZATION =====

function initializeApp() {
    try {
        console.log('🔧 Initializing LinguaLeap V5.0...');
        
        // Check if user is already logged in
        currentUser = LinguaLeap.getCurrentUser();
        
        if (currentUser) {
            console.log('✅ User already logged in:', currentUser.email);
            showMainApp();
        } else {
            console.log('🔐 No user logged in, showing authentication');
            showAuthentication();
        }
        
        // Setup event listeners
        setupEventListeners();
        
        // Hide loading screen
        setTimeout(() => {
            hideLoadingScreen();
        }, 2000);
        
        console.log('🚀 LinguaLeap V5.0 Main App initialized!');
        
    } catch (error) {
        console.error('❌ App initialization failed:', error);
        showNotification('Failed to initialize app. Please refresh the page.', 'error');
    }
}

// Setup all event listeners
function setupEventListeners() {
    console.log('🎯 Setting up event listeners...');
    
    // Auth form listeners
    const loginForm = document.getElementById('loginFormElement');
    const signupForm = document.getElementById('signupFormElement');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
    
    // Navigation listeners
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const view = this.getAttribute('onclick').match(/showView\('(.+?)'\)/);
            if (view) {
                showView(view[1]);
            }
        });
    });
    
    // Continue button
    const continueBtn = document.querySelector('.btn.primary[onclick="continueLearning()"]');
    if (continueBtn) {
        continueBtn.addEventListener('click', handleContinueLearning);
    }
    
    // Close user menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.user-menu')) {
            closeUserMenu();
        }
    });
    
    // Search functionality
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
}

// ===== LOADING SCREEN =====

function showLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.style.display = 'flex';
        
        // Animate loading bar
        const progressBar = document.querySelector('.loading-progress');
        if (progressBar) {
            progressBar.style.width = '0%';
            setTimeout(() => {
                progressBar.style.width = '100%';
            }, 500);
        }
    }
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.style.display = 'none';
    }
}

// ===== AUTHENTICATION =====

function showAuthentication() {
    const authContainer = document.getElementById('authContainer');
    const mainApp = document.getElementById('mainApp');
    
    if (authContainer) authContainer.style.display = 'flex';
    if (mainApp) mainApp.style.display = 'none';
    
    showLoginForm();
}

function showLoginForm() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    if (loginForm) loginForm.style.display = 'block';
    if (signupForm) signupForm.style.display = 'none';
}

function showSignupForm() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    if (loginForm) loginForm.style.display = 'none';
    if (signupForm) signupForm.style.display = 'block';
}

// Handle login form submission
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showNotification('Please fill in all fields', 'warning');
        return;
    }
    
    console.log('🔐 Attempting login for:', email);
    showNotification('Signing in...', 'info');
    
    try {
        const result = await LinguaLeap.authenticateUser(email, password);
        
        if (result.success) {
            currentUser = result.user;
            console.log('✅ Login successful');
            showNotification('Welcome back!', 'success');
            showMainApp();
        } else {
            console.log('❌ Login failed:', result.error);
            showNotification(result.error, 'error');
        }
    } catch (error) {
        console.error('❌ Login error:', error);
        showNotification('Login failed. Please try again.', 'error');
    }
}

// Handle signup form submission
async function handleSignup(e) {
    e.preventDefault();
    
    const firstName = document.getElementById('signupFirstName').value;
    const lastName = document.getElementById('signupLastName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    
    // Validation
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
        showNotification('Please fill in all fields', 'warning');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'warning');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters', 'warning');
        return;
    }
    
    console.log('📝 Creating account for:', email);
    showNotification('Creating your account...', 'info');
    
    try {
        const result = await LinguaLeap.createUser({
            firstName,
            lastName,
            email,
            password
        });
        
        if (result.success) {
            currentUser = result.user;
            console.log('✅ Account created successfully');
            showNotification('Account created successfully! Welcome to LinguaLeap!', 'success');
            showMainApp();
        } else {
            console.log('❌ Signup failed:', result.error);
            showNotification(result.error, 'error');
        }
    } catch (error) {
        console.error('❌ Signup error:', error);
        showNotification('Account creation failed. Please try again.', 'error');
    }
}

// ===== MAIN APPLICATION =====

function showMainApp() {
    const authContainer = document.getElementById('authContainer');
    const mainApp = document.getElementById('mainApp');
    
    if (authContainer) authContainer.style.display = 'none';
    if (mainApp) mainApp.style.display = 'block';
    
    // Update user interface
    updateUserInterface();
    
    // Load dashboard
    showView('dashboard');
    
    // Update streak
    LinguaLeap.updateStreak();
}

function updateUserInterface() {
    if (!currentUser) return;
    
    // Update user name displays
    const welcomeUserName = document.getElementById('welcomeUserName');
    const userFullName = document.getElementById('userFullName');
    const userEmailDisplay = document.getElementById('userEmailDisplay');
    const userAvatar = document.getElementById('userAvatar');
    const userAvatarLarge = document.getElementById('userAvatarLarge');
    
    if (welcomeUserName) welcomeUserName.textContent = currentUser.firstName;
    if (userFullName) userFullName.textContent = `${currentUser.firstName} ${currentUser.lastName}`;
    if (userEmailDisplay) userEmailDisplay.textContent = currentUser.email;
    if (userAvatar) userAvatar.src = currentUser.avatar;
    if (userAvatarLarge) userAvatarLarge.src = currentUser.avatar;
    
    // Update progress statistics
    updateProgressDisplay();
}

function updateProgressDisplay() {
    const progress = LinguaLeap.getUserProgress();
    if (!progress) return;
    
    // Update stats
    const streakCount = document.getElementById('streakCount');
    const xpCount = document.getElementById('xpCount');
    const badgeCount = document.getElementById('badgeCount');
    
    if (streakCount) streakCount.textContent = progress.streak || 0;
    if (xpCount) xpCount.textContent = progress.totalXP || 0;
    if (badgeCount) badgeCount.textContent = progress.badges ? progress.badges.length : 0;
    
    // Update progress circle
    const completedLessons = progress.completedLessons ? progress.completedLessons.length : 0;
    const totalLessons = 20; // From Spanish Fundamentals course
    const percentage = Math.round((completedLessons / totalLessons) * 100);
    
    const progressPercent = document.getElementById('progressPercent');
    const progressCircle = document.getElementById('progressCircle');
    
    if (progressPercent) progressPercent.textContent = percentage + '%';
    if (progressCircle) {
        const circumference = 2 * Math.PI * 50; // radius = 50
        const offset = circumference - (percentage / 100) * circumference;
        progressCircle.style.strokeDashoffset = offset;
    }
}

// ===== NAVIGATION =====

function showView(viewName) {
    console.log(`📄 Switching to ${viewName} view`);
    
    // Hide all views
    const views = document.querySelectorAll('.view');
    views.forEach(view => view.classList.remove('active'));
    
    // Show selected view
    const targetView = document.getElementById(viewName + 'View');
    if (targetView) {
        targetView.classList.add('active');
    }
    
    // Update bottom navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    
    const activeNavItem = document.querySelector(`[onclick="showView('${viewName}')"]`);
    if (activeNavItem) {
        activeNavItem.classList.add('active');
    }
    
    currentView = viewName;
    
    // Load view-specific content
    switch (viewName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'courses':
            loadCourses();
            break;
        case 'practice':
            loadPractice();
            break;
        case 'progress':
            loadProgress();
            break;
        case 'profile':
            loadProfile();
            break;
    }
}

// ===== USER MENU =====

function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        userMenuOpen = !userMenuOpen;
        dropdown.style.display = userMenuOpen ? 'block' : 'none';
    }
}

function closeUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown && userMenuOpen) {
        dropdown.style.display = 'none';
        userMenuOpen = false;
    }
}

// ===== LEARNING FUNCTIONS =====

function handleContinueLearning() {
    console.log('📚 Continuing learning...');
    showNotification('Loading your next lesson...', 'info');
    
    // Simulate lesson loading
    setTimeout(() => {
        showNotification('Lesson loaded! Let\'s continue learning Spanish!', 'success');
        // Here you would navigate to the actual lesson
    }, 1500);
}

function continueLearning() {
    handleContinueLearning();
}

function startQuickPractice(type) {
    console.log(`🎯 Starting ${type} practice`);
    showNotification(`Starting ${type} practice session...`, 'info');
    
    // Simulate practice start
    setTimeout(() => {
        showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} practice ready!`, 'success');
    }, 1000);
}

// ===== COURSE FUNCTIONS =====

function showAllCourses() {
    showView('courses');
}

function showCourseDetails() {
    showNotification('Loading course details...', 'info');
}

function loadCourses() {
    console.log('📚 Loading courses...');
    // Course loading logic would go here
}

function loadDashboard() {
    console.log('🏠 Loading dashboard...');
    updateProgressDisplay();
}

function loadPractice() {
    console.log('🎯 Loading practice...');
    // Practice loading logic would go here
}

function loadProgress() {
    console.log('📊 Loading progress...');
    // Progress loading logic would go here
}

function loadProfile() {
    console.log('👤 Loading profile...');
    // Profile loading logic would go here
}

// ===== SEARCH FUNCTIONALITY =====

function handleSearch(e) {
    const query = e.target.value;
    if (query.length > 2) {
        console.log('🔍 Searching for:', query);
        // Search logic would go here
    }
}

// ===== NOTIFICATION SYSTEM =====

function showNotifications() {
    showNotification('You have 3 new achievements!', 'info');
}

function showNotification(message, type = 'info') {
    const toast = document.getElementById('notificationToast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (toast && toastMessage) {
        toastMessage.textContent = message;
        toast.className = `notification-toast ${type} show`;
        
        // Auto hide after 4 seconds
        setTimeout(() => {
            hideNotification();
        }, 4000);
    }
    
    console.log(`📢 ${type.toUpperCase()}: ${message}`);
}

function hideNotification() {
    const toast = document.getElementById('notificationToast');
    if (toast) {
        toast.classList.remove('show');
    }
}

// ===== PROFILE FUNCTIONS =====

function showProfile() {
    showView('profile');
    closeUserMenu();
}

function showProgress() {
    showView('progress');
    closeUserMenu();
}

function showSettings() {
    showNotification('Settings panel coming soon!', 'info');
    closeUserMenu();
}

function showAllActivity() {
    showNotification('Activity history coming soon!', 'info');
}

// ===== LOGOUT =====

function logout() {
    console.log('👋 Logging out user');
    
    LinguaLeap.logoutUser();
    currentUser = null;
    
    showNotification('Goodbye! See you soon!', 'info');
    
    setTimeout(() => {
        showAuthentication();
        closeUserMenu();
    }, 1000);
}

// ===== MISSING FUNCTIONS (Fixed) =====

// Handle filter changes in dashboard
function handleFilterChange(e) {
    const filter = e.target.dataset.filter || 'all';
    console.log('🎛️ Filter changed to:', filter);
    
    // Remove active class from all tabs
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Add active class to clicked tab
    e.target.classList.add('active');
    
    // Apply filter logic here
    showNotification(`Showing ${filter} content`, 'info');
}

// Handle library tab changes
function handleLibraryTabChange(e) {
    const tab = e.target.dataset.tab || 'all';
    console.log('📚 Library tab changed to:', tab);
    
    // Remove active class from all tabs
    document.querySelectorAll('.library-tab').forEach(tabEl => {
        tabEl.classList.remove('active');
    });
    
    // Add active class to clicked tab
    e.target.classList.add('active');
    
    // Apply tab change logic here
    showNotification(`Showing ${tab} library`, 'info');
}

// ===== INITIALIZATION COMPLETE =====

console.log('🚀 LinguaLeap V5.0 Main App loaded successfully!');