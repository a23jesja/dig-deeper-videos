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
