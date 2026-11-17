// Held things. Every prop has a grip and a direction, and a figure holds it in a named way (a "use"): the pose of the arm that
// holds it, how the thing lies in the hand, and where its working end may point. `wield` puts the thing in the hand for a use,
// lays the fingers over it, and notes it for the script check (`auditGrips`, run by scripts/film_info.mjs <film> grips), which
// reads every frame of a film: the grip must lie in the hand, and the working end must point within what the use allows.
// A prop is modelled with its grip at the origin, its working end along +x and its top along +y (world/props.ts).
import * as THREE from "three";
import type { Film, Cam, V3, Staged } from "./film";
import { mix3 } from "./film";
import { grip, palm, fingers, eyeOf, span, near, aside } from "./staging";
import { figureCard, reachArm, pointArm, bareJoints } from "../world/people";
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
export type Prop = { name: string; uses: Record<string, Use> };
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
/** the sabre (props.ts sabre): held by the hilt, the blade away from the body; lowered, the point is down and forward */
export const SABRE: Prop = { name: "sabre", uses: {
  ready: { arm: A(46, 24, 92, 20), turn: 52, ok: within(20, 85, "a sabre at the ready has its blade up and away from the body") },
  raised: { arm: A(150, 34, 186, 14), level: 72, ok: within(45, 110, "a raised sabre points up") },
  lowered: { arm: A(14, 14, 30, 8), level: -58, ok: within(-85, -30, "a lowered sabre has its point down and forward") },
  /** being drawn: the blade still down along the scabbard it comes out of */
  draw: { arm: A(34, -24, 70, -70), level: -100, ok: within(-150, -55, "a sabre being drawn points down along its scabbard") },
  /** a cut: drawn back over the shoulder, then brought down through what it cuts */
  chop: { arm: A(165, 22, 222, 8), level: 128, ok: within(95, 170, "a sabre drawn back to cut points up and back over his shoulder") },
  struck: { arm: A(62, 16, 68, 8), level: -26, ok: within(-65, 5, "after the cut the blade points down and forward") },
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

/** what the script check has seen in the frame it is reading: one row per thing in a hand, falling or set down */
export const AUDIT: { on: boolean; rows: { id: string; prop: string; use: string; holder: string; err: string | null; at?: V3 }[] } = { on: false, rows: [] };
const pic = (cam: Cam) => { const fx = cam.look[0] - cam.pos[0], fz = cam.look[2] - cam.pos[2], n = Math.hypot(fx, fz) || 1; return (p: V3, q: V3): [number, number] => [((q[0] - p[0]) * -fz + (q[2] - p[2]) * fx) / n, q[1] - p[1]]; };
const unit = (v: [number, number]): [number, number] => { const n = Math.hypot(v[0], v[1]) || 1; return [v[0] / n, v[1] / n]; };
const chest = (a: Staged) => mix3(a.joint("pelvis"), a.joint("neck"), 0.75);
const wr = (s: Side) => (s === "L" ? "wrL" : "wrR") as "wrL", tp = (s: Side) => (s === "L" ? "tipL" : "tipR") as "tipL", el = (s: Side) => (s === "L" ? "elL" : "elR") as "elL", sh = (s: Side) => (s === "L" ? "shL" : "shR") as "shL";
const fistR = (a: Staged, s: Side, cam: Cam) => 0.5 * Math.hypot(...pic(cam)(a.joint(wr(s)), a.joint(tp(s))));
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
export const wield = (into: THREE.Group, o: THREE.Object3D, P: Prop, use: string, a: Staged, side: Side, cam: Cam, opt: { d?: number; blend?: [string, number]; /** the grip lies this far along the thing's own x from its origin (a spyglass held by its middle) */ at?: number } = {}) => {
  const P2 = pic(cam), s = outward(a, side, cam), f = unit(P2(a.joint(el(side)), a.joint(wr(side))));
  const local = (U: Use): number => (U.level !== undefined ? U.level : ang([f[0] * s, f[1]]) + (U.turn ?? 0));
  let deg = local(P.uses[use]); if (opt.blend) { let to = local(P.uses[opt.blend[0]]); while (to - deg > 180) to -= 360; while (to - deg < -180) to += 360; deg += (to - deg) * opt.blend[1]; }
  const r = (deg * Math.PI) / 180, mine: [number, number] = [Math.cos(r), Math.sin(r)];
  grip(into, o, a, side, cam, [mine[0] * s, mine[1]], { d: opt.d, lean: s });
  if (opt.at) o.position.sub(new THREE.Vector3(opt.at * o.scale.x, 0, 0).applyQuaternion(o.quaternion));
  const gp: V3 = opt.at ? (new THREE.Vector3(opt.at * o.scale.x, 0, 0).applyQuaternion(o.quaternion).add(o.position).toArray() as V3) : [o.position.x, o.position.y, o.position.z];
  if (AUDIT.on) { const off = Math.hypot(...P2(palm(a, side), gp)), w = new THREE.Vector3(1, 0, 0).applyQuaternion(o.quaternion), seen = unit(P2([0, 0, 0], [w.x, w.y, w.z]));
    const err = off > fistR(a, side, cam) ? `the grip is ${(off * 100).toFixed(0)} cm from the hand` : opt.blend && opt.blend[1] > 0.02 && opt.blend[1] < 0.98 ? null : (opt.blend && opt.blend[1] >= 0.98 ? P.uses[opt.blend[0]] : P.uses[use]).ok([seen[0] * s, seen[1]]);
    AUDIT.rows.push({ id: o.uuid, prop: P.name, use, holder: `${a.name} ${side}`, err, at: palm(a, side) }); }
  return o;
};
/** the hands of a figure on a spyglass that points at `target`: the far hand is the one on the side he looks to */
const spyHands = (shL: V3, shR: V3, eye: V3, target: V3, cam: Cam): { near: Side; far: Side } => { const P2 = pic(cam), d = unit(P2(eye, target)); return dot(P2(eye, shL), d) > dot(P2(eye, shR), d) ? { near: "R", far: "L" } : { near: "L", far: "R" }; };
/** how far from the eye the two hands lie on the tube (metres): the near hand just clear of the face, the far hand supporting */
const SPY = { near: 0.2, far: 0.42, /** the eye end lies this far back past the middle of the eye, so that its cup covers the eye */ cup: 0.022 };
/** the eye a figure at `at` shuts when he puts a spyglass to it and looks at `target` (for his face: `shut`) */
export const spyEye = (cam: Cam, at: V3, target: V3): -1 | 1 => (pic(cam)(at, target)[0] >= 0 ? 1 : -1);
/** The spyglass in use: its small eye end on the figure's eye (the eye on the side of `target`), the wide end away from his face,
 *  the tube from his eye toward what he looks at, and his two hands closed round it (`one` = only the near hand). `o` = the
 *  spyglass model (eye end at the origin, tube along +x); `len` = its length as drawn */
export const spy = (into: THREE.Group, o: THREE.Object3D, a: Staged, cam: Cam, target: V3, opt: { one?: boolean; len?: number } = {}) => {
  const P2 = pic(cam), e0 = eyeOf(a, cam, target), H = spyHands(a.joint("shL"), a.joint("shR"), e0, target, cam), d = unit(P2(e0, target)), eye = aside(near(e0, cam, 0.07), cam, -d[0] * SPY.cup, -d[1] * SPY.cup), len = opt.len ?? 0.58;
  span(into, o, eye, aside(eye, cam, d[0], d[1]), cam, 0); fingers(into, a, opt.one ? [H.near] : [H.near, H.far], cam, 0.24);
  if (AUDIT.on) { const lie = (s: Side) => { const v = P2(e0, palm(a, s)); return { off: Math.abs(v[0] * d[1] - v[1] * d[0]), along: dot(v, d), r: fistR(a, s, cam) }; }, n1 = lie(H.near), n2 = opt.one ? null : lie(H.far);
    const err = a.mark && !a.mark("eyeA") && !a.mark("eyeB") ? "the eye it is put to is not in view" : !(Math.abs(a.o.face?.shut ?? 0) > 0.5 && Math.sign(a.o.face?.shut ?? 0) === spyEye(cam, a.at, target)) ? "the eye at the eyepiece is open beside it (face.shut = spyEye)" : n1.off > n1.r ? `the near hand is ${(n1.off * 100).toFixed(0)} cm off the tube` : n1.along < 0.08 || n1.along > len ? "the near hand is not on the tube" : n2 && n2.off > n2.r ? `the supporting hand is ${(n2.off * 100).toFixed(0)} cm off the tube` : n2 && (n2.along > len || n2.along < n1.along + 0.08) ? "the supporting hand is not further out on the tube" : null;
    AUDIT.rows.push({ id: o.uuid, prop: "spyglass", use: "look", holder: `${a.name} ${opt.one ? H.near : `${H.near}+${H.far}`}`, err, at: mix3(e0, palm(a, opt.one ? H.near : H.far), 0.5) }); }
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
const scabbardAt = (a: Body, side: Side, cam: Cam) => {
  const P2 = pic(cam), h = (a.heading * Math.PI) / 180, fwd = P2([0, 0, 0], [Math.sin(h), 0, Math.cos(h)])[0], hip = a.joint(side === "L" ? "hipL" : "hipR"), other = a.joint(side === "L" ? "hipR" : "hipL");
  // seen from the side, a sabre at the far hip lies behind him: only the hilt shows in front of his belly and the sheath behind his legs
  const toCam = [cam.pos[0] - a.at[0], cam.pos[2] - a.at[2]], leftNear = Math.cos(h) * toCam[0] - Math.sin(h) * toCam[1] > 0, farHip = (side === "L") !== leftNear;
  const front = Math.abs(fwd) < 0.35, out = P2(other, hip)[0] >= 0 ? 1 : -1, at: V3 = [hip[0], hip[1] + 0.07, hip[2]], p = near(front ? aside(at, cam, out * 0.11) : farHip ? aside(at, cam, Math.sign(fwd) * 0.11, -0.02) : at, cam, !front && farHip ? -0.08 : 0.04);
  const lie = front ? -90 + out * 15 : (fwd > 0 ? -1 : 1) * (farHip ? 145 : 128) + (fwd > 0 ? 0 : 180);
  return { p, lie, front, farHip, out, at };
};
/** where the grip of a sheathed sabre is (for the hand that draws it): 8 cm up the hilt from the scabbard's throat */
export const hiltAt = (a: Body, side: Side, cam: Cam): V3 => { const S = scabbardAt(a, side, cam), r = (S.lie * Math.PI) / 180; return aside(S.p, cam, -0.08 * Math.cos(r), -0.08 * Math.sin(r)); };
/** the hilt of a sheathed sabre, for a figure that is not on the stage yet (to solve the arm that draws it) */
export const hiltFor = (s: Stand, side: Side): V3 => hiltAt({ joint: bare(s), heading: s.heading, at: s.at }, side, s.cam);
export const sheathed = (into: THREE.Group, o: THREE.Object3D, a: Staged, side: Side, cam: Cam, opt: { drawn?: boolean } = {}) => {
  const S = scabbardAt(a as unknown as Body, side, cam), fx = cam.look[0] - cam.pos[0], fz = cam.look[2] - cam.pos[2];
  o.position.set(S.p[0], S.p[1], S.p[2]); o.rotation.set(0, Math.atan2(-fx, -fz), (S.lie * Math.PI) / 180);
  o.traverse((c) => { if (c.userData.layer === "back") { c.userData.z0 ??= c.position.z; c.position.z = c.userData.z0 - (S.front || !S.farHip ? 0.14 : 0); } if (c.userData.hilt) c.visible = !opt.drawn; });
  // the baldric: over the other shoulder, across his chest, down to the frog that holds the scabbard
  const top = a.joint(sh(side === "L" ? "R" : "L"));
  strap(into, o, [top[0], top[1] + 0.05, top[2]], S.front ? aside(S.p, cam, -S.out * 0.02, 0.02) : S.p, cam, 0.035);
  if (AUDIT.on) AUDIT.rows.push({ id: o.uuid, prop: "sabre", use: opt.drawn ? "scabbard" : "sheathed", holder: "", err: null, at: S.at });
  into.add(o); return o;
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
    AUDIT.rows.push({ id: fid.uuid, prop: "fiddle", use: "play", holder: `${a.name} L`, err: off > fistR(a, "L", cam) ? `the left hand is ${(off * 100).toFixed(0)} cm off the neck` : along < 0.3 || along > 0.58 ? "the left hand is not on the neck" : null, at: mix3(F.chin, palm(a, "L"), 0.5) });
    if (bow) AUDIT.rows.push({ id: bow.uuid, prop: "bow", use: "play", holder: `${a.name} R`, err: vv < 0.16 || vv > 0.34 ? "the bow does not cross the strings between the bridge and the fingerboard" : u < 0.12 || u > 0.6 ? "the bow touches the strings outside its own length" : null, at: F.bowAt }); }
};
/** The cithara held upright against his left side, leaning a little out: his left hand on its outer arm, and when he plays his right
 *  hand on the strings. `o` = props.ts cithara (its foot at the origin, `h` high, its face toward +z) */
const citharaAt = (j: (n: string) => V3, cam: Cam, heading: number, h: number, out = 0.12) => {
  const side = leftward(j, cam, heading), tilt = -side * 0.21, base = aside(mix3(j("pelvis"), j("neck"), -0.06), cam, side * out), w = h * 0.62;
  const P = (ix: number, iy: number) => aside(base, cam, ix * Math.cos(tilt) - iy * Math.sin(tilt), ix * Math.sin(tilt) + iy * Math.cos(tilt));
  return { side, tilt, base, arm: P(side * w * 0.37, h * 0.6), strings: P(-side * w * 0.04, h * 0.56) };
};
/** where a figure's cithara stands as he holds it: its foot, its tilt, and a point on it (ix across, iy up, in metres) */
export const citharaPlace = (a: Staged, cam: Cam, h = 0.62, out = 0.12) => { const C = citharaAt(J(a), cam, a.heading, h, out); return { base: C.base, tilt: C.tilt, side: C.side }; };
/** the right arm of a figure whose finger is on string i (0..6) of the cithara he holds */
export const pluckPose = (s: Stand, i: number, h = 0.62, out = 0.12): Partial<Pose> => { const C = citharaAt(bare(s), s.cam, s.heading, h, out), w = h * 0.62, x = (i - 3) * w * 0.085, y = h * 0.56;
  return reach(s, "R", aside(C.base, s.cam, x * Math.cos(C.tilt) - y * Math.sin(C.tilt), x * Math.sin(C.tilt) + y * Math.cos(C.tilt))); };
export const citharaPose = (s: Stand, play: boolean, h = 0.62, out = 0.12): Partial<Pose> => { const C = citharaAt(bare(s), s.cam, s.heading, h, out); return { ...reach(s, "L", C.arm), ...(play ? reach(s, "R", C.strings) : {}) } as Partial<Pose>; };
export const citharaHold = (into: THREE.Group, o: THREE.Object3D, a: Staged, cam: Cam, play: boolean, h = 0.62, opt: { d?: number; /** how far out at his side it stands (metres) */ out?: number } = {}) => {
  const C = citharaAt(J(a), cam, a.heading, h, opt.out), d = opt.d ?? 0.06; span(into, o, C.base, aside(C.base, cam, Math.cos(C.tilt), Math.sin(C.tilt)), cam, d); fingers(into, a, ["L"], cam, d + 0.09);
  if (play) fingers(into, a, ["R"], cam, d + 0.22, true);      // the playing hand lies on the strings, all of it well in front of them (a lens close below sees the planes slant)
  if (AUDIT.on) { const P2 = pic(cam), offL = Math.hypot(...P2(C.arm, palm(a, "L"))), offR = Math.hypot(...P2(C.strings, palm(a, "R")));
    AUDIT.rows.push({ id: o.uuid, prop: "cithara", use: play ? "play" : "hold", holder: `${a.name} L`, err: offL > fistR(a, "L", cam) + h * 0.62 * 0.05 + 0.03 ? `the left hand is ${(offL * 100).toFixed(0)} cm from the cithara's arm`      /* the fist touches the arm when it is within its own radius and half the arm's width of the arm's middle */ : play && offR > 0.16 ? `the right hand is ${(offR * 100).toFixed(0)} cm from the strings` : null, at: mix3(C.arm, C.strings, 0.5) }); }
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
export const carryBy = (into: THREE.Group, o: THREE.Object3D, a: Staged, sa: Side, b: Staged, sb: Side, cam: Cam, d = 0.1) => {
  let pa = palm(a, sa), pb = palm(b, sb); const P2 = pic(cam); if (P2(pa, pb)[0] < 0) [pa, pb] = [pb, pa];
  const g = o.userData.grips as V3[], G = Math.abs(g[1][0] - g[0][0]), hy = g[0][1], v = P2(pa, pb), n = Math.hypot(v[0], v[1]) || 1, dir: [number, number] = [v[0] / n, v[1] / n];
  const origin = aside(mix3(pa, pb, 0.5), cam, hy * dir[1], -hy * dir[0]); span(into, o, origin, aside(origin, cam, dir[0], dir[1]), cam, d);
  const fd = d + ((o.userData.depth as number) ?? 0.1) / 2 + 0.2;      // the fingers well in front of the whole chest (its corners reach nearer the lens than its face), so that the hand in the ring shows
  if (a === b) fingers(into, a, [sa, sb], cam, fd); else { fingers(into, a, [sa], cam, fd); fingers(into, b, [sb], cam, fd); }
  if (AUDIT.on) { const err = Math.abs(n - G) > 0.1 ? `the hands are ${(Math.abs(n - G) * 100).toFixed(0)} cm too ${n > G ? "far apart" : "close together"} for the handles` : null;
    if (a === b) AUDIT.rows.push({ id: o.uuid, prop: "chest", use: "carry", holder: `${a.name} ${sa}+${sb}`, err, at: pa });
    else AUDIT.rows.push({ id: `${o.uuid}:a`, prop: "chest", use: "carry", holder: `${a.name} ${sa}`, err, at: pa }, { id: `${o.uuid}:b`, prop: "chest", use: "carry", holder: `${b.name} ${sb}`, err, at: pb }); }
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
  if (AUDIT.on) AUDIT.rows.push({ id: o.uuid, prop: "bundle", use: "shoulder", holder: `${a.name} ${side}`, err: null, at: palm(a, side) });
  return o;
};
/** the bundle back in its place below the knot, for carrying it in the hand with `wield` */
export const inHand = (o: THREE.Object3D, r = 0.2) => { const sack = o.getObjectByName("sack"); if (sack) sack.position.set(0, -r * 0.82, 0); return o; };

/** runs something without noting it for the script check (a thing placed only to find out where its end would be) */
export const quiet = <T,>(f: () => T): T => { const on = AUDIT.on; AUDIT.on = false; try { return f(); } finally { AUDIT.on = on; } };
/** A thing on its way from one hold to another (from the eye to the hand, from one hand to the other): it is put both ways, and laid
 *  k of the way from the first to the second; the fingers of the nearer hold are kept. `holder` names the hands on it meanwhile
 *  ("mc R+L" while it changes hands) */
export const blend = (into: THREE.Group, o: THREE.Object3D, k: number, A: (g: THREE.Group) => void, B: (g: THREE.Group) => void, P: string, holder: string, at?: V3) => {
  const ga = new THREE.Group(), gb = new THREE.Group();
  quiet(() => A(ga)); const pa = o.position.clone(), qa = o.quaternion.clone();
  quiet(() => B(gb)); const pb = o.position.clone(), qb = o.quaternion.clone();
  o.position.lerpVectors(pa, pb, k); o.quaternion.slerpQuaternions(qa, qb, k);
  const keep = k < 0.5 ? ga : gb, drop = k < 0.5 ? gb : ga;
  for (const c of [...keep.children]) if (c !== o) into.add(c);
  drop.traverse((c) => { const m = c as THREE.Mesh; if (!m.isMesh || c === o || o.getObjectById(c.id)) return; m.geometry?.dispose(); for (const mat of (Array.isArray(m.material) ? m.material : [m.material]) as THREE.MeshBasicMaterial[]) { mat.map?.dispose(); mat.dispose(); } });
  into.add(o);
  if (AUDIT.on) AUDIT.rows.push({ id: o.uuid, prop: P, use: "between", holder, err: null, at: at ?? [o.position.x, o.position.y, o.position.z] });
  return o;
};
/** a thing that is gone from a hand by magic (it burns away, it shrinks into the fist): noted as put away, not dropped */
export const vanish = (o: THREE.Object3D, P: Prop | string) => { if (AUDIT.on) AUDIT.rows.push({ id: o.uuid, prop: typeof P === "string" ? P : P.name, use: "gone", holder: "", err: null }); };
/** which way a thing held in this hand is laid (true = turned over, its working end to the left), for letGo's `mirror` */
export const heldOver = (a: Staged, side: Side, cam: Cam) => outward(a, side, cam) < 0;

/** The script check. Stages every figure of every shot on every tenth of a second, lets the shot put its things in their hands, and
 *  lists what is wrong: a grip that is not in the hand, a working end outside what the use allows, a thing that changes hand from
 *  one frame to the next, and a thing that leaves a hand without being set down, thrown or dropped. Needs a `document`
 *  (scripts/film_info.mjs gives it a stand-in that keeps count of the canvas transforms, so that the eyes are where they are drawn) */
/** two holders share a hand ("mc R" and "mc R+L"): a thing that passes from hand to hand through both hands */
const shares = (a: string, b: string) => a.split(" & ").some((pa) => b.split(" & ").some((pb) => { const [na, ha] = pa.split(" "), [nb, hb] = pb.split(" "); return na === nb && !!ha && !!hb && ha.split("+").some((h) => hb.split("+").includes(h)); }));
export const auditGrips = (film: Film, step = 0.1) => {
  const bad: string[] = [], spots: { shot: string; frame: number; prop: string; use: string; holder: string; x: number; y: number }[] = []; let held = 0; AUDIT.on = true;
  const lensOf = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.1, 900);
  try { for (const s of film.shots) { let prev = new Map<string, { holder: string; prop: string }>();
    for (let t = 0; t < s.b - s.a - 1e-6; t += step) {
      AUDIT.rows = []; const cam = s.cam(t, t / (s.b - s.a)), g = new THREE.Group(), staged: Record<string, Staged> = {};
      for (const a of s.cast(t, s.a + t)) { const p = figureCard(a.D, a.pose, a.o, { at: a.at, heading: a.heading, h: a.h }, cam.pos); staged[a.name] = { ...a, joint: p.joint, mesh: p.mesh, mark: p.mark }; }
      s.things?.(g, staged, t, s.a + t, cam); const now = new Map<string, { holder: string; prop: string }>(), at = `${s.id} at ${t.toFixed(1)} s`;
      lensOf.fov = cam.fov; lensOf.position.set(...cam.pos); lensOf.lookAt(...cam.look); lensOf.updateProjectionMatrix(); lensOf.updateMatrixWorld(true);
      for (const r of AUDIT.rows) { now.set(r.id, { holder: r.holder, prop: r.prop }); if (r.holder) held++; if (r.err) bad.push(`${at}: ${r.holder}'s ${r.prop} (${r.use}): ${r.err}`);
        if (r.at) { const q = new THREE.Vector3(...r.at).project(lensOf); spots.push({ shot: s.id, frame: Math.round((s.a + t) * film.fps), prop: r.prop, use: r.use, holder: r.holder, x: Math.round((q.x * 0.5 + 0.5) * 1080), y: Math.round((0.5 - q.y * 0.5) * 1920) }); } }
      for (const [id, was] of prev) { if (!was.holder) continue; const is = now.get(id);
        if (!is) bad.push(`${at}: the ${was.prop} leaves ${was.holder}'s hand without being set down, thrown or dropped`);
        else if (is.holder && is.holder !== was.holder && !shares(was.holder, is.holder) && is.holder.split(" ")[0] !== was.holder.split(" ")[0]) bad.push(`${at}: the ${was.prop} jumps from ${was.holder} to ${is.holder} between two frames`);
        else if (is.holder && is.holder !== was.holder && !shares(was.holder, is.holder)) bad.push(`${at}: the ${was.prop} changes hand (${was.holder} to ${is.holder}) between two frames`); }
      prev = now; } } } finally { AUDIT.on = false; }
  return { bad, held, spots };
};
