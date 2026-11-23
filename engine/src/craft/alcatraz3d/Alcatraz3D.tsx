// Alcatraz in the new style (the style test is its first 9.3 s, shots n01-n05): each frame the Blender plate (public/alc3d/<shot>/NNNN.jpg),
// over it the figures on its floor (a3d.ts), the torch's beam, the over-the-shoulder guard, and the opening's text. A composition of its own,
// apart from the frozen flat Alcatraz (the automation session's condition: the frozen look is not touched until Jesper has approved).
import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame } from "remotion";
import { FM } from "../clips/clipKit";
import SPEC from "./shots.json";
import { SHOTS3D, WHO, paintFigures, beamTo, type Who3 } from "./a3d";

export const PROV_S = SPEC.shots[SPEC.shots.length - 1].t1;
const BUILT: Record<string, Who3[]> = Object.fromEntries(SHOTS3D.map((s) => [s.id, WHO[s.id]()]));
export const shotAt3 = (t: number) => { let i = 0; while (i + 1 < SHOTS3D.length && t >= SHOTS3D[i + 1].t0) i++; const s = SHOTS3D[i]; return { s, fr: Math.round((t - s.t0) * FM.FPS) }; };
const nFrames = (s: (typeof SHOTS3D)[number]) => Math.round((s.t1 - s.t0) * FM.FPS);

const paintText = (g: CanvasRenderingContext2D, t: number) => {
  const T = SPEC.text, al = t >= T.t0 && t < T.t1 ? Math.min(1, (T.t1 - t) / 0.2) : 0;
  if (al <= 0) return;
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = al; g.font = "900 80px 'Arial Black', Arial, sans-serif"; g.textAlign = "center"; g.lineJoin = "round";
  T.lines.forEach((l, i) => { const y = 300 + i * 100; g.lineWidth = 18; g.strokeStyle = "#141018"; g.strokeText(l, FM.W / 2, y); g.fillStyle = "#fff4c2"; g.fillText(l, FM.W / 2, y); });
  g.globalAlpha = 1; };

/** everything drawn over the plate at the shot's frame fr */
export const paintOver = (g: CanvasRenderingContext2D, id: string, fr: number) => {
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, FM.W, FM.H);
  paintFigures(g, id, fr, BUILT[id]); beamTo(g, id, fr); };

export const Alcatraz3D: React.FC<{ muted?: boolean }> = ({ muted = false }) => {
  const t = useCurrentFrame() / FM.FPS, { s, fr } = shotAt3(t), f = Math.min(fr, nFrames(s) - 1);
  return <AbsoluteFill style={{ background: "#101522" }}>
    <Img src={staticFile(`alc3d/${s.id}/${String(f + 1).padStart(4, "0")}.jpg`)} style={{ width: FM.W, height: FM.H }} />
    <AbsoluteFill><canvas width={FM.W} height={FM.H} ref={(cv) => { if (cv) { const g = cv.getContext("2d")!; paintOver(g, s.id, f); paintText(g, t); } }} /></AbsoluteFill>
    {muted ? null : <Audio src={staticFile("craft/alcatraz3d-prov.wav")} />}
  </AbsoluteFill>; };

// ------------------------------------------------------------------ the whole film ------------------------------------------------------------------
import FILM from "./film.json";
export const FILM_S = FILM.shots[FILM.shots.length - 1].t1;
const BUILT_F: Record<string, Who3[]> = Object.fromEntries(FILM.shots.map((s) => [s.id, WHO[s.id]()]));
const shotAtF = (t: number) => { let i = 0; while (i + 1 < FILM.shots.length && t >= FILM.shots[i + 1].t0) i++; const s = FILM.shots[i]; return { s, fr: Math.round((t - s.t0) * FM.FPS) }; };
/** the opening's text, and the same text fading in over the film's last 0.45 s so the last frame meets the first (the loop) */
const paintTextF = (g: CanvasRenderingContext2D, t: number) => {
  const T = FILM.text, tail = FILM_S - FILM.loopIn, al = t >= T.t0 && t < T.t1 ? Math.min(1, (T.t1 - t) / 0.2) : t >= tail ? Math.min(1, (t - tail) / (FILM.loopIn - 0.12)) : 0;
  if (al <= 0) return;
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = al; g.font = "900 80px 'Arial Black', Arial, sans-serif"; g.textAlign = "center"; g.lineJoin = "round";
  T.lines.forEach((l, i) => { const y = 300 + i * 100; g.lineWidth = 18; g.strokeStyle = "#141018"; g.strokeText(l, FM.W / 2, y); g.fillStyle = "#fff4c2"; g.fillText(l, FM.W / 2, y); });
  g.globalAlpha = 1; };
/** n08: the searchlight's beam over the roof, from a tower off the left edge, sweeping slowly over the men (its edge at most 8 px a frame) */
const searchBeam = (g: CanvasRenderingContext2D, t: number, dur: number) => {
  const a = -0.62 + 0.42 * (t / dur), x0 = -120, y0 = 380, L = 2600; g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = "screen";
  for (const [w, al] of [[0.09, 0.10], [0.05, 0.13], [0.025, 0.2]] as [number, number][]) { const gr = g.createLinearGradient(x0, y0, x0 + Math.cos(a) * L, y0 + Math.sin(a) * L); gr.addColorStop(0, `rgba(255,246,210,${al})`); gr.addColorStop(1, "rgba(255,246,210,0)");
    g.fillStyle = gr; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0 + Math.cos(a - w) * L, y0 + Math.sin(a - w) * L); g.lineTo(x0 + Math.cos(a + w) * L, y0 + Math.sin(a + w) * L); g.closePath(); g.fill(); }
  g.restore(); };
/** n11: the alarm's red light pulsing over the picture (1.2 times a second, soft, never a hard flash) */
const alarm = (g: CanvasRenderingContext2D, t: number) => { const on = 0.5 + 0.5 * Math.sin(t * Math.PI * 2 * 1.2); g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = "screen";
  const gr = g.createRadialGradient(FM.W * 0.85, 300, 0, FM.W * 0.85, 300, 1300); gr.addColorStop(0, `rgba(255,50,40,${0.32 * on})`); gr.addColorStop(1, "rgba(255,50,40,0)"); g.fillStyle = gr; g.fillRect(0, 0, FM.W, FM.H); g.restore(); };
export const paintOverF = (g: CanvasRenderingContext2D, id: string, fr: number, dur: number) => {
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, FM.W, FM.H);
  paintFigures(g, id, fr, BUILT_F[id]); beamTo(g, id, fr);
  if (id === "n08") searchBeam(g, fr / FM.FPS, dur);
  if (id === "n11") alarm(g, fr / FM.FPS); };
export const Alcatraz3DFilm: React.FC<{ muted?: boolean }> = ({ muted = false }) => {
  const t = useCurrentFrame() / FM.FPS, { s, fr } = shotAtF(t), n = Math.round((s.t1 - s.t0) * FM.FPS), f = Math.min(fr, n - 1);
  return <AbsoluteFill style={{ background: "#101522" }}>
    <Img src={staticFile(`alc3d/${s.id}/${String(f + 1).padStart(4, "0")}.jpg`)} style={{ width: FM.W, height: FM.H }} />
    <AbsoluteFill><canvas width={FM.W} height={FM.H} ref={(cv) => { if (cv) { const g = cv.getContext("2d")!; paintOverF(g, s.id, f, s.t1 - s.t0); paintTextF(g, t); } }} /></AbsoluteFill>
    {muted ? null : <Audio src={staticFile("craft/alcatraz3d-film.wav")} />}
  </AbsoluteFill>; };
