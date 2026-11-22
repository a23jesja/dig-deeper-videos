// Alcatraz 1962, the film: the shots of alcatraz.ts one after another on the narration's times, the opening's text (the same words as the
// voice, at most six, 1.5 s or more per line), and the mix (public/craft/alcatraz.wav, audio/alcatraz_audio.py).
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { Ink } from "../ink";
import { FM, D, scaleOf, footY, castAt } from "../clips/clipKit";
import { SHOTS, type Shot } from "./alcatraz";

const BUILT = Object.fromEntries(Object.entries(SHOTS).map(([k, f]) => [k, f()])) as Record<string, Shot>;
import { CUTS, FILM_S, OPENINGS, TEXT } from "./timeline";
export { CUTS, FILM_S, OPENINGS, TEXT };
type Cut = [string, number] | [string, number, number];
export const shotAt = (cuts: Cut[], t: number): { id: string; lt: number } => { let i = 0; while (i + 1 < cuts.length && t >= cuts[i + 1][1]) i++; return { id: cuts[i][0], lt: t - cuts[i][1] + (cuts[i][2] ?? 0) }; };

export const paintShot = (g: CanvasRenderingContext2D, c: Shot, t: number) => {
  const cam = c.camera(t); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = "#101522"; g.fillRect(0, 0, FM.W, FM.H);
  g.setTransform(cam.z, 0, 0, cam.z, FM.W / 2 - cam.z * cam.cx, FM.H / 2 - cam.z * cam.cy);
  c.ownBg?.(g, t); c.back?.(g, t);
  const figs = castAt(c.cast, t);
  for (const f of figs) { const sc = scaleOf(f.who); g.save(); g.translate(f.x, footY(f.who)); g.scale(sc, sc); D.draw(new Ink(g, D.ol), f.sk, f.o); g.restore(); c.over?.(g, t, f); }
  c.front?.(g, t, figs);
};
const paintText = (g: CanvasRenderingContext2D, t: number) => {
  const tail = FILM_S - TEXT.loopIn, al = t >= TEXT.t0 && t < TEXT.t1 ? 1 : t >= tail ? Math.min(1, (t - tail) / (TEXT.loopIn - 0.12)) : 0;
  if (al <= 0) return;
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = al; g.font = "900 80px 'Arial Black', Arial, sans-serif"; g.textAlign = "center"; g.lineJoin = "round";
  TEXT.lines.forEach((l, i) => { const y = 300 + i * 100; g.lineWidth = 18; g.strokeStyle = "#141018"; g.strokeText(l, FM.W / 2, y); g.fillStyle = "#fff4c2"; g.fillText(l, FM.W / 2, y); });
  g.globalAlpha = 1;
};

export const AlcatrazFilm: React.FC<{ opening?: string; seconds?: number; muted?: boolean }> = ({ opening = "A", muted = false }) => {
  const fr = useCurrentFrame(), t = fr / FM.FPS, cuts = OPENINGS[opening] ?? CUTS, { id, lt } = shotAt(cuts, t);
  return <AbsoluteFill style={{ background: "#101522" }}>
    <canvas width={FM.W} height={FM.H} ref={(cv) => { if (cv) { const g = cv.getContext("2d")!; paintShot(g, BUILT[id], lt); paintText(g, t); } }} />
    {muted ? null : <Audio src={staticFile(opening === "A" ? "craft/alcatraz.wav" : `craft/alcatraz-hook-${opening.toLowerCase()}.wav`)} />}
  </AbsoluteFill>;
};
/** one shot alone (for previews and the checks' pictures) */
export const AlcatrazShot: React.FC<{ id: string }> = ({ id }) => {
  const t = useCurrentFrame() / FM.FPS;
  return <AbsoluteFill style={{ background: "#101522" }}><canvas width={FM.W} height={FM.H} ref={(cv) => { if (cv) paintShot(cv.getContext("2d")!, BUILT[id], t); }} /></AbsoluteFill>;
};
export const SHOT_IDS = Object.keys(BUILT);
export const shotFrames = (id: string) => Math.round(FM.FPS * BUILT[id].seconds);
