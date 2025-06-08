// Constants and variables
const BUTTONS = document.querySelector('.buttons');
const RED_BUTTON = document.querySelector('.red');
const GREEN_BUTTON = document.querySelector('.green');
const BLUE_BUTTON = document.querySelector('.blue');
const YELLOW_BUTTON = document.querySelector('.yellow');
const START_BUTTON = document.getElementById('startgame');
const RESET_BUTTON = document.getElementById('resetgame');
const BANNER = document.querySelector('.message');
const SCORE_DISPLAY = document.querySelector('.score');

const BUTTON_ELEMENTS = [RED_BUTTON, GREEN_BUTTON, BLUE_BUTTON, YELLOW_BUTTON];

let solution = [];
let playerSolution = [];
let score = 0;
let gameOver = true;
let solutionPlaying = false;
let timeout = 650;

// Audio context and buffers
let audioContext;
let soundBuffers = {};

// Initialize event listeners
initializeEventListeners();

// Load sounds using Web Audio API
function initializeAudio() {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const soundFiles = {
    red: 'sounds/red.mp3',
    green: 'sounds/green.mp3',
    blue: 'sounds/blue.mp3',
    yellow: 'sounds/yellow.mp3',
    fail: 'sounds/fail.mp3',
  };
  const promises = [];
  for (const [color, url] of Object.entries(soundFiles)) {
    promises.push(
      fetch(url)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
        .then(audioBuffer => {
          soundBuffers[color] = audioBuffer;
        })
    );
  }
  return Promise.all(promises);
}

// Event listeners for game buttons
function initializeEventListeners() {
  BUTTONS.addEventListener('click', handleButtonClick);
  START_BUTTON.addEventListener('click', handleStartButtonClick);
  RESET_BUTTON.addEventListener('click', handleResetButtonClick);
}

// Game button click handler
function handleButtonClick(e) {
  if (e.target.classList.contains('button') && !solutionPlaying && !gameOver) {
    playMove(e.target);
    playerSolution.push(parseInt(e.target.dataset.id));
    checkPlayerSolution();
  }
}

// Start button click handler
function handleStartButtonClick(e) {
  e.preventDefault();
  if (gameOver) {
    initializeAudio().then(() => {
      resetGame();
      gameOver = false;
      introAnimation(); // Added intro animation on start
    });
  }
}

// Reset button click handler
function handleResetButtonClick(e) {
  e.preventDefault();
  if (!solutionPlaying) {
    resetGame();
  }
}

// Reset the game
function resetGame() {
  BANNER.innerHTML = 'Simon';
  gameOver = true;
  solution = [];
  playerSolution = [];
  score = 0;
  timeout = 650;
  updateScore();
}

// Animate button press and play sound
function playMove(button) {
  button.classList.add('press');
  playSound(button.dataset.color);
  setTimeout(() => {
    button.classList.remove('press');
  }, 300);
}

// Play sound using AudioContext
function playSound(color) {
  const buffer = soundBuffers[color];
  if (buffer) {
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start(0);
  }
}

// Generate next move in the solution
function generateNextMove() {
  BANNER.innerHTML = 'Simon';
  solution.push(Math.floor(Math.random() * 4) + 1);
  timeout = Math.max(300, timeout - 25);
  animateSolution();
}

// Animate the solution sequence
function animateSolution() {
  let index = 0;
  solutionPlaying = true;
  const interval = setInterval(() => {
    const button = BUTTON_ELEMENTS[solution[index] - 1];
    playMove(button);
    index++;
    if (index >= solution.length) {
      clearInterval(interval);
      solutionPlaying = false;
    }
  }, timeout);
}

// Check the player's solution against the game-generated solution
function checkPlayerSolution() {
  const currentMoveIndex = playerSolution.length - 1;
  if (playerSolution[currentMoveIndex] !== solution[currentMoveIndex]) {
    BANNER.innerHTML = 'Sorry!';
    playFailSequence();
  } else if (playerSolution.length === solution.length) {
    score++;
    updateScore();
    BANNER.innerHTML = 'Good!';
    playerSolution = [];
    setTimeout(generateNextMove, 1000);
  }
}

// Play fail sequence
function playFailSequence() {
  solutionPlaying = true;
  playSound('fail');
  flashButtons(3, 500, () => {
    resetGame();
    solutionPlaying = false;
  });
}

// Update the scoreboard text on the page
function updateScore() {
  SCORE_DISPLAY.innerHTML = score < 10 ? '0' + score : score;
}

// Intro animation (flash the board 3 times)
function introAnimation() {
  solutionPlaying = true;
  flashButtons(3, 500, () => {
    solutionPlaying = false;
    generateNextMove(); // Start the game after the intro animation
  });
}

// Flash all buttons a specified number of times
function flashButtons(times, intervalTime, callback) {
  let flashes = 0;
  const interval = setInterval(() => {
    BUTTON_ELEMENTS.forEach(button => {
      button.classList.add('press');
      playSound(button.dataset.color); // Play sound for each button
      setTimeout(() => {
        button.classList.remove('press');
      }, 300);
    });
    flashes++;
    if (flashes >= times) {
      clearInterval(interval);
      if (callback) callback();
    }
  }, intervalTime);
}