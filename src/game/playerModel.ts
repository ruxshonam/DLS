import * as THREE from 'three';
import { PlayerData, TeamData } from '../types/game';

export interface Player3D {
  data: PlayerData;
  team: TeamData;
  isHomeTeam: boolean;
  group: THREE.Group;
  
  // Skeletal animation joint groups
  bodyGroup: THREE.Group;
  leftLegGroup: THREE.Group;
  rightLegGroup: THREE.Group;
  leftKneeGroup: THREE.Group;
  rightKneeGroup: THREE.Group;
  leftArmGroup: THREE.Group;
  rightArmGroup: THREE.Group;
  headMesh: THREE.Mesh;
  
  // Selection indicator
  indicatorMesh: THREE.Mesh;
  directionArrow: THREE.Mesh;
  cardMesh?: THREE.Mesh;
  
  // Kinematic state
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  targetRotationY: number;
  animTime: number;
  kickTimer: number;
  slideTimer: number;
  diveTimer: number;
  diveDirection: number; // -1 left, 1 right
  celebrateTimer: number;
  cardTimer: number;
  stamina: number;
  
  // Methods
  update: (dt: number, isControlled: boolean) => void;
  triggerKick: () => void;
  triggerSlideTackle: () => void;
  triggerDive: (direction: number) => void;
  triggerCelebration: () => void;
  showCard: (card: 'yellow' | 'red') => void;
  setPosition: (x: number, z: number) => void;
}

// Texture cache to prevent duplicating canvas textures across 22 players
const jerseyTextureCache = new Map<string, THREE.CanvasTexture>();

function createJerseyTexture(team: TeamData, number: number, isGK: boolean): THREE.CanvasTexture {
  const cacheKey = `${team.id}_${number}_${isGK ? 'gk' : 'field'}_${team.primaryColor}_${team.secondaryColor}_${team.kitPattern}`;
  if (jerseyTextureCache.has(cacheKey)) {
    return jerseyTextureCache.get(cacheKey)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const primary = isGK ? team.gkColor : team.primaryColor;
  const secondary = isGK ? '#111827' : team.secondaryColor;
  const accent = team.accentColor;

  // Front & Back base
  ctx.fillStyle = primary;
  ctx.fillRect(0, 0, 256, 256);

  // Patterns
  if (!isGK) {
    if (team.kitPattern === 'stripes') {
      ctx.fillStyle = secondary;
      const stripeW = 256 / 8;
      for (let i = 0; i < 8; i += 2) {
        ctx.fillRect(i * stripeW, 0, stripeW, 256);
      }
    } else if (team.kitPattern === 'hoops') {
      ctx.fillStyle = secondary;
      const hoopH = 256 / 8;
      for (let i = 0; i < 8; i += 2) {
        ctx.fillRect(0, i * hoopH, 256, hoopH);
      }
    } else if (team.kitPattern === 'sash') {
      ctx.fillStyle = secondary;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(80, 0);
      ctx.lineTo(256, 256);
      ctx.lineTo(176, 256);
      ctx.closePath();
      ctx.fill();
    }
  }

  // Collar V-neck
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.moveTo(100, 0);
  ctx.lineTo(128, 40);
  ctx.lineTo(156, 0);
  ctx.closePath();
  ctx.fill();

  // Kit Number on back
  ctx.fillStyle = accent;
  ctx.font = 'bold 70px "Barlow Condensed", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(number), 128, 140);

  // Team chest crest badge
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(80, 70, 14, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  jerseyTextureCache.set(cacheKey, texture);
  return texture;
}

export function createPlayer3D(player: PlayerData, team: TeamData, isHomeTeam: boolean): Player3D {
  const group = new THREE.Group();
  group.name = `Player_${player.name}`;

  const isGK = player.position === 'GK';
  const scale = player.height || 1.0;

  // Shared / reusable materials for this player
  const skinTone = player.skinTone || '#e0b892';
  const skinMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(skinTone),
    roughness: 0.7,
    metalness: 0.05,
  });

  const hairColor = player.hairColor || '#1c150e';
  const hairMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(hairColor),
    roughness: 0.85,
    metalness: 0.05,
  });

  const jerseyTex = createJerseyTexture(team, player.number, isGK);
  const jerseyMat = new THREE.MeshStandardMaterial({
    map: jerseyTex,
    roughness: 0.55,
    metalness: 0.1,
  });

  const shortsMat = new THREE.MeshStandardMaterial({
    color: isGK ? new THREE.Color(0x111827) : new THREE.Color(team.secondaryColor),
    roughness: 0.6,
    metalness: 0.05,
  });

  const socksMat = new THREE.MeshStandardMaterial({
    color: isGK ? new THREE.Color(team.gkColor) : new THREE.Color(team.primaryColor),
    roughness: 0.6,
    metalness: 0.05,
  });

  const cleatMat = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    roughness: 0.3,
    metalness: 0.5,
  });

  // Base group containing animated torso and limbs
  const bodyGroup = new THREE.Group();
  bodyGroup.position.y = 0; // pivot at ground
  group.add(bodyGroup);

  // 1. Torso / Jersey (Y = 1.05 to 1.55)
  const torsoGeo = new THREE.BoxGeometry(0.55 * scale, 0.55 * scale, 0.3 * scale);
  const torsoMesh = new THREE.Mesh(torsoGeo, jerseyMat);
  torsoMesh.position.y = 1.25 * scale;
  torsoMesh.castShadow = true;
  bodyGroup.add(torsoMesh);

  // 2. Neck & Head
  const neckGeo = new THREE.CylinderGeometry(0.09 * scale, 0.1 * scale, 0.12 * scale, 8);
  const neckMesh = new THREE.Mesh(neckGeo, skinMat);
  neckMesh.position.y = 1.58 * scale;
  bodyGroup.add(neckMesh);

  const headGeo = new THREE.SphereGeometry(0.18 * scale, 16, 16);
  const headMesh = new THREE.Mesh(headGeo, skinMat);
  headMesh.position.y = 1.76 * scale;
  headMesh.castShadow = true;
  bodyGroup.add(headMesh);

  // Hair styling
  const hairGeo = new THREE.SphereGeometry(0.19 * scale, 14, 14, 0, Math.PI * 2, 0, Math.PI * 0.55);
  const hairMesh = new THREE.Mesh(hairGeo, hairMat);
  hairMesh.position.y = 1.79 * scale;
  bodyGroup.add(hairMesh);

  // 3. Pelvis / Shorts (Y = 0.85 to 1.05)
  const pelvisGeo = new THREE.BoxGeometry(0.48 * scale, 0.28 * scale, 0.28 * scale);
  const pelvisMesh = new THREE.Mesh(pelvisGeo, shortsMat);
  pelvisMesh.position.y = 0.95 * scale;
  pelvisMesh.castShadow = true;
  bodyGroup.add(pelvisMesh);

  // 4. Legs (Hips at Y = 0.85, Knees at Y = 0.45, Feet at Y = 0.0)
  const legRadius = 0.08 * scale;
  const thighLen = 0.42 * scale;
  const shinLen = 0.42 * scale;

  // Left Leg
  const leftLegGroup = new THREE.Group();
  leftLegGroup.position.set(-0.16 * scale, 0.88 * scale, 0);

  const leftThighGeo = new THREE.CylinderGeometry(legRadius, legRadius * 0.9, thighLen, 10);
  const leftThigh = new THREE.Mesh(leftThighGeo, skinMat);
  leftThigh.position.y = -thighLen / 2;
  leftThigh.castShadow = true;
  leftLegGroup.add(leftThigh);

  const leftKneeGroup = new THREE.Group();
  leftKneeGroup.position.set(0, -thighLen, 0);
  leftLegGroup.add(leftKneeGroup);

  const leftShinGeo = new THREE.CylinderGeometry(legRadius * 0.9, legRadius * 0.8, shinLen, 10);
  const leftShin = new THREE.Mesh(leftShinGeo, socksMat);
  leftShin.position.y = -shinLen / 2;
  leftShin.castShadow = true;
  leftKneeGroup.add(leftShin);

  const cleatGeo = new THREE.BoxGeometry(0.14 * scale, 0.1 * scale, 0.28 * scale);
  const leftCleat = new THREE.Mesh(cleatGeo, cleatMat);
  leftCleat.position.set(0, -shinLen + 0.04 * scale, 0.06 * scale);
  leftCleat.castShadow = true;
  leftKneeGroup.add(leftCleat);

  bodyGroup.add(leftLegGroup);

  // Right Leg
  const rightLegGroup = new THREE.Group();
  rightLegGroup.position.set(0.16 * scale, 0.88 * scale, 0);

  const rightThighGeo = new THREE.CylinderGeometry(legRadius, legRadius * 0.9, thighLen, 10);
  const rightThigh = new THREE.Mesh(rightThighGeo, skinMat);
  rightThigh.position.y = -thighLen / 2;
  rightThigh.castShadow = true;
  rightLegGroup.add(rightThigh);

  const rightKneeGroup = new THREE.Group();
  rightKneeGroup.position.set(0, -thighLen, 0);
  rightLegGroup.add(rightKneeGroup);

  const rightShinGeo = new THREE.CylinderGeometry(legRadius * 0.9, legRadius * 0.8, shinLen, 10);
  const rightShin = new THREE.Mesh(rightShinGeo, socksMat);
  rightShin.position.y = -shinLen / 2;
  rightShin.castShadow = true;
  rightKneeGroup.add(rightShin);

  const rightCleat = new THREE.Mesh(cleatGeo, cleatMat);
  rightCleat.position.set(0, -shinLen + 0.04 * scale, 0.06 * scale);
  rightCleat.castShadow = true;
  rightKneeGroup.add(rightCleat);

  bodyGroup.add(rightLegGroup);

  // 5. Arms (Shoulders at Y = 1.45, Elbows at Y = 1.15, Hands at Y = 0.85)
  const armRadius = 0.065 * scale;
  const armLen = 0.32 * scale;
  const forearmLen = 0.32 * scale;

  // Left Arm
  const leftArmGroup = new THREE.Group();
  leftArmGroup.position.set(-0.35 * scale, 1.45 * scale, 0);

  const leftUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(armRadius, armRadius * 0.9, armLen, 8), jerseyMat);
  leftUpperArm.position.y = -armLen / 2;
  leftUpperArm.castShadow = true;
  leftArmGroup.add(leftUpperArm);

  const leftForearm = new THREE.Mesh(new THREE.CylinderGeometry(armRadius * 0.9, armRadius * 0.8, forearmLen, 8), skinMat);
  leftForearm.position.y = -armLen - forearmLen / 2;
  leftForearm.castShadow = true;
  leftArmGroup.add(leftForearm);

  // GK Gloves or Hand
  const handMat = isGK ? new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3 }) : skinMat;
  const leftHand = new THREE.Mesh(new THREE.SphereGeometry(0.08 * scale, 8, 8), handMat);
  leftHand.position.y = -armLen - forearmLen;
  leftArmGroup.add(leftHand);

  bodyGroup.add(leftArmGroup);

  // Right Arm
  const rightArmGroup = new THREE.Group();
  rightArmGroup.position.set(0.35 * scale, 1.45 * scale, 0);

  const rightUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(armRadius, armRadius * 0.9, armLen, 8), jerseyMat);
  rightUpperArm.position.y = -armLen / 2;
  rightUpperArm.castShadow = true;
  rightArmGroup.add(rightUpperArm);

  const rightForearm = new THREE.Mesh(new THREE.CylinderGeometry(armRadius * 0.9, armRadius * 0.8, forearmLen, 8), skinMat);
  rightForearm.position.y = -armLen - forearmLen / 2;
  rightForearm.castShadow = true;
  rightArmGroup.add(rightForearm);

  const rightHand = new THREE.Mesh(new THREE.SphereGeometry(0.08 * scale, 8, 8), handMat);
  rightHand.position.y = -armLen - forearmLen;
  rightArmGroup.add(rightHand);

  bodyGroup.add(rightArmGroup);

  // 6. Ground Player Indicator Ring & Directional Pointer
  const indicatorGeo = new THREE.RingGeometry(0.7, 0.85, 32);
  const indicatorMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0,
  });
  const indicatorMesh = new THREE.Mesh(indicatorGeo, indicatorMat);
  indicatorMesh.rotation.x = -Math.PI / 2;
  indicatorMesh.position.y = 0.02;
  group.add(indicatorMesh);

  // Direction pointer arrow
  const arrowShape = new THREE.Shape();
  arrowShape.moveTo(0, 0.9);
  arrowShape.lineTo(0.22, 1.25);
  arrowShape.lineTo(-0.22, 1.25);
  arrowShape.closePath();
  const arrowGeo = new THREE.ShapeGeometry(arrowShape);
  const arrowMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0,
  });
  const directionArrow = new THREE.Mesh(arrowGeo, arrowMat);
  directionArrow.rotation.x = -Math.PI / 2;
  directionArrow.position.y = 0.02;
  group.add(directionArrow);

  // 7. Overhead Referee Card Mesh (Hidden by default, shows on booking)
  const cardGeo = new THREE.BoxGeometry(0.25 * scale, 0.4 * scale, 0.02 * scale);
  const cardMat = new THREE.MeshBasicMaterial({ color: 0xfacc15, visible: false });
  const cardMesh = new THREE.Mesh(cardGeo, cardMat);
  cardMesh.position.set(0, 2.3 * scale, 0);
  group.add(cardMesh);

  const playerObj: Player3D = {
    data: player,
    team,
    isHomeTeam,
    group,
    bodyGroup,
    leftLegGroup,
    rightLegGroup,
    leftKneeGroup,
    rightKneeGroup,
    leftArmGroup,
    rightArmGroup,
    headMesh,
    indicatorMesh,
    directionArrow,
    cardMesh,
    position: group.position,
    velocity: new THREE.Vector3(),
    targetRotationY: isHomeTeam ? Math.PI / 2 : -Math.PI / 2,
    animTime: Math.random() * 10,
    kickTimer: 0,
    slideTimer: 0,
    diveTimer: 0,
    diveDirection: 1,
    celebrateTimer: 0,
    cardTimer: 0,
    stamina: player.stamina,

    setPosition(x: number, z: number) {
      group.position.set(x, 0, z);
    },

    triggerKick() {
      playerObj.kickTimer = 0.35;
    },

    triggerSlideTackle() {
      playerObj.slideTimer = 0.65;
    },

    triggerDive(direction: number) {
      playerObj.diveTimer = 0.85;
      playerObj.diveDirection = direction >= 0 ? 1 : -1;
    },

    triggerCelebration() {
      playerObj.celebrateTimer = 3.5;
    },

    showCard(card: 'yellow' | 'red') {
      playerObj.cardTimer = 3.0;
      if (cardMesh) {
        cardMesh.visible = true;
        (cardMesh.material as THREE.MeshBasicMaterial).color.setHex(card === 'yellow' ? 0xfacc15 : 0xef4444);
      }
    },

    update(dt: number, isControlled: boolean) {
      playerObj.animTime += dt;
      const speed = playerObj.velocity.length();

      // Smooth rotation toward movement or facing direction
      if (playerObj.kickTimer <= 0 && playerObj.diveTimer <= 0) {
        group.rotation.y = THREE.MathUtils.damp(group.rotation.y, playerObj.targetRotationY, 14, dt);
      }

      // Update indicator visuals
      if (isControlled) {
        (indicatorMesh.material as THREE.MeshBasicMaterial).opacity = 0.9;
        (indicatorMesh.material as THREE.MeshBasicMaterial).color.setHex(0x38bdf8); // Bright cyan
        (directionArrow.material as THREE.MeshBasicMaterial).opacity = 0.95;
        (directionArrow.material as THREE.MeshBasicMaterial).color.setHex(0x38bdf8);
      } else {
        (indicatorMesh.material as THREE.MeshBasicMaterial).opacity = 0;
        (directionArrow.material as THREE.MeshBasicMaterial).opacity = 0;
      }

      // Handle Special Action Animations
      if (playerObj.celebrateTimer > 0) {
        // Goal Celebration: Jump up with arms pumping into air!
        playerObj.celebrateTimer -= dt;
        const jumpH = Math.max(0, Math.sin(playerObj.celebrateTimer * 6) * 0.45);
        bodyGroup.position.y = jumpH;
        leftArmGroup.rotation.x = -Math.PI * 0.9;
        rightArmGroup.rotation.x = -Math.PI * 0.9;
        leftArmGroup.rotation.z = -0.3;
        rightArmGroup.rotation.z = 0.3;
        leftLegGroup.rotation.x = 0.1;
        rightLegGroup.rotation.x = 0.1;
        return;
      }

      if (playerObj.diveTimer > 0) {
        // Goalkeeper Dive Animation
        playerObj.diveTimer -= dt;
        const diveProgress = 1 - (playerObj.diveTimer / 0.85);
        const rollAngle = playerObj.diveDirection * Math.PI * 0.45;
        bodyGroup.rotation.z = rollAngle * Math.sin(diveProgress * Math.PI);
        bodyGroup.position.y = Math.sin(diveProgress * Math.PI) * 0.6;
        leftArmGroup.rotation.z = -Math.PI * 0.8 * playerObj.diveDirection;
        rightArmGroup.rotation.z = -Math.PI * 0.8 * playerObj.diveDirection;
        return;
      }

      // Card visual update
      if (playerObj.cardTimer > 0) {
        playerObj.cardTimer -= dt;
        if (cardMesh) {
          cardMesh.rotation.y += dt * 4;
          if (playerObj.cardTimer <= 0) {
            cardMesh.visible = false;
          }
        }
      }

      // Slide Tackle (Podkat) Animation
      if (playerObj.slideTimer > 0) {
        playerObj.slideTimer -= dt;
        const slideProgress = 1 - (playerObj.slideTimer / 0.65);
        bodyGroup.position.y = -0.35 * Math.sin(slideProgress * Math.PI);
        bodyGroup.rotation.z = Math.PI * 0.45;
        bodyGroup.rotation.x = -0.2;
        rightLegGroup.rotation.x = -Math.PI * 0.55;
        rightKneeGroup.rotation.x = 0;
        leftLegGroup.rotation.x = Math.PI * 0.3;
        leftArmGroup.rotation.x = -Math.PI * 0.4;
        rightArmGroup.rotation.x = Math.PI * 0.4;
        return;
      }

      if (playerObj.kickTimer > 0) {
        // Kicking Swing Animation
        playerObj.kickTimer -= dt;
        const progress = 1 - (playerObj.kickTimer / 0.35);
        if (progress < 0.4) {
          // Windup: right leg swings back, torso twists back
          rightLegGroup.rotation.x = Math.PI * 0.45;
          rightKneeGroup.rotation.x = -Math.PI * 0.3;
          leftArmGroup.rotation.x = -Math.PI * 0.3;
        } else {
          // Follow-through: powerful strike forward
          rightLegGroup.rotation.x = -Math.PI * 0.55;
          rightKneeGroup.rotation.x = 0;
          bodyGroup.rotation.x = 0.2;
        }
        return;
      }

      // Standard Running / Idle Skeletal Cycle
      bodyGroup.position.y = 0;
      bodyGroup.rotation.z = 0;

      if (speed > 0.3) {
        const strideFreq = 12 + Math.min(speed, 9) * 1.5;
        const swingAmp = 0.45 + Math.min(speed, 9) * 0.05;
        const phase = playerObj.animTime * strideFreq;

        const legAngle = Math.sin(phase) * swingAmp;
        leftLegGroup.rotation.x = legAngle;
        rightLegGroup.rotation.x = -legAngle;

        // Knees bend during backward swing
        leftKneeGroup.rotation.x = legAngle > 0 ? -legAngle * 0.7 : 0;
        rightKneeGroup.rotation.x = -legAngle > 0 ? legAngle * 0.7 : 0;

        // Arms swing in counter-phase to legs
        leftArmGroup.rotation.x = -legAngle * 0.9;
        rightArmGroup.rotation.x = legAngle * 0.9;
        leftArmGroup.rotation.z = 0.15;
        rightArmGroup.rotation.z = -0.15;

        // Torso leans slightly forward into sprint
        bodyGroup.rotation.x = Math.min(0.25, speed * 0.03);
      } else {
        // Subtle breathing idle
        const idlePhase = playerObj.animTime * 2.5;
        leftLegGroup.rotation.x = THREE.MathUtils.damp(leftLegGroup.rotation.x, 0, 10, dt);
        rightLegGroup.rotation.x = THREE.MathUtils.damp(rightLegGroup.rotation.x, 0, 10, dt);
        leftKneeGroup.rotation.x = THREE.MathUtils.damp(leftKneeGroup.rotation.x, 0, 10, dt);
        rightKneeGroup.rotation.x = THREE.MathUtils.damp(rightKneeGroup.rotation.x, 0, 10, dt);
        leftArmGroup.rotation.x = Math.sin(idlePhase) * 0.05;
        rightArmGroup.rotation.x = -Math.sin(idlePhase) * 0.05;
        bodyGroup.rotation.x = 0;
      }
    }
  };

  return playerObj;
}
