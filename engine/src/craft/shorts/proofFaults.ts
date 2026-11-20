// THE QUALITY GATE, gate 3 (Jesper, 19 Nov 2026): "Before the checks may approve anything, the build deliberately makes three faults (a
// figure sitting in the air above a seat, an arm locked straight out, a foot inside a sofa) and shows that the checks stop every one.
// This is repeated whenever a check or a set changes." This film is that proof, and nothing else: three shots, each with one fault made
// on purpose, so that `film_info proof-faults body` must FAIL with each of them named. It is never delivered.
import * as THREE from "three";
import type { Film, Shot, Actor, Staged, Cam } from "../stage/film";
import { lens } from "../stage/staging";
import { POSES } from "../rig";
import { SIR_D, DOCTOR_D } from "../looks";
import { stool, woodSword } from "../world/props";
import { kneeling } from "../stage/gestures";
import { WOODSWORD, wield, usePose, AUDIT } from "../stage/grips";
import { mesh, box, skyDome, sunRig } from "../world/kit";
import { dayLight, DAY } from "./gestureSheet";
import { SIT } from "./gripSheet";

const world = () => { const g = new THREE.Group();
  g.add(mesh(box(30, 0.1, 30), "#c9b48e", { at: [0, -0.05, 0] }), mesh(box(30, 4, 0.2), "#e7dcc4", { at: [0, 2, -3], line: 0 }), skyDome("#7fb6ec", "#cfe6fb"));
  const rig = sunRig(DAY, [0, 0, 0]); g.add(rig); g.userData.rig = rig; return g; };
const V = lens(0, 1.0, 3.7, 0, -1, 0, 46), LEN = 2, shots: Shot[] = [];
const sir = (pose: Partial<typeof POSES.stand>, turn = 0): Actor => ({ name: "sir", D: SIR_D, h: 1.75, at: [0, 0, 0], heading: V.toward(0, 0, turn), pose: { ...POSES.stand, ...pose }, o: { handL: "relaxed", handR: "relaxed" } });
// the seated faults are seen from three quarters (55 degrees), where a seated card's thighs lie along the seat: seen from the front its
// shins hang straight down under its hips, and no seat can be under the hips without the shins inside it (the review, 19 Nov)
const TURN = 55, FW: [number, number] = [Math.sin((V.toward(0, 0, TURN) * Math.PI) / 180), Math.cos((V.toward(0, 0, TURN) * Math.PI) / 180)];
/** a seat `high` metres high and 0.4 m deep, its centre `back` metres behind his hips, turned with him. (A still figure stands with its
 *  feet on the floor: sitting, his hips are where his legs put them, about 0.46 m up) */
const seatAt = (turn: number, back: number, high = 0.42) => (g: THREE.Group) => { const hd = (V.toward(0, 0, turn) * Math.PI) / 180, fw = [Math.sin(hd), Math.cos(hd)], m = mesh(box(1.0, high, 0.4), "#7a5a36", { at: [0, high / 2, 0] }), h = new THREE.Group(); h.add(m); h.position.set(-fw[0] * back, 0, -fw[1] * back); h.rotation.y = hd; g.add(h); };
const seat = (back: number, high = 0.42) => seatAt(TURN, back, high);
const add = (id: string, cast: Actor | Actor[] | ((t: number) => Actor[]), things?: (g: THREE.Group, c: Record<string, Staged>, cam: Cam, t: number) => void, more: Partial<Shot> = {}) => { const a = shots.length * LEN;
  shots.push({ id, a, b: a + LEN, still: 1, cam: () => V.cam, sun: { target: [0, 0.8, 0], reach: 5 }, cast: (t) => (typeof cast === "function" ? cast(t) : Array.isArray(cast) ? cast : [cast]), things: things ? (g, c, t, _T, cam) => things(g, c, cam, t) : undefined, ...more }); };

// A. sitting in the air ABOVE a seat: a low seat (0.22 m) right under his hips, its front edge 8 cm before them: his hips 24 cm above it
add("A-sits-in-the-air", sir({ ...SIT, armL: [[18, 8], [50, 4]], armR: [[18, 8], [50, 4]] }, TURN), seat(0.12, 0.22));
// B. an arm locked straight out at shoulder height, held the whole shot (two seconds): no pointing hand
add("B-arm-locked-straight-out", sir({ armR: [[0, 90], [0, 90]] }));
// C. a foot inside a sofa: he stands with his left foot in the sofa's seat block
add("C-foot-inside-a-sofa", sir({}), (g) => { g.add(mesh(box(1.4, 0.42, 0.8), "#4a6ea8", { at: [0.75, 0.21, -0.1] }), mesh(box(1.4, 0.5, 0.2), "#3e5f93", { at: [0.75, 0.67, -0.42] })); });

// D. sitting in the air BESIDE a seat (what Jesper saw in the animal trials): sitting height, but the seat's front edge 10 cm behind his hips
add("D-sits-beside-the-seat", sir({ ...SIT, armL: [[18, 8], [50, 4]], armR: [[18, 8], [50, 4]] }, TURN), seat(0.3));
// E. THE CONTROL, no fault: he sits right, on a seat 0.36 m high reaching from 10 cm before his hips to 30 cm behind them. The checks
// must pass it: a check that fails every seated man proves nothing
add("E-control-sits-right", sir({ ...SIT, armL: [[18, 8], [50, 4]], armR: [[18, 8], [50, 4]] }, TURN), seat(0.1, 0.36));
// F. the gladiators' doctor as he was in v5 before 19 Nov (Jesper: "Han sitter i luften där och hans dress går igenom pallen"): a long
//    robe, seated (SIT, py -0.36, lean 6), the stool 0.15 m behind his pelvis, scaled to 0.86 of its height, seen at three quarters
add("F-robe-through-the-stool", { name: "doc", D: DOCTOR_D, h: 1.72, at: [0, 0, 0], heading: V.toward(0, 0, TURN), pose: { ...POSES.stand, ...SIT, py: -0.36, lean: 6, armL: [[18, 8], [50, 4]], armR: [[18, 8], [50, 4]] }, o: { handL: "relaxed", handR: "relaxed" } },
  (g) => { const sd = stool(); sd.position.set(-FW[0] * 0.15, 0, -FW[1] * 0.15); sd.scale.y = 0.86; g.add(sd); });

// G. the beaten man's kneel as it was in gladiators v5 (the independent review, 19 Nov: "det främre knät hänger i luften i höjd med
//    kjolfållen, och smalbenet lutar bakåt till en sandal som ligger platt bakom honom"): the pelvis dropped straight down over the planted
//    left foot, the right knee on the ground. The body check must FAIL it on the hanging left knee (the support test passed it on the other)
add("G-knee-hangs-in-the-air", sir({ py: -0.51, legR: { th: [-6, 4], sh: [-100, 0], pitch: 20 }, lean: 24, armR: [[12, 22], [8, 18]], armL: [[30, 8], [60, 4]] } as Partial<typeof POSES.stand>, TURN));
// H. THE CONTROL for G: the kneel with a hand on the ground as the film has it now (gestures.ts kneeling("kneelhand")): the front foot under
//    its knee, the other knee on the ground, the hand on the sand. The checks must pass it
add("H-control-kneels-right", sir({ ...kneeling("kneelhand") }, TURN));
// I and J. a held thing that vanishes between two shots (the independent review of gladiators v5: the murmillo's shield and sword gone
//    in the shot after the finger, then the sword in the other hand). In I he holds a sword in his right hand; in J, the next shot, his
//    hands are empty and nothing is set down. `film_info proof-faults grips` must FAIL J on the continuity between shots
const SWORD = woodSword();
add("I-holds-a-sword", { ...sir({ ...usePose(WOODSWORD, "lowered", "R") }), o: { handL: "relaxed", handR: "grip" } }, (g, c, cam) => wield(g, SWORD, WOODSWORD, "lowered", c.sir, "R", cam));
add("J-sword-gone-next-shot", sir({}));

// K-P. THE KNEE DRAPE (the review, 19 Nov: "Visa Sir i rock och en figur i dräkt som sitter, både framifrån och från sidan. E ska gå
//    igenom, och ett planterat fel med dräkten genom sitsen ska stoppas"). Seated, the card lays the garment below the waist over the lap
//    (designs/common.ts frame, cast.ts); `drape: false` draws it hanging along the spine as before. At three quarters (55 degrees, the least
//    a seated card may be turned: front on, its shins hang under its hips and no seat fits there) and in profile (90)
const SEATED = { ...SIT, armL: [[18, 8], [50, 4]], armR: [[18, 8], [50, 4]] } as Partial<typeof POSES.stand>;
const sitter = (name: string, D: typeof SIR_D, h: number, turn: number, drape: boolean): Actor => ({ name, D, h, at: [0, 0, 0], heading: V.toward(0, 0, turn), pose: { ...POSES.stand, ...SEATED }, o: { handL: "relaxed", handR: "relaxed", drape } });
// K. THE PLANTED FAULT: E with the drape off, Sir's coat tails drawn straight down through the seat. The garment check must FAIL it
add("K-coat-through-the-seat", sitter("sir", SIR_D, 1.75, TURN, false), seat(0.1, 0.36));
// L. CONTROL: the doctor's long robe, seated right at three quarters, the drape on. The checks must pass it
add("L-control-robe-sits-right", sitter("doc", DOCTOR_D, 1.72, TURN, true), seat(0.1, 0.35));
// M. THE PLANTED FAULT in a robe: L with the drape off, the robe straight down through the seat (the doctor of gladiators v5). Must FAIL
add("M-robe-through-the-seat", sitter("doc", DOCTOR_D, 1.72, TURN, false), seat(0.1, 0.35));
// N and O. CONTROLS in profile: Sir in his coat and the doctor in his robe, seated right, the drape on. The checks must pass them
add("N-control-coat-profile", sitter("sir", SIR_D, 1.75, 90, true), seatAt(90, 0.1, 0.36));
add("O-control-robe-profile", sitter("doc", DOCTOR_D, 1.72, 90, true), seatAt(90, 0.1, 0.35));
// P. THE HEM'S LENGTH: the doctor standing at three quarters, so that the robe's length seated (L, O) can be held against it (the review,
//    20 Nov: "Tyget blir inte kortare av att man sätter sig")
add("P-robe-standing", { name: "doc", D: DOCTOR_D, h: 1.72, at: [0, 0, 0], heading: V.toward(0, 0, TURN), pose: { ...POSES.stand }, o: { handL: "relaxed", handR: "relaxed" } });

// Q-X. WHAT HAPPENS BETWEEN FRAMES (the shot library review, 20 Nov: eight new tests, each shown stopping a fault made on purpose;
//    src/craft/stage/motionCheck.ts, and grips.ts / bodyCheck.ts for the door). `film_info proof-faults motion` (and grips, body) must FAIL each
const at1 = (t: number) => Math.round(t * 30);
// Q. A POSE THAT STANDS FOR ONE FRAME: his arms hang, on one frame (the 30th) they are at his chest, then they hang again
add("Q-pose-for-one-frame", (t) => [sir(at1(t) === 30 ? { armL: [[40, 30], [120, -40]], armR: [[40, 30], [120, -40]] } : {})]);
// R. THE HEAD REDRAWN BETWEEN TWO FRAMES: the head facing the lens, and from the 30th frame turned 40 degrees, at once
add("R-head-turns-in-one-frame", (t) => [sir({ head: [at1(t) < 30 ? 0 : -40, 2, 0] })]);
// S. SHAKING: the body rolled 2 degrees one way and the other on every other frame from the 15th
add("S-shakes-every-other-frame", (t) => [sir({ roll: at1(t) < 15 ? 0 : Math.floor(at1(t) / 2) % 2 ? 2 : -2 })]);
// T. THE PIPE IN AN OPEN MOUTH: Sir talking with his mouth wide open, the pipe as it was drawn before 20 Nov (pipeHold: false)
add("T-pipe-in-open-mouth", { ...sir({}), o: { handL: "relaxed", handR: "relaxed", pipeHold: false, face: { mouth: 0.6 } } });
// U. NOT LOOKING AT WHAT HE LOOKS AT: the shot says he looks at a point behind him on his left; he faces the lens
add("U-looks-at-the-lens", sir({}), undefined, { look: { sir: { at: [-2, 1.5, -3], what: "a point behind him" } } });
// V. CUT BY THE EDGE: he stands with half of himself out of the picture, still, from the first frame
add("V-cut-by-the-edge", { ...sir({}), at: [-0.95, 0, 0] });
// W. A HAND THROUGH A DOOR: he holds a door's leaf that swings through his forearm, his hand 20 cm off its ring
const LEAF = new THREE.Group(); LEAF.add(mesh(box(0.05, 1.9, 0.8), "#5a3a22", { at: [0, 0.95, -0.4] })); LEAF.name = "door";
add("W-hand-through-a-door", sir({ armR: [[30, 10], [70, 8]] }), (g, c, _cam, t) => { const w = c.sir.joint("wrR"), e = c.sir.joint("elR"); LEAF.position.set((w[0] + e[0]) / 2, 0, (w[2] + e[2]) / 2 + 0.4 - 0.2 * t); LEAF.rotation.y = 0.3 * t; g.add(LEAF);
  if (AUDIT.on) AUDIT.rows.push({ id: LEAF.uuid, prop: "door", use: "pull", holder: "sir R", err: null, at: w, o: LEAF, grip: [w[0], w[1] + 0.2, w[2]], arm: true }); });
// X. A THING THAT GOES WITHOUT ANYONE TAKING IT: a lantern on a box beside him, there until the 30th frame and then not
const BOXL = mesh(box(0.4, 0.5, 0.4), "#6a4a2a", { at: [0.7, 0.25, -0.2] }), LANT = mesh(box(0.15, 0.25, 0.15), "#ffd27a", { at: [0.7, 0.62, -0.2] }); LANT.name = "lantern";
add("X-lantern-gone", sir({}), (g, _c, _cam, t) => { g.add(BOXL); if (at1(t) < 30) g.add(LANT); });

// Y-AF. THE TESTS MENDED AFTER THE SHOT LIBRARY'S ROUND 2 (the review, 20 Nov: "Varje lagat test ska visas mot den ruta i e69306a som det
//    missade"). Each a fault made on purpose that `film_info proof-faults motion` must stop, and two controls it must pass
// Y. BARE PROFILE: he stands turned 100 degrees from the lens, the head drawn in profile (02 frame 80)
add("Y-head-in-bare-profile", sir({}, 100));
// Z. A HAND IN THE AIR: seated right (E), his right arm hanging off the seat's side, the hand open beside his hip, on nothing (08 frame 45)
add("Z-hand-in-the-air", { ...sitter("sir", SIR_D, 1.75, TURN, true), pose: { ...POSES.stand, ...SEATED, armR: [[22, 30], [74, 58]] } }, seat(0.1, 0.36));
// AA. AN ARM HELD STRAIGHT OUT AT A THING HE DOES NOT LOOK AT: the right arm out to his side a little under shoulder height, nearly
//     straight, for the whole shot, his eyes on the lens (07 0-1.3 s)
add("AA-arm-out-eyes-elsewhere", sir({ armR: [[-6, 52], [-4, 50]] }));
// AB. A THING IN THE HAND THAT JERKS: he holds the wooden sword lowered (I), and on the 30th frame it turns 5 degrees in the hand at once
//     and stays so (04 frames 15-16, the book)
const SWORD2 = woodSword();
add("AB-thing-jerks-in-the-hand", { ...sir({ ...usePose(WOODSWORD, "lowered", "R") }), o: { handL: "relaxed", handR: "grip" } }, (g, c, cam, t) => { wield(g, SWORD2, WOODSWORD, "lowered", c.sir, "R", cam); if (at1(t) >= 30) SWORD2.rotateX((5 * Math.PI) / 180); });
// AC. A START WITH NO EASING IN: he stands still, and on the 30th frame throws both hands up and leans back, at full speed from the first
//     frame (a straight blend over 0.4 s from a standstill, as the react clip did: 06 frames 33-34)
const UPA: [[number, number], [number, number]] = [[26, 12], [128, 18]], lin = (t: number) => Math.min(1, Math.max(0, (t - 1) / 0.4));
const mixS = (a: [[number, number], [number, number]], b: [[number, number], [number, number]], k: number) => a.map((q, i) => q.map((v, n) => v + (b[i][n] - v) * k)) as [[number, number], [number, number]];
add("AC-start-with-no-easing", (t) => [sir({ lean: -8 * lin(t), armL: mixS(POSES.stand.armL as [[number, number], [number, number]], UPA, lin(t)), armR: mixS(POSES.stand.armR as [[number, number], [number, number]], UPA, lin(t)) })], undefined, { newScene: { sir: "another proof case: the sword of AB is not his here (the empty field shows it)" } });
// AD. LOOKING STRAIGHT OUT AT A THING ON THE FLOOR: the shot says he looks at a box on the floor right in front of him; his eyes look
//     straight out (03 and 05: the bottle on the stool)
const BOXF = mesh(box(0.3, 0.2, 0.3), "#6a4a2a", { at: [0, 0.1, 1.0] });
add("AD-looks-out-not-down", sir({}), (g) => { g.add(BOXF); }, { look: { sir: { at: [0, 0.1, 1.0], what: "the box on the floor in front of him" } } });
// AE. A PIPE LEFT HALF SEE-THROUGH: he stands turned 70 degrees, where the pipe on the far side of his face fades out
add("AE-pipe-half-faded", sir({}, 70));
// AF. CONTROL for AA: the same arm out, and his eyes on his hand. The checks must pass it
add("AF-control-arm-out-looks-at-it", { ...sir({ armR: [[-6, 52], [-4, 50]] }), o: { handL: "relaxed", handR: "point", face: { gaze: [-1, 0] } } });

export const PROOF_FAULTS: Film = { id: "proof-faults", fps: 30, seconds: shots.length * LEN, range: [0, 999], sky: "#9cc8f0", world, shots, words: [], hook: { text: [], a: 0, b: 0 }, light: dayLight(DAY.from, [0, 1, 0]) };
