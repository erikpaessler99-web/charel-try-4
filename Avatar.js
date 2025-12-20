import * as THREE from 'three';
import { CONFIG } from './config.js';

export class Avatar {
  constructor(scene, position, isDJ = false) {
    this.scene = scene;
    this.isDJ = isDJ;
    this.timeOffset = Math.random() * Math.PI * 2; // Random phase for dancing
    
    // Create avatar mesh
    const bodyHeight = isDJ ? 3 : 2;
    const bodyWidth = isDJ ? 1.2 : 0.6;
    
    this.group = new THREE.Group();
    
    // Body
    const bodyGeometry = new THREE.BoxGeometry(bodyWidth, bodyHeight, bodyWidth);
    const hue = Math.random();
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(hue, 0.8, 0.5),
      emissive: new THREE.Color().setHSL(hue, 0.8, 0.3),
      metalness: 0.3,
      roughness: 0.7
    });
    this.body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    this.body.position.y = bodyHeight / 2;
    this.group.add(this.body);
    
    // Head
    const headSize = isDJ ? 0.8 : 0.5;
    const headGeometry = new THREE.SphereGeometry(headSize, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(hue, 0.6, 0.6),
      emissive: new THREE.Color().setHSL(hue, 0.6, 0.4),
      metalness: 0.2,
      roughness: 0.8
    });
    this.head = new THREE.Mesh(headGeometry, headMaterial);
    this.head.position.y = bodyHeight + headSize * 0.5;
    this.group.add(this.head);
    
    // Arms (only for regular avatars)
    if (!isDJ) {
      const armGeometry = new THREE.BoxGeometry(0.2, 0.8, 0.2);
      const armMaterial = bodyMaterial.clone();
      
      this.leftArm = new THREE.Mesh(armGeometry, armMaterial);
      this.leftArm.position.set(-0.4, bodyHeight * 0.6, 0);
      this.group.add(this.leftArm);
      
      this.rightArm = new THREE.Mesh(armGeometry, armMaterial);
      this.rightArm.position.set(0.4, bodyHeight * 0.6, 0);
      this.group.add(this.rightArm);
    } else {
      // DJ has a booth/desk
      const boothGeometry = new THREE.BoxGeometry(2.5, 1.2, 1.5);
      const boothMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        emissive: 0xff00ff,
        emissiveIntensity: 0.3,
        metalness: 0.8,
        roughness: 0.3
      });
      this.booth = new THREE.Mesh(boothGeometry, boothMaterial);
      this.booth.position.y = 0.6;
      this.booth.position.z = 0.8;
      this.group.add(this.booth);
      
      // Equipment on booth
      const equipGeometry = new THREE.BoxGeometry(1.5, 0.3, 0.8);
      const equipMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
        emissive: 0x00ffff,
        emissiveIntensity: 0.5,
        metalness: 0.9,
        roughness: 0.2
      });
      const equipment = new THREE.Mesh(equipGeometry, equipMaterial);
      equipment.position.set(0, 1.4, 0.8);
      this.group.add(equipment);
    }
    
    this.group.position.copy(position);
    this.initialY = position.y;
    this.initialX = position.x;
    this.initialZ = position.z;
    
    scene.add(this.group);
  }
  
  update(deltaTime, gameTime) {
    if (this.isDJ) {
      // DJ bobs gently
      const bobAmount = Math.sin(gameTime * 1.5 + this.timeOffset) * 0.2;
      this.body.position.y = 1.5 + bobAmount;
      this.head.position.y = 3 + bobAmount;
      
      // DJ nods head
      this.head.rotation.x = Math.sin(gameTime * 2 + this.timeOffset) * 0.2;
    } else {
      // Bounce up and down
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
      
      // Arms wave
      if (this.leftArm) {
        this.leftArm.rotation.z = Math.sin(gameTime * 2 + this.timeOffset) * 0.5 + 0.3;
        this.rightArm.rotation.z = Math.sin(gameTime * 2 + this.timeOffset + Math.PI) * 0.5 - 0.3;
      }
      
      // Body rotation
      this.body.rotation.y = Math.sin(gameTime * 0.5 + this.timeOffset) * 0.2;
      
      // Head bob
      this.head.rotation.x = Math.sin(gameTime * 3 + this.timeOffset) * 0.15;
    }
  }
  
  getPosition() {
    return this.group.position;
  }
}
