// --- ESTADO GLOBAL DO JOGO ---
let isPaused = false;
let isClassroomPaused = false;
let solarEnergy = 400; // Inicia com 400 para melhor início de gameplay com maior facilidade
let baseLife = 100;
let score = 0;
let totalKills = 0;
let gameActive = false;
let frameId = null;
let lastTime = 0;

// --- TEMAS DE ECOSSISTEMA SELECIONÁVEIS ---
let currentEcosystem = 'forest';
const ECO_THEMES = {
  forest: {
    name: 'Floresta 🌳',
    produtor: { emoji: '🌿', name: 'Planta' },
    primario: { emoji: '🐰', name: 'Coelho' },
    secundario: { emoji: '🐍', name: 'Serpente' },
    decompositor: { emoji: '🍄', name: 'Cogumelo' }
  },
  ocean: {
    name: 'Oceano 🌊',
    produtor: { emoji: '🌿', name: 'Algas' },
    primario: { emoji: '🦐', name: 'Camarão' },
    secundario: { emoji: '🐟', name: 'Peixe' },
    decompositor: { emoji: '🦠', name: 'Bactéria' }
  },
  savanna: {
    name: 'Savana 🌾',
    produtor: { emoji: '🌾', name: 'Capim' },
    primario: { emoji: '🦓', name: 'Zebra' },
    secundario: { emoji: '🦁', name: 'Leão' },
    decompositor: { emoji: '🍄', name: 'Fungo' }
  }
};

// Configurações do Grid Virtual
const ROWS = 3;
const BOARD_WIDTH = 800; // Coordenada virtual X (0 a 800)

// Dados dos Biomas por Raia
const BIOMES = [
  { id: 0, name: "Floresta 🟩", bgStyle: "bg-gradient-to-r from-emerald-950 to-emerald-900/60", glowClass: "glow-forest" },
  { id: 1, name: "Terra Seca 🟫", bgStyle: "bg-gradient-to-r from-amber-950 to-amber-900/60", glowClass: "glow-savannah" },
  { id: 2, name: "Rio/Água 🟦", bgStyle: "bg-gradient-to-r from-blue-950 to-blue-900/60", glowClass: "glow-water" }
];

// Custo e Descrições dos Cards (iniciados com o tema padrão Floresta)
const CARDS = {
  produtor: { type: 'produtor', name: 'Planta', emoji: '🌿', cost: 30, desc: 'Produtor: Gera +10 energia solar a cada 5s. Serve de alimento para o Coelho.' },
  primario: { type: 'primario', name: 'Coelho', emoji: '🐰', cost: 50, desc: 'Herbívoro: Defende corpo a corpo. Precisa comer plantas para não morrer de fome e ganhar escudo.' },
  secundario: { type: 'secundario', name: 'Serpente', emoji: '🐍', cost: 70, desc: 'Carnívoro: Dispara esferas purificadoras à distância. Caça coelhos para ativar Super Velocidade!' },
  decompositor: { type: 'decompositor', name: 'Cogumelo', emoji: '🍄', cost: 25, desc: 'Decompositor: Decompõe qualquer criatura morta próxima (raio 150px) e devolve +60☀️.' }
};

let selectedType = null; // Card selecionado

// --- ARRAYS DE SIMULAÇÃO SISTÊMICA ---
let plantas = [];
let coelhos = [];
let serpentes = [];
let cogumelos = [];
let enemies = [];
let projectiles = [];

// Timers de Wave
let spawnTimer = 0;
const spawnInterval = 300; // frames (~5s a 60fps)

// Eventos Climáticos ativos
let weatherEffects = {
  superSun: 0,
  acidRain: 0
};

// --- MANUAL CONTROLLER ---
function openManual() {
  document.getElementById('manual-modal').classList.remove('hidden');
  isPaused = true;
}

function closeManual() {
  document.getElementById('manual-modal').classList.add('hidden');
  isPaused = false;
  // Solicitar tela cheia opcionalmente no início de forma segura
  const docEl = document.documentElement;
  const req = docEl.requestFullscreen || docEl.webkitRequestFullscreen || docEl.mozRequestFullScreen || docEl.msRequestFullscreen;
  if (req && !document.fullscreenElement && !document.webkitFullscreenElement) {
    try {
      req.call(docEl).catch(err => console.log(err));
    } catch(e) { console.log(e); }
  }
  if (!gameActive) {
    startGame();
  }
}

// --- SELEÇÃO DE CARDS DO DECK ---
function selectCardToPlace(type) {
  playSound('click');
  
  // Desmarcar anterior
  if (selectedType) {
    const prevBtn = document.getElementById(`card-${selectedType}`);
    if (prevBtn) prevBtn.classList.remove('selected-card');
  }

  if (selectedType === type) {
    selectedType = null;
    updateInfoPanel(null);
    hideGhost();
    return;
  }

  // Validar se tem energia suficiente
  const card = CARDS[type];
  if (solarEnergy < card.cost) {
    playSound('danger');
    // Shake visual no card
    const btn = document.getElementById(`card-${type}`);
    if (btn) { btn.style.animation = 'shake 0.4s'; setTimeout(() => { btn.style.animation = ''; }, 450); }
    spawnFloatText("☀️ Energia insuficiente!", 1, 400, '#FFC800');
    return;
  }

  selectedType = type;
  const selBtn = document.getElementById(`card-${type}`);
  if (selBtn) selBtn.classList.add('selected-card');
  updateInfoPanel(card);
  showGhost(card.emoji);
}

// Chamada do seletor de ecossistema na tela inicial
function selectEcosystemTheme(value) {
  // Estilos de cada ecossistema quando ATIVO vs INATIVO
  const styles = {
    forest: {
      active:   'background: linear-gradient(145deg,#052e16,#064e3b); border: 2px solid #10b981; box-shadow: 0 0 20px rgba(16,185,129,0.5); transform: scale(1.05);',
      inactive: 'background: rgba(5,46,22,0.4); border: 2px solid rgba(16,185,129,0.2); box-shadow: none; transform: scale(1);'
    },
    ocean: {
      active:   'background: linear-gradient(145deg,#0c1449,#1e3a5f); border: 2px solid #38bdf8; box-shadow: 0 0 20px rgba(56,189,248,0.5); transform: scale(1.05);',
      inactive: 'background: rgba(15,23,60,0.4); border: 2px solid rgba(56,189,248,0.2); box-shadow: none; transform: scale(1);'
    },
    savanna: {
      active:   'background: linear-gradient(145deg,#2d1a00,#4d2c00); border: 2px solid #f59e0b; box-shadow: 0 0 20px rgba(245,158,11,0.5); transform: scale(1.05);',
      inactive: 'background: rgba(30,20,5,0.4); border: 2px solid rgba(245,158,11,0.2); box-shadow: none; transform: scale(1);'
    }
  };

  ['forest', 'ocean', 'savanna'].forEach(eco => {
    const btn = document.getElementById(`eco-btn-${eco}`);
    if (!btn) return;
    const s = eco === value ? styles[eco].active : styles[eco].inactive;
    // Aplicar mantendo os atributos base do botão
    s.split(';').filter(Boolean).forEach(rule => {
      const [prop, val] = rule.split(':').map(x => x.trim());
      if (prop && val) {
        // camelCase conversion
        const camel = prop.replace(/-([a-z])/g, (_, l) => l.toUpperCase());
        btn.style[camel] = val;
      }
    });
  });

  // Chamar função de mudança de tema
  changeEcosystemTheme(value);
  // Sincronizar o select do header
  const sel = document.getElementById('eco-select');
  if (sel) sel.value = value;
}

function changeEcosystemTheme(value) {
  currentEcosystem = value;
  const theme = ECO_THEMES[value];
  
  // Update Deck UI Card Emojis and Names
  document.getElementById('card-produtor-emoji').innerText = theme.produtor.emoji;
  document.getElementById('card-produtor-name').innerText = theme.produtor.name;
  
  document.getElementById('card-primario-emoji').innerText = theme.primario.emoji;
  document.getElementById('card-primario-name').innerText = theme.primario.name;
  
  document.getElementById('card-secundario-emoji').innerText = theme.secundario.emoji;
  document.getElementById('card-secundario-name').innerText = theme.secundario.name;
  
  document.getElementById('card-decompositor-emoji').innerText = theme.decompositor.emoji;
  document.getElementById('card-decompositor-name').innerText = theme.decompositor.name;

  // Update active organisms in simulation
  coelhos.forEach(r => {
    const emojiEl = r.el.querySelector('.entity-emoji');
    if (emojiEl) emojiEl.innerText = theme.primario.emoji;
  });
  serpentes.forEach(s => {
    const emojiEl = s.el.querySelector('.entity-emoji');
    if (emojiEl) emojiEl.innerText = theme.secundario.emoji;
  });
  plantas.forEach(p => {
    const emojiEl = p.el.querySelector('span');
    if (emojiEl) emojiEl.innerText = theme.produtor.emoji;
  });
  cogumelos.forEach(m => {
    const emojiEl = m.el.querySelector('span');
    if (emojiEl) emojiEl.innerText = theme.decompositor.emoji;
  });
  
  // Update CARDS mapping references
  CARDS.produtor.name = theme.produtor.name;
  CARDS.produtor.emoji = theme.produtor.emoji;
  CARDS.produtor.desc = `Produtor: Gera +10 energia solar a cada 5s. Serve de alimento para o ${theme.primario.name}.`;

  CARDS.primario.name = theme.primario.name;
  CARDS.primario.emoji = theme.primario.emoji;
  CARDS.primario.desc = `Herbívoro: Defende corpo a corpo. Precisa comer ${theme.produtor.name}s para não morrer de fome e ganhar escudo.`;

  CARDS.secundario.name = theme.secundario.name;
  CARDS.secundario.emoji = theme.secundario.emoji;
  CARDS.secundario.desc = `Carnívoro: Dispara esferas purificadoras à distância. Caça ${theme.primario.name}s para ativar Super Velocidade!`;

  CARDS.decompositor.name = theme.decompositor.name;
  CARDS.decompositor.emoji = theme.decompositor.emoji;
  CARDS.decompositor.desc = `Decompositor: Decompõe qualquer criatura morta próxima (raio 150px) e devolve +60☀️.`;

  // Update manual modal items
  document.getElementById('man-produtor-emoji').innerText = theme.produtor.emoji;
  document.getElementById('man-produtor-title').innerText = `2. ${theme.produtor.name} (Produtor):`;
  document.getElementById('man-produtor-desc').innerText = `Custo 30☀️. Invoque clicando no bioma. Produz Sol e alimenta o ${theme.primario.name}.`;

  document.getElementById('man-primario-emoji').innerText = theme.primario.emoji;
  document.getElementById('man-primario-title').innerText = `3. ${theme.primario.name} (Herbívoro):`;
  document.getElementById('man-primario-desc').innerText = `Custo 50☀️. Spawna na esquerda e avança. Precisa comer ${theme.produtor.name}s para não morrer de fome e ganhar escudo.`;

  document.getElementById('man-secundario-emoji').innerText = theme.secundario.emoji;
  document.getElementById('man-secundario-title').innerText = `4. ${theme.secundario.name} (Carnívoro):`;
  document.getElementById('man-secundario-desc').innerText = `Custo 70☀️. Dispara esferas purificadoras. Caça os ${theme.primario.name}s para carregar Super Tiros!`;

  document.getElementById('man-decompositor-emoji').innerText = theme.decompositor.emoji;
  document.getElementById('man-decompositor-title').innerText = `5. ${theme.decompositor.name} (Decompositor):`;
  document.getElementById('man-decompositor-desc').innerText = `Custo 25☀️. Recicla corpos de criaturas mortas próximas (raio 150px) e devolve +60☀️.`;

  updateDeckUI();
}

function updateInfoPanel(card) {
  const desc = document.getElementById('info-desc');
  if (card) {
    desc.innerHTML = `<span class="text-[#10B981] font-black">${card.emoji} ${card.name}:</span> ${card.desc} <strong class="text-brandYellow">Custo: ${card.cost}☀️</strong>`;
  } else {
    desc.innerText = "Escolha uma criatura abaixo e toque na raia do ecossistema para invocar de forma livre.";
  }
}

function showGhost(emoji) {
  const ghost = document.getElementById('ghost-preview');
  ghost.innerText = emoji;
  ghost.classList.remove('hidden');
}

function hideGhost() {
  const ghost = document.getElementById('ghost-preview');
  ghost.classList.add('hidden');
}

// --- ENGENHARIA DE TOQUE MÓVEL MÚLTIPLO E SEM LAYOUT LAG ---
function bindTouchEvents(element, row) {
  const handler = (e) => {
    e.preventDefault(); // Impede click duplo lag no iOS
    const rect = element.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    // Mapear área ativa (80% da direita) para a faixa [160, 800]
    const clickX = 160 + ((clientX - rect.left) / rect.width) * (BOARD_WIDTH - 160);
    executePlacement(row, clickX);
  };
  
  // Touchstart para mobiles (sem 300ms lag)
  element.addEventListener('touchstart', handler, { passive: false });
  // Click fallback para desktop
  element.addEventListener('click', handler);
}

// --- INICIALIZADOR DE GAMEPLAY ---
function startGame() {
  initGameBoard();
  gameActive = true;
  lastTime = performance.now();
  spawnEnemy();
  frameId = requestAnimationFrame(gameLoop);
}

function initGameBoard() {
  const container = document.getElementById('game-board-container');
  
  // Limpar raias anteriores
  const oldRaias = container.querySelectorAll('.raia-biome');
  oldRaias.forEach(r => r.remove());

  // Instanciar as 3 raias bioma
  for (let r = 0; r < ROWS; r++) {
    const biome = BIOMES[r];
    
    const raia = document.createElement('div');
    raia.id = `raia-${r}`;
    raia.className = `raia-biome flex items-center w-full relative border-b border-slate-800/80 ${biome.bgStyle} ${biome.glowClass}`;
    raia.style.height = "33.33%"; // preenchimento vertical perfeito
    
    // A Base da Natureza na extrema esquerda (20%)
    const baseDiv = document.createElement('div');
    baseDiv.id = `base-${r}`;
    baseDiv.className = "w-[20%] h-full bg-slate-950/70 border-r border-slate-800/80 flex flex-col items-center justify-center p-2 text-center relative shadow-lg z-10 transition-all";
    baseDiv.innerHTML = `
      <span class="text-2xl md:text-3xl filter drop-shadow-md animate-pulse">🌸</span>
      <span class="text-[8px] md:text-[9px] font-black text-emerald-400 mt-0.5 uppercase tracking-wider">Coração</span>
      <div class="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1 border border-slate-700">
        <div id="base-life-bar-${r}" class="bg-brandGreen h-full" style="width: 100%"></div>
      </div>
    `;
    
    raia.appendChild(baseDiv);

    // Área de toque ativo (80% largura)
    const activeArea = document.createElement('div');
    activeArea.className = "w-[80%] h-full relative z-10";
    
    // Vincular Toque rápido e mouse move
    bindTouchEvents(activeArea, r);
    activeArea.addEventListener('mousemove', (e) => handleLaneMouseMove(e, r));
    activeArea.addEventListener('mouseleave', () => hideGhost());

    raia.appendChild(activeArea);

    container.insertBefore(raia, document.getElementById('entities-container'));
  }

  // Reiniciar Arrays e Valores
  plantas.forEach(p => p.el.remove());
  coelhos.forEach(c => c.el.remove());
  serpentes.forEach(s => s.el.remove());
  cogumelos.forEach(c => c.el.remove());
  enemies.forEach(e => e.el.remove());
  projectiles.forEach(p => p.el.remove());

  plantas = [];
  coelhos = [];
  serpentes = [];
  cogumelos = [];
  enemies = [];
  projectiles = [];
  
  solarEnergy = 400; // Começa com 400 para maior facilidade
  baseLife = 100;
  score = 0;
  totalKills = 0;
  spawnTimer = 0;

  document.getElementById('solar-text').innerText = solarEnergy;
  document.getElementById('base-life-text').innerText = `Vida: 100%`;
  
  // Garante que o coração resete para pulsação normal
  document.getElementById('heart-icon').innerText = '❤️';
  document.getElementById('base-life-card').className = "bg-slate-900/90 border border-slate-700 px-3.5 py-1.5 rounded-2xl text-xs md:text-sm font-bold flex items-center gap-3.5 shadow-md transition-all";

  updateDeckUI();
}

// --- CONTROLES DE MOVE DO GHOST ---
function handleLaneMouseMove(e, row) {
  if (!selectedType) return;
  const ghost = document.getElementById('ghost-preview');
  const container = document.getElementById('game-board-container');
  const rect = container.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  
  // Ajusta Y vertical conforme a raia responsiva
  const laneHeight = rect.height / 3;
  ghost.style.top = `${row * laneHeight + (laneHeight / 2) - 24}px`;
  
  // Todos os aliados agora são posicionados livremente no eixo X estilo PvZ
  ghost.style.left = `${mouseX - 20}px`;
  ghost.classList.remove('hidden');
}

function executePlacement(row, x) {
  if (!selectedType) return;
  
  // Checar limites de capacidade biológica trófica (Predador e Presa)
  const theme = ECO_THEMES[currentEcosystem];
  if (selectedType === 'primario') {
    if (coelhos.length >= plantas.length) {
      playSound('danger');
      spawnFloatText(`⚠️ Precisa de mais ${theme.produtor.name}s!`, row, x, '#FF9600');
      return;
    }
  } else if (selectedType === 'secundario') {
    if (serpentes.length >= coelhos.length) {
      playSound('danger');
      spawnFloatText(`⚠️ Precisa de mais ${theme.primario.name}s!`, row, x, '#FF9600');
      return;
    }
  } else if (selectedType === 'decompositor') {
    if (cogumelos.length >= serpentes.length) {
      playSound('danger');
      spawnFloatText(`⚠️ Precisa de mais ${theme.secundario.name}s!`, row, x, '#FF9600');
      return;
    }
  }

  const card = CARDS[selectedType];

  // Deduzir energia solar
  solarEnergy -= card.cost;
  document.getElementById('solar-text').innerText = solarEnergy;
  playSound('invoke');

  // Spawns (Todos passam o X clicado agora)
  if (card.type === 'produtor') {
    spawnPlant(row, x);
  } else if (card.type === 'decompositor') {
    spawnMushroom(row, x);
  } else if (card.type === 'primario') {
    spawnRabbit(row, x);
  } else if (card.type === 'secundario') {
    spawnSnake(row, x);
  }

  // Desmarcar card
  selectCardToPlace(selectedType);
  updateDeckUI();
}

// --- CONTROLE DOS CARDS DO DECK (HOT/COLD PREMIUM) ---
function updateDeckUI() {
  const theme = ECO_THEMES[currentEcosystem];
  Object.keys(CARDS).forEach(key => {
    const card = CARDS[key];
    const btn = document.getElementById(`card-${key}`);
    if (!btn) return;
    
    const canAfford = solarEnergy >= card.cost;
    let meetsTrophicLock = true;
    let lockReason = "";

    if (key === 'primario' && coelhos.length >= plantas.length) {
      meetsTrophicLock = false;
      lockReason = `Precisa: ${theme.produtor.name}`;
    } else if (key === 'secundario' && serpentes.length >= coelhos.length) {
      meetsTrophicLock = false;
      lockReason = `Precisa: ${theme.primario.name}`;
    } else if (key === 'decompositor' && cogumelos.length >= serpentes.length) {
      meetsTrophicLock = false;
      lockReason = `Precisa: ${theme.secundario.name}`;
    }

    const isLocked = !canAfford || !meetsTrophicLock;
    const badge = btn.querySelector('.cost-badge');

    if (!isLocked) {
      btn.classList.remove('card-locked');
      btn.style.opacity = '';
      btn.style.pointerEvents = '';
      if (badge) {
        badge.innerText = `${card.cost}☀️`;
        badge.classList.remove('text-red-400');
      }
    } else {
      btn.classList.add('card-locked');
      // Se estava selecionado e não pode mais colocar, deselecionar
      if (selectedType === key) {
        selectedType = null;
        btn.classList.remove('selected-card');
        updateInfoPanel(null);
        hideGhost();
      }
      if (badge) {
        if (!meetsTrophicLock) {
          badge.innerText = lockReason;
          badge.classList.add('text-red-400');
        } else {
          badge.innerText = `${card.cost}☀️`;
          badge.classList.remove('text-red-400');
        }
      }
    }
  });
}

// --- SPAWNS SISTÊMICOS DE ENTIDADES ---
function spawnPlant(row, x) {
  const theme = ECO_THEMES[currentEcosystem];
  const el = document.createElement('div');
  el.className = "absolute w-12 h-12 flex flex-col items-center justify-between pointer-events-none select-none z-20 transition-all duration-75";
  el.innerHTML = `
    <span class="text-3xl md:text-3.5xl filter drop-shadow-md">${theme.produtor.emoji}</span>
    <div class="w-8 bg-slate-950 border border-slate-700 h-1 rounded-full overflow-hidden mt-0.5">
      <div class="life-bar bg-brandGreen h-full" style="width: 100%"></div>
    </div>
  `;
  document.getElementById('entities-container').appendChild(el);

  plantas.push({
    x: x,
    row: row,
    life: 100,
    maxLife: 100,
    lastSunGen: performance.now(),
    el: el
  });
}

// Global variable for enemy indexing
let enemyId = 0;

function spawnMushroom(row, x) {
  const theme = ECO_THEMES[currentEcosystem];
  const el = document.createElement('div');
  el.className = "absolute w-12 h-12 flex flex-col items-center justify-between pointer-events-none select-none z-20 transition-all duration-75";
  el.innerHTML = `
    <span class="text-3xl md:text-3.5xl filter drop-shadow-md animate-pulse">${theme.decompositor.emoji}</span>
    <div class="w-8 bg-slate-950 border border-slate-700 h-1 rounded-full overflow-hidden mt-0.5">
      <div class="life-bar bg-brandGreen h-full" style="width: 100%"></div>
    </div>
  `;
  document.getElementById('entities-container').appendChild(el);

  cogumelos.push({
    x: x,
    row: row,
    life: 100,
    maxLife: 100,
    el: el
  });
}

function spawnRabbit(row, x) {
  const theme = ECO_THEMES[currentEcosystem];
  const el = document.createElement('div');
  el.className = "absolute w-12 h-12 flex flex-col items-center justify-between p-1 border-2 border-transparent rounded-xl z-20 transition-all duration-75";
  el.innerHTML = `
    <div class="hunger-alert absolute -top-4 bg-brandRed text-white text-[8px] px-1 rounded-full font-black animate-bounce hidden">FOME 😩</div>
    <span class="entity-emoji text-3xl md:text-3.5xl filter drop-shadow-md">${theme.primario.emoji}</span>
    <div class="w-8 bg-slate-950 border border-slate-700 h-1 rounded-full overflow-hidden mt-0.5">
      <div class="life-bar bg-brandGreen h-full" style="width: 100%"></div>
    </div>
  `;
  document.getElementById('entities-container').appendChild(el);

  coelhos.push({
    x: x, // Posicionamento livre
    row: row,
    life: 200, // Vida aumentada (Bloqueador)
    maxLife: 200,
    speed: 0, // Estacionário estilo PvZ
    hunger: 20000, // Fome de 20s
    starving: false,
    shield: false,
    shieldTime: 0,
    lastAction: 0,
    el: el
  });
}

function spawnSnake(row, x) {
  const theme = ECO_THEMES[currentEcosystem];
  const el = document.createElement('div');
  el.className = "absolute w-12 h-12 flex flex-col items-center justify-between p-1 border-2 border-transparent rounded-xl z-20 transition-all duration-75";
  el.innerHTML = `
    <div class="hunger-alert absolute -top-4 bg-brandRed text-white text-[8px] px-1 rounded-full font-black animate-bounce hidden">FOME 😩</div>
    <span class="entity-emoji text-3xl md:text-3.5xl filter drop-shadow-md">${theme.secundario.emoji}</span>
    <div class="w-8 bg-slate-950 border border-slate-700 h-1 rounded-full overflow-hidden mt-0.5">
      <div class="life-bar bg-brandGreen h-full" style="width: 100%"></div>
    </div>
  `;
  document.getElementById('entities-container').appendChild(el);

  serpentes.push({
    x: x, // Posicionamento livre
    row: row,
    life: 150, // Vida aumentada (Atacante Ranged)
    maxLife: 150,
    speed: 0, // Estacionário estilo PvZ
    hunger: 25000, // Fome de 25s
    starving: false,
    supercharged: false,
    superchargeTime: 0,
    lastAction: 0,
    el: el
  });
}

function spawnEnemy() {
  const row = Math.floor(Math.random() * ROWS);
  const el = document.createElement('div');
  el.className = "absolute w-12 h-12 flex flex-col items-center justify-between pointer-events-none select-none z-20 transition-all duration-75";
  el.innerHTML = `
    <span class="text-3xl md:text-3.5xl filter drop-shadow-[0_0_8px_rgba(168,85,247,0.5)] animate-pulse-neon">👾</span>
    <div class="w-8 bg-slate-950 border border-slate-700 h-1 rounded-full overflow-hidden mt-0.5">
      <div class="life-bar bg-brandRed h-full" style="width: 100%"></div>
    </div>
  `;
  document.getElementById('entities-container').appendChild(el);

  enemies.push({
    id: enemyId++,
    x: 780,
    row: row,
    life: 100,
    maxLife: 100,
    speed: 0.25 + Math.random() * 0.25,
    lastAction: 0,
    el: el
  });
}

// --- LOOP DE FISICA E FISICA DA SIMULAÇÃO ---
function gameLoop(time) {
  if (!gameActive) return;

  if (isPaused || isClassroomPaused) {
    lastTime = time;
    frameId = requestAnimationFrame(gameLoop);
    return;
  }

  const deltaTime = time - lastTime;
  lastTime = time;

  updateGamePhysics(deltaTime, time);
  drawGame();

  frameId = requestAnimationFrame(gameLoop);
}

function updateGamePhysics(deltaTime, now) {
  // Spawn Waves
  spawnTimer++;
  if (spawnTimer >= spawnInterval) {
    spawnEnemy();
    spawnTimer = 0;
  }

  // Clima
  if (weatherEffects.superSun > 0) weatherEffects.superSun -= deltaTime;
  if (weatherEffects.acidRain > 0) {
    weatherEffects.acidRain -= deltaTime;
    if (Math.random() < 0.005) damagePlantsAcid();
  }

  // Sol Solar passivo
  if (Math.random() < 0.012) {
    const energyGen = (weatherEffects.superSun > 0) ? 10 : 5;
    solarEnergy += energyGen;
    document.getElementById('solar-text').innerText = solarEnergy;
    updateDeckUI();
  }

  // 1. ATUALIZAR PLANTAS (PRODUTORES)
  plantas.forEach(p => {
    const timeLimit = (weatherEffects.superSun > 0) ? 2500 : 5000;
    if (now - p.lastSunGen >= timeLimit) {
      const sunVal = (weatherEffects.superSun > 0) ? 40 : 20;
      solarEnergy += sunVal;
      document.getElementById('solar-text').innerText = solarEnergy;
      playSound('coin');
      spawnFloatText(`+${sunVal} ☀️`, p.row, p.x, '#FFC800');
      p.lastSunGen = now;
      updateDeckUI();
    }
  });

  // 2. ATUALIZAR COELHOS (HERBÍVOROS)
  for (let i = coelhos.length - 1; i >= 0; i--) {
    const rabbit = coelhos[i];
    const theme = ECO_THEMES[currentEcosystem];
    
    if (rabbit.shieldTime > 0) {
      rabbit.shieldTime -= deltaTime;
      if (rabbit.shieldTime <= 0) rabbit.shield = false;
    }

    rabbit.hunger -= deltaTime;
    if (rabbit.hunger <= 0) {
      rabbit.starving = true;
      rabbit.life -= 0.08 * deltaTime;
      if (rabbit.life <= 0) {
        killEntity(rabbit, i, coelhos, "FOME! 😩");
        continue;
      }
    }

    // Comer Plantas próximas (alimentação estacionária)
    for (let j = plantas.length - 1; j >= 0; j--) {
      const plant = plantas[j];
      if (plant.row === rabbit.row && Math.abs(rabbit.x - plant.x) < 50) {
        plantas.splice(j, 1);
        plant.el.remove();
        
        rabbit.hunger = 20000;
        rabbit.starving = false;
        rabbit.shield = true;
        rabbit.shieldTime = 6000;
        rabbit.life = Math.min(rabbit.life + 50, rabbit.maxLife);
        
        playSound('coin');
        spawnFloatText("SUPER ESCUDO 🛡️", rabbit.row, rabbit.x, '#FFC800');
        spawnFloatText(`DEVORADO! ${theme.produtor.emoji}`, plant.row, plant.x, '#EA2B2B');
        triggerDecomposition(plant.row, plant.x);
        break;
      }
    }

    // Combater pragas corpo a corpo
    enemies.forEach(enemy => {
      if (enemy.row === rabbit.row && Math.abs(rabbit.x - enemy.x) < 30) {
        if (now - rabbit.lastAction >= 1500) {
          enemy.life -= 25;
          playSound('hit');
          spawnFloatText("-25 👾", enemy.row, enemy.x, '#EA2B2B');
          rabbit.lastAction = now;
        }
      }
    });

    if (rabbit.life <= 0) {
      killEntity(rabbit, i, coelhos, `DESTRUIDO! ${theme.primario.emoji}`);
    }
  }

  // 3. ATUALIZAR SERPENTES (CARNÍVOROS)
  for (let i = serpentes.length - 1; i >= 0; i--) {
    const snake = serpentes[i];
    const theme = ECO_THEMES[currentEcosystem];

    if (snake.superchargeTime > 0) {
      snake.superchargeTime -= deltaTime;
      if (snake.superchargeTime <= 0) snake.supercharged = false;
    }

    snake.hunger -= deltaTime;
    if (snake.hunger <= 0) {
      snake.starving = true;
      snake.life -= 0.08 * deltaTime;
      if (snake.life <= 0) {
        killEntity(snake, i, serpentes, "FOME! 😩");
        continue;
      }
    }

    // Caçar coelho próximo (alimentação estacionária)
    for (let j = coelhos.length - 1; j >= 0; j--) {
      const rabbit = coelhos[j];
      if (rabbit.row === snake.row && Math.abs(snake.x - rabbit.x) < 50) {
        coelhos.splice(j, 1);
        rabbit.el.remove();

        snake.hunger = 25000;
        snake.starving = false;
        snake.supercharged = true;
        snake.superchargeTime = 6000;
        snake.life = Math.min(snake.life + 40, snake.maxLife);

        playSound('hit');
        spawnFloatText("SUPER CARGA ⚡", snake.row, snake.x, '#0EA5E9');
        spawnFloatText(`PREDAÇÃO! ${theme.primario.emoji}`, rabbit.row, rabbit.x, '#EA2B2B');
        triggerDecomposition(rabbit.row, rabbit.x);
        break;
      }
    }

    // Disparo à distância se houver inimigos à direita
    const targetEnemies = enemies.some(e => e.row === snake.row && e.x > snake.x);
    if (targetEnemies && !snake.starving) {
      const attackCooldown = snake.supercharged ? 1000 : 2200;
      if (now - snake.lastAction >= attackCooldown) {
        shootProjectile(snake.row, snake.x);
        snake.lastAction = now;
      }
    }

    if (snake.life <= 0) {
      killEntity(snake, i, serpentes, `DESTRUIDA! ${theme.secundario.emoji}`);
    }
  }

  // 4. ATUALIZAR INIMIGOS (PRAGAS)
  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    const theme = ECO_THEMES[currentEcosystem];
    
    // Invasão da Base (agora no limite de 20% da largura, x = 160)
    if (enemy.x <= 160) {
      baseLife = Math.max(0, baseLife - 20);
      document.getElementById('base-life-text').innerText = `Vida: ${baseLife}%`;
      playSound('danger');
      triggerBaseDamageVisual(enemy.row);
      
      enemies.splice(i, 1);
      enemy.el.remove();

      if (baseLife <= 0) endGame(false);
      continue;
    }

    // Checar se há alguma unidade bloqueando o inimigo (PvZ blocker check)
    let blocker = null;
    let minDistance = 25;

    plantas.forEach(p => {
      if (p.row === enemy.row && enemy.x > p.x && (enemy.x - p.x) < minDistance) {
        blocker = { type: 'plant', ref: p };
        minDistance = enemy.x - p.x;
      }
    });
    cogumelos.forEach(m => {
      if (m.row === enemy.row && enemy.x > m.x && (enemy.x - m.x) < minDistance) {
        blocker = { type: 'mushroom', ref: m };
        minDistance = enemy.x - m.x;
      }
    });
    coelhos.forEach(r => {
      if (r.row === enemy.row && enemy.x > r.x && (enemy.x - r.x) < minDistance) {
        blocker = { type: 'rabbit', ref: r };
        minDistance = enemy.x - r.x;
      }
    });
    serpentes.forEach(s => {
      if (s.row === enemy.row && enemy.x > s.x && (enemy.x - s.x) < minDistance) {
        blocker = { type: 'snake', ref: s };
        minDistance = enemy.x - s.x;
      }
    });

    if (blocker) {
      // Bloqueado! Atacar unidade
      if (now - enemy.lastAction >= 1200) {
        const unit = blocker.ref;
        let damage = 20;
        let unitEmoji = "";

        if (blocker.type === 'plant') {
          damage = 20;
          unitEmoji = theme.produtor.emoji;
        } else if (blocker.type === 'mushroom') {
          damage = 20;
          unitEmoji = theme.decompositor.emoji;
        } else if (blocker.type === 'rabbit') {
          damage = unit.shield ? 5 : 15;
          unitEmoji = theme.primario.emoji;
        } else if (blocker.type === 'snake') {
          damage = 15;
          unitEmoji = theme.secundario.emoji;
        }

        unit.life -= damage;
        playSound('hit');
        spawnFloatText(`-${damage} ${unitEmoji}`, enemy.row, unit.x, '#EF4444');
        enemy.lastAction = now;

        if (unit.life <= 0) {
          if (blocker.type === 'plant') {
            const idx = plantas.indexOf(unit);
            if (idx > -1) plantas.splice(idx, 1);
          } else if (blocker.type === 'mushroom') {
            const idx = cogumelos.indexOf(unit);
            if (idx > -1) cogumelos.splice(idx, 1);
          } else if (blocker.type === 'rabbit') {
            const idx = coelhos.indexOf(unit);
            if (idx > -1) coelhos.splice(idx, 1);
          } else if (blocker.type === 'snake') {
            const idx = serpentes.indexOf(unit);
            if (idx > -1) serpentes.splice(idx, 1);
          }
          unit.el.remove();
          triggerDecomposition(enemy.row, unit.x);
          spawnFloatText(`DESTRUIDO! ${unitEmoji}`, enemy.row, unit.x, '#EA2B2B');
        }
      }
    } else {
      // Não bloqueado, avançar
      enemy.x -= enemy.speed;
    }

    if (enemy.life <= 0) {
      playSound('decompose');
      totalKills++;
      score += 50;
      
      spawnFloatText("+50 Pontos", enemy.row, enemy.x, '#58CC02');
      triggerDecomposition(enemy.row, enemy.x);
      
      enemies.splice(i, 1);
      enemy.el.remove();

      if (totalKills % 5 === 0) {
        score += 100;
        solarEnergy += 50;
        document.getElementById('solar-text').innerText = solarEnergy;
        updateDeckUI();
        playSound('coin');
        
        if (totalKills >= 15) {
          endGame(true);
        } else {
          spawnFloatText("Onda Concluída! 🎉", 1, 400, '#FFC800');
        }
      }
    }
  }

  // 5. ATUALIZAR PROJÉTEIS
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const proj = projectiles[i];
    proj.x += proj.speed;

    let hit = false;
    for (let j = 0; j < enemies.length; j++) {
      const enemy = enemies[j];
      if (enemy.row === proj.row && Math.abs(enemy.x - proj.x) < 25) {
        enemy.life -= proj.damage;
        playSound('hit');
        spawnFloatText("-34 👾", enemy.row, enemy.x, '#EF4444');
        hit = true;
        break;
      }
    }

    if (hit || proj.x > 800) {
      projectiles.splice(i, 1);
      proj.el.remove();
    }
  }
}

// --- GERAR PROJÉTIL DE SERPENTE ---
function shootProjectile(row, x) {
  playSound('shoot');
  
  const el = document.createElement('div');
  el.className = "absolute w-4.5 h-4.5 bg-gradient-to-br from-cyan-300 to-blue-500 rounded-full border border-white shadow-[0_0_8px_#22d3ee] z-20 animate-pulse";
  document.getElementById('entities-container').appendChild(el);

  projectiles.push({
    x: x + 20,
    row: row,
    speed: 6.0,
    damage: 34,
    el: el
  });
}

// --- SISTEMA DE MORTE E DECOMPOSIÇÃO ---
function killEntity(entity, index, array, reason) {
  playSound('danger');
  spawnFloatText(reason, entity.row, entity.x, '#EA2B2B');
  
  array.splice(index, 1);
  entity.el.remove();

  triggerDecomposition(entity.row, entity.x);
}

function triggerDecomposition(row, x) {
  const targetMushroom = cogumelos.find(c => c.row === row && Math.abs(c.x - x) <= 150);
  if (targetMushroom) {
    solarEnergy += 60;
    document.getElementById('solar-text').innerText = solarEnergy;
    updateDeckUI();
    playSound('decompose');
    
    spawnDecompParticle(x, targetMushroom.x, row);
    spawnFloatText(`+60 Decomp ${ECO_THEMES[currentEcosystem].decompositor.emoji}`, row, targetMushroom.x, '#A855F7');
  }
}

function spawnDecompParticle(fromX, toX, row) {
  const container = document.getElementById('entities-container');
  const p = document.createElement('div');
  p.className = 'absolute w-3.5 h-3.5 bg-purple-500 rounded-full shadow-[0_0_10px_#a855f7] z-30 transition-all duration-800 ease-out pointer-events-none flex items-center justify-center text-[8px]';
  p.style.left = `${(fromX / 800) * 100}%`;
  p.style.top = `calc(${row * 33.33}% + 16.66% - 7px)`;
  p.innerText = '✨';
  container.appendChild(p);
  
  setTimeout(() => {
    p.style.left = `${(toX / 800) * 100}%`;
    p.style.top = `calc(${row * 33.33}% + 16.66% - 15px)`;
    p.style.transform = 'scale(1.5)';
    p.style.opacity = '0';
  }, 50);
  
  setTimeout(() => p.remove(), 850);
}

function damagePlantsAcid() {
  plantas.forEach((p, idx) => {
    p.life -= 15;
    spawnFloatText("-15 🌧️", p.row, p.x, '#EF4444');
    if (p.life <= 0) {
      plantas.splice(idx, 1);
      p.el.remove();
      triggerDecomposition(p.row, p.x);
    }
  });
}

// --- GERADOR DE TEXTO FLUTUANTE ---
function spawnFloatText(text, row, x, color) {
  const container = document.getElementById('entities-container');
  const textDiv = document.createElement('div');
  textDiv.className = "absolute font-black text-xs md:text-sm tracking-wider pointer-events-none select-none animate-float-text z-30 drop-shadow-md";
  
  textDiv.style.left = `${(x / 800) * 100}%`;
  textDiv.style.top = `calc(${row * 33.33}% + 16.66% - 30px)`;
  textDiv.style.color = color;
  textDiv.innerText = text;
  
  container.appendChild(textDiv);
  
  setTimeout(() => textDiv.remove(), 1200);
}

// --- RENDERIZADOR RESPONSIVO (VERTICAL E HORIZONTAL) ---
function drawGame() {
  // 1. Desenhar Plantas
  plantas.forEach(p => {
    p.el.style.left = `${(p.x / 800) * 100}%`;
    p.el.style.top = `calc(${p.row * 33.33}% + 16.66% - 24px)`;
    p.el.querySelector('.life-bar').style.width = `${p.life}%`;
  });

  // 2. Desenhar Cogumelos
  cogumelos.forEach(c => {
    c.el.style.left = `${(c.x / 800) * 100}%`;
    c.el.style.top = `calc(${c.row * 33.33}% + 16.66% - 24px)`;
    c.el.querySelector('.life-bar').style.width = `${c.life}%`;
  });

  // 3. Desenhar Coelhos
  coelhos.forEach(c => {
    c.el.style.left = `${(c.x / 800) * 100}%`;
    c.el.style.top = `calc(${c.row * 33.33}% + 16.66% - 24px)`;
    c.el.querySelector('.life-bar').style.width = `${c.life}%`;
    
    const alert = c.el.querySelector('.hunger-alert');
    const emoji = c.el.querySelector('.entity-emoji');
    if (c.starving) {
      if (alert) alert.classList.remove('hidden');
      if (emoji) emoji.innerText = "😩";
      c.el.classList.add('animate-pulse-red');
    } else {
      if (alert) alert.classList.add('hidden');
      if (emoji) emoji.innerText = ECO_THEMES[currentEcosystem].primario.emoji;
      c.el.classList.remove('animate-pulse-red');
    }

    if (c.shield) {
      c.el.classList.add('animate-gold-shield');
    } else {
      c.el.classList.remove('animate-gold-shield');
    }
  });

  // 4. Desenhar Serpentes
  serpentes.forEach(s => {
    s.el.style.left = `${(s.x / 800) * 100}%`;
    s.el.style.top = `calc(${s.row * 33.33}% + 16.66% - 24px)`;
    s.el.querySelector('.life-bar').style.width = `${s.life}%`;

    const alert = s.el.querySelector('.hunger-alert');
    const emoji = s.el.querySelector('.entity-emoji');
    if (s.starving) {
      if (alert) alert.classList.remove('hidden');
      if (emoji) emoji.innerText = "😩";
      s.el.classList.add('animate-pulse-red');
    } else {
      if (alert) alert.classList.add('hidden');
      if (emoji) emoji.innerText = ECO_THEMES[currentEcosystem].secundario.emoji;
      s.el.classList.remove('animate-pulse-red');
    }

    if (s.supercharged) {
      s.el.classList.add('animate-supercharge');
    } else {
      s.el.classList.remove('animate-supercharge');
    }
  });

  // 5. Desenhar Inimigos
  enemies.forEach(e => {
    e.el.style.left = `${(e.x / 800) * 100}%`;
    e.el.style.top = `calc(${e.row * 33.33}% + 16.66% - 24px)`;
    e.el.querySelector('.life-bar').style.width = `${e.life}%`;
  });

  // 6. Desenhar Projejécteis
  projectiles.forEach(p => {
    p.el.style.left = `${(p.x / 800) * 100}%`;
    p.el.style.top = `calc(${p.row * 33.33}% + 16.66% - 9px)`;
  });
}

// --- SHAKE E DANOS DA BASE EM CASO DE IMPACTOS ---
function triggerBaseDamageVisual(row) {
  const base = document.getElementById(`base-${row}`);
  const heart = document.getElementById('heart-icon');
  const lifeCard = document.getElementById('base-life-card');
  
  if (base) base.classList.add('bg-red-950/80', 'border-brandRed', 'animate-shake');
  if (heart) {
    heart.innerText = '💔';
    heart.classList.add('animate-shake');
  }
  if (lifeCard) {
    lifeCard.classList.add('animate-shake', 'border-brandRed');
  }
  
  const bar = document.getElementById(`base-life-bar-${row}`);
  if (bar) {
    const currentWidth = bar.style.width ? parseInt(bar.style.width) : 100;
    const rowLife = Math.max(0, currentWidth - 20);
    bar.style.width = `${rowLife}%`;
    if (rowLife < 40) {
      bar.className = "bg-brandRed h-full";
    }
  }

  setTimeout(() => {
    if (base) base.classList.remove('bg-red-950/80', 'border-brandRed', 'animate-shake');
    if (gameActive) {
      if (heart) {
        heart.innerText = '❤️';
        heart.classList.remove('animate-shake');
      }
      if (lifeCard) {
        lifeCard.classList.remove('animate-shake', 'border-brandRed');
      }
    }
  }, 600);
}

// --- CONTROLES DE PAUSA E EVENTOS DA PROFESSORA ---
function togglePauseClassroom() {
  playSound('click');
  isClassroomPaused = !isClassroomPaused;
  
  const panel = document.getElementById('classroom-panel');
  const pauseIcon = document.getElementById('pause-icon');
  const pauseText = document.getElementById('pause-text');

  if (isClassroomPaused) {
    if (panel) panel.classList.remove('hidden');
    if (pauseIcon) pauseIcon.setAttribute('data-lucide', 'play-circle');
    if (pauseText) pauseText.innerText = "Retomar Aula 🎮";
    buildClassroomAnalysis();
  } else {
    if (panel) panel.classList.add('hidden');
    if (pauseIcon) pauseIcon.setAttribute('data-lucide', 'pause-circle');
    if (pauseText) pauseText.innerText = "Pausar Aula ⏱️";
  }
  if (window.lucide) {
    lucide.createIcons();
  }
}

function buildClassroomAnalysis() {
  const container = document.getElementById('classroom-analysis');
  const theme = ECO_THEMES[currentEcosystem];
  
  const pCount = plantas.length;
  const cCount = coelhos.length;
  const sCount = serpentes.length;
  const mCount = cogumelos.length;
  const starvationCount = coelhos.filter(c => c.starving).length + serpentes.filter(s => s.starving).length;

  let html = `<p class="border-b border-slate-800 pb-2 flex gap-2 items-center text-slate-100">
    <i class="w-4 h-4 text-indigo-400" data-lucide="bar-chart-2"></i>
    <span>População Atual: <strong>${pCount}${theme.produtor.emoji}</strong> ${theme.produtor.name}s | <strong>${cCount}${theme.primario.emoji}</strong> ${theme.primario.name}s | <strong>${sCount}${theme.secundario.emoji}</strong> ${theme.secundario.name}s | <strong>${mCount}${theme.decompositor.emoji}</strong> ${theme.decompositor.name}s</span>
  </p>`;

  html += `<div class="space-y-2.5 mt-2">`;

  if (pCount > 0) {
    html += `<p class="flex items-start gap-2 text-emerald-400">
      <i class="w-4 h-4 mt-0.5" data-lucide="check-circle"></i>
      <span>As/Os **${theme.produtor.name}s (Autótrofas)** estão gerando energia solar para o ecossistema. Elas iniciam o fluxo energético.</span>
    </p>`;
  } else {
    html += `<p class="flex items-start gap-2 text-brandRed font-black">
      <i class="w-4 h-4 mt-0.5" data-lucide="alert-triangle"></i>
      <span>Não há ${theme.produtor.name.toLowerCase()}s ativas/os! Sem produtores, a cadeia alimentar entrará em colapso por fome.</span>
    </p>`;
  }

  if (starvationCount > 0) {
    html += `<p class="flex items-start gap-2 text-brandRed font-bold">
      <i class="w-4 h-4 mt-0.5" data-lucide="shield-alert"></i>
      <span>Temos **${starvationCount} consumidor(es) faminto(s) (😩)**. A falta de comida quebrará a cadeia e eles serão extintos!</span>
    </p>`;
  } else if (cCount > 0 || sCount > 0) {
    html += `<p class="flex items-start gap-2 text-amber-300">
      <i class="w-4 h-4 mt-0.5" data-lucide="heart"></i>
      <span>Os consumidores estão nutridos. O fluxo biológico está correndo perfeitamente de forma heterótrofa.</span>
    </p>`;
  }

  if (mCount > 0) {
    html += `<p class="flex items-start gap-2 text-purple-400">
      <i class="w-4 h-4 mt-0.5" data-lucide="refresh-cw"></i>
      <span>Os/As **${theme.decompositor.name}s (Decompositores)** estão ativos/as! Eles reciclam matéria morta de volta ao ciclo de energia (+60☀️).</span>
    </p>`;
  }

  html += `</div>`;

  html += `<div class="mt-3 pt-3 border-t border-slate-800">
    <span class="text-xs text-indigo-400 font-extrabold uppercase tracking-widest block mb-1">Questões Pedagógicas:</span>
    <ul class="list-disc list-inside space-y-1 text-slate-400 text-[11px] font-semibold">
      <li>Por que a/o ${theme.secundario.name} precisa que existam ${theme.primario.name}s na raia para sobreviver?</li>
      <li>Como a ação dos Decompositores (${theme.decompositor.name}s) limpa o bioma e nos devolve energia solar?</li>
    </ul>
  </div>`;

  if (container) container.innerHTML = html;
  if (window.lucide) {
    lucide.createIcons();
  }
}

function triggerWeatherEvent(event) {
  if (!gameActive) return;
  playSound('weather');

  if (event === 'sun') {
    weatherEffects.superSun = 9000;
    spawnFloatText("SUPER SOL ATIVADO! ☀️☀️", 1, 400, '#FFC800');
  } 
  else if (event === 'acid_rain') {
    weatherEffects.acidRain = 9000;
    spawnFloatText("CHUVA ÁCIDA CAINDO! 🌧️⛈️", 1, 400, '#EA2B2B');
  } 
  else if (event === 'toxic') {
    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        if (gameActive && !isPaused && !isClassroomPaused) spawnEnemy();
      }, i * 250);
    }
    spawnFloatText("DESCARTE QUÍMICO DETECTADO! 👾☣️", 1, 400, '#A855F7');
  }

  togglePauseClassroom();
}

// --- FINALIZAÇÃO ---
function endGame(victory) {
  gameActive = false;
  cancelAnimationFrame(frameId);
  
  if (victory) {
    playSound('complete');
    spawnConfetti();
    document.getElementById('screen-victory').classList.remove('hidden');
    document.getElementById('vic-score').innerText = score;
    document.getElementById('vic-saves').innerText = totalKills;
  } else {
    playSound('danger');
    document.getElementById('screen-gameover').classList.remove('hidden');
    document.getElementById('go-score').innerText = score;
    document.getElementById('go-kills').innerText = totalKills;
  }
}

function resetGame() {
  playSound('click');
  
  document.getElementById('screen-victory').classList.add('hidden');
  document.getElementById('screen-gameover').classList.add('hidden');
  document.getElementById('classroom-panel').classList.add('hidden');
  
  isPaused = false;
  isClassroomPaused = false;
  document.getElementById('pause-icon').setAttribute('data-lucide', 'pause-circle');
  document.getElementById('pause-text').innerText = "Pausar Aula ⏱️";
  if (window.lucide) {
    lucide.createIcons();
  }

  // Solicitar tela cheia opcionalmente no recomeço de forma segura
  const docEl = document.documentElement;
  const req = docEl.requestFullscreen || docEl.webkitRequestFullscreen || docEl.mozRequestFullScreen || docEl.msRequestFullscreen;
  if (req && !document.fullscreenElement && !document.webkitFullscreenElement) {
    try {
      req.call(docEl).catch(err => console.log(err));
    } catch(e) { console.log(e); }
  }

  startGame();
}

// --- CONTROLES DE TELA CHEIA ---
function toggleFullscreen() {
  const icon = document.getElementById('fullscreen-icon');
  const docEl = document.documentElement;
  if (!document.fullscreenElement && !document.webkitFullscreenElement) {
    const req = docEl.requestFullscreen || docEl.webkitRequestFullscreen || docEl.mozRequestFullScreen || docEl.msRequestFullscreen;
    if (req) {
      try {
        const promise = req.call(docEl);
        if (promise && promise.then) {
          promise.then(() => {
            if (icon) icon.setAttribute('data-lucide', 'minimize');
            lucide.createIcons();
          }).catch(err => console.log(err));
        } else {
          if (icon) icon.setAttribute('data-lucide', 'minimize');
          lucide.createIcons();
        }
      } catch(e) { console.log(e); }
    }
  } else {
    const exit = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
    if (exit) {
      try {
        const promise = exit.call(document);
        if (promise && promise.then) {
          promise.then(() => {
            if (icon) icon.setAttribute('data-lucide', 'maximize');
            lucide.createIcons();
          }).catch(err => console.log(err));
        } else {
          if (icon) icon.setAttribute('data-lucide', 'maximize');
          lucide.createIcons();
        }
      } catch(e) { console.log(e); }
    }
  }
}

function updateFullscreenIcon() {
  const icon = document.getElementById('fullscreen-icon');
  if (icon) {
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      icon.setAttribute('data-lucide', 'minimize');
    } else {
      icon.setAttribute('data-lucide', 'maximize');
    }
    lucide.createIcons();
  }
}

document.addEventListener('fullscreenchange', updateFullscreenIcon);
document.addEventListener('webkitfullscreenchange', updateFullscreenIcon);

// --- ORIENTATION CHECKER PARA MOBILE ---
function checkOrientation() {
  const overlay = document.getElementById('rotate-overlay');
  if (overlay) {
    if (window.innerHeight > window.innerWidth) {
      overlay.classList.remove('hidden');
    } else {
      overlay.classList.add('hidden');
    }
  }
}
window.addEventListener('resize', checkOrientation);
window.addEventListener('orientationchange', checkOrientation);
checkOrientation();

function spawnConfetti() {
  const container = document.getElementById('confetti-container');
  container.innerHTML = '';
  const colors = ['#58CC02', '#1CB0F6', '#FFC800', '#FF9600', '#EA2B2B', '#A855F7'];
  
  for (let i = 0; i < 80; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'absolute w-3 h-3 rounded-sm opacity-90 transition-all duration-1000 ease-out z-50';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.left = (Math.random() * 80 + 10) + '%';
    confetti.style.top = '100%';
    confetti.style.transform = `scale(${Math.random() * 0.8 + 0.5}) rotate(${Math.random() * 360}deg)`;
    container.appendChild(confetti);
    
    const targetLeft = parseFloat(confetti.style.left) + (Math.random() * 30 - 15);
    const targetTop = Math.random() * 35 + 15;
    
    setTimeout(() => {
      confetti.style.left = targetLeft + '%';
      confetti.style.top = targetTop + '%';
      confetti.style.transform = `scale(${Math.random() * 0.8 + 0.5}) rotate(${Math.random() * 720}deg)`;
    }, 30);

    setTimeout(() => {
      confetti.style.top = '110%';
      confetti.style.opacity = '0';
    }, 800);
  }
}

// Inicializar vinculação de eventos de toque para os cards do deck
document.addEventListener('DOMContentLoaded', () => {
  // Helper para registrar click + touchstart nos cards sem duplo disparo
  const bindCardEvents = (id, type) => {
    const btn = document.getElementById(id);
    if (!btn) return;
    let lastTouch = 0;
    btn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const now = Date.now();
      if (now - lastTouch < 300) return;
      lastTouch = now;
      selectCardToPlace(type);
    }, { passive: false });
    btn.addEventListener('click', () => selectCardToPlace(type));
  };

  bindCardEvents('card-produtor', 'produtor');
  bindCardEvents('card-primario', 'primario');
  bindCardEvents('card-secundario', 'secundario');
  bindCardEvents('card-decompositor', 'decompositor');
  
  // Sincronizar deck de acordo com o ecossistema inicial (Floresta)
  selectEcosystemTheme(currentEcosystem);

  // Ocultar botão de tela cheia se não for suportado pelo aparelho (ex: iPhone Safari)
  const isFullscreenSupported = !!(
    document.documentElement.requestFullscreen ||
    document.documentElement.webkitRequestFullscreen ||
    document.documentElement.mozRequestFullScreen ||
    document.documentElement.msRequestFullscreen
  );
  if (!isFullscreenSupported) {
    const btn = document.getElementById('fullscreen-btn');
    if (btn) btn.classList.add('hidden');
  }
});

// Inicializar Lucide
if (window.lucide) {
  lucide.createIcons();
}
