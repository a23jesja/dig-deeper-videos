// THE QUALITY GATE, gate 3 (Jesper, 19 Nov 2026): "Before the checks may approve anything, the build deliberately makes three faults (a
// figure sitting in the air above a seat, an arm locked straight out, a foot inside a sofa) and shows that the checks stop every one.
// This is repeated whenever a check or a set changes." This film is that proof, and nothing else: three shots, each with one fault made
// on purpose, so that `film_info proof-faults body` must FAIL with each of them named. It is never delivered.
import * as THREE from "three";
import type { Film, Shot, Actor, Staged, Cam } from "../stage/film";
import { lens, stageAt, palm } from "../stage/staging";
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
// AE. A PIPE LEFT HALF SEE-THROUGH: he stands turned 70 degrees with the pipe drawn half see-through (as step 1 faded it near profile)
add("AE-pipe-half-faded", { ...sir({}, 70), o: { handL: "relaxed", handR: "relaxed", pipeFault: "fade" } });
// AF. CONTROL for AA: the same arm out, and his eyes on his hand. The checks must pass it
add("AF-control-arm-out-looks-at-it", { ...sir({ armR: [[-6, 52], [-4, 50]] }), o: { handL: "relaxed", handR: "point", face: { gaze: [-1, 0] } } });

// AG-AH and AC2 (the review of step 1). AG. THE PIPE GONE: he stands turned 90 degrees (drawn 56, the most the rig may hold), the pipe
//     not drawn, as step 1 faded it out there. AH. A BOWL WITH NO STEM: three quarters, the bowl beside his cheek and no stem to his mouth
//     (08 frame 45 of e69306a)
add("AG-pipe-gone-at-90", { ...sir({}, 90), o: { handL: "relaxed", handR: "relaxed", pipeFault: "gone" } });
add("AH-bowl-without-stem", { ...sir({}, 40), o: { handL: "relaxed", handR: "relaxed", pipeFault: "loose" } });
// AC2. A START AT FULL SPEED THAT STOPS SOFTLY: still, then from the 30th frame both hands up and the body back, fastest on the first frame
//     and easing out over 0.6 s, seen from three quarters (60 degrees: facing the lens, hands raised forward and a lean back go toward the
//     lens and hardly move in the picture). The jerk test must stop it on the frame it starts
const easeOut = (t: number) => { const u = Math.min(1, Math.max(0, (t - 1) / 0.6)); return 1 - (1 - u) * (1 - u); };
add("AC2-hard-start-soft-stop", (t) => [sir({ lean: -8 * easeOut(t), armL: mixS(POSES.stand.armL as [[number, number], [number, number]], UPA, easeOut(t)), armR: mixS(POSES.stand.armR as [[number, number], [number, number]], UPA, easeOut(t)) }, 60)]);

// AI-AO. THE TESTS ADDED AFTER THE SHOT LIBRARY'S ROUND 3 (the review, 20 Nov: "Varje tillägg ska stoppa ett planterat fall och sin ruta
//    i r3d"). Each a fault made on purpose that `film_info proof-faults motion` or `body` must stop, and two controls they must pass.
// AI. AN EAR THAT POPS IN: he turns slowly from facing the lens to 40 degrees over the two seconds (under a degree a frame), the ears
//     drawn as before 20 Nov (earPop): the near ear switches from behind the head to on top in one frame at 33 degrees (03 frame 31)
add("AI-ear-pops-in", (t) => [{ ...sir({}, 20 * t), o: { handL: "relaxed", handR: "relaxed", earPop: true } }]);
// AJ. CONTROL for AI: the same turn, the ears as the rig draws them now (the near ear glides out from behind the head). Must pass
add("AJ-control-ear-glides", (t) => [{ ...sir({}, 20 * t), o: { handL: "relaxed", handR: "relaxed" } }]);
// AK. A THING NOBODY HOLDS THAT STARTS AT FULL SPEED: a crate on the floor beside him stands still, and on the 30th frame slides away at
//     5 cm a frame (the door let go in 07 frames 42-43: still, then swinging at full speed)
const CRATE = mesh(box(0.35, 0.3, 0.35), "#6a4a2a", { at: [0, 0.15, 0] }); CRATE.name = "crate";
add("AK-crate-starts-at-full-speed", sir({}), (g, _c, _cam, t) => { CRATE.position.set(0.9 + 0.05 * Math.max(0, at1(t) - 30), 0, -0.4); g.add(CRATE); });
// AL. A THING LET GO THAT SLIDES OUT FROM UNDER THE HAND: he holds a box out in his right hand, the arm rising slowly for a second; on the
//     30th frame his hand stops and lets go, and the box goes on as it was moving, away from the still hand (07 frames 43-47: the ring
//     slid out from under the fist)
const BOXH = mesh(box(0.22, 0.16, 0.16), "#a0703a", { at: [0, 0, 0] }); BOXH.name = "box";
const armAt = (t: number) => { const k = Math.min(1, t); return sir({ armR: [[0, 10 + 35 * k], [12, 10 + 35 * k]] }, 60); };
add("AL-thing-slides-out-of-the-hand", (t) => [{ ...armAt(t), o: { handL: "relaxed", handR: "grip" } }], (g, c, cam, t) => {
  const held = at1(t) < 30, p1 = palm(stageAt(armAt(1), cam), "R"), p0 = palm(stageAt(armAt(1 - 1 / 30), cam), "R"), n = at1(t) - 30;
  const p = held ? palm(c.sir, "R") : [p1[0] + (p1[0] - p0[0]) * n, p1[1] + (p1[1] - p0[1]) * n, p1[2] + (p1[2] - p0[2]) * n];
  BOXH.position.set(p[0], p[1], p[2]); g.add(BOXH);
  if (AUDIT.on) AUDIT.rows.push(held ? { id: BOXH.uuid, prop: "box", use: "carry", holder: "sir R", err: null, at: p as [number, number, number], o: BOXH } : { id: BOXH.uuid, prop: "box", use: "down", holder: "", err: null, at: p as [number, number, number], o: BOXH }); });
// AM. A THING INTO A SOLID: a crate slides slowly along the floor, from the first frame, into a block standing beside him (06 frames 32-34:
//     the falling bottle's corner in the stool's rim)
const CRATE2 = mesh(box(0.35, 0.3, 0.35), "#7a5a3a", { at: [0, 0.15, 0] }); CRATE2.name = "crate"; const BLOCK = mesh(box(0.4, 0.6, 0.6), "#8a8a8a", { at: [1.0, 0.3, -1.0] });
add("AM-crate-into-a-block", sir({}), (g, _c, _cam, t) => { g.add(BLOCK); CRATE2.position.set(0.3 + 0.25 * t, 0, -1.0); g.add(CRATE2); });
// AN. A FOREARM HIDDEN BEHIND THE UPPER ARM: turned a little from the lens, both hands raised before his chest (the react clip's UP pose), the upper
//     arm drawn over the forearm as before 20 Nov (foreUnder), turned 20 degrees as in 06: the far hand seems to grow out of the shoulder (06 frames 44-119)
const UPF: Partial<typeof POSES.stand> = { armL: [[26, 12], [128, 18]], armR: [[26, 12], [128, 18]] };
add("AN-forearm-behind-upper-arm", { ...sir(UPF, -20), o: { handL: "open", handR: "open", foreUnder: true } });
// AO. CONTROL for AN: the same pose, the forearm drawn over the upper arm where it comes toward the lens, as the rig draws it now. Must pass
add("AO-control-forearm-in-front", { ...sir(UPF, -20), o: { handL: "open", handR: "open" } });

export const PROOF_FAULTS: Film = { id: "proof-faults", fps: 30, seconds: shots.length * LEN, range: [0, 999], sky: "#9cc8f0", world, shots, words: [], hook: { text: [], a: 0, b: 0 }, light: dayLight(DAY.from, [0, 1, 0]) };
