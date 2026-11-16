// The built places of the stick-figure films: the Salon Carre (three3d/stage.ts) closed in on all sides so no
// camera angle looks out into nothing, and small plain rooms (a lodging, a police office, a hotel room) that sit
// far to the right of it. Everything is toon shaded here; the caller adds the ink pass.
import * as THREE from "three";
import { Models, Stage } from "../three3d/stage";
import { wallMap } from "../three3d/paint";
import { toon, toonify } from "./toonify";
import { mesh, SPH } from "./stick";
import { textMap } from "./cast";

export const WALL = "#7b4a47";
export type Assets = { models: Models; paints: THREE.Texture[]; mona?: THREE.Texture };

const box = (parent: THREE.Object3D, w: number, h: number, d: number, m: THREE.Material, p: [number, number, number], cast = false) => {
  const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
  o.position.set(...p); o.castShadow = cast; o.receiveShadow = true;
  parent.add(o);
  return o;
};

/** the Louvre room, toon shaded, with the left wall, the wall behind the camera and a ceiling added */
export const buildLouvre = (assets: Assets) => {
  const stage = new Stage(assets.models, { wall: WALL, paints: assets.paints });
  const wm = (w: number, h: number) => new THREE.MeshStandardMaterial({ map: wallMap(w / 1.1, h / 1.1, WALL), roughness: 0.95 });
  box(stage.root, 0.4, 5.2, 12.4, wm(12, 5.2), [-11.0, 2.6, 5.8]);            // left end wall
  box(stage.root, 19.4, 5.2, 0.4, wm(19, 5.2), [-1.5, 2.6, 12.0]);            // wall behind the camera
  box(stage.root, 19.4, 0.3, 12.6, new THREE.MeshStandardMaterial({ color: 0xe9dcc0, roughness: 0.95 }), [-1.5, 5.35, 5.9]); // ceiling
  for (const [x, z, w, d] of [[-10.77, 5.8, 0.05, 12], [-1.5, 11.77, 19, 0.05]] as const) box(stage.root, w, 0.92, d, new THREE.MeshStandardMaterial({ color: 0x4a2c16, roughness: 0.6 }), [x, 0.46, z]);
  toonify(stage.root);
  return stage;
};

/** a plain room: floor, three walls and a ceiling; origin on the floor at the middle of the back wall */
export const buildRoom = (x0: number, wall: number, floor: number, dado?: number) => {
  const g = new THREE.Group();
  g.position.set(x0, 0, 0);
  const W = toon(wall), F = toon(floor);
  const fl = box(g, 7, 0.1, 7, F, [0, -0.05, 3]);
  fl.receiveShadow = true;
  for (let i = -5; i <= 5; i++) box(g, 0.012, 0.004, 7, toon(new THREE.Color(floor).multiplyScalar(0.6).getHex()), [i * 0.62, 0.003, 3]); // floorboard joints
  box(g, 7, 4, 0.2, W, [0, 2, -0.1]); box(g, 0.2, 4, 7, W, [-3.4, 2, 3]); box(g, 0.2, 4, 7, W, [3.4, 2, 3]); box(g, 7, 4, 0.2, W, [0, 2, 6.5]);
  box(g, 7, 0.2, 7, toon(0xe6dcc6), [0, 4.1, 3]);
  if (dado !== undefined) { box(g, 7, 0.9, 0.05, toon(dado), [0, 0.45, 0.03]); box(g, 7, 0.05, 0.07, toon(new THREE.Color(dado).multiplyScalar(0.7).getHex()), [0, 0.92, 0.04]); }
  return g;
};

/** the trunk with a lid on a hinge (parts: lid, tray) */
export const buildTrunk = () => {
  const g = new THREE.Group(), wood = toon(0x6a3f22), dark = toon(0x3c2414), brass = toon(0xd9a93c), W = 1.0, D = 0.66, H = 0.42, T = 0.03;
  box(g, W, T, D, wood, [0, T / 2, 0], true);
  box(g, W, H, T, wood, [0, H / 2, -D / 2 + T / 2], true); box(g, W, H, T, wood, [0, H / 2, D / 2 - T / 2], true);
  box(g, T, H, D, wood, [-W / 2 + T / 2, H / 2, 0], true); box(g, T, H, D, wood, [W / 2 - T / 2, H / 2, 0], true);
  for (const x of [-0.3, 0.3]) box(g, 0.07, H + 0.004, D + 0.012, dark, [x, H / 2, 0]);
  for (const x of [-1, 1]) for (const z of [-1, 1]) mesh(SPH, brass, g, [x * (W / 2 - 0.01), H - 0.03, z * (D / 2 - 0.01)], [0.035, 0.035, 0.035]);
  box(g, 0.1, 0.09, 0.02, brass, [0, H - 0.08, D / 2 + 0.006]);
  const lid = new THREE.Group();
  lid.position.set(0, H, -D / 2);
  g.add(lid);
  box(lid, W + 0.02, 0.07, D + 0.02, wood, [0, 0.035, D / 2], true);
  for (const x of [-0.3, 0.3]) box(lid, 0.07, 0.074, D + 0.03, dark, [x, 0.035, D / 2]);
  const tray = new THREE.Group();
  g.add(tray);
  box(tray, W - 0.09, 0.025, D - 0.09, toon(0x8a5a32), [0, 0, 0], true);
  // folded clothes on the false bottom
  ([[0.24, 0xb9c4d6, -0.22], [0.2, 0xe9e2cf, 0.05], [0.22, 0x8a3b3b, 0.3]] as const).forEach(([w, c, x]) => mesh(new THREE.BoxGeometry(w, 0.06, 0.4), toon(c), tray, [x, 0.045, 0]));
  return { g, lid, tray, H };
};

/** "FERME" sign hanging from the rope */
export const buildClosedSign = () => {
  const g = new THREE.Group();
  const t = textMap(1024, 640, (c, w, h) => {
    c.fillStyle = "#f6efdc"; c.fillRect(0, 0, w, h);
    c.strokeStyle = "#7a1420"; c.lineWidth = 26; c.strokeRect(26, 26, w - 52, h - 52);
    c.fillStyle = "#7a1420"; c.textAlign = "center"; c.textBaseline = "middle";
    c.font = "900 250px 'Arial Black', Impact, sans-serif"; c.fillText("FERMÉ", w / 2, 230);
    c.fillStyle = "#1c1820"; c.font = "900 150px 'Arial Black', Impact, sans-serif"; c.fillText("CLOSED", w / 2, 470);
  });
  const b = mesh(new THREE.BoxGeometry(0.56, 0.35, 0.015), toon(0x3a2212), g, [0, 0, 0]);
  const dark = toon(0x3a2212);
  (b as THREE.Mesh).material = [dark, dark, dark, dark, new THREE.MeshBasicMaterial({ map: t }), dark] as THREE.Material[];
  for (const x of [-0.2, 0.2]) mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.16, 6), toon(0x1b1b22), g, [x, 0.25, 0]);
  return g;
};

/** the letter to the dealer: address, handwriting as scribble, and the signature on its own strip (so it can be written) */
export const buildLetter = () => {
  const g = new THREE.Group(), PW = 0.62, PH = 0.86;
  const paper = textMap(1024, 1420, (c, w, h) => {
    c.fillStyle = "#f3e9cf"; c.fillRect(0, 0, w, h);
    c.fillStyle = "rgba(120,90,40,0.10)"; for (let i = 0; i < 40; i++) c.fillRect((i * 271) % w, (i * 97) % h, 160, 3);
    c.fillStyle = "#2a2118"; c.textAlign = "left"; c.textBaseline = "alphabetic";
    c.font = "italic 54px Georgia, serif"; c.fillText("Paris, novembre 1913", 470, 130);
    c.font = "bold 84px Georgia, serif"; c.fillText("Sig. Alfredo Geri", 90, 290);
    c.font = "60px Georgia, serif"; c.fillText("Antiquario", 90, 372);
    c.font = "900 104px 'Arial Black', Impact, sans-serif"; c.fillStyle = "#7a1420"; c.fillText("FIRENZE", 90, 492);
    c.strokeStyle = "#3a2e22"; c.lineWidth = 6; c.lineCap = "round";
    for (let r = 0; r < 4; r++) { // handwriting: loops, no readable words
      c.beginPath();
      const y = 620 + r * 78, end = r === 3 ? 520 : 930;
      for (let x = 90; x < end; x += 6) { const yy = y + 13 * Math.sin(x * 0.11 + r) * (Math.sin(x * 0.023 + r * 2) > -0.75 ? 1 : 0) + 5 * Math.sin(x * 0.31); if (x === 90) c.moveTo(x, yy); else c.lineTo(x, yy); }
      c.stroke();
    }
  });
  const p = new THREE.Mesh(new THREE.PlaneGeometry(PW, PH), new THREE.MeshBasicMaterial({ map: paper }));
  g.add(p);
  const sigT = textMap(1024, 300, (c, w, h) => {
    c.clearRect(0, 0, w, h);
    c.fillStyle = "#1a2a6a"; c.textAlign = "left"; c.textBaseline = "middle";
    c.font = "italic 170px 'Segoe Script', 'Brush Script MT', 'Lucida Handwriting', cursive"; c.fillText("Leonardo", 24, 140);
    c.strokeStyle = "#1a2a6a"; c.lineWidth = 9; c.lineCap = "round"; c.beginPath(); c.moveTo(60, 268); c.quadraticCurveTo(500, 300, 960, 250); c.stroke();
  });
  sigT.wrapS = THREE.ClampToEdgeWrapping;
  const SW = 0.5, SH = SW * 300 / 1024;
  const sig = new THREE.Mesh(new THREE.PlaneGeometry(SW, SH), new THREE.MeshBasicMaterial({ map: sigT, transparent: true, depthWrite: false }));
  sig.position.set(0, -0.2, 0.002);
  g.add(sig);
  /** how much of the signature is written, 0..1 (revealed from the left) */
  const write = (t: number) => {
    t = Math.min(1, Math.max(0.001, t));
    sig.scale.x = t; sig.position.x = -SW * (1 - t) / 2; sigT.repeat.x = t;
  };
  for (const k of [-1, 1]) mesh(SPH, toon(0xfbf6ea), g, [k * 0.3, -0.36, 0.02], [0.07, 0.085, 0.04]);
  return { g, write };
};

/** a plain table */
export const buildDesk = (w = 1.3, d = 0.6, h = 0.74, color = 0x5a3a20) => {
  const g = new THREE.Group(), m = toon(color);
  box(g, w, 0.05, d, m, [0, h, 0], true);
  for (const x of [-1, 1]) for (const z of [-1, 1]) box(g, 0.06, h, 0.06, m, [x * (w / 2 - 0.06), h / 2, z * (d / 2 - 0.06)], true);
  return g;
};
/** a hanging lamp with a green shade */
export const buildLamp = () => {
  const g = new THREE.Group();
  mesh(new THREE.CylinderGeometry(0.006, 0.006, 1.6, 6), toon(0x1b1b22), g, [0, 0.9, 0]);
  mesh(new THREE.ConeGeometry(0.3, 0.2, 32, 1, true), toon(0x2f5d3a), g, [0, 0.05, 0]);
  mesh(SPH, new THREE.MeshBasicMaterial({ color: 0xfff2b0 }), g, [0, -0.05, 0], [0.07, 0.07, 0.07]);
  return g;
};
