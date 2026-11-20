// THE QUALITY GATE, gate 2 (Jesper, 19 Nov 2026): the shot library. Every shot type a Short uses, made once as a clip of its own, three
// to five seconds in 1080 x 1920, in the cabin light v5 (the light standard), with every check at 0: once approved, a type is built the
// way its clip is built. Eight types: stand and talk, walk across, turn and look, hold with both hands, point, react, open a door, sit.
// One film of eight shots, four seconds each; scripts/shot_library.sh cuts it into one clip per type. It is never delivered as a film.
import * as THREE from "three";
import type { Film, Shot, Cam, V3, Word } from "../stage/film";
import { talk, mix3 } from "../stage/film";
import { mover, wag, mt, arm, ease, type MM } from "../stage/acting";
import { lens, once, noShade, near, aside, palm } from "../stage/staging";
import { reach, jointsOf, carryBy, AUDIT, type Stand } from "../stage/grips";
import { CABIN, inCabin, cabinNight, cabinDoor } from "../world/cabin";
import { openBook, bottle, chest } from "../world/props";
import { mesh, box } from "../world/kit";
import { SIR_D } from "../looks";
import { reachArm, pointArm } from "../world/people";
import { GESTURES, upper } from "../stage/gestures";
import { POSES, type Pose, type Seg } from "../rig";
import { SIT } from "./gripSheet";
import { on } from "./gladiatorsHooks";
import { cabinV5, CABIN_SKY, NIGHT_GRADE } from "./cabinTest";
import { glow } from "../world/fire";
import { rightWay } from "./gripSheet";

const LEN = 4, H = 1.75, Y = CABIN.at[1], EYE = 1.35, FOV = 50, shots: Shot[] = [];
/** the doorway in the right-hand wall, its middle this far along the cabin's z (clip 7) */
const DZ = 0.5;
const { light, air } = cabinV5();
/** the usual lens of the cabin (cabin v5's): at the room's open front, looking in along -z */
// (tipped 6 degrees down, so that the whole figure, feet and all, stands in the picture with room under it: level, the feet were cut)
const FRONT = lens(CABIN.at[0] + 0.3, Y + EYE, CABIN.at[2] + 3.6, 0, -1, -6, FOV);
const P = (o: Partial<Pose>) => o;
/** every clip is a scene of its own: what Sir held in the clip before is not his here (grips.ts, the continuity between shots) */
const OWN = { sir: "a clip of its own in the shot library: another place in the cabin, another moment" };
// Round 3 (the review of round 2): every move eases in and out (acting.ts ease: no start or stop at full speed, the jerk test), rest
// hands hang loose with the palm to the thigh (the rig), the eyes go where the head goes, up or down too (Shot.look and face.gaze)
type AddO = { talk?: Word[]; rays?: boolean; look?: Shot["look"]; hide?: string[]; pre?: number; things2?: boolean };
const add = (id: string, m: MM, cam: (t: number, u: number) => Cam, things?: Shot["things"], o: AddO = {}) => { const a = shots.length * LEN;
  shots.push({ id, a, b: a + LEN, still: LEN / 2, newScene: OWN, look: o.look, hide: o.hide, cam, sun: { target: inCabin([0, 0, 0]), reach: 4 }, capsTop: 1500,
    // (the words' times are the clip's own: read against the film's time, every clip after the first kept its mouth shut)
    // (pre: the mover's time runs this much ahead of the clip's, so that a walk is already under way on the first frame)
    cast: (t) => [{ ...on("sir", SIR_D, m, t + (o.pre ?? 0), Y, o.talk ? { talk: talk(o.talk, t) } : {}), noShade: true }],
    // (the door in the right-hand wall stands shut in every clip but its own, so that the doorway is never an empty hole)
    things: (g, c, t, T, cm) => { air(g, T, cm, { rays: o.rays, beam: o.rays }); if (id !== "open-a-door") g.add(SHUT()); things?.(g, c, t, T, cm); } }); };
const SHUT = once(() => noShade(cabinDoor(DZ, 0, true).g));
const at = (d: number, l: number): V3 => { const [x, z] = FRONT.spot(d, l); return [x, Y, z]; };
const stand = (p: V3, heading: number, pose: Partial<Pose> = {}, cam = FRONT.cam): Stand => ({ D: SIR_D, at: p, heading, h: H, cam, pose });
/** syllables of 0.2-0.3 s with short gaps and a breath, as times only (the clips have no sound) */
const syl = (t0: number, t1: number, gap: [number, number] | null = null): Word[] => { const W: Word[] = []; for (let t = t0; t < t1; t += 0.31) { if (gap && t > gap[0] && t < gap[1]) continue; W.push({ w: "la", a: t, b: t + 0.22 + 0.06 * Math.sin(t * 7) }); } return W; };
/** his arms hanging at rest: a little out from his sides, the elbows a little bent (round 2: straight arms read as an A stance) */
const REST: Partial<Pose> = { armL: [[4, 13], [16, 9]], armR: [[4, 13], [16, 9]] };
const LOOSE = { handL: "relaxed" as const, handR: "relaxed" as const };

// 1. STAND AND TALK. Turned 40 degrees from the lens, he talks to us: one hand explains, then both open out unevenly, the left counts
//    on two fingers, the right comes up palm down and settles; his weight goes from one foot to the other and back, a nod now and then,
//    his mouth with the words (opening on the side away from his pipe)
// (round 2: the same even gesture with the palms out over and over, the legs locked, rest hands with the palms to the lens. Now four
//  different gestures, each eased in over 0.4-0.5 s with the elbows bent, two shifts of weight, loose rest hands)
{ const p = at(2.9, 0), hd = FRONT.toward(p[0], p[2], 40), m = mover(SIR_D, H, p[0], p[2], hd); m.w = 0.09; m.stand(9);
  const F = (brow: number, smile = 0.45) => ({ brow, lid: 0.12, smile });
  ease(m, -1, { ...REST, head: [-6, 2, 0] }, 0.01, { ...LOOSE, face: F(0.3) });
  ease(m, 0.25, { armR: [[10, 42], [90, 46]], armL: REST.armL, head: [-10, 4, 0], px: 0.03, hipTilt: -3, roll: 1.5 }, 0.5, { handL: "relaxed", handR: "open", face: F(0.6) });
  ease(m, 1.0, { armL: [[14, 30], [74, 40]], armR: [[8, 40], [96, 50]], head: [-3, 0, 0] }, 0.45, { handL: "open", handR: "open", face: F(0.9, 0.55) });
  ease(m, 1.75, { armL: [[26, 44], [120, 52]], armR: [[6, 30], [26, 22]], head: [-9, 5, 0], px: -0.03, hipTilt: 3, roll: -1.5 }, 0.5, { handL: "two", handR: "relaxed", face: F(0.7) });      // (the counting hand up and out beside him: forward, it lay on his belly as the picture showed it)
  ease(m, 2.55, { armR: [[10, 46], [80, 44]], armL: REST.armL, head: [-12, 2, 0] }, 0.45,      // (out to his side: before him, three quarters on, the hand lay on his belly)
  { handL: "relaxed", handR: "open", face: F(0.6, 0.5) });
  ease(m, 3.25, { ...REST, head: [-6, 4, 0], px: 0, hipTilt: 0, roll: 0 }, 0.55, { ...LOOSE, face: F(0.4, 0.5) });
  add("stand-and-talk", m, (_t, u) => FRONT.push(0.15 * u), undefined, { talk: syl(0.3, 3.7, [1.8, 2.15]) }); }

// 2. WALK ACROSS. He walks across the cabin before the table at an easy pace, a little toward us, from the left of the picture out
//    through the right edge, his arms swinging loose; his head turned to us (within 60 degrees: the rig never draws a bare profile)
// (round 2: the head redrawn on one frame and then in bare profile, arms hanging straight with fists, the body leaning back and both feet
//  in half a step like a shuffle, the swinging foot dangling toe down, the room empty for 0.6 s. Now the walk is under way on the first
//  frame (pre), longer steps, a fuller swing with loose hands (motion.ts), a slight lean into the walk, the head turned toward the lens)
// (and the lens trucks along with him, slower than he walks, so that he crosses the picture in the clip's whole four seconds: standing
//  still, he was out of the picture by half way and the room stood empty)
{ const X0 = CABIN.at[0] - 0.3, VX = 0.3, TRUCK = (t: number) => lens(X0 + VX * t, Y + EYE, CABIN.at[2] + 3.4, 0, -1, -6, FOV);
  const [sx, sz] = TRUCK(0).spot(3.0, -0.58), hd = 84, m = mover(SIR_D, H, sx, sz, hd); m.walk(mt(m, 4.6), { step: 0.5, tau: 0.62 }).stand(9);
  ease(m, -1, { head: [-30, 0, 0], lean: 4 }, 0.01, { face: { brow: 0.4, lid: 0.15, smile: 0.45 } });
  add("walk-across", m, (t) => TRUCK(t).cam, undefined, { pre: 0.8 }); }

// 3. TURN AND LOOK. He stands facing the lens, beside the stool with a bottle on it a step and a half to his right. Something there
//    catches him: his head goes first, his eyes drop to the bottle, then his body turns after it on his feet, and he looks at it
// (round 2: the face jumped 50 px in one frame as the turn began, the far ear popped in, the eyes looked straight out at a bottle well
//  below them, an A stance with straight arms, the lifted back foot a dark wedge. Now the head eases round, the eyes go down to the
//  bottle (gaze), the feet closer together and the arms a little bent, the turn shorter so the feet hardly lift)
const STOOL_AT: V3 = inCabin([CABIN.stool[0], 0, CABIN.stool[2]]), BOTTLE_AT: V3 = [STOOL_AT[0], Y + 0.62, STOOL_AT[2]];
const BOTTLE = once(() => noShade(bottle(0.3, "#3f8a5c")));
const onStool = (g: THREE.Group) => { const b = BOTTLE(); b.position.set(STOOL_AT[0], Y + 0.47, STOOL_AT[2]); b.rotation.set(0, 0, 0); g.add(b); };
{ const p: V3 = inCabin([0.72, 0, CABIN.stool[2]]), hd = FRONT.toward(p[0], p[2], 0), m = mover(SIR_D, H, p[0], p[2], hd); m.w = 0.08; m.stand(1.1).turn(-40, 1.4).stand(9);
  ease(m, -1, { ...REST, head: [0, 2, 0] }, 0.01, { ...LOOSE, face: { brow: 0.2, lid: 0.2, smile: 0.2 } });
  ease(m, 0.5, { ...REST, head: [-36, 4, 0] }, 0.6, { ...LOOSE, face: { brow: 0.9, lid: 0, wide: 0.5, gaze: [-0.9, 0.8] } });
  ease(m, 2.3, { ...REST, head: [-32, 6, 0] }, 0.6, { ...LOOSE, face: { brow: 0.7, lid: 0.05, wide: 0.3, gaze: [-0.8, 0.9] } });
  add("turn-and-look", m, (_t, u) => FRONT.push(0.2 + 0.1 * u), (g) => onStool(g), { look: { sir: { at: BOTTLE_AT, from: 2.6, what: "the bottle on the stool" } } }); }

// 4. HOLD WITH BOTH HANDS. He shows us an open book, its pages toward us and his eyes on us, held by its outer edges: the thumbs over
//    its front, the fingers behind. He lifts it toward us, tips his head, lowers it a little and lifts it again, nodding, pleased
// (round 2: the backs of the fists lay over the book's face with the arms behind it; the book jerked 4 degrees in one frame and rocked;
//  grey fists; hardly any movement. Now the thumbs (hands "thumb", carryBy show), every move eased, four moves in four seconds)
{ const p = at(3.75, 0.05), hd = FRONT.toward(p[0], p[2], 10), m = mover(SIR_D, H, p[0], p[2], hd); m.w = 0.09; m.stand(9);
  const rs = stand(p, hd), rj = jointsOf(rs), rw = rightWay(rs), hold = (k: number, fwd: number, tilt = 0): Partial<Pose> => { const rc = near(mix3(rj("pelvis"), rj("neck"), k), FRONT.cam, fwd);
    return { ...reach(rs, "R", aside(rc, FRONT.cam, rw * 0.27, tilt)), ...reach(rs, "L", aside(rc, FRONT.cam, -rw * 0.27, -tilt)) }; };
  const T0 = { handL: "thumb" as const, handR: "thumb" as const };
  ease(m, -1, { ...hold(0.52, 0.36), head: [0, 4, 0] }, 0.01, { ...T0, face: { brow: 0.4, lid: 0.15, smile: 0.5 } });
  ease(m, 0.3, { ...hold(0.55, 0.38), head: [-3, 2, 0] }, 0.7, { ...T0, face: { brow: 0.9, lid: 0.05, smile: 0.7, wide: 0.3 } });
  ease(m, 1.2, { ...hold(0.55, 0.38, 0.02), head: [4, 8, 0] }, 0.6, { ...T0, face: { brow: 0.7, lid: 0.1, smile: 0.8 } });
  ease(m, 2.0, { ...hold(0.52, 0.36), head: [1, 2, 0] }, 0.6, { ...T0, face: { brow: 0.6, lid: 0.12, smile: 0.7 } });
  ease(m, 2.8, { ...hold(0.56, 0.39), head: [-2, 7, 0] }, 0.7, { ...T0, face: { brow: 0.9, lid: 0.08, smile: 0.8 } });
  const BOOK = once(() => noShade(openBook()));
  add("hold-with-both-hands", m, (_t, u) => FRONT.push(0.75 + 0.1 * u), (g, c, _t, _T, cam) => { carryBy(g, BOOK(), c.sir, "L", c.sir, "R", cam, 0.1, "carry", true); }); }

// 5. POINT. Beside the stool with the bottle, nearly in profile, he looks down at it, draws his near arm back a little and points down at
//    it, the elbow a little bent and the index finger out, the arm moving a little as he holds it; his eyes on the bottle, his other hand
//    hanging loose
// (round 2: the finger landed on the green mug on the table, so that he seemed to poke it; the eyes straight out; the arm locked straight
//  from frame 39; a rest hand palm forward. Now the arm aims down at the bottle with the elbow bent, the eyes go down, the pose eases)
// (he stands nearer the stool and nearer the lens than in round 2, so that pointing down at the bottle his hand comes below the table's
//  top in the picture: pointing level, the finger lay on the table's edge, or on the mug, as if he poked it)
{ const p: V3 = inCabin([0.42, 0, CABIN.stool[2] - 0.12]), hd = FRONT.toward(p[0], p[2], -45), m = mover(SIR_D, H, p[0], p[2], hd); m.w = 0.08; m.stand(9);
  const C0 = FRONT.push(0.3), fv = new THREE.Vector3(C0.look[0] - C0.pos[0], C0.look[1] - C0.pos[1], C0.look[2] - C0.pos[2]).normalize(), rv = new THREE.Vector3().crossVectors(fv, new THREE.Vector3(0, 1, 0)).normalize(), uv = new THREE.Vector3().crossVectors(rv, fv);
  const ps = stand(p, hd), shL = jointsOf(ps)("shL"), dvec = new THREE.Vector3(BOTTLE_AT[0] - shL[0], BOTTLE_AT[1] - shL[1], BOTTLE_AT[2] - shL[2]), pdir: [number, number] = [dvec.dot(rv), dvec.dot(uv)];
  const AIM = pointArm(SIR_D, { ...POSES.stand } as Pose, {}, { at: p, heading: hd, h: H }, C0.pos, "L", pdir, 0.45) as [Seg, Seg];
  const G = { gaze: [-0.9, 0.9] as [number, number] }, hB = Math.max(-34, Math.min(34, ((((Math.atan2(BOTTLE_AT[0] - p[0], BOTTLE_AT[2] - p[2]) * 180) / Math.PI - hd + 540) % 360) - 180)));      // (the head to the bottle from his heading, the face kept within the rig's limit)
  ease(m, -1, { ...REST, head: [-10, 2, 0] }, 0.01, { ...LOOSE, face: { brow: 0.3, lid: 0.15 } });
  ease(m, 0.3, { ...REST, head: [hB, 6, 0] }, 0.45, { ...LOOSE, face: { brow: 0.8, lid: 0.05, wide: 0.3, ...G } });
  ease(m, 0.75, { armL: [[-12, 12], [24, 8]], armR: REST.armR }, 0.3, { ...LOOSE, face: { brow: 0.8, lid: 0.05, wide: 0.3, ...G } });
  ease(m, 1.05, { armL: AIM, armR: REST.armR, head: [hB, 8, 0] }, 0.6, { handL: "point", handR: "relaxed", face: { brow: 0.9, lid: 0.05, mouth: 0.25, ...G } });
  wag(m, 1.9, 2.0, P({ armL: [[AIM[0][0] + 3, AIM[0][1]], [AIM[1][0] + 5, AIM[1][1]]] }), P({ armL: [[AIM[0][0] - 3, AIM[0][1]], [AIM[1][0] - 3, AIM[1][1]]] }), 1.0, { handL: "point", handR: "relaxed", glide: true });
  add("point", m, (_t, u) => FRONT.push(0.2 + 0.1 * u), (g) => onStool(g), { look: { sir: { at: BOTTLE_AT, from: 0.8, what: "the bottle he points at" } } }); }

// 6. REACT. He stands beside the stool humming to himself, a hand at his waistcoat; the bottle on the stool topples off onto the floor.
//    He tenses for a beat, then jolts back with both hands up before his chest, eyes wide, and stares down at it
// (round 2: nothing happened for 1.1 s; then head and body were thrown round in one frame with no wind-up; the clenched grin read as a
//  grille; the raised hand was grey; he stared into the lens at nothing. Now something to see and hear: the bottle falls at 1.0 s and he
//  looks at it; a wind-up (tensing, shoulders up) before the jolt, every move eased; the rig's simpler grimace and skin-toned hands)
// (round 4, the review of round 3: the bottle's corner sank into the stool's rim and it fell for no reason, and lay 2.6 cm in the floor (the
//  new thing test). Now it stands near the stool's edge, rocks twice as the ship rolls (a creak), tips over its own base's outer edge with
//  the speed growing, leaves the rim and falls free, turning on, and lands on its side on the floor, its round side touching it)
const FLOOR_AT: V3 = [STOOL_AT[0] + 0.22, Y + 0.04, STOOL_AT[2] + 0.3];
const ROCK0 = 0.5, TIP0 = 0.95, TIPD = 0.5, TIPA = (45 * Math.PI) / 180, BR = 0.066, G9 = 9.8;
const BDIR = (() => { const dx = FLOOR_AT[0] - STOOL_AT[0], dz = FLOOR_AT[2] - STOOL_AT[2], n = Math.hypot(dx, dz) || 1; return new THREE.Vector3(dx / n, 0, dz / n); })();
const BAXIS = new THREE.Vector3(0, 1, 0).cross(BDIR).normalize(), SEAT_Y = Y + 0.47;
const BASE0 = new THREE.Vector3(STOOL_AT[0], SEAT_Y, STOOL_AT[2]).addScaledVector(BDIR, 0.14), PIVOT = BASE0.clone().addScaledVector(BDIR, 0.06);      // (its base's edge on the seat's rim: it tips over the rim itself)
/** the bottle's base and turn while it rocks and tips about the pivot (the base's outer edge) */
const tipped = (th: number) => ({ p: BASE0.clone().sub(PIVOT).applyAxisAngle(BAXIS, th).add(PIVOT), th });
const REL = tipped(TIPA), REL2 = tipped(TIPA - ((2 * TIPA) / TIPD) / 300), V0 = REL.p.clone().sub(REL2.p).multiplyScalar(300).addScaledVector(BDIR, 0.45);      // (and it slides off the rim as it goes: dropping straight from the rim, its base corner grazed the seat's edge)
const FALLT0 = (() => { const y0 = REL.p.y, yl = Y + BR + 0.002, vy = V0.y; return (vy + Math.sqrt(vy * vy + 2 * G9 * (y0 - yl))) / G9; })(), FALLT = FALLT0, FALL1 = TIP0 + TIPD + FALLT, WF = (Math.PI / 2 - TIPA) / FALLT;      // (turning on at a speed that lays it on its side as it lands)
const LAND: V3 = (() => { const q = REL.p.clone().addScaledVector(V0, FALLT).addScaledVector(BDIR, 0.13); return [q.x, Y + BR, q.z]; })();
const bottleAt = (g: THREE.Group, t: number) => { const b = BOTTLE();
  let st: { p: THREE.Vector3; th: number };
  if (t < ROCK0) st = { p: BASE0.clone(), th: 0 };
  else if (t < TIP0) { const k = (t - ROCK0) / (TIP0 - ROCK0), r = (5 * Math.PI) / 180 * (0.5 - 0.5 * Math.cos(4 * Math.PI * k)); st = tipped(r); }
  else if (t < TIP0 + TIPD) { const k = (t - TIP0) / TIPD; st = tipped(TIPA * k * k); }
  else if (t < FALL1) { const d = t - TIP0 - TIPD; st = { p: REL.p.clone().addScaledVector(V0, d).add(new THREE.Vector3(0, -0.5 * G9 * d * d, 0)), th: TIPA + WF * d }; }
  else { const d = FALLT; const q = REL.p.clone().addScaledVector(V0, d); st = { p: new THREE.Vector3(q.x, Y + BR + 0.002, q.z), th: Math.PI / 2 }; }
  b.position.copy(st.p); b.quaternion.setFromAxisAngle(BAXIS, st.th); g.add(b); };
{ const p: V3 = inCabin([0.35, 0, -0.45]), hd = FRONT.toward(p[0], p[2], -20), m = mover(SIR_D, H, p[0], p[2], hd); m.w = 0.09; m.stand(9);
  // (the head turned to where the bottle lies, from his heading)
  const want = Math.max(-45, Math.min(45, ((((Math.atan2(FLOOR_AT[0] - p[0], FLOOR_AT[2] - p[2]) * 180) / Math.PI - hd + 540) % 360) - 180)));
  const UP: Partial<Pose> = { armL: [[26, 12], [128, 18]], armR: [[26, 12], [128, 18]], lean: -6, head: [want, 8, 0] }, DOWN = { gaze: [-0.8, 0.9] as [number, number] };
  ease(m, -1, { ...REST, head: [-4, 2, 0] }, 0.01, { handL: "relaxed", handR: "relaxed", face: { brow: 0.3, lid: 0.3, smile: 0.4 } });
  ease(m, 0.3, { head: [2, 4, 0], px: 0.02, hipTilt: -2 }, 0.5, { handL: "relaxed", handR: "relaxed", face: { brow: 0.4, lid: 0.35, smile: 0.5 } });
  // the bottle rocks (0.5 s, a creak): his head turns to it, his humming stops
  ease(m, 0.75, { ...REST, head: [want * 0.6, 5, 0], px: 0.01, hipTilt: -1 }, 0.45, { ...LOOSE, face: { brow: 0.7, lid: 0.15, smile: 0.1, ...DOWN } });
  // it tips (0.95-1.45): he tenses, shoulders up, the hands drawn in
  ease(m, 1.3, { ...REST, armR: [[10, 10], [40, 6]], lean: 4, py: -0.015, head: [want * 0.85, 6, 0], px: 0, hipTilt: 0 }, 0.3, { ...LOOSE, face: { brow: 0.85, lid: 0.05, wide: 0.6, mouth: 0.1, ...DOWN } });
  // it hits the floor (1.74): the jolt, both hands up before his chest
  ease(m, 1.75, UP, 0.38, { handL: "open", handR: "open", face: { brow: 1, lid: 0, wide: 1, mouth: 0.5, smile: -0.5, ...DOWN } });
  // then the breath out: the hands come down to his waist, he leans to look at it, and shakes his head a little
  ease(m, 2.45, { armL: [[18, 12], [70, 14]], armR: [[16, 12], [64, 12]], lean: 8, head: [want, 14, 0] }, 0.6, { handL: "relaxed", handR: "relaxed", face: { brow: 0.6, lid: 0.25, wide: 0.2, mouth: 0.1, smile: -0.3, ...DOWN } });
  wag(m, 3.1, 0.9, P({ head: [want - 7, 14, 0] }), P({ head: [want + 7, 14, 0] }), 0.45, { handL: "relaxed", handR: "relaxed", face: { brow: 0.5, lid: 0.3, smile: -0.2, ...DOWN }, glide: true });
  add("react", m, (_t, u) => FRONT.push(0.2 + 0.1 * u), (g, _c, t) => bottleAt(g, t), { talk: syl(0.2, 0.7), look: { sir: { at: LAND, from: 1.9, what: "the bottle on the floor" } } }); }

// 7. OPEN A DOOR. The lens inside the cabin looks across it at the door in the right-hand wall, hinged at its back edge. He stands a
//    step from the door, along the wall toward the room's front, his right side to it. He reaches out, his hand on its ring, looks at it
//    and pushes it open away from him into the passage; at a fifth of the way he lets it go and it swings on, wide open, into a passage
//    lit by a lantern on its far wall
// (round 2: the arm held straight out at shoulder height for 1.3 s while the door did not move, the door starting to swing the frame the
//  hand left it, so that the push was never seen; he looked into the lens; streaks of light came from nowhere; the doorway was a black
//  hole. Now the hand travels to the ring (0-0.45 s), the door moves from the frame the hand is on it, he looks at the ring (Shot.look:
//  he stands where the ring is no more than 100 degrees from the lens, so his face can turn to it within the rig's limit), the moon and
//  its shafts are left out (Shot.hide: its windows are behind the lens, and its light lay in slanting bands from nowhere), and the passage
//  has its lantern and a lit far wall. The review's
//  first choice, the lens in the passage, would put the leaf between the lens and his hand: the review's fallback)
{ const p: V3 = inCabin([1.85, 0, 1.25]), m0 = 178;
  const L0 = inCabin([-1.95, 0, 0.12]), tgt = inCabin([1.9, 0, 0.75]), V = lens(L0[0], Y + 1.3, L0[2], tgt[0] - L0[0], tgt[2] - L0[2], -6, FOV);
  // (round 4, the review of round 3: the push ended at rest and the door then swung on at full speed, the ring sliding out from under the
  //  fist, and only 20 degrees of it were pushed. Now his hand pushes it 25 degrees, the door gathering speed from rest (an ease in, no ease
  //  out); he lets go while it moves and it swings on at that speed, slowing as it goes. 25 degrees: pushed to 30, his arm went straight out)
  // (round 4: his hand shoves it open 25 degrees, the door gathering speed and the shove easing off; he lets go while it still moves
  //  slowly, and it coasts on, slowing, to about 40 degrees, the lit passage showing. Pushed at full speed and let go, the ring slid out
  //  from under the fist, round 3; pushed further, his arm went straight out)
  const T0 = 0.45, T1 = 1.8, LET = 1.6, PA = 25, TAU = 1.4, S = (k: number) => k * k * (3 - 2 * k);
  const kL = (LET - T0) / (T1 - T0), aL = PA * S(kL), vL = (PA * 6 * kL * (1 - kL)) / (T1 - T0);
  const ang = (t: number) => { if (t < T0) return 0; if (t < LET) return -PA * S((t - T0) / (T1 - T0)); return -(aL + vL * TAU * (1 - Math.exp(-(t - LET) / TAU))); };
  const ring = (t: number) => cabinDoor(DZ, ang(t), true).handle, R0 = ring(0);
  const deg = (v: number) => ((((v + 540) % 360) + 360) % 360) - 180, dirTo = (q: V3) => (Math.atan2(q[0] - p[0], q[2] - p[2]) * 180) / Math.PI, lensDir = dirTo([V.cam.pos[0], 0, V.cam.pos[2]]);
  // (his body turned no more than 72 degrees from the lens, his head the rest of the way to the ring, the face never past 86)
  const hd = lensDir + Math.max(-72, Math.min(72, deg(m0 - lensDir))), headTo = (q: V3) => { const want = deg(dirTo(q) - hd), face = deg(hd + want - lensDir); return want - Math.sign(face) * Math.max(0, Math.abs(face) - 86); };
  const m = mover(SIR_D, H, p[0], p[2], hd); m.w = 0.09; m.stand(9);
  const ss = stand(p, hd, {}, V.cam), sh = jointsOf(ss)("shR"), hr = (hd * Math.PI) / 180, side: [number, number] = [-Math.cos(hr), Math.sin(hr)];
  const EY = 0.3, EK = 0.35, LX = -0.25, RL = 8, push = (t: number): Partial<Pose> => { const q = ring(t), e: V3 = [sh[0] + side[0] * 0.12 + (q[0] - sh[0]) * EK, sh[1] - EY, sh[2] + side[1] * 0.12 + (q[2] - sh[2]) * EK];
    // (his weight goes over toward the door as he pushes it, so that his shoulder follows the ring and the arm stays bent: standing upright,
    //  the arm went straight out once the door was 20 degrees open; the body check)
    const lean = LX * Math.min(1, Math.max(0, (t - T0) / (LET - T0))), pose0 = { px: lean, roll: RL * lean / (LX || 1) } as Pose;
    return { px: pose0.px, roll: pose0.roll, armR: reachArm(SIR_D, pose0, {}, { at: p, heading: hd, h: H }, V.cam.pos, "R", q, 0.5, e) }; };
  const LOOK = { gaze: [-0.9, 0.3] as [number, number] }, hR = headTo(R0);
  ease(m, -1, { ...REST, head: [hR * 0.4, 2, 0] }, 0.01, { ...LOOSE, face: { brow: 0.3, lid: 0.15 } });
  // the reach: the head and eyes to the ring first, the hand after them, onto the ring as the push begins
  ease(m, 0.0, { ...REST, head: [hR, 3, 0] }, 0.35, { ...LOOSE, face: { brow: 0.5, lid: 0.1, ...LOOK } });
  ease(m, 0.05, { ...push(0), head: [hR, 3, 0] }, T0 - 0.05, { handL: "relaxed", handR: "grip", face: { brow: 0.5, lid: 0.1, ...LOOK } });
  // the push: the arm solved where the ring is at three moments, each blend begun before the last one ends so that the hand never stops
  for (const [q, d] of [[0.7, 0.36], [0.95, 0.36], [1.2, 0.36], [1.42, 0.34], [LET, 0.3]] as [number, number][]) ease(m, q - d * 0.6, { ...push(q), head: [headTo(ring(q)), 3, 0] }, d, { handL: "relaxed", handR: "grip", face: { brow: 0.6, lid: 0.08, ...LOOK } });
  // let go: the hand, still closed, comes back to his side as the door coasts on; his eyes after the door. (It stays a fist until it is
  //  back: opened as it let go, its palm jumped 4 cm in a frame, and the release test read that as the ring sliding away from it)
  ease(m, LET, { ...REST, head: [headTo(ring(2.6)), 2, 0] }, 0.9, { handL: "relaxed", handR: "grip", face: { brow: 0.8, lid: 0.05, wide: 0.4, ...LOOK } });
  const DOOR_O = once(() => noShade(cabinDoor(DZ, 0, true).g));
  // (seen across the room, the cabin's open front showed the night beyond it at the picture's right edge: here a planked bulkhead closes it)
  const FRONT_WALL = once(() => mesh(box(CABIN.w + 0.24, CABIN.h, 0.12), "#6a4428", { at: inCabin([0, CABIN.h / 2, CABIN.d / 2 + 0.06]) }));
  // the passage's lantern on its far wall, and the warm light it throws on the planks round it
  const PX = CABIN.w / 2 + 0.1 + 1.36, DOOR_H = 1.92, LANT = once(() => { const gL = new THREE.Group(); gL.add(mesh(box(0.14, 0.22, 0.1), "#ffd88a", { at: inCabin([PX - 0.08, 1.45, DZ]), line: 0.6 }), mesh(box(0.18, 0.03, 0.14), "#3a2618", { at: inCabin([PX - 0.08, 1.58, DZ]), line: 0.4 }));
    const pl = new THREE.PointLight("#ffb060", 2.2, 2.4, 1.5); pl.position.set(...inCabin([PX - 0.3, 1.5, DZ])); gL.add(pl); return gL; });
  // the passage's far wall, planked and lit by its lantern, so that the open doorway shows a lit wall and not a black hole
  const FARWALL = once(() => { const gW = new THREE.Group(); gW.add(mesh(box(0.03, DOOR_H + 0.2, 1.5), "#6a4428", { at: inCabin([PX - 0.02, (DOOR_H + 0.2) / 2, DZ]), line: 0 }));
    for (let z = -0.6; z <= 0.61; z += 0.2) gW.add(mesh(box(0.035, DOOR_H + 0.2, 0.012), "#4a2e18", { at: inCabin([PX - 0.03, (DOOR_H + 0.2) / 2, DZ + z]), line: 0, shadow: false })); return noShade(gW); });
  add("open-a-door", m, (_t, u) => V.push(0.08 * u), (g, c, t, T, cm) => { g.add(FRONT_WALL()); g.add(LANT()); g.add(FARWALL()); glow(g, inCabin([PX - 0.08, 1.45, DZ]), 0.35, 0.35, T, Math.atan2(cm.pos[0] - inCabin([PX, 0, DZ])[0], cm.pos[2] - inCabin([PX, 0, DZ])[2]), 4);
    const d = cabinDoor(DZ, ang(t), true), o = DOOR_O(); o.position.copy(d.g.position); o.rotation.copy(d.g.rotation); o.children[0].scale.copy(d.g.children[0].scale); g.add(o);
    if (AUDIT.on) AUDIT.rows.push(t >= T0 - 0.02 && t < LET ? { id: o.uuid, prop: "door", use: "push", holder: `${c.sir.name} R`, err: null, at: palm(c.sir, "R"), o, grip: d.handle, arm: true } : { id: o.uuid, prop: "door", use: "down", holder: "", err: null, at: d.handle, o }); },
    { rays: false, hide: ["moon shafts", "moon"], look: { sir: { at: R0, from: 0.35, to: LET, what: "the door's ring" } } }); }

// 8. SIT ON A CHEST. He sits on a sea chest (iron bands, a lid, rings at the ends), seen at three quarters (the least a seated card may be
//    turned), his coat over his lap (the knee drape), his hands resting on his thighs, and talks: his right hand comes up off his thigh,
//    turns over, palm up, and goes back to rest. He sits from the first frame: getting up and sitting down are not built yet
// (round 2: the near hand hung open in the air beside his hip, his hips sat on the box's back edge, the seat was a plain brown block,
//  the jaw jutted. Now a real chest under his thighs (its front edge near his knees), the hands laid on the thighs (the float test), the
//  gesture always moving, never held in the air)
{ const p = at(3.1, 0.05), hd = FRONT.toward(p[0], p[2], 55), fw: [number, number] = [Math.sin((hd * Math.PI) / 180), Math.cos((hd * Math.PI) / 180)];
  const W = syl(0.4, 3.6, [1.9, 2.3]);
  const sm = (k: number) => k <= 0 ? 0 : k >= 1 ? 1 : 0.5 - 0.5 * Math.cos(Math.PI * k);
  // (the gesture: up from the thigh over 0.5 s, turning out through 0.6 s, back down over 0.6 s; it never stands still in the air)
  const gest = (t: number) => sm((t - 1.0) / 0.5) * (1 - sm((t - 2.1) / 0.6)), turnOut = (t: number) => sm((t - 1.3) / 0.6);
  const LAPL: [Seg, Seg] = [[22, 6], [62, 2]], LAPR: [Seg, Seg] = [[22, 6], [62, 2]], UPR: [Seg, Seg] = [[22, 26], [80, 46]], UPR2: [Seg, Seg] = [[26, 32], [92, 54]];
  const mixA = (a: [Seg, Seg], b: [Seg, Seg], k: number): [Seg, Seg] => [[a[0][0] + (b[0][0] - a[0][0]) * k, a[0][1] + (b[0][1] - a[0][1]) * k], [a[1][0] + (b[1][0] - a[1][0]) * k, a[1][1] + (b[1][1] - a[1][1]) * k]];
  // the chest: its lid's top 0.36 high like the seat the knee drape was approved on, 0.62 across and 0.42 deep, square to the room (the
  // body check boxes things square to the room), its middle 8 cm behind his hips along the way he faces, so that his hips and thighs lie
  // on it and his knees come just past its front corner, the shins hanging free
  const SEAT = once(() => { const gS = chest(false, false, 0.62, 0.29, 0.42); gS.position.set(p[0] - fw[0] * 0.08, Y, p[2] - fw[1] * 0.08); return noShade(gS); });
  const a = shots.length * LEN;
  shots.push({ id: "sit", a, b: a + LEN, still: LEN / 2, newScene: OWN, cam: (_t, u) => FRONT.push(0.1 * u), sun: { target: inCabin([0, 0, 0]), reach: 4 }, capsTop: 1500,
    cast: (t) => { const k = gest(t), r = mixA(mixA(LAPR, UPR, k), UPR2, turnOut(t) * k); return [{ name: "sir", D: SIR_D, h: H, at: p, heading: hd, noShade: true, pose: { ...POSES.stand, ...SIT, armL: LAPL, armR: r, head: [-6 + 4 * Math.sin(t * 1.3), 3 + 2 * Math.sin(t * 0.9), 0] },
      o: { handL: "relaxed", handR: k > 0.5 ? "open" : "relaxed", face: { mouth: talk(W, t), brow: 0.4 + 0.3 * k, lid: 0.15, smile: 0.4 } } }]; },
    things: (g, _c, _t, T, cm) => { air(g, T, cm); g.add(SHUT()); g.add(SEAT()); } }); }

export const SHOT_LIBRARY: Film = { cases: true, id: "shot-library", fps: 30, seconds: shots.length * LEN, range: [20, 40], sky: "#0b1530", world: () => cabinNight(CABIN_SKY, { door: DZ }), shots, words: [], hook: { text: [], a: 0, b: 0 },
  grade: () => NIGHT_GRADE, light };
export const SHOT_LIBRARY_TYPES = shots.map((s) => ({ id: s.id, a: s.a, b: s.b }));
void THREE; void arm;
