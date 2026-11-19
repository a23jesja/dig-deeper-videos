// THE QUALITY GATE, gate 2 (Jesper, 19 Nov 2026): the shot library. Every shot type a Short uses, made once as a clip of its own, three
// to five seconds in 1080 x 1920, in the cabin light v5 (the light standard), with every check at 0: once approved, a type is built the
// way its clip is built. Eight types: stand and talk, walk across, turn and look, hold with both hands, point, react, open a door, sit.
// One film of eight shots, four seconds each; scripts/shot_library.sh cuts it into one clip per type. It is never delivered as a film.
import * as THREE from "three";
import type { Film, Shot, Cam, V3, Word } from "../stage/film";
import { talk, mix3 } from "../stage/film";
import { mover, wag, mt, arm, type MM } from "../stage/acting";
import { lens, once, noShade, near, aside, palm } from "../stage/staging";
import { reach, jointsOf, carryBy, AUDIT, type Stand } from "../stage/grips";
import { CABIN, inCabin, cabinNight, cabinDoor } from "../world/cabin";
import { openBook, bottle } from "../world/props";
import { mesh, box } from "../world/kit";
import { SIR_D } from "../looks";
import { reachArm, pointArm } from "../world/people";
import { GESTURES, upper } from "../stage/gestures";
import { POSES, type Pose, type Seg } from "../rig";
import { SIT } from "./gripSheet";
import { on } from "./gladiatorsHooks";
import { cabinV5, CABIN_SKY, NIGHT_GRADE } from "./cabinTest";
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
const add = (id: string, m: MM, cam: (t: number, u: number) => Cam, things?: Shot["things"], o: { talk?: Word[]; rays?: boolean; look?: Shot["look"] } = {}) => { const a = shots.length * LEN;
  shots.push({ id, a, b: a + LEN, still: LEN / 2, newScene: OWN, look: o.look, cam, sun: { target: inCabin([0, 0, 0]), reach: 4 }, capsTop: 1500,
    // (the words' times are the clip's own: read against the film's time, every clip after the first kept its mouth shut)
    cast: (t) => [{ ...on("sir", SIR_D, m, t, Y, o.talk ? { talk: talk(o.talk, t) } : {}), noShade: true }],
    // (the door in the right-hand wall stands shut in every clip but its own, so that the doorway is never an empty hole)
    things: (g, c, t, T, cm) => { air(g, T, cm, { rays: o.rays }); if (id !== "open-a-door") g.add(SHUT()); things?.(g, c, t, T, cm); } }); };
const SHUT = once(() => noShade(cabinDoor(DZ, 0, true).g));
const at = (d: number, l: number): V3 => { const [x, z] = FRONT.spot(d, l); return [x, Y, z]; };
const stand = (p: V3, heading: number, pose: Partial<Pose> = {}, cam = FRONT.cam): Stand => ({ D: SIR_D, at: p, heading, h: H, cam, pose });

// 1. STAND AND TALK. Turned 40 degrees from the lens, he talks: his hands go from his sides into the library's explaining hands (palms up
//    before his waist), open out on a stressed word, sink back, one hand comes up alone and goes down again; a nod now and then, his mouth
//    with the words (opening on the side away from his pipe)
// (turned 40 degrees: seen from the front, the forearms held forward were drawn as straight arms out to the sides. The review of round 1:
//  one arm held almost straight out at chest height for four seconds, stiff: now the hands never stay put longer than a second)
{ const p = at(2.9, 0), hd = FRONT.toward(p[0], p[2], 40), m = mover(SIR_D, H, p[0], p[2], hd); m.stand(9);
  // (his hands open out beside him, palms up, the elbows bent and out: the library's explaining hands, forward before his waist, put his
  //  near hand on his belly as the picture showed it, three quarters on)
  const ex = (t: number): Partial<Pose> => { const o = 40 + 10 * Math.sin(t * 3.2); return { armL: [[12, 30], [58, o]], armR: [[12, 30], [58, o]] }; }; void GESTURES; const REST2: Partial<Pose> = { armL: [[4, 15], [14, 11]], armR: [[4, 15], [14, 11]] };      // (a little out from his sides: hanging close, the far hand lay over his coat)
  const O = { handL: "open" as const, handR: "open" as const }, R = { handL: "relaxed" as const, handR: "relaxed" as const };
  m.actAt(-1, { ...REST2, head: [-6, 2, 0] }, 10, { in: 0.01, ...R, face: { brow: 0.3, lid: 0.15, smile: 0.4 } });
  m.actAt(0.35, { ...ex(0), head: [-10, 4, 0] }, 9, { in: 0.45, antic: 0, ...O, face: { brow: 0.6, lid: 0.12, smile: 0.4 } });
  m.actAt(1.05, { ...ex(0.5), head: [-4, 1, 0] }, 9, { in: 0.35, antic: 0, ...O, face: { brow: 0.9, lid: 0.08, smile: 0.5 } });
  m.actAt(1.6, { ...REST2, head: [-8, 5, 0] }, 9, { in: 0.45, antic: 0, ...R, face: { brow: 0.4, lid: 0.15, smile: 0.4 } });
  m.actAt(2.3, { armR: [[12, 34], [60, 52]], armL: [[4, 15], [14, 11]], head: [-12, 2, 0] }, 9, { in: 0.4, antic: 0, handL: "relaxed", handR: "open", face: { brow: 0.7, lid: 0.1, smile: 0.5 } });
  m.actAt(3.2, { ...REST2, head: [-6, 4, 0] }, 9, { in: 0.5, antic: 0, ...R, face: { brow: 0.4, lid: 0.15, smile: 0.5 } });
  // the words he says, as times only (the clip has no sound): syllables of 0.2-0.3 s with short gaps, a breath in the middle
  const W: Word[] = []; for (let t = 0.3; t < 3.7; t += 0.31) { if (t > 1.8 && t < 2.15) continue; W.push({ w: "la", a: t, b: t + 0.22 + 0.06 * Math.sin(t * 7) }); }
  add("stand-and-talk", m, (_t, u) => FRONT.push(0.15 * u), undefined, { talk: W }); }

// 2. WALK ACROSS. He walks in from the left edge and out through the right, across the cabin before the table, at an easy pace, his arms
//    swinging; the lens stands still
//    (the review of round 1: he stood cut by the left edge for half a second, walked hunched with his fists at his hips, and ended with his
//    nose and pipe against the wall in the corner, standing like a post. He walks the whole way through the picture and out of it; no act
//    is laid over the walk, so its own arm swing and loose hands are his)
{ const p = at(3.1, -1.25), m = mover(SIR_D, H, p[0], p[2], 90); m.walk(mt(m, 2.7), { step: 0.42, tau: 0.5 }).stand(9);
  add("walk-across", m, (_t, u) => FRONT.push(0.05 * u)); }

// 3. TURN AND LOOK. He stands facing the lens, beside the stool with a bottle on it, a step and a half to his right. Something there
//    catches him: his head goes first, then his body turns after it on his feet, and he looks at the bottle, still for a moment
//    (the review of round 1: the head turned in a jump and he looked into the lens, at nothing that could be seen. The target is in the
//    picture (Shot.look), the head turns 40 degrees over half a second, the body follows over 1.3 s)
const STOOL_AT: V3 = inCabin([CABIN.stool[0], 0, CABIN.stool[2]]), BOTTLE_AT: V3 = [STOOL_AT[0], Y + 0.62, STOOL_AT[2]];
const BOTTLE = once(() => noShade(bottle(0.3, "#3f8a5c")));
const onStool = (g: THREE.Group) => { const b = BOTTLE(); b.position.set(STOOL_AT[0], Y + 0.47, STOOL_AT[2]); g.add(b); };
{ const p: V3 = inCabin([0.72, 0, CABIN.stool[2]]), hd = FRONT.toward(p[0], p[2], 0), m = mover(SIR_D, H, p[0], p[2], hd); m.stand(1.0).turn(-46, 1.3).stand(9);
  m.actAt(-1, { head: [0, 2, 0] }, 10, { in: 0.01, handL: "relaxed", handR: "relaxed", face: { brow: 0.2, lid: 0.2, smile: 0.2 } });
  m.actAt(0.6, { head: [-40, 0, 0] }, 9, { in: 0.5, antic: 0, handL: "relaxed", handR: "relaxed", face: { brow: 0.9, lid: 0, wide: 0.5 } });
  m.actAt(2.4, { head: [-38, 3, 0] }, 9, { in: 0.4, antic: 0, handL: "relaxed", handR: "relaxed", face: { brow: 0.7, lid: 0.05, wide: 0.3 } });
  add("turn-and-look", m, (_t, u) => FRONT.push(0.2 + 0.1 * u), (g) => onStool(g), { look: { sir: { at: BOTTLE_AT, from: 2.3, what: "the bottle on the stool" } } }); }

// 4. HOLD WITH BOTH HANDS. He shows us an open book, held by its outer edges in both hands, its pages toward us and his eyes on us: he
//    lifts it a little toward us, raises his brows and nods, pleased with it.
//    (the review of round 1: reading a book whose pages faced us, he could not read it; held low in front of him, below the lantern's
//    light, his hands were lit by the cool ambient light alone and read as grey fists. He stands further back, under the lantern, which
//    now lights his hands from in front; the lens comes in after him)
{ const p = at(3.75, 0.05), hd = FRONT.toward(p[0], p[2], 10), m = mover(SIR_D, H, p[0], p[2], hd); m.stand(9);
  const rs = stand(p, hd), rj = jointsOf(rs), rw = rightWay(rs), hold = (k: number, fwd: number): Partial<Pose> => { const rc = near(mix3(rj("pelvis"), rj("neck"), k), FRONT.cam, fwd);
    return { ...reach(rs, "R", aside(rc, FRONT.cam, rw * 0.27)), ...reach(rs, "L", aside(rc, FRONT.cam, -rw * 0.27)) }; };
  const F0 = { handL: "grip" as const, handR: "grip" as const };
  m.actAt(-1, { ...hold(0.52, 0.36), head: [0, 4, 0] }, 10, { in: 0.01, ...F0, face: { brow: 0.4, lid: 0.15, smile: 0.5 } });
  m.actAt(0.5, { ...hold(0.55, 0.38), head: [-3, 2, 0] }, 9, { in: 0.6, antic: 0, ...F0, face: { brow: 0.9, lid: 0.05, smile: 0.7, wide: 0.3 } });
  m.actAt(1.9, { head: [3, 7, 0] }, 9, { in: 0.35, antic: 0, ...F0, face: { brow: 0.7, lid: 0.1, smile: 0.8 } });
  m.actAt(2.4, { head: [2, 1, 0] }, 9, { in: 0.35, antic: 0, ...F0, face: { brow: 0.8, lid: 0.1, smile: 0.8 } });
  m.actAt(3.1, { head: [-2, 5, 0] }, 9, { in: 0.4, antic: 0, ...F0, face: { brow: 0.6, lid: 0.12, smile: 0.7 } });
  const BOOK = once(() => noShade(openBook()));
  add("hold-with-both-hands", m, (_t, u) => FRONT.push(0.75 + 0.1 * u), (g, c, _t, _T, cam) => { carryBy(g, BOOK(), c.sir, "L", c.sir, "R", cam); }); }

// 5. POINT. Beside the stool with the bottle, nearly in profile, he turns his head to it, draws his near arm back a little and points
//    at it, the elbow a little bent and the index finger out, the arm moving a little as he holds it; his eyes on the bottle
//    (the review of round 1: the arm flew from hanging to level in four frames with no wind-up, stayed locked for three seconds, pointed
//    at a bare wall while he looked into the lens, and seemed to grow out of his lapel: his far arm. Now the near arm, a wind-up, half a
//    second up, and the bottle in the picture)
{ const p: V3 = inCabin([0.72, 0, CABIN.stool[2]]), hd = -76, m = mover(SIR_D, H, p[0], p[2], hd); m.stand(9);
  // (the arm aimed at the bottle: the hand put 0.5 m from his shoulder on the line to it, the elbow then a little bent; the library's point
  //  held level, it pointed at the table)
  const ps = stand(p, hd), shL = jointsOf(ps)("shL"), dv = [BOTTLE_AT[0] - shL[0], BOTTLE_AT[1] - shL[1], BOTTLE_AT[2] - shL[2]], dn = Math.hypot(dv[0], dv[1], dv[2]);
  // (the whole arm laid along the line from his shoulder to the bottle as the picture shows it, the elbow a little bent: pointArm. Solved for
  //  the hand alone, the arm stopped level at his chest)
  const C0 = FRONT.push(0.3), fv = new THREE.Vector3(C0.look[0] - C0.pos[0], C0.look[1] - C0.pos[1], C0.look[2] - C0.pos[2]).normalize(), rv = new THREE.Vector3().crossVectors(fv, new THREE.Vector3(0, 1, 0)).normalize(), uv = new THREE.Vector3().crossVectors(rv, fv);
  const dvec = new THREE.Vector3(dv[0], dv[1], dv[2]), pdir: [number, number] = [dvec.dot(rv), dvec.dot(uv)]; void dn;
  const AIM = pointArm(SIR_D, { ...POSES.stand } as Pose, {}, { at: p, heading: hd, h: H }, C0.pos, "L", pdir, 0.25) as [Seg, Seg];
  const PT: Partial<Pose> = { armL: AIM, armR: [[0, 10], [10, 4]] }, ptR = { armR: AIM } as Partial<Pose>;
  m.actAt(-1, { head: [-10, 2, 0] }, 10, { in: 0.01, handL: "relaxed", handR: "relaxed", face: { brow: 0.3, lid: 0.15 } });
  m.actAt(0.35, { head: [-14, 0, 0] }, 9, { in: 0.35, antic: 0, handL: "relaxed", handR: "relaxed", face: { brow: 0.8, lid: 0.05, wide: 0.3 } });
  m.actAt(0.8, { armL: [[-14, 12], [18, 8]] }, 9, { in: 0.25, antic: 0, handL: "relaxed", handR: "relaxed", face: { brow: 0.8, lid: 0.05, wide: 0.3 } });
  m.actAt(1.05, { ...PT, head: [-14, -2, 0] }, 9, { in: 0.65, antic: 0, over: 1.05, handL: "point", handR: "relaxed", face: { brow: 0.9, lid: 0.05, mouth: 0.25 } });
  wag(m, 1.9, 2.1, P({ armL: [[ptR.armR![0][0] + 3, ptR.armR![0][1]], [ptR.armR![1][0] + 4, ptR.armR![1][1]]] }), P({ armL: [[ptR.armR![0][0] - 3, ptR.armR![0][1]], [ptR.armR![1][0] - 2, ptR.armR![1][1]]] }), 0.9, { handL: "point", handR: "relaxed" });
  add("point", m, (_t, u) => FRONT.push(0.2 + 0.1 * u), (g) => onStool(g), { look: { sir: { at: BOTTLE_AT, from: 0.8, what: "the bottle he points at" } } }); }

// 6. REACT. He stands at ease; at a crash off to the side he jolts back, both hands up before his chest with the palms out, the eyes
//    wide and the mouth open, and holds it, breathing
//    (the review of round 1: a pose that stood for one frame on the way up, the whole figure shaking every other frame for two seconds,
//    and the pipe's bowl over his palm with his hands at his head. Now the hands come up over half a second with no wind-up, nothing shakes, and
//    they stay low, under the pipe)
// (turned 40 degrees, the hands up close by his shoulders: seen from the front, hands held up and out read as straight arms out to the sides)
{ const p = at(2.9, 0), hd = FRONT.toward(p[0], p[2], 40), m = mover(SIR_D, H, p[0], p[2], hd); m.stand(9);
  const UP: Partial<Pose> = { armL: [[26, 12], [128, 18]], armR: [[26, 12], [128, 18]], lean: -6, head: [0, -6, 0] };
  m.actAt(-1, { head: [0, 2, 0] }, 10, { in: 0.01, handL: "relaxed", handR: "relaxed", face: { brow: 0.2, lid: 0.25, smile: 0.3 } });
  m.actAt(1.1, UP, 9, { in: 0.5, antic: 0, over: 1.05, handL: "open", handR: "open", face: { brow: 1, lid: 0, wide: 1, mouth: 0.5, smile: -0.5 } });
  m.actAt(2.4, { ...UP, armL: [[22, 12], [118, 16]], armR: [[22, 12], [118, 16]], lean: -4, head: [-4, -4, 0] }, 9, { in: 0.8, antic: 0, handL: "open", handR: "open", face: { brow: 0.9, lid: 0.05, wide: 0.8, mouth: 0.3, smile: -0.4 } });
  add("react", m, (_t, u) => FRONT.push(0.1 * u)); }

// 7. OPEN A DOOR. The lens inside the cabin looks across it at the door in the right-hand wall, hinged at its back edge. He stands beside
//    the door, turned toward us, his near hand on its ring, and pushes it open away from him into the dark passage; at a fifth of the way
//    he lets it go and it swings on, wide open, and he turns his head after it. His hand is on the ring for as long as he pushes.
//    (turned toward us he cannot look into the passage behind him: a look there needed a head turned 124 degrees)
//    (the review of round 1: pulled toward him, the leaf cut through his forearm, his hand was never on the ring, the ring popped up over
//    his sleeve, and the door opened only a crack. A door pulled toward someone beside it must pass his arm: pushed away, it never comes
//    near him. The passage behind is now a hollow of dark planks, cabin.ts. The hand is set on the ring frame by frame)
{ const p: V3 = inCabin([1.66, 0, 1.12]), hd = -120, m = mover(SIR_D, H, p[0], p[2], hd); m.stand(9);
  const L0 = inCabin([-1.95, 0, 0.12]), tgt = inCabin([1.9, 0, 0.75]), V = lens(L0[0], Y + 1.3, L0[2], tgt[0] - L0[0], tgt[2] - L0[2], -6, FOV);
  // the door's angle (outward, negative): pushed to 20 degrees by 1.3 s, then swinging on by itself to 95, slowing
  const LET = 1.3, ang = (t: number) => { if (t < 0.3) return 0; if (t < LET) { const k = (t - 0.3) / (LET - 0.3); return -20 * (0.5 - 0.5 * Math.cos(Math.PI * k)); } return -(20 + 75 * (1 - Math.exp(-(t - LET) / 0.45))); };
  const ss = stand(p, hd, {}, V.cam), ring = (t: number) => cabinDoor(DZ, ang(t), true).handle, sh = jointsOf(ss)("shR"), hr = (hd * Math.PI) / 180, side: [number, number] = [-Math.cos(hr), Math.sin(hr)];
  const push = (t: number): Partial<Pose> => { const q = ring(t), e: V3 = [sh[0] + side[0] * 0.12 + (q[0] - sh[0]) * 0.4, sh[1] - 0.22, sh[2] + side[1] * 0.12 + (q[2] - sh[2]) * 0.4];
    return { armR: reachArm(SIR_D, {} as Pose, {}, { at: p, heading: hd, h: H }, V.cam.pos, "R", q, 0.5, e) }; };
  // (the arm solved at four moments of the push and blended between them: solved on every frame, the solution's elbow flickered from
  //  one frame to the next, the motion check's pose that stands for one frame)
  const KEYS = [0, 0.3, 0.63, 0.96, LET - 0.06];
  KEYS.forEach((q, i) => m.actAt(i === 0 ? -1 : q, { ...push(q), head: [-10, 4, 0] }, i === 0 ? 10 : 9, { in: i === 0 ? 0.01 : q - KEYS[i - 1], antic: 0, handR: "grip", handL: "relaxed", face: { brow: 0.3, lid: 0.15 } }));
  // let go: the hand back to his side, and he turns his head and looks into the passage
  m.actAt(LET, { armR: [[4, 10], [14, 6]], head: [-40, 2, 0] }, 9, { in: 0.7, antic: 0, handL: "relaxed", handR: "relaxed", face: { brow: 0.8, lid: 0.05, wide: 0.4 } });
  const DOOR_O = once(() => noShade(cabinDoor(DZ, 0, true).g));
  // (seen across the room, the cabin's open front showed the night beyond it at the picture's right edge: here a planked bulkhead closes it)
  const FRONT_WALL = once(() => mesh(box(CABIN.w + 0.24, CABIN.h, 0.12), "#6a4428", { at: inCabin([0, CABIN.h / 2, CABIN.d / 2 + 0.06]) }));
  add("open-a-door", m, (_t, u) => V.push(0.08 * u), (g, c, t) => { g.add(FRONT_WALL()); const d = cabinDoor(DZ, ang(t), true), o = DOOR_O(); o.position.copy(d.g.position); o.rotation.copy(d.g.rotation); o.children[0].scale.copy(d.g.children[0].scale); g.add(o);
    if (AUDIT.on) AUDIT.rows.push(t < LET ? { id: o.uuid, prop: "door", use: "push", holder: `${c.sir.name} R`, err: null, at: palm(c.sir, "R"), o, grip: d.handle, arm: true } : { id: o.uuid, prop: "door", use: "down", holder: "", err: null, at: d.handle, o }); },
    { rays: false }); }

// 8. SIT ON A STOOL. He sits on a low wooden seat, seen at three quarters (the least a seated card may be turned), his coat over his lap
//    (the knee drape), and talks: one hand comes up off his thigh and goes back. He sits from the first frame: getting up and sitting down
//    are not built yet
{ const p = at(3.1, 0.05), hd = FRONT.toward(p[0], p[2], 55), fw: [number, number] = [Math.sin((hd * Math.PI) / 180), Math.cos((hd * Math.PI) / 180)];
  const W: Word[] = []; for (let t = 0.4; t < 3.6; t += 0.33) { if (t > 1.9 && t < 2.3) continue; W.push({ w: "la", a: t, b: t + 0.22 }); }
  const sm = (k: number) => k <= 0 ? 0 : k >= 1 ? 1 : 0.5 - 0.5 * Math.cos(Math.PI * k), gest = (t: number) => sm((t - 1.0) / 0.5) * (1 - sm((t - 2.6) / 0.5));
  const LAP: [Seg, Seg] = [[18, 8], [50, 4]], UPR: [Seg, Seg] = [[22, 30], [74, 58]];      // (out to the side, palm up: up before him, the hand came onto his chest)
  const mixA = (a: [Seg, Seg], b: [Seg, Seg], k: number): [Seg, Seg] => [[a[0][0] + (b[0][0] - a[0][0]) * k, a[0][1] + (b[0][1] - a[0][1]) * k], [a[1][0] + (b[1][0] - a[1][0]) * k, a[1][1] + (b[1][1] - a[1][1]) * k]];
  const SEAT = once(() => { const gS = new THREE.Group(), hi = 0.36; gS.add(mesh(box(0.9, hi, 0.42), "#6a4428", { at: [0, hi / 2, 0] })); gS.position.set(p[0] - fw[0] * 0.1, Y, p[2] - fw[1] * 0.1); gS.rotation.y = (hd * Math.PI) / 180; return gS; });
  const a = shots.length * LEN;
  shots.push({ id: "sit", a, b: a + LEN, still: LEN / 2, newScene: OWN, cam: (_t, u) => FRONT.push(0.1 * u), sun: { target: inCabin([0, 0, 0]), reach: 4 }, capsTop: 1500,
    cast: (t, T) => { const k = gest(t); return [{ name: "sir", D: SIR_D, h: H, at: p, heading: hd, noShade: true, pose: { ...POSES.stand, ...SIT, armL: LAP, armR: mixA(LAP, UPR, k), head: [-6 + 4 * Math.sin(t * 1.3), 3 + 2 * Math.sin(t * 0.9), 0] },
      o: { handL: "relaxed", handR: k > 0.4 ? "open" : "relaxed", face: { mouth: talk(W, t), brow: 0.4 + 0.3 * k, lid: 0.15, smile: 0.4 } } }]; },
    things: (g, _c, _t, T, cm) => { air(g, T, cm); g.add(SHUT()); g.add(SEAT()); } }); }

export const SHOT_LIBRARY: Film = { id: "shot-library", fps: 30, seconds: shots.length * LEN, range: [20, 40], sky: "#0b1530", world: () => cabinNight(CABIN_SKY, { door: DZ }), shots, words: [], hook: { text: [], a: 0, b: 0 },
  grade: () => NIGHT_GRADE, light };
export const SHOT_LIBRARY_TYPES = shots.map((s) => ({ id: s.id, a: s.a, b: s.b }));
void THREE; void arm;
