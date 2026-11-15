// "I Survived the Titanic: Part 2" (Short, 2D): the lifeboats. Only facts already checked against two source
// families are spoken (FACTS-titanic.md); Sir Digsworth's own part is dramatised and the film says so.
// Version 2 (2026-11-15): acted with the jointed rig in fig.tsx. Layers back to front: painted sky | twinkling stars |
// the sea in bands, with everything afloat sorted into it | background props and crowd | characters (back arm, body,
// head, front arm, things held in the grip) | railing | tags and captions. Every move has a cubic-bezier curve,
// an anticipation and a settle; the camera pushes in, pans and shakes. Checked by check.ts before rendering.
import React from "react";
import { EASE, FACES, Grip, INK, mixFace, Pose, tw } from "./fig";
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
/** a small passenger with his or her own height, width, coat, hat, head tilt, mood and sway. Base centre (px, py). */
const folk = (key: number, px: number, py: number, sc: number, id: number, t: number, look = 0): React.ReactNode => {
  const r = (j: number) => rnd(id * 9.7 + j), col = COATS[Math.floor(r(1) * COATS.length)], hat = Math.floor(r(2) * 7), hc = HATC[Math.floor(r(9) * HATC.length)];
  const wide = 0.85 + 0.45 * r(3), tall = 0.82 + 0.4 * r(4), tilt = (r(5) - 0.5) * 18 + 3.5 * Math.sin(t * (0.05 + 0.04 * r(10)) + id), mood = Math.floor(r(6) * 5);
  const bob = 2.2 * Math.sin(t * (0.09 + 0.05 * r(7)) + id * 2), lx = look * 3.4 + (r(8) - 0.5) * 3 + 1.2 * Math.sin(t * 0.06 + id * 3), hy = -54 * tall - 11, bl = Math.floor(t + r(11) * 90) % (84 + Math.floor(r(12) * 30)) < 4;
  const st = { stroke: INK, strokeWidth: 4.2, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  return (<g key={key} transform={`translate(${px} ${py + bob}) scale(${sc})`}>
    <path d={`M${-21 * wide} 0 Q${-17 * wide} ${-50 * tall} 0 ${-52 * tall} Q${17 * wide} ${-50 * tall} ${21 * wide} 0 Z`} fill={col} {...st} />
    {r(13) > 0.5 && <path d={`M-7 ${-48 * tall} L0 ${-36 * tall} L7 ${-48 * tall}`} fill="none" stroke={r(14) > 0.5 ? "#f4f1e6" : INK} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" />}
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
      {hat === 5 && <path d="M-19 4 Q-23 -25 0 -25 Q23 -25 19 4 Q14 -12 0 -13 Q-14 -12 -19 4 Z" fill={COATS[(Math.floor(r(1) * COATS.length) + 3) % COATS.length]} {...st} strokeWidth={3.6} />}
      {hat === 6 && <path d="M-17 -10 Q-26 -22 -8 -26 Q12 -30 21 -20 Q24 -12 17 -10 Q0 -17 -17 -10 Z" fill={hc} {...st} strokeWidth={3.6} />}
    </g>
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
    {[-98, -36, 30, 94].map((px, i) => folk(i, px, -2, 1.42, id * 11 + i, t, -0.6))}
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
/** the cane, held in the grip: knob in the hand, tip on the deck */
const caneHold = (g: Grip): React.ReactNode => (<g>
  <path d={`M${g.x} ${g.y} L${g.x + 0.04 * g.k} ${g.gy - 6}`} stroke={INK} strokeWidth={0.04 * g.k} strokeLinecap="round" /><path d={`M${g.x} ${g.y} L${g.x + 0.04 * g.k} ${g.gy - 6}`} stroke="#5a3a20" strokeWidth={0.018 * g.k} strokeLinecap="round" />
  <circle cx={g.x} cy={g.y - 0.012 * g.k} r={0.036 * g.k} fill="#f0bd3c" stroke={INK} strokeWidth={0.011 * g.k} />
</g>);
/** the telescope, held in the grip at its eyepiece end and pointing at (ex, ey) */
const scopeHold = (ex: number, ey: number) => (g: Grip): React.ReactNode => {
  const x0 = g.x - (ex - g.x) * 0.1, y0 = g.y - (ey - g.y) * 0.1, mx = lerp(x0, ex, 0.5), my = lerp(y0, ey, 0.5);
  return (<g>
    <path d={`M${x0} ${y0} L${ex} ${ey}`} stroke={INK} strokeWidth={0.082 * g.k} strokeLinecap="round" /><path d={`M${x0} ${y0} L${mx} ${my}`} stroke="#b98a52" strokeWidth={0.054 * g.k} strokeLinecap="round" />
    <path d={`M${mx} ${my} L${ex} ${ey}`} stroke={INK} strokeWidth={0.107 * g.k} strokeLinecap="round" /><path d={`M${mx} ${my} L${ex} ${ey}`} stroke="#e2a92c" strokeWidth={0.079 * g.k} strokeLinecap="round" />
    <path d={`M${lerp(x0, ex, 0.93)} ${lerp(y0, ey, 0.93)} L${ex} ${ey}`} stroke="#fff1b8" strokeWidth={0.04 * g.k} strokeLinecap="round" opacity={0.8} />
  </g>);
};
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
/** water that stays level on the screen while the camera tips with the deck (cx, cy, rot = the camera's) */
const levelSea = (y: number, ph: number, cx: number, cy: number, rot: number, layer: Layer, col: string, opacity: number, name: string): Draw => {
  let d = `M-500 ${H + 500} L-500 ${y}`;
  for (let x = -500; x <= W + 500; x += 40) d += ` L${x} ${(y + 13 * Math.sin(x * 0.012 + ph) + 7 * Math.sin(x * 0.031 - ph * 1.7)).toFixed(1)}`;
  return node(name, [0, y, W, H - y], (<g transform={`rotate(${-rot} ${cx} ${cy})`}>
    <path d={`${d} L${W + 500} ${H + 500} Z`} fill={col} opacity={opacity} {...o(8)} />
    <path d={`M-300 ${y + 58} Q270 ${y + 38 + 10 * Math.sin(ph)} 540 ${y + 60} T1400 ${y + 56}`} fill="none" stroke="#9fd0ee" strokeWidth={8} strokeLinecap="round" opacity={0.8} />
  </g>), layer);
};

// ---------------------------------------------------------------- scenes
const S = { hook: 0, truth: at("truth") - 1, recap: at("recap") - 1, sink: at("recap", "She") - 2, order: at("order") - 1, child: at("child") - 1, seats: at("seats") - 1, gone: at("gone") - 1, none: at("gone", "Then") - 2, help: at("help") - 1, left: at("left") - 1, cliff: at("cliff") - 1 };
export const TITANIC2_CUTS = S;
const SCENES: Scene[] = [
  { // a lifeboat rows away over the black sea; Sir Digsworth waves after it from the rail, then turns to us
    name: "hook", from: S.hook, to: S.truth, captions: false, closeup: true,
    draw: (t, T) => {
      const k = 800, and = at("hook", "And") - 1, tn = tw(t, and - 5, 13), e = EASE.soft(t / T), wv = Math.sin(t * 0.6) * (1 - tn);
      const bx = lerp(800, 905, e), by = lerp(74, 46, e), bs = lerp(0.84, 0.6, e);
      const p: Pose = { x: 330, y: 900 + 1.42 * k, k, turn: lerp(0.85, 0.22, tn), lean: lerp(-2.6, 0.6, tn) + 0.7 * Math.sin(t * 0.21), stretch: 1 + 0.06 * Math.sin(Math.PI * c01(t / 10)) - 0.03 * Math.sin(Math.PI * c01((t - and + 5) / 13)),
        neck: lerp(4, -2, tn), front: "R", handR: [lerp(0.33 + 0.07 * wv, 0.28, tn), lerp(1.64 + 0.05 * Math.cos(t * 0.6), 0.9, tn)], handL: [-0.3, lerp(0.76, 0.6, tn)],
        hatLift: 0.05 * (1 - tw(t, 0, 16, EASE.out)) + 0.03 * Math.sin(Math.PI * c01((t - and + 3) / 12)), lookAt: tn < 0.5 ? [bx, HORIZON + by] : undefined, shock: t, sweat: t,
        face: mixFace({ ...FACES.shock, eye: 1.3 }, { ...FACES.worried, eye: 1.2, lookY: -0.15, open: 0.3, browY: [0.9, 0.9] }, tn) };
      return [{ t: "cam", z: lerp(1.0, 1.06, e), cx: 540, cy: 900, px: lerp(-10, 8, e) }, SEA_HI, stars(t), sea(HORIZON, t, [boatFloat(1, bx, by, bs, t)]), { t: "fig", who: "sir", c: C.sir, p, close: true }, rail(1470)];
    },
  },
  { // my part is made up; everything around me is true. The deck is already tipping: a suitcase slides past.
    name: "truth", from: S.truth, to: S.recap,
    draw: (t, T) => {
      const k = 600, x = 590, ev = at("truth", "Everything") - S.truth, sl = EASE.inOut(t / T), sx = lerp(990, 215, sl), look = tw(t, ev - 5, 11), sh = EASE.back(c01((t - ev) / 11)) * (1 - tw(t, ev + 28, 12));
      const p: Pose = { x, y: GROUND, k, turn: lerp(-0.3, 0.1, look), lean: 3 + 1.2 * Math.sin(t * 0.1), stretch: 1 - 0.025 * Math.sin(Math.PI * c01((t - ev + 5) / 9)) + 0.03 * sh, neck: lerp(-5, 0, look),
        handL: [-0.36, 0.84], handR: [0.3 + 0.1 * sh, 0.74 + 0.3 * sh], headTilt: lerp(-6, 3, look), lookAt: look < 0.5 ? [sx, GROUND - 50] : undefined,
        face: mixFace({ ...FACES.worried, eye: 1.1 }, { ...FACES.neutral, browY: [0.2, 0.9], smile: 0.25 }, look) };
      return [{ t: "cam", z: lerp(1, 1.05, sl), cx: 580, cy: 950, rot: -3.5, px: lerp(-14, 10, sl) }, bg("deck", 1.27, 0, 0), suitcase(sx, GROUND + 6, -7 * Math.sin(t * 0.32)), { t: "fig", who: "sir", c: C.sir, p, hold: { L: caneHold } },
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
  { // the order is women and children first. He steps up, the officer's palm stops him. So I stay: a step back, hat off.
    name: "order", from: S.order, to: S.child,
    draw: (t, T) => {
      const so = at("order", "So") - S.order, wm = at("order", "women") - S.order - 3, fi = at("order", "first") - S.order;
      const ant = tw(t, so - 7, 6, EASE.out) * (1 - tw(t, so - 1, 5)), st = EASE.back(c01((t - so) / 13)), tip = Math.sin(Math.PI * c01((t - so - 5) / 22));
      const talk = t >= wm && t < fi + 12 ? 0.35 + 0.45 * Math.abs(Math.sin(t * 0.75)) : 0, nod = t > fi + 12 ? 5 * Math.sin(Math.PI * c01((t - fi - 12) / 14)) : 0, halt = EASE.back(c01((t - 2) / 9));
      const off: Pose = { x: 795, y: GROUND, k: K, turn: -0.6, lean: -3 + 1.5 * halt, stretch: 1 + 0.02 * Math.sin(Math.PI * c01((t - 2) / 9)), front: "L", handL: [lerp(-0.3, -0.42, halt), lerp(0.8, 1.3, halt) + 0.012 * Math.sin(t * 0.5)], handR: [0.14, 0.72], headTilt: nod,
        face: { ...FACES.stern, open: talk, lookX: -0.7 } };
      const sir: Pose = { x: lerp(318, 296, st) + 14 * ant, y: GROUND, k: K, turn: lerp(0.6, 0.18, st), lean: lerp(5, -2.5, st) + 5 * ant, stretch: 1 - 0.04 * ant + 0.035 * Math.sin(Math.PI * c01((t - so) / 13)), neck: 4 * ant - 3 * tip, front: "R",
        handL: [-0.34, 0.84], handR: [0.2 + 0.1 * tip, lerp(1.0, 1.0 + 0.62 * tip, st)], hatLift: 0.1 * tip, headTilt: 6 * tip,
        lookAt: st < 0.5 ? [795, 860] : undefined, sweat: t < so ? t : undefined,
        face: mixFace({ ...FACES.worried, eye: 1.15, open: 0.2 }, { ...FACES.stern, lookX: 0.1, smile: 0.2, browY: [0.2, 0.2] }, st) };
      return [{ t: "cam", z: lerp(1, 1.025, EASE.soft(t / T)), cx: 540, cy: 820, px: lerp(14, -12, tw(t, so - 8, 20)) }, bg("deck", 1.09, 0, 0), davitBoat(560, 470, 0.62, 2 * Math.sin(t * 0.1)),
        { t: "fig", who: "sir", c: C.sir, p: sir, hold: { L: caneHold } }, { t: "fig", who: "officer", c: C.officer, p: off },
        ...(t >= wm ? [{ t: "tag", text: "WOMEN AND CHILDREN FIRST", y: 1462, age: t - wm } as Draw] : [])];
    },
  },
  { // a little girl is alone. He crouches, takes her under the arms and lifts her over the gunwale to a lady in the boat.
    name: "child", from: S.child, to: S.seats, closeup: true,
    draw: (t, T) => {
      const k = 560, ck = 330, lift = at("child", "lift") - S.child, step = tw(t, lift - 2, 13) * (1 - tw(t, lift + 27, 12)), x = 400 + 45 * step;
      const crouch = tw(t, lift - 21, 15), up = tw(t, lift, 15, EASE.out), arc = Math.sin(Math.PI * c01((t - lift) / 15)), down = tw(t, lift + 15, 11), rel = EASE.back(c01((t - lift - 27) / 10)), inBoat = down > 0.6;
      const U: [number, number] = [lerp(lerp(625, 665, up), 715, down), lerp(lerp(1408, 790, up), 886, down)], gy = U[1] + 0.62 * ck;
      const hand = (px: number, py: number): [number, number] => [(px - x) / k, (GROUND - py) / k], hL = hand(U[0] - 46, U[1] + 8), hR = hand(U[0] + 46, U[1] + 8), on = crouch * (1 - c01(rel));
      const sir: Pose = { x, y: GROUND, k, turn: 0.55, lean: lerp(lerp(lerp(3, 11, crouch), -5, up), 5, down) - 8 * c01(rel), bob: lerp(lerp(-0.13 * crouch, 0.035, up), 0, down), footR: [0.09, 0.07 * Math.sin(Math.PI * step)], stretch: 1 - 0.05 * crouch * (1 - up) + 0.06 * arc, neck: lerp(12 * crouch, -7, up) * (1 - down),
        handL: [lerp(-0.3, hL[0], on), lerp(0.66, hL[1], on)], handR: rel > 0 ? [lerp(hR[0], 0.38, c01(rel)), lerp(hR[1], 1.24 + 0.05 * Math.sin(t * 0.8), rel)] : [lerp(0.32, hR[0], crouch), lerp(0.7, hR[1], crouch)],
        lookAt: [U[0], U[1] - 0.8 * ck], face: mixFace({ ...FACES.worried, eye: 1.1 }, { ...FACES.neutral, smile: 1.2, browY: [0.7, 0.7] }, down) };
      const girl: Pose = { x: U[0], y: gy, k: ck, turn: lerp(lerp(0.55 * Math.sin(t * 0.21), -0.45, crouch), -0.5, down), lean: -10 * arc, bob: 0.012 * Math.abs(Math.sin(t * 0.45)) * (1 - crouch),
        handL: [lerp(-0.1, -0.3, up), lerp(0.6, 0.86, up) + (inBoat ? 0.16 + 0.05 * Math.sin(t * 0.9) : 0)], handR: [lerp(0.1, 0.3, up), lerp(0.6, 0.82, up)], footL: [-0.08 - 0.05 * arc, 0], footR: [0.07 - 0.07 * arc, 0.03 * arc],
        sweat: t < lift - 12 ? t : undefined, lookAt: crouch > 0.5 ? [x + 60, GROUND - 1.4 * k] : undefined,
        face: mixFace(mixFace({ ...FACES.worried, lookX: Math.sin(t * 0.21), eye: 1.2, open: 0.15 }, { ...FACES.shock, eye: 1.25 }, up), { ...FACES.glee, eye: 1.05 }, down) };
      const lx = 925, lk = 420, lgy = 1371, reach = tw(t, lift + 6, 14);
      const lady: Pose = { x: lx, y: lgy, k: lk, turn: -0.5, lean: lerp(-2, -9, reach) * (1 - down) + 3 * down, handL: [lerp(-0.3, (U[0] + 78 - lx) / lk, reach), lerp(0.82, (lgy - U[1] - 24) / lk, reach)], handR: [lerp(0.12, -0.12, reach), lerp(0.8, 0.98, reach)],
        lookAt: [U[0], U[1] - 0.7 * ck], face: mixFace({ ...FACES.worried, eye: 1.1 }, { ...FACES.neutral, smile: 1, browY: [0.6, 0.6] }, down) };
      const sw = 1.2 * Math.sin(t * 0.12) + 2.2 * down * Math.sin((t - lift - 15) * 0.4) * Math.exp(-Math.max(0, t - lift - 15) / 12);
      const rig = node("davit and far side of the boat", [480, 0, 600, 1300], (<g>
        <path d="M500 1300 L500 700 Q500 545 632 545" fill="none" stroke={INK} strokeWidth={36} strokeLinecap="round" /><path d="M500 1300 L500 700 Q500 545 632 545" fill="none" stroke="#c9ccd4" strokeWidth={21} strokeLinecap="round" />
        <g transform={`rotate(${sw} 800 -400)`}><path d="M616 548 L590 984 M1016 -80 L1016 986" stroke={INK} strokeWidth={9} /><path d="M562 976 L1170 986 L1170 1014 L548 1002 Z" fill="#8f7a5c" {...o(8)} /></g>
      </g>));
      const hull = node("near side of the boat", [540, 990, 540, 340], (<g transform={`rotate(${sw} 800 -400)`}>
        <path d="M548 1000 L1170 1012 L1170 1340 L770 1284 Q578 1212 548 1000 Z" fill="#f1efe8" {...o(10)} />
        <path d="M604 1092 Q770 1134 1170 1142 M652 1174 Q810 1218 1170 1236" fill="none" stroke="#b9c1cf" strokeWidth={8} strokeLinecap="round" />
        <path d="M540 1000 L1170 1012" stroke={INK} strokeWidth={22} strokeLinecap="round" /><path d="M540 1000 L1170 1012" stroke="#8a5a32" strokeWidth={11} strokeLinecap="round" />
      </g>));
      const g: Draw = { t: "fig", who: "child", c: C.child, p: girl, free: true };
      return [{ t: "cam", z: lerp(1, 1.05, EASE.soft(t / T)), cx: 560, cy: 1000, px: lerp(-8, 10, tw(t, lift - 6, 30)), py: lerp(8, -12, tw(t, lift - 6, 24)) }, bg("deck", 1.12, 0, 0), rig,
        { t: "fig", who: "lady", c: C.lady, p: lady, free: true }, ...(inBoat ? [g] : []), hull,
        { t: "fig", who: "sir", c: C.sir, p: sir, part: "rear" }, ...(inBoat ? [] : [g]), { t: "fig", who: "sir", c: C.sir, p: sir, part: "front" }];
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
  { // then there are none left: the falls hang empty; he looks along them and his shoulders drop
    name: "none", from: S.none, to: S.help,
    draw: (t, T) => {
      const k = 560, x = 640, nn = at("gone", "none") - S.none - 3, sweep = EASE.inOut(c01(t / 26)), sigh = tw(t, nn + 2, 12);
      const p: Pose = { x, y: GROUND, k, turn: lerp(-0.35, 0.3, sweep) * (1 - 0.6 * sigh), lean: 2 + 2 * sigh, stretch: 1 + 0.03 * (1 - sigh) - 0.035 * sigh, bob: -0.02 * sigh, neck: lerp(-8, 6 * sigh, sigh), headTilt: lerp(-5, 4, sweep),
        handL: [-0.36, 0.84], handR: [0.32, lerp(0.7, 0.6, sigh)], lookAt: sigh < 0.5 ? [lerp(380, 920, sweep), 380] : [x - 40, GROUND], sweat: t,
        face: mixFace({ ...FACES.worried, eye: 1.15 }, { ...FACES.worried, eye: 0.9, smile: -1.3, browY: [0.2, 0.2] }, sigh) };
      return [{ t: "cam", z: lerp(1, 1.06, EASE.soft(t / T)), cx: 620, cy: 860, rot: -4.5, px: lerp(-10, 8, EASE.soft(t / T)) }, bg("deck", 1.3, 0, 0), falls(t), { t: "fig", who: "sir", c: C.sir, p, hold: { L: caneHold } },
        ...(t >= nn ? [{ t: "tag", text: "NO BOATS LEFT", y: 1462, age: t - nn } as Draw] : [])];
    },
  },
  { // a rescue ship is coming (he finds her smoke in the telescope); it cannot be here before four: the glass comes down
    name: "help", from: S.help, to: S.left,
    draw: (t, T) => {
      const k = 560, x = 330, cn = at("help", "cannot") - S.help, four = at("help", "four") - S.help;
      const upG = EASE.back(c01(t / 11)), ant = Math.sin(Math.PI * c01((t - cn + 5) / 8)), dn = tw(t, cn + 1, 12), find = Math.sin(t * 0.16) * (1 - c01(t / 40));
      const p: Pose = { x, y: GROUND, k, turn: lerp(0.8, 0.22, dn), lean: lerp(4, -1, dn) - 1.5 * ant, stretch: 1 + 0.03 * ant - 0.03 * dn, neck: lerp(5, -2, dn), front: "L",
        handL: [lerp(lerp(-0.1, 0.16, upG), -0.06, dn), lerp(lerp(0.9, 1.41, upG), 0.8, dn)], handR: [lerp(lerp(0.3, 0.52, upG), 0.34, dn), lerp(lerp(0.7, 1.46, upG), 0.66, dn)],
        sweat: dn > 0.5 ? t : undefined, lookAt: dn < 0.5 ? [940, HORIZON] : undefined,
        face: mixFace({ ...FACES.neutral, eye: 0.3, smile: 0.7, browY: [0.6, -0.2] }, { ...FACES.worried, eye: 1.15 }, dn) };
      const ex = lerp(x + (0.72 + 0.02 * find) * k, x + 0.5 * k, dn), ey = lerp(GROUND - (1.5 + 0.03 * find) * k, GROUND - 0.52 * k, dn);
      const stx = lerp(925, 962, t / T), hr = lerp(2.1, 4, tw(t, cn, Math.max(8, four - cn), EASE.inOut));
      const steamer = ship(stx, HORIZON + 6 - 0.045 * 250, 250, 1) as NodeDraw;
      const smoke = [0, 1, 2, 3].map((i) => { const tt = (t * 1.2 + i * 16) % 64; return <circle key={i} cx={stx - 150 - tt * 1.4} cy={HORIZON - 64 - tt * 1.1} r={9 + tt * 0.35} fill="#c9ccd4" opacity={0.7 * (1 - tt / 64)} />; });
      return [{ t: "cam", z: lerp(1, 1.05, EASE.soft(t / T)), cx: 480, cy: 850, px: lerp(12, -8, tw(t, cn - 4, 24)) }, SEA_HI, stars(t),
        sea(HORIZON, t, [{ x: stx - 120, y: 6, el: (dy) => <g transform={`translate(0 ${dy * 0.3})`}>{smoke}{steamer.el}</g> }]),
        ...(t >= cn ? [clock(790, 520, 0.72, hr, EASE.back(c01((t - cn) / 9)))] : []),
        { t: "fig", who: "sir", c: C.sir, p, hold: { L: scopeHold(ex, ey) } }, rail(1470),
        ...(t >= four - 3 ? [{ t: "tag", text: "RESCUE: 4 IN THE MORNING", y: 1462, age: t - four + 3 } as Draw] : [])];
    },
  },
  { // about 1,500 of us are still on board: a crowd, no two alike, on the tipping deck behind him
    name: "left", from: S.left, to: S.cliff,
    draw: (t, T) => {
      const k = 560, x = 560, n = at("left", "1,500") - S.left - 2, turnBack = tw(t, n - 6, 14), back2 = tw(t, n + 22, 12);
      const p: Pose = { x, y: GROUND, k, turn: lerp(lerp(0.1, -0.55, turnBack), 0.1, back2), lean: 4 + 1.2 * Math.sin(t * 0.1), stretch: 1 - 0.03 * Math.sin(Math.PI * c01((t - n + 6) / 14)), neck: lerp(lerp(0, -6, turnBack), 0, back2), headTilt: 2 * Math.sin(t * 0.13),
        handL: [-0.36, 0.84], handR: [lerp(0.34, 0.1, turnBack * (1 - back2)), lerp(0.68, 1.0, turnBack * (1 - back2))], lookAt: turnBack > 0.5 && back2 < 0.5 ? [150, 1150] : undefined, sweat: t,
        face: mixFace({ ...FACES.worried, eye: 1.15 }, { ...FACES.shock, eye: 1.15, open: 0.5 }, turnBack * (1 - back2)) };
      const crowd = [...Array.from({ length: 10 }, (_, i) => ({ px: 70 + i * 104 + 18 * rnd(i + 3), py: 1250 + 16 * rnd(i + 7), sc: 2.2 + 0.5 * rnd(i + 20), id: i + 1 })), ...Array.from({ length: 8 }, (_, i) => ({ px: 118 + i * 120 + 22 * rnd(i + 40), py: 1338 + 18 * rnd(i + 31), sc: 2.6 + 0.6 * rnd(i + 60), id: i + 21 }))];
      return [{ t: "cam", z: lerp(1, 1.025, EASE.soft(t / T)), cx: 540, cy: 1100, rot: -6, py: lerp(-12, -3, EASE.soft(t / T)), px: lerp(-10, 8, EASE.soft(t / T)) }, bg("deck", 1.34, 0, 0),
        node("the crowd on deck", [40, 1040, 1000, 320], <g>{crowd.map((c, j) => folk(j, c.px, c.py, c.sc, c.id, t, c.px < 540 ? 0.5 : -0.5))}</g>, "bg"),
        { t: "fig", who: "sir", c: C.sir, p, hold: { L: caneHold } },
        ...(t >= n ? [board("1,500 on board", "1,500", "STILL ON BOARD", t - n)] : [])];
    },
  },
  { // and the sea has reached my shoes: it comes up the tipping deck, level; he looks down and hops
    name: "cliff", from: S.cliff, to: TITANIC2_TOTAL,
    draw: (t, T) => {
      const k = 560, x = 520, rot = lerp(-6, -9.5, EASE.inOut(c01(t / 60))), sea0 = at("cliff", "sea") - S.cliff, up = tw(t, sea0, 36, EASE.out), sh = at("cliff", "shoes") - S.cliff;
      const ant = Math.sin(Math.PI * c01((t - sh + 6) / 7)), hop = EASE.back(c01((t - sh) / 9)), paddle = t > sh ? Math.abs(Math.sin((t - sh) * 0.33)) : 0, wob = Math.sin(t * 0.6) * 0.05, q = t - sea0 - 16, shake = q >= 0 ? Math.sin(q * 2.2) * 9 * Math.exp(-q / 10) : 0;
      const p: Pose = { x, y: GROUND, k, turn: 0.15, lean: 7 - 3 * hop, bob: -0.05 * ant + 0.03 * hop, stretch: 1 - 0.06 * ant + 0.06 * Math.sin(Math.PI * c01((t - sh) / 9)), neck: lerp(10, 4, hop),
        handL: [-0.4 - wob, lerp(0.8, 1.26, hop)], handR: [0.42 + wob, lerp(0.66, 1.3, hop)], footL: [-0.14, 0.05 * paddle * (t % 20 < 10 ? 1 : 0)], footR: [0.18, 0.2 * hop * (0.5 + 0.5 * paddle)], hatLift: 0.09 * Math.sin(Math.PI * c01((t - sh) / 14)) + 0.02 * hop,
        lookAt: [x + 70, GROUND + 60], shock: t >= sh - 2 ? t - sh + 2 : undefined, sweat: t,
        face: mixFace({ ...FACES.worried, eye: 1.2 }, { ...FACES.shock, eye: 1.3 }, tw(t, sea0 + 6, 9)) };
      const lvl = lerp(1980, 1548, up);
      const drops = t < sh ? [] : [0, 1, 2, 3, 4, 5].map((i) => { const a = (t - sh + i * 5) % 22, dir = i % 2 ? 1 : -1; return <path key={i} d="M0 -9 Q7 0 0 7 Q-7 0 0 -9 Z" transform={`translate(${x + 100 + dir * (30 + a * (3 + i))} ${lvl - 10 - a * 9 + 0.5 * a * a}) scale(${1.5 - a / 30})`} fill="#bfe3f7" stroke={INK} strokeWidth={3} opacity={a > 16 ? (22 - a) / 6 : 1} />; });
      return [{ t: "cam", z: lerp(1.02, 1.07, EASE.soft(t / T)), cx: 540 + shake, cy: 1100 + shake * 0.5, rot }, bg("deck", 1.4, 0, 0),
        levelSea(lvl - 46, t * 0.17 + 2, 540, 1100, rot, "bg", "#1f5680", 0.9, "the sea, behind him"),
        { t: "fig", who: "sir", c: C.sir, p },
        levelSea(lvl, t * 0.22, 540, 1100, rot, "fg", "#2f6f9e", 0.88, "the sea on the deck"), node("splashes", [300, 1300, 500, 300], <g transform={`rotate(${-rot} 540 1100)`}>{drops}</g>, "fg"),
        ...(t >= sh + 16 ? [{ t: "tag", text: "TO BE CONTINUED", sub: "Part 3: the water", y: 1462, age: t - sh - 16 } as Draw] : [])];
    },
  },
];

/** thumbnail picture (everything in it is in the film): the boat rowing away behind Sir Digsworth at the rail */
export const TITANIC2_THUMB: Scene = {
  name: "thumb", from: 0, to: 1, closeup: true,
  draw: () => {
    const k = 760;
    const p: Pose = { x: 360, y: 1300 + 1.42 * k, k, turn: 0.3, lean: -3, front: "R", handL: [-0.5, 1.0], handR: [0.36, 1.74], hatLift: 0.05, shock: 9, sweat: 6, still: true, face: { ...FACES.shock, lookX: 0.5, lookY: 0.4, eye: 1.4 } };
    return [{ t: "cam", z: 1, cx: 540, cy: 900 }, SEA_HI, stars(12), sea(HORIZON, 12, [boatFloat(1, 800, 74, 1.0, 12)]), { t: "fig", who: "sir", c: C.sir, p, close: true }, rail(1650)];
  },
};

export const TITANIC2: Film = {
  scenes: SCENES, caps: CAPS, cast: C, audio: "titanic/mix-2.wav", bgDir: "titanic", total: TITANIC2_TOTAL,
  hook: [{ text: "THAT LIFEBOAT", from: 0, size: 84, color: "#ffffff" }, { text: "IS LEAVING.", from: 0, size: 84, color: "#ffffff" }, { text: "I'M NOT IN IT.", from: at("hook", "And") - 1, size: 84, color: "#ffe14d" }],
};
