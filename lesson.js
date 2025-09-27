// ===== LESSON PAGE FUNCTIONALITY =====

console.log('📚 Loading Lesson Page...');

// Lesson variables
let currentLesson = {};
let currentQuestion = 0;
let totalQuestions = 10;
let hearts = 3;
let correctAnswers = 0;
let startTime = Date.now();
let lessonQuestions = [];

document.addEventListener('DOMContentLoaded', function() {
    initializeLesson();
});

function initializeLesson() {
    // Get lesson info from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('course') || 'spanish-fundamentals';
    const lessonId = urlParams.get('lesson') || '1';
    
    // Load lesson data
    loadLessonData(courseId, lessonId);
    
    // Start lesson
    startLesson();
}

function loadLessonData(courseId, lessonId) {
    // Get course data
    const course = LinguaLeap.getCourseById(courseId);
    
    if (course) {
        currentLesson = {
            courseId: courseId,
            lessonId: lessonId,
            title: `Lesson ${lessonId}: Basic Greetings`,
            subtitle: 'Learn how to say hello and introduce yourself',
            course: course
        };
        
        // Generate lesson questions
        lessonQuestions = generateLessonQuestions(courseId, lessonId);
        totalQuestions = lessonQuestions.length;
        
        // Update UI
        updateLessonInfo();
    } else {
        console.error('Course not found:', courseId);
        window.location.href = 'courses.html';
    }
}

function generateLessonQuestions(courseId, lessonId) {
    // Sample Spanish questions - in a real app, this would come from a database
    const spanishQuestions = [
        {
            type: 'multiple_choice',
            question: 'How do you say "Hello" in Spanish?',
            options: ['Hola', 'Adiós', 'Gracias', 'Por favor'],
            correct: 0,
            explanation: 'Hola is the most common way to say hello in Spanish.'
        },
        {
            type: 'translation',
            question: 'Translate: "Good morning"',
            answer: 'Buenos días',
            hint: 'Think about the time of day...',
            alternatives: ['buenos dias', 'buenos días']
        },
        {
            type: 'fill_blank',
            question: 'Complete: "Me _____ Juan" (My name is Juan)',
            answer: 'llamo',
            sentence: 'Me _____ Juan',
            hint: 'This verb means "to call" in a reflexive form.'
        },
        {
            type: 'audio',
            question: 'Listen and select the correct answer:',
            audio: 'How are you?',
            options: ['¿Cómo estás?', '¿Cómo te llamas?', '¿De dónde eres?', '¿Cuántos años tienes?'],
            correct: 0
        },
        {
            type: 'multiple_choice',
            question: 'What does "¿Cómo te llamas?" mean?',
            options: ['How are you?', 'What is your name?', 'Where are you from?', 'How old are you?'],
            correct: 1,
            explanation: 'This phrase is used to ask someone their name.'
        },
        {
            type: 'translation',
            question: 'Translate: "Nice to meet you"',
            answer: 'Mucho gusto',
            alternatives: ['mucho gusto', 'Mucho Gusto', 'encantado', 'Encantado']
        },
        {
            type: 'fill_blank',
            question: 'Complete: "_____ tardes" (Good afternoon)',
            answer: 'Buenas',
            sentence: '_____ tardes',
            hint: 'This word agrees with "tardes" which is feminine plural.'
        },
        {
            type: 'multiple_choice',
            question: 'How do you say "Goodbye" in Spanish?',
            options: ['Hola', 'Adiós', 'Hasta luego', 'Both B and C'],
            correct: 3,
            explanation: 'Both "Adiós" and "Hasta luego" mean goodbye, but "Hasta luego" is more like "see you later".'
        },
        {
            type: 'translation',
            question: 'Translate: "I am from Mexico"',
            answer: 'Soy de México',
            alternatives: ['soy de mexico', 'Soy de Mexico', 'soy de México']
        },
        {
            type: 'fill_blank',
            question: 'Complete: "¿_____ estás?" (How are you?)',
            answer: 'Cómo',
            sentence: '¿_____ estás?',
            hint: 'This question word asks about manner or condition.'
        }
    ];
    
    return spanishQuestions;
}

function updateLessonInfo() {
    const lessonTitle = document.getElementById('lessonTitle');
    const lessonSubtitle = document.getElementById('lessonSubtitle');
    
    if (lessonTitle) lessonTitle.textContent = currentLesson.title;
    if (lessonSubtitle) lessonSubtitle.textContent = currentLesson.subtitle;
}

function startLesson() {
    currentQuestion = 0;
    hearts = 3;
    correctAnswers = 0;
    startTime = Date.now();
    
    updateProgress();
    updateHearts();
    showQuestion();
}

function updateProgress() {
    const progress = (currentQuestion / totalQuestions) * 100;
    const progressFill = document.getElementById('lessonProgress');
    const progressText = document.getElementById('progressText');
    
    if (progressFill) progressFill.style.width = progress + '%';
    if (progressText) progressText.textContent = `${currentQuestion}/${totalQuestions}`;
}

function updateHearts() {
    for (let i = 1; i <= 3; i++) {
        const heart = document.getElementById(`heart${i}`);
        if (heart) {
            if (i <= hearts) {
                heart.className = 'fas fa-heart';
                heart.style.color = '#e74c3c';
            } else {
                heart.className = 'far fa-heart';
                heart.style.color = '#bdc3c7';
            }
        }
    }
}

function showQuestion() {
    if (currentQuestion >= totalQuestions) {
        completeLesson();
        return;
    }
    
    const question = lessonQuestions[currentQuestion];
    const lessonContent = document.getElementById('lessonContent');
    const checkBtn = document.getElementById('checkBtn');
    
    // Reset check button
    if (checkBtn) {
        checkBtn.disabled = true;
        checkBtn.textContent = 'Check';
        checkBtn.onclick = checkAnswer;
    }
    
    // Generate question HTML based on type
    let questionHTML = '';
    
    switch (question.type) {
        case 'multiple_choice':
            questionHTML = createMultipleChoiceQuestion(question);
            break;
        case 'translation':
            questionHTML = createTranslationQuestion(question);
            break;
        case 'fill_blank':
            questionHTML = createFillBlankQuestion(question);
            break;
        case 'audio':
            questionHTML = createAudioQuestion(question);
            break;
        default:
            questionHTML = createMultipleChoiceQuestion(question);
    }
    
    if (lessonContent) {
        lessonContent.innerHTML = questionHTML;
        
        // Add event listeners
        setupQuestionListeners(question.type);
    }
}

function createMultipleChoiceQuestion(question) {
    return `
        <div class="question-container">
            <div class="question-header">
                <h2>${question.question}</h2>
            </div>
            <div class="question-options">
                ${question.options.map((option, index) => `
                    <button class="option-btn" data-index="${index}" onclick="selectOption(${index})">
                        ${option}
                    </button>
                `).join('')}
            </div>
        </div>
    `;
}

function createTranslationQuestion(question) {
    return `
        <div class="question-container">
            <div class="question-header">
                <h2>${question.question}</h2>
                ${question.hint ? `<p class="question-hint"><i class="fas fa-lightbulb"></i> ${question.hint}</p>` : ''}
            </div>
            <div class="question-input">
                <input type="text" id="translationInput" placeholder="Enter your translation..." 
                       onkeyup="handleTranslationInput(event)" autocomplete="off">
            </div>
        </div>
    `;
}

function createFillBlankQuestion(question) {
    return `
        <div class="question-container">
            <div class="question-header">
                <h2>${question.question}</h2>
                ${question.hint ? `<p class="question-hint"><i class="fas fa-lightbulb"></i> ${question.hint}</p>` : ''}
            </div>
            <div class="question-sentence">
                <p class="sentence-display">${question.sentence}</p>
            </div>
            <div class="question-input">
                <input type="text" id="fillBlankInput" placeholder="Enter the missing word..." 
                       onkeyup="handleFillBlankInput(event)" autocomplete="off">
            </div>
        </div>
    `;
}

function createAudioQuestion(question) {
    return `
        <div class="question-container">
            <div class="question-header">
                <h2>${question.question}</h2>
            </div>
            <div class="question-audio">
                <button class="audio-btn" onclick="playAudio()">
                    <i class="fas fa-volume-up"></i>
                    <span>Play Audio</span>
                </button>
                <p class="audio-text">"${question.audio}"</p>
            </div>
            <div class="question-options">
                ${question.options.map((option, index) => `
                    <button class="option-btn" data-index="${index}" onclick="selectOption(${index})">
                        ${option}
                    </button>
                `).join('')}
            </div>
        </div>
    `;
}

function setupQuestionListeners(type) {
    if (type === 'translation' || type === 'fill_blank') {
        const input = document.querySelector('input[type="text"]');
        if (input) {
            input.focus();
        }
    }
}

function selectOption(index) {
    // Remove previous selections
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Select current option
    const selectedBtn = document.querySelector(`[data-index="${index}"]`);
    if (selectedBtn) {
        selectedBtn.classList.add('selected');
    }
    
    // Enable check button
    const checkBtn = document.getElementById('checkBtn');
    if (checkBtn) {
        checkBtn.disabled = false;
    }
}

function handleTranslationInput(event) {
    const input = event.target;
    const checkBtn = document.getElementById('checkBtn');
    
    if (checkBtn) {
        checkBtn.disabled = input.value.trim().length === 0;
    }
    
    if (event.key === 'Enter' && !checkBtn.disabled) {
        checkAnswer();
    }
}

function handleFillBlankInput(event) {
    handleTranslationInput(event);
}

function playAudio() {
    // Simulate audio playback
    const audioBtn = document.querySelector('.audio-btn');
    if (audioBtn) {
        audioBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Playing...</span>';
        
        setTimeout(() => {
            audioBtn.innerHTML = '<i class="fas fa-volume-up"></i> <span>Play Again</span>';
        }, 2000);
    }
}

function checkAnswer() {
    const question = lessonQuestions[currentQuestion];
    let userAnswer = null;
    let isCorrect = false;
    
    // Get user answer based on question type
    switch (question.type) {
        case 'multiple_choice':
        case 'audio':
            const selectedOption = document.querySelector('.option-btn.selected');
            if (selectedOption) {
                userAnswer = parseInt(selectedOption.dataset.index);
                isCorrect = userAnswer === question.correct;
            }
            break;
            
        case 'translation':
            const translationInput = document.getElementById('translationInput');
            if (translationInput) {
                userAnswer = translationInput.value.trim().toLowerCase();
                isCorrect = userAnswer === question.answer.toLowerCase() || 
                           (question.alternatives && question.alternatives.some(alt => 
                               alt.toLowerCase() === userAnswer));
            }
            break;
            
        case 'fill_blank':
            const fillBlankInput = document.getElementById('fillBlankInput');
            if (fillBlankInput) {
                userAnswer = fillBlankInput.value.trim().toLowerCase();
                isCorrect = userAnswer === question.answer.toLowerCase();
            }
            break;
    }
    
    // Show result
    showAnswerResult(isCorrect, question);
    
    // Update statistics
    if (isCorrect) {
        correctAnswers++;
    } else {
        hearts--;
        updateHearts();
        
        if (hearts <= 0) {
            failLesson();
            return;
        }
    }
    
    // Update progress
    currentQuestion++;
    updateProgress();
    
    // Change button to continue
    const checkBtn = document.getElementById('checkBtn');
    if (checkBtn) {
        checkBtn.textContent = 'Continue';
        checkBtn.onclick = showQuestion;
        checkBtn.disabled = false;
    }
}

function showAnswerResult(isCorrect, question) {
    const lessonContent = document.getElementById('lessonContent');
    
    let resultHTML = `
        <div class="answer-result ${isCorrect ? 'correct' : 'incorrect'}">
            <div class="result-header">
                <div class="result-icon">
                    <i class="fas fa-${isCorrect ? 'check-circle' : 'times-circle'}"></i>
                </div>
                <h3>${isCorrect ? 'Correct!' : 'Incorrect'}</h3>
            </div>
            <div class="result-content">
    `;
    
    if (!isCorrect) {
        resultHTML += `<p class="correct-answer">Correct answer: <strong>${getCorrectAnswerText(question)}</strong></p>`;
    }
    
    if (question.explanation) {
        resultHTML += `<p class="explanation">${question.explanation}</p>`;
    }
    
    resultHTML += `
            </div>
        </div>
    `;
    
    if (lessonContent) {
        lessonContent.innerHTML = resultHTML;
    }
}

function getCorrectAnswerText(question) {
    switch (question.type) {
        case 'multiple_choice':
        case 'audio':
            return question.options[question.correct];
        case 'translation':
        case 'fill_blank':
            return question.answer;
        default:
            return 'Unknown';
    }
}

function skipQuestion() {
    currentQuestion++;
    updateProgress();
    showQuestion();
}

function completeLesson() {
    const endTime = Date.now();
    const timeSpent = Math.floor((endTime - startTime) / 1000);
    const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
    const xpEarned = Math.max(20, Math.floor(accuracy * 0.8));
    
    // Update lesson stats
    const finalAccuracy = document.getElementById('finalAccuracy');
    const xpEarnedEl = document.getElementById('xpEarned');
    const timeSpentEl = document.getElementById('timeSpent');
    
    if (finalAccuracy) finalAccuracy.textContent = accuracy + '%';
    if (xpEarnedEl) xpEarnedEl.textContent = '+' + xpEarned;
    if (timeSpentEl) {
        const minutes = Math.floor(timeSpent / 60);
        const seconds = timeSpent % 60;
        timeSpentEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Add XP to user progress
    LinguaLeap.addXP(xpEarned);
    
    // Mark lesson as completed
    const lessonId = `${currentLesson.courseId}-lesson-${currentLesson.lessonId}`;
    LinguaLeap.completeLesson(lessonId, xpEarned);
    
    // Show completion modal
    const modal = document.getElementById('lessonCompleteModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function failLesson() {
    alert('You\'ve run out of hearts! Don\'t worry, you can try again.');
    window.location.href = 'courses.html';
}

function reviewLesson() {
    // Restart lesson
    const modal = document.getElementById('lessonCompleteModal');
    if (modal) {
        modal.style.display = 'none';
    }
    
    startLesson();
}

function nextLesson() {
    // Go to next lesson or back to course
    const nextLessonId = parseInt(currentLesson.lessonId) + 1;
    const course = currentLesson.course;
    
    if (course.lessons && nextLessonId <= course.lessons.length) {
        window.location.href = `lesson.html?course=${currentLesson.courseId}&lesson=${nextLessonId}`;
    } else {
        window.location.href = 'courses.html';
    }
}

function exitLesson() {
    if (confirm('Are you sure you want to exit this lesson? Your progress will be lost.')) {
        window.location.href = 'courses.html';
    }
}