let flames, volumeDisplay, statusMessage, music;
let audioContext, analyser, mediaStreamSource, micStream;
let isBlown = false;
const BLOW_THRESHOLD = 0.9;
const SMOOTHING = 0.8;
let currentVolume = 0;
let autoBlowTimeout;

// Sparkle Effect
function createSparkles(element) {
  for (let i = 0; i < 10; i++) {
    const sparkle = document.createElement('div');
    sparkle.classList.add('sparkle');

    const size = Math.random() * 5 + 2;
    sparkle.style.width = `${size}px`;
    sparkle.style.height = `${size}px`;
    sparkle.style.position = 'absolute';
    sparkle.style.left = '50%';
    sparkle.style.top = '50%';
    sparkle.style.transform = `translate(${Math.random() * 100 - 50}px, ${Math.random() * -100}px)`;
    sparkle.style.background = 'rgba(251, 211, 79, 0.8)';
    sparkle.style.borderRadius = '150%';
    sparkle.style.pointerEvents = 'none';
    sparkle.style.transition = 'opacity 0.5s ease-out';

    element.appendChild(sparkle);

    setTimeout(() => {
      sparkle.style.opacity = 0;
    }, 50);

    setTimeout(() => {
      sparkle.remove();
    }, 6000);
  }
}

// Blow Detection
function detectBlow() {
  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(dataArray);

  let sumSquares = 0;
  for (let i = 0; i < dataArray.length; i++) {
    sumSquares += dataArray[i] * dataArray[i];
  }
  const rms = Math.sqrt(sumSquares / dataArray.length) / 255;
  currentVolume = currentVolume * SMOOTHING + rms * (1 - SMOOTHING);

  if (volumeDisplay) {
    volumeDisplay.textContent = `Volume: ${currentVolume.toFixed(3)}`;
  }

  if (currentVolume > BLOW_THRESHOLD && !isBlown) {
    blowOutFlames();
  }

  if (!isBlown) {
    requestAnimationFrame(detectBlow);
  }
}

// Blow Action
async function blowOutFlames() {
  if (isBlown) return;
  isBlown = true;

  flames.forEach(f => f.style.display = 'none');

  const smokes = document.querySelectorAll('.smoke');
  smokes.forEach(smoke => {
    smoke.style.opacity = '10';
    smoke.style.animation = 'none';
    void smoke.offsetWidth;
    smoke.style.animation = smoke.classList.contains('smoke1') ? 'smoke1 3s linear forwards' : 'smoke2 3s linear forwards';
  });

  if (statusMessage) {
    statusMessage.textContent = '🎉 Candle blown out! Happy Birthday!';
     document.getElementById("blowMessage").style.display = 'none';
     document.getElementById("finalMessage").style.display = 'block';
    statusMessage.style.color = '#66ff99';
  }

  if (volumeDisplay) {
    volumeDisplay.style.display = 'none';
  }

  clearTimeout(autoBlowTimeout);

  // Stop microphone
  if (micStream) {
    micStream.getTracks().forEach(track => track.stop());
    micStream = null;
  }

  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }

  try {
    await music.play();
  } catch (err) {
    console.error('Audio playback failed:', err);
  }
}

// Microphone Setup (FIXED)
async function initMicOnce() {
  try {
    if (statusMessage) {
      statusMessage.textContent = 'Initializing microphone...';
      statusMessage.style.color = '#ffc107';
    }

    if (!audioContext || audioContext.state === 'closed') {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    micStream = stream;

    mediaStreamSource = audioContext.createMediaStreamSource(stream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    mediaStreamSource.connect(analyser);

    if (volumeDisplay) {
      volumeDisplay.classList.remove('hidden-initial');
    }

    if (statusMessage) {
      statusMessage.textContent = 'Listening... Blow the candle! 🎂';
      statusMessage.style.color = '#28a745';
    }

    detectBlow();

    autoBlowTimeout = setTimeout(() => {
      if (!isBlown) {
        blowOutFlames();
      }
    }, 10000);



   

  } catch (err) {
    if (statusMessage) {
      statusMessage.textContent = 'Mic access failed: ' + err.message;
      statusMessage.style.color = 'red';
    }
    console.error('Microphone init failed:', err);
  }
}

// Button Click Action
function startWish() {
  console.log('Button clicked, starting microphone...');
  if (isBlown) return;

  const blowText = document.getElementById('blowMessage');
  if (blowText) {
    blowText.style.display = 'block';
  }


  document.getElementById('wishButton ').style.display = 'none';
  document.getElementById('Message').style.display = 'none';

  initMicOnce();
}

// Random Helpers
function random(num) {
  return Math.floor(Math.random() * num);
}

function getRandomStyles() {
  const r = random(255);
  const g = random(255);
  const b = random(255);
  const mt = random(200);
  const ml = random(50);
  const dur = random(5) + 5;

  return `
    background-color: rgba(${r},${g},${b},0.7);
    color: rgba(${r},${g},${b},0.7);
    box-shadow: inset -7px -3px 10px rgba(${r - 10},${g - 10},${b - 10},0.7);
    margin: ${mt}px 0 0 ${ml}px;
    animation: float ${dur}s ease-in infinite;
  `;
}

function createBalloons(num) {
  const balloonContainer = document.getElementById('balloon-container');
  if (!balloonContainer) return;

  for (let i = 0; i < num; i++) {
    const balloon = document.createElement('div');
    balloon.className = 'balloon';
    balloon.style.cssText = getRandomStyles();
    balloonContainer.appendChild(balloon);
  }
}

// Page Ready
document.addEventListener('DOMContentLoaded', () => {
  flames = document.querySelectorAll('.flame, .mini-flame');
  volumeDisplay = document.getElementById('volumeDisplay');
  statusMessage = document.getElementById('statusMessage');
  music = document.getElementById('birthday-audio');

  // Sparkles after 6s, repeat every 1s
  setTimeout(() => {
    setInterval(() => {
      flames.forEach(el => createSparkles(el));
    }, 1000);
  }, 1000);

  createBalloons(50);

  if (music) music.load();

  const wishBtn = document.getElementById('wishButton');
  if (wishBtn) {
    wishBtn.addEventListener('click', startWish);
  }
});