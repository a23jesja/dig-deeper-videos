// Timeline of the short "The Pig War" (1080 x 1920, 49 s). Every shot starts on a word of the voice
// (voice/pig-short/words.json -> wordsP.json). Portrait: the near subject sits low in the frame, far ones above it.
import { Cam, Dof, Key, ShotDef, V3, Zone, run, pushK, zoom, kicked, dofFrom, layersFrom } from "./story";
import wordsJson from "./wordsP.json";

type Wd = { w: string; a: number; b: number; line: string };
const WORDS = wordsJson as Wd[];
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
export const atP = (line: string, word?: string, n = 0): number => {
  const L = WORDS.filter((w) => w.line === line);
  if (!L.length) throw new Error(`no line ${line}`);
  if (!word) return Math.round(L[0].a * 30);
  const m = L.filter((w) => norm(w.w) === norm(word));
  if (!m[n]) throw new Error(`no word "${word}" (${n}) in line ${line}`);
  return Math.round(m[n].a * 30);
};
const at = atP;
export const TOTAL_P = 1480;
/** x of the shore (the strait beyond it) and of the two camps in zone "isle" */
export const SHORE = 100, CAMPS = -100, HX = -24;

const DEFS: [number, string, number, Zone][] = [
  [1, "hook: almost a war over a pig", 0, "isle"],
  [2, "total casualties: one, the pig", at("hook2") - 4, "isle"],
  [3, "both countries claim the island", at("island") - 5, "isle"],
  [4, "the farmer, the pig, the potatoes", at("shot") - 4, "isle"],
  [5, "ten dollars; a hundred", at("money") - 4, "isle"],
  [6, "soldiers; warships", at("troops") - 4, "isle"],
  [7, "461 Americans, 14 cannons, 5 warships, 2,140 men", at("peak") - 3, "isle"],
  [8, "the admiral refuses", at("admiral") - 4, "dock"],
  [9, "they share the island for 12 years", at("share") - 4, "isle"],
  [10, "holidays and sports days", at("sports") - 3, "isle"],
  [11, "the German emperor decides", at("kaiser") - 4, "office"],
  [12, "nobody apologised to the pig", at("end") - 5, "isle"],
];
export const SHOTS_P: ShotDef[] = DEFS.map(([id, name, a, zone], i) => ({ id, name, a, b: i + 1 < DEFS.length ? DEFS[i + 1][2] : TOTAL_P, zone, light: "day" as const, sunAz: zone === "office" ? 150 : 105 }));
export const AP: number[] = [0, ...SHOTS_P.map((s) => s.a)];
export const XFADE_P: Record<number, number> = { 6: 8, 8: 8, 9: 8, 11: 8, 12: 10 };
export const FLASH_P = AP[3];
export const layersP = layersFrom(SHOTS_P, XFADE_P);

export const BANG = at("shot", "shot") + 2, CUT1 = at("hook1", "over") - 3, RACE = at("sports", "and") - 3;
const Zm = zoom, P = pushK;
const one = (id: number, pos: V3, look: V3, fov: number, rate = 0.0008, rest: Partial<Cam> = {}): Key[] => [{ f: AP[id], s: (f) => Zm(pos, look, fov, P(f, AP[id], rate), rest) }];
const CAMS: Record<number, Key[]> = {
  1: [
    { f: 0, s: (f) => Zm([HX, 3.3, -11.6], [HX, 1.2, 2.0], 40, P(f, 0, 0.0012)) },                         // Sir Digsworth low in the frame, the stand-off above him
    { f: CUT1, cut: true, s: (f) => Zm([HX, 1.9, -7.6], [HX, 0.9, 1.8], 38, P(f, CUT1, 0.0012)) },   // "over a pig"
  ],
  2: one(2, [HX, 0.9, -3.4], [HX, 0.45, 1.6], 36, 0.0012),
  3: one(3, [HX, 1.9, -7.8], [HX, 1.75, 0.5], 40, 0.0008),
  4: [
    { f: AP[4], s: (f) => Zm([2.3, 1.9, -5.2], [2.3, 0.7, 1.6], 44, P(f, AP[4], 0.0003)) },
  ],
  5: one(5, [HX, 1.9, -7.2], [HX, 1.65, 0], 38, 0.0006),
  6: one(6, [SHORE, 3.0, -9], [SHORE, 2.0, 20], 42, 0.0004),
  7: one(7, [SHORE, 5.0, -10], [SHORE, 1.53, 20], 36, 0.0002),
  8: one(8, [8, 4.75, 2.2], [8, 5.0, 9.2], 36, 0.0008),
  9: one(9, [CAMPS, 2.4, -8.5], [CAMPS, 2.0, 3], 40, 0.0006),
  10: [
    { f: AP[10], s: (f) => Zm([CAMPS, 1.9, -7.0], [CAMPS, 1.6, 1], 40, P(f, AP[10], 0.0006)) },
    { f: RACE, cut: true, s: (f) => Zm([CAMPS - 0.3, 1.6, -6.4], [CAMPS - 0.3, 1.4, 2.5], 40, P(f, RACE, 0.0006), { roll: -0.02 }) },
  ],
  11: one(11, [-2.2, 1.9, -3.6], [-2.2, 2.05, 1.8], 38, 0.0006),
  12: one(12, [0, 1.6, -6.2], [0, 1.25, 0], 38, 0.0012),
};
const KICKS: [number, number][] = [[BANG, 1.0]];
const kickP = (f: number) => { let a = 0; for (const [f0, g] of KICKS) { const n = f - f0; if (n >= 0 && n < 7) a += g * (n % 2 ? -1 : 1) * (1 - n / 7) ** 1.5; } return a; };
export const camAtP = (id: number, f: number): Cam => kicked(run(CAMS[id], f), kickP(f));

const DOF_P: Dof[] = [
  { f: 0, cInf: 6, focus: () => [HX, 1.5, -6.6] },
  { f: CUT1, cInf: 6, focus: () => [HX, 0.6, 1.6] },
  { f: AP[3], cInf: 0 },
  { f: AP[5], cInf: 0 },
  { f: AP[8], cInf: 5, focus: () => [8, 5, 9.2] },
  { f: AP[9], cInf: 0 },
];
export const dofAtP = dofFrom(DOF_P);
