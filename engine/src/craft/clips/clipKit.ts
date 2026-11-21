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
export const figure = (who: Who, x: number, heading: number): MM => { const m = mover(D, heightOf(who), x, 0, heading); m.w = hipLL(who); return m; };

/** the cast at time t: where each stands in the picture (x in pixels), the solved skeleton and the drawing options */
export const castAt = (cast: Cast[], t: number): Fig[] => cast.map((c) => {
  const a = play(c.name, D, c.m, t, [0, 0, 0], heightOf(c.who), { blink: true, seed: c.seed ?? (c.who === "sir" ? 3 : 7), extra: { who: c.who } });
  // blinks open, shut, open with no half lid (a half lid covered the pupil); never in fright
  const f0 = { pupil: 1, ...a.o.face }, lid0 = f0.lid ?? 0.16, f1 = lid0 > 0.3 ? { ...f0, lid: lid0 > 0.55 ? 1 : 0.16 } : f0;
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
export const reach = (who: Who, x: number, pose: Pose, heading: number, side: "L" | "R", target: [number, number], tip = false): Pose => {
  const key = side === "L" ? "armL" : "armR", s = scaleOf(who), P = D.props(who);
  type A = [Seg, Seg];
  const at = (arm: A) => { const sk = solve(P, { ...pose, [key]: arm } as Pose, heading), q = sk.j[`${tip ? "tip" : "wr"}${side}` as keyof Sk["j"]] as unknown as number[]; return [x + q[0] * s, footY(who) + q[1] * s]; };
  // (several starts, the best kept: from the pose's own arm alone the search could stick on the wrong side and the wrist jumped 90 px)
  const err = (a: A) => Math.hypot(...at(a).map((v, i) => v - target[i]));
  const own = ((pose[key] ?? [[4, 13], [16, 9]]) as A).map((g) => [...g]) as A;
  let arm = [own, [[own[0][0] + 40, own[0][1]], [30, own[1][1]]], [[own[0][0] - 40, own[0][1]], [30, own[1][1]]], [[60, own[0][1]], [20, own[1][1]]]].map((a) => a.map((g) => [...g]) as A).reduce((b, a) => (err(a) < err(b) ? a : b)), best = err(arm);
  for (const step of [16, 8, 4, 2, 1, 0.5]) for (let it = 0; it < 30; it++) { let moved = false;
    for (const [i, k] of [[0, 0], [1, 0], [0, 1]] as [number, number][]) for (const d of [step, -step]) {
      const c = arm.map((g) => [...g]) as A; c[i][k] += d; if (i === 1 && k === 0 && (c[1][0] < 4 || c[1][0] > 150)) continue;      // (the elbow bends one way, never locked)
      const e = Math.hypot(...at(c).map((v, j) => v - target[j])); if (e < best - 1e-6) { best = e; arm = c; moved = true; } }
    if (!moved) break; }
  return { ...pose, [key]: arm } as Pose;
};

export type Seat = { x0: number; x1: number; top: number };
export type Appear = { name: string; t0: number; from: "left" | "right" | "hole"; at: (t: number) => [number, number] | null; hole?: { x: number; drawnFrom: number } };
export type Point = { who: string; t0: number; t1: number; side: "L" | "R"; target: [number, number] };
/** a hand that must be at a place from t0 to t1 (a handle, a box's side, a knee): its wrist within tol px */
export type Contact = { who: string; side: "L" | "R"; t0: number; t1: number; at: (t: number) => [number, number]; tol: number; what: string };
/** what a clip hands to the checks and the drawing */
export type Clip = { id: string; title: string; seconds: number; cast: Cast[]; events: Record<string, number>; audio?: string;
  back?: (g: CanvasRenderingContext2D, t: number) => void; front?: (g: CanvasRenderingContext2D, t: number, figs: Fig[]) => void;
  /** after each figure is drawn (a held thing, a thumb over it) */
  over?: (g: CanvasRenderingContext2D, t: number, f: Fig) => void;
  seats?: Seat[]; appear?: Appear[]; points?: Point[]; contacts?: Contact[]; bg?: number;
  /** a figure that may stand past the picture's edge at time t (walking in or out) */
  offFrameOK?: (name: string, t: number) => boolean; running?: (name: string, t: number) => boolean };
