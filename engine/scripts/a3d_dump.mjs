// The figures of Alcatraz in the new style, frame by frame, as the picture draws them: for each figure its projected floor point and depth,
// the lowest point of each drawn shoe, the points that bound it (figBox), its contact shadow, its joints and face, all in picture pixels.
// Read by scripts/a3d_check.py with Blender's floor and solid map.   node scripts/a3d_dump.mjs   (A3D_PLANT=float|sink|behind|noShadow)
import * as esbuild from "esbuild"; import fs from "node:fs"; import path from "node:path"; import { pathToFileURL } from "node:url";
const out = path.resolve("out/a3d_model.mjs");
fs.writeFileSync("out/_a3d_entry.ts", 'export * from "../src/craft/alcatraz3d/a3d"; export { castAt, scaleOf, footY, figBox, FM, D, FLAT_SPECS, shoeDrawn } from "../src/craft/clips/clipKit";\n');
await esbuild.build({ entryPoints: ["out/_a3d_entry.ts"], bundle: true, format: "esm", platform: "node", outfile: out, logLevel: "error", loader: { ".json": "json" } });
const M = await import(pathToFileURL(out).href); fs.rmSync(out); fs.rmSync("out/_a3d_entry.ts");
const { SHOTS3D, WHO, PLANT3, placeOf, shadowPoly, castAt, scaleOf, footY, figBox, FM, D, FLAT_SPECS, shoeDrawn, LINE_TOP } = M;
const pl = process.env.A3D_PLANT; if (pl) PLANT3[pl] = true;
const res = { plant: pl ?? null, shots: {} };
for (const s of SHOTS3D) {
  if (!fs.existsSync(`src/craft/alcatraz3d/cam/${s.id}.json`) || !fs.existsSync(`out/alc3d/${s.id}/map.npz`)) continue;      // (only shots Blender has rendered)
  const whos = WHO[s.id](), n = Math.round((s.t1 - s.t0) * FM.FPS), frames = [];
  for (let fr = 0; fr < n; fr++) { const t = fr / FM.FPS, figs = [];
    for (const w of whos) { const p = placeOf(s.id, fr, w), f = castAt([w.cast], t)[0], sc = scaleOf(f.who), S = (x, y) => [p.z * (x - p.cx) + FM.W / 2, p.z * (y - p.cy) + FM.H / 2];
      const shoes = {}; for (const side of ["L", "R"]) { const W = FLAT_SPECS[0].sir.B.shoeW, sh = shoeDrawn(f.sk, side, W, true), ink = 0.85 * D.ol * sc;
        const P = sh.pts.map((q) => [f.x + q[0] * sc, footY(f.who) + q[1] * sc]); const low = Math.max(...P.map((q) => q[1])) + ink, xs = P.map((q) => q[0]);
        shoes[side] = { bottom: S((Math.min(...xs) + Math.max(...xs)) / 2, low), planted: Math.max(f.sk.j[`heel${side}`][1], f.sk.j[`toe${side}`][1]) > -0.5 }; }
      const joints = Object.fromEntries(Object.entries(f.sk.j).map(([k, q]) => [k, S(f.x + q[0] * sc, footY(f.who) + q[1] * sc)]));
      figs.push({ name: w.name, foot: p.foot, depth: p.depth, z: p.z, lineTop: S(f.x, LINE_TOP), shoes, box: figBox(f).map(([x, y]) => S(x, y)), shadow: PLANT3.noShadow ? null : shadowPoly(s.id, fr, w), joints, face: f.o.face ?? {}, hands: [f.o.handL, f.o.handR] }); }
    frames.push(figs); }
  res.shots[s.id] = { n, frames }; }
fs.mkdirSync("out/alc3d", { recursive: true }); const o = `out/alc3d/dump${pl ? "-" + pl : ""}.json`; fs.writeFileSync(o, JSON.stringify(res)); console.log("wrote", o);
