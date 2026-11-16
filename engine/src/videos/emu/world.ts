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
import { Pool, Actor, Fx, GEO, CamInfo, hh, Req, SHADOW } from "./castbase";
import { CARD_K } from "./cardshade";
import { emuSide, emuFront } from "./emutoon";
import { drawTally, Scene, Show, EMU_SHOW } from "./scenes";
import { lewisGun, truck, crateGeo, crateMat, emptyCrate, tent, farmhouse, windmill, fence, gum, bush, rock, ranges, heightfield, scoreboard, waterTex, Gun, Truck, Board, mesh, merged } from "./props";
import { buildDeck, updateDeck, deckFlare } from "./deckset";
import { buildPompeii, updatePompeii, ASH_L, ASH_K, FIRE_L, FIRE_K, GOLD_L, GOLD_K } from "./pompeiiset";
import { FPS, ShotDef, Zone, riseY, RISE_Z0, FIELD, DAM, bankY, hillY } from "./story";

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
/** blend two light / look presets (numbers, [numbers], "#hex" colours, nested objects) by k */
const mixAny = (a: unknown, b: unknown, k: number): unknown =>
  typeof a === "number" ? a + ((b as number) - a) * k
    : typeof a === "string" && a.startsWith("#") ? "#" + new THREE.Color(a).lerp(new THREE.Color(b as string), k).getHexString()
    : Array.isArray(a) ? a.map((v, i) => mixAny(v, (b as unknown[])[i], k))
    : a && typeof a === "object" ? Object.fromEntries(Object.keys(a).map((key) => [key, mixAny((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key], k)])) : a;

export class World {
  root = new THREE.Group();
  private pool = new Pool();
  private actors: Actor[] = [];
  private fxs: Fx[] = [];
  private zones = {} as Record<Zone, THREE.Group>;
  private hemi: THREE.HemisphereLight; private sun: THREE.DirectionalLight;
  private sky: THREE.Mesh; private skyMat: THREE.ShaderMaterial;
  private groundMesh!: THREE.Mesh; private rangeMeshes: THREE.Mesh[] = [];
  private fog = new THREE.Fog("#bccbec", 25, 420);
  private sunDisc: THREE.Sprite; private sunHalo: THREE.Sprite;
  private sunCache = new Map<number, THREE.Vector3>();
  private cloudMaps: Record<"day" | "golden" | "night", THREE.Texture[]>;
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

  constructor(private show: Show = EMU_SHOW) {
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
    this.cloudMaps = { day: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.day.cloud)), golden: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.golden.cloud)), night: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.night.cloud)) };
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
    ground.receiveShadow = true; R.add(ground); this.groundMesh = ground;
    this.rangeMeshes = [ranges(R, 560, 60, "#8f86a8", 1), ranges(R, 420, 34, "#a88f78", 2)];

    for (const z of ["camp", "farm", "plain", "dam", "track", "office", "dock", "cassino", "zoo", "scot", "isle", "paris", "louvre", "deck", "pompeii"] as Zone[]) { this.zones[z] = new THREE.Group(); R.add(this.zones[z]); }
    this.buildPlus(); this.buildWojtek(); this.buildMona(); buildDeck(this.zones.deck); buildPompeii(this.zones.pompeii);
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
  // indoors nothing casts a sun shadow: the hard purple wedges and notched bands they threw on walls and floors read as mistakes
  private flush(zone: Zone, b: Batch) { b.build(this.zones[zone], zone !== "louvre" && zone !== "office"); while (this.pending.children.length) this.zones[zone].add(this.pending.children[0]); }

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
      const c = this.show.camAt(id, f), x = c.look[0] - c.pos[0], z = c.look[2] - c.pos[2], n = Math.hypot(x, z) || 1;
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
    const s = this.show.shots[id - 1];
    let L: LightPreset = LIGHTS[s.light], K = LOOK[s.light];
    if (s.zone === "pompeii") { L = GOLD_L as LightPreset; K = GOLD_K as typeof K; }   // warm gold, shadows warm too
    const mood = this.show.moodAt?.(id, f) ?? 0;
    { const pm = s.zone === "pompeii"; CARD_K.uRim.value = pm ? 1.0 + 2.2 * Math.min(1, mood * 2) : 1; CARD_K.uRimW.value = pm ? 2.0 + 3.0 * Math.min(1, mood * 2) : 2; SHADOW.tail = pm ? [0.62, 0.5, 0.44] : null; SHADOW.contact = pm ? [0.36, 0.26, 0.22] : null; }   // the daylight drains toward ash-dark (Pompeii)
    if (mood > 0) { const m1 = Math.min(1, mood * 2), m2 = Math.max(0, mood * 2 - 1); L = mixAny(L, FIRE_L, m1) as LightPreset; K = mixAny(K, FIRE_K, m1) as typeof K; if (m2 > 0) { L = mixAny(L, ASH_L, m2) as LightPreset; K = mixAny(K, ASH_K, m2) as typeof K; } }   // gold -> fire red (0.5) -> ash-dark (1)
    // ---- camera ----
    const c = this.show.camAt(id, f);
    cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.rotateZ(c.roll);
    cam.fov = c.fov; cam.near = 0.2; cam.far = 1500; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    const focus = V(...c.look), dist = cam.position.distanceTo(focus);
    cam.layers.enable(NOINK);
    // ---- light rig: camera-relative sun frozen per shot, two-tone uniforms, shadow fit ----
    let sunDir = this.shotSun(id, s, L, f);
    // a flare (a distress rocket) takes over as the scene's one light while it burns: the shadows fall away from it
    const fl0 = s.zone === "deck" ? deckFlare(f / FPS) : s.zone === "pompeii" ? this.show.flareAt?.(id, f) ?? null : null, fl = fl0 ? { k: fl0.k, pos: Array.isArray(fl0.pos) ? V(...fl0.pos) : fl0.pos } : null, gain = fl ? 1 + 0.08 * fl.k : 1;
    // (the sun direction is no longer turned toward the flare: planks stay brown and are only lit a little)
    this.hemi.color.set(L.sky); this.hemi.groundColor.set(L.ground); this.hemi.intensity = L.hemiI;
    this.sun.color.set(L.sunCol); this.sun.intensity = L.sunI * gain;
    let Rr = THREE.MathUtils.clamp(dist * 1.15 + 7, 12, 95);
    if (s.light === "golden") Rr = Math.max(Rr, 30);
    this.sun.position.copy(focus).addScaledVector(sunDir, 220); this.sun.target.position.copy(focus);
    const sc = this.sun.shadow.camera;
    sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 20; sc.far = 480; sc.updateProjectionMatrix();
    this.sun.shadow.bias = L.bias; this.sun.shadow.normalBias = L.normalBias * (Rr / 12);
    // while a flare burns its shadows are SOFT: the fill (shade colour, lift, hemisphere light) rises with it, so the deck is never cut by a black wedge
    const fk = fl ? fl.k : 0;
    this.hemi.intensity = L.hemiI * (1 + 0.5 * fk); this.sun.shadow.radius = 2 + 10 * fk;
    TONE.uLitCol.value.set(...L.lit).multiplyScalar(gain); TONE.uShadeCol.value.set(...L.shade).multiplyScalar(1 + 0.45 * fk); TONE.uShadeLift.value.set(...L.lift).multiplyScalar(1 + 0.9 * fk);
    TONE.uLambert.value = L.lambert; TONE.uSideK.value = L.sideK; TONE.uTerm.value = L.term; TONE.uBounce.value.set(...K.bounce); TONE.uSat.value = K.sat;
    CHAR.uCharTint.value.set(...L.charTint).multiplyScalar(1 + 0.35 * (gain - 1)); CHAR.uCharShade.value = L.charShade; CHAR.uGrad.value = L.charGrad;
    CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(...L.sideTint);
    // ---- sky, fog, sun disc, clouds ----
    const su = this.skyMat.uniforms;
    K.sky.c.forEach((h, i) => untone(h, su["c" + i].value));
    const e = K.sky.e.map((deg) => THREE.MathUtils.degToRad(deg));
    su.e.value.set(e[1], e[2], e[3], e[4]);
    this.sky.position.copy(cam.position);
    untone(L.fog, this.fog.color); this.fog.near = L.fogNear; this.fog.far = L.fogFar;
    scene.fog = this.fog; scene.background = null;
    const showSun = s.light === "golden" && s.zone !== "pompeii";   // in Pompeii the volcano is the lamp, not the sun
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
      (m.material as THREE.MeshBasicMaterial).map = this.cloudMaps[s.light][i % 4]; m.visible = s.light !== "night" && s.zone !== "pompeii";
    }
    // ---- place ----
    for (const z of Object.keys(this.zones) as Zone[]) this.zones[z].visible = z === s.zone;
    this.groundMesh.visible = s.zone !== "deck" && s.zone !== "pompeii"; for (const rm of this.rangeMeshes) rm.visible = s.zone !== "pompeii"; if (s.zone === "pompeii") updatePompeii(f / FPS, this.show.pompAt?.(id, f), cam); if (s.zone === "deck") updateDeck(f / FPS, cam.position, this.show.deckAt?.(id, f));   // at sea there is no red earth under the ship
    // ---- the story ----
    const right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0);
    const ci: CamInfo = { pos: cam.position, right, sun: sunDir, light: s.light };
    const st = this.show.sceneAt(id, f, ci);
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
      a.mesh.rotation.set(0, p.yaw ?? Math.atan2(cam.position.x - p.x, cam.position.z - p.z), (p.mirror ? -1 : 1) * (p.roll ?? 0));
      a.mesh.scale.set(p.mirror ? -sc2 : sc2, sc2, sc2);
      a.tint = p.tint;
      used.push(a);
    }
    for (let i = ai; i < this.actors.length; i++) this.actors[i].mesh.visible = false;
    let fi = 0;
    const fused: [Fx, number, number][] = [];
    // "top" cards (banners, bubbles, stamps) are pulled along their line of sight to just in front of the lens and
    // shrunk by the same factor: the same picture on screen, but nothing in the scene can stand in front of them.
    // They keep their order: the farthest (and, at equal depth, the first listed) ends up at the back.
    const fwd = cam.getWorldDirection(V(0, 0, 0)), cp = cam.position;
    const depthOf = (p: { x: number; y: number; z: number }) => (p.x - cp.x) * fwd.x + (p.y - cp.y) * fwd.y + (p.z - cp.z) * fwd.z;
    const pull = new Map<object, number>();
    st.fx.map((p, i) => ({ p, i, d: depthOf(p) })).filter((e) => e.p.top && !e.p.flat && e.d > 0.7)
      .sort((a, b) => b.d - a.d || a.i - b.i).forEach((e, k) => pull.set(e.p, Math.max(0.32, 0.62 - 0.003 * k) / e.d));
    for (const p of st.fx) {
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(p.x, p.y, p.z), Math.max(p.w, p.h)))) continue;
      const fxo = this.fx(fi++), s = pull.get(p) ?? 1;
      fxo.r = this.pool.req(p.key, p.cw, p.ch, 1, p.draw);
      fxo.mesh.material = p.soft ? fxo.soft : fxo.mat;
      fxo.mesh.visible = true;
      fxo.mesh.position.set(cp.x + (p.x - cp.x) * s, cp.y + (p.y - cp.y) * s, cp.z + (p.z - cp.z) * s);
      if (p.flat) fxo.mesh.rotation.set(-Math.PI / 2, 0, p.rot ?? 0);
      else { fxo.mesh.quaternion.copy(cam.quaternion); fxo.mesh.rotateZ(p.rot ?? 0); }
      fxo.mesh.scale.set(p.w * s, p.h * s, 1);
      fused.push([fxo, p.opacity ?? 1, p.tint ?? 0xffffff]);
    }
    for (let i = fi; i < this.fxs.length; i++) this.fxs[i].mesh.visible = false;
    // ---- instanced crowd ----
    const spec = this.show.crowdFor(id, f);
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
    for (const a of used) a.bind(1, a.tint ?? 0xffffff);
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
      T.gun.root.visible = !ts.noGun;
      T.gun.root.position.y = 1.32 + ts.gunLift; T.gun.root.rotation.y = Math.PI / 2 + ts.gunYaw; T.gun.body.rotation.x = -ts.gunPitch;
    }
    this.board.root.visible = !!st.board;
    if (st.board) { this.board.root.position.set(...st.board.pos); this.board.set(st.board.key, st.board.draw); }
    this.tally.visible = !!st.tally;
    if (st.tally) { this.tally.position.set(...st.tally.pos); this.tally.rotation.y = 0.18; this.tallyDraw(st.tally.n); }
    this.brass.visible = !!st.brass || !!st.aftermath;
    if (st.brassAt) this.brass.position.set(...st.brassAt); else this.brass.position.set(st.aftermath ? 0.5 : 0, 0, st.aftermath ? -0.9 : 0);
    this.posePlus(st);
    this.aftermath.visible = !!st.aftermath;
  }

  // ---------------- long-film extras: film camera, exclusion fence, the minister's office, the sea ----------------
  private filmCam = new THREE.Group(); private crank = new THREE.Group(); private tallFence = new THREE.Group();
  private desk = new THREE.Group(); private lectern = new THREE.Group();
  private buildPlus() {
    // hand-cranked film camera on a wooden tripod
    const fb = new Batch(), wood = col("#8a5a34"), blk = col("#2f3138"), brassM = col("#d0a53c");
    for (const [x, z] of [[-0.4, 0.28], [0.4, 0.28], [0, -0.48]]) fb.add(new THREE.CylinderGeometry(0.025, 0.03, 1.45, 6).applyMatrix4(new THREE.Matrix4().makeRotationZ(Math.atan2(x, 1.35)).multiply(new THREE.Matrix4().makeRotationX(-Math.atan2(z, 1.35))).setPosition(x / 2, 0.68, z / 2)), wood);
    fb.add(box(0, 1.35, 0, 0.3, 0.36, 0.5), blk);
    fb.add(new THREE.CylinderGeometry(0.07, 0.09, 0.2, 12).rotateX(Math.PI / 2).translate(0, 1.52, 0.34), brassM);
    for (const z of [-0.12, 0.14]) fb.add(new THREE.CylinderGeometry(0.17, 0.17, 0.08, 16).rotateZ(Math.PI / 2).translate(0, 1.86, z), blk);
    fb.build(this.filmCam);
    const ck = new Batch(); ck.add(box(0.19, -0.02, 0, 0.06, 0.04, 0.04), brassM); ck.add(box(0.2, -0.02, 0.1, 0.03, 0.04, 0.22), brassM); ck.build(this.crank);
    this.crank.position.set(0, 1.5, 0); this.filmCam.add(this.crank);
    this.filmCam.visible = false; this.root.add(this.filmCam);
    // exclusion fence: tall posts and five wires along the front of the field
    const tf = new Batch(), post = col("#8a6a4a"), wire = col("#6a6e76");
    for (let x = -36; x <= 36.01; x += 3) tf.add(box(x, 0, 2.9, 0.14, 2.3, 0.14), post);
    for (let k = 0; k < 6; k++) tf.add(box(0, 0.25 + k * 0.38, 2.9, 72, 0.035, 0.035), wire);
    tf.build(this.tallFence); this.tallFence.visible = false; this.zones.farm.add(this.tallFence);
    // the sea the mob is walking toward (far east of the plain)
    const sea = mesh(quad(V(170, 0.03, 900), V(1200, 0.03, 900), V(1200, 0.03, -900), V(170, 0.03, -900)), col("#2f86b0"), false);
    const sand = mesh(quad(V(152, 0.025, 900), V(170, 0.025, 900), V(170, 0.025, -900), V(152, 0.025, -900)), col("#ecd9a6"), false);
    this.zones.plain.add(sea, sand);
    // the office: plank floor, panelled walls, pictures; a desk (minister) or a lectern and benches (parliament)
    const ob = new Batch(), Z = this.zones.office;
    const floor = lam("officeFloor", () => ({ map: ctex("officeFloor", 512, 512, (g, r) => { g.fillStyle = "#a9794e"; g.fillRect(0, 0, 512, 512); for (let i = 0; i < 8; i++) { g.fillStyle = `rgba(${r() > 0.5 ? "255,220,170" : "60,30,10"},${0.05 + 0.08 * r()})`; g.fillRect(i * 64, 0, 64, 512); g.fillStyle = "rgba(60,35,18,0.6)"; g.fillRect(i * 64, 0, 3, 512); } }) }));
    ob.add(quad(V(-14, 0.03, 9), V(14, 0.03, 9), V(14, 0.03, -16), V(-14, 0.03, -16), 7, 6), floor);
    const wall = col("#b9c4a8"), panel = col("#7a5236"), trim = col("#e9dfc8");
    ob.add(box(0, 0, 6.2, 28, 7.5, 0.3), wall); ob.add(box(0, 0, 6.0, 28, 1.25, 0.12), panel); ob.add(box(0, 1.25, 5.98, 28, 0.1, 0.14), trim);
    for (const sx of [-1, 1]) { ob.add(box(sx * 13.8, 0, -4, 0.3, 7.5, 21), wall); ob.add(box(sx * 13.6, 0, -4, 0.12, 1.25, 21), panel); }
    for (let i = 0; i < 14; i++) ob.add(box(-13 + i * 2, 0.16, 5.93, 1.5, 0.9, 0.03), col("#8a6040")); // panels of the dado
    ob.build(Z, false);
    const db = new Batch();
    db.add(box(0, 0, 0, 2.4, 0.86, 1.0), panel); db.add(box(0, 0.86, 0, 2.6, 0.07, 1.15), col("#5e3d26"));
    db.add(box(-0.7, 0.93, 0.05, 0.5, 0.05, 0.36), trim); db.add(box(0.8, 0.93, -0.1, 0.26, 0.03, 0.18), col("#b08a3a")); db.add(box(0.8, 0.96, -0.1, 0.035, 0.3, 0.035), col("#b08a3a")); db.add(box(0.8, 1.24, -0.12, 0.42, 0.1, 0.2), col("#2f6a48")); db.add(box(0.8, 1.215, -0.12, 0.36, 0.03, 0.16), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 1.9, 1.2), fog: false }));
    db.build(this.desk, false); this.desk.position.set(-2.2, 0.03, 1.4); Z.add(this.desk);
    const lb = new Batch();
    lb.add(box(0, 0, 0, 1.7, 1.5, 0.6), panel); lb.add(box(0, 1.5, -0.05, 1.86, 0.08, 0.76), col("#5e3d26")); lb.add(box(0, 0.2, -0.31, 1.3, 1.0, 0.03), col("#8a6040")); // tall enough to hide the judge below the chest
    // public benches: a seat and a back each, in dark wood (the old green slabs read as hedges)
    for (let row = 0; row < 3; row++) for (const sx of [-1, 1]) { lb.add(box(sx * 4.6, 0, 2.2 + row * 1.2, 5.2, 0.46, 0.5), panel); lb.add(box(sx * 4.6, 0.46, 2.2 + row * 1.2, 5.3, 0.06, 0.56), col("#5e3d26")); lb.add(box(sx * 4.6, 0, 2.5 + row * 1.2, 5.2, 1.0, 0.1), col("#5e3d26")); }
    lb.build(this.lectern, false); this.lectern.position.set(0, 0.03, 0.6); Z.add(this.lectern);
  }
  private posePlus(st: Scene) {
    this.filmCam.visible = !!st.filmCam;
    if (st.filmCam) { this.filmCam.position.set(...st.filmCam.pos); this.filmCam.rotation.y = st.filmCam.yaw; this.crank.rotation.x = st.filmCam.crank; }
    this.tallFence.visible = (st.tallFence ?? 0) > 0.01; this.tallFence.scale.set(1, Math.max(0.01, st.tallFence ?? 0), 1);
    this.desk.visible = st.office !== "parliament"; this.lectern.visible = st.office === "parliament";
    this.shellCrates.forEach((c, i) => { const s = st.shellCrates?.[i]; c.visible = !!s; if (s) { c.position.set(...s.pos); c.rotation.y = s.yaw; } });
    this.fieldGun.visible = !!st.fieldGun;
    if (st.fieldGun) { this.fieldGun.position.set(...st.fieldGun.pos); this.fieldGun.rotation.y = st.fieldGun.yaw; this.gunBarrel.position.z = -0.45 * st.fieldGun.recoil; }
  }

  // ---------------- the Wojtek film: troopship at the quay, Monte Cassino, Edinburgh Zoo ----------------
  private shellCrates: THREE.Mesh[] = []; private fieldGun = new THREE.Group(); private gunBarrel = new THREE.Group();
  // ---------------- the Mona Lisa film: one zone of interiors, 60 m apart so no room ever sees another ----------------
  // x = 0 the Salon Carre (red gallery) | 60 the service staircase | 120 the thief's room in Paris | 180 a room in
  // Florence (hotel bed on the left, a painter's studio window on the right) | 240 the Uffizi (green gallery)
  private buildMona() {
    const b = new Batch(), gold = col("#d9a93a"), goldD = col("#a87c22"), wood = col("#5a3a26"), woodL = col("#8a5a34");
    const parquet = lam("parquet", () => ({ map: ctex("parquet", 512, 512, (g, r) => {
      g.fillStyle = "#b98a54"; g.fillRect(0, 0, 512, 512);
      for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
        g.fillStyle = `rgba(${(x + y) % 2 ? "255,225,170" : "70,40,16"},${0.1 + 0.1 * r()})`; g.fillRect(x * 64, y * 64, 64, 64);
        g.strokeStyle = "rgba(60,35,18,0.55)"; g.lineWidth = 2; g.strokeRect(x * 64, y * 64, 64, 64);
        for (let k = 1; k < 4; k++) { g.beginPath(); if ((x + y) % 2) { g.moveTo(x * 64 + k * 16, y * 64); g.lineTo(x * 64 + k * 16, y * 64 + 64); } else { g.moveTo(x * 64, y * 64 + k * 16); g.lineTo(x * 64 + 64, y * 64 + k * 16); } g.stroke(); }
      }
    }) }));
    const planks = lam("roomPlanks", () => ({ map: ctex("roomPlanks", 512, 512, (g, r) => { g.fillStyle = "#9a7450"; g.fillRect(0, 0, 512, 512); for (let i = 0; i < 8; i++) { g.fillStyle = `rgba(${r() > 0.5 ? "255,220,170" : "50,28,10"},${0.06 + 0.1 * r()})`; g.fillRect(i * 64, 0, 64, 512); g.fillStyle = "rgba(50,30,16,0.65)"; g.fillRect(i * 64, 0, 3, 512); } }) }));
    const flags = lam("stoneFlags", () => ({ map: ctex("stoneFlags", 512, 512, (g, r) => { g.fillStyle = "#b9b2a4"; g.fillRect(0, 0, 512, 512); for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = `rgba(${r() > 0.5 ? "255,255,245" : "70,66,60"},${0.05 + 0.1 * r()})`; g.fillRect(x * 128, y * 128, 128, 128); g.strokeStyle = "rgba(80,74,66,0.6)"; g.lineWidth = 4; g.strokeRect(x * 128, y * 128, 128, 128); } }) }));
    const blocks = lam("stoneBlocks", () => ({ map: ctex("stoneBlocks", 512, 512, (g, r) => { g.fillStyle = "#d2c9b6"; g.fillRect(0, 0, 512, 512); for (let y = 0; y < 8; y++) for (let x = -1; x < 4; x++) { const ox = (y % 2) * 64; g.fillStyle = `rgba(${r() > 0.5 ? "255,250,235" : "90,80,64"},${0.04 + 0.08 * r()})`; g.fillRect(x * 128 + ox, y * 64, 128, 64); g.strokeStyle = "rgba(110,100,84,0.5)"; g.lineWidth = 3; g.strokeRect(x * 128 + ox, y * 64, 128, 64); } }) }));
    const tiles = lam("redTiles", () => ({ map: ctex("redTiles", 512, 512, (g, r) => { for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { g.fillStyle = (x + y) % 2 ? "#b8603f" : "#e2cfa6"; g.fillRect(x * 64, y * 64, 64, 64); g.fillStyle = `rgba(40,20,10,${0.05 * r()})`; g.fillRect(x * 64, y * 64, 64, 64); } }) }));
    const picture = (k: number) => lam("louvrePic" + k, () => ({ map: ctex("louvrePic" + k, 256, 256, (g) => {
      const sky = ["#6f8fa6", "#a88f5e", "#4a5a52", "#7a6a8a", "#8a5a48", "#5a6f7a"][k % 6];
      const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, sky); gr.addColorStop(1, "#3a2f28"); g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
      g.fillStyle = "rgba(60,70,50,0.8)"; g.beginPath(); g.moveTo(0, 190); for (let x = 0; x <= 256; x += 32) g.lineTo(x, 172 + 26 * Math.sin(x / 40 + k)); g.lineTo(256, 256); g.lineTo(0, 256); g.fill();
      const n = 1 + (k % 3);
      for (let i = 0; i < n; i++) { const x = (256 * (i + 1)) / (n + 1); g.fillStyle = ["#b9483a", "#c9a25a", "#3f5f8a", "#e9dfc8"][(k + i) % 4]; g.beginPath(); g.ellipse(x, 196, 28, 62, 0, 0, 7); g.fill(); g.fillStyle = "#e8c4a0"; g.beginPath(); g.arc(x, 122, 17, 0, 7); g.fill(); }
      const v = g.createRadialGradient(128, 128, 60, 128, 128, 190); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(30,20,10,0.6)"); g.fillStyle = v; g.fillRect(0, 0, 256, 256);
    }) }));
    /** a framed picture on a back wall whose inner face is at zw; (x, y) = centre */
    const hang = (x: number, y: number, w: number, h: number, zw: number, k: number) => {
      b.add(box(x, y - h / 2 - 0.13, zw - 0.07, w + 0.26, h + 0.26, 0.14), gold); b.add(box(x, y - h / 2 - 0.04, zw - 0.16, w + 0.08, h + 0.08, 0.04), goldD); b.add(box(x, y - h / 2, zw - 0.2, w, h, 0.04), picture(k));
    };
    /** floor, back wall and side walls; the back wall's inner face is at zb */
    const shell = (cx: number, w: number, zb: number, zf: number, h: number, floor: THREE.Material, wall: THREE.Material, tile = 4) => {
      b.add(quad(V(cx - w / 2, 0.03, zb), V(cx + w / 2, 0.03, zb), V(cx + w / 2, 0.03, zf), V(cx - w / 2, 0.03, zf), w / tile, (zb - zf) / tile), floor);
      b.add(box(cx, 0, zb + 0.15, w + 0.6, h, 0.3), wall);
      for (const s of [-1, 1]) b.add(box(cx + s * (w / 2 + 0.15), 0, (zb + zf) / 2, 0.3, h, zb - zf), wall);
    };
    const dado = (cx: number, w: number, zb: number, zf: number, hh: number, m: THREE.Material, rail: THREE.Material) => {
      b.add(box(cx, 0, zb - 0.05, w, hh, 0.1), m); b.add(box(cx, hh, zb - 0.07, w, 0.09, 0.14), rail);
      for (const s of [-1, 1]) { b.add(box(cx + s * (w / 2 - 0.05), 0, (zb + zf) / 2, 0.1, hh, zb - zf), m); b.add(box(cx + s * (w / 2 - 0.07), hh, (zb + zf) / 2, 0.14, 0.09, zb - zf), rail); }
    };
    // ---- galleries: the Salon Carre (0) and the Uffizi (240). The middle of the back wall is left bare for the film's own
    // picture; left of it (x = +2.7..+5.1) a doorway opens on a second, sunlit room, whose tall window is the light we see.
    // Three shafts from the skylight fall across the wall and the floor (soft additive sheets, never outlined).
    const paper = (hex: string) => lam("wallpaper" + hex, () => ({ map: ctex("wallpaper" + hex, 256, 256, (g) => {
      g.fillStyle = hex; g.fillRect(0, 0, 256, 256);
      for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) {
        const cx = x * 64 + (y % 2 ? 32 : 0) + 16, cy = y * 64 + 32;
        g.fillStyle = "rgba(0,0,0,0.10)"; g.beginPath(); g.moveTo(cx, cy - 22); g.quadraticCurveTo(cx + 18, cy, cx, cy + 22); g.quadraticCurveTo(cx - 18, cy, cx, cy - 22); g.fill();
        g.fillStyle = "rgba(255,230,190,0.07)"; g.beginPath(); g.arc(cx, cy, 5, 0, 7); g.fill();
      }
    }) }));
    const shaftTex = ctex("lightShaft", 64, 256, (g) => {
      const gx = g.createLinearGradient(0, 0, 64, 0); gx.addColorStop(0, "rgba(255,255,255,0)"); gx.addColorStop(0.3, "rgba(255,255,255,1)"); gx.addColorStop(0.7, "rgba(255,255,255,1)"); gx.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = gx; g.fillRect(0, 0, 64, 256);
      g.globalCompositeOperation = "destination-in"; const gy = g.createLinearGradient(0, 0, 0, 256); gy.addColorStop(0, "rgba(0,0,0,0.55)"); gy.addColorStop(0.5, "rgba(0,0,0,1)"); gy.addColorStop(1, "rgba(0,0,0,0.75)"); g.fillStyle = gy; g.fillRect(0, 0, 64, 256);
    });
    const glow = (r: number, gg: number, bl: number) => new THREE.MeshBasicMaterial({ map: shaftTex, color: new THREE.Color(r, gg, bl), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, side: THREE.DoubleSide });
    const shaftM = glow(0.2, 0.15, 0.07), poolM = glow(0.2, 0.15, 0.07), sunM = glow(0.3, 0.24, 0.12);
    // bright, but under the bloom threshold where people stand in front of it: a hotter window put a white halo round them
    const windowM = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.25, 1.18, 0.98), fog: false });
    const cream = col("#efe6cf"), marble = col("#cfc3a8");
    for (const [cx, wallC, k0, farC] of [[0, "#8a2f33", 0, "#3f6f73"], [240, "#4f6f5a", 7, "#8a4a3a"]] as const) {
      const wm = paper(wallC), zb = 6.05, D0 = cx + 2.7, D1 = cx + 5.1, DH = 3.8;
      b.add(quad(V(cx - 15, 0.03, zb), V(cx + 15, 0.03, zb), V(cx + 15, 0.03, -18), V(cx - 15, 0.03, -18), 10, 8), cx === 0 ? parquet : lam("uffiziFloor", () => ({ map: ctex("uffiziFloor", 256, 256, (g) => { for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = (x + y) % 2 ? "#d9d4c8" : "#9aa0a6"; g.fillRect(x * 64, y * 64, 64, 64); } g.strokeStyle = "rgba(40,40,50,0.5)"; g.lineWidth = 2; for (let k = 0; k <= 4; k++) { g.beginPath(); g.moveTo(k * 64, 0); g.lineTo(k * 64, 256); g.moveTo(0, k * 64); g.lineTo(256, k * 64); g.stroke(); } }) })));
      // back wall in three pieces around the doorway, side walls, dado and rail (broken at the doorway too)
      b.add(box((cx - 15.3 + D0) / 2, 0, zb + 0.15, D0 - (cx - 15.3), 9, 0.3, 0, 1.6), wm); b.add(box((D1 + cx + 15.3) / 2, 0, zb + 0.15, cx + 15.3 - D1, 9, 0.3, 0, 1.6), wm);
      b.add(box((D0 + D1) / 2, DH, zb + 0.15, D1 - D0, 9 - DH, 0.3, 0, 1.6), wm);
      for (const s of [-1, 1]) { b.add(box(cx + s * 15.15, 0, -6, 0.3, 9, 24, 0, 1.6), wm); b.add(box(cx + s * 14.95, 0, -6, 0.1, 1.0, 24), wood); b.add(box(cx + s * 14.93, 1.0, -6, 0.14, 0.09, 24), gold); }
      for (const [x0, x1] of [[cx - 15, D0 - 0.12], [D1 + 0.12, cx + 15]]) { b.add(box((x0 + x1) / 2, 0, zb - 0.05, x1 - x0, 1.0, 0.1), wood); b.add(box((x0 + x1) / 2, 1.0, zb - 0.07, x1 - x0, 0.09, 0.14), gold); b.add(box((x0 + x1) / 2, 0, zb - 0.08, x1 - x0, 0.16, 0.16), goldD); }
      b.add(box(cx, 8.2, 5.95, 30, 0.5, 0.3), gold); b.add(box(cx, 8.7, 5.9, 30, 0.3, 0.4), cream);
      // the doorway: cream jambs and a gilt lintel
      for (const x of [D0 - 0.06, D1 + 0.06]) b.add(box(x, 0, zb - 0.06, 0.26, DH + 0.1, 0.22), cream);
      b.add(box((D0 + D1) / 2, DH, zb - 0.06, D1 - D0 + 0.5, 0.3, 0.24), gold); b.add(box((D0 + D1) / 2, DH + 0.3, zb - 0.06, D1 - D0 + 0.8, 0.12, 0.3), cream);
      // the room beyond: pale floor, a coloured far wall with a tall bright window (placed where the lens sees it through the doorway)
      b.add(quad(V(cx + 0.3, 0.03, 16.4), V(cx + 10.6, 0.03, 16.4), V(cx + 10.6, 0.03, zb), V(cx + 0.3, 0.03, zb)), marble);
      b.add(box(cx + 5.45, 0, 16.55, 10.7, 9, 0.3), col(farC)); for (const x of [cx + 0.25, cx + 10.65]) b.add(box(x, 0, 11.4, 0.3, 9, 10.4), col(farC));
      b.add(box(cx + 5.45, 0, 16.38, 10.3, 0.9, 0.06), wood); b.add(box(cx + 5.45, 0.9, 16.36, 10.3, 0.08, 0.1), gold);
      b.add(box(cx + 7.0, 1.0, 16.36, 2.7, 5.0, 0.1), cream); b.add(box(cx + 7.0, 1.14, 16.3, 2.4, 4.7, 0.06), windowM);
      b.add(box(cx + 7.0, 1.14, 16.26, 0.09, 4.7, 0.05), cream); for (const y of [2.6, 4.2]) b.add(box(cx + 7.0, y, 16.26, 2.4, 0.08, 0.05), cream);
      hang(cx + 3.6, 2.7, 1.5, 1.9, 16.4, k0 + 3); hang(cx + 9.7, 2.7, 1.2, 1.8, 16.4, k0 + 5);
      b.add(quad(V(cx + 5.85, 0.045, 16.2), V(cx + 8.15, 0.045, 16.2), V(cx + 4.0, 0.045, 1.6), V(cx + 1.4, 0.045, 1.6)), sunM);
      // pictures: the old row, minus the one the doorway replaced
      const P: [number, number, number, number][] = [[-3.5, 2.85, 2.2, 2.6], [7.4, 2.6, 2.0, 2.6], [-7.2, 2.5, 2.6, 1.9], [11.2, 2.8, 2.4, 2.2], [-11.0, 2.9, 2.0, 2.5], [5.6, 6.1, 3.4, 2.2], [-5.4, 6.1, 3.0, 2.4], [0, 6.2, 3.2, 2.4], [10.4, 6.0, 2.6, 2.2], [-10.2, 6.1, 2.8, 2.2]];
      P.forEach(([x, y, w, h], i) => hang(cx + x, y, w, h, 6.05, k0 + i));
      for (const s of [-1, 1]) for (let i = 0; i < 4; i++) { const z = 3 - i * 4.6; b.add(box(cx + s * 14.86, 1.9, z, 0.14, 2.3, 2.8), gold); b.add(box(cx + s * 14.74, 2.0, z, 0.06, 2.1, 2.6), picture(k0 + 11 + i + (s > 0 ? 4 : 0))); }
      // light from the skylight: three slanting sheets on the wall, each with its pool on the floor
      for (const [xt, xb] of [[1.6, -2.75], [-7.0, -11.3], [11.0, 6.6]]) {
        b.add(quad(V(cx + xt + 1.0, 8.2, 5.8), V(cx + xt - 1.0, 8.2, 5.8), V(cx + xb - 1.0, 1.12, 5.8), V(cx + xb + 1.0, 1.12, 5.8)), shaftM);
        b.add(quad(V(cx + xb + 1.0, 0.05, 5.9), V(cx + xb - 1.0, 0.05, 5.9), V(cx + xb - 2.9, 0.05, 2.4), V(cx + xb - 0.5, 0.05, 2.4)), poolM);
      }
    }
    // ---- the service staircase (60): stone; a flight of steps going up to the back on the left, bare wall on the right for the door ----
    shell(60, 12, 5.05, -14, 9, flags, blocks, 3);
    for (let k = 0; k < 9; k++) b.add(box(63.6, 0, 0.9 + k * 0.46, 3.0, 0.2 * (k + 1), 0.46), col(k % 2 ? "#a8a092" : "#b4ad9e"));
    b.add(box(63.6, 0, 4.6, 3.0, 2.0, 0.9), col("#b4ad9e")); b.add(box(63.6, 2.0, 4.99, 2.2, 3.4, 0.1), col("#3a3530"));
    b.add(box(62.05, 0, 2.9, 0.1, 2.9, 4.2), col("#8f8779")); b.add(box(62.05, 2.9, 2.9, 0.16, 0.08, 4.3), woodL);
    // ---- the thief's room in Paris (120): bare plaster, a window, an iron bed, a table ----
    shell(120, 9, 4.05, -12, 7, planks, col("#cfc2a4"), 3); dado(120, 9, 4.05, -12, 0.18, wood, wood);
    b.add(box(117.4, 1.3, 3.98, 1.5, 2.0, 0.12), wood); b.add(box(117.4, 1.42, 3.9, 1.26, 1.76, 0.06), col("#9cc4e6")); b.add(box(117.4, 1.42, 3.86, 0.07, 1.76, 0.05), wood); b.add(box(117.4, 2.26, 3.86, 1.26, 0.07, 0.05), wood);
    b.add(box(123.0, 0.3, 2.9, 1.2, 0.3, 2.1), col("#6a7f9a")); b.add(box(123.0, 0.6, 3.6, 0.9, 0.16, 0.5), col("#d9d2c0"));
    for (const [x, z] of [[122.45, 1.9], [123.55, 1.9], [122.45, 3.9], [123.55, 3.9]]) b.add(box(x, 0, z, 0.07, z > 3 ? 1.2 : 0.75, 0.07), col("#2b2b30"));
    b.add(box(123.0, 1.12, 3.9, 1.17, 0.07, 0.07), col("#2b2b30")); b.add(box(123.0, 0.68, 1.9, 1.17, 0.07, 0.07), col("#2b2b30"));
    b.add(box(119.9, 0.8, 2.9, 1.3, 0.07, 0.8), woodL); for (const [x, z] of [[119.35, 2.6], [120.45, 2.6], [119.35, 3.2], [120.45, 3.2]]) b.add(box(x, 0, z, 0.08, 0.8, 0.08), wood);
    // ---- a room in Florence (180): terracotta walls, tiled floor; a hotel bed on the left, a studio window on the right ----
    shell(180, 14, 4.55, -12, 7, tiles, col("#c98f68"), 2); dado(180, 14, 4.55, -12, 0.2, wood, wood);
    b.add(box(176.2, 1.1, 4.48, 1.9, 2.6, 0.12), woodL); b.add(box(176.2, 1.22, 4.4, 1.66, 2.36, 0.06), col("#a9d0ee")); b.add(box(176.2, 1.22, 4.36, 0.08, 2.36, 0.05), woodL);
    for (const s of [-1, 1]) b.add(box(176.2 + s * 1.3, 1.1, 4.42, 0.7, 2.6, 0.08), col("#4f7a5a"));
    b.add(box(184.6, 0.35, 3.3, 1.5, 0.3, 2.2), col("#b03a44")); b.add(box(184.6, 0.65, 3.9, 1.2, 0.18, 0.5), col("#d9d2c0")); b.add(box(184.6, 0, 4.3, 1.6, 1.5, 0.1), woodL); b.add(box(184.6, 0, 2.2, 1.6, 0.6, 0.08), woodL);
    for (const [x, z] of [[183.95, 2.3], [185.25, 2.3]]) b.add(box(x, 0, z, 0.09, 0.4, 0.09), wood);
    b.add(box(181.6, 0, 3.9, 1.0, 1.0, 0.6), woodL); b.add(box(181.6, 1.0, 3.9, 1.1, 0.06, 0.66), wood);
    // ---- Picasso's studio (300): pale walls, a tall studio window on the right, canvases stacked against the wall on the left ----
    shell(300, 14, 4.55, -12, 7, planks, col("#c9d2d8"), 3); dado(300, 14, 4.55, -12, 0.2, wood, wood);
    b.add(box(296.2, 0.7, 4.48, 2.6, 4.2, 0.12), woodL); b.add(box(296.2, 0.84, 4.4, 2.3, 3.9, 0.06), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.05, 1.12, 1.2), fog: false }));
    for (const x of [295.45, 296.2, 296.95]) b.add(box(x, 0.84, 4.36, 0.07, 3.9, 0.05), woodL); for (const y of [2.1, 3.4]) b.add(box(296.2, y, 4.36, 2.3, 0.07, 0.05), woodL);
    for (const [x, w, h, yaw, c] of [[304.2, 1.5, 1.9, 0.06, "#f1ecdc"], [304.9, 1.2, 1.5, -0.05, "#e6dcc6"], [305.5, 0.9, 1.2, 0.08, "#d9cfb5"]] as const) { b.add(box(x, 0, 4.3, w + 0.1, h + 0.1, 0.06, yaw), woodL); b.add(box(x, 0.05, 4.24, w, h, 0.04, yaw), col(c)); }
    b.add(box(302.6, 0, 3.6, 0.5, 0.6, 0.5), woodL); b.add(box(302.6, 0.6, 3.6, 0.62, 0.05, 0.62), wood);
    // ---- Geri's shop in Florence (360): dark green walls hung with small pictures, a counter on the left, the street door on the right ----
    shell(360, 14, 4.55, -12, 7, planks, col("#2f5a4a"), 3); dado(360, 14, 4.55, -12, 1.0, wood, gold);
    ([[-1.9, 2.75, 1.0, 1.3], [-0.3, 2.9, 1.2, 0.9], [1.4, 2.7, 0.9, 1.2], [3.0, 2.9, 1.3, 1.0], [4.9, 2.75, 1.0, 1.4], [-0.3, 4.4, 1.6, 1.1], [3.0, 4.5, 1.5, 1.2]] as const).forEach(([x, y, w, h], i) => hang(360 + x, y, w, h, 4.55, 18 + i));
    b.add(box(355.8, 0, 4.48, 1.5, 2.7, 0.12), woodL); b.add(box(355.8, 0.1, 4.42, 1.2, 2.4, 0.06), col("#5a3a26")); b.add(box(355.8, 1.5, 4.38, 0.8, 0.8, 0.04), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.08, 1.02, 0.88), fog: false })); b.add(box(356.25, 1.15, 4.36, 0.08, 0.16, 0.08), gold);
    b.add(box(362.6, 0, 2.6, 2.4, 0.95, 0.7), wood); b.add(box(362.6, 0.95, 2.6, 2.6, 0.07, 0.86), woodL); b.add(box(362.6, 0.2, 2.24, 2.2, 0.55, 0.03), woodL);
    // ---- open country (x = -200, on the far side of the galleries), kept well clear of the two rings of far hills that surround every zone (420 m and 560 m from the origin): grass to the horizon; what stands on it is drawn by the film (monaSets.country) ----
    const grass = lam("meadow", () => ({ map: ctex("meadow", 512, 512, (g, r) => { g.fillStyle = "#7aa95e"; g.fillRect(0, 0, 512, 512); for (let i = 0; i < 900; i++) { const x = r() * 512, y = r() * 512; g.strokeStyle = r() > 0.5 ? "rgba(60,110,50,0.35)" : "rgba(190,220,130,0.3)"; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 3 * (r() - 0.5), y - 7 - 5 * r()); g.stroke(); } }) }));
    b.add(quad(V(-340, 0.02, 330), V(-60, 0.02, 330), V(-60, 0.02, -40), V(-340, 0.02, -40), 56, 74), grass);
    b.add(quad(V(-201.4, 0.03, 60), V(-198.6, 0.03, 60), V(-198.1, 0.03, -40), V(-201.9, 0.03, -40), 1, 20), lam("dirtRoad", () => ({ color: "#cdb48a" })));
    this.flush("louvre", b);
  }
  private buildWojtek() {
    // crates of 25-pounder shells
    const shellTex = ctex("crate25", 512, 256, (g) => {
      g.fillStyle = "#a9814c"; g.fillRect(0, 0, 512, 256);
      for (let i = 0; i < 4; i++) { g.fillStyle = `rgba(${i % 2 ? "255,240,200" : "60,30,10"},0.08)`; g.fillRect(0, i * 64, 512, 64); g.fillStyle = "#5a3a1e"; g.fillRect(0, i * 64, 512, 5); }
      g.strokeStyle = "#5a3a1e"; g.lineWidth = 10; g.strokeRect(5, 5, 502, 246);
      g.fillStyle = "#2c2118"; g.textAlign = "center"; g.textBaseline = "middle"; g.font = "900 110px 'Arial Black', Impact, sans-serif"; g.fillText("25 PDR", 256, 104);
      g.font = "900 50px 'Arial Black', Impact, sans-serif"; g.fillText("4 SHELLS", 256, 200);
    });
    const sm = lam("crate25", () => ({ map: shellTex }));
    for (let i = 0; i < 6; i++) { const c = mesh(box(0, 0, 0, 0.82, 0.42, 0.5), sm); c.visible = false; this.shellCrates.push(c); this.root.add(c); }
    // 25-pounder field gun: wheels, shield, trail, barrel (the barrel slides back on recoil); it points along +z
    const steel = col("#5f6b4a"), dark = col("#3a3d42"), fg = new Batch();
    for (const s of [-1, 1]) { fg.add(new THREE.CylinderGeometry(0.55, 0.55, 0.22, 18).rotateZ(Math.PI / 2).translate(s * 0.95, 0.55, 0), dark); fg.add(new THREE.CylinderGeometry(0.2, 0.2, 0.26, 10).rotateZ(Math.PI / 2).translate(s * 0.95, 0.55, 0), steel); }
    fg.add(box(0, 0.45, 0.05, 1.7, 0.2, 0.5), steel);
    fg.add(box(0, 0.62, 0.42, 1.75, 0.95, 0.07).applyMatrix4(new THREE.Matrix4().makeRotationX(-0.2).setPosition(0, 0.05, 0)), steel);
    for (const s of [-1, 1]) fg.add(new THREE.CylinderGeometry(0.06, 0.06, 2.4, 8).rotateX(Math.PI / 2 - 0.2).translate(s * 0.32, 0.36, -1.25), steel);
    fg.build(this.fieldGun);
    const gb = new Batch();
    gb.add(new THREE.CylinderGeometry(0.075, 0.095, 2.5, 12).rotateX(Math.PI / 2).translate(0, 0, 1.3), dark);
    gb.add(new THREE.CylinderGeometry(0.12, 0.12, 0.3, 12).rotateX(Math.PI / 2).translate(0, 0, 2.6), dark);
    gb.add(box(0, -0.16, 0.1, 0.34, 0.32, 0.8), steel);
    gb.build(this.gunBarrel); this.gunBarrel.rotation.x = -0.32; const gbh = new THREE.Group(); gbh.position.set(0, 0.95, 0); gbh.add(this.gunBarrel); this.fieldGun.add(gbh);
    this.fieldGun.visible = false; this.root.add(this.fieldGun);

    // ---- the quay and the troopship ----
    const d = new Batch(), Zd = this.zones.dock;
    const stone = lam("quayStone", () => ({ map: ctex("quayStone", 512, 512, (g, r) => { g.fillStyle = "#b9b3a6"; g.fillRect(0, 0, 512, 512); for (let i = 0; i < 4; i++) for (let k = 0; k < 4; k++) { g.fillStyle = `rgba(${r() > 0.5 ? "255,250,235" : "70,60,55"},${0.05 + 0.1 * r()})`; g.fillRect(k * 128 + (i % 2) * 64, i * 128, 124, 124); g.strokeStyle = "rgba(90,84,78,0.7)"; g.lineWidth = 5; g.strokeRect(k * 128 + (i % 2) * 64, i * 128, 128, 128); } }) }));
    d.add(quad(V(-60, 0.03, 6), V(60, 0.03, 6), V(60, 0.03, -40), V(-60, 0.03, -40), 20, 8), stone);
    d.add(box(0, 0, 6.1, 120, 0.3, 0.4), col("#6d665c"));
    d.add(quad(V(-700, 0.02, 700), V(700, 0.02, 700), V(700, 0.02, 6.2), V(-700, 0.02, 6.2)), col("#2f7fa6"));
    d.add(box(0, 0.02, 11.5, 34, 3.6, 6.4), col("#3b4252")); d.add(box(0, 0.02, 11.5, 34.2, 0.9, 6.6), col("#9a3b34"));
    d.add(box(0, 3.62, 11.5, 34.6, 0.14, 6.9), col("#c9b891"));
    d.add(box(-2, 3.76, 12, 15, 2.7, 4.4), col("#efe9dc")); d.add(box(-2, 4.6, 9.76, 14, 0.7, 0.08), col("#3f5568")); d.add(box(-2, 6.46, 12, 15.6, 0.16, 5), col("#c9b891"));
    d.add(new THREE.CylinderGeometry(1.15, 1.15, 3.4, 18).translate(-3, 8.3, 12), col("#d9a441")); d.add(new THREE.CylinderGeometry(1.2, 1.2, 0.7, 18).translate(-3, 10.2, 12), col("#2b2b30"));
    d.add(new THREE.CylinderGeometry(0.09, 0.09, 7, 8).translate(9.5, 7.1, 11.5), col("#8a6a44"));
    for (let x = -16; x <= 16.01; x += 2) d.add(box(x, 3.76, 8.45, 0.08, 0.9, 0.08), col("#efe9dc"));
    d.add(box(0, 4.6, 8.45, 32.2, 0.08, 0.08), col("#efe9dc"));
    // gangway from the quay up to the deck
    d.add(new THREE.BoxGeometry(1.5, 0.14, 6.1).applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.atan2(3.6, 4.8)).setPosition(3.2, 1.85, 6.4)), col("#a9794e"));
    for (const x of [-7, 10.5]) d.add(new THREE.CylinderGeometry(0.22, 0.28, 0.6, 12).translate(x, 0.33, 5.3), col("#2b2b30"));
    for (const [x, z, y, yaw] of [[-5.2, 1.4, 0, 0.2], [-4.3, 1.5, 0, -0.1], [-4.8, 1.45, 0.42, 0.05]]) d.add(box(0, 0, 0, 0.82, 0.42, 0.5).applyMatrix4(new THREE.Matrix4().makeRotationY(yaw).setPosition(x, y, z)), sm);
    d.build(Zd);

    // ---- Monte Cassino: the hill, the abbey on top, shell holes of rock in front ----
    const c = new Batch(), Zc = this.zones.cassino;
    c.add(heightfield(-260, 260, 30, 330, 70, 40, (x, z) => hillY(x, z) + 0.02, 16), lam("hillRock", () => ({ map: dryGrassTex(), color: "#b7c08e" })));
    const ay = hillY(0, 232), wall = col("#e9dfc8"), roofc = col("#b56a4a");
    c.add(box(0, ay - 4, 240, 62, 20, 22), wall); c.add(box(-20, ay + 16, 240, 16, 9, 18), wall); c.add(box(14, ay + 16, 242, 22, 5, 16), wall);
    c.add(box(0, ay + 16, 240, 64, 1.2, 23), roofc); c.add(box(-20, ay + 25, 240, 17, 1.2, 19), roofc);
    for (let k = -5; k <= 5; k++) c.add(box(k * 5.2, ay + 5, 228.9, 1.8, 3.2, 0.3), col("#5d6b7a"));
    for (const [x, z, s, n] of [[-7, 9, 1.4, 1], [8.5, 12, 1.1, 2], [-12, 20, 1.8, 3], [13, 24, 1.5, 4], [-5.5, -4, 0.9, 5], [6.5, -5, 1.0, 6], [-16, 6, 1.2, 7], [17, 4, 1.3, 8]]) rock(c, x, z, s, n);
    for (const [x, z, h, s] of [[-18, 14, 7, 1], [19, 18, 8, 2], [-26, 30, 9, 3], [27, 34, 8, 5], [-11, -9, 7, 6], [12, -10, 8, 7]]) gum(c, x, z, h, s);
    for (const [x, z, s] of [[-9.5, 2, 1.0], [10.5, 3, 0.9], [-14, 12, 1.3], [15, 14, 1.2], [-4.5, 14, 0.8], [5.5, 16, 0.9]]) bush(c, x, z, s, Math.round(Math.abs(x * 5 + z)));
    this.scatter(c, 80, 71, [-150, 150, 40, 200], (x) => Math.abs(x) > 6, (x, z) => hillY(x, z), 0.35);
    this.flush("cassino", c);

    // ---- Edinburgh Zoo: a grassy enclosure with rocks and a pool behind a rail ----
    const z = new Batch(), Zz = this.zones.zoo;
    z.add(quad(V(-40, 0.03, 30), V(40, 0.03, 30), V(40, 0.03, 0.6), V(-40, 0.03, 0.6), 10, 5), lam("zooGrass", () => ({ map: dryGrassTex(), color: "#9cc070" })));
    z.add(quad(V(-40, 0.028, 0.6), V(40, 0.028, 0.6), V(40, 0.028, -30), V(-40, 0.028, -30), 20, 8), stone);
    const rk = col("#9c978f");
    for (const [x, zz, sx, sy, sz] of [[-7, 13, 5, 3.4, 3], [0, 15, 6, 4.6, 3.4], [7.5, 13.5, 5, 3.2, 3], [-13, 11, 4, 2.4, 2.6], [13.5, 11.5, 4, 2.6, 2.6], [3.5, 11.2, 2.4, 1.3, 1.8]]) z.add(new THREE.SphereGeometry(1, 14, 10).applyMatrix4(new THREE.Matrix4().compose(V(x, sy * 0.35, zz), new THREE.Quaternion(), V(sx, sy, sz))), rk);
    const pool = mesh(new THREE.CircleGeometry(2.6, 32).rotateX(-Math.PI / 2), lam("damWater", () => ({ map: waterTex() })), false); pool.position.set(-4.6, 0.045, 6.2); pool.scale.set(1.3, 1, 0.8); Zz.add(pool);
    z.add(new THREE.CylinderGeometry(0.28, 0.32, 3.2, 10).rotateZ(Math.PI / 2 - 0.12).translate(4.4, 0.42, 5.2), col("#8a5a34"));
    const rail = col("#3f5f4a");
    for (let x = -14; x <= 14.01; x += 2) z.add(box(x, 0, 0.6, 0.12, 1.15, 0.12), rail);
    for (const y of [0.45, 1.1]) z.add(box(0, y, 0.6, 28.2, 0.08, 0.08), rail);
    for (const [x, zz, h, s] of [[-17, 16, 9, 1], [18, 17, 10, 2], [-22, 4, 8, 3], [23, 6, 9, 4]]) gum(z, x, zz, h, s);
    for (const [x, zz, s] of [[-10, 8.5, 1.1], [10.5, 8, 1.0], [-15.5, 2.2, 1.2], [16, 2.4, 1.1]]) bush(z, x, zz, s, Math.round(Math.abs(x * 3 + zz)));
    this.flush("zoo", z);

    // ---- Scotland: the green farm where the company was stationed and, further along (x = 60), the park with the statues ----
    const sc = new Batch();
    sc.add(quad(V(-300, 0.03, 420), V(300, 0.03, 420), V(300, 0.03, -90), V(-300, 0.03, -90), 70, 50), lam("scotGrass", () => ({ map: dryGrassTex(), color: "#7cc45e" })));
    farmhouse(sc, -8, 16); fence(sc, -44, 30, 9.5, -2.5, 3.5);
    for (const [x, zz, h, s] of [[9, 19, 9, 3], [-20, 21, 10, 5], [17, 24, 8, 6], [60 - 7, 13, 10, 7], [60 + 7.5, 14, 9, 8], [60, 19, 11, 9]]) gum(sc, x, zz, h, s);
    for (const [x, zz, s] of [[4.5, 11, 1.1], [-13, 12.5, 1.3], [12, 8, 0.9], [60 - 4.6, 6.5, 1.2], [60 + 4.8, 7, 1.1], [60 - 9, 3, 0.9], [60 + 9.5, 4, 1.0]]) bush(sc, x, zz, s, Math.round(Math.abs(x * 3 + zz)));
    const pl = col("#b9b3a6"), plb = col("#8f897c");
    for (const sx of [-1, 1]) { sc.add(box(60 + sx * 1.9, 0, 3, 1.9, 0.2, 1.7), plb); sc.add(box(60 + sx * 1.9, 0.2, 3, 1.5, 0.9, 1.3), pl); }
    this.flush("scot", sc);

    // ---- San Juan Island (the Pig War): a farm with a potato patch (x = 0), the two camps (x = -100), the shore and the strait (x = 100) ----
    const is = new Batch();
    is.add(quad(V(-300, 0.03, 60), V(300, 0.03, 60), V(300, 0.03, -90), V(-300, 0.03, -90), 70, 18), lam("isleGrass", () => ({ map: dryGrassTex(), color: "#86c266" })));
    is.add(quad(V(-300, 0.026, 64), V(300, 0.026, 64), V(300, 0.026, 60), V(-300, 0.026, 60)), col("#e6d7a8"));
    is.add(quad(V(-900, 0.02, 1500), V(900, 0.02, 1500), V(900, 0.02, 64), V(-900, 0.02, 64)), col("#2f86b0"));
    farmhouse(is, -9, 17); fence(is, -3, 9, 5.6);
    is.add(quad(V(-0.6, 0.04, 4.6), V(5.6, 0.04, 4.6), V(5.6, 0.04, 0.4), V(-0.6, 0.04, 0.4)), col("#8a5a3a"));
    for (let r = 0; r < 4; r++) is.add(quad(V(-0.4, 0.045, 1.0 + r * 1.0 + 0.12), V(5.4, 0.045, 1.0 + r * 1.0 + 0.12), V(5.4, 0.045, 1.0 + r * 1.0 - 0.12), V(-0.4, 0.045, 1.0 + r * 1.0 - 0.12)), col("#734a2e"));
    is.add(quad(V(60, 0.045, 15), V(140, 0.045, 15), V(140, 0.045, 12), V(60, 0.045, 12)), col("#e6d7a8"));
    is.add(quad(V(60, 0.04, 64.5), V(140, 0.04, 64.5), V(140, 0.04, 15), V(60, 0.04, 15)), col("#2f86b0"));
    tent(is, -102.2, 11, 0.2); tent(is, -97.8, 11, -0.2);
    for (const [x, zz, h, s] of [[9, 20, 9, 3], [-21, 22, 10, 5], [15, 26, 8, 6], [-112, 14, 10, 7], [-88, 15, 9, 8], [-100, 22, 11, 9], [84, -8, 9, 4], [118, -9, 10, 2]]) gum(is, x, zz, h, s);
    for (const [x, zz, s] of [[7.5, 9, 1.0], [-14, 12, 1.3], [-108, 9, 1.0], [-92, 10, 1.1], [-100, 12, 1.2], [88, 9.5, 1.0], [112, 10, 1.1]]) bush(is, x, zz, s, Math.round(Math.abs(x * 3 + zz)));
    this.flush("isle", is);

    // ---- Paris, 1925: a paved square, a row of pale stone houses with grey roofs, plane trees, lamp posts (the tower is a drawing placed by the film) ----
    const pa = new Batch(), wallP = col("#e9dfc8"), roofP = col("#6f7c8c"), winP = col("#51627a"), doorP = col("#7a4a2c");
    pa.add(quad(V(-200, 0.03, 260), V(200, 0.03, 260), V(200, 0.03, -60), V(-200, 0.03, -60), 60, 48), stone);
    for (let k = -4; k <= 4; k++) {
      if (k === 0) continue;
      const x = k * 15 + (k > 0 ? 6 : -6), h = 13 + ((k * 7 + 20) % 4);
      pa.add(box(x, 0, 46, 14, h, 12), wallP); pa.add(box(x, h, 46, 14.6, 2.6, 12.6), roofP);
      for (let fl = 0; fl < 4; fl++) for (let w = -2; w <= 2; w++) if (fl || w) pa.add(box(x + w * 2.5, 1.2 + fl * 3.1, 39.9, 1.2, 1.9, 0.2), winP);
      pa.add(box(x, 0, 39.9, 1.6, 2.6, 0.2), doorP);
    }
    for (const [x, zz] of [[-3.6, 14], [3.6, 14], [-8, 24], [8, 24], [-14, 9], [14, 9]]) { pa.add(new THREE.CylinderGeometry(0.09, 0.12, 4.2, 8).translate(x, 2.1, zz), col("#2b2b30")); pa.add(new THREE.SphereGeometry(0.32, 10, 8).translate(x, 4.4, zz), col("#f6e7b0")); }
    for (const [x, zz, h, s] of [[-20, 18, 9, 3], [20, 19, 10, 5], [-30, 30, 11, 6], [31, 31, 10, 7], [-11, 30, 9, 8], [12, 31, 9, 9]]) gum(pa, x, zz, h, s);
    this.flush("paris", pa);
  }

  private poseWheat(id: number, f: number) {
    const P = this.wheatPos, up = V(0, 1, 0), zero = this.s3;
    for (let i = 0; i < this.wheatN; i++) {
      const x = P[i * 4], z = P[i * 4 + 1], k = this.show.wheatAt(id, f, x, z), s = P[i * 4 + 3];
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
