// 3D step 2: writes the things each movement piece moves on the plate (src/craft/moves3d/props/<shot>.json: per thing, its world place every
// frame), from the figures' own code (pieces.ts PROPS), for blender/moves/set.py.        node scripts/moves_props.mjs
import * as esbuild from "esbuild"; import fs from "node:fs"; import { pathToFileURL } from "node:url";
const out = "out/_mv_props.mjs";
await esbuild.build({ stdin: { contents: 'export { PROPS } from "./src/craft/moves3d/pieces";', resolveDir: ".", loader: "ts" }, bundle: true, format: "esm", platform: "node", outfile: out, logLevel: "error", loader: { ".json": "json" } });
const { PROPS } = await import(pathToFileURL(out).href); fs.rmSync(out); fs.mkdirSync("src/craft/moves3d/props", { recursive: true });
for (const [id, f] of Object.entries(PROPS)) { const things = f(); fs.writeFileSync(`src/craft/moves3d/props/${id}.json`, JSON.stringify({ id, things: things.map((t) => ({ name: t.name, frames: t.frames.map((q) => q.map((v) => +v.toFixed(5))) })) })); console.log(`PROPS ${id}: ${things.map((t) => t.name + " " + t.frames.length).join(", ")}`); }
