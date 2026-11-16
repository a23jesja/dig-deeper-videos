// Environment kit, part 6: weather and particles. Rain, snow, dust, flying debris, sparks and smoke. Each is a
// closed-form function of time (no simulation state), so any frame can be rendered on its own.
import * as THREE from "three";
import { Part, rng, softTex, noInk } from "./util";

type Box = { x0: number; x1: number; y0: number; y1: number; z0: number; z1: number };
const fr = (v: number) => v - Math.floor(v);
/** streaks of rain inside a box, slanting with the wind */
export const makeRain = (b: Box, count = 5000, o: { speed?: number; slant?: number; color?: THREE.ColorRepresentation; len?: number } = {}): Part => {
  const r = rng(21), sp = o.speed ?? 14, sl = o.slant ?? 0.18, H = b.y1 - b.y0, len = o.len ?? 0.55;
  const im = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.012, len), new THREE.MeshBasicMaterial({ color: o.color ?? "#cfe0ff", transparent: true, opacity: 0.42, depthWrite: false, side: THREE.DoubleSide, fog: false }), count);
  const seed = Array.from({ length: count }, () => [r(), r(), r(), 0.8 + 0.4 * r()]), m4 = new THREE.Matrix4(), q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, -Math.atan(sl))), s = new THREE.Vector3(1, 1, 1), p = new THREE.Vector3();
  im.frustumCulled = false;
  return { obj: noInk(im), update: (t) => { for (let i = 0; i < count; i++) { const [a, c, d, k] = seed[i], u = fr(c + (t * sp * k) / H); p.set(b.x0 + (b.x1 - b.x0) * fr(a + u * sl * H / (b.x1 - b.x0)), b.y1 - u * H, b.z0 + (b.z1 - b.z0) * d); im.setMatrixAt(i, m4.compose(p, q, s)); } im.instanceMatrix.needsUpdate = true; } };
};
/** snowflakes drifting down and sideways */
export const makeSnow = (b: Box, count = 3500): Part => {
  const r = rng(22), pos = new Float32Array(count * 3), seed = Array.from({ length: count }, () => [r(), r(), r(), 0.6 + 0.8 * r(), r() * 6.283]);
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(g, new THREE.PointsMaterial({ map: softTex(0.25), size: 0.09, sizeAttenuation: true, color: new THREE.Color(1.5, 1.5, 1.6), transparent: true, depthWrite: false, fog: false }));
  pts.frustumCulled = false; const H = b.y1 - b.y0;
  return { obj: noInk(pts), update: (t) => { for (let i = 0; i < count; i++) { const [a, c, d, k, ph] = seed[i], u = fr(c + (t * 1.1 * k) / H); pos.set([b.x0 + (b.x1 - b.x0) * fr(a + 0.04 * Math.sin(t * 0.9 + ph) + u * 0.12), b.y1 - u * H, b.z0 + (b.z1 - b.z0) * fr(d + 0.03 * Math.cos(t * 0.7 + ph))], i * 3); } g.attributes.position.needsUpdate = true; } };
};
const sprites = (n: number, color: THREE.ColorRepresentation, additive = false, hard = 0) => {
  const g = new THREE.Group();
  for (let i = 0; i < n; i++) g.add(new THREE.Sprite(new THREE.SpriteMaterial({ map: softTex(hard), color, transparent: true, depthWrite: false, fog: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending })));
  return noInk(g);
};
/** low dust blowing along the ground from `at` in direction `dir` */
export const makeDust = (at: THREE.Vector3, dir = new THREE.Vector3(1, 0, 0), n = 36, o: { color?: THREE.ColorRepresentation; reach?: number; size?: number } = {}): Part => {
  const r = rng(23), g = sprites(n, o.color ?? "#d8c2a0"), seed = Array.from({ length: n }, () => [r(), r(), r(), r()]), reach = o.reach ?? 9, size = o.size ?? 1.6;
  return { obj: g, update: (t) => g.children.forEach((c, i) => { const [a, b, d, e] = seed[i], u = fr(a + t * (0.1 + 0.08 * b)), s = c as THREE.Sprite; s.position.copy(at).addScaledVector(dir, u * reach).add(new THREE.Vector3((d - 0.5) * 2.4, 0.2 + u * (0.6 + e), (e - 0.5) * 2.4)); s.scale.setScalar(size * (0.5 + 1.6 * u)); s.material.opacity = 0.36 * Math.sin(Math.PI * u); }) };
};
/** smoke rising from `at`, spreading and thinning; `lean` is the wind */
export const makeSmoke = (at: THREE.Vector3, n = 28, o: { color?: THREE.ColorRepresentation; rise?: number; lean?: THREE.Vector3; size?: number; opacity?: number } = {}): Part => {
  const r = rng(24), g = sprites(n, o.color ?? "#6a6a72"), seed = Array.from({ length: n }, () => [r(), r(), r()]), rise = o.rise ?? 9, lean = o.lean ?? new THREE.Vector3(0.35, 0, 0), size = o.size ?? 1.2;
  return { obj: g, update: (t) => g.children.forEach((c, i) => { const [a, b, d] = seed[i], u = fr(a + t * 0.11), s = c as THREE.Sprite; s.position.set(at.x + lean.x * rise * u * u + (b - 0.5) * 0.5 * (1 + 3 * u), at.y + rise * u, at.z + lean.z * rise * u * u + (d - 0.5) * 0.5 * (1 + 3 * u)); s.scale.setScalar(size * (0.7 + 3.2 * u)); s.material.opacity = (o.opacity ?? 0.55) * Math.pow(1 - u, 1.4) * Math.min(1, u * 8); s.material.rotation = a * 6 + t * 0.2 * (b - 0.5); }) };
};
/** sparks thrown up from `at` (a fire, a grinding wheel, a rocket): bright, they feed the bloom, and fall back */
export const makeSparks = (at: THREE.Vector3, count = 260, o: { color?: THREE.Color; power?: number; life?: number; spread?: number; size?: number } = {}): Part => {
  const r = rng(25), pos = new Float32Array(count * 3), seed = Array.from({ length: count }, () => [r(), r() * 6.283, 0.35 + 0.65 * r(), r()]), life = o.life ?? 1.3, pw = o.power ?? 5, spread = o.spread ?? 0.45;
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(g, new THREE.PointsMaterial({ map: softTex(0.3), size: o.size ?? 0.07, sizeAttenuation: true, color: o.color ?? new THREE.Color(5, 2.6, 0.7), transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending }));
  pts.frustumCulled = false;
  return { obj: noInk(pts), update: (t) => { for (let i = 0; i < count; i++) { const [a, az, k, e] = seed[i], u = fr(a + t / life), tt = u * life, vx = Math.cos(az) * spread * pw * e, vz = Math.sin(az) * spread * pw * e, vy = pw * k; pos.set([at.x + vx * tt, Math.max(at.y - 0.4, at.y + vy * tt - 4.9 * tt * tt), at.z + vz * tt], i * 3); } g.attributes.position.needsUpdate = true; } };
};
/** flying debris: splinters and scraps tumbling through the air in arcs across a box */
export const makeDebris = (b: Box, count = 70, o: { color?: THREE.ColorRepresentation[] } = {}): Part => {
  const r = rng(26), cols = (o.color ?? ["#8a6a44", "#5a4632", "#c9b891", "#3a3f4a"]).map((c) => new THREE.Color(c));
  const im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ roughness: 0.9 }), count); im.castShadow = true; im.frustumCulled = false;
  const seed = Array.from({ length: count }, (_, i) => { im.setColorAt(i, cols[i % cols.length]); return [r(), r(), r(), r(), r(), r()]; });
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), s = new THREE.Vector3(), p = new THREE.Vector3();
  return { obj: im, update: (t) => { for (let i = 0; i < count; i++) { const [a, c, d, f, h, k] = seed[i], u = fr(a + t * (0.16 + 0.12 * c)); p.set(b.x0 + (b.x1 - b.x0) * u, b.y0 + (b.y1 - b.y0) * (0.15 + 0.8 * d) * 4 * u * (1 - u) + 0.1, b.z0 + (b.z1 - b.z0) * f); e.set(t * (2 + 5 * h) + a * 6, t * (1.5 + 4 * k) + c * 6, t * (1 + 3 * d)); q.setFromEuler(e); s.set(0.08 + 0.34 * h, 0.02 + 0.05 * k, 0.05 + 0.16 * d); im.setMatrixAt(i, m4.compose(p, q, s)); } im.instanceMatrix.needsUpdate = true; } };
};
