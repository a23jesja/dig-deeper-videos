// "Did gladiators really fight to the death?" (granskning/gladiators-death/manus.md), the whole Short on its voice (voice/gladiators-
// death: Sir Digsworth's narration, the owner's "Do you know what you cost me?" in bm_lewis and the woman's "Relax. They'll probably be
// fine." in bf_emma). Opening a of the hook lab (the trident already on the shield, the crowd on its feet), with the murmillo's visor
// and grille down through the whole film (Jesper, 18 November). Then: Sir Digsworth's guess in the front row, the woman's "not usually"
// with her olives, the ten walking out by the gate (the tenth carried on a stretcher), the school (the trainer's hand on the pupil's
// wrist, porridge and a bandage on the bench), the owner with his coins and his gladiator, the referee, the raised finger, the sponsor's
// cloth, the two walking out together, the doctor at his table and his bandaged men, and the woman's answer to Sir; the coda runs back
// into the first frame.
import * as THREE from "three";
import { Film, Shot, V3, Word, Cam, Staged, talk, smooth, mix3 } from "../stage/film";
import { mover, MM, arm, wag, mt } from "../stage/acting";
import { lens, once, noShade, palm, near, aside, span } from "../stage/staging";
import { GLADIUS, TRIDENT, SHIELD_ARM, WOODSWORD, BOWL, SPOON, ROLL, COIN, MAPPA, PEN, SCROLL, OLIVE, shieldOn, wield, usePose, pole, polePose, reach, jointsOf, setDown, carryBy, handOn, handshake, vanish, Stand } from "../stage/grips";
import { arenaWorld, crowd, ARENA, LUDUS, LUDUS_POST, LUDUS_TABLE, rim } from "../world/arena";
import { woodSword, stretcher, bowlRim, spoon, bandageRoll, coinHeld, mappa, reedPen, scrollHeld, olive, bench, table, chest } from "../world/props";
import { mesh, box, group } from "../world/kit";
import { SIR_D, MURMILLO_GRILLE_D, RETIARIUS_D, REFEREE_D, ROMAN_WOMAN2_D, MURMILLO_BARE_D, THRAEX_D, SECUTOR_D, HOPLOMACHUS_D, PROVOCATOR_D, RETIARIUS2_D, RETIARIUS3_D, MURMILLO2_D, CARRIED_D, TRAINER_D, PUPIL_D, OWNER_D, DOCTOR_D, SPONSOR_D, BEARER_D, BEARER2_D } from "../looks";
import type { Design } from "../designs/common";
import type { Pose } from "../rig";
import { on, SIR, WOMAN, STANDS, FAR, FIGHT, GLAD, SCUTUM, TRI, STICK_O, say, by, sandKick, LOWA, FRONT, TWO, pair, GUARD, shieldMan, twoShot } from "./gladiatorsHooks";
import { rightWay, nearHand, eating, SIT } from "./gripSheet";
import words from "../../../voice/gladiators-death/words.json";
import lines from "../../../voice/gladiators-death/lines.json";

const W = words as Word[], L = Object.fromEntries((lines as { id: string; a: number; b: number }[]).map((x) => [x.id, x]));
const cut = (a: string, b: string) => (L[a].b + L[b].a) / 2, at = (line: string, re: RegExp) => (W.find((w) => w.line === line && re.test(w.w)) ?? W[0]).a;
const P = (o: Partial<Pose>) => o;
// the cuts: on the voice, a new picture every one to four seconds
const T1 = 1.5, T2 = cut("hook", "guess"), T3 = cut("guess", "not"), T4 = cut("not", "nine"), T5 = cut("nine", "cost"), T6 = at("cost", /^fed/) - 0.1, T7 = cut("cost", "owner");
const T8 = at("owner", /^wanted/) - 0.1, T9 = cut("cost_me", "rules"), T10 = cut("rules", "finger"), T11 = cut("finger", "spared"), T12 = at("spared", /^he$/) - 0.1, T13 = cut("spared", "answer");
const T14 = cut("answer", "doctor"), T15 = at("doctor", /^under/) - 0.1, T16 = cut("doctor", "relax"), T17 = L.relax.b + 0.25, END = T17 + 1.0;
const shots: Shot[] = [];
const WOOD = once(() => noShade(woodSword())), STRETCH = once(() => stretcher(1.9)), BOWL_O = once(() => noShade(bowlRim())), SPOON_O = once(() => noShade(spoon())), ROLL_O = once(() => noShade(bandageRoll()));
const COIN_O = once(() => noShade(coinHeld(0.04))), MAPPA_O = once(() => noShade(mappa())), PEN_O = once(() => noShade(reedPen())), SCROLL_O = once(() => noShade(scrollHeld())), OLIVE_O = once(() => noShade(olive())), OLIVES = once(() => noShade(bowlRim(0.07, true)));
const BENCH = once(() => bench(1.6)), TABLE = once(() => table(1.3, 0.7, 0.76)), COINS = once(() => chest(true, true));

// 1. DID GLADIATORS ... the fight already happening: the trident on the shield in the first frame, sand flying
const HOOK = (() => {
  const { mur, ret } = pair(1.9), TH = 0.55; mur.stand(9); ret.stand(9);
  const stand = (at3: V3, heading: number, D: Design, h: number): Stand => ({ D, at: at3, heading, h, cam: LOWA.cam });
  const aim: V3 = by([FIGHT[0] - 0.95, 0, FIGHT[2]], 62, -0.05, 0.42, 1.0);
  mur.actAt(-1, { ...GUARD, lean: 10, py: -0.03 }, 10, { in: 0.01, handL: "grip", handR: "grip", face: { brow: -1, lid: 0.15, mouth: 0.3 } });
  mur.actAt(TH, { ...usePose(GLADIUS, "thrust", "R"), armL: SHIELD_ARM, lean: 16, twist: 10 }, 0.55, { in: 0.12, out: 0.3, antic: 0.15, face: { brow: -1, lid: 0, mouth: 0.7 } });
  ret.actAt(-1, { ...polePose(stand([FIGHT[0] + 0.95, 0, FIGHT[2]], -62, RETIARIUS_D, 1.86), "R", by([FIGHT[0] + 0.95, 0, FIGHT[2]], -62, 0.12, 0.2, 1.0), aim, 0.45), lean: 12 }, 10, { in: 0.01, handL: "grip", handR: "grip", face: { brow: -0.9, lid: 0.1, mouth: 0.5 } });
  ret.actAt(TH + 0.05, { lean: -6, twist: -4, py: 0.02 }, 0.7, { in: 0.14, out: 0.3, face: { brow: 1, lid: 0, wide: 0.8, mouth: 0.6 } });
  const s: Shot = { id: "hook", a: 0, b: T1, still: 0.25,
    sounds: [{ t: 0.0, k: "thud", g: 1.0 }, { t: 0.02, k: "ting", g: 0.7 }, { t: TH + 0.05, k: "whoosh", g: 0.8 }, { t: TH + 0.1, k: "scuff", g: 0.6 }, { t: 1.1, k: "step", g: 0.6 }],
    cam: (_t, u) => LOWA.push(0.18 * u), sun: { target: FIGHT, reach: 10 },
    cast: (t) => [on("mur", MURMILLO_GRILLE_D, mur, t), on("ret", RETIARIUS_D, ret, t)],
    things: (g, c, t, T, cam) => { crowd(g, STANDS, T, cam, 0.95); const k = smooth((t - TH) / 0.12) * (1 - smooth((t - TH - 0.45) / 0.3)); shieldMan(g, c.mur, cam, "ready", ["thrust", k]);
      pole(g, TRI(), c.ret, cam, "R", palm(c.ret, "L"), { len: 1.9, name: "trident", use: "thrust" }); sandKick(g, T, cam, [FIGHT[0], 0, FIGHT[2] + 0.2], 1 - smooth(t / 0.9), 1); } };
  shots.push(s); return s;
})();

// 2. ... FIGHT TO THE DEATH? Sir Digsworth in the front row peeking between his fingers, the crowd on its feet round him
{ const sir = mover(SIR_D, 1.8, SIR.at[0], SIR.at[2], SIR.heading - 6); sir.stand(9);
  const ss: Stand = { D: SIR_D, at: SIR.at, heading: SIR.heading - 6, h: 1.8, cam: FRONT.cam };
  sir.actAt(-1, { ...reach(ss, "L", by(SIR.at, SIR.heading - 6, -0.07, 0.17, 1.56)), ...reach(ss, "R", by(SIR.at, SIR.heading - 6, 0.07, 0.17, 1.56)), head: [0, 4, 0] }, 10, { in: 0.01, handL: "open", handR: "open", face: { brow: 1, lid: 0, wide: 1, mouth: 0.4 } });
  wag(sir, 0, 2, P({ lean: 2, roll: 1.5 }), P({ lean: -1, roll: -1.5 }), 0.11);
  shots.push({ id: "peek", a: T1, b: T2, still: 0.7, sounds: [{ t: 0.05, k: "thud", g: 0.5, p: 0.4 }],
    cam: (_t, u) => FRONT.push(0.1 * u), sun: { target: SIR.at, reach: 6 },
    cast: (t, T) => [on("sir", SIR_D, sir, t, ARENA.wall, { talk: talk(W, T, ["hook"]) })],
    things: (g, _c, _t, T, cam) => crowd(g, STANDS, T, cam, 0.9) }); }

// 3. TWO GO IN, ONE COMES OUT. RIGHT? (two fingers, one, and he turns to her; she shakes her head)
shots.push(twoShot("guess", T2, T3, W));

// 4. NOT USUALLY. She puts an olive in her mouth and points down at the sand; he looks at her
{ const sir = mover(SIR_D, 1.8, SIR.at[0], SIR.at[2], SIR.heading - 8), wh = WOMAN.heading - 12, wom = mover(ROMAN_WOMAN2_D, 1.62, WOMAN.at[0], WOMAN.at[2], wh); sir.stand(9); wom.stand(9);
  sir.actAt(-1, { armL: arm(14, 12, 30, 8), armR: arm(14, 12, 30, 8), head: [34, -2, 0] }, 10, { in: 0.01, handL: "relaxed", handR: "relaxed", face: { brow: 1, lid: 0, smile: 0.2, wide: 0.3 } });
  const ws: Stand = { D: ROMAN_WOMAN2_D, at: WOMAN.at, heading: wh, h: 1.62, cam: TWO.cam }, bh = nearHand(wh, TWO.cam), eh: "L" | "R" = bh === "L" ? "R" : "L", POINT = 0.5;
  wom.actAt(-1, { ...eating(ws), head: [-10, 2, 0] }, 10, { in: 0.01, handL: "grip", handR: "grip", face: { lid: 0.45, mouth: 0.3, smile: 0.2 } });
  wom.actAt(POINT, { ...reach(ws, eh, by(WOMAN.at, wh, 0.1, 0.75, 0.75)), head: [-24, 12, 0] }, 9, { in: 0.25, antic: 0, over: 1.2, handL: eh === "L" ? "point" : "grip", handR: eh === "R" ? "point" : "grip", face: { lid: 0.3, brow: 0.4, smile: 0.35, mouth: 0.15 } });
  shots.push({ id: "not", a: T3, b: T4, still: 0.9, sounds: [{ t: 0.2, k: "tap", g: 0.3 }],
    cam: (_t, u) => TWO.push(0.06 + 0.06 * u), sun: { target: SIR.at, reach: 7 },
    cast: (t) => [on("sir", SIR_D, sir, t, ARENA.wall), on("wom", ROMAN_WOMAN2_D, wom, t, ARENA.wall)],
    things: (g, c, t, T, cam) => { crowd(g, STANDS, T, cam, 0.5); wield(g, OLIVES(), BOWL, "rim", c.wom, bh, cam); if (t < POINT) wield(g, OLIVE_O(), OLIVE, "eat", c.wom, eh, cam, { d: 0.12 }); else vanish(OLIVE_O(), OLIVE); } }); }

// 5. ABOUT NINE TIMES IN TEN, A GLADIATOR LIVED TO FIGHT ANOTHER DAY. The ten walk out toward the gate in two files, each his own way
//    (one with his arm bandaged, one leaning on the man beside him), and the tenth is carried at the end on a stretcher, sitting up and
//    waving. The lens is high and goes back toward the gate at their own pace, so that every face stays whole in the picture and none is
//    behind another (the files walk 15 degrees off the lens's line)
{ const C0 = lens(12.2, 3.2, 3.1, -0.85, -0.53, -16, 56), toLensH = (Math.atan2(0.85, 0.53) * 180) / Math.PI, HW = toLensH + 15, hr = (HW * Math.PI) / 180;
  const f: [number, number] = [Math.sin(hr), Math.cos(hr)], rg: [number, number] = [-Math.cos(hr), Math.sin(hr)], [ox, oz] = C0.spot(5.5, 0.6), SPEED = 0.84;
  /** a place in the parade: s metres behind the first row, q metres to the walkers' right */
  const at = (s: number, q: number): [number, number] => [ox - f[0] * s + rg[0] * q, oz - f[1] * s + rg[1] * q];
  const pace = (m: MM, i: number) => m.stand(0.04 * (i % 3)).walk(mt(m, 3.6), { step: 0.42 / m.LL, tau: 0.5 }).stand(9);
  const walkers: { D: Design; h: number; m: MM; name: string; x: number; z: number }[] = [];
  const looks: [Design, number][] = [[MURMILLO_BARE_D, 1.84], [THRAEX_D, 1.78], [SECUTOR_D, 1.72], [HOPLOMACHUS_D, 1.8], [PROVOCATOR_D, 1.76], [RETIARIUS2_D, 1.8], [RETIARIUS3_D, 1.7], [MURMILLO2_D, 1.88], [SECUTOR_D, 1.74]];
  looks.forEach(([D, h], i) => { const row = Math.floor(i / 2), [x, z] = at(row * 1.5, i === 8 ? -0.45 : i % 2 ? 0.45 : -0.45), m = mover(D, h, x, z, HW); pace(m, i);
    m.actAt(-1, { armL: arm(16, 12, 30, 8), armR: arm(16, 12, 30, 8), head: [0, i % 2 ? 4 : -2, 0] }, 10, { in: 0.01, handL: "relaxed", handR: "relaxed", face: { brow: 0.2, lid: 0.3, smile: i % 3 ? 0.1 : 0.4 } });
    walkers.push({ D, h, m, name: `g${i}`, x, z }); });
  // the sixth leans on the fifth beside him: his left hand on the other's right shoulder
  const lean = walkers[5], leanOn = walkers[4], ls: Stand = { D: lean.D, at: [lean.x, 0, lean.z], heading: HW, h: lean.h, cam: C0.cam, pose: { lean: 4 } }, os: Stand = { D: leanOn.D, at: [leanOn.x, 0, leanOn.z], heading: HW, h: leanOn.h, cam: C0.cam };
  lean.m.actAt(-1, { ...reach(ls, "L", jointsOf(os)("shR")), armR: arm(16, 12, 30, 8), head: [0, 6, 0], lean: 4 }, 10, { in: 0.01, handL: "open", handR: "relaxed", face: { brow: 0.6, lid: 0.4, smile: -0.2 } });
  // the stretcher at the end: each bearer holds the near pole in his right hand, the tenth sits up on it and waves (as grip sheet 5)
  const hy = 0.8, [sx, sz] = at(7.6, 0.3), Q = (u: number, v: number): V3 => [sx + f[0] * u + rg[0] * v, 0, sz + f[1] * u + rg[1] * v];
  const bAt = [Q(0.95, 0), Q(-0.95, 0)], mAt = Q(0.05, -0.28), bearers = [mover(BEARER_D, 1.76, bAt[0][0], bAt[0][2], HW), mover(BEARER2_D, 1.74, bAt[1][0], bAt[1][2], HW)], man = mover(CARRIED_D, 1.8, mAt[0], mAt[2], HW);
  [...bearers, man].forEach((m) => pace(m, 0));
  bearers.forEach((m, i) => { const st: Stand = { D: i ? BEARER2_D : BEARER_D, at: bAt[i], heading: HW, h: m.h, cam: C0.cam }, hand = Q(i ? -0.89 : 0.89, 0.08);
    m.actAt(-1, { ...reach(st, "R", [hand[0], hy, hand[2]]), armL: [[10, 8], [20, 4]] }, 10, { in: 0.01, handR: "grip", handL: "relaxed", face: { brow: 0.4, lid: 0.2 } }); });
  man.actAt(-1, { py: -1, lean: -18, legL: { th: [88, 4], sh: [90, 2] }, legR: { th: [86, -2], sh: [88, 0] }, armL: [[-24, 18], [-14, 10]], armR: [[150, 26], [172, 10]], head: [-34, -4, 0] }, 10, { in: 0.01, handL: "open", handR: "open", face: { brow: 0.4, lid: 0.4, smile: 0.4 } });
  wag(man, 0, 5, P({ armR: [[150, 26], [172, 10]] }), P({ armR: [[160, 10], [182, -4]] }), 0.32, { handR: "open" });
  // the lens goes back at the walkers' pace (their pelvis keeps 0.84 m a second from about 0.45 s on), easing in
  const back = (t: number) => SPEED * (t < 0.9 ? (t * t) / 1.8 : t - 0.45);
  shots.push({ id: "nine", a: T4, b: T5, still: 2.2, sounds: walkers[0].m.cues().filter((q) => q.k === "step").map((q) => ({ t: q.t, k: "step", g: 0.5 })),
    cam: (t) => lens(12.2 + f[0] * back(t), 3.2, 3.1 + f[1] * back(t), -0.85, -0.53, -16, 56).cam, sun: { target: [ox, 0, oz], reach: 12 },
    cast: (t) => [...walkers.map((w) => on(w.name, w.D, w.m, t)), on("b0", BEARER_D, bearers[0], t), on("b1", BEARER2_D, bearers[1], t), on("man", CARRIED_D, man, t, hy + 0.02)],
    things: (g, c, _t, T, cam) => { crowd(g, STANDS, T, cam, 0.6); handOn(c.g5, "L", c.g4, "shR", cam, "shoulder"); carryBy(g, STRETCH(), c.b0, "R", c.b1, "R", cam, 0.02); } }); }

// 6. EACH ONE WAS TRAINED, ... In the school's yard the pupil holds the practice sword out toward the post they practise on; the trainer
//    stands beside him and a little behind, on his sword side, his near hand round the pupil's wrist, setting it right. The sword points
//    forward, away from both and out of the picture, and crosses nobody (review of grip sheet 5: it crossed the trainer). Both are seen
//    at a slant from in front, from the trainer's side, so that his hand on the wrist is nearest the lens
{ const { x: LX, z: LZ } = LUDUS, pa: V3 = [LX - 1.55, 0, LZ - 0.6], ta: V3 = [LX - 1.4, 0, LZ - 1.05], M: V3 = [LX - 1.5, 0, LZ - 0.83];
  const V = lens(M[0] - 3.2 * 0.643, 1.45, M[2] - 3.2 * 0.766, 0.643, 0.766, -3, 44), ph = -90, th = -90, pup = mover(PUPIL_D, 1.76, pa[0], pa[2], ph), tr = mover(TRAINER_D, 1.8, ta[0], ta[2], th); pup.stand(9); tr.stand(9);
  const ps: Stand = { D: PUPIL_D, at: pa, heading: ph, h: 1.76, cam: V.cam, pose: usePose(WOODSWORD, "guard", "R") }, ts: Stand = { D: TRAINER_D, at: ta, heading: th, h: 1.8, cam: V.cam, pose: { lean: 6 } };
  pup.actAt(-1, { ...usePose(WOODSWORD, "guard", "R"), head: [0, 4, 0] }, 10, { in: 0.01, handR: "grip", face: { brow: 0.6, lid: 0.1, mouth: 0.2 } });
  const wrist = (k: number) => { const j = jointsOf(ps)("wrR"); return near([j[0], j[1] + 0.015 * k, j[2]], V.cam, 0.08); };
  tr.actAt(-1, { ...reach(ts, "L", wrist(0)), armR: arm(20, 30, 70, 30), lean: 6, head: [-6, -8, 0] }, 10, { in: 0.01, handL: "grip", handR: "fist", face: { brow: -0.6, lid: 0.2, mouth: 0.3 } });
  wag(tr, 0.2, 2, P({ ...reach(ts, "L", wrist(1)) }), P({ ...reach(ts, "L", wrist(-1)) }), 0.5, { handL: "grip" });
  shots.push({ id: "trained", a: T5, b: T6, still: 0.8, sounds: [{ t: 0.3, k: "tap", g: 0.4 }],
    cam: (_t, u) => V.push(0.08 * u), sun: { target: M, reach: 6 },
    cast: (t) => [on("pup", PUPIL_D, pup, t), on("tr", TRAINER_D, tr, t)],
    things: (g, c, _t, _T, cam) => { wield(g, WOOD(), WOODSWORD, "guard", c.pup, "R", cam); handOn(c.tr, "L", c.pup, "wrR", cam, "wrist"); } }); }

// 7. ... FED AND DOCTORED, AND THAT COST A GREAT DEAL. On the bench the big one eats his porridge; beside him the doctor winds a bandage
//    round another man's forearm
{ const { x: LX, z: LZ } = LUDUS, V = lens(LX + 1.2, 1.25, LZ - 2.6, 0.15, 1, -4, 50), bAt: V3 = [LX + 0.6, 0, LZ + 0.4], eh = -6;
  const eat = mover(MURMILLO_BARE_D, 1.84, bAt[0], bAt[2] + 0.32, eh); eat.stand(9);
  const es: Stand = { D: MURMILLO_BARE_D, at: [bAt[0], 0, bAt[2] + 0.32], heading: eh, h: 1.84, cam: V.cam }, bh = nearHand(eh, V.cam), sh: "L" | "R" = bh === "L" ? "R" : "L";
  eat.actAt(-1, { ...eating(es, SIT) }, 10, { in: 0.01, handL: "grip", handR: "grip", face: { brow: 0.3, lid: 0.3, mouth: 0.4, smile: 0.2 } });
  const dAt: V3 = [LX + 2.1, 0, LZ + 0.5], mAt: V3 = [LX + 2.78, 0, LZ + 0.5], dh = 150, mh = -150, ARM: Partial<Pose> = { armL: [[64, 8], [88, 2]] };
  const pat = mover(THRAEX_D, 1.78, mAt[0], mAt[2], mh), doc = mover(DOCTOR_D, 1.72, dAt[0], dAt[2], dh); pat.stand(9); doc.stand(9);
  const pst: Stand = { D: THRAEX_D, at: mAt, heading: mh, h: 1.78, cam: V.cam, pose: ARM }, dst: Stand = { D: DOCTOR_D, at: dAt, heading: dh, h: 1.72, cam: V.cam }, pj = jointsOf(pst);
  pat.actAt(-1, { ...ARM }, 10, { in: 0.01, handL: "fist", face: { brow: 0.2, lid: 0.3, smile: -0.2 } });
  doc.actAt(-1, { ...reach(dst, "R", near(mix3(pj("elL"), pj("wrL"), 0.55), V.cam, 0.08)), ...reach(dst, "L", near([pj("elL")[0], pj("elL")[1] - 0.03, pj("elL")[2]], V.cam, 0.06)), head: [0, 12, 0] }, 10, { in: 0.01, handR: "grip", handL: "open", face: { brow: 0.3, lid: 0.4 } });
  shots.push({ id: "fed", a: T6, b: T7, still: 1.2, sounds: [{ t: 0.4, k: "tap", g: 0.3 }, { t: 1.4, k: "paper", g: 0.3 }],
    cam: (_t, u) => V.push(0.08 * u), sun: { target: [LX + 1.5, 0, LZ + 0.3], reach: 6 },
    cast: (t) => [on("eat", MURMILLO_BARE_D, eat, t), on("pat", THRAEX_D, pat, t), on("doc", DOCTOR_D, doc, t)],
    things: (g, c, _t, _T, cam) => { const b = BENCH(); b.position.set(bAt[0], 0, bAt[2]); b.rotation.y = 0; g.add(b); wield(g, BOWL_O(), BOWL, "rim", c.eat, bh, cam); wield(g, SPOON_O(), SPOON, "eat", c.eat, sh, cam);
      wield(g, ROLL_O(), ROLL, "wrap", c.doc, "R", cam); handOn(c.doc, "L", c.pat, "elL", cam, "arm");
      const r = palm(c.doc, "R"), q = mix3(c.pat.joint("elL"), c.pat.joint("wrL"), 0.5), s = group([mesh(box(1, 0.045, 0.004), "#f6f2e6", { at: [0.5, 0, 0], line: 0.4, shadow: false })]); span(g, s, near(r, cam, 0.06), near(q, cam, 0.06), cam, 0); s.scale.x = Math.hypot(r[0] - q[0], r[1] - q[1], r[2] - q[2]); } }); }

// 8. THE LAST THING THE SCHOOL'S OWNER ... by the gate, the owner counts coins out of his chest and holds one up to the light
const GATE = rim(0, -2.2), OWNER_AT: V3 = [GATE[0], 0, GATE[1] + 1.2], MAN_AT: V3 = [GATE[0] - 0.75, 0, GATE[1] + 1.0];
{ const V = lens(OWNER_AT[0] - 2.6, 1.35, OWNER_AT[2] + 2.4, 0.74, -0.68, -3, 46), oh = V.toward(OWNER_AT[0], OWNER_AT[2], 25), own = mover(OWNER_D, 1.7, OWNER_AT[0], OWNER_AT[2], oh); own.stand(9);
  own.actAt(-1, { ...usePose(COIN, "show", "R"), head: [0, 6, 0] }, 10, { in: 0.01, handR: "grip", face: { brow: 0.6, lid: 0.3, smile: 0.7 } });
  own.actAt(0.9, { head: [-30, 0, 0] }, 9, { in: 0.3, antic: 0, over: 1.1, face: { brow: 0.9, lid: 0.1, smile: -0.4, wide: 0.4 } });
  shots.push({ id: "coins", a: T7, b: T8, still: 0.6, sounds: [{ t: 0.15, k: "coin", g: 0.6 }, { t: 0.55, k: "coin", g: 0.5 }],
    cam: (_t, u) => V.push(0.06 * u), sun: { target: OWNER_AT, reach: 6 },
    cast: (t) => [on("own", OWNER_D, own, t)],
    things: (g, c, _t, _T, cam) => { const ch = COINS(); ch.position.set(OWNER_AT[0] + 0.5, 0, OWNER_AT[2] - 0.3); ch.rotation.y = -0.5; g.add(ch); wield(g, COIN_O(), COIN, "show", c.own, "R", cam, { d: 0.1 }); } }); }

// 9. ... WANTED WAS A DEAD ONE. "DO YOU KNOW WHAT YOU COST ME?" He bites his nails, then pats his gladiator on the shoulder and asks
{ const V = lens(MAN_AT[0] - 1.5, 1.45, MAN_AT[2] + 2.9, 0.4, -1, -2, 48), mh = V.toward(MAN_AT[0], MAN_AT[2], -35), oh = V.toward(OWNER_AT[0], OWNER_AT[2], -35);
  const man = mover(MURMILLO_GRILLE_D, 1.84, MAN_AT[0], MAN_AT[2], mh), own = mover(OWNER_D, 1.7, OWNER_AT[0], OWNER_AT[2], oh); man.stand(9); own.stand(9);
  const ms: Stand = { D: MURMILLO_GRILLE_D, at: MAN_AT, heading: mh, h: 1.84, cam: V.cam }, os: Stand = { D: OWNER_D, at: OWNER_AT, heading: oh, h: 1.7, cam: V.cam }, mj = jointsOf(ms), oj = jointsOf(os), PAT = say(W, "Do", T8) - T8 - 0.3;
  man.actAt(-1, { ...usePose(GLADIUS, "lowered", "R"), armL: SHIELD_ARM }, 10, { in: 0.01, handL: "grip", handR: "grip", face: { brow: -0.7, lid: 0.15 } });
  own.actAt(-1, { ...reach(os, "R", near(mix3(oj("neck"), oj("skull"), 0.45), V.cam, 0.12)), head: [-20, 4, 0] }, PAT + 0.2, { in: 0.01, out: 0.25, handR: "fist", face: { brow: 1, lid: 0.1, wide: 0.5, smile: -0.6 } });
  wag(own, 0.1, PAT - 0.1, P({ py: 0.01 }), P({ py: -0.01 }), 0.12);
  own.actAt(PAT, { ...reach(os, "R", near(mj("shL"), V.cam, 0.08)), head: [24, 4, 0] }, 9, { in: 0.3, antic: 0.1, over: 1.1, handR: "open", face: { brow: 0.7, lid: 0.2, smile: 0.5 } });
  shots.push({ id: "owner", a: T8, b: T9, still: PAT + 1.0, sounds: [{ t: PAT + 0.35, k: "tap", g: 0.5 }],
    cam: (_t, u) => V.push(0.08 * u), sun: { target: MAN_AT, reach: 6 },
    cast: (t, T) => [on("man", MURMILLO_GRILLE_D, man, t), on("own", OWNER_D, own, t, 0, { talk: talk(W, T, ["cost_me"]) })],
    things: (g, c, t, _T, cam) => { shieldMan(g, c.man, cam, "lowered"); if (t > PAT + 0.3) handOn(c.own, "R", c.man, "shL", cam, "shoulder"); } }); }

// 10. THERE WERE RULES, AND A REFEREE. He strides in between the two with his stick across them, and the sword comes down
const ground: V3 = [FIGHT[0] + 1.1, 0.03, FIGHT[2] + 0.5];
{ const WIDE2 = lens(FIGHT[0], 1.35, FIGHT[2] + 5.4, 0, -1, -6, 54), m2 = pair(1.45), RAT: V3 = [FIGHT[0] + 0.05, 0, FIGHT[2] + 0.25], ref = mover(REFEREE_D, 1.74, RAT[0], RAT[2], 20); m2.mur.stand(9); m2.ret.stand(9); ref.walk(mt(ref, 0.3), { step: 0.5, tau: 0.3 }).stand(9);
  m2.mur.actAt(-1, { ...usePose(GLADIUS, "raised", "R"), armL: SHIELD_ARM, lean: 6 }, 10, { in: 0.01, handL: "grip", handR: "grip", face: { brow: -1, lid: 0.1, mouth: 0.4 } });
  m2.mur.actAt(0.6, { ...usePose(GLADIUS, "lowered", "R"), armL: SHIELD_ARM, lean: -2, head: [-20, 0, 0] }, 9, { in: 0.4, antic: 0, over: 1.1, face: { brow: 0.6, lid: 0.2, mouth: 0.2 } });
  m2.ret.actAt(-1, { lean: -4, armL: arm(30, 30, 70, 20), armR: arm(30, 30, 70, 20), head: [0, -4, 0] }, 10, { in: 0.01, handL: "open", handR: "open", face: { brow: 0.9, lid: 0, wide: 0.6, mouth: 0.3 } });
  const rs: Stand = { D: REFEREE_D, at: RAT, heading: 20, h: 1.74, cam: WIDE2.cam };
  ref.actAt(-1, polePose(rs, "L", by(rs.at, 20, -0.24, 0.3, 1.12), by(rs.at, 20, 3, 0.3, 1.12), 0.48), 10, { in: 0.01, handL: "grip", handR: "grip", face: { brow: -0.9, lid: 0, mouth: 0.6, smile: -0.8 } });
  shots.push({ id: "rules", a: T9, b: T10, still: 1.0, sounds: [{ t: 0.1, k: "step", g: 0.7 }, { t: 0.4, k: "step", g: 0.7 }, { t: 0.45, k: "tap", g: 0.8 }],
    cam: (_t, u) => WIDE2.push(0.12 * u), sun: { target: FIGHT, reach: 10 },
    cast: (t) => [on("mur", MURMILLO_GRILLE_D, m2.mur, t), on("ret", RETIARIUS_D, m2.ret, t), on("ref", REFEREE_D, ref, t)],
    things: (g, c, t, T, cam) => { crowd(g, STANDS, T, cam, 0.8); shieldMan(g, c.mur, cam, "raised", ["lowered", smooth((t - 0.6) / 0.4)], true); setDown(g, TRI(), "trident", ground, cam, -4);
      pole(g, STICK_O(), c.ref, cam, "L", by(c.ref.at, c.ref.heading, 3, 0.3, 1.12), { back: 0.36, len: 1.35, name: "stick" }); } }); }

// 11. A BEATEN MAN RAISED A FINGER TO GIVE UP. The net man down on one knee, his trident on the sand, raises one finger; the sword
//     above him stops
{ const LOWB = lens(FIGHT[0], 1.25, FIGHT[2] + 4.9, 0, -1, -5, 54), { mur, ret } = pair(1.45); mur.stand(9); ret.stand(9);
  mur.actAt(-1, { ...usePose(GLADIUS, "raised", "R"), armL: SHIELD_ARM, lean: 6, head: [0, 8, 0] }, 10, { in: 0.01, handL: "grip", handR: "grip", face: { brow: -1, lid: 0.1, mouth: 0.5 } });
  ret.actAt(-1, { py: -0.5, lean: -8, armL: arm(30, 30, 70, 20), armR: arm(30, 30, 70, 20), head: [0, -10, 0] }, 10, { in: 0.01, handL: "open", handR: "open", face: { brow: 1, lid: 0, wide: 0.9, mouth: 0.3, smile: -0.6 } });
  const UP = say(W, "finger", T10) - T10 - 0.35;
  ret.actAt(UP, { armL: arm(150, 26, 178, 14) }, 9, { in: 0.3, antic: 0.1, over: 1.2, handL: "point", handR: "open" });
  shots.push({ id: "finger", a: T10, b: T11, still: UP + 0.8, sounds: [{ t: 0.0, k: "shing", g: 0.6 }, { t: UP + 0.3, k: "tap", g: 0.4 }],
    cam: (_t, u) => LOWB.push(0.15 * u), sun: { target: FIGHT, reach: 10 },
    cast: (t) => [on("mur", MURMILLO_GRILLE_D, mur, t), on("ret", RETIARIUS_D, ret, t)],
    things: (g, c, t, T, cam) => { crowd(g, STANDS, T, cam, 0.9); shieldMan(g, c.mur, cam, "raised"); setDown(g, TRI(), "trident", ground, cam, -4); sandKick(g, T, cam, [FIGHT[0] + 0.5, 0, FIGHT[2] + 0.2], 0.5 - t * 0.3, 2); } }); }

// 12. AND MOST OF THE TIME, ... the sponsor in his box stands and waves his cloth, the crowd round him on its feet
{ const [bx, bz] = rim(Math.PI / 2, 0.9), BOXY = ARENA.wall + 0.7, sAt: V3 = [bx, BOXY, bz], V = lens(bx + 0.4, BOXY + 0.9, bz - 4.4, -0.06, 1, 9, 44), sh = V.toward(bx, bz, 0), sp = mover(SPONSOR_D, 1.76, bx, bz, sh); sp.stand(9);
  sp.actAt(-1, { ...usePose(MAPPA, "wave", "R"), head: [0, -4, 0] }, 10, { in: 0.01, handR: "grip", face: { brow: 0.6, smile: 0.6, mouth: 0.3 } });
  wag(sp, 0, 3, P({ ...usePose(MAPPA, "wave", "R") }), P({ armR: arm(150, 40, 170, 30) }), 0.32, { handR: "grip" });
  shots.push({ id: "sponsor", a: T11, b: T12, still: 0.7, sounds: [{ t: 0.1, k: "flap", g: 0.7 }, { t: 0.42, k: "flap", g: 0.6 }],
    cam: (_t, u) => V.push(0.06 * u), sun: { target: sAt, reach: 6 },
    cast: (t) => [on("sp", SPONSOR_D, sp, t, BOXY)],
    things: (g, c, _t, T, cam) => { crowd(g, FAR, T, cam, 1); wield(g, MAPPA_O(), MAPPA, "wave", c.sp, "R", cam); } }); }

// 13. ... HE WAS SPARED. The heavy man gives the net man his hand and pulls him up off his knee
{ const V = lens(FIGHT[0] + 0.1, 1.3, FIGHT[2] + 4.2, 0, -1, -4, 52), mur = mover(MURMILLO_GRILLE_D, 1.84, FIGHT[0] - 0.62, FIGHT[2], 55), ret = mover(RETIARIUS_D, 1.86, FIGHT[0] + 0.62, FIGHT[2] + 0.1, -55); mur.stand(9); ret.stand(9);
  const meet = (k: number): V3 => [FIGHT[0] + 0.05, 0.98 + 0.25 * k, FIGHT[2] + 0.12], ms: Stand = { D: MURMILLO_GRILLE_D, at: [FIGHT[0] - 0.62, 0, FIGHT[2]], heading: 55, h: 1.84, cam: V.cam }, rs = (k: number): Stand => ({ D: RETIARIUS_D, at: [FIGHT[0] + 0.62, 0, FIGHT[2] + 0.1], heading: -55, h: 1.86, cam: V.cam, pose: { py: -0.5 + 0.5 * k, lean: -8 + 8 * k } });
  for (const k of [0, 0.5, 1]) { const t0 = 0.15 + k * 0.6; mur.actAt(k ? t0 : -1, { ...reach(ms, "R", meet(k)), lean: 10 - 6 * k }, 10, { in: k ? 0.3 : 0.01, handR: "grip", face: { brow: 0.3, smile: 0.4, mouth: 0 } });
    ret.actAt(k ? t0 : -1, { py: -0.5 + 0.5 * k, lean: -8 + 8 * k, ...reach(rs(k), "L", meet(k)) }, 10, { in: k ? 0.3 : 0.01, handL: "grip", face: { brow: 0.6, lid: 0.1, smile: 0.2 + 0.3 * k } }); }
  shots.push({ id: "pull", a: T12, b: T13, still: 0.75, sounds: [{ t: 0.3, k: "scuff", g: 0.6 }],
    cam: (_t, u) => V.push(0.08 * u), sun: { target: FIGHT, reach: 9 },
    cast: (t) => [on("mur", MURMILLO_GRILLE_D, mur, t), on("ret", RETIARIUS_D, ret, t)],
    things: (g, c, _t, T, cam) => { crowd(g, STANDS, T, cam, 1); handshake(c.mur, "R", c.ret, "L", cam, "hands"); } }); }

// 14. SO NO. MOST FIGHTS ENDED WITH BOTH MEN WALKING OUT. The two walk off toward the gate side by side, the net man's arm over the
//     heavy man's shoulders, flowers falling round them from the stands
{ const z0 = 0.9, V = lens(9.4, 1.6, 4.6, 0.82, -0.57, -3, 50), mur = mover(MURMILLO_GRILLE_D, 1.84, 11.0, z0, 90), ret = mover(RETIARIUS_D, 1.86, 11.0, z0 + 0.74, 90);
  for (const m of [mur, ret]) m.walk(mt(m, 3.2), { step: 0.6, tau: 0.4 }).stand(9);
  const ms: Stand = { D: MURMILLO_GRILLE_D, at: [11.0, 0, z0], heading: 90, h: 1.84, cam: V.cam };
  mur.actAt(-1, { ...usePose(GLADIUS, "lowered", "R"), armL: arm(16, 12, 30, 8), head: [-16, 2, 0] }, 10, { in: 0.01, handR: "grip", handL: "relaxed", face: { brow: 0.4, smile: 0.6, lid: 0.2 } });
  const rs: Stand = { D: RETIARIUS_D, at: [11.0, 0, z0 + 0.74], heading: 90, h: 1.86, cam: V.cam }, sh = jointsOf(ms)("shR");
  ret.actAt(-1, { armR: arm(16, 12, 30, 8), ...reach(rs, "L", [sh[0], sh[1] + 0.04, sh[2]]), head: [16, 2, 0] }, 10, { in: 0.01, handL: "open", handR: "relaxed", face: { brow: 0.4, smile: 0.7, lid: 0.2 } });
  shots.push({ id: "out", a: T13, b: T14, still: 1.6, sounds: mur.cues().filter((q) => q.k === "step").map((q) => ({ t: q.t, k: "step", g: 0.5 })),
    cam: (_t, u) => V.push(0.05 * u), sun: { target: [12, 0, z0], reach: 8 },
    cast: (t) => [on("mur", MURMILLO_GRILLE_D, mur, t), on("ret", RETIARIUS_D, ret, t)],
    things: (g, c, _t, T, cam) => { crowd(g, FAR, T, cam, 1); wield(g, GLAD(), GLADIUS, "lowered", c.mur, "R", cam); handOn(c.ret, "L", c.mur, "shR", cam, "shoulder"); petals(g, T, [12.5, 0, z0 + 0.3]); } }); }

// 15. ONE ARENA DOCTOR BOASTED THAT ... at his table in the school, pen to his scroll, pleased with himself
{ const [tx, tz] = LUDUS_TABLE, dAt: V3 = [tx, 0, tz - 0.55], V = lens(tx - 0.3, 1.5, tz - 3.4, 0.08, 1, -4, 44), dh = V.toward(dAt[0], dAt[2], 8), doc = mover(DOCTOR_D, 1.72, dAt[0], dAt[2], dh); doc.stand(9);
  const ds: Stand = { D: DOCTOR_D, at: dAt, heading: dh, h: 1.72, cam: V.cam, pose: usePose(SCROLL, "hold", "L") }, j = jointsOf(ds), w = rightWay(ds), top = mix3(j("wrL"), j("tipL"), 0.5), mid: V3 = [top[0], top[1] - 0.2, top[2]];
  const WRITE = (k: number) => ({ ...usePose(SCROLL, "hold", "L"), ...reach(ds, "R", aside(near(mid, V.cam, 0.06), V.cam, -w * (0.02 + 0.03 * k), 0.1)), head: [0, 10, 0] as [number, number, number] });
  doc.actAt(-1, WRITE(0), 10, { in: 0.01, handL: "grip", handR: "grip", face: { brow: 0.2, lid: 0.45, smile: 0.4 } });
  wag(doc, 0.15, 1.4, P(WRITE(1)), P(WRITE(-1)), 0.32, { handL: "grip", handR: "grip" });
  doc.actAt(1.25, { ...WRITE(0), head: [-10, -6, 0] }, 9, { in: 0.25, antic: 0, over: 1.1, handL: "grip", handR: "grip", face: { brow: 0.7, lid: 0.3, smile: 0.9 } });
  shots.push({ id: "doctor", a: T14, b: T15, still: 1.4, sounds: [{ t: 0.3, k: "scratch", g: 0.35 }, { t: 0.8, k: "scratch", g: 0.35 }],
    cam: (_t, u) => V.push(0.1 * u), sun: { target: dAt, reach: 6 },
    cast: (t) => [on("doc", DOCTOR_D, doc, t)],
    things: (g, c, _t, _T, cam) => { const tb = TABLE(); tb.position.set(tx, 0, tz - 0.05); g.add(tb); wield(g, SCROLL_O(), SCROLL, "hold", c.doc, "L", cam); wield(g, PEN_O(), PEN, "write", c.doc, "R", cam, { d: 0.1 }); } }); }

// 16. ... UNDER HIS CARE, HARDLY ANY GLADIATORS DIED. Behind him in a row his patients, bandaged, show their muscles
{ const { x: LX, z: LZ } = LUDUS, V = lens(LX + 1.6, 1.5, LZ - 2.6, 0, 1, -3, 52), row: [Design, number][] = [[MURMILLO_BARE_D, 1.84], [SECUTOR_D, 1.72], [THRAEX_D, 1.78], [PROVOCATOR_D, 1.76], [MURMILLO2_D, 1.88]];
  const men = row.map(([D, h], i) => { const x = LX + 0.0 + i * 0.8, z = LZ + 1.4 + (i % 2) * 0.25, m = mover(D, h, x, z, V.toward(x, z, (i - 2) * 6)); m.stand(9);
    m.actAt(-1, { armL: arm(16, 12, 30, 8), armR: arm(16, 12, 30, 8) }, 10, { in: 0.01, handL: "fist", handR: "fist", face: { brow: 0.2, lid: 0.2, smile: 0.5 } });
    m.actAt(0.25 + 0.18 * i, { armL: arm(80, 80, 150, 80), armR: arm(80, 80, 150, 80), lean: -3 }, 9, { in: 0.3, antic: 0.15, over: 1.3, handL: "fist", handR: "fist", face: { brow: 0.5, lid: 0.1, smile: 0.9, mouth: 0.3 } });
    return { D, m, name: `p${i}` }; });
  shots.push({ id: "patients", a: T15, b: T16, still: 2.0, sounds: men.map((_, i) => ({ t: 0.3 + 0.18 * i, k: "scuff", g: 0.3 })),
    cam: (_t, u) => V.push(0.08 * u), sun: { target: [LX + 1.6, 0, LZ + 1.5], reach: 7 },
    cast: (t) => men.map((q) => on(q.name, q.D, q.m, t)) }); }

// 17. "RELAX. THEY'LL PROBABLY BE FINE." Down on the sand the next pair clash (the sound); Sir Digsworth has his hands over his eyes
//     again, and the woman with the olives tells him so
{ const sir = mover(SIR_D, 1.8, SIR.at[0], SIR.at[2], SIR.heading - 8), wh = WOMAN.heading - 12, wom = mover(ROMAN_WOMAN2_D, 1.62, WOMAN.at[0], WOMAN.at[2], wh); sir.stand(9); wom.stand(9);
  const ss: Stand = { D: SIR_D, at: SIR.at, heading: SIR.heading - 8, h: 1.8, cam: TWO.cam };
  sir.actAt(-1, { ...reach(ss, "L", by(SIR.at, SIR.heading - 8, -0.07, 0.17, 1.56)), ...reach(ss, "R", by(SIR.at, SIR.heading - 8, 0.07, 0.17, 1.56)), head: [0, 4, 0] }, 10, { in: 0.01, handL: "open", handR: "open", face: { brow: 1, lid: 0, wide: 1, mouth: 0.4 } });
  wag(sir, 0, 3, P({ lean: 2, roll: 1.5 }), P({ lean: -1, roll: -1.5 }), 0.13);
  const ws: Stand = { D: ROMAN_WOMAN2_D, at: WOMAN.at, heading: wh, h: 1.62, cam: TWO.cam }, bh = nearHand(wh, TWO.cam);
  wom.actAt(-1, { ...eating(ws), head: [-30, 2, 0] }, 10, { in: 0.01, handL: "grip", handR: "grip", face: { lid: 0.4, brow: 0.3, smile: 0.5 } });
  shots.push({ id: "relax", a: T16, b: T17, still: 1.0, sounds: [{ t: 0.1, k: "thud", g: 0.6, p: -0.5 }, { t: 0.15, k: "ting", g: 0.6, p: -0.5 }],
    cam: (_t, u) => TWO.push(0.1 * u), sun: { target: SIR.at, reach: 7 },
    cast: (t, T) => [on("sir", SIR_D, sir, t, ARENA.wall), on("wom", ROMAN_WOMAN2_D, wom, t, ARENA.wall, { talk: talk(W, T, ["relax"]) })],
    things: (g, c, _t, T, cam) => { crowd(g, STANDS, T, cam, 0.9); wield(g, OLIVES(), BOWL, "rim", c.wom, bh, cam); } }); }

// 18. The coda: the fight a moment before the first frame; the lens runs on into it, so that the film loops
{ const CODA = HOOK.b - (END - T17); shots.push({ id: "loop", a: T17, b: END, still: 0.4, sounds: [{ t: 0.3, k: "whoosh", g: 0.5 }],
    cam: (t) => HOOK.cam(t + CODA, (t + CODA) / (HOOK.b - HOOK.a)), sun: HOOK.sun, cast: (t, T) => HOOK.cast(t + CODA, T), things: (g, c, t, T, cam) => HOOK.things?.(g, c, t + CODA, T, cam) }); }

/** a few flowers thrown from the stands, falling round a point and turning as they fall */
function petals(g: THREE.Group, T: number, p: V3) { for (let i = 0; i < 14; i++) { const u = (T * 0.45 + i * 0.137) % 1, x = p[0] + Math.sin(i * 2.3) * 1.6, z = p[2] + Math.cos(i * 1.7) * 1.2, y = 3.4 - 3.3 * u;
    const f = mesh(box(0.07, 0.012, 0.07), ["#e8475a", "#f6c52e", "#ffffff", "#c04a9a"][i % 4], { at: [x + 0.2 * Math.sin(T * 3 + i), y, z], rot: [T * 3 + i, T * 2 + i * 0.7, 0], line: 0.3, shadow: false }); g.add(f); } }

export const GLADIATORS_DEATH: Film = {
  id: "gladiators-death", fps: 30, seconds: END, sky: "#9fd6ff", world: arenaWorld, shots, words: W,
  hook: { text: ["DID GLADIATORS", "FIGHT TO", "THE DEATH?"], a: 0, b: T2, size: 80 },
  beds: [{ k: "crowd", a: 0, b: T5, g: 0.8 }, { k: "wind", a: 0, b: END, g: 0.25 }, { k: "crowd", a: T9, b: T14, g: 0.9 }, { k: "crowd", a: T16, b: END, g: 0.8 }], audio: "craft/gladiators-death.wav",
  thumbs: [
    { T: 0.3, words: ["TO THE", "DEATH?"], y: 0.7, size: 150 },
    { T: (T4 + T5) / 2, words: ["NINE IN TEN", "WALKED OUT"], y: 0.72, size: 120 },
    { T: T10 + 1.8, words: ["ONE FINGER", "SAVED HIM"], y: 0.72, size: 120 },
  ],
};
