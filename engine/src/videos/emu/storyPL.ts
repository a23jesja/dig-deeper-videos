// Timeline of the long film "The Pig War" (1920 x 1080, 3 min 3 s). Every shot starts on a word of the voice
// (voice/pig-long/words.json -> wordsPL.json).
import { Cam, Dof, Key, ShotDef, V3, Zone, run, pushK, zoom, kicked, dofFrom, layersFrom } from "./story";
import { SHORE, CAMPS, HX } from "./storyP";
import wordsJson from "./wordsPL.json";

type Wd = { w: string; a: number; b: number; line: string };
const WORDS = wordsJson as Wd[];
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
export const atL = (line: string, word?: string, n = 0): number => {
  const L = WORDS.filter((w) => w.line === line);
  if (!L.length) throw new Error(`no line ${line}`);
  if (!word) return Math.round(L[0].a * 30);
  const m = L.filter((w) => norm(w.w) === norm(word));
  if (!m[n]) throw new Error(`no word "${word}" (${n}) in line ${line}`);
  return Math.round(m[n].a * 30);
};
const at = atL;
export const TOTAL_PL = 5490;
/** the sheep farm (in front of the farmhouse) and the garden in zone "isle" */
export const FARMX = -9, GX = 2.5;

const DEFS: [number, string, number, Zone][] = [
  [1, "hook: warships, cannons, thousands of men", 0, "isle"],
  [2, "ready to go to war", at("hook2") - 4, "isle"],
  [3, "over a pig", at("hook3") - 4, "isle"],
  [4, "I'm Sir Digsworth: the Pig War", at("intro") - 5, "isle"],
  [5, "the treaty of 1846", at("treaty") - 5, "office"],
  [6, "two channels, and the islands between", at("two") - 4, "office"],
  [7, "both say the islands are theirs", at("both") - 4, "isle"],
  [8, "the Hudson's Bay sheep farm; Griffin's pigs", at("sheep") - 5, "isle"],
  [9, "American settlers; Cutlar plants potatoes", at("settlers") - 4, "isle"],
  [10, "15 June 1859: a pig in the potatoes", at("morning") - 4, "isle"],
  [11, "he shoots it", at("bang") - 3, "isle"],
  [12, "the pig is Griffin's", at("owner") - 3, "isle"],
  [13, "ten dollars; a hundred", at("offer") - 3, "isle"],
  [14, "keep your potatoes out of my pig", at("quote") - 4, "isle"],
  [15, "arrest; the settlers ask for the army", at("arrest") - 4, "isle"],
  [16, "Captain Pickett and 66 soldiers", at("pickett") - 5, "isle"],
  [17, "a Bunker Hill of it", at("bunker") - 3, "isle"],
  [18, "three warships", at("ships") - 4, "isle"],
  [19, "461 Americans, 14 cannons; 5 warships, 70 guns, 2,140 men", at("grow") - 4, "isle"],
  [20, "the fort; Henry Robert", at("fort") - 4, "isle"],
  [21, "the governor's order", at("order") - 5, "dock"],
  [22, "Admiral Baynes refuses", at("baynes") - 3, "dock"],
  [23, "Buchanan sends General Scott", at("scott") - 5, "office"],
  [24, "the deal: no more than 100 men each", at("deal") - 4, "office"],
  [25, "British camp north, American camp south", at("camps") - 4, "office"],
  [26, "for 12 years", at("twelve") - 4, "isle"],
  [27, "holidays and sports", at("friends") - 3, "isle"],
  [28, "the biggest threat: alcohol", at("alcohol") - 4, "isle"],
  [29, "the referee: the German emperor", at("kaiser") - 5, "office"],
  [30, "October 1872: the islands are American", at("verdict") - 4, "office"],
  [31, "the British marines sail home", at("leave") - 5, "isle"],
  [32, "13 years, one pig", at("count") - 4, "isle"],
  [33, "the Union Jack still flies", at("flag") - 5, "isle"],
  [34, "it started in a potato patch", at("end") - 5, "isle"],
  [35, "outro", at("outro") - 4, "isle"],
];
export const SHOTS_PL: ShotDef[] = DEFS.map(([id, name, a, zone], i) => ({ id, name, a, b: i + 1 < DEFS.length ? DEFS[i + 1][2] : TOTAL_PL, zone, light: "day" as const, sunAz: zone === "office" ? 150 : 105 }));
export const APL: number[] = [0, ...SHOTS_PL.map((s) => s.a)];
export const XFADE_PL: Record<number, number> = { 5: 8, 7: 8, 8: 8, 16: 8, 20: 8, 21: 8, 23: 8, 26: 10, 29: 8, 31: 8, 33: 10, 34: 8 };
export const FLASH_PL = APL[4];
export const layersPL = layersFrom(SHOTS_PL, XFADE_PL);

export const BANG_L = at("bang", "shoots") + 3, RACE_L = at("friends", "They") - 3, GROW2 = at("grow", "facing") - 4;
const Zm = zoom, P = pushK;
const one = (id: number, pos: V3, look: V3, fov: number, rate = 0.0006, rest: Partial<Cam> = {}): Key[] => [{ f: APL[id], s: (f) => Zm(pos, look, fov, P(f, APL[id], rate), rest) }];
const CAMS: Record<number, Key[]> = {
  1: one(1, [SHORE, 1.9, -7], [SHORE, 1.5, 20], 38, 0.0005),
  2: one(2, [HX, 1.8, -7.4], [HX, 1.6, 1.8], 36, 0.0015),
  3: one(3, [HX, 1.0, -3.6], [HX, 0.55, 1.6], 36, 0.002),
  4: one(4, [HX, 1.7, -9.2], [HX, 1.4, -2], 35, 0.001),
  5: one(5, [1.6, 1.9, -5.2], [1.6, 1.95, 2.5], 34, 0.0006),
  6: one(6, [3.4, 2.55, -0.4], [3.4, 2.55, 3.4], 34, 0.0004),
  7: one(7, [HX, 1.9, -7.6], [HX, 1.75, 1.8], 36, 0.0008),
  8: [
    { f: APL[8], s: (f) => Zm([FARMX, 2.0, -3.6], [FARMX, 1.9, 8], 38, P(f, APL[8], 0.0005)) },
    { f: at("sheep", "lets") - 4, dur: 26, s: (f) => Zm([FARMX, 1.6, -2.4], [FARMX, 1.0, 5], 38, P(f, at("sheep", "lets") - 4, 0.0004)) },
  ],
  9: one(9, [GX, 2.0, -7.6], [GX, 1.4, 2], 38, 0.0005),
  10: one(10, [GX - 0.2, 1.9, -5.6], [GX - 0.2, 1.0, 1.6], 38, 0.0006),
  11: one(11, [GX - 0.2, 1.5, -4.2], [GX - 0.2, 0.9, 1.5], 38, 0.001, { roll: 0.02 }),
  12: one(12, [GX - 0.2, 1.7, -5.2], [GX - 0.2, 1.2, 1.5], 38, 0.0008),
  13: one(13, [HX, 1.9, -7.2], [HX, 1.7, 0], 36, 0.0006),
  14: one(14, [HX, 1.9, -6.2], [HX, 1.9, 0], 36, 0.0004),
  15: [
    { f: APL[15], s: (f) => Zm([HX, 1.8, -7.0], [HX, 1.6, 0], 36, P(f, APL[15], 0.0006)) },
    { f: at("arrest", "So") - 3, cut: true, s: (f) => Zm([GX + 1.2, 1.9, -7.2], [GX + 1.2, 1.9, 0.5], 36, P(f, at("arrest", "So") - 3, 0.0006)) },
  ],
  16: one(16, [SHORE, 3.8, -9.5], [SHORE, 1.0, 5], 38, 0.0004),
  17: one(17, [SHORE, 1.8, -8.6], [SHORE, 1.9, -4], 34, 0.0012),
  18: one(18, [SHORE, 2.6, -6], [SHORE, 2.6, 30], 38, 0.0006),
  19: one(19, [SHORE, 3.6, -8], [SHORE, 0.41, 20], 30, 0.0002),
  20: one(20, [SHORE + 30, 1.9, -8.2], [SHORE + 30, 1.6, 0.5], 36, 0.0005),
  21: one(21, [8, 4.9, 1.4], [8, 5.0, 9.2], 36, 0.0006),
  22: one(22, [8.4, 4.9, 2.6], [8.4, 5.1, 9.2], 34, 0.0006),
  23: one(23, [-0.6, 1.9, -5.2], [-0.6, 1.95, 1.5], 34, 0.0006),
  24: one(24, [0.65, 1.9, -4.8], [0.65, 2.0, 1.5], 34, 0.0006),
  25: one(25, [3.4, 2.55, -0.4], [3.4, 2.55, 3.4], 34, 0.0004),
  26: one(26, [CAMPS, 2.0, -7.6], [CAMPS, 1.9, 3], 38, 0.0006),
  27: [
    { f: APL[27], s: (f) => Zm([CAMPS, 1.8, -6.4], [CAMPS, 1.6, 0], 36, P(f, APL[27], 0.0006)) },
    { f: RACE_L, cut: true, s: (f) => Zm([CAMPS, 1.7, -6.6], [CAMPS, 1.5, 2.5], 38, P(f, RACE_L, 0.0005), { roll: -0.02 }) },
  ],
  28: one(28, [CAMPS, 1.8, -7.2], [CAMPS, 1.5, 0], 36, 0.0006),
  29: one(29, [-2.2, 1.9, -4.6], [-2.2, 2.05, 1.8], 36, 0.0006),
  30: one(30, [3.4, 2.55, -0.4], [3.4, 2.55, 3.4], 34, 0.0004),
  31: one(31, [SHORE, 2.4, -7], [SHORE - 2, 2.4, 30], 38, 0.0005),
  32: one(32, [HX, 1.7, -7.4], [HX, 1.5, 1.5], 36, 0.0008),
  33: one(33, [CAMPS, 2.6, -9.2], [CAMPS, 2.8, 2.5], 38, 0.0005),
  34: one(34, [GX - 0.6, 1.7, -7.4], [GX - 0.6, 1.3, 0.5], 36, 0.0008),
  35: one(35, [GX - 0.6, 1.65, -6.6], [GX - 0.6, 1.4, -1], 35, 0.0006),
};
const kickPL = (id: number, f: number) => { const n = f - BANG_L; return id === 11 && n >= 0 && n < 7 ? (n % 2 ? -1 : 1) * (1 - n / 7) ** 1.5 : 0; };
export const camAtPL = (id: number, f: number): Cam => kicked(run(CAMS[id], f), kickPL(id, f));

const DOF_PL: Dof[] = [
  { f: 0, cInf: 0 },
  { f: APL[3], cInf: 6, focus: () => [HX, 0.6, 1.6] },
  { f: APL[4], cInf: 0 },
  { f: APL[17], cInf: 6, focus: () => [SHORE, 1.6, -4] },
  { f: APL[18], cInf: 0 },
];
export const dofAtPL = dofFrom(DOF_PL);
