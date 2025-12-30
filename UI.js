export class UI {
  constructor() {
    this.createUI();
    this.artifactsCollected = 0;
    this.totalArtifacts = 6;
    this.messageTimeout = null;
    this.messageFadeTimeout = null;
    this.currentMessageIndex = null;
    this.collectionMessages = [
      "Ui, ui! Ist das Sisyphos heute gut gefüllt. - Buchstabe: B",
      "Hier steppt der Bär! - Buchstabe: E",
      "Ich muss mal aufs Klo. Ich komm gleich wieder. - Buchstabe: R",
      "Kippe? - Buchstabe: L",
      "Willst du ne Pommes? - Buchstabe: I",
      "Wäre es eigentlich voll cringe wenn ich dich jetzt küssen würde? - Buchstabe: N"
    ];
  }
  
  createUI() {
    // Main UI container
    const uiContainer = document.createElement('div');
    uiContainer.id = 'ui';
    
    // Artifacts counter
    const counter = document.createElement('div');
    counter.id = 'artifacts-count';
    counter.innerHTML = `ARTIFACTS: <span id="collected">0</span>/<span id="total">6</span>`;
    uiContainer.appendChild(counter);
    
    // Collection message
    const collectionMsg = document.createElement('div');
    collectionMsg.id = 'collection-message';
    collectionMsg.style.display = 'none';
    uiContainer.appendChild(collectionMsg);
    
    // Progress message
    const progressMsg = document.createElement('div');
    progressMsg.id = 'progress-message';
    progressMsg.textContent = 'EXIT UNLOCKED! Press E at the door to enter password!';
    uiContainer.appendChild(progressMsg);
    
    document.body.appendChild(uiContainer);
    
    // Interaction Prompt (Floating text bubble)
    const interactionPrompt = document.createElement('div');
    interactionPrompt.id = 'interaction-prompt';
    interactionPrompt.textContent = 'PRESS E TO ENTER PASSWORD';
    document.body.appendChild(interactionPrompt);
    
    // Instructions
    const instructions = document.createElement('div');
    instructions.id = 'instructions';
    instructions.innerHTML = 'WASD und Touchpad zum bewegen, Maus / Swipe um dich umzuschauen. <br>Sammel alle Artifakte ein um Buchstaben für das Passwort zu erhalten!';
    document.body.appendChild(instructions);
    
    // Password modal
    this.createPasswordModal();
  }
  
  createPasswordModal() {
    const modal = document.createElement('div');
    modal.id = 'password-modal';
    modal.style.display = 'none';
    modal.innerHTML = `
      <div class="modal-content">
        <h2>ENTER PASSWORD</h2>
        <input type="text" id="password-input" maxlength="6" placeholder="6 LETTERS">
        <div id="password-error"></div>
        <button id="password-submit">SUBMIT</button>
        <button id="password-cancel">CANCEL</button>
      </div>
    `;
    document.body.appendChild(modal);
    
    // Event listeners
    document.getElementById('password-submit').addEventListener('click', () => {
      this.checkPassword();
    });
    
    document.getElementById('password-cancel').addEventListener('click', () => {
      this.hidePasswordModal();
    });
    
    document.getElementById('password-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.checkPassword();
      }
    });
  }
  
  // Helper to check state
  isPasswordModalOpen() {
    const modal = document.getElementById('password-modal');
    return modal && modal.style.display === 'flex';
  }
  
  showInteractionPrompt(show) {
    const el = document.getElementById('interaction-prompt');
    if (el) {
      el.style.display = show ? 'block' : 'none';
    }
  }
  
  showPasswordModal() {
    const modal = document.getElementById('password-modal');
    modal.style.display = 'flex';
    document.getElementById('password-input').value = '';
    document.getElementById('password-error').textContent = '';
    document.getElementById('password-input').focus();
    
    // Hide the prompt when modal is open
    this.showInteractionPrompt(false);
    
    // Unlock pointer when modal opens
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  }
  
  hidePasswordModal() {
    const modal = document.getElementById('password-modal');
    modal.style.display = 'none';
  }
  
  checkPassword() {
    const input = document.getElementById('password-input').value.toUpperCase();
    const correctPassword = 'BERLIN';
    const errorDiv = document.getElementById('password-error');
    
    if (input === correctPassword) {
      // Success!
      window.location.href = 'https://erikpaessler99-web.github.io/charel-end/';
    } else {
      // Failure
      errorDiv.textContent = 'INCORRECT PASSWORD';
      errorDiv.style.color = '#ff0000';
      
      // Shake animation
      const modal = document.querySelector('.modal-content');
      modal.style.animation = 'shake 0.5s';
      setTimeout(() => {
        modal.style.animation = '';
      }, 500);
    }
  }
  
  updateArtifactCount(collected, total) {
    this.artifactsCollected = collected;
    this.totalArtifacts = total;
    
    const collectedSpan = document.getElementById('collected');
    if (collectedSpan) {
      collectedSpan.textContent = collected;
    }
    
    const totalSpan = document.getElementById('total');
    if (totalSpan) {
      totalSpan.textContent = total;
    }
    
    // Show progress message when all collected
    if (collected === total) {
      const progressMsg = document.getElementById('progress-message');
      if (progressMsg) {
        progressMsg.style.display = 'block';
      }
    }
  }
  
  showCollectionMessage(index) {
    const msgDiv = document.getElementById('collection-message');
    if (msgDiv && index < this.collectionMessages.length) {
      // Prevent showing the same message if it's already showing
      if (this.currentMessageIndex === index) {
        return;
      }
      
      this.currentMessageIndex = index;
      
      // Cancel any existing timeout
      if (this.messageTimeout) {
        clearTimeout(this.messageTimeout);
      }
      if (this.messageFadeTimeout) {
        clearTimeout(this.messageFadeTimeout);
      }
      
      // Reset opacity and display
      msgDiv.style.opacity = '1';
      msgDiv.style.display = 'block';
      msgDiv.textContent = this.collectionMessages[index];
      
      // Fade out after 20 seconds
      this.messageTimeout = setTimeout(() => {
        msgDiv.style.opacity = '0';
        this.messageFadeTimeout = setTimeout(() => {
          msgDiv.style.display = 'none';
          msgDiv.style.opacity = '1';
          this.currentMessageIndex = null;
        }, 500);
      }, 20000);
    }
  }
  
  showLevelComplete() {
    const instructions = document.getElementById('instructions');
    if (instructions) {
      instructions.innerHTML = 'LEVEL COMPLETE!<br>Entering next room...';
      instructions.style.background = 'rgba(0,150,0,0.8)';
      instructions.style.fontSize = '24px';
    }
  }
}
