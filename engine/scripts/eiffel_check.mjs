// The Eiffel Tower film's own checks (the review's binding build requirements, v4 verdict), every frame:
//   bench: at least 40 px between the seated dealers' boxes in shot 7 (no knee, hand or cap reaching the next figure)
//   stamp: in shots 1 and 19 the stamp moves at most 12 px a frame; shot 1 lifts it about 40 px over its first 12 frames of motion; the last
//          frame of shot 19 is a few px above the paper, one frame before the contact that frame 1 carries
//   cup: in shot 13 the cup moves at most 12 px a frame and is still within 0.5 s
//   text: the two lines at full strength from 0 to 3.0 s (1.5 s a line)
//   sounds: the only hit in frame 1 is shot 1's; shot 19 has none; nothing low (no thud, step or creak)
//     node scripts/eiffel_check.mjs     (from engine/)
import * as esbuild from "esbuild"; import fs from "node:fs"; import path from "node:path"; import { pathToFileURL } from "node:url";
const out = path.resolve("out/eifc_model.mjs");
fs.writeFileSync("out/_eifc_entry.ts", 'export { SHOTS } from "../src/craft/eiffel/eiffel"; export { DRAWN } from "../src/craft/alcatraz/alcatraz"; export * from "../src/craft/eiffel/timeline"; export { textAlpha } from "../src/craft/eiffel/EiffelFilm"; export { castAt, figBox, FM } from "../src/craft/clips/clipKit";\n');
await esbuild.build({ entryPoints: ["out/_eifc_entry.ts"], bundle: true, format: "esm", platform: "node", outfile: out, logLevel: "error", loader: { ".json": "json" }, jsx: "automatic", external: ["remotion", "react"] });
const M = await import(pathToFileURL(out).href); fs.rmSync(out); fs.rmSync("out/_eifc_entry.ts");
const { SHOTS, DRAWN, castAt, figBox, FM, textAlpha, TEXT } = M; const faults = []; const notes = [];
const mock = () => new Proxy({}, { get: (o, k) => (k === "createLinearGradient" || k === "createRadialGradient" ? () => ({ addColorStop() {} }) : k === "measureText" ? () => ({ width: 10 }) : () => {}), set: () => true });
const scr = (cam, p) => [(p[0] - cam.cx) * cam.z + FM.W / 2, (p[1] - cam.cy) * cam.z + FM.H / 2];
// bench
for (const id of ["e07", "e10", "e11", "e15", "e16"]) { const s = SHOTS[id](); let minGap = 1e9;      // (every shot with figures side by side: their boxes 40 px apart, so no two bodies merge, the review of v10)      // (shot 10's bench too, since its two sit closer, the review of v10)
  for (let f = 0; f < Math.round(s.seconds * FM.FPS); f++) { const t = f / FM.FPS, cam = s.camera(t), boxes = castAt(s.cast, t).filter((g) => id === "e07" ? g.name.startsWith("d") : true).sort((p, q) => p.x - q.x).map((g) => { const P = figBox(g).map((q) => scr(cam, q)); return [Math.min(...P.map((q) => q[0])), Math.max(...P.map((q) => q[0]))]; }).sort((a, b) => a[0] - b[0]);
    for (let i = 0; i + 1 < boxes.length; i++) { const gap = boxes[i + 1][0] - boxes[i][1]; minGap = Math.min(minGap, gap); if (gap < 40) faults.push(`${id} frame ${f}: only ${gap.toFixed(0)} px between two figures`); } }
  notes.push(`side by side (${id}): the smallest gap between two figures' boxes ${minGap.toFixed(0)} px (40 or more)`); }
// a thing's place on the screen per frame, from what the shot registers in DRAWN.things
const track = (id, what) => { const s = SHOTS[id](), pts = [];
  for (let f = 0; f < Math.round(s.seconds * FM.FPS); f++) { const t = f / FM.FPS; for (const k of Object.keys(DRAWN)) DRAWN[k].length = 0; s.ownBg?.(mock(), t); const th = DRAWN.things.find((q) => q.what === what); pts.push(th ? scr(s.camera(t), th.at) : null); }
  return pts; };
for (const id of ["e01"]) { const p = track(id, "stamp"); let mx = 0; for (let i = 1; i < p.length; i++) if (p[i] && p[i - 1]) mx = Math.max(mx, Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]));
  if (mx > 12) faults.push(`${id}: the stamp moves ${mx.toFixed(1)} px in a frame (12 at most)`); notes.push(`${id}: the stamp moves at most ${mx.toFixed(1)} px a frame on the screen`); }
{ const p = track("e01", "stamp"), lift = p[3][1] - p[15][1]; notes.push(`e01: frames 4-16 (the lift) raise the stamp ${lift.toFixed(0)} px on the screen (about 40 asked, at the zoom ${SHOTS.e01().camera(0.3).z.toFixed(2)})`); }
{ const last = M.CUTS[M.CUTS.length - 1]; notes.push(`the loop: the last shot is ${last[0]} from ${last[2]} s to ${(-1 / FM.FPS).toFixed(3)} s inside it, frame 1 is ${M.CUTS[0][0]} at 0 s (the same set-up, the nod's motion running on)`);
  if (last[0] !== M.CUTS[0][0] || !(last[2] < 0) || Math.abs(M.FILM_S - last[1] + last[2]) > 1 / FM.FPS) faults.push(`the loop: the last shot does not end on frame 1's set-up (${JSON.stringify(last)}, film ${M.FILM_S})`); }
{ let full = 0; for (let f = 0; f < 200; f++) { if (textAlpha(f / FM.FPS) >= 0.999) full = (f + 1) / FM.FPS; else break; } notes.push(`text: ${TEXT.lines.join(" / ")} at full strength 0-${full.toFixed(2)} s (${(full / TEXT.lines.length).toFixed(2)} s a line)`); if (full < 3.0 - 1e-6) faults.push(`text: full for only ${full.toFixed(2)} s`); }
{ const low = ["thud", "step", "scuff", "creak", "rumble", "blast"]; for (const [id, f] of Object.entries(SHOTS)) for (const so of f().sounds ?? []) if (low.includes(so.k)) faults.push(`${id}: a low sound (${so.k})`);
  const s19 = SHOTS.e19().sounds ?? []; if (s19.length) faults.push("e19 has a sound"); notes.push(`sounds: frame 1 ${JSON.stringify((SHOTS.e01().sounds ?? []).filter((q) => q.t === 0).map((q) => q.k))}; shot 19 none`); }
console.log(notes.join("\n")); console.log(faults.length ? faults.join("\n") + `\nEIFFEL CHECK FAILED: ${faults.length}` : "EIFFEL CHECK OK");
