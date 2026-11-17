// Placing a camera and the things in front of it: shared by every Short.
import * as THREE from "three";
import { Actor, Cam, V3, Staged, mix3 } from "./film";
import { figureCard } from "../world/people";

/** a camera at (cx, cy, cz) looking along (fx, fz) on the ground, tipped by pitch degrees. `spot(d, l)` is the place d metres ahead
 *  and l metres to the right of it; `toward(x, z, off)` is the heading that faces the lens, turned by `off` degrees */
export const lens = (cx: number, cy: number, cz: number, fx: number, fz: number, pitch: number, fov: number) => {
  const n = Math.hypot(fx, fz); fx /= n; fz /= n;
  const at = (by: number, up = 0, tip = 0): Cam => ({ pos: [cx + fx * by, cy + up, cz + fz * by], look: [cx + fx * (4 + by), cy + up + 4 * Math.tan(((pitch + tip) * Math.PI) / 180), cz + fz * (4 + by)], fov });
  return { cam: at(0),
    spot: (d: number, l: number): [number, number] => [cx + d * fx - l * fz, cz + d * fz + l * fx],
    toward: (x: number, z: number, off = 0) => (Math.atan2(cx - x, cz - z) * 180) / Math.PI + off,
    /** the same lens moved `by` metres along its own way of looking (a slow push in or pull back), lifted by `up`, tipped by `tip` degrees more */
    push: at };
};
/** a lens placed by what it looks at: the point (x, z) lies d metres ahead of it and l metres to the right of the middle of the
 *  picture; it looks along `dir` degrees (0 = toward +z, 90 = toward +x) from the height cy */
export const aim = (x: number, z: number, d: number, l: number, dir: number, cy: number, pitch: number, fov: number) => {
  const fx = Math.sin((dir * Math.PI) / 180), fz = Math.cos((dir * Math.PI) / 180);
  return lens(x - d * fx + l * fz, cy, z - d * fz - l * fx, fx, fz, pitch, fov);
};
/** a thing that is built once and then moved by the shots */
export const once = <T,>(make: () => T) => { let v: T | undefined; return () => (v ??= make()); };
export const noShade = <T extends THREE.Object3D>(o: T) => { o.traverse((q) => { q.castShadow = false; }); return o; };
export const put = (into: THREE.Group, o: THREE.Object3D, p: V3, ry = 0) => { o.position.set(...p); o.rotation.set(0, ry, 0); into.add(o); return o; };
export const between = (a: V3, b: V3, u = 0.5): V3 => mix3(a, b, u);
/** a point `d` metres in front of a figure (things held before the body stand off the card, on the side the figure faces) */
export const ahead = (a: Staged, p: V3, d: number): V3 => [p[0] + Math.sin((a.heading * Math.PI) / 180) * d, p[1], p[2] + Math.cos((a.heading * Math.PI) / 180) * d];
/** a point moved `d` metres toward the lens (in front of a card) or, with a negative d, behind it */
export const near = (p: V3, cam: Cam, d: number): V3 => { const dx = cam.pos[0] - p[0], dz = cam.pos[2] - p[2], n = Math.hypot(dx, dz) || 1; return [p[0] + (dx / n) * d, p[1], p[2] + (dz / n) * d]; };

// ---------------- grips: a held thing sits in the hand, a carried thing hangs between two hands ----------------
/** the palm of a figure's hand in the world: `slide` of the way from the wrist to the finger tips */
export const palm = (a: Staged, side: "L" | "R", slide = 0.45): V3 => { const w = a.joint(side === "L" ? "wrL" : "wrR"), t = a.joint(side === "L" ? "tipL" : "tipR"); return mix3(w, t, slide); };
/** Where a figure's palm is at another moment than the frame being drawn. A thing that leaves a hand (dropped, thrown, put down)
 *  must start its fall or its flight where the hand was at that moment, not where the hand is now. Give it the figure as the shot's
 *  cast makes it for that moment, and keep the answer: the figure is drawn once to find out */
export const palmThen = (a: Actor, side: "L" | "R", cam: Cam, slide = 0.45): V3 => {
  const p = figureCard(a.D, a.pose, a.o, { at: a.at, heading: a.heading, h: a.h }, cam.pos), at = palm({ ...a, joint: p.joint, mesh: p.mesh }, side, slide);
  p.mesh.traverse((o) => { const m = o as THREE.Mesh; if (!m.isMesh) return; m.geometry?.dispose(); for (const mat of (Array.isArray(m.material) ? m.material : [m.material]) as THREE.MeshBasicMaterial[]) { mat.map?.dispose(); mat.dispose(); } });
  return at;
};
/** the way the lens looks along the ground, and what is to the right in the picture */
const view = (cam: Cam) => { const fx = cam.look[0] - cam.pos[0], fz = cam.look[2] - cam.pos[2], n = Math.hypot(fx, fz) || 1; return { rx: -fz / n, rz: fx / n }; };
/** the angle of a figure's forearm in the picture (radians, 0 = pointing to the right, 90 degrees = straight up) */
export const forearm = (a: Staged, side: "L" | "R", cam: Cam) => { const e = a.joint(side === "L" ? "elL" : "elR"), w = a.joint(side === "L" ? "wrL" : "wrR"), v = view(cam); return Math.atan2(w[1] - e[1], (w[0] - e[0]) * v.rx + (w[2] - e[2]) * v.rz); };
/** A thing held in a hand. Its own origin (its grip) is put in the palm, a little behind the card so that the drawn fingers close
 *  over it (`d` metres toward the lens; negative = behind the card, where a grip belongs), and it lies in the plane of the picture:
 *  along the forearm turned by `turn` degrees (0 = straight on from the forearm, as a blade or a stick is held out; 90 = square
 *  across it toward the thumb). `level` = an angle in the picture instead of the forearm's (0 = lying to the right, 90 = upright),
 *  for what hangs or stands by its own weight (a mug, a bucket, a bunch of grapes). flip = true mirrors it left to right, for a
 *  thing that must point the other way in the picture. Use it for everything that is held, so that the thing follows the hand on
 *  every frame */
export const hold = (into: THREE.Group, o: THREE.Object3D, a: Staged, side: "L" | "R", cam: Cam, opt: { turn?: number; level?: number; d?: number; slide?: number; flip?: boolean; lift?: number } = {}) => {
  const v = view(cam), p = near(palm(a, side, opt.slide ?? 0.45), cam, opt.d ?? -0.035), ang = opt.level !== undefined ? (opt.level * Math.PI) / 180 : forearm(a, side, cam) + ((opt.turn ?? 0) * Math.PI) / 180;
  o.position.set(p[0], p[1] + (opt.lift ?? 0), p[2]); o.rotation.set(0, Math.atan2(-v.rz, v.rx) + (opt.flip ? Math.PI : 0), opt.flip ? -ang + Math.PI : ang); into.add(o); return o;
};
/** A thing carried between two hands (of one figure or of two): its middle is put half way between the two palms and it is turned
 *  so that its own x axis runs from the first palm to the second, in the picture's plane. Returns the two palms, for the handles or
 *  the rope a film draws from the thing's ends into the hands */
export const carry = (into: THREE.Group, o: THREE.Object3D, a: Staged, sa: "L" | "R", b: Staged, sb: "L" | "R", cam: Cam, opt: { d?: number; drop?: number } = {}) => {
  const v = view(cam), pa = palm(a, sa), pb = palm(b, sb), m = near(mix3(pa, pb, 0.5), cam, opt.d ?? 0.04), ang = Math.atan2(pb[1] - pa[1], (pb[0] - pa[0]) * v.rx + (pb[2] - pa[2]) * v.rz);
  o.position.set(m[0], m[1] - (opt.drop ?? 0), m[2]); o.rotation.set(0, Math.atan2(-v.rz, v.rx), ang); into.add(o); return { pa, pb, m };
};
