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
    this.player.position.set(0, 0.1, CONFIG.ROOM_DEPTH / 2 - 8); // Very low y position
    this.scene.add(this.player);
    
    // Setup controllers
    this.playerController = new PlayerController(this.player, {
      moveSpeed: CONFIG.PLAYER_MOVE_SPEED,
      jumpForce: 0,
      gravity: 0,
      groundLevel: 0.1 // Match the very low y position
    });
    
    this.cameraController = new FirstPersonCameraController(
      this.camera,
      this.player,
      this.renderer.domElement,
      {
        eyeHeight: 1.35, // Shoulder level - below avatar heads (~1.5m) for crowd navigation feel
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
      // 1. Check if the event originated specifically from an input field
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        e.stopPropagation(); // Stop the event from reaching other listeners
        return; // Allow the default typing action to happen
      }

      // 2. Check if modal is visible (using getComputedStyle handles CSS classes better than style.display)
      const modal = document.getElementById('password-modal');
      const isModalOpen = modal && window.getComputedStyle(modal).display !== 'none';

      // If modal is open, do not process game interaction keys
      if (isModalOpen) {
        return;
      }

      // 3. Handle Game Interaction
      if (e.key === 'e' || e.key === 'E') {
        this.handleDoorInteraction();
      }
    });
  }
  
  handleDoorInteraction() {
    // Double check: don't interact if UI says modal is open
    if (this.ui && this.ui.isPasswordModalOpen()) return;

    // Check if near door
    if (this.room.checkExitCollision(this.player.position)) {
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
      // Store the message index on the artifact
      artifact.messageIndex = i;
      artifact.messageShown = false; // Track if message was shown
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
    
    // Use indexed loop to get artifact index for correct message
    for (let i = 0; i < this.artifacts.length; i++) {
      const artifact = this.artifacts[i];
      if (artifact.collected) {
        collectedCount++;
      } else if (artifact.checkCollision(this.player.position)) {
        // This artifact is being collected RIGHT NOW
        // Only show message if we haven't shown it yet
        if (!artifact.messageShown) {
          this.ui.showCollectionMessage(artifact.messageIndex);
          artifact.messageShown = true;
        }
        collectedCount++;
      }
    }
    
    this.ui.updateArtifactCount(collectedCount, CONFIG.ARTIFACT_COUNT);
    
    // Show exit door glow when all artifacts collected
    if (collectedCount === CONFIG.ARTIFACT_COUNT && !this.levelComplete) {
      this.levelComplete = true;
      this.room.showExitDoor();
    }
  }
  
  checkExitCollision() {
    if (!this.ui) return;

    // Check proximity for UI feedback
    const nearDoor = this.room.checkExitCollision(this.player.position);
    
    // Only show "Press E" if near door AND the password modal isn't already open
    const isModalOpen = this.ui.isPasswordModalOpen();
    
    if (nearDoor && !isModalOpen) {
      this.ui.showInteractionPrompt(true);
    } else {
      this.ui.showInteractionPrompt(false);
    }
  }
  
  resetLevel() {
    // Reset player position
    this.player.position.set(0, 0.1, CONFIG.ROOM_DEPTH / 2 - 8); // Very low y position
    
    // Remove old artifacts
    this.artifacts.forEach(artifact => {
      if (!artifact.collected) {
        this.scene.remove(artifact.group);
      }
    });
    
    // Create new artifacts
    this.artifacts = [];
    this.createArtifacts();
    
    // Reset state
    this.levelComplete = false;
    this.transitioning = false;
    this.ui.updateArtifactCount(0, CONFIG.ARTIFACT_COUNT);
    
    // Reset instructions
    const instructions = document.getElementById('instructions');
    if (instructions) {
      instructions.innerHTML = 'WASD, Touchpad & Swipe, Maus zum Umgucken und Bewegen <br>Sammle alle Artefakte um Buchstaben für das Passwort zu erhalten!';
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

// Hide instructions after 5 seconds
setTimeout(() => {
  const instructions = document.getElementById('instructions');
  if (instructions) {
    instructions.style.display = 'none';
  }
}, 5000);
