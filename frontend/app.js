const MODES = {
  focus: { duration: 25 * 60, color: '#FF6B6B', label: 'Focus' },
  short_break: { duration: 5 * 60, color: '#4ECDC4', label: 'Break' },
  long_break: { duration: 15 * 60, color: '#7C83FD', label: 'Long Break' }
};

let currentMode = 'focus';
let timeRemaining = MODES.focus.duration;
let totalTime = MODES.focus.duration;
let timerState = 'idle';
let completedSessions = 0;
let animationFrameId = null;
let lastTimestamp = null;
let sessionStartTime = null;

const progressRing = document.getElementById('progress-ring');
const timerDisplay = document.getElementById('timer-display');
const modeLabel = document.getElementById('mode-label');
const playIcon = document.getElementById('play-icon');
const pauseIcon = document.getElementById('pause-icon');
const startPauseText = document.getElementById('start-pause-text');
const sessionCounter = document.getElementById('session-counter');
const root = document.documentElement;

const radius = 90;
const circumference = 2 * Math.PI * radius;
progressRing.style.strokeDasharray = circumference;
progressRing.style.strokeDashoffset = 0;

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function updateDisplay() {
  timerDisplay.textContent = formatTime(Math.ceil(timeRemaining));
  const progress = (totalTime - timeRemaining) / totalTime;
  const offset = circumference * progress;
  progressRing.style.strokeDashoffset = offset;
}

function updateModeStyling() {
  root.style.setProperty('--accent-color', MODES[currentMode].color);
  modeLabel.textContent = MODES[currentMode].label;
  
  ['focus', 'short_break', 'long_break'].forEach(mode => {
    const tab = document.getElementById(`mode-${mode}`);
    if (mode === currentMode) {
      tab.classList.add('bg-slate-700', 'text-white');
      tab.classList.remove('text-slate-400');
    } else {
      tab.classList.remove('bg-slate-700', 'text-white');
      tab.classList.add('text-slate-400');
    }
  });
}

function updateSessionDots() {
  const displayCount = Math.min(completedSessions, 4);
  
  for (let i = 1; i <= 4; i++) {
    const dot = document.getElementById(`session-dot-${i}`);
    if (i <= displayCount) {
      dot.style.backgroundColor = MODES.focus.color;
      dot.classList.remove('bg-slate-700');
    } else {
      dot.style.backgroundColor = '';
      dot.classList.add('bg-slate-700');
    }
  }
  sessionCounter.textContent = `${displayCount}/4 pomodoros`;
}

function playNotificationSound() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
  oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.15);
  oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.3);
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.6);
}

async function saveSession(completed = true) {
  const completedAt = new Date().toISOString();
  const elapsedSeconds = Math.round(totalTime - timeRemaining);
  
  try {
    await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: currentMode,
        duration_seconds: completed ? totalTime : elapsedSeconds,
        started_at: sessionStartTime,
        completed_at: completedAt,
        completed: completed ? 1 : 0
      })
    });
  } catch (err) {
    console.error('Failed to save session:', err);
  }
}

function timerLoop(timestamp) {
  if (timerState !== 'running') return;
  
  if (!lastTimestamp) lastTimestamp = timestamp;
  const elapsed = (timestamp - lastTimestamp) / 1000;
  lastTimestamp = timestamp;
  
  timeRemaining = Math.max(0, timeRemaining - elapsed);
  
  if (timeRemaining <= 0) {
    timeRemaining = 0;
    updateDisplay();
    completeSession();
    return;
  }
  
  updateDisplay();
  animationFrameId = requestAnimationFrame(timerLoop);
}

function completeSession() {
  timerState = 'idle';
  cancelAnimationFrame(animationFrameId);
  lastTimestamp = null;
  playNotificationSound();
  
  saveSession(true);
  
  if (currentMode === 'focus') {
    completedSessions++;
    
    if (completedSessions >= 4) {
      updateSessionDots();
      setMode('long_break');
    } else {
      updateSessionDots();
      setMode('short_break');
    }
  } else {
    const wasLongBreak = currentMode === 'long_break';
    setMode('focus');
    if (wasLongBreak) {
      completedSessions = 0;
      updateSessionDots();
    }
  }
  
  updateStartPauseButton();
}

function updateStartPauseButton() {
  if (timerState === 'running') {
    playIcon.classList.add('hidden');
    pauseIcon.classList.remove('hidden');
    startPauseText.textContent = 'Pause';
  } else {
    playIcon.classList.remove('hidden');
    pauseIcon.classList.add('hidden');
    startPauseText.textContent = 'Start';
  }
}

function startTimer() {
  if (timerState === 'running') return;
  
  timerState = 'running';
  
  if (!sessionStartTime) {
    sessionStartTime = new Date().toISOString();
  }
  
  lastTimestamp = null;
  animationFrameId = requestAnimationFrame(timerLoop);
  updateStartPauseButton();
}

function pauseTimer() {
  if (timerState !== 'running') return;
  
  timerState = 'paused';
  cancelAnimationFrame(animationFrameId);
  lastTimestamp = null;
  updateStartPauseButton();
}

function resetTimer() {
  if (timerState === 'running' && sessionStartTime) {
    saveSession(false);
  }
  
  timerState = 'idle';
  cancelAnimationFrame(animationFrameId);
  lastTimestamp = null;
  sessionStartTime = null;
  
  timeRemaining = totalTime;
  updateDisplay();
  updateStartPauseButton();
}

function toggleTimer() {
  if (timerState === 'running') {
    pauseTimer();
  } else {
    startTimer();
  }
}

function setMode(mode) {
  currentMode = mode;
  totalTime = MODES[mode].duration;
  timeRemaining = totalTime;
  sessionStartTime = null;
  
  if (timerState !== 'running') {
    updateDisplay();
  }
  
  updateModeStyling();
  updateSessionDots();
}

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    toggleTimer();
  } else if (e.code === 'KeyR') {
    e.preventDefault();
    resetTimer();
  }
});

updateDisplay();
updateModeStyling();
updateSessionDots();

window.toggleTimer = toggleTimer;
window.resetTimer = resetTimer;
window.setMode = setMode;