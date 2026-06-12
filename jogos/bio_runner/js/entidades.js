function checkAABB(rect1, rect2) {
    return rect1.x < rect2.x + rect2.w &&
           rect1.x + rect1.w > rect2.x &&
           rect1.y < rect2.y + rect2.h &&
           rect1.y + rect1.h > rect2.y;
}

class Entity {
    constructor(x, y, w, h, color = '#fff') {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.color = color;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.w, this.h);
    }

    update() {}
}

class Platform extends Entity {
    constructor(x, y, w, h) {
        super(x, y, w, h);
    }

    draw(ctx, theme) {
        let platGrad = ctx.createLinearGradient(this.x, this.y, this.x, this.y + 100);
        platGrad.addColorStop(0, theme.platColor);
        platGrad.addColorStop(1, '#0c0f1d');
        ctx.fillStyle = platGrad;
        ctx.fillRect(this.x, this.y, this.w, this.h);

        // Draw platform top rim highlight
        ctx.fillStyle = theme.accent;
        ctx.fillRect(this.x, this.y, this.w, 4);
    }
}

class Spike extends Entity {
    constructor(x, y, w, h) {
        super(x, y, w, h, '#ef4444');
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        const sWidth = 16;
        const count = Math.ceil(this.w / sWidth);
        for (let i = 0; i < count; i++) {
            ctx.beginPath();
            ctx.moveTo(this.x + i * sWidth, this.y + this.h);
            ctx.lineTo(this.x + i * sWidth + sWidth/2, this.y);
            ctx.lineTo(this.x + (i + 1) * sWidth, this.y + this.h);
            ctx.fill();
        }
    }
}

class QuestionBlock extends Entity {
    constructor(x, y, w, h, questionIndex) {
        super(x, y, w, h);
        this.questionIndex = questionIndex;
        this.solved = false;
    }

    draw(ctx) {
        if (this.solved) {
            // Inactive gray block
            ctx.fillStyle = '#475569';
            ctx.fillRect(this.x, this.y, this.w, this.h);
            ctx.strokeStyle = '#334155';
            ctx.strokeRect(this.x, this.y, this.w, this.h);
            ctx.fillStyle = '#94a3b8';
            ctx.font = 'bold 16px Nunito';
            ctx.textAlign = 'center';
            ctx.fillText('✓', this.x + this.w/2, this.y + this.h/2 + 6);
        } else {
            // Pulsing golden/amber block
            const pulse = Math.sin(Date.now() / 200) * 15;
            ctx.fillStyle = `hsl(45, 100%, ${50 + pulse}%)`;
            ctx.fillRect(this.x, this.y, this.w, this.h);
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x, this.y, this.w, this.h);
            
            ctx.fillStyle = '#0f172a';
            ctx.font = 'bold 20px Nunito';
            ctx.textAlign = 'center';
            ctx.fillText('?', this.x + this.w/2, this.y + this.h/2 + 7);
        }
    }
}

class Portal extends Entity {
    constructor(x, y, w, h) {
        super(x, y, w, h);
    }

    draw(ctx, theme) {
        const pTime = Date.now() / 600;
        ctx.save();
        ctx.translate(this.x + this.w/2, this.y + this.h/2);
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + pTime;
            const dist = 14 + Math.sin(pTime * 3 + i) * 6;
            ctx.fillStyle = `hsla(${200 + i * 25}, 100%, 70%, 0.8)`;
            ctx.beginPath();
            ctx.arc(Math.cos(angle) * dist, Math.sin(angle) * dist, 4 + i/2, 0, Math.PI*2);
            ctx.fill();
        }
        ctx.restore();
        // Draw portal base ring
        ctx.strokeStyle = theme.accent;
        ctx.lineWidth = 3;
        ctx.strokeRect(this.x + 10, this.y + 10, this.w - 20, this.h - 20);
    }
}

class Enemy extends Entity {
    constructor(x, y, w, h, type, patrolMin, patrolMax, dir = 1, vx = 1.5, vy = 0, floatPhase = 0) {
        super(x, y, w, h);
        this.type = type;
        this.patrolMin = patrolMin;
        this.patrolMax = patrolMax;
        this.dir = dir;
        this.vx = vx;
        this.vy = vy;
        this.floatPhase = floatPhase;
    }

    update() {
        if (this.type === 'virus') {
            this.floatPhase += 0.05;
            this.y += Math.sin(this.floatPhase) * 0.6;
        }
        
        this.x += this.vx * this.dir;
        if (this.x <= this.patrolMin) {
            this.x = this.patrolMin;
            this.dir = 1;
        }
        if (this.x >= this.patrolMax) {
            this.x = this.patrolMax;
            this.dir = -1;
        }
    }

    draw(ctx) {
        const cx = this.x + this.w/2;
        const cy = this.y + this.h/2;

        if (this.type === 'virus') {
            // Red spiky virus
            ctx.fillStyle = '#f43f5e';
            ctx.beginPath();
            ctx.arc(cx, cy, this.w/2, 0, Math.PI*2);
            ctx.fill();
            
            // Spikes
            ctx.strokeStyle = '#fda4af';
            ctx.lineWidth = 2;
            const spikesCount = 8;
            const r = this.w/2;
            for (let i = 0; i < spikesCount; i++) {
                const angle = (i / spikesCount) * Math.PI * 2 + (Date.now() / 1000);
                ctx.beginPath();
                ctx.moveTo(cx + Math.cos(angle)*r, cy + Math.sin(angle)*r);
                ctx.lineTo(cx + Math.cos(angle)*(r+5), cy + Math.sin(angle)*(r+5));
                ctx.stroke();
            }
            // Eye
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(cx - 3, cy - 2, 2, 0, Math.PI*2);
            ctx.arc(cx + 3, cy - 2, 2, 0, Math.PI*2);
            ctx.fill();
        } else {
            // Purple bacteria (bacteria / generic)
            ctx.fillStyle = '#a855f7';
            ctx.beginPath();
            ctx.ellipse(cx, cy, this.w/2, this.h/2 + Math.sin(Date.now()/100)*2, 0, 0, Math.PI*2);
            ctx.fill();
            
            // Nucleus detail
            ctx.fillStyle = '#6b21a8';
            ctx.beginPath();
            ctx.arc(cx, cy, 4, 0, Math.PI*2);
            ctx.fill();

            // Angry eye
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(cx - 6, cy - 3);
            ctx.lineTo(cx - 2, cy - 1);
            ctx.moveTo(cx + 6, cy - 3);
            ctx.lineTo(cx + 2, cy - 1);
            ctx.stroke();
        }
    }
}

class Player extends Entity {
    constructor(x, y, w = 26, h = 26) {
        super(x, y, w, h);
        this.vx = 0;
        this.vy = 0;
        this.onGround = false;
        this.doubleJumpAvailable = true;
        this.invincibleTimer = 0;
        this.shieldPulse = 0;
    }

    update(input, PHYSICS, platforms, canvasWidth, canvasHeight) {
        this.shieldPulse += 0.1;
        if (this.invincibleTimer > 0) this.invincibleTimer--;

        // Horizontal input movement
        let dx = 0;
        if (input.keys['ArrowLeft'] || input.keys['KeyA'] || input.touchControls.left) {
            dx = -PHYSICS.moveSpeed;
        }
        if (input.keys['ArrowRight'] || input.keys['KeyD'] || input.touchControls.right) {
            dx = PHYSICS.moveSpeed;
        }

        this.vx = dx;
        this.vy += PHYSICS.gravity;

        // Move X and collide
        this.x += this.vx;
        platforms.forEach(plat => {
            if (checkAABB(this, plat)) {
                if (this.vx > 0) this.x = plat.x - this.w;
                if (this.vx < 0) this.x = plat.x + plat.w;
            }
        });

        // Move Y and collide
        this.y += this.vy;
        this.onGround = false;
        platforms.forEach(plat => {
            if (checkAABB(this, plat)) {
                if (this.vy > 0) {
                    this.y = plat.y - this.h;
                    this.vy = 0;
                    this.onGround = true;
                    this.doubleJumpAvailable = true;
                }
                if (this.vy < 0) {
                    this.y = plat.y + plat.h;
                    this.vy = 0;
                }
            }
        });

        // Left boundary
        if (this.x < 0) this.x = 0;
    }

    draw(ctx, theme, activeShield) {
        const blink = this.invincibleTimer > 0 && Math.floor(Date.now() / 100) % 2 === 0;
        if (!blink) {
            const px = this.x + this.w/2;
            const py = this.y + this.h/2;
            
            // Outer circle
            ctx.fillStyle = '#f8fafc';
            ctx.beginPath();
            ctx.arc(px, py, this.w/2, 0, Math.PI*2);
            ctx.fill();
            ctx.strokeStyle = theme.accent;
            ctx.lineWidth = 2.5;
            ctx.stroke();

            // Inner Nucleus
            ctx.fillStyle = '#3b82f6';
            ctx.beginPath();
            ctx.arc(px - 2, py - 1, this.w/4, 0, Math.PI*2);
            ctx.fill();

            // Shield power-up aura
            if (activeShield) {
                ctx.strokeStyle = `rgba(56, 189, 248, ${0.4 + Math.sin(this.shieldPulse)*0.2})`;
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.arc(px, py, this.w/2 + 6, 0, Math.PI*2);
                ctx.stroke();
            }
        }
    }
}
