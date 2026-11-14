// "I Survived the Titanic: Part 1" (Short, 2D). Sir Digsworth is a passenger on the night of 14 April 1912: the
// events around him are true (voice/titanic-1.json, sources in FACTS-titanic.md), his own part is dramatised and
// the film says so. Scenes as data, like scenes.tsx; checked by check.ts before rendering.
import React from "react";
import { Costume, Face, FACES, INK, mixFace, Pose } from "./fig";
import { CAST, Draw, Film, FPS, GROUND, H, Scene, W } from "./scenes";
import caps from "./captionsTitanic1.json";

type Cap = { text: string; startMs: number; endMs: number; line: string };
const CAPS = caps as Cap[];
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const at = (line: string, word?: string, n = 0) => {
  const L = CAPS.filter((w) => w.line === line);
  return Math.round(((word ? L.filter((w) => norm(w.text) === norm(word))[n] : L[0]).startMs / 1000) * FPS);
};
export const TITANIC1_TOTAL = 1155;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const c01 = (t: number) => Math.min(1, Math.max(0, t));
const ease = (t: number) => { t = c01(t); return t * t * (3 - 2 * t); };
const back = (t: number) => { t = c01(t); const c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const blink = (f: number, seed: number) => { const p = (f + seed * 37) % 96; return p < 4 ? [0.5, 0.05, 0.05, 0.5][p] : 1; };
const FONT = "'Arial Black', 'Segoe UI Black', Impact, sans-serif";
const o = (sw = 7) => ({ stroke: INK, strokeWidth: sw, strokeLinejoin: "round" as const, strokeLinecap: "round" as const });
const K = 530;

const C: Record<string, Costume> = {
  sir: CAST.sir, lady: CAST.lady, gent: CAST.gent,
  lookout: { shape: "jacket", coat: "#34425f", shade: "#1c2538", collar: "#1c2538", buttons: "#c9ccd4", hat: "flat", hatColor: "#232c40", tash: "brush" },
  stoker: { shape: "jacket", coat: "#9aa0a8", shade: "#5c626b", belt: "#3a2a1c", hat: "flat", hatColor: "#4a4036", tash: "walrus", shoe: "#3a2a1c" },
  operator: { shape: "jacket", coat: "#3b4352", shade: "#1f2430", collar: "#f4f1e6", buttons: "#f0bd3c", hat: "guard", hatColor: "#27304a", band: "#111827" },
  child: { shape: "dress", coat: "#e2b23c", shade: "#a87c1e", collar: "#f4f1e6", hat: "beret", hatColor: "#b0302a" },
  officer: { shape: "coat", coat: "#27304a", shade: "#131a2c", collar: "#f4f1e6", buttons: "#f0bd3c", hat: "guard", hatColor: "#f4f1e6", band: "#111827", tash: "brush" },
};

// ---------------------------------------------------------------- props
const cam = (t: number, T: number, z1 = 1.02, cx = 540, cy = 900, rot = 0): Draw => ({ t: "cam", z: lerp(1, z1, ease(t / T)), cx, cy, rot });
const bg = (img: string, zoom = 1.03, ox = 0, oy = 0): Draw => ({ t: "bg", img, zoom, ox, oy });
const node = (name: string, box: [number, number, number, number], el: React.ReactNode, layer: "bg" | "mid" | "fg" = "mid", key = false): Draw => ({ t: "node", name, key, layer, box: { x: box[0], y: box[1], w: box[2], h: box[3] }, el });
/** the iceberg: base centre (x, y), width w */
const iceberg = (x: number, y: number, w: number, layer: "bg" | "mid" = "mid", dark = false): Draw => {
  const h = w * 1.15, P = (a: number, b: number) => `${(x + a * w).toFixed(1)} ${(y - b * h).toFixed(1)}`;
  return node("iceberg", [x - w / 2, y - h, w, h], (<g>
    <path d={`M${P(-0.5, 0)} L${P(-0.42, 0.34)} L${P(-0.26, 0.42)} L${P(-0.18, 0.78)} L${P(-0.02, 1)} L${P(0.12, 0.84)} L${P(0.2, 0.52)} L${P(0.36, 0.44)} L${P(0.5, 0)} Z`} fill={dark ? "#5b6f96" : "#e9f3fb"} {...o(dark ? 6 : 10)} />
    {!dark && <path d={`M${P(-0.02, 1)} L${P(0.03, 0.5)} L${P(-0.12, 0)} L${P(0.5, 0)} L${P(0.36, 0.44)} L${P(0.2, 0.52)} L${P(0.12, 0.84)} Z`} fill="#b9d2ea" />}
    {!dark && <path d={`M${P(-0.26, 0.42)} L${P(-0.12, 0.3)} L${P(-0.2, 0)} M${P(0.03, 0.5)} L${P(0.2, 0.52)}`} fill="none" stroke="#8fb0d2" strokeWidth={7} strokeLinecap="round" />}
    {!dark && <path d={`M${P(-0.5, 0)} L${P(-0.42, 0.34)} L${P(-0.26, 0.42)} L${P(-0.18, 0.78)} L${P(-0.02, 1)} L${P(0.12, 0.84)} L${P(0.2, 0.52)} L${P(0.36, 0.44)} L${P(0.5, 0)} Z`} fill="none" {...o(10)} />}
  </g>), layer);
};
const chunk = (x: number, y: number, s: number, rot: number): React.ReactNode => (<g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}><path d="M-30 14 L-22 -18 L6 -28 L30 -6 L22 22 L-8 28 Z" fill="#e9f3fb" {...o(7)} /><path d="M6 -28 L2 4 L22 22 L30 -6 Z" fill="#b9d2ea" /></g>);
const rail = (y: number): Draw => node("rail", [0, y, W, H - y], (<g>
  <rect x={-20} y={y + 250} width={W + 40} height={H - y} fill="#8a6a44" {...o(9)} />
  {[0, 85, 170].map((dy) => <rect key={dy} x={-20} y={y + dy} width={W + 40} height={22} fill="#f1efe8" {...o(7)} />)}
  {[90, 420, 750, 1080].map((x) => <rect key={x} x={x - 13} y={y} width={26} height={250} fill="#f1efe8" {...o(7)} />)}
  <rect x={-20} y={y - 16} width={W + 40} height={30} rx={8} fill="#8a5a32" {...o(8)} />
</g>), "fg");
const cane = (hx: number, hy: number, gy: number): Draw => node("cane", [hx - 20, hy - 30, 60, gy - hy + 30], (<g><path d={`M${hx} ${hy - 6} L${hx + 22} ${gy - 6}`} stroke={INK} strokeWidth={22} strokeLinecap="round" /><path d={`M${hx} ${hy - 6} L${hx + 22} ${gy - 6}`} stroke="#5a3a20" strokeWidth={10} strokeLinecap="round" /><circle cx={hx} cy={hy - 12} r={20} fill="#f0bd3c" {...o(6)} /></g>));
const board = (name: string, big: string, small: string, age: number, y = 324, color = "#b0302a"): Draw => node(name, [280, y, 520, 236], (
  <g transform={`translate(540 ${y + 118}) scale(${0.95 * back(age / 7)}) rotate(-2) translate(-540 ${-(y + 118)})`}>
    <rect x={270} y={y - 8} width={540} height={250} rx={10} fill="#f6efdc" {...o(10)} />
    <text x={540} y={y + (big.length > 3 ? 136 : 148)} textAnchor="middle" fontFamily={FONT} fontSize={big.length > 3 ? 132 : 170} fill={color}>{big}</text>
    <text x={540} y={y + 218} textAnchor="middle" fontFamily={FONT} fontSize={small.length > 10 ? 52 : 64} fill={INK}>{small}</text>
  </g>), "fg", true);
/** the liner from the side: bow at (x, y) pointing right, length L */
const ship = (x: number, y: number, L: number, funnels = 4): Draw => node("ship", [x - L, y - L * 0.34, L, L * 0.42], (<g>
  <path d={`M${x} ${y - L * 0.075} L${x - L * 0.05} ${y + L * 0.06} L${x - L * 0.97} ${y + L * 0.06} L${x - L} ${y - L * 0.075} Z`} fill="#1b1b22" {...o(8)} />
  <path d={`M${x - L * 0.045} ${y + L * 0.04} L${x - L * 0.05} ${y + L * 0.06} L${x - L * 0.97} ${y + L * 0.06} L${x - L * 0.975} ${y + L * 0.04} Z`} fill="#9a3a2a" />
  <rect x={x - L * 0.86} y={y - L * 0.125} width={L * 0.7} height={L * 0.055} fill="#f1efe8" {...o(7)} />
  {Array.from({ length: funnels }, (_, i) => i + (funnels === 1 ? 1.5 : 0)).map((i) => (<g key={i}><path d={`M${x - L * (0.74 - i * 0.15)} ${y - L * 0.125} l${L * 0.012} ${-L * 0.14} l${L * 0.06} 0 l${L * 0.012} ${L * 0.14} Z`} fill="#d9a55a" {...o(7)} /><path d={`M${x - L * (0.728 - i * 0.15)} ${y - L * 0.265} l${L * 0.06} 0 l${-L * 0.004} ${L * 0.045} l${-L * 0.052} 0 Z`} fill="#1b1b22" /></g>))}
  {Array.from({ length: 22 }, (_, i) => <circle key={i} cx={x - L * (0.1 + i * 0.038)} cy={y - L * 0.02} r={L * 0.007} fill="#ffd97a" />)}
  <path d={`M${x - L * 0.12} ${y - L * 0.075} L${x - L * 0.12} ${y - L * 0.3}`} stroke={INK} strokeWidth={7} />
</g>));
const water = (y: number, ph: number): Draw => {
  let d = `M-20 ${H + 20} L-20 ${y}`;
  for (let x = -20; x <= W + 20; x += 40) d += ` L${x} ${(y + 14 * Math.sin(x * 0.012 + ph) + 6 * Math.sin(x * 0.031 - ph * 1.7)).toFixed(1)}`;
  return node("water", [0, y, W, H - y], (<g><path d={`${d} L${W + 20} ${H + 20} Z`} fill="#2f6f9e" opacity={0.86} {...o(8)} /><path d={`M-20 ${y + 60} Q270 ${y + 40 + 10 * Math.sin(ph)} 540 ${y + 62} T1100 ${y + 58}`} fill="none" stroke="#9fd0ee" strokeWidth={8} strokeLinecap="round" opacity={0.8} /></g>), "fg");
};
/** the hull in section: 16 compartments; `n` of the forward ones flooded, `bad` marks the fifth */
const diagram = (n: number, bad: number, tilt: number, age4: number, age5: number): Draw => {
  const x0 = 110, w = 860, y0 = 420, cw = w / 16;
  return node("compartments", [90, 330, 900, 800], (<g>
    <rect x={90} y={330} width={900} height={800} rx={16} fill="#16335a" {...o(10)} />
    {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M90 ${440 + i * 115} L990 ${440 + i * 115}`} stroke="#28508a" strokeWidth={3} />)}
    <g transform={`rotate(${tilt} 540 520)`}>
      <path d={`M${x0 - 40} ${y0} L${x0 + w} ${y0} L${x0 + w} ${y0 + 190} L${x0 + 10} ${y0 + 190} Z`} fill="#0f2442" stroke="#f6efdc" strokeWidth={8} strokeLinejoin="round" />
      {Array.from({ length: 16 }, (_, i) => {
        const flooded = i < n, red = i === 4 && bad > 0;
        return (<g key={i}>
          {flooded && <rect x={x0 + i * cw + 4} y={y0 + 190 - 150 * (red ? bad : 1)} width={cw - 8} height={150 * (red ? bad : 1) - 6} fill={red ? "#d2302a" : "#3d8fc9"} />}
          {i > 0 && <path d={`M${x0 + i * cw} ${y0 + 6} L${x0 + i * cw} ${y0 + 186}`} stroke="#f6efdc" strokeWidth={5} />}
        </g>);
      })}
      {[0, 1, 2, 3].map((i) => <rect key={i} x={x0 + 250 + i * 130} y={y0 - 86} width={46} height={86} fill="#0f2442" stroke="#f6efdc" strokeWidth={6} />)}
    </g>
    {age4 >= 0 && <g transform={`translate(300 890) scale(${back(age4 / 7)}) translate(-300 -890)`}><text x={300} y={950} textAnchor="middle" fontFamily={FONT} fontSize={170} fill="#7fd08a">4</text><text x={300} y={1030} textAnchor="middle" fontFamily={FONT} fontSize={64} fill="#f6efdc">FLOATS</text></g>}
    {age5 >= 0 && <g transform={`translate(760 890) scale(${back(age5 / 7)}) translate(-760 -890)`}><text x={760} y={950} textAnchor="middle" fontFamily={FONT} fontSize={170} fill="#ff5a4e">5+</text><text x={760} y={1030} textAnchor="middle" fontFamily={FONT} fontSize={64} fill="#f6efdc">SINKS</text></g>}
  </g>), "mid", true);
};
const lifeboat = (x: number, y: number, sw: number): Draw => node("lifeboat", [x - 220, y - 250, 440, 400], (<g transform={`rotate(${sw} ${x} ${y - 250})`}>
  <path d={`M${x - 160} ${y - 250} L${x - 160} ${y + 10} M${x + 160} ${y - 250} L${x + 160} ${y + 10}`} stroke={INK} strokeWidth={9} />
  <path d={`M${x - 215} ${y} Q${x} ${y + 150} ${x + 215} ${y} Z`} fill="#f1efe8" {...o(9)} />
  <path d={`M${x - 215} ${y} L${x + 215} ${y}`} stroke={INK} strokeWidth={14} strokeLinecap="round" /><path d={`M${x - 215} ${y} L${x + 215} ${y}`} stroke="#8a5a32" strokeWidth={7} strokeLinecap="round" />
  <path d={`M${x - 150} ${y + 44} Q${x} ${y + 82} ${x + 150} ${y + 44}`} fill="none" stroke="#b9c1cf" strokeWidth={7} strokeLinecap="round" />
</g>), "bg", true);

/** the twenty lifeboats as a grid of boats that appear one by one between frames c0 and c1 */
const boats20 = (t: number, c0: number, c1: number, x0: number, y0: number, dx: number, dy: number, sc: number): Draw => node("twenty lifeboats", [70, y0 - 30, 940, dy * 3 + 110], (<g>{Array.from({ length: 20 }, (_, i) => {
  const age = t - (c0 + (i / 20) * (c1 - c0));
  if (age < 0) return null;
  return (<g key={i} transform={`translate(${x0 + (i % 5) * dx} ${y0 + Math.floor(i / 5) * dy}) scale(${sc * back(age / 5)})`}>
    <path d="M-72 0 Q-60 58 0 58 Q60 58 72 0 Z" fill="#f1efe8" {...o(7)} /><path d="M-74 0 L74 0" stroke={INK} strokeWidth={15} strokeLinecap="round" /><path d="M-74 0 L74 0" stroke="#8a5a32" strokeWidth={8} strokeLinecap="round" /><path d="M-56 26 Q0 40 56 26" fill="none" stroke="#b9c1cf" strokeWidth={5} strokeLinecap="round" />
  </g>);
})}</g>), "mid", true);

// ---------------------------------------------------------------- scenes
const S = { hook: 0, truth: at("truth") - 1, time: at("time") - 1, scrape: at("scrape") - 1, side: at("scrape", "The", 1) - 2, calm: at("calm") - 1, below: at("below") - 1, plan: at("below", "She") - 2, wireless: at("wireless") - 1, answer: at("wireless", "The", 1) - 2, order: at("order") - 1, count: at("count") - 1, half: at("count", "Room") - 2, cliff: at("cliff") - 1 };
const SCENES: Scene[] = [
  { // the iceberg slides past the rail; Sir Digsworth sees it
    name: "hook", from: S.hook, to: S.truth, captions: false, closeup: true,
    draw: (t, T) => {
      const k = 800, e = t / T, sh = Math.sin(t * 2.1) * 5 * Math.exp(-Math.abs(t - 14) / 8);
      const p: Pose = { x: 350, y: 900 + 1.42 * k + sh, k, turn: lerp(0.9, 0.35, ease((t - 46) / 10)), lean: -3 + 2 * Math.sin(t * 0.2), handL: [-0.3, 0.7], handR: [0.2, lerp(1.5, 1.86, ease(t / 8))], hatLift: 0.03 * Math.abs(Math.sin(t * 0.5)),
        face: { ...FACES.shock, lookX: lerp(0.9, 0.2, ease((t - 46) / 10)), lookY: 0.5, eye: 1.3 } };
      const bits = [0, 1, 2, 3, 4].map((i) => { const tt = (t * 1.0 + i * 23) % 70, x = 520 + i * 105 - tt * 2.2, y = 260 + tt * 15 + 0.12 * tt * tt; return y < 1300 ? chunk(x, y, 0.9 + 0.3 * (i % 3), tt * 9 + i * 40) : null; });
      return [{ t: "cam", z: 1.03, cx: 540 + sh, cy: 900 }, bg("sea", 1.06, 0, -40), iceberg(lerp(980, 640, e), 1330, 1150), node("falling ice", [400, 200, 600, 1000], <g>{bits}</g>), { t: "fig", who: "sir", c: C.sir, p, close: true }, rail(1470)];
    },
  },
  { // my part is made up; everything around me is true
    name: "truth", from: S.truth, to: S.time,
    draw: (t, T) => {
      const k = 600, x = 560, hx = x + 0.34 * k, hy = GROUND - 0.98 * k, toss = Math.abs(Math.sin(t * 0.16)) * 46;
      const p: Pose = { x, y: GROUND, k, turn: 0.1 * Math.sin(t * 0.05), bob: -0.004 * Math.sin(t * 0.12), handL: [-0.36, 0.84], handR: [0.34, 0.98 + toss / k * 0.3], headTilt: 2 * Math.sin(t * 0.09),
        face: mixFace({ ...FACES.neutral, eye: blink(t, 2), browY: [0.2, 0.8], smile: 0.5 }, { ...FACES.sly, eye: 1, lookX: 0, browY: [0.1, 0.9], smile: 0.3 }, ease((t - (at("truth", "Everything") - S.truth)) / 8)) };
      return [cam(t, T, 1.03, 560, 800), bg("deck", 1.06, 0, 0), iceberg(lerp(820, 1500, t / T), 1230, 520, "bg", true), cane(x - 0.36 * k, GROUND - 0.84 * k, GROUND), { t: "fig", who: "sir", c: C.sir, p }, node("ice in his hand", [hx - 40, hy - 110, 80, 90], chunk(hx, hy - 62 - toss, 1, t * 6)),
        ...(t > 40 ? [{ t: "tag", text: "THE EVENTS ARE TRUE", sub: "my part is dramatised", y: 1462, age: t - 40 } as Draw] : [])];
    },
  },
  { // 11:40 p.m.: the lookout sees it
    name: "time", from: S.time, to: S.scrape,
    draw: (t, T) => {
      const k = 560, see = ease((t - 30) / 6), x = 500;
      const p: Pose = { x, y: GROUND, k, turn: 0.75, lean: lerp(4, -3, see), stretch: 1 + 0.04 * see, handR: [lerp(0.22, 0.42, see), lerp(1.42, 1.25, see)], handL: [-0.25, lerp(0.8, 1.2, see)],
        face: mixFace({ ...FACES.sly, eye: 0.3, lookX: 1, browY: [-0.2, -0.2] }, { ...FACES.shock, lookX: 1 }, see) };
      return [cam(t, T, 1.02, 540, 850), bg("sea", 1.06, 0, -40), iceberg(lerp(1010, 930, t / T), 1290, lerp(150, 230, ease(t / T)), "bg", true),
        node("mast", [500, 0, 80, H], <rect x={506} y={-20} width={56} height={H + 40} fill="#8a5a32" {...o(9)} />, "bg"),
        { t: "fig", who: "lookout", c: C.lookout, p },
        node("crow's nest", [330, 1230, 420, 420], (<g><path d="M330 1230 L750 1230 L720 1650 L360 1650 Z" fill="#6a4424" {...o(10)} /><rect x={318} y={1210} width={444} height={44} rx={10} fill="#8a5a32" {...o(9)} />{[420, 540, 660].map((bx) => <path key={bx} d={`M${bx} 1254 L${bx} 1650`} stroke={INK} strokeWidth={5} opacity={0.5} />)}</g>), "mid"),
        node("bell", [770, 640, 150, 190], (<g transform={`rotate(${14 * Math.sin(t * 0.9) * see} 845 650)`}><path d="M845 640 L845 690" stroke={INK} strokeWidth={9} /><path d="M795 790 Q795 690 845 690 Q895 690 895 790 Z" fill="#e2a92c" {...o(8)} /><circle cx={845} cy={800} r={13} fill="#8a5a32" {...o(5)} /></g>), "mid"),
        { t: "tag", text: "11:40 P.M. · 14 APRIL 1912", y: 317, age: t - 3 }];
    },
  },
  { // the ship swings away. Too late.
    name: "scrape", from: S.scrape, to: S.side, closeup: true,
    draw: (t, T) => {
      const hit = at("scrape", "Too") - S.scrape, sh = t >= hit ? Math.sin((t - hit) * 2.3) * 14 * Math.exp(-(t - hit) / 9) : 0;
      return [{ t: "cam", z: 1.02, cx: 540 + sh, cy: 900 }, bg("sea", 1.06, 0, -40), iceberg(905, 1330, 330, "mid"), ship(lerp(560, 792, ease(t / (hit + 2))), 1262 + sh * 0.3, 760)];
    },
  },
  { // the ice scrapes along her side
    name: "side", from: S.side, to: S.calm, closeup: true,
    draw: (t, T) => {
      const sl = t * 9, sh = Math.sin(t * 2.4) * 6;
      const sparks = [0, 1, 2, 3, 4, 5].map((i) => { const tt = (t * 2 + i * 9) % 22, y = 480 + ((i * 190 + t * 26) % 900); return <path key={i} d={`M${540 + tt * 5} ${y} l${14 + tt} ${-10 - i * 3}`} stroke="#ffe14d" strokeWidth={9} strokeLinecap="round" opacity={1 - tt / 22} />; });
      return [{ t: "cam", z: 1.03, cx: 540 + sh, cy: 900 }, bg("sea", 1.06, 0, -40),
        node("ice wall", [520, -200, 700, 2400], (<g transform={`translate(0 ${(sl % 600) - 600})`}>{[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M540 ${i * 600 - 300} L620 ${i * 600 - 150} L560 ${i * 600} L650 ${i * 600 + 160} L540 ${i * 600 + 300} L1200 ${i * 600 + 300} L1200 ${i * 600 - 300} Z`} fill="#e9f3fb" {...o(10)} />)}{[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M760 ${i * 600 - 280} L820 ${i * 600} L740 ${i * 600 + 280}`} fill="none" stroke="#8fb0d2" strokeWidth={8} />)}</g>)),
        node("hull", [-40, -40, 600, 2000], (<g><rect x={-40} y={-40} width={588} height={2000} fill="#1f2530" {...o(10)} />{[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <path key={i} d={`M-40 ${i * 270 - 60} L548 ${i * 270 - 60}`} stroke="#3a4352" strokeWidth={6} />)}{Array.from({ length: 40 }, (_, i) => <circle key={i} cx={60 + (i % 5) * 108} cy={40 + Math.floor(i / 5) * 270} r={11} fill="#566174" stroke={INK} strokeWidth={4} />)}<path d={`M548 ${420 + 2 * t} l-70 60 l40 90 l-60 80`} fill="none" stroke="#0b0d12" strokeWidth={12} strokeLinecap="round" /></g>), "mid"),
        node("sparks", [520, 400, 200, 1000], <g>{sparks}</g>)];
    },
  },
  { // on deck, nobody runs. They call her unsinkable.
    name: "calm", from: S.calm, to: S.below,
    draw: (t, T) => {
      const yawn = ease((t - 20) / 8) * (1 - ease((t - 44) / 8));
      const lady: Pose = { x: 300, y: GROUND, k: K, turn: 0.3, bob: -0.004 * Math.sin(t * 0.1), headTilt: 3 * Math.sin(t * 0.07), face: { ...FACES.neutral, smile: 0.7, eye: blink(t, 1), lookX: 0.5 } };
      const gent: Pose = { x: 780, y: GROUND, k: K, turn: -0.3, handR: [lerp(0.3, 0.08, yawn), lerp(0.62, 1.28, yawn)], headTilt: -5 * yawn, face: { ...FACES.neutral, eye: yawn > 0.5 ? 0.2 : blink(t, 4), open: 0.9 * yawn, smile: 0.2, lookX: -0.4 } };
      const un = at("calm", "unsinkable") - S.calm - 3;
      return [cam(t, T, 1.015, 540, 800), bg("deck", 1.06, 0, 0), { t: "fig", who: "lady", c: C.lady, p: lady }, { t: "fig", who: "gent", c: C.gent, p: gent },
        ...(t >= un ? [{ t: "tag", text: "“UNSINKABLE”", y: 1462, age: t - un } as Draw] : [])];
    },
  },
  { // below, the sea is coming in
    name: "below", from: S.below, to: S.plan,
    draw: (t, T) => {
      const rise = lerp(1700, 1330, ease(t / T)), x = lerp(520, 400, ease(t / T)), hop = Math.abs(Math.sin(t * 0.5)) * 0.03;
      const p: Pose = { x, y: GROUND, k: K, turn: 0.6, lean: -5, bob: hop, handL: [-0.36, 1.2], handR: [0.36, 1.25], face: { ...FACES.shock, lookX: 0.9, lookY: -0.4 } };
      const jet = <g>{[0, 1, 2].map((i) => <path key={i} d={`M1100 ${760 + i * 150} Q${900 - i * 30} ${800 + i * 150 + 20 * Math.sin(t * 0.8 + i)} ${760 - i * 40} ${1120 + i * 110}`} fill="none" stroke={i === 1 ? "#dff1fb" : "#7fbde6"} strokeWidth={46 - i * 8} strokeLinecap="round" />)}</g>;
      return [{ t: "cam", z: 1.02, cx: 540 + 3 * Math.sin(t * 1.7), cy: 900 }, bg("below", 1.06, 0, 0), node("jets", [700, 700, 400, 700], jet), { t: "fig", who: "stoker", c: C.stoker, p }, water(rise, t * 0.25)];
    },
  },
  { // she can float with four compartments flooded; at least five are open
    name: "plan", from: S.plan, to: S.wireless, closeup: true,
    draw: (t, T) => {
      const f4 = at("below", "four") - S.plan, f5 = at("below", "five") - S.plan;
      const n = t < f4 - 20 ? 0 : Math.min(4, 1 + Math.floor((t - (f4 - 20)) / 6)) + (t >= f5 - 4 ? 1 : 0);
      return [cam(t, T, 1.015, 540, 760), bg("below", 1.2, 0, 0), diagram(n, t >= f5 - 4 ? ease((t - f5 + 4) / 10) : 0, -3 * ease((t - f5) / 20), t - f4, t - f5)];
    },
  },
  { // the wireless room calls for help; the ship that answers cannot be here before four
    name: "wireless", from: S.wireless, to: S.answer,
    draw: (t, T) => {
      const tap = Math.abs(Math.sin(t * 0.9)) * 0.05, ans = T, x = 420;
      const p: Pose = { x, y: GROUND, k: K, turn: 0.6, lean: 5, handR: [0.5, 0.9 - tap], handL: [-0.1, 0.98], face: mixFace({ ...FACES.stern, lookX: 0.6, lookY: -0.5 }, { ...FACES.worried, lookX: 0.4 }, ease((t - ans - 20) / 10)) };
      const kx = x + 0.5 * K + 30, ky = GROUND - 0.9 * K + 60;
      const waves = <g>{[0, 1, 2].map((i) => { const r = ((t * 6 + i * 50) % 150) + 30; return <path key={i} d={`M${kx + 60 + r * 0.5} ${ky - 120 - r} q${r * 0.5} ${r * 0.5} 0 ${r}`} transform={`rotate(-50 ${kx + 60} ${ky - 60})`} fill="none" stroke="#ffe14d" strokeWidth={10} strokeLinecap="round" opacity={1 - r / 190} />; })}</g>;
      return [cam(t, T, 1.02, 540, 850), bg("wireless", 1.06, 0, 0), { t: "fig", who: "operator", c: C.operator, p },
        node("key and sparks", [kx - 60, ky - 260, 420, 330], (<g>{waves}<rect x={kx - 50} y={ky} width={170} height={30} rx={8} fill="#5a3a20" {...o(7)} /><path d={`M${kx - 30} ${ky - 6 - tap * 200} L${kx + 96} ${ky - 26}`} stroke={INK} strokeWidth={16} strokeLinecap="round" /><circle cx={kx - 30} cy={ky - 12 - tap * 200} r={17} fill="#e2a92c" {...o(6)} /></g>)),
        node("desk", [0, 1440, W, 480], <g><rect x={-20} y={1440} width={W + 40} height={500} fill="#6a4424" {...o(9)} /><rect x={-20} y={1440} width={W + 40} height={46} fill="#8a5a32" {...o(9)} /></g>, "fg"),
      ];
    },
  },
  { // the ship that answers cannot be here before four in the morning: a far-off steamer and the clock
    name: "answer", from: S.answer, to: S.order, closeup: true,
    draw: (t, T) => {
      const four = at("wireless", "four") - S.answer, hr = lerp(0.2, 4, ease((t - 6) / Math.max(10, four - 2))), a = (hr / 12) * 360;
      const smoke = [0, 1, 2, 3].map((i) => { const tt = (t * 1.2 + i * 16) % 64; return <circle key={i} cx={lerp(300, 520, t / T) - 250 - tt * 2.2} cy={1150 - tt * 1.6} r={14 + tt * 0.5} fill="#c9ccd4" opacity={0.7 * (1 - tt / 64)} />; });
      return [cam(t, T, 1.02, 540, 800), bg("sea", 1.06, 0, -40), node("smoke", [0, 1000, 600, 200], <g>{smoke}</g>), ship(lerp(300, 520, t / T), 1262 + 3 * Math.sin(t * 0.15), 420, 1),
        node("clock at four", [300, 400, 480, 480], (<g>
          <circle cx={540} cy={640} r={232} fill="#f6efdc" {...o(12)} /><circle cx={540} cy={640} r={204} fill="none" stroke="#8a5a32" strokeWidth={6} />
          {Array.from({ length: 12 }, (_, i) => <path key={i} d="M540 452 L540 482" transform={`rotate(${i * 30} 540 640)`} stroke={INK} strokeWidth={i % 3 ? 7 : 13} strokeLinecap="round" />)}
          <text x={634} y={742} textAnchor="middle" fontFamily={FONT} fontSize={64} fill="#b0302a">4</text>
          <path d="M540 640 L540 478" stroke={INK} strokeWidth={11} strokeLinecap="round" transform={`rotate(${(hr * 360) % 360} 540 640)`} />
          <path d="M540 640 L540 530" stroke={INK} strokeWidth={18} strokeLinecap="round" transform={`rotate(${a} 540 640)`} />
          <circle cx={540} cy={640} r={16} fill="#b0302a" {...o(6)} />
        </g>), "mid", true),
        ...(t >= four - 3 ? [{ t: "tag", text: "HELP: 4 IN THE MORNING", y: 1462, age: t - four + 3 } as Draw] : [])];
    },
  },
  { // the order: women and children first
    name: "order", from: S.order, to: S.count,
    draw: (t, T) => {
      const call = 0.4 + 0.4 * Math.abs(Math.sin(t * 0.7));
      const off: Pose = { x: 320, y: GROUND, k: K, turn: 0.6, lean: 3, handR: [0.62, 1.2], handL: [-0.1, 1.3], face: { ...FACES.stern, open: call, lookX: 0.7 } };
      const lady: Pose = { x: 780, y: GROUND, k: K, turn: -0.5, handL: [-0.3, 0.56], handR: [0.07, 0.98], bob: -0.006 * Math.abs(Math.sin(t * 0.5)), headTilt: -4, face: { ...FACES.worried, lookX: -0.7, eye: 1.15 * blink(t, 6) } };
      return [cam(t, T, 1.015, 540, 800), bg("deck", 1.06, 0, 0), lifeboat(786, 548, 2 * Math.sin(t * 0.1)), { t: "fig", who: "officer", c: C.officer, p: off }, { t: "fig", who: "lady", c: C.lady, p: lady },
        { t: "fig", who: "child", c: C.child, free: true, p: { x: 600, y: GROUND, k: 330, turn: -0.3, handR: [0.3, 0.86], handL: [-0.2, 0.55], bob: 0.01 * Math.abs(Math.sin(t * 0.4)), face: { ...FACES.worried, lookX: -0.6, lookY: 0.6, eye: 1.2 } } },
        ...(t >= at("order", "women") - S.order - 3 ? [{ t: "tag", text: "WOMEN AND CHILDREN FIRST", y: 1462, age: t - (at("order", "women") - S.order - 3) } as Draw] : [])];
    },
  },
  { // so I count the lifeboats: twenty of them appear above him as he counts
    name: "count", from: S.count, to: S.half,
    draw: (t, T) => {
      const k = 560, x = 540, c0 = at("count", "count") - S.count, tw = at("count", "Twenty") - S.count;
      const p: Pose = { x, y: GROUND, k, turn: 0.35 * Math.sin(t * 0.12), handL: [-0.36, 0.84], handR: [0.34, 1.2 + 0.1 * Math.abs(Math.sin(t * 0.6))], headTilt: -7 + 3 * Math.sin(t * 0.12),
        face: { ...FACES.neutral, lookX: 0.6 * Math.sin(t * 0.12), lookY: 1, browY: [0.2, 0.8], smile: 0, eye: blink(t, 3) } };
      return [cam(t, T, 1.015, 540, 800), bg("deck", 1.06, 0, 0), boats20(t, c0, tw + 4, 150, 334, 195, 62, 0.78), cane(x - 0.36 * k, GROUND - 0.84 * k, GROUND), { t: "fig", who: "sir", c: C.sir, p },
        ...(t >= tw ? [{ t: "tag", text: "20 LIFEBOATS", y: 1462, age: t - tw } as Draw] : [])];
    },
  },
  { // room for about half of us: the twenty boats, and ten passengers of whom five are struck out
    name: "half", from: S.half, to: S.cliff, closeup: true,
    draw: (t, T) => {
      const people = Array.from({ length: 10 }, (_, i) => {
        const px = 126 + i * 92, py = 960, out = i >= 5, red = out ? ease((t - 12 - (i - 5) * 4) / 5) : 0;
        return (<g key={i} transform={`translate(${px} ${py}) scale(${2.2 * back((t - i * 1.2) / 5)})`}>
          <path d="M-20 46 Q0 -6 20 46 Z" fill={red > 0.5 ? "#d2302a" : "#5a84c4"} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
          <circle cx={0} cy={-14} r={18} fill="#fdfbf5" stroke={INK} strokeWidth={4.5} />
          <circle cx={-6} cy={-16} r={2.6} fill={INK} /><circle cx={6} cy={-16} r={2.6} fill={INK} />
          {red > 0.5 ? <path d="M-7 -5 Q0 -10 7 -5" stroke={INK} strokeWidth={2.4} fill="none" strokeLinecap="round" /> : <path d="M-7 -7 Q0 -2 7 -7" stroke={INK} strokeWidth={2.4} fill="none" strokeLinecap="round" />}
          {red > 0.5 && <path d="M-24 -34 L24 48 M24 -34 L-24 48" stroke="#d2302a" strokeWidth={6} strokeLinecap="round" />}
        </g>);
      });
      return [cam(t, T, 1.015, 540, 760), bg("deck", 1.5, 260, -420), boats20(999, 0, 1, 150, 380, 195, 112, 1.1), node("room for half", [70, 880, 940, 230], <g>{people}</g>, "mid", true),
        { t: "tag", text: "ROOM FOR ABOUT HALF", y: 1462, age: t - 2 }];
    },
  },
  { // and the bow is already going down
    name: "cliff", from: S.cliff, to: TITANIC1_TOTAL,
    draw: (t, T) => {
      const k = 560, tilt = ease(t / 60), slide = ease((t - 12) / 50), x = lerp(600, 430, slide), wob = Math.sin(t * 0.6) * 0.05 * tilt;
      const p: Pose = { x, y: GROUND, k, turn: 0.2, lean: 9 * tilt, handL: [-0.36 - wob, lerp(0.84, 1.3, tilt)], handR: [0.36 + wob, lerp(0.62, 1.35, tilt)], footL: [-0.16, 0], footR: [0.2, 0.02 * Math.abs(Math.sin(t * 0.5))], hatLift: 0.05 * tilt,
        face: mixFace({ ...FACES.worried, eye: 1.2 }, { ...FACES.shock, lookX: -0.5 }, tilt) };
      const cx = lerp(900, 250, ease((t - 6) / 60));
      return [{ t: "cam", z: 1.02, cx: 540, cy: 1100, rot: -7 * tilt }, bg("deck", 1.32, 0, 0), { t: "fig", who: "sir", c: C.sir, p }, node("sliding ice", [cx - 40, GROUND - 60, 80, 70], chunk(cx, GROUND - 26, 1.1, -t * 7)),
        ...(t >= 44 ? [{ t: "tag", text: "TO BE CONTINUED", sub: "Part 2: the lifeboats", y: 1462, age: t - 44 } as Draw] : [])];
    },
  },
];

export const TITANIC1: Film = {
  scenes: SCENES, caps: CAPS, cast: C, audio: "titanic/mix-1.wav", bgDir: "titanic", total: TITANIC1_TOTAL,
  hook: [{ text: "THAT IS AN ICEBERG.", from: 0, size: 82, color: "#ffffff" }, { text: "I'M ON THE TITANIC.", from: at("hook", "And") - 1, size: 84, color: "#ffe14d" }],
};
export type { Face };
