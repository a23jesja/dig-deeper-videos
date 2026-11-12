// usage: node scripts/chunks.mjs <parity 0|1> [chunk=30]  -> out/chunks/c_<start>.mp4 (skips chunks that exist)
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "node:path"; import fs from "node:fs";
const parity = Number(process.argv[2]), N = Number(process.argv[3] || 30), only = process.env.RANGES ? process.env.RANGES.split(",").map((r) => r.split("-").map(Number)) : null;
const browserExecutable = "/opt/pw-browsers/chromium";
const chromiumOptions = { gl: "swangle", args: ["--no-sandbox", "--enable-unsafe-swiftshader"] };
fs.mkdirSync("out/chunks", { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.tsx"), publicDir: path.resolve("public") });
const composition = await selectComposition({ serveUrl, id: "EmuShort", browserExecutable, chromiumOptions });
const total = composition.durationInFrames;
for (let a = 0, k = 0; a < total; a += N, k++) {
  if (k % 2 !== parity) continue;
  const b = Math.min(total, a + N) - 1, out = `out/chunks/c_${String(a).padStart(5, "0")}.mp4`;
  if (only && !only.some(([x, y]) => a <= y && b >= x)) continue;
  if (fs.existsSync(out)) continue;
  const t0 = Date.now();
  await renderMedia({ composition, serveUrl, codec: "h264", crf: 14, outputLocation: out + ".tmp.mp4", frameRange: [a, b], concurrency: 1, browserExecutable, chromiumOptions, timeoutInMilliseconds: 900000, muted: true });
  fs.renameSync(out + ".tmp.mp4", out);
  console.log("chunk", a, b, ((Date.now() - t0) / 1000).toFixed(0) + "s", new Date().toISOString());
}
console.log("ALL DONE", parity);
