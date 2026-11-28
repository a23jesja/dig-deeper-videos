// 3D props of the Emu War world, built from boxes, rods and smooth blobs so the ink pass outlines them:
// Lewis gun on its tripod, the 1930s truck, ammunition crates, tents, the farmhouse, the windmill, gum trees,
// bushes, rocks, fences, the dam and the scoreboard.
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { Batch, V, box, rod, col, lam, quad, xf } from "./geo";
import { ctex, rng } from "./paint";
import { NOINK } from "./ink";

const R = (seed: number) => rng(seed * 7 + 3);
const mesh = (g: THREE.BufferGeometry, m: THREE.Material | THREE.Material[], cast = true) => { const o = new THREE.Mesh(g, m); o.castShadow = cast; o.receiveShadow = true; return o; };
const merged = (parts: THREE.BufferGeometry[]) => mergeGeometries(parts.map((p) => (p.index ? p.toNonIndexed() : p)).map((p) => { if (!p.attributes.uv) p.setAttribute("uv", new THREE.Float32BufferAttribute(new Float32Array(p.attributes.position.count * 2), 2)); return p; }), false);
/** smooth squashed sphere */
const blobG = (x: number, y: number, z: number, rx: number, ry: number, rz: number, yaw = 0) => {
  const g = new THREE.SphereGeometry(1, 14, 10);
  g.applyMatrix4(new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), yaw), V(rx, ry, rz)));
  return g;
};

// ---------------- painted textures ----------------
const planks = (key: string, base: string, dark: string, stencil?: (g: CanvasRenderingContext2D) => void) => ctex(key, 512, 256, (g, r) => {
  g.fillStyle = base; g.fillRect(0, 0, 512, 256);
  for (let i = 0; i < 4; i++) {
    g.fillStyle = `rgba(${r() > 0.5 ? "255,240,200" : "60,30,10"},${0.05 + 0.08 * r()})`; g.fillRect(0, i * 64, 512, 64);
    g.strokeStyle = dark; g.lineWidth = 5; g.beginPath(); g.moveTo(0, i * 64); g.lineTo(512, i * 64); g.stroke();
    for (let k = 0; k < 5; k++) { g.strokeStyle = "rgba(70,40,20,0.25)"; g.lineWidth = 2; const y = i * 64 + 10 + r() * 44, x = r() * 400; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 40 + r() * 80, y + (r() - 0.5) * 4); g.stroke(); }
  }
  g.strokeStyle = dark; g.lineWidth = 10; g.strokeRect(5, 5, 502, 246);
  stencil?.(g);
});
export const crateTex = () => planks("crate10k", "#b98a52", "#5a3a1e", (g) => {
  g.fillStyle = "#2c2118"; g.textAlign = "center"; g.textBaseline = "middle";
  g.font = "900 118px 'Arial Black', Impact, sans-serif"; g.fillText("10,000", 256, 108);
  g.font = "900 50px 'Arial Black', Impact, sans-serif"; g.fillText(".303 ROUNDS", 256, 200);
});
export const crateEmptyTex = () => planks("crateEmpty", "#b98a52", "#5a3a1e", (g) => {
  g.fillStyle = "#2c2118"; g.textAlign = "center"; g.textBaseline = "middle";
  g.font = "900 64px 'Arial Black', Impact, sans-serif"; g.fillText(".303", 256, 128);
});
const boardsTex = () => ctex("weatherboard", 512, 512, (g, r) => {
  g.fillStyle = "#efe3c8"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 12; i++) { g.fillStyle = `rgba(120,90,50,${0.03 + 0.05 * r()})`; g.fillRect(0, i * 43, 512, 43); g.fillStyle = "rgba(90,70,50,0.55)"; g.fillRect(0, i * 43, 512, 4); }
});
const tinTex = (key: string, a: string, b: string) => ctex(key, 256, 256, (g) => {
  for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? a : b; g.fillRect(i * 16, 0, 16, 256); }
  g.fillStyle = "rgba(120,60,30,0.18)"; g.fillRect(0, 150, 256, 60);
});
const barkTex = () => ctex("gumBark", 256, 512, (g, r) => {
  g.fillStyle = "#e4d9c6"; g.fillRect(0, 0, 256, 512);
  for (let i = 0; i < 40; i++) { g.fillStyle = r() > 0.5 ? "rgba(190,160,130,0.55)" : "rgba(160,150,150,0.4)"; const x = r() * 256, y = r() * 512; g.beginPath(); g.ellipse(x, y, 8 + r() * 16, 22 + r() * 50, 0, 0, 7); g.fill(); }
});
const canvasTex = () => ctex("tentCanvas", 256, 256, (g, r) => {
  g.fillStyle = "#e9dfc4"; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 30; i++) { g.fillStyle = `rgba(150,130,90,${0.04 + 0.05 * r()})`; g.fillRect(r() * 256, r() * 256, 40 + r() * 80, 6 + r() * 20); }
});
export const waterTex = () => ctex("damWater", 512, 512, (g, r) => {
  g.fillStyle = "#2a84ad"; g.fillRect(0, 0, 512, 512);
  g.lineCap = "round";
  for (let i = 0; i < 70; i++) { g.strokeStyle = r() > 0.4 ? "rgba(150,215,235,0.7)" : "rgba(18,80,130,0.6)"; g.lineWidth = 3 + r() * 3; const x = r() * 512, y = r() * 512, l = 20 + r() * 50; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + l / 2, y - 5, x + l, y); g.stroke(); }
});

// ---------------- Lewis gun ----------------
export type Gun = { root: THREE.Group; body: THREE.Group; legs: THREE.Mesh; muzzle: THREE.Vector3 };
/** Lewis gun on a tripod: root at the feet, the gun body pivots (yaw / pitch / recoil) at height h; barrel along +z */
export const lewisGun = (h = 0.9): Gun => {
  const steel = col("#4b505b"), drab = col("#6a6b4c"), wood = col("#8a5a34"), leg = col("#5d616a");
  const root = new THREE.Group(), body = new THREE.Group();
  const legsG = merged([rod(V(0, h - 0.03, 0), V(-0.36, 0, 0.26), 0.022), rod(V(0, h - 0.03, 0), V(0.36, 0, 0.26), 0.022), rod(V(0, h - 0.03, 0), V(0, 0, -0.44), 0.022),
    new THREE.SphereGeometry(0.05, 10, 8).translate(0, h - 0.03, 0)]);
  const legs = mesh(legsG, leg);
  const st = merged([
    box(0, 0.0, 0.05, 0.075, 0.105, 0.32),                    // receiver
    rod(V(0, 0.06, 0.2), V(0, 0.06, 0.88), 0.054, 0.054, 14),  // cooling shroud
    rod(V(0, 0.06, 0.88), V(0, 0.06, 0.97), 0.054, 0.07, 14),  // flared muzzle
    box(0, -0.1, -0.06, 0.035, 0.11, 0.05),                   // pistol grip
  ]);
  const mag = merged([new THREE.CylinderGeometry(0.16, 0.16, 0.052, 20).translate(0, 0.135, 0.07), new THREE.CylinderGeometry(0.035, 0.035, 0.03, 10).translate(0, 0.175, 0.07)]);
  const stock = merged([box(0, -0.005, -0.3, 0.05, 0.1, 0.4)]);
  body.add(mesh(st, steel), mesh(mag, drab), mesh(stock, wood));
  body.position.set(0, h, 0);
  root.add(legs, body);
  return { root, body, legs, muzzle: new THREE.Vector3(0, 0.06, 1.0) };
};

// ---------------- truck ----------------
export type Truck = { root: THREE.Group; body: THREE.Group; wheels: THREE.Mesh[]; gun: Gun; bedY: number; gunAt: THREE.Vector3; seatAt: THREE.Vector3; standAt: THREE.Vector3 };
/** 1930s flatbed: forward = +x, origin on the ground under the middle. The body group bounces; the wheels stay down. */
export const truck = (): Truck => {
  const paint = col("#647345"), dark = col("#3a3d42"), wood = lam("truckWood", () => ({ map: planks("truckPlanks", "#a87a48", "#5a3a1e") })), seat = col("#7a4a2c"), lamp = col("#f6e7b0");
  const root = new THREE.Group(), body = new THREE.Group();
  const b = new Batch();
  b.add(box(-0.3, 0.5, 0, 4.3, 0.14, 0.9), dark);
  b.add(box(-1.25, 0.72, 0, 2.3, 0.1, 1.76, 0, 1.2), wood);
  for (const s of [-1, 1]) b.add(box(-1.25, 0.82, s * 0.855, 2.3, 0.26, 0.05, 0, 1.2), wood);
  b.add(box(-2.38, 0.82, 0, 0.05, 0.26, 1.76, 0, 1.2), wood);
  b.add(box(0.5, 0.72, 0, 1.2, 0.08, 1.62), paint);
  for (const s of [-1, 1]) { b.add(box(0.52, 0.8, s * 0.79, 1.12, 0.5, 0.05), paint); b.add(box(1.05, 1.3, s * 0.79, 0.06, 0.67, 0.05), paint); b.add(box(-0.02, 1.3, s * 0.79, 0.06, 0.67, 0.05), paint); }
  b.add(box(-0.05, 0.8, 0, 0.06, 1.17, 1.62), paint);
  b.add(box(0.5, 1.95, 0, 1.3, 0.07, 1.72), paint);
  b.add(box(0.5, 0.3, 0, 1.2, 0.42, 1.5), dark);
  b.add(box(1.08, 0.8, 0, 0.06, 0.52, 1.62), paint);
  b.add(box(0.22, 0.8, 0, 0.42, 0.3, 1.4), seat);
  b.add(box(1.62, 0.8, 0, 1.05, 0.5, 0.96), paint);
  b.add(box(2.17, 0.78, 0, 0.07, 0.58, 0.86), dark);
  for (const s of [-1, 1]) {
    b.add(box(1.6, 0.9, s * 0.74, 1.05, 0.07, 0.42), dark);
    b.add(new THREE.SphereGeometry(0.13, 12, 10).translate(2.13, 1.12, s * 0.64), lamp);
  }
  b.add(box(-0.45, 0.82, 0, 0.6, 0.5, 0.62), lam("truckCrate", () => ({ map: crateEmptyTex() })));
  b.build(body);
  const wheels: THREE.Mesh[] = [];
  const tyre = merged([new THREE.CylinderGeometry(0.43, 0.43, 0.24, 20).rotateX(Math.PI / 2)]);
  const hub = merged([new THREE.CylinderGeometry(0.18, 0.18, 0.27, 12).rotateX(Math.PI / 2), box(0, -0.05, 0, 0.5, 0.1, 0.255)]);
  for (const [x, z] of [[1.6, 0.84], [1.6, -0.84], [-1.55, 0.84], [-1.55, -0.84]]) {
    const w = mesh(tyre, dark); w.add(mesh(hub, col("#c2ab6e")));
    w.position.set(x, 0.43, z); wheels.push(w); root.add(w);
  }
  const gun = lewisGun(0.7);
  gun.root.position.set(-0.45, 1.32, 0); gun.root.rotation.y = Math.PI / 2;
  body.add(gun.root);
  root.add(body);
  return { root, body, wheels, gun, bedY: 0.82, gunAt: new THREE.Vector3(-0.45, 2.02, 0), seatAt: new THREE.Vector3(0.32, 1.1, 0), standAt: new THREE.Vector3(-1.25, 0.82, 0) };
};

// ---------------- crates ----------------
export const crateGeo = () => { const g = box(0, 0, 0, 1.5, 0.74, 0.8); g.clearGroups(); g.addGroup(0, 24, 0); g.addGroup(24, 6, 1); g.addGroup(30, 6, 1); return g; };
export const crateMat = () => [lam("crate10k", () => ({ map: crateTex() })), lam("cratePlain", () => ({ map: planks("cratePlain", "#b98a52", "#5a3a1e") }))];
/** open, empty crate with its lid leaning on it */
export const emptyCrate = (b: Batch, x: number, z: number, yaw: number, y = 0, lid = true) => {
  const m = lam("crateEmpty", () => ({ map: crateEmptyTex() })), inside = col("#6e4a26");
  const M = new THREE.Matrix4().makeRotationY(yaw).setPosition(x, y, z);
  b.add(box(0, 0, 0, 0.9, 0.04, 0.52), inside, M);
  for (const s of [-1, 1]) { b.add(box(0, 0, s * 0.245, 0.9, 0.44, 0.03), m, M); b.add(box(s * 0.435, 0, 0, 0.03, 0.44, 0.52), m, M); }
  if (lid) b.add(box(0, 0, 0, 0.9, 0.03, 0.52).applyMatrix4(new THREE.Matrix4().makeRotationX(-1.15).setPosition(0, 0.02, -0.5)), m, M);
};

// ---------------- camp ----------------
export const tent = (b: Batch, x: number, z: number, yaw: number) => {
  const cv = lam("tentCanvas", () => ({ map: canvasTex(), side: THREE.DoubleSide })), dk = col("#5b4a3a", THREE.DoubleSide), pole = col("#8a6a44");
  const w = 1.5, h = 2.0, l = 1.8, M = new THREE.Matrix4().makeRotationY(yaw).setPosition(x, 0, z);
  b.add(quad(V(-w, 0, -l), V(-w, 0, l), V(0, h, l), V(0, h, -l), 2, 1), cv, M);
  b.add(quad(V(w, 0, l), V(w, 0, -l), V(0, h, -l), V(0, h, l), 2, 1), cv, M);
  const tri = (z0: number, m: THREE.Material, k = 1) => { const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute([-w * k, 0, z0, w * k, 0, z0, 0, h * k, z0], 3)); g.computeVertexNormals(); return b.add(g, m, M); };
  tri(l, cv); tri(-l, cv); tri(-l - 0.01, dk, 0.55);
  b.add(rod(V(0, 0, -l - 0.02), V(0, h + 0.25, -l - 0.02), 0.035), pole, M);
};

// ---------------- farm ----------------
export const farmhouse = (b: Batch, x: number, z: number) => {
  const wall = lam("weatherboard", () => ({ map: boardsTex() })), tin = lam("tinRed", () => ({ map: tinTex("tinRed", "#b5533c", "#9c4532"), side: THREE.DoubleSide })), trim = col("#7b9aa8"), dk = col("#4a3a34"), brick = col("#b0694c");
  const M = new THREE.Matrix4().makeTranslation(x, 0, z), W = 4.6, D = 3.2, H = 3.1;
  b.add(box(0, 0.25, 0, W * 2, H, D * 2, 0, 2.6), wall, M);
  b.add(box(0, 0, 0, W * 2 + 0.3, 0.25, D * 2 + 0.3), dk, M);
  const rh = 2.3, e = 0.5; // gabled tin roof, ridge along x
  b.add(quad(V(-W - e, H + 0.25, -D - e), V(W + e, H + 0.25, -D - e), V(W + e, H + 0.25 + rh, 0), V(-W - e, H + 0.25 + rh, 0), 6, 2), tin, M);
  b.add(quad(V(W + e, H + 0.25, D + e), V(-W - e, H + 0.25, D + e), V(-W - e, H + 0.25 + rh, 0), V(W + e, H + 0.25 + rh, 0), 6, 2), tin, M);
  for (const s of [-1, 1]) { const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute([s * W, H + 0.25, -D, s * W, H + 0.25, D, s * W, H + 0.25 + rh * 0.92, 0], 3)); g.computeVertexNormals(); b.add(g, lam("weatherboardD", () => ({ map: boardsTex(), side: THREE.DoubleSide })), M); }
  // veranda toward the field (-z side faces the lens)
  b.add(quad(V(-W - e, 2.55, -D - 2.6), V(W + e, 2.55, -D - 2.6), V(W + e, H + 0.35, -D), V(-W - e, H + 0.35, -D), 6, 1), tin, M);
  for (const px of [-W, -W / 3, W / 3, W]) b.add(box(px, 0, -D - 2.4, 0.16, 2.6, 0.16), trim, M);
  b.add(box(0, 0, -D - 1.3, W * 2 + 0.4, 0.22, 2.7), col("#a8855e"), M);
  // door and windows (boxes proud of the wall so they catch ink)
  b.add(box(0, 0.25, -D - 0.03, 1.1, 2.2, 0.08), col("#6f4a34"), M);
  for (const wx of [-2.7, 2.7]) { b.add(box(wx, 1.25, -D - 0.03, 1.3, 1.2, 0.08), col("#5b7f9c"), M); b.add(box(wx, 1.15, -D - 0.05, 1.5, 0.1, 0.14), trim, M); b.add(box(wx, 2.45, -D - 0.05, 1.5, 0.1, 0.14), trim, M); }
  b.add(box(W - 1.2, H + 0.6, 1.0, 0.8, 2.6, 0.8), brick, M);
  // corrugated rain tank on a stand
  const tk = lam("tinGrey", () => ({ map: tinTex("tinGrey", "#aab4b8", "#929da3") }));
  b.add(new THREE.CylinderGeometry(1.25, 1.25, 2.2, 20).translate(W + 2.2, 1.9, 0.5), tk, M);
  b.add(new THREE.ConeGeometry(1.3, 0.45, 20).translate(W + 2.2, 3.22, 0.5), tk, M);
  b.add(box(W + 2.2, 0, 0.5, 2.2, 0.8, 2.2), dk, M);
};
/** the Southern Cross style windmill; returns the fan (rotate about its z axis) */
export const windmill = (root: THREE.Object3D, b: Batch, x: number, z: number, h = 10) => {
  const st = col("#8f979c");
  for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) b.add(rod(V(x + sx * 1.3, 0, z + sz * 1.3), V(x + sx * 0.2, h, z + sz * 0.2), 0.06), st);
  for (let k = 1; k < 5; k++) {
    const y = (h * k) / 5, w = 1.3 - 1.1 * (k / 5), y0 = (h * (k - 1)) / 5, w0 = 1.3 - 1.1 * ((k - 1) / 5);
    for (const [ax, az, bx, bz] of [[-1, -1, 1, -1], [1, -1, 1, 1], [1, 1, -1, 1], [-1, 1, -1, -1]]) {
      b.add(rod(V(x + ax * w, y, z + az * w), V(x + bx * w, y, z + bz * w), 0.035), st);
      b.add(rod(V(x + ax * w0, y0, z + az * w0), V(x + bx * w, y, z + bz * w), 0.03), st);
    }
  }
  b.add(box(x, h, z, 0.9, 0.08, 0.9), st);
  const fan = new THREE.Group();
  const parts: THREE.BufferGeometry[] = [new THREE.CylinderGeometry(0.18, 0.18, 0.3, 10).rotateX(Math.PI / 2), new THREE.TorusGeometry(1.75, 0.035, 6, 28), new THREE.TorusGeometry(0.8, 0.03, 6, 20)];
  for (let i = 0; i < 16; i++) {
    const g = new THREE.BoxGeometry(0.34, 1.25, 0.02).translate(0, 1.15, 0);
    g.applyMatrix4(new THREE.Matrix4().makeRotationY(0.35)); g.applyMatrix4(new THREE.Matrix4().makeRotationZ((i / 16) * Math.PI * 2));
    parts.push(g);
  }
  fan.add(mesh(merged(parts), col("#b9c0c4", THREE.DoubleSide)));
  fan.position.set(x, h + 0.75, z - 0.75);
  root.add(fan);
  const vane = merged([box(0, -0.03, 1.4, 0.03, 0.06, 2.4), box(0, -0.45, 2.7, 0.03, 0.9, 0.9)]);
  const vm = mesh(vane, col("#a34a3a", THREE.DoubleSide)); vm.position.set(x, h + 0.75, z - 0.6); root.add(vm);
  b.add(rod(V(x, h, z), V(x, h + 0.75, z - 0.6), 0.07), st);
  return fan;
};
/** post-and-rail fence along x at depth z from x0 to x1; a gap between g0 and g1 gets broken rails */
export const fence = (b: Batch, x0: number, x1: number, z: number, g0 = 1e9, g1 = 1e9) => {
  const wd = lam("fenceWood", () => ({ map: planks("fencePlanks", "#a5825c", "#5e4630") }));
  for (let x = x0; x <= x1 + 0.01; x += 2.6) {
    const inGap = x > g0 - 0.2 && x < g1 + 0.2;
    if (!inGap) b.add(box(x, 0, z, 0.15, 1.25 + 0.08 * Math.sin(x * 3.7), 0.15, 0.1 * Math.sin(x * 2.1)), wd);
    if (x + 2.6 > x1 + 0.01) continue;
    const broken = x + 2.6 > g0 && x < g1;
    for (const y of [0.5, 0.98]) {
      if (!broken) b.add(box(x + 1.3, y, z, 2.6, 0.1, 0.06), wd);
      else if (x < g0 && y < 0.6) b.add(box(0, 0, 0, 1.5, 0.1, 0.06).applyMatrix4(new THREE.Matrix4().makeRotationZ(-0.45).setPosition(x + 0.7, y - 0.22, z)), wd);
      else if (x + 2.6 > g1 && y > 0.6) b.add(box(0, 0, 0, 1.4, 0.1, 0.06).applyMatrix4(new THREE.Matrix4().makeRotationZ(0.5).setPosition(x + 1.95, y - 0.45, z)), wd);
    }
  }
};

// ---------------- nature ----------------
/** eucalyptus: pale leaning trunk, a fork, drooping grey-green crowns */
export const gum = (b: Batch, x: number, z: number, h: number, seed: number) => {
  const r = R(seed), bark = lam("gumBark", () => ({ map: barkTex() })), leaves = [col("#7d9462"), col("#6c8358"), col("#8c9f70")];
  const lean = (r() - 0.5) * 0.5, yaw = r() * 6.3, c = Math.cos(yaw), s = Math.sin(yaw);
  const p0 = V(x, 0, z), p1 = V(x + c * lean * h * 0.25, h * 0.48, z + s * lean * h * 0.25);
  b.add(rod(p0, p1, 0.085 * h * 0.33 + 0.1, 0.05 * h * 0.33 + 0.06, 9), bark);
  const tips: THREE.Vector3[] = [];
  const n = 2 + Math.floor(r() * 2);
  for (let i = 0; i < n; i++) {
    const a = yaw + (i / n) * 6.28 + r(), spread = 0.22 + 0.2 * r();
    const tip = V(p1.x + Math.cos(a) * h * spread, h * (0.78 + 0.2 * r()), p1.z + Math.sin(a) * h * spread);
    b.add(rod(p1, tip, 0.05 * h * 0.33 + 0.045, 0.03, 7), bark);
    tips.push(tip);
  }
  tips.push(V(p1.x, h * 0.95, p1.z));
  tips.forEach((t, i) => {
    const s2 = h * (0.2 + 0.08 * r());
    b.add(blobG(t.x, t.y, t.z, s2 * 1.25, s2 * 0.72, s2 * 1.15, r() * 3), leaves[Math.abs(i + seed) % 3]);
    b.add(blobG(t.x + (r() - 0.5) * s2, t.y - s2 * 0.35, t.z + (r() - 0.5) * s2, s2 * 0.8, s2 * 0.5, s2 * 0.8), leaves[Math.abs(i + seed + 1) % 3]);
  });
};
export const bush = (b: Batch, x: number, z: number, s: number, seed: number, y = 0) => {
  const r = R(seed), m = [col("#8d9a52"), col("#9aa77a"), col("#7c8f4a")][Math.abs(Math.round(seed)) % 3];
  b.add(blobG(x, y + s * 0.42, z, s * 0.8, s * 0.55, s * 0.7, r() * 3), m);
  b.add(blobG(x + s * 0.5, y + s * 0.3, z + (r() - 0.5) * s * 0.4, s * 0.52, s * 0.4, s * 0.5), m);
  b.add(blobG(x - s * 0.45, y + s * 0.33, z + (r() - 0.5) * s * 0.4, s * 0.5, s * 0.43, s * 0.48), m);
};
export const rock = (b: Batch, x: number, z: number, s: number, seed: number) => {
  const r = R(seed);
  b.add(blobG(x, s * 0.28, z, s * (0.7 + 0.3 * r()), s * 0.42, s * (0.55 + 0.3 * r()), r() * 3), [col("#b06f52"), col("#a8765e")][Math.abs(Math.round(seed)) % 2]);
};
/** distant ranges: a ring of low ridges at radius r */
export const ranges = (root: THREE.Object3D, rad: number, hMax: number, hex: string, seed: number) => {
  const r = R(seed), n = 96, pos: number[] = [], ph = [r() * 6, r() * 6, r() * 6];
  const hAt = (i: number) => { const a = (i / n) * Math.PI * 2; return hMax * (0.35 + 0.3 * Math.sin(a * 3 + ph[0]) ** 2 + 0.22 * Math.sin(a * 7 + ph[1]) ** 2 + 0.13 * Math.sin(a * 13 + ph[2]) ** 2); };
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2, a1 = ((i + 1) / n) * Math.PI * 2;
    const x0 = Math.cos(a0) * rad, z0 = Math.sin(a0) * rad, x1 = Math.cos(a1) * rad, z1 = Math.sin(a1) * rad;
    pos.push(x0, -2, z0, x1, hAt(i + 1), z1, x1, -2, z1, x0, -2, z0, x0, hAt(i), z0, x1, hAt(i + 1), z1);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals();
  const m = mesh(g, lam("range" + hex, () => ({ color: hex, side: THREE.DoubleSide })), false);
  m.receiveShadow = false;
  root.add(m);
};
/** heightfield over a grid: y = f(x, z) */
export const heightfield = (x0: number, x1: number, z0: number, z1: number, nx: number, nz: number, f: (x: number, z: number) => number, tile = 4) => {
  const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0, nx, nz); g.rotateX(-Math.PI / 2);
  const p = g.attributes.position as THREE.BufferAttribute, uv = g.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i) + (x0 + x1) / 2, z = p.getZ(i) + (z0 + z1) / 2;
    p.setXYZ(i, x, f(x, z), z); uv.setXY(i, x / tile, z / tile);
  }
  g.computeVertexNormals();
  return g;
};

// ---------------- scoreboard ----------------
export type Board = { root: THREE.Group; face: THREE.Mesh; set: (key: string, draw: (g: CanvasRenderingContext2D) => void) => void };
/** chalk scoreboard on two posts: face 1.9 x 1.4 m centred at height cy */
export const scoreboard = (cy = 2.55): Board => {
  const root = new THREE.Group(), wood = lam("fenceWood", () => ({ map: planks("fencePlanks", "#a5825c", "#5e4630") }));
  const b = new Batch();
  for (const s of [-1, 1]) b.add(box(s * 0.85, 0, 0.06, 0.13, cy + 0.6, 0.13), wood);
  b.add(box(0, cy - 0.78, 0, 2.1, 1.56, 0.07), wood);
  b.build(root);
  const cv = document.createElement("canvas"); cv.width = 1024; cv.height = 756;
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const face = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.4), new THREE.MeshBasicMaterial({ map: tex, color: 0xdddddd }));
  face.position.set(0, cy, -0.045); face.rotation.y = Math.PI; face.layers.set(NOINK);
  root.add(face);
  let cur = "";
  return { root, face, set: (key, draw) => { if (key === cur) return; cur = key; draw(cv.getContext("2d")!); tex.needsUpdate = true; } };
};
export { blobG, mesh, merged };
export const _xf = xf;
