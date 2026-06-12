class InputHandler {
    constructor(canvas, onJumpPress, onInteractionStart, audioManager) {
        this.canvas = canvas;
        this.onJumpPress = onJumpPress;
        this.onInteractionStart = onInteractionStart;
        this.audioManager = audioManager;

        this.keys = {};
        this.touchControls = {
            left: false,
            right: false,
            jump: false
        };
        this.isMobile = false;

        this.checkMobile();
        this.initListeners();
    }

    checkMobile() {
        this.isMobile = ('ontouchstart' in window) || 
                       (navigator.maxTouchPoints > 0) || 
                       /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);
    }

    initListeners() {
        window.addEventListener('keydown', e => {
            this.keys[e.code] = true;
            if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') {
                if (this.onJumpPress) this.onJumpPress();
            }
            if (this.audioManager) this.audioManager.init();
        });

        window.addEventListener('keyup', e => {
            this.keys[e.code] = false;
        });

        // Fallback: first touch guarantees mobile layout on touch screen
        const onFirstTouch = () => {
            this.isMobile = true;
            window.removeEventListener('touchstart', onFirstTouch);
        };
        window.addEventListener('touchstart', onFirstTouch, { passive: true });

        // Mouse/Touch clicks (Desktop & Mobile)
        this.canvas.addEventListener('mousedown', e => {
            if (this.audioManager) this.audioManager.init();
            const pos = this.getCanvasCoordinates(e);
            if (this.onInteractionStart) this.onInteractionStart(pos);
        });

        // Multi-touch Events (Mobile Controls)
        this.canvas.addEventListener('touchstart', e => {
            e.preventDefault();
            if (this.audioManager) this.audioManager.init();
            
            if (window.gameInstance && window.gameInstance.gameState === 'playing') {
                const rect = this.canvas.getBoundingClientRect();
                for (let i = 0; i < e.changedTouches.length; i++) {
                    const touch = e.changedTouches[i];
                    const pos = this.getTouchCoordinates(touch, rect);
                    
                    // Jump zone: X in the right 25% of the canvas, Y in bottom 50%
                    if (pos.x >= this.canvas.width * 0.75 && pos.y >= this.canvas.height * 0.5) {
                        this.touchControls.jump = true;
                        if (this.onJumpPress) this.onJumpPress();
                    }
                }
                this.updateTouchControls(e);
            } else {
                const pos = this.getCanvasCoordinates(e.changedTouches[0]);
                if (this.onInteractionStart) this.onInteractionStart(pos);
            }
        }, { passive: false });

        this.canvas.addEventListener('touchmove', e => {
            e.preventDefault();
            if (window.gameInstance && window.gameInstance.gameState === 'playing') {
                this.updateTouchControls(e);
            }
        }, { passive: false });

        const handleTouchEnd = e => {
            e.preventDefault();
            if (window.gameInstance && window.gameInstance.gameState === 'playing') {
                this.updateTouchControls(e);
                
                // Check if jump touch was released
                const rect = this.canvas.getBoundingClientRect();
                let jumpStillTouched = false;
                for (let i = 0; i < e.touches.length; i++) {
                    const touch = e.touches[i];
                    const pos = this.getTouchCoordinates(touch, rect);
                    if (pos.x >= this.canvas.width * 0.75 && pos.y >= this.canvas.height * 0.5) {
                        jumpStillTouched = true;
                    }
                }
                if (!jumpStillTouched) {
                    this.touchControls.jump = false;
                }
            }
        };

        this.canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
        this.canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false });
    }

    getTouchCoordinates(touch, rect) {
        const canvasRatio = this.canvas.width / this.canvas.height;
        const elementRatio = rect.width / rect.height;
        
        let contentW, contentH;
        let offsetX = 0;
        let offsetY = 0;
        
        if (elementRatio > canvasRatio) {
            contentH = rect.height;
            contentW = rect.height * canvasRatio;
            offsetX = (rect.width - contentW) / 2;
        } else {
            contentW = rect.width;
            contentH = rect.width / canvasRatio;
            offsetY = (rect.height - contentH) / 2;
        }
        
        const relativeX = touch.clientX - rect.left - offsetX;
        const relativeY = touch.clientY - rect.top - offsetY;
        
        return {
            x: relativeX * (this.canvas.width / contentW),
            y: relativeY * (this.canvas.height / contentH)
        };
    }

    getCanvasCoordinates(e) {
        const rect = this.canvas.getBoundingClientRect();
        let touch;
        if (e.touches && e.touches.length > 0) {
            touch = e.touches[0];
        } else if (e.changedTouches && e.changedTouches.length > 0) {
            touch = e.changedTouches[0];
        } else {
            touch = e;
        }
        return this.getTouchCoordinates(touch, rect);
    }

    updateTouchControls(e) {
        if (!window.gameInstance || window.gameInstance.gameState !== 'playing') return;
        
        // Reset movements
        this.touchControls.left = false;
        this.touchControls.right = false;
        
        const rect = this.canvas.getBoundingClientRect();
        for (let i = 0; i < e.touches.length; i++) {
            const touch = e.touches[i];
            const pos = this.getTouchCoordinates(touch, rect);
            
            // Left Zone: X in left 18% of canvas, Y in bottom 50%
            if (pos.x >= 0 && pos.x <= this.canvas.width * 0.18 && pos.y >= this.canvas.height * 0.5) {
                this.touchControls.left = true;
            }
            // Right Zone: X in 18% to 35% of canvas, Y in bottom 50%
            if (pos.x > this.canvas.width * 0.18 && pos.x <= this.canvas.width * 0.35 && pos.y >= this.canvas.height * 0.5) {
                this.touchControls.right = true;
            }
        }
    }
}
