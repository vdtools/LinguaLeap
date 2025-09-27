// ===== PROFILE PAGE FUNCTIONALITY =====

console.log('👤 Loading Profile Page...');

document.addEventListener('DOMContentLoaded', function() {
    initializeProfilePage();
});

function initializeProfilePage() {
    loadUserProfile();
    loadUserSettings();
    loadAchievements();
    updateUserInterface();
}

function loadUserProfile() {
    const currentUser = LinguaLeap.getCurrentUser();
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }
    
    // Update profile header
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const profileAvatar = document.getElementById('profileAvatar');
    const joinDate = document.getElementById('joinDate');
    const profileStreak = document.getElementById('profileStreak');
    const profileXP = document.getElementById('profileXP');
    
    if (profileName) {
        profileName.textContent = `${currentUser.firstName} ${currentUser.lastName}`;
    }
    
    if (profileEmail) {
        profileEmail.textContent = currentUser.email;
    }
    
    if (profileAvatar) {
        profileAvatar.src = currentUser.avatar;
    }
    
    if (joinDate) {
        const date = new Date(currentUser.createdAt);
        joinDate.textContent = date.toLocaleDateString('en-US', { 
            month: 'short', 
            year: 'numeric' 
        });
    }
    
    // Load progress data
    const progress = LinguaLeap.getUserProgress() || {};
    
    if (profileStreak) {
        profileStreak.textContent = progress.streak || 7;
    }
    
    if (profileXP) {
        profileXP.textContent = (progress.totalXP || 1250).toLocaleString();
    }
    
    // Update form fields
    const firstName = document.getElementById('firstName');
    const lastName = document.getElementById('lastName');
    const email = document.getElementById('email');
    
    if (firstName) firstName.value = currentUser.firstName;
    if (lastName) lastName.value = currentUser.lastName;
    if (email) email.value = currentUser.email;
}

function loadUserSettings() {
    const settings = LinguaLeap.getUserSettings();
    
    // Load theme setting
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) {
        themeSelect.value = settings.theme || 'light';
    }
    
    // Load language setting
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
        languageSelect.value = settings.language || 'en';
    }
    
    // Load notification settings
    const dailyReminders = document.getElementById('dailyReminders');
    const achievementNotifs = document.getElementById('achievementNotifs');
    const weeklyProgress = document.getElementById('weeklyProgress');
    const soundEffects = document.getElementById('soundEffects');
    const autoplayAudio = document.getElementById('autoplayAudio');
    
    if (dailyReminders) dailyReminders.checked = settings.notifications !== false;
    if (achievementNotifs) achievementNotifs.checked = settings.notifications !== false;
    if (weeklyProgress) weeklyProgress.checked = settings.weeklyReports || false;
    if (soundEffects) soundEffects.checked = settings.sound !== false;
    if (autoplayAudio) autoplayAudio.checked = settings.autoplay || false;
}

function loadAchievements() {
    const progress = LinguaLeap.getUserProgress() || {};
    const achievementsGrid = document.getElementById('profileAchievements');
    const totalBadges = document.getElementById('totalBadges');
    const totalPoints = document.getElementById('totalPoints');
    const achievementRank = document.getElementById('achievementRank');
    
    // Update achievement stats
    const badgeCount = progress.badges ? progress.badges.length : 2;
    const xpCount = progress.totalXP || 1250;
    
    if (totalBadges) totalBadges.textContent = badgeCount;
    if (totalPoints) totalPoints.textContent = xpCount.toLocaleString();
    if (achievementRank) {
        const rank = xpCount < 500 ? 'Bronze' : xpCount < 2000 ? 'Silver' : 'Gold';
        achievementRank.textContent = rank;
    }
    
    // Load achievements
    if (achievementsGrid) {
        achievementsGrid.innerHTML = '';
        
        const achievements = [
            {
                icon: 'fire',
                title: 'Week Warrior',
                description: 'Complete lessons for 7 days straight',
                earned: true,
                date: '2 days ago'
            },
            {
                icon: 'star',
                title: 'XP Master',
                description: 'Earn 1000 XP in total',
                earned: true,
                date: '5 days ago'
            },
            {
                icon: 'book',
                title: 'Grammar Guru',
                description: 'Complete 50 grammar exercises',
                earned: false,
                progress: '32/50'
            },
            {
                icon: 'globe',
                title: 'Vocabulary Virtuoso',
                description: 'Learn 500 new words',
                earned: false,
                progress: '287/500'
            },
            {
                icon: 'trophy',
                title: 'Perfect Score',
                description: 'Get 100% on any lesson',
                earned: false,
                progress: 'Not earned'
            },
            {
                icon: 'clock',
                title: 'Speed Learner',
                description: 'Complete 10 lessons in one day',
                earned: false,
                progress: 'Not earned'
            }
        ];
        
        achievements.forEach(achievement => {
            const achievementCard = createAchievementCard(achievement);
            achievementsGrid.appendChild(achievementCard);
        });
    }
}

function createAchievementCard(achievement) {
    const card = document.createElement('div');
    card.className = `achievement-card ${achievement.earned ? 'earned' : 'locked'}`;
    
    const icon = achievement.earned ? achievement.icon : 'lock';
    const statusText = achievement.earned 
        ? `Earned ${achievement.date}` 
        : `Progress: ${achievement.progress}`;
    
    card.innerHTML = `
        <div class="achievement-icon">
            <i class="fas fa-${icon}"></i>
        </div>
        <div class="achievement-content">
            <h4>${achievement.title}</h4>
            <p>${achievement.description}</p>
            <span class="achievement-status">${statusText}</span>
        </div>
    `;
    
    return card;
}

function switchTab(tabName) {
    // Remove active class from all tabs and content
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Add active class to selected tab and content
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}Tab`).classList.add('active');
}

function editProfile() {
    switchTab('account');
    const firstName = document.getElementById('firstName');
    if (firstName) firstName.focus();
}

function editAvatar() {
    // Simulate avatar selection
    const avatars = [
        'https://ui-avatars.com/api/?name=User&background=4CAF50&color=fff',
        'https://ui-avatars.com/api/?name=User&background=2196F3&color=fff',
        'https://ui-avatars.com/api/?name=User&background=FF6B35&color=fff',
        'https://ui-avatars.com/api/?name=User&background=9C27B0&color=fff'
    ];
    
    const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];
    
    const profileAvatar = document.getElementById('profileAvatar');
    const userAvatar = document.getElementById('userAvatar');
    
    if (profileAvatar) profileAvatar.src = randomAvatar;
    if (userAvatar) userAvatar.src = randomAvatar;
    
    // Update user data
    const currentUser = LinguaLeap.getCurrentUser();
    if (currentUser) {
        LinguaLeap.updateUserData({ avatar: randomAvatar });
    }
    
    showProfileNotification('Avatar updated successfully!', 'success');
}

function changeTheme() {
    const themeSelect = document.getElementById('themeSelect');
    const theme = themeSelect.value;
    
    LinguaLeap.updateSettings({ theme: theme });
    showProfileNotification(`Theme changed to ${theme}`, 'success');
}

function saveProfile() {
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const bio = document.getElementById('bio').value;
    
    // Validation
    if (!firstName || !lastName || !email) {
        showProfileNotification('Please fill in all required fields', 'warning');
        return;
    }
    
    // Update user data
    const userData = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        bio: bio
    };
    
    const updatedUser = LinguaLeap.updateUserData(userData);
    
    if (updatedUser) {
        // Update settings
        const settings = {
            theme: document.getElementById('themeSelect').value,
            language: document.getElementById('languageSelect').value,
            notifications: document.getElementById('dailyReminders').checked,
            weeklyReports: document.getElementById('weeklyProgress').checked,
            sound: document.getElementById('soundEffects').checked,
            autoplay: document.getElementById('autoplayAudio').checked
        };
        
        LinguaLeap.updateSettings(settings);
        
        // Reload profile to show changes
        loadUserProfile();
        
        showProfileNotification('Profile saved successfully!', 'success');
    } else {
        showProfileNotification('Failed to save profile. Please try again.', 'error');
    }
}

function changePassword() {
    const newPassword = prompt('Enter new password (minimum 6 characters):');
    
    if (newPassword && newPassword.length >= 6) {
        // In a real app, this would hash the password
        const currentUser = LinguaLeap.getCurrentUser();
        if (currentUser) {
            showProfileNotification('Password changed successfully!', 'success');
        }
    } else if (newPassword) {
        showProfileNotification('Password must be at least 6 characters', 'warning');
    }
}

function setup2FA() {
    showProfileNotification('Two-factor authentication setup coming soon!', 'info');
}

function downloadData() {
    try {
        const currentUser = LinguaLeap.getCurrentUser();
        const progress = LinguaLeap.getUserProgress();
        const settings = LinguaLeap.getUserSettings();
        
        const userData = {
            user: currentUser,
            progress: progress,
            settings: settings,
            exportDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(userData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `lingualeap_data_${currentUser.firstName}_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        showProfileNotification('Data exported successfully!', 'success');
    } catch (error) {
        showProfileNotification('Failed to export data', 'error');
    }
}

function deleteAccount() {
    const confirmation = prompt('Type "DELETE" to confirm account deletion:');
    
    if (confirmation === 'DELETE') {
        if (confirm('Are you absolutely sure? This action cannot be undone.')) {
            // In a real app, this would delete from database
            LinguaLeap.logoutUser();
            alert('Account deleted successfully. We\'re sorry to see you go!');
            window.location.href = 'index.html';
        }
    } else if (confirmation !== null) {
        showProfileNotification('Account deletion cancelled', 'info');
    }
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        LinguaLeap.logoutUser();
        window.location.href = 'index.html';
    }
}

function showProfileNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `profile-notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 
                           type === 'warning' ? 'exclamation-triangle' : 
                           type === 'error' ? 'times-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--white);
        border: 1px solid var(--gray-200);
        border-radius: var(--radius-lg);
        padding: var(--space-lg);
        box-shadow: var(--shadow-xl);
        display: flex;
        align-items: center;
        gap: var(--space-md);
        z-index: 1000;
        animation: slideInRight 0.3s ease-out;
        border-left: 4px solid var(--${type === 'success' ? 'success' : 
                                        type === 'warning' ? 'warning' : 
                                        type === 'error' ? 'error' : 'info'}-color);
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
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

function goToPractice() {
    window.location.href = 'practice.html';
}

function goToProgress() {
    window.location.href = 'progress.html';
}

function toggleUserMenu() {
    if (confirm('Do you want to logout?')) {
        logout();
    }
}