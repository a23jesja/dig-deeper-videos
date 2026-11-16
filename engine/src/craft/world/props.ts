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
  g.fillStyle = col; g.fillRect(0, 0, 256, 256); g.strokeStyle = "rgba(60,20,10,0.55)"; g.lineWidth = 5;
  for (let y = 0; y <= 256; y += 64) { g.beginPath(); g.moveTo(0, y); g.lineTo(256, y); g.stroke(); }
  for (let y = 0; y < 256; y += 64) for (let x = (y / 64) % 2 ? 0 : 32; x <= 256; x += 64) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 64); g.stroke(); }
});
export type House = { w: number; h: number; d: number; wall?: string; dado?: string; roof?: string; door?: number; shop?: number; windows?: number[]; shutter?: string; awning?: [string, string] };
/** a house whose front faces +z and whose front wall stands on z = 0. door / shop = x of a doorway or a wide shop opening, windows = their x */
export const house = (o: House) => {
  const wall = o.wall ?? C.plaster, g = group([
    mesh(box(o.w, o.h, o.d), wall, { at: [0, o.h / 2, -o.d / 2] }),
    mesh(box(o.w + 0.04, 1.1, 0.06), o.dado ?? C.red, { at: [0, 0.55, 0.02], line: 0.6 }),
  ]);
  const roof = mesh(box(o.w + 0.5, 0.14, o.d * 0.62 + 0.5), "#ffffff", { at: [0, o.h + 0.42, -o.d * 0.25 + 0.12], rot: [0.32, 0, 0], map: (() => { const t = tiles(o.roof ?? C.terra); return t; })() });
  g.add(roof, mesh(box(o.w + 0.5, 0.14, o.d * 0.5), o.roof ?? C.terra, { at: [0, o.h + 0.72, -o.d * 0.74], rot: [-0.3, 0, 0], line: 0.8 }));
  const hole = (x: number, w: number, h: number, y0 = 0) => g.add(mesh(box(w, h, 0.5), "#2b1d1a", { at: [x, y0 + h / 2, -0.2], line: 0, shadow: false }), mesh(box(w + 0.24, 0.16, 0.2), C.woodD, { at: [x, y0 + h + 0.08, 0.04] }));
  if (o.door !== undefined) { hole(o.door, 1.1, 2.2); g.add(mesh(box(0.5, 2.1, 0.07), C.wood, { at: [o.door - 0.72, 1.05, 0.12], rot: [0, 0.5, 0] })); }
  if (o.shop !== undefined) hole(o.shop, 2.8, 2.4);
  for (const x of o.windows ?? []) {
    g.add(mesh(box(0.7, 0.8, 0.3), "#2b1d1a", { at: [x, o.h - 1.25, -0.1], line: 0, shadow: false }));
    for (const s of [-1, 1]) g.add(mesh(box(0.36, 0.84, 0.05), o.shutter ?? C.green, { at: [x + s * 0.54, o.h - 1.25, 0.05] }));
  }
  if (o.awning && o.shop !== undefined) { const a = awning(3.1, 1.5, 2.9, o.awning[0], o.awning[1]); a.position.set(o.shop, 0, 0); g.add(a); }
  return g;
};
/** flat white clouds far away */
export const cloud = (s = 30) => { const g = new THREE.Group(); for (const [x, y, r] of [[0, 0, 1], [0.9, 0.1, 0.72], [-0.95, 0.05, 0.66], [0.35, 0.42, 0.7], [-0.4, 0.36, 0.6]]) g.add(mesh(ball(1, 14), "#ffffff", { at: [x * s, y * s, 0], scale: [r * s, r * s * 0.6, r * s * 0.3], shadow: false, receive: false, line: 0.6 })); return g; };
export { INK3 };
