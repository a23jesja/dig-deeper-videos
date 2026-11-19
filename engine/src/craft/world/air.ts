// Light you can see, and what drifts in it (DAILY-RULES "Lessons from the best reference Shorts", 3: "Visible light beams with dust in
// them, glow around lamps and signs, reflections on wet or polished floors, soft depth of field"; "Light and atmosphere": near
// particles big and blurred, far ones small and sharp). Shared by every scene; first used by the night cabin (Jesper 19 Nov).
import * as THREE from "three";
import { paint } from "./kit";
import type { V3, Cam } from "../stage/film";

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const len = (a: V3) => Math.hypot(a[0], a[1], a[2]);

/** A shaft of light in the air: a soft-edged cone from `from` (r0 wide) to `to` (r1 wide), brightest at its start and along its
 *  middle, fading toward its end and its sides, added onto what lies behind it (it never darkens). `alpha` = how strong. Built once */
export const lightShaft = (from: V3, to: V3, r0: number, r1: number, color: string, alpha: number) => {
  const L = len(sub(to, from)), geo = new THREE.CylinderGeometry(r0, r1, L, 32, 1, true); geo.translate(0, -L / 2, 0);
  const mat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { col: { value: new THREE.Color(color) }, a: { value: alpha } },
    vertexShader: `varying float vAlong; varying vec3 vN; varying vec3 vV; void main() { vAlong = -position.y; vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform vec3 col; uniform float a; varying float vAlong; varying vec3 vN; varying vec3 vV;
      void main() { float side = pow(abs(dot(vN, vV)), 1.6); float k = clamp(vAlong / ${L.toFixed(3)}, 0.0, 1.0); float fade = (1.0 - k) * (1.0 - k) * smoothstep(0.0, 0.08, k);
        gl_FragColor = vec4(col * a * side * fade, 1.0); }` });
  const m = new THREE.Mesh(geo, mat); m.position.set(...from);
  const d = sub(to, from), q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), new THREE.Vector3(...d).normalize()); m.quaternion.copy(q);
  m.castShadow = false; m.receiveShadow = false; m.renderOrder = 5; m.name = "light shaft"; return m;
};

const DOT = () => paint("airdust", 64, 64, (g) => { const q = g.createRadialGradient(32, 32, 0, 32, 32, 32); q.addColorStop(0, "rgba(255,255,255,1)"); q.addColorStop(0.35, "rgba(255,255,255,0.55)"); q.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = q; g.fillRect(0, 0, 64, 64); });
const DUSTMATS = new Map<string, THREE.PointsMaterial>();
/** Dust drifting in a light: `n` motes in a ball of `r` metres round `at`, slowly rising, swaying and turning in and out of the light
 *  (each one's brightness breathes). Their size grows with nearness to the lens (size attenuation), so motes near it are big and soft.
 *  `T` = the film's time; `seed` keeps two clouds apart */
export const dust = (into: THREE.Object3D, at: V3, r: number, n: number, color: string, T: number, seed = 0, size = 0.018) => {
  const key = `${color}:${size}`; let mat = DUSTMATS.get(key);
  if (!mat) { mat = new THREE.PointsMaterial({ color, size, map: DOT(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true, opacity: 0.9 }); DUSTMATS.set(key, mat); }
  const pos = new Float32Array(n * 3), cols = new Float32Array(n * 3), rnd = (i: number, k: number) => { const x = Math.sin((i + 1) * 12.9898 + k * 78.233 + seed * 37.719) * 43758.5453; return x - Math.floor(x); };
  for (let i = 0; i < n; i++) { const u = rnd(i, 1) * 2 - 1, th = rnd(i, 2) * Math.PI * 2, rr = r * Math.cbrt(rnd(i, 3)), s = Math.sqrt(1 - u * u), rise = ((T * 0.05 + rnd(i, 4)) % 1) * 2 - 1;
    pos[i * 3] = at[0] + rr * s * Math.cos(th) + 0.04 * Math.sin(T * 0.7 + i); pos[i * 3 + 1] = at[1] + rr * u * 0.6 + rise * r * 0.35; pos[i * 3 + 2] = at[2] + rr * s * Math.sin(th) + 0.04 * Math.cos(T * 0.6 + i * 1.3);
    const b = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(T * (0.8 + rnd(i, 5)) + i)); cols[i * 3] = cols[i * 3 + 1] = cols[i * 3 + 2] = b; }
  const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(pos, 3)); geo.setAttribute("color", new THREE.BufferAttribute(cols, 3)); mat.vertexColors = true;
  const p = new THREE.Points(geo, mat); p.renderOrder = 6; p.userData.own = true; p.name = "dust"; into.add(p); return p;
};

const GLINT = () => paint("floorglint", 128, 128, (g) => { const q = g.createRadialGradient(64, 64, 0, 64, 64, 64); q.addColorStop(0, "rgba(255,255,255,0.9)"); q.addColorStop(0.4, "rgba(255,255,255,0.35)"); q.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = q; g.fillRect(0, 0, 128, 128); });
/** A lamp seen again in a polished floor: a soft warm patch on the floor under it, stretched toward the lens as a reflection is */
export const floorGlint = (into: THREE.Object3D, under: V3, cam: Cam, color: string, w: number, strength: number) => {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w * 2.4), new THREE.MeshBasicMaterial({ map: GLINT(), color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: strength }));
  m.rotation.x = -Math.PI / 2; m.rotation.z = Math.atan2(cam.pos[0] - under[0], cam.pos[2] - under[2]); m.position.set(under[0], under[1] + 0.004, under[2]); m.renderOrder = 5; m.userData.own = true; into.add(m); return m;
};

/** A thing close before the lens, out of focus: a soft dark beam across the top of the picture (`d` metres before the lens, `drop`
 *  metres under the top edge of what the lens sees there), so that the picture has a blurred foreground over the room (Light and
 *  atmosphere: "a blurred foreground"). It lies only over the top edge, never over a figure */
export const foreBeam = (into: THREE.Object3D, cam: Cam, d: number, drop: number, color = "#24150c") => {
  const t = paint(`forebeam${color}`, 64, 256, (g) => { const q = g.createLinearGradient(0, 0, 0, 256); q.addColorStop(0, "rgba(0,0,0,0)"); q.addColorStop(0.3, color); q.addColorStop(0.7, color); q.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = q; g.fillRect(0, 0, 64, 256); });
  const f = new THREE.Vector3(...sub(cam.look, cam.pos)).normalize(), half = Math.tan((cam.fov * Math.PI) / 360) * d, up = new THREE.Vector3(0, 1, 0);
  const right = new THREE.Vector3().crossVectors(f, up).normalize(), u2 = new THREE.Vector3().crossVectors(right, f).normalize();
  const c = new THREE.Vector3(...cam.pos).addScaledVector(f, d).addScaledVector(u2, half - drop);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(half * 2 * (1080 / 1920) * 1.3, drop * 2.2), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, opacity: 0.92 }));
  m.position.copy(c); m.lookAt(new THREE.Vector3(...cam.pos)); m.renderOrder = 7; m.userData.own = true; m.name = "fore beam"; into.add(m); return m;
};

const RAYS = new Map<string, THREE.Texture>();
/** Rays from a lamp: soft streaks of light spreading from it (the light you see falling through the bars of a lantern into dusty air),
 *  on a sheet facing the lens a little behind the lamp, `size` metres across, added onto what lies behind. `down` = how much the rays
 *  lean downward (0 = all round, 1 = only down and to the sides); they fade out with the distance from the lamp, so that they lie over
 *  the dark air round it and are faint by the time they reach a head below it */
export const lampRays = (into: THREE.Object3D, at: V3, cam: Cam, size: number, color: string, alpha: number, seed = 0, down = 0.6) => {
  const key = `${seed}:${down}`; let t = RAYS.get(key);
  if (!t) { t = paint(`lamprays${key}`, 512, 512, (g, r) => { g.translate(256, 256); for (let i = 0; i < 26; i++) { const a = (i / 26) * Math.PI * 2 + r() * 0.2, dn = Math.max(0, Math.sin(a)), keep = 1 - down + down * dn;
      if (keep < 0.15) continue; const w = 0.03 + r() * 0.06, L = 170 + r() * 80, q = g.createLinearGradient(0, 0, Math.cos(a) * L, Math.sin(a) * L); q.addColorStop(0, `rgba(255,255,255,${0.55 * keep})`); q.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = q; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a - w) * L, Math.sin(a - w) * L); g.lineTo(Math.cos(a + w) * L, Math.sin(a + w) * L); g.closePath(); g.fill(); } }); RAYS.set(key, t); }
  const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshBasicMaterial({ map: t, color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: alpha }));
  const toCam = new THREE.Vector3(...sub(cam.pos, at)).normalize(); m.position.set(at[0] - toCam.x * 0.15, at[1] - toCam.y * 0.15, at[2] - toCam.z * 0.15); m.lookAt(new THREE.Vector3(...cam.pos));
  m.renderOrder = 5; m.userData.own = true; m.name = "lamp rays"; into.add(m); return m;
};
