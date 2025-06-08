"use strict";

// Wait for the DOM to load before executing
document.addEventListener('DOMContentLoaded', () => {
  // Cache DOM elements
  const canvas = document.getElementById('clockCanvas');
  const ctx = canvas.getContext('2d');
  const difficultySelectionDiv = document.getElementById('difficultySelection');
  const gameSection = document.getElementById('gameSection');
  const optionsDiv = document.getElementById('options');
  const feedbackP = document.getElementById('feedback');
  const progressBarDiv = document.getElementById('progressBar');
  const roundInfoP = document.getElementById('roundInfo');
  const scoreInfoP = document.getElementById('scoreInfo');
  const timerDisplayP = document.getElementById('timerDisplay');
  const endGameDiv = document.getElementById('endGame');
  const finalMessageP = document.getElementById('finalMessage');
  const statsDiv = document.getElementById('stats');
  const restartBtn = document.getElementById('restartBtn');
  const themeToggleBtn = document.getElementById('themeToggle');
  const tutorialModal = document.getElementById('tutorialModal');
  const closeTutorialBtn = document.getElementById('closeTutorial');
  const correctSound = document.getElementById('correctSound');
  const incorrectSound = document.getElementById('incorrectSound');

  // Game settings
  const MAX_ROUNDS = 10;
  const ROUND_DURATION = 10; // seconds per round
  let difficultyLevel = null;
  // Use 24h format for generated time (0-23)
  let currentHour, currentMinute;
  let correctTime;
  let progress = []; // Array of booleans representing correct/incorrect answers
  let roundCount = 0;
  let score = 0;
  let reactionTimes = [];
  let roundStartTime = 0;
  let timerInterval = null;
  let timeRemaining = ROUND_DURATION;

  // Event listeners for difficulty selection
  document.getElementById('easyBtn').addEventListener('click', () => startGame(1));
  document.getElementById('mediumBtn').addEventListener('click', () => startGame(2));
  document.getElementById('hardBtn').addEventListener('click', () => startGame(3));

  restartBtn.addEventListener('click', resetGame);
  themeToggleBtn.addEventListener('click', toggleTheme);
  closeTutorialBtn.addEventListener('click', closeTutorial);

  // On load: if tutorial not seen, show modal and hide dark mode toggle
  if (!localStorage.getItem('tutorialSeen')) {
    tutorialModal.classList.remove('hidden');
    themeToggleBtn.style.display = 'none';
  } else {
    tutorialModal.classList.add('hidden');
  }

  // Responsive Canvas Scaling
  function resizeCanvas() {
    const containerWidth = canvas.parentElement.clientWidth;
    const newSize = Math.min(containerWidth, 300); // maximum size 300px
    canvas.width = newSize;
    canvas.height = newSize;
    if (typeof currentHour !== 'undefined' && typeof currentMinute !== 'undefined') {
      drawClock(currentHour, currentMinute);
    }
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  /**
   * Toggles dark mode and updates the toggle button icon.
   */
  function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    if (document.body.classList.contains('dark-mode')) {
      themeToggleBtn.innerHTML = '☀';
    } else {
      themeToggleBtn.innerHTML = '🌙';
    }
    if (typeof currentHour !== 'undefined' && typeof currentMinute !== 'undefined') {
      drawClock(currentHour, currentMinute);
    }
  }

  /**
   * Closes the tutorial modal and shows the dark mode toggle button.
   */
  function closeTutorial() {
    tutorialModal.classList.add('hidden');
    localStorage.setItem('tutorialSeen', 'true');
    themeToggleBtn.style.display = 'block';
  }

  /**
   * Starts the game by setting the difficulty, showing the game section,
   * and calling resizeCanvas() to update canvas dimensions.
   */
  function startGame(level) {
    difficultyLevel = level;
    difficultySelectionDiv.classList.add('hidden');
    gameSection.classList.remove('hidden');
    // Ensure the clock is visible when the game starts
    canvas.classList.remove('hidden');
    resizeCanvas();
    progress = [];
    roundCount = 0;
    score = 0;
    reactionTimes = [];
    updateGameInfo();
    updateProgressBar();
    setupGame();
  }

  /**
   * Resets the game to its initial state.
   */
  function resetGame() {
    progress = [];
    roundCount = 0;
    score = 0;
    reactionTimes = [];
    updateGameInfo();
    updateProgressBar();
    endGameDiv.classList.add('hidden');
    optionsDiv.classList.remove('hidden');
    feedbackP.classList.remove('feedback-show');
    // Ensure clock is visible after reset
    canvas.classList.remove('hidden');
    clearInterval(timerInterval);
    setupGame();
  }

  /**
   * Draws the clock (classic design) on the canvas using colors adapted to the current theme.
   * For display, the 24h time is converted to 12h format.
   */
  function drawClock(hour24, minute) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const clockRadius = Math.min(centerX, centerY) - 10;
    const isDark = document.body.classList.contains("dark-mode");
    const defaultColor = isDark ? "#fff" : "#000";
    // Convert 24h to 12h format (0 becomes 12)
    const hourForClock = (hour24 % 12) || 12;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw clock face
    ctx.beginPath();
    ctx.arc(centerX, centerY, clockRadius, 0, 2 * Math.PI);
    ctx.lineWidth = 3;
    ctx.strokeStyle = defaultColor;
    ctx.stroke();

    // Draw hour markings
    for (let i = 0; i < 12; i++) {
      const angle = (i * 30) * (Math.PI / 180);
      const startX = centerX + Math.cos(angle) * (clockRadius * 0.9);
      const startY = centerY + Math.sin(angle) * (clockRadius * 0.9);
      const endX = centerX + Math.cos(angle) * clockRadius;
      const endY = centerY + Math.sin(angle) * clockRadius;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = defaultColor;
      ctx.stroke();
    }

    // Draw hour numbers (always 1 to 12)
    ctx.font = 'bold ' + Math.floor(clockRadius * 0.2) + 'px Arial';
    ctx.fillStyle = defaultColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (let i = 1; i <= 12; i++) {
      const angle = (i * 30 - 90) * (Math.PI / 180);
      const x = centerX + Math.cos(angle) * (clockRadius * 0.75);
      const y = centerY + Math.sin(angle) * (clockRadius * 0.75);
      ctx.fillText(i.toString(), x, y);
    }

    // Draw hour hand (using 12h value)
    const hourAngle = (hourForClock + minute / 60) * 30 * (Math.PI / 180);
    const hourHandLength = clockRadius * 0.6;
    const hourX = centerX + Math.cos(hourAngle - Math.PI / 2) * hourHandLength;
    const hourY = centerY + Math.sin(hourAngle - Math.PI / 2) * hourHandLength;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(hourX, hourY);
    ctx.lineWidth = 6;
    ctx.strokeStyle = defaultColor;
    ctx.stroke();

    // Draw minute hand
    const minuteAngle = minute * 6 * (Math.PI / 180);
    const minuteHandLength = clockRadius * 0.9;
    const minuteX = centerX + Math.cos(minuteAngle - Math.PI / 2) * minuteHandLength;
    const minuteY = centerY + Math.sin(minuteAngle - Math.PI / 2) * minuteHandLength;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(minuteX, minuteY);
    ctx.lineWidth = 4;
    ctx.strokeStyle = defaultColor;
    ctx.stroke();

    // Draw center dot
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, 2 * Math.PI);
    ctx.fillStyle = defaultColor;
    ctx.fill();

    // Add animation on clock change
    canvas.classList.add('clock-change-anim');
    setTimeout(() => {
      canvas.classList.remove('clock-change-anim');
    }, 500);
  }

  /**
   * Generates a random time based on the selected difficulty level in 24h format.
   */
  function generateRandomTime() {
    const hour = Math.floor(Math.random() * 24);
    let minute;
    switch (difficultyLevel) {
      case 1:
        minute = Math.random() < 0.5 ? 0 : 30;
        break;
      case 2:
        const quarter = Math.floor(Math.random() * 4);
        minute = quarter * 15;
        break;
      case 3:
        minute = Math.floor(Math.random() * 60);
        break;
      default:
        minute = 0;
    }
    return { hour, minute };
  }

  /**
   * Formats the time in "HH:MM" (24h format).
   */
  function formatTime(hour, minute) {
    const h = hour < 10 ? "0" + hour : hour;
    const m = minute < 10 ? "0" + minute : minute;
    return `${h}:${m}`;
  }

  /**
   * Generates 4 time options including the correct time (24h format).
   */
  function generateOptions(correctTime) {
    const options = new Set([correctTime]);
    while (options.size < 4) {
      const randomHour = Math.floor(Math.random() * 24);
      let randomMinute;
      switch (difficultyLevel) {
        case 1:
          randomMinute = Math.random() < 0.5 ? 0 : 30;
          break;
        case 2:
          const quarter = Math.floor(Math.random() * 4);
          randomMinute = quarter * 15;
          break;
        case 3:
          randomMinute = Math.floor(Math.random() * 60);
          break;
        default:
          randomMinute = 0;
      }
      const randomTime = formatTime(randomHour, randomMinute);
      options.add(randomTime);
    }
    return Array.from(options).sort(() => Math.random() - 0.5);
  }

  /**
   * Starts the countdown timer for the current round.
   */
  function startTimer() {
    timeRemaining = ROUND_DURATION;
    timerDisplayP.textContent = `Zeit: ${timeRemaining.toFixed(1)} s`;
    timerInterval = setInterval(() => {
      timeRemaining -= 0.1;
      if (timeRemaining <= 0) {
        timeRemaining = 0;
        timerDisplayP.textContent = `Zeit: ${timeRemaining.toFixed(1)} s`;
        clearInterval(timerInterval);
        autoFail();
      } else {
        timerDisplayP.textContent = `Zeit: ${timeRemaining.toFixed(1)} s`;
      }
    }, 100);
  }

  /**
   * Stops the countdown timer.
   */
  function stopTimer() {
    clearInterval(timerInterval);
  }

  /**
   * Automatically marks the round as incorrect when time runs out.
   */
  function autoFail() {
    feedbackP.textContent = 'Die Zeit ist abgelaufen! Falsch!';
    feedbackP.style.color = "var(--incorrect-color)";
    feedbackP.classList.add('feedback-show');
    progress.push(false);
    incorrectSound.currentTime = 0;
    incorrectSound.play();
    canvas.classList.add('incorrect-effect');
    setTimeout(() => {
      canvas.classList.remove('incorrect-effect');
    }, 500);
    setTimeout(setupGame, 1000);
  }

  /**
   * Launches confetti particle effects with randomized horizontal offset and duration.
   */
  function launchConfetti() {
    const confettiCount = 30;
    const container = document.querySelector('.container');
    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.classList.add('confetti');
      const colors = ['#FFC700', '#FF0000', '#2E3192', '#41BBC7'];
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.top = '-10px';
      // Random horizontal offset between -50px and +50px
      const xOffset = Math.random() * 100 - 50;
      confetti.style.setProperty('--x-offset', xOffset + 'px');
      // Randomize animation duration between 2 and 3 seconds
      const duration = 2 + Math.random();
      confetti.style.animationDuration = `${duration}s`;
      container.appendChild(confetti);
      setTimeout(() => {
        confetti.remove();
      }, duration * 1000);
    }
  }

  /**
   * Sets up the current game round.
   */
  function setupGame() {
    if (roundCount >= MAX_ROUNDS) {
      endGame();
      return;
    }
    roundCount++;
    updateGameInfo();
    roundStartTime = Date.now();
    startTimer();
    const time = generateRandomTime();
    currentHour = time.hour;
    currentMinute = time.minute;
    // Format the correct time in 24h format
    correctTime = formatTime(currentHour, currentMinute);
    // Draw the clock (for display, convert to 12h format)
    drawClock(currentHour, currentMinute);
    const options = generateOptions(correctTime);
    optionsDiv.innerHTML = '';
    options.forEach(option => {
      const button = document.createElement('button');
      button.textContent = option;
      button.classList.add('option');
      button.setAttribute('aria-label', `Option ${option}`);
      button.addEventListener('click', () => checkTime(option));
      optionsDiv.appendChild(button);
    });
    if (optionsDiv.firstChild) {
      optionsDiv.firstChild.focus();
    }
    feedbackP.textContent = '';
    feedbackP.classList.remove('feedback-show');
  }

  /**
   * Checks the selected time option and provides appropriate feedback.
   * A correct answer increases the score; a wrong answer ends the round.
   */
  function checkTime(selectedTime) {
    stopTimer();
    const reactionTime = Date.now() - roundStartTime;
    reactionTimes.push(reactionTime);
    feedbackP.classList.remove('feedback-show');
    if (selectedTime === correctTime) {
      feedbackP.textContent = 'Richtig! Gut gemacht!';
      feedbackP.style.color = "var(--correct-color)";
      score++;
      progress.push(true);
      correctSound.currentTime = 0;
      correctSound.play();
      canvas.classList.add('correct-effect');
      launchConfetti();
      setTimeout(() => {
        canvas.classList.remove('correct-effect');
      }, 500);
      Array.from(optionsDiv.children).forEach(button => button.disabled = true);
      setTimeout(() => {
        feedbackP.classList.add('feedback-show');
      }, 10);
      setTimeout(setupGame, 1000);
    } else {
      feedbackP.textContent = 'Das war nicht richtig. Runde beendet!';
      feedbackP.style.color = "var(--incorrect-color)";
      progress.push(false);
      incorrectSound.currentTime = 0;
      incorrectSound.play();
      canvas.classList.add('incorrect-effect');
      setTimeout(() => {
        canvas.classList.remove('incorrect-effect');
      }, 500);
      setTimeout(() => {
        feedbackP.classList.add('feedback-show');
      }, 10);
      // Wrong answer ends the round – start next round after ~1 second
      setTimeout(setupGame, 1000);
    }
    updateProgressBar();
    updateGameInfo();
  }

  /**
   * Updates the progress bar based on rounds completed.
   */
  function updateProgressBar() {
    progressBarDiv.innerHTML = '';
    for (let i = 0; i < MAX_ROUNDS; i++) {
      const circle = document.createElement('span');
      circle.classList.add('progress-circle');
      if (progress[i] === true) {
        circle.classList.add('correct');
      } else if (progress[i] === false) {
        circle.classList.add('incorrect');
      }
      progressBarDiv.appendChild(circle);
    }
  }

  /**
   * Updates game information (round and score).
   */
  function updateGameInfo() {
    roundInfoP.textContent = `Runde: ${Math.min(roundCount, MAX_ROUNDS)} / ${MAX_ROUNDS}`;
    scoreInfoP.textContent = `Punktzahl: ${score}`;
  }

  /**
   * Ends the game and displays final statistics.
   * On the finish screen, only a minimal message is shown.
   * The clock is hidden to avoid flickering on iPhone.
   */
  function endGame() {
    optionsDiv.classList.add('hidden');
    feedbackP.classList.add('hidden');
    endGameDiv.classList.remove('hidden');
    // Show only a minimal final message (no detailed stats)
    finalMessageP.textContent = `Spiel beendet!`;
    statsDiv.innerHTML = ""; // Remove additional stats
    // Hide the clock to avoid flickering on iPhone
    canvas.classList.add('hidden');
    restartBtn.focus();
  }
});
