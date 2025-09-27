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
    
    // Add floating elements
    if (window.addFloatingElements) {
        setTimeout(() => {
            window.addFloatingElements();
        }, 1000);
    }
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
            // Initialize enhanced dashboard with charts
            if (window.enhancedDashboardInit) {
                window.enhancedDashboardInit();
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
        case 'video':
            // Initialize video library
            if (window.initializeVideoLibrary) {
                window.initializeVideoLibrary();
            }
            break;
        case 'settings':
            // Initialize settings page
            initializeSettings();
            break;
        default:
            break;
    }
}

// Progress Loading Functions
async function loadBeginnerProgress() {
    if (!currentUser) return;
    
    try {
        showLoading('Loading chapters...');
        
        // Load syllabus from Firebase
        const syllabusData = await window.firebaseUtils.fetchData('syllabus', 'beginnerJourney');
        
        if (syllabusData && syllabusData.chapters) {
            displayChapters('beginnerPage', syllabusData.chapters, 'Beginner\'s Journey');
        } else {
            displayNoChapters('beginnerPage', 'Beginner\'s Journey');
        }
        
        hideLoading();
    } catch (error) {
        console.error('Error loading beginner chapters:', error);
        displayNoChapters('beginnerPage', 'Beginner\'s Journey');
        hideLoading();
    }
}

async function loadGrammarProgress() {
    if (!currentUser) return;
    
    try {
        showLoading('Loading chapters...');
        
        // Load syllabus from Firebase
        const syllabusData = await window.firebaseUtils.fetchData('syllabus', 'grammarDeepDive');
        
        if (syllabusData && syllabusData.chapters) {
            displayChapters('grammarPage', syllabusData.chapters, 'Grammar Deep Dive');
        } else {
            displayNoChapters('grammarPage', 'Grammar Deep Dive');
        }
        
        hideLoading();
    } catch (error) {
        console.error('Error loading grammar chapters:', error);
        displayNoChapters('grammarPage', 'Grammar Deep Dive');
        hideLoading();
    }
}

function displayChapters(pageId, chapters, courseName) {
    const page = document.getElementById(pageId);
    if (!page) return;
    
    // Find the container for lessons/topics
    const container = page.querySelector('.lessons-grid') || page.querySelector('.grammar-topics');
    if (!container) return;
    
    const chapterKeys = Object.keys(chapters);
    
    if (chapterKeys.length === 0) {
        displayNoChapters(pageId, courseName);
        return;
    }
    
    // Generate chapter cards
    const chaptersHTML = chapterKeys.map((chapterId, index) => {
        const chapter = chapters[chapterId];
        const isLocked = index > 0; // Only first chapter is unlocked initially
        
        return `
            <div class="lesson-card ${isLocked ? 'locked' : ''}">
                <div class="lesson-meta">
                    <span class="difficulty">${chapter.difficulty || 'Beginner'}</span>
                    <span class="duration">⏱️ ${chapter.estimatedTime || 30} min</span>
                </div>
                <h3>${chapter.title || chapterId}</h3>
                <p>${stripHtmlFromDescription(chapter.description) || 'No description available'}</p>
                ${chapter.lessons ? `<p style="font-size: 0.85rem; color: var(--muted-foreground);">📝 ${Object.keys(chapter.lessons).length} lessons</p>` : ''}
                <div class="lesson-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 0%"></div>
                    </div>
                    <span>${isLocked ? '🔒 Complete previous chapter to unlock' : '0% Complete'}</span>
                </div>
                <button class="lesson-btn" ${isLocked ? 'disabled' : ''} onclick="startChapter('${chapterId}', '${courseName}')">
                    ${isLocked ? '🔒 Locked' : '▶️ Start Chapter'}
                </button>
            </div>
        `;
    }).join('');
    
    container.innerHTML = chaptersHTML;
}

function displayNoChapters(pageId, courseName) {
    const page = document.getElementById(pageId);
    if (!page) return;
    
    const container = page.querySelector('.lessons-grid') || page.querySelector('.grammar-topics');
    if (!container) return;
    
    container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--muted-foreground);">
            <h3>📚 Coming Soon!</h3>
            <p>${courseName} chapters are being prepared. Check back soon for new content!</p>
        </div>
    `;
}

function stripHtmlFromDescription(description) {
    if (!description) return '';
    const doc = new DOMParser().parseFromString(description, 'text/html');
    return doc.body.textContent || "";
}

function startChapter(chapterId, courseName) {
    // For now, show a coming soon message
    // In future, this will navigate to the actual chapter content
    alert(`🚧 Chapter content for "${chapterId}" in ${courseName} is coming soon!\n\nThis will include:\n📖 Interactive lessons\n🎯 Practice exercises\n🏆 Progress tracking\n📊 Quizzes and assessments`);
}rror) {
        console.error('Error loading beginner progress:', error);
        hideLoading();
        displayNoLessons('beginnerPage', 'Beginner\'s Journey');
    }
}

async function loadGrammarProgress() {
    if (!currentUser) return;
    
    try {
        showLoading('Loading lessons...');
        
        // Load syllabus from Firebase (based on new Firestore rules)
        const syllabusData = await window.firebaseUtils.fetchData('syllabus', 'grammarDeepDive');
        const userData = await window.firebaseUtils.fetchData('userProgress', currentUser.uid);
        
        if (syllabusData && syllabusData.chapters) {
            displaySyllabus('grammarPage', syllabusData.chapters, userData?.grammarDeepDive || {});
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

// New function to display hierarchical syllabus structure
function displaySyllabus(pageId, chaptersData, userProgress) {
    const page = document.getElementById(pageId);
    const lessonsGrid = page.querySelector('.lessons-grid');
    
    if (!lessonsGrid) {
        console.error('Lessons grid not found in page:', pageId);
        return;
    }
    
    let html = '';
    
    if (chaptersData && Object.keys(chaptersData).length > 0) {
        Object.keys(chaptersData).forEach(chapterId => {
            const chapter = chaptersData[chapterId];
            const progress = userProgress[chapterId] || 'not_started';
            const isLocked = shouldChapterBeLocked(chapterId, userProgress);
            
            html += `
                <div class="lesson-card ${progress} ${isLocked ? 'locked' : ''}" data-chapter="${chapterId}">
                    <div class="lesson-header">
                        <h3>${chapter.title || chapterId}</h3>
                        <span class="lesson-status">${getStatusIcon(progress)}</span>
                    </div>
                    <p>${chapter.description || 'Chapter description will be added soon.'}</p>
                    <div class="lesson-meta">
                        <span class="difficulty">📊 ${chapter.difficulty || 'Beginner'}</span>
                        <span class="duration">⏱️ ${chapter.estimatedTime || '30'} min</span>
                        <span class="lessons-count">📚 ${Object.keys(chapter.lessons || {}).length} lessons</span>
                    </div>
                    <div class="lesson-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${getChapterProgress(chapterId, userProgress)}%"></div>
                        </div>
                        <span class="progress-text">${getChapterProgress(chapterId, userProgress)}%</span>
                    </div>
                    <button class="lesson-btn" 
                        onclick="startChapter('${chapterId}', '${pageId.replace('Page', '')}')"
                        ${isLocked ? 'disabled' : ''}>
                        ${isLocked ? '🔒 Locked' : (progress === 'completed' ? 'Review Chapter' : 'Start Chapter')}
                    </button>
                </div>
            `;
        });
    } else {
        html = `
            <div class="no-lessons">
                <h3>No chapters available yet</h3>
                <p>Chapters are being prepared. Please check back later!</p>
                <button class="lesson-btn" onclick="window.open('admin.html', '_blank')">
                    🛠️ Add Content (Admin)
                </button>
            </div>
        `;
    }
    
    lessonsGrid.innerHTML = html;
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

// Helper Functions for New Chapter System
function shouldChapterBeLocked(chapterId, userProgress) {
    // Simple locking logic - first chapter is always unlocked
    const chapterNumber = extractChapterNumber(chapterId);
    if (chapterNumber === 1) return false;
    
    // Check if previous chapter is completed
    const previousChapterNumber = chapterNumber - 1;
    const previousChapterId = findChapterByNumber(previousChapterNumber, userProgress);
    
    return !previousChapterId || userProgress[previousChapterId] !== 'completed';
}

function extractChapterNumber(chapterId) {
    // Extract number from chapterId like "part1-chapter1" or "1.1"
    const match = chapterId.match(/(\d+)/);
    return match ? parseInt(match[1]) : 1;
}

function findChapterByNumber(chapterNumber, userProgress) {
    // Find chapter ID by number (this is a simplified approach)
    const chapters = Object.keys(userProgress);
    return chapters.find(id => extractChapterNumber(id) === chapterNumber);
}

function getChapterProgress(chapterId, userProgress) {
    const progress = userProgress[chapterId];
    if (!progress) return 0;
    
    switch (progress) {
        case 'completed': return 100;
        case 'in_progress': return 50;
        case 'started': return 25;
        default: return 0;
    }
}

function getStatusIcon(progress) {
    switch (progress) {
        case 'completed': return '✅';
        case 'in_progress': return '📖';
        case 'started': return '🚀';
        default: return '🔲';
    }
}

// Video Library Loading Function
async function loadVideoLibrary() {
    if (!currentUser) return;
    
    try {
        showLoading('Loading video library...');
        
        // Load videos from Firebase (based on new Firestore rules)
        const videosData = await window.firebaseUtils.fetchData('videoLibrary', 'allVideos');
        
        if (videosData && videosData.videos) {
            displayVideoLibrary(videosData.videos);
        } else {
            displayNoVideos();
        }
        
        hideLoading();
    } catch (error) {
        console.error('Error loading video library:', error);
        hideLoading();
        displayNoVideos();
    }
}

function displayVideoLibrary(videosData) {
    const page = document.getElementById('videoPage');
    const videosGrid = page.querySelector('.videos-grid') || page.querySelector('.lessons-grid');
    
    if (!videosGrid) {
        console.error('Videos grid not found in video page');
        return;
    }
    
    let html = '';
    
    if (videosData && Object.keys(videosData).length > 0) {
        Object.keys(videosData).forEach(videoId => {
            const video = videosData[videoId];
            
            html += `
                <div class="video-card" data-video="${videoId}">
                    <div class="video-thumbnail">
                        ${video.thumbnail ? 
                            `<img src="${video.thumbnail}" alt="${video.title}" />` : 
                            '<div class="placeholder-thumbnail">🎥</div>'
                        }
                    </div>
                    <div class="video-info">
                        <h3>${video.title || videoId}</h3>
                        <p>${video.description || 'Video description will be added soon.'}</p>
                        <div class="video-meta">
                            <span class="category">📁 ${video.category || 'General'}</span>
                            <span class="duration">⏱️ ${video.duration || '5'} min</span>
                            <span class="level">📊 ${video.level || 'Beginner'}</span>
                        </div>
                        <button class="video-btn" onclick="playVideo('${videoId}')">
                            ▶️ Watch Video
                        </button>
                    </div>
                </div>
            `;
        });
    } else {
        html = `
            <div class="no-videos">
                <h3>No videos available yet</h3>
                <p>Videos are being prepared. Please check back later!</p>
                <button class="lesson-btn" onclick="window.open('admin.html', '_blank')">
                    🛠️ Add Content (Admin)
                </button>
            </div>
        `;
    }
    
    videosGrid.innerHTML = html;
}

function displayNoVideos() {
    const page = document.getElementById('videoPage');
    const videosGrid = page.querySelector('.videos-grid') || page.querySelector('.lessons-grid');
    
    if (videosGrid) {
        videosGrid.innerHTML = `
            <div class="no-videos">
                <h3>Video Library Unavailable</h3>
                <p>Unable to load videos. Please try again later!</p>
                <button class="lesson-btn" onclick="loadVideoLibrary()">
                    🔄 Retry
                </button>
            </div>
        `;
    }
}

function startChapter(chapterId, courseType) {
    console.log(`Starting chapter: ${chapterId} from course: ${courseType}`);
    // This will be implemented based on your chapter content structure
    alert(`Starting ${chapterId}! Chapter details will be implemented soon.`);
}

function playVideo(videoId) {
    console.log(`Playing video: ${videoId}`);
    // This will be implemented to play video content
    alert(`Playing ${videoId}! Video player will be implemented soon.`);
}

// Export for debugging
window.appDebug = {
    currentUser,
    currentPage,
    userStats,
    navigateToPage,
    loadUserData,
    elements,
    loadVideoLibrary,
    startChapter,
    playVideo
};

// Settings Functionality
let debugMode = false;
let debugLogs = [];

// API Key Management
function saveApiKey(provider) {
    const keyInput = document.getElementById(`${provider}Key`);
    const apiKey = keyInput.value.trim();
    
    if (!apiKey) {
        alert('Please enter a valid API key!');
        return;
    }
    
    // Save to localStorage (encrypted in production)
    localStorage.setItem(`${provider}_api_key`, apiKey);
    
    // Update status
    updateApiStatus(provider, 'saved');
    
    // Clear input
    keyInput.value = '';
    
    alert(`✅ ${provider.toUpperCase()} API key saved successfully!`);
}

async function testApiKey(provider) {
    const apiKey = localStorage.getItem(`${provider}_api_key`);
    
    if (!apiKey) {
        alert('Please save an API key first!');
        return;
    }
    
    updateApiStatus(provider, 'testing');
    
    try {
        let testResult = false;
        
        switch (provider) {
            case 'openrouter':
                testResult = await testOpenRouterAPI(apiKey);
                break;
            case 'gemini':
                testResult = await testGeminiAPI(apiKey);
                break;
            case 'claude':
                testResult = await testClaudeAPI(apiKey);
                break;
            case 'openai':
                testResult = await testOpenAIAPI(apiKey);
                break;
        }
        
        if (testResult) {
            updateApiStatus(provider, 'connected');
            alert(`✅ ${provider.toUpperCase()} API connection successful!`);
        } else {
            updateApiStatus(provider, 'error');
            alert(`❌ ${provider.toUpperCase()} API connection failed!`);
        }
    } catch (error) {
        console.error(`Error testing ${provider} API:`, error);
        updateApiStatus(provider, 'error');
        alert(`❌ Error testing ${provider.toUpperCase()} API: ${error.message}`);
    }
}

function updateApiStatus(provider, status) {
    const statusElement = document.getElementById(`${provider}Status`);
    if (!statusElement) return;
    
    switch (status) {
        case 'connected':
            statusElement.textContent = '✅ Connected';
            statusElement.className = 'api-status connected';
            break;
        case 'testing':
            statusElement.textContent = '🔄 Testing...';
            statusElement.className = 'api-status testing';
            break;
        case 'saved':
            statusElement.textContent = '💾 Saved';
            statusElement.className = 'api-status saved';
            break;
        case 'error':
            statusElement.textContent = '❌ Error';
            statusElement.className = 'api-status error';
            break;
        default:
            statusElement.textContent = '❌ Not Configured';
            statusElement.className = 'api-status';
    }
}

// API Testing Functions
async function testOpenRouterAPI(apiKey) {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'openai/gpt-3.5-turbo',
            messages: [{ role: 'user', content: 'Test' }],
            max_tokens: 5
        })
    });
    
    return response.ok;
}

async function testGeminiAPI(apiKey) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents: [{ parts: [{ text: 'Test' }] }]
        })
    });
    
    return response.ok;
}

async function testClaudeAPI(apiKey) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 5,
            messages: [{ role: 'user', content: 'Test' }]
        })
    });
    
    return response.ok;
}

async function testOpenAIAPI(apiKey) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: 'Test' }],
            max_tokens: 5
        })
    });
    
    return response.ok;
}

// Theme Management
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    
    // Set radio button
    const themeRadio = document.querySelector(`input[name="theme"][value="${savedTheme}"]`);
    if (themeRadio) {
        themeRadio.checked = true;
    }
    
    // Add theme change listeners
    document.querySelectorAll('input[name="theme"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.checked) {
                setTheme(e.target.value);
            }
        });
    });
}

function setTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Update theme toggle button
    if (elements.themeToggle) {
        elements.themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
}

// Debug Functionality
function toggleDebugMode() {
    debugMode = document.getElementById('debugMode').checked;
    const debugLogs = document.getElementById('debugLogs');
    
    if (debugMode) {
        debugLogs.classList.remove('hidden');
        addDebugLog('info', 'Debug mode enabled');
    } else {
        debugLogs.classList.add('hidden');
    }
    
    localStorage.setItem('debugMode', debugMode);
}

function addDebugLog(type, message, data = null) {
    if (!debugMode) return;
    
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = {
        timestamp,
        type,
        message,
        data
    };
    
    debugLogs.push(logEntry);
    
    // Keep only last 50 logs
    if (debugLogs.length > 50) {
        debugLogs.shift();
    }
    
    updateDebugDisplay();
}

function updateDebugDisplay() {
    const debugLogsList = document.getElementById('debugLogsList');
    if (!debugLogsList || !debugMode) return;
    
    debugLogsList.innerHTML = debugLogs.map(log => `
        <div class="debug-log-entry">
            <div class="timestamp">[${log.timestamp}]</div>
            <div class="${log.type}">${log.message}</div>
            ${log.data ? `<pre>${JSON.stringify(log.data, null, 2)}</pre>` : ''}
        </div>
    `).join('');
    
    // Auto scroll to bottom
    debugLogsList.scrollTop = debugLogsList.scrollHeight;
}

function clearDebugLogs() {
    debugLogs = [];
    updateDebugDisplay();
    document.getElementById('debugLogsList').innerHTML = '<p>Debug logs cleared.</p>';
}

function downloadDebugLogs() {
    const dataStr = JSON.stringify(debugLogs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `lingualeap-debug-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
}

// Initialize settings on page load
function initializeSettings() {
    // Load API statuses
    ['openrouter', 'gemini', 'claude', 'openai'].forEach(provider => {
        const apiKey = localStorage.getItem(`${provider}_api_key`);
        if (apiKey) {
            updateApiStatus(provider, 'saved');
        }
    });
    
    // Load debug mode
    const savedDebugMode = localStorage.getItem('debugMode') === 'true';
    document.getElementById('debugMode').checked = savedDebugMode;
    if (savedDebugMode) {
        toggleDebugMode();
    }
}

// Enhanced Theme Toggle
if (elements.themeToggle) {
    elements.themeToggle.addEventListener('click', () => {
        const currentTheme = document.body.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        
        // Update radio button if on settings page
        const themeRadio = document.querySelector(`input[name="theme"][value="${newTheme}"]`);
        if (themeRadio) {
            themeRadio.checked = true;
        }
    });
}

// Export settings functions to global scope
window.saveApiKey = saveApiKey;
window.testApiKey = testApiKey;
window.toggleDebugMode = toggleDebugMode;
window.clearDebugLogs = clearDebugLogs;
window.downloadDebugLogs = downloadDebugLogs;
window.addDebugLog = addDebugLog;

console.log('✅ LinguaLeap App Initialized!');
console.log('🐛 Debug tools available at window.appDebug');