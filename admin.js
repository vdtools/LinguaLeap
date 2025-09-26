// Admin Panel JavaScript
let currentTab = 'lessons';
let allLessons = {};
let allUsers = {};

// Initialize Admin Panel
document.addEventListener('DOMContentLoaded', function() {
    console.log('🛠️ Admin Panel Loading...');
    
    // Wait for Firebase to be ready
    setTimeout(() => {
        if (window.firebaseUtils) {
            initializeAdmin();
        } else {
            showAlert('Firebase not initialized properly!', 'error');
        }
    }, 1000);
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
        case 'lessons':
            await loadLessonsData();
            break;
        case 'users':
            await loadUsersData();
            break;
        case 'content':
            await loadContentEditor();
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
    await loadLessonsData();
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

// Export for debugging
window.adminDebug = {
    allLessons,
    allUsers,
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