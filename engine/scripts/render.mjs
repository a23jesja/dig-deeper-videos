// Renders one composition, but only after the checks pass: no figure sheets in any video (no_sheets_check), and, when
// the composition has a layout check, "LAYOUT OK".   usage: node scripts/render.mjs <CompId> <out.mp4> [layoutCheck.mjs]
import { spawnSync } from "node:child_process"; import fs from "node:fs";
const [id, out, layout] = process.argv.slice(2);
const TMP = process.env.REMOTION_TMP || "S:/tmp/remotion"; fs.mkdirSync(TMP, { recursive: true });
const run = (cmd, args, env = {}) => spawnSync(cmd, args, { stdio: "inherit", shell: true, env: { ...process.env, ...env } }).status === 0;
if (!run("node", ["scripts/no_sheets_check.mjs"])) process.exit(1);
if (layout && !run("node", [layout])) { console.error("layout check failed: nothing rendered"); process.exit(1); }
const chrome = process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe";
process.exit(run("npx", ["remotion", "render", "src/index.ts", id, out, "--gl=angle", `--browser-executable="${chrome}"`, "--concurrency", "2", "--log=error"], { TEMP: TMP, TMP }) ? 0 : 1);
