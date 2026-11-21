// The motion test of the flat 2D style A Knopp (Jesper, 21 Nov 2026: "ett rörelseprov med bara A, cirka 10 sekunder, på en platt målad
// bakgrund med marklinje: Sir går in från sidan, vänder sig mot kameran, pekar, säger en mening (munnen följer rösten), blir rädd, springer
// ut. Ada står bredvid, reagerar och pekar"). The model only: who stands where, in which pose, at each time. FlatMotion.tsx draws it, and
// scripts/flat_check.mjs checks its feet. The skeleton (rig.ts), the motion library (motion.ts Mover: planted feet) and the gesture
// library (stage/gestures.ts) are used as they are.
// v3 (the review of v2): in the picture from the first frame and out a second after he has gone; a little head dip before each turn; he
// looks at Ada while he points; a snake comes up where he pointed, and that is what scares him; every face says its pupil size, so that a
// face blending in no longer passes through a pupil of 0; each hand changes shape half way through a quick move; Ada turns on her feet
// before she points.
import { solve, Pose, Sk } from "./rig";
import { FigOpts, Face, Who } from "./designs/common";
import type { HandKind } from "./ink";
import { FLAT } from "./designs/flat";
import { mover, mt, ease, type MM } from "./stage/acting";
import { play } from "./stage/film";
import { GESTURES, upper } from "./stage/gestures";
import MOUTH from "./rorelseprov-mouth.json";

export const FM = { W: 1080, H: 1920, FPS: 30, GY: 1500, /** the ground line is 12 px thick, centred on GY */ LINE: 12, /** pixels per metre and the figures' height in metres (620: the camera pulled out from 720, where Ada's hair, ear and bun went past the
 *  picture's right edge and the run had room for one stride, the independent review of v4) */ PPM: 620, HM: 1.0 };
const D = FLAT[0];
const SCARED: Face = { wide: 1, brow: 1, sad: 0.6, pupil: 0.5, mouth: 0.5, smile: -0.7 };
const CALM: Face = { pupil: 1, smile: 0.2 };
const REST: Pose["armL"] = [[4, 13], [16, 9]];
// (the Mover gives a foot's place sideways from the middle of the pelvis, and the skeleton adds the hip's half-width on top: Knopp's hips are
//  wide for his short legs, 0.30 leg lengths, so a planted foot sat a hip's width out and slid along the ground line as he turned. The feet
//  stand under the hips (w), and the hip's width is taken off again in figsAt)
const hipLL = (who: Who) => { const P = D.props(who); return P.hipW / (P.thigh + P.shin); };

// ---- Sir: walks in from the left (in the picture from the first frame), turns to the lens, points at the spot by Ada and looks at it,
//      speaks, a snake comes up there, he is scared, turns and runs out to the left ----
// (Knopp's legs are short: at the library's step of 0.52 leg lengths a metre took nine steps. Longer steps, a shorter way in)
const sir: MM = mover(D, FM.HM, -0.66, 0, 90); sir.w = hipLL("sir");
sir.walk(mt(sir, 0.36), { step: 0.8 });
const T_TURN = sir.t + 0.2;
ease(sir, T_TURN - 0.2, { head: [8, 4, 0] }, 0.15, { face: CALM });      // (a little dip of the head the other way before the turn: it reads as a turn)
sir.stand(0.2); sir.turn(-90, 0.6, 0.22);
const T_POINT = sir.t + 0.1;
// (the gesture library's point, to his left (the picture's right), toward the spot by Ada: its arm and turn mirrored to the other side, his
//  head and eyes turned to where he points)
const pt = GESTURES.point.pose("side", 0) as Pose;
ease(sir, T_POINT, { ...upper({ ...pt, armL: pt.armR, armR: REST, twist: -(pt.twist ?? 0), head: [38, 3, 0] }) }, 0.45, { face: { pupil: 1, smile: 0.5, brow: 0.5, gaze: [0.75, 0.15] } });
export const T_SNAKE = 5.0;
/** the snake (v4, the review of v3): its hole is in the sand from the first frame, it rises over 0.4 s (12 frames) between them, clear of
 *  both: Ada's hands go to her chest, his pointing arm is down before it comes */
export const SNAKE = { x: FM.W / 2 + 0.16 * FM.PPM, t0: T_SNAKE, rise: 0.4, h: 235 };
/** the snake's shape at time t, in picture pixels, shared by the drawing and the check: its body's spine (an S, from the hole up), its
 *  head's middle and outline (wider than the neck, the snout toward Sir, the picture's left), how far it has risen (0-1) */
export const snakeAt = (t: number) => {
  const x0 = SNAKE.x, y0 = FM.GY - FM.LINE / 2, u = Math.max(0, Math.min(1, (t - SNAKE.t0) / SNAKE.rise)), e = u * u * (3 - 2 * u);
  const hgt = SNAKE.h * e, sw = Math.sin(Math.max(0, t - SNAKE.t0) * 3.5) * 10 * e, spine: [number, number][] = [];
  // (the S grows with the height: at full width while low, the body lay flat beside the hole, the independent review of v4)
  for (let i = 0; i <= 20; i++) { const v = i / 20; spine.push([x0 + Math.sin(v * Math.PI * 2) * 42 * e * Math.min(1, v * 4) + sw * v, y0 - hgt * v]); }
  const [hx, hy] = spine[20], head: [number, number][] = [];
  for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a), r = c < 0 ? 1 + 0.25 * -c : 1;      // (the snout end a little longer)
    head.push([hx - 8 + c * 40 * r, hy - 6 + s * (c < 0 ? 22 - 6 * -c : 22)]); }
  return { spine, hx: hx - 8, hy: hy - 6, head, e, up: u > 0 };
};
const T_SCARED = T_SNAKE + 0.45;
// (the pointing arm down as the line ends, before the snake comes up: lowered while it rose, his fist came down onto its head, v4 preview)
ease(sir, T_SNAKE - 0.2, { armL: REST, armR: REST, twist: 0, head: [30, 4, 0] }, 0.3, { face: { pupil: 1, smile: 0.1, gaze: [0.75, 0.3] } });
// (scared: a small jerk back, the arms up, the eyes wide; the pupils shrink over the jerk's 5 frames)
ease(sir, T_SCARED, { lean: -8, armL: [[30, 30], [100, 20]], armR: [[30, 30], [100, 20]], head: [12, -6, 0] }, 0.16, { face: SCARED });
// (the stand before the run shorter: 0.35 s of treading on the spot read as hesitation, the review of v3)
sir.stand(T_SCARED + 0.4 - sir.t);
const T_RUN_TURN = sir.t + 0.08;
ease(sir, T_RUN_TURN - 0.1, { head: [18, -6, 0] }, 0.08, { face: SCARED });
sir.stand(0.08); sir.turn(-90, 0.4, 0.22);
const T_RUN = sir.t;
// (the arms left to the run's own pump, left arm forward with the right foot: held clasped at the chest the run read as a crouching walk, the
//  independent review of v4)
ease(sir, T_RUN, { lean: 30, head: [0, -14, 0] }, 0.2, { face: { ...SCARED, mouth: 0.4 } });
// (longer strides, more time in the air: at the library's 1.22 leg lengths Knopp's stride was 100-130 px on an 800 px figure, a stressed
//  trot, the review of v3)
sir.run(mt(sir, 2.6), { keep: true, step: 2.1, tau: 0.36 });
// (every layer that holds his arms ends as the run starts, so the run's own arm swing shows: a layer is laid over the walk's pose, and the
//  pointing, lowered and scared arms, each 30 s long, held both fists at his chest through the run, the independent review of v4)
for (const L of (sir as unknown as { layers: { t0: number; t1: number; out: number; pose: Partial<Pose> }[] }).layers)
  if (L.t0 < T_RUN && L.t1 > T_RUN && (L.pose.armL || L.pose.armR)) { L.t1 = T_RUN + 0.2; L.out = 0.3; }

// ---- Ada: stands to the right, turned a little toward him; reacts when the snake comes, turns on her feet the way he runs and points ----
const ada: MM = mover(D, FM.HM * 0.92, 0.60, 0, -22); ada.w = hipLL("baker");      // (0.60 at the pulled-out camera, PPM 620: at 0.30 his pointing hand came to her arm, at 0.42 her pointing hand came within 30 px of the snake (v4); the snake at 0.16, clear of his scared hands and her point)
ease(ada, -1, {}, 0.01, { face: { pupil: 1 } });
ease(ada, 3.3, { head: [-6, 2, 0] }, 0.5, { face: { pupil: 1, smile: 0.3, brow: 0.3, gaze: [-0.6, 0] } });
// (she pulls back from the snake, her hands up to her chest: held out low, her hand lay on its head, the review of v3)
ease(ada, T_SCARED + 0.05, { lean: -7, armL: [[24, 26], [150, 14]], armR: [[24, 26], [150, 14]], head: [0, -6, 0] }, 0.16, { face: SCARED });
ada.stand(T_RUN - 0.1); const T_ADA_TURN = ada.t; ada.turn(-46, 0.5, 0.2);
const pa = GESTURES.point.pose("side", 0) as Pose;
const T_ADA_POINT = ada.t + 0.05;
// (she points with her near arm, the left as she faces the picture's left: with the right, the far one, the arm was drawn behind her body and
//  only the fist and finger showed at its front edge, the independent review of v4)
const paA = GESTURES.point.pose("ahead", 0) as Pose;      // (aimed ahead, the way she faces: her near left arm, the library's right arm's angles)
ease(ada, T_ADA_POINT, { ...upper({ ...paA, armL: paA.armR, armR: REST, head: pa.head }), lean: 0 }, 0.45, { face: { ...SCARED, mouth: 0.35, gaze: [-0.7, 0] } });
ada.stand(20);

// ---- the hands: each change of shape falls half way through a quick move of that arm, where it reads as part of the move (the review:
//      shapes that changed in one frame at rest read as jumps) ----
type HS = [number, HandKind][];
const HANDS: Record<string, { L: HS; R: HS }> = {
  sir: { L: [[0, "fist"], [T_TURN + 0.3, "relaxed"], [T_POINT + 0.22, "point"], [T_SNAKE - 0.05, "relaxed"], [T_SCARED + 0.08, "open"], [T_RUN_TURN + 0.25, "fist"]],
    R: [[0, "fist"], [T_TURN + 0.3, "relaxed"], [T_SCARED + 0.08, "open"], [T_RUN_TURN + 0.25, "fist"]] },
  ada: { L: [[0, "relaxed"], [T_SCARED + 0.13, "open"], [T_ADA_POINT + 0.22, "point"]], R: [[0, "relaxed"], [T_SCARED + 0.13, "open"], [T_ADA_POINT + 0.22, "relaxed"]] },
};
const handAt = (hs: HS, t: number) => { let k = hs[0][1]; for (const [t0, v] of hs) if (t >= t0) k = v; return k; };

/** when Sir has gone out of the picture, and the film's length: a second after that */
const sirX = (t: number) => play("sir", D, sir, t, [0, 0, 0], FM.HM, {}).at[0];
// (out of the picture when all of him is past its left edge: his middle 0.45 of his height past it)
let T_GONE = T_RUN; while (T_GONE < 20 && FM.W / 2 + sirX(T_GONE) * FM.PPM > -0.45 * FM.HM * FM.PPM) T_GONE += 1 / FM.FPS;
export const SECONDS = Math.ceil((T_GONE + 1.0) * FM.FPS) / FM.FPS;
export const EVENTS = { T_TURN, T_POINT, T_SNAKE, T_SCARED, T_RUN_TURN, T_RUN, T_ADA_TURN, T_ADA_POINT, T_GONE, LINE: MOUTH.t0, LINE_END: MOUTH.t0 + MOUTH.len, END: SECONDS };

export type Fig = { name: string; who: Who; x: number; sk: Sk; o: FigOpts };
/** the two figures at time t: where they stand in the picture (x in pixels), their solved skeleton and their drawing options */
export const figsAt = (t: number): Fig[] => {
  const f = Math.max(0, Math.min(MOUTH.mouth.length - 1, Math.round(t * FM.FPS)));
  return ([["sir", sir, "sir", FM.HM], ["ada", ada, "baker", FM.HM * 0.92]] as [string, MM, Who, number][]).map(([name, m, who, h]) => {
    const a = play(name, D, m, t, [0, 0, 0], h, { blink: true, seed: name === "sir" ? 3 : 7, extra: { who } });
    // (no blink while frightened: a blink and the lids of a smug half look showed in the middle of the fright, the review of v3)
    // (a blink goes open, shut, open with no half lid between: half shut, the lid covered the pupil and the eye's lower white stood empty, the
    //  independent review of v4)
    const f0 = { pupil: 1, ...a.o.face }, lid0 = f0.lid ?? 0.16, f1 = lid0 > 0.3 ? { ...f0, lid: lid0 > 0.55 ? 1 : 0.16 } : f0;
    const face0 = (f1.wide ?? 0) > 0.5 ? { ...f1, lid: 0 } : f1;
    const face = name === "sir" && t >= MOUTH.t0 - 0.05 && t <= MOUTH.t0 + MOUTH.len + 0.1 ? { ...face0, mouth: MOUTH.mouth[f] } : face0;
    const fix = (l: Pose["legL"]) => (l && (l as { th?: unknown }).th === undefined ? { ...l, x: ((l as { x?: number }).x ?? 0) - hipLL(who) } : l);
    const pose = { ...a.pose, legL: fix(a.pose.legL), legR: fix(a.pose.legR) } as Pose;
    return { name, who, x: FM.W / 2 + a.at[0] * FM.PPM, sk: solve(D.props(who), pose, a.heading), o: { ...a.o, handL: handAt(HANDS[name].L, t), handR: handAt(HANDS[name].R, t), face } };
  });
};
/** where a figure's soles stand in the picture: the shoe's outline (the ink round it, 0.85 of the line weight outside the shape) rests on the
 *  ground line's top edge. On GY itself the soles lay in the line, 9 px past its lower edge (the review of v3). FLAT_V3 mode: as in v3 */
export const MODE = { v3: false };
export const footY = (who: Who) => (MODE.v3 ? FM.GY : FM.GY - FM.LINE / 2 - 0.85 * D.ol * scaleOf(who));
/** pixels per design unit for a figure of height h metres */
export const scaleOf = (who: Who) => { const P = D.props(who), tall = P.thigh + P.shin + P.ankle + P.spine + P.neck + P.head; return (FM.PPM * (who === "sir" ? FM.HM : FM.HM * 0.92)) / tall; };
export { D as FLAT_A };
export { shoeDrawn, FLAT_SPECS } from "./designs/flat";
