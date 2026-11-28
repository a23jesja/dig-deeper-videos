// Roberts' bedtime: the rum pirate pours rum into his open mouth from arm's length (the reviewer's yes 28 Nov, condition b: a new technique,
// shown on its own sheet with a planted fault before the film uses it). His right hand holds the bottle up in front of his face; the bottle's
// neck points at his mouth; the stream runs unbroken from the neck to the open mouth, sagging a little, and lands inside the mouth, never on a
// cheek or the nose, never through his face or his hand. All in the skeleton's units (the card's own), shared by the sheet, the film and the check.
import { solve, POSES, type Pose } from "../rig";
import { D } from "../clips/clipKit";
import { kitMouth } from "../wardrobe/kit";

export type P2 = [number, number];
type Sk = ReturnType<typeof solve>;
const R = Math.PI / 180;
const nrm = (v: P2): P2 => { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; };
/** a point of the head's own frame in skeleton units, as the head draws it (the film's own copy of bodyGeom.headPt: film code never imports the checks) */
export const headPtR = (sk: Sk, p: P2): P2 => { const sn = Math.sin(sk.faceYaw * R), as = Math.abs(sn), view = as < 0.45 ? "front" : as < 0.85 ? "q" : "side", fx = view !== "front" && sn < 0 ? -p[0] : p[0];
  const c = Math.cos(sk.headTilt * R), s = Math.sin(sk.headTilt * R), o = sk.j.skull as unknown as P2; return [o[0] + fx * c - p[1] * s, o[1] + fx * s + p[1] * c]; };
/** the open mouth's middle and its half-width (skeleton units) for a mouth opening m (as the kit draws it) */
export const mouthMid = (sk: Sk, m: number): { c: P2; hw: number; hh: number } => { const sn = Math.sin(sk.faceYaw * R), as = Math.abs(sn), view = as < 0.45 ? "front" : as < 0.85 ? "q" : "side", km = kitMouth(view, m);
  const H = 61 * km.s * km.m0; return { c: headPtR(sk, [km.x, km.y + 0.45 * H]), hw: km.w * 0.8, hh: H * 0.45 }; };
/** the bottle's sizes (skeleton units): its body and its neck */
export const RUM = { body: 130, bodyW: 38, neck: 72, neckW: 14, sag: 16 };      // (one rum bottle for every shot, 1.5 times sheet v2's: the reviewer, 28 Nov, "a real rum bottle")
/** the bottle and the stream for a solved skeleton: the grip (the right hand's middle), the bottle's way u (from the grip toward the mouth), its
 *  body (b0-b1), its neck's tip n, and the stream's three points (neck tip, a sag, the mouth's middle); off: the planted fault, the stream's end
 *  moved that many skeleton units aside (out past the mouth's corner) */
export const pour = (sk: Sk, m: number, off = 0) => {
  const sd = Math.sign(((sk.j.wrR as unknown as P2)[1]) - ((sk.j.wrL as unknown as P2)[1])) < 0 ? "R" : "L", W = sk.j[`wr${sd}`] as unknown as P2, T = sk.j[`tip${sd}`] as unknown as P2, g: P2 = [W[0] + 0.45 * (T[0] - W[0]), W[1] + 0.45 * (T[1] - W[1])], mm = mouthMid(sk, m);
  const u = nrm([mm.c[0] - g[0], mm.c[1] - g[1]]), b0: P2 = [g[0] - u[0] * RUM.body * 0.45, g[1] - u[1] * RUM.body * 0.45], b1: P2 = [g[0] + u[0] * RUM.body * 0.55, g[1] + u[1] * RUM.body * 0.55];
  const n: P2 = [b1[0] + u[0] * RUM.neck, b1[1] + u[1] * RUM.neck], end: P2 = [mm.c[0] + off, mm.c[1]];
  const mid: P2 = [(n[0] + end[0]) / 2, (n[1] + end[1]) / 2 + RUM.sag];
  const stream = Array.from({ length: 25 }, (_, i) => { const t = i / 24, a = (1 - t) * (1 - t), b = 2 * t * (1 - t), c = t * t; return [a * n[0] + b * mid[0] + c * end[0], a * n[1] + b * mid[1] + c * end[1]] as P2; });
  return { g, u, b0, b1, n, stream, mouth: mm, side: sd as "L" | "R" }; };
/** the arm that pours: the one whose shoulder is on the side his face turns to (so the bottle stays beside his face, never across it) */
export const pourSide = (heading: number): "L" | "R" => { const sk = solve(D.props("sir"), POSES.stand as Pose, heading), nk = sk.j.neck as unknown as P2, f = Math.sign(Math.sin(sk.faceYaw * R) || 1) * (SWIG_BACK ? -1 : 1);
  return Math.sign((sk.j.shR as unknown as P2)[0] - nk[0]) === f ? "R" : "L"; };
/** the pouring pose: his head tipped back (the chin up), the arm on his face's side raised so the hand holds the bottle beside his face, outside
 *  his head's outline, over and in front of his mouth; its two angles found by search within rule 16's bend (the hand as near that place as it reaches) */
export const pourPose = (heading: number): Pose => {
  const base: Pose = { ...POSES.stand, head: [Math.sign(heading || 1) * 45 - heading, -14, 0] } as Pose, side = pourSide(heading), key = side === "R" ? "armR" : "armL";
  let best: { arm: [[number, number], [number, number]]; cost: number } | null = null;
  for (let s1 = 20; s1 <= 170; s1 += 10) for (let o1 = -20; o1 <= 80; o1 += 10) for (let s2 = 20; s2 <= 150; s2 += 10) {
    const arm: [[number, number], [number, number]] = [[s1, o1], [s2, 0]], sk = solve(D.props("sir"), { ...base, [key]: arm } as Pose, heading);
    const S = sk.j[`sh${side}`] as unknown as P2, E = sk.j[`el${side}`] as unknown as P2, Wr = sk.j[`wr${side}`] as unknown as P2, m = mouthMid(sk, 0.9), f = Math.sign(Math.sin(sk.faceYaw * R) || 1);
    const u1 = [S[0] - E[0], S[1] - E[1]], u2 = [Wr[0] - E[0], Wr[1] - E[1]], bend = 180 - (Math.acos(Math.max(-1, Math.min(1, (u1[0] * u2[0] + u1[1] * u2[1]) / ((Math.hypot(u1[0], u1[1]) || 1) * (Math.hypot(u2[0], u2[1]) || 1))))) * 180) / Math.PI;
    if (bend > 140) continue;
    const want: P2 = [m.c[0] + f * 250, m.c[1] - 170], d = Math.hypot(Wr[0] - want[0], Wr[1] - want[1]);
    if (!best || d < best.cost) best = { arm, cost: d }; }
  return { ...base, [key]: best!.arm } as Pose; };

// ---- the swig (proposed 28 Nov when the stream would not read): the bottle's neck at his mouth's front corner, its body and his hand beside his
// face, outside his head's outline, never over an eye, the nose or the cheek above his mouth ----
/** the mouth's front corner (the one toward his nose, the bottle's side) in skeleton units */
export const mouthCorner = (sk: Sk, m: number, back = SWIG_BACK): P2 => { const sn = Math.sin(sk.faceYaw * R), as = Math.abs(sn), view = as < 0.45 ? "front" : as < 0.85 ? "q" : "side", km = kitMouth(view, m);
  return headPtR(sk, [back ? km.x - km.w : km.x + km.w, km.y]); };
/** the swig at the mouth's back corner (away from the nose), with the arm on the head's far side: at the front corner the bottle crossed the nose */
export let SWIG_BACK = false;
export const setSwigBack = (b: boolean) => { SWIG_BACK = b; };
/** the head's outline (A's ellipse) in skeleton units */
export const headOutline = (sk: Sk): P2[] => Array.from({ length: 48 }, (_, i) => headPtR(sk, [126 * Math.cos((i / 48) * 2 * Math.PI), -128 + 132 * Math.sin((i / 48) * 2 * Math.PI)]));
const inPoly = (p: P2, P: P2[]) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) if ((P[i][1] > p[1]) !== (P[j][1] > p[1]) && p[0] < ((P[j][0] - P[i][0]) * (p[1] - P[i][1])) / (P[j][1] - P[i][1]) + P[i][0]) c = !c; return c; };
/** grip to the neck's tip (skeleton units): the body's front half and the neck */
export const SWIG_L = RUM.body * 0.55 + RUM.neck;
/** the bottle in his hand at a swig: grip g, way u (toward the mouth's corner), body b0-b1, neck tip n; plant: "eye" the bottle swung over his eye,
 *  "far" its neck 30 skeleton units short of the mouth */
export const swig = (sk: Sk, m: number, side: "L" | "R", plant: "" | "eye" | "far" = "") => {
  const W = sk.j[`wr${side}`] as unknown as P2, T = sk.j[`tip${side}`] as unknown as P2, g: P2 = [W[0] + 0.45 * (T[0] - W[0]), W[1] + 0.45 * (T[1] - W[1])];
  let tgt = mouthCorner(sk, m); if (plant === "eye") tgt = headPtR(sk, [40, -118]);
  const u = nrm([tgt[0] - g[0], tgt[1] - g[1]]), L = SWIG_L - (plant === "far" ? 30 : 0);
  const b0: P2 = [g[0] - u[0] * RUM.body * 0.45, g[1] - u[1] * RUM.body * 0.45], b1: P2 = [g[0] + u[0] * RUM.body * 0.55, g[1] + u[1] * RUM.body * 0.55], n: P2 = [g[0] + u[0] * L, g[1] + u[1] * L];
  return { g, u, b0, b1, n, corner: mouthCorner(sk, m), side }; };
/** the swig's pose: the arm on his face's side, its angles found by search so the grip lies the bottle's length from his mouth's corner with the
 *  bottle's body and the hand outside his head's outline (rule 16's bend at most 140), his head tipped back a little */
export const swigPose = (heading: number, m = 0.6, nod = -16): Pose => {
  const base: Pose = { ...POSES.stand, head: [Math.sign(heading || 1) * 45 - heading, nod, 0] } as Pose, side = pourSide(heading), key = side === "R" ? "armR" : "armL";
  let best: { arm: [[number, number], [number, number]]; cost: number } | null = null;
  for (let s1 = 0; s1 <= 180; s1 += 10) for (let o1 = -20; o1 <= 80; o1 += 10) for (let s2 = 0; s2 <= 150; s2 += 10) {
    const arm: [[number, number], [number, number]] = [[s1, o1], [s2, 0]], sk = solve(D.props("sir"), { ...base, [key]: arm } as Pose, heading);
    const S = sk.j[`sh${side}`] as unknown as P2, E = sk.j[`el${side}`] as unknown as P2, Wr = sk.j[`wr${side}`] as unknown as P2;
    const u1 = [S[0] - E[0], S[1] - E[1]], u2 = [Wr[0] - E[0], Wr[1] - E[1]], bend = 180 - (Math.acos(Math.max(-1, Math.min(1, (u1[0] * u2[0] + u1[1] * u2[1]) / ((Math.hypot(u1[0], u1[1]) || 1) * (Math.hypot(u2[0], u2[1]) || 1))))) * 180) / Math.PI;
    if (bend > 140) continue;
    const b = swig(sk, m, side), head = headOutline(sk), Tp = sk.j[`tip${side}`] as unknown as P2, inside = [0, 0.25, 0.5, 0.75, 1, 1.15].map((t): P2 => [b.b0[0] + (b.b1[0] - b.b0[0]) * t, b.b0[1] + (b.b1[1] - b.b0[1]) * t]).concat([b.g, Wr, Tp]).filter((q) => inPoly(q, head)).length;
    // (it reads as drinking only with the bottle's bottom over its neck, at least 20 degrees (the reviewer): the way from the grip to the neck downward)
    const tilt = b.u[1], under = Math.max(0, Math.sin(20 * R) - tilt);
    const cost = Math.abs(Math.hypot(b.corner[0] - b.g[0], b.corner[1] - b.g[1]) - SWIG_L) + 60 * inside + 2000 * under;
    if (!best || cost < best.cost) best = { arm, cost }; }
  return { ...base, [key]: best!.arm } as Pose; };
