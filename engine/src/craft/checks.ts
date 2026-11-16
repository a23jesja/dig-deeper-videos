// Checks on the staging of the cast that every film must pass (DAILY-RULES "Staging checks"), computed from the skeletons themselves,
// before anything is rendered. A film hands in what stands where on every frame; `check` answers with what is wrong.
//   1. The monocle shows in every side view, to the left as well as to the right.
//   2. No turn without a view in between: a figure never jumps from the side to the front in one frame.
//   3. Two figures never share the same place: at most a quarter of a figure is hidden by another, and never its face.
// Run for a clip: node scripts/craft_check.mjs <name>      (the clips are listed in src/craft/cueList.ts)
import { Sk, Joint } from "./rig";
import { Look, monocleShows } from "./cast";

/** one figure on one frame: its solved skeleton, where its soles stand on the picture, its scale, and its place in the drawing order */
export type Fig = { name: string; look: Look; sk: Sk; x: number; y: number; sc: number; order: number };
export type Frame = { t: number; figs: Fig[] };
type P2 = [number, number];
const BONES: [Joint, Joint, (L: Look) => number][] = [
  ["pelvis", "neck", (L) => L.rows[Math.min(3, L.rows.length - 1)][1] * 0.82], ["skull", "crown", (L) => L.head.a * 0.95],
  ["shL", "elL", (L) => L.arm[0]], ["elL", "wrL", (L) => L.arm[1]], ["shR", "elR", (L) => L.arm[0]], ["elR", "wrR", (L) => L.arm[1]],
  ["hipL", "knL", (L) => L.leg[0]], ["knL", "anL", (L) => L.leg[1]], ["hipR", "knR", (L) => L.leg[0]], ["knR", "anR", (L) => L.leg[1]],
];
const at = (f: Fig, j: Joint): P2 => [f.x + f.sk.j[j][0] * f.sc, f.y + f.sk.j[j][1] * f.sc];
const distSeg = (p: P2, a: P2, b: P2) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = dx * dx + dy * dy || 1, u = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l)); return Math.hypot(p[0] - a[0] - dx * u, p[1] - a[1] - dy * u); };
const inside = (p: P2, f: Fig) => BONES.some(([a, b, r]) => distSeg(p, at(f, a), at(f, b)) < r(f.look) * f.sc);
/** how much of figure b lies under figure a (0..1), over its whole body and over its head alone */
export const hidden = (a: Fig, b: Fig) => {
  let tot = 0, hid = 0, htot = 0, hhid = 0;
  BONES.forEach(([j0, j1, r], n) => {
    const p0 = at(b, j0), p1 = at(b, j1), rr = r(b.look) * b.sc;
    for (let i = 0; i <= 6; i++) for (const off of [-0.6, 0, 0.6]) {
      const u = i / 6, dx = p1[0] - p0[0], dy = p1[1] - p0[1], l = Math.hypot(dx, dy) || 1, p: P2 = [p0[0] + dx * u - (dy / l) * rr * off, p0[1] + dy * u + (dx / l) * rr * off], w = rr, h = inside(p, a);
      tot += w; if (h) hid += w; if (n === 1) { htot += w; if (h) hhid += w; }
    }
  });
  return { body: hid / tot, head: hhid / htot };
};
export const check = (frames: Frame[], fps = 30): string[] => {
  const out: string[] = [], seen = new Set<string>(), say = (key: string, text: string) => { if (!seen.has(key)) { seen.add(key); out.push(text); } };
  frames.forEach((fr, n) => {
    for (const f of fr.figs) {
      const side = Math.abs(f.sk.sin) > 0.8;
      if (side && !monocleShows(f.look, f.sk.yaw)) say(`mono:${f.name}:${Math.floor(fr.t)}`, `${fr.t.toFixed(2)} s: ${f.name} is seen from the side (${Math.round(f.sk.yaw)} deg) and the monocle does not show`);
      const prev = n ? frames[n - 1].figs.find((q) => q.name === f.name) : undefined;
      if (prev) { let d = Math.abs(f.sk.yaw - prev.sk.yaw) % 360; if (d > 180) d = 360 - d; if (d > 22.5 * (30 / fps)) say(`turn:${f.name}:${Math.floor(fr.t * 2)}`, `${fr.t.toFixed(2)} s: ${f.name} turns ${Math.round(d)} deg in one frame (no view in between)`); }
    }
    for (const a of fr.figs) for (const b of fr.figs) {
      if (a === b || a.order <= b.order) continue;
      const h = hidden(a, b);
      if (h.head > 0.2) say(`face:${a.name}:${b.name}:${Math.floor(fr.t * 2)}`, `${fr.t.toFixed(2)} s: ${a.name} covers the face of ${b.name} (${Math.round(h.head * 100)} %)`);
      else if (h.body > 0.25) say(`body:${a.name}:${b.name}:${Math.floor(fr.t * 2)}`, `${fr.t.toFixed(2)} s: ${a.name} hides ${Math.round(h.body * 100)} % of ${b.name} (at most 25 %)`);
    }
  });
  return out;
};
