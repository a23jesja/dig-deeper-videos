import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
const browserExecutable = "/opt/pw-browsers/chromium", chromiumOptions = { args: ["--no-sandbox"] };
const serveUrl = await bundle({ entryPoint: path.resolve("src/thumb.tsx") });
for (const v of process.argv.slice(2)) {
  const inputProps = { v };
  const composition = await selectComposition({ serveUrl, id: "Thumb", browserExecutable, chromiumOptions, inputProps });
  await renderStill({ composition, serveUrl, output: `out/thumb_${v}.png`, imageFormat: "png", inputProps, browserExecutable, chromiumOptions, onBrowserLog: (l) => { if (l.type === "error") console.log(l.text.slice(0, 300)); } });
}
