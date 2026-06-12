const QUESTIONS = [
    // World 1 - Circulatório (Index 0 to 9)
    { w: 0, q: "Qual é o órgão central do sistema circulatório?", opts: ["Coração", "Pulmão", "Fígado", "Rim"], correct: 0 },
    { w: 0, q: "Quantas câmaras tem o coração humano?", opts: ["Duas (2)", "Três (3)", "Quatro (4)", "Cinco (5)"], correct: 2 },
    { w: 0, q: "Qual o líquido que transporta oxigênio no sangue?", opts: ["Plasma", "Hemoglobina nas hemácias", "Leucócito", "Plaqueta"], correct: 1 },
    { w: 0, q: "O que fazem as artérias principais?", opts: ["Levam sangue ao coração", "Levam sangue DO coração", "Filtram o sangue", "Produzem anticorpos"], correct: 1 },
    { w: 0, q: "O que é um glóbulo branco?", opts: ["Transportador de O2", "Célula de defesa imune", "Célula nutritiva", "Coagulante sanguíneo"], correct: 1 },
    { w: 0, q: "Quantos litros de sangue tem um adulto em média?", opts: ["2 Litros", "5 Litros", "8 Litros", "10 Litros"], correct: 1 },
    { w: 0, q: "Como se chama a maior artéria do corpo?", opts: ["Veia cava", "Aorta", "Artéria femoral", "Artéria jugular"], correct: 1 },
    { w: 0, q: "O que causa anemia ferropriva?", opts: ["Excesso de leucócitos", "Falta de hemoglobina/ferro", "Muitas plaquetas", "Sangue ácido"], correct: 1 },
    { w: 0, q: "Qual a função principal das plaquetas?", opts: ["Células de defesa", "Coagulação sanguínea", "Transporte de gases", "Hormônios"], correct: 1 },
    { w: 0, q: "Qual câmara cardíaca bombeia sangue para o corpo?", opts: ["Átrio direito", "Átrio esquerdo", "Ventrículo direito", "Ventrículo esquerdo"], correct: 3 },

    // World 2 - Digestivo (Index 10 to 19)
    { w: 1, q: "Qual ácido está presente no estômago?", opts: ["Ácido cítrico", "Ácido clorídrico", "Ácido acético", "Ácido sulfúrico"], correct: 1 },
    { w: 1, q: "Onde ocorre a maior parte da absorção de nutrientes?", opts: ["Estômago", "Intestino grosso", "Intestino delgado", "Esôfago"], correct: 2 },
    { w: 1, q: "Qual órgão é responsável por produzir a bile?", opts: ["Pâncreas", "Fígado", "Estômago", "Baço"], correct: 1 },
    { w: 1, q: "O que é o esôfago?", opts: ["Glândula digestiva", "Tubo condutor boca-estômago", "Parte do intestino", "Respirador"], correct: 1 },
    { w: 1, q: "Qual nutriente começa a ser digerido na boca?", opts: ["Proteína", "Gordura", "Carboidrato (Amido)", "Vitamina"], correct: 2 },
    { w: 1, q: "O que é o apêndice cecal?", opts: ["Parte do intestino delgado", "Prolongamento do intestino grosso", "Glândula gástrica", "Canal biliar"], correct: 1 },
    { w: 1, q: "Qual enzima quebra proteínas no estômago?", opts: ["Amilase", "Lipase", "Pepsina", "Bile"], correct: 2 },
    { w: 1, q: "Quantos metros tem o intestino delgado em média?", opts: ["1 metro", "3 metros", "6 metros", "12 metros"], correct: 2 },
    { w: 1, q: "O que é peristaltismo?", opts: ["Troca gasosa", "Movimentos do tubo digestivo", "Filtração renal", "Digestão química"], correct: 1 },
    { w: 1, q: "Qual a função principal do intestino grosso?", opts: ["Absorver nutrientes", "Absorver água e formar fezes", "Produzir bile", "Quebrar gorduras"], correct: 1 },

    // World 3 - Respiratório (Index 20 to 29)
    { w: 2, q: "Qual é o órgão principal do sistema respiratório?", opts: ["Coração", "Traqueia", "Pulmão", "Brônquio"], correct: 2 },
    { w: 2, q: "O que é a traqueia?", opts: ["Músculo de fonação", "Tubo que conduz ar aos brônquios", "Bolsa de oxigênio", "Membrana pulmonar"], correct: 1 },
    { w: 2, q: "Qual o músculo principal que controla a respiração?", opts: ["Diafragma", "Intercostal externo", "Abdominal reto", "Músculo cardíaco"], correct: 0 },
    { w: 2, q: "O que são os alvéolos pulmonares?", opts: ["Tubos de ar", "Pequenas bolsas de troca gasosa", "Filtros de impurezas", "Glândulas de muco"], correct: 1 },
    { w: 2, q: "Quantas vezes respira um adulto saudável em repouso por min?", opts: ["5 vezes", "12 a 20 vezes", "35 vezes", "50 vezes"], correct: 1 },
    { w: 2, q: "O que o corpo absorve do ar ao inspirar?", opts: ["Nitrogênio", "Gás Carbônico (CO2)", "Oxigênio (O2)", "Argônio"], correct: 2 },
    { w: 2, q: "O que são os brônquios?", opts: ["Bolsas alveolares", "Ramificações da traqueia", "Músculos pleurais", "Cílios nasais"], correct: 1 },
    { w: 2, q: "O que é a pleura?", opts: ["Músculo do pulmão", "Membrana dupla que envolve o pulmão", "Ramificação brônquica", "Filtro nasal"], correct: 1 },
    { w: 2, q: "O que caracteriza a asma?", opts: ["Infecção bacteriana", "Inflamação e estreitamento das vias", "Falta de hemoglobina", "Paralisia do diafragma"], correct: 1 },
    { w: 2, q: "O que a tosse realiza no sistema respiratório?", opts: ["Limpa vias aéreas de impurezas", "Aumenta a absorção de O2", "Elimina apenas oxigênio", "Refria o pulmão"], correct: 0 }
];

class QuizManager {
    constructor() {
        this.activeQuiz = null;
        this.quizTimer = 15;
        this.quizTimerStart = 0;
        this.selectedOption = -1;
        this.showFeedbackTimer = 0;
        this.feedbackCorrect = false;
        this.activeBlock = null;
        this.activeBlockIndex = -1;
    }

    open(block, idx) {
        this.activeBlock = block;
        this.activeBlockIndex = idx;
        this.activeQuiz = QUESTIONS[block.questionIndex];
        this.quizTimer = 15;
        this.quizTimerStart = Date.now();
        this.selectedOption = -1;
        this.showFeedbackTimer = 0;
        this.feedbackCorrect = false;
    }

    update(onCompleteFeedback) {
        if (this.showFeedbackTimer > 0) {
            this.showFeedbackTimer--;
            if (this.showFeedbackTimer === 0) {
                if (onCompleteFeedback) {
                    onCompleteFeedback(this.feedbackCorrect, this.activeBlock, this.activeBlockIndex);
                }
            }
        } else {
            const elapsed = (Date.now() - this.quizTimerStart) / 1000;
            this.quizTimer = Math.max(0, 15 - elapsed);
            if (this.quizTimer <= 0) {
                this.checkAnswer(-1); // Timeout
            }
        }
    }

    checkAnswer(optIndex) {
        if (this.showFeedbackTimer > 0) return;
        this.selectedOption = optIndex;
        this.showFeedbackTimer = 90;

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

    draw(ctx, canvas, worldTheme) {
        ctx.fillStyle = 'rgba(5, 7, 15, 0.9)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const centerX = canvas.width / 2;
        const cardThemeColor = worldTheme.accent;
        const layout = this.getLayout(canvas);

        drawRoundRect(ctx, layout.card.x, layout.card.y, layout.card.w, layout.card.h, 16, '#0f172a', cardThemeColor);

        ctx.fillStyle = cardThemeColor;
        ctx.font = 'bold 14px Nunito';
        ctx.textAlign = 'center';
        ctx.fillText(`DESAFIO CELULAR: ${worldTheme.name.toUpperCase()}`, centerX, layout.card.y + 30);

        // Question Text (wrapped)
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Nunito';
        const qMaxW = layout.card.w - 40;
        const finalQY = this.wrapText(ctx, this.activeQuiz.q, centerX, layout.card.y + 65, qMaxW, 22);

        // Timer bar
        const timerY = finalQY + 20;
        const timerPct = this.quizTimer / 15;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(layout.card.x + 20, timerY, layout.card.w - 40, 10);
        ctx.fillStyle = timerPct > 0.3 ? '#10b981' : '#f43f5e';
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
            const feedMsg = this.feedbackCorrect ? '✓ RESPOSTA CORRETA! +150 PTS +ESCUDO 🛡️' : '✗ RESPOSTA INCORRETA! ESCUDO DESFEITO OU -1 CORAÇÃO';
            if (canvas.width < 500) {
                ctx.fillText(this.feedbackCorrect ? '✓ CORRETO!' : '✗ INCORRETO!', centerX, feedY - 12);
                ctx.font = '11px Nunito';
                ctx.fillText(this.feedbackCorrect ? '+150 Pts + 🛡️' : '-1 ❤️ ou 🛡️ desfeito', centerX, feedY + 5);
            } else {
                ctx.fillText(feedMsg, centerX, feedY);
            }
        } else {
            ctx.fillStyle = '#94a3b8';
            ctx.font = '12px Nunito';
            ctx.fillText('Clique ou toque no retângulo correto para responder!', centerX, feedY);
        }
    }
}
