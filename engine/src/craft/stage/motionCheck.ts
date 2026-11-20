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
// Added after the shot library's round 2 (the review, 20 Nov 2026), each for a fault the tests above let through:
//   barred   a head drawn more than 60 degrees from the lens: bare profile or the back of the head (02 frame 80);
//   pipe-held wherever the face is drawn: the pipe gone, its bowl with no stem from the corner of the mouth, or half see-through;
//   float    a hand that rests on nothing: still for 0.7 s, open, holding nothing, beside a sitting body off the thigh, or hanging bent
//            in the air (08 frame 45);
//   stiff    an arm held straight out near shoulder height, still for half a second, while the eyes look elsewhere (07 0-1.3 s);
//   jerk     a body, or a thing in a hand, whose movement changes all at once in one frame: still one frame, moving fast the next, or the
//            other way, or turned 2.5 degrees more than the frame before (04 frames 15-16, 06 frames 33-34);
//   gazeY    in a shot that says where someone looks, a target well above or below his eyes while his eyes look straight out (03, 05).
import * as THREE from "three";
import type { Film, Staged, V3 } from "./film";
import { castOf } from "./film";
import { stageAt } from "./staging";
import { AUDIT } from "./grips";
import { CROWD_LOG } from "../world/people";
import { solve, type Joint } from "../rig";
import { seated } from "../designs/common";

export type MotionFault = { shot: string; who: string; what: string; f0: number; f1: number };
/** for setting the limits: MOTION_DEBUG.on = true keeps the largest value of each measure (film_info <film> motion with MOTION_DEBUG=1) */
export const MOTION_DEBUG = { on: false, top: new Map<string, { v: number; F: number }>(), max(k: string, v: number, F: number) { const e = this.top.get(k); if (!e || v > e.v) this.top.set(k, { v, F }); } };
const JOINTS: Joint[] = ["pelvis", "neck", "skull", "crown", "shL", "elL", "wrL", "tipL", "shR", "elR", "wrR", "tipR", "hipL", "knL", "anL", "hipR", "knR", "anR"];
const WING_UP = 50;      // (the elbow-wing test: 52 degrees in trick at v1j was a wing, 47 in the fixed verdict is not)
const faceTurn = (phi: number) => { const y = ((((phi + 180) % 360) + 360) % 360) - 180, a = Math.abs(y), s = y < 0 ? -1 : 1; return s * (a <= 45 ? a : a <= 90 ? 45 + (a - 45) * (11 / 45) : a <= 110 ? 56 + (a - 90) * (54 / 20) : a); };

export const motionCheck = (film: Film, opt: { shots?: string[] } = {}) => {
  const faults = new Map<string, MotionFault>();
  const note = (k: string, f: Omit<MotionFault, "f0" | "f1">, F: number) => { const e = faults.get(k); if (e) { e.f1 = F; if (!e.what) e.what = f.what; } else faults.set(k, { ...f, f0: F, f1: F }); };
  const lens = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 3000);
  const sums: { s: (typeof film.shots)[number]; frames: { F: number; figs: Map<string, { pic: Record<string, [number, number, number]>; H: number; at: V3 }> }[]; cam: { pos: V3; look: V3 }[] }[] = [];
  for (const s of film.shots) { if (opt.shots && !opt.shots.includes(s.id)) continue;
    const F0 = Math.ceil(s.a * film.fps - 1e-6), F1 = Math.ceil(s.b * film.fps - 1e-6);
    type Fig = { pic: Record<string, [number, number, number]>; face: number; mirror: boolean; H: number; box: [number, number, number, number]; heading: number; head: number; at: V3; pipe: boolean; fade: boolean; pipeOn: [number, number] | null; pipeTip: [number, number] | null; pipeRoot: [number, number] | null; W: Record<string, V3>; kind: { L: string; R: string }; held: { L: boolean; R: boolean }; sit: boolean; eyes: { e: [number, number]; p: [number, number] }[]; skullW: V3;
      /** how much of each ear shows (the drawing notes it), the thing each hand holds (its object's id), the arm's joints on the card */
      ears: [number | null, number | null]; hx: [number, number]; patch: { side: string; at: [number, number]; eye: [number, number] | null; span: number } | null; foreTop: { L: boolean; R: boolean }; holds: { L: string | null; R: string | null }; card: Record<string, [number, number]> };
    const frames: { F: number; figs: Map<string, Fig>; things: Map<string, { names: Set<string>; small: { key: string; x: number; y: number; d: number }[] }>; downs: Set<string>; held: Map<string, { p: THREE.Vector3; q: THREE.Quaternion }>;
      /** every thing of the shot with a body to it, by its object's id: where it is and how it is turned (the jerk and release tests) */
      objs: Map<string, { p: THREE.Vector3; q: THREE.Quaternion; M: THREE.Matrix4; name: string; held: boolean }> }[] = [];
    const lenses = new Map<number, THREE.PerspectiveCamera>(), lensOf = (F: number) => lenses.get(F)!;
    for (let F = F0; F < F1; F++) { const t = Math.max(0, F / film.fps - s.a), cam = s.cam(t, t / (s.b - s.a)), C = new THREE.Vector3(...cam.pos);
      { const l2 = new THREE.PerspectiveCamera(cam.fov, 1080 / 1920, 0.05, 3000); l2.position.copy(C); l2.lookAt(...cam.look); l2.updateProjectionMatrix(); l2.updateMatrixWorld(true); lenses.set(F, l2); }
      lens.fov = cam.fov; lens.position.copy(C); lens.lookAt(...cam.look); lens.updateProjectionMatrix(); lens.updateMatrixWorld(true);
      const P = (p: V3): [number, number, number] => { const v = new THREE.Vector3(...p), q = v.clone().project(lens); return [(q.x + 1) * 540, (1 - q.y) * 960, v.distanceTo(C)]; };
      const staged: Record<string, Staged> = {}; for (const a of castOf(s)(t, s.a + t)) staged[a.name] = stageAt(a, cam);
      const figs = new Map<string, Fig>();
      for (const a of Object.values(staged)) { const pic: Fig["pic"] = {}; for (const j of JOINTS) pic[j] = P(a.joint(j));
        // (the feet's heels and toes count for the figure's box: from the ankles alone, a shoe cut by the edge passed, the eye patch Short v1b)
        const feet = (["heelL", "toeL", "heelR", "toeR"] as Joint[]).map((j) => { try { return P(a.joint(j)); } catch { return null; } }).filter((q): q is [number, number, number] => !!q && isFinite(q[0]));
        const xs = [...Object.values(pic), ...feet].map((p) => p[0]), ys = Object.values(pic).map((p) => p[1]), H = Math.max(1, Math.max(...ys) - Math.min(...ys)), ysB = [...ys, ...feet.map((q) => q[1])];
        const yaw = a.heading - (Math.atan2(cam.pos[0] - a.at[0], cam.pos[2] - a.at[2]) * 180) / Math.PI, sk = solve(a.D.props(a.o.who ?? "sir"), a.pose, yaw);
        // (the drawn figure round its joints: the limbs 3 % of its height wide, the head and its hat 12 % to either side of the skull)
        const r = 0.03 * H, hm = [a.mark?.("headMin"), a.mark?.("headMax")].filter((q): q is V3 => !!q).map((q) => P(q)[0]), hx = hm.length ? hm : [pic.skull[0] - 0.12 * H, pic.skull[0] + 0.12 * H];
        const box: Fig["box"] = [Math.min(...xs.map((x) => x - r), ...hx), Math.max(...xs.map((x) => x + r), ...hx), Math.min(...ys) - 0.04 * H, Math.max(...ysB) + 0.02 * H];
        const eyes = (["A", "B"] as const).map((k2) => { const e = a.mark?.(`eye${k2}`), p = a.mark?.(`pupil${k2}`); return e && p ? { e: [P(e)[0], P(e)[1]] as [number, number], p: [P(p)[0], P(p)[1]] as [number, number] } : null; }).filter((q): q is { e: [number, number]; p: [number, number] } => !!q);
        figs.set(a.name, { eyes, skullW: a.joint("skull"), pic, face: faceTurn(sk.faceYaw), mirror: a.o.mirror ?? a.D.mirrorAt?.(yaw) ?? false, H, box, heading: a.heading, head: a.pose.head?.[0] ?? 0, at: a.at, pipe: !!a.mark?.("pipeOpen"), fade: !!a.mark?.("pipeFade"), ...(() => { const m = (n: string) => { const v = a.mark?.(n); return v ? (P(v).slice(0, 2) as [number, number]) : null; }; return { pipeOn: m("pipeOn"), pipeTip: m("pipeTip"), pipeRoot: m("pipeRoot") }; })(), W: Object.fromEntries(JOINTS.map((j) => [j, a.joint(j)])), kind: { L: a.o.handL ?? "relaxed", R: a.o.handR ?? "relaxed" }, held: { L: false, R: false }, sit: seated(sk) > 0.5,
          ears: [a.val?.("earA") ?? null, a.val?.("earB") ?? null], hx: [Math.min(...hx), Math.max(...hx)], patch: (() => { const side = a.o.patch; if (!side) return null; const m = a.mark?.(`patch${side}`), e = a.mark?.(`eye${side}`); if (!m) return { side, at: [NaN, NaN] as [number, number], eye: null, span: 0 }; const A = a.mark?.("eyeA"), B2 = a.mark?.("eyeB"); return { side, at: P(m).slice(0, 2) as [number, number], eye: e ? (P(e).slice(0, 2) as [number, number]) : null, span: A && B2 ? Math.abs(P(A)[0] - P(B2)[0]) : 0 }; })(), foreTop: { L: a.val?.("foreTopL") === 1, R: a.val?.("foreTopR") === 1 }, holds: { L: null, R: null }, card: Object.fromEntries(["shL", "elL", "wrL", "tipL", "shR", "elR", "wrR", "tipR"].map((j) => [j, sk.j[j as Joint] as [number, number]])) }); }
      // the shot's things: their names, and the small things with where they are in the picture (for the pop test)
      const g = new THREE.Group(); AUDIT.rows = []; AUDIT.on = true; CROWD_LOG.on = false;
      try { s.things?.(g, staged, t, s.a + t, cam); } finally { AUDIT.on = false; } g.updateMatrixWorld(true);
      const downs = new Set<string>(); for (const r of AUDIT.rows) if (!r.holder || /^(down|landed|falling|vanish)/.test(r.use)) downs.add(r.prop);
      // (who holds what: a hand named in a row holds a thing; and where each held thing is, and how it is turned, for the jerk test)
      const held = new Map<string, { p: THREE.Vector3; q: THREE.Quaternion }>();
      for (const r of AUDIT.rows) { if (!r.holder || /^(down|landed|falling|vanish)/.test(r.use)) continue;
        for (const part of r.holder.split(/\s*[,&]\s*/)) { const [hn, hs] = part.trim().split(" "), f = figs.get(hn); if (f && hs) for (const sd of hs.split("+")) if (sd === "L" || sd === "R") { f.held[sd] = true; if (r.o) f.holds[sd] = r.o.uuid; } }
        if (r.o && !held.has(r.prop)) held.set(r.prop, { p: r.o.getWorldPosition(new THREE.Vector3()), q: r.o.getWorldQuaternion(new THREE.Quaternion()) }); }
      const names = new Set<string>(), small: { key: string; x: number; y: number; d: number }[] = [];
      g.traverse((o) => { if (o.name) names.add(o.name); const m = o as THREE.Mesh; if (!m.isMesh || !m.visible || (m as unknown as THREE.Points).isPoints) return;
        if (!m.geometry.boundingBox) m.geometry.computeBoundingBox(); const bb = m.geometry.boundingBox!.clone().applyMatrix4(m.matrixWorld), z = bb.getSize(new THREE.Vector3());
        if (Math.max(z.x, z.y, z.z) > 0.25 || Math.max(z.x, z.y, z.z) < 0.01) return; const c = bb.getCenter(new THREE.Vector3()), p = P([c.x, c.y, c.z]); small.push({ key: `${m.geometry.uuid}:${(m.material as THREE.Material)?.uuid}`, x: p[0], y: p[1], d: p[2] }); });
      // (every thing with a body to it, whoever moves it: a door swinging on after it is let go, a bottle falling. Dust, glows and light
      //  are left out: a group with points in it, or with no solid shape)
      const objs: (typeof frames)[number]["objs"] = new Map(), rowOf = new Map<THREE.Object3D, string>(), heldO = new Set<THREE.Object3D>();
      for (const r of AUDIT.rows) if (r.o) { rowOf.set(r.o, r.prop); if (r.holder && !/^(down|landed|falling|vanish)/.test(r.use)) heldO.add(r.o); }
      for (const o of [...g.children, ...rowOf.keys()]) { if (objs.has(o.uuid)) continue; let solid = false, pts = false;
        o.traverse((x) => { const m = x as THREE.Mesh; if ((x as THREE.Points).isPoints) pts = true; else if (m.isMesh && /^(Box|Cylinder|Sphere|Lathe|Extrude|Torus|Cone|Capsule)Geometry$/.test(m.geometry?.type ?? "")) solid = true; });
        if (!solid || pts) continue; objs.set(o.uuid, { p: o.getWorldPosition(new THREE.Vector3()), q: o.getWorldQuaternion(new THREE.Quaternion()), M: o.matrixWorld.clone(), name: rowOf.get(o) ?? (o.name || "thing"), held: heldO.has(o) }); }
      frames.push({ F, figs, things: new Map([["", { names, small }]]), downs, held, objs }); }

    // ---- barred angles (the frozen look: "head never in bare profile"; the review of round 2): a head drawn turned more than 60 degrees
    //      from the lens is in profile or seen from behind. A shot names a figure it shows from behind on purpose, walking away (Shot.away) ----
    for (const q of frames) for (const [name, f] of q.figs) if (Math.abs(f.face) > 60 && !s.away?.[name] && f.box[1] > 0 && f.box[0] < 1080 && f.box[3] > 0 && f.box[2] < 1920)      // (in the picture)
      note(`${s.id}|${name}|barred`, { shot: s.id, who: name, what: `${name}'s head is drawn ${Math.abs(f.face).toFixed(0)} degrees turned from the lens: in profile or from behind, an angle the rig must not draw (the face turned toward us within 60 degrees)` }, q.F);
    // ---- the pipe held in the mouth (the review of step 1): wherever the face is drawn, a pipe that is gone, a bowl with no stem from the
    //      corner of the mouth, or a pipe half see-through ----
    for (const q of frames) for (const [name, f] of q.figs) { if (!f.pipeOn || Math.abs(f.face) > 60) continue;
      const P = f.pipeTip, Rt = f.pipeRoot, why = !P ? "is gone from his mouth" : !Rt ? "has its bowl beside his face with no stem to the corner of his mouth" : Math.hypot(Rt[0] - f.pipeOn[0], Rt[1] - f.pipeOn[1]) > 0.02 * f.H ? "has its stem off the corner of his mouth" : Math.hypot(P[0] - Rt[0], P[1] - Rt[1]) < 0.025 * f.H ? "is seen end on, a stub" : f.fade ? "stands half see-through" : null;
      if (why) note(`${s.id}|${name}|pipe-held`, { shot: s.id, who: name, what: `${name}'s pipe ${why}` }, q.F); }
    // ---- per figure, frame to frame ----
    const who = new Set(frames.flatMap((q) => [...q.figs.keys()]));
    for (const name of who) {
      const revs: number[] = []; let lastV: number[] | null = null;
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
        // look: the head's way against the target the shot names
        const L = s.look?.[name], tt = F / film.fps - s.a; if (L && tt >= (L.from ?? 0) && tt <= (L.to ?? 1e9)) { const way = B.heading + B.head, to = (Math.atan2(L.at[0] - B.at[0], L.at[2] - B.at[2]) * 180) / Math.PI, off = Math.abs(((way - to + 540) % 360) - 180);
          if (off > 25) note(`${s.id}|${name}|look`, { shot: s.id, who: name, what: `${name} looks ${off.toFixed(0)} degrees away from what he looks at (${L.what ?? "the target"})` }, F);
          // (and the eyes: in the picture the pupils lie toward it, when it is off to one side of his head: centred, he looks at the lens)
          const tg = (() => { const q = new THREE.Vector3(...L.at).project(lensOf(F)); return [(q.x + 1) * 540, (1 - q.y) * 960]; })(), hd = [B.pic.skull[0], B.pic.skull[1]], dx = tg[0] - hd[0];
          if (Math.abs(dx) > 0.15 * B.H && B.eyes.length) { const span = B.eyes.length === 2 ? Math.abs(B.eyes[0].e[0] - B.eyes[1].e[0]) || 0.1 * B.H : 0.1 * B.H, sh = B.eyes.reduce((t2, q) => t2 + (q.p[0] - q.e[0]), 0) / B.eyes.length;
            if (Math.sign(sh) !== Math.sign(dx) || Math.abs(sh) < 0.06 * span) note(`${s.id}|${name}|eyes`, { shot: s.id, who: name, what: `${name}'s eyes do not turn toward what he looks at (${L.what ?? "the target"}): in the picture they look ${Math.abs(sh) < 0.06 * span ? "straight out, at the lens" : "the other way"}` }, F); } }
        // edge: cut by the picture's edge while not walking in or out
        // (with 20 px to spare: a cap 2 px from the edge reads as cut by it)
        // (a close-up the shot names (Shot.closeUp) frames the head and lets the body go past the edge: then only the head must be whole)
        const hb = (f: Fig): [number, number, number, number] => [f.hx[0], f.hx[1], f.pic.crown[1] - 0.04 * f.H, f.pic.skull[1] + 0.03 * f.H];
        // (the review, 20 Nov: the head always whole with air above it; the body cut only by the bottom edge, along a clear line across the chest
        //  or the shoulders; no hand or arm cut half way by a side edge)
        const closeWhy = (f: Fig): string | null => { const [a0, a1, b0] = hb(f), Mx = 20, chest = f.pic.neck[1] + 0.45 * (f.pic.pelvis[1] - f.pic.neck[1]);
          if (a0 < Mx || a1 > 1080 - Mx || b0 < 0.03 * f.H) return "his head is cut by the picture's edge or has no air above it";
          if (1920 < f.pic.neck[1] + 0.02 * f.H || 1920 > chest) return "the bottom edge does not cut him along a clear line across the chest or the shoulders";
          for (const sd of ["L", "R"]) for (const j of [`el${sd}`, `wr${sd}`, `tip${sd}`]) { const q = f.pic[j]; if (q[1] < 1920 - Mx && (q[0] < Mx || q[0] > 1080 - Mx)) return `his ${sd === "L" ? "left" : "right"} arm is cut half way by the side of the picture`; }
          return null; };
        const close = !!s.closeUp?.[name], whyC = close ? closeWhy(B) : null, [x0, x1, y0, y1] = close ? [100, 900, 100, 900] : B.box, M = 20, cut = whyC !== null || (x0 < M && x1 > 0) || (x0 < 1080 && x1 > 1080 - M) || (y0 < M && y1 > 0) || (y0 < 1920 && y1 > 1920 - M);
        const vx = B.pic.pelvis[0] - A.pic.pelvis[0], going = (x0 < M && Math.abs(vx) > 2) || (x1 > 1080 - M && Math.abs(vx) > 2);
        if (cut && !going) note(`${s.id}|${name}|edge`, { shot: s.id, who: name, what: close ? `${name} in a close-up: ${whyC}` : `${name} is cut by the picture's edge while he is not walking in or out (the figure in the picture from the first frame)` }, F);
      }
      // (the first frame too)
      const first = frames[0]?.figs.get(name); if (first && !s.closeUp?.[name]) { const [x0, x1, y0, y1] = first.box; if ((x0 < 20 && x1 > 0) || (x0 < 1080 && x1 > 1060) || (y0 < 20 && y1 > 0)) note(`${s.id}|${name}|edge0`, { shot: s.id, who: name, what: `${name} is cut by the picture's edge on the shot's first frame` }, frames[0].F); }
    }
    // ---- the tests added after round 2 ----
    const ang = (u: V3, v: V3) => { const a = Math.hypot(u[0], u[1]) || 1, b = Math.hypot(v[0], v[1]) || 1; return (Math.acos(Math.max(-1, Math.min(1, (u[0] * v[0] + u[1] * v[1]) / (a * b)))) * 180) / Math.PI; };
    const sub3 = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    for (const name of who) {
      for (const sd of ["L", "R"] as const) {
        const wr = `wr${sd}`, tip = `tip${sd}`, sh = `sh${sd}`, el = `el${sd}`;
        // float: a hand still for 0.7 s (21 frames: the wrist within 2 cm of where it was), open, holding nothing, resting on nothing
        let still: number[] = [];
        for (let i = 0; i < frames.length; i++) { const B = frames[i].figs.get(name); if (!B) { still = []; continue; }
          const W = B.W, open = /open|relaxed/.test(B.kind[sd]);
          const thigh = (() => { const h = W[`hip${sd}`], k = W[`kn${sd}`], o = W[`hip${sd === "L" ? "R" : "L"}`], k2 = W[`kn${sd === "L" ? "R" : "L"}`];
            const dseg = (p: V3, a: V3, b: V3) => { const v = sub3(b, a), L2 = v[0] * v[0] + v[1] * v[1] || 1, u = Math.max(0, Math.min(1, ((p[0] - a[0]) * v[0] + (p[1] - a[1]) * v[1]) / L2)); return Math.hypot(p[0] - a[0] - u * v[0], p[1] - a[1] - u * v[1]); };
            return Math.min(dseg(W[wr], h, k), dseg(W[tip], h, k), dseg(W[wr], o, k2), dseg(W[tip], o, k2)); })();
          const up = sub3(W[el], W[sh]), fo = sub3(W[wr], W[el]), bend = ang(up, fo), upFromDown = ang(up, [0, -1, 0]), foFromDown = ang(fo, [0, -1, 0]);
          // (resting on nothing: sitting, the hand off both thighs by 8 cm or more and above the seat; standing, an arm that neither hangs nor
          //  gestures: the forearm hanging down from an elbow bent out from the body)
          const seatY = Math.min(W.hipL[1], W.hipR[1]) - 0.05;
          const unsupported = B.sit ? thigh > 0.08 && W[tip][1] > seatY + 0.04 : bend > 30 && foFromDown < 45 && upFromDown > 25;
          if (!open || B.held[sd] || !unsupported) { still = []; continue; }
          still.push(i); const i0 = still[0], A0 = frames[i0].figs.get(name)!;
          if (Math.hypot(W[wr][0] - A0.W[wr][0], W[wr][1] - A0.W[wr][1]) > 0.02) { still = [i]; continue; }
          if (still.length === 21) note(`${s.id}|${name}|float|${sd}`, { shot: s.id, who: name, what: "" }, frames[still[0]].F);
          if (still.length >= 21) note(`${s.id}|${name}|float|${sd}`, { shot: s.id, who: name, what: `${name}'s ${sd === "L" ? "left" : "right"} hand rests on nothing: open and still for 0.7 s, ${B.sit ? `${(thigh * 100).toFixed(0)} cm off his thighs, above the seat` : "the forearm hanging from an elbow held out"}, holding nothing` }, frames[i].F); }
        // stiff: the arm straight (bent less than 40 degrees) out near shoulder height (40-140 degrees up from hanging), still for half a second
        //  (15 frames), while the face does not turn to the hand: the eyes centred on the skull or turned the other way in the picture
        let run: number[] = [];
        for (let i = 0; i < frames.length; i++) { const B = frames[i].figs.get(name); if (!B) { run = []; continue; }
          // (as the picture shows the arm: its bend and its height are what the eye reads)
          const P2 = B.pic, up = sub3(P2[el], P2[sh]), fo = sub3(P2[wr], P2[el]), bend = ang(up, fo), elev = ang(sub3(P2[wr], P2[sh]), [0, 1, 0]);
          const dx = P2[tip][0] - P2.skull[0], span = B.eyes.length === 2 ? Math.abs(B.eyes[0].e[0] - B.eyes[1].e[0]) || 0.1 * B.H : 0.1 * B.H, pup = B.eyes.length ? B.eyes.reduce((t2, q) => t2 + (q.p[0] - q.e[0]), 0) / B.eyes.length : 0;
          // (he looks at his hand when his pupils lie toward it as the look test asks: a face turned three quarters with its pupils centred
          //  looks at the lens, 07)
          const looks = Math.sign(pup) === Math.sign(dx) && Math.abs(pup) >= 0.06 * span;
          if (bend > 40 || elev < 40 || elev > 140 || looks) { run = []; continue; }
          run.push(i); const A0 = frames[run[0]].figs.get(name)!;
          if (Math.hypot(P2[wr][0] - A0.pic[wr][0], P2[wr][1] - A0.pic[wr][1]) > 0.03 * B.H) { run = [i]; continue; }
          if (run.length === 15) note(`${s.id}|${name}|stiff|${sd}`, { shot: s.id, who: name, what: "" }, frames[run[0]].F);
          if (run.length >= 15) note(`${s.id}|${name}|stiff|${sd}`, { shot: s.id, who: name, what: `${name}'s ${sd === "L" ? "left" : "right"} arm is held straight out at shoulder height (bent ${bend.toFixed(0)} degrees, ${elev.toFixed(0)} up from hanging) for half a second while he does not look at his hand` }, frames[i].F); }
        // wing: holding a thing, the upper arm drawn out near or above shoulder height (65 degrees or more up from hanging in the picture) and the
        //  forearm dropping back from the elbow to the hand, for 0.4 s: the elbow juts out like a chicken's wing (the eye patch Short, calm,
        //  verdict and trick in v1f-v1j, three independent reviews; the stiff test above lets a bent arm pass)
        //  (Shorts only for now: the approved library clip 04 shows the same elbow at 86 degrees, a question for the review, 20 Nov)
        let wing: number[] = [];
        for (let i = 0; i < frames.length && !film.cases; i++) { const B = frames[i].figs.get(name); if (!B || !B.held[sd]) { wing = []; continue; }
          const P2 = B.pic, upU = ang(sub3(P2[el], P2[sh]), [0, 1, 0]), drops = P2[wr][1] - P2[el][1] > 0;
          if (upU < WING_UP || !drops) { wing = []; continue; }
          wing.push(i); if (wing.length >= 12) note(`${s.id}|${name}|wing|${sd}`, { shot: s.id, who: name, what: `${name}'s ${sd === "L" ? "left" : "right"} elbow juts out: the upper arm ${upU.toFixed(0)} degrees up from hanging while the forearm drops back to the held thing, for 0.4 s` }, frames[i].F); }
      }
      // jerk, the body: the pelvis, neck or skull whose step in the picture changes by more than 2.5 % of the height in one frame
      for (let i = 2; i < frames.length; i++) { const A = frames[i - 2].figs.get(name), B = frames[i - 1].figs.get(name), C = frames[i].figs.get(name); if (!A || !B || !C) continue;
        // (or starting from a standstill, or stopping dead, at more than a third of a percent of the height a frame: a body speeds up and
        //  slows down over a few frames; a walk's bob never stands still, 06 frames 33-34)
        for (const j of ["pelvis", "neck", "skull", "wrL", "wrR"]) { const v1 = [B.pic[j][0] - A.pic[j][0], B.pic[j][1] - A.pic[j][1]], v2 = [C.pic[j][0] - B.pic[j][0], C.pic[j][1] - B.pic[j][1]], acc = Math.hypot(v2[0] - v1[0], v2[1] - v1[1]);
          const rest = Math.min(Math.hypot(v1[0], v1[1]), Math.hypot(v2[0], v2[1])) < 0.001 * C.H, hand = j.startsWith("wr"), lim = rest ? (hand ? 0.012 : 0.0035) : hand ? 0.1 : 0.025;
          if (MOTION_DEBUG.on) MOTION_DEBUG.max(`${s.id} body ${j} ${rest ? "from rest" : "moving"}`, (100 * acc) / C.H, frames[i].F);
          if (acc > lim * C.H) note(`${s.id}|${name}|jerk`, { shot: s.id, who: name, what: `${name}'s ${hand ? "hand" : "body"} jerks: his ${j}'s movement changes by ${((100 * acc) / C.H).toFixed(1)} % of his height in one frame${rest ? " from a standstill or to one, with no easing in or out" : ""}` }, frames[i].F); } }
      // gazeY: the target well above or below the eyes (15 degrees or more), and the pupils not lowered or raised toward it
      const L = s.look?.[name];
      if (L) for (const q of frames) { const B = q.figs.get(name), tt = q.F / film.fps - s.a; if (!B || !B.eyes.length || tt < (L.from ?? 0) || tt > (L.to ?? 1e9)) continue;
        const eye = B.skullW, dh = Math.hypot(L.at[0] - B.at[0], L.at[2] - B.at[2]) || 0.01, pitch = (Math.atan2(L.at[1] - eye[1], dh) * 180) / Math.PI;
        const span = B.eyes.length === 2 ? Math.abs(B.eyes[0].e[0] - B.eyes[1].e[0]) || 0.1 * B.H : 0.1 * B.H, dy = B.eyes.reduce((t2, e) => t2 + (e.p[1] - e.e[1]), 0) / B.eyes.length;
        if (Math.abs(pitch) >= 15 && (Math.sign(dy) !== (pitch < 0 ? 1 : -1) || Math.abs(dy) < 0.05 * span)) note(`${s.id}|${name}|gazeY`, { shot: s.id, who: name, what: `${name} looks straight out while what he looks at (${L.what ?? "the target"}) is ${Math.abs(pitch).toFixed(0)} degrees ${pitch < 0 ? "below" : "above"} his eyes` }, q.F); }
    }
    // jerk, a thing: its turn from one frame to the next changing by more than 2.5 degrees, or its step by more than 2.5 cm. Every thing with a
    // body to it, held or not (the shot library's round 3: the door let go stood still and was swinging at full speed on the next frame, 07
    // frames 42-43; before, only things in a hand were tried). A falling thing that lands may stop at once: it hits what it lands on
    { const ids = new Set(frames.flatMap((q) => [...q.objs.keys()]));
      for (const n of ids) for (let i = 2; i < frames.length; i++) { const A = frames[i - 2].objs.get(n), B = frames[i - 1].objs.get(n), C = frames[i].objs.get(n); if (!A || !B || !C) continue;
        const r1 = B.q.clone().multiply(A.q.clone().invert()), r2 = C.q.clone().multiply(B.q.clone().invert()), dTurn = (2 * Math.acos(Math.min(1, Math.abs(r2.clone().multiply(r1.clone().invert()).w))) * 180) / Math.PI;
        const v1 = B.p.clone().sub(A.p), v2 = C.p.clone().sub(B.p), dStep = v2.clone().sub(v1).length(), lands = v1.y < -0.005 && v2.y > 0.5 * v1.y;      // (its fall stopped by what it lands on: its downward speed at least halved)
        if (MOTION_DEBUG.on) { MOTION_DEBUG.max(`${s.id} thing ${B.name} turn`, dTurn, frames[i].F); MOTION_DEBUG.max(`${s.id} thing ${B.name} step`, dStep * 100, frames[i].F); }
        if (!lands && (dTurn > 2.5 || dStep > 0.025)) note(`${s.id}|jerk|${n}`, { shot: s.id, who: B.name, what: `the ${B.name}${B.held && C.held ? " in the hand" : B.held ? " he lets go of" : ""} jerks: ${dTurn > 2.5 ? `its turn changes by ${dTurn.toFixed(1)} degrees` : `its movement changes by ${(dStep * 100).toFixed(1)} cm`} in one frame${!B.held && !C.held ? ", with no hand on it" : ""}` }, frames[i].F); } }
    // ---- added after the shot library's round 3 (the review, 20 Nov 2026) ----
    // ear: an ear that goes from hidden to showing (or back) by more than half of it in one frame while the head turns less than a head may
    //  in a frame: the drawing switched it from behind the head to on top (03 frame 31)
    for (const name of who) for (let i = 1; i < frames.length; i++) { const A = frames[i - 1].figs.get(name), B = frames[i].figs.get(name); if (!A || !B) continue;
      const dTurn = Math.abs(((B.face - A.face + 540) % 360) - 180);
      for (const e of [0, 1]) { const va = A.ears[e], vb = B.ears[e]; if (va === null || vb === null) continue; if (MOTION_DEBUG.on) MOTION_DEBUG.max(`${s.id} ear change`, Math.abs(vb - va), frames[i].F);
        if (Math.abs(vb - va) > 0.5 && dTurn <= 12) note(`${s.id}|${name}|ear|${e}`, { shot: s.id, who: name, what: `${name}'s ${e ? "second" : "first"} ear goes from ${va < vb ? "hidden" : "showing"} (${Math.round(va * 100)} % of it) to ${va < vb ? "showing" : "hidden"} (${Math.round(vb * 100)} %) in one frame while his head turns ${dTurn.toFixed(1)} degrees: it pops ${va < vb ? "in" : "out"}` }, frames[i].F); } }
    // release: a hand lets go of a thing that goes on moving. Where the hand was on it then is a point of the thing; for a second after, while
    //  the hand is still on that point in the picture (within 4 % of his height), the two may part only gently: their speeds apart grow by
    //  no more than 0.25 % of his height a frame each frame (the door in r3d: 0.4 % a frame; a hand dropping back from a door it pushed: 0.1) (the hand and the thing were moving together; the thing slows or the hand drops
    //  back). The door's ring slid out from under the fist at full speed the frame he let go (07 frames 42-47)
    for (const name of who) for (const sd of ["L", "R"] as const) for (let i = 1; i < frames.length; i++) {
      const A = frames[i - 1].figs.get(name), B = frames[i].figs.get(name), u = A?.holds[sd]; if (!A || !B || !u || B.holds[sd] === u) continue;
      const O0 = frames[i - 1].objs.get(u); if (!O0) continue;
      const palm = (f: Fig) => new THREE.Vector3(...f.W[`wr${sd}`]).lerp(new THREE.Vector3(...f.W[`tip${sd}`]), 0.45), Lp = palm(A).applyMatrix4(O0.M.clone().invert());
      const pic = (F: number, v: THREE.Vector3) => { const q = v.clone().project(lensOf(F)); return new THREE.Vector2((q.x + 1) * 540, (1 - q.y) * 960); };
      let g0 = pic(frames[i - 1].F, Lp.clone().applyMatrix4(O0.M)), h0 = pic(frames[i - 1].F, palm(A));
      for (let k = i; k < Math.min(frames.length, i + 30); k++) { const Bk = frames[k].figs.get(name), Ok = frames[k].objs.get(u); if (!Bk || !Ok) break;
        const g1 = pic(frames[k].F, Lp.clone().applyMatrix4(Ok.M)), h1 = pic(frames[k].F, palm(Bk)), near0 = g0.distanceTo(h0) < 0.04 * Bk.H, rel = g1.clone().sub(g0).sub(h1.clone().sub(h0)).length(), lim = 0.0025 * Bk.H * (k - i + 1);
        if (MOTION_DEBUG.on && near0) MOTION_DEBUG.max(`${s.id} release ${Ok.name} parting/limit`, rel / lim, frames[k].F);
        if (near0 && rel > lim) note(`${s.id}|${name}|release|${u}`, { shot: s.id, who: name, what: `the ${Ok.name} slides out from under ${name}'s ${sd === "L" ? "left" : "right"} hand as he lets go: ${k - i + 1} frame${k > i ? "s" : ""} after, it moves ${((100 * rel) / Bk.H).toFixed(1)} % of his height a frame against the hand still on it (a thing let go parts from the hand gently)` }, frames[k].F);
        if (!near0) break; g0 = g1; h0 = h1; } }
    // patch (the eye patch Short, 20 Nov 2026): the patch over its eye wherever the eye is drawn (off it by a third of the space between
    //  the eyes or more, it sits on the cheek or the temple), and on the same eye all through a shot: it moves to the other eye only in a cut
    for (const name of who) for (let i = 0; i < frames.length; i++) { const B = frames[i].figs.get(name), A = i ? frames[i - 1].figs.get(name) : undefined; if (!B?.patch) continue;
      const pt = B.patch; if (pt.eye && !isNaN(pt.at[0]) && Math.hypot(pt.at[0] - pt.eye[0], pt.at[1] - pt.eye[1]) > Math.max(0.33 * pt.span, 0.02 * B.H)) note(`${s.id}|${name}|patch-off`, { shot: s.id, who: name, what: `${name}'s eye patch is drawn beside his eye, ${Math.round(Math.hypot(pt.at[0] - pt.eye[0], pt.at[1] - pt.eye[1]))} px off it` }, frames[i].F);
      // (the eye the script says: the figure's own right ("A") or left ("B") eye, read from the picture, the patch on the side of the face
      //  where that shoulder is, and from the figure's options)
      const want = s.patchEye?.[name]; if (want) { const ea = frames[i].figs.get(name)!.eyes, sh = Math.sign(B.pic.shR[0] - B.pic.shL[0]);
        const mid = ea.length === 2 ? (ea[0].e[0] + ea[1].e[0]) / 2 : null, onRight = mid === null || isNaN(pt.at[0]) || Math.abs(pt.at[0] - mid) < 2 ? null : Math.sign(pt.at[0] - mid) === sh;
        if (pt.side !== want || (onRight !== null && onRight !== (want === "A"))) note(`${s.id}|${name}|patch-eye`, { shot: s.id, who: name, what: `${name}'s eye patch is on his ${(onRight ?? pt.side === "A") ? "right" : "left"} eye; the script has it on his ${want === "A" ? "right" : "left"}` }, frames[i].F); }
      if (A?.patch && A.patch.side !== pt.side) note(`${s.id}|${name}|patch-swap`, { shot: s.id, who: name, what: `${name}'s eye patch moves to his other eye from one frame to the next inside the shot (it may move only in a cut)` }, frames[i].F); }
    // hover: a hand that lies over a small thing in the picture, at about its depth (within 30 cm), without holding it, for 0.3 s or more: it
    //  seems about to take it, or to touch it and not (the eye patch Short v1d: the mate's hand over the bottle on the table)
    for (const name of who) for (const sd of ["L", "R"] as const) { let run2 = 0;
      for (let i = 0; i < frames.length; i++) { const B = frames[i].figs.get(name); if (!B || B.held[sd]) { run2 = 0; continue; }
        const p = B.pic[`wr${sd}`], q = B.pic[`tip${sd}`], hx = (p[0] + q[0]) / 2, hy = (p[1] + q[1]) / 2, hd2 = (p[2] + q[2]) / 2;
        const over = (frames[i].things.get("")?.small ?? []).some((m) => Math.hypot(m.x - hx, m.y - hy) < 0.07 * B.H && Math.abs(m.d - hd2) < 0.3);
        run2 = over ? run2 + 1 : 0; if (run2 >= 9) note(`${s.id}|${name}|hover|${sd}`, { shot: s.id, who: name, what: `${name}'s ${sd === "L" ? "left" : "right"} hand hangs over a small thing for 0.3 s without holding it: it seems about to take it` }, frames[i].F); } }
    // forearm: the card draws the forearm and the hand first and the upper arm over them (unless the forearm comes toward the lens: cast.ts arm). A forearm that lies inside the upper arm's width on
    //  the card for 0.2 s (6 frames), two thirds of it or more hidden, puts the hand on the shoulder: it seems to grow out of it (06 frames 44-119)
    for (const name of who) for (const sd of ["L", "R"] as const) { let run: number[] = [];
      for (let i = 0; i < frames.length; i++) { const B = frames[i].figs.get(name); if (!B || B.foreTop[sd]) { run = []; continue; }
        const c = B.card, S = c[`sh${sd}`], E = c[`el${sd}`], W = c[`wr${sd}`], T = c[`tip${sd}`], wU = 27, wF = 20, L2 = (E[0] - S[0]) ** 2 + (E[1] - S[1]) ** 2 || 1;
        const dUp = (x: number, y: number) => { const k = Math.max(0, Math.min(1, ((x - S[0]) * (E[0] - S[0]) + (y - S[1]) * (E[1] - S[1])) / L2)); return Math.hypot(x - S[0] - k * (E[0] - S[0]), y - S[1] - k * (E[1] - S[1])); };
        let hid = 0, all = 0; for (let k = 0.2; k <= 1.001; k += 0.1) { all++; if (dUp(E[0] + k * (W[0] - E[0]), E[1] + k * (W[1] - E[1])) < wU - 0.5 * wF) hid++; }
        all++; if (dUp((W[0] + T[0]) / 2, (W[1] + T[1]) / 2) < wU - 0.5 * wF) hid++;
        if (MOTION_DEBUG.on) MOTION_DEBUG.max(`${s.id} forearm hidden ${sd}`, hid / all, frames[i].F);
        if (hid / all < 0.66) { run = []; continue; } run.push(i);
        if (run.length === 6) note(`${s.id}|${name}|forearm|${sd}`, { shot: s.id, who: name, what: "" }, frames[run[0]].F);
        if (run.length >= 6) note(`${s.id}|${name}|forearm|${sd}`, { shot: s.id, who: name, what: `${name}'s ${sd === "L" ? "left" : "right"} forearm lies hidden behind his upper arm (${Math.round((100 * hid) / all)} % of it): the hand seems to grow out of his shoulder` }, frames[i].F); } }
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
    sums.push({ s, frames: frames.map((q) => ({ F: q.F, figs: q.figs as unknown as Map<string, { pic: Record<string, [number, number, number]>; H: number; at: V3 }> })), cam: frames.map((q) => { const c = s.cam(Math.max(0, q.F / film.fps - s.a), 0); return { pos: c.pos as V3, look: c.look as V3 }; }) });
  }
  // ---- added after the eye patch Short's v1b (the review, 20 Nov: a jump cut, a shot standing still, the same picture twice) ----
  if (film.cases) return [...faults.values()];
  const dirOf = (c: { pos: V3; look: V3 }) => { const v = [c.look[0] - c.pos[0], c.look[1] - c.pos[1], c.look[2] - c.pos[2]], n = Math.hypot(v[0], v[1], v[2]) || 1; return v.map((x) => x / n); };
  const angleBetween = (a2: { pos: V3; look: V3 }, b2: { pos: V3; look: V3 }) => { const u = dirOf(a2), v = dirOf(b2); return (Math.acos(Math.max(-1, Math.min(1, u[0] * v[0] + u[1] * v[1] + u[2] * v[2]))) * 180) / Math.PI; };
  // jump: across a cut, the same figure about as big (within a fifth), in about the same place in the picture, the lens turned less than 15
  //  degrees: a cut to nearly the same picture, which jumps
  for (let i = 1; i < sums.length; i++) { const A = sums[i - 1], B = sums[i], fa = A.frames[A.frames.length - 1], fb = B.frames[0]; if (!fa || !fb) continue;
    for (const [name, gb] of fb.figs) { const ga = fa.figs.get(name); if (!ga) continue; const ratio = gb.H / ga.H, dx = Math.abs(gb.pic.skull[0] - ga.pic.skull[0]) / 1080, turn = angleBetween(A.cam[A.cam.length - 1], B.cam[0]);
      // (or the lens turned further but the figure drawn the same: a card figure turns to the lens, so a new angle alone can leave him the same
      //  picture, his face turned the same way within 12 degrees and not mirrored; the eye patch Short v1f, 'real' to 'nobody', the
      //  independent review)
      const fA = (ga as any).face as number | undefined, fB = (gb as any).face as number | undefined, same = fA !== undefined && fB !== undefined && Math.abs(fA - fB) < 12 && (ga as any).mirror === (gb as any).mirror;
      if (!B.s.matchCut && ratio > 0.8 && ratio < 1.25 && dx < 0.15 && (turn < 15 || same)) note(`${B.s.id}|${name}|jumpcut`, { shot: B.s.id, who: name, what: `a jump cut into ${B.s.id}: ${name} stays about as big (${Math.round(ratio * 100)} %) and in the same place, the lens turned ${turn.toFixed(0)} degrees: change the size or the angle clearly, or leave the cut out` }, fb.F); } }
  // still: a stretch of 2.5 s in which no figure's joint moves more than 2 % of its height in the picture and the lens hardly moves
  // (two windows: 2.5 s under 2 % of his height, and 1 s under 0.6 %: the eye patch Short v1d stood dead still for 0.7-0.8 s at a time,
  //  which the 2.5 s window let through)
  for (const [N, LIM] of [[75, 0.02], [30, 0.006]] as [number, number][]) for (const A of sums) { if (A.frames.length < N) continue;
    for (let i0 = 0; i0 + N <= A.frames.length; i0 += 15) { let most = 0, any = false;
      for (const name of A.frames[i0].figs.keys()) { let H = 0; const lo: Record<string, number[]> = {}, hi: Record<string, number[]> = {};
        // (the joints and the eyes: a head that turns moves its eyes across the face, not its joints)
        for (let i = i0; i < i0 + N; i++) { const g2 = A.frames[i].figs.get(name); if (!g2) continue; any = true; H = Math.max(H, g2.H); const eyes = ((g2 as unknown as { eyes?: { e: [number, number]; p: [number, number] }[] }).eyes ?? []).flatMap((q, n) => [[`e${n}`, q.e], [`p${n}`, q.p]] as [string, [number, number]][]);
          for (const [j, q] of [...Object.entries(g2.pic), ...eyes]) { lo[j] = lo[j] ? [Math.min(lo[j][0], q[0]), Math.min(lo[j][1], q[1])] : [q[0], q[1]]; hi[j] = hi[j] ? [Math.max(hi[j][0], q[0]), Math.max(hi[j][1], q[1])] : [q[0], q[1]]; } }
        for (const j of Object.keys(lo)) most = Math.max(most, Math.hypot(hi[j][0] - lo[j][0], hi[j][1] - lo[j][1]) / (H || 1)); }
      const c0 = A.cam[i0], c1 = A.cam[i0 + N - 1], camMove = Math.hypot(c1.pos[0] - c0.pos[0], c1.pos[1] - c0.pos[1], c1.pos[2] - c0.pos[2]);
      if (any && most < LIM && camMove < (N === 75 ? 0.15 : 0.04)) { note(`${A.s.id}|still${N}`, { shot: A.s.id, who: "", what: `${A.s.id} stands still for ${(N / 30).toFixed(1)} s: no figure moves more than ${(most * 100).toFixed(1)} % of its height and the lens hardly moves` }, A.frames[i0 + N - 1].F); break; } } }
  // twice: two shots that are not side by side, with the same figures, the lens within 35 cm and 12 degrees of the other's and every figure
  //  within 30 cm of where it stood: the same picture twice. The last shot may be the first again (a film that loops)
  for (let i = 0; i < sums.length; i++) for (let k = i + 2; k < sums.length; k++) { const A = sums[i], B = sums[k]; if (i === 0 && k === sums.length - 1) continue;
    const fa = A.frames[Math.floor(A.frames.length / 2)], fb = B.frames[Math.floor(B.frames.length / 2)]; if (!fa || !fb || fa.figs.size === 0 || fa.figs.size !== fb.figs.size) continue;
    const ca = A.cam[Math.floor(A.cam.length / 2)], cb = B.cam[Math.floor(B.cam.length / 2)], dp = Math.hypot(ca.pos[0] - cb.pos[0], ca.pos[1] - cb.pos[1], ca.pos[2] - cb.pos[2]);
    let same = dp < 0.35 && angleBetween(ca, cb) < 12; for (const [name, ga] of fa.figs) { const gb = fb.figs.get(name); if (!gb || Math.hypot(ga.at[0] - gb.at[0], ga.at[2] - gb.at[2]) > 0.3) same = false; }
    // (or the same composition: the same figures, each as big (within 15 %) and in the same place in the picture (within a tenth of it),
    //  the lens turned less than 30 degrees: two close-ups alike in all but the eyes, the eye patch Short v1d)
    if (!same && dp < 4 && angleBetween(ca, cb) < 30) { let comp = true;      // (in the same place: on deck and below deck are not the same picture)
      for (const [name, ga] of fa.figs) { const gb = fb.figs.get(name); if (!gb) { comp = false; break; } const r2 = gb.H / ga.H;
      if (r2 < 0.85 || r2 > 1.18 || Math.hypot(gb.pic.skull[0] - ga.pic.skull[0], gb.pic.skull[1] - ga.pic.skull[1]) > 0.1 * 1080) comp = false; } same = comp; }
    if (same) note(`${B.s.id}|twice|${A.s.id}`, { shot: B.s.id, who: "", what: `${B.s.id} is the same picture as ${A.s.id} again: the same figures in the same places, the lens ${dp.toFixed(2)} m and ${angleBetween(ca, cb).toFixed(0)} degrees from where it was` }, fb.F); }
  return [...faults.values()];
};
export const motionLines = (film: Film, r: MotionFault[]) => r.map((f) => `${f.shot} frames ${f.f0}-${f.f1} (film ${(f.f0 / film.fps).toFixed(2)}-${((f.f1 + 1) / film.fps).toFixed(2)} s): ${f.what}`);
/** where each figure's joints and marks are in the picture on frame F (film_info <film> pics <frames>: for measuring colours in a frame) */
export const picsAt = (film: Film, F: number) => {
  const T = F / film.fps, s = film.shots.find((q) => T >= q.a - 1e-6 && T < q.b) ?? film.shots[film.shots.length - 1], t = Math.max(0, T - s.a), cam = s.cam(t, t / (s.b - s.a));
  const l = new THREE.PerspectiveCamera(cam.fov, 1080 / 1920, 0.05, 3000); l.position.set(...cam.pos); l.lookAt(...cam.look); l.updateProjectionMatrix(); l.updateMatrixWorld(true);
  const P = (p: V3) => { const q = new THREE.Vector3(...p).project(l); return [Math.round((q.x + 1) * 540), Math.round((1 - q.y) * 960)]; };
  const out: Record<string, Record<string, number[]>> = {};
  for (const a of castOf(s)(t, s.a + t)) { const st = stageAt(a, cam), r: Record<string, number[]> = {};
    for (const j of JOINTS) r[j] = P(st.joint(j)); for (const m of ["headMin", "headMax", "eyeA", "eyeB", "pipeTip", "pipeRoot", "patchA", "patchB"]) { const v = st.mark?.(m); if (v) r[m] = P(v); }
    for (const v of ["earA", "earB"]) { const q = st.val?.(v); if (q !== null && q !== undefined) r[v] = [q]; } out[a.name] = r; }
  return out;
};
