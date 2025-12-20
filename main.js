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
    this.scene.fog = new THREE.FogExp2(0x0a0014, 0.025);
  }
  
  setupCamera() {
    this.camera = new THREE.PerspectiveCamera(
      80, // Wider FOV for immersion
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
  }
  
  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(this.renderer.domElement);
    
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }
  
  setupPlayer() {
    // Create invisible player object
    const playerGeometry = new THREE.BoxGeometry(0.6, 1.7, 0.6);
    const playerMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xff0000,
      visible: false 
    });
    this.player = new THREE.Mesh(playerGeometry, playerMaterial);
    this.player.position.set(0, CONFIG.PLAYER_EYE_HEIGHT, CONFIG.ROOM_DEPTH / 2 - 8);
    this.scene.add(this.player);
    
    // Setup controllers
    this.playerController = new PlayerController(this.player, {
      moveSpeed: CONFIG.PLAYER_MOVE_SPEED,
      jumpForce: 0,
      gravity: 0,
      groundLevel: CONFIG.PLAYER_EYE_HEIGHT
    });
    
    this.cameraController = new FirstPersonCameraController(
      this.camera,
      this.player,
      this.renderer.domElement,
      {
        eyeHeight: 0,
        mouseSensitivity: 0.002
      }
    );
    
    // Enable first-person mode
    this.playerController.setCameraMode('first-person');
    this.cameraController.enable();
    
    // Add E key listener for door interaction
    this.setupKeyListeners();
  }
  
  setupKeyListeners() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'e' || e.key === 'E') {
        this.handleDoorInteraction();
      }
    });
  }
  
  handleDoorInteraction() {
    // Check if near door and all artifacts collected
    if (this.levelComplete && this.room.checkExitCollision(this.player.position)) {
      this.ui.showPasswordModal();
    }
  }
  
  setupWorld() {
    // Create room
    this.room = new Room(this.scene);
    
    // Create avatars spread throughout the entire dance floor
    this.avatars = [];
    this.createCrowd();
    
    // Create DJ at the back
    this.dj = new Avatar(
      this.scene,
      new THREE.Vector3(0, 0, -CONFIG.ROOM_DEPTH / 2 + 3),
      true
    );
    this.avatars.push(this.dj);
    
    // Create artifacts scattered among the crowd
    this.artifacts = [];
    this.createArtifacts();
  }
  
  createCrowd() {
    // Create a more natural, spread-out crowd
    const danceFloorWidth = CONFIG.ROOM_WIDTH - 10;
    const danceFloorDepth = CONFIG.ROOM_DEPTH - 15;
    const avatarCount = CONFIG.AVATAR_COUNT;
    
    // Create clusters of dancers
    const clusterCount = 15;
    const avatarsPerCluster = Math.floor(avatarCount / clusterCount);
    
    for (let cluster = 0; cluster < clusterCount; cluster++) {
      // Random cluster center
      const clusterX = (Math.random() - 0.5) * danceFloorWidth * 0.9;
      const clusterZ = (Math.random() - 0.5) * danceFloorDepth * 0.9 - 5;
      
      for (let i = 0; i < avatarsPerCluster; i++) {
        // Spread around cluster center
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 3 + 0.5;
        
        const x = clusterX + Math.cos(angle) * radius;
        const z = clusterZ + Math.sin(angle) * radius;
        
        // Keep within bounds
        const boundedX = Math.max(-danceFloorWidth/2, Math.min(danceFloorWidth/2, x));
        const boundedZ = Math.max(-danceFloorDepth/2, Math.min(danceFloorDepth/2, z));
        
        const avatar = new Avatar(
          this.scene,
          new THREE.Vector3(boundedX, 0, boundedZ),
          false
        );
        this.avatars.push(avatar);
      }
    }
    
    // Add remaining avatars randomly
    const remaining = avatarCount - (avatarsPerCluster * clusterCount);
    for (let i = 0; i < remaining; i++) {
      const x = (Math.random() - 0.5) * danceFloorWidth;
      const z = (Math.random() - 0.5) * danceFloorDepth - 5;
      
      const avatar = new Avatar(
        this.scene,
        new THREE.Vector3(x, 0, z),
        false
      );
      this.avatars.push(avatar);
    }
  }
  
  createArtifacts() {
    // Place artifacts at head level throughout the crowd
    const danceFloorWidth = CONFIG.ROOM_WIDTH - 10;
    const danceFloorDepth = CONFIG.ROOM_DEPTH - 15;
    
    for (let i = 0; i < CONFIG.ARTIFACT_COUNT; i++) {
      // Random position across the dance floor
      const x = (Math.random() - 0.5) * danceFloorWidth;
      const z = (Math.random() - 0.5) * danceFloorDepth - 5;
      
      // Keep artifacts at head level (1.3-2.0m)
      const y = 1.3 + Math.random() * 0.7;
      
      const artifact = new Artifact(
        this.scene, 
        new THREE.Vector3(x, y, z)
      );
      this.artifacts.push(artifact);
    }
  }
  
  setupUI() {
    this.ui = new UI();
    this.ui.updateArtifactCount(0, CONFIG.ARTIFACT_COUNT);
  }
  
  checkAvatarCollisions() {
    // Check distance to all avatars and slow player if close
    let nearAvatar = false;
    let closestDistance = Infinity;
    
    for (const avatar of this.avatars) {
      const avatarPos = avatar.getPosition();
      const playerPos = this.player.position;
      const distance = new THREE.Vector2(
        playerPos.x - avatarPos.x,
        playerPos.z - avatarPos.z
      ).length();
      
      closestDistance = Math.min(closestDistance, distance);
      
      if (distance < CONFIG.SLOW_RADIUS) {
        nearAvatar = true;
      }
    }
    
    // Gradual speed adjustment based on proximity
    const targetSpeed = nearAvatar ? CONFIG.PLAYER_SLOWED_SPEED : CONFIG.PLAYER_MOVE_SPEED;
    this.playerController.moveSpeed += (targetSpeed - this.playerController.moveSpeed) * 0.1;
  }
  
  checkArtifactCollection() {
    let collectedCount = 0;
    
    for (const artifact of this.artifacts) {
      if (artifact.collected) {
        collectedCount++;
      } else if (artifact.checkCollision(this.player.position)) {
        collectedCount++;
        // Show collection message
        this.ui.showCollectionMessage(collectedCount - 1);
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
    // Door interaction is now handled by E key press
    // This method is kept for compatibility but doesn't auto-redirect
    return false;
  }
  
  resetLevel() {
    // Reset player position
    this.player.position.set(0, CONFIG.PLAYER_EYE_HEIGHT, CONFIG.ROOM_DEPTH / 2 - 8);
    
    // Remove old artifacts
    this.artifacts.forEach(artifact => {
      if (!artifact.collected) {
        this.scene.remove(artifact.group);
      }
    });
    
    // Create new artifacts
    this.artifacts = [];
    this.createArtifacts();
    
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
