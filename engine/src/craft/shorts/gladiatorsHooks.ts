// The hook lab for "Did gladiators really fight to the death?" (DAILY-RULES, "The hook lab"): seconds 0-5 built three ways as small
// clips, so that the strongest opening is chosen before the film is built (granskning/gladiators-death/manus.md). First the set: the
// arena with its crowd, the two gladiators on the sand and Sir Digsworth in the front row, from the lenses the clips use.
import * as THREE from "three";
import { Film, Shot, V3, Word, Cam, Staged, play, talk, smooth } from "../stage/film";
import { mover, MM, arm, wag, mt } from "../stage/acting";
import { lens, once, noShade, palm } from "../stage/staging";
import { GLADIUS, TRIDENT, SHIELD_ARM, shieldOn, wield, usePose, pole, polePose, reach, setDown, Stand } from "../stage/grips";
import { arenaWorld, fans, crowd, seat, facingTo, ARENA, Fan } from "../world/arena";
import { bank } from "../world/fire";
import { gladius, scutum, trident, refStick, netOpen } from "../world/props";
import { SIR_D, MURMILLO_D, RETIARIUS_D, REFEREE_D, ROMAN_WOMAN2_D, BAKER_D, MERCHANT_D, ROMAN_WOMAN_D, ROMAN_WOMAN3_D, CITIZEN_D, COLLECTOR_D, FULLER_D, OLDMAN_D, GIRL_D } from "../looks";
import type { Design } from "../designs/common";
import type { Pose } from "../rig";
import wa from "../../../voice/gladiators-hook-a/words.json";
import la from "../../../voice/gladiators-hook-a/lines.json";
import wb from "../../../voice/gladiators-hook-b/words.json";
import lb from "../../../voice/gladiators-hook-b/lines.json";
import wc from "../../../voice/gladiators-hook-c/words.json";
import lc from "../../../voice/gladiators-hook-c/lines.json";

/** a figure standing at `at` (its own floor height) */
const on = (name: string, D: Design, m: MM, t: number, y = 0, o: Parameters<typeof play>[6] = {}) => play(name, D, m, t, [0, y, 0], m.h, { blink: false, ...o });
const LOOKS: Design[] = [BAKER_D, MERCHANT_D, ROMAN_WOMAN_D, ROMAN_WOMAN2_D, ROMAN_WOMAN3_D, CITIZEN_D, COLLECTOR_D, FULLER_D, OLDMAN_D, GIRL_D];
/** where the fight is (on the sand near the -z wall) and where Sir Digsworth stands in the front row above it */
export const FIGHT: V3 = [1.0, 0, -6.2];
const SIR_TH = -Math.PI / 2 - 0.1, SIR = seat(SIR_TH, 0), WOMAN = seat(SIR_TH + 0.036, 0);
/** the crowd round the fight: the front row (leaving room for Sir and the woman) and the tiers behind */
export const STANDS: Fan[] = fans(LOOKS, -Math.PI / 2 - 0.75, -Math.PI / 2 + 0.75, [0, 1, 2, 3, 4, 5, 6, 7, 8], 3)
  .filter((f) => Math.hypot(f.at[0] - SIR.at[0], f.at[2] - SIR.at[2]) > 0.9 && Math.hypot(f.at[0] - WOMAN.at[0], f.at[2] - WOMAN.at[2]) > 0.6);
const GLAD = once(() => noShade(gladius(0.5))), SCUTUM = once(() => noShade(scutum()));

// ---------------- the set: four still views ----------------
const shots: Shot[] = [];
const view = (id: string, L: ReturnType<typeof lens>) => {
  const mur = mover(MURMILLO_D, 1.84, FIGHT[0] - 0.85, FIGHT[2], 90 - 25), ret = mover(RETIARIUS_D, 1.86, FIGHT[0] + 0.85, FIGHT[2], -90 + 25), sir = mover(SIR_D, 1.8, SIR.at[0], SIR.at[2], SIR.heading), wom = mover(ROMAN_WOMAN2_D, 1.62, WOMAN.at[0], WOMAN.at[2], WOMAN.heading);
  for (const m of [mur, ret, sir, wom]) m.stand(9);
  mur.actAt(-1, { ...usePose(GLADIUS, "ready", "R"), armL: SHIELD_ARM, lean: 6 }, 10, { in: 0.01, handL: "grip", handR: "grip", face: { brow: -0.8, lid: 0.1 } });
  ret.actAt(-1, { armL: arm(40, 20, 96, 10), armR: arm(20, 20, 40, 10), lean: 4 }, 10, { in: 0.01, handL: "fist", handR: "fist", face: { brow: -0.6 } });
  sir.actAt(-1, { armL: arm(150, 10, 200, -20), armR: arm(150, 10, 200, -20) }, 10, { in: 0.01, handL: "open", handR: "open", face: { brow: 1, lid: 0.4, mouth: 0.5 } });
  const a = shots.length * 0.4;
  shots.push({ id, a, b: a + 0.4, still: 0.2, cam: () => L.cam, sun: { target: FIGHT, reach: 14 },
    cast: (t) => [on("mur", MURMILLO_D, mur, t), on("ret", RETIARIUS_D, ret, t), on("sir", SIR_D, sir, t, ARENA.wall), on("wom", ROMAN_WOMAN2_D, wom, t, ARENA.wall)],
    things: (g, c, _t, T, cam) => { crowd(g, STANDS, T, cam, 0.8); wield(g, GLAD(), GLADIUS, "ready", c.mur, "R", cam); shieldOn(g, SCUTUM(), c.mur, "L", cam); } });
};
view("sand-low", lens(FIGHT[0], 1.0, FIGHT[2] + 5.2, 0, -1, 7, 52));
view("front-row", lens(SIR.at[0] + 0.3, ARENA.wall + 1.5, SIR.at[2] + 3.4, -0.08, -1, 4, 40));
view("wide", lens(0, 7, 6, 0, -1, -14, 62));
view("over-rail", lens(SIR.at[0] + 0.2, ARENA.wall + 1.7, SIR.at[2] - 1.2, 0.05, 1, -16, 50));
export const ARENA_SET: Film = { id: "arena-set", fps: 30, seconds: shots.length * 0.4, sky: "#9fd6ff", world: arenaWorld, shots, words: [], hook: { text: [""], a: -1, b: -0.5 } };

// ---------------- the three opening clips ----------------
type Lines = Record<string, { id: string; a: number; b: number }>;
const byId = (l: unknown) => Object.fromEntries((l as { id: string; a: number; b: number }[]).map((x) => [x.id, x])) as Lines;
const LEN = 5.6, P = (o: Partial<Pose>) => o, TAN = 0xd9b77a;
/** when the word `w` is said (the first time after `from`) */
const say = (W: Word[], w: string, from = 0) => (W.find((x) => x.a >= from - 0.01 && x.w.replace(/[^A-Za-z]/g, "").toLowerCase() === w.toLowerCase()) ?? W[0]).a;
/** a point beside a figure at `at` facing `heading`: `r` metres to his right, `f` forward, `up` high */
const by = (at: V3, heading: number, r: number, f: number, up: number): V3 => { const h = (heading * Math.PI) / 180; return [at[0] - Math.cos(h) * r + Math.sin(h) * f, at[1] + up, at[2] + Math.sin(h) * r + Math.cos(h) * f]; };
const TRI = once(() => noShade(trident(1.6))), STICK_O = once(() => noShade(refStick(1.35)));
const toLens = (cam: Cam, p: V3) => Math.atan2(cam.pos[0] - p[0], cam.pos[2] - p[2]);
/** sand kicked up round the fighters' feet, `k` (0..1) as strong */
const sandKick = (g: THREE.Group, T: number, cam: Cam, p: V3, k: number, seed = 0) => { if (k > 0.03) bank(g, p, T, toLens(cam, p), 2.0, 0.45, 6, 0.75, 0.8 * k, 0.35, seed, TAN); };
/** the crowd on the far side, behind the fighters seen from the front row (the sponsor's box keeps its front rows) */
const FAR: Fan[] = fans(LOOKS, Math.PI / 2 - 0.7, Math.PI / 2 + 0.7, [0, 1, 2, 3, 4, 5, 6, 7, 8], 5).filter((f) => !(Math.abs(f.at[0]) < 2.5 && f.at[1] < ARENA.wall + 1));
const MID: V3 = [(SIR.at[0] + WOMAN.at[0]) / 2, ARENA.wall, (SIR.at[2] + WOMAN.at[2]) / 2];
/** the lenses: low on the sand at the fight, at Sir in the front row, the two of them in the front row, down from the rail at the fight */
const LOWA = lens(FIGHT[0], 1.5, FIGHT[2] + 4.5, 0, -1, -12, 52);       // the fight above the question's three lines
const FRONT = lens(SIR.at[0] + 0.12, ARENA.wall + 1.55, SIR.at[2] + 2.5, -0.05, -1, 2, 38);
const TWO = lens(MID[0], ARENA.wall + 1.5, MID[2] + 3.0, 0, -1, 2, 42);
const OVER = lens(SIR.at[0] + 0.4, ARENA.wall + 1.75, SIR.at[2] + 0.62, 0.5, 0.87, -28, 36);     // from beside Sir at the rail, down at the fight

/** the heavy man and the net fighter squared up across the fight's mark, `gap` metres apart, each turned a little toward +z (the sand side) */
const pair = (gap = 2.1) => { const mur = mover(MURMILLO_D, 1.84, FIGHT[0] - gap / 2, FIGHT[2], 62), ret = mover(RETIARIUS_D, 1.86, FIGHT[0] + gap / 2, FIGHT[2], -62); return { mur, ret }; };
const GUARD = { ...usePose(GLADIUS, "ready", "R"), armL: SHIELD_ARM };
/** the heavy man with his sword and his shield; `acting` = his face plays in the shot, so the shield keeps below his chin */
const shieldMan = (g: THREE.Group, a: Staged, cam: Cam, use: string, blend?: [string, number], acting = false) => { wield(g, GLAD(), GLADIUS, use, a, "R", cam, blend ? { blend } : {}); shieldOn(g, SCUTUM(), a, "L", cam, { acting }); };

/** Sir Digsworth and the woman beside him in the front row: "Two go in, one comes out. Right?" Two fingers up on "Two", one on "one",
 *  and on "Right?" he turns to her; she shakes her head. `net` = the net still hangs over his head */
const twoShot = (id: string, a0: number, b0: number, W: Word[], net = false): Shot => {
  // the hand counts up in front of his shoulder, inside the picture
  const sir = mover(SIR_D, 1.8, SIR.at[0], SIR.at[2], SIR.heading - 8), wom = mover(ROMAN_WOMAN2_D, 1.62, WOMAN.at[0], WOMAN.at[2], WOMAN.heading - 12); sir.stand(9); wom.stand(9);
  const t2 = say(W, "Two") - a0, t1 = say(W, "one") - a0, tr = say(W, "Right") - a0, UP = { armR: arm(102, 10, 162, 2), armL: arm(14, 12, 30, 8) };
  sir.actAt(-1, { armL: arm(14, 12, 30, 8), armR: arm(14, 12, 30, 8), head: [0, -2, 0] }, 10, { in: 0.01, handL: "relaxed", handR: "relaxed", face: { brow: 0.6, lid: 0.1, smile: 0.3 } });
  sir.actAt(t2 - 0.3, UP, t1 - t2 + 0.25, { in: 0.22, out: 0.01, handR: "two", face: { brow: 0.9, lid: 0, smile: 0.5 } });
  sir.actAt(t1 - 0.05, UP, 9, { in: 0.01, handR: "point", face: { brow: 0.9, lid: 0, smile: 0.5 } });
  sir.actAt(tr - 0.25, { head: [34, -2, 0] }, 9, { in: 0.25, antic: 0, over: 1.1, face: { brow: 1, lid: 0, smile: 0.7, wide: 0.3 } });
  wom.actAt(-1, { armL: arm(22, -6, 64, -46), armR: arm(22, -6, 64, -46), head: [-26, 0, 0] }, 10, { in: 0.01, handL: "relaxed", handR: "relaxed", face: { lid: 0.45, brow: -0.2, smile: -0.1 } });
  wag(wom, Math.max(0, tr - 0.35), 1.4, P({ head: [-40, 4, 0] }), P({ head: [-12, 4, 0] }), 0.3, { face: { lid: 0.5, brow: 0.3, smile: -0.3 } });
  return { id, a: a0, b: b0, still: (b0 - a0) * 0.6, sounds: [], cam: (_t, u) => TWO.push(0.08 * u), sun: { target: MID, reach: 7 },
    cast: (t, T) => [on("sir", SIR_D, sir, t, ARENA.wall, { talk: talk(W, T, ["guess"]) }), on("wom", ROMAN_WOMAN2_D, wom, t, ARENA.wall)],
    things: (g, c, _t, T, cam) => { crowd(g, STANDS, T, cam, 0.55); if (net) draped(g, c.sir.joint("crown"), cam, 0.16); } };
};
/** the net spread `drop` metres over a head (its middle a hand above the crown) */
const draped = (g: THREE.Group, crown: V3, cam: Cam, drop: number, tilt = 0, hang = 0.3) => { const n = netOpen(1.5, drop, 7, hang); n.position.set(crown[0], crown[1] + 0.06, crown[2]); n.rotation.set(tilt, toLens(cam, crown), 0); g.add(n); };

// a: the fight already happening -------------------------------------------------------------------------------------------------
const A = (() => {
  const W = wa as Word[], L = byId(la), b1 = 1.5, b2 = (L.hook.b + L.guess.a) / 2, shots: Shot[] = [];
  // the trident already on the shield in the first frame, sand flying; the heavy man drives his sword past it, the net man swings back
  const { mur, ret } = pair(1.9), TH = 0.55; mur.stand(9); ret.stand(9);
  const stand = (at: V3, heading: number, D: Design, h: number): Stand => ({ D, at, heading, h, cam: LOWA.cam });
  const aim: V3 = by([FIGHT[0] - 0.95, 0, FIGHT[2]], 62, -0.05, 0.42, 1.0);
  mur.actAt(-1, { ...GUARD, lean: 10, py: -0.03 }, 10, { in: 0.01, handL: "grip", handR: "grip", face: { brow: -1, lid: 0.15, mouth: 0.3 } });
  mur.actAt(TH, { ...usePose(GLADIUS, "thrust", "R"), armL: SHIELD_ARM, lean: 16, twist: 10 }, 0.55, { in: 0.12, out: 0.3, antic: 0.15, face: { brow: -1, lid: 0, mouth: 0.7 } });
  ret.actAt(-1, { ...polePose(stand([FIGHT[0] + 0.95, 0, FIGHT[2]], -62, RETIARIUS_D, 1.86), "R", by([FIGHT[0] + 0.95, 0, FIGHT[2]], -62, 0.12, 0.2, 1.0), aim, 0.45), lean: 12 }, 10, { in: 0.01, handL: "grip", handR: "grip", face: { brow: -0.9, lid: 0.1, mouth: 0.5 } });
  ret.actAt(TH + 0.05, { lean: -6, twist: -4, py: 0.02 }, 0.7, { in: 0.14, out: 0.3, face: { brow: 1, lid: 0, wide: 0.8, mouth: 0.6 } });
  shots.push({ id: "hook", a: 0, b: b1, still: 0.25,
    sounds: [{ t: 0.0, k: "thud", g: 1.0 }, { t: 0.02, k: "ting", g: 0.7 }, { t: TH + 0.05, k: "whoosh", g: 0.8 }, { t: TH + 0.1, k: "scuff", g: 0.6 }, { t: 1.1, k: "step", g: 0.6 }],
    cam: (_t, u) => LOWA.push(0.18 * u), sun: { target: FIGHT, reach: 10 },
    cast: (t) => [on("mur", MURMILLO_D, mur, t), on("ret", RETIARIUS_D, ret, t)],
    things: (g, c, t, T, cam) => { crowd(g, STANDS, T, cam, 0.95); const k = smooth((t - TH) / 0.12) * (1 - smooth((t - TH - 0.45) / 0.3)); shieldMan(g, c.mur, cam, "ready", ["thrust", k]);
      pole(g, TRI(), c.ret, cam, "R", palm(c.ret, "L"), { len: 1.9, name: "trident", use: "thrust" }); sandKick(g, T, cam, [FIGHT[0], 0, FIGHT[2] + 0.2], 1 - smooth(t / 0.9), 1); } });
  // FIGHT TO THE DEATH? Sir Digsworth in the front row, peeking between his fingers, the crowd on its feet round him
  const sir = mover(SIR_D, 1.8, SIR.at[0], SIR.at[2], SIR.heading - 6); sir.stand(9);
  const ss: Stand = { D: SIR_D, at: SIR.at, heading: SIR.heading - 6, h: 1.8, cam: FRONT.cam };
  sir.actAt(-1, { ...reach(ss, "L", by(SIR.at, SIR.heading - 6, -0.07, 0.17, 1.56)), ...reach(ss, "R", by(SIR.at, SIR.heading - 6, 0.07, 0.17, 1.56)), head: [0, 4, 0] }, 10, { in: 0.01, handL: "open", handR: "open", face: { brow: 1, lid: 0, wide: 1, mouth: 0.4 } });
  wag(sir, 0, 2, P({ lean: 2, roll: 1.5 }), P({ lean: -1, roll: -1.5 }), 0.11);
  shots.push({ id: "peek", a: b1, b: b2, still: 0.7, sounds: [{ t: 0.05, k: "thud", g: 0.5, p: 0.4 }],
    cam: (_t, u) => FRONT.push(0.1 * u), sun: { target: SIR.at, reach: 6 },
    cast: (t, T) => [on("sir", SIR_D, sir, t, ARENA.wall, { talk: talk(W, T, ["hook"]) })],
    things: (g, _c, _t, T, cam) => crowd(g, STANDS, T, cam, 0.9) });
  shots.push(twoShot("guess", b2, LEN, W));
  return { W, shots, text: ["DID GLADIATORS", "FIGHT TO", "THE DEATH?"], hookB: b2 };
})();

// b: a statement over the action ---------------------------------------------------------------------------------------------------
const B = (() => {
  const W = wb as Word[], L = byId(lb), b1 = 1.4, b2 = (L.hook.b + L.guess.a) / 2, shots: Shot[] = [];
  // the net man down on one knee with one finger raised (he gives up), the heavy man's sword up over him: "Most gladiators walked out alive."
  const LOWB = lens(FIGHT[0], 1.25, FIGHT[2] + 4.9, 0, -1, -5, 54), { mur, ret } = pair(1.45); mur.stand(9); ret.stand(9);
  mur.actAt(-1, { ...usePose(GLADIUS, "raised", "R"), armL: SHIELD_ARM, lean: 6, head: [0, 8, 0] }, 10, { in: 0.01, handL: "grip", handR: "grip", face: { brow: -1, lid: 0.1, mouth: 0.5 } });
  ret.actAt(-1, { py: -0.5, lean: -8, armL: arm(150, 26, 178, 14), armR: arm(30, 30, 70, 20), head: [0, -10, 0] }, 10, { in: 0.01, handL: "point", handR: "open", face: { brow: 1, lid: 0, wide: 0.9, mouth: 0.3, smile: -0.6 } });
  wag(ret, 0, 2, P({ armL: arm(150, 26, 178, 14) }), P({ armL: arm(147, 24, 175, 12) }), 0.09, { handL: "point", handR: "open", face: { brow: 1, lid: 0, wide: 0.9, mouth: 0.3, smile: -0.6 } });
  const ground: V3 = [FIGHT[0] + 1.1, 0.03, FIGHT[2] + 0.5];
  shots.push({ id: "hook", a: 0, b: b1, still: 0.4, sounds: [{ t: 0.0, k: "shing", g: 0.9 }, { t: 0.0, k: "thud", g: 0.7 }],
    cam: (_t, u) => LOWB.push(0.15 * u), sun: { target: FIGHT, reach: 10 },
    cast: (t) => [on("mur", MURMILLO_D, mur, t), on("ret", RETIARIUS_D, ret, t)],
    things: (g, c, t, T, cam) => { crowd(g, STANDS, T, cam, 1); shieldMan(g, c.mur, cam, "raised"); setDown(g, TRI(), "trident", ground, cam, -4); sandKick(g, T, cam, [FIGHT[0] + 0.5, 0, FIGHT[2] + 0.2], 0.6 - t * 0.4, 2); } });
  // the referee strides in with his stick across and the sword comes down
  const WIDE2 = lens(FIGHT[0], 1.35, FIGHT[2] + 5.4, 0, -1, -6, 54), m2 = pair(1.45), RAT: V3 = [FIGHT[0] + 0.05, 0, FIGHT[2] + 0.25], ref = mover(REFEREE_D, 1.74, RAT[0], RAT[2], 20); m2.mur.stand(9); m2.ret.stand(9); ref.walk(mt(ref, 0.3), { step: 0.5, tau: 0.3 }).stand(9);
  m2.mur.actAt(-1, { ...usePose(GLADIUS, "raised", "R"), armL: SHIELD_ARM, lean: 6 }, 10, { in: 0.01, handL: "grip", handR: "grip", face: { brow: -1, lid: 0.1, mouth: 0.4 } });
  m2.mur.actAt(0.35, { ...usePose(GLADIUS, "lowered", "R"), armL: SHIELD_ARM, lean: -2, head: [-20, 0, 0] }, 9, { in: 0.4, antic: 0, over: 1.1, face: { brow: 0.6, lid: 0.2, mouth: 0.2 } });
  m2.ret.actAt(-1, { py: -0.5, lean: -8, armL: arm(150, 26, 178, 14), armR: arm(30, 30, 70, 20), head: [0, -10, 0] }, 10, { in: 0.01, handL: "point", handR: "open", face: { brow: 1, lid: 0, wide: 0.9, mouth: 0.3, smile: -0.6 } });
  const rs: Stand = { D: REFEREE_D, at: RAT, heading: 20, h: 1.74, cam: WIDE2.cam };
  ref.actAt(-1, polePose(rs, "L", by(rs.at, 20, -0.24, 0.3, 1.12), by(rs.at, 20, 3, 0.3, 1.12), 0.48), 10, { in: 0.01, handL: "grip", handR: "grip", face: { brow: -0.6, lid: 0.1, mouth: 0.5 } });
  shots.push({ id: "referee", a: b1, b: b2, still: 0.8, sounds: [{ t: 0.1, k: "step", g: 0.7 }, { t: 0.4, k: "step", g: 0.7 }, { t: 0.45, k: "tap", g: 0.8 }],
    cam: (_t, u) => WIDE2.push(0.12 * u), sun: { target: FIGHT, reach: 10 },
    cast: (t) => [on("mur", MURMILLO_D, m2.mur, t), on("ret", RETIARIUS_D, m2.ret, t), on("ref", REFEREE_D, ref, t)],
    things: (g, c, t, T, cam) => { crowd(g, STANDS, T, cam, 0.8); shieldMan(g, c.mur, cam, "raised", ["lowered", smooth((t - 0.35) / 0.4)], true); setDown(g, TRI(), "trident", ground, cam, -4);
      pole(g, STICK_O(), c.ref, cam, "L", by(c.ref.at, c.ref.heading, 3, 0.3, 1.12), { back: 0.36, len: 1.35, name: "stick" }); } });
  shots.push(twoShot("guess", b2, LEN, W));
  return { W, shots, text: ["MOST GLADIATORS", "WALKED OUT ALIVE."], hookB: b2 };
})();

// c: Sir Digsworth in trouble ------------------------------------------------------------------------------------------------------
const C = (() => {
  const W = wc as Word[], L = byId(lc), b1 = 1.5, b2 = (L.hook.b + L.guess.a) / 2, shots: Shot[] = [];
  // the net already in the air at him in the first frame; it lands over his head and he fights it
  const NET_LENS = lens(SIR.at[0] + 0.15, ARENA.wall + 1.6, SIR.at[2] + 3.0, -0.05, -1, 5, 44), LAND = 0.32;
  const sir = mover(SIR_D, 1.8, SIR.at[0], SIR.at[2], SIR.heading - 6); sir.stand(9);
  sir.actAt(-1, { armL: arm(40, 20, 120, 10), armR: arm(40, 20, 120, 10), head: [0, -12, 0], lean: -6 }, 10, { in: 0.01, handL: "open", handR: "open", face: { brow: 1, lid: 0, wide: 1, mouth: 0.8 } });
  sir.actAt(LAND, { armL: arm(150, 30, 190, 20), armR: arm(150, 30, 190, 20), head: [0, 6, 0], lean: 4 }, 9, { in: 0.15, face: { brow: 1, lid: 0.2, mouth: 0.7, smile: -0.4 } });
  wag(sir, LAND + 0.15, 2, P({ armL: arm(160, 34, 200, 26), armR: arm(140, 24, 180, 14), roll: 3 }), P({ armL: arm(140, 24, 180, 14), armR: arm(160, 34, 200, 26), roll: -3 }), 0.17);
  shots.push({ id: "hook", a: 0, b: b1, still: 0.9, sounds: [{ t: 0.0, k: "whoosh", g: 1.0 }, { t: LAND, k: "flap", g: 1.0 }, { t: LAND + 0.02, k: "rope", g: 0.7 }],
    cam: (_t, u) => NET_LENS.push(0.1 * u), sun: { target: SIR.at, reach: 6 },
    cast: (t, T) => [on("sir", SIR_D, sir, t, ARENA.wall, { talk: talk(W, T, ["hook"]) })],
    things: (g, c, t, T, cam) => { crowd(g, STANDS, T, cam, 0.7); const cr = c.sir.joint("crown"), k = smooth(t / LAND);
      if (t < LAND) { const p0 = by(SIR.at, SIR.heading, 0.2, 1.45, 2.15), q: V3 = [p0[0] + (cr[0] - p0[0]) * k, p0[1] + (cr[1] + 0.06 - p0[1]) * k, p0[2] + (cr[2] - p0[2]) * k]; draped(g, [q[0], q[1] - 0.06, q[2]], cam, 0.1 + 0.25 * k, 0.55 * (1 - k), 0); }
      else draped(g, cr, cam, 0.9); } });
  // down on the sand the net man looks up at the stands, empty-handed, and shrugs; the heavy man beside him stares
  const m = pair(1.6); m.mur.stand(9); m.ret.stand(9);
  const up = (x: number, z: number) => facingTo(x, z, SIR.at[0], SIR.at[2]);
  const ret = mover(RETIARIUS_D, 1.86, FIGHT[0] + 0.7, FIGHT[2] + 0.3, up(FIGHT[0] + 0.7, FIGHT[2] + 0.3)), mur = mover(MURMILLO_D, 1.84, FIGHT[0] - 0.75, FIGHT[2] + 0.1, up(FIGHT[0] - 0.75, FIGHT[2] + 0.1) + 40); ret.stand(9); mur.stand(9);
  ret.actAt(-1, { ...usePose(TRIDENT, "ready", "L"), armR: arm(40, 50, 70, 60), head: [0, -16, 0] }, 10, { in: 0.01, handL: "grip", handR: "open", face: { brow: 0.8, lid: 0, smile: 0.5, mouth: 0.2 } });
  ret.actAt(0.35, { armR: arm(36, 70, 40, 90), head: [8, -16, 10], py: 0.02 }, 9, { in: 0.2, antic: 0, over: 1.2, face: { brow: 1, lid: 0, smile: 0.7, mouth: 0.3 } });
  mur.actAt(-1, { ...usePose(GLADIUS, "ready", "R"), armL: SHIELD_ARM, head: [-36, 0, 0] }, 10, { in: 0.01, handL: "grip", handR: "grip", face: { brow: -0.8, lid: 0.45, smile: -0.2 } });
  shots.push({ id: "shrug", a: b1, b: b2, still: 0.7, sounds: [{ t: 0.35, k: "scuff", g: 0.5 }],
    cam: (_t, u) => OVER.push(0.08 * u), sun: { target: FIGHT, reach: 9 },
    cast: (t) => [on("mur", MURMILLO_D, mur, t), on("ret", RETIARIUS_D, ret, t)],
    things: (g, c, _t, T, cam) => { crowd(g, FAR, T, cam, 0.6); shieldMan(g, c.mur, cam, "ready", undefined, true); wield(g, TRI(), TRIDENT, "ready", c.ret, "L", cam, { at: 0.75 }); } });
  shots.push(twoShot("guess", b2, LEN, W, true));
  return { W, shots, text: ["DID GLADIATORS", "FIGHT TO", "THE DEATH?"], hookB: b2 };
})();

const clip = (id: string, s: { W: Word[]; shots: Shot[]; text: string[]; hookB: number }, audio: string): Film => ({
  id, fps: 30, seconds: LEN, sky: "#9fd6ff", world: arenaWorld, shots: s.shots, words: s.W,
  hook: { text: s.text, a: 0, b: s.hookB, size: 80 }, beds: [{ k: "crowd", a: 0, b: LEN, g: 0.9 }, { k: "wind", a: 0, b: LEN, g: 0.25 }], audio,
});
export const GLAD_HOOK_A = clip("gladiators-hook-a", A, "craft/gladiators-hook-a.wav");
export const GLAD_HOOK_B = clip("gladiators-hook-b", B, "craft/gladiators-hook-b.wav");
export const GLAD_HOOK_C = clip("gladiators-hook-c", C, "craft/gladiators-hook-c.wav");

