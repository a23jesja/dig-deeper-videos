// The expression sheet (Jesper 2026-11-20, DAILY-RULES "Lessons from the best reference Shorts" points 8-11): six big, unmistakable faces
// for Sir Digsworth and for a supporting figure (the mate of the eye patch Short), each one readable with the sound off. Close framing: the
// head and shoulders fill the cell. The outlines are drawn thick and even (point 11). Below each row the same faces at the size a close
// shot has on a phone, to show they still read there.
//   PROPS='{"audio":false}' node scripts/stills.mjs ExpressionSheet out/craft/expr_ 0 1 png
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Ink } from "./ink";
import { solve, POSES, Props } from "./rig";
import { Design, FigOpts, Face } from "./designs/common";
import { SIR_D, MATE_SHORT_D } from "./looks";

export const EW = 2700, EH = 2000;
const BG = "#ece2c8", TXT = "#2b1d12", CELL = "#d9c8a0";
type G = CanvasRenderingContext2D;
const neckTop = (P: Props) => P.thigh + P.shin + P.ankle + P.spine + P.neck;
/** the six faces: what each one is, and the face values that make it */
export const EXPRESSIONS: [string, string, Face][] = [
  ["HÅRT BLUNDANDE", "ögonen hårt ihopknipna", { squeeze: 1, brow: -1, smile: -0.5, lid: 0 }],
  ["EN TÅR", "ledsna ögonbryn, en tår rinner", { tear: 1, sad: 1, smile: -1, lid: 0.3, mouth: 0, gaze: [0, 0.4] }],
  ["GRIMAS", "knipna ögon, sammanbitna tänder", { squeeze: 1, teeth: 1, brow: -1, smile: -0.3 }],
  ["SJÄLVBELÅTEN", "halvblick åt sidan, ena mungipan upp", { lid: 0.6, smirk: 1, brow: -0.3, smile: 0.15, gaze: [0.7, 0] }],
  ["CHOCK", "stora ögon, små pupiller, gapande", { wide: 1, lid: 0, brow: 1, pupil: 0.55, mouth: 0.75, smile: -0.4 }],
  ["FÖRTJUST", "glada bågar, stort leende", { lid: 1, smile: 1, brow: 0.7, mouth: 0.65 }],
];
/** OUTLINE: how much thicker than the figure's own line the sheet draws (point 11: thick, even outlines) */
const OUTLINE = 1.35;
const bust = (g: G, D: Design, yaw: number, o: FigOpts, cx: number, cy: number, hs: number, bw: number, bh: number, lift = 0.42) => {
  const P = D.props("sir");
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = CELL; g.fillRect(cx - bw / 2, cy - bh / 2, bw, bh);
  g.save(); g.beginPath(); g.rect(cx - bw / 2, cy - bh / 2, bw, bh); g.clip();
  g.translate(cx, cy + bh * lift + neckTop(P) * hs); g.scale(hs, hs); D.draw(new Ink(g, D.ol * OUTLINE), solve(P, POSES.stand, yaw), o); g.restore();
};
const text = (g: G, t: string, x: number, y: number, px: number, weight = 700, align: CanvasTextAlign = "center") => {
  g.setTransform(1, 0, 0, 1, 0, 0); g.font = `${weight} ${px}px Arial`; g.textAlign = align; g.fillStyle = TXT; g.fillText(t, x, y); };
const row = (g: G, D: Design, name: string, y0: number, big: number, lift: number) => {
  const X0 = 60, CW = (EW - 2 * X0) / 6, BH = 560, small = big * 0.27, SB = 150;
  text(g, name, X0, y0 - 18, 40, 800, "left");
  EXPRESSIONS.forEach(([title, what, face], i) => { const cx = X0 + i * CW + CW / 2;
    bust(g, D, 18, { face }, cx, y0 + BH / 2, big, CW - 20, BH, lift);
    text(g, title, cx, y0 + BH + 42, 30, 800); text(g, what, cx, y0 + BH + 78, 22, 400);
    bust(g, D, 18, { face }, cx, y0 + BH + 100 + SB / 2, small, SB * 0.9, SB, lift); });
};
const paint = (g: G) => {
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = BG; g.fillRect(0, 0, EW, EH);
  text(g, "SEX ANSIKTSUTTRYCK: ansiktet bär skämtet, och det går fram utan ljud", EW / 2, 64, 44, 800);
  text(g, "Stort: nära inramning, huvud och axlar fyller rutan. Litet: samma ansikte i den storlek en närbild har på en telefon. Kontur 1,35 gånger figurens egen, jämn.", EW / 2, 108, 24, 400);
  row(g, SIR_D, "SIR DIGSWORTH", 190, 1.18, 0.38);
  row(g, MATE_SHORT_D, "BIFIGUR: KAMRATEN (ur ögonlappen)", 1100, 1.4, 0.36);
  g.setTransform(1, 0, 0, 1, 0, 0);
};
export const ExpressionSheet: React.FC = () => {
  useCurrentFrame();
  return <AbsoluteFill style={{ background: BG }}><canvas width={EW} height={EH} ref={(cv) => { if (cv) paint(cv.getContext("2d")!); }} /></AbsoluteFill>;
};
