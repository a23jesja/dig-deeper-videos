// The parts of each figure in a clip, frame by frame, in picture pixels after the camera: head, torso, each arm (shoulder to fingertip),
// each leg, with how far the part's joints moved since the frame before. scripts/part_diff.py reads it with the rendered clip.
//   node scripts/clip_parts.mjs <clip id> <out.json> [regions.jsonl]      (from engine/)
// regions.jsonl (optional): for scripts/flicker.py, each figure's face per frame as a circle in picture pixels (eyes, brows, monocle and
// mouth inside it), so that flicker in an eye is held to the eye limit and not only to the whole picture's
import * as esbuild from "esbuild"; import fs from "node:fs"; import path from "node:path"; import { pathToFileURL } from "node:url";
fs.writeFileSync("out/_parts_entry.ts", 'export * from "../src/craft/clips/clipKit"; export { CLIPS } from "../src/craft/clips/clips";\n');
await esbuild.build({ entryPoints: ["out/_parts_entry.ts"], bundle: true, format: "esm", platform: "node", outfile: "out/_parts.mjs", logLevel: "error", loader: { ".json": "json" } });
const M = await import(pathToFileURL(path.resolve("out/_parts.mjs")).href); fs.rmSync("out/_parts.mjs"); fs.rmSync("out/_parts_entry.ts");
const c = M.CLIPS[process.argv[2]](), F = Math.round(M.FM.FPS * c.seconds), frames = [], prev = {}, regions = [], things = {};
const PARTS = { head: ["skull", "crown"], torso: ["pelvis", "neck", "shL", "shR"], armL: ["shL", "elL", "wrL", "tipL"], armR: ["shR", "elR", "wrR", "tipR"], legL: ["hipL", "knL", "anL", "toeL"], legR: ["hipR", "knR", "anR", "toeR"] };
const PAD = { head: 150, torso: 70, armL: 34, armR: 34, legL: 30, legR: 30 };
for (let f = 0; f < F; f++) { const t = f / M.FM.FPS, cam = c.camera(t), out = {};
  const S = ([x, y]) => [M.FM.W / 2 + (x - cam.cx) * cam.z, M.FM.H / 2 + (y - cam.cy) * cam.z];
  const eyes = [];
  for (const g of M.castAt(c.cast, t)) { const sc = M.scaleOf(g.who);
    // (the circle 60 toward the way the face looks: in profile the eye sits at the face's front, not over the skull's middle)
    { const k = M.jointPx(g, "skull"), sn = Math.sin((g.sk.faceYaw * Math.PI) / 180), [ex, ey] = S([k[0] + 60 * sn * sc, k[1] - 150 * sc]); eyes.push([Math.round(ex), Math.round(ey), Math.round(105 * sc * cam.z)]); }
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
  // a thing that enters while it moves (the crab scuttling in): its box, from its claw tips and its body, for scripts/flicker_parts.py
  for (const a of c.appear ?? []) { const p = a.at(t), q = a.at(t - 1 / M.FM.FPS); if (!p || !q || Math.hypot(p[0] - q[0], p[1] - q[1]) < 0.5) continue;
    const pts = [...(a.points ? a.points(t) : []), p], xs = pts.map((v) => v[0]), ys = pts.map((v) => v[1]);
    const b = [S([Math.min(...xs) - 30, Math.min(...ys) - 30]), S([Math.max(...xs) + 30, Math.max(...ys) + 10])]; (things[f] ??= []).push([b[0][0], b[0][1], b[1][0], b[1][1]].map((v) => Math.round(v))); }
  frames.push(out); regions.push(JSON.stringify({ F: f, eyes, text: [] })); }
fs.writeFileSync(process.argv[3], JSON.stringify({ clip: c.id, fps: M.FM.FPS, frames, things }));
if (process.argv[4]) fs.writeFileSync(process.argv[4], regions.join(String.fromCharCode(10)) + String.fromCharCode(10));
console.log(`${process.argv[3]}: ${frames.length} frames`);
