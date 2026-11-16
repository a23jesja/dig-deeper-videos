// Props of a Roman street, each a real object with thickness, its own colour and its own shadow (world kit, kit.ts).
// Sizes in metres. Each function returns a group standing on y = 0 at its own origin.
import * as THREE from "three";
import { mesh, group, box, cyl, ball, torus, lathe, slab, paint, rod, INK3 } from "./kit";

const D2 = Math.PI / 180;
export const C = {
  bread: "#f6c66a", crust: "#a8672a", terra: "#d2693a", terraD: "#a94e2a", wood: "#b0703c", woodD: "#7d4a26", iron: "#4a4d5a", gold: "#f6c52e", plaster: "#f3e6c8", ochre: "#efc35a",
  red: "#c8402f", stone: "#9fa2ae", stoneL: "#c9c6bd", lava: "#666873", marble: "#f3eee2", green: "#3f9a5c", blue: "#3b7fc4", cloth: "#f4ead2", basket: "#d2a85a", sack: "#dccba0",
};

/** a round Roman loaf scored in eight (panis quadratus): the cuts run from the middle down over the shoulder of the crust */
export const loaf = (r = 0.15) => {
  const g = group([mesh(lathe(`loaf${r}`, [[0, 0], [0.9 * r, 0], [r, 0.22 * r], [0.95 * r, 0.48 * r], [0.66 * r, 0.7 * r], [0.3 * r, 0.8 * r], [0, 0.82 * r]]), C.bread, { glow: "#5c3c10" })]);
  for (let i = 0; i < 8; i++) {
    const a = i * 45 * D2, at = (rad: number, y: number): [number, number, number] => [Math.cos(a) * rad * r, y * r, -Math.sin(a) * rad * r];
    g.add(mesh(box(0.52 * r, 0.04 * r, 0.075 * r), C.crust, { at: at(0.36, 0.79), rot: [0, a, -0.2], line: 0, shadow: false }));
    g.add(mesh(box(0.4 * r, 0.04 * r, 0.075 * r), C.crust, { at: at(0.79, 0.62), rot: [0, a, -0.66], line: 0, shadow: false }));
  }
  g.add(mesh(torus(0.985 * r, 0.035 * r), C.crust, { at: [0, 0.3 * r, 0], rot: [Math.PI / 2, 0, 0], line: 0, shadow: false }));
  return g;
};
/** a two-handled wine jar */
export const amphora = (h = 0.95, color = C.terra) => {
  const k = h / 0.95, P = (r: number, y: number): [number, number] => [r * k, y * k];
  const g = group([mesh(lathe(`amph${h}`, [P(0.03, 0), P(0.06, 0.04), P(0.17, 0.22), P(0.23, 0.44), P(0.21, 0.6), P(0.11, 0.74), P(0.065, 0.8), P(0.065, 0.9), P(0.1, 0.93), P(0.1, 0.95), P(0.001, 0.95)]), color)]);
  for (const s of [-1, 1]) g.add(mesh(torus(0.085 * k, 0.022 * k, 14), color, { at: [s * 0.1 * k, 0.8 * k, 0], scale: [1, 1.25, 1] }));
  return g;
};
/** a big storage jar */
export const jar = (h = 0.8, color = C.terra) => {
  const k = h / 0.8;
  return group([mesh(lathe(`jar${h}`, [[0.12 * k, 0], [0.3 * k, 0.2 * k], [0.36 * k, 0.45 * k], [0.3 * k, 0.68 * k], [0.2 * k, 0.76 * k], [0.24 * k, 0.8 * k], [0.18 * k, 0.8 * k], [0.16 * k, 0.74 * k]]), color), mesh(cyl(0.17 * k, 0.17 * k, 0.02), "#3a2a22", { at: [0, 0.74 * k, 0], line: 0 })]);
};
export const basket = (r = 0.26, h = 0.3) => group([
  mesh(cyl(r, r * 0.78, h, 18), C.basket, { at: [0, h / 2, 0] }), mesh(torus(r, 0.03, 18), "#b88a3e", { at: [0, h, 0], rot: [Math.PI / 2, 0, 0] }), mesh(torus(r * 0.9, 0.018, 18), "#b88a3e", { at: [0, h * 0.5, 0], rot: [Math.PI / 2, 0, 0], line: 0 }),
]);
export const sack = (r = 0.3) => group([mesh(ball(r), C.sack, { at: [0, r * 0.72, 0], scale: [1, 0.78, 0.9] }), mesh(ball(r * 0.22), C.sack, { at: [0, r * 1.42, 0], scale: [1, 0.8, 1] })]);
/** a spoked wheel standing in the xy plane */
export const wheel = (r = 0.55) => {
  const g = group([mesh(torus(r * 0.9, r * 0.1, 30), C.woodD), mesh(torus(r * 0.99, r * 0.035, 30), C.iron, { line: 0 }), mesh(cyl(r * 0.16, r * 0.16, 0.2, 14), C.wood, { rot: [Math.PI / 2, 0, 0] })]);
  for (let i = 0; i < 4; i++) g.add(mesh(box(r * 1.7, r * 0.09, 0.06), C.wood, { rot: [0, 0, i * 45 * D2], line: 0.6 }));
  return g;
};
/** a two-wheeled cart, its shafts resting on the ground ahead of it (+z) */
export const cart = () => {
  const g = group([
    mesh(box(1.1, 0.1, 1.9), C.wood, { at: [0, 0.72, 0] }), mesh(cyl(0.05, 0.05, 1.5, 10), C.woodD, { at: [0, 0.55, 0], rot: [0, 0, Math.PI / 2] }),
    mesh(box(0.06, 0.34, 1.9), C.woodD, { at: [-0.52, 0.94, 0] }), mesh(box(0.06, 0.34, 1.9), C.woodD, { at: [0.52, 0.94, 0] }), mesh(box(1.1, 0.34, 0.06), C.woodD, { at: [0, 0.94, -0.92] }),
  ]);
  for (const s of [-1, 1]) {
    const w = wheel(0.55); w.position.set(s * 0.72, 0.55, 0); w.rotation.y = Math.PI / 2; g.add(w);
    g.add(mesh(box(0.07, 0.07, 1.9), C.wood, { at: [s * 0.4, 0.38, 1.85], rot: [0.38, 0, 0] }));
  }
  return g;
};
/** a column, red below and white above, as they stood in Pompeii */
export const column = (h = 3.4, r = 0.24) => group([
  mesh(lathe(`colb${h}${r}`, [[r * 1.45, 0], [r * 1.45, 0.1], [r * 1.15, 0.15], [r * 1.25, 0.22], [r * 1.02, 0.28], [r, 1.15], [r * 0.99, 1.15]]), C.red),
  mesh(lathe(`colt${h}${r}`, [[r, 1.15], [r * 0.84, h - 0.3], [r, h - 0.26], [r * 1.3, h - 0.14], [r * 1.45, h - 0.1], [r * 1.45, h], [0.001, h]], 20), C.marble),
]);
export const table = (w = 1.2, d = 0.7, h = 0.74) => {
  const g = group([mesh(box(w, 0.07, d), C.wood, { at: [0, h, 0] })]);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(mesh(box(0.08, h, 0.08), C.woodD, { at: [sx * (w / 2 - 0.09), h / 2, sz * (d / 2 - 0.09)] }));
  return g;
};
export const stool = () => { const g = group([mesh(cyl(0.2, 0.2, 0.06, 14), C.wood, { at: [0, 0.44, 0] })]); for (let i = 0; i < 3; i++) g.add(mesh(cyl(0.03, 0.03, 0.44, 8), C.woodD, { at: [Math.cos(i * 2.094) * 0.13, 0.22, Math.sin(i * 2.094) * 0.13] })); return g; };
/** coins: a heap and a few stacks, counted out on a table top */
export const coins = (n = 26, seed = 1) => {
  const g = new THREE.Group(); let s = seed * 9301 + 7;
  const r = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  for (let i = 0; i < n; i++) { const a = r() * 6.28, d = Math.sqrt(r()) * 0.16; g.add(mesh(cyl(0.024, 0.024, 0.007, 12), C.gold, { at: [Math.cos(a) * d, 0.004 + (d < 0.07 ? r() * 0.02 : 0), Math.sin(a) * d], rot: [r() * 0.3, 0, r() * 0.3], line: 0.5 })); }
  for (let k = 0; k < 3; k++) for (let i = 0; i < 4 + k * 2; i++) g.add(mesh(cyl(0.024, 0.024, 0.007, 12), C.gold, { at: [0.26 + k * 0.07, 0.004 + i * 0.0075, -0.05 + k * 0.03], line: 0.5 }));
  return g;
};
const stripes = (a: string, b: string) => paint(`stripes${a}${b}`, 256, 64, (g) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? a : b; g.fillRect(i * 32, 0, 32, 64); } });
/** a striped cloth awning on two poles: w wide, reaching d out from the wall at height h */
export const awning = (w = 2.6, d = 1.5, h = 2.5, a = C.red, b = C.cloth) => {
  const cloth = mesh(box(w, 0.05, d * 1.06), "#ffffff", { at: [0, h - 0.28, d / 2], rot: [0.36, 0, 0], map: stripes(a, b) });
  const g = group([cloth, mesh(box(w, 0.2, 0.04), a, { at: [0, h - 0.66, d + 0.02], line: 0.7 })]);
  for (const s of [-1, 1]) g.add(mesh(cyl(0.035, 0.035, h - 0.55, 8), C.woodD, { at: [s * (w / 2 - 0.06), (h - 0.55) / 2, d - 0.03] }));
  return g;
};
/** a masonry shop counter with a marble top; `len` along x, front toward +z */
export const counter = (len = 2.6, h = 0.95, d = 0.6) => group([
  mesh(box(len, h - 0.07, d), C.ochre, { at: [0, (h - 0.07) / 2, 0] }), mesh(box(len + 0.08, 0.07, d + 0.08), C.marble, { at: [0, h - 0.035, 0] }),
  mesh(box(len * 0.78, (h - 0.07) * 0.62, 0.03), C.red, { at: [0, (h - 0.07) * 0.5, d / 2 + 0.012], line: 0.6 }),
]);
/** a domed bread oven with a dark mouth */
export const oven = () => group([
  mesh(box(1.9, 0.9, 1.6), C.terraD, { at: [0, 0.45, 0] }), mesh(ball(0.86, 22), C.terra, { at: [0, 0.9, 0], scale: [1.05, 0.9, 0.9] }),
  mesh(cyl(0.34, 0.34, 0.08, 18), "#2a1a16", { at: [0, 1.2, 0.74], rot: [Math.PI / 2, 0, 0], scale: [1, 1, 1.2], line: 0 }), mesh(torus(0.36, 0.06, 18), C.stoneL, { at: [0, 1.2, 0.76] }),
  mesh(box(0.3, 1.1, 0.3), C.terraD, { at: [0, 2.1, -0.3] }),
]);
/** a lava-stone grain mill: the cone and the hourglass that turns on it */
export const mill = () => group([
  mesh(cyl(0.48, 0.52, 0.34, 20), C.stoneL, { at: [0, 0.17, 0] }),
  mesh(lathe("mill", [[0.44, 0.34], [0.3, 0.7], [0.2, 0.92], [0.34, 1.2], [0.44, 1.5], [0.44, 1.56], [0.3, 1.56], [0.001, 1.3]]), C.lava),
  mesh(box(1.5, 0.09, 0.09), C.wood, { at: [0, 0.94, 0] }),
]);
/** a street fountain: a stone basin with water and a spout block */
export const fountain = () => group([
  mesh(box(1.5, 0.8, 1.1), C.stone, { at: [0, 0.4, 0] }), mesh(box(1.26, 0.04, 0.86), C.blue, { at: [0, 0.79, 0], line: 0, shadow: false }),
  mesh(box(0.34, 0.6, 0.26), C.stoneL, { at: [0, 1.1, -0.42] }), mesh(cyl(0.035, 0.035, 0.22, 8), C.iron, { at: [0, 1.06, -0.24], rot: [Math.PI / 2.4, 0, 0] }),
]);
/** a chain of links from a to b, sagging a little */
export const chainLink = (a: [number, number, number], b: [number, number, number], sag = 0.1, n = 14) => {
  const g = new THREE.Group(), A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
  for (let i = 0; i <= n; i++) {
    const t = i / n, p = A.clone().lerp(B, t); p.y -= Math.sin(Math.PI * t) * sag;
    const m = mesh(torus(0.035, 0.011, 10), C.iron, { at: [p.x, p.y, p.z], line: 0.5 });
    m.lookAt(B); if (i % 2) m.rotateZ(Math.PI / 2); g.add(m);
  }
  return g;
};
export const ring = (at: [number, number, number]) => mesh(torus(0.07, 0.016, 12), C.iron, { at });

// ---------------- a wharf and a ship (Boston, 1773) ----------------
/** a chest of tea: a wooden box bound with rope, a paper label on its side */
export const teaChest = (w = 0.62, h = 0.5, d = 0.5, col = "#cfa055") => group([
  mesh(box(w, h, d), col, { at: [0, h / 2, 0] }),
  mesh(box(w + 0.03, 0.05, d + 0.03), "#8a5e2c", { at: [0, h - 0.03, 0], line: 0.6 }), mesh(box(w + 0.03, 0.05, d + 0.03), "#8a5e2c", { at: [0, 0.03, 0], line: 0.6 }),
  mesh(box(0.045, h + 0.02, d + 0.035), "#5a3a22", { at: [-w * 0.24, h / 2, 0], line: 0 }), mesh(box(0.045, h + 0.02, d + 0.035), "#5a3a22", { at: [w * 0.24, h / 2, 0], line: 0 }),
  mesh(box(w * 0.3, h * 0.36, 0.012), "#f6ecd0", { at: [0, h * 0.52, d / 2 + 0.008], line: 0.5, shadow: false }), mesh(box(w * 0.3, h * 0.36, 0.012), "#f6ecd0", { at: [0, h * 0.52, -d / 2 - 0.008], line: 0.5, shadow: false }),
]);
/** a cask with iron hoops, standing on its end */
export const barrel = (h = 0.95, r = 0.34, col = "#b97a42") => { const k = h / 0.95, g = group([mesh(lathe(`barrel${h}${r}`, [[r * 0.8, 0], [r * 0.95, 0.18 * k], [r, 0.475 * k], [r * 0.95, 0.77 * k], [r * 0.8, 0.95 * k], [0.001, 0.95 * k]]), col)]); for (const y of [0.1, 0.34, 0.61, 0.85]) g.add(mesh(torus(r * (y > 0.2 && y < 0.8 ? 0.99 : 0.9), 0.022, 20), C.iron, { at: [0, y * k, 0], rot: [Math.PI / 2, 0, 0], line: 0 })); return g; };
/** a coil of rope lying on the planks */
export const ropeCoil = (r = 0.36, turns = 4) => { const g = new THREE.Group(); for (let i = 0; i < turns; i++) g.add(mesh(torus(r - i * 0.02, 0.05, 22), i % 2 ? "#dcc38a" : "#cfb478", { at: [0, 0.05 + i * 0.085, 0], rot: [Math.PI / 2, 0, i * 0.4], line: 0.7 })); return g; };
/** a mooring post */
export const bollard = (h = 0.75) => group([mesh(cyl(0.13, 0.16, h, 12), "#5a4634", { at: [0, h / 2, 0] }), mesh(cyl(0.19, 0.19, 0.09, 12), "#3f3126", { at: [0, h, 0] })]);
/** a lamp on a wooden post; lit = the glass glows (for the night scenes) */
export const lampPost = (h = 2.9, lit = false) => group([
  mesh(box(0.14, h, 0.14), "#5a4634", { at: [0, h / 2, 0] }), mesh(box(0.5, 0.08, 0.08), "#5a4634", { at: [0.18, h - 0.2, 0] }),
  mesh(box(0.26, 0.34, 0.26), lit ? "#ffd75a" : "#f1e2a0", { at: [0.38, h - 0.5, 0] }), mesh(box(0.32, 0.06, 0.32), C.iron, { at: [0.38, h - 0.31, 0] }), mesh(box(0.3, 0.05, 0.3), C.iron, { at: [0.38, h - 0.69, 0] }),
]);
export const crate = (s = 0.7, col = "#c08a4e") => group([mesh(box(s, s, s), col, { at: [0, s / 2, 0] }), mesh(box(s + 0.03, 0.07, s + 0.03), "#8a5e2c", { at: [0, s - 0.04, 0], line: 0.6 }), mesh(box(0.08, s, s + 0.03), "#8a5e2c", { at: [0, s / 2, 0], rot: [0, 0, 0.7], line: 0 })]);
/** a furled sail on its yard, the yard lying along x */
export const yard = (len = 9) => group([rod([-len / 2, 0, 0], [len / 2, 0, 0], 0.11, "#7a5a36"), mesh(cyl(0.22, 0.22, len * 0.86, 12), "#f3ead2", { at: [0, -0.2, 0.05], rot: [0, 0, Math.PI / 2] })]);
/** a ship's mast with two yards, a top and its shrouds down to the rail (the rail is `beam` from the mast on each side) */
export const mast = (h = 20, beam = 3.5, deck = 0) => {
  const g = group([rod([0, deck, 0], [0, h, 0], 0.26, "#8a6a3e"), mesh(cyl(0.9, 0.7, 0.14, 14), "#7a5a36", { at: [0, h * 0.52, 0] })]);
  const y1 = yard(beam * 2.5); y1.position.set(0, h * 0.46, 0); const y2 = yard(beam * 1.9); y2.position.set(0, h * 0.78, 0); g.add(y1, y2);
  for (const s of [-1, 1]) for (const dz of [-0.9, -0.3, 0.3, 0.9]) g.add(rod([0, h * 0.5, 0], [s * beam, deck + 0.85, dz * 1.4], 0.03, "#3a3028", { line: 0.5 }));
  return g;
};

// ---------------- buildings ----------------
const tiles = (col: string) => paint(`tiles${col}`, 256, 256, (g) => {
  g.fillStyle = col; g.fillRect(0, 0, 256, 256); g.strokeStyle = "rgba(60,20,10,0.4)"; g.lineWidth = 5;
  for (let y = 0; y <= 256; y += 64) { g.beginPath(); g.moveTo(0, y); g.lineTo(256, y); g.stroke(); }
});
/** words painted on a wall, a board or a card: a thin slab with the text on it. w, h in metres; the letters fill the height of each
 *  line. ink = colour of the letters, bg = the ground they are painted on (give the wall's own colour for letters straight on the wall) */
export const painted = (lines: string[], w: number, h: number, o: { ink?: string; bg?: string; edge?: string; line?: number; font?: string; pad?: number } = {}) => {
  const W = 1024, H = Math.max(64, Math.round((W * h) / w)), key = `txt${lines.join("|")}${w}${h}${o.ink}${o.bg}${o.edge}${o.font}`;
  const map = paint(key, W, H, (g) => {
    g.fillStyle = o.bg ?? "#fbf3df"; g.fillRect(0, 0, W, H);
    if (o.edge) { g.strokeStyle = o.edge; g.lineWidth = H * 0.06; g.strokeRect(H * 0.03, H * 0.03, W - H * 0.06, H - H * 0.06); }
    const pad = (o.pad ?? 0.1) * H, lh = (H - 2 * pad) / lines.length; g.fillStyle = o.ink ?? "#b3261e"; g.textAlign = "center"; g.textBaseline = "middle";
    lines.forEach((t, i) => { let px = lh * 0.92; g.font = `${o.font ?? "700"} ${px}px "Times New Roman", Georgia, serif`; const tw = g.measureText(t).width, k = Math.min(1, (W - 2 * pad) / tw); g.save(); g.translate(W / 2, pad + lh * (i + 0.5) + px * 0.04); g.scale(k, 1); g.fillText(t, 0, 0); g.restore(); });
  });
  return mesh(box(w, h, 0.03), "#ffffff", { map, line: o.line ?? 0.5, shadow: false });
};
export type House = { w: number; h: number; d: number; wall?: string; dado?: string; roof?: string; door?: number; doorCol?: string; shop?: number; windows?: number[]; shutter?: string; awning?: [string, string];
  /** words painted on the front: x along the wall, y above the ground, size, lines */
  signs?: { x: number; y: number; w: number; h: number; lines: string[]; ink?: string; bg?: string; edge?: string }[] };
/** a door in its frame, standing on y = 0 with its face on z = 0: stone jambs and lintel, two panelled leaves with bronze knobs, a
 *  threshold. ajar = how far one leaf stands open (radians) */
export const doorway = (col = C.blue, ajar = 0.5, w = 1.1, h = 2.2) => {
  const g = group([
    mesh(box(w, h, 0.4), "#2b1d1a", { at: [0, h / 2, -0.22], line: 0, shadow: false }),
    mesh(box(0.16, h + 0.1, 0.2), "#eadfc6", { at: [-w / 2 - 0.08, (h + 0.1) / 2, 0.04] }), mesh(box(0.16, h + 0.1, 0.2), "#eadfc6", { at: [w / 2 + 0.08, (h + 0.1) / 2, 0.04] }),
    mesh(box(w + 0.56, 0.22, 0.26), "#eadfc6", { at: [0, h + 0.2, 0.05] }), mesh(box(w + 0.4, 0.09, 0.4), C.stoneL, { at: [0, 0.045, 0.12] }),
  ]);
  for (const s of [-1, 1]) {
    // a leaf hangs from its outer edge: the pivot is at the jamb, the leaf reaches in to the middle
    const leaf = group([mesh(box(w / 2 - 0.02, h - 0.06, 0.06), col), mesh(ball(0.035, 10), C.gold, { at: [-s * (w / 4 - 0.09), -0.05, 0.05], line: 0.5 })], [-s * (w / 4), 0, 0]);
    for (const y of [0.52, -0.5]) leaf.add(mesh(box(w / 2 - 0.2, h * 0.36, 0.03), shadeHex(col, 1.22), { at: [0, y, 0.04], line: 0.5, shadow: false }));
    const pivot = group([leaf], [s * (w / 2), h / 2, 0.03]); if (s === 1) pivot.rotation.y = -ajar; g.add(pivot);
  }
  return g;
};
const shadeHex = (c: string, k: number) => { const n = parseInt(c.slice(1), 16), ch = (v: number) => Math.max(0, Math.min(255, Math.round(k <= 1 ? v * k : v + (255 - v) * (k - 1)))).toString(16).padStart(2, "0"); return `#${ch((n >> 16) & 255)}${ch((n >> 8) & 255)}${ch(n & 255)}`; };
/** a window with a stone sill and two shutters of slats standing open */
export const windowAt = (shutter = C.green) => {
  const g = group([mesh(box(0.7, 0.8, 0.3), "#2b1d1a", { at: [0, 0, -0.1], line: 0, shadow: false }), mesh(box(0.94, 0.09, 0.2), "#eadfc6", { at: [0, -0.45, 0.06] }), mesh(box(0.9, 0.08, 0.14), "#eadfc6", { at: [0, 0.44, 0.04] })]);
  for (const s of [-1, 1]) { const sh = group([mesh(box(0.36, 0.82, 0.05), shutter)], [s * 0.37, 0, 0.03]); for (const y of [-0.24, 0, 0.24]) sh.add(mesh(box(0.28, 0.05, 0.03), shadeHex(shutter, 0.7), { at: [0, y, 0.035], line: 0, shadow: false })); const piv = new THREE.Group(); piv.position.set(s * 0.37, 0, 0.03); sh.position.set(s * 0.18, 0, 0); piv.add(sh); piv.rotation.y = s * 0.5; g.add(piv); }
  return g;
};
/** a house whose front faces +z and whose front wall stands on z = 0: a plastered body in its own colour with a painted dado, a door
 *  in a frame, windows with shutters, a tiled roof with rows of ridge tiles. door / shop = x of a doorway or a wide shop opening */
export const house = (o: House) => {
  const wall = o.wall ?? C.plaster, dado = o.dado ?? C.red, g = group([
    mesh(box(o.w, o.h, o.d), wall, { at: [0, o.h / 2, -o.d / 2] }),
    mesh(box(o.w + 0.04, 1.1, 0.06), dado, { at: [0, 0.55, 0.02], line: 0.6 }), mesh(box(o.w + 0.04, 0.07, 0.07), shadeHex(dado, 0.55), { at: [0, 1.135, 0.02], line: 0, shadow: false }),
    mesh(box(o.w + 0.3, 0.18, 0.3), "#eadfc6", { at: [0, o.h - 0.02, 0.06] }),
  ]);
  const rc = o.roof ?? C.terra, len = o.d * 0.62 + 0.5, slope = group([mesh(box(o.w + 0.5, 0.14, len), "#ffffff", { map: tiles(rc) })], [0, o.h + 0.42, -o.d * 0.25 + 0.12]);
  slope.rotation.x = 0.32;
  for (let x = -o.w / 2; x <= o.w / 2 + 0.01; x += 0.46) slope.add(mesh(cyl(0.065, 0.065, len + 0.06, 8), shadeHex(rc, 0.86), { at: [x, 0.08, 0], rot: [Math.PI / 2, 0, 0], line: 0.5 }));
  g.add(slope, mesh(box(o.w + 0.5, 0.14, o.d * 0.5), rc, { at: [0, o.h + 0.72, -o.d * 0.74], rot: [-0.3, 0, 0], line: 0.8 }));
  if (o.door !== undefined) { const d = doorway(o.doorCol ?? C.blue); d.position.set(o.door, 0, 0); g.add(d); }
  if (o.shop !== undefined) g.add(mesh(box(2.8, 2.4, 0.5), "#2b1d1a", { at: [o.shop, 1.2, -0.2], line: 0, shadow: false }), mesh(box(3.1, 0.2, 0.24), C.woodD, { at: [o.shop, 2.5, 0.04] }), mesh(box(0.2, 2.4, 0.22), C.woodD, { at: [o.shop - 1.45, 1.2, 0.04] }), mesh(box(0.2, 2.4, 0.22), C.woodD, { at: [o.shop + 1.45, 1.2, 0.04] }));
  for (const x of o.windows ?? []) { const w = windowAt(o.shutter); w.position.set(x, o.h - 1.35, 0); g.add(w); }
  if (o.awning && o.shop !== undefined) { const a = awning(3.1, 1.5, 2.9, o.awning[0], o.awning[1]); a.position.set(o.shop, 0, 0); g.add(a); }
  // the wall above the dado is painted in panels, as Roman walls were: a thin dark frame with a small ornament in each, between
  // the doors, shops and painted words
  { const busy: [number, number][] = []; if (o.door !== undefined) busy.push([o.door - 1.0, o.door + 1.0]); if (o.shop !== undefined) busy.push([o.shop - 1.75, o.shop + 1.75]); for (const sg of o.signs ?? []) busy.push([sg.x - sg.w / 2 - 0.15, sg.x + sg.w / 2 + 0.15]);
    const pc = shadeHex(dado, 0.8), top = Math.min(o.h - 2.0, 2.85), n = Math.max(1, Math.round(o.w / 1.75)), bw = o.w / n;
    if (top > 1.9) for (let i = 0; i < n; i++) { const x = -o.w / 2 + bw * (i + 0.5), x0 = x - bw / 2 + 0.16, x1 = x + bw / 2 - 0.16; if (busy.some(([a, b]) => x1 > a && x0 < b)) continue;
      const cy = (1.42 + top) / 2, hh = top - 1.42, fl = { line: 0, shadow: false } as const;
      g.add(mesh(box(x1 - x0, 0.045, 0.02), pc, { at: [x, top, 0.012], ...fl }), mesh(box(x1 - x0, 0.045, 0.02), pc, { at: [x, 1.42, 0.012], ...fl }), mesh(box(0.045, hh, 0.02), pc, { at: [x0, cy, 0.012], ...fl }), mesh(box(0.045, hh, 0.02), pc, { at: [x1, cy, 0.012], ...fl }),
        mesh(box(0.2, 0.2, 0.02), i % 2 ? C.ochre : C.green, { at: [x, cy, 0.012], rot: [0, 0, Math.PI / 4], line: 0.4, shadow: false })); } }
  for (const sg of o.signs ?? []) { const t = painted(sg.lines, sg.w, sg.h, { ink: sg.ink, bg: sg.bg ?? wall, edge: sg.edge, line: sg.edge ? 0.5 : 0 }); t.position.set(sg.x, sg.y, 0.025); g.add(t); }
  return g;
};

// ---------------- a Roman street corner: laundry, urinal, money ----------------
/** a big clay jar standing at a street corner: wide belly, the neck broken off, something yellow inside */
export const streetJar = (h = 0.78) => {
  const k = h / 0.78;
  return group([mesh(lathe(`sjar${h}`, [[0.12 * k, 0], [0.26 * k, 0.1 * k], [0.37 * k, 0.36 * k], [0.34 * k, 0.6 * k], [0.25 * k, 0.74 * k], [0.27 * k, 0.78 * k], [0.21 * k, 0.78 * k], [0.2 * k, 0.72 * k]]), C.terra),
    mesh(cyl(0.2 * k, 0.2 * k, 0.02, 20), "#d9c23c", { at: [0, 0.7 * k, 0], line: 0, shadow: false }), mesh(box(0.1 * k, 0.26 * k, 0.012), "#8a4a26", { at: [0.02, 0.5 * k, 0.345 * k], rot: [0.1, 0, 0.15], line: 0, shadow: false })]);
};
/** a fuller's treading stall: a low masonry tub with liquid in it between two side walls to lean on. Opens toward +z */
export const treadingStall = (liquid = "#cdb95a") => group([
  mesh(box(1.1, 0.12, 0.9), C.stoneL, { at: [0, 0.06, 0] }), mesh(box(1.1, 0.42, 0.1), "#d8cdb4", { at: [0, 0.21, 0.4] }), mesh(box(1.1, 0.42, 0.1), "#d8cdb4", { at: [0, 0.21, -0.4] }),
  mesh(box(0.14, 1.05, 0.9), "#e6dcc4", { at: [-0.55, 0.525, 0] }), mesh(box(0.14, 1.05, 0.9), "#e6dcc4", { at: [0.55, 0.525, 0] }),
  mesh(box(0.96, 0.03, 0.72), liquid, { at: [0, 0.3, 0], line: 0, shadow: false }),
]);
/** cloths hung over a pole between two posts to dry; the pole lies along x, `len` long, `h` above the ground */
export const dryingPole = (len = 3, h = 2.1, cloths: [number, number, number, string][] = [[-1, 0.8, 1.2, "#fbf6ea"], [0, 0.9, 1.4, "#f3e2b8"], [0.95, 0.7, 1.1, "#fbf6ea"]]) => {
  const g = group([rod([-len / 2, h, 0], [len / 2, h, 0], 0.035, C.woodD), mesh(box(0.09, h, 0.09), C.woodD, { at: [-len / 2, h / 2, 0] }), mesh(box(0.09, h, 0.09), C.woodD, { at: [len / 2, h / 2, 0] })]);
  cloths.forEach(([x, w, drop, col], i) => { g.add(mesh(box(w, drop, 0.03), col, { at: [x, h - drop / 2 + 0.02, 0.05], rot: [0.05, 0, 0] }), mesh(box(w, drop * 0.55, 0.03), col, { at: [x, h - drop * 0.275 + 0.02, -0.05], rot: [-0.05, 0, 0] }), mesh(box(w + 0.01, 0.1, 0.035), ["#7a2f8a", "#c8402f", "#3b7fc4"][i % 3], { at: [x, h - drop + 0.14, 0.085], rot: [0.05, 0, 0], line: 0, shadow: false })); });
  return g;
};
/** a strongbox bound with iron; open = the lid stands up; coinsIn = gold shows inside */
export const chest = (open = false, coinsIn = false, w = 0.62, h = 0.36, d = 0.4) => {
  const g = group([mesh(box(w, h, d), "#8a5a30", { at: [0, h / 2, 0] }), mesh(box(w + 0.03, 0.05, d + 0.03), C.iron, { at: [0, 0.04, 0], line: 0.5 }), mesh(box(w + 0.03, 0.05, d + 0.03), C.iron, { at: [0, h - 0.04, 0], line: 0.5 })]);
  for (const x of [-w * 0.3, w * 0.3]) g.add(mesh(box(0.05, h + 0.02, d + 0.035), C.iron, { at: [x, h / 2, 0], line: 0 }));
  const lid = group([mesh(box(w + 0.02, 0.07, d + 0.02), "#7a4e28", { at: [0, 0.035, d / 2] }), mesh(box(0.09, 0.09, 0.03), C.gold, { at: [0, 0.02, d + 0.02], line: 0.5 })], [0, h, -d / 2]);
  lid.rotation.x = open ? -1.9 : 0; g.add(lid);
  // what shows when the lid is up: a dark inside with a rim, and gold heaped to the brim if there is any
  if (open) { g.add(mesh(box(w - 0.07, 0.02, d - 0.07), coinsIn ? C.gold : "#2a1c16", { at: [0, h + 0.008, 0], line: 0.4, shadow: false }));
    if (coinsIn) for (let i = 0; i < 9; i++) g.add(mesh(cyl(0.04, 0.04, 0.012, 12), i % 2 ? "#ffd84a" : C.gold, { at: [(((i * 37) % 9) / 9 - 0.5) * (w - 0.2), h + 0.03 + (i % 3) * 0.012, (((i * 53) % 7) / 7 - 0.5) * (d - 0.16)], rot: [0.2 * (i % 3), 0, 0.2 * ((i + 1) % 3)], line: 0.5, shadow: false })); }
  return g;
};
/** one big coin (for close shots), lying flat; turn it to stand it up */
export const coin = (r = 0.02, col = C.gold) => group([mesh(cyl(r, r, r * 0.18, 20), col, { line: 0.6 }), mesh(cyl(r * 0.72, r * 0.72, r * 0.2, 16), shadeHex(col, 0.8), { line: 0, shadow: false })]);
/** a cook-shop counter with jars set into it (thermopolium): an L of masonry with a marble top; holes with dark rims */
export const barCounter = (len = 2.4) => {
  const g = group([mesh(box(len, 0.9, 0.62), C.ochre, { at: [0, 0.45, 0] }), mesh(box(len + 0.08, 0.07, 0.7), C.marble, { at: [0, 0.935, 0] }), mesh(box(0.62, 0.9, 1.1), C.ochre, { at: [-len / 2 + 0.31, 0.45, -0.86] }), mesh(box(0.7, 0.07, 1.18), C.marble, { at: [-len / 2 + 0.31, 0.935, -0.86] }),
    mesh(box(len * 0.5, 0.5, 0.03), C.red, { at: [0.1, 0.48, 0.325], line: 0.6 }), mesh(cyl(0.16, 0.16, 0.02, 16), C.ochre, { at: [0.1, 0.48, 0.345], rot: [Math.PI / 2, 0, 0], line: 0.5, shadow: false })]);
  for (const x of [-len / 2 + 0.75, -len / 2 + 1.35, -len / 2 + 1.95]) g.add(mesh(torus(0.19, 0.035, 18), C.terra, { at: [x, 0.975, 0], rot: [Math.PI / 2, 0, 0] }), mesh(cyl(0.17, 0.17, 0.02, 16), "#2b1d1a", { at: [x, 0.972, 0], line: 0, shadow: false }));
  return g;
};
/** a masonry bench against a wall */
export const bench = (len = 1.8) => group([mesh(box(len, 0.42, 0.42), "#e2d6b8", { at: [0, 0.21, 0] }), mesh(box(len + 0.06, 0.06, 0.48), C.stoneL, { at: [0, 0.45, 0] })]);
/** a tall dark tree of the Roman countryside */
export const cypress = (h = 7) => group([mesh(cyl(0.12, 0.16, h * 0.16, 8), C.woodD, { at: [0, h * 0.08, 0] }), mesh(lathe(`cyp${h}`, [[0.3, h * 0.12], [h * 0.11, h * 0.3], [h * 0.1, h * 0.6], [h * 0.05, h * 0.88], [0.001, h]], 12), "#2f7a46")]);
/** a temple front: steps, a podium, columns, a gable. Its front faces +z; w = width */
export const temple = (w = 9, h = 6.5) => {
  const g = group([mesh(box(w + 1.6, 0.35, 5.6), C.stoneL, { at: [0, 0.175, 0.6] }), mesh(box(w + 0.8, 0.35, 4.8), C.stoneL, { at: [0, 0.525, 0.3] }), mesh(box(w, 0.5, 4), C.marble, { at: [0, 0.95, 0] }),
    mesh(box(w - 1.2, h, 2.4), "#f6ead0", { at: [0, 1.2 + h / 2, -1] }), mesh(box(w + 0.4, 0.7, 4.2), C.marble, { at: [0, 1.2 + h + 0.35, 0] }),
    mesh(slab(`ped${w}`, [[-w / 2 - 0.3, 0], [w / 2 + 0.3, 0], [0, 2.1]], 4.2), "#f6ead0", { at: [0, 1.2 + h + 0.7, 0] }), mesh(box(w * 0.56, 0.22, 4.5), C.terra, { at: [-w * 0.265, 1.2 + h + 0.7 + 1.1, 0], rot: [0, 0, Math.atan2(2.1, w / 2 + 0.3)], line: 0.7 }), mesh(box(w * 0.56, 0.22, 4.5), C.terra, { at: [w * 0.265, 1.2 + h + 0.7 + 1.1, 0], rot: [0, 0, -Math.atan2(2.1, w / 2 + 0.3)], line: 0.7 }),
    mesh(box(1.5, 2.6, 0.2), "#3a2a22", { at: [0, 2.5, 0.22], line: 0.6 })]);
  const n = 6; for (let i = 0; i < n; i++) g.add(mesh(lathe(`tcol${h}`, [[0.5, 0], [0.5, 0.18], [0.38, 0.26], [0.33, h - 0.4], [0.42, h - 0.3], [0.5, h - 0.14], [0.5, h], [0.001, h]], 16), C.marble, { at: [-w / 2 + 0.55 + (i * (w - 1.1)) / (n - 1), 1.2, 1.45] }));
  return g;
};
/** the great amphitheatre while it is being built: `tiers` rings of piers and beams on an oval, each ring finished over a smaller
 *  part than the one below, wooden scaffolding on the unfinished end and a lifting crane on top. R = half its width */
export const amphitheatreSite = (R = 40, tierH = 9) => {
  const g = new THREE.Group(), stoneC = "#f1e8d2", arcs = [[-100, 100], [-100, 40], [-100, -20]];
  arcs.forEach(([a0, a1], k) => {
    const r = R - k * 0.6;
    for (let a = a0; a <= a1; a += 7) {
      const A = a * D2, x = Math.sin(A) * r, z = Math.cos(A) * r * 0.82, yaw = Math.atan2(Math.sin(A), Math.cos(A) * 0.82);
      g.add(mesh(box(2.3, tierH - 1.2, 3), stoneC, { at: [x, k * tierH + (tierH - 1.2) / 2, z], rot: [0, yaw, 0], line: 0.9, shadow: false }));
      if (a + 7 <= a1) { const B = (a + 3.5) * D2; g.add(mesh(box(5.2, 1.2, 3.3), shadeHex(stoneC, 0.93), { at: [Math.sin(B) * r, k * tierH + tierH - 0.6, Math.cos(B) * r * 0.82], rot: [0, Math.atan2(Math.sin(B), Math.cos(B) * 0.82), 0], line: 0.9, shadow: false })); }
    }
  });
  // scaffolding where the upper rings end
  for (const [a, k] of [[47, 1], [54, 1], [61, 1], [-13, 2], [-6, 2], [1, 2]] as number[][]) {
    const A = a * D2, x = Math.sin(A) * (R + 1.2), z = Math.cos(A) * (R + 1.2) * 0.82;
    g.add(rod([x, k * tierH, z], [x, (k + 1) * tierH + 1, z], 0.16, "#9a6a3a", { shadow: false, line: 0.6 }));
    for (const y of [0.3, 0.62, 0.95]) { const A2 = (a + 7) * D2; g.add(rod([x, (k + y) * tierH, z], [Math.sin(A2) * (R + 1.2), (k + y) * tierH, Math.cos(A2) * (R + 1.2) * 0.82], 0.12, "#b07a44", { shadow: false, line: 0.5 })); }
  }
  // the crane: two legs, a jib, a rope with a block of stone
  const cx = Math.sin(34 * D2) * R, cz = Math.cos(34 * D2) * R * 0.82, top = 2 * tierH;
  g.add(rod([cx - 1.5, top, cz], [cx + 0.6, top + 9, cz + 1], 0.2, "#8a5a30", { shadow: false }), rod([cx + 2.4, top, cz], [cx + 0.6, top + 9, cz + 1], 0.2, "#8a5a30", { shadow: false }),
    rod([cx + 0.6, top + 9, cz + 1], [cx + 4.5, top + 6.2, cz + 3.4], 0.07, "#3a3028", { shadow: false, line: 0.4 }), mesh(box(2, 1.3, 1.6), stoneC, { at: [cx + 4.5, top + 5.4, cz + 3.4], shadow: false }));
  return g;
};
/** flat white clouds far away */
export const cloud = (s = 30) => { const g = new THREE.Group(); for (const [x, y, r] of [[0, 0, 1], [0.9, 0.1, 0.72], [-0.95, 0.05, 0.66], [0.35, 0.42, 0.7], [-0.4, 0.36, 0.6]]) g.add(mesh(ball(1, 14), "#ffffff", { at: [x * s, y * s, 0], scale: [r * s, r * s * 0.6, r * s * 0.3], shadow: false, receive: false, line: 0.6 })); return g; };
export { INK3 };
