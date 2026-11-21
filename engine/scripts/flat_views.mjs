// The flat 2D motion test: which head drawing each figure has on each frame (front, three-quarter, side; mirrored or not), and how many
// frames each one stands: a turn must go through a three-quarter drawing held 2 frames or more (the review of v2).   node scripts/flat_views.mjs
import * as esbuild from "esbuild"; import fs from "node:fs"; import path from "node:path"; import { pathToFileURL } from "node:url";
const out = path.resolve("out/flat_views.mjs");
await esbuild.build({ entryPoints: ["src/craft/flatMotionModel.ts"], bundle: true, format: "esm", platform: "node", outfile: out, logLevel: "error", loader: { ".json": "json" } });
const M = await import(pathToFileURL(out).href); fs.rmSync(out);
const F = Math.round(M.FM.FPS * M.SECONDS), runs = {}, faults = [];
for (let f = 0; f < F; f++) for (const g of M.figsAt(f / M.FM.FPS)) { const s = Math.sin((g.sk.faceYaw * Math.PI) / 180), a = Math.abs(s), v = (a < 0.45 ? "front" : a < 0.85 ? "q" : "side") + (a >= 0.45 && s < 0 ? "-left" : a >= 0.45 ? "-right" : "");
  const r = (runs[g.name] ??= []); if (r.length && r[r.length - 1].v === v) r[r.length - 1].n++; else r.push({ v, f, n: 1 }); }
for (const [name, r] of Object.entries(runs)) { console.log(name + ": " + r.map((x) => `${x.v} ${x.f}-${x.f + x.n - 1}`).join(" | "));
  r.forEach((x, i) => { if (x.v.startsWith("q") && x.n < 2) faults.push(`${name}: the three-quarter drawing at ${x.f} stands only ${x.n} frame`);
    if (i && ((x.v.startsWith("side") && r[i - 1].v === "front") || (x.v === "front" && r[i - 1].v.startsWith("side")))) faults.push(`${name}: from ${r[i - 1].v} straight to ${x.v} at ${x.f}`); }); }
for (const l of faults) console.log(l);
console.log(faults.length ? `VIEWS FAILED: ${faults.length}` : "VIEWS OK: every turn goes through a three-quarter drawing held 2 frames or more");
