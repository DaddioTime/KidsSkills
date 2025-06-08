/****************************************************
 * main.js
 * Complete game logic and event listeners
 ****************************************************/

// HTML Elements
const container = document.querySelector('.container');
const body = document.querySelector('body');
const operationSelection = document.getElementById('operationSelection');
const numberRangeSelection = document.getElementById('numberRangeSelection');
const questionElement = document.getElementById('question');
const optionsElement = document.getElementById('options');
const resultElement = document.getElementById('result');
const correctCountDisplay = document.getElementById('correctCount');
const incorrectCountDisplay = document.getElementById('incorrectCount');
const progressBarElement = document.getElementById('progressBar');

const modalContent = document.getElementById('modalContent');
const gameOverModal = document.getElementById('gameOverModal');
const gameOverContent = document.getElementById('gameOverContent');
const gameOverMessage = document.getElementById('gameOverMessage');
const gameOverEmoji = document.getElementById('gameOverEmoji');
const incorrectModal = document.getElementById('incorrectModal');
const modalMessage = document.getElementById('modalMessage');
const versionDisplay = document.getElementById('versionDisplay');

// Variables to store game data
let currentOperation;
let maxNumber = 10;
let currentAnswer;
let correctAnswers = 0;
let incorrectAnswers = 0;
let questionCount = 0;
let roundLimit = 10;
let useTensOrFives = false;
let progressCircles = [];

// Language translations
const translations = {
  en: {
    chooseOperation: 'Choose the operation:',
    addition: 'Addition (+)',
    subtraction: 'Subtraction (-)',
    multiplication: 'Multiplication (x)',
    division: 'Division (÷)',
    chooseNumberRange: 'Choose the number range:',
    upTo5: 'Up to 5',
    upTo10: 'Up to 10',
    upTo20: 'Up to 20',
    upTo50: 'Up to 50',
    upTo100: 'Up to 100',
    tens: 'Tens (e.g. 20+30)',
    fives: 'Fives (e.g. 25+15)',
    correct: 'Correct: 0',
    incorrect: 'Incorrect: 0',
    correctAnswerWas: 'The correct answer was: ',
    gameOverMessage: 'Correct Answers: {correct}, Incorrect Answers: {incorrect}'
  },
  de: {
    chooseOperation: 'Wähle die Rechenoperation:',
    addition: 'Addition (+)',
    subtraction: 'Subtraktion (-)',
    multiplication: 'Multiplikation (x)',
    division: 'Division (÷)',
    chooseNumberRange: 'Wähle den Zahlenbereich:',
    upTo5: 'Bis 5',
    upTo10: 'Bis 10',
    upTo20: 'Bis 20',
    upTo50: 'Bis 50',
    upTo100: 'Bis 100',
    tens: 'Zehner (z.B. 20+30)',
    fives: 'Fünfer (z.B. 25+15)',
    correct: 'Richtig: 0',
    incorrect: 'Falsch: 0',
    correctAnswerWas: 'Die richtige Antwort war: ',
    gameOverMessage: 'Richtige Antworten: {correct}, Falsche Antworten: {incorrect}'
  }
};

// Determine initial language
function getInitialLanguage() {
  const browserLang = navigator.language.substring(0, 2);
  return translations[browserLang] ? browserLang : 'en';
}
let currentLanguage = getInitialLanguage();

function setLanguage(lang) {
  currentLanguage = lang;
  document.documentElement.lang = lang;
  translatePage();
}

function translatePage() {
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (translations[currentLanguage] && translations[currentLanguage][key]) {
      element.textContent = translations[currentLanguage][key];
    }
  });
}
setLanguage(currentLanguage);

/****************************************************
 * Theme (Dark/Light) - automatically set at start
 ****************************************************/
function setInitialTheme() {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    body.classList.add('dark-mode');
    container.classList.add('dark-mode');
    const buttons = document.querySelectorAll('.option, .number-range, .operation-button');
    buttons.forEach(button => button.classList.add('dark-mode'));
    const circles = document.querySelectorAll('.progress-circle');
    circles.forEach(circle => circle.classList.add('dark-mode'));
    modalContent.classList.add('dark-mode');
    gameOverContent.classList.add('dark-mode');
    versionDisplay.classList.add('dark-mode');
  }
}
setInitialTheme();

/****************************************************
 * Utility functions
 ****************************************************/
function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Initialize progress bar
function initProgressBar() {
  progressBarElement.innerHTML = ''; 
  progressCircles = [];
  for (let i = 0; i < roundLimit; i++) {
    const circle = document.createElement('div');
    circle.classList.add('progress-circle');
    progressBarElement.appendChild(circle);
    progressCircles.push(circle);
  }
}

// Show modal for incorrect answer
function showModal(message) {
  modalMessage.textContent = message;
  incorrectModal.style.display = "block";
  // Close after 3 seconds
  setTimeout(() => {
    incorrectModal.style.display = "none";
    generateQuestion();
  }, 3000);
}

// Update progress bar
function updateProgressBar() {
  for (let i = 0; i < questionCount; i++) {
    if (i < correctAnswers) {
      progressCircles[i].classList.add('correct');
      progressCircles[i].classList.remove('incorrect');
    } else if (i < correctAnswers + incorrectAnswers) {
      progressCircles[i].classList.add('incorrect');
      progressCircles[i].classList.remove('correct');
    } else {
      progressCircles[i].classList.remove('incorrect', 'correct');
    }
  }
}

// Show game over screen
function showGameOver() {
  const percentageCorrect = (correctAnswers / roundLimit) * 100;
  let emoji = '';
  if (percentageCorrect >= 50) emoji = '🏆';
  if (percentageCorrect >= 80) emoji = '🏆🏆';
  if (percentageCorrect === 100) emoji = '🏆🏆🏆';
  
  const gameOverText = translations[currentLanguage].gameOverMessage
    .replace('{correct}', correctAnswers)
    .replace('{incorrect}', incorrectAnswers);

  gameOverMessage.textContent = gameOverText;
  gameOverEmoji.textContent = emoji;
  gameOverModal.style.display = 'block';
  
  setTimeout(() => {
    gameOverModal.style.display = "none";
    resetGame();
  }, 5000);
}

// Reset the game
function resetGame() {
  currentOperation = null;
  maxNumber = 10;
  currentAnswer = null;
  correctAnswers = 0;
  incorrectAnswers = 0;
  questionCount = 0;
  useTensOrFives = false;

  operationSelection.style.display = 'block';
  numberRangeSelection.style.display = 'none';
  questionElement.style.display = 'none';
  optionsElement.style.display = 'none';
  resultElement.style.display = 'none';
  progressBarElement.style.display = 'none';

  correctCountDisplay.textContent = translations[currentLanguage].correct.split(':')[0] + ': 0';
  incorrectCountDisplay.textContent = translations[currentLanguage].incorrect.split(':')[0] + ': 0';
}

/****************************************************
 * Generate question
 ****************************************************/
function generateQuestion() {
  if (questionCount >= roundLimit) {
    showGameOver();
    return;
  }

  let num1, num2;

  // Division - ensure no remainder
  if (currentOperation === 'division') {
    const divisor = getRandomIntInclusive(1, maxNumber);
    const quotient = getRandomIntInclusive(0, maxNumber);
    num1 = quotient * divisor;
    num2 = divisor;
  } else {
    if (useTensOrFives) {
      // For Tens or Fives, multiplier = 10 or 5
      const multiplier = (maxNumber === 10) ? 10 : 5;
      num1 = getRandomIntInclusive(1, maxNumber) * multiplier;
      num2 = getRandomIntInclusive(1, maxNumber) * multiplier;
    } else {
      num1 = getRandomIntInclusive(0, maxNumber);
      num2 = getRandomIntInclusive(0, maxNumber);
    }
  }

  // Prevent negative results for subtraction
  if (currentOperation === 'subtraction' && num1 < num2) {
    [num1, num2] = [num2, num1];
  }

  // Determine the correct answer
  let questionText;
  switch (currentOperation) {
    case 'addition':
      currentAnswer = num1 + num2;
      questionText = `${num1} + ${num2} = ?`;
      break;
    case 'subtraction':
      currentAnswer = num1 - num2;
      questionText = `${num1} - ${num2} = ?`;
      break;
    case 'multiplication':
      currentAnswer = num1 * num2;
      questionText = `${num1} x ${num2} = ?`;
      break;
    case 'division':
      currentAnswer = num1 / num2; 
      questionText = `${num1} ÷ ${num2} = ?`;
      break;
  }

  questionElement.textContent = questionText;

  // Generate answer options
  const options = document.querySelectorAll('.option');
  const correctOptionIndex = getRandomIntInclusive(0, 3);

  let generatedAnswers = [];
  for (let i = 0; i < 4; i++) {
    if (i === correctOptionIndex) {
      generatedAnswers.push(currentAnswer);
    } else {
      let wrongAnswer;
      do {
        if (currentOperation === 'multiplication') {
          wrongAnswer = getRandomIntInclusive(0, (maxNumber + 1) * (maxNumber + 1));
        } else if (currentOperation === 'subtraction') {
          wrongAnswer = getRandomIntInclusive(-maxNumber, maxNumber);
        } else {
          wrongAnswer = getRandomIntInclusive(0, maxNumber * 2);
        }
      } while (wrongAnswer === currentAnswer || generatedAnswers.includes(wrongAnswer));
      
      generatedAnswers.push(wrongAnswer);
    }
  }

  // Fill answer buttons
  options.forEach((btn, idx) => {
    btn.textContent = generatedAnswers[idx];
  });

  questionCount++;
}

/****************************************************
 * Check selected answer
 ****************************************************/
function checkAnswer(selectedValue) {
  if (parseInt(selectedValue) === currentAnswer) {
    correctAnswers++;
    correctCountDisplay.textContent = translations[currentLanguage].correct.split(':')[0] + `: ${correctAnswers}`;
    body.style.backgroundColor = 'green';
    updateProgressBar();
    setTimeout(() => {
      body.style.backgroundColor = '';
      generateQuestion();
    }, 1000);
  } else {
    incorrectAnswers++;
    incorrectCountDisplay.textContent = translations[currentLanguage].incorrect.split(':')[0] + `: ${incorrectAnswers}`;
    body.style.backgroundColor = 'red';
    updateProgressBar();
    showModal(`${translations[currentLanguage].correctAnswerWas} ${currentAnswer}`);
    setTimeout(() => {
      body.style.backgroundColor = '';
    }, 1000);
  }
}

/****************************************************
 * Event Listeners
 ****************************************************/
// Operation buttons
document.getElementById('additionBtn').addEventListener('click', () => setOperation('addition'));
document.getElementById('subtractionBtn').addEventListener('click', () => setOperation('subtraction'));
document.getElementById('multiplicationBtn').addEventListener('click', () => setOperation('multiplication'));
document.getElementById('divisionBtn').addEventListener('click', () => setOperation('division'));

// Range buttons
document.getElementById('rangeBtn5').addEventListener('click', () => setRange(5, false));
document.getElementById('rangeBtn10').addEventListener('click', () => setRange(10, false));
document.getElementById('rangeBtn20').addEventListener('click', () => setRange(20, false));
document.getElementById('rangeBtn50').addEventListener('click', () => setRange(50, false));
document.getElementById('rangeBtn100').addEventListener('click', () => setRange(100, false));
document.getElementById('rangeBtnTens').addEventListener('click', () => setRange(10, true));
document.getElementById('rangeBtnFives').addEventListener('click', () => setRange(5, true));

// Answer buttons
document.querySelectorAll('.option').forEach(optionBtn => {
  optionBtn.addEventListener('click', (e) => {
    checkAnswer(e.target.textContent);
  });
});

/****************************************************
 * Functions for operation & range
 ****************************************************/
function setOperation(operation) {
  currentOperation = operation;
  operationSelection.style.display = 'none';
  numberRangeSelection.style.display = 'block';
}

function setRange(max, tensOrFives = false) {
  maxNumber = max;
  useTensOrFives = tensOrFives;
  numberRangeSelection.style.display = 'none';
  questionElement.style.display = 'block';
  optionsElement.style.display = 'flex';
  resultElement.style.display = 'block';
  progressBarElement.style.display = 'flex';
  initProgressBar();
  generateQuestion();
}

/****************************************************
 * Register service worker
 ****************************************************/
const CACHE_VERSION = 'math-trainer-v3.0';
versionDisplay.textContent = `Version: ${CACHE_VERSION}`;

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js')
    .then(registration => {
      console.log('Service Worker registered with scope:', registration.scope);
    })
    .catch(error => {
      console.error('Service Worker registration failed:', error);
    });
}
