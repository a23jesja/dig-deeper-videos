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
import { FM, D, figure, castAt, jointPx, reach, px, scaleOf, footY, camFor, type Clip, type Cast, type Fig, type HS, type Mouth } from "./clipKit";
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
  return { id: "c01", title: "01 Stå och prata", seconds: 4.6, cast, events: { LINE: M.t0, LINE_END: M.t0 + M.len }, audio: "craft/bildtyp-01.wav", bg: 0, bgOpts: { spade: false },
    shot: "medium", camera: () => medium(px(0)) };
};

// ---------------------------------------------------------------- 02 walk ----------------------------------------------------------------
// Full shot, the camera still: Sir walks in from outside the picture's left edge, in profile, his hands in loose fists swinging, to the
// middle, stops, and looks to the lens.
const c02 = (): Clip => {
  const cam = full(px(0)), x0m = (cam.cx - FM.W / (2 * cam.z) - 190 - FM.W / 2) / FM.PPM;
  const sir = figure("sir", x0m, 90);
  // (steps of 0.6 leg lengths: at 0.85 the arm swing, read from the feet's spread against the library's step, hit its limit, held at each
  //  end and flew through in six frames, 46 px a frame)
  sir.walk(mt(sir, -x0m), { step: 0.6, stagger: 0.6 });
  const T_STOP = sir.t; sir.stand(6);
  ease(sir, T_STOP + 0.15, { head: [-26, 0, 0] }, 0.45, { face: { pupil: 1, smile: 0.4, gaze: [-0.3, 0] } });
  ease(sir, -1, {}, 0.01, { face: { pupil: 1, smile: 0.2 } });
  return { id: "c02", title: "02 Gå", seconds: Math.min(5, Math.ceil((T_STOP + 1.0) * 30) / 30), events: { T_STOP }, bg: 0, bgOpts: { spade: false }, shot: "full", camera: () => cam,
    // (walking hands are loose fists: a relaxed hand swung out past 50 degrees is drawn open, palm up, as if offering something)
    cast: [{ name: "sir", m: sir, who: "sir", hands: { L: [[0, "fist"]], R: [[0, "fist"]] } }],
    offFrameOK: (n, t) => n === "sir" && t < T_STOP - 0.6 };
};

// ---------------------------------------------------------------- 03 turn ----------------------------------------------------------------
// Full shot. Sir in profile to the right turns to the lens (through three-quarter), holds, and turns on to three-quarter left, where the
// monocle stays in sight on the far eye; the turns slow (1.0 s and 0.8 s), the feet turning on their balls, low, never over each other.
const c03 = (): Clip => {
  const sir = figure("sir", 0, 90, 0.8);      // (the feet staggered 0.8 leg lengths in profile: neither stands on the other through the turn)
  sir.stand(0.55); ease(sir, 0.4, { head: [8, 3, 0] }, 0.15, { face: { pupil: 1, smile: 0.3 } });
  const T1 = sir.t; sir.turn(-90, 1.0, 0.03); ease(sir, T1, { head: [0, 0, 0] }, 0.4);
  sir.stand(0.7); ease(sir, sir.t - 0.15, { head: [-8, 3, 0] }, 0.15);
  const T2 = sir.t; sir.turn(-52, 0.8, 0.03); ease(sir, T2, { head: [0, 0, 0] }, 0.4);
  sir.stand(3);
  return { id: "c03", title: "03 Vända sig", seconds: 4.2, events: { T1, T2 }, bg: 0, bgOpts: { spade: false }, shot: "full", camera: () => full(px(0)),
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
  const side = (t: number, d: 1 | -1): [number, number] => { const [cx, cy] = boxAt(t); return [cx + d * (BOX.w / 2 - 16), cy + 4]; };
  const hold = (t: number, p: Pose, heading: number): Pose => { const x = px(0); return reach("sir", x, reach("sir", x, p, heading, "L", side(t, 1)), heading, "R", side(t, -1)); };
  return { id: "c04", title: "04 Hålla med båda händerna", seconds: 4.4, bg: 0, bgOpts: { spade: false }, events: { LIFT: 1.3, DOWN: 2.7 }, shot: "medium", camera: () => medium(px(0)),
    cast: [{ name: "sir", m: sir, who: "sir", hands: { L: [[0, "grip"]], R: [[0, "grip"]] }, pose: hold }],
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
// Medium shot on the quay. Far out at the horizon a small ship; Sir looks at it first, then points at it with the elbow a little bent, the
// finger out for under a second, and lowers the arm. Finger and eyes on the same ship.
// (the horizon under his shoulder: at his mouth's height the pointing hand came up right under his pipe)
const HORIZON = 1222, SHIP: [number, number] = [px(0) + 210, HORIZON - 18];
const harbour = (g: G) => {
  rect(g, -40, -40, 1160, 2000, "#9ad3e6", 0); rect(g, -40, HORIZON, 1160, LINE_TOP - HORIZON + 6, "#2f7fb3", 0);
  g.beginPath(); g.moveTo(-40, HORIZON); g.lineTo(1120, HORIZON); g.lineWidth = 6; g.strokeStyle = INK; g.stroke();
  for (const [x, y, s] of [[260, 860, 1], [760, 760, 0.7]] as [number, number, number][]) { g.beginPath(); for (const [dx, dy, r] of [[-60, 10, 40], [-10, -14, 54], [50, 6, 42]]) g.arc(x + dx * s, y + dy * s, r * s, 0, Math.PI * 2); g.fillStyle = "#fffaf0"; g.fill(); }
  // the far ship on the horizon: small
  const [sx, sy] = SHIP; shape(g, [[sx - 26, sy + 8], [sx + 26, sy + 8], [sx + 18, sy + 18], [sx - 18, sy + 18]], "#6b4a2f", 4);
  g.beginPath(); g.moveTo(sx, sy + 8); g.lineTo(sx, sy - 34); g.lineWidth = 4; g.strokeStyle = INK; g.stroke();
  shape(g, [[sx + 2, sy - 32], [sx + 20, sy + 4], [sx + 2, sy + 4]], "#fffaf0", 3); shape(g, [[sx - 2, sy - 26], [sx - 16, sy + 4], [sx - 2, sy + 4]], "#fffaf0", 3);
  rect(g, -40, LINE_TOP, 1160, 480, "#b07a46", 0); g.beginPath(); g.moveTo(-40, FM.GY); g.lineTo(1120, FM.GY); g.lineWidth = 12; g.strokeStyle = INK; g.stroke();
  shape(g, [[px(0) - 210, FM.GY], [px(0) - 210, FM.GY - 70], [px(0) - 196, FM.GY - 90], [px(0) - 154, FM.GY - 90], [px(0) - 140, FM.GY - 70], [px(0) - 140, FM.GY]], "#3b3b44");
};
const shoulderPx = (x: number, p: Pose, heading: number): [number, number] => { const sk = solve(D.props("sir"), p, heading), q = sk.j.shR as unknown as number[], s = scaleOf("sir"); return [x + q[0] * s, footY("sir") + q[1] * s]; };
const c05 = (): Clip => {
  const sx = px(0) - 60, sir = figure("sir", (sx - FM.W / 2) / FM.PPM, 60); sir.stand(6);
  ease(sir, -1, { head: [6, 0, 0] }, 0.01, { face: { pupil: 1, smile: 0.2, gaze: [0.2, 0] } });
  ease(sir, 0.5, { head: [20, -6, 0] }, 0.35, { face: { pupil: 1, smile: 0.5, brow: 0.7, gaze: [0.9, -0.3] } });      // (the eyes go first, up to the ship)
  const UP = 1.05, HOLD0 = 1.35, HOLD1 = 2.1, DOWN = 2.5, P_ON = 1.25, P_OFF = 2.2;
  const aim = (t: number, p: Pose, heading: number): Pose => {
    const w = env(t, UP, HOLD0 - UP, HOLD1, DOWN - HOLD1); if (w <= 0) return p;
    const P = D.props("sir"), s = scaleOf("sir"), reachLen = (P.upper + P.fore + P.hand * 0.6) * s * 0.82;      // (0.82 of the arm: the elbow stays bent)
    const sh = shoulderPx(sx, p, heading), dx = SHIP[0] - sh[0], dy = SHIP[1] - sh[1], l = Math.hypot(dx, dy);
    const q = reach("sir", sx, p, heading, "R", [sh[0] + (dx / l) * reachLen, sh[1] + (dy / l) * reachLen], true);
    return { ...p, armR: lerpArm(p.armR, q.armR, w) }; };
  // (a wider medium shot, 2.25, so the ship is in the picture beside him: at 2.7 his head filled the frame's width)
  return { id: "c05", title: "05 Peka", seconds: 4.0, events: { UP, HOLD0, HOLD1, DOWN, P_ON, P_OFF }, ownBg: harbour, shot: "medium", camera: () => camFor(2.25, sx + 66, CROWN - 50),
    // (the pointing hand from the arm's rise to half way down: the finger out under 1.0 s, P_ON to P_OFF)
    // (after the point a loose fist: a relaxed hand held forward is drawn open, palm up, as if offering something)
    cast: [{ name: "sir", m: sir, who: "sir", pose: aim, hands: { L: [[0, "relaxed"]], R: [[0, "relaxed"], [P_ON, "point"], [P_OFF, "fist"]] } }],
    points: [{ who: "sir", t0: HOLD0, t1: HOLD1, side: "R", target: SHIP, horizon: HORIZON }] };
};

// ---------------------------------------------------------------- 06 react ----------------------------------------------------------------
// Full shot (the crab is on the ground: a closer frame would lose it). A big crab scuttles in from outside the picture's right edge toward
// Sir; he jerks back, arms up, eyes wide, pipe drooping, and then looks down at it, wary, while it stops and waves a claw.
const CRAB_IN = 0.45, CRAB_STOP = 1.5, CRAB_S = 2.0;
const c06Cam = full(px(-0.05), 1.75);
const crabEnd = px(0.3), crabStart = c06Cam.cx + FM.W / (2 * c06Cam.z) + 60 * CRAB_S;
const crabAt = (t: number): [number, number] | null => { if (t < CRAB_IN) return null; const u = smooth(Math.min(1, (t - CRAB_IN) / (CRAB_STOP - CRAB_IN))); return [crabStart + (crabEnd - crabStart) * u, LINE_TOP]; };
const c06 = (): Clip => {
  const sir = figure("sir", -0.24, 35); sir.stand(6);
  ease(sir, -1, {}, 0.01, { face: { pupil: 1, smile: 0.3 } });
  ease(sir, 0.95, { head: [18, 4, 0] }, 0.25, { face: { pupil: 1, brow: 0.4, gaze: [0.8, 0.4] } });      // (he sees it come)
  const T_SCARED = 1.25;
  // (the jerk over 0.24 s: over 0.16 the wrists flew 46 px a frame)
  ease(sir, T_SCARED, { lean: -9, armL: [[34, 30], [104, 20]], armR: [[34, 30], [104, 20]], head: [14, -6, 0] }, 0.24, { face: { ...SCARED, gaze: [0.8, 0.6] } });
  // (after the jerk he looks down at the crab: the head down and toward it, the eyes on it; he looked straight ahead before)
  ease(sir, 2.2, { lean: -5, armL: [[20, 22], [74, 12]], armR: [[20, 22], [74, 12]], head: [22, 16, 0] }, 0.5, { face: { pupil: 0.7, wide: 0.6, brow: 0.9, sad: 0.3, mouth: 0.25, gaze: [0.8, 0.9] } });
  return { id: "c06", title: "06 Reagera", seconds: 4.0, bg: 0, bgOpts: { spade: false }, events: { CRAB_IN, CRAB_STOP, T_SCARED }, shot: "full", camera: () => c06Cam,
    cast: [{ name: "sir", m: sir, who: "sir", hands: { L: [[0, "relaxed"], [T_SCARED + 0.06, "open"]], R: [[0, "relaxed"], [T_SCARED + 0.06, "open"]] } }],
    appear: [{ name: "crab", t0: CRAB_IN, from: "right", at: crabAt }],
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
// Full shot. Sir stands in front of a crate, facing left, leans forward and sits back onto it: the seat at about his knee's height, the
// thighs level, the knees forward, the shins down to the feet that stay on the ground; seated, his hands go to his knees. He stays seated.
const c07 = (): Clip => {
  const sir = figure("sir", 0, -90); sir.stand(0.7);
  ease(sir, -1, {}, 0.01, { face: { pupil: 1, smile: 0.3 } });
  // (the pelvis down 0.52 leg lengths and back 0.5: the thigh level from hip to knee, the shin upright; a lean forward going down, less once
  //  seated. The layer is held to the end: it ended at 4.3 s and he stood up in one frame, the review of v1)
  const T_SIT = sir.t;
  sir.act({ py: -0.52, pz: -0.5, lean: 6, head: [0, 2, 0] }, 30, { in: 0.9, out: 0.01, antic: 0.08, over: 0, wait: false });
  sir.actAt(T_SIT, { lean: 16 }, 1.1, { in: 0.45, out: 0.5, glide: true, antic: 0 });
  sir.stand(6);
  const T_KNEES = T_SIT + 1.15;
  const knees = (t: number, p: Pose, heading: number): Pose => { const w = env(t, T_KNEES, 0.5, 99, 0.1); if (w <= 0) return p;
    const x = px(0), sk = solve(D.props("sir"), p, heading), s = scaleOf("sir"), K = (j: "knL" | "knR"): [number, number] => { const q = sk.j[j] as unknown as number[]; return [x + q[0] * s + 4, footY("sir") + q[1] * s - 22]; };
    const q = reach("sir", x, reach("sir", x, p, heading, "L", K("knL")), heading, "R", K("knR")); return { ...p, armL: lerpArm(p.armL, q.armL, w), armR: lerpArm(p.armR, q.armR, w) }; };
  // (the hands loosely closed as he goes down, open on his knees: each change while the arm moves)
  // (loosely closed hands throughout: on the knees they hardly move, so any change of shape there showed as a jump)
  const cast: Cast[] = [{ name: "sir", m: sir, who: "sir", pose: knees, hands: { L: [[0, "fist"]], R: [[0, "fist"]] } }];
  // (the crate under the backs of his thighs: its top at the thighs' underside, half a leg's width under the hip, its outline touching)
  const g0 = castAt(cast, T_SIT + 2.5)[0], s = scaleOf("sir"), pel = jointPx(g0, "pelvis"), top = pel[1] + (27 / 2) * s + 4, cxC = pel[0] + 16, w = 190;
  return { id: "c07", title: "07 Sitta", seconds: 4.4, bg: 0, bgOpts: { spade: false }, events: { T_SIT }, cast, shot: "full", camera: () => full(px(0.02)),
    seats: [{ x0: cxC - w / 2, x1: cxC + w / 2, top }],
    back: (g) => { const x = cxC - w / 2; rect(g, x, top, w, LINE_TOP - top + 4, "#b07a46");
      for (const yy of [top + (LINE_TOP - top) / 3, top + (2 * (LINE_TOP - top)) / 3]) { g.beginPath(); g.moveTo(x, yy); g.lineTo(x + w, yy); g.lineWidth = 6; g.strokeStyle = INK; g.stroke(); }
      g.beginPath(); g.moveTo(x + 10, top + 10); g.lineTo(x + w - 10, LINE_TOP - 6); g.lineWidth = 6; g.stroke(); } };
};

// ---------------------------------------------------------------- 08 open a door ----------------------------------------------------------------
// Full shot. A tall door (one and a half times his height) in a house front, its hinges on the right; Sir stands to its left, facing it,
// so his near hand on the handle and the door's swing are both in sight. He pulls: the door swings toward us on its hinges (its free edge
// comes round toward the hinges and grows a little nearer), he steps after it, lets go when it stands open. His other hand stays at his side.
export const DOOR = { hinge: 820, w: 300, h: 940, t0: 1.6, t1: 3.1, open: 60 };
export const doorAngle = (t: number) => DOOR.open * smooth((t - DOOR.t0) / (DOOR.t1 - DOOR.t0));
const doorGrow = (a: number) => 1 + 0.08 * Math.sin(a);
export const handleAt = (t: number): [number, number] => { const a = (doorAngle(t) * Math.PI) / 180; return [DOOR.hinge - DOOR.w * 0.88 * Math.cos(a), LINE_TOP - DOOR.h * 0.33 * doorGrow(a)]; };
const c08 = (): Clip => {
  const sir = figure("sir", (430 - FM.W / 2) / FM.PPM, 90, 0.8); sir.stand(0.6);
  ease(sir, -1, {}, 0.01, { face: { pupil: 1, smile: 0.3, gaze: [0.3, 0.1] } });
  const T_REACH = 0.7, T_PULL = DOOR.t0, T_STEP = DOOR.t0 + 0.15, T_LET = DOOR.t1 + 0.15;
  sir.stand(T_STEP - sir.t); sir.walk(mt(sir, 0.24), { step: 0.6, stagger: 0.8 }); sir.stand(6);
  ease(sir, 0.4, { head: [0, 3, 0], lean: 3 }, 0.3);
  // (the near arm, the right as he faces the picture's right, to the handle; the other kept at his side, its hand loosely closed: it swung
  //  out open toward nothing with the step, the review of v1)
  const onHandle = (t: number, p: Pose, heading: number): Pose => {
    const x = px(sampleX(sir, t)), w = env(t, T_REACH, 0.55, T_LET, 0.45); let q: Pose = { ...p, armL: REST };
    if (w > 0) { const r = reach("sir", x, p, heading, "R", handleAt(t)); q = { ...q, armR: lerpArm(p.armR, r.armR, w) }; }
    return q; };
  return { id: "c08", title: "08 Öppna en dörr", seconds: 4.4, bg: 1, events: { T_REACH, T_PULL, T_LET }, shot: "full", camera: () => full(552), door: { h: DOOR.h },
    cast: [{ name: "sir", m: sir, who: "sir", pose: onHandle, hands: { L: [[0, "fist"]], R: [[0, "relaxed"], [T_REACH + 0.3, "grip"], [T_LET + 0.2, "fist"]] } }],
    contacts: [{ who: "sir", side: "R", t0: T_REACH + 0.55, t1: T_LET, at: handleAt, tol: 4, what: "his hand on the handle" }],
    back: (g, t) => { // the house front, the dark hall behind the doorway, the door on its hinges at the right
      const L = DOOR.hinge - DOOR.w, top0 = LINE_TOP - DOOR.h;
      rect(g, L - 110, top0 - 130, DOOR.w + 220, DOOR.h + 136, "#b5654a");
      for (let yy = top0 - 100; yy < LINE_TOP; yy += 52) { g.beginPath(); g.moveTo(L - 110, yy); g.lineTo(DOOR.hinge + 110, yy); g.lineWidth = 3; g.strokeStyle = "#8c4a36"; g.stroke(); }
      rect(g, L - 16, top0 - 18, DOOR.w + 32, DOOR.h + 24, "#e9dcc4", 8); rect(g, L, top0, DOOR.w, DOOR.h + 4, "#2b2233", 0);
      // the door: a quad from its hinge edge to its free edge; panels by bilinear interpolation, so no line jumps from frame to frame
      const a = (doorAngle(t) * Math.PI) / 180, fx = DOOR.hinge - DOOR.w * Math.cos(a), ftop = LINE_TOP - DOOR.h * doorGrow(a);
      const Q = (u: number, v: number): [number, number] => { const x = DOOR.hinge + (fx - DOOR.hinge) * u, yt = top0 + (ftop - top0) * u; return [x, LINE_TOP + (yt - LINE_TOP) * v]; };
      shape(g, [Q(0, 0), Q(0, 1), Q(1, 1), Q(1, 0)], "#2f6f8f");
      for (const [v0, v1] of [[0.08, 0.42], [0.52, 0.92]]) shape(g, [Q(0.15, v0), Q(0.15, v1), Q(0.85, v1), Q(0.85, v0)], "#3a82a6", 5);
      const [hx, hy] = handleAt(t); g.beginPath(); g.arc(hx, hy, 12, 0, Math.PI * 2); g.fillStyle = "#e8c45a"; g.fill(); g.lineWidth = 5; g.strokeStyle = INK; g.stroke(); } };
};

export const CLIPS: Record<string, () => Clip> = { c01, c02, c03, c04, c05, c06, c07, c08 };
export const clipFigs = (c: Clip, t: number): Fig[] => castAt(c.cast, t);
export type { HS };
