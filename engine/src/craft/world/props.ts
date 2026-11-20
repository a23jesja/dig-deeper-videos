// Props of a Roman street, each a real object with thickness, its own colour and its own shadow (world kit, kit.ts).
// Sizes in metres. Each function returns a group standing on y = 0 at its own origin.
import * as THREE from "three";
import { mesh, group, box, cyl, ball, torus, arc, lathe, slab, paint, rod, INK3 } from "./kit";

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
    mesh(cyl(0.2 * k, 0.2 * k, 0.02, 20), "#d9c23c", { at: [0, 0.7 * k, 0], line: 0, shadow: false })]);
};
/** a fuller's treading stall: a low masonry tub with liquid in it between two side walls to lean on. Opens toward +z */
export const treadingStall = (liquid = "#cdb95a") => group([
  mesh(box(1.1, 0.12, 0.9), C.stoneL, { at: [0, 0.06, 0] }), mesh(box(1.1, 0.42, 0.1), "#d8cdb4", { at: [0, 0.21, 0.4] }), mesh(box(1.1, 0.42, 0.1), "#d8cdb4", { at: [0, 0.21, -0.4] }),
  mesh(box(0.14, 1.05, 0.9), "#e6dcc4", { at: [-0.55, 0.525, 0] }), mesh(box(0.14, 1.05, 0.9), "#e6dcc4", { at: [0.55, 0.525, 0] }),
  mesh(box(0.96, 0.03, 0.72), liquid, { at: [0, 0.3, 0], line: 0, shadow: false }),
]);
/** a fuller's treading tub: a low round masonry tub, wide enough to stand in, the liquid near its brim */
export const treadingTub = (r = 0.62, h = 0.36, liquid = "#d4c468") => {
  const g = group([
    mesh(lathe(`tub${r}${h}`, [[r * 0.92, 0], [r, 0.04], [r, h], [r - 0.09, h], [r - 0.1, h - 0.1]], 24), "#e2d6b8"),
    mesh(cyl(r - 0.09, r - 0.09, 0.03, 24), liquid, { at: [0, h - 0.07, 0], line: 0, shadow: false }),
    mesh(torus(r - 0.045, 0.05, 24), "#cfc3a2", { at: [0, h, 0], rot: [Math.PI / 2, 0, 0], line: 0.6 }),
  ]);
  // it is built of two courses of stone: the joint between them, the upright joints of each course, and where the wash has run down it
  g.add(mesh(torus(r + 0.001, 0.007, 36), "#a89c7c", { at: [0, h * 0.5, 0], rot: [Math.PI / 2, 0, 0], line: 0, shadow: false }));
  for (let i = 0; i < 14; i++) { const a = (i / 14) * 6.283, low = i % 2 === 0; g.add(mesh(box(0.012, h * 0.44, 0.012), "#a89c7c", { at: [Math.cos(a) * (r + 0.001), low ? h * 0.26 : h * 0.74, Math.sin(a) * (r + 0.001)], rot: [0, -a, 0], line: 0, shadow: false })); }
  for (const [a, len] of [[0.5, 0.2], [1.9, 0.26], [2.6, 0.15], [3.4, 0.24], [4.4, 0.18], [5.5, 0.27]]) g.add(mesh(box(0.014, len, 0.05), "#c7b56a", { at: [Math.cos(a) * (r + 0.002), h - 0.02 - len / 2, Math.sin(a) * (r + 0.002)], rot: [0, -a, 0], line: 0, shadow: false }));
  return g;
};
/** cloths hung over a pole between two posts to dry; the pole lies along x, `len` long, `h` above the ground */
export const dryingPole = (len = 3, h = 2.1, cloths: [number, number, number, string][] = [[-1, 0.8, 1.2, "#fbf6ea"], [0, 0.9, 1.4, "#f3e2b8"], [0.95, 0.7, 1.1, "#fbf6ea"]]) => {
  const g = group([rod([-len / 2, h, 0], [len / 2, h, 0], 0.035, C.woodD), mesh(box(0.09, h, 0.09), C.woodD, { at: [-len / 2, h / 2, 0] }), mesh(box(0.09, h, 0.09), C.woodD, { at: [len / 2, h / 2, 0] })]);
  cloths.forEach(([x, w, drop, col], i) => { g.add(mesh(box(w, drop, 0.03), col, { at: [x, h - drop / 2 + 0.02, 0.05], rot: [0.05, 0, 0] }), mesh(box(w, drop * 0.55, 0.03), col, { at: [x, h - drop * 0.275 + 0.02, -0.05], rot: [-0.05, 0, 0] }), mesh(box(w + 0.01, 0.1, 0.035), ["#7a2f8a", "#c8402f", "#3b7fc4"][i % 3], { at: [x, h - drop + 0.14, 0.085], rot: [0.05, 0, 0], line: 0, shadow: false })); });
  return g;
};
/** a strongbox bound with iron; open = the lid stands up; coinsIn = gold shows inside; lock = the lock's colour */
export const chest = (open = false, coinsIn = false, w = 0.62, h = 0.36, d = 0.4, lock: string = C.gold) => {
  const g = group([mesh(box(w, h, d), "#8a5a30", { at: [0, h / 2, 0] }), mesh(box(w + 0.03, 0.05, d + 0.03), C.iron, { at: [0, 0.04, 0], line: 0.5 }), mesh(box(w + 0.03, 0.05, d + 0.03), C.iron, { at: [0, h - 0.04, 0], line: 0.5 })]);
  for (const x of [-w * 0.3, w * 0.3]) g.add(mesh(box(0.05, h + 0.02, d + 0.035), C.iron, { at: [x, h / 2, 0], line: 0 }));
  const lid = group([mesh(box(w + 0.02, 0.07, d + 0.02), "#7a4e28", { at: [0, 0.035, d / 2] }), mesh(box(0.09, 0.09, 0.03), lock, { at: [0, 0.02, d + 0.02], line: 0.5 })], [0, h, -d / 2]);
  lid.rotation.x = open ? -1.9 : 0; lid.userData.lid = true; g.add(lid);
  // an iron ring at each end, wider than a fist, so that the ring shows round the hand that holds it by its outer bar
  for (const s of [-1, 1]) g.add(mesh(arc(0.08, 0.013, Math.PI, 12), C.iron, { at: [s * (w / 2 + 0.014), h * 0.68, 0], rot: [0, 0, -s * Math.PI / 2], line: 0.4, shadow: false }));
  g.userData.grips = [[-(w / 2 + 0.084), h * 0.68, 0], [w / 2 + 0.084, h * 0.68, 0]]; g.userData.depth = d;
  // what shows when the lid is up: a dark inside with a rim, and gold heaped over the brim if there is any
  if (open) { g.add(mesh(box(w - 0.07, 0.02, d - 0.07), coinsIn ? "#d9a520" : "#2a1c16", { at: [0, h + 0.008, 0], line: 0.4, shadow: false }));
    if (coinsIn) { g.add(mesh(ball(1, 14), C.gold, { at: [0, h - 0.01, 0], scale: [w * 0.4, 0.11, d * 0.36], line: 0.6, shadow: false }));
      for (let i = 0; i < 16; i++) { const a = i * 2.4, r = 0.03 + (i % 5) * 0.045; g.add(mesh(cyl(0.042, 0.042, 0.012, 12), i % 2 ? "#ffd84a" : C.gold, { at: [Math.cos(a) * r * (w / 0.5), h + 0.1 - r * 0.28 + (i % 3) * 0.008, Math.sin(a) * r * (d / 0.5)], rot: [0.5 * Math.sin(a), 0, 0.5 * Math.cos(a)], line: 0.5, shadow: false })); } } }
  return g;
};
/** one big coin (for close shots), lying flat; turn it to stand it up */
export const coin = (r = 0.02, col = C.gold) => group([mesh(cyl(r, r, r * 0.18, 20), col, { line: 0.6 }), mesh(cyl(r * 0.72, r * 0.72, r * 0.2, 16), shadeHex(col, 0.8), { line: 0, shadow: false })]);
/** a wax tablet for keeping accounts: two wooden leaves, the wax dark, a few scratched lines */
export const waxTablet = () => { const g = group([mesh(box(0.2, 0.26, 0.02), C.wood, { shadow: false }), mesh(box(0.16, 0.22, 0.012), "#3a2a22", { at: [0, 0, 0.012], line: 0, shadow: false })]); for (const y of [0.06, 0.02, -0.02]) g.add(mesh(box(0.11, 0.012, 0.006), "#d9c89a", { at: [-0.01, y, 0.02], line: 0, shadow: false })); return g; };
/** a shelf on a wall with small jars standing on it (the wall is behind it, toward -z) */
export const wallShelf = (len = 1.6, n = 3) => { const g = group([mesh(box(len, 0.06, 0.3), C.woodD, { at: [0, 0, 0.15] }), mesh(box(0.06, 0.22, 0.24), C.woodD, { at: [-len / 2 + 0.1, -0.13, 0.12], line: 0.5 }), mesh(box(0.06, 0.22, 0.24), C.woodD, { at: [len / 2 - 0.1, -0.13, 0.12], line: 0.5 })]); for (let i = 0; i < n; i++) { const j = i % 2 ? amphora(0.42) : jar(0.34); j.position.set(-len / 2 + (len / n) * (i + 0.5), 0.03, 0.15); g.add(j); } return g; };
/** a sun shade over a window or a door: a striped cloth on two iron arms (the wall is toward -z) */
export const sunShade = (w = 1.5, reach = 0.9, a = C.blue, b = C.cloth) => group([mesh(box(w, 0.04, reach * 1.08), "#ffffff", { at: [0, -0.16, reach / 2], rot: [0.36, 0, 0], map: stripes(a, b) }), mesh(box(w, 0.16, 0.03), a, { at: [0, -0.4, reach + 0.02], line: 0.6 }), rod([-w / 2 + 0.05, -0.02, 0], [-w / 2 + 0.05, -0.33, reach], 0.02, C.iron, { line: 0.4 }), rod([w / 2 - 0.05, -0.02, 0], [w / 2 - 0.05, -0.33, reach], 0.02, C.iron, { line: 0.4 })]);
/** a lamp on an iron arm from a wall (the wall is toward -z) */
export const wallLamp = () => group([rod([0, 0, 0], [0, 0, 0.4], 0.018, C.iron, { line: 0.4 }), rod([0, 0, 0.4], [0, -0.14, 0.4], 0.01, C.iron, { line: 0 }), mesh(lathe("lamp", [[0.05, 0], [0.11, 0.05], [0.12, 0.12], [0.05, 0.17], [0.001, 0.17]], 12), C.terra, { at: [0, -0.31, 0.4] })]);
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
// ---------------- things of a pirate ship ----------------
/** a cutlass: a short, broad, curved blade with a brass guard. It lies along +x from the grip at the origin, its flat toward +z */
export const cutlass = () => layered(group([mesh(box(0.2, 0.06, 0.06), "#5a3a22", { at: [0.02, 0, 0], shadow: false }), mesh(box(0.06, 0.28, 0.1), C.gold, { at: [0.15, 0, 0], line: 0.6, shadow: false }), mesh(arc(0.1, 0.02, Math.PI), C.gold, { at: [0.04, -0.03, 0], rot: [0, 0, Math.PI], line: 0.5, shadow: false }),
  mesh(slab("cutlass2", [[0, -0.055], [0.58, -0.06], [0.9, 0.1], [0.86, 0.16], [0.52, 0.08], [0, 0.065]], 0.03), "#e9eef4", { at: [0.17, 0, -0.015], line: 0.9, shadow: false })]), { 0: "back", 2: "front" });
/** marks the parts of a held thing (by their place in the group) that lie behind the hand ("back": a grip the fist hides) or over the
 *  fingers ("front": a knuckle bow); stage/staging.ts `hold` puts them there. The cutlass: grip, guard, knuckle bow, blade */
/** marks parts of a held thing to lie behind the hand ("back") or over the fingers ("front"), and the parts that are a hilt (a scabbard hides
 *  them when its sabre is drawn) */
function layered<T extends THREE.Object3D>(g: T, parts: Record<number, "back" | "front">, hilt: number[] = []): T { for (const i in parts) g.children[+i].userData.layer = parts[i]; for (const i of hilt) if (g.children[i]) g.children[i].userData.hilt = true; return g; }
// ---------------- props made to be held: the grip at the origin, the working end along +x, up along +y ----------------
/** a sabre (a pirate's cutlass, a captain's hanger) to hold: the grip, a fist long, lies across the origin; the guard and the blade
 *  stand off along +x, the pommel along -x; the knuckle bow runs under the grip from guard to pommel (it lies over the fingers) */
export const sabre = (blade = 0.62) => layered(group([mesh(box(0.155, 0.045, 0.045), "#5a3a22", { at: [-0.022, 0, 0], shadow: false }), mesh(box(0.03, 0.2, 0.08), C.gold, { at: [0.06, 0, 0], line: 0.6, shadow: false }),
  mesh(knuckleBow([[0.056, -0.034], [0.04, -0.066], [-0.01, -0.078], [-0.066, -0.07], [-0.098, -0.034], [-0.104, -0.008]]), C.gold, { line: 0.5, shadow: false }), mesh(ball(0.03, 8), C.gold, { at: [-0.104, 0, 0], line: 0.5, shadow: false }),
  Object.assign(mesh(slab("sabre" + blade, [[0, -0.04], [blade * 0.64, -0.045], [blade, 0.07], [blade * 0.95, 0.115], [blade * 0.58, 0.058], [0, 0.046]], 0.022), "#e9eef4", { at: [0.074, 0, -0.011], line: 0.9, shadow: false }), { name: "blade" })]), { 2: "front" });
/** a knuckle bow: one bent bar through the given points (x, y), from the guard round the outside of the fingers to the pommel,
 *  fixed at both ends */
function knuckleBow(pts: [number, number][]) { return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(([x, y]) => new THREE.Vector3(x, y, 0))), 20, 0.009, 6, false); }
/** the flintlock pistol to hold: the butt lies in the fist at the origin; the barrel lies along +x above the hand, the muzzle its far end */
export const pistolHeld = () => { const p = pistol(); p.position.set(0.015, 0.08, 0); return group([p]); };
/** the mug to hold: its ear at the origin, the cup beside it along +x, upright along +y */
export const mugHeld = (h = 0.13) => { const m = mug(h); m.rotation.y = Math.PI; m.position.set(h * 0.5, -h / 2, 0); return group([m]); };
/** the bucket to carry: its bail's top at the origin, the bucket hanging below it, upright */
export const bucketHeld = (h = 0.3) => { const r = h * 0.6, b = group([bucket(h), mesh(arc(r, h * 0.02, Math.PI, 14), C.iron, { at: [0, h, 0], line: 0.4, shadow: false })]); b.position.y = -(h + r); return group([b]); };
/** the gunner's linstock: a staff held near its foot (the origin), the burning match in its forked head along +x */
export const linstock = (len = 0.9) => group([mesh(box(len, 0.024, 0.024), "#5a3a22", { at: [len / 2 - 0.25, 0, 0], line: 0.5, shadow: false }), mesh(box(0.05, 0.06, 0.028), C.iron, { at: [len - 0.27, 0, 0], line: 0.4, shadow: false }),
  mesh(box(0.08, 0.012, 0.012), "#8a6a4a", { at: [len - 0.21, 0.02, 0], line: 0.3, shadow: false }), mesh(ball(0.03, 8), "#ff8a2a", { at: [len - 0.17, 0.02, 0], line: 0, shadow: false, glow: "#ff6a00" })]);
/** the fiddle held by its neck: the neck at the origin, the body along +x (props.ts fiddle turned end for end) */
export const fiddleByNeck = (len = 0.6) => { const f = fiddle(len); f.rotation.z = Math.PI; f.position.x = 0.45 * (len / 0.6); const g = group([f]); g.userData.len = len; return g; };
/** the bundle to carry by its knot: the knot at the origin, the bundle hanging below it. Its parts are named: "knot" and "sack" */
export const bundleHeld = (r = 0.2, col = "#d9c08a") => { const sack = group([mesh(ball(r, 12), col, { at: [0, 0, 0], scale: [1.15, 0.85, 1], line: 0.9 }), mesh(box(r * 0.5, r * 0.08, r * 1.3), "#8a5a36", { at: [0, r * 0.1, 0], rot: [0, 0.5, 0.2], line: 0, shadow: false })]), knot = group([mesh(ball(r * 0.3, 8), col, { at: [0, 0, 0], scale: [1.4, 0.6, 1], line: 0.7 })]);
  sack.position.y = -r * 0.82; sack.name = "sack"; knot.name = "knot"; return group([sack, knot]); };
/** a cutlass in its scabbard, to hang at a belt: the throat of the scabbard at the origin, the sheath along +x (`len` long), the hilt
 *  standing out of it along -x, a leather frog over the throat that takes the belt */
export const scabbard = (len = 0.5) => layered(group([mesh(box(len, 0.095, 0.035), "#3a2a22", { at: [len / 2, 0.003, 0], line: 0.9, shadow: false }), mesh(box(0.07, 0.105, 0.045), C.gold, { at: [len - 0.03, 0, 0], line: 0.6, shadow: false }),
  mesh(box(0.09, 0.16, 0.05), "#5a3a22", { at: [0.06, 0.03, 0], line: 0.7, shadow: false }), mesh(box(0.14, 0.05, 0.05), "#5a3a22", { at: [-0.08, 0, 0], shadow: false }), mesh(box(0.04, 0.2, 0.08), C.gold, { at: [-0.01, 0, 0], line: 0.6, shadow: false }),
  mesh(knuckleBow([[-0.02, -0.034], [-0.04, -0.062], [-0.085, -0.072], [-0.13, -0.06], [-0.158, -0.02]]), C.gold, { line: 0.5, shadow: false }), mesh(ball(0.028, 8), C.gold, { at: [-0.158, 0, 0], line: 0.5, shadow: false })]), { 0: "back", 1: "back" }, [3, 4, 5, 6]);
/** a flag as a painted cloth that hangs from its upper inner corner (the origin): w along +x, h down. kind: the black flag with a
 *  skull and crossed bones, or a plain white one */
export const flagCloth = (kind: "black" | "white", w = 1.5, h = 1.0) => mesh(box(w, h, 0.02), "#ffffff", { at: [w / 2, -h / 2, 0], line: 0.6, shadow: false, map: paint(`flag${kind}`, 384, 256, (g) => {
  g.fillStyle = kind === "black" ? "#17141a" : "#fbf8ee"; g.fillRect(0, 0, 384, 256); if (kind === "white") return;
  g.strokeStyle = "#f6f1e4"; g.lineWidth = 20; g.lineCap = "round"; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(192 - 96, 150 - s * 62); g.lineTo(192 + 96, 150 + s * 62); g.stroke(); }
  g.fillStyle = "#f6f1e4"; g.beginPath(); g.arc(192, 104, 58, 0, 7); g.fill(); g.fillRect(160, 136, 64, 40); g.fillStyle = "#17141a"; for (const s of [-1, 1]) { g.beginPath(); g.arc(192 + s * 24, 100, 15, 0, 7); g.fill(); } g.fillRect(186, 124, 12, 18); for (const x of [172, 188, 204]) g.fillRect(x, 156, 4, 20);
}) });
/** a story book with a picture and its name on the cover (the cover faces +z). pic: an island with a cross on it, or a ship's side
 *  with a plank and a pirate in a red coat */
export const storyBook = (lines: string[], pic: "island" | "plank" = "plank", w = 0.36, h = 0.46, col = "#a8322a") => {
  const g = group([mesh(box(w, h, 0.07), col, { shadow: false }), mesh(box(w - 0.03, h - 0.03, 0.06), "#fbf6ea", { at: [0.012, 0, 0], line: 0, shadow: false })]), f = { line: 0, shadow: false } as const, z = 0.042;
  // the picture on the upper part of the cover
  const art = group([mesh(box(w * 0.82, h * 0.44, 0.012), pic === "island" ? "#bfe3fb" : "#9fd6ff", { at: [0, h * 0.14, 0.04], line: 0.5, shadow: false }), mesh(box(w * 0.82, h * 0.16, 0.013), "#3b8fd6", { at: [0, h * 0.0, 0.041], ...f })]);
  if (pic === "island") art.add(mesh(ball(1, 12), "#f1dc9a", { at: [0, h * 0.06, z], scale: [w * 0.26, h * 0.07, 0.006], ...f }), mesh(box(0.014, h * 0.2, 0.01), "#9a6a3a", { at: [w * 0.06, h * 0.2, z], rot: [0, 0, -0.2], ...f }), mesh(ball(1, 8), "#3f9a5c", { at: [w * 0.1, h * 0.3, z], scale: [w * 0.16, h * 0.05, 0.006], ...f }),
    mesh(box(w * 0.14, 0.014, 0.01), "#b3261e", { at: [-w * 0.1, h * 0.09, z + 0.004], rot: [0, 0, 0.78], ...f }), mesh(box(w * 0.14, 0.014, 0.01), "#b3261e", { at: [-w * 0.1, h * 0.09, z + 0.004], rot: [0, 0, -0.78], ...f }));
  else art.add(mesh(box(w * 0.3, h * 0.3, 0.014), "#5a3a22", { at: [-w * 0.26, h * 0.15, z], ...f }), mesh(box(w * 0.44, 0.016, 0.014), "#e3c68c", { at: [0.05, h * 0.2, z + 0.002], ...f }),
    mesh(box(0.034, 0.07, 0.014), "#b3261e", { at: [-w * 0.2, h * 0.34, z + 0.002], ...f }), mesh(box(0.05, 0.016, 0.014), "#17141a", { at: [-w * 0.2, h * 0.43, z + 0.002], ...f }), mesh(ball(0.016, 6), "#e3b088", { at: [-w * 0.2, h * 0.4, z + 0.002], ...f }), mesh(box(0.024, 0.06, 0.014), "#b0803c", { at: [w * 0.28, h * 0.27, z + 0.002], ...f }));
  art.scale.set(1, 0.8, 1); art.position.y = h * 0.13; g.add(art);
  // the title fills the lower part, so that it reads at phone size
  const t = painted(lines, w * 0.88, h * 0.4, { ink: "#f6c52e", bg: col, line: 0, pad: 0.06 }); t.position.set(0, -h * 0.26, 0.036); g.add(t); g.traverse((q) => { q.castShadow = false; q.receiveShadow = false; }); return g;
};
/** a sheet of written rules: a name at the top, lines of writing, a figure at the bottom */
export const articlesSheet = (w = 0.44, h = 0.58) => mesh(box(w, h, 0.012), "#ffffff", { line: 0.6, shadow: false, receive: false, map: paint("articles", 384, 506, (g) => {
  g.fillStyle = "#f3e6c4"; g.fillRect(0, 0, 384, 506); g.fillStyle = "#2a1a14"; g.textAlign = "center"; g.font = "700 66px 'Times New Roman', Georgia, serif"; g.fillText("ARTICLES", 192, 84);
  g.strokeStyle = "#5a4634"; g.lineWidth = 6; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(44, 142 + i * 48); for (let x = 44; x <= 340 - (i % 3) * 40; x += 12) g.lineTo(x, 142 + i * 48 + 4 * Math.sin(x * 0.3 + i)); g.stroke(); }
  g.fillStyle = "#b3261e"; g.font = "700 96px 'Times New Roman', Georgia, serif"; g.fillText("800", 192, 468);
}) });
/** a sack tied at the neck; `label` is painted on its front (toward +z) */
export const moneySack = (r = 0.2, label?: string) => group([...(label ? [(() => { const t = painted([label], r * 1.25, r * 0.62, { ink: "#2a1a14", bg: "#d9c49a", line: 0 }); t.position.set(0, r * 0.85, r * 0.9); t.traverse((q) => { q.castShadow = false; q.receiveShadow = false; }); return t; })()] : []),mesh(ball(r, 14), "#d9c49a", { at: [0, r * 0.85, 0], scale: [1, 0.9, 0.9] }), mesh(cyl(r * 0.28, r * 0.42, r * 0.4, 10), "#d9c49a", { at: [0, r * 1.75, 0] }), mesh(torus(r * 0.3, 0.018, 10), "#7a4a26", { at: [0, r * 1.62, 0], rot: [Math.PI / 2, 0, 0], line: 0 })]);
/** a shark's back fin, standing in the water at the origin and pointing along +x */
export const sharkFin = (h = 0.55) => mesh(slab("fin", [[-0.42, 0], [0.34, 0], [0.16, 0.2], [-0.12, h], [-0.2, 0.3]], 0.05), "#55606e", { line: 0.8, shadow: false });
/** the ring of white water round something that stands or floats in the sea */
export const foamRing = (r = 0.45) => group([mesh(torus(r, 0.06, 20), "#ffffff", { rot: [Math.PI / 2, 0, 0], scale: [1, 1, 0.5], line: 0.5, shadow: false }), mesh(torus(r * 1.5, 0.035, 20), "#d6ecfb", { rot: [Math.PI / 2, 0, 0], scale: [1, 1, 0.4], line: 0, shadow: false })]);
/** an iron hook on a leather cup, worn where a hand was lost: the cup lies along +x from the wrist at the origin, the hook curls toward +y */
export const hookHand = () => group([mesh(cyl(0.072, 0.08, 0.2, 12), "#6a4630", { at: [0.07, 0, 0], rot: [0, 0, Math.PI / 2], line: 0.7, shadow: false }), mesh(cyl(0.086, 0.086, 0.045, 12), C.gold, { at: [0.17, 0, 0], rot: [0, 0, Math.PI / 2], line: 0.5, shadow: false }),
  mesh(cyl(0.024, 0.024, 0.1, 8), "#aeb6c2", { at: [0.23, 0, 0], rot: [0, 0, Math.PI / 2], line: 0.6, shadow: false }), mesh(arc(0.1, 0.028, Math.PI * 1.3), "#aeb6c2", { at: [0.28, 0.1, 0], rot: [0, 0, -Math.PI / 2], line: 0.8, shadow: false })]);
/** a shark, nose toward +x, about `len` metres long: grey back, white belly, back fin, tail, and jaws that open by `jaw` (0..1) */
export const sharkBody = (len = 2.3, jaw = 1) => {
  const h = len / 2, g = group([mesh(ball(1, 18), "#687688", { scale: [h * 0.86, 0.34, 0.3], at: [-0.12, 0, 0] }), mesh(ball(1, 16), "#f3f5f7", { scale: [h * 0.8, 0.26, 0.27], at: [-0.1, -0.1, 0], line: 0, shadow: false }),
    mesh(slab("sfin", [[-0.3, 0], [0.3, 0], [0.0, 0.5], [-0.14, 0.36]], 0.06), "#586474", { at: [-0.1, 0.3, -0.03], line: 0.8 }),
    mesh(slab("stail", [[0, 0.06], [-0.5, 0.6], [-0.3, 0], [-0.46, -0.42], [0, -0.06]], 0.06), "#586474", { at: [-h * 0.92, 0, -0.03], line: 0.8 }),
    mesh(slab("spec", [[0, 0], [0.34, 0], [-0.1, -0.4]], 0.05), "#586474", { at: [0.2, -0.16, 0.24], rot: [0.5, 0, 0], line: 0.7 }), mesh(slab("spec", [[0, 0], [0.34, 0], [-0.1, -0.4]], 0.05), "#586474", { at: [0.2, -0.16, -0.29], rot: [-0.5, 0, 0], line: 0.7 })]);
  // the head: the upper jaw with the eyes, the lower jaw dropped, the red of the mouth, two rows of teeth
  const up = group([mesh(ball(1, 16), "#687688", { scale: [0.5, 0.2, 0.27], at: [0.3, 0.06, 0] }), ...[-1, 1].map((s) => mesh(ball(0.05, 8), "#17141a", { at: [0.34, 0.12, s * 0.22], line: 0, shadow: false })), ...[-1, 1].map((s) => mesh(ball(0.018, 6), "#ffffff", { at: [0.36, 0.135, s * 0.262], line: 0, shadow: false }))], [h * 0.52, 0.02, 0]);
  const low = group([mesh(ball(1, 14), "#f3f5f7", { scale: [0.42, 0.11, 0.23], at: [0.24, -0.04, 0] })], [h * 0.52, -0.08, 0]);
  for (let i = 0; i < 6; i++) for (const s of [-1, 1]) { up.add(mesh(cyl(0.001, 0.035, 0.1, 6), "#ffffff", { at: [0.16 + i * 0.11, -0.1, s * (0.2 - i * 0.022)], rot: [Math.PI, 0, 0], line: 0.4, shadow: false })); low.add(mesh(cyl(0.001, 0.03, 0.085, 6), "#ffffff", { at: [0.14 + i * 0.1, 0.08, s * (0.17 - i * 0.02)], line: 0.4, shadow: false })); }
  up.rotation.z = 0.36 * jaw; low.rotation.z = -0.5 * jaw; g.add(mesh(ball(1, 12), "#9a2424", { scale: [0.34, 0.16 + 0.1 * jaw, 0.2], at: [h * 0.52 + 0.14, -0.05, 0], line: 0, shadow: false }), up, low);
  return g;
};
/** a glass bottle with a cork */
export const bottle = (h = 0.3, col = "#3f8a5c") => group([mesh(lathe(`bottle${h}`, [[h * 0.2, 0], [h * 0.22, h * 0.05], [h * 0.22, h * 0.55], [h * 0.08, h * 0.75], [h * 0.08, h * 0.95]], 12), col, { line: 0.7 }), mesh(cyl(h * 0.07, h * 0.07, h * 0.1, 8), "#c9a06a", { at: [0, h, 0], line: 0, shadow: false })]);
/** a flintlock pistol, lying along +x */
export const pistol = () => group([
  // the stock and the butt are one piece with one outline (two boxes laid over each other left a notch in the line)
  mesh(slab("pistolstock2", [[0.33, -0.012], [0.33, 0.05], [0.0, 0.05], [-0.04, 0.0], [-0.07, -0.08], [-0.08, -0.15], [-0.02, -0.175], [0.025, -0.12], [0.05, -0.045], [0.1, -0.014]], 0.06), "#8a5a30", { at: [0, 0, -0.03], line: 0.9, shadow: false }),
  mesh(cyl(0.022, 0.026, 0.36, 8), "#3a3f48", { at: [0.3, 0.068, 0], rot: [0, 0, Math.PI / 2], line: 0.7, shadow: false }),
  mesh(ball(0.035, 8), C.gold, { at: [-0.055, -0.165, 0], line: 0.5, shadow: false }), mesh(box(0.06, 0.05, 0.066), C.gold, { at: [0.11, 0.058, 0], line: 0.5, shadow: false }),
  mesh(arc(0.028, 0.006, Math.PI, 10), C.iron, { at: [0.075, -0.014, 0], rot: [0, 0, Math.PI], line: 0.4, shadow: false })]);
/** a spyglass, lying along +x from the eye end at the origin; its eye cup is wide enough to cover the eye it is put to */
export const spyglass = () => group([mesh(cyl(0.05, 0.05, 0.03, 14), "#3a2a22", { at: [0.012, 0, 0], rot: [0, 0, Math.PI / 2], line: 0.7, shadow: false }), mesh(cyl(0.028, 0.034, 0.26, 10), C.gold, { at: [0.13, 0, 0], rot: [0, 0, Math.PI / 2], shadow: false }), mesh(cyl(0.036, 0.046, 0.22, 10), "#5a3a22", { at: [0.36, 0, 0], rot: [0, 0, Math.PI / 2], shadow: false })]);
/** flat white clouds far away */
export const cloud = (s = 30) => { const g = new THREE.Group(); for (const [x, y, r] of [[0, 0, 1], [0.9, 0.1, 0.72], [-0.95, 0.05, 0.66], [0.35, 0.42, 0.7], [-0.4, 0.36, 0.6]]) g.add(mesh(ball(1, 14), "#ffffff", { at: [x * s, y * s, 0], scale: [r * s, r * s * 0.6, r * s * 0.3], shadow: false, receive: false, line: 0.6 })); return g; };
export { INK3 };

// ---------------- flags as cloth, smoke, small things of a deck ----------------
export type FlagKind = "pirate" | "red" | "friendly" | "tarpaulin" | "white";
const flagPaint = (kind: FlagKind, g: CanvasRenderingContext2D, r: () => number) => {
  const W = 384, H = 256, edge = (c: string) => { g.strokeStyle = c; g.lineWidth = 9; g.strokeRect(4.5, 4.5, W - 9, H - 9); };
  if (kind === "pirate") { // black, with a white hourglass (one of the signs Greenwich lists; no skull)
    g.fillStyle = "#1b181f"; g.fillRect(0, 0, W, H); g.fillStyle = "#f6f1e4";
    g.beginPath(); g.moveTo(132, 52); g.lineTo(252, 52); g.lineTo(200, 128); g.lineTo(252, 204); g.lineTo(132, 204); g.lineTo(184, 128); g.closePath(); g.fill();
    g.fillRect(118, 40, 148, 16); g.fillRect(118, 200, 148, 16); g.fillStyle = "#1b181f"; g.beginPath(); g.moveTo(156, 70); g.lineTo(228, 70); g.lineTo(192, 112); g.closePath(); g.fill(); edge("#050407");
  } else if (kind === "red") { g.fillStyle = "#d42a20"; g.fillRect(0, 0, W, H); g.fillStyle = "#b81f18"; for (const x of [96, 200, 300]) g.fillRect(x, 0, 10, H); edge("#6e120e"); }
  else if (kind === "friendly") { // a made-up merchant ensign: blue and white stripes, a yellow disc in the upper corner by the staff
    for (let i = 0; i < 5; i++) { g.fillStyle = i % 2 ? "#fbf6ea" : "#2f6fc0"; g.fillRect(0, (i * H) / 5, W, H / 5 + 1); }
    g.fillStyle = "#2f6fc0"; g.fillRect(0, 0, 150, (H * 3) / 5); g.fillStyle = "#f6c52e"; g.beginPath(); g.arc(75, 77, 44, 0, 7); g.fill(); edge("#1c3f73");
  } else if (kind === "white") { g.fillStyle = "#fbf8ee"; g.fillRect(0, 0, W, H); g.fillStyle = "#e6dfcb"; for (const x of [110, 240]) g.fillRect(x, 0, 8, H); edge("#8f8a7a"); }
  else { // a tarpaulin: tarred canvas, stained and patched, its edge frayed
    g.fillStyle = "#6f5d44"; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 26; i++) { g.fillStyle = ["#4a3d2c", "#5c4b35", "#857150", "#3a3024"][i % 4]; g.beginPath(); g.ellipse(r() * W, r() * H, 14 + r() * 40, 8 + r() * 22, r() * 3, 0, 7); g.fill(); }
    g.fillStyle = "#93805c"; g.fillRect(232, 46, 84, 66); g.strokeStyle = "#2c241a"; g.lineWidth = 4; g.setLineDash([9, 7]); g.strokeRect(236, 50, 76, 58); g.setLineDash([]);
    g.fillStyle = "#2c241a"; for (const [x, y] of [[40, 30], [40, 226], [344, 30], [344, 226]]) { g.beginPath(); g.arc(x, y, 9, 0, 7); g.fill(); }
    g.strokeStyle = "#2c241a"; g.lineWidth = 5; for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(W - 2, 14 + i * 28); g.lineTo(W - 16 - r() * 14, 22 + i * 28); g.stroke(); } edge("#241d15");
  }
};
/** a flag as cloth that moves. It hangs from its hoist (the edge at x = 0, from the origin down to -h) and flies toward +x.
 *  `wave(t, wind)` lays it for the time t: wind 1 = flying out, 0 = hanging limp along the staff. The cloth is made once and reshaped. */
export const clothFlag = (kind: FlagKind, w = 1.5, h = 1.0) => {
  const NX = 16, NY = 6, geo = new THREE.PlaneGeometry(w, h, NX, NY), m = mesh(geo, "#ffffff", { line: 0, map: paint("cloth" + kind, 384, 256, (g, r) => flagPaint(kind, g, r)), side: THREE.DoubleSide });
  m.receiveShadow = false;
  const wave = (t: number, wind = 1) => { const p = geo.getAttribute("position") as THREE.BufferAttribute, k = Math.max(0, Math.min(1, wind));
    for (let j = 0; j <= NY; j++) for (let i = 0; i <= NX; i++) { const u = i / NX, v = j / NY;
      const fx = u * w * (0.97 - 0.03 * Math.sin(t * 5.1 + v * 2)), fy = -v * h - 0.1 * w * u * u + 0.03 * w * u * Math.sin(t * 3.3 - u * 5), fz = 0.1 * w * u * Math.sin(u * 7.4 - t * 9 + v * 1.1) + 0.03 * w * u * Math.sin(u * 15 - t * 13);
      const lx = u * w * 0.16 + 0.025 * Math.sin(v * 6 + u * 9), ly = -v * h * 0.92 - u * w * 0.72, lz = 0.05 * Math.sin(u * 13 + t * 2.2 + v * 3);
      p.setXYZ(j * (NX + 1) + i, lx + (fx - lx) * k, ly + (fy - ly) * k, lz + (fz - lz) * k); }
    p.needsUpdate = true; geo.computeVertexNormals(); geo.computeBoundingSphere(); return m; };
  wave(0, 1); return { obj: m, wave };
};
/** powder smoke from a gun fired at p toward (dx, dz): u = seconds since the shot. A flash for a moment, then puffs that roll out, rise and thin away */
export const gunSmoke = (into: THREE.Object3D, p: [number, number, number], dx: number, dz: number, u: number, big = 1) => {
  if (u < 0 || u > 2.6) return; const n = Math.hypot(dx, dz) || 1; dx /= n; dz /= n;
  if (u < 0.09) into.add(mesh(ball(0.2 * big, 10), "#ffe27a", { at: [p[0] + dx * 0.25 * big, p[1], p[2] + dz * 0.25 * big], scale: [1.5, 0.8, 1.5], line: 0, shadow: false, glow: "#ffb030" }));
  for (let k = 0; k < 9; k++) { const s = Math.min(1, u / 0.5), far = (0.35 + 0.22 * k) * big * (1 - Math.exp(-u * 3.2)), up = (0.1 + 0.05 * (k % 3)) * u * u + 0.12 * Math.sin(k * 2.3) * s, side = 0.2 * Math.sin(k * 1.9) * big * s, rr = (0.13 + 0.035 * (k % 4)) * big * (0.5 + 0.9 * s) * Math.max(0, 1 - Math.max(0, u - 1.2) / 1.4);
    if (rr > 0.01) into.add(mesh(ball(1, 10), k % 3 ? "#f2efe8" : "#d9d5cc", { at: [p[0] + dx * far - dz * side, p[1] + up, p[2] + dz * far + dx * side], scale: [rr, rr * 0.85, rr], line: 0.5, shadow: false })); }
};
/** a wooden bucket with two hoops, standing on y = 0 */
export const bucket = (h = 0.3) => group([mesh(lathe(`bucket${h}`, [[h * 0.46, 0], [h * 0.6, h], [h * 0.53, h], [h * 0.42, h * 0.1]], 14), "#b0703c"), mesh(torus(h * 0.5, h * 0.035, 16), C.iron, { at: [0, h * 0.28, 0], rot: [Math.PI / 2, 0, 0], line: 0, shadow: false }), mesh(torus(h * 0.57, h * 0.035, 16), C.iron, { at: [0, h * 0.8, 0], rot: [Math.PI / 2, 0, 0], line: 0, shadow: false })]);
/** a tin mug with a handle (its handle toward +x) */
export const mug = (h = 0.13) => group([mesh(cyl(h * 0.36, h * 0.32, h, 12), "#b9c3cd", { at: [0, h / 2, 0], line: 0.8, shadow: false }), mesh(arc(h * 0.26, h * 0.06, Math.PI, 10), "#b9c3cd", { at: [h * 0.36, h / 2, 0], rot: [0, 0, -Math.PI / 2], line: 0.6, shadow: false })]);
/** a sail on its yard, seen broadside: the yard lies along z at the origin and the canvas hangs down from it, w wide and h deep.
 *  `drop` 0 = set and drawing, 1 = struck: the canvas lies bunched under the yard */
export const yardSail = (w = 5.6, h = 4.4, drop = 0) => { const k = 1 - 0.86 * Math.max(0, Math.min(1, drop)), g = new THREE.Group();
  g.add(rod([0, 0, -w / 2 - 0.3], [0, 0, w / 2 + 0.3], 0.09, "#7a5a36"), mesh(box(0.1 + 0.34 * (1 - k), h * k, w), "#f6efdc", { at: [0, -h * k / 2 - 0.06, 0], line: 0.9 }));
  for (let z = -w / 2 + 0.7; z < w / 2; z += 0.7) g.add(mesh(box(0.11 + 0.35 * (1 - k), h * k - 0.1, 0.02), "#cbb98c", { at: [0, -h * k / 2 - 0.06, z], line: 0, shadow: false }));
  if (k > 0.5) g.add(mesh(box(0.115, 0.14, w - 0.3), "#e4d6b0", { at: [0, -h * k * 0.55, 0], line: 0, shadow: false }));
  return g; };

// ---------------- instruments and small things of Rome under Nero ----------------
/** a fiddle (the thing the saying puts in Nero's hands): it lies along +x from the chin end at the origin to the scroll, its
 *  belly toward +z */
export const fiddle = (len = 0.6) => { const k = len / 0.6, g = new THREE.Group(), body = "#b5622a";
  for (const [x, r] of [[0.1, 0.105], [0.27, 0.085]] as number[][]) g.add(mesh(cyl(r * k, r * k, 0.05 * k, 18), body, { at: [x * k, 0, 0], rot: [Math.PI / 2, 0, 0], line: 0.9, shadow: false }));
  g.add(mesh(box(0.14 * k, 0.13 * k, 0.05 * k), body, { at: [0.185 * k, 0, 0], line: 0, shadow: false }), mesh(box(0.27 * k, 0.03 * k, 0.03 * k), "#3a2a22", { at: [0.47 * k, 0, 0.012 * k], line: 0.7, shadow: false }), mesh(ball(0.028 * k, 8), "#3a2a22", { at: [0.61 * k, 0, 0.012 * k], line: 0.7, shadow: false }));
  g.add(mesh(box(0.34 * k, 0.03 * k, 0.012 * k), "#2a1c14", { at: [0.33 * k, 0, 0.034 * k], line: 0, shadow: false }), mesh(box(0.012 * k, 0.07 * k, 0.03 * k), "#e8cf8a", { at: [0.2 * k, 0, 0.04 * k], line: 0, shadow: false }));
  for (const y of [-0.012, 0, 0.012]) g.add(mesh(box(0.44 * k, 0.003, 0.003), "#f4ecd8", { at: [0.36 * k, y * k, 0.05 * k], line: 0, shadow: false }));
  for (const [x, y] of [[0.185, 0.045], [0.185, -0.045]]) g.add(mesh(box(0.05 * k, 0.012 * k, 0.052 * k), "#2a1c14", { at: [x * k, y * k, 0], line: 0, shadow: false }));
  return g; };
/** a fiddle bow, lying along +x from the hand at the origin */
export const fiddleBow = (len = 0.62) => group([mesh(box(len, 0.014, 0.014), "#7a4a26", { at: [len / 2, 0.02, 0], line: 0.6, shadow: false }), mesh(box(len * 0.94, 0.006, 0.01), "#f4ecd8", { at: [len / 2, 0, 0], line: 0, shadow: false }), mesh(box(0.05, 0.036, 0.018), "#2a1c14", { at: [0.03, 0.008, 0], line: 0.5, shadow: false }), mesh(box(0.02, 0.03, 0.014), "#7a4a26", { at: [len - 0.01, 0.01, 0], line: 0, shadow: false })]);
/** a cithara: a wooden sound box with two arms, a crossbar and seven strings. It stands in the xy plane with the foot of its box
 *  at the origin, h high. `pluck(t, i)` = how far string i is out of line (a film sets it); the strings are returned so that they can
 *  be moved: `strings[i].position.z` and `.scale` are the film's to set. broken = the index of a string that has snapped (left out) */
export const cithara = (h = 0.62) => { const w = h * 0.62, g = new THREE.Group(), wood = "#c98f52", dark = "#8a5a30";
  g.add(mesh(box(w * 0.86, h * 0.34, 0.07), wood, { at: [0, h * 0.17, 0], line: 0.9, shadow: false }), mesh(box(w * 0.7, h * 0.05, 0.075), dark, { at: [0, h * 0.3, 0], line: 0, shadow: false }), mesh(cyl(h * 0.06, h * 0.06, 0.076, 14), dark, { at: [0, h * 0.15, 0], rot: [Math.PI / 2, 0, 0], line: 0, shadow: false }));
  for (const s of [-1, 1]) g.add(mesh(box(w * 0.1, h * 0.62, 0.05), wood, { at: [s * w * 0.42, h * 0.62, 0], rot: [0, 0, -s * 0.08], line: 0.9, shadow: false }), mesh(ball(h * 0.045, 8), C.gold, { at: [s * w * 0.47, h * 0.95, 0], line: 0.6, shadow: false }));
  g.add(mesh(box(w * 1.08, h * 0.045, 0.045), dark, { at: [0, h * 0.9, 0], line: 0.8, shadow: false }), mesh(box(w * 0.5, h * 0.03, 0.03), "#e8cf8a", { at: [0, h * 0.345, 0.045], line: 0, shadow: false }));
  const strings: THREE.Mesh[] = []; for (let i = 0; i < 7; i++) { const x = (i - 3) * w * 0.085, s = mesh(box(0.006, h * 0.55, 0.006), "#fbf6ea", { at: [x, h * 0.625, 0.045], line: 0, shadow: false }); strings.push(s); g.add(s); }
  g.userData.strings = strings; return g; };
/** a bunch of grapes hanging from its stalk (the origin is the top of the stalk) */
export const grapes = (r = 0.03) => { const g = new THREE.Group(); g.add(mesh(cyl(r * 0.2, r * 0.2, r * 2, 6), "#6a8a3a", { at: [0, -r, 0], line: 0, shadow: false }));
  let n = 0; for (let row = 0; row < 5; row++) { const m = [3, 4, 3, 2, 1][row]; for (let i = 0; i < m; i++) { g.add(mesh(ball(r, 8), n % 3 ? "#7a3f9a" : "#9a5ab8", { at: [(i - (m - 1) / 2) * r * 1.7, -r * 2.6 - row * r * 1.5, (n % 2) * r * 0.8], line: 0.6, shadow: false })); n++; } }
  return g; };
/** a bundle of belongings tied in a cloth, to carry on the back or in the arms */
export const bundle = (r = 0.2, col = "#d9c08a") => group([mesh(ball(r, 12), col, { at: [0, r * 0.8, 0], scale: [1.15, 0.85, 1], line: 0.9 }), mesh(ball(r * 0.3, 8), col, { at: [0, r * 1.62, 0], scale: [1.4, 0.6, 1], line: 0.7 }), mesh(box(r * 0.5, r * 0.08, r * 1.3), "#8a5a36", { at: [0, r * 0.9, 0], rot: [0, 0.5, 0.2], line: 0, shadow: false })]);
/** a tent of canvas over a ridge pole: w wide (along x), d deep, h high; `up` 0 = the canvas lies on the ground, 1 = pitched */
export const tent = (w = 2.2, d = 2.4, h = 1.7, up = 1, col = "#efe2c0") => { const g = new THREE.Group(), hh = Math.max(0.12, h * up), sl = Math.hypot(w / 2, hh), a = Math.atan2(hh, w / 2);
  for (const s of [-1, 1]) g.add(mesh(box(sl, 0.04, d), col, { at: [s * w / 4, hh / 2, 0], rot: [0, 0, -s * a], line: 0.9 }), mesh(box(sl * 0.96, 0.045, 0.12), "#c8402f", { at: [s * w / 4, hh / 2, d / 2 - 0.1], rot: [0, 0, -s * a], line: 0, shadow: false }));
  for (const z of [-d / 2, d / 2]) g.add(rod([0, 0, z], [0, hh + 0.12, z], 0.035, "#8a6a3e")); g.add(rod([0, hh + 0.02, -d / 2 - 0.1], [0, hh + 0.02, d / 2 + 0.1], 0.03, "#8a6a3e"));
  return g; };
/** one leaf of a tall garden gate: w wide (from its hinge at the origin toward +x), h high, of planks with iron bands and studs */
export const gateLeaf = (w = 1.5, h = 3.0, col = "#7a4a26") => { const g = new THREE.Group(); g.add(mesh(box(w, h, 0.1), col, { at: [w / 2, h / 2, 0] }));
  for (let x = w / 5; x < w - 0.01; x += w / 5) for (const s of [-1, 1]) g.add(mesh(box(0.02, h - 0.1, 0.012), "#5a3a22", { at: [x, h / 2, s * 0.052], line: 0, shadow: false }));
  for (const y of [0.45, h / 2, h - 0.45]) for (const s of [-1, 1]) { g.add(mesh(box(w - 0.06, 0.12, 0.02), C.iron, { at: [w / 2, y, s * 0.056], line: 0.5, shadow: false })); for (let x = 0.2; x < w; x += 0.32) g.add(mesh(ball(0.035, 8), "#2b2a33", { at: [x, y, s * 0.07], line: 0, shadow: false })); }
  g.add(mesh(torus(0.11, 0.022, 14), C.gold, { at: [w - 0.22, h * 0.42, 0.075], line: 0.6, shadow: false }), mesh(torus(0.11, 0.022, 14), C.gold, { at: [w - 0.22, h * 0.42, -0.075], line: 0.6, shadow: false }));
  return g; };

// ---------------- the arena: what gladiators and their referee hold ----------------
/** the gladius, a gladiator's short sword, to hold: the grip (bone, ridged for the fingers) across the origin, a small wooden guard
 *  and the straight blade along +x, a round pommel along -x. No knuckle bow: the hilt is the grip between guard and pommel */
export const gladius = (blade = 0.5) => layered(group([mesh(box(0.13, 0.038, 0.038), "#eadfc4", { at: [-0.027, 0, 0], shadow: false }),
  mesh(box(0.034, 0.082, 0.07), "#8a5a30", { at: [0.054, 0, 0], line: 0.6, shadow: false }), mesh(ball(0.032, 10), "#8a5a30", { at: [-0.1, 0, 0], scale: [0.8, 1, 1], line: 0.6, shadow: false }),
  ...[-0.056, -0.024, 0.008].map((x) => mesh(box(0.008, 0.044, 0.044), "#b8a888", { at: [x, 0, 0], line: 0, shadow: false })),
  Object.assign(mesh(slab("gladius" + blade, [[0, -0.027], [blade * 0.84, -0.027], [blade, 0], [blade * 0.84, 0.027], [0, 0.027]], 0.016), "#e9eef4", { at: [0.07, 0, -0.008], line: 0.9, shadow: false }), { name: "blade" })]), {});
/** the scutum, the heavy gladiator's tall curved shield, to hold by the grip behind its boss (the origin): its face toward +z, bent round
 *  a vertical line behind the holder's fist, w wide and h tall along y; red with a gold rim, a gold boss in the middle */
export const scutum = (w = 0.64, h = 0.98, col = "#b8322a") => {
  const n = 6, R = 0.75, half = w / 2 / R, g = new THREE.Group(), z0 = 0.075;
  for (let i = 0; i < n; i++) { const a = -half + (2 * half * (i + 0.5)) / n, x = R * Math.sin(a), z = z0 - R * (1 - Math.cos(a)), pw = (2 * R * Math.sin(half / n)) * 1.04;
    g.add(mesh(box(pw, h, 0.03), col, { at: [x, 0, z], rot: [0, a, 0], line: 0.5 }));
    for (const y of [-h / 2 + 0.025, h / 2 - 0.025]) g.add(mesh(box(pw, 0.05, 0.036), C.gold, { at: [x + 0.003 * Math.sin(a), y, z + 0.004], rot: [0, a, 0], line: 0, shadow: false }));
    if (i === 0 || i === n - 1) { const s = i === 0 ? -1 : 1, ae = s * half, xe = R * Math.sin(ae) - s * 0.02 * Math.cos(ae), ze = z0 - R * (1 - Math.cos(ae)) + 0.004; g.add(mesh(box(0.04, h, 0.036), C.gold, { at: [xe, 0, ze], rot: [0, ae, 0], line: 0, shadow: false })); } }
  g.add(mesh(box(0.05, h * 0.86, 0.034), shadeHex(col, 0.8), { at: [0, 0, z0 + 0.004], line: 0, shadow: false }), mesh(ball(0.095, 14), C.gold, { at: [0, 0, z0 + 0.012], scale: [1, 1, 0.55], line: 0.7, shadow: false }),
    mesh(box(0.12, 0.03, 0.03), "#5a3a22", { at: [0, 0, z0 - 0.045], line: 0, shadow: false }));
  return g; };
/** the trident of the net fighter: the shaft's butt at the origin, the shaft along +x (`len` to the crossbar), the three barbed prongs
 *  beyond it */
export const trident = (len = 1.6) => { const iron = "#9aa3ad", g = group([mesh(box(len, 0.03, 0.03), "#8a6a40", { at: [len / 2, 0, 0], line: 0.6, shadow: false }),
  mesh(box(0.05, 0.034, 0.034), iron, { at: [len - 0.04, 0, 0], line: 0.5, shadow: false }), mesh(box(0.028, 0.2, 0.024), iron, { at: [len, 0, 0], line: 0.6, shadow: false })]);
  for (const [y, l] of [[0, 0.27], [0.086, 0.22], [-0.086, 0.22]] as [number, number][]) { g.add(mesh(box(l, 0.02, 0.02), iron, { at: [len + l / 2, y, 0], line: 0.6, shadow: false }));
    for (const s of [-1, 1]) if (y === 0 || Math.sign(y) === s) g.add(mesh(box(0.05, 0.012, 0.012), iron, { at: [len + l - 0.03, y + s * 0.014, 0], rot: [0, 0, -s * 0.7], line: 0.4, shadow: false })); }
  return g; };
/** the net gathered in a fist: the gathered neck at the origin, the bunch of net hanging below it with a few lead weights at the bottom */
export const netBunch = (r = 0.17) => { const tex = paint("netmesh", 96, 96, (g) => { g.fillStyle = "#d9c69a"; g.fillRect(0, 0, 96, 96); g.strokeStyle = "#7a6440"; g.lineWidth = 4; for (let i = -96; i < 192; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 96, 96); g.stroke(); g.beginPath(); g.moveTo(i + 96, 0); g.lineTo(i, 96); g.stroke(); } }, [3, 3]);
  const g = group([mesh(ball(r, 14), "#ffffff", { at: [0, -r * 1.35, 0], scale: [0.9, 1.45, 0.75], map: tex, line: 0.8 }), mesh(cyl(0.025, 0.045, 0.1, 10), "#cdb98a", { at: [0, -0.04, 0], line: 0.6, shadow: false })]);
  for (const [x, y] of [[-0.09, -0.52], [0.0, -0.58], [0.1, -0.5], [-0.03, -0.47]] as [number, number][]) g.add(mesh(ball(0.022, 8), "#5a5d66", { at: [x * (r / 0.17), y * (r / 0.17) + 0.05, 0.03], line: 0.4, shadow: false }));
  return g; };
/** the net thrown open: a square of thin cords w across (its middle at the origin, lying in x and z), sagging `drop` metres from the middle
 *  to its rim when it flies. `hang` = it lies over something that wide (a head and shoulders): inside that it bows over it, outside it
 *  the cords fall straight down round it, as a net does over a man. Lead weights along its rim */
export const netOpen = (w = 1.8, drop = 0.1, n = 8, hang = 0) => { const g = new THREE.Group(), half = w / 2, P = (i: number, j: number): [number, number, number] => {
    const x = -half + (w * i) / n, z = -half + (w * j) / n, d = Math.hypot(x, z);
    if (!hang) { const r = Math.min(1, d / half); return [x, -drop * r * r, z]; }
    if (d <= hang) return [x, -drop * (d / hang) ** 2, z];
    const k = (hang + (d - hang) * 0.12) / d; return [x * k, -drop - (d - hang) * 1.05, z * k]; };
  for (let i = 0; i <= n; i++) for (let j = 0; j <= n; j++) { if (i < n) g.add(rod(P(i, j), P(i + 1, j), 0.0065, "#6e5c3c", { line: 0.3, shadow: false })); if (j < n) g.add(rod(P(i, j), P(i, j + 1), 0.0065, "#6e5c3c", { line: 0.3, shadow: false }));
    if (i === 0 || j === 0 || i === n || j === n) g.add(mesh(ball(0.018, 8), "#5a5d66", { at: P(i, j), line: 0.3, shadow: false })); }
  return g; };
/** the referee's long stick (the rudis of the summa rudis): held near one end (the origin), the stick along +x */
export const refStick = (len = 1.35) => group([mesh(box(len, 0.026, 0.026), "#7a5a36", { at: [len / 2 - 0.08, 0, 0], line: 0.6, shadow: false }), mesh(ball(0.022, 8), "#5a3a22", { at: [len - 0.08, 0, 0], line: 0.5, shadow: false })]);

// ---------------- Blackbeard getting ready, and the gladiators' school (grip sheet 5) ----------------
const F0 = { line: 0.4, shadow: false } as const;
/** a ribbon tied in a bow: the knot at the origin, a loop to each side and two short ends hanging, flat toward +z */
export const ribbonBow = (col = "#c8323a", s = 1) => { const g = group([mesh(ball(0.017 * s, 8), col, { ...F0, scale: [1, 1, 0.5] })]);
  for (const k of [-1, 1]) g.add(mesh(ball(1, 10), col, { ...F0, at: [k * 0.032 * s, 0.006 * s, 0], scale: [0.032 * s, 0.018 * s, 0.006] }), mesh(box(0.013 * s, 0.055 * s, 0.006), col, { ...F0, at: [k * 0.013 * s, -0.03 * s, 0], rot: [0, 0, k * 0.35] }));
  return g; };
/** a wooden tray with ribbons of six colours lying on it, carried flat in two hands by its ends (userData.grips), its top toward +y */
export const tray = (w = 0.46, d = 0.3) => { const g = group([mesh(box(w, 0.025, d), C.wood, {}), ...[-1, 1].map((s) => mesh(box(w, 0.04, 0.02), C.woodD, { at: [0, 0.025, s * (d / 2 - 0.01)], ...F0 })), ...[-1, 1].map((s) => mesh(box(0.02, 0.04, d), C.woodD, { at: [s * (w / 2 - 0.01), 0.025, 0], ...F0 }))]);
  ["#c8323a", "#e7bb48", "#2f6fb0", "#3f9a5c", "#c8323a", "#7a4a9a"].forEach((c, i) => g.add(mesh(box(w * 0.7, 0.008, 0.024), c, { at: [i % 2 ? 0.03 : -0.03, 0.02, -d / 2 + 0.05 + (i * (d - 0.1)) / 5], rot: [0, 0.12 * ((i % 3) - 1), 0], line: 0.3, shadow: false })));
  g.userData.grips = [[-(w / 2 + 0.02), 0, 0], [w / 2 + 0.02, 0, 0]]; g.userData.depth = d; return g; };
/** a thin stick lit at a lantern (a spill): held at its foot (the origin), the stick along +x, its end glowing (userData.tip, where the
 *  film puts the glow) */
export const spill = (len = 0.42) => { const g = group([mesh(box(len, 0.012, 0.012), "#c9a46a", { at: [len / 2, 0, 0], ...F0 }), mesh(ball(0.014, 8), "#ff7a2a", { at: [len, 0, 0], line: 0.3, shadow: false })]); g.userData.tip = [len, 0, 0]; return g; };
/** a short piece of slow match: held at one end (the origin), the twisted cord along +x, the other end glowing when lit (userData.tip) */
export const fuseCord = (len = 0.17, lit = false) => { const g = group([mesh(box(len, 0.015, 0.015), "#8a7a5a", { at: [len / 2, 0, 0], ...F0 })]);
  for (let x = 0.02; x < len; x += 0.03) g.add(mesh(box(0.005, 0.017, 0.017), "#5a4a32", { at: [x, 0, 0], rot: [0.5, 0, 0], line: 0, shadow: false }));
  if (lit) g.add(mesh(ball(0.013, 8), "#ff6a1a", { at: [len, 0, 0], line: 0.3, shadow: false })); g.userData.tip = [len, 0, 0]; return g; };
/** Blackbeard's sling: three brace of pistols in holsters on a broad leather strap, lifted in two hands by the strap's ends
 *  (userData.grips); the strap along x, the holsters hanging below it, two pistol butts standing out of each. Each holster hangs from
 *  its own point on the strap (userData.hang), so that it can be turned to hang straight down however the strap is held (hangDown) */
export const pistolSling = (len = 0.92) => { const g = group([mesh(box(len, 0.065, 0.02), "#5a3a22", {})]), hang: THREE.Object3D[] = [];
  for (let i = 0; i < 3; i++) { const h = group([mesh(box(0.12, 0.2, 0.05), "#3a2a1c", { at: [0, -0.12, 0.02], line: 0.6, shadow: false })], [(i - 1) * len * 0.3, 0, 0]);
    for (const s of [-1, 1]) h.add(mesh(box(0.035, 0.085, 0.03), "#6a4428", { at: [s * 0.03, -0.005, 0.05], rot: [0, 0, s * 0.3], line: 0.5, shadow: false }), mesh(ball(0.022, 8), C.gold, { at: [s * 0.042, 0.035, 0.05], line: 0.4, shadow: false }));
    g.add(h); hang.push(h); }
  g.userData.grips = [[-len / 2 - 0.02, 0, 0], [len / 2 + 0.02, 0, 0]]; g.userData.depth = 0.08; g.userData.hang = hang; return g; };
/** the parts of a held thing that hang from it (o.userData.hang, each turning about its own point of hanging) turned to hang straight
 *  down, whichever way the thing is held: a sling's holsters held across a chest hang, they do not stand out from the strap. Call it
 *  once the thing is placed */
export const hangDown = (o: THREE.Object3D) => { const hs = o.userData.hang as THREE.Object3D[] | undefined; if (!hs?.length) return; o.updateMatrixWorld(true);
  const d = new THREE.Vector3(0, -1, 0).applyQuaternion(o.getWorldQuaternion(new THREE.Quaternion()).invert()), phi = Math.atan2(d.x, -d.y);
  for (const h of hs) h.rotation.z = phi; o.updateMatrixWorld(true); };
/** a book held open in two hands by its outer edges (userData.grips): on the left page a woodcut of a bearded man with a fuse smoking on
 *  each side of his face, on the right page lines of print; the pages face +z */
/** an old picture of pirates, drawn by us in the manner of a woodcut (the eye patch Short: "No picture or record from their time says so"):
 *  three pirates on a deck under a sail, hats, cutlasses, each with both eyes and no patch, in a dark frame; no words on it. Faces +z */
export const piratePrint = (w = 0.44, h = 0.34) => { const map = paint("pirateprint3", 1320, 1020, (g) => { g.scale(2, 2);      // (drawn at twice the size: its thinnest lines were under a pixel of the texture and shimmered as the lens moved, the flicker of 20 Nov)
    // (redrawn after the review of v1b: "a child's drawing"; now a woodcut: hatched sky and sea, a ship under sail, three pirates in cocked
    //  hats and long coats with cutlasses, beards, and both eyes on every face; no words)
    const ink = "#24160e"; g.fillStyle = "#ead9b0"; g.fillRect(0, 0, 660, 510); g.strokeStyle = ink; g.fillStyle = ink;
    g.lineWidth = 6; g.strokeRect(16, 16, 628, 478); g.lineWidth = 2; g.strokeRect(28, 28, 604, 454);
    const L = (pts: number[][], wd = 2.4) => { g.lineWidth = wd; g.beginPath(); pts.forEach(([x, y], k) => (k ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); };
    const F = (pts: number[][]) => { g.beginPath(); pts.forEach(([x, y], k) => (k ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); };
    for (let y = 40; y < 300; y += 12) L([[32, y], [628, y]], y < 200 ? 1.6 : 1.2);      // (every 12 px at 1.2-1.6 wide: 9 px apart at 0.6-0.9 they moiréd)      // the sky, hatched down to the sea (a bare strip at the horizon read as a band of light)
    for (let y = 300; y < 380; y += 8) { g.lineWidth = 1.6; g.beginPath(); for (let x = 32; x < 628; x += 4) g.lineTo(x, y + 3 * Math.sin(x / 11 + y)); g.stroke(); }      // the sea
    // the ship far off under sail
    F([[530, 300], [624, 300], [612, 318], [542, 318]]); L([[560, 300], [560, 190]], 2.5); L([[600, 300], [600, 176]], 2.5);
    for (const [mx, top] of [[560, 196], [600, 182]].map(([x, t]) => [x, t]) as [number, number][]) { g.fillStyle = "#ead9b0"; F([[mx - 16, top + 8], [mx + 16, top + 8], [mx + 19, top + 50], [mx - 19, top + 50]]); g.fillStyle = ink; L([[mx - 16, top + 8], [mx + 16, top + 8], [mx + 19, top + 50], [mx - 19, top + 50], [mx - 16, top + 8]], 2); for (let k = 1; k < 4; k++) L([[mx - 17, top + 8 + k * 11], [mx + 18, top + 8 + k * 11]], 1); }
    L([[600, 176], [600, 160]], 2); F([[600, 160], [618, 165], [600, 170]]);
    // the deck in front
    g.fillStyle = "#cdb88c"; F([[32, 392], [628, 392], [628, 482], [32, 482]]); g.fillStyle = ink; L([[32, 392], [628, 392]], 3); for (let x = 40; x < 628; x += 26) L([[x, 396], [x - 14, 480]], 1.4);
    // three pirates
    const pirate = (cx: number, base: number, sword: number, beard: boolean, bend = 1) => { const top = base - 250;
      g.fillStyle = "#ead9b0"; F([[cx - 44, top + 92], [cx + 44, top + 92], [cx + 54, base - 70], [cx - 54, base - 70]]); g.fillStyle = ink;
      L([[cx - 44, top + 92], [cx + 44, top + 92], [cx + 54, base - 70], [cx - 54, base - 70], [cx - 44, top + 92]], 3);       // the coat
      for (let y = top + 100; y < base - 74; y += 8) L([[cx - 46 + (y - top - 92) * 0.06, y], [cx - 22, y]], 1);                // its shading
      L([[cx, top + 92], [cx, base - 70]], 2); for (const yy of [top + 115, top + 140, top + 165]) { g.beginPath(); g.arc(cx + 6, yy, 3, 0, 7); g.fill(); }
      L([[cx - 52, top + 150], [cx + 52, top + 150]], 6);                                                                        // the belt
      L([[cx - 18, base - 70], [cx - 22, base - 8]], 7); L([[cx + 18, base - 70], [cx + 22, base - 8]], 7); F([[cx - 34, base - 12], [cx - 12, base - 12], [cx - 12, base], [cx - 38, base]]); F([[cx + 12, base - 12], [cx + 34, base - 12], [cx + 38, base], [cx + 12, base]]);
      // the head: a round face, both eyes, a nose, a beard or a moustache, a cocked hat
      g.fillStyle = "#ead9b0"; g.beginPath(); g.ellipse(cx, top + 62, 26, 30, 0, 0, 7); g.fill(); g.fillStyle = ink; g.lineWidth = 2.6; g.stroke();
      for (const ex of [-10, 10]) { g.beginPath(); g.ellipse(cx + ex, top + 56, 4.2, 3.4, 0, 0, 7); g.fill(); L([[cx + ex - 7, top + 48], [cx + ex + 6, top + 47]], 2.2); }
      L([[cx, top + 58], [cx + 4, top + 70], [cx - 2, top + 71]], 2);
      if (beard) { F([[cx - 24, top + 70], [cx + 24, top + 70], [cx + 14, top + 104], [cx, top + 112], [cx - 14, top + 104]]); g.fillStyle = "#ead9b0"; F([[cx - 8, top + 78], [cx + 8, top + 78], [cx + 6, top + 82], [cx - 6, top + 82]]); g.fillStyle = ink; }
      else L([[cx - 16, top + 78], [cx - 4, top + 74], [cx + 4, top + 74], [cx + 16, top + 78]], 3);
      // the cocked hat seen from the front: a round crown, and the brim turned up into three corners, the front one pointing down at us
      // (raised clear of the eyes: the front corner of the brim covered them)
      // (one solid shape, as a tricorn looks from the front: a low crown, the brim's two side corners turned up, its lower edge on the
      //  forehead with the front corner down; a light line where the brim turns up over the crown. A crown and a brim drawn as separate
      //  pieces read as horns, the review of v1d and our own look at v1e)
      F([[cx - 50, top + 20], [cx - 40, top + 6], [cx - 24, top + 2], [cx - 16, top - 12], [cx, top - 16], [cx + 16, top - 12], [cx + 24, top + 2], [cx + 40, top + 6], [cx + 50, top + 20],
        [cx + 34, top + 30], [cx + 14, top + 33], [cx, top + 40], [cx - 14, top + 33], [cx - 34, top + 30]]);
      g.strokeStyle = "#ead9b0"; L([[cx - 46, top + 19], [cx - 26, top + 12], [cx, top + 22], [cx + 26, top + 12], [cx + 46, top + 19]], 2.2); g.strokeStyle = ink;
      // an arm up with a cutlass: a sleeve from the shoulder to a fist round the hilt, and the other arm hanging at his side to a fist (the
      // review of v1d: the swords grew out of their bodies)
      const sx = cx + sword * 40, hx = cx + sword * 78, hy = top + 66;
      L([[sx, top + 102], [cx + sword * 66, top + 100], [hx, hy]], 18); g.strokeStyle = "#ead9b0"; L([[sx, top + 102], [cx + sword * 66, top + 100], [hx, hy]], 11); g.strokeStyle = ink;
      g.fillStyle = "#ead9b0"; g.beginPath(); g.arc(hx, hy, 9, 0, 7); g.fill(); g.fillStyle = ink; g.lineWidth = 2.5; g.stroke();
      g.lineWidth = 4; g.beginPath(); g.moveTo(hx, hy - 8); g.quadraticCurveTo(hx + sword * 30 * bend, hy - 40, hx + sword * 16 * bend, hy - 88); g.stroke(); L([[hx - 12, hy - 6], [hx + 12, hy - 10]], 5);
      const ox = cx - sword * 46; L([[ox, top + 102], [ox - sword * 6, top + 150], [ox - sword * 4, top + 190]], 16); g.strokeStyle = "#ead9b0"; L([[ox, top + 102], [ox - sword * 6, top + 150], [ox - sword * 4, top + 190]], 9); g.strokeStyle = ink;
      g.fillStyle = "#ead9b0"; g.beginPath(); g.arc(ox - sword * 4, top + 194, 8, 0, 7); g.fill(); g.fillStyle = ink; g.lineWidth = 2.5; g.stroke(); };
    pirate(150, 470, -1, true); pirate(300, 466, 1, false, -0.5);      // (his blade curved back over his own head: curved out it ran through his neighbour's hat brim, the independent review of v1g)
    pirate(440, 472, 1, true); });
  // (no shadow falls on it: the daylight from the cabin's open side laid a beam's shadow edge across it, a band of light from nowhere)
  return group([mesh(box(w + 0.05, h + 0.05, 0.025), "#3a2416", { at: [0, 0, -0.012], receive: false }), mesh(box(w, h, 0.01), "#ffffff", { map, front: true, line: 0.4, shadow: false, receive: false })]); };
/** a ship's log held open the same way: both pages ruled with lines of handwriting (no words to read), a small sketch of a ship on the left */
export const logBook = (w = 0.52, h = 0.36, fold = 0.32, /** how far out past its edge the hands hold it */ out = 0.01) => { const page = (side: number) => paint("booklog" + side, 256, 352, (g) => {
    g.fillStyle = "#f1e3bd"; g.fillRect(0, 0, 256, 352); g.fillStyle = "rgba(120,90,50,0.25)"; g.fillRect(side < 0 ? 236 : 0, 0, 20, 352);
    g.strokeStyle = "#3a2c22"; g.lineWidth = 3; for (let y = 40; y < 330; y += 22) { if (side < 0 && y > 150 && y < 250) continue; g.beginPath(); g.moveTo(24, y);
      for (let x = 24; x < 224 - ((y * 7) % 60); x += 8) g.lineTo(x + 4, y - 3 + ((x * 13 + y) % 7)); g.stroke(); }
    if (side < 0) { g.lineWidth = 3.5; g.beginPath(); g.moveTo(58, 230); g.lineTo(188, 230); g.lineTo(168, 248); g.lineTo(78, 248); g.closePath(); g.stroke(); g.beginPath(); g.moveTo(123, 230); g.lineTo(123, 160); g.stroke();
      g.beginPath(); g.moveTo(126, 165); g.quadraticCurveTo(163, 190, 126, 222); g.stroke(); } });
  // (an open book, not a board: the two halves meet at the spine in a shallow V, each with its cover behind it and a thickness of pages,
  //  so that turned a little it shows as a book; the review of v1b: "the book looks like a board")
  // (the outside of each cover drawn as leather binding: a gold rule round the edge, darker toward the spine, a gold compass rose on the
  //  front half: held cover out, it was a blank brown board, the review of v1k)
  const cover = (side: number) => paint("booklogcover" + side, 256, 352, (g) => {
    g.fillStyle = "#5a2e1c"; g.fillRect(0, 0, 256, 352); const sp = side < 0 ? 236 : 0; g.fillStyle = "rgba(20,8,4,0.45)"; g.fillRect(sp, 0, 20, 352);
    g.strokeStyle = "#c9a24a"; g.lineWidth = 5; g.strokeRect(22, 22, 212, 308); g.lineWidth = 2; g.strokeRect(32, 32, 192, 288);
    if (side > 0) { const cx = 128, cy = 176; g.fillStyle = "#c9a24a"; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, 46, 0, 7); g.stroke();
      for (let k = 0; k < 8; k++) { const a = (k * Math.PI) / 4, r = k % 2 ? 34 : 62; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a - 0.18) * 12, cy + Math.sin(a - 0.18) * 12); g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); g.lineTo(cx + Math.cos(a + 0.18) * 12, cy + Math.sin(a + 0.18) * 12); g.closePath(); g.fill(); } } });
  const half = (side: number) => { const gH = new THREE.Group(); const hw = w / 2;
    gH.add(mesh(box(hw + 0.015, h + 0.03, 0.012), "#5a2e1c", { at: [side * (hw + 0.015) / 2, 0, -0.014], line: 0.5 }), mesh(box(hw, h, 0.014), "#efe2c0", { at: [side * hw / 2, 0, -0.002], line: 0.4, shadow: false }),
      mesh(box(hw - 0.004, h - 0.006, 0.002), "#ffffff", { at: [side * hw / 2, 0, 0.0065], map: page(side), line: 0, shadow: false }),
      mesh(box(hw + 0.01, h + 0.025, 0.002), "#ffffff", { at: [side * (hw + 0.015) / 2, 0, -0.0215], map: cover(-side), line: 0, shadow: false }));
    gH.rotation.y = -side * fold; return gH; };
  const spine = group([mesh(box(0.03, h + 0.03, 0.03), "#4a2416", { at: [0, 0, -0.02], line: 0.5 }), ...[-0.12, -0.04, 0.04, 0.12].map((y) => mesh(box(0.032, 0.012, 0.032), "#c9a24a", { at: [0, y * h / 0.36, -0.02], line: 0.2, shadow: false }))]);
  const g = group([half(-1), half(1), spine]);
  // (the grips at the outer edges, where the halves end after the fold)
  const ex = (w / 2) * Math.cos(fold) + out, ez = (w / 2) * Math.sin(fold);      // (each half turned toward +z at its outer edge: the book opens toward whoever it faces)
  g.userData.grips = [[-ex, 0, ez], [ex, 0, ez]]; g.userData.depth = 0.04; return g; };
export const openBook = (w = 0.52, h = 0.36) => { const map = paint("bookwoodcut", 512, 352, (g) => {
    g.fillStyle = "#f3e6c4"; g.fillRect(0, 0, 512, 352); g.fillStyle = "#cdb98a"; g.fillRect(253, 0, 6, 352); g.strokeStyle = "#2a1a14"; g.lineWidth = 3; g.strokeRect(22, 22, 210, 308);
    // the woodcut: hat, face, a beard of tails, a smoking fuse on each side
    g.fillStyle = "#2a1a14"; g.beginPath(); g.ellipse(127, 112, 70, 20, 0, 0, 7); g.fill(); g.fillRect(85, 70, 84, 44);
    g.fillStyle = "#f3e6c4"; g.beginPath(); g.ellipse(127, 150, 40, 36, 0, 0, 7); g.fill(); g.strokeStyle = "#2a1a14"; g.lineWidth = 3; g.stroke();
    g.fillStyle = "#2a1a14"; for (const x of [112, 142]) { g.beginPath(); g.arc(x, 142, 5, 0, 7); g.fill(); }
    g.beginPath(); g.moveTo(84, 160); g.quadraticCurveTo(127, 290, 170, 160); g.fill();
    g.strokeStyle = "#f3e6c4"; g.lineWidth = 3; for (let x = 100; x <= 156; x += 14) { g.beginPath(); g.moveTo(x, 190); g.lineTo(x + 2, 260); g.stroke(); }
    g.strokeStyle = "#2a1a14"; g.lineWidth = 4; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(127 + s * 62, 125); g.lineTo(127 + s * 70, 100); g.stroke(); g.beginPath(); g.moveTo(127 + s * 70, 98); g.bezierCurveTo(127 + s * 90, 80, 127 + s * 55, 60, 127 + s * 80, 38); g.stroke(); }
    g.fillStyle = "#2a1a14"; g.font = "700 22px 'Times New Roman', Georgia, serif"; g.textAlign = "center"; g.fillText("Capt. TEACH", 127, 318);
    g.fillStyle = "#5a4a3a"; for (let y = 40; y < 330; y += 18) g.fillRect(280, y, y % 54 === 4 ? 150 : 205, 6); });
  const g = group([mesh(box(w + 0.03, h + 0.03, 0.02), "#7a2a22", { at: [0, 0, -0.012] }), mesh(box(w, h, 0.012), "#ffffff", { map, line: 0.5, shadow: false })]);
  g.userData.grips = [[-w / 2 - 0.01, 0, 0], [w / 2 + 0.01, 0, 0]]; g.userData.depth = 0.04; return g; };
/** a wooden practice sword (rudis), held as a gladius is: the grip across the origin, a small guard, the blunt wooden blade along +x */
export const woodSword = (blade = 0.48) => layered(group([mesh(box(0.13, 0.038, 0.038), "#9a6a3a", { at: [-0.027, 0, 0], shadow: false }), mesh(box(0.03, 0.07, 0.06), "#7a4a26", { at: [0.054, 0, 0], line: 0.6, shadow: false }),
  mesh(ball(0.03, 10), "#7a4a26", { at: [-0.1, 0, 0], scale: [0.8, 1, 1], line: 0.6, shadow: false }),
  Object.assign(mesh(slab("rudis" + blade, [[0, -0.028], [blade * 0.9, -0.028], [blade, -0.01], [blade, 0.01], [blade * 0.9, 0.028], [0, 0.028]], 0.02), "#c99a5a", { at: [0.07, 0, -0.01], line: 0.9, shadow: false }), { name: "blade" })]), {});
/** a stretcher: two poles with canvas between them, carried by two men at the near pole's ends (userData.grips); the poles along x, the
 *  canvas toward -z behind the near pole, its top toward +y (a man lies on it) */
export const stretcher = (len = 2.3, w = 0.56) => { const g = group([mesh(box(len, 0.045, 0.045), C.woodD, { line: 0.6 }), mesh(box(len, 0.045, 0.045), C.woodD, { at: [0, 0, -w], line: 0.6 }), mesh(box(len * 0.72, 0.012, w), "#e9dcbc", { at: [0, 0.01, -w / 2], line: 0.5 })]);
  g.userData.grips = [[-len / 2 + 0.06, 0, 0], [len / 2 - 0.06, 0, 0]]; g.userData.depth = w; return g; };
/** a wooden bowl, held from below: the fingers round its foot (the origin), the bowl standing on them, upright; full of porridge, or of
 *  olives. Its foot is `lift` above the origin, so that the hand under it does not hide it */
export const bowl = (r = 0.075, olives = false, lift = 0.045) => { const g = group([mesh(cyl(r, r * 0.6, r * 0.7, 16), C.wood, { at: [0, lift + r * 0.35, 0], line: 0.6 }), mesh(cyl(r * 0.94, r * 0.94, 0.01, 16), olives ? "#4a4a2a" : "#efe2bc", { at: [0, lift + r * 0.66, 0], line: 0, shadow: false })]);
  if (olives) for (let i = 0; i < 7; i++) { const a = i * 2.4, d = (i % 3) * r * 0.25; g.add(mesh(ball(r * 0.17, 8), i % 2 ? "#3a3a24" : "#5a5a2a", { at: [Math.cos(a) * d, lift + r * 0.72, Math.sin(a) * d], scale: [1, 0.8, 1], line: 0.3, shadow: false })); }
  return g; };
/** the same bowl held by its rim: the fingers round the rim at the origin, the bowl along +x from it and hanging just below the fingers */
export const bowlRim = (r = 0.075, olives = false) => { const b = bowl(r, olives, 0); b.position.set(r * 0.92, -r * 0.62, 0); return group([b]); };
/** a wooden spoon: held at the end of its handle (the origin), its bowl along +x */
export const spoon = (len = 0.17) => group([mesh(box(len * 0.75, 0.012, 0.01), "#b0803c", { at: [len * 0.375, 0, 0], ...F0 }), mesh(ball(1, 10), "#b0803c", { at: [len * 0.86, 0, 0], scale: [0.03, 0.02, 0.008], line: 0.4, shadow: false })]);
/** a roll of linen bandage held in the fingers (the roll at the origin), its loose end hanging toward -y */
export const bandageRoll = () => group([mesh(cyl(0.028, 0.028, 0.06, 12), "#f6f2e6", { rot: [Math.PI / 2, 0, 0], line: 0.5, shadow: false }), mesh(box(0.05, 0.12, 0.004), "#f6f2e6", { at: [0.01, -0.07, 0], line: 0.4, shadow: false })]);
/** a coin held up between finger and thumb: its edge in the fingers (the origin), its face toward +z */
export const coinHeld = (r = 0.022) => { const c = coin(r); c.rotation.x = Math.PI / 2; c.position.y = r + 0.05; return group([c]); };      // its lower edge just above the closed fingers, so that the fist does not hide it
/** the sponsor's white cloth (mappa), held by one corner (the origin), hanging below it */
export const mappa = (w = 0.34, h = 0.44) => group([mesh(box(w, h, 0.008), "#fbf8ee", { at: [w * 0.32, -h / 2, 0], rot: [0, 0, 0.12], line: 0.6, shadow: false }), mesh(box(w * 0.9, 0.012, 0.009), "#c8402f", { at: [w * 0.36, -h + 0.04, 0], rot: [0, 0, 0.12], line: 0, shadow: false })]);
/** a reed pen: held near its middle (the origin), its nib along +x */
export const reedPen = (len = 0.2) => group([mesh(box(len, 0.011, 0.011), "#d0b070", { at: [len * 0.2, 0, 0], ...F0 }), mesh(box(0.03, 0.008, 0.008), "#2a1a14", { at: [len * 0.7 - 0.015, 0, 0], line: 0, shadow: false })]);
/** a scroll held up by its upper roller (its middle at the origin, in the fist), the written sheet hanging below toward -y over a lower
 *  roller; the writing faces +z */
export const scrollHeld = (w = 0.3, h = 0.38) => { const map = paint("scrollwriting", 192, 256, (g) => { g.fillStyle = "#efe2bc"; g.fillRect(0, 0, 192, 256); g.fillStyle = "#4a3a2a"; for (let y = 20; y < 240; y += 16) g.fillRect(16, y, 150 - ((y * 7) % 40), 5); });
  return group([mesh(cyl(0.016, 0.016, w + 0.06, 10), C.woodD, { rot: [0, 0, Math.PI / 2], line: 0.5, shadow: false }), mesh(box(w, h, 0.004), "#ffffff", { at: [0, -h / 2 - 0.015, 0], map, line: 0.5, shadow: false }), mesh(cyl(0.016, 0.016, w + 0.06, 10), C.woodD, { at: [0, -h - 0.03, 0], rot: [0, 0, Math.PI / 2], line: 0.5, shadow: false })]); };
/** one olive, held between finger and thumb (the origin) */
export const olive = () => group([mesh(ball(0.013, 8), "#3a3a24", { scale: [1.25, 1, 1], line: 0.3, shadow: false })]);

// ---------------- the animal trials: Saint-Julien's court and vineyard (grip sheet 6) ----------------
/** the villagers' complaint: a rolled parchment tied with a red ribbon, held at its middle (the origin), lying along x */
export const complaintRoll = (len = 0.3) => group([mesh(cyl(0.025, 0.025, len, 12), "#efe2bc", { rot: [0, 0, Math.PI / 2], line: 0.5, shadow: false }),
  mesh(cyl(0.027, 0.027, 0.028, 12), "#b8322a", { at: [len * 0.26, 0, 0], rot: [0, 0, Math.PI / 2], line: 0.3, shadow: false })]);
/** a clay water jug carried by the loop handle over its mouth: the handle's top at the origin, the jug hanging below it, upright */
export const jugHeld = (h = 0.26) => { const r = h * 0.36, j = group([mesh(cyl(r * 0.8, r, h * 0.62, 14), "#b0643c", { at: [0, h * 0.31, 0], line: 0.5, shadow: false }),
  mesh(cyl(r * 0.45, r * 0.8, h * 0.22, 14), "#b0643c", { at: [0, h * 0.73, 0], line: 0.5, shadow: false }), mesh(cyl(r * 0.5, r * 0.45, h * 0.06, 14), "#9a5432", { at: [0, h * 0.87, 0], line: 0.4, shadow: false }),
  mesh(arc(r * 0.55, h * 0.03, Math.PI, 12), "#9a5432", { at: [0, h * 0.9, 0], line: 0.4, shadow: false })]); j.position.y = -(h * 0.9 + r * 0.55); return group([j]); };
/** a surveyor's measuring rod, marked in dark bands, held at the waist (the origin): its foot along -x toward the ground, its top along +x,
 *  ending below his chin, so that it never rises in front of his face whichever way he is turned */
export const measureRod = (below = 1.18, above = 0.34) => { const len = below + above, g = group([mesh(box(len, 0.042, 0.042), "#c9a46a", { at: [(above - below) / 2, 0, 0], line: 0.5, shadow: false })]);
  for (let x = -below + 0.15; x < above - 0.05; x += 0.3) g.add(mesh(box(0.15, 0.045, 0.045), "#3a2a1a", { at: [x, 0, 0], line: 0, shadow: false })); return g; };
/** the judge's gavel: a wooden mallet held by its handle (the origin), its head across the far end along +x */
export const gavel = () => group([mesh(box(0.24, 0.022, 0.022), "#6a4a2a", { at: [0.07, 0, 0], line: 0.5, shadow: false }), mesh(cyl(0.034, 0.034, 0.1, 12), "#7a5232", { at: [0.2, 0, 0], line: 0.5, shadow: false })]);
/** the lawyer's big book, held open in both hands by its edges like openBook, but its pages only writing */
export const plainBook = (w = 0.52, h = 0.36) => { const map = paint("bookplain", 512, 352, (g) => { g.fillStyle = "#f3e6c4"; g.fillRect(0, 0, 512, 352); g.fillStyle = "#cdb98a"; g.fillRect(253, 0, 6, 352);
    g.fillStyle = "#5a4a3a"; for (const x0 of [26, 280]) for (let y = 34; y < 330; y += 18) g.fillRect(x0, y, (y * 7) % 54 === 4 ? 150 : 205, 6); g.fillStyle = "#9a2a22"; g.fillRect(26, 30, 40, 40); g.fillRect(280, 30, 40, 40); });
  const g = group([mesh(box(w + 0.03, h + 0.03, 0.02), "#4a2a1a", { at: [0, 0, -0.012] }), mesh(box(w, h, 0.012), "#ffffff", { map, line: 0.5, shadow: false })]);
  g.userData.grips = [[-w / 2 - 0.01, 0, 0], [w / 2 + 0.01, 0, 0]]; g.userData.depth = 0.04; return g; };
/** the court's record: a thick bound book lying open on a table at its end, the last leaf of writing on the left; on the right only the inside
 *  of the back board and a ragged stub where the last page was torn out. Its origin is at the middle of its spine, on the table top */
export const recordBook = (w = 0.5, h = 0.34) => { const map = paint("recordpages", 512, 352, (g) => { g.fillStyle = "#efe2bc"; g.fillRect(0, 0, 259, 352); g.fillStyle = "#4a3a2a";
    for (let y = 30; y < 330; y += 18) g.fillRect(24, y, 200 - ((y * 13) % 50), 5); g.fillStyle = "#8a6a4a"; g.fillRect(259, 0, 253, 352);
    g.fillStyle = "#efe2bc"; g.beginPath(); g.moveTo(259, 0); for (let y = 0; y <= 352; y += 16) g.lineTo(272 + ((y * 7) % 13), y); g.lineTo(259, 352); g.closePath(); g.fill(); });
  return group([mesh(box(w + 0.03, 0.05, h + 0.03), "#5a3a22", { at: [0, 0.025, 0], line: 0.6 }), mesh(box(w, 0.006, h), "#ffffff", { at: [0, 0.053, 0], map, line: 0.4, shadow: false })]); };
