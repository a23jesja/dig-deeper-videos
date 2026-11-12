import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
const browserExecutable = "/opt/pw-browsers/chromium", chromiumOptions = { args: ["--no-sandbox"] };
const serveUrl = await bundle({ entryPoint: path.resolve("src/sheet.tsx") });
for (const sheet of process.argv.slice(2)) {
  const inputProps = { sheet };
  const composition = await selectComposition({ serveUrl, id: "Sheet", browserExecutable, chromiumOptions, inputProps });
  await renderStill({ composition, serveUrl, output: `out/sheet_${sheet}.jpg`, imageFormat: "jpeg", inputProps, browserExecutable, chromiumOptions, onBrowserLog: (l) => { if (l.type === "error") console.log(l.text.slice(0, 300)); } });
}
