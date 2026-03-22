// ═══════════════════════════════════════════
//  ADVENTURE WORLD v2
//  Mundo exterior · Mansión interior
//  Portales secuenciales · Historia completa
// ═══════════════════════════════════════════

// ── ESTADO GLOBAL ──
const STATE = {
  currentWorld: 'mansion_interior',
  portalsVisited: [],      // portales completados
  portalsUnlocked: [1],    // portal 1 siempre disponible
  mapReadable: false,      // se activa tras completar portal 5
  secretMapFound: false,   // se activa al leer el mapa en la mansión
  inventory: [],
  character: { name: 'Maca', class: 'explorador', origin: 'overworld', personality: 'valiente' },
  inventoryOpen: false,
  mapPanelOpen: false,
  entryOpen: false,
  gameStarted: false,
  endingShown: false
};

const INVENTORY_SIZE = 48;
let selectedClass = 'explorador';

// ── DATOS DE MUNDOS ──
const WORLDS = {
  mansion_interior: {
    name: 'La Mansión — Interior',
    fogColor: 0xd4c4a0, fogNear: 12, fogFar: 50,
    ambientColor: 0xfff8e8, ambientI: 2.4,
    sunColor: 0xfffaee, sunI: 3.0,
    floorA: 0xc8a060, floorB: 0xe8c880,
    wallA: 0xd4b870, wallB: 0xb89050,
    ceilColor: 0xe0d0a8, skyColor: 0x88c8f0,
    winColor: 0xfffce0
  },
  overworld: {
    name: 'Overworld — Exterior',
    fogColor: 0xc8e0c8, fogNear: 20, fogFar: 80,
    ambientColor: 0xffffff, ambientI: 2.8,
    sunColor: 0xfff5cc, sunI: 3.5,
    floorA: 0x4a7a30, floorB: 0x3a6020,
    wallA: 0x5a8a40, wallB: 0x4a7030,
    ceilColor: 0x87ceeb, skyColor: 0x5bb8f5,
    winColor: 0xffffff
  },
  ignis: {
    name: 'Portal 1 — Dimensión de Fuego 🔥',
    fogColor: 0x3a1000, fogNear: 6, fogFar: 28,
    ambientColor: 0x5a2000, ambientI: 1.5,
    sunColor: 0xff6600, sunI: 2.5,
    floorA: 0x4a1800, floorB: 0x6a2800,
    wallA: 0x5a1800, wallB: 0x3a1000,
    ceilColor: 0x2a0800, skyColor: 0x1a0400,
    winColor: 0xff4400
  },
  glacium: {
    name: 'Portal 2 — Dimensión de Hielo ❄️',
    fogColor: 0xaaccee, fogNear: 8, fogFar: 35,
    ambientColor: 0xc0ddff, ambientI: 2.0,
    sunColor: 0xaaddff, sunI: 2.8,
    floorA: 0x8ab4d8, floorB: 0xaad0f0,
    wallA: 0x7090b8, wallB: 0x5878a0,
    ceilColor: 0x6080a8, skyColor: 0x0a2040,
    winColor: 0x88ccff
  },
  void: {
    name: 'Portal 3 — Dimensión Oscura 🌑',
    fogColor: 0x080410, fogNear: 5, fogFar: 22,
    ambientColor: 0x180828, ambientI: 0.9,
    sunColor: 0xaa66ff, sunI: 1.8,
    floorA: 0x100820, floorB: 0x180c28,
    wallA: 0x140a20, wallB: 0x0c0618,
    ceilColor: 0x080410, skyColor: 0x020106,
    winColor: 0x8844ff
  },
  luz: {
    name: 'Portal 4 — Dimensión de Luz ☀️',
    fogColor: 0xfff8e0, fogNear: 15, fogFar: 60,
    ambientColor: 0xffffff, ambientI: 3.5,
    sunColor: 0xfffde0, sunI: 4.0,
    floorA: 0xf0e8c0, floorB: 0xfff8d8,
    wallA: 0xe8d890, wallB: 0xd8c870,
    ceilColor: 0xfffff0, skyColor: 0xfff8c0,
    winColor: 0xffffff
  },
  cielo: {
    name: 'Portal 5 — Dimensión Cielo 🌤️',
    fogColor: 0xaaddff, fogNear: 18, fogFar: 70,
    ambientColor: 0xddeeff, ambientI: 2.6,
    sunColor: 0xffffff, sunI: 3.2,
    floorA: 0x88bbff, floorB: 0xaaccff,
    wallA: 0x99bbdd, wallB: 0x7799bb,
    ceilColor: 0xddeeff, skyColor: 0x55aaff,
    winColor: 0xffffff
  }
};

// ── OBJETOS POR MUNDO ──
// Cada dimensión tiene el mapa de la SIGUIENTE dimensión
const WORLD_OBJECTS = {
  mansion_interior: [
    { id: 'mansion_item_key',    type: 'item',  x:  2, z: -3, icon: '🗝️', name: 'Llave antigua',      desc: 'Una llave de hierro. Dice "Portal 1" grabado en el metal.' },
    { id: 'mansion_item_candle', type: 'item',  x: -3, z:  2, icon: '🕯️', name: 'Candelabro de plata', desc: 'Nunca se apaga. Perteneció a la dueña original de la mansión.' },
    { id: 'mansion_item_clock',  type: 'item',  x:  4, z:  4, icon: '⏰', name: 'Reloj detenido',      desc: 'Marcando las 3:47. El momento en que todo cambió.' },
    { id: 'mansion_item_letter', type: 'item',  x: -5, z: -4, icon: '✉️', name: 'Carta sellada',       desc: 'Dice: "Quien llegue hasta aquí, busca los portales. El secreto espera."' },
    // El mapa secreto — solo legible después del Portal 5
    { id: 'secret_map', type: 'secret_map', x: 0, z: -7, icon: '🗺️', name: 'Mapa antiguo',
      desc_locked: 'Un mapa muy viejo y desgastado. Las marcas no tienen sentido todavía...',
      desc_unlocked: '¡Ahora puedes leerlo! El mapa marca claramente la ubicación del Portal Secreto — La Origen. Está al norte de la mansión, más allá del gran árbol.' }
  ],
  overworld: [
    { id: 'ow_item_compass', type: 'item', x: 15, z: 10,  icon: '🧭', name: 'Brújula de explorador', desc: 'Siempre apunta hacia el próximo portal desbloqueado.' },
    { id: 'ow_item_flower',  type: 'item', x:-18, z:-12,  icon: '🌸', name: 'Flor dimensional',      desc: 'Crece solo cerca de los portales. Su color cambia con cada dimensión.' },
    { id: 'ow_item_stone',   type: 'item', x: 22, z:-15,  icon: '💎', name: 'Piedra dimensional',    desc: 'Absorbe la energía de los portales que has visitado.' }
  ],
  ignis: [
    // Mapa del Portal 2
    { id: 'map_to_portal2', type: 'portal_map', x: 0, z: -6, icon: '📜', name: 'Mapa del Portal 2',
      desc: '¡Encontraste el mapa del Portal 2 — Dimensión de Hielo! Ahora ese portal se ha desbloqueado afuera de la mansión.',
      unlocks: 2 },
    { id: 'ignis_item1', type: 'item', x:  5, z:  4, icon: '🔴', name: 'Cristal de fuego',   desc: 'Formado por millones de años de calor. Cálido al tacto eternamente.' },
    { id: 'ignis_item2', type: 'item', x: -4, z: -5, icon: '⚫', name: 'Obsidiana volcánica', desc: 'Tan afilada que puede cortar el aire mismo.' }
  ],
  glacium: [
    // Mapa del Portal 3
    { id: 'map_to_portal3', type: 'portal_map', x: 0, z: -6, icon: '📜', name: 'Mapa del Portal 3',
      desc: '¡Encontraste el mapa del Portal 3 — Dimensión Oscura! Ese portal se ha desbloqueado.',
      unlocks: 3 },
    { id: 'glacium_item1', type: 'item', x:  5, z: 3,  icon: '💎', name: 'Cristal de hielo eterno', desc: 'Existe desde antes del tiempo. Nunca se derrite.' },
    { id: 'glacium_item2', type: 'item', x: -4, z:-5,  icon: '❄️', name: 'Copo de nieve gigante',   desc: 'Cada uno es único en todo el universo.' }
  ],
  void: [
    // Mapa del Portal 4
    { id: 'map_to_portal4', type: 'portal_map', x: 0, z: -6, icon: '📜', name: 'Mapa del Portal 4',
      desc: '¡Encontraste el mapa del Portal 4 — Dimensión de Luz! Ese portal se ha desbloqueado.',
      unlocks: 4 },
    { id: 'void_item1', type: 'item', x: 4, z:  4, icon: '🔮', name: 'Orbe del vacío',  desc: 'Dentro hay un universo entero en miniatura, expandiéndose lentamente.' },
    { id: 'void_item2', type: 'item', x:-5, z: -5, icon: '⭐', name: 'Estrella perdida', desc: 'Se separó de su galaxia hace eons. Todavía tibia.' }
  ],
  luz: [
    // Mapa del Portal 5
    { id: 'map_to_portal5', type: 'portal_map', x: 0, z: -6, icon: '📜', name: 'Mapa del Portal 5',
      desc: '¡Encontraste el mapa del Portal 5 — Dimensión Cielo! El último portal conocido se ha desbloqueado.',
      unlocks: 5 },
    { id: 'luz_item1', type: 'item', x:  5, z: 4, icon: '☀️', name: 'Fragmento de sol',  desc: 'Un trozo de estrella solidificado. Ilumina todo a su alrededor.' },
    { id: 'luz_item2', type: 'item', x: -4, z:-5, icon: '✨', name: 'Polvo de luz pura',  desc: 'La base de toda creación. Con esto fue hecho el primer mundo.' }
  ],
  cielo: [
    // Pista del mapa secreto en la mansión
    { id: 'sky_clue', type: 'sky_clue', x: 0, z: -6, icon: '📖', name: 'Diario del Explorador Original',
      desc: '¡Encontraste la clave! El diario revela: "El mapa del Portal Secreto — La Origen — siempre estuvo en la Mansión. Oculto a la vista de quien no haya recorrido todos los mundos. Regresa a la Mansión y podrás leerlo."' },
    { id: 'cielo_item1', type: 'item', x:  5, z: 4, icon: '☁️', name: 'Nube sólida',         desc: 'Tan suave como parece. Pesa exactamente nada.' },
    { id: 'cielo_item2', type: 'item', x: -5, z:-5, icon: '🌈', name: 'Fragmento de arcoíris', desc: 'Siempre apunta hacia algo hermoso.' }
  ]
};

// ── PORTALES ──
// En el overworld exterior (posiciones alrededor de la mansión)
const PORTAL_DEFS = [
  { num: 1, id: 'portal_ignis',   world: 'ignis',   x:  35, z: -20, color: 0xff5500, label: 'Fuego 🔥' },
  { num: 2, id: 'portal_glacium', world: 'glacium', x: -35, z: -15, color: 0x44aaff, label: 'Hielo ❄️' },
  { num: 3, id: 'portal_void',    world: 'void',    x:  30, z:  30, color: 0x9955ff, label: 'Oscuridad 🌑' },
  { num: 4, id: 'portal_luz',     world: 'luz',     x: -30, z:  25, color: 0xffee44, label: 'Luz ☀️' },
  { num: 5, id: 'portal_cielo',   world: 'cielo',   x:   0, z: -45, color: 0x44ccff, label: 'Cielo 🌤️' },
  // Portal secreto — solo aparece cuando se encuentra el mapa en la mansión
  { num: 0, id: 'portal_secret',  world: 'secret',  x:   0, z:  50, color: 0xff88ff, label: 'La Origen ✨', secret: true }
];

// Portal de regreso desde dimensiones
const RETURN_PORTAL = { id: 'portal_return', world: 'overworld', x: 0, z: 10, color: 0xffcc44 };

let scene, camera, renderer;
let yaw = 0, pitch = 0;
let isPointerLocked = false;
let collectibles = [], portalMeshes = [];
let clock = new THREE.Clock();
const keys = { w: false, s: false, a: false, d: false };
window.keys = keys;

// ── INICIO ──
function startNewGame() {
  const saved = localStorage.getItem('aw2_state');
  if (saved) { try { const s = JSON.parse(saved); Object.assign(STATE, s); } catch(e) {} }
  document.getElementById('menu').style.display = 'none';
  document.getElementById('canvas').style.display = 'block';
  document.getElementById('hud').style.display = 'block';
  document.getElementById('inv-char-name').textContent = STATE.character.name;
  initThreeJS();
  buildWorld(STATE.currentWorld);
  buildInventoryUI();
  updateProgressHUD();
  STATE.gameStarted = true;
  requestPointerLock();
}

function loadGame() { startNewGame(); }

function showCharCreator() { document.getElementById('menu').style.display = 'none'; document.getElementById('char-panel').style.display = 'flex'; }
function closeCharCreator() { document.getElementById('char-panel').style.display = 'none'; document.getElementById('menu').style.display = 'flex'; }
function selectClass(el, cls) { document.querySelectorAll('.class-opt').forEach(e => e.classList.remove('selected')); el.classList.add('selected'); selectedClass = cls; }
function saveCharacter() {
  const name = document.getElementById('char-name').value.trim() || 'Maca';
  STATE.character = { name, class: selectedClass, origin: document.getElementById('char-origin').value, personality: document.getElementById('char-personality').value };
  saveState(); showMsg(`¡Personaje ${name} creado!`);
  closeCharCreator(); document.getElementById('menu').style.display = 'flex';
}

// ── TRES.JS ──
function initThreeJS() {
  const canvas = document.getElementById('canvas');
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.1, 150);
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
  setupControls();
  animate();
}

// ── CONSTRUIR MUNDO ──
function buildWorld(worldId) {
  while (scene.children.length) scene.remove(scene.children[0]);
  collectibles = []; portalMeshes = [];

  const W = WORLDS[worldId] || WORLDS.overworld;
  scene.background = new THREE.Color(W.skyColor);
  scene.fog = new THREE.Fog(W.fogColor, W.fogNear, W.fogFar);

  // Iluminación
  scene.add(new THREE.AmbientLight(W.ambientColor, W.ambientI));
  const sun = new THREE.DirectionalLight(W.sunColor, W.sunI);
  sun.position.set(15, 25, 15); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = sun.shadow.camera.bottom = -60;
  sun.shadow.camera.right = sun.shadow.camera.top = 60;
  sun.shadow.camera.far = 120; sun.shadow.bias = -0.001;
  scene.add(sun);
  const sun2 = new THREE.DirectionalLight(W.sunColor, W.sunI * 0.4);
  sun2.position.set(-10, 18, -10); scene.add(sun2);

  // Luces de punto distribuidas
  [[-15,-15],[0,-15],[15,-15],[-15,0],[15,0],[-15,15],[0,15],[15,15]].forEach(([x,z]) => {
    const pl = new THREE.PointLight(W.sunColor, 1.2, 25);
    pl.position.set(x, 5, z); scene.add(pl);
  });

  if (worldId === 'mansion_interior') {
    buildMansionInterior(W);
  } else if (worldId === 'overworld') {
    buildOverworld(W);
  } else {
    buildDimension(worldId, W);
  }

  // Posición inicial de la cámara
  const startPos = getStartPosition(worldId);
  camera.position.set(startPos.x, 1.75, startPos.z);
  yaw = startPos.yaw || 0; pitch = 0;
  camera.rotation.order = 'YXZ';
  camera.rotation.y = yaw;

  document.getElementById('world-name').textContent = W.name;
}

function getStartPosition(worldId) {
  if (worldId === 'mansion_interior') return { x: 0, z: 8, yaw: Math.PI }; // cerca a la puerta, mirando adentro
  if (worldId === 'overworld') return { x: 0, z: 18, yaw: Math.PI };       // sale de la mansión
  return { x: 0, z: 8, yaw: Math.PI };
}

// ── MANSIÓN INTERIOR ──
function buildMansionInterior(W) {
  // Suelo de mosaico
  const ts = 2, n = 14, h = n / 2;
  for (let ix = -h; ix < h; ix++) {
    for (let iz = -h; iz < h; iz++) {
      const tile = new THREE.Mesh(
        new THREE.BoxGeometry(ts - 0.04, 0.08, ts - 0.04),
        new THREE.MeshLambertMaterial({ color: (ix + iz) % 2 === 0 ? W.floorA : W.floorB })
      );
      tile.position.set(ix * ts + ts / 2, 0, iz * ts + ts / 2);
      tile.receiveShadow = true; scene.add(tile);
    }
  }

  // Techo
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshLambertMaterial({ color: W.ceilColor }));
  ceil.rotation.x = Math.PI / 2; ceil.position.y = 5.2; scene.add(ceil);

  // Vigas del techo
  const beamMat = new THREE.MeshLambertMaterial({ color: W.wallB });
  [-6, 0, 6].forEach(pos => {
    const b1 = new THREE.Mesh(new THREE.BoxGeometry(28, 0.18, 0.3), beamMat); b1.position.set(0, 5.1, pos); scene.add(b1);
    const b2 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.18, 28), beamMat); b2.position.set(pos, 5.1, 0); scene.add(b2);
  });

  const wMat = new THREE.MeshLambertMaterial({ color: W.wallA });
  const mMat = new THREE.MeshLambertMaterial({ color: W.wallB });
  const winMat = new THREE.MeshBasicMaterial({ color: W.winColor, transparent: true, opacity: 0.5, side: THREE.DoubleSide });

  // Paredes laterales (izquierda y derecha)
  [-13, 13].forEach((pos, idx) => {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(0.45, 5.2, 28), wMat);
    wall.position.set(pos, 2.6, 0); wall.castShadow = true; wall.receiveShadow = true; scene.add(wall);
    // Molduras
    [0.15, 5.1].forEach(py => {
      const mold = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.22, 28), mMat);
      mold.position.set(pos, py, 0); scene.add(mold);
    });
    // Ventanas con arcos
    [-6, 0, 6].forEach(wz => {
      const fr = new THREE.Mesh(new THREE.BoxGeometry(0.58, 4.0, 2.8), mMat);
      fr.position.set(pos, 2.8, wz); scene.add(fr);
      const gl = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 2.2), winMat);
      gl.position.set(pos + (idx === 0 ? 0.28 : -0.28), 2.8, wz);
      gl.rotation.y = Math.PI / 2; scene.add(gl);
      const sp = new THREE.SpotLight(W.winColor, 2.0, 20, Math.PI / 5, 0.5);
      sp.position.set(pos + (idx === 0 ? -3 : 3), 2.8, wz);
      sp.target.position.set(0, 0, 0); scene.add(sp); scene.add(sp.target);
      buildArch(pos, 4.85, wz, 1.4, mMat, Math.PI / 2);
    });
  });

  // Pared del fondo (norte)
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(28, 5.2, 0.45), wMat);
  backWall.position.set(0, 2.6, -13); backWall.castShadow = true; scene.add(backWall);
  [0.15, 5.1].forEach(py => { const m = new THREE.Mesh(new THREE.BoxGeometry(28, 0.22, 0.58), mMat); m.position.set(0, py, -13); scene.add(m); });
  [-8, 0, 8].forEach(wx => {
    const fr = new THREE.Mesh(new THREE.BoxGeometry(2.8, 4.0, 0.58), mMat);
    fr.position.set(wx, 2.8, -13); scene.add(fr);
    const gl = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 3.4), winMat);
    gl.position.set(wx, 2.8, -12.72); scene.add(gl);
    buildArch(wx, 4.85, -13, 1.4, mMat, 0);
    const sp = new THREE.SpotLight(W.winColor, 2.0, 20, Math.PI / 5, 0.5);
    sp.position.set(wx, 2.8, -16); sp.target.position.set(wx, 1, -13);
    scene.add(sp); scene.add(sp.target);
  });

  // Pared frontal con PUERTA (sur)
  // Segmentos laterales de la pared frontal
  [-9.5, 9.5].forEach(wx => {
    const seg = new THREE.Mesh(new THREE.BoxGeometry(9, 5.2, 0.45), wMat);
    seg.position.set(wx, 2.6, 13); scene.add(seg);
  });
  // Dintel encima de la puerta
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(4.5, 1.5, 0.5), wMat);
  lintel.position.set(0, 4.45, 13); scene.add(lintel);
  // Marco de la puerta
  const doorFrameMat = new THREE.MeshLambertMaterial({ color: 0x5c3a1e });
  const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(4.8, 4.0, 0.55), doorFrameMat);
  doorFrame.position.set(0, 2.0, 13); scene.add(doorFrame);
  // Abertura de la puerta (suelo visible)
  const doorOpen = new THREE.Mesh(new THREE.BoxGeometry(4.0, 4.5, 0.6), new THREE.MeshBasicMaterial({ color: W.skyColor }));
  doorOpen.position.set(0, 2.25, 13.05); scene.add(doorOpen);
  // Molduras frontales
  [0.15, 5.1].forEach(py => {
    [-9.5, 9.5].forEach(wx => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(9, 0.22, 0.58), mMat);
      m.position.set(wx, py, 13); scene.add(m);
    });
  });

  // Pilares interiores
  const pilMat = new THREE.MeshLambertMaterial({ color: W.wallB });
  const capMat = new THREE.MeshLambertMaterial({ color: W.wallA });
  [[-6,-6],[6,-6],[-6,6],[6,6],[-6,0],[6,0]].forEach(([x,z]) => {
    const pil = new THREE.Mesh(new THREE.BoxGeometry(0.7, 5.0, 0.7), pilMat);
    pil.position.set(x, 2.5, z); pil.castShadow = true; scene.add(pil);
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.3, 1.0), capMat); base.position.set(x, 0.15, z); scene.add(base);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.28, 1.1), capMat); cap.position.set(x, 5.05, z); scene.add(cap);
    const fl = new THREE.PointLight(0xffaa44, 1.0, 8); fl.position.set(x + 0.5, 3.5, z + 0.5); scene.add(fl);
  });

  // Muebles
  const woodMat = new THREE.MeshLambertMaterial({ color: 0x5c3a1e });
  const rugMat  = new THREE.MeshLambertMaterial({ color: 0x8b2020 });
  const rug = new THREE.Mesh(new THREE.BoxGeometry(6, 0.05, 10), rugMat); rug.position.set(0, 0.05, -2); scene.add(rug);
  const tTop = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.18, 2.2), woodMat); tTop.position.set(0, 1.02, -4); scene.add(tTop);
  [[1.8,-0.9],[1.8,0.9],[-1.8,-0.9],[-1.8,0.9]].forEach(([dx,dz]) => {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.12,1.02,0.12), new THREE.MeshLambertMaterial({color:0x3a2010}));
    leg.position.set(dx, 0.51, -4+dz); scene.add(leg);
  });
  // Estantería con libros
  const sh = new THREE.Mesh(new THREE.BoxGeometry(0.3,4.0,4.5), new THREE.MeshLambertMaterial({color:0x4a2a0e}));
  sh.position.set(-11.5, 2.0, -6); sh.castShadow = true; scene.add(sh);
  for (let row = 0; row < 4; row++) for (let col = 0; col < 8; col++) {
    const bk = new THREE.Mesh(new THREE.BoxGeometry(0.32,0.42,0.3), new THREE.MeshLambertMaterial({color:[0x8b1a1a,0x1a4a8b,0x1a6b2a,0x6b4a1a,0x4a1a6b,0x8b6a1a,0x3a5a3a,0x6a3a1a][col]}));
    bk.position.set(-11.3, 0.5+row*0.9, -7.8+col*0.5); scene.add(bk);
  }
  // Chimenea
  const stone = new THREE.MeshLambertMaterial({ color: 0x9a8060 });
  const fm = new THREE.Mesh(new THREE.BoxGeometry(3.6,4.0,0.6), stone); fm.position.set(11.5, 2.0, -6); fm.castShadow=true; scene.add(fm);
  const hole = new THREE.Mesh(new THREE.BoxGeometry(2.0,1.8,0.8), new THREE.MeshLambertMaterial({color:0x3a2010})); hole.position.set(11.5,1.0,-6); scene.add(hole);
  const fireL = new THREE.PointLight(0xff7700, 2.8, 14); fireL.position.set(10.8,1.5,-6); scene.add(fireL);
  [0,0.3,-0.3].forEach((ox,i) => {
    const fl = new THREE.Mesh(new THREE.SphereGeometry(0.18+i*0.06,8,8), new THREE.MeshBasicMaterial({color:i===0?0xff9900:0xff4400}));
    fl.position.set(11.2+ox,1.0+i*0.1,-6+ox*0.4); fl.userData.fireFlicker=true; fl.userData.flickerOffset=i*0.6; scene.add(fl);
  });
  // Cuadros
  [0x4a2a6a,0x2a4a2a,0x6a2a2a].forEach((col,i) => {
    const fr = new THREE.Mesh(new THREE.BoxGeometry(1.8,2.2,0.12), new THREE.MeshLambertMaterial({color:0x8b6914})); fr.position.set(-6+i*6,2.8,-12.7); scene.add(fr);
    const pt = new THREE.Mesh(new THREE.PlaneGeometry(1.6,2.0), new THREE.MeshLambertMaterial({color:col})); pt.position.set(-6+i*6,2.8,-12.65); scene.add(pt);
  });

  // Objetos coleccionables
  (WORLD_OBJECTS.mansion_interior || []).forEach(obj => {
    if (!STATE.inventory.find(i => i.id === obj.id)) createCollectible(obj, W);
  });

  // NO hay portales aquí — la salida es la puerta al overworld
  // Trigger de salida: zona en z > 12 lleva al overworld
}

// ── OVERWORLD EXTERIOR ──
function buildOverworld(W) {
  // Terreno grande de césped
  const ts = 4, n = 30, h = n / 2;
  for (let ix = -h; ix < h; ix++) {
    for (let iz = -h; iz < h; iz++) {
      const col = (ix + iz) % 2 === 0 ? W.floorA : W.floorB;
      const tile = new THREE.Mesh(new THREE.BoxGeometry(ts-0.05, 0.1, ts-0.05), new THREE.MeshLambertMaterial({ color: col }));
      tile.position.set(ix*ts+ts/2, 0, iz*ts+ts/2);
      tile.receiveShadow = true; scene.add(tile);
    }
  }

  // La Mansión (fachada exterior)
  buildMansionExterior(W);

  // Árboles alrededor
  buildTrees(W);

  // Caminos de piedra
  buildPaths(W);

  // Portales en el mundo exterior
  buildOverworldPortals(W);

  // Objetos del overworld
  (WORLD_OBJECTS.overworld || []).forEach(obj => {
    if (!STATE.inventory.find(i => i.id === obj.id)) createCollectible(obj, W);
  });
}

function buildMansionExterior(W) {
  const stoneMat  = new THREE.MeshLambertMaterial({ color: 0xd4b870 });
  const darkMat   = new THREE.MeshLambertMaterial({ color: 0xb89050 });
  const roofMat   = new THREE.MeshLambertMaterial({ color: 0x5a4030 });
  const winMat    = new THREE.MeshBasicMaterial({ color: 0xaaddff, transparent: true, opacity: 0.6, side: THREE.DoubleSide });

  // Cuerpo principal
  const body = new THREE.Mesh(new THREE.BoxGeometry(28, 14, 18), stoneMat);
  body.position.set(0, 7, -25); body.castShadow=true; body.receiveShadow=true; scene.add(body);

  // Torre izquierda
  const tL = new THREE.Mesh(new THREE.BoxGeometry(7, 18, 7), darkMat);
  tL.position.set(-14, 9, -25); tL.castShadow=true; scene.add(tL);
  // Torre derecha
  const tR = new THREE.Mesh(new THREE.BoxGeometry(7, 18, 7), darkMat);
  tR.position.set(14, 9, -25); tR.castShadow=true; scene.add(tR);

  // Tejado principal
  const roofGeo = new THREE.CylinderGeometry(0, 16, 5, 4);
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.set(0, 19, -25); roof.rotation.y = Math.PI/4; scene.add(roof);
  // Tejados torres
  [[-14,21],[ 14,21]].forEach(([x,y]) => {
    const tr = new THREE.Mesh(new THREE.CylinderGeometry(0,4.5,5,4), roofMat);
    tr.position.set(x,y,-25); tr.rotation.y=Math.PI/4; scene.add(tr);
  });

  // Fachada frontal con detalle
  // Puerta principal
  const doorFrameM = new THREE.Mesh(new THREE.BoxGeometry(4.5, 7, 0.6), darkMat);
  doorFrameM.position.set(0, 3.5, -16); scene.add(doorFrameM);
  const doorGlass = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 6.0), winMat);
  doorGlass.position.set(0, 3.5, -15.7); scene.add(doorGlass);
  buildArch(0, 7.1, -16, 2.3, darkMat, 0);

  // Escalones de entrada
  [0.15, 0.35, 0.55].forEach((h, i) => {
    const step = new THREE.Mesh(new THREE.BoxGeometry(6 - i*0.8, 0.22, 0.8), stoneMat);
    step.position.set(0, h, -14.5 + i*0.9); scene.add(step);
  });

  // Ventanas fachada
  [-8, 8, -4, 4].forEach(wx => {
    const wfr = new THREE.Mesh(new THREE.BoxGeometry(2.5, 3.5, 0.55), darkMat);
    wfr.position.set(wx, 9, -16); scene.add(wfr);
    const wgl = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 2.8), winMat);
    wgl.position.set(wx, 9, -15.73); scene.add(wgl);
    const sp = new THREE.SpotLight(0xfffce0, 1.0, 12, Math.PI/6, 0.5);
    sp.position.set(wx, 9, -12); sp.target.position.set(wx, 9, -16);
    scene.add(sp); scene.add(sp.target);
  });

  // Luz de entrada
  const entL = new THREE.PointLight(0xffdd99, 2.5, 12);
  entL.position.set(0, 5, -14); scene.add(entL);
}

function buildTrees(W) {
  const trunkMat = new THREE.MeshLambertMaterial({ color: 0x4a2e10 });
  const leafColors = [0x2d5a1e, 0x3a6a28, 0x254810];
  const positions = [
    [20,8],[20,-8],[20,-20],[-20,8],[-20,-8],[-20,-20],
    [35,15],[35,-15],[-35,15],[-35,-15],[10,35],[-10,35],
    [45,5],[45,-5],[-45,5],[-45,-5]
  ];
  positions.forEach(([x,z]) => {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3,0.45,4.5,8), trunkMat);
    trunk.position.set(x,2.25,z); trunk.castShadow=true; scene.add(trunk);
    const lc = leafColors[Math.floor(Math.random()*leafColors.length)];
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(2.2+Math.random(),8,8), new THREE.MeshLambertMaterial({color:lc}));
    leaf.position.set(x,6+Math.random(),z); leaf.castShadow=true; scene.add(leaf);
  });
}

function buildPaths(W) {
  const pathMat = new THREE.MeshLambertMaterial({ color: 0xc8b490 });
  // Camino principal a la mansión
  const mainPath = new THREE.Mesh(new THREE.BoxGeometry(4, 0.12, 35), pathMat);
  mainPath.position.set(0, 0.06, -5); scene.add(mainPath);
  // Camino circular alrededor
  for (let i = 0; i < 24; i++) {
    const a = (i/24)*Math.PI*2;
    const seg = new THREE.Mesh(new THREE.BoxGeometry(3.5,0.12,4.5), pathMat);
    seg.position.set(Math.cos(a)*22, 0.06, Math.sin(a)*22 - 8);
    seg.rotation.y = a; scene.add(seg);
  }
}

function buildOverworldPortals(W) {
  PORTAL_DEFS.forEach(portal => {
    if (portal.secret && !STATE.secretMapFound) return; // Portal secreto solo si se encontró el mapa
    const isUnlocked = STATE.portalsUnlocked.includes(portal.num) || portal.num === 0;
    const isVisited  = STATE.portalsVisited.includes(portal.num);
    const alpha = isUnlocked ? 0.42 : 0.15;
    const emI   = isUnlocked ? 0.7 : 0.2;

    const arch = new THREE.Mesh(
      new THREE.TorusGeometry(1.8, 0.2, 10, 32),
      new THREE.MeshLambertMaterial({ color: portal.color, emissive: portal.color, emissiveIntensity: emI })
    );
    arch.position.set(portal.x, 2.3, portal.z); scene.add(arch);

    const disk = new THREE.Mesh(
      new THREE.CircleGeometry(1.72, 32),
      new THREE.MeshBasicMaterial({ color: portal.color, opacity: alpha, transparent: true, side: THREE.DoubleSide })
    );
    disk.position.set(portal.x, 2.3, portal.z + 0.07); scene.add(disk);

    // Columnas
    [-1.8, 1.8].forEach(dx => {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 4.6, 8), new THREE.MeshLambertMaterial({ color: portal.color, emissive: portal.color, emissiveIntensity: emI * 0.5 }));
      col.position.set(portal.x + dx, 2.3, portal.z); scene.add(col);
    });

    // Luz
    const pl = new THREE.PointLight(portal.color, isUnlocked ? 2.0 : 0.5, isUnlocked ? 12 : 5);
    pl.position.set(portal.x, 2.3, portal.z); scene.add(pl);

    // Número del portal encima
    if (portal.num > 0) {
      const numGeo = new THREE.BoxGeometry(1.0, 0.5, 0.1);
      const numMat = new THREE.MeshBasicMaterial({ color: portal.color });
      const numM = new THREE.Mesh(numGeo, numMat);
      numM.position.set(portal.x, 4.5, portal.z); scene.add(numM);
    }

    portalMeshes.push({ mesh: arch, portal, disk, light: pl, isUnlocked, isVisited });
  });
}

// ── DIMENSIÓN ──
function buildDimension(worldId, W) {
  // Suelo de mosaico
  const ts = 2, n = 20, h = n / 2;
  for (let ix = -h; ix < h; ix++) {
    for (let iz = -h; iz < h; iz++) {
      const tile = new THREE.Mesh(
        new THREE.BoxGeometry(ts-0.04, 0.08, ts-0.04),
        new THREE.MeshLambertMaterial({ color: (ix+iz)%2===0 ? W.floorA : W.floorB })
      );
      tile.position.set(ix*ts+ts/2, 0, iz*ts+ts/2); tile.receiveShadow=true; scene.add(tile);
    }
  }

  // Techo y paredes
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(42,42), new THREE.MeshLambertMaterial({color:W.ceilColor}));
  ceil.rotation.x=Math.PI/2; ceil.position.y=5.2; scene.add(ceil);

  const wMat = new THREE.MeshLambertMaterial({ color: W.wallA });
  const mMat = new THREE.MeshLambertMaterial({ color: W.wallB });
  const winMat = new THREE.MeshBasicMaterial({ color: W.winColor, transparent:true, opacity:0.45, side:THREE.DoubleSide });

  [[-20,0,true],[20,0,true],[0,-20,false],[0,20,false]].forEach(([px,pz,vert]) => {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(vert?0.45:42, 5.2, vert?42:0.45), wMat);
    wall.position.set(px,2.6,pz); wall.castShadow=true; scene.add(wall);
    [0.15,5.1].forEach(py=>{
      const mol = new THREE.Mesh(new THREE.BoxGeometry(vert?0.58:42,0.22,vert?42:0.58),mMat);
      mol.position.set(px,py,pz); scene.add(mol);
    });
    [-8,0,8].forEach(w=>{
      const fr=new THREE.Mesh(new THREE.BoxGeometry(vert?0.58:2.8,4.0,vert?2.8:0.58),mMat);
      fr.position.set(vert?px:w,2.8,vert?w:pz); scene.add(fr);
      const gl=new THREE.Mesh(new THREE.PlaneGeometry(2.2,3.4),winMat);
      if(vert){gl.position.set(px+(px<0?.28:-.28),2.8,w);gl.rotation.y=Math.PI/2;}
      else{gl.position.set(w,2.8,pz+(pz<0?.28:-.28));}
      scene.add(gl);
      const sp=new THREE.SpotLight(W.winColor,1.8,20,Math.PI/5,0.5);
      sp.position.set(vert?px+(px<0?-3:3):w,2.8,vert?w:pz+(pz<0?-3:3));
      sp.target.position.set(0,0,0); scene.add(sp);scene.add(sp.target);
    });
  });

  // Pilares
  const pilMat=new THREE.MeshLambertMaterial({color:W.wallB});
  [[-8,-8],[8,-8],[-8,8],[8,8],[0,-8],[0,8],[-8,0],[8,0]].forEach(([x,z])=>{
    const pil=new THREE.Mesh(new THREE.BoxGeometry(0.7,5.0,0.7),pilMat); pil.position.set(x,2.5,z); scene.add(pil);
    const base=new THREE.Mesh(new THREE.BoxGeometry(1.0,0.3,1.0),new THREE.MeshLambertMaterial({color:W.wallA})); base.position.set(x,.15,z); scene.add(base);
    const pl2=new THREE.PointLight(W.sunColor,.8,8); pl2.position.set(x+.5,3.5,z+.5); scene.add(pl2);
  });

  // Decoración especial por dimensión
  buildDimDecor(worldId, W);

  // Objetos coleccionables
  (WORLD_OBJECTS[worldId] || []).forEach(obj => {
    if (!STATE.inventory.find(i => i.id === obj.id)) createCollectible(obj, W);
  });

  // Portal de regreso al overworld
  const ret = RETURN_PORTAL;
  const retArch = new THREE.Mesh(new THREE.TorusGeometry(1.7,0.2,10,32), new THREE.MeshLambertMaterial({color:ret.color,emissive:ret.color,emissiveIntensity:.7}));
  retArch.position.set(ret.x,2.3,ret.z); scene.add(retArch);
  const retDisk = new THREE.Mesh(new THREE.CircleGeometry(1.62,32), new THREE.MeshBasicMaterial({color:ret.color,opacity:.38,transparent:true,side:THREE.DoubleSide}));
  retDisk.position.set(ret.x,2.3,ret.z+.07); scene.add(retDisk);
  [-1.7,1.7].forEach(dx=>{
    const col=new THREE.Mesh(new THREE.CylinderGeometry(.16,.2,4.6,8),new THREE.MeshLambertMaterial({color:ret.color}));
    col.position.set(ret.x+dx,2.3,ret.z); scene.add(col);
  });
  const retL=new THREE.PointLight(ret.color,2.0,11); retL.position.set(ret.x,2.3,ret.z); scene.add(retL);
  portalMeshes.push({ mesh:retArch, portal:{...ret,world:'overworld',num:-1}, disk:retDisk, light:retL, isUnlocked:true });
}

function buildDimDecor(worldId, W) {
  if (worldId==='ignis') {
    for(let i=0;i<8;i++){
      const m=new THREE.Mesh(new THREE.ConeGeometry(.4,2.5,8),new THREE.MeshLambertMaterial({color:0x8b0000,emissive:0x4a0000}));
      m.position.set((Math.random()-.5)*20,1.25,(Math.random()-.5)*20); scene.add(m);
      const l=new THREE.PointLight(0xff4400,1.0,5); l.position.copy(m.position).add(new THREE.Vector3(0,2,0)); scene.add(l);
    }
  }
  if (worldId==='glacium') {
    for(let i=0;i<14;i++){
      const m=new THREE.Mesh(new THREE.ConeGeometry(.12,1.2+Math.random(),6),new THREE.MeshLambertMaterial({color:0xaaddff,transparent:true,opacity:.85}));
      m.position.set((Math.random()-.5)*18,.6,(Math.random()-.5)*18); scene.add(m);
    }
    for(let i=0;i<8;i++){
      const m=new THREE.Mesh(new THREE.OctahedronGeometry(.5+Math.random()*.3),new THREE.MeshLambertMaterial({color:0xcceeFF,transparent:true,opacity:.75}));
      m.position.set((Math.random()-.5)*16,.5,(Math.random()-.5)*16); m.rotation.set(Math.random(),Math.random(),Math.random()); scene.add(m);
    }
  }
  if (worldId==='void') {
    for(let i=0;i<15;i++){
      const m=new THREE.Mesh(new THREE.SphereGeometry(.12+Math.random()*.22,8,8),new THREE.MeshBasicMaterial({color:[0x8844ff,0xaa66ff,0x6622cc][i%3],transparent:true,opacity:.6}));
      m.position.set((Math.random()-.5)*16,.5+Math.random()*3.5,(Math.random()-.5)*16);
      m.userData.floatOffset=Math.random()*Math.PI*2; scene.add(m);
    }
  }
  if (worldId==='luz') {
    for(let i=0;i<12;i++){
      const m=new THREE.Mesh(new THREE.SphereGeometry(.2+Math.random()*.3,8,8),new THREE.MeshBasicMaterial({color:0xffffaa,transparent:true,opacity:.7}));
      m.position.set((Math.random()-.5)*16,1+Math.random()*3,(Math.random()-.5)*16);
      m.userData.floatOffset=Math.random()*Math.PI*2; scene.add(m);
      const gl=new THREE.PointLight(0xffffcc,.6,4); gl.position.copy(m.position); scene.add(gl);
    }
  }
  if (worldId==='cielo') {
    for(let i=0;i<10;i++){
      const m=new THREE.Mesh(new THREE.SphereGeometry(1.5+Math.random(),8,4),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.5}));
      m.position.set((Math.random()-.5)*18,3+Math.random()*2,(Math.random()-.5)*18);
      m.userData.floatOffset=Math.random()*Math.PI*2; scene.add(m);
    }
  }
}

function buildArch(cx, cy, cz, r, mat, rotY) {
  for(let i=0;i<10;i++){
    const a1=(i/10)*Math.PI, a2=((i+1)/10)*Math.PI;
    const x1=Math.cos(Math.PI-a1)*r, y1=Math.sin(a1)*r*.55;
    const x2=Math.cos(Math.PI-a2)*r, y2=Math.sin(a2)*r*.55;
    const len=Math.sqrt((x2-x1)**2+(y2-y1)**2);
    const ang=Math.atan2(y2-y1,x2-x1);
    const seg=new THREE.Mesh(new THREE.BoxGeometry(len+.02,.22,.6),mat);
    seg.position.set(cx+(x1+x2)/2,cy+(y1+y2)/2,cz);
    seg.rotation.y=rotY; seg.rotation.z=ang; scene.add(seg);
  }
}

// ── COLECCIONABLES ──
function createCollectible(obj, W) {
  const isSpecial = obj.type==='portal_map'||obj.type==='sky_clue'||obj.type==='secret_map';
  const isEntry   = isSpecial;
  const sz = isEntry ? .5 : .34;
  const col= isEntry ? 0xffd700 : 0xe8c87a;
  const mesh=new THREE.Mesh(new THREE.SphereGeometry(sz,16,16),new THREE.MeshLambertMaterial({color:col,emissive:col,emissiveIntensity:isEntry?.72:.25}));
  mesh.position.set(obj.x,1.2,obj.z); mesh.userData={...obj}; mesh.castShadow=true; scene.add(mesh);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(sz*1.7,.055,6,20),new THREE.MeshBasicMaterial({color:col}));
  ring.position.copy(mesh.position); ring.rotation.x=Math.PI/2; scene.add(ring);
  const glow=new THREE.PointLight(col,isEntry?2.4:.9,isEntry?6:3.5); glow.position.copy(mesh.position); scene.add(glow);
  collectibles.push({mesh,ring,glow,obj});
}

// ── CONTROLES ──
function setupControls() {
  const canvas=document.getElementById('canvas');
  canvas.addEventListener('click',()=>{if(!STATE.inventoryOpen&&!STATE.mapPanelOpen&&!STATE.entryOpen)requestPointerLock();});
  document.addEventListener('pointerlockchange',()=>{isPointerLocked=document.pointerLockElement===canvas;});
  document.addEventListener('mousemove',e=>{if(!isPointerLocked)return;yaw-=e.movementX*.002;pitch-=e.movementY*.002;pitch=Math.max(-Math.PI/3,Math.min(Math.PI/3,pitch));});
  document.addEventListener('keydown',e=>{
    switch(e.code){
      case'KeyW':case'ArrowUp':   keys.w=true;break;
      case'KeyS':case'ArrowDown': keys.s=true;break;
      case'KeyA':case'ArrowLeft': keys.a=true;break;
      case'KeyD':case'ArrowRight':keys.d=true;break;
      case'KeyE':collectNearby();break;
      case'KeyI':toggleInventory();break;
      case'KeyM':toggleMap();break;
      case'Escape':
        if(STATE.inventoryOpen)toggleInventory();
        else if(STATE.mapPanelOpen)toggleMap();
        else if(STATE.entryOpen)closeEntry();
        break;
    }
  });
  document.addEventListener('keyup',e=>{
    switch(e.code){
      case'KeyW':case'ArrowUp':   keys.w=false;break;
      case'KeyS':case'ArrowDown': keys.s=false;break;
      case'KeyA':case'ArrowLeft': keys.a=false;break;
      case'KeyD':case'ArrowRight':keys.d=false;break;
    }
  });
}
function requestPointerLock(){document.getElementById('canvas').requestPointerLock();}

// ── MOVIMIENTO ──
function updateMovement(delta) {
  if(STATE.inventoryOpen||STATE.mapPanelOpen||STATE.entryOpen)return;
  const euler=new THREE.Euler(0,yaw,0,'YXZ');
  const fwd=new THREE.Vector3(0,0,-1).applyEuler(euler);
  const right=new THREE.Vector3(1,0,0).applyEuler(euler);
  const vel=new THREE.Vector3(); const spd=7;
  if(keys.w)vel.addScaledVector(fwd,spd*delta);
  if(keys.s)vel.addScaledVector(fwd,-spd*delta);
  if(keys.a)vel.addScaledVector(right,-spd*delta);
  if(keys.d)vel.addScaledVector(right,spd*delta);
  camera.position.add(vel);
  const limit = STATE.currentWorld==='overworld' ? 55 : STATE.currentWorld==='mansion_interior' ? 12 : 18;
  camera.position.x=Math.max(-limit,Math.min(limit,camera.position.x));
  camera.position.z=Math.max(-limit,Math.min(limit,camera.position.z));
  camera.position.y=1.75;
  camera.rotation.order='YXZ'; camera.rotation.y=yaw; camera.rotation.x=pitch;

  // Salir de la mansión por la puerta
  if(STATE.currentWorld==='mansion_interior' && camera.position.z > 11.5) {
    travelToWorld('overworld');
  }
  // Entrar a la mansión desde el overworld
  if(STATE.currentWorld==='overworld' && camera.position.z < -13 && Math.abs(camera.position.x) < 2.5) {
    travelToWorld('mansion_interior');
  }
}

// ── OBJETOS CERCANOS ──
function checkNearbyObjects(delta) {
  if(STATE.inventoryOpen||STATE.mapPanelOpen||STATE.entryOpen)return;
  let nearest=null, nearestDist=Infinity;
  const t=Date.now();
  collectibles.forEach(c=>{
    const dist=camera.position.distanceTo(c.mesh.position);
    if(dist<nearestDist){nearestDist=dist;nearest=c;}
    c.mesh.position.y=1.2+Math.sin(t*.0018+c.obj.x)*.2;
    c.ring.position.y=c.mesh.position.y;
    c.glow.position.copy(c.mesh.position);
    c.mesh.rotation.y+=delta*1.2; c.ring.rotation.z+=delta*.8;
    c.glow.intensity=(c.obj.type!=='item'?2.4:.9)+Math.sin(t*.003)*.4;
  });
  const hint=document.getElementById('interact-hint');
  if(nearest&&nearestDist<2.8){hint.style.opacity='1';hint.textContent=`[ E ] Recoger — ${nearest.obj.name}`;}
  else hint.style.opacity='0';
  if(nearest&&nearestDist<1.7) collectItem(nearest);

  // Animaciones especiales
  scene.children.forEach(c=>{
    if(c.userData.fireFlicker) c.scale.y=1+Math.sin(t*.008+c.userData.flickerOffset)*.22;
    if(c.userData.floatOffset!==undefined) c.position.y=1.5+Math.sin(t*.001+c.userData.floatOffset)*.55;
  });
}

function collectNearby() {
  let nearest=null, nearestDist=Infinity;
  collectibles.forEach(c=>{const d=camera.position.distanceTo(c.mesh.position);if(d<nearestDist){nearestDist=d;nearest=c;}});
  if(nearest&&nearestDist<3.2) collectItem(nearest);
}

function collectItem(c) {
  if(STATE.inventory.find(i=>i.id===c.obj.id)) return;
  if(STATE.inventory.length>=INVENTORY_SIZE){showMsg('¡Inventario lleno!');return;}

  // Lógica especial según el tipo de objeto
  if(c.obj.type==='portal_map') {
    // Desbloquea el siguiente portal
    const nextNum = c.obj.unlocks;
    if(!STATE.portalsUnlocked.includes(nextNum)) STATE.portalsUnlocked.push(nextNum);
    if(!STATE.portalsVisited.includes(getCurrentPortalNum())) {
      STATE.portalsVisited.push(getCurrentPortalNum());
    }
    STATE.inventory.push({...c.obj});
    scene.remove(c.mesh); scene.remove(c.ring); scene.remove(c.glow);
    collectibles=collectibles.filter(x=>x!==c);
    showMsg(`${c.obj.icon} ${c.obj.name} — Portal ${nextNum} desbloqueado`);
    showEntry(c.obj.name, c.obj.desc, `Encontrado en: ${WORLDS[STATE.currentWorld].name}`);
    updateProgressHUD(); buildInventoryUI(); saveState();
    return;
  }

  if(c.obj.type==='sky_clue') {
    // Completa el portal 5 y habilita leer el mapa en la mansión
    if(!STATE.portalsVisited.includes(5)) STATE.portalsVisited.push(5);
    STATE.mapReadable = true;
    STATE.inventory.push({...c.obj});
    scene.remove(c.mesh); scene.remove(c.ring); scene.remove(c.glow);
    collectibles=collectibles.filter(x=>x!==c);
    showMsg('✨ ¡El mapa en la Mansión ahora puede ser leído!');
    showEntry(c.obj.name, c.obj.desc, `Encontrado en: ${WORLDS.cielo.name}`);
    updateProgressHUD(); buildInventoryUI(); saveState();
    return;
  }

  if(c.obj.type==='secret_map') {
    if(!STATE.mapReadable) {
      // No se puede leer todavía
      showMsg('Este mapa está desgastado... no puedes entender nada todavía.');
      showEntry(c.obj.name, c.obj.desc_locked, 'La Mansión');
      return;
    }
    // Se puede leer — desbloquea el portal secreto
    STATE.secretMapFound = true;
    STATE.inventory.push({...c.obj, desc: c.obj.desc_unlocked});
    scene.remove(c.mesh); scene.remove(c.ring); scene.remove(c.glow);
    collectibles=collectibles.filter(x=>x!==c);
    showMsg('🗺️ ¡Has encontrado el mapa del Portal Secreto!');
    showEntry('Mapa Antiguo', c.obj.desc_unlocked, 'La Mansión — El secreto revelado');
    updateProgressHUD(); buildInventoryUI(); saveState();
    return;
  }

  // Objeto normal
  STATE.inventory.push({...c.obj});
  scene.remove(c.mesh); scene.remove(c.ring); scene.remove(c.glow);
  collectibles=collectibles.filter(x=>x!==c);
  showMsg(`${c.obj.icon} ${c.obj.name} recogido`);
  buildInventoryUI(); saveState();
}

function getCurrentPortalNum() {
  const map = { ignis:1, glacium:2, void:3, luz:4, cielo:5 };
  return map[STATE.currentWorld] || 0;
}

// ── PORTALES ──
function checkPortals(delta) {
  if(STATE.inventoryOpen||STATE.mapPanelOpen||STATE.entryOpen) return;
  portalMeshes.forEach(pm=>{
    const dist=camera.position.distanceTo(pm.mesh.position);
    pm.mesh.rotation.z+=delta*.7; pm.disk.rotation.z-=delta*.4;
    pm.light.intensity=(pm.isUnlocked?2.0:.5)+Math.sin(Date.now()*.003)*.3;

    if(dist<2.0) {
      const pNum = pm.portal.num;
      // Portal de regreso siempre funciona
      if(pNum===-1) { travelToWorld('overworld'); return; }
      // Portal secreto
      if(pNum===0) {
        if(STATE.secretMapFound) showEnding();
        else showLockedMsg('Necesitas encontrar el mapa en la Mansión para abrir este portal.');
        return;
      }
      // Portales numerados
      if(!pm.isUnlocked || !STATE.portalsUnlocked.includes(pNum)) {
        const needed = pNum - 1;
        showLockedMsg(`Portal ${pNum} bloqueado. Primero visita el Portal ${needed} y encuentra el mapa.`);
      } else if(pm.portal.world !== STATE.currentWorld) {
        travelToWorld(pm.portal.world);
      }
    }
  });
}

function showLockedMsg(text) {
  const el=document.getElementById('locked-msg');
  document.getElementById('locked-text').textContent=text;
  el.style.display='block';
  clearTimeout(el._t); el._t=setTimeout(()=>{el.style.display='none';},3000);
}

function travelToWorld(worldId) {
  if(worldId===STATE.currentWorld) return;
  // Marcar portal visitado al salir de una dimensión
  const pNum = getCurrentPortalNum();
  if(pNum>0 && !STATE.portalsVisited.includes(pNum)) STATE.portalsVisited.push(pNum);

  const loading=document.getElementById('loading');
  document.getElementById('loading-text').textContent=`Viajando a ${WORLDS[worldId]?.name||worldId}...`;
  loading.style.display='flex';
  setTimeout(()=>{
    STATE.currentWorld=worldId;
    buildWorld(worldId);
    updateProgressHUD();
    saveState();
    loading.style.display='none';
  },1400);
}

function showEnding() {
  STATE.endingShown=true;
  const charName=STATE.character.name;
  document.getElementById('ending-text').textContent=`Lo encontraste, ${charName}. El portal que une todos los mundos. Ahora entiendes por qué la mansión existía, por qué los portales te llamaban. Todo comenzó aquí, en La Origen... y aquí termina tu viaje.`;
  document.getElementById('canvas').style.display='none';
  document.getElementById('hud').style.display='none';
  document.getElementById('ending').style.display='flex';
}

// ── ENTRADA MÁGICA ──
function showEntry(title, text, location) {
  setTimeout(()=>{
    STATE.entryOpen=true;
    if(isPointerLocked)document.exitPointerLock();
    document.getElementById('entry-title').textContent=title;
    document.getElementById('entry-location').textContent=location;
    document.getElementById('entry-text').textContent=text;
    document.getElementById('entry-panel').style.display='block';
  },500);
}
window.closeEntry=function(){STATE.entryOpen=false;document.getElementById('entry-panel').style.display='none';if(STATE.gameStarted)requestPointerLock();};

// ── INVENTARIO ──
function buildInventoryUI() {
  const grid=document.getElementById('inv-grid'); grid.innerHTML='';
  for(let i=0;i<INVENTORY_SIZE;i++){
    const slot=document.createElement('div'); slot.className='inv-slot';
    const item=STATE.inventory[i];
    if(item){slot.classList.add('has-item');slot.textContent=item.icon||'📦';slot.innerHTML+=`<div class="tooltip">${item.name}</div>`;slot.onclick=()=>showItemDetail(item);}
    grid.appendChild(slot);
  }
}
function showItemDetail(item) {
  const d=document.getElementById('inv-detail');
  d.innerHTML=`<strong style="color:#c8a96e">${item.name}</strong><br><br>${item.desc||item.desc_unlocked||'Un objeto misterioso.'}`;
}
window.toggleInventory=function(){
  STATE.inventoryOpen=!STATE.inventoryOpen;
  document.getElementById('inventory-panel').style.display=STATE.inventoryOpen?'block':'none';
  if(STATE.inventoryOpen){if(isPointerLocked)document.exitPointerLock();document.getElementById('inv-detail').textContent='Selecciona un objeto para ver su descripción.';}
  else if(STATE.gameStarted)requestPointerLock();
};

// ── MAPA ──
window.toggleMap=function(){
  STATE.mapPanelOpen=!STATE.mapPanelOpen;
  const panel=document.getElementById('map-panel');
  if(STATE.mapPanelOpen){
    if(isPointerLocked)document.exitPointerLock();
    buildMapUI();
    panel.style.display='block';
  } else {
    panel.style.display='none';
    if(STATE.gameStarted)requestPointerLock();
  }
};
function buildMapUI() {
  const rows=document.getElementById('map-rows'); rows.innerHTML='';
  const portals=[
    {num:1,label:'Portal 1 — Fuego 🔥',color:'#ff5500'},
    {num:2,label:'Portal 2 — Hielo ❄️',color:'#44aaff'},
    {num:3,label:'Portal 3 — Oscuridad 🌑',color:'#9955ff'},
    {num:4,label:'Portal 4 — Luz ☀️',color:'#ffee44'},
    {num:5,label:'Portal 5 — Cielo 🌤️',color:'#44ccff'},
    {num:0,label:'Portal Secreto — La Origen ✨',color:'#ff88ff'}
  ];
  portals.forEach(p=>{
    const visited=STATE.portalsVisited.includes(p.num);
    const unlocked=STATE.portalsUnlocked.includes(p.num)||(p.num===0&&STATE.secretMapFound);
    const row=document.createElement('div'); row.className='map-portal-row';
    const dot=document.createElement('div'); dot.className='map-dot'; dot.style.background=visited?p.color:'transparent'; dot.style.border=`2px solid ${p.color}`; dot.style.borderRadius='50%';
    const name=document.createElement('div'); name.className='map-portal-name'; name.textContent=p.label;
    const status=document.createElement('div'); status.className='map-portal-status';
    if(visited){status.textContent='✓ Visitado';status.classList.add('status-visited');}
    else if(unlocked){status.textContent='Disponible';status.classList.add('status-unlocked');}
    else{status.textContent='🔒 Bloqueado';status.classList.add('status-locked');}
    row.appendChild(dot); row.appendChild(name); row.appendChild(status);
    rows.appendChild(row);
  });
  // Estado del mapa secreto
  const mapRow=document.createElement('div'); mapRow.style='margin-top:1rem;padding-top:.8rem;border-top:1px solid #3a2a18;font-size:.8rem;color:#8a7a60;';
  mapRow.textContent=STATE.secretMapFound?'🗺️ Mapa de La Origen encontrado — Portal Secreto desbloqueado':STATE.mapReadable?'🗺️ Hay un mapa en la Mansión que ahora puedes leer...':'🗺️ El mapa del portal secreto está en la Mansión (bloqueado)';
  rows.appendChild(mapRow);
}

// ── HUD DE PROGRESO ──
function updateProgressHUD() {
  for(let i=1;i<=5;i++){
    const dot=document.getElementById(`dot-${i}`);
    if(!dot)continue;
    if(STATE.portalsVisited.includes(i)){dot.classList.add('visited');dot.classList.remove('unlocked');}
    else if(STATE.portalsUnlocked.includes(i)){dot.classList.add('unlocked');dot.classList.remove('visited');}
    else{dot.classList.remove('visited','unlocked');}
  }
  const visited=STATE.portalsVisited.length;
  const st=document.getElementById('status-text');
  if(STATE.endingShown) st.textContent='¡Aventura completada! ✨';
  else if(STATE.secretMapFound) st.textContent='¡Portal secreto desbloqueado!';
  else if(STATE.mapReadable) st.textContent='Regresa a la Mansión — lee el mapa';
  else if(visited>=5) st.textContent='Regresa a la Mansión';
  else if(visited>0) st.textContent=`Busca el Portal ${visited+1}`;
  else st.textContent='Encuentra el Portal 1';
}

function showMsg(text){const msg=document.getElementById('pickup-msg');msg.textContent=text;msg.style.opacity='1';clearTimeout(msg._t);msg._t=setTimeout(()=>{msg.style.opacity='0';},3000);}
function saveState(){localStorage.setItem('aw2_state',JSON.stringify({currentWorld:STATE.currentWorld,portalsVisited:STATE.portalsVisited,portalsUnlocked:STATE.portalsUnlocked,mapReadable:STATE.mapReadable,secretMapFound:STATE.secretMapFound,inventory:STATE.inventory,character:STATE.character}));}

// ── LOOP ──
function animate(){
  requestAnimationFrame(animate);
  const delta=Math.min(clock.getDelta(),.05);
  if(STATE.gameStarted){updateMovement(delta);checkNearbyObjects(delta);checkPortals(delta);}
  renderer.render(scene,camera);
}

window.addEventListener('load',()=>{if(localStorage.getItem('aw2_state'))document.getElementById('btn-load').style.display='block';});
window.startNewGame=startNewGame; window.loadGame=loadGame;
window.showCharCreator=showCharCreator; window.closeCharCreator=closeCharCreator;
window.selectClass=selectClass; window.saveCharacter=saveCharacter;
