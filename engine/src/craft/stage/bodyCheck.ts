// Nothing goes into anything (Jesper, 18 November 2026, after people walked through a stone block in Nero; DAILY-RULES.md,
// "Impossible things: zero tolerance"). On every frame of every shot, every figure in it, the people in the background as much as those
// in front, is laid out as a body of round pieces (head, chest, arms, hands, thighs, shins, feet: capsules of a real person's thickness
// for the figure's height) and tested against:
//   - every solid thing of the set: the world, and what the shot puts in it that stands still through the shot (a block, a bench, a
//     stool, a barrel, a post, a rail, a wall); boxes, cylinders, balls and turned shapes are measured exactly, any other shape is felt
//     for with short rays from the body;
//   - every thing held in a hand, except by the hand or hands that hold it (the writing hand through the sheet held in the other);
//   - every other figure (two people in the same space);
//   - the ground under the feet: the lower foot rests on what is under it, neither above it nor sunk into it, and a foot that rests does
//     not slide.
// A thing the figure stands on (its top no higher than his feet) is his floor, not a thing he stands in. A thing that encloses the lens
// (the sky) is left out. The faults are kept per shot, figure and thing, with the frames they run over and the deepest point.
import * as THREE from "three";
import type { Film, Staged, V3 } from "./film";
import { stageAt } from "./staging";
import { AUDIT } from "./grips";
import { CROWD_LOG } from "../world/people";
import { solve, type Joint } from "../rig";
import { jointLimits, lockedElbows, lowness } from "./humanBody";
import { seated } from "../designs/common";

type Kind = "box" | "cyl" | "ball" | "lathe" | "probe";
/** a solid thing as the check sees it, in the world as it stands on the frame it was read */
type Ob = { name: string; kind: Kind; M: THREE.Matrix4; inv: THREE.Matrix4; s: [number, number, number]; bb: THREE.Box3; aabb: THREE.Box3;
  geo: THREE.BufferGeometry; mesh: THREE.Mesh; closed: boolean; prof?: [number, number][]; holder?: string; root?: THREE.Object3D };
type Part = { name: string; a: Joint | [Joint, Joint, number]; b: Joint | [Joint, Joint, number]; r: number; tol: number; hand?: "L" | "R"; foot?: boolean };

/** the pieces of a body, for a figure 1.8 m tall (scaled with its height); tol = how far a thing may press into the piece before it
 *  counts as inside it (a hand rests on a table, a seat takes the weight of the one who sits) */
const PARTS: Part[] = [
  { name: "head", a: ["crown", "skull", 0.22], b: ["crown", "skull", 0.78], r: -0.3, tol: 0.015 },
  { name: "chest", a: "neck", b: ["neck", "pelvis", 0.55], r: 0.11, tol: 0.015 },
  { name: "belly", a: ["neck", "pelvis", 0.55], b: "pelvis", r: 0.085, tol: 0.03 },
  { name: "left upper arm", a: "shL", b: "elL", r: 0.045, tol: 0.02 }, { name: "right upper arm", a: "shR", b: "elR", r: 0.045, tol: 0.02 },
  { name: "left forearm", a: "elL", b: "wrL", r: 0.04, tol: 0.025, hand: "L" }, { name: "right forearm", a: "elR", b: "wrR", r: 0.04, tol: 0.025, hand: "R" },
  { name: "left hand", a: "wrL", b: "tipL", r: 0.04, tol: 0.035, hand: "L" }, { name: "right hand", a: "wrR", b: "tipR", r: 0.04, tol: 0.035, hand: "R" },
  { name: "left thigh", a: "hipL", b: "knL", r: 0.065, tol: 0.03 }, { name: "right thigh", a: "hipR", b: "knR", r: 0.065, tol: 0.03 },
  { name: "left shin", a: "knL", b: "anL", r: 0.05, tol: 0.015 }, { name: "right shin", a: "knR", b: "anR", r: 0.05, tol: 0.015 },
  { name: "left foot", a: "heelL", b: "toeL", r: 0.035, tol: 0.02, foot: true }, { name: "right foot", a: "heelR", b: "toeR", r: 0.035, tol: 0.02, foot: true },
];

/** how much wider each piece is drawn than it is deep (the card: a chest seen from the front is twice as wide as it is deep) */
const WIDE: Record<string, number> = { head: 1.25, chest: 1.6, belly: 1.7, "left thigh": 1.25, "right thigh": 1.25, "left shin": 1.2, "right shin": 1.2 };
const solidMat = (m: THREE.Mesh) => {
  const mats = (Array.isArray(m.material) ? m.material : [m.material]) as THREE.Material[];
  return mats.every((x) => x && x.visible !== false && x.side !== THREE.BackSide && !(x.transparent && (x as THREE.MeshBasicMaterial).opacity < 0.9) && x.blending !== THREE.AdditiveBlending);
};
const nameOf = (o: THREE.Object3D | null) => { for (let p = o; p; p = p.parent) if (p.name) return p.name; return ""; };
const hiddenBy = (o: THREE.Object3D, hide: Set<string>) => { for (let p: THREE.Object3D | null = o; p; p = p.parent) if (p.name && hide.has(p.name)) return true; return false; };
const describe = (o: Ob) => { const c = o.aabb.getCenter(new THREE.Vector3()), z = o.aabb.getSize(new THREE.Vector3()), what = o.geo.type.replace("Geometry", "").toLowerCase();
  return `${o.name || `a ${what}`} (${z.x.toFixed(2)} x ${z.y.toFixed(2)} x ${z.z.toFixed(2)} m at ${c.x.toFixed(2)}, ${c.y.toFixed(2)}, ${c.z.toFixed(2)})`; };

/** a solid thing read from a mesh as it stands now, or null for what is not one (a glow, smoke, an outline, a mere point) */
const obOf = (m: THREE.Mesh, holder?: string): Ob | null => {
  if (!m.isMesh || !m.visible || !solidMat(m) || !m.geometry) return null;
  let p: THREE.Object3D | null = m; while (p) { if (!p.visible) return null; p = p.parent; }
  const geo = m.geometry; if (!geo.boundingBox) geo.computeBoundingBox(); const bb = geo.boundingBox!.clone(); if (bb.isEmpty()) return null;
  m.updateMatrixWorld(true); const M = m.matrixWorld.clone(), inv = M.clone().invert(), e = M.elements, s: [number, number, number] = [Math.hypot(e[0], e[1], e[2]), Math.hypot(e[4], e[5], e[6]), Math.hypot(e[8], e[9], e[10])];
  const aabb = bb.clone().applyMatrix4(M), z = aabb.getSize(new THREE.Vector3()); if (Math.max(z.x, z.y, z.z) < 0.05) return null;
  // the rays of the check meet a surface from either side (from inside a closed thing too); this copy of the set is the check's own
  for (const x of (Array.isArray(m.material) ? m.material : [m.material]) as THREE.Material[]) x.side = THREE.DoubleSide;
  const t = geo.type; let kind: Kind = "probe", prof: [number, number][] | undefined;
  if (t === "BoxGeometry") kind = "box"; else if (t === "CylinderGeometry") kind = "cyl"; else if (t === "SphereGeometry") kind = "ball";
  else if (t === "LatheGeometry") { kind = "lathe"; prof = ((geo as THREE.LatheGeometry).parameters.points as THREE.Vector2[]).map((v) => [v.x, v.y]); }
  return { name: nameOf(m), kind, M, inv, s, bb, aabb, geo, mesh: m, closed: t === "ExtrudeGeometry", prof, holder };
};

const sub3 = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], dot3 = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const norm3 = (a: V3): V3 => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }, mid3 = (a: V3, b: V3): V3 => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
const segD2 = (px: number, py: number, ax: number, ay: number, bx: number, by: number) => { const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy, k = L ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / L)) : 0; return Math.hypot(px - ax - dx * k, py - ay - dy * k); };
const inPoly = (x: number, y: number, P: [number, number][]) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi || 1e-12) + xi) c = !c; } return c; };
const rc = new THREE.Raycaster(), DIRS = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1], [0.577, 0.577, 0.577], [-0.577, 0.577, -0.577], [0.577, -0.577, -0.577], [-0.577, -0.577, 0.577]].map((d) => new THREE.Vector3(...d));
/** how far the point is from the thing's surface, in metres: negative inside it */
const dist = (o: Ob, p: THREE.Vector3, r: number): number => {
  const q = p.clone().applyMatrix4(o.inv), [sx, sy, sz] = o.s;
  if (o.kind === "box") { const { min, max } = o.bb, inside = q.x > min.x && q.x < max.x && q.y > min.y && q.y < max.y && q.z > min.z && q.z < max.z;
    if (inside) return -Math.min((q.x - min.x) * sx, (max.x - q.x) * sx, (q.y - min.y) * sy, (max.y - q.y) * sy, (q.z - min.z) * sz, (max.z - q.z) * sz);
    const c = new THREE.Vector3(Math.max(min.x, Math.min(max.x, q.x)), Math.max(min.y, Math.min(max.y, q.y)), Math.max(min.z, Math.min(max.z, q.z))).applyMatrix4(o.M); return c.distanceTo(p); }
  if (o.kind === "cyl") { const P = (o.geo as THREE.CylinderGeometry).parameters, h = P.height / 2, k = Math.max(0, Math.min(1, (q.y + h) / (2 * h || 1))), R = P.radiusBottom + (P.radiusTop - P.radiusBottom) * k, sr = (sx + sz) / 2;
    const dr = (Math.hypot(q.x, q.z) - R) * sr, dy = (Math.abs(q.y) - h) * sy; return dr < 0 && dy < 0 ? Math.max(dr, dy) : Math.hypot(Math.max(dr, 0), Math.max(dy, 0)); }
  if (o.kind === "ball") { const R = (o.geo as THREE.SphereGeometry).parameters.radius; return (q.length() - R) * ((sx + sy + sz) / 3); }
  if (o.kind === "lathe" && o.prof) { const P = o.prof, sr = (sx + sz) / 2, rho = Math.hypot(q.x, q.z), y = q.y, f = P[0], l = P[P.length - 1];
    const loop = Math.hypot(f[0] - l[0], f[1] - l[1]) < 1e-3 ? P : [[0, f[1]] as [number, number], ...P, [0, l[1]] as [number, number]];
    let d = Infinity; for (let i = 0; i < loop.length - 1; i++) d = Math.min(d, segD2(rho * sr, y * sy, loop[i][0] * sr, loop[i][1] * sy, loop[i + 1][0] * sr, loop[i + 1][1] * sy));
    return inPoly(rho, y, loop) ? -d : d; }
  // any other shape: short rays from the point; the nearest surface within reach is how far it is. A closed shape (an extruded hull, a
  // slab) also counts as round the point when a ray straight up meets its inside first
  let best = Infinity; for (const d of DIRS) { rc.set(p, d); rc.near = 0; rc.far = r + 0.06; const h = rc.intersectObject(o.mesh, false)[0]; if (h) best = Math.min(best, h.distance); }
  if (o.closed) { rc.set(p, DIRS[2]); rc.near = 0; rc.far = 200; const h = rc.intersectObject(o.mesh, false)[0];
    if (h?.face) { const n = h.face.normal.clone().transformDirection(o.M); if (n.y > 0.05) return -Math.min(best, h.distance); } }
  return best;
};

/** what lies at a pixel of a frame (x, y in the 1080 x 1920 picture): every mesh of the set and of the shot's things the ray from the lens
 *  meets, nearest first, with its colour, its size and where it is, and the names of the groups it is in (to find a shape nobody can name
 *  in the picture: Blackbeard v4, a dark shape at the hook's edge). The figures are drawn cards and are not in it */
export const pickAt = (film: Film, frame: number, x: number, y: number) => {
  const T = frame / film.fps, s = film.shots.find((q) => T >= q.a - 1e-6 && T < q.b) ?? film.shots[film.shots.length - 1], t = Math.max(0, T - s.a), cam = s.cam(t, t / (s.b - s.a));
  const st: Record<string, Staged> = {}; for (const a of s.cast(t, s.a + t)) st[a.name] = stageAt(a, cam);
  const world = film.world(), g = new THREE.Group(); AUDIT.rows = []; AUDIT.on = true; CROWD_LOG.on = false;
  try { s.things?.(g, st, t, s.a + t, cam); } finally { AUDIT.on = false; }
  const root = new THREE.Group(); root.add(world, g); root.updateMatrixWorld(true);
  const hide = new Set(s.hide ?? []); root.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh && m.material) (Array.isArray(m.material) ? m.material : [m.material]).forEach((q) => (q.side = THREE.DoubleSide)); });
  const lens = new THREE.PerspectiveCamera(cam.fov, 1080 / 1920, 0.05, 3000); lens.position.set(...cam.pos); lens.lookAt(...cam.look); lens.updateProjectionMatrix(); lens.updateMatrixWorld(true);
  const rc = new THREE.Raycaster(); rc.setFromCamera(new THREE.Vector2((x / 1080) * 2 - 1, 1 - (y / 1920) * 2), lens);
  return { shot: s.id, t, hits: rc.intersectObject(root, true).filter((h) => !hiddenBy(h.object, hide) && h.object.visible).slice(0, 6).map((h) => { const m = h.object as THREE.Mesh, b = new THREE.Box3().setFromObject(m), z = b.getSize(new THREE.Vector3()), c = b.getCenter(new THREE.Vector3());
    const names: string[] = []; for (let p: THREE.Object3D | null = m; p; p = p.parent) if (p.name) names.push(p.name);
    const mat = (Array.isArray(m.material) ? m.material[0] : m.material) as THREE.MeshBasicMaterial;
    return { d: +h.distance.toFixed(2), colour: mat?.color ? `#${mat.color.getHexString()}` : "?", geo: m.geometry?.type, size: [z.x, z.y, z.z].map((v) => +v.toFixed(2)), at: [c.x, c.y, c.z].map((v) => +v.toFixed(2)), names, inThings: (() => { for (let p: THREE.Object3D | null = m; p; p = p.parent) if (p === g) return true; return false; })() }; }) };
};

export type BodyFault = { shot: string; who: string; what: string; f0: number; f1: number; deep: number; kind: "solid" | "held" | "figure" | "floor" | "slide" | "pose" };

/** the faults of a film (all of them, every frame unless `every` > 1), and how much was tried */
export const bodyCheck = (film: Film, opt: { every?: number; shots?: string[] } = {}) => {
  const faults = new Map<string, BodyFault>(), every = opt.every ?? 1; let frames = 0, pairs = 0, figuresTried = 0;
  const note = (k: string, f: Omit<BodyFault, "f0" | "f1" | "deep">, F: number, deep: number) => { const e = faults.get(k); if (e) { e.f1 = F; e.deep = Math.max(e.deep, deep); } else faults.set(k, { ...f, f0: F, f1: F, deep }); };
  const world = film.world(); world.updateMatrixWorld(true);
  const worldObs: Ob[] = []; world.traverse((o) => { const b = obOf(o as THREE.Mesh); if (b) worldObs.push(b); });
  const things = (s: Film["shots"][number], t: number, staged: Record<string, Staged>) => { const g = new THREE.Group(); AUDIT.rows = []; AUDIT.on = true; CROWD_LOG.on = true; CROWD_LOG.heads.length = 0;
    try { s.things?.(g, staged, t, s.a + t, s.cam(t, t / (s.b - s.a))); } finally { AUDIT.on = false; CROWD_LOG.on = false; } g.updateMatrixWorld(true);
    const crowd = [...CROWD_LOG.heads];
    // a thing two carry is in the rows once for each of them: it is held by both
    const heldBy = new Map<THREE.Object3D, string>(); for (const r of AUDIT.rows) if (r.o) { const h = r.holder || (/sheath|scabbard/.test(r.use) ? "worn" : ""), was = heldBy.get(r.o); heldBy.set(r.o, was && h && was !== "worn" && h !== "worn" && !was.split(" & ").includes(h) ? `${was} & ${h}` : was || h); }
    return { g, heldBy, rows: [...AUDIT.rows], crowd }; };
  const holderOf = (o: THREE.Object3D, heldBy: Map<THREE.Object3D, string>) => { for (let p: THREE.Object3D | null = o; p; p = p.parent) { const h = heldBy.get(p); if (h !== undefined) return h; } return undefined; };
  const rootOf = (o: THREE.Object3D, heldBy: Map<THREE.Object3D, string>) => { for (let p: THREE.Object3D | null = o; p; p = p.parent) if (heldBy.has(p)) return p; return o; };
  // where a thing of the shot stands: its shape and the middle of its box (a sign turned toward the lens on every frame stands still)
  const placeOf = (m: THREE.Mesh) => { if (!m.geometry.boundingBox) m.geometry.computeBoundingBox(); return { g: m.geometry.uuid, c: m.geometry.boundingBox!.getCenter(new THREE.Vector3()).applyMatrix4(m.matrixWorld) }; };
  for (const s of film.shots) { if (opt.shots && !opt.shots.includes(s.id)) continue;
    const hide = new Set(s.hide ?? []), base = worldObs.filter((o) => !hiddenBy(o.mesh, hide));
    const F0 = Math.ceil(s.a * film.fps - 1e-6), F1 = Math.ceil(s.b * film.fps - 1e-6), times: number[] = []; for (let F = F0; F < F1; F += every) times.push(Math.max(0, F / film.fps - s.a));
    const stage = (t: number) => { const cam = s.cam(t, t / (s.b - s.a)), st: Record<string, Staged> = {}; for (const a of s.cast(t, s.a + t)) st[a.name] = stageAt(a, cam); return { cam, st }; };
    // what the shot puts in the set and leaves standing: the same thing in the same place at six moments through the shot
    const probe = [0, 0.2, 0.4, 0.6, 0.8, 1].map((k) => times[Math.min(times.length - 1, Math.round(k * (times.length - 1)))]);
    // things carried on a body but in no hand (a sack on the back, a bundle hugged): the same object near a figure at every moment read
    const carried = new Set<string>(), nearAll = new Map<string, number>();
    const fixed: Ob[] = []; { const later: Map<string, THREE.Vector3[]>[] = [];
      for (const t of probe.slice(1)) { const { st } = stage(t), th = things(s, t, st), at = new Map<string, THREE.Vector3[]>();
        const joints: THREE.Vector3[] = []; for (const a of Object.values(st)) for (const j of ["neck", "pelvis", "skull", "wrL", "wrR", "shL", "shR"] as Joint[]) joints.push(new THREE.Vector3(...a.joint(j)));
        th.g.traverse((o) => { const m = o as THREE.Mesh; if (!m.isMesh || holderOf(m, th.heldBy)) return; const { g, c } = placeOf(m); at.set(g, [...(at.get(g) ?? []), c]);
          if (joints.some((j) => j.distanceTo(c) < 0.35)) nearAll.set(m.uuid, (nearAll.get(m.uuid) ?? 0) + 1); }); later.push(at); }
      for (const [u, n] of nearAll) if (n === probe.length - 1) carried.add(u);
      // read last, from a call whose objects are not moved since: the things of the first moment that stand in the same place in all
      const { st } = stage(probe[0]), th = things(s, probe[0], st);
      th.g.traverse((o) => { const m = o as THREE.Mesh; if (!m.isMesh || holderOf(m, th.heldBy)) return; const { g, c } = placeOf(m); if (!later.every((at) => (at.get(g) ?? []).some((q) => q.distanceTo(c) < 0.03))) return; const b = obOf(m); if (b) fixed.push(b); }); }
    // how long each figure's pose has been held so (the human tests that need a time: half a second of a straight arm, and so on)
    const runs = new Map<string, { start: number; n: number }>();
    const prevFoot = new Map<string, { heel: V3; toe: V3; side: "L" | "R"; rest: boolean }>(), airborne = new Map<string, number>(), sliding = new Map<string, number>();
    const lens = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 3000);
    for (const t of times) { const F = Math.round((s.a + t) * film.fps), { cam, st } = stage(t), th = things(s, t, st), C = new THREE.Vector3(...cam.pos); frames++;
      lens.fov = cam.fov; lens.position.copy(C); lens.lookAt(...cam.look); lens.updateProjectionMatrix(); lens.updateMatrixWorld(true);
      // what the lens can see: a fault anywhere in the picture counts, however small or far; one out of the picture cannot be seen
      const seen = (p: THREE.Vector3, r = 0) => { const q = p.clone().project(lens), d = p.distanceTo(C), m = r / Math.max(0.1, d); return q.z < 1 && q.z > -1 && Math.abs(q.x) < 1 + m && Math.abs(q.y) < 1 + m; };
      const held: Ob[] = []; th.g.traverse((o) => { const m = o as THREE.Mesh; if (!m.isMesh) return; const h = holderOf(m, th.heldBy); if (!h || h === "worn") return; const b = obOf(m, h); if (b) { b.root = rootOf(m, th.heldBy); held.push(b); } });
      // what the shot moves but nobody holds (a gate's leaf swinging open, a door, a cart): a solid on this frame where it stands now. Small
      // things that go with a figure (a fuse, a bandage, a ribbon) are left out: under 0.4 m
      const moving: Ob[] = []; th.g.traverse((o) => { const m = o as THREE.Mesh; if (!m.isMesh || holderOf(m, th.heldBy) || carried.has(m.uuid)) return; const { g: gu, c } = placeOf(m); if (fixed.some((f) => f.geo.uuid === gu && f.aabb.getCenter(new THREE.Vector3()).distanceTo(c) < 0.05)) return;
        // (and only things with a body to them: flames, glows and painted cards are flat, and fire is not a solid)
        if (m.geometry.type === "PlaneGeometry" || m.geometry.type === "ShapeGeometry" || m.geometry.type === "BufferGeometry") return;
        const b = obOf(m); if (b && Math.max(...b.aabb.getSize(new THREE.Vector3()).toArray()) >= 0.4) moving.push(b); });
      const solids = [...base, ...fixed, ...moving].filter((o) => !o.aabb.containsPoint(C));
      const carriedNow: Ob[] = []; th.g.traverse((o) => { const m = o as THREE.Mesh; if (!m.isMesh || !carried.has(m.uuid)) return; const b = obOf(m); if (b) carriedNow.push(b); });
      const bodies = Object.values(st).map((a) => { const sc = a.h / 1.8, J = (j: Joint | [Joint, Joint, number]) => { if (typeof j === "string") return new THREE.Vector3(...a.joint(j)); const [x, y, k] = j; return new THREE.Vector3(...a.joint(x)).lerp(new THREE.Vector3(...a.joint(y)), k); };
        const headL = new THREE.Vector3(...a.joint("crown")).distanceTo(new THREE.Vector3(...a.joint("skull")));
        const parts = PARTS.map((P) => { const A = J(P.a), B = J(P.b), r = P.r < 0 ? -P.r * headL : P.r * sc, n = Math.max(2, Math.ceil(A.distanceTo(B) / 0.035)), pts: THREE.Vector3[] = []; for (let i = 0; i <= n; i++) pts.push(A.clone().lerp(B, i / n)); return { P, r, pts, tol: P.tol * Math.max(1, sc) }; });
        const box = new THREE.Box3(); for (const q of parts) for (const p of q.pts) box.expandByPoint(p); box.expandByScalar(0.15); return { a, parts, box }; });
      figuresTried += bodies.length;
      // the dust and the added light of the shot (world/air.ts, world/fire.ts glows): motes as points, light as the meshes that add
      const air = { pts: [] as THREE.Vector3[], glows: [] as THREE.Mesh[] };
      th.g.traverse((o) => { const pt = o as THREE.Points; if (pt.isPoints) { pt.updateMatrixWorld(true); const P = pt.geometry.getAttribute("position"); for (let i = 0; i < P.count; i++) air.pts.push(new THREE.Vector3(P.getX(i), P.getY(i), P.getZ(i)).applyMatrix4(pt.matrixWorld)); return; }
        const m = o as THREE.Mesh; if (m.isMesh && (m.material as THREE.Material)?.blending === THREE.AdditiveBlending && m.visible) air.glows.push(m); });
      /** the human tests of one figure on this frame (humanBody.ts): the joint limits on every frame; a straight arm held out near
       *  shoulder height for more than half a second; a hand gesturing at his own body; the weight on a foot under the hips; and
       *  something to sit or kneel on, or a hand on the ground, for a figure as low as one who sits */
      /** a figure's real body: its skeleton in its own frame (design units, his left, up, forward) and W, which puts a point of it in the
       *  world where his body really is (the card draws it flat; a seat is under the real pelvis) */
      const realCache = new Map<string, { P: ReturnType<Staged["D"]["props"]>; v: ReturnType<typeof solve>["v"]; mpu: number; W: (p: V3) => THREE.Vector3 }>();
      const realOf = (a: Staged) => { let r = realCache.get(a.name); if (r) return r; const P = a.D.props(a.o.who ?? "sir"), v = solve(P, a.pose, 0).v, mpu = a.h / (P.thigh + P.shin + P.ankle + P.spine + P.neck + P.head), hr = (a.heading * Math.PI) / 180;
        r = { P, v, mpu, W: (p: V3) => new THREE.Vector3(a.at[0] + mpu * (p[0] * Math.cos(hr) + p[2] * Math.sin(hr)), a.at[1] + mpu * p[1], a.at[2] + mpu * (-p[0] * Math.sin(hr) + p[2] * Math.cos(hr))) }; realCache.set(a.name, r); return r; };
      const TORSO = new Set(["chest", "belly"]);
      const humanTests = (B: (typeof bodies)[number], F: number) => { const a = B.a, P = a.D.props(a.o.who ?? "sir"), sk = solve(P, a.pose, 0), v = sk.v, LL = P.thigh + P.shin;
        const { mpu, W } = realOf(a);
        // the skeleton turned as the lens sees it (z = toward the lens), as the card is drawn
        const skView = solve(P, a.pose, a.heading - (Math.atan2(C.x - a.at[0], C.z - a.at[2]) * 180) / Math.PI);
        /** while `on` holds frame after frame, count it; once it has held `need` frames, the fault is noted from the frame it began */
        const run = (k: string, on: boolean, F: number, need: number, fire: () => void) => { const key = `${a.name}|${k}`, r = runs.get(key); if (!on) { runs.delete(key); return; }
          const q = r ?? { start: F, n: 0 }; q.n += every; runs.set(key, q); if (q.n >= need) { const fk = `${s.id}|${a.name}|${k}`, fresh = !faults.has(fk); fire(); const e = faults.get(fk); if (fresh && e) e.f0 = q.start; } };
        const pose = (key: string, what: string, deg: number) => note(`${s.id}|${a.name}|${key}`, { shot: s.id, who: a.name, kind: "pose", what: `${a.name}: ${what}` }, F, deg / 100);
        // the joint limits, on every frame
        for (const x of jointLimits(sk)) pose(`limit|${x.part}|${x.what.replace(/[\d.]+ degrees/g, "")}`, x.what, x.by);
        const holds = (sd: "L" | "R") => th.rows.some((r) => r.holder && r.holder.split(" & ").some((p) => { const [w, h] = p.split(" "); return w === a.name && (h ?? "").split("+").includes(sd); }));
        const n = (sd: "L" | "R") => (sd === "L" ? "left" : "right");
        for (const sd of ["L", "R"] as const) { const kind = sd === "L" ? a.o.handL : a.o.handR;
          // (k) a straight arm held out near shoulder height, as the body has it or as it is drawn on the card: straight (bent under 30
          //     degrees) and the upper arm 60-120 degrees from hanging; or drawn straight (the hand on the line from the shoulder
          //     through the elbow, within 20 degrees), level within 30 degrees and drawn at three quarters of its length or more. A
          //     pointing hand (the hand drawn pointing) is what the rule allows: "unless pointing at or reaching for something"
          const u = new THREE.Vector3(...(sub3(v[`el${sd}`], v[`sh${sd}`]))), f = new THREE.Vector3(...(sub3(v[`wr${sd}`], v[`el${sd}`]))), bend = (u.angleTo(f) * 180) / Math.PI, elev = (u.angleTo(new THREE.Vector3(0, -1, 0)) * 180) / Math.PI;
          const S = new THREE.Vector3(...a.joint(`sh${sd}`)), E = new THREE.Vector3(...a.joint(`el${sd}`)), Wr = new THREE.Vector3(...a.joint(`wr${sd}`)), s2 = scr(S), e2 = scr(E), w2 = scr(Wr);
          const da = Math.atan2(e2.y - s2.y, e2.x - s2.x), db = Math.atan2(w2.y - e2.y, w2.x - e2.x), dBend = Math.abs(((((db - da) * 180) / Math.PI + 540) % 360) - 180);
          const SW = Wr.clone().sub(S), level = (Math.asin(Math.min(1, Math.abs(SW.y) / (SW.length() || 1))) * 180) / Math.PI, drawnLen = S.distanceTo(E) + E.distanceTo(Wr), trueLen = (P.upper + P.fore) * mpu;
          const straight3 = bend < 30 && elev > 60 && elev < 120, straight2 = dBend < 20 && level < 30 && drawnLen > 0.75 * trueLen && inFrame(w2);
          run(`tpose|${sd}`, (straight3 || straight2) && kind !== "point", F, 15, () => pose(`tpose|${sd}`, `the ${n(sd)} arm is held straight out near shoulder height for more than half a second${straight3 ? ` (bent ${bend.toFixed(0)} degrees, the upper arm ${elev.toFixed(0)} degrees from hanging)` : ` (drawn straight within ${dBend.toFixed(0)} degrees, ${level.toFixed(0)} degrees from level)`}`, 1));
          // (k2) an elbow locked fully straight with the arm lifted, for more than half a second ("never fully straight unless the
          //      action needs it": a pointing hand needs it)
          run(`locked|${sd}`, lockedElbows(sk).includes(sd) && kind !== "point", F, 15, () => pose(`locked|${sd}`, `the ${n(sd)} elbow is locked straight with the arm lifted for more than half a second`, 1));
          // (l) a hand gesturing at his own body: an empty open hand, off the body (not resting on it), its fingers pointing into his
          //     chest or belly, for more than 0.4 s (the rule: "a character never gestures toward its own body"; Jesper: Sir explaining
          //     with his hand toward his own belly). Arms crossed are left out: there both hands lie at the other side
          if (!holds(sd) && kind !== "fist" && kind !== "grip") { const tip = v[`tip${sd}`], wr = v[`wr${sd}`], dir = norm3(sub3(tip, wr)), A = v.pelvis, Bn = v.neck, ax = sub3(Bn, A), L2 = dot3(ax, ax) || 1;
            const near = (p: V3) => { const k = Math.max(0, Math.min(1, dot3(sub3(p, A), ax) / L2)); const c: V3 = [A[0] + ax[0] * k, A[1] + ax[1] * k, A[2] + ax[2] * k]; return Math.hypot(p[0] - c[0], p[1] - c[1], p[2] - c[2]); };
            const torsoR = 0.95 * P.shW, gap = near(tip) - torsoR; let hit = false;
            for (let k = 1; k <= 12; k++) { const q: V3 = [tip[0] + dir[0] * k * 0.05 * LL, tip[1] + dir[1] * k * 0.05 * LL, tip[2] + dir[2] * k * 0.05 * LL]; if (near(q) < torsoR * 0.8) { hit = true; break; } }
            const other = v[`wr${sd === "L" ? "R" : "L"}`], crossed = Math.sign(wr[0]) !== (sd === "L" ? 1 : -1) && Math.sign(other[0]) !== (sd === "L" ? -1 : 1) && wr[2] > 0 && other[2] > 0;
            run(`self|${sd}`, hit && gap > 0.03 * LL && gap < 0.5 * LL && tip[2] > 0 && !crossed, F, 12, () => pose(`self|${sd}`, `the ${n(sd)} hand gestures at his own body (its fingers point into his chest or belly from ${(gap / LL * 0.95).toFixed(2)} leg lengths off it)`, 1)); }
          // (m) the arm reaching toward the lens (or away from it, behind him) by more than 0.4 leg lengths, with the hand drawn over his
          //     own chest or belly: the card cannot draw depth, so the elbow is not seen and the hand reads as put on his own body, or
          //     the arm as coming out of his chest (Jesper: Sir's hand toward his belly at 3-5 s, the pupil's sword arm at 11 s). For
          //     more than 0.4 s
          { const kv = skView.v, depth = (kv[`wr${sd}`][2] - (kv.neck[2] + kv.pelvis[2]) / 2) / LL, me = flat.find((q) => q.B === B), w2d = scr(new THREE.Vector3(...a.joint(`wr${sd}`)));
            const over = !!me && inFrame(w2d) && !!bodyAt(me, w2d.x, w2d.y, TORSO);
            run(`lens|${sd}`, over && Math.abs(depth) > 0.4, F, 12, () => pose(`lens|${sd}`, `the ${n(sd)} arm reaches ${depth > 0 ? "toward" : "away from"} the lens (${Math.abs(depth).toFixed(2)} leg lengths) and is drawn over his own body: its elbow cannot be seen and the hand reads as on his own body`, 1)); }
          // (n) a raised hand beside another figure that does not touch him: the rule's "both hands meet at the same point" (a hand on a
          //     shoulder, a handshake, a pull up). The real hand within 5-20 cm of the other's body, chest, shoulder, arm or hand, the
          //     wrist lifted above the hips, for more than half a second
          // (o) a hand put on someone (`handOn`: a shoulder, a back) must be seen there: in the picture its palm lies on his drawn body and
          //     is not hidden behind it. A hand that goes behind his head or body reads as an arm raised behind him (Jesper: the
          //     gladiator's hand on the other's shoulder at 28-31 s)
          if (th.rows.some((r) => r.use === "on" && r.holder && r.holder.split(" & ").some((p) => { const [w, h] = p.split(" "); return w === a.name && (h ?? "").split("+").includes(sd); }))) {
            const pm = scr(new THREE.Vector3(...a.joint(`wr${sd}`)).lerp(new THREE.Vector3(...a.joint(`tip${sd}`)), 0.5)); let on = "", hidden = false;
            for (const g of flat) { if (g.B === B) continue; const hb = bodyAt(g, pm.x, pm.y); if (hb) { on = `${g.B.a.name}'s ${hb.name}`; hidden = hb.d < pm.d - 0.02; break; } }
            run(`onseen|${sd}`, !inFrame(pm) || !on || hidden, F, 6, () => pose(`onseen|${sd}`, `the ${n(sd)} hand that is put on someone ${!on ? "does not lie on him in the picture" : `lies behind ${on} in the picture`}: the touch cannot be seen`, 1)); }
          // (a hand put on someone, `handOn`, is such a hand too: it must touch him; a thing in the hand is not)
          const holdsThing = th.rows.some((r) => r.use !== "on" && r.holder && r.holder.split(" & ").some((p) => { const [w, h] = p.split(" "); return w === a.name && (h ?? "").split("+").includes(sd); }));
          if (!holdsThing && v[`wr${sd}`][1] > v.pelvis[1] + 0.2 * LL) { const palmW = W(mid3(v[`wr${sd}`], v[`tip${sd}`]));
            for (const B2 of bodies) { if (B2 === B || B2.a.spin !== undefined) continue; const o2 = realOf(B2.a), segs: [THREE.Vector3, THREE.Vector3, number, string][] = [
                [o2.W(o2.v.pelvis), o2.W(o2.v.neck), 0.95 * o2.P.shW * o2.mpu, "body"], [o2.W(o2.v.shL), o2.W(o2.v.elL), 0.05, "arm"], [o2.W(o2.v.shR), o2.W(o2.v.elR), 0.05, "arm"],
                [o2.W(o2.v.elL), o2.W(o2.v.wrL), 0.045, "arm"], [o2.W(o2.v.elR), o2.W(o2.v.wrR), 0.045, "arm"], [o2.W(o2.v.wrL), o2.W(o2.v.tipL), 0.045, "hand"], [o2.W(o2.v.wrR), o2.W(o2.v.tipR), 0.045, "hand"]];
              let gap = Infinity, part = ""; for (const [p0, p1, r, nm] of segs) { const d = new THREE.Line3(p0, p1).closestPointToPoint(palmW, true, new THREE.Vector3()).distanceTo(palmW) - r - 0.045; if (d < gap) { gap = d; part = nm; } }
              run(`hover|${sd}|${B2.a.name}`, gap > 0.05 && gap < 0.2, F, 15, () => pose(`hover|${sd}|${B2.a.name}`, `the ${n(sd)} hand is raised beside ${B2.a.name}'s ${part} ${(gap * 100).toFixed(0)} cm off it, for more than half a second: it neither touches him nor is away from him`, 1)); } } }
        // (w) the weight on a foot under the hips: seen from above, a foot on the ground (or the line between two) lies under the hips
        //     (the line from one hip joint to the other) or within a fifth of a leg's length of it, for a figure standing (not one low
        //     enough to sit, kneel or crouch); 0.3 s and more (a stride passes through it). Under the hips, not under the middle of the
        //     pelvis: a walker on one foot has it under his own hip
        const lw = lowness(sk), low0 = Math.min(v.heelL[1], v.toeL[1], v.heelR[1], v.toeR[1]);
        { const feet = (["L", "R"] as const).filter((sd) => Math.min(v[`heel${sd}`][1], v[`toe${sd}`][1]) < low0 + 0.04 * LL);
          const seg = (sd: "L" | "R") => [v[`heel${sd}`], v[`toe${sd}`]] as [V3, V3], pts: [V3, V3][] = feet.map(seg);
          if (feet.length === 2) pts.push([mid3(...seg("L")), mid3(...seg("R"))]);
          const hips = [0, 0.25, 0.5, 0.75, 1].map((k) => mid3(v.hipL, v.hipL).map((x, i) => x + (v.hipR[i] - x) * k) as V3);
          const off = Math.min(...hips.flatMap((h) => pts.map(([p, q]) => segD2(h[0], h[2], p[0], p[2], q[0], q[2])))) / LL;
          run("weight", lw.low > 0.8 && off > 0.2, F, 9, () => pose("weight", `his weight is on no foot: the feet on the ground are ${off.toFixed(2)} leg lengths from under his hips, for more than 0.3 s`, 1)); }
        // (s) as low as one who sits or squats (the pelvis under 80 % of its standing height, with a thigh lifted past 50 degrees, or
        //     under 65 % anyhow): a seat under the real pelvis or the buttocks behind it (within 0.35 m below), or sitting on the ground, or a knee on the
        //     ground, or a hand on it, or (crouching, not squatting deep) the body leaning in over the feet by 30 degrees
        if ((lw.low < 0.8 && lw.thigh > 50) || lw.low < 0.65) { const pel = W(v.pelvis), floor = a.at[1]; let seat = pel.y - floor < 0.22;
          // (the seat must reach under the hip joint, or to within 4 cm behind it: the sitting bones are there. Until 19 Nov the test also
          //  took a seat 8-16 cm behind the hips, and so passed Sir in the animal trials, whose hips were 8 cm in front of the bench's edge:
          //  "Figurerna satt i luften bredvid bänken" (Jesper). A seat only further back is reported as sitting off its edge.)
          const under = [0, 0.04].map((b) => W([v.pelvis[0], v.pelvis[1], v.pelvis[2] - b / mpu])), behind = [0.08, 0.16, 0.24].map((b) => W([v.pelvis[0], v.pelvis[1], v.pelvis[2] - b / mpu]));
          let off = Infinity;
          // (how far his hip joint is above the seat's top: sitting, it is 8-12 cm; more than 20 cm and he sits in the air above the seat, not on it.
          //  Jesper, 19 Nov, the animal trials: "satt inte ens på träsoffan utan i luften")
          let above = Infinity;
          if (!seat) for (const o of [...solids, ...held.filter((h) => !h.holder!.split(" & ").some((p) => p.split(" ")[0] === a.name))]) { for (const q of [...under, ...behind]) { const strict = under.includes(q), m = strict ? 0.01 : 0.05; if (o.aabb.min.x > q.x + m || o.aabb.max.x < q.x - m || o.aabb.min.z > q.z + m || o.aabb.max.z < q.z - m) continue;
            rc.set(new THREE.Vector3(q.x, q.y + 0.05, q.z), DIRS[3]); rc.near = 0; rc.far = 0.4; const hit = rc.intersectObject(o.mesh, false)[0];
            if (hit && strict) { seat = true; above = Math.min(above, hit.distance - 0.05); } else if (hit) off = Math.min(off, Math.hypot(q.x - pel.x, q.z - pel.z)); } }
          const knee = Math.min(W(v.knL).y, W(v.knR).y) - floor < 0.1, hand = Math.min(W(v.tipL).y, W(v.tipR).y) - floor < 0.08, lean = lw.low > 0.6 && (a.pose.lean ?? 0) > 30;
          // (s2) a raised knee stands on its own foot. In one this low and not on a seat (kneeling, crouching), a knee off the ground whose foot
          //      rests on the ground has the foot under it: the shin upright or leaning forward, not slanting back to a foot behind the knee
          //      (the independent review of gladiators v5: the beaten man's front knee hung at the hem of his kilt, its shin slanting back to
          //      a sandal flat behind him, "ingen fot under knät, så han svävar i en huk"; the support test passed him on his other knee)
          if (!seat) for (const sd of ["L", "R"] as const) { const kn = v[`kn${sd}`], an = v[`an${sd}`], up = W(kn).y - floor, footDown = Math.min(W(v[`heel${sd}`]).y, W(v[`toe${sd}`]).y) - floor < 0.04, back = (kn[2] - an[2]) / P.shin;
            run(`kneehang|${sd}`, up > 0.12 && footDown && back > 0.5, F, 4, () => pose(`kneehang|${sd}`, `the ${n(sd)} knee hangs ${(up * 100).toFixed(0)} cm above the ground with no foot under it: its shin slants back to a foot ${(back * P.shin * mpu * 100).toFixed(0)} cm behind the knee`, 1)); }
          run("hover", seat && above > 0.2 && above < Infinity && !knee && !hand, F, 4, () => pose("hover", `he sits in the air: his hips are ${(above * 100).toFixed(0)} cm above the seat under him (sitting, 8-12 cm)`, 1));
          run("support", !seat && !knee && !hand && !lean, F, 8, () => pose("support", `he is as low as one who sits or squats (hips at ${(lw.low * 100).toFixed(0)} % of standing) with nothing under him: ${off < Infinity ? `he sits off the seat's edge, the seat begins ${(off * 100).toFixed(0)} cm behind his hips` : "no seat"}, no knee or hand on the ground`, 1)); }
      };
      // ---- in the picture (rule 5: what cannot be told from being inside is inside) ----
      const foc = 960 / Math.tan((cam.fov * Math.PI) / 360), scr = (p: THREE.Vector3) => { const q = p.clone().project(lens); return { x: (q.x + 1) * 540, y: (1 - q.y) * 960, d: p.distanceTo(C) }; };
      /** a body as it is drawn: its pieces as flat capsules in the picture, as wide as the drawing (wider than the body is deep) */
      //     (the head as a round as wide as it is tall: the drawn heads are square-ish, and wider than the body's head is deep)
      //     A head turned is drawn with its face to one side of the line from the crown to the chin: the round is put halfway from that line
      //     to the drawn eyes (the review of Nero v3: the woman leaning in to whisper had her head in the bearded man's face, between the
      //     rounds put on the line)
      const flat = bodies.map((B) => ({ B, caps: B.parts.map((q) => { if (q.P.name === "head") { const cr = new THREE.Vector3(...B.a.joint("crown")), sk = new THREE.Vector3(...B.a.joint("skull")), M = scr(cr.clone().lerp(sk, 0.5)), r = (0.52 * cr.distanceTo(sk) * foc) / M.d;
          const eA = B.a.mark?.("eyeA"), eB = B.a.mark?.("eyeB"); if (eA && eB) { const e = scr(new THREE.Vector3(...eA).lerp(new THREE.Vector3(...eB), 0.5)); M.x += (e.x - M.x) * 0.5; }
          return { q, A: M, Z: M, rA: r, rZ: r }; }
        const A = scr(q.pts[0]), Z = scr(q.pts[q.pts.length - 1]), w = (WIDE[q.P.name] ?? 1.3) * q.r; return { q, A, Z, rA: (w * foc) / A.d, rZ: (w * foc) / Z.d }; }) }));
      const capHit = (c: { A: { x: number; y: number; d: number }; Z: { x: number; y: number; d: number }; rA: number; rZ: number }, x: number, y: number) => { const dx = c.Z.x - c.A.x, dy = c.Z.y - c.A.y, L = dx * dx + dy * dy, k = L ? Math.max(0, Math.min(1, ((x - c.A.x) * dx + (y - c.A.y) * dy) / L)) : 0;
        return Math.hypot(x - c.A.x - dx * k, y - c.A.y - dy * k) < c.rA + (c.rZ - c.rA) * k ? c.A.d + (c.Z.d - c.A.d) * k : 0; };
      const CORE = new Set(["head", "chest", "belly", "left thigh", "right thigh", "left shin", "right shin"]);
      // a held thing may not be drawn over the arms of someone else either (the review: "inget föremål ... får gå över någon annans kropp";
      // the bow's tip on Sir's sleeve)
      const BODY_ARMS = new Set([...CORE, "left upper arm", "right upper arm", "left forearm", "right forearm"]);
      /** the nearest piece of a body drawn over this point of the picture, if any: its name and how far it is from the lens */
      const bodyAt = (f: (typeof flat)[number], x: number, y: number, only?: Set<string>) => { let best: { name: string; d: number } | null = null; for (const c of f.caps) { if (only && !only.has(c.q.P.name)) continue; const d = capHit(c, x, y); if (d && (!best || d < best.d)) best = { name: c.q.P.name, d }; } return best; };
      const inFrame = (p: { x: number; y: number }) => p.x >= 0 && p.x <= 1080 && p.y >= 0 && p.y <= 1920;
      for (const f of flat) { const a = f.B.a, me = f.B.box.getCenter(new THREE.Vector3()).distanceTo(C);
        // (a) a post, a pole or a mast close behind him (within a metre), hidden by his body and showing on both sides of it: it seems to go
        //     through him
        for (const o of solids) { const z = o.bb.getSize(new THREE.Vector3()), sz = [z.x * o.s[0], z.y * o.s[1], z.z * o.s[2]], ax = sz.indexOf(Math.max(...sz)), thin = sz.filter((_, i) => i !== ax);
          if (sz[ax] < 0.5 || Math.max(...thin) > 0.25 || (o.kind !== "box" && o.kind !== "cyl")) continue;
          // standing up (within 35 degrees of upright): a post, a pole, a mast; a rail or a beam lying behind someone reads as behind him
          { const e = new THREE.Vector3(); e.setComponent(ax, 1); e.transformDirection(o.M); if (Math.abs(e.y) < Math.cos((35 * Math.PI) / 180)) continue; }
          if (!o.aabb.clone().expandByScalar(1.5).intersectsBox(f.B.box)) continue;
          const c0 = o.bb.getCenter(new THREE.Vector3()), e = new THREE.Vector3(); e.setComponent(ax, (o.bb.max.getComponent(ax) - o.bb.min.getComponent(ax)) / 2);
          const P0 = c0.clone().sub(e).applyMatrix4(o.M), P1 = c0.clone().add(e).applyMatrix4(o.M), st: string[] = [];
          // how far behind him it is: measured where it is hidden by him (a long rail along a wall far behind is not close behind)
          let back = Infinity; for (let i = 0; i <= 40; i++) { const p = P0.clone().lerp(P1, i / 40), s2 = scr(p); if (!inFrame(s2)) { st.push("out"); continue; } const hb = bodyAt(f, s2.x, s2.y, CORE); const hid = !!hb && hb.d < s2.d; st.push(hid ? "hid" : "seen"); if (hid) back = Math.min(back, s2.d - hb!.d); }
          if (back > 1.0) continue;
          const i0 = st.indexOf("seen"), i1 = st.lastIndexOf("seen"), mid = st.slice(i0 + 1, i1);
          if (i0 >= 0 && i1 > i0 && mid.filter((x) => x === "hid").length >= 3) note(`${s.id}|${a.name}|through|${o.mesh.uuid}`, { shot: s.id, who: a.name, kind: "solid", what: `${describe(o)} stands ${Math.max(0, back).toFixed(2)} m behind ${a.name}, hidden by his body and showing on both sides of it: it seems to go through him` }, F, mid.filter((x) => x === "hid").length / 100); }
        // (b) his face covered by more than a fifth by someone not clearly behind it (a head, a body, an arm): nearer the lens, or at
        //     the same depth, where the two are drawn into each other (the woman whispering with her head in the bearded man's face)
        const hd = f.caps.find((c) => c.q.P.name === "head")!, hc = hd.A, R = hd.rA * 0.8;
        if (inFrame(hc) && R > 7) { const samples: [number, number][] = [[0, 0]]; for (const k of [0.45, 0.85]) for (let i = 0; i < 8; i++) samples.push([k * Math.cos((i * Math.PI) / 4), k * Math.sin((i * Math.PI) / 4)]);
          for (const g of flat) { if (g === f) continue; let n = 0, by = "";
            // two heads drawn into each other: the other's head over his, nearer the lens or at the same depth, by more than a sliver
            const gh = g.caps.find((c) => c.q.P.name === "head")!, ov = hd.rA + gh.rA - Math.hypot(gh.A.x - hc.x, gh.A.y - hc.y);
            if (ov > 0.08 * hd.rA && gh.A.d < hc.d + 0.06) note(`${s.id}|${a.name}|heads|${g.B.a.name}`, { shot: s.id, who: a.name, kind: "figure", what: `${g.B.a.name}'s head lies over ${a.name}'s head in the picture (${Math.round(ov)} px into it, ${gh.A.d < hc.d - 0.06 ? "nearer the lens" : "at the same depth: drawn into each other"})` }, F, ov / hd.rA); for (const [u, v] of samples) { const hb = bodyAt(g, hc.x + u * R, hc.y + v * R); if (hb && hb.d < hc.d + 0.06) { n++; by = hb.name; } }
            if (n / samples.length > 0.2) note(`${s.id}|${a.name}|face|${g.B.a.name}`, { shot: s.id, who: a.name, kind: "figure", what: `${a.name}'s face is covered by ${g.B.a.name}'s ${by} (${Math.round((100 * n) / samples.length)} % of it)` }, F, n / samples.length); } }
        // (g) his hand and someone else's hand drawn over each other in the picture: which is in front cannot be told, and two hands on one
        //     place cannot be followed (the review of Blackbeard v4: the captain's hand on the boy's fist at the tray's corner, rising and
        //     reaching). Two hands on one held thing are left out (a thing handed over)
        for (const g of flat) { if (g === f || g.B.a.name < a.name) continue; const b = g.B.a.name;
          if (th.rows.some((r) => r.holder && r.holder.split(" & ").some((p) => p.split(" ")[0] === a.name) && r.holder.split(" & ").some((p) => p.split(" ")[0] === b))) continue;
          for (const hf of f.caps) { if (!hf.q.P.name.endsWith("hand") || (!inFrame(hf.A) && !inFrame(hf.Z))) continue;
            for (const hg of g.caps) { if (!hg.q.P.name.endsWith("hand")) continue; let gap = Infinity;
              for (const u of [0, 0.5, 1]) for (const v of [0, 0.5, 1]) { const px = hf.A.x + (hf.Z.x - hf.A.x) * u, py = hf.A.y + (hf.Z.y - hf.A.y) * u, qx = hg.A.x + (hg.Z.x - hg.A.x) * v, qy = hg.A.y + (hg.Z.y - hg.A.y) * v;
                gap = Math.min(gap, Math.hypot(px - qx, py - qy) - (hf.rA + (hf.rZ - hf.rA) * u) - (hg.rA + (hg.rZ - hg.rA) * v)); }
              if (gap < 0) note(`${s.id}|${a.name}|hands|${b}|${hf.q.P.name}|${hg.q.P.name}`, { shot: s.id, who: a.name, kind: "figure", what: `${a.name}'s ${hf.q.P.name} and ${b}'s ${hg.q.P.name} lie over each other in the picture (${Math.round(-gap)} px into each other)` }, F, -gap / 100); } } }
        // (h) his head or an arm drawn under another figure nearer the lens: a figure in front of another counts (Jesper, 18 Nov: the boy
        //     before the captain's coat; the review of Blackbeard v4: a figure at the edge over the cook's raised arm). His head covered by
        //     more than a tenth, or an arm at two of its points or more
        { const ARMS2 = new Set(["left upper arm", "right upper arm", "left forearm", "right forearm", "left hand", "right hand"]);
          const rounds: [number, number][] = [[0, 0], ...[0.45, 0.85].flatMap((k) => Array.from({ length: 8 }, (_, i) => [k * Math.cos((i * Math.PI) / 4), k * Math.sin((i * Math.PI) / 4)] as [number, number]))];
          for (const g of flat) { if (g === f) continue; let nh = 0, tot = 0, byH = ""; const armHit = new Map<string, number>();
            if (inFrame(hc) && R > 7) for (const [u, v] of rounds) { tot++; const hb = bodyAt(g, hc.x + u * R, hc.y + v * R); if (hb && hb.d < hc.d - 0.15) { nh++; byH = hb.name; } }
            for (const c of f.caps) { if (!ARMS2.has(c.q.P.name)) continue; for (const k of [0, 0.5, 1]) { const x = c.A.x + (c.Z.x - c.A.x) * k, y = c.A.y + (c.Z.y - c.A.y) * k, d = c.A.d + (c.Z.d - c.A.d) * k; if (!inFrame({ x, y })) continue;
              const hb = bodyAt(g, x, y); if (hb && hb.d < d - 0.15) armHit.set(c.q.P.name, (armHit.get(c.q.P.name) ?? 0) + 1); } }
            if (tot && nh / tot > 0.1) note(`${s.id}|${a.name}|underhead|${g.B.a.name}`, { shot: s.id, who: a.name, kind: "figure", what: `${a.name}'s head lies under ${g.B.a.name}'s ${byH}, who is nearer the lens (${Math.round((100 * nh) / tot)} % of it)` }, F, nh / tot);
            for (const [part, n] of armHit) if (n >= 2) note(`${s.id}|${a.name}|underarm|${g.B.a.name}|${part}`, { shot: s.id, who: a.name, kind: "figure", what: `${a.name}'s ${part} lies under ${g.B.a.name}, who is nearer the lens` }, F, n / 3); } }
        // (i) a thing of the set standing before him and cutting him (things in a hand are test c's): on his head, chest or arms, or on one
        //     leg while the other is in sight (the review of Blackbeard v4: the barrel before Sir's leg and half his coat all through the
        //     shot, in the first five seconds; Jesper's rule 1 of 18 Nov). Both legs behind a rail or a table is standing at it, as people
        //     do. Rays from the lens to points of his drawn body, against the solids whose box lies before him in the picture
        { const pts = f.caps.flatMap((c) => [0, 0.5, 1].map((k) => ({ part: c.q.P.name, x: c.A.x + (c.Z.x - c.A.x) * k, y: c.A.y + (c.Z.y - c.A.y) * k, d: c.A.d + (c.Z.d - c.A.d) * k }))).filter(inFrame);
          if (pts.length >= 6) { const x0 = Math.min(...pts.map((p) => p.x)), x1 = Math.max(...pts.map((p) => p.x)), y0 = Math.min(...pts.map((p) => p.y)), y1 = Math.max(...pts.map((p) => p.y)), dMax = Math.max(...pts.map((p) => p.d));
            const cand = solids.filter((o) => { if (o.geo.type === "PlaneGeometry" || o.geo.type === "ShapeGeometry") return false;
              const b = o.aabb; let ax0 = Infinity, ax1 = -Infinity, ay0 = Infinity, ay1 = -Infinity, dn = Infinity;
              for (const cx of [b.min.x, b.max.x]) for (const cy of [b.min.y, b.max.y]) for (const cz of [b.min.z, b.max.z]) { const q = scr(new THREE.Vector3(cx, cy, cz)); ax0 = Math.min(ax0, q.x); ax1 = Math.max(ax1, q.x); ay0 = Math.min(ay0, q.y); ay1 = Math.max(ay1, q.y); dn = Math.min(dn, q.d); }
              return ax1 > x0 && ax0 < x1 && ay1 > y0 && ay0 < y1 && dn < dMax - 0.3; });
            if (cand.length) { const cov = new Map<string, number>(); let by = "";
              for (const p of pts) { const dir = new THREE.Vector3(p.x / 540 - 1, 1 - p.y / 960, 0.5).unproject(lens).sub(C).normalize(); rc.set(C, dir); rc.near = 0.05; rc.far = p.d - 0.3;
                for (const o of cand) if (rc.intersectObject(o.mesh, false)[0]) { cov.set(p.part, (cov.get(p.part) ?? 0) + 1); by = describe(o); break; } }
              const up = ["head", "chest", "left upper arm", "right upper arm", "left forearm", "right forearm", "left hand", "right hand"].reduce((n, q) => n + (cov.get(q) ?? 0), 0);
              const L = (cov.get("left thigh") ?? 0) + (cov.get("left shin") ?? 0), Rg = (cov.get("right thigh") ?? 0) + (cov.get("right shin") ?? 0);
              if (up >= 2) note(`${s.id}|${a.name}|cut|up`, { shot: s.id, who: a.name, kind: "solid", what: `${by} stands before ${a.name} and covers his head, chest or arms (${up} points): a thing in the foreground cutting a figure` }, F, up / 10);
              else if ((L >= 2 && Rg === 0) || (Rg >= 2 && L === 0)) note(`${s.id}|${a.name}|cut|leg`, { shot: s.id, who: a.name, kind: "solid", what: `${by} stands before ${a.name} and covers his ${L ? "left" : "right"} leg while the other is in sight: a thing in the foreground cutting a figure` }, F, Math.max(L, Rg) / 6); } } }
        // (f) a thing held or carried (his own too: the sack carried before his face in Nero's gardens) over more than a fifth of his face
        if (inFrame(hc) && R > 7) { const things2 = [...held, ...carriedNow]; if (things2.length) { let n = 0, by = "", tot = 0;
          for (const [u, v] of [[0, 0], ...[0.45, 0.85].flatMap((k) => Array.from({ length: 8 }, (_, i) => [k * Math.cos((i * Math.PI) / 4), k * Math.sin((i * Math.PI) / 4)]))] as [number, number][]) { tot++;
            const x = hc.x + u * R, y = hc.y + v * R, ndc = new THREE.Vector3((x / 540) - 1, 1 - y / 960, 0.5).unproject(lens).sub(C).normalize(); rc.set(C, ndc); rc.near = 0.05; rc.far = hc.d - 0.02;
            for (const o of things2) { if (o.geo.type === "PlaneGeometry") continue; const h = rc.intersectObject(o.mesh, false)[0]; if (h) { n++; by = nameOf(o.root ?? o.mesh) || describe(o); break; } } }
          if (n / tot > 0.2) note(`${s.id}|${a.name}|thingface`, { shot: s.id, who: a.name, kind: "held", what: `${a.name}'s face is covered by a thing held or carried (${by}), ${Math.round((100 * n) / tot)} % of it` }, F, n / tot); } }
        // (p) dust and light never cross a face (Jesper 19 Nov, after the night cabin: "Dammpartiklar och ljusfläckar får aldrig korsa
        //     ett ansikte"): a mote of dust, or a patch of added light (a glow, rays, a shaft, a gleam), nearer the lens than his face and
        //     drawn inside its round
        if (inFrame(hc) && R > 7) { for (const q of air.pts) { const p2 = scr(q); if (p2.d < hc.d && Math.hypot(p2.x - hc.x, p2.y - hc.y) < R) { note(`${s.id}|${a.name}|dustface`, { shot: s.id, who: a.name, kind: "pose", what: `${a.name}: a mote of dust crosses his face` }, F, 0.01); break; } }
          //     (a glow, rays or a gleam is a round soft patch that fades to nothing at its edge: it is measured as drawn, a round out to
          //     three quarters of its half-size, where its light can still be seen; a shaft by its box)
          for (const m of air.glows) { const b = new THREE.Box3().setFromObject(m), z = b.getSize(new THREE.Vector3()), c = scr(m.getWorldPosition(new THREE.Vector3())); let over = false;
            if ((m.geometry as THREE.BufferGeometry).type === "PlaneGeometry") { const r = (0.75 * 0.5 * Math.max(z.x, z.y, z.z) * foc) / Math.max(0.1, c.d); over = c.d < hc.d - 0.05 && Math.hypot(c.x - hc.x, c.y - hc.y) < r + 0.6 * R; }
            else { let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity, dn = Infinity;
              for (const cx of [b.min.x, b.max.x]) for (const cy of [b.min.y, b.max.y]) for (const cz of [b.min.z, b.max.z]) { const q = scr(new THREE.Vector3(cx, cy, cz)); x0 = Math.min(x0, q.x); x1 = Math.max(x1, q.x); y0 = Math.min(y0, q.y); y1 = Math.max(y1, q.y); dn = Math.min(dn, q.d); }
              over = dn < hc.d - 0.05 && hc.x > x0 && hc.x < x1 && hc.y > y0 && hc.y < y1; }
            if (over) { note(`${s.id}|${a.name}|lightface|${m.name || "glow"}`, { shot: s.id, who: a.name, kind: "pose", what: `${a.name}: a patch of light (${m.name || "a glow"}) lies over his face` }, F, 0.01); } } }
        // (c) a thing in someone else's hand drawn over his head, chest or legs
        //     (up to 3 m behind it: a match near the lens drawn across the men hauling behind is as wrong as a blade across the man beside
        //     him; a fiddle bow in front of people running 15 m down the street is only in front of them, as it would be)
        for (const o of held) { if (o.holder!.split(" & ").some((part) => part.split(" ")[0] === a.name)) continue;
          const c0 = o.bb.getCenter(new THREE.Vector3()), z = o.bb.getSize(new THREE.Vector3()), sz = [z.x * o.s[0], z.y * o.s[1], z.z * o.s[2]], ax = sz.indexOf(Math.max(...sz)), e = new THREE.Vector3(); e.setComponent(ax, z.getComponent(ax) / 2);
                    // (an arm reaching for the thing, its hand at it, lies under it as a matter of course: not that arm)
          const reaching = new Set<string>(); for (const sd of ["L", "R"] as const) { const w = new THREE.Vector3(...a.joint(sd === "L" ? "tipL" : "tipR")); if (o.aabb.distanceToPoint(w) < 0.2) { reaching.add(sd === "L" ? "left upper arm" : "right upper arm"); reaching.add(sd === "L" ? "left forearm" : "right forearm"); } }
          const parts3 = new Set([...BODY_ARMS].filter((q) => !reaching.has(q)));
          let n = 0, part = ""; for (let i = 0; i <= 12; i++) { const p = c0.clone().sub(e).lerp(c0.clone().add(e), i / 12).applyMatrix4(o.M), s2 = scr(p); if (!inFrame(s2)) continue; const hb = bodyAt(f, s2.x, s2.y, CORE); if (hb && s2.d < hb.d && hb.d - s2.d < 3) { n++; part = hb.name; } }
          // (e) and on his arms, where it lies at nearly his arm's depth: in front of it or into it cannot be told (the review of Nero v3:
          //     the bow's tip on Sir's upper arm as he took the fiddle)
          { let m2 = 0, arm2 = ""; const ARMS = new Set(["left upper arm", "right upper arm", "left forearm", "right forearm"]);
            for (let i = 0; i <= 12; i++) { const p = c0.clone().sub(e).lerp(c0.clone().add(e), i / 12).applyMatrix4(o.M), s2 = scr(p); if (!inFrame(s2)) continue; const hb = bodyAt(f, s2.x, s2.y, new Set([...ARMS].filter((q) => !reaching.has(q)))); if (hb && Math.abs(s2.d - hb.d) < 0.12) { m2++; arm2 = hb.name; } }
            if (m2 >= 1) note(`${s.id}|${a.name}|onarm|${o.mesh.uuid}`, { shot: s.id, who: a.name, kind: "held", what: `the thing in ${o.holder}'s hand, ${describe(o)}, lies on ${a.name}'s ${arm2} at the same depth: in front of it or into it cannot be told` }, F, m2 / 13); }
          if (n >= 2) note(`${s.id}|${a.name}|over|${o.mesh.uuid}|${part}`, { shot: s.id, who: a.name, kind: "held", what: `the thing in ${o.holder}'s hand, ${describe(o)}, is drawn over ${a.name}'s ${part}` }, F, n / 13); }
        // (d) a hand or a forearm that does not hold a thing goes through it: in the picture part of the hand lies in front of the thing
        //     and part behind it (Tacitus's writing hand: the top of the fist behind the scroll's roller, the bottom before the sheet)
        //     A hand that holds something in front of the card has its fingers drawn in a layer before the thing (the two-layer hand):
        //     the drawn hand reaches from its palm on the card out to that layer, and a surface between the two is through the hand
        const span = (side: "L" | "R") => { let sp = 0.02; for (const r of th.rows) { if (!r.o || !r.holder) continue; for (const part of r.holder.split(" & ")) { const [who, hands] = part.split(" "); if (who !== a.name || !hands?.split("+").includes(side)) continue;
            const w = new THREE.Vector3(...a.joint(side === "L" ? "wrL" : "wrR")), op = new THREE.Vector3().setFromMatrixPosition(r.o.matrixWorld), dd = w.distanceTo(C) - op.distanceTo(C); if (dd > 0.02) sp = Math.max(sp, dd + 0.05); } } return sp; };
        const roots = new Map<THREE.Object3D, Ob[]>(); for (const o of held) if (o.root) roots.set(o.root, [...(roots.get(o.root) ?? []), o]);
        for (const [root, obs] of roots) { const holder = obs[0].holder!, sides = new Set<string>(); for (const part of holder.split(" & ")) { const [who, hands] = part.split(" "); if (who === a.name && hands) for (const h of hands.split("+")) sides.add(h); }
          const box = new THREE.Box3(); for (const o of obs) box.union(o.aabb); if (!box.clone().expandByScalar(0.1).intersectsBox(f.B.box)) continue;
          //     The forearm and the hand are read together, as one arm: a forearm behind the sheet with the hand before it has gone through it
          for (const side of ["L", "R"] as const) { if (sides.has(side)) continue; let front = 0, behind = 0, mixed = 0, n0 = 0, where = "";
            for (const q of f.B.parts) { if (q.P.hand !== side) continue; const sp = q.P.name.endsWith("hand") ? span(side) : 0.02; n0 += q.pts.length;
              for (const p of q.pts) { if (box.distanceToPoint(p) > 0.3 || !seen(p)) continue; const dir = p.clone().sub(C), d = dir.length(); rc.set(C, dir.normalize()); rc.near = 0.05; rc.far = d + 2; let n = 0, fa = 0, inn = 0;
                for (const o of obs) for (const h of rc.intersectObject(o.mesh, false)) { if (h.distance < d - sp - 0.005) n++; else if (h.distance > d + 0.005) fa++; else inn++; }
                if (inn || (n && fa)) { mixed++; where = q.P.name; } else if (n) { behind++; where ||= q.P.name; } else if (fa) front++; } }
            if (mixed || (front && behind)) note(`${s.id}|${a.name}|thru|${side}|${root.uuid}`, { shot: s.id, who: a.name, kind: "held", what: `${a.name}'s ${side === "L" ? "left" : "right"} arm goes through the thing in ${holder}'s hand (${nameOf(root) || describe(obs[0])}) at the ${where}: part of the arm before the thing, part behind it` }, F, (mixed + Math.min(front, behind)) / Math.max(1, n0)); } } }
      // the crowd's figures big enough in the picture to read their pose (a sixth of the frame's height or more: the spectator behind Sir
      // in the gladiators' stands, her arm straight across her chest with a fist at 5.5-6 s): the joint limits, the straight arm held out
      // and the locked elbow, as for the cast. (Their seats and feet are the stands', not tested here)
      for (const cr of th.crowd) { if (!cr.D || !cr.pose) continue; const top = scr(new THREE.Vector3(cr.at[0], cr.at[1] + cr.h, cr.at[2])), bot = scr(new THREE.Vector3(...cr.at));
        if (Math.abs(bot.y - top.y) < 1920 / 6 || (!inFrame(top) && !inFrame(bot))) continue;
        const nm = `a spectator (${cr.tag}) at ${cr.at.map((x) => x.toFixed(1)).join(", ")}`, kc = `crowd|${cr.tag}|${cr.at.map((x) => x.toFixed(1)).join()}`, P = cr.D.props(cr.o?.who ?? "sir"), csk = solve(P, cr.pose, 0), cv = csk.v;
        const cpose = (key: string, what: string) => note(`${s.id}|${kc}|${key}`, { shot: s.id, who: nm, kind: "pose", what: `${nm}: ${what}` }, F, 0.01);
        const crun = (k: string, on: boolean, need: number, fire: () => void) => { const key = `${kc}|${k}`, r = runs.get(key); if (!on) { runs.delete(key); return; } const q = r ?? { start: F, n: 0 }; q.n += every; runs.set(key, q);
          if (q.n >= need) { const fk = `${s.id}|${kc}|${k}`, fresh = !faults.has(fk); fire(); const e = faults.get(fk); if (fresh && e) e.f0 = q.start; } };
        for (const x of jointLimits(csk)) cpose(`limit|${x.part}|${x.what.replace(/[\d.]+ degrees/g, "")}`, x.what);
        for (const sd of ["L", "R"] as const) { const kind = sd === "L" ? cr.o?.handL : cr.o?.handR, u = new THREE.Vector3(...sub3(cv[`el${sd}`], cv[`sh${sd}`])), f = new THREE.Vector3(...sub3(cv[`wr${sd}`], cv[`el${sd}`]));
          const bend = (u.angleTo(f) * 180) / Math.PI, elev = (u.angleTo(new THREE.Vector3(0, -1, 0)) * 180) / Math.PI, side = sd === "L" ? "left" : "right";
          crun(`tpose|${sd}`, bend < 30 && elev > 60 && elev < 120 && kind !== "point", 15, () => cpose(`tpose|${sd}`, `the ${side} arm is held straight out near shoulder height for more than half a second (bent ${bend.toFixed(0)} degrees, the upper arm ${elev.toFixed(0)} degrees from hanging)`));
          crun(`locked|${sd}`, lockedElbows(csk).includes(sd) && kind !== "point", 15, () => cpose(`locked|${sd}`, `the ${side} elbow is locked straight with the arm lifted for more than half a second`));
          // (m) as for the cast: the arm reaching toward the lens or away from it by more than 0.4 leg lengths, its wrist drawn over its
          //     own chest or belly (the crowd's card is drawn at its turn rounded to 20 degrees, crowdCard). The spectator clapping with
          //     her hands toward the lens, drawn as an arm across her chest with a fist
          { const LLc = P.thigh + P.shin, yaw = Math.round((cr.heading! - (Math.atan2(C.x - cr.at[0], C.z - cr.at[2]) * 180) / Math.PI) / 20) * 20, vk = solve(P, cr.pose, yaw), j = vk.j, z = vk.z;
            const w = j[`wr${sd}`], ny = j.neck[1], py = j.pelvis[1], k = Math.max(0, Math.min(1, (w[1] - ny) / (py - ny || 1))), sx = j.neck[0] + (j.pelvis[0] - j.neck[0]) * k;
            const over = w[1] > ny && w[1] < py && Math.abs(w[0] - sx) < P.shW, depth = (z[`wr${sd}`] - (z.neck + z.pelvis) / 2) / LLc;
            crun(`lens|${sd}`, over && Math.abs(depth) > 0.4, 12, () => cpose(`lens|${sd}`, `the ${side} arm reaches ${depth > 0 ? "toward" : "away from"} the lens (${Math.abs(depth).toFixed(2)} leg lengths) and is drawn over its own body: the hand reads as on its own body`)); } } }
      for (const B of bodies) { const a = B.a, floor = a.at[1], near = (o: Ob) => o.aabb.intersectsBox(B.box);
        const mine = (o: Ob) => !!o.holder && o.holder.split(" & ").some((part) => part.split(" ")[0] === a.name);
        const holdSides = (o: Ob) => { const sides = new Set<string>(); for (const part of (o.holder ?? "").split(" & ")) { const [who, hands] = part.split(" "); if (who === a.name && hands) for (const h of hands.split("+")) sides.add(h); } return sides; };
        const list = [...solids.filter((o) => near(o) && o.aabb.max.y > floor + 0.05), ...held.filter(near)];
        for (const o of list) { const isHeld = !!o.holder, own = isHeld && mine(o), sides = own ? holdSides(o) : new Set<string>(); pairs++;
          // a soft thing held (a bundle, a sack) may be hugged by the holder's other arm; a hard or flat one (a sheet, a shield) may not
          if (own && (o.kind === "ball" || o.kind === "lathe")) continue;
          for (const q of B.parts) { if (own && (!q.P.hand || sides.has(q.P.hand) || sides.size === 0)) continue;
            let worst = 0; for (const p of q.pts) { if (o.aabb.distanceToPoint(p) < q.r && seen(p, q.r)) { const pen = q.r - dist(o, p, q.r); if (pen > worst) worst = pen; } }
            if (worst > q.tol) note(`${s.id}|${a.name}|${q.P.name}|${o.mesh.uuid}`, { shot: s.id, who: a.name, kind: isHeld ? "held" : "solid", what: `${a.name}'s ${q.P.name} is inside ${isHeld ? `the thing in ${o.holder}'s hand, ` : ""}${describe(o)}` }, F, worst); } }
        // the garment below the pelvis (a robe, a dress, a coat's tails): the card draws it hanging along the spine down to its hem, sitting
        // too, so a seated man's robe went down through his stool (Jesper, 19 Nov, the doctor in the gladiators: "hans dress går igenom
        // pallen"). Cloth may lie on a seat and give a little (4 cm); deeper than that it goes through it
        if (a.D.garment) { const rows = a.D.garment, mpu = realOf(a).mpu, pv = new THREE.Vector3(...a.joint("pelvis")), up = new THREE.Vector3(...a.joint("neck")).sub(pv).normalize(), hr = (a.heading * Math.PI) / 180;
          const fw = new THREE.Vector3(Math.sin(hr), 0, Math.cos(hr)), lf = new THREE.Vector3().crossVectors(up, fw).normalize(), gpts: THREE.Vector3[] = [];
          const rowAt = (h: number) => { let i = 0; while (i < rows.length - 2 && rows[i + 1][0] < h) i++; const t = Math.max(0, Math.min(1, (h - rows[i][0]) / (rows[i + 1][0] - rows[i][0]))); return rows[i].map((x, j) => x + (rows[i + 1][j] - x) * t); };
          // (seated, the card lays the garment over the lap, cast.ts / common.ts frame: along the real thighs and down the shins, the cloth as
          //  thick as the thigh, on the lap above and on the seat below; blended in as far as he sits, as the drawing does)
          const R = realOf(a), sitW = a.o.drape === false ? 0 : seated({ v: R.v } as Parameters<typeof seated>[0]), mid = (x: string): THREE.Vector3 => R.W(R.v[(x + "L") as Joint]).lerp(R.W(R.v[(x + "R") as Joint]), 0.5);
          const HP = mid("hip"), KN = mid("kn"), AN = mid("an"), Pz = R.P, thR = 0.065 * (a.h / 1.8) + 0.01;
          const lapAt = (d: number) => { const [p0, p1, L0, d0] = d <= Pz.thigh ? [HP, KN, Pz.thigh, d] : [KN, AN, Pz.shin, d - Pz.thigh]; const dir = p1.clone().sub(p0).normalize(); return { p: p0.clone().lerp(p1, Math.min(d0, L0 * 1.2) / L0), dir }; };
          const hem = rows[0][0]; if (hem < -20) for (let h = hem; h < -20; h += 25) { const [, w, df, db] = rowAt(h), lp = sitW > 0 ? lapAt(-h) : null, perp = lp ? new THREE.Vector3().crossVectors(lf, lp.dir).normalize() : null;
            for (const [l, d] of [[0, df], [0, -db], [w, 0], [-w, 0], [0.7 * w, 0.7 * df], [-0.7 * w, 0.7 * df], [0.7 * w, -0.7 * db], [-0.7 * w, -0.7 * db], [0, 0]] as const) {
              const hang = pv.clone().addScaledVector(up, h * mpu).addScaledVector(lf, l * 0.9 * mpu).addScaledVector(fw, d * 0.9 * mpu);
              if (!lp || !perp) { gpts.push(hang); continue; }
              const onLap = lp.p.clone().addScaledVector(lf, l * 0.9 * mpu).addScaledVector(perp, Math.sign(d) * thR * (l !== 0 ? 0.7 : 1));
              gpts.push(hang.lerp(onLap, sitW)); } }
          for (const o of solids.filter((o) => o.aabb.max.y > floor + 0.05)) { let worst = 0, low = Infinity;
            for (const p of gpts) { if (p.y < floor + 0.02 || o.aabb.distanceToPoint(p) > 0.02 || !seen(p)) continue; const pen = 0.02 - dist(o, p, 0.02); if (pen > worst) worst = pen; low = Math.min(low, p.y); }
            if (worst > 0.04) note(`${s.id}|${a.name}|garment|${o.mesh.uuid}`, { shot: s.id, who: a.name, kind: "solid", what: `${a.name}'s robe (the garment below his waist, down to its hem) goes through ${describe(o)}, ${(worst * 100).toFixed(0)} cm in` }, F, worst); } }
        // two people in the same space
        for (const B2 of bodies) { if (B2.a.name <= a.name || !B.box.intersectsBox(B2.box)) continue; pairs++;
          // (two hands declared as holding each other, grips.handshake: they meet by design, so those two hands are not "in the same space")
          const joined = (q: Part, q2: Part) => !!q.hand && !!q2.hand && q.name.endsWith("hand") && q2.name.endsWith("hand") && th.rows.some((r) => r.use === "joined" && r.holder.includes(`${a.name} ${q.hand}`) && r.holder.includes(`${B2.a.name} ${q2.hand}`));
          for (const q of B.parts) for (const q2 of B2.parts) { if (joined(q.P, q2.P)) continue; const tol = Math.max(q.tol, q2.tol) + (q.P.hand || q2.P.hand ? 0.02 : 0); let worst = 0;
            for (const p of q.pts) for (const p2 of q2.pts) { const pen = q.r + q2.r - p.distanceTo(p2); if (pen > worst && seen(p.clone().lerp(p2, 0.5))) worst = pen; }
            if (worst > tol) note(`${s.id}|${a.name}|${q.P.name}|${B2.a.name}|${q2.P.name}`, { shot: s.id, who: a.name, kind: "figure", what: `${a.name}'s ${q.P.name} and ${B2.a.name}'s ${q2.P.name} are in the same space` }, F, worst); } }
        // ---- the body moves like a human's (Jesper, 19 Nov: "Human bodies move like humans") ----
        if (a.spin === undefined) humanTests(B, F);
        // the feet: the lower one rests on what is under it; a foot that rests does not slide
        if (a.spin === undefined) { const feet = (["L", "R"] as const).map((sd) => { const h = new THREE.Vector3(...a.joint(sd === "L" ? "heelL" : "heelR")), o2 = new THREE.Vector3(...a.joint(sd === "L" ? "toeL" : "toeR")); return h.y < o2.y ? h : o2; });
          // (a foot planted on its landing spot is the one he stands on, even when its joint lies higher than the other foot's: the drawing
          // puts it on the spot (below), and the swinging foot was taken for the lower one, so that a walker in mid-stride "floated" 7 cm,
          // gladiators v4's parade)
          const planted = (["L", "R"] as const).find((sd) => { const lg = (sd === "L" ? a.pose.legL : a.pose.legR) as { y?: number; th?: unknown } | undefined; return !!lg && lg.th === undefined && (lg.y ?? 0) < 1e-4 && !!a.land?.[sd]; });
          const low = planted ? feet[planted === "L" ? 0 : 1] : feet[0].y < feet[1].y ? feet[0] : feet[1]; let top = -Infinity, what = "";
          // (a thing others carry is a surface too, for someone on it who does not hold it himself: the wounded man on the gladiators'
          // stretcher stood "on nothing")
          const carriers = held.filter((o) => !o.holder!.split(" & ").some((p) => p.split(" ")[0] === a.name) && o.geo.type !== "PlaneGeometry");
          const under = [...solids, ...carriers].filter((o) => o.aabb.min.x - 0.05 < low.x && o.aabb.max.x + 0.05 > low.x && o.aabb.min.z - 0.05 < low.z && o.aabb.max.z + 0.05 > low.z && o.aabb.min.y < low.y + 0.3);
          for (const o of under) { rc.set(new THREE.Vector3(low.x, low.y + 0.3, low.z), DIRS[3]); rc.near = 0; rc.far = 1.0; const h = rc.intersectObject(o.mesh, false)[0]; if (h && h.point.y > top) { top = h.point.y; what = describe(o); } }
          if (top === -Infinity && floor <= 0.001) { top = 0; what = "the ground"; }
          let gap = low.y - top; if (!seen(low, 0.05)) { prevFoot.delete(a.name); continue; }
          // a planted foot is drawn on the line from the lens to the spot it stands on (people.ts plantFix), so it is seen standing where that
          // line meets the figure's own ground: what is under that spot decides whether he stands on it, floats over it or is sunk into it
          const lowSide: "L" | "R" = feet[0] === low ? "L" : "R", leg = (lowSide === "L" ? a.pose.legL : a.pose.legR) as { y?: number; th?: unknown } | undefined;
          if (leg && leg.th === undefined && (leg.y ?? 0) < 1e-4 && a.land?.[lowSide] && C.y > floor + 0.05) { const k = (C.y - floor) / (C.y - low.y || 1e-9), G = C.clone().add(low.clone().sub(C).multiplyScalar(k)); let t2 = -Infinity;
            for (const o of solids) { if (o.aabb.min.x - 0.05 > G.x || o.aabb.max.x + 0.05 < G.x || o.aabb.min.z - 0.05 > G.z || o.aabb.max.z + 0.05 < G.z) continue; rc.set(new THREE.Vector3(G.x, G.y + 0.3, G.z), DIRS[3]); rc.near = 0; rc.far = 1.0; const h = rc.intersectObject(o.mesh, false)[0]; if (h && h.point.y > t2) { t2 = h.point.y; what = describe(o); } }
            if (t2 === -Infinity && floor <= 0.001) { t2 = 0; what = "the ground"; } if (t2 > -Infinity) { top = t2; gap = floor - t2; } }
          if (top === -Infinity) note(`${s.id}|${a.name}|floor`, { shot: s.id, who: a.name, kind: "floor", what: `${a.name} stands on nothing (no surface under the lower foot within a metre)` }, F, 1);
          // a runner's feet are both off the ground for a moment in every stride: floating is a figure set above what is under it, or one
          // in the air for longer than a stride's flight (the review's limit: more than 0.2 s in the air without a jump fails)
          else if (gap > 0.03 && (floor - top > 0.03 || (airborne.get(a.name) ?? 0) > 6)) note(`${s.id}|${a.name}|float`, { shot: s.id, who: a.name, kind: "floor", what: `${a.name}'s lower foot is above ${what}: floating` }, F, gap);
          else if (gap < -0.03) note(`${s.id}|${a.name}|sunk`, { shot: s.id, who: a.name, kind: "floor", what: `${a.name}'s lower foot is sunk into ${what}` }, F, -gap);
          // the foot that carries him (the lower, flat on what is under it, the other clearly off it) stays where it is
          //     (heel with heel and toe with toe: a foot rolling from its heel onto its toes keeps one of them where it was)
          const other = feet[0] === low ? feet[1] : feet[0], side: "L" | "R" = feet[0] === low ? "L" : "R", now = { heel: a.joint(side === "L" ? "heelL" : "heelR"), toe: a.joint(side === "L" ? "toeL" : "toeR"), side, rest: top > -Infinity && Math.abs(gap) < 0.012 && other.y - low.y > 0.02 }, was = prevFoot.get(a.name);
          airborne.set(a.name, gap > 0.03 ? (airborne.get(a.name) ?? 0) + every : 0);
          //     measured in the picture: a card's foot moves along the line of sight with the card, which cannot be seen; what is seen is
          //     the foot leaving the spot of the ground it stood on (last frame's spot, seen through this frame's lens), in metres there
          //     (the review's limit: a foot that carries him and moves more than 1 px a frame in the picture, three frames running, fails)
          const slid = (p0: V3, p1: V3) => { const A = scr(new THREE.Vector3(...p0)), B = scr(new THREE.Vector3(...p1)); return Math.hypot(A.x - B.x, A.y - B.y); };
          if (was && was.rest && now.rest && was.side === side && every === 1) { const d = Math.min(slid(was.heel, now.heel), slid(was.toe, now.toe)), run = d > 1 ? (sliding.get(a.name) ?? 0) + 1 : 0; sliding.set(a.name, run);
            if (run >= 3) note(`${s.id}|${a.name}|slide${side}`, { shot: s.id, who: a.name, kind: "slide", what: `${a.name}'s ${side === "L" ? "left" : "right"} foot slides while he stands on it, ${run} frames running` }, F, d); } else sliding.set(a.name, 0);
          prevFoot.set(a.name, now); } }
    }
  }
  return { faults: [...faults.values()], frames, pairs, figuresTried };
};

/** the faults as lines for the film check: shot, frames (and film seconds), who, what, how deep */
export const bodyLines = (film: Film, r: ReturnType<typeof bodyCheck>) => r.faults.map((f) => `${f.shot} frames ${f.f0}-${f.f1} (film ${(f.f0 / film.fps).toFixed(2)}-${((f.f1 + 1) / film.fps).toFixed(2)} s): ${f.what}${f.kind === "slide" ? ` (up to ${f.deep.toFixed(1)} px a frame)` : f.kind === "pose" ? "" : `, ${(f.deep * 100).toFixed(0)} cm`}`);
