import * as THREE from 'three';
import { CONFIG } from './config.js';

export class Artifact {
  constructor(scene, position) {
    this.scene = scene;
    this.collected = false;
    this.timeOffset = Math.random() * Math.PI * 2;
    
    // Create artifact group
    this.group = new THREE.Group();
    
    // Choose a unique color for this artifact
    const colorOptions = [
      0xffff00, // Yellow
      0xff00ff, // Magenta
      0x00ffff, // Cyan
      0xff8800, // Orange
      0x00ff88  // Mint
    ];
    const color = colorOptions[Math.floor(Math.random() * colorOptions.length)];
    
    // Main crystal shape - small and subtle
    const geometry = new THREE.IcosahedronGeometry(0.15, 1);
    const material = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.9,
      metalness: 0.9,
      roughness: 0.1,
      transparent: true,
      opacity: 0.95
    });
    this.crystal = new THREE.Mesh(geometry, material);
    this.crystal.castShadow = true;
    this.group.add(this.crystal);
    
    // Inner core
    const coreGeometry = new THREE.IcosahedronGeometry(0.08, 0);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    this.core = new THREE.Mesh(coreGeometry, coreMaterial);
    this.group.add(this.core);
    
    // Outer glow rings - smaller
    const rings = [];
    for (let i = 0; i < 3; i++) {
      const ringGeometry = new THREE.TorusGeometry(0.2 + i * 0.04, 0.015, 8, 16);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.4 - i * 0.1,
        blending: THREE.AdditiveBlending
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = Math.PI / 2 + (i * Math.PI / 6);
      ring.rotation.y = i * Math.PI / 4;
      this.group.add(ring);
      rings.push(ring);
    }
    this.rings = rings;
    
    // Particle system around artifact
    this.createParticles(color);
    
    // Point light for glow effect
    this.light = new THREE.PointLight(color, 1.5, 4);
    this.group.add(this.light);
    
    // Outer glow sphere - small
    const glowGeometry = new THREE.SphereGeometry(0.35, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending
    });
    this.glow = new THREE.Mesh(glowGeometry, glowMaterial);
    this.group.add(this.glow);
    
    this.group.position.copy(position);
    this.initialY = position.y;
    
    scene.add(this.group);
  }
  
  createParticles(color) {
    const particleCount = 12;
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const velocities = [];
    
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const radius = 0.25;
      
      positions.push(
        Math.sin(phi) * Math.cos(theta) * radius,
        Math.sin(phi) * Math.sin(theta) * radius,
        Math.cos(phi) * radius
      );
      
      velocities.push(
        (Math.random() - 0.5) * 0.008,
        (Math.random() - 0.5) * 0.008,
        (Math.random() - 0.5) * 0.008
      );
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
      size: 0.025,
      color: color,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });
    
    this.particles = new THREE.Points(geometry, material);
    this.particleVelocities = velocities;
    this.group.add(this.particles);
  }
  
  update(deltaTime, gameTime) {
    if (this.collected) return;
    
    // Rotate crystal on multiple axes
    this.crystal.rotation.y += deltaTime * CONFIG.ARTIFACT_ROTATION_SPEED;
    this.crystal.rotation.x += deltaTime * CONFIG.ARTIFACT_ROTATION_SPEED * 0.7;
    this.crystal.rotation.z += deltaTime * CONFIG.ARTIFACT_ROTATION_SPEED * 0.3;
    
    // Counter-rotate core
    this.core.rotation.y -= deltaTime * CONFIG.ARTIFACT_ROTATION_SPEED * 1.5;
    this.core.rotation.x -= deltaTime * CONFIG.ARTIFACT_ROTATION_SPEED;
    
    // Float up and down
    const floatPhase = gameTime * CONFIG.ARTIFACT_FLOAT_SPEED + this.timeOffset;
    const floatY = Math.sin(floatPhase) * CONFIG.ARTIFACT_FLOAT_HEIGHT;
    this.group.position.y = this.initialY + floatY;
    
    // Pulsing glow
    const pulse = Math.sin(gameTime * 3 + this.timeOffset) * 0.4 + 0.6;
    this.crystal.material.emissiveIntensity = pulse * 1.2;
    this.light.intensity = pulse * 4 + 2;
    this.glow.material.opacity = pulse * 0.2 + 0.1;
    
    // Rotate rings at different speeds
    this.rings.forEach((ring, index) => {
      ring.rotation.z += deltaTime * (1 + index * 0.5);
      ring.rotation.y += deltaTime * (0.5 - index * 0.2);
    });
    
    // Animate particles
    if (this.particles && this.particleVelocities) {
      const positions = this.particles.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += this.particleVelocities[i];
        positions[i + 1] += this.particleVelocities[i + 1];
        positions[i + 2] += this.particleVelocities[i + 2];
        
        // Reset particle if too far
        const dist = Math.sqrt(
          positions[i] ** 2 + 
          positions[i + 1] ** 2 + 
          positions[i + 2] ** 2
        );
        if (dist > 0.4) {
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.random() * Math.PI;
          positions[i] = Math.sin(phi) * Math.cos(theta) * 0.2;
          positions[i + 1] = Math.sin(phi) * Math.sin(theta) * 0.2;
          positions[i + 2] = Math.cos(phi) * 0.2;
        }
      }
      this.particles.geometry.attributes.position.needsUpdate = true;
    }
    
    // Rotate entire particle system
    if (this.particles) {
      this.particles.rotation.y += deltaTime * 0.5;
    }
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
    
    // Create collection effect before removing
    const burstCount = 30;
    const burstGeometry = new THREE.BufferGeometry();
    const positions = [];
    
    for (let i = 0; i < burstCount; i++) {
      positions.push(
        this.group.position.x,
        this.group.position.y,
        this.group.position.z
      );
    }
    
    burstGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    
    const burstMaterial = new THREE.PointsMaterial({
      size: 0.15,
      color: this.crystal.material.color,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending
    });
    
    const burst = new THREE.Points(burstGeometry, burstMaterial);
    this.scene.add(burst);
    
    // Animate burst
    let burstTime = 0;
    const animateBurst = () => {
      burstTime += 0.016;
      if (burstTime > 1) {
        this.scene.remove(burst);
        return;
      }
      
      const positions = burst.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += (Math.random() - 0.5) * 0.3;
        positions[i + 1] += Math.random() * 0.3;
        positions[i + 2] += (Math.random() - 0.5) * 0.3;
      }
      burst.geometry.attributes.position.needsUpdate = true;
      burst.material.opacity = 1 - burstTime;
      
      requestAnimationFrame(animateBurst);
    };
    animateBurst();
    
    this.scene.remove(this.group);
  }
  
  getPosition() {
    return this.group.position;
  }
}
