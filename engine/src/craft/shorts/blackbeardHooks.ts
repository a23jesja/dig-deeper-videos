// The hook lab for "Why did Blackbeard light fuses in his beard?" (DAILY-RULES, "The hook lab"): seconds 0-5 built three ways as
// small clips, so that the strongest opening is chosen before the film is built. Each clip has its own voice (voice/blackbeard-hook-a,
// -b, -c; bm_george stands in until Jesper has chosen the new voice) and three pictures. Sources: granskning/blackbeard-fuses/manus.md.
//   a: the strangest thing already happening: he walks out of the gun smoke with his fuses glowing; the crew back away.
//   b: a shocking statement over the action: "Blackbeard's beard smoked in battle." as he steps down onto the deck.
//   c: Sir Digsworth in trouble, with the question: he coughs in the smoke, and the smoke behind him has two glowing eyes of fire.
import * as THREE from "three";
import { Film, Shot, Cam, V3, Word, Staged, play, talk, smooth } from "../stage/film";
import { mover, mt, wag, arm, MM } from "../stage/acting";
import { lens, once, noShade, near, palm, stageAt, fuseSmoke } from "../stage/staging";
import { wield, letGo, quiet, heldOver, usePose, BUCKET as BUCKET_P, SABRE } from "../stage/grips";
import { flagSea, FLAGSEA_SOLIDS, MERCHANT_DECK } from "../world/ship";
import { smoke } from "../world/fire";
import { bucketHeld, barrel, sabre } from "../world/props";
import { SIR_D, BLACKBEARD_D, COOK_D, SAILOR_D, OLDHAND_D, SHIPBOY_D } from "../looks";
import type { Pose } from "../rig";
import type { Design } from "../designs/common";
import wa from "../../../voice/blackbeard-hook-a/words.json";
import la from "../../../voice/blackbeard-hook-a/lines.json";
import wb from "../../../voice/blackbeard-hook-b/words.json";
import lb from "../../../voice/blackbeard-hook-b/lines.json";
import wc from "../../../voice/blackbeard-hook-c/words.json";
import lc from "../../../voice/blackbeard-hook-c/lines.json";

type Lines = Record<string, { id: string; a: number; b: number }>;
const byId = (l: unknown) => Object.fromEntries((l as { id: string; a: number; b: number }[]).map((x) => [x.id, x])) as Lines;
const P = (o: Partial<Pose>) => o;
const MD = MERCHANT_DECK, LEN = 5.0;
/** a figure of the cast standing on the merchant's deck */
const on = (name: string, D: Design, m: MM, t: number, o: Parameters<typeof play>[6] = {}) => play(name, D, m, t, [0, MD, 0], m.h, o);
/** the lens across the merchant's deck from her port side toward the ship alongside, between her two masts (so that neither stands
 *  in the picture): the gun smoke hangs between the ships, and whoever comes aboard walks straight at us */
const DECK = lens(-10.9, 1.5, 2.2, 1, 0, -2, 56);
/** the gun smoke that hangs over the deck after a broadside: big, slow, pale puffs at the far end and drifting across */
const powder = (g: THREE.Group, T: number, near_: number, seed = 0) => {
  for (const [d, l, big] of [[5.4, -1.3, 1.2], [5.9, 0.7, 1.4], [5.0, 1.7, 1.0], [6.6, -0.2, 1.6]] as [number, number, number][]) { const [x, z] = DECK.spot(d - near_, l); smoke(g, [x, MD - 0.4, z], T * 0.5, 6, 2.4, big, 0.5, 0.2, "#c9c3bb", seed + d); }
};
/** a close lens on a face: looking at the point p from `d` metres away, a little below */
const faceLens = (p: V3, from: [number, number], d = 0.9, fov = 34) => { const n = Math.hypot(from[0], from[1]) || 1, fx = from[0] / n, fz = from[1] / n; return lens(p[0] - fx * d, p[1] - 0.05, p[2] - fz * d, fx, fz, 3, fov); };
const MENACE = { brow: -1, lid: 0.25, smile: 0.35, gaze: [0, 0] as [number, number] };
const BUCKET = once(() => noShade(bucketHeld(0.3))), BARREL = once(() => barrel(0.9, 0.32, "#8a5a36")), CUTLASS = once(() => noShade(sabre(0.6)));

/** Blackbeard walking out of the smoke toward the lens from `d0` to `d1` metres away, along the deck */
const stride = (d0: number, d1: number, l = 0.1, dur = 2.4) => { const [x, z] = DECK.spot(d0, l), m = mover(BLACKBEARD_D, 1.92, x, z, DECK.toward(x, z, 0)); m.walk(mt(m, d0 - d1), { step: 0.55, tau: 0.5 }).stand(9);
  m.actAt(-1, { armL: arm(16, 26, 40, 30), armR: arm(16, 26, 40, 30), lean: 3, head: [0, 6, 0] }, 10, { in: 0.01, handL: "fist", handR: "fist", face: MENACE }); void dur; return m; };
/** the cook with his bucket: his arms fly up at `up` and the bucket leaves his hand, falls to the deck and tips over */
const cookWithBucket = (V: ReturnType<typeof lens>, d: number, l: number, up: number) => { const [x, z] = V.spot(d, l), m = mover(COOK_D, 1.58, x, z, V.toward(x, z, -10)); m.stand(9);
  m.actAt(-1, { armR: arm(14, 12, 26, 6), armL: arm(20, 12, 40, 8), head: [-30, -4, 0] }, 10, { in: 0.01, handR: "grip", handL: "open", face: { wide: 0.6, lid: 0, brow: 0.8, mouth: 0.3 } });
  m.actAt(up, { armL: arm(150, 36, 180, 14), armR: arm(152, 36, 182, 14), lean: -6, head: [-20, -8, 0], py: -0.02 }, 9, { in: 0.2, antic: 0, over: 1.5, handL: "open", handR: "open", face: { wide: 1, lid: 0, brow: 1, mouth: 0.8, smile: -0.8 } });
  return m; };
const bucketFall = (g: THREE.Group, c: Record<string, Staged>, t: number, cam: Cam, V: ReturnType<typeof lens>, cook: MM, up: number, land: [number, number], memo: { p?: { p: V3; over: boolean } }) => {
  const u = t - up;
  if (u < 0) { wield(g, BUCKET(), BUCKET_P, "carry", c.cook, "R", cam); return; }
  memo.p ??= quiet(() => { const s = stageAt(on("cook", COOK_D, cook, up, { seed: 9, blink: false }), V.cam); return { p: near(palm(s, "R"), V.cam, 0.05), over: heldOver(s, "R", V.cam) }; });
  const c0: V3 = [memo.p.p[0], memo.p.p[1] - 0.33, memo.p.p[2]], vy = 0.9, T1 = (vy + Math.sqrt(vy * vy + 19.6 * Math.max(0.05, c0[1] - MD - 0.16))) / 9.8;
  letGo(g, BUCKET(), BUCKET_P, memo.p.p, [(land[0] - c0[0]) / T1, vy, (land[1] - c0[2]) / T1], u, MD, cam, { centre: [0, -0.33], r: 0.16, spin: 0.45, mirror: memo.p.over, rests: [0, 90, -90] });
};
/** a sailor who backs away with his hands up */
const backer = (V: ReturnType<typeof lens>, D: Design, h: number, d: number, l: number, off: number, t0 = 0.1) => { const [x, z] = V.spot(d, l), m = mover(D, h, x, z, V.toward(x, z, off)); m.stand(9);
  m.actAt(-1, { armL: arm(40, 24, 96, 10), armR: arm(40, 24, 96, 10), head: [0, -4, 0] }, 10, { in: 0.01, handL: "open", handR: "open", face: { wide: 0.8, lid: 0, brow: 0.8, smile: -0.6 } });
  m.actAt(t0, { armL: arm(148, 34, 178, 16), armR: arm(148, 34, 178, 16), lean: -8, py: -0.02 }, 9, { in: 0.3, antic: 0.2, over: 1.4, handL: "open", handR: "open", face: { wide: 1, lid: 0, brow: 1, mouth: 0.6, smile: -1 } });
  wag(m, 0.4, 5, P({ roll: 2.4, py: -0.01 }), P({ roll: -2.4, py: 0.01 }), 0.17); return m; };
/** the close-up of his face: the smoke curls past his eyes, the glow on his cheeks breathes, and he smiles slowly */
const faceShot = (id: string, a0: number, b0: number, W: Word[], line: string[]): Shot => {
  const [x, z] = DECK.spot(3.4, 0.1), m = mover(BLACKBEARD_D, 1.92, x, z, DECK.toward(x, z, 8)); m.stand(9);
  m.actAt(-1, { armL: arm(16, 26, 40, 30), armR: arm(16, 26, 40, 30), head: [6, 10, 0] }, 10, { in: 0.01, handL: "fist", handR: "fist", face: { brow: -1, lid: 0.3, smile: 0 } });
  m.actAt(0.2, { head: [0, 4, -4] }, 9, { in: 0.5, antic: 0, over: 1.1, face: { brow: -1, lid: 0.4, smile: 0.7 } });
  const top: V3 = [x, MD + 1.74, z], V = faceLens(top, [DECK.cam.pos[0] < x ? 1 : -1, 0.12], 1.75, 36);
  return { id, a: a0, b: b0, still: (b0 - a0) * 0.7, sounds: [{ t: 0.05, k: "fire", g: 0.25, dur: b0 - a0 }],
    cam: (_t, u) => V.push(0.08 * u), sun: { target: [x, MD, z], reach: 6 },
    cast: (t, T) => [on("bb", BLACKBEARD_D, m, t, { seed: 3, talk: line.length ? talk(W, T, line) : undefined })],
    things: (g, c, _t, T, cam) => { fuseSmoke(g, c.bb, T, cam); powder(g, T, 1.5, 7); } };
};
/** Sir Digsworth close at the merchant's rail */
const sirAt = (V: ReturnType<typeof lens>, d: number, l: number, off: number) => { const [x, z] = V.spot(d, l), m = mover(SIR_D, 1.8, x, z, V.toward(x, z, off)); m.stand(9); return m; };

// ---------------- a: the strangest thing already happening ----------------
const A = (() => {
  const W = wa as Word[], L = byId(la), b1 = (L.hook.b + L.guess.a) / 2, b2 = L.guess.b + 0.12, UP = 0.55, shots: Shot[] = [];
  const bb = stride(4.3, 2.7), cook = cookWithBucket(DECK, 2.3, -0.95, UP), sailor = backer(DECK, SAILOR_D, 1.82, 3.4, 1.15, 8, 0.15), boy = backer(DECK, SHIPBOY_D, 1.28, 2.5, 0.85, 14, 0.3);
  const land = DECK.spot(1.7, -0.45), memo: { p?: { p: V3; over: boolean } } = {};
  shots.push({ id: "hook", a: 0, b: b1, still: 0.9,
    sounds: [{ t: 0.0, k: "blast", g: 1.0 }, { t: 0.0, k: "fire", g: 0.35, dur: b1 }, ...bb.cues().filter((q) => q.k === "step" && q.t < b1).map((q) => ({ t: q.t, k: "step", g: 0.8, p: 0.1 })), { t: UP + 0.45, k: "thunk", g: 0.9, p: -0.3 }, { t: UP + 0.66, k: "rattle", g: 0.6, p: -0.3, dur: 0.4 }],
    cam: (_t, u) => DECK.push(0.25 * u), sun: { target: [-7.5, MD, 5], reach: 9 },
    cast: (t) => [on("bb", BLACKBEARD_D, bb, t, { seed: 3 }), on("cook", COOK_D, cook, t, { seed: 9, blink: false }), on("sailor", SAILOR_D, sailor, t, { seed: 6 }), on("boy", SHIPBOY_D, boy, t, { seed: 8, blink: false })],
    things: (g, c, t, T, cam) => { powder(g, T, 0); fuseSmoke(g, c.bb, T, cam); bucketFall(g, c, t, cam, DECK, cook, UP, land, memo); } });
  // TO KEEP HIS FACE WARM? Sir Digsworth at the rail holds his hands to his own moustache as if to a fire, sniffs, and coughs
  const SV = lens(-8.3, 1.62, 1.6, -1, 0.05, 2, 40), sir = sirAt(SV, 1.7, 0, 0);
  sir.actAt(-1, { armL: arm(60, 30, 150, 40), armR: arm(60, 30, 150, 40), head: [0, 4, 0], lean: 4 }, 10, { in: 0.01, handL: "open", handR: "open", face: { brow: 0.8, lid: 0.3, smile: 0.4 } });
  wag(sir, 0.15, 0.9, P({ armL: arm(60, 34, 150, 44), armR: arm(60, 26, 150, 36) }), P({ armL: arm(60, 26, 150, 36), armR: arm(60, 34, 150, 44) }), 0.3, { handL: "open", handR: "open", face: { brow: 0.8, lid: 0.3, smile: 0.4 } });
  sir.actAt(1.25, { head: [0, -14, 0], lean: -6, py: 0.02 }, 0.5, { in: 0.08, out: 0.25, antic: 0.2, over: 1.5, handL: "open", handR: "open", face: { brow: 1, lid: 0.9, mouth: 0.8, smile: -0.4 } });
  shots.push({ id: "guess", a: b1, b: b2, still: 0.6, sounds: [{ t: 0.9, k: "sniff", g: 0.9 }, { t: 1.3, k: "sniff", g: 0.7, p: 0.2 }],
    cam: (_t, u) => SV.push(0.1 * u), sun: { target: [-8.4, MD, 4], reach: 6 },
    cast: (t, T) => [on("sir", SIR_D, sir, t, { talk: talk(W, T, ["guess"]), blink: false })],
    things: (g, _c, _t, T) => { const [x, z] = SV.spot(2.3, 0.5); smoke(g, [x, MD + 1.1, z], T * 0.6, 5, 1.2, 0.35, 0.3, 0, "#d2ccc4", 4); } });
  shots.push(faceShot("grin", b2, LEN, W, []));
  return { W, shots };
})();

// ---------------- b: a shocking statement over the action ----------------
const B = (() => {
  const W = wb as Word[], L = byId(lb), b1 = (L.hook.b + L.why.a) / 2, b2 = b1 + 1.05, shots: Shot[] = [];
  // he strides out of the smoke with his cutlass up, the lens low and looking up at him; the crew scatter to both sides
  const LOW = lens(-10.6, 0.95, 2.0, 1, 0.06, 9, 56), [rx, rz] = LOW.spot(4.6, 0.15), bb = mover(BLACKBEARD_D, 1.92, rx, rz, LOW.toward(rx, rz, 0)); bb.walk(mt(bb, 1.9), { step: 0.6, tau: 0.45 }).stand(9);
  bb.actAt(-1, { ...usePose(SABRE, "raised", "R"), armL: arm(20, 30, 50, 30), head: [0, 6, 0], lean: 4 }, 10, { in: 0.01, handL: "fist", handR: "grip", face: { ...MENACE, mouth: 0.5 } });
  const sailor = backer(LOW, SAILOR_D, 1.82, 3.3, -0.95, -24, 0.4), old = backer(LOW, OLDHAND_D, 1.74, 3.9, 1.2, 14, 0.55);
  shots.push({ id: "hook", a: 0, b: b1, still: 1.2,
    sounds: [{ t: 0.0, k: "blast", g: 1.0 }, { t: 0.0, k: "fire", g: 0.35, dur: b1 }, { t: 0.05, k: "shing", g: 0.7, p: 0.2 }, ...bb.cues().filter((q) => q.k === "step" && q.t < b1).map((q) => ({ t: q.t, k: "step", g: 0.8 }))],
    cam: (_t, u) => LOW.push(0.15 * u), sun: { target: [-7.5, MD, 3], reach: 9 },
    cast: (t) => [on("bb", BLACKBEARD_D, bb, t, { seed: 3 }), on("sailor", SAILOR_D, sailor, t, { seed: 6 }), on("old", OLDHAND_D, old, t, { seed: 2 })],
    things: (g, c, _t, T, cam) => { powder(g, T, 0.4, 2); fuseSmoke(g, c.bb, T, cam); wield(g, CUTLASS(), SABRE, "raised", c.bb, "R", cam); } });
  shots.push(faceShot("face", b1, b2, W, []));
  // WHY WOULD ANYONE DO THAT? Sir Digsworth leans out from behind a barrel, eyebrows up
  const SV = lens(-8.0, 1.25, 5.7, -0.15, -1, 4, 42), [kx, kz] = SV.spot(1.7, -0.25), sir = sirAt(SV, 2.0, 0.05, 10);
  sir.actAt(-1, { roll: -16, lean: 6, py: -0.1, armL: arm(30, 10, 80, 0), armR: arm(40, 20, 110, 10), head: [10, 0, -10] }, 10, { in: 0.01, handL: "fist", handR: "open", face: { wide: 0.9, lid: 0, brow: 1, mouth: 0.3 } });
  sir.actAt(0.3, { head: [-8, -6, -8] }, 9, { in: 0.3, antic: 0, over: 1.2, face: { wide: 0.6, lid: 0.1, brow: 1, mouth: 0.4, smile: -0.2 } });
  shots.push({ id: "why", a: b2, b: LEN, still: 1.0, sounds: [{ t: 0.15, k: "scuff", g: 0.6 }],
    cam: (_t, u) => SV.push(0.08 * u), sun: { target: [-8.0, MD, 4], reach: 6 },
    cast: (t, T) => [on("sir", SIR_D, sir, t, { talk: talk(W, T, ["why"]), blink: false })],
    things: (g, _c, _t, T) => { const k = g.add(BARREL()); BARREL().position.set(kx, MD, kz); void k; const [x, z] = SV.spot(3.6, 0.8); smoke(g, [x, MD, z], T * 0.5, 5, 2.0, 0.9, 0.4, 0, "#c9c3bb", 6); } });
  return { W, shots };
})();

// ---------------- c: Sir Digsworth in trouble, with the question ----------------
const C = (() => {
  const W = wc as Word[], L = byId(lc), b1 = (L.hook.b + L.hello.a) / 2, b2 = L.hello.b + 0.2, shots: Shot[] = [];
  // he waves the smoke away with his hat and coughs out the question; behind him, deep in the smoke, two points of fire come closer
  const V = lens(-11.0, 1.6, 2.4, 1, 0.04, -2, 50), sir = sirAt(V, 1.9, -0.25, 6);
  sir.actAt(-1, { armR: arm(120, 40, 200, 40), armL: arm(30, 20, 90, 10), head: [0, -6, 0], lean: 6 }, 10, { in: 0.01, handR: "grip", handL: "fist", face: { brow: 1, lid: 0.6, mouth: 0.6, smile: -0.5 } });
  wag(sir, 0.1, 2.2, P({ armR: arm(110, 50, 190, 60) }), P({ armR: arm(130, 20, 210, 20) }), 0.36, { handR: "grip", handL: "fist", face: { brow: 1, lid: 0.6, mouth: 0.6, smile: -0.5 } });
  const bb = stride(4.8, 3.6, 0.45);
  shots.push({ id: "hook", a: 0, b: b1, still: 1.0, hide: [],
    sounds: [{ t: 0.0, k: "blast", g: 0.9 }, { t: 0.0, k: "fire", g: 0.3, dur: b1 }, { t: 0.25, k: "sniff", g: 0.8 }, ...bb.cues().filter((q) => q.k === "step" && q.t < b1).map((q) => ({ t: q.t, k: "step", g: 0.5, p: 0.3 }))],
    cam: (_t, u) => V.push(0.15 * u), sun: { target: [-8, MD, 5], reach: 9 },
    cast: (t, T) => [on("sir", SIR_D, sir, t, { talk: talk(W, T, ["hook"]), blink: false }), on("bb", BLACKBEARD_D, bb, t, { seed: 3 })],
    things: (g, c, _t, T, cam) => { powder(g, T, -0.4, 3); fuseSmoke(g, c.bb, T, cam); const [x, z] = V.spot(3.4, 0.3); smoke(g, [x, MD + 0.2, z], T * 0.4, 7, 1.6, 1.0, 0.2, 0.1, "#cfc9c1", 5); } });
  // OH. HELLO. He turns: the smoking face is right in front of his; he smiles weakly
  const [x, z] = DECK.spot(3.1, 0.2), bb2 = mover(BLACKBEARD_D, 1.92, x, z, DECK.toward(x, z, 30)); bb2.stand(9);
  bb2.actAt(-1, { armL: arm(16, 26, 40, 30), armR: arm(16, 26, 40, 30), head: [-14, 18, 0], lean: 8 }, 10, { in: 0.01, handL: "fist", handR: "fist", face: { brow: -1, lid: 0.3, smile: 0.2 } });
  const [sx, sz] = DECK.spot(2.45, -0.15), sir2 = mover(SIR_D, 1.8, sx, sz, DECK.toward(sx, sz, 150)); sir2.stand(9);
  sir2.actAt(-1, { armL: arm(20, 10, 50, 0), armR: arm(20, 10, 50, 0), head: [0, -10, 0] }, 10, { in: 0.01, handL: "relaxed", handR: "relaxed", face: { brow: 1, lid: 0, wide: 0.9, smile: 0.2, mouth: 0.2 } });
  sir2.turn(-140, 0.35);
  const V2 = lens(sx - 1.0, 1.7, sz + 1.3, 0.62, -0.78, 4, 44);
  shots.push({ id: "hello", a: b1, b: b2, still: 0.9, sounds: [{ t: 0.05, k: "whoosh", g: 0.6 }, { t: 0.05, k: "fire", g: 0.3, dur: b2 - b1 }],
    cam: (_t, u) => V2.push(0.12 * u), sun: { target: [x, MD, z], reach: 7 },
    cast: (t, T) => [on("bb", BLACKBEARD_D, bb2, t, { seed: 3 }), on("sir", SIR_D, sir2, t, { talk: talk(W, T, ["hello"]), blink: false })],
    things: (g, c, _t, T, cam) => { fuseSmoke(g, c.bb, T, cam); powder(g, T, 0.8, 4); } });
  shots.push(faceShot("grin", b2, LEN, W, []));
  return { W, shots };
})();

const clip = (id: string, s: { W: Word[]; shots: Shot[] }, text: string[], audio: string): Film => ({
  id, fps: 30, seconds: LEN, sky: "#9fd6ff", world: flagSea, shots: s.shots, words: s.W, solids: FLAGSEA_SOLIDS,
  hook: { text, a: 0, b: s.shots[0].b, size: 80 }, beds: [{ k: "sea", a: 0, b: LEN, g: 0.8 }, { k: "wind", a: 0, b: LEN, g: 0.4 }], audio,
  grade: () => "linear-gradient(180deg, rgba(255,226,196,0.0) 0%, rgba(214,190,170,0.18) 100%)",
});
export const BB_HOOK_A = clip("blackbeard-hook-a", A, ["WHY DID", "BLACKBEARD'S", "BEARD SMOKE?"], "craft/blackbeard-hook-a.wav");
export const BB_HOOK_B = clip("blackbeard-hook-b", B, ["BLACKBEARD'S", "BEARD SMOKED", "IN BATTLE."], "craft/blackbeard-hook-b.wav");
export const BB_HOOK_C = clip("blackbeard-hook-c", C, ["WHY DOES", "BLACKBEARD'S", "BEARD SMOKE?"], "craft/blackbeard-hook-c.wav");
void smooth;
