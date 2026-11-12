// Timeline of the long film "The Bear Who Joined the Army" (Wojtek, 1920 x 1080, 3 min 7 s). Every shot starts on a
// word of the voice (voice/wojtek-long/words.json -> wordsWL.json), so re-recording the voice re-times the film.
import { Cam, Dof, Key, ShotDef, V3, Zone, Light, run, pushK, zoom, kicked, dofFrom, layersFrom, clamp01 } from "./story";
import wordsJson from "./wordsWL.json";

type Wd = { w: string; a: number; b: number; line: string };
const WORDS = wordsJson as Wd[];
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
/** the frame on which a line starts, or on which the n-th occurrence of a word in that line starts */
export const at = (line: string, word?: string, n = 0): number => {
  const L = WORDS.filter((w) => w.line === line);
  if (!L.length) throw new Error(`no line ${line}`);
  if (!word) return Math.round(L[0].a * 30);
  const m = L.filter((w) => norm(w.w) === norm(word));
  if (!m[n]) throw new Error(`no word "${word}" (${n}) in line ${line}`);
  return Math.round(m[n].a * 30);
};

export const TOTAL_WL = 5605;
/** where the two statues stand in the park (zone "scot") */
export const X0 = 60;

const DEFS: [number, string, number, Zone, Light?][] = [
  [1, "hook: a soldier carried shells to the guns", 0, "cassino"],
  [2, "he was also a bear", at("hook3") - 4, "camp"],
  [3, "I'm Sir Digsworth: Wojtek, the soldier bear", at("intro") - 5, "camp"],
  [4, "spring 1942: a Polish army crosses Iran", at("iran") - 5, "track"],
  [5, "a boy has found a bear cub", at("boy") - 4, "track"],
  [6, "a lieutenant buys the cub", at("buy") - 3, "track"],
  [7, "the cub joins a transport company", at("join") - 4, "camp"],
  [8, "condensed milk from a vodka bottle", at("milk") - 3, "camp"],
  [9, "a name: Wojtek", at("name") - 3, "camp"],
  [10, "he grows: fruit, marmalade, honey, syrup", at("menu") - 5, "camp"],
  [11, "beer, his favourite drink", at("beer") - 3, "camp"],
  [12, "cigarettes: smoked or eaten", at("cig") - 3, "camp"],
  [13, "coffee in the morning", at("coffee") - 4, "camp"],
  [14, "cold nights beside the soldiers", at("coffee", "And") - 3, "camp", "golden"],
  [15, "he wrestles, salutes, marches", at("copy") - 4, "camp"],
  [16, "Iraq, Syria, Egypt", at("travel") - 4, "track"],
  [17, "in Egypt, a problem", at("problem") - 4, "dock"],
  [18, "the ship has a rule: no pets", at("ship") - 4, "dock"],
  [19, "the idea: sail as a soldier", at("idea") - 3, "dock"],
  [20, "enlisted as a private", at("enlist") - 5, "office"],
  [21, "a paybook, a rank, a serial number", at("papers") - 3, "office"],
  [22, "two soldiers look after him", at("keepers") - 3, "camp"],
  [23, "he lives in the tents", at("tents") - 3, "camp"],
  [24, "or in a crate on a truck", at("tents", "or") - 3, "track"],
  [25, "Private Wojtek sails for Italy", at("sail") - 4, "dock"],
  [26, "1944: Monte Cassino", at("cassino") - 6, "cassino"],
  [27, "he weighs ninety kilos", at("ninety") - 3, "cassino"],
  [28, "shells to the guns", at("job") - 3, "cassino"],
  [29, "four shells, a hundred pounds", at("job", "One") - 3, "cassino"],
  [30, "he carried crate after crate", at("carry") - 4, "cassino"],
  [31, "historians are not sure", at("doubt") - 4, "cassino"],
  [32, "a British soldier saw a bear carrying crates", at("doubt", "But") - 3, "cassino"],
  [33, "the badge: a bear carrying a shell", at("badge") - 4, "camp"],
  [34, "promoted to corporal", at("corporal") - 3, "camp"],
  [35, "a farm in Scotland", at("scot") - 6, "scot"],
  [36, "the locals love him", at("locals") - 3, "scot"],
  [37, "1947: demobilised", at("demob") - 3, "scot"],
  [38, "given to Edinburgh Zoo", at("demob", "Wojtek") - 3, "zoo"],
  [39, "old comrades visit", at("visit") - 3, "zoo"],
  [40, "they throw him cigarettes", at("throw") - 3, "zoo"],
  [41, "children's television", at("tv") - 3, "zoo"],
  [42, "he still answers in Polish", at("polish") - 3, "zoo"],
  [43, "nearly five hundred kilos", at("big") - 6, "zoo", "golden"],
  [44, "died in 1963, aged twenty-one", at("died") - 3, "zoo", "golden"],
  [45, "statues in Edinburgh and Krakow", at("statues") - 5, "scot"],
  [46, "one bear, one war; outro", at("end1") - 4, "scot"],
];
export const SHOTS_WL: ShotDef[] = DEFS.map(([id, name, a, zone, light], i) => ({
  id, name, a, b: i + 1 < DEFS.length ? DEFS[i + 1][2] : TOTAL_WL, zone, light: light ?? "day",
  ...(light === "golden" ? { sunAz: 28, sunEl: 10 } : { sunAz: zone === "office" ? 150 : zone === "cassino" ? 120 : 105 }),
}));
/** first frame of every shot, by id */
export const A: number[] = [0, ...SHOTS_WL.map((s) => s.a)];
export const XFADE_WL: Record<number, number> = { 4: 8, 7: 8, 14: 10, 15: 8, 16: 8, 17: 8, 20: 8, 22: 8, 25: 8, 26: 10, 33: 8, 35: 10, 38: 10, 43: 10, 45: 10 };
export const FLASH_WL = A[3];
export const layersWL = layersFrom(SHOTS_WL, XFADE_WL);

/** where the truck is along the track in the three driving shots */
export const truckXL = (id: number, f: number) => (id === 4 ? 0.075 : id === 16 ? 0.2 : 0.09) * (f - A[id]);

// ---- Monte Cassino: the gun fires all through shots 26-32; the bear's walk with the crate in shot 30 ----
export const GUNS_WL: Record<number, number[]> = {
  1: [at("hook1", "carried") - 2, at("hook1", "guns") + 6, at("hook2", "beer") + 16],
  26: (() => { const o: number[] = []; for (let f = A[26] + 12; f < A[33] - 24; f += 43) o.push(f); return o; })(),
};
export const HE = at("carry", "He") - 3, NV = at("carry", "never") - 4, SET = at("carry", "dropped") + 2;
/** shot 30: the bear with his crate (from the truck to the stack) */
export const carryL = (f: number): { x: number; z: number } => {
  const z = f < HE ? 9.0 : f < NV ? 8.6 - 5.0 * clamp01((f - HE) / (NV - HE)) : 3.6 - 2.4 * clamp01((f - NV) / (SET - 4 - NV));
  return { x: f < HE ? 1.9 : -1.2 + 1.6 * ((z - 1.2) / 7.4), z };
};

const Zm = zoom, P = pushK;
const one = (id: number, pos: V3, look: V3, fov: number, rate = 0.0008, rest: Partial<Cam> = {}): Key[] => [{ f: A[id], s: (f) => Zm(pos, look, fov, P(f, A[id], rate), rest) }];
const CAMS: Record<number, Key[]> = {
  1: one(1, [0, 1.7, -9.4], [0, 1.45, 0], 36),
  2: one(2, [0, 1.7, -7.6], [0, 1.45, 0], 36, 0.003),
  3: one(3, [0.2, 1.7, -9.4], [0.2, 1.4, -2], 35, 0.001),
  4: [{ f: A[4], s: (f) => { const x = truckXL(4, f); return Zm([x - 2.9, 2.0, 10.5], [x - 2.9, 1.5, 0], 39, P(f, A[4], 0.0004)); } }],
  5: [
    { f: A[5], s: (f) => Zm([1.6, 1.7, -8.6], [1.6, 1.3, 0], 36, P(f, A[5], 0.0008)) },
    { f: at("boy", "Hunters") - 6, dur: 26, s: (f) => Zm([0.6, 1.4, -6.8], [0.6, 1.2, 0], 34, P(f, at("boy", "Hunters") - 6, 0.0006)) },
  ],
  6: one(6, [0.2, 1.6, -6.8], [0.2, 1.6, 0], 34, 0.0008),
  7: one(7, [0, 1.8, -8.8], [0, 1.6, 0], 36),
  8: one(8, [0.85, 1.25, -4.9], [0.85, 0.95, 0], 34, 0.0012),
  9: one(9, [-0.15, 1.1, -3.9], [-0.2, 0.95, -0.6], 34, 0.0012),
  10: one(10, [-0.3, 1.9, -8.2], [-0.3, 1.75, 0], 36),
  11: one(11, [-0.5, 1.8, -6.6], [-0.5, 1.7, 0], 36, 0.001),
  12: one(12, [0.7, 1.6, -5.0], [0.7, 1.35, 0], 34, 0.001),
  13: one(13, [-0.4, 1.6, -5.8], [-0.4, 1.4, 0], 35, 0.001),
  14: one(14, [4.4, 1.5, -3.6], [4.4, 1.15, 3.4], 36, 0.001),
  15: one(15, [0, 1.8, -10], [0, 1.3, 0], 36, 0.0004),
  16: [{ f: A[16], s: (f) => { const x = truckXL(16, f); return Zm([x - 0.6, 2.0, 10.5], [x - 0.6, 1.75, 0], 36, P(f, A[16], 0.0004)); } }],
  17: one(17, [0.9, 2.0, -6.0], [0.9, 2.5, 8], 38, 0.0008),
  18: [
    { f: A[18], s: (f) => Zm([1.4, 1.9, -8.0], [1.4, 1.75, 2.6], 36, P(f, A[18], 0.0006)) },
    { f: at("ship", "rule") - 10, dur: 26, s: (f) => Zm([1.0, 1.8, -5.6], [1.0, 1.6, 2.6], 34, P(f, at("ship", "rule") - 10, 0.0006)) },
  ],
  19: one(19, [0.5, 1.75, -4.4], [0.5, 1.6, 2.4], 34, 0.0006),
  20: one(20, [0.3, 1.9, -7.4], [0.3, 1.95, 1.5], 34, 0.0006),
  21: one(21, [0.6, 1.85, -4.8], [0.6, 1.75, 1.2], 34, 0.0006),
  22: one(22, [0, 1.6, -6.6], [0, 1.4, 0], 35, 0.001),
  23: one(23, [4.6, 1.5, -3.8], [4.6, 1.2, 3.6], 36, 0.001),
  24: [{ f: A[24], s: (f) => { const x = truckXL(24, f); return Zm([x - 0.4, 1.9, 8.0], [x - 0.4, 1.45, 0], 36, P(f, A[24], 0.0006)); } }],
  25: one(25, [8, 4.7, 0.6], [8, 4.95, 9.2], 34, 0.0008),
  26: one(26, [0.4, 1.9, -5.8], [0.4, 3.2, 60], 44, 0.0008, { roll: 0.02 }),
  27: one(27, [-2.5, 1.7, -3.8], [-2.5, 1.55, 1.5], 34, 0.001),
  28: one(28, [0.3, 1.8, -5.6], [0.3, 1.3, 2], 38, 0.0008),
  29: one(29, [0, 1.6, -4.6], [0, 1.5, 2], 34, 0.0006),
  30: [
    { f: A[30], s: (f) => Zm([0.1, 1.9, -6.4], [0.1, 1.5, 3], 40, P(f, A[30], 0.0006)) },
    { f: HE, cut: true, s: (f) => { const c = carryL(f); return Zm([c.x + 0.5, 1.5, c.z - 4.6], [c.x + 0.1, 1.3, c.z], 36, P(f, HE, 0.0008), { roll: -0.02 }); } },
    { f: NV, cut: true, s: (f) => Zm([0.2, 1.8, -5.6], [0.2, 1.4, 3], 38, P(f, NV, 0.0006)) },
  ],
  31: one(31, [0.2, 1.65, -9.4], [0.2, 1.4, -2], 35, 0.001),
  32: one(32, [-0.2, 1.7, -5.8], [-0.2, 1.45, 2], 36, 0.0006),
  33: one(33, [0, 2.2, -9.8], [0, 2.1, 0], 36, 0.0006),
  34: one(34, [0, 1.7, -6.4], [0, 1.4, 0], 35, 0.0012),
  35: one(35, [0.4, 1.9, -8.8], [0.4, 1.75, 2], 38, 0.0008),
  36: one(36, [0.3, 1.8, -7.2], [0.3, 1.7, 0.5], 36, 0.0006),
  37: one(37, [0.3, 1.75, -6.8], [0.3, 1.6, 0.5], 36, 0.0008),
  38: one(38, [0, 2.4, -7.2], [0, 1.5, 5], 40, 0.0008),
  39: one(39, [0.6, 2.3, -6.8], [0.6, 1.4, 5], 38, 0.0008),
  40: one(40, [0.5, 2.2, -5.6], [0.4, 1.4, 5.2], 36, 0.0006),
  41: one(41, [0.8, 2.3, -7.6], [0.8, 1.6, 5], 38, 0.0006),
  42: one(42, [0.5, 2.2, -6.4], [0.4, 1.5, 5.2], 36, 0.0008),
  43: one(43, [-0.6, 1.5, -1.9], [-0.7, 1.4, 5.2], 36, 0.001),
  44: one(44, [0.6, 2.4, -7.6], [0.6, 1.8, 5], 38, 0.0006),
  45: one(45, [X0, 1.8, -5.8], [X0, 1.7, 3], 36, 0.0008),
  46: one(46, [X0, 1.65, -8.4], [X0, 1.4, -1], 35, 0.0006),
};
const kickWL = (id: number, f: number) => {
  const g = id === 1 ? 0.5 : id === 26 ? 0.8 : id === 28 ? 0.6 : id === 30 && (f < HE || f >= NV) ? 0.4 : 0;
  if (!g) { if (id === 15) { const w = at("copy", "wrestles") + 17, n = f - w; return n >= 0 && n < 7 ? 0.8 * (n % 2 ? -1 : 1) * (1 - n / 7) ** 1.5 : 0; } return 0; }
  let a = 0;
  for (const f0 of GUNS_WL[id === 1 ? 1 : 26]) { const n = f - f0; if (n >= 0 && n < 7) a += g * (n % 2 ? -1 : 1) * (1 - n / 7) ** 1.5; }
  return a;
};
export const camAtWL = (id: number, f: number): Cam => kicked(run(CAMS[id], f), kickWL(id, f));

const DOF_WL: Dof[] = [
  { f: 0, cInf: 0 },
  { f: A[8], cInf: 6, focus: () => [-0.2, 0.6, -0.6] },
  { f: A[10], cInf: 0 },
  { f: A[12], cInf: 5, focus: () => [0, 1.4, 0] },
  { f: A[13], cInf: 0 },
  { f: A[27], cInf: 6, focus: () => [-1.9, 1.5, 1.5] },
  { f: A[28], cInf: 0 },
  { f: HE, cInf: 6, focus: (f) => { const c = carryL(f); return [c.x, 1.4, c.z]; } },
  { f: NV, cInf: 0 },
  { f: A[31], cInf: 6, focus: () => [1.5, 1.5, -4.4] },
  { f: A[32], cInf: 4, focus: () => [1.5, 1.5, 0.4] },
  { f: A[33], cInf: 0 },
  { f: A[43], cInf: 5, focus: () => [0.25, 1.5, 5.2] },
  { f: A[44], cInf: 0 },
  { f: A[46], cInf: 5, focus: () => [X0, 1.5, -3.4] },
];
export const dofAtWL = dofFrom(DOF_WL);
