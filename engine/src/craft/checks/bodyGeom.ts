// The drawn figure's parts as polygons, for the checks that judge what a viewer sees of a body (DAILY-RULES "Hands and the body", the cloud
// session after the dinner v5 NO, 24 Nov): built from the frozen rig's own shape functions (limb, torsoPts, hand, the head's ellipse and the
// mouth's place as flat.ts draws them), never from guesses at its joints. Nothing here draws or changes the look; it only reads it.
//
//   armParts(sk, side, kind, B)  the arm as drawn: the sleeve (limb), the cuff and the hand (the real `hand` traced on a recording canvas)
//   occluders(sk, B, side)       what is drawn over that arm in the figure itself (side order, |sin| > 0.5: the far arm lies under the legs,
//                                the torso, the head with its cap and the near arm; from the front both arms are drawn over the body)
//   mouthPts(sk, face)           points filling the mouth with its lower lip as the head draws it (front, three-quarter or side; mirrored)
//   inPoly, grow                 point in polygon; a polygon grown by half the outline (the ink line around each filled part)
import { hand, seg, ellPts, type P2, type HandKind } from "../ink";
import { limb, torsoPts, handFlip, seated } from "../designs/common";
import type { Sk, Side } from "../rig";

export type Body = { rows: number[][]; arm: number[]; leg: number[] };
const R = Math.PI / 180;
const mid = (a: P2, b: P2, u: number): P2 => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
const J = (sk: Sk, n: string, s: Side) => sk.j[(n + s) as keyof Sk["j"]] as unknown as P2;

/** the polygons `hand` fills for one hand, in skeleton units: a canvas that only keeps the transform and records each filled group */
export const handPolys = (sk: Sk, side: Side, kind: HandKind, scale = 1): P2[][] => {
  const { flip, d, w } = handFlip(sk, side, kind), out: P2[][] = [];
  let M = [1, 0, 0, 1, 0, 0]; const stack: number[][] = [];
  const mul = (a: number, b: number, c: number, dd: number, e: number, f: number) => { const [A, B, C, D, E, F] = M; M = [A * a + C * b, B * a + D * b, A * c + C * dd, B * c + D * dd, A * e + C * f + E, B * e + D * f + F]; };
  const g = { save: () => stack.push([...M]), restore: () => { M = stack.pop() ?? [1, 0, 0, 1, 0, 0]; }, translate: (x: number, y: number) => mul(1, 0, 0, 1, x, y),
    rotate: (a: number) => mul(Math.cos(a), Math.sin(a), -Math.sin(a), Math.cos(a), 0, 0), scale: (x: number, y: number) => mul(x, 0, 0, y, 0, 0) };
  const k = { g, ol: 9, group: (pieces: P2[][]) => { for (const p of pieces) out.push(p.map(([x, y]) => [M[0] * x + M[2] * y + M[4], M[1] * x + M[3] * y + M[5]] as P2)); }, line: () => {}, shape: () => {} };
  hand(k as never, w, d, sk.P.hand * scale, kind, "#000", flip);
  return out;
};

/** the arm as drawn (flat.ts arm(): the cuff, the sleeve in two pieces, the hand) and, apart, its hand */
export const armParts = (sk: Sk, side: Side, kind: HandKind, B: Body) => {
  const S = J(sk, "sh", side), E = J(sk, "el", side), W = J(sk, "wr", side);
  const sleeve = [seg(mid(E, W, 0.8), mid(E, W, 1.04), B.arm[2] * 0.92, B.arm[2] * 0.92, 0, 0.3, true), ...limb(S, E, W, B.arm)], hnd = handPolys(sk, side, kind);
  return { sleeve, hand: hnd, all: [...sleeve, ...hnd], line: [S, E, W, J(sk, "tip", side)] as P2[] };
};

/** the torso's outline as flat.ts torso() makes it (the hem lifted for a sitter) */
export const torsoPoly = (sk: Sk, B: Body): P2[] => {
  const flexOf = (s: Side) => { const h = J(sk, "hip", s), kn = J(sk, "kn", s); return Math.abs(Math.atan2(Math.abs(kn[0] - h[0]), kn[1] - h[1])) * (180 / Math.PI); };
  const flex = Math.max(0, Math.min(1, (Math.max(flexOf("L"), flexOf("R")) - 35) / 45)), sit = seated(sk);
  const l0 = B.rows[0][0] + 30 * flex, rows = B.rows.map((q, i) => (i === 0 ? [l0 + sit * (30 - l0), q[1], q[2] - sit * 30, q[3]] : i === 1 ? [q[0] + sit * 44, q[1], q[2] - sit * 14, q[3]] : q));
  return torsoPts(sk, rows);
};

/** a point of the head's own frame (flat.ts head(): at the skull joint, turned by headTilt, mirrored when the face turns left) in skeleton units */
export const headPt = (sk: Sk, p: P2): P2 => { const sn = Math.sin(sk.faceYaw * R), as = Math.abs(sn), view = as < 0.45 ? "front" : as < 0.85 ? "q" : "side", fx = view !== "front" && sn < 0 ? -p[0] : p[0];
  const c = Math.cos(sk.headTilt * R), s = Math.sin(sk.headTilt * R), o = sk.j.skull as unknown as P2; return [o[0] + fx * c - p[1] * s, o[1] + fx * s + p[1] * c]; };
/** the head (A's ellipse, 126 x 132 about (0, -128)) and its cap (the side cap's box, -128 to 112 across and -312 to -206 up, with its brim) */
export const headPolys = (sk: Sk): P2[][] => [ellPts(0, -128, 126, 132, 0, 0, 360, 40).map((q) => headPt(sk, q)), [[-140, -206], [-128, -312], [112, -312], [150, -206]].map((q) => headPt(sk, q as P2))];

/** both legs as drawn (flat.ts leg(): the trouser limb; the shoe is left out) */
export const legPolys = (sk: Sk, B: Body): P2[][] => (["L", "R"] as Side[]).flatMap((s) => limb(J(sk, "hip", s), J(sk, "kn", s), J(sk, "an", s), B.leg));
/** what the figure itself draws over its arm `side` (see the head of this file) */
export const occluders = (sk: Sk, B: Body, side: Side, nearKind: HandKind): P2[][] => {
  if (Math.abs(sk.sin) <= 0.5 || side === sk.near) return [];
  return [...legPolys(sk, B), torsoPoly(sk, B), ...headPolys(sk), ...armParts(sk, sk.near, nearKind, B).all];
};

/** the mouth with its lower lip, filled with points (flat.ts mouthAt as each view places it; m = the face's mouth, smirk) */
export const mouthPts = (sk: Sk, face: { mouth?: number; smirk?: number } = {}): P2[] => {
  const m = face.mouth ?? 0, sm = face.smirk ?? 0, sn = Math.sin(sk.faceYaw * R), as = Math.abs(sn), view = as < 0.45 ? "front" : as < 0.85 ? "q" : "side";
  const [cx, y0, w, s, m0] = view === "q" ? [62 + sm * 4, -58 + 14 * (1 - Math.min(1, m / 0.5)), 18 * (1 + 0.4 * m), 0.8, Math.max(m, 0.2)]
    : view === "front" ? [sn * 34 + sm * 4, -52, 24 * (1 + 0.4 * m), 1, Math.max(m, 0.2)] : [92, -40, 14 * (1 + 0.4 * m), 0.9, Math.max(m, 0.16)];
  const H = 61 * s * m0, y1 = y0 + H + 7 * s + 9 * s, pts: P2[] = [];      // (to the lower lip's band under the open mouth)
  for (let i = 0; i <= 6; i++) for (let j = 0; j <= 4; j++) { const u = -1 + (2 * i) / 6, v = j / 4, half = Math.sqrt(Math.max(0, 1 - u * u)) * 0.5 + 0.5;
    pts.push(headPt(sk, [cx + u * w * half, y0 - 3 + (y1 - y0 + 3) * v])); }
  return pts;
};

export const inPoly = (pt: P2, P: P2[]) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) if ((P[i][1] > pt[1]) !== (P[j][1] > pt[1]) && pt[0] < ((P[j][0] - P[i][0]) * (pt[1] - P[i][1])) / (P[j][1] - P[i][1]) + P[i][0]) c = !c; return c; };
/** a polygon grown outward from its middle by d (the outline: half the ink line lies outside the fill) */
export const grow = (P: P2[], d: number): P2[] => { const c = P.reduce((a, q) => [a[0] + q[0] / P.length, a[1] + q[1] / P.length], [0, 0]);
  return P.map((q) => { const dx = q[0] - c[0], dy = q[1] - c[1], l = Math.hypot(dx, dy) || 1; return [q[0] + (dx / l) * d, q[1] + (dy / l) * d] as P2; }); };
/** points filling a list of polygons (a grid over their box, kept where inside one): the area a viewer could see */
export const fillPts = (polys: P2[][], step: number): P2[] => { const xs = polys.flat().map((q) => q[0]), ys = polys.flat().map((q) => q[1]), out: P2[] = [];
  for (let x = Math.min(...xs); x <= Math.max(...xs); x += step) for (let y = Math.min(...ys); y <= Math.max(...ys); y += step) if (polys.some((p) => inPoly([x, y], p))) out.push([x, y]);
  return out; };
