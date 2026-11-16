// What a Short of the craft kit consists of, without rendering it: its shots with their frames, the frame that stands for each shot
// in the sketch, and the caption chunks.
//   usage: node scripts/film_info.mjs <film> [stills|shots|json]
//     stills = the sketch frames as a comma list (for scripts/stills.mjs)     shots = shots.json for scripts/short_qa.py
import fs from "node:fs"; import path from "node:path"; import os from "node:os"; import { pathToFileURL } from "node:url"; import { build } from "esbuild";
const name = process.argv[2], what = process.argv[3] ?? "table";
const tmp = path.join(os.tmpdir(), `filminfo-${process.pid}.mjs`);
await build({ entryPoints: [path.resolve("src/craft/shorts/index.ts")], bundle: true, platform: "node", format: "esm", outfile: tmp, loader: { ".json": "json" }, logLevel: "silent" });
const { FILMS } = await import(pathToFileURL(tmp).href); fs.rmSync(tmp, { force: true });
if (!FILMS[name]) { console.error(`no film named ${name}; there are: ${Object.keys(FILMS).join(", ")}`); process.exit(1); }
const { film, comp } = FILMS[name], f = (t) => Math.round(t * film.fps);
const rows = film.shots.map((s) => ({ id: s.id, a: f(s.a), b: f(s.b), still: Math.min(f(s.b) - 1, f(s.a + (s.still ?? (s.b - s.a) / 2))), seconds: +(s.b - s.a).toFixed(2) }));
if (what === "stills") console.log(rows.map((r) => r.still).join(","));
else if (what === "shots") console.log(JSON.stringify(rows.map((r, i) => ({ id: i + 1, name: r.id, a: r.a, b: r.b }))));
else if (what === "json") console.log(JSON.stringify({ comp, fps: film.fps, frames: f(film.seconds), seconds: film.seconds, shots: rows }));
else { console.log(`${name} (${comp}): ${film.seconds.toFixed(2)} s, ${f(film.seconds)} frames, ${rows.length} shots`); for (const r of rows) console.log(`  ${r.id.padEnd(8)} ${String(r.a).padStart(4)}-${String(r.b).padStart(4)}  ${r.seconds.toFixed(2)} s  still ${r.still}`); }
