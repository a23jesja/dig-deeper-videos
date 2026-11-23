// Who Sold the Eiffel Tower in 1925, the film: the shots of eiffel.ts on the narration's times (timeline.ts), the opening's text (the voice's
// words, 1.5 s or more per line, at full strength for 3.0 s), and the mix (public/craft/eiffel.wav, audio/eiffel_audio.py).
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { Ink } from "../ink";
import { FM, D, scaleOf, footY, castAt } from "../clips/clipKit";
import { SHOTS, type Shot } from "./eiffel";
import { CUTS, FILM_S, TEXT, OPENINGS, type Cut } from "./timeline";
export { CUTS, FILM_S, TEXT, OPENINGS };
const BUILT = Object.fromEntries(Object.entries(SHOTS).map(([k, f]) => [k, f()])) as Record<string, Shot>;
export const shotAt = (t: number, cuts: Cut[] = CUTS): { id: string; lt: number } => { let i = 0; while (i + 1 < cuts.length && t >= cuts[i + 1][1]) i++; return { id: cuts[i][0], lt: t - cuts[i][1] + (cuts[i][2] ?? 0) }; };
export const paintShot = (g: CanvasRenderingContext2D, c: Shot, t: number) => {
  const cam = c.camera(t); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = "#101522"; g.fillRect(0, 0, FM.W, FM.H);
  g.setTransform(cam.z, 0, 0, cam.z, FM.W / 2 - cam.z * cam.cx, FM.H / 2 - cam.z * cam.cy);
  c.ownBg?.(g, t); c.back?.(g, t);
  const figs = castAt(c.cast, t);
  for (const f of figs) { const sc = scaleOf(f.who); g.save(); g.translate(f.x, footY(f.who)); g.scale(sc, sc); D.draw(new Ink(g, D.ol), f.sk, f.o); g.restore(); c.over?.(g, t, f); }
  c.front?.(g, t, figs);
};
/** the text's strength at t: full from t0 to t1 (3.0 s for two lines), out over `fade`; in again over the film's last loopIn s */
export const textAlpha = (t: number) => { const tail = FILM_S - TEXT.loopIn; return t >= TEXT.t0 && t < TEXT.t1 + TEXT.fade ? Math.min(1, (TEXT.t1 + TEXT.fade - t) / TEXT.fade) : t >= tail ? Math.min(1, (t - tail) / (TEXT.loopIn - 0.12)) : 0; };
const paintText = (g: CanvasRenderingContext2D, t: number, lines: string[] = TEXT.lines, hook = false) => { const al = hook ? (t < TEXT.t1 + TEXT.fade ? Math.min(1, (TEXT.t1 + TEXT.fade - t) / TEXT.fade) : 0) : textAlpha(t); if (al <= 0) return;
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = al; g.font = "900 88px 'Arial Black', Arial, sans-serif"; g.textAlign = "center"; g.lineJoin = "round";
  g.font = `900 ${lines.some((l) => l.length > 18) ? 64 : lines.some((l) => l.length > 14) ? 74 : 88}px 'Arial Black', Arial, sans-serif`;      // (SOMEBODY BOUGHT THE came within 20 px of the edges at 74, the independent review)
  lines.forEach((l, i) => { const y = 230 + i * 108; g.lineWidth = 18; g.strokeStyle = "#141018"; g.strokeText(l, FM.W / 2, y); g.fillStyle = "#fff4c2"; g.fillText(l, FM.W / 2, y); });
  g.globalAlpha = 1; };
export const EiffelFilm: React.FC<{ muted?: boolean }> = ({ muted = false }) => {
  const t = useCurrentFrame() / FM.FPS, { id, lt } = shotAt(t);
  return <AbsoluteFill style={{ background: "#101522" }}>
    <canvas width={FM.W} height={FM.H} ref={(cv) => { if (cv) { const g = cv.getContext("2d")!; paintShot(g, BUILT[id], lt); paintText(g, t, TEXT.lines); } }} />
    {muted ? null : <Audio src={staticFile("craft/eiffel.wav")} />}
  </AbsoluteFill>; };
/** the hook lab's other openings (B, D): 5 s each, their own cuts, text and mix (public/craft/eiffel-hook-<b|c>.wav) */
export const EiffelHook: React.FC<{ opening: string; muted?: boolean }> = ({ opening, muted = false }) => {
  const t = useCurrentFrame() / FM.FPS, O = OPENINGS[opening], { id, lt } = shotAt(t, O.cuts);
  return <AbsoluteFill style={{ background: "#101522" }}>
    <canvas width={FM.W} height={FM.H} ref={(cv) => { if (cv) { const g = cv.getContext("2d")!; paintShot(g, BUILT[id], lt); paintText(g, t, O.text, true); } }} />
    {muted ? null : <Audio src={staticFile(`craft/eiffel-hook-${opening.toLowerCase()}.wav`)} />}
  </AbsoluteFill>; };
export const EiffelShot: React.FC<{ id: string }> = ({ id }) => { const t = useCurrentFrame() / FM.FPS;
  return <AbsoluteFill style={{ background: "#101522" }}><canvas width={FM.W} height={FM.H} ref={(cv) => { if (cv) paintShot(cv.getContext("2d")!, BUILT[id], t); }} /></AbsoluteFill>; };
export const EIFFEL_IDS = Object.keys(BUILT);
export const eiffelFrames = (id: string) => Math.round(FM.FPS * BUILT[id].seconds);
