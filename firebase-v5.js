// ===== LINGUALEAP V5.0 - FIREBASE & SERVER INTEGRATION =====

// Firebase configuration - REPLACE WITH YOUR ACTUAL CONFIG
const firebaseConfig = {
    apiKey: "your-api-key-here",
    authDomain: "lingualeap-v5.firebaseapp.com",
    projectId: "lingualeap-v5",
    storageBucket: "lingualeap-v5.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:your-app-id"
};

// Initialize Firebase
try {
    if (typeof firebase !== 'undefined') {
        firebase.initializeApp(firebaseConfig);
        console.log('🔥 Firebase initialized successfully');
    }
} catch (error) {
    console.error('❌ Firebase initialization failed:', error);
}

// ===== AUTHENTICATION FUNCTIONS =====

// Simulate user login (replace with actual authentication)
async function simulateLogin(email, password) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // For demo purposes - replace with real authentication
            if (email && password.length >= 6) {
                const user = {
                    id: 'user_' + Date.now(),
                    email: email,
                    firstName: email.split('@')[0],
                    lastName: 'User',
                    avatar: 'https://via.placeholder.com/100',
                    createdAt: new Date().toISOString(),
                    lastLogin: new Date().toISOString()
                };
                resolve({ success: true, user });
            } else {
                resolve({ success: false, error: 'Invalid credentials' });
            }
        }, 1000);
    });
}

// Simulate user signup (replace with actual user creation)
async function simulateSignup(userData) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // For demo purposes - replace with real user creation
            const user = {
                id: 'user_' + Date.now(),
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                avatar: 'https://via.placeholder.com/100',
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString()
            };
            resolve({ success: true, user });
        }, 1500);
    });
}

// ===== USER DATA MANAGEMENT =====

// Save user login to server
async function saveUserLoginToServer(user) {
    try {
        console.log('💾 Saving user login to server...');
        
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            const db = firebase.firestore();
            
            await db.collection('userSessions').add({
                userId: user.id,
                email: user.email,
                loginTime: firebase.firestore.FieldValue.serverTimestamp(),
                userAgent: navigator.userAgent,
                ipAddress: 'auto-detect', // In production, get real IP
                device: getDeviceInfo()
            });
            
            // Update user's last login
            await db.collection('users').doc(user.id).set({
                lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                loginCount: firebase.firestore.FieldValue.increment(1)
            }, { merge: true });
        }
        
        console.log('✅ User login saved to server');
        return { success: true };
        
    } catch (error) {
        console.error('❌ Error saving user login:', error);
        return { success: false, error: error.message };
    }
}

// Save new user to server
async function saveNewUserToServer(user) {
    try {
        console.log('💾 Creating new user on server...');
        
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            const db = firebase.firestore();
            
            // Create user document
            await db.collection('users').doc(user.id).set({
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                avatar: user.avatar,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                loginCount: 1,
                
                // Default user progress
                progress: {
                    level: 'Beginner',
                    levelNumber: 1,
                    totalXP: 0,
                    streak: 0,
                    totalMinutes: 0,
                    completedLessons: 0,
                    achievements: []
                },
                
                // User preferences
                preferences: {
                    language: 'en',
                    notifications: true,
                    emailUpdates: true,
                    theme: 'auto'
                }
            });
            
            // Create initial progress record
            await db.collection('userProgress').doc(user.id).set({
                userId: user.id,
                courses: {},
                dailyGoals: {
                    minutesGoal: 30,
                    lessonsGoal: 1,
                    xpGoal: 50
                },
                statistics: {
                    totalSessions: 0,
                    averageSessionTime: 0,
                    longestStreak: 0,
                    favoriteTimeOfDay: null
                },
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        
        console.log('✅ New user created on server');
        return { success: true };
        
    } catch (error) {
        console.error('❌ Error creating user:', error);
        return { success: false, error: error.message };
    }
}

// Save user logout to server
async function saveUserLogoutToServer(userId) {
    try {
        console.log('💾 Saving user logout to server...');
        
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            const db = firebase.firestore();
            
            await db.collection('userSessions').add({
                userId: userId,
                logoutTime: firebase.firestore.FieldValue.serverTimestamp(),
                sessionDuration: null // Calculate based on login time
            });
        }
        
        console.log('✅ User logout saved to server');
        return { success: true };
        
    } catch (error) {
        console.error('❌ Error saving user logout:', error);
        return { success: false, error: error.message };
    }
}

// Load user progress from server
async function loadUserProgressFromServer(userId) {
    try {
        console.log('📊 Loading user progress from server...');
        
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            const db = firebase.firestore();
            
            // Load user document
            const userDoc = await db.collection('users').doc(userId).get();
            const progressDoc = await db.collection('userProgress').doc(userId).get();
            
            if (userDoc.exists && progressDoc.exists) {
                const userData = userDoc.data();
                const progressData = progressDoc.data();
                
                const combinedProgress = {
                    ...userData.progress,
                    ...progressData,
                    todayMinutes: await getTodayMinutes(userId),
                    weeklyActivity: await getWeeklyActivity(userId)
                };
                
                console.log('✅ User progress loaded from server');
                return { success: true, data: combinedProgress };
            }
        }
        
        // Return default progress if no data found
        return { success: true, data: getDefaultUserProgress() };
        
    } catch (error) {
        console.error('❌ Error loading user progress:', error);
        return { success: false, error: error.message };
    }
}

// ===== COURSE DATA MANAGEMENT =====

// Load courses from server
async function loadCoursesFromServer() {
    try {
        console.log('📚 Loading courses from server...');
        
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            const db = firebase.firestore();
            
            const coursesSnapshot = await db.collection('courses')
                .where('active', '==', true)
                .orderBy('order', 'asc')
                .get();
            
            const courses = [];
            coursesSnapshot.forEach(doc => {
                courses.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            console.log(`✅ Loaded ${courses.length} courses from server`);
            return { success: true, courses };
        }
        
        // Return default courses if Firebase not available
        return { success: true, courses: getDefaultCourses() };
        
    } catch (error) {
        console.error('❌ Error loading courses:', error);
        return { success: false, error: error.message };
    }
}

// Save course progress
async function saveCourseProgress(userId, courseId, progressData) {
    try {
        console.log('💾 Saving course progress...');
        
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            const db = firebase.firestore();
            
            await db.collection('userProgress').doc(userId).update({
                [`courses.${courseId}`]: {
                    ...progressData,
                    lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
                },
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        
        console.log('✅ Course progress saved');
        return { success: true };
        
    } catch (error) {
        console.error('❌ Error saving course progress:', error);
        return { success: false, error: error.message };
    }
}

// ===== PRACTICE & ACTIVITY TRACKING =====

// Save practice session
async function savePracticeSession(practiceType, duration = 0, score = 0) {
    try {
        if (!currentUser) return;
        
        console.log('🎯 Saving practice session...');
        
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            const db = firebase.firestore();
            
            await db.collection('practiceSessions').add({
                userId: currentUser.id,
                type: practiceType,
                duration: duration,
                score: score,
                xpEarned: calculateXP(duration, score),
                completedAt: firebase.firestore.FieldValue.serverTimestamp(),
                date: new Date().toISOString().split('T')[0] // YYYY-MM-DD format
            });
            
            // Update user's total XP and time
            await db.collection('users').doc(currentUser.id).update({
                'progress.totalXP': firebase.firestore.FieldValue.increment(calculateXP(duration, score)),
                'progress.totalMinutes': firebase.firestore.FieldValue.increment(duration)
            });
        }
        
        console.log('✅ Practice session saved');
        return { success: true };
        
    } catch (error) {
        console.error('❌ Error saving practice session:', error);
        return { success: false, error: error.message };
    }
}

// Save quick action
async function saveQuickAction(actionType) {
    try {
        if (!currentUser) return;
        
        console.log('⚡ Saving quick action...');
        
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            const db = firebase.firestore();
            
            await db.collection('userActions').add({
                userId: currentUser.id,
                action: actionType,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                source: 'quick-action'
            });
        }
        
        console.log('✅ Quick action saved');
        return { success: true };
        
    } catch (error) {
        console.error('❌ Error saving quick action:', error);
        return { success: false, error: error.message };
    }
}

// Update learning progress
async function updateLearningProgress() {
    try {
        if (!currentUser) return;
        
        console.log('📊 Updating learning progress...');
        
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            const db = firebase.firestore();
            
            await db.collection('users').doc(currentUser.id).update({
                'progress.completedLessons': firebase.firestore.FieldValue.increment(1),
                'progress.totalXP': firebase.firestore.FieldValue.increment(25),
                lastActivity: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        
        console.log('✅ Learning progress updated');
        return { success: true };
        
    } catch (error) {
        console.error('❌ Error updating learning progress:', error);
        return { success: false, error: error.message };
    }
}

// ===== LIBRARY CONTENT FUNCTIONS =====

// Load videos from server
async function loadVideos() {
    try {
        console.log('📹 Loading videos...');
        
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            const db = firebase.firestore();
            
            const videosSnapshot = await db.collection('libraryContent')
                .where('type', '==', 'video')
                .where('published', '==', true)
                .orderBy('publishedAt', 'desc')
                .limit(20)
                .get();
            
            const videos = [];
            videosSnapshot.forEach(doc => {
                videos.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            renderLibraryContent('videos', videos);
        }
        
        console.log('✅ Videos loaded');
        
    } catch (error) {
        console.error('❌ Error loading videos:', error);
        renderLibraryContent('videos', getDefaultVideos());
    }
}

// Load articles from server
async function loadArticles() {
    try {
        console.log('📰 Loading articles...');
        
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            const db = firebase.firestore();
            
            const articlesSnapshot = await db.collection('libraryContent')
                .where('type', '==', 'article')
                .where('published', '==', true)
                .orderBy('publishedAt', 'desc')
                .limit(20)
                .get();
            
            const articles = [];
            articlesSnapshot.forEach(doc => {
                articles.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            renderLibraryContent('articles', articles);
        }
        
        console.log('✅ Articles loaded');
        
    } catch (error) {
        console.error('❌ Error loading articles:', error);
        renderLibraryContent('articles', getDefaultArticles());
    }
}

// Load podcasts from server
async function loadPodcasts() {
    try {
        console.log('🎧 Loading podcasts...');
        
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            const db = firebase.firestore();
            
            const podcastsSnapshot = await db.collection('libraryContent')
                .where('type', '==', 'podcast')
                .where('published', '==', true)
                .orderBy('publishedAt', 'desc')
                .limit(20)
                .get();
            
            const podcasts = [];
            podcastsSnapshot.forEach(doc => {
                podcasts.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            renderLibraryContent('podcasts', podcasts);
        }
        
        console.log('✅ Podcasts loaded');
        
    } catch (error) {
        console.error('❌ Error loading podcasts:', error);
        renderLibraryContent('podcasts', getDefaultPodcasts());
    }
}

// Load books from server
async function loadBooks() {
    try {
        console.log('📚 Loading books...');
        
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            const db = firebase.firestore();
            
            const booksSnapshot = await db.collection('libraryContent')
                .where('type', '==', 'book')
                .where('published', '==', true)
                .orderBy('publishedAt', 'desc')
                .limit(20)
                .get();
            
            const books = [];
            booksSnapshot.forEach(doc => {
                books.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            renderLibraryContent('books', books);
        }
        
        console.log('✅ Books loaded');
        
    } catch (error) {
        console.error('❌ Error loading books:', error);
        renderLibraryContent('books', getDefaultBooks());
    }
}

// ===== UTILITY FUNCTIONS =====

// Get device information
function getDeviceInfo() {
    return {
        platform: navigator.platform,
        userAgent: navigator.userAgent,
        language: navigator.language,
        screenResolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
}

// Calculate XP based on duration and score
function calculateXP(duration, score) {
    const baseXP = Math.floor(duration / 5); // 1 XP per 5 minutes
    const scoreBonus = Math.floor(score / 10); // Bonus based on score
    return Math.max(baseXP + scoreBonus, 5); // Minimum 5 XP
}

// Get today's minutes for user
async function getTodayMinutes(userId) {
    try {
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            const db = firebase.firestore();
            const today = new Date().toISOString().split('T')[0];
            
            const sessionsSnapshot = await db.collection('practiceSessions')
                .where('userId', '==', userId)
                .where('date', '==', today)
                .get();
            
            let totalMinutes = 0;
            sessionsSnapshot.forEach(doc => {
                totalMinutes += doc.data().duration || 0;
            });
            
            return totalMinutes;
        }
        
        return 0;
        
    } catch (error) {
        console.error('Error getting today minutes:', error);
        return 0;
    }
}

// Get weekly activity data
async function getWeeklyActivity(userId) {
    try {
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            const db = firebase.firestore();
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            
            const sessionsSnapshot = await db.collection('practiceSessions')
                .where('userId', '==', userId)
                .where('completedAt', '>=', weekAgo)
                .get();
            
            const activityData = {};
            sessionsSnapshot.forEach(doc => {
                const data = doc.data();
                const date = data.date;
                
                if (!activityData[date]) {
                    activityData[date] = {
                        minutes: 0,
                        sessions: 0,
                        xp: 0
                    };
                }
                
                activityData[date].minutes += data.duration || 0;
                activityData[date].sessions += 1;
                activityData[date].xp += data.xpEarned || 0;
            });
            
            return activityData;
        }
        
        return {};
        
    } catch (error) {
        console.error('Error getting weekly activity:', error);
        return {};
    }
}

// Render library content
function renderLibraryContent(type, content) {
    const container = document.getElementById(`${type}Grid`);
    if (!container) return;
    
    container.innerHTML = '';
    
    content.forEach(item => {
        const element = createLibraryItem(item);
        container.appendChild(element);
    });
}

// Create library item element
function createLibraryItem(item) {
    const element = document.createElement('div');
    element.className = 'library-item';
    
    element.innerHTML = `
        <div class="item-thumbnail">
            <img src="${item.thumbnail || 'https://via.placeholder.com/300x200'}" alt="${item.title}">
            <div class="item-duration">${item.duration || '5 min'}</div>
        </div>
        <div class="item-content">
            <h4>${item.title}</h4>
            <p>${item.description}</p>
            <div class="item-meta">
                <span class="item-level">${item.level || 'Beginner'}</span>
                <span class="item-language">${item.language || 'Spanish'}</span>
            </div>
        </div>
    `;
    
    element.addEventListener('click', () => {
        openLibraryItem(item);
    });
    
    return element;
}

// Open library item
function openLibraryItem(item) {
    console.log('Opening library item:', item.title);
    showNotification(`Opening ${item.title}...`, 'info');
    
    // Track content view
    trackContentView(item.id, item.type);
}

// Track content view
async function trackContentView(contentId, contentType) {
    try {
        if (!currentUser) return;
        
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            const db = firebase.firestore();
            
            await db.collection('contentViews').add({
                userId: currentUser.id,
                contentId: contentId,
                contentType: contentType,
                viewedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        
    } catch (error) {
        console.error('Error tracking content view:', error);
    }
}

// Get default data functions
function getDefaultVideos() {
    return [
        {
            id: 'video1',
            title: 'Spanish Pronunciation Guide',
            description: 'Master Spanish pronunciation with native speakers',
            thumbnail: 'https://via.placeholder.com/300x200',
            duration: '15 min',
            level: 'Beginner',
            language: 'Spanish'
        }
    ];
}

function getDefaultArticles() {
    return [
        {
            id: 'article1',
            title: 'French Grammar Essentials',
            description: 'Learn the fundamentals of French grammar',
            thumbnail: 'https://via.placeholder.com/300x200',
            duration: '8 min read',
            level: 'Intermediate',
            language: 'French'
        }
    ];
}

function getDefaultPodcasts() {
    return [
        {
            id: 'podcast1',
            title: 'German Conversations',
            description: 'Listen to everyday German conversations',
            thumbnail: 'https://via.placeholder.com/300x200',
            duration: '25 min',
            level: 'Intermediate',
            language: 'German'
        }
    ];
}

function getDefaultBooks() {
    return [
        {
            id: 'book1',
            title: 'Italian Stories for Beginners',
            description: 'Short stories to improve your Italian',
            thumbnail: 'https://via.placeholder.com/300x200',
            duration: '2 hours',
            level: 'Beginner',
            language: 'Italian'
        }
    ];
}

// Make functions globally available
if (typeof window !== 'undefined') {
    window.firebaseV5 = {
        simulateLogin,
        simulateSignup,
        saveUserLoginToServer,
        saveNewUserToServer,
        saveUserLogoutToServer,
        loadUserProgressFromServer,
        loadCoursesFromServer,
        saveCourseProgress,
        savePracticeSession,
        saveQuickAction,
        updateLearningProgress,
        loadVideos,
        loadArticles,
        loadPodcasts,
        loadBooks
    };
}

console.log('🔥 LinguaLeap V5.0 Firebase integration initialized!');
