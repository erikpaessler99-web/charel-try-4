export class UI {
  constructor() {
    this.createUI();
    this.artifactsCollected = 0;
    this.totalArtifacts = 5;
  }
  
  createUI() {
    // Main UI container
    const uiContainer = document.createElement('div');
    uiContainer.id = 'ui';
    
    // Artifacts counter
    const counter = document.createElement('div');
    counter.id = 'artifacts-count';
    counter.innerHTML = `ARTIFACTS: <span id="collected">0</span>/<span id="total">5</span>`;
    uiContainer.appendChild(counter);
    
    // Progress message
    const progressMsg = document.createElement('div');
    progressMsg.id = 'progress-message';
    progressMsg.textContent = 'EXIT UNLOCKED! Head to the door!';
    uiContainer.appendChild(progressMsg);
    
    document.body.appendChild(uiContainer);
    
    // Instructions
    const instructions = document.createElement('div');
    instructions.id = 'instructions';
    instructions.innerHTML = 'WASD to Move | Mouse to Look | Click to Lock Pointer<br>Collect all artifacts to unlock the exit';
    document.body.appendChild(instructions);
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
  
  showLevelComplete() {
    const instructions = document.getElementById('instructions');
    if (instructions) {
      instructions.innerHTML = 'LEVEL COMPLETE!<br>Entering next room...';
      instructions.style.background = 'rgba(0,150,0,0.8)';
      instructions.style.fontSize = '24px';
    }
  }
}
