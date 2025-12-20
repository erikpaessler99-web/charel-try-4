// rosieMobileControls.js - Mobile controls stub

export class MobileControls {
  constructor(playerController) {
    this.playerController = playerController;
    this.enabled = false;
    
    // Only enable on touch devices
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      this.createControls();
    }
  }
  
  createControls() {
    // Check if already created
    if (document.getElementById('mobile-game-controls')) return;
    
    this.enabled = true;
    
    // Create container
    const container = document.createElement('div');
    container.id = 'mobile-game-controls';
    container.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 200px;
      pointer-events: none;
      z-index: 1000;
    `;
    
    // Virtual joystick
    const joystick = document.createElement('div');
    joystick.id = 'virtual-joystick';
    joystick.style.cssText = `
      position: absolute;
      bottom: 40px;
      left: 40px;
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: rgba(255,255,255,0.2);
      border: 2px solid rgba(255,255,255,0.4);
      pointer-events: auto;
    `;
    
    const knob = document.createElement('div');
    knob.id = 'virtual-joystick-knob';
    knob.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: rgba(255,255,255,0.6);
    `;
    joystick.appendChild(knob);
    container.appendChild(joystick);
    
    // Jump button
    const jumpBtn = document.createElement('div');
    jumpBtn.id = 'jump-button';
    jumpBtn.style.cssText = `
      position: absolute;
      bottom: 60px;
      right: 60px;
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: rgba(100,200,255,0.4);
      border: 2px solid rgba(100,200,255,0.6);
      pointer-events: auto;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      color: white;
    `;
    jumpBtn.textContent = '⬆';
    container.appendChild(jumpBtn);
    
    document.body.appendChild(container);
    
    // Joystick logic
    this.setupJoystick(joystick, knob);
    this.setupJumpButton(jumpBtn);
  }
  
  setupJoystick(joystick, knob) {
    let active = false;
    let startX, startY;
    const maxDistance = 40;
    
    const handleStart = (e) => {
      e.preventDefault();
      active = true;
      const touch = e.touches ? e.touches[0] : e;
      const rect = joystick.getBoundingClientRect();
      startX = rect.left + rect.width / 2;
      startY = rect.top + rect.height / 2;
    };
    
    const handleMove = (e) => {
      if (!active) return;
      e.preventDefault();
      
      const touch = e.touches ? e.touches[0] : e;
      let deltaX = touch.clientX - startX;
      let deltaY = touch.clientY - startY;
      
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      if (distance > maxDistance) {
        deltaX = (deltaX / distance) * maxDistance;
        deltaY = (deltaY / distance) * maxDistance;
      }
      
      knob.style.transform = `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px))`;
      
      // Update player controller keys
      const threshold = 10;
      this.playerController.keys['KeyW'] = deltaY < -threshold;
      this.playerController.keys['KeyS'] = deltaY > threshold;
      this.playerController.keys['KeyA'] = deltaX < -threshold;
      this.playerController.keys['KeyD'] = deltaX > threshold;
    };
    
    const handleEnd = () => {
      active = false;
      knob.style.transform = 'translate(-50%, -50%)';
      this.playerController.keys['KeyW'] = false;
      this.playerController.keys['KeyS'] = false;
      this.playerController.keys['KeyA'] = false;
      this.playerController.keys['KeyD'] = false;
    };
    
    joystick.addEventListener('touchstart', handleStart);
    joystick.addEventListener('touchmove', handleMove);
    joystick.addEventListener('touchend', handleEnd);
    joystick.addEventListener('mousedown', handleStart);
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
  }
  
  setupJumpButton(btn) {
    btn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.playerController.keys['Space'] = true;
    });
    
    btn.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.playerController.keys['Space'] = false;
    });
  }
  
  destroy() {
    const container = document.getElementById('mobile-game-controls');
    if (container) {
      container.remove();
    }
  }
}
