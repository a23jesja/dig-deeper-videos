// Layout check for a Short built in the emu look (default: the Titanic part 3 film). Run before rendering; exits 1 on a failure.
//   node scripts/kit_check.mjs [titanic3|titanic3test]      DUMP=1 prints every box (in % of the picture) on the first frame of each shot.
// A film exports FILM_CHECK = { shots, camAt, sceneAt, kinds, hook?, events?, counts?, tags?, lamps?, boats?, props?, rockets?, passengers?, deckAt? }.
// On every 2nd frame it projects every person (st.places with key F| or S|) to the screen and checks DAILY-RULES "The look: the emu Short":
//   FRAME   a main figure not wholly inside the picture with a 5 % margin        FACE   a face in the top or bottom 15 %, or in the caption band 62.5-72.5 %
//   HOOK    the hook text over any figure box while it is shown                  EFFECT an effect (the rocket and its star) over the hook text
//   SMALL   the biggest figure under half the picture height (medium); every figure under a third (wide)      AIR   two main figure boxes that touch or overlap
//   WIDE    a wide or sea shot longer than 2 s; SEA: a sea shot whose lower half shows no boat       CLOSE-UP the whole face inside the safe area
//   PROP    a set piece (davit post ...) over a main figure or its face
//   SIDE    Sir Digsworth drawn in side view as a main figure
//   CHAIN   Sir Digsworth's monocle chain: upper end on the rim, lower end inside the torso, a sag below the straight line
//   GAZE    while an event is on, every main figure looks toward it (horizontal look has the sign of its side; lookUp >= 0.5 if it is > 15 % above the face)
//   LAMP    no lantern or lit window of the set inside the box of a main figure
//   TAG     a tag or the board over a figure, a face, the caption band, the hook text, another tag, or outside the picture
//   COUNT   the number of figures a shot must show (60+ on the packed deck, exactly 30 on the upturned boat)
// Crowd figures (name starting c_) count for HOOK, TAG and COUNT only. Person box and face: measured sizes (tables M / MS below).
import fs from "node:fs"; import path from "node:path"; import { pathToFileURL } from "node:url"; import { build } from "esbuild";
const FILMS = { titanic3: "src/videos/emu/titanic3", titanic3test: "src/videos/emu/titanic3Scenes" };
const which = process.argv[2] || "titanic3";
if (!FILMS[which]) { console.error("unknown film " + which + " (" + Object.keys(FILMS).join(", ") + ")"); process.exit(2); }
const tmp = path.resolve("out/kit/_check"); fs.mkdirSync(tmp, { recursive: true });
const entry = path.join(tmp, "entry.ts");
const U = (p) => path.resolve(p).split(path.sep).join("/");
fs.writeFileSync(entry, `
import * as THREE from "three";
import { FILM_CHECK } from "${U(FILMS[which])}";
import { sirChain } from "${U("src/videos/emu/toon")}";
export const run = (dump: boolean) => {
  const FC: any = FILM_CHECK, W = 1080, H = 1920, cam = new THREE.PerspectiveCamera(40, W / H, 0.2, 1500), right = new THREE.Vector3(), v = new THREE.Vector3();
  const fails = new Map<string, { n: number; f: number; ex: string }>(), lines: string[] = [];
  const flag = (shot: number, msg: string, f: number, ex: string) => { const k = "shot " + shot + ": " + msg, e = fails.get(k); if (e) e.n++; else fails.set(k, { n: 1, f, ex }); };
  const hook = FC.hook, BAND = { y0: 0.625 * H, y1: 0.725 * H };
  const HKT = hook ? (() => { const n = Math.max(...hook.lines.map((l: string) => l.length)), tw = hook.size * 0.62 * n, cx = hook.x + hook.w / 2; return { x0: cx - tw / 2, x1: cx + tw / 2, y0: hook.y, y1: hook.y + hook.h }; })() : null;
  let frames = 0;
  const M: any = { sir: [1.66, 1.29, 0.52, 0.58], officer: [1.61, 1.28, 0.52, 0.58], lady: [1.59, 1.28, 0.52, 0.58], gent: [1.76, 1.31, 0.52, 0.58], kid: [1.32, 1.0, 0.48, 0.5] };
  const MS: any = { lady: [1.26, 0.94, 0.52, 0.6], kid: [1.06, 0.77, 0.48, 0.52] };
  for (const s of FC.shots) {
    const kind = FC.kinds[s.id];
    if ((kind === "wide" || kind === "sea") && s.b - s.a > 60) flag(s.id, "WIDE shot longer than 2 s", s.a, (s.b - s.a) + " frames");
    for (let f = s.a; f < s.b; f += 2) {
      frames++;
      const c = FC.camAt(s.id, f);
      cam.fov = c.fov; cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.rotateZ(c.roll || 0); cam.updateProjectionMatrix(); cam.updateMatrixWorld(); cam.matrixWorldInverse.copy(cam.matrixWorld).invert();
      right.setFromMatrixColumn(cam.matrixWorld, 0); right.y = 0; right.normalize();
      const st = FC.sceneAt(s.id, f, { pos: cam.position, right, sun: new THREE.Vector3(0.3, 0.8, -0.5), light: s.light }) as any;
      const px = (x: number, y: number, z: number) => { v.set(x, y, z).project(cam); return [(v.x * 0.5 + 0.5) * W, (0.5 - v.y * 0.5) * H, v.z]; };
      const rect = (x: number, y: number, z: number, w: number, h: number) => {
        const pts = [-1, 1].flatMap((sx) => [0, 1].map((sy) => px(x + right.x * sx * w / 2, y + sy * h, z + right.z * sx * w / 2)));
        return { x0: Math.min(...pts.map((p) => p[0])), x1: Math.max(...pts.map((p) => p[0])), y0: Math.min(...pts.map((p) => p[1])), y1: Math.max(...pts.map((p) => p[1])), behind: pts.some((p) => p[2] > 1) };
      };
      const boxes = st.places.filter((p: any) => /^[FS]\\|/.test(p.key)).map((p: any) => {
        const parts = p.key.split("|"), o = JSON.parse(parts[2] || "{}"), sc = p.scale ?? 1, sit = o.mode === "sit", side = parts[0] === "S", arms = !!(o.point || o.cheer || o.shrug || o.wave !== undefined);
        const name = parts[1], base = name.replace(/^c_/, "").replace(/^sir.*/, "sir").replace(/^\\d+$/, "gent"), crowd = name.startsWith("c_"), swim = o.swim ?? 0;
        const [mh, mf, mfs, mw] = (sit ? MS : M)[base] ?? (sit ? MS.lady : M.sir), hgt = mh - swim, fy = mf, w = (o.swim !== undefined ? 0.7 : arms ? 1.25 : side ? 0.35 + 0.45 * (o.stride ?? 1) : mw) * sc;
        const b: any = { name, crowd, opts: o, key: p.key, p, side, dist: cam.position.distanceTo(new THREE.Vector3(p.x, p.y + 1, p.z)), pass: (FC.passengers || []).includes(name), close: kind === "close", swim: !!swim, ...rect(p.x, p.y + swim, p.z, w, hgt * sc) };
        b.face = rect(p.x, p.y + (fy - mfs / 2) * sc, p.z, mfs * sc, mfs * sc);
        return b;
      });
      const R = (b: any) => "[x " + Math.round(b.x0) + "-" + Math.round(b.x1) + ", y " + Math.round(b.y0) + "-" + Math.round(b.y1) + "]";
      const hit = (a: any, b: any, gap = 0) => Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0) > -gap && Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0) > 0;
      const main = boxes.filter((b: any) => !b.crowd);
      if (dump && f === s.a) { lines.push("shot " + s.id + " f" + f + " (" + kind + ")"); for (const b of main) lines.push("  " + b.name.padEnd(8) + " box x " + (b.x0 / W * 100).toFixed(0) + "-" + (b.x1 / W * 100).toFixed(0) + " % y " + (b.y0 / H * 100).toFixed(0) + "-" + (b.y1 / H * 100).toFixed(0) + " %  face x " + (b.face.x0 / W * 100).toFixed(0) + "-" + (b.face.x1 / W * 100).toFixed(0) + " y " + (b.face.y0 / H * 100).toFixed(0) + "-" + (b.face.y1 / H * 100).toFixed(0)); lines.push("  crowd " + (boxes.length - main.length)); }
      let big = 0;
      // no effect may cover the hook text: the rocket's head while it climbs, its whole star once it has burst
      if (hook && f < hook.end && FC.rockets) {
        for (const r of FC.rockets) {
          const a = f / 30 - r.t0, rise = r.rise ?? 1.3; if (a < 0 || a > rise + 5) continue;
          const u = Math.min(1, a / rise), e = 1 - (1 - u) * (1 - u), cc = [0, 1, 2].map((k) => r.from[k] + (r.apex[k] - r.from[k]) * e);
          const rad = a > rise ? (r.radius ?? 8) * (1 - Math.exp(-(a - rise) * 2.2)) + 0.6 : 0.6, fall = a > rise ? 1.6 * (a - rise) + 0.3 * (a - rise) * (a - rise) : 0;
          const p0 = px(cc[0], cc[1] - fall, cc[2]), p1 = px(cc[0] + right.x * rad, cc[1] - fall, cc[2] + right.z * rad), pr = Math.abs(p1[0] - p0[0]);
          const box = { x0: p0[0] - pr, x1: p0[0] + pr, y0: p0[1] - pr, y1: p0[1] + pr * 1.3 };
          if (p0[2] < 1 && hit(box, HKT)) flag(s.id, "EFFECT the rocket over the hook text", f, R(box) + " " + R(HKT));
        }
      }
      for (const b of main) {
        const who = b.name;
        if (b.close) { if (b.face.x0 < 22 || b.face.x1 > W - 22 || b.face.y0 < 0.15 * H || b.face.y1 > BAND.y0) flag(s.id, "CLOSE-UP " + who + ": the whole face is not inside the safe area", f, R(b.face)); }
        else {
          if (b.x0 < 0.05 * W || b.x1 > 0.95 * W || b.y0 < 0.05 * H || b.y1 > 0.95 * H) flag(s.id, "FRAME " + who + " not inside the picture with a 5 % margin", f, R(b));
          if (b.face.y0 < 0.15 * H) flag(s.id, "FACE " + who + " in the top 15 %", f, R(b.face));
          if (b.face.y1 > 0.85 * H) flag(s.id, "FACE " + who + " in the bottom 15 %", f, R(b.face));
          if (b.face.y1 > BAND.y0 && b.face.y0 < BAND.y1) flag(s.id, "FACE " + who + " under the caption band", f, R(b.face));
        }
        big = Math.max(big, (b.y1 - b.y0) / H);
      }
      if (hook && f < hook.end) for (const b of boxes) if (hit(b, HKT)) flag(s.id, "HOOK text over " + b.name, f, R(b) + " " + R(HKT));
      if (kind === "medium" && big < 0.5) flag(s.id, "SMALL biggest figure under half the picture height", f, (big * 100).toFixed(0) + " %");
      const seaOk = (() => { const bs = FC.boats ? FC.boats(s.id, f) : []; return bs.some((q: number[]) => { const p = px(q[0], q[1], q[2]); return p[2] < 1 && p[1] > H * 0.5 && p[1] < H * 0.98 && p[0] > 0 && p[0] < W; }); })();
      if (kind === "sea" && !seaOk) flag(s.id, "SEA the lower half of the picture shows no boat on the water", f, "");
      if (kind === "wide" || kind === "sea") for (const b of main) if ((b.y1 - b.y0) / H < 0.33 && !seaOk) flag(s.id, "SMALL " + b.name + " under a third of the picture height", f, ((b.y1 - b.y0) / H * 100).toFixed(0) + " %");
      for (let i = 0; i < main.length; i++) for (let j = i + 1; j < main.length; j++) { const a = main[i], b = main[j]; if (hit(a, b, 0.02 * W)) flag(s.id, "AIR " + a.name + " and " + b.name + " touch", f, R(a) + " " + R(b)); }
      // set pieces over or between the main figures
      if (FC.props) for (const p of FC.props(s.id, f)) {
        const r = rect(p.x, p.y, p.z, p.w, p.h); if (r.behind || r.x1 < 0 || r.x0 > W) continue; const pd = cam.position.distanceTo(new THREE.Vector3(p.x, p.y + 1, p.z));
        for (const b of main) { if (pd > b.dist + 0.3) continue;   // a prop behind the figure is fine: only one standing in front of or between them counts
          if (hit(r, b)) flag(s.id, "PROP " + p.name + " over " + b.name, f, R(r) + " " + R(b)); if (hit(r, b.face)) flag(s.id, "PROP " + p.name + " over the face of " + b.name, f, R(r)); }
      }
      for (const b of main) if (/^sir/.test(b.name) && b.side) flag(s.id, "SIDE Sir Digsworth in side view as a main figure (his side view is not approved)", f, R(b));
      // CHAIN: Sir Digsworth's monocle chain
      for (const b of main) if (/^sir/.test(b.name) && b.key.startsWith("F|")) {
        const o = b.opts, ch = sirChain(o), u = ch.u, rim = Math.hypot(ch.upper[0] - ch.mono[0], ch.upper[1] - ch.mono[1]), T = ch.torso;
        if (Math.abs(rim - ch.monoR) > 1.5 * u) flag(s.id, "CHAIN upper end not on the monocle rim", f, rim.toFixed(1) + " vs " + ch.monoR.toFixed(1));
        if (!(ch.lowerBody[0] > T.x0 && ch.lowerBody[0] < T.x1 && ch.lowerBody[1] > T.y0 && ch.lowerBody[1] < T.y1)) flag(s.id, "CHAIN lower end not inside the torso", f, ch.lowerBody.map(Math.round) + "");
        if (!(ch.below && ch.sag > 2.5 * u)) flag(s.id, "CHAIN does not sag below the straight line", f, "sag " + (ch.sag / u).toFixed(1) + "u");
      }
      // GAZE: while something happens, the main figures look toward it
      for (const e of FC.events || []) if (f >= e.a && f < e.b) {
        const q = px(...e.pos(f)); if (q[2] > 1) continue;
        for (const b of main) {
          if (e.who && !e.who.includes(b.name)) continue; if (e.ignore && e.ignore.includes(b.name)) continue;
          const fcx = (b.face.x0 + b.face.x1) / 2, fcy = (b.face.y0 + b.face.y1) / 2, dx = q[0] - fcx; if (Math.abs(dx) < 10 && !(q[1] < fcy - 0.15 * H)) continue;
          const sgn = Math.sign(dx);
          if (b.side) { const facing = b.p.mirror ? -1 : 1; if (sgn && facing !== sgn) flag(s.id, "GAZE " + b.name + " faces away from the event", f, "event x " + Math.round(q[0]) + " face x " + Math.round(fcx)); }
          else { const lk = b.opts.look ?? 0; if (sgn && lk * sgn < 0.25) flag(s.id, "GAZE " + b.name + " does not look toward the event (look " + lk.toFixed(2) + ")", f, "event x " + Math.round(q[0]) + " face x " + Math.round(fcx)); }
          if (q[1] < fcy - 0.15 * H && (b.opts.lookUp ?? 0) < 0.5) flag(s.id, "GAZE " + b.name + " does not look up at an event " + Math.round((fcy - q[1]) / H * 100) + " % above the face (lookUp " + (b.opts.lookUp ?? 0).toFixed(2) + ")", f, "");
        }
      }
      // LAMP: lit things of the set behind a main figure
      if (FC.lamps) for (const l of FC.lamps(FC.deckAt ? FC.deckAt(s.id, f) : undefined)) { const q = px(l[0], l[1], l[2]); if (q[2] > 1) continue; for (const b of main) if (q[0] > b.x0 && q[0] < b.x1 && q[1] > b.y0 && q[1] < b.y1) flag(s.id, "LAMP a lit window or lantern shows inside the box of " + b.name, f, Math.round(q[0]) + "," + Math.round(q[1]) + " in " + R(b)); }
      // TAG: tags and the board
      const cards: { name: string; box: any }[] = [];
      for (const t of FC.tags || []) if (t.id === s.id && f >= t.a && f < t.b) cards.push({ name: "tag '" + t.l1 + "'", box: t.box });
      if (FC.board && FC.board.id === s.id && f >= FC.board.l1) cards.push({ name: "the board", box: FC.board.box });
      for (let i = 0; i < cards.length; i++) {
        const c1 = cards[i], bx = c1.box;
        if (bx.x0 < 0.03 * W || bx.x1 > 0.97 * W || bx.y0 < 0.03 * H || bx.y1 > 0.97 * H) flag(s.id, "TAG " + c1.name + " outside the picture", f, R(bx));
        for (const b of boxes) { if (hit(bx, b)) flag(s.id, "TAG " + c1.name + " covers a figure (" + b.name + ")", f, R(bx) + " " + R(b)); }
        if (hit(bx, { x0: 0, x1: W, y0: BAND.y0, y1: BAND.y1 })) flag(s.id, "TAG " + c1.name + " in the caption band", f, R(bx));
        if (hook && f < hook.end && hit(bx, HKT)) flag(s.id, "TAG " + c1.name + " over the hook text", f, R(bx));
        for (let j = i + 1; j < cards.length; j++) if (hit(bx, cards[j].box)) flag(s.id, "TAG " + c1.name + " over " + cards[j].name, f, "");
      }
      // COUNT
      for (const c2 of FC.counts || []) if (c2.id === s.id) {
        const n = boxes.filter((b: any) => !b.swim && !b.behind && (b.x0 + b.x1) / 2 > 0 && (b.x0 + b.x1) / 2 < W && (b.y0 + b.y1) / 2 > 0 && (b.y0 + b.y1) / 2 < H).length;
        if (n < c2.min || n > c2.max) flag(s.id, "COUNT " + c2.what + ": " + n + " visible, wanted " + c2.min + (c2.max < 9999 ? "-" + c2.max : "+"), f, "");
      }
    }
  }
  return { frames, fails: [...fails].map(([k, e]) => k + "  (" + e.n + " frames, first " + e.f + ")  " + e.ex), lines };
};`);
const out = path.join(tmp, "check.mjs");
await build({ entryPoints: [entry], bundle: true, format: "esm", platform: "node", outfile: out, loader: { ".json": "json" }, logLevel: "error" });
const noop = new Proxy(function () {}, { get: () => noop, apply: () => noop });
globalThis.document = { createElement: () => ({ getContext: () => noop, width: 0, height: 0, style: {} }) };
globalThis.window = globalThis.window ?? globalThis; globalThis.Image = class {}; globalThis.self = globalThis;
const { run } = await import(pathToFileURL(out).href + "?t=" + Date.now());
const r = run(!!process.env.DUMP);
for (const l of r.lines) console.log(l);
console.log(`checked ${r.frames} frames`);
if (!r.fails.length) console.log("LAYOUT OK: no problems"); else for (const l of r.fails) console.log("FAIL " + l);
process.exit(r.fails.length ? 1 : 0);
