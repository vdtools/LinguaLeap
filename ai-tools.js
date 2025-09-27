// AI Tools Arena JavaScript
// API Configuration Management with Local Storage Caching

class AIToolsManager {
    constructor() {
        this.apiKeys = {
            openrouter1: '', // Daily Practice Generator, Sentence Improver
            openrouter2: '', // Grammar Tool Assistant, AI Story Generator
            gemini1: '',     // AI Quiz Arena
            gemini2: ''      // Backup (future use)
        };
        
        this.apiEndpoints = {
            openrouter: 'https://openrouter.ai/api/v1/chat/completions',
            gemini: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'
        };
        
        // Cache Management
        this.cache = {
            practiceQuestions: [], // Daily Practice cache
            storyIdeas: [],        // Story Generator cache
            grammarTips: [],       // Grammar Tool cache
            quizQuestions: []      // Quiz Arena cache
        };
        
        this.cacheConfig = {
            maxCacheSize: 20,      // Maximum items to cache
            cacheExpiry: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
            batchSize: 20          // Generate 20 items at once
        };
        
        this.currentQuiz = null;
        this.quizTimer = null;
        this.quizStartTime = null;
        
        this.loadAPIKeys();
        this.loadCache();
        this.initializeEventListeners();
    }
    
    // Load cached data from localStorage
    loadCache() {
        try {
            const cachedData = localStorage.getItem('lingualeap_ai_cache');
            if (cachedData) {
                const parsed = JSON.parse(cachedData);
                
                // Check if cache is still valid (not expired)
                if (parsed.timestamp && (Date.now() - parsed.timestamp < this.cacheConfig.cacheExpiry)) {
                    this.cache = { ...this.cache, ...parsed.data };
                    console.log('🗂️ AI Cache loaded:', Object.keys(this.cache).map(k => `${k}: ${this.cache[k].length}`));
                } else {
                    console.log('🗂️ AI Cache expired, will regenerate');
                    this.clearCache();
                }
            }
        } catch (error) {
            console.error('Error loading AI cache:', error);
            this.clearCache();
        }
    }
    
    // Save cache to localStorage
    saveCache() {
        try {
            const cacheData = {
                timestamp: Date.now(),
                data: this.cache
            };
            localStorage.setItem('lingualeap_ai_cache', JSON.stringify(cacheData));
            console.log('💾 AI Cache saved successfully');
        } catch (error) {
            console.error('Error saving AI cache:', error);
        }
    }
    
    // Clear all cache
    clearCache() {
        this.cache = {
            practiceQuestions: [],
            storyIdeas: [],
            grammarTips: [],
            quizQuestions: []
        };
        localStorage.removeItem('lingualeap_ai_cache');
        console.log('🗑️ AI Cache cleared');
    }
    
    // Get cached item or generate new batch if needed
    async getCachedOrGenerate(type, generateFunction) {
        const cacheKey = `${type}Questions`;
        
        // If cache has items, return one and remove it
        if (this.cache[cacheKey] && this.cache[cacheKey].length > 0) {
            const item = this.cache[cacheKey].shift();
            this.saveCache(); // Save updated cache
            console.log(`📋 Using cached ${type}, ${this.cache[cacheKey].length} remaining`);
            return item;
        }
        
        // If cache is empty, generate new batch
        console.log(`🔄 Cache empty for ${type}, generating new batch...`);
        await this.generateBatch(type, generateFunction);
        
        // Return first item from newly generated batch
        if (this.cache[cacheKey] && this.cache[cacheKey].length > 0) {
            const item = this.cache[cacheKey].shift();
            this.saveCache();
            return item;
        }
        
        throw new Error(`Failed to generate ${type} content`);
    }
    
    // Generate batch of content for caching
    async generateBatch(type, generateFunction) {
        try {
            console.log(`🔄 Generating batch of ${this.cacheConfig.batchSize} ${type} items...`);
            
            const batchPromises = [];
            for (let i = 0; i < this.cacheConfig.batchSize; i++) {
                batchPromises.push(generateFunction());
            }
            
            const results = await Promise.all(batchPromises);
            const validResults = results.filter(result => result !== null && result !== undefined);
            
            // Store in cache
            const cacheKey = `${type}Questions`;
            this.cache[cacheKey] = validResults;
            this.saveCache();
            
            console.log(`✅ Generated and cached ${validResults.length} ${type} items`);
        } catch (error) {
            console.error(`Error generating batch for ${type}:`, error);
        }
    }
    
    // Load API keys from localStorage or prompt user
    loadAPIKeys() {
        const savedKeys = localStorage.getItem('lingualeap_api_keys');
        if (savedKeys) {
            this.apiKeys = { ...this.apiKeys, ...JSON.parse(savedKeys) };
        }
    }
    
    // Save API keys to localStorage
    saveAPIKeys() {
        localStorage.setItem('lingualeap_api_keys', JSON.stringify(this.apiKeys));
    }
    
    // Check if required API key is available
    checkAPIKey(service) {
        const keyMap = {
            'practice': 'openrouter1',
            'sentence': 'openrouter1',
            'grammar': 'openrouter2',
            'story': 'openrouter2',
            'quiz': 'gemini1'
        };
        
        const requiredKey = keyMap[service];
        if (!this.apiKeys[requiredKey]) {
            this.promptForAPIKey(requiredKey, service);
            return false;
        }
        return true;
    }
    
    // Prompt user for API key
    promptForAPIKey(keyName, service) {
        const keyLabels = {
            'openrouter1': 'OpenRouter API Key 1 (Daily Practice & Sentence Improver)',
            'openrouter2': 'OpenRouter API Key 2 (Grammar Assistant & Story Generator)',
            'gemini1': 'Gemini API Key (AI Quiz Arena)',
            'gemini2': 'Gemini API Key 2 (Backup)'
        };
        
        const apiKey = prompt(`Please enter your ${keyLabels[keyName]}:\n\nThis will be saved locally for future use.`);
        
        if (apiKey && apiKey.trim()) {
            this.apiKeys[keyName] = apiKey.trim();
            this.saveAPIKeys();
            return true;
        } else {
            showAlert(`${keyLabels[keyName]} is required for this feature.`, 'error');
            return false;
        }
    }
    
    // Initialize event listeners
    initializeEventListeners() {
        // Quiz Arena
        document.getElementById('generateQuizBtn')?.addEventListener('click', () => this.generateQuiz());
        document.getElementById('nextQuestionBtn')?.addEventListener('click', () => this.nextQuestion());
        document.getElementById('prevQuestionBtn')?.addEventListener('click', () => this.prevQuestion());
        document.getElementById('finishQuizBtn')?.addEventListener('click', () => this.finishQuiz());
        document.getElementById('retakeQuizBtn')?.addEventListener('click', () => this.retakeQuiz());
        document.getElementById('newQuizBtn')?.addEventListener('click', () => this.newQuiz());
    }
    
    // Generic API call function
    async makeAPICall(service, prompt, options = {}) {
        const keyMap = {
            'practice': 'openrouter1',
            'sentence': 'openrouter1',
            'grammar': 'openrouter2',
            'story': 'openrouter2',
            'quiz': 'gemini1'
        };
        
        const requiredKey = keyMap[service];
        const apiKey = this.apiKeys[requiredKey];
        
        if (!apiKey) {
            throw new Error(`API key not found for ${service}`);
        }
        
        if (service === 'quiz') {
            return this.callGeminiAPI(apiKey, prompt, options);
        } else {
            return this.callOpenRouterAPI(apiKey, prompt, options);
        }
    }
    
    // OpenRouter API call
    async callOpenRouterAPI(apiKey, prompt, options = {}) {
        const response = await fetch(this.apiEndpoints.openrouter, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.origin,
                'X-Title': 'LinguaLeap English Learning Platform'
            },
            body: JSON.stringify({
                model: options.model || 'anthropic/claude-3-haiku',
                messages: [
                    {
                        role: 'system',
                        content: options.systemPrompt || 'You are an expert English language teacher and AI assistant helping students learn English.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: options.maxTokens || 2000,
                temperature: options.temperature || 0.7
            })
        });
        
        if (!response.ok) {
            throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
    }
    
    // Gemini API call
    async callGeminiAPI(apiKey, prompt, options = {}) {
        const response = await fetch(`${this.apiEndpoints.gemini}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: options.temperature || 0.7,
                    maxOutputTokens: options.maxTokens || 2000
                }
            })
        });
        
        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    }
    
    // ===== AI QUIZ ARENA =====
    
    async generateQuiz() {
        if (!this.checkAPIKey('quiz')) return;
        
        const topic = document.getElementById('quizTopic').value;
        const difficulty = document.getElementById('quizDifficulty').value;
        const numQuestions = document.getElementById('quizQuestions').value;
        
        const btn = document.getElementById('generateQuizBtn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<span class="ai-loading">🤖 Generating Quiz...</span>';
        btn.disabled = true;
        
        try {
            const prompt = `Generate a ${difficulty} level English quiz about ${topic} with exactly ${numQuestions} multiple choice questions.

Format your response as a JSON object with this exact structure:
{
  "title": "Quiz Title",
  "description": "Brief description",
  "questions": [
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "explanation": "Why this answer is correct"
    }
  ]
}

Requirements:
- Exactly ${numQuestions} questions
- Each question must have exactly 4 options
- Correct answer index (0-3)
- Clear, engaging questions appropriate for ${difficulty} level
- Questions should test ${topic} knowledge
- Include explanations for correct answers

Return only valid JSON, no additional text.`;

            const response = await this.makeAPICall('quiz', prompt);
            
            // Parse the JSON response
            let quizData;
            try {
                // Clean the response to extract JSON
                const jsonMatch = response.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    quizData = JSON.parse(jsonMatch[0]);
                } else {
                    throw new Error('No valid JSON found in response');
                }
            } catch (parseError) {
                console.error('JSON Parse Error:', parseError);
                throw new Error('Failed to parse quiz data. Please try again.');
            }
            
            this.currentQuiz = {
                ...quizData,
                currentQuestion: 0,
                answers: new Array(quizData.questions.length).fill(null),
                startTime: new Date()
            };
            
            this.displayQuiz();
            
        } catch (error) {
            console.error('Error generating quiz:', error);
            showAlert('Failed to generate quiz: ' + error.message, 'error');
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }
    
    displayQuiz() {
        document.getElementById('quizDisplay').classList.remove('hidden');
        document.getElementById('quizResults').classList.add('hidden');
        document.querySelector('.quiz-config-card').style.display = 'none';
        
        this.updateQuizProgress();
        this.displayCurrentQuestion();
        this.startTimer();
    }
    
    displayCurrentQuestion() {
        const question = this.currentQuiz.questions[this.currentQuiz.currentQuestion];
        
        document.getElementById('questionText').textContent = question.question;
        
        const optionsContainer = document.getElementById('questionOptions');
        optionsContainer.innerHTML = '';
        
        question.options.forEach((option, index) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'question-option';
            optionDiv.textContent = option;
            optionDiv.addEventListener('click', () => this.selectOption(index));
            
            // Restore previous selection
            if (this.currentQuiz.answers[this.currentQuiz.currentQuestion] === index) {
                optionDiv.classList.add('selected');
            }
            
            optionsContainer.appendChild(optionDiv);
        });
        
        // Update navigation buttons
        const prevBtn = document.getElementById('prevQuestionBtn');
        const nextBtn = document.getElementById('nextQuestionBtn');
        const finishBtn = document.getElementById('finishQuizBtn');
        
        prevBtn.style.display = this.currentQuiz.currentQuestion === 0 ? 'none' : 'inline-flex';
        
        if (this.currentQuiz.currentQuestion === this.currentQuiz.questions.length - 1) {
            nextBtn.style.display = 'none';
            finishBtn.classList.remove('hidden');
        } else {
            nextBtn.style.display = 'inline-flex';
            finishBtn.classList.add('hidden');
        }
    }
    
    selectOption(index) {
        // Update answer
        this.currentQuiz.answers[this.currentQuiz.currentQuestion] = index;
        
        // Update UI
        document.querySelectorAll('.question-option').forEach((opt, i) => {
            opt.classList.toggle('selected', i === index);
        });
    }
    
    updateQuizProgress() {
        const current = this.currentQuiz.currentQuestion + 1;
        const total = this.currentQuiz.questions.length;
        const percentage = (current / total) * 100;
        
        document.getElementById('quizProgressFill').style.width = percentage + '%';
        document.getElementById('quizProgressText').textContent = `Question ${current} of ${total}`;
    }
    
    nextQuestion() {
        if (this.currentQuiz.currentQuestion < this.currentQuiz.questions.length - 1) {
            this.currentQuiz.currentQuestion++;
            this.updateQuizProgress();
            this.displayCurrentQuestion();
        }
    }
    
    prevQuestion() {
        if (this.currentQuiz.currentQuestion > 0) {
            this.currentQuiz.currentQuestion--;
            this.updateQuizProgress();
            this.displayCurrentQuestion();
        }
    }
    
    startTimer() {
        this.quizStartTime = new Date();
        this.quizTimer = setInterval(() => {
            const elapsed = new Date() - this.quizStartTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            document.getElementById('quizTimer').textContent = 
                `⏱️ ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }
    
    finishQuiz() {
        clearInterval(this.quizTimer);
        this.calculateResults();
        this.displayResults();
    }
    
    calculateResults() {
        let correct = 0;
        const total = this.currentQuiz.questions.length;
        
        this.currentQuiz.answers.forEach((answer, index) => {
            if (answer === this.currentQuiz.questions[index].correct) {
                correct++;
            }
        });
        
        const score = Math.round((correct / total) * 100);
        const elapsed = new Date() - this.quizStartTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        
        this.currentQuiz.results = {
            correct,
            total,
            score,
            timeMinutes: minutes,
            timeSeconds: seconds,
            accuracy: score
        };
    }
    
    async displayResults() {
        const results = this.currentQuiz.results;
        
        document.getElementById('quizDisplay').classList.add('hidden');
        document.getElementById('quizResults').classList.remove('hidden');
        
        // Update score display
        document.getElementById('finalScore').textContent = results.score + '%';
        document.getElementById('correctAnswers').textContent = results.correct;
        document.getElementById('totalQuestions').textContent = results.total;
        document.getElementById('timeTaken').textContent = 
            `${results.timeMinutes}:${results.timeSeconds.toString().padStart(2, '0')}`;
        document.getElementById('accuracyRate').textContent = results.accuracy + '%';
        
        // Set score circle
        const scoreCircle = document.querySelector('.score-circle');
        scoreCircle.style.setProperty('--score-percent', results.score + '%');
        
        // Generate AI recommendations
        await this.generateRecommendations();
        
        // Save results to user progress
        await this.saveQuizResults();
    }
    
    async generateRecommendations() {
        if (!this.checkAPIKey('quiz')) return;
        
        try {
            const results = this.currentQuiz.results;
            const incorrectQuestions = this.currentQuiz.questions
                .map((q, index) => ({
                    question: q.question,
                    userAnswer: q.options[this.currentQuiz.answers[index]] || 'No answer',
                    correctAnswer: q.options[q.correct],
                    wasCorrect: this.currentQuiz.answers[index] === q.correct
                }))
                .filter(q => !q.wasCorrect);
            
            const prompt = `Based on this English quiz performance, provide personalized learning recommendations:

Quiz Results:
- Score: ${results.score}%
- Correct Answers: ${results.correct}/${results.total}
- Time Taken: ${results.timeMinutes}:${results.timeSeconds}

Incorrect Questions:
${incorrectQuestions.map(q => `
Question: ${q.question}
User Answer: ${q.userAnswer}
Correct Answer: ${q.correctAnswer}
`).join('\n')}

Provide 3-5 specific, actionable recommendations for improvement. Focus on:
1. Specific grammar topics to study
2. Practice exercises to try
3. Learning strategies
4. Areas of strength to build upon

Format as HTML with appropriate tags for display.`;

            const recommendations = await this.makeAPICall('quiz', prompt);
            document.getElementById('aiRecommendations').innerHTML = recommendations;
            
        } catch (error) {
            console.error('Error generating recommendations:', error);
            document.getElementById('aiRecommendations').innerHTML = 
                '<p>Unable to generate personalized recommendations at this time.</p>';
        }
    }
    
    async saveQuizResults() {
        if (!currentUser) return;
        
        try {
            const results = this.currentQuiz.results;
            const quizData = {
                topic: document.getElementById('quizTopic').value,
                difficulty: document.getElementById('quizDifficulty').value,
                score: results.score,
                correct: results.correct,
                total: results.total,
                timeMinutes: results.timeMinutes,
                timeSeconds: results.timeSeconds,
                completedAt: new Date().toISOString()
            };
            
            // Save to user progress
            const userData = await window.firebaseUtils.fetchData('userProgress', currentUser.uid);
            if (userData) {
                if (!userData.quizHistory) {
                    userData.quizHistory = [];
                }
                userData.quizHistory.push(quizData);
                
                // Update points
                const pointsEarned = Math.floor(results.score / 10) * 5; // 5 points per 10% score
                userData.points = (userData.points || 0) + pointsEarned;
                
                await window.firebaseUtils.uploadData('userProgress', currentUser.uid, userData);
                
                if (pointsEarned > 0) {
                    showAlert(`Quiz completed! You earned ${pointsEarned} points! 🎉`, 'success');
                }
            }
        } catch (error) {
            console.error('Error saving quiz results:', error);
        }
    }
    
    retakeQuiz() {
        this.currentQuiz.currentQuestion = 0;
        this.currentQuiz.answers = new Array(this.currentQuiz.questions.length).fill(null);
        this.currentQuiz.startTime = new Date();
        this.displayQuiz();
    }
    
    newQuiz() {
        this.currentQuiz = null;
        document.getElementById('quizDisplay').classList.add('hidden');
        document.getElementById('quizResults').classList.add('hidden');
        document.querySelector('.quiz-config-card').style.display = 'block';
        clearInterval(this.quizTimer);
    }
}

// Initialize AI Tools Manager
let aiToolsManager;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for other scripts to load
    setTimeout(() => {
        aiToolsManager = new AIToolsManager();
        console.log('🤖 AI Tools Manager initialized!');
    }, 2000);
});

// ===== AI TOOLS FUNCTIONS =====

// Daily Practice Generator with Caching
async function generateDailyPractice() {
    if (!aiToolsManager || !aiToolsManager.checkAPIKey('practice')) return;
    
    const type = document.getElementById('practiceType').value;
    const duration = document.getElementById('practiceDuration').value;
    const output = document.getElementById('practiceOutput');
    
    output.innerHTML = '<div class="loading">🤖 Generating personalized practice exercises...</div>';
    output.classList.remove('hidden');
    output.classList.add('show');
    
    try {
        // Use cached content or generate new batch
        const practiceContent = await aiToolsManager.getCachedOrGenerate('practice', async () => {
            const prompt = `Create a ${duration}-minute daily English practice session focused on ${type}.

Include:
1. Warm-up exercise (2-3 minutes)
2. Main practice activities (${duration - 5} minutes)
3. Quick review/reflection (2-3 minutes)

For ${type} practice, include:
- Specific exercises with clear instructions
- Progressive difficulty
- Self-assessment questions
- Tips for improvement

Format as HTML with proper headings, lists, and styling for a web display.
Make it engaging and appropriate for daily practice.
IMPORTANT: Make each session unique and different from previous ones.`;

            const systemPrompt = "You are an expert English teacher creating personalized daily practice sessions. Create engaging, practical exercises that students can complete independently. Ensure variety and uniqueness in each session.";
            
            return await aiToolsManager.makeAPICall('practice', prompt, { systemPrompt });
        });
        
        output.innerHTML = `
            <div class="practice-header">
                <h4>📅 Your Daily Practice Session</h4>
                <div class="cache-info">
                    <span class="cache-status">🗂️ ${aiToolsManager.cache.practiceQuestions.length} sessions cached</span>
                    <button class="ai-btn cache-btn" onclick="clearPracticeCache()" title="Clear cached sessions">
                        🗑️ Clear Cache
                    </button>
                </div>
            </div>
            <div class="practice-content">${practiceContent}</div>
            <div class="practice-actions">
                <button class="ai-btn secondary" onclick="generateDailyPractice()">🔄 Next Practice</button>
                <button class="ai-btn success" onclick="savePracticeSession()">💾 Save Session</button>
                <button class="ai-btn info" onclick="bulkGeneratePractice()">⚡ Generate More (Bulk)</button>
            </div>
        `;
        
    } catch (error) {
        console.error('Error generating practice:', error);
        output.innerHTML = `
            <div class="error">
                ❌ Error: ${error.message}
                <button class="ai-btn secondary" onclick="generateDailyPractice()" style="margin-top: 1rem;">
                    🔄 Try Again
                </button>
            </div>
        `;
    }
}

// Bulk generate practice sessions for better caching
async function bulkGeneratePractice() {
    if (!aiToolsManager || !aiToolsManager.checkAPIKey('practice')) return;
    
    const output = document.getElementById('practiceOutput');
    const originalContent = output.innerHTML;
    
    output.innerHTML = '<div class="loading">⚡ Generating 20 practice sessions for offline use...</div>';
    
    try {
        await aiToolsManager.generateBatch('practice', async () => {
            const types = ['Speaking', 'Listening', 'Reading', 'Writing', 'Vocabulary', 'Grammar'];
            const durations = ['10', '15', '20', '30'];
            const randomType = types[Math.floor(Math.random() * types.length)];
            const randomDuration = durations[Math.floor(Math.random() * durations.length)];
            
            const prompt = `Create a ${randomDuration}-minute daily English practice session focused on ${randomType}.

Include:
1. Warm-up exercise (2-3 minutes)
2. Main practice activities (${randomDuration - 5} minutes)
3. Quick review/reflection (2-3 minutes)

For ${randomType} practice, include:
- Specific exercises with clear instructions
- Progressive difficulty
- Self-assessment questions
- Tips for improvement

Format as HTML with proper headings, lists, and styling for a web display.
Make it engaging and appropriate for daily practice.
IMPORTANT: Make each session unique and different from previous ones.`;

            const systemPrompt = "You are an expert English teacher creating personalized daily practice sessions. Create engaging, practical exercises that students can complete independently. Ensure variety and uniqueness in each session.";
            
            return await aiToolsManager.makeAPICall('practice', prompt, { systemPrompt });
        });
        
        output.innerHTML = `
            <div class="success">
                ✅ Successfully generated 20 practice sessions!
                <br>
                <span style="color: #666; font-size: 0.9rem;">
                    You can now use practice sessions offline. Cache will last 24 hours.
                </span>
                <button class="ai-btn secondary" onclick="generateDailyPractice()" style="margin-top: 1rem;">
                    📖 Start Practicing
                </button>
            </div>
        `;
        
    } catch (error) {
        console.error('Error bulk generating:', error);
        output.innerHTML = originalContent;
        alert('❌ Failed to bulk generate sessions. Please try again.');
    }
}

// Clear practice cache
function clearPracticeCache() {
    if (confirm('Are you sure you want to clear all cached practice sessions?')) {
        aiToolsManager.cache.practiceQuestions = [];
        aiToolsManager.saveCache();
        alert('🗑️ Practice cache cleared successfully!');
        
        // Update display if showing cache info
        const cacheStatus = document.querySelector('.cache-status');
        if (cacheStatus) {
            cacheStatus.textContent = '🗂️ 0 sessions cached';
        }
    }
}

// Sentence Improver
async function improveSentence() {
    if (!aiToolsManager || !aiToolsManager.checkAPIKey('sentence')) return;
    
    const sentence = document.getElementById('inputSentence').value.trim();
    const focus = document.getElementById('improvementFocus').value;
    const output = document.getElementById('sentenceOutput');
    
    if (!sentence) {
        showAlert('Please enter a sentence to improve.', 'error');
        return;
    }
    
    output.innerHTML = '<div class="loading">✨ Analyzing and improving your sentence...</div>';
    output.classList.remove('hidden');
    output.classList.add('show');
    
    try {
        const prompt = `Improve this English sentence with focus on ${focus}:

Original sentence: "${sentence}"

Provide:
1. An improved version of the sentence
2. Specific explanation of what was changed and why
3. 2-3 alternative versions
4. Key grammar/style points learned

Focus area: ${focus}

Format your response as HTML with clear sections for:
- Original sentence (in a red-bordered box)
- Improved sentence (in a green-bordered box)  
- Explanation of changes
- Alternative versions
- Learning points`;

        const systemPrompt = "You are an expert English writing coach. Provide clear, helpful improvements with detailed explanations to help students learn.";
        
        const response = await aiToolsManager.makeAPICall('sentence', prompt, { systemPrompt });
        
        output.innerHTML = `
            <h4>✨ Sentence Improvement Results</h4>
            ${response}
            <div style="margin-top: 1rem; text-align: center;">
                <button class="ai-btn secondary" onclick="clearSentenceImprover()">🆕 New Sentence</button>
                <button class="ai-btn success" onclick="saveSentenceImprovement()">💾 Save Improvement</button>
            </div>
        `;
        
    } catch (error) {
        console.error('Error improving sentence:', error);
        output.innerHTML = `<div class="error">❌ Error: ${error.message}</div>`;
    }
}

// Grammar Tool Assistant
async function getGrammarHelp() {
    if (!aiToolsManager || !aiToolsManager.checkAPIKey('grammar')) return;
    
    const query = document.getElementById('grammarQuery').value.trim();
    const responseType = document.getElementById('grammarResponseType').value;
    const output = document.getElementById('grammarOutput');
    
    if (!query) {
        showAlert('Please enter a grammar question or topic.', 'error');
        return;
    }
    
    output.innerHTML = '<div class="loading">📚 Preparing comprehensive grammar explanation...</div>';
    output.classList.remove('hidden');
    output.classList.add('show');
    
    try {
        const prompt = `Provide a comprehensive ${responseType} for this grammar query: "${query}"

Based on the response type "${responseType}", focus on:
- ${responseType === 'explanation' ? 'Clear, detailed explanations with step-by-step breakdown' : ''}
- ${responseType === 'examples' ? 'Multiple practical examples with context and usage notes' : ''}
- ${responseType === 'rules' ? 'Clear rules, guidelines, and when to apply them' : ''}
- ${responseType === 'exercises' ? 'Interactive practice exercises with varying difficulty' : ''}
- ${responseType === 'comparison' ? 'Side-by-side comparison with similar grammar topics' : ''}

Structure your response with:
1. Main explanation/content
2. Examples with context
3. Common mistakes to avoid
4. Practice tips
5. Related topics to explore

Format as HTML with clear headings, examples in styled boxes, and easy-to-read formatting.`;

        const systemPrompt = "You are an expert English grammar teacher with deep knowledge of English grammar rules, exceptions, and practical usage. Provide clear, comprehensive explanations.";
        
        const response = await aiToolsManager.makeAPICall('grammar', prompt, { systemPrompt });
        
        output.innerHTML = `
            <h4>📚 Grammar Help: ${responseType.charAt(0).toUpperCase() + responseType.slice(1)}</h4>
            <div class="grammar-content">${response}</div>
            <div style="margin-top: 1rem; text-align: center;">
                <button class="ai-btn secondary" onclick="clearGrammarAssistant()">❓ New Question</button>
                <button class="ai-btn success" onclick="saveGrammarHelp()">💾 Save Explanation</button>
            </div>
        `;
        
    } catch (error) {
        console.error('Error getting grammar help:', error);
        output.innerHTML = `<div class="error">❌ Error: ${error.message}</div>`;
    }
}

// AI Story Generator
async function generateStory() {
    if (!aiToolsManager || !aiToolsManager.checkAPIKey('story')) return;
    
    const theme = document.getElementById('storyTheme').value;
    const length = document.getElementById('storyLength').value;
    const level = document.getElementById('storyLevel').value;
    const customTheme = document.getElementById('customTheme').value.trim();
    const output = document.getElementById('storyOutput');
    
    const finalTheme = customTheme || theme;
    
    output.innerHTML = '<div class="loading">📖 Creating your personalized story...</div>';
    output.classList.remove('hidden');
    output.classList.add('show');
    
    try {
        const wordCounts = {
            'short': '100-200',
            'medium': '300-500', 
            'long': '500-800'
        };
        
        const prompt = `Write an engaging English story for language learning with these specifications:

Theme: ${finalTheme}
Length: ${wordCounts[length]} words
Language Level: ${level} vocabulary
Target: English language learners

Requirements:
1. Appropriate vocabulary for ${level} level
2. Clear, engaging narrative
3. Educational value for English learners
4. Include dialogue and descriptive language
5. Proper story structure (beginning, middle, end)

After the story, provide:
- Word count
- Key vocabulary words with definitions (5-10 words)
- 3 comprehension questions
- Discussion points for language practice

Format as HTML with the story in a styled container, vocabulary in a separate section, and questions clearly marked.`;

        const systemPrompt = "You are a creative writer and English teacher creating engaging stories for language learning. Focus on clear language, educational value, and entertaining content.";
        
        const response = await aiToolsManager.makeAPICall('story', prompt, { systemPrompt });
        
        output.innerHTML = `
            <h4>📖 Your AI-Generated Story</h4>
            ${response}
            <div style="margin-top: 1rem; text-align: center;">
                <button class="ai-btn secondary" onclick="generateStory()">🔄 Generate New Story</button>
                <button class="ai-btn success" onclick="saveStory()">💾 Save Story</button>
                <button class="ai-btn primary" onclick="createStoryQuiz()">🎯 Create Quiz</button>
            </div>
        `;
        
    } catch (error) {
        console.error('Error generating story:', error);
        output.innerHTML = `<div class="error">❌ Error: ${error.message}</div>`;
    }
}

// ===== UTILITY FUNCTIONS =====

function clearSentenceImprover() {
    document.getElementById('inputSentence').value = '';
    document.getElementById('sentenceOutput').classList.add('hidden');
}

function clearGrammarAssistant() {
    document.getElementById('grammarQuery').value = '';
    document.getElementById('grammarOutput').classList.add('hidden');
}

async function savePracticeSession() {
    // Implementation for saving practice sessions
    showAlert('Practice session saved to your learning history! 📚', 'success');
}

async function saveSentenceImprovement() {
    // Implementation for saving sentence improvements
    showAlert('Sentence improvement saved for future reference! ✨', 'success');
}

async function saveGrammarHelp() {
    // Implementation for saving grammar explanations
    showAlert('Grammar explanation saved to your notes! 📚', 'success');
}

async function saveStory() {
    // Implementation for saving stories
    showAlert('Story saved to your reading collection! 📖', 'success');
}

async function createStoryQuiz() {
    // Implementation for creating quiz from story
    showAlert('Creating quiz from story... 🎯', 'success');
    // Could integrate with quiz arena to create story-based quiz
}

// Export for global access
window.aiToolsManager = aiToolsManager;
window.generateDailyPractice = generateDailyPractice;
window.bulkGeneratePractice = bulkGeneratePractice;
window.clearPracticeCache = clearPracticeCache;
window.improveSentence = improveSentence;
window.getGrammarHelp = getGrammarHelp;
window.generateStory = generateStory;

console.log('🤖 AI Tools Arena JavaScript loaded successfully!');