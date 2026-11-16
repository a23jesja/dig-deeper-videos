// Shared kit for the long film "The Man Who Stole the Mona Lisa" (1920 x 1080, 10 min 10 s): word timings, the
// rooms, camera presets and the small helpers every shot uses. Landscape; +x is screen-left; the camera looks toward +z.
import { FrontOpts, Pen } from "./toon";
import { fxBanner, fxStamp } from "./wltoon";
import { fxBubble, fxSparkle, fxSweat, Icon } from "./longtoon";
import { fxTalk } from "./pigtoon";
import { Stage, CamInfo, Who, person, q, lidAt } from "./castbase";
import { FPS, V3, Zone, Light, clamp01 } from "./story";
import { Scene, SIR } from "./scenes";
import { fxMona, fxHooks, fxOtherPortrait, fxTagCard } from "./monatoon";
import wordsJson from "./wordsM.json";
import talkJson from "./talkM.json";

type Wd = { w: string; a: number; b: number; line: string };
const WORDS = wordsJson as Wd[];
const TALK = talkJson as number[];
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
/** the frame on which a line (or the n-th `word` in it) is spoken */
export const at = (line: string, word?: string, n = 0): number => {
  const L = WORDS.filter((w) => w.line === line);
  if (!L.length) throw new Error(`no line ${line}`);
  if (!word) return Math.round(L[0].a * 30);
  const m = L.filter((w) => norm(w.w) === norm(word));
  if (!m[n]) throw new Error(`no word "${word}" (${n}) in line ${line}`);
  return Math.round(m[n].a * 30);
};
/** the frame on which a line ends */
export const end = (line: string): number => { const L = WORDS.filter((w) => w.line === line); if (!L.length) throw new Error(`no line ${line}`); return Math.round(L[L.length - 1].b * 30); };
export const TOTAL_M = 18296;

export type Ctx = { out: Scene; f: number; a: number; b: number; n: number; t: number; cam: CamInfo };
/** one shot: when it starts, where it is, how the camera sits (pos, look, fov, push rate; mv = drift of pos and look over the shot) and what happens */
export type Sh = { name: string; a: number; zone: Zone; light?: Light; cam: [V3, V3, number, number?]; mv?: [V3, V3]; x?: number; draw: (c: Ctx) => void };

// ---------------- rooms of the "louvre" zone (x centres) ----------------
export const GAL = 0, STAIR = 60, ROOM = 120, FLOR = 180, UFF = 240;
/** where the Mona Lisa hangs on a gallery's back wall */
export const WALL_Y = 1.95, WALL_Z = 5.8;
// ---------------- camera presets ----------------
type CamT = [V3, V3, number, number?];
/** gallery: the whole wall */
export const gWide = (cx = GAL, rate = 0.0004): CamT => [[cx, 2.2, -8.5], [cx, 2.6, 6], 36, rate];
/** gallery: people full length, the wall behind */
export const gFull = (cx = GAL, dx = 0, rate = 0.0005): CamT => [[cx + dx, 1.8, -5], [cx + dx, 1.9, 6], 34, rate];
/** gallery: people from the knees up, close to the wall */
export const gMid = (cx = GAL, dx = 0, rate = 0.0006): CamT => [[cx + dx, 1.7, -1.5], [cx + dx, 1.75, 6], 34, rate];
/** gallery: the picture fills the height */
export const gClose = (cx = GAL, rate = 0.0007): CamT => [[cx, 1.9, 2.3], [cx, 1.86, 6], 30, rate];
/** a small room, full length */
export const room = (cx: number, dx = 0, z = -6.5, rate = 0.0005, y = 1.8): CamT => [[cx + dx, 1.9, z], [cx + dx, y, 3], 36, rate];
/** the office zone (police, newspaper, court): as in the earlier films */
export const office = (cx: number, z = -6.4, y = 1.9, rate = 0.0005): CamT => [[cx, 1.9, z], [cx, y, 1.5], 34, rate];
/** the square in front of a far building (Louvre, Florence): people small */
export const town = (cx = 0, rate = 0.0004): CamT => [[cx, 1.9, -9], [cx, 4.2, 30], 42, rate];
export const near = (cx = 0, rate = 0.0005): CamT => [[cx, 1.8, -6], [cx, 3.0, 20], 42, rate];
/** an insert: something at (x, y, z) seen from d metres */
export const ins = (x: number, y: number, z: number, d = 2.6, fov = 30, rate = 0.0008): CamT => [[x, y, z - d], [x, y, z], fov, rate];

// ---------------- people ----------------
type PO = { scale?: number; y?: number; shadow?: boolean };
/** a person standing (front view) */
export const P = (c: Ctx, who: Who, x: number, z: number, fo: FrontOpts = {}, o: PO = {}) =>
  person(c.out, c.cam, who, x, o.y ?? 0, z, { scale: o.scale, fo: { mode: "stand", blink: lidAt(c.t, who.i + 30), ...fo } }, o.shadow ?? true);
/** Sir Digsworth, lips moving with the voice */
export const sir = (c: Ctx, x: number, z: number, fo: FrontOpts = {}) =>
  person(c.out, c.cam, SIR, x, 0, z, { fo: { mode: "stand", expr: "smile", blink: lidAt(c.t, 3), ...fo }, talk: TALK[Math.max(0, Math.min(TALK.length - 1, c.f))] ?? 0 });
/** a person seen from the side, standing or mid-stride (phase 0..1). The side view faces screen-right; mirror = faces screen-left */
export const S = (c: Ctx, who: Who, x: number, z: number, o: PO & { mirror?: boolean; phase?: number; expr?: FrontOpts["expr"] } = {}) =>
  person(c.out, c.cam, who, x, o.y ?? 0, z, { side: true, mirror: o.mirror, scale: o.scale, so: o.phase === undefined ? { mode: "stand", expr: o.expr, blink: lidAt(c.t, who.i + 30) } : { mode: "march", phase: o.phase, expr: o.expr } }, o.shadow ?? true);
/** walk sideways from x0 to x1 at v m/s starting on frame f0 (feet planted: one stride cycle per 1.6 m). Afterwards the person
 *  turns to the front with `then`, or keeps standing sideways. Returns where the person is now. */
export const walk = (c: Ctx, who: Who, x0: number, x1: number, z: number, f0: number, o: PO & { v?: number; then?: FrontOpts; hide?: boolean; gone?: boolean; expr?: FrontOpts["expr"] } = {}): number => {
  const v = o.v ?? 1.5, d = Math.abs(x1 - x0), dur = Math.max(1, (d / v) * FPS), u = clamp01((c.f - f0) / dur), x = x0 + (x1 - x0) * u;
  if (c.f < f0 && o.hide) return x;
  if (u >= 1 && o.gone) return x;
  if (u >= 1 && o.then) { P(c, who, x1, z, o.then, o); return x1; }
  S(c, who, x, z, { ...o, mirror: x1 > x0, phase: u <= 0 || u >= 1 ? undefined : ((d * u) / 1.6) % 1 });
  return x;
};
/** arm wave value while `on` */
export const wav = (c: Ctx, on: boolean, ph = 0) => (on ? q(Math.sin(c.f / 3.2 + ph), 4) : undefined);

// ---------------- cards ----------------
type Draw = (p: Pen) => void;
/** a drawing placed in the world: (x, y, z) = centre, w = width in metres */
export const fx = (c: Ctx, key: string, cw: number, ch: number, draw: Draw, x: number, y: number, z: number, w: number, rot = 0, opacity?: number) =>
  c.out.fx.push({ key, cw, ch, draw, x, y, z, w, h: (w * ch) / cw, rot, ...(opacity === undefined ? {} : { opacity }) });
/** cards that read as captions: always in front of the scene (see FxPlace.top) */
const TOP = /^(ban|tag|talk|bub|stamp|cal)\|/;
/** after a shot is drawn: a drawing that sits inside a bubble or on a banner (its centre within the card, not behind it,
 *  listed after it, and smaller) belongs to that card, so it goes in front of the scene with it */
export const liftIcons = (out: Scene, pos: V3, look: V3) => {
  const f = [look[0] - pos[0], look[1] - pos[1], look[2] - pos[2]], fl = Math.hypot(f[0], f[1], f[2]) || 1; f[0] /= fl; f[1] /= fl; f[2] /= fl;
  const rl = Math.hypot(f[0], f[2]) || 1, r = [-f[2] / rl, 0, f[0] / rl], u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]];
  const rel = (p: { x: number; y: number; z: number }) => { const v = [p.x - pos[0], p.y - pos[1], p.z - pos[2]], d = v[0] * f[0] + v[1] * f[1] + v[2] * f[2]; return { d, x: (v[0] * r[0] + v[2] * r[2]) / d, y: (v[0] * u[0] + v[1] * u[1] + v[2] * u[2]) / d }; };
  out.fx.forEach((card, i) => {
    if (!card.top) return;
    const C = rel(card);
    for (let j = i + 1; j < out.fx.length; j++) {
      const p = out.fx[j];
      if (p.top || p.flat || p.soft || p.w >= card.w) continue;
      const q = rel(p);
      if (q.d <= C.d + 0.05 && q.d > 0.7 && Math.abs(q.x - C.x) * C.d < card.w / 2 && Math.abs(q.y - C.y) * C.d < card.h / 2) p.top = true;
    }
  });
};
const popK = (f: number, f0: number) => (f - f0 < 5 ? 0.6 + 0.4 * ((f - f0 + 1) / 5) : 1 + 0.01 * Math.sin((f - f0) / 6));
/** a drawing that pops in on frame f0 (and is gone again from f1) */
export const pop = (c: Ctx, f0: number, key: string, cw: number, ch: number, draw: Draw, x: number, y: number, z: number, w: number, rot = 0, f1 = 1e9) => {
  if (c.f >= f0 && c.f < f1) { const k = popK(c.f, f0); c.out.fx.push({ key, cw, ch, draw, x, y, z, w: w * k, h: ((w * ch) / cw) * k, rot, ...(TOP.test(key) ? { top: true } : {}) }); }
};
/** a banner: "small heading|BIG LINE" or one line */
export const ban = (c: Ctx, f0: number, s: string, x: number, y: number, z: number, w: number, fill = "#fff3c4", f1 = 1e9) => pop(c, f0, `ban|${s}|${fill}`, 1000, 260, (p) => fxBanner(p, s, fill), x, y, z, w, 0, f1);
/** a card with a heading and one big line */
export const tag = (c: Ctx, f0: number, head: string, big: string, x: number, y: number, z: number, w: number, fill = "#f6efd8", f1 = 1e9) => pop(c, f0, `tag|${head}|${big}|${fill}`, 520, 300, (p) => fxTagCard(p, head, big, fill), x, y, z, w, 0, f1);
/** a speech bubble with words ("LINE|LINE"); flip = the tail on the other side */
export const say = (c: Ctx, f0: number, s: string, x: number, y: number, z: number, w: number, flip = false, f1 = 1e9) => pop(c, f0, `talk|${s}|${flip}`, 900, 460, (p) => fxTalk(p, s, flip), x, y, z, w, 0, f1);
/** a speech or thought bubble with a picture icon */
export const bub = (c: Ctx, f0: number, kind: Icon, x: number, y: number, z: number, w = 1.2, thought = false, flip = false, f1 = 1e9) => pop(c, f0, `bub|${kind}|${thought}|${flip}`, 520, 420, (p) => fxBubble(p, kind, thought, flip), x, y, z, w, 0, f1);
/** a rubber stamp */
export const stamp = (c: Ctx, f0: number, s: string, x: number, y: number, z: number, w: number, rot = 0.1, f1 = 1e9) => pop(c, f0, `stamp|${s}`, 640, 220, (p) => fxStamp(p, s), x, y, z, w, rot, f1);
export const sparkle = (c: Ctx, f0: number, x: number, y: number, z: number, s = 0.5) => {
  const n = c.f - f0;
  if (n >= 0 && n < 9) for (const [dx, dy, k] of [[-0.3, 0.2, 1], [0.32, 0.12, 0.7], [0.02, 0.42, 0.85]]) c.out.fx.push({ key: "sparkle", cw: 200, ch: 200, draw: fxSparkle, x: x + dx * (1 + n / 9), y: y + dy * (1 + n / 9), z, w: s * k * (1 - n / 10), h: s * k * (1 - n / 10), rot: n * 0.2 });
};
export const sweat = (c: Ctx, x: number, y: number, z: number) => { const u = (c.f % 18) / 18; c.out.fx.push({ key: "sweat", cw: 80, ch: 108, draw: fxSweat, x, y: y - 0.18 * u, z, w: 0.13, h: 0.175, opacity: 1 - u * 0.5 }); };

// ---------------- bubbles that belong to a speaker ----------------
type BO = { side?: 1 | -1; w?: number; top?: number; scale?: number; f1?: number };
/** A speech bubble with words whose tail ends just above the speaker's head. hx, z = where the speaker stands;
 *  side = -1: the bubble sits to the screen-right of the speaker, +1: to the screen-left; top = height of the top of the
 *  head or hat (1.8 for a cap or hair, 2.15 for a top hat), multiplied by scale. Returns the centre of the bubble. */
export const sayTo = (c: Ctx, f0: number, s: string, hx: number, z: number, o: BO = {}) => {
  const side = o.side ?? -1, w = o.w ?? 2.0, h = (w * 460) / 900, x = hx + side * (0.12 + 0.3556 * w), y = (o.top ?? 1.8) * (o.scale ?? 1) + 0.05 + 0.474 * h;
  say(c, f0, s, x, y, z - 0.05, w, side > 0, o.f1);
  return { x, y: y + 0.087 * h };
};
/** the same bubble, empty, with a drawing inside it (iw = width of the drawing in metres; keep it under 0.3 x the bubble width) */
export const thinkTo = (c: Ctx, f0: number, hx: number, z: number, draw: Draw, key: string, cw: number, ch: number, iw: number, o: BO = {}) => {
  const b = sayTo(c, f0, " ", hx, z, o);
  pop(c, f0, key, cw, ch, draw, b.x, b.y, z - 0.1, iw, 0, o.f1);
  return b;
};
/** a small bubble with one of the stock icons ("bang", "q", ...), its tail at the speaker's head; thought = a thought bubble */
export const bubTo = (c: Ctx, f0: number, kind: Icon, hx: number, z: number, o: BO & { thought?: boolean } = {}) => {
  const side = o.side ?? -1, w = o.w ?? 1.0, h = (w * 420) / 520, x = hx + side * (0.1 + 0.4 * w), y = (o.top ?? 1.8) * (o.scale ?? 1) + 0.04 + 0.462 * h;
  bub(c, f0, kind, x, y, z - 0.05, w, o.thought ?? false, side > 0, o.f1);
  return { x, y: y + 0.0714 * h };
};
/** a name banner centred above somebody's head ("small heading|BIG LINE") */
export const nameOver = (c: Ctx, f0: number, s: string, hx: number, z: number, o: { w?: number; top?: number; scale?: number; f1?: number; fill?: string } = {}) =>
  ban(c, f0, s, hx, (o.top ?? 1.8) * (o.scale ?? 1) + 0.2 + 0.13 * (o.w ?? 2.0), z - 0.05, o.w ?? 2.0, o.fill ?? "#fff3c4", o.f1);

// ---------------- things in hands ----------------
/** the hand of somebody standing at x in the front view with the arms down: side = +1 the hand on the screen-left, -1 the one on the screen-right */
export const hand = (x: number, side: 1 | -1, scale = 1): [number, number] => [x + side * 0.25 * scale, 0.69 * scale];
/** A thing held in a hanging hand. grip "top" (default): it hangs from the middle of its top edge (a suitcase, a bucket);
 *  grip "mid": the hand holds its inner edge at mid-height and it sticks out sideways (a letter, a rolled paper). */
export const hold = (c: Ctx, key: string, cw: number, ch: number, draw: Draw, x: number, z: number, side: 1 | -1, w: number, o: { grip?: "top" | "mid"; rot?: number; scale?: number; dx?: number; dy?: number } = {}) => {
  const [hx, hy] = hand(x, side, o.scale ?? 1), h = (w * ch) / cw, mid = o.grip === "mid";
  fx(c, key, cw, ch, draw, hx + side * (mid ? 0.5 * w - 0.05 : 0) + (o.dx ?? 0), hy - (mid ? 0 : 0.5 * h - 0.04) + (o.dy ?? 0), z - 0.06, w, o.rot ?? 0);
};
/** a flat thing clamped under the arm, against the body, well below the chin (the wrapped painting) */
export const underArm = (c: Ctx, key: string, cw: number, ch: number, draw: Draw, x: number, z: number, side: 1 | -1, w: number, o: { rot?: number; scale?: number; dy?: number } = {}) =>
  fx(c, key, cw, ch, draw, x + side * 0.3 * (o.scale ?? 1), 0.9 * (o.scale ?? 1) + (o.dy ?? 0), z - 0.06, w, o.rot ?? side * 0.1);

// ---------------- the picture on the wall ----------------
/** what hangs on the gallery wall: her (framed, or under glass), the four hooks (n numbered), or the other portrait */
export const wall = (c: Ctx, what: "mona" | "glass" | "hooks" | "other", cx = GAL, o: { n?: number; dy?: number; dz?: number; rot?: number } = {}) => {
  const y = WALL_Y + (o.dy ?? 0), z = WALL_Z - (o.dz ?? 0);
  if (what === "hooks") fx(c, `hooks${o.n ?? 0}`, 700, 920, (p) => fxHooks(p, o.n ?? 0), cx, WALL_Y, WALL_Z + 0.06, 1.0);
  else if (what === "other") fx(c, "otherPortrait", 700, 920, fxOtherPortrait, cx, y, z, 1.0, o.rot ?? 0);
  else fx(c, `mona${what}`, 700, 920, (p) => fxMona(p, what === "glass"), cx, y, z, 1.0, o.rot ?? 0);
};
export { q, lidAt, Stage };
