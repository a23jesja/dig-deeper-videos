// "I Survived the Titanic: Part 3" (Short, 1080 x 1920, 35 s): shots, cameras, lens, what stands where on which word.
// Spec: SCRIPT-titanic-3.md. Every shot starts 1-3 frames before its word (voice/titanic-3/words.json -> wordsT3.json).
// Deck coordinates ("nominal"): x along the ship (the bow is at -x), z across (the sea side is +z, the rail at 14.5, the house at -9).
// The deck tilts (bow down) and sinks: deckPt() turns a nominal point into the world. Night and dawn sets are in t3sets.ts.
import { Cam, Key, ShotDef, V3, run, pushK, zoom, dofFrom, layersFrom, smooth, lerp } from "./story";
import { Scene, Show, SIR } from "./scenes";
import { Stage, CamInfo, person, blob, lidAt, hh } from "./castbase";
import { Outfit, INK, Pen, SIR_DIGSWORTH, FrontOpts, SideOpts } from "./toon";
import { DECK, ROCKETS, deckPt, lamps } from "./deckset";
import { DeckState, SEA, RAFT, LINER, CARP, CDECK_Y, BOATS_NIGHT, BOATS_DECK, boatAt, raftSpots } from "./t3sets";
import wordsJson from "./wordsT3.json";
import talkJson from "./talkT3.json";

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
export const TOTAL_T3 = 1062;
export const HOOK_END = 98;
/** the hook as text: two lines in a free band under the biggest figure (y = pixels at 1080 x 1920) */
export const HOOK = { lines: ["THE TITANIC", "IS SINKING"], x: 60, y: 1374, w: 960, h: 250, size: 118 };

// ---------------- the cast ----------------
type Who = { i: number; o: Outfit; okey: string };
const OFFICER: Who = { i: 41, o: { jacket: "#3f5a94", pants: "#34497a", boots: INK, hat: "peaked", cap: "#f1efe6", moustache: "#5b3a22", buttons: "#e2bb4c", gent: true }, okey: "officer" };
const OFFICER_C: Who = { ...OFFICER, okey: "c_officer" };
const LADY: Who = { i: 52, o: { jacket: "#7b5ac9", pants: "#3b3f52", boots: "#4a3426", hat: "bonnet", dress: "#c25a7a", gent: true }, okey: "lady" };
const KID: Who = { i: 57, o: { jacket: "#2c4a7a", pants: "#2c4a7a", boots: INK, hat: "cap", cap: "#f1efe6", build: "kid", gent: true }, okey: "kid" };
const GENT: Who = { i: 63, o: { jacket: "#8a7a68", pants: "#55505e", boots: INK, hat: "tophat", cap: "#55505e", beard: "#6b4a2a", buttons: "#c9a94a", gent: true }, okey: "gent" };
const GENT_C: Who = { ...GENT, okey: "c_gent" };
const SIR_B: Who = { i: 3, o: { ...SIR_DIGSWORTH, dress: "#8a8f9c" }, okey: "sir_b" };   // Sir Digsworth in a grey blanket
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
const BLANKET_O = (k: number): Outfit => ({ ...CROWD_O[k % CROWD_O.length], dress: ["#8a8f9c", "#7c8a7a", "#9a8a7a", "#7a7f94"][k % 4], jacket: ["#8a8f9c", "#7c8a7a", "#9a8a7a", "#7a7f94"][k % 4] });

// ---------------- shots ----------------
const BEATS: [number, string, number, "night" | "golden"][] = [
  [1, "hook: the sea runs up the tilted deck, Sir Digsworth steps back, a rocket climbs", 0, "night"],
  [2, "truth: close-up, calm, mouth follows the voice", at("truth") - 2, "night"],
  [3, "recap: the empty davits, the lifeboats rowing away", at("recap") - 2, "night"],
  [4, "recap: about 1,500 of us are left: the deck packed", at("recap", "About") - 2, "night"],
  [5, "rockets: they look up", at("rockets") - 3, "night"],
  [6, "bow: down the tilted deck, the sea has covered the forward deck", at("bow") - 3, "night"],
  [7, "the sea comes up the deck: they climb, a bench slides down", at("bow", "sea") - 2, "night"],
  [8, "gone: from a lifeboat, the liner low by the bow", at("gone") - 2, "night"],
  [9, "gone: only the sea, stars, deck chairs and planks", at("gone", "Titanic") - 3, "night"],
  [10, "boat: swimming for the overturned lifeboat", at("boat") - 2, "night"],
  [11, "boat: about thirty men cling to it", at("boat", "About") - 2, "night"],
  [12, "dawn: the Carpathia arrives", at("dawn") - 3, "golden"],
  [13, "count: about 700 saved, about 1,500 lost", at("count") - 3, "golden"],
  [14, "end: I survived the Titanic. Most did not.", at("end") - 3, "golden"],
];
export const SHOTS_T3: ShotDef[] = BEATS.map(([id, name, a, light], i) => ({ id, name, a, b: i + 1 < BEATS.length ? BEATS[i + 1][2] : TOTAL_T3, zone: "deck" as const, light, sunAz: light === "night" ? 118 : 35, sunEl: light === "night" ? undefined : 9 }));
export const A_T3: number[] = SHOTS_T3.map((s) => s.a);   // A_T3[k] = the start of shot k + 1
export const layersT3 = layersFrom(SHOTS_T3, {});
export const SHOT_KIND: Record<number, "medium" | "close" | "wide" | "sea"> = { 1: "medium", 2: "close", 3: "sea", 4: "medium", 5: "medium", 6: "wide", 7: "medium", 8: "medium", 9: "wide", 10: "medium", 11: "sea", 12: "medium", 13: "medium", 14: "close" };
const shotOf = (id: number) => SHOTS_T3[id - 1];
const prog = (id: number, f: number) => Math.max(0, Math.min(1, (f - shotOf(id).a) / (shotOf(id).b - shotOf(id).a)));

// ---------------- what the ship and the sets do ----------------
export const stAt = (id: number, f: number): DeckState => {
  const u = prog(id, f);
  switch (id) {
    case 1: return { set: "deck", tilt: 0.17, xw: lerp(-3.2, 0.6, u) };
    case 2: return { set: "deck", tilt: 0.06, xw: -6 };
    case 3: return { set: "deck", tilt: 0.03, xw: -8, boats: "deck" };
    case 4: return { set: "deck", tilt: 0.04, xw: -9 };
    case 5: return { set: "deck", tilt: 0.05, xw: -8 };
    case 6: return { set: "deck", tilt: lerp(0.08, 0.12, u), xw: lerp(-7, -1, u) };
    case 7: return { set: "deck", tilt: 0.13, xw: lerp(-2.5, 0.8, u), bench: 4.5 - 0.0045 * (f - A_T3[6]) ** 2 };
    case 8: return { set: "night", boats: "night", liner: { pitch: lerp(0.05, 0.16, u), sink: lerp(0, 5.5, u) } };
    case 9: return { set: "night", debris: true };
    case 10: case 11: return { set: "night", raft: true, debris: "near", calm: true };
    case 12: return { set: "dawn", raft: true, carp: true };
    default: return { set: "cdeck" };
  }
};
export const deckAt = (id: number, f: number): DeckState => stAt(id, f);

// ---------------- distress rockets (world coordinates; tilt .05 .. .17 is close enough) ----------------
const W0 = (x: number, y: number, z: number, tilt = 0.05): V3 => deckPt({ set: "deck", tilt, xw: -4 }, x, y, z);
export const R_BURST = { r0: 17 / 30, r1: 11.0, r2: 12.95 };
ROCKETS.length = 0;
ROCKETS.push(
  { t0: R_BURST.r0 - 1.0, rise: 1.0, from: W0(-6, 2.5, 4.8, 0.17), apex: W0(-17.5, 8.8, 5.6, 0.17), radius: 3.2, glow: 4 },
  { t0: R_BURST.r1 - 1.3, rise: 1.3, from: W0(-6, 2.5, 3.5), apex: W0(-14.5, 6.6, 5.9), radius: 3.2, glow: 3.5 },
  { t0: R_BURST.r2 - 1.2, rise: 1.2, from: W0(-7, 2.5, 11.5), apex: W0(-16, 6.8, 8.6), radius: 3.2, glow: 3.5 });
export const FLARE_POS = (n: 0 | 1 | 2): V3 => ROCKETS[n].apex as V3;

// ---------------- cameras ----------------
const D = (id: number, f: number, p: V3): V3 => deckPt(stAt(id, f), p[0], p[1], p[2]);
const nom = (id: number, pos: V3, look: V3, fov: number, k: number, roll = 0) => (f: number) => zoom(D(id, f, pos), D(id, f, look), fov, k, { roll });
const SIR1 = (f: number): V3 => [5.5 + 0.0045 * f, 0, 8.3];
const SIR2: V3 = [-3, 0, 7.2];
const SIR4: V3 = [7.6, 0, 6.5];
const C4: V3 = [12.0, 1.35, 6.8];
const S7X = (f: number) => 2 + 0.027 * (f - A_T3[6]);
const SIR5: V3 = [0.5, 0, 6.65], OFF5: V3 = [-2.1, 0, 7.5];
const CAMS: Record<number, Key[]> = {
  1: [{ f: 0, s: (f) => { const s = SIR1(f); return nom(1, [s[0] + 4.45, 1.2, s[2] + 0.1], [s[0] - 9, -0.45, s[2] + 0.1], 40, pushK(f, 0, 0.0001), 0.14)(f); } }],
  2: [{ f: A_T3[1], s: (f) => nom(2, [-5.7, 1.23, 7.0], [-0.5, 1.2, 7.0], 36, pushK(f, A_T3[1], 0.0003), 0.0)(f) }],
  3: [{ f: A_T3[2], s: (f) => nom(3, [9.2, 3.4, 6.5], [9.2, 2.3, 32], 80, pushK(f, A_T3[2], 0.0006), 0.01 * Math.sin(f * 0.1))(f) }],
  4: [{ f: A_T3[3], s: (f) => nom(4, C4, [C4[0] - 20, 1.25, 6.8], 40, pushK(f, A_T3[3], 0.0005), 0.02)(f) }],
  5: [{ f: A_T3[4], s: (f) => nom(5, [4.3, 0.6, 6.9], [-4, 1.16, 6.9], 40, pushK(f, A_T3[4], 0.0002), 0.03)(f) }],
  6: [{ f: A_T3[5], s: (f) => nom(6, [11, 3.4, 7.4], [-14, -0.4, 7.6], 50, pushK(f, A_T3[5], 0.0008), -0.07)(f) }],
  7: [{ f: A_T3[6], s: (f) => { const x = S7X(f); return nom(7, [x + 3.9, 1.2, 7.5], [x - 9, 0.35, 7.5], 40, 1, -0.1)(f); } }],
  8: [{ f: A_T3[7], s: (f) => zoom([0.1, SEA + 1.65 + 0.03 * Math.sin(f * 0.13), -0.25], [-1.6, SEA - 1.1, 40], 40, pushK(f, A_T3[7], 0.0003), { roll: 0.02 * Math.sin(f * 0.1) }) }],
  9: [{ f: A_T3[8], s: (f) => zoom([0.3, SEA + 1.3 + 0.04 * Math.sin(f * 0.12), 0.6], [0.2, SEA + 1.9, 14], 44, pushK(f, A_T3[8], 0.0004), { roll: 0.015 * Math.sin(f * 0.09) }) }],
  10: [{ f: A_T3[9], s: (f) => { const t = f - A_T3[9]; return zoom([0.0, SEA + 0.95 + 0.03 * Math.sin(f * 0.14), -2.9], [0.0, SEA - 3.0, 12], 40, 1, { roll: 0.03 }); } }],
  11: [{ f: A_T3[10], s: (f) => zoom([0.3, SEA + 2.2, 1.2], [0, SEA + 0.8, 12], 52, pushK(f, A_T3[10], 0.0005), { roll: 0.0 }) }],
  12: [{ f: A_T3[11], s: (f) => zoom([RAFT.x + 0.9, SEA + 1.4, RAFT.z - 5.3], [RAFT.x + 0.9, SEA + 3.5, RAFT.z + 25], 40, pushK(f, A_T3[11], 0.0002), { roll: 0.02 }) }],
  13: [{ f: A_T3[12], s: (f) => zoom([0.4, CDECK_Y + 1.35, -6.8], [0.6, CDECK_Y + 1.25, 9], 40, pushK(f, A_T3[12], 0.0002), { roll: 0.0 }) }],
  14: [{ f: A_T3[13], s: (f) => zoom([2.0, CDECK_Y + 1.28, 5.6], [2.2, CDECK_Y + 1.2, 12], 36, pushK(f, A_T3[13], 0.0004), { roll: 0.0 }) }],
};
/** thumbnails only: 1 = Sir shocked in the water at the lens, 2 = Sir big at the edge of the upturned boat */
export const THUMB = { mode: -1 };
export const camAtT3 = (id: number, f: number): Cam => THUMB.mode === 2 && id === 11 ? zoom([RAFT.x, SEA + 1.7, RAFT.z - 5.1], [RAFT.x, SEA + 1.6, RAFT.z + 2], 40, 1, { roll: 0 }) as Cam : run(CAMS[id], f);
export const dofAtT3 = dofFrom([
  { f: 0, cInf: 3, focus: () => W0(5.7, 1.4, 8.3, 0.17) },
  { f: A_T3[1], cInf: 0 },
  { f: A_T3[2], cInf: 0 }, { f: A_T3[3], cInf: 2, focus: () => [SIR4[0], 1.3, SIR4[2]] as V3 }, { f: A_T3[4], cInf: 4, focus: () => [SIR5[0], 1.2, SIR5[2]] as V3 },
  { f: A_T3[5], cInf: 0 }, { f: A_T3[6], cInf: 2, focus: (f) => W0(S7X(f), 1.3, 7.76, 0.13) }, { f: A_T3[7], cInf: 4, focus: () => [0, SEA + 1.2, 3.3] as V3 },
  { f: A_T3[8], cInf: 0 }, { f: A_T3[9], cInf: 4, focus: () => [0.5, SEA + 0.7, -0.7] as V3 }, { f: A_T3[10], cInf: 0 },
  { f: A_T3[11], cInf: 0 }, { f: A_T3[12], cInf: 0 }, { f: A_T3[13], cInf: 7, focus: () => [2, CDECK_Y + 1.3, 8.3] as V3 },
]);

// ---------------- screen cards (tags and the chalk board): fixed boxes in pixels, placed through the camera ----------------
export type Box = { x0: number; y0: number; x1: number; y1: number };
export const TAGS: { id: number; a: number; b: number; box: Box; l1: string; l2: string }[] = [
  { id: 2, a: at("truth", "My") + 2, b: A_T3[2], box: { x0: 36, y0: 420, x1: 424, y1: 698 }, l1: "THE EVENTS\nARE TRUE", l2: "my part is dramatised" },
  { id: 9, a: A_T3[8] + 10, b: A_T3[9], box: { x0: 150, y0: 330, x1: 930, y1: 520 }, l1: "2:20 A.M.", l2: "15 APRIL 1912" },
  { id: 12, a: at("dawn", "Carpathia") - 4, b: A_T3[12], box: { x0: 270, y0: 330, x1: 810, y1: 642 }, l1: "THE CARPATHIA", l2: "ABOUT 4 A.M." },
];
export const BOARD = { id: 13, box: { x0: 560, y0: 250, x1: 1030, y1: 560 } as Box, l1: at("count", "about"), l2: at("count", "About") - 2 };
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
const rr = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
const fit = (g: CanvasRenderingContext2D, s: string, maxW: number, size: number, weight: string) => { let z = size; do { g.font = `${weight} ${z}px 'Arial Black', Impact, sans-serif`; z -= 2; } while (g.measureText(s).width > maxW && z > 14); };
const labelDraw = (l1: string, l2: string, H: number) => (p: Pen) => {
  const g = p.g, ls = l1.split("\n"), two = ls.length > 1; rr(g, 8, 8, 504, H - 16, 26); g.fillStyle = "#f6efd8"; g.fill(); g.lineWidth = 10; g.strokeStyle = INK; g.stroke();
  g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = INK;
  ls.forEach((l, i) => { fit(g, l, 450, two ? 80 : Math.min(74, H * 0.42), "900"); g.fillText(l, 260, two ? H * (0.24 + i * 0.22) : H * 0.37); });
  fit(g, l2, 450, two ? 46 : Math.min(46, H * 0.28), "700"); g.fillStyle = "#7a1f1c"; g.fillText(l2, 260, two ? H * 0.8 : H * 0.69);
};
const boardDraw = (n: number) => (p: Pen) => {
  const g = p.g; rr(g, 10, 10, 540, 310, 14); g.fillStyle = "#2c4a3c"; g.fill(); g.lineWidth = 16; g.strokeStyle = "#6b4a2e"; g.stroke(); g.lineWidth = 3; g.strokeStyle = INK; rr(g, 2, 2, 556, 326, 18); g.stroke();
  g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#f4f0e2";
  if (n >= 1) { fit(g, "ABOUT 700 SAVED", 470, 58, "900"); g.fillText("ABOUT 700 SAVED", 280, 100); g.fillRect(70, 138, 420, 5); }
  if (n >= 2) { fit(g, "ABOUT 1,500 LOST", 470, 58, "900"); g.fillStyle = "#ffe0b0"; g.fillText("ABOUT 1,500 LOST", 280, 214); g.fillRect(70, 252, 420, 5); }
};
const cards = (out: Stage, id: number, f: number) => {
  for (const t of TAGS) if (t.id === id && f >= t.a && f < t.b) {
    const n = f - t.a, k = n < 5 ? 0.6 + 0.4 * ((n + 1) / 5) : 1, pl = placeBox(id, f, t.box);
    const chh = Math.round((520 * (t.box.y1 - t.box.y0)) / (t.box.x1 - t.box.x0)); out.fx.push({ key: `lab|${t.l1}|${t.l2}|${chh}`, cw: 520, ch: chh, draw: labelDraw(t.l1, t.l2, chh), x: pl.p[0], y: pl.p[1], z: pl.p[2], w: pl.w * k, h: pl.h * k, top: true });
  }
  if (id === BOARD.id) {
    const n = f >= BOARD.l2 ? 2 : f >= BOARD.l1 ? 1 : 0, pl = placeBox(id, f, BOARD.box);
    if (n > 0) out.fx.push({ key: `board|${n}`, cw: 560, ch: 330, draw: boardDraw(n), x: pl.p[0], y: pl.p[1], z: pl.p[2], w: pl.w, h: pl.h, top: true });
  }
};
export const BOARD_POS = (f: number): V3 => placeBox(BOARD.id, f, BOARD.box).p;

// ---------------- gaze events: from frame a to b something happens at pos; the main figures must look at it ----------------
export type Ev = { a: number; b: number; pos: (f: number) => V3; who?: string[] };
export const EVENTS: Ev[] = [
  { a: 15, b: 46, pos: () => FLARE_POS(0), who: ["sir"] },
  { a: Math.round(R_BURST.r1 * 30), b: Math.round(R_BURST.r2 * 30) - 1, pos: () => FLARE_POS(1), who: ["sir", "officer"] },
  { a: Math.round(R_BURST.r2 * 30), b: A_T3[5], pos: () => FLARE_POS(2), who: ["sir", "officer"] },
  { a: A_T3[7] + 2, b: A_T3[8], pos: (f) => { const u = prog(8, f); return [LINER.x, SEA + 8 - lerp(0, 5.5, u), LINER.z - 50]; }, who: ["lady", "kid"] },
  { a: A_T3[11] + 14, b: A_T3[12], pos: () => [CARP.x + 6, SEA + 7, CARP.z - 25], who: ["sir"] },
  { a: at("count", "about") + 4, b: A_T3[13], pos: (f) => BOARD_POS(f), who: ["sir_b"] },
  { a: at("end", "Most") - 8, b: TOTAL_T3, pos: () => [-6, CDECK_Y + 1.1, 12], who: ["sir"] },
];
/** counts: between a and b the picture must show n figures (main + crowd, not swimmers) */
export const COUNTS: { id: number; min: number; max: number; what: string }[] = [{ id: 4, min: 60, max: 9999, what: "figures on the packed deck" }, { id: 11, min: 30, max: 30, what: "men on the upturned boat" }];
/** for the layout check: the lit things of every shot (windows, lanterns, liner lights) and the boats */
export const boatsOf = (id: number, f: number): [number, number, number][] => id === 8 ? BOATS_NIGHT.map((b) => [b.x, SEA + 0.5, b.z]) : id === 3 ? BOATS_DECK.map((_, i) => { const b = boatAt(i, f / 30); return [b.x, SEA + 0.5, b.z] as [number, number, number]; }) : id === 11 || id === 12 ? [[RAFT.x, RAFT.y, RAFT.z]] : [];

// ---------------- people ----------------
const SIRO = (f: number, fo: FrontOpts, talk = true) => ({ fo: { mode: "stand" as const, blink: lidAt(f / 30, 3), ...fo }, talk: talk ? talkOf(f) : 0 });
const ease = (f: number, a: number, b: number) => smooth((f - a) / (b - a));
const stand = (out: Stage, cam: CamInfo, who: Who, p: V3, fo: FrontOpts, f: number, extra: { talk?: number; scale?: number } = {}) => {
  const pl = person(out, cam, who, p[0], p[1], p[2], { fo: { mode: "stand", blink: lidAt(f / 30, who.i), ...fo }, talk: extra.talk ?? 0, scale: extra.scale }, false);
  blob(out, cam, p[0], p[1], p[2], extra.scale ?? 1, 0.55);
  return pl;
};
const crowdAt = (out: Stage, cam: CamInfo, k: number, p: V3, f: number, fo: FrontOpts = {}, near = true) => {
  const who = crowdWho(k), ex = (["nervous", "shock", "stern", "nervous"] as const)[k % 4];
  person(out, cam, who, p[0], p[1], p[2], { fo: { mode: "stand", expr: ex, facing: 0, blink: lidAt(f / 30, who.i + k), ...fo } }, false);
  if (near) blob(out, cam, p[0], p[1], p[2], 1, 0.6);
};

export const sceneAtT3 = (id: number, f: number, cam: CamInfo): Scene => {
  const out: Scene = { places: [], fx: [], guns: [], crates: [], fan: 0 };
  const st = stAt(id, f), t = f / 30, P = (x: number, y: number, z: number): V3 => deckPt(st, x, y, z);
  cards(out, id, f);
  if (id === 1) {
    const s = SIR1(f), up = 1 - ease(f, 40, 52), sp = P(s[0], 0, s[2]);
    stand(out, cam, SIR, sp, { mode: "stroll", phase: 0.5 + f * 0.016, expr: "shock", look: up, lookUp: 0.85 * up, headTilt: -3 * up }, f, { talk: talkOf(f) });
  } else if (id === 2) {
    stand(out, cam, SIR, P(SIR2[0], 0, SIR2[2]), { expr: "neutral" }, f, { talk: talkOf(f) });
  } else if (id === 3) {
    BOATS_DECK.forEach((_, i) => { const b = boatAt(i, t), c = Math.cos(b.yaw), s = Math.sin(b.yaw); for (let k = 0; k < 6; k++) { const sx = -2.2 + k * 0.88; person(out, cam, crowdWho(i * 7 + k), b.x + sx * c, SEA + 0.62, b.z - sx * s, { scale: 1.25, fo: { mode: "sit", expr: "nervous", blink: lidAt(t, k + i * 9) } }, false); } });
  } else if (id === 4) {
    stand(out, cam, SIR, P(SIR4[0], 0, SIR4[2]), { expr: "nervous", look: -0.4 }, f, { talk: talkOf(f) });
    let n = 0;
    for (let d = 5.6; d < 34; d += 1.55) {
      const lat = 0.2047 * d * 1.06, step = 0.98, cnt = Math.floor((2 * lat) / step);
      for (let j = 0; j <= cnt; j++) {
        const z = C4[2] - lat + j * step + 0.3 * (hh(n, 7) - 0.5) + (Math.round(d / 1.55) % 2 ? 0.45 : 0), x = C4[0] - d - 0.3 * hh(n, 8);
        if (Math.abs(z - SIR4[2]) < 0.8 && Math.abs(x - SIR4[0]) < 2.2) { n++; continue; }
        crowdAt(out, cam, n, P(x, 0, z), f, { look: (hh(n, 9) - 0.5) * 1.4, facing: 0 }, d < 14); n++;
      }
    }
  } else if (id === 5) {
    const e1 = f >= Math.round(R_BURST.r1 * 30) - 6, up1 = smooth((f - (Math.round(R_BURST.r1 * 30) - 8)) / 8) * 0.9;
    const lk = f < 389 ? 1 : 0.5;
    stand(out, cam, SIR, P(SIR5[0], 0, SIR5[2]), { expr: "shock", look: e1 ? -1 * lk : 0, lookUp: up1, blink: lidAt(t, 3) }, f, { talk: talkOf(f) });
    stand(out, cam, OFFICER, P(OFF5[0], 0, OFF5[2]), { expr: "nervous", look: e1 ? 1 : 0, lookUp: up1 }, f);
  } else if (id === 6) {
    for (let k = 0; k < 7; k++) crowdAt(out, cam, k + 3, P(-2 + k * 1.4 + 0.5 * (f - A_T3[5]) * 0.03, 0, 5.2 + 1.5 * (k % 3)), f, { look: 0 }, false);
  } else if (id === 7) {
    const x0 = S7X(f), glance = f - A_T3[6] > 14 && f - A_T3[6] < 30 ? -1 : 0;
    const walk = (who: Who, dx: number, z: number, fo: FrontOpts, talk = 0) => { const p = P(x0 + dx, 0, z); person(out, cam, who, p[0], p[1], p[2], { fo: { mode: "stroll", phase: ((x0 + dx) / 1.0 % 1 + 1) % 1, expr: "nervous", facing: 0, blink: lidAt(t, who.i), ...fo }, talk }, false); blob(out, cam, p[0], p[1], p[2], 1, 0.55); };
    walk(SIR, 0, 7.76, { look: glance, headTilt: glance ? 4 : 0 }, talkOf(f)); walk(OFFICER, -2.3, 6.88, { look: 0 }); walk(GENT_C, -4.4, 6.2, { look: 0 });
  } else if (id === 8) {
    // the first lifeboat: the lady and the child look at the liner (to the right)
    const hull = BOATS_NIGHT[0];
    person(out, cam, LADY, 0.25, SEA + 0.6, hull.z - 0.15, { scale: 1.06, fo: { mode: "sit", expr: "shock", facing: 1, look: 1, lookUp: 0.6, blink: lidAt(t, 52) } }, false);
    person(out, cam, KID, -0.395, SEA + 0.6, hull.z - 0.15, { fo: { mode: "sit", expr: "nervous", facing: 1, look: 1, lookUp: 0.6, blink: lidAt(t, 57) } }, false);
    BOATS_NIGHT.slice(1).forEach((b, i) => { for (let k = 0; k < 5; k++) person(out, cam, crowdWho(i * 5 + k + 2), b.x + (-1.7 + k * 0.85) * Math.cos(b.yaw), SEA + 0.6, b.z - (-1.7 + k * 0.85) * Math.sin(b.yaw), { fo: { mode: "sit", expr: "nervous" } }, false); });
  } else if (id === 10) {
    const u = f - A_T3[9], x = 0.015 - 0.0004 * u, y = SEA - 0.8 + 0.04 * Math.sin(t * 5), sw = 0.5 + 0.5 * Math.sin(t * 6.5);
    person(out, cam, SIR, x, y, -0.7, { fo: { mode: "stand", expr: THUMB.mode === 1 ? "shock" : "nervous", facing: THUMB.mode === 1 ? 0 : 1, look: THUMB.mode === 1 ? 0 : 1, cheer: 0.18 + 0.2 * sw, blink: lidAt(t, 3), ...({ swim: 0.8 } as object) }, talk: talkOf(f) }, false);
  } else if (id === 11) {
    const spots = raftSpots(30), u = f - A_T3[10], op = { x: RAFT.x + 0.05, z: RAFT.z - 1.0 };
    let oi = 0, od = 9; spots.forEach((q, i) => { const d = Math.hypot(q.x - op.x, q.z - op.z); if (d < od) { od = d; oi = i; } });
    spots.forEach((q, i) => {
      if (i === oi) { person(out, cam, OFFICER, q.x, RAFT.y + 0.05, q.z, { fo: { mode: "stand", expr: "nervous", point: 0.8, look: -0.4, blink: lidAt(t, 41) } }, false); return; }
      person(out, cam, crowdWho(i * 5 + 1), q.x, RAFT.y + 0.05, q.z, { fo: { mode: q.kneel ? "sit" : "stand", expr: "nervous", facing: 0, look: (hh(i, 3) - 0.5) * 1.2, blink: lidAt(t, i + 4) } }, false);
    });
    if (THUMB.mode === 2) { person(out, cam, SIR, RAFT.x + 0.4, RAFT.y + 0.05, RAFT.z - 1.3, { fo: { mode: "stand", expr: "nervous", look: 0, blink: 0 } }, false); return out; }
    const rise = ease(f, A_T3[10] + 20, A_T3[11]), sx = RAFT.x - 1.6, sy = SEA - 0.8 + 0.7 * rise;
    person(out, cam, SIR, sx, sy, RAFT.z - 1.7, { fo: { mode: "stand", expr: "nervous", cheer: 0.3, look: 0.5, blink: lidAt(t, 3), ...({ swim: Math.max(0, 0.8 - 0.7 * rise) } as object) }, talk: talkOf(f) }, false);
  } else if (id === 12) {
    const w = (k: number) => 0.4 + 0.6 * Math.abs(Math.sin(t * 5 + k));
    person(out, cam, SIR, RAFT.x + 0.9, RAFT.y + 0.05, RAFT.z - 1.25, { fo: { mode: "stand", expr: "nervous", facing: 1, look: 1, wave: w(0), blink: lidAt(t, 3) }, talk: talkOf(f) }, false);
    raftSpots(30).forEach((s, i) => { if (s.x < RAFT.x + 0.5) return; if (Math.hypot(s.x - (RAFT.x + 0.9), s.z - (RAFT.z - 1.25)) < 0.7) return; person(out, cam, i === 3 ? OFFICER_C : crowdWho(i * 5 + 1), s.x, RAFT.y + 0.05, s.z + 0.12, { fo: { mode: s.kneel ? "sit" : "stand", expr: "relief", facing: 1, look: 1, wave: i % 3 === 0 ? w(i) : undefined, blink: lidAt(t, i + 4) } }, false); });
  } else if (id === 13) {
    const ly = CDECK_Y + 0.03;
    stand(out, cam, SIR_B, [0.72, ly, -2.6], { expr: "neutral", look: 1, lookUp: 0.7, blink: lidAt(t, 3) }, f, { talk: talkOf(f) });
    for (let r = 0; r < 5; r++) for (let c = 0; c < 9; c++) {
      const x = -6.2 + c * 1.55 + (r % 2) * 0.7 + 0.25 * (hh(r * 9 + c, 5) - 0.5), z = 0.2 + r * 1.55;
      if (Math.abs(x + 1.0) < 1.4 && z < -1) continue;
      person(out, cam, { i: 90 + ((r * 9 + c) % 12) * 3, o: BLANKET_O(r * 3 + c), okey: "c_b" + (((r * 3 + c) % 12) + 12 * (((r * 3 + c) % 4)))}, x, ly, z, { fo: { mode: "sit", expr: (["nervous", "stern", "neutral"] as const)[(r + c) % 3], facing: 0, blink: lidAt(t, r * 9 + c) } }, false);
    }
  } else if (id === 14) {
    const ly = CDECK_Y + 0.03, turn = ease(f, at("end", "Most") - 14, at("end", "Most") - 4);
    stand(out, cam, SIR_B, [2.0, ly, 8.3], { expr: "neutral", look: turn, facing: turn > 0.5 ? 1 : 0, blink: lidAt(t, 3, [(at("end", "Most") - 10) / 30]) }, f, { talk: talkOf(f) });
  }
  void SIR_DIGSWORTH; void ({} as SideOpts);
  return out;
};
export const SHOW_T3: Show = { shots: SHOTS_T3, camAt: camAtT3, sceneAt: sceneAtT3, crowdFor: () => null, wheatAt: () => 1, deckAt };

/** what scripts/kit_check.mjs needs from a film */
const davitPosts = (id: number, f: number) => {
  if (stAt(id, f).set !== "deck") return [];
  const st = stAt(id, f), out: { name: string; x: number; y: number; z: number; w: number; h: number }[] = [];
  for (const cx of [DECK.boat[0], DECK.gone]) for (const sg of [-1, 1]) { const p = deckPt(st, cx + sg * 4.6, 0, DECK.railZ - 0.35); out.push({ name: "davit post", x: p[0], y: p[1], z: p[2], w: 0.2, h: 3.6 }); }
  return out;
};
export const FILM_CHECK = {
  shots: SHOTS_T3, camAt: camAtT3, sceneAt: sceneAtT3, kinds: SHOT_KIND, hook: { ...HOOK, end: HOOK_END }, events: EVENTS, counts: COUNTS, tags: TAGS, board: BOARD,
  lamps, boats: boatsOf, props: davitPosts, rockets: ROCKETS, passengers: ["lady", "kid"], deckAt,
};
