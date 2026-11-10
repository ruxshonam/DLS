import * as THREE from 'three';

export interface StadiumObjects {
  stadiumGroup: THREE.Group;
  pitchMesh: THREE.Mesh;
  leftGoalGroup: THREE.Group;
  rightGoalGroup: THREE.Group;
  leftNetMesh: THREE.Mesh;
  rightNetMesh: THREE.Mesh;
  ledBoards: THREE.Mesh[];
  floodlights: THREE.Light[];
}

export function buildStadium(): StadiumObjects {
  const stadiumGroup = new THREE.Group();
  stadiumGroup.name = 'Stadium';

  // 1. Procedural Turf Texture with Alternating Mow Stripes and Pitch Markings
  const pitchWidth = 68; // Z axis (-34 to 34)
  const pitchLength = 105; // X axis (-52.5 to 52.5)

  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Base grass color
  ctx.fillStyle = '#1e7b34';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Mow stripes (alternating grass cuts)
  const stripeCount = 20;
  const stripeWidth = canvas.width / stripeCount;
  for (let i = 0; i < stripeCount; i++) {
    if (i % 2 === 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
    } else {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    }
    ctx.fillRect(i * stripeWidth, 0, stripeWidth, canvas.height);
  }

  // Subtle turf grain noise
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 14;
    data[i] = Math.max(0, Math.min(255, data[i] + noise));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise * 1.2));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  // Draw Football Pitch Markings
  // Margin inside canvas
  const mx = 60;
  const my = 40;
  const pw = canvas.width - mx * 2;
  const ph = canvas.height - my * 2;

  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 6;
  ctx.lineCap = 'square';

  // Outer boundary line
  ctx.strokeRect(mx, my, pw, ph);

  // Halfway line
  const midX = mx + pw / 2;
  ctx.beginPath();
  ctx.moveTo(midX, my);
  ctx.lineTo(midX, my + ph);
  ctx.stroke();

  // Center circle (9.15m radius relative to 105m pitch length)
  const circleRadius = (9.15 / pitchLength) * pw;
  ctx.beginPath();
  ctx.arc(midX, my + ph / 2, circleRadius, 0, Math.PI * 2);
  ctx.stroke();

  // Center spot
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(midX, my + ph / 2, 7, 0, Math.PI * 2);
  ctx.fill();

  // Penalty Boxes (16.5m into pitch, 40.32m wide)
  const penBoxLen = (16.5 / pitchLength) * pw;
  const penBoxWid = (40.32 / pitchWidth) * ph;
  const penBoxTop = my + (ph - penBoxWid) / 2;

  // Left penalty box
  ctx.strokeRect(mx, penBoxTop, penBoxLen, penBoxWid);
  // Right penalty box
  ctx.strokeRect(mx + pw - penBoxLen, penBoxTop, penBoxLen, penBoxWid);

  // Goal Areas / 6-yard boxes (5.5m into pitch, 18.32m wide)
  const sixYardLen = (5.5 / pitchLength) * pw;
  const sixYardWid = (18.32 / pitchWidth) * ph;
  const sixYardTop = my + (ph - sixYardWid) / 2;

  ctx.strokeRect(mx, sixYardTop, sixYardLen, sixYardWid);
  ctx.strokeRect(mx + pw - sixYardLen, sixYardTop, sixYardLen, sixYardWid);

  // Penalty Spots (11m from goal line)
  const penSpotDist = (11 / pitchLength) * pw;
  ctx.beginPath();
  ctx.arc(mx + penSpotDist, my + ph / 2, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(mx + pw - penSpotDist, my + ph / 2, 6, 0, Math.PI * 2);
  ctx.fill();

  // Penalty Arcs (9.15m radius centered at penalty spot, outside box)
  ctx.beginPath();
  ctx.arc(mx + penSpotDist, my + ph / 2, circleRadius, -0.92, 0.92);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(mx + pw - penSpotDist, my + ph / 2, circleRadius, Math.PI - 0.92, Math.PI + 0.92);
  ctx.stroke();

  // Corner Arcs (1m radius)
  const cornerR = (1.5 / pitchLength) * pw;
  // Top-left
  ctx.beginPath();
  ctx.arc(mx, my, cornerR, 0, Math.PI / 2);
  ctx.stroke();
  // Bottom-left
  ctx.beginPath();
  ctx.arc(mx, my + ph, cornerR, -Math.PI / 2, 0);
  ctx.stroke();
  // Top-right
  ctx.beginPath();
  ctx.arc(mx + pw, my, cornerR, Math.PI / 2, Math.PI);
  ctx.stroke();
  // Bottom-right
  ctx.beginPath();
  ctx.arc(mx + pw, my + ph, cornerR, Math.PI, Math.PI * 1.5);
  ctx.stroke();

  const turfTexture = new THREE.CanvasTexture(canvas);
  turfTexture.colorSpace = THREE.SRGBColorSpace;
  turfTexture.anisotropy = 8;
  turfTexture.wrapS = THREE.ClampToEdgeWrapping;
  turfTexture.wrapT = THREE.ClampToEdgeWrapping;

  // Pitch Plane (slightly larger than playable lines for grass run-off)
  const totalPitchLength = pitchLength + 12;
  const totalPitchWidth = pitchWidth + 12;
  const pitchGeo = new THREE.PlaneGeometry(totalPitchLength, totalPitchWidth);
  const pitchMat = new THREE.MeshStandardMaterial({
    map: turfTexture,
    roughness: 0.85,
    metalness: 0.05,
  });
  const pitchMesh = new THREE.Mesh(pitchGeo, pitchMat);
  pitchMesh.rotation.x = -Math.PI / 2;
  pitchMesh.receiveShadow = true;
  stadiumGroup.add(pitchMesh);

  // Outer Athletic Track / Apron
  const trackGeo = new THREE.PlaneGeometry(totalPitchLength + 18, totalPitchWidth + 18);
  const trackMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.9,
    metalness: 0.1,
  });
  const trackMesh = new THREE.Mesh(trackGeo, trackMat);
  trackMesh.rotation.x = -Math.PI / 2;
  trackMesh.position.y = -0.05;
  trackMesh.receiveShadow = true;
  stadiumGroup.add(trackMesh);

  // 2. Realistic 3D Goals & Nets
  const goalWidth = 7.32;
  const goalHeight = 2.44;
  const goalDepth = 2.2;
  const postRadius = 0.08;

  const postMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.25,
    metalness: 0.4,
  });

  // Net procedural texture (diamond mesh pattern)
  const netCanvas = document.createElement('canvas');
  netCanvas.width = 128;
  netCanvas.height = 128;
  const nctx = netCanvas.getContext('2d')!;
  nctx.fillStyle = 'rgba(255, 255, 255, 0)';
  nctx.fillRect(0, 0, 128, 128);
  nctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
  nctx.lineWidth = 2;
  for (let i = -128; i < 256; i += 16) {
    nctx.beginPath();
    nctx.moveTo(i, 0);
    nctx.lineTo(i + 128, 128);
    nctx.stroke();

    nctx.beginPath();
    nctx.moveTo(i + 128, 0);
    nctx.lineTo(i, 128);
    nctx.stroke();
  }
  const netTexture = new THREE.CanvasTexture(netCanvas);
  netTexture.wrapS = THREE.RepeatWrapping;
  netTexture.wrapT = THREE.RepeatWrapping;
  netTexture.repeat.set(8, 4);

  const netMat = new THREE.MeshStandardMaterial({
    map: netTexture,
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide,
    roughness: 0.9,
    depthWrite: false,
  });

  function createGoal(isLeft: boolean): { goalGroup: THREE.Group; netMesh: THREE.Mesh } {
    const goalGroup = new THREE.Group();
    const xPos = isLeft ? -52.5 : 52.5;
    const facingDir = isLeft ? 1 : -1;

    // Crossbar
    const crossbarGeo = new THREE.CylinderGeometry(postRadius, postRadius, goalWidth, 16);
    const crossbar = new THREE.Mesh(crossbarGeo, postMat);
    crossbar.rotation.x = Math.PI / 2;
    crossbar.position.set(0, goalHeight, 0);
    crossbar.castShadow = true;
    goalGroup.add(crossbar);

    // Left & Right upright posts
    const postGeo = new THREE.CylinderGeometry(postRadius, postRadius, goalHeight, 16);
    const post1 = new THREE.Mesh(postGeo, postMat);
    post1.position.set(0, goalHeight / 2, -goalWidth / 2);
    post1.castShadow = true;
    goalGroup.add(post1);

    const post2 = new THREE.Mesh(postGeo, postMat);
    post2.position.set(0, goalHeight / 2, goalWidth / 2);
    post2.castShadow = true;
    goalGroup.add(post2);

    // Back Stanchions / Support Frame
    const backBarGeo = new THREE.CylinderGeometry(0.04, 0.04, goalWidth, 12);
    const backGroundBar = new THREE.Mesh(backBarGeo, postMat);
    backGroundBar.rotation.x = Math.PI / 2;
    backGroundBar.position.set(-facingDir * goalDepth, 0.04, 0);
    goalGroup.add(backGroundBar);

    const backTopBar = new THREE.Mesh(backBarGeo, postMat);
    backTopBar.rotation.x = Math.PI / 2;
    backTopBar.position.set(-facingDir * (goalDepth * 0.8), goalHeight * 0.9, 0);
    goalGroup.add(backTopBar);

    // Top diagonal supports
    const diagLen = Math.sqrt((goalDepth * 0.8) ** 2 + (goalHeight * 0.1) ** 2);
    const diagGeo = new THREE.CylinderGeometry(0.04, 0.04, diagLen, 12);
    const diag1 = new THREE.Mesh(diagGeo, postMat);
    diag1.position.set(-facingDir * (goalDepth * 0.4), goalHeight * 0.95, -goalWidth / 2);
    diag1.rotation.z = facingDir * Math.atan2(goalDepth * 0.8, goalHeight * 0.1);
    goalGroup.add(diag1);

    const diag2 = new THREE.Mesh(diagGeo, postMat);
    diag2.position.set(-facingDir * (goalDepth * 0.4), goalHeight * 0.95, goalWidth / 2);
    diag2.rotation.z = facingDir * Math.atan2(goalDepth * 0.8, goalHeight * 0.1);
    goalGroup.add(diag2);

    // Net Box (composite back, top, sides)
    const netGeo = new THREE.BoxGeometry(goalDepth, goalHeight, goalWidth);
    const netMesh = new THREE.Mesh(netGeo, netMat);
    netMesh.position.set(-facingDir * (goalDepth / 2), goalHeight / 2, 0);
    goalGroup.add(netMesh);

    goalGroup.position.set(xPos, 0, 0);
    return { goalGroup, netMesh };
  }

  const leftGoal = createGoal(true);
  const rightGoal = createGoal(false);
  stadiumGroup.add(leftGoal.goalGroup);
  stadiumGroup.add(rightGoal.goalGroup);

  // 3. Corner Flags
  const flagMat = new THREE.MeshStandardMaterial({ color: 0xef4444, side: THREE.DoubleSide });
  const flagPoleMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const corners = [
    { x: -52.5, z: -34 },
    { x: -52.5, z: 34 },
    { x: 52.5, z: -34 },
    { x: 52.5, z: 34 },
  ];
  corners.forEach(c => {
    const flagGroup = new THREE.Group();
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.5, 8), flagPoleMat);
    pole.position.y = 0.75;
    flagGroup.add(pole);

    const cloth = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.25), flagMat);
    cloth.position.set(0.2, 1.35, 0);
    flagGroup.add(cloth);

    flagGroup.position.set(c.x, 0, c.z);
    stadiumGroup.add(flagGroup);
  });

  // 4. Perimeter Animated LED Advertising Boards
  const ledBoards: THREE.Mesh[] = [];
  const ledCanvas = document.createElement('canvas');
  ledCanvas.width = 1024;
  ledCanvas.height = 128;
  const lctx = ledCanvas.getContext('2d')!;
  
  const drawLedContent = () => {
    lctx.fillStyle = '#080e1a';
    lctx.fillRect(0, 0, 1024, 128);
    // Draw repeating sponsor panels
    const ads = [
      { text: 'DREAM LEAGUE 3D', col: '#38bdf8' },
      { text: 'ULTIMATE FOOTBALL', col: '#facc15' },
      { text: 'CHAMPIONS TROPHY', col: '#4ade80' },
      { text: 'PRECISION DRIBBLE', col: '#f43f5e' }
    ];
    ads.forEach((ad, idx) => {
      const segW = 1024 / ads.length;
      const x = idx * segW;
      lctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      lctx.fillRect(x + 10, 10, segW - 20, 108);

      lctx.font = 'bold 32px sans-serif';
      lctx.fillStyle = ad.col;
      lctx.textAlign = 'center';
      lctx.textBaseline = 'middle';
      lctx.fillText(ad.text, x + segW / 2, 64);
    });
  };
  drawLedContent();

  const ledTex = new THREE.CanvasTexture(ledCanvas);
  ledTex.wrapS = THREE.RepeatWrapping;
  ledTex.repeat.set(4, 1);
  const ledMat = new THREE.MeshBasicMaterial({ map: ledTex });

  const createLedStrip = (width: number, x: number, z: number, rotY: number) => {
    const board = new THREE.Mesh(new THREE.BoxGeometry(width, 1.1, 0.3), ledMat);
    board.position.set(x, 0.55, z);
    board.rotation.y = rotY;
    stadiumGroup.add(board);
    ledBoards.push(board);
  };

  // Sideline boards
  createLedStrip(112, 0, -37.5, 0);
  createLedStrip(112, 0, 37.5, Math.PI);
  // Behind goal boards (with opening for goal)
  createLedStrip(26, -56.5, -20, Math.PI / 2);
  createLedStrip(26, -56.5, 20, Math.PI / 2);
  createLedStrip(26, 56.5, -20, -Math.PI / 2);
  createLedStrip(26, 56.5, 20, -Math.PI / 2);

  // 5. Grandstands & Procedural Spectator Crowds
  const crowdCanvas = document.createElement('canvas');
  crowdCanvas.width = 512;
  crowdCanvas.height = 256;
  const cctx = crowdCanvas.getContext('2d')!;

  cctx.fillStyle = '#1e293b'; // stadium concrete seat tiers
  cctx.fillRect(0, 0, 512, 256);

  // Spectators dots with varied team colors (white, red, blue, yellow, black)
  const fanColors = ['#f8fafc', '#ef4444', '#3b82f6', '#eab308', '#10b981', '#a855f7', '#0f172a'];
  for (let row = 0; row < 256; row += 8) {
    cctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    cctx.fillRect(0, row + 6, 512, 2); // seat shadow line
    for (let col = 4; col < 512; col += 6) {
      cctx.fillStyle = fanColors[Math.floor(Math.random() * fanColors.length)];
      cctx.beginPath();
      cctx.arc(col + (Math.random() - 0.5) * 2, row + 3, 2.2, 0, Math.PI * 2);
      cctx.fill();
    }
  }

  const crowdTex = new THREE.CanvasTexture(crowdCanvas);
  crowdTex.wrapS = THREE.RepeatWrapping;
  crowdTex.wrapT = THREE.RepeatWrapping;
  crowdTex.repeat.set(6, 2);

  const standMat = new THREE.MeshStandardMaterial({
    map: crowdTex,
    roughness: 0.9,
    metalness: 0.1,
  });

  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.7,
    metalness: 0.2,
  });

  // Long Stands (North & South)
  const standGeo = new THREE.BoxGeometry(130, 16, 28);
  
  // North Stand
  const northStand = new THREE.Mesh(standGeo, standMat);
  northStand.position.set(0, 8, -52);
  northStand.rotation.x = Math.PI / 10;
  stadiumGroup.add(northStand);

  // South Stand (Main Stand with Dugouts)
  const southStand = new THREE.Mesh(standGeo, standMat);
  southStand.position.set(0, 8, 52);
  southStand.rotation.x = -Math.PI / 10;
  stadiumGroup.add(southStand);

  // Short Stands (East & West End)
  const endStandGeo = new THREE.BoxGeometry(26, 14, 88);

  // West End Stand
  const westStand = new THREE.Mesh(endStandGeo, standMat);
  westStand.position.set(-72, 7, 0);
  westStand.rotation.z = -Math.PI / 10;
  stadiumGroup.add(westStand);

  // East End Stand
  const eastStand = new THREE.Mesh(endStandGeo, standMat);
  eastStand.position.set(72, 7, 0);
  eastStand.rotation.z = Math.PI / 10;
  stadiumGroup.add(eastStand);

  // Stadium Roof Trusses over South/North stands
  const roofGeo = new THREE.BoxGeometry(135, 1.2, 34);
  const roofMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.5,
    metalness: 0.6,
  });

  const northRoof = new THREE.Mesh(roofGeo, roofMat);
  northRoof.position.set(0, 24, -50);
  northRoof.rotation.x = -0.05;
  stadiumGroup.add(northRoof);

  const southRoof = new THREE.Mesh(roofGeo, roofMat);
  southRoof.position.set(0, 24, 50);
  southRoof.rotation.x = 0.05;
  stadiumGroup.add(southRoof);

  // 6. Corner Floodlight Towers (4 iconic stadium pylons)
  const floodlights: THREE.Light[] = [];
  const pylonMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    metalness: 0.8,
    roughness: 0.3,
  });
  const lightBankMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

  const pylonPositions = [
    { x: -68, z: -46 },
    { x: 68, z: -46 },
    { x: -68, z: 46 },
    { x: 68, z: 46 },
  ];

  pylonPositions.forEach(pos => {
    const towerGroup = new THREE.Group();
    // Mast
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.6, 32, 8), pylonMat);
    mast.position.y = 16;
    towerGroup.add(mast);

    // Light head panel
    const head = new THREE.Mesh(new THREE.BoxGeometry(5, 3.5, 1.2), pylonMat);
    head.position.set(0, 32, 0);
    // Face toward center pitch
    head.lookAt(0, 0, 0);
    towerGroup.add(head);

    // Glowing bulbs
    const bulbs = new THREE.Mesh(new THREE.BoxGeometry(4.6, 3.1, 0.2), lightBankMat);
    bulbs.position.set(0, 32, 0);
    bulbs.lookAt(0, 0, 0);
    bulbs.translateZ(0.6);
    towerGroup.add(bulbs);

    // Directional floodlight aimed at pitch
    const spot = new THREE.SpotLight(0xfff5ea, 1.8, 120, Math.PI / 4, 0.4, 1.2);
    spot.position.set(pos.x, 32, pos.z);
    spot.target.position.set(pos.x * 0.25, 0, pos.z * 0.25);
    stadiumGroup.add(spot.target);
    floodlights.push(spot);

    towerGroup.position.set(pos.x, 0, pos.z);
    stadiumGroup.add(towerGroup);
  });

  // Dugout shelters along sideline
  const dugoutGeo = new THREE.BoxGeometry(10, 2.2, 2.5);
  const dugoutMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    metalness: 0.5,
    roughness: 0.4,
  });
  const dugout1 = new THREE.Mesh(dugoutGeo, dugoutMat);
  dugout1.position.set(-16, 1.1, 36.5);
  stadiumGroup.add(dugout1);

  const dugout2 = new THREE.Mesh(dugoutGeo, dugoutMat);
  dugout2.position.set(16, 1.1, 36.5);
  stadiumGroup.add(dugout2);

  return {
    stadiumGroup,
    pitchMesh,
    leftGoalGroup: leftGoal.goalGroup,
    rightGoalGroup: rightGoal.goalGroup,
    leftNetMesh: leftGoal.netMesh,
    rightNetMesh: rightGoal.netMesh,
    ledBoards,
    floodlights,
  };
}
