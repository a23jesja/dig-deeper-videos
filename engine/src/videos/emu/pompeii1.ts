// "I Survived Pompeii: Part 1" (Short, 1080 x 1920): shots, cameras, lens, what stands where on which word.
// Spec: SCRIPT-pompeii.md, Part 1. Every shot starts 1-3 frames before its word (voice/pompeii-1/words.json -> wordsP1.json).
// World: the street of pompeiiset.ts. x across the street (facades at +-3.5, road |x| < 2.4), z along it: the camera stands at z > 0 and the
// mountain is at z = -300. The eruption clock (seconds since the blast) is E(f) = (f - BLAST) / 30; before it the mountain is quiet.
import { Cam, Key, ShotDef, V3, run, pushK, zoom, dofFrom, layersFrom, smooth, lerp } from "./story";
import { Scene, Show, SIR } from "./scenes";
import { Stage, CamInfo, person, blob, lidAt, hh, dog, Who } from "./castbase";
import { Outfit, Pen, INK, FrontOpts, ROMAN_BAKER, ROMAN_SOLDIER, ROMAN_MERCHANT, ROMAN_BOY, ROMAN_WOMAN, ROMAN_CROWD } from "./toon";
import { fxLoaf, fxCoin, fxCup } from "./dogtoon";
import { PompState, SUMMIT, PLACE, X, pompFlare } from "./pompeiiset";
import { chunkWords } from "./captions";
import wordsJson from "./wordsP1.json";
import talkJson from "./talkP1.json";

type Wd = { w: string; a: number; b: number; line: string };
const WORDS = wordsJson as Wd[];
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
export const at = (line: string, word?: string, n = 0): number => {
  const L = WORDS.filter((w) => w.line === line);
  if (!word) return Math.round(L[0].a * 30);
  const m = L.filter((w) => norm(w.w) === norm(word));
  if (!m[n]) throw new Error(`no word ${word} in ${line}`);
  return Math.round(m[n].a * 30);
};
export const WORDS_P1 = WORDS;
const TALK = talkJson as number[];
const talkOf = (f: number) => TALK[Math.max(0, Math.min(TALK.length - 1, f))] ?? 0;
export const TOTAL_P1 = TALK.length;
export const HOOK_END = 68;
/** the hook as text: two lines in a free band under the biggest figure (y = pixels at 1080 x 1920) */
export const HOOK = { lines: ["THE MOUNTAIN", "JUST EXPLODED"], x: 60, y: 1372, w: 960, h: 250, size: 104 };
export const PART2_A = at("next", "part") + 1;
export const PART2 = { lines: ["PART", "2"], x: 580, y: 330, w: 460, h: 380, size: 150 };
export const TEXTS = [{ ...HOOK, a: 0, b: HOOK_END }, { ...PART2, a: PART2_A, b: TOTAL_P1 }];
export const END_HOOK = { a: PART2_A };
export const CHUNKS = ["The mountain", "behind me", "just exploded.", "This is Pompeii.", "My part", "is made up.", "Everything around me", "is true.", "This morning", "was ordinary.", "A town of", "eleven thousand people.", "Fresh bread", "at the baker's.",
  "A guard dog", "on his chain,", "and a floor", "that says:", "beware of", "the dog.", "The ground", "has been shaking", "for days.", "Nobody worries.", "Here,", "it always shakes.", "Then,", "around midday,", "Vesuvius blows.",
  "A cloud climbs", "out of it", "like a", "pine tree:", "a tall trunk,", "then branches.", "Nobody is ready", "for this.", "The baker runs.", "The soldier runs.", "The merchant", "grabs his coins.", "I grab", "my cap.",
  "Then the sky", "starts to fall.", "Not rain.", "Stones.", "And in", "the middle of", "the day,", "it goes dark.", "That is", "part two."];
/** the frame the summit bursts, a hair before the word "blows" so the picture lands on it */
export const BLAST = at("blow", "blows") - 3;
/** frame 0 is the blast seen again: the clock of the hook shot starts this many seconds after it */
const HOOK_CLOCK = 0.8;

// ---------------- the cast ----------------
const W = (i: number, o: Outfit, okey: string): Who => ({ i, o, okey });
const BAKER = W(11, ROMAN_BAKER, "baker"), SOLDIER = W(12, ROMAN_SOLDIER, "soldier"), MERCHANT = W(13, ROMAN_MERCHANT, "merchant"), BOY = W(14, ROMAN_BOY, "boy"), WOMAN = W(15, ROMAN_WOMAN, "woman");
const crowdWho = (k: number): Who => ({ i: 30 + (k % 10) * 7, o: ROMAN_CROWD[k % ROMAN_CROWD.length], okey: "c_" + (k % ROMAN_CROWD.length) });

// ---------------- shots ----------------
const BEATS: [number, string, number, number?, number?][] = [
  [1, "hook: the mountain bursts behind Sir Digsworth, the loaf flies", 0, 40, 16],
  [2, "truth: close-up, calm, mouth follows the voice", at("truth") - 2],
  [3, "morning: Sir strolls the sunlit street", at("morning") - 2],
  [4, "morning: a town of eleven thousand: the busy street", at("morning", "town")],
  [5, "morning: the baker lifts loaves out of the oven", at("morning", "Fresh") - 2],
  [6, "dog: the guard dog on his chain wags at the boy", at("dog") - 2],
  [7, "dog: the floor mosaic CAVE CANEM", at("dog", "and") - 2],
  [8, "shake: a cup rattles off the counter, the awning trembles, the merchant shrugs", at("shake") - 2],
  [9, "shake: the soldier yawns", at("shake", "Nobody") - 2],
  [10, "blow: the mountain bursts, everyone turns", at("blow") - 2, 40, 16],
  [11, "pine: the cloud climbs out of the mountain", at("pine") - 2],
  [12, "pine: like a pine tree: a pine in the foreground", at("pine", "like") - 2],
  [13, "pine: a tall trunk", at("pine", "a", 2) - 2],
  [14, "pine: then branches", at("pine", "then") - 2],
  [15, "ready: faces in a row, puzzled to shocked", at("ready") - 2],
  [16, "run: the baker runs", at("run") - 2],
  [17, "run: the soldier runs", at("run", "The", 1) - 2],
  [18, "run: the merchant grabs his coins", at("run", "The", 2) - 2],
  [19, "run: I grab my cap", at("run", "I") - 2],
  [20, "stones: the sky starts to fall", at("stones") - 2],
  [21, "stones: not rain, stones", at("stones", "Not") - 2],
  [22, "next: the daylight drains away", at("next") - 2],
];
export const SHOTS_P1: ShotDef[] = BEATS.map(([id, name, a, az, el], i) => ({ id, name, a, b: i + 1 < BEATS.length ? BEATS[i + 1][2] : TOTAL_P1, zone: "pompeii" as const, light: "golden" as const, sunAz: az ?? 38, sunEl: el ?? 14 }));
export const A_P1: number[] = SHOTS_P1.map((s) => s.a);
export const layersP1 = layersFrom(SHOTS_P1, {});
export const SHOT_KIND: Record<number, "medium" | "close" | "wide" | "scenery" | "group"> = { 1: "medium", 2: "medium", 3: "medium", 4: "wide", 5: "medium", 6: "group", 7: "close", 8: "medium", 9: "medium", 10: "medium", 11: "scenery", 12: "scenery", 13: "scenery", 14: "scenery", 15: "medium", 16: "medium", 17: "medium", 18: "medium", 19: "medium", 20: "medium", 21: "medium", 22: "medium" };
const shotOf = (id: number) => SHOTS_P1[id - 1];
const prog = (id: number, f: number) => Math.max(0, Math.min(1, (f - shotOf(id).a) / (shotOf(id).b - shotOf(id).a)));
const ease = (f: number, a: number, b: number) => smooth((f - a) / (b - a));

// ---------------- what the street and the mountain do ----------------
const STONES0 = at("stones", "sky") - 6;
export const eruptT = (id: number, f: number): number | undefined => (id === 1 ? HOOK_CLOCK + (f / 30) * 0.25 : f >= BLAST ? (f - BLAST) / 30 : undefined);
const FG: Record<number, { amph?: -1 | 1; col?: -1 | 1; awn?: -1 | 1; flee?: boolean }> = { 1: { col: -1 }, 2: {}, 3: { col: 1 }, 4: {}, 5: { col: -1 }, 6: {}, 7: {}, 8: { col: 1 }, 9: { awn: 1 }, 10: { col: -1, flee: true },
  11: { awn: -1, flee: true }, 12: { col: 1, flee: true }, 13: { amph: -1, flee: true }, 14: { awn: 1, flee: true }, 15: { col: -1, flee: true }, 16: { col: -1, flee: true }, 17: { col: -1, flee: true }, 18: { flee: true }, 19: { awn: -1, flee: true }, 20: { col: -1, flee: true }, 21: { col: 1, flee: true }, 22: { col: 1, flee: true } };
export const fgBoxes = (id: number) => { const g = ((THUMB.mode === 2 && id === 17 ? {} : FG[id]) ?? {}) as { amph?: number; col?: number; awn?: number }, o: { name: string; x0: number; x1: number; y0: number; y1: number }[] = [];
  if (g.amph) o.push({ name: "amphorae", x0: g.amph > 0 ? 0.45 : -0.05, x1: g.amph > 0 ? 1.05 : 0.55, y0: 0.55, y1: 1 }); if (g.col) o.push({ name: "column", x0: g.col > 0 ? 0.85 : -0.02, x1: g.col > 0 ? 1.02 : 0.15, y0: 0, y1: 1 }); if (g.awn) o.push({ name: "awning", x0: g.awn > 0 ? 0.6 : 0, x1: g.awn > 0 ? 1 : 0.4, y0: 0, y1: 0.2 }); return o; };
export const stAt = (id: number, f: number): PompState => {
  const S: PompState = { eruptT: eruptT(id, f) };
  if (f >= STONES0 && id >= 20) S.stones = (f - STONES0) / 30;
  if (id === 8) S.shake = ease(f, A_P1[7] + 14, A_P1[7] + 30) * 0.9;
  if (id === 9) S.shake = 0.7 + 0.3 * Math.sin(f * 0.2);
  if (id === 10) S.shake = f < BLAST ? 0.4 : Math.max(0, 1 - (f - BLAST) / 70);
  if (id === 1) S.shake = Math.max(0, 1 - f / 60);
  if (id >= 20) S.avoid = AVOID(id, f);
  if (id === 20) S.zmax = 3.1; if (id === 21) S.zmax = 1.7; if (id === 22) S.zmax = 4.3;
  if (id === 12) S.pines = true;
  if (id === 1) S.cap = 0.3;
  S.fg = THUMB.mode === 2 && id === 17 ? {} : FG[id];
  if (id >= 12 && id <= 14) S.pines = true;
  return S;
};
export const pompAt = stAt;
/** the daylight drains: 0 = a bright day, 1 = ash-dark with the lamps not lit */
export const moodAt = (id: number, f: number): number => (id === 1 ? 0.5 : f < BLAST ? 0 : f < A_P1[19] ? 0.5 + 0.06 * ease(f, BLAST, A_P1[19]) : f < A_P1[21] ? lerp(0.56, 0.72, ease(f, A_P1[19], A_P1[21])) : lerp(0.72, 1, ease(f, A_P1[21], at("next", "dark") + 24)));
export const flareAt = (id: number, f: number) => (id === 1 || id === 10 ? pompFlare(eruptT(id, f)) : null);
const AVOID = (id: number, f: number): [number, number, number][] => { const s = id === 20 ? SIR19 : id === 21 ? SIR20 : SIR22; void f; return [[s[0], s[2], 1.5]]; };

// ---------------- cameras ----------------
const SIR1: V3 = [0.0, 0, 4.7], SIR2: V3 = [0.0, 0, 3.0], SIR3: V3 = [0.9, 0, 4.3];
const SIR9: V3 = [-1.5, 0, -3.63], SOL9: V3 = [-2.2, 0, -3.27];
const SIR19: V3 = [0.2, 0, 3.0], SIR20: V3 = [-0.6, 0, 2.2], SIR22: V3 = [0.0, 0, 4.7];
const MER8: V3 = [-2.1, 0, 0.2], BAK5: V3 = [4.45, 0, 1.75];
const TB = 3.4, TS = 3.6, TM = 3.3, TSIR = 3.5;
const SIR15: V3 = [0.0, 0, 3.0];
const bakerZ = (f: number) => lerp(2.0, 10.5, (f - A_P1[15]) / 34), solZ = (f: number) => lerp(1.0, 10.0, (f - A_P1[16]) / 38), merZ = (f: number) => lerp(0.5, 9.0, (f - A_P1[17]) / 48);
const cam = (pos: V3, look: V3, fov: number, k = 0, f0 = 0, f = 0, roll = 0) => (_f: number) => zoom(pos, look, fov, pushK(f, f0, k), { roll });
/** a camera that looks at a subject on the ground (sx, sz) so that his feet land at 69 % of the picture height (above the caption band): `shift` moves him sideways (+ = to the right), 1 = the picture's edge */
const camF = (pos: V3, sx: number, sz: number, fov: number, shift = 0, k = 0, f0 = 0, f = 0, roll = 0) => (_f: number) => {
  const dx = sx - pos[0], dz = sz - pos[2], d = Math.hypot(dx, dz), ux = dx / d, uz = dz / d, th = Math.tan(fov * Math.PI / 360);
  const pd = Math.atan(pos[1] / d) - Math.atan(0.38 * th), L = d + 3, side = -shift * L * th * 0.5625;
  return zoom(pos, [pos[0] + ux * L - uz * side, pos[1] - L * Math.tan(pd), pos[2] + uz * L + ux * side], fov, pushK(f, f0, k), { roll });
};
const CAMS: Record<number, Key[]> = {
  1: [{ f: 0, s: (f) => { const j = 0.012 * Math.max(0, 1 - f / 40) * Math.sin(f * 1.9); return cam([0.75 + j, 0.9 + j, 8.15], [-0.64, 0.38, 0], 50, 0.0003, 0, f, 0.004 * Math.sin(f * 0.17))(f); } }],
  2: [{ f: A_P1[1], s: (f) => camF([-0.2, 0.9, 6.4], SIR2[0], SIR2[2], 50, -0.5, 0.0002, A_P1[1], f)(f) }],
  3: [{ f: A_P1[2], s: (f) => { const x = lerp(-0.6, 0.5, prog(3, f)); return camF([x + 0.3, 0.9, 7.7], x, 4.3, 50, -0.1, 0.0002, A_P1[2], f)(f); } }],
  4: [{ f: A_P1[3], s: (f) => cam([0.2, 3.2, 13.5], [0.0, 0.0, -3.0], 52, 0.0003, A_P1[3], f)(f) }],
  5: [{ f: A_P1[4], s: (f) => camF([-0.35, 1.1, 1.75], 4.45, 1.75, 36, 0, 0.0003, A_P1[4], f)(f) }],
  6: [{ f: A_P1[5], s: (f) => camF([0.9, 0.9, -2.2], -2.4, -6.7, 46, 0, 0.0004, A_P1[5], f)(f) }],
  7: [{ f: A_P1[6], s: (f) => cam([-0.6, 3.2, -8.2], [-6.0, -0.6, -8.2], 40, 0.0006, A_P1[6], f)(f) }],
  8: [{ f: A_P1[7], s: (f) => camF([0.54, 0.9, 2.18], -2.1, 0.2, 50, 0, 0.0002, A_P1[7], f, 0.006 * Math.sin(f * 1.7) * ease(f, A_P1[7] + 14, A_P1[7] + 30))(f) }],
  9: [{ f: A_P1[8], s: (f) => camF([-0.19, 0.9, -0.16], -1.85, -3.45, 50, 0, 0.0002, A_P1[8], f, 0.004 * Math.sin(f * 1.5))(f) }],
  10: [{ f: A_P1[9], s: (f) => { const sh = f >= BLAST ? 0.03 * Math.max(0, 1 - (f - BLAST) / 40) * Math.sin(f * 2.3) : 0; return cam([-0.75 + sh, 0.9 + sh, 8.15], [0.64, 0.38, 0], 50, 0.0003, A_P1[9], f)(f); } }],
  11: [{ f: A_P1[10], s: (f) => cam([0.4, 0.9, 12], [0, 0.9 + 200 * Math.tan(0.245), -188], 52, 0, 0, f)(f) }],
  12: [{ f: A_P1[11], s: (f) => cam([0.4, 0.9, 12], [0, 0.9 + 200 * Math.tan(0.4 + 0.03 * prog(12, f)), -188], 60, 0, 0, f)(f) }],
  13: [{ f: A_P1[12], s: (f) => cam([0.4, 0.9, 12], [0, 0.9 + 200 * Math.tan(0.47), -188], 56, 0, 0, f)(f) }],
  14: [{ f: A_P1[13], s: (f) => cam([0.4, 0.9, 12], [0, 0.9 + 200 * Math.tan(0.495 + 0.02 * prog(14, f)), -188], 58, 0, 0, f)(f) }],
  15: [{ f: A_P1[14], s: (f) => camF([0.6, 0.9, lerp(6.42, 6.15, smooth(prog(15, f)))], SIR15[0], SIR15[2], 50, 0.38, 0, 0, f)(f) }],
  16: [{ f: A_P1[15], s: (f) => { const z = bakerZ(f); return camF([-0.5, 0.9, z + TB], -0.2, z, 50, 0.4, 0, 0, f, 0.01 * Math.sin(f * 0.8))(f); } }],
  17: [{ f: A_P1[16], s: (f) => { const z = solZ(f); return camF([0.9, 0.9, z + TS], 0.3, z, 50, 0.4, 0, 0, f, -0.01 * Math.sin(f * 0.8))(f); } }],
  18: [{ f: A_P1[17], s: (f) => { const z = merZ(f); return camF([-0.3, 0.9, z + TM], 0.1, z, 50, 0.4, 0, 0, f, 0.008 * Math.sin(f * 0.7))(f); } }],
  19: [{ f: A_P1[18], s: (f) => { const z = lerp(1.5, 8.5, prog(19, f)); return camF([0.1, 0.9, z + TSIR], 0.1, z, 50, 0.4, 0, 0, f, 0.012 * Math.sin(f * 0.9))(f); } }],
  20: [{ f: A_P1[19], s: (f) => camF([0.0, 0.9, 6.5], SIR19[0], SIR19[2], 50, 0.38, 0.0004, A_P1[19], f, 0.01 * Math.sin(f * 0.4))(f) }],
  21: [{ f: A_P1[20], s: (f) => camF([1.4, 0.9, 5.07], SIR20[0], SIR20[2], 50, 0, 0.0004, A_P1[20], f, 0.012 * Math.sin(f * 0.6))(f) }],
  22: [{ f: A_P1[21], s: (f) => cam([0.75, 0.9, 8.15], [-0.35, 0.38, 0], 50, 0.0002, A_P1[21], f)(f) }],
};
/** thumbnails only: 0 = Sir big in front of the bursting mountain, 1 = Sir under the falling stones, 2 = Sir big with the baker, the soldier and the merchant running behind him */
export const THUMB = { mode: -1 };
const THUMB_CAMS: Record<number, Cam> = {
  0: zoom([0.55, 0.9, 8.1], [-0.3, 0.25, 0], 50, 1, { roll: 0 }) as Cam,
  1: zoom([1.1, 0.9, 5.14], [-0.6, 0.63, 2.2], 50, 1, { roll: 0 }) as Cam,
  2: zoom([0.4, 0.9, 7.2], [-0.05, 0.3, 0], 50, 1, { roll: 0 }) as Cam,
};
export const camAtP1 = (id: number, f: number): Cam => (THUMB.mode >= 0 && THUMB.mode === ({ 0: 0, 1: 1, 2: 2 } as Record<number, number>)[THUMB.mode] && id === [1, 21, 17][THUMB.mode] ? THUMB_CAMS[THUMB.mode] : run(CAMS[id], f));
export const dofAtP1 = dofFrom([{ f: 0, cInf: 6, focus: () => [SIR1[0], 1.3, SIR1[2]] as V3 }, { f: A_P1[1], cInf: 0 }, { f: A_P1[2], cInf: 6, focus: () => [SIR3[0], 1.3, SIR3[2]] as V3 }, { f: A_P1[3], cInf: 0 },
  { f: A_P1[4], cInf: 6, focus: () => [BAK5[0], 1.3, BAK5[2]] as V3 }, { f: A_P1[5], cInf: 6, focus: () => [-2.4, 0.6, -6.7] as V3 }, { f: A_P1[6], cInf: 5 }, { f: A_P1[7], cInf: 6, focus: () => [MER8[0], 1.3, MER8[2]] as V3 }, { f: A_P1[8], cInf: 6, focus: () => [SIR9[0], 1.3, SIR9[2]] as V3 },
  { f: A_P1[9], cInf: 6, focus: () => [SIR1[0], 1.3, SIR1[2]] as V3 }, { f: A_P1[10], cInf: 5 }, { f: A_P1[14], cInf: 6, focus: () => [SIR15[0], 1.3, SIR15[2]] as V3 }, { f: A_P1[15], cInf: 6, focus: (f) => [-0.2, 1.3, bakerZ(f)] as V3 }, { f: A_P1[16], cInf: 6, focus: (f) => [0.3, 1.3, solZ(f)] as V3 },
  { f: A_P1[17], cInf: 6, focus: (f) => [0.1, 1.3, merZ(f)] as V3 }, { f: A_P1[18], cInf: 6, focus: (f) => [0.1, 1.3, lerp(1.5, 8.5, prog(19, f))] as V3 }, { f: A_P1[19], cInf: 6, focus: () => [SIR19[0], 1.3, SIR19[2]] as V3 }, { f: A_P1[20], cInf: 6, focus: () => [SIR20[0], 1.3, SIR20[2]] as V3 }, { f: A_P1[21], cInf: 6, focus: () => [SIR22[0], 1.3, SIR22[2]] as V3 }]);

// ---------------- screen cards: tags (fixed boxes in pixels, placed through the camera) ----------------
export type Box = { x0: number; y0: number; x1: number; y1: number };
export const SIGN_PX = 120;   // the text of every sign is as tall as the captions
export const TAGS: { id: number; a: number; b: number; box: Box; lines: string[]; px: number }[] = [
  { id: 2, a: at("truth", "My") + 2, b: at("truth", "Everything") - 4, box: { x0: 470, y0: 380, x1: 1040, y1: 790 }, lines: ["THE EVENTS", "ARE TRUE"], px: SIGN_PX },
  { id: 2, a: at("truth", "Everything") - 4, b: A_P1[2], box: { x0: 470, y0: 380, x1: 1040, y1: 790 }, lines: ["MY PART IS", "MADE UP"], px: SIGN_PX },
  { id: 4, a: A_P1[3] + 6, b: A_P1[4], box: { x0: 38, y0: 292, x1: 1042, y1: 470 }, lines: ["POMPEII · YEAR 79"], px: SIGN_PX },
];
const camBasis = (c: Cam) => {
  const f = [c.look[0] - c.pos[0], c.look[1] - c.pos[1], c.look[2] - c.pos[2]], fl = Math.hypot(...f); f[0] /= fl; f[1] /= fl; f[2] /= fl;
  let r = [-f[2], 0, f[0]], rl = Math.hypot(r[0], r[2]) || 1; r = [r[0] / rl, 0, r[2] / rl];
  const u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]];
  const cr = Math.cos(c.roll), sr = Math.sin(c.roll);
  return { f, r: r.map((v, i) => v * cr + u[i] * sr), u: r.map((v, i) => -v * sr + u[i] * cr) };
};
export const placeBox = (id: number, f: number, b: Box, d = 6) => {
  const c = camAtP1(id, f), B = camBasis(c), hh2 = d * Math.tan((c.fov * Math.PI) / 360), hw = hh2 * (1080 / 1920);
  const nx = ((b.x0 + b.x1) / 2 / 1080) * 2 - 1, ny = 1 - ((b.y0 + b.y1) / 2 / 1920) * 2;
  const p: V3 = [0, 1, 2].map((k) => c.pos[k] + B.f[k] * d + B.r[k] * nx * hw + B.u[k] * ny * hh2) as V3;
  return { p, w: ((b.x1 - b.x0) / 1080) * 2 * hw, h: ((b.y1 - b.y0) / 1920) * 2 * hh2 };
};
const rr = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
const fontPx = (g: CanvasRenderingContext2D, s: string, maxW: number, size: number) => { let z = size; do { g.font = `400 ${z}px Impact, 'Arial Narrow Bold', sans-serif`; z -= 2; } while (g.measureText(s).width > maxW && z > 60); };
const labelDraw = (lines: string[], W: number, H: number) => (p: Pen) => {
  const g = p.g; rr(g, 8, 8, W - 16, H - 16, 28); g.fillStyle = "#f6efd8"; g.fill(); g.lineWidth = 10; g.strokeStyle = INK; g.stroke();
  g.textAlign = "center"; g.textBaseline = "middle";
  lines.forEach((l, i) => { fontPx(g, l, W - 40, SIGN_PX); g.fillStyle = i === lines.length - 1 && lines.length > 1 ? "#7a1f1c" : INK; g.fillText(l, W / 2, H * ((i + 0.5) / lines.length)); });
};
const cards = (out: Stage, id: number, f: number) => {
  for (const t of TAGS) if (t.id === id && f >= t.a && f < t.b) {
    const n = f - t.a, k = n < 5 ? 0.6 + 0.4 * ((n + 1) / 5) : 1, pl = placeBox(id, f, t.box), cw = t.box.x1 - t.box.x0, ch = t.box.y1 - t.box.y0;
    out.fx.push({ key: `lab|${t.lines.join("|")}|${ch}`, cw, ch, draw: labelDraw(t.lines, cw, ch), x: pl.p[0], y: pl.p[1], z: pl.p[2], w: pl.w * k, h: pl.h * k, top: true });
  }
};

// ---------------- gaze events: from frame a to b something happens at pos; the main figures must look at it ----------------
export type Ev = { a: number; b: number; pos: (f: number) => V3; who?: string[] };
export const EVENTS: Ev[] = [
  { a: 0, b: 64, pos: () => SUMMIT, who: ["sir"] },
  { a: BLAST + 4, b: A_P1[10], pos: () => SUMMIT, who: ["sir"] },
  { a: STONES0, b: at("next", "That") - 8, pos: (f) => (f < A_P1[20] ? [SIR19[0] + 2.2, 9, SIR19[2]] : f < A_P1[21] ? [SIR20[0] + 2.2, 9, SIR20[2]] : [SIR22[0] + 2.2, 9, SIR22[2]]), who: ["sir"] },
];
export const COUNTS: { id: number; min: number; max: number; what: string }[] = [{ id: 4, min: 40, max: 9999, what: "people in the busy street" }];
/** lit things of the set that must not glow between or behind a figure's legs: [x, y, z, radius, legsOnly] */
export const lampsP1 = (): [number, number, number, number, boolean][] => [[5.0, 1.2, 0.55, 0.5, true]];

// ---------------- people ----------------
const stand = (out: Stage, cam: CamInfo, who: Who, p: V3, fo: FrontOpts, f: number, extra: { talk?: number; scale?: number } = {}, shadow = true) => {
  const pl = person(out, cam, who, p[0], p[1], p[2], { fo: { mode: "stand", blink: lidAt(f / 30, who.i), ...fo }, talk: extra.talk ?? 0, scale: extra.scale }, false);
  if (shadow) blob(out, cam, p[0], p[1], p[2], extra.scale ?? 1, 0.55);
  return pl;
};
/** a street crowd: rows along z from z0 to z1 (z0 > z1), spread over the road and pavements; far ones small because they are far */
const crowd = (out: Stage, cam: CamInfo, f: number, z0: number, z1: number, step: number, opts: { gaze?: boolean; from?: number; skip?: (x: number, z: number) => boolean; lookUp?: number; run?: number; side?: number } = {}) => {
  let n = 0;
  for (let z = z0; z > z1; z -= step) {
    n++;
    const sides = opts.side ? [opts.side] : [n % 2 ? 1 : -1];
    const spots: [number, number][] = sides.map((sd) => [sd * (2.75 + 0.35 * hh(n, 3)), z + 0.5 * (hh(n, 4) - 0.5)] as [number, number]);
    if (z < -40 && !opts.side) spots.push([(hh(n, 8) - 0.5) * 3.4, z - 1.2]);
    for (const [x, zz] of spots) {
      if (opts.skip?.(x, zz)) continue;
      const who = crowdWho(n + (x > 0 ? 3 : 0)), up = opts.gaze && f >= (opts.from ?? BLAST) ? 1 : 0, mv = opts.run;
      person(out, cam, who, x, 0.27 * (Math.abs(x) > 2.4 ? 1 : 0), zz, { fo: { mode: mv ? "march" : "stand", phase: mv ? (f * 0.05 + hh(n, 5)) % 1 : 0, run: mv ? 1 : undefined, lift: mv ? 90 : undefined, expr: up ? "shock" : (["neutral", "smile", "neutral", "grin"] as const)[n % 4], look: up ? (x > 0 ? -0.6 : 0.6) : (hh(n, 7) - 0.5) * 0.8, lookUp: up * (opts.lookUp ?? 0.85), facing: 0, blink: lidAt(f / 30, who.i + n) } }, false);
      if (z > -30) blob(out, cam, x, 0.27 * (Math.abs(x) > 2.4 ? 1 : 0), zz, 1, 0.6);
    }
  }
};

/** the busy street of shot 4: rows from near (25-30 % of the picture height) to far, staggered so no face is hidden. Camera at (0.2, 13.5), 52 degrees: screen x = 0.2 + s * 0.274 * depth */
const crowd4 = (out: Stage, cam: CamInfo, f: number) => {
  let n = 0;   // the camera stands 3.2 m up: rows 1.9 times farther than the one before never hide a face of the row behind them
  [8, 15.5, 30, 58, 110].forEach((d, k) => { for (let i = 0; i < 9; i++) { const x = -2.8 + i * 0.7 + (k % 2) * 0.12, z = 13.5 - d, who = crowdWho(n++);
    if (d < 10 && Math.abs(x) > 1.6) continue;
    person(out, cam, who, x, Math.abs(x) > 2.4 ? 0.27 : 0, z, { fo: { mode: "stand", expr: (["neutral", "smile", "neutral", "grin"] as const)[n % 4], look: (hh(n, 7) - 0.5) * 0.8, facing: 0, blink: lidAt(f / 30, who.i + n) } }, false); if (d < 60) blob(out, cam, x, 0, z, 1, 0.6); } });
};
/** townspeople running away from the mountain on the right pavement, in the middle distance behind the runner at z = rz */
const runners = (out: Stage, cam: CamInfo, f: number, rz: number, side = -1, from = 0) => {
  if (f < from) return;
  ([[15, 2.9], [27, 3.05]] as [number, number][]).forEach(([d, xx], i) => { const who = crowdWho(i * 3 + 1), x = side * xx;
    person(out, cam, who, x, 0.27, rz - d, { fo: { mode: "march", phase: (f * 0.055 + i * 0.27) % 1, lift: 90, run: 1, expr: "shock", look: 0, lookUp: 0, facing: 0, blink: 0 } }, false); });
};
export const sceneAtP1 = (id: number, f: number, cam: CamInfo): Scene => {
  const out: Scene = { places: [], fx: [], guns: [], crates: [], fan: 0 };
  const t = f / 30;
  cards(out, id, f);
  if (THUMB.mode === 2 && id === 17) {
    stand(out, cam, SIR, [-0.15, 0, 3.9], { mode: "stand", hands: "head", expr: "shock", look: 0, blink: 0 }, f);
    ([[BAKER, 0.8, -2.2, 0.1], [SOLDIER, 1.74, -2.7, 0.6], [MERCHANT, 0.03, -3.4, 0.35]] as [Who, number, number, number][]).forEach(([w, x, z, ph]) => stand(out, cam, w, [x, 0, z], { mode: "march", phase: ph, lift: 100, run: 1, expr: "shock", look: 0, blink: 0 }, f));
    return out;
  }
  if (THUMB.mode === 0 && id === 1) {
    stand(out, cam, SIR, SIR1, { mode: "stand", expr: "shock", look: 0.5, lookUp: 0.85, headTilt: -3, blink: 0 }, f, { talk: 0 });
    out.fx.push({ key: "loaf", cw: 220, ch: 160, draw: (p) => fxLoaf(p), x: SIR1[0] + 1.0, y: 2.55, z: SIR1[2] - 0.6, w: 0.5, h: 0.37, rot: -0.9 });
    return out;
  }
  if (id === 1) {
    const flinch = 1 - ease(f, 34, 56), up = 1 - ease(f, 66, 76);
    stand(out, cam, SIR, SIR1, { mode: "stroll", phase: 0.4 + f * 0.012, expr: "shock", cheer: 0.8 * flinch, look: 1.0 * up, lookUp: 0.85 * up, headTilt: 6 * up, blink: lidAt(t, 3) }, f, { talk: talkOf(f) });
    // the loaf, thrown out of his hand: up and to the right, turning
    const u = Math.min(1, f / 70), lx = SIR1[0] + 0.5 + 0.4 * u, ly = 1.4 + 0.3 * Math.sin(Math.PI * u), lz = SIR1[2] - 0.6;
    out.fx.push({ key: "loaf", cw: 220, ch: 160, draw: (p) => fxLoaf(p), x: lx, y: ly, z: lz, w: 0.5, h: 0.37, rot: -0.6 * u * 6 });
    crowd(out, cam, f, -22, -80, 3.3, { gaze: true, from: 0, side: 1 });
  } else if (id === 2) {
    stand(out, cam, SIR, SIR2, { expr: "neutral" }, f, { talk: talkOf(f) });
  } else if (id === 3) {
    const x = lerp(-0.6, 0.5, prog(3, f)) + 0.0;
    stand(out, cam, SIR, [x, 0, SIR3[2] - 0.1], { mode: "stroll", phase: f * 0.022, expr: "smile", blink: lidAt(t, 3) }, f, { talk: talkOf(f) });
  } else if (id === 4) {
    crowd4(out, cam, f);
  } else if (id === 5) {
    stand(out, cam, BAKER, BAK5, { mode: "stand", hands: "loaf", expr: "smile", look: 0, blink: lidAt(t, 11) }, f);
  } else if (id === 6) {
    const bx = lerp(-1.5, -1.75, ease(f, A_P1[5], A_P1[5] + 40));
    stand(out, cam, BOY, [bx, 0, -6.7], { mode: bx > -1.78 ? "stroll" : "stand", phase: f * 0.03, expr: "grin", facing: 0, look: -0.5, blink: lidAt(t, 14) }, f);
    dog(out, cam, { x: -2.95, y: 0.27, z: -6.75, mode: "sit", chain: true, expr: "happy", k: t * 2.2, blink: lidAt(t, 5) });
  } else if (id === 7) {
    void 0;
  } else if (id === 8) {
    const sh = ease(f, A_P1[7] + 14, A_P1[7] + 30), fall = f > A_P1[7] + 36, u = Math.max(0, (f - A_P1[7] - 36) / 20);
    stand(out, cam, MERCHANT, MER8, { mode: "stand", hands: f > at("shake", "Nobody") - 8 ? "purse" : undefined, shrug: f >= at("shake", "Nobody") - 8 && f < at("shake", "Nobody") + 8 ? 1 : undefined, expr: "neutral", look: 0.3, blink: lidAt(t, 13) }, f);
    const cx = -3.88 + (fall ? 0.0 : 0.05 * Math.sin(f * 2.6) * sh), cy = fall ? Math.max(0.03, 1.1 - 4.9 * u * u * 0.8) : 1.1;
    out.fx.push({ key: "cup", cw: 100, ch: 100, draw: (p) => fxCup(p), x: cx - (fall ? 0.5 * u : 0), y: cy, z: -0.05, w: 0.2, h: 0.2, rot: fall ? 1.6 * u : 0.12 * sh * Math.sin(f * 2.2) });
  } else if (id === 9) {
    stand(out, cam, SIR, SIR9, { expr: "nervous", look: -0.5, blink: lidAt(t, 3) }, f, { talk: talkOf(f) });
    const yawn = ease(f, at("shake", "Here") - 4, at("shake", "Here") + 6);
    stand(out, cam, SOLDIER, SOL9, { expr: yawn > 0.5 ? "laugh" : "neutral", look: 0.2, blink: yawn > 0.5 ? 0 : lidAt(t, 12) }, f);
  } else if (id === 10) {
    const b = f >= BLAST, e = ease(f, BLAST - 2, BLAST + 8);
    stand(out, cam, SIR, SIR1, { mode: "stand", expr: b ? "shock" : "neutral", cheer: b ? 0.8 * e : undefined, look: -1.0 * e, lookUp: 0.9 * e, headTilt: -6 * e, blink: lidAt(t, 3) }, f, { talk: talkOf(f) });
    
  } else if (id >= 11 && id <= 14) {
  } else if (id === 15) {
    const up = ease(f, A_P1[14] + 4, A_P1[14] + 22);
    stand(out, cam, SIR, SIR15, { mode: "stand", expr: "shock", look: 0.5 * up, lookUp: 0.9 * up, headTilt: -3 * up, blink: lidAt(t, 3) }, f, { talk: talkOf(f) });
  } else if (id === 16) {
    const z = bakerZ(f);
    stand(out, cam, BAKER, [-0.2, 0, z], { mode: "march", phase: f * 0.06, lift: 100, run: 1, expr: "shock", look: 0, blink: lidAt(t, 11) }, f);
    runners(out, cam, f, z);
  } else if (id === 17) {
    const z = solZ(f);
    stand(out, cam, SOLDIER, [0.3, 0, z], { mode: "march", phase: f * 0.06, lift: 100, run: 1, expr: "shock", look: 0, blink: lidAt(t, 12) }, f);
  } else if (id === 18) {
    const z = merZ(f), u = (f - A_P1[17]) / 30;
    stand(out, cam, MERCHANT, [0.1, 0, z], { mode: "march", phase: f * 0.05, lift: 70, hands: f > at("run", "grabs") ? "purse" : undefined, run: f > at("run", "grabs") ? undefined : 1, expr: "shock", look: 0, blink: lidAt(t, 13) }, f);
    runners(out, cam, f, z);
    if (f > at("run", "grabs")) for (let k = 0; k < 4; k++) { const tt = Math.max(0, f - at("run", "grabs") - k * 5); out.fx.push({ key: "coin", cw: 100, ch: 100, draw: (p) => fxCoin(p), x: 0.1 + (k - 1.5) * 0.12, y: Math.max(0.05, 1.0 - 0.012 * tt * tt), z: z + 0.2, w: 0.1, h: 0.1, rot: tt * 0.4 }); }
    void u;
  } else if (id === 19) {
    const z = lerp(1.5, 8.5, prog(19, f)) - 0.0, cap = ease(f, A_P1[18], A_P1[18] + 14);
    stand(out, cam, SIR, [0.1, 0, z], { mode: "march", phase: f * 0.05, lift: 80, run: cap > 0.5 ? undefined : 1, hands: cap > 0.5 ? "head" : undefined, expr: "shock", look: 0, blink: lidAt(t, 3) }, f);
    runners(out, cam, f, z);
  } else if (id === 20) {
    stand(out, cam, SIR, SIR19, { mode: "stand", hands: "head", expr: "shock", look: 0.5, lookUp: 0.9, headTilt: -3, blink: lidAt(t, 3) }, f);
    runners(out, cam, f, SIR19[2]);
  } else if (id === 21) {
    stand(out, cam, SIR, SIR20, { mode: "stand", cheer: 0.5, expr: "shock", look: 0.5, lookUp: 0.9, headTilt: -3, blink: lidAt(t, 3) }, f);
  } else if (id === 22) {
    stand(out, cam, SIR, SIR22, { mode: "stand", expr: "shock", look: 0.5 * (1 - ease(f, at("next", "That") - 6, at("next", "That") + 6)), lookUp: 0.9 * (1 - ease(f, at("next", "That") - 6, at("next", "That") + 6)), headTilt: -3, blink: lidAt(t, 3) }, f, { talk: talkOf(f) });
  }
  void PLACE; void X; void SIR1;
  return out;
};
export const SHOW_P1: Show = { shots: SHOTS_P1, camAt: camAtP1, sceneAt: sceneAtP1, crowdFor: () => null, wheatAt: () => 1, pompAt, moodAt, flareAt };

/** what scripts/kit_check.mjs needs from a film */
export const FILM_CHECK = {
  shots: SHOTS_P1, camAt: camAtP1, sceneAt: sceneAtP1, kinds: SHOT_KIND, texts: TEXTS, events: EVENTS, counts: COUNTS, tags: TAGS, lamps: lampsP1, flareAt,
  passengers: [] as string[], deckAt: undefined, fgBoxes, total: TOTAL_P1, band: { y0: 1400, y1: 1600 },
  captions: { chunks: chunkWords(WORDS, CHUNKS).filter((c) => c.a * 30 >= HOOK_END - 1) }, endHook: END_HOOK, signFacts: [] as string[],
};
void ROMAN_CROWD;
