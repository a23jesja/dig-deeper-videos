// Direction B, "The woodcut": people cut out of wood. Every form is straight-edged, shadows are cut as parallel lines beside a solid
// black edge, colours are few and muted on cream paper. Sir Digsworth is tall and square with a wedge of a moustache.
import { Ink, P2, sym, ellPts, seg, mid, shade, monocle, chain, shift, clamp } from "../ink";
import { Sk, Side, Props } from "../rig";
import { Design, FigOpts, Face, frame, torsoPts, J, limb, handAt, shoePts, layers, headPose, headToWorld, loaf } from "./common";

const INKW = "#231a16", PAPER = "#efe4ca", SKIN = "#dfbd92", TWEED = "#a98a4a", TWEED_D = "#7f6434", RUST = "#9b4b32", GREEN = "#55634f", GOLDM = "#c9a03c";
const TUNIC = "#c9b27a", APRON = "#efe6cf", WEAVE = "rgba(35,26,22,0.3)";
const SIR: Props = { thigh: 235, shin: 215, ankle: 30, foot: 138, hipW: 52, shW: 112, spine: 300, shDrop: 18, neck: 42, head: 172, upper: 165, fore: 150, hand: 80 };
const BAKER: Props = { thigh: 200, shin: 190, ankle: 28, foot: 132, hipW: 60, shW: 122, spine: 290, shDrop: 18, neck: 34, head: 172, upper: 160, fore: 146, hand: 84 };

/** the cut shadow of a part: a solid black edge and parallel lines beside it, on the side away from the light */
const cut = (k: Ink, pts: P2[], dx = 22, dy = 9, deg = 58, gap = 9, w = 3.4) => {
  const g = k.g; g.save(); g.beginPath(); k.trace(pts); g.clip();
  g.beginPath(); g.rect(-4000, -4000, 8000, 8000); k.trace(shift(pts, -dx, -dy)); g.clip("evenodd");
  k.hatch(pts, deg, gap, w, INKW);
  g.restore(); k.shadeEdge(pts, INKW, dx * 0.22, dy * 0.22);
};
const part = (k: Ink, pts: P2[], fill: string, dx = 22, dy = 9, weave = false, o: P2 = [0, 0]) => {
  k.shape(pts, fill, 0); if (weave) k.tweed(pts, WEAVE, o, 0, 19, 2.4); cut(k, pts, dx, dy); k.shape(pts, null);
};
/** an eye cut as an almond: paper white, a black pupil that moves, a heavy upper lid */
const almond = (k: Ink, cx: number, cy: number, hw: number, f: Face, gz0: P2 = [0, 0]) => {
  const up = 13 * (1 + 0.5 * (f.wide ?? 0)), dn = 10 * (1 + 0.3 * (f.wide ?? 0)), pts: P2[] = [[cx - hw, cy], [cx - hw * 0.3, cy - up], [cx + hw * 0.4, cy - up], [cx + hw, cy], [cx, cy + dn]];
  const gz = f.gaze ?? gz0, lid = f.lid ?? 0.12;
  k.shape(pts, "#fbf5e4", 0);
  k.clip(pts, () => {
    const px = cx + gz[0] * (hw - 9), py = cy - 1 + gz[1] * 5; k.dot(px, py, 8.5, INKW); k.dot(px - 3, py - 3.5, 2.8, "#fbf5e4");
    if (lid > 0.01) { const y = cy - up + (up + dn) * lid; k.shape([[cx - hw - 2, cy - up - 3], [cx + hw + 2, cy - up - 3], [cx + hw + 2, y], [cx - hw - 2, y]], SKIN, 0); k.line([[cx - hw - 2, y], [cx + hw + 2, y]], 4.5, INKW, "butt"); }
  });
  k.shape(pts, null, 3.5); k.line([pts[0], pts[1], pts[2], pts[3]], 6.5, INKW);
};
const pipe = (k: Ink, a: P2, b: P2) => {
  k.line([a, b], 10, INKW, "butt");
  const bowl: P2[] = [[b[0] - 12, b[1] - 30], [b[0] + 22, b[1] - 30], [b[0] + 17, b[1] + 8], [b[0] - 8, b[1] + 8]]; part(k, bowl, "#74442a", 10, 4);
};
const mous = (k: Ink, pts: P2[], lines: P2[][]) => { k.shape(pts, INKW, 3); for (const l of lines) k.line(l, 3, PAPER, "butt"); };

const sirFront = (k: Ink, f: Face, tx: number, lift: number) => {
  const head = sym([[0, 8], [36, 6], [60, -28], [66, -96], [58, -150], [40, -174], [0, -178]]);
  for (const s of [-1, 1]) k.shape([[s * 64, -114], [s * 82, -120], [s * 84, -84], [s * 64, -74]], SKIN);
  part(k, head, SKIN, 26, 6);
  k.g.save(); k.g.translate(tx, 0);
  k.hatch([[26, -74], [58, -98], [56, -36], [34, -20]], 58, 8, 3.2, INKW);
  if ((f.mouth ?? 0) > 0.05) k.shape([[-16, -28], [16, -28], [12, -28 + 22 * f.mouth!], [-12, -28 + 22 * f.mouth!]], INKW, 0); else k.line([[-15, -20], [15, -20]], 4.5);
  pipe(k, [18, -30], [68, -10]);
  for (const s of [-1, 1]) mous(k, ([[0, -56], [40, -64], [78, -72], [106, -96], [98, -58], [60, -36], [26, -31], [0, -38]] as P2[]).map(([x, y]) => [x * s, y] as P2),
    [([[14, -47], [54, -54], [88, -72]] as P2[]).map(([x, y]) => [x * s, y] as P2), ([[14, -40], [50, -42], [76, -52]] as P2[]).map(([x, y]) => [x * s, y] as P2)]);
  k.shape([[0, -122], [-13, -64], [0, -56], [14, -64]], SKIN, 3.5); k.shape([[0, -122], [14, -64], [0, -56]], INKW, 0);
  almond(k, -32, -98, 21, f); almond(k, 32, -98, 21, f);
  monocle(k, -32, -98, 28, 28, 5, GOLDM);
  const b = (f.brow ?? 0) * 8; for (const s of [-1, 1]) k.shape([[s * 8, -120 - b * 0.3], [s * 56, -134 - b], [s * 58, -124 - b], [s * 10, -109 - b * 0.3]], INKW, 0);
  k.g.restore();
  k.g.save(); k.g.translate(-lift * 14, -lift * 36);
  part(k, [[-80, -150], [-90, -180], [-56, -206], [26, -212], [86, -190], [82, -150]], TWEED, 22, 8, true, [0, -180]);
  k.shape([[-76, -152], [-40, -136], [0, -128], [40, -136], [78, -152], [0, -147]], TWEED_D, 5); k.shape([[-8, -216], [10, -217], [12, -208], [-8, -207]], TWEED_D, 4);
  k.g.restore();
};
const sirSide = (k: Ink, f: Face, lift: number) => {
  const head: P2[] = [[-36, 4], [-62, -40], [-66, -120], [-52, -164], [-10, -178], [36, -172], [50, -150], [52, -122], [56, -112], [88, -64], [62, -56], [58, -44], [54, -30], [58, -14], [40, 6], [0, 10]];
  part(k, head, SKIN, -24, 6);
  k.shape([[-24, -112], [-6, -118], [-2, -84], [-22, -74]], SKIN, 4);
  k.shape([[62, -56], [88, -64], [60, -68]], INKW, 0);
  if ((f.mouth ?? 0) > 0.05) k.shape([[40, -32], [58, -34], [56, -32 + 18 * f.mouth!], [42, -30 + 18 * f.mouth!]], INKW, 0);
  pipe(k, [54, -32], [104, -14]);
  mous(k, [[68, -58], [40, -66], [4, -52], [-24, -74], [-17, -40], [10, -26], [44, -36], [66, -46]], [[[54, -54], [14, -42], [-12, -50]], [[50, -46], [16, -34]]]);
  almond(k, 33, -99, 15, f, [0.5, 0]);
  monocle(k, 33, -99, 20, 27, 5, GOLDM);
  const b = (f.brow ?? 0) * 8; k.shape([[20, -128 - b], [56, -124 - b * 0.4], [56, -113 - b * 0.4], [22, -112 - b]], INKW, 0);
  k.g.save(); k.g.translate(-lift * 30, -lift * 34);
  part(k, [[-72, -150], [-86, -184], [-50, -208], [20, -212], [62, -194], [66, -160], [58, -146]], TWEED, -22, 8, true, [0, -180]);
  k.shape([[44, -168], [112, -152], [114, -141], [50, -149]], TWEED_D, 5);
  k.g.restore();
};
const bakerFront = (k: Ink, f: Face, tx: number) => {
  const head = sym([[0, 10], [44, 8], [72, -22], [78, -96], [66, -150], [40, -172], [0, -176]]);
  for (const s of [-1, 1]) k.shape([[s * 76, -112], [s * 94, -116], [s * 94, -82], [s * 76, -74]], SKIN);
  part(k, head, SKIN, 28, 6);
  for (const s of [-1, 1]) k.shape([[s * 64, -152], [s * 78, -96], [s * 60, -104], [s * 50, -146]], INKW, 0);
  k.shape([[-50, -160], [-40, -174], [40, -174], [50, -160], [0, -164]], INKW, 0);
  k.g.save(); k.g.translate(tx, 0);
  k.hatch([[-52, -30], [52, -30], [40, 6], [-40, 6]], 90, 8, 2.6, INKW);
  k.line([[-30, -40], [-18, -32], [18, -32], [30, -40]], 5);
  if ((f.mouth ?? 0) > 0.05) k.shape([[-18, -34], [18, -34], [13, -34 + 20 * f.mouth!], [-13, -34 + 20 * f.mouth!]], INKW, 0);
  k.shape([[0, -116], [-18, -62], [0, -52], [18, -62]], SKIN, 3.5); k.shape([[0, -116], [18, -62], [0, -52]], INKW, 0);
  almond(k, -36, -96, 20, { lid: 0.06, ...f }); almond(k, 36, -96, 20, { lid: 0.06, ...f });
  for (const s of [-1, 1]) k.shape([[s * 12, -122], [s * 60, -128], [s * 60, -116], [s * 14, -111]], INKW, 0);
  k.g.restore();
};
const bakerSide = (k: Ink, f: Face) => {
  const head: P2[] = [[-36, 4], [-66, -40], [-70, -120], [-54, -164], [-10, -176], [36, -170], [50, -148], [52, -120], [58, -110], [92, -68], [64, -60], [60, -46], [56, -34], [60, -16], [40, 6], [0, 10]];
  part(k, head, SKIN, -24, 6);
  k.shape([[-70, -120], [-54, -164], [-10, -176], [-22, -140], [-42, -100], [-64, -60]], INKW, 0);
  k.shape([[-22, -110], [-4, -116], [0, -82], [-20, -72]], SKIN, 4);
  k.shape([[64, -60], [92, -68], [62, -72]], INKW, 0);
  k.line([[40, -38], [58, -36]], 5);
  if ((f.mouth ?? 0) > 0.05) k.shape([[40, -38], [58, -38], [56, -38 + 18 * f.mouth!], [42, -36 + 18 * f.mouth!]], INKW, 0);
  almond(k, 34, -98, 15, { lid: 0.06, ...f }, [0.5, 0]);
  k.shape([[20, -124], [56, -122], [56, -111], [22, -110]], INKW, 0);
};
const wedgeShoe = (k: Ink, sk: Sk, s: Side, col: string, sandal = false) => {
  const sp = shoePts(sk, s, 56, sandal ? 0.28 : 0.36, sandal ? 0.14 : 0.2, true);
  part(k, sp.pts, col, 12, 4);
  if (sandal) for (const u of [0.3, 0.6]) k.line([[sp.O[0] + sp.ex[0] * sp.span * u, sp.O[1] + sp.ex[1] * sp.span * u], [sp.O[0] + sp.ex[0] * sp.span * (u + 0.05) + sp.up[0] * 34, sp.O[1] + sp.ex[1] * sp.span * (u + 0.05) + sp.up[1] * 34]], 7, INKW, "butt");
  k.line([sp.O, [sp.O[0] + sp.ex[0] * sp.span, sp.O[1] + sp.ex[1] * sp.span]], 9, INKW, "butt");
};

const draw = (k: Ink, sk: Sk, o: FigOpts) => {
  const ink0 = k.ink; k.ink = INKW;
  const baker = o.who === "baker", F = frame(sk), P = sk.P, f = o.face ?? {}, hp = headPose(sk), front = sk.cos > 0.35, d = Math.sign(sk.sin) || 1, sideOn = Math.abs(sk.sin) > 0.6;
  const sx = sideOn ? -22 * d : 22;
  const leg = (s: Side) => {
    const H = J(sk, "hip", s), K = J(sk, "kn", s), A = J(sk, "an", s);
    if (baker) { const pc = limb(H, K, A, [40, 27, 17], [0, 10], true); k.group(pc, SKIN); for (const q of pc.slice(0, 2)) cut(k, q, 14, 5); wedgeShoe(k, sk, s, SKIN, true); return; }
    const pc = limb(H, K, A, [44, 31, 22], [0, 5], true); k.group(pc, GREEN); for (const q of pc.slice(0, 2)) cut(k, q, 15, 5);
    wedgeShoe(k, sk, s, "#3a2a22");
  };
  const arm = (s: Side) => {
    const S = J(sk, "sh", s), E = J(sk, "el", s), W = J(sk, "wr", s), kind = (s === "L" ? o.handL : o.handR) ?? "relaxed";
    if (baker) {
      const pc = limb(S, E, W, [29, 23, 17], [0, 7], true); k.group(pc, SKIN); for (const q of pc.slice(0, 2)) cut(k, q, 12, 5);
      part(k, seg(S, mid(S, E, 0.5), 36, 32, 0, 0.3, true), TUNIC, 12, 5);
      if (o.prop === "loaf" && s === "L") loaf(k, mid(W, J(sk, "tip", s), 0.9), 54, true);
      handAt(k, sk, s, kind, SKIN, true); return;
    }
    k.shape(seg(mid(E, W, 0.82), mid(E, W, 1.05), 16, 16, 0, 0.3, true), PAPER, 5);
    const pc = limb(S, E, W, [35, 27, 20], [0, 3], true); k.group(pc, TWEED); for (const q of pc.slice(0, 2)) { k.tweed(q, WEAVE, S, 0, 19, 2.4); cut(k, q, 13, 5); }
    handAt(k, sk, s, kind, SKIN, true);
  };
  const torso = () => {
    k.shape(seg(F.T(0, P.spine - 14), sk.j.skull, 27, 27, 0, 0.3, true), SKIN);
    if (baker) {
      const t = torsoPts(sk, [[-150, 122, 84, 90], [-20, 112, 88, 82], [80, 102, 86, 72], [200, 122, 86, 74], [270, 128, 66, 68], [290, 44, 38, 40]], false);
      k.shape(t, TUNIC, 0);
      if (front) k.clip(t, () => k.shape([F.Q(-56, 0, 210), F.Q(56, 0, 210), F.Q(80, 0, -170), F.Q(-80, 0, -170)], APRON, 5));
      k.clip(t, () => k.line([F.T(-220, 70), F.T(220, 70)], 14, RUST, "butt"));
      cut(k, t, sx, 8); k.shape(t, null); return;
    }
    const t = torsoPts(sk, [[-112, 102, 72, 76], [-10, 86, 68, 68], [70, 72, 62, 56], [200, 110, 76, 68], [282, 120, 62, 64], [300, 40, 34, 36]], false);
    k.shape(t, TWEED, 0); k.tweed(t, WEAVE, F.o, F.tilt, 19, 2.4);
    if (front) {
      k.clip(t, () => { k.shape([F.Q(-34, 0, 262), F.Q(34, 0, 262), F.Q(22, 0, 60), F.Q(-22, 0, 60)], RUST, 4); k.shape([F.Q(-24, 0, 302), F.Q(24, 0, 302), F.Q(0, 0, 196)], PAPER, 4); });
      for (const s of [-1, 1]) k.shape([F.Q(s * 24, 0, 302), F.Q(s * 72, 0, 252), F.Q(s * 54, 0, 226), F.Q(s * 10, 0, 110)], shade(TWEED, 1.12), 5);
      k.line([F.Q(10, 0, 110), F.Q(18, 0, -112)], 4.5);
      for (const a of [70, 10]) k.shape(ellPts(...F.Q(0, 0, a), 8, 8, 0, 0, 360, 6), INKW, 0);
      const c = F.Q(0, 0, 286); for (const s of [-1, 1]) k.shape([c, F.Q(s * 36, 0, 302), F.Q(s * 36, 0, 268)], RUST, 5);
    } else if (sideOn) { const c = F.T(34 * d, 284); k.shape([c, [c[0] + 28 * d, c[1] - 16], [c[0] + 28 * d, c[1] + 16]], RUST, 5); }
    cut(k, t, sx, 8); k.shape(t, null);
  };
  const head = () => {
    k.at(sk.j.skull[0], sk.j.skull[1], sk.headTilt, hp.side && hp.flip, () => {
      if (baker) (hp.side ? bakerSide(k, f) : bakerFront(k, f, hp.turn * 16));
      else (hp.side ? sirSide(k, f, o.capLift ?? 0) : sirFront(k, f, hp.turn * 16, o.capLift ?? 0));
    });
    if (baker) return;
    const w = headToWorld(sk, hp.side && hp.flip);
    if (hp.side) { const a = w([19, -80]), b = F.T(50 * d, 236); chain(k, a, b, [(a[0] + b[0]) / 2 - 18 * d, (a[1] + b[1]) / 2 + 22], 5, GOLDM); }
    else chain(k, w([-52 + hp.turn * 16, -78]), F.Q(-52, 0, 240), w([-84, -20]), 5, GOLDM);
  };
  layers(sk, { arm, leg, torso, head });
  k.ink = ink0; void clamp;
};

export const WOODCUT: Design = { id: "woodcut", name: "Träsnittet", ol: 8, faceW: 112, props: (w) => (w === "baker" ? BAKER : SIR), draw };
