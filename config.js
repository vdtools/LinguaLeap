// ===== LINGUALEAP V5.0 CONFIGURATION =====

const LINGUALEAP_CONFIG = {
    // Application Info
    app: {
        name: 'LinguaLeap',
        version: '5.0',
        description: 'Advanced Language Learning Platform',
        author: 'LinguaLeap Team',
        website: 'https://lingualeap.com'
    },
    
    // Default Settings
    defaults: {
        theme: 'light',
        language: 'en',
        notifications: true,
        sound: true,
        autoplay: false,
        daily_goal: 'regular', // casual, regular, intensive
        reminder_time: '19:00'
    },
    
    // XP and Scoring System
    scoring: {
        lesson_complete: 50,
        practice_complete: 25,
        perfect_score_bonus: 20,
        daily_streak_bonus: 10,
        first_lesson_bonus: 100,
        achievement_multiplier: 2
    },
    
    // Learning Goals (minutes per day)
    goals: {
        casual: 10,
        regular: 20,
        intensive: 45
    },
    
    // Badge/Achievement System
    achievements: {
        first_lesson: {
            id: 'first_lesson',
            name: 'First Steps',
            description: 'Complete your first lesson',
            icon: 'baby',
            xp: 100,
            condition: 'lessons_completed >= 1'
        },
        week_warrior: {
            id: 'week_warrior',
            name: 'Week Warrior',
            description: 'Maintain a 7-day streak',
            icon: 'fire',
            xp: 200,
            condition: 'streak >= 7'
        },
        xp_master: {
            id: 'xp_master',
            name: 'XP Master',
            description: 'Earn 1000 XP in total',
            icon: 'star',
            xp: 150,
            condition: 'total_xp >= 1000'
        },
        grammar_guru: {
            id: 'grammar_guru',
            name: 'Grammar Guru',
            description: 'Complete 50 grammar exercises',
            icon: 'language',
            xp: 250,
            condition: 'grammar_exercises >= 50'
        },
        vocabulary_virtuoso: {
            id: 'vocabulary_virtuoso',
            name: 'Vocabulary Virtuoso',
            description: 'Learn 500 new words',
            icon: 'book',
            xp: 300,
            condition: 'words_learned >= 500'
        },
        perfect_score: {
            id: 'perfect_score',
            name: 'Perfect Score',
            description: 'Get 100% accuracy on any lesson',
            icon: 'trophy',
            xp: 100,
            condition: 'perfect_lessons >= 1'
        },
        speed_learner: {
            id: 'speed_learner',
            name: 'Speed Learner',
            description: 'Complete 10 lessons in one day',
            icon: 'clock',
            xp: 200,
            condition: 'daily_lessons >= 10'
        },
        month_master: {
            id: 'month_master',
            name: 'Month Master',
            description: 'Maintain a 30-day streak',
            icon: 'calendar',
            xp: 500,
            condition: 'streak >= 30'
        }
    },
    
    // Course Configuration
    courses: {
        difficulty_levels: ['Beginner', 'Intermediate', 'Advanced'],
        lesson_types: ['vocabulary', 'grammar', 'listening', 'speaking', 'writing', 'culture'],
        max_lessons_per_course: 50,
        max_questions_per_lesson: 15
    },
    
    // Practice Modes
    practice_modes: {
        vocabulary: {
            name: 'Vocabulary',
            icon: 'book',
            description: 'Learn and review new words',
            xp_multiplier: 1.0
        },
        grammar: {
            name: 'Grammar',
            icon: 'language',
            description: 'Master sentence structure',
            xp_multiplier: 1.2
        },
        listening: {
            name: 'Listening',
            icon: 'headphones',
            description: 'Improve comprehension',
            xp_multiplier: 1.3
        },
        speaking: {
            name: 'Speaking',
            icon: 'microphone',
            description: 'Practice pronunciation',
            xp_multiplier: 1.4
        },
        writing: {
            name: 'Writing',
            icon: 'pen',
            description: 'Improve writing skills',
            xp_multiplier: 1.3
        },
        mixed: {
            name: 'Mixed Practice',
            icon: 'random',
            description: 'Random exercises',
            xp_multiplier: 1.5
        }
    },
    
    // Question Types
    question_types: {
        multiple_choice: {
            name: 'Multiple Choice',
            max_options: 4,
            time_limit: 30 // seconds
        },
        translation: {
            name: 'Translation',
            time_limit: 60
        },
        fill_blank: {
            name: 'Fill in the Blank',
            time_limit: 45
        },
        audio: {
            name: 'Audio Recognition',
            time_limit: 45
        },
        speaking: {
            name: 'Speaking Practice',
            time_limit: 120
        },
        matching: {
            name: 'Matching',
            time_limit: 60
        }
    },
    
    // UI Configuration
    ui: {
        animation_duration: 300,
        notification_timeout: 4000,
        auto_save_interval: 30000, // 30 seconds
        lesson_hearts: 3,
        max_daily_hearts: 5
    },
    
    // Storage Keys
    storage_keys: {
        user: 'lingualeap_user',
        progress: 'lingualeap_progress',
        courses: 'lingualeap_courses',
        settings: 'lingualeap_settings',
        users: 'lingualeap_users',
        achievements: 'lingualeap_achievements'
    },
    
    // API Endpoints (for future use)
    api: {
        base_url: 'https://api.lingualeap.com/v5',
        auth: '/auth',
        users: '/users',
        courses: '/courses',
        progress: '/progress',
        achievements: '/achievements'
    },
    
    // Supported Languages
    supported_languages: {
        en: { name: 'English', flag: '🇺🇸', rtl: false },
        es: { name: 'Español', flag: '🇪🇸', rtl: false },
        fr: { name: 'Français', flag: '🇫🇷', rtl: false },
        de: { name: 'Deutsch', flag: '🇩🇪', rtl: false },
        it: { name: 'Italiano', flag: '🇮🇹', rtl: false },
        pt: { name: 'Português', flag: '🇧🇷', rtl: false },
        ru: { name: 'Русский', flag: '🇷🇺', rtl: false },
        ja: { name: '日本語', flag: '🇯🇵', rtl: false },
        ko: { name: '한국어', flag: '🇰🇷', rtl: false },
        zh: { name: '中文', flag: '🇨🇳', rtl: false },
        ar: { name: 'العربية', flag: '🇸🇦', rtl: true },
        hi: { name: 'हिन्दी', flag: '🇮🇳', rtl: false }
    },
    
    // Admin Configuration
    admin: {
        default_credentials: {
            username: 'admin',
            password: 'lingualeap2025'
        },
        permissions: ['users', 'courses', 'analytics', 'settings', 'export'],
        session_timeout: 3600000 // 1 hour
    },
    
    // Feature Flags
    features: {
        social_learning: false,
        offline_mode: false,
        video_lessons: false,
        ai_tutor: false,
        progress_sharing: true,
        leaderboards: false,
        premium_content: false
    },
    
    // Error Messages
    errors: {
        network: 'Network connection error. Please check your internet connection.',
        auth: 'Authentication failed. Please check your credentials.',
        validation: 'Please fill in all required fields correctly.',
        permission: 'You don\'t have permission to perform this action.',
        not_found: 'The requested resource was not found.',
        server: 'Server error. Please try again later.',
        storage: 'Local storage error. Please check your browser settings.'
    },
    
    // Success Messages
    messages: {
        login: 'Welcome back! Ready to continue learning?',
        signup: 'Account created successfully! Welcome to LinguaLeap!',
        lesson_complete: 'Great job! You\'ve completed this lesson.',
        achievement_earned: 'Congratulations! You\'ve earned a new badge!',
        streak_milestone: 'Amazing! You\'ve reached a new streak milestone!',
        profile_updated: 'Your profile has been updated successfully.',
        settings_saved: 'Settings saved successfully.'
    },
    
    // Development Configuration
    development: {
        debug_mode: false,
        show_console_logs: true,
        demo_data: true,
        skip_animations: false,
        mock_api: true
    }
};

// Export configuration for use in other files
if (typeof window !== 'undefined') {
    window.LINGUALEAP_CONFIG = LINGUALEAP_CONFIG;
}

// Console welcome message
if (LINGUALEAP_CONFIG.development.show_console_logs) {
    console.log(`
    🌐 LinguaLeap V${LINGUALEAP_CONFIG.app.version} Configuration Loaded
    📚 Language Learning Platform
    🚀 Ready for awesome learning experiences!
    `);
}