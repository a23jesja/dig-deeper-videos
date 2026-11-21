// The checks of the flat 2D shot-type clips (src/craft/clips/clips.ts), every frame:
//   feet: the drawn shoe on the ground line's top edge, never through it, never both floating outside a run; a planted foot never slides
//   views: every turn through a three-quarter head held 2 frames or more, never straight from side to front
//   pupils: never under 30 % without fright, never more than a third's change in a frame
//   head: inside the picture (except a figure walking in or out, clip.offFrameOK)
//   rest (Jesper's library rule 3): a figure is never dead still for a second
//   points (rule 1): held at most 1 s, the target far from every other figure, the finger aimed at it, the face toward it
//   appear (rule 2): a thing that turns up enters from outside the picture or out of a hole drawn from the first frame; no hand within
//   40 px of it
//   seats: a seated figure's seat rests on the seat's top, neither floating nor sunk
//   contacts: a hand that must hold something is within its tolerance of it
//     node scripts/clip_check.mjs <clip id | all>     (from engine/)
import * as esbuild from "esbuild"; import fs from "node:fs"; import path from "node:path"; import { pathToFileURL } from "node:url";
const out = path.resolve("out/clip_model.mjs");
fs.writeFileSync("out/_clip_entry.ts", 'export * from "../src/craft/clips/clipKit"; export { CLIPS } from "../src/craft/clips/clips";\n');
await esbuild.build({ entryPoints: ["out/_clip_entry.ts"], bundle: true, format: "esm", platform: "node", outfile: out, logLevel: "error", loader: { ".json": "json" } });
const M = await import(pathToFileURL(out).href); fs.rmSync(out); fs.rmSync("out/_clip_entry.ts");
const { CLIPS, castAt, FM, scaleOf, footY, D, shoeDrawn, FLAT_SPECS } = M;
const LINE_TOP = FM.GY - FM.LINE / 2, ids = process.argv[2] && process.argv[2] !== "all" ? [process.argv[2]] : Object.keys(CLIPS);
let failed = 0;
const viewOf = (sk) => { const s = Math.sin((sk.faceYaw * Math.PI) / 180), a = Math.abs(s); return a < 0.45 ? "front" : (a < 0.85 ? "q" : "side") + (s < 0 ? "-left" : "-right"); };
for (const id of ids) {
  const c = CLIPS[id]();
  // planted faults (CLIP_PLANT): point-long = the point held 1.5 s; point-near = its target on Sir himself; enter-inside = the crab starts in
  // the picture; still = every figure frozen (no idle); hand-off = a held thing's place moved 20 px from the hand
  const PL = process.env.CLIP_PLANT;
  if (PL === "point-long") for (const p of c.points ?? []) p.t1 = p.t0 + 1.5;
  if (PL === "point-near") for (const p of c.points ?? []) { const g = castAt(c.cast, p.t0)[0]; p.target = [g.x - 300, FM.GY - 300]; c.cast.push({ ...c.cast[0], name: "ada", who: "baker", pose: undefined, m: M.figure("baker", (g.x - 300 - FM.W / 2) / FM.PPM, 0) }); c.cast[c.cast.length - 1].m.stand(9); }
  if (PL === "enter-inside") for (const a of c.appear ?? []) { const f0 = a.at; a.at = (t) => { const p = f0(t); return p ? [Math.min(p[0], FM.W - 200), p[1]] : p; }; }
  if (PL === "hand-off") for (const ct of c.contacts ?? []) { const f0 = ct.at; ct.at = (t) => { const p = f0(t); return [p[0] + 20, p[1]]; }; }
  const F = Math.round(FM.FPS * c.seconds), faults = [], stat = { shoe: -1e9, slide: 0, pupilMin: 9, pupilStep: 0, edge: 0, creature: 1e9, contact: 0, seat: 0 };
  const prev = {}, prevPupil = {}, runs = {}, track = {}, standY = {};
  const J = (g, j) => { const q = g.sk.j[j], s = scaleOf(g.who); return [g.x + q[0] * s, footY(g.who) + q[1] * s]; };
  for (let f = 0; f < F; f++) { const t = f / FM.FPS, figs = castAt(c.cast, t);
    for (const g of figs) { const sc = scaleOf(g.who), feet = {}, gap = {}, running = c.running?.(g.name, t) ?? false;
      for (const s of ["L", "R"]) { const W = g.who === "sir" ? FLAT_SPECS[0].sir.B.shoeW : FLAT_SPECS[0].other.B.shoeW, sh = shoeDrawn(g.sk, s, W, true), ink = 0.85 * D.ol * sc;
        const low = Math.max(...sh.pts.map((q) => footY(g.who) + q[1] * sc)) + ink, past = low - LINE_TOP; gap[s] = -past; stat.shoe = Math.max(stat.shoe, past);
        if (past > 0.75) faults.push(`${f} ${g.name}: the ${s} shoe ${past.toFixed(1)} px into the ground line`);
        const H = J(g, `heel${s}`), T = J(g, `toe${s}`), hd = Math.abs(g.sk.j[`heel${s}`][1]) * sc < 0.5, td = Math.abs(g.sk.j[`toe${s}`][1]) * sc < 0.5;
        feet[s] = { down: hd || td, kind: hd && td ? "ball" : td ? "toe" : "heel", B: hd && td ? H[0] + (T[0] - H[0]) * 0.73 : td ? T[0] : H[0] };
        const k = g.name + s, p = prev[k]; if (p && p.down && feet[s].down && p.kind === feet[s].kind) { const d = Math.abs(feet[s].B - p.B); stat.slide = Math.max(stat.slide, d); if (d > 2) faults.push(`${f} ${g.name}: the ${s} foot slides ${d.toFixed(1)} px`); }
        prev[k] = feet[s]; }
      if (!running && Math.min(gap.L, gap.R) > 2) faults.push(`${f} ${g.name}: both drawn shoes ${Math.min(gap.L, gap.R).toFixed(1)} px above the ground line`);
      // views
      const v = viewOf(g.sk), r = (runs[g.name] ??= []); if (r.length && r[r.length - 1].v === v) r[r.length - 1].n++; else r.push({ v, f, n: 1 });
      // pupils
      const fc = g.o.face ?? {}, pu = fc.pupil ?? 1, wide = (fc.wide ?? 0) > 0.5; if ((fc.lid ?? 0) < 0.9) { stat.pupilMin = Math.min(stat.pupilMin, pu);
        if (pu < 0.3 && !wide) faults.push(`${f} ${g.name}: the pupil at ${(pu * 100).toFixed(0)} % without fright`);
        if (prevPupil[g.name] !== undefined) { const d = Math.abs(pu - prevPupil[g.name]); stat.pupilStep = Math.max(stat.pupilStep, d); if (d > 1 / 3) faults.push(`${f} ${g.name}: the pupil changes ${(d * 100).toFixed(0)} % in a frame`); } prevPupil[g.name] = pu; }
      // head in the picture
      { const hx = J(g, "skull")[0], rr = 140 * sc, o = Math.max(0, rr - hx, hx + rr - FM.W); if (!(c.offFrameOK?.(g.name, t))) { stat.edge = Math.max(stat.edge, o); if (o > 0) faults.push(`${f} ${g.name}: the head ${o.toFixed(0)} px past the picture's edge`); } }
      // rest: the skull and the pelvis tracked
      (track[g.name] ??= []).push([...J(g, "skull"), ...J(g, "pelvis")]);
      // seats
      for (const st of c.seats ?? []) { const pv = J(g, "pelvis"); standY[g.name] ??= pv[1]; if (pv[0] < st.x0 || pv[0] > st.x1 || pv[1] - standY[g.name] < 30) continue;
        // (only while down: the pelvis lowered and still)
        const seatY = pv[1] + (34 + D.ol / 2) * sc + 4, d = seatY - st.top; if (Math.abs(d) > stat.seat && t > (c.events.T_SIT ?? 0) + 0.9) stat.seat = Math.abs(d);
        if (t > (c.events.T_SIT ?? 0) + 0.9 && Math.abs(d) > 2) faults.push(`${f} ${g.name}: seated ${d > 0 ? "into" : "above"} the seat by ${Math.abs(d).toFixed(1)} px`); }
      // contacts
      for (const ct of c.contacts ?? []) { if (ct.who !== g.name || t < ct.t0 || t > ct.t1) continue; const w = J(g, `wr${ct.side}`), at = ct.at(t), d = Math.hypot(w[0] - at[0], w[1] - at[1]); stat.contact = Math.max(stat.contact, d);
        if (d > ct.tol) faults.push(`${f} ${g.name}: ${ct.what}: the wrist ${d.toFixed(1)} px off`); }
      // creatures: no hand within 40 px (a creature's body about 50 px round its place)
      for (const a of c.appear ?? []) { const p = a.at(t); if (!p) continue; for (const s of ["L", "R"]) { const d = Math.hypot(...J(g, `wr${s}`).map((v, i) => v - p[i])) - 50; stat.creature = Math.min(stat.creature, d); if (d < 40) faults.push(`${f} ${g.name}: the ${s} hand ${d.toFixed(0)} px from the ${a.name}`); } } }
    // points
    for (const pt of c.points ?? []) { if (t < pt.t0 || t > pt.t1) continue; const g = figs.find((q) => q.name === pt.who), sh = J(g, `sh${pt.side}`), tip = J(g, `tip${pt.side}`);
      const a1 = Math.atan2(tip[1] - sh[1], tip[0] - sh[0]), a2 = Math.atan2(pt.target[1] - sh[1], pt.target[0] - sh[0]), da = Math.abs(((a1 - a2 + 3 * Math.PI) % (2 * Math.PI)) - Math.PI) * 180 / Math.PI;
      if (da > 20) faults.push(`${f} ${pt.who}: the finger aims ${da.toFixed(0)} degrees off the target`);
      const toward = Math.sign(pt.target[0] - J(g, "skull")[0]), facing = Math.sign(Math.sin((g.sk.faceYaw * Math.PI) / 180)) || Math.sign(g.o.face?.gaze?.[0] ?? 0); if (facing !== toward) faults.push(`${f} ${pt.who}: not facing the target`);
      for (const o of figs) if (o !== g) { const xs = ["skull", "pelvis", "heelL", "heelR", "wrL", "wrR"].map((j) => J(o, j)), x0 = Math.min(...xs.map((q) => q[0])) - 150, x1 = Math.max(...xs.map((q) => q[0])) + 150; if (pt.target[0] > x0 && pt.target[0] < x1) faults.push(`${f} ${pt.who}: the target is within 150 px of ${o.name}`); } } }
  for (const pt of c.points ?? []) if (pt.t1 - pt.t0 > 1.0 + 1e-6) faults.push(`point by ${pt.who}: held ${(pt.t1 - pt.t0).toFixed(2)} s, over one second`);
  for (const a of c.appear ?? []) { if (a.from === "hole") { if (!a.hole || a.hole.drawnFrom > 0) faults.push(`${a.name}: comes out of a hole that is not drawn from the first frame`); }
    else { const p = a.at(a.t0); if (!p || (p[0] > -40 && p[0] < FM.W + 40)) faults.push(`${a.name}: enters from the ${a.from} but starts inside the picture (${p?.[0]?.toFixed(0)})`); } }
  for (const [name, r] of Object.entries(runs)) r.forEach((x, i) => { if (x.v.startsWith("q") && x.n < 2) faults.push(`${name}: three-quarter at ${x.f} only ${x.n} frame`);
    if (i && ((x.v.startsWith("side") && r[i - 1].v === "front") || (x.v === "front" && r[i - 1].v.startsWith("side")))) faults.push(`${name}: ${r[i - 1].v} straight to ${x.v} at ${x.f}`); });
  for (const [name, tr] of Object.entries(track)) for (let a = 0; a + 30 <= tr.length; a += 5) { const w = tr.slice(a, a + 30), spread = Math.max(...[0, 1, 2, 3].map((k) => Math.max(...w.map((q) => q[k])) - Math.min(...w.map((q) => q[k]))));
    if (spread < 1) { faults.push(`${name}: dead still for a second from frame ${a}`); break; } }
  console.log(`== ${id} ${c.title} (${c.seconds.toFixed(2)} s, ${F} frames)`);
  console.log("   views: " + Object.entries(runs).map(([n, r]) => n + " " + r.map((x) => `${x.v} ${x.f}-${x.f + x.n - 1}`).join(" | ")).join(" ;; "));
  console.log(`   shoe past the line's top at most ${stat.shoe.toFixed(1)} px, slide at most ${stat.slide.toFixed(1)} px; pupils min ${(stat.pupilMin * 100).toFixed(0)} %, step max ${(stat.pupilStep * 100).toFixed(0)} %; head past the edge ${stat.edge.toFixed(0)} px` +
    (c.contacts ? `; contacts off at most ${stat.contact.toFixed(1)} px` : "") + (c.appear ? `; nearest hand to the ${c.appear[0].name} ${stat.creature.toFixed(0)} px` : "") + (c.seats ? `; seat off at most ${stat.seat.toFixed(1)} px` : "") + (c.points ? `; point held ${c.points.map((p) => (p.t1 - p.t0).toFixed(2)).join(", ")} s` : ""));
  for (const l of faults.slice(0, 25)) console.log("   " + l);
  if (faults.length) { const kinds = {}; for (const l of faults) { const k = l.replace(/^\d+ /, "").replace(/-?\d+(\.\d+)?/g, "#"); kinds[k] = (kinds[k] ?? 0) + 1; }
    console.log("   by kind: " + Object.entries(kinds).map(([k, n]) => `${n} x "${k}"`).join("; ")); }
  console.log(faults.length ? `   CLIP CHECK FAILED: ${faults.length}` : "   CLIP CHECK OK"); if (faults.length) failed++;
}
process.exit(failed ? 1 : 0);
