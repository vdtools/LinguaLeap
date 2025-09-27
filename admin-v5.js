// ===== LINGUALEAP V5.0 - ADMIN PANEL =====

console.log('🛡️ LinguaLeap V5.0 Admin Panel Loading...');

// Global variables
let isAdminAuthenticated = false;

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('📱 Admin Panel DOM loaded, initializing...');
    initializeAdminPanel();
});

// ===== INITIALIZATION =====

function initializeAdminPanel() {
    try {
        console.log('🔧 Initializing Admin Panel...');
        
        // Setup event listeners
        setupAdminEventListeners();
        
        // Show login form initially
        showAdminLogin();
        
        console.log('🛡️ LinguaLeap V5.0 Admin Panel initialized!');
        
    } catch (error) {
        console.error('❌ Admin Panel initialization failed:', error);
        showAdminNotification('Failed to initialize admin panel. Please refresh the page.', 'error');
    }
}

// Setup event listeners
function setupAdminEventListeners() {
    console.log('🎯 Setting up admin event listeners...');
    
    // Admin login form
    const adminLoginForm = document.getElementById('adminLoginForm');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', handleAdminLogin);
    }
}

// ===== AUTHENTICATION =====

function showAdminLogin() {
    const adminLogin = document.getElementById('adminLogin');
    const adminDashboard = document.getElementById('adminDashboard');
    
    if (adminLogin) adminLogin.style.display = 'flex';
    if (adminDashboard) adminDashboard.style.display = 'none';
}

function showAdminDashboard() {
    const adminLogin = document.getElementById('adminLogin');
    const adminDashboard = document.getElementById('adminDashboard');
    
    if (adminLogin) adminLogin.style.display = 'none';
    if (adminDashboard) adminDashboard.style.display = 'block';
    
    // Load dashboard data
    loadAdminDashboard();
}

// Handle admin login
async function handleAdminLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    
    if (!username || !password) {
        showAdminNotification('Please enter username and password', 'warning');
        return;
    }
    
    console.log('🔐 Attempting admin login...');
    showAdminNotification('Authenticating...', 'info');
    
    try {
        // Simulate authentication delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const isAuthenticated = LinguaLeap.authenticateAdmin(username, password);
        
        if (isAuthenticated) {
            isAdminAuthenticated = true;
            console.log('✅ Admin login successful');
            showAdminNotification('Welcome to Admin Panel!', 'success');
            showAdminDashboard();
        } else {
            console.log('❌ Admin login failed');
            showAdminNotification('Invalid credentials. Please try again.', 'error');
        }
    } catch (error) {
        console.error('❌ Admin login error:', error);
        showAdminNotification('Login failed. Please try again.', 'error');
    }
}

// ===== DASHBOARD LOADING =====

function loadAdminDashboard() {
    console.log('📊 Loading admin dashboard...');
    
    if (!isAdminAuthenticated) {
        showAdminLogin();
        return;
    }
    
    // Load statistics
    loadAdminStatistics();
    
    // Load users
    loadUsersTable();
    
    showAdminNotification('Dashboard loaded successfully', 'success');
}

function loadAdminStatistics() {
    console.log('📈 Loading admin statistics...');
    
    try {
        // Get all users
        const users = LinguaLeap.getAllUsers();
        const courses = LinguaLeap.getCourses();
        
        // Calculate statistics
        let totalLessonsCompleted = 0;
        let totalXP = 0;
        
        users.forEach(user => {
            if (user.progress) {
                totalLessonsCompleted += user.progress.stats?.lessonsCompleted || 0;
                totalXP += user.progress.totalXP || 0;
            }
        });
        
        // Update UI
        const totalUsersEl = document.getElementById('totalUsers');
        const totalCoursesEl = document.getElementById('totalCourses');
        const totalLessonsEl = document.getElementById('totalLessons');
        const totalXPEl = document.getElementById('totalXP');
        
        if (totalUsersEl) {
            animateNumber(totalUsersEl, 0, users.length, 1000);
        }
        
        if (totalCoursesEl) {
            animateNumber(totalCoursesEl, 0, courses.length, 1000);
        }
        
        if (totalLessonsEl) {
            animateNumber(totalLessonsEl, 0, totalLessonsCompleted, 1000);
        }
        
        if (totalXPEl) {
            animateNumber(totalXPEl, 0, totalXP, 1000);
        }
        
        console.log('📊 Statistics loaded:', {
            users: users.length,
            courses: courses.length,
            lessons: totalLessonsCompleted,
            xp: totalXP
        });
        
    } catch (error) {
        console.error('❌ Failed to load statistics:', error);
        showAdminNotification('Failed to load statistics', 'error');
    }
}

function loadUsersTable() {
    console.log('👥 Loading users table...');
    
    try {
        const users = LinguaLeap.getAllUsers();
        const tbody = document.getElementById('usersTableBody');
        
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        if (users.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: var(--space-xl);">
                        <div style="color: var(--gray-500);">
                            <i class="fas fa-users" style="font-size: 2rem; margin-bottom: var(--space-md);"></i>
                            <p>No users found</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        users.forEach(user => {
            const progress = user.progress || {};
            const completedLessons = progress.completedLessons ? progress.completedLessons.length : 0;
            const totalXP = progress.totalXP || 0;
            const isActive = user.lastLogin && isRecentActivity(user.lastLogin);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div style="display: flex; align-items: center; gap: var(--space-md);">
                        <img src="${user.avatar || 'https://via.placeholder.com/32'}" 
                             alt="${user.firstName}" 
                             class="user-avatar-small">
                        <div>
                            <div style="font-weight: 600;">${user.firstName} ${user.lastName}</div>
                            <div style="font-size: 0.75rem; color: var(--gray-500);">
                                ID: ${user.id}
                            </div>
                        </div>
                    </div>
                </td>
                <td>${user.email}</td>
                <td>
                    <div>${completedLessons} lessons</div>
                    <div style="font-size: 0.75rem; color: var(--gray-500);">${totalXP} XP</div>
                </td>
                <td>
                    <span class="status-badge ${isActive ? 'active' : 'inactive'}">
                        ${isActive ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td>
                    <button class="btn secondary" onclick="viewUserDetails('${user.id}')" 
                            style="padding: var(--space-xs) var(--space-sm); font-size: 0.75rem;">
                        <i class="fas fa-eye"></i> View
                    </button>
                </td>
            `;
            
            tbody.appendChild(row);
        });
        
        console.log(`👥 Loaded ${users.length} users in table`);
        
    } catch (error) {
        console.error('❌ Failed to load users table:', error);
        showAdminNotification('Failed to load users', 'error');
    }
}

// ===== UTILITY FUNCTIONS =====

function animateNumber(element, start, end, duration) {
    const startTime = performance.now();
    const range = end - start;
    
    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const current = Math.floor(start + (range * progress));
        element.textContent = current.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    }
    
    requestAnimationFrame(updateNumber);
}

function isRecentActivity(lastLogin) {
    if (!lastLogin) return false;
    
    const lastLoginDate = new Date(lastLogin);
    const now = new Date();
    const daysDiff = (now - lastLoginDate) / (1000 * 60 * 60 * 24);
    
    return daysDiff <= 7; // Active if logged in within 7 days
}

// ===== ADMIN ACTIONS =====

function refreshUsers() {
    console.log('🔄 Refreshing users...');
    showAdminNotification('Refreshing user data...', 'info');
    loadUsersTable();
    showAdminNotification('Users refreshed successfully', 'success');
}

function viewUserDetails(userId) {
    console.log('👤 Viewing user details for:', userId);
    
    const users = LinguaLeap.getAllUsers();
    const user = users.find(u => u.id === userId);
    
    if (user) {
        const progress = user.progress || {};
        const details = `
User Details:
Name: ${user.firstName} ${user.lastName}
Email: ${user.email}
Created: ${new Date(user.createdAt).toLocaleDateString()}
Last Login: ${user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
XP: ${progress.totalXP || 0}
Streak: ${progress.streak || 0} days
Lessons Completed: ${progress.completedLessons ? progress.completedLessons.length : 0}
        `;
        
        alert(details);
    } else {
        showAdminNotification('User not found', 'error');
    }
}

function showAddUser() {
    console.log('➕ Show add user form');
    const userData = prompt(`Enter user data (format: firstName,lastName,email,password):
Example: John,Doe,john@example.com,password123`);
    
    if (userData) {
        const [firstName, lastName, email, password] = userData.split(',').map(s => s.trim());
        
        if (firstName && lastName && email && password) {
            LinguaLeap.createUser({ firstName, lastName, email, password })
                .then(result => {
                    if (result.success) {
                        showAdminNotification('User created successfully', 'success');
                        loadUsersTable();
                        loadAdminStatistics();
                    } else {
                        showAdminNotification(result.error, 'error');
                    }
                });
        } else {
            showAdminNotification('Invalid user data format', 'error');
        }
    }
}

function showAddCourse() {
    console.log('📚 Show add course form');
    showAdminNotification('Course creation feature coming soon!', 'info');
}

function showReports() {
    console.log('📊 Show reports');
    showAdminNotification('Reports feature coming soon!', 'info');
}

function showSettings() {
    console.log('⚙️ Show settings');
    showAdminNotification('Settings panel coming soon!', 'info');
}

function exportData() {
    console.log('💾 Export data');
    
    try {
        const users = LinguaLeap.getAllUsers();
        const courses = LinguaLeap.getCourses();
        
        const exportData = {
            users: users,
            courses: courses,
            exportDate: new Date().toISOString(),
            version: '5.0'
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `lingualeap_export_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        showAdminNotification('Data exported successfully', 'success');
        
    } catch (error) {
        console.error('❌ Export failed:', error);
        showAdminNotification('Export failed. Please try again.', 'error');
    }
}

function showLogs() {
    console.log('📝 Show system logs');
    
    const logs = [
        `${new Date().toISOString()} - Admin panel accessed`,
        `${new Date().toISOString()} - User data loaded`,
        `${new Date().toISOString()} - Statistics calculated`,
        `${new Date().toISOString()} - System operational`
    ];
    
    alert('System Logs:\n\n' + logs.join('\n'));
}

function adminLogout() {
    console.log('👋 Admin logout');
    
    isAdminAuthenticated = false;
    showAdminNotification('Logged out successfully', 'info');
    
    // Clear form
    const usernameField = document.getElementById('adminUsername');
    const passwordField = document.getElementById('adminPassword');
    
    if (usernameField) usernameField.value = '';
    if (passwordField) passwordField.value = '';
    
    setTimeout(() => {
        showAdminLogin();
    }, 1000);
}

// ===== NOTIFICATION SYSTEM =====

function showAdminNotification(message, type = 'info') {
    const toast = document.getElementById('adminNotificationToast');
    const toastMessage = document.getElementById('adminToastMessage');
    
    if (toast && toastMessage) {
        toastMessage.textContent = message;
        toast.className = `notification-toast ${type} show`;
        
        // Auto hide after 4 seconds
        setTimeout(() => {
            hideAdminNotification();
        }, 4000);
    }
    
    console.log(`📢 ADMIN ${type.toUpperCase()}: ${message}`);
}

function hideAdminNotification() {
    const toast = document.getElementById('adminNotificationToast');
    if (toast) {
        toast.classList.remove('show');
    }
}

// ===== INITIALIZATION COMPLETE =====

console.log('🛡️ LinguaLeap V5.0 Admin Panel loaded successfully!');