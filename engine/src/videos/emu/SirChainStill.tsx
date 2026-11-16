// Check pictures for Sir Digsworth's monocle chain (toon.ts, sirChain): frame 0 = close-up, frame 1 = full figure (standing, walking
// with the chain swung, under a blanket), frame 2 = the things that hide it (a blanket, hands in front of the chest, raised arms).
// PROPS='{"audio":false}' node scripts/stills.mjs SirChainStill out/chain/chain_ 0,1,2 1 png
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Pen, bodyFront, bodySide, setTalk, SIR_DIGSWORTH, FrontOpts, SideOpts, Outfit } from "./toon";

export const SIR_CHAIN_FRAMES = 3;
export const SirChainStill: React.FC = () => {
  const fr = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#d8c6a2" }}>
      <canvas width={1600} height={1250} ref={(cv) => {
        if (!cv) return;
        const g = cv.getContext("2d")!;
        g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = "#d8c6a2"; g.fillRect(0, 0, 1600, 1250);
        const front = (o: Outfit, fo: FrontOpts, sc: number, x: number, y: number) => { g.setTransform(sc, 0, 0, sc, x, y); setTalk(0); bodyFront(new Pen(g), o, { mode: "stand", seed: 3, light: -2.1, ...fo }); };
        const side = (so: SideOpts, sc: number, x: number, y: number) => { g.setTransform(sc, 0, 0, sc, x, y); setTalk(0); bodySide(new Pen(g), SIR_DIGSWORTH, { mode: "stand", seed: 3, light: -2.1, ...so }); };
        if (fr === 0) {
          // close-up: the head and the chest down to the buttonhole, 2.5 times the design size
          front(SIR_DIGSWORTH, { expr: "neutral" }, 2.5, 800 - 300 * 2.5, -178 * 2.5);
        } else if (fr === 1) {
          // full figure: standing, walking (the chain swings a beat behind the step), under a blanket (the chest part is hidden)
          g.fillStyle = "#a89674"; g.fillRect(0, 1180, 1600, 70);
          front(SIR_DIGSWORTH, { expr: "neutral" }, 1.18, 90 - 60, 1180 - 975 * 1.18);
          front(SIR_DIGSWORTH, { mode: "stroll", phase: 0.45, expr: "smile" as never, chain: 0.5 }, 1.18, 560 - 60, 1180 - 975 * 1.18);
          front({ ...SIR_DIGSWORTH, shawl: "#8c4a3c" }, { expr: "nervous" }, 1.18, 1030 - 60, 1180 - 975 * 1.18);
        } else {
          g.fillStyle = "#a89674"; g.fillRect(0, 1180, 1600, 70);
          front({ ...SIR_DIGSWORTH, shawl: "#8c4a3c" }, { expr: "nervous" }, 1.18, 90 - 60, 1180 - 975 * 1.18);
          front(SIR_DIGSWORTH, { expr: "shock", hands: "purse" }, 1.18, 560 - 60, 1180 - 975 * 1.18);
          front(SIR_DIGSWORTH, { expr: "shock", hands: "head", chain: 0.7 }, 1.18, 1030 - 60, 1180 - 975 * 1.18);
        }
        g.setTransform(1, 0, 0, 1, 0, 0);
      }} />
    </AbsoluteFill>
  );
};
