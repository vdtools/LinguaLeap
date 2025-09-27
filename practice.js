// ===== PRACTICE PAGE FUNCTIONALITY =====

console.log('🎯 Loading Practice Page...');

document.addEventListener('DOMContentLoaded', function() {
    initializePracticePage();
});

function initializePracticePage() {
    loadPracticeStats();
    updateUserInterface();
}

function loadPracticeStats() {
    const currentUser = LinguaLeap.getCurrentUser();
    if (!currentUser) return;
    
    const progress = LinguaLeap.getUserProgress() || {};
    
    // Update practice stats
    const practiceStreak = document.getElementById('practiceStreak');
    const practiceAccuracy = document.getElementById('practiceAccuracy');
    const practiceTime = document.getElementById('practiceTime');
    
    if (practiceStreak) {
        practiceStreak.textContent = progress.streak || 0;
    }
    
    if (practiceAccuracy) {
        practiceAccuracy.textContent = (progress.stats?.accuracy || 85) + '%';
    }
    
    if (practiceTime) {
        practiceTime.textContent = Math.floor(Math.random() * 45) + 15; // Random practice time
    }
}

function startPracticeMode(mode) {
    console.log(`🎯 Starting ${mode} practice...`);
    
    // Show loading message
    showPracticeModal(mode);
    
    // Simulate practice session
    setTimeout(() => {
        completePracticeSession(mode);
    }, 3000);
}

function showPracticeModal(mode) {
    const modal = createPracticeModal(mode);
    document.body.appendChild(modal);
}

function createPracticeModal(mode) {
    const modal = document.createElement('div');
    modal.className = 'practice-modal';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2><i class="fas fa-${getIconForMode(mode)}"></i> ${capitalizeFirst(mode)} Practice</h2>
                <button class="modal-close" onclick="closePracticeModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="practice-loading">
                    <div class="loading-spinner"></div>
                    <p>Preparing your ${mode} exercises...</p>
                    <div class="progress-bar">
                        <div class="progress-fill loading-progress"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal styles
    modal.innerHTML += `
        <style>
            .practice-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(5px);
            }
            .modal-content {
                background: var(--white);
                border-radius: var(--radius-2xl);
                padding: var(--space-2xl);
                max-width: 500px;
                width: 90%;
                position: relative;
                box-shadow: var(--shadow-xl);
            }
            .modal-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: var(--space-xl);
            }
            .modal-close {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: var(--gray-500);
            }
            .practice-loading {
                text-align: center;
            }
            .loading-spinner {
                width: 50px;
                height: 50px;
                border: 3px solid var(--gray-200);
                border-top: 3px solid var(--primary-color);
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto var(--space-lg);
            }
            .loading-progress {
                animation: loadingBar 3s ease-in-out forwards;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            @keyframes loadingBar {
                0% { width: 0%; }
                100% { width: 100%; }
            }
        </style>
    `;
    
    return modal;
}

function getIconForMode(mode) {
    const icons = {
        vocabulary: 'book',
        grammar: 'language',
        listening: 'headphones',
        speaking: 'microphone',
        writing: 'pen',
        mixed: 'random'
    };
    return icons[mode] || 'gamepad';
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function completePracticeSession(mode) {
    const modal = document.querySelector('.practice-modal');
    if (modal) {
        // Update modal to show completion
        const modalBody = modal.querySelector('.modal-body');
        const xpEarned = Math.floor(Math.random() * 100) + 50;
        const accuracy = Math.floor(Math.random() * 30) + 70;
        
        modalBody.innerHTML = `
            <div class="practice-complete">
                <div class="success-icon">
                    <i class="fas fa-trophy"></i>
                </div>
                <h3>Practice Complete!</h3>
                <p>Great job on your ${mode} practice session!</p>
                <div class="practice-results">
                    <div class="result-item">
                        <span class="result-label">Accuracy:</span>
                        <span class="result-value">${accuracy}%</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">XP Earned:</span>
                        <span class="result-value">+${xpEarned}</span>
                    </div>
                </div>
                <button class="btn primary" onclick="closePracticeModal()">
                    <i class="fas fa-check"></i> Continue
                </button>
            </div>
            <style>
                .practice-complete {
                    text-align: center;
                }
                .success-icon {
                    font-size: 3rem;
                    color: var(--primary-color);
                    margin-bottom: var(--space-lg);
                }
                .practice-results {
                    background: var(--gray-50);
                    padding: var(--space-lg);
                    border-radius: var(--radius-lg);
                    margin: var(--space-lg) 0;
                }
                .result-item {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: var(--space-sm);
                    font-weight: 600;
                }
                .result-value {
                    color: var(--primary-color);
                }
            </style>
        `;
        
        // Add XP to user progress
        LinguaLeap.addXP(xpEarned);
        
        // Update practice stats
        loadPracticeStats();
    }
}

function closePracticeModal() {
    const modal = document.querySelector('.practice-modal');
    if (modal) {
        modal.remove();
    }
}

function updateUserInterface() {
    const currentUser = LinguaLeap.getCurrentUser();
    if (currentUser) {
        const userAvatar = document.getElementById('userAvatar');
        if (userAvatar) {
            userAvatar.src = currentUser.avatar;
        }
    }
}

// Navigation functions
function goHome() {
    window.location.href = 'index.html';
}

function goToCourses() {
    window.location.href = 'courses.html';
}

function goToProgress() {
    window.location.href = 'progress.html';
}

function goToProfile() {
    window.location.href = 'profile.html';
}

function toggleUserMenu() {
    if (confirm('Do you want to logout?')) {
        LinguaLeap.logoutUser();
        window.location.href = 'index.html';
    }
}