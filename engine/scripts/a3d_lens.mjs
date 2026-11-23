// The guard's torch lens as a world point for Blender's light (shots with a torch held by a figure): from the drawn torch's lens, frame 0.
//   node scripts/a3d_lens.mjs   writes torch.from into shots.json and film.json for those shots
import * as esbuild from "esbuild"; import fs from "node:fs"; import path from "node:path"; import { pathToFileURL } from "node:url";
const out = path.resolve("out/a3d_lens.mjs");
fs.writeFileSync("out/_a3d_lens.ts", 'export * from "../src/craft/alcatraz3d/a3d";\n');
await esbuild.build({ entryPoints: ["out/_a3d_lens.ts"], bundle: true, format: "esm", platform: "node", outfile: out, logLevel: "error", loader: { ".json": "json" } });
const M = await import(pathToFileURL(out).href); fs.rmSync(out); fs.rmSync("out/_a3d_lens.ts");
const res = {};
for (const id of ["n02", "n03"]) { const w = M.WHO[id]().find((x) => x.torch), pl = M.placeOf(id, 0, w), g = M.torchGeo(pl.f, M.aimRig(id, 0, pl)); res[id] = M.lensWorld(pl, g.lens).map((v) => +v.toFixed(3)); }
for (const f of ["src/craft/alcatraz3d/shots.json", "src/craft/alcatraz3d/film.json"]) { const d = JSON.parse(fs.readFileSync(f, "utf8"));
  for (const s of d.shots) if (res[s.id]) s.torch.from = [res[s.id], res[s.id]];
  fs.writeFileSync(f, JSON.stringify(d, null, 1)); }
console.log(JSON.stringify(res));
