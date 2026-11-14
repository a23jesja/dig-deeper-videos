// "The Town That Couldn't Stop Dancing" (Short, 2D): the dancing plague of Strasbourg, 1518.
// Script voice/dance-short.json, sources in FACTS-dancing-plague.md. Scenes as data; checked by check.ts.
import React from "react";
import { Costume, FACES, INK, mixFace, Pose } from "./fig";
import { CAST, Draw, Film, FPS, GROUND, Scene } from "./scenes";
import caps from "./captionsDance.json";

type Cap = { text: string; startMs: number; endMs: number; line: string };
const CAPS = caps as Cap[];
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const at = (line: string, word?: string, n = 0) => {
  const L = CAPS.filter((w) => w.line === line);
  return Math.round(((word ? L.filter((w) => norm(w.text) === norm(word))[n] : L[0]).startMs / 1000) * FPS);
};
export const DANCE_TOTAL = 1205;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const c01 = (t: number) => Math.min(1, Math.max(0, t));
const ease = (t: number) => { t = c01(t); return t * t * (3 - 2 * t); };
const back = (t: number) => { t = c01(t); const c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const blink = (f: number, seed: number) => { const p = (f + seed * 37) % 96; return p < 4 ? [0.5, 0.05, 0.05, 0.5][p] : 1; };
const FONT = "'Arial Black', 'Segoe UI Black', Impact, sans-serif";
const o = (sw = 7) => ({ stroke: INK, strokeWidth: sw, strokeLinejoin: "round" as const, strokeLinecap: "round" as const });
const K = 530;

const C: Record<string, Costume> = {
  sir: CAST.sir,
  troffea: { shape: "dress", coat: "#4f8a5a", shade: "#2c5236", collar: "#f4f1e6", belt: "#7a5238", hat: "beret", hatColor: "#f4f1e6" },
  man: { shape: "jacket", coat: "#b98a3e", shade: "#7a5a22", collar: "#f4f1e6", belt: "#3a2a1c", hat: "flat", hatColor: "#6a4a36", tash: "brush", shoe: "#3a2a1c" },
  woman: { shape: "dress", coat: "#4a6fa8", shade: "#2a4270", collar: "#f4f1e6", belt: "#d9a93c", hat: "beret", hatColor: "#e8dcc0" },
  doctor: { shape: "coat", coat: "#7a2d2d", shade: "#4a1818", collar: "#f4f1e6", buttons: "#1b1b22", hat: "beret", hatColor: "#1b1b22", tash: "walrus" },
  council: { shape: "coat", coat: "#2f4a3a", shade: "#1a2c22", collar: "#d9a93c", buttons: "#f0bd3c", belt: "#d9a93c", hat: "beret", hatColor: "#5a2030", tash: "curl" },
  drummer: { shape: "jacket", coat: "#f6f2e6", shade: "#b9c1cf", stripes: "#b0302a", belt: "#3a2a1c", hat: "beret", hatColor: "#b0302a" },
  piper: { shape: "jacket", coat: "#5c8b3a", shade: "#375a20", collar: "#f0bd3c", belt: "#3a2a1c", hat: "flat", hatColor: "#375a20", tash: "curl" },
};

const cam = (t: number, T: number, z1 = 1.015, cx = 540, cy = 800): Draw => ({ t: "cam", z: lerp(1, z1, ease(t / T)), cx, cy });
const bg = (img: string, zoom = 1.06, ox = 0, oy = 0): Draw => ({ t: "bg", img, zoom, ox, oy });
const node = (name: string, box: [number, number, number, number], el: React.ReactNode, layer: "bg" | "mid" | "fg" = "mid", key = false): Draw => ({ t: "node", name, key, layer, box: { x: box[0], y: box[1], w: box[2], h: box[3] }, el });
const board = (name: string, big: string, small: string, age: number, y = 322, color = "#b0302a"): Draw => node(name, [280, y, 520, 236], (
  <g transform={`translate(540 ${y + 118}) scale(${0.95 * back(age / 7)}) rotate(-2) translate(-540 ${-(y + 118)})`}>
    <rect x={270} y={y - 8} width={540} height={250} rx={10} fill="#f6efdc" {...o(10)} />
    <text x={540} y={y + (big.length > 3 ? 136 : 148)} textAnchor="middle" fontFamily={FONT} fontSize={big.length > 6 ? 96 : big.length > 3 ? 132 : 170} fill={color}>{big}</text>
    <text x={540} y={y + 218} textAnchor="middle" fontFamily={FONT} fontSize={small.length > 13 ? 42 : small.length > 10 ? 50 : 64} fill={INK}>{small}</text>
  </g>), "fg", true);
const cane = (hx: number, hy: number, gy: number): Draw => node("cane", [hx - 20, hy - 30, 60, gy - hy + 30], (<g><path d={`M${hx} ${hy - 6} L${hx + 22} ${gy - 6}`} stroke={INK} strokeWidth={22} strokeLinecap="round" /><path d={`M${hx} ${hy - 6} L${hx + 22} ${gy - 6}`} stroke="#5a3a20" strokeWidth={10} strokeLinecap="round" /><circle cx={hx} cy={hy - 12} r={20} fill="#f0bd3c" {...o(6)} /></g>));
const notes = (x: number, y: number, t: number, n = 4): Draw => node("music notes", [x - 160, y - 320, 320, 340], (<g>{Array.from({ length: n }, (_, i) => {
  const tt = (t * 2.2 + i * 37) % 150, nx = x + 90 * Math.sin(i * 2.1 + tt * 0.03) - 20, ny = y - tt * 2;
  return (<g key={i} opacity={1 - tt / 150} transform={`translate(${nx} ${ny}) rotate(${12 * Math.sin(tt * 0.1 + i)})`}><ellipse cx={0} cy={0} rx={17} ry={13} fill={INK} /><path d="M15 0 L15 -58 L44 -46 L44 -30 L15 -42" fill={INK} stroke={INK} strokeWidth={5} strokeLinejoin="round" /></g>);
})}</g>));
const sweat = (x: number, y: number, t: number): Draw => node("sweat", [x - 120, y - 60, 240, 160], (<g>{[0, 1, 2].map((i) => { const tt = (t * 1.6 + i * 13) % 40, s = i === 1 ? 1 : -1; return <path key={i} d={`M0 -14 Q11 4 0 14 Q-11 4 0 -14 Z`} transform={`translate(${x + s * (70 + tt * 1.6) * (i === 1 ? 1 : 1)} ${y - 10 + tt * 2.6})`} fill="#9fd0ee" stroke={INK} strokeWidth={4} opacity={1 - tt / 40} />; })}</g>));

/** a dancer who cannot stop: hop, sway, arms flung up in turn, feet lifting in turn. `tired` 0..1 */
const dancer = (who: string, x: number, k: number, t: number, seed: number, tired = 0, extra: Partial<Pose> = {}): Draw => {
  const w = t * 0.42 + seed * 1.9, s = Math.sin(w), c = Math.cos(w), hop = Math.abs(Math.sin(w)) * (1 - 0.5 * tired);
  const p: Pose = {
    x: x + 8 * Math.sin(w * 0.5), y: GROUND, k, turn: 0.55 * Math.sin(w * 0.5), bob: 0.05 * hop - 0.01 * tired, lean: 5 * s * (1 - 0.3 * tired) + 4 * tired, headTilt: -6 * s,
    handL: [-0.24 - 0.04 * c, lerp(1.25 + 0.3 * Math.max(0, s), 0.8, tired * 0.7)], handR: [0.24 + 0.04 * c, lerp(1.25 + 0.3 * Math.max(0, -s), 0.75, tired * 0.7)],
    footL: [-0.11, 0.16 * Math.max(0, s) * (1 - 0.6 * tired)], footR: [0.11, 0.16 * Math.max(0, -s) * (1 - 0.6 * tired)],
    face: mixFace({ ...FACES.worried, eye: 1.15 * blink(t, seed), open: 0.35 + 0.2 * Math.abs(c), lookX: 0.4 * Math.sin(w * 0.5) }, { ...FACES.worried, eye: 0.3, open: 0.5, smile: -1 }, tired),
    ...extra,
  };
  return { t: "fig", who, c: C[who], p };
};

/** a dancing crowd behind the main figures: `rows` of ever smaller dancers going back up the street (drawn far to
 *  near), then `dots` rows of bobbing heads beyond them. Returns the draws and how many people it shows. */
const WHO = ["man", "woman", "troffea"], HEADS = ["#f4f1e6", "#6a4a36", "#e8dcc0", "#b0302a", "#375a20"];
const crowd = (t: number, rows: number, dots: number, y0 = 1545, y1 = 1385, k0 = 430, k1 = 170, grow = 1): { draws: Draw[]; count: number } => {
  const draws: Draw[] = []; let count = 0;
  for (let d = dots - 1; d >= 0; d--) {
    const y = y1 - 26 - d * 13, r = 15 - d * 1.2, n = Math.floor(1100 / (r * 2.5)), row: React.ReactNode[] = [];
    for (let i = 0; i < n; i++) { const x = -10 + i * r * 2.5 + (d % 2) * r, b = 5 * Math.abs(Math.sin(t * 0.42 + i * 1.7 + d)); row.push(<g key={i}><circle cx={x} cy={y - b} r={r} fill="#fdfbf5" stroke={INK} strokeWidth={3} /><path d={`M${x - r} ${y - b - 2} Q${x} ${y - b - r * 1.9} ${x + r} ${y - b - 2} Z`} fill={HEADS[(i + d) % 5]} stroke={INK} strokeWidth={3} /></g>); }
    if (grow > d / Math.max(1, dots)) { draws.push(node(`far heads ${d}`, [0, y - 40, 1080, 60], <g>{row}</g>, "mid")); count += n; }
  }
  for (let r = rows - 1; r >= 0; r--) {
    const f = rows === 1 ? 0 : r / (rows - 1), y = lerp(y0, y1, f), k = lerp(k0, k1, f), n = Math.max(3, Math.floor(1080 / (k * 0.44)));
    for (let i = 0; i < n; i++) {
      const x = ((i + 0.5 + (r % 2) * 0.5) / n) * 1160 - 40, seed = r * 17 + i * 3.1, w = t * 0.42 + seed * 1.9, sn = Math.sin(w);
      draws.push({ t: "fig", who: WHO[(i + r) % 3], c: C[WHO[(i + r) % 3]], free: true, p: {
        x, y: y - 0.04 * k * Math.abs(sn), k, turn: 0.5 * Math.sin(w * 0.5), lean: 5 * sn, headTilt: -5 * sn,
        handL: [-0.24, 1.25 + 0.3 * Math.max(0, sn)], handR: [0.24, 1.25 + 0.3 * Math.max(0, -sn)], footL: [-0.11, 0.14 * Math.max(0, sn)], footR: [0.11, 0.14 * Math.max(0, -sn)],
        face: { ...FACES.worried, open: 0.4, eye: 1.1 } } });
      count++;
    }
  }
  return { draws, count };
};

const S = { hook: 0, where: at("where") - 1, spread: at("spread") - 1, doctors: at("doctors") - 1, stage: at("stage") - 1, worse: at("worse") - 1, toll: at("toll") - 1, ban: at("ban") - 1, shrine: at("ban", "and") - 2, over: at("over") - 1, why: at("why") - 1 };
const SCENES: Scene[] = [
  { // she cannot stop
    name: "hook", from: S.hook, to: S.where, captions: false, closeup: true,
    draw: (t, T) => {
      const k = 760, w = t * 0.42, s = Math.sin(w), gy = 760 + 1.42 * k;
      const p: Pose = { x: 540 + 16 * Math.sin(w * 0.5), y: gy - 30 * Math.abs(s), k, turn: 0.4 * Math.sin(w * 0.5), lean: 6 * s, headTilt: -5 * s,
        handL: [-0.37, 1.5 + 0.22 * Math.max(0, s)], handR: [0.37, 1.5 + 0.22 * Math.max(0, -s)], face: { ...FACES.worried, eye: 1.2, open: 0.4 + 0.2 * Math.abs(Math.cos(w)), lookX: 0.3 * Math.sin(w * 0.5) } };
      return [{ t: "cam", z: 1.03, cx: 540, cy: 800 }, bg("street", 1.2, 0, 60), { t: "fig", who: "troffea", c: C.troffea, p, close: true }, sweat(p.x, p.y - 1.5 * k, t)];
    },
  },
  { // Strasbourg, July 1518: Frau Troffea dances in the street, for days
    name: "where", from: S.where, to: S.spread,
    draw: (t, T) => {
      const days = at("where", "for") - S.where, tired = 0.5 * ease((t - days) / 20);
      const man: Pose = { x: 800, y: GROUND, k: K, turn: -0.5, handL: [-0.12, 1.22], headTilt: -5, face: { ...FACES.neutral, smile: -0.2, browY: [0.2, 0.9], lookX: -0.8, eye: blink(t, 5) } };
      return [cam(t, T), bg("street"), dancer("troffea", 330, K, t, 0, tired), { t: "fig", who: "man", c: C.man, p: man },
        ...(t < days - 8 ? [{ t: "tag", text: "STRASBOURG, JULY 1518", y: 317, age: t - 3 } as Draw] : [board("for days", "DAYS", "WITHOUT STOPPING", t - days + 8, 318, "#27304a")])];
    },
  },
  { // within days, more than thirty have joined her
    name: "spread", from: S.spread, to: S.doctors,
    draw: (t, T) => {
      // thirty-odd people on screen: three in front and 28 behind them
      const th = at("spread", "thirty") - S.spread - 3, cr = crowd(t, 3, 0, 1530, 1150, 450, 300);
      return [cam(t, T, 1), bg("plaza"), ...cr.draws, dancer("man", 312, K, t, 1), dancer("woman", 768, K, t, 2), dancer("troffea", 540, K, t, 0, 0.3),
        ...(t >= th ? [{ t: "tag", text: "MORE THAN 30", y: 317, age: t - th } as Draw] : [])];
    },
  },
  { // the doctors blame overheated blood. Their cure? More dancing.
    name: "doctors", from: S.doctors, to: S.stage,
    draw: (t, T) => {
      const cure = at("doctors", "More") - S.doctors - 3, kk = ease((t - cure) / 8), fx = 300 + 0.42 * K, fy = GROUND - 1.2 * K;
      const doc: Pose = { x: 300, y: GROUND, k: K, turn: 0.45, handR: [0.42, 1.2], handL: [lerp(-0.3, -0.36, kk), lerp(0.62, 1.5, kk)], headTilt: 3 * Math.sin(t * 0.1),
        face: mixFace({ ...FACES.stern, lookX: 0.8, lookY: 0.4 }, { ...FACES.glee, lookX: 0.3 }, kk) };
      const sir: Pose = { x: 790, y: GROUND, k: K, turn: -0.3, handL: [-0.36, 0.84], headTilt: -4 * kk, face: mixFace({ ...FACES.neutral, lookX: -0.7, eye: blink(t, 3) }, { ...FACES.sly, eye: 1, lookX: -0.6, browY: [1, 0.1], smile: -0.4 }, kk) };
      return [cam(t, T), bg("council"), { t: "fig", who: "doctor", c: C.doctor, p: doc },
        node("flask", [fx - 50, fy - 150, 100, 150], (<g><path d={`M${fx - 14} ${fy - 150} L${fx + 14} ${fy - 150} L${fx + 14} ${fy - 96} L${fx + 46} ${fy - 30} Q${fx + 50} ${fy - 8} ${fx + 26} ${fy - 8} L${fx - 26} ${fy - 8} Q${fx - 50} ${fy - 8} ${fx - 46} ${fy - 30} L${fx - 14} ${fy - 96} Z`} fill="#dff1fb" {...o(7)} /><path d={`M${fx - 36} ${fy - 50} L${fx + 36} ${fy - 50} L${fx + 44} ${fy - 30} Q${fx + 46} ${fy - 14} ${fx + 24} ${fy - 14} L${fx - 24} ${fy - 14} Q${fx - 46} ${fy - 14} ${fx - 44} ${fy - 30} Z`} fill="#d2302a" />{[0, 1].map((i) => <circle key={i} cx={fx - 10 + i * 18} cy={fy - 70 - ((t * 3 + i * 20) % 50)} r={6} fill="#d2302a" opacity={0.8} />)}</g>)),
        { t: "fig", who: "doctor", c: C.doctor, p: doc, part: "hands" }, cane(790 - 0.36 * K, GROUND - 0.84 * K, GROUND), { t: "fig", who: "sir", c: C.sir, p: sir },
        ...(t >= cure ? [{ t: "tag", text: "THE CURE: MORE DANCING", y: 1462, age: t - cure } as Draw] : t > 12 ? [{ t: "tag", text: "“OVERHEATED BLOOD”", y: 1462, age: t - 12 } as Draw] : [])];
    },
  },
  { // the city builds a stage and hires musicians
    name: "stage", from: S.stage, to: S.worse,
    draw: (t, T) => {
      const beat = Math.sin(t * 0.6), dx = 300, px = 780;
      const dr: Pose = { x: dx, y: GROUND, k: K, turn: 0.3, bob: 0.02 * Math.abs(beat), handL: [-0.1, 0.86 + 0.1 * Math.max(0, beat)], handR: [0.26, 0.86 + 0.1 * Math.max(0, -beat)], face: { ...FACES.glee, eye: blink(t, 2) } };
      const pi: Pose = { x: px, y: GROUND, k: K, turn: -0.4, bob: 0.02 * Math.abs(Math.cos(t * 0.6)), lean: 3 * beat, handL: [-0.2, 1.18], handR: [-0.02, 1.26], face: { ...FACES.neutral, open: 0.25, smile: 0, lookX: -0.3, browY: [0.6, 0.6] } };
      const dy = GROUND - 0.66 * K, mx = px - 0.13 * K * 0.4 - 30, my = GROUND - 1.29 * K;
      return [cam(t, T), bg("square", 1.45, 0, 135), { t: "fig", who: "drummer", c: C.drummer, p: dr },
        node("drum", [dx - 40, dy - 80, 200, 190], (<g><rect x={dx - 10} y={dy - 60} width={150} height={150} rx={14} fill="#b0302a" {...o(8)} /><ellipse cx={dx + 65} cy={dy - 60} rx={75} ry={22} fill="#f6efdc" {...o(8)} />{[0, 1, 2].map((i) => <path key={i} d={`M${dx + 10 + i * 50} ${dy - 40} L${dx + 35 + i * 50} ${dy + 86}`} stroke="#f0bd3c" strokeWidth={6} />)}</g>)),
        { t: "fig", who: "drummer", c: C.drummer, p: dr, part: "hands" }, { t: "fig", who: "piper", c: C.piper, p: pi },
        node("pipe", [mx - 200, my - 20, 220, 110], <g><path d={`M${mx + 6} ${my} L${mx - 190} ${my + 78}`} stroke={INK} strokeWidth={24} strokeLinecap="round" /><path d={`M${mx + 6} ${my} L${mx - 190} ${my + 78}`} stroke="#b98a52" strokeWidth={12} strokeLinecap="round" /></g>),
        { t: "fig", who: "piper", c: C.piper, p: pi, part: "hands" }, notes(540, 760, t, 5)];
    },
  },
  { // it backfires: as many as four hundred
    name: "worse", from: S.worse, to: S.toll,
    draw: (t, T) => {
      // the whole street full: rows of dancers shrinking into the distance, then rows of bobbing heads (about 400 in all)
      const fh = at("worse", "four") - S.worse - 3, cr = crowd(t, 9, 7, 1560, 770, 470, 120, c01(0.15 + t / (fh + 6)));
      return [cam(t, T, 1), bg("plaza"), ...cr.draws, dancer("woman", 312, K, t, 3, 0.2), dancer("man", 758, K, t, 5, 0.2), dancer("troffea", 540, K, t, 1, 0.45), notes(540, 700, t, 3),
        ...(t >= fh ? [{ t: "tag", text: "AS MANY AS 400", y: 317, age: t - fh } as Draw] : [])];
    },
  },
  { // some may have danced themselves to death; nobody knows how many
    name: "toll", from: S.toll, to: S.ban,
    draw: (t, T) => {
      const man: Pose = { x: 790, y: GROUND, k: K, turn: -0.5, lean: -3, handL: [-0.4, 0.95], handR: [0.1, 0.9], headTilt: 5, face: { ...FACES.worried, lookX: -0.8, eye: 1.1 * blink(t, 8) } };
      return [cam(t, T), bg("street"), dancer("troffea", 330, 540, t * 0.55, 0, 1), sweat(320, GROUND - 1.5 * K, t), { t: "fig", who: "man", c: C.man, p: man },
        ...(t >= at("toll", "Nobody") - S.toll - 3 ? [{ t: "tag", text: "THE TOLL IS UNKNOWN", y: 1462, age: t - (at("toll", "Nobody") - S.toll - 3) } as Draw] : [])];
    },
  },
  { // at last the council bans dancing
    name: "ban", from: S.ban, to: S.shrine,
    draw: (t, T) => {
      const bans = at("ban", "bans") - S.ban - 3, kk = ease((t - bans) / 6);
      const co: Pose = { x: 540, y: GROUND, k: 560, turn: 0.15 * Math.sin(t * 0.1), handR: [lerp(0.3, 0.4, kk), lerp(0.62, 1.5, kk)], handL: [-0.3, 0.7], stretch: 1 + 0.03 * kk, face: { ...FACES.stern, open: 0.3 + 0.3 * Math.abs(Math.sin(t * 0.7)) } };
      return [cam(t, T), bg("council"), { t: "fig", who: "council", c: C.council, p: co },
        ...(t >= bans ? [board("no dancing", "NO", "DANCING", t - bans, 318)] : [])];
    },
  },
  { // and sends the dancers to a shrine of St Vitus
    name: "shrine", from: S.shrine, to: S.over,
    draw: (t, T) => {
      const e = t / T, cx = 790;
      const chapel = (<g>
        <path d={`M${cx - 190} 1180 L${cx - 190} 760 L${cx} 560 L${cx + 190} 760 L${cx + 190} 1180 Z`} fill="#d9cdb4" {...o(10)} />
        <path d={`M${cx - 214} 772 L${cx} 548 L${cx + 214} 772`} fill="none" stroke="#9a4a36" strokeWidth={34} strokeLinejoin="round" strokeLinecap="round" /><path d={`M${cx - 214} 772 L${cx} 548 L${cx + 214} 772`} fill="none" {...o(8)} transform="translate(0 -17)" />
        <path d={`M${cx} 548 L${cx} 440 M${cx - 38} 480 L${cx + 38} 480`} stroke={INK} strokeWidth={22} strokeLinecap="round" /><path d={`M${cx} 548 L${cx} 440 M${cx - 38} 480 L${cx + 38} 480`} stroke="#e2a92c" strokeWidth={11} strokeLinecap="round" />
        <path d={`M${cx - 70} 1180 L${cx - 70} 990 Q${cx} 900 ${cx + 70} 990 L${cx + 70} 1180 Z`} fill="#5a3a20" {...o(9)} />
        <path d={`M${cx - 52} 880 L${cx - 52} 800 Q${cx} 740 ${cx + 52} 800 L${cx + 52} 880 Z`} fill="#3d5a8a" {...o(8)} />
        <circle cx={cx} cy={806} r={20} fill="#fdfbf5" {...o(5)} /><circle cx={cx} cy={806} r={31} fill="none" stroke="#e2a92c" strokeWidth={7} /><path d={`M${cx - 20} 878 Q${cx} 822 ${cx + 20} 878 Z`} fill="#b0302a" {...o(5)} />
      </g>);
      return [cam(t, T), bg("plaza"), node("shrine of St Vitus", [cx - 220, 430, 440, 760], chapel, "bg", true),
        { ...dancer("woman", lerp(150, 300, e), 400, t, 3, 0.5, { turn: 0.6 }), free: true } as Draw, { ...dancer("man", lerp(300, 450, e), 450, t, 5, 0.5, { turn: 0.6 }), free: true } as Draw, dancer("troffea", lerp(340, 470, e), K, t, 1, 0.6, { turn: 0.7 }),
        { t: "tag", text: "TO THE SHRINE OF ST VITUS", y: 1462, age: t - 3 }];
    },
  },
  { // by September it is over
    name: "over", from: S.over, to: S.why,
    draw: (t, T) => {
      const tr: Pose = { x: 320, y: GROUND, k: K, turn: 0.3, bob: -0.02, lean: 4, handL: [-0.3, 0.6], handR: [0.3, 0.6], headTilt: 4, face: { ...FACES.neutral, eye: 0.3, smile: 0.9, browY: [0.3, 0.3] } };
      const man: Pose = { x: 790, y: GROUND, k: K, turn: -0.4, handR: [0.3, 0.62], handL: [-0.12, 1.0], face: { ...FACES.neutral, smile: 0.8, lookX: -0.6, eye: blink(t, 4) } };
      return [cam(t, T), bg("street"), { t: "fig", who: "troffea", c: C.troffea, p: tr }, { t: "fig", who: "man", c: C.man, p: man }, { t: "tag", text: "SEPTEMBER 1518", y: 317, age: t - 4 }];
    },
  },
  { // why? one historian blames mass stress
    name: "why", from: S.why, to: DANCE_TOTAL,
    draw: (t, T) => {
      const k = 600, x = 560, st = at("why", "mass") - S.why - 3, sure = at("why", "Nobody") - S.why, sh = ease((t - sure) / 9);
      const p: Pose = { x, y: GROUND, k, turn: 0, handL: [-0.36, 0.84], handR: [lerp(0.3, 0.3, sh), lerp(0.62, 1.04, sh)], headTilt: lerp(3 * Math.sin(t * 0.08), 6, sh),
        face: mixFace({ ...FACES.neutral, eye: blink(t, 6), browY: [0.2, 0.9], smile: 0.2 }, { ...FACES.neutral, smile: -0.2, browY: [0.9, 0.9] }, sh) };
      return [cam(t, T, 1.03, 560, 800), bg("street", 1.12, 40, 0), cane(x - 0.36 * k, GROUND - 0.84 * k, GROUND), { t: "fig", who: "sir", c: C.sir, p },
        ...(t >= st ? [{ t: "tag", text: "MASS STRESS?", sub: "one historian's theory", y: 1462, age: t - st } as Draw] : [])];
    },
  },
];

export const DANCE: Film = {
  scenes: SCENES, caps: CAPS, cast: C, audio: "dance/mix.wav", bgDir: "dance", total: DANCE_TOTAL,
  hook: [{ text: "SHE CANNOT STOP DANCING.", from: 0, size: 58, color: "#ffffff" }, { text: "AND IT SPREADS.", from: at("hook", "And") - 1, size: 104, color: "#ffe14d" }],
};
