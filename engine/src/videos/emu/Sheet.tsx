// Test sheets for the drawings (look at these before anything goes into a scene).
// node scripts/stills.mjs Sheet out/emu/sheet_ 0 1   with PROPS='{"page":"emu"}'
import React from "react";
import { AbsoluteFill, getInputProps, useCurrentFrame } from "remotion";
import { Pen, bodyFront, bodySide, setTalk, SIR_DIGSWORTH, DIGGER, DIGGER2, MAJOR, FARMER, Expr } from "./toon";
import { emuSide, emuFront, fxFeather, fxDust, fxMuzzle, fxBang, fxSmoke } from "./emutoon";

type Cell = { w: number; h: number; draw: (p: Pen) => void; label?: string };
const Cv: React.FC<{ c: Cell; s: number }> = ({ c, s }) => (
  <div style={{ position: "relative", width: c.w * s, height: c.h * s, background: "#cfe0c8", border: "1px solid #789" }}>
    <canvas width={c.w * s} height={c.h * s} ref={(cv) => {
      if (!cv) return;
      const g = cv.getContext("2d")!;
      g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height); g.setTransform(s, 0, 0, s, 0, 0);
      c.draw(new Pen(g));
    }} />
    <div style={{ position: "absolute", left: 4, top: 2, font: "14px sans-serif", color: "#234" }}>{c.label}</div>
  </div>
);

const pages = (f: number): Record<string, { s: number; cells: Cell[] }> => {
  const E = (label: string, draw: (p: Pen) => void): Cell => ({ w: 900, h: 1000, draw, label });
  const H = (label: string, draw: (p: Pen) => void): Cell => ({ w: 600, h: 1000, draw, label });
  const X = (label: string, draw: (p: Pen) => void, w = 300, h = 300): Cell => ({ w, h, draw, label });
  return {
    emu: { s: 0.4, cells: [
      E("stand calm", (p) => emuSide(p, { mode: "stand", expr: "calm" })),
      E("stand deadpan", (p) => emuSide(p, { mode: "stand", expr: "deadpan", seed: 2 })),
      E("alarm", (p) => emuSide(p, { mode: "stand", expr: "alarm", seed: 3 })),
      E("smug blink .5", (p) => emuSide(p, { mode: "stand", expr: "smug", blink: 0.5, seed: 4 })),
      ...[0, 0.125, 0.25, 0.375].map((ph) => E("walk " + ph, (p) => emuSide(p, { mode: "walk", phase: ph }))),
      ...[0, 0.1, 0.2, 0.32, 0.5, 0.66, 0.8, 0.9].map((ph) => E("run " + ph, (p) => emuSide(p, { mode: "run", phase: ph, expr: "alarm" }))),
      ...[0.25, 0.5, 0.75, 1].map((k) => E("peck " + k, (p) => emuSide(p, { mode: "peck", peck: k }))),
      E("peck jab", (p) => emuSide(p, { mode: "peck", peck: 1, jab: 1 })),
      E("peck ground", (p) => emuSide(p, { mode: "peck", peck: 1, reach: 40 })),
      E("gulp", (p) => emuSide(p, { mode: "stand", gulp: 0.5 })),
      E("front stand", (p) => emuFront(p, { expr: "deadpan" })),
      ...[0.1, 0.25, 0.6].map((ph) => E("front walk " + ph, (p) => emuFront(p, { mode: "walk", phase: ph, seed: 5 }))),
      E("front run", (p) => emuFront(p, { mode: "run", phase: 0.25, expr: "alarm", seed: 7 })),
      E("back walk", (p) => emuFront(p, { mode: "walk", phase: 0.25, back: true })),
      E("back run", (p) => emuFront(p, { mode: "run", phase: 0.75, back: true, seed: 9 })),
    ] },
    anim: { s: 0.5, cells: [
      E("walk", (p) => emuSide(p, { mode: "walk", phase: (f / 30) % 1 })),
      E("run", (p) => emuSide(p, { mode: "run", phase: (f / 11) % 1, expr: "alarm" })),
      E("front walk", (p) => emuFront(p, { mode: "walk", phase: (f / 30) % 1 })),
      E("back run", (p) => emuFront(p, { mode: "run", phase: (f / 11) % 1, back: true })),
    ] },
    people: { s: 0.42, cells: [
      ...(["neutral", "smile", "shock", "stern"] as Expr[]).map((e) => H("sir " + e, (p) => { setTalk(0); bodyFront(p, SIR_DIGSWORTH, { mode: "stand", expr: e, seed: 3 }); })),
      H("sir talk", (p) => { setTalk(0.8); bodyFront(p, SIR_DIGSWORTH, { mode: "stand", expr: "neutral", seed: 3 }); setTalk(0); }),
      H("sir point", (p) => bodyFront(p, SIR_DIGSWORTH, { mode: "stand", expr: "smile", seed: 3, point: 1 })),
      H("sir shrug", (p) => bodyFront(p, SIR_DIGSWORTH, { mode: "stand", expr: "neutral", seed: 3, shrug: 1 })),
      H("sir side", (p) => bodySide(p, SIR_DIGSWORTH, { mode: "stand", seed: 3 })),
      H("major", (p) => bodyFront(p, MAJOR, { mode: "stand", expr: "stern", seed: 2 })),
      H("major side", (p) => bodySide(p, MAJOR, { mode: "march", phase: 0.2, seed: 2 })),
      H("digger", (p) => bodyFront(p, DIGGER, { mode: "stand", expr: "neutral", seed: 4 })),
      H("digger2", (p) => bodyFront(p, DIGGER2, { mode: "stand", expr: "nervous", seed: 6 })),
      H("digger side push", (p) => bodySide(p, DIGGER, { mode: "push", pose: 1, seed: 4, hand: [470, 560] })),
      H("digger sit", (p) => bodyFront(p, DIGGER2, { mode: "sit", expr: "dazed", seed: 6 })),
      H("farmer", (p) => bodyFront(p, FARMER, { mode: "stand", expr: "shock", seed: 5, cheer: 1 })),
      H("farmer side", (p) => bodySide(p, FARMER, { mode: "stand", expr: "shock", seed: 5 })),
    ] },
    sir: { s: 1.9, cells: [
      H("front", (p) => { setTalk(0); bodyFront(p, SIR_DIGSWORTH, { mode: "stand", expr: "neutral", seed: 3 }); }),
      H("talk", (p) => { setTalk(0.9); bodyFront(p, SIR_DIGSWORTH, { mode: "stand", expr: "smile", seed: 3 }); setTalk(0); }),
    ] },
    fx: { s: 1, cells: [
      X("feather", fxFeather, 200, 120), X("dust .2", (p) => fxDust(p, 0.2)), X("dust .8", (p) => fxDust(p, 0.8)),
      X("muzzle", (p) => fxMuzzle(p, 0)), X("muzzle 1", (p) => fxMuzzle(p, 1)), X("bang", fxBang, 200, 260), X("smoke", (p) => fxSmoke(p, 0.5)),
    ] },
  };
};

export const Sheet: React.FC = () => {
  const f = useCurrentFrame();
  const page = (getInputProps() as { page?: string }).page ?? "emu";
  const pg = pages(f)[page];
  return (
    <AbsoluteFill style={{ background: "#e9efe4", display: "flex", flexDirection: "row", flexWrap: "wrap", alignContent: "flex-start", gap: 4, padding: 6 }}>
      {pg.cells.map((c, i) => <Cv key={i} c={c} s={pg.s} />)}
    </AbsoluteFill>
  );
};
