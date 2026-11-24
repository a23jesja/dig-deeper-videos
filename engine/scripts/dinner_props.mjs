// The Short "The captain's dinner": writes what Blender needs from the figures' code (src/craft/dinner3d/props/):
//   seat.json   the captain's stool: at his pelvis's floor point, its top at the drawn underside of his thighs at the pelvis (the rig's seat,
//               measured on shot 3d, a side view), as [x, y, top, scale] (the stool model's top is 0.437 m)
//   <shot>.json the pudding's centre every frame, [x, y, z, shown] (1a: on the plate, then in the crewman's hand; the held shots: fixed)
//        node scripts/dinner_props.mjs
import * as esbuild from "esbuild"; import fs from "node:fs"; import { pathToFileURL } from "node:url";
const out = "out/_din_props.mjs";
await esbuild.build({ stdin: { contents: 'export * from "./src/craft/dinner3d/core"; export * from "./src/craft/dinner3d/figures"; export { thighUnder, scaleOf, D, FM, jointPx } from "./src/craft/clips/clipKit";', resolveDir: ".", loader: "ts" }, bundle: true, format: "esm", platform: "node", outfile: out, logLevel: "error", loader: { ".json": "json" } });
const M = await import(pathToFileURL(out).href); fs.rmSync(out); fs.mkdirSync("src/craft/dinner3d/props", { recursive: true });
const { WHO, SHOTS, placeOf, cardToWorld, thighUnder, scaleOf, D, pudAt, FM } = M;
const w = WHO["3d"]().find((q) => q.name === "captain"), pl = placeOf("3d", 0, w), f = pl.f, TH = D.props("sir").thigh * scaleOf("sir");
const pel = f.sk.j.pelvis, pelX = f.x + pel[0] * scaleOf("sir"), under = thighUnder(f).filter(([x]) => Math.abs(x - pelX) < 0.33 * TH);
const lowest = under.reduce((a, b) => (b[1] > a[1] ? b : a)), top = cardToWorld(w, pl, lowest)[2];
fs.writeFileSync("src/craft/dinner3d/props/seat.json", JSON.stringify({ id: "seat", things: [{ name: "stool", frames: [[w.at[0], w.at[1], +top.toFixed(4), +(top / 0.437).toFixed(4)]] }] }));
console.log(`SEAT top ${(top * 100).toFixed(1)} cm, the stool at ${(top / 0.437).toFixed(3)} of its size`);
/** the crewman's grip (world) at frame fr of a shot: 0.45 of the way from his near wrist to its fingertips, on his card */
export const gripOf = (id, fr) => { const w = WHO[id]().find((q) => q.name === "crew"); if (!w) return null; const pl = placeOf(id, fr, w), f = pl.f, n = f.sk.near, J = (j) => M.jointPx(f, j), W = J("wr" + n), T = J("tip" + n);
  return cardToWorld(w, pl, [W[0] + 0.45 * (T[0] - W[0]), W[1] + 0.45 * (T[1] - W[1])]); };
for (const S of SHOTS) { const n = Math.round((S.t1 - S.t0) * FM.FPS); let fr;
  if (M.HELD[S.id] && gripOf(S.id, 0)) { const gs = Array.from({ length: n }, (_, k) => gripOf(S.id, k)), g = [0, 1, 2].map((i) => (Math.min(...gs.map((q) => q[i])) + Math.max(...gs.map((q) => q[i]))) / 2);      // (the middle of the grip's small sway with his breath)
    fr = [[+g[0].toFixed(4), +g[1].toFixed(4), +(g[2] + M.PUD_UP).toFixed(4), 1]]; }
  else fr = [[0, 0, 0, 0]];
  fs.writeFileSync(`src/craft/dinner3d/props/${S.id}.json`, JSON.stringify({ id: S.id, things: [{ name: "pudding", frames: fr }] })); if (fr[0][3]) console.log(`PUDDING ${S.id}: ${fr.length} frame(s) ${fr[0].slice(0, 3).join(", ")}`); }
