import * as THREE from 'three';
import { soundEngine } from '../audio/soundEngine';

export interface BallUpdateResult {
  isGoal: boolean;
  goalSide?: 'home' | 'away';
  outOfBounds?: 'side' | 'end';
  endSide?: 'home' | 'away';
  outPos?: { x: number; z: number };
}

export interface BallPhysics {
  mesh: THREE.Mesh;
  shadowMesh: THREE.Mesh;
  group: THREE.Group;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  spin: THREE.Vector3;
  radius: number;
  lastKickerId: string | null;
  lastKickerTeamId: string | null;
  isInNet: boolean;
  goalScoredTeam: 'home' | 'away' | null;
  
  update: (dt: number) => BallUpdateResult;
  kick: (dir: THREE.Vector3, power: number, loft: number, spinCurl?: number, kickerId?: string, teamId?: string) => void;
  reset: (x?: number, z?: number) => void;
}

export function createBallPhysics(): BallPhysics {
  const radius = 0.32; // Visible, responsive scale
  const group = new THREE.Group();
  group.name = 'Football';

  // 1. Procedural Classical Football Texture (Hexagons and Pentagons)
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, 512, 256);

  // Black pentagon patches
  ctx.fillStyle = '#0f172a';
  const drawPentagon = (cx: number, cy: number, r: number) => {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    ctx.stroke();
  };

  // Seam lines between panels
  ctx.strokeStyle = 'rgba(0,0,0,0.2)';
  ctx.lineWidth = 2;
  for (let x = 32; x < 512; x += 64) {
    for (let y = 32; y < 256; y += 64) {
      if ((x / 64 + y / 64) % 2 === 0) {
        drawPentagon(x, y, 20);
      }
    }
  }

  const ballTex = new THREE.CanvasTexture(canvas);
  ballTex.colorSpace = THREE.SRGBColorSpace;

  const ballGeo = new THREE.SphereGeometry(radius, 24, 24);
  const ballMat = new THREE.MeshStandardMaterial({
    map: ballTex,
    roughness: 0.35,
    metalness: 0.1,
  });

  const mesh = new THREE.Mesh(ballGeo, ballMat);
  mesh.castShadow = true;
  group.add(mesh);

  // Dynamic Contact Shadow on Grass
  const shadowGeo = new THREE.CircleGeometry(radius * 1.2, 16);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
  });
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.rotation.x = -Math.PI / 2;
  shadowMesh.position.y = 0.02;
  group.add(shadowMesh);

  const ballObj: BallPhysics = {
    mesh,
    shadowMesh,
    group,
    position: group.position,
    velocity: new THREE.Vector3(),
    spin: new THREE.Vector3(),
    radius,
    lastKickerId: null,
    lastKickerTeamId: null,
    isInNet: false,
    goalScoredTeam: null,

    reset(x = 0, z = 0) {
      group.position.set(x, radius, z);
      ballObj.velocity.set(0, 0, 0);
      ballObj.spin.set(0, 0, 0);
      ballObj.isInNet = false;
      ballObj.goalScoredTeam = null;
      shadowMesh.position.set(0, 0.02, 0);
      shadowMesh.scale.set(1, 1, 1);
      (shadowMesh.material as THREE.MeshBasicMaterial).opacity = 0.45;
    },

    kick(dir, power, loft, spinCurl = 0, kickerId, teamId) {
      // Normalize ground direction
      const horizontal = new THREE.Vector3(dir.x, 0, dir.z).normalize();
      const speed = power * 34; // Max ~34 m/s (approx 120 km/h world-class shot)
      const vertSpeed = loft * 16;

      ballObj.velocity.set(
        horizontal.x * speed,
        vertSpeed,
        horizontal.z * speed
      );

      // Spin / Magnus curl
      ballObj.spin.set(0, spinCurl * 25, 0);

      if (kickerId) ballObj.lastKickerId = kickerId;
      if (teamId) ballObj.lastKickerTeamId = teamId;

      soundEngine.playKick(Math.min(1, power));
    },

    update(dt) {
      const pos = group.position;
      const vel = ballObj.velocity;

      // Net trapping physics
      if (ballObj.isInNet) {
        vel.multiplyScalar(Math.pow(0.05, dt));
        pos.addScaledVector(vel, dt);
        if (pos.y > radius) {
          vel.y -= 15 * dt;
        } else {
          pos.y = radius;
          vel.y = 0;
        }
        mesh.position.y = 0;
        return { isGoal: false };
      }

      // Gravity & Magnus curl effect in air
      const gravity = -24;
      vel.y += gravity * dt;

      // Curl acceleration perpendicular to velocity
      if (ballObj.spin.y !== 0 && pos.y > radius + 0.1) {
        const curlAccX = -vel.z * ballObj.spin.y * 0.05;
        const curlAccZ = vel.x * ballObj.spin.y * 0.05;
        vel.x += curlAccX * dt;
        vel.z += curlAccZ * dt;
      }

      // Air resistance
      vel.x *= Math.pow(0.994, dt * 60);
      vel.z *= Math.pow(0.994, dt * 60);

      // Advance position
      pos.x += vel.x * dt;
      pos.y += vel.y * dt;
      pos.z += vel.z * dt;

      // Ground Collision & Bounce
      if (pos.y <= radius) {
        pos.y = radius;
        if (Math.abs(vel.y) > 1.2) {
          vel.y = -vel.y * 0.62; // Restitution bounce
          // Grass contact dampens horizontal velocity slightly
          vel.x *= 0.92;
          vel.z *= 0.92;
        } else {
          vel.y = 0;
          // Rolling friction on turf
          vel.x *= Math.pow(0.978, dt * 60);
          vel.z *= Math.pow(0.978, dt * 60);
          // Zero tiny creep
          if (vel.lengthSq() < 0.02) {
            vel.set(0, 0, 0);
          }
        }
      }

      // Ball Rolling Visual Rotation
      const moveDist = Math.sqrt(vel.x * vel.x + vel.z * vel.z) * dt;
      if (moveDist > 0.001) {
        const rotAngle = moveDist / radius;
        const rotAxis = new THREE.Vector3(-vel.z, 0, vel.x).normalize();
        mesh.rotateOnWorldAxis(rotAxis, rotAngle);
      }

      // Ground Shadow sync
      const heightAboveGround = Math.max(0, pos.y - radius);
      shadowMesh.position.set(0, 0.02 - heightAboveGround, 0);
      const shadowScale = Math.max(0.4, 1 - heightAboveGround * 0.12);
      shadowMesh.scale.set(shadowScale, shadowScale, shadowScale);
      (shadowMesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0.1, 0.45 - heightAboveGround * 0.06);

      // Check Goal Post Collisions
      const goalWidth = 7.32;
      const postZ1 = -goalWidth / 2;
      const postZ2 = goalWidth / 2;
      const barY = 2.44;

      // Left Goal Posts (x = -52.5) & Crossbar
      if (Math.abs(pos.x - (-52.5)) < radius + 0.1) {
        // Left upright or right upright
        if ((Math.abs(pos.z - postZ1) < radius + 0.1 || Math.abs(pos.z - postZ2) < radius + 0.1) && pos.y <= barY + radius) {
          vel.x = Math.abs(vel.x) * 0.75 + 2;
          soundEngine.playPostHit();
        }
        // Crossbar
        if (pos.z >= postZ1 && pos.z <= postZ2 && Math.abs(pos.y - barY) < radius + 0.08) {
          vel.y = -Math.abs(vel.y) * 0.75;
          vel.x = Math.abs(vel.x) * 0.6 + 2;
          soundEngine.playPostHit();
        }
      }

      // Right Goal Posts (x = 52.5) & Crossbar
      if (Math.abs(pos.x - 52.5) < radius + 0.1) {
        if ((Math.abs(pos.z - postZ1) < radius + 0.1 || Math.abs(pos.z - postZ2) < radius + 0.1) && pos.y <= barY + radius) {
          vel.x = -Math.abs(vel.x) * 0.75 - 2;
          soundEngine.playPostHit();
        }
        if (pos.z >= postZ1 && pos.z <= postZ2 && Math.abs(pos.y - barY) < radius + 0.08) {
          vel.y = -Math.abs(vel.y) * 0.75;
          vel.x = -Math.abs(vel.x) * 0.6 - 2;
          soundEngine.playPostHit();
        }
      }

      // Check Goals (Ball crosses line into net)
      // Left Goal (Home defending left side -> Away scores)
      if (pos.x < -52.5 && pos.x > -54.8 && Math.abs(pos.z) < (goalWidth / 2) - 0.2 && pos.y < barY) {
        ballObj.isInNet = true;
        ballObj.goalScoredTeam = 'away';
        soundEngine.playGoalNet();
        soundEngine.playGoalCelebration();
        return { isGoal: true, goalSide: 'away' };
      }

      // Right Goal (Away defending right side -> Home scores)
      if (pos.x > 52.5 && pos.x < 54.8 && Math.abs(pos.z) < (goalWidth / 2) - 0.2 && pos.y < barY) {
        ballObj.isInNet = true;
        ballObj.goalScoredTeam = 'home';
        soundEngine.playGoalNet();
        soundEngine.playGoalCelebration();
        return { isGoal: true, goalSide: 'home' };
      }

      // Pitch Boundaries checks
      if (Math.abs(pos.z) > 34.2) {
        return {
          isGoal: false,
          outOfBounds: 'side',
          outPos: { x: THREE.MathUtils.clamp(pos.x, -51, 51), z: Math.sign(pos.z) * 34 },
        };
      }
      if (Math.abs(pos.x) > 52.8) {
        return {
          isGoal: false,
          outOfBounds: 'end',
          endSide: pos.x > 0 ? 'away' : 'home',
          outPos: { x: Math.sign(pos.x) * 52.5, z: THREE.MathUtils.clamp(pos.z, -33, 33) },
        };
      }

      return { isGoal: false };
    }
  };

  return ballObj;
}
