// The Mona Lisa short in 2D, as data: every scene returns the list of things on screen at a frame (background,
// figures, props, tags). The renderer (Mona2D.tsx) draws the list; the layout check (check.ts) reads the same
// list, so a figure cut by the frame, a face under the captions or two tags on top of each other is caught
// before anything is rendered. Screen is 1080x1920; captions sit at 67.5 %.
import React from "react";
import { Costume, Face, FACES, INK, mixFace, Pose, walk } from "./fig";
import caps from "./captionsMona.json";

export const W = 1080, H = 1920, FPS = 30, TOTAL = 1490, GROUND = 1613;
type Cap = { text: string; startMs: number; endMs: number; line: string };
export const CAPS = caps as Cap[];
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
export const at = (line: string, word?: string, n = 0) => {
  const L = CAPS.filter((w) => w.line === line);
  return Math.round(((word ? L.filter((w) => norm(w.text) === norm(word))[n] : L[0]).startMs / 1000) * FPS);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const c01 = (t: number) => Math.min(1, Math.max(0, t));
const ease = (t: number) => { t = c01(t); return t * t * (3 - 2 * t); };
const back = (t: number) => { t = c01(t); const c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const keys = (f: number, k: [number, number][]) => {
  if (f <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) if (f <= k[i][0]) return lerp(k[i - 1][1], k[i][1], ease((f - k[i - 1][0]) / (k[i][0] - k[i - 1][0])));
  return k[k.length - 1][1];
};
const blink = (f: number, seed: number) => { const p = (f + seed * 37) % 96; return p < 4 ? [0.5, 0.05, 0.05, 0.5][p] : 1; };
const eyes = (f: Face, x: number, y = 0): Face => ({ ...f, lookX: x, lookY: y });

// ---------------------------------------------------------------- the cast
const WHITE = "#f4f1e6";
export const CAST = {
  thief: { shape: "smock", coat: WHITE, shade: "#b9c1cf", collar: "#e2ded0", buttons: "#8f97a6", pocket: true, hat: "flat", hatColor: "#3d3f47", tash: "curl", shoe: "#3a2a1c", armLen: 1.3 },
  thiefPlain: { shape: "jacket", coat: "#7a5238", shade: "#4a2f1e", collar: "#e9e2cf", buttons: "#2a1c12", hat: "flat", hatColor: "#3d3f47", tash: "curl", shoe: "#3a2a1c", armLen: 1.3 },
  guard: { shape: "jacket", coat: "#3558a8", shade: "#1f3270", collar: "#1f3270", buttons: "#f0bd3c", belt: "#1b1b22", hat: "guard", hatColor: "#3558a8", band: "#1f3270" },
  guardB: { shape: "jacket", coat: "#3558a8", shade: "#1f3270", collar: "#1f3270", buttons: "#f0bd3c", belt: "#1b1b22", hat: "guard", hatColor: "#3558a8", band: "#1f3270", tash: "walrus" },
  artist: { shape: "smock", coat: "#5a84c4", shade: "#2f4f8a", collar: "#f4f1e6", buttons: "#2b3f66", pocket: true, hat: "beret", hatColor: "#a83232", shoe: "#3a2a1c" },
  det0: { shape: "coat", coat: "#4a5263", shade: "#272c38", collar: "#272c38", buttons: "#15151a", belt: "#1b1b22", hat: "bowler", hatColor: "#1b1b22", band: "#3a3a44", tash: "walrus" },
  det1: { shape: "coat", coat: "#6a5a48", shade: "#3c3226", collar: "#3c3226", buttons: "#15151a", belt: "#1b1b22", hat: "bowler", hatColor: "#1b1b22", band: "#3a3a44", tash: "brush" },
  det2: { shape: "coat", coat: "#3f574f", shade: "#22332d", collar: "#22332d", buttons: "#15151a", belt: "#1b1b22", hat: "bowler", hatColor: "#1b1b22", band: "#3a3a44" },
  picasso: { shape: "jacket", coat: "#f6f2e6", shade: "#b9c1cf", stripes: "#22345e", forelock: true, shoe: "#3a2a1c" },
  lady: { shape: "dress", coat: "#8a4680", shade: "#532a4d", collar: "#f4f1e6", belt: "#d9a93c", hat: "lady", hatColor: "#5a3566", band: "#e2b23c" },
  gent: { shape: "coat", coat: "#3b4352", shade: "#1f2430", collar: "#f4f1e6", buttons: "#d8d8d8", hat: "top", hatColor: "#1b1b22", band: "#7a1420", tash: "curl" },
  police0: { shape: "coat", coat: "#27365a", shade: "#131c33", collar: "#b0302a", buttons: "#d8d8d8", belt: "#f2f2f2", hat: "kepi", hatColor: "#27365a", band: "#b0302a", tash: "curl" },
  police1: { shape: "coat", coat: "#27365a", shade: "#131c33", collar: "#b0302a", buttons: "#d8d8d8", belt: "#f2f2f2", hat: "kepi", hatColor: "#27365a", band: "#b0302a", tash: "brush" },
  sir: { shape: "jacket", coat: "#a47a48", shade: "#6b4a26", tweed: true, vest: "#5c6b38", buttons: "#f0bd3c", bow: "#c0342c", collar: "#fdf8ee", hat: "tweed", hatColor: "#8f6d42", tash: "handle", monocle: true, pipe: true, shoe: "#5a3a20" },
} satisfies Record<string, Costume>;
export type Who = keyof typeof CAST;

// ---------------------------------------------------------------- what a scene can put on screen
type Box = { x: number; y: number; w: number; h: number };
export type Draw =
  | { t: "cam"; z: number; cx: number; cy: number; rot?: number }
  | { t: "bg"; img: string; zoom: number; ox: number; oy: number }
  | { t: "fig"; who: string; c?: Costume; p: Pose; close?: boolean; part?: "all" | "hands"; free?: boolean }       // free = entering or leaving the picture
  | { t: "paint"; kind: "mona" | "panel" | "bundle"; cx: number; cy: number; w: number; rot?: number; key?: boolean; scale?: number; clipBelow?: number }
  | { t: "node"; name: string; box: Box; key?: boolean; layer?: "bg" | "mid" | "fg"; el: React.ReactNode }
  | { t: "tag"; text: string; sub?: string; y: number; age: number };
export const tagBox = (d: { text: string; sub?: string; y: number }): Box => { const w = Math.min(960, d.text.length * (d.text.length > 18 ? 36 : 42) + 80); return { x: (W - w) / 2, y: d.y, w, h: d.sub ? 160 : 96 }; };
export const paintBox = (d: { cx: number; cy: number; w: number; kind: string }): Box => { const h = d.w * 1.36; return { x: d.cx - d.w / 2, y: d.cy - h / 2, w: d.w, h }; };

// ---------------------------------------------------------------- props (SVG, screen px)
const o = (sw = 7) => ({ stroke: INK, strokeWidth: sw, strokeLinejoin: "round" as const, strokeLinecap: "round" as const });
/** the bare spot: paler rectangle and four iron hooks */
const hooks = (cx: number, cy: number, s = 1, name = "hooks"): Draw => {
  const hx = 105 * s, hy = 150 * s;
  return {
    t: "node", name, key: true, layer: "bg", box: { x: cx - hx - 22 * s, y: cy - hy - 26 * s, w: 2 * hx + 44 * s, h: 2 * hy + 60 * s },
    el: (<g>
      <rect x={cx - 190 * s} y={cy - 260 * s} width={380 * s} height={520 * s} fill="#e9b7a6" opacity={0.42} rx={6} />
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b], i) => (<g key={i} transform={`translate(${cx + a * hx} ${cy + b * hy}) scale(${s})`}>
        <ellipse cx={5} cy={34} rx={20} ry={7} fill="rgba(40,10,10,0.25)" />
        <circle r={15} fill="#3a3a42" {...o(6)} />
        <path d="M0 0 L0 24 Q0 40 16 40 Q30 40 30 24" fill="none" stroke={INK} strokeWidth={13} strokeLinecap="round" />
      </g>))}
    </g>),
  };
};
const rope = (y: number, sag = 46, post = true): Draw => ({
  t: "node", name: "rope", layer: "fg", box: { x: 0, y: y - 30, w: W, h: 200 },
  el: (<g>
    {[-360, 540, 1440].map((x, i) => (<g key={i}>
      <path d={`M${x} ${y} Q${x + 450} ${y + 2 * sag} ${x + 900} ${y}`} fill="none" stroke={INK} strokeWidth={30} strokeLinecap="round" />
      <path d={`M${x} ${y} Q${x + 450} ${y + 2 * sag} ${x + 900} ${y}`} fill="none" stroke="#8f1c2a" strokeWidth={18} strokeLinecap="round" />
    </g>))}
    {(post ? [540] : []).map((x) => (<g key={x}><rect x={x - 13} y={y - 6} width={26} height={330} fill="#d9a93c" {...o(7)} /><circle cx={x} cy={y - 14} r={26} fill="#f0bd3c" {...o(7)} /></g>))}
  </g>),
});
const FONT = "'Arial Black', 'Segoe UI Black', Impact, sans-serif";
const sign = (x: number, y: number, swing: number, sc = 1): Draw => ({
  t: "node", name: "closed sign", key: true, layer: "fg", box: { x: x - 250, y, w: 500, h: 190 },
  el: (<g transform={`translate(${x} ${y - 40}) scale(${sc}) rotate(${swing}) translate(${-x} ${-(y - 40)})`}>
    <path d={`M${x - 170} ${y - 44} L${x - 170} ${y + 6} M${x + 170} ${y - 44} L${x + 170} ${y + 6}`} stroke={INK} strokeWidth={8} />
    <rect x={x - 250} y={y} width={500} height={190} rx={10} fill="#f6efdc" {...o(9)} />
    <rect x={x - 232} y={y + 16} width={464} height={158} rx={4} fill="none" stroke="#7a1420" strokeWidth={8} />
    <text x={x} y={y + 104} textAnchor="middle" fontFamily={FONT} fontSize={92} fill="#7a1420">FERMÉ</text>
    <text x={x} y={y + 160} textAnchor="middle" fontFamily={FONT} fontSize={44} fill={INK}>CLOSED</text>
  </g>),
});
const board60 = (age: number): Draw => ({
  t: "node", name: "60 detectives", key: true, layer: "fg", box: { x: 280, y: 324, w: 520, h: 236 },
  el: (<g transform={`translate(540 442) scale(${0.95 * back(age / 7)}) rotate(-2) translate(-540 -421)`}>
    <rect x={270} y={296} width={540} height={250} rx={10} fill="#f6efdc" {...o(10)} />
    <rect x={270} y={296} width={540} height={250} rx={10} fill="none" stroke="#5a3a20" strokeWidth={4} transform="translate(0 0)" />
    <text x={540} y={452} textAnchor="middle" fontFamily={FONT} fontSize={170} fill="#b0302a">60</text>
    <text x={540} y={522} textAnchor="middle" fontFamily={FONT} fontSize={64} fill={INK}>DETECTIVES</text>
  </g>),
});
const bubble = (age: number): Draw => ({
  t: "node", name: "thought: photographers", key: true, layer: "fg", box: { x: 84, y: 316, w: 330, h: 216 },
  el: (<g transform={`translate(249 570) scale(${0.9 * back(age / 7)}) translate(-235 -560)`}>
    <ellipse cx={235} cy={405} rx={180} ry={100} fill="#ffffff" {...o(9)} />
    <circle cx={255} cy={530} r={18} fill="#ffffff" {...o(7)} /><circle cx={270} cy={566} r={10} fill="#ffffff" {...o(6)} />
    <rect x={170} y={360} width={100} height={72} rx={8} fill="#7a5238" {...o(7)} />
    <path d="M270 372 L312 356 L312 436 L270 420 Z" fill="#2a2a30" {...o(7)} />
    <circle cx={324} cy={396} r={19} fill="#cfe9ff" {...o(7)} />
    <path d="M220 432 L190 482 M220 432 L220 486 M220 432 L252 482" {...o(8)} fill="none" />
    <path d="M136 366 l-22 -20 M124 400 h-30 M136 432 l-22 18" stroke="#e2a92c" strokeWidth={9} strokeLinecap="round" />
  </g>),
});
const glass = (x: number, y: number, r = 62): Draw => ({
  t: "node", name: "magnifying glass", layer: "mid", box: { x: x - r, y: y - r, w: 2 * r, h: 2 * r + 70 },
  el: (<g><path d={`M${x + r * 0.6} ${y + r * 0.6} L${x + r * 1.3} ${y + r * 1.5}`} stroke={INK} strokeWidth={26} strokeLinecap="round" /><path d={`M${x + r * 0.6} ${y + r * 0.6} L${x + r * 1.3} ${y + r * 1.5}`} stroke="#7a5238" strokeWidth={13} strokeLinecap="round" /><circle cx={x} cy={y} r={r} fill="rgba(207,233,255,0.55)" {...o(12)} /><path d={`M${x - r * 0.45} ${y - r * 0.2} Q${x - r * 0.3} ${y - r * 0.55} ${x} ${y - r * 0.6}`} stroke="#ffffff" strokeWidth={7} fill="none" strokeLinecap="round" /></g>),
});
const palette = (x: number, y: number): Draw => ({
  t: "node", name: "palette", layer: "mid", box: { x: x - 90, y: y - 55, w: 180, h: 110 },
  el: (<g><ellipse cx={x} cy={y} rx={88} ry={52} fill="#c89a5e" {...o(7)} />{["#c0342c", "#3558a8", "#f0bd3c", "#5c8b3a", "#fdfbf5"].map((c, i) => <circle key={c} cx={x - 56 + i * 28} cy={y - 14 + 10 * Math.sin(i * 1.4)} r={11} fill={c} stroke={INK} strokeWidth={3} />)}<ellipse cx={x + 30} cy={y + 22} rx={14} ry={9} fill="#7b4a47" /></g>),
});
const brushProp = (x: number, y: number, rot: number): Draw => ({
  t: "node", name: "brush", layer: "mid", box: { x: x - 20, y: y - 150, w: 40, h: 160 },
  el: (<g transform={`rotate(${rot} ${x} ${y})`}><path d={`M${x} ${y} L${x} ${y - 120}`} stroke={INK} strokeWidth={15} strokeLinecap="round" /><path d={`M${x} ${y} L${x} ${y - 120}`} stroke="#b98a52" strokeWidth={8} strokeLinecap="round" /><path d={`M${x - 9} ${y - 118} L${x + 9} ${y - 118} L${x + 5} ${y - 150} L${x - 5} ${y - 150} Z`} fill="#3558a8" {...o(5)} /></g>),
});
const cane = (hx: number, hy: number, gy: number): Draw => ({
  t: "node", name: "cane", layer: "mid", box: { x: hx - 20, y: hy - 30, w: 60, h: gy - hy + 30 },
  el: (<g><path d={`M${hx} ${hy - 6} L${hx + 22} ${gy - 6}`} stroke={INK} strokeWidth={22} strokeLinecap="round" /><path d={`M${hx} ${hy - 6} L${hx + 22} ${gy - 6}`} stroke="#5a3a20" strokeWidth={10} strokeLinecap="round" /><circle cx={hx} cy={hy - 12} r={20} fill="#f0bd3c" {...o(6)} /></g>),
});
const desk = (y: number): Draw => ({
  t: "node", name: "desk", layer: "fg", box: { x: 0, y, w: W, h: H - y },
  el: (<g><rect x={-20} y={y} width={W + 40} height={H - y + 20} fill="#6a4424" {...o(9)} /><rect x={-20} y={y} width={W + 40} height={46} fill="#8a5a32" {...o(9)} /><rect x={120} y={y - 26} width={230} height={34} fill="#f3e9cf" {...o(6)} transform={`rotate(-4 235 ${y})`} /></g>),
});
const lamp = (x: number): Draw => ({
  t: "node", name: "lamp", layer: "mid", box: { x: x - 150, y: 0, w: 300, h: 300 },
  el: (<g><path d={`M${x - 120} 268 L${x - 420} 1400 L${x + 420} 1400 L${x + 120} 268 Z`} fill="#fff2b0" opacity={0.13} /><path d={`M${x} -10 L${x} 170`} stroke={INK} strokeWidth={9} /><path d={`M${x - 40} 170 L${x + 40} 170 L${x + 140} 270 L${x - 140} 270 Z`} fill="#2f6b45" {...o(8)} /><ellipse cx={x} cy={276} rx={44} ry={26} fill="#fff2b0" {...o(6)} /></g>),
});
const stamp = (age: number): Draw => ({
  t: "node", name: "RELEASED stamp", key: true, layer: "fg", box: { x: 250, y: 1440, w: 580, h: 150 },
  el: (<g transform={`translate(540 1515) rotate(-5) scale(${0.92 * (age < 3 ? [2.2, 1.3, 0.94][age] : 1)}) translate(-540 -1537)`}>
    <rect x={250} y={1462} width={580} height={150} rx={18} fill="rgba(246,239,220,0.94)" stroke="#d2302a" strokeWidth={13} />
    <text x={540} y={1574} textAnchor="middle" fontFamily={FONT} fontSize={96} fill="#d2302a" letterSpacing={4}>RELEASED</text>
  </g>),
});
/** the trunk: `back` is the open lid and the inside, `front` the front panel (things between them come out of it) */
const trunk = (part: "back" | "front", x: number, y: number, lid: number): Draw => ({
  t: "node", name: `trunk ${part}`, layer: "mid", box: { x, y: y - 250, w: 540, h: 590 },
  el: part === "back" ? (<g>
    <g transform={`rotate(${-lid} ${x} ${y})`}><rect x={x} y={y - 60} width={540} height={60} rx={8} fill="#7a4a28" {...o(9)} />{[120, 400].map((dx) => <rect key={dx} x={x + dx} y={y - 60} width={36} height={60} fill="#3c2414" {...o(5)} />)}</g>
    <rect x={x + 10} y={y} width={520} height={330} fill="#2a1810" {...o(9)} />
  </g>) : (<g>
    <rect x={x} y={y + 30} width={540} height={310} rx={10} fill="#7a4a28" {...o(9)} />
    {[120, 400].map((dx) => <rect key={dx} x={x + dx} y={y + 30} width={36} height={310} fill="#3c2414" {...o(5)} />)}
    <rect x={x + 240} y={y + 50} width={60} height={56} rx={6} fill="#e2a92c" {...o(6)} />
    {[0, 1].map((i) => <circle key={i} cx={x + 22 + i * 496} cy={y + 52} r={15} fill="#e2a92c" {...o(5)} />)}
  </g>),
});
const tray = (x: number, y: number, rot: number): Draw => ({
  t: "node", name: "false bottom", layer: "mid", box: { x, y: y - 60, w: 480, h: 90 },
  el: (<g transform={`rotate(${rot} ${x} ${y})`}><rect x={x} y={y} width={480} height={26} fill="#a06a3a" {...o(7)} />{[["#b9c4d6", 20], ["#e9e2cf", 170], ["#9a4040", 320]].map(([c, dx]) => <rect key={dx} x={x + (dx as number)} y={y - 46} width={140} height={46} rx={8} fill={c as string} {...o(6)} />)}</g>),
});
const letter = (written: number, wob: number): Draw => ({
  t: "node", name: "letter", key: true, layer: "mid", box: { x: 150, y: 318, w: 780, h: 850 },
  el: (<g transform={`translate(0 14) rotate(${-2 + wob} 540 740) translate(540 740) scale(0.96) translate(-540 -740)`}>
    <rect x={164} y={314} width={780} height={880} fill="rgba(20,8,2,0.28)" />
    <rect x={150} y={300} width={780} height={880} fill="#f3e9cf" {...o(9)} />
    <text x={880} y={392} textAnchor="end" fontFamily="Georgia, serif" fontStyle="italic" fontSize={42} fill="#2a2118">Paris, novembre 1913</text>
    <text x={210} y={500} fontFamily="Georgia, serif" fontWeight={700} fontSize={66} fill="#2a2118">Sig. Alfredo Geri</text>
    <text x={210} y={566} fontFamily="Georgia, serif" fontSize={46} fill="#2a2118">Antiquario</text>
    <text x={210} y={664} fontFamily={FONT} fontSize={86} fill="#7a1420">FIRENZE</text>
    {[0, 1, 2].map((r) => { // handwriting: loops, no readable words
      let d = ""; const y = 760 + r * 64, end = r === 2 ? 560 : 870;
      for (let x = 210; x < end; x += 7) d += `${x === 210 ? "M" : "L"}${x} ${(y + 11 * Math.sin(x * 0.09 + r) * (Math.sin(x * 0.019 + r * 2) > -0.75 ? 1 : 0) + 4 * Math.sin(x * 0.27)).toFixed(1)} `;
      return <path key={r} d={d} fill="none" stroke="#3a2e22" strokeWidth={5} strokeLinecap="round" />;
    })}
    <clipPath id="sig"><rect x={200} y={940} width={680 * c01(written)} height={220} /></clipPath>
    <g clipPath="url(#sig)">
      <text x={220} y={1080} fontFamily="'Segoe Script', 'Brush Script MT', 'Lucida Handwriting', cursive" fontStyle="italic" fontSize={128} fill="#1a2a6a">Leonardo</text>
      <path d="M230 1116 Q520 1146 850 1100" fill="none" stroke="#1a2a6a" strokeWidth={8} strokeLinecap="round" />
    </g>
  </g>),
});

// ---------------------------------------------------------------- the scenes
const S = {
  hook: 0, paris: at("paris") - 1, who: at("who") - 1, lift: at("lift") - 1, guards: at("guards") - 1, artist: at("artist") - 1, react: at("artist", "finds") + 1,
  det: at("police") - 1, pic: at("police", "Even") - 1, queue: at("queue") - 1, trunk: at("trunk") - 1, letter: at("letter") - 1, arrest: at("letter", "and") - 1,
  back: at("back"), end: at("end"),
};
const cam = (t: number, T: number, z1 = 1.035, cx = 540, cy = 900): Draw => ({ t: "cam", z: lerp(1, z1, ease(t / T)), cx, cy });
const bg = (img: string, zoom = 1, ox = 0, oy = 0): Draw => ({ t: "bg", img, zoom, ox, oy });
const K = 530;
/** the thief takes the painting from its hooks down to his chest; u = 0 on the wall, 1 at his chest */
const carry = (t: number, spot: [number, number], chest: [number, number], w: number) => {
  const a = ease(t / 13), b = ease((t - 11) / 34), wob = Math.sin(t * 0.3) * 2.2 * b * (1 - 0.6 * ease((t - 60) / 30));
  return { cx: lerp(spot[0], chest[0], b), cy: lerp(spot[1], chest[1], b) - 42 * a * (1 - b) - 60 * Math.sin(Math.PI * b), rot: -9 * Math.sin(Math.PI * b) - 4 * b + wob, a, b, w };
};

/** a whole film for the renderer and the layout check */
export type Film = { scenes: Scene[]; caps: { text: string; startMs: number; endMs: number; line: string }[]; cast: Record<string, Costume>; audio: string; bgDir: string; total: number; hook: { text: string; from: number; size: number; color: string }[] };
export type Scene = { name: string; from: number; to: number; closeup?: boolean; captions?: boolean; draw: (t: number, T: number) => Draw[] };
export const SCENES: Scene[] = [
  { // the thief's hands take her off the four hooks
    name: "hook", from: S.hook, to: S.paris, captions: false, closeup: true,
    draw: (t0, T) => {
      const t = t0 + 5, k = K, x = 330, c = carry(t, [700, 560], [705, 962], 340), m = paintBox({ ...c, kind: "mona" });
      const grin = ease((t - 52) / 12);
      const hand = (px: number, py: number): [number, number] => [(px - x) / k, (GROUND - py) / k];
      const p: Pose = {
        x, y: GROUND, k, turn: lerp(0.75, 0.2, grin), stretch: 1 + 0.05 * c.a * (1 - c.b), lean: 4 * (1 - c.b),
        handR: hand(m.x + 16, lerp(m.y + m.h - 40, m.y + m.h * 0.38, c.b)), handL: hand(lerp(x - 0.3 * k, m.x + 20, ease(c.b * 2 - 0.6)), lerp(GROUND - 0.62 * k, m.y + m.h * 0.78, ease(c.b * 2 - 0.6))),
        headTilt: -5 * (1 - c.b), face: mixFace({ ...FACES.stern, lookX: 0.8, lookY: 0.5, smile: 0.2 }, { ...FACES.glee, lookX: -0.2 }, grin),
      };
      return [{ t: "cam", z: lerp(1.3, 1.36, ease(t0 / T)), cx: 560, cy: 900 }, bg("wall", 1.06, -20, 20), hooks(700, 560, 0.86), { t: "fig", who: "thief", p, close: true }, { t: "paint", kind: "mona", cx: c.cx, cy: c.cy, w: c.w, rot: c.rot }, { t: "fig", who: "thief", p, part: "hands" }];
    },
  },
  { // Paris, a Monday: she hangs there; the Louvre is closed
    name: "paris", from: S.paris, to: S.who,
    draw: (t, T) => {
      const st = at("paris", "The") - S.paris - 8, age = t - st;
      return [cam(t, T, 1.02, 540, 700), bg("gallery", 1.03), { t: "paint", kind: "mona", cx: 540, cy: 760, w: 430, key: true }, rope(1396, 12, false),
        ...(age >= 0 ? [sign(540, 1404, 7 * Math.sin(age * 0.22) * Math.exp(-age / 22), back(age / 8))] : []),
        ...(t < st - 6 ? [{ t: "tag", text: "PARIS, 21 AUGUST 1911", y: 317, age: t - 2 } as Draw] : [])];
    },
  },
  { // Vincenzo Peruggia, in a workman's white smock
    name: "who", from: S.who, to: S.lift,
    draw: (t, T) => {
      const k = 560, sm = at("who", "dressed") - S.who, g = ease((t - sm) / 10), turn = keys(t, [[0, 0], [10, -0.75], [40, -0.75], [56, 0.75], [86, 0.75], [100, 0], [T, 0]]);
      const hop = Math.max(0, Math.sin((t - sm) * 0.45)) * g * (1 - ease((t - sm - 30) / 10));
      const p: Pose = {
        x: 600, y: GROUND, k, turn, bob: 0.02 * hop, stretch: 1 + 0.02 * hop,
        handL: [lerp(-0.3, -0.13, g), lerp(0.6, 0.98, g)], handR: [lerp(0.3, 0.13, g), lerp(0.6, 0.98, g)], headTilt: 4 * Math.sin(t * 0.07),
        face: mixFace({ ...FACES.sly, eye: blink(t, 1), lookX: turn, browY: [-0.3, 0.5] }, { ...FACES.glee, eye: blink(t, 1) }, ease((t - sm - 8) / 10)),
      };
      return [cam(t, T, 1.04, 600, 900), bg("gallery", 1.14, 50, 0), { t: "paint", kind: "mona", cx: 230, cy: 600, w: 290 }, { t: "fig", who: "thief", p }, rope(1716),
        ...(t > 14 ? [{ t: "tag", text: "VINCENZO PERUGGIA", sub: "house painter", y: 1462, age: t - 14 } as Draw] : [])];
    },
  },
  { // he lifts her off four hooks, wraps her in the smock, and walks out
    name: "lift", from: S.lift, to: S.guards,
    draw: (t, T) => {
      const k = K, x = 330, wrap = at("lift", "wraps") - S.lift + 4, go = at("lift", "walks") - S.lift - 6;
      const c = carry(t * 1.5, [700, 560], [705, 962], 340), m = paintBox({ ...c, kind: "mona" }), wrapped = t >= wrap, pop = wrapped ? 1 + 0.2 * Math.max(0, 1 - (t - wrap) / 5) : 1;
      const base = [cam(t, T, 1.03, 600, 900), bg("wall", 1.06, -20, 20), hooks(700, 560, 0.86)];
      if (t >= go) {
        const s = ((t - go) / 26) * 0.75, p = walk(x, GROUND, k, s, 2.4, -1);
        const bx = p.x + 150, by = 1030;
        p.handR = [(bx - 150 - p.x) / k, (GROUND - (by + 60)) / k]; p.face = { ...FACES.glee, lookX: -0.3, eye: blink(t, 2) }; p.turn = -0.45;
        return [...base, { t: "paint", kind: "bundle", cx: bx, cy: by, w: 340, rot: 6 + 2 * Math.sin(s * 9) }, { t: "fig", who: "thiefPlain", p, free: true }, { t: "fig", who: "thiefPlain", p, part: "hands", free: true }, rope(1716)];
      }
      const hand = (px: number, py: number): [number, number] => [(px - x) / k, (GROUND - py) / k];
      const grin = ease((t - wrap) / 8);
      const p: Pose = {
        x, y: GROUND, k, turn: lerp(0.75, 0.25, ease((t - 30) / 12)), stretch: 1 + 0.05 * c.a * (1 - c.b) - (wrapped ? 0.25 * (pop - 1) : 0), lean: 4 * (1 - c.b),
        handR: hand(m.x + 16, lerp(m.y + m.h - 40, m.y + m.h * 0.38, c.b)), handL: hand(lerp(x - 0.3 * k, m.x + 20, ease(c.b * 2 - 0.6)), lerp(GROUND - 0.62 * k, m.y + m.h * 0.78, ease(c.b * 2 - 0.6))),
        face: mixFace({ ...FACES.stern, lookX: 0.8, lookY: 0.4, smile: 0.2 }, { ...FACES.glee, lookX: -0.2 }, grin),
      };
      const who: Who = wrapped ? "thiefPlain" : "thief";
      return [...base, { t: "fig", who, p }, { t: "paint", kind: wrapped ? "bundle" : "mona", cx: c.cx, cy: c.cy, w: c.w, rot: c.rot, key: true, scale: pop }, { t: "fig", who, p, part: "hands" }, rope(1716)];
    },
  },
  { // the guards see the gap and shrug
    name: "guards", from: S.guards, to: S.artist,
    draw: (t, T) => {
      const sh = ease((t - (at("guards", "shrug") - 6 - S.guards)) / 9), ph = at("guards", "photographers") - 3 - S.guards, nod = Math.sin(t * 0.3) * 1.5 * sh;
      const g = (i: number): Draw => {
        const s = i ? -1 : 1, x = i ? 790 : 290, point = ease(t / 8 - 0.4) * (1 - sh);
        const up: [number, number] = [s * 0.34, 1.12], hang: [number, number] = [-s * 0.3, 0.62], shr: [number, number] = [0.27, 1.02];
        const inner: [number, number] = [lerp(s * 0.3, lerp(s * 0.3, up[0], point), 1) * (1 - sh) + s * shr[0] * sh, lerp(lerp(0.62, up[1], point), shr[1], sh)];
        const outer: [number, number] = [lerp(hang[0], -s * shr[0], sh), lerp(hang[1], shr[1], sh)];
        const p: Pose = {
          x, y: GROUND, k: K, turn: lerp(0.55 * s, 0.2 * s, sh), bob: -0.004 * Math.sin(t * 0.1 + i), headTilt: lerp(-7 * s, 5 * s, sh) + nod,
          handL: i ? inner : outer, handR: i ? outer : inner,
          face: mixFace({ ...FACES.shock, open: 0.35, eye: 1.15, lookX: 0.8 * s, lookY: 0.9 }, { ...FACES.neutral, smile: -0.25, browY: [0.8, 0.8], eye: blink(t, i + 3), lookX: 0.5 * s }, sh),
        };
        return { t: "fig", who: i ? "guardB" : "guard", p };
      };
      return [cam(t, T, 1.015, 540, 800), bg("wall", 1.08, 0, -60), hooks(540, 452, 0.85), g(0), g(1), rope(1712), ...(t >= ph ? [bubble(t - ph)] : [])];
    },
  },
  { // next morning an artist comes to paint her
    name: "artist", from: S.artist, to: S.react,
    draw: (t, T) => {
      const k = 560, stop = T - 16, s = Math.min(1, t / stop) * 0.8, p = walk(1008, GROUND, k, s, 0.8, -1), kk = ease((t - stop) / 5);
      p.turn = lerp(-0.6, -0.15, kk); p.stretch = 1 + 0.05 * kk; p.headTilt = lerp(3 * Math.sin(t * 0.4), -6, kk);
      p.handL = [-0.34, lerp(0.74, 0.86, kk)]; p.handR = [lerp(p.handR![0], 0.36, kk), lerp(p.handR![1] + 0.12, 1.2, kk)];
      p.face = mixFace({ ...FACES.neutral, smile: 1, eye: blink(t, 5), browY: [0.3, 0.3], lookX: -0.4 }, { ...FACES.shock, lookX: -0.9, lookY: 0.6 }, kk);
      const hl = [p.x + p.handL[0] * k, GROUND - p.handL[1] * k], hr = [p.x + p.handR[0] * k, GROUND - p.handR[1] * k];
      const free = p.x > 760;
      return [cam(t, T, 1.03, 560, 900), bg("gallery", 1.08, -30, 0), { t: "fig", who: "artist", p, free }, palette(hl[0] - 30, hl[1] + 10), { t: "fig", who: "artist", p, part: "hands", free }, brushProp(hr[0], hr[1], lerp(20, -10, kk)), rope(1716),
        { t: "tag", text: "TUESDAY, 11 A.M.", y: 317, age: t - 6 }];
    },
  },
  { // and finds only hooks: the guard's shock, to us
    name: "react", from: S.react, to: S.det, closeup: true,
    draw: (t, T) => {
      const k = 900, turn = keys(t, [[0, 1.5], [7, 0], [22, 0], [29, -0.55], [36, -0.55], [42, 0], [T, 0]]), up = back(t / 8), gy = 840 + 1.42 * k;
      const shake = Math.sin(t * 1.9) * 0.012 * ease(t / 8);
      const p: Pose = {
        x: 480, y: gy, k, turn, stretch: 1 + 0.04 * up, lean: -3 * up + 2 * Math.sin(t * 0.25),
        handL: [-0.37 + shake, lerp(0.7, 1.52, up)], handR: [0.37 - shake, lerp(0.7, 1.5, up)],
        face: { ...FACES.shock, lookX: turn * 1.2, eye: 1.3 },
      };
      return [cam(t, T, 1.04, 480, 840), bg("wall", 1.5, 240, 80), hooks(905, 430, 0.5), { t: "fig", who: "guard", p, close: true }];
    },
  },
  { // sixty detectives search
    name: "det", from: S.det, to: S.pic,
    draw: (t, T) => {
      const d = (i: number): Draw[] => {
        const x = 278 + i * 262, sw = Math.sin(t * 0.25 + i * 2.1), gx = x + 10 + 34 * sw, gyy = 1215 + 18 * Math.cos(t * 0.25 + i);
        const p: Pose = {
          x, y: GROUND, k: K, turn: 0.35 * sw, lean: 1.5 * sw, bob: -0.05, handL: [-0.22, 0.62], handR: [(gx + 70 - x) / K, (GROUND - (gyy + 84)) / K], headTilt: 4 * sw,
          face: { ...(i === 1 ? FACES.shock : FACES.sly), open: 0, eye: i === 1 ? 1.25 : 1, browY: i === 1 ? [0.7, 0.7] : [-0.3, 0.5], lookX: 0.5 * sw, lookY: -0.7, smile: -0.3 },
        };
        return [{ t: "fig", who: (["det0", "det1", "det2"] as const)[i], p }, glass(gx, gyy), { t: "fig", who: (["det0", "det1", "det2"] as const)[i], p, part: "hands" }];
      };
      return [cam(t, T, 1.015, 540, 900), bg("wall", 1.06, 0, 40), ...d(0), ...d(2), ...d(1), rope(1716), board60(t - 2)];
    },
  },
  { // even Picasso is questioned. Wrong man.
    name: "pic", from: S.pic, to: S.queue,
    draw: (t, T) => {
      const wr = at("police", "Wrong") - S.pic, kk = ease((t - wr) / 7), q = ease((t - (at("police", "questioned") - S.pic) + 6) / 9) * (1 - kk);
      const det: Pose = {
        x: 300, y: GROUND, k: K, turn: lerp(0.7, 0.15, kk), lean: 5 * q, handL: [lerp(-0.26, -0.27, kk), lerp(0.62, 1.02, kk)], handR: [lerp(0.56, 0.27, kk), lerp(1.12, 1.02, kk)],
        face: mixFace({ ...FACES.stern, lookX: 0.7, open: 0.3 + 0.25 * Math.sin(t * 0.8) }, { ...FACES.worried, smile: -0.5, lookX: 0.3 }, kk), headTilt: -4 * kk,
      };
      const pic: Pose = {
        x: 764, y: GROUND, k: 566, turn: lerp(-0.45, 0, kk), bob: -0.006 * (1 - kk) * Math.abs(Math.sin(t * 0.5)), handL: [lerp(-0.08, -0.27, kk), lerp(0.86, 1.02, kk)], handR: [lerp(0.08, 0.27, kk), lerp(0.86, 1.02, kk)],
        face: mixFace({ ...FACES.worried, lookX: -0.7, eye: 1.2 * blink(t, 7) }, FACES.glee, kk), headTilt: 3 * Math.sin(t * 0.33) * (1 - kk),
      };
      return [cam(t, T, 1.03, 540, 900), bg("office"), lamp(540), { t: "fig", who: "det0", p: det }, { t: "fig", who: "picasso", p: pic }, desk(1440),
        ...(t >= wr ? [stamp(t - wr)] : t >= 4 ? [{ t: "tag", text: "PABLO PICASSO", sub: "questioned", y: 1470, age: t - 4 } as Draw] : [])];
    },
  },
  { // thousands queue to stare at an empty wall
    name: "queue", from: S.queue, to: S.trunk,
    draw: (t, T) => {
      const turn = ease((t - (at("queue", "stare") - S.queue)) / 10);
      const one = (who: Who, x: number, k: number, i: number): Draw => {
        const sw = Math.sin(t * 0.09 + i * 1.7), sir = who === "sir";
        const p: Pose = {
          x, y: GROUND, k, turn: sir ? 0 : (x < 540 ? 0.3 : -0.3), bob: -0.004 - 0.004 * sw, lean: 1.2 * sw, headTilt: sir ? lerp(-6, 0, turn) : -7 + 2 * sw,
          ...(sir ? { handL: [-0.34, 0.86] as [number, number] } : {}),
          face: sir ? mixFace({ ...FACES.neutral, lookY: 1, browY: [0.6, 0.6], smile: 0 }, { ...FACES.sly, eye: 1, lookX: 0, browY: [0.2, 1], smile: 0.2 }, turn)
            : { ...FACES.neutral, lookX: x < 540 ? 0.6 : -0.6, lookY: 1, browY: [0.7, 0.7], smile: i ? 0 : 0.4, open: i ? 0.3 : 0, eye: blink(t, i + 9) },
        };
        return { t: "fig", who, p };
      };
      const sx = 540, hx = sx - 0.34 * K, hy = GROUND - 0.86 * K;
      return [cam(t, T, 1.015, 540, 800), bg("wall", 1.08, 0, -60), hooks(540, 452, 0.85), one("lady", 270, K, 0), one("gent", 820, K, 1), cane(hx, hy, GROUND), one("sir", sx, K, 2), rope(1712)];
    },
  },
  { // two years in a trunk
    name: "trunk", from: S.trunk, to: S.letter,
    draw: (t, T) => {
      const k = 545, x = 262, up = ease((t - 16) / 16), out = back((t - (at("trunk", "trunk") - S.trunk) + 10) / 16), o2 = c01(out);
      const py = lerp(1470, 965, out), pw = 330, edge: [number, number] = [575, py - 60];
      const trayY = lerp(1300, 1130, up), reach: [number, number] = [lerp(500, edge[0], o2), lerp(trayY - 20, edge[1], o2)];
      const p: Pose = {
        x, y: GROUND, k, turn: lerp(0.75, 0.3, o2), lean: lerp(10, 3, o2), bob: -0.03 * (1 - o2),
        handR: [(reach[0] - x) / k, (GROUND - reach[1]) / k], handL: [lerp(0.2, 0.28, o2), lerp(0.75, (GROUND - (py + 40)) / k, o2)],
        face: mixFace({ ...FACES.neutral, lookX: 0.8, lookY: -0.6, eye: blink(t, 4) }, { ...FACES.glee, lookX: 0.2 }, ease((t - 56) / 10)),
      };
      return [cam(t, T, 1.03, 600, 1000), bg("room"), trunk("back", 480, 1260, lerp(40, 100, ease(t / 12))),
        { t: "fig", who: "thiefPlain", p }, { t: "paint", kind: "panel", cx: 745, cy: py, w: pw, rot: 3 * Math.sin(t * 0.2) * o2, key: out > 0.9, clipBelow: 1580 }, trunk("front", 480, 1260, 0), { t: "fig", who: "thiefPlain", p, part: "hands" },
        { t: "tag", text: "2 YEARS", y: 317, age: t - 2 }];
    },
  },
  { // a letter to a dealer in Florence, signed Leonardo
    name: "letter", from: S.letter, to: S.arrest, closeup: true,
    draw: (t, T) => [cam(t, T, 1.025, 540, 760), bg("desk", 1.05), letter((t - (at("letter", "signed") - 2 - S.letter)) / 22, 0.6 * Math.sin(t * 0.12))],
  },
  { // and is arrested
    name: "arrest", from: S.arrest, to: S.back,
    draw: (t, T) => {
      const k = K, tug = Math.sin(t * 0.5) * 0.03, x = 540;
      const th: Pose = { x: x + tug * k, y: GROUND, k, turn: 0.5 * Math.sin(t * 0.25), lean: tug * 60, handL: [-0.2, 0.62], handR: [0.2, 0.62], face: { ...FACES.worried, eye: 1.2, lookX: Math.sin(t * 0.25), open: 0.3 } };
      const pol = (i: number): Draw => {
        const s = i ? -1 : 1, px = x - s * 284;
        const grab: [number, number] = [s * 0.43 + tug, 0.98], hang: [number, number] = [-s * 0.3, 0.62];
        return { t: "fig", who: i ? "police1" : "police0", p: { x: px, y: GROUND, k, turn: 0.45 * s, lean: 2 * s, handL: i ? grab : hang, handR: i ? hang : grab, face: { ...FACES.stern, lookX: 0.5 * s } } };
      };
      return [cam(t, T, 1.008, 540, 900), bg("hotel"), pol(0), pol(1), { t: "fig", who: "thiefPlain", p: th }, { ...(pol(0) as Extract<Draw, { t: "fig" }>), part: "hands" }, { ...(pol(1) as Extract<Draw, { t: "fig" }>), part: "hands" },
        { t: "tag", text: "FLORENCE, DECEMBER 1913", y: 317, age: t }];
    },
  },
  { // January 1914: back on her hooks
    name: "back", from: S.back, to: S.end,
    draw: (t, T) => {
      const ch = ease((t - (at("back", "back") - S.back) + 8) / 9);
      const v = (who: Who, x: number, i: number): Draw => {
        const s = i ? -1 : 1, hop = Math.max(0, Math.sin(t * 0.45 + i * 1.6)) * ch, wv = Math.sin(t * 0.7 + i) * 0.06 * ch;
        return { t: "fig", who, p: {
          x, y: GROUND, k: K, turn: lerp(0.5 * s, 0.1 * s, ch), bob: 0.03 * hop, stretch: 1 + 0.03 * hop, headTilt: lerp(-8 * s, 3 * wv * 20, ch),
          handL: [lerp(-0.3, -0.2 + wv, ch), lerp(0.62, 1.45, ch)], handR: [lerp(0.3, 0.2 + wv, ch), lerp(0.62, i ? 1.45 : 1.38, ch)],
          face: mixFace({ ...FACES.neutral, lookX: 0.8 * s, lookY: 0.9, browY: [0.6, 0.6] }, { ...FACES.glee, eye: blink(t, i) }, ch),
        } };
      };
      return [cam(t, T, 1.02, 540, 700), bg("gallery", 1.06, 0, -40), { t: "paint", kind: "mona", cx: 540, cy: 520, w: 250, key: true }, v("lady", 300, 0), v("gent", 786, 1), rope(1712),
        { t: "tag", text: "4 JANUARY 1914", y: 1470, age: t - 4 }];
    },
  },
  { // the theft helped make her the most famous painting on Earth
    name: "end", from: S.end, to: TOTAL,
    draw: (t, T) => {
      const k = 600, x = 668, tip = at("end", "famous") - S.end - 6, kk = ease((t - tip) / 8) * (1 - ease((t - tip - 34) / 9)), wink = t > tip + 50 && t < tip + 62;
      const hx = x - 0.36 * k, hy = GROUND - 0.84 * k;
      const p: Pose = {
        x, y: GROUND, k, turn: 0, bob: -0.004 * Math.sin(t * 0.12), lean: 2.5 * kk, headTilt: 5 * kk + 1.5 * Math.sin(t * 0.08),
        handL: [-0.36, 0.84], handR: [lerp(0.3, 0.22, kk), lerp(0.62, 1.8 + 0.12 * kk, kk)], hatLift: 0.13 * kk, face: { ...FACES.glee, eye: wink ? 0.2 : blink(t, 11) },
      };
      return [cam(t, T, 1.04, 600, 800), bg("gallery", 1.1, 40, -20), { t: "paint", kind: "mona", cx: 250, cy: 610, w: 290, key: true }, cane(hx, hy, GROUND), { t: "fig", who: "sir", p }, rope(1716)];
    },
  },
];
export const sceneAt = (f: number) => SCENES.find((s) => f >= s.from && f < s.to) ?? SCENES[SCENES.length - 1];

/** on-screen tags that are not part of a scene (none) and the hook text box, for the check */
export const HOOK_BOX = { x: 60, y: 1212, w: 960, h: 270 };

export const MONA_FILM: Film = {
  scenes: SCENES, caps: CAPS, cast: CAST, audio: "mona/mix-short.wav", bgDir: "mona2d", total: TOTAL,
  hook: [{ text: "STOLEN.", from: 0, size: 170, color: "#ffe14d" }, { text: "AND NOBODY NOTICED.", from: at("hook", "And") - 1, size: 76, color: "#ffffff" }],
};
