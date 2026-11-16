// Variant 1: painted background + the engine's own guard (toon.ts bodyFront / bodySide, GUARD1 outfit) on top.
import React from "react";
import { useCurrentFrame } from "remotion";
import { Pen, bodyFront, bodySide, setTalk } from "../emu/toon";
import { GUARD1 } from "../emu/monacast";
import { guard, FIG, FLOOR_Y } from "./scene";
import { Gallery, ContactShadow } from "./Gallery";

const CW = 600, CH = 1000, SOLE = 975, SEED = GUARD1.i;
export const ThreeWay1: React.FC = () => {
  const f = useCurrentFrame(), s = guard(f);
  return (
    <Gallery f={f}>
      <ContactShadow x={s.x} spread={s.walking ? 1 + 0.25 * (s.stride / 0.7) : 1} />
      <canvas width={CW * FIG * 2} height={CH * FIG * 2} style={{ position: "absolute", left: s.x - (CW * FIG) / 2, top: FLOOR_Y - SOLE * FIG, width: CW * FIG, height: CH * FIG }} ref={(cv) => {
        if (!cv) return;
        const g = cv.getContext("2d")!, k = FIG * 2;                                  // drawn at 2x for a clean push-in
        g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height);
        if (s.view === "sideL") g.setTransform(-k, 0, 0, k, CW * k, 0); else g.setTransform(k, 0, 0, k, 0, 0);
        setTalk(0);
        const p = new Pen(g);
        if (s.view === "sideR" || s.view === "sideL") {
          // the phase is passed unrounded; a stride of 0 is drawn as the standing pose (both feet are down at that moment)
          if (s.walking && s.stride > 0.004) bodySide(p, GUARD1.o, { mode: "march", phase: s.phase, stride: s.stride, stomp: 0.75, seed: SEED });
          else bodySide(p, GUARD1.o, { mode: "stand", seed: SEED });
        } else if (s.view === "back") bodyFront(p, GUARD1.o, { mode: "stand", seed: SEED, back: true, headTilt: 0.03 * Math.sin(f * 0.15) });
        else bodyFront(p, GUARD1.o, { mode: "stand", seed: SEED, expr: s.shock ? "shock" : "nervous", facing: s.facing, look: s.look, cheer: s.arms > 0.02 ? s.arms : undefined });
      }} />
    </Gallery>
  );
};
