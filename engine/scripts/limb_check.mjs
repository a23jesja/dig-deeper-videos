// DAILY-RULES, Impossible things 10 (Jesper 2026-11-23, Eiffel v11: "varför i helvete har gubbarna 3-4 händer"): every figure has exactly two
// arms, two hands, two legs, two feet and one head in every frame, and a hand that holds something is the hand on its own arm.
//
// Every frame of every shot: the figures as the rig draws them (castAt), then the shot's own drawing (ownBg, back, over per figure, front) on a
// mock canvas, which registers what it adds: hands drawn over the picture (DRAWN.heldHands: the rig's own hand drawn again, rig: true, or any
// other hand, rig: false; DRAWN.sleeves: the flat Alcatraz's hand-and-sleeve drawings) and things covering a figure's hands (DRAWN.covers).
// Per figure: the skeleton's arms, legs, feet and head counted from its joints (2, 2, 2, 1); the hands seen = the rig's two hands, less any
// whose middle lies under a cover and is not drawn again, plus every other hand drawn for that figure. Fails on any count but two, and on any
// hand drawn more than its own hand's length from the end of an arm (not joined to its arm).
//   node scripts/limb_check.mjs eiffel|alcatraz|clips|cabin      the current code (cabin: 3D step 1, src/craft/cabin3d)
//   node scripts/limb_check.mjs eiffel@<commit>                    an earlier eiffel.ts (its drawn hands registered by the same rule)
//   node scripts/limb_check.mjs eiffel --plant three|four          a planted third hand, or v10's two edge hands: must fail
//   node scripts/limb_check.mjs eiffel --plant-guard               a planted unregistered hand in src/: the guard must fail
import * as esbuild from "esbuild"; import fs from "node:fs"; import path from "node:path"; import { pathToFileURL } from "node:url"; import { execSync } from "node:child_process";
const arg = process.argv[2] ?? "eiffel", plant = process.argv.includes("--plant") ? process.argv[process.argv.indexOf("--plant") + 1] : null;
// ---- the guard (the reviewer, 23 Nov): the count above sees only hands the rig draws or the registry knows, so every file under src/ is read
// first and the run fails on any hand drawn outside the rig without going through the registry:
//   - a function that draws a hand (handBack, heldTorch, hand, or any function whose name ends in "hand"/"Hand" and fills a shape) must push to
//     DRAWN.sleeves or DRAWN.heldHands in its body;
//   - a call to the rig's own handAt(k, ...) or ink's hand(k, ...) outside the rig (designs/, ink.ts, rig.ts, stage/) must have a
//     DRAWN.heldHands push within 3 lines;
//   - handFingers (the fingers in front of a held thing) only after a handBack of the same hand within 3 lines.
// --plant-guard adds a file with an unregistered hand: it must fail.
{
  const RIG = /^src[\\/]craft[\\/](designs[\\/]|ink\.ts$|rig\.ts$|stage[\\/])/;
  const files = []; const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const f = path.join(d, e.name); if (e.isDirectory()) walk(f); else if (/\.tsx?$/.test(e.name) && !/_limb_tmp/.test(e.name)) files.push(f); } }; walk("src");
  const texts = files.map((f) => [path.relative(".", f), fs.readFileSync(f, "utf8")]);
  if (process.argv.includes("--plant-guard")) texts.push(["src/craft/_planted_guard.ts", 'import { handAt } from "../designs/common";\nexport const planted = (k: any, sk: any) => { handAt(k, sk, "L", "fist", "#f7c9a3"); };\n']);
  const gfaults = [], drawFns = {};
  for (const [f, t] of texts) { if (RIG.test(f)) continue; const L = t.split("\n");
    L.forEach((l, i) => { const m = l.match(/(?:export )?const (handBack|heldTorch|hand|\w*[hH]and) = \(/); if (!m || /handAt|handsAt|carried/.test(m[1])) return;
      const body = L.slice(i, i + 12).join("\n"), draws = /\.fill\(|fl\(|ell\(|poly\(|handBack\(|rrect\(/.test(body); if (!draws) return;
      drawFns[m[1]] = drawFns[m[1]] || []; drawFns[m[1]].push({ f, i: i + 1, reg: /DRAWN\.sleeves\.push|heldHands/.test(body) || (m[1] !== "handBack" && /handBack\(/.test(body.replace(/const \w+ = \(/, ""))) }); }); }      // (a helper drawing through a registering handBack is registered)
  for (const [fn, defs] of Object.entries(drawFns)) for (const d of defs) if (!d.reg) gfaults.push(`${d.f}:${d.i}: ${fn} draws a hand without registering it (DRAWN.sleeves or DRAWN.heldHands)`);
  for (const [f, t] of texts) { if (RIG.test(f)) continue; const L = t.split("\n");
    L.forEach((l, i) => { const near = L.slice(Math.max(0, i - 3), i + 4).join("\n");
      if (/\bhandAt\(k\b|[^.\w]hand\(k\b/.test(l) && !/heldHands/.test(near)) gfaults.push(`${f}:${i + 1}: the rig's hand drawn outside the rig without a DRAWN.heldHands registration`);
      for (const m of l.matchAll(/handFingers\((\w+), (\w+)\)/g)) if (!new RegExp(`handBack\\(${m[1]}, ${m[2]}\\)`).test(L.slice(Math.max(0, i - 3), i + 1).join("\n"))) gfaults.push(`${f}:${i + 1}: handFingers(${m[2]}) without its handBack`); }); }
  if (gfaults.length) { for (const g of gfaults) console.log("  GUARD " + g); console.log(`LIMB CHECK FAILED: the guard found ${gfaults.length} unregistered hand drawing(s)`); process.exit(1); }
  console.log(`guard: ${texts.length} files read, every hand drawn outside the rig is registered`);
}
let eifFile = "../src/craft/eiffel/eiffel", tmp = null;
if (arg.startsWith("eiffel@")) {
  // an earlier version: its file, with the hands its hold drew at the paper's edges registered (the same rule the current code follows)
  let src = execSync(`git show ${arg.slice(7)}:engine/src/craft/eiffel/eiffel.ts`, { encoding: "utf8", maxBuffer: 1 << 26 });
  const reg = (ex, hy, w) => `(DRAWN as any).heldHands?.push({ who: name, at: [${ex}, ${hy}], rig: false }); (DRAWN as any).covers?.push({ who: name, rect: [x0, y0, x0 + ${w}, y0 + SHEET.h] }); `;
  const pats = [
    ["for (const d of [-1, 1]) { const ex = cx + d * SHEET.w / 2, hy = cy + 6; g.save();", (m) => m.replace("g.save();", reg("ex", "hy", "SHEET.w") + "g.save();")],
    ["for (const hp of HN) { const d = hp[0] < cx ? -1 : 1, ex = cx + d * SW / 2, hy = hp[1]; void hcy; g.save();", (m) => m.replace("g.save();", reg("ex", "hy", "SW") + "g.save();")],
  ];
  let hit = 0; for (const [p, f] of pats) if (src.includes(p)) { src = src.replace(p, f(p)); hit++; }
  if (!hit) { console.log(`${arg}: the hold's hand drawing not found; cannot register its hands`); process.exit(2); }
  tmp = path.resolve("src/craft/eiffel/_limb_tmp.ts"); fs.writeFileSync(tmp, src); eifFile = "../src/craft/eiffel/_limb_tmp";
}
const out = path.resolve("out/limb_model.mjs");
fs.writeFileSync("out/_limb_entry.ts", `export { SHOTS as EIF } from "${eifFile}"; ${tmp ? "" : 'export { PLANT_HANDS } from "../src/craft/eiffel/eiffel";'} export { SHOTS as ALC, DRAWN } from "../src/craft/alcatraz/alcatraz"; export { CLIPS } from "../src/craft/clips/clips"; export { WHO as CAB_WHO, SHOTS as CAB_SHOTS } from "../src/craft/cabin3d/cabin"; export { castAt, jointPx, FM } from "../src/craft/clips/clipKit";`);
try { await esbuild.build({ entryPoints: ["out/_limb_entry.ts"], bundle: true, format: "esm", platform: "node", outfile: out, logLevel: "error", loader: { ".json": "json" } }); }
finally { if (tmp) fs.writeFileSync(tmp, ""), fs.rmSync(tmp); fs.rmSync("out/_limb_entry.ts"); }
const M = await import(pathToFileURL(out).href); fs.rmSync(out);
const { EIF, ALC, CLIPS, DRAWN, castAt, jointPx, FM, PLANT_HANDS, CAB_WHO, CAB_SHOTS } = M;
// (3D step 1, the cabin: each shot's figures as the rig draws them; nothing is drawn over them but their own figure)
const CAB = Object.fromEntries(CAB_SHOTS.map((S) => [S.id, () => ({ seconds: S.t1 - S.t0, cast: CAB_WHO[S.id]().map((w) => w.cast) })]));
if (plant && PLANT_HANDS) PLANT_HANDS[plant] = true;
const set = arg.startsWith("eiffel") ? EIF : arg === "alcatraz" ? ALC : arg === "cabin" ? CAB : CLIPS;
const mock = () => new Proxy({}, { get: (o, k) => (k === "createLinearGradient" || k === "createRadialGradient" ? () => ({ addColorStop() {} }) : k === "measureText" ? () => ({ width: 10 }) : k === "getTransform" ? () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }) : () => {}), set: () => true });
const faults = [], seen = {}; let frames = 0;
for (const id of Object.keys(set)) {
  const s = set[id](), n = Math.round(s.seconds * FM.FPS); let bad = 0;
  for (let f = 0; f < n; f++) { const t = f / FM.FPS; frames++;
    for (const k of Object.keys(DRAWN)) if (Array.isArray(DRAWN[k])) DRAWN[k].length = 0;
    DRAWN.heldHands = []; DRAWN.covers = [];
    const figs = castAt(s.cast, t), g = mock();
    try { s.ownBg?.(g, t); s.bg && 0; s.back?.(g, t); for (const fg of figs) s.over?.(g, t, fg); s.front?.(g, t); } catch (e) { /* drawing on the mock canvas: only the registrations are wanted */ }
    for (const fg of figs) {
      const J = Object.keys(fg.sk.j), arms = ["wrL", "wrR"].filter((j) => J.includes(j)).length, legs = ["anL", "anR"].filter((j) => J.includes(j)).length, heads = J.includes("skull") ? 1 : 0;
      if (arms !== 2 || legs !== 2 || heads !== 1) faults.push(`${id} frame ${f} ${fg.name}: ${arms} arms, ${legs} legs and feet, ${heads} heads`);
      const rig = ["L", "R"].map((sd) => { const w = jointPx(fg, "wr" + sd), q = jointPx(fg, "tip" + sd); return { at: [(w[0] + q[0]) / 2, (w[1] + q[1]) / 2], len: Math.hypot(q[0] - w[0], q[1] - w[1]) }; });
      const covers = DRAWN.covers.filter((c) => c.who === fg.name), mine = DRAWN.heldHands.filter((h) => h.who === fg.name);
      const inside = (p, r) => p[0] > r[0] && p[0] < r[2] && p[1] > r[1] && p[1] < r[3];
      // the flat Alcatraz's hand drawings: one belongs to the figure whose arm end is nearest, within three hand lengths
      const sleeves = DRAWN.sleeves.map((sl) => ({ at: sl.wrist })).filter((h) => rig.some((r) => Math.hypot(h.at[0] - r.at[0], h.at[1] - r.at[1]) < 3 * r.len));
      const drawnAgain = (r) => mine.some((h) => h.rig && Math.hypot(h.at[0] - r.at[0], h.at[1] - r.at[1]) < 2) || sleeves.some((h) => Math.hypot(h.at[0] - r.at[0], h.at[1] - r.at[1]) < r.len);
      const rigSeen = rig.filter((r) => drawnAgain(r) || !covers.some((c) => inside(r.at, c.rect))).length;
      const extra = [...mine.filter((h) => !h.rig), ...sleeves.filter((h) => !rig.some((r) => Math.hypot(h.at[0] - r.at[0], h.at[1] - r.at[1]) < r.len))];
      const count = rigSeen + extra.length;
      if (count !== 2) { faults.push(`${id} frame ${f} (${t.toFixed(2)} s) ${fg.name}: ${count} hands seen (${rigSeen} on the arms, ${extra.length} drawn besides)`); bad++; }
      for (const h of extra) { const d = Math.min(...rig.map((r) => Math.hypot(h.at[0] - r.at[0], h.at[1] - r.at[1]) / r.len)); if (d > 1) { faults.push(`${id} frame ${f} ${fg.name}: a hand ${d.toFixed(1)} hand lengths from the end of an arm (not joined to its arm)`); bad++; } }
    } }
  seen[id] = bad; }
const byShot = Object.entries(seen).map(([k, v]) => `${k} ${v ? v + " faults" : "OK"}`).join(", ");
console.log(`${arg}${plant ? " planted " + plant : ""}: ${Object.keys(set).length} shots, ${frames} frames: ${byShot}`);
const uniq = [...new Set(faults.map((x) => x.replace(/frame \d+ \([\d.]+ s\) /, "").replace(/frame \d+ /, "")))]; for (const u of uniq.slice(0, 30)) console.log("  " + u + `  (${faults.filter((x) => x.replace(/frame \d+ \([\d.]+ s\) /, "").replace(/frame \d+ /, "") === u).length} frames)`);
console.log(faults.length ? `LIMB CHECK FAILED: ${faults.length}` : "LIMB CHECK OK");
process.exit(faults.length ? 1 : 0);
