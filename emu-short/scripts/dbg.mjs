import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
const browserExecutable = process.env.BROWSER || "/opt/pw-browsers/chromium";
const chromiumOptions = { gl: process.env.GL || "swangle", args: ["--no-sandbox","--enable-unsafe-swiftshader"] };
const inputProps = JSON.parse(process.env.PROPS || "{}");
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.tsx"), publicDir: path.resolve("public") });
const composition = await selectComposition({ serveUrl, id: "BridgeShort", browserExecutable, chromiumOptions, inputProps });
const t0=Date.now();
await renderStill({ composition, serveUrl, frame: 400, output: process.argv[2], imageFormat: "jpeg", scale: 0.5, inputProps, browserExecutable, chromiumOptions, timeoutInMilliseconds: 300000,
  onBrowserLog: (l) => { if (!/kenney|404/.test(l.text)) console.log(`[${l.type}]`, l.text.slice(0, 500)); } });
console.log("done", (Date.now()-t0)/1000);
