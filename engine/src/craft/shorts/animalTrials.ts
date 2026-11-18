// "Were animals really put on trial?" (the length test, 45-55 s): the weevils of Saint-Julien, 1587. The approved script is
// granskning/animal-trials/manus.md (version 1, with its three changes); the opening is hook b as the review chose it (hook b v2, with
// the review's choices for Sir's "Yes."), and the film ends on the villager with the village's complaint in the vineyard, the opening's
// own picture, so that it loops (change 3). Every detail of the case is from E. P. Evans (1906) and its appendix A; see the script.
import * as THREE from "three";
import { Film, Shot, V3, Word, talk, smooth } from "../stage/film";
import { mover, arm, wag } from "../stage/acting";
import { lens, once, noShade } from "../stage/staging";
import { COMPLAINT, JUG, ROD, GAVEL, wield, usePose, reach, Stand } from "../stage/grips";
import { stJulienWorld, SJ, inCourt, vineAt } from "../world/stjulien";
import { complaintRoll, jugHeld, measureRod } from "../world/props";
import { mesh, box } from "../world/kit";
import { SIR_D, VILLAGER_D, VILLAGER_WOMAN_D, VILLAGER_OLD_D, VILLAGER_WOMAN2_D, ADVOCATE_D, EXPERT_D, EXPERT2_D, CLERK_D, OFFICIAL_D } from "../looks";
import type { Design } from "../designs/common";
import { on, say } from "./gladiatorsHooks";
import { toward, ahead, FL, COURT_SUN, GAVEL_O, judge, lawyer, LAWYER_C, CLOSE, courtClose, yesShot, GAL, seated, sitting, bowShot, aisle, complaintShot, leafCluster, Leaf, leafClose, vinesWide, SIR_AT, OLD_AT, WOMAN_AT, DOCK, P, deg } from "./animalTrialsHooks";
import words from "../../../voice/animal-trials/words.json";
import lines from "../../../voice/animal-trials/lines.json";

const W = words as Word[];
const L = Object.fromEntries((lines as { id: string; a: number; b: number }[]).map((x) => [x.id, x])) as Record<string, { a: number; b: number }>;
/** a cut between two lines: half way through the pause between them */
const cut = (a: string, b: string) => (L[a].b + L[b].a) / 2;
const ROLL = once(() => noShade(complaintRoll())), JUGO = once(() => noShade(jugHeld())), JUGO2 = once(() => noShade(jugHeld())), RODO = once(() => noShade(measureRod())), RODO2 = once(() => noShade(measureRod()));
/** captions at the top of the picture in every shot: over the sky outdoors and the wall indoors (lower they lie over chests and hands) */
const TOP = 150;
const shots: Shot[] = [];
const add = (s: Shot) => { shots.push({ capsTop: TOP, ...s }); return s; };

// ---------------- 0-5.5 s: hook b, as approved (the claim, the question over the court, Sir's "Yes.") ----------------
const T1 = cut("hook", "question"), T2 = say(W, "on") - 0.15, T3 = say(W, "Weevils", L.vines.a) - 0.06;
add(complaintShot("complaint", 0, T1, W));
add(courtClose("court", T1, T2, [0]));
add(yesShot("yes", T2, T3, W, ["question", "vines"]));

// ---------------- "Weevils were eating a village's vines, so the village took them to court." ----------------
const T4 = say(W, "villages", L.vines.a) - 0.06, T5 = cut("vines", "lawyer");
add(leafClose("eating", T3, T4));
add(vinesWide("vines", T4, T5));

// ---------------- "And the court gave the weevils a lawyer." The lawyer bows to the empty dock ----------------
const T6 = cut("lawyer", "get_lawyer");
// (the lens from the gallery's side, so that the dock stands beside the bowing lawyer in the picture: from the room's middle its rail lay over his arms)
const BOW_F = (() => { const p = inCourt([-1.55, 1.6, 2.55]), q = inCourt([-0.35, 1.2, -1.3]), d = Math.hypot(q[0] - p[0], q[2] - p[2]); return lens(p[0], p[1], p[2], (q[0] - p[0]) / d, (q[2] - p[2]) / d, -10, 54); })();
// (the court close again, the lawyer presenting the empty dock and the judge with his gavel: the script's bow toward the dock put his swept
// arm behind the dock's corner post from every lens in the gallery; see the per-shot note)
// (4 cm nearer the dock than in the opening, so that its low base hides both legs: in the longer shot it hid the near one only)
const LAW2: V3 = [LAWYER_C[0] + 0.04, 0, LAWYER_C[2]];
void BOW_F; add(courtClose("bow", T5, T6, [0.1], LAW2));

// ---------------- "They get a lawyer?" The old man in the gallery throws out his arms; Sir beside him turns to him ----------------
const T7 = cut("get_lawyer", "argued");
{ const H = 90, old = seated(VILLAGER_OLD_D, 1.7, OLD_AT, H), sir = seated(SIR_D, 1.8, SIR_AT, H), os: Stand = { D: VILLAGER_OLD_D, at: OLD_AT, heading: H, h: 1.7, cam: GAL.cam, pose: sitting({}) };
  old.actAt(-1, sitting({ armL: arm(20, 10, 60, 8), armR: arm(20, 10, 60, 8), lean: 6, head: [-6, -2, 0] }), 10, { in: 0.01, handL: "relaxed", handR: "relaxed", face: { brow: 0.4, lid: 0.2 } });
  // arms out to the sides, palms up, as he asks
  old.actAt(0.12, sitting({ ...reach(os, "L", ahead(OLD_AT, H, 0.32, -0.42, 1.0)), ...reach(os, "R", ahead(OLD_AT, H, 0.32, 0.42, 1.0)), lean: -2, head: [-30, 6, 0] }), 10, { in: 0.25, antic: 0.08, over: 1.1, handL: "open", handR: "open", face: { brow: 1, lid: 0, wide: 0.6, mouth: 0.4, smile: -0.2 } });
  const toOld = deg(Math.atan2(OLD_AT[0] - SIR_AT[0], OLD_AT[2] - SIR_AT[2])) - H;
  sir.actAt(-1, sitting({ armR: arm(20, 10, 60, 8), armL: arm(20, 10, 60, 8), head: [toOld * 0.6, -2, 0], lean: 4 }), 10, { in: 0.01, handR: "relaxed", handL: "relaxed", face: { brow: 0.8, lid: 0.1, smile: 0.4 } });
  add({ id: "get", a: T6, b: T7, still: 0.6, sounds: [{ t: 0.1, k: "scuff", g: 0.4 }],
    cam: (_t, u) => GAL.push(0.08 * u), sun: { target: OLD_AT, reach: 5 },
    cast: (t, T) => [on("old", VILLAGER_OLD_D, old, t, FL, { talk: talk(W, T, ["get_lawyer"]) }), on("sir", SIR_D, sir, t, FL)] }); }

// ---------------- "He argued that God made the animals before man, and gave them every green herb to eat." ----------------
// The lawyer pleads by the empty dock: he points up on "God made the animals", then sweeps his open hand toward the vines in the window
const T8 = cut("argued", "offered");
// (well to the left of the dock, which stands beside him in the picture: behind it, its base covered his robe and one leg)
{ const H = 8, LA: V3 = [LAWYER_C[0] - 0.62, 0, LAWYER_C[2] - 0.1], PL = (() => { const p = inCourt([0.2, 1.42, 2.55]), q = inCourt([-0.5, 1.35, -1.2]), d = Math.hypot(q[0] - p[0], q[2] - p[2]); return lens(p[0], p[1], p[2], (q[0] - p[0]) / d, (q[2] - p[2]) / d, -4, 60); })();
  const m = mover(ADVOCATE_D, 1.8, LA[0], LA[2], H); m.stand(9); const s: Stand = { D: ADVOCATE_D, at: LA, heading: H, h: 1.8, cam: PL.cam };
  const tUp = say(W, "God") - T7 - 0.25, tSweep = say(W, "every") - T7 - 0.3;
  const WAIST = { armL: arm(16, 8, 40, 6) };
  m.actAt(-1, { ...WAIST, armR: arm(8, -4, 128, -62), head: [-20, 2, 0] }, 10, { in: 0.01, handL: "relaxed", handR: "relaxed", face: { brow: 0.6, lid: 0.1, mouth: 0.3 } });
  m.actAt(tUp, { ...reach(s, "R", ahead(LA, H, 0.12, 0.36, 2.0)), ...WAIST, head: [-10, -14, 0] }, tSweep - tUp, { in: 0.3, out: 0.3, antic: 0.1, over: 1.1, handR: "point", handL: "relaxed", face: { brow: 1, lid: 0, mouth: 0.4 } });
  m.actAt(tSweep, { ...reach(s, "L", ahead(LA, H, 0.4, -0.62, 1.22)), armR: arm(8, -4, 128, -62), head: [-24, 4, 0] }, 10, { in: 0.45, antic: 0, over: 1.05, handL: "open", handR: "relaxed", face: { brow: 0.7, lid: 0.1, mouth: 0.3, smile: 0.3 } });
  const J = judge([]);
  add({ id: "argued", a: T7, b: T8, still: 2.0, sounds: [], cam: (_t, u) => PL.push(0.03 * u), sun: COURT_SUN,
    cast: (t) => [on("judge", OFFICIAL_D, J.m, t, FL + SJ.court.dais), on("lawyer", ADVOCATE_D, m, t, FL)],
    things: (g, c, _t, _T, cam) => { wield(g, GAVEL_O(), GAVEL, "strike", c.judge, "R", cam); } }); }

// ---------------- "So the village offered the weevils a field of their own, away from the vines." ----------------
// the square: four villagers vote with their hands up; then the empty field beyond the vines, roped off
const T9 = say(W, "field") - 0.1, T10 = cut("offered", "water");
{ const [sx, , sz] = SJ.square.at, C = lens(sx, 1.5, sz + 5.0, 0, -1, -2, 52), row: [Design, number, number, number][] = [[VILLAGER_D, 1.76, -1.25, 0.3], [VILLAGER_WOMAN_D, 1.64, -0.4, 0.0], [VILLAGER_OLD_D, 1.7, 0.45, 0.35], [VILLAGER_WOMAN2_D, 1.6, 1.25, 0.05]];
  const men = row.map(([D, h, dx, dz], i) => { const at: V3 = [sx + dx, 0, sz + dz], hd = toward(at, C.cam.pos) + (i - 1.5) * 6, m = mover(D, h, at[0], at[2], hd); m.stand(9);
    const st: Stand = { D, at, heading: hd, h, cam: C.cam };
    m.actAt(-1, { armL: arm(16, 10, 30, 8), armR: arm(16, 10, 30, 8), head: [0, 0, 0] }, 10, { in: 0.01, handL: "relaxed", handR: "relaxed", face: { brow: 0.3, lid: 0.2, smile: 0.2 } });
    m.actAt(0.15 + 0.12 * i, { ...reach(st, "R", ahead(at, hd, 0.12, 0.2, h * 1.15)), armL: arm(16, 10, 30, 8), head: [0, -6, 0] }, 10, { in: 0.25, antic: 0.05, over: 1.1, handR: "open", handL: "relaxed", face: { brow: 0.6, lid: 0.1, smile: 0.5 } });
    return { D, m, name: `v${i}` }; });
  add({ id: "vote", a: T8, b: T9, still: 1.0, sounds: [{ t: 0.2, k: "scuff", g: 0.4 }], cam: (_t, u) => C.push(0.1 * u), sun: { target: [sx, 0, sz], reach: 6 },
    cast: (t) => men.map((q) => on(q.name, q.D, q.m, t)) }); }
const [FX, , FZ] = SJ.field.at, [PX, , PZ] = SJ.field.spring;
const FIELD = lens(FX - 6.2, 1.55, FZ + 2.6, 0.92, -0.39, -4, 54);
add({ id: "field", a: T9, b: T10, still: 0.8, sounds: [], cam: (_t, u) => FIELD.push(0.25 * u), sun: { target: [FX, 0, FZ], reach: 8 }, cast: () => [] });

// ---------------- "The villagers could still walk through it, and use its water." Two villagers cross it with jugs from the spring ----
const T11 = cut("water", "said_no");
{ const V = lens(PX - 3.6, 1.45, PZ + 3.4, 0.73, -0.68, -3, 54), H = 90;
  const a0: V3 = [PX - 1.5, 0, PZ + 0.9], b0: V3 = [PX - 2.6, 0, PZ + 1.7];
  const w1 = mover(VILLAGER_WOMAN_D, 1.64, a0[0], a0[2], H), w2 = mover(VILLAGER_D, 1.76, b0[0], b0[2], H);
  for (const m of [w1, w2]) { m.walk(1.9 / m.LL, { step: 0.42 / m.LL, tau: 0.5 }).stand(9); m.actAt(-1, { ...usePose(JUG, "carry", "R"), armL: arm(14, 10, 26, 6) }, 10, { in: 0.01, handR: "grip", handL: "relaxed", face: { brow: 0.2, lid: 0.2, smile: 0.3 } }); }
  add({ id: "water", a: T10, b: T11, still: 1.0, sounds: w1.cues().filter((q) => q.k === "step").map((q) => ({ t: q.t, k: "step", g: 0.4, surface: "sand" })),
    cam: (_t, u) => V.push(0.06 * u), sun: { target: [PX, 0, PZ], reach: 6 },
    cast: (t) => [on("w1", VILLAGER_WOMAN_D, w1, t), on("w2", VILLAGER_D, w2, t)],
    things: (g, c, _t, _T, cam) => { wield(g, JUGO(), JUG, "carry", c.w1, "R", cam); wield(g, JUGO2(), JUG, "carry", c.w2, "R", cam); } }); }

// ---------------- "But the weevils' lawyer said no. The land was too barren for his clients." ----------------
// the lawyer on the field rubs a pinch of dry earth between his fingers, lets it fall and shakes his head
const T12 = cut("said_no", "picky");
const BARREN_AT: V3 = [FX - 2.4, 0, FZ + 0.4];
{ const V = lens(BARREN_AT[0] - 2.5, 1.5, BARREN_AT[2] + 1.0, 0.93, -0.37, -4, 46), H = toward(BARREN_AT, V.cam.pos) + 25, m = mover(ADVOCATE_D, 1.8, BARREN_AT[0], BARREN_AT[2], H); m.stand(9);
  const s: Stand = { D: ADVOCATE_D, at: BARREN_AT, heading: H, h: 1.8, cam: V.cam }, hand = ahead(BARREN_AT, H, 0.36, 0.18, 1.2);
  m.actAt(-1, { ...reach(s, "R", hand), armL: arm(14, 10, 30, 8), head: [-6, 12, 0] }, 10, { in: 0.01, handR: "fist", handL: "relaxed", face: { brow: -0.4, lid: 0.3, mouth: 0.2, smile: -0.4 } });
  const tNo = say(W, "no") - T11;
  wag(m, Math.max(0.1, tNo - 0.1), 1.2, P({ head: [-18, 6, 0] }), P({ head: [8, 6, 0] }), 0.22, { face: { brow: -0.6, lid: 0.2, mouth: 0.3, smile: -0.6 } });
  m.actAt(tNo + 1.3, { ...reach(s, "R", hand), armL: arm(14, 10, 30, 8), head: [-8, 4, 0] }, 10, { in: 0.2, handR: "open", handL: "relaxed", face: { brow: -0.7, lid: 0.2, mouth: 0.4, smile: -0.6 } });
  /** the dry earth falling from his fingers once he opens them: small crumbs from the hand down to the ground */
  const crumbs = (g: THREE.Group, t: number, cam: { pos: number[] }) => { const t0 = tNo + 1.35; if (t < t0) return; const h = palmOf(m, s, t, cam); for (let i = 0; i < 9; i++) { const u = ((t - t0) * 1.6 + i * 0.11) % 1.0, y = h[1] - 0.05 - u * (h[1] - 0.05);
      g.add(mesh(box(0.012, 0.012, 0.012), "#8a6a42", { at: [h[0] + Math.sin(i * 2.1) * 0.03, y, h[2] + Math.cos(i * 1.7) * 0.03], line: 0, shadow: false })); } };
  add({ id: "barren", a: T11, b: T12, still: 1.0, sounds: [{ t: tNo + 1.4, k: "scuff", g: 0.3 }], cam: (_t, u) => V.push(0.08 * u), sun: { target: BARREN_AT, reach: 5 },
    cast: (t) => [on("lawyer", ADVOCATE_D, m, t)], things: (g, _c, t, _T, cam) => crumbs(g, t, cam) }); }
/** where a figure's right palm is at time t (the hand the crumbs fall from) */
function palmOf(_m: ReturnType<typeof mover>, s: Stand, _t: number, _cam: unknown): V3 { return ahead(s.at, s.heading, 0.36, 0.18, 1.18); }

// ---------------- "Picky eaters." Sir at the end of a row of vines, his monocle to a weevil on a leaf ----------------
const T13 = cut("picky", "experts");
{ const end = vineAt(1, 1), at: V3 = [end[0] + 1.05, 0, end[2] + 0.35], V = lens(at[0] + 1.9, 1.6, at[2] + 0.5, -0.97, -0.25, -2, 42), H = toward(at, V.cam.pos) - 40;
  const sir = mover(SIR_D, 1.8, at[0], at[2], H); sir.stand(9);
  sir.actAt(-1, { armL: arm(16, 10, 34, 8), armR: arm(30, 10, 120, -40), lean: 8, head: [-24, 10, 0] }, 10, { in: 0.01, handL: "relaxed", handR: "relaxed", face: { brow: 0.9, lid: 0.3, smile: 0.4 } });
  const LA: V3 = [end[0] + 0.55, 1.38, end[2] + 0.42];
  const leaves: Leaf[] = [{ at: LA, R: 0.17, seed: 21, bites: 3, rot: [-0.1, 0.5, 0.1] }];
  add({ id: "picky", a: T12, b: T13, still: 0.6, sounds: [{ t: 0.05, k: "munch", g: 0.6, dur: 0.8 }], cam: (_t, u) => V.push(0.06 * u), sun: { target: at, reach: 4 },
    cast: (t, T) => [on("sir", SIR_D, sir, t, 0, { talk: talk(W, T, ["picky"]) })], things: (g, _c, t) => leafCluster(g, leaves, Math.PI / 2, t, 1.25) }); }

// ---------------- "So the court sent experts to inspect the field." Two experts with measuring rods walk the field ----------------
const T14 = cut("experts", "verdict");
{ const V = lens(FX - 5.5, 1.5, FZ + 1.4, 0.97, -0.25, -3, 52), H = 72, e0: V3 = [FX - 3.3, 0, FZ + 0.1], e1: V3 = [FX - 2.7, 0, FZ - 1.1];
  const m0 = mover(EXPERT_D, 1.78, e0[0], e0[2], H), m1 = mover(EXPERT2_D, 1.74, e1[0], e1[2], H);
  for (const m of [m0, m1]) { m.walk(1.6 / m.LL, { step: 0.42 / m.LL, tau: 0.5 }).stand(9); m.actAt(-1, { ...usePose(ROD, "staff", "R"), armL: arm(14, 10, 30, 8), head: [0, 6, 0] }, 10, { in: 0.01, handR: "grip", handL: "relaxed", face: { brow: 0.4, lid: 0.3 } }); }
  add({ id: "experts", a: T13, b: T14, still: 1.2, sounds: m0.cues().filter((q) => q.k === "step").map((q) => ({ t: q.t, k: "step", g: 0.4, surface: "sand" })),
    cam: (_t, u) => V.push(0.05 * u), sun: { target: [FX - 3, 0, FZ], reach: 6 },
    cast: (t) => [on("e0", EXPERT_D, m0, t), on("e1", EXPERT2_D, m1, t)],
    things: (g, c, _t, _T, cam) => { wield(g, RODO(), ROD, "staff", c.e0, "R", cam); wield(g, RODO2(), ROD, "staff", c.e1, "R", cam); } }); }

// ---------------- "The verdict?" The clerk at his table, his hand on the thick record ----------------
const T15 = cut("verdict", "lost");
// (the clerk on the wall side of his table, where his stool is, facing the room and the lens: on the room side he showed his back)
const [CX, , CZ] = inCourt(SJ.court.clerk), CLERK_AT: V3 = [CX + 0.5, 0, CZ + 0.42];      // (beside his stool, not in it)
const RECORD_V = lens(CX - 2.5, 1.65, CZ + 0.9, 0.94, -0.34, -14, 46);
{ const H = toward(CLERK_AT, [CX, 0, CZ]), m = mover(CLERK_D, 1.72, CLERK_AT[0], CLERK_AT[2], H); m.stand(9); const s: Stand = { D: CLERK_D, at: CLERK_AT, heading: H, h: 1.72, cam: RECORD_V.cam };
  // (both hands on the record: his free hand hanging lay behind the table)
  m.actAt(-1, { ...reach(s, "R", [CX + 0.02, 0.84, CZ + 0.16]), ...reach(s, "L", [CX + 0.12, 0.84, CZ - 0.14]), head: [0, 18, 0], lean: 8 }, 10, { in: 0.01, handR: "open", handL: "open", face: { brow: 0.8, lid: 0.2, mouth: 0.3, smile: -0.2 } });
  add({ id: "verdict", a: T14, b: T15, still: 0.5, sounds: [{ t: 0.1, k: "paper", g: 0.6 }], cam: (_t, u) => RECORD_V.push(0.08 * u), sun: COURT_SUN,
    cast: (t) => [on("clerk", CLERK_D, m, t, FL)] }); }

// ---------------- "Lost. The last page of the record is missing." Sir bends over the record beside the clerk ----------------
const T16 = cut("lost", "who_won");
// (Sir at the table's near end, turned three quarters to the lens as he bends over the record: from behind the table he showed his back)
{ const sAt: V3 = [CX - 0.15, 0, CZ + 0.85], V = lens(CX - 2.0, 1.7, CZ + 1.3, 0.9, -0.43, -16, 44), H = (toward(sAt, [CX, 0, CZ]) + toward(sAt, [CX - 2.0, 0, CZ + 1.3])) / 2;
  const sir = mover(SIR_D, 1.8, sAt[0], sAt[2], H); sir.stand(9);
  sir.actAt(-1, { armL: arm(16, 10, 34, 8), armR: arm(16, 10, 34, 8), lean: 18, head: [-10, 18, 0] }, 10, { in: 0.01, handL: "relaxed", handR: "relaxed", face: { brow: 1, lid: 0, wide: 0.5, mouth: 0.2 } });
  add({ id: "lost", a: T15, b: T16, still: 1.0, sounds: [{ t: 0.15, k: "paper", g: 0.5 }], cam: (_t, u) => V.push(0.08 * u), sun: COURT_SUN,
    cast: (t) => [on("sir", SIR_D, sir, t, FL)] }); }

// ---------------- "So who won?" The woman in the gallery turns to Sir ----------------
const T17 = cut("who_won", "nobody");
// (the woman standing at the bench's near end, beside Sir, turned to him, the lens on the two of them: behind the old man she was small
// and her hands lay behind him)
{ const H = 90, WA: V3 = inCourt([-3.05, 0, 2.75]), WHO = (() => { const p = inCourt([-1.2, 1.4, 2.95]), q = inCourt([-3.2, 1.0, 2.25]), d = Math.hypot(q[0] - p[0], q[2] - p[2]); return lens(p[0], p[1], p[2], (q[0] - p[0]) / d, (q[2] - p[2]) / d, -6, 52); })();
  const wom = mover(VILLAGER_WOMAN2_D, 1.6, WA[0], WA[2], toward(WA, SIR_AT) - 25); wom.stand(9);
  wom.actAt(-1, { armL: arm(16, 10, 30, 8), armR: arm(24, 20, 70, 10), head: [16, -2, 0] }, 10, { in: 0.01, handL: "relaxed", handR: "open", face: { brow: 0.8, lid: 0.1, mouth: 0.3, smile: 0.1 } });
  const sir = seated(SIR_D, 1.8, SIR_AT, H), toW = deg(Math.atan2(WA[0] - SIR_AT[0], WA[2] - SIR_AT[2])) - H;
  sir.actAt(-1, sitting({ armR: arm(20, 10, 60, 8), armL: arm(20, 10, 60, 8), head: [toW * 0.5, -2, 0], lean: 4 }), 10, { in: 0.01, handR: "relaxed", handL: "relaxed", face: { brow: 0.6, lid: 0.2, smile: 0.2 } });
  const old = seated(VILLAGER_OLD_D, 1.7, OLD_AT, H); old.actAt(-1, sitting({ armL: arm(20, 10, 60, 8), armR: arm(20, 10, 60, 8), lean: 6, head: [-8, -2, 0] }), 10, { in: 0.01, handL: "relaxed", handR: "relaxed", face: { brow: 0.3, lid: 0.3 } });
  void old; add({ id: "who", a: T16, b: T17, still: 0.5, sounds: [], cam: (_t, u) => WHO.push(0.06 * u), sun: { target: SIR_AT, reach: 5 },
    cast: (t, T) => [on("wom", VILLAGER_WOMAN2_D, wom, t, FL, { talk: talk(W, T, ["who_won"]) }), on("sir", SIR_D, sir, t, FL)] }); }

// ---------------- "Nobody knows. But yes: animals really were put on trial." The loop (change 3) ----------------
// back in the vineyard with the villager and the complaint: he shrugs on "Nobody knows", then holds the roll out again as in the first
// frame, and the lens comes to rest where the film began, so that the last frame cuts straight to the first
const END = Math.min(W[W.length - 1].b + 0.35, 48.2);
{ const base = complaintShot("loop", T17, END, W), sh = say(W, "Nobody") - T17;
  const at = aisle(1, 0.62), Vb = lens(at[0] + 2.6, 1.6, at[2] + 0.22, -1, -0.02, -5, 46), H = toward(at, Vb.cam.pos);
  const m = mover(VILLAGER_D, 1.76, at[0], at[2], H); m.stand(9); const s: Stand = { D: VILLAGER_D, at, heading: H, h: 1.76, cam: Vb.cam };
  const SHOW = { ...usePose(COMPLAINT, "show", "R"), armL: arm(24, 46, 20, -40), lean: 5, head: [-14, 2, 0] as [number, number, number] };
  m.actAt(-1, SHOW, 10, { in: 0.01, handR: "grip", handL: "fist", face: { brow: -1, lid: 0, mouth: 0.5, smile: -0.6 } });
  m.actAt(Math.max(0.05, sh - 0.15), { ...usePose(COMPLAINT, "show", "R"), ...reach(s, "L", ahead(at, H, 0.3, -0.42, 1.05)), lean: 2, head: [-8, -8, 6] }, 1.3, { in: 0.25, out: 0.35, antic: 0.05, handR: "grip", handL: "open", face: { brow: 1, lid: 0.1, mouth: 0.2, smile: 0.1 } });
  const n = END - T17;
  add({ ...base, sounds: [{ t: Math.max(0.05, sh), k: "paper", g: 0.4 }], still: Math.min(n - 0.1, sh + 0.6), cam: (_t, u) => Vb.push(0.2 * (u - 1) * (n / Math.max(0.5, T1))), cast: (t) => [on("v", VILLAGER_D, m, t)] }); }
void smooth; void DOCK; void judge; void lawyer; void yesShot; void ROLL;

export const ANIMAL_TRIALS: Film = {
  id: "animal-trials", fps: 30, seconds: END, sky: "#b8e0ff", world: stJulienWorld, shots, words: W,
  hook: { text: ["A VILLAGE SUED", "ITS WEEVILS."], a: 0, b: T1, size: 80, top: 110 },
  beds: [{ k: "birds", a: 0, b: T1, g: 0.8 }, { k: "wind", a: 0, b: T1, g: 0.3 }, { k: "court", a: T1, b: T3, g: 0.8 }, { k: "birds", a: T3, b: T5, g: 0.8 }, { k: "court", a: T5, b: T8, g: 0.8 },
    { k: "birds", a: T8, b: T14, g: 0.8 }, { k: "wind", a: T9, b: T14, g: 0.3 }, { k: "court", a: T14, b: T17, g: 0.8 }, { k: "birds", a: T17, b: END, g: 0.8 }, { k: "wind", a: T17, b: END, g: 0.3 }],
  audio: "craft/animal-trials.wav",
  thumbs: [
    { T: T5 + 0.3, words: ["WEEVILS GOT", "LAWYERS"], y: 0.72, size: 120 },
    { T: (T11 + T12) / 2, words: ["TOO", "BARREN!"], y: 0.72, size: 140 },
    { T: (T15 + T16) / 2, words: ["NO", "VERDICT"], y: 0.72, size: 140 },
  ],
};
