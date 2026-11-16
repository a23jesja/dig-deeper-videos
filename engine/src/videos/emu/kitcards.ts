// Whole pose drawings from Jesper's figure sheets as lit cards in the 3D world (the emu-short recipe, with the
// sheet drawings in place of code-drawn figures). A pose is one picture, used as it is: it is never bent or turned
// in parts. On top of a pose only small things move: the mouth shape while he talks, a blink, a little squash
// when the pose changes. Pictures are loaded once (loadKitCards) before the world is built.
import cards from "../kit/cards.json";
import mouths from "../kit/mouths.json";
import { Stage, CamInfo, Place, blob, SU } from "./castbase";

export type Card = { w: number; h: number; cx?: number; cy?: number; r?: number };
export const CARDS = cards as Record<string, Card>;
type MouthShape = "slight" | "open" | "wide";
const MOUTHS = mouths as unknown as Record<MouthShape, { ox: number; oy: number; w: number; h: number }> & { shift: Record<string, number[]>; eyes: Record<string, number[][]> };
export const KIT_IMG: Record<string, HTMLImageElement> = {};
const NAMES = [...Object.keys(CARDS), "mouthpatch_slight", "mouthpatch_open", "mouthpatch_wide"];
export const loadKitCards = (url: (n: string) => string) => Promise.all(NAMES.map((n) => new Promise<void>((ok, bad) => {
  const im = new Image(); im.onload = () => { KIT_IMG[n] = im; ok(); }; im.onerror = () => bad(new Error("kit card " + n)); im.src = url(n);
})));
/** every figure card is cut with a head radius of 120 px; Sir Digsworth (931 px at that scale) stands 1.85 m */
export const M_PER_PX = 1.85 / 931;
const U = M_PER_PX / SU;   // design units per picture pixel
const tierK = (d: number) => (d < 2.6 ? 3.0 : d < 5.5 ? 1.8 : d < 14 ? 0.8 : d < 32 ? 0.4 : 0.22);
const qz = (v: number) => Math.round(v * 50) / 50;
export type KitBox = { name: string; x: number; y: number; z: number; w: number; h: number; face?: { x: number; y: number; r: number }; bg?: boolean; close?: boolean };
export type KitOpts = { mirror?: boolean; sx?: number; sy?: number; roll?: number; shadow?: boolean; scale?: number; blink?: boolean; mouth?: "closed" | MouthShape;
  /** a background figure: not part of the layout check's size rule */ bg?: boolean; tint?: number;
  /** a deliberate close-up: only the whole face has to be inside the picture */ close?: boolean;
  /** where the face is in a picture that has no head data (fractions of the picture: x, y, radius of width) */ face?: [number, number, number] };
/** one figure: the pose picture `name` standing at (x, y, z); sx / sy squash it about the feet */
export const kitFig = (out: Stage, cam: CamInfo, name: string, x: number, y: number, z: number, o: KitOpts = {}): Place => {
  const c = CARDS[name], scale = o.scale ?? 1, sx = qz(o.sx ?? 1), sy = qz(o.sy ?? 1);
  const wide = c.w * U > 880 || c.h * U > 990, cw = wide ? 2400 : 900, ch = wide ? 1700 : 1000, ax = cw / 2, ay = wide ? 1690 : 975;
  const d = Math.hypot(cam.pos.x - x, cam.pos.y - (y + 1), cam.pos.z - z) / scale, k = wide ? Math.min(0.8, tierK(d)) : tierK(d);
  const mouth = o.mouth && o.mouth !== "closed" && MOUTHS.shift[name] ? o.mouth : null, blink = !!o.blink && !!MOUTHS.eyes[name];
  const pl: Place = {
    key: `KIT|${name}|${sx}|${sy}|${blink ? 1 : 0}|${mouth ?? ""}`, x, y, z, scale, mirror: o.mirror, roll: o.roll, geo: wide ? "wide" : "emuFront", size: [Math.round(cw * k), Math.round(ch * k), k], tint: o.tint,
    draw: (p) => {
      const g = p.g, im = KIT_IMG[name]; if (!im) return;
      g.save(); g.translate(ax, ay); g.scale(sx * U, sy * U); g.translate(-c.w / 2, -c.h); g.imageSmoothingQuality = "high";
      g.drawImage(im, 0, 0, c.w, c.h);
      if (mouth) { const m = MOUTHS[mouth], sh = MOUTHS.shift[name], pm = KIT_IMG[`mouthpatch_${mouth}`]; if (pm) g.drawImage(pm, c.cx! + m.ox + sh[0], c.cy! + m.oy + sh[1], m.w, m.h); }
      if (blink) for (const [ex, ey, w, h] of MOUTHS.eyes[name]) {   // closed lids over the two pupils (the monocle eye keeps its glass colour)
        const X = c.cx! + ex, Y = c.cy! + ey, mono = ex > 20;
        g.fillStyle = mono ? "#f3f0e4" : "#fbfaf7"; g.beginPath(); g.ellipse(X, Y, w * 0.72, h * 0.66, 0, 0, 7); g.fill();
        g.strokeStyle = "#191612"; g.lineWidth = 4.2; g.lineCap = "round"; g.beginPath(); g.moveTo(X - w * 0.6, Y + 2); g.quadraticCurveTo(X, Y + 8, X + w * 0.6, Y + 2); g.stroke();
      }
      g.restore();
    },
  };
  out.places.push(pl);
  if (o.shadow !== false) blob(out, cam, x, y, z, scale * (wide ? 2.6 : 1.1));
  const W = c.w * M_PER_PX * scale * sx, H = c.h * M_PER_PX * scale * sy, sgn = o.mirror ? -1 : 1;
  const face = c.r ? { x: sgn * (c.cx! - c.w / 2) * M_PER_PX * scale * sx, y: (c.h - c.cy!) * M_PER_PX * scale * sy, r: c.r * M_PER_PX * scale } : o.face ? { x: sgn * (o.face[0] - 0.5) * W, y: (1 - o.face[1]) * H, r: o.face[2] * W } : undefined;
  const st = out as Stage & { kit?: KitBox[] };
  (st.kit ??= []).push({ name, x, y, z, w: W, h: H, face, bg: o.bg, close: o.close });
  return pl;
};
/** an effect drawing from the kit (dust, smoke, exclamation mark ...) as an unlit card `h` metres tall, centred at (x, y, z) */
export const kitFx = (out: Stage, name: string, x: number, y: number, z: number, h: number, o: { opacity?: number; soft?: boolean; rot?: number; mirror?: boolean; tint?: number } = {}) => {
  const c = CARDS[name];
  out.fx.push({ key: `kfx|${name}|${o.mirror ? 1 : 0}`, cw: c.w, ch: c.h, x, y, z, w: (h * c.w) / c.h, h, soft: o.soft, opacity: o.opacity, rot: o.rot, tint: o.tint,
    draw: (p) => { const im = KIT_IMG[name]; if (!im) return; const g = p.g; g.save(); if (o.mirror) { g.translate(c.w, 0); g.scale(-1, 1); } g.drawImage(im, 0, 0, c.w, c.h); g.restore(); } });
};
/** pose change as a little hop: squash, switch in the air, land. n = frames since the change. */
export const hop = (n: number, from: string, to: string, k = 1): { name: string; sx: number; sy: number; y: number } => {
  const F: [number, number, number][] = [[1.08, 0.9, 0], [0.94, 1.1, 0.09], [0.96, 1.06, 0.06], [1.06, 0.94, 0], [0.98, 1.02, 0]];   // squash, stretch in the air (2 frames), land, settle
  if (n < -1) return { name: from, sx: 1, sy: 1, y: 0 };
  if (n > 3) return { name: to, sx: 1, sy: 1, y: 0 };
  const [sx, sy, y] = F[n + 1];
  return { name: n < 0 ? from : to, sx: 1 + (sx - 1) * k, sy: 1 + (sy - 1) * k, y: y * k };
};
/** mouth shape while a word is spoken (from its letters): closed on m/b/p and between words */
export const mouthAt = (words: { w: string; a: number; b: number }[], t: number): "closed" | MouthShape => {
  const wd = words.find((w) => t >= w.a - 0.02 && t < w.b); if (!wd) return "closed";
  const s = wd.w.toLowerCase().replace(/[^a-z]/g, ""), syl = s.match(/[^aeiouy]*[aeiouy]+|[^aeiouy]+$/g) ?? [s];
  const u = (t - wd.a) / Math.max(0.05, wd.b - wd.a), n = syl.length * 2, i = Math.min(n - 1, Math.max(0, Math.floor(u * n))), sy = syl[Math.floor(i / 2)], v = (sy.match(/[aeiouy]+/) ?? [""])[0];
  if (i % 2 === 0 && syl.length > 1) return /^[mbp]/.test(sy) ? "closed" : "slight";
  if (u > 0.85) return "slight";
  return !v ? "slight" : /^(a|o)/.test(v) ? "wide" : /^(e|i|y)/.test(v) ? "open" : "slight";
};
