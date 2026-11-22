// The shot-type clips of the flat 2D look (A Knopp, frozen 21 Nov 2026): what every clip shares. A clip is a model (who stands where, in
// which pose, at each time, and what things are in the picture) and a drawing (FlatClip.tsx). The model gives the checks what they read
// (scripts/flat_check.mjs <clip> and scripts/flat_views.mjs <clip>). The figure play is the motion test's (flatMotionModel.ts), with the
// rig fixes of its v5: the hip width taken off planted feet, every face with its pupil, blinks without half lids, no blink in fright.
import { solve, Pose, Sk, Seg } from "../rig";
import { FigOpts, Face, Who } from "../designs/common";
import type { HandKind } from "../ink";
import { FLAT } from "../designs/flat";
import { mover, type MM } from "../stage/acting";
import { play } from "../stage/film";

/** the picture: 1080 x 1920 at 30 fps, the ground line 12 px thick centred on GY, 620 px to the metre (the camera that holds the figures) */
export const FM = { W: 1080, H: 1920, FPS: 30, GY: 1500, LINE: 12, PPM: 620, HM: 1.0 };
export const D = FLAT[0];
export const MODE = { v3: false };
export { shoeDrawn, FLAT_SPECS } from "../designs/flat";
import { FLAT_SPECS } from "../designs/flat";
export { drawnHandKind } from "../ink";
export const hipLL = (who: Who) => { const P = D.props(who); return P.hipW / (P.thigh + P.shin); };
const tallOf = (who: Who) => { const P = D.props(who); return P.thigh + P.shin + P.ankle + P.spine + P.neck + P.head; };
/** heights in metres: Sir 1.0, Ada 0.92 of him */
export const heightOf = (who: Who) => (who === "sir" ? FM.HM : FM.HM * 0.92);
/** pixels per design unit for a figure */
export const scaleOf = (who: Who) => (FM.PPM * heightOf(who)) / tallOf(who);
/** where a figure's soles stand: the shoe's outline with its ink rests on the ground line's top edge */
export const footY = (who: Who) => (MODE.v3 ? FM.GY : FM.GY - FM.LINE / 2 - 0.85 * D.ol * scaleOf(who));
/** a point in metres along the ground (x) and up (y) to picture pixels */
export const px = (xm: number) => FM.W / 2 + xm * FM.PPM;

export type HS = [number, HandKind][];
export const handAt = (hs: HS, t: number) => { let k = hs[0][1]; for (const [t0, v] of hs) if (t >= t0) k = v; return k; };
export type Fig = { name: string; who: Who; x: number; sk: Sk; o: FigOpts };
export type Mouth = { t0: number; len: number; mouth: number[] };
export type Cast = { name: string; m: MM; who: Who; hands?: { L: HS; R: HS }; mouth?: Mouth; seed?: number;
  /** a change to the pose after the play (a hand put on a handle, a thing held), the last word on the arms */
  pose?: (t: number, p: Pose, heading: number) => Pose };

/** a figure on the ground at x metres, heading in degrees (90 = toward the picture's right, 0 = toward the lens, -90 = left) */
export const figure = (who: Who, x: number, heading: number, stagger = 0): MM => { const m = mover(D, heightOf(who), x, 0, heading); m.w = hipLL(who); m.stance(stagger); return m; };

/** the cast at time t: where each stands in the picture (x in pixels), the solved skeleton and the drawing options */
/** a cast member's own pose at t, before its pose hook (for a hook that needs the pose at a set time) */
export const poseAt = (c: Cast, t: number): { pose: Pose; heading: number } => {
  const a = play(c.name, D, c.m, t, [0, 0, 0], heightOf(c.who), { blink: true, seed: c.seed ?? (c.who === "sir" ? 3 : 7), extra: { who: c.who } });
  const fix = (l: Pose["legL"]) => (l && (l as { th?: unknown }).th === undefined ? { ...l, x: ((l as { x?: number }).x ?? 0) - hipLL(c.who) } : l);
  return { pose: { ...a.pose, legL: fix(a.pose.legL), legR: fix(a.pose.legR) } as Pose, heading: a.heading };
};
export const castAt = (cast: Cast[], t: number): Fig[] => cast.map((c) => {
  const a = play(c.name, D, c.m, t, [0, 0, 0], heightOf(c.who), { blink: true, seed: c.seed ?? (c.who === "sir" ? 3 : 7), extra: { who: c.who } });
  // blinks open, half, shut, half, open (motion.ts BLINK, each step two frames); the half lid at 0.42, so the pupil still shows under it
  // (shut and open with nothing between jumped, the review of the shot types v1; a half lid at 0.5 had covered the pupil, the review of
  // the motion test v4); never in fright
  const f0 = { pupil: 1, ...a.o.face }, lid0 = f0.lid ?? 0.16, f1 = lid0 > 0.3 ? { ...f0, lid: lid0 > 0.75 ? 1 : 0.42 } : f0;
  let face: Face = (f1.wide ?? 0) > 0.5 ? { ...f1, lid: 0 } : f1;
  if (c.mouth) { const f = Math.round(t * FM.FPS); if (f >= 0 && f < c.mouth.mouth.length && c.mouth.mouth[f] > 0) face = { ...face, mouth: c.mouth.mouth[f] }; }
  const fix = (l: Pose["legL"]) => (l && (l as { th?: unknown }).th === undefined ? { ...l, x: ((l as { x?: number }).x ?? 0) - hipLL(c.who) } : l);
  let pose = { ...a.pose, legL: fix(a.pose.legL), legR: fix(a.pose.legR) } as Pose;
  if (c.pose) pose = c.pose(t, pose, a.heading);
  return { name: c.name, who: c.who, x: px(a.at[0]), sk: solve(D.props(c.who), pose, a.heading), o: { ...a.o, ...(c.hands ? { handL: handAt(c.hands.L, t), handR: handAt(c.hands.R, t) } : {}), face } };
});

/** a joint of a figure in picture pixels */
export const jointPx = (g: Fig, j: string): [number, number] => { const q = g.sk.j[j as keyof Sk["j"]] as unknown as number[], s = scaleOf(g.who); return [g.x + q[0] * s, footY(g.who) + q[1] * s]; };

/** an arm put so that its wrist reaches a point in the picture (a handle, a box's side): the upper arm's and forearm's swing found by a
 *  search on the solved skeleton (the rig has no arm IK). side is the arm; the pose's other values stay */
/** o.bend: the elbow bent at least this many degrees in the picture (a point that shows its elbow); o.elbowBelow: the elbow never above the
 *  wrist (a hand holding a thing at the waist: an elbow lifted out put the sleeve up over the thing's corner, the review of v2) */
/** o.mid: the hand's middle (not the wrist) on the target, a fist gripping a handle; o.elbowOut: the elbow at least this x far out (a sign
 *  gives the side: +x right of it, -x left), so the forearm shows beside a held thing; the search is pulled a little toward the pose's own
 *  arm, so it does not flip between two near-equal answers from frame to frame (the arm's shape snapped and back, the review of v3) */
export const reach = (who: Who, x: number, pose: Pose, heading: number, side: "L" | "R", target: [number, number], tip = false, o: { bend?: number; elbowBelow?: boolean; mid?: boolean; elbowOut?: number; elbowDown?: boolean; swingMin?: number; abdMax?: number; abdFix?: number } = {}): Pose => {
  const key = side === "L" ? "armL" : "armR", s = scaleOf(who), P = D.props(who);
  type A = [Seg, Seg];
  const at = (arm: A) => { const sk = solve(P, { ...pose, [key]: arm } as Pose, heading), W = sk.j[`wr${side}` as keyof Sk["j"]] as unknown as number[], T = sk.j[`tip${side}` as keyof Sk["j"]] as unknown as number[];
    const q = o.mid ? [W[0] + 0.45 * (T[0] - W[0]), W[1] + 0.45 * (T[1] - W[1])] : tip ? T : W; return [x + q[0] * s, footY(who) + q[1] * s]; };
  // (several starts, the best kept: from the pose's own arm alone the search could stick on the wrong side and the wrist jumped 90 px)
  const joints = (arm: A) => { const sk = solve(P, { ...pose, [key]: arm } as Pose, heading), J2 = (n: string) => { const q = sk.j[n as keyof Sk["j"]] as unknown as number[]; return [x + q[0] * s, footY(who) + q[1] * s]; }; return { sh: J2(`sh${side}`), el: J2(`el${side}`), wr: J2(`wr${side}`) }; };
  const own0 = ((pose[key] ?? [[4, 13], [16, 9]]) as A);
  const err = (a: A) => { let e = Math.hypot(...at(a).map((v, i) => v - target[i])) + 0.12 * (Math.abs(a[0][0] - own0[0][0]) + Math.abs(a[0][1] - own0[0][1]) + Math.abs(a[1][0] - own0[1][0]));
    if (o.elbowOut !== undefined) { const j = joints(a), need = Math.abs(o.elbowOut), out = o.elbowOut > 0 ? j.el[0] - need : need - j.el[0]; if (out < 0) e += -out * 2; }
    // (elbowDown: the elbow under the line from the shoulder to the target; the arm's two answers mirror each other about that line, and
    //  this keeps the low one, which can always be reached)
    if (o.elbowDown) { const j = joints(a), dx = target[0] - j.sh[0], dy = target[1] - j.sh[1], l = Math.hypot(dx, dy) || 1, side = ((j.el[0] - j.sh[0]) * dy - (j.el[1] - j.sh[1]) * dx) / l, down = dx >= 0 ? -side : side; if (down < 40) e += (40 - down) * 0.6; }
    if (o.bend || o.elbowBelow) { const j = joints(a);
      if (o.bend) { const u = [j.el[0] - j.sh[0], j.el[1] - j.sh[1]], v = [j.wr[0] - j.el[0], j.wr[1] - j.el[1]], ang = (Math.acos(Math.max(-1, Math.min(1, (u[0] * v[0] + u[1] * v[1]) / (Math.hypot(...u) * Math.hypot(...v) || 1)))) * 180) / Math.PI; if (ang < o.bend) e += (o.bend - ang) * 1.5; }
      if (o.elbowBelow && j.el[1] < j.wr[1] + 4) e += (j.wr[1] + 4 - j.el[1]) * 2; }
    return e; };
  const own = ((pose[key] ?? [[4, 13], [16, 9]]) as A).map((g) => [...g]) as A;
  // (the search descends from every start and keeps the best end, measured with the whole error, conditions and pull included: descending
  //  on the distance alone from the best-looking start, two equally good arms won in turn from frame to frame and the arm snapped, v3)
  const clampSeed = (a: A): A => [[Math.max(o.swingMin ?? -999, a[0][0]), o.abdFix ?? (o.abdMax !== undefined ? Math.max(-o.abdMax, Math.min(o.abdMax, a[0][1])) : a[0][1])], a[1]] as A;
  const seeds = [own, [[own[0][0] + 40, own[0][1]], [30, own[1][1]]], [[own[0][0] - 40, own[0][1]], [30, own[1][1]]], [[60, own[0][1]], [20, own[1][1]]]].map((a) => clampSeed(a.map((g) => [...g]) as A));
  const descend = (start: A): [A, number] => { let a = start, best = err(a);
    for (const step of [16, 8, 4, 2, 1, 0.5]) for (let it = 0; it < 30; it++) { let moved = false;
      for (const [i, k] of [[0, 0], [1, 0], [0, 1]] as [number, number][]) for (const d of [step, -step]) {
        const c = a.map((g) => [...g]) as A; c[i][k] += d; if (i === 1 && k === 0 && (c[1][0] < 4 || c[1][0] > 150)) continue;      // (the elbow bends one way, never locked)
        if (o.swingMin !== undefined && i === 0 && k === 0 && c[0][0] < o.swingMin) continue;
        if (o.abdMax !== undefined && i === 0 && k === 1 && Math.abs(c[0][1]) > o.abdMax) continue;      // (in profile, the upper arm out to the side only a little)
        if (o.abdFix !== undefined && i === 0 && k === 1) continue;      // (abdFix: the arm in the picture's plane, two links with an elbow that bends one way: one answer)      // (reaching forward the upper arm swings forward: its elbow went behind the shoulder, v3)
        const e = err(c); if (e < best - 1e-6) { best = e; a = c; moved = true; } }
      if (!moved) break; }
    return [a, best]; };
  const arm = seeds.map(descend).reduce((b, r) => (r[1] < b[1] - 1e-6 ? r : b))[0];
  return { ...pose, [key]: arm } as Pose;
};

export type Seat = { x0: number; x1: number; top: number };
/** points: the thing's outermost points (a crab's claw tips), which no hand may touch */
export type Appear = { name: string; t0: number; from: "left" | "right" | "hole"; at: (t: number) => [number, number] | null; hole?: { x: number; drawnFrom: number }; points?: (t: number) => [number, number][];
  /** its feet on the picture, for the check that a foot standing on the ground does not slide */ feet?: (t: number) => [number, number][] };
/** horizon: the target lies on the horizon at this height (far in depth however near in the picture) */
/** box: the target's extent [x0, y0, x1, y1]; arm: the arm's whole move [up, down], over which the hand keeps clear of the box (sky between) */
export type Point = { who: string; t0: number; t1: number; side: "L" | "R"; target: [number, number]; horizon?: number; box?: [number, number, number, number]; arm?: [number, number] };
/** a hand that must be at a place from t0 to t1 (a handle, a box's side, a knee): its wrist within tol px */
export type Contact = { who: string; side: "L" | "R"; t0: number; t1: number; at: (t: number) => [number, number]; tol: number; what: string; mid?: boolean };
/** the camera: the world point at the picture's middle and the zoom (the world is 1080 x 1920 at zoom 1). Shot types (the review of the
 *  shot types v1: at zoom 1 Sir was too small for the shot to read on a phone): "medium" about 2.7, the figure filling most of the height;
 *  "full" about 1.7, the whole figure filling at least half the height */
export type Cam = { cx: number; cy: number; z: number };
export const camFor = (z: number, cx: number, top: number): Cam => ({ cx, cy: top + FM.H / (2 * z), z });
export const viewOf = (c: Cam) => ({ x0: c.cx - FM.W / (2 * c.z), x1: c.cx + FM.W / (2 * c.z), y0: c.cy - FM.H / (2 * c.z), y1: c.cy + FM.H / (2 * c.z) });
export type Solid = { name: string; x0: number; x1: number; top: number };
/** the points that bound a figure as drawn: its head with the cap and ears (and the pipe in profile), its hands, elbows and feet */
/** the underside of a figure's thighs as drawn, in picture pixels: each thigh's lower edge, its half-width going from the hip's to the
 *  knee's (flat.ts B.leg, half-widths), and the trousers' seat behind the hips (drawn when seated). For a seat: the crate's top goes here.
 *  (the half-width was taken as half of B.leg[0], 13.5 for 27: the thighs lay 15 px into the crate's front, the review of v4) */
export const thighUnder = (g: Fig, n = 11): [number, number][] => { const s = scaleOf(g.who), L = (g.who === "sir" ? FLAT_SPECS[0].sir : FLAT_SPECS[0].other).B.leg;
  const out = (["L", "R"] as const).flatMap((d) => { const h = jointPx(g, `hip${d}`), k = jointPx(g, `kn${d}`), dx = k[0] - h[0], dy = k[1] - h[1], l = Math.hypot(dx, dy) || 1;
    let nx = -dy / l, ny = dx / l; if (ny < 0) { nx = -nx; ny = -ny; }
    return Array.from({ length: n }, (_, i) => { const u = i / (n - 1), w = (L[0] + (L[1] - L[0]) * u) * s; return [h[0] + dx * u + nx * w, h[1] + dy * u + ny * w] as [number, number]; }); });
  const pel = jointPx(g, "pelvis"); return [...out, [pel[0], pel[1] + (L[0] * 0.98 - 2) * s]]; };
export const figBox = (g: Fig): [number, number][] => { const s = scaleOf(g.who), J2 = (n: string, dx = 0, dy = 0): [number, number] => { const q = g.sk.j[n as keyof Sk["j"]] as unknown as number[]; return [g.x + (q[0] + dx) * s, footY(g.who) + (q[1] + dy) * s]; };
  return [J2("skull", -168, 0), J2("skull", 168, 0), J2("crown", 0, -64), J2("crown", -150, -40), J2("crown", 150, -40),
    ...(["L", "R"] as const).flatMap((d) => [J2(`tip${d}`, -32, -32), J2(`tip${d}`, 32, 32), J2(`wr${d}`, -30, -30), J2(`wr${d}`, 30, 30), J2(`el${d}`, -26, 0), J2(`el${d}`, 26, 0), J2(`toe${d}`, -24, 4), J2(`toe${d}`, 24, 4), J2(`heel${d}`, -24, 4), J2(`heel${d}`, 24, 4)])]; };
/** a camera that holds every figure whole, hands and cap included, in every frame (but those where offFrameOK), and the extra points, with a
 *  margin of 4 % of the picture each side; zoom at most zMax. The review of v2: a medium shot too tight cut hands, caps and heads */
export const fitCam = (cast: Cast[], seconds: number, zMax: number, extra: [number, number][] = [], skip: (t: number) => boolean = () => false, margin = 0.04): Cam => {
  const pts: [number, number][] = [...extra]; for (let f = 0; f < Math.round(seconds * FM.FPS); f += 2) { const t = f / FM.FPS; if (skip(t)) continue; for (const g of castAt(cast, t)) pts.push(...figBox(g)); }
  const x0 = Math.min(...pts.map((p) => p[0])), x1 = Math.max(...pts.map((p) => p[0])), y0 = Math.min(...pts.map((p) => p[1])), y1 = Math.max(...pts.map((p) => p[1]));
  const z = Math.min(zMax, (FM.W * (1 - 2 * margin)) / (x1 - x0), (FM.H * (1 - 2 * margin)) / (y1 - y0));
  return { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, z }; };
/** what a clip hands to the checks and the drawing */
export type Clip = { id: string; title: string; seconds: number; cast: Cast[]; events: Record<string, number>; audio?: string;
  back?: (g: CanvasRenderingContext2D, t: number) => void; front?: (g: CanvasRenderingContext2D, t: number, figs: Fig[]) => void;
  /** after each figure is drawn (a held thing, a thumb over it) */
  over?: (g: CanvasRenderingContext2D, t: number, f: Fig) => void;
  seats?: Seat[]; appear?: Appear[]; points?: Point[]; contacts?: Contact[]; bg?: number; bgOpts?: { spade?: boolean; pit?: boolean };
  camera: (t: number) => Cam; shot: "medium" | "full"; solids?: Solid[]; door?: { h: number };
  /** things standing on the figures' own ground line (a crate, a bollard): no shoe may overlap them, or which is in front cannot be read */
  groundProps?: { name: string; x0: number; x1: number }[];
  /** a clip that draws its own background (bg -1) */
  ownBg?: (g: CanvasRenderingContext2D, t: number) => void;
  /** a figure that may stand past the picture's edge at time t (walking in or out) */
  offFrameOK?: (name: string, t: number) => boolean; running?: (name: string, t: number) => boolean };
