// What happens between frames (the shot library review, 20 Nov 2026: the body check and the grips check passed seven clips in which a
// hand went through a door, a door's ring popped up out of nowhere over a sleeve, a pose stood for one frame, the head was redrawn the
// other way round between two frames, the whole figure shook every other frame, the pipe hung in an open mouth, a pointing man looked at
// the lens instead of at what he pointed at, and a figure was cut by the edge of the picture as the clip began). Every frame of every
// shot, each figure as the picture shows it:
//   jump   a joint that goes and comes back in one frame (a pose that stands for one frame), or leaps further in one frame than a body moves;
//   head   the head's drawn turn changing more in one frame than a head turns (12 degrees), or its mirror image changing;
//   shake  the body going back and forth every frame or two, more than a pixel or two each way, for a third of a second;
//   pipe   a pipe in an open mouth (the drawing marks it: cast.ts pipe, "pipeOpen");
//   look   in a shot that says where someone looks (Shot.look), his head turned more than 25 degrees off it;
//   edge   a figure cut by the picture's edge while it is not walking in or out through it;
//   pop    a small thing near a figure that is in front of his body in one frame and behind it in the next (or the other way) while it
//          stays over him in the picture: it pops up out of nowhere (the door's ring over the sleeve);
//   gone   a named thing of the shot there in one frame and not in the next, or the other way, with nobody setting it down or taking it.
import * as THREE from "three";
import type { Film, Staged, V3 } from "./film";
import { castOf } from "./film";
import { stageAt } from "./staging";
import { AUDIT } from "./grips";
import { CROWD_LOG } from "../world/people";
import { solve, type Joint } from "../rig";

export type MotionFault = { shot: string; who: string; what: string; f0: number; f1: number };
const JOINTS: Joint[] = ["pelvis", "neck", "skull", "crown", "shL", "elL", "wrL", "tipL", "shR", "elR", "wrR", "tipR", "hipL", "knL", "anL", "hipR", "knR", "anR"];
const faceTurn = (phi: number) => { const y = ((((phi + 180) % 360) + 360) % 360) - 180, a = Math.abs(y), s = y < 0 ? -1 : 1; return s * (a <= 45 ? a : a <= 90 ? 45 + (a - 45) * (11 / 45) : a <= 110 ? 56 + (a - 90) * (54 / 20) : a); };

export const motionCheck = (film: Film, opt: { shots?: string[] } = {}) => {
  const faults = new Map<string, MotionFault>();
  const note = (k: string, f: Omit<MotionFault, "f0" | "f1">, F: number) => { const e = faults.get(k); if (e) e.f1 = F; else faults.set(k, { ...f, f0: F, f1: F }); };
  const lens = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 3000);
  for (const s of film.shots) { if (opt.shots && !opt.shots.includes(s.id)) continue;
    const F0 = Math.ceil(s.a * film.fps - 1e-6), F1 = Math.ceil(s.b * film.fps - 1e-6);
    type Fig = { pic: Record<string, [number, number, number]>; face: number; mirror: boolean; H: number; box: [number, number, number, number]; heading: number; head: number; at: V3; pipe: boolean; fade: boolean; eyes: { e: [number, number]; p: [number, number] }[]; skullW: V3 };
    const frames: { F: number; figs: Map<string, Fig>; things: Map<string, { names: Set<string>; small: { key: string; x: number; y: number; d: number }[] }>; downs: Set<string> }[] = [];
    const lenses = new Map<number, THREE.PerspectiveCamera>(), lensOf = (F: number) => lenses.get(F)!;
    for (let F = F0; F < F1; F++) { const t = Math.max(0, F / film.fps - s.a), cam = s.cam(t, t / (s.b - s.a)), C = new THREE.Vector3(...cam.pos);
      { const l2 = new THREE.PerspectiveCamera(cam.fov, 1080 / 1920, 0.05, 3000); l2.position.copy(C); l2.lookAt(...cam.look); l2.updateProjectionMatrix(); l2.updateMatrixWorld(true); lenses.set(F, l2); }
      lens.fov = cam.fov; lens.position.copy(C); lens.lookAt(...cam.look); lens.updateProjectionMatrix(); lens.updateMatrixWorld(true);
      const P = (p: V3): [number, number, number] => { const v = new THREE.Vector3(...p), q = v.clone().project(lens); return [(q.x + 1) * 540, (1 - q.y) * 960, v.distanceTo(C)]; };
      const staged: Record<string, Staged> = {}; for (const a of castOf(s)(t, s.a + t)) staged[a.name] = stageAt(a, cam);
      const figs = new Map<string, Fig>();
      for (const a of Object.values(staged)) { const pic: Fig["pic"] = {}; for (const j of JOINTS) pic[j] = P(a.joint(j));
        const xs = Object.values(pic).map((p) => p[0]), ys = Object.values(pic).map((p) => p[1]), H = Math.max(1, Math.max(...ys) - Math.min(...ys));
        const yaw = a.heading - (Math.atan2(cam.pos[0] - a.at[0], cam.pos[2] - a.at[2]) * 180) / Math.PI, sk = solve(a.D.props(a.o.who ?? "sir"), a.pose, yaw);
        // (the drawn figure round its joints: the limbs 3 % of its height wide, the head and its hat 12 % to either side of the skull)
        const r = 0.03 * H, hm = [a.mark?.("headMin"), a.mark?.("headMax")].filter((q): q is V3 => !!q).map((q) => P(q)[0]), hx = hm.length ? hm : [pic.skull[0] - 0.12 * H, pic.skull[0] + 0.12 * H];
        const box: Fig["box"] = [Math.min(...xs.map((x) => x - r), ...hx), Math.max(...xs.map((x) => x + r), ...hx), Math.min(...ys) - 0.04 * H, Math.max(...ys) + 0.02 * H];
        const eyes = (["A", "B"] as const).map((k2) => { const e = a.mark?.(`eye${k2}`), p = a.mark?.(`pupil${k2}`); return e && p ? { e: [P(e)[0], P(e)[1]] as [number, number], p: [P(p)[0], P(p)[1]] as [number, number] } : null; }).filter((q): q is { e: [number, number]; p: [number, number] } => !!q);
        figs.set(a.name, { eyes, skullW: a.joint("skull"), pic, face: faceTurn(sk.faceYaw), mirror: a.o.mirror ?? a.D.mirrorAt?.(yaw) ?? false, H, box, heading: a.heading, head: a.pose.head?.[0] ?? 0, at: a.at, pipe: !!a.mark?.("pipeOpen"), fade: !!a.mark?.("pipeFade") }); }
      // the shot's things: their names, and the small things with where they are in the picture (for the pop test)
      const g = new THREE.Group(); AUDIT.rows = []; AUDIT.on = true; CROWD_LOG.on = false;
      try { s.things?.(g, staged, t, s.a + t, cam); } finally { AUDIT.on = false; } g.updateMatrixWorld(true);
      const downs = new Set<string>(); for (const r of AUDIT.rows) if (!r.holder || /^(down|landed|falling|vanish)/.test(r.use)) downs.add(r.prop);
      const names = new Set<string>(), small: { key: string; x: number; y: number; d: number }[] = [];
      g.traverse((o) => { if (o.name) names.add(o.name); const m = o as THREE.Mesh; if (!m.isMesh || !m.visible || (m as unknown as THREE.Points).isPoints) return;
        if (!m.geometry.boundingBox) m.geometry.computeBoundingBox(); const bb = m.geometry.boundingBox!.clone().applyMatrix4(m.matrixWorld), z = bb.getSize(new THREE.Vector3());
        if (Math.max(z.x, z.y, z.z) > 0.25 || Math.max(z.x, z.y, z.z) < 0.01) return; const c = bb.getCenter(new THREE.Vector3()), p = P([c.x, c.y, c.z]); small.push({ key: `${m.geometry.uuid}:${(m.material as THREE.Material)?.uuid}`, x: p[0], y: p[1], d: p[2] }); });
      frames.push({ F, figs, things: new Map([["", { names, small }]]), downs }); }

    // ---- barred angles (the frozen look: "head never in bare profile"; the review of round 2): a head drawn turned more than 60 degrees
    //      from the lens is in profile or seen from behind. A shot names a figure it shows from behind on purpose, walking away (Shot.away) ----
    for (const q of frames) for (const [name, f] of q.figs) if (Math.abs(f.face) > 60 && !s.away?.[name]) note(`${s.id}|${name}|barred`, { shot: s.id, who: name, what: `${name}'s head is drawn ${Math.abs(f.face).toFixed(0)} degrees turned from the lens: in profile or from behind, an angle the rig must not draw (the face turned toward us within 60 degrees)` }, q.F);
    // ---- per figure, frame to frame ----
    const who = new Set(frames.flatMap((q) => [...q.figs.keys()]));
    for (const name of who) {
      const revs: number[] = []; let lastV: number[] | null = null; const fadeRun: Record<string, number> = {};
      for (let i = 1; i < frames.length; i++) { const A = frames[i - 1].figs.get(name), B = frames[i].figs.get(name), Cn = frames[i + 1]?.figs.get(name); if (!A || !B) continue; const F = frames[i].F;
        // jump: a joint that goes and comes back in one frame, or leaps in one frame
        for (const j of JOINTS) { const a = A.pic[j], b = B.pic[j], d1 = Math.hypot(b[0] - a[0], b[1] - a[1]), lim = (j.startsWith("wr") || j.startsWith("tip") ? 0.1 : /^(an|kn|hip)/.test(j) ? 0.085 : 0.06) * B.H;      // (a walking foot swings fast: 4-6 % a frame)
          if (Cn) { const c = Cn.pic[j], d2 = Math.hypot(c[0] - b[0], c[1] - b[1]), d02 = Math.hypot(c[0] - a[0], c[1] - a[1]); if (d1 > 0.035 * B.H && d2 > 0.035 * B.H && d02 < 0.4 * Math.min(d1, d2)) note(`${s.id}|${name}|jump1|${j}`, { shot: s.id, who: name, what: `${name}'s ${j} goes ${d1.toFixed(0)} px and comes back the next frame: a pose that stands for one frame` }, F); }
          if (d1 > lim) note(`${s.id}|${name}|leap|${j}`, { shot: s.id, who: name, what: `${name}'s ${j} leaps ${d1.toFixed(0)} px in one frame (${((100 * d1) / B.H).toFixed(0)} % of his height)` }, F); }
        // head: the drawn turn, and the mirror image
        const dTurn = Math.abs(((B.face - A.face + 540) % 360) - 180); if (dTurn > 12) note(`${s.id}|${name}|head`, { shot: s.id, who: name, what: `${name}'s head is drawn ${dTurn.toFixed(0)} degrees turned from one frame to the next (a head turns 12 or less a frame)` }, F);
        if (A.mirror !== B.mirror) note(`${s.id}|${name}|mirror`, { shot: s.id, who: name, what: `${name} is drawn as his mirror image from one frame to the next: the face is redrawn the other way round` }, F);
        // shake: the skull going back and forth
        // (the way of the last move of more than 1.5 px, against this one: a turn of way. Four or more in ten frames is a shake, back and
        //  forth every frame or two; the moves between may stand still a frame)
        const v1 = [B.pic.skull[0] - A.pic.skull[0], B.pic.skull[1] - A.pic.skull[1]];
        if (Math.hypot(v1[0], v1[1]) > 1.5) { if (lastV && lastV[0] * v1[0] + lastV[1] * v1[1] < 0) revs.push(F); lastV = v1; }
        while (revs.length && revs[0] < F - 10) revs.shift();
        if (revs.length >= 4) note(`${s.id}|${name}|shake`, { shot: s.id, who: name, what: `${name} shakes: his head goes back and forth every frame or two (${revs.length} turns in ten frames)` }, F);
        // pipe in an open mouth
        if (B.pipe) note(`${s.id}|${name}|pipe`, { shot: s.id, who: name, what: `${name}'s pipe hangs in an open mouth` }, F);
        // a pipe half faded (cast.ts: near profile, on the face's far side, it fades out as the head turns): only while the head is turning
        // through; held four frames or more it is a ghost of a pipe
        fadeRun[name] = B.fade ? (fadeRun[name] ?? 0) + 1 : 0;
        if (fadeRun[name] >= 4) note(`${s.id}|${name}|pipefade`, { shot: s.id, who: name, what: `${name}'s pipe stands half see-through (the head held at the angle where it goes out of sight behind the face)` }, F);
        // look: the head's way against the target the shot names
        const L = s.look?.[name], tt = F / film.fps - s.a; if (L && tt >= (L.from ?? 0) && tt <= (L.to ?? 1e9)) { const way = B.heading + B.head, to = (Math.atan2(L.at[0] - B.at[0], L.at[2] - B.at[2]) * 180) / Math.PI, off = Math.abs(((way - to + 540) % 360) - 180);
          if (off > 25) note(`${s.id}|${name}|look`, { shot: s.id, who: name, what: `${name} looks ${off.toFixed(0)} degrees away from what he looks at (${L.what ?? "the target"})` }, F);
          // (and the eyes: in the picture the pupils lie toward it, when it is off to one side of his head: centred, he looks at the lens)
          const tg = (() => { const q = new THREE.Vector3(...L.at).project(lensOf(F)); return [(q.x + 1) * 540, (1 - q.y) * 960]; })(), hd = [B.pic.skull[0], B.pic.skull[1]], dx = tg[0] - hd[0];
          if (Math.abs(dx) > 0.15 * B.H && B.eyes.length) { const span = B.eyes.length === 2 ? Math.abs(B.eyes[0].e[0] - B.eyes[1].e[0]) || 0.1 * B.H : 0.1 * B.H, sh = B.eyes.reduce((t2, q) => t2 + (q.p[0] - q.e[0]), 0) / B.eyes.length;
            if (Math.sign(sh) !== Math.sign(dx) || Math.abs(sh) < 0.06 * span) note(`${s.id}|${name}|eyes`, { shot: s.id, who: name, what: `${name}'s eyes do not turn toward what he looks at (${L.what ?? "the target"}): in the picture they look ${Math.abs(sh) < 0.06 * span ? "straight out, at the lens" : "the other way"}` }, F); } }
        // edge: cut by the picture's edge while not walking in or out
        // (with 20 px to spare: a cap 2 px from the edge reads as cut by it)
        const [x0, x1, y0, y1] = B.box, M = 20, cut = (x0 < M && x1 > 0) || (x0 < 1080 && x1 > 1080 - M) || (y0 < M && y1 > 0) || (y0 < 1920 && y1 > 1920 - M);
        const vx = B.pic.pelvis[0] - A.pic.pelvis[0], going = (x0 < M && Math.abs(vx) > 2) || (x1 > 1080 - M && Math.abs(vx) > 2);
        if (cut && !going) note(`${s.id}|${name}|edge`, { shot: s.id, who: name, what: `${name} is cut by the picture's edge while he is not walking in or out (the figure in the picture from the first frame)` }, F);
      }
      // (the first frame too)
      const first = frames[0]?.figs.get(name); if (first) { const [x0, x1, y0, y1] = first.box; if ((x0 < 20 && x1 > 0) || (x0 < 1080 && x1 > 1060) || (y0 < 20 && y1 > 0)) note(`${s.id}|${name}|edge0`, { shot: s.id, who: name, what: `${name} is cut by the picture's edge on the shot's first frame` }, frames[0].F); }
    }
    // ---- the things ----
    for (let i = 1; i < frames.length; i++) { const A = frames[i - 1], B = frames[i], F = B.F, tA = A.things.get("")!, tB = B.things.get("")!;
      for (const n of tA.names) if (!tB.names.has(n) && !B.downs.has(n) && !A.downs.has(n)) note(`${s.id}|gone|${n}`, { shot: s.id, who: n, what: `the ${n} is there on one frame and gone on the next, with nobody taking it` }, F);
      for (const n of tB.names) if (!tA.names.has(n) && !B.downs.has(n) && !A.downs.has(n)) note(`${s.id}|came|${n}`, { shot: s.id, who: n, what: `the ${n} appears from one frame to the next, with nobody putting it there` }, F);
      // pop: a small thing over a figure's arm or hand, in front of it on one frame and behind it on the next (or the other way)
      for (const [name, fb] of B.figs) { const fa = A.figs.get(name); if (!fa) continue;
        const over = (f: Fig, x: number, y: number) => { let best: number | null = null; for (const sd of ["L", "R"]) { const js = [`sh${sd}`, `el${sd}`, `wr${sd}`, `tip${sd}`].map((j) => f.pic[j]), rw = 0.035 * f.H;
            for (let q = 0; q < 3; q++) { const a = js[q], b = js[q + 1], vx = b[0] - a[0], vy = b[1] - a[1], L2 = vx * vx + vy * vy || 1, u = Math.max(0, Math.min(1, ((x - a[0]) * vx + (y - a[1]) * vy) / L2));
              if (Math.hypot(x - a[0] - u * vx, y - a[1] - u * vy) < rw) { const d = a[2] + (b[2] - a[2]) * u; best = best === null ? d : Math.min(best, d); } } } return best; };
        for (const m of tB.small) { const prev = tA.small.find((q) => q.key === m.key && Math.hypot(q.x - m.x, q.y - m.y) < 0.05 * fb.H); if (!prev) continue;
          const dA = over(fa, prev.x, prev.y), dB = over(fb, m.x, m.y); if (dA === null || dB === null) continue;
          if ((prev.d < dA - 0.01) !== (m.d < dB - 0.01)) note(`${s.id}|${name}|pop|${m.key}`, { shot: s.id, who: name, what: `a small thing over ${name}'s arm goes from ${prev.d < dA ? "in front of it to behind it" : "behind it to in front of it"} between two frames: it pops up out of nowhere` }, F); } } }
  }
  return [...faults.values()];
};
export const motionLines = (film: Film, r: MotionFault[]) => r.map((f) => `${f.shot} frames ${f.f0}-${f.f1} (film ${(f.f0 / film.fps).toFixed(2)}-${((f.f1 + 1) / film.fps).toFixed(2)} s): ${f.what}`);
