// What stands between the lens and the people (Jesper, 18 November, after the black flag's mast before Sir Digsworth at 2.3-4.4 s):
// nothing in the foreground (a mast, a post, a rope, a rail) may cover a face or cut a figure in two, least of all in the first five
// seconds. The film check casts rays from the lens to points on each figure (its face, across its chest, down its middle) through the
// world's solid things: a face with two or more of its points behind something fails, and so does a figure with something across its
// chest or its middle that has the figure showing on both sides of it.
import * as THREE from "three";
import type { Film } from "./film";

/** a thing that stops the eye: drawn solid (not a glow, a puff of smoke or a pane of light) */
const solid = (m: THREE.Mesh) => {
  const mats = (Array.isArray(m.material) ? m.material : [m.material]) as THREE.Material[];
  return mats.every((x) => x && x.visible !== false && !(x.transparent && (x as THREE.MeshBasicMaterial).opacity < 0.9) && x.blending !== THREE.AdditiveBlending);
};
/** the name to give a thing in a fault: its own, or that of the nearest named group it sits in */
const nameOf = (o: THREE.Object3D | null) => { for (let p = o; p; p = p.parent) if (p.name) return p.name; return "a thing"; };
const hiddenBy = (o: THREE.Object3D, hide: Set<string>) => { for (let p: THREE.Object3D | null = o; p; p = p.parent) if (p.name && hide.has(p.name)) return true; return false; };

/** the faults: a face covered, or a figure cut in two, by something in the foreground (every 0.1 s in the first five seconds, else `step`) */
export const occlusions = (film: Film, step = 0.2) => {
  const bad: string[] = [], seenOnce = new Set<string>(), world = film.world(); world.updateMatrixWorld(true);
  const meshes: THREE.Mesh[] = []; world.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh && m.visible && solid(m)) meshes.push(m); });
  const rc = new THREE.Raycaster(), lens = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.1, 3000), up = new THREE.Vector3(0, 1, 0);
  for (const s of film.shots) {
    const hide = new Set(s.hide ?? []), live = meshes.filter((m) => !hiddenBy(m, hide));
    for (let t = 0; t < s.b - s.a - 1e-6; t += s.a + t < 5 ? 0.1 : step) {
      const cam = s.cam(t, t / (s.b - s.a)), C = new THREE.Vector3(...cam.pos), fwd = new THREE.Vector3(...cam.look).sub(C).normalize(), right = new THREE.Vector3().crossVectors(fwd, up).normalize();
      lens.fov = cam.fov; lens.position.copy(C); lens.lookAt(...cam.look); lens.updateProjectionMatrix(); lens.updateMatrixWorld(true);
      const inPicture = (p: THREE.Vector3) => { const q = p.clone().project(lens); return q.z < 1 && Math.abs(q.x) < 0.98 && Math.abs(q.y) < 0.98; };
      // what is before this point, or null: for a face, anything nearer the lens than it (a face half behind a mast is covered, however
      // near the mast stands to him); for a figure cut in two, only the foreground, the nearer two thirds of the way from the lens (a
      // pillar or a table right beside him is the scene he stands in; a mast or a post near the lens is what the rule is about)
      const before = (p: THREE.Vector3, near = false) => { const d = p.clone().sub(C), dist = d.length(); rc.set(C, d.normalize()); rc.near = 0.05; rc.far = Math.max(0.06, near ? Math.min(dist - 0.12, dist * 0.66) : dist - 0.12); return rc.intersectObjects(live, false)[0]?.object ?? null; };
      const at = `${s.id} at ${t.toFixed(1)} s (film ${(s.a + t).toFixed(1)} s)`;
      for (const a of s.cast(t, s.a + t)) {
        const base = new THREE.Vector3(...a.at); if (base.clone().sub(C).dot(fwd) < 0.3) continue;
        const pt = (x: number, y: number) => base.clone().addScaledVector(right, x * a.h).addScaledVector(up, y * a.h);
        // the face: five points round it; two or more behind something is a covered face
        const face = [[0, 0.9], [0.06, 0.9], [-0.06, 0.9], [0, 0.95], [0, 0.85]].map(([x, y]) => pt(x, y));
        if (inPicture(face[0])) { const hits = face.map((p) => before(p)).filter((o): o is THREE.Object3D => !!o);
          if (hits.length >= 2) { const k = `${s.id}:${a.name}:face:${nameOf(hits[0])}`; if (!seenOnce.has(k)) { seenOnce.add(k); bad.push(`${at}: ${a.name}'s face is behind ${nameOf(hits[0])} in the foreground`); } } }
        // cut in two: across the chest, and down the middle; the figure shows (in the picture) on both sides of what covers it
        for (const [kind, pts] of [["across", [-0.2, -0.15, -0.1, -0.05, 0, 0.05, 0.1, 0.15, 0.2].map((x) => pt(x, 0.62))], ["down", [0.12, 0.22, 0.32, 0.42, 0.52, 0.62, 0.72, 0.8].map((y) => pt(0, y))]] as [string, THREE.Vector3[]][]) {
          const state = pts.map((p) => (!inPicture(p) ? "out" : before(p, true) ? "hid" : "seen"));
          const first = state.indexOf("seen"), last = state.lastIndexOf("seen"), mid = state.slice(first + 1, last);
          if (first >= 0 && last > first && mid.includes("hid")) { const o = before(pts[first + 1 + mid.indexOf("hid")], true), k = `${s.id}:${a.name}:${kind}:${nameOf(o)}`;
            if (!seenOnce.has(k)) { seenOnce.add(k); bad.push(`${at}: ${nameOf(o)} in the foreground cuts ${a.name} in two (${kind === "across" ? "a mast, post or rope down through him" : "a rail or spar across his middle"})`); } }
        }
      }
    }
  }
  return bad;
};
