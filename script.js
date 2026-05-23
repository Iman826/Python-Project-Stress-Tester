let questions = [];

let currentQuestionIndex = 0;
let answers = {};

// DOM Elements
const startScreen = document.getElementById('start-screen');
const questionScreen = document.getElementById('question-screen');
const successScreen = document.getElementById('success-screen');
const surveyCard = document.getElementById('survey-card');

const startBtn = document.getElementById('start-btn');
const nextBtn = document.getElementById('next-btn');
const prevBtn = document.getElementById('prev-btn');
const restartBtn = document.getElementById('restart-btn');

const progressBar = document.getElementById('progress-bar');
const questionNumberEl = document.getElementById('question-number');
const questionTotalEl = document.getElementById('question-total');
const questionContentEl = document.getElementById('question-content');

// Helper functions for UI
window.handleRadioClick = (label, qId, val) => {
    // Visual selection
    const container = label.parentElement;
    const allLabels = container.querySelectorAll('.radio-label');
    allLabels.forEach(l => l.classList.remove('selected'));
    label.classList.add('selected');

    // Check hidden radio
    const input = label.querySelector('input');
    input.checked = true;

    answers[qId] = val;
    updateNavigationButtons();
};

window.handleTextInput = (input, qId) => {
    answers[qId] = input.value.trim();
    updateNavigationButtons();
};

// Event Listeners
startBtn.addEventListener('click', startSurvey);
nextBtn.addEventListener('click', handleNext);
prevBtn.addEventListener('click', handlePrev);
restartBtn.addEventListener('click', resetSurvey);

// Initialize: Fetch Questions
async function init() {
    try {
        startBtn.disabled = true;
        startBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Loading...';

        const response = await fetch('/questions');
        if (!response.ok) throw new Error('Failed to load questions');

        questions = await response.json();
        console.log('Questions loaded:', questions);

        startBtn.disabled = false;
        startBtn.innerHTML = 'Start Survey <i class="fa-solid fa-arrow-right"></i>';

    } catch (error) {
        console.error('Init Error:', error);
        startBtn.innerHTML = 'Connection Failed';
        alert('Could not connect to server. Ensure python server.py is running.');
    }
}

// Call init on load
init();

function startSurvey() {
    startScreen.classList.remove('active');
    startScreen.classList.add('hidden');

    questionScreen.classList.remove('hidden');
    setTimeout(() => {
        questionScreen.classList.add('active');
    }, 10);

    renderQuestion();
}

function resetSurvey() {
    currentQuestionIndex = 0;
    answers = {};

    successScreen.classList.remove('active');
    successScreen.classList.add('hidden');

    startScreen.classList.remove('hidden');
    setTimeout(() => {
        startScreen.classList.add('active');
    }, 10);
}

function renderQuestion() {
    const question = questions[currentQuestionIndex];

    // Update Header
    questionNumberEl.textContent = (currentQuestionIndex + 1).toString().padStart(2, '0');
    questionTotalEl.textContent = `/ ${questions.length.toString().padStart(2, '0')}`;

    // Update Progress
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    progressBar.style.width = `${progress}%`;

    // Render Content
    let html = `<div class="question-text">${question.text}</div>`;

    if (question.type === 'radio') {
        html += `<div class="answers-container ${question.scrollable ? 'scrollable-options' : ''}">`;
        question.options.forEach((opt) => {
            const isSelected = answers[question.id] === opt ? 'checked' : '';
            const selectedClass = answers[question.id] === opt ? 'selected' : '';
            html += `
                <label class="radio-label ${selectedClass}" onclick="handleRadioClick(this, '${question.id}', '${opt}')">
                    <input type="radio" name="q_${question.id}" class="radio-input" value="${opt}" ${isSelected}>
                    <span>${opt}</span>
                </label>
            `;
        });
        html += `</div>`;
    } else if (question.type === 'text') {
        const val = answers[question.id] || '';
        const type = question.inputType || 'text';
        html += `
            <input type="${type}" class="text-input" placeholder="${question.placeholder}" oninput="handleTextInput(this, '${question.id}')" value="${val}">
        `;
    }

    questionContentEl.innerHTML = html;
    updateNavigationButtons();
}

function updateNavigationButtons() {
    // Back Button
    if (currentQuestionIndex === 0) {
        prevBtn.classList.add('hidden');
    } else {
        prevBtn.classList.remove('hidden');
    }

    // Next Button
    const currentQId = questions[currentQuestionIndex].id;
    const hasAnswer = answers[currentQId] !== undefined && answers[currentQId] !== '';

    nextBtn.disabled = !hasAnswer;

    if (currentQuestionIndex === questions.length - 1) {
        nextBtn.innerHTML = 'Calculate Stress <i class="fa-solid fa-chart-pie"></i>';
    } else {
        nextBtn.innerHTML = 'Next <i class="fa-solid fa-arrow-right"></i>';
    }
}

function handleNext() {
    if (currentQuestionIndex < questions.length - 1) {
        animateTransition(() => {
            currentQuestionIndex++;
            renderQuestion();
        });
    } else {
        submitSurvey();
    }
}

function handlePrev() {
    if (currentQuestionIndex > 0) {
        animateTransition(() => {
            currentQuestionIndex--;
            renderQuestion();
        });
    }
}

function animateTransition(callback) {
    questionContentEl.style.opacity = '0';
    questionContentEl.style.transform = 'translateX(-10px)';

    setTimeout(() => {
        callback();
        questionContentEl.style.opacity = '0';
        questionContentEl.style.transform = 'translateX(10px)';

        requestAnimationFrame(() => {
            questionContentEl.style.transition = 'all 0.3s ease';
            questionContentEl.style.opacity = '1';
            questionContentEl.style.transform = 'translateX(0)';

            setTimeout(() => {
                questionContentEl.style.transition = '';
            }, 300);
        });
    }, 200);
}

async function submitSurvey() {
    console.log('Survey Answers:', answers);

    // Prepare data for API
    // Map Question IDs to Feature Names
    const payload = {
        'Gender': answers[1],
        'Age': parseInt(answers[2]),
        'Occupation': answers[3],
        'Sleep Duration': parseFloat(answers[4]),
        'Physical Activity Level': parseInt(answers[6]),
        'BMI Category': answers[8],
        'Blood Pressure': answers[9]
        // Heart Rate / Steps removed per user request for simplicity? 
        // No, user said "sleep wala dataset...", missing cols like HR/Steps were issue in text paste
        // We removed them from Script.js questions list for now as we are doing Sleep Dataset Single Mode which HAS BP but maybe not HR/Steps if rows truncated.
        // Wait, the sleep dataset DOES have HR/Steps in the original header, but my partial rows ended at BP.
        // So I should validly send what I have.
    };

    try {
        nextBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Analyzing...';

        const response = await fetch('/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.stress_level !== undefined) {
            showSuccess(data);
        } else {
            console.error(data.error);
            alert('Error predicting stress. Please try again.');
        }

    } catch (error) {
        console.error('API Error:', error);
        alert('Server not connected. Please run "python server.py"');
    }
}

function showSuccess(data) {
    questionScreen.classList.remove('active');
    questionScreen.classList.add('hidden');

    successScreen.classList.remove('hidden');
    setTimeout(() => {
        successScreen.classList.add('active');
    }, 10);

    // Inject Result HTML
    const level = data.stress_level; // 1-10
    const color = level <= 3 ? '#22c55e' : level <= 6 ? '#eab308' : '#ef4444';
    const status = level <= 3 ? 'Low Stress' : level <= 6 ? 'Moderate Stress' : 'High Stress';

    // Reuse pie slice gen logic or simple conic-gradient
    const percentage = (level / 10) * 100;

    const resultHtml = `
        <div class="result-header">
            <h2 style="color: ${color}">${status}</h2>
            <p>Your calculated stress level is <strong>${level}/10</strong></p>
        </div>
        <div class="chart-container" style="display: flex; justify-content: center; margin: 2rem 0;">
            <div class="pie-result" style="
                width: 200px; height: 200px;
                background: conic-gradient(${color} 0% ${percentage}%, #e2e8f0 ${percentage}% 100%);
                border-radius: 50%;
                display: flex; align-items: center; justify-content: center;
                position: relative;
            ">
                <div style="
                    width: 160px; height: 160px;
                    background: white;
                    border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 3rem;
                    font-weight: 700;
                    color: ${color};
                ">${level}</div>
            </div>
        </div>
        <div class="recommendation">
            <p>${getRecommendation(level)}</p>
        </div>
    `;

    // Find where the default success content is and replace or append
    const contentDiv = document.querySelector('#success-screen .content-area') || document.querySelector('#success-screen h1').parentElement;
    // We'll replace the static "Thank you" content specifically

    // Quick hack: replace the whole success screen content except button
    const container = document.getElementById('success-screen');
    container.innerHTML = `
        <div class="icon-header" style="background: ${color}20; color: ${color};">
            <i class="fa-solid fa-brain"></i>
        </div>
        ${resultHtml}
        <button id="restart-btn-new" class="btn-secondary" onclick="resetSurvey()">Check Another</button>
    `;
}

function getRecommendation(level) {
    if (level <= 3) return "Great job! Your stress levels are low. Keep maintaining your healthy lifestyle.";
    if (level <= 6) return "You are experiencing moderate stress. Consider taking short breaks and practicing mindfulness.";
    return "Your stress levels are high. It's highly recommended to prioritize sleep, exercise, and consult a professional if needed.";
}

// Initialize
// Questions are rendered after they are loaded and when the survey starts.
