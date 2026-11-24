// 3D step 2: the movement sheet. Each frame the Blender plate (public/mov3d/<shot>/NNNN.jpg) and over it the flat Knopp figures (core.ts).
import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { FM } from "../clips/clipKit";
import { SHOTS, paintFigures, type Who } from "./core";
import { WHO, EXTRAS } from "./pieces";

export const MOVES_S = SHOTS[SHOTS.length - 1].t1;
const BUILT: Record<string, Who[]> = Object.fromEntries(SHOTS.map((s) => [s.id, WHO[s.id]()]));
export const shotAtM = (t: number) => { let i = 0; while (i + 1 < SHOTS.length && t >= SHOTS[i + 1].t0 - 1e-6) i++; const s = SHOTS[i], n = Math.round((s.t1 - s.t0) * FM.FPS); return { s, fr: Math.min(n - 1, Math.round((t - s.t0) * FM.FPS)) }; };
export const Moves3D: React.FC<{ muted?: boolean }> = () => {
  const t = useCurrentFrame() / FM.FPS, { s, fr } = shotAtM(t);
  return <AbsoluteFill style={{ background: "#1a1210" }}>
    <Img src={staticFile(`mov3d/${s.id}/${String(fr + 1).padStart(4, "0")}.jpg`)} style={{ width: FM.W, height: FM.H }} />
    <AbsoluteFill><canvas width={FM.W} height={FM.H} ref={(cv) => { if (cv) { const g = cv.getContext("2d")!; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, FM.W, FM.H); paintFigures(g, s.id, fr, BUILT[s.id], EXTRAS[s.id] ?? {}); } }} /></AbsoluteFill>
  </AbsoluteFill>; };
