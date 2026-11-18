// The great cabin of a pirate ship (Blackbeard's, in the Short about his fuses): a low room of dark planks under heavy beams, three
// stern windows with the sea behind them, a table with a lantern and a chart, a stool, a sea chest, and a mirror on the side wall.
// Built round its own origin: the floor at y = 0, the windows in the back wall at z = -d/2, the room open toward +z where the lens
// stands. The deck overhead lies on the walls and the beams hang under it; it casts no shadow, so that the daylight of the world still
// falls in from above. (Blackbeard v4: without it, the sky and a sail showed over the back wall wherever the lens looked a little up.)
// `cabinSea` puts it beside the two ships of flagSea, far enough off that neither ship shows through its windows.
import * as THREE from "three";
import { mesh, group, box, cyl, ball } from "./kit";
import { C, table, stool, chest } from "./props";
import { flagSea } from "./ship";
import type { V3 } from "../stage/film";

export const CABIN = { w: 4.4, d: 3.4, h: 2.3, win: [-1.25, 0, 1.25], winW: 0.72, winH: 0.78, winY: 0.98,
  /** where the cabin stands in the world (its floor's middle) */ at: [42, 0.6, 0] as V3,
  /** in the cabin's own terms: the table's middle, the lantern's flame, the stool, the mirror's glass */
  table: [0.6, 0, -0.95] as V3, flame: [0.9, 0.96, -1.1] as V3, stool: [-0.45, 0, -0.12] as V3, mirror: [-2.08, 1.52, -0.45] as V3 };
/** a point given in the cabin's own terms, in the world */
export const inCabin = (p: V3): V3 => [CABIN.at[0] + p[0], CABIN.at[1] + p[1], CABIN.at[2] + p[2]];

export const cabin = () => {
  const { w, d, h, win, winW, winH, winY } = CABIN, g = new THREE.Group(), wood = "#6a4428", woodD = "#4a2e1c", t = 0.12, z0 = -d / 2;
  // the floor of broad planks
  g.add(mesh(box(w, 0.1, d), "#8a5a36", { at: [0, -0.05, 0] }));
  for (let x = -w / 2 + 0.24; x < w / 2; x += 0.24) g.add(mesh(box(0.014, 0.004, d), "#6a4428", { at: [x, 0.002, 0], line: 0, shadow: false }));
  // the back wall, built of pieces round the three stern windows, each with its frame and a cross of bars
  g.add(mesh(box(w, winY, t), wood, { at: [0, winY / 2, z0] }), mesh(box(w, h - winY - winH, t), wood, { at: [0, winY + winH + (h - winY - winH) / 2, z0] }));
  const edges = [-w / 2, ...win.flatMap((x) => [x - winW / 2, x + winW / 2]), w / 2];
  for (let i = 0; i < edges.length; i += 2) if (edges[i + 1] - edges[i] > 0.01) g.add(mesh(box(edges[i + 1] - edges[i], winH, t), wood, { at: [(edges[i] + edges[i + 1]) / 2, winY + winH / 2, z0] }));
  for (const x of win) {
    for (const s of [-1, 1]) g.add(mesh(box(0.06, winH + 0.1, t + 0.04), woodD, { at: [x + (s * winW) / 2, winY + winH / 2, z0], line: 0.5 }));
    for (const y of [winY - 0.03, winY + winH + 0.03]) g.add(mesh(box(winW + 0.12, 0.06, t + 0.04), woodD, { at: [x, y, z0], line: 0.5 }));
    g.add(mesh(box(0.03, winH, 0.03), woodD, { at: [x, winY + winH / 2, z0], line: 0.3, shadow: false }), mesh(box(winW, 0.03, 0.03), woodD, { at: [x, winY + winH / 2, z0], line: 0.3, shadow: false }));
  }
  // a bench seat under the windows
  g.add(mesh(box(w - 0.3, 0.08, 0.42), woodD, { at: [0, 0.46, z0 + 0.27] }), mesh(box(w - 0.3, 0.42, 0.06), woodD, { at: [0, 0.21, z0 + 0.46], line: 0.5 }));
  // the side walls, panelled, and the beams overhead
  for (const s of [-1, 1]) { g.add(mesh(box(t, h, d), wood, { at: [(s * w) / 2, h / 2, 0] })); for (let z = -d / 2 + 0.55; z < d / 2; z += 0.8) g.add(mesh(box(0.02, h - 0.3, 0.05), woodD, { at: [s * (w / 2 - 0.07), h / 2, z], line: 0.3, shadow: false })); }
  for (let z = -d / 2 + 0.35; z < d / 2; z += 0.78) g.add(mesh(box(w, 0.17, 0.2), woodD, { at: [0, h, z], line: 0.5 }));
  // the deck overhead, its underside level with the tops of the walls, a little wider and deeper than the room so that no seam shows
  g.add(mesh(box(w + t, 0.08, d + t), "#5a3a22", { at: [0, h + 0.04, -t / 2], line: 0.4, shadow: false }));
  for (let x = -w / 2 + 0.3; x < w / 2; x += 0.3) g.add(mesh(box(0.012, 0.004, d), woodD, { at: [x, h - 0.002, 0], line: 0, shadow: false, receive: false }));
  // the mirror on the left wall, its glass toward +x
  g.add(group([mesh(box(0.06, 0.66, 0.5), C.gold, { line: 0.6 }), mesh(box(0.066, 0.56, 0.4), "#cfe3ee", { line: 0.3, shadow: false }), mesh(box(0.068, 0.5, 0.06), "#eef6fa", { at: [0, 0.04, -0.08], rot: [0.5, 0, 0], line: 0, shadow: false })], [CABIN.mirror[0] + 0.02, CABIN.mirror[1], CABIN.mirror[2]]));
  // the table with a chart, a bottle and the lantern
  const tb = table(1.3, 0.8, 0.76); tb.position.set(...CABIN.table); g.add(tb);
  g.add(mesh(box(0.6, 0.006, 0.42), "#efe2bc", { at: [CABIN.table[0] - 0.2, 0.765, CABIN.table[2] + 0.05], rot: [0, 0.2, 0], line: 0.4, shadow: false }));
  g.add(mesh(cyl(0.035, 0.045, 0.22, 10), "#3f6a3a", { at: [CABIN.table[0] - 0.45, 0.87, CABIN.table[2] - 0.15], line: 0.5 }));
  const [fx, fy, fz] = CABIN.flame;
  g.add(mesh(box(0.16, 0.02, 0.16), "#2b2a33", { at: [fx, 0.77, fz], line: 0.5 }), mesh(box(0.14, 0.2, 0.14), "#ffe7a8", { at: [fx, 0.88, fz], line: 0.6, shadow: false }), mesh(box(0.17, 0.03, 0.17), "#2b2a33", { at: [fx, 0.99, fz], line: 0.5 }),
    mesh(cyl(0.012, 0.012, 0.05, 8), "#fbf3df", { at: [fx, fy - 0.08, fz], line: 0, shadow: false }), mesh(ball(0.02, 8), "#ffb040", { at: [fx, fy - 0.04, fz], line: 0, shadow: false }));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(mesh(box(0.012, 0.2, 0.012), "#2b2a33", { at: [fx + sx * 0.07, 0.88, fz + sz * 0.07], line: 0, shadow: false }));
  const st = stool(); st.position.set(...CABIN.stool); g.add(st);
  const ch = chest(false, false, 0.7, 0.42, 0.44); ch.position.set(1.65, 0, -1.15); ch.rotation.y = -0.35; g.add(ch);
  return g;
};
/** flagSea with the cabin beside it */
export const cabinSea = () => { const root = flagSea(), c = cabin(); c.position.set(...CABIN.at); root.add(c); return root; };
