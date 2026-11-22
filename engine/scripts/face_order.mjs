// The face's drawing order, checked in every view of Sir's head (front, three-quarter right and left, profile right): the nose is drawn after
// both eyes' whites and the monocle's ring, so it lies over them (Jesper, 22 Nov 2026, on the shot types v4: the nose drawn behind the eye
// and the monocle turned to his left; "Ja"). It records the fills and strokes on a stand-in canvas and finds each part by its colour.
//   node scripts/face_order.mjs            (from engine/)     FACE_PLANT=nose-under plants the order of v4 (the nose before the ring)
import * as esbuild from "esbuild"; import fs from "node:fs"; import path from "node:path"; import { pathToFileURL } from "node:url";
fs.writeFileSync("out/_face_entry.ts", 'export { FLAT_SPECS, FACE } from "../src/craft/designs/flat"; export { Ink } from "../src/craft/ink";\n');
await esbuild.build({ entryPoints: ["out/_face_entry.ts"], bundle: true, format: "esm", platform: "node", outfile: "out/_face.mjs", logLevel: "error" });
const M = await import(pathToFileURL(path.resolve("out/_face.mjs")).href); fs.rmSync("out/_face.mjs"); fs.rmSync("out/_face_entry.ts");
if (process.env.FACE_PLANT === "nose-under") M.FACE.noseLast = false;
const NOSE = "#ef9f86", WHITE = "#ffffff", GOLD = "#e8b630";
const record = () => { const log = []; let fillStyle = "", strokeStyle = "";
  const ctx = new Proxy({}, { get: (_t, k) => { if (k === "fill") return () => log.push(["fill", String(fillStyle).toLowerCase()]); if (k === "stroke") return () => log.push(["stroke", String(strokeStyle).toLowerCase()]);
    if (k === "fillStyle") return fillStyle; if (k === "strokeStyle") return strokeStyle; if (k === "getTransform") return () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }); if (k === "measureText") return () => ({ width: 0 }); return () => {}; },
    set: (_t, k, v) => { if (k === "fillStyle") fillStyle = v; if (k === "strokeStyle") strokeStyle = v; return true; } });
  return { ctx, log }; };
const S = M.FLAT_SPECS[0], face = { brow: 0, wide: 0, lid: 0.16, mouth: 0.2, smile: 0.2, sad: 0, smirk: 0, teeth: 0, squeeze: 0, pupil: 1, gaze: [0, 0], tear: 0, shut: 0 };
const views = { front: (k) => S.sirFront(k, face, 0, 0), "three-quarter right (monocle near)": (k) => S.sirQ(k, face, 0, "near"), "three-quarter left (monocle far)": (k) => S.sirQ(k, face, 0, "far"), "profile right": (k) => S.sirSide(k, face, 0, true) };
let bad = 0;
for (const [name, draw] of Object.entries(views)) { const { ctx, log } = record(); draw(new M.Ink(ctx));
  const last = (pred) => log.reduce((a, e, i) => (pred(e) ? i : a), -1), nose = last((e) => e[0] === "fill" && e[1] === NOSE), white = last((e) => e[0] === "fill" && e[1] === WHITE), ring = last((e) => e[1] === GOLD);
  const ok = nose > white && nose > ring; if (!ok) bad++;
  console.log(`${name}: nose drawn at step ${nose}, the last eye white at ${white}, the last of the ring at ${ring}: ${ok ? "nose on top" : "THE NOSE UNDER " + (nose < ring ? "THE RING" : "AN EYE")}`); }
console.log(bad ? `FACE ORDER FAILED: ${bad} view(s)` : "FACE ORDER OK: the nose over the eyes and the monocle's ring in every view");
process.exit(bad ? 1 : 0);
