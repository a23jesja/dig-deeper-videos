// The flat 2D motion test's checks (A Knopp, 21 Nov 2026): the times of its events, and every frame's feet: a sole below the ground line
// (sunk), a foot on the ground that slides while it carries (it must stand still), and both feet in the air while walking or standing.
//   node scripts/flat_check.mjs            (from engine/)
import * as esbuild from "esbuild"; import fs from "node:fs"; import path from "node:path"; import { pathToFileURL } from "node:url";
const out = path.resolve("out/flat_model.mjs");
await esbuild.build({ entryPoints: ["src/craft/flatMotionModel.ts"], bundle: true, format: "esm", platform: "node", outfile: out, logLevel: "error", loader: { ".json": "json" } });
const M = await import(pathToFileURL(out).href); fs.rmSync(out);
const { FM, figsAt, scaleOf, EVENTS, shoeDrawn, FLAT_SPECS, SECONDS } = M;
// FLAT_V2=1: the shoes as drawn in v2, not kept above the line (the shoe test's planted fault)
const CLAMP = !process.env.FLAT_V2;
console.log("events (s):", Object.entries(EVENTS).map(([k, v]) => `${k} ${v.toFixed(2)}`).join(", "));
const F = Math.round(FM.FPS * SECONDS), faults = [], prev = {};
let maxSink = 0, maxSlide = 0, maxShoe = 0;
for (let f = 0; f < F; f++) { const t = f / FM.FPS;
  for (const g of figsAt(t)) { const sc = scaleOf(g.who), feet = {};
    for (const s of ["L", "R"]) { const h = g.sk.j[`heel${s}`], o = g.sk.j[`toe${s}`];
      // (the shoe's whole outline as drawn, not only its heel and toe: turning, lifting or setting down a foot its toe went 5-10 px through
      //  the line, the review of v2)
      const W = g.who === "sir" ? FLAT_SPECS[0].sir.B.shoeW : FLAT_SPECS[0].other.B.shoeW, sh = shoeDrawn(g.sk, s, W, CLAMP), shoeLow = Math.max(...sh.pts.map((q) => FM.GY + q[1] * sc));
      if (shoeLow - FM.GY > maxShoe) maxShoe = shoeLow - FM.GY; if (shoeLow - FM.GY > 0.5) faults.push(`${f} ${g.name}: the ${s} shoe's outline ${(shoeLow - FM.GY).toFixed(1)} px below the ground line`);
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
    const running = g.name === "sir" && t > EVENTS.T_RUN + 0.1;
    if (!running && !feet.L.down && !feet.R.down) faults.push(`${f} ${g.name}: both feet off the ground while not running`);
  } }
for (const l of faults.slice(0, 40)) console.log(l);
console.log(`largest shoe outline below the line ${maxShoe.toFixed(1)} px, largest sink ${maxSink.toFixed(1)} px, largest slide of a foot on the ground ${maxSlide.toFixed(1)} px between two frames`);
console.log(faults.length ? `FLAT CHECK FAILED: ${faults.length} faults` : "FLAT CHECK OK: feet on the ground line, none sunk, none sliding, never both off the ground except in the run");
process.exit(faults.length ? 1 : 0);
