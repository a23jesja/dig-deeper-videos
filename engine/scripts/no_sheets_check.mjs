// Stops a render if any video would use the Flow figure sheets (DAILY-RULES "The look: the emu Short": the sheets in
// figurblad/ are for the profile picture, banner and thumbnails only; characters are drawn in code by toon.ts).
// Walks everything the Remotion entry point imports and fails if a file comes from the sheet kit or names a sheet picture.
//   usage: node scripts/no_sheets_check.mjs [entry=src/index.ts]      exit 1 = a video uses the sheets
import fs from "node:fs"; import path from "node:path"; import { build } from "esbuild";
const BAD_PATH = /(^|[\/])(figurblad|videos[\/]kit|public[\/]kit)([\/]|$)|kitcards\.ts$/i;
const BAD_TEXT = /figurblad|["'`]kit\/(cards|sir|sirf|sirs|base|wardrobe|fx|bg)\//i;
export const check = async (entryFile = "src/index.ts") => {
  const entry = path.resolve(entryFile);
  const r = await build({ entryPoints: [entry], bundle: true, write: false, metafile: true, platform: "browser", format: "esm", logLevel: "silent",
    loader: { ".json": "json", ".png": "empty", ".jpg": "empty", ".wav": "empty", ".mp3": "empty", ".css": "empty" } });
  const hits = [];
  for (const f of Object.keys(r.metafile.inputs)) {
    if (f.includes("node_modules")) continue;
    if (BAD_PATH.test(f)) { hits.push(`${f}: a file of the figure-sheet kit is imported`); continue; }
    if (/\.(tsx?|jsx?|mjs)$/.test(f)) { const m = fs.readFileSync(f, "utf8").match(BAD_TEXT); if (m) hits.push(`${f}: names a figure-sheet picture ("${m[0]}")`); }
  }
  return hits;
};
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"))) {
  const hits = await check(process.argv[2] ?? "src/index.ts");
  if (hits.length) { console.error("FIGURE SHEETS IN A VIDEO: rendering stopped"); for (const h of hits) console.error("  " + h); process.exit(1); }
  console.log("NO SHEETS OK: no video imports anything from the figure sheets");
}
