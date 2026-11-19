// What the design directions share: the frame of the torso, limbs drawn on the skeleton's joints, shoes that work from every side,
// the order the parts are drawn in, and the options of a figure. Each direction (one file each) is a skin on the same skeleton.
import { Ink, P2, add, sub, unit, len, seg, spline, ellPts, angle, lerp, clamp, HandKind, hand, shade } from "../ink";
import { Sk, Side, Props, Joint } from "../rig";

export type Who = "sir" | "baker";
/** what the face does: where the eyes look, how far the lids are down, eyes opened wide (0..1), brows up (+) or down (-), mouth open (0..1) */
export type Face = { gaze?: P2; lid?: number; wide?: number; brow?: number; mouth?: number; /** corners of the mouth up (+) or down (-) */ smile?: number;
  /** one eye shut: the eye on the left (-1) or the right (1) of the picture (the eye pressed to a spyglass, a wink); it is blended
   *  like the rest of the face, and the eye is shut once it is past half way */ shut?: number };
/** sway = how far loose things (the hem of a coat or skirt, the cap, the chain) trail behind the way the figure faces, -1..1 */
export type FigOpts = { who?: Who; face?: Face; handL?: HandKind; handR?: HandKind; prop?: "cane" | "loaf" | null; capLift?: number; sway?: number;
  /** the hat is not on the head (it flew off in a fall and is drawn by the scene where it lies) */
  hatOff?: boolean };
/** faceW = half the width that must show in a close-up of the face (moustache tips included) */
export type Design = { id: string; name: string; ol: number; faceW?: number; props: (who: Who) => Props; draw: (k: Ink, sk: Sk, o: FigOpts) => void;
  /** the closed fingers of the named hands by themselves (the layer that lies in front of a thing held) */
  fingers?: (k: Ink, sk: Sk, sides: ("L" | "R")[], whole?: Partial<Record<"L" | "R", HandKind>>) => void;
  /** the figure's hat by itself (lying or flying), its middle at the origin, seen from the angle phi */
  hat?: (k: Ink, phiDeg: number) => void;
  /** the garment's torso rows [height above the pelvis, half-width, depth in front, depth behind] (design units), for the body check:
   *  a robe or a coat tail is drawn hanging along the spine down to its hem, sitting too */
  garment?: number[][] };
export const LIGHT: P2 = [0.8, 0.45]; // which way the shadow lies on a part (the light comes from the upper left)

/** the torso's own frame: Q(l, d, a) = a point l to the figure's left, d in front of the spine and a above the pelvis along the spine */
export const frame = (sk: Sk) => {
  const o = sk.j.pelvis, s = unit(sub(sk.j.neck, o)), n: P2 = [-s[1], s[0]];
  const T = (l: number, a: number): P2 => [o[0] + n[0] * l + s[0] * a, o[1] + n[1] * l + s[1] * a];
  return { T, Q: (l: number, d: number, a: number) => T(l * sk.cos + d * sk.sin, a), tilt: Math.atan2(s[0], -s[1]) / (Math.PI / 180), o, s, n };
};
/** the outline of a torso from rows [height above the pelvis, half-width seen from the front, depth in front of the spine, depth behind] */
export const torsoPts = (sk: Sk, rows: number[][], smooth = true): P2[] => {
  const { T } = frame(sk), c = Math.abs(sk.cos), s = Math.abs(sk.sin), f = sk.sin >= 0;
  const right = rows.map(([a, w, df, db]) => T(Math.hypot(w * c, (f ? df : db) * s), a)), left = rows.map(([a, w, df, db]) => T(-Math.hypot(w * c, (f ? db : df) * s), a)).reverse();
  return smooth ? spline([...right, ...left], true, 5) : [...right, ...left];
};
export const J = (sk: Sk, name: string, side: Side) => sk.j[(name + side) as Joint];
/** a limb in three pieces: root to joint, the joint, joint to end. w = half-widths at root, joint and end */
export const limb = (a: P2, b: P2, c: P2, w: number[], bulge: number[] = [0, 0], flat = false): P2[][] =>
  flat ? [seg(a, b, w[0], w[1], bulge[0], 0.4, true), seg(b, c, w[1], w[2], bulge[1], 0.3, true), ellPts(b[0], b[1], w[1] * 0.98, w[1] * 0.98, 0, 0, 360, 8)]
    : [seg(a, b, w[0], w[1], bulge[0], 0.4), seg(b, c, w[1], w[2], bulge[1], 0.3)];
/** should the thumb be flipped so that it points the way the figure faces and in toward the body */
export const thumbFlip = (sk: Sk, side: Side) => sk.sin * 0.9 + (side === "R" ? sk.cos : -sk.cos) * 0.5 > 0;
/** the hand of one side at its wrist, along the skeleton's hand bone */
export const handAt = (k: Ink, sk: Sk, side: Side, kind: HandKind, col: string, cut = false, scale = 1) => {
  const w = J(sk, "wr", side), t = J(sk, "tip", side), el = J(sk, "el", side), d = len(sub(t, w)) > 6 ? angle(w, t) : angle(el, w);
  hand(k, w, d, sk.P.hand * scale, kind, col, thumbFlip(sk, side), cut);
};

/** a shoe from any side: side-on it is a shoe in profile, toward the lens a rounded toe cap; it follows the heel and toe of the skeleton.
 *  returns the outline (for extra marks); hA / hT = height at the ankle and over the toes, as fractions of the foot length */
export const shoePts = (sk: Sk, side: Side, W: number, hA = 0.36, hT = 0.2, cut = false): { pts: P2[]; O: P2; ex: P2; up: P2; span: number } => {
  const h = J(sk, "heel", side), t = J(sk, "toe", side), L = sk.P.foot, e = sub(t, h), kk = clamp(len(e) / L, 0, 1), dirx = e[0] >= 0 ? 1 : -1;
  const ex: P2 = kk > 0.25 ? unit(e) : [dirx, 0], up: P2 = ex[0] >= 0 ? [ex[1], -ex[0]] : [-ex[1], ex[0]], pad = (W * (1 - kk)) / 2, span = len(e) + 2 * pad;
  const O = add(h, ex, -pad), prof: [number, number][] = [[0, 0.3], [0.03, 0.75], [0.1, 1], [0.44, 1], [0.6, 0.72], [0.8, hT / hA], [0.95, (hT / hA) * 0.8], [1, 0.3]];
  const top = prof.map(([u, hh]) => { const sy = lerp(Math.sin(Math.PI * clamp(u, 0.04, 0.96)) ** 0.6, hh, kk); return add(add(O, ex, u * span), up, sy * hA * L); });
  const pts = [O, ...top, add(O, ex, span)];
  return { pts: cut ? pts : [O, ...spline(top, false, 4), add(O, ex, span)], O, ex, up, span };
};
/** a leather shoe with a sole and a heel */
export const shoe = (k: Ink, sk: Sk, side: Side, col: string, W: number, o: { hA?: number; hT?: number; cut?: boolean; sole?: string; cap?: boolean } = {}) => {
  const s = shoePts(sk, side, W, o.hA, o.hT, o.cut), L = sk.P.foot;
  k.shape(s.pts, col);
  k.shadeEdge(s.pts, shade(col, 0.72), 9, 5);
  if (o.cap !== false) { const c = add(add(s.O, s.ex, s.span * 0.74), s.up, L * 0.02); k.line([add(c, s.up, L * 0.2), add(add(c, s.ex, -s.span * 0.05), s.up, L * 0.1), c], k.ol * 0.4); }
  k.line([add(s.O, s.up, 1), add(add(s.O, s.ex, s.span), s.up, 1)], k.ol * 1.1, o.sole ?? k.ink, "butt");
  k.shape(s.pts, null);
};
/** a sandal: the bare foot, a sole and two straps */
export const sandal = (k: Ink, sk: Sk, side: Side, skin: string, strap: string, W: number, cut = false) => {
  const s = shoePts(sk, side, W, 0.3, 0.15, cut);
  k.shape(s.pts, skin);
  for (const u of [0.3, 0.62]) k.line([add(add(s.O, s.ex, s.span * u), s.up, 2), add(add(s.O, s.ex, s.span * (u + 0.06)), s.up, sk.P.foot * (u < 0.5 ? 0.3 : 0.2))], k.ol * 0.9, strap, "butt");
  k.line([add(s.O, s.up, 1), add(add(s.O, s.ex, s.span), s.up, 1)], k.ol * 1.2, strap, "butt");
  k.shape(s.pts, null);
};

/** the order of the parts: far limbs, torso, head, near limbs; an arm reaching toward the lens in a front view is drawn last */
export const layers = (sk: Sk, L: { arm: (s: Side) => void; leg: (s: Side) => void; torso: () => void; head: () => void; tail?: () => void }) => {
  const { near, far } = sk;
  if (Math.abs(sk.sin) > 0.5) { L.arm(far); L.tail?.(); L.leg(far); L.leg(near); L.torso(); L.head(); L.arm(near); return; }
  const late = (s: Side) => sk.z[`wr${s}`] - sk.z[`sh${s}`] > sk.P.upper * 0.6;
  L.tail?.(); L.leg(far); L.leg(near); L.torso();
  for (const s of [far, near]) if (!late(s)) L.arm(s);
  L.head();
  for (const s of [far, near]) if (late(s)) L.arm(s);
};
/** how the head art is placed: side art when the face is turned more than about 45 degrees from the lens, mirrored when it faces screen-left */
export const headPose = (sk: Sk) => {
  const s = Math.sin(sk.faceYaw * (Math.PI / 180)), c = Math.cos(sk.faceYaw * (Math.PI / 180));
  return { side: Math.abs(s) > 0.7, flip: s < 0, turn: s, back: c < -0.3 };
};
/** a head-local point on the picture (for the chain, which leaves the head and ends on the coat) */
export const headToWorld = (sk: Sk, flip: boolean) => (p: P2): P2 => {
  const a = sk.headTilt * (Math.PI / 180), x = flip ? -p[0] : p[0], b = sk.j.skull;
  return [b[0] + x * Math.cos(a) - p[1] * Math.sin(a), b[1] + x * Math.sin(a) + p[1] * Math.cos(a)];
};
/** a round Roman loaf scored in eight (panis quadratus), held in a hand */
export const loaf = (k: Ink, c: P2, r: number, cut = false) => {
  const pts = ellPts(c[0], c[1], r, r * 0.78, 0, 0, 360, cut ? 10 : 36);
  k.shape(pts, "#d9a55a"); k.shadeEdge(pts, "#b47a3a", r * 0.3, r * 0.22);
  for (let i = 0; i < 4; i++) { const a = (i * 45 + 10) * (Math.PI / 180); k.line([[c[0] - Math.cos(a) * r * 0.8, c[1] - Math.sin(a) * r * 0.6], [c[0] + Math.cos(a) * r * 0.8, c[1] + Math.sin(a) * r * 0.6]], k.ol * 0.45, "#7a4d22"); }
  k.shape(pts, null);
};
/** a walking cane from the hand: tip = where it ends */
export const cane = (k: Ink, grip: P2, tip: P2, w = 9, col = "#3a2618") => {
  const u = unit(sub(grip, tip)), top = add(grip, u, 34), n: P2 = [-u[1], u[0]];
  k.line([tip, top, add(add(top, u, 16), n, 26), add(add(top, u, 2), n, 46)], w + k.ol * 1.2); k.line([tip, top, add(add(top, u, 16), n, 26), add(add(top, u, 2), n, 46)], w, col);
  k.line([tip, add(tip, u, 18)], w, "#c9a94a", "butt");
};
