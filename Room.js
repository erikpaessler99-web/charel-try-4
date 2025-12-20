import * as THREE from 'three';
import { CONFIG } from './config.js';

export class Room {
  constructor(scene) {
    this.scene = scene;
    this.createRoom();
    this.createLights();
  }
  
  createRoom() {
    const w = CONFIG.ROOM_WIDTH;
    const d = CONFIG.ROOM_DEPTH;
    const h = CONFIG.ROOM_HEIGHT;
    
    // Floor
    const floorGeometry = new THREE.PlaneGeometry(w, d);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x0a0a0a,
      metalness: 0.8,
      roughness: 0.2
    });
    this.floor = new THREE.Mesh(floorGeometry, floorMaterial);
    this.floor.rotation.x = -Math.PI / 2;
    this.floor.position.y = 0;
    this.scene.add(this.floor);
    
    // Ceiling
    const ceilingMaterial = new THREE.MeshStandardMaterial({
      color: 0x0a0a0a,
      metalness: 0.5,
      roughness: 0.8,
      side: THREE.DoubleSide
    });
    this.ceiling = new THREE.Mesh(floorGeometry, ceilingMaterial);
    this.ceiling.rotation.x = Math.PI / 2;
    this.ceiling.position.y = h;
    this.scene.add(this.ceiling);
    
    // Walls
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      metalness: 0.3,
      roughness: 0.7
    });
    
    // Back wall (where DJ is)
    const backWallGeometry = new THREE.PlaneGeometry(w, h);
    this.backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
    this.backWall.position.set(0, h/2, -d/2);
    this.scene.add(this.backWall);
    
    // Front wall
    this.frontWall = new THREE.Mesh(backWallGeometry, wallMaterial);
    this.frontWall.position.set(0, h/2, d/2);
    this.frontWall.rotation.y = Math.PI;
    this.scene.add(this.frontWall);
    
    // Side walls
    const sideWallGeometry = new THREE.PlaneGeometry(d, h);
    
    this.leftWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
    this.leftWall.position.set(-w/2, h/2, 0);
    this.leftWall.rotation.y = Math.PI / 2;
    this.scene.add(this.leftWall);
    
    this.rightWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
    this.rightWall.position.set(w/2, h/2, 0);
    this.rightWall.rotation.y = -Math.PI / 2;
    this.scene.add(this.rightWall);
    
    // Exit door (appears when all artifacts collected)
    this.createExitDoor();
  }
  
  createExitDoor() {
    const doorGroup = new THREE.Group();
    
    // Door frame
    const frameGeometry = new THREE.BoxGeometry(4, 6, 0.3);
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ff00,
      emissive: 0x00ff00,
      emissiveIntensity: 0,
      metalness: 0.8,
      roughness: 0.2
    });
    const doorFrame = new THREE.Mesh(frameGeometry, frameMaterial);
    doorGroup.add(doorFrame);
    
    // Door itself
    const doorGeometry = new THREE.BoxGeometry(3.5, 5.5, 0.2);
    const doorMaterial = new THREE.MeshStandardMaterial({
      color: 0x004400,
      emissive: 0x00ff00,
      emissiveIntensity: 0,
      metalness: 0.5,
      roughness: 0.5
    });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.z = 0.1;
    doorGroup.add(door);
    
    // Position at front wall
    doorGroup.position.set(0, 3, CONFIG.ROOM_DEPTH / 2 - 0.5);
    doorGroup.visible = false;
    
    this.exitDoor = doorGroup;
    this.doorFrame = doorFrame;
    this.door = door;
    this.scene.add(doorGroup);
  }
  
  createLights() {
    // Ambient light (very dim)
    const ambientLight = new THREE.AmbientLight(0x222244, 0.3);
    this.scene.add(ambientLight);
    
    // Create multiple colored spotlights
    this.spotlights = [];
    const lightPositions = [
      { x: -15, y: 10, z: -20, color: 0xff00ff },
      { x: 15, y: 10, z: -20, color: 0x00ffff },
      { x: -15, y: 10, z: 0, color: 0xff0080 },
      { x: 15, y: 10, z: 0, color: 0x00ff00 },
      { x: 0, y: 10, z: 20, color: 0xff8000 },
      { x: -10, y: 10, z: 10, color: 0x8000ff }
    ];
    
    lightPositions.forEach(pos => {
      const spotlight = new THREE.SpotLight(pos.color, 0, 30, Math.PI / 4, 0.5);
      spotlight.position.set(pos.x, pos.y, pos.z);
      spotlight.target.position.set(pos.x, 0, pos.z);
      this.scene.add(spotlight);
      this.scene.add(spotlight.target);
      this.spotlights.push({
        light: spotlight,
        baseColor: pos.color,
        timeOffset: Math.random() * Math.PI * 2
      });
    });
    
    // Special light for DJ area
    this.djLight = new THREE.SpotLight(0xff00ff, 3, 25, Math.PI / 3, 0.8);
    this.djLight.position.set(0, 10, -CONFIG.ROOM_DEPTH / 2 + 5);
    this.djLight.target.position.set(0, 0, -CONFIG.ROOM_DEPTH / 2 + 2);
    this.scene.add(this.djLight);
    this.scene.add(this.djLight.target);
  }
  
  update(deltaTime, gameTime) {
    // Flash lights
    this.spotlights.forEach((spotlight, index) => {
      const flashPhase = gameTime * CONFIG.LIGHT_FLASH_SPEED + spotlight.timeOffset;
      const intensity = (Math.sin(flashPhase) + 1) * 15;
      spotlight.light.intensity = intensity;
      
      // Occasionally change color
      if (Math.floor(gameTime * 0.3) !== this.lastColorChange) {
        const colorIndex = Math.floor(Math.random() * CONFIG.LIGHT_COLORS.length);
        spotlight.light.color.setHex(CONFIG.LIGHT_COLORS[colorIndex]);
      }
    });
    
    this.lastColorChange = Math.floor(gameTime * 0.3);
    
    // DJ light pulse
    const djPulse = (Math.sin(gameTime * 2) + 1) * 1.5 + 1;
    this.djLight.intensity = djPulse;
  }
  
  showExitDoor() {
    this.exitDoor.visible = true;
    // Animate door appearance
    this.doorFrame.material.emissiveIntensity = 0.6;
    this.door.material.emissiveIntensity = 0.3;
  }
  
  checkExitCollision(playerPosition) {
    if (!this.exitDoor.visible) return false;
    
    const doorPos = this.exitDoor.position;
    const distance = new THREE.Vector2(
      playerPosition.x - doorPos.x,
      playerPosition.z - doorPos.z
    ).length();
    
    return distance < 3;
  }
}
