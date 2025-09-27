// ===== VIDEO LIBRARY FUNCTIONALITY =====
// Modern video library with filtering and modal viewing

let allVideos = [];
let currentFilter = 'all';

// Initialize video library
async function initializeVideoLibrary() {
    console.log('🎥 Initializing video library...');
    
    try {
        // Load videos from Firebase
        await loadVideosFromFirebase();
        
        // Setup filter buttons
        setupVideoFilters();
        
        // Display videos
        displayVideos();
        
        console.log('✅ Video library initialized successfully!');
        
    } catch (error) {
        console.error('❌ Error initializing video library:', error);
        showVideoError('Failed to load videos. Please try again later.');
    }
}

// Load videos from Firebase
async function loadVideosFromFirebase() {
    try {
        console.log('🔄 Loading videos from Firebase...');
        
        if (!window.firebaseUtils) {
            throw new Error('Firebase not initialized');
        }
        
        const videosData = await window.firebaseUtils.getAllDocuments('videoLibrary');
        
        // Convert to array and add thumbnails
        allVideos = Object.keys(videosData).map(id => {
            const video = videosData[id];
            return {
                id: id,
                title: video.title || 'Untitled Video',
                description: video.description || 'No description available',
                category: video.category || 'general',
                level: video.level || 'Beginner',
                duration: video.duration || 5,
                youtubeVideoId: video.youtubeVideoId,
                thumbnail: `https://img.youtube.com/vi/${video.youtubeVideoId}/mqdefault.jpg`,
                createdAt: video.createdAt || new Date().toISOString()
            };
        });
        
        console.log(`✅ Loaded ${allVideos.length} videos from Firebase`);
        
        // If no videos, show sample data
        if (allVideos.length === 0) {
            allVideos = getSampleVideos();
            console.log('📝 Using sample video data');
        }
        
    } catch (error) {
        console.error('❌ Error loading videos from Firebase:', error);
        // Fallback to sample data
        allVideos = getSampleVideos();
        console.log('📝 Using sample video data as fallback');
    }
}

// Get sample videos for demonstration
function getSampleVideos() {
    return [
        {
            id: 'sample-1',
            title: 'English Greetings & Introductions',
            description: 'Learn essential greetings and how to introduce yourself in English. Perfect for beginners starting their English journey.',
            category: 'conversation',
            level: 'Beginner',
            duration: 8,
            youtubeVideoId: 'Rfx7HKuUc8Y',
            thumbnail: 'https://img.youtube.com/vi/Rfx7HKuUc8Y/mqdefault.jpg',
            createdAt: new Date().toISOString()
        },
        {
            id: 'sample-2',
            title: 'Basic Grammar Rules Explained',
            description: 'Understanding fundamental English grammar concepts including articles, verb tenses, and sentence structure.',
            category: 'grammar',
            level: 'Elementary',
            duration: 12,
            youtubeVideoId: 'c8JHGpMaOonyYU9bxKy9',
            thumbnail: 'https://img.youtube.com/vi/c8JHGpMaOonyYU9bxKy9/mqdefault.jpg',
            createdAt: new Date().toISOString()
        },
        {
            id: 'sample-3',
            title: 'English Pronunciation Tips',
            description: 'Master difficult English sounds and improve your pronunciation with these practical tips and exercises.',
            category: 'pronunciation',
            level: 'Intermediate',
            duration: 15,
            youtubeVideoId: 'dQw4w9WgXcQ',
            thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
            createdAt: new Date().toISOString()
        },
        {
            id: 'sample-4',
            title: 'Essential English Vocabulary',
            description: 'Build your vocabulary with the most commonly used English words and phrases in daily conversations.',
            category: 'vocabulary',
            level: 'Beginner',
            duration: 10,
            youtubeVideoId: 'J---aiyznGQ',
            thumbnail: 'https://img.youtube.com/vi/J---aiyznGQ/mqdefault.jpg',
            createdAt: new Date().toISOString()
        }
    ];
}

// Setup video filter buttons
function setupVideoFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Get filter value
            currentFilter = button.getAttribute('data-category');
            
            // Filter and display videos
            displayVideos();
        });
    });
}

// Display videos based on current filter
function displayVideos() {
    const videoGrid = document.getElementById('videoGrid');
    if (!videoGrid) return;
    
    // Filter videos
    const filteredVideos = currentFilter === 'all' 
        ? allVideos 
        : allVideos.filter(video => video.category === currentFilter);
    
    if (filteredVideos.length === 0) {
        videoGrid.innerHTML = `
            <div class="loading-placeholder">
                <h3>📹 No videos found</h3>
                <p>No videos available for the selected category. Try a different category or check back later!</p>
            </div>
        `;
        return;
    }
    
    // Generate video cards HTML
    const videosHTML = filteredVideos.map(video => createVideoCard(video)).join('');
    
    videoGrid.innerHTML = videosHTML;
    
    // Add click events to video cards
    setupVideoCardEvents();
}

// Create individual video card HTML
function createVideoCard(video) {
    return `
        <div class="video-card" data-video-id="${video.id}">
            <div class="video-thumbnail">
                <img src="${video.thumbnail}" alt="${video.title}" onerror="this.src='https://via.placeholder.com/320x180?text=Video+Thumbnail'">
                <div class="video-play-overlay">▶</div>
            </div>
            <div class="video-content">
                <h4 class="video-title">${video.title}</h4>
                <div class="video-meta">
                    <span>${getCategoryDisplayName(video.category)}</span>
                    <span>${video.level}</span>
                    <span>${video.duration} min</span>
                </div>
                <p class="video-description">${stripHtml(video.description)}</p>
            </div>
        </div>
    `;
}

// Setup click events for video cards
function setupVideoCardEvents() {
    const videoCards = document.querySelectorAll('.video-card');
    
    videoCards.forEach(card => {
        card.addEventListener('click', () => {
            const videoId = card.getAttribute('data-video-id');
            const video = allVideos.find(v => v.id === videoId);
            
            if (video) {
                openVideoModal(video);
            }
        });
    });
}

// Open video modal
function openVideoModal(video) {
    const modal = document.getElementById('videoModal');
    const title = document.getElementById('modalVideoTitle');
    const category = document.getElementById('modalVideoCategory');
    const level = document.getElementById('modalVideoLevel');
    const duration = document.getElementById('modalVideoDuration');
    const description = document.getElementById('modalVideoDescription');
    const player = document.getElementById('videoPlayer');
    
    if (!modal) return;
    
    // Set video details
    title.textContent = video.title;
    category.textContent = getCategoryDisplayName(video.category);
    level.textContent = video.level;
    duration.textContent = `${video.duration} min`;
    description.innerHTML = video.description;
    
    // Set video player source
    const videoUrl = `https://www.youtube.com/embed/${video.youtubeVideoId}?autoplay=1&rel=0`;
    player.src = videoUrl;
    
    // Show modal
    modal.classList.remove('hidden');
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Add escape key listener
    document.addEventListener('keydown', handleEscapeKey);
    
    // Track video view (for analytics)
    trackVideoView(video.id);
}

// Close video modal
function closeVideoModal() {
    const modal = document.getElementById('videoModal');
    const player = document.getElementById('videoPlayer');
    
    if (!modal) return;
    
    // Hide modal
    modal.classList.add('hidden');
    
    // Stop video
    player.src = '';
    
    // Restore body scroll
    document.body.style.overflow = '';
    
    // Remove escape key listener
    document.removeEventListener('keydown', handleEscapeKey);
}

// Handle escape key to close modal
function handleEscapeKey(event) {
    if (event.key === 'Escape') {
        closeVideoModal();
    }
}

// Track video view for analytics
function trackVideoView(videoId) {
    try {
        const viewData = {
            videoId: videoId,
            timestamp: new Date().toISOString(),
            userId: currentUser ? currentUser.uid : 'anonymous'
        };
        
        // Save to localStorage for now (could be sent to analytics service)
        const existingViews = JSON.parse(localStorage.getItem('video_views') || '[]');
        existingViews.push(viewData);
        
        // Keep only last 100 views
        if (existingViews.length > 100) {
            existingViews.splice(0, existingViews.length - 100);
        }
        
        localStorage.setItem('video_views', JSON.stringify(existingViews));
        
        console.log(`📊 Tracked view for video: ${videoId}`);
        
    } catch (error) {
        console.error('❌ Error tracking video view:', error);
    }
}

// Utility functions
function getCategoryDisplayName(category) {
    const categoryNames = {
        'grammar': '📝 Grammar',
        'pronunciation': '🗣️ Pronunciation',
        'vocabulary': '📚 Vocabulary',
        'conversation': '💬 Conversation',
        'general': '🎯 General'
    };
    
    return categoryNames[category] || '🎯 General';
}

function stripHtml(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
}

function showVideoError(message) {
    const videoGrid = document.getElementById('videoGrid');
    if (!videoGrid) return;
    
    videoGrid.innerHTML = `
        <div class="loading-placeholder">
            <h3>❌ Error</h3>
            <p>${message}</p>
            <button class="path-btn" onclick="initializeVideoLibrary()" style="margin-top: 1rem;">🔄 Try Again</button>
        </div>
    `;
}

// Export functions for global access
window.initializeVideoLibrary = initializeVideoLibrary;
window.closeVideoModal = closeVideoModal;

console.log('✅ Video library module loaded successfully!');