// ===== LINGUALEAP V5.0 - LOCAL STORAGE & SIMULATION =====

console.log('🔥 Loading LinguaLeap V5.0 Local Storage System...');

// Local storage keys
const STORAGE_KEYS = {
    USER: 'lingualeap_user',
    PROGRESS: 'lingualeap_progress',
    COURSES: 'lingualeap_courses',
    SETTINGS: 'lingualeap_settings'
};

// ===== AUTHENTICATION FUNCTIONS =====

// User login with local storage
async function authenticateUser(email, password) {
    console.log('🔐 Authenticating user:', email);
    
    return new Promise((resolve) => {
        setTimeout(() => {
            // Get users from local storage
            const users = getStoredUsers();
            const user = users.find(u => u.email === email && u.password === password);
            
            if (user) {
                // Remove password from returned user object
                const { password: _, ...userWithoutPassword } = user;
                userWithoutPassword.lastLogin = new Date().toISOString();
                
                // Update user's last login
                const updatedUsers = users.map(u => 
                    u.email === email ? { ...u, lastLogin: userWithoutPassword.lastLogin } : u
                );
                localStorage.setItem('lingualeap_users', JSON.stringify(updatedUsers));
                
                // Store current user
                localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userWithoutPassword));
                
                console.log('✅ Login successful');
                resolve({ success: true, user: userWithoutPassword });
            } else {
                console.log('❌ Invalid credentials');
                resolve({ success: false, error: 'Invalid email or password' });
            }
        }, 1000);
    });
}

// User signup with local storage
async function createUser(userData) {
    console.log('📝 Creating new user:', userData.email);
    
    return new Promise((resolve) => {
        setTimeout(() => {
            const users = getStoredUsers();
            
            // Check if user already exists
            if (users.some(u => u.email === userData.email)) {
                console.log('❌ User already exists');
                resolve({ success: false, error: 'An account with this email already exists' });
                return;
            }
            
            // Create new user
            const newUser = {
                id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                password: userData.password, // In real app, this would be hashed
                avatar: `https://ui-avatars.com/api/?name=${userData.firstName}+${userData.lastName}&background=4CAF50&color=fff`,
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                preferences: {
                    language: 'en',
                    notifications: true,
                    theme: 'light'
                }
            };
            
            // Add to users array
            users.push(newUser);
            localStorage.setItem('lingualeap_users', JSON.stringify(users));
            
            // Store current user (without password)
            const { password: _, ...userWithoutPassword } = newUser;
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userWithoutPassword));
            
            // Initialize user progress
            initializeUserProgress(newUser.id);
            
            console.log('✅ Account created successfully');
            resolve({ success: true, user: userWithoutPassword });
        }, 1500);
    });
}

// Get stored users
function getStoredUsers() {
    const stored = localStorage.getItem('lingualeap_users');
    return stored ? JSON.parse(stored) : [];
}

// Initialize user progress
function initializeUserProgress(userId) {
    const defaultProgress = {
        userId: userId,
        currentCourse: 'spanish-fundamentals',
        totalXP: 0,
        streak: 0,
        badges: [],
        completedLessons: [],
        lastActivityDate: new Date().toISOString(),
        stats: {
            lessonsCompleted: 0,
            wordsLearned: 0,
            timeSpent: 0,
            accuracy: 0
        }
    };
    
    localStorage.setItem(STORAGE_KEYS.PROGRESS + '_' + userId, JSON.stringify(defaultProgress));
}

// ===== USER MANAGEMENT =====

// Get current user
function getCurrentUser() {
    const stored = localStorage.getItem(STORAGE_KEYS.USER);
    return stored ? JSON.parse(stored) : null;
}

// Update user data
function updateUserData(userData) {
    const currentUser = getCurrentUser();
    if (currentUser) {
        const updatedUser = { ...currentUser, ...userData };
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
        
        // Also update in users array
        const users = getStoredUsers();
        const updatedUsers = users.map(u => 
            u.id === currentUser.id ? { ...u, ...userData } : u
        );
        localStorage.setItem('lingualeap_users', JSON.stringify(updatedUsers));
        
        return updatedUser;
    }
    return null;
}

// Logout user
function logoutUser() {
    localStorage.removeItem(STORAGE_KEYS.USER);
    console.log('👋 User logged out');
}

// ===== PROGRESS MANAGEMENT =====

// Get user progress
function getUserProgress(userId = null) {
    const currentUser = getCurrentUser();
    const targetUserId = userId || (currentUser ? currentUser.id : null);
    
    if (!targetUserId) return null;
    
    const stored = localStorage.getItem(STORAGE_KEYS.PROGRESS + '_' + targetUserId);
    return stored ? JSON.parse(stored) : null;
}

// Update user progress
function updateUserProgress(progressData) {
    const currentUser = getCurrentUser();
    if (!currentUser) return false;
    
    const currentProgress = getUserProgress(currentUser.id) || {};
    const updatedProgress = { ...currentProgress, ...progressData };
    
    localStorage.setItem(STORAGE_KEYS.PROGRESS + '_' + currentUser.id, JSON.stringify(updatedProgress));
    console.log('💾 Progress updated');
    return true;
}

// Add XP
function addXP(amount) {
    const progress = getUserProgress();
    if (progress) {
        progress.totalXP = (progress.totalXP || 0) + amount;
        updateUserProgress(progress);
        console.log(`🌟 Added ${amount} XP! Total: ${progress.totalXP}`);
        return progress.totalXP;
    }
    return 0;
}

// Complete lesson
function completeLesson(lessonId, xpEarned = 50) {
    const progress = getUserProgress();
    if (progress) {
        if (!progress.completedLessons.includes(lessonId)) {
            progress.completedLessons.push(lessonId);
            progress.stats.lessonsCompleted = (progress.stats.lessonsCompleted || 0) + 1;
            addXP(xpEarned);
            updateUserProgress(progress);
            console.log(`✅ Lesson completed: ${lessonId}`);
        }
    }
}

// Update streak
function updateStreak() {
    const progress = getUserProgress();
    if (progress) {
        const today = new Date().toDateString();
        const lastActivity = new Date(progress.lastActivityDate).toDateString();
        
        if (lastActivity !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (lastActivity === yesterday.toDateString()) {
                progress.streak = (progress.streak || 0) + 1;
            } else {
                progress.streak = 1;
            }
            
            progress.lastActivityDate = new Date().toISOString();
            updateUserProgress(progress);
            console.log(`🔥 Streak updated: ${progress.streak} days`);
        }
    }
}

// ===== COURSE DATA =====

// Get default courses
function getDefaultCourses() {
    return [
        {
            id: 'spanish-fundamentals',
            title: 'Spanish Fundamentals',
            description: 'Master the basics of Spanish with interactive lessons',
            language: 'Spanish',
            level: 'Beginner',
            image: 'https://via.placeholder.com/300x200?text=Spanish+Course',
            totalLessons: 20,
            estimatedTime: '4 weeks',
            lessons: [
                { id: 'lesson-1', title: 'Basic Greetings', duration: 15, xp: 50 },
                { id: 'lesson-2', title: 'Numbers 1-20', duration: 20, xp: 50 },
                { id: 'lesson-3', title: 'Colors and Objects', duration: 18, xp: 50 },
                { id: 'lesson-4', title: 'Family Members', duration: 22, xp: 60 },
                { id: 'lesson-5', title: 'Days and Months', duration: 16, xp: 50 }
            ]
        },
        {
            id: 'french-basics',
            title: 'French Basics',
            description: 'Begin your French journey with essential vocabulary and phrases',
            language: 'French',
            level: 'Beginner',
            image: 'https://via.placeholder.com/300x200?text=French+Course',
            totalLessons: 18,
            estimatedTime: '3 weeks',
            lessons: [
                { id: 'fr-lesson-1', title: 'Bonjour! Basic Greetings', duration: 15, xp: 50 },
                { id: 'fr-lesson-2', title: 'French Numbers', duration: 18, xp: 50 }
            ]
        },
        {
            id: 'german-starter',
            title: 'German Starter',
            description: 'Start learning German with pronunciation and basic grammar',
            language: 'German',
            level: 'Beginner',
            image: 'https://via.placeholder.com/300x200?text=German+Course',
            totalLessons: 16,
            estimatedTime: '3 weeks',
            lessons: [
                { id: 'de-lesson-1', title: 'Guten Tag! Greetings', duration: 20, xp: 50 }
            ]
        }
    ];
}

// Get courses
function getCourses() {
    const stored = localStorage.getItem(STORAGE_KEYS.COURSES);
    if (stored) {
        return JSON.parse(stored);
    } else {
        const defaultCourses = getDefaultCourses();
        localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(defaultCourses));
        return defaultCourses;
    }
}

// Get course by ID
function getCourseById(courseId) {
    const courses = getCourses();
    return courses.find(course => course.id === courseId);
}

// ===== ADMIN FUNCTIONS =====

// Admin authentication
function authenticateAdmin(username, password) {
    const adminCredentials = {
        username: 'admin',
        password: 'lingualeap2025'
    };
    
    return username === adminCredentials.username && password === adminCredentials.password;
}

// Get all users (admin only)
function getAllUsers() {
    return getStoredUsers().map(user => {
        const { password: _, ...userWithoutPassword } = user;
        const progress = getUserProgress(user.id);
        return {
            ...userWithoutPassword,
            progress: progress
        };
    });
}

// ===== SETTINGS =====

// Get user settings
function getUserSettings() {
    const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return stored ? JSON.parse(stored) : {
        theme: 'light',
        language: 'en',
        notifications: true,
        sound: true,
        autoplay: false
    };
}

// Update settings
function updateSettings(newSettings) {
    const currentSettings = getUserSettings();
    const updatedSettings = { ...currentSettings, ...newSettings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updatedSettings));
    return updatedSettings;
}

// ===== INITIALIZATION =====

// Initialize default data if needed
function initializeDefaultData() {
    // Check if admin user exists, if not create one
    const users = getStoredUsers();
    if (!users.some(u => u.email === 'admin@lingualeap.com')) {
        users.push({
            id: 'admin_user',
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@lingualeap.com',
            password: 'admin123',
            avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=2196F3&color=fff',
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            isAdmin: true,
            preferences: {
                language: 'en',
                notifications: true,
                theme: 'dark'
            }
        });
        localStorage.setItem('lingualeap_users', JSON.stringify(users));
    }
    
    // Initialize courses
    getCourses();
    
    console.log('🚀 Default data initialized');
}

// ===== DEMO DATA CREATION =====

// Create sample users for demo
function createSampleData() {
    const sampleUsers = [
        {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            password: 'password123'
        },
        {
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane@example.com',
            password: 'password123'
        }
    ];
    
    // Only create if no users exist (except admin)
    const users = getStoredUsers();
    if (users.length <= 1) {
        sampleUsers.forEach(async (userData) => {
            await createUser(userData);
        });
        console.log('👥 Sample users created');
    }
}

// Initialize everything
initializeDefaultData();

console.log('🔥 LinguaLeap V5.0 Local Storage System initialized!');

// Export functions for global use
window.LinguaLeap = {
    // Auth
    authenticateUser,
    createUser,
    getCurrentUser,
    updateUserData,
    logoutUser,
    
    // Progress
    getUserProgress,
    updateUserProgress,
    addXP,
    completeLesson,
    updateStreak,
    
    // Courses
    getCourses,
    getCourseById,
    
    // Admin
    authenticateAdmin,
    getAllUsers,
    
    // Settings
    getUserSettings,
    updateSettings,
    
    // Utils
    createSampleData
};