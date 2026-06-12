class Game {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        
        // Physics constants
        this.LEVEL_WIDTH = 3200;
        this.PHYSICS = {
            gravity: 0.54,
            jumpForce: -12.0,
            moveSpeed: 4.4,
            friction: 0.82
        };

        // Managers
        this.audioManager = new AudioManager();
        this.uiManager = new UIManager(canvas);
        this.quizManager = new QuizManager();
        this.inputHandler = new InputHandler(
            canvas,
            () => this.handleJumpPress(),
            (pos) => this.handleInteractionStart(pos),
            this.audioManager
        );

        // Game State
        this.gameState = STATES.MENU;
        this.score = 0;
        this.lives = 3;
        this.scrollsCollected = 0;
        this.gameTime = 0;
        this.camX = 0;
        this.currentEra = 0;

        // Entities
        this.player = new Player(80, 300);
        this.platforms = [];
        this.enemies = [];
        this.scrolls = [];
        this.spikes = [];
        this.npc = new NPC(260, 350, 20, 32, '');
        this.portal = new Portal(3050, 310, 60, 90);
        this.particles = [];

        // Seed parameter
        this.randomVal = 99;

        // Bindings
        this.resizeCanvas = this.resizeCanvas.bind(this);
        this.gameLoop = this.gameLoop.bind(this);

        this.init();
    }

    init() {
        window.addEventListener('resize', this.resizeCanvas);
        window.addEventListener('orientationchange', this.resizeCanvas);
        this.resizeCanvas();
        this.createParticles();
        requestAnimationFrame(this.gameLoop);
    }

    rand() {
        this.randomVal = (this.randomVal * 9301 + 49297) % 233280;
        return this.randomVal / 233280;
    }

    createParticles() {
        this.particles = [];
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: 2 + Math.random() * 5,
                vx: -0.4 - Math.random() * 0.8,
                vy: (Math.random() - 0.5) * 0.3,
                rot: Math.random() * Math.PI,
                rotSpeed: (Math.random() - 0.5) * 0.02
            });
        }
    }

    loadLevel(eraIdx) {
        this.platforms = [];
        this.enemies = [];
        this.scrolls = [];
        this.spikes = [];
        this.scrollsCollected = 0;
        this.portal.active = false;

        const era = ERAS[eraIdx];
        const groundY = this.canvas.height - 60;

        // Base ground
        this.platforms.push(new Platform(0, groundY, 500, 60, 'ground'));

        // Set NPC Guide
        this.npc.x = 240;
        this.npc.y = groundY - 32;
        this.npc.fact = era.npcFact;

        // Simple deterministic LCG random generator based on era
        this.randomVal = eraIdx * 456 + 99;

        // Generate levels chunks
        let nextX = 500;
        while (nextX < 2900) {
            const step = this.rand();
            const gap = 80 + step * 80;
            const platW = 150 + this.rand() * 150;
            const platY = groundY - (30 + Math.floor(this.rand() * 4) * 40); // 240, 280, 320, 360 relative to groundY

            this.platforms.push(new Platform(nextX + gap, platY, platW, this.canvas.height - platY, 'platform'));

            // Spikes
            if (this.rand() > 0.4 && gap > 100) {
                this.spikes.push(new Spike(nextX + 10, this.canvas.height - 20, gap - 20, 20));
            }

            // Enemies per Era
            if (this.rand() > 0.4) {
                let eType = 'patrol';
                if (eraIdx === 0) eType = 'onca';
                if (eraIdx === 1) eType = 'mosquito';
                if (eraIdx === 2) eType = 'guard';
                if (eraIdx === 3) eType = 'car';

                this.enemies.push(new Enemy(
                    nextX + gap + 30,
                    platY - 26,
                    eType === 'car' ? 32 : 24,
                    24,
                    eType,
                    nextX + gap + 5,
                    nextX + gap + platW - 35,
                    1,
                    eType === 'mosquito' ? 1.6 : eType === 'onca' ? 2.2 : 1.5,
                    0,
                    this.rand() * Math.PI
                ));
            }

            nextX += gap + platW;
        }

        // End flat land
        this.platforms.push(new Platform(2900, groundY, 300, 60, 'ground'));

        // Set Portal
        this.portal.x = 3080;
        this.portal.y = groundY - 80;
        this.portal.w = 50;
        this.portal.h = 80;

        // Distribute 3 Scrolls in hard to reach heights
        const scrollXs = [900, 1700, 2500];
        scrollXs.forEach(sx => {
            let nearestPlat = this.platforms.find(p => p.x > sx - 200 && p.x < sx + 200);
            if (!nearestPlat) nearestPlat = this.platforms[2]; // fallback
            
            this.scrolls.push(new Scroll(
                nearestPlat.x + nearestPlat.w / 2 - 12,
                nearestPlat.y - 70,
                24,
                20,
                nearestPlat.y - 70
            ));
        });

        // Reset player
        this.player.x = 80;
        this.player.y = this.canvas.height - 130;
        this.player.vx = 0;
        this.player.vy = 0;
        this.player.onGround = false;
        this.player.invincibleTimer = 0;

        this.createParticles();
    }

    startGame() {
        const docEl = document.documentElement;
        const req = docEl.requestFullscreen || docEl.webkitRequestFullscreen || docEl.mozRequestFullScreen || docEl.msRequestFullscreen;
        if (req && !document.fullscreenElement && !document.webkitFullscreenElement) {
            try {
                req.call(docEl).catch(err => console.log(err));
            } catch(e) { console.log(e); }
        }
        this.score = 0;
        this.lives = 3;
        this.currentEra = 0;
        this.loadLevel(this.currentEra);
        this.gameState = STATES.PLAYING;
    }

    restartGame() {
        this.score = 0;
        this.lives = 3;
        this.loadLevel(this.currentEra);
        this.gameState = STATES.PLAYING;
    }

    handleJumpPress() {
        if (this.gameState !== STATES.PLAYING) return;
        if (this.player.onGround) {
            this.player.vy = this.PHYSICS.jumpForce;
            this.player.onGround = false;
            this.player.doubleJumpAvailable = true;
            this.audioManager.play('jump');
        } else if (this.player.doubleJumpAvailable) {
            this.player.vy = this.PHYSICS.jumpForce * 0.85;
            this.player.doubleJumpAvailable = false;
            this.audioManager.play('jump');
            // double jump particles
            for (let i = 0; i < 8; i++) {
                this.particles.push({
                    x: this.player.x + this.player.w/2,
                    y: this.player.y + this.player.h,
                    size: 2 + Math.random()*3,
                    vx: (Math.random() - 0.5) * 4,
                    vy: Math.random() * 2,
                    rot: 0,
                    rotSpeed: 0
                });
            }
        }
    }

    handleInteractionStart(pos) {
        if (this.gameState === STATES.MENU) {
            const rects = this.uiManager.getButtonRects();
            if (pos.x >= rects.play.x && pos.x <= rects.play.x + rects.play.w &&
                pos.y >= rects.play.y && pos.y <= rects.play.y + rects.play.h) {
                this.audioManager.play('jump');
                this.startGame();
            }
            if (pos.x >= rects.hub.x && pos.x <= rects.hub.x + rects.hub.w &&
                pos.y >= rects.hub.y && pos.y <= rects.hub.y + rects.hub.h) {
                window.location.href = '../../index.html';
            }
        } else if (this.gameState === STATES.PORTAL_QUIZ) {
            if (this.quizManager.showFeedbackTimer > 0) return;
            const layout = this.quizManager.getLayout(this.canvas);
            let clickedOpt = -1;
            for (let i = 0; i < 4; i++) {
                const coord = layout.options[i];
                if (pos.x >= coord.x && pos.x <= coord.x + coord.w &&
                    pos.y >= coord.y && pos.y <= coord.y + coord.h) {
                    clickedOpt = i;
                    break;
                }
            }
            if (clickedOpt !== -1) {
                this.quizManager.checkAnswer(clickedOpt);
            }
        } else if (this.gameState === STATES.GAMEOVER || this.gameState === STATES.VICTORY) {
            const rects = this.uiManager.getEndScreenRects();
            if (pos.x >= rects.restart.x && pos.x <= rects.restart.x + rects.restart.w &&
                pos.y >= rects.restart.y && pos.y <= rects.restart.y + rects.restart.h) {
                this.audioManager.play('jump');
                this.restartGame();
            }
            if (pos.x >= rects.hub.x && pos.x <= rects.hub.x + rects.hub.w &&
                pos.y >= rects.hub.y && pos.y <= rects.hub.y + rects.hub.h) {
                window.location.href = '../../index.html';
            }
        }
    }

    update() {
        if (this.gameState === STATES.PLAYING) {
            this.gameTime++;

            // Update player
            this.player.update(this.inputHandler, this.PHYSICS, this.platforms, this.canvas.width, this.canvas.height);

            // Spikes hit
            this.spikes.forEach(spk => {
                if (checkAABB(this.player, spk)) {
                    if (this.player.invincibleTimer === 0) {
                        this.audioManager.play('hit');
                        this.lives--;
                        this.player.invincibleTimer = 90;
                        this.player.vy = -6;
                        if (this.lives <= 0) {
                            this.gameState = STATES.GAMEOVER;
                            this.audioManager.play('gameover');
                        }
                    }
                }
            });

            // Falling out of canvas check
            if (this.player.y > this.canvas.height) {
                this.audioManager.play('hit');
                this.lives--;
                this.player.x = Math.max(80, this.player.x - 300);
                this.player.y = this.canvas.height - 300;
                this.player.vy = 0;
                if (this.lives <= 0) {
                    this.gameState = STATES.GAMEOVER;
                    this.audioManager.play('gameover');
                }
            }

            // Camera scroll
            const targetCamX = this.player.x - (this.canvas.width * 0.35);
            this.camX += (targetCamX - this.camX) * 0.1;
            this.camX = Math.max(0, Math.min(this.camX, this.LEVEL_WIDTH - this.canvas.width));

            // Scroll pickup
            this.scrolls.forEach(sc => {
                sc.update();
                if (!sc.collected && checkAABB(this.player, sc)) {
                    sc.collected = true;
                    this.scrollsCollected++;
                    this.score += 50;
                    this.audioManager.play('collect');
                    if (this.scrollsCollected >= 3) {
                        this.portal.active = true;
                    }
                }
            });

            // Portal hit
            if (checkAABB(this.player, this.portal) && this.portal.active) {
                this.quizManager.open(this.currentEra);
                this.gameState = STATES.PORTAL_QUIZ;
            }

            // Enemy patrols & collisions
            this.enemies.forEach(e => {
                e.update();
                if (checkAABB(this.player, e)) {
                    if (this.player.invincibleTimer === 0) {
                        this.audioManager.play('hit');
                        this.lives--;
                        this.player.invincibleTimer = 90;
                        this.player.vy = -5;
                        this.player.vx = e.dir * 4;

                        if (this.lives <= 0) {
                            this.gameState = STATES.GAMEOVER;
                            this.audioManager.play('gameover');
                        }
                    }
                }
            });

            // Particle drift
            this.particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.rot += p.rotSpeed;
                if (p.x < -10) {
                    p.x = this.canvas.width + 10;
                    p.y = Math.random() * this.canvas.height;
                }
            });
        } else if (this.gameState === STATES.PORTAL_QUIZ) {
            this.quizManager.update((correct) => {
                if (correct) {
                    if (this.currentEra < 3) {
                        this.currentEra++;
                        this.loadLevel(this.currentEra);
                        this.audioManager.play('erachange');
                        this.gameState = STATES.PLAYING;
                    } else {
                        this.gameState = STATES.VICTORY;
                        this.audioManager.play('victory');
                    }
                } else {
                    this.scrollsCollected = 0;
                    this.portal.active = false;
                    this.scrolls.forEach(sc => {
                        sc.collected = false;
                    });
                    this.player.x = this.portal.x - 120;
                    this.player.vx = -4;
                    this.gameState = STATES.PLAYING;

                    if (this.lives <= 0) {
                        this.gameState = STATES.GAMEOVER;
                        this.audioManager.play('gameover');
                    }
                }
            });
        } else if (this.gameState === STATES.MENU) {
            this.particles.forEach(p => {
                p.x += p.vx * 0.4;
                p.y += p.vy * 0.4;
                if (p.x < -10) {
                    p.x = this.canvas.width + 10;
                    p.y = Math.random() * this.canvas.height;
                }
            });
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const era = ERAS[this.currentEra];
        
        // Linear Gradient background
        let bgGrad = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        bgGrad.addColorStop(0, era.bgTop);
        bgGrad.addColorStop(1, era.bgBot);
        this.ctx.fillStyle = bgGrad;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw Background details per Era
        this.ctx.fillStyle = 'rgba(255,255,255,0.015)';
        if (this.currentEra === 0) {
            for (let i = 0; i < 4; i++) {
                const tx = (i * 240 - this.camX * 0.25) % 900;
                this.ctx.beginPath();
                this.ctx.moveTo(tx, this.canvas.height - 60);
                this.ctx.lineTo(tx + 20, this.canvas.height - 250);
                this.ctx.lineTo(tx + 40, this.canvas.height - 60);
                this.ctx.fill();
            }
        } else if (this.currentEra === 1) {
            for (let i = 0; i < 3; i++) {
                const sx = (i * 300 - this.camX * 0.15) % 900;
                this.ctx.fillRect(sx, this.canvas.height - 130, 60, 20);
                this.ctx.beginPath();
                this.ctx.moveTo(sx + 30, this.canvas.height - 130);
                this.ctx.lineTo(sx + 30, this.canvas.height - 170);
                this.ctx.lineTo(sx + 50, this.canvas.height - 150);
                this.ctx.fill();
            }
        } else if (this.currentEra === 2) {
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
            this.ctx.lineWidth = 4;
            for (let i = 0; i < 5; i++) {
                const ax = (i * 200 - this.camX * 0.2) % 900;
                this.ctx.beginPath();
                this.ctx.arc(ax + 50, this.canvas.height - 60, 80, Math.PI, 0);
                this.ctx.stroke();
            }
        } else if (this.currentEra === 3) {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.01)';
            for (let i = 0; i < 6; i++) {
                const bx = (i * 150 - this.camX * 0.25) % 900;
                this.ctx.fillRect(bx, 150 + (i % 3) * 50, 80, 240);
            }
        }

        // Draw floating particles
        this.particles.forEach(p => {
            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate(p.rot);
            
            if (era.particle === 'leaf') {
                this.ctx.fillStyle = 'rgba(34, 197, 94, 0.25)';
                this.ctx.beginPath();
                this.ctx.ellipse(0, 0, p.size, p.size / 2, 0, 0, Math.PI * 2);
                this.ctx.fill();
            } else if (era.particle === 'ship') {
                this.ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
                this.ctx.beginPath();
                this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
                this.ctx.fill();
            } else if (era.particle === 'star') {
                this.ctx.fillStyle = 'rgba(251, 191, 36, 0.3)';
                this.ctx.fillRect(-p.size/2, -1, p.size, 2);
                this.ctx.fillRect(-1, -p.size/2, 2, p.size);
            } else if (era.particle === 'gear') {
                this.ctx.fillStyle = 'rgba(96, 165, 250, 0.2)';
                this.ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
            }
            this.ctx.restore();
        });

        if (this.gameState === STATES.MENU) {
            this.uiManager.drawMenu(this.ctx, this.score, this.inputHandler.isMobile, this.inputHandler.touchControls);
            return;
        }

        // LEVEL GAMEPLAY (Camera scrolled)
        this.ctx.save();
        this.ctx.translate(-this.camX, 0);

        // Draw Platforms
        this.platforms.forEach(plat => plat.draw(this.ctx, era));

        // Draw Spikes
        this.spikes.forEach(spk => spk.draw(this.ctx));

        // Draw Scrolls
        this.scrolls.forEach(sc => sc.draw(this.ctx));

        // Draw NPC
        this.npc.draw(this.ctx, this.player.x);

        // Draw Portal
        this.portal.draw(this.ctx, era);

        // Draw Enemies
        this.enemies.forEach(e => e.draw(this.ctx));

        // Draw Player
        this.player.draw(this.ctx);

        this.ctx.restore(); // end scroll transform

        // Absolute HUD Overlays
        this.uiManager.drawHUD(this.ctx, this.lives, this.score, this.scrollsCollected, this.currentEra, ERAS);

        // Mobile virtual buttons
        if (this.inputHandler.isMobile) {
            this.uiManager.drawMobileControls(this.ctx, this.inputHandler.touchControls);
        }

        // State specific displays
        if (this.gameState === STATES.PORTAL_QUIZ) {
            this.quizManager.draw(this.ctx, this.canvas, era);
        } else if (this.gameState === STATES.GAMEOVER) {
            this.uiManager.drawGameOver(this.ctx, this.score);
        } else if (this.gameState === STATES.VICTORY) {
            this.uiManager.drawVictory(this.ctx, this.score);
        }
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(this.gameLoop);
    }

    resizeCanvas() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        
        const oldHeight = this.canvas.height;
        
        let targetWidth, targetHeight;
        if (h > w) {
            targetWidth = 450;
            targetHeight = Math.round(450 * (h / w));
            targetHeight = Math.max(650, Math.min(900, targetHeight));
        } else {
            targetWidth = 800;
            targetHeight = Math.round(800 * (h / w));
            targetHeight = Math.max(450, Math.min(600, targetHeight));
        }
        
        if (this.canvas.width !== targetWidth || this.canvas.height !== targetHeight) {
            this.canvas.width = targetWidth;
            this.canvas.height = targetHeight;
            this.adjustEntitiesHeight(oldHeight, targetHeight);
        }
        
        const overlay = document.getElementById('rotate-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
    }

    adjustEntitiesHeight(oldHeight, newHeight) {
        if (!oldHeight || oldHeight === newHeight) return;
        
        this.player.y = newHeight - (oldHeight - this.player.y);
        
        this.platforms.forEach(plat => {
            plat.y = newHeight - (oldHeight - plat.y);
            plat.h = newHeight - plat.y;
        });
        
        this.spikes.forEach(spk => {
            spk.y = newHeight - (oldHeight - spk.y);
        });
        
        this.scrolls.forEach(sc => {
            sc.y = newHeight - (oldHeight - sc.y);
            sc.baseY = newHeight - (oldHeight - sc.baseY);
        });
        
        if (this.npc) {
            this.npc.y = newHeight - (oldHeight - this.npc.y);
        }
        
        if (this.portal) {
            this.portal.y = newHeight - (oldHeight - this.portal.y);
        }
        
        this.particles.forEach(p => {
            p.y = p.y * (newHeight / oldHeight);
        });
    }
}
