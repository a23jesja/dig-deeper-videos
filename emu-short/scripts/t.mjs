import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
const browserExecutable = process.env.BROWSER || "/opt/pw-browsers/chromium";
const chromiumOptions = { gl: process.env.GL || "swangle", args: ["--no-sandbox"] };
const serveUrl = await bundle({ entryPoint: path.resolve("src/test.tsx") });
const composition = await selectComposition({ serveUrl, id: "T", browserExecutable, chromiumOptions });
await renderStill({ composition, serveUrl, frame: 10, output: process.argv[2], imageFormat: "jpeg", scale: 0.5, browserExecutable, chromiumOptions, onBrowserLog: (l) => console.log(`[${l.type}]`, l.text.slice(0, 400)) });
