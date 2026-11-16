// Stills for a range of shots of a film built from a shot list (monaKit-style): one frame near the start, one in the
// middle and one near the end of each shot, laid out by scripts/shot_sheet.py.
// usage: node scripts/shot_stills.mjs <CompId> <shots.json> <outDir> <firstShot> <lastShot> [scale=0.3] [perShot=3]
//   shots.json: [{ id, name, a, b }, ...]  (written by scripts/shots_json.mjs or by hand)
import fs from "node:fs";
import path from "node:path";
const TMP = process.env.REMOTION_TMP || "S:/tmp/remotion";
fs.mkdirSync(TMP, { recursive: true });
process.env.TEMP = process.env.TMP = TMP;
const { bundle } = await import("@remotion/bundler");
const { renderStill, selectComposition } = await import("@remotion/renderer");
const [id, shotsFile, outDir, first, last, scale = "0.3", per = "3"] = process.argv.slice(2);
const shots = JSON.parse(fs.readFileSync(shotsFile, "utf8")).filter((s) => s.id >= +first && s.id <= +last);
const browserExecutable = process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const chromiumOptions = { gl: process.env.GL || "angle" };
fs.mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), publicDir: path.resolve("public") });
const inputProps = { audio: false };
const composition = await selectComposition({ serveUrl, id, browserExecutable, chromiumOptions, inputProps });
const onBrowserLog = (l) => { if (l.type === "error") console.log("[error]", l.text.slice(0, 600)); };
const t0 = Date.now();
let n = 0;
for (const s of shots) {
  const len = s.b - s.a, k = +per;
  const frames = k === 1 ? [Math.round(s.a + len * 0.6)] : Array.from({ length: k }, (_, i) => Math.min(s.b - 2, Math.round(s.a + 3 + ((len - 6) * i) / (k - 1))));
  for (const f of frames) {
    await renderStill({ composition, serveUrl, frame: f, output: path.join(outDir, `s${String(s.id).padStart(3, "0")}_${String(f).padStart(5, "0")}.jpg`), imageFormat: "jpeg", jpegQuality: 88,
      scale: Number(scale), browserExecutable, chromiumOptions, timeoutInMilliseconds: 240000, onBrowserLog, inputProps });
    n++;
  }
}
console.log(`${n} stills in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
fs.rmSync(serveUrl, { recursive: true, force: true });
