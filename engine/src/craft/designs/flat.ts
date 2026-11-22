// The flat 2D style test (Jesper, 21 Nov 2026, "Stilprov: platt 2D. Inget byggs om förrän jag har valt"): three directions for Sir
// Digsworth drawn flat in code: thick even outlines, flat colours with no pattern and no light, big clear eyes, a simple head. His marks
// stay: a tweed cap (one flat colour) with a turquoise band, a monocle on a thin chain, a moustache, a pipe and a turquoise waistcoat.
// Each direction has its own proportions and its own way of drawing the eyes and the face. The skeleton (rig.ts) and the gesture library
// (stage/gestures.ts) are used as they are: only the drawing on top is new. Nothing here is used in a film.
//   the sheet: craft/FlatStyle.tsx
import { Ink, P2, sym, spline, ellPts, seg, mid, add } from "../ink";
import { Sk, Side, Props } from "../rig";
import { Design, FigOpts, Face, Who, frame, torsoPts, J, limb, handAt, shoePts, layers, headPose, headToWorld, seated } from "./common";

type F = ReturnType<typeof frame>;
export const TURQ = "#1fb3a6";
const GOLD = "#e8b630", MOUTH = "#5b1f2a", TONGUE = "#e46a6a", TEAR = "#7cc8ee", WHITE = "#ffffff";
/** the face check's switch (scripts/face_order.mjs): false draws the nose before the monocle's ring at three-quarter, as in v4 */
export const FACE = { noseLast: true };

/** a flat shape with the even outline: the ink is drawn under the fill, so the same width shows outside every part */
const fl = (k: Ink, pts: P2[], col: string) => k.group([pts], col);
/** a line inside a part, as wide as the outline that shows */
const ln = (k: Ink, pts: P2[], w = 0.85) => k.line(pts, k.ol * w);
/** a band of colour with an outline (a pipe stem, a monocle ring, a chain) */
const band = (k: Ink, pts: P2[], w: number, col: string, ol = k.ol * 0.85) => { k.line(pts, w + 2 * ol); k.line(pts, w, col); };
const mirror = (pts: P2[], cx = 0): P2[] => pts.map(([x, y]) => [2 * cx - x, y] as P2);
const at = (pts: P2[], dx: number, dy = 0): P2[] => pts.map(([x, y]) => [x + dx, y + dy] as P2);

/** the face values with their defaults */
const rd = (f: Face) => ({ smile: f.smile ?? 0, mouth: f.mouth ?? 0, brow: f.brow ?? 0, lid: f.lid ?? 0.06, wide: f.wide ?? 0, sad: f.sad ?? 0, tear: f.tear ?? 0,
  smirk: f.smirk ?? 0, teeth: f.teeth ?? 0, squeeze: f.squeeze ?? 0, pupil: f.pupil ?? 1, gaze: (f.gaze ?? [0, 0]) as P2 });
type FR = ReturnType<typeof rd>;

// ---------------- the three ways of drawing an eye ----------------
/** eyes squeezed hard shut: a chevron pointing at the nose (nose = +1 if the nose lies toward +x) */
const chevron = (k: Ink, cx: number, cy: number, rx: number, h: number, nose: number) => ln(k, [[cx - nose * rx, cy - h], [cx + nose * rx * 0.7, cy], [cx - nose * rx, cy + h]], 1.15);
/** the lids inside an eye's clip: the upper one down from the top, the lower one up from the bottom (a smile pushes it up) */
const lids = (k: Ink, cx: number, cy: number, rx: number, ry: number, lid: number, low: number, skin: string, bow = 0.12) => {
  if (lid > 0.02) { const y = cy - ry + 2 * ry * lid, e = spline([[cx - rx - 4, y - ry * bow], [cx, y + ry * bow], [cx + rx + 4, y - ry * bow]], false, 8);
    k.shape([[cx - rx - 6, cy - ry - 8], [cx + rx + 6, cy - ry - 8], ...e.slice().reverse()], skin, 0); ln(k, e); }
  if (low > 0.02) { const y = cy + ry - 2 * ry * low, e = spline([[cx - rx - 4, y + ry * 0.1], [cx, y - ry * 0.1], [cx + rx + 4, y + ry * 0.1]], false, 8);
    k.shape([[cx - rx - 6, cy + ry + 8], [cx + rx + 6, cy + ry + 8], ...e.slice().reverse()], skin, 0); ln(k, e); }
};
type EyeFn = (k: Ink, cx: number, cy: number, s: number, r: FR, skin: string, nose: number) => void;
/** the pupil's place in the eye as drawn (-1..1 each way), kept inside the eye: the gaze's two parts were each taken to the edge, so a gaze
 *  down and to the side ([1, 0.9]) put the pupil outside the oval, clipped away, and both eyes stood empty (the shot types v4 draft, 06).
 *  clamp = false gives the pupil as it was (the check's planted fault) */
export const pupilIn = (g: P2, clamp = true): P2 => { const m = Math.hypot(g[0], g[1]); return clamp && m > 1 ? [g[0] / m, g[1] / m] : g; };
/** the gaze an eye is drawn with in a view (as sirFront, sirQ and sirSide pass it): mirrored with the head, a three-quarter head looking
 *  the way it faces, a profile eye never looking back into the head */
export const drawnGaze = (view: "front" | "q" | "side", flip: boolean, gaze: P2): P2 => { const g: P2 = view !== "front" && flip ? [-gaze[0], gaze[1]] : gaze;
  return view === "q" ? [Math.min(1, 0.45 + 0.7 * Math.max(0, g[0])), g[1]] : view === "side" ? [Math.max(0.35, g[0]), g[1]] : g; };
/** A: a tall white oval with a big round black pupil */
const eyeA: EyeFn = (k, cx, cy, s, r, skin, nose) => {
  const rx = 30 * s, ry = 40 * s * (1 + 0.15 * r.wide);
  if (r.squeeze > 0.5) return chevron(k, cx, cy, rx * 0.9, ry * 0.5, nose);
  // (a shut eye is always one arc bowed down: with a smile over 0.5 it turned to a "^", two shapes for the same blink, the review of v3)
  if (r.lid > 0.93) { const d = ry * 0.32; ln(k, spline([[cx - rx, cy], [cx, cy + d], [cx + rx, cy]], false, 8), 1.15); return; }
  const ball = ellPts(cx, cy, rx, ry, 0, 0, 360, 40);
  fl(k, ball, WHITE);
  // (the pupil travels to the eye's edge: at three-quarter, looking at Ada, it stayed near the middle and he seemed to look at the lens)
  k.clip(ball, () => { const pr = 16 * s * r.pupil, gp = pupilIn(r.gaze); k.dot(cx + gp[0] * (rx - pr * 0.72 - 2 * s), cy + 4 * s + gp[1] * (ry - pr * 0.8 - 3 * s), pr);
    // (the smiling lower lid grows with the smile from 0.3 to 0.7: switched on at 0.5 it jumped, the eyes from heavy to wide in one
    //  frame, the review of the shot types v1)
    lids(k, cx, cy, rx, ry, r.lid, 0.3 * r.smile * Math.max(0, Math.min(1, (r.smile - 0.3) / 0.4)), skin); });
};

// ---------------- brows, mouth, tear, pipe, monocle ----------------
/** the brows' two ends, inner and outer (y down): up as a whole with `brow`, the inner end down when cross, up when sad */
const browEnds = (r: FR, cx: number, base: number, s: number, half: number, side: number): [P2, P2] => {
  const raise = Math.max(0, r.brow) * 12 * s + (r.wide > 0.3 ? 8 * s : 0), cross = Math.max(0, -r.brow);
  return [[cx - side * half, base - raise + cross * 14 * s - r.sad * 14 * s], [cx + side * half, base - raise - cross * 5 * s + r.sad * 7 * s]];
};
/** the mouth: a curve, or open (a dark shape with a tongue, or clenched teeth) */
/** lip: the lower lip's colour (A: the open mouth a third taller with the lower lip drawn under it, so a speaking mouth reads on a phone, Jesper
 *  approving the A sheet) */
const mouthAt = (k: Ink, x: number, y: number, w: number, s: number, r: FR, lip?: string) => {
  const sm = r.smile, cl = -sm * 12 * s + r.smirk * 4 * s, cr = -sm * 12 * s - r.smirk * 15 * s;
  if (r.mouth > 0.08) {
    const H = (lip ? 61 : 46) * s * r.mouth, top = spline([[x - w, y + cl], [x, y + (sm < 0 ? -H * 0.2 : sm * 3 * s)], [x + w, y + cr]], false, 8);
    const bot = spline([[x + w, y + cr], [x, y + H + Math.max(0, sm) * 10 * s], [x - w, y + cl]], false, 8), m = [...top, ...bot.slice(1)];
    if (lip && r.mouth > 0.2) { const lb = spline([[x + w * 0.7, y + cr + H * 0.5], [x, y + H + Math.max(0, sm) * 10 * s + 7 * s], [x - w * 0.7, y + cl + H * 0.5]], false, 8); band(k, lb, 9 * s, lip, k.ol * 0.6); }
    fl(k, m, MOUTH);
    k.clip(m, () => { if (r.teeth > 0.4) { k.shape([[x - w - 6, y - 60 * s], [x + w + 6, y - 60 * s], [x + w + 6, y + H * 0.62], [x - w - 6, y + H * 0.62]], WHITE, 0); ln(k, [[x - w, y + H * 0.32], [x + w, y + H * 0.32]], 0.5); }
      else k.shape(ellPts(x, y + H + 6 * s, w * 0.62, H * 0.5), TONGUE, 0); });
  } else ln(k, spline([[x - w, y + cl], [x + r.smirk * w * 0.15, y + sm * 8 * s], [x + w, y + cr]], false, 8), 0.95);
};
/** a tear under an eye, and its wet track */
const tearAt = (k: Ink, x: number, y: number, s: number, amt: number) => {
  if (amt < 0.05) return;
  band(k, [[x, y], [x + 2 * s, y + 26 * s * amt]], 9 * s, TEAR, k.ol * 0.5);
  const d = at(spline([[0, 0], [10 * s, 20 * s], [9 * s, 31 * s], [0, 37 * s], [-9 * s, 31 * s], [-10 * s, 20 * s]]), x + 2 * s, y + 24 * s * amt);
  fl(k, d, TEAR);
};
/** a pipe from the corner of the mouth: the stem out and a little down, the bowl upright (d = which way it points) */
/** droop 0..1: the pipe tips down in the corner of a gaping, frightened mouth (the review of the motion test: it stayed level in the gape) */
const pipeAt = (k: Ink, a: P2, s: number, d = 1, droop = 0) => {
  k.at(a[0], a[1], d * droop * 52, false, () => {
    const b: P2 = [62 * s * d, 16 * s];
    band(k, [[0, 0], b], 11 * s, "#3b2416");
    const bowl: P2[] = [[b[0] - 13 * s * d, b[1] - 36 * s], [b[0] + 19 * s * d, b[1] - 36 * s], [b[0] + 15 * s * d, b[1] + 8 * s], [b[0] - 10 * s * d, b[1] + 8 * s]];
    fl(k, bowl, "#8a4b26"); k.line([bowl[0], bowl[1]], 8 * s, k.ink); });
};
// (clenched teeth hold the pipe: it tips half as far; tipped all the way its bowl lay on the raised hand in 06, the review of the shot types v4)
const droopOf = (r: FR) => Math.max(0, Math.min(1, r.wide)) * (1 - 0.5 * Math.max(0, Math.min(1, r.teeth)));
/** how far a mouth's corners come down with the corners turned down (the pipe rides that corner: in the frightened grimace it stayed at the
 *  resting corner, up at the moustache beside the mouth, as if hanging from the moustache, the review of the shot types v4). Only down, so a
 *  smile leaves the pipe where the approved clips have it */
const cornerDown = (r: FR, s: number) => Math.max(0, -r.smile) * 12 * s;
/** an ear seen from the side: a filled oval and the curve of its bowl opening forward */
const ear = (k: Ink, x: number, y: number, rx: number, ry: number, skin: string) => { fl(k, ellPts(x, y, rx, ry, 0, 0, 360, 28), skin); ln(k, ellPts(x + rx * 0.2, y, rx * 0.5, ry * 0.55, 0, 110, 250, 10), 0.6); };
const monoRing = (k: Ink, cx: number, cy: number, rx: number, ry: number, w: number) => { const r = ellPts(cx, cy, rx, ry, 0, 0, 360, 40); band(k, r, w, GOLD, k.ol * 0.55); };
/** the chain: thin, gold, from the monocle's lower outer edge in a soft bow to the waistcoat */
const chainAt = (k: Ink, a: P2, b: P2, bow: P2, w: number) => band(k, spline([a, bow, b], false, 10), w, GOLD, Math.max(2, w * 0.55));
/** a flat cap from the front: the crown wider than the head, the turquoise band, the brim in front. top = the crown's top, y0 = where the brim sits */
const capFront = (k: Ink, hw: number, y0: number, top: number, col: string, brim: number) => {
  const cr = spline([[-hw * 1.06, y0 - 8], [-hw * 1.14, y0 - (y0 - top) * 0.5], [-hw * 0.82, top + 14], [0, top], [hw * 0.86, top + 10], [hw * 1.16, y0 - (y0 - top) * 0.52], [hw * 1.08, y0 - 8], [0, y0]]);
  fl(k, cr, col);
  fl(k, [[-hw * 1.04, y0 - 30], [hw * 1.06, y0 - 30], [hw * 1.02, y0 - 6], [-hw * 1.0, y0 - 6]], TURQ);
  fl(k, spline([[-hw * 0.95, y0 - 10], [0, y0 + brim], [hw * 0.95, y0 - 10], [hw * 0.8, y0 - 4], [0, y0 + brim * 0.45], [-hw * 0.8, y0 - 4]]), col);
  fl(k, ellPts(0, top + 3, hw * 0.12, hw * 0.06), col);
};
/** the same from the side, facing +x: the crown pushed forward over the brim, the band, the brim jutting out */
const capSide = (k: Ink, back: number, front: number, y0: number, top: number, col: string, brim: number) => {
  fl(k, spline([[front + brim, y0 - 2], [front + brim * 0.85, y0 - 16], [front - 10, y0 - 22], [front - 4, y0 + 2]]), col);
  const cr = spline([[back - 6, y0 - 4], [back - 12, y0 - (y0 - top) * 0.55], [back + (front - back) * 0.25, top + 4], [back + (front - back) * 0.6, top], [front + 18, top + (y0 - top) * 0.32], [front + 24, y0 - 14], [front, y0 - 4]]);
  fl(k, cr, col);
  fl(k, [[back - 4, y0 - 30], [front + 20, y0 - 30], [front + 16, y0 - 6], [back - 2, y0 - 6]], TURQ);
};

// ---------------- the specification of one direction ----------------
type Body = { rows: number[][]; arm: number[]; leg: number[]; shoeW: number; neck: number };
type Col = { skin: string; nose: string; hair: string; cap: string; coat: string; vest: string; shirt: string; tie: string; trous: string; shoe: string; dress: string; stock: string; collar: string };
export type FlatSpec = {
  id: string; name: string; ol: number; faceW: number; sir: { P: Props; B: Body }; other: { P: Props; B: Body }; col: Col;
  /** waistcoat over shirt sleeves (no coat) */ noCoat?: boolean;
  /** how far the face slides as the head turns from the lens */ turn: number;
  sirFront: (k: Ink, r: FR, tx: number, lift: number) => void; sirSide: (k: Ink, r: FR, lift: number, mono?: boolean) => void;
  otherFront: (k: Ink, r: FR, tx: number) => void; otherSide: (k: Ink, r: FR) => void;
  /** a three-quarter head, facing the picture's right (drawn mirrored for the left): turning, the head goes front, three-quarter, side, each
   *  drawing held for frames, never front to side in one frame (the review of the motion test). mono = which eye the monocle shows on: his
   *  right eye is the near one facing right, the far one facing left */
  sirQ?: (k: Ink, r: FR, lift: number, mono: "near" | "far") => void; otherQ?: (k: Ink, r: FR) => void; chainQ?: { near: [P2, P2]; far: [P2, P2] };
  /** the monocle and the bow of its chain, head-local (front: x before the turn slide), and where it ends on the waistcoat [to the left, above the pelvis] */
  chainFront: [P2, P2]; chainSide: [P2, P2]; chainEnd: [number, number]; chainW: number;
  /** the waistcoat's top, its point at the bottom, and half its width (front marks) */ vest: [number, number, number];
};

const drawFlat = (c: FlatSpec) => (k: Ink, sk: Sk, o: FigOpts) => {
  const other = o.who === "baker", { P: _p, B } = other ? c.other : c.sir, Fr = frame(sk), P = sk.P, r = rd(o.face ?? {}), hp = headPose(sk), C = c.col;
  void _p; const front = sk.cos > 0.35, sideOn = Math.abs(sk.sin) > 0.6, d = Math.sign(sk.sin) || 1, sit = other ? 0 : seated(sk);
  const leg = (s: Side) => {
    // (seated, in profile: the trousers' seat behind the hips, down to the seat's top, drawn with the far leg so the near thigh lies over it;
    //  with the coat's hem up off the lap there was a gap between the coat and the seat behind him, and he seemed to hover)
    const seatPad = sit > 0 && sideOn && s === sk.far ? [ellPts(...Fr.Q(0, -16, 2), 30 + 8 * sit, B.leg[0] * 0.98)] : [];
    k.group([...limb(J(sk, "hip", s), J(sk, "kn", s), J(sk, "an", s), B.leg), ...seatPad], other ? C.stock : C.trous);
    const sh = shoeDrawn(sk, s, B.shoeW); fl(k, sh.pts, C.shoe); k.line([sh.a, sh.b], k.ol * 0.9, k.ink, "butt");
  };
  const arm = (s: Side) => {
    const S = J(sk, "sh", s), E = J(sk, "el", s), W = J(sk, "wr", s), kind = (s === "L" ? o.handL : o.handR) ?? "relaxed";
    if (!other) k.group([seg(mid(E, W, 0.8), mid(E, W, 1.04), B.arm[2] * 0.92, B.arm[2] * 0.92, 0, 0.3, true)], C.shirt);
    k.group(limb(S, E, W, B.arm), other ? C.dress : c.noCoat ? C.shirt : C.coat);
    handAt(k, sk, s, kind, C.skin);
  };
  let torsoPoly: P2[] = [];
  const torso = () => {
    if (B.neck) k.group([seg(Fr.T(0, P.spine - 20), sk.j.skull, B.neck, B.neck * 0.92)], C.skin);
    // (the coat's hem comes up as the thighs bend toward level, so a seated figure's thighs show on the seat: hanging 34 under the hip the
    //  coat covered them and its hem sank in front of the seat, the review of the shot types v2)
    const flexOf = (s: Side) => { const h = J(sk, "hip", s), kn = J(sk, "kn", s); return Math.abs(Math.atan2(Math.abs(kn[0] - h[0]), kn[1] - h[1])) * (180 / Math.PI); };
    const flex = Math.max(0, Math.min(1, (Math.max(flexOf("L"), flexOf("R")) - 35) / 45));
    // (seated, the hem comes up above the thighs and the coat's front falls back off the lap, so the whole thigh shows level on the seat:
    //  with the hem 4 under the hip and the front 50 deep, the coat covered the thighs to the knees and he read as squatting, Jesper on the
    //  shot types v3: "låren vilar ovanpå den, fötterna i marken framför. Inte på huk")
    const l0 = B.rows[0][0] + 30 * flex, rows = B.rows.map((q, i) => (i === 0 ? [l0 + sit * (30 - l0), q[1], q[2] - sit * 30, q[3]] : i === 1 ? [q[0] + sit * 44, q[1], q[2] - sit * 14, q[3]] : q));
    const t = torsoPts(sk, rows), dz = Math.max(...B.rows.map((q) => q[2])) * 0.8; torsoPoly = t;
    const Q = (l: number, a: number) => Fr.Q(l, dz, a);
    if (other) {
      fl(k, t, C.dress);
      if (front) k.clip(t, () => { const a = P.spine; fl(k, [Q(-B.rows[B.rows.length - 2][1] * 0.8, a + 4), Q(0, a - 40), Q(B.rows[B.rows.length - 2][1] * 0.8, a + 4)], C.collar); });
      return;
    }
    const [vt, vb, vw] = c.vest;
    fl(k, t, c.noCoat ? C.shirt : C.coat);
    k.clip(t, () => {
      if (front) {
        if (c.noCoat) fl(k, [Q(-vw * 1.6, vt - 40), Q(-vw * 0.55, vt + 4), Q(0, vt - 44), Q(vw * 0.55, vt + 4), Q(vw * 1.6, vt - 40), Q(vw * 1.6, vb - 30), Q(-vw * 1.6, vb - 30)], C.vest);
        else fl(k, [Q(-vw, vt), Q(vw, vt), Q(vw * 1.15, vb + 26), Q(0, vb), Q(-vw * 1.15, vb + 26)], C.vest);
        fl(k, [Q(-vw * 0.55, vt + 14), Q(vw * 0.55, vt + 14), Q(0, vt - 46)], C.shirt);
        k.group([[Q(-7, vt + 8), Q(7, vt + 8), Q(9, vt - 30), Q(0, vt - 40), Q(-9, vt - 30)]], C.tie);
        for (const a of [0.3, 0.52, 0.74]) { const p = Q(0, vb + 18 + (vt - 60 - vb) * a); k.dot(p[0], p[1], 4.5); }
      } else if (sideOn) {
        const df = Math.max(...B.rows.map((q) => q[2]));
        if (c.noCoat) k.shape([Fr.Q(0, -400, vb - 30), Fr.Q(0, -400, vt - 60), Fr.Q(0, df * 0.2, vt - 30), Fr.Q(0, 400, vt - 40), Fr.Q(0, 400, vb - 30)], C.vest, k.ol * 0.85);
        else k.shape([Fr.Q(0, df * 0.5, vb + 10), Fr.Q(0, df * 0.62, vt), Fr.Q(0, df + 60, vt), Fr.Q(0, df + 60, vb + 10)], C.vest, k.ol * 0.85);
      }
    });
  };
  const head = () => {
    const sn = Math.sin(sk.faceYaw * (Math.PI / 180)), as = Math.abs(sn), flip = sn < 0;
    const view = !c.sirQ ? (hp.side ? "side" : "front") : as < 0.45 ? "front" : as < 0.85 ? "q" : "side";
    // (a mirrored head's gaze turned with it: the gaze is given in the picture, so a head drawn mirrored for the left looked the other way)
    const rv: FR = view !== "front" && flip ? { ...r, gaze: [-r.gaze[0], r.gaze[1]] } : r;
    k.at(sk.j.skull[0], sk.j.skull[1], sk.headTilt, view !== "front" && flip, () => {
      if (other) (view === "side" ? c.otherSide(k, rv) : view === "q" ? c.otherQ!(k, rv) : c.otherFront(k, rv, sn * c.turn));
      else (view === "side" ? c.sirSide(k, rv, o.capLift ?? 0, !flip) : view === "q" ? c.sirQ!(k, rv, o.capLift ?? 0, flip ? "far" : "near") : c.sirFront(k, rv, sn * c.turn, o.capLift ?? 0));
    });
    if (other) return;
    const w = headToWorld(sk, view !== "front" && flip), dz = Math.max(...B.rows.map((q) => q[2])), end = Fr.Q(c.chainEnd[0], dz * 0.8, c.chainEnd[1]);
    // (the monocle on his right eye only: seen from his left side it is behind his head, and so is its chain)
    // (the chain ends in a small gold button on the coat: it ended loose on the cloth, the review of the shot types v2)
    const clasp = (p: P2) => fl(k, ellPts(p[0], p[1], 8, 8), "#e8c45a");
    // (in profile the chain ends on the waistcoat's front, at the coat's edge: at 0.7 of its depth it ended inside the coat's shoulder, v3;
    //  22 over the end used from the front and at three-quarter, which stays as Jesper approved it in v3)
    if (view === "side") { if (!flip) { const a = w(c.chainSide[0]), b = Fr.T(dz * 0.95 * d, c.chainEnd[1] - 22); chainAt(k, a, b, [(a[0] + b[0]) / 2 - 14 * d, (a[1] + b[1]) / 2 + 26], c.chainW); clasp(b); } }
    else if (view === "q") { const q = c.chainQ![flip ? "far" : "near"], a = w(q[0]); chainAt(k, a, end, w(q[1]), c.chainW); clasp(end); }
    else { const tx = sn * c.turn; chainAt(k, w([c.chainFront[0][0] + tx, c.chainFront[0][1]]), end, w([c.chainFront[1][0] + tx, c.chainFront[1][1]]), c.chainW); clasp(end); }
  };
  // (v5: turning between front and side, 24 to 37 degrees off the lens, the far arm comes out from behind the body instead of jumping in
  //  front of it in one frame: it is drawn behind, and the part of it that lies over the body is shown from the body's far edge inward as he
  //  turns toward the lens. Switched at 30 degrees, the far arm changed layer in one frame in the turns of 03, Jesper on v4, "Ja")
  const as = Math.abs(sk.sin);
  if (!other && as > ARM_WIPE[0] && as < ARM_WIPE[1]) {
    const far = sk.far, near = sk.near; arm(far); leg(far); leg(near); torso(); head();
    const u = (ARM_WIPE[1] - as) / (ARM_WIPE[1] - ARM_WIPE[0]), xs = torsoPoly.map((p) => p[0]), x0 = Math.min(...xs), x1 = Math.max(...xs);
    const side = Math.sign(J(sk, "sh", far)[0] - J(sk, "sh", near)[0]) || 1, xFar = side > 0 ? x1 : x0, xNear = side > 0 ? x0 : x1, line = xFar + (xNear - xFar) * u, B9 = 1e4;
    const half: P2[] = side > 0 ? [[line, -B9], [B9, -B9], [B9, B9], [line, B9]] : [[-B9, -B9], [line, -B9], [line, B9], [-B9, B9]];
    k.clip(torsoPoly, () => k.clip(half, () => arm(far)));
    arm(near); return;
  }
  layers(sk, { arm, leg, torso, head });
};
/** where the far arm comes out from behind the body in a turn (|sin| of the facing); [0, 0] switches it in one frame at 0.5 (the v4 order,
 *  the bytes check's planted fault) */
export const ARM_WIPE: [number, number] = [0.4, 0.6];
/** a shoe as drawn: no part of it below the ground line (y = 0): turning, lifting or setting down a foot, its toe went 5-10 px through the
 *  line (the review of the motion test). clamp = false gives the shoe as it was (the check's planted fault) */
export const shoeDrawn = (sk: Sk, side: Side, W: number, clamp = true) => {
  const sh = shoePts(sk, side, W, 0.34, 0.2);
  // (a foot whose toe or heel touches the ground has its drawn shoe touch it too: with the heel a little up the shoe's rounded toe stood
  //  5-11 px above the line, a floating foot, the independent review of v4. The shoe comes down until its lowest point is on the line)
  const touch = clamp && Math.max(sk.j[`heel${side}`][1], sk.j[`toe${side}`][1]) > -0.5, low = Math.max(...sh.pts.map((p) => p[1])), dy = touch && low < 0 ? -low : 0;
  const cl = (p: P2): P2 => [p[0], clamp ? Math.min(p[1] + dy, 0) : p[1]];
  return { pts: sh.pts.map(cl), a: cl(sh.O), b: cl(add(sh.O, sh.ex, sh.span)) };
};
const design = (c: FlatSpec): Design => ({ id: c.id, name: c.name, ol: c.ol, faceW: c.faceW, props: (w: Who) => (w === "baker" ? c.other.P : c.sir.P), draw: drawFlat(c) });

// ======================= A: KNOPP — a round head half his height, a small round body =======================
const CA: Col = { skin: "#f7c9a3", nose: "#ef9f86", hair: "#4a2e1e", cap: "#9b6b43", coat: "#9b6b43", vest: TURQ, shirt: "#fffaf0", tie: "#d9483b", trous: "#6e5a4a", shoe: "#3a2a22",
  dress: "#f2a33a", stock: "#3d3346", collar: "#fffaf0" };
const ADA_HAIR_A = "#2e2a3a";
/** A's moustache, the right half (8 higher than on the sheet, with the mouth: a chin under the open mouth) */
const MOUS_A: P2[] = [[0, -72], [30, -80], [62, -74], [88, -84], [98, -106], [112, -100], [102, -68], [66, -58], [30, -62], [0, -66]];
const A_SPEC: FlatSpec = {
  id: "flatA", name: "A Knopp", ol: 9, faceW: 160, turn: 34,
  sir: { P: { thigh: 70, shin: 64, ankle: 16, foot: 92, hipW: 40, shW: 60, spine: 150, shDrop: 18, neck: 4, head: 262, upper: 74, fore: 68, hand: 60 },
    B: { rows: [[-34, 58, 50, 46], [0, 66, 64, 50], [50, 74, 76, 52], [100, 70, 66, 48], [132, 62, 50, 42], [150, 40, 34, 30], [162, 22, 22, 20]], arm: [23, 19, 17], leg: [27, 23, 20], shoeW: 42, neck: 0 } },
  other: { P: { thigh: 66, shin: 60, ankle: 16, foot: 80, hipW: 34, shW: 50, spine: 140, shDrop: 16, neck: 4, head: 244, upper: 66, fore: 62, hand: 54 },
    B: { rows: [[-80, 80, 66, 62], [-40, 66, 56, 52], [0, 52, 44, 40], [60, 42, 38, 32], [110, 52, 40, 34], [128, 40, 30, 26], [148, 20, 20, 18]], arm: [19, 16, 14], leg: [15, 13, 11], shoeW: 34, neck: 0 } },
  col: CA, chainFront: [[-74, -92], [-96, -2]], chainSide: [[42, -74], [40, 10]], chainEnd: [-34, 64], chainW: 4.5, vest: [150, -4, 36],
  sirFront: (k, r, tx, lift) => {
    for (const s of [-1, 1]) fl(k, ellPts(s * 126, -118, 24, 30), CA.skin);
    fl(k, ellPts(0, -128, 128, 132, 0, 0, 360, 60), CA.skin);
    for (const s of [-1, 1]) { const [i, o] = browEnds(r, s * 46 + tx, -172, 1, 20, s); k.line([i, o], 15 + k.ol * 1.7); k.line([i, o], 15, CA.hair); }
    // (the eyes and the monocle are drawn after the mouth, the pipe and the moustache, below: drawn before, the moustache lay over the eyes'
    //  lower edge and the monocle's ring while the monocle's cord lay on top, the independent review of the motion test v4)
    // (the mouth always shows under the moustache, closed a small dark mouth, so it can move with the voice; the pipe sits in its corner:
    //  Jesper choosing A, 21 Nov)
    const mw = 24 * (1 + 0.4 * r.mouth);
    // (the mouth's top under the moustache, so the open mouth, a third taller, ends above the chin: lower, it went past the head's edge)
    // (moustache and mouth 8 higher than on the sheet, so a narrow chin shows under the open mouth: it reached the head's edge, the review of
    //  the motion test)
    // (shut, a mouth 0.2 open, so it reads at phone size: at 0.13 it was a strip of 2-4 px; the pipe rides the mouth's corner down as it
    //  opens: it stayed under the moustache while the mouth gaped, the review of the shot types v1)
    const m0 = Math.max(r.mouth, 0.2);
    mouthAt(k, tx + r.smirk * 4, -52, mw, 1, { ...r, mouth: m0 }, "#e0806e");
    pipeAt(k, [tx + mw - 2, -48 + 61 * (m0 - 0.2) * 0.45 + cornerDown(r, 1)], 1, 1, droopOf(r));
    fl(k, at(spline([...MOUS_A, ...mirror(MOUS_A).reverse()]), tx), CA.hair);
    for (const s of [-1, 1]) eyeA(k, s * 46 + tx, -118, 1, r, CA.skin, -s);
    monoRing(k, -46 + tx, -118, 42, 52, 7);
    fl(k, ellPts(tx, -84, 17, 14), CA.nose);
    tearAt(k, tx + 54, -82, 1, r.tear); tearAt(k, tx - 38, -82, 0.9, r.tear * 0.7);
    k.g.save(); k.g.translate(-lift * 12, -lift * 50); capFront(k, 124, -206, -312, CA.cap, 12); k.g.restore();
  },
  sirSide: (k, r, lift, mono = true) => {
    fl(k, ellPts(0, -128, 124, 132, 0, 0, 360, 60), CA.skin);
    ear(k, -34, -112, 22, 30, CA.skin);
    const [i, o] = browEnds(r, 66, -172, 0.9, 18, -1); k.line([i, o], 14 + k.ol * 1.7); k.line([i, o], 14, CA.hair);      // (side -1: the brow's inner end toward the nose; the other way a scared brow read as cross in profile)
    // (from the side the pipe's mouthpiece is in the mouth under the moustache, not at the moustache's tip: Jesper choosing A. The mouth is drawn
    //  after the stem, so it shows in profile too: it was hidden by the moustache and the pipe while he walked in, the review of the motion test)
    pipeAt(k, [104, -40], 1, 1, droopOf(r));
    mouthAt(k, 92, -40, 14 * (1 + 0.4 * r.mouth), 0.9, { ...r, mouth: Math.max(r.mouth, 0.16) }, "#e0806e");
    fl(k, spline([[70, -72], [108, -76], [130, -80], [140, -100], [151, -94], [140, -66], [112, -58], [74, -62]]), CA.hair);
    eyeA(k, 66, -118, 0.9, { ...r, gaze: [Math.max(0.35, r.gaze[0]), r.gaze[1]] }, CA.skin, 1);      // (after the moustache, as front and three-quarter)
    if (mono) monoRing(k, 66, -118, 36, 50, 7);
    fl(k, ellPts(126, -82, 19, 16), CA.nose);
    tearAt(k, 72, -82, 1, r.tear);
    k.g.save(); k.g.translate(-lift * 40, -lift * 50); k.g.rotate(-lift * 0.25); capSide(k, -128, 112, -206, -312, CA.cap, 52); k.g.restore();
  },
  // three-quarter, facing the picture's right: the near eye (his right) full, the far eye narrower by the edge, the nose by the edge, the near
  // half of the moustache long and the far one short, the near ear on the head's left
  sirQ: (k, r, lift, mono) => {
    ear(k, 120, -114, 12, 22, CA.skin);      // (the far ear just showing past the cheek: from the front both ears popped out in one frame, the review of v2)
    fl(k, ellPts(0, -128, 126, 132, 0, 0, 360, 60), CA.skin);
    ear(k, -92, -114, 20, 28, CA.skin);
    for (const [x, hw] of [[10, 20], [74, 14]] as [number, number][]) { const [i, o] = browEnds(r, x, -172, 1, hw, x < 40 ? -1 : 1); k.line([i, o], 15 + k.ol * 1.7); k.line([i, o], 15, CA.hair); }
    // (a three-quarter head looks the way it faces: the pupils start 0.45 toward that side and the gaze adds to it. At the gaze alone the near
    //  pupil sat in the eye's middle while he pointed at Ada and he seemed to look into the lens, the review of v3)
    const gz: P2 = [Math.min(1, 0.45 + 0.7 * Math.max(0, r.gaze[0])), r.gaze[1]];
    // (v1-v4: the monocle's ring was drawn after the nose, the review of the shot types v1; v5: the nose last, below)
    const eyesAndMono = () => { eyeA(k, 10, -118, 1, { ...r, gaze: gz }, CA.skin, 1); eyeA(k, 76, -118, 0.8, { ...r, gaze: gz }, CA.skin, -1); };
    const ring = () => { if (mono === "near") monoRing(k, 10, -118, 42, 52, 7); else monoRing(k, 76, -118, 34, 44, 7); };
    // (the mouth nearer the head's middle, kept inside the head's outline with a narrow chin under it, its open height 0.8 of the front's: at
    //  the nose's side the jaw curves up and the open mouth and its lip went out past the outline, over the collar; closed it shows below the
    //  moustache as clearly as from the front. The review of the motion test v3)
    const mw = 18 * (1 + 0.4 * r.mouth), head = ellPts(0, -128, 126, 132, 0, 0, 360, 60);
    // (closing, the mouth comes down 10 below the moustache's edge and keeps a small open shape: at -58 the closed mouth lay under the
    //  moustache, 2-4 px, unseen at phone size)
    // (at rest the small dark mouth of the front, 0.13 open, no tongue: at 0.26 it stood open with its tongue while he was silent, the
    //  independent review of v4; it sits 14 lower when closed, under the moustache's edge)
    const my = -58 + 14 * (1 - Math.min(1, r.mouth / 0.5));
    const m0 = Math.max(r.mouth, 0.2);
    k.clip(head, () => mouthAt(k, 62 + r.smirk * 4, my, mw, 0.8, { ...r, mouth: m0 }, "#e0806e"));
    // (the pipe stays in his left mouth corner: turned to his left that corner is the far one, at the mouth's nose side; turned to his right
    //  (drawn mirrored) it is the near one, at the mouth's back, the stem going out the same way on the screen as from the front. It jumped
    //  to the other corner in one frame, the review of v2)
    if (mono === "far") pipeAt(k, [62 - mw + 2, my + 4 + 61 * 0.8 * (m0 - 0.2) * 0.45 + cornerDown(r, 0.8)], 1, -1, droopOf(r));
    else pipeAt(k, [62 + mw - 2, my + 4 + 61 * 0.8 * (m0 - 0.2) * 0.45 + cornerDown(r, 0.8)], 1, 1, droopOf(r));
    // (the far half 0.6 of the near one: at 0.34 the moustache doubled in size the frame the head turned to the front, the review of v2)
    // (the far half 0.5, the whole moustache 6 nearer the middle: at 0.6 from 84 its tip and the pipe came close to the head's outline, v3)
    const near = mirror(MOUS_A).map(([x, y]) => [x * 1.0 + 78, y] as P2), far = MOUS_A.map(([x, y]) => [x * 0.5 + 78, y] as P2);
    fl(k, spline([...far, ...near.reverse()]), CA.hair);
    eyesAndMono();      // (after the moustache: the eyes and the monocle over it, the cord over them as before)
    // (v5: the nose over the eyes and the monocle's ring in every view, as from the front and in profile: turned to his left the ring on the
    //  far eye lay over the nose, Jesper on the shot types v4, "Ja"; this undoes the order the review of v1 asked for. FACE.noseLast = false
    //  is the check's planted fault, the order of v4)
    if (FACE.noseLast) { ring(); fl(k, ellPts(104, -84, 17, 14), CA.nose); } else { fl(k, ellPts(104, -84, 17, 14), CA.nose); ring(); }
    tearAt(k, 84, -82, 0.9, r.tear); tearAt(k, 18, -82, 1, r.tear * 0.7);
    k.g.save(); k.g.translate(-lift * 20 + 18, -lift * 50); capFront(k, 124, -206, -312, CA.cap, 12); k.g.restore();
  },
  otherQ: (k, r) => {
    fl(k, ellPts(-56, -252, 42, 40), ADA_HAIR_A);
    fl(k, ellPts(0, -120, 120, 124, 0, 0, 360, 60), CA.skin);
    ear(k, -92, -110, 18, 24, CA.skin);
    fl(k, spline([[-118, -100], [-124, -170], [-84, -232], [10, -250], [96, -226], [122, -176], [118, -140], [80, -172], [30, -184], [-20, -178], [-70, -160], [-100, -122]]), ADA_HAIR_A);
    for (const [x, hw] of [[14, 18], [76, 12]] as [number, number][]) { const [i, o] = browEnds(r, x, -176, 0.95, hw, x < 40 ? -1 : 1); k.line([i, o], 9 + k.ol * 1.7); k.line([i, o], 9, ADA_HAIR_A); }
    const gz: P2 = [Math.min(1, 0.45 + 0.7 * Math.max(0, r.gaze[0])), r.gaze[1]];      // (as Sir's: a three-quarter head looks the way it faces)
    eyeA(k, 14, -124, 0.95, { ...r, gaze: gz }, CA.skin, 1); eyeA(k, 78, -124, 0.76, { ...r, gaze: gz }, CA.skin, -1);
    if (r.lid < 0.9 && r.squeeze < 0.5) { ln(k, [[-10, -150], [-20, -162]], 0.7); ln(k, [[96, -146], [104, -156]], 0.7); }
    fl(k, ellPts(104, -90, 10, 8), CA.nose);
    k.clip(ellPts(0, -120, 120, 124, 0, 0, 360, 60), () => mouthAt(k, 68, -58, 16 * (1 + 0.3 * r.mouth), 0.95, r));
    tearAt(k, 84, -88, 0.9, r.tear);
  },
  chainQ: { near: [[-24, -78], [-50, -4]], far: [[56, -80], [10, 0]] },
  otherFront: (k, r, tx) => {
    fl(k, ellPts(0, -262, 44, 40), ADA_HAIR_A);
    for (const s of [-1, 1]) fl(k, ellPts(s * 118, -112, 20, 26), CA.skin);
    fl(k, ellPts(0, -120, 120, 124, 0, 0, 360, 60), CA.skin);
    fl(k, spline([[-124, -110], [-128, -170], [-90, -232], [0, -250], [90, -232], [128, -170], [124, -110], [100, -160], [40, -186], [tx, -176], [-60, -190], [-104, -160]]), ADA_HAIR_A);
    for (const s of [-1, 1]) { const [i, o] = browEnds(r, s * 44 + tx, -176, 0.95, 18, s); k.line([i, o], 9 + k.ol * 1.7); k.line([i, o], 9, ADA_HAIR_A); }
    for (const s of [-1, 1]) { eyeA(k, s * 44 + tx, -124, 0.95, r, CA.skin, -s); if (r.lid < 0.9 && r.squeeze < 0.5) ln(k, [[s * 70 + tx, -150], [s * 82 + tx, -162]], 0.7); }
    fl(k, ellPts(tx, -88, 10, 8), CA.nose);
    mouthAt(k, tx, -56, 20 * (1 + 0.3 * r.mouth), 0.95, r);
    tearAt(k, tx + 52, -88, 0.9, r.tear);
  },
  otherSide: (k, r) => {
    fl(k, ellPts(-92, -236, 42, 40), ADA_HAIR_A);
    fl(k, ellPts(0, -120, 118, 124, 0, 0, 360, 60), CA.skin);
    fl(k, spline([[-116, -90], [-122, -170], [-80, -232], [10, -248], [80, -226], [110, -186], [60, -190], [10, -176], [-30, -150], [-60, -96]]), ADA_HAIR_A);
    const [i, o] = browEnds(r, 64, -176, 0.9, 16, -1); k.line([i, o], 9 + k.ol * 1.7); k.line([i, o], 9, ADA_HAIR_A);
    eyeA(k, 64, -124, 0.88, { ...r, gaze: [Math.max(0.35, r.gaze[0]), r.gaze[1]] }, CA.skin, 1);
    if (r.lid < 0.9 && r.squeeze < 0.5) ln(k, [[88, -150], [100, -160]], 0.7);
    fl(k, ellPts(118, -92, 11, 9), CA.nose);
    mouthAt(k, 96, -58, 12 * (1 + 0.3 * r.mouth), 0.9, r);
    tearAt(k, 70, -88, 0.9, r.tear);
  },
};

/** the frozen look (Jesper, 21 Nov 2026: "Riktning A Knopp är godkänd och fryst"); directions B Stång and C Kloss removed, see git tag fore-platt-2d */
export const FLAT_SPECS = [A_SPEC];
export const FLAT: Design[] = FLAT_SPECS.map(design);
/** the one-line description of each direction on the sheet */
export const FLAT_LINES = [
  "Stort runt huvud, halva längden. Liten rund kropp, korta ben. Ögon: höga vita ovaler med stor svart pupill. Knappnäsa, krullad mustasch.",
];
/** the supporting figure: Ada, his assistant, in the same style */
export const OTHER_NAME = "ADA, ASSISTENTEN";
