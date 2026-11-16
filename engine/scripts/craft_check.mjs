// Staging checks for the new cast, run on a clip's skeletons before rendering (src/craft/checks.ts):
// the monocle shows in every side view, no turn without a view in between, two figures never share the same place.
//   usage: node scripts/craft_check.mjs <name>       e.g. node scripts/craft_check.mjs sirTest       exit 1 = something is wrong
import fs from "node:fs"; import path from "node:path"; import os from "node:os"; import { pathToFileURL } from "node:url"; import { build } from "esbuild";
const name = process.argv[2];
const tmp = path.join(os.tmpdir(), `craftcheck-${process.pid}.mjs`);
await build({ entryPoints: [path.resolve("src/craft/cueList.ts")], bundle: true, platform: "node", format: "esm", outfile: tmp, loader: { ".json": "json" }, logLevel: "silent" });
const { FRAMES, check } = await import(pathToFileURL(tmp).href); fs.rmSync(tmp, { force: true });
if (!FRAMES[name]) { console.error(`no clip named ${name}; there are: ${Object.keys(FRAMES).join(", ")}`); process.exit(1); }
const frames = FRAMES[name](), bad = check(frames);
if (bad.length) { console.error(`CRAFT CHECK FAILED for ${name}: ${bad.length} problem(s) in ${frames.length} frames`); for (const b of bad) console.error("  " + b); process.exit(1); }
console.log(`CRAFT CHECK OK for ${name}: ${frames.length} frames; the monocle shows in every side view, no turn without a view in between, no two figures in the same place`);
