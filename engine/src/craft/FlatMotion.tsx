// The motion test of the flat 2D style A Knopp, drawn (flatMotionModel.ts has the model). 1080 x 1920, 30 fps, 10 s: the desert of the
// style sheet with its ground line, Sir and Ada, flat dust puffs behind the runner, and George's one line.
//   npx remotion render src/index.ts FlatMotionA out.mp4
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { Ink } from "./ink";
import { BGS } from "./FlatStyle";
import { FM, figsAt, scaleOf, EVENTS, FLAT_A, SECONDS, SNAKE, footY, snakeAt } from "./flatMotionModel";

export const FLAT_MOTION_FRAMES = Math.round(FM.FPS * SECONDS);
type G = CanvasRenderingContext2D;
/** flat dust puffs where the back foot pushed off, fading in 0.5 s (three puffs every 0.25 s of the run) */
const puffs = (g: G, t: number) => {
  for (let t0 = EVENTS.T_RUN + 0.1; t0 < t && t0 < EVENTS.T_RUN + 1.6; t0 += 0.25) { const age = t - t0; if (age > 0.5) continue;
    const at = figsAt(t0).find((f) => f.name === "sir")!, x = at.x + 60, k = 1 - age / 0.5; g.globalAlpha = k;
    for (const [dx, dy, r] of [[0, -18, 26], [34, -10, 18], [60, -5, 11]]) { g.beginPath(); g.arc(x + dx + age * 40, FM.GY + dy - age * 20, r * (1 + age), 0, Math.PI * 2); g.fillStyle = "#efe6d2"; g.fill(); g.lineWidth = 6; g.strokeStyle = "#241726"; g.stroke(); }
    g.globalAlpha = 1; }
};
/** the snake that comes up out of its hole where he pointed ("the treasure is buried right there"): what scares them. v4 (the review of v3):
 *  the hole is there from the first frame, the snake rises over 12 frames, an S-bend, bands down its back, a head wider than its neck with
 *  eyes on top and a forked tongue. Its shape is the model's (snakeAt), which the check also measures */
const snake = (g: G, t: number) => {
  const ink = "#241726", S = snakeAt(t), [x0, y0] = S.spine[0];
  g.beginPath(); g.ellipse(x0, y0 + 2, 54, 12, 0, 0, Math.PI * 2); g.fillStyle = "#4a2e1e"; g.fill(); g.lineWidth = 6; g.strokeStyle = ink; g.stroke();
  if (!S.up) return;
  const path = (pts: [number, number][]) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); };
  const sc = 0.6 + 0.4 * S.e; g.lineCap = "round"; g.lineJoin = "round";
  path(S.spine); g.lineWidth = 46 * sc; g.strokeStyle = ink; g.stroke(); path(S.spine); g.lineWidth = 33 * sc; g.strokeStyle = "#5fa83c"; g.stroke();
  // (dark bands across its back every other stretch: a snake's markings; without them it read as a worm or a sock)
  for (let i = 2; i < 18; i += 3) { const [ax, ay] = S.spine[i], [bx, by] = S.spine[i + 1], dx = bx - ax, dy = by - ay, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l, w = 15 * sc;
    g.beginPath(); g.moveTo(ax + nx * w, ay + ny * w); g.lineTo(ax - nx * w, ay - ny * w); g.lineWidth = 7; g.lineCap = "butt"; g.strokeStyle = "#2f6b2a"; g.stroke(); }
  g.lineCap = "round";
  path(S.head); g.closePath(); g.fillStyle = "#5fa83c"; g.fill(); g.lineWidth = 7; g.strokeStyle = ink; g.stroke();
  for (const dx of [-14, 10]) { g.beginPath(); g.ellipse(S.hx + dx, S.hy - 14, 9, 10, 0, 0, Math.PI * 2); g.fillStyle = "#fff8d0"; g.fill(); g.lineWidth = 4; g.strokeStyle = ink; g.stroke(); g.beginPath(); g.ellipse(S.hx + dx - 2, S.hy - 13, 3, 7, 0, 0, Math.PI * 2); g.fillStyle = ink; g.fill(); }
  g.beginPath(); g.moveTo(S.hx - 44, S.hy + 6); g.quadraticCurveTo(S.hx - 20, S.hy + 12, S.hx + 6, S.hy + 6); g.lineWidth = 4; g.strokeStyle = ink; g.stroke();      // (its mouth line)
  if (Math.floor((t - SNAKE.t0) * 6) % 2 === 0) { g.beginPath(); g.moveTo(S.hx - 48, S.hy + 6); g.lineTo(S.hx - 72, S.hy + 8); g.lineTo(S.hx - 82, S.hy + 1); g.moveTo(S.hx - 72, S.hy + 8); g.lineTo(S.hx - 82, S.hy + 15); g.lineWidth = 4; g.strokeStyle = "#d9483b"; g.stroke(); }
};
const paint = (g: G, t: number) => {
  g.setTransform(1, 0, 0, 1, 0, 0); BGS[0](g); puffs(g, t); snake(g, t);
  for (const f of figsAt(t)) { const sc = scaleOf(f.who); g.save(); g.translate(f.x, footY(f.who)); g.scale(sc, sc); FLAT_A.draw(new Ink(g, FLAT_A.ol), f.sk, f.o); g.restore(); }
};
export const FlatMotionA: React.FC<{ audio?: boolean }> = ({ audio = true }) => {
  const fr = useCurrentFrame();
  return <AbsoluteFill style={{ background: "#f6e2b3" }}>
    <canvas width={FM.W} height={FM.H} ref={(cv) => { if (cv) paint(cv.getContext("2d")!, fr / FM.FPS); }} />
    {audio ? <Audio src={staticFile("craft/rorelseprov-a.wav")} /> : null}
  </AbsoluteFill>;
};
