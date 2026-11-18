// Saint-Julien in Savoy, 1587 (the length-test Short "Were animals really put on trial?", granskning/animal-trials/manus.md): a vineyard
// of staked vines with the green weevils on them, the empty field the village offered the weevils (dry, a few scrubby bushes, a spring in
// a ring of stones, roped off), the village square with its stone houses and church, and the court room where the case was heard:
// plastered walls, the judge's raised chair, the clerk's table with the record, the empty dock with its rail, the gallery bench, and a
// tall window behind the dock through which the vineyard shows (real vine rows stand outside it). Like the ship's cabin, the room has no
// ceiling, so the daylight falls in from above.
// The weevils are drawn far larger than life (a real one is about 6 mm), so that they read at phone size.
import * as THREE from "three";
import { mesh, group, box, cyl, ball, prism, paint, sunRig, skyDome, slabHoles } from "./kit";
import { recordBook } from "./props";
import type { V3 } from "../stage/film";

/** where the sets stand: the vineyard's rows (along x, one every `gap` in z), the field and its spring, the square, the court room */
export const SJ = {
  vine: { x0: -16, x1: -1, z0: -7, rows: 11, gap: 1.25, step: 1.0 },
  field: { at: [11, 0, 1] as V3, w: 12, d: 11, spring: [13.2, 0, -0.6] as V3 },
  square: { at: [2, 0, -14] as V3 },
  /** the court room's floor stands 2 cm above the grass round it (so that the two never flicker into each other) */
  court: { at: [60, 0.02, 0] as V3, w: 8.4, d: 6.4, h: 4.2,
    /** in the room's own terms (the floor's middle at its origin; the back wall at z = -d/2, the front wall at +d/2) */
    /** where the judge stands on his dais (its floor at `dais`), facing the room (+z); where his gavel's block is (its top); the clerk's
     *  table; the dock's seat; the gallery bench's middle and length; the window's middle, sill and size; the front door's middle, width, height */
    judge: [0.0, 0, -2.4] as V3, dais: 0.6, block: [-0.47, 0.6 + 0.831, -2.35] as V3, clerk: [2.95, 0, -1.6] as V3, dock: [0.55, 0, -0.3] as V3, dockW: 1.0, dockYaw: -0.25,
    gallery: [-3.5, 0, 1.0] as V3, galleryLen: 2.8, window: [1.05, 1.15, 0] as V3, winW: 1.35, winH: 2.0, door: [-1.6, 1.1, 2.2] as [number, number, number] },
};
/** a point given in the court room's own terms, in the world */
export const inCourt = (p: V3): V3 => [SJ.court.at[0] + p[0], SJ.court.at[1] + p[1], SJ.court.at[2] + p[2]];
/** the vineyard's row i (0 nearest the square), at position u (0 to 1) along it: the ground point of that vine */
export const vineAt = (i: number, u: number): V3 => [SJ.vine.x0 + (SJ.vine.x1 - SJ.vine.x0) * u, 0, SJ.vine.z0 + i * SJ.vine.gap];

/** a weevil: a dark metallic green body with a bright sheen on its back, a dark snout and six little legs, about 5 cm long (far larger
 *  than life), its snout along +x. The sources call them green; this green is darker and bluer than the leaves, so that they read on them */
export const weevil = (s = 1, chew = 0) => { const head = group([mesh(ball(0.012 * s, 8), "#17584a", { at: [0.008 * s, 0.004 * s, 0], line: 0.3, shadow: false }), mesh(cyl(0.0035 * s, 0.003 * s, 0.024 * s, 6), "#2a3a14", { at: [0.026 * s, 0.0, 0], rot: [0, 0, Math.PI / 2 - 0.4], line: 0.2, shadow: false })], [0.02 * s, 0, 0]);
  head.rotation.z = -chew;
  return group([mesh(ball(0.022 * s, 10), "#1e6e5e", { scale: [1.35, 0.85, 1], line: 0.5, shadow: false, glow: "#0a2a22" }),
    mesh(ball(0.008 * s, 8), "#8fe8c8", { at: [-0.004 * s, 0.014 * s, 0], scale: [1.6, 0.5, 1], line: 0, shadow: false, glow: "#2a6a58" }), head,
    ...[-1, 0, 1].flatMap((k) => [-1, 1].map((sd) => mesh(box(0.003 * s, 0.003 * s, 0.022 * s), "#2a3a14", { at: [k * 0.012 * s, -0.012 * s, sd * 0.014 * s], line: 0, shadow: false })))]); };
/** how far a weevil's middle stands above what it walks on (its body just touching) */
export const WEEVIL_LIFT = 0.016;
/** a weevil standing on a surface at p, its back along the outward normal n, its snout turned `spin` round n; `chew` dips its head */
export const weevilOn = (p: V3, n: THREE.Vector3, spin: number, s = 1, chew = 0) => { const w = weevil(s, chew), k = WEEVIL_LIFT * s;
  w.position.set(p[0] + n.x * k, p[1] + n.y * k, p[2] + n.z * k);
  w.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), n).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), spin)); return w; };

/** a leafy lobe of a vine: an ellipsoid round c with the half-widths r */
export type Lobe = { c: V3; r: V3 };
/** a point on a lobe's face toward `side` (+1 toward +z, -1 toward -z), `a` round it and `e` up it (each -1 to 1), and the outward normal there */
export const onLobe = (L: Lobe, a: number, e: number, side: number): { p: V3; n: THREE.Vector3 } => {
  const ca = a * 1.1, ce = e * 0.75, u = [Math.cos(ce) * Math.sin(ca), Math.sin(ce), side * Math.cos(ce) * Math.cos(ca)];
  return { p: [L.c[0] + L.r[0] * u[0], L.c[1] + L.r[1] * u[1], L.c[2] + L.r[2] * u[2]], n: new THREE.Vector3(u[0] / L.r[0], u[1] / L.r[1], u[2] / L.r[2]).normalize() }; };
const inLobe = (L: Lobe, p: V3) => ((p[0] - L.c[0]) / L.r[0]) ** 2 + ((p[1] - L.c[1]) / L.r[1]) ** 2 + ((p[2] - L.c[2]) / L.r[2]) ** 2 < 0.98;

/** one big vine leaf for the close shots, flat in its own x-y plane with its face toward +z and its stalk at the bottom: five pointed,
 *  toothed lobes, the veins, and `bites` holes eaten through it. `R` = half its width (0.15 = a leaf 0.3 m across, in scale with the
 *  enlarged weevils). `holes` gives where the bites are (leaf terms), so that a weevil can be put at one's edge */
export const LEAF_BITES = (R: number, seed: number, n: number): [number, number, number][] => { const r = (k: number) => { const v = Math.sin(seed * 91.17 + k * 47.3) * 43758.5453; return v - Math.floor(v); };
  return Array.from({ length: n }, (_, k) => { const th = -1.9 + (k / Math.max(1, n - 1)) * 3.8 + (r(k) - 0.5) * 0.4, d = R * (0.32 + r(k + 9) * 0.26); return [Math.sin(th) * d, Math.cos(th) * d, R * (0.1 + r(k + 17) * 0.08)] as [number, number, number]; }); };
export const vineLeaf = (R = 0.15, seed = 1, bites = 3, color = "#5fa246") => {
  const tips: [number, number][] = [[-125, 0.84], [-62, 0.95], [0, 1], [62, 0.95], [125, 0.84]], ring: [number, number][] = [[-180, 0.14], [-155, 0.58]];
  tips.forEach(([f, k], i) => { ring.push([f - 14, k * 0.82], [f - 6, k * 0.9], [f, k], [f + 6, k * 0.9], [f + 14, k * 0.82]); if (i < 4) ring.push([(f + tips[i + 1][0]) / 2, 0.56]); });
  ring.push([155, 0.58]);
  const pts = ring.map(([f, k]) => [Math.sin((f * Math.PI) / 180) * k * R, Math.cos((f * Math.PI) / 180) * k * R] as [number, number]);
  const holes = LEAF_BITES(R, seed, bites).map(([x, y, h]) => Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2, w = h * (0.8 + 0.25 * Math.sin(a * 3 + seed)); return [x + Math.cos(a) * w, y + Math.sin(a) * w * 0.8] as [number, number]; }));
  const g = group([mesh(slabHoles(`leaf${R}_${seed}_${bites}`, pts, holes, 0.004), color, { line: 0.7, shadow: false })]), J: [number, number] = [0, -0.05 * R];
  for (const [f, k] of tips) { const x = Math.sin((f * Math.PI) / 180) * k * R * 0.8, y = Math.cos((f * Math.PI) / 180) * k * R * 0.8, L = Math.hypot(x - J[0], y - J[1]);
    g.add(mesh(box(L, 0.004, 0.002), "#8ac46a", { at: [(x + J[0]) / 2, (y + J[1]) / 2, 0.0025], rot: [0, 0, Math.atan2(y - J[1], x - J[0])], line: 0, shadow: false })); }
  g.add(mesh(box(0.008, 0.6 * R, 0.006), "#6a8a3a", { at: [0, -0.05 * R - 0.3 * R, 0], line: 0.3, shadow: false }));
  return g; };

/** one vine trained along its row's wires (the row runs along x): a gnarled trunk by its stake, three long leafy lobes along the wires
 *  at waist to chest height, leaves standing out of them, two small bunches of grapes; `bugs` weevils on the leaves, on both sides */
const vine = (seed: number, bugs = 0, bugS = 1) => { const r = (k: number) => { const v = Math.sin(seed * 12.9898 + k * 78.233) * 43758.5453; return v - Math.floor(v); };
  const g = group([mesh(box(0.035, 1.25, 0.035), "#7a5a3a", { at: [0.12, 0.62, 0], line: 0.5 }), mesh(cyl(0.03, 0.045, 0.62, 6), "#5a3a22", { at: [0, 0.31, 0], rot: [0.08, 0, 0.1], line: 0.5 })]);
  const lobes: Lobe[] = [0, 1, 2].map((k) => ({ c: [(k - 1) * 0.34 + (r(k) - 0.5) * 0.08, 0.78 + r(k + 3) * 0.16 + (k === 1 ? 0.12 : 0), (r(k + 6) - 0.5) * 0.06], r: [0.22 * 1.9, 0.22 * 0.95, 0.22 * 0.85] }));
  lobes.forEach((L, k) => g.add(mesh(ball(0.22, 20), k % 2 ? "#4f8f3a" : "#5fa246", { at: L.c, scale: [1.9, 0.95, 0.85], line: 0.5 })));
  for (let k = 0; k < 7; k++) { const lf = mesh(ball(0.07, 8), k % 3 ? "#5aa044" : "#6ab24e", { at: [(r(k + 10) - 0.5) * 0.95, 0.72 + r(k + 17) * 0.42, (r(k + 24) < 0.5 ? -1 : 1) * (0.17 + r(k + 31) * 0.05)], scale: [1.2, 1, 0.35], rot: [0, 0, r(k + 38) * 3], line: 0.4 }); g.add(lf); }
  for (let k = 0; k < 2; k++) { const x = (r(k + 45) - 0.5) * 0.7, z = (k ? -1 : 1) * 0.16; for (let j = 0; j < 6; j++) g.add(mesh(ball(0.022, 6), "#5a2a5a", { at: [x + ((j % 3) - 1) * 0.025, 0.66 - Math.floor(j / 3) * 0.035 - (j % 2) * 0.01, z], line: 0.3, shadow: false })); }
  // the weevils on the lobes' faces toward both sides of the row, none where two lobes run into each other
  for (let k = 0, i = 0; k < bugs && i < bugs * 6; i++) { const L = lobes[i % 3], { p, n } = onLobe(L, r(i + 60) * 2 - 1, r(i + 70) * 1.5 - 0.5, i % 2 ? -1 : 1);
    if (lobes.some((o) => o !== L && inLobe(o, p))) continue; g.add(weevilOn(p, n, r(i + 90) * 6.28, bugS)); k++; }
  return g; };
const vineyard = (root: THREE.Group) => { const V = SJ.vine;
  root.add(mesh(box(V.x1 - V.x0 + 2, 0.02, V.rows * V.gap + 1.5), "#8a6a44", { at: [(V.x0 + V.x1) / 2, 0.005, V.z0 + ((V.rows - 1) * V.gap) / 2], line: 0 }));
  for (let i = 0; i < V.rows; i++) for (let x = V.x0, k = 0; x <= V.x1 + 1e-6; x += V.step, k++) { const v = vine(i * 31 + k, i < 4 ? 5 : i < 7 ? 3 : 0, 1.6); v.position.set(x, 0, V.z0 + i * V.gap); root.add(v); }
  // the wires along each row
  for (let i = 0; i < V.rows; i++) for (const y of [0.55, 0.95]) root.add(mesh(box(V.x1 - V.x0, 0.006, 0.006), "#6a6a6a", { at: [(V.x0 + V.x1) / 2, y, V.z0 + i * V.gap], line: 0, shadow: false }));
};

/** the field offered to the weevils: dry and stony, a few scrubby bushes, a spring in a ring of stones, roped off on short posts */
const field = (root: THREE.Group) => { const F = SJ.field, [fx, , fz] = F.at;
  const dry = paint("sjfield", 512, 512, (g, r) => { g.fillStyle = "#c9b27a"; g.fillRect(0, 0, 512, 512); for (let i = 0; i < 900; i++) { g.fillStyle = r() < 0.5 ? "#b49a62" : "#d8c48e"; g.fillRect(r() * 512, r() * 512, 3 + r() * 6, 2 + r() * 3); }
    for (let i = 0; i < 140; i++) { g.strokeStyle = r() < 0.5 ? "#8a8a4a" : "#a29a5a"; g.lineWidth = 2; const x = r() * 512, y = r() * 512; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 3 + r() * 6, y - 8 - r() * 8); g.stroke(); } }, [3, 3]);
  root.add(mesh(box(F.w, 0.02, F.d), "#ffffff", { at: [fx, 0.012, fz], map: dry, line: 0 }));
  const r = (k: number) => { const v = Math.sin(k * 91.7) * 43758.5; return v - Math.floor(v); };
  for (let k = 0; k < 26; k++) root.add(mesh(ball(0.08 + r(k) * 0.12, 8), "#9a9488", { at: [fx + (r(k + 3) - 0.5) * F.w * 0.9, 0.03, fz + (r(k + 7) - 0.5) * F.d * 0.9], scale: [1.2, 0.55, 1], line: 0.5 }));
  for (let k = 0; k < 7; k++) { const x = fx + (r(k + 40) - 0.5) * F.w * 0.8, z = fz + (r(k + 50) - 0.5) * F.d * 0.8; for (let j = 0; j < 3; j++) root.add(mesh(ball(0.22 + r(k + j) * 0.12, 8), j % 2 ? "#8a8a4a" : "#7a7a3e", { at: [x + (j - 1) * 0.2, 0.18 + j * 0.05, z + (r(k + j + 60) - 0.5) * 0.2], scale: [1, 0.75, 1], line: 0.5 })); }
  // the spring: a ring of stones round a little pool
  const [sx, , sz] = F.spring; root.add(mesh(cyl(0.55, 0.55, 0.02, 24), "#5aa0c8", { at: [sx, 0.03, sz], line: 0.3, glow: "#10283a" }));
  for (let k = 0; k < 14; k++) { const a = (k / 14) * Math.PI * 2; root.add(mesh(ball(0.13, 8), "#a8a294", { at: [sx + Math.cos(a) * 0.66, 0.06, sz + Math.sin(a) * 0.66], scale: [1.2, 0.7, 1], line: 0.5 })); }
  // the rope round it on short posts
  const corners: [number, number][] = [[fx - F.w / 2, fz - F.d / 2], [fx + F.w / 2, fz - F.d / 2], [fx + F.w / 2, fz + F.d / 2], [fx - F.w / 2, fz + F.d / 2]];
  corners.forEach(([x0, z0], i) => { const [x1, z1] = corners[(i + 1) % 4], n = Math.round(Math.hypot(x1 - x0, z1 - z0) / 2);
    for (let k = 0; k <= n; k++) root.add(mesh(box(0.06, 0.7, 0.06), "#6a4a2a", { at: [x0 + ((x1 - x0) * k) / n, 0.35, z0 + ((z1 - z0) * k) / n], line: 0.5 }));
    const len = Math.hypot(x1 - x0, z1 - z0); root.add(mesh(box(len, 0.018, 0.018), "#c8a870", { at: [(x0 + x1) / 2, 0.6, (z0 + z1) / 2], rot: [0, -Math.atan2(z1 - z0, x1 - x0), 0], line: 0.2, shadow: false })); });
};

/** a stone house: plastered walls, a door and two windows on its front (+z), a tiled roof with the ridge along z (kit's prism extrudes a
 *  plan upward, so the gable's triangle is turned upright) */
const house = (w: number, d: number, h: number, wall: string, roof: string) => { const g = group([mesh(box(w, h, d), wall, { at: [0, h / 2, 0] })]);
  g.add(mesh(prism(`roof${w}${d}`, [[-w / 2 - 0.25, 0], [w / 2 + 0.25, 0], [0, h * 0.42]], -d / 2 - 0.25, d / 2 + 0.25), roof, { at: [0, h, 0], rot: [-Math.PI / 2, 0, 0] }));
  g.add(mesh(box(0.9, 1.9, 0.06), "#5a3a22", { at: [-w * 0.22, 0.95, d / 2 + 0.02], line: 0.5 }));
  for (const x of [w * 0.12, w * 0.34]) g.add(mesh(box(0.6, 0.7, 0.06), "#3a2a22", { at: [x, h * 0.62, d / 2 + 0.02], line: 0.5 }));
  return g; };

/** the village square: cobbles, a ring of houses and the church with its bell tower behind */
const square = (root: THREE.Group) => { const [qx, , qz] = SJ.square.at;
  const cob = paint("sjcobbles", 512, 512, (g, r) => { g.fillStyle = "#a89a84"; g.fillRect(0, 0, 512, 512); for (let y = 0; y < 512; y += 32) for (let x = (y / 32) % 2 ? 16 : 0; x < 512; x += 32) { g.fillStyle = r() < 0.5 ? "#bcae96" : "#c8bca4"; g.beginPath(); g.ellipse(x + 16, y + 16, 13, 12, 0, 0, 7); g.fill(); } }, [4, 4]);
  root.add(mesh(box(22, 0.02, 14), "#ffffff", { at: [qx, 0.011, qz], map: cob, line: 0 }));
  const H: [number, number, number, number, number, string, string][] = [[-8, -5.5, 5, 4, 5.2, "#e2d6bc", "#b45a3a"], [-2.6, -6, 4.4, 4, 6.2, "#d8c8a8", "#a8502e"], [8.5, -5.5, 5, 4, 5.4, "#e6dcc6", "#b8603e"], [-10.5, 1.5, 4, 5, 4.8, "#d4c6aa", "#ac5634"], [11, 1.8, 4, 5, 5, "#ded0b4", "#b25c3a"]];
  for (const [x, z, w, d, h, wall, roof] of H) { const ho = house(w, d, h, wall, roof); ho.position.set(qx + x, 0, qz + z); if (Math.abs(x) > 10) ho.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2; root.add(ho); }
  // the church: a nave and a bell tower, its door toward the square
  const ch = group([mesh(box(6, 6.5, 9), "#e8decb", { at: [0, 3.25, 0] }), mesh(prism("nave", [[-3.3, 0], [3.3, 0], [0, 2.8]], -4.7, 4.7), "#9a4a2e", { at: [0, 6.5, 0], rot: [-Math.PI / 2, 0, 0] }), mesh(box(1.4, 2.8, 0.08), "#4a2e1c", { at: [0, 1.4, 4.52], line: 0.5 }),
    mesh(box(2.4, 12, 2.4), "#e2d6bf", { at: [3.6, 6, 3.4] }), mesh(prism("spire", [[-1.4, 0], [1.4, 0], [0, 3.4]], -1.4, 1.4), "#7a3a24", { at: [3.6, 12, 3.4], rot: [-Math.PI / 2, 0, 0] }), mesh(box(0.8, 1.1, 2.5), "#2a1e18", { at: [3.6, 10.2, 3.4], line: 0.4 })]);
  ch.position.set(qx + 2.6, 0, qz - 12); root.add(ch);
};

/** the court room (in its own terms), laid out in depth for the upright picture: seen from the gallery's end (+z) the empty dock stands
 *  nearest, facing the lens behind its rail; beyond it the floor where the lawyer pleads; at the far end the judge's dais, with the window onto the
 *  vineyard beside it. The gallery bench runs along the left wall (-x), facing across the room; the clerk's table stands by the right wall.
 *  The walls cast no shadows: the room is lit evenly from above, as if through high windows */
const courtRoom = () => { const C = SJ.court, g = new THREE.Group(), z0 = -C.d / 2, t = 0.2, plaster = "#eadfc8", base = "#b8a888", wood = "#6a4428", woodD = "#4a2e1c", W = { shadow: false };
  const floor = paint("sjfloor", 512, 512, (gg, r) => { gg.fillStyle = "#9a6a42"; gg.fillRect(0, 0, 512, 512); for (let x = 0; x < 512; x += 42) { gg.fillStyle = r() < 0.5 ? "#8a5c38" : "#a4744a"; gg.fillRect(x, 0, 40, 512); gg.fillStyle = "#6a4428"; gg.fillRect(x + 40, 0, 2, 512); } }, [2, 2]);
  g.add(mesh(box(C.w, 0.1, C.d), "#ffffff", { at: [0, -0.05, 0], map: floor, line: 0 }));
  // the back wall round the tall window, with a stone base along the bottom
  const [wx, wy] = C.window, w0 = wx - C.winW / 2, w1 = wx + C.winW / 2, y0 = wy, y1 = wy + C.winH;
  g.add(mesh(box(w0 + C.w / 2, C.h, t), plaster, { at: [(-C.w / 2 + w0) / 2, C.h / 2, z0], ...W }), mesh(box(C.w / 2 - w1, C.h, t), plaster, { at: [(w1 + C.w / 2) / 2, C.h / 2, z0], ...W }));
  g.add(mesh(box(C.winW, y0, t), plaster, { at: [wx, y0 / 2, z0], ...W }), mesh(box(C.winW, C.h - y1, t), plaster, { at: [wx, (y1 + C.h) / 2, z0], ...W }));
  for (const s of [-1, 1]) g.add(mesh(box(0.1, C.winH + 0.16, t + 0.08), woodD, { at: [wx + (s * C.winW) / 2, (y0 + y1) / 2, z0], line: 0.5, ...W }));
  for (const y of [y0 - 0.05, y1 + 0.05]) g.add(mesh(box(C.winW + 0.2, 0.1, t + 0.08), woodD, { at: [wx, y, z0], line: 0.5, ...W }));
  g.add(mesh(box(0.04, C.winH, 0.04), woodD, { at: [wx, (y0 + y1) / 2, z0], line: 0.3, shadow: false }), mesh(box(C.winW, 0.04, 0.04), woodD, { at: [wx, (y0 + y1) / 2 + 0.25, z0], line: 0.3, shadow: false }));
  g.add(mesh(box(C.w, 0.6, t + 0.04), base, { at: [0, 0.3, z0 + 0.02], ...W }));
  // the side walls, and the front wall with its door (seen only when the lens looks back at the gallery's end)
  for (const s of [-1, 1]) g.add(mesh(box(t, C.h, C.d), plaster, { at: [(s * C.w) / 2, C.h / 2, 0], ...W }), mesh(box(t + 0.04, 0.6, C.d), base, { at: [(s * (C.w / 2 - 0.02)), 0.3, 0], ...W }));
  const [dx0, dw, dh] = C.door, zf = C.d / 2;
  g.add(mesh(box(dx0 - dw / 2 + C.w / 2, C.h, t), plaster, { at: [(-C.w / 2 + dx0 - dw / 2) / 2, C.h / 2, zf], ...W }), mesh(box(C.w / 2 - dx0 - dw / 2, C.h, t), plaster, { at: [(dx0 + dw / 2 + C.w / 2) / 2, C.h / 2, zf], ...W }), mesh(box(dw, C.h - dh, t), plaster, { at: [dx0, (dh + C.h) / 2, zf], ...W }));
  g.add(mesh(box(dw, dh, 0.06), "#5a3a22", { at: [dx0, dh / 2, zf - 0.06], line: 0.5, ...W }), mesh(box(C.w, 0.6, t + 0.04), base, { at: [0, 0.3, zf - 0.02], ...W }));
  // the beams overhead (no shadows: their stripes fell across faces)
  for (let z = -C.d / 2 + 0.6; z < C.d / 2; z += 1.4) g.add(mesh(box(C.w, 0.22, 0.26), woodD, { at: [0, C.h, z], line: 0.5, shadow: false }));
  // the judge's dais with a panel along its front, his high-backed chair behind where he stands, a wooden cross above him, and at his
  // right hand (-x, as he faces the room) a small table with the round block his gavel strikes: its top where the gavel's head comes
  // down in the strike of grip sheet 6 (COURT.block)
  const [jx, , jz] = C.judge, D = C.dais;
  g.add(mesh(box(2.2, D, 1.55), wood, { at: [jx + 0.05, D / 2, jz - 0.08] }), mesh(box(2.2, 0.5, 0.06), woodD, { at: [jx + 0.05, D + 0.25, jz + 0.67], line: 0.5 }));
  g.add(mesh(box(0.8, 0.08, 0.6), woodD, { at: [jx, D + 0.48, jz - 0.5] }), mesh(box(0.8, 1.7, 0.1), woodD, { at: [jx, D + 0.85, jz - 0.78], line: 0.6 }), mesh(box(0.84, 0.16, 0.14), "#8a2a2a", { at: [jx, D + 1.72, jz - 0.78], line: 0.5 }));
  for (const sx of [-1, 1]) g.add(mesh(box(0.06, 0.48, 0.06), woodD, { at: [jx + sx * 0.36, D + 0.24, jz - 0.24], line: 0.3 }));
  g.add(mesh(box(0.08, 0.7, 0.06), woodD, { at: [jx, 3.35, z0 + 0.14], line: 0.5 }), mesh(box(0.42, 0.08, 0.06), woodD, { at: [jx, 3.5, z0 + 0.14], line: 0.5 }));
  const [bx, by, bz] = C.block; g.add(mesh(box(0.36, 0.04, 0.32), woodD, { at: [bx, by - 0.051, bz], line: 0.5 }), mesh(cyl(0.085, 0.09, 0.031, 18), "#3a2416", { at: [bx, by - 0.0155, bz], line: 0.5 }));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(mesh(box(0.04, by - 0.071 - D, 0.04), woodD, { at: [bx + sx * 0.14, D + (by - 0.071 - D) / 2, bz + sz * 0.12], line: 0.3 }));
  // the clerk's table by the right wall with the record on it, and his stool on the wall side
  const [cx, , cz] = C.clerk; g.add(mesh(box(0.7, 0.06, 1.2), woodD, { at: [cx, 0.76, cz], line: 0.5 }));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(mesh(box(0.06, 0.74, 0.06), woodD, { at: [cx + sx * 0.28, 0.37, cz + sz * 0.52], line: 0.4 }));
  const rec = recordBook(); rec.name = "record"; rec.position.set(cx, 0.79, cz); rec.rotation.y = Math.PI / 2; g.add(rec);
  g.add(mesh(cyl(0.2, 0.2, 0.06, 12), woodD, { at: [cx + 0.6, 0.5, cz], line: 0.5 }), mesh(cyl(0.03, 0.03, 0.48, 6), woodD, { at: [cx + 0.6, 0.24, cz], line: 0.3 }));
  // the dock: an empty bench facing the gallery's end, turned `dockYaw` toward the lawyer's side, so that its empty seat shows behind the
  // rail before it
  { const [dx, , dz] = C.dock, kw = C.dockW, k = new THREE.Group(), pale = "#a8794a"; k.position.set(dx, 0, dz); k.rotation.y = C.dockYaw;
    k.add(mesh(box(kw, 0.08, 0.45), pale, { at: [0, 0.46, 0] }), mesh(box(kw, 0.42, 0.06), woodD, { at: [0, 0.21, 0.2], line: 0.5 }), mesh(box(kw, 0.5, 0.06), woodD, { at: [0, 0.74, -0.22], line: 0.5 }));
    for (const s of [-1, 1]) k.add(mesh(box(0.08, 1.0, 0.08), woodD, { at: [s * (kw / 2 + 0.05), 0.5, 0.45], line: 0.5 }), mesh(box(0.06, 0.46, 0.4), woodD, { at: [s * (kw / 2 - 0.03), 0.23, 0], line: 0.4 }));
    k.add(mesh(box(kw + 0.2, 0.08, 0.08), woodD, { at: [0, 1.0, 0.45], line: 0.5 }), mesh(box(kw + 0.2, 0.06, 0.06), woodD, { at: [0, 0.55, 0.45], line: 0.4 }));
    for (let x = -kw / 2 + 0.06; x < kw / 2; x += 0.14) k.add(mesh(cyl(0.016, 0.016, 0.45, 6), pale, { at: [x, 0.775, 0.45], line: 0.3, shadow: false }));
    g.add(k); }
  // the gallery bench along the left wall, facing across the room (+x), for the villagers and Sir Digsworth
  // (its seat 0.42 m high, a chair's height: at 0.50 a seated man's thighs lay in it, or his feet hung above the floor)
  const [gx, , gz] = C.gallery; g.add(mesh(box(0.45, 0.08, C.galleryLen), wood, { at: [gx, 0.38, gz] }), mesh(box(0.06, 0.5, C.galleryLen), woodD, { at: [gx - 0.22, 0.66, gz], line: 0.5 }));
  for (const s of [-1, 1]) g.add(mesh(box(0.4, 0.46, 0.06), woodD, { at: [gx, 0.23, gz + s * (C.galleryLen / 2 - 0.1)], line: 0.4 }));
  return g; };

/** the whole world: sky and sun, the ground, the vineyard, the field, the square and the court room (with vine rows outside its window) */
export const stJulienWorld = () => { const root = new THREE.Group();
  root.add(skyDome("#3f8fe0", "#b8e0ff", "#eaf6ff"));
  const rig = sunRig({ from: [-10, 16, 9], power: 1.5, fill: 1.8, bounce: 0.8, reach: 14 }, [0, 0, 0]); root.add(rig); root.userData.rig = rig;
  const grass = paint("sjgrass", 512, 512, (g, r) => { g.fillStyle = "#8aa85a"; g.fillRect(0, 0, 512, 512); for (let i = 0; i < 1200; i++) { g.fillStyle = r() < 0.5 ? "#7a9a4e" : "#9ab66a"; g.fillRect(r() * 512, r() * 512, 3, 3); } }, [40, 40]);
  root.add(mesh(box(400, 0.2, 400), "#ffffff", { at: [0, -0.1, 0], map: grass, line: 0, shadow: false }));
  // hills all round, far off
  for (let k = 0; k < 9; k++) { const a = (k / 9) * Math.PI * 2, R = 140; root.add(mesh(ball(48, 16), k % 2 ? "#7a9a5a" : "#6a8a52", { at: [Math.cos(a) * R, -18, Math.sin(a) * R], scale: [1.6, 1, 1], line: 0, shadow: false })); }
  vineyard(root); field(root); square(root);
  const room = courtRoom(); room.position.set(...SJ.court.at); root.add(room);
  // the vines seen through the court room's window: rows on terraces rising behind its back wall (the first at the window's height),
  // with weevils on them; each terrace a bank of earth
  for (let i = 0; i < 3; i++) { const y = 0.75 + i * 0.6, z = SJ.court.at[2] - SJ.court.d / 2 - 1.3 - i * 1.3;
    root.add(mesh(box(9, y, 1.3), "#8a6a44", { at: [SJ.court.at[0] + SJ.court.window[0], y / 2, z], line: 0.4 }));
    for (let k = 0; k < 9; k++) { const v = vine(500 + i * 13 + k, 8, 2.4); v.position.set(SJ.court.at[0] + SJ.court.window[0] - 4 + k * 1.0, y, z); root.add(v); } }
  return root; };
