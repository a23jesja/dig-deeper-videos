// The hook lab again for "Did gladiators really fight to the death?", from Jesper's review of v3 (granskning/v4-lista-18-nov.md, point 1):
// "börja mitt i en attack. Treudden stöts och svärdet möter skölden, kameran nära, figurerna fyller 50–80 % av höjden, ingen tom sand i
// nedre halvan". All three clips open on the same attack, close and low: on frame 0 the net man's trident is driven into the heavy man's
// shield; the heavy man shoves it aside and drives his sword in, and the sword meets the net man's shoulder guard (the galerus, the only
// shield a net fighter carried). The lens stands low and looks up a little, so that the lower half of the picture is their legs and the
// sand they kick up, not empty sand. Then:
//   a. the question over the attack; Sir Digsworth peeking between his fingers; his guess with the woman
//   b. "Most gladiators walked out alive." over the attack; the referee strides in with his stick and the sword comes down; the guess
//   c. the question over the attack; the net, thrown wide, lands over Sir Digsworth in the front row; the guess with the net on his head
import * as THREE from "three";
import { Film, Shot, V3, Word, Cam, Staged, talk, smooth } from "../stage/film";
import { mover, arm, wag, mt } from "../stage/acting";
import { lens, palm, stageAt, noShade } from "../stage/staging";
import { scutum } from "../world/props";
import { GLADIUS, SHIELD_ARM, STICK, AUDIT, usePose, pole, polePose, reach, shieldOn, wield, setDown, Stand } from "../stage/grips";
import { arenaWorld, crowd, ARENA } from "../world/arena";
import { SIR_D, MURMILLO_GRILLE_D, RETIARIUS_D, REFEREE_D } from "../looks";
import type { Pose } from "../rig";
import { on, SIR, STANDS, FIGHT, TRI, SCUTUM, STICK_O, say, by, sandKick, FRONT, pair, GUARD, shieldMan, twoShot, draped } from "./gladiatorsHooks";
import wa from "../../../voice/gladiators-hook4-a/words.json";
import la from "../../../voice/gladiators-hook4-a/lines.json";
import wb from "../../../voice/gladiators-hook4-b/words.json";
import lb from "../../../voice/gladiators-hook4-b/lines.json";
import wc from "../../../voice/gladiators-hook4-c/words.json";
import lc from "../../../voice/gladiators-hook4-c/lines.json";

type Lines = Record<string, { id: string; a: number; b: number }>;
const byId = (l: unknown) => Object.fromEntries((l as { id: string; a: number; b: number }[]).map((x) => [x.id, x])) as Lines;
const P = (o: Partial<Pose>) => o, LEN = 5.6;

// ---------------- the attack ----------------
/** how far apart the two stand (their middles): close enough that both fit the upright picture at more than half its height */
export const GAP = 1.15;
/** the low lens: 3.75 m from the fight, 0.75 m up, looking up 12 degrees; the frame runs from just below their feet to above the wall,
 *  and is just wide enough for the two of them and the raised sword */
export const CLOSE = lens(FIGHT[0] - 0.02, 0.75, FIGHT[2] + 3.75, 0, -1, 12, 48);
/** the crowd for the attack, without the few spectators whose faces the raised blade stands in front of from frame 0 until the chop
 *  (the screen box x0, x1, y0, y1 measured through the attack, 24 px to spare); the rest of the stands stays full */
const without = (fans: typeof STANDS, cam: Cam, boxes: number[][], m = 24) => { const pc = new THREE.PerspectiveCamera(cam.fov, 1080 / 1920, 0.05, 500); pc.position.set(...cam.pos); pc.lookAt(...cam.look); pc.updateMatrixWorld(true); pc.updateProjectionMatrix();
  return fans.filter((f) => { const v = new THREE.Vector3(f.at[0], f.at[1] + 0.88 * f.h, f.at[2]).project(pc), x = (v.x + 1) * 540, y = (1 - v.y) * 960; return !boxes.some(([x0, x1, y0, y1]) => x > x0 - m && x < x1 + m && y > y0 - m && y < y1 + m); }); };
const ATTACK_STANDS = without(STANDS, CLOSE.cam, [[-40, 190, 360, 800]]);
/** the trident's whole length from its butt to the tips of its prongs (props.ts trident(1.6): a 1.6 m shaft and 0.27 m prongs) */
const TRI_LEN = 1.87;
const right = (cam: Cam) => { const fx = cam.look[0] - cam.pos[0], fz = cam.look[2] - cam.pos[2], n = Math.hypot(fx, fz) || 1; return [-fz / n, fx / n]; };
/** the distance from p to q in the picture's plane (metres): what a thing laid by `span` covers between them */
const across = (cam: Cam, p: V3, q: V3) => { const [rx, rz] = right(cam); return Math.hypot((q[0] - p[0]) * rx + (q[2] - p[2]) * rz, q[1] - p[1]); };
const lerp3 = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

/** the attack, `b0 - a0` long from its own time 0. Frame 0: the net man's jab, the prongs reaching the near rim of the heavy man's
 *  shield on frame 2 (where they show, not behind it), his sword already up. He chops it down across the front of his
 *  shield onto the trident (the blade meets the shield's rim at CHOP), pinning the prongs there; the net man yanks the
 *  trident straight back and jabs again at 1.3 s */
export const attack = (id: string, a0: number, b0: number, extra: Shot["sounds"] = []): Shot => {
  const { mur, ret } = pair(GAP); mur.stand(9); ret.stand(9);
  const MA: V3 = [FIGHT[0] - GAP / 2, 0, FIGHT[2]], RA: V3 = [FIGHT[0] + GAP / 2, 0, FIGHT[2]];
  const rs: Stand = { D: RETIARIUS_D, at: RA, heading: -62, h: 1.86, cam: CLOSE.cam };
  const RIM0: V3 = by(MA, 62, -0.05, 0.55, 1.3);
  /** the chop: the arm swings from raised (from frame 0) to lowered (from DOWN_AT s), each act chained on the last so that the swing is one
   *  movement; CHOP = when the falling hand passes the rim's height and the blade, then level, meets the rim and the prongs on it */
  const DOWN_AT = 0.26, CHOP = 0.42, H_UP = 1.77, H_LOW = 0.76;
  // The net man's arms keep one grip all through: the rear hand (his near one, the left) back at his hip, the front hand 0.55 m up the
  // shaft. The jab, the flinch and the yank are his body moving (lean, and the pelvis forward and back), and the trident is rigid in his
  // hands. (Moving the hands instead made his far arm swing out between grips, in front of the prongs.)
  const HIT = 0.07, HIT2 = 1.3, GRIP0: V3 = by(RA, -62, -0.12, -0.12, 0.98);
  ret.actAt(-1, { ...polePose(rs, "L", GRIP0, RIM0, 0.55), lean: 6, pz: -0.1, twist: -6 }, 10, { in: 0.01, handL: "grip", handR: "grip", face: { brow: -1, lid: 0.05, mouth: 0.7 } });
  ret.actAt(-0.01, { lean: 16, pz: 0 }, 10, { in: HIT + 0.01, antic: 0 });
  // he flinches back from the falling sword, then yanks the trident back and jabs again
  ret.actAt(0.2, { lean: 8, pz: -0.03, head: [0, -8, 0] }, 10, { in: 0.16, antic: 0, face: { brow: 1, lid: 0, wide: 0.9, mouth: 0.5 } });
  ret.actAt(CHOP + 0.12, { lean: 7, pz: -0.09, head: [0, 2, 0] }, 10, { in: 0.25, antic: 0, face: { brow: -1, lid: 0, mouth: 0.6 } });
  ret.actAt(HIT2 - 0.16, { lean: 16, pz: 0, head: [0, 0, 0] }, 10, { in: 0.17, antic: 0, face: { brow: -1, lid: 0.05, mouth: 0.7 } });
  mur.actAt(-1, { ...usePose(GLADIUS, "raised", "R"), armL: SHIELD_ARM, lean: 5, twist: -4 }, 10, { in: 0.01, handL: "grip", handR: "grip", face: { brow: -1, lid: 0.05, mouth: 0.6 } });
  mur.actAt(DOWN_AT, { ...usePose(GLADIUS, "lowered", "R"), armL: SHIELD_ARM, lean: 18, twist: 10 }, 10, { in: 0.42, antic: 0, face: { brow: -1, lid: 0, mouth: 0.8 } });
  mur.actAt(1.0, { ...GUARD, lean: 8, py: -0.03 }, 10, { in: 0.4, antic: 0, face: { brow: -1, lid: 0.15, mouth: 0.4 } });
  /** which use the sword is in, and how far toward the next: in the chop, as far as his hand has fallen, and the blade a little ahead
   *  of the arm, so that when the arm is level the blade already points down at the rim, not at the net man's face */
  const sword = (t: number, hy: number): [string, [string, number] | undefined] => t < DOWN_AT ? ["raised", undefined] : t < 1.0 ? ["raised", ["lowered", Math.pow(Math.min(1, Math.max(0, (H_UP - hy) / (H_UP - H_LOW))), 0.35)]] : ["lowered", ["ready", smooth((t - 1.0) / 0.14)]];
  /** how far behind the rear hand the trident's butt is, so that at the jab (HIT) its prongs are on the shield's near rim: found once,
   *  by staging both at that moment */
  let B: number | undefined;
  const reach = () => { if (B !== undefined) return B; const cam = CLOSE.push(0.03 + 0.12 * (HIT / (b0 - a0))), r = stageAt(on("ret", RETIARIUS_D, ret, HIT), cam), m = stageAt(on("mur", MURMILLO_GRILLE_D, mur, HIT), cam);
    // a shield of its own for the measuring, so that the one in the picture is never taken out of the frame being drawn, placed with
    // the grip check paused (it is not a thing in anyone's hand in any frame)
    const was = AUDIT.on; AUDIT.on = false; const sh = noShade(scutum()); shieldOn(new THREE.Group(), sh, m, "L", cam); AUDIT.on = was; sh.updateWorldMatrix(true, true); const bx = new THREE.Box3().setFromObject(sh);
    return (B = TRI_LEN - across(cam, palm(r, "L"), [bx.max.x + 0.03, 1.32, (bx.min.z + bx.max.z) / 2 + 0.06])); };
  return { id, a: a0, b: b0, still: CHOP,
    sounds: [{ t: 0.0, k: "whoosh", g: 0.8 }, { t: HIT - 0.01, k: "ting", g: 1.0 }, { t: HIT - 0.01, k: "thud", g: 0.9 }, { t: 0.16, k: "whoosh", g: 0.5 }, { t: HIT2 - 0.01, k: "ting", g: 0.9 }, { t: HIT2 - 0.01, k: "thud", g: 0.7 }, { t: CHOP, k: "ting", g: 1.0, p: -0.1 }, { t: CHOP + 0.2, k: "scuff", g: 0.6 }, { t: 1.1, k: "step", g: 0.5 }, ...extra],
    cam: (_t, u) => CLOSE.push(0.03 + 0.12 * u), sun: { target: FIGHT, reach: 6 },
    cast: (t) => [on("mur", MURMILLO_GRILLE_D, mur, t), on("ret", RETIARIUS_D, ret, t)],
    things: (g, c, t, T, cam) => { crowd(g, ATTACK_STANDS, T, cam, 0.95); const [use, blend] = sword(t, c.mur.joint("wrR")[1]); shieldMan(g, c.mur, cam, use, blend);
      // the trident lies along the line through both palms (the front hand always on it), rigid: it reaches as far as it does at the jab
      const pr = palm(c.ret, "L"), pf = palm(c.ret, "R"), d = across(cam, pr, pf) || 1, far: V3 = [pr[0] + (pf[0] - pr[0]) * 3 / d, pr[1] + (pf[1] - pr[1]) * 3 / d, pr[2] + (pf[2] - pr[2]) * 3 / d];
      pole(g, TRI(), c.ret, cam, "L", far, { len: 1.9, name: "trident", use: "thrust", back: reach() });
      sandKick(g, T, cam, [FIGHT[0], 0, FIGHT[2] + 0.25], t < CHOP + 0.2 ? 0.55 : 1 - smooth((t - CHOP - 0.2) / 0.8) * 0.7, 1); } };
};

// ---------------- what follows ----------------
/** a: Sir Digsworth in the front row peeking between his fingers, the crowd on its feet round him (as in the film) */
const peek = (id: string, a0: number, b0: number, W: Word[]): Shot => {
  const sir = mover(SIR_D, 1.8, SIR.at[0], SIR.at[2], SIR.heading - 6); sir.stand(9);
  const ss: Stand = { D: SIR_D, at: SIR.at, heading: SIR.heading - 6, h: 1.8, cam: FRONT.cam };
  sir.actAt(-1, { ...reach(ss, "L", by(SIR.at, SIR.heading - 6, -0.07, 0.17, 1.56)), ...reach(ss, "R", by(SIR.at, SIR.heading - 6, 0.07, 0.17, 1.56)), head: [0, 4, 0] }, 10, { in: 0.01, handL: "open", handR: "open", face: { brow: 1, lid: 0, wide: 1, mouth: 0.4 } });
  wag(sir, 0, 2, P({ lean: 2, roll: 1.5 }), P({ lean: -1, roll: -1.5 }), 0.11);
  return { id, a: a0, b: b0, still: 0.7, sounds: [{ t: 0.05, k: "thud", g: 0.5, p: 0.4 }],
    cam: (_t, u) => FRONT.push(0.1 * u), sun: { target: SIR.at, reach: 6 },
    cast: (t, T) => [on("sir", SIR_D, sir, t, ARENA.wall, { talk: talk(W, T, ["hook"]) })],
    things: (g, _c, _t, T, cam) => crowd(g, STANDS, T, cam, 0.9) };
};
/** the referee steps in between them (Jesper's review of v3, point 4: "domaren står mellan gladiatorerna med luft till båda, staven ska
 *  inte gå över någons kropp"): the heavy man on the left with his sword up, the net man on the right, the referee in the middle with
 *  about 30 cm clear of each. His stick stands upright in his left hand (its approved "ready" grip), crossing nobody; his right hand
 *  is held out open toward the heavy man, whose sword comes down from his guard. Low and as close as three abreast allow, so that the lower half of
 *  the picture is their legs and the wall, not empty sand. `trident` = the net man's trident lies on the sand beside him */
export const REF_LENS = lens(FIGHT[0], 0.8, FIGHT[2] + 4.4, 0, -1, 11, 50);
export const refereeClose = (id: string, a0: number, b0: number, trident = false): Shot => {
  const MA: V3 = [FIGHT[0] - 0.82, 0, FIGHT[2]], RA: V3 = [FIGHT[0] + 0.86, 0, FIGHT[2]], RAT: V3 = [FIGHT[0] - 0.06, 0, FIGHT[2] + 0.22];
  const mur = mover(MURMILLO_GRILLE_D, 1.84, MA[0], MA[2], 62), ret = mover(RETIARIUS_D, 1.86, RA[0], RA[2], -62), ref = mover(REFEREE_D, 1.74, RAT[0], RAT[2] - 0.16, 4); mur.stand(9); ret.stand(9); ref.walk(mt(ref, 0.16), { step: 0.4, tau: 0.25 }).stand(9);
  mur.actAt(-1, { ...GUARD, lean: 8 }, 10, { in: 0.01, handL: "grip", handR: "grip", face: { brow: -1, lid: 0.1, mouth: 0.4 } });
  mur.actAt(0.6, { ...usePose(GLADIUS, "lowered", "R"), armL: SHIELD_ARM, lean: -2, head: [-20, 0, 0] }, 9, { in: 0.4, antic: 0, over: 1.1, face: { brow: 0.6, lid: 0.2, mouth: 0.2 } });
  ret.actAt(-1, { lean: -4, armL: arm(30, 30, 70, 20), armR: arm(30, 30, 70, 20), head: [0, -4, 0] }, 10, { in: 0.01, handL: "open", handR: "open", face: { brow: 0.9, lid: 0, wide: 0.6, mouth: 0.3 } });
  const rs: Stand = { D: REFEREE_D, at: RAT, heading: 4, h: 1.74, cam: REF_LENS.cam };
  ref.actAt(-1, { ...usePose(STICK, "ready", "L"), armR: arm(20, 20, 50, 16), head: [-22, 0, 0] }, 10, { in: 0.01, handL: "grip", handR: "relaxed", face: { brow: -0.9, lid: 0, mouth: 0.6, smile: -0.8 } });
  ref.actAt(0.3, { ...usePose(STICK, "ready", "L"), ...reach(rs, "R", by(RAT, 4, 0.55, 0.28, 1.28)), head: [-24, 2, 0] }, 9, { in: 0.25, antic: 0, over: 1.1, handL: "grip", handR: "open", face: { brow: -1, lid: 0, mouth: 0.7, smile: -0.8 } });
  const ground: V3 = [RA[0] + 0.35, 0.03, RA[2] + 0.45];
  return { id, a: a0, b: b0, still: 1.0, sounds: [{ t: 0.1, k: "step", g: 0.7 }, { t: 0.4, k: "step", g: 0.7 }, { t: 0.45, k: "tap", g: 0.8 }],
    cam: (_t, u) => REF_LENS.push(0.12 * u), sun: { target: FIGHT, reach: 7 },
    cast: (t) => [on("mur", MURMILLO_GRILLE_D, mur, t), on("ret", RETIARIUS_D, ret, t), on("ref", REFEREE_D, ref, t)],
    // (his sword at guard comes down as the referee steps in: from chest height, so that it never passes before his visor)
    things: (g, c, t, T, cam) => { crowd(g, STANDS, T, cam, 0.8); shieldMan(g, c.mur, cam, "ready", ["lowered", smooth((t - 0.6) / 0.4)], true);
      wield(g, STICK_O(), STICK, "ready", c.ref, "L", cam); if (trident) setDown(g, TRI(), "trident", ground, cam, -4); } };
};
/** c: the net, thrown wide, comes over the wall and lands over Sir Digsworth's head; he fights it (as in the first hook lab's clip c) */
const netOnSir = (id: string, a0: number, b0: number, W: Word[]): Shot => {
  const NET_LENS = lens(SIR.at[0] + 0.15, ARENA.wall + 1.6, SIR.at[2] + 3.0, -0.05, -1, -3, 44), LAND = 0.32;
  const sir = mover(SIR_D, 1.8, SIR.at[0], SIR.at[2], SIR.heading - 6); sir.stand(9);
  sir.actAt(-1, { armL: arm(40, 20, 120, 10), armR: arm(40, 20, 120, 10), head: [0, -12, 0], lean: -6 }, 10, { in: 0.01, handL: "open", handR: "open", face: { brow: 1, lid: 0, wide: 1, mouth: 0.8 } });
  sir.actAt(LAND, { armL: arm(150, 30, 190, 20), armR: arm(150, 30, 190, 20), head: [0, 6, 0], lean: 4 }, 9, { in: 0.15, face: { brow: 1, lid: 0.2, mouth: 0.7, smile: -0.4 } });
  wag(sir, LAND + 0.15, 2, P({ armL: arm(160, 34, 200, 26), armR: arm(140, 24, 180, 14), roll: 3 }), P({ armL: arm(140, 24, 180, 14), armR: arm(160, 34, 200, 26), roll: -3 }), 0.17);
  return { id, a: a0, b: b0, still: 0.9, sounds: [{ t: 0.0, k: "whoosh", g: 1.0 }, { t: LAND, k: "flap", g: 1.0 }, { t: LAND + 0.02, k: "rope", g: 0.7 }],
    cam: (_t, u) => NET_LENS.push(0.1 * u), sun: { target: SIR.at, reach: 6 },
    cast: (t, T) => [on("sir", SIR_D, sir, t, ARENA.wall, { talk: talk(W, T, ["hook"]) })],
    things: (g, c, t, T, cam) => { crowd(g, STANDS, T, cam, 0.7); const cr = c.sir.joint("crown"), k = smooth(t / LAND);
      if (t < LAND) { const p0 = by(SIR.at, SIR.heading, 0.2, 1.45, 2.15), q: V3 = [p0[0] + (cr[0] - p0[0]) * k, p0[1] + (cr[1] + 0.06 - p0[1]) * k, p0[2] + (cr[2] - p0[2]) * k]; draped(g, [q[0], q[1] - 0.06, q[2]], cam, 0.1 + 0.25 * k, 0.55 * (1 - k), 0); }
      else draped(g, cr, cam, 0.9); } };
};

// ---------------- the three clips ----------------
const clip = (id: string, W: Word[], shots: Shot[], text: string[], textB: number): Film => ({
  id, fps: 30, seconds: LEN, sky: "#9fd6ff", world: arenaWorld, shots, words: W,
  hook: { text, a: 0, b: textB, size: 80 }, beds: [{ k: "crowd", a: 0, b: LEN, g: 0.9 }, { k: "wind", a: 0, b: LEN, g: 0.25 }], audio: `craft/${id}.wav` });
const T1 = 1.5;
const A4 = (() => { const W = wa as Word[], L = byId(la), T2 = Math.max(T1 + 1.5, Math.min(3.0, L.guess.a - 0.05));
  return clip("gladiators-hook4-a", W, [attack("attack", 0, T1), peek("peek", T1, T2, W), twoShot("guess", T2, LEN, W)], ["DID GLADIATORS", "FIGHT TO", "THE DEATH?"], T2); })();
const B4 = (() => { const W = wb as Word[], L = byId(lb), T2 = say(W, "Two"), hb = (L.hook.b + L.guess.a) / 2;
  return clip("gladiators-hook4-b", W, [attack("attack", 0, T1), refereeClose("referee", T1, T2), twoShot("guess", T2, LEN, W)], ["MOST GLADIATORS", "WALKED OUT ALIVE."], Math.max(T1, hb)); })();
const C4 = (() => { const W = wc as Word[], L = byId(lc), T2 = Math.max(T1 + 1.5, Math.min(3.0, L.guess.a - 0.05));
  return clip("gladiators-hook4-c", W, [attack("attack", 0, T1), netOnSir("net", T1, T2, W), twoShot("guess", T2, LEN, W, true)], ["DID GLADIATORS", "FIGHT TO", "THE DEATH?"], T2); })();
export const GLAD4_HOOK_A = A4, GLAD4_HOOK_B = B4, GLAD4_HOOK_C = C4;
