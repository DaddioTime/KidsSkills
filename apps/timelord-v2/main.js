// TimeLord v2 game logic with multiple enhancements
const CLOCK_DIV = document.getElementById('clocks');
const TARGET_SPAN = document.getElementById('targetTime');
const MESSAGE_DIV = document.getElementById('message');
const ROUND_SPAN = document.getElementById('round');
const SCORE_SPAN = document.getElementById('score');
const HIGH_SCORE_SPAN = document.getElementById('highScore');
const LANG_SELECT = document.getElementById('langSelect');
const DIFFICULTY_SELECT = document.getElementById('difficultySelect');
const CONTRAST_BTN = document.getElementById('contrastBtn');
const AUDIO_ENABLED = document.getElementById('soundToggle');
const SETTINGS_BTN = document.getElementById('settingsBtn');
const SETTINGS_BOX = document.getElementById('settingsBox');

let currentOptions = [];
let currentTarget = null;
let roundCount = 0;
let scoreCount = 0;
let highScore = +localStorage.getItem('tl2Highscore') || 0;
let streak = 0;
const errorStats = {};

const translations = {
  de: {
    clickClock: 'Klicke die Uhr, die',
    round: 'Runde',
    score: 'Punkte',
    highScore: 'Rekord',
    correct: 'Richtig!',
    wrong: 'Falsch, versuche es nochmal.',
    mostErrors: 'Meiste Fehler:',
    lang: 'Sprache',
    difficulty: 'Schwierigkeit'
  },
  en: {
    clickClock: 'Click the clock showing',
    round: 'Round',
    score: 'Score',
    highScore: 'Highscore',
    correct: 'Correct!',
    wrong: 'Wrong, try again.',
    mostErrors: 'Most errors:',
    lang: 'Language',
    difficulty: 'Difficulty'
  }
};
let currentLang = document.documentElement.lang || 'de';

function t(key) {
  return translations[currentLang][key] || key;
}

function updateTexts() {
  document.getElementById('promptPrefix').textContent = t('clickClock');
  document.getElementById('roundLabel').textContent = t('round');
  document.getElementById('scoreLabel').textContent = t('score');
  document.getElementById('highScoreLabel').textContent = t('highScore');
  document.getElementById('langLabel').textContent = t('lang');
  document.getElementById('difficultyLabel').textContent = t('difficulty');
}

function drawClock(canvas, hours, minutes) {
  const size = Math.min(canvas.parentElement.clientWidth, 300);
  if (size < 50) return;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const r = size / 2;
  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.translate(r, r);
  ctx.beginPath();
  ctx.arc(0, 0, r - 5, 0, 2 * Math.PI);
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.font = `${r * 0.15}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let n = 1; n <= 12; n++) {
    const ang = n * Math.PI / 6;
    ctx.rotate(ang);
    ctx.translate(0, -r * 0.85);
    ctx.rotate(-ang);
    ctx.fillStyle = '#000';
    ctx.fillText(n.toString(), 0, 0);
    ctx.rotate(ang);
    ctx.translate(0, r * 0.85);
    ctx.rotate(-ang);
  }
  function hand(angle, length, width, color) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.moveTo(0, 0);
    ctx.rotate(angle);
    ctx.lineTo(0, -length);
    ctx.stroke();
    ctx.rotate(-angle);
  }
  const hourAng = ((hours % 12) + minutes / 60) * Math.PI / 6;
  hand(hourAng, r * 0.5, 6, 'red');
  const minAng = minutes * Math.PI / 30;
  hand(minAng, r * 0.8, 4, 'blue');
  ctx.restore();
}

function pickRandomTime(difficulty) {
  if (difficulty === 'random') {
    return { h: Math.floor(Math.random() * 12) + 1, m: Math.floor(Math.random() * 60) };
  }
  return { h: Math.floor(Math.random() * 12) + 1, m: Math.floor(Math.random() * 4) * 15 };
}

function formatTime({ h, m }) {
  return `${h}:${m.toString().padStart(2, '0')}`;
}

function updateScoreboard() {
  ROUND_SPAN.textContent = roundCount;
  SCORE_SPAN.textContent = scoreCount;
  HIGH_SCORE_SPAN.textContent = highScore;
}

function playSound(correct) {
  if (!AUDIO_ENABLED.checked) return;
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  osc.frequency.value = correct ? 880 : 220;
  osc.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.2);
}

function setupRound() {
  roundCount++;
  CLOCK_DIV.innerHTML = '';
  MESSAGE_DIV.textContent = '';
  const difficulty = DIFFICULTY_SELECT.value;
  currentTarget = pickRandomTime(difficulty);
  TARGET_SPAN.textContent = formatTime(currentTarget);
  currentOptions = [currentTarget];
  const optionCount = 4 + Math.min(2, Math.floor(streak / 3));
  while (currentOptions.length < optionCount) {
    const t = pickRandomTime(difficulty);
    if (!currentOptions.some(o => o.h === t.h && o.m === t.m)) currentOptions.push(t);
  }
  shuffle(currentOptions);
  currentOptions.forEach(opt => {
    const container = document.createElement('div');
    container.className = 'clock-container';
    const canvas = document.createElement('canvas');
    canvas.dataset.h = opt.h;
    canvas.dataset.m = opt.m;
    canvas.setAttribute('aria-label', formatTime(opt));
    canvas.addEventListener('click', () => onClockClick(opt));
    container.append(canvas);
    CLOCK_DIV.append(container);
    drawClock(canvas, opt.h, opt.m);
  });
  updateScoreboard();
}

function onClockClick(opt) {
  if (opt.h === currentTarget.h && opt.m === currentTarget.m) {
    scoreCount++;
    streak++;
    playSound(true);
    MESSAGE_DIV.textContent = t('correct');
    if (scoreCount > highScore) {
      highScore = scoreCount;
      localStorage.setItem('tl2Highscore', highScore);
    }
    setTimeout(setupRound, 1000);
  } else {
    streak = 0;
    playSound(false);
    MESSAGE_DIV.textContent = t('wrong');
    const key = formatTime(currentTarget);
    errorStats[key] = (errorStats[key] || 0) + 1;
  }
  updateScoreboard();
  showMostErrors();
}

function showMostErrors() {
  const entries = Object.entries(errorStats);
  if (!entries.length) return;
  entries.sort((a, b) => b[1] - a[1]);
  const [time, count] = entries[0];
  document.getElementById('errorInfo').textContent = `${t('mostErrors')} ${time} (${count})`;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

LANG_SELECT.addEventListener('change', () => {
  currentLang = LANG_SELECT.value;
  document.documentElement.lang = currentLang;
  updateTexts();
  setupRound();
});

CONTRAST_BTN.addEventListener('click', () => {
  document.body.classList.toggle('high-contrast');
});

SETTINGS_BTN.addEventListener('click', () => {
  SETTINGS_BOX.classList.toggle('show');
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js');
}

window.addEventListener('resize', () => {
  document.querySelectorAll('canvas').forEach(c => drawClock(c, +c.dataset.h, +c.dataset.m));
});

document.addEventListener('DOMContentLoaded', () => {
  updateTexts();
  updateScoreboard();
  setupRound();
});
