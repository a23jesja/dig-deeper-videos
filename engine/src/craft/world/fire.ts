// Fire for the worlds of the kit: flames that lick and flicker, sparks that rise, smoke that rolls up and thins, embers on the
// ground. Every piece is a pure function of the time t, built from the kit's toon meshes, so a shot adds what burns on each frame.
// Shared by every film; a film gives the places and the sizes.
import * as THREE from "three";
import { mesh, ball, lathe } from "./kit";

type V3 = [number, number, number];
const TONGUE = () => lathe("flametongue", [[0.001, 0], [0.26, 0.1], [0.34, 0.3], [0.26, 0.58], [0.12, 0.84], [0.001, 1]], 10);
const COLS = ["#e8421a", "#ff8a1c", "#ffd84a"], GLOW = ["#b02a08", "#d0600a", "#e0a020"];
/** a fire standing on p: `n` tongues side by side over the width w (along the direction `ry`, radians about the vertical), each of
 *  three flames one inside the other, leaning and stretching in its own time. big = its height in metres */
export const flames = (into: THREE.Object3D, p: V3, t: number, big = 1, w = 0, n = 1, ry = 0, seed = 0) => {
  const cx = Math.cos(ry), sz = -Math.sin(ry);
  for (let i = 0; i < n; i++) {
    const o = n > 1 ? (i / (n - 1) - 0.5) * w : 0, f = seed * 1.7 + i * 2.3, h = big * (0.72 + 0.2 * Math.sin(t * 9.3 + f) + 0.1 * Math.sin(t * 17 + f * 2) + 0.12 * ((i * 7 + seed) % 3) / 2);
    const lean = 0.16 * Math.sin(t * 5.1 + f * 1.3) + 0.07 * Math.sin(t * 12.7 + f);
    for (let k = 0; k < 3; k++) { const s = 1 - k * 0.27, hh = h * (1 - k * 0.2);
      into.add(mesh(TONGUE(), COLS[k], { at: [p[0] + cx * o + 0.02 * k, p[1] + 0.02 * k, p[2] + sz * o + 0.03 * k], scale: [big * 0.62 * s, hh, big * 0.5 * s], rot: [0.1 * lean, ry, lean], line: k ? 0 : 0.7, shadow: false, receive: false, glow: GLOW[k] })); }
  }
};
/** sparks that rise from p, drift and go out: `n` of them over a width w, as high as `rise` */
export const sparks = (into: THREE.Object3D, p: V3, t: number, n = 10, w = 1, rise = 3, seed = 0) => {
  for (let k = 0; k < n; k++) { const f = k * 1.618 + seed, u = (t * (0.32 + 0.11 * (k % 4)) + f * 0.37) % 1, r = 0.03 * (1 - u * 0.7);
    into.add(mesh(ball(1, 6), k % 3 ? "#ffb02a" : "#ffe680", { at: [p[0] + (((k * 37 + seed * 11) % 20) / 20 - 0.5) * w + 0.25 * Math.sin(f + u * 5), p[1] + u * rise, p[2] + 0.2 * Math.cos(f * 2 + u * 4)], scale: r, line: 0, shadow: false, receive: false, glow: "#ff8a00" })); }
};
/** smoke that rolls up from p and thins away: `n` puffs, as high as `rise`, drifting by (dx, dz) metres on the way; col = its colour */
export const smoke = (into: THREE.Object3D, p: V3, t: number, n = 7, rise = 6, big = 1, dx = 1.2, dz = 0, col = "#4a4654", seed = 0) => {
  for (let k = 0; k < n; k++) { const f = k * 2.4 + seed, u = (t * 0.16 + k / n + seed * 0.13) % 1, r = big * (0.3 + 1.0 * u) * (u > 0.8 ? (1 - u) / 0.2 : 1);
    if (r > 0.02) into.add(mesh(ball(1, 12), k % 2 ? col : "#5a5664", { at: [p[0] + dx * u + 0.3 * Math.sin(f + t * 0.7), p[1] + u * rise, p[2] + dz * u + 0.25 * Math.cos(f * 1.3)], scale: [r, r * 0.8, r], line: 0.5, shadow: false, receive: false })); }
};
/** glowing embers on the ground round p (a low heap that pulses) */
export const embers = (into: THREE.Object3D, p: V3, t: number, r = 0.6, n = 9, seed = 0) => {
  for (let k = 0; k < n; k++) { const a = k * 2.4 + seed, d = r * (0.3 + 0.7 * ((k * 5) % 7) / 7), g = 0.6 + 0.4 * Math.sin(t * 6 + k * 1.9);
    into.add(mesh(ball(1, 8), g > 0.75 ? "#ffb02a" : "#e0521a", { at: [p[0] + Math.cos(a) * d, p[1] + 0.03, p[2] + Math.sin(a) * d], scale: [0.09, 0.05, 0.07], rot: [0, a, 0], line: 0.4, shadow: false, receive: false, glow: "#c03a00" })); }
};
/** how brightly a fire burns at the time t (0.75 to 1.1): for the light and the tint a film lays over a night shot */
export const flicker = (t: number, seed = 0) => 0.92 + 0.1 * Math.sin(t * 11 + seed) + 0.06 * Math.sin(t * 23 + seed * 2) + 0.03 * Math.sin(t * 47 + seed * 3);
