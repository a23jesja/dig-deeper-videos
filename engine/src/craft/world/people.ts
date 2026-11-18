// The cast in the world: a figure (or an animal) drawn in code on a card that stands on the ground, faces the lens and casts its own
// shadow. The card is drawn for the angle it is seen from: `heading` is the way the figure faces in the world, so a figure walking
// away from the camera is drawn from behind and one crossing the picture from the side.
import * as THREE from "three";
import { card, outlinePx } from "./kit";
import { Ink } from "../ink";
import { solve, Pose, Props, Joint } from "../rig";
import type { Design, FigOpts } from "../designs/common";
import { Beast, BeastPose, drawBeast } from "../beast";

const D2R = Math.PI / 180;
const bodyH = (P: Props) => P.thigh + P.shin + P.ankle + P.spine + P.neck + P.head;
/** where a figure stands: x, y, z in metres, the way it faces (0 = toward +z, 90 = toward +x), its height in metres */
export type Spot = { at: [number, number, number]; heading: number; h?: number; /** where the body stood when each planted foot was put down (film.ts Actor.land) */ land?: { L?: [number, number, number] | null; R?: [number, number, number] | null } };
export type Placed = { mesh: THREE.Mesh; /** a point of the drawing (design units, x right, y down from the soles) in the world */ world: (ux: number, uy: number) => [number, number, number] };

/** how a shot sees the cards: the lens (so that the ink line of a figure gets the same width on the screen as the contour of the
 *  world round it) and the direction toward the sun (so that the cards take the shade of awnings, columns and walls) */
export type Seen = { fov: number; toSun?: THREE.Vector3 };
/** the width of the figure's ink line in design units that gives the world's contour width on the screen at this distance;
 *  held between 0.8 and 2.2 times the design's own line so that a far figure does not turn into a blot */
const lineFor = (own: number, mpu: number, at: number[], cam: number[], seen?: Seen) => {
  if (!seen) return own;
  const o = outlinePx(), dist = Math.hypot(cam[0] - at[0], cam[1] - at[1] - 0.9, cam[2] - at[2]), pxPerM = o.res / (2 * dist * Math.tan((seen.fov * D2R) / 2));
  return Math.max(own * 0.8, Math.min(own * 2.2, (o.px * 1.15) / (pxPerM * mpu)));
};
const place = (key: string, cw: number, ch: number, feet: number, s: number, mpu: number, sp: Spot, cam: number[], tilt: number, draw: (g: CanvasRenderingContext2D, yaw: number) => void, seen?: Seen): Placed => {
  const [x, y, z] = sp.at, az = Math.atan2(cam[0] - x, cam[2] - z), yaw = sp.heading - az / D2R;
  const m = card(key, cw, ch, (cw / s) * mpu, (ch / s) * mpu, feet, (g) => { g.translate(cw / 2, ch * feet); g.scale(s, s); draw(g, yaw); }, seen?.toSun);
  m.position.set(x, y, z); m.rotation.order = "YXZ"; m.rotation.y = az;
  m.rotation.x = -tilt * Math.atan2(cam[1] - y - 0.8, Math.hypot(cam[0] - x, cam[2] - z));
  return { mesh: m, world: (ux, uy) => [x + Math.cos(az) * ux * mpu, y - uy * mpu, z - Math.sin(az) * ux * mpu] };
};
type V3 = [number, number, number];
const dot3 = (a: number[], b: number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
/** A planted foot that stays still in the picture (the body check of 18 November: feet slid while they carried the figure).
 *  The card stands upright over the body and draws the skeleton flat on itself, so a foot planted in front of the card or behind it is
 *  drawn a little off where it stands, and as the body walks on over the foot that error changes: the foot crept along the ground.
 *  Here each planted foot is drawn, on this frame's card, where it was drawn when it was put down (through the lens: on the line from
 *  the lens to that place), so a figure that stands still is not touched at all. Where that place would lie below the card's ground
 *  (the body has moved on away from the lens), the whole card moves toward the lens along the lines of sight and shrinks in the same
 *  measure, which leaves the picture of the body as it was, until the foot can be drawn standing on the ground. A foot fades out of
 *  this as it lifts (over 3 cm). Returns the pose to draw, where the card stands and its scale */
const plantFix = (P: Props, pose: Pose, sp: Spot, cam: number[], mpu: number): { pose: Pose; at: V3; mpu: number } => {
  const none = { pose, at: sp.at, mpu }; if (!sp.land || (!sp.land.L && !sp.land.R)) return none;
  const LL = P.thigh + P.shin, [x, y, z] = sp.at, az = Math.atan2(cam[0] - x, cam[2] - z), yaw = sp.heading - az / D2R, n = [Math.sin(az), 0, Math.cos(az)], u = [Math.cos(az), 0, -Math.sin(az)];
  const h = sp.heading * D2R, left = [Math.cos(h), 0, -Math.sin(h)], fwd = [Math.sin(h), 0, Math.cos(h)];
  const jobs: { side: "L" | "R"; w: number; Jl: V3; joint: Joint }[] = [];
  for (const side of ["L", "R"] as const) {
    const l = (side === "L" ? pose.legL : pose.legR) as { x?: number; y?: number; z?: number; pitch?: number; toe?: number; th?: unknown } | undefined, P0 = sp.land[side];
    if (!l || l.th !== undefined || !P0) continue; const w = Math.max(0, Math.min(1, 1 - ((l.y ?? 0) * LL * mpu) / 0.03)); if (w <= 0) continue;
    // the point it stands on (the toes while the heel is up, else the heel), in the world
    const s = side === "L" ? 1 : -1, t = (l.toe ?? 14) * D2R, f0 = [s * Math.sin(t), 0, Math.cos(t)], c = [s * (P.hipW + (l.x ?? 0.03) * LL), 0, (l.z ?? 0) * LL], k = (l.pitch ?? 0) > 0 ? 0.73 : -0.27;
    const cp = [c[0] + f0[0] * k * P.foot, c[2] + f0[2] * k * P.foot], W: V3 = [x + mpu * (cp[0] * left[0] + cp[1] * fwd[0]), y, z + mpu * (cp[0] * left[2] + cp[1] * fwd[2])];
    // where it was drawn when it was put down: laid flat on the card that stood over the body then
    const nx = cam[0] - P0[0], nz = cam[2] - P0[2], nn = Math.hypot(nx, nz) || 1, nl = [nx / nn, 0, nz / nn], e0 = (W[0] - P0[0]) * nl[0] + (W[2] - P0[2]) * nl[2];
    jobs.push({ side, w, Jl: [W[0] - e0 * nl[0], W[1], W[2] - e0 * nl[2]], joint: ((l.pitch ?? 0) > 0 ? `toe${side}` : `heel${side}`) as Joint });
  }
  if (!jobs.length) return none;
  const C = cam, Dh = (C[0] - x) * n[0] + (C[2] - z) * n[2]; let df = 0;
  for (const j of jobs) df = Math.max(df, j.w * ((j.Jl[0] - x) * n[0] + (j.Jl[2] - z) * n[2]));
  const lam = Math.max(0.5, (Dh - df) / (Dh || 1)), at2: V3 = [C[0] + lam * (x - C[0]), C[1] + lam * (y - C[1]), C[2] + lam * (z - C[2])], mpu2 = lam * mpu;
  const legs: Record<"L" | "R", Record<string, number>> = { L: { ...(pose.legL as object) } as Record<string, number>, R: { ...(pose.legR as object) } as Record<string, number> };
  const with_ = () => ({ ...pose, legL: legs.L as Pose["legL"], legR: legs.R as Pose["legR"] }) as Pose;
  for (let it = 0; it < 2; it++) { const sk = solve(P, with_(), yaw);
    for (const j of jobs) { const d = [j.Jl[0] - C[0], j.Jl[1] - C[1], j.Jl[2] - C[2]], kk = dot3([at2[0] - C[0], 0, at2[2] - C[2]], n) / (dot3(d, n) || 1e-9), Js = [C[0] + d[0] * kk, C[1] + d[1] * kk, C[2] + d[2] * kk];
      const tx = ((Js[0] - at2[0]) * u[0] + (Js[2] - at2[2]) * u[2]) / mpu2, ty = (at2[1] - Js[1]) / mpu2, cur = sk.j[j.joint], dx = (tx - cur[0]) * j.w, dy = (ty - cur[1]) * j.w, L = legs[j.side];
      L.y = (L.y ?? 0) - dy / LL;
      // across the picture: the foot's own x and z, in the measure each moves it there
      const probe = (key: "x" | "z") => { const q = { ...L, [key]: (L[key] ?? (key === "x" ? 0.03 : 0)) + 0.01 }, save = legs[j.side]; legs[j.side] = q; const v = solve(P, with_(), yaw).j[j.joint][0] - cur[0]; legs[j.side] = save; return v / 0.01; };
      const gx = probe("x"), gz = probe("z"), g2 = gx * gx + gz * gz; if (g2 > 1e-6) { L.x = (L.x ?? 0.03) + (gx * dx) / g2; L.z = (L.z ?? 0) + (gz * dx) / g2; } } }
  return { pose: with_(), at: at2, mpu: mpu2 };
};
/** a figure of the cast. tilt (0..1) leans the card back toward a camera that looks down on it */
export const figureCard = (D: Design, pose0: Pose, o: FigOpts, sp0: Spot, cam: number[], tilt = 0, seen?: Seen): Placed & { /** where a joint of the skeleton is in the world (to put a real thing in a hand) */ joint: (j: Joint) => [number, number, number];
  /** where a place the drawing noted ("eyeA", "eyeB": the two eyes) is in the world; null if it is not in this view */ mark: (name: string) => [number, number, number] | null } => {
  const P = D.props(o.who ?? "sir"), T = bodyH(P), s = 1.15, cw = Math.round(T * 1.9 * s), ch = Math.round(T * 1.42 * s), mpu0 = (sp0.h ?? 1.75) / T;
  const fx = plantFix(P, pose0, sp0, cam, mpu0), pose = fx.pose, mpu = fx.mpu, sp: Spot = { ...sp0, at: fx.at };
  const sk0 = solve(P, pose, sp.heading - Math.atan2(cam[0] - sp.at[0], cam[2] - sp.at[2]) / D2R);
  let ink: Ink | null = null;
  const pl = place(`${D.id}:${sp.at.join()}:${cam.join()}`, cw, ch, 0.93, s, mpu, sp, cam, tilt, (g, yaw) => { ink = new Ink(g, lineFor(D.ol, mpu0, sp0.at, cam, seen)); D.draw(ink, solve(P, pose, yaw), o); }, seen);
  const marks = (ink as Ink | null)?.marks ?? {};
  return { ...pl, joint: (j) => pl.world(sk0.j[j][0], sk0.j[j][1]), mark: (name) => { const m = marks[name]; return m ? pl.world((m[0] - cw / 2) / s, (m[1] - ch * 0.93) / s) : null; } };
};
/** The closed fingers of a figure's hands (`sides`) on a card of their own, exactly where the figure's hands are. The stage puts it a
 *  little nearer the lens than the thing the hand holds, so that the thing lies between the palm (on the figure's card) and the
 *  fingers. null for a design that has no such layer */
export const fingersCard = (D: Design, pose0: Pose, o: FigOpts, sp0: Spot, cam: number[], sides: ("L" | "R")[], seen?: Seen, whole = false): THREE.Mesh | null => {
  if (!D.fingers) return null;
  const P = D.props(o.who ?? "sir"), T = bodyH(P), s = 1.15, cw = Math.round(T * 1.9 * s), ch = Math.round(T * 1.42 * s), mpu0 = (sp0.h ?? 1.75) / T;
  // the same card as the figure's (plantFix), so that the fingers lie on its hands
  const fx = plantFix(P, pose0, sp0, cam, mpu0), pose = fx.pose, mpu = fx.mpu, sp: Spot = { ...sp0, at: fx.at };
  const kinds = whole ? { L: o.handL ?? "relaxed", R: o.handR ?? "relaxed" } : undefined;
  const pl = place(`${D.id}:fingers:${sides.join()}:${whole ? `${kinds!.L},${kinds!.R}` : ""}:${sp.at.join()}:${cam.join()}`, cw, ch, 0.93, s, mpu, sp, cam, 0, (g, yaw) => D.fingers!(new Ink(g, lineFor(D.ol, mpu, sp.at, cam, seen), 1.1), solve(P, pose, yaw), sides, kinds), seen);
  pl.mesh.castShadow = false; return pl.mesh;
};
/** a four-legged animal; h = height at the shoulder in metres. `collar` = where a chain meets its collar, in the world */
export const beastCard = (B: Beast, pose: BeastPose, sp: Spot, cam: number[], tilt = 0, seen?: Seen): Placed & { collar: [number, number, number] } => {
  const T = B.legU + B.legL + B.bodyH * 0.65, s = 1.6, cw = Math.round((B.len + B.neck + B.head.b * 2 + B.snout + B.tail) * 1.5 * s), ch = Math.round((T + B.bodyH + B.neck + B.head.H) * 1.3 * s), mpu = (sp.h ?? 0.55) / T;
  let c: [number, number] = [0, 0];
  const pl = place(`${B.id}:${sp.at.join()}:${cam.join()}`, cw, ch, 0.94, s, mpu, sp, cam, tilt, (g, yaw) => { c = drawBeast(B)(new Ink(g, lineFor(4.6, mpu, sp.at, cam, seen)), pose, yaw); }, seen);
  return { ...pl, collar: pl.world(c[0], c[1]) };
};
/** where the joints of a figure are in the world, without drawing it (the same reckoning as figureCard) */
export const bareJoints = (D: Design, pose: Pose, o: FigOpts, sp: Spot, cam: number[]) => {
  const P = D.props(o.who ?? "sir"), mpu = (sp.h ?? 1.75) / bodyH(P), [x, y, z] = sp.at, az = Math.atan2(cam[0] - x, cam[2] - z), sk = solve(P, pose, sp.heading - az / D2R);
  return { joint: (j: Joint): [number, number, number] => [x + Math.cos(az) * sk.j[j][0] * mpu, y - sk.j[j][1] * mpu, z - Math.sin(az) * sk.j[j][0] * mpu] };
};
type ArmPose = [[number, number], [number, number]];
/** tries arms until `cost` is smallest: the arm has no closed form here (it is drawn turned, on a card) */
const searchArm = (cost: (q: number[]) => number): ArmPose => {
  let best = [60, 20, 100, 0], bc = Infinity;
  for (const seed of [[60, 20, 100, 0], [120, 20, 150, 0], [30, 10, 60, 0], [90, -30, 120, -40], [100, 40, 150, 30], [150, 30, 180, 10], [90, 0, 90, 0], [90, 60, 90, 60], [90, -60, 90, -60]]) {
    let q = [...seed], c = cost(q);
    for (let step = 32; step >= 0.5; step /= 2) for (let it = 0; it < 6; it++) { let moved = false;
      for (let i = 0; i < 4; i++) for (const s of [-1, 1]) { const r = [...q]; r[i] = Math.max(i % 2 ? -110 : -50, Math.min(i % 2 ? 110 : 205, r[i] + s * step)); const cr = cost(r); if (cr < c - 1e-6) { q = r; c = cr; moved = true; } }
      if (!moved) break; }
    if (c < bc) { bc = c; best = q; } }
  return [[best[0], best[1]], [best[2], best[3]]];
};
/** The arm (upper arm and forearm, as in a pose) that puts a figure's hand on a point in the world, as seen from the lens: the
 *  middle of the closed fingers of `side` comes to lie over `target` in the picture. Use it to build a use pose once (both hands
 *  on a spyglass), not on every frame */
export const reachArm = (D: Design, pose: Pose, o: FigOpts, sp: Spot, cam: number[], side: "L" | "R", target: [number, number, number], slide = 0.5, /** where the elbow should go, if the hand can be put on the point that way (a lifted elbow) */ elbow?: [number, number, number]): ArmPose => {
  const P = D.props(o.who ?? "sir"), mpu = (sp.h ?? 1.75) / bodyH(P), [x, y, z] = sp.at, az = Math.atan2(cam[0] - x, cam[2] - z), yaw = sp.heading - az / D2R;
  const seen = (q: [number, number, number]): [number, number] => [((q[0] - x) * Math.cos(az) - (q[2] - z) * Math.sin(az)) / mpu, -(q[1] - y) / mpu];
  const [tx, ty] = seen(target), key = side === "L" ? "armL" : "armR", wr = `wr${side}` as Joint, tip = `tip${side}` as Joint;
  const el = `el${side}` as Joint, [ex, ey] = elbow ? seen(elbow) : [0, 0];
  return searchArm((q) => { const sk = solve(P, { ...pose, [key]: [[q[0], q[1]], [q[2], q[3]]] }, yaw), W = sk.j[wr], T = sk.j[tip], E = sk.j[el];
    return Math.hypot(W[0] + (T[0] - W[0]) * slide - tx, W[1] + (T[1] - W[1]) * slide - ty) + (elbow ? 0.02 * Math.hypot(E[0] - ex, E[1] - ey) : 0); });
};
/** The arm that points straight at something: the whole arm, shoulder to hand, lies along `dir` in the picture (x to the right, y
 *  up) and is stretched as far as it is drawn (an aimed pistol, a pointing finger). `bend` 0..1 lets the elbow give a little */
export const pointArm = (D: Design, pose: Pose, o: FigOpts, sp: Spot, cam: number[], side: "L" | "R", dir: [number, number], bend = 0): ArmPose => {
  const P = D.props(o.who ?? "sir"), [x, , z] = sp.at, az = Math.atan2(cam[0] - x, cam[2] - z), yaw = sp.heading - az / D2R, n = Math.hypot(dir[0], dir[1]) || 1, dx = dir[0] / n, dy = -dir[1] / n;
  const key = side === "L" ? "armL" : "armR", sh = `sh${side}` as Joint, el = `el${side}` as Joint, wr = `wr${side}` as Joint, full = P.upper + P.fore;
  return searchArm((q) => { const sk = solve(P, { ...pose, [key]: [[q[0], q[1]], [q[2], q[3]]] }, yaw), S = sk.j[sh], E = sk.j[el], W = sk.j[wr];
    const u = [E[0] - S[0], E[1] - S[1]], f = [W[0] - E[0], W[1] - E[1]], nu = Math.hypot(u[0], u[1]) || 1e-6, nf = Math.hypot(f[0], f[1]) || 1e-6, reach = Math.hypot(W[0] - S[0], W[1] - S[1]);
    return (1 - (f[0] * dx + f[1] * dy) / nf) * 6 + (1 - (u[0] * dx + u[1] * dy) / nu) * 3 * (1 - bend) - (reach / full) * 1.2; });
};

/** A spectator in a crowd: the figure drawn small (a third of a cast card) and kept, so that a crowd of many costs little. The drawing is
 *  made once for each look, `tag` (the pose it stands in, named by the caller) and angle (in 20 degree steps) and used again on every
 *  frame; the card is not the stage's own (nothing of it is thrown away after the frame) */
const CROWD = new Map<string, { mat: THREE.MeshBasicMaterial; geo: THREE.PlaneGeometry }>();
/** while the grip check runs (on), every crowd card drawn in a frame notes where it stands, so that the face check can see the faces in
 *  the crowd too (review of the gladiators Short: the sponsor's cloth hid a face in the box behind him) */
export const CROWD_LOG: { on: boolean; heads: { at: [number, number, number]; h: number }[] } = { on: false, heads: [] };
export const crowdCard = (D: Design, pose: Pose, o: FigOpts, tag: string, sp: Spot, cam: number[]) => {
  if (CROWD_LOG.on) CROWD_LOG.heads.push({ at: sp.at, h: sp.h ?? 1.7 });
  const P = D.props(o.who ?? "sir"), T = bodyH(P), s = 0.34, cw = Math.round(T * 1.9 * s), ch = Math.round(T * 1.42 * s), mpu = (sp.h ?? 1.7) / T, feet = 0.93;
  const [x, y, z] = sp.at, az = Math.atan2(cam[0] - x, cam[2] - z), yaw = Math.round((sp.heading - az / D2R) / 20) * 20, key = `${D.id}:${tag}:${yaw}:${(sp.h ?? 1.7).toFixed(2)}`;
  let c = CROWD.get(key);
  if (!c) { const cv = document.createElement("canvas"); cv.width = cw; cv.height = ch; const g = cv.getContext("2d")!; g.translate(cw / 2, ch * feet); g.scale(s, s); D.draw(new Ink(g, D.ol * 1.7), solve(P, pose, yaw), o);
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; const w = (cw / s) * mpu, h = (ch / s) * mpu, geo = new THREE.PlaneGeometry(w, h); geo.translate(0, h * (feet - 0.5), 0);
    c = { mat: new THREE.MeshBasicMaterial({ map: t, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide }), geo }; CROWD.set(key, c); }
  const m = new THREE.Mesh(c.geo, c.mat); m.position.set(x, y, z); m.rotation.y = az; return m;
};
