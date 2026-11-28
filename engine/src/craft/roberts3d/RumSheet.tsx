// The rum stream's sheet (the reviewer's condition b, 28 Nov): the rum pirate pouring rum into his open mouth from arm's length, in three-quarter
// both ways and nearly from the front, the stream unbroken from the bottle's neck into his mouth, his mouth drawn over his beard (frame 0); the
// planted fault, the stream's end 30 px beside his mouth, for the check to fail (frame 1). Both at full size; the sheet is 2400 x 1500.
//   PROPS='{}' node scripts/stills.mjs RumSheet out/rob/rum_ 0-1 1 png
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Ink, hand as inkHand } from "../ink";
import { solve } from "../rig";
import { handFlip } from "../designs/common";
import { KIT_DESIGN } from "../wardrobe/kit";
import { RUM_LOOK, PIRATE_HEIGHTS } from "../wardrobe/pirates";
import { pour, pourPose, swig, swigPose, pourSide, RUM, type P2 } from "./rum";

export const RSW = 2400, RSH = 1500;
const TXT = "#2b1d12";
type G = CanvasRenderingContext2D;
/** the bottle (dark green glass with its ink), then his gripping fingers over it (the two-layer hand), then the stream (amber, its own thin ink) */
export const drawPour = (g: G, k: Ink, sk: ReturnType<typeof solve>, mouth: number, off: number, skin: string) => {
  const p = pour(sk, mouth, off), n: P2 = [-p.u[1], p.u[0]], side = (c: P2, w: number, s: number): P2 => [c[0] + n[0] * w * s, c[1] + n[1] * w * s];
  const body = [side(p.b0, RUM.bodyW / 2, 1), side(p.b1, RUM.bodyW / 2, 1), side(p.b1, RUM.neckW / 2, 1), side(p.n, RUM.neckW / 2, 1), side(p.n, RUM.neckW / 2, -1), side(p.b1, RUM.neckW / 2, -1), side(p.b1, RUM.bodyW / 2, -1), side(p.b0, RUM.bodyW / 2, -1)];
  k.group([body], "#2f5a3a");
  const hf = handFlip(sk, p.side, "grip"); inkHand(k, hf.w, hf.d, sk.P.hand, "grip", skin, hf.flip, false, k.ol, "fingers");
  const st = p.stream, w0 = 9, w1 = 6, rib: P2[] = [...st.map((q, i) => { const a = st[Math.min(st.length - 1, i + 1)], b = st[Math.max(0, i - 1)], d = [a[0] - b[0], a[1] - b[1]], l = Math.hypot(d[0], d[1]) || 1, w = w0 + (w1 - w0) * (i / (st.length - 1)); return [q[0] - (d[1] / l) * w, q[1] + (d[0] / l) * w] as P2; }),
    ...st.slice().reverse().map((q, ii) => { const i = st.length - 1 - ii, a = st[Math.min(st.length - 1, i + 1)], b = st[Math.max(0, i - 1)], d = [a[0] - b[0], a[1] - b[1]], l = Math.hypot(d[0], d[1]) || 1, w = w0 + (w1 - w0) * (i / (st.length - 1)); return [q[0] + (d[1] / l) * w, q[1] - (d[0] / l) * w] as P2; })];
  const kk = new Ink(g, 3); kk.group([rib], "#c8822a");      // (the stream's own thin ink, 3: the figures' 9 read as a rope)
  return p; };
/** the swig: the bottle (its body and neck), his gripping fingers over it */
export const drawSwig = (g: G, k: Ink, sk: ReturnType<typeof solve>, mouth: number, side: "L" | "R", skin: string, plant: "" | "eye" | "far" = "") => {
  const p = swig(sk, mouth, side, plant), n: P2 = [-p.u[1], p.u[0]], sd = (c: P2, w: number, s2: number): P2 => [c[0] + n[0] * w * s2, c[1] + n[1] * w * s2];
  k.group([[sd(p.b0, RUM.bodyW / 2, 1), sd(p.b1, RUM.bodyW / 2, 1), sd(p.b1, RUM.neckW / 2, 1), sd(p.n, RUM.neckW / 2, 1), sd(p.n, RUM.neckW / 2, -1), sd(p.b1, RUM.neckW / 2, -1), sd(p.b1, RUM.bodyW / 2, -1), sd(p.b0, RUM.bodyW / 2, -1)]], "#2f5a3a");
  const hf = handFlip(sk, side, "grip"); inkHand(k, hf.w, hf.d, sk.P.hand, "grip", skin, hf.flip, false, k.ol, "fingers"); void g; return p; };
const drawS = (g: G, yaw: number, plant: "" | "eye" | "far", x: number, y: number, sc: number) => {
  const pose = swigPose(yaw, 0.6, -24), sk = solve(KIT_DESIGN.props("sir"), pose, yaw), s = sc * (PIRATE_HEIGHTS.rum / 1.75);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.translate(x, y); g.scale(s, s); const k = new Ink(g, KIT_DESIGN.ol);
  KIT_DESIGN.draw(k, sk, { who: "sir", look: RUM_LOOK, face: { pupil: 1, mouth: 0.6, gaze: [0.2, -0.5], lid: 0.06, smile: 0.1 }, handR: "grip", handL: "grip" } as never);
  drawSwig(g, k, sk, 0.6, pourSide(yaw), (RUM_LOOK as unknown as { col: { skin: string } }).col.skin, plant); g.restore(); };
const draw = (g: G, yaw: number, off: number, x: number, y: number, sc: number) => {
  const pose = pourPose(yaw), sk = solve(KIT_DESIGN.props("sir"), pose, yaw), s = sc * (PIRATE_HEIGHTS.rum / 1.75);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.translate(x, y); g.scale(s, s); const k = new Ink(g, KIT_DESIGN.ol);
  KIT_DESIGN.draw(k, sk, { who: "sir", look: RUM_LOOK, face: { pupil: 1, mouth: 0.9, gaze: [0.2, -0.6], lid: 0.06, smile: 0.2 }, handR: "grip", handL: "grip" } as never);
  drawPour(g, k, sk, 0.9, off, (RUM_LOOK as unknown as { col: { skin: string } }).col.skin); g.restore(); };
const text = (g: G, t: string, x: number, y: number, px: number, wt = 700) => { g.setTransform(1, 0, 0, 1, 0, 0); g.font = `${wt} ${px}px Arial`; g.textAlign = "center"; g.fillStyle = TXT; g.fillText(t, x, y); };
export const RumSheet: React.FC = () => { const fr = useCurrentFrame();
  return <AbsoluteFill style={{ background: "#efe6d2" }}><canvas width={RSW} height={RSH} ref={(cv) => { if (!cv) return; const g = cv.getContext("2d")!; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, RSW, RSH);
    const plant = (["", "eye", "far"] as const)[Math.min(2, fr)];
    text(g, fr === 0 ? "Klunken: flaskhalsen vid mungipan, flaskan och handen utanför ansiktet, munnen över skägget" : fr === 1 ? "PLANTERAT FEL: flaskan över ögat (kontrollen ska fälla)" : "PLANTERAT FEL: halsen 30 px från munnen (kontrollen ska fälla)", 1200, 70, 40);
    [[45, 420], [-45, 1200], [15, 1980]].forEach(([yaw, x]) => { drawS(g, yaw, plant, x, 1380, 1.6); text(g, `${yaw}°`, x, 1440, 30); }); void draw; }} /></AbsoluteFill>; };
