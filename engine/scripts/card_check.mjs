// Layout check for a film written as a shot list (monaKit-style). On every 6th frame of every shot it projects every
// caption-like card (banner, tag, speech bubble, stamp, calendar: FxPlace.top) and every person's head to the screen
// and reports:
//   FRAME    a card that leaves the frame
//   CAPTION  a card or a head in the strip where the one-word captions are
//   FACE     a card that covers somebody's head
//   CARDS    two cards that overlap each other
//   PROP     a card that covers a drawing (prop) behind it
//   CUT      a head cut by the edge of the frame for most of the shot
//   UNSEEN   a person who is never inside the frame during the shot
// World geometry (stairs, desks, walls) is not known here: the cards are drawn in front of it, people are not checked.
// Run it before rendering.   usage: node scripts/card_check.mjs [margin=0.04] [firstShot] [lastShot]
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";

const margin = Number(process.argv[2] ?? 0.04), first = Number(process.argv[3] ?? 1), last = Number(process.argv[4] ?? 1e9);
const tmp = path.resolve("out/mona/_check");
fs.mkdirSync(tmp, { recursive: true });
const entry = path.join(tmp, "entry.ts");
fs.writeFileSync(entry, `
import * as THREE from "three";
import { SH, SHOTS_M, camAtM, sceneAtM } from "${path.resolve("src/videos/emu/storyM").replace(/\\/g, "/")}";
type R = { x0: number; x1: number; y0: number; y1: number };
type Hit = { shot: number; name: string; kind: string; what: string; amt: number; f: number; n: number };
export const run = (margin: number, first: number, last: number) => {
  const cam = new THREE.PerspectiveCamera(40, 16 / 9, 0.2, 1500), right = new THREE.Vector3(), up = new THREE.Vector3(), v = new THREE.Vector3();
  const hits = new Map<string, Hit>(), E = 1 - margin;
  const hit = (s: number, kind: string, what: string, amt: number, f: number) => {
    const id = s + "|" + kind + "|" + what, h = hits.get(id);
    if (!h) hits.set(id, { shot: s, name: SH[s - 1].name, kind, what, amt, f, n: 1 }); else { h.n++; if (amt > h.amt) { h.amt = amt; h.f = f; } }
  };
  const short = (k: string) => k.replace(/\\|(#[0-9a-f]{6}|true|false)/g, "").slice(0, 44);
  const area = (r: R) => Math.max(0, r.x1 - r.x0) * Math.max(0, r.y1 - r.y0);
  const inter = (a: R, b: R): R => ({ x0: Math.max(a.x0, b.x0), x1: Math.min(a.x1, b.x1), y0: Math.max(a.y0, b.y0), y1: Math.min(a.y1, b.y1) });
  const out: Hit[] = [];
  for (const s of SHOTS_M) {
    if (s.id < first || s.id > last) continue;
    let samples = 0;
    const seen = new Map<string, { vis: number; cut: number; cap: number; n: number; f: number }>();
    for (let f = s.a + 1; f < s.b; f += 6) {
      samples++;
      const c = camAtM(s.id, f);
      cam.fov = c.fov; cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.updateProjectionMatrix(); cam.updateMatrixWorld(); cam.matrixWorldInverse.copy(cam.matrixWorld).invert();
      right.setFromMatrixColumn(cam.matrixWorld, 0); up.setFromMatrixColumn(cam.matrixWorld, 1);
      const st = sceneAtM(s.id, f, { pos: cam.position, right, sun: new THREE.Vector3(0.3, 0.8, -0.5), light: "day" });
      const rect = (x: number, y: number, z: number, w: number, h: number): R & { d: number } => {
        const r = { x0: 9, x1: -9, y0: 9, y1: -9, d: v.set(x, y, z).sub(cam.position).dot(cam.getWorldDirection(new THREE.Vector3())) };
        for (const sx of [-1, 1]) for (const sy of [-1, 1]) { v.set(x, y, z).addScaledVector(right, (sx * w) / 2).addScaledVector(up, (sy * h) / 2).project(cam); r.x0 = Math.min(r.x0, v.x); r.x1 = Math.max(r.x1, v.x); r.y0 = Math.min(r.y0, v.y); r.y1 = Math.max(r.y1, v.y); }
        return r;
      };
      const cards = st.fx.filter((k) => k.top && /^(ban|tag|talk|bub|stamp|cal)\\|/.test(k.key)).map((k) => ({ k, r: rect(k.x, k.y, k.z, k.w, k.h), bubble: /^(talk|bub)\\|/.test(k.key) }));
      const props = st.fx.filter((k) => !k.top && !k.flat && !k.soft && !/blob|sparkle|sweat/.test(k.key) && k.w < 4 && k.h < 4).map((k) => ({ k, r: rect(k.x, k.y, k.z, k.w, k.h) }));
      const heads = st.places.filter((p) => /^[FS]\\|/.test(p.key)).map((p) => { const sc = p.scale ?? 1; return { p, r: rect(p.x, p.y + 1.44 * sc, p.z, 0.5 * sc, 0.5 * sc) }; });
      // --- cards against the frame and the caption strip
      for (const { k, r } of cards) {
        const over = Math.max(r.x1 - E, -E - r.x0, r.y1 - E, -E - r.y0);
        if (over > 0) hit(s.id, "FRAME", short(k.key), over, f);
        if (r.y0 < -0.60 && r.y1 > -0.84 && r.x0 < 0.3 && r.x1 > -0.3) hit(s.id, "CAPTION", short(k.key), 1, f);
      }
      // --- cards against heads (a bubble's tail corner does not count: the lowest quarter of a bubble is ignored)
      for (const { k, r, bubble } of cards) for (const h of heads) {
        const rr = bubble ? { ...r, y0: r.y0 + 0.25 * (r.y1 - r.y0) } : r, a = area(inter(rr, h.r)) / area(h.r);
        if (a > 0.12) hit(s.id, "FACE", short(k.key) + "  over  " + h.p.key.split("|")[1], a, f);
      }
      // --- cards against each other
      for (let i = 0; i < cards.length; i++) for (let j = i + 1; j < cards.length; j++) {
        const a = area(inter(cards[i].r, cards[j].r)) / Math.min(area(cards[i].r), area(cards[j].r));
        if (a > 0.05) hit(s.id, "CARDS", short(cards[i].k.key) + "  x  " + short(cards[j].k.key), a, f);
      }
      // --- cards over props behind them
      for (const { k, r } of cards) for (const p of props) {
        const a = area(inter(r, p.r)) / area(p.r);
        if (a > 0.3) hit(s.id, "PROP", short(k.key) + "  over  " + p.k.key.slice(0, 24), a, f);
      }
      // --- heads: cut by the frame, in the caption strip, never seen
      for (const h of heads) {
        const id = h.p.key.split("|")[1] + "@" + Math.round(h.p.z * 2), e = seen.get(id) ?? { vis: 0, cut: 0, cap: 0, n: 0, f };
        const inside = h.r.x1 < 1 && h.r.x0 > -1 && h.r.y1 < 1 && h.r.y0 > -1, outside = h.r.x0 > 1 || h.r.x1 < -1 || h.r.y0 > 1 || h.r.y1 < -1;
        e.n++; if (inside) e.vis++; else if (!outside) { e.cut++; e.f = f; }
        if (h.r.y0 < -0.655 && h.r.y1 > -0.785 && h.r.x0 < 0.27 && h.r.x1 > -0.27) { e.cap++; e.f = f; }
        seen.set(id, e);
      }
    }
    for (const [id, e] of seen) {
      if (e.vis === 0 && e.cut === 0) hit(s.id, "UNSEEN", id, 1, e.f);
      else if (e.cut > 0.5 * samples) hit(s.id, "CUT", id, e.cut / samples, e.f);
      if (e.cap > 0.3 * samples) hit(s.id, "CAPTION", "head of " + id, e.cap / samples, e.f);
    }
  }
  return [...hits.values()];
};
`);
const out = path.join(tmp, "check.mjs");
await build({ entryPoints: [entry], bundle: true, format: "esm", platform: "node", outfile: out, logLevel: "error", loader: { ".json": "json" }, nodePaths: [path.resolve("node_modules")] });
// the drawing modules touch a canvas when they load: give them one that does nothing
const noop = new Proxy(function () {}, { get: (_t, k) => (k === Symbol.toPrimitive ? () => 0 : noop), apply: () => noop, construct: () => noop, set: () => true });
globalThis.document = { createElement: () => ({ getContext: () => noop, width: 0, height: 0, style: {} }) };
globalThis.window = globalThis.window ?? globalThis;
const { run } = await import(pathToFileURL(out).href + "?t=" + Date.now());
const bad = run(margin, first, last).sort((a, b) => a.shot - b.shot || a.kind.localeCompare(b.kind));
for (const b of bad) console.log(`#${String(b.shot).padStart(3)} f${b.f} ${b.kind.padEnd(8)} ${(b.amt * 100).toFixed(0).padStart(3)}% x${String(b.n).padEnd(3)} ${b.what}   [${b.name.slice(0, 46)}]`);
const by = {}; for (const b of bad) by[b.kind] = (by[b.kind] ?? 0) + 1;
console.log(bad.length ? `${bad.length} findings: ${Object.entries(by).map(([k, n]) => `${k} ${n}`).join(", ")}` : "layout clean: every card is inside the frame, clear of the captions, of faces, of other cards and of props");
