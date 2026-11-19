// The arena: the inside of a great amphitheatre about AD 80, built from the world kit. An oval of raked sand, the painted wall round it
// (the podium) with a marble rail on top where the front row stands, stone tiers rising behind, a high back wall with masts and
// pennants, the gate the gladiators come and go by (at +x) and the sponsor's box with its red awning (at +z). The crowd on the tiers is
// put in by a shot's things with `crowd` (small cached cards that cheer). Shared set: every Short in the arena uses it.
import * as THREE from "three";
import { mesh, group, box, cyl, ball, paint, sunRig, skyDome } from "./kit";
import { crowdCard } from "./people";
import type { Design, FigOpts } from "../designs/common";
import type { Pose } from "../rig";
import type { Cam, V3 } from "../stage/film";

/** the sand's half lengths (A along x, B along z), the wall's height, the front row's depth, each tier's rise and depth */
export const ARENA = { A: 17, B: 11, wall: 2.4, first: 1.4, step: 0.44, deep: 0.82, tiers: 8, rail: 0.85 };
/** a point `out` metres outward from the wall's face at the angle th (radians, 0 = +x, PI/2 = +z) */
export const rim = (th: number, out = 0): [number, number] => [(ARENA.A + out) * Math.cos(th), (ARENA.B + out) * Math.sin(th)];
/** how high the top of tier n stands (n = 0 is the front row on the podium) */
export const tierTop = (n: number) => (n === 0 ? ARENA.wall : ARENA.wall + 0.25 + n * ARENA.step);
/** where a spectator stands on tier n at the angle th, facing the middle of the sand */
export const seat = (th: number, n: number): { at: V3; heading: number } => {
  const out = n === 0 ? 0.78 : ARENA.first + (n - 0.5) * ARENA.deep, [x, z] = rim(th, out);
  return { at: [x, tierTop(n), z], heading: (Math.atan2(-x, -z) * 180) / Math.PI };
};
/** the heading of someone at (x, z) on the sand who faces the point (tx, tz) */
export const facingTo = (x: number, z: number, tx: number, tz: number) => (Math.atan2(tx - x, tz - z) * 180) / Math.PI;

const sand = () => paint("arenasand", 512, 512, (g, r) => {
  g.fillStyle = "#ead09a"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 1400; i++) { g.fillStyle = r() < 0.5 ? "rgba(176,140,84,0.32)" : "rgba(255,246,222,0.5)"; g.fillRect(r() * 512, r() * 512, 2 + r() * 3, 2 + r() * 3); }
  g.strokeStyle = "rgba(170,132,80,0.28)"; g.lineWidth = 3; for (let y = 20; y < 512; y += 38) { g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= 512; x += 32) g.lineTo(x, y + Math.sin(x * 0.05 + y) * 5); g.stroke(); }
}, [9, 6]);
const wallPaint = () => paint("arenawall", 256, 128, (g) => {
  g.fillStyle = "#b8432f"; g.fillRect(0, 0, 256, 128); g.fillStyle = "#f3e6c8"; g.fillRect(0, 0, 256, 14); g.fillRect(0, 112, 256, 16);
  g.strokeStyle = "#f3e6c8"; g.lineWidth = 6; g.strokeRect(24, 30, 208, 70); g.fillStyle = "#3f7a4a"; g.fillRect(0, 14, 256, 8);
  g.fillStyle = "#f6c52e"; for (const x of [60, 128, 196]) { g.beginPath(); g.arc(x, 65, 9, 0, 7); g.fill(); }
});
const backPaint = () => paint("arenaback", 256, 256, (g) => {
  g.fillStyle = "#d9cdb4"; g.fillRect(0, 0, 256, 256); g.fillStyle = "#4a3a30";
  for (const x of [38, 148]) { g.beginPath(); g.moveTo(x, 230); g.lineTo(x, 110); g.arc(x + 35, 110, 35, Math.PI, 0); g.lineTo(x + 70, 230); g.closePath(); g.fill(); }
  g.strokeStyle = "#b8a888"; g.lineWidth = 6; g.beginPath(); g.moveTo(0, 60); g.lineTo(256, 60); g.stroke();
});

export const arenaWorld = () => {
  const root = new THREE.Group(), A = ARENA, N = 64, wallT = wallPaint(), backT = backPaint();
  root.add(skyDome("#2f86e0", "#a9dcff", "#e8f6ff"));
  const rig = sunRig({ from: [-9, 16, 7], power: 1.5, fill: 1.8, bounce: 0.85, reach: 14 }, [0, 0, 0]); root.add(rig); root.userData.rig = rig;
  root.add(mesh(box(400, 0.2, 400), "#c9b48a", { at: [0, -0.11, 0], line: 0, shadow: false }));
  { const s = mesh(new THREE.CircleGeometry(1, 96), "#ffffff", { map: sand(), line: 0 }); s.rotation.x = -Math.PI / 2; s.scale.set(A.A + 0.3, A.B + 0.3, 1); s.position.y = 0.005; root.add(s); }
  /** a block between the angles th0 and th1, from `out` outward `w` deep, `h` high from `y0` */
  const block = (th0: number, th1: number, out: number, w: number, h: number, y0: number, col: string, o: { map?: THREE.Texture; line?: number } = {}) => {
    const p0 = rim(th0, out + w / 2), p1 = rim(th1, out + w / 2), len = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) * 1.03;
    root.add(mesh(box(len, h, w), col, { at: [(p0[0] + p1[0]) / 2, y0 + h / 2, (p0[1] + p1[1]) / 2], rot: [0, -Math.atan2(p1[1] - p0[1], p1[0] - p0[0]), 0], map: o.map, line: o.line ?? 0.6 }));
  };
  const gate = (th: number) => Math.abs(Math.atan2(Math.sin(th), Math.cos(th))) < 0.075;
  for (let i = 0; i < N; i++) {
    const th0 = (2 * Math.PI * i) / N, th1 = (2 * Math.PI * (i + 1)) / N, mid = (th0 + th1) / 2;
    // the podium wall, painted, with a marble coping; the gate's gap at +x
    if (!gate(mid)) block(th0, th1, 0, 0.5, A.wall, 0, "#ffffff", { map: wallT });
    block(th0, th1, -0.08, 0.66, 0.16, A.wall, "#efe8d8");
    // the front row's floor and its marble rail
    block(th0, th1, 0.5, A.first - 0.5, A.wall, 0, "#cfc2a6", { line: 0 }); block(th0, th1, 0.08, 0.16, A.rail, A.wall, "#f3eee2", { line: 0.5 });
    // the tiers, each a step higher and further out, in two stones that take turns
    for (let n = 1; n <= A.tiers; n++) block(th0, th1, A.first + (n - 1) * A.deep, A.deep, tierTop(n), 0, n % 2 ? "#d9cdb4" : "#cbbd9e", { line: 0.4 });
    // the back wall, high above the top tier, with its arches
    const out = A.first + A.tiers * A.deep, top = tierTop(A.tiers);
    block(th0, th1, out, 0.6, top + 3.4, 0, "#ffffff", { map: backT, line: 0.6 });
    // masts for the awning on top of the back wall, each with a pennant
    if (i % 4 === 0) { const [x, z] = rim(th0, out + 0.3); root.add(mesh(cyl(0.07, 0.09, 4.2, 8), "#7a5a36", { at: [x, top + 3.4 + 2.1, z], line: 0.5 }));
      root.add(mesh(box(0.9, 0.42, 0.04), i % 8 ? "#d8342c" : "#f6c52e", { at: [x, top + 3.4 + 3.8, z], rot: [0, -th0 + Math.PI / 2, 0], line: 0.5 })); }
  }
  // the gate: two piers, a lintel and the dark way in
  { const [x, z] = rim(0, 0.25); root.add(mesh(box(0.5, 2.2, 3.6), "#2a2220", { at: [x + 0.3, 1.1, z], line: 0 }));
    for (const s of [-1, 1]) root.add(mesh(box(0.7, A.wall, 0.6), "#e2d6bc", { at: [x, A.wall / 2, z + s * 2.0], line: 0.7 }));
    root.add(mesh(box(0.7, 0.36, 4.6), "#e2d6bc", { at: [x, A.wall - 0.1, z], line: 0.7 })); }
  // the sponsor's box at +z: a raised floor with four columns and a red awning
  { const [x, z] = rim(Math.PI / 2, 0.9); const box_ = group([mesh(box(4.2, 0.2, 1.8), "#efe8d8", { at: [0, A.wall + 0.6, 0] }), mesh(box(4.6, 0.12, 2.2), "#c8402f", { at: [0, A.wall + 3.3, 0], line: 0.7 })]);
    for (const dx of [-1.9, 1.9]) for (const dz of [-0.75, 0.75]) box_.add(mesh(cyl(0.1, 0.12, 2.7, 10), "#f3eee2", { at: [dx, A.wall + 2.0, dz], line: 0.6 }));
    for (let k = 0; k < 9; k++) box_.add(mesh(box(0.5, 0.36, 0.06), k % 2 ? "#f6c52e" : "#c8402f", { at: [-2.05 + k * 0.51, A.wall + 3.06, -1.1], line: 0.4 }));
    box_.position.set(x, 0, z); box_.rotation.y = Math.PI; root.add(box_); }
  // the gladiators' school (the ludus) out beyond the arena: a sand yard with a colonnade round three sides, the arched wall behind
  // it, a wooden post to practise on, a stone bench and the doctor's table under an awning
  { const { x, z } = LUDUS, yard = mesh(box(13, 0.06, 10), "#e2c48e", { at: [x, 0.0, z], line: 0 }); root.add(yard);
    root.add(mesh(box(13, 3.2, 0.4), "#ffffff", { at: [x, 1.6, z + 5], map: backT, line: 0.6 }));
    for (const sx of [-1, 1]) root.add(mesh(box(0.4, 3.2, 10), "#ffffff", { at: [x + sx * 6.5, 1.6, z], map: backT, line: 0.6 }));
    for (let i = 0; i < 7; i++) root.add(mesh(cyl(0.13, 0.15, 2.6, 10), "#efe8d8", { at: [x - 5.4 + i * 1.8, 1.3, z + 3.9], line: 0.6 }));
    root.add(mesh(box(13, 0.3, 1.6), "#cfc2a6", { at: [x, 2.7, z + 4.2], line: 0.6 }));
    const [px, pz] = LUDUS_POST; root.add(mesh(cyl(0.11, 0.13, 1.8, 10), "#8a6a44", { at: [px, 0.9, pz], line: 0.6 }));
    const [tx, tz] = LUDUS_TABLE; root.add(mesh(box(4.6, 0.1, 2.2), "#d8342c", { at: [tx, 2.55, tz + 0.4], line: 0.6 }));
    for (const dx of [-2.1, 2.1]) root.add(mesh(cyl(0.06, 0.07, 2.5, 8), "#7a5a36", { at: [tx + dx, 1.25, tz - 0.6], line: 0.5 })); }
  return root;
};
/** the ludus beside the arena (its yard's middle), the practice post and where the doctor's table stands under its awning */
export const LUDUS = { x: 0, z: 48 }, LUDUS_POST: [number, number] = [LUDUS.x - 3.2, LUDUS.z - 0.6], LUDUS_TABLE: [number, number] = [LUDUS.x + 3.6, LUDUS.z + 2.2];

// ---------------- the crowd ----------------
export type Fan = { D: Design; at: V3; heading: number; h: number; seed: number };
const hash = (n: number) => { const s = Math.sin(n * 12.9898 + 4.1) * 43758.5453; return s - Math.floor(s); };
/** spectators along tiers `rows` between the angles th0 and th1 (radians), about `gap` metres apart, their looks taken in turn from `looks` */
export const fans = (looks: Design[], th0: number, th1: number, rows: number[], seed = 1, gap = 0.66): Fan[] => {
  const out: Fan[] = [];
  for (const n of rows) { const r = n === 0 ? 0.78 : ARENA.first + (n - 0.5) * ARENA.deep, len = Math.abs(th1 - th0) * ((ARENA.A + ARENA.B) / 2 + r), k = Math.max(1, Math.round(len / gap));
    for (let i = 0; i < k; i++) { const sd = seed * 977 + n * 131 + i * 7, th = th0 + ((th1 - th0) * (i + 0.5 + (hash(sd) - 0.5) * 0.5)) / k, s = seat(th, n);
      out.push({ D: looks[Math.floor(hash(sd + 3) * looks.length)], at: s.at, heading: s.heading + (hash(sd + 5) - 0.5) * 30, h: 1.56 + hash(sd + 9) * 0.3, seed: sd }); } }
  return out;
};
const POSES: Record<string, Pose> = {
  stand: { armL: [[12, 14], [22, 8]], armR: [[12, 14], [22, 8]] } as Pose,
  cheer: { armL: [[158, 30], [176, 18]], armR: [[158, 30], [176, 18]], head: [0, 8, 0] } as Pose,
  fist: { armR: [[154, 18], [174, 8]], armL: [[14, 14], [26, 8]] } as Pose,
  // (the elbows low and the hands meeting before the chest: with the upper arms swung far forward the hands went toward the lens and the
  // card drew them over the body as a fist across the chest, the spectator behind Sir; gladiators v5)
  clap: { armL: [[22, 8], [70, -45]], armR: [[22, 8], [70, -45]] } as Pose,
};
const OPTS: Record<string, FigOpts> = {
  stand: { handL: "relaxed", handR: "relaxed", face: { brow: 0.4, mouth: 0.2 } } as FigOpts,
  cheer: { handL: "open", handR: "open", face: { brow: 0.8, mouth: 0.8, wide: 0.4 } } as FigOpts,
  fist: { handL: "relaxed", handR: "fist", face: { brow: -0.4, mouth: 0.7 } } as FigOpts,
  clap: { handL: "open", handR: "open", face: { brow: 0.6, mouth: 0.5, smile: 0.5 } } as FigOpts,
};
/** The crowd at the time T: each spectator changes between standing, cheering with both arms up, shaking a fist and clapping, each at
 *  his own pace, and bobs while he cheers. `excite` (0..1) = how many are on their feet with their arms up */
export const crowd = (into: THREE.Group, list: Fan[], T: number, cam: Cam, excite = 0.7) => {
  // only those the lens can see: in front of it and inside its width (a vertical picture: 9 wide to 16 high)
  const fx = cam.look[0] - cam.pos[0], fy = cam.look[1] - cam.pos[1], fz = cam.look[2] - cam.pos[2], fn = Math.hypot(fx, fy, fz) || 1, rx = -fz / Math.hypot(fx, fz), rz = fx / Math.hypot(fx, fz), half = Math.tan((cam.fov * Math.PI) / 360) * 0.5625 * 1.25 + 0.05;
  for (const f of list) {
    const dx = f.at[0] - cam.pos[0], dy = f.at[1] + 1 - cam.pos[1], dz = f.at[2] - cam.pos[2], ahead = (dx * fx + dy * fy + dz * fz) / fn; if (ahead < 0.3 || Math.abs(dx * rx + dz * rz) > ahead * half + 0.4) continue;
    const r = hash(f.seed + 11), period = 0.8 + r * 0.9, beat = Math.floor((T + r * 3) / period), q = hash(f.seed + beat * 17);
    const tag = q < excite * 0.6 ? "cheer" : q < excite * 0.85 ? "fist" : q < excite ? "clap" : "stand", bob = tag === "cheer" ? 0.035 * Math.abs(Math.sin(T * 8 + r * 6)) : 0;
    into.add(crowdCard(f.D, POSES[tag], OPTS[tag], tag, { at: [f.at[0], f.at[1] + bob, f.at[2]], heading: f.heading, h: f.h }, cam.pos));
  }
};
void ball;
