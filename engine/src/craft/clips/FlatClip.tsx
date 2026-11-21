// The shot-type clips drawn (clips.ts has the models): the background of the style sheet, the things behind, the figures (each with what
// it holds over it), the things in front, and the clip's sound if it has one.
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { Ink } from "../ink";
import { BGS } from "../FlatStyle";
import { FM, D, scaleOf, footY } from "./clipKit";
import { CLIPS, clipFigs } from "./clips";

const BUILT = Object.fromEntries(Object.entries(CLIPS).map(([k, f]) => [k, f()]));
export const clipFrames = (id: string) => Math.round(FM.FPS * BUILT[id].seconds);
export const clipTitle = (id: string) => BUILT[id].title;
export const CLIP_IDS = Object.keys(BUILT);

export const FlatClip: React.FC<{ id: string }> = ({ id }) => {
  const fr = useCurrentFrame(), c = BUILT[id], t = fr / FM.FPS;
  const paint = (g: CanvasRenderingContext2D) => {
    g.setTransform(1, 0, 0, 1, 0, 0); BGS[c.bg ?? 0](g); c.back?.(g, t);
    const figs = clipFigs(c, t);
    for (const f of figs) { const sc = scaleOf(f.who); g.save(); g.translate(f.x, footY(f.who)); g.scale(sc, sc); D.draw(new Ink(g, D.ol), f.sk, f.o); g.restore(); c.over?.(g, t, f); }
    c.front?.(g, t, figs);
  };
  return <AbsoluteFill style={{ background: "#f6e2b3" }}>
    <canvas width={FM.W} height={FM.H} ref={(cv) => { if (cv) paint(cv.getContext("2d")!); }} />
    {c.audio ? <Audio src={staticFile(c.audio)} /> : null}
  </AbsoluteFill>;
};
