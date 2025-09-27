// Admin Panel JavaScript
// Admin Authentication System
const ADMIN_PASSWORD = 'lingualeap2025'; // Change this to your desired password
const AUTH_COOKIE_NAME = 'lingualeap_admin_auth';

let currentTab = 'lessons';
let allLessons = {};
let allUsers = {};

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    if (isAdminAuthenticated()) {
        hideAuthModal();
        initializeAdminPanel();
    } else {
        showAuthModal();
    }
});

// Authentication Functions
function isAdminAuthenticated() {
    const authCookie = getCookie(AUTH_COOKIE_NAME);
    return authCookie === 'authenticated';
}

function authenticateAdmin() {
    const password = document.getElementById('adminPassword').value;
    const errorDiv = document.getElementById('authError');
    
    if (password === ADMIN_PASSWORD) {
        // Set cookie for 7 days
        setCookie(AUTH_COOKIE_NAME, 'authenticated', 7);
        hideAuthModal();
        initializeAdminPanel();
        showAlert('🎉 Admin access granted!', 'success');
    } else {
        errorDiv.style.display = 'block';
        document.getElementById('adminPassword').value = '';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 3000);
    }
}

function showAuthModal() {
    document.getElementById('adminAuthModal').style.display = 'flex';
    // Hide main content
    const header = document.querySelector('.admin-header');
    const container = document.querySelector('.admin-container');
    if (header) header.style.display = 'none';
    if (container) container.style.display = 'none';
}

function hideAuthModal() {
    document.getElementById('adminAuthModal').style.display = 'none';
    // Show main content
    const header = document.querySelector('.admin-header');
    const container = document.querySelector('.admin-container');
    if (header) header.style.display = 'block';
    if (container) container.style.display = 'block';
}

// Cookie utility functions
function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// Logout function
function adminLogout() {
    setCookie(AUTH_COOKIE_NAME, '', -1); // Delete cookie
    location.reload(); // Reload page to show auth modal
}

// Initialize Admin Panel (renamed from original initializeAdmin)
function initializeAdminPanel() {
    console.log('🛠️ Admin Panel Loading...');
    
    // Wait for Firebase to be ready
    setTimeout(() => {
        if (window.firebaseUtils) {
            initializeAdmin();
        } else {
            showAlert('Firebase not initialized properly!', 'error');
        }
    }, 1000);
}

// Add Enter key support for password
document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && document.getElementById('adminAuthModal').style.display === 'flex') {
        authenticateAdmin();
    }
});

// Initialize Admin Functions
async function initializeAdmin() {
    console.log('🚀 Initializing Admin Panel...');
    
    // Setup tab navigation
    setupTabNavigation();
    
    // Load initial data
    await loadAllData();
    
    // Update Firebase config display
    updateFirebaseConfig();
    
    console.log('✅ Admin Panel Ready!');
}

// Tab Navigation
function setupTabNavigation() {
    const tabs = document.querySelectorAll('.admin-tab');
    const panels = document.querySelectorAll('.admin-panel');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Update active panel
            panels.forEach(p => p.classList.remove('active'));
            document.getElementById(`${tabName}-panel`).classList.add('active');
            
            currentTab = tabName;
            
            // Load tab-specific data
            loadTabData(tabName);
        });
    });
}

// Load data based on current tab
async function loadTabData(tabName) {
    switch(tabName) {
        case 'syllabus':
            await loadSyllabusData();
            break;
        case 'videos':
            await loadVideosData();
            break;
        case 'users':
            await loadUsersData();
            break;
        case 'analytics':
            await loadAnalyticsData();
            break;
        case 'apikeys':
            await loadAPIKeysData();
            break;
        case 'settings':
            await loadSettingsData();
            break;
    }
}

// Load all initial data
async function loadAllData() {
    await loadSyllabusData();
    await loadVideosData();
    await loadUsersData();
}

// ===== LESSONS MANAGEMENT =====

async function loadLessonsData() {
    console.log('📚 Loading lessons data...');
    
    try {
        // Load lessons from Firebase
        const beginnerLessons = await window.firebaseUtils.fetchData('lessons', 'beginnerJourney');
        const grammarLessons = await window.firebaseUtils.fetchData('lessons', 'grammarDeepDive');
        
        allLessons = {
            beginnerJourney: beginnerLessons || {},
            grammarDeepDive: grammarLessons || {}
        };
        
        displayLessons();
        updateContentEditor();
        
    } catch (error) {
        console.error('Error loading lessons:', error);
        showAlert('Failed to load lessons data', 'error');
    }
}

function displayLessons() {
    const container = document.getElementById('lessons-list');
    let html = '';
    
    Object.keys(allLessons).forEach(courseType => {
        const lessons = allLessons[courseType];
        const courseTitle = courseType === 'beginnerJourney' ? "Beginner's Journey" : "Grammar Deep Dive";
        
        html += `<h4>${courseTitle}</h4>`;
        
        if (lessons && Object.keys(lessons).length > 0) {
            Object.keys(lessons).forEach(lessonId => {
                const lesson = lessons[lessonId];
                html += `
                    <div style="border: 1px solid #e9ecef; padding: 1rem; margin: 0.5rem 0; border-radius: 8px;">
                        <h5>${lesson.title || lessonId}</h5>
                        <p>${lesson.description || 'No description'}</p>
                        <small>Level: ${lesson.difficulty || 'Not set'} | Duration: ${lesson.duration || 'Not set'} min</small>
                        <div style="margin-top: 0.5rem;">
                            <button class="btn" style="padding: 0.25rem 0.75rem; font-size: 0.875rem;" onclick="editLesson('${courseType}', '${lessonId}')">Edit</button>
                            <button class="btn btn-danger" style="padding: 0.25rem 0.75rem; font-size: 0.875rem;" onclick="deleteLesson('${courseType}', '${lessonId}')">Delete</button>
                        </div>
                    </div>
                `;
            });
        } else {
            html += `<p style="color: #666; font-style: italic;">No lessons found. Create your first lesson!</p>`;
        }
    });
    
    container.innerHTML = html;
}

async function addLesson() {
    const courseType = document.getElementById('courseType').value;
    const lessonId = document.getElementById('lessonId').value.trim();
    const title = document.getElementById('lessonTitle').value.trim();
    const description = document.getElementById('lessonDescription').value.trim();
    const difficulty = document.getElementById('difficultyLevel').value;
    const duration = document.getElementById('estimatedDuration').value;
    
    if (!lessonId || !title) {
        showAlert('Please fill in Lesson ID and Title', 'error');
        return;
    }
    
    try {
        const lessonData = {
            title,
            description,
            difficulty,
            duration: parseInt(duration),
            createdAt: new Date().toISOString(),
            status: 'active',
            content: {
                sections: []
            }
        };
        
        // Update local data
        if (!allLessons[courseType]) {
            allLessons[courseType] = {};
        }
        allLessons[courseType][lessonId] = lessonData;
        
        // Save to Firebase
        await window.firebaseUtils.uploadData('lessons', courseType, allLessons[courseType]);
        
        // Clear form
        document.getElementById('lessonId').value = '';
        document.getElementById('lessonTitle').value = '';
        document.getElementById('lessonDescription').value = '';
        
        // Refresh display
        displayLessons();
        updateContentEditor();
        
        showAlert('Lesson added successfully!', 'success');
        
    } catch (error) {
        console.error('Error adding lesson:', error);
        showAlert('Failed to add lesson', 'error');
    }
}

async function deleteLesson(courseType, lessonId) {
    if (!confirm(`Are you sure you want to delete lesson "${lessonId}"?`)) return;
    
    try {
        delete allLessons[courseType][lessonId];
        await window.firebaseUtils.uploadData('lessons', courseType, allLessons[courseType]);
        
        displayLessons();
        updateContentEditor();
        showAlert('Lesson deleted successfully!', 'success');
        
    } catch (error) {
        console.error('Error deleting lesson:', error);
        showAlert('Failed to delete lesson', 'error');
    }
}

// Load Sample Data
async function loadSampleData() {
    if (!confirm('This will create sample lessons. Continue?')) return;
    
    try {
        const sampleData = {
            beginnerJourney: {
                'bj-1': {
                    title: 'Greetings & Introductions',
                    description: 'Learn how to say hello, introduce yourself, and basic polite expressions.',
                    difficulty: 'beginner',
                    duration: 15,
                    status: 'active',
                    content: {
                        sections: [
                            {
                                type: 'vocabulary',
                                title: 'Key Vocabulary',
                                items: [
                                    { word: 'Hello', meaning: 'A greeting', example: 'Hello, how are you?' },
                                    { word: 'Hi', meaning: 'Informal greeting', example: 'Hi there!' },
                                    { word: 'Goodbye', meaning: 'A farewell', example: 'Goodbye, see you later!' }
                                ]
                            },
                            {
                                type: 'exercise',
                                title: 'Practice Exercise',
                                questions: [
                                    {
                                        question: 'How do you say hello in English?',
                                        options: ['Hello', 'Goodbye', 'Please', 'Thank you'],
                                        correct: 0
                                    }
                                ]
                            }
                        ]
                    }
                },
                'bj-2': {
                    title: 'Numbers & Counting',
                    description: 'Learn numbers from 1 to 100 and basic counting.',
                    difficulty: 'beginner',
                    duration: 20,
                    status: 'active',
                    content: {
                        sections: [
                            {
                                type: 'vocabulary',
                                title: 'Numbers 1-10',
                                items: [
                                    { word: 'One', meaning: '1', example: 'I have one apple.' },
                                    { word: 'Two', meaning: '2', example: 'Two cats are playing.' },
                                    { word: 'Three', meaning: '3', example: 'Three books on the table.' }
                                ]
                            }
                        ]
                    }
                }
            },
            grammarDeepDive: {
                'gdd-1': {
                    title: 'Present Tense Basics',
                    description: 'Master the present simple tense and its usage.',
                    difficulty: 'intermediate',
                    duration: 25,
                    status: 'active',
                    content: {
                        sections: [
                            {
                                type: 'grammar_rule',
                                title: 'Present Simple Structure',
                                content: 'Subject + Verb (+ s for 3rd person singular) + Object'
                            },
                            {
                                type: 'exercise',
                                title: 'Grammar Exercise',
                                questions: [
                                    {
                                        question: 'Choose the correct form: She _____ to school.',
                                        options: ['go', 'goes', 'going', 'went'],
                                        correct: 1
                                    }
                                ]
                            }
                        ]
                    }
                }
            }
        };
        
        // Save to Firebase
        await window.firebaseUtils.uploadData('lessons', 'beginnerJourney', sampleData.beginnerJourney);
        await window.firebaseUtils.uploadData('lessons', 'grammarDeepDive', sampleData.grammarDeepDive);
        
        // Update local data
        allLessons = sampleData;
        
        // Refresh display
        displayLessons();
        updateContentEditor();
        
        showAlert('Sample data loaded successfully!', 'success');
        
    } catch (error) {
        console.error('Error loading sample data:', error);
        showAlert('Failed to load sample data', 'error');
    }
}

// ===== CONTENT EDITOR =====

function updateContentEditor() {
    const select = document.getElementById('editLessonSelect');
    select.innerHTML = '<option value="">Choose a lesson...</option>';
    
    Object.keys(allLessons).forEach(courseType => {
        const lessons = allLessons[courseType];
        if (lessons) {
            Object.keys(lessons).forEach(lessonId => {
                const lesson = lessons[lessonId];
                const courseTitle = courseType === 'beginnerJourney' ? "Beginner's Journey" : "Grammar Deep Dive";
                select.innerHTML += `<option value="${courseType}:${lessonId}">${courseTitle}: ${lesson.title}</option>`;
            });
        }
    });
}

async function loadContentEditor() {
    updateContentEditor();
    
    const select = document.getElementById('editLessonSelect');
    select.addEventListener('change', function() {
        if (this.value) {
            const [courseType, lessonId] = this.value.split(':');
            const lesson = allLessons[courseType][lessonId];
            const editor = document.getElementById('contentEditor');
            editor.textContent = JSON.stringify(lesson.content, null, 2);
        }
    });
}

async function updateLessonContent() {
    const select = document.getElementById('editLessonSelect');
    if (!select.value) {
        showAlert('Please select a lesson to edit', 'error');
        return;
    }
    
    const [courseType, lessonId] = select.value.split(':');
    const editor = document.getElementById('contentEditor');
    
    try {
        const content = JSON.parse(editor.textContent);
        allLessons[courseType][lessonId].content = content;
        
        await window.firebaseUtils.uploadData('lessons', courseType, allLessons[courseType]);
        showAlert('Content updated successfully!', 'success');
        
    } catch (error) {
        console.error('Error updating content:', error);
        showAlert('Invalid JSON format or update failed', 'error');
    }
}

function previewContent() {
    const editor = document.getElementById('contentEditor');
    try {
        const content = JSON.parse(editor.textContent);
        console.log('📝 Content Preview:', content);
        showAlert('Content is valid! Check console for preview.', 'success');
    } catch (error) {
        showAlert('Invalid JSON format', 'error');
    }
}

// ===== USERS MANAGEMENT =====

async function loadUsersData() {
    console.log('👥 Loading users data...');
    
    try {
        // This would typically fetch from a users collection
        // For now, we'll show placeholder data
        document.getElementById('totalUsers').textContent = '0';
        document.getElementById('activeToday').textContent = '0';
        
        const tbody = document.getElementById('users-table-body');
        tbody.innerHTML = '<tr><td colspan="6">No user data available. Users will appear here after they sign up.</td></tr>';
        
    } catch (error) {
        console.error('Error loading users:', error);
        showAlert('Failed to load users data', 'error');
    }
}

// ===== ANALYTICS =====

async function loadAnalyticsData() {
    console.log('📊 Loading analytics data...');
    
    try {
        document.getElementById('totalCompletions').textContent = '0';
        document.getElementById('averageCompletion').textContent = '0%';
        
        const tbody = document.getElementById('analytics-table-body');
        tbody.innerHTML = '<tr><td colspan="4">No analytics data available yet.</td></tr>';
        
    } catch (error) {
        console.error('Error loading analytics:', error);
        showAlert('Failed to load analytics data', 'error');
    }
}

// ===== SETTINGS =====

async function loadSettingsData() {
    updateFirebaseConfig();
    await checkSystemStatus();
}

function updateFirebaseConfig() {
    // This would be populated from firebase-config.js
    const projectIdField = document.getElementById('projectId');
    if (window.firebaseUtils && window.firebaseUtils.db) {
        projectIdField.value = window.firebaseUtils.db.app.options.projectId || 'Not available';
    }
}

async function checkSystemStatus() {
    const container = document.getElementById('system-status');
    let html = '<h4>System Health Check</h4>';
    
    try {
        // Test Firebase connection
        await window.firebaseUtils.testFirebaseConnection();
        html += '<p style="color: green;">✅ Firebase Connection: OK</p>';
        
        // Check lessons data
        const lessonsCount = Object.keys(allLessons.beginnerJourney || {}).length + Object.keys(allLessons.grammarDeepDive || {}).length;
        html += `<p style="color: green;">✅ Lessons Loaded: ${lessonsCount} lessons</p>`;
        
        html += '<p style="color: green;">✅ System Status: All systems operational</p>';
        
    } catch (error) {
        html += '<p style="color: red;">❌ System Error: ' + error.message + '</p>';
    }
    
    container.innerHTML = html;
}

async function testConnection() {
    try {
        await window.firebaseUtils.testFirebaseConnection();
        showAlert('Connection test successful!', 'success');
    } catch (error) {
        showAlert('Connection test failed: ' + error.message, 'error');
    }
}

async function backupData() {
    try {
        const data = {
            lessons: allLessons,
            timestamp: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `lingualeap-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        showAlert('Data backup downloaded!', 'success');
        
    } catch (error) {
        console.error('Error backing up data:', error);
        showAlert('Backup failed', 'error');
    }
}

async function clearAllData() {
    if (!confirm('⚠️ This will DELETE ALL lessons data. Are you absolutely sure?')) return;
    if (!confirm('⚠️ This action cannot be undone. Type YES in the next prompt to confirm.')) return;
    
    const confirmation = prompt('Type "DELETE ALL DATA" to confirm:');
    if (confirmation !== 'DELETE ALL DATA') {
        showAlert('Deletion cancelled', 'success');
        return;
    }
    
    try {
        await window.firebaseUtils.uploadData('lessons', 'beginnerJourney', {});
        await window.firebaseUtils.uploadData('lessons', 'grammarDeepDive', {});
        
        allLessons = { beginnerJourney: {}, grammarDeepDive: {} };
        displayLessons();
        updateContentEditor();
        
        showAlert('All data cleared successfully', 'success');
        
    } catch (error) {
        console.error('Error clearing data:', error);
        showAlert('Failed to clear data', 'error');
    }
}

// ===== API KEYS MANAGEMENT =====

async function loadAPIKeysData() {
    console.log('🔑 Loading API keys data...');
    
    // Load saved API keys and update UI
    const savedKeys = localStorage.getItem('lingualeap_api_keys');
    if (savedKeys) {
        const keys = JSON.parse(savedKeys);
        
        // Update input fields (but keep them masked)
        if (keys.openrouter1) {
            document.getElementById('openrouter1Key').value = '••••••••••••••••';
            addAPIStatus('openrouter1Key', 'connected');
        }
        
        if (keys.openrouter2) {
            document.getElementById('openrouter2Key').value = '••••••••••••••••';
            addAPIStatus('openrouter2Key', 'connected');
        }
        
        if (keys.gemini1) {
            document.getElementById('gemini1Key').value = '••••••••••••••••';
            addAPIStatus('gemini1Key', 'connected');
        }
        
        if (keys.gemini2) {
            document.getElementById('gemini2Key').value = '••••••••••••••••';
            addAPIStatus('gemini2Key', 'connected');
        }
    }
}

function addAPIStatus(inputId, status) {
    const input = document.getElementById(inputId);
    const parent = input.parentElement;
    
    // Remove existing status
    const existingStatus = parent.querySelector('.api-status');
    if (existingStatus) {
        existingStatus.remove();
    }
    
    // Add new status
    const statusDiv = document.createElement('div');
    statusDiv.className = `api-status ${status}`;
    
    const statusTexts = {
        'connected': '✅ Connected',
        'disconnected': '❌ Not Connected',
        'testing': '🧪 Testing...'
    };
    
    statusDiv.textContent = statusTexts[status];
    parent.appendChild(statusDiv);
}

function saveAPIKey(keyType) {
    const inputId = `${keyType}Key`;
    const input = document.getElementById(inputId);
    const key = input.value.trim();
    
    if (!key || key === '••••••••••••••••') {
        showAlert('Please enter a valid API key', 'error');
        return;
    }
    
    try {
        // Load existing keys
        const savedKeys = localStorage.getItem('lingualeap_api_keys');
        const keys = savedKeys ? JSON.parse(savedKeys) : {};
        
        // Update the specific key
        keys[keyType] = key;
        
        // Save back to localStorage
        localStorage.setItem('lingualeap_api_keys', JSON.stringify(keys));
        
        // Update UI
        input.value = '••••••••••••••••';
        addAPIStatus(inputId, 'connected');
        
        showAlert(`${getKeyDisplayName(keyType)} saved successfully!`, 'success');
        
    } catch (error) {
        console.error('Error saving API key:', error);
        showAlert('Failed to save API key', 'error');
    }
}

async function testAPIKey(keyType) {
    const inputId = `${keyType}Key`;
    const input = document.getElementById(inputId);
    
    // Get the actual key from storage or input
    let key = input.value.trim();
    
    if (key === '••••••••••••••••') {
        // Key is masked, get from storage
        const savedKeys = localStorage.getItem('lingualeap_api_keys');
        if (savedKeys) {
            const keys = JSON.parse(savedKeys);
            key = keys[keyType];
        }
    }
    
    if (!key) {
        showAlert('No API key found to test', 'error');
        return;
    }
    
    // Update status to testing
    addAPIStatus(inputId, 'testing');
    
    try {
        if (keyType.startsWith('openrouter')) {
            await testOpenRouterKey(key);
        } else if (keyType.startsWith('gemini')) {
            await testGeminiKey(key);
        }
        
        addAPIStatus(inputId, 'connected');
        showAlert(`${getKeyDisplayName(keyType)} test successful! ✅`, 'success');
        
    } catch (error) {
        console.error('API key test failed:', error);
        addAPIStatus(inputId, 'disconnected');
        showAlert(`${getKeyDisplayName(keyType)} test failed: ${error.message}`, 'error');
    }
}

async function testOpenRouterKey(apiKey) {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin,
            'X-Title': 'LinguaLeap Test'
        },
        body: JSON.stringify({
            model: 'anthropic/claude-3-haiku',
            messages: [{ role: 'user', content: 'Test message' }],
            max_tokens: 10
        })
    });
    
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    if (!data.choices || !data.choices[0]) {
        throw new Error('Invalid response format');
    }
}

async function testGeminiKey(apiKey) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents: [{ parts: [{ text: 'Test message' }] }],
            generationConfig: { maxOutputTokens: 10 }
        })
    });
    
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    if (!data.candidates || !data.candidates[0]) {
        throw new Error('Invalid response format');
    }
}

function getKeyDisplayName(keyType) {
    const names = {
        'openrouter1': 'OpenRouter API Key 1',
        'openrouter2': 'OpenRouter API Key 2',
        'gemini1': 'Gemini API Key',
        'gemini2': 'Gemini API Key 2 (Backup)'
    };
    return names[keyType] || keyType;
}

function clearAllAPIKeys() {
    if (!confirm('⚠️ This will delete ALL saved API keys. Are you sure?')) return;
    if (!confirm('This action cannot be undone. Continue?')) return;
    
    try {
        localStorage.removeItem('lingualeap_api_keys');
        
        // Clear all input fields
        ['openrouter1Key', 'openrouter2Key', 'gemini1Key', 'gemini2Key'].forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.value = '';
                addAPIStatus(id, 'disconnected');
            }
        });
        
        showAlert('All API keys cleared successfully', 'success');
        
    } catch (error) {
        console.error('Error clearing API keys:', error);
        showAlert('Failed to clear API keys', 'error');
    }
}

function exportAPIKeys() {
    try {
        const savedKeys = localStorage.getItem('lingualeap_api_keys');
        if (!savedKeys) {
            showAlert('No API keys found to export', 'error');
            return;
        }
        
        const data = {
            keys: JSON.parse(savedKeys),
            timestamp: new Date().toISOString(),
            app: 'LinguaLeap'
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `lingualeap-api-keys-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        showAlert('API keys exported successfully! Keep this file secure.', 'success');
        
    } catch (error) {
        console.error('Error exporting API keys:', error);
        showAlert('Failed to export API keys', 'error');
    }
}

function importAPIKeys() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                
                if (!data.keys || !data.app || data.app !== 'LinguaLeap') {
                    throw new Error('Invalid backup file format');
                }
                
                if (!confirm('This will replace your current API keys. Continue?')) return;
                
                localStorage.setItem('lingualeap_api_keys', JSON.stringify(data.keys));
                
                // Reload the API keys display
                loadAPIKeysData();
                
                showAlert('API keys imported successfully!', 'success');
                
            } catch (error) {
                console.error('Error importing API keys:', error);
                showAlert('Failed to import API keys: ' + error.message, 'error');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

// ===== UTILITY FUNCTIONS =====

function showAlert(message, type = 'success') {
    const container = document.getElementById('alert-container');
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        ${message}
        <button onclick="this.parentElement.remove()" style="float: right; background: none; border: none; font-size: 1.2rem; cursor: pointer;">&times;</button>
    `;
    
    container.appendChild(alert);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alert.parentElement) {
            alert.remove();
        }
    }, 5000);
}

// ===== SYLLABUS MANAGEMENT =====

async function loadSyllabusData() {
    console.log('📚 Loading syllabus data...');
    
    try {
        // Load syllabus from Firebase
        const beginnerSyllabus = await window.firebaseUtils.fetchData('syllabus', 'beginnerJourney');
        const grammarSyllabus = await window.firebaseUtils.fetchData('syllabus', 'grammarDeepDive');
        
        allLessons = {
            beginnerJourney: beginnerSyllabus || {},
            grammarDeepDive: grammarSyllabus || {}
        };
        
        displaySyllabusData();
        
    } catch (error) {
        console.error('Error loading syllabus:', error);
        document.getElementById('syllabus-list').innerHTML = 
            '<p style="color: red;">❌ Error loading syllabus data</p>';
    }
}

function displaySyllabusData() {
    const courseType = document.getElementById('viewCourseType').value;
    const syllabusList = document.getElementById('syllabus-list');
    const syllabusData = allLessons[courseType];
    
    if (!syllabusData || Object.keys(syllabusData).length === 0) {
        syllabusList.innerHTML = '<p>No syllabus data found. Add some chapters to get started!</p>';
        return;
    }
    
    let html = '<h4>📖 Course Structure</h4>';
    
    if (syllabusData.chapters) {
        Object.keys(syllabusData.chapters).forEach(chapterId => {
            const chapter = syllabusData.chapters[chapterId];
            html += `
                <div class="syllabus-item" style="border: 1px solid #ddd; margin: 0.5rem 0; padding: 1rem; border-radius: 6px;">
                    <h5>${chapter.title || chapterId}</h5>
                    <p><strong>Description:</strong> ${chapter.description || 'No description'}</p>
                    <p><strong>Difficulty:</strong> ${chapter.difficulty || 'Not specified'}</p>
                    <p><strong>Time:</strong> ${chapter.estimatedTime || 'Not specified'} minutes</p>
                    ${chapter.lessons ? `<p><strong>Sub-lessons:</strong> ${Object.keys(chapter.lessons).length} items</p>` : ''}
                    <button class="btn btn-danger" onclick="deleteChapter('${courseType}', '${chapterId}')">🗑️ Delete</button>
                    <button class="btn" onclick="editChapter('${courseType}', '${chapterId}')">✏️ Edit</button>
                </div>
            `;
        });
    }
    
    syllabusList.innerHTML = html;
}

async function saveChapter() {
    const courseType = document.getElementById('courseType').value;
    const partNumber = document.getElementById('partNumber').value;
    const partTitle = document.getElementById('partTitle').value;
    const chapterNumber = document.getElementById('chapterNumber').value;
    const chapterTitle = document.getElementById('chapterTitle').value;
    const description = document.getElementById('chapterDescription').value;
    const difficulty = document.getElementById('chapterDifficulty').value;
    const estimatedTime = document.getElementById('estimatedTime').value;
    const subLessonsText = document.getElementById('subLessons').value;
    
    if (!chapterNumber || !chapterTitle) {
        showAlert('Please fill in Chapter Number and Title!', 'error');
        return;
    }
    
    // Create chapter ID
    const chapterId = `part${partNumber}-chapter${chapterNumber}`;
    
    // Parse sub-lessons
    const lessons = {};
    if (subLessonsText.trim()) {
        const lessonLines = subLessonsText.split('\n').filter(line => line.trim());
        lessonLines.forEach((line, index) => {
            const lessonId = `${chapterId}-lesson${index + 1}`;
            lessons[lessonId] = {
                title: line.trim(),
                content: "Content will be added soon...",
                order: index + 1
            };
        });
    }
    
    const chapterData = {
        title: chapterTitle,
        description: description,
        difficulty: difficulty,
        estimatedTime: parseInt(estimatedTime) || 30,
        partTitle: partTitle,
        partNumber: parseInt(partNumber) || 1,
        lessons: lessons,
        createdAt: new Date().toISOString()
    };
    
    try {
        // Save to Firebase
        const syllabusPath = `syllabus/${courseType}/chapters/${chapterId}`;
        await window.firebaseUtils.saveData(syllabusPath, chapterData);
        
        showAlert('✅ Chapter saved successfully!', 'success');
        
        // Clear form
        document.getElementById('partNumber').value = '';
        document.getElementById('partTitle').value = '';
        document.getElementById('chapterNumber').value = '';
        document.getElementById('chapterTitle').value = '';
        document.getElementById('chapterDescription').value = '';
        document.getElementById('estimatedTime').value = '';
        document.getElementById('subLessons').value = '';
        
        // Reload data
        await loadSyllabusData();
        
    } catch (error) {
        console.error('Error saving chapter:', error);
        showAlert('❌ Error saving chapter: ' + error.message, 'error');
    }
}

async function loadSampleSyllabus() {
    if (!confirm('This will add sample syllabus data. Continue?')) return;
    
    const sampleData = {
        title: "Beginner's Journey",
        description: "Complete English learning journey for beginners",
        chapters: {
            "part1-chapter1.1": {
                title: "The Alphabet & Sounds",
                description: "Learn English alphabet, vowels, consonants and basic phonics",
                difficulty: "Beginner",
                estimatedTime: 30,
                partTitle: "Basic Foundation (Neenv)",
                partNumber: 1,
                lessons: {
                    "part1-chapter1.1-lesson1": {
                        title: "Uppercase & Lowercase Letters (A-Z, a-z)",
                        content: "Learn to recognize and write uppercase and lowercase letters",
                        order: 1
                    },
                    "part1-chapter1.1-lesson2": {
                        title: "Vowels & Consonants ki Pehchan",
                        content: "Identify and differentiate between vowels and consonants",
                        order: 2
                    },
                    "part1-chapter1.1-lesson3": {
                        title: "Vowel Sounds (Short 'a' in cat, Long 'a' in cake)",
                        content: "Practice short and long vowel sounds with examples",
                        order: 3
                    },
                    "part1-chapter1.1-lesson4": {
                        title: "Basic Phonics (Har letter ki sound)",
                        content: "Learn basic phonetic sounds for each letter",
                        order: 4
                    }
                },
                createdAt: new Date().toISOString()
            },
            "part1-chapter1.2": {
                title: "Words & Articles",
                description: "Understanding words, articles and their usage",
                difficulty: "Beginner",
                estimatedTime: 25,
                partTitle: "Basic Foundation (Neenv)",
                partNumber: 1,
                lessons: {
                    "part1-chapter1.2-lesson1": {
                        title: "What is a Word? (Shabd kya hai?)",
                        content: "Basic understanding of words and word formation",
                        order: 1
                    },
                    "part1-chapter1.2-lesson2": {
                        title: "Indefinite Articles: 'A' aur 'An' ke Rules",
                        content: "Learn when to use 'a' and 'an' with vowel sound concept",
                        order: 2
                    },
                    "part1-chapter1.2-lesson3": {
                        title: "Definite Article: 'The' ka Sahi Use",
                        content: "Proper usage of 'the' for specific items",
                        order: 3
                    },
                    "part1-chapter1.2-lesson4": {
                        title: "Zero Article (Kahan article nahi lagta)",
                        content: "Learn when NOT to use articles",
                        order: 4
                    }
                },
                createdAt: new Date().toISOString()
            }
        }
    };
    
    try {
        await window.firebaseUtils.saveData('syllabus/beginnerJourney', sampleData);
        showAlert('✅ Sample syllabus loaded successfully!', 'success');
        await loadSyllabusData();
    } catch (error) {
        console.error('Error loading sample syllabus:', error);
        showAlert('❌ Error loading sample data: ' + error.message, 'error');
    }
}

function loadSyllabus() {
    displaySyllabusData();
}

async function deleteChapter(courseType, chapterId) {
    if (!confirm(`Are you sure you want to delete chapter: ${chapterId}?`)) return;
    
    try {
        await window.firebaseUtils.deleteData(`syllabus/${courseType}/chapters/${chapterId}`);
        showAlert('✅ Chapter deleted successfully!', 'success');
        await loadSyllabusData();
    } catch (error) {
        console.error('Error deleting chapter:', error);
        showAlert('❌ Error deleting chapter: ' + error.message, 'error');
    }
}

function editChapter(courseType, chapterId) {
    // Implementation for editing chapters
    showAlert('Chapter editing feature will be implemented soon!', 'info');
}

// ===== VIDEO LIBRARY MANAGEMENT =====

async function loadVideosData() {
    console.log('🎥 Loading videos data...');
    
    try {
        // Load videos from Firebase
        const videosData = await window.firebaseUtils.fetchData('videoLibrary', 'allVideos');
        
        displayVideosData(videosData);
        
    } catch (error) {
        console.error('Error loading videos:', error);
        document.getElementById('videos-list').innerHTML = 
            '<p style="color: red;">❌ Error loading videos data</p>';
    }
}

function displayVideosData(videosData) {
    const videosList = document.getElementById('videos-list');
    
    if (!videosData || !videosData.videos || Object.keys(videosData.videos).length === 0) {
        videosList.innerHTML = '<p>No videos found. Add some videos to get started!</p>';
        return;
    }
    
    let html = '<h4>🎬 Video Collection</h4>';
    
    Object.keys(videosData.videos).forEach(videoId => {
        const video = videosData.videos[videoId];
        html += `
            <div class="video-item" style="border: 1px solid #ddd; margin: 0.5rem 0; padding: 1rem; border-radius: 6px;">
                <h5>${video.title || videoId}</h5>
                <p><strong>Description:</strong> ${video.description || 'No description'}</p>
                <p><strong>Category:</strong> ${video.category || 'General'}</p>
                <p><strong>Level:</strong> ${video.level || 'Beginner'}</p>
                <p><strong>Duration:</strong> ${video.duration || 'Unknown'} minutes</p>
                ${video.url ? `<p><strong>URL:</strong> <a href="${video.url}" target="_blank">View Video</a></p>` : ''}
                <button class="btn btn-danger" onclick="deleteVideo('${videoId}')">🗑️ Delete</button>
                <button class="btn" onclick="editVideo('${videoId}')">✏️ Edit</button>
            </div>
        `;
    });
    
    videosList.innerHTML = html;
}

async function saveVideo() {
    const videoId = document.getElementById('videoId').value.trim();
    const title = document.getElementById('videoTitle').value.trim();
    const description = document.getElementById('videoDescription').value.trim();
    const category = document.getElementById('videoCategory').value;
    const level = document.getElementById('videoLevel').value;
    const duration = document.getElementById('videoDuration').value;
    const url = document.getElementById('videoUrl').value.trim();
    const thumbnail = document.getElementById('videoThumbnail').value.trim();
    
    if (!videoId || !title) {
        showAlert('Please fill in Video ID and Title!', 'error');
        return;
    }
    
    const videoData = {
        title: title,
        description: description,
        category: category,
        level: level,
        duration: parseInt(duration) || 5,
        url: url,
        thumbnail: thumbnail,
        createdAt: new Date().toISOString()
    };
    
    try {
        // Save to Firebase
        await window.firebaseUtils.saveData(`videoLibrary/allVideos/videos/${videoId}`, videoData);
        
        showAlert('✅ Video saved successfully!', 'success');
        
        // Clear form
        document.getElementById('videoId').value = '';
        document.getElementById('videoTitle').value = '';
        document.getElementById('videoDescription').value = '';
        document.getElementById('videoDuration').value = '';
        document.getElementById('videoUrl').value = '';
        document.getElementById('videoThumbnail').value = '';
        
        // Reload data
        await loadVideosData();
        
    } catch (error) {
        console.error('Error saving video:', error);
        showAlert('❌ Error saving video: ' + error.message, 'error');
    }
}

async function loadSampleVideos() {
    if (!confirm('This will add sample video data. Continue?')) return;
    
    const sampleVideos = {
        videos: {
            "intro-greetings": {
                title: "Introduction to Greetings",
                description: "Learn basic greetings in English with pronunciation",
                category: "Speaking",
                level: "Beginner",
                duration: 8,
                url: "https://www.youtube.com/watch?v=sample1",
                thumbnail: "https://img.youtube.com/vi/sample1/maxresdefault.jpg",
                createdAt: new Date().toISOString()
            },
            "basic-grammar": {
                title: "Basic Grammar Rules",
                description: "Fundamental grammar concepts for beginners",
                category: "Grammar",
                level: "Beginner",
                duration: 12,
                url: "https://www.youtube.com/watch?v=sample2",
                thumbnail: "https://img.youtube.com/vi/sample2/maxresdefault.jpg",
                createdAt: new Date().toISOString()
            },
            "pronunciation-tips": {
                title: "Pronunciation Tips & Tricks",
                description: "Improve your English pronunciation with expert tips",
                category: "Pronunciation",
                level: "Elementary",
                duration: 15,
                url: "https://www.youtube.com/watch?v=sample3",
                thumbnail: "https://img.youtube.com/vi/sample3/maxresdefault.jpg",
                createdAt: new Date().toISOString()
            }
        }
    };
    
    try {
        await window.firebaseUtils.saveData('videoLibrary/allVideos', sampleVideos);
        showAlert('✅ Sample videos loaded successfully!', 'success');
        await loadVideosData();
    } catch (error) {
        console.error('Error loading sample videos:', error);
        showAlert('❌ Error loading sample data: ' + error.message, 'error');
    }
}

async function deleteVideo(videoId) {
    if (!confirm(`Are you sure you want to delete video: ${videoId}?`)) return;
    
    try {
        await window.firebaseUtils.deleteData(`videoLibrary/allVideos/videos/${videoId}`);
        showAlert('✅ Video deleted successfully!', 'success');
        await loadVideosData();
    } catch (error) {
        console.error('Error deleting video:', error);
        showAlert('❌ Error deleting video: ' + error.message, 'error');
    }
}

function editVideo(videoId) {
    // Implementation for editing videos
    showAlert('Video editing feature will be implemented soon!', 'info');
}

// Export new functions
window.saveChapter = saveChapter;
window.loadSampleSyllabus = loadSampleSyllabus;
window.loadSyllabus = loadSyllabus;
window.deleteChapter = deleteChapter;
window.editChapter = editChapter;
window.saveVideo = saveVideo;
window.loadSampleVideos = loadSampleVideos;
window.deleteVideo = deleteVideo;
window.editVideo = editVideo;

// Export for debugging
window.adminDebug = {
    currentTab,
    allLessons,
    allUsers,
    loadSyllabusData,
    loadVideosData,
    saveChapter,
    saveVideo,
    loadSampleData,
    checkSystemStatus
};

// Export API management functions to global scope
window.saveAPIKey = saveAPIKey;
window.testAPIKey = testAPIKey;
window.clearAllAPIKeys = clearAllAPIKeys;
window.exportAPIKeys = exportAPIKeys;
window.importAPIKeys = importAPIKeys;

console.log('✅ Admin Panel JavaScript Loaded!');
console.log('🐛 Admin debug tools available at window.adminDebug');