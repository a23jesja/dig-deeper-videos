// The comparison before the freeze: the view sheet of the second skin (gent.ts) on the same skeleton as the chosen figure.
//   frame 0 = the stick gentleman from six sides (front, three-quarter, both side views, the shrug with the cane in the air, back),
//             his six faces, and the two skins standing next to each other with a side character in the same form
// PROPS='{"audio":false}' node scripts/stills.mjs GentViews out/craft/gent_ 0 1 jpeg
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Ink } from "./ink";
import { solve, POSES, Pose } from "./rig";
import { Design, FigOpts, Face } from "./designs/common";
import { SIR_D, BAKER_D, SOLDIER_D } from "./looks";
import { GENT_D, GENT_BAKER_D } from "./gent";

export const GW = 2600, GH = 1900;
const BG = "#ecdfc2", FLOOR = "#cfbb90", TXT = "#3b2a1a";
type G = CanvasRenderingContext2D;
const fig = (g: G, D: Design, pose: Pose, yaw: number, o: FigOpts, x: number, y: number, sc: number) => { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.translate(x, y); g.scale(sc, sc); D.draw(new Ink(g, D.ol), solve(D.props("sir"), pose, yaw), o); g.restore(); };
const label = (g: G, t: string, x: number, y: number, px = 30) => { g.setTransform(1, 0, 0, 1, 0, 0); g.font = `700 ${px}px Arial`; g.textAlign = "center"; g.fillStyle = TXT; g.fillText(t, x, y); };
// his hand rests on the cane; the shrug lifts both open hands and the cane with them
const CANE: Pose = { ...POSES.stand, armL: [[8, 17], [26, 5]] }, CANE_SIDE: Pose = { ...POSES.standSide, armL: [[20, 6], [34, 3]] };
const SHRUG: Pose = { ...POSES.stand, armL: [[2, 16], [34, 96]], armR: [[2, 16], [34, 96]], handL: -30, handR: -30, head: [0, 0, 8], roll: 2 };
const FACES: [string, Face][] = [["NEUTRAL", {}], ["FÖRTJUST", { lid: 1, smile: 1 }], ["CHOCKAD", { wide: 1, lid: 0, brow: 1, mouth: 0.7 }], ["MISSTÄNKSAM", { lid: 0.5, brow: -0.45, smile: -0.5, gaze: [0.7, 0] }], ["ARG", { brow: -1, smile: -1, lid: 0.2 }], ["SKRATTAR", { lid: 1, smile: 1, mouth: 0.9 }]];

const paint = (g: G) => {
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = BG; g.fillRect(0, 0, GW, GH);
  const D = GENT_D, P = D.props("sir"), sc = 0.74, FY = 900;
  g.fillStyle = FLOOR; g.fillRect(20, FY, GW - 40, 20);
  const views: [string, Pose, number, FigOpts][] = [
    ["FRAMIFRÅN", CANE, 0, { prop: "cane", handL: "grip" }], ["SNETT FRAMIFRÅN", CANE, -38, { prop: "cane", handL: "grip" }], ["FRÅN SIDAN", CANE_SIDE, -90, { prop: "cane", handL: "grip" }],
    ["SIDAN ÅT ANDRA HÅLLET", POSES.standSide, 90, {}], ["AXELRYCKNING", SHRUG, -16, { prop: "cane", handL: "open", handR: "open", face: { brow: 0.7, smile: -0.5, gaze: [-0.5, 0] } }], ["BAKIFRÅN", CANE, 180, { prop: "cane", handL: "grip" }],
  ];
  views.forEach(([t, pose, yaw, o], i) => { const x = 230 + i * 428; fig(g, D, pose, yaw, o, x, FY, sc); label(g, t, x, FY + 66); });
  // the six faces
  const hs = 1.12, hy = P.thigh + P.shin + P.ankle + P.spine + P.neck, FY2 = 1500;
  FACES.forEach(([t, face], i) => {
    const cx = 190 + i * 300, cy = FY2 - 190;
    g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = "#e0d0aa"; g.fillRect(cx - 140, cy - 240, 280, 420);
    g.save(); g.beginPath(); g.rect(cx - 140, cy - 240, 280, 420); g.clip(); fig(g, D, POSES.stand, 0, { face }, cx, cy + 60 + hy * hs, hs); g.restore();
    label(g, t, cx, FY2 + 50, 28);
  });
  // the two skins on the same skeleton, and a side character in the same form
  const x0 = 1960, FY3 = 1800, s3 = 0.56;
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = FLOOR; g.fillRect(x0 - 130, FY3, 740, 16);
  fig(g, SIR_D, POSES.stand, 0, {}, x0, FY3, s3); fig(g, D, POSES.stand, 0, {}, x0 + 240, FY3, s3); fig(g, GENT_BAKER_D, POSES.stand, -25, { face: { smile: 0.8 } }, x0 + 480, FY3, s3 * 1.02);
  label(g, "A", x0, FY3 + 56); label(g, "B", x0 + 240, FY3 + 56); label(g, "BIFIGUR I B:S FORM", x0 + 480, FY3 + 56, 22);
  label(g, "B: STRECKHERREN PÅ SAMMA SKELETT OCH SAMMA RÖRELSER SOM A", 900, 80, 36);
  g.setTransform(1, 0, 0, 1, 0, 0);
};
// frame 1 = the figure Jesper chose (A with a head a quarter larger, larger eyes and mouth, a side view that is the same man):
//           five views between the same guide lines, six faces, the faces at phone size beside B's, two side characters
const A_FACES: [string, Face][] = [["NEUTRAL", {}], ["FÖRTJUST", { lid: 0.9, smile: 1, brow: 0.5 }], ["CHOCKAD", { wide: 1, lid: 0, brow: 1, mouth: 0.8, smile: -0.3 }], ["MISSTÄNKSAM", { lid: 0.52, brow: -0.5, smile: -0.6, gaze: [0.8, 0] }], ["ARG", { brow: -1, lid: 0.22, smile: -1, mouth: 0.14 }], ["SKRATTAR", { lid: 0.9, smile: 1, mouth: 1, brow: 0.4 }]];
const tall = (D: Design) => { const P = D.props("sir"); return P.thigh + P.shin + P.ankle + P.spine + P.neck + P.head; };
const paintA = (g: G) => {
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = BG; g.fillRect(0, 0, GW, GH);
  const D = SIR_D, P = D.props("sir"), sc = 0.7, FY = 900, T = tall(D);
  label(g, "DEN VALDA FIGUREN: A MED 25 % STÖRRE HUVUD, STÖRRE ÖGON OCH MUN, SIDOVY SOM ÄR SAMMA MAN", 1010, 64, 30);
  g.strokeStyle = "rgba(120,90,50,0.4)"; g.lineWidth = 2; g.setLineDash([10, 10]);
  for (const hgt of [T, P.thigh + P.shin + P.ankle + P.spine + P.neck, P.thigh + P.shin + P.ankle + P.spine - P.shDrop, P.thigh + P.shin + P.ankle]) { g.beginPath(); g.moveTo(30, FY - hgt * sc); g.lineTo(1810, FY - hgt * sc); g.stroke(); }
  g.setLineDash([]); g.fillStyle = FLOOR; g.fillRect(20, FY, GW - 40, 20);
  const views: [string, Pose, number][] = [["FRAMIFRÅN", POSES.stand, 0], ["SNETT FRAMIFRÅN", POSES.stand, 45], ["FRÅN SIDAN", POSES.standSide, 90], ["SIDAN ÅT ANDRA HÅLLET", POSES.standSide, -90], ["BAKIFRÅN", POSES.stand, 180]];
  views.forEach(([t, pose, yaw], i) => { const x = 200 + i * 360; fig(g, D, pose, yaw, {}, x, FY, sc); label(g, t, x, FY + 62, 24); });
  label(g, "FÖRE (SAMMA SKALA)", 2230, FY + 62, 24);
  // six faces, large
  const hs = 0.92, hy = P.thigh + P.shin + P.ankle + P.spine + P.neck, FY2 = 1440;
  A_FACES.forEach(([t, face], i) => {
    const cx = 170 + i * 290, cy = FY2 - 170;
    g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = "#e0d0aa"; g.fillRect(cx - 135, cy - 250, 270, 400);
    g.save(); g.beginPath(); g.rect(cx - 135, cy - 250, 270, 400); g.clip(); fig(g, D, POSES.stand, 0, { face }, cx, cy + 40 + hy * hs, hs); g.restore();
    label(g, t, cx, FY2 + 26, 26);
  });
  // the same faces at the size they have on a phone (a Short shown 360 points wide), A above B
  const ms = 1.16 / 3, FY3 = 1640;
  label(g, "MOBILSTORLEK: A", 150, FY3 - 40, 22); label(g, "MOBILSTORLEK: B", 150, FY3 + 130, 22);
  A_FACES.forEach(([, face], i) => { const cx = 330 + i * 150; for (const [DD, dy, fc] of [[D, 0, face], [GENT_D, 170, FACES[i][1]]] as [Design, number, Face][]) { const PP = DD.props("sir"), yy = FY3 + dy; g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.beginPath(); g.rect(cx - 72, yy - 110, 144, 160); g.clip(); fig(g, DD, POSES.stand, 0, { face: fc }, cx, yy + 40 + (PP.thigh + PP.shin + PP.ankle + PP.spine + PP.neck) * ms, ms); g.restore(); } });
  // the side view laughing and shocked, and two side characters with the same larger heads
  const s4 = 0.42, FYs = 1500, FY4 = 1860, s5 = 0.28;
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = FLOOR; g.fillRect(1820, FYs, 740, 14); g.fillRect(1300, FY4, 1260, 14);
  fig(g, D, POSES.standSide, 90, { face: { smile: 1, mouth: 0.9, lid: 0.9, brow: 0.4 } }, 2000, FYs, s4); fig(g, D, POSES.standSide, -90, { face: { wide: 1, lid: 0, brow: 1, mouth: 0.8 } }, 2370, FYs, s4);
  label(g, "SIDAN: SKRATTAR, CHOCKAD", 2190, FYs + 44, 22);
  fig(g, BAKER_D, POSES.stand, 0, { face: { smile: 0.9 } }, 1420, FY4, s5); fig(g, BAKER_D, POSES.standSide, 90, {}, 1640, FY4, s5);
  fig(g, SOLDIER_D, POSES.stand, 0, {}, 1900, FY4, s5); fig(g, SOLDIER_D, POSES.standSide, -90, {}, 2120, FY4, s5); fig(g, D, POSES.stand, 0, {}, 2400, FY4, s5);
  label(g, "BIFIGURER MED SAMMA STÖRRE HUVUD (BAGAREN, SOLDATEN) BREDVID SIR DIGSWORTH", 1930, FY4 + 40, 20);
  g.setTransform(1, 0, 0, 1, 0, 0);
};
export const GentViews: React.FC = () => { const fr = useCurrentFrame(); return (<AbsoluteFill style={{ background: BG }}><canvas width={GW} height={GH} ref={(cv) => { if (cv) (fr ? paintA : paint)(cv.getContext("2d")!); }} /></AbsoluteFill>); };
