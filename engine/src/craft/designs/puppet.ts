// Direction D, "The jointed card puppet": the figure is what it is in the engine, a flat card in a 3D world, and shows it. Every part is
// a piece of printed card that casts a small shadow on the piece under it, held together with brass pins at the joints. The jaw is a
// hinged piece (it drops when he speaks) and the moustache is pinned on. Thin line, flat colour, a printed herringbone.
import { Ink, P2, sym, spline, ellPts, seg, mid, shade, chain, shift, hand, angle, len, sub } from "../ink";
import { Sk, Side, Props } from "../rig";
import { Design, FigOpts, Face, frame, torsoPts, J, shoePts, layers, headPose, headToWorld, loaf, thumbFlip } from "./common";

const LINE = "#3a2a1e", TWEED = "#b48e54", TWEED_D = "#8a6a3c", WEAVE = "rgba(80,54,26,0.42)", SKIN = "#f3caa2", SKIN_D = "#e0aa80", MOUS = "#5c3a1f", CREAM = "#f6efdc";
const TROUS = "#5d4b3b", SHOE = "#3c2a20", BOW = "#a23a44", BRASS = "#e2b84a", TUNIC = "#ead9a8", APRON = "#f9f4e8", HAIR = "#4a3020";
const SIR: Props = { thigh: 195, shin: 180, ankle: 25, foot: 126, hipW: 58, shW: 106, spine: 290, shDrop: 30, neck: 26, head: 215, upper: 150, fore: 140, hand: 86 };
const BAKER: Props = { thigh: 170, shin: 160, ankle: 24, foot: 122, hipW: 64, shW: 114, spine: 280, shDrop: 30, neck: 22, head: 196, upper: 145, fore: 132, hand: 88 };

/** a piece of card: its shadow on what lies under it, then the card with a thin line */
const piece = (k: Ink, pts: P2[], fill: string, weave?: P2) => {
  k.shape(shift(pts, 6, 7), "rgba(52,32,16,0.26)", 0); k.shape(pts, fill, 0); if (weave) k.tweed(pts, WEAVE, weave, 0, 14, 2.4); k.shape(pts, null);
};
const pin = (k: Ink, p: P2, r = 9) => { k.dot(p[0] + 2, p[1] + 3, r, "rgba(52,32,16,0.3)"); k.dot(p[0], p[1], r, "#7d5f1a"); k.dot(p[0], p[1], r - 2, BRASS); k.dot(p[0] - r * 0.3, p[1] - r * 0.3, r * 0.3, "#fff4c4"); k.line([[p[0] - r * 0.45, p[1] + r * 0.2], [p[0] + r * 0.45, p[1] - r * 0.2]], 1.6, "#7d5f1a"); };
/** a paper eye: a white disc, a pupil disc that slides, and a lid that is its own piece */
const disc = (k: Ink, cx: number, cy: number, r: number, f: Face, skin: string, gz0: P2 = [0, 0]) => {
  const rr = r * (1 + 0.14 * (f.wide ?? 0)), ball = ellPts(cx, cy, rr, rr), gz = f.gaze ?? gz0, lid = f.lid ?? 0.16;
  k.shape(ball, "#fffdf6");
  k.clip(ball, () => {
    const px = cx + gz[0] * rr * 0.5, py = cy + gz[1] * rr * 0.5; k.dot(px, py, rr * 0.46, "#2a1f1a"); k.dot(px - rr * 0.16, py - rr * 0.18, rr * 0.15, "#ffffff");
    if (lid > 0.01) { const y = cy - rr + 2 * rr * lid; k.shape([[cx - rr - 2, cy - rr - 2], [cx + rr + 2, cy - rr - 2], [cx + rr + 2, y], [cx - rr - 2, y]], shade(skin, 0.88), 0); k.line([[cx - rr - 2, y], [cx + rr + 2, y]], 4, LINE, "butt"); }
  });
  k.shape(ball, null);
};
const ring = (k: Ink, cx: number, cy: number, r: number) => { k.shape(ellPts(cx + 3, cy + 4, r, r), null, 0); k.shape(ellPts(cx, cy, r, r), null, 11); const i = k.ink; k.ink = BRASS; k.shape(ellPts(cx, cy, r, r), null, 7); k.ink = i; };
const pipe = (k: Ink, a: P2, b: P2) => {
  piece(k, seg(a, b, 5, 5, 0, 0.3, true), "#3a2618");
  piece(k, [[b[0] - 12, b[1] - 30], [b[0] + 22, b[1] - 30], [b[0] + 18, b[1] + 8], [b[0] - 8, b[1] + 8]], "#7a4a2a");
};

const sirFront = (k: Ink, f: Face, tx: number, lift: number) => {
  const m = f.mouth ?? 0, head = spline(sym([[0, 6], [58, 6], [84, -18], [87, -100], [86, -172], [62, -208], [0, -213]]), true, 5);
  for (const s of [-1, 1]) piece(k, ellPts(s * 88, -112, 19, 26), SKIN_D);
  piece(k, head, SKIN);
  k.g.save(); k.g.translate(tx, 0);
  // the hinged jaw: it slides down over a dark card
  if (m > 0.05) { k.shape([[-42, -46], [42, -46], [38, -22 + 20 * m], [-38, -22 + 20 * m]], "#4a1a22", 0); k.shape(ellPts(0, -24 + 16 * m, 20, 9), "#e0707a", 0); }
  const jaw = shift(spline(sym([[0, 6], [58, 6], [82, -16], [78, -42], [0, -38]]), true, 4), 0, 20 * m);
  k.clip(shift(head, 0, 20 * m), () => piece(k, jaw, shade(SKIN, 0.97)));
  pipe(k, [24, -40 + 10 * m], [78, -18 + 10 * m]);
  piece(k, sym([[0, -56], [50, -48], [96, -52], [122, -74], [125, -110], [112, -86], [78, -72], [36, -80], [0, -75]]), MOUS); pin(k, [0, -66], 5);
  piece(k, [[0, -132], [-18, -78], [18, -78]], SKIN_D);
  disc(k, -37, -130, 23, f, SKIN); disc(k, 37, -130, 23, f, SKIN);
  ring(k, -37, -130, 31);
  const b = (f.brow ?? 0) * 9; for (const s of [-1, 1]) piece(k, [[s * 12, -160 - b * 0.4], [s * 60, -172 - b], [s * 62, -160 - b], [s * 14, -149 - b * 0.4]], MOUS);
  k.g.restore();
  k.g.save(); k.g.translate(-lift * 14, -lift * 40);
  piece(k, spline([[-100, -170], [-106, -206], [-66, -240], [0, -250], [70, -242], [108, -208], [102, -170]], true, 5), TWEED, [0, -200]);
  piece(k, [[-94, -172], [-50, -152], [0, -145], [50, -152], [94, -172], [0, -167]], TWEED_D); pin(k, [2, -246], 6);
  k.g.restore();
};
const sirSide = (k: Ink, f: Face, lift: number) => {
  const m = f.mouth ?? 0, head = spline([[-40, 6], [-80, -10], [-88, -60], [-87, -170], [-60, -208], [20, -213], [58, -196], [67, -150], [67, -30], [50, 2], [0, 8]], true, 5);
  piece(k, head, SKIN);
  if (m > 0.05) k.shape([[10, -46], [66, -46], [64, -40 + 26 * m], [14, -36 + 16 * m]], "#4a1a22", 0);
  k.g.save(); k.g.translate(-30, -44); k.g.rotate(-m * 0.24); k.g.translate(30, 44);
  piece(k, [[-30, -44], [67, -44], [67, -30], [50, 2], [0, 8], [-38, 4]], shade(SKIN, 0.97)); pin(k, [-30, -40], 5);
  k.g.restore();
  piece(k, ellPts(-20, -112, 17, 25), SKIN_D);
  pipe(k, [58, -40 + 8 * m], [108, -22 + 8 * m]);
  piece(k, [[80, -62], [54, -50], [12, -46], [-12, -60], [-16, -94], [4, -72], [40, -84], [80, -78]], MOUS);
  piece(k, [[60, -134], [106, -84], [60, -78]], SKIN_D);
  disc(k, 30, -130, 21, f, SKIN, [0.6, 0]);
  ring(k, 30, -130, 28);
  const b = (f.brow ?? 0) * 9; piece(k, [[10, -160 - b], [58, -168 - b * 0.4], [58, -156 - b * 0.4], [12, -149 - b]], MOUS);
  k.g.save(); k.g.translate(-lift * 34, -lift * 38);
  piece(k, spline([[-96, -168], [-104, -206], [-60, -242], [10, -250], [58, -234], [76, -200], [72, -170]], true, 5), TWEED, [0, -200]);
  piece(k, [[40, -186], [128, -168], [128, -156], [48, -166]], TWEED_D);
  k.g.restore();
};
const curls = (pts: P2[]) => pts.map(([x, y]) => ellPts(x, y, 24, 22));
const bakerFront = (k: Ink, f: Face, tx: number) => {
  const m = f.mouth ?? 0, head = spline(sym([[0, 6], [66, 6], [94, -18], [97, -100], [94, -150], [70, -188], [0, -194]]), true, 5);
  for (const s of [-1, 1]) piece(k, ellPts(s * 98, -100, 18, 25), SKIN_D);
  piece(k, head, shade(SKIN, 0.95));
  for (const c of curls([[-78, -170], [-44, -192], [0, -200], [44, -192], [78, -170]])) piece(k, c, HAIR);
  k.g.save(); k.g.translate(tx, 0);
  if (m > 0.05) k.shape([[-40, -42], [40, -42], [36, -20 + 20 * m], [-36, -20 + 20 * m]], "#4a1a22", 0);
  k.clip(shift(head, 0, 20 * m), () => piece(k, shift(spline(sym([[0, 6], [66, 6], [92, -16], [88, -40], [0, -34]]), true, 4), 0, 20 * m), shade(SKIN, 0.92)));
  k.line(spline([[-34, -56], [0, -44], [34, -56]], false, 6), 5, LINE);
  piece(k, ellPts(0, -84, 19, 17), SKIN_D);
  disc(k, -40, -118, 21, { lid: 0.08, ...f }, SKIN); disc(k, 40, -118, 21, { lid: 0.08, ...f }, SKIN);
  for (const s of [-1, 1]) piece(k, [[s * 16, -148], [s * 62, -154], [s * 62, -144], [s * 18, -139]], HAIR);
  k.g.restore();
};
const bakerSide = (k: Ink, f: Face) => {
  const m = f.mouth ?? 0, head = spline([[-40, 6], [-88, -10], [-96, -60], [-94, -150], [-66, -190], [20, -195], [60, -178], [70, -140], [70, -30], [52, 2], [0, 8]], true, 5);
  piece(k, head, shade(SKIN, 0.95));
  for (const c of curls([[-84, -150], [-66, -182], [-26, -198], [16, -198]])) piece(k, c, HAIR);
  if (m > 0.05) k.shape([[10, -42], [68, -42], [66, -36 + 24 * m], [14, -32 + 16 * m]], "#4a1a22", 0);
  k.g.save(); k.g.translate(-30, -40); k.g.rotate(-m * 0.24); k.g.translate(30, 40);
  piece(k, [[-30, -40], [70, -40], [70, -30], [52, 2], [0, 8], [-40, 4]], shade(SKIN, 0.92));
  k.g.restore();
  piece(k, ellPts(-18, -100, 16, 24), SKIN_D);
  k.line([[34, -52], [66, -54]], 5, LINE);
  piece(k, ellPts(76, -88, 20, 17), SKIN_D);
  disc(k, 34, -118, 19, { lid: 0.08, ...f }, SKIN, [0.6, 0]);
  piece(k, [[14, -146], [60, -152], [60, -142], [16, -137]], HAIR);
};

const draw = (k: Ink, sk: Sk, o: FigOpts) => {
  const ink0 = k.ink; k.ink = LINE;
  const baker = o.who === "baker", F = frame(sk), P = sk.P, f = o.face ?? {}, hp = headPose(sk), front = sk.cos > 0.35, d = Math.sign(sk.sin) || 1, sideOn = Math.abs(sk.sin) > 0.6;
  const skin = baker ? shade(SKIN, 0.95) : SKIN;
  const leg = (s: Side) => {
    const H = J(sk, "hip", s), K = J(sk, "kn", s), A = J(sk, "an", s);
    const sp = shoePts(sk, s, 54, baker ? 0.28 : 0.36, baker ? 0.15 : 0.2);
    if (baker) { piece(k, seg(K, A, 26, 17, 6), skin); piece(k, sp.pts, "#8a5a36"); piece(k, seg(H, K, 36, 27), skin); }
    else { piece(k, seg(K, A, 29, 20, 4), TROUS); piece(k, sp.pts, SHOE); piece(k, seg(H, K, 40, 30), TROUS); }
    pin(k, K, 8); pin(k, A, 6);
  };
  const arm = (s: Side) => {
    const S = J(sk, "sh", s), E = J(sk, "el", s), W = J(sk, "wr", s), T = J(sk, "tip", s), kind = (s === "L" ? o.handL : o.handR) ?? "relaxed";
    if (o.prop === "loaf" && s === "L") loaf(k, mid(W, T, 0.9), 52);
    const hs = () => hand(k, W, len(sub(T, W)) > 6 ? angle(W, T) : angle(E, W), P.hand, kind, skin, thumbFlip(sk, s), false, k.ol);
    if (baker) { hs(); piece(k, seg(E, W, 23, 16, 5), skin); piece(k, seg(S, E, 29, 23), skin); piece(k, seg(S, mid(S, E, 0.5), 35, 32), TUNIC); }
    else { piece(k, seg(mid(E, W, 0.84), mid(E, W, 1.05), 15, 15, 0, 0.3, true), CREAM); hs(); piece(k, seg(E, W, 25, 18, 3), TWEED, E); piece(k, seg(S, E, 32, 25), TWEED, S); }
    pin(k, S, 9); pin(k, E, 8); pin(k, W, 6);
  };
  const torso = () => {
    piece(k, seg(F.T(0, P.spine - 20), sk.j.skull, 26, 26, 0, 0.3, true), skin);
    if (baker) {
      const t = torsoPts(sk, [[-170, 118, 84, 88], [-20, 108, 86, 80], [150, 104, 84, 74], [258, 116, 66, 66], [282, 62, 42, 46]]);
      piece(k, t, TUNIC);
      if (front) piece(k, [F.Q(-54, 0, 200), F.Q(54, 0, 200), F.Q(76, 0, -150), F.Q(-76, 0, -150)], APRON);
      k.clip(t, () => k.line([F.T(-220, 70), F.T(220, 70)], 13, "#9a5a3a", "butt"));
    } else {
      const t = torsoPts(sk, [[-66, 98, 72, 74], [0, 94, 74, 72], [150, 98, 80, 72], [262, 112, 66, 66], [288, 62, 42, 46]]);
      piece(k, t, TWEED, F.o);
      if (front) {
        piece(k, [F.Q(-26, 0, 288), F.Q(26, 0, 288), F.Q(0, 0, 170)], CREAM);
        for (const s of [-1, 1]) piece(k, [F.Q(s * 26, 0, 290), F.Q(s * 70, 0, 244), F.Q(s * 52, 0, 218), F.Q(0, 0, 150)], shade(TWEED, 1.12));
        for (const a of [110, 50, -10]) pin(k, F.Q(0, 0, a), 6);
        for (const s of [-1, 1]) piece(k, [F.Q(0, 0, 276), F.Q(s * 38, 0, 294), F.Q(s * 38, 0, 258)], BOW); pin(k, F.Q(0, 0, 276), 6);
      } else if (sideOn) { const c = F.T(40 * d, 274); piece(k, [c, [c[0] + 30 * d, c[1] - 17], [c[0] + 30 * d, c[1] + 17]], BOW); }
    }
    pin(k, sk.j.hipL, 8); if (!sideOn) pin(k, sk.j.hipR, 8);
  };
  const head = () => {
    k.at(sk.j.skull[0], sk.j.skull[1], sk.headTilt, hp.side && hp.flip, () => {
      if (baker) (hp.side ? bakerSide(k, f) : bakerFront(k, f, hp.turn * 18));
      else (hp.side ? sirSide(k, f, o.capLift ?? 0) : sirFront(k, f, hp.turn * 18, o.capLift ?? 0));
    });
    if (baker) return;
    const w = headToWorld(sk, hp.side && hp.flip);
    if (hp.side) { const a = w([12, -108]), b = F.T(56 * d, 230); chain(k, a, b, [(a[0] + b[0]) / 2 - 20 * d, (a[1] + b[1]) / 2 + 24], 6, BRASS); }
    else chain(k, w([-59 + hp.turn * 18, -108]), F.Q(-52, 0, 236), w([-104, -30]), 6, BRASS);
  };
  layers(sk, { arm, leg, torso, head });
  k.ink = ink0;
};

export const PUPPET: Design = { id: "puppet", name: "Sprattelgubben", ol: 4.5, faceW: 132, props: (w) => (w === "baker" ? BAKER : SIR), draw };
