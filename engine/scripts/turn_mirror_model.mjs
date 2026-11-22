// 03 (v8): the second turn is the first backwards. For each pair (frame f of the first turn, 132 - f of the second), as the drawing sees it:
// the body's |sin| (what the far arm's sweep runs on), whether the arm's lower part and hand are in front of the coat, the step left where
// the sleeve meets the coat's edge (units), the far wrist and elbow against the far shoulder (the arm's shape, px), and the watch's clasp
// against the near shoulder.   node scripts/turn_mirror_model.mjs [f0 f1]
import * as esbuild from "esbuild"; import fs from "node:fs"; import path from "node:path"; import { pathToFileURL } from "node:url";
const out = path.resolve("out/tm_model.mjs"); fs.writeFileSync("out/_tm_entry.ts", 'export * from "../src/craft/clips/clipKit"; export { CLIPS } from "../src/craft/clips/clips"; export { Ink } from "../src/craft/ink";');
await esbuild.build({ entryPoints: ["out/_tm_entry.ts"], bundle: true, format: "esm", platform: "node", outfile: out, logLevel: "error", loader: { ".json": "json" } });
const M = await import(pathToFileURL(out).href); fs.rmSync(out); fs.rmSync("out/_tm_entry.ts");
const mock = () => { let m = [1, 0, 0, 1, 0, 0]; const st = [], mul = (a, b) => [a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1], a[0] * b[2] + a[2] * b[3], a[1] * b[2] + a[3] * b[3], a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5]];
  const api = { save() { st.push(m.slice()); }, restore() { m = st.pop() ?? m; }, translate(x, y) { m = mul(m, [1, 0, 0, 1, x, y]); }, rotate(r) { const c = Math.cos(r), s = Math.sin(r); m = mul(m, [c, s, -s, c, 0, 0]); }, scale(x, y) { m = mul(m, [x, 0, 0, y, 0, 0]); },
    transform(a, b, c, d, e, f) { m = mul(m, [a, b, c, d, e, f]); }, setTransform(a, b, c, d, e, f) { m = typeof a === "object" ? [a.a, a.b, a.c, a.d, a.e, a.f] : [a, b, c, d, e, f]; }, resetTransform() { m = [1, 0, 0, 1, 0, 0]; }, getTransform() { return { a: m[0], b: m[1], c: m[2], d: m[3], e: m[4], f: m[5] }; }, measureText() { return { width: 0 }; } };
  return new Proxy(api, { get: (t, k) => (k in t ? t[k] : () => {}), set: () => true }); };
const c = M.CLIPS.c03(), f0 = +(process.argv[2] ?? 30), f1 = +(process.argv[3] ?? 50);
const info = (f) => { const g = M.castAt(c.cast, f / 30)[0], ink = new M.Ink(mock()); M.D.draw(ink, g.sk, g.o); const k = ink.marks, J = (n) => M.jointPx(g, n), far = g.sk.far ?? "R", near = far === "R" ? "L" : "R";
  const sh = J(`sh${far}`), w = J(`wr${far}`), e = J(`el${far}`), shn = J(`sh${near}`), cl = k.cuffA && k.cuffStep ? (k.cuffStep[0] - k.cuffA[0]).toFixed(0) : "-";
  return { s: Math.abs(g.sk.sin).toFixed(3), sweep: k.cuffA ? "yes" : "no", step: cl, arm: `${(w[0] - sh[0]).toFixed(0)},${(w[1] - sh[1]).toFixed(0)} el ${(e[0] - sh[0]).toFixed(0)},${(e[1] - sh[1]).toFixed(0)}`, far }; };
console.log("first / second: |sin| | in the sweep | step at the border (units) | far wrist and elbow from the far shoulder (px)");
for (let f = f0; f <= f1; f++) { const a = info(f), b = info(132 - f); console.log(`  ${String(f).padStart(3)} / ${String(132 - f).padStart(3)}: ${a.s} ${b.s} | ${a.sweep} ${b.sweep} | ${a.step} ${b.step} | ${a.arm}  |  ${b.arm}`); }
