class Game {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        
        // Constants
        this.LEVEL_WIDTH = 3200;
        this.PHYSICS = {
            gravity: 0.52,
            jumpForce: -11.5,
            moveSpeed: 4.2,
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
        this.currentWorld = 0;
        this.currentLevel = 1;
        this.score = 0;
        this.lives = 3;
        this.activeShield = false;
        this.gameTime = 0;
        this.camX = 0;

        // Entities
        this.player = new Player(100, 300);
        this.platforms = [];
        this.enemies = [];
        this.questionBlocks = [];
        this.spikes = [];
        this.portal = new Portal(3080, 200, 50, 80);
        this.particles = [];

        // LCG Seed
        this.randomVal = 123;

        // Bindings
        this.resizeCanvas = this.resizeCanvas.bind(this);
        this.gameLoop = this.gameLoop.bind(this);

        this.init();
    }

    init() {
        window.addEventListener('resize', this.resizeCanvas);
        window.addEventListener('orientationchange', this.resizeCanvas);
        this.resizeCanvas();
        this.createWorldParticles();
        requestAnimationFrame(this.gameLoop);
    }

    rand() {
        this.randomVal = (this.randomVal * 9301 + 49297) % 233280;
        return this.randomVal / 233280;
    }

    createWorldParticles() {
        this.particles = [];
        for (let i = 0; i < 30; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                r: 2 + Math.random() * 6,
                vx: -0.2 - Math.random() * 0.8,
                vy: (Math.random() - 0.5) * 0.3,
                alpha: 0.2 + Math.random() * 0.5
            });
        }
    }

    loadLevel(wIdx, lIdx) {
        this.platforms = [];
        this.enemies = [];
        this.questionBlocks = [];
        this.spikes = [];

        const groundY = this.canvas.height - 60;

        // Base ground parts (always present at start/end)
        this.platforms.push(new Platform(0, groundY, 500, 60));

        // Generate levels with platform configs
        const seed = (wIdx * 2 + lIdx) * 123;
        this.randomVal = seed;

        let nextX = 500;
        while (nextX < 2900) {
            const step = this.rand();
            const gap = 80 + step * 70;
            const platW = 140 + this.rand() * 160;
            const platY = groundY - (30 + Math.floor(this.rand() * 4) * 40); // relative to groundY

            // Ground/Platform
            this.platforms.push(new Platform(nextX + gap, platY, platW, this.canvas.height - platY));

            // Spikes in the gaps
            if (this.rand() > 0.4 && gap > 90) {
                this.spikes.push(new Spike(nextX + 10, this.canvas.height - 20, gap - 20, 20));
            }

            // Question Block
            if (this.rand() > 0.3) {
                this.questionBlocks.push(new QuestionBlock(
                    nextX + gap + (platW / 2) - 20,
                    platY - 110,
                    36,
                    36,
                    Math.floor(this.rand() * 10) + (wIdx * 10)
                ));
            }

            // Enemy
            if (this.rand() > 0.4) {
                const eType = this.rand() > 0.5 ? 'virus' : 'bacteria';
                this.enemies.push(new Enemy(
                    nextX + gap + 30,
                    platY - 24,
                    24,
                    24,
                    eType,
                    nextX + gap + 10,
                    nextX + gap + platW - 34,
                    1,
                    eType === 'virus' ? 1.4 : 1.8,
                    0,
                    this.rand() * Math.PI
                ));
            }

            nextX += gap + platW;
        }

        // End flat land
        this.platforms.push(new Platform(2900, groundY, 300, 60));
        
        // Set portal
        this.portal.x = 3080;
        this.portal.y = groundY - 80;

        // Reset player position
        this.player.x = 80;
        this.player.y = this.canvas.height - 130;
        this.player.vx = 0;
        this.player.vy = 0;
        this.player.onGround = false;
        this.player.invincibleTimer = 0;

        this.createWorldParticles();
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
        this.currentWorld = 0;
        this.currentLevel = 1;
        this.activeShield = false;
        this.loadLevel(this.currentWorld, 0);
        this.gameState = STATES.PLAYING;
    }

    restartGame() {
        this.score = 0;
        this.lives = 3;
        this.activeShield = false;
        this.currentLevel = 1;
        this.loadLevel(this.currentWorld, 0);
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
            
            // particles
            for (let i = 0; i < 8; i++) {
                this.particles.push({
                    x: this.player.x + this.player.w/2,
                    y: this.player.y + this.player.h,
                    r: 2 + Math.random() * 3,
                    vx: (Math.random() - 0.5) * 4,
                    vy: Math.random() * 2,
                    alpha: 0.8
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
                window.location.href = './index.html';
            }
        } else if (this.gameState === STATES.QUIZ) {
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
                window.location.href = './index.html';
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
                        if (this.activeShield) {
                            this.activeShield = false;
                        } else {
                            this.lives--;
                        }
                        this.player.invincibleTimer = 90;
                        this.player.vy = -7;
                        if (this.lives <= 0) {
                            this.gameState = STATES.GAMEOVER;
                            this.audioManager.play('gameover');
                        }
                    }
                }
            });

            // Falling out check
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

            // Camera follow
            const targetCamX = this.player.x - (this.canvas.width * 0.35);
            this.camX += (targetCamX - this.camX) * 0.1;
            this.camX = Math.max(0, Math.min(this.camX, this.LEVEL_WIDTH - this.canvas.width));

            // Question blocks from below
            this.questionBlocks.forEach((block, idx) => {
                if (!block.solved && checkAABB(this.player, block)) {
                    if (this.player.vy < 0 && this.player.y + this.player.h >= block.y + block.h - 5) {
                        this.player.vy = 2; // bounce down
                        block.solved = true;
                        this.quizManager.open(block, idx);
                        this.gameState = STATES.QUIZ;
                    }
                }
            });

            // Enemies patrol & damage
            this.enemies.forEach(e => {
                e.update();
                if (checkAABB(this.player, e)) {
                    if (this.player.invincibleTimer === 0) {
                        this.audioManager.play('hit');
                        if (this.activeShield) {
                            this.activeShield = false;
                        } else {
                            this.lives--;
                        }
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

            // Portal transition
            if (checkAABB(this.player, this.portal)) {
                if (this.currentLevel === 1) {
                    this.currentLevel = 2;
                    this.loadLevel(this.currentWorld, 1);
                    this.audioManager.play('correct');
                } else {
                    if (this.currentWorld < 2) {
                        this.currentWorld++;
                        this.currentLevel = 1;
                        this.loadLevel(this.currentWorld, 0);
                        this.audioManager.play('victory');
                    } else {
                        this.gameState = STATES.VICTORY;
                        this.audioManager.play('victory');
                    }
                }
            }

            // Update particles
            this.particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < -10) {
                    p.x = this.canvas.width + 10;
                    p.y = Math.random() * this.canvas.height;
                }
            });
        } else if (this.gameState === STATES.QUIZ) {
            this.quizManager.update((correct, block, blockIndex) => {
                if (correct) {
                    this.score += 150;
                    this.activeShield = true; // gain shield!
                    this.gameState = STATES.PLAYING;
                } else {
                    if (this.activeShield) {
                        this.activeShield = false;
                    } else {
                        this.lives--;
                    }
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

        const theme = WORLDS[this.currentWorld];

        // Linear Gradient background
        let bgGrad = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        bgGrad.addColorStop(0, theme.bgTop);
        bgGrad.addColorStop(1, theme.bgBot);
        this.ctx.fillStyle = bgGrad;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw background particles
        this.particles.forEach(p => {
            this.ctx.fillStyle = this.currentWorld === 0 ? `rgba(244,63,94,${p.alpha})` : 
                            this.currentWorld === 1 ? `rgba(192,132,252,${p.alpha})` : 
                                                 `rgba(56,189,248,${p.alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            this.ctx.fill();
        });

        if (this.gameState === STATES.MENU) {
            this.uiManager.drawMenu(this.ctx);
            return;
        }

        // WORLD OBJECTS (Scrolled by camera)
        this.ctx.save();
        this.ctx.translate(-this.camX, 0);

        // Draw Platforms
        this.platforms.forEach(plat => plat.draw(this.ctx, theme));

        // Draw Spikes
        this.spikes.forEach(spk => spk.draw(this.ctx));

        // Draw Question Blocks
        this.questionBlocks.forEach(block => block.draw(this.ctx));

        // Draw Portal
        this.portal.draw(this.ctx, theme);

        // Draw Enemies
        this.enemies.forEach(e => e.draw(this.ctx));

        // Draw Player
        this.player.draw(this.ctx, theme, this.activeShield);

        this.ctx.restore(); // end camera transform

        // HUD Overlays (Absolute coordinates)
        this.uiManager.drawHUD(this.ctx, this.lives, this.score, this.currentLevel, this.activeShield, this.currentWorld, WORLDS);

        // Mobile Controls overlay
        if (this.inputHandler.isMobile) {
            this.uiManager.drawMobileControls(this.ctx, this.inputHandler.touchControls);
        }

        // Game State Specific Render
        if (this.gameState === STATES.QUIZ) {
            this.quizManager.draw(this.ctx, this.canvas, theme);
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
        
        this.questionBlocks.forEach(qb => {
            qb.y = newHeight - (oldHeight - qb.y);
        });
        
        this.enemies.forEach(e => {
            e.y = newHeight - (oldHeight - e.y);
        });
        
        if (this.portal) {
            this.portal.y = newHeight - (oldHeight - this.portal.y);
        }
        
        this.particles.forEach(p => {
            p.y = p.y * (newHeight / oldHeight);
        });
    }
}
