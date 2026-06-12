// --- ESTADO DO JOGO ---
let score = 0;
let errorsCount = 0;
let currentRound = 0; // 0 a 4
let selectedSlices = []; // Array de booleanos representando o estado de cada fatia

// Lista de clientes com seus avatares em SVG amigáveis
const CLIENTS = [
  {
    name: 'Raposa Flora',
    emoji: '🦊',
    avatarSvg: `<svg viewBox="0 0 100 100" class="w-full h-full">
      <circle cx="50" cy="50" r="45" fill="#FFF3E0" stroke="#FF9800" stroke-width="3"/>
      <polygon points="50,68 18,34 82,34" fill="#FF9800"/>
      <polygon points="50,68 30,34 70,34" fill="#E65100"/>
      <!-- Orelhas -->
      <polygon points="20,38 10,12 36,30" fill="#FF9800" stroke="#E65100" stroke-width="2"/>
      <polygon points="80,38 90,12 64,30" fill="#FF9800" stroke="#E65100" stroke-width="2"/>
      <!-- Rosto Branco -->
      <polygon points="50,68 22,34 50,34" fill="#FFFFFF"/>
      <polygon points="50,68 78,34 50,34" fill="#FFFFFF"/>
      <!-- Olhos -->
      <circle cx="38" cy="40" r="3.5" fill="#3E2723"/>
      <circle cx="62" cy="40" r="3.5" fill="#3E2723"/>
      <circle cx="36" cy="38" r="1.2" fill="#FFFFFF"/>
      <circle cx="60" cy="38" r="1.2" fill="#FFFFFF"/>
      <!-- Nariz -->
      <circle cx="50" cy="65" r="4" fill="#3E2723"/>
      <!-- Bochechas -->
      <circle cx="28" cy="48" r="4" fill="#FFAB91" opacity="0.6"/>
      <circle cx="72" cy="48" r="4" fill="#FFAB91" opacity="0.6"/>
    </svg>`
  },
  {
    name: 'Urso Polar Pipo',
    emoji: '🐻‍❄️',
    avatarSvg: `<svg viewBox="0 0 100 100" class="w-full h-full">
      <circle cx="50" cy="50" r="45" fill="#E0F7FA" stroke="#00ACC1" stroke-width="3"/>
      <!-- Cabeça -->
      <circle cx="50" cy="50" r="36" fill="#FFFFFF" stroke="#B2EBF2" stroke-width="2"/>
      <!-- Orelhas -->
      <circle cx="22" cy="22" r="12" fill="#FFFFFF" stroke="#B2EBF2" stroke-width="2"/>
      <circle cx="22" cy="22" r="7" fill="#E0F7FA"/>
      <circle cx="78" cy="22" r="12" fill="#FFFFFF" stroke="#B2EBF2" stroke-width="2"/>
      <circle cx="78" cy="22" r="7" fill="#E0F7FA"/>
      <!-- Focinho -->
      <ellipse cx="50" cy="62" rx="14" ry="10" fill="#ECEFF1"/>
      <!-- Olhos -->
      <ellipse cx="38" cy="42" rx="3" ry="4" fill="#263238"/>
      <ellipse cx="62" cy="42" rx="3" ry="4" fill="#263238"/>
      <circle cx="37" cy="40" r="1" fill="#FFFFFF"/>
      <circle cx="61" cy="40" r="1" fill="#FFFFFF"/>
      <!-- Nariz -->
      <polygon points="50,56 44,52 56,52" fill="#263238"/>
      <circle cx="50" cy="56" r="3" fill="#263238"/>
      <!-- Boca -->
      <path d="M 46 64 Q 50 67 54 64" fill="none" stroke="#263238" stroke-width="2" stroke-linecap="round"/>
    </svg>`
  },
  {
    name: 'Panda Lilica',
    emoji: '🐼',
    avatarSvg: `<svg viewBox="0 0 100 100" class="w-full h-full">
      <circle cx="50" cy="50" r="45" fill="#F3E5F5" stroke="#AB47BC" stroke-width="3"/>
      <!-- Orelhas Pretas -->
      <circle cx="24" cy="24" r="13" fill="#37474F"/>
      <circle cx="76" cy="24" r="13" fill="#37474F"/>
      <!-- Rosto Branco -->
      <circle cx="50" cy="52" r="35" fill="#FFFFFF" stroke="#ECEFF1" stroke-width="2"/>
      <!-- Manchas Oculares -->
      <ellipse cx="36" cy="48" rx="8" ry="10" fill="#37474F" transform="rotate(-15 36 48)"/>
      <ellipse cx="64" cy="48" rx="8" ry="10" fill="#37474F" transform="rotate(15 64 48)"/>
      <!-- Olhos -->
      <circle cx="37" cy="46" r="3" fill="#FFFFFF"/>
      <circle cx="63" cy="46" r="3" fill="#FFFFFF"/>
      <circle cx="37" cy="46" r="1" fill="#37474F"/>
      <circle cx="63" cy="46" r="1" fill="#37474F"/>
      <!-- Nariz -->
      <ellipse cx="50" cy="59" rx="5" ry="3.5" fill="#37474F"/>
      <!-- Boca -->
      <path d="M 47 64 Q 50 66 53 64" fill="none" stroke="#37474F" stroke-width="2" stroke-linecap="round"/>
    </svg>`
  },
  {
    name: 'Leão Leonardo',
    emoji: '🦁',
    avatarSvg: `<svg viewBox="0 0 100 100" class="w-full h-full">
      <circle cx="50" cy="50" r="45" fill="#FFFDE7" stroke="#FBC02D" stroke-width="3"/>
      <!-- Juba -->
      <path d="M 50 8 C 65 8 75 14 85 24 C 95 34 92 48 92 58 C 92 70 82 82 72 88 C 62 94 48 94 38 92 C 20 88 8 74 8 58 C 8 46 8 32 20 20 C 30 10 40 8 50 8 Z" fill="#E65100"/>
      <circle cx="50" cy="53" r="29" fill="#FFA726"/>
      <!-- Orelhas -->
      <circle cx="28" cy="32" r="7" fill="#E65100"/>
      <circle cx="72" cy="32" r="7" fill="#E65100"/>
      <!-- Bochechas brancas -->
      <circle cx="44" cy="62" r="6" fill="#FFE082"/>
      <circle cx="56" cy="62" r="6" fill="#FFE082"/>
      <!-- Olhos -->
      <circle cx="39" cy="47" r="3.5" fill="#3E2723"/>
      <circle cx="61" cy="47" r="3.5" fill="#3E2723"/>
      <circle cx="38" cy="45" r="1" fill="#FFFFFF"/>
      <circle cx="60" cy="45" r="1" fill="#FFFFFF"/>
      <!-- Nariz -->
      <polygon points="50,58 45,53 55,53" fill="#E65100"/>
      <!-- Bigodinhos -->
      <line x1="34" y1="60" x2="26" y2="59" stroke="#E65100" stroke-width="1.5"/>
      <line x1="34" y1="63" x2="25" y2="64" stroke="#E65100" stroke-width="1.5"/>
      <line x1="66" y1="60" x2="74" y2="59" stroke="#E65100" stroke-width="1.5"/>
      <line x1="66" y1="63" x2="75" y2="64" stroke="#E65100" stroke-width="1.5"/>
    </svg>`
  },
  {
    name: 'Coelho Binho',
    emoji: '🐰',
    avatarSvg: `<svg viewBox="0 0 100 100" class="w-full h-full">
      <circle cx="50" cy="50" r="45" fill="#F3E5F5" stroke="#8E24AA" stroke-width="3"/>
      <!-- Orelhas Longas -->
      <ellipse cx="34" cy="20" rx="7" ry="18" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2"/>
      <ellipse cx="34" cy="20" rx="4" ry="13" fill="#FF8A80"/>
      <ellipse cx="66" cy="20" rx="7" ry="18" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2"/>
      <ellipse cx="66" cy="20" rx="4" ry="13" fill="#FF8A80"/>
      <!-- Rosto -->
      <circle cx="50" cy="58" r="28" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="1.5"/>
      <!-- Bochechas brancas fofas -->
      <circle cx="44" cy="65" r="5" fill="#EEEEEE"/>
      <circle cx="56" cy="65" r="5" fill="#EEEEEE"/>
      <!-- Olhos -->
      <ellipse cx="40" cy="49" rx="2.5" ry="3.5" fill="#37474F"/>
      <ellipse cx="60" cy="49" rx="2.5" ry="3.5" fill="#37474F"/>
      <circle cx="39" cy="47" r="0.8" fill="#FFFFFF"/>
      <circle cx="59" cy="47" r="0.8" fill="#FFFFFF"/>
      <!-- Nariz Rosinha -->
      <polygon points="50,59 47,56 53,56" fill="#FF8A80"/>
      <!-- Dentes -->
      <rect x="47" y="67" width="3" height="3" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="0.5"/>
      <rect x="50" y="67" width="3" height="3" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="0.5"/>
    </svg>`
  }
];

// Banco de Perguntas (Rodadas 1 a 5)
const ROUNDS = [
  { numerator: 1, denominator: 2, fractionText: 'metade', pizzaType: 'Margherita 🧀', hint: 'O cliente pediu "metade". Lembre-se que metade significa 1 parte de uma pizza que foi cortada em 2 fatias iguais!' },
  { numerator: 3, denominator: 4, fractionText: 'três quartos', pizzaType: 'Calabresa Especial 🍕', hint: 'O cliente pediu "três quartos". Ou seja, a pizza está dividida em 4 partes e você deve pintar 3 delas!' },
  { numerator: 2, denominator: 3, fractionText: 'dois terços', pizzaType: 'Quatro Queijos 🧀', hint: 'O cliente quer "dois terços". A pizza foi cortada em 3 pedaços iguais, você deve servir 2 pedaços.' },
  { numerator: 5, denominator: 8, fractionText: 'cinco oitavos', pizzaType: 'Portuguesa Delícia 🧅', hint: 'O cliente quer "cinco oitavos". A pizza tem 8 fatias no total. Conte com calma e pinte 5 fatias!' },
  { numerator: 3, denominator: 5, fractionText: 'três quintos', pizzaType: 'Chocolate com Morango 🍓', hint: 'O cliente quer "três quintos". A pizza está cortada em 5 fatias. Coloque 3 fatias recheadas na tábua!' }
];

// --- SISTEMA DE CONFETES NATIVOS ---
function spawnConfetti() {
  const container = document.getElementById('confetti-container');
  container.innerHTML = '';
  const colors = ['#58CC02', '#1CB0F6', '#FFC800', '#FF9600', '#EA2B2B', '#A855F7'];
  
  for (let i = 0; i < 70; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'absolute w-3.5 h-3.5 rounded-sm opacity-90 transition-all duration-1000 ease-out z-50';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.left = (Math.random() * 80 + 10) + '%';
    confetti.style.top = '100%';
    confetti.style.transform = `scale(${Math.random() * 0.8 + 0.5}) rotate(${Math.random() * 360}deg)`;
    container.appendChild(confetti);
    
    const targetLeft = parseFloat(confetti.style.left) + (Math.random() * 30 - 15);
    const targetTop = Math.random() * 35 + 15; // sobe até 15-50% da tela
    
    // Disparar transição
    setTimeout(() => {
      confetti.style.left = targetLeft + '%';
      confetti.style.top = targetTop + '%';
      confetti.style.transform = `scale(${Math.random() * 0.8 + 0.5}) rotate(${Math.random() * 720}deg)`;
    }, 30);

    // Deixar cair e desaparecer
    setTimeout(() => {
      confetti.style.top = '110%';
      confetti.style.opacity = '0';
    }, 700);
  }
}

// --- CONTROLE DOS TELAS DO JOGO ---
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
  loadRound();
}

function loadRound() {
  const data = ROUNDS[currentRound];
  const client = CLIENTS[currentRound % CLIENTS.length];
  
  // Esconder dica e painel numérico da rodada anterior
  document.getElementById('hint-box').classList.add('hidden');
  document.getElementById('fraction-container').classList.add('hidden');
  
  // Configurar Barra de Progresso
  const progressPercent = (currentRound / ROUNDS.length) * 100;
  document.getElementById('progress-bar').style.width = `${progressPercent}%`;
  document.getElementById('level-indicator').innerText = `Pedido ${currentRound + 1} de ${ROUNDS.length}`;

  // Carregar Cliente e Fala
  document.getElementById('client-speech-bubble').innerHTML = `
    "Olá, eu sou o <strong>${client.name}</strong>! <br>Quero comer <span class="text-brandOrange font-black text-xl">${data.fractionText}</span> da pizza de <span class="underline decoration-wavy decoration-amber-500">${data.pizzaType}</span>."
  `;
  document.getElementById('client-avatar-container').innerHTML = client.avatarSvg;

  // Resetar estado das fatias
  selectedSlices = Array(data.denominator).fill(false);
  
  // Renderizar Pizza
  drawPizza(data.denominator);
  updateFractionDisplay();
}

// --- RENDERIZAÇÃO DA PIZZA SVG ---
function drawPizza(denominator) {
  const svg = document.getElementById('pizza-svg');
  svg.innerHTML = ''; // Limpar antiga

  const cx = 100;
  const cy = 100;
  const r = 88; // Raio total do queijo/molho
  
  // 1. Desenhar a Borda de Massa Traseira (Círculo dourado de base)
  const crust = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  crust.setAttribute("cx", cx);
  crust.setAttribute("cy", cy);
  crust.setAttribute("r", 93);
  crust.setAttribute("fill", "#D97706"); // Dourada da borda
  crust.setAttribute("stroke", "#B45309");
  crust.setAttribute("stroke-width", "2");
  svg.appendChild(crust);

  // 2. Criar cada uma das fatias em SVG
  const deltaTheta = (2 * Math.PI) / denominator;

  for (let i = 0; i < denominator; i++) {
    const theta1 = i * deltaTheta - Math.PI / 2;
    const theta2 = (i + 1) * deltaTheta - Math.PI / 2;

    // Ângulo médio para efeito de deslocamento no hover
    const avgTheta = (theta1 + theta2) / 2;
    const hoverOffset = 8; // Pixels de afastamento no hover
    const dx = hoverOffset * Math.cos(avgTheta);
    const dy = hoverOffset * Math.sin(avgTheta);

    // Pontos de contorno da fatia
    const x1 = cx + r * Math.cos(theta1);
    const y1 = cy + r * Math.sin(theta1);
    const x2 = cx + r * Math.cos(theta2);
    const y2 = cy + r * Math.sin(theta2);

    // Grupo de Fatia (para agrupar queijo, linha divisória, calabresas, etc.)
    const sliceGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    sliceGroup.setAttribute("class", "slice-group cursor-pointer select-none");
    sliceGroup.setAttribute("style", "transform-origin: 100px 100px;");
    sliceGroup.dataset.index = i;

    // Path base da fatia (queijo se selecionada, massa crua se desmarcada)
    const slicePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    slicePath.setAttribute("class", "slice-path");
    // Comando SVG do arco
    const pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;
    slicePath.setAttribute("d", pathData);
    
    // Cores de fundo (Selecionada = Calabresa amarela/laranja. Não Selecionada = Creme cru)
    slicePath.setAttribute("fill", "#FDF2E9"); // Crua
    slicePath.setAttribute("stroke", "#E2E8F0");
    slicePath.setAttribute("stroke-width", "3");

    sliceGroup.appendChild(slicePath);

    // Adicionar coberturas de calabresa para a fatia (inicialmente escondidas via opacidade)
    const toppingsGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    toppingsGroup.setAttribute("class", "toppings opacity-0 transition-opacity duration-200");
    
    // Desenhar 3 rodelas de calabresa na fatia
    const pepperoniSpots = [
      { dist: 0.45, angleOffset: 0.5 },
      { dist: 0.72, angleOffset: 0.25 },
      { dist: 0.72, angleOffset: 0.75 }
    ];

    pepperoniSpots.forEach(spot => {
      const pepAngle = theta1 + spot.angleOffset * deltaTheta;
      const px = cx + (r * spot.dist) * Math.cos(pepAngle);
      const py = cy + (r * spot.dist) * Math.sin(pepAngle);
      
      const pep = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      pep.setAttribute("cx", px);
      pep.setAttribute("cy", py);
      pep.setAttribute("r", 9);
      pep.setAttribute("fill", "#EF4444"); // Vermelho calabresa
      pep.setAttribute("stroke", "#991B1B");
      pep.setAttribute("stroke-width", "1.5");
      pep.setAttribute("class", "pepperoni-item opacity-0");
      pep.setAttribute("style", `transform-origin: ${px}px ${py}px;`);
      
      // Efeito realista (brilho da gordurinha da calabresa)
      const pepShine = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      pepShine.setAttribute("cx", px - 2.5);
      pepShine.setAttribute("cy", py - 2.5);
      pepShine.setAttribute("r", 2.5);
      pepShine.setAttribute("fill", "#FCA5A5");
      pepShine.setAttribute("class", "pepperoni-item opacity-0");
      pepShine.setAttribute("style", `transform-origin: ${px}px ${py}px;`);
      
      toppingsGroup.appendChild(pep);
      toppingsGroup.appendChild(pepShine);
    });

    // Oréganos (pequenos tracinhos verdes)
    const oreganoSpots = [
      { dist: 0.58, angleOffset: 0.3 },
      { dist: 0.35, angleOffset: 0.7 },
      { dist: 0.65, angleOffset: 0.6 }
    ];
    oreganoSpots.forEach(spot => {
      const oreAngle = theta1 + spot.angleOffset * deltaTheta;
      const ox = cx + (r * spot.dist) * Math.cos(oreAngle);
      const oy = cy + (r * spot.dist) * Math.sin(oreAngle);
      
      const leaf = document.createElementNS("http://www.w3.org/2000/svg", "line");
      leaf.setAttribute("x1", ox - 2);
      leaf.setAttribute("y1", oy - 1);
      leaf.setAttribute("x2", ox + 2);
      leaf.setAttribute("y2", oy + 1);
      leaf.setAttribute("stroke", "#15803D");
      leaf.setAttribute("stroke-width", "2");
      leaf.setAttribute("stroke-linecap", "round");
      
      toppingsGroup.appendChild(leaf);
    });

    sliceGroup.appendChild(toppingsGroup);

    // --- COMPORTAMENTOS DE INTERAÇÃO (MOUSE / TOUCH) ---
    
    // Efeito Hover: A fatia se destaca ligeiramente deslizando para fora
    sliceGroup.addEventListener("mouseenter", () => {
      sliceGroup.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    
    sliceGroup.addEventListener("mouseleave", () => {
      // Mantém um pequeno destaque se estiver selecionada para mostrar recheio maior
      if (selectedSlices[i]) {
        sliceGroup.style.transform = `translate(${dx/3}px, ${dy/3}px)`;
      } else {
        sliceGroup.style.transform = "translate(0px, 0px)";
      }
    });

    // Clique para selecionar/pintar
    sliceGroup.addEventListener("click", () => {
      playSound('click');
      toggleSlice(i, slicePath, toppingsGroup, dx, dy);
    });

    svg.appendChild(sliceGroup);
  }

  // 3. Centralizar uma linha divisória preta/marrom fina por cima de tudo para guiar o olhar
  for (let i = 0; i < denominator; i++) {
    const theta = i * deltaTheta - Math.PI / 2;
    const x = cx + r * Math.cos(theta);
    const y = cy + r * Math.sin(theta);
    
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", cx);
    line.setAttribute("y1", cy);
    line.setAttribute("x2", x);
    line.setAttribute("y2", y);
    line.setAttribute("stroke", "#78350F"); // Linha cor madeira queimada
    line.setAttribute("stroke-width", "1.5");
    line.setAttribute("stroke-dasharray", "1,2");
    line.setAttribute("pointer-events", "none"); // Não atrapalha cliques
    svg.appendChild(line);
  }
}

// Controlar fatias individualmente
function toggleSlice(index, slicePath, toppingsGroup, dx, dy) {
  selectedSlices[index] = !selectedSlices[index];
  
  const sliceGroup = slicePath.parentNode;
  
  if (selectedSlices[index]) {
    // Pinta com queijo derretido dourado delicioso usando animação
    slicePath.classList.remove("animate-cook");
    void slicePath.offsetWidth; // Trigger reflow
    slicePath.classList.add("animate-cook");
    slicePath.setAttribute("stroke", "#F59E0B");
    slicePath.setAttribute("stroke-width", "3");

    // Mostra calabresa/orégano
    toppingsGroup.classList.remove("opacity-0");
    toppingsGroup.classList.add("opacity-100");
    
    // Dispara animação nos pepperonis
    const peps = toppingsGroup.querySelectorAll(".pepperoni-item");
    peps.forEach(pep => {
      pep.classList.remove("opacity-0");
      pep.classList.add("animate-topping");
    });

    // Desloca um tiquinho fixo
    sliceGroup.style.transform = `translate(${dx/3}px, ${dy/3}px)`;
  } else {
    // Volta ao cru/vazio
    slicePath.classList.remove("animate-cook");
    slicePath.setAttribute("fill", "#FDF2E9");
    slicePath.setAttribute("stroke", "#E2E8F0");
    slicePath.setAttribute("stroke-width", "3");

    // Esconde calabresa
    toppingsGroup.classList.remove("opacity-100");
    toppingsGroup.classList.add("opacity-0");

    const peps = toppingsGroup.querySelectorAll(".pepperoni-item");
    peps.forEach(pep => {
      pep.classList.remove("animate-topping");
      pep.classList.add("opacity-0");
    });

    // Volta para a tábua
    sliceGroup.style.transform = "translate(0px, 0px)";
  }

  updateFractionDisplay();
}

// Limpar fatias
function clearSlices() {
  playSound('click');
  const data = ROUNDS[currentRound];
  selectedSlices = Array(data.denominator).fill(false);
  
  const groups = document.querySelectorAll(".slice-group");
  groups.forEach(group => {
    const path = group.querySelector(".slice-path");
    const toppings = group.querySelector(".toppings");
    path.classList.remove("animate-cook");
    path.setAttribute("fill", "#FDF2E9");
    path.setAttribute("stroke", "#E2E8F0");
    path.setAttribute("stroke-width", "3");
    toppings.classList.remove("opacity-100");
    toppings.classList.add("opacity-0");

    const peps = toppings.querySelectorAll(".pepperoni-item");
    peps.forEach(pep => {
      pep.classList.remove("animate-topping");
      pep.classList.add("opacity-0");
    });

    group.style.transform = "translate(0px, 0px)";
  });
  
  updateFractionDisplay();
}

// Atualizar os números indicadores na interface
function updateFractionDisplay() {
  const data = ROUNDS[currentRound];
  const count = selectedSlices.filter(Boolean).length;
  
  document.getElementById('fraction-numerator').innerText = count;
  document.getElementById('fraction-denominator').innerText = data.denominator;
}

// --- VERIFICAR RESPOSTA / ENTREGAR ---
function submitOrder() {
  const data = ROUNDS[currentRound];
  const selectedCount = selectedSlices.filter(Boolean).length;
  
  const gameBox = document.getElementById('screen-game');
  
  // Validação
  if (selectedCount === data.numerator) {
    // ACERTOU!
    playSound('success');
    spawnConfetti();
    
    score += 100; // 100 pontos por acerto
    document.getElementById('score-text').innerText = `${score} Pontos`;
    
    currentRound++;
    
    // Bloquear entrega temporária para ver animação
    if (currentRound < ROUNDS.length) {
      setTimeout(() => {
        loadRound();
      }, 1000);
    } else {
      // Fim do Jogo -> Vitória
      setTimeout(() => {
        showVictoryScreen();
      }, 1200);
    }
  } else {
    // ERROU!
    playSound('error');
    errorsCount++;
    
    // Efeito de shake (tremor) na tela de jogo
    if (gameBox) {
      gameBox.classList.add('animate-shake');
      setTimeout(() => {
        gameBox.classList.remove('animate-shake');
      }, 400);
    }

    // Exibir Dica Pedagógica e REVELAR o painel de fração como feedback de correção
    document.getElementById('fraction-container').classList.remove('hidden');

    const hintBox = document.getElementById('hint-box');
    const hintText = document.getElementById('hint-text');
    
    if (hintText) {
      hintText.innerHTML = `${data.hint} <br><span class="font-black text-brandRed">Você colocou ${selectedCount}/${data.denominator} na tábua.</span> Tente ajustar as fatias!`;
    }
    if (hintBox) {
      hintBox.classList.remove('hidden');
    }
  }
}

// --- TELA FINAL (VITÓRIA) ---
function showVictoryScreen() {
  // Configurar Barra em 100%
  document.getElementById('progress-bar').style.width = `100%`;
  
  playSound('complete');
  document.getElementById('screen-game').classList.add('hidden');
  document.getElementById('screen-victory').classList.remove('hidden');
  
  // Estatísticas
  document.getElementById('victory-errors').innerText = errorsCount;
  document.getElementById('victory-score').innerText = score;
  
  // Rank de acordo com erros
  let rankText = "Chef Ouro 🏆";
  let starColors = ["text-brandYellow", "text-brandYellow", "text-brandYellow"]; // 3 estrelas douradas
  
  if (errorsCount >= 4) {
    rankText = "Chef Bronze 🥉";
    starColors = ["text-brandYellow", "text-slate-300", "text-slate-300"];
  } else if (errorsCount >= 2) {
    rankText = "Chef Prata 🥈";
    starColors = ["text-brandYellow", "text-brandYellow", "text-slate-300"];
  }
  
  document.getElementById('victory-rank').innerText = rankText;
  
  // Pintar estrelas de ouro
  document.getElementById('star-1').className = `w-10 h-10 ${starColors[0]} fill-current animate-pop`;
  document.getElementById('star-2').className = `w-12 h-12 ${starColors[1]} fill-current -translate-y-2 animate-pop`;
  document.getElementById('star-3').className = `w-10 h-10 ${starColors[2]} fill-current animate-pop`;
}

// Reiniciar
function resetGame() {
  playSound('click');
  score = 0;
  errorsCount = 0;
  currentRound = 0;
  
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

// Inicializar ícones Lucide
if (window.lucide) {
  lucide.createIcons();
}

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
