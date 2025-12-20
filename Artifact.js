import * as THREE from 'three';
import { CONFIG } from './config.js';

export class Artifact {
  constructor(scene, position) {
    this.scene = scene;
    this.collected = false;
    this.timeOffset = Math.random() * Math.PI * 2;
    
    // Create artifact group
    this.group = new THREE.Group();
    
    // Main crystal shape - octahedron
    const geometry = new THREE.OctahedronGeometry(0.5, 0);
    const material = new THREE.MeshStandardMaterial({
      color: 0xffff00,
      emissive: 0xffff00,
      emissiveIntensity: 0.8,
      metalness: 0.8,
      roughness: 0.2,
      transparent: true,
      opacity: 0.9
    });
    this.crystal = new THREE.Mesh(geometry, material);
    this.group.add(this.crystal);
    
    // Outer glow ring
    const ringGeometry = new THREE.TorusGeometry(0.7, 0.05, 8, 16);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      transparent: true,
      opacity: 0.4
    });
    this.ring = new THREE.Mesh(ringGeometry, ringMaterial);
    this.ring.rotation.x = Math.PI / 2;
    this.group.add(this.ring);
    
    // Point light for glow effect
    this.light = new THREE.PointLight(0xffff00, 2, 8);
    this.group.add(this.light);
    
    this.group.position.copy(position);
    this.initialY = position.y;
    
    scene.add(this.group);
  }
  
  update(deltaTime, gameTime) {
    if (this.collected) return;
    
    // Rotate
    this.crystal.rotation.y += deltaTime * CONFIG.ARTIFACT_ROTATION_SPEED;
    this.crystal.rotation.x += deltaTime * CONFIG.ARTIFACT_ROTATION_SPEED * 0.5;
    
    // Float up and down
    const floatPhase = gameTime * CONFIG.ARTIFACT_FLOAT_SPEED + this.timeOffset;
    const floatY = Math.sin(floatPhase) * CONFIG.ARTIFACT_FLOAT_HEIGHT;
    this.group.position.y = this.initialY + floatY;
    
    // Pulsing glow
    const pulse = Math.sin(gameTime * 3 + this.timeOffset) * 0.3 + 0.7;
    this.crystal.material.emissiveIntensity = pulse;
    this.light.intensity = pulse * 3;
    
    // Ring rotation
    this.ring.rotation.z += deltaTime * 2;
  }
  
  checkCollision(playerPosition) {
    if (this.collected) return false;
    
    const distance = playerPosition.distanceTo(this.group.position);
    if (distance < CONFIG.ARTIFACT_COLLECT_RADIUS) {
      this.collect();
      return true;
    }
    return false;
  }
  
  collect() {
    this.collected = true;
    this.scene.remove(this.group);
  }
  
  getPosition() {
    return this.group.position;
  }
}
