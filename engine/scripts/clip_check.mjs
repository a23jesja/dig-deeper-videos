// The checks of the flat 2D shot-type clips (src/craft/clips/clips.ts), every frame:
//   feet: the drawn shoe on the ground line's top edge, never through it, never both floating outside a run; a planted foot never slides;
//         a lifted shoe never rests on or sinks into the other shoe (v2)
//   views: every turn through a three-quarter head held 2 frames or more, never straight from side to front; the monocle never vanishes
//         from one frame to the next (v2)
//   pupils: never under 30 % without fright, never more than a third's change in a frame
//   blinks (v2): open, half, shut, half, open: a shut eye has a half lid the frame before and after; a half lid leaves the pupil showing
//   hands (v2): a hand's drawing never changes from one frame to the next while the hand hardly moves; the pointing hand out 1 s at most
//   jumps (v2): no joint moves more than 45 px in a frame (a pose or a view swapped in one frame)
//   framing (v2): a medium shot has the figure filling 70 % of the picture's height, a full shot at least half, its feet in the picture;
//         the head inside the picture (except a figure walking in or out, clip.offFrameOK)
//   rest (Jesper's library rule 3): a figure is never dead still for a second
//   points (rule 1): held at most 1 s, the target 350 px or more from the pointer and far from every other figure, the finger aimed at
//         it, the face toward it
//   appear (rule 2): a thing that turns up enters from outside the picture or out of a hole drawn from the first frame; no hand within
//         40 px of it; it never passes through a solid thing (v2)
//   seats: a seated figure's thighs rest on the seat's top, neither floating nor sunk
//   contacts: a hand that must hold something is within its tolerance of it
//   doors (v2): a door at least one and a half times the figure's height
//   v3: the whole figure (cap, ears, hands, elbows, feet) inside the picture with 3 % to spare; no shoe over a thing on the same ground line;
//       no foot hanging off the ground while still; no heel dropping more than 10 px in a frame; the body never rising or sinking more than
//       8 px in a frame; no view that turns back to the one it left within a second; the pipe never changing side from one frame to the next;
//       a thing that turns up comes to rest wholly inside the picture
//     node scripts/clip_check.mjs <clip id | all>     (from engine/)   CLIP_PLANT=<fault> plants one fault (see below)
import * as esbuild from "esbuild"; import fs from "node:fs"; import path from "node:path"; import { pathToFileURL } from "node:url";
const out = path.resolve("out/clip_model.mjs");
fs.writeFileSync("out/_clip_entry.ts", 'export * from "../src/craft/clips/clipKit"; export { CLIPS } from "../src/craft/clips/clips"; export { ease } from "../src/craft/stage/acting";\n');
await esbuild.build({ entryPoints: ["out/_clip_entry.ts"], bundle: true, format: "esm", platform: "node", outfile: out, logLevel: "error", loader: { ".json": "json" } });
const M = await import(pathToFileURL(out).href); fs.rmSync(out); fs.rmSync("out/_clip_entry.ts");
const { CLIPS, castAt, FM, scaleOf, footY, D, shoeDrawn, FLAT_SPECS, viewOf, heightOf, drawnHandKind, figBox } = M;
const LINE_TOP = FM.GY - FM.LINE / 2, ids = process.argv[2] && process.argv[2] !== "all" ? [process.argv[2]] : Object.keys(CLIPS);
const PL = process.env.CLIP_PLANT;
let failed = 0;
const viewName = (sk) => { const s = Math.sin((sk.faceYaw * Math.PI) / 180), a = Math.abs(s); return a < 0.45 ? "front" : (a < 0.85 ? "q" : "side") + (s < 0 ? "-left" : "-right"); };
const handDeg = (sk, s) => { const w = sk.j[`wr${s}`], t = sk.j[`tip${s}`], e = sk.j[`el${s}`], [a, b] = Math.hypot(t[0] - w[0], t[1] - w[1]) > 6 ? [w, t] : [e, w]; return (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI; };
for (const id of ids) {
  const c = CLIPS[id]();
  // ---- planted faults ----
  if (PL === "point-long") for (const p of c.points ?? []) p.t1 = p.t0 + 1.5;
  if (PL === "point-near") for (const p of c.points ?? []) { const g = castAt(c.cast, p.t0)[0]; p.target = [g.x + 130, FM.GY - 300]; p.horizon = undefined; }
  if (PL === "enter-inside") for (const a of c.appear ?? []) { const f0 = a.at; a.at = (t) => { const p = f0(t); return p ? [Math.min(p[0], viewOf(c.camera(t)).x1 - 150), p[1]] : p; }; }
  if (PL === "hand-off") for (const ct of c.contacts ?? []) { const f0 = ct.at; ct.at = (t) => { const p = f0(t); return [p[0] + 20, p[1]]; }; }
  if (PL === "hand-snap") for (const cc of c.cast) if (cc.hands) cc.hands.L.push([3.5, "open"]);
  if (PL === "solid") c.solids = [{ name: "spade", x0: 900, x1: 1020, top: 1290 }];
  if (PL === "door-small" && c.door) c.door.h = 430;
  if (PL === "framing") { const cam0 = c.camera; c.camera = (t) => ({ ...cam0(t), z: 1 }); }
  if (PL === "tight") { const cam0 = c.camera; c.camera = (t) => ({ ...cam0(t), z: cam0(t).z * 1.25 }); }
  if (PL === "ground-prop") c.groundProps = [{ name: "bollard", x0: castAt(c.cast, 0)[0].x - 80, x1: castAt(c.cast, 0)[0].x - 10 }];
  if (PL === "crab-edge") for (const a of c.appear ?? []) { const f0 = a.at; a.at = (t) => { const p = f0(t); return p ? [Math.max(p[0], viewOf(c.camera(t)).x1 - 30), p[1]] : p; }; }
  if (PL === "turn-v1" && id === "c03") {      // (the v1 turn: lifted feet, 0.6 s each, ending in profile to the left)
    const sir = M.figure("sir", 0, 90); sir.stand(0.55); sir.turn(-90, 0.6, 0.18); sir.stand(0.9); sir.turn(-90, 0.6, 0.18); sir.stand(3); c.cast[0].m = sir; }
  const lift = (g, names, dy) => { const sc = scaleOf(g.who); for (const n of names) g.sk.j[n] = [g.sk.j[n][0], g.sk.j[n][1] - dy / sc]; };
  const figsAtT = (t, f) => { const figs = castAt(c.cast, t); if (PL === "jump" && f === 60) figs[0].x += 60;
    if (PL === "hover" && f >= 50 && f < 60) lift(figs[0], ["heelL", "toeL", "anL"], 15);
    if (PL === "heel-snap" && f === 70) lift(figs[0], ["heelL"], 22);
    if (PL === "rise" && f >= 40 && f < 44) for (const n of Object.keys(figs[0].sk.j)) if (!/heel|toe|an/.test(n)) lift(figs[0], [n], 12 * (f - 39));
    if (PL === "flip-flop" && f >= 40 && f < 46) figs[0].sk.faceYaw += 45;
    if (PL === "shoe-on-shoe" && f >= 130 && f < 134) { const g = figs[0], sc = scaleOf(g.who), up = 34 / sc; for (const [a2, b2] of [["heelL", "heelR"], ["toeL", "toeR"], ["anL", "anR"]]) g.sk.j[a2] = [g.sk.j[b2][0], g.sk.j[b2][1] - up]; } if (PL === "blink-snap") for (const g of figs) { const l = g.o.face?.lid ?? 0; if (l > 0.3 && l < 0.93) g.o.face = { ...g.o.face, lid: 0.16 }; } return figs; };
  const F = Math.round(FM.FPS * c.seconds), faults = [], stat = { shoe: -1e9, slide: 0, pupilMin: 9, pupilStep: 0, edge: 0, creature: 1e9, contact: 0, seat: 0, jump: 0, fill: 1e9, pointRun: 0 };
  const prev = {}, prevPupil = {}, runs = {}, track = {}, standY = {}, lids = {}, hands = {}, joints = {}, mono = {}, pointRun = {}, hover = {}, pipe = {}, viewLog = {};
  const J = (g, j) => { const q = g.sk.j[j], s = scaleOf(g.who); return [g.x + q[0] * s, footY(g.who) + q[1] * s]; };
  for (let f = 0; f < F; f++) { const t = f / FM.FPS, figs = figsAtT(t, f), cam = c.camera(t), V = viewOf(cam);
    for (const g of figs) { const sc = scaleOf(g.who), feet = {}, gap = {}, shoes = {}, running = c.running?.(g.name, t) ?? false;
      for (const s of ["L", "R"]) { const W = g.who === "sir" ? FLAT_SPECS[0].sir.B.shoeW : FLAT_SPECS[0].other.B.shoeW, sh = shoeDrawn(g.sk, s, W, true), ink = 0.85 * D.ol * sc;
        const P = sh.pts.map((q) => [g.x + q[0] * sc, footY(g.who) + q[1] * sc]); shoes[s] = { x0: Math.min(...P.map((q) => q[0])), x1: Math.max(...P.map((q) => q[0])), y0: Math.min(...P.map((q) => q[1])), y1: Math.max(...P.map((q) => q[1])) + ink };
        const past = shoes[s].y1 - LINE_TOP; gap[s] = -past; stat.shoe = Math.max(stat.shoe, past);
        if (past > 0.75) faults.push(`${f} ${g.name}: the ${s} shoe ${past.toFixed(1)} px into the ground line`);
        const H = J(g, `heel${s}`), T = J(g, `toe${s}`), hd = Math.abs(g.sk.j[`heel${s}`][1]) * sc < 0.5, td = Math.abs(g.sk.j[`toe${s}`][1]) * sc < 0.5;
        feet[s] = { down: hd || td, kind: hd && td ? "ball" : td ? "toe" : "heel", B: hd && td ? H[0] + (T[0] - H[0]) * 0.73 : td ? T[0] : H[0] };
        const k = g.name + s, p = prev[k]; if (p && p.down && feet[s].down && p.kind === feet[s].kind) { const d = Math.abs(feet[s].B - p.B); stat.slide = Math.max(stat.slide, d); if (d > 2) faults.push(`${f} ${g.name}: the ${s} foot slides ${d.toFixed(1)} px`); }
        prev[k] = feet[s]; }
      if (!running && Math.min(gap.L, gap.R) > 2) faults.push(`${f} ${g.name}: both drawn shoes ${Math.min(gap.L, gap.R).toFixed(1)} px above the ground line`);
      // shoes over things on the same ground line
      for (const gp of c.groundProps ?? []) for (const s of ["L", "R"]) if (shoes[s].x1 > gp.x0 && shoes[s].x0 < gp.x1) faults.push(`${f} ${g.name}: the ${s} shoe overlaps the ${gp.name} on the same ground line`);
      // a foot hanging off the ground while it hardly moves (4 frames or more), and a heel that drops in one frame
      for (const s of ["L", "R"]) { const k = g.name + s, cx = (shoes[s].x0 + shoes[s].x1) / 2, h = hover[k] ?? { n: 0, x: cx, hy: null };
        const still = Math.abs(cx - h.x) < 1.5, off = gap[s] > 3; h.n = off && still && !running ? h.n + 1 : 0; if (h.n === 4) faults.push(`${f} ${g.name}: the ${s} foot hangs ${gap[s].toFixed(0)} px off the ground, still, for 4 frames`);
        // (only with the toe on the ground both frames: from tiptoe to flat in one frame; a stepping foot's heel comes down fast as it should)
        const hy = J(g, `heel${s}`)[1], toeDown = Math.abs(g.sk.j[`toe${s}`][1]) * sc < 0.5; if (h.hy !== null && h.toe && toeDown && !running && hy - h.hy > 10) faults.push(`${f} ${g.name}: the ${s} heel drops ${(hy - h.hy).toFixed(0)} px in one frame with the toe down`); h.x = cx; h.hy = hy; h.toe = toeDown; hover[k] = h; }
      // a shoe on the other shoe: a lifted shoe whose sole is between the other's top and its sole, over it
      for (const [a, b] of [["L", "R"], ["R", "L"]]) { if (feet[a].down || !feet[b].down || c.offFrameOK?.(g.name, t)) continue; const A = shoes[a], B = shoes[b], ov = Math.min(A.x1, B.x1) - Math.max(A.x0, B.x0);
        // (resting: the lifted shoe nearly still over the other, 4 px a frame or less; a swinging foot passing the other in a step is not resting)
        const pa = prev[`${g.name}${a}x`], vx = pa === undefined ? 99 : Math.abs((A.x0 + A.x1) / 2 - pa);
        // (two frames running or more: resting takes time; one frame of overlap as a short step passes is not resting)
        const k2 = `${g.name}${a}rest`, on = ov > 0.3 * (A.x1 - A.x0) && A.y1 > B.y0 - 3 && A.y1 < B.y1 - 2 && vx <= 4; prev[k2] = on ? (prev[k2] ?? 0) + 1 : 0;
        if (prev[k2] === 2) faults.push(`${f} ${g.name}: the lifted ${a} shoe rests on the ${b} shoe (two frames)`); else if (prev[k2] > 2) faults.push(`${f} ${g.name}: the lifted ${a} shoe still on the ${b} shoe`); }
      for (const s of ["L", "R"]) prev[`${g.name}${s}x`] = (shoes[s].x0 + shoes[s].x1) / 2;
      // views and the monocle
      const v = viewName(g.sk), r = (runs[g.name] ??= []); if (r.length && r[r.length - 1].v === v) r[r.length - 1].n++; else r.push({ v, f, n: 1 });
      if (g.who === "sir") { const shows = v !== "side-left"; if (mono[g.name] === true && !shows) faults.push(`${f} ${g.name}: the monocle vanishes from one frame to the next (${r.length > 1 ? r[r.length - 2].v : ""} to ${v})`); mono[g.name] = shows;
        // the pipe in his left mouth corner: on the picture's right in every view but his left profile (flat.ts sirQ, v3)
        const ps = v === "side-left" ? -1 : 1; if (pipe[g.name] !== undefined && pipe[g.name] !== ps) faults.push(`${f} ${g.name}: the pipe changes side from one frame to the next (${r.length > 1 ? r[r.length - 2].v : ""} to ${v})`); pipe[g.name] = ps; }
      (viewLog[g.name] ??= []).push(v);
      // pupils and blinks
      const fc = g.o.face ?? {}, pu = fc.pupil ?? 1, wide = (fc.wide ?? 0) > 0.5, lid = fc.lid ?? 0; (lids[g.name] ??= []).push(lid);
      if (lid > 0.45 && lid < 0.93) faults.push(`${f} ${g.name}: a half lid at ${lid.toFixed(2)} covers the pupil`);
      if (lid < 0.9) { stat.pupilMin = Math.min(stat.pupilMin, pu);
        if (pu < 0.3 && !wide) faults.push(`${f} ${g.name}: the pupil at ${(pu * 100).toFixed(0)} % without fright`);
        if (prevPupil[g.name] !== undefined) { const d = Math.abs(pu - prevPupil[g.name]); stat.pupilStep = Math.max(stat.pupilStep, d); if (d > 1 / 3) faults.push(`${f} ${g.name}: the pupil changes ${(d * 100).toFixed(0)} % in a frame`); } prevPupil[g.name] = pu; }
      // hands: the drawing that shows, and how far the wrist moved
      for (const s of ["L", "R"]) { const kind = drawnHandKind(g.o[`hand${s}`] ?? "relaxed", handDeg(g.sk, s)), w = J(g, `wr${s}`), h = (hands[g.name + s] ??= []); h.push({ kind, w });
        if (h.length >= 3) { const [a, b, cc] = h.slice(-3), mv = Math.hypot(cc.w[0] - b.w[0], cc.w[1] - b.w[1]), mv0 = Math.hypot(b.w[0] - a.w[0], b.w[1] - a.w[1]);
          if (cc.kind !== b.kind && Math.max(mv, mv0) < 6) faults.push(`${f} ${g.name}: the ${s} hand changes from ${b.kind} to ${cc.kind} in one frame while it hardly moves (${Math.max(mv, mv0).toFixed(1)} px)`); }
        const pk = g.name + s; if ((g.o[`hand${s}`] ?? "") === "point") { pointRun[pk] = (pointRun[pk] ?? 0) + 1; stat.pointRun = Math.max(stat.pointRun, pointRun[pk]); if (pointRun[pk] === 31) faults.push(`${f} ${g.name}: the ${s} finger has been out over 1.0 s`); } else pointRun[pk] = 0; }
      // the body rising or sinking more than 8 px in a frame
      { const py = J(g, "pelvis")[1], q = joints[g.name + "pelvisY"]; if (q !== undefined && !running && Math.abs(py - q) > 8) faults.push(`${f} ${g.name}: the body ${py < q ? "rises" : "sinks"} ${Math.abs(py - q).toFixed(0)} px in one frame`); joints[g.name + "pelvisY"] = py; }
      // jumps
      for (const j of ["skull", "pelvis", "wrL", "wrR", "heelL", "heelR"]) { const p = J(g, j), q = joints[g.name + j]; if (q && !running) { const d = Math.hypot(p[0] - q[0], p[1] - q[1]); stat.jump = Math.max(stat.jump, d); if (d > 45) faults.push(`${f} ${g.name}: the ${j} jumps ${d.toFixed(0)} px in one frame`); } joints[g.name + j] = p; }
      // framing: the whole figure (cap, ears, hands, elbows, feet) inside the picture with 3 % of its width and height to spare
      { const away = c.offFrameOK?.(g.name, t), mx = 0.03 * (V.x1 - V.x0), my = 0.03 * (V.y1 - V.y0), B = figBox(g);
        const o = Math.max(0, ...B.map(([x, y]) => Math.max(V.x0 + mx - x, x - (V.x1 - mx), V.y0 + my - y, y - (V.y1 - my))));
        if (!away) { stat.edge = Math.max(stat.edge, o); if (o > 0) faults.push(`${f} ${g.name}: the figure ${o.toFixed(0)} px past the picture's margin`); }
        const tall = FM.PPM * heightOf(g.who) * cam.z, need = c.shot === "medium" ? 0.7 : 0.5; stat.fill = Math.min(stat.fill, tall / FM.H);
        if (!away && tall < need * FM.H) faults.push(`${f} ${g.name}: a ${c.shot} shot with the figure ${((tall / FM.H) * 100).toFixed(0)} % of the picture's height (needs ${need * 100} %)`);
        if (!away && c.shot === "full" && Math.max(J(g, "heelL")[1], J(g, "heelR")[1]) > V.y1) faults.push(`${f} ${g.name}: a full shot with the feet out of the picture`); }
      (track[g.name] ??= []).push([...J(g, "skull"), ...J(g, "pelvis")]);
      // seats: the thighs' underside (half a leg's width under the hip) on the seat's top
      for (const st of c.seats ?? []) { const pv = J(g, "pelvis"); standY[g.name] ??= pv[1]; if (pv[0] < st.x0 || pv[0] > st.x1 || pv[1] - standY[g.name] < 30) continue;
        const seatY = pv[1] + (27 / 2) * sc + 4, d = seatY - st.top; if (t > (c.events.T_SIT ?? 0) + 1.0) { stat.seat = Math.max(stat.seat, Math.abs(d)); if (Math.abs(d) > 2) faults.push(`${f} ${g.name}: seated ${d > 0 ? "into" : "above"} the seat by ${Math.abs(d).toFixed(1)} px`); } }
      for (const ct of c.contacts ?? []) { if (ct.who !== g.name || t < ct.t0 || t > ct.t1) continue; const w = J(g, `wr${ct.side}`), at = ct.at(t), d = Math.hypot(w[0] - at[0], w[1] - at[1]); stat.contact = Math.max(stat.contact, d);
        if (d > ct.tol) faults.push(`${f} ${g.name}: ${ct.what}: the wrist ${d.toFixed(1)} px off`); }
      for (const a of c.appear ?? []) { const p = a.at(t); if (!p) continue; for (const s of ["L", "R"]) { const d = Math.hypot(...J(g, `wr${s}`).map((v, i) => v - p[i])) - 100; stat.creature = Math.min(stat.creature, d); if (d < 40) faults.push(`${f} ${g.name}: the ${s} hand ${d.toFixed(0)} px from the ${a.name}`); } }
      if (c.door) { const need = 1.5 * FM.PPM * heightOf(g.who); if (c.door.h < need && f === 0) faults.push(`the door ${c.door.h} px high for a figure of ${(need / 1.5).toFixed(0)} px: under one and a half times his height`); } }
    // things that turn up never pass through solid things (a creature about 100 px round its place)
    for (const a of c.appear ?? []) { const p = a.at(t); if (!p) continue; for (const so of c.solids ?? []) if (p[0] + 100 > so.x0 && p[0] - 100 < so.x1) faults.push(`${f} ${a.name}: passes through the ${so.name}`); }
    for (const pt of c.points ?? []) { if (t < pt.t0 || t > pt.t1) continue; const g = figs.find((q) => q.name === pt.who), sh = J(g, `sh${pt.side}`), tip = J(g, `tip${pt.side}`), sk = J(g, "skull");
      const a1 = Math.atan2(tip[1] - sh[1], tip[0] - sh[0]), a2 = Math.atan2(pt.target[1] - sh[1], pt.target[0] - sh[0]), da = Math.abs(((a1 - a2 + 3 * Math.PI) % (2 * Math.PI)) - Math.PI) * 180 / Math.PI;
      if (da > 20) faults.push(`${f} ${pt.who}: the finger aims ${da.toFixed(0)} degrees off the target`);
      const dist = Math.hypot(pt.target[0] - sk[0], pt.target[1] - sk[1]), onHorizon = pt.horizon !== undefined && Math.abs(pt.target[1] - pt.horizon) <= 40;
      if (dist < 350 && !onHorizon) faults.push(`${f} ${pt.who}: the target only ${dist.toFixed(0)} px away and not on the horizon, not far`);
      const toward = Math.sign(pt.target[0] - sk[0]), facing = Math.sign(Math.sin((g.sk.faceYaw * Math.PI) / 180)) || Math.sign(g.o.face?.gaze?.[0] ?? 0); if (facing !== toward) faults.push(`${f} ${pt.who}: not facing the target`);
      for (const o of figs) if (o !== g) { const xs = ["skull", "pelvis", "heelL", "heelR", "wrL", "wrR"].map((j) => J(o, j)), x0 = Math.min(...xs.map((q) => q[0])) - 150, x1 = Math.max(...xs.map((q) => q[0])) + 150; if (pt.target[0] > x0 && pt.target[0] < x1) faults.push(`${f} ${pt.who}: the target is within 150 px of ${o.name}`); } } }
  for (const pt of c.points ?? []) if (pt.t1 - pt.t0 > 1.0 + 1e-6) faults.push(`point by ${pt.who}: held ${(pt.t1 - pt.t0).toFixed(2)} s, over one second`);
  // a view that turns back to the one it left within a second (A, B, A)
  for (const [name, L] of Object.entries(viewLog)) { const ch = []; L.forEach((v, i) => { if (i && v !== L[i - 1]) ch.push([i, L[i - 1], v]); });
    for (let i = 1; i < ch.length; i++) if (ch[i][2] === ch[i - 1][1] && ch[i][0] - ch[i - 1][0] < 30) faults.push(`${ch[i][0]} ${name}: the view turns back from ${ch[i][1]} to ${ch[i][2]} ${ch[i][0] - ch[i - 1][0]} frames after leaving it`); }
  // a thing that turns up comes to rest wholly inside the picture (its body about 150 px wide, 2 frames from the end)
  for (const a of c.appear ?? []) { const tE = c.seconds - 2 / FM.FPS, p = a.at(tE), V = viewOf(c.camera(tE)), m = 0.03 * (V.x1 - V.x0); if (p && (p[0] + 150 > V.x1 - m || p[0] - 150 < V.x0 + m)) faults.push(`${a.name}: comes to rest at the picture's edge (${p[0].toFixed(0)}, picture ${V.x0.toFixed(0)}-${V.x1.toFixed(0)})`); }
  for (const a of c.appear ?? []) { if (a.from === "hole") { if (!a.hole || a.hole.drawnFrom > 0) faults.push(`${a.name}: comes out of a hole that is not drawn from the first frame`); }
    else { const p = a.at(a.t0), V = viewOf(c.camera(a.t0)); if (!p || (p[0] > V.x0 - 40 && p[0] < V.x1 + 40)) faults.push(`${a.name}: enters from the ${a.from} but starts inside the picture (${p?.[0]?.toFixed(0)})`); } }
  for (const [name, r] of Object.entries(runs)) r.forEach((x, i) => { if (x.v.startsWith("q") && x.n < 2) faults.push(`${name}: three-quarter at ${x.f} only ${x.n} frame`);
    if (i && ((x.v.startsWith("side") && r[i - 1].v === "front") || (x.v === "front" && r[i - 1].v.startsWith("side")))) faults.push(`${name}: ${r[i - 1].v} straight to ${x.v} at ${x.f}`); });
  for (const [name, L] of Object.entries(lids)) L.forEach((l, i) => { if (l < 0.93) return; const before = i > 0 ? L[i - 1] : null, after = i + 1 < L.length ? L[i + 1] : null;
    if (before !== null && before < 0.93 && !(before > 0.3)) faults.push(`${i} ${name}: shut with no half lid before it`); if (after !== null && after < 0.93 && !(after > 0.3)) faults.push(`${i} ${name}: shut with no half lid after it`); });
  for (const [name, tr] of Object.entries(track)) for (let a = 0; a + 30 <= tr.length; a += 5) { const w = tr.slice(a, a + 30), spread = Math.max(...[0, 1, 2, 3].map((k) => Math.max(...w.map((q) => q[k])) - Math.min(...w.map((q) => q[k]))));
    if (spread < 1) { faults.push(`${name}: dead still for a second from frame ${a}`); break; } }
  console.log(`== ${id} ${c.title} (${c.seconds.toFixed(2)} s, ${F} frames, ${c.shot} shot)`);
  console.log("   views: " + Object.entries(runs).map(([n, r]) => n + " " + r.map((x) => `${x.v} ${x.f}-${x.f + x.n - 1}`).join(" | ")).join(" ;; "));
  console.log(`   shoe past the line's top at most ${stat.shoe.toFixed(1)} px, slide at most ${stat.slide.toFixed(1)} px; pupils min ${(stat.pupilMin * 100).toFixed(0)} %, step max ${(stat.pupilStep * 100).toFixed(0)} %; largest joint move in a frame ${stat.jump.toFixed(0)} px; figure ${(stat.fill * 100).toFixed(0)} % of the height; head past the edge ${stat.edge.toFixed(0)} px` +
    (c.contacts ? `; contacts off at most ${stat.contact.toFixed(1)} px` : "") + (c.appear ? `; nearest hand to the ${c.appear[0].name} ${stat.creature.toFixed(0)} px` : "") + (c.seats ? `; seat off at most ${stat.seat.toFixed(1)} px` : "") + (c.points ? `; point held ${c.points.map((p) => (p.t1 - p.t0).toFixed(2)).join(", ")} s, finger out ${stat.pointRun} frames` : "") + (c.door ? `; door ${c.door.h} px` : ""));
  for (const l of faults.slice(0, 25)) console.log("   " + l);
  if (faults.length) { const kinds = {}; for (const l of faults) { const k = l.replace(/^\d+ /, "").replace(/-?\d+(\.\d+)?/g, "#"); kinds[k] = (kinds[k] ?? 0) + 1; }
    console.log("   by kind: " + Object.entries(kinds).map(([k, n]) => `${n} x "${k}"`).join("; ")); }
  console.log(faults.length ? `   CLIP CHECK FAILED: ${faults.length}` : "   CLIP CHECK OK"); if (faults.length) failed++;
}
process.exit(failed ? 1 : 0);
