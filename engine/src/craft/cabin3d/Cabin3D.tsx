// 3D step 1: the captain's cabin. Each frame the Blender plate (public/cab3d/<shot>/NNNN.jpg), over it the flat Knopp figures standing
// on its floor (cabin.ts); in shot B the captain in front as a dark silhouette (over the shoulder). Sound: craft/cabin3d.wav (the two lines).
import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame } from "remotion";
import { FM } from "../clips/clipKit";
import { SHOTS, WHO, paintFigures, type Who3 } from "./cabin";

export const CABIN_S = SHOTS[SHOTS.length - 1].t1;
const BUILT: Record<string, Who3[]> = Object.fromEntries(SHOTS.map((s) => [s.id, WHO[s.id]()]));
export const shotAtC = (t: number) => { let i = 0; while (i + 1 < SHOTS.length && t >= SHOTS[i + 1].t0) i++; const s = SHOTS[i], n = Math.round((s.t1 - s.t0) * FM.FPS); return { s, fr: Math.min(n - 1, Math.round((t - s.t0) * FM.FPS)) }; };
export const paintCabin = (g: CanvasRenderingContext2D, id: string, fr: number) => {
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, FM.W, FM.H); paintFigures(g, id, fr, BUILT[id]); };
export const Cabin3D: React.FC<{ muted?: boolean; plate?: number }> = ({ muted = false, plate }) => {
  const t = useCurrentFrame() / FM.FPS, { s, fr } = shotAtC(t), pf = plate ?? fr;
  return <AbsoluteFill style={{ background: "#1a1210" }}>
    <Img src={staticFile(`cab3d/${s.id}/${String(pf + 1).padStart(4, "0")}.jpg`)} style={{ width: FM.W, height: FM.H }} />
    <AbsoluteFill><canvas width={FM.W} height={FM.H} ref={(cv) => { if (cv) paintCabin(cv.getContext("2d")!, s.id, fr); }} /></AbsoluteFill>
    {muted ? null : <Audio src={staticFile("craft/cabin3d.wav")} />}
  </AbsoluteFill>; };
