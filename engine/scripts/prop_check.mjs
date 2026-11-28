// The drinking things' check (the reviewer's decision 28 Nov), measured on the same geometry the PropSheet draws, in the sheet's px:
//   hook (shot 1): the mug at least 20 px from the rum pirate's mouth, beard, eyes and nose; the plant (the mug at his mouth) must fail;
//   pour (shot 8): the bottle's neck tip inside the mug's opening and under its rim (behind the front wall), the bottle crossing the rim line
//     only inside the opening; the bottle and the pourer's hand at least 20 px from both faces and the beard; the plant (the neck through the
//     mug's wall) must fail;
//   dip (shot 14): a mug whose bottom is under the keg's rim lies wholly inside the keg's opening; the plant (the mug out through the wall) must fail.
//   node scripts/prop_check.mjs
import * as esbuild from "esbuild"; import fs from "node:fs"; import { pathToFileURL } from "node:url";
const out = "out/_prop_check.mjs";
await esbuild.build({ stdin: { contents: 'export * from "./src/craft/roberts3d/props"; export { mouthMid, RUM } from "./src/craft/roberts3d/rum"; export { solve } from "./src/craft/rig"; export { D } from "./src/craft/clips/clipKit"; export * as BG from "./src/craft/checks/bodyGeom"; export { kitOf, beardOutline } from "./src/craft/wardrobe/kit"; export { RUM_LOOK, YOUNG_LOOK, PIRATE_HEIGHTS } from "./src/craft/wardrobe/pirates";', resolveDir: ".", loader: "tsx" }, bundle: true, format: "esm", platform: "node", outfile: out, logLevel: "error", loader: { ".json": "json" }, external: ["remotion", "react"] });
const M = await import(pathToFileURL(out).href); fs.rmSync(out);
const H = M.PIRATE_HEIGHTS, lines = [], fails = { ok: 0, plantCaught: 0, plantMissed: 0, okFailed: 0 };
const res = (name, plant, bad, txt) => { const r = plant ? (bad ? "FÅNGAT (rätt)" : "MISSAT") : bad ? "FEL" : "ok"; if (plant) bad ? fails.plantCaught++ : fails.plantMissed++; else bad ? fails.okFailed++ : fails.ok++; lines.push(`${name.padEnd(26)} ${r.padEnd(14)} ${txt}`); };
const grid = (B) => { const p = []; for (let i = 0; i <= 8; i++) for (let j = 0; j <= 8; j++) p.push([B[0][0] + (B[1][0] - B[0][0]) * i / 8, B[0][1] + (B[3][1] - B[0][1]) * j / 8]); return p; };
const faceParts = (sk, look, mouth) => { const ff = M.BG.faceFeatures(sk, M.kitOf(look), { mouth }); return { eyes: ff.slice(0, ff.length - 2), nose: ff[ff.length - 2], mouth: ff[ff.length - 1], beard: look === M.RUM_LOOK ? M.beardOutline(sk) : null }; };
const gaps = (pts, F, s) => { const g = (P) => M.gapTo(pts, P) * s, o = { mouth: g(F.mouth), eyes: Math.min(...F.eyes.map(g)), nose: g(F.nose) }; if (F.beard) o.beard = g(F.beard); return o; };
const fmt = (o) => Object.entries(o).map(([k, v]) => `${k} ${v < 0 ? "INNE" : v.toFixed(0)}`).join(", ");
// hook
for (const plant of [false, true]) for (const yaw of [45, -45, 15]) { const s = 1.6 * H.rum / 1.75, sk = M.solve(M.D.props("sir"), M.hookMugPose(yaw), yaw), m = M.mugAt(sk, M.mugSide(sk));
  let body = m.body; if (plant) { const c = M.mouthMid(sk, 0.7).c, dx = c[0] - m.c[0], dy = c[1] - m.c[1]; body = body.map(([x, y]) => [x + dx, y + dy]); }
  const G = gaps(grid(body), faceParts(sk, M.RUM_LOOK, 0.7), s), bad = Math.min(...Object.values(G)) < 20; res(`hook ${yaw}°`, plant, bad, `mugg till: ${fmt(G)} px`); }
// pour
for (const plant of [false, true]) for (const yaw of [45, -45, 25]) { const sY = 1.0 * H.young / 1.75, sR = 1.0 * H.rum / 1.75, P = M.pourPair(yaw, sY, sR, 65, 14, plant, M.POUR_ARM);
  const n = P.p.n, op = P.op, inOpen = n[0] >= op.x0 && n[0] <= op.x1 && n[1] > op.y;
  const t = (P.p.n[1] - op.y) / (P.p.n[1] - P.p.b1[1] || 1), cx = P.p.n[0] + (P.p.b1[0] - P.p.n[0]) * Math.max(0, Math.min(1, t)), crossOk = cx >= op.x0 && cx <= op.x1;
  const nn = [-P.p.u[1], P.p.u[0]], bot = []; for (let k = 0; k <= 10; k++) { const c = [P.p.b0[0] + (P.p.n[0] - P.p.b0[0]) * k / 10, P.p.b0[1] + (P.p.n[1] - P.p.b0[1]) * k / 10], w = k < 6 ? M.RUM.bodyW / 2 : M.RUM.neckW / 2; bot.push([c[0] + nn[0] * w, c[1] + nn[1] * w], [c[0] - nn[0] * w, c[1] - nn[1] * w]); }
  const toR = (q) => [(q[0] * sY - P.dx) / sR, (q[1] * sY) / sR], hand = M.BG.handPolys(P.rum, P.rumSide, "grip").flat();
  const Gy = gaps(bot, faceParts(P.young, M.YOUNG_LOOK, 0.4), sY), Gr = gaps(bot.map(toR).concat(hand), faceParts(P.rum, M.RUM_LOOK, 0.3), sR);
  const near = Math.min(...Object.values(Gy), ...Object.values(Gr)), bad = !inOpen || !crossOk || near < 20;
  res(`häll ${yaw}°`, plant, bad, `halsens spets ${inOpen ? "i öppningen, under kanten" : "UTANFÖR öppningen"}; korsar kanten ${crossOk ? "i öppningen" : "I VÄGGEN"}; flaska/hand till unga: ${fmt(Gy)}; till rompiraten: ${fmt(Gr)} px`); }
// dip
for (const plant of [false, true]) for (const yaw of [45, -45, 25]) { const s = 1.6 * H.young / 1.75, d = M.dipPose(yaw, plant), B = d.m.body, y1 = B[2][1], under = y1 > d.keg.rimY;
  const inside = !under || (B[0][0] >= d.keg.x0 && B[1][0] <= d.keg.x1), bad = !inside || d.residual > 6;
  res(`dopp ${yaw}°`, plant, bad, `muggens botten ${((y1 - d.keg.rimY) * s).toFixed(0)} px under kanten; muggen x ${(B[0][0] * s).toFixed(0)}..${(B[1][0] * s).toFixed(0)}, öppningen ${(d.keg.x0 * s).toFixed(0)}..${(d.keg.x1 * s).toFixed(0)} px; ${inside ? "inne i kaggen" : "GENOM VÄGGEN"}; handen ${d.residual.toFixed(1)} enheter från greppet`); }
console.log(lines.join("\n")); console.log(`\nRätt bilder godkända: ${fails.ok}, rätt bilder fällda: ${fails.okFailed}, planterade fel fångade: ${fails.plantCaught}, planterade fel missade: ${fails.plantMissed}`);
process.exit(fails.okFailed || fails.plantMissed ? 1 : 0);
