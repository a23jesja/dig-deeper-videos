// Thumbnails drawn with our own cast (2D canvas, 1280x720): node scripts/thumb.mjs <variant...>
import React, { useEffect, useRef } from "react";
import { Composition, registerRoot, AbsoluteFill, getInputProps } from "remotion";
import { Pen, bodyFront, SIR_DIGSWORTH, DIGGER, MAJOR } from "./videos/emu/toon";
import { emuSide, emuFront } from "./videos/emu/critters";
type G = CanvasRenderingContext2D;
const W = 1280, H = 720;
/** draw a character on its own canvas, then composite with a coloured rim glow and a soft drop shadow */
const actor = (g: G, cw: number, ch: number, draw: (p: Pen) => void, x: number, y: number, s: number, o: { flip?: boolean; glow?: string; blur?: number; rot?: number } = {}) => {
  const c = document.createElement("canvas"); c.width = Math.ceil(cw * s); c.height = Math.ceil(ch * s);
  const cg = c.getContext("2d")!; cg.setTransform(s, 0, 0, s, 0, 0); draw(new Pen(cg));
  g.save(); g.translate(x + (o.flip ? c.width : 0), y); if (o.rot) g.rotate(o.rot); g.scale(o.flip ? -1 : 1, 1);
  g.shadowColor = "rgba(10,5,20,0.55)"; g.shadowBlur = 30; g.shadowOffsetY = 14; g.drawImage(c, 0, 0);
  g.shadowOffsetY = 0; g.shadowColor = o.glow ?? "#ffd36b"; g.shadowBlur = o.blur ?? 34; g.drawImage(c, 0, 0); g.drawImage(c, 0, 0);
  g.restore();
};
const text = (g: G, t: string, x: number, y: number, size: number, fill: string, rot = 0, align: CanvasTextAlign = "left") => {
  g.save(); g.translate(x, y); g.rotate(rot); g.font = `900 ${size}px "Inter Display", Inter, sans-serif`; g.textAlign = align; g.textBaseline = "alphabetic"; g.lineJoin = "round";
  g.fillStyle = "rgba(10,5,20,0.6)"; g.strokeStyle = "rgba(10,5,20,0.6)"; g.lineWidth = size * 0.26; g.strokeText(t, size * 0.05, size * 0.07);
  g.strokeStyle = "#1a1020"; g.lineWidth = size * 0.24; g.strokeText(t, 0, 0);
  g.fillStyle = fill; g.fillText(t, 0, 0);
  g.restore();
};
const vignette = (g: G, k = 0.6) => { const r = g.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.95); r.addColorStop(0, "rgba(0,0,0,0)"); r.addColorStop(1, `rgba(8,4,18,${k})`); g.fillStyle = r; g.fillRect(0, 0, W, H); };
const wheat = (g: G, y: number, col: string, n = 90, h = 70) => { g.strokeStyle = col; g.lineCap = "round"; for (let i = 0; i < n; i++) { const x = (i / n) * W + ((i * 37) % 11), hh = h * (0.6 + ((i * 53) % 10) / 20); g.lineWidth = 3; g.beginPath(); g.moveTo(x, y + 10); g.lineTo(x + ((i % 3) - 1) * 8, y - hh); g.stroke(); g.lineWidth = 8; g.beginPath(); g.moveTo(x + ((i % 3) - 1) * 8, y - hh); g.lineTo(x + ((i % 3) - 1) * 10, y - hh - 22); g.stroke(); } };
const sunset = (g: G, sx: number) => {
  const s = g.createLinearGradient(0, 0, 0, 450); s.addColorStop(0, "#2a1750"); s.addColorStop(0.55, "#b83a3a"); s.addColorStop(1, "#ffb24a"); g.fillStyle = s; g.fillRect(0, 0, W, 450);
  const r = g.createRadialGradient(sx, 430, 10, sx, 430, 520); r.addColorStop(0, "rgba(255,240,170,1)"); r.addColorStop(0.18, "rgba(255,200,90,0.85)"); r.addColorStop(1, "rgba(255,160,60,0)"); g.fillStyle = r; g.fillRect(0, 0, W, 450);
  const f = g.createLinearGradient(0, 430, 0, H); f.addColorStop(0, "#c0621f"); f.addColorStop(1, "#4a1d12"); g.fillStyle = f; g.fillRect(0, 430, W, H - 430);
  wheat(g, 440, "#8a3d16", 170, 46);
};
const day = (g: G) => {
  const s = g.createLinearGradient(0, 0, 0, 420); s.addColorStop(0, "#1f6fd0"); s.addColorStop(1, "#bfe0ff"); g.fillStyle = s; g.fillRect(0, 0, W, 420);
  const r = g.createRadialGradient(W * 0.55, 380, 10, W * 0.55, 380, 620); r.addColorStop(0, "rgba(255,255,230,0.9)"); r.addColorStop(1, "rgba(255,255,230,0)"); g.fillStyle = r; g.fillRect(0, 0, W, 420);
  const f = g.createLinearGradient(0, 400, 0, H); f.addColorStop(0, "#f0b83a"); f.addColorStop(1, "#b9651f"); g.fillStyle = f; g.fillRect(0, 400, W, H - 400);
  wheat(g, 420, "#d99a2a", 190, 50); wheat(g, 455, "#f2c64e", 150, 60);
};
const spark = (g: G, x: number, y: number, r: number, a: number) => { g.save(); g.translate(x, y); g.rotate(a); for (let i = 0; i < 8; i++) { g.rotate(Math.PI / 4); g.lineCap = "round"; g.strokeStyle = "#1a1020"; g.lineWidth = r * 0.3; g.beginPath(); g.moveTo(r * 0.45, 0); g.lineTo(r * (i % 2 ? 0.95 : 1.3), 0); g.stroke(); g.strokeStyle = "#ffe14a"; g.lineWidth = r * 0.16; g.stroke(); } g.fillStyle = "#fff7c8"; g.beginPath(); g.arc(0, 0, r * 0.28, 0, 7); g.fill(); g.restore(); };
const soldiers = (g: G, x: number, y: number, s: number) => {
  actor(g, 600, 1000, (p) => bodyFront(p, DIGGER, { mode: "sit", expr: "dazed" }), x, y, s, { glow: "#ff9a3c", blur: 18 });
  actor(g, 600, 1000, (p) => bodyFront(p, MAJOR, { mode: "sit", expr: "pained" }), x + 330 * s, y - 10, s, { glow: "#ff9a3c", blur: 18 });
  actor(g, 600, 1000, (p) => bodyFront(p, { ...DIGGER, skin: "#f5c9a0", moustache: "#4a3426" }, { mode: "sit", expr: "shock" }), x + 660 * s, y, s, { glow: "#ff9a3c", blur: 18 });
};
const VARIANTS: Record<string, (g: G) => void> = {
  a: (g) => { // the winner at sunset, the army beaten at its feet
    sunset(g, 930);
    soldiers(g, 30, 262, 0.44);
    actor(g, 900, 1000, (p) => emuFront(p, { hat: true, tilt: 0.1 }), 438, -77, 1.25, { glow: "#ffe08a", blur: 46 });
    vignette(g, 0.55);
    text(g, "THE BIRDS", 44, 150, 128, "#ffffff", -0.035);
    text(g, "WON", 40, 345, 230, "#ffd91a", -0.035);
  },
  b: (g) => { // the score, Sir Digsworth aghast, the emu proud
    day(g);
    actor(g, 900, 1000, (p) => emuFront(p, { hat: true, wide: true, tilt: -0.08 }), 640, 40, 1.0, { glow: "#fff3b0", blur: 34 });
    actor(g, 600, 1000, (p) => bodyFront(p, SIR_DIGSWORTH, { mode: "stand", expr: "shock", shrug: 1 }), -95, 60, 1.15, { glow: "#fff3b0", blur: 30 });
    vignette(g, 0.4);
    text(g, "EMUS 1", 440, 135, 128, "#ffd91a", -0.02);
    text(g, "ARMY 0", 440, 268, 128, "#ffffff", -0.02);
  },
  c: (g) => { // ten thousand bullets and one unbothered bird
    const s = g.createRadialGradient(760, 400, 30, 760, 400, 760); s.addColorStop(0, "#ffcf5a"); s.addColorStop(0.35, "#c9471f"); s.addColorStop(1, "#1b0f2e"); g.fillStyle = s; g.fillRect(0, 0, W, H);
    actor(g, 900, 1000, (p) => emuFront(p, { tilt: -0.08 }), 33, 12, 1.75, { glow: "#fff0a0", blur: 50 });
    [[560, 430, 62, 0.2], [1120, 330, 76, 0.5], [1010, 640, 58, 0.9], [610, 610, 46, 1.3], [1200, 560, 50, 0.1]].forEach(([x, y, r, a]) => spark(g, x, y, r, a));
    actor(g, 600, 1000, (p) => bodyFront(p, SIR_DIGSWORTH, { mode: "stand", expr: "shock" }), -105, 171, 1.05, { glow: "#ffb04a", blur: 26 });
    vignette(g, 0.6);
    text(g, "10,000 BULLETS", 44, 132, 118, "#ffffff", -0.03);
    text(g, "STILL LOST", 48, 262, 128, "#ffd91a", -0.03);
  },
};
const Thumb: React.FC = () => {
  const v = (getInputProps() as { v?: string }).v ?? "a", ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => { const g = ref.current!.getContext("2d")!; VARIANTS[v](g); }, [v]);
  return <AbsoluteFill><canvas ref={ref} width={W} height={H} /></AbsoluteFill>;
};
registerRoot(() => <Composition id="Thumb" component={Thumb} durationInFrames={1} fps={30} width={W} height={H} />);
