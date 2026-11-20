// What a Short of the craft kit consists of, without rendering it: its shots with their frames, the frame that stands for each shot
// in the sketch, and the caption chunks.
//   usage: node scripts/film_info.mjs <film> [stills|shots|json|check|grips|audio|caps|thumbs]
//     grips = the held things, read on every frame: the grip in the hand, the working end where its use allows, a hand on every
//             held thing, nothing leaving a hand without a fall or changing hand between frames; `grips spots` = where they are in
//             the picture (json); `grips tenths` = read every tenth of a second only (quicker, misses faults of one or two frames)
//     body = nothing goes into anything, on every frame (src/craft/stage/bodyCheck.ts): every figure against every solid of the set,
//            every held thing, every other figure, and its feet against the ground; `body <n>` = every n-th frame (a quick look only)
//     stills = the sketch frames as a comma list (for scripts/stills.mjs)     shots = shots.json for scripts/short_qa.py
import fs from "node:fs"; import path from "node:path"; import os from "node:os"; import { pathToFileURL } from "node:url"; import { build } from "esbuild";
const name = process.argv[2], what = process.argv[3] ?? "table";
const tmp = path.join(os.tmpdir(), `filminfo-${process.pid}.mjs`);
await build({ entryPoints: [path.resolve("src/craft/shorts/index.ts")], bundle: true, platform: "node", format: "esm", outfile: tmp, loader: { ".json": "json" }, logLevel: "silent" });
// a stand-in for the browser's canvas, so that the figures can be drawn without a browser: nothing is painted, but the transforms
// are kept count of, because the drawing notes where the eyes are with them. Every mode has it: a film may place a prop while it is
// planned (Nero's Tacitus reads where the scroll hangs), and props paint their textures
if (typeof globalThis.document === "undefined") {
  const mul = (a, b) => [a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1], a[0] * b[2] + a[2] * b[3], a[1] * b[2] + a[3] * b[3], a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5]];
  const quiet = (own) => new Proxy(own, { get: (o, k) => (k in o ? o[k] : typeof k === "string" ? (o[k] = () => {}) : undefined) });
  const context = () => { let m = [1, 0, 0, 1, 0, 0]; const st = [];
    return quiet({ save() { st.push(m); }, restore() { if (st.length) m = st.pop(); }, translate(x, y) { m = mul(m, [1, 0, 0, 1, x, y]); }, scale(x, y) { m = mul(m, [x, 0, 0, y, 0, 0]); },
      rotate(r) { const c = Math.cos(r), s = Math.sin(r); m = mul(m, [c, s, -s, c, 0, 0]); }, transform(a, b, c, d, e, f) { m = mul(m, [a, b, c, d, e, f]); },
      setTransform(a, b, c, d, e, f) { m = a === undefined ? [1, 0, 0, 1, 0, 0] : typeof a === "object" ? [a.a, a.b, a.c, a.d, a.e, a.f] : [a, b, c, d, e, f]; }, resetTransform() { m = [1, 0, 0, 1, 0, 0]; },
      getTransform: () => ({ a: m[0], b: m[1], c: m[2], d: m[3], e: m[4], f: m[5] }), measureText: () => ({ width: 0 }), createLinearGradient: () => ({ addColorStop() {} }), createRadialGradient: () => ({ addColorStop() {} }),
      createPattern: () => ({}), getImageData: (x, y, w, h) => ({ data: new Uint8ClampedArray(w * h * 4), width: w, height: h }), isPointInPath: () => false }); };
  globalThis.document = { createElement: () => { const g = context(); return { width: 300, height: 150, style: {}, getContext: () => g, toDataURL: () => "", addEventListener() {} }; }, createElementNS: () => ({ style: {} }) };
  globalThis.Path2D = class { constructor() { return quiet({}); } };
}
const { FILMS, captions, auditGrips, occlusions, textOver, bodyCheck, bodyLines, pickAt, stageAt, motionCheck, motionLines, MOTION_DEBUG, picsAt, bubblesAt, textBoxes } = await import(pathToFileURL(tmp).href); fs.rmSync(tmp, { force: true });
if (!FILMS[name]) { console.error(`no film named ${name}; there are: ${Object.keys(FILMS).join(", ")}`); process.exit(1); }
const { film, comp } = FILMS[name], f = (t) => Math.round(t * film.fps);
const rows = film.shots.map((s) => ({ id: s.id, a: f(s.a), b: f(s.b), still: Math.min(f(s.b) - 1, f(s.a + (s.still ?? (s.b - s.a) / 2))), seconds: +(s.b - s.a).toFixed(2) }));
if (what === "stills") console.log(rows.map((r) => r.still).join(","));
else if (what === "shots") console.log(JSON.stringify(rows.map((r, i) => ({ id: i + 1, name: r.id, a: r.a, b: r.b }))));
else if (what === "check") {
  // staging rules that can be read from the film itself: no steep view down on a figure standing as a card (at most 35 degrees),
  // every shot between 0.8 and 5 seconds, the film between 25 and 40 seconds, the question on screen from the first frame
  const bad = [];
  for (const s of film.shots) {
    const len = s.b - s.a; if (len < 0.8 || len > 5) bad.push(`${s.id}: the shot is ${len.toFixed(2)} s long`);
    // no footsteps (Jesper 19 Nov: "Ta bort ljudet som görs när personer går ... helt"): no step or scuff scheduled in any shot
    for (const q of s.sounds ?? []) if (q.k === "step" || q.k === "scuff") bad.push(`${s.id} at ${q.t.toFixed(2)} s: a footstep sound (${q.k}) is scheduled; footsteps are removed`);
    for (let t = 0; t < len; t += 0.25) { const cam = s.cam(t, t / len); for (const a of s.cast(t, s.a + t)) {
      const d = Math.hypot(cam.pos[0] - a.at[0], cam.pos[2] - a.at[2]), el = (Math.atan2(cam.pos[1] - (a.at[1] + a.h * 0.5), d) * 180) / Math.PI;
      if (el > 35) { bad.push(`${s.id} at ${t.toFixed(2)} s: ${a.name} is seen from ${el.toFixed(0)} degrees above (at most 35 for a figure on a card)`); break; } } }
  }
  // nobody stands in somebody else, nobody stands in a rail, a mast or a wall, nobody jumps from one place to another between frames
  for (const s of film.shots) {
    const len = s.b - s.a, seen = new Set(), prev = new Map();
    for (let t = 0; t < len; t += 0.1) { const cast = s.cast(t, s.a + t);
      for (let i = 0; i < cast.length; i++) { const a = cast[i];
        for (let k = i + 1; k < cast.length; k++) { const b = cast[k], d = Math.hypot(a.at[0] - b.at[0], a.at[2] - b.at[2]);
          if (d < 0.3 && Math.abs(a.at[1] - b.at[1]) < 0.4 && !seen.has(a.name + b.name)) { seen.add(a.name + b.name); bad.push(`${s.id} at ${t.toFixed(1)} s: ${a.name} stands in ${b.name} (${d.toFixed(2)} m apart)`); } }
        for (const q of film.solids ?? []) { if (q.named && s.hide?.includes(q.named)) continue;
          if (a.at[0] > q.x[0] - 0.1 && a.at[0] < q.x[1] + 0.1 && a.at[2] > q.z[0] - 0.1 && a.at[2] < q.z[1] + 0.1 && a.at[1] < q.top - 0.05 && !seen.has(a.name + q.name)) { seen.add(a.name + q.name); bad.push(`${s.id} at ${t.toFixed(1)} s: ${a.name} stands in ${q.name}`); } }
        const p = prev.get(a.name); if (p && a.spin === undefined) { const v = Math.hypot(a.at[0] - p[0], a.at[2] - p[2]) / 0.1; if (v > 7 && !seen.has(a.name + "jump")) { seen.add(a.name + "jump"); bad.push(`${s.id} at ${t.toFixed(1)} s: ${a.name} moves ${v.toFixed(0)} m/s (a jump between two frames)`); } }
        prev.set(a.name, a.at); } }
  }
  // a hook-lab clip (DAILY-RULES, "The hook lab"; "-hook-a", or "-hook4-a" for a later round) is seconds 0-5 of a Short on its own;
  // every other film is a Short of 25 to 40 s
  const hookClip = /-hook\d*-[a-z]$/.test(film.id);
  const [lo, hi] = hookClip ? [4, 6] : film.range ?? [25, 40];
  if (film.seconds < lo || film.seconds > hi) bad.push(`the film is ${film.seconds.toFixed(1)} s (${hookClip ? "a hook-lab clip: " : ""}${lo} to ${hi})`);
  if (film.hook.a > 0.01) bad.push("the question is not on screen from the first frame");
  // the speech bubbles: each up long enough to read at phone size, inside one shot, said by someone in it, and no quotation marks
  for (const q of film.bubbles ?? []) { const s = film.shots.find((x) => q.a >= x.a - 0.001 && q.a < x.b), tag = `bubble "${q.text}" at ${q.a.toFixed(2)} s`;
    if (q.b - q.a < 1.2 - 0.001) bad.push(`${tag}: up ${(q.b - q.a).toFixed(2)} s (at least 1.2 to be read)`);
    if (!s || q.b > s.b + 0.001) bad.push(`${tag}: runs past the cut`);
    else if (!s.cast((q.a + q.b) / 2 - s.a, (q.a + q.b) / 2).some((x) => x.name === q.who)) bad.push(`${tag}: ${q.who} is not in the shot`);
    if (/["“”]/.test(q.text)) bad.push(`${tag}: quotation marks (an own line is never a quote)`); }
  if (film.sign && film.sign.a < 5) bad.push("the sign comes before second five");
  // nothing in the foreground covers a face or cuts a figure in two (Jesper, 18 November): rays from the lens through the world
  for (const o of occlusions(film)) bad.push(o);
  // no line of text over a face, a chest or a hand (the review of gladiators v4). TEXT=faces: only over faces (the zero-tolerance rule,
  // point 8), for a film whose captions keep the placement of a version published before that rule (Nero v3, the review of 18 Nov)
  { const facesOnly = process.env.TEXT === "faces"; let skipped = 0;
    for (const o of textOver(film)) { if (facesOnly && !/'s face|a face in the crowd/.test(o)) { skipped++; continue; } bad.push(o); }
    if (facesOnly) console.log(`text check: faces only (TEXT=faces); ${skipped} lines over a chest or a hand passed over, as in the version published before`); }
  // nothing goes into anything, on every frame (Jesper, 18 November: "Impossible things: zero tolerance"); `body` runs it alone
  { const r = bodyCheck(film); for (const l of bodyLines(film, r)) bad.push(`body: ${l}`); console.log(`body check: ${r.frames} frames, ${r.figuresTried} figure-frames, ${r.pairs} pairs tried, ${r.faults.length} faults`); }
  // what happens between frames (the shot library review, 20 Nov): jumps, the head redrawn, shaking, the pipe in an open mouth, the look,
  // the edge, things popping up or gone (src/craft/stage/motionCheck.ts); `motion` runs it alone
  { const r = motionCheck(film); for (const l of motionLines(film, r)) bad.push(`motion: ${l}`); console.log(`motion check: ${r.length} faults`); }
  if (bad.length) { console.error(`FILM CHECK FAILED for ${name}:`); for (const b of bad) console.error("  " + b); process.exit(1); }
  console.log(`FILM CHECK OK for ${name}: ${film.shots.length} shots, ${film.seconds.toFixed(1)} s, no figure seen from more than 35 degrees above, none standing in another or in a solid, none jumping, no face covered and no figure cut by a thing in the foreground`);
}
else if (what === "body") {
  // body <every> <shot,shot>: only those shots (a quick look while staging one)
  const t0 = Date.now(), only = process.argv[5]?.split(","), r = bodyCheck(film, { every: Number(process.argv[4] ?? 1) || 1, ...(only ? { shots: only } : {}) }), lines = bodyLines(film, r);
  for (const l of lines) console.log(l);
  console.log(`${lines.length ? "BODY CHECK FAILED" : "BODY CHECK OK"} for ${name}: ${r.frames} frames of ${f(film.seconds)}, ${r.figuresTried} figure-frames, ${r.pairs} pairs tried (a figure against a solid, a held thing or another figure), ${lines.length} faults (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
  process.exit(lines.length ? 1 : 0);
}
// pick <frame> <x> <y> = what lies at that pixel of that frame (the set and the shot's things, nearest first)
// joints <frame> [name] = where each figure's joints are on that frame (metres, the world), to measure a pose without rendering it
else if (what === "joints") { const F = Number(process.argv[4]), who = process.argv[5], T = F / film.fps, s = film.shots.find((q) => T >= q.a - 1e-6 && T < q.b) ?? film.shots.at(-1), t = Math.max(0, T - s.a), cam = s.cam(t, t / (s.b - s.a));
  for (const a of s.cast(t, s.a + t)) { if (who && a.name !== who) continue; const st = stageAt(a, cam); console.log(`${s.id} ${a.name} at ${a.at.map((x) => x.toFixed(2))} heading ${a.heading.toFixed(0)}`);
    for (const j of ["pelvis", "hipL", "knL", "anL", "heelL", "toeL", "hipR", "knR", "anR", "heelR", "toeR", "wrL", "tipL", "wrR", "tipR", "neck"]) { try { console.log(`  ${j.padEnd(6)} ${st.joint(j).map((x) => x.toFixed(3)).join(" ")}`); } catch { /* no such joint */ } } } }
// motion [shot,shot] = the frame-to-frame check alone
else if (what === "motion") { const only = process.argv[4]?.split(","); MOTION_DEBUG.on = !!process.env.MOTION_DEBUG; const r = motionCheck(film, only ? { shots: only } : {}), lines = motionLines(film, r); for (const l of lines) console.log(l); if (MOTION_DEBUG.on) for (const [k, e] of [...MOTION_DEBUG.top].sort()) console.log(`  max ${k}: ${e.v.toFixed(2)} at ${e.F}`); console.log(`${lines.length ? "MOTION CHECK FAILED" : "MOTION CHECK OK"} for ${name}: ${lines.length} faults`); process.exit(lines.length ? 1 : 0); }
// pose <frame,frame,...> [name] = each figure's heading, view angle and the pose's head, twist and lean on those frames
else if (what === "pose") { const who = process.argv[5]; for (const F of process.argv[4].split(",").map(Number)) { const T = F / film.fps, s = film.shots.find((q) => T >= q.a - 1e-6 && T < q.b) ?? film.shots.at(-1), t = Math.max(0, T - s.a), cam = s.cam(t, t / (s.b - s.a));
  for (const a of s.cast(t, s.a + t)) { if (who && a.name !== who) continue; const az = (Math.atan2(cam.pos[0] - a.at[0], cam.pos[2] - a.at[2]) * 180) / Math.PI; console.log(`${F} ${s.id} ${a.name} heading ${a.heading.toFixed(1)} yaw ${(a.heading - az).toFixed(1)} head ${JSON.stringify(a.pose.head?.map((x) => +x.toFixed(1)))} twist ${(a.pose.twist ?? 0).toFixed(1)} lean ${(a.pose.lean ?? 0).toFixed(1)} roll ${(a.pose.roll ?? 0).toFixed(2)} mouth ${(a.o.face?.mouth ?? 0).toFixed(2)}`); } } }
else if (what === "pics") { for (const F of process.argv[4].split(",").map(Number)) console.log(JSON.stringify({ F, figs: picsAt(film, F) })); }
// regions = for the flicker check (scripts/flicker.py), on every frame: each figure's eyes (a circle round each eye, a little larger
// than the eye drawn) and every box of text on the picture (the hook, the captions, the speech bubbles), as json lines
else if (what === "regions") { const caps = captions(film.words, (w) => w.b <= film.hook.b + 0.02, film.shots.map((s) => s.a)), N = f(film.seconds);
  for (let F = 0; F < N; F++) { const T = F / film.fps, figs = picsAt(film, F), eyes = [];
    for (const r of Object.values(figs)) { const hw = r.headMin && r.headMax ? Math.abs(r.headMax[0] - r.headMin[0]) : 0, rad = Math.max(8, Math.round(0.11 * hw));
      for (const k of ["eyeA", "eyeB"]) if (r[k]) eyes.push([r[k][0], r[k][1], rad]); }
    const text = [...textBoxes(film, T, caps).map((q) => q.box), ...bubblesAt(film, T).map((q) => q.box)].map((b) => b.map(Math.round));
    const bub = bubblesAt(film, T).map((q) => q.box.map(Math.round));
    const shot = film.shots.findIndex((q) => T >= q.a - 1e-6 && T < q.b);
    console.log(JSON.stringify({ F, shot, eyes, text, bub })); } }
else if (what === "pick") { const [F, x, y] = process.argv.slice(4).map(Number); console.log(JSON.stringify(pickAt(film, F, x, y), null, 1)); }
else if (what === "grips") {
  const { bad, held, spots } = auditGrips(film, process.argv[4] === "tenths" ? 0.1 : undefined);
  if (process.argv[4] === "spots") console.log(JSON.stringify(spots));
  else { for (const b of bad) console.log(b); console.log(bad.length ? `GRIPS FAIL: ${bad.length} faults in ${held} held readings` : `grips ok: ${held} readings of a thing in a hand, every grip in the hand, a hand on every held thing and every working end where its use allows; every face whole in every frame (not a quarter of it outside the picture, behind another figure's head, body or arm, or behind a held thing)`); }
  process.exit(bad.length && process.argv[4] !== "spots" ? 1 : 0);
}
else if (what === "audio") {
  // everything the sound needs (audio/film_audio.py): each shot's sounds on their frames, the beds, the voice, the music, the impacts
  const cues = [], beds = (film.beds ?? []).map((b) => ({ k: b.k, f0: f(b.a), f1: f(b.b), g: b.g ?? 1 }));
  // each speech bubble pops up with a small tap
  for (const q of film.bubbles ?? []) cues.push({ f: f(q.a), shot: "bubble", k: "tap", g: 0.45, p: 0 });
  for (const s of film.shots) { for (const c of s.sounds ?? []) { if (c.t < -0.001 || s.a + c.t > s.b + 0.6) console.error(`warning: ${s.id}: sound ${c.k} at ${c.t.toFixed(2)} s lies outside its shot`); const { t, ...rest } = c; cues.push({ f: f(s.a + c.t), shot: s.id, ...rest }); }
    for (const b of s.beds ?? []) beds.push({ k: b.k, f0: f(s.a + b.a), f1: f(s.a + b.b), g: b.g ?? 1 }); }
  cues.sort((a, b) => a.f - b.f);
  console.log(JSON.stringify({ film: name, fps: film.fps, frames: f(film.seconds), voice: { file: `voice/${name}/voice.wav`, frame: 0 }, lines: `voice/${name}/lines.json`, music: film.music ?? null, hits: (film.hits ?? []).map((h) => ({ f: f(h.t), amp: h.amp })), shots: rows.map((r) => ({ id: r.id, a: r.a, b: r.b })), cues, beds }, null, 1));
}
else if (what === "caps") { for (const c of captions(film.words, (w) => w.b <= film.hook.b + 0.02, film.shots.map((s) => s.a))) console.log(`${String(f(c.a)).padStart(4)}-${String(f(c.b)).padStart(4)}  ${c.text}`); }
else if (what === "thumbs") { (film.thumbs ?? []).forEach((k, i) => console.log(`${i + 1}	${k.T.toFixed(2)}	${f(k.T)}	${k.words.join(" ")}`)); }
else if (what === "json") console.log(JSON.stringify({ comp, fps: film.fps, frames: f(film.seconds), seconds: film.seconds, shots: rows }));
else { console.log(`${name} (${comp}): ${film.seconds.toFixed(2)} s, ${f(film.seconds)} frames, ${rows.length} shots`); for (const r of rows) console.log(`  ${r.id.padEnd(8)} ${String(r.a).padStart(4)}-${String(r.b).padStart(4)}  ${r.seconds.toFixed(2)} s  still ${r.still}`); }
