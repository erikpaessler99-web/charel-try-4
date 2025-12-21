import * as THREE from 'three';
import { CONFIG } from './config.js';

export class Room {
  constructor(scene) {
    this.scene = scene;
    this.createRoom();
    this.createLights();
    this.createParticles();
    this.createLaserBeams();
  }
  
  createRoom() {
    const w = CONFIG.ROOM_WIDTH;
    const d = CONFIG.ROOM_DEPTH;
    const h = CONFIG.ROOM_HEIGHT;
    
    // Floor - dark with reflective surface
    const floorGeometry = new THREE.PlaneGeometry(w, d);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x050505,
      metalness: 0.9,
      roughness: 0.1,
      envMapIntensity: 1
    });
    this.floor = new THREE.Mesh(floorGeometry, floorMaterial);
    this.floor.rotation.x = -Math.PI / 2;
    this.floor.position.y = 0;
    this.floor.receiveShadow = true;
    this.scene.add(this.floor);
    
    // Ceiling with grid pattern
    const ceilingMaterial = new THREE.MeshStandardMaterial({
      color: 0x0a0a0a,
      metalness: 0.6,
      roughness: 0.4,
      side: THREE.DoubleSide
    });
    this.ceiling = new THREE.Mesh(floorGeometry, ceilingMaterial);
    this.ceiling.rotation.x = Math.PI / 2;
    this.ceiling.position.y = h;
    this.scene.add(this.ceiling);
    
    // Walls with gradient
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f0f1a,
      metalness: 0.4,
      roughness: 0.6,
      emissive: 0x0a0015,
      emissiveIntensity: 0.2
    });
    
    // Back wall (where DJ is)
    const backWallGeometry = new THREE.PlaneGeometry(w, h);
    this.backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
    this.backWall.position.set(0, h/2, -d/2);
    this.scene.add(this.backWall);
    
    // Front wall
    this.frontWall = new THREE.Mesh(backWallGeometry, wallMaterial.clone());
    this.frontWall.position.set(0, h/2, d/2);
    this.frontWall.rotation.y = Math.PI;
    this.scene.add(this.frontWall);
    
    // Side walls
    const sideWallGeometry = new THREE.PlaneGeometry(d, h);
    
    this.leftWall = new THREE.Mesh(sideWallGeometry, wallMaterial.clone());
    this.leftWall.position.set(-w/2, h/2, 0);
    this.leftWall.rotation.y = Math.PI / 2;
    this.scene.add(this.leftWall);
    
    this.rightWall = new THREE.Mesh(sideWallGeometry, wallMaterial.clone());
    this.rightWall.position.set(w/2, h/2, 0);
    this.rightWall.rotation.y = -Math.PI / 2;
    this.scene.add(this.rightWall);
    
    // Exit door
    this.createExitDoor();
  }
  
  createExitDoor() {
    const doorGroup = new THREE.Group();
    
    // Door frame with glow
    const frameGeometry = new THREE.BoxGeometry(4.5, 7, 0.4);
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ff00,
      emissive: 0x00ff00,
      emissiveIntensity: 0.3,
      metalness: 0.9,
      roughness: 0.1
    });
    const doorFrame = new THREE.Mesh(frameGeometry, frameMaterial);
    doorGroup.add(doorFrame);
    
    // Door itself
    const doorGeometry = new THREE.BoxGeometry(4, 6.5, 0.3);
    const doorMaterial = new THREE.MeshStandardMaterial({
      color: 0x002200,
      emissive: 0x00ff00,
      emissiveIntensity: 0.1,
      metalness: 0.7,
      roughness: 0.3
    });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.z = 0.15;
    doorGroup.add(door);
    
    // Position at front wall
    doorGroup.position.set(0, 3.5, CONFIG.ROOM_DEPTH / 2 - 0.6);
    doorGroup.visible = true; // Always visible now
    
    this.exitDoor = doorGroup;
    this.doorFrame = doorFrame;
    this.door = door;
    this.scene.add(doorGroup);
  }
  
  createParticles() {
    // Create floating particle system for atmosphere
    const particleCount = 300;
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const sizes = [];
    
    for (let i = 0; i < particleCount; i++) {
      positions.push(
        (Math.random() - 0.5) * CONFIG.ROOM_WIDTH,
        Math.random() * CONFIG.ROOM_HEIGHT,
        (Math.random() - 0.5) * CONFIG.ROOM_DEPTH
      );
      
      const color = new THREE.Color();
      color.setHSL(Math.random(), 0.8, 0.6);
      colors.push(color.r, color.g, color.b);
      
      sizes.push(Math.random() * 0.15 + 0.05);
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
    
    const material = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });
    
    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }
  
  createLaserBeams() {
    // Create moving laser beams
    this.laserBeams = [];
    const beamCount = 8;
    
    for (let i = 0; i < beamCount; i++) {
      const height = CONFIG.ROOM_HEIGHT;
      const geometry = new THREE.CylinderGeometry(0.05, 0.05, height, 8);
      const color = CONFIG.LIGHT_COLORS[i % CONFIG.LIGHT_COLORS.length];
      const material = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending
      });
      
      const beam = new THREE.Mesh(geometry, material);
      beam.position.y = height / 2;
      beam.position.x = (Math.random() - 0.5) * CONFIG.ROOM_WIDTH * 0.8;
      beam.position.z = (Math.random() - 0.5) * CONFIG.ROOM_DEPTH * 0.8;
      
      this.scene.add(beam);
      this.laserBeams.push({
        mesh: beam,
        baseColor: color,
        rotationSpeed: (Math.random() - 0.5) * 0.5,
        moveRadius: Math.random() * 10 + 5,
        moveSpeed: Math.random() * 0.3 + 0.2,
        timeOffset: Math.random() * Math.PI * 2
      });
    }
  }
  
  createLights() {
    // Ambient light (very dim for atmosphere)
    const ambientLight = new THREE.AmbientLight(0x222244, 0.4);
    this.scene.add(ambientLight);
    
    // Create multiple colored spotlights
    this.spotlights = [];
    const lightPositions = [
      { x: -20, y: 13, z: -30, color: 0xff00ff, angle: Math.PI / 3 },
      { x: 20, y: 13, z: -30, color: 0x00ffff, angle: Math.PI / 3 },
      { x: -20, y: 13, z: -10, color: 0xff0080, angle: Math.PI / 3.5 },
      { x: 20, y: 13, z: -10, color: 0x00ff00, angle: Math.PI / 3.5 },
      { x: -15, y: 13, z: 10, color: 0xff8000, angle: Math.PI / 4 },
      { x: 15, y: 13, z: 10, color: 0x8000ff, angle: Math.PI / 4 },
      { x: 0, y: 13, z: 25, color: 0xff0000, angle: Math.PI / 3 },
      { x: -10, y: 13, z: 15, color: 0x0080ff, angle: Math.PI / 3.5 }
    ];
    
    lightPositions.forEach(pos => {
      const spotlight = new THREE.SpotLight(pos.color, 0, 40, pos.angle, 0.6);
      spotlight.position.set(pos.x, pos.y, pos.z);
      spotlight.target.position.set(pos.x, 0, pos.z);
      spotlight.castShadow = true;
      this.scene.add(spotlight);
      this.scene.add(spotlight.target);
      this.spotlights.push({
        light: spotlight,
        baseColor: pos.color,
        timeOffset: Math.random() * Math.PI * 2,
        target: spotlight.target
      });
    });
    
    // Special light for DJ area
    this.djLight = new THREE.SpotLight(0xff00ff, 4, 30, Math.PI / 2.5, 0.7);
    this.djLight.position.set(0, 12, -CONFIG.ROOM_DEPTH / 2 + 5);
    this.djLight.target.position.set(0, 0, -CONFIG.ROOM_DEPTH / 2 + 2);
    this.scene.add(this.djLight);
    this.scene.add(this.djLight.target);
  }
  
  update(deltaTime, gameTime) {
    // Animate particles
    if (this.particles) {
      const positions = this.particles.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += Math.sin(gameTime + i) * 0.01;
        if (positions[i + 1] > CONFIG.ROOM_HEIGHT) {
          positions[i + 1] = 0;
        }
      }
      this.particles.geometry.attributes.position.needsUpdate = true;
      this.particles.rotation.y += deltaTime * 0.05;
    }
    
    // Animate laser beams
    this.laserBeams.forEach((laser, index) => {
      const phase = gameTime * laser.moveSpeed + laser.timeOffset;
      laser.mesh.position.x = Math.cos(phase) * laser.moveRadius;
      laser.mesh.position.z = Math.sin(phase) * laser.moveRadius;
      laser.mesh.rotation.y += deltaTime * laser.rotationSpeed;
      
      // Pulsing opacity
      const pulse = (Math.sin(gameTime * 3 + laser.timeOffset) + 1) * 0.15 + 0.2;
      laser.mesh.material.opacity = pulse;
    });
    
    // Flash lights
    this.spotlights.forEach((spotlight, index) => {
      const flashPhase = gameTime * CONFIG.LIGHT_FLASH_SPEED + spotlight.timeOffset;
      const intensity = (Math.sin(flashPhase) + 1) * 12 + 5;
      spotlight.light.intensity = intensity;
      
      // Occasionally change color
      if (Math.floor(gameTime * 0.4) !== this.lastColorChange) {
        const colorIndex = Math.floor(Math.random() * CONFIG.LIGHT_COLORS.length);
        spotlight.light.color.setHex(CONFIG.LIGHT_COLORS[colorIndex]);
      }
      
      // Move spotlight targets slightly
      const targetPhase = gameTime * 0.5 + spotlight.timeOffset;
      spotlight.target.position.x += Math.sin(targetPhase) * 0.1;
      spotlight.target.position.z += Math.cos(targetPhase) * 0.1;
    });
    
    this.lastColorChange = Math.floor(gameTime * 0.4);
    
    // DJ light pulse
    const djPulse = (Math.sin(gameTime * 2.5) + 1) * 2 + 1.5;
    this.djLight.intensity = djPulse;
    
    // Pulse wall emissive
    const wallPulse = (Math.sin(gameTime * 0.8) + 1) * 0.15 + 0.1;
    this.leftWall.material.emissiveIntensity = wallPulse;
    this.rightWall.material.emissiveIntensity = wallPulse;
    this.backWall.material.emissiveIntensity = wallPulse;
    this.frontWall.material.emissiveIntensity = wallPulse;
  }
  
  showExitDoor() {
    this.exitDoor.visible = true;
    // Animate door appearance - make it glow brighter
    this.doorFrame.material.emissiveIntensity = 0.8;
    this.door.material.emissiveIntensity = 0.4;
  }
  
  checkExitCollision(playerPosition) {
    // UPDATED: Removed the visibility check so the door is always interactable
    const doorPos = this.exitDoor.position;
    const distance = new THREE.Vector2(
      playerPosition.x - doorPos.x,
      playerPosition.z - doorPos.z
    ).length();
    
    return distance < 3;
  }
}
