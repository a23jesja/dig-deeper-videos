// "I Survived the Titanic: Part 2" (Short, 2D): the lifeboats. Only facts already checked against two source
// families are spoken (FACTS-titanic.md); Sir Digsworth's own part is dramatised and the film says so.
// Version 3 (2026-11-15): acted with the jointed rig in fig.tsx. Layers back to front: painted sky | twinkling stars |
// the sea in bands, with everything afloat sorted into it | background props and crowd | characters (back arm, body,
// head, front arm, things held in the grip; things they touch sort by z in the same layer) | railing | tags and captions.
// Every move has a cubic-bezier curve, an anticipation and a settle; fast hands leave a motion arc; the camera pushes
// in, pans and shakes. Nothing a character holds or wears crosses another character. Checked by check.ts before rendering.
import React from "react";
import { cane, EASE, FACES, grips, INK, mixFace, Pose, solve, telescope, tw } from "./fig";
import { Draw, Film, FPS, GROUND, H, Layer, Scene, W } from "./scenes";
import { KIT } from "./titanic1";
import caps from "./captionsTitanic2.json";

type Cap = { text: string; startMs: number; endMs: number; line: string };
const CAPS = caps as Cap[];
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const at = (line: string, word?: string, n = 0) => {
  const L = CAPS.filter((w) => w.line === line);
  return Math.round(((word ? L.filter((w) => norm(w.text) === norm(word))[n] : L[0]).startMs / 1000) * FPS);
};
export const TITANIC2_TOTAL = 1110;
const { C, bg, iceberg, chunk, rail, board, ship, boats20, o, FONT, K } = KIT;
type NodeDraw = Extract<Draw, { t: "node" }>;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const c01 = (t: number) => Math.min(1, Math.max(0, t));
const node = (name: string, box: [number, number, number, number], el: React.ReactNode, layer: Layer = "mid", key = false): Draw => ({ t: "node", name, key, layer, box: { x: box[0], y: box[1], w: box[2], h: box[3] }, el });
const rnd = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
/** the sea background pushed up so the horizon sits at y = 950, clear of the captions */
const SEA_HI: Draw = bg("sea", 1.6, 0, -533);
const HORIZON = 950;

// ---------------------------------------------------------------- sky and sea
const STARS = Array.from({ length: 44 }, (_, i) => ({ x: 20 + rnd(i) * 1040, y: 30 + rnd(i + 50) * 840, r: 0.7 + rnd(i + 90) * 1.5, sp: 0.05 + rnd(i + 130) * 0.12, ph: rnd(i + 170) * 6.28 }));
/** twinkling stars on their own far layer (they barely move when the camera does) */
const stars = (t: number, below = 900): Draw => node("stars", [0, 0, W, below], (<g>{STARS.filter((s) => s.y < below).map((s, i) => {
  const tk = 0.5 + 0.5 * Math.sin(t * s.sp + s.ph);
  return <path key={i} d="M0 -5 L1.3 -1.3 L5 0 L1.3 1.3 L0 5 L-1.3 1.3 L-5 0 L-1.3 -1.3 Z" transform={`translate(${s.x} ${s.y}) scale(${s.r * (0.6 + 0.6 * tk)})`} fill="#f4f6ff" opacity={0.3 + 0.7 * tk} />;
})}</g>), "sky");
const BAND_Y = [0, 34, 84, 160, 270, 420, 620];
const BAND_COL = ["#1d3a66", "#19335b", "#152c50", "#122645", "#0f203b", "#0c1a31", "#0a1529"];
/** height of the swell in band i at x: two sines, bigger and faster towards the viewer, alternate bands run opposite ways */
const swell = (i: number, x: number, t: number) => { const amp = 3 + i * 3, wl = 170 + i * 80, sp = (0.5 + i * 0.45) * (i % 2 ? 1 : -1); return amp * Math.sin(((x + t * sp * 4) / wl) * 6.283 + i * 1.7) + amp * 0.45 * Math.sin(((x - t * sp * 2.5) / (wl * 0.43)) * 6.283 + i); };
/** something afloat: waterline `y` px below the horizon, at screen x; `el` gets the swell under it and its slope */
type Float = { y: number; x: number; el: (dy: number, roll: number) => React.ReactNode };
/** the sea from the horizon `hz` down, in seven bands; each float is drawn inside the band it sits in, so the next
 *  band's waves lap over its waterline: boats and ships sit IN the water, at their own distance */
const sea = (hz: number, t: number, floats: Float[] = []): Draw => node("the sea", [0, hz, W, H - hz], (<g>{BAND_Y.map((by, i) => {
  let d = `M-140 ${H + 400} L-140 ${hz + by}`;
  let top = "";
  for (let x = -140; x <= W + 140; x += 28) { const y = (hz + by + swell(i, x, t)).toFixed(1); d += ` L${x} ${y}`; top += `${top ? " L" : "M"}${x} ${y}`; }
  const mine = floats.filter((f) => f.y >= by && f.y < (BAND_Y[i + 1] ?? 1e9)).sort((a, b) => a.y - b.y);
  return (<g key={i}>
    <path d={`${d} L${W + 140} ${H + 400} Z`} fill={BAND_COL[i]} />
    <path d={top} fill="none" stroke="#6f9bd0" strokeWidth={2.2 + i * 0.8} strokeLinecap="round" strokeDasharray={`${36 + i * 22} ${70 + i * 34}`} strokeDashoffset={t * (1.2 + i) * (i % 2 ? 1 : -1)} opacity={0.5} />
    {mine.map((f, j) => <g key={j}>{f.el(swell(i, f.x, t), (Math.atan2(swell(i, f.x + 50, t) - swell(i, f.x - 50, t), 100) * 180) / Math.PI)}</g>)}
  </g>);
})}</g>), "sea");

// ---------------------------------------------------------------- people in the background (never two alike)
const COATS = ["#8a4680", "#5a84c4", "#e2b23c", "#3b4352", "#b0302a", "#5c8b3a", "#7a5238", "#c9ccd4", "#2f6f6a"];
const HATC = ["#5a3566", "#1b1b22", "#b0302a", "#8f6d42", "#27304a", "#3d3f47"];
/** A small passenger. Coat, hat and what the arms do step through their lists with `id`, so neighbours never match;
 *  height, width, head tilt, mood, sway and blink are the person's own. Base centre (px, py). */
const folk = (key: number, px: number, py: number, sc: number, id: number, t: number, look = 0, arms = true): React.ReactNode => {
  const r = (j: number) => rnd(id * 9.7 + j), ci = (id * 4 + Math.floor(r(1) * 2)) % COATS.length, col = COATS[ci], hat = (id * 3 + Math.floor(r(2) * 2)) % 7, hc = HATC[(id * 5 + 1) % HATC.length];
  const wide = 0.85 + 0.45 * r(3), tall = 0.8 + 0.44 * r(4), tilt = (r(5) - 0.5) * 18 + 4 * Math.sin(t * (0.05 + 0.04 * r(10)) + id), mood = (id + Math.floor(r(6) * 2)) % 5, act = arms ? (id * 2 + Math.floor(r(16) * 2)) % 5 : 0;
  const bob = 2.4 * Math.sin(t * (0.09 + 0.05 * r(7)) + id * 2), sway = 3.4 * Math.sin(t * (0.045 + 0.035 * r(15)) + id * 1.3), lx = look * 3.4 + (r(8) - 0.5) * 3 + 1.2 * Math.sin(t * 0.06 + id * 3), hy = -54 * tall - 11, bl = Math.floor(t + r(11) * 90) % (84 + Math.floor(r(12) * 30)) < 4;
  const st = { stroke: INK, strokeWidth: 4.2, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  // arms: 0 and 1 hang (and swing a little), 2 waves for help, 3 has both hands at the face, 4 holds the hat on
  const sx = 15 * wide, sy = -42 * tall, wv = Math.sin(t * 0.42 + id), hang = (s: number): [number, number] => [s * (23 * wide + 1.5 * Math.sin(t * 0.1 + id + s)), -12 * tall];
  const hands: [number, number][] = act === 2 ? [hang(-1), [27 * wide + 7 * wv, hy - 26 - 3 * Math.cos(t * 0.42 + id)]] : act === 3 ? [[-15, hy + 9], [15, hy + 9]] : act === 4 ? [hang(-1), [11, hy - 20]] : [hang(-1), hang(1)];
  const arm = (i: number) => { const s = i ? 1 : -1, h = hands[i], ex = (s * sx + h[0]) / 2 + s * 9, ey = (sy + h[1]) / 2 + 5; return (<g key={i}><path d={`M${s * sx} ${sy} Q${ex} ${ey} ${h[0]} ${h[1]}`} fill="none" stroke={INK} strokeWidth={5.2} strokeLinecap="round" /><circle cx={h[0]} cy={h[1]} r={5.6} fill="#fbf6ea" stroke={INK} strokeWidth={2.6} /></g>); };
  const over = (i: number) => hands[i][1] < hy + 14;   // a hand at the face or the hat is drawn over the head
  return (<g key={key} transform={`translate(${px} ${py + bob}) scale(${sc}) rotate(${sway})`}>
    {arms && [0, 1].filter((i) => !over(i)).map(arm)}
    <path d={`M${-21 * wide} 0 Q${-17 * wide} ${-50 * tall} 0 ${-52 * tall} Q${17 * wide} ${-50 * tall} ${21 * wide} 0 Z`} fill={col} {...st} />
    {r(13) > 0.5 && <path d={`M-7 ${-48 * tall} L0 ${-36 * tall} L7 ${-48 * tall}`} fill="none" stroke={r(14) > 0.5 ? "#f4f1e6" : INK} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" />}
    {r(17) > 0.6 && <path d={`M${-13 * wide} ${-40 * tall} Q0 ${-30 * tall} ${13 * wide} ${-40 * tall}`} fill="none" stroke={COATS[(ci + 4) % COATS.length]} strokeWidth={6} strokeLinecap="round" />}
    <g transform={`translate(0 ${hy}) rotate(${tilt})`}>
      <circle r={18} fill="#fdfbf5" {...st} />
      {bl || mood === 3 ? <path d={`M${-9 + lx} -2 h6 M${3 + lx} -2 h6`} stroke={INK} strokeWidth={2.6} strokeLinecap="round" /> : <g><circle cx={-6 + lx} cy={-2 - (mood === 1 ? 1 : 0)} r={mood === 1 ? 3.3 : 2.6} fill={INK} /><circle cx={6 + lx} cy={-2 - (mood === 1 ? 1 : 0)} r={mood === 1 ? 3.3 : 2.6} fill={INK} /></g>}
      <path d={`M${-10 + lx} ${-10 - (mood === 1 ? 3 : 0)} l7 ${mood === 4 ? 2.5 : -2.5} M${10 + lx} ${-10 - (mood === 1 ? 3 : 0)} l-7 ${mood === 4 ? 2.5 : -2.5}`} stroke={INK} strokeWidth={2.2} strokeLinecap="round" />
      {mood === 1 ? <ellipse cx={lx * 0.5} cy={9} rx={3.4} ry={4.6} fill={INK} /> : mood === 2 ? <path d={`M${-6 + lx * 0.5} 9 q3 -3 6 0 t6 0`} stroke={INK} strokeWidth={2.4} fill="none" strokeLinecap="round" /> : <path d={`M${-6 + lx * 0.5} ${mood === 4 ? 8 : 10} Q${lx * 0.5} ${mood === 4 ? 9 : 5} ${6 + lx * 0.5} ${mood === 4 ? 8 : 10}`} stroke={INK} strokeWidth={2.4} fill="none" strokeLinecap="round" />}
      {hat === 0 && <path d="M-9 -17 q5 -8 9 -2 q4 -7 9 1" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />}
      {hat === 1 && <g><path d="M-19 -8 Q-18 -27 0 -27 Q18 -27 19 -8 Q0 -15 -19 -8 Z" fill={hc} {...st} strokeWidth={3.6} /><path d="M6 -10 q12 -3 17 3" stroke={INK} strokeWidth={4.5} strokeLinecap="round" fill="none" /></g>}
      {hat === 2 && <g><path d="M-14 -11 Q-15 -31 0 -31 Q15 -31 14 -11 Z" fill={hc} {...st} strokeWidth={3.6} /><path d="M-22 -11 L22 -11" stroke={INK} strokeWidth={6} strokeLinecap="round" /></g>}
      {hat === 3 && <g><rect x={-12} y={-42} width={24} height={31} fill={hc} {...st} strokeWidth={3.6} /><path d="M-20 -11 L20 -11" stroke={INK} strokeWidth={6} strokeLinecap="round" /></g>}
      {hat === 4 && <g><path d="M-13 -12 Q-13 -27 0 -27 Q13 -27 13 -12 Z" fill={hc} {...st} strokeWidth={3.6} /><ellipse cx={0} cy={-12} rx={27} ry={6} fill={hc} {...st} strokeWidth={3.6} /><circle cx={9} cy={-17} r={4} fill="#e2b23c" stroke={INK} strokeWidth={2} /></g>}
      {hat === 5 && <path d="M-19 4 Q-23 -25 0 -25 Q23 -25 19 4 Q14 -12 0 -13 Q-14 -12 -19 4 Z" fill={COATS[(ci + 3) % COATS.length]} {...st} strokeWidth={3.6} />}
      {hat === 6 && <path d="M-17 -10 Q-26 -22 -8 -26 Q12 -30 21 -20 Q24 -12 17 -10 Q0 -17 -17 -10 Z" fill={hc} {...st} strokeWidth={3.6} />}
    </g>
    {arms && [0, 1].filter(over).map(arm)}
  </g>);
};
/** a lifeboat rowing on the sea, seen from the side; origin at the middle of its waterline */
const rowboat = (id: number, t: number): React.ReactNode => {
  const ph = t * 0.19 + id * 1.9, pull = Math.sin(ph), dip = Math.max(0, Math.cos(ph));
  const oar = (ox: number) => (<g>
    <path d={`M${ox} -24 L${ox + 62 * pull} ${34 + 14 * dip}`} stroke={INK} strokeWidth={12} strokeLinecap="round" /><path d={`M${ox} -24 L${ox + 62 * pull} ${34 + 14 * dip}`} stroke="#b98a52" strokeWidth={5.5} strokeLinecap="round" />
    <ellipse cx={ox + 66 * pull} cy={38 + 14 * dip} rx={15} ry={8} fill="#b98a52" stroke={INK} strokeWidth={4} transform={`rotate(${22 * pull} ${ox + 66 * pull} ${38 + 14 * dip})`} />
  </g>);
  return (<g>
    {[-98, -36, 30, 94].map((px, i) => folk(i, px, -2, 1.42, id * 11 + i, t, -0.6, false))}
    <path d="M-158 -30 Q-150 34 -96 40 L96 40 Q150 34 158 -30 Z" fill="#f1efe8" {...o(7)} />
    <path d="M-160 -30 L160 -30" stroke={INK} strokeWidth={14} strokeLinecap="round" /><path d="M-160 -30 L160 -30" stroke="#8a5a32" strokeWidth={7} strokeLinecap="round" />
    <path d="M-132 0 Q0 14 132 0" fill="none" stroke="#b9c1cf" strokeWidth={5} strokeLinecap="round" />
    {oar(-58)}{oar(62)}
  </g>);
};
const boatFloat = (id: number, x: number, y: number, sc: number, t: number): Float => ({ x, y, el: (dy, roll) => <g transform={`translate(${x} ${HORIZON + y + dy * 0.8 - 6 * sc}) rotate(${roll * 0.8 + 1.5 * Math.sin(t * 0.1 + id)}) scale(${sc})`}>{rowboat(id, t)}</g> });
/** the liner, bow at x pointing right, length L, tipped bow-down by `tilt` degrees; the sea bands cut it at the waterline */
const linerFloat = (x: number, L: number, tilt: number, y = 30): Float => {
  const sh = ship(x, HORIZON + y - 0.045 * L, L) as NodeDraw;
  return { x: x - L * 0.5, y, el: (dy) => <g transform={`translate(0 ${dy * 0.25}) rotate(${tilt} ${x - L * 0.72} ${HORIZON + y})`}>{sh.el}</g> };
};

// ---------------------------------------------------------------- props
const clock = (cx: number, cy: number, s: number, hr: number, pop = 1): Draw => node("clock at four", [cx - 240 * s, cy - 240 * s, 480 * s, 480 * s], (
  <g transform={`translate(${cx} ${cy}) scale(${s * pop}) translate(-540 -640)`}>
    <circle cx={540} cy={640} r={232} fill="#f6efdc" {...o(12)} /><circle cx={540} cy={640} r={204} fill="none" stroke="#8a5a32" strokeWidth={6} />
    {Array.from({ length: 12 }, (_, i) => <path key={i} d="M540 452 L540 482" transform={`rotate(${i * 30} 540 640)`} stroke={INK} strokeWidth={i % 3 ? 7 : 13} strokeLinecap="round" />)}
    <text x={634} y={742} textAnchor="middle" fontFamily={FONT} fontSize={64} fill="#b0302a">4</text>
    <path d="M540 640 L540 478" stroke={INK} strokeWidth={11} strokeLinecap="round" transform={`rotate(${(hr * 360) % 360} 540 640)`} />
    <path d="M540 640 L540 530" stroke={INK} strokeWidth={18} strokeLinecap="round" transform={`rotate(${(hr / 12) * 360} 540 640)`} />
    <circle cx={540} cy={640} r={16} fill="#b0302a" {...o(6)} />
  </g>), "bg", true);
const suitcase = (x: number, y: number, rot: number): Draw => node("sliding suitcase", [x - 80, y - 110, 160, 110], (
  <g transform={`rotate(${rot} ${x} ${y})`}>
    <path d={`M${x - 26} ${y - 96} q0 -26 26 -26 q26 0 26 26`} fill="none" stroke={INK} strokeWidth={11} strokeLinecap="round" />
    <rect x={x - 78} y={y - 98} width={156} height={96} rx={10} fill="#8a5a32" {...o(8)} />
    <path d={`M${x - 40} ${y - 98} L${x - 40} ${y - 2} M${x + 40} ${y - 98} L${x + 40} ${y - 2}`} stroke="#5a3a20" strokeWidth={12} />
    <rect x={x - 12} y={y - 64} width={24} height={20} rx={4} fill="#f0bd3c" {...o(5)} />
    {[0, 1, 2].map((i) => <path key={i} d={`M${x + 96 + i * 26} ${y - 24 - i * 22} h${30 + i * 8}`} stroke="#fff3c4" strokeWidth={6} strokeLinecap="round" opacity={0.6} />)}
  </g>), "bg");
/** the empty falls: ropes and blocks swinging where the boats hung */
const falls = (t: number): Draw => node("empty falls", [340, 0, 600, 460], (<g>{[370, 500, 790, 920].map((x, i) => {
  const a = 5 * Math.sin(t * 0.09 + i * 1.3);
  return (<g key={x} transform={`rotate(${a} ${x} -200)`}>
    <path d={`M${x} -200 L${x} 350`} stroke={INK} strokeWidth={9} />
    <rect x={x - 21} y={340} width={42} height={58} rx={9} fill="#8a5a32" {...o(7)} /><circle cx={x} cy={369} r={9} fill="#f0bd3c" stroke={INK} strokeWidth={4} />
    <path d={`M${x} 398 q0 36 22 36 q20 0 20 -20`} fill="none" stroke={INK} strokeWidth={10} strokeLinecap="round" />
  </g>);
})}</g>), "bg");
/** a boat on its davits against the night sky, far along the deck (background, small, above every head) */
const davitBoat = (x: number, y: number, s: number, sw: number): Draw => node("boat on its davits", [x - 190 * s, y - 330 * s, 380 * s, 420 * s], (<g transform={`translate(${x} ${y}) scale(${s})`}>
  {[-150, 150].map((dx) => <g key={dx}><path d={`M${dx * 1.25} 420 L${dx * 1.25} -180 Q${dx * 1.25} -300 ${dx * 0.86} -300`} fill="none" stroke={INK} strokeWidth={30} strokeLinecap="round" /><path d={`M${dx * 1.25} 420 L${dx * 1.25} -180 Q${dx * 1.25} -300 ${dx * 0.86} -300`} fill="none" stroke="#c9ccd4" strokeWidth={17} strokeLinecap="round" /></g>)}
  <g transform={`rotate(${sw} 0 -300)`}>
    <path d="M-130 -300 L-130 0 M130 -300 L130 0" stroke={INK} strokeWidth={8} />
    <path d="M-185 0 Q0 130 185 0 Z" fill="#f1efe8" {...o(9)} /><path d="M-185 0 L185 0" stroke={INK} strokeWidth={15} strokeLinecap="round" /><path d="M-185 0 L185 0" stroke="#8a5a32" strokeWidth={7} strokeLinecap="round" />
    <path d="M-128 38 Q0 70 128 38" fill="none" stroke="#b9c1cf" strokeWidth={7} strokeLinecap="round" />
  </g>
</g>), "bg");
/** water that stays level on the screen while the camera tips with the deck (cx, cy, rot = the camera's). `under` is
 *  drawn below the surface (half sunk), `over` on it (ripples, foam, splashes): all in level, un-tipped coordinates. */
const levelSea = (y: number, ph: number, cx: number, cy: number, rot: number, col: string, opacity: number, name: string, z: number, under?: React.ReactNode, over?: React.ReactNode): Draw => {
  let d = `M-500 ${H + 500} L-500 ${y}`;
  for (let x = -500; x <= W + 500; x += 40) d += ` L${x} ${(y + 13 * Math.sin(x * 0.012 + ph) + 7 * Math.sin(x * 0.031 - ph * 1.7)).toFixed(1)}`;
  return { ...(node(name, [0, y, W, H - y], (<g transform={`rotate(${-rot} ${cx} ${cy})`}>
    {under}
    <path d={`${d} L${W + 500} ${H + 500} Z`} fill={col} opacity={opacity} {...o(8)} />
    <path d={`M-300 ${y + 58} Q270 ${y + 38 + 10 * Math.sin(ph)} 540 ${y + 60} T1400 ${y + 56}`} fill="none" stroke="#9fd0ee" strokeWidth={8} strokeLinecap="round" opacity={0.8} />
    {over}
  </g>)) as NodeDraw), z };
};
/** the ship's side at the rail, seen from the deck in a close-up: a wooden cap rail on a plain steel bulwark */
const bulwark = (y: number): Draw => node("bulwark", [0, y, W, H - y], (<g>
  <rect x={-60} y={y} width={W + 120} height={H - y + 200} fill="#aab4c6" {...o(9)} />
  {[-20, 250, 520, 790, 1060].map((x) => <path key={x} d={`M${x} ${y + 30} L${x} ${H + 200}`} stroke="#8793aa" strokeWidth={7} />)}
  <path d={`M-60 ${y + 62} L${W + 60} ${y + 62}`} stroke="#8793aa" strokeWidth={7} />
  <rect x={-60} y={y - 18} width={W + 120} height={34} rx={9} fill="#8a5a32" {...o(8)} />
  <path d={`M-40 ${y - 8} L${W + 40} ${y - 8}`} stroke="#b98a52" strokeWidth={5} strokeLinecap="round" opacity={0.7} />
</g>));

// ---------------------------------------------------------------- acting helpers
type P2 = [number, number];
const mix = (a: P2, b: P2, t: number): P2 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
/** a bump 0 -> 1 -> 0 that starts at frame t0 and lasts d frames (anticipation, a nod, a hop) */
const pulse = (t: number, t0: number, d: number) => Math.sin(Math.PI * c01((t - t0) / d));
/** camera shake: a jolt at frame t0 that dies away */
const shk = (t: number, t0: number, amp: number, dec = 7, w = 2.3) => (t >= t0 ? Math.sin((t - t0) * w) * amp * Math.exp(-(t - t0) / dec) : 0);
/** how far the mouth is open while he speaks between frames a and b */
const talk = (t: number, a: number, b: number) => (t >= a && t < b ? 0.1 + 0.36 * Math.abs(Math.sin(t * 0.83)) * (0.65 + 0.35 * Math.sin(t * 0.29 + 1)) : 0);
/** a motion arc behind a fast hand: where the hand was 1, 2, 3 ... steps ago (screen px), thinner and fainter towards the tail */
const trail = (name: string, pts: P2[], w: number, alpha = 1): Draw => ({ ...(node(name, [0, 0, 1, 1], (<g opacity={alpha}>{pts.slice(1).map((q, i) => {
  const a = pts[i], f = 1 - i / (pts.length - 1);
  return <path key={i} d={`M${a[0].toFixed(1)} ${a[1].toFixed(1)} L${q[0].toFixed(1)} ${q[1].toFixed(1)}`} stroke="#fff3c4" strokeWidth={w * (0.35 + 0.65 * f)} strokeLinecap="round" opacity={0.62 * f} />;
})}</g>)) as NodeDraw), z: 7 });
/** a splash: drops thrown up and out from (x, y) on the water, `age` frames ago */
const splash = (key: string, x: number, y: number, age: number, big = 1): React.ReactNode => (age < 0 || age > 18 ? null : <g key={key}>
  {[0, 1, 2, 3, 4, 5, 6].map((i) => { const dir = i % 2 ? 1 : -1, vx = dir * (2.2 + i * 0.9) * big, vy = (13 - i * 1.1) * big, dx = vx * age, dy = -vy * age + 0.62 * age * age; return dy > 6 ? null : <path key={i} d="M0 -10 Q8 0 0 8 Q-8 0 0 -10 Z" transform={`translate(${x + dir * 14 + dx} ${y - 6 + dy}) rotate(${dir * 24}) scale(${(1.5 - age / 22) * big})`} fill="#cfeaf9" stroke={INK} strokeWidth={3} />; })}
  {age < 9 && [-1, 1].map((s) => <path key={s} d={`M${x + s * 10} ${y + 4} Q${x + s * (34 + age * 5)} ${y - (58 - age * 3) * big} ${x + s * (56 + age * 8)} ${y + 4} Z`} fill="#dff1fb" stroke={INK} strokeWidth={4} strokeLinejoin="round" opacity={1 - age / 9} />)}
</g>);
/** rings spreading on the water round something that stands in it, at (x, y) */
const ripples = (x: number, y: number, t: number, w = 1): React.ReactNode => (<g>
  {[0, 1, 2].map((i) => { const a = ((t * 0.55 + i * 10) % 30) / 30; return <ellipse key={i} cx={x} cy={y + 4} rx={(56 + 150 * a) * w} ry={(11 + 30 * a) * w} fill="none" stroke="#dff1fb" strokeWidth={6 - 3 * a} opacity={0.85 * (1 - a)} />; })}
  <path d={`M${x - 62 * w} ${y + 2} q14 -12 28 0 t28 0 t28 0 t28 0`} fill="none" stroke="#ffffff" strokeWidth={6} strokeLinecap="round" opacity={0.9} />
</g>);

// ---------------------------------------------------------------- scenes
const S = { hook: 0, truth: at("truth") - 1, recap: at("recap") - 1, sink: at("recap", "She") - 2, order: at("order") - 1, child: at("child") - 1, seats: at("seats") - 1, gone: at("gone") - 1, none: at("gone", "Then") - 2, help: at("help") - 1, left: at("left") - 1, cliff: at("cliff") - 1 };
export const TITANIC2_CUTS = S;
/** Sir Digsworth at the ship's side in the hook (also the thumbnail): he hangs over the rail and waves after the boat.
 *  `ry` is the top of the rail; one hand grips it (the rail and that hand are drawn after the figure, same layer). */
const atRail = (p: Pose, ry: number): Draw[] => [{ t: "fig", who: "sir", c: C.sir, p, close: true }, { ...(bulwark(ry) as NodeDraw), z: 5 }, { t: "fig", who: "sir", c: C.sir, p, part: "hands", z: 6 }];
const SCENES: Scene[] = [
  { // a lifeboat rows away over the black sea. He hangs over the rail and waves after it; the arm sinks; he turns to us.
    name: "hook", from: S.hook, to: S.truth, captions: false, closeup: true,
    draw: (t, T) => {
      const k = 800, x = 330, RY = 1176, gy = RY + 0.8 * k, hr = 0.805, and = at("hook", "And") - 1;
      const e = EASE.soft(t / T), tn = tw(t, and - 2, 12), ant = pulse(t, and - 9, 8), droop = tw(t, 24, 18), me = tw(t, and + 4, 8) * (1 - tw(t, and + 13, 8)), th = EASE.back(c01((t - and - 14) / 9));
      const ph = t * 0.78, amp = 1 - 0.75 * droop, wv = Math.sin(ph) * amp;
      const bx = lerp(790, 915, e), by = lerp(78, 46, e), bs = lerp(0.86, 0.58, e);
      const waveAt = (q: number): P2 => [lerp(0.7, 0.62, droop) + 0.09 * Math.sin(q) * amp, lerp(1.38, 1.02, droop) + 0.07 * Math.cos(q) * amp];
      const hR = mix(mix(mix(waveAt(ph), [0.3, hr], tn), [0.07, 1.0], me), [0.52, 1.1], th);
      const p: Pose = { x, y: gy, k, turn: lerp(0.85, 0.15, tn), lean: lerp(9 + 2.5 * wv, 1.5, tn) - 4 * ant, bend: lerp(8, 0, tn) - 3 * ant + 2 * th, neck: lerp(6, -1, tn) + 3 * th,
        stretch: 1 + 0.07 * pulse(t, 0, 10) - 0.04 * droop * (1 - tn) - 0.04 * ant + 0.035 * pulse(t, and, 11), front: "R",
        handL: [-0.22, hr], handR: hR, pipeSide: -1, hatLift: 0.06 * (1 - tw(t, 0, 14, EASE.out)) + 0.03 * pulse(t, and, 10), headTilt: 4 * th, nod: 0.6 * pulse(t, and + 5, 8),
        lookAt: tn < 0.5 ? [bx, HORIZON + by] : undefined, shock: t < and ? t : undefined, sweat: t, nervous: 0.7 * (1 - tn),
        face: mixFace({ ...FACES.shock, eye: 1.3 }, { ...FACES.worried, eye: 1.15, lookY: -0.1, open: talk(t, and + 3, T), browY: [1, 0.5], browTilt: [-0.55, -0.35] }, tn) };
      const arc = tn < 0.2 ? [trail("wave arc", [1, 2, 3, 4].map((i): P2 => { const q = waveAt(ph - 0.3 * i); return [x + q[0] * k, gy - q[1] * k]; }), 30, amp * (1 - 5 * tn))] : [];
      return [{ t: "cam", z: lerp(1.0, 1.07, e), cx: 540 + shk(t, 0, 8, 6), cy: 900, px: lerp(-12, 10, e) }, SEA_HI, stars(t), sea(HORIZON, t, [boatFloat(1, bx, by, bs, t)]), ...atRail(p, RY), ...arc];
    },
  },
  { // my part is made up (a hand on his heart, a shrug); everything around me is true (a wide sweep of the arm, a firm nod).
    // The deck is already tipping: a suitcase slides past behind him.
    name: "truth", from: S.truth, to: S.recap,
    draw: (t, T) => {
      const k = 600, x = 590, my = at("truth", "My") - S.truth, made = at("truth", "made") - S.truth, ev = at("truth", "Everything") - S.truth, tr = at("truth", "true.") - S.truth;
      const sl = EASE.inOut(t / T), sx = lerp(990, 215, sl);
      const chest = tw(t, my + 1, 9) * (1 - tw(t, made - 2, 8)), shrug = EASE.back(c01((t - made + 1) / 9)) * (1 - tw(t, ev - 12, 8)), ant = pulse(t, ev - 9, 8);
      const sw = tw(t, ev - 1, 18, EASE.out), sweep = tw(t, ev - 3, 6) * (1 - tw(t, tr - 6, 8)), firm = EASE.back(c01((t - tr + 3) / 8)), nod = pulse(t, tr, 7) + 0.7 * pulse(t, tr + 9, 7);
      const sweepAt = (q: number): P2 => [lerp(0.08, 0.55, q), 1.02 + 0.22 * Math.sin(Math.PI * (0.15 + 0.7 * q))];
      const hR = mix(mix(mix(mix([0.3, 0.66], [0.07, 0.96], chest), [0.45, 0.98], shrug), sweepAt(sw), sweep), [0.3, 0.86 - 0.05 * nod], firm);
      const p: Pose = { x, y: GROUND, k, turn: lerp(0.05, 0.45, sweep) + 0.08 * shrug, lean: 3 + 1.2 * Math.sin(t * 0.1) - 3 * ant + 2 * sweep, bend: -3 * shrug + 5 * sweep * sw - 2 * ant, neck: -3 * shrug + 4 * sweep,
        stretch: 1 + 0.025 * shrug - 0.04 * ant + 0.03 * pulse(t, ev, 10) - 0.02 * nod, handL: [-0.36, 0.84], handR: hR, headTilt: 5 * shrug - 3 * chest, nod: 0.5 * chest + nod - 0.4 * shrug,
        lookAt: sweep > 0.3 ? [x + sweepAt(sw)[0] * k + 160, GROUND - 1.25 * k] : undefined,
        face: mixFace(mixFace({ ...FACES.neutral, smile: 0.4, browY: [0.3, 0.3], open: talk(t, my, made + 12) + talk(t, ev, tr + 9) }, { ...FACES.neutral, browY: [1, 1], smile: 0.9, open: talk(t, my, made + 12) }, shrug), { ...FACES.stern, smile: 0.3, browY: [-0.2, -0.2] }, firm) };
      const arc = sweep > 0.4 && sw < 0.95 ? [trail("sweep arc", [1, 2, 3, 4].map((i): P2 => { const q = sweepAt(Math.max(0, tw(t - 1.6 * i, ev - 1, 18, EASE.out))); return [x + q[0] * k, GROUND - q[1] * k]; }), 26)] : [];
      return [{ t: "cam", z: lerp(1, 1.05, sl), cx: 580, cy: 950, rot: -3.5, px: lerp(-14, 10, sl) }, bg("deck", 1.27, 0, 0), suitcase(sx, GROUND + 6, -7 * Math.sin(t * 0.32)), { t: "fig", who: "sir", c: C.sir, p, hold: { L: cane } }, ...arc,
        ...(t > 40 ? [{ t: "tag", text: "THE EVENTS ARE TRUE", sub: "my part is dramatised", y: 1462, age: t - 40 } as Draw] : [])];
    },
  },
  { // the Titanic has struck an iceberg: she comes in from the left and hits
    name: "recap", from: S.recap, to: S.sink, closeup: true,
    draw: (t, T) => {
      const hit = 8, sx = lerp(690, 806, EASE.in(c01(t / hit))), q = t - hit, sh = q >= 0 ? Math.sin(q * 2.3) * 16 * Math.exp(-q / 9) : 0;
      const berg = iceberg(918, HORIZON + 30, 330, "mid") as NodeDraw, sp = ship(sx, HORIZON + 31 - 0.045 * 760, 760) as NodeDraw;
      const bits = q < 0 ? [] : [0, 1, 2, 3, 4].map((i) => { const tt = q * 1.15 - i * 3, x = 842 + i * 22 - tt * (2 + i * 0.5), y = 650 + i * 14 - tt * 5 + 0.3 * tt * tt; return tt > 0 && y < HORIZON + 26 ? <g key={i}>{chunk(x, y, 0.5 + 0.14 * (i % 3), tt * 11 + i * 40)}</g> : null; });
      return [{ t: "cam", z: lerp(1.02, 1.08, EASE.out(t / T)), cx: 760 + sh, cy: 900 + sh * 0.4, px: lerp(-18, 6, EASE.out(t / T)) }, SEA_HI, stars(t),
        sea(HORIZON, t, [{ x: 918, y: 28, el: (dy) => <g transform={`translate(${sh * 0.2} ${dy * 0.3})`}>{berg.el}</g> }, { x: sx - 380, y: 31, el: (dy) => <g transform={`translate(0 ${dy * 0.25 + sh * 0.3}) rotate(${-sh * 0.05} ${sx} ${HORIZON})`}>{sp.el}</g> }]),
        node("falling ice", [600, 560, 300, 400], <g>{bits}</g>, "bg"),
        { t: "tag", text: "11:40 P.M. · 14 APRIL 1912", y: 317, age: t - 3 }];
    },
  },
  { // she is sinking by the bow
    name: "sink", from: S.sink, to: S.order, closeup: true,
    draw: (t, T) => {
      const e = EASE.inOut(t / T), tilt = lerp(2.5, 10.5, e), bw = at("recap", "bow") - S.sink - 3;
      const foam = [0, 1, 2, 3, 4].map((i) => { const a = (t * 1.3 + i * 11) % 44; return <circle key={i} cx={838 - i * 26 + a * 0.6} cy={HORIZON + 30 - a * 0.9} r={5 + a * 0.22} fill="#dff1fb" opacity={0.75 * (1 - a / 44)} />; });
      return [{ t: "cam", z: lerp(1.02, 1.09, e), cx: 640, cy: 900, px: lerp(-6, 22, e) }, SEA_HI, stars(t), sea(HORIZON, t, [linerFloat(900, 800, tilt)]), node("foam at the bow", [700, 880, 200, 120], <g>{foam}</g>, "bg"),
        ...(t >= bw ? [{ t: "tag", text: "SINKING BY THE BOW", y: 1462, age: t - bw } as Draw] : [])];
    },
  },
  { // the order is women and children first. He steps up; the officer's palm stops him, the same arm points up at the boat,
    // a chop of the hand on "first". He listens, nods, his shoulders drop. So I stay: he straightens, steps back, hat off;
    // the officer salutes. The two never touch: there is always clear deck between their hands.
    name: "order", from: S.order, to: S.child,
    draw: (t, T) => {
      const k = 545, so = at("order", "So") - S.order, wm = at("order", "women") - S.order, ch = at("order", "children") - S.order, fi = at("order", "first") - S.order;
      // the officer
      const halt = EASE.back(c01((t - 1) / 8)), point = EASE.back(c01((t - wm + 3) / 9)) * (1 - tw(t, fi - 5, 5)), chop = EASE.back(c01((t - fi + 1) / 6)), lower = tw(t, fi + 14, 10), salute = EASE.back(c01((t - so - 9) / 8));
      const off: Pose = { x: 850, y: GROUND, k, turn: lerp(-0.6, -0.3, point), lean: -3 + 2 * halt - 2 * point + 2 * chop * (1 - lower), bend: -2 * halt * (1 - lower), stretch: 1 + 0.03 * pulse(t, 1, 8) - 0.025 * pulse(t, fi, 7) + 0.025 * salute, front: "L",
        handL: mix(mix(mix(mix([-0.3, 0.8], [-0.4, 1.3 + 0.012 * Math.sin(t * 0.5)], halt), [-0.46, 1.52], point), [-0.4, 1.02], chop), [-0.26, 0.72], lower), handR: mix([0.26, 0.62 + 0.03 * point], [0.27, 1.6], salute),
        nod: pulse(t, wm, 7) + pulse(t, ch, 7) + 1.2 * pulse(t, fi, 8) + 0.8 * pulse(t, so + 8, 9) - 0.5 * point, headTilt: 4 * point,
        face: { ...FACES.stern, open: talk(t, 0, fi + 9), lookX: -0.7, lookY: 0.5 * point, browY: [-0.4 + 0.5 * salute, -0.4 + 0.5 * salute], smile: -0.3 + 0.5 * salute } };
      // Sir Digsworth
      const recoil = EASE.back(c01((t - 3) / 8)), listen = tw(t, wm - 2, 10), sag = tw(t, fi + 4, 12), ant = pulse(t, so - 8, 8), st = EASE.back(c01((t - so) / 12)), tip = pulse(t, so + 6, 24);
      const hR = mix(mix(mix(mix([0.36, 1.0], [0.22, 1.14], recoil), [0.07, 0.96], listen), [0.3, 0.66], sag), [0.27, 1.62], tip);
      const sir: Pose = { x: lerp(lerp(320, 310, recoil), 308, st) + 8 * ant, y: GROUND, k, turn: lerp(0.6, 0.2, st), lean: lerp(lerp(5, -3, recoil), -1, st) + 2.5 * sag * (1 - st) + 4 * ant, bend: 5 * sag * (1 - st) - 2 * st,
        stretch: 1 - 0.035 * pulse(t, 3, 8) - 0.025 * sag * (1 - st) - 0.035 * ant + 0.04 * pulse(t, so, 12), neck: 5 * sag * (1 - st) + 4 * ant - 3 * tip, front: "R",
        footL: [-0.09, 0.06 * pulse(t, so, 10)], handL: [-0.33, 0.84], handR: hR, hatLift: 0.1 * tip + 0.05 * pulse(t, 3, 7), headTilt: 5 * tip,
        nod: 0.8 * pulse(t, ch + 3, 8) + pulse(t, fi + 6, 9) + 0.9 * pulse(t, so + 9, 10),
        lookAt: st < 0.5 ? (point > 0.5 ? [590, 440] : [800, 850]) : undefined, shock: t >= 3 && t < 15 ? t - 3 : undefined, sweat: t < so ? t : undefined,
        face: mixFace(mixFace({ ...FACES.worried, eye: 1.15, open: 0.25 * (1 - listen) }, { ...FACES.worried, eye: 0.95, smile: -1.2, browY: [0.2, 0.2] }, sag), { ...FACES.stern, lookX: 0.1, smile: 0.35, browY: [0.25, 0.25], open: talk(t, so, so + 19) }, st) };
      return [{ t: "cam", z: lerp(1, 1.035, EASE.soft(t / T)), cx: 540 + shk(t, 3, 6, 5), cy: 820, px: lerp(12, -14, tw(t, so - 8, 20)) }, bg("deck", 1.09, 0, 0), davitBoat(575, 470, 0.62, 2 * Math.sin(t * 0.1)),
        { t: "fig", who: "sir", c: C.sir, p: sir, hold: { L: cane } }, { t: "fig", who: "officer", c: C.officer, p: off, free: true },
        ...(t >= wm ? [{ t: "tag", text: "WOMEN AND CHILDREN FIRST", y: 1462, age: t - wm } as Draw] : [])];
    },
  },
  { // a little girl is alone. He goes down on one knee at arm's length and puts a hand under her; I lift her: she rides up on
    // his arm, he swings her over the gunwale, a lady takes her and sets her down INSIDE the boat, behind its near side.
    // Draw order: davit and far side | lady | girl (once in the boat) | near side of the boat | Sir | girl (while carried).
    // Sir is never drawn over her: the arm she sits on is his back arm, and his pipe is clenched up out of the way.
    name: "child", from: S.child, to: S.seats, closeup: true,
    draw: (t, T) => {
      const G = 1500, k = 500, ck = 300, lk = 420, lift = at("child", "lift") - S.child;
      const RIM = 1075 + 3 * Math.sin(t * 0.12) + 10 * pulse(t, lift + 30, 10);
      const see = tw(t, 5, 8), walkIn = tw(t, 12, 14), kn = tw(t, 18, 14), rise = tw(t, lift - 2, 12, EASE.out), ant = pulse(t, lift - 8, 7), kneel = kn * (1 - rise);
      const pass = tw(t, lift + 9, 13), rel = tw(t, lift + 22, 9), away = tw(t, lift + 26, 12), down = tw(t, lift + 22, 11), wave = t > lift + 33 ? Math.sin((t - lift - 33) * 0.7) : 0;
      const x = lerp(lerp(lerp(276, 286, walkIn), 331, pass), 310, away), M = (q: P2): P2 => [(q[0] - x) / k, (G - q[1]) / k];
      const seat0: P2 = [614, G - 0.72 * ck], over: P2 = [676, 842], hand = mix(mix(seat0, [618, 962], rise), over, pass), reach = tw(t, 24, 13);
      const inBoat = t >= lift + 22, gIn: P2 = [702, RIM + 150];
      const pose = (gh: P2): Pose => ({ x, y: G, k, turn: lerp(0.15, 0.6, see) - 0.3 * away, bob: -0.3 * kneel - 0.03 * ant, lean: 6 * pass * (1 - away) - 2 * away, bend: 3 * pass * (1 - away),
        stretch: 1 - 0.04 * ant + 0.06 * pulse(t, lift - 2, 12) + 0.025 * pulse(t, lift + 22, 10), neck: -4 * rise * (1 - pass),
        footR: [0.09, 0.07 * pulse(t, 12, 14) + 0.07 * pulse(t, lift + 9, 13)], footL: [-0.09, 0.07 * pulse(t, lift + 26, 12)],
        handL: [-0.3 + 0.07 * pass * (1 - away), 0.84], handR: rel > 0 ? mix(M(over), [0.4 + 0.06 * wave, 1.42 + 0.03 * Math.abs(wave)], rel) : mix([0.3, 0.66], M(hand), reach),
        pipeUp: 0.9 * tw(t, lift - 8, 6) * (1 - rel), hatLift: 0.04 * pulse(t, lift - 2, 10), lookAt: [gh[0], gh[1]], nod: 0.5 * kneel,
        face: mixFace(mixFace(mixFace({ ...FACES.worried, eye: 1.1 }, { ...FACES.neutral, smile: 0.9, browY: [0.7, 0.7] }, kn), { ...FACES.stern, smile: -0.2 }, pulse(t, lift - 6, 16)), { ...FACES.glee, eye: 1 }, away) });
      // where the girl's feet are: on the deck, then riding on his hand, then lowered into the boat
      const gr = grips(pose([0, 0]), C.sir).R, c0: P2 = [over[0] + 6, over[1] + 0.72 * ck];
      const gp: P2 = t < lift - 4 ? [620, G] : !inBoat ? [gr.x + 6, gr.y + 0.72 * ck] : mix(c0, gIn, down);
      const gh: P2 = [gp[0], gp[1] - 1.42 * ck], sir = pose(gh);
      const turnTo = tw(t, 20, 9), fly = tw(t, lift - 1, 9) * (1 - down), sw = Math.sin(t * 0.6);
      const girl: Pose = { x: gp[0], y: gp[1], k: ck, turn: lerp(lerp(0.55 * Math.sin(t * 0.24), -0.5, turnTo), -0.45, down), lean: -7 * pulse(t, lift + 9, 13) + 2.5 * sw * fly, bob: 0.012 * Math.abs(Math.sin(t * 0.45)) * (1 - turnTo),
        stretch: 1 + 0.05 * pulse(t, lift - 1, 10) - 0.045 * pulse(t, lift + 31, 8), hatLift: 0.08 * pulse(t, lift - 1, 11),
        handL: mix(mix(mix([-0.06, 0.92], [-0.27, 1.02], turnTo), [-0.2, 1.08 + 0.05 * sw], fly), [-0.3, 1.3 + 0.05 * Math.sin(t * 0.9)], down), handR: mix(mix(mix([0.06, 0.92], [0.1, 0.95], turnTo), [0.36, 1.05 - 0.06 * sw], fly), [0.22, 0.86], down),
        footL: [-0.08 + 0.05 * sw * fly, 0.02 * fly], footR: [0.08 + 0.05 * Math.sin(t * 0.6 + 1.5) * fly, 0.035 * fly],
        sweat: t < 20 ? t : undefined, nervous: 0.8 * (1 - turnTo), lookAt: turnTo > 0.5 ? [x + 20, G - 1.3 * k] : undefined,
        face: mixFace(mixFace(mixFace({ ...FACES.worried, eye: 1.2, open: 0.15 }, { ...FACES.neutral, eye: 1.15, browY: [1, 1], smile: 0.2 }, turnTo), { ...FACES.shock, eye: 1.25 }, fly), { ...FACES.glee, eye: 1.05 }, down) };
      const lx = 925, lgy = RIM + 0.75 * lk, rch = tw(t, lift + 8, 12), rest = tw(t, lift + 33, 10), LM = (q: P2): P2 => [(q[0] - lx) / lk, (lgy - q[1]) / lk];
      const lady: Pose = { x: lx, y: lgy, k: lk, turn: -0.5, front: "L", lean: lerp(-2, -8, rch) * (1 - down) - down, neck: -3 * rch,
        handL: mix(mix([-0.3, 0.84], LM([gp[0] + 50, gp[1] - 0.76 * ck]), rch), LM([gIn[0] + 64, gIn[1] - 1.02 * ck]), rest), handR: [0.16, 0.8], lookAt: gh,
        face: mixFace({ ...FACES.worried, eye: 1.1 }, { ...FACES.neutral, smile: 1, browY: [0.6, 0.6] }, tw(t, lift + 14, 12)) };
      const rig = node("davit and far side of the boat", [520, 0, 560, 1100], (<g>
        <path d="M530 1340 L530 610 Q530 440 650 440" fill="none" stroke={INK} strokeWidth={36} strokeLinecap="round" /><path d="M530 1340 L530 610 Q530 440 650 440" fill="none" stroke="#c9ccd4" strokeWidth={21} strokeLinecap="round" />
        <path d={`M640 448 L606 ${RIM - 8} M1040 -80 L1040 ${RIM - 20}`} stroke={INK} strokeWidth={9} />
        <path d={`M588 ${RIM - 36} L1180 ${RIM - 24} L1180 ${RIM + 8} L574 ${RIM - 4} Z`} fill="#8f7a5c" {...o(8)} />
      </g>));
      const hull = node("near side of the boat", [560, 1060, 520, 440], (<g>
        <path d={`M572 ${RIM} L1180 ${RIM + 12} L1180 ${RIM + 430} L850 ${RIM + 340} Q624 ${RIM + 250} 572 ${RIM} Z`} fill="#f1efe8" {...o(10)} />
        <path d={`M628 ${RIM + 96} Q800 ${RIM + 140} 1180 ${RIM + 150} M686 ${RIM + 186} Q850 ${RIM + 232} 1180 ${RIM + 250}`} fill="none" stroke="#b9c1cf" strokeWidth={8} strokeLinecap="round" />
        <path d={`M564 ${RIM} L1180 ${RIM + 12}`} stroke={INK} strokeWidth={22} strokeLinecap="round" /><path d={`M564 ${RIM} L1180 ${RIM + 12}`} stroke="#8a5a32" strokeWidth={11} strokeLinecap="round" />
      </g>));
      const g: Draw = { t: "fig", who: "child", c: C.child, p: girl };
      return [{ t: "cam", z: lerp(1, 1.06, EASE.soft(t / T)), cx: 560, cy: 950, px: lerp(-10, 12, tw(t, lift - 6, 30)), py: lerp(6, -8, tw(t, lift - 4, 24)) }, bg("deck", 1.2, 0, -113), rig,
        { t: "fig", who: "lady", c: C.lady, p: lady, free: true }, ...(inBoat ? [g, { t: "fig", who: "lady", c: C.lady, p: lady, part: "hands", free: true } as Draw] : []), hull,
        { t: "fig", who: "sir", c: C.sir, p: sir, hold: { L: cane } }, ...(inBoat ? [] : [g])];
    },
  },
  { // the boats have room for 1,178 people. Only about 700 will be saved.
    name: "seats", from: S.seats, to: S.gone, closeup: true,
    draw: (t, T) => {
      const n1 = at("seats", "1,178") - S.seats, n7 = at("seats", "700") - S.seats, x0 = 100, w = 880, by = 1016, bh = 132, part = tw(t, n7, 28, EASE.out) * (700 / 1178), pop = EASE.back(c01((t - n1 + 2) / 9)), jolt = 1 + 0.05 * Math.sin(Math.PI * c01((t - n7) / 8));
      return [{ t: "cam", z: lerp(1, 1.035, EASE.soft(t / T)), cx: 540, cy: 760, py: lerp(6, -6, EASE.soft(t / T)) }, bg("deck", 1.5, 260, -420), boats20(t, 3, n1 - 2, 150, 372, 195, 92, 0.95),
        node("1,178 seats, about 700 saved", [x0 - 10, 770, w + 20, 390], (<g>
          {t >= n1 - 2 && <g transform={`translate(540 880) scale(${pop}) translate(-540 -880)`}>
            <text x={540} y={948} textAnchor="middle" fontFamily={FONT} fontSize={176} fill="#ffe14d" stroke={INK} strokeWidth={28} paintOrder="stroke" strokeLinejoin="round">1,178<tspan fontSize={78} fill="#ffffff" dx={22}>SEATS</tspan></text>
          </g>}
          {t >= n1 - 2 && <g transform={`translate(540 ${by + bh / 2}) scale(${Math.min(1, pop)} ${jolt}) translate(-540 ${-(by + bh / 2)})`}>
            <rect x={x0} y={by} width={w} height={bh} rx={18} fill="#16335a" {...o(10)} />
            {part > 0.005 && <rect x={x0 + 7} y={by + 7} width={(w - 14) * part} height={bh - 14} rx={12} fill="#7fd08a" />}
            {t >= n7 + 14 && <text x={x0 + 30} y={by + 92} fontFamily={FONT} fontSize={66} fill={INK}>ABOUT 700</text>}
            {t >= n7 + 26 && <text x={x0 + w - 28} y={by + 88} textAnchor="end" fontFamily={FONT} fontSize={50} fill="#9fb4d6">EMPTY</text>}
          </g>}
        </g>), "mid", true),
        ...(t >= n7 ? [{ t: "tag", text: "ONLY ABOUT 700 SAVED", y: 1462, age: t - n7 } as Draw] : [])];
    },
  },
  { // one by one, the boats pull away: three of them at three distances, rowing off from the tipping liner
    name: "gone", from: S.gone, to: S.none, closeup: true,
    draw: (t, T) => {
      const e = EASE.soft(t / T);
      return [{ t: "cam", z: lerp(1.03, 1.07, e), cx: 480, cy: 950, px: lerp(26, -26, e) }, SEA_HI, stars(t),
        sea(HORIZON, t, [linerFloat(1200, 880, 8.5 + 1.2 * e), boatFloat(4, lerp(330, 215, e), 58, 0.5, t), boatFloat(2, lerp(560, 430, e), 118, 0.66, t), boatFloat(3, lerp(820, 665, e), 196, 0.84, t)])];
    },
  },
  { // then there are none left: the falls hang empty; he looks up along them, chin high, and then everything drops
    name: "none", from: S.none, to: S.help,
    draw: (t, T) => {
      const k = 560, x = 640, nn = at("gone", "none") - S.none - 3, sweep = EASE.inOut(c01(t / 22)), sigh = tw(t, nn + 4, 12);
      const p: Pose = { x, y: GROUND, k, turn: lerp(-0.35, 0.3, sweep) * (1 - 0.6 * sigh), lean: 2 + 2 * sigh, bend: 6 * sigh, stretch: 1 + 0.03 * (1 - sigh) - 0.04 * sigh, bob: -0.02 * sigh, neck: lerp(-8, 5, sigh), headTilt: lerp(-5, 4, sweep) * (1 - sigh),
        nod: lerp(-0.7, 0.9, sigh), handL: [-0.36, 0.84], handR: [0.32, lerp(0.72, 0.58, sigh)], lookAt: sigh < 0.5 ? [lerp(380, 920, sweep), 380] : [x - 40, GROUND], sweat: t,
        face: mixFace({ ...FACES.worried, eye: 1.15, open: 0.2 }, { ...FACES.worried, eye: 0.9, smile: -1.3, browY: [0.2, 0.2] }, sigh) };
      return [{ t: "cam", z: lerp(1, 1.06, EASE.soft(t / T)), cx: 620, cy: 860, rot: -4.5, px: lerp(-10, 8, EASE.soft(t / T)) }, bg("deck", 1.3, 0, 0), falls(t), { t: "fig", who: "sir", c: C.sir, p, hold: { L: cane } },
        ...(t >= nn ? [{ t: "tag", text: "NO BOATS LEFT", y: 1462, age: t - nn } as Draw] : [])];
    },
  },
  { // a rescue ship is coming: the telescope comes up in BOTH hands, its eyepiece on his monocle, and finds her smoke.
    // It cannot be here before four: the glass sinks, he looks at us, then at the clock. The pipe sits in the far corner
    // of his mouth, away from the telescope and both arms.
    name: "help", from: S.help, to: S.left,
    draw: (t, T) => {
      const k = 560, x = 320, HZ = 820, cn = at("help", "cannot") - S.help, four = at("help", "four") - S.help;
      const upG = EASE.back(c01((t - 2) / 11)), ant = pulse(t, cn - 6, 8), dn = tw(t, cn + 1, 13), found = tw(t, 16, 10), slump = tw(t, four + 6, 14), scan = Math.sin(t * 0.17) * (1 - found);
      const stx = lerp(925, 962, t / T), hr = lerp(2.1, 4, tw(t, cn, Math.max(8, four - cn), EASE.inOut));
      const base: Pose = { x, y: GROUND, k, turn: lerp(0.7, 0.2, dn), lean: lerp(2, -1, dn) - 2 * ant + 2 * slump, bend: 5 * slump, neck: -2 * dn + 3 * slump,
        stretch: 1 + 0.03 * ant + 0.025 * pulse(t, 2, 11) - 0.035 * slump, bob: -0.01 * slump, front: "R", pipeSide: -1, nod: 0.8 * slump };
      // the eyepiece goes to the monocle, the barrel points at the ship; the hands hold it 0.13 m and 0.47 m along
      const g = solve(base, C.sir), tr = base.turn!, mx = tr * 0.13 - 0.105 * (1 - 0.22 * Math.abs(tr)), a = (g.headDeg * Math.PI) / 180;
      const mon: P2 = [g.head[0] + (mx * Math.cos(a) + 0.03 * Math.sin(a)) * k, g.head[1] + (mx * Math.sin(a) - 0.03 * Math.cos(a)) * k];
      const aim = Math.atan2(HZ - 26 - mon[1], stx - 70 - mon[0]) + 0.05 * scan, M = (d: number): P2 => [(mon[0] + Math.cos(aim) * d * k - x) / k, (GROUND - mon[1] - Math.sin(aim) * d * k) / k], w = upG * (1 - dn);
      const p: Pose = { ...base, handL: mix([-0.04, 0.8], M(0.13), w), handR: mix([0.32, 0.72], M(0.47), w), sweat: dn > 0.5 ? t : undefined, lookAt: dn < 0.5 ? [stx, HZ] : t > four ? [800, 480] : undefined,
        face: mixFace({ ...FACES.neutral, eye: 0.3, smile: lerp(0.1, 1.1, found), browY: [0.7, -0.2] }, { ...FACES.worried, eye: 1.15, open: 0.3 * pulse(t, cn + 4, 18) }, dn) };
      const steamer = ship(stx, HZ + 6 - 0.045 * 250, 250, 1) as NodeDraw;
      const smoke = [0, 1, 2, 3].map((i) => { const tt = (t * 1.2 + i * 16) % 64; return <circle key={i} cx={stx - 150 - tt * 1.4} cy={HZ - 64 - tt * 1.1} r={9 + tt * 0.35} fill="#c9ccd4" opacity={0.7 * (1 - tt / 64)} />; });
      return [{ t: "cam", z: lerp(1, 1.05, EASE.soft(t / T)), cx: 480, cy: 850, px: lerp(12, -8, tw(t, cn - 4, 24)) }, SEA_HI, stars(t, 800),
        sea(HZ, t, [{ x: stx - 120, y: 6, el: (dy) => <g transform={`translate(0 ${dy * 0.3})`}>{smoke}{steamer.el}</g> }]),
        ...(t >= cn ? [clock(800, 480, 0.72, hr, EASE.back(c01((t - cn) / 9)))] : []),
        { t: "fig", who: "sir", c: C.sir, p, hold: { both: telescope("L") } }, rail(1470),
        ...(t >= four - 3 ? [{ t: "tag", text: "RESCUE: 4 IN THE MORNING", y: 1462, age: t - four + 3 } as Draw] : [])];
    },
  },
  { // about 1,500 of us are still on board: he jerks a thumb at the crowd behind him, looks back at them, gulps, and
    // taps the air towards the deck. The crowd: three rows, no two alike, each swaying, waving or hiding the face.
    name: "left", from: S.left, to: S.cliff,
    draw: (t, T) => {
      const k = 545, x = 560, n = at("left", "1,500") - S.left - 2, us = at("left", "us") - S.left, still = at("left", "still") - S.left, brd = at("left", "board.") - S.left;
      const thumb = EASE.back(c01((t - 2) / 9)) * (1 - tw(t, us + 4, 9)), look = tw(t, n + 6, 12) * (1 - tw(t, us + 6, 10)), gulp = pulse(t, us + 10, 9), down = tw(t, still - 4, 9), taps = pulse(t, still + 2, 7) + pulse(t, brd, 7);
      const p: Pose = { x, y: GROUND, k, turn: lerp(0.1, -0.5, look), lean: 4 + 1.2 * Math.sin(t * 0.1) - 2 * thumb, bend: -3 * thumb + 3 * down, stretch: 1 + 0.03 * pulse(t, 2, 9) - 0.035 * gulp - 0.02 * taps, neck: -6 * look, headTilt: 2 * Math.sin(t * 0.13) + 4 * thumb * (1 - look),
        handL: [-0.36, 0.84], handR: mix(mix([0.32, 0.66], [0.5, 1.12], thumb), [0.3, 0.54 - 0.07 * taps], down), pipeSide: 1, nod: gulp + 0.8 * taps, lookAt: look > 0.5 ? [150, 1180] : undefined, sweat: t,
        face: mixFace({ ...FACES.worried, eye: 1.15, open: talk(t, 0, T - 4) }, { ...FACES.shock, eye: 1.15, open: 0.5 }, look) };
      const row = (cnt: number, x0: number, dx: number, y: number, sc: number, id0: number) => Array.from({ length: cnt }, (_, i) => ({ px: x0 + i * dx + 20 * rnd(i + id0), py: y + 16 * rnd(i + id0 + 7), sc: sc + 0.45 * rnd(i + id0 + 20), id: i + id0 }));
      const crowd = [...row(12, 40, 92, 1196, 1.7, 41), ...row(10, 70, 104, 1262, 2.2, 1), ...row(8, 118, 120, 1344, 2.7, 21)];
      return [{ t: "cam", z: lerp(1, 1.03, EASE.soft(t / T)), cx: 540, cy: 1100, rot: -6, py: lerp(-12, -3, EASE.soft(t / T)), px: lerp(-10, 8, EASE.soft(t / T)) }, bg("deck", 1.34, 0, 0),
        node("the crowd on deck", [0, 1000, W, 380], <g>{crowd.map((c, j) => folk(j, c.px, c.py, c.sc, c.id, t, c.px < 540 ? 0.5 : -0.5))}</g>, "bg"),
        { t: "fig", who: "sir", c: C.sir, p, hold: { L: cane } },
        ...(t >= n ? [board("1,500 on board", "1,500", "STILL ON BOARD", t - n, 322)] : [])];
    },
  },
  { // and the sea has reached my shoes: it runs up the tipping deck, level. He looks down; the cane slips from his hand
    // and floats off; then he is stamping and windmilling in it, rings spreading round his legs and his coat tails,
    // a splash at every step, while the camera shakes and pushes in.
    name: "cliff", from: S.cliff, to: TITANIC2_TOTAL,
    draw: (t, T) => {
      const k = 560, x = 520, sea0 = at("cliff", "sea") - S.cliff, sh = at("cliff", "shoes") - S.cliff, rot = lerp(-6, -9.5, EASE.inOut(c01(t / 70)));
      const lvl = t < sh ? lerp(1990, 1585, tw(t, sea0, sh - sea0, EASE.out)) : lerp(1585, 1340, tw(t, sh, T - sh - 6, EASE.soft));
      const shake = shk(t, sea0 + 12, 8, 9) + shk(t, sh, 13, 8) + (t > sh ? 2.5 * Math.sin(t * 1.7) : 0), cx = 540 + shake, cy = 1100 + 0.5 * shake;
      /** a point on the tipped deck -> the same point in the water's level coordinates */
      const R = (q: P2): P2 => { const a = (rot * Math.PI) / 180, dx = q[0] - cx, dy = q[1] - cy; return [cx + dx * Math.cos(a) - dy * Math.sin(a), cy + dx * Math.sin(a) + dy * Math.cos(a)]; };
      const down = tw(t, sea0 + 2, 9), ant = pulse(t, sh - 7, 7), hop = EASE.back(c01((t - sh) / 8)), fl = c01((t - sh) / 6), a = (t - sh) * 0.62;
      const u = Math.max(0, (t - sh) / 7), j = Math.floor(u), up = t >= sh ? Math.sin(Math.PI * (u - j)) : 0, drop = t >= sh - 5;
      const flail = (q: number, s: number): P2 => [s * (0.5 - 0.07 * Math.cos(q)), 1.2 + 0.33 * Math.sin(q)];
      const p: Pose = { x, y: GROUND, k, turn: 0.12 + 0.18 * Math.sin(a * 0.5) * fl, lean: lerp(7, 3, hop) + 3 * Math.sin(a * 0.5) * fl, bend: 6 * down * (1 - fl) - 3 * Math.sin(a * 0.5) * fl, bob: -0.05 * ant + 0.05 * pulse(t, sh, 9),
        stretch: 1 - 0.06 * ant + 0.07 * pulse(t, sh, 9) + 0.02 * Math.sin(a) * fl, neck: lerp(8 * down, 3, fl),
        handL: mix(mix([-0.36, 0.84], [-0.32, 0.92], down), flail(a, -1), fl), handR: mix(mix([0.32, 0.66], [0.26, 1.16], down), flail(a + 2.3, 1), fl),
        footL: [-0.14, 0.2 * (j % 2 === 1 ? up : 0)], footR: [0.16, 0.22 * (j % 2 === 0 ? up : 0)], hatLift: 0.1 * pulse(t, sh, 14) + 0.03 * Math.abs(Math.sin(a)) * fl,
        nod: 0.9 * down * (1 - fl) + 0.5 * fl * Math.max(0, Math.sin(a * 0.5)), lookAt: fl < 0.5 || Math.sin(a * 0.5) > 0 ? [x + 60, GROUND + 40] : undefined,
        shock: t >= sea0 + 8 ? t - sea0 - 8 : undefined, sweat: t, nervous: 0.5 + 0.5 * fl,
        face: mixFace({ ...FACES.worried, eye: 1.2 }, { ...FACES.shock, eye: 1.35, open: 0.6 + 0.4 * Math.abs(Math.sin(t * 0.7)) }, tw(t, sea0 + 6, 9)) };
      // where the water meets his legs, and where each foot comes down
      const F = R([x + 0.01 * k, GROUND]), Hp = R([x, GROUND - 0.72 * k]), s = c01((F[1] - lvl) / (F[1] - Hp[1])), xw = lerp(F[0], Hp[0], s), fR = R([x + 0.16 * k, GROUND]), fL = R([x - 0.14 * k, GROUND]);
      const wet = lvl < F[1] - 14;
      const drops = [splash("in", xw, lvl, t - sh + 3, 2.4), ...Array.from({ length: 12 }, (_, m) => splash(`s${m}`, (m % 2 ? fL : fR)[0], lvl, t - (sh + 7 * (m + 1)), 1.7 + 0.5 * (m % 3 === 0 ? 1 : 0)))];
      // the cane: it falls out of his hand, lands flat and floats off to the left, half under water
      const c0 = R([x - 0.32 * k, GROUND - 0.92 * k]), ct = t - (sh - 5), fall = EASE.in(c01(ct / 9)), land: P2 = [400, lvl + 2];
      const kx = lerp(c0[0], land[0], c01(ct / 9)) - Math.max(0, ct - 9) * 1.3, ky = ct < 9 ? lerp(c0[1], land[1], fall) : lvl + 2 + 5 * Math.sin(t * 0.2), ka = lerp(rot, -84, EASE.inOut(c01(ct / 9))) + (ct > 9 ? 3 * Math.sin(t * 0.17) : 0);
      const afloat = drop ? (<g transform={`translate(${kx} ${ky}) rotate(${ka})`}>
        <path d={`M0 0 L0 ${0.83 * k}`} stroke={INK} strokeWidth={0.04 * k} strokeLinecap="round" /><path d={`M0 0 L0 ${0.83 * k}`} stroke="#5a3a20" strokeWidth={0.018 * k} strokeLinecap="round" />
        <circle cx={0} cy={-0.012 * k} r={0.036 * k} fill="#f0bd3c" stroke={INK} strokeWidth={0.011 * k} />
      </g>) : null;
      const arcs = fl > 0.9 ? [-1, 1].map((sd) => trail(`flail arc ${sd}`, [1, 2, 3, 4].map((i): P2 => { const q = flail((sd < 0 ? a : a + 2.3) - 0.32 * i, sd); return [x + q[0] * k, GROUND - q[1] * k]; }), 26)) : [];
      return [{ t: "cam", z: lerp(1.02, 1.1, EASE.soft(t / T)), cx, cy, rot }, bg("deck", 1.4, 0, 0),
        levelSea(lvl - 46, t * 0.17 + 2, cx, cy, rot, "#1f5680", 0.9, "the sea, behind him", -1),
        { t: "fig", who: "sir", c: C.sir, p, hold: drop ? undefined : { L: cane } },
        levelSea(lvl, t * 0.22, cx, cy, rot, "#2f6f9e", 0.88, "the sea on the deck", 5, afloat, <g>{wet && ripples(xw, lvl, t, 1.3 + 0.7 * s)}{drops}{ct >= 8 && splash("cane", 330, lvl, ct - 8, 1.4)}</g>),
        ...arcs,
        ...(t >= sh + 16 ? [{ t: "tag", text: "TO BE CONTINUED", sub: "Part 3: the water", y: 1462, age: t - sh - 16 } as Draw] : [])];
    },
  },
];

/** thumbnail picture (everything in it is in the film): the boat rowing away behind Sir Digsworth, who hangs over the rail */
export const TITANIC2_THUMB: Scene = {
  name: "thumb", from: 0, to: 1, closeup: true,
  draw: () => {
    const k = 760, RY = 1560, gy = RY + 0.8 * k;
    const p: Pose = { x: 330, y: gy, k, turn: 0.4, lean: 8, bend: 6, neck: 3, front: "R", pipeSide: -1, handL: [-0.22, 0.805], handR: [0.64, 1.62], hatLift: 0.05, shock: 9, sweat: 6, still: true, face: { ...FACES.shock, lookX: 0.6, lookY: 0.1, eye: 1.4 } };
    return [{ t: "cam", z: 1, cx: 540, cy: 900 }, SEA_HI, stars(12), sea(HORIZON, 12, [boatFloat(1, 880, 128, 1.0, 12)]), ...atRail(p, RY)];
  },
};

export const TITANIC2: Film = {
  scenes: SCENES, caps: CAPS, cast: C, audio: "titanic/mix-2.wav", bgDir: "titanic", total: TITANIC2_TOTAL,
  hook: [{ text: "THAT LIFEBOAT", from: 0, size: 84, color: "#ffffff" }, { text: "IS LEAVING.", from: 0, size: 84, color: "#ffffff" }, { text: "I'M NOT IN IT.", from: at("hook", "And") - 1, size: 84, color: "#ffe14d" }],
};
