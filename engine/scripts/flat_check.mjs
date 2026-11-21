// The flat 2D motion test's checks (A Knopp, 21 Nov 2026): the times of its events, and every frame's feet: a sole below the ground line
// (sunk), a foot on the ground that slides while it carries (it must stand still), and both feet in the air while walking or standing.
//   node scripts/flat_check.mjs            (from engine/)
import * as esbuild from "esbuild"; import fs from "node:fs"; import path from "node:path"; import { pathToFileURL } from "node:url";
const out = path.resolve("out/flat_model.mjs");
await esbuild.build({ entryPoints: ["src/craft/flatMotionModel.ts"], bundle: true, format: "esm", platform: "node", outfile: out, logLevel: "error", loader: { ".json": "json" } });
const M = await import(pathToFileURL(out).href); fs.rmSync(out);
const { FM, figsAt, scaleOf, EVENTS, shoeDrawn, FLAT_SPECS, SECONDS, footY, MODE, snakeAt, FLAT_A } = M;
// FLAT_V3=1: the figures stood on the line's middle as in v3 (the shoe-on-the-line test's planted fault)
if (process.env.FLAT_V3) MODE.v3 = true;
// FLAT_PPM=720: the camera as close as in v4 (the edge test's planted fault: Ada's head went past the right edge)
if (process.env.FLAT_PPM) FM.PPM = Number(process.env.FLAT_PPM);
// FLAT_PLANT_SNAKE=1: the snake comes up at Ada's feet (the hand test's planted fault: her hands go up past its head)
if (process.env.FLAT_PLANT_SNAKE) M.SNAKE.x = FM.W / 2 + 0.43 * FM.PPM;
const LINE_TOP = FM.GY - FM.LINE / 2;
// FLAT_V2=1: the shoes as drawn in v2, not kept above the line (the shoe test's planted fault)
const CLAMP = !process.env.FLAT_V2;
console.log("events (s):", Object.entries(EVENTS).map(([k, v]) => `${k} ${v.toFixed(2)}`).join(", "));
const F = Math.round(FM.FPS * SECONDS), faults = [], prev = {};
let maxEdge = 0, maxSink = 0, maxSlide = 0, maxShoe = -1e9, minPupil = 9, maxPupilStep = 0, minSnakeGap = 1e9; const prevPupil = {};
for (let f = 0; f < F; f++) { const t = f / FM.FPS;
  for (const g of figsAt(t)) { const sc = scaleOf(g.who), feet = {}, drawnGap = {};
    for (const s of ["L", "R"]) { const h = g.sk.j[`heel${s}`], o = g.sk.j[`toe${s}`];
      // (the shoe's whole outline as drawn, not only its heel and toe: turning, lifting or setting down a foot its toe went 5-10 px through
      //  the line, the review of v2)
      // (v4: measured against the line's top edge with the ink round the shoe, 0.85 of the line weight outside its shape: in v3 the soles lay
      //  in the line, 9 px past its lower edge)
      const W = g.who === "sir" ? FLAT_SPECS[0].sir.B.shoeW : FLAT_SPECS[0].other.B.shoeW, sh = shoeDrawn(g.sk, s, W, CLAMP), ink = 0.85 * FLAT_A.ol * sc;
      const shoeLow = Math.max(...sh.pts.map((q) => footY(g.who) + q[1] * sc)) + ink, past = shoeLow - LINE_TOP;
      if (past > maxShoe) maxShoe = past; if (past > 0.75) faults.push(`${f} ${g.name}: the ${s} shoe's outline ${past.toFixed(1)} px past the top of the ground line`);
      drawnGap[s] = -past;      // (how far the drawn shoe stands above the line's top: a floating foot, the independent review of v4)
      // picture pixels: x from the figure's place, y down from the ground line (the skeleton's y is up from the ground, negative in its frame)
      const px = (q) => [g.x + q[0] * sc, FM.GY + q[1] * sc], H = px(h), T = px(o), low = Math.max(H[1], T[1]);
      feet[s] = { H, T, down: Math.abs(low - FM.GY) < 0.5 };      // (a planted foot lies exactly on the line; within 2.5 px a foot about to land counted as down)
      const sink = low - FM.GY; if (sink > maxSink) maxSink = sink; if (sink > 2.5) faults.push(`${f} ${g.name}: the ${s} foot ${sink.toFixed(1)} px below the ground line`);
      const k = `${g.name}${s}`, p = prev[k];
      // (the slide is measured where the foot touches: the toe when the heel is up (a running foot on its toe), the heel when the toe is up,
      //  and with both down the ball, 0.73 from heel to toe, where a foot turning on the spot pivots, as a real one does)
      const hd = Math.abs(H[1] - FM.GY) < 0.5, td = Math.abs(T[1] - FM.GY) < 0.5;
      feet[s].B = hd && td ? [H[0] + (T[0] - H[0]) * 0.73, FM.GY] : td ? T : H; feet[s].kind = hd && td ? "ball" : td ? "toe" : "heel";
      if (p && p.down && feet[s].down && p.kind !== feet[s].kind) { prev[`${g.name}${s}`] = feet[s]; continue; }      // (the contact moving from heel to toe is a roll, not a slide)
      if (p && p.down && feet[s].down) { const d = Math.abs(feet[s].B[0] - p.B[0]);
        if (d > maxSlide) maxSlide = d; if (d > 2.0) faults.push(`${f} ${g.name}: the ${s} foot slides ${d.toFixed(1)} px on the ground`); }
      prev[k] = feet[s]; }
    // pupils: never under 30 % of their size unless the face is frightened, never a change of more than a third in one frame
    { const pu = g.o.face?.pupil ?? 1, wide = (g.o.face?.wide ?? 0) > 0.5, lid = g.o.face?.lid ?? 0; if (lid < 0.9) { minPupil = Math.min(minPupil, pu);
      if (pu < 0.3 && !wide) faults.push(`${f} ${g.name}: the pupil at ${(pu * 100).toFixed(0)} % of its size without a frightened face`);
      const pp = prevPupil[g.name]; if (pp !== undefined) { const d = Math.abs(pu - pp); maxPupilStep = Math.max(maxPupilStep, d); if (d > 1 / 3) faults.push(`${f} ${g.name}: the pupil changes by ${(d * 100).toFixed(0)} % in one frame`); } prevPupil[g.name] = pu; } }
    // hands and the snake: the hand (wrist, its middle and the fingertip, each a disc of the hand's size) never within 40 px of the snake's
    // body or head outline, the shapes the drawing uses (Ada's hand lay on its head in v3; his fist came down onto it in a v4 preview)
    { const S = snakeAt(t); if (S.up) { const segD = (P, A, B) => { const dx = B[0] - A[0], dy = B[1] - A[1], l = dx * dx + dy * dy || 1, k = Math.max(0, Math.min(1, ((P[0] - A[0]) * dx + (P[1] - A[1]) * dy) / l)); return Math.hypot(P[0] - A[0] - k * dx, P[1] - A[1] - k * dy); };
      const body = (P) => { let d = 1e9; for (let i = 1; i < S.spine.length; i++) d = Math.min(d, segD(P, S.spine[i - 1], S.spine[i]) - 23); for (let i = 0; i < S.head.length; i++) d = Math.min(d, segD(P, S.head[i], S.head[(i + 1) % S.head.length])); return d; };
      for (const s of ["L", "R"]) { const q = g.sk.j[`tip${s}`], w = g.sk.j[`wr${s}`], at = (p) => [g.x + p[0] * sc, footY(g.who) + p[1] * sc];
        for (const P of [at(w), at([(q[0] + w[0]) / 2, (q[1] + w[1]) / 2]), at(q)]) { const d = body(P) - 25; /* (25 px: half a hand) */ minSnakeGap = Math.min(minSnakeGap, d);
          if (d < 40) { faults.push(`${f} ${g.name}: the ${s} hand ${d.toFixed(0)} px from the snake`); break; } } } } }
    const running = g.name === "sir" && t > EVENTS.T_RUN + 0.1;
    if (!running && !feet.L.down && !feet.R.down) faults.push(`${f} ${g.name}: both feet off the ground while not running`);
    // both drawn shoes above the line (more than 2 px) while not running: a foot that floats in the picture, whatever the skeleton says
    if (!running && Math.min(drawnGap.L, drawnGap.R) > 2) faults.push(`${f} ${g.name}: both drawn shoes ${Math.min(drawnGap.L, drawnGap.R).toFixed(1)} px above the ground line while not running`);
    // the head inside the picture (its drawing reaches 140 design units round the skull, the bun and hair included), except Sir on his way
    // out: Ada's hair, ear and bun went past the right edge, the independent review of v4
    { const hx = g.x + g.sk.j.skull[0] * sc, r = 140 * sc, out = Math.max(0, r - hx, hx + r - FM.W); maxEdge = Math.max(maxEdge, out);
      const leaving = g.name === "sir" && (t < 0.6 || t > EVENTS.T_RUN); if (!leaving && out > 0) faults.push(`${f} ${g.name}: the head ${out.toFixed(0)} px past the picture's edge`); }
  } }
for (const l of faults.slice(0, 40)) console.log(l);
console.log(`shoe outline past the line's top edge at most ${maxShoe.toFixed(1)} px; smallest pupil ${(minPupil * 100).toFixed(0)} %, largest pupil change in a frame ${(maxPupilStep * 100).toFixed(0)} %; nearest hand to the snake ${minSnakeGap.toFixed(0)} px`);
console.log(`head past the picture's edge at most ${maxEdge.toFixed(0)} px (Sir walking in and running out not counted)`);
console.log(`largest sink ${maxSink.toFixed(1)} px, largest slide of a foot on the ground ${maxSlide.toFixed(1)} px between two frames`);
console.log(faults.length ? `FLAT CHECK FAILED: ${faults.length} faults` : "FLAT CHECK OK: feet on the ground line, none sunk, none sliding, never both off the ground except in the run");
process.exit(faults.length ? 1 : 0);
