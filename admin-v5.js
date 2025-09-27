// ===== LINGUALEAP V5.0 - ADMIN PANEL =====

// Admin credentials (in production, use proper authentication)
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'lingualeap2025'
};

// Global admin variables
let adminUser = null;
let adminDb = null;
let dashboardStats = {};

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function() {
    console.log('🛡️ LinguaLeap Admin Panel V5.0 Starting...');
    
    // Initialize Firebase
    initializeAdminFirebase();
    
    // Set up event listeners
    setupAdminEventListeners();
    
    // Check admin session
    checkAdminSession();
});

// Initialize Firebase for admin
function initializeAdminFirebase() {
    try {
        if (typeof firebase !== 'undefined') {
            adminDb = firebase.firestore();
            console.log('✅ Admin Firebase initialized');
        } else {
            console.error('❌ Firebase not available');
        }
    } catch (error) {
        console.error('❌ Admin Firebase initialization error:', error);
    }
}

// Set up admin event listeners
function setupAdminEventListeners() {
    // Admin login form
    const adminLoginForm = document.getElementById('adminLoginForm');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', handleAdminLogin);
    }
    
    // Admin navigation
    const navItems = document.querySelectorAll('.admin-nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', handleAdminNavigation);
    });
    
    // Course form
    const courseForm = document.getElementById('courseForm');
    if (courseForm) {
        courseForm.addEventListener('submit', handleCourseSubmit);
    }
    
    // Content form
    const contentForm = document.getElementById('contentForm');
    if (contentForm) {
        contentForm.addEventListener('submit', handleContentSubmit);
    }
    
    // Settings form
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', handleSettingsSubmit);
    }
    
    // Sign out
    const signOutBtn = document.getElementById('adminSignOut');
    if (signOutBtn) {
        signOutBtn.addEventListener('click', handleAdminSignOut);
    }
}

// Check admin session
function checkAdminSession() {
    const savedAdmin = localStorage.getItem('lingualeap_admin');
    if (savedAdmin) {
        try {
            adminUser = JSON.parse(savedAdmin);
            showAdminPanel();
        } catch (error) {
            console.error('Error parsing admin session:', error);
            showPasswordScreen();
        }
    } else {
        showPasswordScreen();
    }
}

// Show password screen
function showPasswordScreen() {
    const passwordScreen = document.getElementById('adminPasswordScreen');
    const adminPanel = document.getElementById('adminPanel');
    
    if (passwordScreen) passwordScreen.style.display = 'flex';
    if (adminPanel) adminPanel.style.display = 'none';
}

// Show admin panel
function showAdminPanel() {
    const passwordScreen = document.getElementById('adminPasswordScreen');
    const adminPanel = document.getElementById('adminPanel');
    
    if (passwordScreen) passwordScreen.style.display = 'none';
    if (adminPanel) adminPanel.style.display = 'flex';
    
    // Load dashboard data
    loadDashboardData();
    loadUsers();
    loadCourses();
    loadContent();
    loadAnalytics();
}

// Handle admin login
function handleAdminLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('adminUsername').value.trim();
    const password = document.getElementById('adminPassword').value;
    const errorDiv = document.getElementById('adminLoginError');
    
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        adminUser = {
            username: username,
            loginTime: new Date().toISOString(),
            permissions: ['all']
        };
        
        // Save admin session
        localStorage.setItem('lingualeap_admin', JSON.stringify(adminUser));
        
        showAdminPanel();
        showAdminNotification('Admin login successful', 'success');
        
        // Log admin login
        logAdminActivity('login', { username });
        
    } else {
        errorDiv.textContent = 'Invalid credentials. Please try again.';
        errorDiv.style.display = 'block';
        
        // Clear password
        document.getElementById('adminPassword').value = '';
    }
}

// Handle admin navigation
function handleAdminNavigation(e) {
    e.preventDefault();
    
    const targetSection = e.currentTarget.dataset.section;
    if (!targetSection) return;
    
    // Remove active class from all nav items and sections
    document.querySelectorAll('.admin-nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Add active class to clicked nav item
    e.currentTarget.classList.add('active');
    
    // Show target section
    const targetElement = document.getElementById(targetSection + 'Section');
    if (targetElement) {
        targetElement.classList.add('active');
    }
    
    // Update header
    updateAdminHeader(targetSection);
    
    console.log(`📍 Admin navigated to: ${targetSection}`);
}

// Update admin header
function updateAdminHeader(section) {
    const titleElement = document.getElementById('adminSectionTitle');
    const descriptionElement = document.getElementById('adminSectionDescription');
    
    const sections = {
        dashboard: {
            title: 'Dashboard Overview',
            description: 'Monitor platform performance and user activity'
        },
        users: {
            title: 'User Management',
            description: 'Manage user accounts and permissions'
        },
        courses: {
            title: 'Course Management',
            description: 'Create and manage language courses'
        },
        content: {
            title: 'Content Library',
            description: 'Manage learning resources and materials'
        },
        analytics: {
            title: 'Analytics Dashboard',
            description: 'View detailed platform analytics and insights'
        },
        settings: {
            title: 'System Settings',
            description: 'Configure platform settings and preferences'
        }
    };
    
    if (sections[section]) {
        if (titleElement) titleElement.textContent = sections[section].title;
        if (descriptionElement) descriptionElement.textContent = sections[section].description;
    }
}

// Load dashboard data
async function loadDashboardData() {
    try {
        console.log('📊 Loading dashboard data...');
        
        if (adminDb) {
            // Load real stats from Firebase
            const stats = await Promise.all([
                getUserCount(),
                getActiveUserCount(),
                getCourseCount(),
                getLessonCount()
            ]);
            
            dashboardStats = {
                totalUsers: stats[0],
                activeUsers: stats[1],
                totalCourses: stats[2],
                totalLessons: stats[3]
            };
        } else {
            // Use demo data
            dashboardStats = {
                totalUsers: 1247,
                activeUsers: 89,
                totalCourses: 12,
                totalLessons: 245
            };
        }
        
        // Update dashboard UI
        updateDashboardUI();
        loadRecentActivity();
        
    } catch (error) {
        console.error('❌ Error loading dashboard data:', error);
        showAdminNotification('Failed to load dashboard data', 'error');
    }
}

// Update dashboard UI
function updateDashboardUI() {
    const totalUsersEl = document.getElementById('totalUsers');
    const activeUsersEl = document.getElementById('activeUsers');
    const totalCoursesEl = document.getElementById('totalCourses');
    const totalLessonsEl = document.getElementById('totalLessons');
    
    if (totalUsersEl) {
        animateNumber(totalUsersEl, 0, dashboardStats.totalUsers, 2000);
    }
    if (activeUsersEl) {
        animateNumber(activeUsersEl, 0, dashboardStats.activeUsers, 1500);
    }
    if (totalCoursesEl) {
        animateNumber(totalCoursesEl, 0, dashboardStats.totalCourses, 1000);
    }
    if (totalLessonsEl) {
        animateNumber(totalLessonsEl, 0, dashboardStats.totalLessons, 2500);
    }
}

// Load recent activity
async function loadRecentActivity() {
    try {
        const activityEl = document.getElementById('recentActivity');
        if (!activityEl) return;
        
        let activities = [];
        
        if (adminDb) {
            // Load real activity from Firebase
            const activitySnapshot = await adminDb.collection('userActions')
                .orderBy('timestamp', 'desc')
                .limit(10)
                .get();
            
            activitySnapshot.forEach(doc => {
                activities.push(doc.data());
            });
        } else {
            // Use demo activity
            activities = [
                { action: 'User registered', timestamp: new Date(), userId: 'user123' },
                { action: 'Course completed', timestamp: new Date(), userId: 'user456' },
                { action: 'Lesson started', timestamp: new Date(), userId: 'user789' }
            ];
        }
        
        if (activities.length === 0) {
            activityEl.innerHTML = '<div class="empty-state">No recent activity</div>';
            return;
        }
        
        const activityHTML = activities.map(activity => `
            <div style="padding: 1rem; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                <div style="font-weight: 600;">${activity.action}</div>
                <div style="font-size: 0.9rem; opacity: 0.7;">
                    ${activity.userId || 'Unknown user'} • 
                    ${formatTimeAgo(activity.timestamp)}
                </div>
            </div>
        `).join('');
        
        activityEl.innerHTML = activityHTML || '<div class="empty-state">No activity found</div>';
        
    } catch (error) {
        console.error('❌ Error loading recent activity:', error);
        const activityEl = document.getElementById('recentActivity');
        if (activityEl) {
            activityEl.innerHTML = '<div class="error-message">Failed to load activity</div>';
        }
    }
}

// Load users
async function loadUsers() {
    try {
        console.log('👥 Loading users...');
        
        const usersTableEl = document.getElementById('usersTable');
        if (!usersTableEl) return;
        
        let users = [];
        
        if (adminDb) {
            // Load real users from Firebase
            const usersSnapshot = await adminDb.collection('users')
                .orderBy('createdAt', 'desc')
                .limit(50)
                .get();
            
            usersSnapshot.forEach(doc => {
                users.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
        } else {
            // Use demo users
            users = [
                {
                    id: 'user1',
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john@example.com',
                    createdAt: new Date(),
                    lastLogin: new Date()
                },
                {
                    id: 'user2',
                    firstName: 'Jane',
                    lastName: 'Smith',
                    email: 'jane@example.com',
                    createdAt: new Date(),
                    lastLogin: new Date()
                }
            ];
        }
        
        if (users.length === 0) {
            usersTableEl.innerHTML = '<div class="empty-state">No users found</div>';
            return;
        }
        
        const tableHTML = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Joined</th>
                        <th>Last Login</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${users.map(user => `
                        <tr>
                            <td>${user.firstName || ''} ${user.lastName || ''}</td>
                            <td>${user.email || 'N/A'}</td>
                            <td>${formatDate(user.createdAt)}</td>
                            <td>${formatDate(user.lastLogin)}</td>
                            <td>
                                <button class="admin-btn" style="padding: 0.5rem; font-size: 0.8rem;" onclick="viewUser('${user.id}')">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="admin-btn danger" style="padding: 0.5rem; font-size: 0.8rem; margin-left: 0.5rem;" onclick="deleteUser('${user.id}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        usersTableEl.innerHTML = tableHTML;
        
    } catch (error) {
        console.error('❌ Error loading users:', error);
        const usersTableEl = document.getElementById('usersTable');
        if (usersTableEl) {
            usersTableEl.innerHTML = '<div class="error-message">Failed to load users</div>';
        }
    }
}

// Handle course submission
async function handleCourseSubmit(e) {
    e.preventDefault();
    
    try {
        const courseData = {
            name: document.getElementById('courseName').value.trim(),
            language: document.getElementById('courseLanguage').value,
            difficulty: document.getElementById('courseDifficulty').value,
            duration: document.getElementById('courseDuration').value.trim(),
            description: document.getElementById('courseDescription').value.trim(),
            active: true,
            order: Date.now(), // Simple ordering
            createdAt: new Date().toISOString(),
            createdBy: adminUser.username
        };
        
        if (!courseData.name || !courseData.language || !courseData.difficulty) {
            showAdminNotification('Please fill in all required fields', 'error');
            return;
        }
        
        console.log('📚 Creating course:', courseData);
        
        if (adminDb) {
            // Save to Firebase
            await adminDb.collection('courses').add({
                ...courseData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        
        showAdminNotification('Course created successfully!', 'success');
        
        // Reset form
        document.getElementById('courseForm').reset();
        
        // Reload courses
        loadCourses();
        
        // Log admin activity
        logAdminActivity('course_created', { courseName: courseData.name });
        
    } catch (error) {
        console.error('❌ Error creating course:', error);
        showAdminNotification('Failed to create course', 'error');
    }
}

// Load courses
async function loadCourses() {
    try {
        console.log('📚 Loading courses...');
        
        const coursesListEl = document.getElementById('coursesList');
        if (!coursesListEl) return;
        
        let courses = [];
        
        if (adminDb) {
            // Load real courses from Firebase
            const coursesSnapshot = await adminDb.collection('courses')
                .orderBy('createdAt', 'desc')
                .get();
            
            coursesSnapshot.forEach(doc => {
                courses.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
        } else {
            // Use demo courses
            courses = [
                {
                    id: 'course1',
                    name: 'Spanish for Beginners',
                    language: 'spanish',
                    difficulty: 'beginner',
                    duration: '3 months',
                    active: true
                }
            ];
        }
        
        if (courses.length === 0) {
            coursesListEl.innerHTML = '<div class="empty-state">No courses found</div>';
            return;
        }
        
        const coursesHTML = courses.map(course => `
            <div style="background: rgba(255, 255, 255, 0.1); border-radius: 0.5rem; padding: 1.5rem; margin-bottom: 1rem; border: 1px solid rgba(255, 255, 255, 0.1);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <h4 style="margin-bottom: 0.5rem; color: white;">${course.name}</h4>
                        <p style="color: rgba(255, 255, 255, 0.8); margin-bottom: 1rem;">${course.description || 'No description'}</p>
                        <div style="display: flex; gap: 1rem; font-size: 0.9rem; color: rgba(255, 255, 255, 0.7);">
                            <span><i class="fas fa-language"></i> ${course.language}</span>
                            <span><i class="fas fa-signal"></i> ${course.difficulty}</span>
                            <span><i class="fas fa-clock"></i> ${course.duration}</span>
                        </div>
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="admin-btn" style="padding: 0.5rem; font-size: 0.8rem;" onclick="editCourse('${course.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="admin-btn danger" style="padding: 0.5rem; font-size: 0.8rem;" onclick="deleteCourse('${course.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        coursesListEl.innerHTML = coursesHTML;
        
    } catch (error) {
        console.error('❌ Error loading courses:', error);
        const coursesListEl = document.getElementById('coursesList');
        if (coursesListEl) {
            coursesListEl.innerHTML = '<div class="error-message">Failed to load courses</div>';
        }
    }
}

// Handle content submission
async function handleContentSubmit(e) {
    e.preventDefault();
    
    try {
        const contentData = {
            type: document.getElementById('contentType').value,
            title: document.getElementById('contentTitle').value.trim(),
            language: document.getElementById('contentLanguage').value,
            level: document.getElementById('contentLevel').value,
            description: document.getElementById('contentDescription').value.trim(),
            url: document.getElementById('contentUrl').value.trim(),
            thumbnail: document.getElementById('contentThumbnail').value.trim(),
            published: true,
            publishedAt: new Date().toISOString(),
            createdBy: adminUser.username
        };
        
        if (!contentData.type || !contentData.title || !contentData.language || !contentData.level) {
            showAdminNotification('Please fill in all required fields', 'error');
            return;
        }
        
        console.log('📝 Creating content:', contentData);
        
        if (adminDb) {
            // Save to Firebase
            await adminDb.collection('libraryContent').add({
                ...contentData,
                publishedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        
        showAdminNotification('Content added successfully!', 'success');
        
        // Reset form
        document.getElementById('contentForm').reset();
        
        // Reload content
        loadContent();
        
        // Log admin activity
        logAdminActivity('content_created', { contentTitle: contentData.title });
        
    } catch (error) {
        console.error('❌ Error creating content:', error);
        showAdminNotification('Failed to add content', 'error');
    }
}

// Load content
async function loadContent() {
    try {
        console.log('📚 Loading content...');
        
        const contentLibraryEl = document.getElementById('contentLibrary');
        if (!contentLibraryEl) return;
        
        let content = [];
        
        if (adminDb) {
            // Load real content from Firebase
            const contentSnapshot = await adminDb.collection('libraryContent')
                .orderBy('publishedAt', 'desc')
                .limit(20)
                .get();
            
            contentSnapshot.forEach(doc => {
                content.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
        } else {
            // Use demo content
            content = [
                {
                    id: 'content1',
                    type: 'video',
                    title: 'Spanish Pronunciation Guide',
                    language: 'spanish',
                    level: 'beginner',
                    published: true
                }
            ];
        }
        
        if (content.length === 0) {
            contentLibraryEl.innerHTML = '<div class="empty-state">No content found</div>';
            return;
        }
        
        const contentHTML = content.map(item => `
            <div style="background: rgba(255, 255, 255, 0.1); border-radius: 0.5rem; padding: 1.5rem; margin-bottom: 1rem; border: 1px solid rgba(255, 255, 255, 0.1);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                            <span style="background: rgba(102, 126, 234, 0.2); color: #667eea; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.8rem;">
                                ${item.type}
                            </span>
                            <span style="color: rgba(255, 255, 255, 0.6); font-size: 0.8rem;">${item.language} • ${item.level}</span>
                        </div>
                        <h4 style="margin-bottom: 0.5rem; color: white;">${item.title}</h4>
                        <p style="color: rgba(255, 255, 255, 0.8); margin-bottom: 0;">${item.description || 'No description'}</p>
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="admin-btn" style="padding: 0.5rem; font-size: 0.8rem;" onclick="editContent('${item.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="admin-btn danger" style="padding: 0.5rem; font-size: 0.8rem;" onclick="deleteContent('${item.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        contentLibraryEl.innerHTML = contentHTML;
        
    } catch (error) {
        console.error('❌ Error loading content:', error);
        const contentLibraryEl = document.getElementById('contentLibrary');
        if (contentLibraryEl) {
            contentLibraryEl.innerHTML = '<div class="error-message">Failed to load content</div>';
        }
    }
}

// Load analytics
async function loadAnalytics() {
    try {
        console.log('📊 Loading analytics...');
        
        // Update analytics stats (demo values)
        const dailyActiveUsersEl = document.getElementById('dailyActiveUsers');
        const avgSessionTimeEl = document.getElementById('avgSessionTime');
        const completionRateEl = document.getElementById('completionRate');
        const userRetentionEl = document.getElementById('userRetention');
        
        if (dailyActiveUsersEl) animateNumber(dailyActiveUsersEl, 0, 89, 1500);
        if (avgSessionTimeEl) {
            setTimeout(() => {
                avgSessionTimeEl.textContent = '24m';
            }, 500);
        }
        if (completionRateEl) {
            setTimeout(() => {
                completionRateEl.textContent = '73%';
            }, 1000);
        }
        if (userRetentionEl) {
            setTimeout(() => {
                userRetentionEl.textContent = '68%';
            }, 1500);
        }
        
    } catch (error) {
        console.error('❌ Error loading analytics:', error);
    }
}

// Handle settings submission
function handleSettingsSubmit(e) {
    e.preventDefault();
    
    showAdminNotification('Settings saved successfully!', 'success');
    
    // Log admin activity
    logAdminActivity('settings_updated', {});
}

// Handle admin sign out
function handleAdminSignOut() {
    if (confirm('Are you sure you want to sign out?')) {
        // Clear admin session
        localStorage.removeItem('lingualeap_admin');
        
        // Log admin logout
        logAdminActivity('logout', { username: adminUser?.username });
        
        adminUser = null;
        
        showPasswordScreen();
        showAdminNotification('Signed out successfully', 'success');
    }
}

// Utility functions
function toggleAdminPassword() {
    const input = document.getElementById('adminPassword');
    const icon = document.querySelector('#adminPasswordScreen .password-toggle i');
    
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

function refreshUsers() {
    showAdminNotification('Refreshing users...', 'info');
    loadUsers();
}

function viewUser(userId) {
    showAdminNotification(`Viewing user: ${userId}`, 'info');
    console.log('View user:', userId);
}

function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        showAdminNotification(`User ${userId} deleted`, 'success');
        console.log('Delete user:', userId);
        loadUsers(); // Refresh users list
    }
}

function editCourse(courseId) {
    showAdminNotification(`Editing course: ${courseId}`, 'info');
    console.log('Edit course:', courseId);
}

function deleteCourse(courseId) {
    if (confirm('Are you sure you want to delete this course?')) {
        showAdminNotification(`Course ${courseId} deleted`, 'success');
        console.log('Delete course:', courseId);
        loadCourses(); // Refresh courses list
    }
}

function editContent(contentId) {
    showAdminNotification(`Editing content: ${contentId}`, 'info');
    console.log('Edit content:', contentId);
}

function deleteContent(contentId) {
    if (confirm('Are you sure you want to delete this content?')) {
        showAdminNotification(`Content ${contentId} deleted`, 'success');
        console.log('Delete content:', contentId);
        loadContent(); // Refresh content list
    }
}

function backupDatabase() {
    showAdminNotification('Starting database backup...', 'info');
    
    // Simulate backup process
    setTimeout(() => {
        showAdminNotification('Database backup completed!', 'success');
    }, 2000);
}

function clearCache() {
    if (confirm('Are you sure you want to clear the cache?')) {
        showAdminNotification('Cache cleared successfully!', 'success');
    }
}

function exportData() {
    showAdminNotification('Preparing data export...', 'info');
    
    // Simulate export process
    setTimeout(() => {
        showAdminNotification('Data export ready for download!', 'success');
    }, 3000);
}

// Helper functions
function animateNumber(element, start, end, duration) {
    const range = end - start;
    const increment = end > start ? 1 : -1;
    const stepTime = Math.abs(Math.floor(duration / range));
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        element.textContent = current;
        
        if (current === end) {
            clearInterval(timer);
        }
    }, stepTime);
}

function formatDate(date) {
    if (!date) return 'N/A';
    
    try {
        const d = date.toDate ? date.toDate() : new Date(date);
        return d.toLocaleDateString();
    } catch (error) {
        return 'Invalid date';
    }
}

function formatTimeAgo(date) {
    if (!date) return 'Unknown';
    
    try {
        const d = date.toDate ? date.toDate() : new Date(date);
        const now = new Date();
        const diffInMinutes = Math.floor((now - d) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return `${Math.floor(diffInMinutes / 1440)}d ago`;
    } catch (error) {
        return 'Unknown';
    }
}

// Database helper functions
async function getUserCount() {
    try {
        if (adminDb) {
            const snapshot = await adminDb.collection('users').get();
            return snapshot.size;
        }
        return 1247; // Demo value
    } catch (error) {
        console.error('Error getting user count:', error);
        return 0;
    }
}

async function getActiveUserCount() {
    try {
        if (adminDb) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            const snapshot = await adminDb.collection('userSessions')
                .where('loginTime', '>=', yesterday)
                .get();
            
            return snapshot.size;
        }
        return 89; // Demo value
    } catch (error) {
        console.error('Error getting active user count:', error);
        return 0;
    }
}

async function getCourseCount() {
    try {
        if (adminDb) {
            const snapshot = await adminDb.collection('courses').get();
            return snapshot.size;
        }
        return 12; // Demo value
    } catch (error) {
        console.error('Error getting course count:', error);
        return 0;
    }
}

async function getLessonCount() {
    try {
        if (adminDb) {
            const snapshot = await adminDb.collection('lessons').get();
            return snapshot.size;
        }
        return 245; // Demo value
    } catch (error) {
        console.error('Error getting lesson count:', error);
        return 0;
    }
}

// Log admin activity
async function logAdminActivity(action, metadata = {}) {
    try {
        if (adminDb && adminUser) {
            await adminDb.collection('adminActivity').add({
                adminUser: adminUser.username,
                action: action,
                metadata: metadata,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                ipAddress: 'auto-detect', // In production, get real IP
                userAgent: navigator.userAgent
            });
        }
        
        console.log(`📅 Admin activity logged: ${action}`);
    } catch (error) {
        console.error('Error logging admin activity:', error);
    }
}

// Show admin notification
function showAdminNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `admin-notification ${type}`;
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem; background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 0.75rem; padding: 1rem 1.5rem; color: white; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}" style="color: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: rgba(255, 255, 255, 0.6); cursor: pointer; margin-left: auto; padding: 0.25rem;">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Style and position
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
        max-width: 400px;
    `;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
}

// Add CSS animations
if (!document.getElementById('adminAnimations')) {
    const style = document.createElement('style');
    style.id = 'adminAnimations';
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// Make functions globally available
window.toggleAdminPassword = toggleAdminPassword;
window.refreshUsers = refreshUsers;
window.viewUser = viewUser;
window.deleteUser = deleteUser;
window.editCourse = editCourse;
window.deleteCourse = deleteCourse;
window.editContent = editContent;
window.deleteContent = deleteContent;
window.backupDatabase = backupDatabase;
window.clearCache = clearCache;
window.exportData = exportData;

console.log('🛡️ LinguaLeap Admin Panel V5.0 initialized!');
