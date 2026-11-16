// "I Survived the Titanic: Part 3" (Short, 1080 x 1920, 35 s): shots, cameras, lens, what stands where on which word.
// Spec: SCRIPT-titanic-3.md. Every shot starts 1-3 frames before its word (voice/titanic-3/words.json -> wordsT3.json).
// Deck coordinates ("nominal"): x along the ship (the bow is at -x), z across (the sea side is +z, the rail at 14.5, the house at -9).
// The deck tilts (bow down) and sinks: deckPt() turns a nominal point into the world. Night and dawn sets are in t3sets.ts.
import { Cam, Key, ShotDef, V3, run, pushK, zoom, dofFrom, layersFrom, smooth, lerp } from "./story";
import { Scene, Show, SIR } from "./scenes";
import { Stage, CamInfo, person, blob, lidAt, hh } from "./castbase";
import { Outfit, INK, Pen, SIR_DIGSWORTH, FrontOpts, SideOpts } from "./toon";
import { DECK, ROCKETS, deckPt, deckSink, lamps } from "./deckset";
import { chunkWords, CAP } from "./captions";
const CAPFONT = CAP.font;
import { DeckState, SEA, RAFT, LINER, CARP, CDECK_Y, BOATS_NIGHT, BOATS_DECK, boatAt, raftSpots } from "./t3sets";
import wordsJson from "./wordsT3v2.json";
import talkJson from "./talkT3v2.json";

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
export const WORDS_T3 = WORDS;
const TALK = talkJson as number[];
const talkOf = (f: number) => TALK[Math.max(0, Math.min(TALK.length - 1, f))] ?? 0;
export const TOTAL_T3 = 1082;
export const HOOK_END = 48;
/** the hook as text: two lines in a free band under the biggest figure (y = pixels at 1080 x 1920) */
export const HOOK = { lines: ["THE TITANIC", "IS SINKING"], x: 60, y: 1373, w: 960, h: 250, size: 118 };   // the hook sits where the captions will sit: they only start after it

// ---------------- the cast ----------------
type Who = { i: number; o: Outfit; okey: string };
const OFFICER: Who = { i: 41, o: { jacket: "#3f5a94", pants: "#34497a", boots: INK, hat: "peaked", cap: "#f1efe6", moustache: "#5b3a22", buttons: "#e2bb4c", gent: true }, okey: "officer" };
const OFFICER_C: Who = { ...OFFICER, okey: "c_officer" };
const LADY: Who = { i: 52, o: { jacket: "#7b5ac9", pants: "#3b3f52", boots: "#4a3426", hat: "bonnet", dress: "#c25a7a", gent: true }, okey: "lady" };
const KID: Who = { i: 57, o: { jacket: "#2c4a7a", pants: "#2c4a7a", boots: INK, hat: "cap", cap: "#f1efe6", build: "kid", gent: true }, okey: "kid" };
const GENT: Who = { i: 63, o: { jacket: "#8a7a68", pants: "#55505e", boots: INK, hat: "tophat", cap: "#55505e", beard: "#6b4a2a", buttons: "#c9a94a", gent: true }, okey: "gent" };
const GENT_C: Who = { ...GENT, okey: "c_gent" };
const SIR_B: Who = { i: 3, o: { ...SIR_DIGSWORTH, shawl: "#8a8f9c" }, okey: "sir_b" };   // Sir Digsworth with a grey blanket over his shoulders
const CROWD_O: Outfit[] = [
  { jacket: "#4b4f5e", pants: "#2f3342", boots: INK, hat: "tophat", cap: "#2a2c36", gent: true },
  { jacket: "#6e5a46", pants: "#3c3a44", boots: INK, hat: "cap", cap: "#5a4a3a", gent: true },
  { jacket: "#2f4a6e", pants: "#2a3350", boots: INK, hat: "peaked", cap: "#f1efe6", gent: true, moustache: "#4a3020" },
  { jacket: "#7a4b4b", pants: "#3a3a44", boots: "#4a3426", hat: "bonnet", dress: "#8a4a60", gent: true },
  { jacket: "#5a6a4a", pants: "#3b3b44", boots: INK, hat: "cap", cap: "#3a3a36", gent: true, beard: "#8a6a3a" },
  { jacket: "#8a8070", pants: "#4a4658", boots: INK, hat: "tophat", cap: "#3a3a44", gent: true, moustache: "#6b4a2a" },
  { jacket: "#5a4a8a", pants: "#3b3f52", boots: "#4a3426", hat: "bonnet", dress: "#4a6a8a", gent: true },
  { jacket: "#3a4a5a", pants: "#2c3340", boots: INK, hat: "cap", cap: "#2c4a7a", gent: true },
  { jacket: "#7a6a3a", pants: "#4a4034", boots: INK, hat: "tophat", cap: "#4a4034", gent: true, beard: "#4a3a2a" },
  { jacket: "#8a5a3a", pants: "#3b3f52", boots: "#4a3426", hat: "bonnet", dress: "#6a7a5a", gent: true },
  { jacket: "#2c4a7a", pants: "#2c4a7a", boots: INK, hat: "cap", cap: "#f1efe6", gent: true, build: "kid" },
  { jacket: "#6a6a74", pants: "#34343e", boots: INK, hat: "peaked", cap: "#34343e", gent: true, moustache: "#5b3a22" },
];
const crowdWho = (k: number): Who => ({ i: 70 + (k % 12) * 3, o: CROWD_O[k % CROWD_O.length], okey: "c_" + (k % CROWD_O.length) });

// ---------------- shots ----------------
const BEATS: [number, string, number, "night" | "golden"][] = [
  [1, "hook: the deck tilts, Sir Digsworth slips, a rocket bursts in open sky", 0, "night"],
  [2, "truth: close-up, calm, mouth follows the voice", at("truth") - 2, "night"],
  [3, "recap: the empty davits, the lifeboats rowing away", at("recap") - 2, "night"],
  [4, "recap: about 1,500 of us are left: the deck packed", at("recap", "About") - 2, "night"],
  [5, "rockets: they look up", at("rockets") - 3, "night"],
  [6, "bow: down the tilted deck, the sea has covered the forward deck", at("bow") - 3, "night"],
  [7, "the sea comes up the deck: they climb toward the lens, a bench slides away", at("bow", "sea") - 2, "night"],
  [8, "gone: from a lifeboat, the liner low by the bow", at("gone") - 2, "night"],
  [9, "gone: wreckage on the water", at("gone", "Titanic") - 3, "night"],
  [10, "boat: swimming for the overturned lifeboat", at("boat") - 2, "night"],
  [11, "boat: Sir reaches the near end of the hull, climbs and stands on it", at("boat", "lifeboat") - 4, "night"],
  [12, "boat: about thirty men cling to it, the camera glides along the keel", at("boat", "About") - 2, "night"],
  [13, "dawn: the Carpathia arrives", at("dawn") - 3, "golden"],
  [14, "count: about 700 saved, about 1,500 lost", at("count") - 3, "golden"],
  [15, "end: I survived the Titanic. Most did not. Next: Pompeii.", at("end") - 3, "golden"],
];
export const SHOTS_T3: ShotDef[] = BEATS.map(([id, name, a, light], i) => ({ id, name, a, b: i + 1 < BEATS.length ? BEATS[i + 1][2] : TOTAL_T3, zone: "deck" as const, light, sunAz: light === "night" ? (id === 1 ? 160 : 118) : 35, sunEl: light === "night" ? undefined : 9 }));
export const A_T3: number[] = SHOTS_T3.map((s) => s.a);   // A_T3[k] = the start of shot k + 1
export const layersT3 = layersFrom(SHOTS_T3, {});
export const SHOT_KIND: Record<number, "medium" | "close" | "wide" | "sea" | "group" | "glide"> = { 1: "group", 2: "medium", 3: "wide", 4: "group", 5: "medium", 6: "group", 7: "medium", 8: "medium", 9: "wide", 10: "medium", 11: "group", 12: "glide", 13: "group", 14: "group", 15: "medium" };
const shotOf = (id: number) => SHOTS_T3[id - 1];
const prog = (id: number, f: number) => Math.max(0, Math.min(1, (f - shotOf(id).a) / (shotOf(id).b - shotOf(id).a)));
/** the narration that speaks of deaths (frames): from "the Carpathia" through "Most did not." */
export const GRIEF = [{ a: 780, b: at("end", "not") + 8 }];
const grief = (f: number) => GRIEF.some((g) => f >= g.a && f < g.b);
const blinkOf = (t: number, i: number, sw: number[] = []) => (grief(Math.round(t * 30)) ? 0 : lidAt(t, i, sw));
const calm = (f: number, ex: FrontOpts["expr"]): FrontOpts["expr"] => (grief(f) && !["nervous", "neutral", "shock"].includes(ex ?? "neutral") ? "nervous" : ex);

// ---------------- what the ship and the sets do ----------------
export const stAt = (id: number, f: number): DeckState => {
  const u = prog(id, f);
  switch (id) {
    case 1: return { set: "deck", tilt: 0.2, xw: -4 };
    case 2: return { set: "deck", tilt: 0.06, xw: -14, dress: true };
    case 3: return { set: "deck", tilt: 0.03, xw: -8, boats: "deck", calm: true, fgDavits: [9.2, 0.03, 14.2] };
    case 4: return { set: "deck", tilt: 0.04, xw: -60 };
    case 5: return { set: "deck", tilt: 0.05, xw: -8 };
    case 6: return { set: "deck", foam: true, calm: true, tilt: lerp(0.08, 0.12, u), xw: lerp(-7, -2, u), bench: 4.2 - 0.0045 * (f - A_T3[5]) ** 2 * 1.4 };
    case 7: return { set: "deck", foam: true, tilt: 0.13, xw: lerp(-10, -6, u) };
    case 8: return { set: "night", boats: "night", calm: true, liner: { pitch: lerp(0.05, 0.16, u), sink: lerp(-3.4, -3.0, u) } };
    case 9: return { set: "night", debris: "wreck" };
    case 10: return { set: "night", debris: "near", calm: true };
    case 11: case 12: return { set: "night", raft: true, debris: "near", calm: true };
    case 13: return { set: "dawn", raft: true, calm: true };
    default: return { set: "cdeck" };
  }
};
export const deckAt = (id: number, f: number): DeckState => stAt(id, f);

// ---------------- distress rockets (world coordinates; far away, so the star is big and sits in open sky) ----------------
const W0 = (x: number, y: number, z: number, tilt = 0.05): V3 => deckPt({ set: "deck", tilt, xw: -4 }, x, y, z);
export const R_BURST = { r0: 0.12, r1: 11.0, r2: 12.95 };
ROCKETS.length = 0;
ROCKETS.push(
  { t0: R_BURST.r0 - 0.7, rise: 0.7, from: W0(-25, 1.6, 7.65, 0.2), apex: W0(-25, 3.9, 7.65, 0.2), radius: 1.5, glow: 3.5, noDepth: true },
  { t0: R_BURST.r1 - 1.0, rise: 1.0, from: W0(-30, 2.5, 2.2), apex: W0(-30, 6.2, 2.2), radius: 1.8, glow: 3.5 },
  { t0: R_BURST.r2 - 1.2, rise: 1.2, from: W0(-30, 2.5, 2.4), apex: W0(-30, 5.2, 2.4), radius: 1.8, glow: 3.5 });
export const FLARE_POS = (n: 0 | 1 | 2): V3 => ROCKETS[n].apex as V3;

// ---------------- cameras ----------------
const D = (id: number, f: number, p: V3): V3 => deckPt(stAt(id, f), p[0], p[1], p[2]);
const nom = (id: number, pos: V3, look: V3, fov: number, k: number, roll = 0) => (f: number) => zoom(D(id, f, pos), D(id, f, look), fov, k, { roll });
const SIR1 = (f: number): V3 => [5.3 - 0.4 * smooth(f / 30) + 0.3 * smooth((f - 30) / 40), 0, 9.46];
const SIR2: V3 = [-3, 0, 6.55];
const SIR4: V3 = [6.6, 0, 6.5];
const C4: V3 = [12.0, 2.1, 6.8];
const S7X = (f: number) => 2 + 0.027 * (f - A_T3[6]);
const SIR5: V3 = [-0.1, 0, 6.88], OFF5: V3 = [-2.1, 0, 7.72];
const CAMS: Record<number, Key[]> = {
  1: [{ f: 0, s: (f) => { return nom(1, [9.5 - 0.1 * (f / 70), 1.2, 9.06], [-3.5, -0.6, 9.06], 40, 1, 0.17)(f); } }],
  2: [{ f: A_T3[1], s: (f) => nom(2, [-7.4, 1.23, 7.0], [-0.5, 0.3, 7.0], 40, pushK(f, A_T3[1], 0.0003), 0.0)(f) }],
  3: [{ f: A_T3[2], s: (f) => nom(3, [9.2, 3.4, 10.8], [9.2, -8.6, 30.8], 90, 1, 0.01 * Math.sin(f * 0.1))(f) }],
  4: [{ f: A_T3[3], s: (f) => nom(4, C4, [C4[0] - 20, -3.0, 6.8], 40, pushK(f, A_T3[3], 0.0005), 0.02)(f) }],
  5: [{ f: A_T3[4], s: (f) => nom(5, [4.3, 0.6, 6.9], [-4, 0.4, 6.9], 40, pushK(f, A_T3[4], 0.0002), 0.03)(f) }],
  6: [{ f: A_T3[5], s: (f) => nom(6, [10.0, 3.3, 7.4], [-14, -0.5, 7.4], 40, pushK(f, A_T3[5], 0.0004), -0.07)(f) }],
  7: [{ f: A_T3[6], s: (f) => { const x = S7X(f); return nom(7, [x + 4.3, 1.2, 7.5], [x - 9, -0.75, 7.5], 40, 1, -0.1)(f); } }],
  8: [{ f: A_T3[7], s: (f) => zoom([0.1, SEA + 1.65 + 0.03 * Math.sin(f * 0.13), -0.25], [-1.6, SEA - 4.0, 40], 40, 1, { roll: 0.02 * Math.sin(f * 0.1) }) }],
  9: [{ f: A_T3[8], s: (f) => zoom([0.3, SEA + 2.3 + 0.04 * Math.sin(f * 0.12), 0.6], [0.2, SEA - 0.95, 10.6], 44, pushK(f, A_T3[8], 0.0003), { roll: 0.1 + 0.02 * Math.sin(f * 0.09) }) }],
  10: [{ f: A_T3[9], s: (f) => zoom([0.0, SEA + 0.95 + 0.03 * Math.sin(f * 0.14), -2.9], [0.0, SEA - 3.2, 12], 40, 1, { roll: 0.03 }) }],
  11: [{ f: A_T3[10], s: (f) => zoom([RAFT.x + 8.4, SEA + 1.5, RAFT.z - 4.3], [RAFT.x + 5.3 - 0.9 * smooth((f - A_T3[10]) / 30), SEA + 0.5 + 0.3 * smooth((f - A_T3[10]) / 33), RAFT.z - 0.2], 40, 1, { roll: 0.0 }) }],
  12: [{ f: A_T3[11], s: (f) => { const cx = RAFT.x + 4.5 - 9.6 * smooth((f - A_T3[11]) / (A_T3[12] - A_T3[11])); return zoom([cx, SEA + 1.9, RAFT.z - 10.2], [cx - 0.5, SEA + 0.95, RAFT.z], 40, 1, { roll: 0.0 }); } }],
  13: [{ f: A_T3[12], s: (f) => zoom([RAFT.x + 3.6, SEA + 1.3, RAFT.z - 3.4], [RAFT.x + 3.4, SEA + 0.9, RAFT.z + 15], 58, 1, { roll: 0.0 }) }],
  14: [{ f: A_T3[13], s: (f) => zoom([0.43, CDECK_Y + 0.7, -6.2], [0.43, CDECK_Y + 0.82, 9], 40, 1, { roll: 0.0 }) }],
  15: [{ f: A_T3[14], s: (f) => zoom([1.97, CDECK_Y + 0.7, 0.6], [1.97, CDECK_Y + 0.4, 12], 40, 1, { roll: 0.0 }) }],
};
/** thumbnails only: 1 = Sir shocked in the water at the lens, 2 = Sir big at the edge of the upturned boat */
export const THUMB = { mode: -1 };
export const camAtT3 = (id: number, f: number): Cam => THUMB.mode === 2 && id === 11 ? zoom([RAFT.x, SEA + 1.7, RAFT.z - 5.1], [RAFT.x, SEA + 1.6, RAFT.z + 2], 40, 1, { roll: 0 }) as Cam : run(CAMS[id], f);
export const dofAtT3 = dofFrom([
  { f: 0, cInf: 3, focus: () => W0(5.7, 1.4, 8.9, 0.2) },
  { f: A_T3[1], cInf: 0 },
  { f: A_T3[2], cInf: 0 }, { f: A_T3[3], cInf: 2, focus: () => [SIR4[0], 1.3, SIR4[2]] as V3 }, { f: A_T3[4], cInf: 4, focus: () => [SIR5[0], 1.2, SIR5[2]] as V3 },
  { f: A_T3[5], cInf: 0 }, { f: A_T3[6], cInf: 2, focus: (f) => W0(S7X(f), 1.3, 7.5, 0.13) }, { f: A_T3[7], cInf: 4, focus: () => [0, SEA + 1.2, 3.3] as V3 },
  { f: A_T3[8], cInf: 0 }, { f: A_T3[9], cInf: 4, focus: () => [0.5, SEA + 0.7, -0.7] as V3 }, { f: A_T3[10], cInf: 0 },
  { f: A_T3[11], cInf: 0 }, { f: A_T3[12], cInf: 0 }, { f: A_T3[13], cInf: 0 }, { f: A_T3[14], cInf: 0 },
]);

// ---------------- screen cards (tags and the chalk board): fixed boxes in pixels, placed through the camera ----------------
export type Box = { x0: number; y0: number; x1: number; y1: number };
const SIGN_PX = 120;   // text height of every sign: at least as tall as the captions (96-132 px)
export const TAGS: { id: number; a: number; b: number; box: Box; lines: string[]; px: number }[] = [
  { id: 2, a: at("truth", "My") + 2, b: at("truth", "Everything") - 4, box: { x0: 450, y0: 360, x1: 1040, y1: 760 }, lines: ["THE EVENTS", "ARE TRUE"], px: SIGN_PX },
  { id: 2, a: at("truth", "Everything") - 4, b: A_T3[2], box: { x0: 450, y0: 360, x1: 1040, y1: 760 }, lines: ["MY PART IS", "MADE UP"], px: SIGN_PX },
  { id: 9, a: A_T3[8] + 10, b: A_T3[9], box: { x0: 40, y0: 330, x1: 1040, y1: 780 }, lines: ["2:20 A.M.", "15 APRIL", "1912"], px: SIGN_PX },
  { id: 12, a: at("boat", "About") - 1, b: A_T3[12], box: { x0: 540, y0: 300, x1: 1040, y1: 560 }, lines: ["ABOUT", "30 MEN"], px: SIGN_PX },
  { id: 13, a: at("dawn", "Carpathia") - 4, b: A_T3[13], box: { x0: 250, y0: 295, x1: 1040, y1: 545 }, lines: ["THE CARPATHIA", "ABOUT 4 A.M."], px: SIGN_PX },
];
export const SIGN_FACTS = ["ABOUT 4 A.M.", "ABOUT 700", "ABOUT 1,500"];
export const BOARD = { id: 14, box: { x0: 395, y0: 310, x1: 1040, y1: 810 } as Box, l1: at("count", "about"), l2: at("count", "About") - 2, px: SIGN_PX, a: at("count", "about"), lines: ["ABOUT 700", "SAVED", "ABOUT 1,500", "LOST"] };
const camBasis = (c: Cam) => {
  const f = [c.look[0] - c.pos[0], c.look[1] - c.pos[1], c.look[2] - c.pos[2]], fl = Math.hypot(...f); f[0] /= fl; f[1] /= fl; f[2] /= fl;
  let r = [-f[2], 0, f[0]], rl = Math.hypot(r[0], r[2]) || 1; r = [r[0] / rl, 0, r[2] / rl];
  const u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]];
  const cr = Math.cos(c.roll), sr = Math.sin(c.roll);
  return { f, r: r.map((v, i) => v * cr + u[i] * sr), u: r.map((v, i) => -v * sr + u[i] * cr) };
};
/** a world point `d` metres in front of the camera that lands at the centre of the pixel box, and the card size there */
export const placeBox = (id: number, f: number, b: Box, d = 6) => {
  const c = camAtT3(id, f), B = camBasis(c), hh2 = d * Math.tan((c.fov * Math.PI) / 360), hw = hh2 * (1080 / 1920);
  const nx = ((b.x0 + b.x1) / 2 / 1080) * 2 - 1, ny = 1 - ((b.y0 + b.y1) / 2 / 1920) * 2;
  const p: V3 = [0, 1, 2].map((k) => c.pos[k] + B.f[k] * d + B.r[k] * nx * hw + B.u[k] * ny * hh2) as V3;
  return { p, w: ((b.x1 - b.x0) / 1080) * 2 * hw, h: ((b.y1 - b.y0) / 1920) * 2 * hh2 };
};
/** where a world point lands in the picture (pixels at 1080 x 1920) and its depth */
const projPx = (id: number, f: number, p: V3) => {
  const c = camAtT3(id, f), B = camBasis(c), d = [p[0] - c.pos[0], p[1] - c.pos[1], p[2] - c.pos[2]], zf = d[0] * B.f[0] + d[1] * B.f[1] + d[2] * B.f[2];
  const k = 960 / Math.tan((c.fov * Math.PI) / 360), xr = d[0] * B.r[0] + d[1] * B.r[1] + d[2] * B.r[2], yu = d[0] * B.u[0] + d[1] * B.u[1] + d[2] * B.u[2];
  return { x: 540 + (xr / zf) * k, y: 960 - (yu / zf) * k, z: zf };
};
/** a crowd figure only where it is wholly inside the picture and its feet are above the caption band */
const crowdOk = (id: number, f: number, p: V3, hgt = 1.7, w = 0.85) => {
  const a = projPx(id, f, p), b = projPx(id, f, [p[0], p[1] + hgt, p[2]]);
  if (a.z < 0.6) return false;
  const hp = a.y - b.y, wp = (hp * w) / hgt;
  return a.x - wp / 2 >= 24 && a.x + wp / 2 <= 1056 && a.y <= 1385 && b.y >= 8;
};
const rr = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
const fontPx = (g: CanvasRenderingContext2D, s: string, maxW: number, size: number) => { let z = size; do { g.font = `400 ${z}px ${CAPFONT}`; z -= 2; } while (g.measureText(s).width > maxW && z > 60); };
const labelDraw = (lines: string[], W: number, H: number) => (p: Pen) => {
  const g = p.g; rr(g, 8, 8, W - 16, H - 16, 28); g.fillStyle = "#f6efd8"; g.fill(); g.lineWidth = 10; g.strokeStyle = INK; g.stroke();
  g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = INK;
  lines.forEach((l, i) => { fontPx(g, l, W - 40, SIGN_PX); g.fillStyle = i === lines.length - 1 && lines.length > 1 ? "#7a1f1c" : INK; g.fillText(l, W / 2, H * ((i + 0.5) / lines.length)); });
};
const boardDraw = (n: number, W: number, H: number) => (p: Pen) => {
  const g = p.g; rr(g, 12, 12, W - 24, H - 24, 16); g.fillStyle = "#2c4a3c"; g.fill(); g.lineWidth = 18; g.strokeStyle = "#6b4a2e"; g.stroke(); g.lineWidth = 3; g.strokeStyle = INK; rr(g, 3, 3, W - 6, H - 6, 20); g.stroke();
  g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#f4f0e2";
  const L = ["ABOUT 700", "SAVED", "ABOUT 1,500", "LOST"];
  L.forEach((l, i) => { if (i >= n * 2) return; fontPx(g, l, W - 60, SIGN_PX); g.fillStyle = i > 1 ? "#ffe0b0" : "#f4f0e2"; g.fillText(l, W / 2, 30 + (H - 60) * ((i + 0.5) / 4)); });
};
/** the Carpathia, drawn as a solid ship: dark hull with a white band, white superstructure, one tall funnel with drifting smoke, two rows of lit windows */
export const CARP_BOX: Box = { x0: 705, y0: 560, x1: 1065, y1: 930 };
const carpDraw = (n: number, W: number, H: number) => (p: Pen) => {
  const g = p.g, k = W / 450, X = (v: number) => v * k, Y = (v: number) => v * k, base = H / k, wl = base - 22;   // wl: the waterline
  const ink = () => { g.lineWidth = 4; g.strokeStyle = INK; g.lineJoin = "round"; g.stroke(); };
  const poly = (pts: number[][], fill: string) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(X(x), Y(y)) : g.moveTo(X(x), Y(y)))); g.closePath(); g.fillStyle = fill; g.fill(); ink(); };
  // smoke behind the funnel: puffs that drift back and thin out
  for (let i = 0; i < 7; i++) { const u = (i + (n % 8) / 8) / 7, x = 236 - 150 * u, y = wl - 262 - 40 * u + 6 * Math.sin(i + n * 0.3), r = 14 + 24 * u; g.fillStyle = `rgba(72,64,76,${0.8 - 0.6 * u})`; g.beginPath(); g.ellipse(X(x), Y(y), X(r * 1.35), Y(r), 0, 0, 7); g.fill(); }
  // the long dark hull: flat stern at the left, sheer line, raked bow at the right
  poly([[4, wl - 44], [392, wl - 44], [444, wl - 74], [418, wl], [22, wl]], "#1b1f2b");
  g.fillStyle = "#f3efe4"; g.beginPath(); g.moveTo(X(6), Y(wl - 44)); g.lineTo(X(392), Y(wl - 44)); g.lineTo(X(441), Y(wl - 72)); g.lineTo(X(434), Y(wl - 62)); g.lineTo(X(392), Y(wl - 36)); g.lineTo(X(8), Y(wl - 36)); g.closePath(); g.fill();   // the white sheer stripe
  g.fillStyle = "#8a2a20"; g.fillRect(X(22), Y(wl - 8), X(396), Y(8));   // red bottom paint at the waterline
  for (let x = 30; x <= 380; x += 22) { g.fillStyle = "#ffd36a"; g.fillRect(X(x), Y(wl - 27), X(10), Y(8)); }   // portholes
  // white upperworks in tiers
  poly([[70, wl - 44], [352, wl - 44], [352, wl - 100], [70, wl - 100]], "#f3efe4");
  poly([[104, wl - 100], [322, wl - 100], [322, wl - 150], [104, wl - 150]], "#ece7da");
  poly([[160, wl - 150], [290, wl - 150], [290, wl - 182], [160, wl - 182]], "#f3efe4");
  g.fillStyle = "#d9d3c4"; g.fillRect(X(74), Y(wl - 100), X(276), Y(6));
  // the one tall funnel
  poly([[196, wl - 182], [250, wl - 182], [244, wl - 292], [202, wl - 292]], "#c7442a");
  poly([[202, wl - 292], [244, wl - 292], [244, wl - 270], [202, wl - 270]], "#15161c");
  poly([[199, wl - 232], [248, wl - 232], [247, wl - 218], [200, wl - 218]], "#f3efe4");
  // two rows of lit windows
  const win = (x: number, y: number) => { g.fillStyle = "#ffd36a"; g.fillRect(X(x), Y(y), X(15), Y(17)); g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(X(x), Y(y), X(15), Y(17)); };
  for (let x = 80; x <= 336; x += 22) win(x, wl - 82);
  for (let x = 114; x <= 304; x += 22) win(x, wl - 134);
  // the wake: white foam at the bow and a trail behind the stern
  g.fillStyle = "rgba(245,250,255,0.95)"; for (let i = 0; i < 9; i++) { g.beginPath(); g.ellipse(X(428 - i * 5 + 8 * Math.sin(n * 0.4 + i)), Y(wl + 2 + (i % 2) * 5), X(14 - i), Y(5), 0, 0, 7); g.fill(); }
  g.strokeStyle = "rgba(245,250,255,0.9)"; g.lineWidth = 5 * k; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(X(30 - i * 6), Y(wl + 6 + i * 4)); g.lineTo(X(-60 + i * 4), Y(wl + 10 + i * 4)); g.stroke(); }
};
const cards = (out: Stage, id: number, f: number) => {
  for (const t of TAGS) if (t.id === id && f >= t.a && f < t.b) {
    const n = f - t.a, k = n < 5 ? 0.6 + 0.4 * ((n + 1) / 5) : 1, pl = placeBox(id, f, t.box), W = t.box.x1 - t.box.x0, H = t.box.y1 - t.box.y0;
    out.fx.push({ key: `lab|${t.lines.join("/")}|${W}|${H}`, cw: W, ch: H, draw: labelDraw(t.lines, W, H), x: pl.p[0], y: pl.p[1], z: pl.p[2], w: pl.w * k, h: pl.h * k, top: true });
  }
  if (id === 13) {
    const W = CARP_BOX.x1 - CARP_BOX.x0, H = CARP_BOX.y1 - CARP_BOX.y0, pl = placeBox(id, f, CARP_BOX, 70);
    out.fx.push({ key: `carp|${Math.floor(f / 3)}|${W}|${H}`, cw: W, ch: H, draw: carpDraw(Math.floor(f / 3), W, H), x: pl.p[0], y: pl.p[1], z: pl.p[2], w: pl.w, h: pl.h });
  }
  if (id === BOARD.id) {
    const n = f >= BOARD.l2 ? 2 : f >= BOARD.l1 ? 1 : 0, pl = placeBox(id, f, BOARD.box), W = BOARD.box.x1 - BOARD.box.x0, H = BOARD.box.y1 - BOARD.box.y0;
    if (n > 0) out.fx.push({ key: `board|${n}|${W}|${H}`, cw: W, ch: H, draw: boardDraw(n, W, H), x: pl.p[0], y: pl.p[1], z: pl.p[2], w: pl.w, h: pl.h, top: true });
  }
};
export const BOARD_POS = (f: number): V3 => placeBox(BOARD.id, f, BOARD.box).p;
/** the closing hook: text on screen with the last spoken line */
export const END_HOOK = { a: at("next") - 4, lines: ["NEXT:", "I SURVIVE", "POMPEII"], x: 40, y: 340, w: 560, h: 440, size: 104 };
export const T3_CHUNKS = ["The Titanic", "is sinking.", "And I am", "still on board.", "My part", "is made up.", "Everything around me", "is true.", "The lifeboats", "are gone.", "About 1,500", "of us", "are left.", "Distress rockets", "burst over", "the ship,", "one after another.", "The bow", "goes under.", "The sea comes", "up the deck.", "At 2:20", "in the morning,", "the Titanic", "is gone.", "I swim for", "an overturned lifeboat.", "About thirty men", "cling to it.", "At about four,", "a ship arrives:", "the Carpathia.", "She saves", "about 700 people.", "About 1,500", "are lost.", "I survived", "the Titanic.", "Most did not.", "Next: Pompeii."];

// ---------------- gaze events: from frame a to b something happens at pos; the main figures must look at it ----------------
export type Ev = { a: number; b: number; pos: (f: number) => V3; who?: string[] };
const rocketHead = (n: number) => (f: number): V3 => { const r = ROCKETS[n], u = Math.min(1, Math.max(0, (f / 30 - r.t0) / (r.rise ?? 1.3))), e = 1 - (1 - u) * (1 - u); return [0, 1, 2].map((k) => r.from[k] + (r.apex[k] - r.from[k]) * e) as V3; };
export const EVENTS: Ev[] = [
  { a: 0, b: 36, pos: () => FLARE_POS(0), who: ["sir"] },
  { a: Math.round((R_BURST.r1 - 1.0) * 30), b: Math.round(R_BURST.r1 * 30), pos: rocketHead(1), who: ["sir", "officer"] },
  { a: Math.round(R_BURST.r1 * 30), b: Math.round((R_BURST.r2 - 1.2) * 30), pos: () => FLARE_POS(1), who: ["sir", "officer"] },
  { a: Math.round((R_BURST.r2 - 1.2) * 30), b: Math.round(R_BURST.r2 * 30), pos: rocketHead(2), who: ["sir", "officer"] },
  { a: Math.round(R_BURST.r2 * 30), b: A_T3[5], pos: () => FLARE_POS(2), who: ["sir", "officer"] },
  { a: A_T3[7] + 2, b: A_T3[8], pos: (f) => { const u = prog(8, f); return [LINER.x, SEA + 8 - lerp(0, 5.5, u), LINER.z]; }, who: ["lady", "kid"] },
  { a: A_T3[12] + 6, b: A_T3[13], pos: () => [-20, SEA + 8, 125], who: ["sir", "officer"] },
  { a: at("count", "about") + 4, b: A_T3[14], pos: (f) => BOARD_POS(f), who: ["sir_b"] },
  { a: at("end", "Most") - 8, b: TOTAL_T3, pos: () => [8, CDECK_Y + 1.1, 12], who: ["sir_b"] },
];
/** counts: between a and b the picture must show n figures (main + crowd, not swimmers) */
export const COUNTS: { id: number; min: number; max: number; what: string; across?: boolean }[] = [{ id: 4, min: 60, max: 9999, what: "figures on the packed deck" }, { id: 12, min: 30, max: 31, across: true, what: "men on the upturned boat (30, and Sir)" }];
/** for the layout check: the boats */
export const boatsOf = (id: number, f: number): [number, number, number][] => id === 8 ? BOATS_NIGHT.map((b) => [b.x, SEA + 0.5, b.z]) : id === 3 ? BOATS_DECK.map((_, i) => { const b = boatAt(i, f / 30); return [b.x, SEA + 0.5, b.z] as [number, number, number]; }) : id === 11 ? [[RAFT.x, RAFT.y, RAFT.z], [RAFT.x + 3, RAFT.y, RAFT.z]] : id === 12 ? [[RAFT.x, RAFT.y, RAFT.z]] : [];

// ---------------- people ----------------
const ease = (f: number, a: number, b: number) => smooth((f - a) / (b - a));
const stand = (out: Stage, cam: CamInfo, who: Who, p: V3, fo: FrontOpts, f: number, extra: { talk?: number; scale?: number; water?: { y: number; ph: number } } = {}) => {
  const pl = person(out, cam, who, p[0], p[1], p[2], { fo: { mode: "stand", blink: blinkOf(f / 30, who.i), ...fo, expr: calm(f, fo.expr) }, talk: extra.talk ?? 0, scale: extra.scale, water: extra.water }, false);
  if (!extra.water) blob(out, cam, p[0], p[1], p[2], extra.scale ?? 1, 0.55);
  return pl;
};
const crowdAt = (out: Stage, cam: CamInfo, k: number, p: V3, f: number, fo: FrontOpts = {}, near = true) => {
  const who = crowdWho(k), ex = (["nervous", "shock", "neutral", "nervous"] as const)[k % 4];
  person(out, cam, who, p[0], p[1], p[2], { fo: { mode: "stand", facing: 0, blink: blinkOf(f / 30, who.i + k), ...fo, expr: calm(f, fo.expr ?? ex) } }, false);
  if (near) blob(out, cam, p[0], p[1], p[2], 1, 0.6);
};
const SHAWLS = ["#8a8f9c", "#7c8a7a", "#9a8a7a", "#7a7f94"];
const shawlWho = (k: number): Who => ({ i: 90 + (k % 12) * 3, o: { ...CROWD_O[k % CROWD_O.length], shawl: SHAWLS[k % 4], dress: undefined }, okey: (k % 12 === 10 ? "c_kid_s" : "c_s") + (k % 12) + "_" + (k % 4) });

/** a candidate crowd figure's picture box (feet at p): its body and its face, in pixels */
const figBox = (id: number, f: number, p: V3, hgt = 1.7, w = 0.58) => {
  const a = projPx(id, f, p), b = projPx(id, f, [p[0], p[1] + hgt, p[2]]), hp = a.y - b.y, wp = (hp * w) / hgt, fc = projPx(id, f, [p[0], p[1] + 0.8 * hgt, p[2]]), fw = (hp * 0.52) / hgt;
  return { x0: a.x - wp / 2, x1: a.x + wp / 2, y0: b.y, y1: a.y, h: hp / 1920, dist: a.z, face: { x0: a.x - fw / 2, x1: a.x + fw / 2, y0: fc.y - fw / 2, y1: fc.y + fw / 2 } };
};
type FB = ReturnType<typeof figBox>;
const hitB = (a: { x0: number; x1: number; y0: number; y1: number }, b: { x0: number; x1: number; y0: number; y1: number }) => Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0) > 0 && Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0) > 0;
/** accepts crowd candidates nearest first: a near-row figure (over 15 % of the height) never has its face hidden by a nearer one */
const grow = (b: { x0: number; x1: number; y0: number; y1: number }, k: number) => ({ x0: b.x0 - k * (b.x1 - b.x0), x1: b.x1 + k * (b.x1 - b.x0), y0: b.y0 - k * (b.y1 - b.y0), y1: b.y1 + k * (b.y1 - b.y0) });
const faceClear = (acc: FB[], c: FB) => !(c.h > 0.13 && acc.some((a) => a.dist < c.dist && hitB(grow(a, 0.1), grow(c.face, 0.2))));

export const sceneAtT3 = (id: number, f: number, cam: CamInfo): Scene => {
  const out: Scene = { places: [], fx: [], guns: [], crates: [], fan: 0 };
  const st = stAt(id, f), t = f / 30, P = (x: number, y: number, z: number): V3 => deckPt(st, x, y, z);
  cards(out, id, f);
  if (id === 1) {
    // the deck tilts under him: his whole body slides about half a metre down the slope, arms out, the cane swinging; then he catches himself and looks at the lens
    const s = SIR1(f), up = 1 - ease(f, 40, 52), k = f < 66 ? Math.max(0, Math.sin((Math.PI * (f - 4)) / 62)) : 0;
    stand(out, cam, SIR, P(s[0], 0, s[2]), { mode: "stroll", phase: f * 0.07, expr: "shock", look: up, lookUp: 0.85 * up, tilt: -2 * k, cheer: (0.6 + 0.1 * Math.sin(f * 0.5)) * k, headTilt: 4 * k, blink: 0 }, f, { talk: talkOf(f), scale: 0.9 });
  } else if (id === 2) {
    stand(out, cam, SIR, P(SIR2[0], 0, SIR2[2]), { expr: "neutral", look: 0.4 }, f, { talk: talkOf(f) });
  } else if (id === 3) {
    BOATS_DECK.forEach((_, i) => { const b = boatAt(i, t), c = Math.cos(b.yaw), s = Math.sin(b.yaw); for (let k = 0; k < 6; k++) { const sx = -2.2 + k * 0.88; person(out, cam, crowdWho(i * 7 + k), b.x + sx * c, SEA + 0.62, b.z - sx * s, { scale: i === 0 ? 1.6 : 1.25, fo: { mode: "sit", expr: "nervous", blink: lidAt(t, k + i * 9) } }, false); } });
  } else if (id === 4) {
    const sp = P(SIR4[0], 0, SIR4[2]);
    stand(out, cam, SIR, sp, { expr: "nervous", look: -0.4, blink: 0 }, f, { talk: talkOf(f) });
    const sb = figBox(4, f, sp, 1.66, 0.58), acc: FB[] = [sb], cand: { n: number; p: V3; b: FB; near: boolean }[] = [];
    let n = 0;
    for (let d = 5.6; d < 44; d += 1.35) {
      const lat = 0.2047 * d * 1.06, step = d < 24 ? 1.45 : 0.85, cnt = Math.floor((2 * lat) / step);
      for (let j = 0; j <= cnt; j++) {
        const z = C4[2] - lat + j * step + 0.12 * (hh(n, 7) - 0.5) + (Math.round(d / 1.35) % 2 ? step / 2 : 0), x = C4[0] - d - 0.3 * hh(n, 8), p = P(x, 0, z);
        if (crowdOk(4, f, p)) { const b = figBox(4, f, p); if (!hitB(sb, b.face)) cand.push({ n, p, b, near: d < 14 }); }
        n++;
      }
    }
    cand.sort((a, b) => a.b.dist - b.b.dist);
    for (const c of cand) if (faceClear(acc, c.b)) { acc.push(c.b); crowdAt(out, cam, c.n, c.p, f, { look: (hh(c.n, 9) - 0.5) * 1.4, facing: 0, blink: 0 }, c.near); }
  } else if (id === 5) {
    const r1 = Math.round((R_BURST.r1 - 1.0) * 30), up = smooth((f - r1) / 10) * 0.7 + 0.25;
    stand(out, cam, SIR, P(SIR5[0], 0, SIR5[2]), { expr: "shock", look: f >= r1 ? 1 : 0, lookUp: f >= r1 ? up : 0, blink: 0 }, f, { talk: talkOf(f) });
    stand(out, cam, OFFICER, P(OFF5[0], 0, OFF5[2]), { expr: "shock", look: f >= r1 ? 1 : 0, lookUp: f >= r1 ? up : 0, blink: 0 }, f);
  } else if (id === 6) {
    // three figures come up the slope toward the lens, glancing back at the sea that creeps up the planks behind them
    let wx = 30; while (wx > -60 && deckPt(st, wx, 0, 7)[1] > DECK.sea) wx -= 0.25;   // where the sea meets the planks: the three stay at least 0.6 m ahead of it
    const a6 = f - A_T3[5], x0 = Math.max(-3.75 + 0.035 * a6, wx + 1.0);   // calm sea in this shot, so 1 m of dry planks is clear
    ([[OFFICER, 0, 8.3, 0.9], [GENT, 0.6, 7.4, 0], [LADY, 0.45, 6.5, -0.9]] as [Who, number, number, number][]).forEach(([wh, dx, z, lk]) => {
      const x = x0 + dx, p = P(x, 0, z); person(out, cam, wh, p[0], p[1], p[2], { fo: { mode: "stroll", phase: ((x / 1.0) % 1 + 1) % 1, expr: "nervous", facing: 0, look: lk, blink: 0 } }, false); blob(out, cam, p[0], p[1], p[2], 1, 0.55);
    });
  } else if (id === 7) {
    const x0 = S7X(f), glance = f - A_T3[6] > 14 && f - A_T3[6] < 30 ? -1 : 0;
    const walk = (who: Who, dx: number, z: number, fo: FrontOpts, talk = 0) => { const p = P(x0 + dx, 0, z); person(out, cam, who, p[0], p[1], p[2], { fo: { mode: "stroll", phase: ((x0 + dx) / 1.0 % 1 + 1) % 1, expr: "nervous", facing: 0, blink: 0, ...fo }, talk }, false); blob(out, cam, p[0], p[1], p[2], 1, 0.55); };
    walk(SIR, 0, 7.84, { look: glance, headTilt: glance ? 4 : 0 }, talkOf(f)); walk(OFFICER, -2.3, 7.0, { look: 0 }); walk(GENT_C, -6.7, 5.75, { look: 0 });
  } else if (id === 8) {
    // the first lifeboat: the lady and the child look up and to the right, at the sinking liner
    const hull = BOATS_NIGHT[0];
    person(out, cam, LADY, 0.24, SEA + 0.6, hull.z - 0.15, { scale: 1.06, fo: { mode: "sit", expr: "shock", facing: 1, look: 1, lookUp: 0.6, blink: lidAt(t, 52) } }, false);
    person(out, cam, KID, -0.40, SEA + 0.6, hull.z - 0.15, { fo: { mode: "sit", expr: "nervous", facing: 1, look: 1, lookUp: 0.6, blink: lidAt(t, 57) } }, false);
    BOATS_NIGHT.slice(1).forEach((b, i) => { for (let k = 0; k < 5; k++) person(out, cam, crowdWho(i * 5 + k + 2), b.x + (-1.7 + k * 0.85) * Math.cos(b.yaw), SEA + 0.6, b.z - (-1.7 + k * 0.85) * Math.sin(b.yaw), { fo: { mode: "sit", expr: "nervous" } }, false); });
  } else if (id === 10) {
    // the waterline mask sits a hand above the real surface, so the surface never hides the foam; it holds on every frame and bobs with him
    const u = f - A_T3[9], x = 0.015 - 0.0004 * u, bob = 0.03 * Math.sin(t * 5), y = SEA - 0.8 + bob, sw = 0.5 + 0.5 * Math.sin(t * 6.5);
    person(out, cam, SIR, x, y, -0.7, { water: { y: 975 - (0.8 - bob + 0.1) / 0.00216, ph: f / 4 }, fo: { mode: "stand", expr: THUMB.mode === 1 ? "shock" : "nervous", facing: THUMB.mode === 1 ? 0 : 1, look: THUMB.mode === 1 ? 0 : 1, cheer: 0.18 + 0.2 * sw, blink: blinkOf(t, 3), ...({ swim: 0.8, water: true } as object) }, talk: talkOf(f) }, false);
  } else if (id === 11) {
    // close on the near end of the hull: Sir reaches it, climbs (kneeling on it) and stands on the hull
    const u = prog(11, f), keelY = RAFT.y + 0.05, a = ease(u, 0, 0.35), b = ease(u, 0.35, 0.82);
    const sx = lerp(lerp(RAFT.x + 5.6, RAFT.x + 5.2, a), RAFT.x + 4.4, b), sz = lerp(lerp(RAFT.z - 0.1, RAFT.z - 0.3, a), RAFT.z - 0.05, b), sy = lerp(lerp(SEA - 0.6, SEA - 0.4, a), keelY, b);
    const sub = Math.max(0, SEA - sy), inWater = sub > 0.02, kneel = b > 0.2 && b < 0.75;
    person(out, cam, SIR, sx, sy, sz, { water: inWater ? { y: 975 - (sub + 0.1) / 0.00216, ph: f / 4 } : undefined, fo: { mode: kneel ? "sit" : "stand", expr: "nervous", cheer: inWater && !kneel ? 0.3 : 0, look: 0, blink: blinkOf(t, 3), ...(inWater ? ({ swim: sub, water: true } as object) : {}) }, talk: talkOf(f) }, false);
  } else if (id === 12) {
    // thirty men along the whole hull: the front row kneels on the near side of the keel, the back row stands on the ridge behind them, staggered half a step so every face shows; Sir stands at his end
    const keelY = RAFT.y + 0.05;
    for (let i = 0; i < 30; i++) {
      const row = i % 2, k = Math.floor(i / 2), x = RAFT.x - 5.6 + k * 0.64 + row * 0.32, z = RAFT.z + (row ? 0.38 : -0.5), y = row ? RAFT.y + 0.32 : RAFT.y - 0.1;
      if (i === 9) { person(out, cam, OFFICER, x, y, z, { fo: { mode: row ? "stand" : "sit", expr: "nervous", look: 0.5, blink: blinkOf(t, 41) } }, false); continue; }
      person(out, cam, crowdWho(i * 5 + 1), x, y, z, { fo: { mode: row ? "stand" : "sit", expr: "nervous", facing: 0, look: (hh(i, 3) - 0.5) * 1.2, blink: blinkOf(t, i + 4) } }, false);
    }
    person(out, cam, SIR, RAFT.x + 4.4, keelY, RAFT.z - 0.05, { fo: { mode: "stand", expr: "nervous", look: -0.6, blink: blinkOf(t, 3) }, talk: talkOf(f) }, false);
  } else if (id === 13) {
    // dawn: Sir (left third) and the officer, feet on the hull, both looking straight at the Carpathia in the right half; the officer waves
    const w = 0.4 + 0.6 * Math.abs(Math.sin(t * 5)), ex = f < 780 ? "relief" : "nervous", Y = RAFT.y + 0.05;
    person(out, cam, SIR, 4.18, Y, RAFT.z - 0.2, { scale: 0.9, fo: { mode: "stand", expr: calm(f, "nervous"), facing: 1, look: 1, lookUp: 0.1, headTilt: 5, blink: blinkOf(t, 3) }, talk: talkOf(f) }, false);
    person(out, cam, OFFICER, 3.48, Y, RAFT.z - 0.2, { scale: 0.9, fo: { mode: "stand", expr: ex, facing: 1, look: 1, lookUp: 0.1, headTilt: 5, wave: w, blink: blinkOf(t, 9) } }, false);
  } else if (id === 14) {
    // count: Sir at the left, four survivors in shawls in a spaced row on the right under the board
    const ly = CDECK_Y + 0.03;
    stand(out, cam, SIR_B, [0.93, ly, -1.9], { expr: "neutral", look: 1, lookUp: 0.5 }, f, { talk: talkOf(f), scale: 0.88 });
    [[0.76, 7.8], [-0.12, 7.8], [-1.0, 7.8], [-1.9, 7.8]].forEach(([x, z], k) => person(out, cam, shawlWho(4 + k), x, ly, z, { fo: { mode: "sit", expr: (["nervous", "neutral"] as const)[k % 2], facing: 0, blink: blinkOf(t, k * 9) } }, false));
  } else if (id === 15) {
    const ly = CDECK_Y + 0.03, turn = ease(f, at("end", "Most") - 14, at("end", "Most") - 4);
    stand(out, cam, SIR_B, [1.5, ly, 5.0], { expr: "neutral", look: turn * -1, facing: turn > 0.5 ? -1 : 0 }, f, { talk: talkOf(f) });
  }
  void SIR_DIGSWORTH; void ({} as SideOpts);
  return out;
};
export const SHOW_T3: Show = { shots: SHOTS_T3, camAt: camAtT3, sceneAt: sceneAtT3, crowdFor: () => null, wheatAt: () => 1, deckAt };

/** what scripts/kit_check.mjs needs from a film */
const davitPosts = (id: number, f: number) => {
  if (stAt(id, f).set !== "deck" || id === 1) return [];   // id 1: the far rail post stands 60 px left of the drawn head; only the padded head box touches it
  const st = stAt(id, f), out: { name: string; x: number; y: number; z: number; w: number; h: number }[] = [];
  if (st.bench !== undefined) { const p = deckPt(st, st.bench, 0, 4.0); out.push({ name: "sliding bench", x: p[0], y: p[1], z: p[2], w: 1.9, h: 0.95 }); }   // a moving prop
  for (const cx of [DECK.boat[0], DECK.gone]) for (const sg of [-1, 1]) { const p = deckPt(st, cx + sg * 4.6, 0, DECK.railZ - 0.35); out.push({ name: "davit post", x: p[0], y: p[1], z: p[2], w: 0.2, h: 3.6 }); }
  return out;
};
/** masts as segments (world), for the POLE rule */
const shipPoint = (S: { x: number; z: number; yaw: number }, lx: number, ly: number): V3 => [S.x + lx * Math.cos(S.yaw), SEA + ly, S.z - lx * Math.sin(S.yaw)];
const masts = (id: number, _f: number) => {
  const lift = id === 8 ? -(stAt(8, _f).liner?.sink ?? 0) : 0;
  const _mk = (S: { x: number; z: number; yaw: number; len: number; hullH: number }, name: string) => [-0.38, 0.34].map((k) => ({ name, a: shipPoint(S, k * S.len, S.hullH + lift), b: shipPoint(S, k * S.len, S.hullH + 26 + lift) }));
  if (stAt(id, _f).set === "cdeck" && id === 15) {   // (the end shot only)   // the Carpathia's deck rail: the top bar (and the two lower rails) run in 3 m pieces; none may cross behind a head or cap
    const out: { name: string; a: V3; b: V3 }[] = [];
    for (const y of [1.08, 0.72, 0.36]) for (let x = -30; x < 30; x += 3) out.push({ name: y > 1 ? "rail top bar" : "rail", a: [x, CDECK_Y + y, 9], b: [x + 3, CDECK_Y + y, 9] });
    return out;
  }
  return [];   // neither ship has masts in this film: a mast behind a head is not allowed
};
/** feet on a declared surface: the tilted deck, a lifeboat's floor, the upturned boat (and its side while he climbs), the Carpathia's deck */
const onSurface = (id: number, f: number, x: number, y: number, z: number) => {
  const st = stAt(id, f);
  if (st.set === "deck" && Math.abs(y - (deckSink(st) + x * Math.tan(st.tilt ?? 0))) < 0.12) return true;
  if (st.set === "cdeck") return Math.abs(y - (CDECK_Y + 0.03)) < 0.06;
  if (Math.abs(y - (SEA + 0.6)) < 0.12 && ([...BOATS_NIGHT, ...BOATS_DECK.map((_, i) => boatAt(i, f / 30))]).some((b) => Math.hypot(b.x - x, b.z - z) < 3.4)) return true;
  if ((st.set === "night" || st.set === "dawn") && st.raft && Math.abs(x - RAFT.x) < 6.6 && z > RAFT.z - 2.4 && z < RAFT.z + 1.4 && y <= RAFT.y + 0.4 && y >= SEA - 0.95) return true;
  return false;
};
export const FILM_CHECK = {
  shots: SHOTS_T3, camAt: camAtT3, sceneAt: sceneAtT3, kinds: SHOT_KIND, hook: { ...HOOK, end: HOOK_END }, events: EVENTS, counts: COUNTS, tags: TAGS, board: BOARD,
  lamps, boats: boatsOf, props: davitPosts, poles: masts, rockets: ROCKETS, passengers: ["lady", "kid"], deckAt, total: TOTAL_T3, band: { y0: 1400, y1: 1600 },
  grief: GRIEF, onSurface, packed: [3, 4, 12, 14],
  captions: { chunks: chunkWords(WORDS, T3_CHUNKS).filter((c) => c.a * 30 >= HOOK_END - 1) }, endHook: { a: END_HOOK.a }, signFacts: SIGN_FACTS,
};
