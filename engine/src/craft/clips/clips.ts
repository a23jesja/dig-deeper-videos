// The eight shot types of the library in the flat 2D look (Jesper, 21 Nov 2026: "Gör sedan om bildtyperna i biblioteket i platt 2D (stå
// och prata, gå, vända sig, hålla med båda händerna, peka, reagera, sitta, öppna en dörr), ett kort klipp per bildtyp"). Each clip is
// 3-5 s on a flat background with a ground line; the drawing is FlatClip.tsx, the checks scripts/clip_check.mjs <id>.
import { solve, type Pose } from "../rig";
import { play } from "../stage/film";
import type { Face } from "../designs/common";
import { GESTURES, upper } from "../stage/gestures";
import { ease, mt } from "../stage/acting";
import { FM, D, figure, castAt, jointPx, reach, px, scaleOf, footY, type Clip, type Cast, type Fig, type HS, type Mouth } from "./clipKit";
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

// ---------------------------------------------------------------- 01 stand and talk ----------------------------------------------------------------
// Sir to the lens, George's line ("Every legend has a grain of truth. Let us dig it up."): the explaining hands on "grain of truth", one
// hand lifts on "dig it up"; Ada beside him listens, looks at him and nods at the end. Both standing still: weight, breath, head.
const c01 = (): Clip => {
  const M = MOUTH01 as Mouth, sir = figure("sir", -0.2, 0), ada = figure("baker", 0.36, -28);
  sir.stand(5); ada.stand(5);
  ease(sir, -1, {}, 0.01, { face: { pupil: 1, smile: 0.3, brow: 0.3 } });
  const ex = GESTURES.explain.pose("side", 0) as Pose;
  sir.actAt(1.15, upper(ex), 1.3, { in: 0.32, out: 0.36, glide: true, antic: 0, face: { pupil: 1, smile: 0.4, brow: 0.6 } });
  sir.actAt(2.75, { armR: [[30, 16], [118, -4]], head: [0, -4, 0] }, 1.0, { in: 0.28, out: 0.4, glide: true, antic: 0, face: { pupil: 1, smile: 0.7, brow: 0.5 } });
  ease(ada, -1, { head: [-8, 2, 0] }, 0.01, { face: { pupil: 1, smile: 0.25, gaze: [-0.6, 0] } });
  ada.actAt(3.45, { head: [-8, 10, 0] }, 0.5, { in: 0.18, out: 0.25, glide: true, antic: 0 });      // (the nod)
  const cast: Cast[] = [
    { name: "sir", m: sir, who: "sir", mouth: M, hands: { L: [[0, "relaxed"], [1.3, "open"], [2.4, "relaxed"]], R: [[0, "relaxed"], [1.3, "open"], [2.95, "open"], [3.6, "relaxed"]] } },
    { name: "ada", m: ada, who: "baker" }];
  return { id: "c01", title: "01 Stå och prata", seconds: 4.6, cast, events: { LINE: M.t0, LINE_END: M.t0 + M.len }, audio: "craft/bildtyp-01.wav", bg: 0 };
};

// ---------------------------------------------------------------- 02 walk ----------------------------------------------------------------
// Sir walks in from the left, in profile, crosses to the right of the middle and stops; at rest he looks to the lens.
const c02 = (): Clip => {
  const sir = figure("sir", -0.92, 90);
  sir.walk(mt(sir, 1.22), { step: 0.85 });
  const T_STOP = sir.t; sir.stand(6);
  ease(sir, T_STOP + 0.15, { head: [-26, 0, 0] }, 0.45, { face: { pupil: 1, smile: 0.4, gaze: [-0.3, 0] } });
  ease(sir, -1, {}, 0.01, { face: { pupil: 1, smile: 0.2 } });
  return { id: "c02", title: "02 Gå", seconds: Math.min(5, Math.ceil((T_STOP + 1.0) * 30) / 30), cast: [{ name: "sir", m: sir, who: "sir", hands: { L: [[0, "relaxed"]], R: [[0, "relaxed"]] } }], events: { T_STOP }, bg: 0,
    offFrameOK: (n, t) => n === "sir" && t < 1.25 };      // (walking in: his head is all in by 1.2 s)
};

// ---------------------------------------------------------------- 03 turn ----------------------------------------------------------------
// Sir in profile to the right turns to the lens (through three-quarter), holds, and turns on to the left; a little dip of the head the
// other way before each turn, the feet stepping round.
const c03 = (): Clip => {
  const sir = figure("sir", 0, 90);
  sir.stand(0.55); ease(sir, 0.4, { head: [8, 3, 0] }, 0.15, { face: { pupil: 1, smile: 0.3 } });
  const T1 = sir.t; sir.turn(-90, 0.6, 0.18); ease(sir, T1, { head: [0, 0, 0] }, 0.3);
  sir.stand(0.9); ease(sir, sir.t - 0.15, { head: [-8, 3, 0] }, 0.15);
  const T2 = sir.t; sir.turn(-90, 0.6, 0.18); ease(sir, T2, { head: [0, 0, 0] }, 0.3);
  sir.stand(3);
  return { id: "c03", title: "03 Vända sig", seconds: 4.0, cast: [{ name: "sir", m: sir, who: "sir", hands: { L: [[0, "relaxed"]], R: [[0, "relaxed"]] } }], events: { T1, T2 }, bg: 0 };
};

// ---------------------------------------------------------------- 04 hold with both hands ----------------------------------------------------------------
// Sir to the lens holds a small wooden chest with both hands, lifts it to his chest to look at it and lowers it again. A real grip: the
// chest's sides lie inside the hands, the fingers behind it (hidden), the thumbs over its front.
const BOX = { w: 150, h: 104 };
// (held at the waist and lifted 16 px, its top always under his chin (about 1161) with its outline clear of it: held at 300 up, its top covered his mouth and moustache,
//  and nothing may cover a face)
const BOX_UP = 250, BOX_LIFT = 16;
const boxAt = (t: number): [number, number] => { const lift = env(t, 1.3, 0.7, 2.7, 0.7); return [px(0), footY("sir") - BOX_UP - BOX_LIFT * lift]; };
const c04 = (): Clip => {
  const sir = figure("sir", 0, 0); sir.stand(6);
  ease(sir, -1, {}, 0.01, { face: { pupil: 1, smile: 0.3, gaze: [0, 0.6] } });
  ease(sir, 1.3, { head: [0, 8, 0] }, 0.6, { face: { pupil: 1, smile: 0.6, brow: 0.5, gaze: [0, 0.8] } });
  ease(sir, 2.9, { head: [0, 0, 0] }, 0.6, { face: { pupil: 1, smile: 0.4, gaze: [0, 0.3] } });
  const hold = (t: number, p: Pose, heading: number): Pose => {
    const [cx, cy] = boxAt(t); let q = reach("sir", px(sir.P[0] * sir.LL), p, heading, "L", [cx + BOX.w / 2 + 4, cy + 6]);
    return reach("sir", px(sir.P[0] * sir.LL), q, heading, "R", [cx - BOX.w / 2 - 4, cy + 6]); };
  return { id: "c04", title: "04 Hålla med båda händerna", seconds: 4.4, bg: 0, events: { LIFT: 1.3, DOWN: 2.7 },
    cast: [{ name: "sir", m: sir, who: "sir", hands: { L: [[0, "grip"]], R: [[0, "grip"]] }, pose: hold }],
    contacts: [{ who: "sir", side: "L", t0: 0, t1: 99, at: (t) => { const [cx, cy] = boxAt(t); return [cx + BOX.w / 2 + 4, cy + 6]; }, tol: 4, what: "the chest's right side in his left hand" },
      { who: "sir", side: "R", t0: 0, t1: 99, at: (t) => { const [cx, cy] = boxAt(t); return [cx - BOX.w / 2 - 4, cy + 6]; }, tol: 4, what: "the chest's left side in his right hand" }],
    over: (g, t, f) => { if (f.name !== "sir") return; const [cx, cy] = boxAt(t), x = cx - BOX.w / 2, y = cy - BOX.h / 2;
      // the chest over the palms and fingers: they are behind it
      rect(g, x, y, BOX.w, BOX.h, "#a0683c"); rect(g, x, y + 30, BOX.w, 12, "#7a4a28", 6); rect(g, cx - 14, y + 44, 28, 30, "#e8c45a", 6);
      for (const s of [-1, 1]) rect(g, cx + s * (BOX.w / 2 - 26) - 9, y - 1, 18, BOX.h + 2, "#7a4a28", 6);
      // the thumbs over the chest's front, at its top corners, from each hand inward
      for (const side of ["L", "R"] as const) { const w = jointPx(f, `wr${side}`), d = side === "L" ? -1 : 1;
        const tx = cx + d * (BOX.w / 2 - 6), ty = Math.max(y + 10, w[1] - 4);
        g.save(); g.translate(tx, ty); g.beginPath(); g.ellipse(-d * 14, 4, 18, 10, d * 0.5, 0, Math.PI * 2); g.fillStyle = "#f7c9a3"; g.fill(); g.lineWidth = 7; g.strokeStyle = INK; g.stroke(); g.restore(); } } };
};

// ---------------------------------------------------------------- 05 point ----------------------------------------------------------------
// Sir at three-quarter sees a ship far out at sea (the harbour), looks at it first, points at it with the elbow a little bent for under a
// second, and lowers the arm. Nobody else is in the picture.
/** the harbour background's own ship far out at sea: the point aims at its hull (FlatStyle BGS[2]); aimed at its sails, above his shoulder,
 *  the arm went up across his face and pipe */
const SHIP: [number, number] = [740, 1186];
const c05 = (): Clip => {
  const sir = figure("sir", -0.28, 50); sir.stand(6);
  ease(sir, -1, { head: [6, 0, 0] }, 0.01, { face: { pupil: 1, smile: 0.2, gaze: [0.2, 0] } });
  ease(sir, 0.5, { head: [22, -4, 0] }, 0.35, { face: { pupil: 1, smile: 0.5, brow: 0.7, gaze: [0.9, -0.2] } });      // (the eyes go first)
  const UP = 1.0, HOLD0 = 1.32, HOLD1 = 2.22, DOWN = 2.56;
  // (the pointing arm: aimed by reach at a spot on the line from the shoulder to the ship, 0.9 of the arm's length out, so the elbow stays bent)
  const aim = (t: number, p: Pose, heading: number): Pose => {
    const w = env(t, UP, HOLD0 - UP, HOLD1, DOWN - HOLD1); if (w <= 0) return p;
    const x = px(sir.P[0] * sir.LL), P = D.props("sir"), s = scaleOf("sir");
    const full = (P.upper + P.fore + P.hand * 0.6) * s * 0.9;
    const sh = shoulderPx(x, p, heading), dx = SHIP[0] - sh[0], dy = SHIP[1] - sh[1], l = Math.hypot(dx, dy);
    const target: [number, number] = [sh[0] + (dx / l) * full, sh[1] + (dy / l) * full];
    const q = reach("sir", x, p, heading, "R", target, true);
    return { ...p, armR: lerpArm(p.armR, q.armR, w) }; };
  return { id: "c05", title: "05 Peka", seconds: 4.0, bg: 2, events: { UP, HOLD0, HOLD1, DOWN },
    cast: [{ name: "sir", m: sir, who: "sir", pose: aim, hands: { L: [[0, "relaxed"]], R: [[0, "relaxed"], [UP + 0.16, "point"], [HOLD1 + 0.16, "relaxed"]] } }],
    points: [{ who: "sir", t0: HOLD0, t1: HOLD1, side: "R", target: SHIP }] };
};
const shoulderPx = (x: number, p: Pose, heading: number): [number, number] => { const sk = solve(D.props("sir"), p, heading), q = sk.j.shR as unknown as number[], s = scaleOf("sir"); return [x + q[0] * s, footY("sir") + q[1] * s]; };

// ---------------------------------------------------------------- 06 react ----------------------------------------------------------------
// A crab scuttles in from the picture's right edge toward Sir; he jerks back with his arms up, eyes wide and the pipe drooping, and stays
// wary while it stops and waves a claw.
const CRAB_IN = 0.5, CRAB_STOP = 1.5;
const crabAt = (t: number): [number, number] | null => { if (t < CRAB_IN) return null; const u = smooth(Math.min(1, (t - CRAB_IN) / (CRAB_STOP - CRAB_IN))); return [FM.W + 90 + (px(0.3) - FM.W - 90) * u, LINE_TOP]; };
const c06 = (): Clip => {
  const sir = figure("sir", -0.22, 35); sir.stand(6);
  ease(sir, -1, {}, 0.01, { face: { pupil: 1, smile: 0.3 } });
  ease(sir, 0.95, { head: [18, 4, 0] }, 0.25, { face: { pupil: 1, brow: 0.4, gaze: [0.8, 0.4] } });      // (he sees it come)
  const T_SCARED = 1.25;
  ease(sir, T_SCARED, { lean: -9, armL: [[34, 30], [104, 20]], armR: [[34, 30], [104, 20]], head: [14, -6, 0] }, 0.16, { face: { ...SCARED, gaze: [0.8, 0.5] } });
  ease(sir, 2.7, { lean: -4, armL: [[18, 20], [70, 10]], armR: [[18, 20], [70, 10]], head: [16, 2, 0] }, 0.5, { face: { pupil: 0.8, brow: 0.9, sad: 0.3, mouth: 0.2, gaze: [0.8, 0.5] } });
  return { id: "c06", title: "06 Reagera", seconds: 4.0, bg: 0, events: { CRAB_IN, CRAB_STOP, T_SCARED },
    cast: [{ name: "sir", m: sir, who: "sir", hands: { L: [[0, "relaxed"], [T_SCARED + 0.08, "open"]], R: [[0, "relaxed"], [T_SCARED + 0.08, "open"]] } }],
    appear: [{ name: "crab", t0: CRAB_IN, from: "right", at: crabAt }],
    front: (g, t) => { const c = crabAt(t); if (!c) return; const [x, y] = c, walking = t < CRAB_STOP, k = Math.sin(t * 40) * (walking ? 1 : 0);
      for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { const lx = x + s * (16 + i * 13); g.beginPath(); g.moveTo(lx, y - 26); g.lineTo(lx + s * 18, y - 20 + (i % 2 ? k : -k) * 4); g.lineTo(lx + s * 24, y); g.lineWidth = 6; g.strokeStyle = INK; g.stroke(); }
      g.beginPath(); g.ellipse(x, y - 34, 44, 26, 0, 0, Math.PI * 2); g.fillStyle = "#e0553d"; g.fill(); g.lineWidth = 7; g.strokeStyle = INK; g.stroke();
      const wave = walking ? 0 : Math.sin((t - CRAB_STOP) * 9) * 0.35;
      for (const s of [-1, 1]) { g.save(); g.translate(x + s * 34, y - 50); g.rotate(s * -0.5 + (s < 0 ? wave : 0)); g.beginPath(); g.moveTo(0, 0); g.lineTo(s * 8, -26); g.lineWidth = 7; g.strokeStyle = INK; g.stroke();
        g.beginPath(); g.ellipse(s * 10, -40, 13, 17, 0, 0, Math.PI * 2); g.fillStyle = "#e0553d"; g.fill(); g.lineWidth = 6; g.stroke(); g.beginPath(); g.moveTo(s * 10, -40); g.lineTo(s * 10, -56); g.lineWidth = 6; g.stroke(); g.restore(); }
      for (const s of [-1, 1]) { g.beginPath(); g.moveTo(x + s * 10, y - 56); g.lineTo(x + s * 12, y - 72); g.lineWidth = 5; g.strokeStyle = INK; g.stroke(); g.beginPath(); g.arc(x + s * 12, y - 76, 8, 0, Math.PI * 2); g.fillStyle = "#fff8d0"; g.fill(); g.lineWidth = 4; g.stroke(); g.beginPath(); g.arc(x + s * 12 - 3, y - 76, 3.5, 0, Math.PI * 2); g.fillStyle = INK; g.fill(); } } };
};

// ---------------------------------------------------------------- 07 sit ----------------------------------------------------------------
// Sir stands in front of a crate, facing left, and sits back onto it: the crate takes his weight (the seat's top under the seat of his
// trousers), his feet stay on the ground; seated, his hands go to his knees.
export const CRATE = { x: 0.06, w: 170, h: 0 };
const c07 = (): Clip => {
  const sir = figure("sir", -0.02, -90); sir.stand(0.7);
  ease(sir, -1, {}, 0.01, { face: { pupil: 1, smile: 0.3 } });
  // (the pelvis down 0.30 leg lengths, back 0.2: a seat at about his knee's height. At the library's sit, 0.46 down, Knopp's short legs and
  //  the torso's 34 units under the pelvis put the seat 59 px off the ground, a squat)
  const T_SIT = sir.t; sir.act({ py: -0.3, pz: -0.2, lean: -4, head: [0, 2, 0] }, 3.6, { in: 0.8, out: 0.01, antic: 0.08, over: 0, wait: false }); sir.stand(6);
  const T_KNEES = T_SIT + 1.1;
  // (seated, the hands go to the knees: put there by reach, each wrist just over its knee)
  const knees = (t: number, p: Pose, heading: number): Pose => { const w = env(t, T_KNEES, 0.5, 99, 0.1); if (w <= 0) return p;
    const x = px(sir.P[0] * sir.LL), sk = solve(D.props("sir"), p, heading), s = scaleOf("sir"), K = (j: "knL" | "knR"): [number, number] => { const q = sk.j[j] as unknown as number[]; return [x + q[0] * s - 6, footY("sir") + q[1] * s - 26]; };
    const q = reach("sir", x, reach("sir", x, p, heading, "L", K("knL")), heading, "R", K("knR")); return { ...p, armL: lerpArm(p.armL, q.armL, w), armR: lerpArm(p.armR, q.armR, w) }; };
  const cast: Cast[] = [{ name: "sir", m: sir, who: "sir", pose: knees, hands: { L: [[0, "relaxed"]], R: [[0, "relaxed"]] } }];
  // (the crate's top under the seat of his trousers: the torso's lowest row is 34 units under the pelvis, its outline half the line weight
  //  further, the crate's outline 4 px over its top: the two outlines touch when he is down)
  { const g = castAt(cast, T_SIT + 2)[0], s = scaleOf("sir"); setSeatTop(jointPx(g, "pelvis")[1] + (34 + D.ol / 2) * s + 4); }
  return { id: "c07", title: "07 Sitta", seconds: 4.4, bg: 0, events: { T_SIT }, cast,
    seats: [{ x0: px(CRATE.x) - CRATE.w / 2, x1: px(CRATE.x) + CRATE.w / 2, top: seatTop() }],
    back: (g) => { const top = seatTop(), x = px(CRATE.x) - CRATE.w / 2; rect(g, x, top, CRATE.w, LINE_TOP - top + 4, "#b07a46");
      for (const yy of [top + (LINE_TOP - top) / 3, top + (2 * (LINE_TOP - top)) / 3]) { g.beginPath(); g.moveTo(x, yy); g.lineTo(x + CRATE.w, yy); g.lineWidth = 6; g.strokeStyle = INK; g.stroke(); }
      g.beginPath(); g.moveTo(x + 10, top + 10); g.lineTo(x + CRATE.w - 10, LINE_TOP - 6); g.lineWidth = 6; g.stroke(); } };
};
/** the crate's top: where the seat of his trousers is when he sits (the drawn torso's lowest point at the sit), found once from the model */
let SEAT_TOP = 0;
export const seatTop = () => SEAT_TOP;
export const setSeatTop = (y: number) => { SEAT_TOP = y; };

// ---------------------------------------------------------------- 08 open a door ----------------------------------------------------------------
// A house front on the street: Sir stands to the right of its door, facing it; his near hand goes to the handle and pulls, and the door
// swings toward us on its hinges (its free edge comes round and grows a little nearer), he steps after it, lets go when it stands open.
export const DOOR = { hinge: 210, w: 230, h: 430, t0: 1.6, t1: 3.2, open: 62 };
export const doorAngle = (t: number) => DOOR.open * smooth((t - DOOR.t0) / (DOOR.t1 - DOOR.t0));
export const handleAt = (t: number): [number, number] => { const a = (doorAngle(t) * Math.PI) / 180, edge = DOOR.hinge + DOOR.w * 0.86 * Math.cos(a); return [edge, LINE_TOP - DOOR.h * 0.5 * (1 + 0.1 * Math.sin(a))]; };
const c08 = (): Clip => {
  // (nearer the door and a longer step taken sooner: the handle went out of his reach, 176 px from the shoulder for an arm of 156)
  const sir = figure("sir", -0.07, -90); sir.stand(0.6);
  ease(sir, -1, {}, 0.01, { face: { pupil: 1, smile: 0.3, gaze: [0.3, 0.1] } });
  const T_REACH = 0.7, T_PULL = DOOR.t0, T_STEP = DOOR.t0 + 0.2, T_LET = DOOR.t1 + 0.15;
  sir.stand(T_STEP - sir.t); sir.walk(mt(sir, 0.2), { step: 0.6 }); sir.stand(6);
  ease(sir, 0.4, { head: [0, 3, 0], lean: 3 }, 0.3);
  const onHandle = (t: number, p: Pose, heading: number): Pose => {
    const w = env(t, T_REACH, 0.55, T_LET, 0.45); if (w <= 0) return p;
    const x = px(sampleX(sir, t)), q = reach("sir", x, p, heading, "L", handleAt(t)); return { ...p, armL: lerpArm(p.armL, q.armL, w) }; };
  return { id: "c08", title: "08 Öppna en dörr", seconds: 4.4, bg: 1, events: { T_REACH, T_PULL, T_LET },
    cast: [{ name: "sir", m: sir, who: "sir", pose: onHandle, hands: { L: [[0, "relaxed"], [T_REACH + 0.3, "grip"], [T_LET + 0.2, "relaxed"]], R: [[0, "relaxed"]] } }],
    contacts: [{ who: "sir", side: "L", t0: T_REACH + 0.55, t1: T_LET, at: handleAt, tol: 4, what: "his hand on the handle" }],
    back: (g, t) => { // the house front, the dark hall behind the doorway, the door on its hinges at the left
      rect(g, DOOR.hinge - 90, LINE_TOP - DOOR.h - 150, DOOR.w + 180, DOOR.h + 156, "#b5654a");
      for (let yy = LINE_TOP - DOOR.h - 120; yy < LINE_TOP; yy += 46) { g.beginPath(); g.moveTo(DOOR.hinge - 90, yy); g.lineTo(DOOR.hinge + DOOR.w + 90, yy); g.lineWidth = 3; g.strokeStyle = "#8c4a36"; g.stroke(); }
      rect(g, DOOR.hinge - 14, LINE_TOP - DOOR.h - 16, DOOR.w + 28, DOOR.h + 22, "#e9dcc4", 8); rect(g, DOOR.hinge, LINE_TOP - DOOR.h, DOOR.w, DOOR.h + 4, "#2b2233", 0);
      const a = (doorAngle(t) * Math.PI) / 180, fx = DOOR.hinge + DOOR.w * Math.cos(a), grow = 1 + 0.1 * Math.sin(a), top = LINE_TOP - DOOR.h * grow;
      shape(g, [[DOOR.hinge, LINE_TOP - DOOR.h], [fx, top], [fx, LINE_TOP + 2], [DOOR.hinge, LINE_TOP + 2]], "#2f6f8f");
      const pnl = (u0: number, u1: number, v0: number, v1: number) => { const X = (u: number) => DOOR.hinge + (fx - DOOR.hinge) * u, Y = (u: number, v: number) => LINE_TOP - (DOOR.h + (top - (LINE_TOP - DOOR.h)) * -1 * u) * v; shape(g, [[X(u0), Y(u0, v1)], [X(u1), Y(u1, v1)], [X(u1), Y(u1, v0)], [X(u0), Y(u0, v0)]], "#3a82a6", 5); };
      pnl(0.15, 0.85, 0.56, 0.9); pnl(0.15, 0.85, 0.1, 0.44);
      const [hx, hy] = handleAt(t); g.beginPath(); g.arc(hx, hy, 11, 0, Math.PI * 2); g.fillStyle = "#e8c45a"; g.fill(); g.lineWidth = 5; g.strokeStyle = INK; g.stroke(); } };
};
const sampleX = (m: ReturnType<typeof figure>, t: number) => play("x", D, m, t, [0, 0, 0], 1, {}).at[0];

export const CLIPS: Record<string, () => Clip> = { c01, c02, c03, c04, c05, c06, c07, c08 };
export const clipFigs = (c: Clip, t: number): Fig[] => castAt(c.cast, t);
export type { HS };
