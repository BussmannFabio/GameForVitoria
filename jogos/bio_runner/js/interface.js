class UIManager {
    constructor(canvas) {
        this.canvas = canvas;
    }

    getButtonRects() {
        const centerX = this.canvas.width / 2;
        
        const playWidth = 200;
        const playHeight = 50;
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

    drawMenu(ctx) {
        const centerX = this.canvas.width / 2;
        const rects = this.getButtonRects();
        
        // Main title
        ctx.fillStyle = '#fff';
        const titleSize = Math.min(48, this.canvas.width * 0.095);
        ctx.font = `black ${titleSize}px Nunito`;
        ctx.textAlign = 'center';
        ctx.fillText('BioRunner 🔵', centerX, this.canvas.height * 0.2);

        // Subtitle
        ctx.fillStyle = '#94a3b8';
        const subSize = Math.min(20, this.canvas.width * 0.045);
        ctx.font = `700 ${subSize}px Nunito`;
        ctx.fillText('Jornada pelo Corpo Humano', centerX, this.canvas.height * 0.28);

        // Dedication info
        ctx.fillStyle = '#fda4af';
        const dedSize = Math.min(15, this.canvas.width * 0.035);
        ctx.font = `bold ${dedSize}px Nunito`;
        const dedY = this.canvas.width < 500 ? this.canvas.height * 0.42 : this.canvas.height * 0.35;
        ctx.fillText('GamesForVitória 💖 Para a Prô Vitória com Amor', centerX, dedY);

        // Play button card
        drawRoundRect(ctx, rects.play.x, rects.play.y, rects.play.w, rects.play.h, 10, '#10b981', '#059669');
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px Nunito';
        ctx.fillText('JOGAR', centerX, rects.play.y + 32);

        // Voltar ao Hub button
        drawRoundRect(ctx, rects.hub.x, rects.hub.y, rects.hub.w, rects.hub.h, 10, '#334155', '#1e293b');
        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 16px Nunito';
        ctx.fillText('Voltar ao Hub', centerX, rects.hub.y + 28);

        // Instructions details
        ctx.fillStyle = '#64748b';
        const instSize = Math.min(14, this.canvas.width * 0.035);
        ctx.font = `${instSize}px Nunito`;
        
        const instText = 'Teclas A/D ou Setas para andar | W ou Espaço para pular (Pulo duplo suportado)';
        if (this.canvas.width < 600) {
            ctx.fillText('A/D/Setas: andar | W/Espaço: saltar', centerX, this.canvas.height * 0.82);
            ctx.fillText('Pulo duplo suportado!', centerX, this.canvas.height * 0.88);
        } else {
            ctx.fillText(instText, centerX, this.canvas.height * 0.88);
        }
    }

    drawHUD(ctx, lives, score, currentLevel, activeShield, currentWorld, WORLDS) {
        const isSmall = this.canvas.width < 600;
        const hudHeight = isSmall ? 70 : 40;
        
        ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
        drawRoundRect(ctx, 10, 10, this.canvas.width - 20, hudHeight, 8, 'rgba(15,23,42,0.7)', 'rgba(30,41,59,0.5)');

        let heartsStr = '';
        for (let i = 0; i < 3; i++) {
            heartsStr += i < lives ? '❤️' : '🖤';
        }

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Nunito';

        if (isSmall) {
            // Row 1: Lives & Score
            ctx.textAlign = 'left';
            ctx.fillText(`Vidas: ${heartsStr}`, 25, 31);
            
            ctx.textAlign = 'right';
            ctx.fillStyle = '#f59e0b';
            ctx.fillText(`Pontos: ${score}`, this.canvas.width - 25, 31);
            
            // Row 2: World/Level & Shield
            ctx.textAlign = 'left';
            ctx.fillStyle = '#e2e8f0';
            ctx.fillText(`Fase ${currentLevel}/2`, 25, 60);
            
            if (activeShield) {
                ctx.textAlign = 'right';
                ctx.fillStyle = '#38bdf8';
                ctx.fillText('🛡️ Escudo', this.canvas.width - 25, 60);
            } else {
                ctx.textAlign = 'right';
                ctx.fillStyle = '#64748b';
                ctx.fillText(WORLDS[currentWorld].name, this.canvas.width - 25, 60);
            }
        } else {
            ctx.textAlign = 'left';
            ctx.fillText(`Vidas: ${heartsStr}`, 25, 34);

            if (activeShield) {
                ctx.fillStyle = '#38bdf8';
                ctx.fillText('🛡️ Escudo Ativo', 180, 34);
            } else {
                ctx.fillStyle = '#64748b';
                ctx.fillText(WORLDS[currentWorld].name, 180, 34);
            }

            ctx.textAlign = 'right';
            ctx.fillStyle = '#e2e8f0';
            ctx.fillText(`Fase: ${currentLevel}/2`, this.canvas.width - 160, 34);

            ctx.fillStyle = '#f59e0b';
            ctx.fillText(`Pontos: ${score}`, this.canvas.width - 25, 34);
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
        ctx.fillText('PULAR', jumpX, btnY + 4);

        ctx.restore();
    }

    drawGameOver(ctx, score) {
        ctx.fillStyle = 'rgba(5, 7, 15, 0.95)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const centerX = this.canvas.width / 2;
        const rects = this.getEndScreenRects();

        ctx.fillStyle = '#ef4444';
        const titleSize = Math.min(42, this.canvas.width * 0.08);
        ctx.font = `black ${titleSize}px Nunito`;
        ctx.textAlign = 'center';
        ctx.fillText('FIM DE JOGO 💀', centerX, this.canvas.height * 0.28);

        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 18px Nunito';
        ctx.fillText(`Sua Pontuação Final: ${score} pontos`, centerX, this.canvas.height * 0.42);

        ctx.fillStyle = '#fda4af';
        ctx.font = '14px Nunito';
        const msgY = this.canvas.height * 0.5;
        if (this.canvas.width < 600) {
            ctx.fillText('Estude mais e tente novamente!', centerX, msgY);
        } else {
            ctx.fillText('Vitória tem orgulho de você! Estude mais e tente novamente!', centerX, msgY);
        }

        // Restart Button
        drawRoundRect(ctx, rects.restart.x, rects.restart.y, rects.restart.w, rects.restart.h, 8, '#ef4444', '#b91c1c');
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 15px Nunito';
        ctx.fillText('TENTAR DE NOVO', rects.restart.x + rects.restart.w/2, rects.restart.y + 32);

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

        // Confetti simulation
        ctx.fillStyle = `hsl(${Math.floor(Date.now()/5)%360}, 100%, 60%)`;
        for (let i = 0; i < 20; i++) {
            const cx = (i * 43 + Date.now()/10) % this.canvas.width;
            const cy = (i * 27 + Date.now()/8) % this.canvas.height;
            ctx.fillRect(cx, cy, 6, 6);
        }

        ctx.fillStyle = '#10b981';
        const titleSize = Math.min(44, this.canvas.width * 0.08);
        ctx.font = `black ${titleSize}px Nunito`;
        ctx.textAlign = 'center';
        ctx.fillText('VITÓRIA BRILHANTE! 🎉', centerX, this.canvas.height * 0.25);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px Nunito';
        const victorySubY = this.canvas.height * 0.38;
        if (this.canvas.width < 600) {
            ctx.fillText('Jornada pelo corpo humano concluída!', centerX, victorySubY);
        } else {
            ctx.fillText('Você completou toda a jornada pelo corpo humano!', centerX, victorySubY);
        }
        
        ctx.fillStyle = '#f59e0b';
        ctx.fillText(`Pontuação Final: ${score} pontos!`, centerX, this.canvas.height * 0.44);

        ctx.fillStyle = '#fda4af';
        ctx.font = '14px Nunito';
        ctx.fillText('GamesForVitória 💖 Criado especialmente para uma professora incrível!', centerX, this.canvas.height * 0.51);

        // Play again Button
        drawRoundRect(ctx, rects.restart.x, rects.restart.y, rects.restart.w, rects.restart.h, 8, '#10b981', '#047857');
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 15px Nunito';
        ctx.fillText('JOGAR DE NOVO', rects.restart.x + rects.restart.w/2, rects.restart.y + 32);

        // Hub Button
        drawRoundRect(ctx, rects.hub.x, rects.hub.y, rects.hub.w, rects.hub.h, 8, '#334155', '#1e293b');
        ctx.fillStyle = '#fff';
        ctx.fillText('VOLTAR AO HUB', rects.hub.x + rects.hub.w/2, rects.hub.y + 32);
    }
}

// Global drawRoundRect helper (in case needed by UIManager)
function drawRoundRect(ctx, x, y, w, h, radius, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (fill) {
        ctx.fillStyle = fill;
        ctx.fill();
    }
    if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}
