// The face's drawing order, checked in every view of Sir's head (front, three-quarter right and left, profile right): the nose is drawn after
// both eyes' whites and the monocle's ring, so it lies over them (Jesper, 22 Nov 2026, on the shot types v4: the nose drawn behind the eye
// and the monocle turned to his left; "Ja"). It records the fills and strokes on a stand-in canvas and finds each part by its colour.
//   node scripts/face_order.mjs            (from engine/)     FACE_PLANT=nose-under plants the order of v4 (the nose before the ring)
import * as esbuild from "esbuild"; import fs from "node:fs"; import path from "node:path"; import { pathToFileURL } from "node:url";
fs.writeFileSync("out/_face_entry.ts", 'export { FLAT_SPECS, FACE, qMoustache } from "../src/craft/designs/flat"; export { Ink } from "../src/craft/ink";\n');
await esbuild.build({ entryPoints: ["out/_face_entry.ts"], bundle: true, format: "esm", platform: "node", outfile: "out/_face.mjs", logLevel: "error" });
const M = await import(pathToFileURL(path.resolve("out/_face.mjs")).href); fs.rmSync("out/_face.mjs"); fs.rmSync("out/_face_entry.ts");
if (process.env.FACE_PLANT === "nose-under") M.FACE.noseLast = false;
if (process.env.FACE_PLANT === "moustache-v5") M.FACE.qMoustache = false;
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
// (v6) the three-quarter moustache: the far half, as it shows (inside the head's outline, not under the nose, which is drawn over it), at least
// 58 % of the near half as it shows, about 60 % (the review of v5: at three-quarter the far half had all but gone, 18 %); both halves inside the
// head's outline (at most 2 % of either outside)
{ const { near, far } = M.qMoustache(), inPoly = (P, x, y) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } return c; };
  const head = (x, y) => (x / 126) ** 2 + ((y + 128) / 132) ** 2 <= 1, nose = (x, y) => ((x - 104) / 17) ** 2 + ((y + 84) / 14) ** 2 <= 1;
  const area = (P) => { let all = 0, vis = 0, out = 0; for (let x = -160; x <= 200; x++) for (let y = -200; y <= 0; y++) if (inPoly(P, x, y)) { all++; if (!head(x, y)) out++; else if (!nose(x, y)) vis++; } return { all, vis, out }; };
  const N = area(near), F = area(far), r = F.vis / N.vis, okR = r >= 0.58, okOut = F.out <= 0.02 * F.all && N.out <= 0.02 * N.all; if (!okR || !okOut) bad++;
  console.log(`three-quarter moustache: the far half shows ${(100 * r).toFixed(0)} % of the near half (58 % or more); outside the head's outline: far ${(100 * F.out / F.all).toFixed(1)} %, near ${(100 * N.out / N.all).toFixed(1)} % (2 % at most): ${okR && okOut ? "OK" : "FAIL"}`); }
console.log(bad ? `FACE ORDER FAILED: ${bad} check(s)` : "FACE ORDER OK: the nose over the eyes and the monocle's ring in every view, both halves of the moustache showing at three-quarter");
process.exit(bad ? 1 : 0);
