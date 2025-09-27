// ===== LINGUALEAP V5.0 UTILITY FUNCTIONS =====

console.log('🔧 Loading LinguaLeap Utilities...');

// ===== DATE AND TIME UTILITIES =====

const DateUtils = {
    // Format date to readable string
    formatDate(date, format = 'short') {
        const d = new Date(date);
        const options = {
            short: { month: 'short', day: 'numeric', year: 'numeric' },
            long: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
            time: { hour: '2-digit', minute: '2-digit' },
            relative: null // Will be calculated
        };
        
        if (format === 'relative') {
            return this.getRelativeTime(d);
        }
        
        return d.toLocaleDateString('en-US', options[format] || options.short);
    },
    
    // Get relative time (e.g., "2 hours ago")
    getRelativeTime(date) {
        const now = new Date();
        const diff = now - new Date(date);
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const weeks = Math.floor(days / 7);
        const months = Math.floor(days / 30);
        
        if (seconds < 60) return 'Just now';
        if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
        if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
        if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
        if (weeks < 4) return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
        if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;
        
        return this.formatDate(date, 'short');
    },
    
    // Check if date is today
    isToday(date) {
        const today = new Date();
        const check = new Date(date);
        return check.toDateString() === today.toDateString();
    },
    
    // Get days between two dates
    daysBetween(date1, date2) {
        const oneDay = 24 * 60 * 60 * 1000;
        return Math.round(Math.abs((new Date(date1) - new Date(date2)) / oneDay));
    }
};

// ===== STRING UTILITIES =====

const StringUtils = {
    // Capitalize first letter
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },
    
    // Convert to title case
    toTitleCase(str) {
        return str.replace(/\w\S*/g, (txt) => 
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
    },
    
    // Truncate string with ellipsis
    truncate(str, maxLength = 50) {
        return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
    },
    
    // Remove accents from string
    removeAccents(str) {
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    },
    
    // Generate random string
    randomString(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    },
    
    // Validate email format
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    // Clean string for URL
    slugify(str) {
        return str
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
};

// ===== ARRAY UTILITIES =====

const ArrayUtils = {
    // Shuffle array
    shuffle(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    },
    
    // Get random item from array
    randomItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    },
    
    // Remove duplicates
    unique(array) {
        return [...new Set(array)];
    },
    
    // Group array by property
    groupBy(array, key) {
        return array.reduce((result, item) => {
            const group = item[key];
            if (!result[group]) {
                result[group] = [];
            }
            result[group].push(item);
            return result;
        }, {});
    },
    
    // Chunk array into smaller arrays
    chunk(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }
};

// ===== NUMBER UTILITIES =====

const NumberUtils = {
    // Format number with commas
    formatNumber(num) {
        return num.toLocaleString();
    },
    
    // Convert number to percentage
    toPercentage(num, decimals = 1) {
        return (num * 100).toFixed(decimals) + '%';
    },
    
    // Generate random number between min and max
    random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    // Clamp number between min and max
    clamp(num, min, max) {
        return Math.min(Math.max(num, min), max);
    },
    
    // Round to specified decimal places
    roundTo(num, decimals = 2) {
        return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
    }
};

// ===== STORAGE UTILITIES =====

const StorageUtils = {
    // Safe localStorage operations
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Storage set error:', error);
            return false;
        }
    },
    
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Storage get error:', error);
            return defaultValue;
        }
    },
    
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Storage remove error:', error);
            return false;
        }
    },
    
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Storage clear error:', error);
            return false;
        }
    },
    
    // Get storage size
    getSize() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length + key.length;
            }
        }
        return total;
    }
};

// ===== DOM UTILITIES =====

const DOMUtils = {
    // Create element with attributes
    createElement(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);
        
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'innerHTML') {
                element.innerHTML = value;
            } else {
                element.setAttribute(key, value);
            }
        });
        
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else {
                element.appendChild(child);
            }
        });
        
        return element;
    },
    
    // Add CSS class if not present
    addClass(element, className) {
        if (element && !element.classList.contains(className)) {
            element.classList.add(className);
        }
    },
    
    // Remove CSS class if present
    removeClass(element, className) {
        if (element && element.classList.contains(className)) {
            element.classList.remove(className);
        }
    },
    
    // Toggle CSS class
    toggleClass(element, className) {
        if (element) {
            element.classList.toggle(className);
        }
    },
    
    // Smooth scroll to element
    scrollTo(element, offset = 0) {
        if (element) {
            const top = element.offsetTop - offset;
            window.scrollTo({
                top: top,
                behavior: 'smooth'
            });
        }
    }
};

// ===== ANIMATION UTILITIES =====

const AnimationUtils = {
    // Fade in element
    fadeIn(element, duration = 300) {
        if (!element) return;
        
        element.style.opacity = '0';
        element.style.display = 'block';
        
        const start = performance.now();
        
        function animate(timestamp) {
            const progress = (timestamp - start) / duration;
            element.style.opacity = Math.min(progress, 1);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }
        
        requestAnimationFrame(animate);
    },
    
    // Fade out element
    fadeOut(element, duration = 300) {
        if (!element) return;
        
        const start = performance.now();
        const initialOpacity = parseFloat(getComputedStyle(element).opacity);
        
        function animate(timestamp) {
            const progress = (timestamp - start) / duration;
            element.style.opacity = initialOpacity * (1 - Math.min(progress, 1));
            
            if (progress >= 1) {
                element.style.display = 'none';
            } else {
                requestAnimationFrame(animate);
            }
        }
        
        requestAnimationFrame(animate);
    },
    
    // Slide down element
    slideDown(element, duration = 300) {
        if (!element) return;
        
        element.style.display = 'block';
        element.style.height = '0';
        element.style.overflow = 'hidden';
        
        const targetHeight = element.scrollHeight;
        const start = performance.now();
        
        function animate(timestamp) {
            const progress = (timestamp - start) / duration;
            element.style.height = targetHeight * Math.min(progress, 1) + 'px';
            
            if (progress >= 1) {
                element.style.height = 'auto';
                element.style.overflow = 'visible';
            } else {
                requestAnimationFrame(animate);
            }
        }
        
        requestAnimationFrame(animate);
    }
};

// ===== VALIDATION UTILITIES =====

const ValidationUtils = {
    // Validate required fields
    required(value) {
        return value !== null && value !== undefined && value.toString().trim() !== '';
    },
    
    // Validate email
    email(value) {
        return StringUtils.isValidEmail(value);
    },
    
    // Validate password strength
    password(value, minLength = 6) {
        if (!value || value.length < minLength) {
            return { valid: false, message: `Password must be at least ${minLength} characters` };
        }
        
        const hasUpper = /[A-Z]/.test(value);
        const hasLower = /[a-z]/.test(value);
        const hasNumber = /\d/.test(value);
        
        if (!hasUpper || !hasLower || !hasNumber) {
            return { 
                valid: false, 
                message: 'Password must contain uppercase, lowercase, and number' 
            };
        }
        
        return { valid: true, message: 'Password is strong' };
    },
    
    // Validate age
    age(value, minAge = 13) {
        const age = parseInt(value);
        return age >= minAge && age <= 120;
    }
};

// ===== ANALYTICS UTILITIES =====

const AnalyticsUtils = {
    // Track user event
    trackEvent(eventName, properties = {}) {
        const event = {
            name: eventName,
            properties: properties,
            timestamp: new Date().toISOString(),
            userId: LinguaLeap?.getCurrentUser()?.id || 'anonymous'
        };
        
        console.log('📊 Analytics Event:', event);
        
        // Store events locally for now
        const events = StorageUtils.get('lingualeap_events', []);
        events.push(event);
        StorageUtils.set('lingualeap_events', events);
    },
    
    // Track page view
    trackPageView(pageName) {
        this.trackEvent('page_view', { page: pageName });
    },
    
    // Track lesson completion
    trackLessonComplete(lessonId, score, timeSpent) {
        this.trackEvent('lesson_complete', {
            lesson_id: lessonId,
            score: score,
            time_spent: timeSpent
        });
    },
    
    // Get analytics summary
    getAnalytics() {
        const events = StorageUtils.get('lingualeap_events', []);
        return {
            total_events: events.length,
            unique_pages: ArrayUtils.unique(events.filter(e => e.name === 'page_view').map(e => e.properties.page)).length,
            lessons_completed: events.filter(e => e.name === 'lesson_complete').length,
            average_score: this.calculateAverageScore(events)
        };
    },
    
    calculateAverageScore(events) {
        const lessonEvents = events.filter(e => e.name === 'lesson_complete' && e.properties.score);
        if (lessonEvents.length === 0) return 0;
        
        const totalScore = lessonEvents.reduce((sum, event) => sum + event.properties.score, 0);
        return Math.round(totalScore / lessonEvents.length);
    }
};

// ===== EXPORT UTILITIES =====

const ExportUtils = {
    // Export data as JSON
    exportJSON(data, filename = 'lingualeap_export') {
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        this.downloadFile(dataBlob, `${filename}.json`);
    },
    
    // Export data as CSV
    exportCSV(data, filename = 'lingualeap_export') {
        if (!Array.isArray(data) || data.length === 0) return;
        
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => row[header] || '').join(','))
        ].join('\n');
        
        const dataBlob = new Blob([csvContent], { type: 'text/csv' });
        this.downloadFile(dataBlob, `${filename}.csv`);
    },
    
    // Download file
    downloadFile(blob, filename) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

// ===== NOTIFICATION UTILITIES =====

const NotificationUtils = {
    // Show toast notification
    showToast(message, type = 'info', duration = 4000) {
        const toast = DOMUtils.createElement('div', {
            className: `notification-toast ${type} show`,
            innerHTML: `
                <div class="toast-content">
                    <i class="fas fa-${this.getIconForType(type)}"></i>
                    <span>${message}</span>
                </div>
                <button class="toast-close" onclick="this.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            `
        });
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, duration);
    },
    
    getIconForType(type) {
        const icons = {
            success: 'check-circle',
            error: 'times-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    },
    
    // Request notification permission
    requestPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    },
    
    // Show browser notification
    showBrowserNotification(title, body, icon = '/favicon.ico') {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, { body, icon });
        }
    }
};

// ===== GLOBAL UTILITIES OBJECT =====

window.LinguaLeapUtils = {
    Date: DateUtils,
    String: StringUtils,
    Array: ArrayUtils,
    Number: NumberUtils,
    Storage: StorageUtils,
    DOM: DOMUtils,
    Animation: AnimationUtils,
    Validation: ValidationUtils,
    Analytics: AnalyticsUtils,
    Export: ExportUtils,
    Notification: NotificationUtils
};

console.log('🔧 LinguaLeap Utilities loaded successfully!');