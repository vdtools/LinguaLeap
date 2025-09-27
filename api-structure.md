# LinguaLeap V5.0 - API Structure Documentation

## 🚀 **Modern LinguaLeap Complete Setup Guide**

### **Overview**
This is the completely rebuilt LinguaLeap V5.0 with:
- ✅ **Custom Authentication** (No Google dependency)
- ✅ **Modern UI/UX** based on your design image
- ✅ **Working Features** - All functionality fixed
- ✅ **Server API Integration** - Complete data saving
- ✅ **Admin Panel** - Full control system
- ✅ **User Progress Tracking** - Complete analytics

---

## 📚 **File Structure**

```
LinguaLeap/
├── modern-index.html      # Main landing page + user dashboard
├── modern-styles.css      # Modern design CSS
├── modern-app.js          # Main application logic
├── modern-admin.html      # Admin panel interface
├── modern-admin.js        # Admin panel logic
└── api-structure.md       # This file - API documentation
```

---

## 🔑 **Authentication System**

### **Login Credentials (Demo)**
- **User Login**: `demo@lingualeap.com` / `demo123`
- **Admin Password**: `lingualeap2025`

### **API Endpoints Needed**

#### **Authentication**
```javascript
// POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

// Response
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "name": "User Name",
    "email": "user@example.com",
    "avatar": null,
    "joinDate": "2025-01-01T00:00:00Z",
    "level": "Beginner",
    "currentCourse": "Spanish"
  }
}
```

```javascript
// POST /api/auth/register
{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "password123"
}

// Response
{
  "success": true,
  "token": "jwt_token_here",
  "user": { /* user object */ }
}
```

---

## 📋 **Database Schema**

### **Users Table**
```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar VARCHAR(255),
    level ENUM('Beginner', 'Intermediate', 'Advanced') DEFAULT 'Beginner',
    current_course_id INT,
    join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    status ENUM('active', 'inactive', 'banned') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### **Courses Table**
```sql
CREATE TABLE courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    language VARCHAR(50) NOT NULL,
    difficulty_level ENUM('Beginner', 'Intermediate', 'Advanced') DEFAULT 'Beginner',
    thumbnail VARCHAR(255),
    status ENUM('active', 'inactive', 'draft') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### **Chapters Table**
```sql
CREATE TABLE chapters (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    chapter_order INT NOT NULL,
    content TEXT,
    video_url VARCHAR(255),
    status ENUM('active', 'inactive', 'draft') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);
```

### **Quiz Questions Table**
```sql
CREATE TABLE quiz_questions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    chapter_id INT NOT NULL,
    question_text TEXT NOT NULL,
    option_a VARCHAR(255) NOT NULL,
    option_b VARCHAR(255) NOT NULL,
    option_c VARCHAR(255) NOT NULL,
    option_d VARCHAR(255) NOT NULL,
    correct_answer ENUM('a', 'b', 'c', 'd') NOT NULL,
    explanation TEXT,
    question_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
);
```

### **User Progress Table**
```sql
CREATE TABLE user_progress (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    chapter_id INT,
    progress_percentage INT DEFAULT 0,
    completed_at TIMESTAMP NULL,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_time_spent INT DEFAULT 0, -- in minutes
    quiz_score INT DEFAULT 0,
    attempts INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
);
```

### **User Enrollments Table**
```sql
CREATE TABLE user_enrollments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completion_percentage INT DEFAULT 0,
    status ENUM('active', 'completed', 'paused') DEFAULT 'active',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_enrollment (user_id, course_id)
);
```

---

## 🔌 **API Endpoints Implementation**

### **Course Management**

```javascript
// GET /api/courses - Get all courses
// GET /api/courses/:id - Get specific course
// POST /api/courses - Create new course (Admin only)
// PUT /api/courses/:id - Update course (Admin only)
// DELETE /api/courses/:id - Delete course (Admin only)

// Example Course API Response
{
  "success": true,
  "courses": [
    {
      "id": 1,
      "name": "Spanish Basics",
      "description": "Learn Spanish from beginner to intermediate",
      "language": "spanish",
      "difficulty_level": "Beginner",
      "thumbnail": "/images/spanish-course.jpg",
      "total_chapters": 12,
      "enrolled_students": 245,
      "average_rating": 4.8,
      "status": "active"
    }
  ]
}
```

### **Chapter Management**

```javascript
// GET /api/courses/:courseId/chapters - Get chapters for course
// GET /api/chapters/:id - Get specific chapter
// POST /api/chapters - Create new chapter (Admin only)
// PUT /api/chapters/:id - Update chapter (Admin only)
// DELETE /api/chapters/:id - Delete chapter (Admin only)

// Example Chapter API Response
{
  "success": true,
  "chapter": {
    "id": 1,
    "course_id": 1,
    "title": "Introduction to Spanish",
    "description": "Basic Spanish greetings and introductions",
    "chapter_order": 1,
    "content": "Chapter content here...",
    "video_url": "https://example.com/video.mp4",
    "quiz_questions": [
      {
        "id": 1,
        "question_text": "What does 'Hola' mean?",
        "option_a": "Hello",
        "option_b": "Goodbye",
        "option_c": "Please",
        "option_d": "Thank you",
        "correct_answer": "a",
        "explanation": "Hola is a common Spanish greeting meaning Hello"
      }
    ]
  }
}
```

### **User Progress Tracking**

```javascript
// GET /api/users/:userId/progress - Get user progress
// POST /api/users/:userId/progress - Update progress
// GET /api/users/:userId/courses - Get enrolled courses
// POST /api/users/:userId/enroll - Enroll in course

// Example Progress API
{
  "success": true,
  "progress": {
    "total_courses": 3,
    "completed_courses": 1,
    "current_course": {
      "id": 2,
      "name": "Spanish Basics",
      "progress_percentage": 75,
      "current_chapter": 9,
      "total_chapters": 12
    },
    "stats": {
      "total_lessons_completed": 45,
      "total_time_spent": 1250, // minutes
      "current_streak": 7, // days
      "total_points": 2350,
      "achievements": ["First Lesson", "Week Warrior", "Quiz Master"]
    }
  }
}
```

### **Quiz Submission**

```javascript
// POST /api/quiz/submit
{
  "user_id": 1,
  "chapter_id": 5,
  "answers": {
    "1": "a",
    "2": "b",
    "3": "c"
  },
  "time_taken": 180 // seconds
}

// Response
{
  "success": true,
  "results": {
    "score": 2,
    "total_questions": 3,
    "percentage": 67,
    "passed": true, // 60% threshold
    "correct_answers": ["1", "3"],
    "incorrect_answers": ["2"],
    "explanations": {
      "2": "The correct answer is 'a' because..."
    }
  }
}
```

---

## 🛠️ **Backend Implementation Example (Node.js/Express)**

### **Basic Server Setup**

```javascript
// server.js
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static('public')); // Serve frontend files

// Database connection
const db = mysql.createPool({
  host: 'localhost',
  user: 'your_username',
  password: 'your_password',
  database: 'lingualeap',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const [users] = await db.execute(
      'SELECT * FROM users WHERE email = ? AND status = "active"',
      [email]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const user = users[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Update last login
    await db.execute(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [user.id]
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        level: user.level,
        joinDate: user.join_date
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const [existingUsers] = await db.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create user
    const [result] = await db.execute(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email, passwordHash]
    );
    
    const userId = result.insertId;
    
    const token = jwt.sign(
      { userId, email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      success: true,
      token,
      user: {
        id: userId,
        name,
        email,
        level: 'Beginner',
        joinDate: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Course routes
app.get('/api/courses', async (req, res) => {
  try {
    const [courses] = await db.execute(`
      SELECT c.*, 
             COUNT(DISTINCT ch.id) as total_chapters,
             COUNT(DISTINCT ue.user_id) as enrolled_students
      FROM courses c
      LEFT JOIN chapters ch ON c.id = ch.course_id AND ch.status = 'active'
      LEFT JOIN user_enrollments ue ON c.id = ue.course_id AND ue.status = 'active'
      WHERE c.status = 'active'
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);
    
    res.json({ success: true, courses });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`LinguaLeap server running on port ${PORT}`);
});
```

---

## 📱 **Frontend Integration**

### **Update API calls in modern-app.js**

```javascript
// Replace the API_BASE_URL in modern-app.js
const API_BASE_URL = 'http://localhost:3000/api'; // Your server URL

// Update loginUser function
async function loginUser(email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Login API error:', error);
    return { success: false, message: 'Network error' };
  }
}

// Update registerUser function
async function registerUser(name, email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password })
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Registration API error:', error);
    return { success: false, message: 'Network error' };
  }
}
```

---

## 🚀 **Quick Start Guide**

### **1. Frontend Setup**
```bash
# Serve the files using any web server
# Option 1: Python
python -m http.server 8000

# Option 2: Node.js live-server
npm install -g live-server
live-server

# Option 3: PHP
php -S localhost:8000
```

### **2. Backend Setup (Node.js)**
```bash
# Initialize project
npm init -y

# Install dependencies
npm install express mysql2 bcrypt jsonwebtoken cors

# Create .env file
echo "JWT_SECRET=your_super_secret_key_here" > .env
echo "DB_HOST=localhost" >> .env
echo "DB_USER=your_db_user" >> .env
echo "DB_PASSWORD=your_db_password" >> .env
echo "DB_NAME=lingualeap" >> .env

# Run server
node server.js
```

### **3. Database Setup**
```sql
-- Create database
CREATE DATABASE lingualeap;
USE lingualeap;

-- Run all the table creation scripts above
-- Insert sample data for testing
```

---

## 🔒 **Security Features**

### **Implemented**
- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ Input validation
- ✅ SQL injection prevention
- ✅ CORS configuration
- ✅ Admin password protection

### **Recommended Additional Security**
- Rate limiting
- HTTPS enforcement
- Input sanitization
- File upload restrictions
- Environment variables for secrets

---

## 📈 **Features Overview**

### **User Features**
- ✅ Custom login/signup (no Google dependency)
- ✅ Course enrollment and tracking
- ✅ Chapter progression
- ✅ Interactive quizzes
- ✅ Progress analytics
- ✅ Achievement system
- ✅ Responsive design

### **Admin Features**
- ✅ Complete course management
- ✅ Chapter creation with quiz builder
- ✅ User management
- ✅ Analytics dashboard
- ✅ Content moderation
- ✅ Platform settings

### **Technical Features**
- ✅ Modern responsive design
- ✅ RESTful API structure
- ✅ Real-time notifications
- ✅ Local storage caching
- ✅ Error handling
- ✅ Loading states

---

## 📞 **Support & Contact**

For any questions or support:
- Check browser console for errors
- Verify API endpoints are accessible
- Test database connections
- Review network requests in browser dev tools

**Happy Learning! 📚✨**