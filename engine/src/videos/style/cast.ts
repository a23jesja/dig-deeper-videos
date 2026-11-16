// The cast of the Mona Lisa short, all dressed on the shared stick rig (stick.ts): what tells them apart is the
// hat, the moustache, the garment and what they carry. Also: a walk that plants its feet, and the props.
import * as THREE from "three";
import { ink, toon } from "./toonify";
import { ANKLE, Arm, garment, LAT, mesh, onHead, Pose, R, SPH, Stick, surf, taperTube } from "./stick";

const D2R = Math.PI / 180;
const BLACK = 0x1b1b22, GOLD = 0xf0bd3c;
type Hat = "bowler" | "top" | "beret" | "flat" | "lady" | "kepi" | "boater" | "none";
type Tash = "brush" | "curl" | "walrus" | "none";
type Shape = "coat" | "dress" | "smock" | "jacket";
const SHAPES: Record<Shape, [number, number][]> = {
  coat: [[0.001, -0.3], [0.22, -0.3], [0.235, -0.15], [0.225, 0.0], [0.23, 0.12], [0.212, 0.24], [0.172, 0.34], [0.11, 0.41], [0.001, 0.44]],
  dress: [[0.001, -0.5], [0.33, -0.5], [0.3, -0.3], [0.2, -0.02], [0.185, 0.06], [0.215, 0.2], [0.18, 0.33], [0.11, 0.41], [0.001, 0.44]],
  smock: [[0.001, -0.36], [0.26, -0.36], [0.262, -0.2], [0.25, 0.0], [0.24, 0.14], [0.216, 0.26], [0.176, 0.35], [0.115, 0.42], [0.001, 0.45]],
  jacket: [[0.001, -0.2], [0.2, -0.2], [0.226, -0.11], [0.214, 0.0], [0.226, 0.11], [0.212, 0.23], [0.176, 0.33], [0.115, 0.41], [0.001, 0.44]],
};

const stripes = (a: string, b: string, n = 9) => {
  const c = document.createElement("canvas"); c.width = 8; c.height = 256;
  const g = c.getContext("2d")!;
  for (let i = 0; i < n; i++) { g.fillStyle = i % 2 ? a : b; g.fillRect(0, (i * 256) / n, 8, 256 / n + 1); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

export const hat = (s: Stick, kind: Hat, color: number, band = BLACK) => {
  const g = new THREE.Group(), m = toon(color), b = toon(band);
  s.head.add(g); s.parts.cap = g;
  if (kind === "bowler") {
    mesh(new THREE.SphereGeometry(0.262, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2), m, g, [0, 0.17, 0], [1, 0.95, 1]);
    mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.022, 48), m, g, [0, 0.172, 0]);
    mesh(new THREE.CylinderGeometry(0.266, 0.266, 0.05, 48), b, g, [0, 0.205, 0]);
  } else if (kind === "top") {
    mesh(new THREE.CylinderGeometry(0.215, 0.2, 0.34, 48), m, g, [0, 0.38, 0]);
    mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.022, 48), m, g, [0, 0.205, 0]);
    mesh(new THREE.CylinderGeometry(0.206, 0.206, 0.06, 48), b, g, [0, 0.25, 0]);
  } else if (kind === "beret") {
    g.rotation.z = -0.22;
    mesh(SPH, m, g, [0.03, 0.245, 0], [0.33, 0.085, 0.33]);
    mesh(new THREE.CylinderGeometry(0.262, 0.262, 0.04, 48), m, g, [0, 0.2, 0]);
    mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.05, 8), m, g, [0.03, 0.34, 0]);
  } else if (kind === "flat") {
    g.rotation.x = 0.07;
    mesh(SPH, m, g, [0, 0.262, 0.012], [0.33, 0.105, 0.35]);
    mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.024, 48, 1, false, -Math.PI / 2, Math.PI), m, g, [0, 0.205, 0.215], [1.22, 1, 0.95]).rotation.x = 0.16;
  } else if (kind === "lady") {
    g.rotation.x = -0.1;
    mesh(new THREE.CylinderGeometry(0.47, 0.47, 0.02, 56), m, g, [0, 0.2, 0]);
    mesh(SPH, m, g, [0, 0.24, 0], [0.26, 0.11, 0.26]);
    mesh(new THREE.TorusGeometry(0.262, 0.03, 10, 40), b, g, [0, 0.215, 0]).rotation.x = Math.PI / 2;
    mesh(SPH, b, g, [0.2, 0.27, 0.12], [0.07, 0.06, 0.07]);
  } else if (kind === "kepi") {
    mesh(new THREE.CylinderGeometry(0.25, 0.262, 0.2, 48), m, g, [0, 0.27, 0]);
    mesh(new THREE.CylinderGeometry(0.266, 0.266, 0.04, 48), b, g, [0, 0.19, 0]);
    mesh(new THREE.CylinderGeometry(0.262, 0.262, 0.018, 48, 1, false, -Math.PI / 2, Math.PI), toon(BLACK), g, [0, 0.178, 0.03], [1, 1, 1.2]).rotation.x = 0.05;
    mesh(SPH, toon(GOLD), g, [0, 0.28, 0.25], [0.04, 0.05, 0.016]);
  } else if (kind === "boater") {
    mesh(new THREE.CylinderGeometry(0.235, 0.235, 0.12, 48), m, g, [0, 0.26, 0]);
    mesh(new THREE.CylinderGeometry(0.37, 0.37, 0.02, 48), m, g, [0, 0.2, 0]);
    mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.05, 48), b, g, [0, 0.235, 0]);
  }
  return g;
};

export const tash = (s: Stick, kind: Tash) => {
  const m = ink(0x1c1410);
  if (kind === "brush") for (const k of [-1, 1]) mesh(SPH, m, surf(s.head, k * 0.17, -0.27, R + 0.004), [0, 0, 0], [0.058, 0.022, 0.012]).rotation.z = -k * 0.3;
  if (kind === "curl" || kind === "walrus") for (const k of [-1, 1]) {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      pts.push(kind === "curl" ? onHead(k * (0.02 + 0.44 * t), -0.27 - 0.025 * Math.sin(Math.PI * t) + 0.13 * t * t, R + 0.01) : onHead(k * (0.03 + 0.3 * t), -0.27 - 0.2 * t * t, R + 0.01));
    }
    mesh(taperTube(pts, (t) => 0.006 + 0.017 * Math.pow(1 - t, 0.8)), m, s.head);
  }
};

export type Outfit = { shape?: Shape; coat: number; map?: THREE.Texture; hat?: Hat; hatColor?: number; band?: number; tash?: Tash; shoe?: number; buttons?: number; collar?: number; belt?: number; mouthEl?: number };
export const makePerson = (o: Outfit) => {
  const s = new Stick({ head: 0xfdfbf5, glove: 0xfbf6ea, shoe: o.shoe ?? BLACK, mouthEl: o.mouthEl ?? (o.tash && o.tash !== "none" ? -0.5 : -0.42), browMax: 0.06 });
  const ZS = 0.86, pts = SHAPES[o.shape ?? "coat"];
  const rad = garment(s.torso, pts, toon(o.map ? 0xffffff : o.coat, o.map), ZS);
  if (o.buttons !== undefined) for (const y of [0.02, 0.12, 0.22, 0.31]) mesh(SPH, toon(o.buttons), s.torso, [0, y, rad(y) * ZS + 0.004], [0.022, 0.022, 0.013]);
  if (o.collar !== undefined) mesh(new THREE.TorusGeometry(0.105, 0.03, 12, 40), toon(o.collar), s.torso, [0, 0.42, 0]).rotation.x = Math.PI / 2;
  if (o.belt !== undefined) { const b = mesh(new THREE.TorusGeometry(rad(0) + 0.004, 0.022, 12, 56), toon(o.belt), s.torso, [0, 0, 0], [1, ZS, 1.3]); b.rotation.x = Math.PI / 2; }
  if (o.hat && o.hat !== "none") hat(s, o.hat, o.hatColor ?? BLACK, o.band);
  if (o.tash) tash(s, o.tash);
  return s;
};

/** Vincenzo Peruggia: small moustache, dark flat cap, and a workman's white smock that can come off (parts.smock) */
export const makePeruggia = () => {
  const s = makePerson({ shape: "jacket", coat: 0x6a4a36, hat: "flat", hatColor: 0x3d3f47, tash: "curl", shoe: 0x3a2a1c, buttons: 0x2a1c12 });
  const smock = new THREE.Group();
  s.torso.add(smock); s.parts.smock = smock;
  const rad = garment(smock, SHAPES.smock, toon(0xf4f1e6), 0.88);
  for (const y of [-0.1, 0.05, 0.2]) mesh(SPH, toon(0xb9b4a4), smock, [0, y, rad(y) * 0.88 + 0.004], [0.02, 0.02, 0.012]);
  mesh(new THREE.TorusGeometry(0.11, 0.028, 12, 40), toon(0xe2ded0), smock, [0, 0.425, 0]).rotation.x = Math.PI / 2;
  return s;
};
export const makePicasso = () => {
  const s = makePerson({ shape: "jacket", coat: 0xffffff, map: stripes("#22345e", "#f6f2e6"), shoe: 0x3a2a1c });
  // a black forelock swept to one side
  const hair = mesh(new THREE.SphereGeometry(R + 0.006, 40, 16, 0, Math.PI * 2, 0, Math.PI * 0.27), ink(0x1c1410), s.head);
  hair.rotation.set(0.25, 0, 0.5);
  return s;
};

// ------------------------------------------------------------------ a walk that plants its feet
const ease = (t: number) => t * t * (3 - 2 * t);
/** pose after walking s metres of a straight line of length L from (x0, z0) towards yaw (degrees); L is cut into whole steps */
export const walk = (s: number, L: number, x0: number, z0: number, yaw: number): Pose => {
  const n = Math.max(1, Math.round(L / 0.4)), C = (2 * L) / n, dlt = 0.05 * C, th = yaw * D2R;
  const dx = Math.sin(th), dz = Math.cos(th), lx = Math.cos(th), lz = -Math.sin(th);
  s = Math.min(L, Math.max(0, s));
  const feet = [0, 1].map((i) => {
    const side = i === 0 ? 1 : -1, o = i * 0.5, u = (s + dlt) / C - o, k = Math.floor(u), p = u - k;
    const plant = (kk: number) => (kk + o + 0.3) * C - dlt;
    let d = plant(k), y = ANKLE, pitch = 0;
    if (p >= 0.6) { const t = (p - 0.6) / 0.4; d = plant(k) + (plant(k + 1) - plant(k)) * ease(t); y += 0.07 * Math.sin(Math.PI * t); pitch = 0.3 * Math.sin(2 * Math.PI * t); }
    return { x: x0 + dx * d + lx * side * LAT, z: z0 + dz * d + lz * side * LAT, y, yaw, pitch, p };
  });
  const pL = feet[0].p, a = -0.5 * Math.cos(2 * Math.PI * pL);
  const arm = (ang: number): Arm => ({ u: [0.32, -Math.cos(ang), Math.sin(ang)], v: [0.1, -Math.cos(ang + 0.35), Math.sin(ang + 0.35)] });
  return {
    x: x0 + dx * s, z: z0 + dz * s, yaw, hip: 0.632 + 0.02 * Math.cos(4 * Math.PI * (pL - 0.3)), lean: 0.05, roll: 0.03 * Math.sin(2 * Math.PI * (pL - 0.3)),
    feet: [feet[0], feet[1]], arms: [arm(a), arm(-a)],
  };
};

// ------------------------------------------------------------------ props
/** the Mona Lisa in its frame: origin at the centre of the back, picture faces +z */
export const makeMona = (pic: THREE.Texture) => {
  const g = new THREE.Group(), W = 0.53, H = 0.77, B = 0.075, gilt = toon(0xd9a93c), dark = toon(0x8a6420);
  mesh(new THREE.BoxGeometry(W + 2 * B, H + 2 * B, 0.05), dark, g, [0, 0, 0.025]);
  for (const k of [-1, 1]) {
    mesh(new THREE.BoxGeometry(B, H + 2 * B, 0.035), gilt, g, [k * (W + B) / 2, 0, 0.06]);
    mesh(new THREE.BoxGeometry(W + 2 * B, B, 0.035), gilt, g, [0, k * (H + B) / 2, 0.06]);
  }
  const p = new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshBasicMaterial({ map: pic }));
  p.position.z = 0.056; g.add(p);
  return g;
};
/** the bare panel (no frame), for the trunk */
export const makePanel = (pic: THREE.Texture) => {
  const g = new THREE.Group();
  mesh(new THREE.BoxGeometry(0.53, 0.77, 0.03), toon(0x6b4a2a), g, [0, 0, 0]);
  const p = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.74), new THREE.MeshBasicMaterial({ map: pic }));
  p.position.z = 0.017; g.add(p);
  return g;
};
/** the painting wrapped in the white smock: a soft white parcel */
export const makeBundle = () => {
  const g = new THREE.Group(), w = toon(0xf4f1e6), sh = toon(0xd9d5c6);
  mesh(new THREE.BoxGeometry(0.7, 0.94, 0.09), w, g, [0, 0, 0.045]);
  mesh(SPH, w, g, [0, 0, 0.05], [0.36, 0.48, 0.075]);
  for (const y of [-0.2, 0.2]) mesh(new THREE.BoxGeometry(0.72, 0.03, 0.11), sh, g, [0, y, 0.05]);
  mesh(new THREE.BoxGeometry(0.03, 0.96, 0.11), sh, g, [0.1, 0, 0.05]);
  return g;
};
export const makeGlass = () => {
  const g = new THREE.Group();
  mesh(new THREE.TorusGeometry(0.085, 0.014, 10, 40), toon(BLACK), g, [0, 0.2, 0]);
  const lens = new THREE.Mesh(new THREE.CircleGeometry(0.08, 32), new THREE.MeshBasicMaterial({ color: 0xcfe9ff, transparent: true, opacity: 0.45, side: THREE.DoubleSide }));
  lens.position.y = 0.2; g.add(lens);
  mesh(new THREE.CylinderGeometry(0.014, 0.016, 0.13, 10), toon(0x5a3a20), g, [0, 0.055, 0]);
  return g;
};
export const makePalette = () => {
  const g = new THREE.Group();
  mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.012, 32), toon(0xb98a52), g, [0, 0.1, 0.02], [1, 1, 0.75]).rotation.x = Math.PI / 2;
  [0xc0342c, 0x3558a8, 0xf0bd3c, 0x5c8b3a, 0xfdfbf5].forEach((c, i) => mesh(SPH, toon(c), g, [-0.09 + i * 0.045, 0.13 + 0.03 * Math.sin(i * 1.3), 0.03], [0.02, 0.02, 0.008]));
  return g;
};
export const makeBrush = () => {
  const g = new THREE.Group();
  mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.26, 8), toon(0x8a5a2a), g, [0, 0.16, 0]);
  mesh(new THREE.CylinderGeometry(0.014, 0.01, 0.05, 8), toon(0x3558a8), g, [0, 0.31, 0]);
  return g;
};
/** a canvas with text as a texture */
export const textMap = (w: number, h: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void) => {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  draw(c.getContext("2d")!, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
};
