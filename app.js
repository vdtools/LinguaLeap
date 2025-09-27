// ===== LINGUALEAP MAIN APP V4.0 =====

// Global variables
let currentUser = null;
let db = null;
let auth = null;

// Initialize Firebase and app
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 LinguaLeap V4.0 Starting...');
    
    // Initialize Firebase
    initializeFirebase();
    
    // Set up authentication listener
    setupAuthListener();
    
    // Set up event listeners
    setupEventListeners();
});

// Initialize Firebase
function initializeFirebase() {
    try {
        // Firebase should be initialized from firebase-config.js
        if (typeof firebase !== 'undefined') {
            auth = firebase.auth();
            db = firebase.firestore();
            console.log('✅ Firebase initialized successfully');
        } else {
            console.error('❌ Firebase not loaded');
            showError('Firebase configuration error');
        }
    } catch (error) {
        console.error('❌ Firebase initialization error:', error);
        showError('Failed to initialize Firebase');
    }
}

// Set up authentication state listener
function setupAuthListener() {
    if (!auth) {
        console.error('❌ Auth not initialized');
        return;
    }
    
    // Critical: Authentication guard
    auth.onAuthStateChanged((user) => {
        console.log('🔐 Auth state changed:', user ? 'Signed in' : 'Signed out');
        
        if (user) {
            // User is signed in
            currentUser = user;
            showMainApp();
            loadUserData();
        } else {
            // User is signed out - show auth
            currentUser = null;
            showAuthContainer();
        }
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
}

// Show auth container
function showAuthContainer() {
    const loadingScreen = document.getElementById('loadingScreen');
    const authContainer = document.getElementById('authContainer');
    const mainApp = document.getElementById('mainApp');
    
    if (loadingScreen) loadingScreen.style.display = 'none';
    if (authContainer) authContainer.style.display = 'flex';
    if (mainApp) mainApp.style.display = 'none';
    
    console.log('🔒 Showing authentication screen');
}

// Show main app
function showMainApp() {
    const loadingScreen = document.getElementById('loadingScreen');
    const authContainer = document.getElementById('authContainer');
    const mainApp = document.getElementById('mainApp');
    
    if (loadingScreen) loadingScreen.style.display = 'none';
    if (authContainer) authContainer.style.display = 'none';
    if (mainApp) mainApp.style.display = 'flex';
    
    console.log('✅ Showing main application');
}

// Set up event listeners
function setupEventListeners() {
    // Google Sign In
    const googleSignInBtn = document.getElementById('googleSignIn');
    if (googleSignInBtn) {
        googleSignInBtn.addEventListener('click', handleGoogleSignIn);
    }
    
    // Sign Out
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
        btn.addEventListener('click', handlePracticeClick);
    });
    
    // Course buttons
    const courseButtons = document.querySelectorAll('.course-btn');
    courseButtons.forEach(btn => {
        btn.addEventListener('click', handleCourseClick);
    });
    
    // Continue button
    const continueBtn = document.querySelector('.continue-btn');
    if (continueBtn) {
        continueBtn.addEventListener('click', handleContinueLearning);
    }
}

// Handle Google Sign In
async function handleGoogleSignIn() {
    try {
        console.log('🔐 Starting Google Sign In...');
        
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('email');
        provider.addScope('profile');
        
        const result = await auth.signInWithPopup(provider);
        const user = result.user;
        
        console.log('✅ Google Sign In successful:', user.email);
        
        // Save user data to Firestore
        await saveUserData(user);
        
    } catch (error) {
        console.error('❌ Google Sign In error:', error);
        showError('Sign in failed. Please try again.');
    }
}

// Handle Sign Out
async function handleSignOut() {
    try {
        console.log('🔐 Signing out...');
        await auth.signOut();
        console.log('✅ Sign out successful');
    } catch (error) {
        console.error('❌ Sign out error:', error);
        showError('Sign out failed. Please try again.');
    }
}

// Save user data to Firestore
async function saveUserData(user) {
    try {
        const userRef = db.collection('users').doc(user.uid);
        
        const userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Check if user exists
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) {
            // New user - set creation timestamp
            userData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            userData.level = 'Beginner';
            userData.streak = 0;
            userData.totalTime = 0;
            userData.achievements = [];
        }
        
        await userRef.set(userData, { merge: true });
        console.log('✅ User data saved successfully');
        
    } catch (error) {
        console.error('❌ Error saving user data:', error);
    }
}

// Load user data and update UI
async function loadUserData() {
    if (!currentUser) return;
    
    try {
        // Update user avatar and name
        const userAvatar = document.getElementById('userAvatar');
        const userName = document.getElementById('userName');
        const userLevel = document.getElementById('userLevel');
        
        if (userAvatar && currentUser.photoURL) {
            userAvatar.src = currentUser.photoURL;
        }
        
        if (userName && currentUser.displayName) {
            userName.textContent = currentUser.displayName.split(' ')[0]; // First name only
        }
        
        // Load user progress from Firestore
        const userRef = db.collection('users').doc(currentUser.uid);
        const userDoc = await userRef.get();
        
        if (userDoc.exists) {
            const userData = userDoc.data();
            
            if (userLevel && userData.level) {
                userLevel.textContent = userData.level;
            }
            
            // Update dashboard stats if available
            updateDashboardStats(userData);
        }
        
        console.log('✅ User data loaded successfully');
        
    } catch (error) {
        console.error('❌ Error loading user data:', error);
    }
}

// Update dashboard statistics
function updateDashboardStats(userData) {
    try {
        // Update streak
        const streakElement = document.querySelector('.stat-card h3');
        if (streakElement && userData.streak !== undefined) {
            streakElement.textContent = userData.streak || 0;
        }
        
        // Update total time
        const timeElements = document.querySelectorAll('.stat-card h3');
        if (timeElements[1] && userData.totalTime !== undefined) {
            const hours = Math.floor(userData.totalTime / 60);
            const minutes = userData.totalTime % 60;
            timeElements[1].textContent = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
        }
        
        // Update achievements count
        if (timeElements[2] && userData.achievements) {
            timeElements[2].textContent = userData.achievements.length || 0;
        }
        
    } catch (error) {
        console.error('❌ Error updating dashboard stats:', error);
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
    
    console.log(`📍 Navigated to: ${targetSection}`);
}

// Handle practice button clicks
function handlePracticeClick(e) {
    const practiceType = e.currentTarget.textContent.trim();
    console.log(`🎯 Starting practice: ${practiceType}`);
    
    // Show practice modal or navigate to practice
    showNotification(`Starting ${practiceType}...`, 'info');
    
    // Here you can add specific practice functionality
    // For now, just show a notification
}

// Handle course button clicks
function handleCourseClick(e) {
    const courseCard = e.currentTarget.closest('.course-card');
    const courseName = courseCard.querySelector('h3').textContent;
    
    console.log(`📚 Starting course: ${courseName}`);
    
    // Show course modal or navigate to course
    showNotification(`Starting ${courseName} course...`, 'info');
    
    // Here you can add specific course functionality
}

// Handle continue learning
function handleContinueLearning() {
    console.log('📖 Continuing learning...');
    
    // Navigate to current lesson
    showNotification('Continuing your lesson...', 'info');
    
    // Here you can add lesson continuation functionality
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 500;
        animation: slideInRight 0.3s ease-out;
    `;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Show error message
function showError(message) {
    showNotification(message, 'error');
}

// Show success message
function showSuccess(message) {
    showNotification(message, 'success');
}

// Add CSS animations for notifications
if (!document.getElementById('notificationStyles')) {
    const style = document.createElement('style');
    style.id = 'notificationStyles';
    style.textContent = `
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
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Update progress bars with animation
function updateProgressBar(element, percentage) {
    if (!element) return;
    
    const fill = element.querySelector('.progress-fill');
    if (fill) {
        fill.style.width = '0%';
        setTimeout(() => {
            fill.style.width = percentage + '%';
        }, 100);
    }
}

// Initialize progress bars
function initializeProgressBars() {
    const progressBars = document.querySelectorAll('.progress-bar');
    progressBars.forEach(bar => {
        const fill = bar.querySelector('.progress-fill');
        if (fill) {
            const targetWidth = fill.style.width;
            fill.style.width = '0%';
            setTimeout(() => {
                fill.style.width = targetWidth;
            }, 500);
        }
    });
}

// Add some lifecycle methods
window.addEventListener('load', () => {
    console.log('🎉 LinguaLeap V4.0 fully loaded!');
    
    // Initialize progress bars with animation
    setTimeout(initializeProgressBars, 1000);
});

// Handle page visibility change
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && currentUser) {
        console.log('👀 Page visible - refreshing user data');
        loadUserData();
    }
});

// Handle online/offline status
window.addEventListener('online', () => {
    showNotification('Connection restored', 'success');
});

window.addEventListener('offline', () => {
    showNotification('You are offline', 'error');
});

// Export functions for debugging (development only)
if (typeof window !== 'undefined') {
    window.LinguaLeap = {
        currentUser,
        showNotification,
        showSuccess,
        showError,
        loadUserData
    };
}

console.log('🚀 LinguaLeap App V4.0 initialized!');
