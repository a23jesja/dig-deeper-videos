// The Western Australian wheatbelt as one three.js scene: sky, red dirt, the wheat field and its broken fence, the
// road, farmhouse, tank, windmill, gum trees, the dam, plus the posed props (Lewis guns, lorry, brass heap, cartridge
// bench, scoreboard) and the cast. update(id, f, camera) poses everything for shot `id` at frame f (pure function).
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { Batch, boxGeo, V, lam } from "./build";
import { ctex, rng, cloudHD } from "./paint";
import { Pen } from "./toon";
import { emuSide } from "./critters";
import { LIGHTS, LOOK, LightPreset } from "./lights";
import { TONE, CHAR, twoTone, untone } from "./shade";
import { NOINK } from "./ink";
import { Pool, Actor, Fx, stage, propsAt, SU, GunPose } from "./cast";
import { FPS, SHOTS, camAt, V3, ShotDef, FENCE_Z, GAP, ROAD_Z, DAM, FARM, HEAP, smooth } from "./story";

export type Kit = Record<string, never>;
export const loadKit = () => Promise.resolve({} as Kit);

/** sun disc (solid, soft rim) and the flat golden halo (lighting.md 6 / depth.md 6.4: r50 13-26 % of the frame width) */
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
// ---------------- painted textures ----------------
const dirtTex = () => ctex("dirtHD", 1024, 1024, (g, r) => {
  g.fillStyle = "#c98a55"; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 60; i++) { const x = r() * 1024, y = r() * 1024, R = 60 + r() * 180; const gr = g.createRadialGradient(x, y, 0, x, y, R);
    const c = r() > 0.5 ? "214,154,98" : "176,112,66"; for (const ox of [-1024, 0, 1024]) for (const oy of [-1024, 0, 1024]) { const gr2 = g.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, R); gr2.addColorStop(0, `rgba(${c},0.38)`); gr2.addColorStop(1, `rgba(${c},0)`); g.fillStyle = gr2; g.fillRect(x + ox - R, y + oy - R, 2 * R, 2 * R); } void gr; }
  for (let i = 0; i < 900; i++) { g.fillStyle = r() > 0.5 ? "rgba(150,92,54,0.5)" : "rgba(226,172,118,0.5)"; g.beginPath(); g.ellipse(r() * 1024, r() * 1024, 2 + r() * 5, 1.5 + r() * 3, r() * 3, 0, 7); g.fill(); }
  g.lineCap = "round";
  for (let i = 0; i < 620; i++) { const x = r() * 1024, y = r() * 1024; g.strokeStyle = "rgba(196,170,96,0.55)"; g.lineWidth = 2; g.beginPath(); g.moveTo(x - 4, y); g.lineTo(x, y - 12 - r() * 8); g.lineTo(x + 5, y); g.stroke(); }
});
const roadTex = () => ctex("roadHD", 512, 512, (g, r) => {
  g.fillStyle = "#dba777"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 500; i++) { g.fillStyle = r() > 0.5 ? "rgba(178,122,80,0.45)" : "rgba(238,196,150,0.45)"; g.beginPath(); g.ellipse(r() * 512, r() * 512, 2 + r() * 6, 1.5 + r() * 3, 0, 0, 7); g.fill(); }
  for (const y of [150, 362]) { g.fillStyle = "rgba(150,96,60,0.4)"; g.fillRect(0, y - 26, 512, 52); g.fillStyle = "rgba(120,74,46,0.35)"; for (let x = 0; x < 512; x += 16) g.fillRect(x, y - 22, 7, 44); }
});
const wheatTex = () => ctex("wheatHD", 512, 512, (g, r) => {
  g.fillStyle = "#e0ae3c"; g.fillRect(0, 0, 512, 512);
  g.lineCap = "round";
  for (let i = 0; i < 420; i++) { const x = r() * 512, y = r() * 512, h = 40 + r() * 70; g.strokeStyle = ["rgba(246,208,96,0.8)", "rgba(190,138,40,0.7)", "rgba(232,184,66,0.8)"][i % 3]; g.lineWidth = 3 + r() * 3;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 14, y - h); g.stroke(); }
  for (let i = 0; i < 160; i++) { const x = r() * 512, y = r() * 512; g.fillStyle = "rgba(252,224,124,0.9)"; g.beginPath(); g.ellipse(x, y, 4, 11, (r() - 0.5) * 0.6, 0, 7); g.fill(); }
});
const sheafTex = () => ctex("sheaf", 384, 512, (g, r) => {
  const p = new Pen(g);
  g.clearRect(0, 0, 384, 512);
  for (let i = 0; i < 9; i++) {
    const bx = 192 + (i - 4) * 9, tx = 192 + (i - 4) * 36 + (r() - 0.5) * 20, ty = 70 + Math.abs(i - 4) * 22 + r() * 30;
    const mx = (bx + tx) / 2 + (i - 4) * 4, my = (512 + ty) / 2;
    const st: [number, number][] = [[bx, 512], [mx, my], [tx, ty + 60]];
    p.stroke(st, 15, "#241726"); p.stroke(st, 8, i % 2 ? "#d9a53a" : "#e9bd4e");
    const a = Math.atan2(ty + 60 - my, tx - mx) * 180 / Math.PI + 90;
    p.ell(tx, ty + 30, 15, 46, i % 2 ? "#f2cc5c" : "#e8b944", 6, 0, 360, a);
    p.stroke([[tx - 6, ty + 14], [tx + 6, ty + 26]], 3, "#b98524"); p.stroke([[tx - 6, ty + 34], [tx + 6, ty + 46]], 3, "#b98524");
  }
});
const ironTex = (key: string, base: string, dark: string) => ctex(key, 256, 256, (g) => {
  g.fillStyle = base; g.fillRect(0, 0, 256, 256);
  for (let x = 0; x < 256; x += 32) { const gr = g.createLinearGradient(x, 0, x + 32, 0); gr.addColorStop(0, dark); gr.addColorStop(0.5, base); gr.addColorStop(1, dark); g.fillStyle = gr; g.globalAlpha = 0.55; g.fillRect(x, 0, 32, 256); g.globalAlpha = 1; }
});
const boardsTex = (key: string, base: string, line: string, n = 8) => ctex(key, 256, 256, (g, r) => {
  g.fillStyle = base; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < n; i++) { g.fillStyle = `rgba(255,255,255,${0.04 + r() * 0.08})`; g.fillRect(0, (i * 256) / n, 256, 256 / n - 3); g.fillStyle = line; g.fillRect(0, ((i + 1) * 256) / n - 3, 256, 3); }
});
const waterTex = () => ctex("damWater", 512, 512, (g, r) => {
  g.fillStyle = "#4f9fc4"; g.fillRect(0, 0, 512, 512);
  g.lineCap = "round";
  for (let i = 0; i < 46; i++) { const x = r() * 512, y = r() * 512, w = 30 + r() * 60; g.strokeStyle = i % 3 ? "rgba(190,232,244,0.75)" : "rgba(40,110,160,0.6)"; g.lineWidth = 5; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + w / 2, y - 7, x + w, y); g.stroke(); }
});
const tallyTex = () => ctex("tally", 512, 512, (g) => {
  g.fillStyle = "#b98a55"; g.fillRect(0, 0, 512, 512);
  g.fillStyle = "#8a6238"; for (const y of [0, 164, 338, 500]) g.fillRect(0, y, 512, 12);
  g.fillStyle = "#9b7044"; g.fillRect(0, 0, 26, 512); g.fillRect(486, 0, 26, 512);
  g.strokeStyle = "#f6f1e4"; g.lineWidth = 17; g.lineCap = "round";
  // seven chalk tally marks: one gate of five (four + slash) and two more = one week
  [80, 130, 180, 230].forEach((x, i) => { g.beginPath(); g.moveTo(x, 150 + (i % 2) * 8); g.lineTo(x + 6, 362); g.stroke(); });
  g.beginPath(); g.moveTo(52, 318); g.lineTo(268, 190); g.stroke();
  [330, 384].forEach((x, i) => { g.beginPath(); g.moveTo(x, 152 + i * 6); g.lineTo(x + 5, 360); g.stroke(); });
});
/** scoreboard face: left half the army's slouch hat, right half an emu; numbers appear on cue */
const boardTex = (a: number, e: number) => ctex(`score${a}${e}`, 1024, 512, (g) => {
  g.fillStyle = "#2f4a3a"; g.fillRect(0, 0, 1024, 512);
  g.strokeStyle = "#e9dcc0"; g.lineWidth = 12; g.strokeRect(22, 22, 980, 468);
  g.beginPath(); g.moveTo(512, 40); g.lineTo(512, 472); g.stroke();
  const p = new Pen(g);
  // slouch hat (the army)
  g.save(); g.translate(170, 262); g.scale(1.7, 1.7);
  p.poly([[-78, 20], [78, 20], [70, 34], [-70, 34]], "#6f6442", 7); p.poly([[-44, 20], [-40, -40], [-8, -30], [8, -30], [40, -40], [44, 20]], "#9a8a5c", 7);
  p.poly([[46, 22], [84, 16], [64, -26], [46, -8]], "#9a8a5c", 7);
  g.restore();
  // emu
  g.save(); g.translate(530, 36); g.scale(0.44, 0.44); emuSide(p, { mode: "stand" }); g.restore();
  g.fillStyle = "#f6f1e4"; g.font = "bold 330px Georgia, serif"; g.textAlign = "center"; g.textBaseline = "middle";
  if (a) g.fillText("0", 400, 275);
  if (e) g.fillText("1", 900, 275);
});

const cyl = (r0: number, r1: number, h: number, seg = 12) => new THREE.CylinderGeometry(r0, r1, h, seg);
const M4 = (x: number, y: number, z: number, ry = 0, rx = 0, rz = 0, s: number | [number, number, number] = 1) =>
  new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, "YXZ")), Array.isArray(s) ? V(...s) : V(s, s, s));
const beamBetween = (a: THREE.Vector3, b: THREE.Vector3, th: number) => {
  const g = new THREE.BoxGeometry(th, a.distanceTo(b), th);
  return g.applyMatrix4(new THREE.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5), new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), b.clone().sub(a).normalize()), V(1, 1, 1)));
};
const hh = (i: number, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };
const shadowAll = (o: THREE.Object3D) => o.traverse((c) => { c.castShadow = true; c.receiveShadow = true; });

type Mats = Record<string, THREE.Material>;
const mats = (): Mats => {
  const M: Mats = {};
  const tex = (t: THREE.Texture, a = 16) => { t.anisotropy = a; t.needsUpdate = true; return t; };
  M.dirt = lam("dirtHD", () => ({ map: tex(dirtTex()) }));
  M.road = lam("roadHD", () => ({ map: tex(roadTex()) }));
  M.wheat = twoTone(new THREE.MeshLambertMaterial({ map: tex(wheatTex()) }), 3);
  M.stubble = lam("stubble", () => ({ color: "#c79a52" }));
  M.post = lam("post", () => ({ color: "#8a6a4c" }));
  M.wire = lam("wire", () => ({ color: "#5a5560" }));
  M.wall = lam("wallB", () => ({ map: boardsTex("wallB", "#eadfc6", "rgba(120,100,80,0.55)") }));
  M.roof = lam("roofI", () => ({ map: ironTex("roofI", "#b4553e", "#7e3526") }));
  M.tank = lam("tankI", () => ({ map: ironTex("tankI", "#aab2b8", "#6f7a84") }));
  M.wood = lam("woodP", () => ({ map: boardsTex("woodP", "#b98a55", "rgba(90,60,34,0.6)", 5) }));
  M.dark = lam("darkW", () => ({ color: "#4a3a34" }));
  M.glass = lam("glassW", () => ({ color: "#7fa3c4" }));
  M.trunk = lam("trunk", () => ({ color: "#d9cdb8" }));
  M.leaf = lam("leaf", () => ({ color: "#7f9a55" }));
  M.leaf2 = lam("leaf2", () => ({ color: "#93a862" }));
  M.scrub = lam("scrub", () => ({ color: "#9aa06a" }));
  M.hill = lam("hill", () => ({ color: "#c79a72" }));
  M.mud = lam("mud", () => ({ color: "#9a6a48" }));
  M.reed = lam("reed", () => ({ color: "#8fa04e" }));
  M.water = lam("waterD", () => ({ map: tex(waterTex()) }));
  M.steel = twoTone(new THREE.MeshPhongMaterial({ color: "#4a4e58", specular: "#9a9a9a", shininess: 50 }), 0.15);
  M.gunwood = lam("gunwood", () => ({ color: "#b06c38" }));
  M.brass = twoTone(new THREE.MeshPhongMaterial({ color: "#d9a938", specular: "#6a5a28", shininess: 22 }), 0.3);
  M.copper = twoTone(new THREE.MeshPhongMaterial({ color: "#c0683a", specular: "#ffd0a0", shininess: 60 }), 0.3);
  M.army = lam("army", () => ({ color: "#66754f" }));
  M.armyD = lam("armyD", () => ({ color: "#4c583c" }));
  M.tyre = lam("tyre", () => ({ color: "#3a3638" }));
  M.hub = lam("hub", () => ({ color: "#b7b0a2" }));
  M.lamp = lam("lamp", () => ({ color: "#f3e3a0" }));
  return M;
};

/** Lewis gun: pivot at the origin, barrel along +z. Returns the body (pitch it) and the pan magazine (spin it). */
const makeGun = (M: Mats) => {
  const body = new THREE.Group(), add = (g: THREE.BufferGeometry, m: THREE.Material, mx?: THREE.Matrix4) => { if (mx) g.applyMatrix4(mx); const o = new THREE.Mesh(g, m); body.add(o); return o; };
  add(new THREE.BoxGeometry(0.11, 0.15, 0.46), M.steel, M4(0, 0.05, 0.02));
  add(cyl(0.072, 0.072, 0.66, 14), M.steel, M4(0, 0.06, 0.55, 0, Math.PI / 2));
  add(cyl(0.085, 0.072, 0.07, 14), M.steel, M4(0, 0.06, 0.9, 0, Math.PI / 2));
  add(cyl(0.03, 0.03, 0.1, 8), M.dark, M4(0, 0.06, 0.96, 0, Math.PI / 2));
  add(new THREE.BoxGeometry(0.075, 0.13, 0.42), M.gunwood, M4(0, 0.0, -0.4, 0, 0.12));
  add(new THREE.BoxGeometry(0.05, 0.16, 0.07), M.gunwood, M4(0, -0.1, -0.12, 0, 0.3));
  const pan = new THREE.Group();
  const disc = new THREE.Mesh(cyl(0.19, 0.19, 0.06, 20), M.steel); pan.add(disc);
  for (let i = 0; i < 6; i++) { const r = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.022, 0.17), M.dark); r.position.set(Math.sin((i * Math.PI) / 3) * 0.09, 0.036, Math.cos((i * Math.PI) / 3) * 0.09); r.rotation.y = (i * Math.PI) / 3; pan.add(r); }
  pan.position.set(0, 0.16, 0.06); body.add(pan);
  return { body, pan };
};
const makeTripod = (M: Mats) => {
  const g = new THREE.Group();
  for (let i = 0; i < 3; i++) { const a = (i * 2 * Math.PI) / 3 + Math.PI; g.add(new THREE.Mesh(beamBetween(V(0, 1.12, 0), V(Math.sin(a) * 0.62, 0, Math.cos(a) * 0.62), 0.05), M.steel)); }
  const h = new THREE.Mesh(cyl(0.06, 0.08, 0.14, 10), M.steel); h.position.y = 1.12; g.add(h);
  return g;
};
const makeTruck = (M: Mats) => {
  const g = new THREE.Group(), b = new Batch();
  b.add(boxGeo(V(-1.0, 0.5, -0.5), V(4.0, 0.68, 0.5), 0, true), M.armyD);
  b.add(boxGeo(V(-1.25, 0.86, -1.0), V(1.85, 1.0, 1.0), 1, true), M.wood);
  for (const z of [-1.0, 0.94]) b.add(boxGeo(V(-1.25, 1.0, z), V(1.85, 1.3, z + 0.06), 1), M.wood);
  b.add(boxGeo(V(-1.25, 1.0, -1.0), V(-1.19, 1.3, 1.0), 1), M.wood);
  b.add(boxGeo(V(1.9, 0.68, -0.85), V(2.02, 1.95, 0.85), 0, true), M.army);         // cab back
  b.add(boxGeo(V(2.05, 0.68, -0.8), V(2.95, 1.0, 0.8), 0, true), M.dark);           // seat
  b.add(boxGeo(V(1.9, 1.95, -0.9), V(3.35, 2.03, 0.9), 0, true), M.army);          // roof
  for (const z of [-0.84, 0.78]) b.add(boxGeo(V(3.27, 1.3, z), V(3.33, 1.95, z + 0.06)), M.armyD); // screen posts
  b.add(boxGeo(V(3.2, 0.68, -0.85), V(3.32, 1.32, 0.85), 0, true), M.army);         // scuttle
  b.add(boxGeo(V(3.32, 0.68, -0.5), V(4.35, 1.28, 0.5), 0, true), M.army);          // bonnet
  b.add(boxGeo(V(4.35, 0.7, -0.46), V(4.43, 1.3, 0.46), 0, true), M.hub);           // radiator
  for (const z of [-0.72, 0.72]) { b.add(new THREE.SphereGeometry(0.13, 12, 8), M.lamp, M4(4.4, 1.05, z)); b.add(boxGeo(V(3.1, 0.92, z - 0.2 + (z > 0 ? 0.12 : -0.12)), V(4.2, 0.98, z + 0.2 + (z > 0 ? 0.12 : -0.12))), M.armyD); }
  b.add(cyl(0.06, 0.06, 0.92, 8), M.steel, M4(0.95, 1.46, 0));                      // gun pedestal
  b.add(new THREE.TorusGeometry(0.2, 0.03, 6, 14), M.dark, M4(3.05, 1.42, 0.38, Math.PI / 2, 0.5));
  b.build(g);
  const wheels: THREE.Object3D[] = [];
  for (const x of [0, 3.6]) for (const z of [-0.86, 0.86]) {
    const w = new THREE.Group();
    const t = new THREE.Mesh(cyl(0.44, 0.44, 0.24, 18), M.tyre); t.rotation.x = Math.PI / 2; w.add(t);
    const h = new THREE.Mesh(cyl(0.2, 0.2, 0.26, 10), M.hub); h.rotation.x = Math.PI / 2; w.add(h);
    for (let i = 0; i < 4; i++) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.6, 0.27), M.hub); s.rotation.z = (i * Math.PI) / 4; w.add(s); }
    w.position.set(x, 0.44, z); wheels.push(w); g.add(w);
  }
  const gun = makeGun(M); gun.body.position.set(0.95, 1.98, 0); gun.body.rotation.order = "YXZ"; g.add(gun.body);
  shadowAll(g);
  return { g, wheels, gun: gun.body };
};
const gumTree = (b: Batch, M: Mats, x: number, z: number, h: number, seed: number) => {
  const lean = (hh(seed, 1) - 0.5) * 0.5, top = V(x + lean * h * 0.5, h * 0.62, z + (hh(seed, 2) - 0.5) * 0.6);
  b.add(beamBetween(V(x, 0, z), V(x + lean * h * 0.25, h * 0.36, z), 0.09 * h), M.trunk);
  b.add(beamBetween(V(x + lean * h * 0.25, h * 0.33, z), top, 0.065 * h), M.trunk);
  b.add(beamBetween(V(x + lean * h * 0.25, h * 0.36, z), V(x - lean * h * 0.4 - 0.2 * h, h * 0.66, z + 0.1 * h), 0.045 * h), M.trunk);
  const blobs: [number, number, number, number][] = [[top.x, h * 0.82, top.z, 0.3], [top.x + 0.22 * h, h * 0.72, top.z + 0.05 * h, 0.22], [x - lean * h * 0.4 - 0.22 * h, h * 0.74, z + 0.1 * h, 0.22], [top.x - 0.1 * h, h * 0.94, top.z - 0.08 * h, 0.2]];
  blobs.forEach(([bx, by, bz, r], i) => b.add(new THREE.IcosahedronGeometry(r * h, 1), i % 2 ? M.leaf2 : M.leaf, M4(bx, by, bz, seed + i, 0, 0, [1.25, 0.72, 1.1])));
};

export class World {
  root = new THREE.Group();
  private pool = new Pool();
  private actors: Actor[] = [];
  private fxs: Fx[] = [];
  private hemi: THREE.HemisphereLight; private sun: THREE.DirectionalLight; private fill: THREE.DirectionalLight;
  private sky: THREE.Mesh; private skyMat: THREE.ShaderMaterial;
  private fog = new THREE.Fog("#bccbec", 25, 420);
  private sunDisc: THREE.Sprite; private sunHalo: THREE.Sprite;
  private sunCache = new Map<number, THREE.Vector3>();
  private cloudMaps: Record<"day" | "golden", THREE.Texture[]>;
  private clouds: THREE.Mesh[] = [];
  private frustum = new THREE.Frustum();
  private m4 = new THREE.Matrix4(); private v = new THREE.Vector3(); private sph = new THREE.Sphere();
  private guns: { g: THREE.Group; body: THREE.Group; pan: THREE.Group; tripod: THREE.Group }[] = [];
  private truck: ReturnType<typeof makeTruck>;
  private heap = new THREE.Group(); private bench = new THREE.Group(); private carts: THREE.Object3D[] = [];
  private board = new THREE.Group(); private boardMat: THREE.MeshBasicMaterial;
  private tufts: THREE.InstancedMesh; private tuftAt: { x: number; z: number; s: number; ry: number; edible: number }[] = [];
  private fan = new THREE.Group(); private waterMap: THREE.Texture;
  private geos: Record<string, THREE.BufferGeometry>;

  constructor(_kit: Kit) {
    const R = this.root, M = mats();
    // ---- sky + light ----
    // sky: 5 colour stops by elevation (textures.md 5.2 #5 + depth.md 2/6.5), written as tone-map-inverted linear values
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
    this.sunHalo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex(), color: new THREE.Color(1, 1, 1), fog: false, depthWrite: false, depthTest: true,
      transparent: true, blending: THREE.AdditiveBlending }));
    this.sunDisc.renderOrder = -0.5; this.sunHalo.renderOrder = 5;
    for (const m of [this.sunDisc, this.sunHalo]) { m.frustumCulled = false; m.layers.set(NOINK); R.add(m); }
    this.hemi = new THREE.HemisphereLight("#cfe6ff", "#6c5c8c", 1.1);
    this.sun = new THREE.DirectionalLight("#fff0d6", 2.6);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(4096, 4096);
    this.fill = new THREE.DirectionalLight("#9fb8ff", 0.35);
    R.add(this.hemi, this.sun, this.sun.target, this.fill, this.fill.target);
    this.cloudMaps = { day: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.day.cloud)), golden: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.golden.cloud)) };
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2 + 0.3, d = 620 + (i % 3) * 60;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: this.cloudMaps.day[i % 4], color: new THREE.Color(1.1, 1.1, 1.1), transparent: true, depthWrite: false, fog: false }));
      const w = 130 + (i % 4) * 30;
      m.position.set(Math.cos(a) * d, 120 + (i % 4) * 38, Math.sin(a) * d); m.scale.set(w, w / 2, 1);
      m.layers.set(NOINK);
      this.clouds.push(m); R.add(m);
    }


    // ---- ground, road, wheat ----
    const b = new Batch();
    const flat = (x0: number, x1: number, z0: number, z1: number, y: number, tile: number) => { const g = boxGeo(V(x0, y - 0.5, z0), V(x1, y, z1), tile); return g; };
    b.add(flat(-900, 900, -900, 900, 0, 6), M.dirt);
    b.add(flat(-900, 900, ROAD_Z - 2.6, ROAD_Z + 2.6, 0.012, 5.2), M.road);
    const r = rng(7);
    // wheat: long rows (boxes) to the horizon, single tufts where the birds eat (those can disappear)
    const wb = new Batch();
    for (let z = FENCE_Z + 0.9; z < 132; z += 1.15) {
      const h = 0.72 + 0.1 * r();
      if (z < 25) { wb.add(boxGeo(V(-70, 0, z), V(-24.5, h, z + 0.72), 1.4), M.wheat); wb.add(boxGeo(V(24.5, 0, z), V(70, h, z + 0.72), 1.4), M.wheat); }
      else wb.add(boxGeo(V(-70, 0, z), V(70, h, z + 0.72), 1.4), M.wheat);
    }
    const rows = new THREE.Group(); wb.build(rows); rows.traverse((o) => o.layers.set(NOINK)); R.add(rows);
    for (let z = FENCE_Z + 0.75; z < 25; z += 0.42) for (let x = -24.2; x < 24.3; x += 0.42) {
      const px = x + (r() - 0.5) * 0.3, pz = z + (r() - 0.5) * 0.3;
      const near = Math.min(...[1.3, 0.0, -1.25].map((ex, k) => Math.hypot(px - ex - (k === 0 ? -0.6 : 0.6), (pz - [13.4, 14.0, 13.3][k]) * 0.9)));
      this.tuftAt.push({ x: px, z: pz, s: 0.85 + r() * 0.4, ry: r() * 3, edible: near < 1.0 ? 0.15 + 0.6 * (near / 1.0) + 0.2 * r() : 9 });
    }
    const p1 = new THREE.PlaneGeometry(0.72, 0.96); p1.translate(0, 0.48, 0);
    const p2 = p1.clone(); p2.rotateY(Math.PI / 2);
    const tg = mergeGeometries([p1, p2], false);
    const sheafM = twoTone(new THREE.MeshLambertMaterial({ map: sheafTex(), alphaTest: 0.5, side: THREE.DoubleSide }));
    this.tufts = new THREE.InstancedMesh(tg, sheafM, this.tuftAt.length);
    this.tufts.layers.set(NOINK);
    this.tufts.castShadow = true; this.tufts.receiveShadow = true; this.tufts.frustumCulled = false; R.add(this.tufts);
    // ---- fence along the field, broken where the mob walks in ----
    for (let x = -70; x <= 70; x += 2.5) {
      const inGap = x > GAP[0] - 0.1 && x < GAP[1] + 0.1;
      if (!inGap) b.add(boxGeo(V(x - 0.07, 0, FENCE_Z - 0.07), V(x + 0.07, 1.25, FENCE_Z + 0.07), 0), M.post);
      else if (Math.abs(x) > 2) b.add(beamBetween(V(x, 0, FENCE_Z), V(x + (x > 0 ? 0.5 : -0.5), 0.75, FENCE_Z + 0.85), 0.14), M.post);
      if (x < 70 && !(x + 2.5 > GAP[0] && x < GAP[1])) for (const y of [0.45, 0.8, 1.12]) b.add(boxGeo(V(x, y - 0.012, FENCE_Z - 0.012), V(x + 2.5, y + 0.012, FENCE_Z + 0.012)), M.wire);
    }
    for (const s of [-1, 1]) for (const y of [0.45, 0.8]) b.add(beamBetween(V(s * (GAP[1] + 0.9), y, FENCE_Z), V(s * (GAP[1] - 1.2), 0.03, FENCE_Z - 0.9 - y), 0.03), M.wire);
    // ---- farmhouse, tank, windmill ----
    {
      const [fx, , fz] = FARM;
      b.add(boxGeo(V(fx - 4.5, 0, fz), V(fx + 4.5, 3.1, fz + 6.5), 1.6), M.wall);
      b.add(boxGeo(V(fx - 5.2, 2.9, fz - 2.6), V(fx + 5.2, 3.05, fz + 0.2), 1.2), M.roof); // verandah roof
      for (let k = 0; k < 5; k++) b.add(boxGeo(V(fx - 5 + k * 2.47, 0, fz - 2.5), V(fx - 4.86 + k * 2.47, 2.9, fz - 2.36)), M.post);
      b.add(boxGeo(V(fx - 5.2, 0, fz - 2.6), V(fx + 5.2, 0.18, fz), 1.2), M.wood);
      const roofG = new THREE.ConeGeometry(6.9, 2.6, 4); roofG.rotateY(Math.PI / 4); roofG.scale(1, 1, 0.78);
      b.add(roofG, M.roof, M4(fx, 3.1 + 1.3, fz + 3.25));
      b.add(boxGeo(V(fx - 0.55, 0.18, fz - 0.06), V(fx + 0.55, 2.2, fz + 0.02)), M.dark);
      for (const dx of [-2.8, 2.8]) { b.add(boxGeo(V(fx + dx - 0.75, 1.0, fz - 0.08), V(fx + dx + 0.75, 2.2, fz + 0.02)), M.post); b.add(boxGeo(V(fx + dx - 0.62, 1.12, fz - 0.1), V(fx + dx + 0.62, 2.08, fz + 0.0)), M.glass); }
      b.add(boxGeo(V(fx + 2.6, 3.1, fz + 3), V(fx + 3.3, 5.6, fz + 3.7), 1), M.mud); // chimney
      // tank on a stand
      const tx = fx + 8.2, tz = fz + 2;
      b.add(cyl(1.5, 1.5, 2.2, 22), M.tank, M4(tx, 2.6, tz)); b.add(new THREE.ConeGeometry(1.62, 0.5, 22), M.tank, M4(tx, 3.95, tz));
      for (const [ax, az] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) b.add(boxGeo(V(tx + ax * 1.1 - 0.09, 0, tz + az * 1.1 - 0.09), V(tx + ax * 1.1 + 0.09, 1.5, tz + az * 1.1 + 0.09)), M.post);
      b.add(boxGeo(V(tx - 1.4, 1.38, tz - 1.4), V(tx + 1.4, 1.5, tz + 1.4), 1, true), M.wood);
      // windmill
      const wx = fx - 9.5, wz = fz + 4.5, H = 9.5;
      for (const [ax, az] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) b.add(beamBetween(V(wx + ax * 1.25, 0, wz + az * 1.25), V(wx + ax * 0.18, H, wz + az * 0.18), 0.1), M.steel);
      for (let k = 1; k < 5; k++) { const y = (k * H) / 5, w = 1.25 - (1.07 * k) / 5; for (const [a0, a1] of [[[-1, -1], [1, -1]], [[1, -1], [1, 1]], [[1, 1], [-1, 1]], [[-1, 1], [-1, -1]]]) b.add(beamBetween(V(wx + a0[0] * w, y, wz + a0[1] * w), V(wx + a1[0] * w, y, wz + a1[1] * w), 0.06), M.steel); }
      const hub = new THREE.Mesh(cyl(0.16, 0.16, 0.3, 10), M.steel); hub.rotation.x = Math.PI / 2; this.fan.add(hub);
      for (let i = 0; i < 14; i++) { const bl = new THREE.Mesh(new THREE.BoxGeometry(0.34, 1.25, 0.03), M.tank); bl.position.set(Math.sin((i * Math.PI) / 7) * 0.95, Math.cos((i * Math.PI) / 7) * 0.95, 0); bl.rotation.set(0, 0.35, -(i * Math.PI) / 7, "ZYX"); this.fan.add(bl); }
      this.fan.position.set(wx, H + 0.2, wz - 0.45); shadowAll(this.fan); R.add(this.fan);
      b.add(boxGeo(V(wx - 0.03, H - 0.25, wz - 0.3), V(wx + 0.03, H + 0.65, wz + 1.9), 0, true), M.tank); // tail vane
    }
    // ---- trees, scrub, far ridges ----
    const trees: [number, number, number][] = [[-9, -9, 7], [14, -32, 8.5], [-44, -36, 7.5], [30, 4, 8], [-34, 3, 9], [60, -12, 8], [FARM[0] + 13, FARM[2] + 9, 9], [DAM[0] - 13, DAM[2] + 6, 8.5], [DAM[0] + 14, DAM[2] + 9, 9.5],
      [DAM[0] + 26, DAM[2] - 30, 7.5], [-88, -26, 8], [-140, 30, 9], [-98, 34, 8], [-150, -8, 7.5], [-60, -40, 8], [78, -34, 8.5], [-4, -44, 9]];
    trees.forEach(([x, z, h], i) => gumTree(b, M, x, z, h, i + 1));
    for (let i = 0; i < 70; i++) { const a = hh(i, 3) * Math.PI * 2, d = 150 + hh(i, 4) * 120; gumTree(b, M, Math.cos(a) * d, Math.sin(a) * d, 8 + hh(i, 5) * 6, i + 40); }
    for (let i = 0; i < 90; i++) {
      const x = (hh(i, 6) - 0.5) * 420, z = -75 + hh(i, 7) * 80, s = 0.35 + hh(i, 8) * 0.5;
      if (Math.abs(z - ROAD_Z) < 4.5 || (Math.abs(x) < 16 && z > -16) || (Math.abs(x - PADX) < 22 && z > -14) || Math.hypot(x - DAM[0], z - DAM[2]) < 24 || Math.hypot(x - FARM[0], z - FARM[2]) < 12 || Math.hypot(x - HEAP[0], z - HEAP[2]) < 14) continue;
      b.add(new THREE.IcosahedronGeometry(s, 1), M.scrub, M4(x, s * 0.55, z, i, 0, 0, [1.3, 0.75, 1.1]));
    }
    for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2 + 0.2, d = 470 + (i % 3) * 60; b.add(new THREE.SphereGeometry(1, 20, 10), M.hill, M4(Math.cos(a) * d, -6, Math.sin(a) * d, 0, 0, 0, [170 + (i % 4) * 40, 16 + (i % 3) * 7, 90])); }
    // ---- the dam ----
    {
      const [dx, , dz] = DAM;
      const ring = new THREE.RingGeometry(9.6, 13.2, 40); ring.rotateX(-Math.PI / 2); b.add(ring, M.mud, M4(dx, 0.035, dz));
      for (let i = 0; i < 26; i++) { const a = (i / 26) * Math.PI * 2, rr = 11.2 + hh(i, 11) * 1.6; if (Math.abs(Math.sin(a)) > 0.9 && Math.cos(a) * 0 === 0 && Math.abs(Math.cos(a)) < 0.42) continue;
        b.add(new THREE.SphereGeometry(1, 10, 6), M.mud, M4(dx + Math.cos(a) * rr, 0, dz + Math.sin(a) * rr, i, 0, 0, [1.9, 0.42 + hh(i, 12) * 0.3, 1.4])); }
      for (let i = 0; i < 46; i++) { const a = hh(i, 13) * Math.PI * 2, rr = 9.1 + hh(i, 14) * 0.9; if (Math.abs(Math.cos(a)) < 0.5) continue;
        b.add(new THREE.ConeGeometry(0.07, 1.1 + hh(i, 15) * 0.7, 4), M.reed, M4(dx + Math.cos(a) * rr, 0.6, dz + Math.sin(a) * rr, 0, (hh(i, 16) - 0.5) * 0.3, (hh(i, 17) - 0.5) * 0.3)); }
      // scrub the gun crew hides behind (either side of the muzzle, never in front of it)
      for (const [sx, sz, s] of [[-2.3, -12.4, 0.6], [-3.3, -12.9, 0.5], [2.4, -12.5, 0.55], [3.4, -13.1, 0.45]]) b.add(new THREE.IcosahedronGeometry(s, 1), M.leaf, M4(dx + sx, s * 0.6, dz + sz, sx, 0, 0, [1.3, 0.85, 1.0]));
    }
    b.build(R);
    this.waterMap = waterTex();
    const wg = new THREE.CircleGeometry(9.9, 48); wg.rotateX(-Math.PI / 2);
    const uv = wg.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 3, uv.getY(i) * 3);
    const wm = new THREE.Mesh(wg, M.water); wm.position.set(DAM[0], 0.05, DAM[2]); wm.receiveShadow = true; R.add(wm);
    // ---- posed props ----
    for (let i = 0; i < 2; i++) { const { body, pan } = makeGun(M), tripod = makeTripod(M), g = new THREE.Group(); body.position.y = 1.2; body.rotation.order = "YXZ"; g.add(body, tripod); shadowAll(g); g.visible = false; this.guns.push({ g, body, pan, tripod }); R.add(g); }
    this.truck = makeTruck(M); this.truck.g.rotation.order = "YXZ"; this.truck.g.visible = false; R.add(this.truck.g);
    {
      // a week of spent brass: mound + scattered cases, and the chalked tally crate
      const hb = new Batch(), mound = new THREE.SphereGeometry(1, 18, 10); hb.add(mound, M.brass, M4(0, 0, 0, 0, 0, 0, [1.25, 0.62, 1.05]));
      for (let i = 0; i < 620; i++) { const a = hh(i, 21) * Math.PI * 2, d = 0.05 + hh(i, 22) * 1.85, up = d < 1.2 ? 0.62 * Math.sqrt(1 - (d / 1.25) ** 2) : 0;
        hb.add(cyl(0.03, 0.034, 0.16, 6), M.brass, M4(Math.cos(a) * d, up + 0.035, Math.sin(a) * d * 0.84, hh(i, 23) * 6, Math.PI / 2 + (hh(i, 24) - 0.5) * 0.8, 0)); }
      hb.add(boxGeo(V(1.0, 0, -1.25), V(1.62, 0.62, -0.63), 0), M.wood);
      hb.build(this.heap);
      const face = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.6), new THREE.MeshBasicMaterial({ map: tallyTex(), color: 0xdcdcdc })); face.rotation.y = Math.PI; face.position.set(1.31, 0.31, -1.256); face.layers.set(NOINK); this.heap.add(face);
      this.heap.position.set(...HEAP); this.heap.visible = false; R.add(this.heap);
    }
    {
      const bb = new Batch(), bx = HEAP[0] - 10, bz = HEAP[2];
      bb.add(boxGeo(V(-1.05, 0.8, -0.22), V(1.05, 0.86, 0.22), 1, true), M.wood);
      for (const x of [-0.75, 0.75]) bb.add(boxGeo(V(x - 0.25, 0, -0.2), V(x + 0.25, 0.8, 0.2), 0.6), M.wood);
      bb.build(this.bench);
      for (let i = 0; i < 10; i++) {
        const c = new THREE.Group(), body = new THREE.Mesh(cyl(0.04, 0.044, 0.2, 14), M.brass), tip = new THREE.Mesh(new THREE.SphereGeometry(0.036, 14, 10), M.copper), rim = new THREE.Mesh(cyl(0.05, 0.05, 0.02, 14), M.brass);
        body.position.y = 0.1; tip.position.y = 0.2; tip.scale.set(1, 2.3, 1); rim.position.y = 0.012; c.add(rim); c.add(body, tip); c.position.set(0.765 - i * 0.17, 0.86, -0.05); shadowAll(c); this.carts.push(c); this.bench.add(c);
      }
      this.bench.position.set(bx, 0, bz); this.bench.visible = false; R.add(this.bench);
    }
    {
      const sb = new Batch();
      for (const x of [-0.8, 0.8]) sb.add(boxGeo(V(x - 0.06, 0, 0.08), V(x + 0.06, 3.2, 0.2)), M.post);
      sb.add(boxGeo(V(-1.2, 2.3, 0.0), V(1.2, 3.4, 0.08), 0, true), M.wood);
      sb.build(this.board);
      this.boardMat = new THREE.MeshBasicMaterial({ map: boardTex(0, 0), color: 0xe2e2e2 });
      const face = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 1.0), this.boardMat); face.rotation.y = Math.PI; face.position.set(0, 2.85, -0.006); face.layers.set(NOINK); this.board.add(face);
      this.board.position.set(0, 0, -1.7); this.board.visible = false; R.add(this.board);
    }
    const body = new THREE.PlaneGeometry(600 * SU, 1000 * SU); body.translate(0, (975 - 500) * SU, 0);
    const emuG = new THREE.PlaneGeometry(900 * SU, 1000 * SU); emuG.translate((450 - 420) * SU, (975 - 500) * SU, 0);
    const emuF = new THREE.PlaneGeometry(900 * SU, 1000 * SU); emuF.translate(0, (975 - 500) * SU, 0);
    this.geos = { body, emu: emuG, emuF };
  }

  /** camera-relative sun, frozen per shot: the shot's mean view direction turned by az toward screen right, lifted by el */
  private shotSun(id: number, s: ShotDef, L: LightPreset) {
    let v = this.sunCache.get(id);
    if (v) return v;
    let fx = 0, fz = 0;
    for (let f = s.a; f < s.b; f += 3) {
      const c = camAt(id, f), x = c.look[0] - c.pos[0], z = c.look[2] - c.pos[2], n = Math.hypot(x, z) || 1;
      fx += x / n; fz += z / n;
    }
    const n = Math.hypot(fx, fz) || 1; fx /= n; fz /= n;
    const ss = s as ShotDef & { sunAz?: number; sunEl?: number };
    const az = THREE.MathUtils.degToRad(ss.sunAz ?? L.az), el = THREE.MathUtils.degToRad(ss.sunEl ?? L.el);
    const hx = fx * Math.cos(az) - fz * Math.sin(az), hz = fz * Math.cos(az) + fx * Math.sin(az); // screen right = (-fz, fx)
    v = new THREE.Vector3(hx * Math.cos(el), Math.sin(el), hz * Math.cos(el)).normalize();
    this.sunCache.set(id, v);
    return v;
  }


  private actor(i: number) { while (this.actors.length <= i) this.actors.push(new Actor(this.root)); return this.actors[i]; }
  private fx(i: number) { while (this.fxs.length <= i) this.fxs.push(new Fx(this.root)); return this.fxs[i]; }
  private poseGun(k: number, p: GunPose | undefined) {
    const G = this.guns[k];
    G.g.visible = !!p;
    if (!p) return;
    G.g.position.set(p.x, p.y, p.z); G.g.rotation.set(0, p.yaw, 0);
    G.tripod.visible = p.tripod;
    G.body.rotation.set(-p.pitch, 0, 0); G.body.position.set(0, 1.2, -0.03 * p.kick);
    G.pan.rotation.y = p.spin;
  }

  update(id: number, f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene) {
    const t = f / FPS, s = SHOTS[id - 1], L = LIGHTS[s.light];
    // ---- camera ----
    const c = camAt(id, f);
    cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.rotateZ(c.roll);
    cam.fov = c.fov; cam.near = 0.2; cam.far = 1500; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    const focus = V(...c.look), dist = cam.position.distanceTo(focus);
    cam.layers.enable(NOINK); // sky, clouds, smoke and sun sprites live on the no-ink layer but are still rendered
    // ---- light rig (lighting.md 9.4): camera-relative sun frozen per shot, two-tone uniforms, shadow fit ----
    const K = LOOK[s.light], sunDir = this.shotSun(id, s, L);
    this.hemi.color.set(L.sky); this.hemi.groundColor.set(L.ground); this.hemi.intensity = L.hemiI;
    this.sun.color.set(L.sunCol); this.sun.intensity = L.sunI;
    let Rr = THREE.MathUtils.clamp(dist * 1.15 + 7, 12, 95);
    if (s.light === "golden") Rr = Math.max(Rr, 30); // el 7: 2 m cards throw ~16 m shadows, houses much longer
    this.sun.position.copy(focus).addScaledVector(sunDir, 220); this.sun.target.position.copy(focus);
    const sc = this.sun.shadow.camera;
    sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 20; sc.far = 480; sc.updateProjectionMatrix();
    this.sun.shadow.bias = L.bias; this.sun.shadow.normalBias = L.normalBias * (Rr / 12);
    this.fill.intensity = 0; // not used by the two-tone shading
    TONE.uLitCol.value.set(...L.lit); TONE.uShadeCol.value.set(...L.shade); TONE.uShadeLift.value.set(...L.lift);
    TONE.uLambert.value = L.lambert; TONE.uSideK.value = L.sideK; TONE.uTerm.value = L.term; TONE.uBounce.value.set(...LOOK[s.light].bounce); TONE.uSat.value = LOOK[s.light].sat;
    CHAR.uCharTint.value.set(...L.charTint); CHAR.uCharShade.value = L.charShade; CHAR.uGrad.value = L.charGrad;
    CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(...L.sideTint);
    // ---- sky, fog (colour = horizon colour, linear fogNear -> fogFar), sun disc + halo, clouds ----
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
      const m = this.clouds[i], mat = m.material as THREE.MeshBasicMaterial;
      m.lookAt(cam.position.x, m.position.y, cam.position.z);
      mat.map = this.cloudMaps[s.light][i % 4];
    }

    // ---- props ----
    const P = propsAt(id, f);
    this.poseGun(0, P.guns[0]); this.poseGun(1, P.guns[1]);
    const T = this.truck; T.g.visible = !!P.truck;
    if (P.truck) {
      T.g.position.set(P.truck.x, P.truck.y, P.truck.z); T.g.rotation.set(P.truck.roll, P.truck.yaw, P.truck.pitch);
      for (const w of T.wheels) w.rotation.z = -P.truck.wheel;
      T.gun.rotation.set(-P.truck.gunPitch, Math.PI / 2 + P.truck.gunYaw, 0);
    }
    this.heap.visible = P.heap;
    this.bench.visible = P.bench >= 0;
    this.carts.forEach((c, i) => { const on = i < P.bench; c.visible = on; });
    this.board.visible = !!P.board;
    if (P.board) this.boardMat.map = boardTex(P.board[1], P.board[0]);
    this.fan.rotation.z = -t * 1.1;
    this.waterMap.offset.set(t * 0.012, t * 0.007);
    const q4 = new THREE.Quaternion(), e3 = new THREE.Euler(), p3 = new THREE.Vector3(), s3 = new THREE.Vector3();
    this.tuftAt.forEach((w, i) => {
      const gone = P.eaten > w.edible ? smooth((P.eaten - w.edible) / 0.12) : 0;
      const inGap = w.x > GAP[0] && w.x < GAP[1] && w.z < FENCE_Z + 3;
      const sway = 0.05 * Math.sin(t * 1.6 + w.x * 0.7 + w.z * 0.5);
      this.tufts.setMatrixAt(i, this.m4.compose(p3.set(w.x, 0, w.z), q4.setFromEuler(e3.set(sway, w.ry, sway * 0.6)), s3.set(w.s, w.s * (inGap ? 0.25 : 1 - 0.86 * gone), w.s)));
    });
    this.tufts.instanceMatrix.needsUpdate = true;
    // ---- cast + effects ----
    const right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0);
    const st = stage(id, f, { pos: cam.position, right });
    this.frustum.setFromProjectionMatrix(this.m4.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    let ai = 0;
    const used: Actor[] = [];
    for (const p of st.places) {
      const sc2 = p.scale ?? 1;
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(p.x, p.y + 1.1 * sc2, p.z), 3.5))) continue;
      const a = this.actor(ai++);
      const [w, h, k] = p.size ?? [300, 500, 0.5];
      a.r = this.pool.req(p.key, w, h, k, p.draw);
      a.mesh.geometry = this.geos[p.geo ?? "body"];
      a.mesh.visible = true;
      a.mesh.position.set(p.x, p.y, p.z);
      a.mesh.rotation.set(0, p.yaw ?? Math.atan2(cam.position.x - p.x, cam.position.z - p.z), p.roll ?? 0);
      a.mesh.scale.set(p.mirror ? -sc2 : sc2, sc2, sc2);
      a.mesh.castShadow = L.actorShadow;
      used.push(a);
    }
    for (let i = ai; i < this.actors.length; i++) this.actors[i].mesh.visible = false;
    let fi = 0;
    const fused: Fx[] = [];
    for (const p of st.fx) {
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(p.x, p.y, p.z), Math.max(p.w, p.h)))) continue;
      const e = this.fx(fi++);
      e.r = this.pool.req(p.key, p.cw, p.ch, 1, p.draw);
      e.use(!!p.soft);
      e.mesh.visible = true;
      e.mesh.position.set(p.x, p.y, p.z);
      if (p.flat) e.mesh.rotation.set(-Math.PI / 2, 0, p.rot ?? 0);
      else { e.mesh.quaternion.copy(cam.quaternion); e.mesh.rotateZ(p.rot ?? 0); }
      e.mesh.scale.set(p.w, p.h, 1);
      fused.push(e);
    }
    for (let i = fi; i < this.fxs.length; i++) this.fxs[i].mesh.visible = false;
    this.pool.flush();
    for (const a of used) a.bind();
    for (const e of fused) e.bind();
    return focus;
  }
}
const PADX = -120;
