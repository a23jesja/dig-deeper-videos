// What stands between the lens and the people (Jesper, 18 November, after the black flag's mast before Sir Digsworth at 2.3-4.4 s):
// nothing in the foreground (a mast, a post, a rope, a rail) may cover a face or cut a figure in two, least of all in the first five
// seconds. The film check casts rays from the lens to points on each figure (its face, across its chest, down its middle) through the
// world's solid things: a face with two or more of its points behind something fails, and so does a figure with something across its
// chest or its middle that has the figure showing on both sides of it.
import * as THREE from "three";
import { castOf } from "./film";
import { Film, captions, textBoxes } from "./film";
import { stageAt, aside } from "./staging";
import { CROWD_LOG } from "../world/people";
import type { Staged } from "./film";

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
      for (const a of castOf(s)(t, s.a + t)) {
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

/** No line of text over a face, a chest or a hand (the review of gladiators v4: "när figurerna nu är större får ingen text ligga över
 *  ansikte, bröst, händer eller själva handlingen"). Every tenth of a second the lines on screen (the question, or the caption, where
 *  the shot puts it) are laid against each figure's face (a circle from the crown to the chin), chest (the neck to below the ribs) and
 *  hands (circles at the wrists), and against every face in the crowd at least 14 px across (the limit the grip check uses; the review
 *  of round 2: the question lay over the eyes of a man behind Sir). A figure whose face is out of the picture is left out */
export const textOver = (film: Film, step = 0.1) => {
  const bad: string[] = [], seen = new Set<string>(), caps = captions(film.words, (w) => w.b <= film.hook.b + 0.02, film.shots.map((s) => s.a));
  const lens = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.1, 3000);
  const hit = (b: [number, number, number, number], c: [number, number], r: number) => { const x = Math.max(b[0], Math.min(c[0], b[2])), y = Math.max(b[1], Math.min(c[1], b[3])); return Math.hypot(x - c[0], y - c[1]) < r; };
  for (const s of film.shots) for (let t = 0; t < s.b - s.a - 1e-6; t += step) {
    const T = s.a + t, lines = textBoxes(film, T, caps); if (!lines.length) continue;
    const cam = s.cam(t, t / (s.b - s.a)); lens.fov = cam.fov; lens.position.set(...cam.pos); lens.lookAt(...cam.look); lens.updateProjectionMatrix(); lens.updateMatrixWorld(true);
    const P = (v: number[]): [number, number] => { const q = new THREE.Vector3(v[0], v[1], v[2]).project(lens); return [(q.x + 1) * 540, (1 - q.y) * 960]; };
    for (const a of castOf(s)(t, T)) { const st = stageAt(a, cam), cr = P(st.joint("crown")), sk = P(st.joint("skull")), R = Math.max(14, Math.hypot(cr[0] - sk[0], cr[1] - sk[1]) * 0.55), hc: [number, number] = [(cr[0] + sk[0]) / 2, (cr[1] + sk[1]) / 2];
      if (hc[0] < -R || hc[0] > 1080 + R || hc[1] < -R || hc[1] > 1920 + R) continue;
      const nk = P(st.joint("neck")), pv = P(st.joint("pelvis")), parts: [string, [number, number], number][] = [["face", hc, R]];
      for (const k of [0.15, 0.4, 0.65]) parts.push(["chest", [nk[0] + (pv[0] - nk[0]) * k, nk[1] + (pv[1] - nk[1]) * k], R * 0.8]);
      for (const sd of ["L", "R"] as const) parts.push([`${sd === "L" ? "left" : "right"} hand`, P(st.joint(sd === "L" ? "wrL" : "wrR")), R * 0.45]);
      for (const l of lines) for (const [part, c, r] of parts) { const key = `${s.id}:${a.name}:${part}:${l.text}`; if (seen.has(key) || !hit(l.box, c, r)) continue; seen.add(key);
        bad.push(`${s.id} at ${t.toFixed(1)} s (film ${T.toFixed(1)} s): the text "${l.text}" lies over ${a.name}'s ${part}`); } }
    // the crowd: the shot's things drawn once with the crowd's heads logged
    if (s.things) { const st: Record<string, Staged> = {}; for (const a of castOf(s)(t, T)) st[a.name] = stageAt(a, cam);
      CROWD_LOG.on = true; CROWD_LOG.heads.length = 0; try { s.things(new THREE.Group(), st, t, T, cam); } finally { CROWD_LOG.on = false; }
      for (const cr of CROWD_LOG.heads) { const hc = [cr.at[0], cr.at[1] + 0.88 * cr.h, cr.at[2]], c = P(hc), e = P(aside(hc as [number, number, number], cam, 0.075 * cr.h, 0)), R = Math.hypot(e[0] - c[0], e[1] - c[1]);
        if (R < 14 || c[0] < 0 || c[0] > 1080 || c[1] < 0 || c[1] > 1920) continue;
        for (const l of lines) { const key = `${s.id}:crowd:${l.text}`; if (seen.has(key) || !hit(l.box, c, R * 0.8)) continue; seen.add(key);
          bad.push(`${s.id} at ${t.toFixed(1)} s (film ${T.toFixed(1)} s): the text "${l.text}" lies over a face in the crowd (${Math.round(2 * R)} px across, at ${Math.round(c[0])}, ${Math.round(c[1])})`); } } } }
  return bad;
};
