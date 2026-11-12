// usage: node scripts/render.mjs <compId> <out.mp4> [from-to] [scale] [concurrency]
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "node:path";
const [id, out, range, scale = "1", conc = "2"] = process.argv.slice(2);
const browserExecutable = "/opt/pw-browsers/chromium";
const chromiumOptions = { gl: "swangle", args: ["--no-sandbox", "--enable-unsafe-swiftshader"] };
const serveUrl = await bundle({ entryPoint: path.resolve(process.env.ENTRY || "src/index.tsx"), publicDir: path.resolve("public") });
const inputProps = JSON.parse(process.env.PROPS || "{}");
const composition = await selectComposition({ serveUrl, id, browserExecutable, chromiumOptions, inputProps });
const t0 = Date.now(); let last = 0;
await renderMedia({ inputProps, composition, serveUrl, codec: "h264", crf: 16, outputLocation: out, scale: Number(scale), concurrency: Number(conc),
  frameRange: range && range !== "all" ? range.split("-").map(Number) : null, browserExecutable, chromiumOptions, timeoutInMilliseconds: 600000, muted: true,
  onProgress: (p) => { if (p.renderedFrames - last >= 1) { last = p.renderedFrames; console.log("frames", p.renderedFrames, ((Date.now() - t0) / 1000).toFixed(0) + "s"); } } });
console.log("done", ((Date.now() - t0) / 1000).toFixed(0) + "s");
