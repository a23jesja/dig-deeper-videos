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
else if (what === "check") {
  // staging rules that can be read from the film itself: no steep view down on a figure standing as a card (at most 35 degrees),
  // every shot between 0.8 and 5 seconds, the film between 25 and 40 seconds, the question on screen from the first frame
  const bad = [];
  for (const s of film.shots) {
    const len = s.b - s.a; if (len < 0.8 || len > 5) bad.push(`${s.id}: the shot is ${len.toFixed(2)} s long`);
    for (let t = 0; t < len; t += 0.25) { const cam = s.cam(t, t / len); for (const a of s.cast(t, s.a + t)) {
      const d = Math.hypot(cam.pos[0] - a.at[0], cam.pos[2] - a.at[2]), el = (Math.atan2(cam.pos[1] - (a.at[1] + a.h * 0.5), d) * 180) / Math.PI;
      if (el > 35) { bad.push(`${s.id} at ${t.toFixed(2)} s: ${a.name} is seen from ${el.toFixed(0)} degrees above (at most 35 for a figure on a card)`); break; } } }
  }
  if (film.seconds < 25 || film.seconds > 40) bad.push(`the film is ${film.seconds.toFixed(1)} s (25 to 40)`);
  if (film.hook.a > 0.01) bad.push("the question is not on screen from the first frame");
  if (film.sign && film.sign.a < 5) bad.push("the sign comes before second five");
  if (bad.length) { console.error(`FILM CHECK FAILED for ${name}:`); for (const b of bad) console.error("  " + b); process.exit(1); }
  console.log(`FILM CHECK OK for ${name}: ${film.shots.length} shots, ${film.seconds.toFixed(1)} s, no figure seen from more than 35 degrees above`);
}
else if (what === "json") console.log(JSON.stringify({ comp, fps: film.fps, frames: f(film.seconds), seconds: film.seconds, shots: rows }));
else { console.log(`${name} (${comp}): ${film.seconds.toFixed(2)} s, ${f(film.seconds)} frames, ${rows.length} shots`); for (const r of rows) console.log(`  ${r.id.padEnd(8)} ${String(r.a).padStart(4)}-${String(r.b).padStart(4)}  ${r.seconds.toFixed(2)} s  still ${r.still}`); }
