// The cheat check (the cloud session's rule, 26 Nov: placing may be cheated per shot, as in film, but it is never seen). For every cut, the loop's
// seam too: each figure seen in both shots keeps his distance to every object seen in both (the table's corners and middle, the plate, the
// book, the captain's chest) within 5 cm, and the figures seen in both keep their order across the picture (no side swapped, the 180 degree rule).
//   node scripts/cheat_check.mjs [--plant shift|swap]
//   planted: shift = the captain moved 30 cm in shot 2 (seen with the table in 1 and 2); swap = two figures' places swapped in the first shot
//   where two are seen in both shots of a cut. Each must fail.
import * as esbuild from "esbuild"; import fs from "node:fs"; import { pathToFileURL } from "node:url";
const out = "out/_cheat.mjs";
await esbuild.build({ stdin: { contents: 'export * from "./src/craft/dinner3d/core"; export * from "./src/craft/dinner3d/figures";', resolveDir: ".", loader: "ts" }, bundle: true, format: "esm", platform: "node", outfile: out, logLevel: "error", loader: { ".json": "json" }, external: ["remotion", "react"] });
const M = await import(pathToFileURL(out).href); fs.rmSync(out);
const plant = process.argv.includes("--plant") ? process.argv[process.argv.indexOf("--plant") + 1] : null;
const SPEC = JSON.parse(fs.readFileSync("src/craft/dinner3d/shots.json", "utf8")), SH = SPEC.shots, W = 1080, H = 1920, TOP = 0.488;
const seat = JSON.parse(fs.readFileSync("src/craft/dinner3d/props/seat.json", "utf8")).things[0].frames[0];
const cheatOf = (id, nm) => (SH.find((s) => s.id === id).cheat ?? {})[nm] ?? [0, 0];
if (plant === "shift") Object.assign(M.PLANT_CHEAT, { id: "2", nm: "captain", d: [-0.3, 0] });
const OBJ = (id) => { const c = cheatOf(id, "captain"); return { "table middle": [-1.015, 1.11, TOP], "table near left": [-1.447, 0.823, TOP], "table near right": [-0.583, 0.823, TOP], "table far left": [-1.447, 1.397, TOP], "table far right": [-0.583, 1.397, TOP],
  plate: [SPEC.plate[0], SPEC.plate[1], TOP], book: [SPEC.book[0], SPEC.book[1], TOP], chest: [seat[0] + c[0], seat[1] + c[1], seat[2] / 2] }; };
const seen = (id, p) => { const q = M.project(id, 0, p); return q[2] > 0 && q[0] >= 0 && q[0] <= W && q[1] >= 0 && q[1] <= H; };
const figs = ["captain", "crew", "boy"], H_ = { captain: 1.2, crew: 1.6, boy: 1.2 };
let swapped = null; const pos = (nm, id) => { if (swapped && swapped.id === id && (nm === swapped.a || nm === swapped.b)) return M.POS(nm === swapped.a ? swapped.b : swapped.a, id); return M.POS(nm, id); };
const faults = [], notes = [], pairs = SH.map((s, i) => [s.id, SH[(i + 1) % SH.length].id]);
if (plant === "swap") for (const [a, b] of pairs) { const both = figs.filter((nm) => M.inPicture(a, nm) && M.inPicture(b, nm)); if (both.length >= 2) { swapped = { id: b, a: both[0], b: both[1] }; break; } }
for (const [a, b] of pairs) {
  const both = figs.filter((nm) => M.inPicture(a, nm) && M.inPicture(b, nm)), oa = OBJ(a), ob = OBJ(b), objs = Object.keys(oa).filter((k) => seen(a, oa[k]) && seen(b, ob[k]));
  let worst = 0;
  for (const nm of both) for (const k of objs) { const pa = pos(nm, a), pb = pos(nm, b), da = Math.hypot(pa[0] - oa[k][0], pa[1] - oa[k][1]), db = Math.hypot(pb[0] - ob[k][0], pb[1] - ob[k][1]); worst = Math.max(worst, Math.abs(da - db));
    if (Math.abs(da - db) > 0.05) faults.push(`${a}->${b}: the ${nm} ${Math.round(Math.abs(da - db) * 100)} cm nearer to or farther from the ${k} (seen in both)`); }
  if (both.length >= 2) { const xs = (id) => both.map((nm) => ({ nm, x: M.project(id, 0, [...pos(nm, id), H_[nm]])[0] })).sort((p, q) => p.x - q.x).map((p) => p.nm).join(","); if (xs(a) !== xs(b)) faults.push(`${a}->${b}: the figures' order across the picture changes (${xs(a)} / ${xs(b)})`); }
  notes.push(`${a}->${b}: seen in both ${both.join(",") || "-"}; objects in both ${objs.length}; largest change ${Math.round(worst * 100)} cm`); }
// (the boy's walk: in the shots he walks in, neither his place, the table's end nor his way between them is in the picture (the reviewer's corridor))
for (const id of M.BOY_WALKING) { const A = M.FIGS.boy, B = M.BOY_TABLE; let hit = 0; for (let k = 0; k <= 8; k++) for (const z of [0, 0.5, 1.0, 1.42]) for (const dx of [-0.35, 0, 0.35]) { const p = [A[0] + ((B[0] - A[0]) * k) / 8 + dx, A[1] + ((B[1] - A[1]) * k) / 8, z]; if (seen(id, p)) hit++; }
  if (hit) faults.push(`${id}: the boy's way in the picture (${hit} points)`); else notes.push(`${id}: the boy's way not in the picture (checked)`); }
const cheats = SH.filter((s) => s.cheat).map((s) => `${s.id}: ${Object.entries(s.cheat).map(([nm, d]) => `${nm} ${d.map((v) => v.toFixed(2)).join(", ")} m`).join("; ")}`);
console.log("cheats: " + (cheats.join(" | ") || "none")); for (const n of notes) console.log("  " + n);
console.log(faults.length ? `CHEAT CHECK FAILED: ${faults.length}\n` + faults.map((f) => "  " + f).join("\n") : "CHEAT CHECK OK");
process.exit(faults.length ? 1 : 0);
