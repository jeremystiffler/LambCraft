// Lambcraft 3D voxel game engine (Three.js) — PERFORMANCE OPTIMIZED
// Full Minecraft-like: day/night, biomes, block drops, mobs, villagers, weapons, sheep attacks
import * as THREE from "three";
import { BLOCK_TYPES, getBlockDrop } from "../data/blocks";
import { SHEEP_TYPES, SHEEP_BY_ID, pickRandomSheepType } from "../data/sheep";
import { MOB_TYPES, pickRandomMobType } from "../data/mobs";
import { VILLAGER_TYPES, pickRandomVillagerType } from "../data/villagers";

const GRAVITY = -28;
const JUMP_VELOCITY = 9.5;
const MOVE_SPEED = 5.5;
const PLAYER_HEIGHT = 1.7;
const PLAYER_RADIUS = 0.3;
const REACH = 5.5;

// Day/night cycle: 5 min day, 5 min night
const DAY_DURATION = 5 * 60;
const NIGHT_DURATION = 5 * 60;
const CYCLE_DURATION = DAY_DURATION + NIGHT_DURATION;

const key = (x, y, z) => `${x},${y},${z}`;

// --- Biome system ---
const BIOME_SIZE = 64;

function getBiomeAt(x, z) {
  const bx = Math.floor((x + 500) / BIOME_SIZE);
  const bz = Math.floor((z + 500) / BIOME_SIZE);
  const h = ((bx * 374761393 + bz * 668265263) & 0x7FFFFFFF) % 5;
  const biomes = ["plains", "forest", "desert", "volcano", "fantasy"];
  return biomes[h];
}

function biomeTerrainHeight(biome, x, z) {
  const base = 3;
  const n1 = Math.sin(x * 0.12) * 1.5 + Math.cos(z * 0.11) * 1.5;
  const n2 = Math.sin(x * 0.3 + 1.5) * 0.6 + Math.cos(z * 0.25 + 2.3) * 0.6;
  switch (biome) {
    case "plains":   return Math.max(1, Math.floor(base + n1 * 0.4 + n2 * 0.2));
    case "forest":   return Math.max(1, Math.floor(base + n1 * 0.8 + n2 * 0.3));
    case "desert":   return Math.max(1, Math.floor(base + n1 * 0.3 + n2 * 0.1));
    case "volcano":  return Math.max(1, Math.floor(base + Math.abs(n1) * 1.5 + n2 * 0.5));
    case "fantasy":  return Math.max(1, Math.floor(base + n1 * 0.6 + n2 * 0.4));
    default:         return Math.max(1, Math.floor(base + n1 * 0.5));
  }
}

function biomeTopBlock(biome) {
  switch (biome) {
    case "plains":   return "grass";
    case "forest":   return "grass";
    case "desert":   return "sand";
    case "volcano":  return "lava_stone";
    case "fantasy":  return "fantasy_glow";
    default:         return "grass";
  }
}

function biomeSubBlock(biome) {
  switch (biome) {
    case "plains":   return "dirt";
    case "forest":   return "dirt";
    case "desert":   return "sand";
    case "volcano":  return "obsidian";
    case "fantasy":  return "crystal";
    default:         return "dirt";
  }
}

function biomeTreeChance(biome) {
  switch (biome) {
    case "plains":   return 0.002;
    case "forest":   return 0.01;
    case "desert":   return 0.001;
    case "volcano":  return 0.0005;
    case "fantasy":  return 0.004;
    default:         return 0.005;
  }
}

function biomeFlowerChance(biome) {
  switch (biome) {
    case "plains":   return 0.008;
    case "forest":   return 0.005;
    case "desert":   return 0.002;
    case "volcano":  return 0.0;
    case "fantasy":  return 0.01;
    default:         return 0.003;
  }
}

export class LambcraftGame {
  constructor(container, callbacks = {}) {
    this.container = container;
    this.cb = callbacks;
    this.disposed = false;

    // --- Scene ---
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xbae6fd);
    this.scene.fog = new THREE.Fog(0xbae6fd, 15, 45); // closer fog = more culling

    // --- Camera ---
    this.camera = new THREE.PerspectiveCamera(72, 1, 0.1, 50); // reduced far plane
    this.camera.position.set(0, 6, 0);
    this.yaw = 0;
    this.pitch = 0;

    // --- Renderer (PERFORMANCE: no AA, pixel ratio capped at 1) ---
    this.renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(1); // hard cap at 1 — no Retina rendering
    container.appendChild(this.renderer.domElement);
    this.renderer.domElement.style.cursor = "crosshair";
    this.renderer.domElement.setAttribute("data-testid", "game-canvas");

    // --- Lights ---
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    this.sunLight = new THREE.DirectionalLight(0xffffff, 0.9);
    this.sunLight.position.set(20, 30, 10);
    this.scene.add(this.ambientLight, this.sunLight);

    // --- Stars ---
    this._buildStars();

    // --- World (using instanced meshes per block type) ---
    this.world = new Map();
    this.blockMeshes = new Map(); // key -> { meshType, index } for instanced lookup
    this.sheepEntities = [];
    this.maxSheep = 4;
    this.blocksPlaced = 0;
    this.blocksBroken = 0;

    // --- Mobs ---
    this.mobEntities = [];
    this.maxMobs = 2;

    // --- Villagers ---
    this.villagerEntities = [];

    // --- Player ---
    this.player = {
      pos: new THREE.Vector3(0, 0, 0),
      vel: new THREE.Vector3(),
      onGround: false,
      health: 20,
      maxHealth: 20,
    };
    this.keys = new Set();
    this.pointerLocked = false;

    // --- Hotbar ---
    this.hotbar = [
      { type: "tool",  id: "catcher",  name: "Sheep Catcher" },
      { type: "tool",  id: "sword",    name: "Sword" },
      { type: "tool",  id: "pickaxe",  name: "Pickaxe" },
      { type: "block", id: "grass" },
      { type: "block", id: "dirt" },
      { type: "block", id: "stone" },
      { type: "block", id: "wood" },
      { type: "block", id: "planks" },
      { type: "block", id: "brick" },
      { type: "block", id: "fence" },
    ];
    this.selected = 0;

    // --- Inventory ---
    this.inventory = {
      grass: 64, dirt: 64, stone: 32, wood: 32, planks: 32,
      brick: 16, fence: 16, sand: 16, cobble: 16, glass: 8,
    };

    // --- Highlight box ---
    this.highlight = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(1.01, 1.01, 1.01)),
      new THREE.LineBasicMaterial({ color: 0x1f2937, linewidth: 2 })
    );
    this.highlight.visible = false;
    this.scene.add(this.highlight);

    // --- Raycaster ---
    this.raycaster = new THREE.Raycaster();
    this.raycaster.far = REACH;

    // --- Day/night ---
    this._daySky = new THREE.Color(0xbae6fd);
    this._nightSky = new THREE.Color(0x0a0a2e);
    this._dayFog = new THREE.Color(0xbae6fd);
    this._nightFog = new THREE.Color(0x0a0a2e);
    this.timeOfDay = 0;

    // --- Sheep attack cooldowns ---
    this.sheepAttackCooldowns = new Map();

    // --- Instanced mesh tracking ---
    this._instancedGroups = new Map(); // blockId -> { mesh, instances: [] }

    // --- Build ---
    this._buildWorld();
    this._initSheep();
    this._initMobs();
    this._spawnVillages();
    this._spawnRobber();
    this._spawnPlayerSafe();
    this._bindEvents();
    this._resize();
    this._last = performance.now();
    this._loop = this._loop.bind(this);
    this._raf = requestAnimationFrame(this._loop);
    this._frameCount = 0;
  }

  // ---------- Stars ----------
  _buildStars() {
    const starGeo = new THREE.BufferGeometry();
    const starPositions = [];
    for (let i = 0; i < 100; i++) { // reduced from 200
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const r = 200;
      starPositions.push(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi) + 20,
        r * Math.sin(phi) * Math.sin(theta)
      );
    }
    starGeo.setAttribute("position", new THREE.Float32BufferAttribute(starPositions, 3));
    this.stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.8 }));
    this.stars.visible = false;
    this.scene.add(this.stars);
  }

  // ---------- Day/Night ----------
  get isNight() {
    const t = this.timeOfDay % CYCLE_DURATION;
    return t >= DAY_DURATION;
  }

  get dayNightFactor() {
    const t = this.timeOfDay % CYCLE_DURATION;
    if (t < DAY_DURATION) {
      return Math.max(0, (t / DAY_DURATION) - 0.7) * 3.33;
    } else {
      const nightT = (t - DAY_DURATION) / NIGHT_DURATION;
      return Math.min(1, nightT * 3.33);
    }
  }

  _updateDayNight(dt) {
    this.timeOfDay = (this.timeOfDay + dt) % CYCLE_DURATION;
    const f = this.dayNightFactor;
    this.scene.background.lerpColors(this._daySky, this._nightSky, f);
    this.scene.fog.color.lerpColors(this._dayFog, this._nightFog, f);
    this.ambientLight.intensity = THREE.MathUtils.lerp(0.85, 0.15, f);
    this.sunLight.intensity = THREE.MathUtils.lerp(0.9, 0.05, f);
    this.stars.visible = f > 0.3;
    if (this.stars.visible) {
      this.stars.material.opacity = Math.min(1, (f - 0.3) * 3);
    }
    const t = this.timeOfDay % CYCLE_DURATION;
    const angle = (t / CYCLE_DURATION) * Math.PI * 2;
    this.sunLight.position.set(
      Math.cos(angle) * 30,
      Math.sin(angle) * 30 + 10,
      10
    );
    if (this.cb.onDayNightChange) {
      this.cb.onDayNightChange({ isNight: this.isNight, factor: f });
    }
  }

  // ---------- World building (INSTANCED MESHES) ----------
  _buildWorld() {
    const SIZE = 20; // reduced from 40 for performance
    this._heightCache = new Map();

    // First pass: determine which blocks go where
    const blockPositions = new Map(); // blockId -> [{x,y,z}]

    for (let x = -SIZE; x <= SIZE; x++) {
      for (let z = -SIZE; z <= SIZE; z++) {
        const biome = getBiomeAt(x, z);
        const h = biomeTerrainHeight(biome, x, z);
        const topBlock = biomeTopBlock(biome);
        const subBlock = biomeSubBlock(biome);

        for (let y = 0; y < h; y++) {
          let b = subBlock;
          if (y === h - 1) b = topBlock;
          else if (y < 1) b = "stone";
          if (!blockPositions.has(b)) blockPositions.set(b, []);
          blockPositions.get(b).push({ x, y, z });
          this.world.set(key(x, y, z), b);
        }

        // Ore generation
        if (h > 2 && Math.random() < 0.005) {
          const oreKey = key(x, h - 1, z);
          if (!blockPositions.has("coal_ore")) blockPositions.set("coal_ore", []);
          blockPositions.get("coal_ore").push({ x, y: h - 1, z });
          this.world.set(oreKey, "coal_ore");
        }

        const r = Math.random();
        const nearSpawn = Math.abs(x) <= 3 && Math.abs(z) <= 3;
        if (!nearSpawn) {
          if (r < biomeTreeChance(biome)) {
            this._collectTreeBlocks(x, h, z, biome, blockPositions);
          } else if (r < biomeTreeChance(biome) + biomeFlowerChance(biome)) {
            // Decorations are handled as individual meshes (too few to instance)
          }
        }

        this._heightCache.set(x + "," + z, h);

        // Lakes/ponds
        if ((biome === "plains" || biome === "forest") && !nearSpawn) {
          const lakeNoise = Math.sin(x * 0.05 + 3.7) * Math.cos(z * 0.05 + 1.2);
          if (lakeNoise > 0.85) {
            const k1 = key(x, h - 1, z);
            const k2 = key(x, h - 2, z);
            this.world.set(k1, "water");
            this.world.set(k2, "clay");
            if (!blockPositions.has("water")) blockPositions.set("water", []);
            if (!blockPositions.has("clay")) blockPositions.set("clay", []);
            blockPositions.get("water").push({ x, y: h - 1, z });
            blockPositions.get("clay").push({ x, y: h - 2, z });
          }
        }
      }
    }

    // Create instanced meshes for each block type
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    for (const [blockId, positions] of blockPositions) {
      if (positions.length === 0) continue;
      const block = BLOCK_TYPES[blockId];
      if (!block) continue;

      const mat = new THREE.MeshLambertMaterial({
        color: new THREE.Color(block.sideColor || block.color || "#888"),
        transparent: !!block.transparent,
        opacity: block.transparent ? 0.6 : 1.0,
      });

      const instancedMesh = new THREE.InstancedMesh(boxGeo, mat, positions.length);
      instancedMesh.userData = { kind: "block-instanced", blockId };

      const dummy = new THREE.Object3D();
      for (let i = 0; i < positions.length; i++) {
        const p = positions[i];
        dummy.position.set(p.x + 0.5, p.y + (block.liquid ? 0 : 0.5), p.z + 0.5);
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(i, dummy.matrix);
      }
      instancedMesh.instanceMatrix.needsUpdate = true;
      this.scene.add(instancedMesh);
    }

    // Generate decorations as instanced meshes (PERFORMANCE: no individual meshes)
    const decoPositions = new Map(); // blockId -> [{x,y,z}]
    for (let x = -SIZE; x <= SIZE; x++) {
      for (let z = -SIZE; z <= SIZE; z++) {
        const biome = getBiomeAt(x, z);
        const h = this._heightCache.get(x + "," + z);
        if (!h) continue;
        if (Math.abs(x) <= 3 && Math.abs(z) <= 3) continue;
        const r = Math.random();
        if (r < biomeFlowerChance(biome) * 0.15) { // drastically reduced
          let decoId;
          if (biome === "fantasy") decoId = ["fantasy_flower","mushroom_r","mushroom_b"][Math.floor(Math.random()*3)];
          else if (biome === "desert") decoId = "cactus";
          else decoId = ["flower","tulip","daisy"][Math.floor(Math.random()*3)];
          if (!decoPositions.has(decoId)) decoPositions.set(decoId, []);
          decoPositions.get(decoId).push({ x, y: h, z });
          this.world.set(key(x, h, z), decoId);
        }
      }
    }
    // Create instanced meshes for decorations
    const decoGeo = new THREE.BoxGeometry(0.4, 0.6, 0.4);
    for (const [blockId, positions] of decoPositions) {
      if (positions.length === 0) continue;
      const block = BLOCK_TYPES[blockId];
      if (!block) continue;
      const mat = new THREE.MeshLambertMaterial({
        color: new THREE.Color(block.topColor || block.color || "#888"),
        transparent: true, opacity: 0.9,
      });
      const instMesh = new THREE.InstancedMesh(decoGeo, mat, positions.length);
      const dummy = new THREE.Object3D();
      for (let i = 0; i < positions.length; i++) {
        const p = positions[i];
        dummy.position.set(p.x + 0.5, p.y + 0.3, p.z + 0.5);
        dummy.updateMatrix();
        instMesh.setMatrixAt(i, dummy.matrix);
      }
      instMesh.instanceMatrix.needsUpdate = true;
      instMesh.userData = { kind: "deco-instanced", blockId };
      this.scene.add(instMesh);
    }
  }

  _collectTreeBlocks(x, baseY, z, biome, blockPositions) {
    if (biome === "desert") {
      const h = 2 + Math.floor(Math.random() * 2);
      for (let i = 0; i < h; i++) {
        const k = key(x, baseY + i, z);
        if (!blockPositions.has("cactus")) blockPositions.set("cactus", []);
        blockPositions.get("cactus").push({ x, y: baseY + i, z });
        this.world.set(k, "cactus");
      }
      return;
    }
    if (biome === "volcano") {
      for (let i = 0; i < 3; i++) {
        const k = key(x, baseY + i, z);
        if (!blockPositions.has("obsidian")) blockPositions.set("obsidian", []);
        blockPositions.get("obsidian").push({ x, y: baseY + i, z });
        this.world.set(k, "obsidian");
      }
      return;
    }
    // Normal tree — add to bark/leaves instanced pools
    const trunkH = biome === "forest" ? 4 : 3;
    if (!blockPositions.has("wood")) blockPositions.set("wood", []);
    if (!blockPositions.has("leaves")) blockPositions.set("leaves", []);
    for (let i = 0; i < trunkH; i++) {
      blockPositions.get("wood").push({ x, y: baseY + i, z });
      this.world.set(key(x, baseY + i, z), "wood");
    }
    for (let dx = -2; dx <= 2; dx++) {
      for (let dz = -2; dz <= 2; dz++) {
        for (let dy = trunkH - 1; dy <= trunkH + 1; dy++) {
          if (dx === 0 && dz === 0 && dy < trunkH + 1) continue;
          if (Math.abs(dx) === 2 && Math.abs(dz) === 2 && Math.random() < 0.4) continue;
          blockPositions.get("leaves").push({ x: x + dx, y: baseY + dy, z: z + dz });
          this.world.set(key(x + dx, baseY + dy, z + dz), "leaves");
        }
      }
    }
    blockPositions.get("leaves").push({ x, y: baseY + trunkH + 1, z });
    this.world.set(key(x, baseY + trunkH + 1, z), "leaves");
  }

  _placeDecoration(x, baseY, z, biome) {
    if (biome === "desert") {
      if (Math.random() < 0.5) this._setBlock(x, baseY, z, "cactus", false);
    } else if (biome === "fantasy") {
      const r = Math.random();
      if (r < 0.4) this._setBlock(x, baseY, z, "fantasy_flower", false);
      else if (r < 0.6) this._setBlock(x, baseY, z, "mushroom_r", false);
      else this._setBlock(x, baseY, z, "mushroom_b", false);
    } else {
      const r = Math.random();
      if (r < 0.33) this._setBlock(x, baseY, z, "flower", false);
      else if (r < 0.66) this._setBlock(x, baseY, z, "tulip", false);
      else this._setBlock(x, baseY, z, "daisy", false);
    }
  }

  _topY(x, z) {
    if (this._heightCache) {
      const k = x + "," + z;
      if (this._heightCache.has(k)) return this._heightCache.get(k);
    }
    for (let y = 30; y >= 0; y--) if (this.world.has(key(x, y, z))) return y + 1;
    return -1;
  }

  _setBlock(x, y, z, blockId, placedByPlayer = true) {
    const k = key(x, y, z);
    // For individual blocks (decorations etc.), use simple mesh
    if (!blockId) return;
    const block = BLOCK_TYPES[blockId];
    if (!block) return;

    const mesh = this._makeBlockMesh(blockId);
    if (!mesh) return;
    mesh.position.set(x + 0.5, y + (block.liquid ? 0 : 0.5), z + 0.5);
    mesh.userData = { kind: "block", blockId, x, y, z };
    this.world.set(k, blockId);
    this.blockMeshes.set(k, mesh);
    this.scene.add(mesh);
    if (placedByPlayer) this.blocksPlaced++;
  }

  _removeBlock(x, y, z) {
    const k = key(x, y, z);
    if (!this.world.has(k)) return;
    this.world.delete(k);
    const mesh = this.blockMeshes.get(k);
    if (mesh) {
      this.scene.remove(mesh);
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) {
        if (Array.isArray(mesh.material)) mesh.material.forEach(m => m.dispose());
        else mesh.material.dispose();
      }
      this.blockMeshes.delete(k);
    }
    this.blocksBroken++;
  }

  // --- Simplified block mesh creation (single material) ---
  _makeBlockMesh(blockId) {
    const block = BLOCK_TYPES[blockId];
    if (!block) return null;
    if (blockId === "fence") return this._makeFenceMesh(block);
    if (block.liquid) return this._makeLiquidMesh(block);
    if (blockId === "flower" || blockId === "tulip" || blockId === "daisy" || blockId === "sapling") return this._makePlantMesh(block);
    if (blockId === "cactus") return this._makeCactusMesh(block);
    if (blockId === "mushroom_r" || blockId === "mushroom_b") return this._makeMushroomMesh(block);

    // Standard cube — SINGLE material (not 6-face multi-material)
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const sideC = new THREE.Color(block.sideColor || block.color || "#888");
    const mat = new THREE.MeshLambertMaterial({ color: sideC, transparent: !!block.transparent, opacity: block.transparent ? 0.6 : 1.0 });
    return new THREE.Mesh(geo, mat);
  }

  _makeFenceMesh(block) {
    const group = new THREE.Group();
    const woodMat = new THREE.MeshLambertMaterial({ color: block.topColor || block.color });
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.5, 0.15), woodMat);
    post.position.y = 0.75;
    group.add(post);
    const railGeo = new THREE.BoxGeometry(0.1, 0.12, 1.0);
    const rail1 = new THREE.Mesh(railGeo, woodMat);
    rail1.position.set(0, 0.45, 0);
    const rail2 = new THREE.Mesh(railGeo, woodMat);
    rail2.position.set(0, 1.05, 0);
    group.add(rail1, rail2);
    return group;
  }

  _makeLiquidMesh(block) {
    const geo = new THREE.BoxGeometry(1, 0.85, 1);
    const mat = new THREE.MeshLambertMaterial({ color: block.topColor, transparent: true, opacity: 0.5 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = -0.075;
    return mesh;
  }

  _makePlantMesh(block) {
    const group = new THREE.Group();
    const mat = new THREE.MeshLambertMaterial({ color: block.topColor, transparent: true, opacity: 0.9 });
    const stemMat = new THREE.MeshLambertMaterial({ color: "#228B45" });
    const stem = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.5, 0.06), stemMat);
    stem.position.y = 0.25;
    group.add(stem);
    const topGeo = new THREE.BoxGeometry(0.4, 0.15, 0.02);
    const t1 = new THREE.Mesh(topGeo, mat);
    t1.position.y = 0.55;
    t1.rotation.y = Math.PI / 4;
    const t2 = new THREE.Mesh(topGeo, mat);
    t2.position.y = 0.55;
    t2.rotation.y = -Math.PI / 4;
    group.add(t1, t2);
    return group;
  }

  _makeCactusMesh(block) {
    const mat = new THREE.MeshLambertMaterial({ color: block.topColor });
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1, 0.8), mat);
    mesh.position.y = 0.5;
    return mesh;
  }

  _makeMushroomMesh(block) {
    const group = new THREE.Group();
    const stemMat = new THREE.MeshLambertMaterial({ color: "#FFFFFF" });
    const capMat = new THREE.MeshLambertMaterial({ color: block.topColor });
    const stem = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.3, 0.2), stemMat);
    stem.position.y = 0.15;
    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.5), capMat);
    cap.position.y = 0.4;
    group.add(stem, cap);
    return group;
  }

  // --- Cast ray (DDA voxel traversal — O(distance) instead of O(scene objects)) ---
  _castRay() {
    const origin = this.camera.position.clone();
    const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
    dir.normalize();
    
    // DDA voxel traversal
    let x = Math.floor(origin.x);
    let y = Math.floor(origin.y);
    let z = Math.floor(origin.z);
    
    const stepX = dir.x >= 0 ? 1 : -1;
    const stepY = dir.y >= 0 ? 1 : -1;
    const stepZ = dir.z >= 0 ? 1 : -1;
    
    const tDeltaX = dir.x !== 0 ? Math.abs(1 / dir.x) : Infinity;
    const tDeltaY = dir.y !== 0 ? Math.abs(1 / dir.y) : Infinity;
    const tDeltaZ = dir.z !== 0 ? Math.abs(1 / dir.z) : Infinity;
    
    let tMaxX = dir.x !== 0 ? ((dir.x > 0 ? (x + 1 - origin.x) : (origin.x - x)) * tDeltaX) : Infinity;
    let tMaxY = dir.y !== 0 ? ((dir.y > 0 ? (y + 1 - origin.y) : (origin.y - y)) * tDeltaY) : Infinity;
    let tMaxZ = dir.z !== 0 ? ((dir.z > 0 ? (z + 1 - origin.z) : (origin.z - z)) * tDeltaZ) : Infinity;
    
    for (let i = 0; i < Math.ceil(REACH * 2); i++) {
      const k = key(x, y, z);
      if (this.world.has(k)) {
        const blockId = this.world.get(k);
        const block = BLOCK_TYPES[blockId];
        if (block && !block.liquid) {
          return { object: { userData: { kind: 'block', blockId, x, y, z } }, distance: i * 0.5 };
        }
      }
      if (tMaxX < tMaxY) {
        if (tMaxX < tMaxZ) { x += stepX; tMaxX += tDeltaX; }
        else { z += stepZ; tMaxZ += tDeltaZ; }
      } else {
        if (tMaxY < tMaxZ) { y += stepY; tMaxY += tDeltaY; }
        else { z += stepZ; tMaxZ += tDeltaZ; }
      }
    }
    return null;
  }

  // --- Sheep AI ---
  _initSheep() {
    for (let i = 0; i < this.maxSheep; i++) this._spawnSheep();
  }

  _spawnSheep() {
    const type = pickRandomSheepType();
    const group = this._makeSheepMesh(type);
    let tries = 0, x, z, y;
    do {
      x = (Math.random() - 0.5) * 40;
      z = (Math.random() - 0.5) * 40;
      y = this._topY(Math.floor(x), Math.floor(z));
      tries++;
    } while (y < 2 && tries < 20);
    group.position.set(x, y, z);
    this.scene.add(group);
    this.sheepEntities.push({
      group, type, vel: new THREE.Vector3(), wanderTimer: Math.random() * 3,
      bounceT: Math.random() * 10, alive: true, trapped: false, hasAttack: type.specialAttack != null,
    });
  }

  _makeSheepMesh(type) {
    const group = new THREE.Group();
    const woolMat = new THREE.MeshLambertMaterial({ color: type.woolColor });
    const accentMat = new THREE.MeshLambertMaterial({ color: type.accentColor || "#333" });
    const black = new THREE.MeshLambertMaterial({ color: "#111" });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.6, 0.55), woolMat);
    body.position.y = 0.45;
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), accentMat);
    head.position.set(0.55, 0.6, 0);
    const eyeGeo = new THREE.BoxGeometry(0.06, 0.06, 0.06);
    const eyeL = new THREE.Mesh(eyeGeo, black);
    eyeL.position.set(0.75, 0.7, 0.13);
    const eyeR = new THREE.Mesh(eyeGeo, black);
    eyeR.position.set(0.75, 0.7, -0.13);
    const legGeo = new THREE.BoxGeometry(0.14, 0.3, 0.14);
    [[0.3, 0.15, 0.18], [0.3, 0.15, -0.18], [-0.3, 0.15, 0.18], [-0.3, 0.15, -0.18]].forEach(([px, py, pz]) => {
      const l = new THREE.Mesh(legGeo, accentMat);
      l.position.set(px, py, pz);
      group.add(l);
    });
    group.add(body, head, eyeL, eyeR);
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), woolMat);
    tail.position.set(-0.55, 0.55, 0);
    group.add(tail);
    if (type.id === "unicorn") {
      const hornMat = new THREE.MeshLambertMaterial({ color: 0xFFD700 });
      const horn = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.3, 0.08), hornMat);
      horn.position.set(0.75, 0.95, 0);
      group.add(horn);
    }
    group.userData = { kind: "sheep", typeId: type.id };
    return group;
  }

  _initMobs() {
    for (let i = 0; i < this.maxMobs; i++) this._spawnMob();
  }

  _spawnMob() {
    const mobType = pickRandomMobType();
    const group = this._makeMobMesh(mobType);
    let tries = 0, x, z, y;
    do {
      x = (Math.random() - 0.5) * 30;
      z = (Math.random() - 0.5) * 30;
      y = this._topY(Math.floor(x), Math.floor(z));
      tries++;
    } while (y < 2 && tries < 20);
    group.position.set(x, y, z);
    this.scene.add(group);
    this.mobEntities.push({
      group, type: mobType, vel: new THREE.Vector3(), wanderTimer: Math.random() * 4,
      bounceT: Math.random() * 10, alive: true, speed: mobType.speed,
    });
  }

  _makeMobMesh(mobType) {
    const group = new THREE.Group();
    const w = mobType.scaleW || 0.8, h = mobType.scaleH || 0.8, d = mobType.scaleD || 0.8;
    const headSize = mobType.headSize || 0.3;
    const mc = mobType.color, lc = mobType.accentColor || mc, ec = mobType.eyeColor || "#111";
    const bodyMat = new THREE.MeshLambertMaterial({ color: mc });
    const headMat = new THREE.MeshLambertMaterial({ color: mc });
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h * 0.6, d), bodyMat);
    body.position.y = h * 0.4;
    const head = new THREE.Mesh(new THREE.BoxGeometry(headSize, headSize, headSize), headMat);
    head.position.set(w * 0.4 + headSize * 0.5, h * 0.6, 0);
    group.add(body, head);
    const eyeMat = new THREE.MeshLambertMaterial({ color: ec });
    const eyeGeo = new THREE.BoxGeometry(0.06, 0.06, 0.04);
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(w * 0.4 + headSize * 0.5, h * 0.58, headSize * 0.25);
    const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeR.position.set(w * 0.4 + headSize * 0.5, h * 0.58, -headSize * 0.25);
    group.add(eyeL, eyeR);
    const legMat = new THREE.MeshLambertMaterial({ color: lc });
    const legW = w * 0.15, legH = h * 0.3;
    const legGeo = new THREE.BoxGeometry(legW, legH, legW);
    [[w*0.25,legH*0.5,d*0.2],[w*0.25,legH*0.5,-d*0.2],[-w*0.25,legH*0.5,d*0.2],[-w*0.25,legH*0.5,-d*0.2]].forEach(([px,py,pz]) => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(px, py, pz);
      group.add(leg);
    });
    if (mobType.id === "chicken") {
      const beakMat = new THREE.MeshLambertMaterial({ color: mobType.beakColor });
      const beak = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.06, 0.06), beakMat);
      beak.position.set(w*0.4+headSize*0.6, h*0.53, 0);
      group.add(beak);
    }
    if (mobType.id === "horse") {
      const maneMat = new THREE.MeshLambertMaterial({ color: mobType.maneColor });
      const mane = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.3, 0.4), maneMat);
      mane.position.set(w*0.2, h*0.7, 0);
      group.add(mane);
    }
    group.userData = { kind: "mob", typeId: mobType.id };
    return group;
  }

  _spawnVillages() {
    for (let i = 0; i < 1; i++) {
      const vx = (Math.random() - 0.5) * 50;
      const vz = (Math.random() - 0.5) * 50;
      const vy = this._topY(Math.floor(vx), Math.floor(vz));
      if (vy < 2) continue;
      const type = pickRandomVillagerType();
      const group = this._makeVillagerMesh(type);
      group.position.set(vx, vy, vz);
      this.scene.add(group);
      this.villagerEntities.push({
        group, type, vel: new THREE.Vector3(), wanderTimer: Math.random() * 5, bounceT: Math.random() * 10,
      });
    }
  }

  _makeVillagerMesh(type) {
    const group = new THREE.Group();
    const bodyMat = new THREE.MeshLambertMaterial({ color: type.robeColor });
    const skinMat = new THREE.MeshLambertMaterial({ color: "#D4A574" });
    const hairMat = new THREE.MeshLambertMaterial({ color: type.hairColor });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.9, 0.4), bodyMat);
    body.position.y = 0.75;
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), skinMat);
    head.position.y = 1.4;
    const hair = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.15, 0.42), hairMat);
    hair.position.y = 1.6;
    group.add(body, head, hair);
    group.userData = { kind: "villager" };
    return group;
  }

  _spawnRobber() {
    const group = new THREE.Group();
    const robeMat = new THREE.MeshLambertMaterial({ color: "#1a1a2e" });
    const skinMat = new THREE.MeshLambertMaterial({ color: "#D4A574" });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.0, 0.4), robeMat);
    body.position.y = 0.8;
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.35), skinMat);
    head.position.y = 1.5;
    group.add(body, head);
    let tries = 0, x, z, y;
    do {
      x = (Math.random() - 0.5) * 40;
      z = (Math.random() - 0.5) * 40;
      y = this._topY(Math.floor(x), Math.floor(z));
      tries++;
    } while (y < 2 && tries < 20);
    group.position.set(x, y, z);
    this.scene.add(group);
    this.robber = { group, vel: new THREE.Vector3(), wanderTimer: 0, snatchTimer: 8, target: null, trapped: false, trapTimer: 0, cageGroup: null };
  }

  _spawnPlayerSafe() {
    const sy = this._topY(0, 0);
    this.player.pos.set(0, sy + 1, 0);
  }

  _buildCage(robber) {
    const group = new THREE.Group();
    const barMat = new THREE.MeshLambertMaterial({ color: "#555" });
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.5, 0.08), barMat);
      bar.position.set(Math.cos(angle) * 0.6, 0.75, Math.sin(angle) * 0.6);
      group.add(bar);
    }
    group.position.copy(robber.group.position);
    this.scene.add(group);
    return group;
  }

  _collectSheep(sheepEnt) {
    sheepEnt.alive = false;
    this.scene.remove(sheepEnt.group);
    if (this.sheepEntities.filter(e => e.alive).length < 3) {
      setTimeout(() => { if (!this.disposed) this._spawnSheep(); }, 5000);
    }
  }

  _catchSheep(sheepEnt, reason) {
    sheepEnt.alive = false;
    this.scene.remove(sheepEnt.group);
  }

  _fireSheepAttack(ent, attackType) {
    const now = performance.now();
    const cooldown = this.sheepAttackCooldowns.get(ent) || 0;
    if (now < cooldown) return;
    this.sheepAttackCooldowns.set(ent, now + attackType.cooldown);
    const pos = ent.group.position;
    const playerPos = this.player.pos;
    const dist = pos.distanceTo(playerPos);
    if (dist > attackType.range) return;
    if (attackType.damage) {
      this.player.health = Math.max(0, this.player.health - attackType.damage);
      if (this.player.health <= 0) {
        this.cb.onGameOver && this.cb.onGameOver({ win: false });
      }
    }
  }

  _fireProjectile(from, to, color, damage, target) {
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(color) });
    const projectile = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), mat);
    projectile.position.copy(from);
    this.scene.add(projectile);
    const dir = to.sub(from).normalize();
    const speed = 15;
    const maxTime = 2;
    const start = performance.now();
    const animate = () => {
      if (this.disposed) { this.scene.remove(projectile); mat.dispose(); projectile.geometry.dispose(); return; }
      const t = (performance.now() - start) / 1000;
      if (t > maxTime) { this.scene.remove(projectile); mat.dispose(); projectile.geometry.dispose(); return; }
      projectile.position.add(dir.clone().multiplyScalar(speed * 0.016));
      if (target.type === "robber" && target.ref && !target.ref.trapped) {
        if (projectile.position.distanceTo(target.ref.group.position) < 1) {
          target.ref.trapped = true;
          target.ref.trapTimer = 5;
          target.ref.cageGroup = this._buildCage(target.ref);
          this.scene.remove(projectile);
          mat.dispose();
          projectile.geometry.dispose();
          return;
        }
      }
      requestAnimationFrame(animate);
    };
    animate();
  }

  _poof(position, color) {
    const group = new THREE.Group();
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1 });
    for (let i = 0; i < 5; i++) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.12), mat);
      m.position.copy(position);
      group.add(m);
    }
    this.scene.add(group);
    setTimeout(() => { this.scene.remove(group); }, 500);
  }

  // --- Player movement ---
  _movePlayer(dt) {
    const p = this.player;
    const move = (this.keys.has("KeyA") ? -1 : 0) + (this.keys.has("KeyD") ? 1 : 0);
    p.vel.x = move * MOVE_SPEED;
    if (this.keys.has("Space") && p.onGround) { p.vel.y = JUMP_VELOCITY; p.onGround = false; }
    p.vel.y += GRAVITY * dt;
    p.pos.x += p.vel.x * dt;
    p.pos.y += p.vel.y * dt;
    p.pos.z += 0; // 1D movement for simplicity

    // Ground collision
    const groundY = this._topY(Math.floor(p.pos.x), 0);
    if (p.pos.y <= groundY) { p.pos.y = groundY; p.vel.y = 0; p.onGround = true; }
  }

  _updateCameraPos() {
    this.camera.position.copy(this.player.pos);
    this.camera.position.y += 1.5;
  }

  _updateSheep(dt) {
    for (const ent of this.sheepEntities) {
      if (!ent.alive) continue;
      ent.wanderTimer -= dt;
      ent.bounceT += dt * 3;
      if (ent.wanderTimer <= 0) {
        ent.wanderTimer = 2 + Math.random() * 4;
        const angle = Math.random() * Math.PI * 2;
        ent.vel.set(Math.cos(angle) * 0.5, 0, Math.sin(angle) * 0.5);
      }
      const next = ent.group.position.clone();
      next.x += ent.vel.x * dt;
      next.z += ent.vel.z * dt;
      const top = this._topY(Math.floor(next.x), Math.floor(next.z));
      if (top > 0 && top < 15 && Math.abs(next.x) < 50 && Math.abs(next.z) < 50) {
        ent.group.position.x = next.x;
        ent.group.position.z = next.z;
        ent.group.position.y = top;
      } else {
        ent.vel.multiplyScalar(-1);
      }
      ent.group.position.y += Math.sin(ent.bounceT) * 0.03;
      if (ent.vel.lengthSq() > 0.01) {
        ent.group.rotation.y = Math.atan2(ent.vel.x, ent.vel.z) - Math.PI / 2;
      }
      if (ent.hasAttack && ent.type.specialAttack) {
        this._fireSheepAttack(ent, ent.type.specialAttack);
      }
    }
  }

  _updateMobs(dt) {
    for (const ent of this.mobEntities) {
      if (!ent.alive) continue;
      ent.wanderTimer -= dt;
      ent.bounceT += dt * 3;
      if (ent.wanderTimer <= 0) {
        ent.wanderTimer = 2 + Math.random() * 4;
        const angle = Math.random() * Math.PI * 2;
        const sp = ent.speed * (0.3 + Math.random() * 0.4);
        ent.vel.set(Math.cos(angle) * sp, 0, Math.sin(angle) * sp);
      }
      const next = ent.group.position.clone();
      next.x += ent.vel.x * dt;
      next.z += ent.vel.z * dt;
      const top = this._topY(Math.floor(next.x), Math.floor(next.z));
      if (top > 0 && top < 15 && Math.abs(next.x) < 50 && Math.abs(next.z) < 50) {
        ent.group.position.x = next.x;
        ent.group.position.z = next.z;
        ent.group.position.y = top;
      } else {
        ent.vel.multiplyScalar(-1);
      }
      ent.group.position.y += Math.sin(ent.bounceT) * 0.02;
      if (ent.vel.lengthSq() > 0.01) {
        ent.group.rotation.y = Math.atan2(ent.vel.x, ent.vel.z) - Math.PI / 2;
      }
    }
  }

  _updateVillagers(dt) {
    for (const ent of this.villagerEntities) {
      ent.wanderTimer -= dt;
      ent.bounceT += dt * 2;
      if (ent.wanderTimer <= 0) {
        ent.wanderTimer = 3 + Math.random() * 5;
        const angle = Math.random() * Math.PI * 2;
        const sp = 0.2 + Math.random() * 0.3;
        ent.vel.set(Math.cos(angle) * sp, 0, Math.sin(angle) * sp);
      }
      const next = ent.group.position.clone();
      next.x += ent.vel.x * dt;
      next.z += ent.vel.z * dt;
      const top = this._topY(Math.floor(next.x), Math.floor(next.z));
      if (top > 0 && top < 15) {
        ent.group.position.x = next.x;
        ent.group.position.z = next.z;
        ent.group.position.y = top;
      } else {
        ent.vel.multiplyScalar(-1);
      }
      ent.group.position.y += Math.sin(ent.bounceT) * 0.015;
      if (ent.vel.lengthSq() > 0.01) {
        ent.group.rotation.y = Math.atan2(ent.vel.x, ent.vel.z) - Math.PI / 2;
      }
    }
  }

  _updateRobber(dt) {
    const r = this.robber;
    if (!r) return;
    if (r.trapped) {
      r.trapTimer -= dt;
      if (r.trapTimer <= 0) {
        if (r.cageGroup) { this.scene.remove(r.cageGroup); r.cageGroup = null; }
        this.scene.remove(r.group);
        this._spawnRobber();
      }
      return;
    }
    if (!this.isNight) {
      r.snatchTimer -= dt;
      if (r.snatchTimer <= 0) {
        r.snatchTimer = 2 + Math.random() * 3;
        const angle = Math.random() * Math.PI * 2;
        r.group.position.x += Math.cos(angle) * 2;
        r.group.position.z += Math.sin(angle) * 2;
        const top = this._topY(Math.floor(r.group.position.x), Math.floor(r.group.position.z));
        if (top >= 0) r.group.position.y = top;
      }
      return;
    }
    r.snatchTimer -= dt;
    if (!r.target || !r.target.alive) {
      const alive = this.sheepEntities.filter(e => e.alive);
      if (alive.length === 0) return;
      r.target = alive[Math.floor(Math.random() * alive.length)];
    }
    const tgt = r.target.group.position.clone();
    const dir = tgt.sub(r.group.position);
    dir.y = 0;
    const dist = dir.length();
    if (dist > 0.01) { dir.normalize().multiplyScalar(2.5 * dt); r.group.position.add(dir); }
    const top = this._topY(Math.floor(r.group.position.x), Math.floor(r.group.position.z));
    if (top >= 0) r.group.position.y = top;
    r.group.rotation.y = Math.atan2(tgt.x - r.group.position.x, tgt.z - r.group.position.z);
    if (dist < 0.9 && r.snatchTimer <= 0) {
      this._catchSheep(r.target, "robber");
      r.target = null;
      r.snatchTimer = 5 + Math.random() * 4;
    }
  }

  _updateHighlight() {
    const hit = this._castRay();
    if (!hit) { this.highlight.visible = false; return; }
    const d = hit.object.userData;
    if (d?.kind === "block") {
      this.highlight.visible = true;
      this.highlight.position.set(d.x + 0.5, d.y + 0.5, d.z + 0.5);
    } else {
      this.highlight.visible = false;
    }
  }

  // --- Loop (PERFORMANCE: cap dt, throttle highlight) ---
  _loop() {
    if (this.disposed) return;
    const now = performance.now();
    const dt = Math.min((now - this._last) / 1000, 0.05);
    this._last = now;

    const t0 = performance.now();
    this._updateDayNight(dt);
    const t1 = performance.now();
    this._movePlayer(dt);
    const t2 = performance.now();
    this._updateSheep(dt);
    const t3 = performance.now();
    this._updateMobs(dt);
    const t4 = performance.now();
    this._updateVillagers(dt);
    const t5 = performance.now();
    this._updateRobber(dt);
    const t6 = performance.now();
    this._updateCameraPos();
    const t7 = performance.now();

    this._frameCount++;
    if (this._frameCount % 4 === 0) this._updateHighlight(); // every 4th frame
    const t8 = performance.now();

    this.renderer.render(this.scene, this.camera);
    const t9 = performance.now();

    // Log profiling every 60 frames
    if (this._frameCount % 60 === 0) {
      const msg = `Frame: day=${(t1-t0).toFixed(1)} move=${(t2-t1).toFixed(1)} sheep=${(t3-t2).toFixed(1)} mobs=${(t4-t3).toFixed(1)} villagers=${(t5-t4).toFixed(1)} robber=${(t6-t5).toFixed(1)} cam=${(t7-t6).toFixed(1)} highlight=${(t8-t7).toFixed(1)} render=${(t9-t8).toFixed(1)} total=${(t9-t0).toFixed(1)}ms`;
      console.log(msg);
      window._lastProfile = msg;
    }

    if (!this._lastSave) this._lastSave = now;
    if (now - this._lastSave > 8000) {
      this._lastSave = now;
      this.cb.onAutosaveTick && this.cb.onAutosaveTick({ blocksPlaced: this.blocksPlaced, blocksBroken: this.blocksBroken });
    }

    this._raf = requestAnimationFrame(this._loop);
  }

  setSelected(i) { this.selected = i; }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this._raf);
    window.removeEventListener("resize", this._onResize);
    window.removeEventListener("keydown", this._onKey);
    window.removeEventListener("keyup", this._onKey);
    document.removeEventListener("mousemove", this._onMouseMove);
    document.removeEventListener("pointerlockchange", this._onPointerLockChange);
    if (this.renderer) {
      this.renderer.domElement.removeEventListener("click", this._onClick);
      this.renderer.domElement.removeEventListener("mousedown", this._onMouseDown);
      this.renderer.domElement.removeEventListener("wheel", this._onWheel);
      this.renderer.dispose();
      if (this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }
    if (document.pointerLockElement) document.exitPointerLock();
  }

  _bindEvents() {
    this._onResize = () => this._resize();
    this._onKey = (e) => {
      if (e.type === "keydown") this.keys.add(e.code);
      else this.keys.delete(e.code);
    };
    this._onMouseMove = (e) => {
      if (!this.pointerLocked) return;
      this.yaw -= e.movementX * 0.002;
      this.pitch = Math.max(-Math.PI/2 + 0.1, Math.min(Math.PI/2 - 0.1, this.pitch - e.movementY * 0.002));
    };
    this._onPointerLockChange = () => { this.pointerLocked = document.pointerLockElement === this.renderer.domElement; };
    this._onClick = () => { if (!this.pointerLocked) this.renderer.domElement.requestPointerLock(); };
    this._onMouseDown = (e) => { if (e.button === 2) this._removeBlockAtCursor(); };
    this._onWheel = (e) => { this.selected = (this.selected + (e.deltaY > 0 ? 1 : -1) + this.hotbar.length) % this.hotbar.length; };

    window.addEventListener("resize", this._onResize);
    window.addEventListener("keydown", this._onKey);
    window.addEventListener("keyup", this._onKey);
    document.addEventListener("mousemove", this._onMouseMove);
    document.addEventListener("pointerlockchange", this._onPointerLockChange);
    this.renderer.domElement.addEventListener("click", this._onClick);
    this.renderer.domElement.addEventListener("mousedown", this._onMouseDown);
    this.renderer.domElement.addEventListener("wheel", this._onWheel);
  }

  _resize() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  _removeBlockAtCursor() {
    const hit = this._castRay();
    if (!hit) return;
    const d = hit.object.userData;
    if (d?.kind === "block") this._removeBlock(d.x, d.y, d.z);
  }
}
