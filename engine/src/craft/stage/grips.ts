// Held things. Every prop has a grip and a direction, and a figure holds it in a named way (a "use"): the pose of the arm that
// holds it, how the thing lies in the hand, and where its working end may point. `wield` puts the thing in the hand for a use,
// lays the fingers over it, and notes it for the script check (`auditGrips`, run by scripts/film_info.mjs <film> grips), which
// reads every frame of a film: the grip must lie in the hand, and the working end must point within what the use allows.
// A prop is modelled with its grip at the origin, its working end along +x and its top along +y (world/props.ts).
import * as THREE from "three";
import type { Film, Cam, V3, Staged } from "./film";
import { mix3 } from "./film";
import { grip, palm, fingers, eyeOf, span, near, aside, UNSEEN } from "./staging";
import { figureCard, reachArm, pointArm, bareJoints, CROWD_LOG } from "../world/people";
import { rod, mesh, box, group } from "../world/kit";
import type { Design } from "../designs/common";
import type { Pose } from "../rig";

type Seg = [number, number];
type Side = "L" | "R";
const A = (a: number, b: number, c: number, d: number): [Seg, Seg] => [[a, b], [c, d]];
/** what a use is checked against: `dir` = where the working end points in the picture, seen from the holder's side (x = away from
 *  his body, y = up). Returns what is wrong, or null */
type Ok = (dir: [number, number]) => string | null;
export type Use = {
  /** the arm that holds it: [upper arm, forearm] as in acting.ts `arm` */ arm: [Seg, Seg];
  /** where the working end points: `turn` = degrees from the forearm, upward; or `level` = degrees from level, away from the body
   *  (90 = straight up, -60 = down and forward) whatever the arm does */ turn?: number; level?: number;
  ok: Ok;
};
export type Prop = { name: string; uses: Record<string, Use>; /** a hilt with a guard and (a sabre) a knuckle bow: where the guard is along x, the middle of the bow, and how far the blade may turn off the forearm (degrees) */ hilt?: { guard: number; bow?: [number, number]; turn: number; /** where the pommel is along x: it shows beyond the fist, and the bow is fixed to it */ pommel: number } };
const dot = (a: [number, number], b: [number, number]) => a[0] * b[0] + a[1] * b[1];
const ang = (d: [number, number]) => (Math.atan2(d[1], d[0]) * 180) / Math.PI;
const within = (lo: number, hi: number, what: string): Ok => (d) => (ang(d) >= lo && ang(d) <= hi ? null : `${what} (it points ${ang(d).toFixed(0)} degrees from level, allowed ${lo} to ${hi})`);
/** the flintlock pistol (props.ts pistolHeld): the butt in the hand; aimed, the barrel lies along the forearm and points away from
 *  the holder; lowered, it points down and forward */
export const PISTOL: Prop = { name: "pistol", uses: {
  aim: { arm: A(84, 26, 92, 20), turn: 0, ok: within(-35, 35, "an aimed pistol points away from the holder along his arm") },
  /** held up and out along the arm (shaken at someone, kicked up by its shot) */
  up: { arm: A(122, 46, 154, 40), turn: 0, ok: within(-35, 95, "a pistol held up points away from the holder along his arm") },
  lowered: { arm: A(12, 12, 26, 6), level: -62, ok: within(-85, -35, "a lowered pistol points down and forward") },
} };
/** the sabre (props.ts sabre): held as a person holds one, the hand right behind the guard, the fingers round the grip, the knuckle bow
 *  over the outside of the fingers; the blade carries on along the forearm, the wrist only a little bent (never folded back). So
 *  every use turns the blade from the forearm, and the arm says where the blade points */
export const SABRE: Prop = { name: "sabre", hilt: { guard: 0.06, bow: [-0.01, -0.078], turn: 45, pommel: -0.104 }, uses: {
  ready: { arm: A(66, 30, 108, 24), turn: 32, ok: within(0, 90, "a sabre at the ready has its blade up and away from the body") },
  raised: { arm: A(160, 26, 184, 10), turn: 4, ok: within(55, 120, "a raised sabre points up") },
  lowered: { arm: A(16, 12, 52, 8), turn: 10, ok: within(-100, -20, "a lowered sabre has its point down and forward, clear of his legs") },
  /** being drawn: the blade still down along the scabbard it comes out of (drawSabre) */
  draw: { arm: A(34, -24, 70, -70), level: -100, ok: within(-150, -55, "a sabre being drawn points down along its scabbard") },
  /** on the way from one use to another: the blade out to the side, away from his body (so that a swing goes round outside him) */
  swing: { arm: A(120, 40, 150, 30), level: -10, ok: within(-60, 40, "a sabre swung out from the body points out to the side") },
  /** a cut: drawn back over the shoulder, then brought down through what it cuts */
  chop: { arm: A(165, 22, 210, 8), turn: 8, ok: within(80, 200, "a sabre drawn back to cut points up and back over his shoulder") },
  struck: { arm: A(62, 16, 66, 8), turn: 10, ok: within(-70, 20, "after the cut the blade points forward and a little down") },
} };
/** the mug (props.ts mugHeld): by its ear, upright, the cup beside the hand */
export const MUG: Prop = { name: "mug", uses: {
  hold: { arm: A(36, 18, 96, 4), level: 0, ok: within(-12, 12, "a mug is held upright") },
  lowered: { arm: A(12, 14, 28, 8), level: 0, ok: within(-12, 12, "a mug is carried upright") },
  drink: { arm: A(62, 24, 150, -8), level: 48, ok: within(25, 80, "a mug that is drunk from tips toward the mouth") },
} };
/** the spyglass lowered: held at its middle, hanging from the hand a little below level (props.ts spyglass with its middle at the
 *  origin). In use it is put to the eye with `spy` */
export const SPYGLASS: Prop = { name: "spyglass", uses: {
  lowered: { arm: A(16, 12, 40, 6), level: -24, ok: within(-60, 10, "a lowered spyglass hangs from the hand at its middle") },
} };

/** the bucket (props.ts bucketHeld): by the top of its bail, hanging upright */
export const BUCKET: Prop = { name: "bucket", uses: {
  carry: { arm: A(6, 12, 12, 6), level: 0, ok: within(-8, 8, "a carried bucket hangs upright") },
  raised: { arm: A(120, 46, 134, 26), level: 0, ok: within(-8, 8, "a raised bucket hangs upright from its bail") },
} };
/** the gunner's linstock (props.ts linstock): held near its foot, the burning match at the far end */
export const LINSTOCK: Prop = { name: "linstock", uses: {
  fire: { arm: A(62, 18, 72, 10), level: -38, ok: within(-70, -10, "a linstock put to the gun points down and forward") },
  ready: { arm: A(22, 16, 74, 6), level: 80, ok: within(55, 105, "a linstock held ready stands up beside him") },
} };
/** the fiddle lowered (props.ts fiddleByNeck) and its bow (props.ts fiddleBow, the frog at the origin); played with `fiddlePlay` */
export const FIDDLE: Prop = { name: "fiddle", uses: { lowered: { arm: A(8, 12, 16, 6), level: -74, ok: within(-100, -45, "a lowered fiddle hangs from the hand by its neck") },
  /** held up by its neck, the body above the hand (shown, or about to burn away) */ up: { arm: A(64, 56, 116, 60), level: 84, ok: within(55, 115, "a fiddle held up by its neck has its body above the hand") } } };
export const BOW: Prop = { name: "bow", uses: { lowered: { arm: A(8, 12, 16, 6), level: -70, ok: within(-100, -40, "a lowered bow hangs from the hand by its frog") } } };
/** grapes (props.ts grapes): by the stalk, the bunch hanging below the hand */
export const GRAPES: Prop = { name: "grapes", uses: {
  hold: { arm: A(52, 20, 134, -8), level: 0, ok: within(-8, 8, "grapes hang from the stalk") },
  lowered: { arm: A(10, 14, 22, 8), level: 0, ok: within(-8, 8, "grapes hang from the stalk") },
} };
/** a bundle (props.ts bundleHeld): by its knot, hanging below the hand; carried on the shoulder with `onShoulder` */
export const BUNDLE: Prop = { name: "bundle", uses: { carry: { arm: A(6, 14, 12, 8), level: 0, ok: within(-8, 8, "a bundle hangs from its knot") } } };
/** the gladius (props.ts gladius): held as the sabre is, the hand right behind the small guard and the pommel showing beyond the fist,
 *  the straight blade carrying on along the forearm. It has no knuckle bow */
export const GLADIUS: Prop = { name: "gladius", hilt: { guard: 0.054, turn: 40, pommel: -0.1 }, uses: {
  ready: { arm: A(66, 30, 108, 24), turn: 18, ok: within(-10, 80, "a gladius at the ready points forward and up, at the man in front of him") },
  thrust: { arm: A(86, 22, 90, 14), turn: 0, ok: within(-30, 30, "a gladius thrust points straight ahead along the arm") },
  raised: { arm: A(160, 26, 184, 10), turn: 4, ok: within(55, 120, "a raised gladius points up") },
  lowered: { arm: A(16, 12, 52, 8), turn: 10, ok: within(-100, -20, "a lowered gladius has its point down and forward, clear of his legs") },
} };
/** the net gathered in a fist (props.ts netBunch), hanging below the hand: carried low, or swung back to throw */
export const NET: Prop = { name: "net", uses: {
  carry: { arm: A(14, 18, 40, 12), level: 0, ok: within(-8, 8, "a gathered net hangs from the fist") },
  /** wound up to throw: the arm up and back, the bunch hanging behind his head */
  swing: { arm: A(166, 34, 214, 26), level: 0, ok: within(-8, 8, "a gathered net hangs from the fist") },
} };
/** the referee's stick (props.ts refStick) held upright in one hand beside him; held across in both hands with `pole` */
/** the trident held in one hand near its middle (wield with `at`), standing up beside him; in two hands with `pole` */
export const TRIDENT: Prop = { name: "trident", uses: { ready: { arm: A(22, 16, 74, 6), level: 84, ok: within(60, 105, "a trident held ready stands up beside him, prongs up") } } };
export const STICK: Prop = { name: "stick", uses: { ready: { arm: A(22, 16, 74, 6), level: 80, ok: within(55, 105, "a stick held ready stands up beside him") } } };
// ---------------- grip sheet 5: Blackbeard getting ready, the gladiators' school and the stands ----------------
const any: Ok = () => null;
/** a ribbon pinched by its knot while it is tied round a tail of the beard (the arm is put to the beard with `reach`) */
export const RIBBON: Prop = { name: "ribbon", uses: { tie: { arm: A(40, -10, 130, -20), level: 0, ok: any } } };
/** the lit spill (props.ts spill), held out at arm's length toward what it lights */
export const SPILL: Prop = { name: "spill", uses: { light: { arm: A(84, 26, 92, 20), turn: 8, ok: within(-30, 70, "a lit spill held out points forward at what it lights") } } };
/** a piece of slow match (props.ts fuseCord): stood up at the brim of the hat as it is tucked in, or held up before the lips to blow on */
export const FUSE: Prop = { name: "fuse", uses: {
  tuck: { arm: A(150, 30, 200, 10), level: 84, ok: within(55, 115, "a fuse tucked under the hat stands up at its brim") },
  blow: { arm: A(40, 10, 150, -10), level: 74, ok: within(45, 110, "a fuse held to the lips stands up before them") } } };
/** the wooden practice sword (props.ts woodSword): held as the gladius is */
export const WOODSWORD: Prop = { name: "wooden sword", hilt: GLADIUS.hilt, uses: { ready: GLADIUS.uses.ready,
  /** in guard before his chest, the point forward and a little up, clear of his face (as the trainer puts it right) */ guard: { arm: A(46, 24, 92, 12), turn: 14, ok: within(-15, 60, "a practice sword in guard points forward before his chest") } } };
/** a bowl held from below in an open hand, upright (props.ts bowl) */
export const BOWL: Prop = { name: "bowl", uses: { hold: { arm: A(30, 10, 100, -12), level: 0, ok: within(-10, 10, "a bowl of food is held upright") },
  /** by its rim (props.ts bowlRim), just under the chin: the bowl lies inward from the fingers, toward the middle of his chest */ rim: { arm: A(40, 6, 120, -24), level: 180, ok: any } } };
/** the spoon (props.ts spoon): its bowl in the porridge, or brought to the mouth */
export const SPOON: Prop = { name: "spoon", uses: {
  dip: { arm: A(30, 12, 92, -14), level: -40, ok: within(-85, -10, "a spoon in the bowl points down into it") },
  eat: { arm: A(40, 20, 150, -10), level: 30, ok: within(0, 75, "a spoon at the mouth points into it") } } };
/** the bandage roll, held to the arm it is wound round (the arm is put there with `reach`) */
export const ROLL: Prop = { name: "bandage", uses: { wrap: { arm: A(40, 10, 90, -10), level: 0, ok: any } } };
/** a coin held up between finger and thumb (props.ts coinHeld), its face to the lens */
export const COIN: Prop = { name: "coin", uses: { show: { arm: A(64, 34, 122, 16), level: 0, ok: any } } };
/** the sponsor's cloth (props.ts mappa), raised and hanging from the fist by its corner */
export const MAPPA: Prop = { name: "cloth", uses: { wave: { arm: A(160, 30, 190, 10), level: 0, ok: within(-14, 14, "a waved cloth hangs from the fist by its corner") } } };
/** the reed pen (props.ts reedPen), its nib down on the sheet it writes on */
export const PEN: Prop = { name: "pen", uses: { write: { arm: A(40, 10, 95, -12), level: -62, ok: within(-115, -20, "a pen that writes points down at the sheet") } } };
/** a scroll held up by its upper roller (props.ts scrollHeld), the sheet hanging below the fist */
export const SCROLL: Prop = { name: "scroll", uses: { hold: { arm: A(40, 10, 100, -24), level: 0, ok: within(-8, 8, "a held scroll hangs from its upper roller") } } };
/** an olive between finger and thumb, at the mouth */
export const OLIVE: Prop = { name: "olive", uses: { eat: { arm: A(40, 10, 150, -10), level: 0, ok: any } } };
// ---------------- grip sheet 6: the animal trials (Saint-Julien's court and vineyard) ----------------
/** the villagers' complaint, a rolled parchment held at its middle (props.ts complaintRoll): carried at his side, or held out to show */
export const COMPLAINT: Prop = { name: "complaint", uses: { carry: { arm: A(10, 14, 30, 6), level: 0, ok: within(-25, 25, "a carried roll lies level in the fist") },
  show: { arm: A(84, 8, 94, 0), level: 0, ok: within(-20, 20, "a roll held out to show lies level") } } };
/** a clay jug carried by the loop handle over its mouth (props.ts jugHeld), hanging upright as a bucket does */
export const JUG: Prop = { name: "jug", uses: { carry: { arm: A(6, 12, 12, 6), level: 0, ok: within(-8, 8, "a jug carried by its handle hangs upright") } } };
/** a surveyor's measuring rod (props.ts measureRod), held at arm's length out to his side at the waist and standing upright with its
 *  foot on the ground, its top clear of his head from the front and the side (review of grip sheet 6: held close, it stood before his face) */
export const ROD: Prop = { name: "rod", uses: { staff: { arm: A(20, 52, 30, 40), level: 90, ok: within(75, 105, "a measuring rod stands upright, its foot on the ground") } } };
/** the judge's gavel (props.ts gavel), its head along +x: raised to strike, or brought down on the table */
export const GAVEL: Prop = { name: "gavel", uses: { raised: { arm: A(130, 24, 160, 10), level: 60, ok: within(25, 105, "a raised gavel's head is up") },
  strike: { arm: A(46, 16, 80, 8), level: -25, ok: within(-75, 10, "a gavel that strikes points down at the table") } } };

/** what the script check has seen in the frame it is reading: one row per thing in a hand, falling or set down */
export const AUDIT: { on: boolean; rows: { id: string; prop: string; use: string; holder: string; err: string | null; at?: V3; /** the thing itself: the script check sees that a hand named in `holder` is on it */ o?: THREE.Object3D }[] } = { on: false, rows: [] };
const pic = (cam: Cam) => { const fx = cam.look[0] - cam.pos[0], fz = cam.look[2] - cam.pos[2], n = Math.hypot(fx, fz) || 1; return (p: V3, q: V3): [number, number] => [((q[0] - p[0]) * -fz + (q[2] - p[2]) * fx) / n, q[1] - p[1]]; };
const unit = (v: [number, number]): [number, number] => { const n = Math.hypot(v[0], v[1]) || 1; return [v[0] / n, v[1] / n]; };
const chest = (a: Staged) => mix3(a.joint("pelvis"), a.joint("neck"), 0.75);
const wr = (s: Side) => (s === "L" ? "wrL" : "wrR") as "wrL", tp = (s: Side) => (s === "L" ? "tipL" : "tipR") as "tipL", el = (s: Side) => (s === "L" ? "elL" : "elR") as "elL", sh = (s: Side) => (s === "L" ? "shL" : "shR") as "shL";
/** how far a closed fist reaches from its middle in the picture: half the hand's length as seen, but never less than the fist as
 *  drawn (a hand seen end on is still a fist, not a dot) */
const fistR = (a: Staged, s: Side, cam: Cam) => Math.max(0.5 * Math.hypot(...pic(cam)(a.joint(wr(s)), a.joint(tp(s)))), 0.026 * (a.h ?? 1.8));
/** which way is away from the holder's body for a hand, in the picture: +1 = to the right, -1 = to the left. The side of his chest
 *  the hand is on; for a hand in front of his chest, the way he faces */
const outward = (a: Staged, side: Side, cam: Cam) => { const P2 = pic(cam), h = (a.heading * Math.PI) / 180, face = P2([0, 0, 0], [Math.sin(h), 0, Math.cos(h)])[0], p = palm(a, side), off = P2(chest(a), p)[0];
  // a hand raised above the shoulder of a figure seen from the side: away from his body is the way he faces (a cut is drawn back behind him)
  if (p[1] > a.joint(sh(side))[1] + 0.05 && Math.abs(face) > 0.3) return Math.sign(face);
  return off + face * 0.25 >= 0 ? 1 : -1; };
/** the pose pieces of a use for a mover's actAt: the arm that holds the thing */
export const usePose = (P: Prop, use: string, side: Side): Partial<Pose> => (side === "L" ? { armL: P.uses[use].arm } : { armR: P.uses[use].arm }) as Partial<Pose>;
/** Puts a prop in a figure's hand for one of its uses: the grip in the closed fingers, the working end where the use says, the top
 *  up, the fingers and the thumb laid over it. `o` = the prop's model (grip at the origin, working end along +x, top along +y).
 *  `blend` = [another use, 0..1] turns it part of the way toward that use (a pistol coming down, a mug going to the mouth) */
export const wield = (into: THREE.Group, o: THREE.Object3D, P: Prop, use: string, a: Staged, side: Side, cam: Cam, opt: { d?: number; blend?: [string, number]; /** the grip lies this far along the thing's own x from its origin (a spyglass held by its middle) */ at?: number;
  /** points it at this place (a lit spill at the fuse it lights), whichever way the forearm goes: the wrist takes the difference */ aim?: V3 } = {}) => {
  const P2 = pic(cam), s = outward(a, side, cam), f = unit(P2(a.joint(el(side)), a.joint(wr(side))));
  const local = (U: Use): number => (U.level !== undefined ? U.level : ang([f[0] * s, f[1]]) + (U.turn ?? 0));
  let deg = local(P.uses[use]); if (opt.aim) { const v = unit(P2(palm(a, side), opt.aim)); deg = ang([v[0] * s, v[1]]); }
  if (opt.blend) { let to = local(P.uses[opt.blend[0]]); while (to - deg > 180) to -= 360; while (to - deg < -180) to += 360; deg += (to - deg) * opt.blend[1]; }
  const r = (deg * Math.PI) / 180, mine: [number, number] = [Math.cos(r), Math.sin(r)];
  const blade = o.getObjectByName("blade"); if (blade) blade.scale.x = 1;      // a blade shortened by a draw is whole again in the hand
  grip(into, o, a, side, cam, [mine[0] * s, mine[1]], { d: opt.d, lean: s, knuckle: P.hilt ? s : undefined });
  if (opt.at) o.position.sub(new THREE.Vector3(opt.at * o.scale.x, 0, 0).applyQuaternion(o.quaternion));
  const gp: V3 = opt.at ? (new THREE.Vector3(opt.at * o.scale.x, 0, 0).applyQuaternion(o.quaternion).add(o.position).toArray() as V3) : [o.position.x, o.position.y, o.position.z];
  if (AUDIT.on) { const off = Math.hypot(...P2(palm(a, side), gp)), w = new THREE.Vector3(1, 0, 0).applyQuaternion(o.quaternion), seen = unit(P2([0, 0, 0], [w.x, w.y, w.z]));
    const between = opt.blend && opt.blend[1] > 0.02 && opt.blend[1] < 0.98, U2 = opt.blend && opt.blend[1] >= 0.98 ? P.uses[opt.blend[0]] : P.uses[use];
    const thrusting = use === "thrust" || (opt.blend?.[0] === "thrust" && opt.blend[1] > 0.5);
    const err = (off > fistR(a, side, cam) ? `the grip is ${(off * 100).toFixed(0)} cm from the hand` : between ? null : U2.ok([seen[0] * s, seen[1]]) ?? (P.hilt && U2.level === undefined ? hiltWrong(o, P.hilt, a, side, cam, s, seen) : null)) ?? (thrusting ? frontThrust(a, cam) : null);
    AUDIT.rows.push({ id: o.uuid, prop: P.name, use, holder: `${a.name} ${side}`, err, at: palm(a, side), o }); }
  return o;
};
/** how far (degrees) the way a figure's face looks is turned from the lens: the way he faces plus the turn of his head */
const offLens = (a: Staged, cam: Cam) => { const h = ((a.heading + ((a.pose as Partial<Pose>)?.head?.[0] ?? 0)) * Math.PI) / 180, cx = cam.pos[0] - a.at[0], cz = cam.pos[2] - a.at[2], n = Math.hypot(cx, cz) || 1;
  return (Math.acos(Math.max(-1, Math.min(1, (Math.sin(h) * cx + Math.cos(h) * cz) / n))) * 180) / Math.PI; };
/** a thrust seen from the front with his face to the lens: he would stab to the side while he looks at us (the same fault as a spyglass
 *  used from the front). His head turns to the man he thrusts at, or the thrust is shown from the side */
const frontThrust = (a: Staged, cam: Cam): string | null => Math.abs(facing(a.heading, cam)) < 0.35 && offLens(a, cam) < 35 ? "a thrust seen from the front with his face to the lens: turn his head and eyes to the man he thrusts at, or show the thrust from the side" : null;
/** what is wrong with a hand on a hilt, as a viewer sees it: the hand must be right behind the guard, the knuckle bow on the outside of
 *  the fingers (down and away from the body), and the blade must carry on along the forearm */
const hiltWrong = (o: THREE.Object3D, H: NonNullable<Prop["hilt"]>, a: Staged, side: Side, cam: Cam, s: number, seen: [number, number]): string | null => {
  const P2 = pic(cam), pm = palm(a, side), w = (x: number, y: number): V3 => { const q = new THREE.Vector3(x, y, 0).applyMatrix4(o.matrixWorld); return [q.x, q.y, q.z]; };
  o.updateMatrixWorld(true); const g = Math.hypot(...P2(pm, w(H.guard, 0))), r = fistR(a, side, cam), bow = H.bow ? P2(pm, w(H.bow[0], H.bow[1])) : null, f = unit(P2(a.joint(el(side)), a.joint(wr(side))));
  const turn = (Math.acos(Math.max(-1, Math.min(1, dot(f, seen)))) * 180) / Math.PI, pom = Math.hypot(...P2(pm, w(H.pommel, 0)));
  return g > r + 0.03 ? `the hand is ${(g * 100).toFixed(0)} cm from the guard (it belongs right behind it)` : bow && knuckleSide(bow, seen, s) <= 0 ? "the knuckle bow is on the palm side, not over the outside of the fingers" : turn > H.turn ? `the blade turns ${turn.toFixed(0)} degrees off the forearm (at most ${H.turn}: it carries on along the arm)` : pom < r + 0.012 ? `the pommel is inside the fist (${(pom * 100).toFixed(1)} cm from the middle of the hand, the fist reaches ${(r * 100).toFixed(1)} cm; the knuckle bow would end at the side of the fist like a loose hook)` : bladeOverLegs(o, a, cam) ?? freeHandOnBlade(o, a, side, cam);
};
/** does the other hand (the one not on the hilt) touch the blade in the picture? A free hand is kept clear of the blade */
const freeHandOnBlade = (o: THREE.Object3D, a: Staged, side: Side, cam: Cam): string | null => {
  const B = o.getObjectByName("blade") as THREE.Mesh | undefined; if (!B?.geometry) return null;
  B.geometry.computeBoundingBox(); const bb = B.geometry.boundingBox!, P2 = pic(cam), f: Side = side === "L" ? "R" : "L", hand = [palm(a, f), a.joint(tp(f))], r = fistR(a, f, cam);
  for (let i = 1; i <= 10; i++) { const q = new THREE.Vector3(bb.min.x + (bb.max.x - bb.min.x) * (i / 10), (bb.min.y + bb.max.y) / 2, 0).applyMatrix4(B.matrixWorld);
    for (const h of hand) if (Math.hypot(...P2(h, [q.x, q.y, q.z])) < r * 0.8) return "the free hand touches the blade in the picture (keep it clear of the blade)"; }
  return null;
};
/** which side of the blade the bow lies on, measured across the blade only: above 0 = the knuckle side (away from his body, and down
 *  when the blade is up; staging.ts grip lays it so) */
const knuckleSide = (bow: [number, number], seen: [number, number], s: number) => { const k: [number, number] = [s * 0.85, -0.5], kb = dot(k, seen), bb = dot(bow, seen); return dot([bow[0] - bb * seen[0], bow[1] - bb * seen[1]], [k[0] - kb * seen[0], k[1] - kb * seen[1]]); };
/** does the blade cross the outline of the legs in the picture (it would look as if it went through them)? */
const bladeOverLegs = (o: THREE.Object3D, a: Staged, cam: Cam): string | null => {
  const B = o.getObjectByName("blade") as THREE.Mesh | undefined; if (!B?.geometry) return null;
  B.geometry.computeBoundingBox(); const bb = B.geometry.boundingBox!, P2 = pic(cam), w = (a.h ?? 1.8) * 0.036, base = a.joint("pelvis");
  const leg = (s: Side): [number, number][] => (["hip", "kn", "an"] as const).map((n) => P2(base, a.joint(`${n}${s}` as "hipL")));
  const segD = (p: [number, number], A: [number, number], C: [number, number]) => { const v: [number, number] = [C[0] - A[0], C[1] - A[1]], u = Math.max(0, Math.min(1, dot([p[0] - A[0], p[1] - A[1]], v) / (dot(v, v) || 1))); return Math.hypot(p[0] - A[0] - v[0] * u, p[1] - A[1] - v[1] * u); };
  for (let i = 2; i <= 10; i++) { const q = new THREE.Vector3(bb.min.x + (bb.max.x - bb.min.x) * (i / 10), (bb.min.y + bb.max.y) / 2, 0).applyMatrix4(B.matrixWorld), p = P2(base, [q.x, q.y, q.z]);
    for (const s of ["L", "R"] as Side[]) { const L = leg(s); if (segD(p, L[0], L[1]) < w || segD(p, L[1], L[2]) < w * 0.8) return "the blade crosses his legs in the picture (it would look as if it went through them)"; } }
  return null;
};
/** A long thing (a spyglass) clamped under the arm of `side`, to free his hands: across the side of his chest at the armpit, pointing
 *  the way he faces and a little down, his upper arm down over it. It lies just behind his card, so that his body hides its middle and
 *  its two ends show in front of his chest and behind his back. `at` = where along its own x its middle is */
export const underArm = (into: THREE.Group, o: THREE.Object3D, a: Staged, side: Side, cam: Cam, opt: { at?: number; d?: number; /** +1 = its far end forward (the way he faces), -1 = back behind him (the default: it keeps clear of whoever stands in front of him) */ way?: number } = {}) => {
  const f = facing(a.heading, cam), dir = (Math.sign(f) || 1) * (opt.way ?? -1), p0 = mix3(a.joint(sh(side)), a.joint(el(side)), 0.32), m = aside(near(p0, cam, -(opt.d ?? 0.07)), cam, 0, -0.03), r = (-22 * Math.PI) / 180;
  span(into, o, m, aside(m, cam, dir * Math.cos(r), Math.sin(r)), cam, 0);
  if (opt.at) o.position.sub(new THREE.Vector3(opt.at * o.scale.x, 0, 0).applyQuaternion(o.quaternion));
  if (AUDIT.on) AUDIT.rows.push({ id: o.uuid, prop: "spyglass", use: "under arm", holder: `${a.name} ${side}`, err: Math.abs(f) < 0.2 ? "seen straight from the front a thing under the arm cannot be seen to be there" : null, at: m });
  return o;
};
/** the hands of a figure on a spyglass that points at `target`: the far hand is the one on the side he looks to */
const spyHands = (shL: V3, shR: V3, eye: V3, target: V3, cam: Cam): { near: Side; far: Side } => { const P2 = pic(cam), d = unit(P2(eye, target)); return dot(P2(eye, shL), d) > dot(P2(eye, shR), d) ? { near: "R", far: "L" } : { near: "L", far: "R" }; };
/** how far from the eye the two hands lie on the tube (metres): the near hand just clear of the face, the far hand supporting */
const SPY = { near: 0.16, far: 0.47, /** the eye end lies this far back past the middle of the eye, so that its cup covers the eye */ cup: 0.022 };
/** the eye a figure at `at` shuts when he puts a spyglass to it and looks at `target` (for his face: `shut`) */
export const spyEye = (cam: Cam, at: V3, target: V3, heading?: number): -1 | 1 => { if (heading !== undefined) { const f = facing(heading, cam); if (Math.abs(f) >= 0.35) return f > 0 ? -1 : 1; } return pic(cam)(at, target)[0] >= 0 ? 1 : -1; };
/** The spyglass in use: its small eye end on the figure's eye (the eye on the side of `target`), the wide end away from his face,
 *  the tube from his eye toward what he looks at, and his two hands closed round it (`one` = only the near hand). `o` = the
 *  spyglass model (eye end at the origin, tube along +x); `len` = its length as drawn */
export const spy = (into: THREE.Group, o: THREE.Object3D, a: Staged, cam: Cam, target: V3, opt: { one?: boolean; len?: number } = {}) => {
  const P2 = pic(cam), e0 = eyeOf(a, cam, target), H = spyHands(a.joint("shL"), a.joint("shR"), e0, target, cam), d = unit(P2(e0, target)), eye = aside(near(e0, cam, 0.07), cam, -d[0] * SPY.cup, -d[1] * SPY.cup), len = opt.len ?? 0.58;
  span(into, o, eye, aside(eye, cam, d[0], d[1]), cam, 0); fingers(into, a, opt.one ? [H.near] : [H.near, H.far], cam, 0.24);
  if (AUDIT.on) { const lie = (s: Side) => { const v = P2(e0, palm(a, s)); return { off: Math.abs(v[0] * d[1] - v[1] * d[0]), along: dot(v, d), r: fistR(a, s, cam) }; }, n1 = lie(H.near), n2 = opt.one ? null : lie(H.far);
    const err = Math.abs(facing(a.heading, cam)) < 0.35 && Math.abs(d[0]) > 0.5 ? "seen from the front with the tube to his side: a spyglass is used with his head turned to what he looks at" : a.mark && !a.mark("eyeA") && !a.mark("eyeB") ? "the eye it is put to is not in view" : !(Math.abs(a.o.face?.shut ?? 0) > 0.5 && Math.sign(a.o.face?.shut ?? 0) === spyEye(cam, a.at, target, a.heading)) ? "the eye at the eyepiece is open beside it (face.shut = spyEye)" : n1.off > n1.r ? `the near hand is ${(n1.off * 100).toFixed(0)} cm off the tube` : n1.along < 0.08 || n1.along > len ? "the near hand is not on the tube" : n2 && n2.off > n2.r ? `the supporting hand is ${(n2.off * 100).toFixed(0)} cm off the tube` : n2 && (n2.along > len || n2.along < n1.along + 0.08) ? "the supporting hand is not further out on the tube" : null;
    AUDIT.rows.push({ id: o.uuid, prop: "spyglass", use: "look", holder: `${a.name} ${opt.one ? H.near : `${H.near}+${H.far}`}`, err, at: mix3(e0, palm(a, opt.one ? H.near : H.far), 0.5), o }); }
  return o;
};
/** Where a thing that has left a hand is t seconds later: let go at `p0` with the speed `v0` (metres a second; nothing = dropped), it
 *  falls, lands on the floor at the height `floor`, bounces once a little and lies still. `spin` = turns a second while in the air */
export const fallen = (p0: V3, v0: V3, t: number, floor: number, opt: { bounce?: number; spin?: number } = {}): { at: V3; turn: number; landed: boolean; t1: number } => {
  const G = 9.8, h = Math.max(0, p0[1] - floor), t1 = (v0[1] + Math.sqrt(v0[1] * v0[1] + 2 * G * h)) / G, spin = (opt.spin ?? 0.8) * Math.PI * 2;
  if (t <= t1) return { at: [p0[0] + v0[0] * t, p0[1] + v0[1] * t - 0.5 * G * t * t, p0[2] + v0[2] * t], turn: spin * t, landed: false, t1 };
  const vy = (G * t1 - v0[1]) * (opt.bounce ?? 0.22), t2 = (2 * vy) / G, u = Math.min(t - t1, t2), slide = 0.35;
  return { at: [p0[0] + v0[0] * (t1 + u * slide), floor + vy * u - 0.5 * G * u * u, p0[2] + v0[2] * (t1 + u * slide)], turn: spin * (t1 + u * 0.3), landed: true, t1 };
};
/** A thing that has left a hand: dropped or thrown, it falls and lands (see `fallen`). Its middle falls (`centre`, where its middle is
 *  from its grip in its own terms, and `r`, how far its middle stays above the floor when it lies there), turning in the picture's plane
 *  about that middle, and once down it settles onto the nearest side, so that it never jumps. `p0` = where its grip was when it was let
 *  go (as wield put it there), `from` = the angle it had in the hand, `mirror` = it was held turned over (pointing to the left) */
export const letGo = (into: THREE.Group, o: THREE.Object3D, P: Prop | string, p0: V3, v0: V3, t: number, floor: number, cam: Cam, opt: { bounce?: number; spin?: number; from?: number; centre?: [number, number]; r?: number; mirror?: boolean; /** the angles it may come to rest at (degrees; a mug on its bottom or on its side with the ear up, never on its ear) */ rests?: number[] } = {}) => {
  const c = opt.centre ?? [0, 0], m = opt.mirror ? -1 : 1, a0 = ((opt.from ?? 0) * Math.PI) / 180;
  const R = (a: number): [number, number] => [Math.cos(a) * m * c[0] - Math.sin(a) * c[1], Math.sin(a) * m * c[0] + Math.cos(a) * c[1]];
  const f = fallen(aside(p0, cam, ...R(a0)), v0, t, floor + (opt.r ?? 0), opt);
  let a = a0 + f.turn; if (f.landed) { const R90 = Math.PI / 2, ok = (opt.rests ?? [0, 90, 180, 270]).map((d) => (((d * m) % 360) + 360) % 360 * (Math.PI / 180));
    let q = a, best = Infinity; for (let k = Math.floor(a / (2 * Math.PI)) - 1; k <= Math.floor(a / (2 * Math.PI)) + 1; k++) for (const r of ok) { const c = r + 2 * Math.PI * k; if (Math.abs(c - a) < best) { best = Math.abs(c - a); q = c; } }
    const u = Math.max(0, Math.min(1, (t - f.t1) / (0.2 + 0.12 * Math.min(1, best / R90)))); a += (q - a) * u * u * (3 - 2 * u); }
  const r = R(a), org = aside(f.at, cam, -r[0], -r[1]); span(into, o, org, aside(org, cam, Math.cos(a), Math.sin(a)), cam, 0); if (opt.mirror) o.rotateY(Math.PI);
  if (AUDIT.on) AUDIT.rows.push({ id: o.uuid, prop: typeof P === "string" ? P : P.name, use: f.landed ? "landed" : "falling", holder: "", err: null, at: f.at });
  return f;
};
/** A thing set down on something: it stands at `p` (its own origin) and is noted as put down, not dropped */
export const setDown = (into: THREE.Group, o: THREE.Object3D, P: Prop | string, p: V3, cam: Cam, level = 0) => {
  const r = (level * Math.PI) / 180; span(into, o, p, aside(p, cam, Math.cos(r), Math.sin(r)), cam, 0);
  if (AUDIT.on) AUDIT.rows.push({ id: o.uuid, prop: typeof P === "string" ? P : P.name, use: "down", holder: "", err: null, at: p });
  return o;
};
/** who stands where and is seen from where: what a solved pose needs to know */
export type Stand = { D: Design; at: V3; heading: number; h: number; cam: Cam; pose?: Partial<Pose> };
/** the eye a spyglass is put to, for a figure that is not on the stage yet: the figure is drawn once to find where its eyes are
 *  (without a canvas to draw on, the middle of the face is taken) */
const eyeAt = (s: Stand, target: V3): V3 => {
  const sp = { at: s.at, heading: s.heading, h: s.h }, pose = (s.pose ?? {}) as Pose;
  if (typeof document === "undefined") { const j = bareJoints(s.D, pose, {}, sp, s.cam.pos).joint; return mix3(j("neck"), j("crown"), 0.56); }
  const p = figureCard(s.D, pose, {}, sp, s.cam.pos), e = eyeOf({ joint: p.joint, mark: p.mark } as unknown as Staged, s.cam, target);
  p.mesh.traverse((o) => { const m = o as THREE.Mesh; if (!m.isMesh) return; m.geometry?.dispose(); for (const mat of (Array.isArray(m.material) ? m.material : [m.material]) as THREE.MeshBasicMaterial[]) { mat.map?.dispose(); mat.dispose(); } });
  return e;
};
/** The arms of a figure looking through a spyglass at `target`: one hand on the tube near his face and the other supporting it
 *  further out, both on the line from his eye to what he looks at (for a mover's actAt; solved once for where he stands and where
 *  the lens is). `one` = only the near hand is on it */
export const spyPose = (s: Stand, target: V3, one = false): Partial<Pose> => {
  const j = bareJoints(s.D, (s.pose ?? {}) as Pose, {}, { at: s.at, heading: s.heading, h: s.h }, s.cam.pos).joint, e = eyeAt(s, target), H = spyHands(j("shL"), j("shR"), e, target, s.cam);
  const d = unit(pic(s.cam)(e, target)), on = (r: number): V3 => aside(e, s.cam, d[0] * r, d[1] * r), sp = { at: s.at, heading: s.heading, h: s.h }, base = (s.pose ?? {}) as Pose;
  const out: Record<string, [Seg, Seg]> = { [H.near === "L" ? "armL" : "armR"]: reachArm(s.D, base, {}, sp, s.cam.pos, H.near, on(SPY.near)) };
  if (!one) out[H.far === "L" ? "armL" : "armR"] = reachArm(s.D, base, {}, sp, s.cam.pos, H.far, on(SPY.far));
  return out as Partial<Pose>;
};
/** the turn of a figure's head toward a point (degrees toward his left, as in a pose's head), at most 70 either way, and the nod */
export const lookHead = (s: Stand, target: V3): [number, number, number] => {
  let rel = (Math.atan2(target[0] - s.at[0], target[2] - s.at[2]) * 180) / Math.PI - s.heading; while (rel > 180) rel -= 360; while (rel < -180) rel += 360;
  const up = (Math.atan2(target[1] - (s.at[1] + s.h * 0.9), Math.hypot(target[0] - s.at[0], target[2] - s.at[2])) * 180) / Math.PI;
  return [Math.max(-70, Math.min(70, rel)), Math.max(-20, Math.min(20, -up)), 0];
};
/** The arm of a figure that aims a thing (a pistol) at `target`: stretched out from the shoulder straight at it */
export const aimPose = (s: Stand, target: V3, side: Side = "R"): Partial<Pose> => {
  const sp = { at: s.at, heading: s.heading, h: s.h }, base = (s.pose ?? {}) as Pose, j = bareJoints(s.D, base, {}, sp, s.cam.pos).joint;
  const a = pointArm(s.D, base, {}, sp, s.cam.pos, side, unit(pic(s.cam)(j(sh(side)), target)));
  return { ...(side === "L" ? { armL: a } : { armR: a }), head: lookHead(s, target) } as Partial<Pose>;
};
/** A sabre in its scabbard at the hip of `side`: the hilt and the frog at his belt, the sheath hanging behind him, so that it never
 *  crosses a leg. Seen from the front it hangs down the outside of his thigh; seen from the side it slants down and back and shows
 *  behind him, and at the far hip the whole of it lies behind his body (the hilt shows in front of his belly). `o` = props.ts scabbard (the throat at the origin, the sheath along +x, the hilt along -x) */
const STRAPS = new WeakMap<THREE.Object3D, THREE.Group>();
/** a leather strap from a to b, in front of the figure's card by d (one per thing it belongs to, made once) */
const strap = (into: THREE.Group, of: THREE.Object3D, a: V3, b: V3, cam: Cam, d: number, w = 0.055) => {
  let s = STRAPS.get(of); if (!s) { s = group([mesh(box(1, w, 0.014), "#4a3020", { at: [0.5, 0, 0], line: 0.6, shadow: false })]); STRAPS.set(of, s); }
  const P2 = pic(cam); span(into, s, a, b, cam, d); s.scale.set(Math.max(0.01, Math.hypot(...P2(a, b))), 1, 1); return s;
};
type Body = { joint: (n: string) => V3; heading: number; at: V3 };
/** where a scabbard at the hip hangs: its throat, the angle it lies at in the picture, and whether it is at the far hip */
const scabbardAt = (a: Body, side: Side, cam: Cam, held = false) => {
  const P2 = pic(cam), h = (a.heading * Math.PI) / 180, fwd = P2([0, 0, 0], [Math.sin(h), 0, Math.cos(h)])[0], hip = a.joint(side === "L" ? "hipL" : "hipR"), other = a.joint(side === "L" ? "hipR" : "hipL");
  // seen from the side, a sabre at the far hip lies behind him: only the hilt shows in front of his belly and the sheath behind his legs
  const toCam = [cam.pos[0] - a.at[0], cam.pos[2] - a.at[2]], leftNear = Math.cos(h) * toCam[0] - Math.sin(h) * toCam[1] > 0, farHip = (side === "L") !== leftNear;
  // held by the other hand for a draw (seen from the scabbard's side): tipped toward level, the throat forward, so that the line the
  // hilt comes along passes in front of him, clear of his face and beard
  const front = Math.abs(fwd) < 0.35, out = P2(other, hip)[0] >= 0 ? 1 : -1, at: V3 = [hip[0], hip[1] + 0.07, hip[2]], p = near(front ? aside(at, cam, out * 0.11) : farHip ? aside(at, cam, Math.sign(fwd) * 0.11, -0.02) : at, cam, !front && farHip ? -0.08 : 0.04);
  const lie = front ? -90 + out * 30 : (fwd > 0 ? -1 : 1) * (farHip ? 145 : held ? 150 : 128) + (fwd > 0 ? 0 : 180);      // seen from the front it hangs slanting out from the hip, as a sabre on a baldric does
  // its line in the world, from the throat toward the tip (in the picture's plane)
  const r = (lie * Math.PI) / 180, v = aside([0, 0, 0], cam, Math.cos(r), Math.sin(r)), d3 = new THREE.Vector3(...v).normalize();
  /** a point `s` metres along the sheath's line from the throat (negative = up the hilt and beyond) */
  const along = (s: number): V3 => [p[0] + d3.x * s, p[1] + d3.y * s, p[2] + d3.z * s];
  return { p, lie, front, farHip, out, at, d3, along };
};
/** where a point in the world is seen on the plane of a figure's card (along the ray from the lens): where his hand must be to be
 *  seen on it */
const onCard = (at: V3, cam: Cam, q: V3): V3 => { const fx = cam.look[0] - cam.pos[0], fz = cam.look[2] - cam.pos[2], n = Math.hypot(fx, fz) || 1, nx = fx / n, nz = fz / n;
  const dx = q[0] - cam.pos[0], dy = q[1] - cam.pos[1], dz = q[2] - cam.pos[2], s = ((at[0] - cam.pos[0]) * nx + (at[2] - cam.pos[2]) * nz) / (dx * nx + dz * nz || 1e-6);
  return [cam.pos[0] + dx * s, cam.pos[1] + dy * s, cam.pos[2] + dz * s]; };
/** where the grip of a sheathed sabre is (for the hand that draws it): 8 cm up the hilt from the scabbard's throat */
export const hiltAt = (a: Body, side: Side, cam: Cam, held = false): V3 => scabbardAt(a, side, cam, held).along(-0.08);
/** the hilt of a sheathed sabre, for a figure that is not on the stage yet (to solve the arm that draws it) */
export const hiltFor = (s: Stand, side: Side): V3 => hiltAt({ joint: bare(s), heading: s.heading, at: s.at }, side, s.cam);
export const sheathed = (into: THREE.Group, o: THREE.Object3D, a: Staged, side: Side, cam: Cam, opt: { drawn?: boolean; /** held by the other hand for a draw */ held?: boolean } = {}) => {
  const S = scabbardAt(a as unknown as Body, side, cam, opt.held), fx = cam.look[0] - cam.pos[0], fz = cam.look[2] - cam.pos[2];
  o.position.set(S.p[0], S.p[1], S.p[2]); o.rotation.set(0, Math.atan2(-fx, -fz), (S.lie * Math.PI) / 180);
  if (opt.held) o.quaternion.premultiply(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0).applyQuaternion(o.quaternion), S.d3));
  o.traverse((c) => { if (c.userData.layer === "back") { c.userData.z0 ??= c.position.z; c.position.z = c.userData.z0 - (S.front || !S.farHip ? 0.14 : 0); } if (c.userData.hilt) c.visible = !opt.drawn; });
  // the baldric: over the other shoulder, across his chest, down to the frog that holds the scabbard
  const top = a.joint(sh(side === "L" ? "R" : "L"));
  strap(into, o, [top[0], top[1] + 0.05, top[2]], S.front ? aside(S.p, cam, -S.out * 0.02, 0.02) : S.p, cam, 0.035);
  if (AUDIT.on) AUDIT.rows.push({ id: o.uuid, prop: "sabre", use: opt.drawn ? "scabbard" : "sheathed", holder: "", err: null, at: S.at });
  into.add(o); return o;
};
/** A sabre drawn from its scabbard at the hip of `hip`: the hand on that side holds the scabbard below its throat, the other hand
 *  draws. k = 0, the hand closed on the hilt and the blade all inside; k = 1, the point just out of the throat. The hilt goes up and
 *  forward along the sheath's own line and only what is out of the sheath shows. Shown only at a slant from the scabbard's side: from
 *  the front the hilt would come up past his face (the real draw comes toward the lens), and at the far hip the blade would vanish
 *  into his body. `sab` = props.ts sabre, `scab` =
 *  props.ts scabbard (its hilt is hidden while the sabre is out of it) */
export const drawSabre = (into: THREE.Group, sab: THREE.Object3D, scab: THREE.Object3D, a: Staged, hip: Side, cam: Cam, k: number, len = 0.6, opt: { /** the scabbard and the hand on it are put by the film itself (the sabre is inside a blend) */ noScabbard?: boolean; /** k is taken from where the drawing hand is along the sheath's line (the hand pulls the sabre), not from the clock */ follow?: boolean; /** drawn clear: the grip stays in his hand wherever the hand goes, the blade still along the sheath's line (the first moment after the draw) */ free?: boolean } = {}) => {
  const S = scabbardAt(a as unknown as Body, hip, cam, true), r = (S.lie * Math.PI) / 180, ax: [number, number] = [Math.cos(r), Math.sin(r)], hand: Side = hip === "L" ? "R" : "L";
  if (!opt.noScabbard) { sheathed(into, scab, a, hip, cam, { drawn: true, held: true }); fingers(into, a, [hip], cam, 0.1 + depth(cam, onCard(a.at, cam, S.along(0.08)), S.along(0.08))); }
  // the sabre's grip k of the way out along the sheath's line, its blade pointing back down the line into the throat, and only what
  // is out of the sheath showing; the fist is drawn in front of the grip wherever the grip is
  if (opt.follow) { const P0 = pic(cam), h0 = onCard(a.at, cam, S.along(-0.08)), h1 = onCard(a.at, cam, S.along(-0.08 - len)), line = P0(h0, h1), L2 = dot(line, line) || 1; k = Math.max(0, Math.min(1, dot(P0(h0, palm(a, hand)), line) / L2)); }
  const hilt = S.along(-0.08 - len * k), blade = sab.getObjectByName("blade");
  grip(into, sab, a, hand, cam, ax, { d: 0.05, knuckle: Math.sign(ax[0]) || 1, fingers: false });
  sab.quaternion.premultiply(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0).applyQuaternion(sab.quaternion), S.d3)); if (!opt.free) sab.position.set(...hilt);
  if (blade) { blade.scale.x = Math.max(0.001, Math.min(1, k)); blade.visible = k > 0.03; }
  fingers(into, a, [hand], cam, 0.12 + depth(cam, onCard(a.at, cam, hilt), hilt));
  if (AUDIT.on) { const P2 = pic(cam), seen = onCard(a.at, cam, hilt), off = Math.hypot(...P2(seen, palm(a, hand))), held = Math.hypot(...P2(onCard(a.at, cam, S.along(0.08)), palm(a, hip)));
    // his face as the picture shows it, with the beard: from below the chin (halfway down the neck) to the middle of the head, and
    // round that line as far as the head and the beard are wide (half the head's height)
    const pm = palm(a, hand), sk = a.joint("skull"), cw = a.joint("crown"), H = Math.hypot(...P2(sk, cw)), nk = P2(pm, mix3(a.joint("neck"), sk, 0.5)), cr = P2(pm, mix3(sk, cw, 0.5));
    const v: [number, number] = [cr[0] - nk[0], cr[1] - nk[1]], u = Math.max(0, Math.min(1, -dot(nk, v) / (dot(v, v) || 1))), face = Math.hypot(nk[0] + v[0] * u, nk[1] + v[1] * u) - 0.5 * H - fistR(a, hand, cam);
    const err = S.front ? "seen from the front a draw comes toward the lens and the hilt would come up past his face: show it at a slant from the scabbard's side"
      : S.farHip ? "the draw is at the far hip, where the blade would vanish into his body: show it at a slant from the scabbard's side"
      : off > fistR(a, hand, cam) * 0.6 ? `the drawing hand is ${(off * 100).toFixed(1)} cm from the grip it draws (on the sheath's line; at most ${(fistR(a, hand, cam) * 60).toFixed(1)} cm, inside the fist)`
      : held > fistR(a, hip, cam) * 1.2 ? `the other hand is ${(held * 100).toFixed(0)} cm off the scabbard it holds` : face < 0.09 ? `the drawing hand comes within ${(Math.max(0, face) * 100).toFixed(0)} cm of his face (at least a fist's breadth)` : null;
    AUDIT.rows.push({ id: sab.uuid, prop: "sabre", use: "draw", holder: `${a.name} ${hand}`, err, at: palm(a, hand), o: sab }); }
  return sab;
};
/** how far a point is in front of a figure's card, toward the lens (metres) */
const depth = (cam: Cam, card: V3, q: V3) => Math.max(0, Math.hypot(card[0] - cam.pos[0], card[1] - cam.pos[1], card[2] - cam.pos[2]) - Math.hypot(q[0] - cam.pos[0], q[1] - cam.pos[1], q[2] - cam.pos[2]));
/** The arms of a draw: the hand on the scabbard's side holds the sheath below its throat; the other hand is k of the way from the hilt
 *  (in the sheath) to where the point leaves the throat, along the sheath's line, with its elbow lifted and out as the hilt comes up */
export const drawPose = (s: Stand, hip: Side, k: number, len = 0.6): Partial<Pose> => {
  const body = { joint: bare(s), heading: s.heading, at: s.at }, S = scabbardAt(body, hip, s.cam, true), r = (S.lie * Math.PI) / 180, hand: Side = hip === "L" ? "R" : "L";
  const sp = { at: s.at, heading: s.heading, h: s.h }, base = (s.pose ?? {}) as Pose, to = onCard(s.at, s.cam, S.along(-0.08 - len * k));
  const shH = body.joint(sh(hand)), o = Math.sign(pic(s.cam)(body.joint(sh(hip)), shH)[0]) || -Math.sign(facing(s.heading, s.cam)) || 1, elbow = aside(shH, s.cam, o * (0.1 + 0.12 * k), -0.3 + 0.24 * k);
  const holdAt = onCard(s.at, s.cam, S.along(0.08)); void r;
  return { [hand === "L" ? "armL" : "armR"]: reachArm(s.D, base, {}, sp, s.cam.pos, hand, to, 0.5, elbow), [hip === "L" ? "armL" : "armR"]: reachArm(s.D, base, {}, sp, s.cam.pos, hip, holdAt) } as Partial<Pose>;
};

// ---------------- two hands on one thing, and things on the shoulder ----------------
/** where a figure's own left side lies in the picture (+1 right, -1 left); seen side on, the way he faces */
const leftward = (j: (n: string) => V3, cam: Cam, heading: number) => { const P2 = pic(cam), dx = P2(j("shR"), j("shL"))[0]; if (Math.abs(dx) > 0.07) return Math.sign(dx); const h = (heading * Math.PI) / 180; return Math.sign(P2([0, 0, 0], [Math.sin(h), 0, Math.cos(h)])[0]) || 1; };
const facing = (heading: number, cam: Cam) => { const h = (heading * Math.PI) / 180; return pic(cam)([0, 0, 0], [Math.sin(h), 0, Math.cos(h)])[0]; };
const J = (a: Staged) => (n: string) => a.joint(n as "neck");
/** a point given in the picture's own terms: r to the right and up from p */
const at2 = (p: V3, cam: Cam, v: [number, number], k = 1): V3 => aside(p, cam, v[0] * k, v[1] * k);
/** the arm that puts the middle of a figure's closed fingers on a point (for a pose built once) */
export const reach = (s: Stand, side: Side, target: V3): Partial<Pose> => ({ [side === "L" ? "armL" : "armR"]: reachArm(s.D, (s.pose ?? {}) as Pose, {}, { at: s.at, heading: s.heading, h: s.h }, s.cam.pos, side, target) } as Partial<Pose>);
/** the joints of a figure that is not on the stage yet, where it will stand (for poses built once) */
export const jointsOf = (s: Stand) => bare(s);
const bare = (s: Stand) => { const j = bareJoints(s.D, (s.pose ?? {}) as Pose, {}, { at: s.at, heading: s.heading, h: s.h }, s.cam.pos).joint; return (n: string) => j(n as "neck"); };

/** A hand raised with something hanging from it (a bucket, a lantern): up from the shoulder and out to his side, or forward when he is
 *  seen from the side, so that what hangs from it hangs clear of his head */
export const liftPose = (s: Stand, side: Side, up = 0.45, out = 0.42): Partial<Pose> => {
  const j = bare(s), q = j(sh(side)), f = facing(s.heading, s.cam), o = Math.abs(f) > 0.35 ? Math.sign(f) : Math.sign(pic(s.cam)(j(sh(side === "L" ? "R" : "L")), q)[0]) || 1;
  return reach(s, side, aside(q, s.cam, o * out, up));
};
/** The fiddle as it is played: its tail under his chin on his left shoulder, the body and neck out to his left and a little down, his
 *  left hand round the neck; the bow in his right hand by the frog, drawn across the strings between the bridge and the fingerboard */
const fiddleLine = (j: (n: string) => V3, cam: Cam, heading: number) => {
  const side = leftward(j, cam, heading), k = j("neck"), chin = aside([k[0], k[1] - 0.07, k[2]], cam, side * 0.06), dir: [number, number] = unit([side * 0.94, -0.34]);
  return { side, chin, dir, neck: at2(chin, cam, dir, 0.42), bowAt: at2(chin, cam, dir, 0.24) };
};
/** the right arm of a fiddler with the bow hand r metres from where the bow crosses the strings (0.18 = up bow, 0.44 = down bow) */
export const bowPose = (s: Stand, r = 0.3): Partial<Pose> => { const F = fiddleLine(bare(s), s.cam, s.heading); return reach(s, "R", at2(F.bowAt, s.cam, unit([-F.side * 0.75, -0.66]), r)); };
/** where a figure's fiddle lies as he plays: its chin end, its neck where his hand is, a little further up the neck (for a hand that takes it) */
export const fiddleAt = (a: Staged, cam: Cam) => { const F = fiddleLine(J(a), cam, a.heading); return { chin: F.chin, neck: F.neck, scroll: at2(F.chin, cam, F.dir, 0.55), dir: F.dir, bowAt: F.bowAt }; };
export const fiddlePose = (s: Stand): Partial<Pose> => {
  const F = fiddleLine(bare(s), s.cam, s.heading), hand = at2(F.bowAt, s.cam, unit([-F.side * 0.75, -0.66]), 0.3);
  return { ...reach(s, "L", F.neck), ...reach(s, "R", hand), head: [F.side * 8, 10, F.side * 14] } as Partial<Pose>;
};
/** `fid` = props.ts fiddleByNeck (its neck at the origin, its body along +x): it is laid from the neck back to the chin */
export const fiddlePlay = (into: THREE.Group, fid: THREE.Object3D, bow: THREE.Object3D | null, a: Staged, cam: Cam, opt: { bowTo?: V3 } = {}) => {
  const F = fiddleLine(J(a), cam, a.heading), pR = palm(a, "R"), neck = at2(F.chin, cam, F.dir, 0.45 * ((fid.userData.len as number) ?? 0.6) / 0.6);
  span(into, fid, neck, F.chin, cam, 0.06); if (bow) span(into, bow, pR, opt.bowTo ?? F.bowAt, cam, 0.12); fingers(into, a, bow ? ["L", "R"] : ["L"], cam, 0.17);
  if (AUDIT.on) { const P2 = pic(cam), v = P2(F.chin, palm(a, "L")), along = dot(v, F.dir), off = Math.abs(v[0] * F.dir[1] - v[1] * F.dir[0]);
    const b = unit(P2(pR, F.bowAt)), w = P2(F.chin, pR), den = b[0] * F.dir[1] - b[1] * F.dir[0], u = Math.abs(den) < 1e-6 ? 99 : (w[0] * F.dir[1] - w[1] * F.dir[0]) / -den, vv = dot([w[0] + b[0] * u, w[1] + b[1] * u], F.dir);
    AUDIT.rows.push({ id: fid.uuid, o: fid, prop: "fiddle", use: "play", holder: `${a.name} L`, err: off > fistR(a, "L", cam) ? `the left hand is ${(off * 100).toFixed(0)} cm off the neck` : along < 0.3 || along > 0.58 ? "the left hand is not on the neck" : null, at: mix3(F.chin, palm(a, "L"), 0.5) });
    if (bow) AUDIT.rows.push({ id: bow.uuid, o: bow, prop: "bow", use: "play", holder: `${a.name} R`, err: vv < 0.16 || vv > 0.34 ? "the bow does not cross the strings between the bridge and the fingerboard" : u < 0.12 || u > 0.6 ? "the bow touches the strings outside its own length" : null, at: F.bowAt }); }
};
/** The cithara held upright against his left side, leaning a little out: his left hand on its outer arm, and when he plays his right
 *  hand on the strings. `o` = props.ts cithara (its foot at the origin, `h` high, its face toward +z) */
const citharaAt = (j: (n: string) => V3, cam: Cam, heading: number, h: number, out = 0.12) => {
  const side = leftward(j, cam, heading), tilt = -side * 0.21, base = aside(mix3(j("pelvis"), j("neck"), -0.06), cam, side * out), w = h * 0.62;
  const P = (ix: number, iy: number) => aside(base, cam, ix * Math.cos(tilt) - iy * Math.sin(tilt), ix * Math.sin(tilt) + iy * Math.cos(tilt));
  // the left hand on the middle of the outer upright arm (props.ts cithara: the arms stand at 0.42 of the width from the middle), clear
  // of the strings, which end at 0.26 of it
  return { side, tilt, base, arm: P(side * w * 0.42, h * 0.6), armLow: P(side * w * 0.42, h * 0.36), armHigh: P(side * w * 0.45, h * 0.86), strings: P(-side * w * 0.04, h * 0.56) };
};
/** where a figure's cithara stands as he holds it: its foot, its tilt, and a point on it (ix across, iy up, in metres) */
export const citharaPlace = (a: Staged, cam: Cam, h = 0.62, out = 0.12) => { const C = inLeft(a, cam, citharaAt(J(a), cam, a.heading, h, out)); return { base: C.base, tilt: C.tilt, side: C.side }; };
/** a held cithara goes where the hand that holds it goes: moved so that its outer arm runs through the middle of his left fist (the
 *  pose puts the hand there; when he sways or leans the instrument follows the hand, not his chest). It moves across the picture at
 *  its own depth, to where the lens sees the hand. `moved` = how far it had to go */
const inLeft = <C extends { base: V3; arm: V3; armLow: V3; armHigh: V3; strings: V3 }>(a: Staged, cam: Cam, C: C): C & { moved: number } => {
  const p = palm(a, "L"), c = cam.pos, r = Math.hypot(C.arm[0] - c[0], C.arm[1] - c[1], C.arm[2] - c[2]) / (Math.hypot(p[0] - c[0], p[1] - c[1], p[2] - c[2]) || 1);
  const d: V3 = [c[0] + (p[0] - c[0]) * r - C.arm[0], c[1] + (p[1] - c[1]) * r - C.arm[1], c[2] + (p[2] - c[2]) * r - C.arm[2]], m = (q: V3): V3 => [q[0] + d[0], q[1] + d[1], q[2] + d[2]];
  return { ...C, base: m(C.base), arm: m(C.arm), armLow: m(C.armLow), armHigh: m(C.armHigh), strings: m(C.strings), moved: Math.hypot(...d) }; };
/** the right arm of a figure whose finger is on string i (0..6) of the cithara he holds */
export const pluckPose = (s: Stand, i: number, h = 0.62, out = 0.12): Partial<Pose> => { const C = citharaAt(bare(s), s.cam, s.heading, h, out), w = h * 0.62, x = (i - 3) * w * 0.085, y = h * 0.56;
  return reach(s, "R", seenOn(s, aside(C.base, s.cam, x * Math.cos(C.tilt) - y * Math.sin(C.tilt), x * Math.sin(C.tilt) + y * Math.cos(C.tilt)))); };
export const citharaPose = (s: Stand, play: boolean, h = 0.62, out = 0.12): Partial<Pose> => { const C = citharaAt(bare(s), s.cam, s.heading, h, out); return { ...reach(s, "L", seenOn(s, C.arm)), ...(play ? reach(s, "R", seenOn(s, C.strings)) : {}) } as Partial<Pose>; };
/** where the lens sees a point on the plane of a figure's card (along the ray from the lens): the cithara stands out at his side, off
 *  his card, and a lens close below or to the side sees it well away from where it would fall straight onto the card */
const seenOn = (s: Stand, q: V3): V3 => { const c = s.cam.pos, az = Math.atan2(c[0] - s.at[0], c[2] - s.at[2]), nx = Math.sin(az), nz = Math.cos(az), dx = q[0] - c[0], dy = q[1] - c[1], dz = q[2] - c[2], den = dx * nx + dz * nz;
  const k = Math.abs(den) < 1e-6 ? 1 : ((s.at[0] - c[0]) * nx + (s.at[2] - c[2]) * nz) / den; return [c[0] + dx * k, c[1] + dy * k, c[2] + dz * k]; };
export const citharaHold = (into: THREE.Group, o: THREE.Object3D, a: Staged, cam: Cam, play: boolean, h = 0.62, opt: { d?: number; /** how far out at his side it stands (metres) */ out?: number } = {}) => {
  const C = inLeft(a, cam, citharaAt(J(a), cam, a.heading, h, opt.out)), d = opt.d ?? 0.06; span(into, o, C.base, aside(C.base, cam, Math.cos(C.tilt), Math.sin(C.tilt)), cam, d); fingers(into, a, ["L"], cam, d + 0.22);      // the fist round the arm, all of it in front of the frame and the strings
  if (play) fingers(into, a, ["R"], cam, d + 0.22, true);      // the playing hand lies on the strings, all of it well in front of them (a lens close below sees the planes slant)
  if (AUDIT.on) { const P2 = pic(cam), offR = Math.hypot(...P2(C.strings, palm(a, "R")));
    AUDIT.rows.push({ id: o.uuid, o, prop: "cithara", use: play ? "play" : "hold", holder: `${a.name} L`, err: C.moved > 0.06 ? `the cithara has to move ${(C.moved * 100).toFixed(0)} cm across the picture to meet his left hand (the pose does not put the hand on its arm)` : play && offR > 0.16 ? `the right hand is ${(offR * 100).toFixed(0)} cm from the strings` : null, at: mix3(C.arm, C.strings, 0.5) }); }
  return o;
};
/** A rope hauled hand over hand: it comes down from `top` through his upper hand and his lower hand, and its slack end falls to the
 *  floor at `floor` behind him. Both hands close round it */
export const haulPose = (s: Stand, top: V3): Partial<Pose> => {
  const j = bare(s), f = Math.sign(facing(s.heading, s.cam)) || 1, low = aside(mix3(j("pelvis"), j("neck"), 0.62), s.cam, f * 0.2), d = unit(pic(s.cam)(low, top));
  return { ...reach(s, "R", at2(low, s.cam, d, 0.4)), ...reach(s, "L", low) } as Partial<Pose>;
};
export const haul = (into: THREE.Group, a: Staged, cam: Cam, top: V3, floor: number, d = 0.05) => {
  const pL = near(palm(a, "L"), cam, d), pR = near(palm(a, "R"), cam, d), [hi, lo] = pL[1] > pR[1] ? [pL, pR] : [pR, pL], T = near(top, cam, d), back = -(Math.sign(facing(a.heading, cam)) || 1);
  const sag = aside(lo, cam, back * 0.08, -0.4), ground = aside([lo[0], floor + 0.02, lo[2]], cam, back * 0.3), end = aside(ground, cam, back * 0.5);
  for (const [p, q] of [[T, hi], [hi, lo], [lo, sag], [sag, ground], [ground, end]] as [V3, V3][]) { const r = rod(p, q, 0.016, "#cdb57a", { line: 0.5, shadow: false }); r.userData.own = true; into.add(r); }
  fingers(into, a, ["L", "R"], cam, d + 0.07);
  if (AUDIT.on) { const P2 = pic(cam), u1 = unit(P2(T, hi)), u2 = unit(P2(hi, lo)), bend = (Math.acos(Math.max(-1, Math.min(1, dot(u1, u2)))) * 180) / Math.PI;
    AUDIT.rows.push({ id: `rope-${a.name}`, prop: "rope", use: "haul", holder: `${a.name} L+R`, err: bend > 30 ? `the rope bends ${bend.toFixed(0)} degrees at his upper hand: the hands are not on its line` : null, at: mix3(hi, lo, 0.5) }); }
};
/** A chest carried by its two end handles, by two people or by one with both hands: the handles in the hands, the chest hanging between
 *  them. `o` = props.ts chest (its handles' grips are in o.userData.grips). The figures must stand so that the hands are as far apart
 *  as the handles (the check says when they are not) */
export const carryBy = (into: THREE.Group, o: THREE.Object3D, a: Staged, sa: Side, b: Staged, sb: Side, cam: Cam, d = 0.1, /** "don" = being put on over the head (it may pass the face) */ use = "carry") => {
  let pa = palm(a, sa), pb = palm(b, sb); const P2 = pic(cam); if (P2(pa, pb)[0] < 0) [pa, pb] = [pb, pa];
  const g = o.userData.grips as V3[], G = Math.abs(g[1][0] - g[0][0]), hy = g[0][1], v = P2(pa, pb), n = Math.hypot(v[0], v[1]) || 1, dir: [number, number] = [v[0] / n, v[1] / n];
  const origin = aside(mix3(pa, pb, 0.5), cam, hy * dir[1], -hy * dir[0]); span(into, o, origin, aside(origin, cam, dir[0], dir[1]), cam, d);
  const fd = d + ((o.userData.depth as number) ?? 0.1) / 2 + 0.2;      // the fingers well in front of the whole chest (its corners reach nearer the lens than its face), so that the hand in the ring shows
  if (a === b) fingers(into, a, [sa, sb], cam, fd); else { fingers(into, a, [sa], cam, fd); fingers(into, b, [sb], cam, fd); }
  if (AUDIT.on) { const err = Math.abs(n - G) > 0.1 ? `the hands are ${(Math.abs(n - G) * 100).toFixed(0)} cm too ${n > G ? "far apart" : "close together"} for the handles` : null;
    if (a === b) AUDIT.rows.push({ id: o.uuid, prop: "chest", use, holder: `${a.name} ${sa}+${sb}`, err, at: pa, o });
    else AUDIT.rows.push({ id: `${o.uuid}:a`, prop: "chest", use: "carry", holder: `${a.name} ${sa}`, err, at: pa, o }, { id: `${o.uuid}:b`, prop: "chest", use: "carry", holder: `${b.name} ${sb}`, err, at: pb, o }); }
  return o;
};
/** A bundle carried over the shoulder: his hand holds the knot in front of his shoulder and the bundle hangs behind his back. `o` =
 *  props.ts bundleHeld */
export const shoulderPose = (s: Stand, side: Side): Partial<Pose> => { const j = bare(s), q = j(sh(side)), k = j("neck"); return reach(s, side, aside(mix3(q, k, 0.25), s.cam, 0, -0.02)); };
export const onShoulder = (into: THREE.Group, o: THREE.Object3D, a: Staged, side: Side, cam: Cam, r = 0.2) => {
  const back = -(Math.sign(facing(a.heading, cam)) || 1), front = Math.abs(facing(a.heading, cam)) < 0.35;
  span(into, o, near(palm(a, side), cam, 0.05), aside(near(palm(a, side), cam, 0.05), cam, 1, 0), cam, 0);
  const sack = o.getObjectByName("sack"); if (sack) sack.position.set(front ? 0 : back * r * 0.9, front ? r * 0.25 : -r * 0.55, -(r + 0.16));
  fingers(into, a, [side], cam, 0.1);
  if (AUDIT.on) AUDIT.rows.push({ id: o.uuid, prop: "bundle", use: "shoulder", holder: `${a.name} ${side}`, err: null, at: palm(a, side), o });
  return o;
};
/** Two hands that hold each other (the winner pulls the beaten man up): noted for the script check, which wants the two palms to meet in
 *  the picture */
export const handshake = (a: Staged, sa: Side, b: Staged, sb: Side, cam: Cam, name = "hands") => {
  if (!AUDIT.on) return; const d = Math.hypot(...pic(cam)(palm(a, sa), palm(b, sb))), r = fistR(a, sa, cam) + fistR(b, sb, cam);
  AUDIT.rows.push({ id: `${name}:${a.name}:${b.name}`, prop: name, use: "joined", holder: `${a.name} ${sa} & ${b.name} ${sb}`, err: d > r ? `the two hands are ${(d * 100).toFixed(0)} cm apart (they hold each other)` : null, at: mix3(palm(a, sa), palm(b, sb), 0.5) });
};
/** A hand laid on another figure (a shoulder patted, an arm over the shoulders): noted for the script check, which wants the palm on that
 *  joint in the picture */
export const handOn = (a: Staged, sa: Side, b: Staged, joint: string, cam: Cam, name = "shoulder") => {
  if (!AUDIT.on) return; const d = Math.hypot(...pic(cam)(palm(a, sa), b.joint(joint as "neck"))), r = fistR(a, sa, cam) * 1.6 + 0.04;
  AUDIT.rows.push({ id: `${name}:${a.name}:${b.name}`, prop: name, use: "on", holder: `${a.name} ${sa}`, err: d > r ? `the hand is ${(d * 100).toFixed(0)} cm from ${b.name}'s ${joint}` : null, at: palm(a, sa) });
};
/** the bundle back in its place below the knot, for carrying it in the hand with `wield` */
export const inHand = (o: THREE.Object3D, r = 0.2) => { const sack = o.getObjectByName("sack"); if (sack) sack.position.set(0, -r * 0.82, 0); return o; };

/** runs something without noting it for the script check (a thing placed only to find out where its end would be) */
export const quiet = <T,>(f: () => T): T => { const on = AUDIT.on; AUDIT.on = false; try { return f(); } finally { AUDIT.on = on; } };
/** A thing on its way from one hold to another (from the eye to the hand, from one hand to the other): it is put both ways, and laid
 *  k of the way from the first to the second; the fingers of the nearer hold are kept. `holder` names the hands on it meanwhile
 *  ("mc R+L" while it changes hands). `glue`: the hand that carries it across. The point of the thing that lay in that hand in the
 *  first hold (where the hand was then: `was`, or where it is now) slides to the point that lies in it in the second, and the thing is
 *  moved so that this point is in the hand in every frame: it goes with the hand instead of drifting on its own clock (black flag v5:
 *  the spyglass hung in the air while his hand went down) */
export const blend = (into: THREE.Group, o: THREE.Object3D, k: number, A: (g: THREE.Group) => void, B: (g: THREE.Group) => void, P: string, holder: string, at?: V3, glue?: { a: Staged; side: Side; was?: V3 }) => {
  const ga = new THREE.Group(), gb = new THREE.Group();
  quiet(() => A(ga)); const pa = o.position.clone(), qa = o.quaternion.clone(); o.updateMatrix(); const ia = o.matrix.clone().invert();
  quiet(() => B(gb)); const pb = o.position.clone(), qb = o.quaternion.clone(); o.updateMatrix(); const ib = o.matrix.clone().invert();
  o.position.lerpVectors(pa, pb, k); o.quaternion.slerpQuaternions(qa, qb, k);
  if (glue) { const h = palm(glue.a, glue.side), la = new THREE.Vector3(...(glue.was ?? h)).applyMatrix4(ia), lb = new THREE.Vector3(...h).applyMatrix4(ib);
    o.updateMatrix(); const w = la.lerp(lb, k).applyMatrix4(o.matrix); o.position.x += h[0] - w.x; o.position.y += h[1] - w.y; o.position.z += h[2] - w.z; }
  const keep = k < 0.5 ? ga : gb, drop = k < 0.5 ? gb : ga;
  for (const c of [...keep.children]) if (c !== o) into.add(c);
  drop.traverse((c) => { const m = c as THREE.Mesh; if (!m.isMesh || c === o || o.getObjectById(c.id)) return; m.geometry?.dispose(); for (const mat of (Array.isArray(m.material) ? m.material : [m.material]) as THREE.MeshBasicMaterial[]) { mat.map?.dispose(); mat.dispose(); } });
  into.add(o);
  if (AUDIT.on) AUDIT.rows.push({ id: o.uuid, prop: P, use: "between", holder, err: null, at: at ?? [o.position.x, o.position.y, o.position.z], o });
  return o;
};
/** a thing that is gone from a hand by magic (it burns away, it shrinks into the fist): noted as put away, not dropped */
export const vanish = (o: THREE.Object3D, P: Prop | string) => { if (AUDIT.on) AUDIT.rows.push({ id: o.uuid, prop: typeof P === "string" ? P : P.name, use: "gone", holder: "", err: null }); };
/** which way a thing held in this hand is laid (true = turned over, its working end to the left), for letGo's `mirror` */
export const heldOver = (a: Staged, side: Side, cam: Cam) => outward(a, side, cam) < 0;

/** The script check. Stages every figure of every shot on every frame, lets the shot put its things in their hands, and
 *  lists what is wrong: a grip that is not in the hand, a working end outside what the use allows, a thing that changes hand from
 *  one frame to the next, a thing that leaves a hand without being set down, thrown or dropped, and a held thing with no hand on it
 *  (on its way from one hold to the next, the hands gone ahead of it). Needs a `document`
 *  (scripts/film_info.mjs gives it a stand-in that keeps count of the canvas transforms, so that the eyes are where they are drawn) */
/** two holders share a hand ("mc R" and "mc R+L"): a thing that passes from hand to hand through both hands */
const shares = (a: string, b: string) => a.split(" & ").some((pa) => b.split(" & ").some((pb) => { const [na, ha] = pa.split(" "), [nb, hb] = pb.split(" "); return na === nb && !!ha && !!hb && ha.split("+").some((h) => hb.split("+").includes(h)); }));
/** a convex outline round points in the picture (counter-clockwise) */
const hull2 = (pts: [number, number][]): [number, number][] => {
  const p = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o: [number, number], a: [number, number], b: [number, number]) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo: [number, number][] = [], hi: [number, number][] = [];
  for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (const q of p.reverse()) { while (hi.length >= 2 && cr(hi[hi.length - 2], hi[hi.length - 1], q) <= 0) hi.pop(); hi.push(q); }
  return [...lo.slice(0, -1), ...hi.slice(0, -1)];
};
/** how far the point [0, 0] lies outside a convex outline (0 = inside it) */
const outside = (h: [number, number][]): number => {
  if (!h.length) return Infinity;
  let inside = h.length >= 3, d = Infinity;
  for (let i = 0; i < h.length; i++) { const A = h[i], B = h[(i + 1) % h.length], v: [number, number] = [B[0] - A[0], B[1] - A[1]];
    if (v[0] * -A[1] - v[1] * -A[0] < 0) inside = false;
    const u = Math.max(0, Math.min(1, dot([-A[0], -A[1]], v) / (dot(v, v) || 1))); d = Math.min(d, Math.hypot(A[0] + v[0] * u, A[1] + v[1] * u)); }
  return inside ? 0 : d;
};
/** how far beyond the reach of his fist the nearest of a figure's named hands is from a thing, as the picture shows it (0 or less = a
 *  hand is on it). The thing is taken as the outline of the box round its visible parts in its own terms (a long tube is a thin strip,
 *  a shield its face), seen from the lens */
const offThing = (o: THREE.Object3D, a: Staged, sides: Side[], cam: Cam): number => {
  let best = Infinity; for (const s of sides) { const h = boxHull(o, cam, palm(a, s)); if (!h) return 0; best = Math.min(best, outside(h) - fistR(a, s, cam)); }
  return best;
};
/** the outline of the box round a thing's visible parts (in its own terms) as the lens sees it, in the picture's metres from `about`
 *  (null = nothing of it is visible) */
const boxHull = (o: THREE.Object3D, cam: Cam, about: V3): [number, number][] | null => {
  o.updateMatrixWorld(true); const inv = o.matrixWorld.clone().invert(), box = new THREE.Box3(), m = new THREE.Matrix4();
  o.traverseVisible((c) => { const g = (c as THREE.Mesh).geometry as THREE.BufferGeometry | undefined; if (!g?.attributes?.position) return; if (!g.boundingBox) g.computeBoundingBox(); box.union(g.boundingBox!.clone().applyMatrix4(m.multiplyMatrices(inv, c.matrixWorld))); });
  if (box.isEmpty()) return null;
  const P2 = pic(cam), corners: [number, number][] = [];
  for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) { const q = new THREE.Vector3(x, y, z).applyMatrix4(o.matrixWorld); corners.push(P2(about, [q.x, q.y, q.z])); }
  return hull2(corners);
};
/** things noted with a holder that rest on something other than a hand (a spyglass clamped under the arm rests on his side) */
const RESTS = new Set(["under arm"]);
/** `step` = seconds between readings; without it every frame the film shows is read (a fault of two frames falls between tenths) */
export const auditGrips = (film: Film, step?: number) => {
  const bad: string[] = [], spots: { shot: string; frame: number; prop: string; use: string; holder: string; x: number; y: number }[] = []; let held = 0; AUDIT.on = true;
  const lensOf = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.1, 900), carryFlag = new Set<string>(), faceFlag = new Set<string>();
  try { for (const s of film.shots) { let prev = new Map<string, { holder: string; prop: string }>();
    const times: number[] = []; if (step) for (let t = 0; t < s.b - s.a - 1e-6; t += step) times.push(t); else for (let F = Math.ceil(s.a * film.fps - 1e-6); F < s.b * film.fps - 1e-6; F++) times.push(Math.max(0, F / film.fps - s.a));
    for (const t of times) {
      AUDIT.rows = []; UNSEEN.length = 0; CROWD_LOG.on = true; CROWD_LOG.heads.length = 0; const cam = s.cam(t, t / (s.b - s.a)), g = new THREE.Group(), staged: Record<string, Staged> = {};
      for (const a of s.cast(t, s.a + t)) { const p = figureCard(a.D, a.pose, a.o, { at: a.at, heading: a.heading, h: a.h }, cam.pos); staged[a.name] = { ...a, joint: p.joint, mesh: p.mesh, mark: p.mark }; }
      s.things?.(g, staged, t, s.a + t, cam); const now = new Map<string, { holder: string; prop: string }>(), at = `${s.id} at ${t.toFixed(2)} s (film ${(s.a + t).toFixed(2)} s, frame ${Math.round((s.a + t) * film.fps)})`;
      for (const u of new Set(UNSEEN)) bad.push(`${at}: ${u}: the hand holds something but its forearm is hidden behind his head or body (the fist would float)`);
      lensOf.fov = cam.fov; lensOf.position.set(...cam.pos); lensOf.lookAt(...cam.look); lensOf.updateProjectionMatrix(); lensOf.updateMatrixWorld(true);
      for (const r of AUDIT.rows) { now.set(r.id, { holder: r.holder, prop: r.prop }); if (r.holder) held++; if (r.err) bad.push(`${at}: ${r.holder}'s ${r.prop} (${r.use}): ${r.err}`);
        // a thing that stands on nothing has a hand on it in every frame: one of the hands its holder names touches it in the picture
        else if (r.o && r.holder && !RESTS.has(r.use)) { let off = Infinity; for (const part of r.holder.split(" & ")) { const [who, hands] = part.split(" "), a = staged[who]; if (a && hands) off = Math.min(off, offThing(r.o, a, hands.split("+") as Side[], cam)); }
          if (off > 0.01 && off < Infinity) bad.push(`${at}: the ${r.prop} (${r.use}) has no hand on it: the nearest of ${r.holder} is ${(off * 100).toFixed(0)} cm off it (a thing that rests on nothing is in a hand in every frame)`); }
        if (r.at) { const q = new THREE.Vector3(...r.at).project(lensOf); spots.push({ shot: s.id, frame: Math.round((s.a + t) * film.fps), prop: r.prop, use: r.use, holder: r.holder, x: Math.round((q.x * 0.5 + 0.5) * 1080), y: Math.round((0.5 - q.y * 0.5) * 1920) }); } }
      for (const [id, was] of prev) { if (!was.holder) continue; const is = now.get(id);
        if (!is) bad.push(`${at}: the ${was.prop} leaves ${was.holder}'s hand without being set down, thrown or dropped`);
        else if (is.holder && is.holder !== was.holder && !shares(was.holder, is.holder) && is.holder.split(" ")[0] !== was.holder.split(" ")[0]) bad.push(`${at}: the ${was.prop} jumps from ${was.holder} to ${is.holder} between two frames`);
        else if (is.holder && is.holder !== was.holder && !shares(was.holder, is.holder)) bad.push(`${at}: the ${was.prop} changes hand (${was.holder} to ${is.holder}) between two frames`); }
      // two or more who carry one thing (Jesper, 18 November): each one's head shows whole, neither behind the other carrier (nearer the lens)
      // nor behind the thing they carry; a head with more than a quarter of it covered fails, once per shot and carrier
      const carriers = new Map<string, { o: THREE.Object3D; prop: string; who: Staged[] }>();
      for (const r of AUDIT.rows) if (r.use === "carry" && r.o && /:[ab]$/.test(r.id)) { const w = staged[r.holder.split(" ")[0]]; if (!w) continue; const e = carriers.get(r.o.uuid) ?? { o: r.o, prop: r.prop, who: [] }; if (!e.who.includes(w)) e.who.push(w); carriers.set(r.o.uuid, e); }
      const C = new THREE.Vector3(...cam.pos), far = (p: V3) => C.distanceTo(new THREE.Vector3(...p)), scr = (p: V3): [number, number] => { const q = new THREE.Vector3(...p).project(lensOf); return [(q.x * 0.5 + 0.5) * 1080, (0.5 - q.y * 0.5) * 1920]; };
      for (const { o, prop, who } of carriers.values()) { if (who.length < 2) continue;
        o.updateMatrixWorld(true); const box = new THREE.Box3().setFromObject(o), cs: [number, number][] = []; for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) cs.push(scr([x, y, z]));
        const ox0 = Math.min(...cs.map((c) => c[0])), ox1 = Math.max(...cs.map((c) => c[0])), oy0 = Math.min(...cs.map((c) => c[1])), oy1 = Math.max(...cs.map((c) => c[1])), oFar = far(box.getCenter(new THREE.Vector3()).toArray() as V3);
        const headOf = (w: Staged) => { const hc: V3 = [w.at[0], w.at[1] + 0.9 * w.h, w.at[2]], c = scr(hc), e = scr(aside(hc, cam, 0.075 * w.h, 0)); return { hc, c, R: Math.hypot(e[0] - c[0], e[1] - c[1]) }; };
        for (const X of who) { const { hc, c, R } = headOf(X), dX = far(hc); let cov = 0, by = "", n = 0;
          for (const [f, k] of [[0, 1], [0.5, 8], [0.95, 8]] as [number, number][]) for (let i = 0; i < k; i++) { const sx = c[0] + f * R * Math.cos((i * 2 * Math.PI) / k), sy = c[1] + f * R * Math.sin((i * 2 * Math.PI) / k); n++; let hit = "";
            if (oFar < dX - 0.02 && sx >= ox0 && sx <= ox1 && sy >= oy0 && sy <= oy1) hit = `the ${prop} they carry`;
            for (const Y of who) { if (Y === X || far(Y.at) > far(X.at) - 0.05) continue; const yh = headOf(Y), t0 = scr([Y.at[0], Y.at[1] + 0.82 * Y.h, Y.at[2]]), t1 = scr([Y.at[0], Y.at[1] + 0.45 * Y.h, Y.at[2]]), hw = Math.abs(scr(aside([Y.at[0], Y.at[1] + 0.62 * Y.h, Y.at[2]], cam, 0.13 * Y.h, 0))[0] - (t0[0] + t1[0]) / 2);
              if (Math.hypot(sx - yh.c[0], sy - yh.c[1]) < yh.R || (sy >= t0[1] && sy <= t1[1] && Math.abs(sx - (t0[0] + t1[0]) / 2) < hw)) hit = Y.name; }
            if (hit) { cov++; by = hit; } }
          const key = `${s.id}:${X.name}`; if (cov / n > 0.24 && !carryFlag.has(key)) { carryFlag.add(key); bad.push(`${at}: ${X.name}'s head is behind ${by} (two who carry one thing each show the whole head)`); } } }
      // every face whole (review of the Blackbeard film, 18 November): not a quarter or more outside the picture's edge (a figure wholly
      // out of it is fine), and not a quarter or more behind another figure nearer the lens (his head, body or arms) or behind a thing
      // anyone holds (his own too, but not a thing whose use is at the face: a spyglass at the eye, a fuse blown on, food eaten)
      const figs = Object.values(staged), heads = new Map<string, { c: [number, number]; R: number; d: number; hc: V3; away: boolean }>();
      // the head as drawn: round the middle of its crown and its skull joints, as wide as they are apart
      for (const f of figs) { const cr = f.joint("crown"), sk = f.joint("skull"), hc: V3 = [(cr[0] + sk[0]) / 2, (cr[1] + sk[1]) / 2, (cr[2] + sk[2]) / 2], r3 = Math.max(0.07 * f.h, Math.hypot(cr[0] - sk[0], cr[1] - sk[1], cr[2] - sk[2]) * 0.55), c = scr(hc), e = scr(aside(hc, cam, r3, 0));
        const hh = (f.heading * Math.PI) / 180, away = Math.sin(hh) * (cam.pos[0] - f.at[0]) + Math.cos(hh) * (cam.pos[2] - f.at[2]) < -0.35 * Math.hypot(cam.pos[0] - f.at[0], cam.pos[2] - f.at[2]);
        heads.set(f.name, { c, R: Math.hypot(e[0] - c[0], e[1] - c[1]), d: far(hc), hc, away }); }
      // the held things, met by a ray from the lens through each point of a face (a thin stick covers only where it is)
      const things = AUDIT.rows.filter((r) => r.o && !AT_FACE.has(r.use)).map((r) => { r.o!.updateMatrixWorld(true); return { name: r.prop, o: r.o! }; });
      const ray = new THREE.Raycaster(), pick = new THREE.Vector2();
      for (const X of figs) { const H = heads.get(X.name)!, pts: [number, number][] = []; for (const [f, k] of [[0, 1], [0.5, 8], [0.95, 8]] as [number, number][]) for (let i = 0; i < k; i++) pts.push([H.c[0] + f * H.R * Math.cos((i * 2 * Math.PI) / k), H.c[1] + f * H.R * Math.sin((i * 2 * Math.PI) / k)]);
        if (H.away) continue;      // (a figure seen from behind shows no face)
        const outN = pts.filter(([x, y]) => x < 0 || x > 1080 || y < 0 || y > 1920).length;
        if (outN === pts.length) continue;
        if (outN / pts.length >= 0.25) { const key = `${s.id}:${X.name}:edge`; if (!faceFlag.has(key)) { faceFlag.add(key); bad.push(`${at}: ${X.name}'s face is ${Math.round((100 * outN) / pts.length)} % outside the picture (the whole face in it, or the whole figure out)`); } continue; }
        let cov = 0, by = "";
        for (const [x, y] of pts) { let hit = "";
          for (const Y of figs) { if (Y === X) continue; const yh = heads.get(Y.name)!; if (yh.d > H.d - 0.05) continue;
            const t0 = scr([Y.at[0], Y.at[1] + 0.82 * Y.h, Y.at[2]]), t1 = scr([Y.at[0], Y.at[1] + 0.45 * Y.h, Y.at[2]]), hw = Math.abs(scr(aside([Y.at[0], Y.at[1] + 0.62 * Y.h, Y.at[2]], cam, 0.13 * Y.h, 0))[0] - (t0[0] + t1[0]) / 2);
            if (Math.hypot(x - yh.c[0], y - yh.c[1]) < yh.R || (y >= t0[1] && y <= t1[1] && Math.abs(x - (t0[0] + t1[0]) / 2) < hw)) { hit = `${Y.name}'s head or body`; break; }
            for (const sd of ["L", "R"]) { const js = [`sh${sd}`, `el${sd}`, `wr${sd}`, `tip${sd}`].map((n) => scr(Y.joint(n as "neck"))), rw = Math.max(8, yh.R * 0.32);
              for (let q = 0; q < 3 && !hit; q++) { const [a1, b1] = [js[q], js[q + 1]], vx = b1[0] - a1[0], vy = b1[1] - a1[1], L2 = vx * vx + vy * vy || 1, u = Math.max(0, Math.min(1, ((x - a1[0]) * vx + (y - a1[1]) * vy) / L2));
                if (Math.hypot(x - (a1[0] + u * vx), y - (a1[1] + u * vy)) < rw) hit = `${Y.name}'s arm`; } if (hit) break; } if (hit) break; }
          if (!hit && things.length) { pick.set((x / 1080) * 2 - 1, 1 - (y / 1920) * 2); ray.setFromCamera(pick, lensOf); ray.far = H.d - 0.03; for (const th of things) if (ray.intersectObject(th.o, true).length) { hit = `the ${th.name}`; break; } }
          if (hit) { cov++; by = hit; } }
        const key = `${s.id}:${X.name}:cover`; if (cov / pts.length > 0.25 && !faceFlag.has(key)) { faceFlag.add(key); bad.push(`${at}: ${X.name}'s face is ${Math.round((100 * cov) / pts.length)} % behind ${by}`); }
        // a held thing before either eye fails at once, however little of the head it hides (review of grip sheet 6: the measuring rod
        // stood before the expert's eye and nose, about a fifth of his head, and passed)
        if (things.length) for (const en of ["eyeA", "eyeB"]) { const e = X.mark?.(en); if (!e) continue; const c = scr(e); if (c[0] < 0 || c[0] > 1080 || c[1] < 0 || c[1] > 1920) continue;
          pick.set((c[0] / 1080) * 2 - 1, 1 - (c[1] / 1920) * 2); ray.setFromCamera(pick, lensOf); ray.far = far(e) - 0.005;
          const hit = things.find((th) => ray.intersectObject(th.o, true).length), ek = `${s.id}:${X.name}:eye`; if (hit && !faceFlag.has(ek)) { faceFlag.add(ek); bad.push(`${at}: the ${hit.name} is before ${X.name}'s eye`); } } }
      // the faces in the crowd in the middle ground (a head at least 14 px across in the picture): none a quarter behind a held thing
      if (things.length) for (const cr of CROWD_LOG.heads) { const hc: V3 = [cr.at[0], cr.at[1] + 0.88 * cr.h, cr.at[2]], c = scr(hc), e = scr(aside(hc, cam, 0.075 * cr.h, 0)), R = Math.hypot(e[0] - c[0], e[1] - c[1]);
        if (R < 14 || c[0] < 0 || c[0] > 1080 || c[1] < 0 || c[1] > 1920) continue;
        let cov = 0, by = ""; for (const [f, k] of [[0, 1], [0.5, 8], [0.95, 8]] as [number, number][]) for (let i = 0; i < k; i++) { const x = c[0] + f * R * Math.cos((i * 2 * Math.PI) / k), y = c[1] + f * R * Math.sin((i * 2 * Math.PI) / k);
          pick.set((x / 1080) * 2 - 1, 1 - (y / 1920) * 2); ray.setFromCamera(pick, lensOf); ray.far = far(hc) - 0.03; for (const th of things) if (ray.intersectObject(th.o, true).length) { cov++; by = th.name; break; } }
        const key = `${s.id}:crowd:${by}`; if (cov / 17 > 0.25 && !faceFlag.has(key)) { faceFlag.add(key); bad.push(`${at}: a face in the crowd is ${Math.round((100 * cov) / 17)} % behind the ${by}`); } }
      prev = now; } } } finally { AUDIT.on = false; CROWD_LOG.on = false; }
  return { bad, held, spots };
};
/** the uses whose thing is meant to be at the face (the face check lets them cover it) */
const AT_FACE = new Set(["look", "aim", "blow", "eat", "drink", "tie", "tuck", "don"]);

// ---------------- long things in two hands, and a shield on the arm ----------------
/** where the hands lie on a long thing held in two (metres along it): the rear hand this far from the butt, the front hand this much further on */
export const POLE = { back: 0.32, gap: 0.5 };
/** A long thing held in two hands (a trident, a referee's stick): the shaft runs through both fists along the line from the rear hand toward
 *  `aim` in the picture, its butt `back` behind the rear hand. `o` = the model (butt at the origin, shaft along +x), `len` = its length (the
 *  front hand must be on it). The rear hand is `rear`; the other holds it `gap` further on (`one` = the rear hand only) */
export const pole = (into: THREE.Group, o: THREE.Object3D, a: Staged, cam: Cam, rear: Side, aim: V3, opt: { back?: number; gap?: number; one?: boolean; len?: number; name?: string; /** "thrust" = driven at someone (the check then wants his face turned to it when he is seen from the front) */ use?: string } = {}) => {
  const P2 = pic(cam), back = opt.back ?? POLE.back, front: Side = rear === "L" ? "R" : "L", pr = palm(a, rear), d = unit(P2(pr, aim)), butt = aside(pr, cam, -d[0] * back, -d[1] * back);
  span(into, o, butt, aside(butt, cam, d[0], d[1]), cam, 0.05); fingers(into, a, opt.one ? [rear] : [rear, front], cam, 0.17);
  if (AUDIT.on) { const lie = (s: Side) => { const v = P2(butt, palm(a, s)); return { off: Math.abs(v[0] * d[1] - v[1] * d[0]), along: dot(v, d), r: fistR(a, s, cam) }; }, r = lie(rear), f = opt.one ? null : lie(front), len = opt.len ?? 1.4;
    const err = r.off > r.r ? `the rear hand is ${(r.off * 100).toFixed(0)} cm off the shaft` : f && f.off > f.r ? `the front hand is ${(f.off * 100).toFixed(0)} cm off the shaft` : f && (f.along < r.along + 0.15 || f.along > len) ? "the front hand is not further along the shaft than the rear hand" : opt.use === "thrust" ? frontThrust(a, cam) : null;
    AUDIT.rows.push({ id: o.uuid, prop: opt.name ?? "pole", use: opt.use ?? "two hands", holder: `${a.name} ${opt.one ? rear : `${rear}+${front}`}`, err, at: palm(a, rear), o }); }
  return o;
};
/** The arms of a figure holding a long thing in two hands: the rear hand at `grip` (a point in the world: at his hip for a thrust, at his
 *  chest to hold it across), the front hand `gap` further on along the line toward `aim` in the picture (for a mover's actAt) */
export const polePose = (s: Stand, rear: Side, grip: V3, aim: V3, gap = POLE.gap): Partial<Pose> => {
  const sp = { at: s.at, heading: s.heading, h: s.h }, base = (s.pose ?? {}) as Pose, d = unit(pic(s.cam)(grip, aim)), front: Side = rear === "L" ? "R" : "L";
  return { [rear === "L" ? "armL" : "armR"]: reachArm(s.D, base, {}, sp, s.cam.pos, rear, grip), [front === "L" ? "armL" : "armR"]: reachArm(s.D, base, {}, sp, s.cam.pos, front, aside(grip, s.cam, d[0] * gap, d[1] * gap)) } as Partial<Pose>;
};
/** the arm that carries a shield: the upper arm down and a little forward, the forearm level across his belly, so that the fist (behind
 *  the shield's boss) is in front of that side of his body and the shield covers it */
export const SHIELD_ARM = A(24, 8, 92, -30);
/** The scutum on the arm (props.ts scutum): its grip behind the boss in the fist of `side`, upright, its face turned half way between the
 *  lens and the way the holder faces, so that from the front it covers him and from the side it is seen foreshortened in front of him.
 *  Seen from behind, it is on his far side */
export const shieldOn = (into: THREE.Group, o: THREE.Object3D, a: Staged, side: Side, cam: Cam, opt: { tilt?: number; /** his face acts in this shot (he is beaten, he speaks, he reaches out): the shield must stay below his chin */ acting?: boolean } = {}) => {
  const h = (a.heading * Math.PI) / 180, fx = Math.sin(h), fz = Math.cos(h), pm = palm(a, side), cx = cam.pos[0] - pm[0], cz = cam.pos[2] - pm[2], cn = Math.hypot(cx, cz) || 1, toward = (fx * cx + fz * cz) / cn;
  let nx = fx + cx / cn, nz = fz + cz / cn; if (Math.hypot(nx, nz) < 0.3) { nx = fx; nz = fz; }
  const p = near(pm, cam, toward < -0.2 ? -0.16 : 0.08); o.position.set(p[0], p[1], p[2]); o.rotation.set(0, Math.atan2(nx, nz), 0); o.rotateX(((opt.tilt ?? 0) * Math.PI) / 180); into.add(o);
  if (AUDIT.on) {
    // in front of him (not on his far side seen from behind), the shield must leave his eyes free; when his face acts, his chin too
    const covers = (q: V3 | null | undefined) => { if (!q) return false; const hl = boxHull(o, cam, q); return !!hl && outside(hl) === 0; };
    const eyes = [a.mark?.("eyeA"), a.mark?.("eyeB")], chin = mix3(a.joint("neck"), a.joint("skull"), 0.45);
    const err = toward < -0.2 ? null : eyes.some(covers) ? "the shield hides his eyes" : opt.acting && covers(chin) ? "his face acts in this shot, but the shield covers it above his chin: lower the shield or turn it" : null;
    AUDIT.rows.push({ id: o.uuid, prop: "shield", use: "on arm", holder: `${a.name} ${side}`, err, at: pm, o }); }
  return o;
};

