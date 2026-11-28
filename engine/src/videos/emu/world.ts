// The Emu War world as one three.js scene: sky, red earth, the ranges, and five places (camp + rise, wheat farm,
// open plain, dam, truck track), plus every moving prop and the cast. update(id, f, camera) poses everything for
// shot `id` at frame f (a pure function of id + f). Structure follows the claude-animated-shorts world.ts (MIT).
import * as THREE from "three";
import { Batch, V, box, col, lam, quad } from "./geo";
import { ctex, cloudHD, rng } from "./paint";
import { LIGHTS, LOOK, LightPreset } from "./lights";
import { TONE, CHAR, untone } from "./shade";
import { NOINK } from "./ink";
import { cardShade } from "./cardshade";
import { Pool, Actor, Fx, GEO, CamInfo, hh, Req } from "./castbase";
import { emuSide, emuFront } from "./emutoon";
import { sceneAt, crowdFor, wheatAt, drawTally, Scene } from "./scenes";
import { lewisGun, truck, crateGeo, crateMat, emptyCrate, tent, farmhouse, windmill, fence, gum, bush, rock, ranges, heightfield, scoreboard, waterTex, Gun, Truck, Board, mesh, merged } from "./props";
import { FPS, SHOTS, ShotDef, Zone, camAt, riseY, RISE_Z0, FIELD, DAM, bankY } from "./story";

// ---------------- painted ground + wheat ----------------
const earthTex = () => ctex("redEarth", 1024, 1024, (g, r) => {
  const S = 1024;
  g.fillStyle = "#c97a4c"; g.fillRect(0, 0, S, S);
  const wrap = (x: number, y: number, rad: number, fn: (x: number, y: number) => void) => { for (const ox of [-S, 0, S]) for (const oy of [-S, 0, S]) if (x + ox > -rad && x + ox < S + rad && y + oy > -rad && y + oy < S + rad) fn(x + ox, y + oy); };
  for (let i = 0; i < 26; i++) {
    const x = r() * S, y = r() * S, rad = 110 + r() * 240, light = r() > 0.5;
    wrap(x, y, rad, (xx, yy) => { const gr = g.createRadialGradient(xx, yy, 0, xx, yy, rad); gr.addColorStop(0, light ? "rgba(226,150,98,0.5)" : "rgba(170,92,56,0.5)"); gr.addColorStop(1, "rgba(200,120,76,0)"); g.fillStyle = gr; g.fillRect(xx - rad, yy - rad, rad * 2, rad * 2); });
  }
  for (let i = 0; i < 260; i++) { const x = r() * S, y = r() * S, w = 3 + r() * 7; wrap(x, y, 12, (xx, yy) => { g.fillStyle = r() > 0.5 ? "rgba(150,78,48,0.55)" : "rgba(236,176,128,0.5)"; g.beginPath(); g.ellipse(xx, yy, w, w * 0.6, r() * 3, 0, 7); g.fill(); }); }
  g.lineCap = "round"; g.lineWidth = 2.5;
  for (let i = 0; i < 380; i++) { // dry grass tufts
    const x = r() * S, y = r() * S, h = 8 + r() * 12;
    wrap(x, y, 24, (xx, yy) => { g.strokeStyle = r() > 0.5 ? "rgba(226,200,120,0.75)" : "rgba(196,170,96,0.7)"; g.beginPath(); g.moveTo(xx - 4, yy - h); g.lineTo(xx, yy); g.lineTo(xx + 4, yy - h * 0.8); g.moveTo(xx, yy); g.lineTo(xx + 1, yy - h * 1.1); g.stroke(); });
  }
});
const strawTex = () => ctex("stubbleField", 1024, 1024, (g, r) => {
  g.fillStyle = "#d3ac62"; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? "rgba(190,146,80,0.5)" : "rgba(232,200,128,0.4)"; g.fillRect(0, i * 64, 1024, 30); }
  g.lineCap = "round"; g.lineWidth = 3;
  for (let i = 0; i < 900; i++) { const x = r() * 1024, y = r() * 1024; g.strokeStyle = r() > 0.5 ? "rgba(150,108,56,0.7)" : "rgba(240,214,150,0.7)"; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 8, y - 6 - r() * 10); g.stroke(); }
});
const dryGrassTex = () => ctex("dryGrass", 1024, 1024, (g, r) => {
  g.fillStyle = "#d2aa62"; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 30; i++) { const x = r() * 1024, y = r() * 1024, rad = 100 + r() * 200; const gr = g.createRadialGradient(x, y, 0, x, y, rad); gr.addColorStop(0, r() > 0.5 ? "rgba(226,190,120,0.55)" : "rgba(186,140,84,0.5)"); gr.addColorStop(1, "rgba(210,170,98,0)"); g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2); }
  g.lineCap = "round"; g.lineWidth = 3;
  for (let i = 0; i < 1200; i++) { const x = r() * 1024, y = r() * 1024, h = 8 + r() * 14; g.strokeStyle = r() > 0.5 ? "rgba(238,214,150,0.7)" : "rgba(168,128,70,0.6)"; g.beginPath(); g.moveTo(x - 4, y - h); g.lineTo(x, y); g.lineTo(x + 4, y - h * 0.8); g.stroke(); }
});
/** a clump of wheat (or its stubble) with its own ink lines, on a transparent card. Built as a DataTexture whose
 *  transparent pixels carry the straw colour, so filtering never bleeds black into the thin stalks. */
const wheatCache = new Map<boolean, THREE.DataTexture>();
const wheatTex = (stubble: boolean) => {
  const hit = wheatCache.get(stubble);
  if (hit) return hit;
  const W = 256, H = 300, cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const g = cv.getContext("2d")!, r = rng(stubble ? 17 : 29);
  g.lineCap = "round"; g.lineJoin = "round";
  const stalks = stubble ? 9 : 8, ink = stubble ? "#a8782f" : "#3d2a14";
  for (let i = 0; i < stalks; i++) {
    const x0 = 26 + (204 * (i + 0.5)) / stalks + (r() - 0.5) * 10, lean = (r() - 0.5) * 34, top = stubble ? 226 + r() * 30 : 64 + r() * 46;
    const x1 = x0 + lean;
    g.strokeStyle = ink; g.lineWidth = stubble ? 11 : 9; g.beginPath(); g.moveTo(x0, 300); g.quadraticCurveTo(x0, (300 + top) / 2, x1, top); g.stroke();
    g.strokeStyle = stubble ? "#ecc873" : "#d1a23c"; g.lineWidth = stubble ? 7 : 5; g.beginPath(); g.moveTo(x0, 300); g.quadraticCurveTo(x0, (300 + top) / 2, x1, top); g.stroke();
    if (stubble) continue;
    // the ear: a fat ink-outlined spindle with awns
    g.save(); g.translate(x1, top); g.rotate(lean * 0.012);
    g.strokeStyle = ink; g.lineWidth = 3;
    for (const s of [-1, 0, 1]) { g.beginPath(); g.moveTo(s * 5, -34); g.lineTo(s * 13, -62); g.stroke(); }
    g.fillStyle = ink; g.beginPath(); g.ellipse(0, -20, 13.5, 30, 0, 0, 7); g.fill();
    g.fillStyle = r() > 0.5 ? "#efc24a" : "#e6b33c"; g.beginPath(); g.ellipse(0, -20, 9, 25.5, 0, 0, 7); g.fill();
    g.strokeStyle = "rgba(150,100,30,0.8)"; g.lineWidth = 2;
    for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(-8, -36 + k * 10); g.lineTo(0, -31 + k * 10); g.lineTo(8, -36 + k * 10); g.stroke(); }
    g.restore();
  }
  const src = g.getImageData(0, 0, W, H).data, out = new Uint8Array(W * H * 4), bleed = stubble ? [0xd9, 0xb0, 0x5c] : [0x9a, 0x74, 0x2c];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4, o = ((H - 1 - y) * W + x) * 4, a = src[i + 3], k = a / 255;
    for (let c = 0; c < 3; c++) out[o + c] = Math.round(src[i + c] * k + bleed[c] * (1 - k));
    out[o + 3] = a;
  }
  const t = new THREE.DataTexture(out, W, H, THREE.RGBAFormat);
  t.colorSpace = THREE.SRGBColorSpace; t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter; t.anisotropy = 8; t.needsUpdate = true;
  wheatCache.set(stubble, t);
  return t;
};
const upNormals = (g: THREE.BufferGeometry) => { const n = g.attributes.normal as THREE.BufferAttribute; for (let i = 0; i < n.count; i++) n.setXYZ(i, 0, 1, 0); return g; };
/** two crossed cards, each drawn from both sides as front faces with up normals (a back face would flip its normal and go dark) */
const crossCard = (w: number, h: number) => upNormals(merged([0, 1, 2, 3].map((k) => new THREE.PlaneGeometry(w, h).translate(0, h / 2, 0).rotateY((k * Math.PI) / 2))));
const discTex = () => ctex("sunDisc", 128, 128, (g) => {
  const gr = g.createRadialGradient(64, 64, 58, 64, 64, 64); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
});
const haloTex = () => ctex("sunHalo", 256, 256, (g) => {
  const im = g.createImageData(256, 256);
  for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
    const u = Math.hypot(x - 127.5, y - 127.5) / 128;
    const a = (0.55 * Math.exp(-((u / 0.25) ** 2)) + 0.35 * Math.exp(-((u / 0.6) ** 2))) * (1 - Math.min(1, Math.max(0, (u - 0.8) / 0.2)));
    const i = (y * 256 + x) * 4; im.data[i] = im.data[i + 1] = im.data[i + 2] = 255; im.data[i + 3] = Math.round(255 * Math.min(1, a));
  }
  g.putImageData(im, 0, 0);
});

const CROWD_B = 8, CROWD_CAP = 460;

export class World {
  root = new THREE.Group();
  private pool = new Pool();
  private actors: Actor[] = [];
  private fxs: Fx[] = [];
  private zones = {} as Record<Zone, THREE.Group>;
  private hemi: THREE.HemisphereLight; private sun: THREE.DirectionalLight;
  private sky: THREE.Mesh; private skyMat: THREE.ShaderMaterial;
  private fog = new THREE.Fog("#bccbec", 25, 420);
  private sunDisc: THREE.Sprite; private sunHalo: THREE.Sprite;
  private sunCache = new Map<number, THREE.Vector3>();
  private cloudMaps: Record<"day" | "golden", THREE.Texture[]>;
  private clouds: THREE.Mesh[] = [];
  private frustum = new THREE.Frustum();
  private m4 = new THREE.Matrix4(); private v = new THREE.Vector3(); private sph = new THREE.Sphere();
  private q4 = new THREE.Quaternion(); private s3 = new THREE.Vector3(); private e3 = new THREE.Euler();
  // props
  private guns: Gun[] = []; private lowGun: Gun;
  private crates: THREE.Mesh[] = [];
  private truck: Truck;
  private board: Board;
  private tally: THREE.Group; private tallyDraw: (n: number) => void;
  private brass: THREE.InstancedMesh;
  private aftermath = new THREE.Group();
  private fan: THREE.Group;
  private wheat: THREE.InstancedMesh; private stubble: THREE.InstancedMesh; private wheatPos: Float32Array; private wheatN = 0;
  private crowd: { mesh: THREE.InstancedMesh; mat: THREE.MeshLambertMaterial; req: Req | null }[] = [];

  constructor() {
    const R = this.root;
    // ---- sky + light ----
    this.skyMat = new THREE.ShaderMaterial({
      uniforms: { c0: { value: new THREE.Color() }, c1: { value: new THREE.Color() }, c2: { value: new THREE.Color() },
        c3: { value: new THREE.Color() }, c4: { value: new THREE.Color() }, e: { value: new THREE.Vector4() } },
      vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: `uniform vec3 c0, c1, c2, c3, c4; uniform vec4 e; varying vec3 vP;
        void main(){ float el = asin(clamp(normalize(vP).y, -1.0, 1.0));
          vec3 c = mix(c0, c1, smoothstep(0.0, e.x, el));
          c = mix(c, c2, smoothstep(e.x, e.y, el));
          c = mix(c, c3, smoothstep(e.y, e.z, el));
          c = mix(c, c4, smoothstep(e.z, e.w, el));
          gl_FragColor = vec4(c, 1.0); }`,
      side: THREE.BackSide, depthWrite: false, fog: false,
    });
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(1100, 48, 24), this.skyMat);
    this.sky.renderOrder = -1; this.sky.frustumCulled = false; this.sky.layers.set(NOINK);
    R.add(this.sky);
    this.sunDisc = new THREE.Sprite(new THREE.SpriteMaterial({ map: discTex(), color: new THREE.Color(6.0, 4.4, 2.4), fog: false, depthWrite: false }));
    this.sunHalo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex(), color: new THREE.Color(1, 1, 1), fog: false, depthWrite: false, depthTest: true, transparent: true, blending: THREE.AdditiveBlending }));
    this.sunDisc.renderOrder = -0.5; this.sunHalo.renderOrder = 5;
    for (const m of [this.sunDisc, this.sunHalo]) { m.frustumCulled = false; m.layers.set(NOINK); R.add(m); }
    this.hemi = new THREE.HemisphereLight("#cfe6ff", "#6c5c8c", 1.1);
    this.sun = new THREE.DirectionalLight("#fff0d6", 2.6);
    this.sun.castShadow = true; this.sun.shadow.mapSize.set(4096, 4096);
    R.add(this.hemi, this.sun, this.sun.target);
    this.cloudMaps = { day: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.day.cloud)), golden: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.golden.cloud)) };
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2 + 0.3, d = 620 + (i % 3) * 60;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: this.cloudMaps.day[i % 4], color: new THREE.Color(1.1, 1.1, 1.1), transparent: true, depthWrite: false, fog: false }));
      const w = 130 + (i % 4) * 30;
      m.position.set(Math.cos(a) * d, 130 + (i % 4) * 40, Math.sin(a) * d); m.scale.set(w, w / 2, 1); m.layers.set(NOINK);
      this.clouds.push(m); R.add(m);
    }
    // ---- shared ground + the ranges on the horizon ----
    const earth = lam("redEarth", () => ({ map: earthTex() }));
    if (earth.map) { earth.map.anisotropy = 16; earth.map.needsUpdate = true; }
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(2400, 2400).rotateX(-Math.PI / 2), earth);
    const guv = ground.geometry.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < guv.count; i++) guv.setXY(i, guv.getX(i) * 170, guv.getY(i) * 170);
    ground.receiveShadow = true; R.add(ground);
    ranges(R, 560, 60, "#8f86a8", 1); ranges(R, 420, 34, "#a88f78", 2);

    for (const z of ["camp", "farm", "plain", "dam", "track"] as Zone[]) { this.zones[z] = new THREE.Group(); R.add(this.zones[z]); }
    this.fan = this.buildFarm();
    this.buildCamp(); this.buildPlain(); this.buildDam(); this.buildTrack();
    // wheat + stubble cards
    const pos: number[] = [];
    for (let x = FIELD.x0 + 0.4; x < FIELD.x1; x += 0.74) for (let z = FIELD.z0 + 0.4; z < FIELD.z1; z += 0.74) {
      const i = pos.length / 4;
      pos.push(x + (hh(i, 91) - 0.5) * 0.5, z + (hh(i, 92) - 0.5) * 0.5, hh(i, 93) * 3.14, 0.85 + 0.3 * hh(i, 94));
    }
    this.wheatPos = new Float32Array(pos); this.wheatN = pos.length / 4;
    const wm = lam("wheatClump", () => ({ map: wheatTex(false), alphaTest: 0.5 }));
    const sm = lam("wheatStubble", () => ({ map: wheatTex(true), alphaTest: 0.5 }));
    this.wheat = new THREE.InstancedMesh(crossCard(1.0, 1.12), wm, this.wheatN);
    this.stubble = new THREE.InstancedMesh(crossCard(1.0, 1.12), sm, this.wheatN);
    for (const m of [this.wheat, this.stubble]) { m.frustumCulled = false; m.receiveShadow = true; m.castShadow = false; m.layers.set(NOINK); this.zones.farm.add(m); }
    // instanced emu crowd (the horde, the far peckers, the thousand at the dam)
    for (let b = 0; b < CROWD_B; b++) {
      const mat = cardShade(new THREE.MeshLambertMaterial({ alphaTest: 0.5, side: THREE.DoubleSide }));
      const im = new THREE.InstancedMesh(GEO.emuFront, mat, CROWD_CAP);
      im.frustumCulled = false; im.castShadow = false; im.receiveShadow = true; im.layers.set(NOINK); im.renderOrder = 1; im.visible = false;
      this.crowd.push({ mesh: im, mat, req: null }); R.add(im);
    }
    // moving props
    for (let i = 0; i < 2; i++) { const g = lewisGun(0.9); g.root.visible = false; this.guns.push(g); R.add(g.root); }
    this.lowGun = lewisGun(0.45); this.lowGun.root.visible = false; R.add(this.lowGun.root);
    for (let i = 0; i < 3; i++) { const c = mesh(crateGeo(), crateMat()); c.visible = false; this.crates.push(c); R.add(c); }
    this.truck = truck(); this.truck.root.visible = false; R.add(this.truck.root);
    this.board = scoreboard(); this.board.root.visible = false; R.add(this.board.root);
    // tally crate (golden hour): chalk strokes on its lens side
    this.tally = new THREE.Group();
    const tb = new Batch(); emptyCrate(tb, 0, 0, 0, 0, false); emptyCrate(tb, 0.25, 0.9, 0.5); tb.build(this.tally);
    const tcv = document.createElement("canvas"); tcv.width = 512; tcv.height = 256;
    const ttex = new THREE.CanvasTexture(tcv); ttex.colorSpace = THREE.SRGBColorSpace;
    const tface = new THREE.Mesh(new THREE.PlaneGeometry(0.84, 0.42), new THREE.MeshBasicMaterial({ map: ttex, transparent: true, color: 0xe6e0d0 }));
    tface.position.set(0, 0.22, -0.265); tface.rotation.y = Math.PI; tface.layers.set(NOINK); tface.renderOrder = 2;
    this.tally.add(tface); this.tally.visible = false; R.add(this.tally);
    let tn = -1;
    this.tallyDraw = (n) => { if (n !== tn) { tn = n; drawTally(tcv.getContext("2d")!, n); ttex.needsUpdate = true; } };
    // spent brass: a heap of cases
    const BR = 520;
    this.brass = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.02, 0.024, 0.115, 7).rotateZ(Math.PI / 2), col("#dba93c"), BR);
    for (let i = 0; i < BR; i++) {
      const heap = i < 380, r = heap ? 0.75 * Math.sqrt(hh(i, 95)) : 0.6 + 2.2 * hh(i, 95), a = hh(i, 96) * 6.283;
      const y = heap ? 0.02 + 0.3 * Math.max(0, 1 - (r / 0.75) ** 1.6) * hh(i, 97) : 0.022;
      this.m4.compose(this.v.set(0.25 + r * Math.cos(a), y, -2.75 + r * Math.sin(a) * 0.8), this.q4.setFromEuler(this.e3.set((hh(i, 98) - 0.5) * (heap ? 1.2 : 0.1), hh(i, 99) * 6.28, 0)), this.s3.set(1, 1, 1));
      this.brass.setMatrixAt(i, this.m4);
    }
    this.brass.castShadow = true; this.brass.receiveShadow = true; this.brass.visible = false; R.add(this.brass);
    // the aftermath of 9,860 rounds: opened crates everywhere (final-score wide)
    const ab = new Batch();
    const spots: [number, number, number, number][] = [[2.6, -3.3, 0.3, 0], [3.5, -3.0, -0.4, 0], [3.0, -3.1, 0.1, 0.44], [-3.4, -1.2, 0.5, 0], [-0.3, -5.2, -0.2, 0], [0.9, -4.6, 0.25, 0],
      [0.3, -4.9, 0.1, 0.44], [3.9, -0.9, 0.9, 0], [-1.0, -5.9, 0.6, 0], [4.6, -4.4, 0.2, 0], [-3.9, -5.4, -0.5, 0], [-3.1, -3.0, 0.9, 0]];
    for (const [x, z, yaw, y] of spots) emptyCrate(ab, x, z, yaw, y, y === 0);
    ab.build(this.aftermath); this.aftermath.visible = false; R.add(this.aftermath);
  }

  // ---------------- places ----------------
  private scatter(b: Batch, n: number, seed: number, area: [number, number, number, number], ok: (x: number, z: number) => boolean, yAt: (x: number, z: number) => number = () => 0, trees = 0.22) {
    for (let i = 0; i < n; i++) {
      const x = area[0] + (area[1] - area[0]) * hh(i, seed), z = area[2] + (area[3] - area[2]) * hh(i, seed + 1), k = hh(i, seed + 2);
      if (!ok(x, z)) continue;
      const y = yAt(x, z);
      if (k < trees) { const t = new Batch(); gum(t, 0, 0, 6 + 5 * hh(i, seed + 3), i + seed); for (const m of t.build(new THREE.Group())) { m.position.set(x, y, z); this.pending.add(m); } }
      else if (k < 0.8) bush(b, x, z, 0.7 + 1.1 * hh(i, seed + 4), i + seed, y);
      else { const g = new THREE.SphereGeometry(1, 12, 9); const s = 0.3 + 0.6 * hh(i, seed + 5); g.applyMatrix4(new THREE.Matrix4().compose(V(x, y + s * 0.3, z), new THREE.Quaternion(), V(s, s * 0.5, s * 0.8))); b.add(g, col(i % 2 ? "#b06f52" : "#a8765e")); }
    }
  }
  private pending = new THREE.Group();
  private flush(zone: Zone, b: Batch) { b.build(this.zones[zone]); while (this.pending.children.length) this.zones[zone].add(this.pending.children[0]); }

  private buildCamp() {
    const b = new Batch();
    const rise = lam("dryGrass", () => ({ map: dryGrassTex() }));
    b.add(heightfield(-260, 260, RISE_Z0, 150, 60, 34, (_x, z) => riseY(z) + 0.02, 14), rise);
    tent(b, 4.7, 5.6, 0.25); tent(b, -3.4, 9.0, -0.3);
    gum(b, -8.5, 10.5, 9, 3); gum(b, 10.2, 11.5, 8, 5); gum(b, 3.9, 13.2, 7, 9);
    for (const [x, z, s] of [[-6.5, 4.2, 1.1], [7.6, 2.2, 0.9], [-11, 12, 1.4], [13, 9, 1.2], [6.2, -6.5, 1.0], [-7.4, -4.5, 0.8]]) bush(b, x, z, s, Math.round(x * 7 + z));
    for (const [x, z, s] of [[-4.9, -6.2, 0.6], [5.4, -2.6, 0.5], [-2.6, 4.4, 0.45], [8.5, -1, 0.7]]) rock(b, x, z, s, Math.round(x * 3 + z));
    this.scatter(b, 46, 11, [-120, 120, 30, 140], (x, z) => Math.abs(x) > 26 + (z - 30) * 0.9, (_x, z) => riseY(z), 0.5);
    this.scatter(b, 30, 14, [-60, 60, -60, -12], (x) => Math.abs(x) > 5, undefined, 0.25);
    this.flush("camp", b);
  }
  private buildFarm() {
    const b = new Batch(), Z = this.zones.farm;
    const straw = lam("stubbleField", () => ({ map: strawTex() }));
    if (straw.map) { straw.map.anisotropy = 16; straw.map.needsUpdate = true; }
    b.add(quad(V(FIELD.x0 - 1, 0.012, FIELD.z1 + 1), V(FIELD.x1 + 1, 0.012, FIELD.z1 + 1), V(FIELD.x1 + 1, 0.012, FIELD.z0 - 1), V(FIELD.x0 - 1, 0.012, FIELD.z0 - 1), 12, 9), straw);
    fence(b, -47, 47, 4, 8.8, 14.4);
    farmhouse(b, -5.5, 87);
    const fan = windmill(Z, b, 10.5, 90, 11);
    for (const [x, z, h, s] of [[-22, 92, 12, 1], [-15, 98, 10, 2], [20, 96, 12, 3], [28, 90, 9, 4], [-34, 88, 10, 6], [38, 97, 11, 7], [3, 104, 12, 8], [-52, 60, 10, 9], [54, 40, 11, 12], [-55, 20, 9, 13], [56, 70, 10, 15]]) gum(b, x, z, h, s);
    for (const [x, z, s] of [[-12, 84, 1.6], [16, 86, 1.4], [-50, 8, 1.3], [50, 12, 1.5], [-6, -6, 0.9], [7.5, -5, 1.0], [-10, 1.5, 0.8]]) bush(b, x, z, s, Math.round(x + z * 3));
    this.scatter(b, 30, 21, [-130, 130, 100, 170], () => true, undefined, 0.5);
    this.flush("farm", b);
    return fan;
  }
  private buildPlain() {
    const b = new Batch();
    this.scatter(b, 90, 31, [-90, 90, -40, 150], (x, z) => (Math.abs(x) > 15 || z > 62 || z < -9) && !(Math.abs(x) < 8 && z < 0), undefined, 0.2);
    for (const [x, z, s] of [[-5.5, 3, 0.9], [6.5, 6, 0.7], [-9, 14, 1.2], [10, 20, 1.0], [-12, 30, 0.9], [12.5, 38, 1.3], [-7, 47, 1.0], [8, 52, 0.8]]) bush(b, x, z, s, Math.round(x * 5 + z));
    this.flush("plain", b);
  }
  private buildDam() {
    const b = new Batch(), Z = this.zones.dam;
    const bank = lam("bankEarth", () => ({ map: dryGrassTex(), color: "#d9b08c" }));
    b.add(heightfield(-12, 12, 1.5, 13.5, 80, 44, (x, z) => bankY(x, z) + (bankY(x, z) > 0.01 ? 0.02 : -0.05), 12), bank);
    const water = mesh(new THREE.CircleGeometry(DAM.r, 48).rotateX(-Math.PI / 2), lam("damWater", () => ({ map: waterTex() })), false);
    water.position.set(DAM.cx, 0.035, DAM.cz); Z.add(water);
    const mud = mesh(new THREE.RingGeometry(DAM.r - 0.05, DAM.r + 1.3, 48).rotateX(-Math.PI / 2), col("#9a6240"), false);
    mud.position.set(DAM.cx, 0.02, DAM.cz); Z.add(mud);
    // cover along the crest either side of the gun
    for (const a of [-2.5, -2.22, -1.95, -1.77, -1.37, -1.19, -0.92, -0.64]) { const x = DAM.cx + Math.cos(a) * (DAM.bankR + 0.25), z = DAM.cz + Math.sin(a) * (DAM.bankR + 0.25); bush(b, x, z, 0.85 + 0.3 * hh(Math.round(a * 10), 5), Math.round(a * 20), bankY(x, z) - 0.1); }
    for (const [x, z, h, s] of [[-10.5, 16, 10, 1], [11, 18, 11, 2], [-12.5, 8, 9, 3], [13, 9, 9, 4], [-10, -9, 10, 6], [11, -10, 9, 7]]) gum(b, x, z, h, s);
    this.scatter(b, 70, 41, [-90, 90, -30, 160], (x, z) => Math.abs(x) > 15 + Math.max(0, z - 17) * 0.55 || z < -12, undefined, 0.25);
    this.flush("dam", b);
  }
  private buildTrack() {
    const b = new Batch(), rut = col("#a9603c");
    for (const s of [-1, 1]) b.add(quad(V(-40, 0.014, s * 0.84 + 0.22), V(260, 0.014, s * 0.84 + 0.22), V(260, 0.014, s * 0.84 - 0.22), V(-40, 0.014, s * 0.84 - 0.22)), rut);
    for (let i = 0; i < 60; i++) { const x = -5 + i * 4.3 + hh(i, 51) * 2, s = hh(i, 52) > 0.5 ? 1 : -1; rock(b, x, s * (0.84 + (hh(i, 53) - 0.5) * 0.3), 0.16 + 0.12 * hh(i, 54), i); }
    this.scatter(b, 150, 61, [-40, 260, -46, -5], () => true, undefined, 0.2);
    this.scatter(b, 110, 64, [-40, 260, 14, 50], () => true, undefined, 0.2);
    this.flush("track", b);
  }

  /** camera-relative sun, frozen per shot: the shot's mean view direction turned by az toward screen right, lifted by el */
  private shotSun(id: number, s: ShotDef, L: LightPreset, f: number) {
    const second = s.split !== undefined && f >= s.split, key = id * 2 + (second ? 1 : 0);
    const a = second ? s.split! : s.a, b = !second && s.split !== undefined ? s.split : s.b;
    let v = this.sunCache.get(key);
    if (v) return v;
    let fx = 0, fz = 0;
    for (let f = a; f < b; f += 3) {
      const c = camAt(id, f), x = c.look[0] - c.pos[0], z = c.look[2] - c.pos[2], n = Math.hypot(x, z) || 1;
      fx += x / n; fz += z / n;
    }
    const n = Math.hypot(fx, fz) || 1; fx /= n; fz /= n;
    const az = THREE.MathUtils.degToRad((second ? s.sunAz2 : s.sunAz) ?? L.az), el = THREE.MathUtils.degToRad((second ? s.sunEl2 : s.sunEl) ?? L.el);
    const hx = fx * Math.cos(az) - fz * Math.sin(az), hz = fz * Math.cos(az) + fx * Math.sin(az);
    v = new THREE.Vector3(hx * Math.cos(el), Math.sin(el), hz * Math.cos(el)).normalize();
    this.sunCache.set(key, v);
    return v;
  }
  private actor(i: number) { while (this.actors.length <= i) this.actors.push(new Actor(this.root)); return this.actors[i]; }
  private fx(i: number) { while (this.fxs.length <= i) this.fxs.push(new Fx(this.root)); return this.fxs[i]; }

  update(id: number, f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene) {
    const s = SHOTS[id - 1], L = LIGHTS[s.light], K = LOOK[s.light];
    // ---- camera ----
    const c = camAt(id, f);
    cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.rotateZ(c.roll);
    cam.fov = c.fov; cam.near = 0.2; cam.far = 1500; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    const focus = V(...c.look), dist = cam.position.distanceTo(focus);
    cam.layers.enable(NOINK);
    // ---- light rig: camera-relative sun frozen per shot, two-tone uniforms, shadow fit ----
    const sunDir = this.shotSun(id, s, L, f);
    this.hemi.color.set(L.sky); this.hemi.groundColor.set(L.ground); this.hemi.intensity = L.hemiI;
    this.sun.color.set(L.sunCol); this.sun.intensity = L.sunI;
    let Rr = THREE.MathUtils.clamp(dist * 1.15 + 7, 12, 95);
    if (s.light === "golden") Rr = Math.max(Rr, 30);
    this.sun.position.copy(focus).addScaledVector(sunDir, 220); this.sun.target.position.copy(focus);
    const sc = this.sun.shadow.camera;
    sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 20; sc.far = 480; sc.updateProjectionMatrix();
    this.sun.shadow.bias = L.bias; this.sun.shadow.normalBias = L.normalBias * (Rr / 12);
    TONE.uLitCol.value.set(...L.lit); TONE.uShadeCol.value.set(...L.shade); TONE.uShadeLift.value.set(...L.lift);
    TONE.uLambert.value = L.lambert; TONE.uSideK.value = L.sideK; TONE.uTerm.value = L.term; TONE.uBounce.value.set(...K.bounce); TONE.uSat.value = K.sat;
    CHAR.uCharTint.value.set(...L.charTint); CHAR.uCharShade.value = L.charShade; CHAR.uGrad.value = L.charGrad;
    CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(...L.sideTint);
    // ---- sky, fog, sun disc, clouds ----
    const su = this.skyMat.uniforms;
    K.sky.c.forEach((h, i) => untone(h, su["c" + i].value));
    const e = K.sky.e.map((deg) => THREE.MathUtils.degToRad(deg));
    su.e.value.set(e[1], e[2], e[3], e[4]);
    this.sky.position.copy(cam.position);
    untone(L.fog, this.fog.color); this.fog.near = L.fogNear; this.fog.far = L.fogFar;
    scene.fog = this.fog; scene.background = null;
    const showSun = s.light === "golden";
    this.sunDisc.visible = this.sunHalo.visible = showSun;
    if (showSun) {
      this.sunDisc.position.copy(cam.position).addScaledVector(sunDir, 900);
      this.sunDisc.scale.setScalar(2 * 900 * Math.tan(THREE.MathUtils.degToRad(1.7)));
      this.sunHalo.position.copy(this.sunDisc.position); this.sunHalo.scale.setScalar(2 * 900 * Math.tan(THREE.MathUtils.degToRad(24)));
      (this.sunHalo.material as THREE.SpriteMaterial).color.set(L.sunDisc).multiplyScalar(1.3);
    }
    for (let i = 0; i < this.clouds.length; i++) {
      const m = this.clouds[i];
      m.lookAt(cam.position.x, m.position.y, cam.position.z);
      (m.material as THREE.MeshBasicMaterial).map = this.cloudMaps[s.light][i % 4];
    }
    // ---- place ----
    for (const z of Object.keys(this.zones) as Zone[]) this.zones[z].visible = z === s.zone;
    // ---- the story ----
    const right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0);
    const ci: CamInfo = { pos: cam.position, right, sun: sunDir, light: s.light };
    const st = sceneAt(id, f, ci);
    this.poseProps(st);
    if (s.zone === "farm") this.poseWheat(id, f);
    this.fan.rotation.z = st.fan;
    this.frustum.setFromProjectionMatrix(this.m4.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    // ---- cast ----
    let ai = 0;
    const used: Actor[] = [];
    for (const p of st.places) {
      const sc2 = p.scale ?? 1;
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(p.x, p.y + 1.1 * sc2, p.z), 3.2))) continue;
      const a = this.actor(ai++);
      const [w, h, k] = p.size ?? [300, 500, 0.5];
      a.r = this.pool.req(p.key, w, h, k, p.draw);
      a.mesh.geometry = GEO[p.geo ?? "body"];
      a.mesh.visible = true;
      a.mesh.position.set(p.x, p.y, p.z);
      a.mesh.rotation.set(0, p.yaw ?? Math.atan2(cam.position.x - p.x, cam.position.z - p.z), p.roll ?? 0);
      a.mesh.scale.set(p.mirror ? -sc2 : sc2, sc2, sc2);
      used.push(a);
    }
    for (let i = ai; i < this.actors.length; i++) this.actors[i].mesh.visible = false;
    let fi = 0;
    const fused: [Fx, number, number][] = [];
    for (const p of st.fx) {
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(p.x, p.y, p.z), Math.max(p.w, p.h)))) continue;
      const fxo = this.fx(fi++);
      fxo.r = this.pool.req(p.key, p.cw, p.ch, 1, p.draw);
      fxo.mesh.material = p.soft ? fxo.soft : fxo.mat;
      fxo.mesh.visible = true;
      fxo.mesh.position.set(p.x, p.y, p.z);
      if (p.flat) fxo.mesh.rotation.set(-Math.PI / 2, 0, p.rot ?? 0);
      else { fxo.mesh.quaternion.copy(cam.quaternion); fxo.mesh.rotateZ(p.rot ?? 0); }
      fxo.mesh.scale.set(p.w, p.h, 1);
      fused.push([fxo, p.opacity ?? 1, p.tint ?? 0xffffff]);
    }
    for (let i = fi; i < this.fxs.length; i++) this.fxs[i].mesh.visible = false;
    // ---- instanced crowd ----
    const spec = crowdFor(id, f);
    const counts = new Array(CROWD_B).fill(0);
    if (spec) {
      for (let b = 0; b < spec.buckets; b++) {
        const o = spec.pose(b), key = `C|${spec.view}|${JSON.stringify(o, (_k, v) => (typeof v === "number" ? Math.round(v * 30) / 30 : v))}`;
        this.crowd[b].req = this.pool.req(key, Math.round(900 * spec.k), Math.round(1000 * spec.k), spec.k, (p) => (spec.view === "side" ? emuSide(p, o) : emuFront(p, o)));
        this.crowd[b].mesh.geometry = spec.view === "side" ? GEO.emuSide : GEO.emuFront;
      }
      for (let i = 0; i < spec.n; i++) {
        const p = spec.at(i);
        if (!p) continue;
        const b = i % spec.buckets;
        if (counts[b] >= CROWD_CAP) continue;
        this.q4.setFromAxisAngle(V(0, 1, 0), Math.atan2(cam.position.x - p.x, cam.position.z - p.z));
        this.m4.compose(this.v.set(p.x, p.y, p.z), this.q4, this.s3.set(p.mirror ? -p.s : p.s, p.s, p.s));
        this.crowd[b].mesh.setMatrixAt(counts[b]++, this.m4);
      }
    }
    this.crowd.forEach((cw, b) => { cw.mesh.visible = !!spec && b < spec.buckets && counts[b] > 0; cw.mesh.count = counts[b]; cw.mesh.instanceMatrix.needsUpdate = true; });
    this.pool.flush();
    for (const a of used) a.bind();
    for (const [fxo, op, tint] of fused) fxo.bind(op, tint);
    if (spec) for (let b = 0; b < spec.buckets; b++) { const t = this.crowd[b].req?.tex; if (t) this.crowd[b].mat.map = t; }
    return focus;
  }

  private poseProps(st: Scene) {
    // free guns: the low-tripod one for the dam, two standard ones elsewhere
    let gi = 0;
    this.lowGun.root.visible = false;
    for (const g of st.guns) {
      const gun = g.h !== undefined && g.h < 0.6 ? this.lowGun : this.guns[gi++];
      if (!gun) continue;
      const h = g.h !== undefined && g.h < 0.6 ? 0.45 : 0.9, carried = g.legs === false;
      gun.root.visible = true; gun.legs.visible = !carried;
      gun.root.position.set(g.pos[0], g.pos[1], g.pos[2]);
      gun.root.rotation.set(0, g.yaw, g.roll ?? 0, "YXZ");
      gun.body.position.set(0, carried ? 0 : h, -(g.recoil ?? 0));
      gun.body.rotation.set(-(g.pitch ?? 0), 0, 0);
    }
    for (let i = gi; i < this.guns.length; i++) this.guns[i].root.visible = false;
    this.crates.forEach((c, i) => { const s = st.crates[i]; c.visible = !!s; if (s) { c.position.set(...s.pos); c.rotation.y = s.yaw; } });
    const T = this.truck, ts = st.truck;
    T.root.visible = !!ts;
    if (ts) {
      T.root.position.set(ts.x, 0, ts.z); T.root.rotation.y = ts.yaw;
      T.body.position.y = ts.y; T.body.rotation.set(ts.roll, 0, ts.pitch);
      T.wheels.forEach((w, i) => { w.rotation.z = -ts.wheel; w.position.y = 0.43 + ts.wheelY[i]; });
      T.gun.root.position.y = 1.32 + ts.gunLift; T.gun.root.rotation.y = Math.PI / 2 + ts.gunYaw; T.gun.body.rotation.x = -ts.gunPitch;
    }
    this.board.root.visible = !!st.board;
    if (st.board) { this.board.root.position.set(...st.board.pos); this.board.set(st.board.key, st.board.draw); }
    this.tally.visible = !!st.tally;
    if (st.tally) { this.tally.position.set(...st.tally.pos); this.tally.rotation.y = 0.18; this.tallyDraw(st.tally.n); }
    this.brass.visible = !!st.brass || !!st.aftermath;
    this.brass.position.set(st.aftermath ? 0.5 : 0, 0, st.aftermath ? -0.9 : 0);
    this.aftermath.visible = !!st.aftermath;
  }

  private poseWheat(id: number, f: number) {
    const P = this.wheatPos, up = V(0, 1, 0), zero = this.s3;
    for (let i = 0; i < this.wheatN; i++) {
      const x = P[i * 4], z = P[i * 4 + 1], k = wheatAt(id, f, x, z), s = P[i * 4 + 3];
      this.q4.setFromAxisAngle(up, P[i * 4 + 2]);
      this.v.set(x, 0, z);
      this.m4.compose(this.v, this.q4, zero.set(k > 0.02 ? s : 0, k > 0.02 ? s * k : 0, k > 0.02 ? s : 0));
      this.wheat.setMatrixAt(i, this.m4);
      this.m4.compose(this.v, this.q4, zero.set(k < 0.98 ? s : 0, k < 0.98 ? s : 0, k < 0.98 ? s : 0));
      this.stubble.setMatrixAt(i, this.m4);
    }
    this.wheat.instanceMatrix.needsUpdate = true; this.stubble.instanceMatrix.needsUpdate = true;
  }
}
export { FPS, box };
