// Timeline of the long film "The Army That Lost a War to Birds" (1920 x 1080, 3 min 5 s): shots timed to the voice
// (voice/emu-long/words.json), landscape cameras, lens. Many shots borrow the short film's staging (scenes.ts) through
// a frame map: fsOf(id, f) = the short's frame that plays at long frame f.
import { Cam, Dof, Key, ShotDef, V3, run, pushK, dolly, zoom, add, kicked, kickAt, dofFrom, layersFrom, truckX, runnersX, DAM_GUN, HOME_CAM, HOME_DIR, FARMER_AT, SIR_END } from "./story";

export const TOTAL_L = 5640;
export const SHOTS_L: ShotDef[] = ([
  [1, "hook: soldiers with machine guns against an army of birds", 0, 187, "camp", "day"],
  [2, "the birds won", 187, 227, "camp", "day"],
  [3, "I'm Sir Digsworth", 227, 338, "camp", "day"],
  [4, "soldiers are given land to grow wheat", 338, 549, "farm", "day"],
  [5, "the Depression: wheat prices fall, no help", 549, 730, "farm", "day"],
  [6, "and then things get worse", 730, 785, "farm", "day"],
  [7, "twenty thousand emus arrive", 785, 855, "camp", "day"],
  [8, "emus walk from the inland to the coast", 855, 968, "plain", "day"],
  [9, "they find fields of wheat", 968, 1087, "farm", "day"],
  [10, "they eat the crops", 1087, 1122, "farm", "day"],
  [11, "they trample what they don't eat", 1122, 1172, "farm", "day"],
  [12, "holes in the fences let the rabbits in", 1172, 1284, "farm", "day"],
  [13, "the farmers are old soldiers", 1284, 1345, "farm", "day"],
  [14, "they ask for machine guns", 1345, 1432, "office", "day"],
  [15, "the minister says yes: target practice", 1432, 1608, "office", "day"],
  [16, "one major, two soldiers, two guns, 10,000 bullets", 1608, 1774, "camp", "day"],
  [17, "a film cameraman", 1774, 1842, "camp", "day"],
  [18, "2 November: about fifty emus, out of range", 1842, 2023, "plain", "day"],
  [19, "the farmers herd them toward the guns", 2023, 2102, "plain", "day"],
  [20, "the emus split into small groups and run", 2102, 2188, "plain", "day"],
  [21, "an ambush at a dam", 2188, 2292, "dam", "day"],
  [22, "more than a thousand emus walk toward the gun", 2292, 2391, "dam", "day"],
  [23, "the soldiers wait, and wait", 2391, 2450, "dam", "day"],
  [24, "and open fire", 2450, 2485, "dam", "day"],
  [25, "the gun jams", 2485, 2529, "dam", "day"],
  [26, "twelve birds down, a thousand gone", 2529, 2610, "dam", "day"],
  [27, "every group has a leader", 2610, 2901, "plain", "day"],
  [28, "guerrilla tactics", 2901, 3061, "dam", "day"],
  [29, "a gun on a truck", 3061, 3162, "track", "day"],
  [30, "the truck cannot catch the birds", 3162, 3338, "track", "day"],
  [31, "six days, 2,500 bullets", 3338, 3463, "camp", "golden"],
  [32, "nobody is sure; one count says fifty", 3463, 3572, "camp", "golden"],
  [33, "no casualties", 3572, 3719, "camp", "day"],
  [34, "8 November: called home", 3719, 3819, "camp", "golden"],
  [35, "emus face machine guns like tanks", 3819, 3966, "camp", "day"],
  [36, "parliament: will they get a medal?", 3966, 4103, "office", "day"],
  [37, "the emus are still eating", 4103, 4162, "farm", "day"],
  [38, "the army comes back", 4162, 4242, "farm", "day"],
  [39, "this time it goes better", 4242, 4293, "plain", "day"],
  [40, "about a hundred emus a week", 4293, 4390, "camp", "day"],
  [41, "the major is called home for good", 4390, 4461, "camp", "day"],
  [42, "final score: 986 emus, 9,860 bullets", 4461, 4684, "camp", "day"],
  [43, "ten bullets for every bird", 4684, 4777, "camp", "day"],
  [44, "1934, 1943, 1948", 4777, 4972, "office", "day"],
  [45, "the government says no", 4972, 5042, "office", "day"],
  [46, "better fences and a reward", 5042, 5194, "farm", "day"],
  [47, "more than 57,000 rewards", 5194, 5368, "farm", "day"],
  [48, "they're still there", 5368, TOTAL_L, "farm", "golden"],
] as [number, string, number, number, ShotDef["zone"], ShotDef["light"]][]).map(([id, name, a, b, zone, light]) => ({
  id, name, a, b, zone, light,
  ...(light === "day" ? { sunAz: zone === "office" ? 150 : 105 } : id === 31 || id === 32 ? { sunAz: 80, sunEl: 13 } : id === 34 ? { sunAz: 5, sunEl: 8 } : { sunAz: 28, sunEl: 9 }),
}));
export const XFADE_L: Record<number, number> = { 3: 8, 4: 10, 8: 10, 14: 8, 16: 8, 18: 8, 21: 8, 27: 8, 29: 8, 31: 10, 33: 8, 34: 10, 35: 10, 36: 8, 37: 8, 40: 8, 44: 8, 46: 8, 48: 10 };
export const FLASH_L = 227;
export const layersL = layersFrom(SHOTS_L, XFADE_L);

/** the short film's frame that a borrowed shot plays at long frame f (integers; -1 = the shot is not borrowed) */
export const fsOf = (id: number, f: number): number => {
  const r = Math.round;
  switch (id) {
    case 7: return r(95 + (f - 785) * 0.95);
    case 9: return r(205 + (f - 968) * 0.7);
    case 10: return r(359 + (f - 1087));
    case 11: return r(300 + (f - 1122) * 0.8);
    case 16: return f - 1204;
    case 17: return 570;
    case 20: return r(656 + (f - 2102) * 0.767);
    case 21: return r(771 + (f - 2188) * 0.69);
    case 22: return r(843 + (f - 2292) * 0.6);
    case 24: return r(913 + (f - 2450) * 0.6);
    case 25: return r(934 + (f - 2485) * 0.84);
    case 29: return Math.max(971, f - 2134);
    case 30: return r(f < 3223 ? 1030 + (f - 3162) * 0.869 : f < 3264 ? 1083 + (f - 3223) * 1.02 : 1125 + (f - 3264) * 0.743);
    case 31: return Math.min(1261, 1180 + (f - 3338));
    case 38: return r(1307 + (f - 4162) * 0.75);
    case 39: return 624 + ((f - 4242) % 30);
    case 42: return f < 4590 ? f - 3100 : f - 3107;
    case 48: return Math.min(1700, f - 3814);
    default: return -1;
  }
};
/** which short-film shot a long shot borrows */
export const BORROW: Record<number, number> = { 7: 2, 9: 4, 10: 4, 11: 4, 16: 5, 17: 5, 20: 7, 21: 8, 22: 8, 24: 8, 25: 9, 29: 10, 30: 11, 31: 12, 38: 13, 39: 7, 42: 14, 48: 15 };

const Zm = zoom, P = pushK;
const gz = DAM_GUN[2], gy = DAM_GUN[1];
const CAMS: Record<number, Key[]> = {
  1: [
    { f: 0, s: (f) => dolly([0, 2.2, -10.5], [0, 2.3, 4], P(f, 0, 0.0016), { fov: 40 }) },
    { f: 116, cut: true, s: (f) => dolly([0, 3.0, 3.5], [0, 4.6, 74], P(f, 116, 0.002, 0.006, 40), { fov: 47, roll: 0.03 }) }, // "to fight an army of birds"
  ],
  2: [{ f: 187, s: (f) => Zm([0.4, 1.45, -7.4], [0.4, 1.2, 0], 38, P(f, 187, 0.0025)) }],
  3: [{ f: 227, s: (f) => Zm([0.7, 1.5, -8.6], [0.25, 1.3, -4.5], 34, P(f, 227, 0.0012)) }],
  4: [
    { f: 338, s: (f) => Zm([0, 1.6, -5.4], [0, 1.35, 3], 40, P(f, 338, 0.0012)) },
    { f: 496, dur: 36, s: (f) => Zm([0, 3.4, -8.2], [0, 1.2, 14], 42, P(f, 496, 0.0008)) }, // "to grow wheat": up and over to the field
  ],
  5: [
    { f: 549, s: (f) => Zm([-0.5, 1.9, -7.0], [-0.5, 1.7, 2.4], 40, P(f, 549, 0.0012)) },
    { f: 600, dur: 24, s: (f) => Zm([1.2, 2.2, -4.6], [1.8, 2.3, 2.6], 38, P(f, 600, 0.001)) },   // "wheat prices fall": the board
    { f: 646, dur: 26, s: (f) => Zm([-0.5, 1.9, -7.0], [-0.5, 1.7, 2.4], 40, P(f, 646, 0.0012)) },
  ],
  6: [{ f: 730, s: (f) => Zm([-1.6, 1.5, -1.6], [-1.9, 1.42, 2.2], 34, P(f, 730, 0.003)) }],
  7: [{ f: 785, s: (f) => dolly([0, 3.0, 3.5], [0, 4.6, 74], P(f, 785, 0.002, 0.006, 40), { fov: 47, roll: 0.03 }) }],
  8: [{ f: 855, s: (f) => { const x = 36 + 0.035 * (f - 855); return Zm([x, 11, -8], [x + 50, 0.5, 14], 46, P(f, 855, 0.0008)); } }],
  9: [{ f: 968, s: (f) => Zm([-1.0, 3.2, -6.5], [1.2, 1.5, 24], 40, P(f, 968, 0.0014)) }],
  10: [{ f: 1087, s: (f) => Zm([-3.6, 1.2, 6.3], [-0.9, 0.95, 10.8], 36, P(f, 1087, 0.002), { roll: -0.03 }) }],
  11: [{ f: 1122, s: (f) => Zm([FARMER_AT[0] + 2.6, 1.6, -3.4], [0.4, 1.3, 6], 40, P(f, 1122, 0.002)) }],
  12: [{ f: 1172, s: (f) => Zm([11.6, 1.5, -5.8], [11.6, 0.9, 4], 38, P(f, 1172, 0.0012)) }],
  13: [{ f: 1284, s: (f) => Zm([0, 1.6, -5.4], [0, 1.35, 3], 40, P(f, 1284, 0.002)) }],
  14: [{ f: 1345, s: (f) => Zm([0.6, 1.8, -7.6], [0.6, 1.75, 1.5], 33, P(f, 1345, 0.0012)) }],
  15: [
    { f: 1432, s: (f) => Zm([0.6, 1.8, -7.6], [0.6, 1.75, 1.5], 33, P(f, 1345, 0.0012)) },
    { f: 1496, dur: 26, s: (f) => Zm([-1.5, 1.75, -4.4], [-2.2, 1.85, 2.2], 38, P(f, 1496, 0.001)) }, // the minister, close
  ],
  16: [
    { f: 1608, s: (f) => Zm([0, 1.6, -6.2], [0, 1.3, 0], 38, P(f, 1608, 0.001)) },
    { f: 1656, dur: 22, s: (f) => Zm([0, 1.9, -9.6], [0, 1.1, -0.8], 38, P(f, 1656, 0.0008)) },
  ],
  17: [{ f: 1774, s: (f) => Zm([0.9, 1.9, -9.9], [0.9, 1.1, -0.8], 40, P(f, 1774, 0.001)) }],
  18: [
    { f: 1842, s: (f) => Zm([-0.6, 2.4, -8.6], [-1.0, 1.1, 8], 38, P(f, 1842, 0.001)) },
    { f: 1899, cut: true, s: (f) => Zm([0, 2.6, -3], [0, 1.0, 64], 11, P(f, 1899, 0.0012)) },      // "about fifty emus" (long lens)
    { f: 1957, cut: true, s: (f) => Zm([3.6, 1.5, -4.4], [0.2, 1.15, 0.2], 40, P(f, 1957, 0.0015)) }, // the guns fire
    { f: 1988, cut: true, s: (f) => Zm([0, 2.6, -3], [0, 1.0, 58], 14, P(f, 1988, 0.001)) },       // "just out of range"
  ],
  19: [{ f: 2023, s: (f) => Zm([0, 8.5, -3], [0, 1.2, 64], 15, P(f, 2023, 0.001)) }],
  20: [{ f: 2102, s: (f) => dolly([0, 9.5, 18.5], [0, 0.6, 34], P(f, 2102, 0.0006), { fov: 46 }) }],
  21: [{ f: 2188, s: (f) => Zm([0.3, 2.55, -2.8], [0, 1.25, 9], 40, P(f, 2188, 0.0015)) }],
  22: [{ f: 2292, s: (f) => Zm([0.62, 2.42, gz - 3.3], [-0.35, 1.35, 18], 34, P(f, 2292, 0.001)) }],
  23: [{ f: 2391, s: (f) => Zm([0.3, gy + 0.95, gz + 4.6], [0, gy + 0.72, gz - 0.7], 30, P(f, 2391, 0.003)) }],
  24: [{ f: 2450, s: (f) => Zm([0.62, 2.42, gz - 3.3], [-0.35, 1.35, 18], 32, P(f, 2450, 0.001)) }],
  25: [{ f: 2485, s: (f) => dolly([2.6, gy + 0.95, gz + 3.6], [0.05, gy + 0.6, gz + 0.2], P(f, 2485, 0.0024), { fov: 42, roll: 0.03 }) }],
  26: [
    { f: 2529, s: (f) => Zm([0, 4.6, 9.5], [0, 0.3, 21], 44, P(f, 2529, 0.0015)) },
    { f: 2565, dur: 26, s: (f) => Zm([0, 4.2, 9.5], [0, 2.4, 60], 42, P(f, 2565, 0.001)) },      // "a thousand gone"
  ],
  27: [
    { f: 2610, s: (f) => Zm([0, 1.6, -3.0], [0, 1.4, 4], 38, P(f, 2610, 0.0015)) },
    { f: 2668, cut: true, s: (f) => Zm([0, 1.9, 15], [0, 1.2, 29], 40, P(f, 2668, 0.0012)) },     // "every group ... a leader"
    { f: 2740, dur: 26, s: (f) => Zm([1.6, 1.7, 24.6], [0.25, 1.3, 31], 36, P(f, 2740, 0.001)) }, // "a big bird, six feet tall"
    { f: 2862, cut: true, s: (f) => Zm([0, 1.9, 15], [0, 1.2, 29], 40, P(f, 2862, 0.0012)) },     // "warns the others"
  ],
  28: [{ f: 2901, s: (f) => Zm([0.2, 1.9, -3.4], [0, 1.55, 6], 40, P(f, 2901, 0.0012)) }],
  29: [{ f: 3061, s: (f) => dolly([8.6, 2.1, 7.6], [0.1, 1.45, 0], P(f, 3061, 0.0012), { fov: 40 }) }],
  30: [
    { f: 3162, s: (f) => { const x = runnersX(fsOf(30, f)); return { pos: [x + 6.5, 3.2, 0.7] as V3, look: [x - 8, 1.05, 0.1] as V3, fov: 42, roll: 0.02 }; } },
    { f: 3223, cut: true, s: (f) => { const x = truckX(fsOf(30, f)); return dolly([x + 8.2, 1.6, 7.0], [x + 0.1, 1.5, 0], P(f, 3223, 0.0015), { fov: 40, roll: -0.03 }); } },
    { f: 3264, cut: true, s: (f) => { const x = truckX(fsOf(30, f)); return Zm([x + 3.4, 2.95, 3.5], [x - 0.95, 2.3, 0], 36, P(f, 3264, 0.0016), { roll: 0.03 }); } },
  ],
  31: [{ f: 3338, s: (f) => dolly([1.55, 0.62, -5.3], [0.1, 0.42, -2.7], P(f, 3338, 0.0014), { fov: 40, roll: -0.03 }) }],
  32: [
    { f: 3463, s: (f) => Zm([1.0, 1.9, -8.4], [1.0, 1.7, 0], 38, P(f, 3463, 0.001)) },
  ],
  33: [{ f: 3572, s: (f) => Zm([0, 1.6, -6.6], [0, 1.35, 0], 36, P(f, 3572, 0.0012)) }],
  34: [{ f: 3719, s: (f) => Zm([HOME_CAM[0], 1.7, HOME_CAM[2]], add([HOME_CAM[0], 1.7, HOME_CAM[2]], [HOME_DIR[0] * 10, -0.25, HOME_DIR[1] * 10]), 40, P(f, 3719, 0.0012)) }],
  35: [{ f: 3819, s: (f) => Zm([-0.4, 1.85, -6.6], [-0.4, 1.9, -1], 38, P(f, 3819, 0.0012)) }],
  36: [{ f: 3966, s: (f) => Zm([0, 1.95, -7.4], [0, 1.95, 1], 34, P(f, 3966, 0.0012)) }],
  37: [{ f: 4103, s: (f) => Zm([0, 2.4, -4.5], [0.5, 1.2, 14], 40, P(f, 4103, 0.0015)) }],
  38: [{ f: 4162, s: (f) => { const x = -2.0 + 2.2 * ((fsOf(38, f) - 1307) / 60); return Zm([x, 1.5, -5.6], [x, 1.25, 2.6], 38, P(f, 4162, 0.0008)); } }],
  39: [{ f: 4242, s: (f) => Zm([5.4, 1.5, -4.2], [0.15, 1.12, 0.1], 40, P(f, 4242, 0.0015), { roll: -0.03 }) }],
  40: [{ f: 4293, s: (f) => Zm([0.5, 2.2, -7.4], [0.5, 2.1, -0.6], 36, P(f, 4293, 0.001)) }],
  41: [{ f: 4390, s: (f) => Zm([0.5, 1.9, -7.2], [0.5, 1.7, -0.9], 36, P(f, 4390, 0.0012)) }],
  42: [
    { f: 4461, s: (f) => Zm([0.5, 2.2, -7.4], [0.5, 2.1, -0.6], 36, P(f, 4461, 0.0008)) },
    { f: 4590, cut: true, s: (f) => Zm([0.2, 2.6, -10.8], [-0.2, 1.55, -1.4], 40, P(f, 4590, 0.0012), { roll: -0.02 }) },
  ],
  43: [{ f: 4684, s: (f) => Zm([-0.2, 1.3, -6.8], [-0.2, 0.95, -1.5], 36, P(f, 4684, 0.0012)) }],
  44: [
    { f: 4777, s: (f) => Zm([0.6, 1.9, -7.6], [0.6, 1.95, 1.5], 34, P(f, 4777, 0.0008)) },
    { f: 4822, dur: 26, s: (f) => Zm([0.9, 2.3, -4.6], [0.7, 2.35, 3.4], 34, P(f, 4822, 0.0006)) }, // the years go up on the board
  ],
  45: [{ f: 4972, s: (f) => Zm([0.9, 2.3, -4.6], [0.7, 2.35, 3.4], 34, P(f, 4822, 0.0006)) }],
  46: [
    { f: 5042, s: (f) => Zm([0, 2.0, -5.8], [0, 1.3, 3], 40, P(f, 5042, 0.0012)) },
    { f: 5136, dur: 24, s: (f) => Zm([3.0, 2.2, -5.4], [3.6, 2.3, 0.6], 38, P(f, 5136, 0.0008)) }, // "a reward for every emu"
  ],
  47: [{ f: 5194, s: (f) => Zm([3.0, 2.2, -5.4], [3.6, 2.3, 0.6], 38, P(f, 5136, 0.0008)) }],
  48: [
    { f: 5368, s: (f) => Zm([0.1, 1.6, -6.4], [0.05, 1.35, -2.4], 34, P(f, 5368, 0.0015)) },
    { f: 5398, dur: 36, s: (f) => Zm([0, 2.7, -8.8], [0.1, 1.3, 16], 42, P(f, 5398, 0.0006)) },    // "They're still there."
    { f: 5440, dur: 30, s: (f) => Zm([0.8, 1.95, -7.6], [0.8, 1.8, -1.5], 36, P(f, 5440, 0.0005)) }, // "Emus one. Australia nil." + outro: Sir, the emu, the board
  ],
};
export const camAtL = (id: number, f: number): Cam => {
  const b = BORROW[id];
  return kicked(run(CAMS[id], f), b && id !== 42 ? kickAt(fsOf(id, f)) : 0);
};

const DOF_L: Dof[] = [
  { f: 0, cInf: 0 },
  { f: 227, cInf: 9, focus: () => [0, 1.5, -4.5] },
  { f: 338, cInf: 0 },
  { f: 730, cInf: 9, focus: () => [-1.9, 1.5, 2.2] },
  { f: 785, cInf: 0 },
  { f: 1087, cInf: 7, focus: () => [-1.4, 1.0, 10.2] },
  { f: 1122, cInf: 0 },
  { f: 1496, dur: 26, cInf: 6, focus: () => [-2.2, 1.7, 2.2] },
  { f: 1608, cInf: 0 },
  { f: 2292, cInf: 4, focus: () => [0, 1.3, 18] },
  { f: 2391, cInf: 8, focus: () => [0, gy + 0.9, gz - 0.7] },
  { f: 2450, cInf: 4, focus: () => [0, 1.3, 18] },
  { f: 2485, cInf: 7, focus: () => [0, gy + 0.6, gz - 0.3] },
  { f: 2529, cInf: 0 },
  { f: 2740, dur: 26, cInf: 7, focus: () => [0.25, 1.4, 31] },
  { f: 2862, cInf: 0 },
  { f: 3264, cInf: 8, focus: (f) => [truckX(fsOf(30, f)) - 1.2, 2.4, 0] },
  { f: 3338, cInf: 11, focus: () => [0.1, 0.3, -2.7] },
  { f: 3463, cInf: 0 },
  { f: 3819, cInf: 5, focus: () => [0.9, 1.6, -1] },
  { f: 3966, cInf: 0 },
  { f: 5368, cInf: 9, focus: () => add(SIR_END, [0, 1.5, 0]) },
  { f: 5398, dur: 36, cInf: 3, focus: () => [0, 1.5, 3] },
  { f: 5440, dur: 30, cInf: 5, focus: () => add(SIR_END, [0, 1.5, 0]) },
];
export const dofAtL = dofFrom(DOF_L);
