import * as THREE from 'three';
import { PlayerData, TeamData, GameMode, GameSettings, MatchStats, PenaltyKickerState, FormationType, FoulEvent, OutEvent } from '../types/game';
import { buildStadium, StadiumObjects } from './stadiumBuilder';
import { createPlayer3D, Player3D } from './playerModel';
import { createBallPhysics, BallPhysics } from './ballPhysics';
import { soundEngine } from '../audio/soundEngine';
import { commentator } from '../audio/commentatorEngine';
import { FORMATIONS_COORDINATES } from '../data/teamsData';

export interface GameEngineCallbacks {
  onScoreUpdate: (home: number, away: number) => void;
  onTimeUpdate: (minute: number, second: number, half: 1 | 2 | 'extra' | 'penalties' | 'ended') => void;
  onGoal: (scorerName: string, teamId: string, speedKmh: number) => void;
  onMatchPeriodChange: (period: 'kickoff' | 'playing' | 'halftime' | 'fulltime' | 'extra_time_1' | 'extra_time_2' | 'penalty_shootout' | 'goal_replay' | 'throw_in' | 'corner_kick' | 'goal_kick' | 'free_kick') => void;
  onControlledPlayerChange: (player: PlayerData, stamina: number) => void;
  onPowerMeterChange: (power: number, actionType: 'shoot' | 'pass' | 'through') => void;
  onPenaltyRoundUpdate?: (userTurn: boolean, scoreHome: (boolean | null)[], scoreAway: (boolean | null)[]) => void;
  onFoulEvent?: (foul: { playerName: string; teamId: string; card: 'none' | 'yellow' | 'red'; isPenalty: boolean }) => void;
  onOutEvent?: (out: { type: 'throw_in' | 'corner' | 'goal_kick'; awardedTeam: string }) => void;
}

export class GameEngine {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  private container: HTMLElement;
  
  // Game Objects
  private stadium!: StadiumObjects;
  public ball!: BallPhysics;
  public homePlayers: Player3D[] = [];
  public awayPlayers: Player3D[] = [];
  public controlledPlayer!: Player3D;
  public controlledPlayer2!: Player3D; // For local 2-player mode

  // Teams & State
  public homeTeam: TeamData;
  public awayTeam: TeamData;
  public mode: GameMode;
  public settings: GameSettings;
  public matchStats: MatchStats;

  // Match Flow State
  public homeScore: number = 0;
  public awayScore: number = 0;
  public matchTimeSeconds: number = 0;
  public currentHalf: 1 | 2 | 'extra' | 'penalties' | 'ended' = 1;
  public periodStatus: 'kickoff' | 'playing' | 'halftime' | 'fulltime' | 'extra_time_1' | 'extra_time_2' | 'penalty_shootout' | 'goal_replay' | 'throw_in' | 'corner_kick' | 'goal_kick' | 'free_kick' = 'kickoff';
  public isPaused: boolean = false;
  
  // Extra Time Tracker (15s real time per extra half)
  private extraTimeCountdown: number = 15;

  // Goal Celebration & Replay Cam
  private celebrationTimer: number = 0;
  private lastGoalScorer: Player3D | null = null;
  private replayCamAngle: number = 0;

  // Input State
  private keys: Record<string, boolean> = {};
  public joystickVector: { x: number; y: number } = { x: 0, y: 0 };
  private chargeStartTime: number = 0;
  private activeChargeAction: 'shoot' | 'pass' | 'through' | null = null;
  public isChargingAction: boolean = false;
  public currentChargePower: number = 0;

  // Player 2 Charge State
  private p2ChargeStartTime: number = 0;
  private p2ActiveChargeAction: 'shoot' | 'pass' | 'through' | null = null;
  public p2IsChargingAction: boolean = false;
  public p2CurrentChargePower: number = 0;

  // Penalty Mode State
  public penaltyRoundsHome: (boolean | null)[] = [null, null, null, null, null];
  public penaltyRoundsAway: (boolean | null)[] = [null, null, null, null, null];
  public penaltyCurrentIndex: number = 0;
  public penaltyIsUserShooting: boolean = true;
  public penaltyAimX: number = 0;
  public penaltyAimY: number = 0.5;
  private penaltyAimDir: number = 1;

  // Callbacks
  private callbacks: GameEngineCallbacks;

  // Loop & Lifecycle
  private animFrameId: number = 0;
  private clock: THREE.Clock;
  private isDestroyed: boolean = false;
  private isSoftwareGl: boolean = false;

  constructor(
    container: HTMLElement,
    homeTeam: TeamData,
    awayTeam: TeamData,
    mode: GameMode,
    settings: GameSettings,
    callbacks: GameEngineCallbacks
  ) {
    this.container = container;
    this.homeTeam = homeTeam;
    this.awayTeam = awayTeam;
    this.mode = mode;
    this.settings = settings;
    this.callbacks = callbacks;
    this.clock = new THREE.Clock();

    this.matchStats = {
      homeShots: 0,
      awayShots: 0,
      homeShotsOnTarget: 0,
      awayShotsOnTarget: 0,
      homePasses: 0,
      awayPasses: 0,
      homePossessionTime: 0,
      awayPossessionTime: 0,
      homeCorners: 0,
      awayCorners: 0,
      homeTackles: 0,
      awayTackles: 0,
      homeFouls: 0,
      awayFouls: 0,
      homeYellowCards: 0,
      awayYellowCards: 0,
      homeRedCards: 0,
      awayRedCards: 0,
      goals: [],
    };

    // 1. Detect Software Gl
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Setup Three.js Scene, Camera, Renderer
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a101d);
    this.scene.fog = new THREE.FogExp2(0x0a101d, 0.007);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 300);
    this.camera.position.set(0, 32, 45);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.setSize(width, height);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(this.renderer.domElement);

    // 3. Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x14532d, 0.85);
    this.scene.add(hemiLight);

    const mainKeyLight = new THREE.DirectionalLight(0xfff7ed, 1.6);
    mainKeyLight.position.set(25, 45, 30);
    mainKeyLight.castShadow = !this.isSoftwareGl;
    if (mainKeyLight.castShadow) {
      mainKeyLight.shadow.mapSize.width = 2048;
      mainKeyLight.shadow.mapSize.height = 2048;
      mainKeyLight.shadow.camera.near = 10;
      mainKeyLight.shadow.camera.far = 120;
      const d = 55;
      mainKeyLight.shadow.camera.left = -d;
      mainKeyLight.shadow.camera.right = d;
      mainKeyLight.shadow.camera.top = d;
      mainKeyLight.shadow.camera.bottom = -d;
      mainKeyLight.shadow.bias = -0.0004;
    }
    this.scene.add(mainKeyLight);

    const rimLight = new THREE.DirectionalLight(0x60a5fa, 0.65);
    rimLight.position.set(-35, 25, -35);
    this.scene.add(rimLight);

    // 4. Build Stadium, Ball, and Players
    this.initStadiumAndActors();

    // 5. Setup Inputs
    this.setupEventListeners();

    // Start crowd audio & speech commentator
    soundEngine.startCrowdAmbience();
    soundEngine.playWhistle('single');
    commentator.commentKickoff(this.homeTeam.name, this.awayTeam.name);

    // Start Main Loop
    this.tick = this.tick.bind(this);
    this.animFrameId = requestAnimationFrame(this.tick);
  }

  private initStadiumAndActors() {
    this.stadium = buildStadium();
    this.scene.add(this.stadium.stadiumGroup);

    this.ball = createBallPhysics();
    this.scene.add(this.ball.group);

    // Spawn 11 Home Players
    this.homePlayers = [];
    const homeCoords = FORMATIONS_COORDINATES[this.homeTeam.formation] || FORMATIONS_COORDINATES['4-3-3'];
    for (let i = 0; i < 11; i++) {
      const pData = this.homeTeam.players[i] || this.homeTeam.players[0];
      const p3D = createPlayer3D(pData, this.homeTeam, true);
      const coord = homeCoords[i] || { x: -20, z: 0 };
      p3D.setPosition(coord.x, coord.z);
      this.scene.add(p3D.group);
      this.homePlayers.push(p3D);
    }

    // Spawn 11 Away Players
    this.awayPlayers = [];
    const awayCoords = FORMATIONS_COORDINATES[this.awayTeam.formation] || FORMATIONS_COORDINATES['4-3-3'];
    for (let i = 0; i < 11; i++) {
      const pData = this.awayTeam.players[i] || this.awayTeam.players[0];
      const p3D = createPlayer3D(pData, this.awayTeam, false);
      const coord = awayCoords[i] || { x: -20, z: 0 };
      p3D.setPosition(-coord.x, coord.z);
      p3D.targetRotationY = -Math.PI / 2;
      this.scene.add(p3D.group);
      this.awayPlayers.push(p3D);
    }

    // Player 1 controlled (Striker)
    const striker = this.homePlayers.find(p => p.data.position === 'ST') || this.homePlayers[9] || this.homePlayers[0];
    this.controlledPlayer = striker;
    this.callbacks.onControlledPlayerChange(this.controlledPlayer.data, this.controlledPlayer.stamina);

    // Player 2 controlled (Away Striker) for 2-player local mode
    const awayStriker = this.awayPlayers.find(p => p.data.position === 'ST') || this.awayPlayers[9] || this.awayPlayers[0];
    this.controlledPlayer2 = awayStriker;
    // Set Player 2 indicator ring to vibrant orange
    (this.controlledPlayer2.indicatorMesh.material as THREE.MeshBasicMaterial).color.setHex(0xf97316);

    this.setupPeriod(this.mode === 'penalty' ? 'penalty' : 'kickoff');
  }

  public applyTeamUpdate(newTeam: TeamData, isHome: boolean = true) {
    if (isHome) {
      this.homeTeam = newTeam;
      for (const p of this.homePlayers) {
        this.scene.remove(p.group);
      }
      this.homePlayers = [];
      const homeCoords = FORMATIONS_COORDINATES[this.homeTeam.formation] || FORMATIONS_COORDINATES['4-3-3'];
      for (let i = 0; i < 11; i++) {
        const pData = this.homeTeam.players[i] || this.homeTeam.players[0];
        const p3D = createPlayer3D(pData, this.homeTeam, true);
        const coord = homeCoords[i] || { x: -20, z: 0 };
        p3D.setPosition(coord.x, coord.z);
        this.scene.add(p3D.group);
        this.homePlayers.push(p3D);
      }
      const striker = this.homePlayers.find(p => p.data.position === 'ST') || this.homePlayers[9] || this.homePlayers[0];
      this.controlledPlayer = striker;
      this.callbacks.onControlledPlayerChange(this.controlledPlayer.data, this.controlledPlayer.stamina);
    } else {
      this.awayTeam = newTeam;
      for (const p of this.awayPlayers) {
        this.scene.remove(p.group);
      }
      this.awayPlayers = [];
      const awayCoords = FORMATIONS_COORDINATES[this.awayTeam.formation] || FORMATIONS_COORDINATES['4-3-3'];
      for (let i = 0; i < 11; i++) {
        const pData = this.awayTeam.players[i] || this.awayTeam.players[0];
        const p3D = createPlayer3D(pData, this.awayTeam, false);
        const coord = awayCoords[i] || { x: -20, z: 0 };
        p3D.setPosition(-coord.x, coord.z);
        p3D.targetRotationY = -Math.PI / 2;
        this.scene.add(p3D.group);
        this.awayPlayers.push(p3D);
      }
      const awayStriker = this.awayPlayers.find(p => p.data.position === 'ST') || this.awayPlayers[9] || this.awayPlayers[0];
      this.controlledPlayer2 = awayStriker;
      (this.controlledPlayer2.indicatorMesh.material as THREE.MeshBasicMaterial).color.setHex(0xf97316);
    }
  }

  public setupPeriod(period: 'kickoff' | 'penalty' | 'training' | 'throw_in' | 'corner' | 'goal_kick' | 'free_kick', outPos?: { x: number; z: number }) {
    if (period === 'kickoff') {
      this.ball.reset(0, 0);
      this.periodStatus = 'kickoff';
      this.callbacks.onMatchPeriodChange('kickoff');

      const st = this.homePlayers.find(p => p.data.position === 'ST') || this.homePlayers[9];
      st.setPosition(-1.2, 0);
      st.targetRotationY = Math.PI / 2;
      this.controlledPlayer = st;
      this.callbacks.onControlledPlayerChange(this.controlledPlayer.data, this.controlledPlayer.stamina);
    } else if (period === 'throw_in' && outPos) {
      this.periodStatus = 'throw_in';
      this.callbacks.onMatchPeriodChange('throw_in');
      this.ball.reset(outPos.x, outPos.z);
      this.ball.velocity.set(0, 0, 0);

      // Controlled player takes throw-in from sideline
      this.controlledPlayer.setPosition(outPos.x, outPos.z > 0 ? outPos.z + 0.6 : outPos.z - 0.6);
      this.controlledPlayer.targetRotationY = outPos.z > 0 ? -Math.PI : 0;

      // Automatically toss ball back in after 1.2s
      setTimeout(() => {
        if (this.isDestroyed || this.periodStatus !== 'throw_in') return;
        const tossDir = new THREE.Vector3(0, 0, outPos.z > 0 ? -1 : 1);
        this.ball.kick(tossDir, 0.45, 0.15, 0, this.controlledPlayer.data.id, this.homeTeam.id);
        this.periodStatus = 'playing';
        this.callbacks.onMatchPeriodChange('playing');
      }, 1200);
    } else if (period === 'corner' && outPos) {
      this.periodStatus = 'corner_kick';
      this.callbacks.onMatchPeriodChange('corner_kick');
      // Place ball on corner arc
      const cornerX = outPos.x > 0 ? 52.0 : -52.0;
      const cornerZ = outPos.z > 0 ? 33.5 : -33.5;
      this.ball.reset(cornerX, cornerZ);

      // Kicker takes position
      this.controlledPlayer.setPosition(cornerX + (outPos.x > 0 ? 1 : -1), cornerZ + (outPos.z > 0 ? 1 : -1));
      this.controlledPlayer.targetRotationY = Math.atan2(-cornerX, -cornerZ);
    } else if (period === 'goal_kick' && outPos) {
      this.periodStatus = 'goal_kick';
      this.callbacks.onMatchPeriodChange('goal_kick');
      // Placed inside 6-yard box
      const gkX = outPos.x > 0 ? 47.0 : -47.0;
      this.ball.reset(gkX, 0);

      const gk = outPos.x > 0 ? this.awayPlayers[0] : this.homePlayers[0];
      gk.setPosition(gkX + (outPos.x > 0 ? 1 : -1), 0);

      // Automatically kick downfield after 1.2s
      setTimeout(() => {
        if (this.isDestroyed || this.periodStatus !== 'goal_kick') return;
        const kickDir = new THREE.Vector3(outPos.x > 0 ? -1 : 1, 0, (Math.random() - 0.5) * 0.4).normalize();
        this.ball.kick(kickDir, 0.75, 0.35, 0, gk.data.id, outPos.x > 0 ? this.awayTeam.id : this.homeTeam.id);
        this.periodStatus = 'playing';
        this.callbacks.onMatchPeriodChange('playing');
      }, 1200);
    } else if (period === 'free_kick' && outPos) {
      this.periodStatus = 'free_kick';
      this.callbacks.onMatchPeriodChange('free_kick');
      this.ball.reset(outPos.x, outPos.z);
      this.controlledPlayer.setPosition(outPos.x - 2, outPos.z);
    } else if (period === 'penalty') {
      this.periodStatus = 'playing';
      this.ball.reset(41.5, 0);

      const kicker = this.penaltyIsUserShooting ? this.homePlayers[9] : this.awayPlayers[9];
      kicker.setPosition(38.5, 0);
      kicker.targetRotationY = Math.PI / 2;
      if (this.penaltyIsUserShooting) {
        this.controlledPlayer = kicker;
        this.callbacks.onControlledPlayerChange(kicker.data, kicker.stamina);
      }

      const gk = this.penaltyIsUserShooting ? this.awayPlayers[0] : this.homePlayers[0];
      gk.setPosition(52.2, 0);
      gk.targetRotationY = -Math.PI / 2;
    } else if (period === 'training') {
      this.ball.reset(20, 0);
      this.periodStatus = 'playing';
      this.controlledPlayer = this.homePlayers[9];
      this.controlledPlayer.setPosition(18, 0);
      this.callbacks.onControlledPlayerChange(this.controlledPlayer.data, this.controlledPlayer.stamina);
    }
  }

  private setupEventListeners() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('resize', this.handleResize);
  }

  private handleResize = () => {
    if (!this.container || this.isDestroyed) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    if (this.isPaused) return;
    const code = e.code;
    this.keys[code] = true;

    // Player 1 Switch on TAB
    if (code === 'Tab') {
      e.preventDefault();
      this.switchControlledPlayer(1);
      return;
    }

    // Player 1 Slide Tackle on KeyC
    if (code === 'KeyC') {
      this.performSlideTackle(1);
      return;
    }

    // Player 1 Charging (SPACE = Shoot, KeyX = Pass, KeyQ = Through Pass)
    if (!this.isChargingAction) {
      if (code === 'Space') {
        e.preventDefault();
        this.startCharge(1, 'shoot');
      } else if (code === 'KeyX') {
        e.preventDefault();
        this.startCharge(1, 'pass');
      } else if (code === 'KeyQ') {
        e.preventDefault();
        this.startCharge(1, 'through');
      }
    }

    // Local 2-Player Controls (Player 2 on same keyboard)
    if (this.settings.matchPlayMode === '2players_local') {
      // Player 2 Switch on KeyP
      if (code === 'KeyP') {
        this.switchControlledPlayer(2);
        return;
      }
      // Player 2 Slide Tackle on KeyO
      if (code === 'KeyO') {
        this.performSlideTackle(2);
        return;
      }
      // Player 2 Charging: KeyL = Shoot, KeyK = Pass, KeyI = Through
      if (!this.p2IsChargingAction) {
        if (code === 'KeyL') {
          this.startCharge(2, 'shoot');
        } else if (code === 'KeyK') {
          this.startCharge(2, 'pass');
        } else if (code === 'KeyI') {
          this.startCharge(2, 'through');
        }
      }
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    const code = e.code;
    this.keys[code] = false;

    // Player 1 Release
    if (this.isChargingAction) {
      if (
        (code === 'Space' && this.activeChargeAction === 'shoot') ||
        (code === 'KeyX' && this.activeChargeAction === 'pass') ||
        (code === 'KeyQ' && this.activeChargeAction === 'through')
      ) {
        this.executeChargedAction(1);
      }
    }

    // Player 2 Release
    if (this.p2IsChargingAction) {
      if (
        (code === 'KeyL' && this.p2ActiveChargeAction === 'shoot') ||
        (code === 'KeyK' && this.p2ActiveChargeAction === 'pass') ||
        (code === 'KeyI' && this.p2ActiveChargeAction === 'through')
      ) {
        this.executeChargedAction(2);
      }
    }
  };

  public startCharge(playerNum: 1 | 2, action: 'shoot' | 'pass' | 'through') {
    if (playerNum === 1) {
      this.isChargingAction = true;
      this.activeChargeAction = action;
      this.chargeStartTime = performance.now();
      this.currentChargePower = 0.1;
    } else {
      this.p2IsChargingAction = true;
      this.p2ActiveChargeAction = action;
      this.p2ChargeStartTime = performance.now();
      this.p2CurrentChargePower = 0.1;
    }
  }

  public executeChargedAction(playerNum: 1 | 2 = 1) {
    const isP1 = playerNum === 1;
    const isCharging = isP1 ? this.isChargingAction : this.p2IsChargingAction;
    const action = isP1 ? this.activeChargeAction : this.p2ActiveChargeAction;
    const power = Math.min(1.0, Math.max(0.2, isP1 ? this.currentChargePower : this.p2CurrentChargePower));

    if (!isCharging || !action) return;

    if (isP1) {
      this.isChargingAction = false;
      this.activeChargeAction = null;
      this.currentChargePower = 0;
      this.callbacks.onPowerMeterChange(0, action);
    } else {
      this.p2IsChargingAction = false;
      this.p2ActiveChargeAction = null;
      this.p2CurrentChargePower = 0;
    }

    if (this.periodStatus === 'kickoff' || this.periodStatus === 'corner_kick' || this.periodStatus === 'free_kick') {
      this.periodStatus = 'playing';
      this.callbacks.onMatchPeriodChange('playing');
    }

    if (this.mode === 'penalty') {
      this.executePenaltyKick(power);
      return;
    }

    const player = isP1 ? this.controlledPlayer : this.controlledPlayer2;
    player.triggerKick();

    const distToBall = player.position.distanceTo(this.ball.position);
    if (distToBall > 2.5) return;

    const shootDir = new THREE.Vector3(
      Math.sin(player.group.rotation.y),
      0,
      Math.cos(player.group.rotation.y)
    ).normalize();

    const attackingTargetX = isP1 ? 52.5 : -52.5;
    const teamId = isP1 ? this.homeTeam.id : this.awayTeam.id;

    if (action === 'shoot') {
      const goalTarget = new THREE.Vector3(attackingTargetX, 1.2, (Math.random() - 0.5) * 6);
      const aimDir = new THREE.Vector3().subVectors(goalTarget, player.position).normalize();
      const blendedDir = new THREE.Vector3().addVectors(shootDir.multiplyScalar(0.4), aimDir.multiplyScalar(0.6)).normalize();
      const loft = 0.18 + power * 0.35;
      const curl = (Math.random() - 0.5) * 0.4;
      
      this.ball.kick(blendedDir, power * 0.95 + 0.3, loft, curl, player.data.id, teamId);
      commentator.commentShot();

      if (isP1) {
        this.matchStats.homeShots++;
        if (Math.abs(blendedDir.z) < 0.45) this.matchStats.homeShotsOnTarget++;
      } else {
        this.matchStats.awayShots++;
        if (Math.abs(blendedDir.z) < 0.45) this.matchStats.awayShotsOnTarget++;
      }
    } else if (action === 'pass') {
      const mates = isP1 ? this.homePlayers : this.awayPlayers;
      const bestTeammate = this.findBestPassTarget(player, mates, shootDir);
      let passDir = shootDir;
      if (bestTeammate) {
        passDir = new THREE.Vector3().subVectors(bestTeammate.position, player.position).normalize();
      }
      this.ball.kick(passDir, power * 0.65 + 0.35, 0.05, 0, player.data.id, teamId);
      commentator.commentPass();
      if (isP1) this.matchStats.homePasses++;
      else this.matchStats.awayPasses++;
    } else if (action === 'through') {
      const forwardTarget = new THREE.Vector3(player.position.x + shootDir.x * 16, 0, player.position.z + shootDir.z * 16);
      const throughDir = new THREE.Vector3().subVectors(forwardTarget, player.position).normalize();
      this.ball.kick(throughDir, power * 0.75 + 0.4, 0.22, 0, player.data.id, teamId);
      if (isP1) this.matchStats.homePasses++;
      else this.matchStats.awayPasses++;
    }
  }

  // Slide Tackle (Podkat) with Foul / Card Detection
  public performSlideTackle(playerNum: 1 | 2 = 1) {
    const tackler = playerNum === 1 ? this.controlledPlayer : this.controlledPlayer2;
    tackler.triggerSlideTackle();

    // Slide forward velocity boost
    const slideDir = new THREE.Vector3(Math.sin(tackler.group.rotation.y), 0, Math.cos(tackler.group.rotation.y)).normalize();
    tackler.velocity.addScaledVector(slideDir, 7.5);

    const opponents = playerNum === 1 ? this.awayPlayers : this.homePlayers;
    const ballDist = tackler.position.distanceTo(this.ball.position);

    // Check if within tackle reach
    if (ballDist < 2.4) {
      // Find opponent carrying ball
      const opponentCarrier = opponents.find(op => op.position.distanceTo(this.ball.position) < 1.4);

      if (opponentCarrier) {
        // Evaluate tackle angle: from behind = foul, from front/side = clean tackle
        const tacklerToOpponent = new THREE.Vector3().subVectors(opponentCarrier.position, tackler.position).normalize();
        const opponentFacing = new THREE.Vector3(Math.sin(opponentCarrier.group.rotation.y), 0, Math.cos(opponentCarrier.group.rotation.y));
        const dot = tacklerToOpponent.dot(opponentFacing);

        const isCleanTackle = dot < 0.2; // Tackling from side/front

        if (isCleanTackle) {
          // Clean slide tackle! Wins ball
          this.ball.velocity.set(slideDir.x * 12, 1.2, slideDir.z * 12);
          this.ball.lastKickerId = tackler.data.id;
          this.ball.lastKickerTeamId = tackler.team.id;
          soundEngine.playKick(0.5);
          commentator.commentSlideTackle();

          if (playerNum === 1) this.matchStats.homeTackles++;
          else this.matchStats.awayTackles++;
        } else {
          // Foul! (Qoidabuzarlik)
          soundEngine.playWhistle('single');

          const isInsideBox = (Math.abs(tackler.position.x) > 36 && Math.abs(tackler.position.z) < 20);
          const isYellow = Math.random() < 0.35;
          const isRed = Math.random() < 0.08;

          if (isRed) {
            tackler.showCard('red');
            tackler.data.isRedCarded = true;
            commentator.commentFoul(false, true);
            if (playerNum === 1) this.matchStats.homeRedCards++;
            else this.matchStats.awayRedCards++;
          } else if (isYellow) {
            tackler.showCard('yellow');
            tackler.data.yellowCards = (tackler.data.yellowCards || 0) + 1;
            if (tackler.data.yellowCards >= 2) {
              tackler.showCard('red');
              tackler.data.isRedCarded = true;
              commentator.commentFoul(false, true);
            } else {
              commentator.commentFoul(true, false);
            }
            if (playerNum === 1) this.matchStats.homeYellowCards++;
            else this.matchStats.awayYellowCards++;
          } else {
            commentator.commentFoul(false, false);
          }

          if (playerNum === 1) this.matchStats.homeFouls++;
          else this.matchStats.awayFouls++;

          if (isInsideBox) {
            commentator.commentPenalty();
            this.setupPeriod('penalty');
          } else {
            commentator.commentFreeKick();
            this.setupPeriod('free_kick', { x: tackler.position.x, z: tackler.position.z });
          }

          if (this.callbacks.onFoulEvent) {
            this.callbacks.onFoulEvent({
              playerName: tackler.data.name,
              teamId: tackler.team.id,
              card: isRed ? 'red' : isYellow ? 'yellow' : 'none',
              isPenalty: isInsideBox,
            });
          }
        }
      }
    }
  }

  private executePenaltyKick(power: number) {
    const kicker = this.controlledPlayer;
    kicker.triggerKick();

    const targetZ = this.penaltyAimX * 3.2;
    const targetY = 0.4 + this.penaltyAimY * 1.8;
    const targetPos = new THREE.Vector3(52.5, targetY, targetZ);
    const kickDir = new THREE.Vector3().subVectors(targetPos, this.ball.position).normalize();

    const gk = this.awayPlayers[0];
    const gkDive = Math.random() < 0.4 ? (this.penaltyAimX > 0 ? 1 : -1) : (Math.random() < 0.5 ? -1 : 1);
    gk.triggerDive(gkDive);
    gk.velocity.z = gkDive * 4.5;

    this.ball.kick(kickDir, power * 0.85 + 0.35, targetY * 0.25, 0, kicker.data.id, this.homeTeam.id);

    // Evaluate penalty outcome after shot
    setTimeout(() => {
      if (this.isDestroyed) return;
      const scored = Math.abs(this.penaltyAimX) < 0.95 && !(gkDive === (this.penaltyAimX > 0 ? 1 : -1) && Math.abs(this.penaltyAimX) < 0.5);

      if (this.penaltyCurrentIndex < 5) {
        this.penaltyRoundsHome[this.penaltyCurrentIndex] = scored;
        if (scored) {
          this.homeScore++;
          soundEngine.playGoalNet();
          soundEngine.playGoalCelebration();
          commentator.commentGoal(kicker.data.name);
        } else {
          soundEngine.playWhistle('single');
          commentator.commentSave();
        }

        this.callbacks.onScoreUpdate(this.homeScore, this.awayScore);
        if (this.callbacks.onPenaltyRoundUpdate) {
          this.callbacks.onPenaltyRoundUpdate(false, [...this.penaltyRoundsHome], [...this.penaltyRoundsAway]);
        }

        // Now AI opponent kicks penalty after 2.2s
        setTimeout(() => {
          if (this.isDestroyed) return;
          this.executeAiPenaltyKick();
        }, 2200);
      }
    }, 1800);
  }

  private executeAiPenaltyKick() {
    this.ball.reset(41.5, 0);
    const aiKicker = this.awayPlayers[9];
    aiKicker.setPosition(38.5, 0);
    aiKicker.targetRotationY = Math.PI / 2;
    aiKicker.triggerKick();

    const aiAimX = (Math.random() - 0.5) * 1.8;
    const targetPos = new THREE.Vector3(52.5, 1.2, aiAimX * 3.0);
    const kickDir = new THREE.Vector3().subVectors(targetPos, this.ball.position).normalize();

    // Home GK dives
    const homeGk = this.homePlayers[0];
    const diveDir = Math.random() < 0.5 ? 1 : -1;
    homeGk.triggerDive(diveDir);
    homeGk.velocity.z = diveDir * 4.5;

    this.ball.kick(kickDir, 0.8, 0.25, 0, aiKicker.data.id, this.awayTeam.id);

    setTimeout(() => {
      if (this.isDestroyed) return;
      const aiScored = Math.random() < 0.7;
      if (this.penaltyCurrentIndex < 5) {
        this.penaltyRoundsAway[this.penaltyCurrentIndex] = aiScored;
        if (aiScored) {
          this.awayScore++;
          soundEngine.playGoalNet();
          commentator.commentGoal(aiKicker.data.name);
        } else {
          soundEngine.playWhistle('single');
          commentator.commentSave();
        }

        this.penaltyCurrentIndex++;
        this.callbacks.onScoreUpdate(this.homeScore, this.awayScore);
        if (this.callbacks.onPenaltyRoundUpdate) {
          this.callbacks.onPenaltyRoundUpdate(true, [...this.penaltyRoundsHome], [...this.penaltyRoundsAway]);
        }

        // Check if 5 rounds completed
        if (this.penaltyCurrentIndex >= 5) {
          soundEngine.playWhistle('triple');
          this.periodStatus = 'fulltime';
          this.currentHalf = 'ended';
          this.callbacks.onMatchPeriodChange('fulltime');
        } else {
          // Setup next penalty kick for user
          this.setupPeriod('penalty');
        }
      }
    }, 1800);
  }

  private findBestPassTarget(passer: Player3D, teamMates: Player3D[], dir: THREE.Vector3): Player3D | null {
    let bestTeammate: Player3D | null = null;
    let bestScore = -999;

    for (const mate of teamMates) {
      if (mate === passer) continue;
      const vecTo = new THREE.Vector3().subVectors(mate.position, passer.position);
      const dist = vecTo.length();
      if (dist < 3 || dist > 38) continue;
      vecTo.normalize();

      const dot = vecTo.dot(dir);
      if (dot > 0.3) {
        const score = dot * 10 - (dist * 0.15);
        if (score > bestScore) {
          bestScore = score;
          bestTeammate = mate;
        }
      }
    }
    return bestTeammate;
  }

  public switchControlledPlayer(playerNum: 1 | 2 = 1, nearestToBall = false) {
    const isP1 = playerNum === 1;
    const candidates = (isP1 ? this.homePlayers : this.awayPlayers)
      .filter(p => p !== (isP1 ? this.controlledPlayer : this.controlledPlayer2) && p.data.position !== 'GK')
      .sort((a, b) => a.position.distanceTo(this.ball.position) - b.position.distanceTo(this.ball.position));

    if (candidates.length > 0) {
      if (isP1) {
        this.controlledPlayer = candidates[0];
        this.callbacks.onControlledPlayerChange(this.controlledPlayer.data, this.controlledPlayer.stamina);
      } else {
        // Reset old indicator
        (this.controlledPlayer2.indicatorMesh.material as THREE.MeshBasicMaterial).opacity = 0;
        this.controlledPlayer2 = candidates[0];
        (this.controlledPlayer2.indicatorMesh.material as THREE.MeshBasicMaterial).opacity = 0.9;
        (this.controlledPlayer2.indicatorMesh.material as THREE.MeshBasicMaterial).color.setHex(0xf97316);
      }
      soundEngine.playUiClick();
    }
  }

  // Main Simulation Loop
  private tick() {
    if (this.isDestroyed) return;
    const dt = Math.min(this.clock.getDelta(), 0.1);

    if (!this.isPaused) {
      this.updateSimulation(dt);
    }

    this.updateCamera(dt);
    this.renderer.render(this.scene, this.camera);

    this.animFrameId = requestAnimationFrame(this.tick);
  }

  private updateSimulation(dt: number) {
    // 1. Advance Match Clock & Extra Time Logic
    if (this.periodStatus === 'playing') {
      const totalMatchRealSeconds = (this.settings.matchDurationMinutes || 3) * 60;
      const timeScale = 5400 / totalMatchRealSeconds;
      this.matchTimeSeconds += dt * timeScale;

      const currentMinute = Math.floor(this.matchTimeSeconds / 60);
      const currentSecond = Math.floor(this.matchTimeSeconds % 60);

      this.callbacks.onTimeUpdate(currentMinute, currentSecond, this.currentHalf);

      // Half-time check (45 min)
      if (this.currentHalf === 1 && currentMinute >= 45) {
        this.periodStatus = 'halftime';
        this.currentHalf = 2;
        soundEngine.playWhistle('double');
        this.callbacks.onMatchPeriodChange('halftime');
      }

      // Full-time check (90 min)
      if (this.currentHalf === 2 && currentMinute >= 90) {
        if (this.homeScore === this.awayScore) {
          // TIED AT 90 MINS -> 15-SECOND 1ST EXTRA TIME!
          this.currentHalf = 'extra';
          this.periodStatus = 'extra_time_1';
          this.extraTimeCountdown = 15;
          soundEngine.playWhistle('double');
          commentator.commentExtraTime();
          this.callbacks.onMatchPeriodChange('extra_time_1');
        } else {
          // Decided in regular time
          this.periodStatus = 'fulltime';
          this.currentHalf = 'ended';
          soundEngine.playWhistle('triple');
          this.callbacks.onMatchPeriodChange('fulltime');
        }
      }
    } else if (this.periodStatus === 'extra_time_1') {
      // 15 seconds 1st Extra Time countdown
      this.extraTimeCountdown -= dt;
      this.callbacks.onTimeUpdate(90 + Math.floor((15 - this.extraTimeCountdown) * 2), 0, 'extra');

      if (this.extraTimeCountdown <= 0) {
        // Whistle -> 2nd Extra Time (15 seconds)
        soundEngine.playWhistle('single');
        this.periodStatus = 'extra_time_2';
        this.extraTimeCountdown = 15;
        this.callbacks.onMatchPeriodChange('extra_time_2');
      }
    } else if (this.periodStatus === 'extra_time_2') {
      // 15 seconds 2nd Extra Time countdown
      this.extraTimeCountdown -= dt;
      this.callbacks.onTimeUpdate(105 + Math.floor((15 - this.extraTimeCountdown) * 2), 0, 'extra');

      if (this.extraTimeCountdown <= 0) {
        soundEngine.playWhistle('triple');
        if (this.homeScore === this.awayScore) {
          // STILL TIED -> 5-PENALTY SHOOTOUT TIEBREAKER!
          this.periodStatus = 'penalty_shootout';
          this.currentHalf = 'penalties';
          commentator.commentPenalties();
          this.setupPeriod('penalty');
          this.callbacks.onMatchPeriodChange('penalty_shootout');
        } else {
          this.periodStatus = 'fulltime';
          this.currentHalf = 'ended';
          this.callbacks.onMatchPeriodChange('fulltime');
        }
      }
    }

    // 2. Action Charge Progress
    if (this.isChargingAction && this.activeChargeAction) {
      const elapsed = (performance.now() - this.chargeStartTime) / 1000;
      this.currentChargePower = Math.min(1.0, elapsed * 1.5);
      this.callbacks.onPowerMeterChange(this.currentChargePower, this.activeChargeAction);
    }
    if (this.p2IsChargingAction && this.p2ActiveChargeAction) {
      const elapsed = (performance.now() - this.p2ChargeStartTime) / 1000;
      this.p2CurrentChargePower = Math.min(1.0, elapsed * 1.5);
    }

    // 3. Penalty Aim Oscillation
    if (this.mode === 'penalty' || this.periodStatus === 'penalty_shootout') {
      this.penaltyAimX += this.penaltyAimDir * dt * 1.8;
      if (this.penaltyAimX > 1) {
        this.penaltyAimX = 1;
        this.penaltyAimDir = -1;
      } else if (this.penaltyAimX < -1) {
        this.penaltyAimX = -1;
        this.penaltyAimDir = 1;
      }
    }

    // 4. Update Ball Physics & Out of Bounds
    const ballResult = this.ball.update(dt);
    if (ballResult.isGoal) {
      this.handleGoal(ballResult.goalSide || 'home');
    } else if (ballResult.outOfBounds === 'side' && this.periodStatus === 'playing') {
      // Side Out -> Throw-in
      soundEngine.playWhistle('single');
      commentator.commentThrowIn();
      this.setupPeriod('throw_in', ballResult.outPos);
      if (this.callbacks.onOutEvent) {
        this.callbacks.onOutEvent({ type: 'throw_in', awardedTeam: 'Throw-in' });
      }
    } else if (ballResult.outOfBounds === 'end' && this.periodStatus === 'playing') {
      // Endline Out -> Corner Kick or Goal Kick
      soundEngine.playWhistle('single');
      const isCorner = (ballResult.endSide === 'away' && this.ball.lastKickerTeamId === this.awayTeam.id) ||
                       (ballResult.endSide === 'home' && this.ball.lastKickerTeamId === this.homeTeam.id);

      if (isCorner) {
        commentator.commentCorner();
        this.setupPeriod('corner', ballResult.outPos);
        if (this.callbacks.onOutEvent) {
          this.callbacks.onOutEvent({ type: 'corner', awardedTeam: 'Corner Kick' });
        }
      } else {
        commentator.commentGoalKick();
        this.setupPeriod('goal_kick', ballResult.outPos);
        if (this.callbacks.onOutEvent) {
          this.callbacks.onOutEvent({ type: 'goal_kick', awardedTeam: 'Goal Kick' });
        }
      }
    }

    // 5. Update Controlled Players Input
    this.updateControlledPlayerInput(1, dt);
    if (this.settings.matchPlayMode === '2players_local') {
      this.updateControlledPlayerInput(2, dt);
    }

    // 6. Update Team AI
    this.updateTeamAI(dt);

    // 7. Update All 3D Player Meshes
    for (const p of this.homePlayers) {
      p.update(dt, p === this.controlledPlayer);
    }
    for (const p of this.awayPlayers) {
      const isP2 = this.settings.matchPlayMode === '2players_local' && p === this.controlledPlayer2;
      p.update(dt, isP2);
    }

    // 8. Auto-Switch Player Check
    if (this.settings.autoSwitch && this.periodStatus === 'playing') {
      const distToControlled = this.controlledPlayer.position.distanceTo(this.ball.position);
      if (distToControlled > 16) {
        this.switchControlledPlayer(1, true);
      }
    }

    // 9. Modulate Crowd Noise
    const distToAnyGoal = Math.min(
      Math.abs(this.ball.position.x - 52.5),
      Math.abs(this.ball.position.x - (-52.5))
    );
    const danger = Math.max(0, 1 - distToAnyGoal / 32);
    soundEngine.modulateCrowdExcitement(danger);
  }

  private updateControlledPlayerInput(playerNum: 1 | 2, dt: number) {
    if (this.periodStatus !== 'playing' && this.periodStatus !== 'kickoff' && this.periodStatus !== 'extra_time_1' && this.periodStatus !== 'extra_time_2') return;

    const player = playerNum === 1 ? this.controlledPlayer : this.controlledPlayer2;
    let moveX = 0;
    let moveZ = 0;

    if (playerNum === 1) {
      if (this.keys['KeyW']) moveX += 1;
      if (this.keys['KeyS']) moveX -= 1;
      if (this.keys['KeyA']) moveZ -= 1;
      if (this.keys['KeyD']) moveZ += 1;

      if (Math.abs(this.joystickVector.x) > 0.1 || Math.abs(this.joystickVector.y) > 0.1) {
        moveX = -this.joystickVector.y;
        moveZ = this.joystickVector.x;
      }
    } else {
      // Player 2 Arrow Keys
      if (this.keys['ArrowUp']) moveX += 1;
      if (this.keys['ArrowDown']) moveX -= 1;
      if (this.keys['ArrowLeft']) moveZ -= 1;
      if (this.keys['ArrowRight']) moveZ += 1;
    }

    const inputVec = new THREE.Vector2(moveX, moveZ);
    const isMoving = inputVec.lengthSq() > 0.05;

    const isSprinting = playerNum === 1
      ? (this.keys['ShiftLeft'] || this.keys['ShiftRight']) && player.stamina > 10
      : (this.keys['ControlRight'] || this.keys['ShiftRight']) && player.stamina > 10;

    if (isSprinting && isMoving) {
      player.stamina = Math.max(0, player.stamina - dt * 14);
    } else {
      player.stamina = Math.min(100, player.stamina + dt * 8);
    }

    const baseSpeed = 5.5 + (player.data.attributes.pace / 100) * 3.5;
    const currentSpeed = isSprinting ? baseSpeed * 1.35 : baseSpeed;

    if (isMoving) {
      inputVec.normalize();
      player.velocity.x = inputVec.x * currentSpeed;
      player.velocity.z = inputVec.y * currentSpeed;

      player.targetRotationY = Math.atan2(inputVec.x, inputVec.y);
      player.position.x += player.velocity.x * dt;
      player.position.z += player.velocity.z * dt;

      player.position.x = Math.max(-51, Math.min(51, player.position.x));
      player.position.z = Math.max(-33, Math.min(33, player.position.z));
    } else {
      player.velocity.set(0, 0, 0);
    }

    // Dribble touch
    const distToBall = player.position.distanceTo(this.ball.position);
    if (distToBall < 1.15 && this.ball.position.y < 0.8) {
      const forwardDir = new THREE.Vector3(
        Math.sin(player.group.rotation.y),
        0,
        Math.cos(player.group.rotation.y)
      ).normalize();

      const targetBallPos = new THREE.Vector3().copy(player.position).addScaledVector(forwardDir, 0.75);
      this.ball.position.x = THREE.MathUtils.damp(this.ball.position.x, targetBallPos.x, 18, dt);
      this.ball.position.z = THREE.MathUtils.damp(this.ball.position.z, targetBallPos.z, 18, dt);
      this.ball.velocity.x = player.velocity.x * 1.05;
      this.ball.velocity.z = player.velocity.z * 1.05;
      this.ball.lastKickerId = player.data.id;
      this.ball.lastKickerTeamId = player.team.id;
    }
  }

  private updateTeamAI(dt: number) {
    const ballPos = this.ball.position;
    const diff = this.settings.difficulty;
    const aiSpeedMult = diff === 'legend' ? 1.08 : (diff === 'amateur' ? 0.95 : 0.82);
    const aiPressDist = diff === 'legend' ? 24 : (diff === 'amateur' ? 18 : 12);

    // 1. Home Teammates AI
    const homeCoords = FORMATIONS_COORDINATES[this.homeTeam.formation] || FORMATIONS_COORDINATES['4-3-3'];
    for (let i = 0; i < this.homePlayers.length; i++) {
      const p = this.homePlayers[i];
      if (p === this.controlledPlayer) continue;

      if (p.data.position === 'GK') {
        this.updateGoalkeeperAI(p, true, dt);
        continue;
      }

      const base = homeCoords[i] || { x: -20, z: 0 };
      const targetX = base.x + (ballPos.x * 0.35);
      const targetZ = base.z + (ballPos.z * 0.2);

      const dx = targetX - p.position.x;
      const dz = targetZ - p.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist > 1.5) {
        const speed = 4.2 * Math.min(dist * 0.8, 1);
        p.velocity.x = (dx / dist) * speed;
        p.velocity.z = (dz / dist) * speed;
        p.position.x += p.velocity.x * dt;
        p.position.z += p.velocity.z * dt;
        p.targetRotationY = Math.atan2(p.velocity.x, p.velocity.z);
      } else {
        p.velocity.set(0, 0, 0);
        p.targetRotationY = Math.atan2(ballPos.x - p.position.x, ballPos.z - p.position.z);
      }
    }

    // 2. Away Opponents AI (if not controlled locally by Player 2)
    const awayCoords = FORMATIONS_COORDINATES[this.awayTeam.formation] || FORMATIONS_COORDINATES['4-3-3'];
    
    let closestAway: Player3D = this.awayPlayers[1];
    let minAwayDist = 999;
    for (let i = 1; i < this.awayPlayers.length; i++) {
      const d = this.awayPlayers[i].position.distanceTo(ballPos);
      if (d < minAwayDist) {
        minAwayDist = d;
        closestAway = this.awayPlayers[i];
      }
    }

    for (let i = 0; i < this.awayPlayers.length; i++) {
      const p = this.awayPlayers[i];
      if (this.settings.matchPlayMode === '2players_local' && p === this.controlledPlayer2) continue;

      if (p.data.position === 'GK') {
        this.updateGoalkeeperAI(p, false, dt);
        continue;
      }

      const isPrimaryPresser = (p === closestAway);
      const distToBall = p.position.distanceTo(ballPos);

      if (isPrimaryPresser && distToBall < aiPressDist && (this.periodStatus === 'playing' || this.periodStatus === 'extra_time_1' || this.periodStatus === 'extra_time_2')) {
        const dx = ballPos.x - p.position.x;
        const dz = ballPos.z - p.position.z;
        const d = Math.sqrt(dx * dx + dz * dz);

        const runSpeed = 6.2 * aiSpeedMult;
        p.velocity.x = (dx / d) * runSpeed;
        p.velocity.z = (dz / d) * runSpeed;
        p.position.x += p.velocity.x * dt;
        p.position.z += p.velocity.z * dt;
        p.targetRotationY = Math.atan2(p.velocity.x, p.velocity.z);

        if (d < 1.1) {
          const distToGoal = p.position.distanceTo(new THREE.Vector3(-52.5, 0, 0));
          if (distToGoal < 24 && Math.random() < 0.04) {
            p.triggerKick();
            const goalAim = new THREE.Vector3(-52.5, 1.2, (Math.random() - 0.5) * 5);
            const shootDir = new THREE.Vector3().subVectors(goalAim, p.position).normalize();
            this.ball.kick(shootDir, 0.85, 0.25, 0, p.data.id, this.awayTeam.id);
            commentator.commentShot();
            this.matchStats.awayShots++;
          } else if (Math.random() < 0.03) {
            p.triggerKick();
            const mate = this.awayPlayers[1 + Math.floor(Math.random() * 10)];
            if (mate && mate !== p) {
              const passDir = new THREE.Vector3().subVectors(mate.position, p.position).normalize();
              this.ball.kick(passDir, 0.65, 0.05, 0, p.data.id, this.awayTeam.id);
              this.matchStats.awayPasses++;
            }
          } else {
            this.ball.velocity.x = -runSpeed * 0.95;
            this.ball.velocity.z = p.velocity.z;
            this.ball.position.x = p.position.x - 0.7;
            this.ball.position.z = p.position.z;
            this.ball.lastKickerId = p.data.id;
            this.ball.lastKickerTeamId = this.awayTeam.id;
          }
        }
      } else {
        const base = awayCoords[i] || { x: -20, z: 0 };
        const targetX = -base.x + (ballPos.x * 0.35);
        const targetZ = base.z + (ballPos.z * 0.2);

        const dx = targetX - p.position.x;
        const dz = targetZ - p.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist > 1.8) {
          const speed = 4.2 * aiSpeedMult;
          p.velocity.x = (dx / dist) * speed;
          p.velocity.z = (dz / dist) * speed;
          p.position.x += p.velocity.x * dt;
          p.position.z += p.velocity.z * dt;
          p.targetRotationY = Math.atan2(p.velocity.x, p.velocity.z);
        } else {
          p.velocity.set(0, 0, 0);
          p.targetRotationY = -Math.PI / 2;
        }
      }
    }
  }

  private updateGoalkeeperAI(gk: Player3D, isHome: boolean, dt: number) {
    const goalX = isHome ? -52.0 : 52.0;
    const facingDir = isHome ? 1 : -1;
    const ballPos = this.ball.position;

    const targetZ = Math.max(-3.0, Math.min(3.0, ballPos.z * 0.28));
    const targetX = goalX + facingDir * Math.max(0.2, Math.min(4.5, Math.abs(ballPos.x - goalX) * 0.12));

    const dz = targetZ - gk.position.z;
    gk.position.z += dz * Math.min(dt * 8, 1);
    gk.position.x = targetX;
    gk.targetRotationY = isHome ? Math.PI / 2 : -Math.PI / 2;

    const distToBall = gk.position.distanceTo(ballPos);
    const ballHeadingTowardGoal = (isHome && this.ball.velocity.x < -6) || (!isHome && this.ball.velocity.x > 6);
    
    if (distToBall < 5.5 && ballHeadingTowardGoal && gk.diveTimer <= 0) {
      const diveDir = ballPos.z > gk.position.z ? 1 : -1;
      gk.triggerDive(diveDir);
      
      if (distToBall < 2.5) {
        soundEngine.playKick(0.3);
        commentator.commentSave();
        this.ball.velocity.x = facingDir * (12 + Math.random() * 6);
        this.ball.velocity.y = 4 + Math.random() * 4;
        this.ball.velocity.z = (Math.random() - 0.5) * 14;
      }
    }
  }

  private handleGoal(scoringSide: 'home' | 'away') {
    if (this.periodStatus === 'goal_replay') return;
    this.periodStatus = 'goal_replay';
    this.celebrationTimer = 4.0;

    let scorerName = 'Striker';
    let teamId = this.homeTeam.id;

    if (scoringSide === 'home') {
      this.homeScore++;
      teamId = this.homeTeam.id;
      this.lastGoalScorer = this.controlledPlayer;
      scorerName = this.controlledPlayer.data.name;
    } else {
      this.awayScore++;
      teamId = this.awayTeam.id;
      this.lastGoalScorer = this.awayPlayers[9];
      scorerName = this.awayPlayers[9].data.name;
    }

    if (this.lastGoalScorer) {
      this.lastGoalScorer.triggerCelebration();
    }

    commentator.commentGoal(scorerName);

    const currentMinute = Math.max(1, Math.floor(this.matchTimeSeconds / 60));
    const shotSpeed = Math.floor(85 + Math.random() * 32);

    this.matchStats.goals.push({
      scorerName,
      teamId,
      minute: currentMinute,
      shotSpeedKmh: shotSpeed,
    });

    this.callbacks.onScoreUpdate(this.homeScore, this.awayScore);
    this.callbacks.onGoal(scorerName, teamId, shotSpeed);
    this.callbacks.onMatchPeriodChange('goal_replay');

    setTimeout(() => {
      if (this.isDestroyed) return;
      this.setupPeriod('kickoff');
    }, 4200);
  }

  private updateCamera(dt: number) {
    const ballPos = this.ball.position;

    if (this.periodStatus === 'goal_replay' && this.lastGoalScorer) {
      this.replayCamAngle += dt * 1.2;
      const target = this.lastGoalScorer.position;
      const camX = target.x + Math.sin(this.replayCamAngle) * 9;
      const camZ = target.z + Math.cos(this.replayCamAngle) * 9;
      this.camera.position.set(camX, target.y + 4.2, camZ);
      this.camera.lookAt(target.x, target.y + 1.2, target.z);
      return;
    }

    if (this.mode === 'penalty' || this.periodStatus === 'penalty_shootout') {
      this.camera.position.set(29, 3.8, 0);
      this.camera.lookAt(52.5, 1.4, 0);
      return;
    }

    const mode = this.settings.cameraMode;

    if (mode === 'tele') {
      const targetCamX = THREE.MathUtils.damp(this.camera.position.x, ballPos.x * 0.75, 5, dt);
      const targetCamZ = 38;
      const targetCamY = 26;
      this.camera.position.set(targetCamX, targetCamY, targetCamZ);
      this.camera.lookAt(ballPos.x * 0.85, 0, ballPos.z * 0.4);
    } else if (mode === 'dynamic') {
      const player = this.controlledPlayer;
      const behindX = player.position.x - Math.sin(player.group.rotation.y) * 11;
      const behindZ = player.position.z - Math.cos(player.group.rotation.y) * 11;
      this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, behindX, 6, dt);
      this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, 7.5, 6, dt);
      this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, behindZ, 6, dt);
      this.camera.lookAt(ballPos.x, 1.2, ballPos.z);
    } else if (mode === 'topdown') {
      this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, ballPos.x, 8, dt);
      this.camera.position.y = 52;
      this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, ballPos.z, 8, dt);
      this.camera.lookAt(ballPos.x, 0, ballPos.z);
    } else if (mode === 'endtoend') {
      this.camera.position.x = -64;
      this.camera.position.y = 16;
      this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, ballPos.z * 0.45, 6, dt);
      this.camera.lookAt(ballPos.x * 0.5, 0, ballPos.z * 0.7);
    }
  }

  public setPaused(paused: boolean) {
    this.isPaused = paused;
  }

  public destroy() {
    this.isDestroyed = true;
    cancelAnimationFrame(this.animFrameId);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('resize', this.handleResize);

    if (this.renderer && this.renderer.domElement && this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}
