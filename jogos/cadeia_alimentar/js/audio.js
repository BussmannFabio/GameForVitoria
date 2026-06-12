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
      // Clique simples (pop)
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(500, now);
      osc.frequency.exponentialRampToValueAtTime(250, now + 0.08);
      
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      
      osc.start(now);
      osc.stop(now + 0.08);
    } 
    else if (type === 'success') {
      // Nota alta e brilhante de acerto
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(783.99, now + 0.08); // G5
      
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.25);
      
      osc.start(now);
      osc.stop(now + 0.25);
    } 
    else if (type === 'error') {
      // Buzina baixa de erro
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(100, now + 0.22);
      
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      
      osc.start(now);
      osc.stop(now + 0.25);
    } 
    else if (type === 'complete') {
      // Vitória da rodada
      const notes = [523.25, 587.33, 659.25, 783.99, 1046.50]; // Arpejo pentatônico
      notes.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        
        gain.gain.setValueAtTime(0.08, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.002, now + i * 0.08 + 0.3);
        
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.3);
      });
    }
  } catch (e) {
    console.error("Falha ao inicializar Web Audio: ", e);
  }
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  const soundIcon = document.getElementById('sound-icon');
  if (soundEnabled) {
    if (soundIcon) {
      soundIcon.setAttribute('data-lucide', 'volume-2');
      soundIcon.classList.remove('text-brandRed');
    }
    playSound('click');
  } else {
    if (soundIcon) {
      soundIcon.setAttribute('data-lucide', 'volume-x');
      soundIcon.classList.add('text-brandRed');
    }
  }
  if (window.lucide) {
    lucide.createIcons();
  }
}
