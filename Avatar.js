import * as THREE from 'three';
import { CONFIG } from './config.js';

export class Avatar {
  constructor(scene, position, isDJ = false) {
    this.scene = scene;
    this.isDJ = isDJ;
    this.timeOffset = Math.random() * Math.PI * 2;
    
    // Create avatar mesh - realistic human proportions
    const bodyHeight = isDJ ? 1.8 : (1.5 + Math.random() * 0.4); // 1.5-1.9m tall
    const bodyWidth = isDJ ? 0.5 : (0.35 + Math.random() * 0.1);
    
    this.group = new THREE.Group();
    
    // Choose a vibrant color for this avatar
    const hue = Math.random();
    const saturation = 0.7 + Math.random() * 0.3;
    const lightness = 0.4 + Math.random() * 0.2;
    
    // Torso
    const torsoGeometry = new THREE.BoxGeometry(bodyWidth, bodyHeight * 0.5, bodyWidth * 0.6);
    const torsoMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(hue, saturation, lightness),
      emissive: new THREE.Color().setHSL(hue, saturation, lightness * 0.5),
      emissiveIntensity: 0.3,
      metalness: 0.2,
      roughness: 0.8
    });
    this.torso = new THREE.Mesh(torsoGeometry, torsoMaterial);
    this.torso.position.y = bodyHeight * 0.4;
    this.torso.castShadow = true;
    this.group.add(this.torso);
    
    // Head - proportional to body
    const headSize = bodyWidth * 0.7;
    const headGeometry = new THREE.SphereGeometry(headSize, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(hue, saturation * 0.8, lightness * 1.2),
      emissive: new THREE.Color().setHSL(hue, saturation * 0.8, lightness * 0.6),
      emissiveIntensity: 0.2,
      metalness: 0.1,
      roughness: 0.9
    });
    this.head = new THREE.Mesh(headGeometry, headMaterial);
    this.head.position.y = bodyHeight * 0.65 + headSize;
    this.head.castShadow = true;
    this.group.add(this.head);
    
    // Legs
    const legHeight = bodyHeight * 0.45;
    const legGeometry = new THREE.CylinderGeometry(bodyWidth * 0.18, bodyWidth * 0.18, legHeight, 8);
    const legMaterial = torsoMaterial.clone();
    legMaterial.color.multiplyScalar(0.8);
    
    this.leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    this.leftLeg.position.set(-bodyWidth * 0.2, legHeight * 0.5, 0);
    this.leftLeg.castShadow = true;
    this.group.add(this.leftLeg);
    
    this.rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    this.rightLeg.position.set(bodyWidth * 0.2, legHeight * 0.5, 0);
    this.rightLeg.castShadow = true;
    this.group.add(this.rightLeg);
    
    if (!isDJ) {
      // Arms for regular avatars
      const armLength = bodyHeight * 0.35;
      const armGeometry = new THREE.CylinderGeometry(bodyWidth * 0.12, bodyWidth * 0.12, armLength, 6);
      const armMaterial = torsoMaterial.clone();
      
      this.leftArm = new THREE.Mesh(armGeometry, armMaterial);
      this.leftArm.position.set(-bodyWidth * 0.6, bodyHeight * 0.45, 0);
      this.leftArm.castShadow = true;
      this.group.add(this.leftArm);
      
      this.rightArm = new THREE.Mesh(armGeometry, armMaterial);
      this.rightArm.position.set(bodyWidth * 0.6, bodyHeight * 0.45, 0);
      this.rightArm.castShadow = true;
      this.group.add(this.rightArm);
      
      // Add a small glow around the avatar
      const glowGeometry = new THREE.SphereGeometry(bodyWidth * 1.2, 16, 16);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(hue, 1, 0.5),
        transparent: true,
        opacity: 0.1,
        blending: THREE.AdditiveBlending
      });
      this.glow = new THREE.Mesh(glowGeometry, glowMaterial);
      this.glow.position.y = bodyHeight * 0.5;
      this.group.add(this.glow);
      
    } else {
      // DJ has a booth/desk
      const boothGeometry = new THREE.BoxGeometry(3, 1.3, 2);
      const boothMaterial = new THREE.MeshStandardMaterial({
        color: 0x0a0a0a,
        emissive: 0xff00ff,
        emissiveIntensity: 0.5,
        metalness: 0.9,
        roughness: 0.2
      });
      this.booth = new THREE.Mesh(boothGeometry, boothMaterial);
      this.booth.position.y = 0.65;
      this.booth.position.z = 1;
      this.booth.castShadow = true;
      this.group.add(this.booth);
      
      // Equipment on booth with lights
      const equipGeometry = new THREE.BoxGeometry(2, 0.4, 1);
      const equipMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        emissive: 0x00ffff,
        emissiveIntensity: 0.7,
        metalness: 0.95,
        roughness: 0.1
      });
      const equipment = new THREE.Mesh(equipGeometry, equipMaterial);
      equipment.position.set(0, 1.5, 1);
      equipment.castShadow = true;
      this.group.add(equipment);
      
      // Add turntables/decks
      for (let i = -1; i <= 1; i += 2) {
        const deckGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 16);
        const deckMaterial = new THREE.MeshStandardMaterial({
          color: 0x333333,
          emissive: 0xff00ff,
          emissiveIntensity: 0.3,
          metalness: 0.8,
          roughness: 0.3
        });
        const deck = new THREE.Mesh(deckGeometry, deckMaterial);
        deck.position.set(i * 0.6, 1.75, 1);
        this.group.add(deck);
      }
      
      // DJ spotlight
      this.djSpotlight = new THREE.PointLight(0xff00ff, 2, 8);
      this.djSpotlight.position.set(0, bodyHeight + 1, 1);
      this.group.add(this.djSpotlight);
    }
    
    this.group.position.copy(position);
    this.initialY = position.y;
    this.initialX = position.x;
    this.initialZ = position.z;
    this.bodyHeight = bodyHeight;
    
    scene.add(this.group);
  }
  
  update(deltaTime, gameTime) {
    if (this.isDJ) {
      // DJ bobs gently
      const bobAmount = Math.sin(gameTime * 2 + this.timeOffset) * 0.1;
      this.torso.position.y = this.bodyHeight * 0.4 + bobAmount;
      this.head.position.y = this.bodyHeight * 0.65 + this.head.geometry.parameters.radius + bobAmount;
      
      // DJ nods head to the beat
      this.head.rotation.x = Math.sin(gameTime * 2.5 + this.timeOffset) * 0.15;
      this.head.rotation.z = Math.cos(gameTime * 1.8 + this.timeOffset) * 0.1;
      
      // Equipment glow pulse
      if (this.djSpotlight) {
        this.djSpotlight.intensity = (Math.sin(gameTime * 3) + 1) * 1.5 + 1;
      }
      
    } else {
      // Bounce up and down - more subtle
      const bouncePhase = gameTime * CONFIG.AVATAR_BOUNCE_SPEED + this.timeOffset;
      const bounceY = Math.sin(bouncePhase) * CONFIG.AVATAR_BOUNCE_HEIGHT;
      this.group.position.y = this.initialY + bounceY;
      
      // Sway left and right
      const swayPhase = gameTime * CONFIG.AVATAR_SWAY_SPEED + this.timeOffset * 1.3;
      const swayX = Math.sin(swayPhase) * CONFIG.AVATAR_SWAY_DISTANCE;
      this.group.position.x = this.initialX + swayX;
      
      // Slight forward-back movement
      const swayZ = Math.cos(swayPhase * 1.2) * CONFIG.AVATAR_SWAY_DISTANCE * 0.5;
      this.group.position.z = this.initialZ + swayZ;
      
      // Arms wave and move
      if (this.leftArm && this.rightArm) {
        const armPhase = gameTime * 2.5 + this.timeOffset;
        this.leftArm.rotation.z = Math.sin(armPhase) * 0.6 + 0.4;
        this.leftArm.rotation.x = Math.cos(armPhase * 1.3) * 0.3;
        this.rightArm.rotation.z = Math.sin(armPhase + Math.PI) * 0.6 - 0.4;
        this.rightArm.rotation.x = Math.cos(armPhase * 1.3 + Math.PI) * 0.3;
      }
      
      // Legs move
      if (this.leftLeg && this.rightLeg) {
        const legPhase = gameTime * 2 + this.timeOffset;
        this.leftLeg.rotation.x = Math.sin(legPhase) * 0.2;
        this.rightLeg.rotation.x = Math.sin(legPhase + Math.PI) * 0.2;
      }
      
      // Body rotation and tilt
      this.torso.rotation.y = Math.sin(gameTime * 0.8 + this.timeOffset) * 0.3;
      this.torso.rotation.z = Math.cos(gameTime * 0.6 + this.timeOffset) * 0.1;
      
      // Head bob and look around
      this.head.rotation.x = Math.sin(gameTime * 3 + this.timeOffset) * 0.2;
      this.head.rotation.y = Math.cos(gameTime * 1.5 + this.timeOffset) * 0.4;
      
      // Glow pulse
      if (this.glow) {
        const glowPulse = (Math.sin(gameTime * 2 + this.timeOffset) + 1) * 0.08 + 0.05;
        this.glow.material.opacity = glowPulse;
      }
    }
  }
  
  getPosition() {
    return this.group.position;
  }
}
