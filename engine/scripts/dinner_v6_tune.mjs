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
const MAIN = { 1: [["crew", "upper"], ["captain", "upper"]], 2: [["captain", "upper"]], 3: [["crew", "upper"]], 4: [["crew", "upper"]], 5: [["boy", "upper"]],
  7: [["crew", "upper"]], 8: [["crew", "upper"]], 9: [["captain", "upper"]], "10b": [["captain", "close"]],
  11: [["captain", "upper"]], 12: [["crew", "upper"]], 13: [["crew", "upper"]], 14: [["boy", "upper"]], "15a": [["crew", "upper"], ["boy", "upper"]], "15b": [["captain", "upper"]] };      /* (15a: an insert of the table, the two fists (the cloud session's two-shot had a face under another from every side)) */      /* (the vote split in two (the cloud session, 26 Nov): with three Knopp heads in one picture a face was always under another) */
/** the composition (the reviewer, 25 Nov, the style test's standard): the shot's own figures fill 60-90 % of the picture's height, the empty
 *  space over the highest head no larger than a quarter of it; a figure framed from the waist runs on to the picture's foot */
const FILL_MIN = +(process.env.FILL_MIN ?? 0.6), TOP_MAX = 0.4;      // (the reviewer: the empty space over the heads no larger than the figures)
const TOP = 0.488, EXTRA = { 1: [[SPEC.plate[0], SPEC.plate[1], TOP]], 3: [[SPEC.book[0], SPEC.book[1], TOP]], 9: [[-0.7, 1.02, TOP], [-0.78, 1.0, TOP]], "15a": [[-1.22, 0.92, TOP]] };      /* (9: where his fist lands; 15: where the two fists land) */
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
  let fitBad = 0, fail = null, pen = 0; const STATE8 = {}, FILLY = {}, TOPY = {}, zs = {}, whole = {}, own = new Set((MAIN[S.id] ?? []).map(([nm]) => nm)), notes = new Set(), HP = {}, EDGE = {}, inP = (p) => p[0] >= 0 && p[0] <= W && p[1] >= 0 && p[1] <= H;
  for (let fr = 0; fr < n; fr += 6) for (const w of whos) { const pl = placeOf(S.id, fr, w), J = (j) => toScreen(pl, jointPx(pl.f, j)), how = (MAIN[S.id] ?? []).find(([nm]) => nm === w.name), close = how && how[1] === "close";
    // the head (its circle with the hat): the shot's own figures whole (10b: his face whole); a neighbour's head in, out, or a part without features
    const s0 = J("skull"), c0 = J("crown"), hr = (Math.hypot(c0[0] - s0[0], c0[1] - s0[1]) / 2) * (w.name === "captain" ? 1.35 : 1.08), hc = [(s0[0] + c0[0]) / 2, (s0[1] + c0[1]) / 2];
    let inn = 0; for (let k = 0; k < 24; k++) for (const rr of [0.35, 0.7, 1]) { if (inP([hc[0] + rr * hr * Math.cos((k / 24) * 2 * Math.PI), hc[1] + rr * hr * Math.sin((k / 24) * 2 * Math.PI)])) inn++; }
    const frac = inn / 72, kit = M.kitOf(pl.f.o.look), sc0 = M.scaleOf(pl.f.who), sxy = (q) => toScreen(pl, [pl.f.x + q[0] * sc0, M.footY(pl.f.who) + q[1] * sc0]);
    if (frac < 1 && own.has(w.name) && !close) fail ??= `own head ${w.name} ${Math.round(frac * 100)}%`;
    for (const ring of M.BG.faceFeatures(pl.f.sk, kit, pl.f.o.face ?? {}).map((r) => r.map(sxy))) { const k2 = ring.filter(inP).length; if (k2 > 0 && k2 < ring.length) fail ??= `${w.name}'s face feature at the edge`; else if (close && k2 < ring.length) fail ??= "his face not whole"; }
    if (frac > 0.25 && frac < 1 && !own.has(w.name)) fail ??= `${w.name}'s head ${Math.round(frac * 100)}% in the picture`;      /* (a neighbour at the edge: a sliver of a quarter of his head or less, or whole: the reviewer 26 Nov, rule 13) */
    if (frac > 0 && frac < 1 && !own.has(w.name)) { pen += (2 + 4 * Math.min(frac, 1 - frac)) / Math.ceil(n / 4); notes.add(`${w.name}'s head ${Math.round(frac * 100)}%`); }      /* (a head clearly in or out: the cloud session) */
    const seen = frac === 1;
    if (seen) { whole[w.name] = true; zs[w.name] = pl.z; const hd = Math.abs(pl.f.sk.yaw); if (hd > 62) fail ??= `${w.name} turned ${hd.toFixed(0)}`; }
    if (close) { whole[w.name] = true; zs[w.name] = pl.z; if (Math.abs(s0[1] - c0[1]) < 0.6 * H) fitBad++; }      /* (10b: his head 60 % of the picture's height or more) */
    // the hands: inside with 40 px or wholly out; a sliver's hand at the edge only if it does not move in the shot (the reviewer)
    for (const sd of ["L", "R"]) { const a = J("wr" + sd), b = J("tip" + sd), r = M.handPx(pl) * 0.45, x0 = Math.min(a[0], b[0]) - r, x1 = Math.max(a[0], b[0]) + r, y0 = Math.min(a[1], b[1]) - r, y1 = Math.max(a[1], b[1]) + r;
      const inside = x0 > 40 && x1 < W - 40 && y0 > 40 && y1 < H - 40, gone = x1 < 0 || x0 > W || y1 < 0 || y0 > H, hk = w.name + " " + sd; (HP[hk] ??= []).push([(x0 + x1) / 2, (y0 + y1) / 2]);
      const shp = J("sh" + sd), shIn = shp[0] > 0 && shp[0] < W && shp[1] > 0 && shp[1] < H;
      if (!inside && !gone) { if (seen || own.has(w.name) || !shIn) fail ??= `hand ${hk}`; else { EDGE[hk] = true; notes.add(`${hk} hand at the edge (a sliver)`); } } }      /* (a lone hand at the edge, its arm out of the picture, fails: Eiffel v11) */
    // the shot's own figures inside the margins
    if (how) { const bx = boxOf(pl, w.name, how[1]); for (const q of bx) if (q[0] < 0.05 * W || q[0] > 0.95 * W || q[1] < 0.04 * H || q[1] > 0.96 * H) fitBad++;
      if (bx.length) { const ys = bx.map((q) => q[1]), feet = Math.max(...boxOf(pl, w.name, "whole").map((q) => q[1])); FILLY[`${fr}:${w.name}`] = [Math.min(...ys), Math.min(H, feet)]; TOPY[fr] = Math.min(TOPY[fr] ?? 1e9, ...ys); } } }      /* (v6c: each own figure fills 60 % from his head to his own feet or the picture's foot: before, a waist-up figure counted the floor under him to the foot, and 15a passed at 37 and 47 %, the reviewer 26 Nov) */
  // (rule 8 in the tuner: no own figure's face under a figure nearer the lens, its head, its torso or its arms: the boy behind the table was hidden
  //  by the sailor or by the captain in the foreground, the stills of 25 Nov)
  for (let fr = 0; fr < n; fr += 6) { const pls = whos.map((w) => ({ w, pl: placeOf(S.id, fr, w) }));
    for (const A of pls) { const J = (pl, j) => toScreen(pl, jointPx(pl.f, j)),      /* (every face in the picture, not only the shot's own: dinner_check's rule 8 fails a background face under a nearer figure too) */ s0 = J(A.pl, "skull"), c0 = J(A.pl, "crown"), hr = Math.hypot(c0[0] - s0[0], c0[1] - s0[1]) / 2, hc = [(s0[0] + c0[0]) / 2, (s0[1] + c0[1]) / 2];
      const pts = []; for (let k = 0; k < 16; k++) for (const rr of [0.2, 0.5, 0.75]) pts.push([hc[0] + rr * hr * Math.cos((k / 16) * 2 * Math.PI), hc[1] + 0.15 * hr + rr * hr * Math.sin((k / 16) * 2 * Math.PI)]);      /* (rule 8 is about faces: the face, below the hat, for every figure, as dinner_check) */      /* (a background figure: his whole head with its hair and ears, the reviewer) */
      for (const B of pls) { if (B === A || B.pl.depth >= A.pl.depth) continue; const b0 = J(B.pl, "skull"), b1 = J(B.pl, "crown"), hb = Math.hypot(b1[0] - b0[0], b1[1] - b0[1]) / 2, bc = [(b0[0] + b1[0]) / 2, (b0[1] + b1[1]) / 2];
        const caps = [[bc, bc, hb * 1.1], [J(B.pl, "neck"), J(B.pl, "pelvis"), hb * 0.8]]; for (const sd of ["L", "R"]) { caps.push([J(B.pl, "sh" + sd), J(B.pl, "el" + sd), hb * 0.3]); caps.push([J(B.pl, "el" + sd), J(B.pl, "tip" + sd), hb * 0.32]); }
        const inCap = (p) => caps.some(([u, v, r]) => { const dx = v[0] - u[0], dy = v[1] - u[1], L = dx * dx + dy * dy || 1, t = Math.max(0, Math.min(1, ((p[0] - u[0]) * dx + (p[1] - u[1]) * dy) / L)); return Math.hypot(p[0] - u[0] - t * dx, p[1] - u[1] - t * dy) < r; });
        const hid = pts.filter((p) => inCap(p) && p[0] >= 0 && p[0] <= W && p[1] >= 0 && p[1] <= H).length, frac = hid / pts.length;      /* (the shot's own: nothing hidden; a background face clearly seen (10 % or less hidden) or clearly hidden (85 % or more), as the edge rule) */
        if (own.has(A.w.name)) { if (hid > 3) fail ??= `${A.w.name}'s face under the ${B.w.name}`; }
        else if (hid > 3) fail ??= `${A.w.name}'s head under the ${B.w.name}`; } } }      /* (rule 8 in full for every face: the reviewer, 26 Nov) */
  for (const [nm, set] of Object.entries(STATE8)) if (set.size > 1) fail ??= `${nm} seen and hidden in one shot`;      /* (the same state through the shot, the reviewer) */
  // (12-13: the boy walks off-picture: neither his place nor the table's end where he arrives may be in these pictures)
  if (M.BOY_WALKING.includes(S.id)) for (const [x, y] of Array.from({ length: 9 }, (_, k) => [SPEC.figs.boy[0] + ((M.BOY_TABLE[0] - SPEC.figs.boy[0]) * k) / 8, SPEC.figs.boy[1] + ((M.BOY_TABLE[1] - SPEC.figs.boy[1]) * k) / 8])) for (const z of [0, 0.5, 1.0, 1.42]) for (const dx of [-0.35, 0, 0.35]) {      /* (his whole way, a corridor of his width and height: no empty floor where he should be walking, the reviewer) */ const v = [0, 1, 2].map((r) => P[r][0] * (x + dx) + P[r][1] * y + P[r][2] * z + P[r][3]); if (v[2] > 0) { const q = [v[0] / v[2], v[1] / v[2]]; if (q[0] > -40 && q[0] < W + 40 && q[1] > -40 && q[1] < H + 40) fail ??= "the boy's places in the picture"; } }
  // (the loop's seam: the last shot to the first is a cut like the others, the cloud session 25 Nov)
  if (S.id === SPEC.shots[SPEC.shots.length - 1].id) { const f = SPEC.shots[0].cam, da = norm(f.at.map((v, k) => v - f.from[0][k])), db = norm(at.map((v, k) => v - C[k])), ang = (Math.acos(Math.min(1, dot(da, db))) * 180) / Math.PI; if (ang < 31) fail ??= `loop cut ${ang.toFixed(0)} deg`; }
  for (const [k, [y0, y1]] of Object.entries(FILLY)) { const fill = (Math.min(H, y1) - Math.max(0, y0)) / H; if (fill < FILL_MIN) fail ??= `fill ${k.split(":")[1]} ${Math.round(fill * 100)}%`; }
  for (const y0 of Object.values(TOPY)) if (y0 > TOP_MAX * H) fail ??= `empty top ${Math.round((100 * y0) / H)}%`;
  for (const hk of Object.keys(EDGE)) { const xs = HP[hk].map((q) => q[0]), ys = HP[hk].map((q) => q[1]); if (Math.max(...xs) - Math.min(...xs) > 15 || Math.max(...ys) - Math.min(...ys) > 15) fail ??= `a sliver's moving hand at the edge (${hk})`; }
  for (const p of EXTRA[S.id] ?? []) { const v = [0, 1, 2].map((r) => P[r][0] * p[0] + P[r][1] * p[1] + P[r][2] * p[2] + P[r][3]), q = [v[0] / v[2], v[1] / v[2]]; if (q[0] < 0.05 * W || q[0] > 0.95 * W || q[1] < 0.04 * H || q[1] > 0.96 * H) fitBad++; }
  if (prev) { const both = Object.keys(whole).filter((nm) => prev.whole[nm]); if (both.length) { const da = norm(prev.at.map((v, k) => v - prev.C[k])), db = norm(at.map((v, k) => v - C[k])), ang = (Math.acos(Math.min(1, dot(da, db))) * 180) / Math.PI;
    const sz = Math.min(...both.map((nm) => Math.max(zs[nm], prev.zs[nm]) / Math.min(zs[nm], prev.zs[nm]))); if (ang < 31 || sz < 1.3) fail ??= `cut ${ang.toFixed(0)} deg ${sz.toFixed(2)}x`; } }
  return { ok: !fail, why: fail, fitBad, whole, zs, pen, notes: [...notes] }; };
/** the shot's camera: for each angle near the intent, the nearest distance at which its own figures fit (fitBad 0), checked as above */
let HEADAT = [0, 0, 1.25];
const solveShot = (S, it, prev) => { const xs = (MAIN[S.id] ?? []).length ? (MAIN[S.id] ?? []).map(([nm]) => SPEC.figs[nm]) : (EXTRA[S.id] ?? []).map((p) => [p[0], p[1]]), ctr = [xs.reduce((a, p) => a + p[0], 0) / xs.length, xs.reduce((a, p) => a + p[1], 0) / xs.length];
  // (a close shot aims at the drawn head itself: its middle on his card, found with the intent's camera; aimed at the floor point the face sat
  //  off to one side and its features met the edge, the tuner)
  if ((MAIN[S.id] ?? []).some(([, h]) => h === "close")) { const nm = MAIN[S.id][0][0], C0 = [ctr[0] - Math.sin(it.az * R) * 2, ctr[1] - Math.cos(it.az * R) * 2, 1.2]; setCam(S.id, Array.from({ length: Math.round((S.t1 - S.t0) * FM.FPS) }, () => Pof(C0, [ctr[0], ctr[1], 1.2], it.lens)));
    const w = WHO[S.id]().find((q) => q.name === nm), pl = placeOf(S.id, 10, w), a = jointPx(pl.f, "skull"), b = jointPx(pl.f, "crown"), hw = M.cardToWorld(w, pl, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]); HEADAT = hw; ctr[0] = hw[0]; ctr[1] = hw[1]; }
  let tried = 0, lastWhy = "", best = null; const lens0 = (MAIN[S.id] ?? []).length >= 3 ? Math.min(it.lens, 16) : it.lens;
  for (let k = 0; k <= 48; k += 4) for (const del of [0, 8, -8]) for (const pan of (MAIN[S.id] ?? []).some(([, h]) => h === "close") ? Array.from({ length: 25 }, (_, i) => +((i - 12) * 0.025).toFixed(3)) : [0, 0.35, -0.35]) { const az = it.az + (k % 2 ? 1 : -1) * Math.ceil(k / 2), el = it.el + del;
    const up = (MAIN[S.id] ?? []).every(([, how]) => how !== "whole"), cl = (MAIN[S.id] ?? []).some(([, how]) => how === "close");
    for (const lz of [1, 0.75]) for (const zat of !(MAIN[S.id] ?? []).length ? [0.55, 0.62] : cl ? [HEADAT[2] - 0.05, HEADAT[2], HEADAT[2] + 0.05] : up ? [1.15, 1.0, 0.85, 1.3, 0.75] : [0.85, 0.7, 1.05]      /* (from the waist: aimed at the chest too, so the head sits near the top (the empty top, the reviewer 25 Nov)) */) { const lens = Math.round(lens0 * lz); const at = [ctr[0] + pan * Math.cos(az * R), ctr[1] - pan * Math.sin(az * R), zat],      /* (pan: the aim moved along the picture's right) */ d = [Math.sin(az * R) * Math.cos(el * R), Math.cos(az * R) * Math.cos(el * R), -Math.sin(el * R)];
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
// (--audit: every shot's present camera through every check, nothing written: which shots the stricter rules fail)
if (process.argv.includes("--audit")) { for (const S of SHOTS) { const sc = SPEC.shots.find((q) => q.id === S.id).cam, r = tryCam(S, sc.from[0], sc.at, sc.lens, S.id === "10b" ? null : prev);
    console.log(`AUDIT ${S.id}: ${r.ok ? "ok" : "FAIL " + (r.why ?? "")}`); prev = { C: sc.from[0], at: sc.at, whole: r.whole ?? {}, zs: r.zs ?? {} }; } process.exit(0); }
const ONLY = process.argv.includes("--only") ? process.argv[process.argv.indexOf("--only") + 1].split(",") : null;      /* (--only 13,7: the rest keep their cameras and serve as the shot before) */
if (!process.argv.includes("--debug")) for (const S of SHOTS) { const it = INT.find((q) => q.id === S.id); if (S.id === "10b") { prev = null; continue; }      /* (10b: the hand-placed close-up kept) */      /* (15b = shot 2's camera: the captain alone; the loop's seam to shot 1 is then the 1-2 cut, 41 degrees) */       /* (15 = shot 2's camera since 25 Nov: with shot 1's the loop's seam was a jump cut, the reviewer; its own camera reached 28 degrees, under 30) */
  if (ONLY && !ONLY.includes(S.id)) { const sc = SPEC.shots.find((q) => q.id === S.id).cam, r = tryCam(S, sc.from[0], sc.at, sc.lens, null); prev = { C: sc.from[0], at: sc.at, whole: r.whole ?? {}, zs: r.zs ?? {} }; continue; }
  const c = solveShot(S, it, prev); if (!c) { prev = null; continue; } found[S.id] = c; prev = c;
  console.log(`${S.id.padStart(2)}: az ${c.az} (intent ${it.az}), el ${c.el}, lens ${c.lens}, cam ${c.C.join(", ")}, whole: ${Object.keys(c.whole).join(" ")}, score ${c.score.toFixed(2)}${c.notes.length ? "  [" + c.notes.join("; ") + "]" : ""}`); }
if (!process.argv.includes("--debug")) for (const s of SPEC.shots) { const c = found[s.id]; if (!c) continue; s.cam = { ...s.cam, from: [c.C, c.C], at: c.at, lens: c.lens }; }
if (!process.argv.includes("--debug")) fs.writeFileSync("src/craft/dinner3d/shots.json", JSON.stringify(SPEC, null, 1));
console.log(`TUNED ${Object.keys(found).length} of ${SPEC.shots.length} shots`);
// (debug, --debug <shot>: the checks at the intent, by distance)
if (process.argv.includes("--debug")) { const id = process.argv[process.argv.indexOf("--debug") + 1], S = SHOTS.find((s) => s.id === id), it = INT.find((q) => q.id === id), xs = (MAIN[id] ?? []).map(([nm]) => SPEC.figs[nm]), ctr = [xs.reduce((a, p) => a + p[0], 0) / xs.length, xs.reduce((a, p) => a + p[1], 0) / xs.length];
  for (let dist = (process.env.D0 ? +process.env.D0 : 1.4); dist <= 5; dist += +(process.env.DD ?? 0.3)) { const at = [ctr[0], ctr[1], +(process.env.ZAT ?? ((MAIN[id] ?? []).every(([, h]) => h !== "whole") ? 1.3 : 0.85))], d = [Math.sin(it.az * R) * Math.cos(it.el * R), Math.cos(it.az * R) * Math.cos(it.el * R), -Math.sin(it.el * R)], C = at.map((v, i) => v - d[i] * dist), r = tryCam(S, C, at, it.lens, null); console.log(dist.toFixed(1), C.map((v) => v.toFixed(2)).join(","), JSON.stringify(r).slice(0, 200)); } }
