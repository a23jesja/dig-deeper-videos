// Sheets for the corrections of faults inside the frozen look (DAILY-RULES: "Frozen means the style, not its faults"), sent to the
// reviewer before the corrected drawing is used in a video.
//   frame 0 = the eyes: open, half shut, shut, shut in a smile, from the front and at three quarters, for Sir Digsworth and two side
//             characters; large, and below at the size they have on a phone
//   frames 1-3 = the corrected beards (Jesper's five points): the captain, the man with the hook and the fuller, each from the front,
//             at three quarters and from the side, neutral, glad, angry, frightened and talking; large, and at phone size
//   frame 4 = Sir Digsworth in the same views and faces: his moustache is unchanged, and his mouth must read under it
// PROPS='{"audio":false}' node scripts/stills.mjs FaceSheet out/craft/face_ 0-4 1 jpeg
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Ink } from "./ink";
import { solve, POSES, Pose, Props } from "./rig";
import { Design, FigOpts, Face } from "./designs/common";
import { SIR, SIR_D, CAPTAIN_D, TITUS_D, CAPTAIN, MATE, FULLER, castDesign } from "./looks";

export const FW = 2600, FH = 2400, FACE_SHEET_FRAMES = 5;
const BG = "#ecdfc2", TXT = "#3b2a1a", CELL = "#e0d0aa";
type G = CanvasRenderingContext2D;
const neckTop = (P: Props) => P.thigh + P.shin + P.ankle + P.spine + P.neck;
/** the head and shoulders of a figure in a box whose middle is (cx, cy): `hs` = scale, the box is `bw` wide and `bh` high */
const bust = (g: G, D: Design, yaw: number, o: FigOpts, cx: number, cy: number, hs: number, bw: number, bh: number, pose: Pose = POSES.stand) => {
  const P = D.props("sir");
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = CELL; g.fillRect(cx - bw / 2, cy - bh / 2, bw, bh);
  g.save(); g.beginPath(); g.rect(cx - bw / 2, cy - bh / 2, bw, bh); g.clip();
  g.translate(cx, cy + bh * 0.2 + neckTop(P) * hs); g.scale(hs, hs); D.draw(new Ink(g, D.ol), solve(P, pose, yaw), o); g.restore();
};
const label = (g: G, t: string, x: number, y: number, px = 30, align: CanvasTextAlign = "center") => { g.setTransform(1, 0, 0, 1, 0, 0); g.font = `700 ${px}px Arial`; g.textAlign = align; g.fillStyle = TXT; g.fillText(t, x, y); };

const EYES: [string, Face][] = [["ÖPPET", { lid: 0.1 }], ["HALVT", { lid: 0.5 }], ["STÄNGT", { lid: 1 }], ["GLATT STÄNGT", { lid: 1, smile: 1, brow: 0.5 }]];
// the corrected beards, as looks of their own until the sheet is approved
const CAPTAIN2 = castDesign({ ...CAPTAIN, beard2: true, mouth2: true }), MATE2 = castDesign({ ...MATE, beard2: true, mouth2: true }), FULLER2 = castDesign({ ...FULLER, beard2: true, mouth2: true }), SIR2 = castDesign({ ...SIR, mouth2: true }, "Sir Digsworth");
const MOODS: [string, Face][] = [["NEUTRAL", {}], ["GLAD", { smile: 1, brow: 0.5, mouth: 0.5 }], ["ARG", { brow: -1, lid: 0.22, smile: -1, mouth: 0.14 }], ["FÖRSKRÄCKT", { wide: 1, lid: 0, brow: 1, mouth: 0.8, smile: -0.5 }], ["PRATAR", { mouth: 0.6, smile: 0.2 }]];
const VIEWS: [string, number, Pose][] = [["FRAMIFRÅN", 0, POSES.stand], ["SNETT FRAMIFRÅN", 45, POSES.stand], ["I PROFIL (SIDVYN)", 90, POSES.standSide]];
/** one figure: three views down, five faces across, large; the same at phone size underneath */
const moods = (g: G, title: string, D: Design) => {
  label(g, title, FW / 2, 70, 38);
  const X0 = 360, CWD = 440, BH = 560, Y0 = 150, big = 1.02;
  MOODS.forEach(([t], i) => label(g, t, X0 + i * CWD + CWD / 2, 132, 28));
  VIEWS.forEach(([v, yaw, pose], r) => { const cy = Y0 + r * (BH + 20) + BH / 2; label(g, v, 24, cy, 26, "left");
    MOODS.forEach(([, face], i) => bust(g, D, yaw, { face }, X0 + i * CWD + CWD / 2, cy, big, CWD - 16, BH, pose)); });
  const PY = Y0 + 3 * (BH + 20) + 50, ms = 1.16 / 3;
  label(g, "MOBILSTORLEK (EN TREDJEDEL AV FILMENS STORLEK)", 24, PY - 12, 26, "left");
  VIEWS.forEach(([, yaw, pose], r) => MOODS.forEach(([, face], i) => bust(g, D, yaw, { face }, X0 + (r * 5 + i) * 148 + 74, PY + 105, ms, 140, 190, pose)));
};
const sheet = (g: G, title: string, rows: [string, Design][], cols: [string, Face][]) => {
  label(g, title, FW / 2, 70, 40);
  const X0 = 330, CWD = 280, Y0 = 190, RH = (FH - Y0 - rows.length * 190 - 90) / rows.length, BH = Math.min(380, RH - 30), big = 0.8 * BH / 380;
  for (const [vi, v] of ["FRAMIFRÅN", "TREKVART"].entries()) label(g, v, X0 + (vi * 4 + 2) * CWD - CWD / 2 + 0, 128, 30);
  cols.forEach(([t], i) => { for (const vi of [0, 1]) label(g, t, X0 + (vi * 4 + i) * CWD + CWD / 2 - 140 + 140, 164, 22); });
  rows.forEach(([name, D], r) => {
    const cy = Y0 + r * RH + BH / 2 + 10; label(g, name, 30, cy, 30, "left");
    cols.forEach(([, face], i) => { for (const [vi, yaw] of [0, 45].entries()) bust(g, D, yaw, { face }, X0 + (vi * 4 + i) * CWD + CWD / 2, cy, big, CWD - 16, BH); });
  });
  // the same heads at the size they have on a phone (a Short shown 360 points wide: a third of the film's size)
  const PY = FH - rows.length * 190 - 30, ms = 1.16 / 3;
  label(g, "MOBILSTORLEK (EN TREDJEDEL AV FILMENS STORLEK)", 30, PY - 14, 26, "left");
  rows.forEach(([name, D], r) => {
    const cy = PY + 95 + r * 190; label(g, name, 30, cy, 24, "left");
    cols.forEach(([, face], i) => { for (const [vi, yaw] of [0, 45].entries()) bust(g, D, yaw, { face }, X0 + (vi * 4 + i) * CWD + CWD / 2, cy, ms, 170, 170); });
  });
};
const paint = (g: G, fr: number) => {
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = BG; g.fillRect(0, 0, FW, FH);
  if (fr === 0) sheet(g, "ÖGON: ETT STÄNGT ÖGA ÄR EN BÅGE UTAN RING (RÄTTNING INOM DET FRYSTA UTSEENDET)", [["SIR DIGSWORTH", SIR_D], ["KAPTENEN", CAPTAIN_D], ["TITUS", TITUS_D]], EYES);
  else if (fr === 1) moods(g, "SKÄGG, RÄTTAT: KAPTENEN", CAPTAIN2);
  else if (fr === 2) moods(g, "SKÄGG, RÄTTAT: MANNEN MED KROKEN", MATE2);
  else if (fr === 3) moods(g, "SKÄGG, RÄTTAT: TVÄTTAREN", FULLER2);
  else moods(g, "SIR DIGSWORTH: MUSTASCHEN OFÖRÄNDRAD, MUNNEN UNDER DEN", SIR2);
  g.setTransform(1, 0, 0, 1, 0, 0);
};
export const FaceSheet: React.FC = () => {
  const fr = useCurrentFrame();
  return (<AbsoluteFill style={{ background: BG }}><canvas width={FW} height={FH} ref={(cv) => { if (cv) paint(cv.getContext("2d")!, fr); }} /></AbsoluteFill>);
};
