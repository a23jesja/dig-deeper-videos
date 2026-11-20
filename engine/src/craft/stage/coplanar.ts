// Surfaces in the same plane (the review of v1t, 21 Nov 2026: the third depth fight after the deck panel's red band and the window bench).
// Two faces of two different things that lie in one plane, facing the same way, and overlap fight for the depth buffer: as the lens drifts the
// rounding gives one of them, then the other, and the patch blinks or stripes from frame to frame. This lists every such pair in a group (a
// film's world, a shot's things): where, how large the overlap, and which two things, by their names up the tree and their box sizes.
//   node scripts/film_info.mjs <film> coplanar
import * as THREE from "three";

/** how near two planes may lie and still fight (metres); a pair a little further apart is listed apart as a near miss */
export const COPLANAR = { fight: 0.002, near: 0.006, area: 1e-4, angle: 0.9998 };
type Tri = { a: THREE.Vector3; b: THREE.Vector3; c: THREE.Vector3; n: THREE.Vector3; d: number; mesh: number };
export type CoplanarPair = { a: string; b: string; at: [number, number, number]; gap: number; area: number; facing: "same" | "opposite";
  /** the two things, and points of their overlap (for the line of sight: seenIn) */
  ma: THREE.Mesh; mb: THREE.Mesh; pts: THREE.Vector3[]; n: THREE.Vector3 };

/** a thing's name for the report: its own name or its geometry and size, and the names of the groups it sits in */
const label = (m: THREE.Mesh) => { const g = m.geometry as THREE.BufferGeometry & { parameters?: Record<string, number> }, p = g.parameters;
  const size = p && "width" in p ? ` ${(+p.width).toFixed(3)}x${(+p.height).toFixed(3)}x${(+(p.depth ?? 0)).toFixed(3)}` : p && "radiusTop" in p ? ` r${(+p.radiusTop).toFixed(3)}/${(+p.radiusBottom).toFixed(3)} h${(+p.height).toFixed(3)}` : "";
  const up: string[] = []; for (let o: THREE.Object3D | null = m.parent; o; o = o.parent) if (o.name) up.push(o.name);
  return `${m.name || g.type.replace("Geometry", "")}${size}${up.length ? ` (in ${up.slice(0, 2).join(" < ")})` : ""}`; };
/** what is drawn with depth: shown, not an outline hull, not a decal (a decal lies on its surface on purpose, with a polygon offset) */
const counts = (m: THREE.Mesh) => { for (let o: THREE.Object3D | null = m; o; o = o.parent) if (!o.visible) return false;
  if (m.userData.decal) return false; const mats = (Array.isArray(m.material) ? m.material : [m.material]) as THREE.Material[];
  return !mats.every((x) => (x as THREE.ShaderMaterial).isShaderMaterial && x.side === THREE.BackSide) && mats.some((x) => x.depthTest !== false && x.visible !== false); };
/** the overlap of two triangles in one plane (u, v its axes): Sutherland-Hodgman clipping, the area in square metres */
const overlap = (A: THREE.Vector3[], B: THREE.Vector3[], o: THREE.Vector3, u: THREE.Vector3, v: THREE.Vector3) => {
  const to2 = (p: THREE.Vector3): [number, number] => { const q = p.clone().sub(o); return [q.dot(u), q.dot(v)]; };
  const area = (P: [number, number][]) => { let s = 0; for (let i = 0; i < P.length; i++) { const p = P[i], q = P[(i + 1) % P.length]; s += p[0] * q[1] - q[0] * p[1]; } return s / 2; };
  let poly = A.map(to2); const clip = B.map(to2); if (area(poly) < 0) poly.reverse(); if (area(clip) < 0) clip.reverse();
  for (let i = 0; i < clip.length && poly.length; i++) { const e0 = clip[i], e1 = clip[(i + 1) % clip.length], inside = (p: [number, number]) => (e1[0] - e0[0]) * (p[1] - e0[1]) - (e1[1] - e0[1]) * (p[0] - e0[0]) >= 0;
    const out: [number, number][] = []; for (let j = 0; j < poly.length; j++) { const p = poly[j], q = poly[(j + 1) % poly.length], pi = inside(p), qi = inside(q);
      if (pi) out.push(p); if (pi !== qi) { const dx = q[0] - p[0], dy = q[1] - p[1], ex = e1[0] - e0[0], ey = e1[1] - e0[1], den = dx * ey - dy * ex; if (Math.abs(den) > 1e-12) { const t = ((e0[0] - p[0]) * ey - (e0[1] - p[1]) * ex) / den; out.push([p[0] + t * dx, p[1] + t * dy]); } } }
    poly = out; }
  return { area: poly.length >= 3 ? Math.abs(area(poly)) : 0, pts: poly.map(([x, y]) => o.clone().addScaledVector(u, x).addScaledVector(v, y)) }; };

/** every pair of faces of two different things in `root` (with `only`: pairs with at least one face under it) that lie in one plane (within COPLANAR.near) and overlap by more than COPLANAR.area */
export const coplanar = (root: THREE.Object3D, only?: THREE.Object3D): CoplanarPair[] => {
  const mine = new Set<THREE.Object3D>(); only?.traverse((o) => mine.add(o));
  root.updateMatrixWorld(true); const meshes: THREE.Mesh[] = [], tris: Tri[] = [];
  root.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh && counts(m)) meshes.push(m); });
  meshes.forEach((m, mi) => { const g = m.geometry as THREE.BufferGeometry, pos = g.getAttribute("position"); if (!pos) return; const idx = g.index, n = idx ? idx.count : pos.count;
    for (let i = 0; i + 2 < n; i += 3) { const v = [0, 1, 2].map((k) => new THREE.Vector3().fromBufferAttribute(pos, idx ? idx.getX(i + k) : i + k).applyMatrix4(m.matrixWorld));
      const nn = v[1].clone().sub(v[0]).cross(v[2].clone().sub(v[0])); const ar = nn.length() / 2; if (ar < COPLANAR.area) continue; nn.normalize();
      tris.push({ a: v[0], b: v[1], c: v[2], n: nn, d: nn.dot(v[0]), mesh: mi }); } });
  // (grouped by the plane's way, its sign made one, and its distance in bins of `near`: a pair is looked for in its own bin and the next)
  const key = (t: Tri) => { const s = Math.sign(t.n.x || t.n.y || t.n.z) || 1, k = (x: number) => Math.round(x * s * 50); return `${k(t.n.x)},${k(t.n.y)},${k(t.n.z)}`; };
  const bins = new Map<string, Tri[]>();
  for (const t of tris) { const s = Math.sign(t.n.x || t.n.y || t.n.z) || 1, b = Math.floor((t.d * s) / COPLANAR.near), k = `${key(t)}|${b}`; (bins.get(k) ?? bins.set(k, []).get(k)!).push(t); }
  const best = new Map<string, CoplanarPair>();
  for (const [k, list] of bins) { const [nk, bs] = k.split("|"), more = bins.get(`${nk}|${+bs + 1}`) ?? [];
    for (let i = 0; i < list.length; i++) for (const t2 of [...list.slice(i + 1), ...more]) { const t1 = list[i]; if (t1.mesh === t2.mesh || (only && !mine.has(meshes[t1.mesh]) && !mine.has(meshes[t2.mesh]))) continue;
      const dot = t1.n.dot(t2.n); if (Math.abs(dot) < COPLANAR.angle) continue; const gap = Math.abs(t2.n.dot(t1.a) - t2.d); if (gap > COPLANAR.near) continue;
      const u = t1.b.clone().sub(t1.a).normalize(), v = t1.n.clone().cross(u), ov = overlap([t1.a, t1.b, t1.c], [t2.a, t2.b, t2.c], t1.a, u, v), ar = ov.area; if (ar < COPLANAR.area) continue;
      const mc = ov.pts.reduce((q, p) => q.add(p), new THREE.Vector3()).divideScalar(ov.pts.length), smp = [mc, ...ov.pts.map((p) => p.clone().lerp(mc, 0.15))];
      const [ma, mb] = t1.mesh < t2.mesh ? [t1.mesh, t2.mesh] : [t2.mesh, t1.mesh], pk = `${ma}|${mb}|${dot > 0 ? 1 : 0}`, c = t1.a.clone().add(t1.b).add(t1.c).divideScalar(3), had = best.get(pk);
      if (!had) best.set(pk, { a: label(meshes[ma]), b: label(meshes[mb]), at: c.toArray().map((x) => +x.toFixed(3)) as [number, number, number], gap: +gap.toFixed(4), area: +ar.toFixed(5), facing: dot > 0 ? "same" : "opposite", ma: meshes[ma], mb: meshes[mb], pts: smp, n: t1.n.clone() });
      else { had.area = +(had.area + ar).toFixed(5); had.gap = Math.min(had.gap, +gap.toFixed(4)); if (had.pts.length < 60) had.pts.push(...smp); } } }
  return [...best.values()].sort((x, y) => x.gap - y.gap || y.area - x.area);
};

/** where a pair can be seen from a lens at `pos` (looking at `look`, field `fov`): a point of the overlap inside the picture whose ray from the
 *  lens first meets one of the two things (within 1 cm of the point), not something in front of it. `live` = the things drawn in that shot */
export const seenFrom = (p: CoplanarPair, pos: THREE.Vector3, look: THREE.Vector3, fov: number, live: THREE.Mesh[]) => {
  const lens = new THREE.PerspectiveCamera(fov, 1080 / 1920, 0.05, 3000); lens.position.copy(pos); lens.lookAt(look); lens.updateMatrixWorld(true); lens.updateProjectionMatrix();
  const ray = new THREE.Raycaster(); let n = 0; const pic: [number, number][] = [];
  // (a face turned away from the lens is not drawn: a pair facing the same way is seen only from its front)
  for (const q of p.pts) { const sc = q.clone().project(lens); if (sc.z > 1 || Math.abs(sc.x) > 1 || Math.abs(sc.y) > 1 || p.n.dot(pos.clone().sub(q)) <= 0) continue;
    const dir = q.clone().sub(pos), dist = dir.length(); ray.set(pos, dir.normalize()); ray.far = dist + 0.02;
    const hit = ray.intersectObjects(live, false)[0]; if (hit && Math.abs(hit.distance - dist) < 0.01 && (hit.object === p.ma || hit.object === p.mb)) { n++; pic.push([Math.round((sc.x + 1) * 540), Math.round((1 - sc.y) * 960)]); } }
  return { n, pic };
};
