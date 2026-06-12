// --- BANCO DE DADOS DOS ECOSSISTEMAS (3 FASES) ---
const ECOSYSTEMS = [
  {
    title: "Ecossistema: Jardim Florestal 🌳",
    desc: "Organize a cadeia alimentar do menor nível de energia até o Decompositor.",
    bgColor: "from-slate-950 via-[#0B1A16] to-slate-950",
    items: [
      { roleId: 0, name: "Flor", role: "Produtor", emoji: "🌱", hint: "Os Produtores (plantas e flores) captam energia solar e dão início a toda cadeia! O 1º nível precisa ser um Produtor.", curiosity: "A flor cresce forte sob o sol e produz o seu próprio alimento, fornecendo energia inicial para os seres vivos!" },
      { roleId: 1, name: "Lagarta", role: "Consumidor 1º", emoji: "🐛", hint: "O 2º nível deve ser o Consumidor Primário (um herbívoro que come a planta diretamente).", curiosity: "Esta lagarta adora roer as folhas verdes das flores e plantas para crescer e virar borboleta." },
      { roleId: 2, name: "Passarinho", role: "Consumidor 2º", emoji: "🐦", hint: "O 3º nível deve ser o Consumidor Secundário (um pequeno carnívoro que caça o consumidor primário).", curiosity: "O passarinho canta feliz no jardim e se alimenta de pequenos insetos e lagartas." },
      { roleId: 3, name: "Gavião", role: "Consumidor 3º", emoji: "🦅", hint: "O 4º nível deve ser o Consumidor Terciário (um grande predador de topo de cadeia).", curiosity: "O gavião tem uma visão super afiada e caça pequenos pássaros e roedores do topo das árvores." },
      { roleId: 4, name: "Cogumelo", role: "Decompositor", emoji: "🍄", hint: "O 5º nível deve ser o Decompositor (organismos que reciclam restos mortais).", curiosity: "Os cogumelos se alimentam de folhas caídas e galhos secos no solo, devolvendo nutrientes importantes para a terra." }
    ]
  },
  {
    title: "Ecossistema: Oceano Atlântico 🌊",
    desc: "Os oceanos têm cadeias marinhas impressionantes. Ajude a organizá-las!",
    bgColor: "from-slate-950 via-[#0A1224] to-slate-950",
    items: [
      { roleId: 0, name: "Algas", role: "Produtor", emoji: "🌿", hint: "O 1º nível de energia do oceano precisa ser o Produtor marinho.", curiosity: "As algas marinhas vivem sob a luz solar e realizam a fotossíntese para produzir energia, iniciando o ciclo da vida marinha!" },
      { roleId: 1, name: "Camarão", role: "Consumidor 1º", emoji: "🦐", hint: "O 2º nível is o Consumidor Primário marinho, que come as algas microscópicas.", curiosity: "Pequenos camarões nadam perto dos recifes e se alimentam de algas microscópicas." },
      { roleId: 2, name: "Peixe Médio", role: "Consumidor 2º", emoji: "🐟", hint: "O 3º nível é o Consumidor Secundário marinho, que come camarões e pequenos crustáceos.", curiosity: "O peixe médio nada em cardumes e se alimenta de camarões e pequenos crustáceos." },
      { roleId: 3, name: "Tubarão", role: "Consumidor 3º", emoji: "🦈", hint: "O 4º nível é o Consumidor Terciário marinho (predador de topo).", curiosity: "O tubarão é o grande caçador do oceano. Ele se alimenta de outros peixes e mantém a vida marinha equilibrada." },
      { roleId: 4, name: "Bactérias", role: "Decompositor", emoji: "🦠", hint: "O 5º nível é o Decompositor marinho que atua no fundo do mar.", curiosity: "As bactérias marinhas vivem em todo o oceano decompondo os restos orgânicos que caem no fundo do mar." }
    ]
  },
  {
    title: "Ecossistema: Savana Africana 🌾",
    desc: "Nas planícies, herbívoros e grandes predadores dividem a energia natural.",
    bgColor: "from-slate-950 via-[#1C160B] to-slate-950",
    items: [
      { roleId: 0, name: "Capim", role: "Produtor", emoji: "🌾", hint: "O 1º nível da savana deve ser o Produtor que fornece energia para os herbívoros.", curiosity: "O capim da savana brota com as chuvas e produz energia com a luz solar para alimentar os grandes bandos de herbívoros!" },
      { roleId: 1, name: "Zebra", role: "Consumidor 1º", emoji: "🦓", hint: "O 2º nível é o Consumidor Primário que pasta a vegetação da savana.", curiosity: "A zebra viaja em bandos e passa o dia pastando, alimentando-se diretamente do capim." },
      { roleId: 2, name: "Leão", role: "Consumidor 2º", emoji: "🦁", hint: "O 3º nível é o Consumidor Secundário que se alimenta de herbívoros.", curiosity: "O leão é o rei da savana! Ele é um predador que caça herbívoros velozes como as zebras." },
      { roleId: 3, name: "Urubu", role: "Consumidor 3º", emoji: "🦅", hint: "O 4º nível é o Consumidor Terciário que se alimenta de restos orgânicos no topo da cadeia.", curiosity: "O urubu voa alto em círculos procurando carcaças de animais que já morreram, limpando o ecossistema." },
      { roleId: 4, name: "Fungos", role: "Decompositor", emoji: "🍄", hint: "O 5º nível é o Decompositor que devolve nutrientes para o solo da savana.", curiosity: "Fungos e bactérias do solo quebram as folhas e galhos caídos na savana, enriquecendo a terra com minerais." }
    ]
  }
];

// --- ESTADO DO JOGO ---
let score = 0;
let errorsCount = 0;
let currentPhase = 0; // 0, 1, 2
let selectedCard = null; // Guarda o card selecionado no clique
let filledSlots = Array(5).fill(null); // Quais cards estão em quais slots (index do slot = roleId)

// --- CONFETES ---
function spawnConfetti() {
  const container = document.getElementById('confetti-container');
  container.innerHTML = '';
  const colors = ['#10B981', '#1CB0F6', '#FFC800', '#FF9600', '#EA2B2B', '#A855F7'];
  
  for (let i = 0; i < 70; i++) {
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
    }, 700);
  }
}

// --- CONTROLE DOS ESTADOS E TELAS ---
function startGame() {
  playSound('click');
  const docEl = document.documentElement;
  const req = docEl.requestFullscreen || docEl.webkitRequestFullscreen || docEl.mozRequestFullScreen || docEl.msRequestFullscreen;
  if (req && !document.fullscreenElement && !document.webkitFullscreenElement) {
    try {
      req.call(docEl).catch(err => console.log(err));
    } catch(e) { console.log(e); }
  }
  document.getElementById('screen-start').classList.add('hidden');
  document.getElementById('screen-game').classList.remove('hidden');
  loadPhase();
}

function loadPhase() {
  const data = ECOSYSTEMS[currentPhase];
  
  // Mudar fundo do corpo dependendo do ecossistema para dar experiência visual premium
  const body = document.getElementById('game-body');
  if (body) {
    body.className = `bg-gradient-to-br ${data.bgColor} min-h-screen text-slate-200 flex flex-col justify-between overflow-x-hidden transition-all duration-750`;
  }

  // Atualizar textos
  document.getElementById('ecosystem-title').innerText = data.title;
  document.getElementById('ecosystem-desc').innerText = data.desc;
  document.getElementById('phase-indicator').innerText = `Ecossistema ${currentPhase + 1} de ${ECOSYSTEMS.length}`;
  
  // Progresso
  const progressPercent = (currentPhase / ECOSYSTEMS.length) * 100;
  document.getElementById('phase-progress-bar').style.width = `${progressPercent}%`;

  // Resetar estados locais da fase
  filledSlots = Array(5).fill(null);
  selectedCard = null;
  document.getElementById('hint-box').classList.add('hidden');
  document.getElementById('curiosity-box').classList.add('hidden');
  document.getElementById('next-phase-container').classList.add('hidden');
  document.getElementById('validate-container').classList.remove('hidden');

  // Gerar Slots Vazios
  renderSlots(data.items);

  // Embaralhar e Gerar Cards
  const shuffledItems = [...data.items].sort(() => Math.random() - 0.5);
  renderDeck(shuffledItems);
}

// --- RENDERIZAR OS SLOTS DE DESTINO ---
function renderSlots(items) {
  const container = document.getElementById('slots-container');
  container.innerHTML = '';

  items.forEach((item, index) => {
    // Criar o slot principal
    const slotDiv = document.createElement('div');
    slotDiv.className = "flex flex-col items-center w-full";
    
    // Slot receptor do drag/drop
    const receptor = document.createElement('div');
    receptor.id = `slot-${item.roleId}`;
    receptor.className = "w-full aspect-[4/5] sm:aspect-square md:h-36 md:w-32 bg-slate-900/60 border-3 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center p-3 relative shadow-inner hover:bg-slate-900/80 transition-all duration-200";
    receptor.dataset.expectedRole = index; // Armazena a ordem de energia esperada (0 a 4)

    // Label interior descritiva (Ocultando o papel biológico literal)
    receptor.innerHTML = `
      <div class="pointer-events-none flex flex-col items-center text-center">
        <span class="text-xs font-black text-slate-400 uppercase tracking-wider">${index + 1}º Nível</span>
      </div>
    `;

    // --- LISTENERS DE TOQUE / DRAG & DROP PARA O RECEPTOR ---
    receptor.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (!filledSlots[index]) {
        receptor.classList.add('border-brandYellow', 'bg-amber-950/20');
      }
    });

    receptor.addEventListener('dragleave', () => {
      receptor.classList.remove('border-brandYellow', 'bg-amber-950/20');
    });

    receptor.addEventListener('drop', (e) => {
      e.preventDefault();
      receptor.classList.remove('border-brandYellow', 'bg-amber-950/20');
      
      const cardId = e.dataTransfer.getData('text/plain');
      const cardEl = document.getElementById(cardId);
      if (cardEl) {
        placeCardInSlot(cardEl, receptor);
      }
    });

    // Clique no slot (para a mecânica híbrida toque)
    receptor.addEventListener('click', () => {
      if (selectedCard) {
        placeCardInSlot(selectedCard, receptor);
      }
    });

    slotDiv.appendChild(receptor);
    container.appendChild(slotDiv);
  });
}

// --- RENDERIZAR OS CARDS NA BANDEJA (DECK) ---
function renderDeck(items) {
  const container = document.getElementById('deck-container');
  container.innerHTML = '';
  const data = ECOSYSTEMS[currentPhase];

  items.forEach((item) => {
    const card = document.createElement('div');
    card.id = `card-${item.roleId}`;
    card.className = "w-28 h-36 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-grab select-none card-float shadow-[0_6px_0_0_rgba(2,6,23,0.8)] hover:shadow-[0_8px_0_0_rgba(2,6,23,0.9)] hover:-translate-y-1 transition-all duration-150 active:cursor-grabbing";
    card.setAttribute('draggable', 'true');
    card.dataset.roleId = item.roleId;

    // Conteúdo do card (Ocultando o papel biológico literal!)
    card.innerHTML = `
      <span class="text-3xl filter drop-shadow-md select-none pointer-events-none">${item.emoji}</span>
      <div class="text-center pointer-events-none select-none">
        <h4 class="font-extrabold text-sm text-slate-200 leading-tight">${item.name}</h4>
      </div>
    `;

    // --- LISTENERS DE INTERAÇÃO PARA O CARD ---
    
    // Drag Nativo
    card.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', card.id);
      card.classList.add('opacity-50');
      playSound('click');
      
      // Exibe curiosidade sutil
      const currentItem = data.items.find(i => i.roleId === item.roleId);
      showCuriosity(currentItem);
    });

    card.addEventListener('dragend', () => {
      card.classList.remove('opacity-50');
    });

    // Clique para seleção assistida
    card.addEventListener('click', (e) => {
      e.stopPropagation();
      playSound('click');
      
      if (card.classList.contains('placed')) return;

      // Se clicar no mesmo card, desmarca e esconde curiosidade
      if (selectedCard === card) {
        card.classList.remove('border-brandYellow', 'ring-4', 'ring-brandYellow/30');
        selectedCard = null;
        document.getElementById('curiosity-box').classList.add('hidden');
        return;
      }

      // Desmarcar anterior
      if (selectedCard) {
        selectedCard.classList.remove('border-brandYellow', 'ring-4', 'ring-brandYellow/30');
      }

      // Marcar atual
      selectedCard = card;
      card.classList.add('border-brandYellow', 'ring-4', 'ring-brandYellow/30');
      
      // Exibir Curiosidade Biológica
      const currentItem = data.items.find(i => i.roleId === item.roleId);
      showCuriosity(currentItem);
    });

    container.appendChild(card);
  });

  // Clique fora dos cards desmarca e esconde a curiosidade
  document.onclick = function(e) {
    if (selectedCard && !e.target.closest('#deck-container') && !e.target.closest('#slots-container')) {
      selectedCard.classList.remove('border-brandYellow', 'ring-4', 'ring-brandYellow/30');
      selectedCard = null;
      document.getElementById('curiosity-box').classList.add('hidden');
    }
  };
}

// Exibir Curiosidade
function showCuriosity(item) {
  const curiosityBox = document.getElementById('curiosity-box');
  const curiosityText = document.getElementById('curiosity-text');
  const curiosityTitle = document.getElementById('curiosity-title');
  
  curiosityTitle.innerHTML = `Curiosidade: <span class="text-indigo-300">${item.name} ${item.emoji}</span>`;
  curiosityText.innerText = item.curiosity;
  
  curiosityBox.classList.remove('hidden');
}

// --- COLOCAR CARD NO SLOT ---
function placeCardInSlot(cardEl, slotEl) {
  const slotIndex = parseInt(slotEl.dataset.expectedRole); // index do slot (0 a 4)
  const cardRoleId = parseInt(cardEl.dataset.roleId);
  
  const data = ECOSYSTEMS[currentPhase];
  const itemData = data.items.find(i => i.roleId === cardRoleId);

  // Se o slot já está preenchido, removemos o card antigo primeiro
  if (filledSlots[slotIndex]) {
    const oldItem = filledSlots[slotIndex];
    const oldCard = document.getElementById(`card-${oldItem.roleId}`);
    if (oldCard) {
      oldCard.classList.remove('hidden');
    }
  }

  // Marcar slot como preenchido temporariamente com este card
  filledSlots[slotIndex] = itemData;

  // Resetar seleções visuais do card na bandeja
  cardEl.classList.remove('border-brandYellow', 'ring-4', 'ring-brandYellow/30');
  cardEl.classList.add('hidden'); // Oculta na bandeja
  
  // Esconde curiosidade
  document.getElementById('curiosity-box').classList.add('hidden');
  
  // Toca som de clique/encaixe neutro
  playSound('click');

  // Desenhar o card encaixado no slot (Estilo azul/indigo neutro de "encaixado")
  slotEl.className = "w-full aspect-[4/5] sm:aspect-square md:h-36 md:w-32 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-between p-3 relative shadow-md text-center";
  
  slotEl.innerHTML = `
    <button onclick="event.stopPropagation(); removeCardFromSlot(${slotIndex})" class="absolute -top-2 -right-2 bg-slate-800 hover:bg-brandRed text-slate-400 hover:text-white rounded-full p-1 transition-colors shadow-sm z-20">
      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path></svg>
    </button>
    <span class="text-3xl filter drop-shadow-md select-none mt-1 pointer-events-none">${itemData.emoji}</span>
    <div class="text-center select-none mt-1 pointer-events-none">
      <h4 class="font-extrabold text-xs text-slate-200 leading-tight">${itemData.name}</h4>
      <span class="text-[9px] font-bold text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded-full mt-0.5 inline-block uppercase">Encaixado</span>
    </div>
  `;

  // Se o card selecionado era esse, limpa
  selectedCard = null;
  
  // Esconder dicas de erro antigas
  document.getElementById('hint-box').classList.add('hidden');
}

// --- REMOVER CARD DO SLOT ---
function removeCardFromSlot(slotIndex) {
  playSound('click');
  const itemData = filledSlots[slotIndex];
  if (itemData) {
    const cardEl = document.getElementById(`card-${itemData.roleId}`);
    if (cardEl) {
      cardEl.classList.remove('hidden');
    }
    resetSlotToEmpty(slotIndex);
    document.getElementById('hint-box').classList.add('hidden');
  }
}

// --- RESETAR SLOT PARA VAZIO ---
function resetSlotToEmpty(slotIndex) {
  const data = ECOSYSTEMS[currentPhase];
  const item = data.items[slotIndex];
  const receptor = document.getElementById(`slot-${item.roleId}`);
  
  receptor.className = "w-full aspect-[4/5] sm:aspect-square md:h-36 md:w-32 bg-slate-900/60 border-3 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center p-3 relative shadow-inner hover:bg-slate-900/80 transition-all duration-200";
  receptor.innerHTML = `
    <div class="pointer-events-none flex flex-col items-center text-center">
      <span class="text-xs font-black text-slate-400 uppercase tracking-wider">${slotIndex + 1}º Nível</span>
    </div>
  `;
  filledSlots[slotIndex] = null;
}

// --- VALIDAR ECOSSISTEMA INTEIRO (BOTÃO FINAL) ---
function validateEcosystem() {
  const data = ECOSYSTEMS[currentPhase];
  
  // 1. Verificar se todos os 5 slots estão preenchidos
  const allFilled = filledSlots.every(slot => slot !== null);
  if (!allFilled) {
    playSound('error');
    const hintBox = document.getElementById('hint-box');
    const hintText = document.getElementById('hint-text');
    
    hintText.innerHTML = "Por favor, encaixe todos os 5 seres vivos nos slots para podermos verificar o equilíbrio do ecossistema!";
    hintBox.classList.remove('hidden');
    return;
  }

  // 2. Validar cada slot
  let allCorrect = true;
  let firstErrorIndex = -1;
  const incorrectSlots = [];

  for (let i = 0; i < 5; i++) {
    const cardData = filledSlots[i];
    if (cardData.roleId !== i) {
      allCorrect = false;
      incorrectSlots.push(i);
      if (firstErrorIndex === -1) {
        firstErrorIndex = i;
      }
    }
  }

  if (allCorrect) {
    // ACERTOU TUDO!
    playSound('complete');
    spawnConfetti();

    // Mudar estilo de todos os slots para verde brilhante e travar
    for (let i = 0; i < 5; i++) {
      const itemData = filledSlots[i];
      const receptor = document.getElementById(`slot-${data.items[i].roleId}`);
      receptor.className = "w-full aspect-[4/5] sm:aspect-square md:h-36 md:w-32 bg-emerald-950/40 border-3 border-brandGreen rounded-2xl flex flex-col items-center justify-between p-3 relative shadow-md text-center";
      receptor.innerHTML = `
        <div class="absolute top-1.5 right-1.5 bg-brandGreen text-white rounded-full p-0.5">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <span class="text-3xl filter drop-shadow-md select-none mt-1 pointer-events-none">${itemData.emoji}</span>
        <div class="text-center select-none mt-1 pointer-events-none">
          <h4 class="font-extrabold text-xs text-slate-200 leading-tight">${itemData.name}</h4>
          <span class="text-[9px] font-black text-emerald-300 bg-emerald-900/40 px-1.5 py-0.5 rounded-full mt-0.5 inline-block uppercase">Correto</span>
        </div>
      `;
    }

    // Esconder botão de validar
    document.getElementById('validate-container').classList.add('hidden');
    document.getElementById('hint-box').classList.add('hidden');
    document.getElementById('curiosity-box').classList.add('hidden');

    // Dar pontos e expandir barra
    score += 100;
    document.getElementById('score-text').innerText = `${score} Pontos`;

    const progressPercent = ((currentPhase + 1) / ECOSYSTEMS.length) * 100;
    document.getElementById('phase-progress-bar').style.width = `${progressPercent}%`;

    // Mostrar botão de avançar
    document.getElementById('next-phase-container').classList.remove('hidden');

  } else {
    // ERROU ALGUNS!
    playSound('error');
    errorsCount++;

    // Shake nos slots errados e ejeta os cards incorretos de volta para a bandeja
    incorrectSlots.forEach(slotIndex => {
      const dataItem = data.items[slotIndex];
      const receptor = document.getElementById(`slot-${dataItem.roleId}`);
      
      receptor.classList.add('animate-shake', 'border-brandRed', 'bg-red-950/20');
      
      setTimeout(() => {
        receptor.classList.remove('animate-shake', 'border-brandRed', 'bg-red-950/20');
        
        // Ejetar o card
        const cardData = filledSlots[slotIndex];
        if (cardData) {
          const cardEl = document.getElementById(`card-${cardData.roleId}`);
          if (cardEl) {
            cardEl.classList.remove('hidden');
            cardEl.classList.add('animate-shake');
            setTimeout(() => cardEl.classList.remove('animate-shake'), 400);
          }
          resetSlotToEmpty(slotIndex);
        }
      }, 450);
    });

    // Dica baseada no primeiro erro encontrado da esquerda para a direita
    const expectedItem = data.items[firstErrorIndex];
    const hintBox = document.getElementById('hint-box');
    const hintText = document.getElementById('hint-text');
    
    hintText.innerHTML = `Identifiquei um desequilíbrio ecológico! <br><span class="text-blue-355 text-blue-400">${expectedItem.hint}</span>`;
    hintBox.classList.remove('hidden');
  }
}

// --- AVANÇAR DE ECOSSISTEMA ---
function advancePhase() {
  playSound('click');
  currentPhase++;

  if (currentPhase < ECOSYSTEMS.length) {
    loadPhase();
  } else {
    // Vitória geral!
    showVictoryScreen();
  }
}

// --- TELA DE VITÓRIA GERAL ---
function showVictoryScreen() {
  document.getElementById('screen-game').classList.add('hidden');
  document.getElementById('screen-victory').classList.remove('hidden');
  playSound('complete');
  
  // Placar
  document.getElementById('victory-errors').innerText = errorsCount;
  document.getElementById('victory-score').innerText = score;
  
  let performanceText = "Excepcional! 🏆";
  let starColors = ["text-brandYellow", "text-brandYellow", "text-brandYellow"];
  
  if (errorsCount >= 6) {
    performanceText = "Protetor Iniciante 🌱";
    starColors = ["text-brandYellow", "text-slate-300", "text-slate-300"];
  } else if (errorsCount >= 3) {
    performanceText = "Guardião da Biosfera 🦌";
    starColors = ["text-brandYellow", "text-brandYellow", "text-slate-300"];
  }
  
  document.getElementById('victory-perf').innerText = performanceText;

  // Pintar estrelas de ouro
  document.getElementById('star-1').className = `w-10 h-10 ${starColors[0]} fill-current animate-pop-in`;
  document.getElementById('star-2').className = `w-12 h-12 ${starColors[1]} fill-current -translate-y-2 animate-pop-in`;
  document.getElementById('star-3').className = `w-10 h-10 ${starColors[2]} fill-current animate-pop-in`;
}

// --- REINICIAR O JOGO ---
function resetGame() {
  playSound('click');
  score = 0;
  errorsCount = 0;
  currentPhase = 0;
  
  document.getElementById('score-text').innerText = `0 Pontos`;
  document.getElementById('screen-victory').classList.add('hidden');
  document.getElementById('screen-start').classList.remove('hidden');
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

// Inicializar Lucide Icons
lucide.createIcons();

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
