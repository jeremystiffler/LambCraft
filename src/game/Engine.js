// Lambcraft 3D voxel game engine (Three.js)
// Single-class engine that owns the scene, world, sheep, robber, and player.
import * as THREE from "three";
import { BLOCK_TYPES, HOTBAR_DEFAULT } from "../data/blocks";
import { SHEEP_TYPES, SHEEP_BY_ID, pickRandomSheepType } from "../data/sheep";

const GRAVITY = -28;
const JUMP_VELOCITY = 9.5;
const MOVE_SPEED = 5.5;
const PLAYER_HEIGHT = 1.7;
const PLAYER_RADIUS = 0.3;
const REACH = 5.5;

const key = (x, y, z) => `${x},${y},${z}`;

export class LambcraftGame {
  constructor(container, callbacks = {}) {
    this.container = container;
    this.cb = callbacks; // onState, onCatch, onRobber, onSelectChange, onSave
    this.disposed = false;

    // --- Scene ---
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xbae6fd); // sky blue
    this.scene.fog = new THREE.Fog(0xbae6fd, 30, 80);

    // --- Camera ---
    this.camera = new THREE.PerspectiveCamera(72, 1, 0.1, 200);
    this.camera.position.set(0, 6, 0);
    this.yaw = 0;
    this.pitch = 0;

    // --- Renderer ---
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);
    this.renderer.domElement.style.cursor = "crosshair";
    this.renderer.domElement.setAttribute("data-testid", "game-canvas");

    // --- Lights ---
    const ambient = new THREE.AmbientLight(0xffffff, 0.85);
    const sun = new THREE.DirectionalLight(0xffffff, 0.7);
    sun.position.set(20, 30, 10);
    this.scene.add(ambient, sun);

    // --- World ---
    this.world = new Map(); // "x,y,z" -> blockId
    this.blockMeshes = new Map();
    this.sheepEntities = []; // { group, type, vel, target, alive }
    this.maxSheep = 12;
    this.blocksPlaced = 0;
    this.blocksBroken = 0;

    // --- Player ---
    this.player = {
      pos: new THREE.Vector3(0, 0, 0),
      vel: new THREE.Vector3(),
      onGround: false,
    };
    this.keys = new Set();
    this.pointerLocked = false;

    // --- Hotbar ---
    this.hotbar = HOTBAR_DEFAULT;
    this.selected = 0;

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

    this._buildWorld();
    this._initSheep();
    this._spawnRobber();
    this._spawnPlayerSafe();
    this._bindEvents();
    this._resize();
    this._last = performance.now();
    this._loop = this._loop.bind(this);
    this._raf = requestAnimationFrame(this._loop);
    this._lastSave = 0;
  }

  // ---------- World building ----------
  _buildWorld() {
    const SIZE = 16;
    for (let x = -SIZE; x <= SIZE; x++) {
      for (let z = -SIZE; z <= SIZE; z++) {
        const h = Math.max(
          1,
          Math.floor(3 + Math.sin(x * 0.45) * 1.4 + Math.cos(z * 0.42) * 1.4)
        );
        for (let y = 0; y < h; y++) {
          let b = "dirt";
          if (y === h - 1) b = "grass";
          else if (y < 1) b = "stone";
          this._setBlock(x, y, z, b, false);
        }
        const r = Math.random();
        const nearSpawn = Math.abs(x) <= 2 && Math.abs(z) <= 2;
        if (!nearSpawn) {
          if (r < 0.025) this._placeTree(x, h, z);
          else if (r < 0.05) this._setBlock(x, h, z, "flower", false);
        }
      }
    }
    // Sand patches
    for (let i = 0; i < 12; i++) {
      const cx = Math.floor(Math.random() * (SIZE * 2)) - SIZE;
      const cz = Math.floor(Math.random() * (SIZE * 2)) - SIZE;
      for (let dx = -1; dx <= 1; dx++) {
        for (let dz = -1; dz <= 1; dz++) {
          const x = cx + dx, z = cz + dz;
          const top = this._topY(x, z);
          if (top >= 0) this._setBlock(x, top, z, "sand", false);
        }
      }
    }
  }

  _placeTree(x, baseY, z) {
    for (let i = 0; i < 3; i++) this._setBlock(x, baseY + i, z, "wood", false);
    for (let dx = -1; dx <= 1; dx++)
      for (let dz = -1; dz <= 1; dz++)
        for (let dy = 2; dy <= 3; dy++) {
          if (dx === 0 && dz === 0 && dy === 2) continue;
          if (Math.abs(dx) + Math.abs(dz) === 2 && Math.random() < 0.4) continue;
          this._setBlock(x + dx, baseY + dy, z + dz, "leaves", false);
        }
    this._setBlock(x, baseY + 4, z, "leaves", false);
  }

  _topY(x, z) {
    for (let y = 20; y >= 0; y--) if (this.world.has(key(x, y, z))) return y + 1;
    return -1;
  }

  _setBlock(x, y, z, blockId, placedByPlayer = true) {
    const k = key(x, y, z);
    const existing = this.blockMeshes.get(k);
    if (existing) {
      this.scene.remove(existing);
      if (Array.isArray(existing.geometry)) existing.geometry.forEach(g => g.dispose());
      else existing.geometry.dispose();
      if (Array.isArray(existing.material)) existing.material.forEach(m => m.dispose());
      else existing.material.dispose();
      this.blockMeshes.delete(k);
      this.world.delete(k);
    }
    if (!blockId) return;
    const block = BLOCK_TYPES[blockId];
    if (!block) return;

    // Fence: special mesh (post + two horizontal rails)
    if (blockId === "fence") {
      const group = new THREE.Group();
      const woodMat = new THREE.MeshLambertMaterial({ color: block.color });
      const postGeo = new THREE.BoxGeometry(0.15, 1.5, 0.15);
      const post = new THREE.Mesh(postGeo, woodMat);
      post.position.y = 0.75;
      group.add(post);
      // two rails
      const railGeo = new THREE.BoxGeometry(0.1, 0.12, 1.0);
      const rail1 = new THREE.Mesh(railGeo, woodMat);
      rail1.position.set(0, 0.45, 0);
      const rail2 = new THREE.Mesh(railGeo, woodMat);
      rail2.position.set(0, 1.05, 0);
      group.add(rail1, rail2);
      group.position.set(x + 0.5, y, z + 0.5);
      group.userData = { kind: "block", blockId, x, y, z, isFence: true };
      this.world.set(k, blockId);
      this.blockMeshes.set(k, group);
      this.scene.add(group);
      if (placedByPlayer) this.blocksPlaced++;
      return;
    }

    const geo = new THREE.BoxGeometry(1, 1, 1);
    const mat = new THREE.MeshLambertMaterial({ color: block.color });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x + 0.5, y + 0.5, z + 0.5);
    mesh.userData = { kind: "block", blockId, x, y, z };
    this.world.set(k, blockId);
    this.blockMeshes.set(k, mesh);
    this.scene.add(mesh);
    if (placedByPlayer) this.blocksPlaced++;
  }

  _removeBlock(x, y, z) {
    const k = key(x, y, z);
    if (!this.world.has(k)) return;
    const mesh = this.blockMeshes.get(k);
    if (mesh) {
      this.scene.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.dispose();
    }
    this.blockMeshes.delete(k);
    this.world.delete(k);
    this.blocksBroken++;
  }

  hasBlock(x, y, z) {
    return this.world.has(key(x, y, z));
  }

  // ---------- Sheep ----------
  _makeSheepMesh(type) {
    const group = new THREE.Group();
    const woolMat = new THREE.MeshLambertMaterial({ color: type.wool });
    const accentMat = new THREE.MeshLambertMaterial({ color: type.accent });
    const black = new THREE.MeshLambertMaterial({ color: 0x1f2937 });

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
    const legMat = accentMat;
    const positions = [
      [0.3, 0.15, 0.18], [0.3, 0.15, -0.18], [-0.3, 0.15, 0.18], [-0.3, 0.15, -0.18],
    ];
    positions.forEach(([px, py, pz]) => {
      const l = new THREE.Mesh(legGeo, legMat);
      l.position.set(px, py, pz);
      group.add(l);
    });
    group.add(body, head, eyeL, eyeR);
    // Tiny tail puff
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), woolMat);
    tail.position.set(-0.55, 0.55, 0);
    group.add(tail);

    group.userData = { kind: "sheep", typeId: type.id };
    return group;
  }

  _spawnSheep() {
    const type = pickRandomSheepType();
    const group = this._makeSheepMesh(type);
    let tries = 0, x, z, y;
    do {
      x = Math.floor(Math.random() * 28) - 14;
      z = Math.floor(Math.random() * 28) - 14;
      y = this._topY(x, z);
      tries++;
    } while ((y < 0 || y > 8) && tries < 20);
    if (y < 0) y = 4;
    group.position.set(x + 0.5, y, z + 0.5);
    this.scene.add(group);
    const ent = {
      group,
      type,
      vel: new THREE.Vector3(),
      target: null,
      alive: true,
      wanderTimer: 0,
      bounceT: Math.random() * Math.PI * 2,
    };
    this.sheepEntities.push(ent);
    return ent;
  }

  _initSheep() {
    for (let i = 0; i < this.maxSheep; i++) this._spawnSheep();
  }

  // ---------- Robber ----------
  _spawnRobber() {
    const g = new THREE.Group();
    const skin = new THREE.MeshLambertMaterial({ color: 0xD9B382 });
    const shirt = new THREE.MeshLambertMaterial({ color: 0x6D28D9 });
    const pants = new THREE.MeshLambertMaterial({ color: 0x1f2937 });
    const mask = new THREE.MeshLambertMaterial({ color: 0x1f2937 });
    const eye = new THREE.MeshLambertMaterial({ color: 0xffffff });

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), skin);
    head.position.y = 1.4;
    const maskBand = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.16, 0.52), mask);
    maskBand.position.y = 1.45;
    const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.05), eye);
    eyeL.position.set(0.13, 1.45, 0.27);
    const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.05), eye);
    eyeR.position.set(-0.13, 1.45, 0.27);
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.7, 0.4), shirt);
    body.position.y = 0.85;
    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.6, 0.3), pants);
    legL.position.set(0.15, 0.3, 0);
    const legR = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.6, 0.3), pants);
    legR.position.set(-0.15, 0.3, 0);
    g.add(head, maskBand, eyeL, eyeR, body, legL, legR);
    g.userData = { kind: "robber" };

    let x = 10, z = 10;
    const y = this._topY(x, z);
    g.position.set(x + 0.5, y, z + 0.5);
    this.scene.add(g);
    this.robber = {
      group: g,
      target: null,
      snatchTimer: 0,
      trapped: false,
      trapTimer: 0,
      cageGroup: null,
      lootDropped: false,
    };
  }

  // Build a cage around the trapped robber
  _buildCage(robber) {
    const cg = new THREE.Group();
    const barMat = new THREE.MeshLambertMaterial({ color: 0x6B7280 });
    const base = robber.group.position.clone();
    // 5x5 fence posts around robber
    for (let dx = -1; dx <= 1; dx++) {
      for (let dz = -1; dz <= 1; dz++) {
        if (Math.abs(dx) + Math.abs(dz) !== 1) continue; // only cardinal neighbors
        const postGeo = new THREE.BoxGeometry(0.1, 2, 0.1);
        const post = new THREE.Mesh(postGeo, barMat);
        post.position.set(base.x + dx, base.y + 1, base.z + dz);
        cg.add(post);
      }
    }
    // top bars
    const topBarGeoH = new THREE.BoxGeometry(2.2, 0.08, 0.08);
    const topBarGeoV = new THREE.BoxGeometry(0.08, 0.08, 2.2);
    const tb1 = new THREE.Mesh(topBarGeoH, barMat);
    tb1.position.set(base.x, base.y + 2, base.z - 1);
    const tb2 = new THREE.Mesh(topBarGeoH, barMat);
    tb2.position.set(base.x, base.y + 2, base.z + 1);
    const tb3 = new THREE.Mesh(topBarGeoV, barMat);
    tb3.position.set(base.x - 1, base.y + 2, base.z);
    const tb4 = new THREE.Mesh(topBarGeoV, barMat);
    tb4.position.set(base.x + 1, base.y + 2, base.z);
    cg.add(tb1, tb2, tb3, tb4);
    // floor bars
    const fb1 = new THREE.Mesh(topBarGeoH, barMat);
    fb1.position.set(base.x, base.y + 0.05, base.z - 1);
    const fb2 = new THREE.Mesh(topBarGeoH, barMat);
    fb2.position.set(base.x, base.y + 0.05, base.z + 1);
    const fb3 = new THREE.Mesh(topBarGeoV, barMat);
    fb3.position.set(base.x - 1, base.y + 0.05, base.z);
    const fb4 = new THREE.Mesh(topBarGeoV, barMat);
    fb4.position.set(base.x + 1, base.y + 0.05, base.z);
    cg.add(fb1, fb2, fb3, fb4);

    this.scene.add(cg);
    return cg;
  }

  // ---------- Player ----------
  _spawnPlayerSafe() {
    // Search nearest column without anything above ground level (no trees in face).
    let best = { x: 0, z: 0, y: this._topY(0, 0) };
    for (let r = 0; r < 8 && best.y < 0; r++) {
      for (let dx = -r; dx <= r && best.y < 0; dx++) {
        for (let dz = -r; dz <= r && best.y < 0; dz++) {
          const y = this._topY(dx, dz);
          if (y >= 0) best = { x: dx, z: dz, y };
        }
      }
    }
    // Also avoid columns with a tree directly above (check 4 blocks up).
    let chosen = best;
    outer: for (let dx = -4; dx <= 4; dx++) {
      for (let dz = -4; dz <= 4; dz++) {
        const y = this._topY(dx, dz);
        if (y < 0) continue;
        let clear = true;
        for (let dy = 0; dy < 3; dy++) {
          if (this.hasBlock(dx, y + dy, dz)) { clear = false; break; }
        }
        if (clear) { chosen = { x: dx, z: dz, y }; break outer; }
      }
    }
    this.player.pos.set(chosen.x + 0.5, chosen.y + 0.1, chosen.z + 0.5);
    this._updateCameraPos();
  }

  _updateCameraPos() {
    this.camera.position.set(
      this.player.pos.x,
      this.player.pos.y + PLAYER_HEIGHT,
      this.player.pos.z
    );
    this.camera.rotation.order = "YXZ";
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;
  }

  // ---------- Events ----------
  _bindEvents() {
    this._onResize = () => this._resize();
    window.addEventListener("resize", this._onResize);

    this._onKey = (e) => {
      if (e.repeat) return;
      const k = e.code;
      if (e.type === "keydown") this.keys.add(k);
      else this.keys.delete(k);
      if (e.type === "keydown") {
        if (k.startsWith("Digit")) {
          const idx = parseInt(k.slice(5), 10) - 1;
          if (idx >= 0 && idx < this.hotbar.length) {
            this.selected = idx;
            this.cb.onSelectChange && this.cb.onSelectChange(this.selected);
          }
        }
      }
    };
    window.addEventListener("keydown", this._onKey);
    window.addEventListener("keyup", this._onKey);

    this._onMouseMove = (e) => {
      if (!this.pointerLocked) return;
      this.yaw -= e.movementX * 0.0025;
      this.pitch -= e.movementY * 0.0025;
      this.pitch = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, this.pitch));
    };
    document.addEventListener("mousemove", this._onMouseMove);

    this._onClick = () => {
      if (!this.pointerLocked) {
        this.renderer.domElement.requestPointerLock();
      }
    };
    this.renderer.domElement.addEventListener("click", this._onClick);

    this._onPointerLockChange = () => {
      this.pointerLocked = document.pointerLockElement === this.renderer.domElement;
    };
    document.addEventListener("pointerlockchange", this._onPointerLockChange);

    this._onMouseDown = (e) => {
      if (!this.pointerLocked) return;
      if (e.button === 0) this._primaryAction();
      else if (e.button === 2) this._placeBlock();
    };
    this.renderer.domElement.addEventListener("mousedown", this._onMouseDown);
    this.renderer.domElement.addEventListener("contextmenu", (e) => e.preventDefault());

    this._onWheel = (e) => {
      if (!this.pointerLocked) return;
      const dir = e.deltaY > 0 ? 1 : -1;
      this.selected = (this.selected + dir + this.hotbar.length) % this.hotbar.length;
      this.cb.onSelectChange && this.cb.onSelectChange(this.selected);
    };
    this.renderer.domElement.addEventListener("wheel", this._onWheel, { passive: true });
  }

  _resize() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  // ---------- Actions ----------
  _castRay() {
    this.raycaster.setFromCamera({ x: 0, y: 0 }, this.camera);
    const targets = [];
    this.sheepEntities.forEach((e) => e.alive && targets.push(e.group));
    this.blockMeshes.forEach((m) => targets.push(m));
    if (this.robber && !this.robber.trapped) targets.push(this.robber.group);
    const hits = this.raycaster.intersectObjects(targets, true);
    return hits[0] || null;
  }

  _primaryAction() {
    const hit = this._castRay();
    if (!hit) return;
    const obj = hit.object;
    let root = obj;
    while (root.parent && !root.userData?.kind) root = root.parent;
    const data = root.userData || obj.userData;
    if (data?.kind === "sheep") {
      const ent = this.sheepEntities.find((e) => e.group === root);
      if (ent && ent.alive) this._catchSheep(ent, "player");
      return;
    }
    if (data?.kind === "robber") {
      this._catchRobber();
      return;
    }
    if (data?.kind === "block") {
      this._removeBlock(data.x, data.y, data.z);
    }
  }

  _catchRobber() {
    const r = this.robber;
    if (!r || r.trapped) return;
    r.trapped = true;
    r.trapTimer = 8; // seconds trapped
    r.lootDropped = false;
    // Build cage around robber
    r.cageGroup = this._buildCage(r);
    // Poof effect
    this._poof(r.group.position, 0x6D28D9);
    this.cb.onCatch && this.cb.onCatch({ id: "robber", name: "The Robber", meat: "Robber Loot" });
  }

  _placeBlock() {
    const slot = this.hotbar[this.selected];
    if (!slot || slot.type !== "block") return;
    const hit = this._castRay();
    if (!hit) return;
    const data = hit.object.userData;
    if (data?.kind !== "block") return;
    const n = hit.face?.normal;
    if (!n) return;
    const nx = data.x + Math.round(n.x);
    const ny = data.y + Math.round(n.y);
    const nz = data.z + Math.round(n.z);
    // Don't place inside player
    const px = Math.floor(this.player.pos.x);
    const py = Math.floor(this.player.pos.y);
    const pz = Math.floor(this.player.pos.z);
    if ((nx === px && nz === pz) && (ny === py || ny === py + 1)) return;
    this._setBlock(nx, ny, nz, slot.id, true);
  }

  _catchSheep(ent, by = "player") {
    if (!ent.alive) return;
    ent.alive = false;
    // Particle puff
    this._poof(ent.group.position, ent.type.wool);
    this.scene.remove(ent.group);
    if (by === "player") {
      this.cb.onCatch && this.cb.onCatch(ent.type);
    } else {
      this.cb.onRobber && this.cb.onRobber(ent.type);
    }
    // Respawn after a short delay
    setTimeout(() => {
      if (this.disposed) return;
      this._spawnSheep();
    }, 1500);
  }

  _poof(position, color) {
    const group = new THREE.Group();
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1 });
    const parts = [];
    for (let i = 0; i < 10; i++) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.12), mat);
      m.position.copy(position);
      m.position.y += 0.5;
      const v = new THREE.Vector3(
        (Math.random() - 0.5) * 4,
        Math.random() * 3 + 1,
        (Math.random() - 0.5) * 4
      );
      group.add(m);
      parts.push({ m, v });
    }
    this.scene.add(group);
    const start = performance.now();
    const animate = () => {
      const t = (performance.now() - start) / 1000;
      if (t > 0.7 || this.disposed) {
        this.scene.remove(group);
        parts.forEach((p) => p.m.geometry.dispose());
        mat.dispose();
        return;
      }
      parts.forEach((p) => {
        p.m.position.x += p.v.x * 0.016;
        p.m.position.y += p.v.y * 0.016;
        p.m.position.z += p.v.z * 0.016;
        p.v.y -= 0.3;
        p.m.material.opacity = 1 - t / 0.7;
      });
      requestAnimationFrame(animate);
    };
    animate();
  }

  // ---------- Physics / collision ----------
  // isFence: blocks sheep/robber but NOT player (player can jump over)
  _isFence(x, y, z) {
    const id = this.world.get(key(x, y, z));
    return id === "fence";
  }

  _collidesAt(pos, entity = "player") {
    const r = PLAYER_RADIUS;
    const minX = Math.floor(pos.x - r);
    const maxX = Math.floor(pos.x + r);
    const minZ = Math.floor(pos.z - r);
    const maxZ = Math.floor(pos.z + r);
    const minY = Math.floor(pos.y);
    const maxY = Math.floor(pos.y + PLAYER_HEIGHT - 0.01);
    for (let x = minX; x <= maxX; x++)
      for (let y = minY; y <= maxY; y++)
        for (let z = minZ; z <= maxZ; z++) {
          const id = this.world.get(key(x, y, z));
          if (!id) continue;
          if (id === "flower") continue;
          // Fences block sheep/robber but not player
          if (id === "fence" && entity === "player") continue;
          return true;
        }
    return false;
  }

  // Sheep-specific collision (fences block them)
  _sheepCollidesAt(x, y, z) {
    // Check if any block at sheep body level is solid (including fences)
    for (let dy = 0; dy <= 1; dy++) {
      const id = this.world.get(key(Math.floor(x), Math.floor(y) + dy, Math.floor(z)));
      if (id && id !== "flower") return true;
    }
    return false;
  }

  _movePlayer(dt) {
    const p = this.player;
    // input
    const forward = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
    const move = new THREE.Vector3();
    if (this.keys.has("KeyW") || this.keys.has("ArrowUp")) move.add(forward);
    if (this.keys.has("KeyS") || this.keys.has("ArrowDown")) move.sub(forward);
    if (this.keys.has("KeyD") || this.keys.has("ArrowRight")) move.add(right);
    if (this.keys.has("KeyA") || this.keys.has("ArrowLeft")) move.sub(right);
    if (move.lengthSq() > 0) move.normalize().multiplyScalar(MOVE_SPEED);
    p.vel.x = move.x;
    p.vel.z = move.z;
    if ((this.keys.has("Space")) && p.onGround) {
      p.vel.y = JUMP_VELOCITY;
      p.onGround = false;
    }
    p.vel.y += GRAVITY * dt;

    // X axis
    const next = p.pos.clone();
    next.x += p.vel.x * dt;
    if (!this._collidesAt(next)) p.pos.x = next.x;
    else p.vel.x = 0;
    // Z axis
    next.copy(p.pos);
    next.z += p.vel.z * dt;
    if (!this._collidesAt(next)) p.pos.z = next.z;
    else p.vel.z = 0;
    // Y axis
    next.copy(p.pos);
    next.y += p.vel.y * dt;
    if (!this._collidesAt(next)) {
      p.pos.y = next.y;
      p.onGround = false;
    } else {
      if (p.vel.y < 0) p.onGround = true;
      p.vel.y = 0;
    }
    // World bottom
    if (p.pos.y < -10) {
      this._spawnPlayerSafe();
      p.vel.set(0, 0, 0);
    }
  }

  // ---------- Sheep AI ----------
  _updateSheep(dt) {
    for (const ent of this.sheepEntities) {
      if (!ent.alive) continue;
      ent.wanderTimer -= dt;
      ent.bounceT += dt * 4;
      if (ent.wanderTimer <= 0) {
        ent.wanderTimer = 1 + Math.random() * 3;
        const angle = Math.random() * Math.PI * 2;
        const sp = 0.4 + Math.random() * 0.6;
        ent.vel.set(Math.cos(angle) * sp, 0, Math.sin(angle) * sp);
      }
      const next = ent.group.position.clone();
      next.x += ent.vel.x * dt;
      next.z += ent.vel.z * dt;

      // Check fence collision ahead — if blocked, reverse direction
      const lookAhead = 0.6;
      const checkX = ent.group.position.x + (ent.vel.x > 0 ? lookAhead : ent.vel.x < 0 ? -lookAhead : 0);
      const checkZ = ent.group.position.z + (ent.vel.z > 0 ? lookAhead : ent.vel.z < 0 ? -lookAhead : 0);
      const groundY = this._topY(Math.floor(checkX), Math.floor(checkZ));
      if (this._sheepCollidesAt(checkX, groundY, checkZ)) {
        // Fence ahead — turn around
        ent.vel.multiplyScalar(-1);
      }

      // stay inside world bounds & on ground
      const top = this._topY(Math.floor(next.x), Math.floor(next.z));
      if (top > 0 && top < 10 && Math.abs(next.x) < 16 && Math.abs(next.z) < 16) {
        // Also check if the destination itself has a fence
        if (!this._sheepCollidesAt(next.x, top, next.z)) {
          ent.group.position.x = next.x;
          ent.group.position.z = next.z;
          ent.group.position.y = top;
        } else {
          ent.vel.multiplyScalar(-1);
        }
      } else {
        ent.vel.multiplyScalar(-1);
      }
      // bounce
      ent.group.position.y += Math.sin(ent.bounceT) * 0.03;
      // face direction
      if (ent.vel.lengthSq() > 0.01) {
        ent.group.rotation.y = Math.atan2(ent.vel.x, ent.vel.z) - Math.PI / 2;
      }
    }
  }

  // ---------- Robber AI ----------
  _updateRobber(dt) {
    const r = this.robber;
    if (!r) return;

    // If trapped, count down timer then respawn
    if (r.trapped) {
      r.trapTimer -= dt;
      if (r.trapTimer <= 0) {
        // Remove cage
        if (r.cageGroup) {
          this.scene.remove(r.cageGroup);
          r.cageGroup = null;
        }
        // Respawn robber at a new location
        this.scene.remove(r.group);
        this._spawnRobber();
      }
      return;
    }

    r.snatchTimer -= dt;
    // pick target
    if (!r.target || !r.target.alive) {
      const alive = this.sheepEntities.filter((e) => e.alive);
      if (alive.length === 0) return;
      r.target = alive[Math.floor(Math.random() * alive.length)];
    }
    const tgt = r.target.group.position.clone();
    const dir = tgt.sub(r.group.position);
    dir.y = 0;
    const dist = dir.length();
    if (dist > 0.01) {
      dir.normalize().multiplyScalar(2.0 * dt);
      r.group.position.add(dir);
    }
    // snap to ground
    const top = this._topY(Math.floor(r.group.position.x), Math.floor(r.group.position.z));
    if (top >= 0) r.group.position.y = top;
    // face sheep
    const lookDir = r.target.group.position.clone().sub(r.group.position);
    r.group.rotation.y = Math.atan2(lookDir.x, lookDir.z);
    // catch
    if (dist < 0.9 && r.snatchTimer <= 0) {
      this._catchSheep(r.target, "robber");
      r.target = null;
      r.snatchTimer = 5 + Math.random() * 4; // robber rests briefly
    }
  }

  // ---------- Highlight ----------
  _updateHighlight() {
    const hit = this._castRay();
    if (!hit) {
      this.highlight.visible = false;
      return;
    }
    const d = hit.object.userData;
    if (d?.kind === "block") {
      this.highlight.visible = true;
      this.highlight.position.set(d.x + 0.5, d.y + 0.5, d.z + 0.5);
    } else {
      this.highlight.visible = false;
    }
  }

  // ---------- Loop ----------
  _loop() {
    if (this.disposed) return;
    const now = performance.now();
    const dt = Math.min((now - this._last) / 1000, 0.05);
    this._last = now;

    this._movePlayer(dt);
    this._updateSheep(dt);
    this._updateRobber(dt);
    this._updateCameraPos();
    this._updateHighlight();
    this.renderer.render(this.scene, this.camera);

    // periodic save callback
    if (now - this._lastSave > 8000) {
      this._lastSave = now;
      this.cb.onAutosaveTick && this.cb.onAutosaveTick({
        blocksPlaced: this.blocksPlaced,
        blocksBroken: this.blocksBroken,
      });
    }
    this._raf = requestAnimationFrame(this._loop);
  }

  setSelected(i) {
    this.selected = i;
  }

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
}
