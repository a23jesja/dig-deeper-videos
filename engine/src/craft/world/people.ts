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
export type Spot = { at: [number, number, number]; heading: number; h?: number };
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
/** a figure of the cast. tilt (0..1) leans the card back toward a camera that looks down on it */
export const figureCard = (D: Design, pose: Pose, o: FigOpts, sp: Spot, cam: number[], tilt = 0, seen?: Seen): Placed & { /** where a joint of the skeleton is in the world (to put a real thing in a hand) */ joint: (j: Joint) => [number, number, number] } => {
  const P = D.props(o.who ?? "sir"), T = bodyH(P), s = 1.15, cw = Math.round(T * 1.9 * s), ch = Math.round(T * 1.42 * s), mpu = (sp.h ?? 1.75) / T;
  const sk0 = solve(P, pose, sp.heading - Math.atan2(cam[0] - sp.at[0], cam[2] - sp.at[2]) / D2R);
  const pl = place(`${D.id}:${sp.at.join()}:${cam.join()}`, cw, ch, 0.93, s, mpu, sp, cam, tilt, (g, yaw) => D.draw(new Ink(g, lineFor(D.ol, mpu, sp.at, cam, seen)), solve(P, pose, yaw), o), seen);
  return { ...pl, joint: (j) => pl.world(sk0.j[j][0], sk0.j[j][1]) };
};
/** a four-legged animal; h = height at the shoulder in metres. `collar` = where a chain meets its collar, in the world */
export const beastCard = (B: Beast, pose: BeastPose, sp: Spot, cam: number[], tilt = 0, seen?: Seen): Placed & { collar: [number, number, number] } => {
  const T = B.legU + B.legL + B.bodyH * 0.65, s = 1.6, cw = Math.round((B.len + B.neck + B.head.b * 2 + B.snout + B.tail) * 1.5 * s), ch = Math.round((T + B.bodyH + B.neck + B.head.H) * 1.3 * s), mpu = (sp.h ?? 0.55) / T;
  let c: [number, number] = [0, 0];
  const pl = place(`${B.id}:${sp.at.join()}:${cam.join()}`, cw, ch, 0.94, s, mpu, sp, cam, tilt, (g, yaw) => { c = drawBeast(B)(new Ink(g, lineFor(4.6, mpu, sp.at, cam, seen)), pose, yaw); }, seen);
  return { ...pl, collar: pl.world(c[0], c[1]) };
};
