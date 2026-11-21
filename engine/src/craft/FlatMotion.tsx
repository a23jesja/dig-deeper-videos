// The motion test of the flat 2D style A Knopp, drawn (flatMotionModel.ts has the model). 1080 x 1920, 30 fps, 10 s: the desert of the
// style sheet with its ground line, Sir and Ada, flat dust puffs behind the runner, and George's one line.
//   npx remotion render src/index.ts FlatMotionA out.mp4
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { Ink } from "./ink";
import { BGS } from "./FlatStyle";
import { FM, figsAt, scaleOf, EVENTS, FLAT_A } from "./flatMotionModel";

export const FLAT_MOTION_FRAMES = FM.FPS * FM.SECONDS;
type G = CanvasRenderingContext2D;
/** flat dust puffs where the back foot pushed off, fading in 0.5 s (three puffs every 0.25 s of the run) */
const puffs = (g: G, t: number) => {
  for (let t0 = EVENTS.T_RUN + 0.1; t0 < t && t0 < EVENTS.T_RUN + 1.6; t0 += 0.25) { const age = t - t0; if (age > 0.5) continue;
    const at = figsAt(t0).find((f) => f.name === "sir")!, x = at.x + 60, k = 1 - age / 0.5; g.globalAlpha = k;
    for (const [dx, dy, r] of [[0, -18, 26], [34, -10, 18], [60, -5, 11]]) { g.beginPath(); g.arc(x + dx + age * 40, FM.GY + dy - age * 20, r * (1 + age), 0, Math.PI * 2); g.fillStyle = "#efe6d2"; g.fill(); g.lineWidth = 6; g.strokeStyle = "#241726"; g.stroke(); }
    g.globalAlpha = 1; }
};
const paint = (g: G, t: number) => {
  g.setTransform(1, 0, 0, 1, 0, 0); BGS[0](g); puffs(g, t);
  for (const f of figsAt(t)) { const sc = scaleOf(f.who); g.save(); g.translate(f.x, FM.GY); g.scale(sc, sc); FLAT_A.draw(new Ink(g, FLAT_A.ol), f.sk, f.o); g.restore(); }
};
export const FlatMotionA: React.FC<{ audio?: boolean }> = ({ audio = true }) => {
  const fr = useCurrentFrame();
  return <AbsoluteFill style={{ background: "#f6e2b3" }}>
    <canvas width={FM.W} height={FM.H} ref={(cv) => { if (cv) paint(cv.getContext("2d")!, fr / FM.FPS); }} />
    {audio ? <Audio src={staticFile("craft/rorelseprov-a.wav")} /> : null}
  </AbsoluteFill>;
};
