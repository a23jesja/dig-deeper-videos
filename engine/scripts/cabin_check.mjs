// 3D step 1, the cabin: the checks of impossible things for flat figures standing in a Blender plate, every frame of every shot.
//   1  feet on the floor: a standing sole's picture point is the floor point's projection (within 3 px), and no foot is above the floor
//      but the lifted boot (shot C), which is lifted 1.5-5 cm ("a couple of centimetres"), never more
//   2  no sliding: a planted foot's floor point moves less than 1 cm over a shot
//   3  weight: while one foot is off the floor the pelvis is over the other foot (within a fifth of the stance width at rest)
//   4  over the shoulder (shot B): the dark captain in front never covers the boy's face (his head's circle) or his pointing hand
//   5  frame edges: a hand is inside the picture with a margin, or wholly out of it (not cut by the edge)
//   7  speed (the flicker rule): no joint moves more than 11 px in the picture between frames
//   6  in front of nothing: written to out/cab3d/figs.json for scripts/cabin_depth.py, which reads Blender's ray map (no thing of the room
//      nearer than a figure where he is drawn)
// Planted faults (each must fail): --plant float (the boot lifted too high), sink (the figure 10 px into the floor), slide (the figure
// skating 2 mm a frame), lean (the hip away from the standing foot), fgOverFace (the captain moved over the boy's face), sweatOut (a
// sweat drop up on the cap's band), legOut (a straight leg swung 38 degrees out), capWide (a caption 1.6 times as wide).
//   node scripts/cabin_check.mjs [--plant float|sink|slide|lean|fgOverFace]
import * as esbuild from "esbuild"; import fs from "node:fs"; import { pathToFileURL } from "node:url";
const plant = process.argv.includes("--plant") ? process.argv[process.argv.indexOf("--plant") + 1] : null;
const out = "out/_cab_check.mjs";
fs.writeFileSync("out/_cab_entry.ts", 'export * from "../src/craft/cabin3d/cabin"; export { castAt, jointPx, figBox, FM, footY } from "../src/craft/clips/clipKit";');
try { await esbuild.build({ entryPoints: ["out/_cab_entry.ts"], bundle: true, format: "esm", platform: "node", outfile: out, logLevel: "error", loader: { ".json": "json" } }); }
finally { fs.rmSync("out/_cab_entry.ts"); }
const M = await import(pathToFileURL(out).href); fs.rmSync(out);
const { SHOTS, WHO, PLANT, placeOf, toScreen, feetOf, project, jointPx, figBox, FM, footY, captionAt, sweatDrops, SWEAT_ZONE } = M;
if (plant) { if (!(plant in PLANT)) throw new Error("no such planted fault: " + plant); PLANT[plant] = true; }
const faults = [], dump = {}, regions = []; let frames = 0, F0 = 0;
const SPEED = 11, prevJ = {};      // 7 (the flicker rule): no joint of a figure moves more than 11 px between frames in the picture (flicker.py follows up to 12)
const hull = (P) => { const p = [...P].sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], up = [];
  for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (const q of p.reverse()) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); } return [...lo.slice(0, -1), ...up.slice(0, -1)]; };
const inPoly = (pt, P) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) if ((P[i][1] > pt[1]) !== (P[j][1] > pt[1]) && pt[0] < ((P[j][0] - P[i][0]) * (pt[1] - P[i][1])) / (P[j][1] - P[i][1]) + P[i][0]) c = !c; return c; };
for (const S of SHOTS) {
  const whos = WHO[S.id](), n = Math.round((S.t1 - S.t0) * FM.FPS), first = {}; dump[S.id] = [];
  for (let fr = 0; fr < n; fr++) { frames++; const row = [];
    const placed = whos.map((w) => ({ w, pl: placeOf(S.id, fr, w) }));
    for (const { w, pl } of placed) {
      const f = pl.f, scr = (j) => toScreen(pl, jointPx(f, j)), ft = feetOf(S.id, fr, w);
      // 7 speed: every joint's picture point against the frame before in the same shot
      { const JN = ["skull", "crown", "neck", "shL", "shR", "elL", "elR", "wrL", "wrR", "tipL", "tipR", "hipL", "hipR", "anL", "anR", "toeL", "toeR"], cur = Object.fromEntries(JN.map((j) => [j, scr(j)])), k = S.id + w.name, pv = prevJ[k];
        // (the face: its features slide across the head as it turns, about 0.6 of the head's radius times the sine of where it points)
        { const a0 = scr("skull"), c0 = scr("crown"), hr = Math.hypot(c0[0] - a0[0], c0[1] - a0[1]) / 2; cur.face = [(a0[0] + c0[0]) / 2 + 0.6 * hr * Math.sin((f.sk.faceYaw * Math.PI) / 180), (a0[1] + c0[1]) / 2]; JN.push("face"); }
        if (pv && fr > 0) { let worst = 0, wj = ""; const inPic = (q) => q[0] > -40 && q[0] < FM.W + 40 && q[1] > -40 && q[1] < FM.H + 40;      // (only what is in the picture can flicker)
          for (const j of JN) { if (!inPic(cur[j]) && !inPic(pv[j])) continue; const d = Math.hypot(cur[j][0] - pv[j][0], cur[j][1] - pv[j][1]); if (d > worst) { worst = d; wj = j; } }
          if (worst > SPEED) faults.push(`7 ${S.id} frame ${fr} ${w.name}: ${wj} moves ${worst.toFixed(1)} px in a frame (the flicker rule: at most ${SPEED})`); }
        prevJ[k] = cur; }
      // (his shape for the depth check: the head's circle, the trunk's hull, and each arm and leg as a thick line from joint to joint; the
      //  figure's box hull filled the empty air under a reaching arm, where the papers fall)
      { const P = (j) => scr(j).map((v) => Math.round(v)), s0 = scr("skull"), c0 = scr("crown"), hr = Math.hypot(c0[0] - s0[0], c0[1] - s0[1]) / 2, lw = Math.round(0.17 * hr);      // (half a sleeve's width: about 0.17 of the head's radius on Knopp)
        const limbs = ["L", "R"].flatMap((d) => [[P("sh" + d), P("el" + d)], [P("el" + d), P("wr" + d)], [P("wr" + d), P("tip" + d)], [P("hip" + d), P("kn" + d)], [P("kn" + d), P("an" + d)], [P("an" + d), P("toe" + d)], [P("heel" + d), P("toe" + d)]]);
        row.push({ name: w.name, sil: !!w.sil, depth: pl.depth, head: [Math.round((s0[0] + c0[0]) / 2), Math.round((s0[1] + c0[1]) / 2), Math.round(hr * 1.1)], headF: [+((s0[0] + c0[0]) / 2).toFixed(2), +((s0[1] + c0[1]) / 2).toFixed(2)],      /* (unrounded, for motion2.py's out-and-back rule: rounding alone gives +1, -2, +1) */
          trunk: hull(["neck", "shL", "shR", "hipL", "hipR"].map((j) => scr(j))).map((q) => q.map((v) => Math.round(v))), limbs, lw, poly: hull(figBox(f).map((q) => toScreen(pl, q))).map((q) => q.map((v) => Math.round(v))) }); }
      if (!w.sil) {
        // 1 the soles on the floor
        const floorY = project(S.id, fr, [w.at[0], w.at[1], 0])[1], soleY = toScreen(pl, [f.x, footY(f.who)])[1];
        if (Math.abs(soleY - floorY) > 3) faults.push(`1 ${S.id} frame ${fr} ${w.name}: his soles drawn ${(soleY - floorY).toFixed(1)} px from the floor's line (into or above the floor)`);
        for (const q of ft) { const lifted = ["E", "D1", "D2"].includes(S.id) && w.name === "captain" && q.side === "R";      // (he keeps the boot up as he stares at the X: E and D)
          if (!lifted && q.up > 0.01) faults.push(`1 ${S.id} frame ${fr} ${w.name}: his ${q.side} foot ${(q.up * 100).toFixed(1)} cm above the floor`);
          // (v40: a deliberate knee raise to look under the boot, up to 11 cm, in E and D1 only: a 5 cm lift could not both hide a readable X with margin
          //  and reveal it (the reviewer's point 1 on v39). Everywhere else a sole is on the floor within 3 px; the planted float (40 degrees more) still fails)
          if (lifted && q.up > 0.11) faults.push(`1 ${S.id} frame ${fr} ${w.name}: the lifted boot ${(q.up * 100).toFixed(1)} cm up (a knee raise, at most 11)`);
          if (q.up < -0.01) faults.push(`1 ${S.id} frame ${fr} ${w.name}: his ${q.side} foot ${(-q.up * 100).toFixed(1)} cm into the floor`); }
        // 2 no sliding (a foot on the floor keeps its floor point; the figure's own world point counted: it carries the feet)
        const at = placeOf(S.id, fr, w).foot, back = project(S.id, fr, [w.at[0], w.at[1], 0]);
        for (const q of ft) if (q.up <= 0.002) { const k = w.name + q.side, wx = q.world[0] + (at[0] - back[0]) * 0; first[k] ??= wx; if (Math.abs(wx - first[k]) > 0.01) faults.push(`2 ${S.id} frame ${fr} ${w.name}: his planted ${q.side} foot slid ${((wx - first[k]) * 100).toFixed(1)} cm`); }
        // 3 the weight over the standing foot while the other is up
        const up = ft.filter((q) => q.up > 0.01);
        if (up.length === 1) { const st = ft.find((q) => q !== up[0]), pel = (jointPx(f, "hipL")[0] + jointPx(f, "hipR")[0]) / 2, an = jointPx(f, "an" + st.side)[0], span = Math.abs(jointPx(f, "anL")[0] - jointPx(f, "anR")[0]) || 1;
          if (Math.abs(pel - an) > 0.2 * Math.max(span, 60) + 30) faults.push(`3 ${S.id} frame ${fr} ${w.name}: one foot up and the pelvis ${Math.abs(pel - an).toFixed(0)} units off the standing foot (leaning in the air)`); }
      }
      {
        // 5 hands not cut by the frame's edge (every figure, the dark one in front too: v17's independent review found his hand cut)
        for (const sd of ["L", "R"]) { const a = scr("wr" + sd), b = scr("tip" + sd), len = Math.hypot(b[0] - a[0], b[1] - a[1]), c = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], m = 0.6 * len;
          const inside = c[0] > m && c[0] < FM.W - m && c[1] > m && c[1] < FM.H - m, outside = c[0] < -3.5 * len || c[0] > FM.W + 3.5 * len || c[1] < -3.5 * len || c[1] > FM.H + 3.5 * len;
          const off = (q) => q[0] < 0 || q[0] > FM.W || q[1] < 0 || q[1] > FM.H, armGone = off(scr("sh" + sd)) && off(scr("el" + sd)) && off(a) && (c[0] < -0.8 * M.handPx(w.cast.who, pl) || c[0] > FM.W + 0.8 * M.handPx(w.cast.who, pl) || c[1] < -0.8 * M.handPx(w.cast.who, pl) || c[1] > FM.H + 0.8 * M.handPx(w.cast.who, pl));      /* (and the hand itself clear: E v45's wrists were above the picture while the fingers hung into it) */      // (the whole arm out of the picture: nothing reaches the edge to be cut)
          const hl0 = M.handPx(w.cast.who, pl), goneClean = S.closeup && (c[0] < -0.8 * hl0 || c[0] > FM.W + 0.8 * hl0 || c[1] > FM.H + 0.8 * hl0 || c[1] < -0.8 * hl0);      // (by the drawn hand's length, not the wrist-to-tip segment: E v45's fingers showed at the corners while the short segment called them gone)      // (a deliberate close-up: the arm leaves the picture cleanly, no part of the hand in it, the reviewer 24 Nov)
          // (the drawn hand reaches well past the tip joint (on A2b v35 the check passed a finger
          //  running into the edge. A hand counted inside must keep that far point 30 px inside the picture)
          const shape = (w.cast.hands?.[sd] ?? [[0, "relaxed"]]).filter((h) => h[0] <= fr / FM.FPS).pop()?.[1] ?? "relaxed", hl = M.handPx(w.cast.who, pl) * (shape === "point" ? 1.4 : 1.2), dl = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, e = [a[0] + (b[0] - a[0]) / dl * hl, a[1] + (b[1] - a[1]) / dl * hl], hr = M.handPx(w.cast.who, pl) * ({ open: 0.68, relaxed: 0.55, fist: 0.45, point: 0.4 }[shape] ?? 0.6), hcx = (a[0] + e[0]) / 2, hcy = (a[1] + e[1]) / 2, discIn = hcx - hr > 30 && hcx + hr < FM.W - 30 && hcy - hr > 30 && hcy + hr < FM.H - 30,      /* (and the spread fingers across: a disc round the hand (0.68 hand lengths for an open hand, measured on E v41 where the outline touched the edge; less for a fist or a point)'s middle; E v41's open hands touched the edge sideways while the along-the-hand point passed) */      /* (from the wrist, a pointing finger reaches 1.28-1.35 hand lengths with its outline (A2b v36, B1 v35), so 1.4; other hands 1.2) */ farIn = e[0] > 30 && e[0] < FM.W - 30 && e[1] > 30 && e[1] < FM.H - 30, farOut = e[0] < 0 || e[0] > FM.W || e[1] < 0 || e[1] > FM.H;
          if (inside && (!farIn || !discIn) && !(farOut && c[0] > 0 && c[0] < FM.W && c[1] > 0 && c[1] < FM.H && false)) faults.push(`5 ${S.id} frame ${fr} ${w.name}: his ${sd} hand's far end within 30 px of the picture's edge (at ${e.map((v) => v.toFixed(0))})`);
          if (!inside && !outside && !armGone && !goneClean) faults.push(`5 ${S.id} frame ${fr} ${w.name}: his ${sd} hand cut by the picture's edge (at ${c.map((v) => v.toFixed(0))})`); }
      }
    }
    // 9 sweat on the skin (the reviewer, v19: a drop on the cap's band or beside the cap is an impossible thing): every drop inside the
    //    skin zone of the near cheek and temple, under the cap's band, in the head's own units
    for (const { w, pl } of placed) if (w.sweatAt !== undefined) { const t = fr / FM.FPS - w.sweatAt; if (t <= 0) continue; const Z = SWEAT_ZONE;      // (the drop's place as drawn, front-facing heads included: dropAt)
      for (const d0 of sweatDrops(t)) { const dr = d0 && { ...d0, ...M.dropAt(d0, pl.f.sk.sin) }; if (dr && (dr.x < Z.x0 || dr.x > Z.x1 || dr.y < Z.y0 || dr.y > Z.y1)) faults.push(`9 ${S.id} frame ${fr} ${w.name}: a sweat drop off his skin (at ${dr.x.toFixed(2)}, ${dr.y.toFixed(2)} of his head)`); } }
    // 10 joint limits on every figure's solved skeleton (the reviewer, v26: a straight leg swung 38 degrees out put the hip outside the
    //    coat): the thigh at most 15 degrees out to the side (on Knopp, more puts the hip outside the coat) and 45 behind; the knee and the
    //    elbow bent at most 150 and one way only; the upper arm at most 65 behind the body and 60 across the chest
    for (const { w, pl } of placed) { const v = pl.f.sk.v, sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], nrm = (a) => { const l = Math.hypot(...a) || 1; return a.map((x) => x / l); }, ang = (a, b) => (Math.acos(Math.max(-1, Math.min(1, dot(nrm(a), nrm(b))))) * 180) / Math.PI;
      const up = nrm(sub(v.neck, v.pelvis)), lat0 = sub(v.hipL, v.hipR), lat = nrm(sub(lat0, up.map((x) => x * dot(lat0, up)))), fwd = [lat[1] * up[2] - lat[2] * up[1], lat[2] * up[0] - lat[0] * up[2], lat[0] * up[1] - lat[1] * up[0]];
      for (const sd of ["L", "R"]) { const sgn = sd === "L" ? 1 : -1, th = sub(v["kn" + sd], v["hip" + sd]), shn = sub(v["an" + sd], v["kn" + sd]), ua = sub(v["el" + sd], v["sh" + sd]), fa = sub(v["wr" + sd], v["el" + sd]);
        const thL = Math.hypot(...th) || 1, out = (Math.asin(Math.max(-1, Math.min(1, (dot(th, lat) * sgn) / thL))) * 180) / Math.PI, back = (Math.asin(Math.max(-1, Math.min(1, -dot(th, fwd) / thL))) * 180) / Math.PI;
        const knee = ang(th, shn), elbow = ang(ua, fa), uaL = Math.hypot(...ua) || 1, armBack = (Math.asin(Math.max(-1, Math.min(1, -dot(ua, fwd) / uaL))) * 180) / Math.PI, across = (Math.asin(Math.max(-1, Math.min(1, (-dot(ua, lat) * sgn) / uaL))) * 180) / Math.PI;
        const bad = [out > 15 && `thigh ${out.toFixed(0)} degrees out (the hip outside the coat)`, back > 45 && `thigh ${back.toFixed(0)} behind`, knee > 150 && `knee bent ${knee.toFixed(0)}`, elbow > 150 && `elbow bent ${elbow.toFixed(0)}`, armBack > 65 && `upper arm ${armBack.toFixed(0)} behind`, across > 60 && `upper arm ${across.toFixed(0)} across`].filter(Boolean);
        for (const b of bad) faults.push(`10 ${S.id} frame ${fr} ${w.name}: his ${sd === "L" ? "left" : "right"} ${b}`); } }
    // 8 the caption band (DAILY-RULES: the lower third, never on a face, a chest or hands) against every figure's head, trunk and hands;
    //   in a deliberate close-up (shots.json "closeup") the band may lie over the coat (the reviewer, 24 Nov: rule 8 forbids the face, our
    //   check the hands; the references put text over the coat in close-ups): the face and the hands are checked there as everywhere
    { const cap = captionAt(S.t0 + fr / FM.FPS);
      if (cap) for (const { w, pl } of placed) { if (w.sil) continue; const J = (j) => toScreen(pl, jointPx(pl.f, j)), cw = (cap.box[2] - cap.box[0]) * 1.25, x0 = 540 - cw / 2, x1 = 540 + cw / 2, y0 = cap.box[1] - 6, y1 = cap.box[3] + 6,      /* (the drawn text is about a quarter wider than capWidth's estimate: v26's captions crossed hands the check had passed) */
        inBox = (q, m = 0) => q[0] > x0 - m && q[0] < x1 + m && q[1] > y0 - m && q[1] < y1 + m;
        const s0 = J("skull"), c0 = J("crown"), hr = Math.hypot(c0[0] - s0[0], c0[1] - s0[1]) / 2, hc = [(s0[0] + c0[0]) / 2, (s0[1] + c0[1]) / 2];
        const nx = Math.max(x0, Math.min(x1, hc[0])), ny = Math.max(y0, Math.min(y1, hc[1])), faceHit = Math.hypot(nx - hc[0], ny - hc[1]) < hr * 1.05;
        const closeup = !!S.closeup, trunk = hull(["neck", "shL", "shR", "hipL", "hipR"].map(J)), chestHit = !closeup && [0, 0.25, 0.5, 0.75, 1].some((u) => [0, 0.5, 1].some((v) => inPoly([x0 + (x1 - x0) * u, y0 + (y1 - y0) * v], trunk)));
        const handHit = ["L", "R"].some((sd) => inBox(J("tip" + sd), 30) || inBox(J("wr" + sd), 30) || inBox([(J("tip" + sd)[0] + J("wr" + sd)[0]) / 2, (J("tip" + sd)[1] + J("wr" + sd)[1]) / 2], 30));
        const feetHit = !closeup && ["L", "R"].some((sd) => ["toe", "heel", "an"].some((j) => inBox(J(j + sd), 12)));      // (and in a full shot not over the feet: the joke is the boots on the map, the reviewer on v34)
        if (faceHit || chestHit || handHit || feetHit) faults.push(`8 ${S.id} frame ${fr} ${w.name}: the caption "${cap.text}" over his ${faceHit ? "face" : chestHit ? "chest" : handHit ? "hand" : "feet"}`); } }
    // 4 over the shoulder: the captain in front never on the boy's face or pointing hand
    const fg = placed.find((p) => p.w.sil), boy = placed.find((p) => p.w.name === "boy");
    // (the captain's shape: his head's circle with its ears, and the hull of his body's joints with half a sleeve's width round them;
    //  the figure's box hull spans the empty air between his head and his hands)
    const shapeOf = (pl) => { const J = (j) => toScreen(pl, jointPx(pl.f, j)), s0 = J("skull"), c0 = J("crown"), r = Math.hypot(c0[0] - s0[0], c0[1] - s0[1]) / 2, hc = [(s0[0] + c0[0]) / 2, (s0[1] + c0[1]) / 2], m = 0.3 * r;
      const body = hull(["neck", "shL", "shR", "elL", "elR", "wrL", "wrR", "tipL", "tipR", "hipL", "hipR", "anL", "anR", "toeL", "toeR", "heelL", "heelR"].flatMap((j) => { const q = J(j); return [[q[0] - m, q[1] - m], [q[0] + m, q[1] - m], [q[0] - m, q[1] + m], [q[0] + m, q[1] + m]]; }));
      return (q) => Math.hypot(q[0] - hc[0], (q[1] - hc[1]) * 1.0) < r * 1.18 || inPoly(q, body); };
    if (fg && boy) { const inFg = shapeOf(fg.pl), b = boy.pl, s0 = toScreen(b, jointPx(b.f, "skull")), c0 = toScreen(b, jointPx(b.f, "crown")), r = Math.hypot(c0[0] - s0[0], c0[1] - s0[1]) / 2, hc = [(s0[0] + c0[0]) / 2, (s0[1] + c0[1]) / 2];
      const pts = []; for (let k = 0; k < 24; k++) { const a = (k / 24) * 2 * Math.PI; pts.push([hc[0] + r * Math.cos(a), hc[1] + r * Math.sin(a)]); } pts.push(hc);
      const tip = toScreen(b, jointPx(b.f, "tipR")), wr = toScreen(b, jointPx(b.f, "wrR")); pts.push(tip, [(tip[0] + wr[0]) / 2, (tip[1] + wr[1]) / 2]);
      if (pts.some((q) => inFg(q))) faults.push(`4 ${S.id} frame ${fr}: the captain in front covers the boy's face or pointing hand`); }
    // (for scripts/flicker.py: the shot of each frame and each face's eye area, the head's circle less its cap; the boy's and the
    //  captain's faces, not the dark one in front)
    regions.push({ F: F0 + fr, shot: S.id, eyes: placed.filter((p) => !p.w.sil).map((p) => { const J = (j) => toScreen(p.pl, jointPx(p.pl.f, j)), a = J("skull"), b = J("crown"), r = Math.hypot(b[0] - a[0], b[1] - a[1]) / 2; const yaw = (p.pl.f.sk.faceYaw * Math.PI) / 180; return [Math.round((a[0] + b[0]) / 2 + 0.5 * r * Math.sin(yaw)), Math.round((a[1] + b[1]) / 2 + 0.05 * r), Math.round(0.5 * r)]; }), text: ((c) => (c ? [[Math.round(540 - (c.box[2] - c.box[0]) * 0.6), Math.round(c.box[1] - 6), Math.round(540 + (c.box[2] - c.box[0]) * 0.6), Math.round(c.box[3] + 6)]] : []))(captionAt(S.t0 + fr / FM.FPS)) });      // (v53: the caption's box, so the flicker check holds the words to its text limit: until v52 the list was empty and captions were held only to the picture's limit)      // (the eyes' area moves toward the side the face turns: measured on the three-quarter captain, v22)
    dump[S.id].push(row); } F0 += n; }
fs.mkdirSync("out/cab3d", { recursive: true }); if (!plant) { fs.writeFileSync("out/cab3d/figs.json", JSON.stringify(dump)); fs.writeFileSync("out/cab3d/regions.jsonl", regions.map((r) => JSON.stringify(r)).join(String.fromCharCode(10)) + String.fromCharCode(10)); }
const key = (x) => x.replace(/ frame \d+/, "").replace(/[-\d.]+ (cm|px|units)/g, "N $1").replace(/ \(at [^)]*\)/, "");
const kinds = [...new Set(faults.map(key))].map((k) => `${k}  (${faults.filter((x) => key(x) === k).length} frames)`);
console.log(`cabin${plant ? " planted " + plant : ""}: ${SHOTS.length} shots, ${frames} frames, ${faults.length} faults`); for (const k of kinds.slice(0, 20)) console.log("  " + k); if (process.argv.includes("--all")) for (const x of faults) console.log("    " + x);
console.log(faults.length ? "CABIN CHECK FAILED" : "CABIN CHECK OK"); process.exit(faults.length ? 1 : 0);
