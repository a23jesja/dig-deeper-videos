// THE QUALITY GATE, gate 2 (Jesper, 19 Nov 2026): the shot library. Every shot type a Short uses, made once as a clip of its own, three
// to five seconds in 1080 x 1920, in the cabin light v5 (the light standard), with every check at 0: once approved, a type is built the
// way its clip is built. Seven types here: stand and talk, walk across, turn and look, hold with both hands, point, react, open a door.
// The eighth, sit on a bench or stool, waits for the lap drape (the review, 19 Nov: proof control E still fails on Sir's coat tails).
// One film of seven shots, four seconds each; scripts/shot_library.sh cuts it into one clip per type. It is never delivered as a film.
import * as THREE from "three";
import type { Film, Shot, Cam, V3, Word } from "../stage/film";
import { talk, mix3 } from "../stage/film";
import { mover, wag, mt, arm, type MM } from "../stage/acting";
import { lens, once, noShade, near, aside, palm } from "../stage/staging";
import { reach, jointsOf, carryBy, AUDIT, type Stand } from "../stage/grips";
import { CABIN, inCabin, cabinNight, cabinDoor } from "../world/cabin";
import { openBook } from "../world/props";
import { mesh, box } from "../world/kit";
import { SIR_D } from "../looks";
import { reachArm } from "../world/people";
import { GESTURES, upper } from "../stage/gestures";
import type { Pose } from "../rig";
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
const add = (id: string, m: MM, cam: (t: number, u: number) => Cam, things?: Shot["things"], o: { talk?: Word[]; rays?: boolean } = {}) => { const a = shots.length * LEN;
  shots.push({ id, a, b: a + LEN, still: LEN / 2, newScene: OWN, cam, sun: { target: inCabin([0, 0, 0]), reach: 4 }, capsTop: 1500,
    cast: (t, T) => [{ ...on("sir", SIR_D, m, t, Y, o.talk ? { talk: talk(o.talk, T) } : {}), noShade: true }],
    // (the door in the right-hand wall stands shut in every clip but its own, so that the doorway is never an empty hole)
    things: (g, c, t, T, cm) => { air(g, T, cm, { rays: o.rays }); if (id !== "open-a-door") g.add(SHUT()); things?.(g, c, t, T, cm); } }); };
const SHUT = once(() => noShade(cabinDoor(DZ, 0, true).g));
const at = (d: number, l: number): V3 => { const [x, z] = FRONT.spot(d, l); return [x, Y, z]; };
const stand = (p: V3, heading: number, pose: Partial<Pose> = {}, cam = FRONT.cam): Stand => ({ D: SIR_D, at: p, heading, h: H, cam, pose });

// 1. STAND AND TALK. Turned a little from the lens, he talks with the library's explaining hands (palms up before his waist, opening
//    on the stressed words), his mouth moving with the words, a nod now and then
// (turned 40 degrees from the lens: seen from the front, the forearms held forward were drawn as straight arms out to the sides)
{ const p = at(2.9, 0), hd = FRONT.toward(p[0], p[2], 40), m = mover(SIR_D, H, p[0], p[2], hd); m.stand(9);
  const ex = (t: number) => upper(GESTURES.explain.pose("side", t));
  m.actAt(-1, { ...ex(0), head: [-8, 2, 0] }, 10, { in: 0.01, handL: "open", handR: "open", face: { brow: 0.5, lid: 0.15, smile: 0.4 } });
  for (let i = 0; i < 6; i++) m.actAt(0.35 + i * 0.6, { ...ex(0.5 + i * 0.6), head: [-8 + (i % 2) * 6, 2 + (i % 3) * 2, 0] }, 9, { in: 0.25, antic: 0, handL: "open", handR: "open", face: { brow: 0.4 + 0.3 * (i % 2), lid: 0.15, smile: 0.4 } });
  // the words he says, as times only (the clip has no sound): syllables of 0.2-0.3 s with short gaps, a breath in the middle
  const W: Word[] = []; for (let t = 0.3; t < 3.7; t += 0.31) { if (t > 1.8 && t < 2.15) continue; W.push({ w: "la", a: t, b: t + 0.22 + 0.06 * Math.sin(t * 7) }); }
  add("stand-and-talk", m, (_t, u) => FRONT.push(0.15 * u), undefined, { talk: W }); }

// 2. WALK ACROSS. He walks from left to right across the cabin in front of the table, the lens trucking along with him a little slower
//    than he walks, so that he crosses the picture and the room passes behind him
{ const p = at(3.2, -0.55), m = mover(SIR_D, H, p[0], p[2], 90); m.stand(0.35).walk(mt(m, 1.9), { step: 0.5, tau: 0.45 }).stand(9);
  m.actAt(-1, { head: [-14, 0, 0] }, 10, { in: 0.01, face: { brow: 0.3, lid: 0.2, smile: 0.3 } });
  const x0 = FRONT.cam.pos[0], LLm = m.LL;
  add("walk-across", m, (t) => { const s = m.sample(t), dx = (s.x * LLm - p[0]) * 0.6; return { pos: [x0 + dx, Y + EYE, FRONT.cam.pos[2]], look: [x0 + dx, FRONT.cam.look[1], FRONT.cam.pos[2] - 4], fov: FOV }; }); }

// 3. TURN AND LOOK. He stands facing the lens; something to his right catches him: the head goes first, then the shoulders turn after
//    it, and he looks at the stern window, still for a moment
{ const p = at(2.9, -0.1), hd = FRONT.toward(p[0], p[2], 0), m = mover(SIR_D, H, p[0], p[2], hd); m.stand(9);
  m.actAt(-1, { head: [0, 2, 0] }, 10, { in: 0.01, face: { brow: 0.2, lid: 0.2, smile: 0.2 } });
  // (the head first, then the shoulders after it: he turns from the hips up and his feet stay where they are. Turned on his feet, the
  //  card's drawing slid a planted foot 2-5 px a frame as the body came round, the body check's slide test)
  m.actAt(0.7, { head: [-40, 0, 0] }, 9, { in: 0.25, antic: 0.1, face: { brow: 0.9, lid: 0, wide: 0.6, mouth: 0.1 } });
  m.actAt(1.0, { twist: -30, head: [-40, -4, 0], armL: [[-6, 10], [4, 6]], armR: [[8, 10], [14, 6]] }, 9, { in: 0.6, antic: 0, over: 1.05, face: { brow: 0.9, lid: 0.05, wide: 0.4 } });
  add("turn-and-look", m, (_t, u) => FRONT.push(0.1 * u)); }

// 4. HOLD WITH BOTH HANDS. He holds an open book before his belly by its outer edges and reads, his head moving a little along the lines
//    (held before his chest, the book's top edge came up over his chin and the bowl of his pipe)
{ const p = at(2.9, 0.05), hd = FRONT.toward(p[0], p[2], 12), m = mover(SIR_D, H, p[0], p[2], hd); m.stand(9);
  const rs = stand(p, hd), rj = jointsOf(rs), rc = near(mix3(rj("pelvis"), rj("neck"), 0.45), FRONT.cam, 0.3), rw = rightWay(rs);
  m.actAt(-1, { ...reach(rs, "R", aside(rc, FRONT.cam, rw * 0.27)), ...reach(rs, "L", aside(rc, FRONT.cam, -rw * 0.27)), head: [0, 14, 0] }, 10, { in: 0.01, handL: "grip", handR: "grip", face: { brow: 0.6, lid: 0.35, mouth: 0.1 } });
  wag(m, 0, LEN, P({ head: [-5, 14, 0] }), P({ head: [5, 12, 0] }), 1.1, { handL: "grip", handR: "grip", face: { brow: 0.6, lid: 0.35, mouth: 0.1 } });
  const BOOK = once(() => noShade(openBook()));
  add("hold-with-both-hands", m, (_t, u) => FRONT.push(0.12 * u), (g, c, _t, _T, cam) => { carryBy(g, BOOK(), c.sir, "L", c.sir, "R", cam); }); }

// 5. POINT. Turned toward the stern windows, he raises his arm and points at the window on his right, the library's point (the elbow
//    a little bent, the index finger out), his eyes on it
// (he stands in the right of the picture and points across it to the left: standing in the middle, his arm went out through the edge)
{ const p = at(3.0, 0.38), hd = FRONT.toward(p[0], p[2], 30), m = mover(SIR_D, H, p[0], p[2], hd); m.stand(9);
  const pt = GESTURES.point;
  m.actAt(-1, { head: [-20, 0, 0] }, 10, { in: 0.01, handL: "relaxed", handR: "relaxed", face: { brow: 0.4, lid: 0.15 } });
  m.actAt(0.7, upper(pt.pose("side", 0)), 9, { in: 0.4, antic: 0.1, over: 1.1, handL: "relaxed", handR: "point", face: { brow: 0.8, lid: 0.05, mouth: 0.25 } });
  add("point", m, (_t, u) => FRONT.push(0.1 * u)); }

// 6. REACT. He stands at ease; at a crash off to the side his hands fly to his head (the library's "oh no"), the eyes wide, the body
//    jolting back a little
{ const p = at(2.9, 0), hd = FRONT.toward(p[0], p[2], 10), m = mover(SIR_D, H, p[0], p[2], hd); m.stand(9);
  m.actAt(-1, { head: [0, 2, 0] }, 10, { in: 0.01, handL: "relaxed", handR: "relaxed", face: { brow: 0.2, lid: 0.25, smile: 0.3 } });
  m.actAt(1.1, { ...upper(GESTURES.head.pose("side", 0)), lean: -4 }, 9, { in: 0.18, antic: 0.15, over: 1.25, handL: "open", handR: "open", face: { brow: 1, lid: 0, wide: 1, mouth: 0.55, smile: -0.5 } });
  wag(m, 1.4, 2.3, P({ roll: 1.5 }), P({ roll: -1.5 }), 0.16);
  add("react", m, (_t, u) => FRONT.push(0.1 * u)); }

// 7. OPEN A DOOR. The lens inside the cabin looks across it at the door in the right-hand wall, hinged at its back edge. He stands
//    beside the door, turned toward us, his right hand on its ring, pulls it open toward him (38 degrees, into the room), holds it there
//    and looks through into the dark passage. His hand stays on the ring all the way. (Seen from inside the room with the door at his
//    front, he had his back to us; from the room's open front, he was in profile and the floor's front edge showed. The lens looks
//    straight at the wall: the door on the left of the picture swings toward us, he stands on its right)
{ const p: V3 = inCabin([1.66, 0, 1.12]), hd = -120, m = mover(SIR_D, H, p[0], p[2], hd); m.stand(9);
  const L0 = inCabin([-1.95, 0, 0.3]), tgt = inCabin([1.9, 0, 0.8]), V = lens(L0[0], Y + 1.3, L0[2], tgt[0] - L0[0], tgt[2] - L0[2], -6, FOV);
  // the door's angle: shut until 0.5 s, then pulled open to 38 degrees over 1.8 s, easing in and out
  const ang = (t: number) => { const k = Math.min(1, Math.max(0, (t - 0.5) / 1.8)); return 38 * (0.5 - 0.5 * Math.cos(Math.PI * k)); };
  // (the arm solved with its elbow kept low and out at his side, behind the hand: solved freely, the elbow turned over as the ring came
  //  toward him and the forearm bent the wrong way, the body check)
  const ss = stand(p, hd, {}, V.cam), grip = (t: number) => { const d = cabinDoor(DZ, ang(t), true), q = d.handle, hx = d.g.position.x - q[0], hz = d.g.position.z - q[2], n = Math.hypot(hx, hz) || 1; return [q[0] + (hx / n) * 0.06, q[1], q[2] + (hz / n) * 0.06] as V3; },      // (the fist's middle 6 cm in from the ring's centre, toward the hinge: on the ring itself the drawn hand lay beside it, on the leaf's edge side)
   sh = jointsOf(ss)("shR"), hr = (hd * Math.PI) / 180, side: [number, number] = [-Math.cos(hr), Math.sin(hr)];
  const pull = (t: number): Partial<Pose> => { const q = grip(t), e: V3 = [sh[0] + side[0] * 0.14 + (q[0] - sh[0]) * 0.35, sh[1] - 0.24, sh[2] + side[1] * 0.14 + (q[2] - sh[2]) * 0.35];
    return { armR: reachArm(SIR_D, {} as Pose, {}, { at: p, heading: hd, h: H }, V.cam.pos, "R", q, 0.5, e) }; };
  for (let t = -1; t <= LEN; t += 0.1) { const q = Math.max(0, t); m.actAt(t < 0 ? -1 : t, { ...pull(q), head: [q > 2.4 ? -30 : -10, q > 2.4 ? -2 : 4, 0] }, t < 0 ? 10 : 9, { in: t < 0 ? 0.01 : 0.1, antic: 0, handR: "grip", handL: "relaxed", face: { brow: q > 2.4 ? 0.8 : 0.3, lid: 0.15, wide: q > 2.4 ? 0.4 : 0 } }); }
  const DOOR_O = once(() => noShade(cabinDoor(DZ, 0, true).g));
  // (seen across the room, the cabin's open front showed the night beyond it at the picture's right edge: here a planked bulkhead closes it)
  const FRONT_WALL = once(() => { const w = mesh(box(CABIN.w + 0.24, CABIN.h, 0.12), "#6a4428", { at: inCabin([0, CABIN.h / 2, CABIN.d / 2 + 0.06]) }); return w; });
  add("open-a-door", m, (_t, u) => V.push(0.08 * u), (g, c, t) => { g.add(FRONT_WALL()); const d = cabinDoor(DZ, ang(t), true), o = DOOR_O(); o.position.copy(d.g.position); o.rotation.copy(d.g.rotation); o.children[0].scale.copy(d.g.children[0].scale); g.add(o);
    if (AUDIT.on) AUDIT.rows.push({ id: o.uuid, prop: "door", use: "pull", holder: `${c.sir.name} R`, err: null, at: palm(c.sir, "R"), o }); }); }

export const SHOT_LIBRARY: Film = { id: "shot-library", fps: 30, seconds: shots.length * LEN, range: [20, 40], sky: "#0b1530", world: () => cabinNight(CABIN_SKY, { door: DZ }), shots, words: [], hook: { text: [], a: 0, b: 0 },
  grade: () => NIGHT_GRADE, light };
export const SHOT_LIBRARY_TYPES = shots.map((s) => ({ id: s.id, a: s.a, b: s.b }));
void THREE; void arm;
