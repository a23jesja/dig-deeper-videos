// Timeline of the short "The Bear Who Joined the Army" (Wojtek, 1080 x 1920, 50 s): shots timed to the voice
// (voice/wojtek-short/words.json), portrait cameras, lens.
import { Cam, Dof, Key, ShotDef, V3, run, pushK, zoom, kicked, dofFrom, layersFrom } from "./story";

export const TOTAL_W = 1515;
export const FW = {
  enlisted: 68, bear: 88, rank: 116, serial: 134, taste: 170, beer: 184,
  cub0: 207, adopted: 289, orphaned: 316, fed: 358, bottle: 422, named: 447, wojtek: 464,
  grew: 494, wrestled: 549, saluted: 571, marched: 597, legs: 625,
  ship0: 646, sailed: 663, and_ship: 704, not: 725, pets: 738,
  so: 762, made: 781, private: 825, wojtek2: 832, paybook: 869,
  cassino0: 893, monte: 957, unit: 997, carried: 1020, never: 1084, one: 1099,
  promoted: 1123, corporal: 1144, a_bear: 1172, badge: 1236,
  after: 1262, zoo: 1319, old: 1345, visit: 1383, still: 1402, answered: 1408, spoke: 1437, polish: 1465,
};
export const SHOTS_W: ShotDef[] = ([
  [1, "the Polish army enlisted a bear", 0, 106, "camp"],
  [2, "a rank, a serial number, a taste for beer", 106, 207, "camp"],
  [3, "soldiers in Iran adopt an orphaned cub", 207, 355, "camp"],
  [4, "condensed milk from a vodka bottle; named Wojtek", 355, 491, "camp"],
  [5, "he copies the soldiers: wrestles, salutes, marches", 491, 646, "camp"],
  [6, "the ship does not allow pets", 646, 762, "dock"],
  [7, "Private Wojtek, with his own paybook", 762, 893, "dock"],
  [8, "Monte Cassino: he carries crates of shells", 893, 1117, "cassino"],
  [9, "promoted to corporal; the company badge", 1117, 1262, "camp"],
  [10, "Edinburgh Zoo: old soldiers visit", 1262, 1399, "zoo"],
  [11, "he still answered in Polish", 1399, TOTAL_W, "zoo"],
] as [number, string, number, number, ShotDef["zone"]][]).map(([id, name, a, b, zone]) => ({ id, name, a, b, zone, light: "day" as const, sunAz: id === 8 ? 120 : 105 }));
export const XFADE_W: Record<number, number> = { 6: 8, 8: 8, 9: 8, 10: 10 };
export const FLASH_W = 207;
export const layersW = layersFrom(SHOTS_W, XFADE_W);

/** Wojtek walks the crate from the truck to the stack (z of the bear) */
export const carryZ = (f: number) => 9.2 - 8.0 * Math.min(1, Math.max(0, (f - 996) / 88));

const Zm = zoom, P = pushK;
const CAMS: Record<number, Key[]> = {
  1: [
    { f: 0, s: (f) => Zm([0, 3.3, -11.6], [0, 1.2, 1.5], 40, P(f, 0, 0.0012)) },                    // Sir Digsworth low in the frame, the line-up above him
    { f: 62, dur: 30, s: (f) => Zm([0, 1.85, -5.2], [0, 1.5, 0], 36, P(f, 62, 0.0016)) },          // "enlisted a bear": over him, in on the bear
  ],
  2: [{ f: 106, s: (f) => Zm([0, 1.85, -5.2], [0, 1.5, 0], 36, P(f, 62, 0.0016)) }],
  3: [{ f: 207, s: (f) => Zm([0, 1.5, -5.8], [0, 0.9, 0], 38, P(f, 207, 0.0007)) }],
  4: [{ f: 355, s: (f) => Zm([0.2, 1.0, -3.9], [0, 0.62, -0.6], 36, P(f, 355, 0.002), { roll: 0.03 }) }],
  5: [{ f: 491, s: (f) => Zm([0, 1.8, -9.6], [0, 1.15, 0], 38, P(f, 491, 0.0008)) }],
  6: [
    { f: 646, s: (f) => Zm([1.9, 2.6, -11], [2.0, 2.4, 8], 42, P(f, 646, 0.0014)) },
    { f: 698, dur: 26, s: (f) => Zm([1.3, 1.9, -6.4], [1.3, 1.45, 2.6], 42, P(f, 698, 0.0008)) }, // "did not allow pets": the foot of the gangway
  ],
  7: [{ f: 762, s: (f) => Zm([0.42, 1.85, -5.2], [0.42, 1.5, 2.4], 40, P(f, 762, 0.0002)) }],
  8: [
    { f: 893, s: (f) => Zm([0, 2.0, -9.5], [0, 7.5, 60], 46, P(f, 893, 0.0014), { roll: 0.03 }) },
    { f: 990, cut: true, s: (f) => Zm([0.1, 1.9, -5.8], [0.1, 1.7, 3], 45, P(f, 990, 0.0003)) },  // "he carried crates"
  ],
  9: [{ f: 1117, s: (f) => Zm([0, 2.1, -9.4], [0, 2.0, 0], 38, P(f, 1117, 0.0008)) }],
  10: [{ f: 1262, s: (f) => Zm([0, 2.7, -7.6], [0, 1.25, 5], 40, P(f, 1262, 0.0014)) }],
  11: [
    { f: 1399, s: (f) => Zm([0, 2.7, -7.6], [0, 1.25, 5], 40, P(f, 1262, 0.0014)) },
    { f: 1430, dur: 30, s: (f) => Zm([0, 2.6, -7.1], [0, 1.3, 5.2], 38, P(f, 1430, 0.0006)) },    // he answers
  ],
};
const KICKS: [number, number][] = [[116, 0.4], [134, 0.4], [512, 0.6], [560, 0.9], [825, 0.5], [905, 0.9], [935, 0.9], [965, 0.9], [1088, 0.8], [1144, 0.6]];
const kickW = (f: number) => { let a = 0; for (const [f0, g] of KICKS) { const n = f - f0; if (n >= 0 && n < 7) a += g * (n % 2 ? -1 : 1) * (1 - n / 7) ** 1.5; } return a; };
export const camAtW = (id: number, f: number): Cam => kicked(run(CAMS[id], f), kickW(f));

const DOF_W: Dof[] = [
  { f: 0, cInf: 8, focus: () => [0, 1.5, -6.6] },
  { f: 62, dur: 30, cInf: 9, focus: () => [0, 1.6, 0] },
  { f: 207, cInf: 7, focus: () => [0, 0.6, -0.6] },
  { f: 355, cInf: 10, focus: () => [0, 0.6, -0.6] },
  { f: 491, cInf: 0 },
  { f: 698, dur: 26, cInf: 5, focus: () => [1.3, 1.4, 2.5] },
  { f: 762, cInf: 5, focus: () => [0.6, 1.5, 2.4] },
  { f: 893, cInf: 0 },
  { f: 990, cInf: 4, focus: (f): V3 => [0.5, 1.4, Math.max(1.2, carryZ(f))] },
  { f: 1117, cInf: 5, focus: () => [0, 1.6, 0] },
  { f: 1262, cInf: 4, focus: () => [0, 1.2, 5.2] },
  { f: 1430, dur: 30, cInf: 4, focus: () => [0, 1.3, 5.2] },
];
export const dofAtW = dofFrom(DOF_W);
