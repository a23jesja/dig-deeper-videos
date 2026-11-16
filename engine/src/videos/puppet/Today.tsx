// Today's Sir Digsworth (the engine's own drawing, toon.ts) doing the same five-second action as the puppet.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Pen, bodyFront, setTalk, SIR_DIGSWORTH } from "../emu/toon";
import { act } from "./act";
import { Room, Shadow, FLOOR_Y } from "./Room";
const S = 0.86, CW = 600, CH = 1000, SOLE = 975;
export const PuppetTestToday: React.FC = () => {
  const f = useCurrentFrame(), a = act(f);
  return (
    <AbsoluteFill>
      <Room />
      <Shadow x={a.x} />
      <canvas width={CW * S} height={CH * S} style={{ position: "absolute", left: a.x - (CW * S) / 2, top: FLOOR_Y - SOLE * S }} ref={(cv) => {
        if (!cv) return;
        const g = cv.getContext("2d")!;
        g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height); g.setTransform(S, 0, 0, S, 0, 0);
        setTalk(a.talk);
        bodyFront(new Pen(g), SIR_DIGSWORTH, { mode: a.walk > 0.5 ? "march" : "stand", phase: a.phase, expr: a.talk > 0 ? "smile" : "neutral", seed: 3,
          blink: a.blink, wave: a.arm > 0.02 ? Math.sin(f * 0.6) * a.arm : undefined });
        setTalk(0);
      }} />
    </AbsoluteFill>
  );
};
