// The Eiffel Tower film: the timeline, the lines and every shot's sounds as JSON, for the mix (audio/eiffel_audio.py) and the checks.
//   node scripts/eiffel_info.mjs > out/craft/eiffel/info.json
import * as esbuild from "esbuild"; import fs from "node:fs"; import path from "node:path"; import { pathToFileURL } from "node:url";
const out = path.resolve("out/eif_model.mjs"); fs.writeFileSync("out/_eif_entry.ts", 'export * from "../src/craft/eiffel/timeline"; export { SHOTS } from "../src/craft/eiffel/eiffel";');
await esbuild.build({ entryPoints: ["out/_eif_entry.ts"], bundle: true, format: "esm", platform: "node", outfile: out, logLevel: "error", loader: { ".json": "json" } });
const M = await import(pathToFileURL(out).href); fs.rmSync(out); fs.rmSync("out/_eif_entry.ts");
const shots = Object.fromEntries(Object.entries(M.SHOTS).map(([k, f]) => { const s = f(); return [k, { title: s.title, seconds: s.seconds, sounds: s.sounds ?? [] }]; }));
console.log(JSON.stringify({ cuts: M.CUTS, film: M.FILM_S, lines: M.LINES, text: M.TEXT, openings: M.OPENINGS, shots }, null, 1));
