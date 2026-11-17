// Fire for the worlds of the kit: flames that lick and flicker, sparks that rise, smoke that rolls up and thins, embers on the
// ground, the glow a fire throws on a wall. Every piece is a pure function of the time t, so a shot adds what burns on each frame.
// Shared by every film; a film gives the places and the sizes.
import * as THREE from "three";
import { mesh, ball, lathe, paint } from "./kit";

type V3 = [number, number, number];
const TONGUE = () => lathe("flametongue", [[0.001, 0], [0.26, 0.1], [0.34, 0.3], [0.26, 0.58], [0.12, 0.84], [0.001, 1]], 10);
// a dark red rim, then red, orange and yellow, one inside the other
const COLS = ["#8f1c0a", "#e8421a", "#ff8a1c", "#ffd84a"], GLOW = ["#6a1004", "#b02a08", "#d0600a", "#e0a020"];
const HS = [1.07, 1, 0.7, 0.42], WS = [1.1, 1, 0.74, 0.44];
const NS = 30, SHEETS = new Map<string, THREE.BufferGeometry>();
const peak = (a: number) => Math.pow(1 - Math.abs(Math.sin(a)), 1.7);      // a pointed tip where the sine crosses zero
const hash = (a: number, b: number) => { const s = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return s - Math.floor(s); };
/** One sheet of a fire: a flat shape w wide standing on its foot, its top edge a row of tongues of uneven height that lean, travel
 *  along it and change places. f = its own phase. The same sheet (key) is reshaped on every frame, as a flag's cloth is */
const sheet = (key: string, t: number, w: number, h: number, f: number) => {
  let geo = SHEETS.get(key);
  if (!geo) { geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array((NS + 1) * 6), 3));
    const idx: number[] = []; for (let i = 0; i < NS; i++) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); } geo.setIndex(idx); SHEETS.set(key, geo); }
  const p = geo.getAttribute("position") as THREE.BufferAttribute, wind = 0.1 * Math.sin(t * 2.1 + f) + 0.05 * Math.sin(t * 5.3 + f * 2);
  for (let i = 0; i <= NS; i++) { const x = (i / NS) * 2 - 1, env = Math.pow(Math.max(0, 1 - x * x), 0.5);
    const y = h * env * (0.2 + 0.52 * peak(x * 1.9 + f + t * 1.3) + 0.3 * peak(x * 4.7 - f * 1.7 - t * 2.6) + 0.1 * peak(x * 9 + f * 3 + t * 5));
    p.setXYZ(i * 2, (x * w) / 2, 0, 0); p.setXYZ(i * 2 + 1, (x * w * 0.9) / 2 + (wind + 0.05 * Math.sin(t * 7 + x * 4 + f)) * y, y, 0); }
  p.needsUpdate = true; geo.computeVertexNormals(); geo.computeBoundingSphere(); return geo;
};
/** A fire standing on p. `n` clumps of flame over the width w (along the direction `ry`, radians about the vertical), each clump its
 *  own height and its own row of tongues, so that a burning roof is a ragged wall of fire and not a row of candles. big = the height
 *  of the tallest clump in metres. eye = where it is seen from: every clump is a flat shape turned to face it. Loose flames tear off
 *  the top and rise */
export const flames = (into: THREE.Object3D, p: V3, t: number, big = 1, w = 0, n = 1, ry = 0, seed = 0, eye?: V3) => {
  const cx = Math.cos(ry), sz = -Math.sin(ry), ex = eye ? eye[0] - p[0] : 0, ez = eye ? eye[2] - p[2] : 1, en = Math.hypot(ex, ez) || 1, ux = ex / en, uz = ez / en, yaw = Math.atan2(ux, uz);
  for (let i = 0; i < n; i++) {
    const o = n > 1 ? (i / (n - 1) - 0.5) * w + (hash(i, seed + 3) - 0.5) * (w / n) * 0.5 : 0, f = seed * 1.7 + i * 2.3;
    const H = big * (0.58 + 0.5 * hash(i, seed)) * (0.94 + 0.08 * Math.sin(t * 8.3 + f)), cw = Math.max(0.8 * H, n > 1 ? (w / (n - 1)) * 1.7 : 0);
    const x0 = p[0] + cx * o, z0 = p[2] + sz * o;
    for (let k = 0; k < 4; k++) into.add(mesh(sheet(`${seed}:${i}:${k}`, t + 0.05 * k, cw * WS[k], H * HS[k], f), COLS[k],
      { at: [x0 + ux * 0.03 * k, p[1] - (k ? 0 : 0.03 * H), z0 + uz * 0.03 * k], rot: [0, yaw, 0], line: 0, shadow: false, receive: false, glow: GLOW[k], side: THREE.DoubleSide }));
    // loose flames that tear off the top, rise and go out
    for (let j = 0; j < 2; j++) { const u = (t * (0.7 + 0.2 * j) + hash(i * 3 + j, seed + 7)) % 1, s = H * 0.24 * (1 - u);
      if (s > 0.02) into.add(mesh(TONGUE(), j ? "#ff8a1c" : "#ffb02a", { at: [x0 + (hash(i + j, seed + 1) - 0.5) * cw * 0.6 + 0.2 * H * u * Math.sin(f + j * 2), p[1] + H * (0.62 + 0.75 * u), z0 + uz * 0.1], scale: [s * 0.55, s * 1.3, s * 0.3], rot: [0, yaw, 0.3 * Math.sin(t * 6 + f + j)], line: 0, shadow: false, receive: false, glow: "#d0600a" })); }
  }
};
/** sparks that rise from p, drift and go out: `n` of them over a width w, as high as `rise` */
export const sparks = (into: THREE.Object3D, p: V3, t: number, n = 10, w = 1, rise = 3, seed = 0) => {
  for (let k = 0; k < n; k++) { const f = k * 1.618 + seed, u = (t * (0.32 + 0.11 * (k % 4)) + f * 0.37) % 1, r = 0.03 * (1 - u * 0.7);
    into.add(mesh(ball(1, 6), k % 3 ? "#ffb02a" : "#ffe680", { at: [p[0] + (((k * 37 + seed * 11) % 20) / 20 - 0.5) * w + 0.25 * Math.sin(f + u * 5), p[1] + u * rise, p[2] + 0.2 * Math.cos(f * 2 + u * 4)], scale: r, line: 0, shadow: false, receive: false, glow: "#ff8a00" })); }
};
/** burning scraps in the air between the lens and the fire: `n` of them in a box w wide, h high and d deep round p. They drift
 *  across and upward and turn as they go (bigger than sparks, and near enough to be seen as things) */
export const flying = (into: THREE.Object3D, p: V3, t: number, n = 10, w = 4, h = 3, d = 2, seed = 0) => {
  for (let k = 0; k < n; k++) { const f = k * 2.39 + seed, u = (t * (0.16 + 0.05 * (k % 3)) + hash(k, seed)) % 1, r = 0.03 + 0.03 * hash(k, seed + 2);
    into.add(mesh(ball(1, 6), k % 2 ? "#ff8a1c" : "#ffd84a", { at: [p[0] + (hash(k, seed + 4) - 0.5) * w + 0.6 * u * Math.sin(f) + 0.15 * Math.sin(t * 3 + f), p[1] + (hash(k, seed + 5) - 0.5) * h + 1.4 * u, p[2] + (hash(k, seed + 6) - 0.5) * d],
      scale: [r * (1 - 0.6 * u), r * 0.5 * (1 - 0.6 * u), r * 0.2], rot: [t * 3 + f, f, t * 5 + f], line: 0, shadow: false, receive: false, glow: "#d0600a" })); }
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
let GLOWMAT: THREE.MeshBasicMaterial | null = null;
const GLOWGEO = new THREE.PlaneGeometry(1, 1);
/** The light a fire throws on a wall or on the ground: a soft warm patch w wide and h high with its middle at p, lying in the plane
 *  that faces `ry` (radians about the vertical; flat = true lays it on the ground instead). It breathes with the fire. Put it a
 *  hand's breadth in front of the wall */
export const glow = (into: THREE.Object3D, p: V3, w: number, h: number, t: number, ry = 0, seed = 0, flat = false) => {
  GLOWMAT ??= new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false,
    map: paint("fireglow", 128, 128, (g) => { const q = g.createRadialGradient(64, 64, 2, 64, 64, 64); q.addColorStop(0, "rgba(255,170,70,0.62)"); q.addColorStop(0.5, "rgba(255,120,40,0.3)"); q.addColorStop(1, "rgba(255,90,20,0)"); g.fillStyle = q; g.fillRect(0, 0, 128, 128); }) });
  const m = new THREE.Mesh(GLOWGEO, GLOWMAT), k = flicker(t, seed); m.position.set(...p); m.rotation.set(flat ? -Math.PI / 2 : 0, flat ? 0 : ry, 0); if (flat) m.rotation.z = ry;
  m.scale.set(w * k, h * k, 1); m.castShadow = false; m.receiveShadow = false; m.renderOrder = 4; into.add(m); return m;
};
/** soft smoke: puffs drawn as round, soft-edged sprites that face the lens and fade as they rise (thin smoke from a fuse, a pipe, a
 *  snuffed candle), not as solid balls. `n` puffs from p, as high as `rise`, as wide as `big` at the top; `drift` = metres sideways on
 *  the way up. Their materials are shared by how far each has faded, so that nothing piles up from frame to frame */
const PUFFGEO = new THREE.PlaneGeometry(1, 1), PUFFS: THREE.MeshBasicMaterial[] = [];
const puffMat = (o: number) => { const i = Math.max(0, Math.min(9, Math.round(o * 9))); PUFFS[i] ??= new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, opacity: i / 9, fog: false,
  map: paint("smokepuff", 64, 64, (g) => { const q = g.createRadialGradient(32, 32, 2, 32, 32, 31); q.addColorStop(0, "rgba(214,209,203,1)"); q.addColorStop(0.5, "rgba(204,198,191,0.78)"); q.addColorStop(1, "rgba(196,190,183,0)"); g.fillStyle = q; g.fillRect(0, 0, 64, 64); }) }); return PUFFS[i]; };
export const wisp = (into: THREE.Object3D, p: V3, t: number, toLens: number, n = 12, rise = 0.5, big = 0.09, drift = 0.08, seed = 0) => {
  for (let k = 0; k < n; k++) { const u = (t * 0.5 + k / n + seed * 0.13) % 1, s = (0.03 + big * u), o = (1 - u * 0.85) * Math.min(1, u * 8), sw = Math.sin(k * 2.3 + t * 1.9 + seed) * (0.015 + 0.05 * u);
    if (o < 0.04) continue; const m = new THREE.Mesh(PUFFGEO, puffMat(o)); m.position.set(p[0] + sw + drift * u, p[1] + 0.02 + u * rise, p[2]); m.rotation.set(0, toLens, 0); m.scale.set(s, s, 1); m.renderOrder = 5; m.castShadow = false; into.add(m); }
};
