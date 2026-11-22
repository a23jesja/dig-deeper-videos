// The eight shot types of the library in the flat 2D look (Jesper, 21 Nov 2026: "Gör sedan om bildtyperna i biblioteket i platt 2D (stå
// och prata, gå, vända sig, hålla med båda händerna, peka, reagera, sitta, öppna en dörr), ett kort klipp per bildtyp"). Each clip is
// 3-5 s on a flat background with a ground line; the drawing is FlatClip.tsx, the checks scripts/clip_check.mjs <id>.
// v2 (the review of v1): framed as in a Short (a camera: "medium" for talk, hold and point, "full" for walk, turn, sit, door and react);
// blinks with half lids; no spade standing on its tip; per clip the review's points.
import { solve, type Pose } from "../rig";
import type { Face } from "../designs/common";
import { GESTURES, upper } from "../stage/gestures";
import { ease, mt } from "../stage/acting";
import { play } from "../stage/film";
import { FM, D, figure, castAt, poseAt, jointPx, reach, px, scaleOf, footY, camFor, fitCam, viewOf, type Clip, type Cast, type Fig, type HS, type Mouth } from "./clipKit";
import MOUTH01 from "./c01-mouth.json";

type G = CanvasRenderingContext2D;
const INK = "#241726";
const REST: Pose["armL"] = [[4, 13], [16, 9]];
const SCARED: Face = { wide: 1, brow: 1, sad: 0.6, pupil: 0.5, mouth: 0.5, smile: -0.7 };
const smooth = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
const lerpArm = (a: Pose["armL"], b: Pose["armL"], w: number): Pose["armL"] => [0, 1].map((i) => [0, 1].map((k) => a![i][k] + (b![i][k] - a![i][k]) * w)) as Pose["armL"];
const shape = (g: G, pts: [number, number][], fill: string, w = 8) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fillStyle = fill; g.fill(); if (w) { g.lineWidth = w; g.lineJoin = "round"; g.strokeStyle = INK; g.stroke(); } };
const rect = (g: G, x: number, y: number, w: number, h: number, fill: string, lw = 8) => shape(g, [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], fill, lw);
const LINE_TOP = FM.GY - FM.LINE / 2;
/** an envelope: 0 before a, rising over up, 1 to b, falling over down */
const env = (t: number, a: number, up: number, b: number, down: number) => (t < a ? 0 : t < a + up ? smooth((t - a) / up) : t < b ? 1 : t < b + down ? 1 - smooth((t - b) / down) : 0);
const sampleX = (m: ReturnType<typeof figure>, t: number) => play("x", D, m, t, [0, 0, 0], 1, {}).at[0];
/** Sir's crown in the world (his height above his soles) */
const CROWN = footY("sir") - FM.PPM * FM.HM;
const MED = 2.7, FULL = 1.7;
/** a medium shot on a figure at x: the crown 40 px under the top */
const medium = (x: number) => camFor(MED, x, CROWN - 40);
/** a full shot centred at x: the ground line 70 px over the bottom */
const full = (x: number, z = FULL) => camFor(z, x, FM.GY + 70 - FM.H / z);

// ---------------------------------------------------------------- 01 stand and talk ----------------------------------------------------------------
// Sir to the lens, medium shot, George's line ("Every legend has a grain of truth. Let us dig it up."): the explaining hands on "grain of
// truth", one hand lifts on "dig it up". Standing still: weight, breath, head. (Ada left out: in a 9:16 medium shot one figure fills it.)
const c01 = (): Clip => {
  const M = MOUTH01 as Mouth, sir = figure("sir", 0, 0);
  sir.stand(6);
  ease(sir, -1, {}, 0.01, { face: { pupil: 1, smile: 0.3, brow: 0.3 } });
  const ex = GESTURES.explain.pose("side", 0) as Pose;
  sir.actAt(1.15, upper(ex), 1.3, { in: 0.32, out: 0.36, glide: true, antic: 0, face: { pupil: 1, smile: 0.4, brow: 0.6 } });
  sir.actAt(2.75, { armR: [[30, 16], [118, -4]], head: [0, -4, 0] }, 1.0, { in: 0.28, out: 0.4, glide: true, antic: 0, face: { pupil: 1, smile: 0.6, brow: 0.5 } });
  // (each hand's change in the middle of its arm's move, where the hand moves fastest: changed at rest it read as a jump)
  const cast: Cast[] = [{ name: "sir", m: sir, who: "sir", mouth: M, hands: { L: [[0, "relaxed"], [1.31, "open"], [2.27, "relaxed"]], R: [[0, "relaxed"], [1.31, "open"], [3.55, "relaxed"]] } }];
  // (the camera fitted to hold him whole, his hands through the gesture and his cap, with a margin: at 2.7 both hands and the cap were cut)
  const cam = fitCam(cast, 4.6, MED);
  return { id: "c01", title: "01 Stå och prata", seconds: 4.6, cast, events: { LINE: M.t0, LINE_END: M.t0 + M.len }, audio: "craft/bildtyp-01.wav", bg: 0, bgOpts: { spade: false, pit: false },
    shot: "medium", camera: () => cam };
};

// ---------------------------------------------------------------- 02 walk ----------------------------------------------------------------
// Full shot, the camera still: Sir walks in from outside the picture's left edge, in profile, his hands in loose fists swinging, to the
// middle, stops, and looks to the lens.
const c02 = (): Clip => {
  // (he starts with his nose at the picture's edge, so he is coming in from the first frame: the first 0.8 s were empty, the review of v2)
  const cam = full(px(0)), x0m = (cam.cx - FM.W / (2 * cam.z) - 110 - FM.W / 2) / FM.PPM;
  const sir = figure("sir", x0m, 90);
  // (steps of 1.0 leg lengths, longer than his shoe, so a heel never lands where the other toe stands; the arm swing is read against the step
  //  taken. He closes with the feet nearly together, 0.22 apart, and his arms come down as he stops)
  // (he slows into the stop with two shorter steps: from a full stride the rear leg held his body low and, lifted for the closing step,
  //  let it jump up 13 px in a frame)
  // (each step 0.6 s: at 0.5 s the long step's dip at both feet down was 10 px a frame)
  sir.walk(mt(sir, -x0m - 0.22), { step: 0.72, tau: 0.6, keep: true }); sir.walk(mt(sir, 0.22), { step: 0.45, tau: 0.6, stagger: -0.25 });
  const T_STOP = sir.t; sir.stand(6);
  ease(sir, T_STOP + 0.15, { head: [-26, 0, 0] }, 0.45, { face: { pupil: 1, smile: 0.4, gaze: [-0.3, 0] } });
  ease(sir, -1, {}, 0.01, { face: { pupil: 1, smile: 0.2 } });
  return { id: "c02", title: "02 Gå", seconds: Math.min(5, Math.ceil((T_STOP + 1.0) * 30) / 30), events: { T_STOP }, bg: 0, bgOpts: { spade: false, pit: false }, shot: "full", camera: () => cam,
    // (walking hands are loose fists: a relaxed hand swung out past 50 degrees is drawn open, palm up, as if offering something)
    cast: [{ name: "sir", m: sir, who: "sir", hands: { L: [[0, "fist"]], R: [[0, "fist"]] } }],
    offFrameOK: (n, t) => n === "sir" && t < T_STOP - 0.6 };
};

// ---------------------------------------------------------------- 03 turn ----------------------------------------------------------------
// Full shot. Sir in profile to the right turns to the lens (through three-quarter), holds, and turns on to three-quarter left, where the
// monocle stays in sight on the far eye; the turns slow (1.0 s and 0.8 s), the feet turning on their balls, low, never over each other.
const c03 = (): Clip => {
  // (the feet together: staggered 0.8 he stood in a frozen stride with an arm out and rose 40 px when the turn brought them together)
  const sir = figure("sir", 0, 90);
  sir.stand(0.55); ease(sir, 0.4, { head: [8, 3, 0] }, 0.15, { face: { pupil: 1, smile: 0.3 } });
  // (v4: the turns as in v3, 1.0 and 0.8 s, which Jesper approved; slower turns, 1.3 and 1.0 s, were prepared for the independent review
  //  of v3, but an approved clip keeps its motion and changes only where the drawing order or a fault fix changes it)
  const T1 = sir.t; sir.turn(-90, 1.0, 0.03); ease(sir, T1, { head: [0, 0, 0] }, 0.4);
  sir.stand(0.7); ease(sir, sir.t - 0.15, { head: [-8, 3, 0] }, 0.15);
  const T2 = sir.t; sir.turn(-52, 0.8, 0.03); ease(sir, T2, { head: [0, 0, 0] }, 0.4);
  sir.stand(3);
  return { id: "c03", title: "03 Vända sig", seconds: 4.2, events: { T1, T2 }, bg: 0, bgOpts: { spade: false, pit: false }, shot: "full", camera: () => full(px(0)),
    cast: [{ name: "sir", m: sir, who: "sir", hands: { L: [[0, "relaxed"]], R: [[0, "relaxed"]] } }] };
};

// ---------------------------------------------------------------- 04 hold with both hands ----------------------------------------------------------------
// Medium shot. Sir holds a small wooden chest with both hands at his waist and lifts it a little to look at it. A real grip: each hand on
// the chest's side, its back and heel outside the side edge, the thumb over the front, the fingers going round the edge behind the chest.
const BOX = { w: 150, h: 104 };
const BOX_UP = 250, BOX_LIFT = 16;
const boxAt = (t: number): [number, number] => { const lift = env(t, 1.3, 0.7, 2.7, 0.7); return [px(0), footY("sir") - BOX_UP - BOX_LIFT * lift]; };
const c04 = (): Clip => {
  const sir = figure("sir", 0, 0); sir.stand(6);
  ease(sir, -1, {}, 0.01, { face: { pupil: 1, smile: 0.3, gaze: [0, 0.6] } });
  ease(sir, 1.3, { head: [0, 8, 0] }, 0.6, { face: { pupil: 1, smile: 0.6, brow: 0.5, gaze: [0, 0.8] } });
  ease(sir, 2.9, { head: [0, 0, 0] }, 0.6, { face: { pupil: 1, smile: 0.4, gaze: [0, 0.3] } });
  // (the wrists inside the chest's sides, so the figure's own hands lie behind it; the visible hand is drawn over its side edge)
  // (the wrists just inside the chest's sides, the elbows kept under the wrists: an elbow lifted out put the sleeve over the chest's corner,
  //  the review of v2. Elbows held out beyond the sides, to show more forearm, could not be reached with the hands on the edges, v3)
  const side = (t: number, d: 1 | -1): [number, number] => { const [cx, cy] = boxAt(t); return [cx + d * (BOX.w / 2 - 16), cy + 4]; };
  // (v4: every frame's search starts from, and is pulled toward, the arms found at the start, so it keeps one answer: from the breathing
  //  pose the elbow swapped between two near-equal answers, 5 px back and forth three frames running at 2.5 s, v4 draft)
  const solve2 = (t: number, p: Pose, heading: number): Pose => { const x = px(0); return reach("sir", x, reach("sir", x, p, heading, "L", side(t, 1), false, { elbowBelow: true }), heading, "R", side(t, -1), false, { elbowBelow: true }); };
  let ref: Pose | null = null;
  const hold = (t: number, p: Pose, heading: number): Pose => { if (!ref) { const a = poseAt({ name: "sir", m: sir, who: "sir" }, 0); ref = solve2(0, a.pose, a.heading); }
    return solve2(t, { ...p, armL: ref.armL, armR: ref.armR }, heading); };
  const cast: Cast[] = [{ name: "sir", m: sir, who: "sir", hands: { L: [[0, "grip"]], R: [[0, "grip"]] }, pose: hold }], cam = fitCam(cast, 4.4, MED);
  return { id: "c04", title: "04 Hålla med båda händerna", seconds: 4.4, bg: 0, bgOpts: { spade: false, pit: false }, events: { LIFT: 1.3, DOWN: 2.7 }, shot: "medium", camera: () => cam, cast,
    contacts: [{ who: "sir", side: "L", t0: 0, t1: 99, at: (t) => side(t, 1), tol: 4, what: "his left hand at the chest's right side" }, { who: "sir", side: "R", t0: 0, t1: 99, at: (t) => side(t, -1), tol: 4, what: "his right hand at the chest's left side" }],
    over: (g, t, f) => { if (f.name !== "sir") return; const [cx, cy] = boxAt(t), x = cx - BOX.w / 2, y = cy - BOX.h / 2;
      rect(g, x, y, BOX.w, BOX.h, "#a0683c"); rect(g, x, y + 30, BOX.w, 12, "#7a4a28", 6); rect(g, cx - 14, y + 44, 28, 30, "#e8c45a", 6);
      for (const s of [-1, 1]) rect(g, cx + s * (BOX.w / 2 - 26) - 9, y - 1, 18, BOX.h + 2, "#7a4a28", 6);
      // each hand: its heel and back round the side edge (part outside, part over the front), the fingers' tips going on round the edge out
      // of sight behind, the thumb over the front toward the middle
      for (const d of [-1, 1]) { const ex = cx + d * BOX.w / 2, hy = cy + 6;
        g.save(); g.translate(ex, hy);
        g.beginPath(); g.moveTo(d * 20, -34); g.quadraticCurveTo(d * 30, 0, d * 20, 34); g.lineTo(-d * 6, 34); g.quadraticCurveTo(-d * 12, 0, -d * 6, -34); g.closePath(); g.fillStyle = "#f7c9a3"; g.fill(); g.lineWidth = 7; g.strokeStyle = INK; g.stroke();
        for (const yy of [-14, 2, 18]) { g.beginPath(); g.moveTo(-d * 4, yy); g.lineTo(d * 10, yy + 2); g.lineWidth = 3.5; g.stroke(); }      // (the knuckles' creases round the edge)
        g.beginPath(); g.ellipse(-d * 22, -26, 18, 10, d * 0.35, 0, Math.PI * 2); g.fillStyle = "#f7c9a3"; g.fill(); g.lineWidth = 6; g.stroke();      // the thumb over the front
        g.restore(); } } };
};

// ---------------------------------------------------------------- 05 point ----------------------------------------------------------------
// Medium shot on the quay. Out at sea, near the horizon, a ship; Sir looks down at it first, then points at it with the elbow visibly bent,
// the finger out under a second, and lowers the arm. Finger and eyes on the same ship. (v3: the ship larger and nearer the horizon's front,
// below his eyes, which look down at it; no bollard on his ground line; the camera holds him and the ship whole.)
// (the horizon at 1265, so the ship lies under his pipe: at 1200 the pipe's bowl hid its sail)
const HORIZON = 1265, SHIP_S = 1.05;      // (smaller: at 1.5 the ship looked near, the review of v3)
const PT_HEAD = 25;      // (v4: he faces 25 degrees off the lens, so his left arm is on the ship's side of him)
const shoulderPx = (x: number, p: Pose, heading: number, side: "L" | "R" = "R"): [number, number] => { const sk = solve(D.props("sir"), p, heading), q = sk.j[`sh${side}`] as unknown as number[], s = scaleOf("sir"); return [x + q[0] * s, footY("sir") + q[1] * s]; };
const c05 = (): Clip => {
  // (the ship on the horizon line, its hull's foot on it: lower in the water, near him, it read as a toy boat)
  const sx = px(0) - 90, SHIP: [number, number] = [sx + 205, HORIZON - 20 * SHIP_S], sir = figure("sir", (sx - FM.W / 2) / FM.PPM, PT_HEAD); sir.stand(6);
  ease(sir, -1, { head: [6, 0, 0] }, 0.01, { face: { pupil: 1, smile: 0.2, gaze: [0.2, 0] } });
  // (the eyes go first, down to the ship below his eye line: they looked up and right while the ship lay 35 degrees below, the review of v2)
  ease(sir, 0.5, { head: [18, 8, 0] }, 0.35, { face: { pupil: 1, smile: 0.5, brow: 0.7, gaze: [0.9, 0.7] } });
  const UP = 1.05, HOLD0 = 1.35, HOLD1 = 2.1, DOWN = 2.5, P_ON = 1.25, P_OFF = 2.2;
  // (v4: the arm found once, from his pose as the point is held, and kept: found anew each frame from the breathing pose, the search
  //  swapped between two near-equal arms and the pointing arm jumped 11 px and back on every other frame of the hold, v4 draft)
  let held: Pose["armL"] | null = null;
  const heldArm = () => { if (held) return held; const { pose: p, heading } = poseAt({ name: "sir", m: sir, who: "sir", seed: 7 }, HOLD0);
    const P = D.props("sir"), s = scaleOf("sir"), reachLen = (P.upper + P.fore + P.hand * 0.6) * s * 0.78;
    const sh = shoulderPx(sx, p, heading, "L"), dx = SHIP[0] - sh[0], dy = SHIP[1] - sh[1], l = Math.hypot(dx, dy);
    // (the elbow bent 35 degrees or more in the picture: reached straight it showed no elbow, the review of v2)
    // (v4: he points with his left arm, on the ship's side of his body, the elbow out from it: the right arm, pointing across him in
    //  profile, laid its upper arm over his chest as a lump, Jesper on v3: "överarmen får inte bli en klump framför bröstet")
    held = reach("sir", sx, p, heading, "L", [sh[0] + (dx / l) * reachLen, sh[1] + (dy / l) * reachLen], true, { bend: 35, elbowOut: sh[0] + 34 }).armL; return held; };
  const aim = (t: number, p: Pose): Pose => { const w = env(t, UP, HOLD0 - UP, HOLD1, DOWN - HOLD1); return w <= 0 ? p : { ...p, armL: lerpArm(p.armL, heldArm(), w) }; };
  // (blink seed 7: he blinks at 0.47 s and 3.37 s, never during the look and the point; it fell in the point, the review of v3)
  const cast: Cast[] = [{ name: "sir", m: sir, who: "sir", seed: 7, pose: aim, hands: { R: [[0, "relaxed"]], L: [[0, "relaxed"], [P_ON, "point"], [P_OFF, "fist"]] } }];
  const cam = fitCam(cast, 4.0, 2.4, [[SHIP[0] + 30 * SHIP_S + 20, SHIP[1] - 46 * SHIP_S], [SHIP[0] - 30 * SHIP_S, SHIP[1] + 22 * SHIP_S]]);
  const harbour = (g: G) => {
    rect(g, -40, -40, 1160, 2000, "#9ad3e6", 0); rect(g, -40, HORIZON, 1160, LINE_TOP - HORIZON + 6, "#2f7fb3", 0);
    g.beginPath(); g.moveTo(-40, HORIZON); g.lineTo(1120, HORIZON); g.lineWidth = 6; g.strokeStyle = INK; g.stroke();
    for (const [x, y, k] of [[300, 900, 1], [760, 820, 0.7]] as [number, number, number][]) { g.beginPath(); for (const [ddx, ddy, r] of [[-60, 10, 40], [-10, -14, 54], [50, 6, 42]]) g.arc(x + ddx * k, y + ddy * k, r * k, 0, Math.PI * 2); g.fillStyle = "#fffaf0"; g.fill(); }
    g.save(); g.translate(SHIP[0], SHIP[1]); g.scale(SHIP_S, SHIP_S);
    shape(g, [[-30, 8], [30, 8], [21, 20], [-21, 20]], "#6b4a2f", 4); g.beginPath(); g.moveTo(0, 8); g.lineTo(0, -40); g.lineWidth = 4; g.strokeStyle = INK; g.stroke();
    shape(g, [[2, -38], [24, 4], [2, 4]], "#fffaf0", 3); shape(g, [[-2, -30], [-19, 4], [-2, 4]], "#fffaf0", 3);
    g.beginPath(); g.moveTo(-34, 22); g.quadraticCurveTo(0, 28, 34, 22); g.lineWidth = 3; g.strokeStyle = "#e6f2f8"; g.stroke(); g.restore();
    rect(g, -40, LINE_TOP, 1160, 480, "#b07a46", 0); g.beginPath(); g.moveTo(-40, FM.GY); g.lineTo(1120, FM.GY); g.lineWidth = 12; g.strokeStyle = INK; g.stroke(); };
  return { id: "c05", title: "05 Peka", seconds: 4.0, events: { UP, HOLD0, HOLD1, DOWN, P_ON, P_OFF }, ownBg: harbour, shot: "medium", camera: () => cam, cast,
    points: [{ who: "sir", t0: HOLD0, t1: HOLD1, side: "L", target: SHIP, horizon: SHIP[1] }] };
};

// ---------------------------------------------------------------- 06 react ----------------------------------------------------------------
// Full shot (the crab is on the ground: a closer frame would lose it). A big crab scuttles in from outside the picture's right edge toward
// Sir; he jerks back, arms up, eyes wide, pipe drooping, and then looks down at it, wary, while it stops well inside the picture and waves
// a claw. (v3: he faces 25 degrees off the lens, so his head stays in one three-quarter view through the jerk; the camera holds him whole.)
// (the crab in sight from 0.25 s, before he sees it at 0.95 s: he reacted before it showed, the review of v3)
const CRAB_IN = 0.15, CRAB_STOP = 1.3, CRAB_S = 1.5;      // (v4: 1.5 and Sir 0.22 m left, so his guard stays well clear of the claws, Jesper on v3)
const c06 = (): Clip => {
  // (v4: 32 degrees off the lens, so the head is three-quarter from the first frame to the last: at 25 the head idle carried it over the
  //  line between front and three-quarter at 0.57 s, and the drawing changed with nothing moving, v3 and the v4 draft)
  const sir = figure("sir", -0.22, 32); sir.stand(6);
  ease(sir, -1, {}, 0.01, { face: { pupil: 1, smile: 0.3 } });
  ease(sir, 0.95, { head: [14, 4, 0] }, 0.25, { face: { pupil: 1, brow: 0.4, gaze: [0.8, 0.4] } });      // (he sees it come)
  const T_SCARED = 1.25;
  // (the hands come up in front of his chest, not out to the side: flung out, his left hand came within 20 px of the crab's claw)
  // (v4: one reaction, afraid, all the way: Jesper on v3, "en tydlig reaktion (rädd ELLER förtjust, inte båda)". The hands by his face read
  //  as delight, and the face eased toward curiosity as he looked down. Now he jerks back, the hands up in front of his chest as a guard,
  //  palms toward the crab, the face afraid, and he stays afraid: leaning away, the guard up and trembling, the brows up, the mouth a grimace)
  ease(sir, T_SCARED, { lean: -10, py: -0.04, armL: [[16, 66], [112, 10]], armR: [[18, 38], [122, 10]], head: [8, -8, 0] }, 0.22, { face: { ...SCARED, pupil: 0.62, gaze: [0.4, 0.5] } });      // (the pupils small but whole, inside the eye: at 0.45 and [0.8, 0.9] they sat on the rim and the near eye read empty at phone size)
  ease(sir, 2.2, { lean: -8, py: -0.05, armL: [[14, 62], [108, 10]], armR: [[16, 34], [118, 10]], head: [14, 14, 0] }, 0.5, { face: { ...SCARED, pupil: 0.58, mouth: 0.4, gaze: [0.3, 0.6] } });
  // (the guard trembles a little once it is up: 2 degrees at 3 Hz, so the held fear is never dead still; at 7 Hz, a back and forth every
  //  two frames at 30 fps, the hands jittered and the flicker check caught them, v4 draft)
  const shake = (t: number, p: Pose): Pose => { const w = env(t, T_SCARED + 0.3, 0.3, 99, 0.1); if (w <= 0) return p; const d = 2 * w * Math.sin(t * 2 * Math.PI * 3);
    const sh = (a: Pose["armL"], k: number): Pose["armL"] => [[a![0][0] + d * k, a![0][1]], [a![1][0] - d * k, a![1][1]]];
    return { ...p, armL: sh(p.armL, 1), armR: sh(p.armR, -1) }; };
  const cast: Cast[] = [{ name: "sir", m: sir, who: "sir", pose: shake, hands: { L: [[0, "relaxed"], [T_SCARED + 0.06, "open"]], R: [[0, "relaxed"], [T_SCARED + 0.06, "open"]] } }];
  // (it stops 0.22 m right of the middle, well inside: it ended 10-20 px from the edge, the review of v2; the camera holds Sir and the crab)
  const crabEnd = px(0.30), cam = fitCam(cast, 4.0, 1.75, [[crabEnd + 75 * CRAB_S, LINE_TOP - 95 * CRAB_S], [crabEnd - 75 * CRAB_S, FM.GY + 60]]);
  const crabStart = viewOf(cam).x1 + 75 * CRAB_S + 20;
  const crabAt = (t: number): [number, number] | null => { if (t < CRAB_IN) return null; const u = smooth(Math.min(1, (t - CRAB_IN) / (CRAB_STOP - CRAB_IN))); return [crabStart + (crabEnd - crabStart) * u, LINE_TOP]; };
  return { id: "c06", title: "06 Reagera", seconds: 4.0, bg: 0, bgOpts: { spade: false, pit: false }, events: { CRAB_IN, CRAB_STOP, T_SCARED }, shot: "full", camera: () => cam, cast,
    // (the claws' tips, raised and waving, for the check: his hand came onto a claw in v3)
    appear: [{ name: "crab", t0: CRAB_IN, from: "right", at: crabAt, points: (t) => { const c = crabAt(t); if (!c) return []; return [-1, 1].flatMap((d) => [[c[0] + d * (34 + 10 + 13) * CRAB_S, c[1] - (50 + 40 + 17) * CRAB_S], [c[0] + d * (34 + 8) * CRAB_S, c[1] - 76 * CRAB_S], [c[0] + d * 60 * CRAB_S, c[1] - 20 * CRAB_S]] as [number, number][]); } }],
    front: (g, t) => { const c = crabAt(t); if (!c) return; const [x, y] = c, walking = t < CRAB_STOP, k = Math.sin(t * 40) * (walking ? 1 : 0);
      g.save(); g.translate(x, y); g.scale(CRAB_S, CRAB_S); g.lineCap = "round"; g.lineJoin = "round";
      for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { const lx = s * (16 + i * 13); g.beginPath(); g.moveTo(lx, -26); g.lineTo(lx + s * 18, -20 + (i % 2 ? k : -k) * 4); g.lineTo(lx + s * 24, 0); g.lineWidth = 6; g.strokeStyle = INK; g.stroke(); }
      g.beginPath(); g.ellipse(0, -34, 44, 26, 0, 0, Math.PI * 2); g.fillStyle = "#e0553d"; g.fill(); g.lineWidth = 7; g.strokeStyle = INK; g.stroke();
      const wave = walking ? 0 : Math.sin((t - CRAB_STOP) * 9) * 0.35;
      for (const s of [-1, 1]) { g.save(); g.translate(s * 34, -50); g.rotate(s * -0.5 + (s < 0 ? wave : 0)); g.beginPath(); g.moveTo(0, 0); g.lineTo(s * 8, -26); g.lineWidth = 7; g.strokeStyle = INK; g.stroke();
        g.beginPath(); g.ellipse(s * 10, -40, 13, 17, 0, 0, Math.PI * 2); g.fillStyle = "#e0553d"; g.fill(); g.lineWidth = 6; g.stroke(); g.beginPath(); g.moveTo(s * 10, -40); g.lineTo(s * 10, -56); g.lineWidth = 6; g.stroke(); g.restore(); }
      for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * 10, -56); g.lineTo(s * 12, -72); g.lineWidth = 5; g.strokeStyle = INK; g.stroke(); g.beginPath(); g.arc(s * 12, -76, 8, 0, Math.PI * 2); g.fillStyle = "#fff8d0"; g.fill(); g.lineWidth = 4; g.stroke(); g.beginPath(); g.arc(s * 12 - 3, -76, 3.5, 0, Math.PI * 2); g.fillStyle = INK; g.fill(); }
      g.restore(); } };
};

// ---------------------------------------------------------------- 07 sit ----------------------------------------------------------------
// Full shot. Sir stands in front of a crate, facing left, leans forward and sits back onto it: the crate at knee height behind him, his seat
// on its top, his thighs level on it and out past its front, the knees forward, the shins down to his feet on the ground in front of the
// crate; seated, his hands go to his knees. He stays seated. (v3: the coat's hem comes up as the thighs bend, so the thighs show; the crate
// behind his seat with its front edge under the thighs, clear of his feet.)
const c07 = (): Clip => {
  const sir = figure("sir", 0, -90); sir.stand(0.7);
  ease(sir, -1, {}, 0.01, { face: { pupil: 1, smile: 0.3 } });
  const T_SIT = sir.t;
  // (down over 1.2 s with no dip first: over 0.9 s with a dip the body sank 9 px in a frame)
  // (back first, then down: lowered while still in front of the crate, his thigh went below its top as he came back over it, v3)
  // (v4: glide, so the move back starts from rest: it started at full speed, 20 px in the first frame, v4 draft)
  sir.act({ pz: -0.52, lean: 6, head: [0, 2, 0] }, 30, { in: 0.8, out: 0.01, antic: 0, over: 0, wait: false, glide: true });
  sir.actAt(T_SIT + 0.3, { py: -0.52 }, 30, { in: 1.1, out: 0.01, antic: 0, glide: true });
  sir.actAt(T_SIT, { lean: 16 }, 1.1, { in: 0.45, out: 0.5, glide: true, antic: 0 });
  sir.stand(6);
  const T_KNEES = T_SIT + 1.15;
  const knees = (t: number, p: Pose, heading: number): Pose => { const w = env(t, T_KNEES, 0.5, 99, 0.1); if (w <= 0) return p;
    const x = px(0), sk = solve(D.props("sir"), p, heading), s = scaleOf("sir"), K = (j: "knL" | "knR"): [number, number] => { const q = sk.j[j] as unknown as number[], h = sk.j[j === "knL" ? "hipL" : "hipR"] as unknown as number[], u = 0.4;
      // (v4: the hands rest on the thighs, behind the knees, so the knee's bend shows: on the knees the fists hid it)
      return [x + (h[0] + (q[0] - h[0]) * u) * s, footY("sir") + (h[1] + (q[1] - h[1]) * u) * s - 22]; };
    // (the arms in the picture's plane, abdFix: the far arm's two near-equal answers swapped and its elbow jumped 54 px and back, v4 draft)
    const q = reach("sir", x, reach("sir", x, p, heading, "L", K("knL"), false, { abdFix: 8 }), heading, "R", K("knR"), false, { abdFix: 8 }); return { ...p, armL: lerpArm(p.armL, q.armL, w), armR: lerpArm(p.armR, q.armR, w) }; };
  const cast: Cast[] = [{ name: "sir", m: sir, who: "sir", pose: knees, hands: { L: [[0, "fist"]], R: [[0, "fist"]] } }];
  // (the crate's top under the backs of his thighs, half a leg's width under the hip; its front edge a third of the thigh in front of the
  //  hip, so the thighs reach out past it to the knees; its back edge behind his seat)
  // (the crate's top at the lowest point of the thighs' undersides over it, its outline touching: from the pelvis alone the thigh, sloping
  //  a little to the knee, lay 15-20 px into the crate, the review of v3)
  const g0 = castAt(cast, T_SIT + 2.5)[0], s = scaleOf("sir"), pel = jointPx(g0, "pelvis"), TH = D.props("sir").thigh * s;
  const x0 = pel[0] - 0.33 * TH, x1 = pel[0] + 0.95 * TH;
  const under = (["L", "R"] as const).flatMap((d) => { const h = jointPx(g0, `hip${d}`), k = jointPx(g0, `kn${d}`); return Array.from({ length: 11 }, (_, i) => [h[0] + (k[0] - h[0]) * (i / 10), h[1] + (k[1] - h[1]) * (i / 10) + (27 / 2) * s] as [number, number]); }).filter(([xx]) => xx >= x0 && xx <= x1);
  const top = Math.max(pel[1] + (27 / 2) * s, ...under.map((q) => q[1])) + 4;
  // (v4: closer, 2.2 instead of 1.7, so the thighs on the crate and the shins down to the feet read at phone size, Jesper on v3)
  const cam = fitCam(cast, 4.4, 2.2, [[x1 + 20, top], [x0 - 20, FM.GY + 60]]);
  return { id: "c07", title: "07 Sitta", seconds: 4.4, bg: 0, bgOpts: { spade: false, pit: false }, events: { T_SIT }, cast, shot: "full", camera: () => cam,
    seats: [{ x0, x1, top }], groundProps: [{ name: "crate", x0, x1 }],
    back: (g) => { const w = x1 - x0; rect(g, x0, top, w, LINE_TOP - top + 4, "#b07a46");
      for (const yy of [top + (LINE_TOP - top) / 3, top + (2 * (LINE_TOP - top)) / 3]) { g.beginPath(); g.moveTo(x0, yy); g.lineTo(x1, yy); g.lineWidth = 6; g.strokeStyle = INK; g.stroke(); }
      g.beginPath(); g.moveTo(x0 + 10, top + 10); g.lineTo(x1 - 10, LINE_TOP - 6); g.lineWidth = 6; g.stroke(); } };
};

// ---------------------------------------------------------------- 08 open a door ----------------------------------------------------------------
// Full shot. A tall door (one and a half times his height) in a house front that stands a little behind him (its base 60 px up the picture
// from his ground line); the hinges on the right, a lever handle at his waist. He stands to its left facing it, his near hand takes the
// handle and pushes: the door swings in on its hinges (its free edge goes round toward the hinges and into the house, so up the picture,
// top and bottom alike, the same turn), inside the doorway; he leans into the push and lets go. His other hand stays at his side; he stays in front.
export const DOOR = { hinge: 820, w: 300, h: 940, t0: 1.6, t1: 3.1, open: 40, k: 0.18, handleUp: 155 };
const WALL_Y = LINE_TOP - 60, SIR_X8 = 440;
export const doorAngle = (t: number) => DOOR.open * smooth((t - DOOR.t0) / (DOOR.t1 - DOOR.t0));
/** a point on the door: u from the hinge (0) to the free edge (1), up from the door's foot by h px; the turn takes it into the house */
const doorPt = (t: number, u: number, h: number): [number, number] => { const a = (doorAngle(t) * Math.PI) / 180; return [DOOR.hinge - DOOR.w * u * Math.cos(a), WALL_Y - h - DOOR.k * DOOR.w * u * Math.sin(a)]; };
export const handleAt = (t: number): [number, number] => doorPt(t, 0.86, DOOR.handleUp);
const c08 = (): Clip => {
  // (his rear foot a little behind, so his first short step passes the other foot instead of rising over it)
  // (v4: he stands further from the door, so the handle shows in front of him before his hand takes it: at x 500 his body hid the handle
  //  until the door had opened, Jesper on v3: "handen tar handtaget först, sedan öppnas dörren")
  const sir = figure("sir", (SIR_X8 - FM.W / 2) / FM.PPM, 90); sir.stand(0.6);
  ease(sir, -1, {}, 0.01, { face: { pupil: 1, smile: 0.3, gaze: [0.3, 0.3] } });
  const T_REACH = 0.7, T_PULL = DOOR.t0, T_LET = DOOR.t1 + 0.15;
  // (no step: the door opens to 48 degrees and he leans into the push, his hand on the handle all the way; a step after it put his lifted
  //  shoe over the other or lifted his body in a frame)
  sir.stand(6);
  ease(sir, 0.4, { head: [0, 6, 0], lean: 3 }, 0.3); ease(sir, T_PULL, { lean: 14, head: [0, 4, 0] }, 1.2);
  const onHandle = (t: number, p: Pose, heading: number): Pose => {
    const x = px(sampleX(sir, t)), w = env(t, T_REACH, 0.45, T_LET, 0.45); let q: Pose = { ...p, armL: REST };
    // (the fist's middle on the handle, so the hand visibly grips the bar: the wrist on it put the cuff over the bar and the fist below, in
    //  the air in front of the door, the review of v3)
    if (w > 0) { const r = reach("sir", x, p, heading, "R", handleAt(t), false, { mid: true, abdFix: 8 }); q = { ...q, armR: lerpArm(p.armR, r.armR, w) }; }
    return q; };
  const cast: Cast[] = [{ name: "sir", m: sir, who: "sir", pose: onHandle, hands: { L: [[0, "fist"]], R: [[0, "relaxed"], [T_REACH + 0.22, "grip"], [T_LET + 0.22, "fist"]] } }];      // (each change in the middle of the arm's move)
  const L = DOOR.hinge - DOOR.w, top0 = WALL_Y - DOOR.h, cam = fitCam(cast, 4.4, FULL, [[L - 40, top0 - 30], [DOOR.hinge + 40, FM.GY + 60]]);
  return { id: "c08", title: "08 Öppna en dörr", seconds: 4.4, bg: 1, events: { T_REACH, T_PULL, T_LET }, shot: "full", camera: () => cam, door: { h: DOOR.h }, cast,
    contacts: [{ who: "sir", side: "R", t0: T_REACH + 0.55, t1: T_LET, at: handleAt, tol: 4, what: "his fist's middle on the handle", mid: true }],
    back: (g, t) => {
      // the pavement in front of the house, the house front on it, the doorway's dark hall
      rect(g, -60, WALL_Y, 1200, FM.GY - WALL_Y + 4, "#b9b4aa", 0); g.beginPath(); g.moveTo(-60, WALL_Y); g.lineTo(1140, WALL_Y); g.lineWidth = 6; g.strokeStyle = INK; g.stroke();
      rect(g, L - 120, top0 - 140, DOOR.w + 240, DOOR.h + 140, "#b5654a");
      for (let yy = top0 - 110; yy < WALL_Y; yy += 52) { g.beginPath(); g.moveTo(L - 120, yy); g.lineTo(DOOR.hinge + 120, yy); g.lineWidth = 3; g.strokeStyle = "#8c4a36"; g.stroke(); }
      rect(g, L, top0, DOOR.w, DOOR.h, "#2b2233", 0);
      // the door, inside the doorway (clipped to it): a quad from the hinge edge to the free edge, top and bottom turned alike
      g.save(); g.beginPath(); g.rect(L, top0, DOOR.w, DOOR.h); g.clip();
      const Q = (u: number, v: number) => doorPt(t, u, DOOR.h * v);
      shape(g, [Q(0, 0), Q(0, 1), Q(1, 1), Q(1, 0)], "#2f6f8f");
      for (const [v0, v1] of [[0.1, 0.45], [0.55, 0.92]]) shape(g, [Q(0.15, v0), Q(0.15, v1), Q(0.85, v1), Q(0.85, v0)], "#3a82a6", 5);
      for (const v of [0.12, 0.5, 0.88]) shape(g, [Q(0, v - 0.025), Q(0.07, v - 0.025), Q(0.07, v + 0.025), Q(0, v + 0.025)], "#3b3b44", 4);      // the hinges
      g.restore();
      // the door frame over the leaf's edges
      g.lineWidth = 16; g.strokeStyle = "#e9dcc4"; g.strokeRect(L - 8, top0 - 8, DOOR.w + 16, DOOR.h + 8); g.lineWidth = 5; g.strokeStyle = INK; g.strokeRect(L - 16, top0 - 16, DOOR.w + 32, DOOR.h + 16); g.strokeRect(L, top0, DOOR.w, DOOR.h);
      // the handle: an upright brass bar on two posts, longer than his fist, so its ends show above and below the hand that grips it (a
      //  round knob and a short lever were hidden under the fist, the review of v2)
      const [ax, ay] = doorPt(t, 0.86, DOOR.handleUp + 46), [bx, by] = doorPt(t, 0.86, DOOR.handleUp - 46);
      g.lineCap = "round"; for (const [px2, py2] of [[ax, ay], [bx, by]]) { g.beginPath(); g.arc(px2, py2, 9, 0, Math.PI * 2); g.fillStyle = "#c9a23a"; g.fill(); g.lineWidth = 5; g.strokeStyle = INK; g.stroke(); }
      g.beginPath(); g.moveTo(ax - 10, ay); g.lineTo(bx - 10, by); g.lineWidth = 20; g.strokeStyle = INK; g.stroke(); g.lineWidth = 10; g.strokeStyle = "#e8c45a"; g.stroke(); } };
};

export const CLIPS: Record<string, () => Clip> = { c01, c02, c03, c04, c05, c06, c07, c08 };
export const clipFigs = (c: Clip, t: number): Fig[] => castAt(c.cast, t);
export type { HS };
