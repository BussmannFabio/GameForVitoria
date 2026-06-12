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
    constructor(x, y, w, h, type = 'floating') {
        super(x, y, w, h);
        this.type = type;
    }

    draw(ctx, era) {
        let platGrad = ctx.createLinearGradient(this.x, this.y, this.x, this.y + 100);
        platGrad.addColorStop(0, era.platColor);
        platGrad.addColorStop(1, '#080d19');
        ctx.fillStyle = platGrad;
        ctx.fillRect(this.x, this.y, this.w, this.h);

        // Top rim highlight
        ctx.fillStyle = era.accent;
        ctx.fillRect(this.x, this.y, this.w, 4);
    }
}

class Spike extends Entity {
    constructor(x, y, w, h) {
        super(x, y, w, h, '#f87171');
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

class Scroll extends Entity {
    constructor(x, y, w, h, baseY) {
        super(x, y, w, h);
        this.baseY = baseY;
        this.collected = false;
    }

    update() {
        if (!this.collected) {
            // Float bounce animation
            this.y = this.baseY + Math.sin(Date.now() / 250) * 5;
        }
    }

    draw(ctx) {
        if (!this.collected) {
            // Scroll parchment paper rect
            ctx.fillStyle = '#fef3c7';
            ctx.fillRect(this.x, this.y, this.w, this.h);
            // Red ribbon band
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(this.x + this.w/2 - 3, this.y, 6, this.h);
            // Border
            ctx.strokeStyle = '#d97706';
            ctx.lineWidth = 1;
            ctx.strokeRect(this.x, this.y, this.w, this.h);
        }
    }
}

class NPC extends Entity {
    constructor(x, y, w, h, fact) {
        super(x, y, w, h);
        this.fact = fact;
    }

    draw(ctx, playerX) {
        const npcPulse = Math.sin(Date.now() / 250) * 3;
        // Guide body: Blue coat
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(this.x, this.y + npcPulse, this.w, this.h);
        // Guide head
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(this.x + this.w/2, this.y - 8 + npcPulse, 8, 0, Math.PI*2);
        ctx.fill();
        // Hair / Glasses
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(this.x - 2, this.y - 16 + npcPulse, this.w + 4, 6); // grey wig/hair
        
        // Speech Bubble (If player is close)
        if (Math.abs(playerX - this.x) < 160) {
            // rounded rect speech container
            drawRoundRect(ctx, this.x - 120, this.y - 75, 240, 48, 10, 'rgba(15, 23, 42, 0.95)', '#f59e0b');
            
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 11px Nunito';
            ctx.textAlign = 'center';
            const txt = this.fact;
            ctx.fillText(txt, this.x, this.y - 48);
        }
    }
}

// Global drawRoundRect helper (in case needed by NPC)
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

class Portal extends Entity {
    constructor(x, y, w, h) {
        super(x, y, w, h);
        this.active = false;
    }

    draw(ctx, era) {
        const portTime = Date.now() / 600;
        ctx.save();
        ctx.translate(this.x + this.w/2, this.y + this.h/2);
        
        if (this.active) {
            // Spinning golden vortex
            for (let i = 0; i < 12; i++) {
                const angle = (i / 12) * Math.PI * 2 + portTime;
                const r = 24 + Math.sin(portTime * 4 + i) * 8;
                ctx.fillStyle = `hsla(${era.accentHue + i * 20}, 100%, 65%, 0.85)`;
                ctx.beginPath();
                ctx.arc(Math.cos(angle) * r, Math.sin(angle) * r, 5 + i/3, 0, Math.PI*2);
                ctx.fill();
            }
        } else {
            // Dim gray outline portal
            ctx.strokeStyle = '#475569';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, 24, 0, Math.PI*2);
            ctx.stroke();
            
            ctx.fillStyle = '#64748b';
            ctx.font = 'bold 10px Nunito';
            ctx.textAlign = 'center';
            ctx.fillText('PORTAL', 0, -32);
            ctx.fillText('INATIVO', 0, 38);
        }
        ctx.restore();
    }
}

class Enemy extends Entity {
    constructor(x, y, w, h, type, patrolMin, patrolMax, dir = 1, vx = 1.5, vy = 0, phase = 0) {
        super(x, y, w, h);
        this.type = type;
        this.patrolMin = patrolMin;
        this.patrolMax = patrolMax;
        this.dir = dir;
        this.vx = vx;
        this.vy = vy;
        this.phase = phase;
    }

    update() {
        if (this.type === 'mosquito') {
            this.phase += 0.06;
            this.y += Math.sin(this.phase) * 1.0;
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

        if (this.type === 'onca') {
            // Era 1: Onça Pintada - Spotted orange circle
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.arc(cx, cy, this.w/2, 0, Math.PI*2);
            ctx.fill();
            // spots
            ctx.fillStyle = '#78350f';
            ctx.beginPath();
            ctx.arc(cx - 5, cy - 2, 2, 0, Math.PI*2);
            ctx.arc(cx + 5, cy + 3, 2, 0, Math.PI*2);
            ctx.arc(cx, cy + 5, 1.5, 0, Math.PI*2);
            ctx.fill();
            // ears
            ctx.beginPath();
            ctx.moveTo(cx - 10, cy - 8);
            ctx.lineTo(cx - 12, cy - 14);
            ctx.lineTo(cx - 4, cy - 10);
            ctx.moveTo(cx + 10, cy - 8);
            ctx.lineTo(cx + 12, cy - 14);
            ctx.lineTo(cx + 4, cy - 10);
            ctx.fill();
        } else if (this.type === 'mosquito') {
            // Era 2: Mosquito - Tiny flapping insect
            ctx.fillStyle = '#475569';
            ctx.beginPath();
            ctx.moveTo(cx, cy - 6);
            ctx.lineTo(cx - 6, cy + 6);
            ctx.lineTo(cx + 6, cy + 6);
            ctx.closePath();
            ctx.fill();
            
            // Wings flapping
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            const wingSpread = Math.sin(Date.now() / 50) * 12;
            ctx.beginPath();
            ctx.ellipse(cx - 5, cy - 2, 8, Math.abs(wingSpread)/2, -0.4, 0, Math.PI*2);
            ctx.ellipse(cx + 5, cy - 2, 8, Math.abs(wingSpread)/2, 0.4, 0, Math.PI*2);
            ctx.fill();
        } else if (this.type === 'guard') {
            // Era 3: Royal Guard - Soldier rectangular
            ctx.fillStyle = '#dc2626'; // Red uniform
            ctx.fillRect(this.x, this.y, this.w, this.h);
            
            ctx.fillStyle = '#1e3a8a'; // Blue trousers
            ctx.fillRect(this.x, this.y + this.h - 6, this.w, 6);
            
            ctx.fillStyle = '#000'; // Black hat
            ctx.fillRect(this.x - 2, this.y - 8, this.w + 4, 8);
            
            // Golden button stripe
            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(cx - 1.5, this.y + 4, 3, 10);
        } else if (this.type === 'car') {
            // Era 4: Old Car
            ctx.fillStyle = '#334155'; // Car body
            ctx.fillRect(this.x, this.y + 6, this.w, this.h - 6);
            ctx.fillRect(this.x + 6, this.y, this.w - 12, 6); // cabin
            
            // Wheels
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(this.x + 6, this.y + this.h - 2, 5, 0, Math.PI*2);
            ctx.arc(this.x + this.w - 6, this.y + this.h - 2, 5, 0, Math.PI*2);
            ctx.fill();
        }
    }
}

class Player extends Entity {
    constructor(x, y, w = 24, h = 30) {
        super(x, y, w, h);
        this.vx = 0;
        this.vy = 0;
        this.onGround = false;
        this.doubleJumpAvailable = true;
        this.invincibleTimer = 0;
    }

    update(input, PHYSICS, platforms, canvasWidth, canvasHeight) {
        if (this.invincibleTimer > 0) this.invincibleTimer--;

        // Horizontal movement input
        let dx = 0;
        if (input.keys['ArrowLeft'] || input.keys['KeyA'] || input.touchControls.left) {
            dx = -PHYSICS.moveSpeed;
        }
        if (input.keys['ArrowRight'] || input.keys['KeyD'] || input.touchControls.right) {
            dx = PHYSICS.moveSpeed;
        }

        this.vx = dx;
        this.vy += PHYSICS.gravity;

        // Move X and resolve platform collisions
        this.x += this.vx;
        platforms.forEach(plat => {
            if (checkAABB(this, plat)) {
                if (this.vx > 0) this.x = plat.x - this.w;
                if (this.vx < 0) this.x = plat.x + plat.w;
            }
        });

        // Move Y and resolve platform collisions
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

        // Bound check (left side)
        if (this.x < 0) this.x = 0;
    }

    draw(ctx) {
        const blink = this.invincibleTimer > 0 && Math.floor(Date.now() / 100) % 2 === 0;
        if (!blink) {
            const px = this.x;
            const py = this.y;
            
            // Body: tan/brown coat
            ctx.fillStyle = '#b45309';
            ctx.fillRect(px, py, this.w, this.h);

            // Scarf: orange detail
            ctx.fillStyle = '#ea580c';
            ctx.fillRect(px, py + 6, this.w, 4);

            // Explorer Hat
            ctx.fillStyle = '#78350f';
            ctx.fillRect(px - 3, py - 4, this.w + 6, 4); // brim
            ctx.fillRect(px + 2, py - 9, this.w - 4, 5); // top

            // Face details (Eyes)
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(px + 6, py + 3, 3, 0, Math.PI*2);
            ctx.arc(px + this.w - 6, py + 3, 3, 0, Math.PI*2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(px + 6, py + 3, 1, 0, Math.PI*2);
            ctx.arc(px + this.w - 6, py + 3, 1, 0, Math.PI*2);
            ctx.fill();
        }
    }
}
