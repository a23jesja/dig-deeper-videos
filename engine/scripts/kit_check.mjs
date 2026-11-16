// Layout check for a Short built in the emu look (default: the Titanic part 3 film). Run before rendering; exits 1 on a failure.
//   node scripts/kit_check.mjs [titanic3|titanic3test]      DUMP=1 prints every box (in % of the picture) on the first frame of each shot.
// Pompeii part 1 adds: texts (the hook and "PART 2", each with its frames; replaces hook), DOG boxes (the guard dog, measured), the kind "scenery" (no figures, 2 s at most),
//   TEXT (a big text in the top or bottom 15 %), lamps with a 5th element true = only a problem behind or between the legs.
// A film exports FILM_CHECK = { shots, camAt, sceneAt, kinds, hook?, events?, counts?, tags?, lamps?, boats?, props?, rockets?, passengers?, deckAt? }.
// On every 2nd frame it projects every person (st.places with key F| or S|) to the screen and checks DAILY-RULES "The look: the emu Short":
//   FRAME   a main figure not wholly inside the picture with a 5 % margin        FACE   a face in the top or bottom 15 %, or in the caption band 62.5-72.5 %
//   HOOK    the hook text over any figure box while it is shown                  EFFECT an effect (the rocket and its star) over the hook text
//   SMALL   the biggest figure under half the picture height (medium); every figure under a third (wide)      AIR   two main figure boxes that touch or overlap
//   WIDE    a wide or sea shot longer than 2 s; SEA: a sea shot whose lower half shows no boat       CLOSE-UP the whole face inside the safe area
//   PROP    a set piece (davit post, a sliding bench or chair ...) in front of any character or its face
//   SIDE    Sir Digsworth drawn in side view as a main figure
//   CHAIN   Sir Digsworth's monocle chain: upper end on the rim, lower end inside the torso, a sag below the straight line
//   GAZE    while an event is on, every main figure looks toward it (horizontal look has the sign of its side; lookUp >= 0.5 if it is > 15 % above the face)
//   LAMP    no lantern or lit window of the set inside the box of a main figure
//   TAG     a tag or the board over a figure, a face, the caption band, the hook text, another tag, or outside the picture
//   (kind "glide": a camera gliding along a crowd: men may enter and leave at the picture's sides; COUNT with across:true counts the figures seen over the whole shot)
//   TOPZONE no sign, board or head (cropped or not) inside the top 15 % of the picture
//   COUNT   the number of figures a shot must show (60+ on the packed deck, exactly 30 on the upturned boat)
// Crowd figures (name starting c_) count for HOOK, TAG and COUNT only. Person box and face: measured sizes (tables M / MS below).
import fs from "node:fs"; import path from "node:path"; import { pathToFileURL } from "node:url"; import { build } from "esbuild";
const FILMS = { titanic3: "src/videos/emu/titanic3", titanic3test: "src/videos/emu/titanic3Scenes", pompeii1: "src/videos/emu/pompeii1" };
if (process.env.FILM_MODULE) FILMS[process.argv[2] || "titanic3"] = process.env.FILM_MODULE;   // a modified copy of a film, for testing the rules with a deliberate failure
const which = process.argv.slice(2).find((a) => !a.startsWith("--")) || "titanic3";
if (!FILMS[which]) { console.error("unknown film " + which + " (" + Object.keys(FILMS).join(", ") + ")"); process.exit(2); }
const tmp = path.resolve("out/kit/_check"); fs.mkdirSync(tmp, { recursive: true });
const entry = path.join(tmp, "entry.ts");
const U = (p) => path.resolve(p).split(path.sep).join("/");
fs.writeFileSync(entry, `
import * as THREE from "three";
import { FILM_CHECK } from "${U(FILMS[which])}";
import { sirChain } from "${U("src/videos/emu/toon")}";
import { chunkWords } from "${U("src/videos/emu/captions")}";
export { chunkWords };
export const run = (dump: boolean, FCo?: any) => {
  const FC: any = FCo ?? FILM_CHECK, W = 1080, H = 1920, cam = new THREE.PerspectiveCamera(40, W / H, 0.2, 1500), right = new THREE.Vector3(), v = new THREE.Vector3();
  const fails = new Map<string, { n: number; f: number; ex: string }>(), lines: string[] = [];
  const flag = (shot: number, msg: string, f: number, ex: string) => { const k = "shot " + shot + ": " + msg, e = fails.get(k); if (e) e.n++; else fails.set(k, { n: 1, f, ex }); };
  const BAND = { y0: 0.625 * H, y1: 0.725 * H };
  const TXTS: any[] = (FC.texts ?? (FC.hook ? [{ ...FC.hook, a: 0, b: FC.hook.end }] : [])).map((hk: any) => { const n = Math.max(...hk.lines.map((l: string) => l.length)), tw = hk.size * 0.62 * n, cx = hk.x + hk.w / 2; return { a: hk.a, b: hk.b, x0: cx - tw / 2, x1: cx + tw / 2, y0: hk.y, y1: hk.y + hk.h }; });
  const HKT = TXTS.length ? TXTS[0] : null, hook = HKT ? { end: HKT.b } : null;
  let frames = 0, exemptEdge = 0;
  const M: any = { sir: [1.66, 1.29, 0.52, 0.58], officer: [1.61, 1.28, 0.52, 0.58], lady: [1.59, 1.28, 0.52, 0.58], gent: [1.76, 1.31, 0.52, 0.58], kid: [1.32, 1.0, 0.48, 0.5] };
  M.baker = [1.63, 1.29, 0.52, 0.58]; M.soldier = [1.77, 1.29, 0.52, 0.65]; M.merchant = [1.57, 1.29, 0.52, 0.6]; M.boy = [1.27, 1.0, 0.48, 0.52]; M.woman = [1.62, 1.28, 0.52, 0.64];   // measured on out/pomp1/meas_0003.png (scale 0.5, soles at 975)
  const DOGM: any = { sit: [1.31, 1.85], stand: [1.14, 1.85], run: [1.22, 1.9], bark: [1.2, 1.94] };   // dog card at scale 1: height of the head top, width of the drawing (m); the head sits 0.54 m toward the nose from the centre, 0.95 m up
  const MS: any = { lady: [1.26, 0.94, 0.52, 0.6], kid: [1.06, 0.77, 0.48, 0.52] };
  for (const s of FC.shots) {
    const kind = FC.kinds[s.id];
    if ((kind === "wide" || kind === "sea" || kind === "scenery") && s.b - s.a > 60) flag(s.id, "WIDE shot longer than 2 s", s.a, (s.b - s.a) + " frames");
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
      const dogBoxes = st.places.filter((p: any) => /^DOG\\|/.test(p.key)).map((p: any) => {
        const o = JSON.parse(p.key.split("|")[1] || "{}"), sc = p.scale ?? 1, [dh, dw] = DOGM[o.mode ?? "stand"], dir = p.mirror ? -1 : 1;
        const b: any = { name: "dog", crowd: false, opts: o, key: p.key, p, side: false, dog: true, dist: cam.position.distanceTo(new THREE.Vector3(p.x, p.y + 0.5, p.z)), pass: false, close: kind === "close", swim: false, ...rect(p.x, p.y, p.z, dw * sc, dh * sc) };
        b.face = rect(p.x + right.x * dir * 0.54 * sc, p.y + (dh - 0.3) * sc, p.z + right.z * dir * 0.54 * sc, 0.45 * sc, 0.45 * sc);
        return b;
      });
      const boxes = [...dogBoxes, ...st.places.filter((p: any) => /^[FS]\\|/.test(p.key)).map((p: any) => {
        const parts = p.key.split("|"), o = JSON.parse(parts[2] || "{}"), sc = p.scale ?? 1, sit = o.mode === "sit", side = parts[0] === "S", arms = !!(o.point || o.cheer || o.shrug || o.wave !== undefined);
        const name = parts[1], base = name.replace(/^c_/, "").replace(/^sir.*/, "sir").replace(/^kid.*/, "kid").replace(/^\\d+$/, "gent"), crowd = name.startsWith("c_"), swim = o.swim ?? 0;
        const [mh, mf, mfs, mw] = (sit ? MS : M)[base] ?? (sit ? MS.lady : M.sir), hgt = mh - swim, fy = mf, w = (o.swim !== undefined ? 0.7 : arms ? (base === "sir" ? 0.66 : 0.85) : side ? 0.35 + 0.45 * (o.stride ?? 1) : mw) * sc;
        const b: any = { name, crowd, opts: o, key: p.key, p, side, dist: cam.position.distanceTo(new THREE.Vector3(p.x, p.y + 1, p.z)), pass: (FC.passengers || []).includes(name), close: kind === "close", swim: !!swim, ...rect(p.x, p.y + swim, p.z, w, hgt * sc) };
        b.face = rect(p.x, p.y + (fy - mfs / 2) * sc, p.z, mfs * sc, mfs * sc);
        if (base === "sir" && arms) { const hx = px(p.x, p.y + fy * sc, p.z)[0], dx = hx - (b.x0 + b.x1) / 2; b.x0 += dx; b.x1 += dx; b.face.x0 += dx; b.face.x1 += dx; }   // Sir with raised arms: the drawn arms are symmetric about his head; the check box is centred on his feet, which a rolled camera moves away from the head
        return b;
      })];
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
          if ((kind !== "glide" && (b.x0 < (FC.frameSide?.[s.id] ?? 0.05) * W || b.x1 > (1 - (FC.frameSide?.[s.id] ?? 0.05)) * W)) || b.y0 < 0.05 * H || b.y1 > 0.95 * H) flag(s.id, "FRAME " + who + " not inside the picture with a 5 % margin", f, R(b));
          if (b.face.y0 < 0.15 * H) flag(s.id, "FACE " + who + " in the top 15 %", f, R(b.face));
          if (b.face.y1 > 0.85 * H) flag(s.id, "FACE " + who + " in the bottom 15 %", f, R(b.face));
          if (b.face.y1 > BAND.y0 && b.face.y0 < BAND.y1) flag(s.id, "FACE " + who + " under the caption band", f, R(b.face));
        }
        big = Math.max(big, (b.y1 - b.y0) / H);
      }
      for (const T of TXTS) if (f >= T.a && f < T.b) {
        for (const b of boxes) if (hit(b, T)) flag(s.id, "HOOK text over " + b.name, f, R(b) + " " + R(T));
        if (T.y0 < 0.15 * H || T.y1 > 0.85 * H) flag(s.id, "TEXT a big text reaches into the top or bottom 15 %", f, R(T));
      }
      if (kind === "medium" && big < 0.5) flag(s.id, "SMALL biggest figure under half the picture height", f, (big * 100).toFixed(0) + " %");
      const seaOk = (() => { const bs = FC.boats ? FC.boats(s.id, f) : []; return bs.some((q: number[]) => { const p = px(q[0], q[1], q[2]); return p[2] < 1 && p[1] > H * 0.5 && p[1] < H * 0.98 && p[0] > 0 && p[0] < W; }); })();
      if (kind === "sea" && !seaOk) flag(s.id, "SEA the lower half of the picture shows no boat on the water", f, "");
      if (kind === "wide" || kind === "sea") for (const b of main) if ((b.y1 - b.y0) / H < 0.33 && !seaOk) flag(s.id, "SMALL " + b.name + " under a third of the picture height", f, ((b.y1 - b.y0) / H * 100).toFixed(0) + " %");
      for (let i = 0; i < main.length; i++) for (let j = i + 1; j < main.length; j++) { const a = main[i], b = main[j]; if (hit(a, b, 0.02 * W)) flag(s.id, "AIR " + a.name + " and " + b.name + " touch", f, R(a) + " " + R(b)); }
      // set pieces over or between the main figures
      if (FC.props) for (const p of FC.props(s.id, f)) {
        const r = rect(p.x, p.y, p.z, p.w, p.h); if (r.behind || r.x1 < 0 || r.x0 > W) continue; const pd = cam.position.distanceTo(new THREE.Vector3(p.x, p.y + 1, p.z));
        for (const b of boxes.filter((q: any) => !q.behind)) { if (pd > b.dist + 0.3) continue;   // (every character, not only the main ones; sliding props count too) a prop behind the figure is fine: only one standing in front of or between them counts
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
          else if (b.key.startsWith("F|")) { const lk = b.opts.look ?? 0; if (sgn && lk * sgn < 0.25) flag(s.id, "GAZE " + b.name + " does not look toward the event (look " + lk.toFixed(2) + ")", f, "event x " + Math.round(q[0]) + " face x " + Math.round(fcx)); }
          if (b.key.startsWith("F|") && q[1] < fcy - 0.15 * H && (b.opts.lookUp ?? 0) < 0.5) flag(s.id, "GAZE " + b.name + " does not look up at an event " + Math.round((fcy - q[1]) / H * 100) + " % above the face (lookUp " + (b.opts.lookUp ?? 0).toFixed(2) + ")", f, "");
        }
      }
      // LAMP: lit things of the set behind a main figure
      if (FC.lamps) for (const l of FC.lamps(FC.deckAt ? FC.deckAt(s.id, f) : undefined)) { const q = px(l[0], l[1], l[2]); if (q[2] > 1) continue; for (const b of main) if (q[0] > b.x0 && q[0] < b.x1 && q[1] > b.y0 && q[1] < b.y1 && (!l[4] || q[1] > b.y0 + 0.55 * (b.y1 - b.y0))) flag(s.id, "LAMP a lit window or lantern shows inside the box of " + b.name + (l[4] ? " (behind its legs)" : ""), f, Math.round(q[0]) + "," + Math.round(q[1]) + " in " + R(b)); }
      // TAG: tags and the board
      if (kind !== "close") for (const b of boxes) if (!b.behind && !b.swim && b.face && b.face.y0 < 0.15 * H) flag(s.id, "TOPZONE the head of " + b.name + " is inside the top 15 % of the picture", f, R(b.face));
      const cards: { name: string; box: any }[] = [];
      for (const t of FC.tags || []) if (t.id === s.id && f >= t.a && f < t.b) cards.push({ name: "tag '" + (t.lines || [t.l1]).join(" ") + "'", box: t.box });
      if (FC.board && FC.board.id === s.id && f >= FC.board.l1) cards.push({ name: "the board", box: FC.board.box });
      for (let i = 0; i < cards.length; i++) {
        const c1 = cards[i], bx = c1.box;
        if (bx.y0 < 0.15 * H) flag(s.id, "TOPZONE " + c1.name + " starts inside the top 15 % of the picture", f, R(bx));
        if (bx.x0 < 0.03 * W || bx.x1 > 0.97 * W || bx.y0 < 0.03 * H || bx.y1 > 0.97 * H) flag(s.id, "TAG " + c1.name + " outside the picture", f, R(bx));
        for (const b of boxes) { if (hit(bx, b)) flag(s.id, "TAG " + c1.name + " covers a figure (" + b.name + ")", f, R(bx) + " " + R(b)); }
        if (hit(bx, { x0: 0, x1: W, y0: BAND.y0, y1: BAND.y1 })) flag(s.id, "TAG " + c1.name + " in the caption band", f, R(bx));
        for (const T of TXTS) if (f >= T.a && f < T.b && hit(bx, T)) flag(s.id, "TAG " + c1.name + " over the big text", f, R(bx));
        for (let j = i + 1; j < cards.length; j++) if (hit(bx, cards[j].box)) flag(s.id, "TAG " + c1.name + " over " + cards[j].name, f, "");
      }

      // ---- staging rules (DAILY-RULES "Staging checks") ----
      const CAPB = FC.band ?? { y0: 1400, y1: 1600 };
      const chars = boxes.filter((b: any) => !b.behind);
      const h8 = (b: any) => (b.y1 - b.y0) / H >= 0.08;
      const head = (b: any) => { const fw = b.face.x1 - b.face.x0, fh = b.face.y1 - b.face.y0; return { x0: b.face.x0 - 0.15 * fw, x1: b.face.x1 + 0.15 * fw, y0: b.face.y0 - 0.4 * fh, y1: b.face.y1 + 0.05 * fh }; };
      const heads = chars.map((b: any) => ({ b, h: head(b) }));
      // PROP (foreground): a blurred foreground piece (amphorae, column, awning edge) keeps 3 % of the picture width away from every body
      if (FC.fgBoxes) for (const fb of FC.fgBoxes(s.id, f)) for (const b of chars) if (b.x1 > fb.x0 * W - 0.03 * W && b.x0 < fb.x1 * W + 0.03 * W && b.y1 > fb.y0 * H && b.y0 < fb.y1 * H) flag(s.id, "PROP the foreground " + fb.name + " is closer than 3 % to " + b.name, f, R(b));
      const inBox = (q: number[], h: any) => q[0] > h.x0 && q[0] < h.x1 && q[1] > h.y0 && q[1] < h.y1;
      // POLE: set pieces, masts, rocket trails and bursts, never starting, ending or sitting behind a head or hat
      if (FC.props) for (const p of FC.props(s.id, f)) { const r = rect(p.x, p.y, p.z, p.w, p.h); if (r.behind) continue; for (const { b, h } of heads) if (hit(r, h)) flag(s.id, "POLE " + p.name + " over the head of " + b.name, f, R(r)); }
      if (FC.poles) for (const p of FC.poles(s.id, f)) {
        const pts = Array.from({ length: 13 }, (_, i) => px(p.a[0] + (p.b[0] - p.a[0]) * i / 12, p.a[1] + (p.b[1] - p.a[1]) * i / 12, p.a[2] + (p.b[2] - p.a[2]) * i / 12));
        for (const { b, h } of heads) if (pts.some((q: number[]) => q[2] < 1 && inBox(q, h))) flag(s.id, "POLE " + p.name + " behind the head of " + b.name, f, R(h));
      }
      if (FC.rockets) for (const r of FC.rockets) {
        const a = f / 30 - r.t0, rise = r.rise ?? 1.3; if (a < -0.05 || a > rise + 1.6) continue;
        const pos = (aa: number) => { const u = Math.min(1, Math.max(0, aa / rise)), e = 1 - (1 - u) * (1 - u); return [0, 1, 2].map((k) => r.from[k] + (r.apex[k] - r.from[k]) * e); };
        const trail = [0, 1, 2, 3, 4].map((i) => px(...(pos(Math.min(a, rise) - i * 0.12) as [number, number, number])));
        for (const { b, h } of heads) if (trail.some((q: number[]) => q[2] < 1 && inBox(q, h))) flag(s.id, "POLE a rocket or its trail behind the head of " + b.name, f, R(h));
        if (a >= rise + 0.1 && a <= rise + 1.3) {
          const c = r.apex, rad = Math.min(r.radius ?? 8, 5) * (1 - Math.exp(-(a - rise) * 2.2)) + 0.6, p0 = px(c[0], c[1] - 1.6 * (a - rise), c[2]), p1 = px(c[0] + right.x * rad, c[1], c[2] + right.z * rad), pr = Math.abs(p1[0] - p0[0]) * 0.75;
          if (p0[2] < 1 && (p0[1] < 0.16 * H || p0[1] > 0.40 * H || p0[0] - pr < 0 || p0[0] + pr > W || p0[1] - pr < 0)) flag(s.id, "BURST a rocket burst must be whole inside the picture with its centre between 16 and 40 % of the height", f, "centre " + Math.round(p0[0]) + "," + Math.round(p0[1]) + " radius " + Math.round(pr));
        }
        if (a >= rise) {
          const c = r.apex, rad = Math.min(r.radius ?? 8, 5) * (1 - Math.exp(-(a - rise) * 2.2)) + 0.6, p0 = px(c[0], c[1] - 1.6 * (a - rise), c[2]), p1 = px(c[0] + right.x * rad, c[1], c[2] + right.z * rad), pr = Math.abs(p1[0] - p0[0]) * 0.6;
          if (p0[2] < 1) for (const { b, h } of heads) if (Math.min(h.x1, p0[0] + pr) - Math.max(h.x0, p0[0] - pr) > 0 && Math.min(h.y1, p0[1] + pr) - Math.max(h.y0, p0[1] - pr) > 0) flag(s.id, "POLE a rocket burst is not in open sky: it is behind the head of " + b.name, f, R(h) + " burst " + Math.round(p0[0]) + "," + Math.round(p0[1]) + " pr " + Math.round(pr));
        }
      }
      // OVERLAP: two characters never share a spot (at most a quarter hidden, never a face); packed crowds and far rows (< 8 %) are exempt
      const packed = (FC.packed || []).includes(s.id);
      for (let i = 0; i < chars.length; i++) for (let j = 0; j < chars.length; j++) {
        if (i === j) continue; const near = chars[i], far = chars[j];
        if (near.dist >= far.dist) continue;
        if (packed && (far.y1 - far.y0) / H > 0.15) { const ix0 = Math.min(near.x1, far.face.x1) - Math.max(near.x0, far.face.x0), iy0 = Math.min(near.y1, far.face.y1) - Math.max(near.y0, far.face.y0); if (ix0 > 0 && iy0 > 0 && (near.crowd || far.crowd || true)) { flag(s.id, "OVERLAP " + near.name + " hides the face of " + far.name + " in the near rows (figures over 15 % of the height)", f, R(near) + " " + R(far.face)); continue; } }
        if (near.crowd && far.crowd && packed) continue; if (!h8(near) && !h8(far)) continue; if (packed && (near.crowd || far.crowd) && !(!near.crowd && !far.crowd)) continue;
        const ix = Math.min(near.x1, far.x1) - Math.max(near.x0, far.x0), iy = Math.min(near.y1, far.y1) - Math.max(near.y0, far.y0);
        if (ix <= 0 || iy <= 0) continue;
        if (ix * iy > 0.25 * (far.x1 - far.x0) * (far.y1 - far.y0)) flag(s.id, "OVERLAP " + near.name + " hides more than a quarter of " + far.name, f, R(near) + " " + R(far));
        else if (hit(near, far.face)) flag(s.id, "OVERLAP " + near.name + " covers the face of " + far.name, f, R(near) + " " + R(far.face));
      }
      // EDGE: nobody cut by the picture edge (close-ups excepted); figures under 8 % of the height are exempt and counted
      if (kind !== "close") for (const b of chars) { if (b.swim && false) continue; if ((kind !== "glide" && (b.x0 < -(FC.edgeTol?.[s.id] ?? 0) * W || b.x1 > W * (1 + (FC.edgeTol?.[s.id] ?? 0)))) || b.y0 < 0 || b.y1 > H) { if (h8(b)) flag(s.id, "EDGE " + b.name + " is cut by the picture edge", f, R(b)); else exemptEdge++; } }
      // CAPTION: the caption band (y 1400-1600) never over a body box (not in close-ups), a face or a sign
      for (const b of chars) { if (b.behind) continue; if ((b.face.y1 - b.face.y0) / H <= 0.35 && (h8(b) || !b.crowd) && hit(b, { x0: 0, x1: W, y0: CAPB.y0, y1: CAPB.y1 })) flag(s.id, "CAPTION the caption band is over the body of " + b.name + " (only a face taller than 35 % of the picture may share the band)", f, R(b)); if (hit(b.face, { x0: 0, x1: W, y0: CAPB.y0, y1: CAPB.y1 })) flag(s.id, "CAPTION the caption band is over the face of " + b.name, f, R(b.face)); }
      // WATER / FLOAT
      for (const b of chars) {
        if (b.swim) { if (!b.opts.water) flag(s.id, "WATER " + b.name + " is in the water but drawn without the wavy waterline mask", f, ""); }
        else if (FC.onSurface && !FC.onSurface(s.id, f, b.p.x, b.p.y, b.p.z)) flag(s.id, "FLOAT " + b.name + " stands on no declared surface (y " + b.p.y.toFixed(2) + ")", f, "");
      }
      // GRIEF: no smile, wink, squint or blink while the deaths are spoken
      if ((FC.grief || []).some((g: any) => f >= g.a && f < g.b)) for (const b of chars) { const o = b.opts, ex = o.expr ?? "neutral"; if (["smile", "smile_closed", "grin", "laugh", "relief", "relief_open", "squint", "pained", "stern", "lick", "whistle", "dazed"].includes(ex) || (o.blink ?? 0) > 0) flag(s.id, "GRIEF " + b.name + " smiles, winks, squints or blinks on a line about deaths (" + ex + ", blink " + (o.blink ?? 0) + ")", f, ""); }
      // COUNT
      for (const c2 of FC.counts || []) if (c2.id === s.id) {
        if (c2.across) {   // a gliding camera: the whole crowd is counted over the shot, not in one frame
          const seen: Set<string> = ((globalThis as any).__seen ||= {})[s.id] ||= new Set(); for (const b of boxes) if (!b.swim && !b.behind && (b.y0 + b.y1) / 2 > 0 && (b.y0 + b.y1) / 2 < H && (b.x0 + b.x1) / 2 > -0.1 * W && (b.x0 + b.x1) / 2 < 1.1 * W) seen.add(b.name);
          if (f >= s.b - 1 && (seen.size < c2.min || seen.size > c2.max)) flag(s.id, "COUNT " + c2.what + ": " + seen.size + " seen along the glide, wanted " + c2.min + "-" + c2.max, f, "");
          continue;
        }
        const n = boxes.filter((b: any) => !b.swim && !b.behind && (b.x0 + b.x1) / 2 > 0 && (b.x0 + b.x1) / 2 < W && (b.y0 + b.y1) / 2 > 0 && (b.y0 + b.y1) / 2 < H).length;
        if (n < c2.min || n > c2.max) flag(s.id, "COUNT " + c2.what + ": " + n + " visible, wanted " + c2.min + (c2.max < 9999 ? "-" + c2.max : "+"), f, "");
      }
    }
  }
  if (FC.captions) for (const c of FC.captions.chunks) { if (c.words > 3 || c.size < 96 - 1e-6 && false) flag(0, "CAPTION a chunk of " + c.words + " words", 0, c.text); if (c.text.split(" ").length > 3) flag(0, "CAPTION chunk '" + c.text + "' has more than 3 words", 0, ""); if (/\d$/.test(c.text) && FC.captions.wordsAfter?.(c)) flag(0, "CAPTION a number is split from its unit in '" + c.text + "'", 0, ""); }
  for (const t of [...(FC.tags || []), ...(FC.board ? [FC.board] : [])]) if ((t.px ?? 0) < 120) flag(t.id, "SIGN the text of the sign is only " + (t.px ?? 0) + " px tall, the captions are 120 px", t.a ?? 0, "");
  if (FC.signFacts) { const txt = [...(FC.tags || []), ...(FC.board ? [FC.board] : [])].map((t: any) => (t.lines || []).join(" ")).join(" | "); for (const sf of FC.signFacts) if (!txt.includes(sf)) flag(0, "SIGNFACT the signs must say '" + sf + "' (the narration says about)", 0, ""); }
  if (FC.endHook) { const last = FC.total - 30, ch = FC.captions ? FC.captions.chunks.filter((c: any) => c.b * 30 > last) : []; if (FC.endHook.a > last) flag(FC.shots.length, "ENDHOOK the hook text starts at frame " + FC.endHook.a + ", later than the last second", FC.endHook.a, ""); if (FC.captions && !ch.length) flag(FC.shots.length, "ENDHOOK no caption in the last second", last, ""); }
  if (exemptEdge) lines.push("EDGE: " + exemptEdge + " figure-frames under 8 % of the picture height were exempt from the edge rule (far rows)");
  return { frames, fails: [...fails].map(([k, e]) => k + "  (" + e.n + " frames, first " + e.f + ")  " + e.ex), lines };
};
export const selftest = () => {
  const cam = { pos: [0, 1.2, 0] as [number, number, number], look: [0, 1.2, 10] as [number, number, number], fov: 40, roll: 0 };
  const P = (name: string, x: number, y: number, z: number, o: any = {}) => ({ key: "F|" + name + "|" + JSON.stringify({ mode: "stand", ...o }) + "|t0", x, y, z, scale: 1 });
  const mk = (places: any[], extra: any = {}, kind = "medium") => ({ shots: [{ id: 1, a: 0, b: 2, light: "night" }], kinds: { 1: kind }, camAt: () => cam, sceneAt: () => ({ places, fx: [] }), total: 90, onSurface: () => true, ...extra });
  const has = (fc: any, rule: string) => (run(false, fc) as any).fails.some((l: string) => l.includes(": " + rule + " "));
  const cases: [string, any, any][] = [
    ["POLE", mk([P("officer", 0, 0, 4)], { props: () => [{ name: "davit", x: 0, y: 1.0, z: 8, w: 0.3, h: 1 }] }), mk([P("officer", 0, 0, 4)], { props: () => [{ name: "davit", x: 3, y: 1.0, z: 8, w: 0.3, h: 1 }] })],
    ["TOPZONE", mk([], { tags: [{ id: 1, a: 0, b: 10, box: { x0: 100, y0: 100, x1: 600, y1: 400 }, px: 120 }] }), mk([], { tags: [{ id: 1, a: 0, b: 10, box: { x0: 100, y0: 320, x1: 600, y1: 620 }, px: 120 }] })],
    ["POLE", mk([P("officer", 0, 0, 4)], { poles: () => [{ name: "rail top bar", a: [-6, 1.5, 9], b: [6, 1.5, 9] }] }), mk([P("officer", 0, 0, 4)], { poles: () => [{ name: "rail top bar", a: [-6, 0.45, 9], b: [6, 0.45, 9] }] })],
    ["PROP", mk([P("c_a", 0, 0, 5)], { props: () => [{ name: "sliding bench", x: 0, y: 0, z: 2.5, w: 2, h: 1.2 }] }), mk([P("c_a", 0, 0, 5)], { props: () => [{ name: "sliding bench", x: 3, y: 0, z: 2.5, w: 2, h: 1.2 }] })],
    ["POLE", mk([P("officer", 0, 0, 4)], { rockets: [{ t0: -1.3, rise: 1.3, from: [0, 1, 12], apex: [0, 1.6, 12], radius: 3 }] }), mk([P("officer", 0, 0, 4)], { rockets: [{ t0: -1.3, rise: 1.3, from: [3, 1, 12], apex: [3, 5, 12], radius: 3 }] })],
    ["OVERLAP", mk([P("officer", 0, 0, 4), P("gent", 0.1, 0, 6)]), mk([P("officer", -0.5, 0, 4), P("gent", 0.6, 0, 6)])],
    ["EDGE", mk([P("officer", 0.9, 0, 4)]), mk([P("officer", 0, 0, 4)])],
    ["WATER", mk([P("officer", 0, -0.8, 4, { swim: 0.8 })]), mk([P("officer", 0, -0.8, 4, { swim: 0.8, water: true })])],
    ["FLOAT", mk([P("officer", 0, 0, 4)], { onSurface: () => false }), mk([P("officer", 0, 0, 4)], { onSurface: () => true })],
    ["GRIEF", mk([P("officer", 0, 0, 4, { expr: "smile" })], { grief: [{ a: 0, b: 10 }] }), mk([P("officer", 0, 0, 4, { expr: "nervous", blink: 0 })], { grief: [{ a: 0, b: 10 }] })],
    ["SIGN", mk([], { tags: [{ id: 1, a: 0, b: 10, box: { x0: 100, y0: 100, x1: 600, y1: 300 }, px: 40 }] }), mk([], { tags: [{ id: 1, a: 0, b: 10, box: { x0: 100, y0: 100, x1: 600, y1: 300 }, px: 120 }] })],
    ["CAPTION", mk([P("officer", 0, 0, 4)], {}, "close"), mk([P("officer", 0, 0, 9)])],
    ["OVERLAP", mk([P("c_a", 0, 0, 3.5), P("c_b", 0.05, 0, 4.5)], { packed: [1] }), mk([P("c_a", -0.5, 0, 3.5), P("c_b", 0.7, 0, 4.5)], { packed: [1] })],
    ["BURST", mk([], { rockets: [{ t0: -1.8, rise: 1.3, from: [3, 1, 12], apex: [3, 3.1, 12], radius: 1 }] }), mk([], { rockets: [{ t0: -1.8, rise: 1.3, from: [0, 1, 12], apex: [0, 3.0, 12], radius: 0.6 }] })],
    ["SIGNFACT", mk([], { signFacts: ["ABOUT 700"], tags: [{ id: 1, a: 0, b: 10, box: { x0: 100, y0: 300, x1: 700, y1: 500 }, lines: ["700 SAVED"], px: 120 }] }), mk([], { signFacts: ["ABOUT 700"], tags: [{ id: 1, a: 0, b: 10, box: { x0: 100, y0: 300, x1: 700, y1: 500 }, lines: ["ABOUT 700", "SAVED"], px: 120 }] })],
    ["ENDHOOK", mk([], { endHook: { a: 80 }, captions: { chunks: [{ a: 0, b: 2, text: "A B", words: 2, size: 120 }] } }), mk([], { endHook: { a: 40 }, captions: { chunks: [{ a: 0, b: 3, text: "A B", words: 2, size: 120 }] } })],
  ];
  const proven: string[] = [], broken: string[] = [];
  for (const [rule, bad, good] of cases) { const a = has(bad, rule), b = !has(good, rule); (a && b ? proven : broken).push(rule + (a && b ? "" : " (fail case " + (a ? "caught" : "MISSED") + ", pass case " + (b ? "clean" : "FLAGGED") + ")")); }
  return { proven, broken };
};`);
const out = path.join(tmp, "check.mjs");
await build({ entryPoints: [entry], bundle: true, format: "esm", platform: "node", outfile: out, loader: { ".json": "json" }, logLevel: "error" });
const noop = new Proxy(function () {}, { get: () => noop, apply: () => noop });
globalThis.document = { createElement: () => ({ getContext: () => noop, width: 0, height: 0, style: {} }) };
globalThis.window = globalThis.window ?? globalThis; globalThis.Image = class {}; globalThis.self = globalThis;
const { run, selftest } = await import(pathToFileURL(out).href + "?t=" + Date.now());
if (process.argv.includes("--selftest")) { const r = selftest(); console.log("SELFTEST proven (a failing case is caught, a passing case is clean): " + [...new Set(r.proven)].join(", ")); if (r.broken.length) { console.log("SELFTEST NOT proven: " + r.broken.join("; ")); process.exit(1); } console.log("SELFTEST OK"); process.exit(0); }
const r = run(!!process.env.DUMP);
for (const l of r.lines) console.log(l);
console.log(`checked ${r.frames} frames`);
if (!r.fails.length) console.log("LAYOUT OK: no problems"); else for (const l of r.fails) console.log("FAIL " + l);
process.exit(r.fails.length ? 1 : 0);
