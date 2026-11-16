// Direction F, "The big head": the Victorian caricature, a large acted face on a small dapper body. The skull is a tall loaf with flat
// sides, framed by mutton-chop whiskers that join the moustache; the face is big enough to act on a phone screen.
import { Ink, P2, sym, spline, ellPts, shade, eye, monocle } from "../ink";
import { Props } from "../rig";
import { Design, Face } from "./common";
import { drawSoft, briar, Soft } from "./soft";

const TWEED = "#a17d4b", TWEED_D = "#7a5c36", WEAVE = "rgba(74,50,26,0.33)", SKIN = "#f6cda8", SKIN_D = "#e2a883", MOUS = "#5c3a1f", SHIRT = "#f8f1e0", BOW = "#8f2f3d", VEST = "#cda23c";
const BSKIN = "#eebf96", HAIR = "#3f2a1c", BLUSH = "rgba(224,112,92,0.3)";
const SIR: Props = { thigh: 92, shin: 84, ankle: 20, foot: 110, hipW: 44, shW: 72, spine: 180, shDrop: 20, neck: 8, head: 315, upper: 96, fore: 90, hand: 68 };
const BAKER: Props = { thigh: 96, shin: 86, ankle: 20, foot: 108, hipW: 50, shW: 82, spine: 200, shDrop: 22, neck: 6, head: 286, upper: 100, fore: 94, hand: 72 };

const hairs = (k: Ink, lines: P2[][]) => { for (const l of lines) k.line(spline(l, false, 5), k.ol * 0.35, shade(MOUS, 1.4)); };
const sirFront = (k: Ink, f: Face, tx: number, lift: number) => {
  const head = spline(sym([[0, 10], [82, 6], [128, -30], [140, -112], [138, -205], [122, -272], [72, -306], [0, -313]]));
  k.shape(head, SKIN, 0); k.shadeEdge(head, SKIN_D, 22, 10);
  k.clip(head, () => { for (const s of [-1, 1]) k.shape(ellPts(s * 74 + tx, -128, 34, 26), BLUSH, 0); });
  k.shape(head, null);
  // mutton chops down both cheeks
  for (const s of [-1, 1]) {
    const ch = spline(([[136, -214], [156, -150], [162, -92], [144, -30], [102, -8], [72, -36], [86, -82], [102, -124], [112, -172], [120, -216]] as P2[]).map(([x, y]) => [x * s, y] as P2));
    k.shape(ch, MOUS); hairs(k, [[[s * 134, -150], [s * 140, -100], [s * 124, -50]], [[s * 118, -120], [s * 118, -76], [s * 100, -40]]]);
  }
  k.g.save(); k.g.translate(tx, 0);
  if ((f.mouth ?? 0) > 0.05) { const m = ellPts(0, -54, 32, 9 + 26 * f.mouth!); k.shape(m, "#5a1e28", k.ol * 0.6); k.clip(m, () => k.shape(ellPts(0, -36 + 10 * f.mouth!, 22, 13), "#e86e78", 0)); }
  else k.line(spline([[-26, -52], [0, -44], [26, -52]], false, 6), k.ol * 0.55);
  briar(k, [38, -70], [106, -36], 1.25);
  for (const s of [-1, 1]) {
    k.shape(spline(([[0, -106], [44, -116], [90, -104], [124, -112], [138, -142], [133, -102], [98, -74], [44, -78], [0, -88]] as P2[]).map(([x, y]) => [x * s, y] as P2)), MOUS);
    hairs(k, [[[s * 26, -98], [s * 70, -92], [s * 112, -100]]]);
  }
  const nose = spline([[-16, -186], [-24, -148], [-35, -126], [-20, -105], [0, -101], [20, -105], [35, -126], [24, -148], [16, -186]]);
  k.shape(nose, shade(SKIN, 0.96), 0); k.shadeEdge(nose, SKIN_D, 10, 5); k.line(spline([[-26, -150], [-35, -126], [-20, -105], [0, -101], [20, -105], [35, -126], [26, -150]], false, 6), k.ol * 0.7);
  const ry = 40 * (1 + 0.22 * (f.wide ?? 0)), lid = f.lid ?? 0.2;
  eye(k, -55, -184, 34, ry, { skin: SKIN, gaze: f.gaze, lid }); eye(k, 55, -184, 34, ry, { skin: SKIN, gaze: f.gaze, lid });
  monocle(k, -55, -183, 46, 50, 7);
  const b = (f.brow ?? 0) * 11;
  for (const s of [-1, 1]) k.shape(spline([[s * 18, -234 - b * 0.4], [s * 56, -247 - b], [s * 98, -232 - b * 0.6], [s * 94, -220 - b * 0.6], [s * 56, -232 - b], [s * 20, -220 - b * 0.4]]), MOUS, k.ol * 0.4);
  k.g.restore();
  k.g.save(); k.g.translate(-lift * 16, -lift * 50);
  const crown = spline([[-130, -258], [-152, -296], [-110, -346], [0, -364], [114, -350], [154, -304], [136, -260], [0, -250]]);
  k.shape(crown, TWEED, 0); k.tweed(crown, WEAVE, [0, -300], 8, 17); k.shadeEdge(crown, TWEED_D, 20, 14); k.shape(crown, null);
  k.shape(spline([[-124, -263], [-76, -242], [0, -231], [76, -242], [124, -263], [0, -257]]), TWEED_D); k.shape(ellPts(5, -365, 16, 7), TWEED_D);
  k.g.restore();
};
const sirSide = (k: Ink, f: Face, lift: number) => {
  const head = spline([[-60, 6], [-120, -40], [-132, -130], [-126, -220], [-104, -280], [-50, -312], [30, -310], [84, -286], [100, -240], [104, -200], [114, -180], [152, -140], [156, -116], [128, -100], [112, -92], [106, -70], [110, -40], [92, -6], [50, 10], [0, 12]]);
  k.shape(head, SKIN, 0); k.shadeEdge(head, SKIN_D, -20, 12);
  k.clip(head, () => k.shape(ellPts(70, -128, 30, 24), BLUSH, 0));
  k.shape(head, null);
  k.shape(ellPts(-56, -196, 22, 32, -6), SKIN); k.line(spline([[-62, -210], [-50, -196], [-58, -182]], false, 5), k.ol * 0.4);
  const ch = spline([[-34, -214], [8, -170], [30, -112], [72, -80], [98, -50], [70, -10], [20, -2], [-34, -28], [-58, -100], [-54, -172]]);
  k.shape(ch, MOUS); hairs(k, [[[-20, -150], [0, -90], [30, -40]], [[10, -110], [40, -60], [60, -30]]]);
  if ((f.mouth ?? 0) > 0.05) k.shape(ellPts(96, -54, 14, 7 + 20 * f.mouth!), "#5a1e28", k.ol * 0.6);
  briar(k, [102, -66], [174, -38], 1.25);
  k.shape(spline([[126, -106], [92, -116], [46, -102], [18, -114], [8, -142], [2, -104], [30, -76], [80, -74], [124, -90]]), MOUS); hairs(k, [[[100, -100], [56, -90], [22, -98]]]);
  k.line(spline([[112, -180], [152, -140], [156, -116], [128, -100]], false, 6), k.ol * 0.5);
  eye(k, 60, -184, 24, 38 * (1 + 0.22 * (f.wide ?? 0)), { skin: SKIN, gaze: f.gaze ?? [0.5, 0], lid: f.lid ?? 0.2 });
  monocle(k, 60, -183, 33, 48, 7);
  const b = (f.brow ?? 0) * 11; k.shape(spline([[30, -234 - b], [70, -248 - b], [104, -230 - b * 0.5], [100, -219 - b * 0.5], [68, -233 - b], [32, -221 - b]]), MOUS, k.ol * 0.4);
  k.g.save(); k.g.translate(-lift * 46, -lift * 50); k.g.rotate(-lift * 0.25);
  const crown = spline([[-128, -246], [-148, -296], [-100, -348], [0, -362], [86, -340], [124, -296], [112, -262], [0, -246]]);
  k.shape(crown, TWEED, 0); k.tweed(crown, WEAVE, [0, -300], 8, 17); k.shadeEdge(crown, TWEED_D, -18, 14); k.shape(crown, null);
  k.shape(spline([[70, -285], [130, -277], [198, -251], [200, -239], [130, -255], [76, -261]]), TWEED_D); k.shape(ellPts(-10, -362, 15, 7, -6), TWEED_D);
  k.g.restore();
};
const bakerFront = (k: Ink, f: Face, tx: number) => {
  const head = spline(sym([[0, 10], [106, 6], [152, -32], [158, -130], [148, -218], [112, -268], [0, -282]]));
  for (const s of [-1, 1]) k.shape(ellPts(s * 156, -132, 20, 32, s * 8), shade(BSKIN, 0.92));
  k.shape(head, BSKIN, 0); k.shadeEdge(head, shade(BSKIN, 0.86), 24, 10);
  k.clip(head, () => { for (const s of [-1, 1]) { k.shape(spline([[s * 70, -300], [s * 170, -260], [s * 170, -150], [s * 132, -170], [s * 110, -236]]), HAIR, 0); k.shape(ellPts(s * 92 + tx, -88, 34, 26), BLUSH, 0); } });
  k.shape(head, null);
  k.g.save(); k.g.translate(tx, 0);
  k.line(spline([[-56, -70], [-28, -48], [0, -42], [28, -48], [56, -70]], false, 6), k.ol * 0.8);
  if ((f.mouth ?? 0) > 0.05) k.shape(ellPts(0, -48, 32, 9 + 24 * f.mouth!), "#5a1e28", k.ol * 0.6);
  k.shape(ellPts(0, -112, 30, 25), shade(BSKIN, 0.9), k.ol * 0.6);
  for (const s of [-1, 1]) { eye(k, s * 58, -160, 30, 34 * (1 + 0.22 * (f.wide ?? 0)), { skin: BSKIN, gaze: f.gaze, lid: f.lid ?? 0.08 }); k.line(spline([[s * 26, -206], [s * 58, -216], [s * 92, -202]], false, 5), 11, HAIR); }
  k.g.restore();
};
const bakerSide = (k: Ink, f: Face) => {
  const head = spline([[-60, 6], [-132, -40], [-150, -130], [-140, -220], [-100, -270], [0, -284], [70, -268], [100, -220], [104, -180], [112, -160], [150, -124], [128, -100], [118, -86], [110, -66], [112, -40], [92, -6], [50, 10], [0, 12]]);
  k.shape(head, BSKIN, 0); k.shadeEdge(head, shade(BSKIN, 0.86), -20, 12);
  k.clip(head, () => { k.shape(spline([[-170, -260], [-60, -300], [-40, -230], [-70, -160], [-110, -110], [-170, -90]]), HAIR, 0); k.shape(ellPts(70, -88, 30, 24), BLUSH, 0); });
  k.shape(head, null);
  k.shape(ellPts(-40, -132, 20, 30, -6), shade(BSKIN, 0.92));
  k.line(spline([[66, -52], [92, -50], [110, -64]], false, 5), k.ol * 0.8);
  if ((f.mouth ?? 0) > 0.05) k.shape(ellPts(94, -48, 14, 7 + 18 * f.mouth!), "#5a1e28", k.ol * 0.6);
  eye(k, 62, -160, 22, 33 * (1 + 0.22 * (f.wide ?? 0)), { skin: BSKIN, gaze: f.gaze ?? [0.5, 0], lid: f.lid ?? 0.08 });
  k.line(spline([[36, -206], [66, -216], [96, -200]], false, 5), 11, HAIR);
};

const cfg: Soft = {
  sir: { rows: [[-36, 84, 66, 70], [10, 82, 72, 68], [100, 72, 66, 58], [160, 76, 54, 54], [182, 40, 34, 36]], arm: [25, 20, 16], leg: [31, 23, 17], legB: [0, 4], shoeW: 46, shoeH: [0.34, 0.2], neck: 0 },
  baker: { rows: [[-80, 96, 76, 80], [0, 96, 86, 78], [110, 84, 76, 66], [178, 86, 58, 58], [202, 44, 36, 38]], arm: [22, 18, 14], armB: [0, 5], leg: [30, 21, 15], legB: [0, 7], shoeW: 46, neck: 0 },
  col: { coat: TWEED, coatD: TWEED_D, weave: WEAVE, trous: "#4b3323", shoe: "#2c1f18", skin: SKIN, skinD: SKIN_D, shirt: SHIRT, tunic: "#e8d6a4", apron: "#f8f3e6", bakerSkin: BSKIN },
  heads: { sirFront, sirSide, bakerFront, bakerSide },
  front: (k, _sk, F) => {
    k.shape([F.Q(-26, 0, 170), F.Q(26, 0, 170), F.Q(22, 0, 30), F.Q(-22, 0, 30)], VEST, k.ol * 0.5);
    k.shape([F.Q(-20, 0, 190), F.Q(20, 0, 190), F.Q(0, 0, 124)], SHIRT, k.ol * 0.5);
    for (const s of [-1, 1]) k.shape([F.Q(s * 20, 0, 188), F.Q(s * 50, 0, 156), F.Q(s * 38, 0, 136), F.Q(s * 6, 0, 60)], shade(TWEED, 1.1), k.ol * 0.6);
    for (const a of [100, 66]) k.dot(...F.Q(0, 0, a), 5, "#6b4a1e");
    const c = F.Q(0, 0, 160); for (const s of [-1, 1]) k.shape([c, F.Q(s * 30, 0, 174), F.Q(s * 30, 0, 146)], BOW, k.ol * 0.6); k.dot(c[0], c[1], 8, shade(BOW, 0.8));
  },
  side: (k, _sk, F, d) => { const c = F.T(36 * d, 160); k.shape([c, [c[0] + 24 * d, c[1] - 14], [c[0] + 24 * d, c[1] + 14]], BOW, k.ol * 0.6); },
  chainFront: [[-90, -150], [-176, -40], [-40, 130]], chainSide: [[36, -148], [44, 130]],
  turn: 28, apronTop: 150, apronHem: -90, belt: 40,
};

export const BIGHEAD: Design = { id: "bighead", name: "Storskallen", ol: 9, faceW: 168, props: (w) => (w === "baker" ? BAKER : SIR), draw: drawSoft(cfg) };
