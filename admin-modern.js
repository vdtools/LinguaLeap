// ===== LINGUALEAP ADMIN PANEL V4.0 =====

// Global variables
let adminAuth = null;
let adminDb = null;
let currentEditingChapter = null;
let quizQuestionCount = 0;

// Admin password
const ADMIN_PASSWORD = 'lingualeap2025';

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function() {
    console.log('🛡️ LinguaLeap Admin Panel V4.0 Starting...');
    
    // Initialize Firebase
    initializeAdminFirebase();
    
    // Set up event listeners
    setupAdminEventListeners();
    
    // Show password screen
    showPasswordScreen();
});

// Initialize Firebase for admin
function initializeAdminFirebase() {
    try {
        if (typeof firebase !== 'undefined') {
            adminAuth = firebase.auth();
            adminDb = firebase.firestore();
            console.log('✅ Admin Firebase initialized successfully');
        } else {
            console.error('❌ Firebase not loaded');
        }
    } catch (error) {
        console.error('❌ Admin Firebase initialization error:', error);
    }
}

// Set up admin event listeners
function setupAdminEventListeners() {
    // Password submission
    const submitPasswordBtn = document.getElementById('submitPassword');
    const passwordInput = document.getElementById('adminPassword');
    
    if (submitPasswordBtn) {
        submitPasswordBtn.addEventListener('click', handlePasswordSubmit);
    }
    
    if (passwordInput) {
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handlePasswordSubmit();
            }
        });
    }
    
    // Admin navigation
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', handleAdminNavigation);
    });
    
    // Course selection
    const courseSelect = document.getElementById('courseSelect');
    if (courseSelect) {
        courseSelect.addEventListener('change', handleCourseSelection);
    }
    
    // Add chapter form
    const chapterForm = document.getElementById('chapterForm');
    if (chapterForm) {
        chapterForm.addEventListener('submit', handleChapterSubmit);
    }
    
    // Cancel chapter form
    const cancelChapterBtn = document.getElementById('cancelChapter');
    const cancelFormBtn = document.getElementById('cancelForm');
    
    if (cancelChapterBtn) {
        cancelChapterBtn.addEventListener('click', hideChapt_form);
    }
    
    if (cancelFormBtn) {
        cancelFormBtn.addEventListener('click', hideChapterForm);
    }
    
    // Add quiz question
    const addQuizBtn = document.getElementById('addQuizQuestion');
    if (addQuizBtn) {
        addQuizBtn.addEventListener('click', addQuizQuestion);
    }
    
    // Refresh chapters
    const refreshBtn = document.getElementById('refreshChapters');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadChapters);
    }
    
    // Admin sign out
    const adminSignOutBtn = document.getElementById('adminSignOut');
    if (adminSignOutBtn) {
        adminSignOutBtn.addEventListener('click', handleAdminSignOut);
    }
    
    // Edit modal
    const closeEditModalBtn = document.getElementById('closeEditModal');
    const cancelEditBtn = document.getElementById('cancelEdit');
    const editForm = document.getElementById('editChapterForm');
    
    if (closeEditModalBtn) {
        closeEditModalBtn.addEventListener('click', closeEditModal);
    }
    
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', closeEditModal);
    }
    
    if (editForm) {
        editForm.addEventListener('submit', handleEditSubmit);
    }
}

// Show password screen
function showPasswordScreen() {
    const passwordScreen = document.getElementById('passwordScreen');
    const adminPanel = document.getElementById('adminPanel');
    
    if (passwordScreen) passwordScreen.style.display = 'flex';
    if (adminPanel) adminPanel.style.display = 'none';
}

// Show admin panel
function showAdminPanel() {
    const passwordScreen = document.getElementById('passwordScreen');
    const adminPanel = document.getElementById('adminPanel');
    
    if (passwordScreen) passwordScreen.style.display = 'none';
    if (adminPanel) adminPanel.style.display = 'flex';
    
    // Load initial data
    loadChapters();
}

// Handle password submission
function handlePasswordSubmit() {
    const passwordInput = document.getElementById('adminPassword');
    const errorDiv = document.getElementById('passwordError');
    
    if (!passwordInput || !errorDiv) return;
    
    const enteredPassword = passwordInput.value.trim();
    
    if (enteredPassword === ADMIN_PASSWORD) {
        console.log('✅ Admin password correct');
        showAdminPanel();
        showAdminNotification('Welcome to Admin Panel!', 'success');
    } else {
        console.log('❌ Incorrect admin password');
        errorDiv.textContent = 'Incorrect password. Please try again.';
        errorDiv.style.display = 'block';
        passwordInput.value = '';
        passwordInput.focus();
    }
}

// Handle admin navigation
function handleAdminNavigation(e) {
    e.preventDefault();
    
    const targetSection = e.currentTarget.dataset.section;
    if (!targetSection) return;
    
    // Remove active class from all nav items and sections
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
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
    
    // Update header title
    updateSectionHeader(targetSection);
    
    console.log(`📍 Admin navigated to: ${targetSection}`);
}

// Update section header
function updateSectionHeader(section) {
    const titleElement = document.getElementById('sectionTitle');
    const descriptionElement = document.getElementById('sectionDescription');
    
    const sections = {
        syllabus: {
            title: 'Syllabus Management',
            description: 'Manage courses, chapters, and learning content'
        },
        videos: {
            title: 'Video Library',
            description: 'Upload and manage video content'
        },
        users: {
            title: 'User Management',
            description: 'View and manage user accounts'
        },
        analytics: {
            title: 'Analytics',
            description: 'View platform statistics and insights'
        },
        settings: {
            title: 'Settings',
            description: 'Configure platform settings'
        }
    };
    
    if (sections[section]) {
        if (titleElement) titleElement.textContent = sections[section].title;
        if (descriptionElement) descriptionElement.textContent = sections[section].description;
    }
}

// Handle course selection
function handleCourseSelection(e) {
    const selectedCourse = e.target.value;
    const addChapterForm = document.getElementById('addChapterForm');
    
    if (selectedCourse && addChapterForm) {
        console.log(`📚 Course selected: ${selectedCourse}`);
        addChapterForm.style.display = 'block';
        
        // Reset form
        resetChapterForm();
        
        // Load chapters for selected course
        loadChapters(selectedCourse);
    } else if (addChapterForm) {
        addChapterForm.style.display = 'none';
    }
}

// Reset chapter form
function resetChapterForm() {
    const form = document.getElementById('chapterForm');
    if (form) {
        form.reset();
    }
    
    // Clear quiz questions
    const quizContainer = document.getElementById('quizQuestions');
    if (quizContainer) {
        quizContainer.innerHTML = '';
    }
    
    quizQuestionCount = 0;
}

// Hide chapter form
function hideChapterForm() {
    const addChapterForm = document.getElementById('addChapterForm');
    const courseSelect = document.getElementById('courseSelect');
    
    if (addChapterForm) {
        addChapterForm.style.display = 'none';
    }
    
    if (courseSelect) {
        courseSelect.value = '';
    }
    
    resetChapterForm();
}

// Add quiz question
function addQuizQuestion() {
    quizQuestionCount++;
    const quizContainer = document.getElementById('quizQuestions');
    
    if (!quizContainer) return;
    
    const questionHtml = `
        <div class="quiz-question" data-question="${quizQuestionCount}">
            <div class="question-header">
                <span class="question-number">Question ${quizQuestionCount}</span>
                <button type="button" class="remove-question" onclick="removeQuizQuestion(${quizQuestionCount})">
                    <i class="fas fa-trash"></i> Remove
                </button>
            </div>
            <div class="question-inputs">
                <input type="text" placeholder="Enter your question..." class="question-text" required>
                <div class="options-grid">
                    <input type="text" placeholder="Option A" class="option-input" data-option="a" required>
                    <input type="text" placeholder="Option B" class="option-input" data-option="b" required>
                    <input type="text" placeholder="Option C" class="option-input" data-option="c" required>
                    <input type="text" placeholder="Option D" class="option-input" data-option="d" required>
                </div>
                <select class="correct-answer" required>
                    <option value="">Select correct answer...</option>
                    <option value="a">Option A</option>
                    <option value="b">Option B</option>
                    <option value="c">Option C</option>
                    <option value="d">Option D</option>
                </select>
            </div>
        </div>
    `;
    
    quizContainer.insertAdjacentHTML('beforeend', questionHtml);
    
    console.log(`➕ Added quiz question ${quizQuestionCount}`);
}

// Remove quiz question
function removeQuizQuestion(questionNumber) {
    const questionElement = document.querySelector(`[data-question="${questionNumber}"]`);
    if (questionElement) {
        questionElement.remove();
        console.log(`➖ Removed quiz question ${questionNumber}`);
    }
}

// Handle chapter form submission
async function handleChapterSubmit(e) {
    e.preventDefault();
    
    if (!adminDb) {
        showAdminNotification('Database not initialized', 'error');
        return;
    }
    
    try {
        // Get form data
        const courseSelect = document.getElementById('courseSelect');
        const chapterTitle = document.getElementById('chapterTitle').value.trim();
        const chapterOrder = parseInt(document.getElementById('chapterOrder').value);
        const chapterDescription = document.getElementById('chapterDescription').value.trim();
        
        if (!courseSelect.value || !chapterTitle || !chapterOrder) {
            showAdminNotification('Please fill in all required fields', 'error');
            return;
        }
        
        // Collect quiz questions
        const quizQuestions = [];
        const questionElements = document.querySelectorAll('.quiz-question');
        
        questionElements.forEach((element, index) => {
            const questionText = element.querySelector('.question-text').value.trim();
            const options = {
                a: element.querySelector('[data-option="a"]').value.trim(),
                b: element.querySelector('[data-option="b"]').value.trim(),
                c: element.querySelector('[data-option="c"]').value.trim(),
                d: element.querySelector('[data-option="d"]').value.trim()
            };
            const correctAnswer = element.querySelector('.correct-answer').value;
            
            if (questionText && options.a && options.b && options.c && options.d && correctAnswer) {
                quizQuestions.push({
                    id: index + 1,
                    question: questionText,
                    options: options,
                    correctAnswer: correctAnswer
                });
            }
        });
        
        // Create chapter data
        const chapterData = {
            title: chapterTitle,
            order: chapterOrder,
            description: chapterDescription,
            course: courseSelect.value,
            quiz: quizQuestions,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        console.log('📝 Saving chapter data:', chapterData);
        
        // Save to Firestore
        const docRef = await adminDb.collection('chapters').add(chapterData);
        
        console.log('✅ Chapter saved with ID:', docRef.id);
        showAdminNotification('Chapter saved successfully!', 'success');
        
        // Reset form and reload chapters
        resetChapterForm();
        loadChapters(courseSelect.value);
        
    } catch (error) {
        console.error('❌ Error saving chapter:', error);
        showAdminNotification('Failed to save chapter. Please try again.', 'error');
    }
}

// Load chapters from database
async function loadChapters(courseFilter = null) {
    if (!adminDb) {
        console.error('❌ Database not initialized');
        return;
    }
    
    try {
        const chaptersList = document.getElementById('chaptersList');
        if (!chaptersList) return;
        
        // Show loading state
        chaptersList.innerHTML = `
            <div class="loading-state">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading chapters...</p>
            </div>
        `;
        
        // Build query
        let query = adminDb.collection('chapters').orderBy('order', 'asc');
        
        if (courseFilter) {
            query = query.where('course', '==', courseFilter);
        }
        
        const snapshot = await query.get();
        
        if (snapshot.empty) {
            chaptersList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-book-open"></i>
                    <p>No chapters found${courseFilter ? ` for ${courseFilter}` : ''}.</p>
                    <p>Create your first chapter above!</p>
                </div>
            `;
            return;
        }
        
        // Build chapters HTML
        let chaptersHtml = '';
        
        snapshot.forEach(doc => {
            const chapter = doc.data();
            const quizCount = chapter.quiz ? chapter.quiz.length : 0;
            
            chaptersHtml += `
                <div class="chapter-item" data-id="${doc.id}">
                    <div class="chapter-info">
                        <div class="chapter-title">${chapter.title}</div>
                        <div class="chapter-meta">
                            <span><i class="fas fa-bookmark"></i> ${chapter.course || 'No course'}</span>
                            <span><i class="fas fa-sort-numeric-up"></i> Order: ${chapter.order || 'N/A'}</span>
                            <span><i class="fas fa-question-circle"></i> ${quizCount} quiz questions</span>
                        </div>
                    </div>
                    <div class="chapter-actions">
                        <button class="edit-btn" onclick="editChapter('${doc.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="delete-btn" onclick="deleteChapter('${doc.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;
        });
        
        chaptersList.innerHTML = chaptersHtml;
        
        console.log(`✅ Loaded ${snapshot.size} chapters`);
        
    } catch (error) {
        console.error('❌ Error loading chapters:', error);
        
        const chaptersList = document.getElementById('chaptersList');
        if (chaptersList) {
            chaptersList.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error loading chapters.</p>
                    <button onclick="loadChapters()" class="refresh-btn">Try Again</button>
                </div>
            `;
        }
    }
}

// Edit chapter
async function editChapter(chapterId) {
    if (!adminDb || !chapterId) return;
    
    try {
        console.log(`✏️ Editing chapter: ${chapterId}`);
        
        // Get chapter data
        const chapterDoc = await adminDb.collection('chapters').doc(chapterId).get();
        
        if (!chapterDoc.exists) {
            showAdminNotification('Chapter not found', 'error');
            return;
        }
        
        const chapterData = chapterDoc.data();
        currentEditingChapter = chapterId;
        
        // Populate edit form
        document.getElementById('editChapterTitle').value = chapterData.title || '';
        document.getElementById('editChapterOrder').value = chapterData.order || '';
        document.getElementById('editChapterDescription').value = chapterData.description || '';
        
        // Show edit modal
        const editModal = document.getElementById('editModal');
        if (editModal) {
            editModal.style.display = 'flex';
        }
        
    } catch (error) {
        console.error('❌ Error loading chapter for edit:', error);
        showAdminNotification('Failed to load chapter data', 'error');
    }
}

// Handle edit form submission
async function handleEditSubmit(e) {
    e.preventDefault();
    
    if (!adminDb || !currentEditingChapter) {
        showAdminNotification('No chapter selected for editing', 'error');
        return;
    }
    
    try {
        const title = document.getElementById('editChapterTitle').value.trim();
        const order = parseInt(document.getElementById('editChapterOrder').value);
        const description = document.getElementById('editChapterDescription').value.trim();
        
        if (!title || !order) {
            showAdminNotification('Please fill in all required fields', 'error');
            return;
        }
        
        const updateData = {
            title: title,
            order: order,
            description: description,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await adminDb.collection('chapters').doc(currentEditingChapter).update(updateData);
        
        console.log('✅ Chapter updated successfully');
        showAdminNotification('Chapter updated successfully!', 'success');
        
        closeEditModal();
        loadChapters();
        
    } catch (error) {
        console.error('❌ Error updating chapter:', error);
        showAdminNotification('Failed to update chapter', 'error');
    }
}

// Close edit modal
function closeEditModal() {
    const editModal = document.getElementById('editModal');
    if (editModal) {
        editModal.style.display = 'none';
    }
    
    currentEditingChapter = null;
    
    // Clear form
    document.getElementById('editChapterTitle').value = '';
    document.getElementById('editChapterOrder').value = '';
    document.getElementById('editChapterDescription').value = '';
}

// Delete chapter
async function deleteChapter(chapterId) {
    if (!adminDb || !chapterId) return;
    
    const confirmed = confirm('Are you sure you want to delete this chapter? This action cannot be undone.');
    
    if (!confirmed) return;
    
    try {
        console.log(`🗑️ Deleting chapter: ${chapterId}`);
        
        await adminDb.collection('chapters').doc(chapterId).delete();
        
        console.log('✅ Chapter deleted successfully');
        showAdminNotification('Chapter deleted successfully!', 'success');
        
        loadChapters();
        
    } catch (error) {
        console.error('❌ Error deleting chapter:', error);
        showAdminNotification('Failed to delete chapter', 'error');
    }
}

// Handle admin sign out
function handleAdminSignOut() {
    const confirmed = confirm('Are you sure you want to sign out of the admin panel?');
    
    if (confirmed) {
        console.log('🔐 Admin signing out...');
        showPasswordScreen();
        
        // Clear password field
        const passwordInput = document.getElementById('adminPassword');
        if (passwordInput) {
            passwordInput.value = '';
        }
        
        showAdminNotification('Signed out successfully', 'success');
    }
}

// Show admin notification
function showAdminNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `admin-notification admin-notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
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
        max-width: 400px;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Make functions globally available
window.editChapter = editChapter;
window.deleteChapter = deleteChapter;
window.removeQuizQuestion = removeQuizQuestion;
window.loadChapters = loadChapters;

console.log('🛡️ LinguaLeap Admin Panel V4.0 initialized!');
