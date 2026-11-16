// Reference renders of today's drawings on cream, one cell per frame (guides for the figure-sheet experiment).
// Own entry point, NOT part of Root.tsx:  ENTRY=src/videos/puppet/refs.tsx node scripts/stills.mjs RefPeople <prefix> 0-19 1
import React from "react";
import { AbsoluteFill, Composition, registerRoot, useCurrentFrame } from "remotion";
import { Pen, bodyFront, bodySide, setTalk, SIR_DIGSWORTH, DIGGER, Expr, Outfit } from "../emu/toon";
import { emuSide, emuFront, fxFeather, EmuExpr } from "../emu/emutoon";

const CREAM = "#f4eedd";
type Cell = (p: Pen, g: CanvasRenderingContext2D) => void;
const EXPR: Expr[] = ["neutral", "smile", "shock", "stern", "laugh", "nervous"];
const person = (o: Outfit, seed: number): Cell[] => [
  (p) => bodyFront(p, o, { mode: "stand", expr: "neutral", seed }),
  (p) => bodyFront(p, o, { mode: "stand", expr: "neutral", seed, facing: 1, look: 0.6 }),
  (p) => bodySide(p, o, { mode: "stand", seed }),
  (p) => bodyFront(p, o, { mode: "stand", seed, back: true }),
  ...EXPR.map((e): Cell => (p) => bodyFront(p, o, { mode: "stand", expr: e, seed })),
];
export const PEOPLE: Cell[] = [...person(SIR_DIGSWORTH, 3), ...person(DIGGER, 4),
  // frame 20: arms up and away from the body, no cane: the pose the puppet parts are cut from
  (p) => bodyFront(p, SIR_DIGSWORTH, { mode: "stand", expr: "neutral", seed: 3, cheer: 1 }),
];
const EEX: [EmuExpr, number, number][] = [["calm", 0, 0], ["deadpan", 0, 0], ["alarm", 0, 0], ["smug", 0, 0], ["calm", 1, 0], ["calm", 0, 0.5]];
export const EMU: Cell[] = [
  (p) => emuFront(p, { expr: "deadpan" }),
  (p) => emuSide(p, { mode: "stand", expr: "calm" }),
  (p) => emuFront(p, { mode: "stand", back: true }),
  ...EEX.map(([e, blink, peck]): Cell => (p) => emuSide(p, { mode: peck ? "peck" : "stand", expr: e, blink, peck })),
  (p) => { p.g.save(); p.g.translate(250, 400); p.g.scale(2, 2); fxFeather(p); p.g.restore(); },
];
// simple prop guides (shapes only; the model paints them)
const line = (g: CanvasRenderingContext2D, pts: number[][], w: number, col: string) => { g.strokeStyle = col; g.lineWidth = w; g.lineCap = "round"; g.lineJoin = "round"; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); };
const INK = "#241726";
export const PROPS: Cell[] = [
  (_, g) => { // Lewis gun on its tripod, side view, 1000 x 1000
    for (const dx of [-170, 150]) { line(g, [[520, 520], [520 + dx, 900]], 34, INK); line(g, [[520, 520], [520 + dx, 900]], 20, "#5b5f66"); }
    line(g, [[520, 520], [540, 900]], 34, INK); line(g, [[520, 520], [540, 900]], 20, "#5b5f66");
    g.fillStyle = "#8a5a34"; g.strokeStyle = INK; g.lineWidth = 12; g.beginPath(); g.moveTo(60, 400); g.lineTo(330, 385); g.lineTo(330, 500); g.lineTo(80, 540); g.closePath(); g.fill(); g.stroke();
    line(g, [[330, 440], [880, 440]], 120, INK); line(g, [[330, 440], [880, 440]], 96, "#4b505b");
    line(g, [[880, 440], [950, 440]], 60, INK); line(g, [[880, 440], [950, 440]], 38, "#3a3e46");
    g.fillStyle = "#6a6b4c"; g.beginPath(); g.ellipse(430, 350, 170, 46, 0, 0, 7); g.fill(); g.stroke();
    line(g, [[300, 500], [300, 600], [350, 600]], 30, INK);
  },
  (_, g) => { line(g, [[420, 120], [560, 900]], 46, INK); line(g, [[420, 120], [560, 900]], 28, "#6b4526"); line(g, [[330, 130], [470, 110]], 60, INK); line(g, [[330, 130], [470, 110]], 40, "#8a5a34"); }, // cane
  (_, g) => { line(g, [[200, 420], [620, 520]], 60, INK); line(g, [[200, 420], [620, 520]], 38, "#5a3a22"); g.fillStyle = "#8a5a34"; g.strokeStyle = INK; g.lineWidth = 14; g.beginPath(); g.moveTo(600, 380); g.lineTo(800, 380); g.lineTo(780, 620); g.lineTo(620, 620); g.closePath(); g.fill(); g.stroke(); }, // pipe
  (_, g) => { g.strokeStyle = INK; g.lineWidth = 60; g.beginPath(); g.arc(480, 450, 220, 0, 7); g.stroke(); g.strokeStyle = "#e9b93a"; g.lineWidth = 34; g.stroke(); g.fillStyle = "#dfeaf0"; g.fill(); line(g, [[660, 600], [760, 760], [700, 900]], 10, INK); }, // monocle
  (_, g) => { g.fillStyle = "#8b6b47"; g.strokeStyle = INK; g.lineWidth = 16; g.beginPath(); g.moveTo(160, 560); g.bezierCurveTo(160, 300, 760, 260, 800, 520); g.lineTo(930, 600); g.lineTo(780, 620); g.closePath(); g.fill(); g.stroke(); }, // flat cap
];

const Draw: React.FC<{ cells: Cell[]; w: number; h: number; s: number }> = ({ cells, w, h, s }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: CREAM }}>
      <canvas width={w} height={h} ref={(cv) => {
        if (!cv) return;
        const g = cv.getContext("2d")!;
        g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = CREAM; g.fillRect(0, 0, w, h); g.setTransform(s, 0, 0, s, 0, 0);
        setTalk(0); cells[Math.min(f, cells.length - 1)](new Pen(g), g);
      }} />
    </AbsoluteFill>
  );
};
registerRoot(() => (
  <>
    <Composition id="RefPeople" component={() => <Draw cells={PEOPLE} w={768} h={1280} s={1.28} />} durationInFrames={PEOPLE.length} fps={30} width={768} height={1280} />
    <Composition id="RefEmu" component={() => <Draw cells={EMU} w={1024} h={1136} s={1.136} />} durationInFrames={EMU.length} fps={30} width={1024} height={1136} />
    <Composition id="RefProps" component={() => <Draw cells={PROPS} w={1024} h={1024} s={1.024} />} durationInFrames={PROPS.length} fps={30} width={1024} height={1024} />
  </>
));
