// Direction E, "Long-shanks": a tall, narrow gentleman for a tall, narrow picture. A small head on a long neck, a cap like a pancake and
// a waxed moustache wider than his shoulders make a T on top of two very long legs; coat tails and a cane trail behind every move.
import { Ink, P2, sym, spline, ellPts, shade, eye, monocle } from "../ink";
import { Props } from "../rig";
import { Design, Face } from "./common";
import { drawSoft, briar, Soft } from "./soft";

const TWEED = "#a17d4b", TWEED_D = "#7a5c36", WEAVE = "rgba(74,50,26,0.33)", SKIN = "#f6cda8", SKIN_D = "#e2a883", MOUS = "#4f3019", SHIRT = "#f8f1e0", BOW = "#8f2f3d", VEST = "#cda23c";
const BSKIN = "#eebf96", HAIR = "#3f2a1c";
const SIR: Props = { thigh: 300, shin: 290, ankle: 30, foot: 158, hipW: 38, shW: 78, spine: 285, shDrop: 22, neck: 72, head: 136, upper: 190, fore: 185, hand: 94 };
const BAKER: Props = { thigh: 250, shin: 245, ankle: 28, foot: 150, hipW: 46, shW: 86, spine: 290, shDrop: 24, neck: 54, head: 140, upper: 185, fore: 178, hand: 96 };

const capFront = (k: Ink, lift: number) => {
  k.g.save(); k.g.translate(-lift * 12, -lift * 34);
  const crown = spline([[-90, -110], [-100, -128], [-62, -148], [0, -154], [66, -149], [102, -128], [92, -110], [0, -104]]);
  k.shape(crown, TWEED, 0); k.tweed(crown, WEAVE, [0, -130], 8, 12); k.shadeEdge(crown, TWEED_D, 14, 9); k.shape(crown, null);
  k.shape(spline([[-74, -113], [-40, -99], [0, -93], [40, -99], [74, -113], [0, -109]]), TWEED_D); k.shape(ellPts(3, -155, 10, 5), TWEED_D);
  k.g.restore();
};
const sirFront = (k: Ink, f: Face, tx: number, lift: number) => {
  const head = spline(sym([[0, 4], [24, 0], [42, -30], [47, -76], [41, -112], [23, -132], [0, -137]]));
  for (const s of [-1, 1]) k.shape(ellPts(s * 46, -74, 9, 15, s * 8), SKIN);
  k.shape(head, SKIN, 0); k.shadeEdge(head, SKIN_D, 12, 6); k.shape(head, null);
  k.g.save(); k.g.translate(tx, 0);
  if ((f.mouth ?? 0) > 0.05) k.shape(ellPts(0, -12, 13, 4 + 11 * f.mouth!), "#5a1e28", k.ol * 0.5); else k.line(spline([[-10, -14], [0, -11], [10, -14]], false, 5), k.ol * 0.45);
  briar(k, [9, -18], [84, 30], 0.72);
  for (const s of [-1, 1]) k.shape(spline(([[0, -37], [40, -43], [88, -37], [122, -43], [137, -68], [132, -37], [92, -22], [40, -27], [0, -24]] as P2[]).map(([x, y]) => [x * s, y] as P2)), MOUS, k.ol * 0.8);
  const nose = spline([[-5, -80], [-7, -56], [-12, -45], [0, -36], [12, -45], [7, -56], [5, -80]]);
  k.shape(nose, shade(SKIN, 0.97), 0); k.line(spline([[-8, -56], [-12, -45], [0, -36], [12, -45], [8, -56]], false, 6), k.ol * 0.6);
  const ry = 18 * (1 + 0.25 * (f.wide ?? 0)), lid = f.lid ?? 0.2;
  eye(k, -17, -84, 14, ry, { skin: SKIN, gaze: f.gaze, lid, ol: k.ol * 0.45 }); eye(k, 17, -84, 14, ry, { skin: SKIN, gaze: f.gaze, lid, ol: k.ol * 0.45 });
  monocle(k, -17, -84, 20, 22, 4.6);
  const b = (f.brow ?? 0) * 6; for (const s of [-1, 1]) k.line(spline([[s * 5, -106 - b * 0.4], [s * 18, -111 - b], [s * 32, -105 - b * 0.6]], false, 5), 5, MOUS);
  k.g.restore();
  capFront(k, lift);
};
const sirSide = (k: Ink, f: Face, lift: number) => {
  const head = spline([[-22, 2], [-42, -40], [-46, -90], [-36, -124], [-8, -138], [20, -132], [32, -110], [34, -88], [38, -78], [64, -44], [42, -36], [36, -26], [38, -12], [26, 2], [4, 6]]);
  k.shape(head, SKIN, 0); k.shadeEdge(head, SKIN_D, -10, 6); k.shape(head, null);
  k.shape(ellPts(-12, -76, 9, 15, -6), SKIN);
  if ((f.mouth ?? 0) > 0.05) k.shape(ellPts(30, -12, 8, 3 + 10 * f.mouth!), "#5a1e28", k.ol * 0.5);
  briar(k, [34, -17], [104, 26], 0.72);
  k.shape(spline([[48, -37], [20, -43], [-20, -37], [-52, -45], [-65, -68], [-59, -37], [-22, -22], [20, -26], [46, -28]]), MOUS, k.ol * 0.8);
  eye(k, 22, -84, 10, 17 * (1 + 0.25 * (f.wide ?? 0)), { skin: SKIN, gaze: f.gaze ?? [0.5, 0], lid: f.lid ?? 0.2, ol: k.ol * 0.45 });
  monocle(k, 22, -84, 14, 21, 4.6);
  const b = (f.brow ?? 0) * 6; k.line(spline([[10, -106 - b], [22, -111 - b], [34, -104 - b * 0.5]], false, 5), 5, MOUS);
  k.g.save(); k.g.translate(-lift * 30, -lift * 30); k.g.rotate(-lift * 0.3);
  const crown = spline([[-78, -106], [-88, -128], [-50, -150], [4, -154], [48, -143], [66, -122], [56, -108], [0, -102]]);
  k.shape(crown, TWEED, 0); k.tweed(crown, WEAVE, [0, -130], 8, 12); k.shadeEdge(crown, TWEED_D, -12, 9); k.shape(crown, null);
  k.shape(spline([[30, -121], [70, -117], [114, -105], [114, -96], [70, -104], [34, -107]]), TWEED_D);
  k.g.restore();
};
const bakerFront = (k: Ink, f: Face, tx: number) => {
  const head = spline(sym([[0, 4], [20, 0], [40, -34], [50, -84], [42, -120], [22, -137], [0, -141]]));
  for (const s of [-1, 1]) { k.shape(ellPts(s * 50, -72, 10, 16, s * 8), shade(BSKIN, 0.92)); k.shape(spline([[s * 44, -122], [s * 62, -104], [s * 58, -76], [s * 46, -92]]), HAIR, k.ol * 0.6); }
  k.shape(head, BSKIN, 0); k.shadeEdge(head, shade(BSKIN, 0.86), 12, 6); k.shape(head, null);
  k.g.save(); k.g.translate(tx, 0);
  k.line(spline([[-18, -22], [0, -14], [18, -22]], false, 5), k.ol * 0.6);
  if ((f.mouth ?? 0) > 0.05) k.shape(ellPts(0, -16, 14, 4 + 11 * f.mouth!), "#5a1e28", k.ol * 0.5);
  k.shape(ellPts(0, -48, 15, 13), shade(BSKIN, 0.9), k.ol * 0.6);
  for (const s of [-1, 1]) { eye(k, s * 19, -80, 13, 15 * (1 + 0.25 * (f.wide ?? 0)), { skin: BSKIN, gaze: f.gaze, lid: f.lid ?? 0.08, ol: k.ol * 0.45 }); k.line(spline([[s * 6, -100], [s * 20, -105], [s * 34, -99]], false, 5), 6, HAIR); }
  k.g.restore();
};
const bakerSide = (k: Ink, f: Face) => {
  const head = spline([[-22, 2], [-44, -40], [-50, -92], [-38, -126], [-8, -141], [22, -134], [34, -110], [34, -86], [40, -74], [62, -52], [40, -40], [38, -26], [38, -12], [26, 2], [4, 6]]);
  k.shape(head, BSKIN, 0); k.shadeEdge(head, shade(BSKIN, 0.86), -10, 6); k.shape(head, null);
  k.shape(spline([[-48, -112], [-30, -124], [-12, -100], [-18, -70], [-44, -62]]), HAIR, k.ol * 0.6); k.shape(ellPts(-10, -74, 9, 15, -6), shade(BSKIN, 0.92));
  k.line(spline([[22, -18], [32, -16], [40, -22]], false, 5), k.ol * 0.6);
  if ((f.mouth ?? 0) > 0.05) k.shape(ellPts(32, -14, 8, 3 + 10 * f.mouth!), "#5a1e28", k.ol * 0.5);
  eye(k, 22, -82, 10, 15 * (1 + 0.25 * (f.wide ?? 0)), { skin: BSKIN, gaze: f.gaze ?? [0.5, 0], lid: f.lid ?? 0.08, ol: k.ol * 0.45 });
  k.line(spline([[10, -102], [22, -106], [34, -100]], false, 5), 6, HAIR);
};

const cfg: Soft = {
  sir: { rows: [[-30, 62, 50, 56], [60, 50, 44, 46], [190, 70, 56, 52], [262, 84, 46, 48], [286, 28, 26, 28]], arm: [25, 18, 13], armB: [0, 3], leg: [31, 20, 14], legB: [3, 8], shoeW: 44, shoeH: [0.3, 0.16], neck: 17 },
  baker: { rows: [[-150, 94, 72, 80], [-40, 102, 110, 78], [60, 98, 120, 74], [190, 80, 72, 60], [264, 88, 50, 52], [290, 28, 26, 28]], arm: [20, 15, 11], armB: [0, 5], leg: [28, 17, 12], legB: [0, 9], shoeW: 44, neck: 16 },
  col: { coat: TWEED, coatD: TWEED_D, weave: WEAVE, trous: "#6f6b62", shoe: "#2a2220", skin: SKIN, skinD: SKIN_D, shirt: SHIRT, tunic: "#e8d6a4", apron: "#f8f3e6", bakerSkin: BSKIN },
  heads: { sirFront, sirSide, bakerFront, bakerSide },
  front: (k, _sk, F) => {
    k.shape([F.Q(-24, 0, 262), F.Q(24, 0, 262), F.Q(18, 0, 60), F.Q(-18, 0, 60)], VEST, k.ol * 0.5);
    k.shape([F.Q(-18, 0, 300), F.Q(18, 0, 300), F.Q(0, 0, 200)], SHIRT, k.ol * 0.5);
    for (const s of [-1, 1]) k.shape([F.Q(s * 18, 0, 290), F.Q(s * 52, 0, 246), F.Q(s * 38, 0, 222), F.Q(s * 6, 0, 110)], shade(TWEED, 1.1), k.ol * 0.6);
    for (const a of [170, 130, 90]) k.dot(...F.Q(0, 0, a), 5, "#6b4a1e");
    const c = F.Q(0, 0, 272); for (const s of [-1, 1]) k.shape([c, F.Q(s * 26, 0, 284), F.Q(s * 26, 0, 260)], BOW, k.ol * 0.6); k.dot(c[0], c[1], 7, shade(BOW, 0.8));
  },
  side: (k, _sk, F, d) => { const c = F.T(28 * d, 270); k.shape([c, [c[0] + 22 * d, c[1] - 13], [c[0] + 22 * d, c[1] + 13]], BOW, k.ol * 0.6); },
  // coat tails: they hang behind the legs and will trail a moment late when he moves
  tail: (k, _sk, F, d, sideOn) => {
    const draw = (pts: P2[]) => { const t = spline(pts, true, 5); k.shape(t, TWEED, 0); k.tweed(t, WEAVE, F.o, F.tilt, 15); k.shadeEdge(t, TWEED_D, 12, 6); k.shape(t, null); };
    if (sideOn) draw([F.T(-46 * d, 60), F.T(-66 * d, -120), F.T(-92 * d, -312), F.T(-38 * d, -288), F.T(-6 * d, -60)]);
    else for (const s of [-1, 1]) draw([F.T(s * 20, 10), F.T(s * 66, -10), F.T(s * 62, -292), F.T(s * 22, -256)]);
  },
  chainFront: [[-31, -68], [-62, -20], [-34, 236]], chainSide: [[12, -68], [34, 236]],
  turn: 12, apronTop: 200, apronHem: -160, belt: 60,
};

export const LANKY: Design = { id: "lanky", name: "Långskanken", ol: 8, faceW: 142, props: (w) => (w === "baker" ? BAKER : SIR), draw: drawSoft(cfg) };
