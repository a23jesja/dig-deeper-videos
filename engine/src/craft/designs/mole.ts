// Direction A, "The mole": Digsworth digs. A velvet mole in tweed with no neck, a long pink snout, spade paws with claws, and one eye
// made huge by the monocle next to one small bead eye. The side characters are other burrowers (here a badger baker).
import { Ink, P2, sym, spline, ellPts, seg, mid, shade, eye, monocle, chain, HandKind, R } from "../ink";
import { Sk, Side, Props } from "../rig";
import { Design, FigOpts, Face, frame, torsoPts, J, limb, shoe, layers, headPose, headToWorld, loaf, thumbFlip } from "./common";
import { angle, len, sub } from "../ink";

const TWEED = "#a17d4b", TWEED_D = "#7a5c36", WEAVE = "rgba(74,50,26,0.33)", FUR = "#565b72", FUR_D = "#3c4055", FUR_L = "#7b819a", PINK = "#f4a9a0", PINK_D = "#d9837c";
const CREAM = "#f3ead4", VEST = "#cda23c", BOW = "#8f2f3d", TROUS = "#4b3323", BOOT = "#2c1f18", CLAW = "#f6eeda";
const BADGER = "#f2ede0", BADGER_D = "#d6cfbd", STRIPE = "#2c2831", GREY = "#8c8e99", GREY_D = "#6c6e7a", TUNIC = "#e8d6a4", APRON = "#f8f3e6";
const SIR: Props = { thigh: 62, shin: 52, ankle: 16, foot: 122, hipW: 64, shW: 102, spine: 255, shDrop: 46, neck: 0, head: 225, upper: 88, fore: 84, hand: 112 };
const BAKER: Props = { thigh: 74, shin: 60, ankle: 16, foot: 118, hipW: 66, shW: 108, spine: 270, shDrop: 46, neck: 0, head: 205, upper: 96, fore: 90, hand: 96 };

/** a digging paw: a broad palm and long claws */
const paw = (k: Ink, wrist: P2, deg: number, h: number, kind: HandKind, col: string, colD: string, flip: boolean, clawL = 1) => {
  const g = k.g; g.save(); g.translate(wrist[0], wrist[1]); g.rotate(deg * R); if (flip) g.scale(1, -1);
  const S = (pts: P2[]) => pts.map(([x, y]) => [x * h, y * h] as P2), spread = kind === "open" ? 1.75 : kind === "relaxed" ? 1.15 : 1, curl = kind === "fist" || kind === "grip";
  const claws = [-0.3, -0.1, 0.1, 0.3].map((y, i) => seg([0.6 * h, y * h], [(0.6 + (curl ? 0.2 : 0.46 - 0.04 * Math.abs(i - 1.5)) * clawL) * h, y * spread * h * (curl ? 1 : 1.2)], 0.085 * h, (curl ? 0.06 : 0.018) * h));
  claws.push(seg([0.26 * h, 0.32 * h], [(0.26 + 0.2 * clawL) * h, (0.36 + 0.28 * clawL) * h], 0.075 * h, 0.018 * h));
  if (kind === "point") claws[1] = seg([0.6 * h, -0.1 * h], [1.2 * h, -0.12 * h], 0.09 * h, 0.02 * h);
  k.group(claws, CLAW, k.ol * 0.8);
  const palm = spline(S([[0, -0.24], [0.24, -0.4], [0.54, -0.43], [0.72, -0.22], [0.72, 0.2], [0.56, 0.41], [0.24, 0.38], [0, 0.24]]), true, 5);
  k.shape(palm, col); k.shadeEdge(palm, colD, h * 0.1, h * 0.06); k.shape(palm, null);
  g.restore();
};

const pipe = (k: Ink, a: P2, b: P2) => {
  k.line([a, b], 15); k.line([a, b], 8, "#3a2618");
  const bowl: P2[] = [[b[0] - 12, b[1] - 32], [b[0] + 24, b[1] - 32], [b[0] + 20, b[1] + 8], [b[0] - 8, b[1] + 8]];
  k.shape(bowl, "#6b3f22"); k.shadeEdge(bowl, "#4a2a16", 8, 0); k.shape(bowl, null); k.line([bowl[0], bowl[1]], 7, "#2c1a10");
};
const cap = (k: Ink, crown: P2[], peak: P2[], button: P2, c: P2, lift: number, dir: number) => {
  k.g.save(); k.g.translate(c[0] - lift * 26 * dir, c[1] - lift * 40); k.g.rotate(-lift * 0.3 * dir); k.g.translate(-c[0], -c[1]);
  const cr = spline(crown); k.shape(cr, TWEED, 0); k.tweed(cr, WEAVE, c, 8); k.shadeEdge(cr, TWEED_D, 16 * dir, 12); k.shape(cr, null);
  k.shape(spline(peak), TWEED_D); k.shape(ellPts(button[0], button[1], 12, 6), TWEED_D);
  k.g.restore();
};

const sirFront = (k: Ink, f: Face, tx: number, lift: number) => {
  const head = spline(sym([[0, 36], [72, 28], [126, -4], [136, -70], [112, -140], [66, -194], [0, -212]]));
  k.shape(head, FUR, 0); k.shadeEdge(head, FUR_D, 24, 10);
  k.clip(head, () => k.shape(ellPts(tx, -56, 76, 54), FUR_L, 0));
  k.shape(head, null);
  k.g.save(); k.g.translate(tx, 0);
  if ((f.mouth ?? 0) > 0.05) { const m = ellPts(0, -12, 22, 6 + 20 * f.mouth!); k.shape(m, "#5a1e28", k.ol * 0.6); k.clip(m, () => k.shape(ellPts(0, 2 + 8 * f.mouth!, 14, 10), "#e86e78", 0)); }
  else k.line(spline([[-16, -12], [0, -6], [16, -12]], false, 6), k.ol * 0.5);
  pipe(k, [26, -26], [84, 0]);
  for (const s of [-1, 1]) {
    const m = spline(([[0, -54], [34, -62], [80, -54], [118, -60], [142, -86], [137, -52], [112, -28], [70, -22], [30, -30], [0, -38]] as P2[]).map(([x, y]) => [x * s, y] as P2));
    k.shape(m, CREAM); k.line(spline(([[26, -44], [70, -38], [112, -44]] as P2[]).map(([x, y]) => [x * s, y] as P2), false, 5), k.ol * 0.35, "#c9bd9f");
  }
  const sn = spline([[-24, -92], [0, -98], [24, -92], [28, -76], [0, -56], [-28, -76]]); k.shape(sn, PINK); k.shadeEdge(sn, PINK_D, 9, 7); k.shape(sn, null);
  k.dot(-10, -86, 5, "#ffffff"); k.line([[-9, -70], [-5, -66]], 3.5); k.line([[9, -70], [5, -66]], 3.5);
  const w = 1 + 0.25 * (f.wide ?? 0), lid = f.lid ?? 0.16, b = (f.brow ?? 0) * 9;
  // the eye behind the glass is magnified, the other one is a bead
  eye(k, -54, -130, 28, 30 * w, { skin: FUR, gaze: f.gaze, lid });
  eye(k, 56, -128, 13, 14 * w, { skin: FUR, gaze: f.gaze, lid, iris: 0.7 });
  monocle(k, -54, -130, 37, 38);
  k.line(spline([[-86, -174 - b], [-54, -184 - b], [-22, -172 - b * 0.4]], false, 6), 10, CREAM);
  k.line(spline([[36, -152 - b * 0.4], [58, -160 - b], [80, -150 - b]], false, 6), 9, CREAM);
  k.g.restore();
  cap(k, [[-92, -176], [-108, -206], [-74, -242], [0, -254], [78, -244], [110, -210], [96, -178], [0, -170]], [[-88, -180], [-54, -164], [0, -154], [54, -164], [88, -180], [0, -176]], [4, -255], [0, -212], lift, 1);
};
const sirSide = (k: Ink, f: Face, lift: number) => {
  const head = spline([[-102, 30], [-118, -60], [-98, -140], [-52, -194], [8, -206], [60, -180], [102, -142], [148, -112], [184, -94], [196, -76], [184, -58], [150, -46], [106, -30], [72, -4], [40, 26], [-30, 38]]);
  k.shape(head, FUR, 0); k.shadeEdge(head, FUR_D, -22, 12);
  k.clip(head, () => k.shape(ellPts(132, -66, 64, 36, -22), FUR_L, 0));
  k.shape(head, null);
  if ((f.mouth ?? 0) > 0.05) k.shape(ellPts(98, -22, 12, 5 + 16 * f.mouth!, -20), "#5a1e28", k.ol * 0.6);
  pipe(k, [110, -26], [166, -2]);
  const m = spline([[170, -56], [140, -64], [100, -52], [72, -32], [54, -44], [52, -66], [40, -36], [58, -8], [96, -10], [136, -30], [168, -42]]);
  k.shape(m, CREAM); k.line(spline([[146, -50], [104, -34], [66, -22]], false, 5), k.ol * 0.35, "#c9bd9f");
  const sn = ellPts(190, -76, 22, 20); k.shape(sn, PINK); k.shadeEdge(sn, PINK_D, -7, 7); k.shape(sn, null); k.dot(196, -84, 5, "#ffffff");
  const w = 1 + 0.25 * (f.wide ?? 0), b = (f.brow ?? 0) * 9;
  eye(k, 54, -134, 21, 28 * w, { skin: FUR, gaze: f.gaze ?? [0.5, 0], lid: f.lid ?? 0.16 });
  monocle(k, 54, -134, 28, 37);
  k.line(spline([[26, -176 - b], [56, -186 - b], [84, -170 - b * 0.4]], false, 6), 10, CREAM);
  cap(k, [[-92, -160], [-104, -204], [-66, -244], [0, -252], [52, -236], [76, -206], [66, -180], [0, -168]], [[34, -192], [80, -186], [126, -168], [128, -158], [78, -168], [38, -174]], [-6, -252], [0, -206], lift, -1);
};
const bakerFront = (k: Ink, f: Face, tx: number) => {
  const head = spline(sym([[0, 36], [66, 28], [112, 0], [122, -62], [104, -130], [64, -178], [0, -194]]));
  for (const s of [-1, 1]) { k.shape(ellPts(s * 88, -172, 27, 27), STRIPE); k.shape(ellPts(s * 88, -170, 13, 13), GREY, 0); }
  k.shape(head, BADGER, 0); k.shadeEdge(head, BADGER_D, 22, 10);
  k.clip(head, () => { for (const s of [-1, 1]) k.shape(spline(([[8, -46], [44, -62], [72, -118], [90, -200], [38, -204], [28, -132], [6, -84]] as P2[]).map(([x, y]) => [x * s + tx, y] as P2)), STRIPE, 0); });
  k.shape(head, null);
  k.g.save(); k.g.translate(tx, 0);
  k.line(spline([[-30, -24], [-12, -12], [0, -16], [12, -12], [30, -24]], false, 6), k.ol * 0.7);
  if ((f.mouth ?? 0) > 0.05) k.shape(ellPts(0, -8, 20, 6 + 16 * f.mouth!), "#5a1e28", k.ol * 0.6);
  k.shape(spline([[-26, -62], [0, -70], [26, -62], [14, -40], [0, -34], [-14, -40]]), STRIPE); k.dot(-8, -60, 5, "#8c8894");
  for (const s of [-1, 1]) eye(k, s * 48, -118, 15, 17 * (1 + 0.25 * (f.wide ?? 0)), { skin: STRIPE, gaze: f.gaze, lid: f.lid ?? 0.1, ol: 0 });
  k.g.restore();
};
const bakerSide = (k: Ink, f: Face) => {
  const head = spline([[-96, 30], [-110, -60], [-92, -134], [-48, -182], [8, -192], [58, -170], [96, -130], [136, -98], [160, -80], [166, -62], [148, -46], [104, -28], [70, -2], [40, 26], [-30, 38]]);
  k.shape(ellPts(-34, -176, 25, 25), STRIPE); k.shape(ellPts(-34, -174, 12, 12), GREY, 0);
  k.shape(head, BADGER, 0); k.shadeEdge(head, BADGER_D, -20, 12);
  k.clip(head, () => k.shape(spline([[166, -84], [104, -118], [54, -156], [4, -200], [-40, -176], [26, -118], [92, -80], [150, -56]]), STRIPE, 0));
  k.shape(head, null);
  k.line(spline([[92, -22], [110, -24], [126, -36]], false, 5), k.ol * 0.7);
  if ((f.mouth ?? 0) > 0.05) k.shape(ellPts(104, -20, 12, 5 + 14 * f.mouth!, -20), "#5a1e28", k.ol * 0.6);
  k.shape(ellPts(160, -70, 17, 15), STRIPE); k.dot(164, -76, 4, "#8c8894");
  eye(k, 62, -126, 13, 17 * (1 + 0.25 * (f.wide ?? 0)), { skin: STRIPE, gaze: f.gaze ?? [0.5, 0], lid: f.lid ?? 0.1, ol: 0 });
};

const draw = (k: Ink, sk: Sk, o: FigOpts) => {
  const baker = o.who === "baker", F = frame(sk), P = sk.P, f = o.face ?? {}, hp = headPose(sk), front = sk.cos > 0.35, d = Math.sign(sk.sin) || 1, sideOn = Math.abs(sk.sin) > 0.6;
  const fur = baker ? GREY : FUR, furD = baker ? GREY_D : FUR_D;
  const leg = (s: Side) => {
    const H = J(sk, "hip", s), K = J(sk, "kn", s), A = J(sk, "an", s), col = baker ? fur : TROUS;
    const pc = limb(H, K, A, [48, 42, 32]); k.group(pc, col); for (const q of pc) k.shadeEdge(q, shade(col, 0.74), 10, 4);
    shoe(k, sk, s, baker ? "#7a4a2a" : BOOT, 66, { hA: 0.3, hT: 0.24 });
  };
  const arm = (s: Side) => {
    const S = J(sk, "sh", s), E = J(sk, "el", s), W = J(sk, "wr", s), T = J(sk, "tip", s), kind = (s === "L" ? o.handL : o.handR) ?? "relaxed";
    const pc = limb(S, E, W, [36, 31, 27]), col = baker ? fur : TWEED;
    k.group(pc, col); for (const q of pc) { if (!baker) k.tweed(q, WEAVE, S, 0, 15); k.shadeEdge(q, baker ? furD : TWEED_D, 11, 5); }
    if (baker) { const c = seg(S, mid(S, E, 0.55), 40, 37); k.group([c], TUNIC); k.shadeEdge(c, shade(TUNIC, 0.8), 10, 4); }
    else k.group([seg(mid(E, W, 0.84), mid(E, W, 1.04), 27, 27, 0, 0.3, true)], CREAM);
    if (o.prop === "loaf" && s === "L") loaf(k, mid(W, T, 0.8), 52);
    paw(k, W, len(sub(T, W)) > 6 ? angle(W, T) : angle(E, W), P.hand, kind, baker ? STRIPE : PINK, baker ? "#1c1920" : PINK_D, thumbFlip(sk, s), baker ? 0.55 : 1);
  };
  const tail = () => { if (!sideOn || baker) return; const a = F.T(-104 * d, 10), b = F.T(-178 * d, -30); const t = seg(a, b, 15, 5); k.group([t], PINK); k.shadeEdge(t, PINK_D, 4, 5); };
  const torso = () => {
    const t = torsoPts(sk, [[-44, 112, 104, 108], [0, 142, 136, 120], [80, 150, 150, 118], [160, 130, 122, 106], [214, 108, 86, 92], [252, 88, 62, 82]]);
    if (baker) {
      k.shape(t, TUNIC, 0); k.shadeEdge(t, shade(TUNIC, 0.8), 24, 8);
      if (front) k.clip(t, () => k.shape([F.Q(-60, 0, 200), F.Q(60, 0, 200), F.Q(94, 0, -60), F.Q(-94, 0, -60)], APRON, k.ol * 0.6));
      else if (sideOn) k.shadeEdge(t, APRON, 34 * d, 0);
      k.clip(t, () => k.line([F.T(-220, 60), F.T(220, 60)], 13, "#8a5a3a", "butt"));
      k.shape(t, null); return;
    }
    k.shape(t, TWEED, 0); k.tweed(t, WEAVE, F.o, F.tilt, 15); k.shadeEdge(t, TWEED_D, 26, 8);
    if (front) {
      const v = [F.Q(-52, 0, 232), F.Q(52, 0, 232), F.Q(76, 0, 70), F.Q(46, 0, -44), F.Q(-46, 0, -44), F.Q(-76, 0, 70)];
      k.clip(t, () => { k.shape(v, VEST, k.ol * 0.6); k.shape([F.Q(-30, 0, 240), F.Q(30, 0, 240), F.Q(0, 0, 176)], CREAM, k.ol * 0.5); });
      for (const a of [130, 80, 30]) k.dot(...F.Q(0, 0, a), 7, "#6b4a1e");
      k.line(spline([F.Q(-58, 0, 60), F.Q(-20, 0, 38), F.Q(0, 0, 78)], false, 6), 4, "#e9b93a");
      for (const s of [-1, 1]) k.shape([F.Q(s * 50, 0, 240), F.Q(s * 96, 0, 196), F.Q(s * 80, 0, 150), F.Q(s * 60, 0, 60)], shade(TWEED, 1.1), k.ol * 0.6);
      const c = F.Q(0, 0, 226); for (const s of [-1, 1]) k.shape([c, F.Q(s * 38, 0, 244), F.Q(s * 38, 0, 208)], BOW, k.ol * 0.6); k.dot(c[0], c[1], 9, shade(BOW, 0.8));
    } else if (sideOn) { k.shadeEdge(t, VEST, 30 * d, 0); k.line([F.T(126 * d, 150), F.T(140 * d, 60)], k.ol * 0.5); }
    k.shape(t, null);
  };
  const head = () => {
    k.at(sk.j.skull[0], sk.j.skull[1], sk.headTilt, hp.side && hp.flip, () => {
      if (baker) (hp.side ? bakerSide(k, f) : bakerFront(k, f, hp.turn * 22));
      else (hp.side ? sirSide(k, f, o.capLift ?? 0) : sirFront(k, f, hp.turn * 22, o.capLift ?? 0));
    });
    if (baker) return;
    const w = headToWorld(sk, hp.side && hp.flip);
    if (hp.side) { const a = w([35, -106]), b = F.T(74 * d, 196); chain(k, a, b, [(a[0] + b[0]) / 2 - 22 * d, (a[1] + b[1]) / 2 + 26]); }
    else chain(k, w([-80 + hp.turn * 22, -104]), F.Q(-62, 0, 190), w([-150, -30]));
  };
  layers(sk, { arm, leg, torso, head, tail });
};

export const MOLE: Design = { id: "mole", name: "Mullvaden", ol: 9, faceW: 152, props: (w) => (w === "baker" ? BAKER : SIR), draw };
