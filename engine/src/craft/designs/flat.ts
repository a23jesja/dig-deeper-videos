// The flat 2D style test (Jesper, 21 Nov 2026, "Stilprov: platt 2D. Inget byggs om förrän jag har valt"): three directions for Sir
// Digsworth drawn flat in code: thick even outlines, flat colours with no pattern and no light, big clear eyes, a simple head. His marks
// stay: a tweed cap (one flat colour) with a turquoise band, a monocle on a thin chain, a moustache, a pipe and a turquoise waistcoat.
// Each direction has its own proportions and its own way of drawing the eyes and the face. The skeleton (rig.ts) and the gesture library
// (stage/gestures.ts) are used as they are: only the drawing on top is new. Nothing here is used in a film.
//   the sheet: craft/FlatStyle.tsx
import { Ink, P2, sym, spline, ellPts, seg, mid, add } from "../ink";
import { Sk, Side, Props } from "../rig";
import { Design, FigOpts, Face, Who, frame, torsoPts, J, limb, handAt, shoePts, layers, headPose, headToWorld } from "./common";

type F = ReturnType<typeof frame>;
export const TURQ = "#1fb3a6";
const GOLD = "#e8b630", MOUTH = "#5b1f2a", TONGUE = "#e46a6a", TEAR = "#7cc8ee", WHITE = "#ffffff";

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
/** A: a tall white oval with a big round black pupil */
const eyeA: EyeFn = (k, cx, cy, s, r, skin, nose) => {
  const rx = 30 * s, ry = 40 * s * (1 + 0.15 * r.wide);
  if (r.squeeze > 0.5) return chevron(k, cx, cy, rx * 0.9, ry * 0.5, nose);
  if (r.lid > 0.93) { const d = r.smile > 0.5 ? -ry * 0.45 : ry * 0.32; ln(k, spline([[cx - rx, cy], [cx, cy + d], [cx + rx, cy]], false, 8), 1.15); return; }
  const ball = ellPts(cx, cy, rx, ry, 0, 0, 360, 40);
  fl(k, ball, WHITE);
  k.clip(ball, () => { const pr = 16 * s * r.pupil; k.dot(cx + r.gaze[0] * (rx - pr - 3 * s), cy + 4 * s + r.gaze[1] * (ry - pr - 4 * s), pr);
    lids(k, cx, cy, rx, ry, r.lid, r.smile > 0.5 ? 0.3 * r.smile : 0, skin); });
};
/** B: a solid black upright pill with no white; scared, it gets a white ring round a small pill */
const eyeB: EyeFn = (k, cx, cy, s, r, skin, nose) => {
  if (r.squeeze > 0.5) return chevron(k, cx, cy, 15 * s, 12 * s, nose);
  if (r.lid > 0.93) { if (r.smile > 0.5) ln(k, spline([[cx - 16 * s, cy + 4 * s], [cx, cy - 10 * s], [cx + 16 * s, cy + 4 * s]], false, 8), 1.15); else ln(k, [[cx - 17 * s, cy + 4 * s], [cx + 17 * s, cy + 4 * s]], 1.25); return; }
  const g = r.gaze;
  if (r.wide > 0.3) {
    const rx = 21 * s, ry = 28 * s, ball = ellPts(cx, cy, rx, ry, 0, 0, 360, 36); fl(k, ball, WHITE);
    k.clip(ball, () => { k.shape(ellPts(cx + g[0] * 8 * s, cy + g[1] * 10 * s, 8 * s * r.pupil, 13 * s * r.pupil), k.ink, 0); lids(k, cx, cy, rx, ry, r.lid, 0, skin); });
    return;
  }
  const rx = 11 * s, ry = 21 * s, x = cx + g[0] * 6 * s, y = cy + g[1] * 6 * s, pill = ellPts(x, y, rx, ry, 0, 0, 360, 32);
  k.shape(pill, k.ink, 0);
  const lo = r.smile > 0.5 ? 0.32 * r.smile : 0;
  // (the lid cuts the pill with a straight edge drawn wider than the pill, so a heavy lid reads at a distance)
  k.clip(ellPts(x, y, rx + 1, ry + 1), () => { if (r.lid > 0.12) k.shape([[x - 30 * s, y - 40 * s], [x + 30 * s, y - 40 * s], [x + 30 * s, y - ry + 2 * ry * r.lid], [x - 30 * s, y - ry + 2 * ry * r.lid]], skin, 0);
    if (lo > 0.02) k.shape([[x - 30 * s, y + 40 * s], [x + 30 * s, y + 40 * s], [x + 30 * s, y + ry - 2 * ry * lo], [x - 30 * s, y + ry - 2 * ry * lo]], skin, 0); });
  if (r.lid > 0.12) ln(k, [[x - rx * 1.6, y - ry + 2 * ry * r.lid], [x + rx * 1.6, y - ry + 2 * ry * r.lid]], 1.1);
  if (lo > 0.02) ln(k, spline([[x - rx * 1.5, y + ry - 2 * ry * lo + 4 * s], [x, y + ry - 2 * ry * lo - 3 * s], [x + rx * 1.5, y + ry - 2 * ry * lo + 4 * s]], false, 6));
};
/** C: a dome, flat along the bottom, its pupil sitting on the flat line; a little heavy-lidded at rest; scared, the dome opens to a full oval */
const eyeC: EyeFn = (k, cx, cy, s, r, skin, nose) => {
  const rx = 28 * s, ry = 30 * s * (1 + 0.2 * r.wide), ry2 = ry * (0.14 + 0.8 * r.wide);
  if (r.squeeze > 0.5) return chevron(k, cx, cy, rx * 0.9, ry * 0.45, nose);
  if (r.lid > 0.93) { if (r.smile > 0.5) ln(k, spline([[cx - rx, cy + 4 * s], [cx, cy - ry * 0.5], [cx + rx, cy + 4 * s]], false, 8), 1.15); else { ln(k, [[cx - rx, cy + ry2], [cx + rx, cy + ry2]], 1.25); for (const u of [-0.6, 0, 0.6]) ln(k, [[cx + u * rx, cy + ry2], [cx + u * rx * 1.2, cy + ry2 + 9 * s]], 0.6); } return; }
  const dome = [...ellPts(cx, cy, rx, ry, 0, 180, 360, 24), ...ellPts(cx, cy, rx, ry2, 0, 0, 180, 16).slice(1)];
  fl(k, dome, WHITE);
  const lid = r.wide > 0.3 ? r.lid : Math.max(r.lid, 0.24);
  k.clip(dome, () => { const pr = 14 * s * r.pupil; k.dot(cx + r.gaze[0] * (rx - pr - 2 * s), cy + ry2 - pr * 0.75 + r.gaze[1] * 5 * s, pr);
    lids(k, cx, cy, rx, ry, lid, 0, skin, 0); });
};

// ---------------- brows, mouth, tear, pipe, monocle ----------------
/** the brows' two ends, inner and outer (y down): up as a whole with `brow`, the inner end down when cross, up when sad */
const browEnds = (r: FR, cx: number, base: number, s: number, half: number, side: number): [P2, P2] => {
  const raise = Math.max(0, r.brow) * 12 * s + (r.wide > 0.3 ? 8 * s : 0), cross = Math.max(0, -r.brow);
  return [[cx - side * half, base - raise + cross * 14 * s - r.sad * 14 * s], [cx + side * half, base - raise - cross * 5 * s + r.sad * 7 * s]];
};
/** the mouth: a curve, or open (a dark shape with a tongue, or clenched teeth) */
const mouthAt = (k: Ink, x: number, y: number, w: number, s: number, r: FR) => {
  const sm = r.smile, cl = -sm * 12 * s + r.smirk * 4 * s, cr = -sm * 12 * s - r.smirk * 15 * s;
  if (r.mouth > 0.08) {
    const H = 46 * s * r.mouth, top = spline([[x - w, y + cl], [x, y + (sm < 0 ? -H * 0.2 : sm * 3 * s)], [x + w, y + cr]], false, 8);
    const bot = spline([[x + w, y + cr], [x, y + H + Math.max(0, sm) * 10 * s], [x - w, y + cl]], false, 8), m = [...top, ...bot.slice(1)];
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
const pipeAt = (k: Ink, a: P2, s: number, d = 1) => {
  const b: P2 = [a[0] + 62 * s * d, a[1] + 16 * s];
  band(k, [a, b], 11 * s, "#3b2416");
  const bowl: P2[] = [[b[0] - 13 * s * d, b[1] - 36 * s], [b[0] + 19 * s * d, b[1] - 36 * s], [b[0] + 15 * s * d, b[1] + 8 * s], [b[0] - 10 * s * d, b[1] + 8 * s]];
  fl(k, bowl, "#8a4b26"); k.line([bowl[0], bowl[1]], 8 * s, k.ink);
};
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
  sirFront: (k: Ink, r: FR, tx: number, lift: number) => void; sirSide: (k: Ink, r: FR, lift: number) => void;
  otherFront: (k: Ink, r: FR, tx: number) => void; otherSide: (k: Ink, r: FR) => void;
  /** the monocle and the bow of its chain, head-local (front: x before the turn slide), and where it ends on the waistcoat [to the left, above the pelvis] */
  chainFront: [P2, P2]; chainSide: [P2, P2]; chainEnd: [number, number]; chainW: number;
  /** the waistcoat's top, its point at the bottom, and half its width (front marks) */ vest: [number, number, number];
};

const drawFlat = (c: FlatSpec) => (k: Ink, sk: Sk, o: FigOpts) => {
  const other = o.who === "baker", { P: _p, B } = other ? c.other : c.sir, Fr = frame(sk), P = sk.P, r = rd(o.face ?? {}), hp = headPose(sk), C = c.col;
  void _p; const front = sk.cos > 0.35, sideOn = Math.abs(sk.sin) > 0.6, d = Math.sign(sk.sin) || 1;
  const leg = (s: Side) => {
    k.group(limb(J(sk, "hip", s), J(sk, "kn", s), J(sk, "an", s), B.leg), other ? C.stock : C.trous);
    const sh = shoePts(sk, s, B.shoeW, 0.34, 0.2); fl(k, sh.pts, C.shoe); k.line([sh.O, add(sh.O, sh.ex, sh.span)], k.ol * 0.9, k.ink, "butt");
  };
  const arm = (s: Side) => {
    const S = J(sk, "sh", s), E = J(sk, "el", s), W = J(sk, "wr", s), kind = (s === "L" ? o.handL : o.handR) ?? "relaxed";
    if (!other) k.group([seg(mid(E, W, 0.8), mid(E, W, 1.04), B.arm[2] * 0.92, B.arm[2] * 0.92, 0, 0.3, true)], C.shirt);
    k.group(limb(S, E, W, B.arm), other ? C.dress : c.noCoat ? C.shirt : C.coat);
    handAt(k, sk, s, kind, C.skin);
  };
  const torso = () => {
    if (B.neck) k.group([seg(Fr.T(0, P.spine - 20), sk.j.skull, B.neck, B.neck * 0.92)], C.skin);
    const t = torsoPts(sk, B.rows), dz = Math.max(...B.rows.map((q) => q[2])) * 0.8;
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
    k.at(sk.j.skull[0], sk.j.skull[1], sk.headTilt, hp.side && hp.flip, () => {
      if (other) (hp.side ? c.otherSide(k, r) : c.otherFront(k, r, hp.turn * c.turn));
      else (hp.side ? c.sirSide(k, r, o.capLift ?? 0) : c.sirFront(k, r, hp.turn * c.turn, o.capLift ?? 0));
    });
    if (other) return;
    const w = headToWorld(sk, hp.side && hp.flip), end = Fr.Q(c.chainEnd[0], Math.max(...B.rows.map((q) => q[2])) * 0.8, c.chainEnd[1]);
    if (hp.side) { const a = w(c.chainSide[0]), b = Fr.T(Math.max(...B.rows.map((q) => q[2])) * 0.7 * d, c.chainEnd[1]); chainAt(k, a, b, [(a[0] + b[0]) / 2 - 14 * d, (a[1] + b[1]) / 2 + 26], c.chainW); }
    else { const tx = hp.turn * c.turn; chainAt(k, w([c.chainFront[0][0] + tx, c.chainFront[0][1]]), end, w([c.chainFront[1][0] + tx, c.chainFront[1][1]]), c.chainW); }
  };
  layers(sk, { arm, leg, torso, head });
};
const design = (c: FlatSpec): Design => ({ id: c.id, name: c.name, ol: c.ol, faceW: c.faceW, props: (w: Who) => (w === "baker" ? c.other.P : c.sir.P), draw: drawFlat(c) });

// ======================= A: KNOPP — a round head half his height, a small round body =======================
const CA: Col = { skin: "#f7c9a3", nose: "#ef9f86", hair: "#4a2e1e", cap: "#9b6b43", coat: "#9b6b43", vest: TURQ, shirt: "#fffaf0", tie: "#d9483b", trous: "#6e5a4a", shoe: "#3a2a22",
  dress: "#f2a33a", stock: "#3d3346", collar: "#fffaf0" };
const ADA_HAIR_A = "#2e2a3a";
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
    for (const s of [-1, 1]) eyeA(k, s * 46 + tx, -118, 1, r, CA.skin, -s);
    monoRing(k, -46 + tx, -118, 42, 52, 7);
    mouthAt(k, tx + r.smirk * 4, -32, 22 * (1 + 0.3 * r.mouth), 1, r);
    pipeAt(k, [tx + 30, -38], 1);
    const half: P2[] = [[0, -62], [30, -70], [62, -64], [88, -74], [98, -96], [112, -90], [102, -58], [66, -46], [30, -50], [0, -54]];
    fl(k, at(spline([...half, ...mirror(half).reverse()]), tx), CA.hair);
    fl(k, ellPts(tx, -80, 17, 14), CA.nose);
    tearAt(k, tx + 54, -82, 1, r.tear); tearAt(k, tx - 38, -82, 0.9, r.tear * 0.7);
    k.g.save(); k.g.translate(-lift * 12, -lift * 50); capFront(k, 124, -206, -312, CA.cap, 12); k.g.restore();
  },
  sirSide: (k, r, lift) => {
    fl(k, ellPts(0, -128, 124, 132, 0, 0, 360, 60), CA.skin);
    ear(k, -34, -112, 22, 30, CA.skin);
    const [i, o] = browEnds(r, 66, -172, 0.9, 18, 1); k.line([i, o], 14 + k.ol * 1.7); k.line([i, o], 14, CA.hair);
    eyeA(k, 66, -118, 0.9, { ...r, gaze: [Math.max(0.35, r.gaze[0]), r.gaze[1]] }, CA.skin, 1);
    monoRing(k, 66, -118, 36, 50, 7);
    mouthAt(k, 100, -34, 13 * (1 + 0.3 * r.mouth), 0.9, r);
    pipeAt(k, [110, -38], 1);
    fl(k, spline([[70, -66], [110, -70], [140, -74], [154, -98], [166, -88], [152, -60], [112, -50], [74, -56]]), CA.hair);
    fl(k, ellPts(126, -82, 19, 16), CA.nose);
    tearAt(k, 72, -82, 1, r.tear);
    k.g.save(); k.g.translate(-lift * 40, -lift * 50); k.g.rotate(-lift * 0.25); capSide(k, -128, 112, -206, -312, CA.cap, 52); k.g.restore();
  },
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
    const [i, o] = browEnds(r, 64, -176, 0.9, 16, 1); k.line([i, o], 9 + k.ol * 1.7); k.line([i, o], 9, ADA_HAIR_A);
    eyeA(k, 64, -124, 0.88, { ...r, gaze: [Math.max(0.35, r.gaze[0]), r.gaze[1]] }, CA.skin, 1);
    if (r.lid < 0.9 && r.squeeze < 0.5) ln(k, [[88, -150], [100, -160]], 0.7);
    fl(k, ellPts(118, -92, 11, 9), CA.nose);
    mouthAt(k, 96, -58, 12 * (1 + 0.3 * r.mouth), 0.9, r);
    tearAt(k, 70, -88, 0.9, r.tear);
  },
};

// ======================= B: STÅNG — tall and narrow, a small bean head on a long neck =======================
const CB: Col = { skin: "#f0c4a0", nose: "#f0c4a0", hair: "#6b4a2f", cap: "#7d7a6a", coat: "#7d7a6a", vest: "#19a6a6", shirt: "#f6f3ea", tie: "#2c2f3a", trous: "#55606b", shoe: "#2b2b33",
  dress: "#c84b5a", stock: "#3a2e33", collar: "#f6f3ea" };
const ADA_HAIR_B = "#b5652f";
const beanFront = sym([[0, 8], [40, 2], [62, -40], [66, -112], [58, -162], [36, -188], [0, -194]]);
const B_SPEC: FlatSpec = {
  id: "flatB", name: "B Stång", ol: 11, faceW: 112, turn: 22, noCoat: true,
  sir: { P: { thigh: 150, shin: 140, ankle: 20, foot: 100, hipW: 34, shW: 58, spine: 250, shDrop: 18, neck: 44, head: 182, upper: 130, fore: 120, hand: 62 },
    B: { rows: [[-24, 42, 40, 36], [0, 42, 40, 36], [80, 40, 38, 34], [160, 46, 42, 36], [222, 58, 40, 34], [244, 40, 30, 26], [256, 16, 16, 14]], arm: [16, 13, 12], leg: [20, 17, 14], shoeW: 34, neck: 15 } },
  other: { P: { thigh: 140, shin: 130, ankle: 18, foot: 86, hipW: 30, shW: 48, spine: 230, shDrop: 16, neck: 42, head: 172, upper: 118, fore: 110, hand: 56 },
    B: { rows: [[-150, 72, 62, 58], [-70, 52, 48, 44], [0, 40, 36, 32], [110, 32, 30, 26], [190, 44, 32, 28], [212, 30, 24, 20], [230, 12, 12, 12]], arm: [13, 11, 10], leg: [13, 11, 9], shoeW: 28, neck: 13 } },
  col: CB, chainFront: [[-40, -96], [-62, 10]], chainSide: [[28, -84], [30, 10]], chainEnd: [-30, 150], chainW: 4, vest: [242, -10, 30],
  sirFront: (k, r, tx, lift) => {
    for (const s of [-1, 1]) fl(k, ellPts(s * 64, -100, 14, 22), CB.skin);
    fl(k, beanFront, CB.skin);
    for (const s of [-1, 1]) { const [i, o] = browEnds(r, s * 26 + tx, -148, 0.8, 20, s); ln(k, spline([i, [(i[0] + o[0]) / 2, Math.min(i[1], o[1]) - 7], o], false, 6), 0.95); }
    for (const s of [-1, 1]) eyeB(k, s * 26 + tx, -112, 1, r, CB.skin, -s);
    monoRing(k, -26 + tx, -112, 25, 32, 5.5);
    fl(k, [[tx - 6, -124], [tx + 14, -72], [tx - 12, -68]], CB.nose);
    mouthAt(k, tx + r.smirk * 3, -36, 13 * (1 + 0.35 * r.mouth), 0.75, r);
    pipeAt(k, [tx + 16, -40], 0.78);
    const half: P2[] = [[0, -56], [22, -59], [50, -62], [76, -74], [82, -70], [56, -52], [24, -50], [0, -52]];
    fl(k, at([...half, ...mirror(half).reverse()], tx), CB.hair);
    tearAt(k, tx + 30, -88, 0.75, r.tear); tearAt(k, tx - 24, -88, 0.7, r.tear * 0.7);
    k.g.save(); k.g.translate(-lift * 10, -lift * 40); capFront(k, 72, -178, -254, CB.cap, 10); k.g.restore();
  },
  sirSide: (k, r, lift) => {
    fl(k, spline([[-40, 8], [-62, -40], [-66, -120], [-50, -176], [-10, -196], [30, -190], [52, -162], [58, -126], [60, -112], [100, -82], [96, -74], [60, -74], [58, -60], [64, -40], [50, -6], [10, 10]]), CB.skin);
    ear(k, -30, -100, 14, 22, CB.skin);
    const [i, o] = browEnds(r, 36, -148, 0.8, 16, 1); ln(k, spline([i, [(i[0] + o[0]) / 2, Math.min(i[1], o[1]) - 6], o], false, 6), 0.95);
    eyeB(k, 36, -112, 0.95, { ...r, gaze: [Math.max(0.4, r.gaze[0]), r.gaze[1]] }, CB.skin, 1);
    monoRing(k, 36, -112, 20, 31, 5.5);
    mouthAt(k, 54, -38, 9 * (1 + 0.35 * r.mouth), 0.7, r);
    pipeAt(k, [60, -42], 0.78);
    fl(k, [[52, -64], [80, -66], [104, -78], [110, -73], [82, -54], [54, -54]], CB.hair);
    tearAt(k, 40, -88, 0.75, r.tear);
    k.g.save(); k.g.translate(-lift * 30, -lift * 40); k.g.rotate(-lift * 0.25); capSide(k, -70, 58, -178, -254, CB.cap, 44); k.g.restore();
  },
  otherFront: (k, r, tx) => {
    fl(k, spline([[-74, -150], [-84, -60], [-72, 30], [-40, 40], [40, 40], [72, 30], [84, -60], [74, -150], [40, -196], [-40, -196]]), ADA_HAIR_B);
    fl(k, sym([[0, 6], [38, 0], [58, -40], [62, -110], [54, -156], [34, -180], [0, -186]]), CB.skin);
    fl(k, spline([[-62, -110], [-62, -160], [-30, -194], [30, -194], [62, -160], [62, -110], [40, -146], [tx, -150], [-40, -146]]), ADA_HAIR_B);
    for (const s of [-1, 1]) { const [i, o] = browEnds(r, s * 24 + tx, -136, 0.75, 16, s); ln(k, spline([i, [(i[0] + o[0]) / 2, Math.min(i[1], o[1]) - 6], o], false, 6), 0.85); }
    for (const s of [-1, 1]) { eyeB(k, s * 24 + tx, -104, 0.95, r, CB.skin, -s); if (r.lid < 0.9 && r.squeeze < 0.5 && r.wide < 0.3) ln(k, [[s * 34 + tx, -122], [s * 42 + tx, -130]], 0.6); }
    fl(k, [[tx - 4, -100], [tx + 9, -70], [tx - 9, -68]], CB.nose);
    mouthAt(k, tx, -42, 13 * (1 + 0.35 * r.mouth), 0.75, r);
    tearAt(k, tx + 28, -82, 0.75, r.tear);
  },
  otherSide: (k, r) => {
    fl(k, spline([[-60, -170], [-96, -150], [-118, -90], [-108, -40], [-90, -60], [-80, -120]]), ADA_HAIR_B);
    fl(k, spline([[-40, 6], [-58, -40], [-62, -116], [-48, -168], [-10, -188], [28, -182], [50, -154], [56, -116], [58, -104], [80, -78], [58, -72], [56, -58], [60, -40], [46, -6], [8, 8]]), CB.skin);
    fl(k, spline([[-62, -100], [-66, -160], [-30, -192], [20, -194], [52, -168], [56, -140], [20, -150], [-20, -140], [-40, -100]]), ADA_HAIR_B);
    const [i, o] = browEnds(r, 34, -136, 0.75, 14, 1); ln(k, spline([i, [(i[0] + o[0]) / 2, Math.min(i[1], o[1]) - 5], o], false, 6), 0.85);
    eyeB(k, 34, -104, 0.9, { ...r, gaze: [Math.max(0.4, r.gaze[0]), r.gaze[1]] }, CB.skin, 1);
    mouthAt(k, 52, -42, 9 * (1 + 0.35 * r.mouth), 0.7, r);
    tearAt(k, 38, -82, 0.75, r.tear);
  },
};

// ======================= C: KLOSS — a square head, a barrel chest, short legs =======================
const CC: Col = { skin: "#e9b48c", nose: "#e58f74", hair: "#e4ddd0", cap: "#8a6a3a", coat: "#8a6a3a", vest: "#12b0a0", shirt: "#ffffff", tie: "#2b3f73", trous: "#3f4a5e", shoe: "#4a2a1a",
  dress: "#5b7fd1", stock: "#2b2530", collar: "#ffffff" };
const ADA_HAIR_C = "#1e1a1a";
const block = sym([[0, 6], [72, 4], [102, -22], [106, -100], [98, -172], [72, -198], [0, -204]]);
const C_SPEC: FlatSpec = {
  id: "flatC", name: "C Kloss", ol: 10, faceW: 140, turn: 30,
  sir: { P: { thigh: 90, shin: 80, ankle: 18, foot: 116, hipW: 52, shW: 100, spine: 230, shDrop: 26, neck: 6, head: 204, upper: 105, fore: 100, hand: 78 },
    B: { rows: [[-34, 64, 50, 46], [0, 68, 56, 48], [60, 92, 80, 58], [140, 112, 92, 64], [200, 110, 70, 56], [222, 80, 50, 40], [238, 30, 30, 26]], arm: [31, 27, 23], leg: [32, 28, 24], shoeW: 52, neck: 0 } },
  other: { P: { thigh: 86, shin: 76, ankle: 18, foot: 96, hipW: 46, shW: 78, spine: 200, shDrop: 22, neck: 6, head: 188, upper: 92, fore: 88, hand: 66 },
    B: { rows: [[-84, 94, 74, 68], [-30, 76, 62, 56], [0, 66, 54, 48], [80, 70, 58, 44], [160, 86, 60, 46], [184, 62, 42, 34], [200, 24, 22, 20]], arm: [24, 21, 18], leg: [18, 15, 13], shoeW: 40, neck: 0 } },
  col: CC, chainFront: [[-64, -100], [-92, -6]], chainSide: [[46, -88], [40, 10]], chainEnd: [-52, 120], chainW: 5, vest: [226, -6, 48],
  sirFront: (k, r, tx, lift) => {
    for (const s of [-1, 1]) fl(k, ellPts(s * 104, -100, 18, 28), CC.skin);
    fl(k, block, CC.skin);
    for (const s of [-1, 1]) { const [i, o] = browEnds(r, s * 40 + tx, -158, 1, 24, s), n: P2 = [0, -15]; fl(k, [i, o, add(o, n), add(i, n)], CC.hair); }
    for (const s of [-1, 1]) eyeC(k, s * 40 + tx, -122, 1, r, CC.skin, -s);
    monoRing(k, -40 + tx, -122, 38, 40, 7);
    mouthAt(k, tx + r.smirk * 4, -22, 24 * (1 + 0.25 * r.mouth), 1, r);
    pipeAt(k, [tx + 52, -30], 1.05);
    const half: P2[] = [[0, -72], [40, -76], [78, -68], [98, -40], [86, -24], [62, -36], [30, -30], [0, -38]];
    fl(k, at(spline([...half, ...mirror(half).reverse()]), tx), CC.hair);
    fl(k, ellPts(tx, -88, 30, 24), CC.nose);
    tearAt(k, tx + 48, -104, 1, r.tear); tearAt(k, tx - 34, -104, 0.9, r.tear * 0.7);
    k.g.save(); k.g.translate(-lift * 12, -lift * 50); capFront(k, 108, -184, -270, CC.cap, 10); k.g.restore();
  },
  sirSide: (k, r, lift) => {
    fl(k, spline([[-70, 6], [-100, -30], [-104, -120], [-92, -182], [-50, -206], [30, -206], [80, -186], [94, -140], [98, -112], [96, -74], [100, -30], [86, 0], [40, 8]]), CC.skin);
    ear(k, -36, -104, 18, 28, CC.skin);
    const [i, o] = browEnds(r, 56, -158, 0.9, 20, 1); fl(k, [i, o, add(o, [0, -14]), add(i, [0, -14])], CC.hair);
    eyeC(k, 56, -122, 0.85, { ...r, gaze: [Math.max(0.4, r.gaze[0]), r.gaze[1]] }, CC.skin, 1);
    monoRing(k, 56, -122, 30, 38, 7);
    mouthAt(k, 92, -24, 14 * (1 + 0.25 * r.mouth), 0.9, r);
    pipeAt(k, [118, -32], 1.05);
    fl(k, spline([[58, -74], [100, -72], [130, -56], [126, -28], [98, -30], [72, -34], [54, -50]]), CC.hair);
    fl(k, ellPts(112, -90, 30, 24), CC.nose);
    tearAt(k, 60, -104, 1, r.tear);
    k.g.save(); k.g.translate(-lift * 40, -lift * 50); k.g.rotate(-lift * 0.25); capSide(k, -108, 92, -184, -270, CC.cap, 50); k.g.restore();
  },
  otherFront: (k, r, tx) => {
    fl(k, spline([[-112, -40], [-118, -150], [-90, -206], [0, -216], [90, -206], [118, -150], [112, -40], [70, -30], [-70, -30]]), ADA_HAIR_C);
    fl(k, sym([[0, 6], [62, 4], [90, -22], [94, -96], [88, -160], [64, -184], [0, -190]]), CC.skin);
    fl(k, [[-96, -120], [-96, -186], [-60, -206], [60, -206], [96, -186], [96, -120], [70, -150], [-70, -150]], ADA_HAIR_C);
    for (const s of [-1, 1]) { const [i, o] = browEnds(r, s * 38 + tx, -140, 0.95, 20, s); fl(k, [i, o, add(o, [0, -10]), add(i, [0, -10])], ADA_HAIR_C); }
    for (const s of [-1, 1]) { eyeC(k, s * 38 + tx, -108, 0.95, r, CC.skin, -s); if (r.lid < 0.9 && r.squeeze < 0.5) ln(k, [[s * 62 + tx, -116], [s * 74 + tx, -124]], 0.7); }
    fl(k, ellPts(tx, -74, 16, 13), CC.nose);
    mouthAt(k, tx, -40, 22 * (1 + 0.3 * r.mouth), 0.95, r);
    tearAt(k, tx + 46, -92, 0.9, r.tear);
  },
  otherSide: (k, r) => {
    fl(k, spline([[-30, -40], [-108, -40], [-116, -150], [-80, -204], [10, -214], [70, -196], [40, -150], [-10, -100]]), ADA_HAIR_C);
    fl(k, spline([[-62, 6], [-90, -30], [-94, -120], [-84, -170], [-44, -192], [28, -192], [72, -172], [84, -130], [86, -100], [84, -66], [88, -30], [76, 0], [36, 8]]), CC.skin);
    fl(k, spline([[-96, -110], [-100, -180], [-40, -210], [40, -208], [84, -176], [82, -146], [30, -150], [-40, -140], [-70, -110]]), ADA_HAIR_C);
    const [i, o] = browEnds(r, 52, -140, 0.9, 16, 1); fl(k, [i, o, add(o, [0, -10]), add(i, [0, -10])], ADA_HAIR_C);
    eyeC(k, 52, -108, 0.85, { ...r, gaze: [Math.max(0.4, r.gaze[0]), r.gaze[1]] }, CC.skin, 1);
    if (r.lid < 0.9 && r.squeeze < 0.5) ln(k, [[72, -116], [84, -124]], 0.7);
    fl(k, ellPts(94, -78, 14, 12), CC.nose);
    mouthAt(k, 76, -40, 13 * (1 + 0.3 * r.mouth), 0.9, r);
    tearAt(k, 56, -92, 0.9, r.tear);
  },
};

export const FLAT_SPECS = [A_SPEC, B_SPEC, C_SPEC];
export const FLAT: Design[] = FLAT_SPECS.map(design);
/** the one-line description of each direction on the sheet */
export const FLAT_LINES = [
  "Stort runt huvud, halva längden. Liten rund kropp, korta ben. Ögon: höga vita ovaler med stor svart pupill. Knappnäsa, krullad mustasch.",
  "Lång och smal, litet bönformat huvud på lång hals, sex och ett halvt huvud lång. Ögon: svarta stående piller utan vitt. Lång spetsig näsa, smal vaxad mustasch. Väst över skjortärmar.",
  "Fyrkantigt huvud, bred tunnbröstkorg, korta ben. Ögon: kupoler med platt underkant där pupillen vilar. Stor rund näsa, yvig valrossmustasch som täcker munnen.",
];
/** the supporting figure: Ada, his assistant, in the same style */
export const OTHER_NAME = "ADA, ASSISTENTEN";
