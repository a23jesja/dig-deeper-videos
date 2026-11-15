// "I Survived the Titanic: Part 2" (Short, 2D): the lifeboats. Only facts already checked against two source
// families are spoken (FACTS-titanic.md); Sir Digsworth's own part is dramatised and the film says so.
// Same cast, backgrounds and drawings as Part 1 (KIT in titanic1.tsx); checked by check.ts before rendering.
import React from "react";
import { FACES, INK, mixFace, Pose } from "./fig";
import { Draw, Film, FPS, GROUND, H, Scene, W } from "./scenes";
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
const { C, cam, bg, node, iceberg, chunk, rail, cane, board, ship, lifeboat, boats20, o, lerp, ease, back, blink, FONT, K } = KIT;
type NodeDraw = Extract<Draw, { t: "node" }>;
/** the sea background pushed up so the horizon sits at y = 950, clear of the captions */
const SEA_HI: Draw = bg("sea", 1.6, 0, -533);
const HORIZON = 950;

// ---------------------------------------------------------------- props
const COATS = ["#8a4680", "#5a84c4", "#e2b23c", "#3b4352", "#b0302a", "#5c8b3a"];
const HATS = ["#5a3566", undefined, "#b0302a", "#1b1b22", undefined, "#8f6d42"];
/** a small passenger: base centre (px, py), `sc` px per unit; mood < 0 = worried */
const person = (key: number, px: number, py: number, sc: number, col: string, hat?: string, mood = -1): React.ReactNode => (
  <g key={key} transform={`translate(${px} ${py - 46 * sc}) scale(${sc})`}>
    <path d="M-20 46 Q0 -6 20 46 Z" fill={col} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
    <circle cx={0} cy={-14} r={18} fill="#fdfbf5" stroke={INK} strokeWidth={4.5} />
    <circle cx={-6} cy={-16} r={2.6} fill={INK} /><circle cx={6} cy={-16} r={2.6} fill={INK} />
    <path d={mood < 0 ? "M-7 -5 Q0 -10 7 -5" : "M-7 -7 Q0 -2 7 -7"} stroke={INK} strokeWidth={2.4} fill="none" strokeLinecap="round" />
    {hat && <path d="M-20 -24 Q0 -46 20 -24 Z" fill={hat} stroke={INK} strokeWidth={4} strokeLinejoin="round" />}
  </g>);
/** a lifeboat on its falls, from the side, with passengers at `seats` (-1..1 along the boat); gunwale centre (x, y) */
const boatFull = (x: number, y: number, s: number, sw: number, seats: number[], layer: "bg" | "mid" = "mid"): Draw => node("lifeboat with people", [x - 220 * s, y - 250 * s, 440 * s, 400 * s], (
  <g transform={`rotate(${sw} ${x} ${y - 900})`}>
    <path d={`M${x - 160 * s} ${y - 1700} L${x - 160 * s} ${y + 10} M${x + 160 * s} ${y - 1700} L${x + 160 * s} ${y + 10}`} stroke={INK} strokeWidth={9} />
    {seats.map((q, i) => person(i, x + q * 150 * s, y + 24 * s, 2.1 * s, COATS[i % 6], HATS[i % 6]))}
    <path d={`M${x - 215 * s} ${y} Q${x} ${y + 150 * s} ${x + 215 * s} ${y} Z`} fill="#f1efe8" {...o(9)} />
    <path d={`M${x - 215 * s} ${y} L${x + 215 * s} ${y}`} stroke={INK} strokeWidth={14} strokeLinecap="round" /><path d={`M${x - 215 * s} ${y} L${x + 215 * s} ${y}`} stroke="#8a5a32" strokeWidth={7} strokeLinecap="round" />
    <path d={`M${x - 150 * s} ${y + 44 * s} Q${x} ${y + 82 * s} ${x + 150 * s} ${y + 44 * s}`} fill="none" stroke="#b9c1cf" strokeWidth={7} strokeLinecap="round" />
  </g>), layer);
/** a lifeboat rowing on the sea: centre of the waterline (x, y) */
const rowboat = (key: number, x: number, y: number, sc: number, ph: number): React.ReactNode => {
  const sw = Math.sin(ph), oar = (ox: number) => (<g>
    <path d={`M${ox} -10 L${ox + 70 * sw} 62`} stroke={INK} strokeWidth={13} strokeLinecap="round" /><path d={`M${ox} -10 L${ox + 70 * sw} 62`} stroke="#b98a52" strokeWidth={6} strokeLinecap="round" />
    <ellipse cx={ox + 76 * sw} cy={68} rx={16} ry={9} fill="#b98a52" stroke={INK} strokeWidth={4} />
  </g>);
  return (<g key={key} transform={`translate(${x} ${y + 3 * Math.sin(ph * 0.5 + key)}) scale(${sc})`}>
    {[-96, -32, 32, 96].map((px, i) => person(i, px, 26, 1.45, COATS[(i + key * 2) % 6], HATS[(i + key) % 6]))}
    <path d="M-150 0 Q-128 62 0 62 Q128 62 150 0 Z" fill="#f1efe8" {...o(7)} />
    <path d="M-152 0 L152 0" stroke={INK} strokeWidth={14} strokeLinecap="round" /><path d="M-152 0 L152 0" stroke="#8a5a32" strokeWidth={7} strokeLinecap="round" />
    {oar(-60)}{oar(60)}
    <path d={`M-190 64 Q-100 ${54 + 6 * sw} 0 66 T190 62`} fill="none" stroke="#9fd0ee" strokeWidth={6} strokeLinecap="round" opacity={0.7} />
  </g>);
};
/** the liner going down by the bow: drawn like ship(), tipped by `tilt` degrees and cut off at the waterline */
const sinking = (x: number, L: number, tilt: number, name = "the liner, bow down"): Draw => {
  const sh = ship(x, HORIZON - 12, L) as NodeDraw, px = x - L * 0.72, id = `wl${Math.round(x)}`;
  const foam = [0, 1, 2, 3].map((i) => <path key={i} d={`M${x - L * 0.5 + i * L * 0.16} ${HORIZON + 8} q${L * 0.03} -12 ${L * 0.06} 0 t${L * 0.06} 0`} fill="none" stroke="#dff1fb" strokeWidth={6} strokeLinecap="round" opacity={0.85} />);
  return node(name, [x - L, HORIZON - L * 0.42, L, L * 0.5], (<g>
    <clipPath id={id}><rect x={-200} y={-200} width={W + 400} height={HORIZON + 208} /></clipPath>
    <g clipPath={`url(#${id})`}><g transform={`rotate(${tilt} ${px} ${HORIZON})`}>{sh.el}</g></g>
    {foam}
  </g>));
};
const clock = (cx: number, cy: number, s: number, hr: number): Draw => node("clock at four", [cx - 240 * s, cy - 240 * s, 480 * s, 480 * s], (
  <g transform={`translate(${cx} ${cy}) scale(${s}) translate(-540 -640)`}>
    <circle cx={540} cy={640} r={232} fill="#f6efdc" {...o(12)} /><circle cx={540} cy={640} r={204} fill="none" stroke="#8a5a32" strokeWidth={6} />
    {Array.from({ length: 12 }, (_, i) => <path key={i} d="M540 452 L540 482" transform={`rotate(${i * 30} 540 640)`} stroke={INK} strokeWidth={i % 3 ? 7 : 13} strokeLinecap="round" />)}
    <text x={634} y={742} textAnchor="middle" fontFamily={FONT} fontSize={64} fill="#b0302a">4</text>
    <path d="M540 640 L540 478" stroke={INK} strokeWidth={11} strokeLinecap="round" transform={`rotate(${(hr * 360) % 360} 540 640)`} />
    <path d="M540 640 L540 530" stroke={INK} strokeWidth={18} strokeLinecap="round" transform={`rotate(${(hr / 12) * 360} 540 640)`} />
    <circle cx={540} cy={640} r={16} fill="#b0302a" {...o(6)} />
  </g>), "mid", true);
const suitcase = (x: number, y: number, rot: number): Draw => node("sliding suitcase", [x - 80, y - 110, 160, 110], (
  <g transform={`rotate(${rot} ${x} ${y})`}>
    <path d={`M${x - 26} ${y - 96} q0 -26 26 -26 q26 0 26 26`} fill="none" stroke={INK} strokeWidth={11} strokeLinecap="round" />
    <rect x={x - 78} y={y - 98} width={156} height={96} rx={10} fill="#8a5a32" {...o(8)} />
    <path d={`M${x - 40} ${y - 98} L${x - 40} ${y - 2} M${x + 40} ${y - 98} L${x + 40} ${y - 2}`} stroke="#5a3a20" strokeWidth={12} />
    <rect x={x - 12} y={y - 64} width={24} height={20} rx={4} fill="#f0bd3c" {...o(5)} />
  </g>));
/** the empty falls: ropes and blocks swinging where the boats hung */
const falls = (t: number): Draw => node("empty falls", [340, 0, 600, 560], (<g>{[370, 500, 790, 920].map((x, i) => {
  const a = 4.5 * Math.sin(t * 0.09 + i * 1.3);
  return (<g key={x} transform={`rotate(${a} ${x} -200)`}>
    <path d={`M${x} -200 L${x} 350`} stroke={INK} strokeWidth={9} />
    <rect x={x - 21} y={340} width={42} height={58} rx={9} fill="#8a5a32" {...o(7)} /><circle cx={x} cy={369} r={9} fill="#f0bd3c" stroke={INK} strokeWidth={4} />
    <path d={`M${x} 398 q0 36 22 36 q20 0 20 -20`} fill="none" stroke={INK} strokeWidth={10} strokeLinecap="round" />
  </g>);
})}</g>), "bg");
const scope = (x0: number, y0: number, x1: number, y1: number): Draw => {
  const mx = lerp(x0, x1, 0.5), my = lerp(y0, y1, 0.5);
  return node("telescope", [Math.min(x0, x1) - 30, Math.min(y0, y1) - 30, Math.abs(x1 - x0) + 60, Math.abs(y1 - y0) + 60], (<g>
    <path d={`M${x0} ${y0} L${x1} ${y1}`} stroke={INK} strokeWidth={46} strokeLinecap="round" /><path d={`M${x0} ${y0} L${mx} ${my}`} stroke="#b98a52" strokeWidth={30} strokeLinecap="round" />
    <path d={`M${mx} ${my} L${x1} ${y1}`} stroke={INK} strokeWidth={60} strokeLinecap="round" /><path d={`M${mx} ${my} L${x1} ${y1}`} stroke="#e2a92c" strokeWidth={44} strokeLinecap="round" />
    <path d={`M${mx} ${my - 20} L${mx} ${my + 20}`} stroke={INK} strokeWidth={8} transform={`rotate(${(Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI} ${mx} ${my})`} />
  </g>));
};
/** water that stays level on the screen while the camera tips with the deck (cx, cy, rot = the camera's) */
const levelSea = (y: number, ph: number, cx: number, cy: number, rot: number): Draw => {
  let d = `M-500 ${H + 500} L-500 ${y}`;
  for (let x = -500; x <= W + 500; x += 40) d += ` L${x} ${(y + 12 * Math.sin(x * 0.012 + ph) + 6 * Math.sin(x * 0.031 - ph * 1.7)).toFixed(1)}`;
  return node("the sea on the deck", [0, y, W, H - y], (<g transform={`rotate(${-rot} ${cx} ${cy})`}>
    <path d={`${d} L${W + 500} ${H + 500} Z`} fill="#2f6f9e" opacity={0.88} {...o(8)} />
    <path d={`M-300 ${y + 58} Q270 ${y + 38 + 10 * Math.sin(ph)} 540 ${y + 60} T1400 ${y + 56}`} fill="none" stroke="#9fd0ee" strokeWidth={8} strokeLinecap="round" opacity={0.8} />
  </g>), "fg");
};

// ---------------------------------------------------------------- scenes
const S = { hook: 0, truth: at("truth") - 1, recap: at("recap") - 1, sink: at("recap", "She") - 2, order: at("order") - 1, child: at("child") - 1, seats: at("seats") - 1, gone: at("gone") - 1, none: at("gone", "Then") - 2, help: at("help") - 1, left: at("left") - 1, cliff: at("cliff") - 1 };
export const TITANIC2_CUTS = S;
const SCENES: Scene[] = [
  { // a lifeboat full of people goes down past the rail; Sir Digsworth is left on deck
    name: "hook", from: S.hook, to: S.truth, captions: false, closeup: true,
    draw: (t, T) => {
      const k = 800, e = t / T, tn = ease((t - 46) / 10);
      const p: Pose = { x: 330, y: 900 + 1.42 * k, k, turn: lerp(0.85, 0.3, tn), lean: -3 + 2 * Math.sin(t * 0.2), handL: [-0.3, 0.7], handR: [0.3, lerp(1.45, 1.84, ease(t / 8)) + 0.03 * Math.sin(t * 0.6)], hatLift: 0.03 * Math.abs(Math.sin(t * 0.5)),
        face: { ...FACES.shock, lookX: lerp(0.9, 0.2, tn), lookY: lerp(0.6, -0.4, e), eye: 1.3 } };
      return [{ t: "cam", z: 1.03, cx: 540, cy: 900 }, bg("sea", 1.06, 0, -40), boatFull(812, lerp(520, 1000, e), 1.1, 1.4 * Math.sin(t * 0.16), [-0.72, -0.24, 0.24, 0.72]), { t: "fig", who: "sir", c: C.sir, p, close: true }, rail(1470)];
    },
  },
  { // my part is made up; everything around me is true. The deck is already tipping.
    name: "truth", from: S.truth, to: S.recap,
    draw: (t, T) => {
      const k = 600, x = 580, sl = ease(t / T);
      const p: Pose = { x, y: GROUND, k, turn: 0.1 * Math.sin(t * 0.05), lean: 3, bob: -0.004 * Math.sin(t * 0.12), handL: [-0.36, 0.84], handR: [0.3 + 0.03 * Math.sin(t * 0.25), 0.95 + 0.04 * Math.sin(t * 0.25)], headTilt: 2 * Math.sin(t * 0.09),
        face: mixFace({ ...FACES.neutral, eye: blink(t, 2), browY: [0.2, 0.8], smile: 0.2 }, { ...FACES.worried, eye: 1, lookX: -0.6, lookY: -0.5 }, ease((t - (at("truth", "Everything") - S.truth)) / 8)) };
      return [{ t: "cam", z: lerp(1, 1.03, sl), cx: 560, cy: 1000, rot: -3.5 }, bg("deck", 1.24, 0, 0), suitcase(lerp(960, 250, sl), GROUND + 6, -6 * Math.sin(t * 0.3)), cane(x - 0.36 * k, GROUND - 0.84 * k, GROUND), { t: "fig", who: "sir", c: C.sir, p },
        ...(t > 40 ? [{ t: "tag", text: "THE EVENTS ARE TRUE", sub: "my part is dramatised", y: 1462, age: t - 40 } as Draw] : [])];
    },
  },
  { // the Titanic has struck an iceberg
    name: "recap", from: S.recap, to: S.sink, closeup: true,
    draw: (t, T) => {
      const sh = Math.sin(t * 2.3) * 13 * Math.exp(-t / 10);
      const bits = [0, 1, 2, 3].map((i) => { const tt = (t * 1.1 + i * 19) % 60, x = 840 + i * 26 - tt * 2.4, y = 640 + tt * 4 + 0.09 * tt * tt; return y < 930 ? <g key={i}>{chunk(x, y, 0.55 + 0.15 * (i % 3), tt * 9 + i * 40)}</g> : null; });
      return [{ t: "cam", z: lerp(1.0, 1.04, ease(t / T)), cx: 700 + sh, cy: 850 }, SEA_HI, iceberg(915, HORIZON + 62, 330, "mid"), ship(800, HORIZON - 8 + sh * 0.3, 760), node("falling ice", [600, 560, 300, 400], <g>{bits}</g>),
        { t: "tag", text: "11:40 P.M. · 14 APRIL 1912", y: 317, age: t - 3 }];
    },
  },
  { // she is sinking by the bow
    name: "sink", from: S.sink, to: S.order, closeup: true,
    draw: (t, T) => {
      const tilt = lerp(2.5, 9.5, ease(t / T)), bw = at("recap", "bow") - S.sink - 3;
      return [cam(t, T, 1.03, 620, 880), SEA_HI, sinking(900, 800, tilt), ...(t >= bw ? [{ t: "tag", text: "SINKING BY THE BOW", y: 1462, age: t - bw } as Draw] : [])];
    },
  },
  { // the order is women and children first. So I stay.
    name: "order", from: S.order, to: S.child,
    draw: (t, T) => {
      const call = 0.4 + 0.4 * Math.abs(Math.sin(t * 0.7)), so = at("order", "So") - S.order, st = ease((t - so) / 9), wm = at("order", "women") - S.order - 3;
      const off: Pose = { x: 770, y: GROUND, k: K, turn: -0.6, lean: -3, handL: [-0.62, 1.16 + 0.02 * Math.sin(t * 0.5)], handR: [0.1, 1.3], face: { ...FACES.stern, open: call * (1 - st), lookX: -0.7 } };
      const sir: Pose = { x: lerp(345, 310, st), y: GROUND, k: K, turn: lerp(0.55, 0.15, st), lean: lerp(4, -2, st), handL: [-0.34, 0.84], handR: [lerp(0.34, 0.22, st), lerp(0.9, 1.5, st)], hatLift: 0.07 * st * (1 - ease((t - so - 22) / 8)), headTilt: 5 * st,
        face: mixFace({ ...FACES.worried, lookX: 0.7, eye: 1.15 * blink(t, 6) }, { ...FACES.stern, lookX: 0.1, smile: 0.1 }, st) };
      return [cam(t, T, 1.015, 540, 800), bg("deck", 1.06, 0, 0), lifeboat(800, 548, 2 * Math.sin(t * 0.1)), cane(sir.x - 0.34 * K, GROUND - 0.84 * K, GROUND), { t: "fig", who: "sir", c: C.sir, p: sir }, { t: "fig", who: "officer", c: C.officer, p: off },
        ...(t >= wm ? [{ t: "tag", text: "WOMEN AND CHILDREN FIRST", y: 1462, age: t - wm } as Draw] : [])];
    },
  },
  { // a little girl is alone. I lift her into a boat.
    name: "child", from: S.child, to: S.seats,
    draw: (t, T) => {
      const k = 560, x = 400, ck = 330, lift = at("child", "lift") - S.child - 2, u = ease((t - lift) / 20), bx = 800, by = 800;
      const cx = lerp(650, bx - 40, u), cy = lerp(GROUND, by + 112, u) - 150 * Math.sin(Math.PI * u), sw = 1.6 * Math.sin(t * 0.12) + 2.5 * u * Math.sin((t - lift) * 0.35) * Math.exp(-Math.max(0, t - lift - 20) / 14);
      const hand = (px: number, py: number): [number, number] => [(px - x) / k, (GROUND - py) / k];
      const grab = ease((t - lift + 8) / 8), wave = ease((t - lift - 24) / 8);
      const sir: Pose = { x, y: GROUND, k, turn: 0.55, lean: lerp(lerp(2, 9, grab), -3, u), stretch: 1 + 0.04 * u,
        handR: wave > 0 ? [lerp(hand(cx, cy - 0.5 * ck)[0], 0.34, wave), lerp(hand(cx, cy - 0.5 * ck)[1], 1.42 + 0.04 * Math.sin(t * 0.9), wave)] : grab > 0 ? [lerp(0.32, hand(cx + 30, cy - 0.5 * ck)[0], grab), lerp(0.7, hand(cx + 30, cy - 0.5 * ck)[1], grab)] : [0.32, 0.7],
        handL: wave > 0 ? [lerp(0.2, -0.3, wave), lerp(1.2, 0.7, wave)] : grab > 0 ? [lerp(-0.3, hand(cx - 50, cy - 0.5 * ck)[0], grab), lerp(0.66, hand(cx - 50, cy - 0.5 * ck)[1], grab)] : [-0.3, 0.66],
        face: mixFace({ ...FACES.worried, lookX: 0.8, lookY: -0.8 }, { ...FACES.neutral, smile: 1.1, lookX: 0.8, lookY: 0.5, browY: [0.6, 0.6] }, u) };
      const girl: Pose = { x: cx, y: cy, k: ck, turn: lerp(0.5 * Math.sin(t * 0.22), -0.4, u), bob: 0.012 * Math.abs(Math.sin(t * 0.4)) * (1 - u), handL: [-0.22, lerp(0.56, 0.95, u)], handR: [0.22, lerp(0.56, 0.95, u)],
        face: mixFace({ ...FACES.worried, lookX: Math.sin(t * 0.22), lookY: 0.4, eye: 1.2 }, { ...FACES.neutral, smile: 1.2, lookX: -0.6, eye: 1.1 }, ease((t - lift - 14) / 8)) };
      return [cam(t, T, 1.02, 600, 850), bg("deck", 1.06, 0, 0), { t: "fig", who: "sir", c: C.sir, p: sir }, { t: "fig", who: "child", c: C.child, p: girl, free: true }, boatFull(bx, by, 1, sw, [0.3, 0.74])
      ];
    },
  },
  { // the boats have room for 1,178 people. Only about 700 will be saved.
    name: "seats", from: S.seats, to: S.gone, closeup: true,
    draw: (t, T) => {
      const n1 = at("seats", "1,178") - S.seats, n7 = at("seats", "700") - S.seats, x0 = 100, w = 880, by = 1016, bh = 132, part = ease((t - n7) / 26) * (700 / 1178);
      return [cam(t, T, 1.015, 540, 760), bg("deck", 1.5, 260, -420), boats20(t, 3, n1 - 2, 150, 372, 195, 92, 0.95),
        node("1,178 seats, about 700 saved", [x0 - 10, 770, w + 20, 390], (<g>
          {t >= n1 - 2 && <g transform={`translate(540 880) scale(${back((t - n1 + 2) / 7)}) translate(-540 -880)`}>
            <text x={540} y={948} textAnchor="middle" fontFamily={FONT} fontSize={176} fill="#ffe14d" stroke={INK} strokeWidth={28} paintOrder="stroke" strokeLinejoin="round">1,178<tspan fontSize={78} fill="#ffffff" dx={22}>SEATS</tspan></text>
          </g>}
          {t >= n1 - 2 && <g>
            <rect x={x0} y={by} width={w} height={bh} rx={18} fill="#16335a" {...o(10)} />
            {part > 0.005 && <rect x={x0 + 7} y={by + 7} width={(w - 14) * part} height={bh - 14} rx={12} fill="#7fd08a" />}
            {t >= n7 + 14 && <text x={x0 + 30} y={by + 92} fontFamily={FONT} fontSize={66} fill={INK}>ABOUT 700</text>}
            {t >= n7 + 26 && <text x={x0 + w - 28} y={by + 88} textAnchor="end" fontFamily={FONT} fontSize={50} fill="#9fb4d6">EMPTY</text>}
          </g>}
        </g>), "mid", true),
        ...(t >= n7 ? [{ t: "tag", text: "ONLY ABOUT 700 SAVED", y: 1462, age: t - n7 } as Draw] : [])];
    },
  },
  { // one by one, the boats pull away
    name: "gone", from: S.gone, to: S.none, closeup: true,
    draw: (t, T) => {
      const starts = [-20, at("gone", "one", 1) - S.gone - 16, at("gone", "boats") - S.gone - 12];
      const boats = starts.map((s0, i) => { const a = t - s0; if (a < 0) return null; const e = a / 80; return rowboat(i, lerp(560, 150 + i * 190, ease(e * 0.9)) - a * 0.8, HORIZON + 60 + i * 50 + a * 0.35, 0.62 + 0.1 * i + 0.002 * a, a * 0.33 + i); });
      return [cam(t, T, 1.03, 480, 900), SEA_HI, sinking(1190, 860, 8.5, "the liner behind them"), node("lifeboats rowing away", [60, HORIZON + 10, 800, 240], <g>{boats}</g>)];
    },
  },
  { // then there are none left: the falls hang empty
    name: "none", from: S.none, to: S.help,
    draw: (t, T) => {
      const k = 560, x = 640, nn = at("gone", "none") - S.none - 3, lk = Math.sin(t * 0.11);
      const p: Pose = { x, y: GROUND, k, turn: 0.4 * lk, lean: 2, handL: [-0.36, 0.84], handR: [0.32, 0.66], headTilt: -6 + 3 * lk, face: { ...FACES.worried, lookX: 0.7 * lk, lookY: 0.9, eye: 1.15 * blink(t, 3) } };
      return [{ t: "cam", z: lerp(1, 1.02, ease(t / T)), cx: 600, cy: 1000, rot: -4.5 }, bg("deck", 1.27, 0, 0), falls(t), cane(x - 0.36 * k, GROUND - 0.84 * k, GROUND), { t: "fig", who: "sir", c: C.sir, p },
        ...(t >= nn ? [{ t: "tag", text: "NO BOATS LEFT", y: 1462, age: t - nn } as Draw] : [])];
    },
  },
  { // a rescue ship is coming; it cannot be here before four in the morning
    name: "help", from: S.help, to: S.left,
    draw: (t, T) => {
      const k = 560, x = 330, cn = at("help", "cannot") - S.help, four = at("help", "four") - S.help, dn = ease((t - cn - 4) / 9);
      const p: Pose = { x, y: GROUND, k, turn: lerp(0.8, 0.25, dn), lean: lerp(3, 0, dn), handR: [lerp(0.42, 0.34, dn), lerp(1.4, 0.92, dn)], handL: [lerp(0.16, 0.1, dn), lerp(1.36, 0.86, dn)],
        face: mixFace({ ...FACES.neutral, eye: 0.3, lookX: 1, smile: 0.6 }, { ...FACES.worried, lookX: 0.3, eye: 1.15 }, dn) };
      const sx = lerp(x + 0.12 * k, x + 0.06 * k, dn), sy = lerp(GROUND - 1.45 * k, GROUND - 0.84 * k, dn), ex = lerp(x + 0.74 * k, x + 0.62 * k, dn), ey = lerp(GROUND - 1.5 * k, GROUND - 0.98 * k, dn);
      const stx = lerp(930, 965, t / T), hr = lerp(2.1, 4, ease((t - cn) / Math.max(8, four - cn)));
      const smoke = [0, 1, 2, 3].map((i) => { const tt = (t * 1.2 + i * 16) % 64; return <circle key={i} cx={stx - 150 - tt * 1.4} cy={HORIZON - 70 - tt * 1.1} r={9 + tt * 0.35} fill="#c9ccd4" opacity={0.7 * (1 - tt / 64)} />; });
      return [cam(t, T, 1.02, 540, 850), SEA_HI, node("smoke", [600, 780, 400, 160], <g>{smoke}</g>), ship(stx, HORIZON - 6 + 2 * Math.sin(t * 0.15), 250, 1),
        ...(t >= cn ? [clock(790, 530, 0.72, hr)] : []),
        { t: "fig", who: "sir", c: C.sir, p }, scope(sx, sy, ex, ey), { t: "fig", who: "sir", c: C.sir, p, part: "hands" }, rail(1470),
        ...(t >= four - 3 ? [{ t: "tag", text: "RESCUE: 4 IN THE MORNING", y: 1462, age: t - four + 3 } as Draw] : [])];
    },
  },
  { // about 1,500 of us are still on board
    name: "left", from: S.left, to: S.cliff,
    draw: (t, T) => {
      const k = 560, x = 560, n = at("left", "1,500") - S.left - 2, sway = Math.sin(t * 0.13);
      const p: Pose = { x, y: GROUND, k, turn: 0.3 * sway, lean: 4, handL: [-0.36, 0.84], handR: [0.34, 0.7 + 0.03 * sway], headTilt: 2 * sway, face: { ...FACES.worried, lookX: 0.6 * sway, eye: 1.15 * blink(t, 5) } };
      const crowd = [...Array.from({ length: 9 }, (_, i) => ({ px: 96 + i * 111, py: 1262 + 5 * Math.sin(t * 0.2 + i), sc: 2.5, i })), ...Array.from({ length: 8 }, (_, i) => ({ px: 150 + i * 111, py: 1345 + 6 * Math.sin(t * 0.17 + i * 2), sc: 2.9, i: i + 3 }))];
      return [{ t: "cam", z: lerp(1, 1.03, ease(t / T)), cx: 540, cy: 1100, rot: -6 }, bg("deck", 1.32, 0, 0), node("the crowd on deck", [40, 1040, 1000, 320], <g>{crowd.map((c, j) => person(j, c.px, c.py, c.sc, COATS[c.i % 6], HATS[(c.i * 5) % 6]))}</g>, "bg"),
        cane(x - 0.36 * k, GROUND - 0.84 * k, GROUND), { t: "fig", who: "sir", c: C.sir, p },
        ...(t >= n ? [board("1,500 on board", "1,500", "STILL ON BOARD", t - n)] : [])];
    },
  },
  { // and the sea has reached my shoes
    name: "cliff", from: S.cliff, to: TITANIC2_TOTAL,
    draw: (t, T) => {
      const k = 560, x = 520, rot = lerp(-6, -9.5, ease(t / 60)), sea = at("cliff", "sea") - S.cliff, up = ease((t - sea) / 34), sh = at("cliff", "shoes") - S.cliff, hop = ease((t - sh) / 6), wob = Math.sin(t * 0.6) * 0.05;
      const p: Pose = { x, y: GROUND, k, turn: 0.15, lean: 7, handL: [-0.4 - wob, lerp(0.84, 1.28, hop)], handR: [0.4 + wob, lerp(0.66, 1.32, hop)], footL: [-0.14, 0], footR: [0.18, 0.2 * hop * (0.6 + 0.4 * Math.abs(Math.sin(t * 0.35)))], hatLift: 0.06 * hop, headTilt: 6,
        face: mixFace({ ...FACES.worried, eye: 1.2, lookY: -0.9 }, { ...FACES.shock, lookY: -1, lookX: 0.1 }, ease((t - sea - 6) / 8)) };
      return [{ t: "cam", z: 1.02, cx: 540, cy: 1100, rot }, bg("deck", 1.36, 0, 0), { t: "fig", who: "sir", c: C.sir, p }, levelSea(lerp(1960, 1548, up), t * 0.22, 540, 1100, rot),
        ...(t >= sh + 16 ? [{ t: "tag", text: "TO BE CONTINUED", sub: "Part 3: the water", y: 1462, age: t - sh - 16 } as Draw] : [])];
    },
  },
];

/** thumbnail picture (not in the film as one frame, but everything in it is): the boat going down past Sir Digsworth */
export const TITANIC2_THUMB: Scene = {
  name: "thumb", from: 0, to: 1, closeup: true,
  draw: () => {
    const k = 760;
    const p: Pose = { x: 360, y: 1300 + 1.42 * k, k, turn: 0.3, lean: -3, handL: [-0.5, 1.0], handR: [0.34, 1.78], hatLift: 0.05, face: { ...FACES.shock, lookX: 0.5, lookY: 0.3, eye: 1.4 } };
    return [{ t: "cam", z: 1, cx: 540, cy: 900 }, bg("sea", 1.06, 0, -40), boatFull(770, 960, 1.05, -3, [-0.72, -0.24, 0.24, 0.72]), { t: "fig", who: "sir", c: C.sir, p, close: true }, rail(1650)];
  },
};

export const TITANIC2: Film = {
  scenes: SCENES, caps: CAPS, cast: C, audio: "titanic/mix-2.wav", bgDir: "titanic", total: TITANIC2_TOTAL,
  hook: [{ text: "THAT LIFEBOAT", from: 0, size: 84, color: "#ffffff" }, { text: "IS LEAVING.", from: 0, size: 84, color: "#ffffff" }, { text: "I'M NOT IN IT.", from: at("hook", "And") - 1, size: 84, color: "#ffe14d" }],
};
