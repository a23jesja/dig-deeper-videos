// The Short "The captain's dinner" v6: writes what Blender needs from the figures' code (src/craft/dinner3d/props/):
//   seat.json   the captain's sea chest: under his pelvis (4 cm behind its floor point), its top at the drawn underside of his thighs at the pelvis
//               (the rig's seat), its long side across his way: "chest" [x, y, top, turn in degrees]
//   <shot>.json empty (v6: the pudding is drawn flat in the sailor's ink, nothing for Blender)
//        node scripts/dinner_props.mjs
import * as esbuild from "esbuild"; import fs from "node:fs"; import { pathToFileURL } from "node:url";
const out = "out/_din_props.mjs";
await esbuild.build({ stdin: { contents: 'export * from "./src/craft/dinner3d/core"; export * from "./src/craft/dinner3d/figures"; export { thighUnder, scaleOf, D, FM, jointPx } from "./src/craft/clips/clipKit";', resolveDir: ".", loader: "ts" }, bundle: true, format: "esm", platform: "node", outfile: out, logLevel: "error", loader: { ".json": "json" }, external: ["remotion", "react"] });
const M = await import(pathToFileURL(out).href); fs.rmSync(out); fs.mkdirSync("src/craft/dinner3d/props", { recursive: true });
const { WHO, SHOTS, placeOf, cardToWorld, thighUnder, scaleOf, D } = M;
const SPEC = JSON.parse(fs.readFileSync("src/craft/dinner3d/shots.json", "utf8")), F = SPEC.facing.captain, fl = Math.hypot(F[0], F[1]), fx = F[0] / fl, fy = F[1] / fl;
const S0 = SHOTS.find((s) => WHO[s.id]().some((q) => q.name === "captain")), w = WHO[S0.id]().find((q) => q.name === "captain"), pl = placeOf(S0.id, 0, w), f = pl.f, TH = D.props("sir").thigh * scaleOf("sir");
const pel = f.sk.j.pelvis, pelX = f.x + pel[0] * scaleOf("sir"), under = thighUnder(f).filter(([x]) => Math.abs(x - pelX) < 0.33 * TH);
const lowest = under.reduce((a, b) => (b[1] > a[1] ? b : a)), top = cardToWorld(w, pl, lowest)[2];
const cx = w.at[0] - fx * 0.04, cy = w.at[1] - fy * 0.04, turn = (Math.atan2(-fx, fy) * 180) / Math.PI;      // (its long side (x) along his right, (fy, -fx))
fs.writeFileSync("src/craft/dinner3d/props/seat.json", JSON.stringify({ id: "seat", things: [{ name: "chest", frames: [[+cx.toFixed(4), +cy.toFixed(4), +top.toFixed(4), +turn.toFixed(2)]] }] }));
console.log(`SEAT (shot ${S0.id}): the chest's top ${(top * 100).toFixed(1)} cm, at ${cx.toFixed(3)}, ${cy.toFixed(3)}, turned ${turn.toFixed(1)} degrees`);
for (const S of SHOTS) fs.writeFileSync(`src/craft/dinner3d/props/${S.id}.json`, JSON.stringify({ id: S.id, things: [] }));
