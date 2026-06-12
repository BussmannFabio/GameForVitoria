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
      // Som rápido de "pop" para fatias e botões comuns
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(280, now + 0.08);
      
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      
      osc.start(now);
      osc.stop(now + 0.08);
    } 
    else if (type === 'success') {
      // Arpejo de moedas brilhantes
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, index) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.08);
        
        gain.gain.setValueAtTime(0.08, now + index * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.005, now + index * 0.08 + 0.25);
        
        osc.start(now + index * 0.08);
        osc.stop(now + index * 0.08 + 0.25);
      });
    } 
    else if (type === 'error') {
      // Som de buzina decrescente suave e amigável
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.linearRampToValueAtTime(110, now + 0.25);
      
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
      
      osc.start(now);
      osc.stop(now + 0.28);
    } 
    else if (type === 'complete') {
      // Acorde de celebração triunfal
      const baseNotes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
      baseNotes.forEach((freq) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.setValueAtTime(freq * 1.5, now + 0.15); // Quinta
        osc.frequency.setValueAtTime(freq * 2.0, now + 0.3);  // Oitava
        
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.002, now + 0.9);
        
        osc.start(now);
        osc.stop(now + 0.9);
      });
    }
  } catch (e) {
    console.error("Falha ao inicializar Web Audio API: ", e);
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
