// Alcatraz: the timeline and every shot's sounds as JSON, for the mix (audio/alcatraz_audio.py) and the checks.
//   node scripts/alcatraz_info.mjs > out/craft/alcatraz/info.json
import * as esbuild from "esbuild"; import fs from "node:fs"; import path from "node:path"; import { pathToFileURL } from "node:url";
const out = path.resolve("out/alc_model.mjs"); fs.writeFileSync("out/_alc_entry.ts", 'export * from "../src/craft/alcatraz/timeline"; export { SHOTS } from "../src/craft/alcatraz/alcatraz";');
await esbuild.build({ entryPoints: ["out/_alc_entry.ts"], bundle: true, format: "esm", platform: "node", outfile: out, logLevel: "error", loader: { ".json": "json" } });
const M = await import(pathToFileURL(out).href); fs.rmSync(out); fs.rmSync("out/_alc_entry.ts");
const shots = Object.fromEntries(Object.entries(M.SHOTS).map(([k, f]) => { const s = f(); return [k, { title: s.title, seconds: s.seconds, sounds: s.sounds ?? [] }]; }));
console.log(JSON.stringify({ cuts: M.CUTS, film: M.FILM_S, openings: M.OPENINGS, text: M.TEXT, shots }, null, 1));
