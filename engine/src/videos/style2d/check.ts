// Layout check for the 2D short: run before rendering. Reads the same scene data the renderer draws.
//   npx esbuild src/videos/style2d/check.ts --bundle --platform=node --outfile=out/2d/check.cjs --loader:.json=json && node out/2d/check.cjs
import { Draw, H, HOOK_BOX, MONA_FILM, paintBox, tagBox, W } from "./scenes";
import { TITANIC1 } from "./titanic1";
import { DANCE } from "./dance";
import { solve } from "./fig";

type Box = { x: number; y: number; w: number; h: number };
const M = 0.05 * W, TOP = 0.15 * H, BOT = 0.85 * H, BAND: Box = { x: 190, y: 0.625 * H, w: 700, h: 0.1 * H };
const hit = (a: Box, b: Box) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
const inside = (a: Box, x0: number, y0: number, x1: number, y1: number) => a.x >= x0 - 0.5 && a.y >= y0 - 0.5 && a.x + a.w <= x1 + 0.5 && a.y + a.h <= y1 + 0.5;
const fmt = (b: Box) => `[x ${Math.round(b.x)}-${Math.round(b.x + b.w)}, y ${Math.round(b.y)}-${Math.round(b.y + b.h)}]`;
const problems = new Map<string, { n: number; first: number; ex: string }>();
const flag = (scene: string, f: number, msg: string, ex: string) => { const k = `${scene}: ${msg}`, p = problems.get(k); if (p) p.n++; else problems.set(k, { n: 1, first: f, ex }); };
const film = process.argv[2] === "titanic1" ? TITANIC1 : process.argv[2] === "dance" ? DANCE : MONA_FILM, SCENES = film.scenes;
let frames = 0;
for (const sc of SCENES) {
  const T = sc.to - sc.from;
  for (let t = 0; t < T; t += 2) {
    frames++;
    const ds = sc.draw(t, T), f = sc.from + t;
    const cam = ds.find((d) => d.t === "cam") as Extract<Draw, { t: "cam" }> | undefined;
    const cv = (b: Box, fac = 1): Box => { if (!cam) return b; const z = 1 + (cam.z - 1) * fac; return { x: (b.x - cam.cx) * z + cam.cx, y: (b.y - cam.cy) * z + cam.cy, w: b.w * z, h: b.h * z }; };
    const faces: Box[] = [], tags: { n: string; b: Box }[] = [];
    if (sc.name === "hook") tags.push({ n: "hook text", b: HOOK_BOX });
    let hasBg = false;
    for (const d of ds) {
      if (d.t === "bg") {
        hasBg = true;
        const s = (H / 2208) * d.zoom, b = cv({ x: (W - 1248 * s) / 2 + d.ox, y: (H - 2208 * s) / 2 + d.oy, w: 1248 * s, h: 2208 * s }, 0.6);
        if (!(b.x <= 0 && b.y <= 0 && b.x + b.w >= W && b.y + b.h >= H)) flag(sc.name, f, "background does not cover the picture", fmt(b));
      } else if (d.t === "fig" && d.part !== "hands" && !d.free) {
        const g = solve(d.p, d.c ?? film.cast[d.who]), face = cv(g.faceBox), box = cv(g.box);
        faces.push(face);
        if (d.close) { if (!inside(face, 22, TOP, W - 22, BAND.y)) flag(sc.name, f, `${d.who}: close-up face not wholly inside the safe area`, fmt(face)); }
        else {
          if (!inside(box, M, 0.05 * H, W - M, 0.95 * H)) flag(sc.name, f, `${d.who}: figure not inside the picture with a 5 % margin`, fmt(box));
          if (!inside(face, M, TOP, W - M, BAND.y)) flag(sc.name, f, `${d.who}: face under the interface or the captions`, fmt(face));
          if (!sc.closeup && box.h < 0.5 * H) flag(sc.name, f, `${d.who}: smaller than half the picture height`, `${Math.round(box.h)} px`);
        }
      } else if (d.t === "paint" && d.key) {
        const b = cv(paintBox(d));
        if (!inside(b, M, TOP, W - M, BOT)) flag(sc.name, f, `${d.kind}: key prop outside the safe area`, fmt(b));
        if (sc.captions !== false && hit(b, BAND)) flag(sc.name, f, `${d.kind}: key prop under the captions`, fmt(b));
      } else if (d.t === "node" && d.key) {
        const b = cv(d.box, d.layer === "bg" ? 0.6 : d.layer === "fg" ? 1.5 : 1);
        if (!inside(b, M, TOP, W - M, BOT)) flag(sc.name, f, `${d.name}: key prop outside the safe area`, fmt(b));
        if (sc.captions !== false && hit(b, BAND)) flag(sc.name, f, `${d.name}: key prop under the captions`, fmt(b));
        if (d.layer === "fg") tags.push({ n: d.name, b });
      } else if (d.t === "tag" && d.age >= 0) tags.push({ n: `tag "${d.text}"`, b: tagBox(d) });
    }
    if (!hasBg) flag(sc.name, f, "no background", "");
    for (const tg of tags) {
      if (!inside(tg.b, M, TOP, W - M, BOT)) flag(sc.name, f, `${tg.n}: outside the safe area`, fmt(tg.b));
      if (sc.captions !== false && hit(tg.b, { ...BAND, x: 0, w: W })) flag(sc.name, f, `${tg.n}: on the caption band`, fmt(tg.b));
      for (const fc of faces) if (hit(tg.b, fc)) flag(sc.name, f, `${tg.n}: over a face`, `${fmt(tg.b)} vs face ${fmt(fc)}`);
      for (const o of tags) if (o !== tg && o.n > tg.n && hit(tg.b, o.b)) flag(sc.name, f, `${tg.n} overlaps ${o.n}`, `${fmt(tg.b)} vs ${fmt(o.b)}`);
    }
  }
}
console.log(`checked ${SCENES.length} scenes, ${frames} frames`);
if (!problems.size) console.log("LAYOUT OK: no problems");
for (const [k, v] of problems) console.log(`FAIL ${k}  (${v.n} frames, first at ${v.first})  ${v.ex}`);
process.exit(problems.size ? 1 : 0);
