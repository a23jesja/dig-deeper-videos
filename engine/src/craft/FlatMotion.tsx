// The motion test of the flat 2D style A Knopp, drawn (flatMotionModel.ts has the model). 1080 x 1920, 30 fps, 10 s: the desert of the
// style sheet with its ground line, Sir and Ada, flat dust puffs behind the runner, and George's one line.
//   npx remotion render src/index.ts FlatMotionA out.mp4
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { Ink } from "./ink";
import { BGS } from "./FlatStyle";
import { FM, figsAt, scaleOf, EVENTS, FLAT_A, SECONDS, T_SNAKE } from "./flatMotionModel";

export const FLAT_MOTION_FRAMES = Math.round(FM.FPS * SECONDS);
type G = CanvasRenderingContext2D;
/** flat dust puffs where the back foot pushed off, fading in 0.5 s (three puffs every 0.25 s of the run) */
const puffs = (g: G, t: number) => {
  for (let t0 = EVENTS.T_RUN + 0.1; t0 < t && t0 < EVENTS.T_RUN + 1.6; t0 += 0.25) { const age = t - t0; if (age > 0.5) continue;
    const at = figsAt(t0).find((f) => f.name === "sir")!, x = at.x + 60, k = 1 - age / 0.5; g.globalAlpha = k;
    for (const [dx, dy, r] of [[0, -18, 26], [34, -10, 18], [60, -5, 11]]) { g.beginPath(); g.arc(x + dx + age * 40, FM.GY + dy - age * 20, r * (1 + age), 0, Math.PI * 2); g.fillStyle = "#efe6d2"; g.fill(); g.lineWidth = 6; g.strokeStyle = "#241726"; g.stroke(); }
    g.globalAlpha = 1; }
};
/** the snake that comes up out of the sand where he pointed ("the treasure is buried right there"): what scares them (the review of v2: nothing
 *  caused the fright). A flat green body rising from a little sand hole in 0.2 s, swaying, its tongue flicking */
const SNAKE_X = FM.W / 2 + 0.14 * FM.PPM;
const snake = (g: G, t: number) => {
  const u = Math.max(0, Math.min(1, (t - T_SNAKE) / 0.2)); if (u <= 0) return;
  const ink = "#241726", e = u * u * (3 - 2 * u), hgt = 175 * e, sw = Math.sin((t - T_SNAKE) * 4) * 14 * e, x0 = SNAKE_X, y0 = FM.GY;
  g.beginPath(); g.ellipse(x0, y0 + 4, 46, 12, 0, 0, Math.PI * 2); g.fillStyle = "#b47b3e"; g.fill(); g.lineWidth = 6; g.strokeStyle = ink; g.stroke();
  const pts: [number, number][] = []; for (let i = 0; i <= 12; i++) { const v = i / 12; pts.push([x0 + Math.sin(v * 3.2) * 18 * (1 - v) + sw * v, y0 - hgt * v]); }
  for (const [w, col] of [[44, ink], [30, "#5fa83c"]] as [number, string][]) { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.lineWidth = w; g.lineCap = "round"; g.lineJoin = "round"; g.strokeStyle = col; g.stroke(); }
  const [hx, hy] = pts[12]; g.beginPath(); g.ellipse(hx + 8, hy, 34, 24, 0, 0, Math.PI * 2); g.fillStyle = "#5fa83c"; g.fill(); g.lineWidth = 7; g.strokeStyle = ink; g.stroke();
  for (const dx of [-6, 20]) { g.beginPath(); g.ellipse(hx + dx, hy - 6, 9, 11, 0, 0, Math.PI * 2); g.fillStyle = "#ffffff"; g.fill(); g.lineWidth = 4; g.stroke(); g.beginPath(); g.arc(hx + dx + 2, hy - 4, 4.5, 0, Math.PI * 2); g.fillStyle = ink; g.fill(); }
  if (Math.floor((t - T_SNAKE) * 6) % 2 === 0) { g.beginPath(); g.moveTo(hx + 40, hy + 8); g.lineTo(hx + 62, hy + 10); g.lineTo(hx + 70, hy + 4); g.moveTo(hx + 62, hy + 10); g.lineTo(hx + 70, hy + 16); g.lineWidth = 4; g.strokeStyle = "#d9483b"; g.stroke(); }
};
const paint = (g: G, t: number) => {
  g.setTransform(1, 0, 0, 1, 0, 0); BGS[0](g); puffs(g, t); snake(g, t);
  for (const f of figsAt(t)) { const sc = scaleOf(f.who); g.save(); g.translate(f.x, FM.GY); g.scale(sc, sc); FLAT_A.draw(new Ink(g, FLAT_A.ol), f.sk, f.o); g.restore(); }
};
export const FlatMotionA: React.FC<{ audio?: boolean }> = ({ audio = true }) => {
  const fr = useCurrentFrame();
  return <AbsoluteFill style={{ background: "#f6e2b3" }}>
    <canvas width={FM.W} height={FM.H} ref={(cv) => { if (cv) paint(cv.getContext("2d")!, fr / FM.FPS); }} />
    {audio ? <Audio src={staticFile("craft/rorelseprov-a.wav")} /> : null}
  </AbsoluteFill>;
};
