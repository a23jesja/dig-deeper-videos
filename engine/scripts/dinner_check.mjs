// The Short "The captain's dinner": the checks of impossible things, every frame of every shot.
//   1  seat: the seated captain's drawn seat (the lowest of his thighs' undersides at the pelvis) lies on his stool's top, within 1 cm
//   2  feet: no foot point below the floor (0.5 cm); a foot point at floor height is drawn on the floor's line (within 3 px)
//   3  the pudding: in every held shot the crewman's grip is under the pudding (the place Blender put it), within 1 cm
//   4  the table: the captain's hands on the table (shot 7) lie on its top: no point of the hand under the top (0.5 cm) or more than 3 cm over it
//   5  frame edges: a hand is inside the picture with a margin, or wholly out of it
//   8  no face covered: a farther figure's face is never under a nearer figure
//   7  nobody missing: a figure of the room not drawn in a shot is wholly out of its picture
//   6  words: the caption band between 15 % and 85 % of the height, never over a face (the head's circle below the cap) or a hand
//   +  writes the root for the frozen measures (motion2, flicker2, and step 1's depth check): out/din3d/root
// Planted faults (each must fail): --plant seatHigh (the seat 5 cm over the stool), pudOff (the grip 3 cm off the pudding), handIn (the
// hands 4 cm into the table top), float (a figure 12 px over the floor), capLow (the words in the bottom 15 %).
//   node scripts/dinner_check.mjs [--plant seatHigh|pudOff|handIn|float|capLow]
import * as esbuild from "esbuild"; import fs from "node:fs"; import path from "node:path"; import { pathToFileURL } from "node:url";
const arg = (k) => (process.argv.includes(k) ? process.argv[process.argv.indexOf(k) + 1] : null), plant = arg("--plant");
const out = "out/_din_check.mjs";
await esbuild.build({ stdin: { contents: 'export * from "./src/craft/dinner3d/core"; export * from "./src/craft/dinner3d/figures"; export { captionAt, CAP_TOPS } from "./src/craft/dinner3d/Dinner3D"; export { thighUnder, scaleOf, D, FM, jointPx, footY, heightOf } from "./src/craft/clips/clipKit";', resolveDir: ".", loader: "tsx" }, bundle: true, format: "esm", platform: "node", outfile: out, logLevel: "error", loader: { ".json": "json" }, external: ["remotion", "react"] });
const M = await import(pathToFileURL(out).href); fs.rmSync(out);
const { SHOTS, WHO, PLANT, placeOf, toScreen, feetOf, project, jointPx, handPx, FM, cardToWorld, thighUnder, scaleOf, D, captionAt, PUD_UP, TABLE_TOP } = M;
if (plant && plant !== "capLow") { if (!(plant in PLANT)) throw new Error("no such planted fault: " + plant); PLANT[plant] = true; }
const SEAT = JSON.parse(fs.readFileSync("src/craft/dinner3d/props/seat.json", "utf8")).things[0].frames[0], STOOL_TOP = SEAT[2];
const faults = [], dump = {}, regions = [], fig0 = {}; let frames = 0, F0 = 0;
const hull = (P) => { const p = [...P].sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], up = [];
  for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (const q of p.reverse()) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); } return [...lo.slice(0, -1), ...up.slice(0, -1)]; };
const worst = { seat: 0, grip: 0, table: [9, -9] };
for (const S of SHOTS) {
  const n = Math.round((S.t1 - S.t0) * FM.FPS), whos = WHO[S.id](); dump[S.id] = [];
  const PUD = JSON.parse(fs.readFileSync(`src/craft/dinner3d/props/${S.id}.json`, "utf8")).things[0].frames;
  for (let fr = 0; fr < n; fr++) { frames++; const row = [], T = S.t0 + fr / FM.FPS;
    const placed = whos.map((w) => ({ w, pl: placeOf(S.id, fr, w) })), heads = [], hands = [];
    for (const { w, pl } of placed) {
      const f = pl.f, scr = (j) => toScreen(pl, jointPx(f, j)), key = S.id + ":" + w.name;
      { const P = (j) => scr(j).map((v) => Math.round(v)), s0 = scr("skull"), c0 = scr("crown"), hr = Math.hypot(c0[0] - s0[0], c0[1] - s0[1]) / 2, lw = Math.round(0.17 * hr);
        heads.push([(s0[0] + c0[0]) / 2, (s0[1] + c0[1]) / 2, hr * 1.1]);
        const limbs = ["L", "R"].flatMap((d) => [[P("sh" + d), P("el" + d)], [P("el" + d), P("wr" + d)], [P("wr" + d), P("tip" + d)], [P("hip" + d), P("kn" + d)], [P("kn" + d), P("an" + d)], [P("an" + d), P("toe" + d)], [P("heel" + d), P("toe" + d)]]);
        // (each joint's own depth: the figure's floor point's depth less how far the joint stands toward the lens in the rig (sk.z), in metres)
        const kz = (scaleOf("sir") / FM.PPM) * (w.h / M.heightOf("sir")), jd = (j) => +(project(S.id, fr, cardToWorld(w, pl, jointPx(f, j)))[2] - ((f.sk.z[j] ?? 0) - f.sk.z.pelvis) * kz).toFixed(3);      /* (the joint's own point on his card, at its height: under a tilted lens a hand at 35 cm is 12 cm nearer than the floor point) */      /* (from the pelvis: the card stands on his pelvis's floor point) */
        const limbD = ["L", "R"].flatMap((d) => [["sh" + d, "el" + d], ["el" + d, "wr" + d], ["wr" + d, "tip" + d], ["hip" + d, "kn" + d], ["kn" + d, "an" + d], ["an" + d, "toe" + d], ["heel" + d, "toe" + d]]).map(([a, b]) => Math.min(jd(a), jd(b)));
        row.push({ name: key, sil: false, depth: pl.depth, limbDepth: limbD, headDepth: jd("skull"), head: [Math.round((s0[0] + c0[0]) / 2), Math.round((s0[1] + c0[1]) / 2), Math.round(hr * 1.1)], headF: [+((s0[0] + c0[0]) / 2).toFixed(2), +((s0[1] + c0[1]) / 2).toFixed(2)],
          trunk: hull(["neck", "shL", "shR", "hipL", "hipR"].map((j) => scr(j))).map((q) => q.map((v) => Math.round(v))), limbs, lw });
        fig0[key] = w.at; }
      // 1 the seat
      if (w.name === "captain") { const TH = D.props("sir").thigh * scaleOf("sir"), px0 = jointPx(f, "pelvis")[0], under = thighUnder(f).filter(([x]) => Math.abs(x - px0) < 0.33 * TH), low = under.reduce((a, b) => (b[1] > a[1] ? b : a)), h = cardToWorld(w, pl, low)[2];
        worst.seat = Math.max(worst.seat, Math.abs(h - STOOL_TOP)); if (Math.abs(h - STOOL_TOP) > 0.01) faults.push(`1 ${S.id} frame ${fr}: the captain's seat ${((h - STOOL_TOP) * 100).toFixed(1)} cm ${h > STOOL_TOP ? "over" : "into"} the stool`); }
      // 2 the feet
      for (const ft of feetOf(S.id, fr, w, pl)) for (const [pt, px, nm] of [[ft.heel, ft.heelPx, "heel"], [ft.toe, ft.toePx, "toe"]]) {
        if (pt[2] < -0.005) faults.push(`2 ${S.id} frame ${fr} ${w.name} ${ft.side} ${nm}: ${(-pt[2] * 100).toFixed(1)} cm into the floor`);
        if (pt[2] <= 0.005) { const fl = project(S.id, fr, [pt[0], pt[1], Math.max(0, pt[2])]), dv = px[1] - fl[1]; if (Math.abs(dv) > 3 && px[1] > 0 && px[1] < FM.H) faults.push(`2 ${S.id} frame ${fr} ${w.name} ${ft.side} ${nm}: drawn ${Math.abs(dv).toFixed(1)} px ${dv > 0 ? "into" : "above"} the floor`); } }
      // 3 the pudding in the crewman's hand
      if (w.name === "crew" && PUD[0][3]) { const q = PUD[Math.min(fr, PUD.length - 1)], nn = f.sk.near, W = jointPx(f, "wr" + nn), Tp = jointPx(f, "tip" + nn), g = cardToWorld(w, pl, [W[0] + 0.45 * (Tp[0] - W[0]), W[1] + 0.45 * (Tp[1] - W[1])]);
        const d = Math.hypot(g[0] - q[0], g[1] - q[1], g[2] - (q[2] - PUD_UP)); worst.grip = Math.max(worst.grip, d); if (d > 0.01) faults.push(`3 ${S.id} frame ${fr}: the crewman's grip ${(d * 100).toFixed(1)} cm from the pudding`); }
      // 4 the hands on the table (shot 7)
      if (w.name === "captain" && S.id === "7") for (const sd of ["L", "R"]) for (const j of ["wr" + sd, "tip" + sd]) { const p = cardToWorld(w, pl, jointPx(f, j)), dz = p[2] - TABLE_TOP;
        worst.table = [Math.min(worst.table[0], dz), Math.max(worst.table[1], dz)];
        if (p[0] < -0.6 && (dz < -0.005 || dz > 0.03)) faults.push(`4 ${S.id} frame ${fr}: the captain's ${j} ${(dz * 100).toFixed(1)} cm ${dz < 0 ? "into" : "over"} the table top`); }
      // 5 the edges
      for (const sd of ["L", "R"]) { const wr = scr("wr" + sd), tp = scr("tip" + sd), r = handPx(pl) * 0.45,      /* (half a hand round the line from wrist to fingertips: the open hand is about as wide as half its length) */ xs = [wr[0], tp[0]], ys = [wr[1], tp[1]];
        hands.push([Math.min(...xs) - r, Math.min(...ys) - r, Math.max(...xs) + r, Math.max(...ys) + r]);
        const inside = Math.min(...xs) - r > 40 && Math.max(...xs) + r < FM.W - 40 && Math.min(...ys) - r > 40 && Math.max(...ys) + r < FM.H - 40, gone = Math.max(...xs) + r < 0 || Math.min(...xs) - r > FM.W || Math.max(...ys) + r < 0 || Math.min(...ys) - r > FM.H;
        if (!inside && !gone) faults.push(`5 ${S.id} frame ${fr} ${w.name}: his ${sd} hand cut by the picture's edge`); }
    }
    // 8 no face covered: a farther figure's face (the head's circle below its cap, 0.8 of its radius) is not under a nearer figure's body (the
    //  hull of its joints and the head's circle) in any frame
    { const geo = placed.map(({ w, pl }) => { const J = (j) => toScreen(pl, jointPx(pl.f, j)), s0 = J("skull"), c0 = J("crown"), hr = Math.hypot(c0[0] - s0[0], c0[1] - s0[1]) / 2;
        const body = hull(["neck", "shL", "shR", "elL", "elR", "wrL", "wrR", "tipL", "tipR", "hipL", "hipR", "knL", "knR", "anL", "anR"].map(J));
        return { name: w.name, depth: pl.depth, hc: [(s0[0] + c0[0]) / 2, (s0[1] + c0[1]) / 2], r: hr * 1.1, body }; });
      const inPoly = (pt, P) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) if ((P[i][1] > pt[1]) !== (P[j][1] > pt[1]) && pt[0] < ((P[j][0] - P[i][0]) * (pt[1] - P[i][1])) / (P[j][1] - P[i][1]) + P[i][0]) c = !c; return c; };
      for (const far of geo) for (const near of geo) { if (near === far || near.depth >= far.depth) continue;
        const pts = []; for (let k = 0; k < 16; k++) { const a = (k / 16) * Math.PI * 2; for (const rr of [0, 0.4, 0.8]) pts.push([far.hc[0] + Math.cos(a) * rr * far.r, far.hc[1] + 0.25 * far.r + Math.sin(a) * rr * far.r * 0.75]); }
        const hit = pts.filter((q) => inPoly(q, near.body) || Math.hypot(q[0] - near.hc[0], q[1] - near.hc[1]) < near.r).length;
        if (hit > 2) faults.push(`8 ${S.id} frame ${fr}: the ${far.name}'s face is under the ${near.name} (${hit} of ${pts.length} points)`); } }
    // 7 nobody missing: a figure of the room that is not drawn in a shot must be wholly out of its picture (his head and feet projected)
    if (fr === 0) for (const nm of ["captain", "crew", "boy"]) { if (whos.some((w) => w.name === nm)) continue; const at = M.FIGS[nm], hh = nm === "boy" ? 1.5 : 1.75;
      for (const [dx, z] of [[0, 0], [0, hh * 0.5], [0, hh], [-0.35, hh * 0.6], [0.35, hh * 0.6], [-0.3, 0.3], [0.3, 0.3]]) { const q = project(S.id, 0, [at[0] + dx, at[1], z]); if (q[2] > 0 && q[0] > -20 && q[0] < FM.W + 20 && q[1] > -20 && q[1] < FM.H + 20) { faults.push(`7 ${S.id}: the ${nm} stands in the picture but is not drawn`); break; } } }
    // 6 the words
    const c = captionAt(T); if (c) { const b = [...c.box]; if (plant === "capLow") { b[1] += 300; b[3] += 300; }
      if (b[1] < 0.15 * FM.H || b[3] > 0.85 * FM.H) faults.push(`6 ${S.id} frame ${fr}: "${c.text}" outside 15-85 % (${Math.round(b[1])}-${Math.round(b[3])})`);
      for (const h of heads) { const cx = Math.max(b[0], Math.min(h[0], b[2])), cy = Math.max(b[1], Math.min(h[1], b[3])); if (Math.hypot(cx - h[0], cy - h[1]) < h[2] && b[3] > h[1] - 0.45 * h[2]) {      /* (the face: the head's circle below its cap, which covers its top 0.55) */ faults.push(`6 ${S.id} frame ${fr}: "${c.text}" over a face`); break; } }
      for (const hb of hands) if (hb[0] < b[2] && hb[2] > b[0] && hb[1] < b[3] && hb[3] > b[1] && hb[2] > 0 && hb[0] < FM.W) { faults.push(`6 ${S.id} frame ${fr}: "${c.text}" over a hand`); break; } }
    regions.push({ F: F0 + fr, shot: S.id, eyes: placed.map((p) => { const J = (j) => toScreen(p.pl, jointPx(p.pl.f, j)), a = J("skull"), b = J("crown"), r = Math.hypot(b[0] - a[0], b[1] - a[1]) / 2, yaw = (p.pl.f.sk.faceYaw * Math.PI) / 180;
      return [Math.round((a[0] + b[0]) / 2 + 0.5 * r * Math.sin(yaw)), Math.round((a[1] + b[1]) / 2 + 0.05 * r), Math.round(0.5 * r)]; }), text: c ? [[Math.round(c.box[0] - 10), Math.round(c.box[1] - 6), Math.round(c.box[2] + 10), Math.round(c.box[3] + 6)]] : [] });
    dump[S.id].push(row); }
  F0 += n; }
if (!plant) {
  const R = "out/din3d/root"; fs.mkdirSync(path.join(R, "out/cab3d"), { recursive: true }); fs.mkdirSync(path.join(R, "src/craft/cabin3d/cam"), { recursive: true });
  fs.writeFileSync(path.join(R, "out/cab3d/figs.json"), JSON.stringify(dump));
  const spec = JSON.parse(fs.readFileSync("src/craft/dinner3d/shots.json", "utf8")); spec.figs = fig0;
  spec.shots = spec.shots.map((s) => ({ ...s, cam: { ...s.cam, focus: s.id + ":" + s.cam.focus } }));
  fs.writeFileSync(path.join(R, "src/craft/cabin3d/shots.json"), JSON.stringify(spec, null, 1));
  const CAMS = JSON.parse(fs.readFileSync("src/craft/dinner3d/cams.json", "utf8"));
  for (const s of spec.shots) { const n = Math.round((s.t1 - s.t0) * 30), fr = CAMS[s.id]; fs.writeFileSync(path.join(R, `src/craft/cabin3d/cam/${s.id}.json`), JSON.stringify({ id: s.id, frames: Array.from({ length: n }, (_, k) => fr[Math.min(k, fr.length - 1)]) }));
    const mp = `out/din3d/${s.id}/map.npz`; if (fs.existsSync(mp)) { fs.mkdirSync(path.join(R, "out/cab3d", s.id), { recursive: true }); fs.copyFileSync(mp, path.join(R, "out/cab3d", s.id, "map.npz")); } }
  fs.writeFileSync("out/din3d/regions.jsonl", regions.map((r) => JSON.stringify(r)).join("\n") + "\n");
}
const seen = new Set(), shown = [];
for (const f of faults) { const k = f.replace(/frame \d+/, "").replace(/-?[\d.]+ (px|cm)/g, "").replace(/\(\d+-\d+\)/, ""); if (!seen.has(k)) { seen.add(k); shown.push(f); } }
for (const f of shown.slice(0, 40)) console.log("  " + f);
const by = {}; for (const f of faults) { const k = f.split(" ").slice(0, 2).join(" "); by[k] = (by[k] ?? 0) + 1; } console.log(JSON.stringify(by));
console.log(`worst: seat ${(worst.seat * 100).toFixed(2)} cm from the stool, grip ${(worst.grip * 100).toFixed(2)} cm from the pudding, hands on the table ${(worst.table[0] * 100).toFixed(1)} to ${(worst.table[1] * 100).toFixed(1)} cm over its top`);
console.log(`DINNER CHECK ${plant ? "(planted: " + plant + ") " : ""}${faults.length ? "FAILED: " + faults.length + " faults" : "OK"} (${frames} frames)`);
process.exit(faults.length ? 1 : 0);
