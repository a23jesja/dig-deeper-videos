// usage: node scripts/stills.mjs <CompId> <outPrefix> <frame,frame,...|a-b:step> [scale] [png]
// Bundles once, renders stills on the GPU (ANGLE) and prints the time per frame.
import fs from "node:fs";
import path from "node:path";
const TMP = process.env.REMOTION_TMP || "S:/tmp/remotion";
fs.mkdirSync(TMP, { recursive: true });
process.env.TEMP = process.env.TMP = TMP;
const { bundle } = await import("@remotion/bundler");
const { renderStill, selectComposition } = await import("@remotion/renderer");
const [id, prefix, frames, scale = "0.5", fmt = "jpeg"] = process.argv.slice(2);
const browserExecutable = process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const chromiumOptions = { gl: process.env.GL || "angle" };
const list = [];
for (const part of frames.split(",")) {
  const m = part.match(/^(\d+)-(\d+)(?::(\d+))?$/);
  if (m) for (let f = +m[1]; f <= +m[2]; f += +(m[3] || 1)) list.push(f);
  else list.push(Number(part));
}
fs.mkdirSync(path.dirname(path.resolve(prefix + "x")), { recursive: true });
let t0 = Date.now();
const serveUrl = await bundle({ entryPoint: path.resolve(process.env.ENTRY || "src/index.ts"), publicDir: path.resolve("public") });
console.log("bundle", ((Date.now() - t0) / 1000).toFixed(1) + "s");
const inputProps = process.env.PROPS ? JSON.parse(process.env.PROPS) : {};
const composition = await selectComposition({ serveUrl, id, browserExecutable, chromiumOptions, inputProps });
const onBrowserLog = (l) => { if (l.type === "error" || l.type === "warning") console.log(`[${l.type}]`, l.text.slice(0, 400)); };
for (const f of list) {
  t0 = Date.now();
  await renderStill({ composition, serveUrl, frame: f, output: `${prefix}${String(f).padStart(4, "0")}.${fmt === "png" ? "png" : "jpg"}`, imageFormat: fmt === "png" ? "png" : "jpeg", ...(fmt === "png" ? {} : { jpegQuality: 90 }),
    scale: Number(scale), browserExecutable, chromiumOptions, timeoutInMilliseconds: 240000, onBrowserLog, inputProps });
  console.log("still", f, ((Date.now() - t0) / 1000).toFixed(1) + "s");
}
fs.rmSync(serveUrl, { recursive: true, force: true });
