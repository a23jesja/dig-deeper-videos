// What the design directions share: the frame of the torso, limbs drawn on the skeleton's joints, shoes that work from every side,
// the order the parts are drawn in, and the options of a figure. Each direction (one file each) is a skin on the same skeleton.
import { Ink, P2, add, sub, unit, len, seg, spline, ellPts, angle, lerp, clamp, HandKind, hand, shade } from "../ink";
import { Sk, Side, Props, Joint } from "../rig";

export type Who = "sir" | "baker";
/** what the face does: where the eyes look, how far the lids are down, eyes opened wide (0..1), brows up (+) or down (-), mouth open (0..1) */
export type Face = { gaze?: P2; lid?: number; wide?: number; brow?: number; mouth?: number; /** corners of the mouth up (+) or down (-) */ smile?: number;
  /** one eye shut: the eye on the left (-1) or the right (1) of the picture (the eye pressed to a spyglass, a wink); it is blended
   *  like the rest of the face, and the eye is shut once it is past half way */ shut?: number;
  /** how large the pupils are (1 = as drawn): a big pupil is an eye used to the dark (the eye patch Short) */ pupil?: number; /** the new faces (Jesper 20 Nov, DAILY-RULES "Faces tell the joke"): squeeze 0..1 = eyes squeezed hard shut, drawn as chevrons pointing
   *  at the nose; tear 0..1 = a tear under the eye on the right of the picture; smirk -1..1 = one corner of the mouth up (+ the right of the
   *  picture); teeth 0..1 = clenched teeth shown in a grimace */ squeeze?: number; tear?: number; smirk?: number; teeth?: number;
  /** sad brows 0..1: the inner ends up and the outer ends down */ sad?: number };
/** sway = how far loose things (the hem of a coat or skirt, the cap, the chain) trail behind the way the figure faces, -1..1 */
/** a character's look on the flat rig (the guard, the inmates of Alcatraz): its colours, the cap's band, and what of Sir's it leaves out.
 *  Nothing set = Sir as he is (the approved shot types unchanged) */
export type Look = { col?: Record<string, string>; band?: string; badge?: string; mono?: boolean; pipe?: boolean; moustache?: boolean; brow?: string; brim?: number };
export type FigOpts = { look?: Look; who?: Who; face?: Face; handL?: HandKind; handR?: HandKind; prop?: "cane" | "loaf" | null; capLift?: number; sway?: number; /** false: no far-arm sweep between front and side (a figure that stands turned, not turning) */ armWipe?: boolean;
  /** the hat is not on the head (it flew off in a fall and is drawn by the scene where it lies) */
  hatOff?: boolean;
  /** false = no knee drape: seated, the garment below the waist hangs along the spine as it did before 20 Nov (the proof's planted fault) */
  drape?: boolean;
  /** false = the pipe as it was before 20 Nov: its stem dropping with the jaw into an open mouth (the proof's planted fault) */
  pipeHold?: boolean;
  /** proof cases only: a pipe drawn wrong on purpose ("gone" not drawn, "loose" its bowl beside the cheek with no stem, "fade" half see-through) */
  pipeFault?: "gone" | "loose" | "fade";
  /** true = the ears as they were drawn before 20 Nov: each ear behind the head or on top of it, switched in one frame as the head turns,
   *  so that the near ear hid and then showed whole from one frame to the next (the shot library's 03 frame 31; the proof's planted fault) */
  earPop?: boolean;
  /** true = the upper arm drawn over the forearm always, as before 20 Nov (the shot library's 06: the forearm raised before the chest hid
   *  behind the upper arm; the proof's planted fault) */
  foreUnder?: boolean;
  /** the forearm drawn over the upper arm (true) or under it, settled for the shot by the stage (film.ts castOf): a choice that would last
   *  under 15 frames keeps the one before it, so the order does not flip back and forth (the mate's elbow, eye patch v1s, 8.5 s) */
  foreTopFix?: { L: boolean; R: boolean };
  /** each arm drawn after the head (from behind: before the torso) or not, settled for the shot by the stage (film.ts castOf): it changes only
   *  on a frame where the arm is clear of the head (cast.ts armOrder; the review of v1t: the shoulder cap jumped over the beard) */
  armFix?: { L: boolean; R: boolean };
  /** an eye patch over one eye: "A" the figure's right eye, "B" his left (the pirate's patch, moved to the other eye between shots) */
  patch?: "A" | "B";
  /** proof cases only: "off" draws the patch beside the eye instead of over it */
  patchFault?: "off";
  /** the figure drawn as its mirror image or not, fixed for the whole shot (film.ts castOf): turning across the angle where the mirror
   *  changes, the head was redrawn the other way round between two frames */
  mirror?: boolean };
/** faceW = half the width that must show in a close-up of the face (moustache tips included) */
export type Design = { id: string; name: string; ol: number; faceW?: number; props: (who: Who) => Props; draw: (k: Ink, sk: Sk, o: FigOpts) => void;
  /** the arms' drawing-order choices on this skeleton and whether a change would show (cast.ts orderFlags): the stage settles them per shot */
  orderFlags?: (sk: Sk) => { after: { L: boolean; R: boolean }; face: { L: boolean; R: boolean }; freeArm: { L: boolean; R: boolean }; fore: { L: boolean; R: boolean }; freeFore: { L: boolean; R: boolean } };
  /** the closed fingers of the named hands by themselves (the layer that lies in front of a thing held) */
  fingers?: (k: Ink, sk: Sk, sides: ("L" | "R")[], whole?: Partial<Record<"L" | "R", HandKind>>) => void;
  /** the figure's hat by itself (lying or flying), its middle at the origin, seen from the angle phi */
  hat?: (k: Ink, phiDeg: number) => void;
  /** the garment's torso rows [height above the pelvis, half-width, depth in front, depth behind] (design units), for the body check:
   *  a robe or a coat tail is drawn hanging along the spine down to its hem, sitting too */
  garment?: number[][];
  /** is the figure drawn mirrored at this view angle (cast.ts mirrored): film.ts castOf fixes it for a whole shot */
  mirrorAt?: (yaw: number) => boolean };
export const LIGHT: P2 = [0.8, 0.45]; // which way the shadow lies on a part (the light comes from the upper left)

/** the torso's own frame: Q(l, d, a) = a point l to the figure's left, d in front of the spine and a above the pelvis along the spine */
/** how far a figure sits (0 = not at all, 1 = seated): both thighs lifted toward level (the lower of the two, so that a kneel or a stride,
 *  one thigh up and one down, is not a sitter) */
export const seated = (sk: Sk) => { const lift = (sd: Side) => { const h = sk.v[`hip${sd}`], k = sk.v[`kn${sd}`], L = Math.hypot(k[0] - h[0], k[1] - h[1], k[2] - h[2]) || 1; return (Math.acos(clamp((h[1] - k[1]) / L, -1, 1)) * 180) / Math.PI; };
  return clamp((Math.min(lift("L"), lift("R")) - 35) / 40, 0, 1); };
/** the torso's frame. `drape` (default on): the frame also says how far the figure sits (`drape`, 0..1), for the knee drape that
 *  cast.ts draws over the lap; `drape: false` = never (the proof's planted fault, the garment straight down through the seat) */
export const frame = (sk: Sk, drape = true) => {
  const o = sk.j.pelvis, s = unit(sub(sk.j.neck, o)), n: P2 = [-s[1], s[0]];
  const T = (l: number, a: number): P2 => [o[0] + n[0] * l + s[0] * a, o[1] + n[1] * l + s[1] * a];
  return { T, Q: (l: number, d: number, a: number) => T(l * sk.cos + d * sk.sin, a), tilt: Math.atan2(s[0], -s[1]) / (Math.PI / 180), o, s, n, drape: drape ? seated(sk) : 0 };
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
/** the thumb's flip as drawn: an open hand raised (its fingers up, within 60 degrees) shows its palm with the thumb toward the body's middle,
 *  as a raised right or left hand does; by the facing alone both raised hands of 06 got the same drawing, the near one thumb out, reading
 *  as a left hand or a back (the review of the shot types v4). raw = the facing alone (the check's planted fault) */
export const handFlip = (sk: Sk, side: Side, kind: HandKind, raw = false) => {
  const w = J(sk, "wr", side), t = J(sk, "tip", side), el = J(sk, "el", side), d = len(sub(t, w)) > 6 ? angle(w, t) : angle(el, w), r = (d * Math.PI) / 180;
  if (raw || kind !== "open" || Math.sin(r) > -0.5) return { flip: thumbFlip(sk, side), d, w };
  // (unflipped, the thumb lies on the hand's +y side: on the screen (-sin d, cos d); the middle is the neck's x)
  return { flip: -Math.sin(r) * (sk.j.neck[0] - w[0]) <= 0, d, w };
};
export const handAt = (k: Ink, sk: Sk, side: Side, kind: HandKind, col: string, cut = false, scale = 1) => {
  const { flip, d, w } = handFlip(sk, side, kind);
  hand(k, w, d, sk.P.hand * scale, kind, col, flip, cut);
};

/** a shoe from any side: side-on it is a shoe in profile, toward the lens a rounded toe cap; it follows the heel and toe of the skeleton.
 *  returns the outline (for extra marks); hA / hT = height at the ankle and over the toes, as fractions of the foot length */
/** the shoe check's switch (clip_check shoe-tilt plant) */
export const SHOE = { blend: true };
export const shoePts = (sk: Sk, side: Side, W: number, hA = 0.36, hT = 0.2, cut = false): { pts: P2[]; O: P2; ex: P2; up: P2; span: number; kk: number } => {
  const h = J(sk, "heel", side), t = J(sk, "toe", side), L = sk.P.foot, e = sub(t, h), kk = clamp(len(e) / L, 0, 1), dirx = e[0] >= 0 ? 1 : -1;
  // (v5: the tilt along the heel-to-toe line comes in over 0.15 to 0.4 of the foot showing, not switched on at a quarter: it jumped from level
  //  to tilted in one frame. SHOE.blend = false is the switch of v4, the check's planted fault)
  const wt = SHOE.blend ? (() => { const v = clamp((kk - 0.15) / 0.25, 0, 1); return v * v * (3 - 2 * v); })() : kk > 0.25 ? 1 : 0, full: P2 = len(e) > 1e-6 ? unit(e) : [dirx, 0];
  const ex: P2 = wt > 0 ? unit([dirx * (1 - wt) + full[0] * wt, full[1] * wt]) : [dirx, 0], up: P2 = ex[0] >= 0 ? [ex[1], -ex[0]] : [-ex[1], ex[0]], pad = (W * (1 - kk)) / 2, span = len(e) + 2 * pad;
  const O = add(h, ex, -pad), prof: [number, number][] = [[0, 0.3], [0.03, 0.75], [0.1, 1], [0.44, 1], [0.6, 0.72], [0.8, hT / hA], [0.95, (hT / hA) * 0.8], [1, 0.3]];
  const top = prof.map(([u, hh]) => { const sy = lerp(Math.sin(Math.PI * clamp(u, 0.04, 0.96)) ** 0.6, hh, kk); return add(add(O, ex, u * span), up, sy * hA * L); });
  const pts = [O, ...top, add(O, ex, span)];
  return { pts: cut ? pts : [O, ...spline(top, false, 4), add(O, ex, span)], O, ex, up, span, kk };
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
  // (from the front both arms are drawn after the torso and the head: an arm that moved from behind the body to in front of it as its wrist
  //  came forward swapped its layer in one frame, the hand popping out, and the monocle's clasp lay over the arm, the review of the shot
  //  types v3. In the flat look the arms hang at the body's sides or reach forward; neither goes behind it)
  L.tail?.(); L.leg(far); L.leg(near); L.torso(); L.head();
  for (const s of [far, near]) L.arm(s);
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
