class UIManager {
    constructor(canvas) {
        this.canvas = canvas;
    }

    getButtonRects() {
        const centerX = this.canvas.width / 2;
        
        const playWidth = 200;
        const playHeight = 55;
        const playX = centerX - playWidth / 2;
        const playY = this.canvas.height * 0.55;

        const hubWidth = 200;
        const hubHeight = 45;
        const hubX = centerX - hubWidth / 2;
        const hubY = this.canvas.height * 0.65;
        
        return {
            play: { x: playX, y: playY, w: playWidth, h: playHeight },
            hub: { x: hubX, y: hubY, w: hubWidth, h: hubHeight }
        };
    }

    getEndScreenRects() {
        const centerX = this.canvas.width / 2;
        const isPortrait = this.canvas.height > this.canvas.width;
        
        const btnW = 160;
        const btnH = 50;
        
        let restartX, restartY, hubX, hubY;
        
        if (isPortrait) {
            restartX = centerX - btnW / 2;
            restartY = this.canvas.height * 0.6;
            hubX = centerX - btnW / 2;
            hubY = this.canvas.height * 0.7;
        } else {
            restartX = centerX - btnW - 20;
            restartY = this.canvas.height * 0.68;
            hubX = centerX + 20;
            hubY = this.canvas.height * 0.68;
        }
        
        return {
            restart: { x: restartX, y: restartY, w: btnW, h: btnH },
            hub: { x: hubX, y: hubY, w: btnW, h: btnH }
        };
    }

    drawMenu(ctx, score, isMobile, touchControls) {
        const centerX = this.canvas.width / 2;
        const rects = this.getButtonRects();
        
        ctx.fillStyle = '#fff';
        const titleSize = Math.min(46, this.canvas.width * 0.09);
        ctx.font = `black ${titleSize}px Nunito`;
        ctx.textAlign = 'center';
        ctx.fillText('HistóriaCorrida 🧭', centerX, this.canvas.height * 0.2);

        ctx.fillStyle = '#94a3b8';
        const subSize = Math.min(19, this.canvas.width * 0.045);
        ctx.font = `700 ${subSize}px Nunito`;
        const subText = 'Fuga pelo Tempo - O Brasil Através das Eras';
        if (this.canvas.width < 500) {
            ctx.fillText('Fuga pelo Tempo', centerX, this.canvas.height * 0.28);
            ctx.fillText('O Brasil Através das Eras', centerX, this.canvas.height * 0.33);
        } else {
            ctx.fillText(subText, centerX, this.canvas.height * 0.28);
        }

        ctx.fillStyle = '#fda4af';
        const dedSize = Math.min(15, this.canvas.width * 0.035);
        ctx.font = `bold ${dedSize}px Nunito`;
        const dedY = this.canvas.width < 500 ? this.canvas.height * 0.42 : this.canvas.height * 0.35;
        ctx.fillText('GamesForVitória 💖 Para a Professora Vitória com Amor', centerX, dedY);

        // Play button card
        drawRoundRect(ctx, rects.play.x, rects.play.y, rects.play.w, rects.play.h, 12, '#10b981', '#059669');
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px Nunito';
        ctx.fillText('JOGAR', centerX, rects.play.y + 35);

        // Back to Hub
        drawRoundRect(ctx, rects.hub.x, rects.hub.y, rects.hub.w, rects.hub.h, 10, '#334155', '#1e293b');
        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 16px Nunito';
        ctx.fillText('Voltar ao Hub', centerX, rects.hub.y + 28);

        ctx.fillStyle = '#64748b';
        const instSize = Math.min(14, this.canvas.width * 0.035);
        ctx.font = `${instSize}px Nunito`;
        const instText = 'A/D ou Setas para andar | W ou Espaço para saltar duplo. Colete os 3 pergaminhos para abrir o portal!';
        if (this.canvas.width < 600) {
            ctx.fillText('A/D/Setas: andar | W/Espaço: saltar', centerX, this.canvas.height * 0.82);
            ctx.fillText('Colete 3 documentos para abrir o portal!', centerX, this.canvas.height * 0.88);
        } else {
            ctx.fillText(instText, centerX, this.canvas.height * 0.88);
        }
    }

    drawHUD(ctx, lives, score, scrollsCollected, currentEra, ERAS) {
        const isSmall = this.canvas.width < 600;
        const hudHeight = isSmall ? 70 : 42;
        
        // Stats bar container
        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        drawRoundRect(ctx, 10, 10, this.canvas.width - 20, hudHeight, 8, 'rgba(15,23,42,0.75)', 'rgba(30,41,59,0.5)');

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Nunito';
        
        let heartsStr = '';
        for (let i = 0; i < 3; i++) {
            heartsStr += i < lives ? '❤️' : '🖤';
        }

        if (isSmall) {
            // Row 1
            ctx.textAlign = 'left';
            ctx.fillText(`HP: ${heartsStr}`, 25, 32);
            
            ctx.textAlign = 'right';
            ctx.fillStyle = '#f59e0b';
            ctx.fillText(`Pontos: ${score}`, this.canvas.width - 25, 32);
            
            // Row 2
            ctx.textAlign = 'left';
            ctx.fillStyle = '#fff';
            ctx.fillText(`${ERAS[currentEra].name}`, 25, 62);
            
            ctx.textAlign = 'right';
            ctx.fillStyle = '#fbbf24';
            ctx.fillText(`Docs: 📜 ${scrollsCollected}/3`, this.canvas.width - 25, 62);
        } else {
            // Landscape layout
            ctx.textAlign = 'left';
            ctx.fillText(`HP: ${heartsStr}`, 25, 36);

            ctx.fillStyle = '#fbbf24';
            ctx.fillText(`Documentos: 📜 ${scrollsCollected}/3`, 160, 36);

            ctx.textAlign = 'right';
            ctx.fillStyle = '#fff';
            ctx.fillText(`${ERAS[currentEra].name} (${ERAS[currentEra].period})`, this.canvas.width - 160, 36);

            ctx.fillStyle = '#f59e0b';
            ctx.fillText(`Pontos: ${score}`, this.canvas.width - 25, 36);
        }
    }

    drawMobileControls(ctx, touchControls) {
        ctx.save();
        ctx.globalAlpha = 0.55;
        
        const btnY = this.canvas.height - 70;
        const leftX = 60;
        const rightX = 150;
        const jumpX = this.canvas.width - 70;
        
        // Left Button (Circle with Arrow)
        const leftActive = touchControls.left;
        ctx.fillStyle = leftActive ? '#3b82f6' : '#1e293b';
        ctx.strokeStyle = leftActive ? '#60a5fa' : '#475569';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(leftX, btnY, 36, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 26px Nunito';
        ctx.textAlign = 'center';
        ctx.fillText('◀', leftX, btnY + 9);

        // Right Button (Circle with Arrow)
        const rightActive = touchControls.right;
        ctx.fillStyle = rightActive ? '#3b82f6' : '#1e293b';
        ctx.strokeStyle = rightActive ? '#60a5fa' : '#475569';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(rightX, btnY, 36, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        ctx.fillStyle = '#fff';
        ctx.fillText('▶', rightX, btnY + 9);

        // Jump Button (Green circle with text)
        const jumpActive = touchControls.jump;
        ctx.fillStyle = jumpActive ? '#10b981' : '#064e3b';
        ctx.strokeStyle = jumpActive ? '#34d399' : '#047857';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(jumpX, btnY, 42, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Nunito';
        ctx.fillText('SALTAR', jumpX, btnY + 4);

        ctx.restore();
    }

    drawGameOver(ctx, score) {
        ctx.fillStyle = 'rgba(5, 7, 15, 0.95)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const centerX = this.canvas.width / 2;
        const rects = this.getEndScreenRects();

        ctx.fillStyle = '#ef4444';
        const titleSize = Math.min(44, this.canvas.width * 0.08);
        ctx.font = `black ${titleSize}px Nunito`;
        ctx.textAlign = 'center';
        if (this.canvas.width < 500) {
            ctx.fillText('SEM VIDAS OU', centerX, this.canvas.height * 0.25);
            ctx.fillText('TEMPO ESGOTADO', centerX, this.canvas.height * 0.32);
        } else {
            ctx.fillText('TEMPO ESGOTADO OU SEM VIDAS', centerX, this.canvas.height * 0.3);
        }

        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 18px Nunito';
        ctx.fillText(`Sua Pontuação de História: ${score} pontos`, centerX, this.canvas.height * 0.42);

        ctx.fillStyle = '#fda4af';
        ctx.font = '14px Nunito';
        const msgY = this.canvas.height * 0.5;
        if (this.canvas.width < 600) {
            ctx.fillText('Revise a matéria e tente de novo!', centerX, msgY);
        } else {
            ctx.fillText('A Prô Vitória incentiva você a revisar a matéria de história e tentar de novo!', centerX, msgY);
        }

        // Restart Button
        drawRoundRect(ctx, rects.restart.x, rects.restart.y, rects.restart.w, rects.restart.h, 8, '#ef4444', '#b91c1c');
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Nunito';
        ctx.fillText('REINICIAR', rects.restart.x + rects.restart.w/2, rects.restart.y + 32);

        // Hub Button
        drawRoundRect(ctx, rects.hub.x, rects.hub.y, rects.hub.w, rects.hub.h, 8, '#334155', '#1e293b');
        ctx.fillStyle = '#fff';
        ctx.fillText('VOLTAR AO HUB', rects.hub.x + rects.hub.w/2, rects.hub.y + 32);
    }

    drawVictory(ctx, score) {
        ctx.fillStyle = 'rgba(5, 7, 15, 0.95)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const centerX = this.canvas.width / 2;
        const rects = this.getEndScreenRects();

        // Confetti in yellow and green (Brazilian theme)
        for (let i = 0; i < 24; i++) {
            const cx = (i * 37 + Date.now()/12) % this.canvas.width;
            const cy = (i * 29 + Date.now()/10) % this.canvas.height;
            ctx.fillStyle = i % 2 === 0 ? '#22c55e' : '#eab308';
            ctx.fillRect(cx, cy, 7, 7);
        }

        ctx.fillStyle = '#22c55e';
        const titleSize = Math.min(40, this.canvas.width * 0.075);
        ctx.font = `black ${titleSize}px Nunito`;
        ctx.textAlign = 'center';
        if (this.canvas.width < 500) {
            ctx.fillText('EXPLORADOR', centerX, this.canvas.height * 0.2);
            ctx.fillText('HISTÓRICO MÁXIMO! 🏆', centerX, this.canvas.height * 0.28);
        } else {
            ctx.fillText('EXPLORADOR HISTÓRICO MÁXIMO! 🏆🎉', centerX, this.canvas.height * 0.25);
        }

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px Nunito';
        const victorySubY = this.canvas.height * 0.38;
        if (this.canvas.width < 600) {
            ctx.fillText('Parabéns! Você completou a Linha do Tempo!', centerX, victorySubY);
        } else {
            ctx.fillText('Parabéns! Você completou com sucesso a Linha do Tempo do Brasil!', centerX, victorySubY);
        }
        
        ctx.fillStyle = '#fbbf24';
        ctx.fillText(`Pontuação Final: ${score} pontos históricos!`, centerX, this.canvas.height * 0.44);

        ctx.fillStyle = '#fda4af';
        ctx.font = '14px Nunito';
        ctx.fillText('GamesForVitória 💖 Criado com carinho pedagógico para a Prô Vitória.', centerX, this.canvas.height * 0.51);

        // Play again Button
        drawRoundRect(ctx, rects.restart.x, rects.restart.y, rects.restart.w, rects.restart.h, 8, '#10b981', '#047857');
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Nunito';
        ctx.fillText('JOGAR DE NOVO', rects.restart.x + rects.restart.w/2, rects.restart.y + 32);

        // Hub Button
        drawRoundRect(ctx, rects.hub.x, rects.hub.y, rects.hub.w, rects.hub.h, 8, '#334155', '#1e293b');
        ctx.fillStyle = '#fff';
        ctx.fillText('VOLTAR AO HUB', rects.hub.x + rects.hub.w/2, rects.hub.y + 32);
    }
}
