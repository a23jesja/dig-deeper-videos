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
  lowered: { arm: A(12, 12, 26, 6), level: -62, ok: within(-85, -35, "a lowered pistol points down and forward") },
} };
/** the sabre (props.ts sabre): held by the hilt, the blade away from the body; lowered, the point is down and forward */
export const SABRE: Prop = { name: "sabre", uses: {
  ready: { arm: A(46, 24, 92, 20), turn: 52, ok: within(20, 85, "a sabre at the ready has its blade up and away from the body") },
  raised: { arm: A(150, 34, 186, 14), level: 72, ok: within(45, 110, "a raised sabre points up") },
  lowered: { arm: A(14, 14, 30, 8), level: -58, ok: within(-85, -30, "a lowered sabre has its point down and forward") },
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

/** what the script check has seen in the frame it is reading: one row per thing in a hand, falling or set down */
export const AUDIT: { on: boolean; rows: { id: string; prop: string; use: string; holder: string; err: string | null; at?: V3 }[] } = { on: false, rows: [] };
const pic = (cam: Cam) => { const fx = cam.look[0] - cam.pos[0], fz = cam.look[2] - cam.pos[2], n = Math.hypot(fx, fz) || 1; return (p: V3, q: V3): [number, number] => [((q[0] - p[0]) * -fz + (q[2] - p[2]) * fx) / n, q[1] - p[1]]; };
const unit = (v: [number, number]): [number, number] => { const n = Math.hypot(v[0], v[1]) || 1; return [v[0] / n, v[1] / n]; };
const chest = (a: Staged) => mix3(a.joint("pelvis"), a.joint("neck"), 0.75);
const wr = (s: Side) => (s === "L" ? "wrL" : "wrR") as "wrL", tp = (s: Side) => (s === "L" ? "tipL" : "tipR") as "tipL", el = (s: Side) => (s === "L" ? "elL" : "elR") as "elL", sh = (s: Side) => (s === "L" ? "shL" : "shR") as "shL";
const fistR = (a: Staged, s: Side, cam: Cam) => 0.5 * Math.hypot(...pic(cam)(a.joint(wr(s)), a.joint(tp(s))));
/** which way is away from the holder's body for a hand, in the picture: +1 = to the right, -1 = to the left. The side of his chest
 *  the hand is on; for a hand in front of his chest, the way he faces */
const outward = (a: Staged, side: Side, cam: Cam) => { const P2 = pic(cam), h = (a.heading * Math.PI) / 180, face = P2([0, 0, 0], [Math.sin(h), 0, Math.cos(h)])[0], off = P2(chest(a), palm(a, side))[0]; return off + face * 0.25 >= 0 ? 1 : -1; };
/** the pose pieces of a use for a mover's actAt: the arm that holds the thing */
export const usePose = (P: Prop, use: string, side: Side): Partial<Pose> => (side === "L" ? { armL: P.uses[use].arm } : { armR: P.uses[use].arm }) as Partial<Pose>;
/** Puts a prop in a figure's hand for one of its uses: the grip in the closed fingers, the working end where the use says, the top
 *  up, the fingers and the thumb laid over it. `o` = the prop's model (grip at the origin, working end along +x, top along +y).
 *  `blend` = [another use, 0..1] turns it part of the way toward that use (a pistol coming down, a mug going to the mouth) */
export const wield = (into: THREE.Group, o: THREE.Object3D, P: Prop, use: string, a: Staged, side: Side, cam: Cam, opt: { d?: number; blend?: [string, number] } = {}) => {
  const P2 = pic(cam), s = outward(a, side, cam), f = unit(P2(a.joint(el(side)), a.joint(wr(side))));
  const local = (U: Use): number => (U.level !== undefined ? U.level : ang([f[0] * s, f[1]]) + (U.turn ?? 0));
  let deg = local(P.uses[use]); if (opt.blend) { let to = local(P.uses[opt.blend[0]]); while (to - deg > 180) to -= 360; while (to - deg < -180) to += 360; deg += (to - deg) * opt.blend[1]; }
  const r = (deg * Math.PI) / 180, mine: [number, number] = [Math.cos(r), Math.sin(r)];
  grip(into, o, a, side, cam, [mine[0] * s, mine[1]], { d: opt.d, lean: s });
  if (AUDIT.on) { const off = Math.hypot(...P2(palm(a, side), [o.position.x, o.position.y, o.position.z])), w = new THREE.Vector3(1, 0, 0).applyQuaternion(o.quaternion), seen = unit(P2([0, 0, 0], [w.x, w.y, w.z]));
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
    AUDIT.rows.push({ id: o.uuid, prop: "spyglass", use: "look", holder: a.name, err, at: mix3(e0, palm(a, opt.one ? H.near : H.far), 0.5) }); }
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
/** A thing that has left a hand: dropped or thrown, it falls and lands (see `fallen`). `o` is put where it is t seconds after it was
 *  let go at `p0`, turning in the picture's plane as it falls; `rest` = the angle it lies at on the floor (degrees from level) */
export const letGo = (into: THREE.Group, o: THREE.Object3D, P: Prop | string, p0: V3, v0: V3, t: number, floor: number, cam: Cam, opt: { bounce?: number; spin?: number; rest?: number; from?: number } = {}) => {
  const f = fallen(p0, v0, t, floor, opt), still = t >= f.t1 + 0.25, a0 = ((opt.from ?? 0) * Math.PI) / 180, a = still ? ((opt.rest ?? 0) * Math.PI) / 180 : a0 + f.turn;
  span(into, o, f.at, aside(f.at, cam, Math.cos(a), Math.sin(a)), cam, 0);
  if (AUDIT.on) AUDIT.rows.push({ id: o.uuid, prop: typeof P === "string" ? P : P.name, use: f.landed ? "landed" : "falling", holder: "", err: null });
  return f;
};
/** A thing set down on something: it stands at `p` (its own origin) and is noted as put down, not dropped */
export const setDown = (into: THREE.Group, o: THREE.Object3D, P: Prop | string, p: V3, cam: Cam, level = 0) => {
  const r = (level * Math.PI) / 180; span(into, o, p, aside(p, cam, Math.cos(r), Math.sin(r)), cam, 0);
  if (AUDIT.on) AUDIT.rows.push({ id: o.uuid, prop: typeof P === "string" ? P : P.name, use: "down", holder: "", err: null });
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
/** The arm of a figure that aims a thing (a pistol) at `target`: stretched out from the shoulder straight at it */
export const aimPose = (s: Stand, target: V3, side: Side = "R"): Partial<Pose> => {
  const sp = { at: s.at, heading: s.heading, h: s.h }, base = (s.pose ?? {}) as Pose, j = bareJoints(s.D, base, {}, sp, s.cam.pos).joint;
  const a = pointArm(s.D, base, {}, sp, s.cam.pos, side, unit(pic(s.cam)(j(sh(side)), target)));
  return (side === "L" ? { armL: a } : { armR: a }) as Partial<Pose>;
};
/** A sabre in its scabbard at the hip of `side`: the hilt and the frog at his belt, the sheath hanging behind him, so that it never
 *  crosses a leg. Seen from the front it hangs down the outside of his thigh; seen from the side it slants down and back and shows
 *  behind him, and at the far hip the whole of it lies behind his body (the hilt shows in front of his belly). `o` = props.ts scabbard (the throat at the origin, the sheath along +x, the hilt along -x) */
export const sheathed = (into: THREE.Group, o: THREE.Object3D, a: Staged, side: Side, cam: Cam) => {
  const P2 = pic(cam), h = (a.heading * Math.PI) / 180, fwd = P2([0, 0, 0], [Math.sin(h), 0, Math.cos(h)])[0], hip = a.joint(side === "L" ? "hipL" : "hipR"), other = a.joint(side === "L" ? "hipR" : "hipL");
  // seen from the side, a sabre at the far hip lies behind him: only the hilt shows in front of his belly and the sheath behind his legs
  const toCam = [cam.pos[0] - a.at[0], cam.pos[2] - a.at[2]], leftNear = Math.cos(h) * toCam[0] - Math.sin(h) * toCam[1] > 0, farHip = (side === "L") !== leftNear;
  const front = Math.abs(fwd) < 0.35, out = P2(other, hip)[0] >= 0 ? 1 : -1, at: V3 = [hip[0], hip[1] + 0.07, hip[2]], p = near(front ? aside(at, cam, out * 0.11) : farHip ? aside(at, cam, Math.sign(fwd) * 0.11, -0.02) : at, cam, !front && farHip ? -0.08 : 0.04);
  const fx = cam.look[0] - cam.pos[0], fz = cam.look[2] - cam.pos[2], lie = front ? -90 + out * 15 : (fwd > 0 ? -1 : 1) * (farHip ? 145 : 128) + (fwd > 0 ? 0 : 180);
  o.position.set(p[0], p[1], p[2]); o.rotation.set(0, Math.atan2(-fx, -fz), (lie * Math.PI) / 180);
  if (front || !farHip) o.traverse((c) => { if (c.userData.layer === "back") { c.userData.z0 ??= c.position.z; c.position.z = c.userData.z0 - 0.14; } });
  if (AUDIT.on) AUDIT.rows.push({ id: o.uuid, prop: "sabre", use: "sheathed", holder: "", err: null, at });
  into.add(o); return o;
};
/** The script check. Stages every figure of every shot on every tenth of a second, lets the shot put its things in their hands, and
 *  lists what is wrong: a grip that is not in the hand, a working end outside what the use allows, a thing that changes hand from
 *  one frame to the next, and a thing that leaves a hand without being set down, thrown or dropped. Needs a `document`
 *  (scripts/film_info.mjs gives it a stand-in that keeps count of the canvas transforms, so that the eyes are where they are drawn) */
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
        else if (is.holder && is.holder !== was.holder && is.holder.split(" ")[0] !== was.holder.split(" ")[0]) bad.push(`${at}: the ${was.prop} jumps from ${was.holder} to ${is.holder} between two frames`);
        else if (is.holder && is.holder !== was.holder) bad.push(`${at}: the ${was.prop} changes hand (${was.holder} to ${is.holder}) between two frames`); }
      prev = now; } } } finally { AUDIT.on = false; }
  return { bad, held, spots };
};
