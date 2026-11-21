// The motion test of the flat 2D style A Knopp (Jesper, 21 Nov 2026: "ett rörelseprov med bara A, cirka 10 sekunder, på en platt målad
// bakgrund med marklinje: Sir går in från sidan, vänder sig mot kameran, pekar, säger en mening (munnen följer rösten), blir rädd, springer
// ut. Ada står bredvid, reagerar och pekar"). The model only: who stands where, in which pose, at each time. FlatMotion.tsx draws it, and
// scripts/flat_check.mjs checks its feet. The skeleton (rig.ts), the motion library (motion.ts Mover: planted feet) and the gesture
// library (stage/gestures.ts) are used as they are.
import { solve, Pose, Sk } from "./rig";
import { FigOpts, Face, Who } from "./designs/common";
import { FLAT } from "./designs/flat";
import { mover, mt, ease, type MM } from "./stage/acting";
import { play } from "./stage/film";
import { GESTURES, upper } from "./stage/gestures";
import MOUTH from "./rorelseprov-mouth.json";

export const FM = { W: 1080, H: 1920, FPS: 30, SECONDS: 10, GY: 1500, /** pixels per metre and the figures' height in metres */ PPM: 720, HM: 1.0 };
const D = FLAT[0];
const SCARED: Face = { wide: 1, brow: 1, sad: 0.6, pupil: 0.5, mouth: 0.5, smile: -0.7 };
const REST: Pose["armL"] = [[4, 13], [16, 9]];

// ---- Sir: walks in from the left, turns to the lens, points to the right, speaks, is scared, turns and runs out to the left ----
// (Knopp's legs are short: at the library's step of 0.52 leg lengths a metre took nine steps, 4.5 s. Longer steps, a shorter way in)
const sir: MM = mover(D, FM.HM, -0.98, 0, 90);
// (the Mover gives a foot's place sideways from the middle of the pelvis, and the skeleton adds the hip's half-width on top: Knopp's hips are
//  wide for his short legs, 0.30 leg lengths, so a planted foot sat a hip's width out and slid along the ground line as he turned. The feet
//  stand under the hips (w), and the hip's width is taken off again in figsAt)
const hipLL = (who: Who) => { const P = D.props(who); return P.hipW / (P.thigh + P.shin); };
sir.w = hipLL("sir");
sir.stand(0.1).walk(mt(sir, 0.62), { step: 0.8 });
const T_TURN = sir.t; sir.turn(-90, 0.6, 0.22);
const T_POINT = sir.t + 0.1;
// (the gesture library's point, to his left (the picture's right), where Ada stands: its arm and turn mirrored to the other side)
const pt = GESTURES.point.pose("side", 0) as Pose, h0 = pt.head ?? [0, 0, 0];
ease(sir, T_POINT, { ...upper({ ...pt, armL: pt.armR, armR: REST, twist: -(pt.twist ?? 0), head: [-h0[0], h0[1], h0[2]] }) }, 0.45, { handL: "point", handR: "relaxed", face: { smile: 0.5, brow: 0.5 } });
const T_SCARED = 5.55;
ease(sir, T_SCARED - 0.35, { armL: REST, armR: REST, twist: 0, head: [0, 0, 0] }, 0.3, { handL: "relaxed", handR: "relaxed", face: { smile: 0.2 } });
// (scared: a small jerk back, the arms up, the eyes wide)
ease(sir, T_SCARED, { lean: -8, armL: [[30, 30], [100, 20]], armR: [[30, 30], [100, 20]], head: [0, -6, 0] }, 0.12, { handL: "open", handR: "open", face: SCARED });
sir.stand(T_SCARED + 0.55 - sir.t);
const T_RUN_TURN = sir.t; sir.turn(-90, 0.5, 0.22);
const T_RUN = sir.t;
ease(sir, T_RUN, { lean: 30, armL: [[46, 8], [126, 6]], armR: [[-60, 12], [10, 6]], head: [0, -14, 0] }, 0.2, { handL: "fist", handR: "fist", face: { ...SCARED, mouth: 0.4 } });
sir.run(mt(sir, 2.6), { keep: true });

// ---- Ada: stands to the right, turned a little toward him; reacts when he is scared, then points the way he runs ----
const ada: MM = mover(D, FM.HM * 0.92, 0.42, 0, -22);      // (0.42: at 0.30 his pointing hand came to her arm) ada.w = hipLL("baker");
ada.stand(10);
ease(ada, 3.3, { head: [-6, 2, 0] }, 0.5, { face: { smile: 0.3, brow: 0.3, gaze: [-0.6, 0] } });
ease(ada, T_SCARED + 0.05, { lean: -5, armL: [[20, 20], [70, 10]], armR: [[20, 20], [70, 10]], head: [0, -4, 0] }, 0.14, { handL: "open", handR: "open", face: SCARED });
const pa = GESTURES.point.pose("side", 0) as Pose;
ease(ada, T_RUN + 0.1, { ...upper(pa), armL: REST, lean: 0 }, 0.45, { handR: "point", handL: "relaxed", face: { ...SCARED, mouth: 0.35, gaze: [-0.7, 0] } });

export const EVENTS = { T_TURN, T_POINT, T_SCARED, T_RUN_TURN, T_RUN, LINE: MOUTH.t0, LINE_END: MOUTH.t0 + MOUTH.len };

export type Fig = { name: string; who: Who; x: number; sk: Sk; o: FigOpts };
/** the two figures at time t: where they stand in the picture (x in pixels), their solved skeleton and their drawing options */
export const figsAt = (t: number): Fig[] => {
  const f = Math.max(0, Math.min(MOUTH.mouth.length - 1, Math.round(t * FM.FPS)));
  return ([["sir", sir, "sir", FM.HM], ["ada", ada, "baker", FM.HM * 0.92]] as [string, MM, Who, number][]).map(([name, m, who, h]) => {
    const a = play(name, D, m, t, [0, 0, 0], h, { blink: true, seed: name === "sir" ? 3 : 7, extra: { who } });
    const face = name === "sir" && t >= MOUTH.t0 - 0.05 && t <= MOUTH.t0 + MOUTH.len + 0.1 ? { ...a.o.face, mouth: MOUTH.mouth[f] } : a.o.face;
    // (walking and running his loose hands are drawn as loose fists: the relaxed hand changes drawing at 50 degrees from hanging (edge-on
    //  hanging, open swung out), and the swinging arm crossed it every step, a hand that changed shape from frame to frame)
    const moving = name === "sir" && (t < T_TURN + 0.1 || t > T_RUN_TURN);
    const hands = moving ? { handL: a.o.handL === "relaxed" ? "fist" as const : a.o.handL, handR: a.o.handR === "relaxed" ? "fist" as const : a.o.handR } : {};
    const fix = (l: Pose["legL"]) => (l && (l as { th?: unknown }).th === undefined ? { ...l, x: ((l as { x?: number }).x ?? 0) - hipLL(who) } : l);
    const pose = { ...a.pose, legL: fix(a.pose.legL), legR: fix(a.pose.legR) } as Pose;
    return { name, who, x: FM.W / 2 + a.at[0] * FM.PPM, sk: solve(D.props(who), pose, a.heading), o: { ...a.o, ...hands, face } };
  });
};
/** pixels per design unit for a figure of height h metres */
export const scaleOf = (who: Who) => { const P = D.props(who), tall = P.thigh + P.shin + P.ankle + P.spine + P.neck + P.head; return (FM.PPM * (who === "sir" ? FM.HM : FM.HM * 0.92)) / tall; };
export { D as FLAT_A };
