// The sleeve check (rules 17b and 17c, the reviewer's yes of 28 Nov to kit.ts a and b), on the geometry kit.ts draws (stripeFamilies,
// stripeRuns, stripeAlpha, creaseFillet), over the bend sweep of SleeveSweep.tsx (straight to 120 degrees and back, 120 frames) and the hook's
// toast pose (props.ts hookMugPose at 45, -45 and 30):
//   17b no loose stripe piece: from 40 degrees of bend (where the fade is whole; nearly straight, v6c's own side clip is unchanged), a stripe run shorter than 1.5 times the stripe's width may not be drawn at more than half its opacity (the
//       planted fault noFade draws every run whole);
//   17c no sharp inner crease: from 40 degrees of bend the crease is rounded to at least half its full radius (planted: noFillet);
//   no jump as the arm bends (condition 1): from one frame of the sweep to the next the rounding's radius changes by at most a third of its full radius (full over 3 frames, as motion2's build-up) and no
//       stripe run's opacity by more than 0.35 (planted: stepFillet, the rounding switched on whole at 20 degrees).
//   node scripts/sleeve_check.mjs [--plant noFade|noFillet|stepFillet]
import * as esbuild from "esbuild"; import fs from "node:fs"; import { pathToFileURL } from "node:url";
const out = "out/_sleeve_check.mjs";
await esbuild.build({ stdin: { contents: 'export * from "./src/craft/wardrobe/kit"; export { solve } from "./src/craft/rig"; export { RUM_LOOK } from "./src/craft/wardrobe/pirates"; export { sweepPose, SW_N } from "./src/craft/roberts3d/SleeveSweep"; export { hookMugPose, mugSide } from "./src/craft/roberts3d/props"; export { limb } from "./src/craft/designs/common";', resolveDir: ".", loader: "tsx" }, bundle: true, format: "esm", platform: "node", outfile: out, logLevel: "error", loader: { ".json": "json", ".png": "empty", ".jpg": "empty" }, external: ["remotion", "react", "@remotion/*"] });
const M = await import(pathToFileURL(out).href); fs.rmSync(out);
const a = process.argv.slice(2), plant = a.includes("--plant") ? a[a.indexOf("--plant") + 1] : "";
if (plant) M.SLEEVE_PLANT[plant] = true;
const B = M.kitBody(M.A_SPEC.sir.B, M.kitOf(M.RUM_LOOK)), w1 = B.arm[1], W = 10, RMAX = 0.6 * w1;
const measure = (sk, side) => { const S = sk.j["sh" + side], E = sk.j["el" + side], Wr = sk.j["wr" + side], sleeve = M.limb(S, E, Wr, B.arm), fil = M.creaseFillet(S, E, Wr, w1);
  const u1 = [S[0] - E[0], S[1] - E[1]], u2 = [Wr[0] - E[0], Wr[1] - E[1]], bend = 180 - Math.acos(Math.max(-1, Math.min(1, (u1[0] * u2[0] + u1[1] * u2[1]) / (Math.hypot(...u1) * Math.hypot(...u2))))) * 180 / Math.PI;
  const runs = []; M.stripeFamilies(S, E, Wr).forEach(([p, q, H, pre, post, sh], fi) => { const L = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1, d = [(q[0] - p[0]) / L, (q[1] - p[1]) / L], n = [-d[1], d[0]];
    for (let u = 10 + sh - pre, k = 0; u < L + 10 + post; u += 24, k++) { const c0 = [p[0] + d[0] * u, p[1] + d[1] * u], p0 = [c0[0] - n[0] * 60, c0[1] - n[1] * 60], p1 = [c0[0] + n[0] * 60, c0[1] + n[1] * 60];
      M.stripeRuns(p0, p1, sleeve, H).forEach(([t0, t1], ri) => { const len = (t1 - t0) * 120; runs.push({ key: `${fi}:${k}:${ri}`, len, al: M.stripeAlpha(len, W, M.elbowBend(S, E, Wr)) }); }); } });
  return { bend, R: fil ? fil.R : 0, runs }; };
const faults = [], lines = []; let prev = null, maxDR = 0, maxDA = 0, loose = 0, sharp = 0;
for (let f = 0; f < M.SW_N; f++) { const p = M.sweepPose(f), sk = M.solve(M.KIT_DESIGN.props("sir"), p.pose, 45), m = measure(sk, p.side);
  if (m.bend >= 40) for (const r of m.runs) if (r.len < 1.5 * W && r.al > 0.5) { loose++; faults.push(`17b frame ${f} (bend ${m.bend.toFixed(0)}): a stripe run ${r.len.toFixed(1)} long drawn at ${(r.al * 100).toFixed(0)} %`); }
  if (m.bend >= 40 && m.R < 0.5 * RMAX) { sharp++; faults.push(`17c frame ${f} (bend ${m.bend.toFixed(0)}): the crease rounded to ${m.R.toFixed(1)} (at least ${(0.5 * RMAX).toFixed(1)})`); }
  if (prev) { const dR = Math.abs(m.R - prev.R); maxDR = Math.max(maxDR, dR); if (dR > RMAX / 3) faults.push(`jump frame ${f} (bend ${m.bend.toFixed(0)}): the rounding's radius changed ${dR.toFixed(1)} in one frame (at most a third of its full ${RMAX.toFixed(1)}: full over 3 frames or more)`);
    const pa = Object.fromEntries(prev.runs.map((r) => [r.key, r.al])); for (const r of m.runs) if (r.key in pa) { const dA = Math.abs(r.al - pa[r.key]); maxDA = Math.max(maxDA, dA); if (dA > 0.35) faults.push(`jump frame ${f}: stripe ${r.key}'s opacity changed ${dA.toFixed(2)} in one frame (at most 0.35)`); } }
  lines.push(`${f}\t${m.bend.toFixed(1)}\t${m.R.toFixed(2)}\t${m.runs.filter((r) => r.al < 1).map((r) => `${r.key}:${r.len.toFixed(0)}/${r.al.toFixed(2)}`).join(" ")}`); prev = m; }
for (const yaw of [45, -45, 30]) { const sk = M.solve(M.KIT_DESIGN.props("sir"), M.hookMugPose(yaw), yaw), side = M.mugSide(sk), m = measure(sk, side);
  if (m.bend >= 40) for (const r of m.runs) if (r.len < 1.5 * W && r.al > 0.5) faults.push(`17b hook ${yaw}: a stripe run ${r.len.toFixed(1)} long drawn at ${(r.al * 100).toFixed(0)} %`);
  if (m.bend >= 40 && m.R < 0.5 * RMAX) faults.push(`17c hook ${yaw} (bend ${m.bend.toFixed(0)}): the crease rounded to ${m.R.toFixed(1)}`);
  lines.push(`hook ${yaw}\t${m.bend.toFixed(1)}\t${m.R.toFixed(2)}\t${m.runs.filter((r) => r.al < 1).map((r) => `${r.key}:${r.len.toFixed(0)}/${r.al.toFixed(2)}`).join(" ")}`); }
const head = [`sleeve check${plant ? ` (planted: ${plant})` : ""}: the elbow's half-width ${w1}, the stripe ${W} wide, the rounding's full radius ${RMAX.toFixed(1)}`,
  `the sweep: largest change of the rounding's radius in a frame ${maxDR.toFixed(2)} (at most ${(RMAX / 3).toFixed(2)}, a third of its full radius), of a stripe run's opacity ${maxDA.toFixed(2)} (at most 0.35)`,
  faults.length ? `FAIL: ${faults.length}` : "PASS"];
console.log([...head, ...faults.slice(0, 12)].join("\n"));
fs.mkdirSync("out/rob", { recursive: true }); fs.writeFileSync(`out/rob/sleeve_check${plant ? "-" + plant : ""}.txt`, [...head, ...faults, "", "frame\tbend\tR\truns under full opacity (family:stripe:run length/opacity)", ...lines].join("\n") + "\n");
process.exit(faults.length ? 1 : 0);
