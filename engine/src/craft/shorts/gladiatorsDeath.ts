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
import { lens, once, noShade, palm, near, aside, span, stageAt } from "../stage/staging";
import { GLADIUS, TRIDENT, SHIELD_ARM, WOODSWORD, BOWL, SPOON, ROLL, COIN, MAPPA, PEN, SCROLL, OLIVE, shieldOn, wield, usePose, pole, polePose, reach, jointsOf, setDown, carryBy, handOn, handshake, vanish, Stand } from "../stage/grips";
import { arenaWorld, crowd, ARENA, LUDUS, LUDUS_POST, LUDUS_TABLE, rim } from "../world/arena";
import { woodSword, stretcher, bowl, bowlRim, spoon, bandageRoll, coinHeld, reedPen, scrollHeld, olive, bench, table, chest, stool, refStick } from "../world/props";
import { mesh, box, group } from "../world/kit";
import { SIR_D, MURMILLO_EATER_D, MURMILLO_GRILLE_D, RETIARIUS_D, REFEREE_D, ROMAN_WOMAN_OLIVES_D, MURMILLO_BARE_D, THRAEX_D, SECUTOR_D, HOPLOMACHUS_D, PROVOCATOR_D, RETIARIUS2_D, RETIARIUS3_D, MURMILLO2_D, CARRIED_D, TRAINER_D, PUPIL_D, OWNER_D, DOCTOR_D, SPONSOR_D, BEARER_D, BEARER2_D } from "../looks";
import type { Design } from "../designs/common";
import type { Pose } from "../rig";
import { on, SIR, WOMAN, STANDS, FAR, FIGHT, GLAD, SCUTUM, TRI, STICK_O, say, by, sandKick, LOWA, FRONT, TWO, pair, GUARD, shieldMan, twoShot } from "./gladiatorsHooks";
import { rightWay, nearHand, eating, SIT } from "./gripSheet";
import { attack, without, spread } from "./gladiatorsHooks4";
import words from "../../../voice/gladiators-death/words.json";
import lines from "../../../voice/gladiators-death/lines.json";

const W = words as Word[], L = Object.fromEntries((lines as { id: string; a: number; b: number }[]).map((x) => [x.id, x]));
const cut = (a: string, b: string) => (L[a].b + L[b].a) / 2, at = (line: string, re: RegExp) => (W.find((w) => w.line === line && re.test(w.w)) ?? W[0]).a;
const P = (o: Partial<Pose>) => o;
// the cuts: on the voice, a new picture every one to four seconds
const T1 = 1.5, T2 = Math.max(cut("hook", "guess"), T1 + 1.5), T3 = cut("guess", "not"), T4 = cut("not", "nine"), T5 = cut("nine", "cost"), T6 = at("cost", /^fed/) - 0.1, T7 = cut("cost", "owner");
const T8 = at("owner", /^wanted/) - 0.1, T9 = cut("cost_me", "rules"), T10 = cut("rules", "finger"), T11 = cut("finger", "spared"), T12 = at("spared", /^he$/) - 0.1, T13 = cut("spared", "answer");
const T14 = cut("answer", "doctor"), T15 = at("doctor", /^under/) - 0.1, T16 = cut("doctor", "relax"), T17 = L.relax.b + 0.25, END = T17 + 1.0;
const shots: Shot[] = [];
const WOOD = once(() => noShade(woodSword())), STRETCH = once(() => stretcher(1.94)), BOWL_O = once(() => noShade(bowlRim())), SPOON_O = once(() => noShade(spoon())), ROLL_O = once(() => noShade(bandageRoll()));
const PORRIDGE = once(() => noShade(bowl(0.12))), COIN_O = once(() => noShade(coinHeld(0.04))), PEN_O = once(() => noShade(reedPen())), SCROLL_O = once(() => noShade(scrollHeld())), OLIVE_O = once(() => noShade(olive())), OLIVES = once(() => noShade(bowlRim(0.07, true)));
const BENCH = once(() => bench(0.7)), STOOL = once(() => stool()), TABLE = once(() => table(1.3, 0.7, 0.76)), COINS = once(() => chest(true, true));

// 1. DID GLADIATORS ... opening a of the hook lab (gladiatorsHooks4's attack, as the review passed it in round 3): the trident on the
//    shield in the first frame, the sword chopping down onto its prongs at the rim and held there to the cut (back to his guard, the
//    blade rose behind the shield's top edge: regression row 14)
const HOOK = (() => { const s = attack("hook", 0, T1); shots.push(s); return s; })();

// 2. ... FIGHT TO THE DEATH? Sir Digsworth in the front row peeking between his fingers, the crowd on its feet round him
// (and no one whose face would be above the picture or cut by its sides: their bodies hung in at the top without heads, and big faces
// were cut by the edges)
const EDGES = [[-400, 1480, -900, 0], [-400, 70, -900, 2000], [1010, 1480, -900, 2000]];
const PEEK_FANS = spread(STANDS, FRONT.cam, [[40, 1040, 60, 440], ...EDGES], 2.2, 60), TWO_FANS = spread(STANDS, TWO.cam, [[40, 1040, -900, 330], ...EDGES], 2.2, 60);
{ const sir = mover(SIR_D, 1.8, SIR.at[0], SIR.at[2], SIR.heading - 6); sir.stand(9);
  const ss: Stand = { D: SIR_D, at: SIR.at, heading: SIR.heading - 6, h: 1.8, cam: FRONT.cam };
  sir.actAt(-1, { ...reach(ss, "L", by(SIR.at, SIR.heading - 6, -0.07, 0.17, 1.56)), ...reach(ss, "R", by(SIR.at, SIR.heading - 6, 0.07, 0.17, 1.56)), head: [0, 4, 0] }, 10, { in: 0.01, handL: "open", handR: "open", face: { brow: 1, lid: 0, wide: 1, mouth: 0.4 } });
  wag(sir, 0, 2, P({ lean: 2, roll: 1.5 }), P({ lean: -1, roll: -1.5 }), 0.11);
  shots.push({ id: "peek", a: T1, b: T2, still: 0.7, sounds: [{ t: 0.05, k: "thud", g: 0.5, p: 0.4 }],
    cam: (_t, u) => FRONT.push(0.1 * u), sun: { target: SIR.at, reach: 6 },
    cast: (t, T) => [on("sir", SIR_D, sir, t, ARENA.wall, { talk: talk(W, T, ["hook", "guess"]) })],
    // (the seats behind him where the question lies are empty: the review of opening a, round 3)
    things: (g, _c, _t, T, cam) => crowd(g, PEEK_FANS, T, cam, 0.9) }); }

// 3. TWO GO IN, ONE COMES OUT. RIGHT? (two fingers, one, and he turns to her; she shakes her head)
// (the captions at the top, over seats left empty, as in opening a: lower down they lay over his coat and her arms)
shots.push({ ...twoShot("guess", T2, T3, W, false, TWO, TWO_FANS), capsTop: 200 });

// 4. NOT USUALLY. She puts an olive in her mouth and points down at the sand; he looks at her
{ const sir = mover(SIR_D, 1.8, SIR.at[0], SIR.at[2], SIR.heading - 8), wh = WOMAN.heading - 12, wom = mover(ROMAN_WOMAN_OLIVES_D, 1.62, WOMAN.at[0], WOMAN.at[2], wh); sir.stand(9); wom.stand(9);
  // (his hands together at his waist, above the parapet: hanging, the parapet cut them off, v4's body check)
  const ss: Stand = { D: SIR_D, at: SIR.at, heading: SIR.heading - 8, h: 1.8, cam: TWO.cam };
  sir.actAt(-1, { ...reach(ss, "L", by(SIR.at, SIR.heading - 8, -0.08, 0.2, 1.04)), ...reach(ss, "R", by(SIR.at, SIR.heading - 8, 0.08, 0.2, 1.04)), head: [34, -2, 0] }, 10, { in: 0.01, handL: "relaxed", handR: "relaxed", face: { brow: 1, lid: 0, smile: 0.2, wide: 0.3 } });
  const ws: Stand = { D: ROMAN_WOMAN_OLIVES_D, at: WOMAN.at, heading: wh, h: 1.62, cam: TWO.cam }, bh = nearHand(wh, TWO.cam), eh: "L" | "R" = bh === "L" ? "R" : "L", POINT = 0.5;
  wom.actAt(-1, { ...eating(ws), head: [-10, 2, 0] }, 10, { in: 0.01, handL: "grip", handR: "grip", face: { lid: 0.45, mouth: 0.3, smile: 0.2 } });
  wom.actAt(POINT, { ...reach(ws, eh, by(WOMAN.at, wh, 0.1, 0.75, 0.75)), head: [-24, 12, 0] }, 9, { in: 0.25, antic: 0, over: 1.2, handL: eh === "L" ? "point" : "grip", handR: eh === "R" ? "point" : "grip", face: { lid: 0.3, brow: 0.4, smile: 0.35, mouth: 0.15 } });
  // (the captions at the top over empty seats, the crowd behind them spread out, as in the guess)
  shots.push({ id: "not", capsTop: 200, a: T3, b: T4, still: 0.9, sounds: [{ t: 0.2, k: "tap", g: 0.3 }],
    cam: (_t, u) => TWO.push(0.06 + 0.06 * u), sun: { target: SIR.at, reach: 7 },
    cast: (t) => [on("sir", SIR_D, sir, t, ARENA.wall), on("wom", ROMAN_WOMAN_OLIVES_D, wom, t, ARENA.wall)],
    things: (g, c, t, T, cam) => { crowd(g, TWO_FANS, T, cam, 0.5); wield(g, OLIVES(), BOWL, "rim", c.wom, bh, cam); if (t < POINT) wield(g, OLIVE_O(), OLIVE, "eat", c.wom, eh, cam, { d: 0.12 }); else vanish(OLIVE_O(), OLIVE); } }); }

// 5. ABOUT NINE TIMES IN TEN, ... Nine walk out toward the gate in two files, each his own way (one with his arm bandaged, one leaning
//    on the man beside him). The lens is high and goes back toward the gate at their own pace, so that every face stays whole in the
//    picture and none is behind another (the files walk 15 degrees off the lens's line)
const T5a = at("nine", /^gladiator/) - 0.12;
// (Jesper's review of v3: the parade spread out so that every head shows: the files further apart and a half row out of step, the rows
// further apart, and the walk further off the lens's line, so that the rows lie apart in the picture instead of behind each other)
// (v4, the body check: in two files the back rows' heads and arms lay behind the front rows. Now a checkerboard laid out from the lens,
// each man in a gap of the row before him, the rows far enough apart that each row's heads stand above the heads two rows ahead; the
// one who leans walks beside the one he leans on, at the front)
// (the lens at 4.8 m and the parade 0.3 m further off: at 5 m the front pair were seen from 37 degrees above, more than a card allows)
{ const LY = 4.8, LT = -27.5, C0 = lens(12.2, LY, 3.1, -0.85, -0.53, LT, 56), toLensH = (Math.atan2(0.85, 0.53) * 180) / Math.PI, HW = toLensH + 28, hr = (HW * Math.PI) / 180;
  const f: [number, number] = [Math.sin(hr), Math.cos(hr)], rg: [number, number] = [-Math.cos(hr), Math.sin(hr)], [ox, oz] = C0.spot(5.5, 0.6), SPEED = 0.84;
  /** a place in the parade: s metres behind the first row, q metres to the walkers' right */
  const LN = Math.hypot(0.85, 0.53), LF: [number, number] = [-0.85 / LN, -0.53 / LN], LR: [number, number] = [-LF[1], LF[0]];
  /** a place in the parade: d metres further from the lens than the front row, r metres to the right in the picture */
  const at = (d: number, r: number): [number, number] => [ox + LF[0] * (d + 0.3) + LR[0] * r, oz + LF[1] * (d + 0.3) + LR[1] * r];
  const R0 = -0.5, SLOT: [number, number][] = [[2.2, R0 - 1.5], [2.2, R0 + 1.5], [2.2, R0], [4.4, R0 - 0.85], [0, R0 + 0.41], [0, R0 - 0.41], [4.4, R0 + 0.85], [6.6, R0 - 1.9], [6.6, R0 + 1.9]];
  void rg;
  const pace = (m: MM, i: number) => m.stand(0.04 * (i % 3)).walk(mt(m, 3.6), { step: 0.42 / m.LL, tau: 0.5 }).stand(9);
  const walkers: { D: Design; h: number; m: MM; name: string; x: number; z: number }[] = [];
  const looks: [Design, number][] = [[MURMILLO_BARE_D, 1.84], [THRAEX_D, 1.78], [SECUTOR_D, 1.72], [HOPLOMACHUS_D, 1.8], [PROVOCATOR_D, 1.76], [RETIARIUS2_D, 1.8], [RETIARIUS3_D, 1.7], [MURMILLO2_D, 1.88], [SECUTOR_D, 1.74]];
  // (the sixth walks beside the fifth, his hand on the other's shoulder: half a row behind and across the parade, as the others are spread,
  // his hand fell half a metre short of the shoulder)
  looks.forEach(([D, h], i) => { const [x, z] = at(...SLOT[i]), m = mover(D, h, x, z, HW); pace(m, i);
    m.actAt(-1, { armL: arm(16, 12, 30, 8), armR: arm(16, 12, 30, 8), head: [0, i % 2 ? 4 : -2, 0] }, 10, { in: 0.01, handL: "relaxed", handR: "relaxed", face: { brow: 0.2, lid: 0.3, smile: i % 3 ? 0.1 : 0.4 } });
    walkers.push({ D, h, m, name: `g${i}`, x, z }); });
  // the sixth leans on the fifth beside him: his left hand on the other's right shoulder
  const lean = walkers[5], leanOn = walkers[4], ls: Stand = { D: lean.D, at: [lean.x, 0, lean.z], heading: HW, h: lean.h, cam: C0.cam, pose: { lean: 4 } }, os: Stand = { D: leanOn.D, at: [leanOn.x, 0, leanOn.z], heading: HW, h: leanOn.h, cam: C0.cam };
  const top = jointsOf(os)("shR"); lean.m.actAt(-1, { ...reach(ls, "L", [top[0], top[1] + 0.03, top[2]]), armR: arm(16, 12, 30, 8), head: [0, 6, 0], lean: 4 }, 10, { in: 0.01, handL: "open", handR: "relaxed", face: { brow: 0.6, lid: 0.4, smile: -0.2 } });
  // the lens goes back at the walkers' pace (their pelvis keeps 0.84 m a second from about 0.45 s on), easing in
  const back = (t: number) => SPEED * (t < 0.9 ? (t * t) / 1.8 : t - 0.45);
  shots.push({ id: "nine", a: T4, b: T5a, still: 1.2, sounds: walkers[0].m.cues().filter((q) => q.k === "step" && q.t < T5a - T4).map((q) => ({ t: q.t, k: "step", g: 0.5 })),
    cam: (t) => lens(12.2 + f[0] * back(t), LY, 3.1 + f[1] * back(t), -0.85, -0.53, LT, 56).cam, sun: { target: [ox, 0, oz], reach: 12 },
    cast: (t) => walkers.map((w) => on(w.name, w.D, w.m, t)),
    things: (g, c, _t, T, cam) => { crowd(g, STANDS, T, cam, 0.6); handOn(c.g5, "L", c.g4, "shR", cam, "shoulder"); } }); }

// 5b. ... A GLADIATOR LIVED TO FIGHT ANOTHER DAY. Last comes the tenth, carried on a stretcher by two men: alive and wounded, his leg
//     bound, he sits half up on his elbow and waves tiredly to the stands. Seen from the side as on grip sheet 5 (each bearer holds the
//     near pole in his right hand), the lens going along with them
{ const X = 2.0, Z = -2.4, hy = 0.8, SPEED = 0.84, back = (t: number) => SPEED * (t < 0.9 ? (t * t) / 1.8 : t - 0.45), W2 = (t: number) => lens(X + back(t), 1.45, Z + 4.4, 0, -1, -3, 62);
  // (v4, the body check: the poles end in the bearers' hands, 1.78 m long (they ran on into their bodies); the wounded man further back on
  // the bed, so that his feet rest on it, and a little higher, on it rather than into it; his propping arm on the bed beside him, not
  // through the near pole)
  // (the free arm of each bearer swings clear of the pole, the rear man's back and the front man's forward: hanging at his side it lay
  // across the pole)
  // (the grip audit: each fist round its handle, 6 cm in from the pole's end, and the bearers a step further apart so that the poles' ends
  // stop short of their bodies)
  const ms = [mover(BEARER_D, 1.76, X - 1.12, Z, 90), mover(BEARER2_D, 1.74, X + 1.12, Z, 90), mover(CARRIED_D, 1.8, X - 0.36, Z - 0.28, 90)];
  for (const m of ms) m.walk(mt(m, 3.0), { step: 0.42 / m.LL, tau: 0.5 }).stand(9);
  const st = (D: Design, m: MM, x: number): Stand => ({ D, at: [x, 0, Z], heading: 90, h: m.h, cam: W2(0).cam });
  ms[0].actAt(-1, { ...reach(st(BEARER_D, ms[0], X - 1.12), "R", [X - 0.91, hy, Z + 0.08]), armL: [[-18, 6], [-12, 4]] }, 10, { in: 0.01, handR: "grip", handL: "relaxed", face: { brow: 0.4, lid: 0.2 } });
  ms[1].actAt(-1, { ...reach(st(BEARER2_D, ms[1], X + 1.12), "R", [X + 0.91, hy, Z + 0.08]), armL: [[20, 6], [28, 4]], head: [-45, 0, 0] }, 10, { in: 0.01, handR: "grip", handL: "relaxed", face: { brow: 0.4, lid: 0.2 } });
  ms[2].actAt(-1, { py: -1, lean: -10, legL: { th: [86, 4], sh: [85, 2] }, legR: { th: [86, -2], sh: [85, 0] }, armL: [[34, 8], [52, 4]], armR: [[150, 26], [172, 10]], head: [-34, -4, 0] }, 10, { in: 0.01, handL: "open", handR: "open", face: { brow: 0.4, lid: 0.5, smile: 0.3 } });
  wag(ms[2], 0.2, 2.2, P({ armR: [[150, 26], [172, 10]] }), P({ armR: [[158, 14], [180, 0]] }), 0.55, { handR: "open" });
  shots.push({ id: "carried", a: T5a, b: T5, still: 1.0, sounds: ms[0].cues().filter((q) => q.k === "step" && q.t < T5 - T5a).map((q) => ({ t: q.t, k: "step", g: 0.45 })),
    cam: (t) => W2(t).cam, sun: { target: [X + 1.2, 1, Z], reach: 6 },
    // (his seat goes up and down with the bed as the bearers step: on a fixed height he sank into it and floated over it in turn)
    cast: (t) => { const cam = W2(t).cam, b0 = on("b0", BEARER_D, ms[0], t), b1 = on("b1", BEARER2_D, ms[1], t), bed = (palm(stageAt(b0, cam), "R")[1] + palm(stageAt(b1, cam), "R")[1]) / 2;
      return [b0, b1, on("man", CARRIED_D, ms[2], t, bed + 0.1)]; },
    things: (g, c, _t, T, cam) => { crowd(g, STANDS, T, cam, 0.7); carryBy(g, STRETCH(), c.b0, "R", c.b1, "R", cam, 0.02); } }); }

// 6. EACH ONE WAS TRAINED, ... In the school's yard the pupil holds the practice sword out toward the post they practise on; the trainer
//    stands beside him and a little behind, on his sword side, his near hand round the pupil's wrist, setting it right. The sword points
//    forward, away from both and out of the picture, and crosses nobody (review of grip sheet 5: it crossed the trainer). Both are seen
//    at a slant from in front, from the trainer's side, so that his hand on the wrist is nearest the lens
// (v4, the body check: with his hand round the pupil's wrist the trainer stood between the lens and the pupil, his head over the
// pupil's and his hand over the pupil's hand; a card figure cannot reach round another without one lying over the other. Now the pupil
// is nearest the lens, his sword side toward it and the sword out of the picture to the right, and the trainer stands a step behind him
// on his other side, a body's width to the left in the picture, and points at the sword arm as he puts him right)
{ const { x: LX, z: LZ } = LUDUS, pa: V3 = [LX - 1.55, 0, LZ - 0.6], D: [number, number] = [0.643, 0.766], R: [number, number] = [-D[1], D[0]];
  const ta: V3 = [pa[0] - R[0] * 0.78 + D[0] * 0.5, 0, pa[2] - R[1] * 0.78 + D[1] * 0.5], M: V3 = [(pa[0] + ta[0]) / 2 + R[0] * 0.14, 0, (pa[2] + ta[2]) / 2 + R[1] * 0.14];
  const V = lens(M[0] - 4.4 * D[0], 1.45, M[2] - 4.4 * D[1], D[0], D[1], -3, 44), ph = -90, th = (Math.atan2(pa[0] - ta[0], pa[2] - ta[2]) * 180) / Math.PI - 20;
  const pup = mover(PUPIL_D, 1.76, pa[0], pa[2], ph), tr = mover(TRAINER_D, 1.8, ta[0], ta[2], th); pup.stand(9); tr.stand(9);
  const ts: Stand = { D: TRAINER_D, at: ta, heading: th, h: 1.8, cam: V.cam, pose: { lean: 4 } };
  pup.actAt(-1, { ...usePose(WOODSWORD, "guard", "R"), head: [0, 4, 0] }, 10, { in: 0.01, handR: "grip", face: { brow: 0.6, lid: 0.1, mouth: 0.2 } });
  /** where he points: k of the way from his shoulder toward the pupil's sword shoulder */
  const aim = (dy: number): V3 => { const sh = jointsOf(ts)("shR"), ps: Stand = { D: PUPIL_D, at: pa, heading: ph, h: 1.76, cam: V.cam, pose: usePose(WOODSWORD, "guard", "R") }, q = jointsOf(ps)("elR"); return [sh[0] + (q[0] - sh[0]) * 0.62, sh[1] + (q[1] - sh[1]) * 0.62 + dy, sh[2] + (q[2] - sh[2]) * 0.62]; };
  tr.actAt(-1, { ...reach(ts, "R", aim(0)), armL: arm(4, 8, 12, 6), lean: 4, head: [-6, -14, 0] }, 10, { in: 0.01, handR: "point", handL: "relaxed", face: { brow: -0.6, lid: 0.2, mouth: 0.3 } });
  wag(tr, 0.2, 2, P({ ...reach(ts, "R", aim(0.03)) }), P({ ...reach(ts, "R", aim(-0.03)) }), 0.5, { handR: "point" });
  shots.push({ id: "trained", a: T5, b: T6, still: 0.8, capsTop: 200, sounds: [{ t: 0.3, k: "tap", g: 0.4 }],
    cam: (_t, u) => V.push(0.08 * u), sun: { target: M, reach: 6 },
    cast: (t) => [on("pup", PUPIL_D, pup, t), on("tr", TRAINER_D, tr, t)],
    things: (g, c, _t, _T, cam) => { wield(g, WOOD(), WOODSWORD, "guard", c.pup, "R", cam); } }); }

// 7. ... FED AND DOCTORED, AND THAT COST A GREAT DEAL. Close on the bench: the big one holds his bowl of porridge out before his chest
//    in his far hand and chews, and rests his near forearm out toward the doctor beside him, who winds a bandage round it, turn after
//    turn, the white band growing. (Jesper's review of v3: the bandage was wound round the arm that held the bowl; it goes round the
//    other arm, and each hand does one thing that can be followed: the spoon is gone.)
// (v4: he faces us, the bowl before his chest on his right, his left forearm held out to his left, where the doctor sits and winds the
// bandage: the bowl and the bandage at the two sides of the picture, each pair of hands at its own work. Turned to the doctor, his bowl
// hand and the doctor's hands met between them, and the doctor's head lay over his face)
{ const { x: LX, z: LZ } = LUDUS, E: V3 = [LX + 1.0, 0, LZ + 0.4], V = lens(E[0] - 0.66, 1.0, E[2] - 4.0, 0, 1, 7, 56), eh = V.toward(E[0], E[2], -18), fw: [number, number] = [Math.sin((eh * Math.PI) / 180), Math.cos((eh * Math.PI) / 180)], rt: [number, number] = [-Math.cos((eh * Math.PI) / 180), Math.sin((eh * Math.PI) / 180)];
  const eat = mover(MURMILLO_EATER_D, 1.84, E[0], E[2], eh); eat.stand(9);
  // the bowl in his far hand, held out in front of him past his chest, where it shows; his near (left) forearm, drawn in front of him,
  // resting out toward the doctor at waist height, where the bandage on it shows
  const bh: "L" | "R" = "R", es0: Stand = { D: MURMILLO_EATER_D, at: E, heading: eh, h: 1.84, cam: V.cam, pose: SIT }, j0 = jointsOf(es0), shB = j0("shR"), shN = j0("shL");
  // (v4: the bowl up before his chest, close to him, where he eats from it: held out, the doctor's hand passed under it)
  const hand: V3 = [shB[0] + fw[0] * 0.28 - rt[0] * 0.06, shB[1] - 0.08, shB[2] + fw[1] * 0.28 - rt[1] * 0.06], BA = reach(es0, bh, hand);
  const rest: V3 = [shN[0] - rt[0] * 0.5 + fw[0] * 0.14, shN[1] - 0.32, shN[2] - rt[1] * 0.5 + fw[1] * 0.14], NA = reach({ ...es0, pose: { ...SIT, ...BA } }, "L", rest), es1: Stand = { ...es0, pose: { ...SIT, ...BA, ...NA } }, j1 = jointsOf(es1);
  const elB = j1("elL"), wrB = j1("wrL"), mid = mix3(elB, wrB, 0.5);
  // the doctor sits on a stool facing the forearm, beyond its wrist and a little nearer the lens, his hands at its height (standing, he
  // could not reach down to it without his hands stopping short of it, behind the seated man's body)
  // (v4: further out along the arm, level with it, and leaning in less: closer, his head lay over the eater's face and his body hid the
  // bowl; the body check)
  const DOC_OUT = 0.6, dAt: V3 = [mid[0] - rt[0] * DOC_OUT + fw[0] * 0.1, 0, mid[2] - rt[1] * DOC_OUT + fw[1] * 0.1];
  const toArm = [mid[0] - dAt[0], mid[2] - dAt[2]], toCam = [V.cam.pos[0] - dAt[0], V.cam.pos[2] - dAt[2]], ta = Math.hypot(toArm[0], toArm[1]) || 1, tc = Math.hypot(toCam[0], toCam[1]) || 1;
  // he faces the forearm, turned a little toward us, so that his near hand is the one toward the arm (facing us, it was the other)
  const dh = (Math.atan2(toArm[0] / ta + (0.45 * toCam[0]) / tc, toArm[1] / ta + (0.45 * toCam[1]) / tc) * 180) / Math.PI, doc = mover(DOCTOR_D, 1.72, dAt[0], dAt[2], dh); doc.stand(9);
  const DSIT: Partial<Pose> = { ...SIT, py: -0.36, lean: 6 }, dst: Stand = { D: DOCTOR_D, at: dAt, heading: dh, h: 1.72, cam: V.cam, pose: DSIT }, rh = nearHand(dh, V.cam), oh: "L" | "R" = rh === "L" ? "R" : "L";
  eat.actAt(-1, { ...SIT, ...BA, ...NA, head: [35, 6, 0] }, 10, { in: 0.01, handL: "relaxed", handR: "grip", face: { brow: 0.3, lid: 0.35, mouth: 0.15, smile: 0.3 } });
  // he chews, his mouth working
  for (let i = 0; i * 0.26 < 2.9; i++) eat.actAt(0.1 + i * 0.26, { head: [35, 6 + (i % 2) * 3, 0] }, 10, { in: 0.12, antic: 0, handL: "relaxed", handR: "grip", face: { brow: 0.3, lid: 0.3, mouth: i % 2 ? 0.05 : 0.45, smile: 0.3 } });
  // the bandage: a turn every 0.38 s from 0.3 s, from near the elbow toward the wrist; the doctor's roll goes over and under the arm
  const TURN = 0.38, turns = (t: number) => Math.max(0, Math.min(6, 1 + Math.floor((t - 0.3) / TURN))), along = (n: number) => 0.22 + 0.045 * Math.max(0, n - 1);      // (v4: clear of his elbow and his hand)
  const rollAt = (t: number, up: number): V3 => { const p = mix3(elB, wrB, along(turns(t) + 1)); return near([p[0], p[1] + 0.06 * up, p[2]], V.cam, -0.04); };
  doc.actAt(-1, { ...reach(dst, rh, rollAt(0, 1)), ...(oh === "L" ? { armL: arm(16, 12, 30, 8) } : { armR: arm(16, 12, 30, 8) }), head: [0, 12, 0], ...DSIT }, 10, { in: 0.01, handL: rh === "L" ? "grip" : "relaxed", handR: rh === "R" ? "grip" : "relaxed", face: { brow: 0.4, lid: 0.4, smile: 0.2 } });
  for (let i = 1; i * (TURN / 2) < 2.9; i++) { const t0 = 0.12 + i * (TURN / 2); doc.actAt(t0, { ...reach(dst, rh, rollAt(t0 + 0.1, i % 2 ? -1 : 1)) }, 10, { in: TURN / 2 - 0.02, antic: 0, over: 0, ...(rh === "L" ? { handL: "grip" as const } : { handR: "grip" as const }) }); }
  const RING = once(() => Array.from({ length: 6 }, () => group([mesh(box(1, 0.034, 0.004), "#fbf8f0", { at: [0.5, 0, 0], line: 0.6, shadow: false, receive: false, glow: "#9a968c" })])));
  // (the captions over the awning at the top: lower down they lay over the doctor's and the eater's hands)
  shots.push({ id: "fed", capsTop: 140, a: T6, b: T7, still: 1.25, sounds: [{ t: 0.4, k: "tap", g: 0.3 }, { t: 1.5, k: "tap", g: 0.3 }, { t: 0.9, k: "paper", g: 0.3 }, { t: 1.9, k: "paper", g: 0.3 }],
    cam: (_t, u) => V.push(0.06 * u), sun: { target: [E[0] + 0.4, 0, E[2]], reach: 6 },
    cast: (t) => [{ ...on("eat", MURMILLO_EATER_D, eat, t), noShade: true }, { ...on("doc", DOCTOR_D, doc, t), noShade: true }],
    things: (g, c, t, _T, cam) => { const b = BENCH(); b.position.set(E[0] - fw[0] * 0.32, 0, E[2] - fw[1] * 0.32); b.rotation.y = ((eh - 180) * Math.PI) / 180; g.add(b);
      // (the stool under his seat, where his pelvis is: put by his feet it stood beside him, v4)
      const sd = STOOL(), pv = jointsOf(dst)("pelvis"), dr = (dh * Math.PI) / 180; sd.position.set(pv[0] - Math.sin(dr) * 0.15, 0, pv[2] - Math.cos(dr) * 0.15); sd.scale.y = 0.86; g.add(sd);
      wield(g, PORRIDGE(), BOWL, "hold", c.eat, bh, cam);
      wield(g, ROLL_O(), ROLL, "wrap", c.doc, rh, cam);
      // the turns already wound, as white bands across the forearm (a little slanted, as a spiral), and the strip from the roll to the last
      const el = c.eat.joint("elL"), wr = c.eat.joint("wrL"), n = turns(t), dir = new THREE.Vector3(wr[0] - el[0], wr[1] - el[1], wr[2] - el[2]).normalize();
      const view = new THREE.Vector3(cam.look[0] - cam.pos[0], cam.look[1] - cam.pos[1], cam.look[2] - cam.pos[2]).normalize(), perp = new THREE.Vector3().crossVectors(view, dir).normalize().addScaledVector(dir, 0.3).normalize();
      RING().forEach((r, i) => { if (i >= n) return; const p = mix3(el, wr, along(i + 1)), a: V3 = [p[0] - perp.x * 0.066, p[1] - perp.y * 0.066, p[2] - perp.z * 0.066], b2: V3 = [p[0] + perp.x * 0.066, p[1] + perp.y * 0.066, p[2] + perp.z * 0.066];
        span(g, r, near(a, cam, 0.05), near(b2, cam, 0.05), cam, 0); r.scale.x = 0.132; });
      const r0 = palm(c.doc, rh), q = mix3(el, wr, along(Math.max(1, n))), s = group([mesh(box(1, 0.04, 0.004), "#f6f2e6", { at: [0.5, 0, 0], line: 0.4, shadow: false })]);
      span(g, s, near(r0, cam, 0.06), near(q, cam, 0.06), cam, 0); s.scale.x = Math.hypot(r0[0] - q[0], r0[1] - q[1], r0[2] - q[2]); } }); }

// 8. THE LAST THING THE SCHOOL'S OWNER ... by the gate, the owner counts coins out of his chest and holds one up to the light
const GATE = rim(0, -2.2), OWNER_AT: V3 = [GATE[0], 0, GATE[1] + 1.2], MAN_AT: V3 = [GATE[0] - 0.75, 0, GATE[1] + 1.0];
{ const V = lens(OWNER_AT[0] - 2.6, 1.35, OWNER_AT[2] + 2.4, 0.776, -0.642, -3, 46), oh = V.toward(OWNER_AT[0], OWNER_AT[2], 25), own = mover(OWNER_D, 1.7, OWNER_AT[0], OWNER_AT[2], oh); own.stand(9);
  own.actAt(-1, { ...usePose(COIN, "show", "R"), head: [0, 6, 0] }, 10, { in: 0.01, handR: "grip", face: { brow: 0.6, lid: 0.3, smile: 0.7 } });
  own.actAt(0.9, { head: [-30, 0, 0] }, 9, { in: 0.3, antic: 0, over: 1.1, face: { brow: 0.9, lid: 0.1, smile: -0.4, wide: 0.4 } });
  // (the captions over the arena wall at the top: lower down they lay over his robe and the chest)
  shots.push({ id: "coins", capsTop: 200, a: T7, b: T8, still: 0.6, sounds: [{ t: 0.15, k: "coin", g: 0.6 }, { t: 0.55, k: "coin", g: 0.5 }],
    cam: (_t, u) => V.push(0.06 * u), sun: { target: OWNER_AT, reach: 6 },
    cast: (t) => [on("own", OWNER_D, own, t)],
    // (the chest a step further from him, beside him and a little before him: his left leg stood inside it; further to the side the right
    // edge cut it)
    things: (g, c, _t, _T, cam) => { const ch = COINS(); ch.position.set(OWNER_AT[0] + 0.52, 0, OWNER_AT[2] + 0.5); ch.rotation.y = -0.75; g.add(ch); wield(g, COIN_O(), COIN, "show", c.own, "R", cam, { d: 0.1 }); } }); }

// 9. ... WANTED WAS A DEAD ONE. "DO YOU KNOW WHAT YOU COST ME?" He bites his nails, then pats his gladiator on the shoulder and asks
{ const V = lens((MAN_AT[0] + OWNER_AT[0]) / 2 - 1.18, 1.45, (MAN_AT[2] + OWNER_AT[2]) / 2 + 2.98, 0.37, -0.93, -2, 50), mh = V.toward(MAN_AT[0], MAN_AT[2], -30), oh = V.toward(OWNER_AT[0], OWNER_AT[2], -35);
  const man = mover(MURMILLO_GRILLE_D, 1.84, MAN_AT[0], MAN_AT[2], mh), own = mover(OWNER_D, 1.7, OWNER_AT[0], OWNER_AT[2], oh); man.stand(9); own.stand(9);
  const ms: Stand = { D: MURMILLO_GRILLE_D, at: MAN_AT, heading: mh, h: 1.84, cam: V.cam }, os: Stand = { D: OWNER_D, at: OWNER_AT, heading: oh, h: 1.7, cam: V.cam }, mj = jointsOf(ms), oj = jointsOf(os), PAT = say(W, "Do", T8) - T8 - 0.3;
  // (at ease: the shield rests low at his side; held at guard height it covered his face)
  man.actAt(-1, { ...usePose(GLADIUS, "lowered", "R"), armL: arm(14, 18, 40, 10) }, 10, { in: 0.01, handL: "grip", handR: "grip", face: { brow: -0.7, lid: 0.15 } });
  own.actAt(-1, { ...reach(os, "R", near(mix3(oj("neck"), oj("skull"), 0.45), V.cam, 0.12)), head: [-20, 4, 0] }, PAT + 0.2, { in: 0.01, out: 0.25, handR: "fist", face: { brow: 1, lid: 0.1, wide: 0.5, smile: -0.6 } });
  wag(own, 0.1, PAT - 0.1, P({ py: 0.01 }), P({ py: -0.01 }), 0.12);
  // (on top of the shoulder: to its middle, his hand passed over the murmillo's own hand for a frame, v4's body check)
  own.actAt(PAT, { ...reach(os, "R", near([mj("shL")[0], mj("shL")[1] + 0.06, mj("shL")[2]], V.cam, 0.08)), head: [24, 4, 0] }, 9, { in: 0.3, antic: 0.1, over: 1.1, handR: "open", face: { brow: 0.7, lid: 0.2, smile: 0.5 } });
  // (the captions over the arena wall at the top: lower down they lay over the owner's hand)
  shots.push({ id: "owner", capsTop: 200, a: T8, b: T9, still: PAT + 1.0, sounds: [{ t: PAT + 0.35, k: "tap", g: 0.5 }],
    cam: (_t, u) => V.push(0.08 * u), sun: { target: MAN_AT, reach: 6 },
    cast: (t, T) => [on("man", MURMILLO_GRILLE_D, man, t), on("own", OWNER_D, own, t, 0, { talk: talk(W, T, ["cost_me"]) })],
    things: (g, c, t, _T, cam) => { shieldMan(g, c.man, cam, "lowered"); if (t > PAT + 0.3) handOn(c.own, "R", c.man, "shL", cam, "shoulder"); } }); }

// 10. THERE WERE RULES, AND A REFEREE. He strides in between the two with his stick across them, and the sword comes down
const ground: V3 = [FIGHT[0] + 1.1, 0.03, FIGHT[2] + 0.5];
// (Jesper's point 4 and the body check: the two further apart and the stick held by its middle, so that its ends stop well short of
// both; reaching from his hand a metre to one side it lay over the net man's chest)
{ const WIDE2 = lens(FIGHT[0], 1.35, FIGHT[2] + 6.3, 0, -1, -6, 54), m2 = pair(2.6), STICK_R = once(() => noShade(refStick(1.1))), RAT: V3 = [FIGHT[0] + 0.08, 0, FIGHT[2] + 0.25], ref = mover(REFEREE_D, 1.74, RAT[0], RAT[2], 20); m2.mur.stand(9); m2.ret.stand(9); ref.walk(mt(ref, 0.3), { step: 0.5, tau: 0.3 }).stand(9);
  m2.mur.actAt(-1, { ...usePose(GLADIUS, "raised", "R"), armL: SHIELD_ARM, lean: 6 }, 10, { in: 0.01, handL: "grip", handR: "grip", face: { brow: -1, lid: 0.1, mouth: 0.4 } });
  m2.mur.actAt(0.6, { ...usePose(GLADIUS, "lowered", "R"), armL: SHIELD_ARM, lean: -2, head: [-20, 0, 0] }, 9, { in: 0.4, antic: 0, over: 1.1, face: { brow: 0.6, lid: 0.2, mouth: 0.2 } });
  m2.ret.actAt(-1, { lean: -4, armL: arm(14, 16, 44, 10), armR: arm(14, 16, 44, 10), head: [0, -4, 0] }, 10, { in: 0.01, handL: "open", handR: "open", face: { brow: 0.9, lid: 0, wide: 0.6, mouth: 0.3 } });
  const rs: Stand = { D: REFEREE_D, at: RAT, heading: 20, h: 1.74, cam: WIDE2.cam };
  ref.actAt(-1, polePose(rs, "L", by(rs.at, 20, -0.24, 0.3, 1.12), by(rs.at, 20, 3, 0.3, 1.12), 0.48), 10, { in: 0.01, handL: "grip", handR: "grip", face: { brow: -0.9, lid: 0, mouth: 0.6, smile: -0.8 } });
  shots.push({ id: "rules", a: T9, b: T10, still: 1.0, sounds: [{ t: 0.1, k: "step", g: 0.7 }, { t: 0.4, k: "step", g: 0.7 }, { t: 0.45, k: "tap", g: 0.8 }],
    cam: (_t, u) => WIDE2.push(0.12 * u), sun: { target: FIGHT, reach: 10 },
    cast: (t) => [on("mur", MURMILLO_GRILLE_D, m2.mur, t), on("ret", RETIARIUS_D, m2.ret, t), on("ref", REFEREE_D, ref, t)],
    things: (g, c, t, T, cam) => { crowd(g, STANDS, T, cam, 0.8); shieldMan(g, c.mur, cam, "raised", ["lowered", smooth((t - 0.6) / 0.4)], true); setDown(g, TRI(), "trident", ground, cam, -4);
      // (the stick, 1.1 m, held by its middle: its butt so far behind the rear hand that the hands are at its centre)
      pole(g, STICK_R(), c.ref, cam, "L", by(c.ref.at, c.ref.heading, 3, 0.3, 1.12), { back: 0.23, len: 1.1, name: "stick" }); } }); }

// 11. A BEATEN MAN RAISED A FINGER TO GIVE UP. The net man down on one knee, his trident on the sand, raises one finger; the sword
//     above him stops
{ const LOWB = lens(FIGHT[0], 1.25, FIGHT[2] + 4.9, 0, -1, -5, 54), { mur, ret } = pair(1.45); mur.stand(9); ret.stand(9);
  mur.actAt(-1, { ...usePose(GLADIUS, "raised", "R"), armL: SHIELD_ARM, lean: 6, head: [0, 8, 0] }, 10, { in: 0.01, handL: "grip", handR: "grip", face: { brow: -1, lid: 0.1, mouth: 0.5 } });
  ret.actAt(-1, { py: -0.5, lean: -8, armL: arm(30, 30, 70, 20), armR: arm(30, 30, 70, 20), head: [0, -10, 0] }, 10, { in: 0.01, handL: "open", handR: "open", face: { brow: 1, lid: 0.45, wide: 0.2, mouth: 0, smile: -0.3 } });
  const UP = say(W, "finger", T10) - T10 - 0.35;
  // (review of v1: raised in front of him, the arm hid half his face; out to the side, the finger shows against the wall)
  ret.actAt(UP, { armL: arm(80, 104, 172, 30) }, 9, { in: 0.3, antic: 0.1, over: 1.2, handL: "point", handR: "open", face: { brow: 1, lid: 0.5, wide: 0.1, mouth: 0, smile: -0.3 } });
  shots.push({ id: "finger", a: T10, b: T11, still: UP + 0.8, sounds: [{ t: 0.0, k: "shing", g: 0.6 }, { t: UP + 0.3, k: "tap", g: 0.4 }],
    cam: (_t, u) => LOWB.push(0.15 * u), sun: { target: FIGHT, reach: 10 },
    cast: (t) => [on("mur", MURMILLO_GRILLE_D, mur, t), on("ret", RETIARIUS_D, ret, t)],
    things: (g, c, t, T, cam) => { crowd(g, STANDS, T, cam, 0.9); shieldMan(g, c.mur, cam, "raised"); setDown(g, TRI(), "trident", ground, cam, -4); sandKick(g, T, cam, [FIGHT[0] + 0.5, 0, FIGHT[2] + 0.2], 0.5 - t * 0.3, 2); } }); }

// 12. AND MOST OF THE TIME, ... the sponsor in his box stands and waves his cloth, the crowd round him on its feet
{ const [bx, bz] = rim(Math.PI / 2, 0.9), BOXY = ARENA.wall + 0.7, sAt: V3 = [bx, BOXY, bz], V = lens(bx + 0.4, BOXY + 0.9, bz - 4.4, -0.06, 1, 9, 44), sh = V.toward(bx, bz, 0), sp = mover(SPONSOR_D, 1.76, bx, bz, sh); sp.stand(9);
  sp.actAt(-1, { ...usePose(MAPPA, "wave", "R"), head: [0, -4, 0] }, 10, { in: 0.01, handR: "grip", face: { brow: 0.6, smile: 0.6, mouth: 0.3 } });
  wag(sp, 0, 3, P({ ...usePose(MAPPA, "wave", "R") }), P({ armR: arm(150, 40, 170, 30) }), 0.32, { handR: "grip" });
  // the seats seen right behind the waved cloth are left empty (the back of his box): a face there was hidden by it (review of v1)
  const clothAt: V3 = [bx + 0.15, BOXY + 2.05, bz], cp = V.cam.pos, toCl = [clothAt[0] - cp[0], clothAt[1] - cp[1], clothAt[2] - cp[2]], cl = Math.hypot(toCl[0], toCl[1], toCl[2]);
  const FAR_SP = FAR.filter((f) => { const v = [f.at[0] - cp[0], f.at[1] + 1.5 - cp[1], f.at[2] - cp[2]], n = Math.hypot(v[0], v[1], v[2]); return (v[0] * toCl[0] + v[1] * toCl[1] + v[2] * toCl[2]) / (n * cl) < Math.cos((9 * Math.PI) / 180); });
  // and the man at the left edge whose face was always behind a cheering hand: nobody in the left eighth of the picture near the box
  const lensV = new THREE.PerspectiveCamera(V.cam.fov, 1080 / 1920, 0.1, 900); lensV.position.set(...V.cam.pos); lensV.lookAt(...V.cam.look); lensV.updateMatrixWorld(true);
  const FAR_SP2 = FAR_SP.filter((f) => { const q = new THREE.Vector3(f.at[0], f.at[1] + 1.5, f.at[2]).project(lensV); return !(q.x < -0.72 && Math.hypot(f.at[0] - bx, f.at[2] - bz) < 6); });
  // (the captions over the awning: lower down they lay over his hand with the cloth)
  shots.push({ id: "sponsor", capsTop: 260, a: T11, b: T12, still: 0.7, sounds: [{ t: 0.1, k: "flap", g: 0.7 }, { t: 0.42, k: "flap", g: 0.6 }],
    cam: (_t, u) => V.push(0.06 * u), sun: { target: sAt, reach: 6 },
    cast: (t) => [{ ...on("sp", SPONSOR_D, sp, t, BOXY), noShade: true }],
    things: (g, c, _t, T, cam) => { crowd(g, FAR_SP2, T, cam, 1); wield(g, CLOTH(), MAPPA, "wave", c.sp, "R", cam); flutter(CLOTH(), T); } }); }

// 13. ... HE WAS SPARED. The heavy man gives the net man his hand and pulls him up off his knee
{ const V = lens(FIGHT[0] + 0.1, 1.3, FIGHT[2] + 4.2, 0, -1, -4, 52), mur = mover(MURMILLO_GRILLE_D, 1.84, FIGHT[0] - 0.42, FIGHT[2], 55), ret = mover(RETIARIUS_D, 1.86, FIGHT[0] + 0.48, FIGHT[2] + 0.1, -55); mur.stand(9); ret.stand(9);
  const meet = (k: number): V3 => [FIGHT[0] + 0.05, 0.98 + 0.25 * k, FIGHT[2] + 0.12], ms = (k: number): Stand => ({ D: MURMILLO_GRILLE_D, at: [FIGHT[0] - 0.42, 0, FIGHT[2]], heading: 55, h: 1.84, cam: V.cam, pose: { lean: 10 - 6 * k } }), rs = (k: number): Stand => ({ D: RETIARIUS_D, at: [FIGHT[0] + 0.48, 0, FIGHT[2] + 0.1], heading: -55, h: 1.86, cam: V.cam, pose: { py: -0.5 + 0.5 * k, lean: -8 + 8 * k } });
  for (const k of [0, 0.5, 1]) { const t0 = 0.15 + k * 0.6; mur.actAt(k ? t0 : -1, { ...reach(ms(k), "R", meet(k)), lean: 10 - 6 * k }, 10, { in: k ? 0.3 : 0.01, handR: "grip", face: { brow: 0.3, smile: 0.4, mouth: 0 } });
    ret.actAt(k ? t0 : -1, { py: -0.5 + 0.5 * k, lean: -8 + 8 * k, ...reach(rs(k), "L", meet(k)) }, 10, { in: k ? 0.3 : 0.01, handL: "grip", face: { brow: 0.6, lid: 0.1, smile: 0.2 + 0.3 * k } }); }
  shots.push({ id: "pull", a: T12, b: T13, still: 0.75, sounds: [{ t: 0.3, k: "scuff", g: 0.6 }],
    cam: (_t, u) => V.push(0.08 * u), sun: { target: FIGHT, reach: 9 },
    cast: (t) => [on("mur", MURMILLO_GRILLE_D, mur, t), on("ret", RETIARIUS_D, ret, t)],
    things: (g, c, _t, T, cam) => { crowd(g, STANDS, T, cam, 1); handshake(c.mur, "R", c.ret, "L", cam, "hands"); } }); }

// 14. SO NO. MOST FIGHTS ENDED WITH BOTH MEN WALKING OUT. The two walk away from us toward the gate side by side, the net man's hand
//     on the heavy man's shoulder, flowers falling round them from the stands (both in the picture from the first frame)
{ const V = lens(9.4, 1.6, 4.6, 0.82, -0.57, -3, 50), H = (Math.atan2(0.82, -0.57) * 180) / Math.PI, [mx, mz] = V.spot(4.2, -0.4), [rx, rz] = V.spot(4.2, 0.4);
  const mur = mover(MURMILLO_GRILLE_D, 1.84, mx, mz, H), ret = mover(RETIARIUS_D, 1.86, rx, rz, H);
  for (const m of [mur, ret]) m.stand(0.1).walk(mt(m, 3.0), { step: 0.5, tau: 0.45 }).stand(9);
  const ms: Stand = { D: MURMILLO_GRILLE_D, at: [mx, 0, mz], heading: H, h: 1.84, cam: V.cam };
  // (G1, the body check: the sword in his outer hand, the left; in the right, on the net man's side, the blade lay over the net man's leg)
  mur.actAt(-1, { ...usePose(GLADIUS, "lowered", "L"), armR: arm(16, 12, 30, 8), head: [-16, 2, 0] }, 10, { in: 0.01, handL: "grip", handR: "relaxed", face: { brow: 0.4, smile: 0.6, lid: 0.2 } });
  const rs: Stand = { D: RETIARIUS_D, at: [rx, 0, rz], heading: H, h: 1.86, cam: V.cam }, sh = jointsOf(ms)("shR");
  ret.actAt(-1, { armR: arm(16, 12, 30, 8), ...reach(rs, "L", [sh[0], sh[1] + 0.04, sh[2]]), head: [16, 2, 0] }, 10, { in: 0.01, handL: "open", handR: "relaxed", face: { brow: 0.4, smile: 0.7, lid: 0.2 } });
  const [px, pz] = V.spot(5.5, 0);
  // (the captions over the arena wall at the top: lower down they lay over the two men's hands)
  shots.push({ id: "out", capsTop: 200, a: T13, b: T14, still: 1.6, sounds: mur.cues().filter((q) => q.k === "step").map((q) => ({ t: q.t, k: "step", g: 0.5 })),
    cam: (_t, u) => V.push(0.05 * u), sun: { target: [px, 0, pz], reach: 8 },
    cast: (t) => [on("mur", MURMILLO_GRILLE_D, mur, t), on("ret", RETIARIUS_D, ret, t)],
    things: (g, c, _t, T, cam) => { crowd(g, FAR, T, cam, 1); wield(g, GLAD(), GLADIUS, "lowered", c.mur, "L", cam); handOn(c.ret, "L", c.mur, "shR", cam, "shoulder"); petals(g, T, [px, 0, pz]); } }); }

// 15. ONE ARENA DOCTOR BOASTED THAT ... at his table in the school, pen to his scroll, pleased with himself
// (v4, the body check, regression row 2: holding the scroll up in one hand and writing on it with the other, his writing forearm lay
// behind the sheet and his fist in front of it, as Tacitus's hand went through the paper. Now he stands behind the table and writes
// on a sheet lying on it, his other hand flat on the sheet: the hands are on top of it and nothing passes through it)
{ const [tx, tz] = LUDUS_TABLE, dAt: V3 = [tx, 0, tz + 0.44], V = lens(tx - 0.25, 1.85, tz - 2.3, 0.08, 1, -16, 44), dh = V.toward(dAt[0], dAt[2], 8), doc = mover(DOCTOR_D, 1.72, dAt[0], dAt[2], dh); doc.stand(9);
  const ds: Stand = { D: DOCTOR_D, at: dAt, heading: dh, h: 1.72, cam: V.cam }, w = rightWay(ds), TOP = 0.797, SH: V3 = [tx, TOP, tz + 0.16];
  const WRITE = (k: number) => ({ ...reach(ds, "R", aside([SH[0], TOP + 0.05, SH[2] + 0.02], V.cam, w * (0.07 + 0.025 * k), 0)), ...reach(ds, "L", aside([SH[0], TOP + 0.03, SH[2] + 0.05], V.cam, -w * 0.15, 0)), lean: 22, head: [-18, 6, 0] as [number, number, number] });
  doc.actAt(-1, WRITE(0), 10, { in: 0.01, handL: "open", handR: "grip", face: { brow: 0.2, lid: 0.45, smile: 0.4 } });
  wag(doc, 0.15, 1.4, P(WRITE(1)), P(WRITE(-1)), 0.32, { handL: "open", handR: "grip" });
  doc.actAt(1.25, { ...WRITE(0), head: [-4, -6, 0] }, 9, { in: 0.25, antic: 0, over: 1.1, handL: "open", handR: "grip", face: { brow: 0.7, lid: 0.3, smile: 0.9 } });
  /** the sheet on the table, with lines of writing on it */
  const SHEET = once(() => { const g = group([mesh(box(0.42, 0.004, 0.3), "#eadcb8", { line: 0.5, shadow: false })]); for (let i = 0; i < 6; i++) g.add(mesh(box(0.3 - (i % 2) * 0.06, 0.002, 0.011), "#3a2a20", { at: [-0.02, 0.003, -0.11 + i * 0.04], shadow: false })); return g; });
  // (the captions over the awning at the top: lower down they lay over the doctor's chest)
  shots.push({ id: "doctor", capsTop: 140, a: T14, b: T15, still: 1.4, sounds: [{ t: 0.3, k: "scratch", g: 0.35 }, { t: 0.8, k: "scratch", g: 0.35 }],
    cam: (_t, u) => V.push(0.1 * u), sun: { target: dAt, reach: 6 },
    cast: (t) => [{ ...on("doc", DOCTOR_D, doc, t), noShade: true }],
    things: (g, c, _t, _T, cam) => { const tb = TABLE(); tb.position.set(tx, 0, tz - 0.05); g.add(tb); const sh = SHEET(); sh.position.set(SH[0], TOP + 0.002, SH[2]); g.add(sh); wield(g, PEN_O(), PEN, "write", c.doc, "R", cam, { d: 0.1 }); } }); }

// 16. ... UNDER HIS CARE, HARDLY ANY GLADIATORS DIED. Behind him in a row his patients, bandaged, show their muscles
// (Jesper's review of v3: the men lower and bigger in the picture. Three of them, close together, the lens near and low and looking
// up a little, so that they fill half its height from the feet up and the lower half is not empty sand)
// (v4, the body check: each flexed his right arm toward the next man, and the fist came up beside that man's face; their hanging
// fists met at their sides. Now the fists rest before their thighs, the two outer men flex the outer arm, away from the others, and
// the middle man shows his chest with both fists together before his belly; the lens a little further back, so that the outer arms
// stay in the picture)
{ const { x: LX, z: LZ } = LUDUS, CXp = LX - 1.43, V = lens(CXp, 0.95, LZ + 1.4 - 4.8, 0, 1, 9, 50), row: [Design, number][] = [[MURMILLO_BARE_D, 1.84], [SECUTOR_D, 1.72], [THRAEX_D, 1.78]];
  const men = row.map(([D, h], i) => { const x = CXp + (i - 1) * 0.66, z = LZ + 1.4 + (i % 2) * 0.12, hd = V.toward(x, z, (i - 1) * 8), m = mover(D, h, x, z, hd); m.stand(9);
    const st: Stand = { D, at: [x, 0, z], heading: hd, h, cam: V.cam }, fists = (y: number, f: number, s: number) => ({ ...reach(st, "L", by([x, 0, z], hd, -s, f, y)), ...reach(st, "R", by([x, 0, z], hd, s, f, y)) });
    m.actAt(-1, fists(0.82, 0.14, 0.13), 10, { in: 0.01, handL: "fist", handR: "fist", face: { brow: 0.2, lid: 0.2, smile: 0.5 } });
    // (facing the lens his right arm is on the picture's left: the man on the left flexes his right, the one on the right his left)
    const flex = i === 1 ? { ...fists(1.02, 0.24, 0.05), lean: 4 } : i === 0 ? { armL: arm(80, 40, 168, 10), lean: -3 } : { armR: arm(80, 40, 168, 10), lean: -3 };
    m.actAt(0.25 + 0.18 * i, flex, 9, { in: 0.3, antic: 0.15, over: 1.3, handL: "fist", handR: "fist", face: { brow: 0.5, lid: 0.1, smile: 0.9, mouth: 0.3 } });
    return { D, m, name: `p${i}` }; });
  // (the captions in the sky: lower down they lay over the men's hands)
  shots.push({ id: "patients", capsTop: 260, a: T15, b: T16, still: 2.0, sounds: men.map((_, i) => ({ t: 0.3 + 0.18 * i, k: "scuff", g: 0.3 })),
    cam: (_t, u) => V.push(0.08 * u), sun: { target: [CXp, 0, LZ + 1.5], reach: 5 },
    cast: (t) => men.map((q) => ({ ...on(q.name, q.D, q.m, t), noShade: true })) }); }

// 17. "RELAX. THEY'LL PROBABLY BE FINE." At last Sir Digsworth has his hands down; she says it and he reaches for her olives. Then down
//     on the sand the next pair clash (the sound), and his hands go back over his eyes while she eats on (the script's last picture)
{ const sir = mover(SIR_D, 1.8, SIR.at[0], SIR.at[2], SIR.heading - 8), wh = WOMAN.heading - 12, wom = mover(ROMAN_WOMAN_OLIVES_D, 1.62, WOMAN.at[0], WOMAN.at[2], wh); sir.stand(9); wom.stand(9);
  const ss: Stand = { D: SIR_D, at: SIR.at, heading: SIR.heading - 8, h: 1.8, cam: TWO.cam }, CLASH = 1.05;
  const ws: Stand = { D: ROMAN_WOMAN_OLIVES_D, at: WOMAN.at, heading: wh, h: 1.62, cam: TWO.cam }, bh = nearHand(wh, TWO.cam), EAT = eating(ws), bowlAt = jointsOf({ ...ws, pose: EAT })(`wr${bh}` as "wrL");
  // his hand on her side reaches toward the bowl (it stops short of it: the clash comes first)
  const toHer = Math.sign((WOMAN.at[0] - SIR.at[0]) * aside([0, 0, 0], TWO.cam, 1)[0] + (WOMAN.at[2] - SIR.at[2]) * aside([0, 0, 0], TWO.cam, 1)[2]) || 1, sj = jointsOf(ss);
  const herSide: "L" | "R" = Math.sign((sj("shR")[0] - sj("shL")[0]) * aside([0, 0, 0], TWO.cam, 1)[0] + (sj("shR")[2] - sj("shL")[2]) * aside([0, 0, 0], TWO.cam, 1)[2]) === toHer ? "R" : "L";
  // (his hands at his waist, above the parapet: hanging, the parapet cut them off; his reach stops short of her arm and a little nearer
  // the lens, at the height of the bowl's rim: to the bowl itself his hand went into her arm and over her hand, v4's body check)
  sir.actAt(-1, { ...reach(ss, "L", by(SIR.at, SIR.heading - 8, -0.08, 0.2, 1.04)), ...reach(ss, "R", by(SIR.at, SIR.heading - 8, 0.08, 0.2, 1.04)), head: [30, -2, 0] }, 10, { in: 0.01, handL: "relaxed", handR: "relaxed", face: { brow: 0.6, lid: 0.1, smile: 0.3, wide: 0.2 } });
  sir.actAt(0.45, { ...reach(ss, herSide, near(aside([bowlAt[0], bowlAt[1] - 0.07, bowlAt[2]], TWO.cam, -toHer * 0.4, 0), TWO.cam, 0.26)), head: [30, 4, 0] }, 10, { in: 0.35, antic: 0, over: 1.1, ...(herSide === "L" ? { handL: "open" as const } : { handR: "open" as const }), face: { brow: 0.6, lid: 0.1, smile: 0.5 } });
  sir.actAt(CLASH, { ...reach(ss, "L", by(SIR.at, SIR.heading - 8, -0.07, 0.17, 1.56)), ...reach(ss, "R", by(SIR.at, SIR.heading - 8, 0.07, 0.17, 1.56)), head: [0, 4, 0] }, 10, { in: 0.14, antic: 0.1, over: 1.3, handL: "open", handR: "open", face: { brow: 1, lid: 0, wide: 1, mouth: 0.4 } });
  wag(sir, CLASH + 0.15, 1.5, P({ lean: 2, roll: 1.5 }), P({ lean: -1, roll: -1.5 }), 0.13);
  wom.actAt(-1, { ...EAT, head: [-30, 2, 0] }, 10, { in: 0.01, handL: "grip", handR: "grip", face: { lid: 0.4, brow: 0.3, smile: 0.5 } });
  // (the captions at the top over empty seats, the crowd behind them spread out, as in the guess)
  shots.push({ id: "relax", capsTop: 200, a: T16, b: T17, still: 0.8, sounds: [{ t: CLASH - 0.05, k: "thud", g: 0.7, p: -0.5 }, { t: CLASH, k: "ting", g: 0.6, p: -0.5 }],
    cam: (_t, u) => TWO.push(0.1 * u), sun: { target: SIR.at, reach: 7 },
    cast: (t, T) => [on("sir", SIR_D, sir, t, ARENA.wall), on("wom", ROMAN_WOMAN_OLIVES_D, wom, t, ARENA.wall, { talk: talk(W, T, ["relax"]) })],
    things: (g, c, _t, T, cam) => { crowd(g, TWO_FANS, T, cam, 0.9); wield(g, OLIVES(), BOWL, "rim", c.wom, bh, cam); } }); }

// 18. The coda: the fight a moment before the first frame; the lens runs on into it, so that the film loops
{ const CODA = HOOK.b - (END - T17); shots.push({ id: "loop", a: T17, b: END, still: 0.4, sounds: [{ t: 0.3, k: "whoosh", g: 0.5 }],
    cam: (t) => HOOK.cam(t + CODA, (t + CODA) / (HOOK.b - HOOK.a)), sun: HOOK.sun, cast: (t, T) => HOOK.cast(t + CODA, T), things: (g, c, t, T, cam) => HOOK.things?.(g, c, t + CODA, T, cam) }); }

/** the sponsor's cloth: six slices of white linen hanging from the corner in his fist, rippling as it is waved, with a red hem */
/** the sponsor's cloth: one piece of white linen with a red hem, its top corner in his fist (the group's origin), hanging down and out
 *  to the side (local x out, y down). A wave runs out from the corner as he waves it, so the cloth billows from his hand; its folds
 *  show as lighter and darker bands, and a dark rim behind it is its outline (the geometry changes every frame, so the kit's outline
 *  hull, made once, could not follow it). Review of v2: six strips hung beside the fist like slips of paper */
const CW = 0.42, CH = 0.52, NU = 9, VS = [0, 0.11, 0.22, 0.33, 0.44, 0.55, 0.66, 0.77, 0.88, 0.925, 0.93, 1];
const clothGeo = () => { const g = new THREE.BufferGeometry(), pos: number[] = [], col: number[] = [], idx: number[] = [];
  VS.forEach((v) => { for (let i = 0; i <= NU; i++) { pos.push((i / NU) * CW, -v * CH, 0); col.push(1, 1, 1); } });
  for (let r = 0; r < VS.length - 1; r++) for (let i = 0; i < NU; i++) { const a = r * (NU + 1) + i, b = a + 1, c = a + NU + 1, d = c + 1; idx.push(a, c, b, b, c, d); }
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx); return g; };
const CLOTH = once(() => { const o = new THREE.Group(), face = new THREE.Mesh(clothGeo(), new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide })), rim = new THREE.Mesh(clothGeo(), new THREE.MeshBasicMaterial({ color: "#2a1c14", side: THREE.DoubleSide, depthWrite: false }));
  // (the rim is drawn first and writes no depth, so the face always lies over it, whichever side of the cloth is toward us)
  face.name = "cloth"; rim.name = "cloth-rim"; rim.renderOrder = 1; face.renderOrder = 2; o.add(rim, face); return o; });
/** the cloth's shape at time T: each point's distance from the corner sets how far the wave has carried it; the hem stays red */
const flutter = (o: THREE.Object3D, T: number) => { const [rim, face] = o.children as THREE.Mesh[];
  for (const [m, grow] of [[face, 0], [rim, 0.012]] as [THREE.Mesh, number][]) { const p = m.geometry.getAttribute("position") as THREE.BufferAttribute, c = m.geometry.getAttribute("color") as THREE.BufferAttribute;
    VS.forEach((v, r) => { for (let i = 0; i <= NU; i++) { const u = i / NU, k = r * (NU + 1) + i, d = Math.hypot(u, v) / Math.SQRT2, ph = T * 9 - d * 5.5;
      // (held by a corner it droops away from the hand; the wave lifts and drops the free edges, and its folds shade the linen)
      const x = u * CW + grow * (u - 0.5) * 2 + 0.03 * d * Math.sin(ph * 0.7 + 2), y = -v * CH - grow * (v - 0.5) * 2 - 0.15 * u * (1 - 0.3 * v) + 0.065 * d * Math.sin(ph + 0.6), z = 0.09 * d * Math.sin(ph);
      p.setXYZ(k, x, y, z); if (m === face) { const hem = v >= 0.93, shade = 0.78 + 0.22 * Math.cos(ph); c.setXYZ(k, hem ? 0.72 * shade : shade, hem ? 0.1 * shade : shade, hem ? 0.1 * shade : shade); } } });
    p.needsUpdate = true; if (m === face) c.needsUpdate = true; m.geometry.computeBoundingSphere(); m.geometry.computeBoundingBox(); } };
/** a few flowers thrown from the stands, falling round a point and turning as they fall */
function petals(g: THREE.Group, T: number, p: V3) { for (let i = 0; i < 14; i++) { const u = (T * 0.45 + i * 0.137) % 1, x = p[0] + Math.sin(i * 2.3) * 1.6, z = p[2] + Math.cos(i * 1.7) * 1.2, y = 3.4 - 3.3 * u;
    const f = mesh(box(0.07, 0.012, 0.07), ["#e8475a", "#f6c52e", "#ffffff", "#c04a9a"][i % 4], { at: [x + 0.2 * Math.sin(T * 3 + i), y, z], rot: [T * 3 + i, T * 2 + i * 0.7, 0], line: 0.3, shadow: false }); g.add(f); } }

export const GLADIATORS_DEATH: Film = {
  id: "gladiators-death", fps: 30, seconds: END, sky: "#9fd6ff", world: arenaWorld, shots, words: W,
  // (the question in the top fifth, over the sky and the top of the stands, as in opening a: in the middle it lay over the shield and both
  // men's chests; the review of round 2, for every line of text in v4)
  hook: { text: ["DID GLADIATORS", "FIGHT TO", "THE DEATH?"], a: 0, b: T2, size: 76, top: 110 },
  beds: [{ k: "crowd", a: 0, b: T5, g: 0.8 }, { k: "wind", a: 0, b: END, g: 0.25 }, { k: "crowd", a: T9, b: T14, g: 0.9 }, { k: "crowd", a: T16, b: END, g: 0.8 }], audio: "craft/gladiators-death.wav",
  thumbs: [
    { T: 0.3, words: ["WHO WALKS", "OUT?"], y: 0.7, size: 150 },
    { T: (T4 + T5a) / 2, words: ["9/10", "SURVIVED"], y: 0.72, size: 130 },
    { T: T10 + 1.8, words: ["ONE FINGER", "UP"], y: 0.72, size: 120 },
  ],
};
