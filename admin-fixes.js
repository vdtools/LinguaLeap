// ===== COMPREHENSIVE ADMIN FIXES =====
// This file contains all the fixed and new functions for admin panel

// ===== CHAPTER MANAGEMENT (FIXED) =====
async function saveChapter() {
    console.log('📝 Starting saveChapter function...');
    
    const courseType = document.getElementById('courseType').value;
    const partNumber = document.getElementById('partNumber').value;
    const partTitle = document.getElementById('partTitle').value;
    const chapterNumber = document.getElementById('chapterNumber').value;
    const chapterTitle = document.getElementById('chapterTitle').value;
    
    // Get description from Quill editor
    const description = chapterDescriptionQuill ? chapterDescriptionQuill.root.innerHTML : '';
    
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
            const lessonId = `lesson${index + 1}`;
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    try {
        console.log(`🔄 Saving chapter to: syllabus/${courseType}/chapters/${chapterId}`);
        console.log('📦 Chapter data:', chapterData);
        
        // Use the enhanced save function
        const result = await window.firebaseUtils.saveDataEnhanced('syllabus', courseType, {
            chapters: {
                [chapterId]: chapterData
            }
        });
        
        if (result.success) {
            showAlert('✅ Chapter saved successfully!', 'success');
            
            // Clear form
            document.getElementById('partNumber').value = '';
            document.getElementById('partTitle').value = '';
            document.getElementById('chapterNumber').value = '';
            document.getElementById('chapterTitle').value = '';
            if (chapterDescriptionQuill) chapterDescriptionQuill.setContents([]);
            document.getElementById('estimatedTime').value = '';
            document.getElementById('subLessons').value = '';
            
            // Reload data
            await loadSyllabusData();
        } else {
            throw new Error(result.error);
        }
        
    } catch (error) {
        console.error('❌ Error saving chapter:', error);
        showAlert('❌ Error saving chapter: ' + error.message, 'error');
    }
}

// ===== VIDEO MANAGEMENT (FIXED) =====
async function saveVideo() {
    console.log('🎥 Starting saveVideo function...');
    
    const title = document.getElementById('videoTitle').value.trim();
    const category = document.getElementById('videoCategory').value;
    const youtubeVideoId = document.getElementById('youtubeVideoId').value.trim();
    
    // Get description from Quill editor
    const description = videoDescriptionQuill ? videoDescriptionQuill.root.innerHTML : '';
    
    const level = document.getElementById('videoLevel').value;
    const duration = document.getElementById('videoDuration').value;
    
    if (!title || !youtubeVideoId) {
        showAlert('Please fill in Video Title and YouTube Video ID!', 'error');
        return;
    }
    
    // Generate video ID from title
    const videoId = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
    
    const videoData = {
        title: title,
        description: description,
        category: category,
        youtubeVideoId: youtubeVideoId,
        level: level,
        duration: parseInt(duration) || 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    try {
        console.log(`🔄 Saving video to: videoLibrary/${videoId}`);
        console.log('📦 Video data:', videoData);
        
        // Save directly to videoLibrary collection
        const result = await window.firebaseUtils.saveDataEnhanced('videoLibrary', videoId, videoData);
        
        if (result.success) {
            showAlert('✅ Video saved successfully!', 'success');
            
            // Clear form
            document.getElementById('videoTitle').value = '';
            if (videoDescriptionQuill) videoDescriptionQuill.setContents([]);
            document.getElementById('youtubeVideoId').value = '';
            document.getElementById('videoDuration').value = '';
            
            // Reload data
            await loadVideosData();
        } else {
            throw new Error(result.error);
        }
        
    } catch (error) {
        console.error('❌ Error saving video:', error);
        showAlert('❌ Error saving video: ' + error.message, 'error');
    }
}

// ===== LOAD VIDEOS DATA (FIXED) =====
async function loadVideosData() {
    console.log('🎥 Loading videos data...');
    
    try {
        // Load ALL videos from Firebase
        const videosData = await window.firebaseUtils.getAllDocuments('videoLibrary');
        
        displayVideosData(videosData);
        
    } catch (error) {
        console.error('❌ Error loading videos:', error);
        document.getElementById('videos-list').innerHTML = 
            '<p style="color: red;">❌ Error loading videos data</p>';
    }
}

// ===== DISPLAY VIDEOS (FIXED) =====
function displayVideosData(videosData) {
    const videosList = document.getElementById('videos-list');
    
    if (!videosData || Object.keys(videosData).length === 0) {
        videosList.innerHTML = '<p>📹 No videos found. Add some videos to get started!</p>';
        return;
    }
    
    let html = '<h4>🎬 Video Collection</h4>';
    html += `<p style="color: #666; margin-bottom: 1rem;">Total Videos: ${Object.keys(videosData).length}</p>`;
    
    Object.keys(videosData).forEach(videoId => {
        const video = videosData[videoId];
        const thumbnailUrl = `https://img.youtube.com/vi/${video.youtubeVideoId}/mqdefault.jpg`;
        
        html += `
            <div class="video-item" style="border: 1px solid #ddd; margin: 0.5rem 0; padding: 1rem; border-radius: 6px; display: flex; gap: 1rem;">
                <img src="${thumbnailUrl}" alt="${video.title}" style="width: 120px; height: 90px; object-fit: cover; border-radius: 4px;">
                <div style="flex: 1;">
                    <h5>${video.title || videoId}</h5>
                    <p><strong>Category:</strong> ${video.category || 'General'} | <strong>Level:</strong> ${video.level || 'Beginner'} | <strong>Duration:</strong> ${video.duration || 'Unknown'} min</p>
                    <p><strong>YouTube ID:</strong> ${video.youtubeVideoId}</p>
                    <div style="margin-top: 0.5rem;">
                        <button class="btn btn-danger" style="padding: 0.5rem 1rem; font-size: 0.875rem;" onclick="deleteVideo('${videoId}')">🗑️ Delete</button>
                        <a href="https://www.youtube.com/watch?v=${video.youtubeVideoId}" target="_blank" class="btn" style="padding: 0.5rem 1rem; font-size: 0.875rem; text-decoration: none; display: inline-block;">▶️ Watch</a>
                    </div>
                </div>
            </div>
        `;
    });
    
    videosList.innerHTML = html;
}

// ===== DELETE VIDEO (FIXED) =====
async function deleteVideo(videoId) {
    if (!confirm(`Are you sure you want to delete this video?`)) return;
    
    try {
        await window.firebaseUtils.deleteData(`videoLibrary/${videoId}`);
        showAlert('✅ Video deleted successfully!', 'success');
        await loadVideosData();
    } catch (error) {
        console.error('❌ Error deleting video:', error);
        showAlert('❌ Error deleting video: ' + error.message, 'error');
    }
}

// ===== LOAD USERS DATA (FIXED) =====
async function loadUsersData() {
    console.log('👥 Loading users data...');
    
    try {
        const users = await window.firebaseUtils.getAllUsers();
        
        // Update stats
        document.getElementById('totalUsers').textContent = users.length.toString();
        
        // Calculate active today
        const today = new Date().toDateString();
        const activeToday = users.filter(user => {
            if (user.lastLogin && user.lastLogin.toDate) {
                return user.lastLogin.toDate().toDateString() === today;
            }
            return false;
        }).length;
        document.getElementById('activeToday').textContent = activeToday.toString();
        
        // Display users table
        const tbody = document.getElementById('users-table-body');
        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">📭 No users yet. Users will appear here after they sign up.</td></tr>';
        } else {
            tbody.innerHTML = users.map(user => `
                <tr>
                    <td>${user.displayName || user.id.substring(0, 8)}</td>
                    <td>${user.email || 'N/A'}</td>
                    <td>Level ${user.level || 1}</td>
                    <td>${user.points || 0} pts</td>
                    <td>${user.lastLoginFormatted}</td>
                    <td>
                        <button class="btn" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;" onclick="viewUserDetails('${user.id}')">View</button>
                    </td>
                </tr>
            `).join('');
        }
        
    } catch (error) {
        console.error('❌ Error loading users:', error);
        document.getElementById('users-table-body').innerHTML = 
            '<tr><td colspan="6" style="color: red; text-align: center;">❌ Error loading users data</td></tr>';
    }
}

function viewUserDetails(userId) {
    showAlert(`User details for ${userId} will be shown in a modal (feature coming soon!)`, 'info');
}

// ===== AI PROMPT MANAGEMENT (NEW) =====
const DEFAULT_PROMPTS = {
    dailyPractice: "Generate a personalized daily English practice session for a student. Include vocabulary, grammar, and a short exercise. Make it engaging and suitable for their level.",
    storyGenerator: "Generate an interesting short story in English that will help students learn new vocabulary and grammar. Include some educational elements naturally.",
    grammarChecker: "Analyze the following English text for grammar mistakes. Provide corrections and explanations in a friendly, educational tone.",
    sentenceImprover: "Improve the following English sentence. Make it more natural, fluent, and grammatically correct. Explain the changes.",
    quizGenerator: "Generate a quiz with multiple choice questions to test English knowledge. Include questions about grammar, vocabulary, and comprehension."
};

async function loadAIPromptsData() {
    console.log('🤖 Loading AI Prompts data...');
    
