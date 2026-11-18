// The hook lab for "Were animals really put on trial?" (the length test, granskning/animal-trials/manus.md, "Hook lab"): seconds 0-5
// built three ways as small clips, so that the strongest opening is chosen before the film is built (DAILY-RULES, "The hook lab").
//   a. the question over the court in session: the judge's gavel comes down while the weevils' lawyer presents an empty dock; then the
//      gallery points at it, and the answer begins on the vines ("Yes. Weevils were eating a village's vines,")
//   b. the claim over the vineyard: a villager holds out the village's complaint among vines crawling with weevils
//   c. the lawyer: he bows to the empty dock, the weevils on the vines through the window behind it
// b and c then ask the question over the court and end on Sir Digsworth's "Yes.". The gavel is the sound on frame one of all three.
import * as THREE from "three";
import { Film, Shot, V3, Word, Cam, talk, smooth } from "../stage/film";
import { mover, arm, wag } from "../stage/acting";
import { lens, once, noShade } from "../stage/staging";
import { GAVEL, COMPLAINT, wield, usePose, reach, Stand } from "../stage/grips";
import { stJulienWorld, SJ, inCourt, vineAt, vineLeaf, weevilOn, LEAF_BITES } from "../world/stjulien";
import { gavel, complaintRoll } from "../world/props";
import { SIR_D, VILLAGER_D, VILLAGER_WOMAN_D, VILLAGER_OLD_D, VILLAGER_WOMAN2_D, OFFICIAL_D, ADVOCATE_D } from "../looks";
import type { Design } from "../designs/common";
import type { Pose } from "../rig";
import { on, say } from "./gladiatorsHooks";
import { SIT } from "./gripSheet";
import wa from "../../../voice/animal-hook-a/words.json";
import wb from "../../../voice/animal-hook-b/words.json";
import lb from "../../../voice/animal-hook-b/lines.json";
import wc from "../../../voice/animal-hook-c/words.json";
import lc from "../../../voice/animal-hook-c/lines.json";

type Lines = Record<string, { id: string; a: number; b: number }>;
const byId = (l: unknown) => Object.fromEntries((l as { id: string; a: number; b: number }[]).map((x) => [x.id, x])) as Lines;
const P = (o: Partial<Pose>) => o;
const deg = (r: number) => (r * 180) / Math.PI;
/** the heading (degrees) from one point toward another */
export const toward = (a: V3, b: V3) => deg(Math.atan2(b[0] - a[0], b[2] - a[2]));
/** a point `f` metres in front of a figure at `at` facing `heading`, `r` to his right, `up` high */
export const ahead = (at: V3, heading: number, f: number, r: number, up: number): V3 => { const h = (heading * Math.PI) / 180; return [at[0] + Math.sin(h) * f - Math.cos(h) * r, at[1] + up, at[2] + Math.cos(h) * f + Math.sin(h) * r]; };
const FL = SJ.court.at[1];

// ---------------- the court: where everyone stands ----------------
/** the judge on his dais (his floor), the lawyer beside the empty dock, the dock's seat, the gallery (Sir at its near end, the old man
 *  seated beside him, the woman standing up at the far end) */
export const JUDGE: V3 = inCourt([SJ.court.judge[0], SJ.court.dais, SJ.court.judge[2]]), LAWYER: V3 = inCourt([-0.62, 0, -0.62]), DOCK: V3 = inCourt([SJ.court.dock[0], 0.5, SJ.court.dock[2]]);
// (the seated men at the bench's front edge: a seated card's legs lie in its own plane, so that further back on the seat his shins went down
// through its board, the body check)
export const SIR_AT: V3 = inCourt([-3.2, 0, 2.0]), OLD_AT: V3 = inCourt([-3.1, 0, 1.3]), WOMAN_AT: V3 = inCourt([-3.0, 0, 0.8]);
const GAVEL_O = once(() => noShade(gavel())), ROLL_O = once(() => noShade(complaintRoll()));
const COURT_SUN = { target: inCourt([0, 0, -1]), reach: 6 };

/** the judge striking: on the block at `hits` (seconds into the shot), the gavel raised between them; his head bowed a little, frowning */
const judge = (hits: number[]) => {
  const m = mover(OFFICIAL_D, 1.74, JUDGE[0], JUDGE[2], 0); m.stand(9);
  m.actAt(-1, { ...usePose(GAVEL, "strike", "R"), armL: arm(14, 10, 40, 8), head: [-8, 8, 0] }, 10, { in: 0.01, handR: "grip", handL: "relaxed", face: { brow: -0.9, lid: 0.15, mouth: 0.4, smile: -0.5 } });
  for (let i = 1; i < hits.length; i++) m.actAt(hits[i] - 0.5, { ...usePose(GAVEL, "raised", "R"), head: [-8, 2, 0] }, 0.3, { in: 0.2, out: 0.12, antic: 0, face: { brow: -1, lid: 0.05, mouth: 0.6, smile: -0.5 } });
  /** how far the gavel is raised at t (0 = on the block) */
  const up = (t: number) => hits.slice(1).reduce((k, h) => Math.max(k, smooth((t - (h - 0.5)) / 0.2) * (1 - smooth((t - (h - 0.12)) / 0.12))), 0);
  return { m, up };
};
/** the lawyer beside the empty dock, presenting it to the court with his left hand, his head turned toward the judge */
const lawyer = (cam: Cam, at: V3 = LAWYER, armR = arm(16, -6, 96, -58)) => {
  const H = 8, m = mover(ADVOCATE_D, 1.8, at[0], at[2], H); m.stand(9);
  const s: Stand = { D: ADVOCATE_D, at, heading: H, h: 1.8, cam };
  m.actAt(-1, { ...reach(s, "L", ahead(at, H, 0.38, -0.55, 1.18)), armR, head: [-24, 2, 0], lean: 4 }, 10, { in: 0.01, handL: "open", handR: "relaxed", face: { brow: 0.7, lid: 0.1, mouth: 0.3, smile: 0.2 } });
  wag(m, 0.2, 9, P({ head: [-26, 2, 0] }), P({ head: [-20, 0, 0] }), 0.45, { handL: "open", handR: "relaxed", face: { brow: 0.7, lid: 0.1, mouth: 0.3, smile: 0.2 } });
  return m;
};
/** the court in session, from the gallery's end: the judge's gavel comes down at `hits`, the lawyer presents the empty dock */
export const WIDE = (() => { const p = inCourt([0.25, 2.3, 3.0]), q = inCourt([0.15, 1.1, -1.3]), d = Math.hypot(q[0] - p[0], q[2] - p[2]);
  return lens(p[0], p[1], p[2], (q[0] - p[0]) / d, (q[2] - p[2]) / d, -21, 60); })();
export const courtShot = (id: string, a0: number, b0: number, hits: number[]): Shot => {
  const J = judge(hits), L = lawyer(WIDE.cam);
  return { id, a: a0, b: b0, still: Math.min(0.4, (b0 - a0) / 2), sounds: hits.map((t) => ({ t, k: "gavel", g: 1.0, p: -0.3 })),
    cam: (_t, u) => WIDE.push(0.22 * u), sun: COURT_SUN,
    cast: (t) => [on("judge", OFFICIAL_D, J.m, t, FL + SJ.court.dais), on("lawyer", ADVOCATE_D, L, t, FL)],
    things: (g, c, t, _T, cam) => { const k = J.up(t); wield(g, GAVEL_O(), GAVEL, "strike", c.judge, "R", cam, k > 0.001 ? { blend: ["raised", k] } : {}); } };
};

/** (the review's choice of opening b, change 1) the court close: the lawyer at the near end of the empty dock, presenting it with his
 *  open hand, the judge with his gavel on the dais behind them, the three filling the picture's height and no empty floor below them */
export const LAWYER_C: V3 = inCourt([-0.2, 0, -0.42]);
export const CLOSE = (() => { const p = inCourt([0.85, 1.42, 2.4]), q = inCourt([-0.05, 1.25, -1.2]), d = Math.hypot(q[0] - p[0], q[2] - p[2]);
  return lens(p[0], p[1], p[2], (q[0] - p[0]) / d, (q[2] - p[2]) / d, -6, 58); })();
export const courtClose = (id: string, a0: number, b0: number, hits: number[]): Shot => {
  const J = judge(hits), L = lawyer(CLOSE.cam, LAWYER_C, arm(8, -4, 128, -62));      // (his right hand on his chest: across his belly the dock's rail came over it)
  return { id, a: a0, b: b0, still: Math.min(0.4, (b0 - a0) / 2), capsTop: 150, sounds: hits.map((t) => ({ t, k: "gavel", g: 1.0, p: -0.3 })),
    cam: (_t, u) => CLOSE.push(0.03 * u), sun: COURT_SUN,
    cast: (t) => [on("judge", OFFICIAL_D, J.m, t, FL + SJ.court.dais), on("lawyer", ADVOCATE_D, L, t, FL)],
    things: (g, c, t, _T, cam) => { const k = J.up(t); wield(g, GAVEL_O(), GAVEL, "strike", c.judge, "R", cam, k > 0.001 ? { blend: ["raised", k] } : {}); } };
};

// ---------------- the gallery ----------------
const GAL = (() => { const p = inCourt([-0.6, 1.55, 3.0]), q = inCourt([-3.4, 1.05, 1.38]), d = Math.hypot(q[0] - p[0], q[2] - p[2]);
  return lens(p[0], p[1], p[2], (q[0] - p[0]) / d, (q[2] - p[2]) / d, -9, 60); })();
// (change 2: nearer and lower, so that Sir and the man beside him fill the picture and no empty wall stands above them)
const SIRC = (() => { const p = inCourt([-1.8, 1.25, 2.8]), q = inCourt([-3.3, 0, 1.45]), d = Math.hypot(q[0] - p[0], q[2] - p[2]);
  return lens(p[0], p[1], p[2], (q[0] - p[0]) / d, (q[2] - p[2]) / d, -6, 64); })();
const seated = (D: Design, h: number, at: V3, heading: number) => { const m = mover(D, h, at[0], at[2], heading); m.stand(9); return m; };
/** a seated figure's pose, with arms and head over it */
const sitting = (o: Partial<Pose>) => ({ ...SIT, ...o });
/** the gallery pointing at the dock (off the picture's right): the woman standing with her fist up, the old man seated pointing, Sir
 *  turning from the dock to the lens with his hand up, palm open, as he asks the question (`words` = the line ids he speaks) */
export const galleryShot = (id: string, a0: number, b0: number, W: Word[], words: string[]): Shot => {
  const toDock = (at: V3) => toward(at, DOCK), H = 90;
  const wom = mover(VILLAGER_WOMAN2_D, 1.6, WOMAN_AT[0], WOMAN_AT[2], toDock(WOMAN_AT) - 10); wom.stand(9);
  wom.actAt(-1, { armL: arm(24, 46, 20, -40), armR: arm(24, 46, 20, -40), lean: -3, head: [6, -4, 0] }, 10, { in: 0.01, handR: "fist", handL: "fist", face: { brow: -1, lid: 0, mouth: 0.5, smile: -0.7 } });
  wag(wom, 0, 9, P({ head: [14, -4, 3] }), P({ head: [-2, -4, -3] }), 0.24, { handR: "fist", handL: "fist", face: { brow: -1, lid: 0, mouth: 0.5, smile: -0.7 } });
  const old = seated(VILLAGER_OLD_D, 1.7, OLD_AT, H), os: Stand = { D: VILLAGER_OLD_D, at: OLD_AT, heading: H, h: 1.7, cam: GAL.cam, pose: SIT };
  old.actAt(-1, sitting({ ...reach(os, "L", ahead(OLD_AT, H, 0.66, -0.3, 1.0)), armR: arm(30, 8, 70, 6), lean: 10, head: [-6, -4, 0] }), 10, { in: 0.01, handL: "point", handR: "relaxed", face: { brow: -0.6, lid: 0.1, mouth: 0.5, smile: -0.4 } });
  const sir = seated(SIR_D, 1.8, SIR_AT, H), ss: Stand = { D: SIR_D, at: SIR_AT, heading: H, h: 1.8, cam: GAL.cam, pose: SIT };
  const tq = say(W, "really") - a0, turn = deg(Math.atan2(GAL.cam.pos[0] - SIR_AT[0], GAL.cam.pos[2] - SIR_AT[2])) - H;
  sir.actAt(-1, sitting({ armR: arm(20, 10, 60, 8), armL: arm(20, 10, 60, 8), head: [4, -2, 0], lean: 6 }), 10, { in: 0.01, handR: "relaxed", handL: "relaxed", face: { brow: 0.6, lid: 0.2, mouth: 0.2 } });
  sir.actAt(Math.max(0.05, tq - 0.25), sitting({ ...reach(ss, "R", ahead(SIR_AT, H, 0.28, 0.34, 0.84)), armL: arm(20, 10, 60, 8), head: [turn, -4, 0], lean: 2 }), 10, { in: 0.3, antic: 0, over: 1.1, handR: "open", handL: "relaxed", face: { brow: 1, lid: 0, wide: 0.3, smile: 0.3 } });
  return { id, a: a0, b: b0, still: (b0 - a0) * 0.6, sounds: [{ t: 0.1, k: "scuff", g: 0.4 }],
    cam: (_t, u) => GAL.push(0.1 * u), sun: { target: OLD_AT, reach: 5 },
    cast: (t, T) => [on("wom", VILLAGER_WOMAN2_D, wom, t, FL), on("old", VILLAGER_OLD_D, old, t, FL), on("sir", SIR_D, sir, t, FL, { talk: talk(W, T, words) })] };
};
/** Sir Digsworth close in the gallery, turned to the lens, finishing the question with his palm up and nodding firmly on "Yes." */
export const yesShot = (id: string, a0: number, b0: number, W: Word[], words: string[]): Shot => {
  const H = 90, turn = deg(Math.atan2(SIRC.cam.pos[0] - SIR_AT[0], SIRC.cam.pos[2] - SIR_AT[2])) - H, ty = say(W, "Yes") - a0;
  const sir = seated(SIR_D, 1.8, SIR_AT, H), ss: Stand = { D: SIR_D, at: SIR_AT, heading: H, h: 1.8, cam: SIRC.cam, pose: SIT };
  const PALM = sitting({ ...reach(ss, "R", ahead(SIR_AT, H, 0.28, 0.34, 0.84)), armL: arm(20, 10, 60, 8), head: [turn, -4, 0], lean: 2 });
  sir.actAt(-1, PALM, 10, { in: 0.01, handR: "open", handL: "relaxed", face: { brow: 1, lid: 0, wide: 0.3, smile: 0.3 } });
  sir.actAt(ty - 0.12, sitting({ armR: arm(24, 12, 70, 10), armL: arm(20, 10, 60, 8), head: [turn, 14, 0], lean: 6 }), 0.16, { in: 0.1, out: 0.16, antic: 0, handR: "relaxed", handL: "relaxed", face: { brow: 0.4, lid: 0.3, smile: 0.8 } });
  sir.actAt(ty + 0.3, sitting({ armR: arm(24, 12, 70, 10), armL: arm(20, 10, 60, 8), head: [turn, -2, 0], lean: 2 }), 10, { in: 0.2, handR: "relaxed", handL: "relaxed", face: { brow: 0.6, lid: 0.2, smile: 0.7 } });
  const old = seated(VILLAGER_OLD_D, 1.7, OLD_AT, H);
  old.actAt(-1, sitting({ armL: arm(30, 8, 70, 6), armR: arm(30, 8, 70, 6), lean: 8, head: [-10, -2, 0] }), 10, { in: 0.01, handR: "relaxed", handL: "relaxed", face: { brow: -0.4, lid: 0.2, smile: -0.2 } });
  return { id, a: a0, b: b0, still: Math.max(0.1, ty + 0.1), capsTop: 150, sounds: [],
    cam: (_t, u) => SIRC.push(0.08 * u), sun: { target: SIR_AT, reach: 4 },
    cast: (t, T) => [on("old", VILLAGER_OLD_D, old, t, FL), on("sir", SIR_D, sir, t, FL, { talk: talk(W, T, words) })] };
};

// ---------------- the lawyer's bow (opening c) ----------------
const BOW = (() => { const p = inCourt([0.0, 1.75, 3.0]), q = inCourt([-0.2, 1.3, -1.5]), d = Math.hypot(q[0] - p[0], q[2] - p[2]);
  return lens(p[0], p[1], p[2], (q[0] - p[0]) / d, (q[2] - p[2]) / d, -15, 52); })();
/** deep in his bow toward the empty dock on frame one, seen from the side so that the bow reads, his head turned to the lens: the near
 *  (right) hand on his chest, the far arm swept out low toward the dock; he rises at `rise`, the far hand presenting the dock */
const bowShot = (id: string, a0: number, b0: number, rise: number): Shot => {
  const H = toward(LAWYER, DOCK) - 6, m = mover(ADVOCATE_D, 1.8, LAWYER[0], LAWYER[2], H); m.stand(9);
  const s: Stand = { D: ADVOCATE_D, at: LAWYER, heading: H, h: 1.8, cam: BOW.cam };
  m.actAt(-1, { lean: 48, armR: arm(20, -8, 104, -62), armL: arm(60, 16, 56, 24), head: [-40, -14, 0] }, 10, { in: 0.01, handL: "open", handR: "relaxed", face: { brow: 0.8, lid: 0.3, smile: 0.4 } });
  m.actAt(rise, { ...reach(s, "L", ahead(LAWYER, H, 0.6, -0.1, 1.1)), armR: arm(16, -6, 96, -58), head: [-38, 0, 0], lean: 4 }, 10, { in: 0.4, antic: 0, over: 1.05, handL: "open", handR: "relaxed", face: { brow: 0.8, lid: 0.1, mouth: 0.3, smile: 0.3 } });
  return { id, a: a0, b: b0, still: 0.3, sounds: [{ t: 0.0, k: "gavel", g: 0.9, p: -0.5 }, { t: rise + 0.1, k: "scuff", g: 0.5 }],
    cam: (_t, u) => BOW.push(0.12 * u), sun: COURT_SUN,
    cast: (t) => [on("lawyer", ADVOCATE_D, m, t, FL)] };
};

// ---------------- the vineyard ----------------
/** the aisle between rows i and i+1 of the vineyard at position u along it */
const aisle = (i: number, u: number): V3 => { const p = vineAt(i, u); return [p[0], 0, p[2] + SJ.vine.gap / 2]; };
/** b: the villager in the aisle serving the village's complaint on the weevils: he holds the roll out at a vine beside him, whose big
 *  leaves crawl with chewing weevils, and jabs it at them on "sued" */
const complaintShot = (id: string, a0: number, b0: number, W: Word[]): Shot => {
  const at = aisle(1, 0.62), V = lens(at[0] + 2.6, 1.6, at[2] + 0.22, -1, -0.02, -5, 46), H = toward(at, V.cam.pos);
  const m = mover(VILLAGER_D, 1.76, at[0], at[2], H); m.stand(9);
  const ts = say(W, "sued");
  m.actAt(-1, { ...usePose(COMPLAINT, "show", "R"), armL: arm(24, 46, 20, -40), lean: 5, head: [-14, 2, 0] }, 10, { in: 0.01, handR: "grip", handL: "fist", face: { brow: -1, lid: 0, mouth: 0.5, smile: -0.6 } });
  wag(m, Math.max(0, ts - 0.15), 0.75, P({ lean: 11, head: [-16, 4, 0] }), P({ lean: 4, head: [-12, 0, 0] }), 0.19, { handR: "grip", handL: "fist", face: { brow: -1, lid: 0, mouth: 0.6, smile: -0.6 } });
  const LA: V3 = [at[0] + 0.3, 1.27, at[2] + 0.5];
  const leaves: Leaf[] = [{ at: LA, R: 0.17, seed: 11, bites: 3, rot: [-0.1, -0.25, 0.1] }, { at: [LA[0] - 0.12, LA[1] - 0.22, LA[2] + 0.1], R: 0.14, seed: 13, bites: 2, rot: [-0.25, -0.1, -0.3] }];
  return { id, a: a0, b: b0, still: 0.4, sounds: [{ t: 0.0, k: "gavel", g: 1.0 }, { t: 0.02, k: "paper", g: 0.8 }, { t: Math.max(0.1, ts - 0.1), k: "paper", g: 0.6 }, { t: 0.3, k: "munch", g: 0.7, dur: 1.4, p: 0.5 }],
    cam: (_t, u) => V.push(0.2 * u), sun: { target: at, reach: 5 },
    cast: (t) => [on("v", VILLAGER_D, m, t)],
    things: (g, c, t, _T, cam) => { wield(g, ROLL_O(), COMPLAINT, "show", c.v, "R", cam); leafCluster(g, leaves, Math.PI / 2, t, 1.25); } };
};
/** big vine leaves with weevils on them, added to `g` at time t: each leaf at `at`, turned `rot` (its face toward +z before `yaw`); on
 *  the first leaf two weevils chew at the holes they ate (snouts toward the holes' middles, heads dipping in turn) and one walks across;
 *  on the second, one more chews */
type Leaf = { at: V3; R: number; seed: number; bites: number; rot: [number, number, number] };
const leafCluster = (g: THREE.Group, leaves: Leaf[], yaw: number, t: number, s = 1.3) => { for (const [i, L] of leaves.entries()) {
  const o = new THREE.Group(); o.position.set(...L.at); o.rotation.set(L.rot[0], L.rot[1] + yaw, L.rot[2]); o.add(vineLeaf(L.R, L.seed, L.bites, i ? "#4f8f3a" : "#5fa246")); g.add(o);
  const up = new THREE.Vector3(0, 0, 1), bites = LEAF_BITES(L.R, L.seed, L.bites);
  const chew = (b: number, ph: number) => { const [x, y, h] = bites[b], a = 2.3 + ph, p: V3 = [x + Math.cos(a) * h * 1.25, y + Math.sin(a) * h, 0.002];
    o.add(weevilOn(p, up, Math.atan2(y - p[1], x - p[0]), s, 0.35 * (0.5 + 0.5 * Math.sin(t * 20 + ph * 7)))); };
  if (i === 0) { chew(0, 0); chew(Math.min(2, L.bites - 1), 1.4); const u = Math.min(1, t / 1.6), p: V3 = [-0.09 + 0.13 * u, -0.06 + 0.07 * u, 0.002]; o.add(weevilOn(p, up, Math.atan2(0.07, 0.13) + 0.15 * Math.sin(t * 9), s)); }
  if (i === 1) chew(1, 0.7); } };
/** a: weevils eating a vine's leaves, close: three big leaves at the end of a row, the lens out in the open beyond it */
const LEAF_AT = (() => { const p = vineAt(1, 1); return [p[0] + 0.78, 0.98, p[2] + 0.02] as V3; })();
const leafClose = (id: string, a0: number, b0: number): Shot => {
  const V = lens(LEAF_AT[0] + 1.3, LEAF_AT[1] + 0.06, LEAF_AT[2] + 0.06, -1, -0.04, -3, 40);
  const leaves: Leaf[] = [
    { at: [LEAF_AT[0], LEAF_AT[1], LEAF_AT[2]], R: 0.19, seed: 3, bites: 3, rot: [-0.15, 0.1, 0.12] },
    { at: [LEAF_AT[0] - 0.08, LEAF_AT[1] + 0.2, LEAF_AT[2] + 0.25], R: 0.15, seed: 5, bites: 2, rot: [-0.3, 0.35, -0.3] },
    { at: [LEAF_AT[0] - 0.05, LEAF_AT[1] - 0.17, LEAF_AT[2] - 0.27], R: 0.16, seed: 8, bites: 2, rot: [-0.05, -0.4, 0.4] }];
  return { id, a: a0, b: b0, still: 0.5, sounds: [{ t: 0.05, k: "munch", g: 1.0, dur: 0.7 }, { t: 0.85, k: "munch", g: 0.9, dur: 0.6, p: 0.3 }],
    cam: (_t, u) => V.push(0.05 * u), sun: { target: LEAF_AT, reach: 2 },
    cast: () => [],
    things: (g, _c, t) => leafCluster(g, leaves, Math.PI / 2, t) };
};
/** a: the village's vines, wide: a man and a woman stopped in the aisle, staring at the weevils on the vines beside them */
const vinesWide = (id: string, a0: number, b0: number): Shot => {
  const man = aisle(2, 0.5), wo = aisle(2, 0.4), V = lens(man[0] + 3.0, 1.7, man[2], -1, 0, -6, 52);
  const m1 = mover(VILLAGER_D, 1.76, man[0], man[2] - 0.24, 135), m2 = mover(VILLAGER_WOMAN_D, 1.64, wo[0], wo[2] + 0.26, 45); m1.stand(9); m2.stand(9);
  m1.actAt(-1, { armL: arm(24, 46, 20, -40), armR: arm(24, 46, 20, -40), lean: 6, head: [-10, 10, 0] }, 10, { in: 0.01, handL: "fist", handR: "fist", face: { brow: -1, lid: 0.1, mouth: 0.3, smile: -0.6 } });
  const wAt: V3 = [wo[0], 0, wo[2] + 0.26], s2: Stand = { D: VILLAGER_WOMAN_D, at: wAt, heading: 45, h: 1.64, cam: V.cam };
  m2.actAt(-1, { ...reach(s2, "L", ahead(wAt, 45, 0.5, -0.25, 1.1)), armR: arm(20, 10, 60, 8), head: [10, 6, 0] }, 10, { in: 0.01, handL: "point", handR: "relaxed", face: { brow: 1, lid: 0, wide: 0.6, mouth: 0.5, smile: -0.4 } });
  return { id, a: a0, b: b0, still: 0.5, sounds: [{ t: 0.05, k: "step", g: 0.5, surface: "sand" }],
    cam: (_t, u) => V.push(0.15 * u), sun: { target: man, reach: 6 },
    cast: (t) => [on("man", VILLAGER_D, m1, t), on("wom", VILLAGER_WOMAN_D, m2, t)] };
};

// ---------------- the three clips ----------------
const beds = (court: [number, number][], vines: [number, number][]) => [...court.map(([a, b]) => ({ k: "court", a, b, g: 0.8 })), ...vines.map(([a, b]) => ({ k: "birds", a, b, g: 0.8 })), ...vines.map(([a, b]) => ({ k: "wind", a, b, g: 0.3 }))];
/** `top`: the hook text's top in the picture (in the sky over the vineyard for b: lower down it lay over the villager's chest and hands) */
const clip = (id: string, W: Word[], shots: Shot[], text: string[], textB: number, len: number, b: ReturnType<typeof beds>, top?: number): Film => ({
  id, fps: 30, seconds: len, sky: "#b8e0ff", world: stJulienWorld, shots, words: W, hook: { text, a: 0, b: textB, size: 80, ...(top ? { top } : {}) }, beds: b, audio: `craft/${id}.wav` });

// a: the question over the court; the gallery; then the answer on the vines
const A = (() => { const W = wa as Word[], c1 = 1.4, c2 = say(W, "Yes") - 0.05, c3 = say(W, "villages") - 0.06, end = say(W, "vines") + 0.55;
  return clip("animal-hook-a", W, [courtShot("court", 0, c1, [0, 0.72]), galleryShot("gallery", c1, c2, W, ["hook"]), leafClose("eating", c2, c3), vinesWide("vines", c3, end)],
    ["WERE ANIMALS", "REALLY PUT", "ON TRIAL?"], c2, end, beds([[0, c2]], [[c2, end]])); })();
// b: the claim over the vineyard; the question over the court; Sir's "Yes."
const B = (() => { const W = wb as Word[], L = byId(lb), c1 = (L.hook.b + L.question.a) / 2, c2 = say(W, "on") - 0.15, end = say(W, "Yes") + 0.48;
  return clip("animal-hook-b", W, [complaintShot("complaint", 0, c1, W), courtClose("court", c1, c2, [0]), yesShot("yes", c2, end, W, ["question", "vines"])],
    ["A VILLAGE SUED", "ITS WEEVILS."], c1, end, beds([[c1, end]], [[0, c1]]), 110); })();
// c: the lawyer's bow; the question over the court; Sir's "Yes."
const C = (() => { const W = wc as Word[], L = byId(lc), c1 = (L.hook.b + L.question.a) / 2, c2 = say(W, "on") - 0.15, end = say(W, "Yes") + 0.48;
  return clip("animal-hook-c", W, [bowShot("bow", 0, c1, 0.95), courtShot("court", c1, c2, [0]), yesShot("yes", c2, end, W, ["question", "vines"])],
    ["THESE WEEVILS", "HAD A LAWYER."], c1, end, beds([[0, end]], [])); })();
export const AT_HOOK_A = A, AT_HOOK_B = B, AT_HOOK_C = C;
