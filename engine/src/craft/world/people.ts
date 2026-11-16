// The cast in the world: a figure (or an animal) drawn in code on a card that stands on the ground, faces the lens and casts its own
// shadow. The card is drawn for the angle it is seen from: `heading` is the way the figure faces in the world, so a figure walking
// away from the camera is drawn from behind and one crossing the picture from the side.
import * as THREE from "three";
import { card } from "./kit";
import { Ink } from "../ink";
import { solve, Pose, Props } from "../rig";
import type { Design, FigOpts } from "../designs/common";
import { Beast, BeastPose, drawBeast } from "../beast";

const D2R = Math.PI / 180;
const bodyH = (P: Props) => P.thigh + P.shin + P.ankle + P.spine + P.neck + P.head;
/** where a figure stands: x, y, z in metres, the way it faces (0 = toward +z, 90 = toward +x), its height in metres */
export type Spot = { at: [number, number, number]; heading: number; h?: number };
export type Placed = { mesh: THREE.Mesh; /** a point of the drawing (design units, x right, y down from the soles) in the world */ world: (ux: number, uy: number) => [number, number, number] };

const place = (key: string, cw: number, ch: number, feet: number, s: number, mpu: number, sp: Spot, cam: number[], tilt: number, draw: (g: CanvasRenderingContext2D, yaw: number) => void): Placed => {
  const [x, y, z] = sp.at, az = Math.atan2(cam[0] - x, cam[2] - z), yaw = sp.heading - az / D2R;
  const m = card(key, cw, ch, (cw / s) * mpu, (ch / s) * mpu, feet, (g) => { g.translate(cw / 2, ch * feet); g.scale(s, s); draw(g, yaw); });
  m.position.set(x, y, z); m.rotation.order = "YXZ"; m.rotation.y = az;
  m.rotation.x = -tilt * Math.atan2(cam[1] - y - 0.8, Math.hypot(cam[0] - x, cam[2] - z));
  return { mesh: m, world: (ux, uy) => [x + Math.cos(az) * ux * mpu, y - uy * mpu, z - Math.sin(az) * ux * mpu] };
};
/** a figure of the cast. tilt (0..1) leans the card back toward a camera that looks down on it */
export const figureCard = (D: Design, pose: Pose, o: FigOpts, sp: Spot, cam: number[], tilt = 0): Placed => {
  const P = D.props(o.who ?? "sir"), T = bodyH(P), s = 1.15, cw = Math.round(T * 1.9 * s), ch = Math.round(T * 1.42 * s);
  return place(`${D.id}:${sp.at.join()}:${cam.join()}`, cw, ch, 0.93, s, (sp.h ?? 1.75) / T, sp, cam, tilt, (g, yaw) => D.draw(new Ink(g, D.ol), solve(P, pose, yaw), o));
};
/** a four-legged animal; h = height at the shoulder in metres. `collar` = where a chain meets its collar, in the world */
export const beastCard = (B: Beast, pose: BeastPose, sp: Spot, cam: number[], tilt = 0): Placed & { collar: [number, number, number] } => {
  const T = B.legU + B.legL + B.bodyH * 0.65, s = 1.6, cw = Math.round((B.len + B.neck + B.head.b * 2 + B.snout + B.tail) * 1.5 * s), ch = Math.round((T + B.bodyH + B.neck + B.head.H) * 1.3 * s);
  let c: [number, number] = [0, 0];
  const pl = place(`${B.id}:${sp.at.join()}:${cam.join()}`, cw, ch, 0.94, s, (sp.h ?? 0.55) / T, sp, cam, tilt, (g, yaw) => { c = drawBeast(B)(new Ink(g, 4.6), pose, yaw); });
  return { ...pl, collar: pl.world(c[0], c[1]) };
};
