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

export const FM = { W: 1080, H: 1920, FPS: 30, GY: 1500, /** pixels per metre and the figures' height in metres */ PPM: 720, HM: 1.0 };
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
export const T_SNAKE = 5.2;
const T_SCARED = T_SNAKE + 0.3;
ease(sir, T_SCARED - 0.4, { armL: REST, armR: REST, twist: 0, head: [30, 4, 0] }, 0.3, { face: { pupil: 1, smile: 0.1, gaze: [0.75, 0.3] } });
// (scared: a small jerk back, the arms up, the eyes wide; the pupils shrink over the jerk's 5 frames)
ease(sir, T_SCARED, { lean: -8, armL: [[30, 30], [100, 20]], armR: [[30, 30], [100, 20]], head: [12, -6, 0] }, 0.16, { face: SCARED });
sir.stand(T_SCARED + 0.55 - sir.t);
const T_RUN_TURN = sir.t + 0.15;
ease(sir, T_RUN_TURN - 0.15, { head: [18, -6, 0] }, 0.12, { face: SCARED });
sir.stand(0.15); sir.turn(-90, 0.5, 0.22);
const T_RUN = sir.t;
ease(sir, T_RUN, { lean: 30, armL: [[46, 8], [126, 6]], armR: [[-60, 12], [10, 6]], head: [0, -14, 0] }, 0.2, { face: { ...SCARED, mouth: 0.4 } });
sir.run(mt(sir, 2.6), { keep: true });

// ---- Ada: stands to the right, turned a little toward him; reacts when the snake comes, turns on her feet the way he runs and points ----
const ada: MM = mover(D, FM.HM * 0.92, 0.42, 0, -22); ada.w = hipLL("baker");      // (0.42: at 0.30 his pointing hand came to her arm)
ease(ada, -1, {}, 0.01, { face: { pupil: 1 } });
ease(ada, 3.3, { head: [-6, 2, 0] }, 0.5, { face: { pupil: 1, smile: 0.3, brow: 0.3, gaze: [-0.6, 0] } });
ease(ada, T_SCARED + 0.05, { lean: -5, armL: [[20, 20], [70, 10]], armR: [[20, 20], [70, 10]], head: [0, -4, 0] }, 0.16, { face: SCARED });
ada.stand(T_RUN - 0.1); const T_ADA_TURN = ada.t; ada.turn(-46, 0.5, 0.2);
const pa = GESTURES.point.pose("side", 0) as Pose;
const T_ADA_POINT = ada.t + 0.05;
ease(ada, T_ADA_POINT, { ...upper(pa), armL: REST, lean: 0 }, 0.45, { face: { ...SCARED, mouth: 0.35, gaze: [-0.7, 0] } });
ada.stand(20);

// ---- the hands: each change of shape falls half way through a quick move of that arm, where it reads as part of the move (the review:
//      shapes that changed in one frame at rest read as jumps) ----
type HS = [number, HandKind][];
const HANDS: Record<string, { L: HS; R: HS }> = {
  sir: { L: [[0, "fist"], [T_TURN + 0.3, "relaxed"], [T_POINT + 0.22, "point"], [T_SCARED - 0.25, "relaxed"], [T_SCARED + 0.08, "open"], [T_RUN_TURN + 0.25, "fist"]],
    R: [[0, "fist"], [T_TURN + 0.3, "relaxed"], [T_SCARED + 0.08, "open"], [T_RUN_TURN + 0.25, "fist"]] },
  ada: { L: [[0, "relaxed"], [T_SCARED + 0.13, "open"], [T_ADA_POINT + 0.22, "relaxed"]], R: [[0, "relaxed"], [T_SCARED + 0.13, "open"], [T_ADA_POINT + 0.22, "point"]] },
};
const handAt = (hs: HS, t: number) => { let k = hs[0][1]; for (const [t0, v] of hs) if (t >= t0) k = v; return k; };

/** when Sir has gone out of the picture, and the film's length: a second after that */
const sirX = (t: number) => play("sir", D, sir, t, [0, 0, 0], FM.HM, {}).at[0];
let T_GONE = T_RUN; while (T_GONE < 20 && sirX(T_GONE) > -1.0) T_GONE += 1 / FM.FPS;
export const SECONDS = Math.ceil((T_GONE + 1.0) * FM.FPS) / FM.FPS;
export const EVENTS = { T_TURN, T_POINT, T_SNAKE, T_SCARED, T_RUN_TURN, T_RUN, T_ADA_TURN, T_ADA_POINT, T_GONE, LINE: MOUTH.t0, LINE_END: MOUTH.t0 + MOUTH.len, END: SECONDS };

export type Fig = { name: string; who: Who; x: number; sk: Sk; o: FigOpts };
/** the two figures at time t: where they stand in the picture (x in pixels), their solved skeleton and their drawing options */
export const figsAt = (t: number): Fig[] => {
  const f = Math.max(0, Math.min(MOUTH.mouth.length - 1, Math.round(t * FM.FPS)));
  return ([["sir", sir, "sir", FM.HM], ["ada", ada, "baker", FM.HM * 0.92]] as [string, MM, Who, number][]).map(([name, m, who, h]) => {
    const a = play(name, D, m, t, [0, 0, 0], h, { blink: true, seed: name === "sir" ? 3 : 7, extra: { who } });
    const face0 = { pupil: 1, ...a.o.face };
    const face = name === "sir" && t >= MOUTH.t0 - 0.05 && t <= MOUTH.t0 + MOUTH.len + 0.1 ? { ...face0, mouth: MOUTH.mouth[f] } : face0;
    const fix = (l: Pose["legL"]) => (l && (l as { th?: unknown }).th === undefined ? { ...l, x: ((l as { x?: number }).x ?? 0) - hipLL(who) } : l);
    const pose = { ...a.pose, legL: fix(a.pose.legL), legR: fix(a.pose.legR) } as Pose;
    return { name, who, x: FM.W / 2 + a.at[0] * FM.PPM, sk: solve(D.props(who), pose, a.heading), o: { ...a.o, handL: handAt(HANDS[name].L, t), handR: handAt(HANDS[name].R, t), face } };
  });
};
/** pixels per design unit for a figure of height h metres */
export const scaleOf = (who: Who) => { const P = D.props(who), tall = P.thigh + P.shin + P.ankle + P.spine + P.neck + P.head; return (FM.PPM * (who === "sir" ? FM.HM : FM.HM * 0.92)) / tall; };
export { D as FLAT_A };
export { shoeDrawn, FLAT_SPECS } from "./designs/flat";
