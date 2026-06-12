const ERA_QUESTIONS = [
    // Era 1 - Pré-Colonial
    [
        { q: "Qual povo habitava o Brasil antes da chegada dos portugueses?", opts: ["Astecas", "Tupinambás e outros povos indígenas", "Maias", "Incas"], correct: 1 },
        { q: "O que significa o termo indígena 'Pindorama'?", opts: ["Terra das Palmeiras", "Terra do Ouro", "Mar Sem Fim", "Floresta Escura"], correct: 0 },
        { q: "Quais eram as principais atividades dos povos pré-coloniais?", opts: ["Comércio de navios", "Caça, pesca e agricultura de subsistência", "Mineração de diamantes", "Metalurgia industrial"], correct: 1 },
        { q: "Que tipo de preservação cultural tinham os povos nativos?", opts: ["Livros encadernados", "Tradição oral e pinturas pictográficas", "Inscrições em placas de bronze", "Registros digitais"], correct: 1 }
    ],
    // Era 2 - Colonial
    [
        { q: "Em que ano a frota de Pedro Álvares Cabral aportou no Brasil?", opts: ["1492", "1500", "1530", "1620"], correct: 1 },
        { q: "Qual foi o primeiro produto explorado economicamente pelos portugueses?", opts: ["Café", "Pau-brasil", "Ouro", "Borracha"], correct: 1 },
        { q: "Como se chamavam as faixas de terras distribuídas para colonizar?", opts: ["Capitanias Hereditárias", "Sesmarias Privadas", "Províncias Federais", "Zonas Francas"], correct: 0 },
        { q: "De onde vinham a maioria dos escravizados no período colonial?", opts: ["Ásia Oriental", "Europa do Sul", "África", "América Central"], correct: 2 }
    ],
    // Era 3 - Império
    [
        { q: "Quem proclamou a Independência do Brasil em 7 de setembro de 1822?", opts: ["Dom João VI", "Dom Pedro I", "Dom Pedro II", "Tiradentes"], correct: 1 },
        { q: "Qual produto agrícola liderou a economia do Brasil Império?", opts: ["Café", "Açúcar de cana", "Algodão", "Trigo"], correct: 0 },
        { q: "O que declarava a Lei Áurea, assinada pela Princesa Isabel em 1888?", opts: ["A Proclamação da República", "A Abolição da escravidão", "A Independência nacional", "O Voto feminino"], correct: 1 },
        { q: "Quem foi o mártir Tiradentes, executado no período anterior ao Império?", opts: ["Líder da Inconfidência Mineira", "Imperador coroado", "General da Marinha", "Governador Geral"], correct: 0 }
    ],
    // Era 4 - República
    [
        { q: "Em que dia e ano foi proclamada a República do Brasil?", opts: ["7 de Setembro de 1822", "15 de Novembro de 1889", "13 de Maio de 1888", "21 de Abril de 1960"], correct: 1 },
        { q: "Qual presidente é conhecido por impulsionar as indústrias de base?", opts: ["Deodoro da Fonseca", "Getúlio Vargas", "Juscelino Kubitschek", "Prudente de Morais"], correct: 1 },
        { q: "Qual cidade do centro-oeste tornou-se a nova capital federal em 1960?", opts: ["Rio de Janeiro", "São Paulo", "Brasília", "Salvador"], correct: 2 },
        { q: "O que representou a Semana de Arte Moderna de 1922?", opts: ["Uma revolta militar", "Revolução cultural, artística e modernista", "Fim da ditadura", "Abertura dos portos"], correct: 1 }
    ]
];

class QuizManager {
    constructor() {
        this.activeQuiz = null;
        this.quizTimer = 30;
        this.quizTimerStart = 0;
        this.selectedOption = -1;
        this.showFeedbackTimer = 0;
        this.feedbackCorrect = false;
    }

    open(eraIndex) {
        const pool = ERA_QUESTIONS[eraIndex];
        this.activeQuiz = pool[Math.floor(Math.random() * pool.length)];
        this.quizTimer = 30;
        this.quizTimerStart = Date.now();
        this.selectedOption = -1;
        this.showFeedbackTimer = 0;
        this.feedbackCorrect = false;
    }

    update(onCompleteFeedback) {
        if (this.showFeedbackTimer > 0) {
            this.showFeedbackTimer--;
            if (this.showFeedbackTimer === 0) {
                if (onCompleteFeedback) onCompleteFeedback(this.feedbackCorrect);
            }
        } else {
            const elapsed = (Date.now() - this.quizTimerStart) / 1000;
            this.quizTimer = Math.max(0, 30 - elapsed);
            if (this.quizTimer <= 0) {
                this.checkAnswer(-1); // Timeout
            }
        }
    }

    checkAnswer(optIndex) {
        if (this.showFeedbackTimer > 0) return;
        this.selectedOption = optIndex;
        this.showFeedbackTimer = 90; // 1.5 seconds feedback

        if (optIndex === this.activeQuiz.correct) {
            this.feedbackCorrect = true;
            if (window.gameInstance && window.gameInstance.audioManager) {
                window.gameInstance.audioManager.play('correct');
            }
        } else {
            this.feedbackCorrect = false;
            if (window.gameInstance && window.gameInstance.audioManager) {
                window.gameInstance.audioManager.play('wrong');
            }
        }
    }

    getLayout(canvas) {
        const centerX = canvas.width / 2;
        const isPortrait = canvas.height > canvas.width;
        
        let cardX = 80;
        let cardY = 40;
        let cardW = 640;
        let cardH = 370;
        
        if (isPortrait) {
            cardX = 20;
            cardY = 50;
            cardW = canvas.width - 40;
            cardH = canvas.height - 100;
        }
        
        const optCoords = [];
        
        if (isPortrait) {
            // Stack vertically
            const btnW = cardW - 40;
            const btnH = 50;
            const startY = cardY + 200;
            const gap = 12;
            
            for (let i = 0; i < 4; i++) {
                optCoords.push({
                    x: cardX + 20,
                    y: startY + i * (btnH + gap),
                    w: btnW,
                    h: btnH
                });
            }
        } else {
            // 2x2 grid
            const btnW = 270;
            const btnH = 60;
            optCoords.push(
                { x: centerX - btnW - 15, y: cardY + 140, w: btnW, h: btnH },
                { x: centerX + 15, y: cardY + 140, w: btnW, h: btnH },
                { x: centerX - btnW - 15, y: cardY + 220, w: btnW, h: btnH },
                { x: centerX + 15, y: cardY + 220, w: btnW, h: btnH }
            );
        }
        
        return {
            card: { x: cardX, y: cardY, w: cardW, h: cardH },
            options: optCoords
        };
    }

    wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let currentY = y;
        
        for (let n = 0; n < words.length; n++) {
            let testLine = line + words[n] + ' ';
            let metrics = ctx.measureText(testLine);
            let testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, x, currentY);
                line = words[n] + ' ';
                currentY += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, currentY);
        return currentY;
    }

    draw(ctx, canvas, era) {
        ctx.fillStyle = 'rgba(5, 7, 15, 0.92)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const centerX = canvas.width / 2;
        const eraAccent = era.accent;
        const layout = this.getLayout(canvas);

        drawRoundRect(ctx, layout.card.x, layout.card.y, layout.card.w, layout.card.h, 16, '#0f172a', eraAccent);

        ctx.fillStyle = eraAccent;
        ctx.font = 'bold 14px Nunito';
        ctx.textAlign = 'center';
        ctx.fillText(`PORTAL DO TEMPO ATIVO: QUESTÃO DA ERA`, centerX, layout.card.y + 30);

        // Question text (wrapped)
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Nunito';
        const qMaxW = layout.card.w - 40;
        const finalQY = this.wrapText(ctx, this.activeQuiz.q, centerX, layout.card.y + 65, qMaxW, 22);

        // Timer bar
        const timerY = finalQY + 20;
        const timerPct = this.quizTimer / 30;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(layout.card.x + 20, timerY, layout.card.w - 40, 10);
        ctx.fillStyle = timerPct > 0.3 ? '#10b981' : '#ef4444';
        ctx.fillRect(layout.card.x + 20, timerY, (layout.card.w - 40) * timerPct, 10);

        // Answer options
        this.activeQuiz.opts.forEach((opt, idx) => {
            const coord = layout.options[idx];
            let bgBtn = '#1e293b';
            let strokeBtn = '#334155';
            let textBtnColor = '#fff';

            if (this.showFeedbackTimer > 0) {
                if (idx === this.activeQuiz.correct) {
                    bgBtn = '#065f46';
                    strokeBtn = '#10b981';
                } else if (idx === this.selectedOption) {
                    bgBtn = '#7f1d1d';
                    strokeBtn = '#ef4444';
                } else {
                    bgBtn = '#0f172a';
                    strokeBtn = '#1e293b';
                    textBtnColor = '#64748b';
                }
            } else if (this.selectedOption === idx) {
                bgBtn = '#3b82f6';
                strokeBtn = '#60a5fa';
            }

            drawRoundRect(ctx, coord.x, coord.y, coord.w, coord.h, 8, bgBtn, strokeBtn);

            ctx.fillStyle = textBtnColor;
            ctx.font = 'bold 13px Nunito';
            ctx.textAlign = 'center';
            
            // Wrap option text if too long
            const optMaxW = coord.w - 20;
            ctx.save();
            ctx.beginPath();
            ctx.rect(coord.x + 5, coord.y + 2, coord.w - 10, coord.h - 4);
            ctx.clip();
            if (ctx.measureText(opt).width > optMaxW) {
                this.wrapText(ctx, opt, coord.x + coord.w/2, coord.y + 18, optMaxW, 16);
            } else {
                ctx.fillText(opt, coord.x + coord.w/2, coord.y + coord.h/2 + 5);
            }
            ctx.restore();
        });

        // Feedback Message
        const feedY = layout.card.y + layout.card.h - 35;
        ctx.font = 'bold 14px Nunito';
        ctx.textAlign = 'center';
        if (this.showFeedbackTimer > 0) {
            ctx.fillStyle = this.feedbackCorrect ? '#34d399' : '#f87171';
            const feedMsg = this.feedbackCorrect ? '✓ RESPOSTA CORRETA! Viajando no tempo... ⏳' : '✗ RESPOSTA INCORRETA! Portal descarregado, -1 Coração! Pegue os pergaminhos de novo.';
            if (canvas.width < 500) {
                ctx.fillText(this.feedbackCorrect ? '✓ CORRETO!' : '✗ INCORRETO!', centerX, feedY - 12);
                ctx.font = '11px Nunito';
                ctx.fillText(this.feedbackCorrect ? 'Viajando no tempo...' : '-1 ❤️ | Colete documentos.', centerX, feedY + 5);
            } else {
                ctx.fillText(feedMsg, centerX, feedY);
            }
        } else {
            ctx.fillStyle = '#94a3b8';
            ctx.font = '12px Nunito';
            ctx.fillText('Responda corretamente para ativar o portal temporal e viajar de Era!', centerX, feedY);
        }
    }
}
