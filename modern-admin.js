// ===== LINGUALEAP MODERN ADMIN V5.0 =====

// Global variables
let isAdminAuthenticated = false;
let adminData = {
    courses: [],
    chapters: [],
    users: [],
    settings: {}
};
let questionCounter = 0;

// Admin credentials - Change these in production
const ADMIN_PASSWORD = 'lingualeap2025';
const API_BASE_URL = 'https://your-server.com/api'; // Change to your server

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 LinguaLeap Admin V5.0 Starting...');
    
    // Check if admin is already authenticated
    checkAdminAuth();
    
    // Set up event listeners
    setupAdminEventListeners();
    
    // Focus on password input
    const passwordInput = document.getElementById('adminPassword');
    if (passwordInput) {
        passwordInput.focus();
        
        // Allow Enter key to submit password
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                verifyPassword();
            }
        });
    }
});

// ===== AUTHENTICATION =====
function checkAdminAuth() {
    const adminToken = sessionStorage.getItem('admin_token');
    if (adminToken) {
        isAdminAuthenticated = true;
        showAdminPanel();
    }
}

function verifyPassword() {
    const passwordInput = document.getElementById('adminPassword');
    const passwordError = document.getElementById('passwordError');
    const password = passwordInput.value;
    
    if (password === ADMIN_PASSWORD) {
        isAdminAuthenticated = true;
        sessionStorage.setItem('admin_token', 'admin_authenticated_' + Date.now());
        showAdminPanel();
        showNotification('✅ Admin access granted', 'success');
    } else {
        passwordError.textContent = 'Invalid password. Please try again.';
        passwordInput.value = '';
        passwordInput.style.borderColor = 'var(--error-color)';
        
        setTimeout(() => {
            passwordInput.style.borderColor = '';
            passwordError.textContent = '';
        }, 3000);
    }
}

function showAdminPanel() {
    document.getElementById('passwordScreen').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'flex';
    
    // Load initial data
    loadDashboardData();
    loadCourses();
    loadChapters();
    loadUsers();
}

function logout() {
    sessionStorage.removeItem('admin_token');
    isAdminAuthenticated = false;
    location.reload();
}

// ===== EVENT LISTENERS =====
function setupAdminEventListeners() {
    // Navigation items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            showSection(section);
            
            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Course form submission
    const courseForm = document.getElementById('courseForm');
    if (courseForm) {
        courseForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveCourse();
        });
    }
}

// ===== SECTION NAVIGATION =====
function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.admin-section');
    sections.forEach(section => section.classList.remove('active'));
    
    // Show selected section
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Load section-specific data
    switch(sectionName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'courses':
            loadCourses();
            break;
        case 'chapters':
            loadChapters();
            break;
        case 'users':
            loadUsers();
            break;
        case 'analytics':
            loadAnalytics();
            break;
    }
}

// ===== DASHBOARD =====
async function loadDashboardData() {
    try {
        // Mock data - replace with actual API calls
        const stats = {
            totalUsers: 1234,
            totalCourses: 15,
            totalChapters: 128,
            totalLessons: 456
        };
        
        // Update stats
        document.getElementById('totalUsers').textContent = stats.totalUsers.toLocaleString();
        document.getElementById('totalCourses').textContent = stats.totalCourses;
        document.getElementById('totalChapters').textContent = stats.totalChapters;
        document.getElementById('totalLessons').textContent = stats.totalLessons;
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showNotification('❌ Error loading dashboard data', 'error');
    }
}

// ===== COURSE MANAGEMENT =====
function showAddCourseForm() {
    const form = document.getElementById('addCourseForm');
    form.style.display = 'block';
    document.getElementById('courseName').focus();
}

function hideAddCourseForm() {
    const form = document.getElementById('addCourseForm');
    form.style.display = 'none';
    document.getElementById('courseForm').reset();
}

async function saveCourse() {
    const courseName = document.getElementById('courseName').value;
    const courseDescription = document.getElementById('courseDescription').value;
    const courseLanguage = document.getElementById('courseLanguage').value;
    
    if (!courseName.trim()) {
        showNotification('❌ Course name is required', 'error');
        return;
    }
    
    try {
        // Show loading
        const submitBtn = document.querySelector('#courseForm button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Saving...';
        submitBtn.disabled = true;
        
        // Create course object
        const course = {
            id: Date.now(),
            name: courseName,
            description: courseDescription,
            language: courseLanguage,
            chapters: 0,
            students: 0,
            status: 'active',
            createdAt: new Date().toISOString()
        };
        
        // Mock API call - replace with actual API
        const success = await saveCourseToServer(course);
        
        if (success) {
            adminData.courses.push(course);
            showNotification('✅ Course saved successfully', 'success');
            hideAddCourseForm();
            loadCourses();
        } else {
            showNotification('❌ Failed to save course', 'error');
        }
        
    } catch (error) {
        console.error('Error saving course:', error);
        showNotification('❌ Error saving course', 'error');
    }
}

async function loadCourses() {
    try {
        // Mock data - replace with actual API call
        const courses = await fetchCoursesFromServer();
        adminData.courses = courses;
        
        const tableBody = document.getElementById('coursesTable');
        if (tableBody) {
            tableBody.innerHTML = courses.map(course => `
                <tr>
                    <td>${course.name}</td>
                    <td>${course.language.charAt(0).toUpperCase() + course.language.slice(1)}</td>
                    <td>${course.chapters}</td>
                    <td>${course.students}</td>
                    <td><span class="status-badge status-${course.status}">${course.status}</span></td>
                    <td>
                        <button class="btn-primary btn-table" onclick="editCourse(${course.id})">Edit</button>
                        <button class="btn-danger btn-table" onclick="deleteCourse(${course.id})">Delete</button>
                    </td>
                </tr>
            `).join('');
        }
        
        // Update course dropdown in chapter form
        const courseSelect = document.getElementById('chapterCourse');
        if (courseSelect) {
            courseSelect.innerHTML = '<option value="">Select a course</option>' + 
                courses.map(course => `<option value="${course.id}">${course.name}</option>`).join('');
        }
        
    } catch (error) {
        console.error('Error loading courses:', error);
        showNotification('❌ Error loading courses', 'error');
    }
}

function refreshCourses() {
    loadCourses();
    showNotification('🔄 Courses refreshed', 'info');
}

function editCourse(courseId) {
    showNotification(`Editing course ${courseId}...`, 'info');
    // Implement edit functionality
}

function deleteCourse(courseId) {
    if (confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
        // Remove from array
        adminData.courses = adminData.courses.filter(course => course.id !== courseId);
        loadCourses();
        showNotification('✅ Course deleted successfully', 'success');
    }
}

// ===== CHAPTER MANAGEMENT =====
function showAddChapterForm() {
    const form = document.getElementById('addChapterForm');
    form.style.display = 'block';
    
    // Reset form
    document.getElementById('chapterForm').reset();
    document.getElementById('questionsContainer').innerHTML = '';
    questionCounter = 0;
    
    // Focus on course selection
    document.getElementById('chapterCourse').focus();
}

function hideAddChapterForm() {
    const form = document.getElementById('addChapterForm');
    form.style.display = 'none';
    document.getElementById('chapterForm').reset();
    document.getElementById('questionsContainer').innerHTML = '';
    questionCounter = 0;
}

function addQuestion() {
    questionCounter++;
    const questionsContainer = document.getElementById('questionsContainer');
    
    const questionHtml = `
        <div class="question-item" id="question-${questionCounter}">
            <div class="question-header">
                <h4>Question ${questionCounter}</h4>
                <button type="button" class="btn-danger btn-table" onclick="removeQuestion(${questionCounter})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            
            <div class="form-group">
                <label for="question-text-${questionCounter}">Question Text</label>
                <input type="text" id="question-text-${questionCounter}" required placeholder="Enter your question">
            </div>
            
            <div class="options-grid">
                <div class="form-group">
                    <label for="option-a-${questionCounter}">Option A</label>
                    <input type="text" id="option-a-${questionCounter}" required placeholder="Option A">
                </div>
                <div class="form-group">
                    <label for="option-b-${questionCounter}">Option B</label>
                    <input type="text" id="option-b-${questionCounter}" required placeholder="Option B">
                </div>
                <div class="form-group">
                    <label for="option-c-${questionCounter}">Option C</label>
                    <input type="text" id="option-c-${questionCounter}" required placeholder="Option C">
                </div>
                <div class="form-group">
                    <label for="option-d-${questionCounter}">Option D</label>
                    <input type="text" id="option-d-${questionCounter}" required placeholder="Option D">
                </div>
            </div>
            
            <div class="form-group">
                <label for="correct-answer-${questionCounter}">Correct Answer</label>
                <select id="correct-answer-${questionCounter}" required style="width: 100%; padding: var(--spacing-3); border: 2px solid var(--gray-200); border-radius: var(--radius-md);">
                    <option value="">Select correct answer</option>
                    <option value="a">Option A</option>
                    <option value="b">Option B</option>
                    <option value="c">Option C</option>
                    <option value="d">Option D</option>
                </select>
            </div>
        </div>
    `;
    
    questionsContainer.insertAdjacentHTML('beforeend', questionHtml);
}

function removeQuestion(questionId) {
    const questionElement = document.getElementById(`question-${questionId}`);
    if (questionElement) {
        questionElement.remove();
        showNotification('✅ Question removed', 'success');
    }
}

async function saveChapter() {
    const courseId = document.getElementById('chapterCourse').value;
    const chapterTitle = document.getElementById('chapterTitle').value;
    const chapterOrder = document.getElementById('chapterOrder').value;
    const chapterDescription = document.getElementById('chapterDescription').value;
    
    // Validation
    if (!courseId) {
        showNotification('❌ Please select a course', 'error');
        return;
    }
    
    if (!chapterTitle.trim()) {
        showNotification('❌ Chapter title is required', 'error');
        return;
    }
    
    if (!chapterOrder) {
        showNotification('❌ Chapter order is required', 'error');
        return;
    }
    
    // Collect questions
    const questions = [];
    const questionElements = document.querySelectorAll('.question-item');
    
    for (let element of questionElements) {
        const questionId = element.id.split('-')[1];
        const questionText = document.getElementById(`question-text-${questionId}`)?.value;
        const optionA = document.getElementById(`option-a-${questionId}`)?.value;
        const optionB = document.getElementById(`option-b-${questionId}`)?.value;
        const optionC = document.getElementById(`option-c-${questionId}`)?.value;
        const optionD = document.getElementById(`option-d-${questionId}`)?.value;
        const correctAnswer = document.getElementById(`correct-answer-${questionId}`)?.value;
        
        if (!questionText || !optionA || !optionB || !optionC || !optionD || !correctAnswer) {
            showNotification(`❌ Please complete all fields for Question ${questionId}`, 'error');
            return;
        }
        
        questions.push({
            id: questionId,
            question: questionText,
            options: {
                a: optionA,
                b: optionB,
                c: optionC,
                d: optionD
            },
            correctAnswer: correctAnswer
        });
    }
    
    try {
        // Create chapter object
        const chapter = {
            id: Date.now(),
            courseId: parseInt(courseId),
            title: chapterTitle,
            order: parseInt(chapterOrder),
            description: chapterDescription,
            questions: questions,
            status: 'active',
            createdAt: new Date().toISOString()
        };
        
        // Mock API call - replace with actual API
        const success = await saveChapterToServer(chapter);
        
        if (success) {
            adminData.chapters.push(chapter);
            showNotification('✅ Chapter saved successfully', 'success');
            hideAddChapterForm();
            loadChapters();
        } else {
            showNotification('❌ Failed to save chapter', 'error');
        }
        
    } catch (error) {
        console.error('Error saving chapter:', error);
        showNotification('❌ Error saving chapter', 'error');
    }
}

async function loadChapters() {
    try {
        // Mock data - replace with actual API call
        const chapters = await fetchChaptersFromServer();
        adminData.chapters = chapters;
        
        const tableBody = document.getElementById('chaptersTable');
        if (tableBody) {
            tableBody.innerHTML = chapters.map(chapter => {
                const course = adminData.courses.find(c => c.id === chapter.courseId);
                return `
                    <tr>
                        <td>${chapter.title}</td>
                        <td>${course ? course.name : 'Unknown'}</td>
                        <td>${chapter.order}</td>
                        <td>${chapter.questions.length}</td>
                        <td><span class="status-badge status-${chapter.status}">${chapter.status}</span></td>
                        <td>
                            <button class="btn-primary btn-table" onclick="editChapter(${chapter.id})">Edit</button>
                            <button class="btn-danger btn-table" onclick="deleteChapter(${chapter.id})">Delete</button>
                        </td>
                    </tr>
                `;
            }).join('');
        }
        
    } catch (error) {
        console.error('Error loading chapters:', error);
        showNotification('❌ Error loading chapters', 'error');
    }
}

function refreshChapters() {
    loadChapters();
    showNotification('🔄 Chapters refreshed', 'info');
}

function editChapter(chapterId) {
    showNotification(`Editing chapter ${chapterId}...`, 'info');
    // Implement edit functionality
}

function deleteChapter(chapterId) {
    if (confirm('Are you sure you want to delete this chapter? This action cannot be undone.')) {
        adminData.chapters = adminData.chapters.filter(chapter => chapter.id !== chapterId);
        loadChapters();
        showNotification('✅ Chapter deleted successfully', 'success');
    }
}

// ===== USER MANAGEMENT =====
async function loadUsers() {
    try {
        // Mock data - replace with actual API call
        const users = await fetchUsersFromServer();
        adminData.users = users;
        
        const tableBody = document.getElementById('usersTable');
        if (tableBody) {
            tableBody.innerHTML = users.map(user => `
                <tr>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>${new Date(user.joinDate).toLocaleDateString()}</td>
                    <td>${user.progress}%</td>
                    <td><span class="status-badge status-${user.status}">${user.status}</span></td>
                    <td>
                        <button class="btn-primary btn-table" onclick="viewUserDetails(${user.id})">View</button>
                        <button class="btn-danger btn-table" onclick="deleteUser(${user.id})">Delete</button>
                    </td>
                </tr>
            `).join('');
        }
        
    } catch (error) {
        console.error('Error loading users:', error);
        showNotification('❌ Error loading users', 'error');
    }
}

function refreshUsers() {
    loadUsers();
    showNotification('🔄 Users refreshed', 'info');
}

function exportUsers() {
    // Create CSV content
    const headers = ['Name', 'Email', 'Join Date', 'Progress', 'Status'];
    const csvContent = [
        headers.join(','),
        ...adminData.users.map(user => [
            user.name,
            user.email,
            new Date(user.joinDate).toLocaleDateString(),
            user.progress + '%',
            user.status
        ].join(','))
    ].join('\n');
    
    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lingualeap_users_' + new Date().toISOString().split('T')[0] + '.csv';
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('✅ User data exported successfully', 'success');
}

function viewUserDetails(userId) {
    const user = adminData.users.find(u => u.id === userId);
    if (user) {
        alert(`User Details:\nName: ${user.name}\nEmail: ${user.email}\nJoin Date: ${new Date(user.joinDate).toLocaleDateString()}\nProgress: ${user.progress}%\nStatus: ${user.status}`);
    }
}

function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        adminData.users = adminData.users.filter(user => user.id !== userId);
        loadUsers();
        showNotification('✅ User deleted successfully', 'success');
    }
}

// ===== ANALYTICS =====
function loadAnalytics() {
    showNotification('📈 Analytics loaded', 'info');
    // Implement analytics loading
}

// ===== SETTINGS =====
function clearAllData() {
    if (confirm('WARNING: This will delete ALL data including courses, chapters, and users. This action CANNOT be undone. Are you absolutely sure?')) {
        if (confirm('Please confirm again. This will permanently delete everything.')) {
            adminData = {
                courses: [],
                chapters: [],
                users: [],
                settings: {}
            };
            
            // Clear all tables
            ['coursesTable', 'chaptersTable', 'usersTable'].forEach(tableId => {
                const table = document.getElementById(tableId);
                if (table) table.innerHTML = '';
            });
            
            showNotification('⚠️ All data has been cleared', 'warning');
        }
    }
}

function resetPlatform() {
    if (confirm('This will reset the entire platform to default settings. Continue?')) {
        location.reload();
    }
}

// ===== API FUNCTIONS (Mock) =====
// Replace these with actual API calls to your server

async function saveCourseToServer(course) {
    // Mock API call
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('Course saved to server:', course);
            resolve(true);
        }, 500);
    });
    
    /* 
    // Actual API call example:
    try {
        const response = await fetch(`${API_BASE_URL}/courses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + sessionStorage.getItem('admin_token')
            },
            body: JSON.stringify(course)
        });
        return response.ok;
    } catch (error) {
        console.error('API Error:', error);
        return false;
    }
    */
}

async function fetchCoursesFromServer() {
    // Mock data
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                {
                    id: 1,
                    name: 'Spanish Basics',
                    description: 'Learn Spanish from scratch',
                    language: 'spanish',
                    chapters: 12,
                    students: 245,
                    status: 'active'
                },
                {
                    id: 2,
                    name: 'French Fundamentals',
                    description: 'Master French basics',
                    language: 'french',
                    chapters: 10,
                    students: 189,
                    status: 'active'
                },
                {
                    id: 3,
                    name: 'German Grammar',
                    description: 'Complete German grammar course',
                    language: 'german',
                    chapters: 15,
                    students: 156,
                    status: 'active'
                }
            ]);
        }, 300);
    });
}

async function saveChapterToServer(chapter) {
    // Mock API call
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('Chapter saved to server:', chapter);
            resolve(true);
        }, 500);
    });
}

async function fetchChaptersFromServer() {
    // Mock data
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                {
                    id: 1,
                    courseId: 1,
                    title: 'Introduction to Spanish',
                    order: 1,
                    description: 'Basic Spanish introduction',
                    questions: [
                        {
                            id: '1',
                            question: 'What does "Hola" mean?',
                            options: { a: 'Hello', b: 'Goodbye', c: 'Please', d: 'Thank you' },
                            correctAnswer: 'a'
                        }
                    ],
                    status: 'active'
                },
                {
                    id: 2,
                    courseId: 1,
                    title: 'Spanish Numbers',
                    order: 2,
                    description: 'Learning numbers in Spanish',
                    questions: [
                        {
                            id: '1',
                            question: 'How do you say "one" in Spanish?',
                            options: { a: 'dos', b: 'uno', c: 'tres', d: 'cuatro' },
                            correctAnswer: 'b'
                        }
                    ],
                    status: 'active'
                }
            ]);
        }, 300);
    });
}

async function fetchUsersFromServer() {
    // Mock data
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                {
                    id: 1,
                    name: 'John Doe',
                    email: 'john.doe@email.com',
                    joinDate: '2024-01-15T10:30:00Z',
                    progress: 75,
                    status: 'active'
                },
                {
                    id: 2,
                    name: 'Jane Smith',
                    email: 'jane.smith@email.com',
                    joinDate: '2024-02-20T14:15:00Z',
                    progress: 45,
                    status: 'active'
                },
                {
                    id: 3,
                    name: 'Mike Johnson',
                    email: 'mike.j@email.com',
                    joinDate: '2024-03-10T09:45:00Z',
                    progress: 90,
                    status: 'active'
                }
            ]);
        }, 300);
    });
}

// ===== UTILITY FUNCTIONS =====
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
    
    // Add notification styles if not already present
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
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
                min-width: 300px;
            }
            
            .notification-success { border-left-color: var(--success-color); }
            .notification-error { border-left-color: var(--error-color); }
            .notification-warning { border-left-color: var(--warning-color); }
            .notification-info { border-left-color: var(--primary-color); }
            
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
                margin-left: auto;
            }
            
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
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