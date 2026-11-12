// 2D test sheet for the cast drawings (no three.js): node scripts/sheet.mjs
import React, { useEffect, useRef } from "react";
import { Composition, registerRoot, AbsoluteFill, getInputProps } from "remotion";
import { Pen, bodyFront, bodySide, SIR_DIGSWORTH, DIGGER, MAJOR, FARMERS } from "./videos/emu/toon";
import { emuSide, emuFront } from "./videos/emu/critters";
type Cell = { w: number; h: number; draw: (p: Pen) => void };
const SHEETS: Record<string, Cell[]> = {
  emu: [
    { w: 900, h: 1000, draw: (p) => emuSide(p, { mode: "stand" }) },
    { w: 900, h: 1000, draw: (p) => emuSide(p, { mode: "walk", phase: 0.1 }) },
    { w: 900, h: 1000, draw: (p) => emuSide(p, { mode: "walk", phase: 0.35 }) },
    { w: 900, h: 1000, draw: (p) => emuSide(p, { mode: "run", phase: 0.0 }) },
    { w: 900, h: 1000, draw: (p) => emuSide(p, { mode: "run", phase: 0.2 }) },
    { w: 900, h: 1000, draw: (p) => emuSide(p, { mode: "run", phase: 0.45 }) },
    { w: 900, h: 1000, draw: (p) => emuSide(p, { mode: "run", phase: 0.7 }) },
    { w: 900, h: 1000, draw: (p) => emuSide(p, { mode: "peck", down: 0.5 }) },
    { w: 900, h: 1000, draw: (p) => emuSide(p, { mode: "peck", down: 1, jab: 0 }) },
    { w: 900, h: 1000, draw: (p) => emuSide(p, { mode: "peck", down: 1, jab: 1 }) },
    { w: 900, h: 1000, draw: (p) => emuSide(p, { mode: "stand", gulp: 0.5, blink: 1 }) },
    { w: 900, h: 1000, draw: (p) => emuSide(p, { mode: "stand", hat: true, wide: true }) },
    { w: 900, h: 1000, draw: (p) => emuFront(p, {}) },
    { w: 900, h: 1000, draw: (p) => emuFront(p, { tilt: 0.3, blink: 0.5 }) },
    { w: 900, h: 1000, draw: (p) => emuFront(p, { walk: true, phase: 0.25 }) },
    { w: 900, h: 1000, draw: (p) => emuFront(p, { hat: true, wide: true }) },
  ],
  men: [
    { w: 600, h: 1000, draw: (p) => bodyFront(p, SIR_DIGSWORTH, { mode: "stand", expr: "neutral" }) },
    { w: 600, h: 1000, draw: (p) => bodyFront(p, SIR_DIGSWORTH, { mode: "stand", expr: "grin", point: 1 }) },
    { w: 600, h: 1000, draw: (p) => bodyFront(p, SIR_DIGSWORTH, { mode: "stand", expr: "shock", shrug: 1 }) },
    { w: 600, h: 1000, draw: (p) => bodySide(p, SIR_DIGSWORTH, { mode: "stand", expr: "neutral" }) },
    { w: 600, h: 1000, draw: (p) => bodyFront(p, MAJOR, { mode: "stand", expr: "stern" }) },
    { w: 600, h: 1000, draw: (p) => bodySide(p, MAJOR, { mode: "march", phase: 0.2, expr: "stern" }) },
    { w: 600, h: 1000, draw: (p) => bodyFront(p, DIGGER, { mode: "stand", expr: "neutral" }) },
    { w: 600, h: 1000, draw: (p) => bodyFront(p, { ...DIGGER, skin: "#f5c9a0", moustache: "#4a3426" }, { mode: "sit", expr: "dazed" }) },
    { w: 600, h: 1000, draw: (p) => bodySide(p, DIGGER, { mode: "march", phase: 0.2 }) },
    { w: 600, h: 1000, draw: (p) => bodyFront(p, FARMERS[0], { mode: "stand", expr: "shock", cheer: 1 }) },
    { w: 600, h: 1000, draw: (p) => bodyFront(p, FARMERS[1], { mode: "stand", expr: "nervous" }) },
    { w: 600, h: 1000, draw: (p) => bodyFront(p, FARMERS[2], { mode: "stand", expr: "pained" }) },
  ],
};
const Sheet: React.FC = () => {
  const name = ((getInputProps() as { sheet?: string }).sheet ?? "emu"), cells = SHEETS[name], ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const g = ref.current!.getContext("2d")!; const cols = 4, k = 0.5;
    g.fillStyle = "#e9d9a8"; g.fillRect(0, 0, 1920, 2200);
    cells.forEach((c, i) => { g.setTransform(k, 0, 0, k, (i % cols) * 480 + (480 - c.w * k) / 2, Math.floor(i / cols) * 520 + 10); c.draw(new Pen(g)); });
  }, [cells]);
  return <AbsoluteFill><canvas ref={ref} width={1920} height={2200} /></AbsoluteFill>;
};
registerRoot(() => <Composition id="Sheet" component={Sheet} durationInFrames={1} fps={30} width={1920} height={2200} />);
