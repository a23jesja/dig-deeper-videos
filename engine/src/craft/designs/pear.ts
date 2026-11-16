// Direction C, "The pear in plus-fours": a human with a body shape of his own. A pear-shaped skull with heavy jowls under a small cranium,
// a bell of a Norfolk jacket, plus-fours ballooning over thin stockinged calves. Soft curved line, two flat tones.
import { Ink, P2, sym, spline, ellPts, seg, mid, shade, eye, monocle, chain } from "../ink";
import { Sk, Side, Props } from "../rig";
import { Design, FigOpts, Face, frame, torsoPts, J, limb, handAt, shoe, sandal, layers, headPose, headToWorld, loaf, LIGHT } from "./common";

const TWEED = "#a17d4b", TWEED_D = "#7a5c36", WEAVE = "rgba(74,50,26,0.33)", SKIN = "#f6cda8", SKIN_D = "#e2a883", MOUS = "#5c3a1f", SHIRT = "#f8f1e0", BOW = "#8f2f3d";
const PLUS = "#8a7446", STOCK = "#efe6cf", SHOE = "#4b3323", TUNIC = "#e8d6a4", APRON = "#f8f3e6", HAIR = "#4a3020", BLUSH = "rgba(224,112,92,0.3)";
const SIR: Props = { thigh: 150, shin: 150, ankle: 30, foot: 128, hipW: 62, shW: 94, spine: 265, shDrop: 30, neck: 16, head: 235, upper: 135, fore: 125, hand: 80 };
const BAKER: Props = { thigh: 128, shin: 136, ankle: 26, foot: 122, hipW: 68, shW: 104, spine: 250, shDrop: 28, neck: 12, head: 200, upper: 124, fore: 114, hand: 84 };

const sirFront = (k: Ink, f: Face, tx: number, lift: number) => {
  const head = spline(sym([[0, 10], [66, 4], [114, -34], [126, -84], [102, -132], [72, -176], [58, -214], [36, -240], [0, -247]]));
  for (const s of [-1, 1]) k.shape(ellPts(s * 82 - tx * 0.5, -152, 16, 24, s * 8), SKIN);
  k.shape(head, SKIN, 0); k.shadeEdge(head, SKIN_D, 20, 10);
  k.clip(head, () => { for (const s of [-1, 1]) k.shape(ellPts(s * 80 + tx, -92, 32, 24), BLUSH, 0); });
  k.shape(head, null);
  k.g.save(); k.g.translate(tx, 0);
  for (const s of [-1, 1]) k.line(spline([[s * 44, -70], [s * 62, -48], [s * 58, -24]], false, 6), k.ol * 0.5);
  if ((f.mouth ?? 0) > 0.05) { const m = ellPts(0, -44, 24, 7 + 20 * f.mouth!); k.shape(m, "#5a1e28", k.ol * 0.6); k.clip(m, () => k.shape(ellPts(0, -30 + 8 * f.mouth!, 16, 10), "#e86e78", 0)); }
  else k.line(spline([[-20, -40], [0, -34], [20, -40]], false, 6), k.ol * 0.5);
  // pipe from the corner of the mouth, under the moustache
  k.line([[24, -54], [82, -30]], 15); k.line([[24, -54], [82, -30]], 8, "#3a2618");
  const bowl: P2[] = [[70, -62], [108, -62], [104, -22], [76, -22]]; k.shape(bowl, "#6b3f22"); k.shadeEdge(bowl, "#4a2a16", 8, 0); k.shape(bowl, null); k.line([[70, -62], [108, -62]], 7, "#2c1a10");
  // the moustache sweeps past the jowls and turns up
  for (const s of [-1, 1]) {
    const m = spline(([[0, -86], [30, -93], [72, -84], [112, -76], [142, -92], [153, -116], [148, -84], [122, -56], [72, -52], [30, -62], [0, -68]] as P2[]).map(([x, y]) => [x * s, y] as P2));
    k.shape(m, MOUS); k.line(spline(([[24, -76], [70, -68], [116, -68]] as P2[]).map(([x, y]) => [x * s, y] as P2), false, 5), k.ol * 0.35, shade(MOUS, 1.35));
  }
  // the long drooping nose
  const nose = spline([[-10, -148], [-15, -118], [-23, -98], [-13, -84], [0, -81], [13, -84], [23, -98], [15, -118], [10, -148]]);
  k.shape(nose, shade(SKIN, 0.97), 0); k.shadeEdge(nose, SKIN_D, 8, 4);
  k.line(spline([[-17, -116], [-23, -98], [-13, -84], [0, -81], [13, -84], [23, -98], [17, -116]], false, 6), k.ol * 0.7);
  const ry = 23 * (1 + 0.28 * (f.wide ?? 0)), lid = f.lid ?? 0.24;
  eye(k, -31, -148, 20, ry, { skin: SKIN, gaze: f.gaze, lid }); eye(k, 31, -148, 20, ry, { skin: SKIN, gaze: f.gaze, lid });
  monocle(k, -31, -147, 30, 32);
  const b = (f.brow ?? 0) * 9;
  for (const s of [-1, 1]) k.shape(spline([[s * 12, -178 - b * 0.4], [s * 34, -186 - b], [s * 58, -176 - b * 0.6], [s * 56, -168 - b * 0.6], [s * 34, -174 - b], [s * 12, -168 - b * 0.4]]), MOUS, k.ol * 0.4);
  k.g.restore();
  // tweed cap: a flat crown wider than the skull, the peak as wide as the cap and joined to its lower edge
  k.g.save(); k.g.translate(-lift * 14, -230 - lift * 40); k.g.rotate(-lift * 0.16); k.g.translate(0, 230);
  const crown = spline([[-90, -198], [-104, -230], [-76, -268], [0, -282], [80, -272], [106, -238], [94, -200], [0, -192]]);
  k.shape(crown, TWEED, 0); k.tweed(crown, WEAVE, [0, -240], 8); k.shadeEdge(crown, TWEED_D, 18, 12); k.shape(crown, null);
  const peak = spline([[-86, -203], [-54, -187], [0, -178], [54, -187], [86, -203], [0, -199]]);
  k.shape(peak, TWEED_D); k.shape(ellPts(4, -283, 13, 6), TWEED_D);
  k.g.restore();
};

const sirSide = (k: Ink, f: Face, lift: number) => {
  const head = spline([[-42, 0], [-80, -80], [-82, -150], [-64, -214], [-22, -247], [28, -241], [52, -206], [57, -170], [60, -150], [86, -118], [100, -98], [80, -84], [68, -72], [62, -58], [76, -38], [60, -6], [22, 10], [-12, 8]]);
  k.shape(head, SKIN, 0); k.shadeEdge(head, SKIN_D, -16, 12);
  k.clip(head, () => k.shape(ellPts(30, -92, 30, 22), BLUSH, 0));
  k.shape(head, null);
  k.shape(ellPts(-24, -130, 17, 27, -6), SKIN); k.line(spline([[-28, -142], [-18, -130], [-26, -118]], false, 5), k.ol * 0.4);
  if ((f.mouth ?? 0) > 0.05) k.shape(ellPts(54, -46, 12, 5 + 16 * f.mouth!), "#5a1e28", k.ol * 0.6);
  k.line([[60, -56], [124, -34]], 15); k.line([[60, -56], [124, -34]], 8, "#3a2618");
  const bowl: P2[] = [[114, -68], [152, -68], [148, -26], [118, -26]]; k.shape(bowl, "#6b3f22"); k.shadeEdge(bowl, "#4a2a16", 8, 0); k.shape(bowl, null); k.line([[114, -68], [152, -68]], 7, "#2c1a10");
  const m = spline([[88, -88], [60, -93], [24, -80], [-2, -68], [-16, -86], [-12, -108], [-22, -80], [-6, -54], [26, -46], [62, -58], [88, -72]]);
  k.shape(m, MOUS); k.line(spline([[66, -78], [28, -66], [-4, -62]], false, 5), k.ol * 0.35, shade(MOUS, 1.35));
  k.line(spline([[62, -146], [88, -116], [100, -98], [82, -84]], false, 6), k.ol * 0.5);
  eye(k, 33, -148, 15, 22 * (1 + 0.28 * (f.wide ?? 0)), { skin: SKIN, gaze: f.gaze ?? [0.5, 0], lid: f.lid ?? 0.24 });
  monocle(k, 33, -147, 21, 31);
  const b = (f.brow ?? 0) * 9; k.shape(spline([[14, -176 - b], [38, -186 - b], [58, -176 - b * 0.5], [56, -168 - b * 0.5], [36, -175 - b], [14, -168 - b]]), MOUS, k.ol * 0.4);
  k.g.save(); k.g.translate(-lift * 30, -230 - lift * 40); k.g.rotate(-lift * 0.3); k.g.translate(0, 230);
  const crown = spline([[-86, -186], [-98, -232], [-56, -274], [8, -282], [60, -264], [80, -232], [70, -204], [0, -192]]);
  k.shape(crown, TWEED, 0); k.tweed(crown, WEAVE, [0, -240], 8); k.shadeEdge(crown, TWEED_D, -16, 12); k.shape(crown, null);
  k.shape(spline([[40, -216], [84, -212], [132, -196], [134, -186], [84, -194], [44, -198]]), TWEED_D); k.shape(ellPts(-6, -281, 12, 6, -6), TWEED_D);
  k.g.restore();
};

const bakerFront = (k: Ink, f: Face, tx: number) => {
  const head = spline(sym([[0, 10], [88, 4], [134, -36], [138, -92], [106, -150], [60, -186], [0, -194]]));
  for (const s of [-1, 1]) k.shape(ellPts(s * 116 - tx * 0.5, -126, 15, 22, s * 8), SKIN_D);
  k.shape(head, shade(SKIN, 0.94), 0); k.shadeEdge(head, shade(SKIN_D, 0.92), 20, 10);
  k.clip(head, () => { k.shape([[-200, -260], [200, -260], [200, -150], [0, -138], [-200, -150]], HAIR, 0); for (const s of [-1, 1]) k.shape(ellPts(s * 78 + tx, -62, 28, 20), BLUSH, 0); });
  k.shape(head, null);
  k.g.save(); k.g.translate(tx, 0);
  k.line(spline([[-46, -50], [-24, -34], [0, -30], [24, -34], [46, -50]], false, 6), k.ol * 0.75);
  if ((f.mouth ?? 0) > 0.05) k.shape(ellPts(0, -36, 24, 6 + 18 * f.mouth!), "#5a1e28", k.ol * 0.6);
  const nose = ellPts(0, -78, 22, 18); k.shape(nose, shade(SKIN_D, 1.02), k.ol * 0.6);
  for (const s of [-1, 1]) { eye(k, s * 42, -108, 17, 20 * (1 + 0.28 * (f.wide ?? 0)), { skin: shade(SKIN, 0.94), gaze: f.gaze, lid: f.lid ?? 0.08 }); k.line(spline([[s * 20, -136], [s * 42, -144], [s * 64, -134]], false, 5), k.ol * 1.1, HAIR); }
  k.g.restore();
};
const bakerSide = (k: Ink, f: Face) => {
  const head = spline([[-40, 0], [-100, -60], [-106, -126], [-72, -180], [0, -197], [60, -182], [88, -142], [92, -112], [118, -90], [100, -70], [92, -52], [86, -36], [62, -8], [14, 8]]);
  k.shape(head, shade(SKIN, 0.94), 0); k.shadeEdge(head, shade(SKIN_D, 0.92), -16, 12);
  k.clip(head, () => { k.shape([[-200, -260], [200, -260], [200, -152], [20, -140], [-30, -110], [-200, -40]], HAIR, 0); k.shape(ellPts(46, -62, 28, 20), BLUSH, 0); });
  k.shape(head, null);
  k.shape(ellPts(-12, -96, 15, 24, -6), SKIN_D);
  k.line(spline([[62, -40], [80, -42], [92, -52]], false, 5), k.ol * 0.75);
  if ((f.mouth ?? 0) > 0.05) k.shape(ellPts(76, -40, 12, 5 + 14 * f.mouth!), "#5a1e28", k.ol * 0.6);
  eye(k, 62, -110, 12, 18 * (1 + 0.28 * (f.wide ?? 0)), { skin: shade(SKIN, 0.94), gaze: f.gaze ?? [0.5, 0], lid: f.lid ?? 0.08 });
  k.line(spline([[44, -136], [64, -144], [82, -134]], false, 5), k.ol * 1.1, HAIR);
};

const draw = (k: Ink, sk: Sk, o: FigOpts) => {
  const baker = o.who === "baker", F = frame(sk), P = sk.P, f = o.face ?? {}, hp = headPose(sk), front = sk.cos > 0.35, sx = LIGHT[0] * (hp.flip ? -1 : 1);
  const skin = baker ? shade(SKIN, 0.94) : SKIN;
  const leg = (s: Side) => {
    const H = J(sk, "hip", s), K = J(sk, "kn", s), A = J(sk, "an", s);
    if (baker) { const pc = limb(H, K, A, [40, 27, 17], [0, 9]); k.group(pc, skin); for (const q of pc) k.shadeEdge(q, SKIN_D, 9, 4); sandal(k, sk, s, skin, "#7a4a2a", 50); return; }
    const st = seg(K, A, 24, 15, 7, 0.3); k.group([st], STOCK); k.shadeEdge(st, shade(STOCK, 0.82), 8, 3);
    for (const t of [0.42, 0.5]) { const c = mid(K, A, t); k.line([[c[0] - 17, c[1]], [c[0] + 17, c[1]]], 4, "#8f2f3d", "butt"); }
    shoe(k, sk, s, SHOE, 54);
    const pc = [seg(H, K, 52, 57, 4), seg(K, mid(K, A, 0.24), 57, 43)];
    k.group(pc, PLUS); for (const q of pc) { k.tweed(q, WEAVE, H, 0, 15); k.shadeEdge(q, shade(PLUS, 0.76), 14, 6); }
    k.shape(seg(mid(K, A, 0.3), mid(K, A, 0.38), 27, 25, 0, 0.3, true), shade(PLUS, 0.76), k.ol * 0.6);
  };
  const arm = (s: Side) => {
    const S = J(sk, "sh", s), E = J(sk, "el", s), W = J(sk, "wr", s), kind = (s === "L" ? o.handL : o.handR) ?? "relaxed";
    if (baker) {
      const pc = limb(S, E, W, [28, 23, 16], [0, 6]); k.group(pc, skin); for (const q of pc) k.shadeEdge(q, SKIN_D, 8, 4);
      const cap = seg(S, mid(S, E, 0.5), 33, 30); k.group([cap], TUNIC); k.shadeEdge(cap, shade(TUNIC, 0.8), 9, 4);
      if (o.prop === "loaf" && s === "L") loaf(k, mid(W, J(sk, "tip", s), 0.9), 50);
      handAt(k, sk, s, kind, skin); return;
    }
    const pc = limb(S, E, W, [32, 26, 19], [0, 3]);
    k.group([seg(mid(E, W, 0.8), mid(E, W, 1.06), 15, 15, 0, 0.3, true)], SHIRT);
    k.group(pc, TWEED); for (const q of pc) { k.tweed(q, WEAVE, S, 0, 15); k.shadeEdge(q, TWEED_D, 11, 5); }
    handAt(k, sk, s, kind, SKIN);
  };
  const torso = () => {
    k.group([seg(F.T(0, P.spine - 16), sk.j.skull, 36, 36)], skin);
    if (baker) {
      const t = torsoPts(sk, [[-112, 132, 100, 106], [-40, 128, 114, 106], [50, 114, 120, 94], [140, 98, 102, 84], [200, 90, 78, 76], [236, 58, 50, 54], [252, 34, 32, 36]]);
      k.shape(t, TUNIC, 0); k.shadeEdge(t, shade(TUNIC, 0.8), 22, 8);
      if (front) k.clip(t, () => k.shape([F.Q(-56, 0, 170), F.Q(56, 0, 170), F.Q(84, 0, -130), F.Q(-84, 0, -130)], APRON, k.ol * 0.6));
      else if (Math.abs(sk.sin) > 0.6) k.shadeEdge(t, APRON, 30 * Math.sign(sk.sin), 0);
      k.clip(t, () => k.line([F.T(-200, 44), F.T(200, 44)], 13, "#8a5a3a", "butt"));
      k.shape(t, null); return;
    }
    const t = torsoPts(sk, [[-74, 124, 96, 102], [-20, 122, 106, 102], [60, 106, 110, 88], [150, 88, 94, 80], [212, 82, 72, 74], [248, 54, 48, 52], [266, 32, 30, 34]]);
    k.shape(t, TWEED, 0); k.tweed(t, WEAVE, F.o, F.tilt, 15); k.shadeEdge(t, TWEED_D, 24, 8);
    k.clip(t, () => { k.line([F.T(-200, 32), F.T(200, 32)], 26, TWEED_D, "butt"); k.line([F.T(-200, 46), F.T(200, 46)], 3); k.line([F.T(-200, 18), F.T(200, 18)], 3); });
    if (front) {
      k.shape([F.Q(-27, 0, 262), F.Q(27, 0, 262), F.Q(0, 0, 150)], SHIRT, k.ol * 0.5);
      for (const s of [-1, 1]) k.shape([F.Q(s * 27, 0, 264), F.Q(s * 64, 0, 224), F.Q(s * 40, 0, 198), F.Q(0, 0, 140)], shade(TWEED, 1.1), k.ol * 0.6);
      k.line([F.Q(0, 0, 140), F.Q(0, 0, -70)], k.ol * 0.5);
      for (const a of [100, -22]) k.dot(...F.Q(12, 0, a), 8, "#3a2618");
      const c = F.Q(0, 0, 252); for (const s of [-1, 1]) k.shape([c, F.Q(s * 36, 0, 268), F.Q(s * 36, 0, 236)], BOW, k.ol * 0.6); k.dot(c[0], c[1], 9, shade(BOW, 0.8));
    } else if (Math.abs(sk.sin) > 0.6) {
      const c = F.T(34 * Math.sign(sk.sin), 250), d = Math.sign(sk.sin); k.shape([c, [c[0] + 26 * d, c[1] - 16], [c[0] + 26 * d, c[1] + 16]], BOW, k.ol * 0.6);
    }
    k.shape(t, null);
  };
  const head = () => {
    const lift = o.capLift ?? 0;
    k.at(sk.j.skull[0], sk.j.skull[1], sk.headTilt, hp.side && hp.flip, () => {
      if (baker) (hp.side ? bakerSide(k, f) : bakerFront(k, f, hp.turn * 22));
      else (hp.side ? sirSide(k, f, lift) : sirFront(k, f, hp.turn * 22, lift));
    });
    if (baker) return;
    const w = headToWorld(sk, hp.side && hp.flip), d = Math.sign(sk.sin) || 1;
    if (hp.side) chain(k, w([19, -124]), F.T(46 * d, 204), add2(mid(w([19, -124]), F.T(46 * d, 204)), [-16 * d, 24]));
    else chain(k, w([-52 + hp.turn * 22, -124]), F.Q(-46, 0, 206), w([-122, -44]));
    void sx;
  };
  layers(sk, { arm, leg, torso, head });
};
const add2 = (a: P2, b: P2): P2 => [a[0] + b[0], a[1] + b[1]];

export const PEAR: Design = { id: "pear", name: "Päronet i plus-fours", ol: 9, faceW: 160, props: (w) => (w === "baker" ? BAKER : SIR), draw };
