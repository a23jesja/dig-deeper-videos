// The parts of each figure in a clip, frame by frame, in picture pixels after the camera: head, torso, each arm (shoulder to fingertip),
// each leg, with how far the part's joints moved since the frame before. scripts/part_diff.py reads it with the rendered clip.
//   node scripts/clip_parts.mjs <clip id> <out.json>      (from engine/)
import * as esbuild from "esbuild"; import fs from "node:fs"; import path from "node:path"; import { pathToFileURL } from "node:url";
fs.writeFileSync("out/_parts_entry.ts", 'export * from "../src/craft/clips/clipKit"; export { CLIPS } from "../src/craft/clips/clips";\n');
await esbuild.build({ entryPoints: ["out/_parts_entry.ts"], bundle: true, format: "esm", platform: "node", outfile: "out/_parts.mjs", logLevel: "error", loader: { ".json": "json" } });
const M = await import(pathToFileURL(path.resolve("out/_parts.mjs")).href); fs.rmSync("out/_parts.mjs"); fs.rmSync("out/_parts_entry.ts");
const c = M.CLIPS[process.argv[2]](), F = Math.round(M.FM.FPS * c.seconds), frames = [], prev = {};
const PARTS = { head: ["skull", "crown"], torso: ["pelvis", "neck", "shL", "shR"], armL: ["shL", "elL", "wrL", "tipL"], armR: ["shR", "elR", "wrR", "tipR"], legL: ["hipL", "knL", "anL", "toeL"], legR: ["hipR", "knR", "anR", "toeR"] };
const PAD = { head: 150, torso: 70, armL: 34, armR: 34, legL: 30, legR: 30 };
for (let f = 0; f < F; f++) { const t = f / M.FM.FPS, cam = c.camera(t), out = {};
  const S = ([x, y]) => [M.FM.W / 2 + (x - cam.cx) * cam.z, M.FM.H / 2 + (y - cam.cy) * cam.z];
  for (const g of M.castAt(c.cast, t)) { const sc = M.scaleOf(g.who);
    for (const [part, js] of Object.entries(PARTS)) { const P = js.map((j) => M.jointPx(g, j)), pad = PAD[part] * sc;
      const xs = P.map((p) => p[0]), ys = P.map((p) => p[1]), box = [S([Math.min(...xs) - pad, Math.min(...ys) - (part === "head" ? 2.2 * pad : pad)]), S([Math.max(...xs) + pad, Math.max(...ys) + pad])];
      const key = g.name + "." + part, q = prev[key], move = q ? Math.max(...P.map((p, i) => Math.hypot(p[0] - q[i][0], p[1] - q[i][1]))) * cam.z : 0; prev[key] = P;
      out[key] = { box: [box[0][0], box[0][1], box[1][0], box[1][1]].map((v) => Math.round(v)), move: Math.round(move * 10) / 10 }; }
    // the face: a talking mouth or a blink changes the head's picture without a joint moving; counted as motion of the head's box
    // (eyes count for the head only; the mouth, low in the head, for whatever its box overlaps: a blink must not hide a snap in the torso)
    const fc = g.o.face ?? {}, fe = [fc.lid ?? 0, fc.pupil ?? 1, fc.wide ?? 0, ...(fc.gaze ?? [0, 0])], fm = [fc.mouth ?? 0, fc.smile ?? 0];
    const hb = out[g.name + ".head"].box, d = (k, v) => { const q = prev[k]; prev[k] = v; return q ? Math.round(Math.max(...v.map((x, i) => Math.abs(x - q[i]))) * 100) : 0; };
    out[g.name + ".eyes"] = { box: hb, move: d(g.name + ".eyes", fe), headOnly: true };
    out[g.name + ".mouth"] = { box: [hb[0], Math.round((hb[1] + hb[3]) / 2), hb[2], hb[3]], move: d(g.name + ".mouth", fm) }; }
  frames.push(out); }
fs.writeFileSync(process.argv[3], JSON.stringify({ clip: c.id, fps: M.FM.FPS, frames }));
console.log(`${process.argv[3]}: ${frames.length} frames`);
