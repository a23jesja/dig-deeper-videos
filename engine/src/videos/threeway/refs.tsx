// Reference renders of today's museum guard on cream, one cell per frame (guides for the puppet's character sheet).
// Own entry point, not part of Root.tsx:  ENTRY=src/videos/threeway/refs.tsx node scripts/stills.mjs RefGuard <prefix> 0-5 1
import React from "react";
import { AbsoluteFill, Composition, registerRoot, useCurrentFrame } from "remotion";
import { Pen, bodyFront, bodySide, setTalk } from "../emu/toon";
import { GUARD1 } from "../emu/monacast";

const CREAM = "#f4eedd", O = GUARD1.o, seed = 3;
const CELLS: ((p: Pen) => void)[] = [
  (p) => bodySide(p, O, { mode: "stand", seed }),                                        // 0 profile, facing right
  (p) => bodyFront(p, O, { mode: "stand", expr: "neutral", seed, cheer: 1 }),            // 1 front, arms up (puppet parts)
  (p) => bodyFront(p, O, { mode: "stand", seed, back: true }),                           // 2 from behind
  (p) => bodyFront(p, O, { mode: "stand", expr: "neutral", seed }),                      // 3 head: neutral
  (p) => bodyFront(p, O, { mode: "stand", expr: "shock", seed }),                        // 4 head: shocked
  (p) => bodyFront(p, O, { mode: "stand", expr: "nervous", seed, facing: 1, look: 0.9 }), // 5 head: looking sideways
];
const Draw: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: CREAM }}>
      <canvas width={768} height={1280} ref={(cv) => {
        if (!cv) return;
        const g = cv.getContext("2d")!;
        g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = CREAM; g.fillRect(0, 0, 768, 1280); g.setTransform(1.28, 0, 0, 1.28, 0, 0);
        setTalk(0); CELLS[Math.min(f, CELLS.length - 1)](new Pen(g));
      }} />
    </AbsoluteFill>
  );
};
registerRoot(() => <Composition id="RefGuard" component={Draw} durationInFrames={CELLS.length} fps={30} width={768} height={1280} />);
