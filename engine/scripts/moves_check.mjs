// 3D step 2, the movement sheet: the checks of impossible things for flat figures moving in a Blender plate, every frame of every piece.
//   1  feet on the floor: every foot point (heel, toe) drawn at floor height lands in the picture on its own floor point's projection
//      (within 3 px), and none is below the floor (more than 0.5 cm)
//   2  no sliding: while a foot point stands on the floor (under 0.5 cm), its floor point moves less than 1 cm, from the frame it landed
//   3  support: a walking figure has a foot on the floor in every frame (no sneak with both feet in the air)
//   5  frame edges: a hand is inside the picture with a margin, or wholly out of it (not cut by the edge)
//   +  writes, for the measures that read step 1's layout (they are not changed: the new flicker measure is frozen, the reviewer 24 Nov), a
//      root of their own in out/mov3d/root: out/cab3d/figs.json (each figure's head, trunk and limbs in the picture), src/craft/cabin3d/
//      shots.json and cam/ (this sheet's shots and cameras), each figure named <shot>:<name>, its floor point the middle of its way in the
//      piece; and out/mov3d/regions.jsonl (the eye areas) for scripts/flicker2.py. Then:
//        python scripts/motion2.py --root out/mov3d/root      python scripts/cabin_depth.py (step 1's) is not used: moves_depth comes with the 3D things
//        python scripts/flicker2.py <film.mp4> out/mov3d/regions.jsonl --cams out/mov3d/root
// Planted faults (each must fail): --plant slide (the figure skating 2 mm a frame), float (12 px above the floor), sink (10 px into it).
//   node scripts/moves_check.mjs [--plant slide|float|sink] [--shot S1]
import * as esbuild from "esbuild"; import fs from "node:fs"; import path from "node:path"; import { pathToFileURL } from "node:url";
const arg = (k) => (process.argv.includes(k) ? process.argv[process.argv.indexOf(k) + 1] : null), plant = arg("--plant"), only = arg("--shot");
const out = "out/_mv_check.mjs";
fs.writeFileSync("out/_mv_entry.ts", 'export * from "../src/craft/moves3d/core"; export { WHO, EXTRAS } from "../src/craft/moves3d/pieces"; export { castAt, jointPx, FM, footY } from "../src/craft/clips/clipKit";');
try { await esbuild.build({ entryPoints: ["out/_mv_entry.ts"], bundle: true, format: "esm", platform: "node", outfile: out, logLevel: "error", loader: { ".json": "json" } }); }
finally { fs.rmSync("out/_mv_entry.ts"); }
const M = await import(pathToFileURL(out).href); fs.rmSync(out);
const { SHOTS, WHO, PLANT, placeOf, toScreen, feetOf, project, jointPx, handPx, FM } = M;
if (plant) { if (!(plant in PLANT)) throw new Error("no such planted fault: " + plant); PLANT[plant] = true; }
const faults = [], dump = {}, regions = [], mids = {}; let frames = 0, F0 = 0;
const hull = (P) => { const p = [...P].sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], up = [];
  for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (const q of p.reverse()) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); } return [...lo.slice(0, -1), ...up.slice(0, -1)]; };
const GROUND = 0.005;
/** the world point at height z seen at picture point q: found by Newton steps on the projection, from a guess at depth row y0 */
const floorAt = (id, fr, q, y0, z = 0) => { let x = 0, y = y0; for (let it = 0; it < 12; it++) { const p = project(id, fr, [x, y, z]), px1 = project(id, fr, [x + 1e-3, y, z]), py1 = project(id, fr, [x, y + 1e-3, z]);
  const a = (px1[0] - p[0]) / 1e-3, b = (py1[0] - p[0]) / 1e-3, c = (px1[1] - p[1]) / 1e-3, d = (py1[1] - p[1]) / 1e-3, ex = q[0] - p[0], ey = q[1] - p[1], det = a * d - b * c;
  x += (d * ex - b * ey) / det; y += (a * ey - c * ex) / det; } return [x, y]; };
for (const S of SHOTS) {
  const n = Math.round((S.t1 - S.t0) * FM.FPS);
  if (only && S.id !== only) { F0 += n; continue; }
  const whos = WHO[S.id](), stand = {}, ats = {}; dump[S.id] = [];
  for (let fr = 0; fr < n; fr++) { frames++; const row = [];
    const placed = whos.map((w) => ({ w, pl: placeOf(S.id, fr, w) }));
    for (const { w, pl } of placed) {
      const f = pl.f, scr = (j) => toScreen(pl, jointPx(f, j)), key = S.id + ":" + w.name; (ats[key] ??= []).push(pl.at);
      { const P = (j) => scr(j).map((v) => Math.round(v)), s0 = scr("skull"), c0 = scr("crown"), hr = Math.hypot(c0[0] - s0[0], c0[1] - s0[1]) / 2, lw = Math.round(0.17 * hr);
        const limbs = ["L", "R"].flatMap((d) => [[P("sh" + d), P("el" + d)], [P("el" + d), P("wr" + d)], [P("wr" + d), P("tip" + d)], [P("hip" + d), P("kn" + d)], [P("kn" + d), P("an" + d)], [P("an" + d), P("toe" + d)], [P("heel" + d), P("toe" + d)]]);
        row.push({ name: key, sil: false, depth: pl.depth, head: [Math.round((s0[0] + c0[0]) / 2), Math.round((s0[1] + c0[1]) / 2), Math.round(hr * 1.1)], headF: [+((s0[0] + c0[0]) / 2).toFixed(2), +((s0[1] + c0[1]) / 2).toFixed(2)],
          trunk: hull(["neck", "shL", "shR", "hipL", "hipR"].map((j) => scr(j))).map((q) => q.map((v) => Math.round(v))), limbs, lw }); }
      // 1, 2, 3 the feet
      let down = 0;
      for (const ft of feetOf(S.id, fr, w, pl)) for (const [pt, px, nm] of [[ft.heel, ft.heelPx, "heel"], [ft.toe, ft.toePx, "toe"]]) {
        const k = `${w.name} ${ft.side} ${nm}`;
        if (pt[2] < -GROUND) faults.push(`1 ${S.id} frame ${fr} ${k}: ${(-pt[2] * 100).toFixed(1)} cm into the floor`);
        if (pt[2] <= GROUND) { down++;
          // (1: the height only. Along the floor the drawn foot may differ a few px from the card's own floor point (the card is scaled by his
          //  height, the floor recedes); what the viewer sees is the drawn foot, so 2 measures the drawn foot's own floor point)
          const fl = project(S.id, fr, [pt[0], pt[1], Math.max(0, pt[2])]), dv = px[1] - fl[1];
          if (Math.abs(dv) > 3) faults.push(`1 ${S.id} frame ${fr} ${k}: drawn ${Math.abs(dv).toFixed(1)} px ${dv > 0 ? "into" : "above"} the floor`);
          const g = floorAt(S.id, fr, px, pt[1], Math.max(0, pt[2])), st = stand[k];      // (at the point's own height: a heel 3 mm up, coming down, read 1 cm off as a floor point)
          if (!st) stand[k] = { at: g, fr }; else { const mv = Math.hypot(g[0] - st.at[0], g[1] - st.at[1]); if (mv > 0.01) faults.push(`2 ${S.id} frame ${fr} ${k}: slid ${(mv * 100).toFixed(1)} cm since it landed at frame ${st.fr}`); }
        } else delete stand[k]; }
      if (!down) faults.push(`3 ${S.id} frame ${fr} ${w.name}: no foot on the floor`);
      // 5 the frame's edges: each hand wholly inside (40 px margin) or wholly out
      for (const sd of ["L", "R"]) { const wr = scr("wr" + sd), tp = scr("tip" + sd), r = handPx(pl) * 0.9, xs = [wr[0], tp[0]], ys = [wr[1], tp[1]];
        const inside = Math.min(...xs) - r > 40 && Math.max(...xs) + r < FM.W - 40 && Math.min(...ys) - r > 40 && Math.max(...ys) + r < FM.H - 40, out0 = Math.max(...xs) + r < 0 || Math.min(...xs) - r > FM.W || Math.max(...ys) + r < 0 || Math.min(...ys) - r > FM.H;
        if (!inside && !out0) faults.push(`5 ${S.id} frame ${fr} ${w.name}: his ${sd} hand cut by the picture's edge`); }
    }
    regions.push({ F: F0 + fr, shot: S.id, eyes: placed.map((p) => { const J = (j) => toScreen(p.pl, jointPx(p.pl.f, j)), a = J("skull"), b = J("crown"), r = Math.hypot(b[0] - a[0], b[1] - a[1]) / 2, yaw = (p.pl.f.sk.faceYaw * Math.PI) / 180;
      return [Math.round((a[0] + b[0]) / 2 + 0.5 * r * Math.sin(yaw)), Math.round((a[1] + b[1]) / 2 + 0.05 * r), Math.round(0.5 * r)]; }), text: [] });
    dump[S.id].push(row); }
  for (const [k, list] of Object.entries(ats)) { const m = list[Math.floor(list.length / 2)]; mids[k] = [+m[0].toFixed(3), +m[1].toFixed(3)]; }
  F0 += n; }
// the root for the frozen measures
if (!plant) {
  const R = "out/mov3d/root"; fs.mkdirSync(path.join(R, "out/cab3d"), { recursive: true }); fs.mkdirSync(path.join(R, "src/craft/cabin3d/cam"), { recursive: true });
  fs.writeFileSync(path.join(R, "out/cab3d/figs.json"), JSON.stringify(dump));
  const spec = JSON.parse(fs.readFileSync("src/craft/moves3d/shots.json", "utf8"));
  spec.figs = mids; spec.shots = spec.shots.filter((s) => dump[s.id]).map((s) => ({ ...s, cam: { ...s.cam, focus: s.id + ":" + s.cam.focus } }));
  fs.writeFileSync(path.join(R, "src/craft/cabin3d/shots.json"), JSON.stringify(spec, null, 1));
  for (const s of spec.shots) fs.copyFileSync(`src/craft/moves3d/cam/${s.id}.json`, path.join(R, `src/craft/cabin3d/cam/${s.id}.json`));
  fs.writeFileSync("out/mov3d/regions.jsonl", regions.map((r) => JSON.stringify(r)).join("\n") + "\n");
}
const seen = new Set(), shown = [];
for (const f of faults) { const k = f.replace(/frame \d+/, "").replace(/[\d.]+ (px|cm)/g, ""); if (!seen.has(k)) { seen.add(k); shown.push(f); } }
for (const f of shown.slice(0, 40)) console.log("  " + f);
console.log(`MOVES CHECK ${plant ? "(planted: " + plant + ") " : ""}${faults.length ? "FAILED: " + faults.length + " faults" : "OK"} (${frames} frames)`);
process.exit(faults.length ? 1 : 0);
