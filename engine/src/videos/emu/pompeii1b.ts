// "I Survived Pompeii: Part 1", second build (Jesper 2026-11-16: "Action, not portraits"): shots, cameras, who runs where on which word.
// Order: the blast in the first second, at most eight seconds of the calm morning, then flight and chaos to the end.
// World: the street of pompeiiset.ts. x across the street (facades at +-3.5, road |x| < 2.4), z along it; the mountain is at z = -165, so
// people flee toward +z. Camera directions are given as az: 0 = looking at the mountain, 90 = looking across the street toward +x,
// 180 = looking away from the mountain. Every shot starts 1-3 frames before its word (voice/pompeii-1v2 -> wordsP1v2.json).
import { Cam, ShotDef, V3, layersFrom, dofFrom, smooth, lerp, clamp01 } from "./story";
import { Scene, Show, SIR } from "./scenes";
import { Stage, CamInfo, person, blob, lidAt, hh, dog, Who, viewOf } from "./castbase";
import { Outfit, Pen, INK, FrontOpts, SideOpts, Expr, RUN_M, hangSway, ROMAN_BAKER, ROMAN_SOLDIER, ROMAN_MERCHANT, ROMAN_BOY, ROMAN_WOMAN, ROMAN_CROWD } from "./toon";
import { fxLoaf, fxCoin, fxCup } from "./dogtoon";
import { PompState, SUMMIT, ROAD, pompFlare } from "./pompeiiset";
import { chunkWords } from "./captions";
import wordsJson from "./wordsP1v2.json";
import talkJson from "./talkP1v2.json";

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
WORDS[WORDS.length - 1].b = TALK.length / 30;   // the last caption holds to the last frame
const ease = (f: number, a: number, b: number) => smooth((f - a) / (b - a));
const lin = (f: number, a: number, b: number) => clamp01((f - a) / (b - a));
const q16 = (v: number) => Math.round(((v % 1) + 1) % 1 * 16) / 16;

// ---------------- texts ----------------
export const HOOK_END = at("hook", "This") - 3;
export const HOOK = { lines: ["THE MOUNTAIN", "JUST EXPLODED"], x: 60, y: 1372, w: 960, h: 250, size: 104 };
export const PART2_A = at("next", "That") - 2;
export const PART2 = { lines: ["PART", "2"], x: 590, y: 340, w: 440, h: 360, size: 150 };
export const TEXTS = [{ ...HOOK, a: 0, b: HOOK_END }, { ...PART2, a: PART2_A, b: TOTAL_P1 }];
export const END_HOOK = { a: PART2_A };
export const CHUNKS = ["The mountain", "behind me", "just exploded.", "This is Pompeii.", "This morning", "was ordinary.", "Fresh bread.", "A guard dog", "on his chain.", "The ground shook.", "Here,", "it always shakes.",
  "Then,", "around midday,", "Vesuvius blows.", "A cloud climbs", "out of it", "like a", "pine tree:", "a tall trunk,", "then branches.", "About eleven thousand", "people live here.", "Nobody is ready.",
  "People grab what", "they can carry,", "and run.", "The baker runs.", "The soldier runs.", "The merchant", "grabs his coins.", "I grab", "my cap.", "Then the sky", "starts to fall.", "Not rain.", "Stones.",
  "I dive under", "an awning.", "It does", "not hold.", "And in", "the middle of", "the day,", "it goes dark.", "That is", "part two."];

// ---------------- the cast ----------------
const W = (i: number, o: Outfit, okey: string): Who => ({ i, o, okey });
const BAKER = W(11, ROMAN_BAKER, "baker"), SOLDIER = W(12, ROMAN_SOLDIER, "soldier"), MERCHANT = W(13, ROMAN_MERCHANT, "merchant"), BOY = W(14, ROMAN_BOY, "boy"), WOMAN = W(15, ROMAN_WOMAN, "woman");
const crowdWho = (k: number): Who => ({ i: 30 + (k % 10) * 7, o: ROMAN_CROWD[k % ROMAN_CROWD.length], okey: "c_" + (k % ROMAN_CROWD.length) });
const HGT: Record<string, number> = { sir: 1.66, baker: 1.63, soldier: 1.77, merchant: 1.57, boy: 1.27, woman: 1.62 };

// ---------------- shots ----------------
// [id, name, first frame, the direction the camera looks (for the light: the mountain is the lamp), kind]
type Kind = "medium" | "close" | "wide" | "scenery" | "glide";
const B: [number, string, number, number, Kind][] = [
  [1, "hook: the mountain bursts behind Sir Digsworth; he jumps, the loaf flies out of his hand, he spins round, then runs", 0, -10, "medium"],
  [2, "morning: Sir strolls down the sunlit street, people about their day", at("morning") - 2, 15, "medium"],
  [3, "morning: fresh bread: the baker sets a loaf on his counter", at("morning", "Fresh") - 2, 90, "close"],
  [4, "morning: the guard dog at the end of his chain, hopping and barking, his tail going", at("morning", "A") - 2, -90, "glide"],
  [5, "shake: the cups rattle off the merchant's counter; he shrugs", at("shake") - 2, -70, "close"],
  [6, "blow: around midday: the whole street shakes, jars fall", at("blow") - 2, 0, "wide"],
  [7, "blow: Vesuvius blows: Sir Digsworth's back, thrown against the fireball", at("blow", "Vesuvius") - 3, 0, "medium"],
  [8, "pine: the column punches up out of the crater, lightning in its foot", at("pine") - 2, 0, "scenery"],
  [9, "pine: like a pine tree: the column over the roofs, a real pine beside it", at("pine", "like") - 1, 0, "scenery"],
  [10, "pine: a tall trunk, then branches: Sir hurries toward the lens, the crown spreads behind him", at("pine", "a", 2) - 2, -12, "medium"],
  [11, "ready: about eleven thousand people: the street from above, everyone running every way", at("ready") - 2, 0, "wide"],
  [12, "ready: live here: two of them run into each other, the amphora smashes", at("ready", "live") - 1, 90, "glide"],
  [13, "ready: nobody is ready: the cart tips over at the lens", at("ready", "Nobody") - 2, 8, "medium"],
  [14, "grab: people grab what they can carry: the lens runs along with them", at("grab") - 2, -90, "glide"],
  [15, "grab: and run: their backs, the lens running after them down the street", at("grab", "and") - 1, 180, "glide"],
  [16, "run: the baker runs, loaves bouncing out of his basket", at("run") - 2, 90, "glide"],
  [17, "run: the soldier runs, seen from above, shoving through", at("run", "The", 1) - 2, 0, "medium"],
  [18, "run: the merchant sweeps his coins into the purse", at("run", "The", 2) - 2, -112, "close"],
  [19, "run: his coins roll over the paving, he runs off", at("run", "his") + 3, -55, "glide"],
  [20, "run: I grab my cap: Sir sprints at the lens", at("run", "I") - 2, -16, "medium"],
  [21, "stones: the sky starts to fall: Sir from above, dodging", at("stones") - 2, 0, "medium"],
  [22, "stones: not rain, stones: from the ground, Sir scuttles across with his hands on his cap", at("stones", "Not") - 2, 18, "medium"],
  [23, "awning: I dive under an awning", at("awning") - 2, 60, "medium"],
  [24, "awning: it does not hold: from inside the bakery, his back against the street; the cloth comes down, he backs in", at("awning", "It") - 2, -90, "medium"],
  [25, "next: in the middle of the day it goes dark: Sir runs, the lens pulls back", at("next") - 2, -14, "medium"],
  [26, "next: that is part two: his back, the glowing mountain", at("next", "That") - 2, 0, "medium"],
];
const AZ: Record<number, number> = Object.fromEntries(B.map((b) => [b[0], b[3]]));
export const SHOTS_P1: ShotDef[] = B.map(([id, name, a, az], i) => ({ id, name, a, b: i + 1 < B.length ? B[i + 1][2] : TOTAL_P1, zone: "pompeii" as const, light: "golden" as const,
  sunAz: id >= 2 && id <= 6 ? 40 : -az + 22, sunEl: id >= 2 && id <= 6 ? 24 : 15 }));
export const A_P1: number[] = SHOTS_P1.map((s) => s.a);
const A = (id: number) => SHOTS_P1[id - 1].a, E_ = (id: number) => SHOTS_P1[id - 1].b;
const prog = (id: number, f: number) => clamp01((f - A(id)) / (E_(id) - A(id)));
export const layersP1 = layersFrom(SHOTS_P1, {});
export const SHOT_KIND: Record<number, Kind> = Object.fromEntries(B.map((b) => [b[0], b[4]]));
/** the calm morning (the flashback) and the disclaimer sign: checked by scripts/kit_check.mjs against "Action, not portraits" */
export const FLASHBACK = { a: A(2), b: A(6) };
export const DISCLAIMER = { a: A(4), b: A(4) + 60 };

// ---------------- the clocks: the eruption, the stones, the light ----------------
export const BLAST = A(7) + 5;
const STONES0 = A(21) + 2;
const DARK0 = at("next", "it") - 10;
/** seconds since the blast, warped per shot so each picture shows the stage of the column the voice talks about */
export const eruptT = (id: number, f: number): number | undefined => {
  if (id === 1) return 0.3 + (f / 30) * 0.5;
  if (id < 7) return undefined;
  if (id === 7) return f >= BLAST ? (f - BLAST) / 30 : undefined;
  if (id === 8) return lerp(1.3, 3.4, prog(8, f));
  if (id === 9) return lerp(4.2, 5.4, prog(9, f));
  if (id === 10) return lerp(5.2, 11.5, ease(f, A(10), at("pine", "branches") + 16));
  return 12 + (f - A(11)) / 30;
};
/** 0 = the golden morning, 0.5 = fire red, 1 = ash-dark */
export const moodAt = (id: number, f: number): number => {
  if (id === 1) return 0.5;
  if (id < 7) return 0;
  if (id === 7) return 0.5 * ease(f, BLAST - 1, BLAST + 9);
  if (id < 25) return 0.5 + 0.1 * lin(f, A(21), A(25));
  return lerp(0.6, 1, ease(f, DARK0, DARK0 + 60));
};
/** an extra veil of darkness over the picture (under the captions) while "it goes dark" is said: two seconds */
export const dimAt = (f: number) => 0.3 * ease(f, DARK0, DARK0 + 60);
export const flareAt = (id: number, f: number) => (id === 1 || id === 7 ? pompFlare(eruptT(id, f)) : null);

// ---------------- camera grammar ----------------
const RAD = Math.PI / 180;
const fwdOf = (az: number): [number, number] => [Math.sin(az * RAD), -Math.cos(az * RAD)];
/** A camera that frames a subject standing at `at` and `h` metres tall so that its top is at `top` and its feet at `bot` of the picture
 *  height (0 = top edge, 1 = bottom edge), looking in direction `az` from a lens `yc` metres above the ground, with the subject at `sx`
 *  of the picture width. The caption band (72-84 %) then crosses the legs of a full figure whose feet stand at 0.9. */
const frame = (o: { at: V3; h: number; top: number; bot: number; az: number; yc: number; fov?: number; sx?: number; roll?: number }): Cam => {
  const fov = o.fov ?? 50, T = Math.tan(fov * RAD / 2), nt = 1 - 2 * o.top, nb = 1 - 2 * o.bot, y0 = o.at[1];
  const g = (d: number) => { const th = Math.atan(nb * T) - Math.atan((y0 - o.yc) / d); return [Math.tan(Math.atan((y0 + o.h - o.yc) / d) + th) / T - nt, th]; };
  let lo = 0.3, hi = 300;
  for (let i = 0; i < 50; i++) { const m = (lo + hi) / 2; if (g(m)[0] > 0) lo = m; else hi = m; }
  const d = (lo + hi) / 2, th = g(d)[1], [fx, fz] = fwdOf(o.az), pos: V3 = [o.at[0] - fx * d, o.yc, o.at[2] - fz * d];
  const phi = Math.atan((2 * (o.sx ?? 0.5) - 1) * T * 0.5625) / RAD, [lx, lz] = fwdOf(o.az - phi), L = 10;
  return { pos, look: [pos[0] + lx * L * Math.cos(th), pos[1] - L * Math.sin(th), pos[2] + lz * L * Math.cos(th)], fov, roll: o.roll ?? 0 };   // th is the pitch DOWN of the lens
};
const free = (pos: V3, look: V3, fov: number, roll = 0): Cam => ({ pos, look, fov, roll });
/** the ground jolts the camera: a fast decaying wobble of strength k */
const jolt = (c: Cam, f: number, k: number): Cam => (k <= 0 ? c : { ...c, pos: [c.pos[0] + 0.02 * k * Math.sin(f * 2.3), c.pos[1] + 0.025 * k * Math.sin(f * 1.9 + 1), c.pos[2]], roll: c.roll + 0.006 * k * Math.sin(f * 1.3) });

// ---------------- where everybody is (pure functions of the frame, shared by the cameras and the scenes) ----------------
// 1 hook
const SIR1: V3 = [-0.5, 0, 4.0];
const sir1 = (f: number) => { const jump = f < 12 ? 0.2 * (1 - ((f - 3) / 9) ** 2) : 0, run = Math.max(0, f - 92) / 30; return { x: SIR1[0], y: Math.max(0, jump), z: SIR1[2] + 4.2 * run * run * 0.9 + 1.2 * run }; };
// 2 morning stroll
const sir2 = (f: number): V3 => [0.55, 0, 2.6 + 1.25 * (f - A(2)) / 30];
// 10 Sir hurrying toward the lens while the crown spreads
const sir10 = (f: number): V3 => [-0.45, 0, 3.2 + 1.9 * (f - A(10)) / 30];
// 16 the baker, 17 the soldier, 19 the merchant, 20 Sir
const baker16 = (f: number): V3 => [0.45, 0, -4.5 + 5.2 * (f - A(16)) / 30];
const sol17 = (f: number): V3 => [0.1 + 0.3 * Math.sin((f - A(17)) * 0.12), 0, -3.0 + 5.0 * (f - A(17)) / 30];
const mer19 = (f: number): V3 => [-2.05, 0, -0.4 + 4.6 * (f - A(19) + 4) / 30];
const sir20 = (f: number): V3 => [-0.3, 0, 0.5 + 4.8 * (f - A(20)) / 30];
// 21 dodging under the first stones, 22 the scuttle, 23 the dive, 24 under the awning and out again, 25 the run into the dark, 26 the last look
const sir21 = (f: number): V3 => { const u = (f - A(21)) / 30; return [0.1 + 0.3 * Math.sin(u * 4.2) * smooth(u * 2), 0, 8.0 + 0.5 * u]; };
const sir22 = (f: number): V3 => [-0.85 + 0.7 * prog(22, f), 0, 5.2 + 0.3 * prog(22, f)];
const DIVE0 = A(23) + 16, DIVE1 = A(23) + 27;
const sir23 = (f: number): V3 => { const u = lin(f, A(23), DIVE1), air = lin(f, DIVE0, DIVE1); return [lerp(0.1, 2.55, u), 0.27 * smooth(lin(f, DIVE0 - 2, DIVE1)) + 0.45 * Math.sin(Math.PI * air) * (f >= DIVE0 && f < DIVE1 ? 1 : 0), lerp(2.3, 1.0, u)]; };
const RIP0 = at("awning", "not") - 4, OUT0 = RIP0 + 10;
const sir24 = (f: number): V3 => [2.55 + 0.18 * ease(f, RIP0 + 4, RIP0 + 16), 0.27, 1.0 + 0.1 * ease(f, RIP0 + 4, RIP0 + 16)];
const sir25 = (f: number): V3 => [0.35, 0, 9.0 + 4.6 * (f - A(25)) / 30];
const SIR26: V3 = [-0.75, 0, 24.5];

const CAMS: Record<number, (f: number) => Cam> = {
  1: (f) => { const s = sir1(f); return jolt(frame({ at: [SIR1[0], 0, s.z], h: HGT.sir, top: 0.25, bot: 0.93, az: -15, yc: 0.75, sx: 0.38 }), f, Math.max(0, 1 - f / 34)); },
  2: (f) => { const p = sir2(f); return frame({ at: p, h: HGT.sir, top: 0.2, bot: 0.9, az: 15 - 9 * prog(2, f), yc: 1.35, sx: 0.62, fov: 46 }); },
  3: () => frame({ at: [4.75, 0.02, 0.0], h: HGT.baker, top: 0.2, bot: 1.34, az: 90, yc: 1.3, sx: 0.5, fov: 30 }),
  4: (f) => free([0.5 - 0.25 * prog(4, f), 0.5, -6.95], [-2.9, 0.78, -7.0], 60),
  5: (f) => jolt(frame({ at: [-4.8, 0.3, 1.0], h: HGT.merchant, top: 0.28, bot: 1.25, az: -70, yc: 1.3, sx: 0.5, fov: 30 }), f, 0.5 * ease(f, A(5), A(5) + 12) * (1 - ease(f, at("shake", "Here") - 4, at("shake", "Here") + 14))),
  6: (f) => jolt(free([0.6, 4.6 - 0.5 * prog(6, f), 12.5 - 1.2 * prog(6, f)], [0, 1.2, -6], 50), f, 0.5 + 0.9 * prog(6, f)),
  7: (f) => jolt(frame({ at: [-0.9, 0, 4.2], h: HGT.sir, top: 0.29, bot: 0.89, az: -13, yc: 0.6, sx: 0.36 }), f, f < BLAST ? 0.8 : 2.2 * Math.max(0, 1 - (f - BLAST) / 40)),
  8: (f) => { const y = lerp(SUMMIT[1] + 16, SUMMIT[1] + 62, smooth(prog(8, f))); return free([1.2, 1.6, 10], [SUMMIT[0], y, SUMMIT[2]], 24, 0.004 * Math.sin(f * 0.9)); },
  9: (f) => free([0.5, 0.5, 9.5], [1.5, 0.5 + 180 * Math.tan((25 - 1.5 * prog(9, f)) * RAD), -170], 58),
  10: (f) => { const p = sir10(f), u = smooth(prog(10, f)); return frame({ at: p, h: HGT.sir, top: lerp(0.34, 0.27, u), bot: lerp(0.88, 0.91, u), az: -17, yc: 0.28, sx: 0.29, fov: 62 }); },
  11: (f) => free([0.4, 6.4 - 0.9 * prog(11, f), 14.5 - 1.5 * prog(11, f)], [0, 1.0, -3], 54),
  12: (f) => { const hit = A(12) + 14, wz = f < hit ? 5.0 - 0.42 - 4.4 * (hit - f) / 30 : 4.58; return frame({ at: [0.3, 0, f < hit - 5 ? wz + 0.3 : lerp(4.58 - 4.4 * 5 / 30 + 0.3, 5.0, smooth((f - hit + 5) / 6))], h: HGT.woman, top: 0.3, bot: 0.9, az: 90, yc: 1.1, sx: 0.5, fov: 50 }); },
  13: (f) => jolt(free([-1.2, 0.45, 6.0 - 0.3 * prog(13, f)], [-0.05, 0.72, 3.0], 52), f, f > A(13) + 16 ? Math.max(0, 1.5 - (f - A(13) - 16) / 12) : 0),
  14: (f) => { const z = 9.0 + 3.6 * (f - A(14)) / 30; return frame({ at: [-0.4, 0, z], h: 1.62, top: 0.3, bot: 0.9, az: -90, yc: 1.15, sx: 0.5, fov: 56 }); },
  15: (f) => frame({ at: [-0.7, 0, 9.0 + 4.6 * (f - A(15)) / 30], h: 1.62, top: 0.27, bot: 0.9, az: 180, yc: 1.25, sx: 0.3, fov: 50, roll: 0.012 * Math.sin(f * 0.9) }),
  16: (f) => { const p = baker16(f); return frame({ at: [p[0], 0, p[2] + 0.32 - 0.5 * prog(16, f)], h: HGT.baker, top: 0.2, bot: 0.9, az: 90, yc: 1.05, sx: 0.5, fov: 46 }); },
  17: (f) => { const p = sol17(f); return free([p[0] + 0.5, 2.7, p[2] + 3.5], [p[0], 0.85, p[2]], 35, 0.012 * Math.sin(f * 0.7)); },
  18: (f) => jolt(frame({ at: [-4.8, 0.3, 1.0], h: HGT.merchant, top: 0.2, bot: 1.16, az: -112, yc: 1.25, sx: 0.44, fov: 30 }), f, 0.35),
  19: (f) => free([-0.2, 0.16, 4.6 + 0.6 * prog(19, f)], [-2.2, lerp(0.72, 1.05, prog(19, f)), 2.2 + 0.6 * prog(19, f)], 50),
  20: (f) => { const p = sir20(f); return frame({ at: p, h: HGT.sir, top: 0.17, bot: 0.91, az: -16, yc: 1.0, sx: 0.4, fov: 48, roll: 0.012 * Math.sin(f * 0.8) }); },
  21: (f) => { const p = sir21(f); return free([0.5, 3.9, p[2] + 2.9], [0.15 + 0.6 * (p[0] - 0.1), 0.9, p[2] + 0.05], 27.5 - 1.5 * prog(21, f)); },
  22: (f) => { const p = sir22(f); return free([0.2, 0.14, 7.9], [-0.45, 0.92, 5.3], 52 - 3 * prog(22, f)); void p; },
  23: (f) => { const u = smooth(prog(23, f)), p = sir23(f); return free([lerp(-2.3, -0.5, u), 1.0, lerp(3.9, 2.7, u)], [p[0] + 0.1, 0.9 + 0.7 * p[1], p[2]], lerp(46, 38, u)); },
  24: (f) => { const p = sir24(f); return jolt(free([4.95, 1.25, 1.5], [p[0], lerp(1.02, 1.2, ease(f, RIP0 + 3, RIP0 + 20)), p[2] - 0.05], lerp(54, 64, ease(f, RIP0 + 3, RIP0 + 20))), f, f >= RIP0 && f < RIP0 + 14 ? 1.2 : 0); },
  25: (f) => { const p = sir25(f), u = smooth(prog(25, f)); return frame({ at: p, h: HGT.sir, top: lerp(0.16, 0.34, u), bot: lerp(0.94, 0.88, u), az: -14, yc: lerp(0.9, 1.5, u), sx: lerp(0.5, 0.6, u), fov: 54 }); },
  26: (f) => frame({ at: SIR26, h: HGT.sir, top: 0.3 - 0.02 * prog(26, f), bot: 0.92, az: -7, yc: 0.7, sx: 0.3, fov: 50 }),
};
export const camAtP1 = (id: number, f: number): Cam => CAMS[id](f);
const focusOf: Record<number, (f: number) => V3> = {
  1: (f) => [SIR1[0], 1.3, sir1(f).z], 2: (f) => { const p = sir2(f); return [p[0], 1.3, p[2]]; }, 3: () => [4.75, 1.3, 0], 4: () => [-2.9, 0.7, -6.9], 5: () => [-4.8, 1.3, 1.0], 7: () => [-0.9, 1.3, 4.2],
  10: (f) => { const p = sir10(f); return [p[0], 1.3, p[2]]; }, 12: () => [0.3, 1.2, 5], 13: () => [0.5, 0.8, 2.6], 14: (f) => [-0.4, 1.2, 9.0 + 3.6 * (f - A(14)) / 30], 15: (f) => [-0.7, 1.2, 9.0 + 4.6 * (f - A(15)) / 30],
  16: (f) => { const p = baker16(f); return [p[0], 1.2, p[2]]; }, 17: (f) => { const p = sol17(f); return [p[0], 1.2, p[2]]; }, 18: () => [-4.8, 1.3, 1.0], 19: () => [-0.9, 0.2, 3.6], 20: (f) => { const p = sir20(f); return [p[0], 1.3, p[2]]; },
  21: (f) => { const p = sir21(f); return [p[0], 1.2, p[2]]; }, 22: (f) => { const p = sir22(f); return [p[0], 1.0, p[2]]; }, 23: (f) => { const p = sir23(f); return [p[0], 1.1, p[2]]; }, 24: (f) => { const p = sir24(f); return [p[0], 1.1, p[2]]; },
  25: (f) => { const p = sir25(f); return [p[0], 1.3, p[2]]; }, 26: () => [SIR26[0], 1.3, SIR26[2]],
};
// the lens: the subject sharp, the far street soft; everything sharp in the wide shots and whenever the voice talks about the cloud
const SHARP = new Set([6, 8, 9, 11]);
export const dofAtP1 = dofFrom(SHOTS_P1.map((s) => ({ f: s.a, cInf: SHARP.has(s.id) ? 0 : s.id === 10 ? 1.5 : 5, focus: focusOf[s.id] })));

// ---------------- the sign: a small disclaimer, two seconds, never spoken ----------------
export type Box = { x0: number; y0: number; x1: number; y1: number };
export const TAGS: { id: number; a: number; b: number; box: Box; lines: string[]; px: number; small?: boolean }[] = [4, 5].map((id) => ({ id, a: Math.max(DISCLAIMER.a, A(id)), b: Math.min(DISCLAIMER.b, E_(id)), box: { x0: 46, y0: 300, x1: 596, y1: 446 }, lines: ["THE EVENTS ARE TRUE", "MY PART IS MADE UP"], px: 50, small: true }));
const camBasis = (c: Cam) => {
  const f = [c.look[0] - c.pos[0], c.look[1] - c.pos[1], c.look[2] - c.pos[2]], fl = Math.hypot(...f); f[0] /= fl; f[1] /= fl; f[2] /= fl;
  let r = [-f[2], 0, f[0]]; const rl = Math.hypot(r[0], r[2]) || 1; r = [r[0] / rl, 0, r[2] / rl];
  const u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]];
  const cr = Math.cos(c.roll), sr = Math.sin(c.roll);
  return { f, r: r.map((v, i) => v * cr + u[i] * sr), u: r.map((v, i) => -v * sr + u[i] * cr) };
};
export const placeBox = (id: number, f: number, b: Box, d = 6) => {
  const c = camAtP1(id, f), Bs = camBasis(c), hh2 = d * Math.tan((c.fov * Math.PI) / 360), hw = hh2 * (1080 / 1920);
  const nx = ((b.x0 + b.x1) / 2 / 1080) * 2 - 1, ny = 1 - ((b.y0 + b.y1) / 2 / 1920) * 2;
  const p: V3 = [0, 1, 2].map((k) => c.pos[k] + Bs.f[k] * d + Bs.r[k] * nx * hw + Bs.u[k] * ny * hh2) as V3;
  return { p, w: ((b.x1 - b.x0) / 1080) * 2 * hw, h: ((b.y1 - b.y0) / 1920) * 2 * hh2 };
};
const rr = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
const labelDraw = (lines: string[], cw: number, ch: number, px: number) => (p: Pen) => {
  const g = p.g; rr(g, 5, 5, cw - 10, ch - 10, 20); g.fillStyle = "#f6efd8"; g.fill(); g.lineWidth = 7; g.strokeStyle = INK; g.stroke();
  g.textAlign = "center"; g.textBaseline = "middle"; g.font = `400 ${px}px Impact, 'Arial Narrow Bold', sans-serif`;
  lines.forEach((l, i) => { g.fillStyle = i === lines.length - 1 && lines.length > 1 ? "#7a1f1c" : INK; g.fillText(l, cw / 2, ch * ((i + 0.5) / lines.length) + 2); });
};
const cards = (out: Stage, id: number, f: number) => {
  for (const t of TAGS) if (t.id === id && f >= t.a && f < t.b) {
    const n = f - DISCLAIMER.a, k = n < 4 ? 0.7 + 0.3 * ((n + 1) / 4) : 1, pl = placeBox(id, f, t.box), cw = t.box.x1 - t.box.x0, ch = t.box.y1 - t.box.y0;
    out.fx.push({ key: `lab|${t.lines.join("|")}|${ch}`, cw, ch, draw: labelDraw(t.lines, cw, ch, t.px), x: pl.p[0], y: pl.p[1], z: pl.p[2], w: pl.w * k, h: pl.h * k, top: true });
  }
};

// ---------------- people: front figures, side runners, the fleeing town ----------------
type Ex = { talk?: number; scale?: number; roll?: number; shadow?: boolean };
const front = (out: Stage, cam: CamInfo, who: Who, p: V3, fo: FrontOpts, f: number, ex: Ex = {}) => {
  const pl = person(out, cam, who, p[0], p[1], p[2], { fo: { mode: "stand", blink: lidAt(f / 30, who.i), ...fo }, talk: ex.talk ?? 0, scale: ex.scale }, false);
  if (ex.roll) pl.roll = ex.roll;
  if (ex.shadow !== false) blob(out, cam, p[0], Math.abs(p[0]) > ROAD && Math.abs(p[0]) < 3.5 ? 0.27 : 0, p[2], ex.scale ?? 1, 0.6);
  return pl;
};
type Run = { who: Who; p0: [number, number]; v: [number, number]; t0: number; hold?: SideOpts["hold"]; expr?: Expr; scale?: number; view?: "side" | "front" | "back"; ph?: number; walk?: boolean };
/** someone running (or walking) in a straight line: the drawing (side, front or back) follows the direction relative to the lens, and the
 *  cycle advances with the distance covered, so the planted foot never slides */
const runner = (out: Stage, cam: CamInfo, f: number, r: Run, fo: FrontOpts = {}, so: SideOpts = {}) => {
  const t = (f - r.t0) / 30, x = r.p0[0] + r.v[0] * t, z = r.p0[1] + r.v[1] * t, sp = Math.hypot(r.v[0], r.v[1]), sc = r.scale ?? 1;
  const y = Math.abs(x) > ROAD && Math.abs(x) < 3.5 ? 0.27 : 0, vw = viewOf(cam, x, z, r.v[0], r.v[1]), view = r.view ?? (vw.c > 0.64 ? "front" : vw.c < -0.64 ? "back" : "side");
  if (r.walk) {
    const ph = q16((sp * t) / (1.6 * sc) + (r.ph ?? 0));
    if (view === "side") person(out, cam, r.who, x, y, z, { side: true, mirror: vw.mirror, scale: sc, so: { mode: "march", phase: ph, stride: 0.8, expr: r.expr ?? "neutral", hold: r.hold, blink: lidAt(f / 30, r.who.i), ...so } }, false);
    else person(out, cam, r.who, x, y, z, { scale: sc, fo: { mode: "stroll", phase: ph, expr: r.expr ?? "neutral", back: view === "back", blink: lidAt(f / 30, r.who.i), ...fo } }, false);
  } else {
    const stride = Math.max(0.6, Math.min(1.2, sp / (RUN_M * 2.7))), ph = q16((sp * t) / (RUN_M * stride * sc) + (r.ph ?? 0));
    if (view === "side") person(out, cam, r.who, x, y, z, { side: true, mirror: vw.mirror, scale: sc, so: { mode: "run", phase: ph, stride, expr: r.expr ?? "shock", hold: r.hold, ...so } }, false);
    else person(out, cam, r.who, x, y, z, { scale: sc, fo: { mode: "march", phase: ph, lift: 100, run: 1, expr: r.expr ?? "shock", back: view === "back", look: 0, blink: 0, ...fo } }, false);
  }
  blob(out, cam, x, y, z, sc, 0.6);
  return [x, y, z] as V3;
};
const HOLDS: (SideOpts["hold"] | undefined)[] = [undefined, "bundle", undefined, "amphora", "basket", undefined, "bundle", undefined];
/** the town on the run: `n` people between z0 (far) and z1 (near), each on a lane of his own, most of them away from the mountain, some
 *  across the street and a few the wrong way; `keep(x, z)` = false leaves a spot free for the main figures */
const town = (out: Stage, cam: CamInfo, f: number, seed: number, n: number, z0: number, z1in: number | null, o: { keep?: (x: number, z: number) => boolean; road?: boolean; calm?: boolean; speed?: number; stagger?: boolean; shelter?: boolean } = {}) => {
  const z1 = z1in ?? cam.pos.z + 1.5, L = z1 - z0, t = f / 30; let shown = 0;   // z1 null: they run on past the lens
  for (let k = 0; k < n; k++) {
    const h1 = hh(k, seed), h2 = hh(k, seed + 1), h3 = hh(k, seed + 2), h4 = hh(k, seed + 3), who = crowdWho(k + seed);
    const kind = h4 < 0.14 ? "cross" : h4 < 0.24 && !o.shelter ? "back" : "flee", sp = (o.calm ? 1.2 : (o.speed ?? 4.2) + 1.6 * h3) * (kind === "back" ? 0.8 : 1);
    let x: number, z: number, v: [number, number];
    if (kind === "cross") { const dir = h1 > 0.5 ? 1 : -1, span = 6.2; z = z0 + L * h2; x = -dir * 3.1 + dir * (((h1 * 7 + (o.calm ? 0.35 : 1.1) * t) % 1) * span); v = [dir * sp, 0.3 * sp * (h3 - 0.3)]; }
    else { const lane = o.road === false || h1 < 0.5 ? (h1 < 0.25 || (o.road === false && h1 < 0.5) ? -1 : 1) * (2.72 + 0.5 * h3) : (h1 - 0.75) * 7.2; const dz = kind === "back" ? -1 : 1; z = z0 + ((h2 * L + dz * sp * t) % L + L) % L; x = lane + 0.25 * Math.sin(t * 1.3 + k); v = [0.25 * 1.3 * Math.cos(t * 1.3 + k), dz * sp]; }
    // making for cover: the nearer they come, the more they swing out to the pavements, under the awnings
    if (o.shelter && kind === "cross" && z > 2.5) continue;
    if (o.shelter && kind !== "cross") { const sd = Math.abs(x) > 0.2 ? Math.sign(x) : h3 > 0.5 ? 1 : -1, u = smooth((z - 0.5) / 4); x = x + (sd * 2.95 - x) * u; }
    if (o.keep && !o.keep(x, z)) continue;
    const st = o.stagger ? { tilt: 8 * Math.sin(f * 0.8 + k * 1.7), expr: (["shock", "nervous"] as Expr[])[k % 2], cheer: k % 3 === 0 ? 0.5 : undefined } : {};
    runner(out, cam, f, { who, p0: [x, z], v, t0: f, hold: HOLDS[(k + seed) % HOLDS.length], scale: 0.96 + 0.08 * h3, ph: h2 * 3 + (Math.hypot(v[0], v[1]) * t) / (o.calm ? 1.6 : RUN_M), walk: o.calm, expr: o.calm ? (["neutral", "smile", "grin", "neutral"] as Expr[])[k % 4] : (["shock", "nervous", "shock", "stern"] as Expr[])[k % 4] }, st);
    shown++;
  }
  return shown;
};
const fxCard = (out: Stage, key: string, draw: (p: Pen) => void, cw: number, ch: number, x: number, y: number, z: number, w: number, rot = 0, tint?: number) => out.fx.push({ key, cw, ch, draw, x, y, z, w, h: (w * ch) / cw, rot, tint });
/** a thing thrown or dropped at frame f0 from p with velocity v: where it is, bouncing twice on the ground at `floor` */
const toss = (f: number, f0: number, p: V3, v: V3, floor = 0.06): V3 & { n?: number } => {
  let t = Math.max(0, (f - f0) / 30), y0 = p[1], vy = v[1], x = p[0], z = p[2], damp = 1;
  for (let k = 0; k < 3; k++) {
    const tl = (vy + Math.sqrt(vy * vy + 19.6 * Math.max(0, y0 - floor))) / 9.8;
    if (t < tl) return [x + v[0] * damp * t, y0 + vy * t - 4.9 * t * t, z + v[2] * damp * t];
    x += v[0] * damp * tl; z += v[2] * damp * tl; t -= tl; y0 = floor; vy = Math.max(0.4, vy * 0.42) * (k === 0 ? 1 : 0.6); damp *= 0.55;
  }
  return [x, floor, z];
};
const tintOf = (id: number, f: number) => { const m = moodAt(id, f); return m <= 0 ? 0xfff2d8 : m < 0.75 ? 0xffb080 : 0x7a4a36; };
/** Sir Digsworth's chain: a damped swing behind the sideways movement of his head */
const sway = (f: number, xOf: (f: number) => number) => Math.round(hangSway(f, (ff) => xOf(ff) / 0.5) * 8) / 8;

// ---------------- what the street and the mountain do ----------------
/** the amphorae that fall and smash, each: where it stands, when it tips, where it lands */
type Pot = { id: number; p: V3; f0: number; v: V3; s?: number; carried?: boolean };
const POTS: Pot[] = [
  { id: 6, p: [-2.85, 1.38, 6.6], f0: A(6) + 8, v: [0.9, 0.6, 0.2] }, { id: 6, p: [2.9, 1.38, 8.6], f0: A(6) + 17, v: [-0.8, 0.4, 0.3] }, { id: 6, p: [-2.8, 0.27, -1.2], f0: A(6) + 12, v: [0.5, 0.2, 0.1] }, { id: 6, p: [2.85, 0.27, 2.9], f0: A(6) + 24, v: [-0.6, 0.3, 0] },
  { id: 12, p: [0.75, 1.2, 5.0], f0: A(12) + 14, v: [0.3, 2.6, 1.1], s: 0.34, carried: true },
  { id: 13, p: [0.6, 1.1, 3.2], f0: A(13) + 12, v: [1.0, 2.4, 0.9], s: 0.75, carried: true }, { id: 13, p: [0.8, 1.1, 2.9], f0: A(13) + 14, v: [1.7, 2.7, 0.3], s: 0.75, carried: true }, { id: 13, p: [0.7, 1.0, 2.7], f0: A(13) + 16, v: [0.5, 3.0, 1.5], s: 0.75, carried: true },
  { id: 22, p: [1.9, 0.27, 5.0], f0: A(22) + 18, v: [0, 0, 0] },
];
const potState = (id: number, f: number) => {
  const pots: NonNullable<PompState["pots"]> = [], smash: NonNullable<PompState["smash"]> = [];
  POTS.forEach((q, i) => {
    if (q.id !== id) return;
    if (f < q.f0) { if (!q.carried) pots.push({ x: q.p[0], y: q.p[1], z: q.p[2], rx: 0, rz: 0.05 * Math.sin(f * 1.7 + i), s: q.s }); return; }
    const t = (f - q.f0) / 30, floor = 0.05, tl = (q.v[1] + Math.sqrt(q.v[1] * q.v[1] + 19.6 * Math.max(0, q.p[1] - floor))) / 9.8;
    if (t < tl && Math.hypot(...q.v) > 0) pots.push({ x: q.p[0] + q.v[0] * t, y: q.p[1] + q.v[1] * t - 4.9 * t * t, z: q.p[2] + q.v[2] * t, rx: 3.4 * t, rz: 2.6 * t + 0.3 * i, s: q.s });
    else smash.push({ x: q.p[0] + q.v[0] * tl, y: 0.12, z: q.p[2] + q.v[2] * tl, t: t - (Math.hypot(...q.v) > 0 ? tl : 0), seed: i });
  });
  return { pots, smash };
};
const TIP0 = A(13) + 9;
export const stAt = (id: number, f: number): PompState => {
  const S: PompState = { eruptT: eruptT(id, f), ...potState(id, f) };
  if (id === 11) { const u = (f - A(11)) / 30; S.pots = [[-0.9, 7.6, 0.5, 1.1], [0.7, 8.6, -0.35, 0.8], [-0.2, 6.3, 0.2, 1.6], [1.4, 7.1, -0.25, 0.6], [-1.5, 8.9, 0.3, 1.3]].map(([x, z, vx, w], i) => ({ x: x + vx * u, y: 0.2, z: z + 0.25 * u, rx: 0.4 * i + w * u, rz: Math.PI / 2, s: 0.5 })); }
  if (id === 8 || id === 9) S.bolts = f / 30;
  if (id === 1) { S.shake = Math.max(0.25, 1 - f / 50); S.cap = 0.55; }
  if (id === 5) S.shake = 0.9 * ease(f, A(5), A(5) + 12) * (1 - 0.7 * ease(f, at("shake", "Here") - 4, at("shake", "Here") + 14));
  if (id === 6) S.shake = 0.6 + 0.4 * prog(6, f);
  if (id === 7) S.shake = f < BLAST ? 0.8 : Math.max(0.3, 1.6 - (f - BLAST) / 40);
  if (id >= 8) S.shake = 0.25;
  if (id === 9 || id === 10) { S.pines = true; S.cap = id === 10 ? 0.86 : 0.95; }
  if (id === 13) S.cart = { x: 0.3, z: 3.0 - 2.6 * (1 - lin(f, A(13) - 3, TIP0)), yaw: Math.PI + 0.2, roll: 1.42 * ease(f, TIP0, TIP0 + 9) + 0.07 * Math.sin((f - TIP0) * 0.9) * Math.exp(-Math.max(0, f - TIP0 - 9) / 6) * (f > TIP0 + 9 ? 1 : 0) };
  if (f >= STONES0 && id >= 21) {
    // per shot: the lane kept clear (the figure and the lens: no stone lands on him or grows huge at the lens), where the field ends, how deep it is, how long it has been falling
    const SP: Record<number, [[number, number, number][], number, number, number]> = { 21: [[[0.2, 0, 0.56]], 8.95, 5, 2.2], 22: [[[-0.5, 0, 1.0]], 7.2, 14, 3], 23: [[[2.55, 0, 0.55]], 0.2, 16, 4],
      24: [[[2.6, 0, 0.6]], 6, 14, 5], 25: [[[0.7, 0, 1.3]], 23, 30, 6], 26: [[[-0.6, 0, 1.0]], 27, 30, 7] };
    const [lane, zmax, span, add] = SP[id];
    S.stones = (f - STONES0) / 30 + add; S.avoid = lane; S.zmax = zmax; S.stoneSpan = span; if (id === 21) S.stoneScale = 0.6; if (id === 24) S.stoneHalf = 2.6;
  }
  if (id === 24) S.awnDrop = (side, z) => (side === 1 && Math.abs(z - 1.0) < 0.1 ? 0.12 + 0.12 * ease(f, A(24), RIP0) + 0.76 * ease(f, RIP0, RIP0 + 13) : 0);
  if (id === 25 || id === 26) S.awnDrop = (side, z) => (side === 1 && Math.abs(z - 1.0) < 0.1 ? 1 : hh(Math.round(z * 3), 5) > 0.55 ? 1 : 0);
  if (id === 23) S.awnDrop = (side, z) => (side === 1 && Math.abs(z - 1.0) < 0.1 ? 0.12 * prog(23, f) : 0);
  return S;
};
export const pompAt = stAt;

// ---------------- gaze events and counts for the layout check ----------------
export type Ev = { a: number; b: number; pos: (f: number) => V3; who?: string[] };
export const EVENTS: Ev[] = [];
export const COUNTS: { id: number; min: number; max: number; what: string }[] = [{ id: 11, min: 40, max: 9999, what: "people in the street seen from above (about eleven thousand live here)" }];
export const lampsP1 = (): [number, number, number, number, boolean][] => [];

// ---------------- the scenes ----------------
export const sceneAtP1 = (id: number, f: number, cam: CamInfo): Scene => {
  const out: Scene = { places: [], fx: [], guns: [], crates: [], fan: 0 };
  const t = f / 30, n = f - A(id), tint = tintOf(id, f);
  if (id === 1) {
    // f0: he is in the air, arms flung up, the loaf just out of his right hand; he lands in a crouch, turns his back to look, spins to the lens, points, runs
    const s = sir1(f), p: V3 = [s.x, s.y, s.z];
    const turn = f >= 26 && f < 62, runs = f >= 92;
    const fo: FrontOpts = f < 12 ? { mode: "fall", expr: "shock", look: 0.4, blink: 0 }
      : f < 26 ? { mode: "stand", crouch: 0.75 * (1 - ease(f, 18, 26)) + 0.2, hands: "head", expr: "shock", look: 0.6, lookUp: 0.5, blink: 0 }
      : turn ? { mode: "stand", back: true, cheer: 0.55 * (1 - ease(f, 44, 58)), tilt: 3 * Math.sin(f * 0.25), expr: "shock", look: 0.8, lookUp: 0.9 }
      : runs ? { mode: "march", phase: q16((f - 92) * 0.085), lift: 100, run: 1, expr: "shock", look: 0, blink: 0 }
      : { mode: "stand", tilt: -3 * ease(f, 64, 72), facing: f < 68 ? 1 : 0, point: ease(f, 66, 74) * (1 - ease(f, 86, 92)), expr: "shock", look: 0.7 * (1 - ease(f, 70, 80)), blink: 0 };
    front(out, cam, SIR, p, { ...fo, chain: sway(f, (ff) => (ff < 12 ? 0.25 * ff / 12 : ff < 26 ? 0.25 - 0.4 * (ff - 12) / 14 : ff < 62 ? -0.15 : 0.2)) }, f, { talk: turn ? 0 : talkOf(f) });
    const lf = toss(f, 0, [s.x + 0.44, 1.5, SIR1[2] + 0.05], [0.14, 1.7, 0.08], 0.1);
    fxCard(out, "loaf", fxLoaf, 220, 160, lf[0], lf[1], lf[2], 0.3, -0.35 - Math.min(f, 26) * 0.24, tint);
    for (let k = 0; k < 3 && f < 9; k++) fxCard(out, "whoosh" + k, (pp) => { pp.g.strokeStyle = "#fff2c0"; pp.g.lineWidth = 9; pp.g.lineCap = "round"; pp.g.beginPath(); pp.g.moveTo(14, 50); pp.g.lineTo(86, 22); pp.g.stroke(); }, 100, 70, s.x + 0.66 + 0.02 * k, 1.36 + 0.1 * k, SIR1[2] - 0.06, 0.2, -0.5 + 0.25 * k);
    town(out, cam, f, 11, 30, -46, null, { keep: (x, z) => x > 1.3 || (x < -2.4 && z < -4) });
  } else if (id === 2) {
    const p = sir2(f);
    front(out, cam, SIR, p, { mode: "stroll", phase: q16(n * 0.034), expr: "smile" as Expr, wave: n > 12 && n < 34 ? Math.sin((n - 12) * 0.5) : undefined, look: -0.4 * ease(f, A(2) + 8, A(2) + 16) }, f, { talk: talkOf(f) });
    runner(out, cam, f, { who: SOLDIER, p0: [-0.12, -5.5], v: [0, 1.0], t0: A(2), walk: true, expr: "stern" });
    town(out, cam, f, 23, 18, -40, null, { calm: true, keep: (x) => x < -0.7 || x > 1.9 });
  } else if (id === 3) {
    // the baker comes from the oven with a loaf and sets it down on the counter among the others
    const u = ease(f, A(3), A(3) + 13), bx = lerp(5.5, 4.78, u);
    front(out, cam, BAKER, [bx, 0.02, 0.0], { mode: u < 1 ? "stroll" : "stand", phase: q16(n * 0.05), hands: u < 1 ? "loaf" : undefined, expr: "grin", cheer: u >= 1 ? 0.35 * Math.abs(Math.sin((n - 13) * 0.45)) : undefined, blink: 0 }, f, { shadow: false });
    const dn = ease(f, A(3) + 11, A(3) + 17);
    if (dn > 0) fxCard(out, "loaf", fxLoaf, 220, 160, 4.1, lerp(1.42, 1.105, dn) + 0.03 * Math.sin(Math.PI * lin(f, A(3) + 17, A(3) + 23)), 0.13, 0.16, 0, tint);
  } else if (id === 4) {
    // he trots out of the doorway to the end of his chain, it pulls him up short, he barks at the street with his tail going
    const barking = n > 8, hop = barking ? 0.12 * Math.abs(Math.sin(n * 0.42)) : 0.04 * Math.abs(Math.sin(n * 0.8));
    dog(out, cam, { x: -2.9, y: 0.27 + hop, z: -6.85, scale: 1.0, mode: barking ? "bark" : "stand", phase: q16(n * 0.11), chain: true, expr: "happy", k: t * 3.6, blink: lidAt(t, 5) });
  } else if (id === 5) {
    // everything on the counter rattles; a cup walks off the edge; he steadies a jar, then shrugs and flips a coin: here, it always shakes
    const here = at("shake", "Here") - 4, sh = ease(f, A(5), A(5) + 12) * (1 - 0.7 * ease(f, here, here + 14));
    front(out, cam, MERCHANT, [-4.8 + 0.03 * sh * Math.sin(f * 1.9), 0.3, 1.0], { mode: "stand", hands: f < here + 2 ? "purse" : f < here + 18 ? undefined : "purseR", shrug: f >= here + 2 && f < here + 18 ? 1 : undefined, expr: f < here ? "nervous" : ("smile" as Expr), tilt: f < here ? 4 * sh * Math.sin(f * 0.6) : 0, headTilt: f >= here ? 5 * Math.sin((f - here) * 0.2) : 0, look: f < here ? 0.5 : 0, blink: f < here ? 0 : lidAt(t, 13) }, f, { shadow: false });
    for (let k = 0; k < 3; k++) { const cx0 = -3.92, cz = -0.05 + k * 0.28, off = f - (A(5) + 10 + k * 9), fall = off > 0 && k < 2, c = fall ? toss(f, A(5) + 10 + k * 9, [cx0 + 0.3, 1.1, cz], [1.1, 0.8, 0.1], -0.4) : [cx0 + 0.3 * lin(f, A(5), A(5) + 10 + k * 9) * (k < 2 ? 1 : 0.4), 1.1 + 0.012 * sh * Math.abs(Math.sin(f * 2.7 + k)), cz];
      fxCard(out, "cup", fxCup, 100, 100, c[0], c[1], c[2], 0.1, fall ? off * 0.4 : 0.14 * sh * Math.sin(f * 2.3 + k), tint); }
    if (f >= here + 6) { const u = ((f - here - 6) % 22) / 22; fxCard(out, "coin", fxCoin, 100, 100, -4.42, 1.22 + 0.3 * Math.sin(Math.PI * u), 1.44, 0.07, u * 12, tint); }
  } else if (id === 6) {
    // the people in the street stop, stagger, look about them; the jars come off the stalls
    town(out, cam, f, 41, 24, -34, 0, { calm: true, stagger: true, keep: (x, z) => z < -1.5 || Math.abs(x) > 2.5 });
    front(out, cam, crowdWho(0), [-0.9 + 0.16 * Math.sin(f * 0.9), 0, 1.6], { mode: "stroll", phase: q16(n * 0.07), tilt: 10 * Math.sin(f * 0.8), expr: "shock", cheer: 0.5, look: 0.5 }, f);
    front(out, cam, crowdWho(2), [1.1 - 0.1 * Math.sin(f * 0.7), 0, 0.4], { mode: "stroll", phase: q16(n * 0.06), tilt: -6 * Math.sin(f * 0.9), expr: "nervous", shrug: 1, look: -0.4 }, f);
  } else if (id === 7) {
    // three backs against the mountain: at the blast they are thrown back, arms up
    const b = f >= BLAST, e = lin(f, BLAST, BLAST + 6), back = (who: Who, p: V3, k: number) => {
      const rec = b ? 0.3 * smooth(lin(f, BLAST, BLAST + 10)) + 0.22 * Math.max(0, f - BLAST - 10) / 30 : 0;
      front(out, cam, who, [p[0], b && f < BLAST + 9 ? 0.16 * Math.sin(Math.PI * e) : 0, p[2] + rec], b && f < BLAST + 12 ? { mode: "fall", back: true, tilt: 4 * k } : b ? { mode: "march", phase: q16((f - BLAST) * 0.07 + k * 0.3), lift: 80, back: true, cheer: 0.7, tilt: 3 * k } : { mode: "stroll", phase: q16(n * 0.03 + k * 0.2), back: true, tilt: 3 * Math.sin(f * 0.9 + k) }, f);
    };
    back(SIR, [-0.9, 0, 4.2], -1);
    town(out, cam, f, 51, 16, -40, null, { calm: !b, keep: (x) => x < -2.5 || x > 1.6 });
  } else if (id === 8) {
    void 0;   // the mountain alone: the column, the fire in its foot, the lightning
  } else if (id === 9) {
    void 0;   // the column over the roofs: nobody in the bottom of this upward look
  } else if (id === 10) {
    // he hurries toward us, glancing over his shoulder, talking: the lens lets him come closer
    const p = sir10(f), glance = Math.sin(n * 0.14) > 0.3;
    front(out, cam, SIR, p, { mode: "march", phase: q16(n * 0.052), lift: 70, facing: glance ? -1 : 0, expr: "shock", look: glance ? -0.9 : 0.1, lookUp: glance ? 0.6 : 0, blink: 0 }, f, { talk: talkOf(f) });
    town(out, cam, f, 71, 24, -40, null, { keep: (x) => x > 0.9 || x < -2.4 });
  } else if (id === 11) {
    town(out, cam, f, 81, 70, -30, 7.4, { shelter: true });
    ([[0.2, 7.7, 0.3], [-1.3, 6.9, 1.2], [1.0, 9.0, 2.1], [-0.4, 9.3, 0.7], [1.6, 6.2, 2.6]] as number[][]).forEach(([x, z, r]) => out.fx.push({ key: "loaf", cw: 220, ch: 160, draw: fxLoaf, x, y: 0.05, z, w: 0.36, h: 0.26, flat: true, rot: r, tint }));
  } else if (id === 12) {
    // she runs away from the mountain with her bundle, he runs back for his jar: they meet in the middle
    const hit = A(12) + 14, wz = (ff: number) => (ff < hit ? 5.0 - 0.42 - 4.4 * (hit - ff) / 30 : 5.0 - 0.42 + 0.9 * (ff - hit) / 30), mz = (ff: number) => (ff < hit ? 5.0 + 0.42 + 4.0 * (hit - ff) / 30 : 5.0 + 0.42 + 0.5 * (ff - hit) / 30);
    if (f < hit) { runner(out, cam, f, { who: WOMAN, p0: [0.3, wz(f)], v: [0, 4.4], t0: f, ph: n * 0.09, hold: "bundle", view: "side" }); runner(out, cam, f, { who: crowdWho(2), p0: [0.3, mz(f)], v: [0, -4.0], t0: f, ph: n * 0.085 + 0.4, hold: "amphora", view: "side" }); }
    else { const k = lin(f, hit, hit + 8);
      const a = person(out, cam, WOMAN, 0.3, 0, wz(f), { side: true, mirror: false, so: { mode: "stand", expr: "dazed", hold: "bundle", lean: -14 * Math.sin(Math.PI * k) } }, true);
      const b2 = person(out, cam, crowdWho(2), 0.3, 0.12 * Math.sin(Math.PI * k), mz(f), { fo: { mode: "fall", expr: "shock", blink: 0 } }, true); a.roll = -0.12 * Math.sin(Math.PI * k); b2.roll = 0.3 * k; }
    town(out, cam, f, 91, 10, -6, 16, { road: false, keep: (x) => x > 2.5 });
  } else if (id === 13) {
    // the man pushing the cart loses it: it rides up on the kerb stone and goes over; he jumps clear; the jars fly at the lens
    // a man runs his handcart down the street; a wheel rides up on the kerb stone and the cart goes over onto its side; he is thrown clear; the jars fly
    const cz = 3.0 - 2.6 * (1 - lin(f, A(13) - 3, TIP0));
    if (f < TIP0 + 2) person(out, cam, crowdWho(7), 0.3, 0, cz - 1.9, { fo: { mode: "march", phase: q16(n * 0.08), lift: 90, expr: f < TIP0 - 3 ? "nervous" : "shock", cheer: 0.25, blink: 0 } }, true);
    else { const k = lin(f, TIP0 + 2, TIP0 + 15), pl = front(out, cam, crowdWho(7), [0.3 - 0.75 * smooth(k), 0.4 * Math.sin(Math.PI * k), 1.1 + 0.4 * k], k < 1 ? { mode: "fall", expr: "shock", blink: 0 } : { mode: "stand", crouch: 0.6, hands: "head", expr: "shock", blink: 0 }, f); pl.roll = 0.5 * Math.sin(Math.PI * k); }
    town(out, cam, f, 101, 16, -30, null, { keep: (x) => x > 2.5 || x < -2.6 });
  } else if (id === 14) {
    // the lens runs along the street with them: bundle, jar, basket, the boy overtaking
    const z0 = 9.0 + 3.6 * n / 30;
    runner(out, cam, f, { who: WOMAN, p0: [-0.4, 9.0 - 0.55], v: [0, 4.1], t0: A(14), hold: "bundle", view: "side" });
    runner(out, cam, f, { who: crowdWho(2), p0: [-1.5, 9.0 + 0.3], v: [0, 4.9], t0: A(14), hold: "basket", view: "side", ph: 0.3 });
    runner(out, cam, f, { who: BOY, p0: [-1.4, 9.0 - 2.1], v: [0, 4.35], t0: A(14), view: "side", ph: 0.6 });
    town(out, cam, f, 111, 8, z0 - 10, z0 + 10, { road: false, keep: (x) => x < -2.5 });
  } else if (id === 15) {
    // feet: they come at the lens on both sides of it and pass
    ([[-0.7, 0, 4.6, 0], [0.85, 0.5, 4.9, 6], [-1.8, 2.4, 4.3, 3], [0.1, 2.9, 5.2, 1], [1.7, 3.6, 4.5, 4], [-0.9, 5.4, 4.8, 5], [0.9, 6.3, 4.4, 2], [-2.9, 4.4, 4.6, 7], [2.9, 1.8, 4.7, 8], [0.0, 8.5, 5.0, 9], [-1.9, 8.0, 4.5, 10], [1.9, 9.4, 4.9, 11]] as number[][]).forEach(([x, ahead, sp, k]) =>
      runner(out, cam, f, { who: crowdWho(k), p0: [x, 9.0 + ahead], v: [0, sp], t0: A(15), view: "back", ph: k * 0.37, scale: k % 5 === 1 ? 0.82 : 1 }));
  } else if (id === 16) {
    const p = runner(out, cam, f, { who: BAKER, p0: [0.45, -4.5], v: [0, 5.2], t0: A(16), hold: "basket", view: "side" });
    for (let k = 0; k < 4; k++) { const f0 = A(16) + 3 + k * 7; if (f < f0) continue; const z0 = -4.5 + 5.2 * (f0 - A(16)) / 30 - 0.15, l = toss(f, f0, [0.55, 0.95, z0], [-0.2 + 0.15 * k, 1.5, 2.0], 0.1); fxCard(out, "loaf", fxLoaf, 220, 160, l[0], l[1], l[2], 0.26, (f - f0) * 0.33, tint); }
    town(out, cam, f, 121, 8, p[2] - 9, p[2] + 9, { road: false, keep: (x) => x > 2.5 });
  } else if (id === 17) {
    // from above: he comes straight down the street, shouldering a slower man aside
    const p = sol17(f), back = n > 16 && n < 28;
    front(out, cam, SOLDIER, p, { mode: "march", phase: q16(n * 0.088), lift: 100, run: 1, facing: back ? -1 : 0, expr: back ? "shock" : "stern", look: back ? -0.9 : 0, blink: 0, tilt: 5 * Math.sin(n * 0.3) }, f);
    town(out, cam, f, 131, 12, p[2] - 16, p[2] - 2.5, { keep: (x) => x < -1.5 || x > 2.6 });
  } else if (id === 18) {
    // both arms sweep the day's coins toward the purse; some get away
    front(out, cam, MERCHANT, [-4.8 + 0.05 * Math.sin(n * 0.9), 0.3, 1.0], { mode: "stand", hands: "purse", tilt: 7 * Math.sin(n * 0.42), expr: "shock", look: 0.3 * Math.sin(n * 0.3), blink: 0 }, f, { shadow: false });
    for (let k = 0; k < 7; k++) { const f0 = A(18) + 2 + k * 3, c = f < f0 ? [-4.0 + 0.05 * k, 1.1, 0.4 + 0.2 * k] : toss(f, f0, [-4.0 + 0.05 * k, 1.1, 0.4 + 0.2 * k], [1.0 + 0.2 * k, 1.5 + 0.2 * (k % 3), 0.3 - 0.15 * k], 1.07); fxCard(out, "coin", fxCoin, 100, 100, c[0], c[1], c[2], 0.085, (f - f0) * 0.5, tint); }
  } else if (id === 19) {
    // the coins roll across the road at the lens; behind them he comes out of his shop at a run, the purse spilling
    const p = mer19(f);
    runner(out, cam, f, { who: MERCHANT, p0: [p[0], p[2]], v: [0, 4.6], t0: f, ph: (n + 4) * 0.09, hold: "purse", view: "side" });
    for (let k = 0; k < 6; k++) { const u = lin(f, A(19) - 10 + k * 2, A(19) + 12 + k * 2), x = lerp(-1.7, -0.85 + 0.22 * k, u), z = lerp(1.6 + 0.3 * k, 3.95 + 0.1 * k, smooth(u) * 0.5 + 0.5 * u); fxCard(out, "coin", fxCoin, 100, 100, x, 0.055 + 0.05 * Math.abs(Math.sin(u * 9 + k)) * (1 - u), z, 0.1, -u * 22 - k, tint); }
    for (let k = 0; k < 3; k++) { const f0 = A(19) + 4 + k * 6; if (f >= f0) { const z0 = -0.4 + 4.6 * (f0 - A(19) + 4) / 30, c = toss(f, f0, [p[0] + 0.25, 1.0, z0 + 0.3], [0.5, 0.8, 1.5], 0.05); fxCard(out, "coin", fxCoin, 100, 100, c[0], c[1], c[2], 0.085, (f - f0) * 0.6, tint); } }
  } else if (id === 20) {
    // the wind of it takes his cap: both hands go up and clamp it on while he runs
    const p = sir20(f), grab = at("run", "grab") - 2;
    front(out, cam, SIR, p, f < grab ? { mode: "march", phase: q16(n * 0.09), lift: 100, run: 1, expr: "shock", look: 0, blink: 0 } : { mode: "march", phase: q16(n * 0.09), lift: 100, hands: "head", expr: "shock", look: 0, lookUp: 0.4, blink: 0 }, f, { talk: talkOf(f) });
    town(out, cam, f, 141, 22, -40, null, { keep: (x) => x > 1.1 || x < -2.5 });
  } else if (id === 21) {
    // seen from above: he looks up, steps this way and that as the first stones come down around him
    const p = sir21(f);
    front(out, cam, SIR, p, { mode: "stroll", phase: q16(n * 0.06), hands: n > 16 ? "head" : undefined, crouch: n > 16 ? 0.3 + 0.2 * Math.sin(n * 0.4) : 0, expr: "shock", look: 0.3 * Math.sin(n * 0.2), lookUp: 0.9, headTilt: 4 * Math.sin(n * 0.2), blink: 0, chain: sway(f, (ff) => sir21(ff)[0]) }, f, { talk: talkOf(f) });
    town(out, cam, f, 151, 10, p[2] - 16, p[2] - 3, { keep: (x) => Math.abs(x) > 1.6 });
  } else if (id === 22) {
    // from the ground: stones bounce at the lens; he scuttles across bent double, hands on his cap; a jar on the pavement bursts
    const p = sir22(f);
    front(out, cam, SIR, p, { mode: "march", phase: q16(n * 0.1), lift: 55, hands: "head", crouch: 0.75 + 0.1 * Math.sin(n * 0.6), facing: 1, expr: "shock", look: 0.6, lookUp: 0.7, blink: 0 }, f, { talk: talkOf(f) });
    town(out, cam, f, 161, 14, -30, null, { keep: (x) => Math.abs(x) > 2.5 });
  } else if (id === 23) {
    // he runs for the baker's awning (his back to us), leaps the kerb in a dive and lands under it in a crouch, turning round
    const p = sir23(f), air = f >= DIVE0 && f < DIVE1, under = f >= DIVE1;
    const pl = front(out, cam, SIR, p, air ? { mode: "fall", back: true } : under ? { mode: "stand", crouch: 0.8 - 0.25 * ease(f, DIVE1 + 3, DIVE1 + 12), hands: "head", expr: "shock", look: -0.5, lookUp: 0.8, blink: 0 } : { mode: "march", phase: q16(n * 0.1), lift: 100, run: 1, back: true }, f, { talk: under ? talkOf(f) : 0 });
    if (air) pl.roll = -0.55 * Math.sin(Math.PI * lin(f, DIVE0, DIVE1));
    town(out, cam, f, 171, 10, -30, -3, { road: true, keep: (x) => x < 1.2 });
  } else if (id === 24) {
    // from inside the shop: he crouches under the cloth with his back to us, looking up as it sags under the stones; it tears off the wall and comes
    // down in the street; he backs into the shop, straightens up and turns round to us
    const p = sir24(f), turned = f >= RIP0 + 5, up = ease(f, RIP0 + 12, RIP0 + 24);
    front(out, cam, SIR, p, turned ? { mode: f < RIP0 + 16 ? "stroll" : "stand", phase: q16((f - RIP0) * 0.06), crouch: 0.7 * (1 - up), hands: up < 0.6 ? "head" : undefined, shrug: up >= 0.6 && f < RIP0 + 40 ? 1 : undefined, expr: up < 1 ? "shock" : "nervous", look: -0.5 * (1 - up), blink: lidAt(t, 3), chain: sway(f, (ff) => sir24(ff)[0]) }
      : { mode: "stand", back: true, crouch: 0.55 + 0.2 * ease(f, RIP0 - 4, RIP0 + 2), hands: "head", tilt: 3 * Math.sin(n * 0.3) }, f, { talk: turned ? talkOf(f) : 0 });
  } else if (id === 25) {
    // he runs at the lens and the lens pulls away from him: behind him the day goes out
    const p = sir25(f), lookBack = f >= DARK0 - 8 && f < DARK0 + 24;
    front(out, cam, SIR, p, { mode: "march", phase: q16(n * 0.09), lift: 100, run: 1, facing: lookBack ? -1 : 0, expr: "shock", look: lookBack ? -0.9 : 0, lookUp: lookBack ? 0.7 : 0, blink: 0 }, f, { talk: talkOf(f) });
    town(out, cam, f, 181, 22, p[2] - 34, null, { keep: (x) => Math.abs(x - 0.35) > 1.4 });
  } else if (id === 26) {
    // he has stopped and turned: his back, the black street, the mountain burning
    const u = lin(f, A(26), A(26) + 14);
    front(out, cam, SIR, [SIR26[0], 0, SIR26[2] + 0.35 * (1 - smooth(u))], u < 1 ? { mode: "stroll", phase: q16(n * 0.05), back: true } : { mode: "stroll", phase: q16(14 * 0.05 + (n - 14) * 0.012), back: true, cheer: 0 }, f);
    town(out, cam, f, 191, 9, SIR26[2] - 34, null, { keep: (x) => x > 0.6 || x < -2.4 });
  }
  return out;
};
export const SHOW_P1: Show = { shots: SHOTS_P1, camAt: camAtP1, sceneAt: sceneAtP1, crowdFor: () => null, wheatAt: () => 1, pompAt, moodAt, flareAt };

/** what scripts/kit_check.mjs needs from a film */
export const FILM_CHECK = {
  shots: SHOTS_P1, camAt: camAtP1, sceneAt: sceneAtP1, kinds: SHOT_KIND, texts: TEXTS, events: EVENTS, counts: COUNTS, tags: TAGS, lamps: lampsP1, flareAt,
  passengers: [] as string[], deckAt: undefined, total: TOTAL_P1, band: { y0: 1400, y1: 1600 },
  captions: { chunks: chunkWords(WORDS, CHUNKS).filter((c) => c.a * 30 >= HOOK_END - 1) }, endHook: END_HOOK, signFacts: [] as string[],
  flashback: FLASHBACK, disclaimer: DISCLAIMER, action: true, cover: { 3: true, 5: true, 18: true } as Record<number, boolean>,
};
void AZ; void cards; void BOY; void OUT0;
