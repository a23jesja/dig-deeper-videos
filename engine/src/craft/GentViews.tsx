// The comparison before the freeze: the view sheet of the second skin (gent.ts) on the same skeleton as the chosen figure.
//   frame 0 = the stick gentleman from six sides (front, three-quarter, both side views, the shrug with the cane in the air, back),
//             his six faces, and the two skins standing next to each other with a side character in the same form
// PROPS='{"audio":false}' node scripts/stills.mjs GentViews out/craft/gent_ 0 1 jpeg
import React from "react";
import { AbsoluteFill } from "remotion";
import { Ink } from "./ink";
import { solve, POSES, Pose } from "./rig";
import { Design, FigOpts, Face } from "./designs/common";
import { SIR_D } from "./looks";
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
export const GentViews: React.FC = () => (<AbsoluteFill style={{ background: BG }}><canvas width={GW} height={GH} ref={(cv) => { if (cv) paint(cv.getContext("2d")!); }} /></AbsoluteFill>);
