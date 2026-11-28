// Roberts' bedtime in the Emu look (Jesper's decision 28 Nov, DAILY-RULES 9db1b8a "THE LOOK NOW"): the Emu Short's toon figures
// (src/videos/emu/toon.ts, restored from 05fab8d) drawn in front of the deck's Blender-rendered plates (public/rob3d), which drift
// slowly and sit softly out of focus behind them; the figures stand on one ground line, no 3D staging. A first test: two stills.
//   PROPS='{}' node scripts/stills.mjs RobertsEmu out/remu/r_ 0,1 1 png
import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { Pen, bodyFront, fxPuff, fxStars, setTalk, type Outfit, type FrontOpts } from "../emu/toon";

export const REW = 1080, REH = 1920;
const ROBERTS: Outfit = { jacket: "#a8262c", pants: "#2c2630", boots: "#1d1a20", hat: "tricorn", buttons: "#e9b93a", sash: "#1d1a20", moustache: "#3a2416", build: "adult" };
const RUM: Outfit = { jacket: "#efe6d4", pants: "#5a4a3a", boots: "#2a2220", hat: "bandana", cap: "#c42a2e", belt: "#3a2a20", moustache: "#b8612a", build: "stout" };
const YOUNG: Outfit = { jacket: "#4f76b4", pants: "#7a6a50", boots: "#3a2a20", hat: "hair", hair: "#e0b24a", build: "kid" };
const GUNNER: Outfit = { jacket: "#4f7a4a", pants: "#4a4038", boots: "#2a2220", hat: null, build: "stout" };
const CREW: Outfit[] = [
  { jacket: "#c9b27a", pants: "#3d4440", boots: "#2a2220", hat: "bandana", cap: "#2a4f9a" },
  { jacket: "#6a4a8a", pants: "#3b3f52", boots: "#2a2220", hat: "hair", hair: "#3a2a1a" },
  { jacket: "#d8d0c0", pants: "#4a3a2a", boots: "#2a2220", hat: "bandana", cap: "#2f7a4a", build: "stout" },
  { jacket: "#9a5a2a", pants: "#3d4440", boots: "#2a2220", hat: "hair", hair: "#1a1410" },
];
type Fig = { o: Outfit; x: number; ground: number; h: number; f: FrontOpts; talk?: number; fx?: (p: Pen) => void; blur?: number };
/** a toon figure on the ground line: its 600 x 1000 drawing scaled to h px tall, its feet on (x, ground) */
const draw = (g: CanvasRenderingContext2D, F: Fig) => { const k = F.h / 960; g.save(); g.translate(F.x - 300 * k, F.ground - 985 * k); g.scale(k, k);
  if (F.blur) g.filter = `blur(${F.blur / k}px)`; setTalk(F.talk ?? 0); const p = new Pen(g); bodyFront(p, F.o, F.f); setTalk(0); if (F.fx) F.fx(p); g.restore(); };
const STILLS: { plate: string; drift: [number, number, number]; blur: number; tint: string; figs: Fig[]; title: string }[] = [
  { plate: "rob3d/1/0001.jpg", drift: [1.08, -20, 10], blur: 5, tint: "rgba(10,20,50,0.10)", title: "",
    figs: [
      ...CREW.map((o, i): Fig => ({ o, x: 120 + i * 260, ground: 1180 - (i % 2) * 30, h: 430, blur: 3, f: { mode: "stand", expr: (["laugh", "grin", "laugh", "grin"] as const)[i], cheer: i % 2 ? 1 : 0.6, phase: i * 0.3, facing: i % 2 ? 1 : -1, light: 2.4 } })),
      { o: RUM, x: 820, ground: 1430, h: 720, f: { mode: "stand", expr: "laugh", cheer: 0.9, facing: -1, light: 2.4 } },
      { o: ROBERTS, x: 380, ground: 1720, h: 1050, f: { mode: "stand", expr: "whistle", facing: -1, look: -0.6, headTilt: 6, light: 2.4 }, fx: (p) => { p.g.save(); p.g.translate(150, 360); p.g.scale(-0.8, 0.8); fxPuff(p, 0.5); p.g.restore(); } },
    ] },
  { plate: "rob3d/3/0004.jpg", drift: [1.1, 30, -10], blur: 5, tint: "rgba(5,10,40,0.30)", title: "",
    figs: [
      { o: CREW[1], x: 170, ground: 1260, h: 520, blur: 2, f: { mode: "fall", expr: "dazed", phase: 0.6, facing: 1, light: 1.2 }, fx: (p) => fxStars(p, 0.4) },
      { o: CREW[3], x: 900, ground: 1240, h: 500, blur: 2, f: { mode: "stand", expr: "shock", shrug: 1, facing: -1, light: 1.2 } },
      { o: GUNNER, x: 300, ground: 1560, h: 820, f: { mode: "stand", expr: "shock", cheer: 1, facing: 1, light: 1.2 } },
      { o: YOUNG, x: 760, ground: 1640, h: 700, f: { mode: "stand", expr: "nervous", point: 1, facing: -1, look: -0.5, light: 1.2 } },
    ] },
];
export const RobertsEmu: React.FC = () => { const fr = useCurrentFrame(), S = STILLS[Math.min(STILLS.length - 1, fr)];
  return <AbsoluteFill style={{ background: "#0b0f1c", overflow: "hidden" }}>
    <AbsoluteFill style={{ transform: `scale(${S.drift[0]}) translate(${S.drift[1]}px, ${S.drift[2]}px)`, filter: `blur(${S.blur}px)` }}><Img src={staticFile(S.plate)} style={{ width: REW, height: REH }} /></AbsoluteFill>
    <AbsoluteFill style={{ background: S.tint }} />
    <AbsoluteFill><canvas width={REW} height={REH} ref={(cv) => { if (!cv) return; const g = cv.getContext("2d")!; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, REW, REH); for (const F of S.figs) draw(g, F); }} /></AbsoluteFill>
  </AbsoluteFill>; };
