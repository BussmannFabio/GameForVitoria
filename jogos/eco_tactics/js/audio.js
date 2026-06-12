// --- SINTETIZADOR DE ÁUDIO WEB AUDIO API ---
let soundEnabled = true;
let audioCtx = null;

function playSound(type) {
  if (!soundEnabled) return;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const now = audioCtx.currentTime;

    if (type === 'click') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.type = 'sine'; osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.08);
      gain.gain.setValueAtTime(0.08, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.start(); osc.stop(now + 0.08);
    }
    else if (type === 'invoke') {
      const notes = [261.63, 329.63, 392.00, 523.25];
      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.type = 'triangle'; osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0.06, now + idx * 0.06); gain.gain.exponentialRampToValueAtTime(0.002, now + idx * 0.06 + 0.15);
        osc.start(now + idx * 0.06); osc.stop(now + idx * 0.06 + 0.15);
      });
    }
    else if (type === 'shoot') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.type = 'sine'; osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(350, now + 0.12);
      gain.gain.setValueAtTime(0.04, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(); osc.stop(now + 0.12);
    }
    else if (type === 'hit') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.type = 'triangle'; osc.frequency.setValueAtTime(200, now);
      gain.gain.setValueAtTime(0.08, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(); osc.stop(now + 0.05);
    }
    else if (type === 'coin') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.type = 'sine'; osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.setValueAtTime(880, now + 0.07);
      gain.gain.setValueAtTime(0.05, now); gain.gain.exponentialRampToValueAtTime(0.002, now + 0.2);
      osc.start(); osc.stop(now + 0.2);
    }
    else if (type === 'danger') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.type = 'sawtooth'; osc.frequency.setValueAtTime(130, now);
      osc.frequency.setValueAtTime(110, now + 0.15);
      gain.gain.setValueAtTime(0.12, now); gain.gain.exponentialRampToValueAtTime(0.002, now + 0.3);
      osc.start(); osc.stop(now + 0.3);
    }
    else if (type === 'decompose') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.type = 'sine'; osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.35);
      gain.gain.setValueAtTime(0.08, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(); osc.stop(now + 0.35);
    }
    else if (type === 'weather') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.type = 'sine'; osc.frequency.setValueAtTime(250, now);
      osc.frequency.linearRampToValueAtTime(550, now + 0.5);
      gain.gain.setValueAtTime(0.07, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.start(); osc.stop(now + 0.5);
    }
    else if (type === 'complete') {
      const notes = [523.25, 587.33, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.type = 'sine'; osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.08, now + idx * 0.08); gain.gain.exponentialRampToValueAtTime(0.002, now + idx * 0.08 + 0.3);
        osc.start(now + idx * 0.08); osc.stop(now + idx * 0.08 + 0.3);
      });
    }
  } catch(e) {
    console.error("Falha no sintetizador: ", e);
  }
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  const soundIcon = document.getElementById('sound-icon');
  if (soundEnabled) {
    if (soundIcon) {
      soundIcon.setAttribute('data-lucide', 'volume-2');
      soundIcon.classList.remove('text-red-500');
    }
    playSound('click');
  } else {
    if (soundIcon) {
      soundIcon.setAttribute('data-lucide', 'volume-x');
      soundIcon.classList.add('text-red-500');
    }
  }
  if (window.lucide) {
    lucide.createIcons();
  }
}
