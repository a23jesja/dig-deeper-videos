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
import type { Joint } from "../rig";

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

export type BodyFault = { shot: string; who: string; what: string; f0: number; f1: number; deep: number; kind: "solid" | "held" | "figure" | "floor" | "slide" };

/** the faults of a film (all of them, every frame unless `every` > 1), and how much was tried */
export const bodyCheck = (film: Film, opt: { every?: number; shots?: string[] } = {}) => {
  const faults = new Map<string, BodyFault>(), every = opt.every ?? 1; let frames = 0, pairs = 0, figuresTried = 0;
  const note = (k: string, f: Omit<BodyFault, "f0" | "f1" | "deep">, F: number, deep: number) => { const e = faults.get(k); if (e) { e.f1 = F; e.deep = Math.max(e.deep, deep); } else faults.set(k, { ...f, f0: F, f1: F, deep }); };
  const world = film.world(); world.updateMatrixWorld(true);
  const worldObs: Ob[] = []; world.traverse((o) => { const b = obOf(o as THREE.Mesh); if (b) worldObs.push(b); });
  const things = (s: Film["shots"][number], t: number, staged: Record<string, Staged>) => { const g = new THREE.Group(); AUDIT.rows = []; AUDIT.on = true; CROWD_LOG.on = false;
    try { s.things?.(g, staged, t, s.a + t, s.cam(t, t / (s.b - s.a))); } finally { AUDIT.on = false; } g.updateMatrixWorld(true);
    // a thing two carry is in the rows once for each of them: it is held by both
    const heldBy = new Map<THREE.Object3D, string>(); for (const r of AUDIT.rows) if (r.o) { const h = r.holder || (/sheath|scabbard/.test(r.use) ? "worn" : ""), was = heldBy.get(r.o); heldBy.set(r.o, was && h && was !== "worn" && h !== "worn" && !was.split(" & ").includes(h) ? `${was} & ${h}` : was || h); }
    return { g, heldBy, rows: [...AUDIT.rows] }; };
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
      const bodies = Object.values(st).map((a) => { const sc = a.h / 1.8, J = (j: Joint | [Joint, Joint, number]) => { if (typeof j === "string") return new THREE.Vector3(...a.joint(j)); const [x, y, k] = j; return new THREE.Vector3(...a.joint(x)).lerp(new THREE.Vector3(...a.joint(y)), k); };
        const headL = new THREE.Vector3(...a.joint("crown")).distanceTo(new THREE.Vector3(...a.joint("skull")));
        const parts = PARTS.map((P) => { const A = J(P.a), B = J(P.b), r = P.r < 0 ? -P.r * headL : P.r * sc, n = Math.max(2, Math.ceil(A.distanceTo(B) / 0.035)), pts: THREE.Vector3[] = []; for (let i = 0; i <= n; i++) pts.push(A.clone().lerp(B, i / n)); return { P, r, pts, tol: P.tol * Math.max(1, sc) }; });
        const box = new THREE.Box3(); for (const q of parts) for (const p of q.pts) box.expandByPoint(p); box.expandByScalar(0.15); return { a, parts, box }; });
      figuresTried += bodies.length;
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
        // (c) a thing in someone else's hand drawn over his head, chest or legs
        //     (up to 3 m behind it: a match near the lens drawn across the men hauling behind is as wrong as a blade across the man beside
        //     him; a fiddle bow in front of people running 15 m down the street is only in front of them, as it would be)
        for (const o of held) { if (o.holder!.split(" & ").some((part) => part.split(" ")[0] === a.name)) continue;
          const c0 = o.bb.getCenter(new THREE.Vector3()), z = o.bb.getSize(new THREE.Vector3()), sz = [z.x * o.s[0], z.y * o.s[1], z.z * o.s[2]], ax = sz.indexOf(Math.max(...sz)), e = new THREE.Vector3(); e.setComponent(ax, z.getComponent(ax) / 2);
          let n = 0, part = ""; for (let i = 0; i <= 12; i++) { const p = c0.clone().sub(e).lerp(c0.clone().add(e), i / 12).applyMatrix4(o.M), s2 = scr(p); if (!inFrame(s2)) continue; const hb = bodyAt(f, s2.x, s2.y, CORE); if (hb && s2.d < hb.d && hb.d - s2.d < 3) { n++; part = hb.name; } }
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
        // two people in the same space
        for (const B2 of bodies) { if (B2.a.name <= a.name || !B.box.intersectsBox(B2.box)) continue; pairs++;
          for (const q of B.parts) for (const q2 of B2.parts) { const tol = Math.max(q.tol, q2.tol) + (q.P.hand || q2.P.hand ? 0.02 : 0); let worst = 0;
            for (const p of q.pts) for (const p2 of q2.pts) { const pen = q.r + q2.r - p.distanceTo(p2); if (pen > worst && seen(p.clone().lerp(p2, 0.5))) worst = pen; }
            if (worst > tol) note(`${s.id}|${a.name}|${q.P.name}|${B2.a.name}|${q2.P.name}`, { shot: s.id, who: a.name, kind: "figure", what: `${a.name}'s ${q.P.name} and ${B2.a.name}'s ${q2.P.name} are in the same space` }, F, worst); } }
        // the feet: the lower one rests on what is under it; a foot that rests does not slide
        if (a.spin === undefined) { const feet = (["L", "R"] as const).map((sd) => { const h = new THREE.Vector3(...a.joint(sd === "L" ? "heelL" : "heelR")), o2 = new THREE.Vector3(...a.joint(sd === "L" ? "toeL" : "toeR")); return h.y < o2.y ? h : o2; });
          const low = feet[0].y < feet[1].y ? feet[0] : feet[1]; let top = -Infinity, what = "";
          const under = [...solids.filter((o) => o.aabb.min.x - 0.05 < low.x && o.aabb.max.x + 0.05 > low.x && o.aabb.min.z - 0.05 < low.z && o.aabb.max.z + 0.05 > low.z && o.aabb.min.y < low.y + 0.3)];
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
export const bodyLines = (film: Film, r: ReturnType<typeof bodyCheck>) => r.faults.map((f) => `${f.shot} frames ${f.f0}-${f.f1} (film ${(f.f0 / film.fps).toFixed(2)}-${((f.f1 + 1) / film.fps).toFixed(2)} s): ${f.what}${f.kind === "slide" ? ` (up to ${f.deep.toFixed(1)} px a frame)` : `, ${(f.deep * 100).toFixed(0)} cm`}`);
