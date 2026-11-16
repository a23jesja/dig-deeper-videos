// Placing a camera and the things in front of it: shared by every Short.
import * as THREE from "three";
import { Cam, V3, Staged, mix3 } from "./film";

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
