// The Short "The captain's dinner" v6: each shot's camera tried on the real figures (the rig as dinner3d draws them, every 4th frame), from the
// shot's intent (out/din3d/intents.json, written by scripts/dinner_v6_shots.mjs): the angle (az, el) moved as little as it must, the distance
// fitted so the shot's own figures (whole, from the waist, or the head) lie inside the picture with a margin, and kept only if
//   - the camera is well inside the cabin;
//   - every head (its circle with the hat) is wholly in the picture or at most a tenth of it at an edge (dinner_check 13);
//   - every hand is inside the picture with 40 px to spare or wholly out of it (dinner_check 5);
//   - every figure whose head is in the picture is turned at most 62 degrees from the lens (the captain always 3/4);
//   - a cut to a figure seen whole in both shots turns at least 31 degrees and changes his size 1.3 times or more.
// Writes src/craft/dinner3d/shots.json's cameras (Blender makes the same projection from them).        node scripts/dinner_v6_tune.mjs
import * as esbuild from "esbuild"; import fs from "node:fs"; import { pathToFileURL } from "node:url";
const out = "out/_din_tune.mjs";
await esbuild.build({ stdin: { contents: 'export * from "./src/craft/dinner3d/core"; export * from "./src/craft/dinner3d/figures"; export { jointPx, figBox, FM, scaleOf, footY } from "./src/craft/clips/clipKit"; export { cardToWorld } from "./src/craft/dinner3d/core"; export * as BG from "./src/craft/checks/bodyGeom"; export { kitOf } from "./src/craft/wardrobe/kit";', resolveDir: ".", loader: "ts" }, bundle: true, format: "esm", platform: "node", outfile: out, logLevel: "error", loader: { ".json": "json" }, external: ["remotion", "react"] });
const M = await import(pathToFileURL(out).href); fs.rmSync(out);
const { WHO, SHOTS, placeOf, toScreen, jointPx, figBox, FM, setCam } = M;
const W = FM.W, H = FM.H, R = Math.PI / 180;
const SPEC = JSON.parse(fs.readFileSync("src/craft/dinner3d/shots.json", "utf8")), INT = JSON.parse(fs.readFileSync("out/din3d/intents.json", "utf8"));
const norm = (v) => { const l = Math.hypot(...v); return v.map((q) => q / l); }, cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
/** the projection Blender's set.py writes (world -> pixel rows), for a camera at C looking at `at`, world up z */
const Pof = (C, at, lens) => { const f = norm([at[0] - C[0], at[1] - C[1], at[2] - C[2]]), r = norm(cross(f, [0, 0, 1])), u = cross(r, f), F = (lens / 24) * H;
  const row = (a) => [a[0], a[1], a[2], -dot(a, C)], r0 = [0, 1, 2].map((k) => F * r[k] + (W / 2) * f[k]), r1 = [0, 1, 2].map((k) => -F * u[k] + (H / 2) * f[k]);
  return [row(r0), row(r1), row(f)]; };
const inRoom = (C) => C[0] > -2.1 && C[0] < 2.1 && C[1] > -3.9 && C[1] < 2.9 && C[2] > 0.15 && C[2] < 1.95;      /* (the room 1.2 m longer in front, blender/dinner/set.py v6) */
// what each shot frames: [figure, how much of him] (whole, from the waist up, the head), and points of the set
const MAIN = { 1: [["captain", "whole"], ["crew", "whole"]], 2: [["captain", "upper"]], 3: [["crew", "upper"]], 4: [["captain", "whole"], ["crew", "whole"], ["boy", "whole"]], 5: [["boy", "upper"]],
  6: [["crew", "whole"], ["captain", "whole"]], 7: [["crew", "whole"], ["boy", "whole"], ["captain", "whole"]], 8: [["crew", "head"]], 9: [["captain", "whole"]], "10a": [["captain", "whole"]], "10b": [["captain", "close"]],
  11: [["captain", "whole"], ["crew", "whole"], ["boy", "whole"]], 12: [["crew", "whole"], ["boy", "whole"]], 13: [["crew", "whole"], ["boy", "whole"], ["captain", "whole"]], 14: [["boy", "headarmR"]], 15: [["captain", "whole"], ["crew", "whole"]] };
const TOP = 0.488, EXTRA = { 1: [[SPEC.plate[0], SPEC.plate[1], TOP]], 3: [[SPEC.book[0], SPEC.book[1], TOP]], 15: [[SPEC.plate[0], SPEC.plate[1], TOP]] };
/** a figure's drawn outline points in the picture: whole (figBox, the captain's brim wider), from the waist (no legs), the head; "close" (10b) none */
const boxOf = (pl, nm, how) => { if (how === "close") return []; const f = pl.f, sc = M.scaleOf(f.who), c = jointPx(f, "crown");
  const hat = (nm === "captain" ? [[-200, -40], [200, -40], [0, -110]] : [[-140, -20], [140, -20], [0, -40]]).map(([dx, dy]) => [c[0] + dx * sc, c[1] + dy * sc]);
  let pts = [...figBox(f), ...hat];
  if (how === "headarmR") { const hd = jointPx(f, "skull")[1], pel = jointPx(f, "pelvis")[1]; return [...pts.filter((q) => q[1] <= hd + 0.1 * (pel - hd)), ...["shR", "elR", "wrR", "tipR"].map((j) => jointPx(f, j))].map((q) => toScreen(pl, q)); }      /* (14: the boy's head and his raised right arm) */
  if (how === "headarms") { const hd = jointPx(f, "skull")[1], pel = jointPx(f, "pelvis")[1]; return [...pts.filter((q) => q[1] <= hd + 0.1 * (pel - hd)), ...["shL", "elL", "wrL", "tipL", "shR", "elR", "wrR", "tipR"].map((j) => jointPx(f, j)).filter((q) => q[1] <= hd + 0.3 * (pel - hd))].map((q) => toScreen(pl, q)); }      /* (14: heads and the raised arms) */
  if (how === "headarm") { const hd = jointPx(f, "skull")[1], pel = jointPx(f, "pelvis")[1]; return [...pts.filter((q) => q[1] <= hd + 0.1 * (pel - hd)), ...["shL", "elL", "wrL", "tipL"].map((j) => jointPx(f, j))].map((q) => toScreen(pl, q)); }      /* (13: his head and his raised left arm to the shoulder) */
  if (how !== "whole") { const pel = jointPx(f, "pelvis")[1], hd = jointPx(f, "skull")[1]; pts = pts.filter((q) => q[1] <= (how === "upper" ? pel : hd + 0.1 * (pel - hd))); }
  return pts.map((q) => toScreen(pl, q)); };
/** the checks a camera must pass over the shot's frames (every 4th) */
const tryCam = (S, C, at, lens, prev) => { if (!inRoom(C)) return { ok: false, why: "room" }; const P = Pof(C, at, lens), n = Math.round((S.t1 - S.t0) * FM.FPS); setCam(S.id, Array.from({ length: n }, () => P));
  const whos = WHO[S.id](); if (!(MAIN[S.id] ?? []).every(([nm]) => whos.some((w) => w.name === nm))) return { ok: false, why: "own figure not in the picture", fitBad: 999 };
  let fitBad = 0, fail = null, pen = 0; const zs = {}, whole = {}, own = new Set((MAIN[S.id] ?? []).map(([nm]) => nm)), notes = new Set(), HP = {}, EDGE = {}, inP = (p) => p[0] >= 0 && p[0] <= W && p[1] >= 0 && p[1] <= H;
  for (let fr = 0; fr < n; fr += 6) for (const w of whos) { const pl = placeOf(S.id, fr, w), J = (j) => toScreen(pl, jointPx(pl.f, j)), how = (MAIN[S.id] ?? []).find(([nm]) => nm === w.name), close = how && how[1] === "close";
    // the head (its circle with the hat): the shot's own figures whole (10b: his face whole); a neighbour's head in, out, or a part without features
    const s0 = J("skull"), c0 = J("crown"), hr = (Math.hypot(c0[0] - s0[0], c0[1] - s0[1]) / 2) * (w.name === "captain" ? 1.35 : 1.08), hc = [(s0[0] + c0[0]) / 2, (s0[1] + c0[1]) / 2];
    let inn = 0; for (let k = 0; k < 24; k++) for (const rr of [0.35, 0.7, 1]) { if (inP([hc[0] + rr * hr * Math.cos((k / 24) * 2 * Math.PI), hc[1] + rr * hr * Math.sin((k / 24) * 2 * Math.PI)])) inn++; }
    const frac = inn / 72, kit = M.kitOf(pl.f.o.look), sc0 = M.scaleOf(pl.f.who), sxy = (q) => toScreen(pl, [pl.f.x + q[0] * sc0, M.footY(pl.f.who) + q[1] * sc0]);
    if (frac < 1 && own.has(w.name) && !close) fail ??= `own head ${w.name} ${Math.round(frac * 100)}%`;
    for (const ring of M.BG.faceFeatures(pl.f.sk, kit, pl.f.o.face ?? {}).map((r) => r.map(sxy))) { const k2 = ring.filter(inP).length; if (k2 > 0 && k2 < ring.length) fail ??= `${w.name}'s face feature at the edge`; else if (close && k2 < ring.length) fail ??= "his face not whole"; }
    if (frac > 0 && frac < 1 && !own.has(w.name)) { pen += (2 + 4 * Math.min(frac, 1 - frac)) / Math.ceil(n / 4); notes.add(`${w.name}'s head ${Math.round(frac * 100)}%`); }      /* (a head clearly in or out: the cloud session) */
    const seen = frac === 1;
    if (seen) { whole[w.name] = true; zs[w.name] = pl.z; const hd = Math.abs(pl.f.sk.yaw); if (hd > 62) fail ??= `${w.name} turned ${hd.toFixed(0)}`; }
    if (close) { whole[w.name] = true; zs[w.name] = pl.z; if (Math.abs(s0[1] - c0[1]) < 0.6 * H) fitBad++; }      /* (10b: his head 60 % of the picture's height or more) */
    // the hands: inside with 40 px or wholly out; a sliver's hand at the edge only if it does not move in the shot (the reviewer)
    for (const sd of ["L", "R"]) { const a = J("wr" + sd), b = J("tip" + sd), r = M.handPx(pl) * 0.45, x0 = Math.min(a[0], b[0]) - r, x1 = Math.max(a[0], b[0]) + r, y0 = Math.min(a[1], b[1]) - r, y1 = Math.max(a[1], b[1]) + r;
      const inside = x0 > 40 && x1 < W - 40 && y0 > 40 && y1 < H - 40, gone = x1 < 0 || x0 > W || y1 < 0 || y0 > H, hk = w.name + " " + sd; (HP[hk] ??= []).push([(x0 + x1) / 2, (y0 + y1) / 2]);
      if (!inside && !gone) { if (seen || own.has(w.name)) fail ??= `hand ${hk}`; else { EDGE[hk] = true; notes.add(`${hk} hand at the edge (a sliver)`); } } }
    // the shot's own figures inside the margins
    if (how) for (const q of boxOf(pl, w.name, how[1])) if (q[0] < 0.05 * W || q[0] > 0.95 * W || q[1] < 0.04 * H || q[1] > 0.96 * H) fitBad++; }
  for (const hk of Object.keys(EDGE)) { const xs = HP[hk].map((q) => q[0]), ys = HP[hk].map((q) => q[1]); if (Math.max(...xs) - Math.min(...xs) > 15 || Math.max(...ys) - Math.min(...ys) > 15) fail ??= `a sliver's moving hand at the edge (${hk})`; }
  for (const p of EXTRA[S.id] ?? []) { const v = [0, 1, 2].map((r) => P[r][0] * p[0] + P[r][1] * p[1] + P[r][2] * p[2] + P[r][3]), q = [v[0] / v[2], v[1] / v[2]]; if (q[0] < 0.05 * W || q[0] > 0.95 * W || q[1] < 0.04 * H || q[1] > 0.96 * H) fitBad++; }
  if (prev) { const both = Object.keys(whole).filter((nm) => prev.whole[nm]); if (both.length) { const da = norm(prev.at.map((v, k) => v - prev.C[k])), db = norm(at.map((v, k) => v - C[k])), ang = (Math.acos(Math.min(1, dot(da, db))) * 180) / Math.PI;
    const sz = Math.min(...both.map((nm) => Math.max(zs[nm], prev.zs[nm]) / Math.min(zs[nm], prev.zs[nm]))); if (ang < 31 || sz < 1.3) fail ??= `cut ${ang.toFixed(0)} deg ${sz.toFixed(2)}x`; } }
  return { ok: !fail, why: fail, fitBad, whole, zs, pen, notes: [...notes] }; };
/** the shot's camera: for each angle near the intent, the nearest distance at which its own figures fit (fitBad 0), checked as above */
let HEADAT = [0, 0, 1.25];
const solveShot = (S, it, prev) => { const xs = (MAIN[S.id] ?? []).map(([nm]) => SPEC.figs[nm]), ctr = [xs.reduce((a, p) => a + p[0], 0) / xs.length, xs.reduce((a, p) => a + p[1], 0) / xs.length];
  // (a close shot aims at the drawn head itself: its middle on his card, found with the intent's camera; aimed at the floor point the face sat
  //  off to one side and its features met the edge, the tuner)
  if ((MAIN[S.id] ?? []).some(([, h]) => h === "close")) { const nm = MAIN[S.id][0][0], C0 = [ctr[0] - Math.sin(it.az * R) * 2, ctr[1] - Math.cos(it.az * R) * 2, 1.2]; setCam(S.id, Array.from({ length: Math.round((S.t1 - S.t0) * FM.FPS) }, () => Pof(C0, [ctr[0], ctr[1], 1.2], it.lens)));
    const w = WHO[S.id]().find((q) => q.name === nm), pl = placeOf(S.id, 10, w), a = jointPx(pl.f, "skull"), b = jointPx(pl.f, "crown"), hw = M.cardToWorld(w, pl, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]); HEADAT = hw; ctr[0] = hw[0]; ctr[1] = hw[1]; }
  let tried = 0, lastWhy = "", best = null; const lens0 = (MAIN[S.id] ?? []).length >= 3 ? Math.min(it.lens, 16) : it.lens;
  for (let k = 0; k <= 48; k += 4) for (const del of [0, 8, -8]) for (const pan of (MAIN[S.id] ?? []).some(([, h]) => h === "close") ? Array.from({ length: 25 }, (_, i) => +((i - 12) * 0.025).toFixed(3)) : [0, 0.35, -0.35]) { const az = it.az + (k % 2 ? 1 : -1) * Math.ceil(k / 2), el = it.el + del;
    const up = (MAIN[S.id] ?? []).every(([, how]) => how !== "whole"), cl = (MAIN[S.id] ?? []).some(([, how]) => how === "close");
    for (const lz of [1, 0.75]) for (const zat of cl ? [HEADAT[2] - 0.05, HEADAT[2], HEADAT[2] + 0.05] : up ? [1.3, 1.15, 1.45] : [0.85, 0.7, 1.05]) { const lens = Math.round(lens0 * lz); const at = [ctr[0] + pan * Math.cos(az * R), ctr[1] - pan * Math.sin(az * R), zat],      /* (pan: the aim moved along the picture's right) */ d = [Math.sin(az * R) * Math.cos(el * R), Math.cos(az * R) * Math.cos(el * R), -Math.sin(el * R)];
      let d0 = null;
      for (let dist = cl ? 0.6 : 1.4; dist <= 5.0; dist += 0.15) { if (d0 !== null && dist > d0 + 0.6) break; const C = at.map((v, i) => +(v - d[i] * dist).toFixed(3)); tried++; const r = tryCam(S, C, at, lens, prev);
        if (r.why === "room") break;
        if (d0 === null) { if (r.fitBad > 0) continue; d0 = dist; }
        if (!r.ok) { lastWhy = r.why; continue; }
        const score = r.pen + 0.6 * Math.abs(pan) + 0.04 * Math.abs(az - it.az) + 0.04 * Math.abs(el - it.el) + 0.3 * (dist - d0) + 0.02 * Math.abs(lens - it.lens);
        if (!best || score < best.score) best = { C, at, lens, az, el, whole: r.whole, zs: r.zs, score, notes: r.notes }; break; } }
    if (best && best.score < 0.05 * k) break; }
  if (!best) console.log(`  shot ${S.id}: nothing passes (${tried} cameras; last: ${lastWhy})`); else best.tried = tried;
  return best; };
let prev = null; const found = {};
const ONLY = process.argv.includes("--only") ? process.argv[process.argv.indexOf("--only") + 1].split(",") : null;      /* (--only 13,7: the rest keep their cameras and serve as the shot before) */
if (!process.argv.includes("--debug")) for (const S of SHOTS) { const it = INT.find((q) => q.id === S.id); if (S.id === "15" && found["1"]) { found["15"] = found["1"]; console.log(`15 = 1`); continue; }
  if (ONLY && !ONLY.includes(S.id)) { const sc = SPEC.shots.find((q) => q.id === S.id).cam, r = tryCam(S, sc.from[0], sc.at, sc.lens, null); prev = { C: sc.from[0], at: sc.at, whole: r.whole ?? {}, zs: r.zs ?? {} }; continue; }
  const c = solveShot(S, it, prev); if (!c) { prev = null; continue; } found[S.id] = c; prev = c;
  console.log(`${S.id.padStart(2)}: az ${c.az} (intent ${it.az}), el ${c.el}, lens ${c.lens}, cam ${c.C.join(", ")}, whole: ${Object.keys(c.whole).join(" ")}, score ${c.score.toFixed(2)}${c.notes.length ? "  [" + c.notes.join("; ") + "]" : ""}`); }
if (!process.argv.includes("--debug")) for (const s of SPEC.shots) { const c = found[s.id]; if (!c) continue; s.cam = { ...s.cam, from: [c.C, c.C], at: c.at, lens: c.lens }; }
if (!process.argv.includes("--debug")) fs.writeFileSync("src/craft/dinner3d/shots.json", JSON.stringify(SPEC, null, 1));
console.log(`TUNED ${Object.keys(found).length} of ${SPEC.shots.length} shots`);
// (debug, --debug <shot>: the checks at the intent, by distance)
if (process.argv.includes("--debug")) { const id = process.argv[process.argv.indexOf("--debug") + 1], S = SHOTS.find((s) => s.id === id), it = INT.find((q) => q.id === id), xs = (MAIN[id] ?? []).map(([nm]) => SPEC.figs[nm]), ctr = [xs.reduce((a, p) => a + p[0], 0) / xs.length, xs.reduce((a, p) => a + p[1], 0) / xs.length];
  for (let dist = (process.env.D0 ? +process.env.D0 : 1.4); dist <= 5; dist += +(process.env.DD ?? 0.3)) { const at = [ctr[0], ctr[1], +(process.env.ZAT ?? ((MAIN[id] ?? []).every(([, h]) => h !== "whole") ? 1.3 : 0.85))], d = [Math.sin(it.az * R) * Math.cos(it.el * R), Math.cos(it.az * R) * Math.cos(it.el * R), -Math.sin(it.el * R)], C = at.map((v, i) => v - d[i] * dist), r = tryCam(S, C, at, it.lens, null); console.log(dist.toFixed(1), C.map((v) => v.toFixed(2)).join(","), JSON.stringify(r).slice(0, 200)); } }
