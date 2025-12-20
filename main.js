import * as THREE from 'three';
import { PlayerController, FirstPersonCameraController } from './rosie/controls/rosieControls.js';
import { CONFIG } from './config.js';
import { Room } from './Room.js';
import { Avatar } from './Avatar.js';
import { Artifact } from './Artifact.js';
import { UI } from './UI.js';

class Game {
  constructor() {
    this.setupScene();
    this.setupCamera();
    this.setupRenderer();
    this.setupPlayer();
    this.setupWorld();
    this.setupUI();
    
    this.clock = new THREE.Clock();
    this.gameTime = 0;
    this.levelComplete = false;
    this.transitioning = false;
    
    this.animate();
  }
  
  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0014);
    this.scene.fog = new THREE.Fog(0x0a0014, 10, 50);
  }
  
  setupCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
  }
  
  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(this.renderer.domElement);
    
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }
  
  setupPlayer() {
    // Create invisible player object (camera will be at its position)
    const playerGeometry = new THREE.BoxGeometry(1, 2, 1);
    const playerMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xff0000,
      visible: false 
    });
    this.player = new THREE.Mesh(playerGeometry, playerMaterial);
    this.player.position.set(0, CONFIG.PLAYER_EYE_HEIGHT, CONFIG.ROOM_DEPTH / 2 - 5);
    this.scene.add(this.player);
    
    // Setup controllers
    this.playerController = new PlayerController(this.player, {
      moveSpeed: CONFIG.PLAYER_MOVE_SPEED,
      jumpForce: 0, // No jumping in this game
      gravity: 0,
      groundLevel: CONFIG.PLAYER_EYE_HEIGHT
    });
    
    this.cameraController = new FirstPersonCameraController(
      this.camera,
      this.player,
      this.renderer.domElement,
      {
        eyeHeight: 0, // Camera is already at player height
        mouseSensitivity: 0.002
      }
    );
    
    // Enable first-person mode
    this.playerController.setCameraMode('first-person');
    this.cameraController.enable();
  }
  
  setupWorld() {
    // Create room
    this.room = new Room(this.scene);
    
    // Create avatars (dancing crowd)
    this.avatars = [];
    const spacing = 4;
    const rows = 5;
    const cols = 6;
    const startX = -(cols - 1) * spacing / 2;
    const startZ = -CONFIG.ROOM_DEPTH / 2 + 10;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = startX + col * spacing + (Math.random() - 0.5) * 2;
        const z = startZ + row * spacing + (Math.random() - 0.5) * 2;
        const avatar = new Avatar(
          this.scene,
          new THREE.Vector3(x, 0, z),
          false
        );
        this.avatars.push(avatar);
      }
    }
    
    // Create DJ at the back
    this.dj = new Avatar(
      this.scene,
      new THREE.Vector3(0, 0, -CONFIG.ROOM_DEPTH / 2 + 2),
      true
    );
    this.avatars.push(this.dj);
    
    // Create artifacts scattered around the room
    this.artifacts = [];
    const artifactPositions = [
      new THREE.Vector3(-15, 2, -10),
      new THREE.Vector3(15, 2, -5),
      new THREE.Vector3(-10, 2, 5),
      new THREE.Vector3(10, 2, 10),
      new THREE.Vector3(0, 2, -25)
    ];
    
    artifactPositions.forEach(pos => {
      const artifact = new Artifact(this.scene, pos);
      this.artifacts.push(artifact);
    });
  }
  
  setupUI() {
    this.ui = new UI();
    this.ui.updateArtifactCount(0, CONFIG.ARTIFACT_COUNT);
  }
  
  checkAvatarCollisions() {
    // Check distance to all avatars and slow player if close
    let nearAvatar = false;
    
    for (const avatar of this.avatars) {
      const avatarPos = avatar.getPosition();
      const playerPos = this.player.position;
      const distance = new THREE.Vector2(
        playerPos.x - avatarPos.x,
        playerPos.z - avatarPos.z
      ).length();
      
      if (distance < CONFIG.SLOW_RADIUS) {
        nearAvatar = true;
        break;
      }
    }
    
    // Adjust player speed based on proximity to avatars
    if (nearAvatar) {
      this.playerController.moveSpeed = CONFIG.PLAYER_SLOWED_SPEED;
    } else {
      this.playerController.moveSpeed = CONFIG.PLAYER_MOVE_SPEED;
    }
  }
  
  checkArtifactCollection() {
    let collectedCount = 0;
    
    for (const artifact of this.artifacts) {
      if (artifact.collected) {
        collectedCount++;
      } else if (artifact.checkCollision(this.player.position)) {
        collectedCount++;
      }
    }
    
    this.ui.updateArtifactCount(collectedCount, CONFIG.ARTIFACT_COUNT);
    
    // Show exit door when all artifacts collected
    if (collectedCount === CONFIG.ARTIFACT_COUNT && !this.levelComplete) {
      this.levelComplete = true;
      this.room.showExitDoor();
    }
  }
  
  checkExitCollision() {
    if (!this.levelComplete || this.transitioning) return;
    
    if (this.room.checkExitCollision(this.player.position)) {
      this.transitioning = true;
      this.ui.showLevelComplete();
      
      // Fade to white and reset after delay
      setTimeout(() => {
        this.resetLevel();
      }, 2000);
    }
  }
  
  resetLevel() {
    // Reset player position
    this.player.position.set(0, CONFIG.PLAYER_EYE_HEIGHT, CONFIG.ROOM_DEPTH / 2 - 5);
    
    // Remove old artifacts
    this.artifacts.forEach(artifact => {
      if (!artifact.collected) {
        this.scene.remove(artifact.group);
      }
    });
    
    // Create new artifacts in different positions
    this.artifacts = [];
    const newPositions = [
      new THREE.Vector3(-12, 2, -15),
      new THREE.Vector3(18, 2, -8),
      new THREE.Vector3(-8, 2, 3),
      new THREE.Vector3(12, 2, 12),
      new THREE.Vector3(5, 2, -20)
    ];
    
    newPositions.forEach(pos => {
      const artifact = new Artifact(this.scene, pos);
      this.artifacts.push(artifact);
    });
    
    // Hide exit door
    this.room.exitDoor.visible = false;
    
    // Reset state
    this.levelComplete = false;
    this.transitioning = false;
    this.ui.updateArtifactCount(0, CONFIG.ARTIFACT_COUNT);
    
    // Reset instructions
    const instructions = document.getElementById('instructions');
    if (instructions) {
      instructions.innerHTML = 'WASD to Move | Mouse to Look | Click to Lock Pointer<br>Collect all artifacts to unlock the exit';
      instructions.style.background = 'rgba(0,0,0,0.7)';
      instructions.style.fontSize = '16px';
    }
  }
  
  update() {
    const deltaTime = this.clock.getDelta();
    this.gameTime += deltaTime;
    
    // Update controllers
    const cameraRotation = this.cameraController.update();
    this.playerController.update(deltaTime, cameraRotation);
    
    // Keep player within room bounds
    const halfWidth = CONFIG.ROOM_WIDTH / 2 - 2;
    const halfDepth = CONFIG.ROOM_DEPTH / 2 - 2;
    this.player.position.x = Math.max(-halfWidth, Math.min(halfWidth, this.player.position.x));
    this.player.position.z = Math.max(-halfDepth, Math.min(halfDepth, this.player.position.z));
    
    // Update world
    this.room.update(deltaTime, this.gameTime);
    this.avatars.forEach(avatar => avatar.update(deltaTime, this.gameTime));
    this.artifacts.forEach(artifact => artifact.update(deltaTime, this.gameTime));
    
    // Check collisions
    this.checkAvatarCollisions();
    this.checkArtifactCollection();
    this.checkExitCollision();
  }
  
  animate() {
    requestAnimationFrame(() => this.animate());
    this.update();
    this.renderer.render(this.scene, this.camera);
  }
}

// Start the game
new Game();
