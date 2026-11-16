// A street of Pompeii, AD 79 (zone "pompeii"), built from the environment kit (env/) and the engine's two-tone Batch materials.
// The street runs along z toward Vesuvius (z = -330): stone-paved road with wheel ruts and stepping stones, raised pavements,
// plastered shop fronts with open counters and striped cloth awnings, a bakery with a domed oven that glows, a millstone, a street
// fountain, a house door whose floor mosaic shows a chained dog and "CAVE CANEM", amphorae, umbrella pines and cypresses, and
// Vesuvius: one green cone with vineyards. Then the eruption (a pure function of the seconds since the blast): fire at the
// crater, a column that climbs "like a pine tree: a tall trunk, then branches", falling pumice that bounces on paving and awnings.
// Nothing here is a lava river: the sources do not have one.
import * as THREE from "three";
import { Batch, V, box, col, lam, quad, rod } from "./geo";
import { ctex, rng as prng } from "./paint";
import { Part, glow, makeFire, makeTree, model, noInk, softTex } from "./env";
import { LIGHTS, LOOK } from "./lights";

/** what the film asks of the set at a frame */
export type PompState = {
  /** seconds since the summit burst (undefined = the quiet mountain) */
  eruptT?: number;
  /** seconds since the first stone fell (undefined = none yet) */
  stones?: number;
  /** 0..1 how hard the ground shakes (awnings tremble) */
  shake?: number;
  /** keep stones from landing here: [x, z, radius] (the figures of the shot) */
  avoid?: [number, number, number][];
  /** a part of the street that is not drawn (the interior shots would otherwise be hidden by walls) */
  hide?: string[];
  /** foreground pieces at the picture's sides (blurred by the lens): 0 none, 1 amphorae bottom left + column right, 2 amphorae bottom right + column left */
  fg?: { amph?: -1 | 1; col?: -1 | 1; awn?: -1 | 1; flee?: boolean };
  /** scale of the cloud (the hook shows only its first, small part) */
  cap?: number;
  /** the umbrella pines close to the street (shown for the comparison with the cloud) */
  pines?: boolean;
  /** stones fall only behind this z (the figures and the lens are in front of it) */
  zmax?: number;
  /** how far up the street from zmax the stones fall (default 33.6 m) */
  stoneSpan?: number;
  /** size of the stones (1 = as built; a lens close above them takes smaller ones) */
  stoneScale?: number;
  /** half the width of the strip the stones fall on (default: the road and both pavements) */
  stoneHalf?: number;
  /** how far each awning has come down, 0 (up) .. 1 (on the ground): asked per awning by its side (-1 left, 1 right) and the z of its shop */
  awnDrop?: (side: number, z: number) => number;
  /** the handcart: where it stands, which way it points and how far it has tipped over onto its side (radians) */
  cart?: { x: number; z: number; yaw: number; roll: number; y?: number };
  /** loose amphorae (standing, falling, rolling): position, tilt about x and z, size */
  pots?: { x: number; y: number; z: number; rx?: number; rz?: number; s?: number }[];
  /** amphorae that have smashed: where, and the seconds since (the shards fly, fall and lie) */
  smash?: { x: number; y: number; z: number; t: number; seed?: number }[];
  /** seconds for the lightning's clock (bolts flash in the base of the column); undefined = none */
  bolts?: number;
};

export const X = 3.5;                       // the line of the facades, both sides
export const ROAD = 2.4;                    // half width of the paved road (pavements run from here to the facades)
export const MOUNT = { x: 0, z: -165, h: 26, r: 92 };
export const SUMMIT: [number, number, number] = [MOUNT.x, MOUNT.h - 3, MOUNT.z];
/** hero places along the street: z of the centre of each unit and which side */
export const PLACE = {
  merchant: { side: -1 as const, z: 1.0, w: 6.2 }, bakery: { side: 1 as const, z: 1.0, w: 5.4 }, door: { side: -1 as const, z: -8.2, w: 4.0 },
  fountain: { side: 1 as const, z: -9.6, w: 3.6 },
};
/** the awnings: for stones that bounce on them */
type Awn = { side: number; z: number; hw: number; yTop: number; drop: number; len: number };
const AWN: Awn[] = [];

const parts: Part[] = [];
let awnGroups: { g: THREE.Group; ph: number; side: number; z: number; y0: number; len: number; drop: number }[] = [];
let clouds: THREE.Mesh[] = [];
let cloudInfo: { kind: number; u: number; a: number; q: number; s: number; c: number }[] = [];
let craterGlow: THREE.Group, fireBalls: THREE.Mesh[] = [], jet: THREE.Mesh, core: THREE.Mesh, rocks: THREE.Mesh[] = [], fireGlow: THREE.Sprite;
let stoneMesh: THREE.InstancedMesh, pinesNear: THREE.Group;
let airNear: THREE.Points, airFar: THREE.Points, airAsh: THREE.Points, fgAmph: THREE.Group, fgCol: THREE.Group, fgAwn: THREE.Mesh;
let cartG: THREE.Group, potMeshes: THREE.Mesh[] = [], shardMesh: THREE.InstancedMesh, boltMeshes: THREE.Mesh[] = [], boltGlow: THREE.Sprite;
const POT_N = 12, SHARD_N = 160, SHARD_PER = 16;
const CS = 0.55;
const AIR_N = 260, AIR_F = 900, AIR_A = 300;
const airSeed = (n: number, seed: number) => { const r = prng(seed); return Array.from({ length: n }, () => [r(), r(), r(), r()]); };
const AS_N = airSeed(AIR_N, 3), AS_F = airSeed(AIR_F, 4), AS_A = airSeed(AIR_A, 5);
const fr1 = (v: number) => v - Math.floor(v);
let hidable: Record<string, THREE.Object3D> = {};
const STONE_N = 700;

// ---------------- textures ----------------
const pavingTex = () => ctex("pomp_paving", 1024, 1024, (g, r) => {
  g.fillStyle = "#2b2825"; g.fillRect(0, 0, 1024, 1024);
  const n = 8;   // big irregular basalt slabs, laid in rough rows
  for (let j = 0; j < n; j++) {
    let x = -r() * 80; const y0 = (j * 1024) / n, h = 1024 / n;
    while (x < 1024) {
      const w = 90 + r() * 90, t = 112 + 56 * r(), hot = r() > 0.8 ? 18 : 0, d = (k: number) => k * (0.9 + 0.2 * r());
      g.fillStyle = `rgb(${t + hot},${t * 0.97 + hot},${t * 0.92 + hot})`;
      g.beginPath(); g.roundRect(x + 5, y0 + 5 + (r() - 0.5) * 6, w - 10, h - 10, 22 + 12 * r()); g.fill();
      g.strokeStyle = "rgba(255,255,255,0.14)"; g.lineWidth = 3; g.beginPath(); g.moveTo(x + 22, y0 + 11); g.lineTo(x + w - 22, y0 + 11); g.stroke();
      void d; x += w;
    }
  }
  for (let i = 0; i < 9000; i++) { const v = r() > 0.5 ? 255 : 0; g.fillStyle = `rgba(${v},${v},${v},${0.1 * r()})`; g.fillRect(r() * 1024, r() * 1024, 3, 3); }
  for (const x of [250, 770]) { const gr = g.createLinearGradient(x - 40, 0, x + 40, 0); gr.addColorStop(0, "rgba(20,18,16,0)"); gr.addColorStop(0.5, "rgba(20,18,16,0.38)"); gr.addColorStop(1, "rgba(20,18,16,0)"); g.fillStyle = gr; g.fillRect(x - 40, 0, 80, 1024); }   // wheel ruts
});
const plasterTex = (base: string) => ctex("pomp_plaster" + base, 512, 512, (g, r) => {
  g.fillStyle = base; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 150; i++) { const x = r() * 512, y = r() * 512, rad = 24 + 70 * r(), gr = g.createRadialGradient(x, y, 0, x, y, rad), dark = r() > 0.5; gr.addColorStop(0, dark ? "rgba(90,58,40,0.11)" : "rgba(255,240,210,0.13)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(x - rad, y - rad, 2 * rad, 2 * rad); }
  const d = g.createLinearGradient(0, 360, 0, 512); d.addColorStop(0, "rgba(60,40,30,0)"); d.addColorStop(1, "rgba(60,40,30,0.34)"); g.fillStyle = d; g.fillRect(0, 360, 512, 152);
  g.strokeStyle = "rgba(80,56,44,0.5)"; g.lineWidth = 2;
  for (let i = 0; i < 6; i++) { let x = r() * 512, y = r() * 300; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (r() - 0.5) * 40; y += 14 + 24 * r(); g.lineTo(x, y); } g.stroke(); }
  g.fillStyle = "rgba(120,40,30,0.5)"; g.fillRect(0, 300, 512, 14);   // a painted band
  g.fillStyle = "rgba(255,255,255,0.12)"; g.fillRect(0, 314, 512, 3);
  g.strokeStyle = "rgba(255,244,214,0.14)"; g.lineWidth = 3; g.strokeRect(36, 40, 440, 230);   // a faded panel
});
const stripeTex = (a: string, b: string) => ctex("pomp_stripe" + a + b, 256, 256, (g) => {
  for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? b : a; g.fillRect(i * 32, 0, 32, 256); }
  const sh = g.createLinearGradient(0, 0, 0, 256); sh.addColorStop(0, "rgba(255,255,255,0.1)"); sh.addColorStop(1, "rgba(0,0,0,0.12)"); g.fillStyle = sh; g.fillRect(0, 0, 256, 256);
});
const signTex = () => ctex("pomp_sign", 256, 128, (g) => { g.fillStyle = "#ecdcc0"; g.fillRect(0, 0, 256, 128); g.strokeStyle = "#a8402e"; g.lineWidth = 6; g.strokeRect(6, 6, 244, 116); g.fillStyle = "#a8402e"; g.font = "900 28px Impact, Arial Black, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("C IVLIVM POLYBIVM", 128, 40); g.fillText("AED  O V F", 128, 90); });
const brickTex = () => ctex("pomp_brick", 512, 512, (g, r) => {
  g.fillStyle = "#4a2c20"; g.fillRect(0, 0, 512, 512);
  for (let j = 0; j < 16; j++) for (let i = -1; i < 9; i++) { const t = 140 + 60 * r(); g.fillStyle = `rgb(${t + 50},${t - 10},${t - 60})`; g.fillRect(i * 64 + (j % 2) * 32 + 2, j * 32 + 2, 60, 28); }
});
const tilesTex = () => ctex("pomp_tiles", 256, 256, (g, r) => {
  g.fillStyle = "#8a3a22"; g.fillRect(0, 0, 256, 256);
  for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) { const t = 150 + 50 * r(); g.fillStyle = `rgb(${t + 40},${t * 0.5},${t * 0.3})`; g.beginPath(); g.roundRect(i * 32 + 2, j * 32 + 2, 28, 28, 6); g.fill(); }
});
/** the floor mosaic of the house doorway: a chained dog and CAVE CANEM, black on cream, 1024 x 1280 (top = the far end of the passage) */
const mosaicTex = () => ctex("pomp_mosaic", 1024, 1280, (g, r) => {
  g.fillStyle = "#eadfc4"; g.fillRect(0, 0, 1024, 1280);
  g.strokeStyle = "#2b2623"; g.lineWidth = 26; g.strokeRect(36, 36, 952, 1208);
  g.strokeStyle = "#a8402e"; g.lineWidth = 12; g.strokeRect(66, 66, 892, 1148);
  g.strokeStyle = "#2b2623"; g.lineWidth = 6; g.strokeRect(86, 86, 852, 1108);
  const K = "#2b2623";
  g.fillStyle = K; g.strokeStyle = K; g.lineCap = "round"; g.lineJoin = "round";
  // the dog (side view, facing left), on his chain
  g.beginPath(); g.ellipse(500, 400, 230, 105, -0.05, 0, 7); g.fill();
  g.beginPath(); g.ellipse(250, 470, 120, 100, 0.2, 0, 7); g.fill();
  for (const [x, y] of [[640, 470], [700, 480], [330, 530], [260, 540]] as const) { g.lineWidth = 44; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (x > 500 ? 6 : -10), y + 160); g.stroke(); }
  g.lineWidth = 36; g.beginPath(); g.moveTo(710, 330); g.quadraticCurveTo(790, 250, 770, 170); g.stroke();   // neck
  g.beginPath(); g.ellipse(250, 320, 105, 82, 0.1, 0, 7); g.fill();                                                  // rump
  g.lineWidth = 34; g.beginPath(); g.moveTo(180, 350); g.quadraticCurveTo(90, 330, 70, 220); g.stroke();             // tail up
  g.beginPath(); g.ellipse(790, 220, 98, 76, -0.2, 0, 7); g.fill();                                                  // head
  g.beginPath(); g.moveTo(850, 215); g.lineTo(960, 235); g.lineTo(950, 280); g.lineTo(850, 280); g.fill();           // snout
  g.beginPath(); g.moveTo(760, 160); g.lineTo(730, 110); g.lineTo(800, 150); g.fill();                                // ear
  g.fillStyle = "#eadfc4"; g.beginPath(); g.moveTo(868, 266); for (let i = 0; i < 6; i++) g.lineTo(868 + i * 14 + 7, i % 2 ? 266 : 286); g.fill();   // bared teeth
  g.beginPath(); g.arc(815, 205, 9, 0, 7); g.fill();
  g.strokeStyle = "#a8402e"; g.lineWidth = 22; g.beginPath(); g.moveTo(712, 270); g.lineTo(745, 320); g.stroke();   // collar
  g.strokeStyle = K; g.lineWidth = 9; g.setLineDash([22, 12]); g.beginPath(); g.moveTo(740, 330); g.quadraticCurveTo(690, 640, 880, 640); g.lineTo(930, 640); g.stroke(); g.setLineDash([]);   // the chain
  g.fillStyle = K;
  // the words, two lines, in the big square capitals of a mosaic
  g.font = "900 250px 'Arial Black', Impact, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
  g.fillText("CAVE", 512, 830); g.font = "900 215px 'Arial Black', Impact, sans-serif"; g.fillText("CANEM", 512, 1055);
  // tesserae: a grid of tiny joints and a little colour noise
  for (let y = 0; y < 1280; y += 11) for (let x = 0; x < 1024; x += 11) { if (r() > 0.55) { g.fillStyle = r() > 0.5 ? "rgba(255,248,230,0.1)" : "rgba(0,0,0,0.08)"; g.fillRect(x, y, 11, 11); } }
  g.strokeStyle = "rgba(110,95,75,0.45)"; g.lineWidth = 1.4;
  for (let y = 0; y < 1280; y += 11) { g.beginPath(); g.moveTo(0, y); g.lineTo(1024, y); g.stroke(); }
  for (let x = 0; x < 1024; x += 11) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 1280); g.stroke(); }
});
const mountTex = () => ctex("pomp_mount", 1024, 1024, (g, r) => {   // u = round the cone, v = from the summit (0) to the foot (1)
  const gr = g.createLinearGradient(0, 0, 0, 1024); gr.addColorStop(0, "#8c7d6f"); gr.addColorStop(0.2, "#8f8068"); gr.addColorStop(0.38, "#7d8a52"); gr.addColorStop(0.6, "#6f9446"); gr.addColorStop(1, "#7aa04a");
  g.fillStyle = gr; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 90; i++) { const x = r() * 1024, y = 300 + r() * 724, w = 40 + 140 * r(), h = 12 + 50 * r(); g.fillStyle = r() > 0.5 ? "rgba(150,170,70,0.28)" : "rgba(70,110,50,0.28)"; g.beginPath(); g.ellipse(x, y, w, h, 0, 0, 7); g.fill(); }   // fields
  for (let y = 380; y < 1024; y += 9) { g.strokeStyle = `rgba(40,80,30,${0.18 + 0.22 * r()})`; g.lineWidth = 2.4; g.beginPath(); g.moveTo(0, y); g.lineTo(1024, y + (r() - 0.5) * 3); g.stroke(); }   // vineyard rows
  for (let i = 0; i < 40; i++) { const x = r() * 1024; g.strokeStyle = "rgba(90,70,56,0.3)"; g.lineWidth = 4 + 8 * r(); g.beginPath(); g.moveTo(x, 0); g.quadraticCurveTo(x + (r() - 0.5) * 60, 200, x + (r() - 0.5) * 100, 420 + 200 * r()); g.stroke(); }   // gullies
  for (let i = 0; i < 6000; i++) { g.fillStyle = r() > 0.5 ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)"; g.fillRect(r() * 1024, r() * 1024, 4, 4); }
});
const groundTex = () => ctex("pomp_ground", 1024, 1024, (g, r) => {
  g.fillStyle = "#7f9a4c"; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 70; i++) { const x = r() * 1024, y = r() * 1024, w = 60 + 160 * r(); g.fillStyle = ["rgba(170,160,80,0.35)", "rgba(90,130,60,0.35)", "rgba(140,120,70,0.3)"][i % 3]; g.beginPath(); g.ellipse(x, y, w, w * 0.5, r() * 3, 0, 7); g.fill(); }
  for (let y = 0; y < 1024; y += 12) { g.strokeStyle = "rgba(50,90,40,0.25)"; g.lineWidth = 3; g.beginPath(); g.moveTo(0, y); g.lineTo(1024, y); g.stroke(); }
  for (let i = 0; i < 9000; i++) { g.fillStyle = r() > 0.5 ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)"; g.fillRect(r() * 1024, r() * 1024, 3, 3); }
});

const plaster = (base: string) => lam("pp" + base, () => ({ map: plasterTex(base) }));
const WALLS = ["#d9a85a", "#e6d9b8", "#c9826a", "#b5503a", "#ecdcb8", "#d6b070", "#c96a4a", "#e0b866", "#d4c4a0", "#a8452f"];
const AWNINGS: [string, string][] = [["#b8392f", "#f1e6c8"], ["#d9a02e", "#f1e6c8"], ["#2f5f8f", "#f1e6c8"], ["#6a8a3c", "#f1e6c8"]];

// ---------------- pieces ----------------
const amphora = (b: Batch, x: number, y: number, z: number, tiltX = 0, tiltZ = 0, s = 1, c = "#c47a4a") => {
  const pts = [[0, 0], [0.04, 0.0], [0.1, 0.1], [0.2, 0.32], [0.235, 0.55], [0.2, 0.78], [0.11, 0.94], [0.075, 1.04], [0.1, 1.1], [0.095, 1.13], [0, 1.13]].map(([r, h]) => new THREE.Vector2(r, h));
  const g = new THREE.LatheGeometry(pts, 14);
  const m = new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(tiltX, 0, tiltZ)), V(s, s, s));
  b.add(g, col(c), m);
  for (const sg of [-1, 1]) { const h = rod(V(sg * 0.075, 1.04, 0), V(sg * 0.255, 0.8, 0), 0.026); b.add(h, col(c), m); }
};
const pine = (b: Batch, x: number, z: number, h: number, yaw = 0) => {   // an umbrella pine: a tall bare trunk, a flat crown of branches with dark needles
  const trunk = col("#6b4a33"), n1 = col("#3f6b3a"), n2 = col("#55803f"), n3 = col("#2f5a33");
  b.add(rod(V(x, 0, z), V(x + 0.05 * h, h * 0.86, z), 0.05 * h, 0.03 * h, 8), trunk);
  const r = prng(Math.round(h * 13 + x * 7));
  for (let i = 0; i < 7; i++) {
    const a = yaw + (i / 7) * 6.283 + r(), reach = h * (0.26 + 0.12 * r()), top = h * (0.86 + 0.1 * r());
    const ex = x + 0.05 * h + Math.cos(a) * reach, ez = z + Math.sin(a) * reach, ey = top + h * 0.03 * r();
    b.add(rod(V(x + 0.05 * h, h * (0.74 + 0.06 * i / 7), z), V(ex, ey, ez), 0.022 * h, 0.014 * h, 6), trunk);
    for (let k = 0; k < 3; k++) { const s = h * (0.12 + 0.05 * r()), px = ex + (r() - 0.5) * h * 0.14, pz = ez + (r() - 0.5) * h * 0.14; const g = new THREE.SphereGeometry(1, 9, 6); g.applyMatrix4(new THREE.Matrix4().compose(V(px, ey + 0.02 * h * k, pz), new THREE.Quaternion(), V(s, s * 0.42, s))); b.add(g, [n1, n2, n3][k % 3]); }
  }
};
const cypress = (b: Batch, x: number, z: number, h: number) => { const g = new THREE.ConeGeometry(0.11 * h, h, 8, 1).translate(x, h / 2, z); b.add(g, col("#2f5a34")); b.add(rod(V(x, 0, z), V(x, 0.15 * h, z), 0.015 * h), col("#5a4030")); };

/** a building block with its street face at x = side * X and `depth` metres behind it; an opening (shop, door) is cut when `o` is given */
type Open = { ow: number; oh: number; cav: number; cz?: number };
const block = (b: Batch, side: number, zc: number, W: number, h: number, wall: THREE.Material, depth: number, o?: Open) => {
  const cx = side * (X + depth / 2);
  if (!o) { b.add(box(cx, 0, zc, depth, h, W, 0, 0), wall); return; }
  const oc = o.cz ?? zc, ol = oc - o.ow / 2, orr = oc + o.ow / 2, zl = zc - W / 2, zr = zc + W / 2;
  b.add(box(cx, 0, (zl + ol) / 2, depth, h, ol - zl), wall); b.add(box(cx, 0, (orr + zr) / 2, depth, h, zr - orr), wall);
  b.add(box(cx, o.oh, oc, depth, h - o.oh, o.ow), wall);
  b.add(box(side * (X + o.cav + (depth - o.cav) / 2), 0, oc, depth - o.cav, o.oh, o.ow), wall);
};

export const buildPompeii = (root: THREE.Group) => {
  parts.length = 0; AWN.length = 0; awnGroups = []; hidable = {};
  const b = new Batch(), STONE = col("#bdb3a0"), STONE_D = col("#8a8070"), DARK = col("#2a221e"), WOOD = col("#6b4a2e"), WOODL = col("#8a6240");
  // ---- ground, road, pavements, stepping stones ----
  const gm = new THREE.Mesh(new THREE.PlaneGeometry(1600, 1600).rotateX(-Math.PI / 2), lam("pompGround", () => ({ map: groundTex() })));
  { const uv = gm.geometry.attributes.uv as THREE.BufferAttribute; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 40, uv.getY(i) * 40); }
  gm.position.y = -0.04; gm.receiveShadow = true; root.add(gm);
  const road = lam("paving", () => ({ map: pavingTex() }));
  b.add(quad(V(-ROAD, 0.0, 30), V(ROAD, 0.0, 30), V(ROAD, 0.0, -62), V(-ROAD, 0.0, -62), 4.8 / 5, 92 / 5), road);
  b.add(quad(V(-ROAD, 0.0, -62), V(ROAD, 0.0, -62), V(ROAD, 0.0, -300), V(-ROAD, 0.0, -300), 1, 1), lam("dirtRoad", () => ({ color: "#b49a74" })));
  for (const s of [-1, 1]) { b.add(box(s * (ROAD + 0.55), 0, -45, 1.1, 0.26, 150, 0, 4), lam("walk", () => ({ map: pavingTex(), color: "#d8d0c0" }))); b.add(box(s * (ROAD + 0.02), 0, -45, 0.1, 0.285, 150), STONE); }
  for (const z of [-12.4, -27.4]) for (const x of [-1.7, -0.57, 0.57, 1.7]) b.add(box(x, 0, z, 0.62, 0.32, 0.85, 0.05), STONE_D);
  // ---- the buildings ----
  type Unit = { side: number; z: number; w: number; h: number; wall: number; kind: "wall" | "shop" | "bakery" | "merchant" | "door" | "fountain" };
  const units: Unit[] = [
    { side: -1, z: 13, w: 6, h: 5.2, wall: 0, kind: "wall" }, { side: -1, z: 7.2, w: 5, h: 4.8, wall: 1, kind: "shop" },
    { side: -1, z: PLACE.merchant.z, w: PLACE.merchant.w, h: 4.9, wall: 7, kind: "merchant" }, { side: -1, z: -4.2, w: 3.8, h: 5.0, wall: 2, kind: "wall" },
    { side: -1, z: PLACE.door.z, w: PLACE.door.w, h: 5.6, wall: 4, kind: "door" }, { side: -1, z: -13, w: 5.6, h: 5.0, wall: 3, kind: "wall" },
    { side: 1, z: 13, w: 7, h: 5.0, wall: 3, kind: "wall" }, { side: 1, z: 6.2, w: 6, h: 4.8, wall: 0, kind: "shop" },
    { side: 1, z: PLACE.bakery.z, w: PLACE.bakery.w, h: 5.0, wall: 5, kind: "bakery" }, { side: 1, z: -4.8, w: 5.2, h: 5.2, wall: 4, kind: "wall" },
    { side: 1, z: PLACE.fountain.z, w: PLACE.fountain.w, h: 4.8, wall: 8, kind: "fountain" },
  ];
  { const r = prng(77); let zl = -15.8, zr = -11.8, i = 0;
    while (zl > -60 || zr > -60) {
      if (zl > -60) { const w = 4 + 4 * r(); zl -= w / 2; units.push({ side: -1, z: zl, w, h: 4.6 + 1.2 * r(), wall: (i * 3 + 1) % WALLS.length, kind: i % 3 === 0 ? "shop" : "wall" }); zl -= w / 2; }
      if (zr > -60) { const w = 4 + 4 * r(); zr -= w / 2; units.push({ side: 1, z: zr, w, h: 4.6 + 1.2 * r(), wall: (i * 3 + 2) % WALLS.length, kind: i % 3 === 1 ? "shop" : "wall" }); zr -= w / 2; }
      i++;
    } }
  const tiles = lam("tilesRoof", () => ({ map: tilesTex() }));
  units.forEach((u, ui) => {
    const wall = plaster(WALLS[u.wall]), depth = 7.5, shopLike = u.kind === "shop" || u.kind === "bakery" || u.kind === "merchant";
    const o: Open | undefined = shopLike ? { ow: Math.min(u.w - 1.6, u.kind === "bakery" ? 3.6 : 3.0), oh: 2.6, cav: 3.2 } : u.kind === "door" ? { ow: 2.2, oh: 3.0, cav: 4.2 } : undefined;
    block(b, u.side, u.z, u.w, u.h, wall, depth, o);
    // roof of terracotta with a stone eave
    b.add(box(u.side * (X + depth / 2 - 0.3), u.h, u.z, depth + 0.6, 0.3, u.w + 0.2, 0, 3), tiles); b.add(box(u.side * (X - 0.32), u.h - 0.18, u.z, 0.6, 0.18, u.w + 0.1), STONE);
    // eave of terracotta tile ends, a painted wall notice, columns beside the openings
    for (let zz = u.z - u.w / 2 + 0.15; zz < u.z + u.w / 2 - 0.1; zz += 0.24) b.add(new THREE.CylinderGeometry(0.09, 0.09, 0.3, 8).rotateZ(Math.PI / 2).translate(u.side * (X - 0.45), u.h - 0.02, zz), col(Math.round(zz * 4) % 2 ? "#b8552e" : "#a64a26"));
    if (u.kind === "wall" && u.w > 4.2) { const sw = Math.min(2.6, u.w - 1), y0 = 2.0, y1 = 3.1, nx = u.side; b.add(nx < 0 ? quad(V(nx * (X - 0.04), y0, u.z + sw / 2), V(nx * (X - 0.04), y0, u.z - sw / 2), V(nx * (X - 0.04), y1, u.z - sw / 2), V(nx * (X - 0.04), y1, u.z + sw / 2)) : quad(V(nx * (X - 0.04), y0, u.z - sw / 2), V(nx * (X - 0.04), y0, u.z + sw / 2), V(nx * (X - 0.04), y1, u.z + sw / 2), V(nx * (X - 0.04), y1, u.z - sw / 2)), lam("wallSign", () => ({ map: signTex() }))); }
    // painted dado and upper windows on the street face
    if (!o) b.add(box(u.side * (X - 0.02), 0, u.z, 0.05, 1.1, u.w, 0), col("#6e2f26"));
    else for (const sg of [-1, 1]) { const w2 = (u.w - o.ow) / 2; b.add(box(u.side * (X - 0.02), 0, u.z + sg * (o.ow / 2 + w2 / 2), 0.05, 1.1, w2), col("#6e2f26")); }
    if (u.h > 4.5) for (const dz of [-u.w * 0.25, u.w * 0.25]) { b.add(box(u.side * (X - 0.03), 3.3, u.z + dz, 0.06, 0.95, 0.75), DARK); b.add(box(u.side * (X - 0.05), 4.25, u.z + dz, 0.08, 0.14, 1.0), STONE); b.add(box(u.side * (X - 0.05), 3.18, u.z + dz, 0.1, 0.12, 0.95), STONE); }
    if (o) {
      for (const sg of [-1, 1]) { const cz = u.z + sg * (o.ow / 2 + 0.3), cx = u.side * (X - 0.2), ch = o.oh - 0.25; b.add(new THREE.CylinderGeometry(0.15, 0.17, ch, 14).translate(cx, 0.25 + ch / 2, cz), col("#efe2c4")); b.add(box(cx, 0, cz, 0.42, 0.25, 0.42), col("#e2d2ae")); b.add(box(cx, 0.25 + ch, cz, 0.46, 0.2, 0.46), col("#e2d2ae")); }
      const oc = u.z, nx = u.side;
      // the opening: a stone frame, a dark floor inside, the back wall
      for (const sg of [-1, 1]) b.add(box(nx * (X - 0.06), 0, oc + sg * (o.ow / 2 + 0.12), 0.14, o.oh + 0.1, 0.24), STONE);
      b.add(box(nx * (X - 0.06), o.oh, oc, 0.14, 0.2, o.ow + 0.5), STONE);
      b.add(quad(V(nx * X, 0.02, oc + o.ow / 2), V(nx * (X + o.cav), 0.02, oc + o.ow / 2), V(nx * (X + o.cav), 0.02, oc - o.ow / 2), V(nx * X, 0.02, oc - o.ow / 2)), col(u.kind === "door" ? "#6a5a48" : "#4a3a2e", THREE.DoubleSide));
      if (u.kind !== "door") {
        // the counter: masonry with round holes for the jars, a shelf with amphorae behind it
        const cw = u.kind === "bakery" ? 1.3 : o.ow - 0.2, cc = u.kind === "bakery" ? oc - o.ow / 2 + 0.75 : oc;
        b.add(box(nx * (X + 0.5), 0, cc, 0.75, 0.95, cw), STONE); b.add(box(nx * (X + 0.5), 0.95, cc, 0.85, 0.08, cw + 0.1), STONE_D);
        for (const dz of (u.kind === "bakery" ? [0] : [-o.ow * 0.28, 0, o.ow * 0.28])) b.add(new THREE.CylinderGeometry(0.2, 0.2, 0.02, 14).translate(nx * (X + 0.5), 1.035, cc + dz), DARK);
        b.add(box(nx * (X + o.cav - 0.3), 1.2, oc, 0.5, 0.06, o.ow - 0.3), WOOD); b.add(box(nx * (X + o.cav - 0.3), 1.95, oc, 0.5, 0.06, o.ow - 0.3), WOOD);
        for (let k = 0; k < 4; k++) { amphora(b, nx * (X + o.cav - 0.35), 1.26, oc - o.ow * 0.36 + k * o.ow * 0.24, 0, 0, 0.55, k % 2 ? "#c47a4a" : "#b86a3e"); amphora(b, nx * (X + o.cav - 0.35), 2.01, oc - o.ow * 0.3 + k * o.ow * 0.2, 0, 0, 0.45, "#c98a58"); }
        // the awning: striped cloth hung from the lintel, tied up to the wall by a rope at each end; it trembles when the ground does
        const [c1, c2] = AWNINGS[(ui + u.wall) % AWNINGS.length], aw = o.ow + 0.7, len = 1.9, drop = 0.55, y0 = o.oh + 0.3;
        const g = new THREE.Group(); g.position.set(nx * X, y0, oc);
        const cloth = new THREE.Mesh(new THREE.PlaneGeometry(len, aw).rotateX(-Math.PI / 2).rotateY(0), lam("awn" + c1 + c2, () => ({ map: stripeTex(c1, c2), side: THREE.DoubleSide })));
        cloth.geometry.translate(-nx * len / 2, 0, 0);
        const pos = cloth.geometry.attributes.position as THREE.BufferAttribute; for (let i = 0; i < pos.count; i++) { const d = Math.abs(pos.getX(i)) / len; pos.setY(i, -drop * d); }
        cloth.geometry.computeVertexNormals(); cloth.castShadow = true; cloth.receiveShadow = true; g.add(cloth);
        const val = new THREE.Mesh(new THREE.PlaneGeometry(aw, 0.22), lam("awnV" + c1, () => ({ color: c1, side: THREE.DoubleSide })));
        val.rotation.y = Math.PI / 2; val.position.set(-nx * len, -drop - 0.11, 0); val.castShadow = true; g.add(val);
        const rb = new Batch(); for (const sg of [-1, 1]) rb.add(rod(V(-nx * len, -drop, sg * aw / 2), V(0, 0.55, sg * aw / 2), 0.012), col("#5a4630")); rb.build(g, false);
        root.add(g); awnGroups.push({ g, ph: ui * 1.7, side: nx, z: oc, y0, len, drop });
        AWN.push({ side: nx, z: oc, hw: aw / 2, yTop: y0, drop, len });
      }
    }
    if (u.kind === "door") {
      // the house door: two leaves swung open against the passage walls, a lintel, and the dark atrium beyond
      const oc = u.z, nx = u.side;
      for (const sg of [-1, 1]) b.add(box(nx * (X + 0.45), 0, oc + sg * 1.0, 0.8, 2.9, 0.1), WOODL);
      b.add(box(nx * (X + 4.4), 0, oc, 0.1, 3.6, 2.2), col("#b5503a"));
      b.add(quad(V(nx * (X + 4.2), 0.02, oc + 1.1), V(nx * (X + 7.4), 0.02, oc + 1.1), V(nx * (X + 7.4), 0.02, oc - 1.1), V(nx * (X + 4.2), 0.02, oc - 1.1)), col("#3a2e26", THREE.DoubleSide));
      b.add(box(nx * (X - 0.05), 3.0, oc, 0.16, 0.14, 2.7), col("#a8402e"));
      // the mosaic, its text running away from the viewer in the street: u across (the viewer's right is -z for a left door), v along the passage
      const mw = 2.0, mz = oc, x0 = nx * (X + 0.9), x1 = nx * (X + 3.9);
      const mos = new THREE.Mesh(new THREE.BufferGeometry(), lam("mosaicMat", () => ({ map: mosaicTex(), side: THREE.DoubleSide })));
      mos.geometry = quad(V(x0, 0.045, mz + mw / 2), V(x0, 0.045, mz - mw / 2), V(x1, 0.045, mz - mw / 2), V(x1, 0.045, mz + mw / 2), 1, 1);
      if (nx > 0) mos.geometry = quad(V(x0, 0.045, mz - mw / 2), V(x0, 0.045, mz + mw / 2), V(x1, 0.045, mz + mw / 2), V(x1, 0.045, mz - mw / 2), 1, 1);
      mos.receiveShadow = true; root.add(mos); hidable.mosaic = mos;
      // the ring in the wall where the chain is fixed
      b.add(new THREE.TorusGeometry(0.06, 0.016, 6, 12).rotateY(Math.PI / 2).translate(nx * (X - 0.04), 0.5, oc + 1.75), col("#3a3d42"));
    }
    if (u.kind === "bakery") {
      const oc = u.z, nx = u.side;
      // the domed brick oven at the back of the shop, its mouth toward the street, glowing; sacks of flour and a bench
      const ox = nx * (X + 2.55), oz = oc + 0.75, bm = lam("ovenBrick", () => ({ map: brickTex() }));
      const dome = new THREE.Mesh(new THREE.SphereGeometry(1.05, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), bm); dome.position.set(ox, 0.7, oz); dome.scale.set(1, 0.95, 1); dome.castShadow = true; dome.receiveShadow = true; root.add(dome);
      b.add(box(ox, 0, oz, 2.1, 0.7, 2.1), plaster("#b09a78"));
      b.add(new THREE.CylinderGeometry(0.62, 0.7, 0.25, 22, 1, false).translate(ox + nx * 0.2, 0.7, oz), STONE_D);
      const mouthX = ox - nx * 1.0;
      b.add(box(mouthX + nx * 0.02, 0.78, oz, 0.1, 0.95, 1.1), col("#1c1410"));
      const gl = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.62), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.95, 0.34, 0.07), fog: false })); gl.rotation.y = nx * -Math.PI / 2; gl.position.set(mouthX - nx * 0.04, 1.2, oz); gl.layers.set(3); root.add(gl);
      const fire = makeFire(V(mouthX + nx * 0.2, 0.86, oz), 0.5, { power: 22 }); root.add(fire.obj); parts.push(fire);
      b.add(box(nx * (X + 2.2), 0, oc + 1.55, 0.7, 0.55, 0.9), plaster("#b09a78"));
      // a stack of firewood beside the oven and a bench of loaves (behind the baker, so the lower third of the oven shot is not an empty wall)
      for (let k = 0; k < 3; k++) for (let j = 0; j < 4 - k; j++) b.add(new THREE.CylinderGeometry(0.075, 0.075, 0.7, 7).rotateX(Math.PI / 2).translate(nx * (X + 1.75), 0.1 + 0.15 * k, oz - 1.22 + j * 0.17 + k * 0.085), col(j % 2 ? "#7a5232" : "#8a6240"));
      b.add(box(nx * (X + 1.85), 0, oc - 0.1, 0.5, 0.72, 0.9), WOOD); b.add(box(nx * (X + 1.85), 0.72, oc - 0.1, 0.62, 0.05, 1.0), WOODL);
      for (let k = 0; k < 6; k++) b.add(new THREE.SphereGeometry(0.15, 10, 7).scale(1, 0.62, 1).translate(nx * (X + 1.85 + (k % 2) * 0.12 - 0.06), 0.84 + (k > 3 ? 0.08 : 0), oc - 0.5 + 0.14 * k), col("#c98c4a"));
      // the millstone on the pavement beside the shop front: a stone drum with an hourglass mill on it
      const mx = nx * (ROAD + 0.55), mz2 = oc + PLACE.bakery.w / 2 + 0.5 - 0.1;
      b.add(new THREE.CylinderGeometry(0.62, 0.66, 0.5, 18).translate(mx, 0.26, mz2), STONE_D); b.add(new THREE.CylinderGeometry(0.28, 0.5, 0.45, 18).translate(mx, 0.99, mz2), STONE); b.add(new THREE.ConeGeometry(0.5, 0.45, 18).rotateX(Math.PI).translate(mx, 1.2, mz2).scale(1, 1, 1), STONE); b.add(rod(V(mx, 0.5, mz2), V(mx, 1.9, mz2), 0.05), WOOD);
      b.add(rod(V(mx, 1.45, mz2), V(mx, 1.45, mz2 + 1.05), 0.04), WOOD);
    }
    if (u.kind === "merchant") {
      const oc = u.z, nx = u.side;
      for (let k = 0; k < 4; k++) amphora(b, nx * (X - 0.45 - 0.02 * k), 0.26, oc + 2.3 + k * 0.3, 0, nx * -0.22, 1.0, ["#c47a4a", "#b86a3e", "#c98a58", "#bd7040"][k]);
      b.add(box(nx * (X + 0.5), 0.95, oc, 0.1, 0.04, 0.1), DARK);
    }
    if (u.kind === "fountain") {
      // a street fountain: a block with a carved mask that spouts into a long stone trough on the pavement
      const nx = u.side, fz = u.z;
      b.add(box(nx * (X - 0.4), 0, fz, 0.8, 1.55, 0.95, 0), STONE); b.add(box(nx * (X - 0.4), 1.55, fz, 0.95, 0.14, 1.1), STONE_D);
      b.add(box(nx * (X - 0.9), 0, fz + 0.85, 0.55, 0.62, 1.7), STONE); b.add(box(nx * (X - 0.9), 0.62, fz + 0.85, 0.6, 0.1, 1.78), STONE_D);
      b.add(box(nx * (X - 0.9), 0.55, fz + 0.85, 0.36, 0.1, 1.5), col("#3a7fa0"));
      b.add(new THREE.SphereGeometry(0.17, 10, 8).translate(nx * (X - 0.78), 1.15, fz), STONE_D); b.add(box(nx * (X - 0.8), 1.07, fz, 0.2, 0.06, 0.1), DARK);
      const spout: THREE.Mesh[] = []; const sg = new THREE.SphereGeometry(0.022, 6, 5), sm = new THREE.MeshBasicMaterial({ color: "#bfe6f5" });
      for (let k = 0; k < 14; k++) { const m = new THREE.Mesh(sg, sm); m.layers.set(3); spout.push(m); root.add(m); }
      parts.push({ obj: new THREE.Group(), update: (t) => spout.forEach((m, k) => { const u2 = (t * 1.5 + k / 14) % 1; m.position.set(nx * (X - 0.96 - 0.12 * u2), 1.12 - 0.56 * u2 * u2 - 0.02 * u2, fz); }) });
    }
  });
  // ---- pines, cypresses, olive trees ----
  for (const [x, z, h] of [[15, 10, 12], [-14, 2, 11.5], [14, -16, 13], [-15, -30, 12.5], [16, -52, 13], [-14, -80, 14], [13, 26, 12], [-16, 30, 12]] as const) pine(b, x, z, h, x);
  { const pb = new Batch(); for (const [x, z, h] of [[9.5, -50, 28], [-11, -62, 32]] as const) pine(pb, x, z, h, x); pinesNear = new THREE.Group(); pb.build(pinesNear, true); pinesNear.visible = false; root.add(pinesNear); }
  for (let i = 0; i < 6; i++) { const side = i % 2 ? 1 : -1; cypress(b, side * (4 + (i % 3) * 1.5), -63 - i * 1.6, 6 + (i % 3)); }
  { // Roman props: wooden barrels with iron-rope hoops, a handcart, market stalls with striped awnings and baskets
    const wood = col("#8a5a34"), ring = col("#3a2a1e"), stripes = lam("stallAwn", () => ({ map: stripeTex("#c8402a", "#f1e6c8"), side: THREE.DoubleSide }));
    const barrel = (x: number, y: number, z: number) => { const pf = [[0, 0], [0.26, 0], [0.31, 0.2], [0.33, 0.38], [0.31, 0.56], [0.26, 0.75], [0, 0.75]].map(([r, h]) => new THREE.Vector2(r, h)); b.add(new THREE.LatheGeometry(pf, 14).translate(x, y, z), wood); for (const h of [0.14, 0.62]) b.add(new THREE.CylinderGeometry(0.325, 0.325, 0.035, 14).translate(x, y + h, z), ring); };
    barrel(-3.1, 0.26, 4.1); barrel(-2.75, 0.26, 4.5); barrel(3.1, 0.26, -2.3); barrel(3.0, 0.26, 4.4);
    const stall = (x: number, z: number, side: number) => { b.add(box(x, 0.26, z, 0.7, 0.75, 1.5), wood); for (const sz of [-0.7, 0.7]) b.add(rod(V(x + side * 0.3, 0.26, z + sz), V(x + side * 0.3, 2.0, z + sz), 0.03), wood);
      for (let k = 0; k < 5; k++) b.add(new THREE.SphereGeometry(0.13, 8, 6).scale(1, 0.7, 1).translate(x, 1.1, z - 0.55 + k * 0.28), col(["#c24a2a", "#d9a02e", "#6a8a3c", "#c9a25a", "#a8452f"][k]));
      for (const k of [-1, 1]) b.add(new THREE.CylinderGeometry(0.2, 0.17, 0.25, 10).translate(x, 1.28, z + k * 0.35), col("#a07a4a")); };
    for (const [x, z, sd] of [[2.95, 9.0, 1], [-2.95, -17, -1], [2.95, -22, 1], [-2.95, -32, -1], [2.95, -38, 1], [-2.95, 9.8, -1], [2.95, -48, 1]] as const) { stall(x, z, sd); const cl = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.9).rotateX(-Math.PI / 2).translate(0, 0, 0), stripes); cl.position.set(x - sd * 0.15, 2.0, z); cl.rotation.z = sd * 0.18; cl.castShadow = true; root.add(cl); }
  }
  b.build(root, true);
  for (const [x, z, s] of [[-30, -70, 3], [34, -80, 4], [-44, -90, 5], [48, -100, 6]] as const) { const t = makeTree(s, { height: 5, leaves: 1800, colors: ["#5a6f3a", "#7f9650", "#aab86e"], bark: "#5a4a3a" }); t.obj.position.set(x, 0, z); root.add(t.obj); parts.push(t); }
  // props from the model kit: barrels and crates at the merchant's and the baker's
  void model;
  // ---- Vesuvius: one green cone, vineyards on its slopes, a crater at the top ----
  { const R = MOUNT.r, H = MOUNT.h, NA = 120, NR = 44, pos: number[] = [], uv: number[] = [], idx: number[] = [], rr = prng(9);
    const body = (r: number, a: number) => H * Math.pow(Math.max(0, 1 - r / R), 1.45) * (1 + 0.05 * Math.sin(a * 6 + r * 0.03) + 0.03 * Math.sin(a * 13));
    const prof = (r: number, a: number) => (r < 6 ? body(6, a) - 3 * (1 - (r / 6) ** 2) : body(r, a));
    for (let j = 0; j <= NR; j++) for (let i = 0; i <= NA; i++) { const a = (i / NA) * Math.PI * 2, t = j / NR, r = R * t * t * 0.55 + R * t * 0.45; const rad = r; pos.push(MOUNT.x + Math.cos(a) * rad, prof(rad, a), MOUNT.z + Math.sin(a) * rad); uv.push(i / NA, t); }
    for (let j = 0; j < NR; j++) for (let i = 0; i < NA; i++) { const a = j * (NA + 1) + i, c = a + NA + 1; idx.push(a, c, a + 1, a + 1, c, c + 1); }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
    const m = new THREE.Mesh(g, lam("vesuvius", () => ({ map: mountTex(), fog: false }))); m.receiveShadow = true; m.castShadow = false; root.add(m); void rr; }
  // ---- the eruption ----
  craterGlow = new THREE.Group();
  for (let i = 0; i < 26; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 9), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.15, 0.38, 0.04), fog: false })); m.layers.set(3); fireBalls.push(m); craterGlow.add(m); }
  jet = new THREE.Mesh(new THREE.ConeGeometry(1, 1, 12, 1, true).translate(0, 0.5, 0), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.15, 0.3, 0.03), fog: false, side: THREE.DoubleSide })); jet.layers.set(3); craterGlow.add(jet);
  for (let i = 0; i < 26; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), new THREE.MeshBasicMaterial({ color: "#2a1608", fog: false })); m.layers.set(3); rocks.push(m); craterGlow.add(m); }
  fireGlow = glow("#ff4a08", 60, 0.7); craterGlow.add(fireGlow);
  core = new THREE.Mesh(new THREE.ConeGeometry(1, 1, 10, 1, true).translate(0, 0.5, 0), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.3, 0.65, 0.07), fog: false, side: THREE.DoubleSide })); core.layers.set(3); craterGlow.add(core);
  root.add(craterGlow);
  // the column is grey ash, drawn with its own flat greys (the red light of the street does not turn it brown): glowing at the foot,
  // dark in the trunk's shadow side, pale where the crown catches the daylight above the town
  const ash = (h: string) => new THREE.MeshBasicMaterial({ color: h, fog: false }), mats = ["#c26a2e", "#5b5552", "#77716d", "#928c87", "#aaa49e", "#c4beb7", "#6a6460"].map(ash), sg = new THREE.IcosahedronGeometry(1, 2), rc = prng(31);
  clouds = []; cloudInfo = [];
  for (let i = 0; i < 300; i++) {
    const kind = i < 90 ? 0 : i < 250 ? 1 : 2;   // 0 trunk, 1 crown, 2 skirt at the crater
    const m = new THREE.Mesh(sg, mats[0]); m.castShadow = false; m.receiveShadow = false; m.visible = false; clouds.push(m); root.add(m);
    cloudInfo.push({ kind, u: rc(), a: rc() * 6.283, q: rc(), s: 0.7 + 0.6 * rc(), c: rc() });
  }
  (clouds as THREE.Mesh[] & { mats?: THREE.Material[] }).mats = mats;
  // ---- the air: sunlit dust before the blast, embers and ash after it; near ones big and soft, far ones small and sharp ----
  const pts = (n: number, size: number, hard: number, additive: boolean) => { const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 3), 3)); const p = new THREE.Points(g, new THREE.PointsMaterial({ map: softTex(hard), size, sizeAttenuation: true, transparent: true, depthWrite: false, fog: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending })); p.frustumCulled = false; p.layers.set(3); root.add(p); return p; };
  airNear = pts(AIR_N, 0.24, 0, true); airFar = pts(AIR_F, 0.045, 0.5, true); airAsh = pts(AIR_A, 0.07, 0.2, false);
  // ---- foreground pieces: amphorae and a stone column, placed against the lens each frame ----
  { const b2 = new Batch(); fgAmph = new THREE.Group(); amphora(b2, 0, 0, 0, 0, 0.0, 0.8, "#e8a066"); amphora(b2, 0.42, 0, 0.1, 0, 0.12, 0.66, "#dd9058"); amphora(b2, -0.4, 0, 0.05, 0, -0.1, 0.72, "#efb078"); amphora(b2, 0.1, 0, -0.45, 0, 0.05, 0.6, "#d88850"); b2.build(fgAmph, false); fgAmph.visible = false; root.add(fgAmph);
    const b3 = new Batch(), cream = col("#efe2c4"); fgCol = new THREE.Group(); b3.add(new THREE.CylinderGeometry(0.16, 0.18, 1.55, 14).translate(0, 0.9, 0), cream); b3.add(box(0, 0, 0, 0.5, 0.2, 0.5), col("#e2d2ae")); b3.add(box(0, 0.12, 0, 0.4, 0.1, 0.4), col("#e2d2ae")); b3.add(box(0, 1.65, 0, 0.5, 0.2, 0.5), col("#e2d2ae")); b3.add(box(0, 1.58, 0, 0.36, 0.1, 0.36), col("#e2d2ae")); b3.build(fgCol, false); fgCol.visible = false; root.add(fgCol);
    fgAwn = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.0).rotateX(-Math.PI / 2.4), lam("fgAwn", () => ({ map: stripeTex("#c8402a", "#f1e6c8"), side: THREE.DoubleSide }))); fgAwn.visible = false; root.add(fgAwn);
  }
  // ---- things that break: the handcart, loose amphorae and their shards, lightning in the column ----
  { const cb = new Batch(), wood = col("#8a5a34"), woodD = col("#6b4a2e"), iron = col("#3a2a1e"); cartG = new THREE.Group();
    cb.add(box(0, 0.62, 0, 1.0, 0.1, 1.7), wood); for (const sx of [-0.5, 0.5]) cb.add(box(sx, 0.72, 0, 0.06, 0.34, 1.7), woodD); cb.add(box(0, 0.72, -0.85, 1.0, 0.34, 0.06), woodD);
    for (const sx of [-0.58, 0.58]) { cb.add(new THREE.CylinderGeometry(0.5, 0.5, 0.08, 18).rotateZ(Math.PI / 2).translate(sx, 0.5, -0.1), wood); cb.add(new THREE.CylinderGeometry(0.1, 0.1, 0.12, 10).rotateZ(Math.PI / 2).translate(sx, 0.5, -0.1), iron); for (let k = 0; k < 4; k++) cb.add(box(sx, 0.5 - 0.03, -0.1, 0.1, 0.06, 0.92).applyMatrix4(new THREE.Matrix4().makeTranslation(sx, 0.5, -0.1).multiply(new THREE.Matrix4().makeRotationX((k * Math.PI) / 4)).multiply(new THREE.Matrix4().makeTranslation(-sx, -0.5, 0.1))), woodD); }
    for (const sx of [-0.42, 0.42]) cb.add(rod(V(sx, 0.64, 0.85), V(sx, 0.78, 2.0), 0.035), woodD);
    for (const [x, z, k] of [[-0.25, -0.45, 0], [0.22, -0.3, 1], [-0.05, 0.25, 2]] as const) amphora(cb, x, 0.67, z, 0, 0, 0.62, ["#c47a4a", "#b86a3e", "#c98a58"][k]);
    for (const [x, z] of [[0.28, 0.5], [-0.3, 0.6]] as const) { cb.add(new THREE.CylinderGeometry(0.2, 0.16, 0.22, 10).translate(x, 0.78, z), col("#b98a4e")); cb.add(new THREE.SphereGeometry(0.17, 9, 6).scale(1, 0.55, 1).translate(x, 0.92, z), col("#c98c4a")); }
    cb.build(cartG, true); cartG.visible = false; cartG.rotation.order = "YZX"; root.add(cartG);
    const pg = new THREE.LatheGeometry([[0, 0], [0.04, 0.0], [0.1, 0.1], [0.2, 0.32], [0.235, 0.55], [0.2, 0.78], [0.11, 0.94], [0.075, 1.04], [0.1, 1.1], [0.095, 1.13], [0, 1.13]].map(([r, h]) => new THREE.Vector2(r, h)), 14);
    potMeshes = []; for (let i = 0; i < POT_N; i++) { const m = new THREE.Mesh(pg, col(["#c47a4a", "#b86a3e", "#c98a58", "#bd7040"][i % 4])); m.castShadow = true; m.visible = false; m.rotation.order = "ZXY"; potMeshes.push(m); root.add(m); }
    const shg = new THREE.TetrahedronGeometry(1, 0).scale(1, 0.35, 0.8); shardMesh = new THREE.InstancedMesh(shg, col("#c47a4a"), SHARD_N); shardMesh.frustumCulled = false; shardMesh.castShadow = true; shardMesh.visible = false; root.add(shardMesh);
    // lightning: four fixed jagged bolts in the lower trunk, each a ribbon facing the town; one or two flash at a time for two frames
    boltMeshes = []; const br = prng(57);
    for (let k = 0; k < 5; k++) { const pos: number[] = [], idx: number[] = []; let x = (br() - 0.5) * 16, y = 62 - 14 * br(), w = 0.75; const n = 9;
      for (let i = 0; i <= n; i++) { pos.push(x - w, y, 0, x + w, y, 0); if (i < n) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); } x += (br() - 0.5) * 9; y -= (48 / n) * (0.6 + 0.8 * br()); w *= 0.93; }
      const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
      const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: new THREE.Color(2.3, 2.1, 1.5), fog: false, side: THREE.DoubleSide })); m.layers.set(3); m.renderOrder = 5; m.visible = false; m.frustumCulled = false; boltMeshes.push(m); root.add(m); }
    boltGlow = glow("#ffe6b0", 70, 0.55); boltGlow.visible = false; root.add(boltGlow);
  }
  // ---- falling stones of pumice ----
  const stoneGeo = new THREE.IcosahedronGeometry(1, 1).toNonIndexed(); { const p = stoneGeo.attributes.position as THREE.BufferAttribute, seen = new Map<string, number>(); for (let i = 0; i < p.count; i++) { const k = p.getX(i).toFixed(3) + p.getY(i).toFixed(3) + p.getZ(i).toFixed(3); if (!seen.has(k)) seen.set(k, 0.78 + 0.34 * ((Math.sin(i * 12.9898 + k.length * 78.233) * 43758.5453) % 1 + 1) % 1); const f = seen.get(k)!; p.setXYZ(i, p.getX(i) * f, p.getY(i) * f * 0.85, p.getZ(i) * f); } stoneGeo.computeVertexNormals(); }
  stoneMesh = new THREE.InstancedMesh(stoneGeo, lam("pumice", () => ({ color: "#f1ece0" })), STONE_N); stoneMesh.frustumCulled = false; stoneMesh.castShadow = true; stoneMesh.visible = false; root.add(stoneMesh);
};

const _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new THREE.Vector3(), _s = new THREE.Vector3();
const sm01 = (x: number) => { const u = Math.max(0, Math.min(1, x)); return u * u * (3 - 2 * u); };
/** the column at `t` seconds after the blast: height of the trunk above the crater and the width of the crown */
export const column = (t: number) => ({ H: 300 * (1 - Math.exp(-t / 2.6)), R: 18 + 74 * sm01((t - 1.5) / 8), top: 300 * (1 - Math.exp(-t / 2.6)) });
const landY = (x: number, z: number, st: PompState): number => {
  for (const a of AWN) { if (st.awnDrop && st.awnDrop(a.side, a.z) > 0.4) continue; const dist = Math.abs(a.side * X - x); if (Math.sign(x) === a.side && dist < a.len && Math.abs(z - a.z) < a.hw) return a.yTop - a.drop * (dist / a.len); }
  return Math.abs(x) > ROAD && Math.abs(x) < X ? 0.27 : 0.03;
};

export const updatePompeii = (t: number, st: PompState = {}, cam?: THREE.PerspectiveCamera) => {
  for (const p of parts) p.update(t);
  if (cam) {
    const post = st.eruptT !== undefined, cp = cam.position, fwd = new THREE.Vector3(), rt = new THREE.Vector3(), up = new THREE.Vector3();
    cam.getWorldDirection(fwd); rt.setFromMatrixColumn(cam.matrixWorld, 0); up.setFromMatrixColumn(cam.matrixWorld, 1);
    const fill = (pts: THREE.Points, S: number[][], n: number, box: [number, number, number], vy: number, sway: number) => { const a = pts.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < n; i++) { const [x, y, z, k] = S[i]; a.setXYZ(i, cp.x + (x - 0.5) * box[0] + sway * Math.sin(t * 0.7 + k * 9), cp.y + (fr1(y + t * vy * (0.6 + k)) - 0.35) * box[1], cp.z + (z - 0.5) * box[2] + sway * Math.cos(t * 0.5 + k * 7)); } a.needsUpdate = true; };
    fill(airNear, AS_N, AIR_N, [9, 6, 12], post ? 0.05 : -0.012, 0.25); fill(airFar, AS_F, AIR_F, [18, 9, 40], post ? 0.03 : -0.008, 0.4); fill(airAsh, AS_A, AIR_A, [14, 8, 24], -0.06, 0.5);
    const mk = (p: THREE.Points, r: number, g: number, b: number, o: number) => { const m = p.material as THREE.PointsMaterial; m.color.setRGB(r, g, b); m.opacity = o; };
    mk(airNear, post ? 1.3 : 1.0, post ? 0.55 : 0.82, post ? 0.14 : 0.5, post ? 0.85 : 0.55); mk(airFar, post ? 1.4 : 1.1, post ? 0.65 : 0.9, post ? 0.2 : 0.6, 0.95);
    airAsh.visible = post; mk(airAsh, 0.45, 0.4, 0.38, 0.55);
    // foreground: pieces at the sides of the picture, close to the lens
    const th = Math.tan((cam.fov * Math.PI) / 360), tw = th * cam.aspect, fg = st.fg ?? {};
    const put = (o: THREE.Object3D, d: number, sx: number, sy: number) => o.position.copy(cp).addScaledVector(fwd, d).addScaledVector(rt, sx * d * tw).addScaledVector(up, sy * d * th);
    fgAmph.visible = !!fg.amph; if (fg.amph) { put(fgAmph, 1.7, fg.amph * 0.78, -0.93); fgAmph.rotation.set(0, 0.5, 0); fgAmph.scale.setScalar(0.62); }
    fgCol.visible = !!fg.col; if (fg.col) { put(fgCol, 2.2, fg.col * 1.08, -0.98); fgCol.rotation.set(0, 0, 0); fgCol.scale.setScalar(1.35); }
    fgAwn.visible = !!fg.awn; if (fg.awn) { put(fgAwn, 1.9, fg.awn * 0.85, 0.95); fgAwn.scale.setScalar(0.45); fgAwn.rotation.set(0, 0, 0); fgAwn.quaternion.copy(cam.quaternion); fgAwn.rotateX(-0.9); fgAwn.rotateZ(fg.awn * 0.25); }
  }
  // the awnings tremble with the ground; one that comes down swings on its wall, tears off and lies on the pavement
  for (const a of awnGroups) {
    const d = Math.max(0, Math.min(1, st.awnDrop ? st.awnDrop(a.side, a.z) : 0)), sh = (st.shake ?? 0) * 0.07 * Math.sin(t * 23 + a.ph) + (st.shake ?? 0) * 0.03 * Math.sin(t * 37 + a.ph * 2);
    // it sags under the stones; then it tears off the WALL: the wall edge swings down and away while the ropes still hold the outer edge
    // (so the cloth falls away from the doorway, never across it), and at last the whole thing drops flat into the street
    const sag = 0.35 * sm01(d / 0.25), phi = (Math.PI / 2) * sm01((d - 0.25) / 0.35), fall = sm01((d - 0.6) / 0.4);
    const rot = (x: number, y: number, an: number): [number, number] => [x * Math.cos(an) - y * Math.sin(an), x * Math.sin(an) + y * Math.cos(an)];
    const s0 = a.side * (sh + sag), [ex, ey] = rot(-a.side * a.len, -a.drop, s0), [ox, oy] = rot(-ex, -ey, -a.side * phi);   // (ex, ey): the outer edge, the pivot once the wall edge has torn loose
    const hx = a.side * X + ex + ox, hy = a.y0 + ey + oy, hr = s0 - a.side * phi, lx = a.side * (X - 2.0), ly = 0.62;       // hanging from its ropes; lying in the street
    a.g.rotation.set(0.1 * fall * Math.sin(a.ph), 0, hr * (1 - fall)); a.g.position.set(hx + (lx - hx) * fall, hy + (ly - hy) * fall, a.z);
  }
  cartG.visible = !!st.cart; if (st.cart) { cartG.position.set(st.cart.x, st.cart.y ?? 0, st.cart.z); cartG.rotation.set(0, st.cart.yaw, st.cart.roll); }
  potMeshes.forEach((m, i) => { const q = st.pots?.[i]; m.visible = !!q; if (q) { m.position.set(q.x, q.y, q.z); m.rotation.set(q.rx ?? 0, 0, q.rz ?? 0); m.scale.setScalar(q.s ?? 0.9); } });
  shardMesh.visible = !!st.smash?.length;
  if (st.smash?.length) {
    let n = 0;
    for (const sm of st.smash.slice(0, SHARD_N / SHARD_PER)) { const r = prng(77 + (sm.seed ?? 0) * 13 + Math.round(sm.x * 10));
      for (let k = 0; k < SHARD_PER; k++) { const a = r() * 6.283, v = 1.2 + 3.2 * r(), vy = 1.5 + 3.5 * r(), size = 0.05 + 0.09 * r(), tt = Math.max(0, sm.t), tl = (vy + Math.sqrt(vy * vy + 19.6 * Math.max(0, sm.y))) / 9.8, te = Math.min(tt, tl);
        _p.set(sm.x + Math.cos(a) * v * te, Math.max(0.03 + size * 0.3, sm.y + vy * te - 4.9 * te * te), sm.z + Math.sin(a) * v * te); _e.set(te * 9 * r(), a, te * 7 * r()); _s.setScalar(sm.t < 0 ? 0 : size); _m4.compose(_p, _q.setFromEuler(_e), _s); shardMesh.setMatrixAt(n++, _m4); } }
    for (; n < SHARD_N; n++) { _s.setScalar(0); _p.set(0, -50, 0); _m4.compose(_p, _q.identity(), _s); shardMesh.setMatrixAt(n, _m4); }
    shardMesh.instanceMatrix.needsUpdate = true;
  }
  // ---- the cloud ----
  const E = st.eruptT, on = E !== undefined && E >= 0, mats = (clouds as unknown as { mats: THREE.Material[] }).mats;
  craterGlow.visible = on;
  if (on) {
    const e = E!, { H, R } = column(e), fade = 1 - sm01((e - 2.5) / 7);
    const fk = (1 - sm01((e - 3) / 8));
    fireBalls.forEach((m, i) => { const a = (i / 26) * 6.283 * 2.3, u = Math.min(1, e / 1.2), hi = (i % 5) * 0.25, rad = (2.4 + 4.4 * u) * (0.6 + 0.4 * ((i * 7) % 3) / 2); m.position.set(SUMMIT[0] + Math.cos(a) * 5 * u * (0.4 + 0.6 * hi), SUMMIT[1] + 1 + (4 + 15 * hi) * u + 1.2 * e * hi, SUMMIT[2] + Math.sin(a) * 5 * u * (0.4 + 0.6 * hi)); m.scale.setScalar(Math.max(0.01, rad * fk)); m.visible = fk > 0.02; });
    jet.position.set(SUMMIT[0], SUMMIT[1] - 1, SUMMIT[2]); jet.scale.set(2.6 + 2.5 * Math.min(1, e), 13 * Math.min(1, e / 0.5) * (1 - sm01((e - 2.5) / 3)) + 0.01, 2.2 + 2.5 * Math.min(1, e)); jet.visible = e < 6; const fl = 1 + 0.12 * Math.sin(t * 31) + 0.08 * Math.sin(t * 53 + 1); jet.scale.multiplyScalar(fl); core.position.copy(jet.position); core.scale.set(jet.scale.x * 0.5, jet.scale.y * 0.8, jet.scale.z * 0.5); core.visible = jet.visible;
    rocks.forEach((m, i) => { const a = i * 2.39996, v = 7 + 9 * ((i * 37) % 10) / 10, vy = 6 + 12 * ((i * 53) % 10) / 10, te = Math.max(0, e - 0.05 * (i % 4)); const y = vy * te - 4.2 * te * te; m.position.set(SUMMIT[0] + Math.cos(a) * v * te * 0.7, SUMMIT[1] + y, SUMMIT[2] + Math.sin(a) * v * te * 0.7); m.scale.setScalar(0.45 + 0.5 * ((i * 11) % 5) / 5); m.visible = e < 7 && y > -2; });
    fireGlow.position.set(SUMMIT[0], SUMMIT[1] + 8, SUMMIT[2]); fireGlow.scale.setScalar(55 * (0.55 + 0.45 * fk) * Math.min(1, e / 0.4) * (1 + 0.08 * Math.sin(t * 27)));
    clouds.forEach((m, i) => {
      const c = cloudInfo[i], rise = 1 - Math.exp(-e / 2.6);
      let x = 0, y = 0, z = 0, r = 10, flat = 1;
      if (c.kind === 0) {           // the trunk: a narrow bundle of billows going straight up, a little wider near the top
        const u = c.u, rad = (4 + 5 * u * u + 7 * c.q) * (0.55 + 0.45 * sm01(e / 2));
        x = Math.cos(c.a) * rad * 0.7; z = Math.sin(c.a) * rad * 0.7; y = 4 + u * H * 0.92; r = (8.5 + 5 * u) * c.s * (0.5 + 0.5 * sm01(e / 1.2));
        m.material = mats[u < 0.07 ? 0 : Math.cos(c.a - 0.9) > 0.25 ? (u < 0.4 ? 1 : 2) : u < 0.5 ? 2 : 3];
      } else if (c.kind === 1) {    // the crown: billows spread wide and flat on top of the trunk and droop at the rim: the branches of the umbrella pine
        const rho = Math.sqrt(c.u) * R * 1.0, wide = sm01((e - 0.8) / 2.5), drop = (0.1 * rho + 0.004 * rho * rho) * 0.9 + 9 * c.q;
        x = Math.cos(c.a) * rho * wide; z = Math.sin(c.a) * rho * wide * 0.8; y = H * 0.94 + 12 - drop * wide + 10 * (1 - c.q) * (1 - Math.sqrt(c.u)); r = (15 + 12 * (1 - c.u)) * c.s * (0.35 + 0.65 * wide) * (0.5 + 0.5 * rise); flat = 0.72;
        m.material = mats[c.q > 0.62 ? 6 : c.q > 0.4 ? 3 : c.c > 0.5 ? 5 : 4];   // the hanging billows (high q = low) are in shadow, the top is pale
      } else {                      // the skirt: ash pouring over the crater rim, lit from below by the fire
        const rho = (5 + 20 * c.u) * sm01(e / 2), drop = 4 * c.u;
        x = Math.cos(c.a) * rho; z = Math.sin(c.a) * rho; y = 2 + 12 * c.q * rise - drop; r = (8 + 9 * c.q) * c.s * (0.4 + 0.6 * sm01(e / 1.5));
        m.material = mats[c.q < 0.3 ? 0 : c.c > 0.5 ? 1 : 2];
      }
      const cp2 = st.cap ?? 1, wk = 0.5 + 0.5 * cp2, rr = Math.max(0.01, r * CS * wk); m.position.set(SUMMIT[0] + x * CS * wk, SUMMIT[1] + y * CS * cp2, SUMMIT[2] + z * CS * wk); m.scale.set(rr, rr * flat, rr); m.visible = e > 0.02;
    });
  } else clouds.forEach((m) => { m.visible = false; });
  // lightning in the foot of the column: a bolt or two for two frames, several times a second
  { const bt = st.bolts, fr = bt === undefined ? -1 : Math.floor(bt * 30), slot = Math.floor(fr / 7), on2 = on && E! > 1.1 && fr >= 0 && fr % 7 < 2 && fr1(Math.sin(slot * 91.7) * 43758.5) > 0.25;
    boltMeshes.forEach((m, k) => { const pick = on2 && (Math.floor(fr1(Math.sin(slot * 12.9) * 43758.5) * 5) === k || (slot % 3 === 0 && (k + slot) % 5 === 0)); m.visible = pick; if (pick) { m.position.set(SUMMIT[0], SUMMIT[1] - 4, SUMMIT[2] + 16); m.scale.set(slot % 2 ? 1 : -1, 1, 1); } });
    boltGlow.visible = false; if (false as boolean) { boltGlow.position.set(SUMMIT[0], SUMMIT[1] + 28, SUMMIT[2] + 14); boltGlow.scale.setScalar(46); } }
  // ---- the stones ----
  const S = st.stones, avoid = st.avoid ?? [];
  stoneMesh.visible = S !== undefined && S >= 0;
  if (S !== undefined && S >= 0) {
    const r = prng(1234);
    for (let i = 0; i < STONE_N; i++) {
      const u = i / STONE_N, t0 = 7 * Math.pow(u, 1.25) + 0.25 * r(), size = (0.04 + 0.13 * Math.pow(r(), 1.8) + (i % 23 === 0 ? 0.07 : 0)) * (st.stoneScale ?? 1), vf = 14 + 8 * r();
      let x = (r() - 0.5) * 2 * (st.stoneHalf ?? ROAD + 1.15), z = (st.zmax ?? 4.3) - (st.stoneSpan ?? 33.6) * r() * r(), y0 = 7 + 18 * r();
      const alpha = r(), yaw = r() * 6.283, tum = 2 + 4 * r();
      for (const [ax, , ar] of avoid) { const dx = x - ax; if (Math.abs(dx) < ar) x = ax + (dx >= 0 ? 1 : -1) * (ar + 0.1 + 0.9 * alpha); }
      const ly = landY(x, z, st) + size * 0.5, tau = S - t0;
      let y = y0 + ly;
      if (tau < 0) { _s.setScalar(0); _p.set(x, -50, z); _m4.compose(_p, _q.identity(), _s); stoneMesh.setMatrixAt(i, _m4); continue; }
      const tf = y0 / vf;
      if (tau < tf) y = ly + y0 - vf * tau;
      else {   // bounce: three hops, each lower and shorter; then it lies where it fell
        let vb = vf * 0.42, tt = tau - tf; y = ly;
        for (let k = 0; k < 3; k++) { const dur = (2 * vb) / 9.8; if (tt < dur) { y = ly + vb * tt - 4.9 * tt * tt; break; } tt -= dur; vb *= 0.45; }
      }
      _e.set(tau * tum * 0.6 + alpha, yaw + tau * tum * 0.4, tau * 0.7);
      _p.set(x, y, z); _s.set(size * 1.1, size * 0.8, size); _m4.compose(_p, _q.setFromEuler(_e), _s); stoneMesh.setMatrixAt(i, _m4);
    }
    stoneMesh.instanceMatrix.needsUpdate = true;
  }
};

/** brightness 0..1 of the blast and where it is, for the world's one light (it lights the street from the mountain) */
export const pompFlare = (E: number | undefined): { k: number; pos: [number, number, number] } | null => (E === undefined || E < 0 ? null : { k: 0.5 * Math.exp(-E / 3) + 0.15, pos: [SUMMIT[0], SUMMIT[1] + 20, SUMMIT[2]] });
void softTex; void glow; void noInk;

/** the colour moods: warm gold before the eruption, fire red right after it, ash-dark red-brown at the end (no violet or blue anywhere); world.ts mixes by moodAt (0 .. 0.5 .. 1) */
export const GOLD_L = { ...LIGHTS.golden, lit: [1.55, 1.05, 0.55], shade: [0.55, 0.36, 0.2], lift: [0.1, 0.07, 0.04], charTint: [1.0, 0.86, 0.66], blob: [0.8, 0.7, 0.55], fog: "#f6d08a", fogNear: 40, fogFar: 360, sunCol: "#ffcf80", sunI: 4.4, sky: "#ffe2a8", ground: "#b88a50", hemiI: 0.7 };
export const GOLD_K = { ...LOOK.golden, sky: { c: ["#fff0b8", "#ffe29a", "#ffd682", "#ffcf78", "#f5c570"], e: LOOK.golden.sky.e }, sat: 1.05, bounce: [0.06, 0.03, 0] };
export const FIRE_L = { ...LIGHTS.golden, lit: [1.55, 0.6, 0.2], shade: [0.34, 0.14, 0.08], lift: [0.11, 0.04, 0.02], charTint: [1.0, 0.72, 0.5], blob: [0.6, 0.45, 0.4], fog: "#d0561e", fogNear: 25, fogFar: 260, sunCol: "#ff8a30", sunI: 4.6, sky: "#e07a40", ground: "#7a3a1c", hemiI: 0.7 };
export const FIRE_K = { ...LOOK.golden, sky: { c: ["#ffb040", "#f07a2a", "#c8402a", "#8a1c22", "#4a0c16"], e: [0, 6, 14, 26, 50] }, sat: 1.1, bounce: [0.08, 0.03, 0] };
export const ASH_L = { ...LIGHTS.golden, lit: [0.34, 0.15, 0.08], shade: [0.085, 0.04, 0.03], lift: [0.02, 0.01, 0.008], charTint: [0.62, 0.42, 0.3], blob: [0.5, 0.4, 0.36], fog: "#170a07", fogNear: 6, fogFar: 120, sunCol: "#ff6a24", sunI: 1.5, sky: "#2a130c", ground: "#120805", hemiI: 0.4 };
export const ASH_K = { ...LOOK.golden, sky: { c: ["#4a1c0c", "#2a100a", "#180a07", "#100605", "#0a0403"], e: [0, 6, 14, 26, 50] }, sat: 0.9, bounce: [0.03, 0.012, 0] };
