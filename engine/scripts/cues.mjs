// Writes the sound cues of a clip (src/craft/cueList.ts) as JSON, for audio/craft_sfx.py.
//   usage: node scripts/cues.mjs <name> <out.json>          e.g. node scripts/cues.mjs sirTest out/craft/sir-test-cues.json
import fs from "node:fs"; import path from "node:path"; import os from "node:os"; import { pathToFileURL } from "node:url"; import { build } from "esbuild";
const [name, out] = process.argv.slice(2);
const tmp = path.join(os.tmpdir(), `cues-${process.pid}.mjs`);
await build({ entryPoints: [path.resolve("src/craft/cueList.ts")], bundle: true, platform: "node", format: "esm", outfile: tmp, loader: { ".json": "json" }, logLevel: "silent" });
const { CUES } = await import(pathToFileURL(tmp).href); fs.rmSync(tmp, { force: true });
if (!CUES[name]) { console.error(`no cues named ${name}; there are: ${Object.keys(CUES).join(", ")}`); process.exit(1); }
const spec = CUES[name](); fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true }); fs.writeFileSync(out, JSON.stringify(spec, null, 1));
console.log(`${out}: ${spec.cues.length} cues, ${spec.beds.length} beds, ${spec.frames} frames`);
