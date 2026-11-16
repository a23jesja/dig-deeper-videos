// Our own flat 2D cartoon cast (riflemen, officer, townsfolk, kid, parent) + 2D effects, drawn on a canvas.
// Construction v2 (characters.md, our own cast): superellipse heads (pointed crown 1.75 / full jaw 2.3, chin taper,
// seeded side bulge + tilt), bean torsos, single-stroke limbs with ink-dot hands, a thick-thin plum outline weighted
// away from the light, soft painted crescents, deadpan lidded eyes, no blush, no catchlights.
// Design space 600 x 1000 units (soles at y = 975); the canvas transform scales it.
export const INK = "#241726";
export const SKIN = "#ffe2c2";
const WHITE = "#ffffff";
const MOUTH = "#5a1e28";
const TONGUE = "#e86e78";
type C3 = [number, number, number];
const SH_SKIN: C3 = [0.96, 0.86, 0.84]; // measured shadow/lit ratio on skin heads
const SH_CLOTH: C3 = [0.64, 0.66, 0.74]; // torsos: lit side -> far side ~0.65
const SH_FELT: C3 = [0.62, 0.62, 0.7];

export type Build = "adult" | "stout" | "kid";
export type Outfit = {
  jacket: string; pants: string; boots: string; hat?: string | null; belt?: string | null; buttons?: string; rifle?: boolean;
  sash?: string; sword?: boolean; moustache?: string; skin?: string; head?: number; cap?: string; hair?: string; dress?: string;
  build?: Build;
  /** Sam Browne belt colour (Australian army, 1932) */
  sam?: string;
  /** Sir Digsworth extras: monocle, pipe, bow tie, waistcoat, cane */
  sir?: boolean;
  /** the new look of Sir Digsworth's family (Titanic film): short legs, real trousers / long skirt, real hats, wide-set open eyes,
   *  mouth low and always drawn. No monocle or pipe. Off = every older character stays exactly as it was. */
  gent?: boolean;
  /** a blanket worn as a shawl over the shoulders (colour): jacket, waistcoat and hands stay visible */
  shawl?: string;
  /** what tells one face from another: a full beard (colour; beardLong 0..1 makes it a long one), round spectacles,
   *  a bald crown (with hat "hair": only the side tufts are left), a bow tie (colour) */
  beard?: string; beardLong?: number; glasses?: boolean; bald?: boolean; tie?: string;
  /** the cockade on a bicorne, outer ring to centre (default: the French red, white, blue) */
  cockade?: [string, string, string];
  /** the Romans of the Pompeii film (needs gent): bare arms, sandals, a role that draws its own garment details.
   *  hem = where a short tunic ends, as a fraction of the head height above the sole (the legs stay bare below it). Off = nothing changes. */
  roman?: "baker" | "soldier" | "merchant" | "boy" | "woman";
  hem?: number; cloak?: string;
};
type P2 = [number, number];

const rad = (d: number) => (d * Math.PI) / 180;
const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
export const mul = (c: string, m: C3) => {
  const n = parseInt(c.slice(1), 16);
  const ch = (v: number, k: number) => Math.min(255, Math.round(v * k)).toString(16).padStart(2, "0");
  return `#${ch((n >> 16) & 255, m[0])}${ch((n >> 8) & 255, m[1])}${ch(n & 255, m[2])}`;
};
export const shade = (c: string, k: number) => mul(c, [k, k, k]);
export const mix = (a: string, b: string, t: number) => {
  const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16);
  const ch = (s: number) => Math.round(((A >> s) & 255) * (1 - t) + ((B >> s) & 255) * t).toString(16).padStart(2, "0");
  return `#${ch(16)}${ch(8)}${ch(0)}`;
};
/** deterministic per-character random in [0, 1) */
export const rnd = (seed: number, k: number) => { const x = Math.sin(seed * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
const rotPts = (pts: P2[], a: number, cx: number, cy: number): P2[] =>
  pts.map(([x, y]) => [cx + (x - cx) * Math.cos(a) - (y - cy) * Math.sin(a), cy + (x - cx) * Math.sin(a) + (y - cy) * Math.cos(a)]);
const rotAbout = (q: P2, a: number, c: P2): P2 => rotPts([q], a, c[0], c[1])[0];
const lerp2 = (a: P2, b: P2, t: number): P2 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
/** smooth curve from a through (near) k to b, as a polyline */
export const curve = (a: P2, k: P2, b: P2, n = 10): P2[] => {
  const c: P2 = [2 * k[0] - (a[0] + b[0]) / 2, 2 * k[1] - (a[1] + b[1]) / 2], out: P2[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, s = 1 - t;
    out.push([s * s * a[0] + 2 * s * t * c[0] + t * t * b[0], s * s * a[1] + 2 * s * t * c[1] + t * t * b[1]]);
  }
  return out;
};

export const RIFLEMAN: Outfit = { jacket: "#357650", pants: "#3d4440", boots: INK, hat: "shako", belt: "#f1efe6", buttons: "#d9dde0", rifle: true };
export const OFFICER: Outfit = { ...RIFLEMAN, hat: "shako_tall", buttons: "#e8c45a", sash: "#c0353a", sword: true, moustache: "#4a3020", rifle: false, belt: null, build: "stout" };
export const KID: Outfit = { jacket: "#f08a2c", pants: "#3b5b9a", boots: "#f4f1ea", hat: "cap", cap: "#e2453c", build: "kid" };
export const PARENT: Outfit = { jacket: "#7b5ac9", pants: "#3b3f52", boots: "#5a3b2a", hat: "hair", hair: "#5a3b2a" };
export const SKINS = [SKIN, "#f5c9a0", "#ecd0b6", "#cfa27e"];

export const soldier = (v = 0, extra: Partial<Outfit> = {}): Outfit => {
  const o: Outfit = { ...RIFLEMAN, skin: SKINS[v % 4] };
  if (v % 4 === 1) o.moustache = "#4a3426";
  if (v % 4 === 3) o.moustache = "#2a201a";
  return { ...o, ...extra };
};

export const townsfolk = (v = 0): Outfit => {
  const coats = ["#3f6fb5", "#8c3b4a", "#5d7a3a", "#b5653f", "#2f5f6a", "#7b5ac9"];
  const o: Outfit = { jacket: coats[v % 6], pants: "#3b3f52", boots: "#4a3426", skin: SKINS[v % 4] };
  return v % 2 ? { ...o, hat: "bonnet", dress: ["#d9a441", "#c25a7a", "#5a8fc2"][v % 3] } : { ...o, hat: "tophat" };
};

/** per-draw extras, set by bodyFront / bodySide before the face is drawn */
let SIR = false, GT = false, NEW = false, TALK = 0, BACK = false, LOOKUP = 0;
/** how far the figure is turned from the lens, -1..1 (+-1 = the three-quarter view to screen-left / screen-right); set by bodyFront */
let TURN = 0;
/** per-draw extras of the craft kit, set from the options of bodyFront / bodySide: the hat's lag behind the head [dx, dy in u, degrees],
 *  where the eyes look [-1..1 right, -1..1 down], the mouth shape of the spoken sound */
let CAPV: number[] = [0, 0, 0], GAZE: number[] = [0, 0], MSHAPE: Viseme | null = null;
/** mouth shapes for speech: rest = the expression's own mouth, M = lips closed (m b p), E = teeth together (e i s t d n k),
 *  A = wide open, O = round, U = small and pursed (u w oo), F = teeth on the lip (f v), L = open with the tongue up (l th r) */
export type Viseme = "rest" | "M" | "E" | "A" | "O" | "U" | "F" | "L";
/** hand shapes: fist (the plain ink dot), open (fingers spread), point (one finger out), grip (closed round a handle), hold (a flat palm under a thing) */
export type HandShape = "fist" | "open" | "point" | "grip" | "hold";
/** head tilt back per unit of lookUp, in degrees (negative = chin up) */
const LOOKUP_TILT = 5;
/** 0..1 mouth opening for lip-sync (overrides the expression's mouth while > 0.12) */
export const setTalk = (t: number) => { TALK = t; };
export const TWEED = "#9a7748", TWEED_DARK = "#6f5236", GOLD = "#e9b93a";
export const SIR_DIGSWORTH: Outfit = { jacket: TWEED, pants: "#4a3324", boots: INK, hat: "cap", cap: "#a07c4c", moustache: "#5a3a20", buttons: GOLD, sir: true };

export class Pen {
  g: CanvasRenderingContext2D;
  ol = 12;
  /** [angle, cx, cy] rotation about (cx, cy), optional post-translation [.., dx, dy] */
  rot: number[] | null = null;
  /** [cx, k]: squeeze x toward cx by the factor k, before the rotation (the far half of a turned face is foreshortened) */
  sq: number[] | null = null;
  constructor(g: CanvasRenderingContext2D) { this.g = g; }
  P(x: number, y: number): P2 {
    if (this.sq) x = this.sq[0] + (x - this.sq[0]) * this.sq[1];
    if (!this.rot) return [x, y];
    const r = this.rot, a = r[0], cx = r[1], cy = r[2], dx = r.length > 3 ? r[3] : 0, dy = r.length > 4 ? r[4] : 0, c = Math.cos(a), s = Math.sin(a);
    return [cx + (x - cx) * c - (y - cy) * s + dx, cy + (x - cx) * s + (y - cy) * c + dy];
  }
  path(pts: P2[], close: boolean) {
    const g = this.g;
    g.beginPath();
    pts.forEach((p, i) => { const [x, y] = this.P(p[0], p[1]); if (i) g.lineTo(x, y); else g.moveTo(x, y); });
    if (close) g.closePath();
  }
  /** filled shape with an ink outline; fill=null draws the outline only */
  poly(pts: P2[], fill: string | null, ol?: number) {
    const g = this.g, w = ol ?? this.ol;
    this.path(pts, true);
    if (fill) { g.fillStyle = fill; g.fill(); }
    if (w) { g.lineWidth = w; g.strokeStyle = INK; g.lineJoin = "round"; g.stroke(); }
  }
  ell(cx: number, cy: number, rx: number, ry: number, fill: string | null, ol?: number, a0 = 0, a1 = 360, rot = 0) {
    this.poly(ellPts(cx, cy, rx, ry, a0, a1, rot), fill, ol);
  }
  /** thick round-capped limb with an ink rim (effects, rope) */
  line(pts: P2[], fill: string, w: number, ink = true) {
    const g = this.g;
    g.lineCap = "round"; g.lineJoin = "round";
    if (ink) { this.path(pts, false); g.strokeStyle = INK; g.lineWidth = w + 2 * this.ol * 0.9; g.stroke(); }
    this.path(pts, false); g.strokeStyle = fill; g.lineWidth = w; g.stroke();
  }
  stroke(pts: P2[], w: number, fill = INK) {
    const g = this.g;
    g.lineCap = "round"; g.lineJoin = "round";
    this.path(pts, false); g.strokeStyle = fill; g.lineWidth = w; g.stroke();
  }
  arc(cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, w: number, fill = INK) {
    const pts: P2[] = [];
    for (let i = 0; i <= 24; i++) pts.push([cx + rx * Math.cos(rad(a0 + ((a1 - a0) * i) / 24)), cy + ry * Math.sin(rad(a0 + ((a1 - a0) * i) / 24))]);
    this.stroke(pts, w, fill);
  }
  dot(cx: number, cy: number, r: number, fill = INK) {
    const [x, y] = this.P(cx, cy);
    this.g.beginPath(); this.g.arc(x, y, r, 0, Math.PI * 2); this.g.fillStyle = fill; this.g.fill();
  }
  /** draw with a closed shape as clip */
  clip(pts: P2[], fn: () => void) { const g = this.g; g.save(); this.path(pts, true); g.clip(); fn(); g.restore(); }
  /** flat fill + soft crescent on the side away from the light (light = canvas angle the light comes FROM).
   *  Radial ramp centred `shift` R toward the light: flat out to ~0.6 R on the far side, full shadow by ~0.8 R. */
  shadedFill(pts: P2[], base: string, shadow: string, light: number, R: number, shift = 0.45, r0 = 1.05, r1 = 1.25) {
    const g = this.g, n = pts.length;
    let cx = 0, cy = 0;
    for (const [x, y] of pts) { cx += x / n; cy += y / n; }
    const [gx, gy] = this.P(cx + Math.cos(light) * shift * R, cy + Math.sin(light) * shift * R);
    const gr = g.createRadialGradient(gx, gy, 0, gx, gy, r1 * R);
    gr.addColorStop(0, base); gr.addColorStop(r0 / r1, base); gr.addColorStop(1, shadow);
    this.path(pts, true); g.fillStyle = gr; g.fill();
  }
  /** broad gradient across a shape along the light: lit edge = base, far edge = shadow (torsos, coats) */
  gradFill(pts: P2[], base: string, shadow: string, light: number, flat = 0.22) {
    const g = this.g, dx = Math.cos(light), dy = Math.sin(light), n = pts.length;
    let cx = 0, cy = 0, lo = Infinity, hi = -Infinity;
    for (const [x, y] of pts) { cx += x / n; cy += y / n; const d = x * dx + y * dy; lo = Math.min(lo, d); hi = Math.max(hi, d); }
    const dc = cx * dx + cy * dy;
    const [ax, ay] = this.P(cx + dx * (hi - dc), cy + dy * (hi - dc)), [bx, by] = this.P(cx + dx * (lo - dc), cy + dy * (lo - dc));
    const gr = g.createLinearGradient(ax, ay, bx, by);
    gr.addColorStop(0, base); gr.addColorStop(flat, base); gr.addColorStop(1, shadow);
    this.path(pts, true); g.fillStyle = gr; g.fill();
  }
  /** thick-thin ink ring: w(θ) = w0 (1 + k cos(θ − thick)), θ from the contour centroid (canvas angles) */
  inkRing(pts: P2[], w0: number, thick: number, k = 0.45, col = INK) {
    const n = pts.length;
    let cx = 0, cy = 0;
    for (const [x, y] of pts) { cx += x / n; cy += y / n; }
    const out: P2[] = [], inn: P2[] = [];
    pts.forEach((q, i) => {
      const a = pts[(i + n - 1) % n], b = pts[(i + 1) % n];
      let nx = b[1] - a[1], ny = a[0] - b[0]; // outward normal for clockwise-on-screen contours
      const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
      const h = 0.5 * w0 * (1 + k * Math.cos(Math.atan2(q[1] - cy, q[0] - cx) - thick));
      out.push([q[0] + nx * h, q[1] + ny * h]); inn.push([q[0] - nx * h, q[1] - ny * h]);
    });
    const g = this.g;
    const trace = (r: P2[]) => { r.forEach(([x0, y0], i) => { const [x, y] = this.P(x0, y0); if (i) g.lineTo(x, y); else g.moveTo(x, y); }); g.closePath(); };
    g.beginPath(); trace(out); trace(inn.reverse());
    g.fillStyle = col; g.fill("evenodd");
  }
  /** flat strap with a thin ink rim (cross belts, sash, rifle, handles) */
  band(pts: P2[], fill: string, w: number, rim: number, cap: CanvasLineCap = "butt") {
    const g = this.g; g.lineCap = cap; g.lineJoin = "round";
    this.path(pts, false); g.strokeStyle = INK; g.lineWidth = w + 2 * rim; g.stroke();
    this.path(pts, false); g.strokeStyle = fill; g.lineWidth = w; g.stroke();
    g.lineCap = "round";
  }
}

const ellPts = (cx: number, cy: number, rx: number, ry: number, a0 = 0, a1 = 360, rot = 0, n = 48): P2[] => {
  const r = rad(rot), pts: P2[] = [];
  for (let i = 0; i <= n; i++) {
    const a = rad(a0 + ((a1 - a0) * i) / n), x = rx * Math.cos(a), y = ry * Math.sin(a);
    pts.push([cx + x * Math.cos(r) - y * Math.sin(r), cy + x * Math.sin(r) + y * Math.cos(r)]);
  }
  return pts;
};

const rrect = (x0: number, y0: number, x1: number, y1: number, r: number, n = 8): P2[] => {
  const pts: P2[] = [];
  for (const [cx, cy, a] of [[x1 - r, y0 + r, -90], [x1 - r, y1 - r, 0], [x0 + r, y1 - r, 90], [x0 + r, y0 + r, 180]])
    for (let i = 0; i <= n; i++) pts.push([cx + r * Math.cos(rad(a + (90 * i) / n)), cy + r * Math.sin(rad(a + (90 * i) / n))]);
  return pts;
};

/** tapered stroke, thick end at a: brows, moustache halves */
const taper = (p: Pen, a: P2, b: P2, wa: number, wb: number, col = INK) => {
  const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
  p.poly([[a[0] + nx * wa / 2, a[1] + ny * wa / 2], [b[0] + nx * wb / 2, b[1] + ny * wb / 2],
    [b[0] - nx * wb / 2, b[1] - ny * wb / 2], [a[0] - nx * wa / 2, a[1] - ny * wa / 2]], col, 0);
  p.dot(a[0], a[1], wa / 2, col); p.dot(b[0], b[1], wb / 2, col);
};

// ---------------- contours ----------------
export type Blob = { a: number; b: number; nTop: number; nBot: number; egg: number; asym: number; rot: number; noise: number; seed: number };

/** superellipse "bean": separate crown / jaw exponents, egg taper (neg = narrower chin), one-side bulge, soft noise.
 *  Points run right -> down -> left -> up (clockwise on screen). */
export const blobPts = (cx: number, cy: number, B: Blob, n = 72): P2[] => {
  const ph = [rnd(B.seed, 11), rnd(B.seed, 12), rnd(B.seed, 13)].map((v) => v * Math.PI * 2);
  const pts: P2[] = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2, c = Math.cos(t), s = Math.sin(t), e = 2 / (s < 0 ? B.nTop : B.nBot);
    let X = Math.sign(c) * Math.abs(c) ** e;
    const Y = Math.sign(s) * Math.abs(s) ** e;
    X *= (1 + B.egg * Y) * (1 + B.asym * Math.sign(X));
    const r = 1 + B.noise * (Math.cos(2 * t + ph[0]) + 0.7 * Math.cos(3 * t + ph[1]) + 0.5 * Math.cos(4 * t + ph[2]));
    const x = B.a * X * r, y = B.b * Y * r;
    pts.push([cx + x * Math.cos(B.rot) - y * Math.sin(B.rot), cy + x * Math.sin(B.rot) + y * Math.cos(B.rot)]);
  }
  return pts;
};

/** measured head: H/W 0.94, slightly pointed crown (1.75), fuller jaw (2.3), chin taper -0.12, 8 % bulge to the facing side */
export const headBlob = (seed: number, a = 118, facing = 0): Blob => ({
  a, b: a * (0.94 + 0.08 * (rnd(seed, 1) - 0.5)),
  nTop: 1.75 + 0.3 * (rnd(seed, 2) - 0.5), nBot: 2.3 + 0.3 * (rnd(seed, 3) - 0.5),
  egg: -0.12 + 0.06 * (rnd(seed, 4) - 0.5),
  asym: (0.06 + 0.04 * rnd(seed, 5)) * (facing || (rnd(seed, 6) < 0.5 ? -1 : 1)),
  rot: rad(8 * (rnd(seed, 7) - 0.5)), noise: 0.008, seed,
});

/** thickest outline direction: away from the light, pulled toward the ground (64 deg measured for upper-left light) */
export const thickAngle = (light: number) => Math.atan2(-Math.sin(light) + 0.8, -Math.cos(light));
const DEF_LIGHT = rad(-120);

// ---------------- faces ----------------
/** the three-quarter view: how far the eyes and the mouth slide toward the facing side at turn 1, in u (1 % of the head width) */
const FACE_TURN = 21, MOUTH_TURN = 23;
/** sideways scale of a feature on `side` (-1 / 1) of the centre line when the figure is turned by tq: the far side closes up */
const turnK = (side: number, tq: number) => (tq && side === Math.sign(tq) ? 1 - 0.2 * Math.abs(tq) : 1 + 0.04 * Math.abs(tq));
export type Expr = "neutral" | "stern" | "grin" | "laugh" | "whistle" | "nervous" | "shock" | "relief" | "relief_open" | "dazed"
  | "pained" | "smile" | "smile_closed" | "lick" | "squint";
type EyeK = "dot" | "small" | "lid" | "slit" | "happy" | "dash" | "squeeze" | "shock" | "shockHalf" | "spiral" | "open";
type MouthK = "dash" | "frown" | "smirk" | "smile" | "smileWide" | "grin" | "laugh" | "o" | "O" | "wave" | "teeth" | "lick";
/** eyes [back, front], brows [inner, outer] offsets in u (+ = down), mouth kind */
const FACE: Record<Expr, { eye: [EyeK, EyeK]; brow: [number, number]; mouth: MouthK }> = {
  neutral: { eye: ["lid", "lid"], brow: [0, -1], mouth: "dash" },
  stern: { eye: ["lid", "lid"], brow: [3, -2], mouth: "frown" },
  grin: { eye: ["happy", "happy"], brow: [-3, -3], mouth: "grin" },
  laugh: { eye: ["squeeze", "squeeze"], brow: [-4, -4], mouth: "laugh" },
  whistle: { eye: ["dash", "dash"], brow: [-2, -4], mouth: "o" },
  nervous: { eye: ["small", "small"], brow: [-3, 2], mouth: "wave" },
  shock: { eye: ["shock", "shock"], brow: [-7, -6], mouth: "O" },
  relief: { eye: ["happy", "happy"], brow: [-2, 1], mouth: "smileWide" },
  relief_open: { eye: ["happy", "happy"], brow: [-2, 1], mouth: "grin" },
  dazed: { eye: ["spiral", "spiral"], brow: [-3, 2], mouth: "wave" },
  pained: { eye: ["squeeze", "lid"], brow: [-3, 2], mouth: "teeth" },
  smile: { eye: ["dot", "dot"], brow: [0, -1], mouth: "smirk" },
  smile_closed: { eye: ["happy", "happy"], brow: [0, -1], mouth: "smile" },
  lick: { eye: ["dot", "dot"], brow: [0, -1], mouth: "lick" },
  squint: { eye: ["slit", "slit"], brow: [3, 1], mouth: "dash" },
};
const halfLid = (k: EyeK): EyeK => (k === "dot" || k === "small" || k === "open" ? "lid" : k === "lid" ? "slit" : k === "shock" ? "shockHalf" : k);
const eyeKind = (k: EyeK, lid: number): EyeK =>
  lid >= 1 && k !== "happy" && k !== "squeeze" && k !== "spiral" ? "dash" : lid > 0 ? halfLid(k) : k;
const lidOf = (b: boolean | number | undefined) => (b === true ? 1 : Number(b) || 0);

const eye = (p: Pen, kind: EyeK, x: number, ey: number, u: number, side: number, look: number, skin: string) => {
  const lx = x + look * 3 * u + GAZE[0] * 3.4 * u, gy = GAZE[1] * 3 * u, lw = 3.8 * u;
  switch (kind) {
    case "dot": p.ell(lx, ey + gy, 3.8 * u, 5.5 * u, INK, 0); break;
    case "small": p.ell(lx, ey + gy, 3 * u, 4.4 * u, INK, 0); break;
    // a calm open eye: white with a pupil, the same size on both sides (Sir Digsworth's neutral face)
    case "open": p.ell(x, ey, 8.5 * u, 8.5 * u, WHITE, 2.4 * u); p.dot(lx, ey + 0.5 * u - 4.6 * u * LOOKUP + gy, 3.2 * u); break;
    case "lid": p.ell(lx, ey - u, 7 * u, 6 * u, INK, 0, 0, 180); p.stroke([[x - 9 * u, ey - u], [x + 9 * u, ey - u]], lw); break;
    case "slit": p.ell(lx, ey, 7 * u, 2.6 * u, INK, 0, 0, 180); p.stroke([[x - 9 * u, ey], [x + 9 * u, ey]], lw); break;
    case "happy": p.arc(x, ey + 3 * u, 8 * u, 6 * u, 200, 340, lw); break;
    case "dash": p.stroke([[x - 8.5 * u, ey], [x + 8.5 * u, ey]], lw); break;
    case "squeeze": p.stroke([[x + 6 * u * side, ey - 5 * u], [x - 6 * u * side, ey], [x + 6 * u * side, ey + 5 * u]], lw); break;
    case "shock": case "shockHalf":
      p.ell(x, ey, 11 * u, 11 * u, WHITE, 2.6 * u); p.dot(lx - side * 1.5 * u, ey + 1.5 * u - 7.2 * u * LOOKUP + gy, 3 * u);
      if (kind === "shockHalf") { p.ell(x, ey, 11 * u, 11 * u, skin, 0, 180, 360); p.stroke([[x - 11 * u, ey], [x + 11 * u, ey]], 2.6 * u); }
      break;
    default: {
      const s: P2[] = [];
      for (let t = 1; t < 15; t++) s.push([x + Math.cos(t * 0.9) * t * 0.55 * u, ey + Math.sin(t * 0.9) * t * 0.55 * u]);
      p.stroke(s, 2.4 * u);
    }
  }
};

/** open "D" mouth with a white teeth band (+ tongue) */
const dmouth = (p: Pen, mx: number, y: number, rx: number, ry: number, u: number, tongue = false) => {
  p.ell(mx, y, rx, ry, MOUTH, 0, 0, 180);
  p.clip([[mx - rx, y], [mx + rx, y], [mx + rx, y + 3 * u], [mx - rx, y + 3 * u]], () => p.ell(mx, y, rx, ry, WHITE, 0, 0, 180));
  if (tongue) p.ell(mx + 2 * u, y + 0.62 * ry, 0.4 * rx, 0.28 * ry, TONGUE, 0);
  p.ell(mx, y, rx, ry, null, 3 * u, 0, 180);
};

const mouth = (p: Pen, kind: MouthK, mx: number, my: number, u: number, k = 1) => {
  const mw = 4 * u;
  switch (kind) {
    case "dash": p.stroke([[mx - 5.5 * u * k, my], [mx + 5.5 * u * k, my - 0.8 * u]], mw); break;
    case "frown": p.arc(mx, my + 3 * u, 6.5 * u * k, 3.5 * u, 200, 340, mw); break;
    case "smirk": p.arc(mx + u, my - 3 * u, 7 * u * k, 4 * u, 10, 150, mw); break;
    case "smile": p.arc(mx, my - 3 * u, 8 * u * k, 4.5 * u, 20, 160, mw); break;
    case "smileWide": p.arc(mx, my - 4 * u, 11 * u * k, 6 * u, 15, 165, mw); break;
    case "grin": dmouth(p, mx, my - u, 12 * u * k, 8 * u, u); break;
    case "laugh": dmouth(p, mx, my, 16 * u * k, 11 * u, u, true); break;
    case "o": p.ell(mx + 4 * u, my, 3.5 * u, 4 * u, MOUTH, 2.8 * u); break;
    case "O": p.ell(mx, my + 2 * u, 9 * u * k, 11 * u, MOUTH, 3.2 * u); break;
    case "wave": { const s: P2[] = []; for (let i = 0; i <= 12; i++) s.push([mx - 9 * u * k + i * 1.5 * u * k, my + 1.5 * u * Math.sin(i * 1.3)]); p.stroke(s, 3 * u); break; }
    case "teeth":
      p.poly([[mx - 12 * u * k, my - 4 * u], [mx + 12 * u * k, my - 4 * u], [mx + 11 * u * k, my + 4 * u], [mx - 11 * u * k, my + 4 * u]], WHITE, 3 * u);
      for (const j of [-1, 0, 1]) p.stroke([[mx + j * 6 * u * k, my - 4 * u], [mx + j * 6 * u * k, my + 4 * u]], 1.5 * u);
      break;
    case "lick": p.arc(mx, my - 3 * u, 8 * u * k, 4.5 * u, 20, 160, mw); p.ell(mx + 6 * u * k, my + 3 * u, 3.6 * u, 4.6 * u, TONGUE, 2.4 * u); break;
  }
};

/** a mouth shape of speech at (mx, my); kx squeezes it sideways (profile). Returns its viewer-right corner (the pipe starts there). */
const viseme = (p: Pen, v: Viseme, mx: number, my: number, u: number, kx = 1): P2 => {
  const open = (rx: number, ry: number, dy: number, teeth: number, tongue: number): P2 => {
    const cy = my + dy, e = ellPts(mx, cy, rx, ry);
    p.poly(e, MOUTH, 0);
    p.clip(e, () => {
      if (teeth) p.poly([[mx - rx, cy - ry], [mx + rx, cy - ry], [mx + rx, cy - ry + teeth], [mx - rx, cy - ry + teeth]], WHITE, 0);
      if (tongue) p.ell(mx, cy + ry * (1 - tongue), 0.7 * rx, 0.7 * ry, TONGUE, 0);
    });
    p.poly(e, null, 3 * u);
    return [mx + rx, cy];
  };
  switch (v) {
    case "M": p.stroke([[mx - 5.5 * u * kx, my], [mx + 5.5 * u * kx, my]], 4 * u); return [mx + 5.5 * u * kx, my];
    case "E": { const w = 8.5 * u * kx, h = 3.8 * u; p.poly(rrect(mx - w, my - h, mx + w, my + h, 2.6 * u), WHITE, 3 * u); p.stroke([[mx - w + 2 * u, my], [mx + w - 2 * u, my]], 1.4 * u); return [mx + w, my]; }
    case "A": return open(7.5 * u * kx, 8.5 * u, 2 * u, 4 * u, 0.5);
    case "O": return open(5.2 * u * kx, 6.8 * u, 1.5 * u, 0, 0.25);
    case "U": return open(3.4 * u * kx, 4 * u, 0.5 * u, 0, 0);
    case "F": { const w = 6.5 * u * kx; p.poly(rrect(mx - w, my - 3.4 * u, mx + w, my + 1.6 * u, 2 * u), WHITE, 2.8 * u); p.stroke([[mx - w * 0.8, my + 4.6 * u], [mx + w * 0.8, my + 4.6 * u]], 2.8 * u); return [mx + w, my]; }
    case "L": return open(6.8 * u * kx, 5.8 * u, 1 * u, 3.2 * u, 0.9);
    default: return [mx, my];
  }
};
/** a hand at the end of an arm; ang = the direction the forearm points (canvas radians). Ink silhouettes, like the plain dot. */
const hand = (p: Pen, x: number, y: number, u: number, shape: HandShape | undefined, ang: number) => {
  const dir = (a: number, l: number): P2 => [x + Math.cos(ang + rad(a)) * l, y + Math.sin(ang + rad(a)) * l];
  if (shape === "open") {
    for (const a of [-46, -16, 14, 44]) p.stroke([dir(a, 3 * u), dir(a, 11.5 * u)], 3 * u);
    p.stroke([dir(-95, 2 * u), dir(-88, 8.5 * u)], 3.2 * u);
    p.dot(x, y, 5.6 * u);
  } else if (shape === "point") {
    p.stroke([[x, y], dir(0, 16 * u)], 3.6 * u);
    p.stroke([dir(-80, 2 * u), dir(-70, 7.5 * u)], 3.2 * u);
    p.dot(x, y, 5.8 * u);
  } else if (shape === "grip") {
    p.poly(ellPts(x, y, 6.8 * u, 5.2 * u, 0, 360, (ang * 180) / Math.PI + 90), INK, 0);
    p.stroke([dir(60, 3 * u), dir(100, 7 * u)], 3.2 * u);
  } else if (shape === "hold") {
    p.poly(ellPts(x, y + 1 * u, 8.5 * u, 4 * u, 0, 360, 0), INK, 0);
    p.stroke([[x - 6 * u, y], [x - 9 * u, y - 6 * u]], 3.2 * u);
  } else p.dot(x, y, 5.8 * u);
};
/** where the viewer-right corner of a mouth ends (the pipe stem starts there); same geometry as `mouth` */
const mouthCorner = (kind: MouthK, mx: number, my: number, u: number, k = 1): P2 => {
  switch (kind) {
    case "dash": return [mx + 5.5 * u * k, my - 0.8 * u];
    case "frown": return [mx + 6.1 * u * k, my + 1.8 * u];
    case "smirk": return [mx + u + 6.9 * u * k, my - 2.3 * u];
    case "smile": return [mx + 7.5 * u * k, my - 1.5 * u];
    case "smileWide": return [mx + 10.6 * u * k, my - 2.4 * u];
    case "grin": return [mx + 12 * u * k, my - u];
    case "laugh": return [mx + 16 * u * k, my];
    case "o": return [mx + 7.5 * u, my];
    case "O": return [mx + 9 * u * k, my + 2 * u];
    case "wave": return [mx + 9 * u * k, my];
    case "teeth": return [mx + 12 * u * k, my];
    default: return [mx + 7.5 * u * k, my - 1.5 * u]; // lick
  }
};
/** Sir Digsworth's mouth sits low (under the moustache), so the open ones are drawn smaller to stay inside the chin */
const sirMs = (kind: MouthK) => (kind === "O" ? 0.6 : kind === "laugh" ? 0.62 : kind === "grin" || kind === "teeth" ? 0.78 : kind === "o" ? 0.8 : 1);

/** face v2 (front / 3-4). u = 1 % of the head path width W. Eyes 26u apart on the centre line, brows 20u up, mouth 20u
 *  down, everything slid toward the facing side. No blush, no catchlights. */
const faceFront = (p: Pen, cx: number, cy: number, W: number, expr: Expr, facing: number, look: number, lid: number, brim: boolean,
  skin: string, moustache?: string, stout = false) => {
  const u = W / 100, F = FACE[expr], tq = TURN, sg = Math.sign(tq), aq = Math.abs(tq), fx = cx + (7 * facing + FACE_TURN * tq) * u;
  // a turned head: the whole face slides toward the facing side; the far eye sits closer to the centre line and is drawn narrower
  const kx = (side: number) => turnK(side, tq), ksq = 1 - 0.26 * aq;
  // Sir Digsworth's calm faces have two open eyes of the same size, like the surprised face but smaller (Jesper
  // 2026-11-16): the shared neutral is heavy-lidded, and a plain dot looked bigger inside the monocle than outside it
  const EY: EyeK[] = NEW && expr === "neutral" ? ["open", "open"] : NEW ? (F.eye.map((k) => (k === "dot" ? "open" : k)) as EyeK[]) : (F.eye as EyeK[]);
  const ex = (NEW ? (EY[0] === "shock" ? 17 : 19) : EY[0] === "shock" ? 12 : 13) * u, ey = cy + (NEW ? 3 : 0) * u;
  for (const side of [-1, 1]) {
    const x = fx + side * ex * kx(side);
    const kind = eyeKind(EY[(facing ? side === facing : side > 0) ? 1 : 0], lid);
    if (aq && side === sg) p.sq = [x, ksq];
    eye(p, kind, x, ey, u, side, look, skin);
    const [dI, dO] = F.brow, by = ey - (brim ? 17 : 20) * u;
    if (kind === "shock" || kind === "shockHalf") p.arc(x, by - (brim ? 1 : 6) * u, 9 * u, 3 * u, 200, 340, 4 * u);
    else taper(p, [x - side * 8.5 * u, by + dI * u], [x + side * 8.5 * u, by + dO * u], 5 * u, 2.5 * u);
    p.sq = null;
  }
  const mx = cx + (8 * facing + MOUTH_TURN * tq) * u, my = cy + (SIR ? 40 : GT ? 32 : 20) * u;
  const km = (s: number) => (aq && s === sg ? 1 - 0.3 * aq : 1 + 0.05 * aq);   // the far half of a moustache is shorter
  const ms = NEW ? sirMs(F.mouth) : 1, mu = u * ms;
  let corner: P2 = [mx, my];
  if (MSHAPE && MSHAPE !== "rest") corner = viseme(p, MSHAPE, mx, my + (NEW ? 0 : 1) * u, u * (NEW ? 0.82 : 1));
  else if (TALK > 0.12 && F.mouth !== "O" && F.mouth !== "laugh" && F.mouth !== "teeth") {
    const k = Math.min(1, TALK), tk = NEW ? 0.8 : 1, rx = (4.5 + 3.5 * k) * u * tk;
    p.ell(mx, my + 1 * u, rx, (1.5 + 6.5 * k) * u * tk, MOUTH, 3 * u);
    corner = [mx + rx, my + u];
  } else { mouth(p, F.mouth, mx, my, mu); corner = mouthCorner(F.mouth, mx, my, mu); }
  if (moustache && !SIR) for (const s of [-1, 1])
    taper(p, [mx + s * 1.5 * u, cy + (GT ? 19 : 12.5) * u], [mx + s * (stout ? 19 : 15) * u * km(s), cy + (GT ? 22 : stout ? 10.5 : 15) * u], stout ? 5.5 * u : 4.5 * u, 1.6 * u, moustache);
  if (SIR) {
    // handlebar moustache: two fat curls, well below the eyes and the monocle
    for (const s of [-1, 1]) {
      const c = curve([mx + s * 1 * u, cy + 23 * u], [mx + s * 10.5 * u * km(s), cy + 30 * u], [mx + s * 20 * u * km(s), cy + 22 * u], 12);
      p.stroke(c, 8 * u, INK); p.stroke(c, 5 * u, "#6b4424");
    }
    // monocle on the eye to the LEFT of the picture (as the viewer sees him), with a little chain (Jesper 2026-11-16)
    // It stays on HIS right eye in every view: turned to screen-left that is the far eye, and the frame is foreshortened with it.
    const ox = fx - ex * kx(-1), oy = ey - 1 * u;   // the chain is drawn by bodyFront (sirChain): it must end on the body
    if (sg < 0) p.sq = [ox, ksq];
    p.ell(ox, oy, 9.5 * u, 9.5 * u, null, 5.6 * u);
    p.arc(ox, oy, 9.5 * u, 9.5 * u, 0, 360, 3 * u, GOLD);
    p.arc(ox - 2 * u, oy - 2 * u, 5.8 * u, 5.8 * u, 200, 260, 1.5 * u, "#ffffff");
    p.sq = null;
    // pipe: the stem starts at the viewer-right corner of the mouth, in every expression. It sits in the left corner of HIS mouth:
    // turned to screen-left it points toward the lens and is drawn short.
    const pk = sg < 0 ? 1 - 0.4 * aq : 1, a0: P2 = corner, a1: P2 = [a0[0] + 22 * u * pk, a0[1] + (8 + (sg < 0 ? 4 * aq : 0)) * u];
    p.band([a0, a1], "#3a261a", 3.6 * u, 1.5 * u, "round");
    p.poly([[a1[0] - 5 * u, a1[1] - 13 * u], [a1[0] + 9 * u, a1[1] - 13 * u], [a1[0] + 7.5 * u, a1[1] + 4 * u], [a1[0] - 3.5 * u, a1[1] + 4 * u]], "#8a5226", 2.6 * u);
    p.ell(a1[0] + 2 * u, a1[1] - 13 * u, 7 * u, 2.2 * u, "#ff8a2a", 2 * u);
  }
};

/** profile face (facing screen-right): one eye, brow, nose tick, mouth near the front edge; no skin bump nose, no ear */
const faceSide = (p: Pen, hx: number, hy: number, W: number, expr: Expr, lid: number, brim: boolean, skin: string, moustache?: string, stout = false) => {
  const u = W / 100, F = FACE[expr], ex = hx + 27 * u, ey = hy + (NEW ? 3 : 0) * u, dy0 = NEW ? 3 * u : 0;
  const k0: EyeK = NEW && (expr === "neutral" || F.eye[1] === "dot") ? "open" : F.eye[1];   // the same open eye as from the front
  const kind = eyeKind(k0, lid);
  eye(p, kind, ex, ey, u, 1, 0.6, skin);
  const by = ey - (brim ? 17 : 20) * u, [dI, dO] = F.brow;
  if (kind === "shock" || kind === "shockHalf") p.arc(ex, by - (brim ? 1 : 6) * u, 9 * u, 3 * u, 200, 340, 4 * u);
  else taper(p, [ex + 8 * u, by + dI * u], [ex - 7 * u, by - u + dO * u], 5 * u, 2.5 * u);
  p.stroke([[hx + 44 * u, hy + 4 * u + dy0], [hx + 47.5 * u, hy + 9 * u + dy0], [hx + 43 * u, hy + 10 * u + dy0]], 3 * u);
  const smy = hy + (SIR ? 40 : GT ? 32 : 21) * u, sms = NEW ? sirMs(F.mouth) : 1;
  let scorner: P2 = [hx + 33 * u, smy];
  if (MSHAPE && MSHAPE !== "rest") scorner = viseme(p, MSHAPE, hx + 34 * u, smy, u * (NEW ? 0.82 : 1), 0.66);
  else if (TALK > 0.12) {
    const tk = NEW ? 0.8 : 1, rx = (3.5 + 2 * TALK) * u * tk;
    p.ell(hx + 34 * u, hy + (SIR ? 40 : GT ? 32 : 22) * u, rx, (1.5 + 5.5 * Math.min(1, TALK)) * u * tk, MOUTH, 3 * u);
    scorner = [hx + 34 * u + rx, hy + (SIR ? 40 : GT ? 32 : 22) * u];
  } else { mouth(p, F.mouth, hx + 33 * u, smy, u * sms, 0.62); scorner = mouthCorner(F.mouth, hx + 33 * u, smy, u * sms, 0.62); }
  if (moustache && !SIR) taper(p, [hx + 41 * u, hy + 13.5 * u], [hx + 25 * u, hy + (stout ? 11.5 : 16) * u], stout ? 5.5 * u : 4.5 * u, 1.6 * u, moustache);
  if (SIR) {
    const c = curve([hx + 46 * u, hy + 23 * u], [hx + 33 * u, hy + 30 * u], [hx + 21 * u, hy + 20 * u], 12);
    p.stroke(c, 8 * u, INK); p.stroke(c, 5 * u, "#6b4424");
    p.ell(ex, ey - u, 9.5 * u, 10 * u, null, 5.6 * u);
    p.arc(ex, ey - u, 9.5 * u, 10 * u, 0, 360, 3 * u, GOLD);
    const a0: P2 = scorner, a1: P2 = [a0[0] + 22 * u, a0[1] + 7 * u];
    p.band([a0, a1], "#3a261a", 3.6 * u, 1.5 * u, "round");
    p.poly([[a1[0] - 5 * u, a1[1] - 13 * u], [a1[0] + 9 * u, a1[1] - 13 * u], [a1[0] + 7.5 * u, a1[1] + 4 * u], [a1[0] - 3.5 * u, a1[1] + 4 * u]], "#8a5226", 2.6 * u);
    p.ell(a1[0] + 2 * u, a1[1] - 13 * u, 7 * u, 2.2 * u, "#ff8a2a", 2 * u);
  }
};

// ---------------- beards, spectacles, bow ties ----------------
/** a full beard over the lower face (drawn before the face, so the mouth and moustache sit on it) */
const beardOn = (p: Pen, o: Outfit, hp: P2[], cx: number, hc: number, H: Blob, light: number, ow: number, mouthX = cx) => {
  if (!o.beard || BACK) return;
  const y0 = hc + (o.roman ? 0.2 : 0.36) * H.b, bot = hc + H.b, n = hp.length, kp = (q: P2) => q[1] > y0, long = o.beardLong ?? 0;
  const st = Math.max(0, hp.findIndex((q, i) => kp(q) && !kp(hp[(i + n - 1) % n])));
  const arc = [...hp.slice(st), ...hp.slice(0, st)].filter(kp).map(([x, y]) => { const k = ((y - y0) / (bot - y0)) ** 2; return [cx + (x - cx) * (1.05 - 0.25 * long * k), hc + (y - hc) * (1.07 + 0.75 * long * k)] as P2; });
  if (arc.length < 3) return;
  if (o.roman) { // the upper edge runs from one sideburn down under the mouth and up to the other: the cheeks and the mouth stay bare
    const A = arc[arc.length - 1], B = arc[0], dip = hc + 0.82 * H.b;
    for (let i = 1; i < 16; i++) { const t = i / 16, x = A[0] + (B[0] - A[0]) * t, w = Math.abs(B[0] - A[0]) / 2 || 1, d = Math.min(1, Math.abs(x - mouthX) / w); arc.push([x, dip - (dip - y0) * d ** 2.4]); }
  }
  p.shadedFill(arc, o.beard, mul(o.beard, SH_FELT), light, H.a, 0.35);
  p.poly(arc, null, ow * 0.8);
};
/** the hair below a hat at the back of the head: the back third in profile, a sliver at the far edge of the three-quarter view
 *  (`dir` -1 = the hair is where x < edge, 1 = where x > edge). The hat is drawn after it. */
const napeHair = (p: Pen, o: Outfit, hp: P2[], hc: number, H: Blob, seed: number, light: number, ow: number, edge: number, dir: number) => {
  if (o.hat === "hair" || o.hat === "bonnet" || o.hat === "scarf" || !o.hat) return;
  const col = o.hair ?? o.moustache ?? ["#5b3a22", "#2b2026", "#8a6a3a", "#3a2a1e", "#a8824c", "#4a3020"][Math.floor(rnd(seed, 31) * 6)];
  const yb = hc + 0.5 * H.b, n = hp.length, kp = (q: P2) => (q[0] - edge) * dir > 0 && q[1] < yb;
  const st = Math.max(0, hp.findIndex((q, i) => kp(q) && !kp(hp[(i + n - 1) % n])));
  const arc = [...hp.slice(st), ...hp.slice(0, st)].filter(kp);
  if (arc.length < 3) return;
  // the hairline runs from the crown down in front of where the ear would be and back to the nape (a short sideburn)
  const A = arc[arc.length - 1], B = arc[0], top = dir < 0 ? A : B, low = dir < 0 ? B : A;
  const inner = curve(top, [edge - dir * 0.04 * H.a, hc + 0.5 * H.b], low, 10).slice(1, -1);
  const pts = dir < 0 ? [...arc, ...inner] : [...arc, ...inner.reverse()];
  p.shadedFill(pts, col, mul(col, SH_FELT), light, H.a, 0.35); p.poly(pts, null, ow * 0.8);
};
const glassesOn = (p: Pen, o: Outfit, xs: number[], y: number, u: number, back?: P2) => {
  if (!o.glasses || BACK) return;
  for (const x of xs) { p.ell(x, y, 11 * u, 11 * u, "rgba(190,225,250,0.28)", 0); p.ell(x, y, 11 * u, 11 * u, null, 2.8 * u); }
  if (xs.length > 1) p.stroke([[xs[0] + 11 * u, y - 2 * u], [xs[1] - 11 * u, y - 2 * u]], 2.6 * u);
  if (back) p.stroke([[xs[0] - 11 * u, y - 2 * u], back], 2.6 * u);
};
const tieOn = (p: Pen, o: Outfit, cx: number, y: number, u: number) => {
  if (!o.tie || BACK) return;
  p.poly([[cx, y], [cx - 15 * u, y - 8 * u], [cx - 15 * u, y + 8 * u]], o.tie, 2.6 * u);
  p.poly([[cx, y], [cx + 15 * u, y - 8 * u], [cx + 15 * u, y + 8 * u]], o.tie, 2.6 * u);
  p.dot(cx, y, 4.6 * u, INK); p.dot(cx, y, 3 * u, o.tie);
};

// ---------------- hats ----------------
const BONNET = "#e9cf8f", BONNET_BRIM = "#d6b46a";
/** parts of a hat that sit behind the head (bonnet) */
const hatBehind = (p: Pen, o: Outfit, H: Blob, cx: number, hc: number, light: number, thick: number, ow: number, side: boolean) => {
  if (o.hat === "scarf") {
    const sb = blobPts(cx, hc + 0.1 * H.b, { ...H, a: H.a * 1.2, b: H.b * 1.2, asym: 0, egg: 0.04, seed: H.seed + 3 });
    p.shadedFill(sb, o.cap ?? "#e9d9b0", mul(o.cap ?? "#e9d9b0", SH_CLOTH), light, H.a * 1.2); p.inkRing(sb, ow * 0.85, thick);
    return;
  }
  if (o.hat !== "bonnet") return;
  const bb = blobPts(cx - (side ? 12 : 0) * (H.a / 50), hc - 0.07 * 2 * H.b, { ...H, a: H.a * 1.17, b: H.b * 1.13, asym: 0, egg: 0.04, seed: H.seed + 3 });
  p.shadedFill(bb, BONNET, mul(BONNET, SH_CLOTH), light, H.a * 1.17);
  p.inkRing(bb, ow * 0.85, thick);
};

/** Sir Digsworth's flat cap: a soft tweed crown wider than the head and standing up above it, seams fanning from a button,
 *  and a short darker peak the full width of the cap, joined to its lower front edge (front), or pointing forward (side). */
const sirCap = (p: Pen, o: Outfit, H: Blob, cx: number, hc: number, R: (pts: P2[]) => P2[], light: number, side: boolean, facing: number, seed: number, ow: number) => {
  const u = (2 * H.a) / 100, a = H.a, b = H.b, ye = hc - 0.7 * b;
  const tq = side || BACK ? 0 : TURN, aq = Math.abs(tq);
  const col = o.cap!, dark = shade(col, 0.78), sF = side ? 1 : Math.sign(tq) || facing || (rnd(seed, 21) < 0.5 ? -1 : 1);
  const x0 = side ? cx - 0.95 * a : cx - 1.07 * a, x1 = side ? cx + 1.02 * a : cx + 1.07 * a, xc = (x0 + x1) / 2, hw = (x1 - x0) / 2;
  const sag = (side ? 2 : 3) * u, h = (side ? 0.74 : 0.72) * b;
  const base = (x: number) => ye + sag * (1 - ((x - xc) / hw) ** 2);
  const top: P2[] = [], N = 32;
  for (let i = 0; i <= N; i++) {
    const th = Math.PI * (1 - i / N), c = Math.cos(th), x = xc + hw * c;
    const full = side ? 1 + 0.16 * c : 1 + 0.1 * sF * c;
    top.push([x, base(x) - h * Math.sin(th) ** 0.72 * full]);
  }
  const bot: P2[] = [];
  for (let i = 0; i <= 12; i++) { const x = x1 - ((x1 - x0) * i) / 12; bot.push([x, base(x)]); }
  const crown = R([...top, ...bot]);
  p.shadedFill(crown, col, mul(col, SH_FELT), light, a, 0.35);
  p.clip(crown, () => {
    const g = p.g;
    g.save(); g.globalAlpha = 0.2;
    for (let k = -14; k <= 14; k++) {
      p.stroke(R([[xc + k * 9 * u, ye - 1.1 * b], [xc + k * 9 * u, ye + 10 * u]]), 1.3 * u, "#3b2a1a");
      p.stroke(R([[x0 - 10 * u, ye - 0.2 * b + k * 9 * u], [x1 + 10 * u, ye - 0.2 * b + k * 9 * u]]), 1.3 * u, "#3b2a1a");
    }
    g.restore();
    const bt: P2 = [xc + (side ? 0.05 : 0.12 + 0.2 * aq) * hw * sF, ye - h * 0.93];
    for (const k of side ? [-0.8, -0.35, 0.1, 0.55, 0.92] : [-0.9, -0.55, -0.2, 0.2, 0.55, 0.9]) {
      const e: P2 = [xc + hw * k, base(xc + hw * k) + 1 * u], m: P2 = [(bt[0] + e[0]) / 2 + k * 5 * u, (bt[1] + e[1]) / 2 - 2 * u];
      p.stroke(R(curve(bt, m, e, 8)), 1.4 * u, "#5a3f24");
    }
  });
  p.poly(crown, null, ow);
  const [bx, by] = R([[xc + (side ? 0.05 : 0.12 + 0.2 * aq) * hw * sF, ye - h * 0.93]])[0];
  p.dot(bx, by, 3.6 * u, INK); p.dot(bx, by, 2.4 * u, shade(col, 0.82));
  if (BACK) return;
  if (side) {
    // in profile: a short peak joined to the lower front edge of the crown, curving a little down toward its tip
    const pa = xc + 0.3 * hw, tip: P2 = [x1 + 21 * u, ye + 8 * u], up: P2[] = [];
    for (let i = 0; i <= 8; i++) { const x = pa + ((x1 - pa) * i) / 8; up.push([x, base(x) - 1 * u]); }
    const pk = R([...up, ...curve([x1, base(x1) - 1 * u], [x1 + 12 * u, ye + 1 * u], tip, 8).slice(1), ...curve(tip, [x1 + 2 * u, ye + 17 * u], [pa, base(pa) + 9 * u], 10).slice(1)]);
    p.poly(pk, dark, ow);
  } else {
    const upper: P2[] = [], lower: P2[] = [];
    // turned: the peak points where he looks, past the edge of the crown on that side, and ends under the crown on the other
    const pc = xc + 0.34 * hw * tq, ph = hw * (0.96 - 0.14 * aq);
    for (let i = 0; i <= 20; i++) {
      const x = pc - ph + (2 * ph * i) / 20, t = ((x - pc) / ph) ** 2;
      upper.push([x, base(x) - 1 * u]); lower.push([x, base(x) + (11 + 2 * aq) * u * Math.max(0, 1 - t) ** 0.6]);
    }
    p.poly(R([...upper, ...lower.reverse()]), dark, ow);
  }
};

/** the hats of the new look (Outfit.gent): real hats that sit on the head, wider than it, with an ink outline */
const gentHat = (p: Pen, o: Outfit, H: Blob, cx: number, hc: number, R: (pts: P2[]) => P2[], light: number, side: boolean, ow: number) => {
  const u = (2 * H.a) / 100, a = H.a, b = H.b, deg = Math.atan2(R([[cx + 1, hc]])[0][1] - R([[cx, hc]])[0][1], R([[cx + 1, hc]])[0][0] - R([[cx, hc]])[0][0]) * 180 / Math.PI;
  const dome = (xc: number, hw: number, ye: number, h: number, sag: number, pw = 0.72, front = 0): { pts: P2[]; base: (x: number) => number } => {
    const base = (x: number) => ye + sag * (1 - ((x - xc) / hw) ** 2), top: P2[] = [], bot: P2[] = [];
    for (let i = 0; i <= 32; i++) { const th = Math.PI * (1 - i / 32), c = Math.cos(th), x = xc + hw * c; top.push([x, base(x) - h * Math.abs(Math.sin(th)) ** pw * (1 + front * c)]); }
    for (let i = 0; i <= 12; i++) { const x = xc + hw - (2 * hw * i) / 12; bot.push([x, base(x)]); }
    return { pts: R([...top, ...bot]), base };
  };
  const bandAt = (y0: number, y1: number, xa: number, xb: number, sag: number, xc: number, hw: number): P2[] => {
    const f = (x: number) => sag * (1 - ((x - xc) / hw) ** 2), up: P2[] = [], dn: P2[] = [];
    for (let i = 0; i <= 12; i++) { const x = xa + ((xb - xa) * i) / 12; up.push([x, y0 + f(x)]); dn.push([xb - ((xb - xa) * i) / 12, y1 + f(xb - ((xb - xa) * i) / 12)]); }
    return R([...up, ...dn]);
  };
  const fill = (pts: P2[], col: string, w = 0.35) => { p.shadedFill(pts, col, mul(col, SH_FELT), light, a, w); };
  const mk = (cxx: number) => cxx;
  if (o.hat === "peaked") { // officer: white crown, dark band with a badge, a short dark peak
    const col = o.cap ?? "#f1efe6", ye = hc - 0.72 * b, hw = 1.08 * a, band = shade("#2a3350", 1);
    const d = dome(mk(cx), hw, ye, 0.5 * b, 3 * u, 0.5);
    fill(d.pts, col);
    p.clip(d.pts, () => { p.poly(bandAt(ye - 0.2 * b, ye + 8 * u, cx - hw - 4 * u, cx + hw + 4 * u, 3 * u, cx, hw), band, 0); });
    p.poly(d.pts, null, ow);
    if (!BACK) {
      if (side) p.poly(R([[cx + 0.5 * hw, ye + 1 * u], [cx + hw + 22 * u, ye + 8 * u], [cx + 0.5 * hw, ye + 10 * u]]), "#1d2030", ow);
      else { const up: P2[] = [], lo: P2[] = [], pcx = cx + 0.34 * hw * TURN, phw = hw * (1 - 0.12 * Math.abs(TURN)); for (let i = 0; i <= 20; i++) { const x = pcx - 0.82 * phw + (1.64 * phw * i) / 20, t = ((x - pcx) / phw) ** 2; up.push([x, d.base(x) + 3 * u]); lo.push([x, d.base(x) + 3 * u + 7 * u * Math.max(0, 1 - t / 0.67) ** 0.6]); }
        p.poly(R([...up, ...lo.reverse()]), "#1d2030", ow); }
      const [gx, gy] = R([[cx + (side ? 0.5 * hw : 0.34 * hw * TURN), ye - 0.1 * b]])[0];
      p.ell(gx, gy, 6.5 * u, 5.5 * u, "#e2bb4c", 2.2 * u, 0, 360, deg); p.dot(gx, gy, 1.8 * u, INK);
    }
  } else if (o.hat === "tophat") { // a tall silk hat on a narrow brim, a ribbon round it
    const col = o.cap ?? "#3a3640", ye = hc - 0.58 * b, hw = 0.98 * a, cw = 0.66 * a, ch = 1.0 * b;
    const [bx, by] = R([[cx, ye + 2 * u]])[0];
    p.ell(bx, by, hw, 0.1 * b, shade(col, 0.8), ow, 0, 360, deg);
    const body = R([[cx - cw, ye + 2 * u], [cx - cw * 0.93, ye - ch], [cx + cw * 0.93, ye - ch], [cx + cw, ye + 2 * u], ...[...Array(9)].map((_, i) => [cx + cw - (2 * cw * (i + 1)) / 10, ye + 2 * u + 3 * u * (1 - (((i + 1) / 5) - 1) ** 2)] as P2)]);
    fill(body, col, 0.4);
    p.clip(body, () => p.poly(R([[cx - cw - 4 * u, ye - 0.26 * b], [cx + cw + 4 * u, ye - 0.26 * b], [cx + cw + 4 * u, ye + 2 * u], [cx - cw - 4 * u, ye + 2 * u]]), o.jacket, 0));
    p.poly(body, null, ow);
    const [tx, ty] = R([[cx, ye - ch]])[0]; p.ell(tx, ty, 0.93 * cw, 0.08 * b, shade(col, 1.15), ow * 0.8, 0, 360, deg);
  } else if (o.hat === "bonnet") { // a cloth bonnet pulled over the hair, a frill at the front edge, a ribbon in the dress colour
    const cream = "#eadfc2", ye = hc - 0.7 * b, hw = 1.08 * a;
    const d = dome(cx, hw, ye, 0.62 * b, 6 * u, 0.7, 0.08);
    fill(d.pts, cream);
    p.clip(d.pts, () => p.poly(bandAt(ye - 0.2 * b, ye + 12 * u, cx - hw - 4 * u, cx + hw + 4 * u, 6 * u, cx, hw), o.dress ?? "#c25a7a", 0));
    p.poly(d.pts, null, ow);
    const fr: P2[] = []; for (let i = 0; i <= 14; i++) { const x = cx - 0.96 * hw + (1.92 * hw * i) / 14; fr.push([x, d.base(x) + 1 * u + (i % 2 ? 5 : 1) * u]); }
    p.stroke(R(fr), 5 * u, INK); p.stroke(R(fr), 2.6 * u, "#f6efdb");
  } else { // the kid's sailor cap: a round white crown on an upturned brim with a navy ribbon
    const col = o.cap ?? "#f1efe6", ye = hc - 0.66 * b, hw = 1.08 * a;
    const d = dome(cx, hw, ye - 0.1 * b, 0.42 * b, 3 * u, 0.55);
    fill(d.pts, col);
    p.poly(d.pts, null, ow);
    const br = bandAt(ye - 0.14 * b, ye + 0.08 * b, cx - hw * 0.98, cx + hw * 0.98, 4 * u, cx, hw);
    fill(br, shade(col, 0.88), 0.5);
    p.clip(br, () => p.poly(bandAt(ye - 0.02 * b, ye + 0.04 * b, cx - hw, cx + hw, 4 * u, cx, hw), o.jacket, 0));
    p.poly(br, null, ow);
  }
};

/** the hats of the Romans: a legionary's helmet with a crest and cheek flaps, a baker's cloth cap, a woman's headscarf */
const romanHat = (p: Pen, o: Outfit, H: Blob, cx: number, hc: number, R: (pts: P2[]) => P2[], light: number, ow: number) => {
  const u = (2 * H.a) / 100, a = H.a, b = H.b;
  const dome = (hw: number, ye: number, h: number, pw: number, sag = 3 * u): P2[] => {
    const base = (x: number) => ye + sag * (1 - ((x - cx) / hw) ** 2), top: P2[] = [], bot: P2[] = [];
    for (let i = 0; i <= 32; i++) { const th = Math.PI * (1 - i / 32), x = cx + hw * Math.cos(th); top.push([x, base(x) - h * Math.abs(Math.sin(th)) ** pw]); }
    for (let i = 0; i <= 12; i++) { const x = cx + hw - (2 * hw * i) / 12; bot.push([x, base(x)]); }
    return R([...top, ...bot]);
  };
  const fill = (pts: P2[], c: string) => p.shadedFill(pts, c, mul(c, SH_FELT), light, a, 0.35);
  if (o.hat === "helmet") {
    const ye = hc - 0.62 * b, hw = 1.08 * a, st = "#aab3be";
    { const k = 1 - 0.3 * Math.abs(BACK ? 0 : TURN), cc = cx + 0.1 * hw * (BACK ? 0 : TURN);
      p.poly(R([[cc - 0.62 * hw * k, ye - 0.2 * b], [cc - 0.5 * hw * k, ye - 0.9 * b], [cc - 0.2 * hw * k, ye - 1.15 * b], [cc + 0.2 * hw * k, ye - 1.15 * b], [cc + 0.5 * hw * k, ye - 0.9 * b], [cc + 0.62 * hw * k, ye - 0.2 * b]]), "#c8312b", ow); }
    // turned: the cheek flap toward the lens moves in over the cheek and widens, the far one closes up; crest and rivets slide with the face
    const tq = BACK ? 0 : TURN, aq = Math.abs(tq), sg = Math.sign(tq);
    for (const s of [-1, 1]) { const far = aq > 0 && s === sg, sh2 = aq && !far ? -s * 0.26 * hw * aq : 0, w = far ? 1 - 0.6 * aq : 1 + 0.5 * aq, xo = cx + s * 1.05 * hw + sh2;
      p.poly(R([[xo - s * 0.21 * hw * w, ye - 0.05 * b], [xo, ye + 0.05 * b], [xo - s * 0.03 * hw, ye + 0.95 * b], [xo - s * 0.25 * hw * w, ye + 0.88 * b]]), "#98a1ad", ow); }
    const d = dome(hw, ye, 0.62 * b, 0.55); fill(d, st);
    p.clip(d, () => p.poly(R([[cx - hw - 4 * u, ye - 0.15 * b], [cx + hw + 4 * u, ye - 0.15 * b], [cx + hw + 4 * u, ye + 8 * u], [cx - hw - 4 * u, ye + 8 * u]]), "#7d8691", 0));
    p.poly(d, null, ow);
    p.stroke(R([[cx - 0.5 * hw, ye - 0.46 * b], [cx - 0.15 * hw, ye - 0.56 * b]]), 5 * u, "#eef2f6");
    for (const s of [-0.55, 0, 0.55]) { const [rx, ry] = R([[cx + (s * (1 - 0.15 * aq) + 0.3 * tq) * hw, ye - 0.08 * b]])[0]; p.dot(rx, ry, 3.2 * u, INK); p.dot(rx, ry, 2 * u, "#e2bb4c"); }
  } else if (o.hat === "bakercap") {
    const ye = hc - 0.66 * b, hw = 1.04 * a, col = o.cap ?? "#f2efe4", d = dome(hw, ye, 0.66 * b, 0.5, 4 * u);
    fill(d, col);
    p.clip(d, () => p.poly(R([[cx - hw - 4 * u, ye - 0.14 * b], [cx + hw + 4 * u, ye - 0.14 * b], [cx + hw + 4 * u, ye + 8 * u], [cx - hw - 4 * u, ye + 8 * u]]), shade(col, 0.88), 0));
    p.poly(d, null, ow);
    p.stroke(R([[cx - (0.4 - 0.3 * TURN) * hw, ye - 0.38 * b], [cx - (0.05 - 0.3 * TURN) * hw, ye - 0.5 * b]]), 4 * u, "#ffffff");
    if (TURN && !BACK) { const fx = cx + 0.5 * hw * TURN; p.stroke(R([[fx - 0.3 * hw, ye + 5 * u], [fx, ye + 7 * u], [fx + 0.3 * hw, ye + 5 * u]]), 2 * u, shade(col, 0.62)); }   // the gathered front edge
  } else {
    const ye = hc - 0.6 * b, hw = 1.14 * a, col = o.cap ?? "#e9d9b0", d = dome(hw, ye, 0.7 * b, 0.62, 5 * u);
    fill(d, col);
    p.clip(d, () => p.poly(R([[cx - hw - 4 * u, ye - 0.1 * b], [cx + hw + 4 * u, ye - 0.1 * b], [cx + hw + 4 * u, ye + 10 * u], [cx - hw - 4 * u, ye + 10 * u]]), o.dress ?? "#b8584a", 0));
    p.poly(d, null, ow);
  }
};

const hatOn = (p: Pen, o: Outfit, hp: P2[], H: Blob, cx0: number, hc: number, light: number, seed: number, facing: number, side: boolean) => {
  const W = 2 * H.a, HH = 2 * H.b, u = W / 100, ow = 0.85 * 5 * u;
  // A brimmed hat sits on the head as drawn, not on its nominal centre: the outline is lopsided (the face bulges
  // forward, most of all in the side view), so centre the hat over the top of the outline, where the brim meets it.
  let cx = cx0, crown = hc - H.b;
  if (o.hat !== "cap" && o.hat !== "hair" && o.hat !== "bonnet") {
    crown = Math.min(...hp.map((q) => q[1]));
    const xs = hp.filter((q) => q[1] <= crown + 0.26 * HH).map((q) => q[0]);
    if (xs.length > 1) cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  }
  // tilt with the head, +-2 deg extra. In the side view the whole upper body leans into the walk (pen rotation): a brimmed
  // hat that leaned with it looked as if it were sliding off over the eyes, so there it stays close to level.
  const lean = side && p.rot ? p.rot[0] : 0;
  const a = (side ? rad(1.5) - 0.75 * lean : H.rot) + rad(4 * (rnd(seed, 20) - 0.5));
  // the hat follows the head a moment late: the motion library gives the offset (CAPV)
  const R = (pts: P2[]) => { const r = rotPts(pts, a + rad(CAPV[2]), cx, hc); return CAPV[0] || CAPV[1] ? r.map(([x, y]) => [x + CAPV[0] * u, y + CAPV[1] * u] as P2) : r; };
  if ((Math.abs(CAPV[0]) > 2 || Math.abs(CAPV[1]) > 2) && !BACK && o.hat !== "hair" && o.hat !== "bonnet" && o.hat !== "scarf") {
    // a hat lifted off the head shows the hair under it
    const hcol = o.hair ?? o.moustache ?? ["#5b3a22", "#2b2026", "#8a6a3a", "#3a2a1e", "#a8824c", "#4a3020"][Math.floor(rnd(seed, 31) * 6)];
    const yk = hc - 0.6 * H.b, m = hp.length, kp = (q: P2) => q[1] < yk, st = Math.max(0, hp.findIndex((q, i) => kp(q) && !kp(hp[(i + m - 1) % m])));
    const arc = [...hp.slice(st), ...hp.slice(0, st)].filter(kp);
    if (arc.length >= 3) { p.shadedFill(arc, hcol, mul(hcol, SH_FELT), light, H.a, 0.35); p.poly(arc, null, ow * 0.8); }
  }
  const sag = (yb: number, wb: number): P2[] => {
    const base: P2[] = [];
    for (let i = 0; i <= 12; i++) { const t = i / 12; base.push([cx + wb * (2 * t - 1), yb + 3 * u * (1 - (2 * t - 1) ** 2)]); }
    return base;
  };
  if (BACK && o.hat === "bonnet") {
    // a bonnet seen from behind covers the whole head: gathered cloth, a ribbon tied at the neck
    const bb = hp.map(([x, y]) => [cx0 + (x - cx0) * 1.05, hc + (y - hc) * 1.05] as P2);
    p.shadedFill(bb, BONNET, mul(BONNET, SH_CLOTH), light, H.a * 1.05);
    p.clip(bb, () => { for (const s of [-0.55, 0, 0.55]) p.stroke([[cx0 + s * H.a, hc - 0.7 * H.b], [cx0 + s * 0.5 * H.a, hc + 0.75 * H.b]], 1.6 * u, BONNET_BRIM); });
    p.poly(bb, null, ow);
    p.stroke([[cx0 - 0.5 * H.a, hc + 0.8 * H.b], [cx0, hc + 0.93 * H.b], [cx0 + 0.5 * H.a, hc + 0.8 * H.b]], 3.2 * u, BONNET_BRIM);
    return;
  }
  if (BACK) { // seen from behind: ears, and the back of the head is hair down to the neck (whatever the hat)
    const low = hc + 1.2 * H.b, m = hp.length, kp = (y: number) => y < low;
    const st = Math.max(0, hp.findIndex(([, y], i) => kp(y) && !kp(hp[(i + m - 1) % m][1])));
    const ha = [...hp.slice(st), ...hp.slice(0, st)].filter(([, y]) => kp(y)).map(([x, y]) => [cx0 + (x - cx0) * 1.02, hc + (y - hc) * 1.02] as P2);
    const hcol = o.hair ?? o.moustache ?? ["#5b3a22", "#2b2026", "#8a6a3a", "#3a2a1e", "#a8824c", "#4a3020"][Math.floor(rnd(seed, 31) * 6)];
    for (const s of [-1, 1]) p.ell(cx0 + s * 0.97 * H.a, hc + 0.12 * H.b, 0.13 * H.a, 0.2 * H.b, o.skin ?? SKIN, ow * 0.8);
    if (ha.length >= 3) { p.shadedFill(ha, hcol, mul(hcol, SH_FELT), light, H.a, 0.35); p.poly(ha, null, ow * 0.8); }
  }
  if (o.hat === "shako" || o.hat === "shako_tall") {
    const tall = o.hat === "shako_tall", yb = crown + 0.25 * HH, ht = (tall ? 0.66 : 0.56) * HH, wb = 46 * u, wt = 52 * u;
    const body = R([...sag(yb, wb).reverse(), [cx - wt, yb - ht], [cx + wt, yb - ht]]);
    p.shadedFill(body, "#3a3d47", "#24262d", light, wt, 0.4);
    if (tall) p.clip(body, () => p.band(R([[cx - wt - 5 * u, yb - ht + 0.07 * HH], [cx + wt + 5 * u, yb - ht + 0.07 * HH]]), "#e8c45a", 0.06 * HH, 1.5 * u));
    p.poly(body, null, ow);
    const deg = (a * 180) / Math.PI;
    if (side) {
      p.poly(R([[cx + 36 * u, yb - 1 * u], [cx + 60 * u, yb + 8 * u], [cx + 34 * u, yb + 6 * u]]), "#16171b", 2.5 * u);
      const [tx, ty] = R([[cx + 24 * u, yb - ht - 6 * u]])[0];
      p.ell(tx, ty, 7 * u, 7 * u, "#2b7a4b", 2.5 * u);
    } else {
      const [px, py] = R([[cx + 3 * u * facing + 0.3 * wb * TURN, yb + 3 * u]])[0];
      p.ell(px, py, 34 * u, 0.045 * HH, "#16171b", 2.5 * u, 0, 180, deg); // peak
      const [bx, by] = R([[cx + 0.42 * wb * TURN, yb - 0.45 * ht]])[0];
      p.ell(bx, by, 7 * u, 6 * u, tall ? "#e8c45a" : "#c9ccd2", 2 * u, 0, 360, deg); // badge plate
      p.arc(bx, by, 3.5 * u, 2.8 * u, 200, 500, 1.6 * u);
      const [tx, ty] = R([[cx, yb - ht - 6 * u]])[0];
      p.ell(tx, ty, 7 * u, 7 * u, "#2b7a4b", 2.5 * u); // green tuft
    }
  } else if (o.hat === "hair" && o.bald && !BACK) {
    const col = o.hair!;
    for (const s of side ? [-1] : [-1, 1]) p.ell(cx0 + s * (side ? 0.8 : 0.9) * H.a, hc - 0.02 * H.b, (side ? 0.3 : 0.17) * H.a, 0.36 * H.b, col, ow * 0.8, 0, 360, s * 8);
  } else if (o.roman && (o.hat === "helmet" || o.hat === "bakercap" || o.hat === "scarf")) {
    romanHat(p, o, H, cx, hc, R, light, ow);
  } else if (o.gent && (o.hat === "peaked" || o.hat === "tophat" || o.hat === "bonnet" || o.hat === "cap")) {
    gentHat(p, o, H, cx, hc, R, light, side, ow);
  } else if (o.hat === "cap" && o.sir) {
    sirCap(p, o, H, cx, hc, R, light, side, facing, seed, ow);
  } else if (o.hat === "cap" || o.hat === "hair") {
    const cut = crown + (o.hat === "cap" ? 0.24 : side ? 0.23 : 0.3) * HH; // above the brows: hair and caps never run into the eyes
    const keep = (x: number, y: number) => y < cut || (side && o.hat === "hair" && x < cx - 6 * u && y < hc + 0.42 * H.b);
    // start the arc at the first kept point after a dropped one, so the kept run is contiguous and the cut closes it
    const n = hp.length, startIdx = Math.max(0, hp.findIndex(([x, y], i) => keep(x, y) && !keep(hp[(i + n - 1) % n][0], hp[(i + n - 1) % n][1])));
    const arc = [...hp.slice(startIdx), ...hp.slice(0, startIdx)].filter(([x, y]) => keep(x, y))
      .map(([x, y]) => [cx + (x - cx) * 1.03, hc + (y - hc) * 1.03] as P2);
    if (arc.length < 3) return;
    if (o.hat === "hair") { // scalloped lower edge
      const [x0, y0] = arc[arc.length - 1], [x1, y1] = arc[0];
      for (let i = 1; i < 6; i++) arc.push([x0 + ((x1 - x0) * i) / 6, y0 + ((y1 - y0) * i) / 6 + (i % 2 ? 4 * u : 0)]);
    }
    const col = o.hat === "cap" ? o.cap! : o.hair!;
    p.shadedFill(arc, col, mul(col, SH_FELT), light, H.a, 0.35);
    p.poly(arc, null, ow);
    if (o.hat === "hair") {
      const s = side ? -1 : facing || 1;
      p.stroke([[cx + s * 10 * u, cut - 30 * u], [cx + s * 2 * u, cut - 12 * u]], 1.2 * u);
    }
    if (o.hat === "cap" && !BACK) {
      const deg = (a * 180) / Math.PI;
      if (side) p.poly(R([[cx + 40 * u, cut - 2 * u], [cx + 74 * u, cut + 4 * u], [cx + 40 * u, cut + 6 * u]]), shade(col, 0.8), ow);
      else {
        const s = facing || (rnd(seed, 21) < 0.5 ? -1 : 1), [px, py] = R([[cx + (o.sir ? 0 : s * 4 * u) + 0.34 * H.a * TURN, cut + (o.sir ? 0 : 1.5 * u)]])[0];
        // Sir Digsworth's peak is as wide as the cap and joined to its lower edge (DAILY-RULES, 2026-11-16)
        p.ell(px, py, o.sir ? 0.9 * H.a : 32 * u, (o.sir ? 0.075 : 0.06) * HH, shade(col, 0.8), ow, 0, 180, deg);
      }
    }
  } else if (o.hat === "slouch" || o.hat === "peaked") {
    // Australian slouch hat (wide brim, creased crown, one side pinned up) / officer's peaked cap
    const col = o.cap ?? "#8c7a4f", sl = o.hat === "slouch", deg = (a * 180) / Math.PI;
    const yb = crown + (sl ? 0.26 : 0.24) * HH, ht = (sl ? 0.4 : 0.3) * HH, wb = (sl ? 0.4 : 0.44) * W, wt = (sl ? 0.3 : 0.53) * W;
    if (sl) {
      const [bx, by] = R([[cx + (side ? 5 * u : 0), yb + 2 * u]])[0];
      p.ell(bx, by, (side ? 0.68 : 0.72) * W, 0.07 * HH, shade(col, 0.8), ow, 0, 360, deg);
    }
    const top: P2[] = sl
      ? [[cx - wt, yb - ht + 7 * u], [cx - wt * 0.55, yb - ht - 3 * u], [cx, yb - ht + 6 * u], [cx + wt * 0.55, yb - ht - 3 * u], [cx + wt, yb - ht + 7 * u]]
      : [[cx - wt, yb - ht + 5 * u], [cx - wt * 0.6, yb - ht - 2 * u], [cx + wt * 0.6, yb - ht - 2 * u], [cx + wt, yb - ht + 5 * u]];
    const body = R([...sag(yb, wb).reverse(), ...top]);
    p.shadedFill(body, col, mul(col, SH_FELT), light, wt, 0.4);
    p.clip(body, () => p.band(R([[cx - wb - 6 * u, yb - 0.075 * HH], [cx + wb + 6 * u, yb - 0.075 * HH]]), sl ? shade(col, 0.66) : shade(col, 0.78), 0.1 * HH, 1.2 * u));
    p.poly(body, null, ow);
    if (sl) {
      const s = side ? -1 : 1; // pinned-up brim + rising-sun badge
      p.poly(R([[cx + s * 0.52 * W, yb + 2 * u], [cx + s * 0.74 * W, yb - 2 * u], [cx + s * 0.6 * W, yb - 0.3 * HH], [cx + s * 0.4 * W, yb - 0.06 * HH]]), shade(col, 0.9), 2.6 * u);
      const [gx, gy] = R([[cx + s * 0.56 * W, yb - 0.13 * HH]])[0];
      p.dot(gx, gy, 4.2 * u, INK); p.dot(gx, gy, 3 * u, "#d8b24a");
    } else if (!BACK) {
      if (side) p.poly(R([[cx + 38 * u, yb - 1 * u], [cx + 66 * u, yb + 9 * u], [cx + 36 * u, yb + 7 * u]]), "#3b2a1e", 2.5 * u);
      else { const [px, py] = R([[cx + 3 * u * facing + 0.3 * wb * TURN, yb + 3 * u]])[0]; p.ell(px, py, 37 * u, 0.05 * HH, "#3b2a1e", 2.5 * u, 0, 180, deg); }
      const [gx, gy] = R([[cx + (side ? 30 * u : 0.42 * wb * TURN), yb - 0.19 * HH]])[0];
      p.dot(gx, gy, 5.4 * u, INK); p.dot(gx, gy, 4 * u, "#e2bb4c");
    }
  } else if (o.hat === "tophat") {
    const yb = crown + 0.22 * HH, ht = 0.8 * HH, wb = 0.31 * W, wt = 0.33 * W, col = "#2e2a36";
    const body = R([...sag(yb, wb).reverse(), [cx - wt, yb - ht], [cx + wt, yb - ht]]);
    p.shadedFill(body, col, mul(col, SH_FELT), light, wt, 0.4);
    p.clip(body, () => p.band(R([[cx - wt - 4 * u, yb - 0.13 * HH], [cx + wt + 4 * u, yb - 0.13 * HH]]), shade(o.jacket, 0.9), 0.14 * HH, 0.8 * u));
    p.poly(body, null, ow);
    const [bx, by] = R([[cx, yb + 1 * u]])[0];
    p.ell(bx + (side ? 3 * u : 0), by, (side ? 0.5 : 0.45) * W, 0.05 * HH, "#1d1b22", ow, 0, 360, (a * 180) / Math.PI);
  } else if (o.hat === "bonnet") {
    const [bx, by] = R([[cx + (side ? 6 * u : 0), crown + 0.16 * HH]])[0];
    p.arc(bx, by, 0.5 * W, 0.2 * HH, 200, 340, 7 * u, BONNET_BRIM);
    p.arc(bx, by, 0.5 * W + 3.5 * u, 0.2 * HH + 3.5 * u, 200, 340, 1.2 * u);
    const cy = hc + H.b * 0.98;
    p.stroke([[cx - 14 * u, cy - 4 * u], [cx, cy + 2 * u], [cx + 14 * u, cy - 4 * u]], 2 * u, BONNET_BRIM);
  } else if (o.hat === "bowler") {
    // a detective's bowler: a round crown on a narrow curled brim
    const yb = crown + 0.24 * HH, ht = 0.46 * HH, wb = 0.34 * W, col = o.cap ?? "#2e2a36", dome: P2[] = [];
    for (let i = 0; i <= 14; i++) { const t = (Math.PI * i) / 14; dome.push([cx - wb * Math.cos(t), yb - ht * Math.sin(t) ** 0.8]); }
    const body = R([...sag(yb, wb).reverse(), ...dome.slice(1, -1)]);
    p.shadedFill(body, col, mul(col, SH_FELT), light, wb, 0.4);
    p.clip(body, () => p.band(R([[cx - wb - 4 * u, yb - 0.07 * HH], [cx + wb + 4 * u, yb - 0.07 * HH]]), shade(col, 0.62), 0.08 * HH, 0.8 * u));
    p.poly(body, null, ow);
    const [bx, by] = R([[cx, yb + 1 * u]])[0];
    p.ell(bx + (side ? 3 * u : 0), by, (side ? 0.51 : 0.47) * W, 0.05 * HH, shade(col, 0.8), ow, 0, 360, (a * 180) / Math.PI);
    if (TURN && !BACK && !side) { const [kx2, ky2] = R([[cx - Math.sign(TURN) * 0.2 * W, yb - 0.07 * HH]])[0]; p.poly(rrect(kx2 - 4 * u, ky2 - 4.4 * u, kx2 + 4 * u, ky2 + 4.4 * u, 1.5 * u), shade(col, 0.45), 1.4 * u); }   // the ribbon's flat bow, on his left side
  } else if (o.hat === "crown") {
    // a king's crown: a gold band with five points and jewels
    const yb = crown + 0.2 * HH, ht = 0.44 * HH, wb = 0.36 * W, wt = 0.42 * W, col = "#e9b93a", top: P2[] = [];
    for (let i = 0; i <= 8; i++) top.push([cx - wt + (2 * wt * i) / 8, yb - (i % 2 ? 0.5 : 1) * ht]);
    const body = R([...sag(yb, wb).reverse(), ...top]);
    p.shadedFill(body, col, mul(col, SH_FELT), light, wt, 0.4);
    p.clip(body, () => p.band(R([[cx - wb - 4 * u, yb - 0.08 * HH], [cx + wb + 4 * u, yb - 0.08 * HH]]), "#c8312b", 0.09 * HH, 0.8 * u));
    p.poly(body, null, ow);
    for (let i = 0; i <= 8; i += 2) { const [jx, jy] = R([[cx - wt + (2 * wt * i) / 8, yb - ht - 1 * u]])[0]; p.dot(jx, jy, 4.6 * u, INK); p.dot(jx, jy, 3.2 * u, i % 4 ? "#6fb6e6" : "#f4efe0"); }
  } else if (o.hat === "bicorne") {
    // Napoleon's hat, worn side to side
    const yb = crown + 0.27 * HH, col = o.cap ?? "#22242c", wb = 0.78 * W;
    const body = R([...sag(yb, 0.5 * W).reverse(), [cx - wb, yb + 3 * u], [cx - 0.5 * W, yb - 0.3 * HH], [cx - 0.16 * W, yb - 0.5 * HH], [cx + 0.16 * W, yb - 0.5 * HH], [cx + 0.5 * W, yb - 0.3 * HH], [cx + wb, yb + 3 * u]]);
    p.shadedFill(body, col, mul(col, SH_FELT), light, wb, 0.4);
    p.poly(body, null, ow);
    const [gx, gy] = R([[cx + (side ? 20 * u : 0.24 * W * TURN), yb - 0.26 * HH]])[0];
    const ck = o.cockade ?? ["#c8312b", "#f4efe0", "#2a4f9a"]; p.dot(gx, gy, 7.5 * u, INK); p.dot(gx, gy, 6 * u, ck[0]); p.dot(gx, gy, 3.6 * u, ck[1]); p.dot(gx, gy, 1.8 * u, ck[2]);
  } else if (o.hat === "beret") {
    // a painter's beret, pulled to one side
    const col = o.cap ?? "#2e2a36", s = side ? -1 : facing || 1, [bx, by] = R([[cx + s * 9 * u, crown + 0.15 * HH]])[0], deg = (a * 180) / Math.PI - s * 9;
    p.ell(bx, by, 0.56 * W, 0.17 * HH, col, ow, 0, 360, deg);
    p.ell(bx, by - 0.03 * HH, 0.4 * W, 0.08 * HH, mul(col, SH_FELT), 0, 0, 360, deg);
    const [sx, sy] = R([[cx + s * 9 * u, crown + 0.15 * HH - 0.17 * HH]])[0];
    p.stroke([[sx, sy + 1 * u], [sx + s * 2 * u, sy - 6 * u]], 3.4 * u);
  }
};

// ---------------- bodies ----------------
export type Arms = [P2[], P2[]];
/** held prop; for the hammer the number is the strike 0 (raised) .. 1 (struck) */
export type Prop = null | "icecream" | "shako" | ["hammer", number];

/** how far the centre line of the clothes moves on a chest turned to the three-quarter view, in torso half-widths */
const CHEST_TURN = 0.42;
/** Sir Digsworth: a gentleman, not a peanut on stilts; short legs */
const SIR_BUILD = { a: 118, torso: 1.1, legs: 0.9, tw: 0.8 };
const GENT_BUILD: Record<Build, typeof SIR_BUILD> = { adult: SIR_BUILD, stout: { a: 118, torso: 1.12, legs: 0.88, tw: 0.9 }, kid: { a: 112, torso: 0.85, legs: 0.7, tw: 0.72 } };
const newBuild = (o: Outfit) => (o.sir ? SIR_BUILD : GENT_BUILD[o.build ?? "adult"]);
const BUILD: Record<Build, { a: number; torso: number; legs: number; tw: number }> = {
  adult: { a: 118, torso: 1.1, legs: 1.4, tw: 0.8 },
  stout: { a: 118, torso: 1.15, legs: 1.32, tw: 0.92 },
  kid: { a: 112, torso: 0.85, legs: 1.0, tw: 0.72 },
};

export type FrontOpts = {
  phase?: number; expr?: Expr; mode?: "march" | "stroll" | "stand" | "sit" | "fall"; look?: number; blink?: boolean | number; lift?: number;
  prop?: Prop; tilt?: number; headTilt?: number; wave?: number;
  /** looking up 0..1 (open and shocked eyes: pupils rise; the head tilts back a little); `look` is the horizontal gaze */
  lookUp?: number;
  /** right arm points out to screen-right (0..1); both arms up (0..1); palms-up shrug (0..1) */
  point?: number; cheer?: number; shrug?: number;
  /** canvas angle the key light comes FROM (painted crescent + thick outline side) */
  light?: number; facing?: -1 | 0 | 1; seed?: number;
  /** seen from behind: no face */
  back?: boolean;
  /** turned away from the lens, -1..1: +-1 is the three-quarter view to screen-left / screen-right (face, cap, coat, arms and feet turn) */
  turn?: number;
  /** hands busy (new look only): a loaf held up, a purse clutched to the chest, both hands on the cap; `run` bends the arms as in a sprint */
  hands?: "loaf" | "purse" | "head" | "purseR"; run?: number;
  /** ducking 0..1: the knees bend outward and the body sinks (with hands "head": taking cover) */
  crouch?: number;
  /** Sir Digsworth's monocle chain: sideways swing -1..1 (hangSway() gives it from the head's movement; a walk adds its own, a beat late) */
  chain?: number;
};

const footStroke = (p: Pen, a: P2, b: P2, w: number, col: string) => {
  if (col !== INK) p.stroke([a, b], w + 3, INK);
  p.stroke([a, b], w, col);
};


// ---------------- the Romans of the Pompeii film (Outfit.roman, needs gent) ----------------
const sandalStraps = (p: Pen, fx: number, fy: number, _side: number, u: number, col: string) => {
  for (const dy of [-11, -22]) { p.stroke([[fx - 10 * u, fy + dy * u], [fx + 10 * u, fy + dy * u]], 5 * u, INK); p.stroke([[fx - 10 * u, fy + dy * u], [fx + 10 * u, fy + dy * u]], 2.6 * u, col); }
};
/** the garment details inside the torso outline: segmented armour, a baker's apron, a belt */
const romanTorso = (p: Pen, o: Outfit, tcx: number, chin: number, torsoBot: number, HH: number, Ta: number, u: number) => {
  const r = o.roman;
  if (r === "soldier") {
    const y0 = chin + 0.02 * HH, y1 = torsoBot - 0.3 * HH, n = 6, h = (y1 - y0) / n;
    for (let i = 0; i < n; i++) { const ya = y0 + i * h; p.poly([[tcx - 1.4 * Ta, ya], [tcx + 1.4 * Ta, ya], [tcx + 1.4 * Ta, ya + h + 1], [tcx - 1.4 * Ta, ya + h + 1]], i % 2 ? "#a3acb7" : "#bcc4cd", 0); p.stroke([[tcx - 1.4 * Ta, ya], [tcx + 1.4 * Ta, ya]], 2.6 * u, INK); }
    if (!BACK) p.stroke([[tcx, y0], [tcx, y1]], 2.6 * u, INK);
    p.band([[tcx - 1.4 * Ta, torsoBot - 0.3 * HH], [tcx + 1.4 * Ta, torsoBot - 0.3 * HH]], "#6a4428", 0.1 * HH, 1.6 * u);
    if (!BACK) p.poly([[tcx - 5 * u, torsoBot - 0.35 * HH], [tcx + 5 * u, torsoBot - 0.35 * HH], [tcx + 5 * u, torsoBot - 0.26 * HH], [tcx - 5 * u, torsoBot - 0.26 * HH]], "#e2bb4c", 1.6 * u);
  } else if (r === "baker" && BACK) { // from behind: the apron's straps cross on the back and tie in a bow at the waist
    const wy = torsoBot - 0.3 * HH;
    for (const s of [-1, 1]) p.stroke([[tcx + s * 0.85 * Ta, chin - 0.02 * HH], [tcx - s * 0.6 * Ta, wy]], 3.4 * u, "#d6b87a");
    p.band([[tcx - 1.4 * Ta, wy], [tcx + 1.4 * Ta, wy]], "#d6b87a", 0.06 * HH, 1.4 * u);
    for (const s of [-1, 1]) { p.poly([[tcx, wy], [tcx + s * 12 * u, wy - 7 * u], [tcx + s * 12 * u, wy + 7 * u]], "#d6b87a", 1.8 * u); p.stroke([[tcx, wy], [tcx + s * 6 * u, wy + 0.2 * HH]], 3 * u, "#d6b87a"); }
  } else if (r === "baker") {
    const a0 = chin + 0.34 * HH, a1 = torsoBot + 0.3 * HH;
    for (const s of [-1, 1]) p.stroke([[tcx + s * 0.5 * Ta, a0], [tcx + s * 0.85 * Ta, chin - 0.02 * HH]], 3.4 * u, "#d6b87a");
    p.poly([[tcx - 0.58 * Ta, a0], [tcx + 0.58 * Ta, a0], [tcx + 0.95 * Ta, a1], [tcx - 0.95 * Ta, a1]], "#d6b87a", 2.4 * u);
    p.poly([[tcx - 0.38 * Ta, a0 + 0.28 * HH], [tcx + 0.38 * Ta, a0 + 0.28 * HH], [tcx + 0.4 * Ta, a0 + 0.5 * HH], [tcx - 0.4 * Ta, a0 + 0.5 * HH]], "#c4a468", 1.6 * u);
    for (const [dx, dy, rr] of [[-0.22, 0.12, 9], [0.3, 0.16, 6], [-0.5, 0.36, 6], [0.1, 0.72, 8], [0.45, 0.58, 5]] as const) { p.g.save(); p.g.globalAlpha = 0.85; p.dot(tcx + dx * Ta, a0 + dy * HH, rr * u * 0.6, "#ffffff"); p.g.restore(); }
  } else if (r === "boy" || r === "merchant") {
    p.band([[tcx - 1.4 * Ta, torsoBot - 0.22 * HH], [tcx + 1.4 * Ta, torsoBot - 0.22 * HH]], r === "boy" ? "#a9855a" : "#6a4428", 0.07 * HH, 1.4 * u);
  }
};
/** a short tunic: a skirt of cloth from the waist to `hem`, over the bare, walking legs */
const tunicSkirt = (p: Pen, o: Outfit, tcx: number, torsoBot: number, sole: number, HH: number, Ta: number, u: number, light: number, thick: number) => {
  const top = torsoBot - 0.3 * HH, bot = sole - (o.hem ?? 0.5) * HH, w0 = 1.2 * Ta, pts: P2[] = [[tcx - 0.88 * Ta, top], [tcx + 0.88 * Ta, top]];
  for (let i = 0; i <= 8; i++) { const t = i / 8; pts.push([tcx + w0 * (1 - 2 * t), bot + 4 * u * Math.sin(Math.PI * t)]); }
  p.gradFill(pts, o.jacket, mul(o.jacket, SH_CLOTH), light); p.inkRing(pts, 4.4 * u, thick);
  p.clip(pts, () => {
    if (o.roman === "soldier") for (let i = 0; i < 7; i++) { const x = tcx - 1.0 * Ta + (i * 2.0 * Ta) / 6; p.band([[x * 0.98 + tcx * 0.02, top + 0.2 * HH], [x, bot - 0.02 * HH]], "#7a5030", 7 * u, 1.5 * u); }
    if (o.roman === "baker" && !BACK) p.poly([[tcx - 0.58 * Ta, top], [tcx + 0.58 * Ta, top], [tcx + 0.9 * Ta, bot + 6 * u], [tcx - 0.9 * Ta, bot + 6 * u]], "#d6b87a", 2.4 * u);
  });
};
/** long tunic or dress: belt and stripes (merchant), belt and hem band (woman) */
const romanDress = (p: Pen, o: Outfit, tcx: number, chin: number, hem: number, HH: number, Ta: number, u: number) => {
  if (o.roman === "merchant") {
    for (const s of [-1, 1]) p.stroke([[tcx + s * 0.34 * Ta, chin + 0.35 * HH], [tcx + s * 0.4 * Ta, hem]], 5 * u, "#7b3f8c");
    p.band([[tcx - 1.4 * Ta, chin + 0.98 * HH], [tcx + 1.4 * Ta, chin + 0.98 * HH]], "#6a4428", 0.08 * HH, 1.4 * u);
    p.poly([[tcx - 4 * u, chin + 0.93 * HH], [tcx + 4 * u, chin + 0.93 * HH], [tcx + 4 * u, chin + 1.03 * HH], [tcx - 4 * u, chin + 1.03 * HH]], "#e2bb4c", 1.4 * u);
  } else if (o.roman === "woman") {
    p.band([[tcx - 1.4 * Ta, chin + 0.9 * HH], [tcx + 1.4 * Ta, chin + 0.9 * HH]], "#e9d9b0", 0.05 * HH, 1.4 * u);
    p.band([[tcx - 1.4 * Ta, hem - 0.09 * HH], [tcx + 1.4 * Ta, hem - 0.09 * HH]], "#e9d9b0", 0.06 * HH, 1.4 * u);
  }
};
/** a coin purse: a sack with a drawstring, a few coins at its mouth */
const purse = (p: Pen, x: number, y: number, u: number, k = 1) => {
  p.ell(x, y, 15 * u * k, 12 * u * k, "#8a5a34", 2.6 * u);
  p.poly([[x - 7 * u * k, y - 9 * u * k], [x + 7 * u * k, y - 9 * u * k], [x + 4 * u * k, y - 15 * u * k], [x - 4 * u * k, y - 15 * u * k]], "#6a4428", 2 * u);
  p.dot(x - 3 * u * k, y - 17 * u * k, 4.2 * u * k, INK); p.dot(x - 3 * u * k, y - 17 * u * k, 3 * u * k, "#e9b93a"); p.dot(x + 4 * u * k, y - 16 * u * k, 4.2 * u * k, INK); p.dot(x + 4 * u * k, y - 16 * u * k, 3 * u * k, "#e9b93a");
};

export const bodyFront = (p: Pen, o: Outfit, opts: FrontOpts) => {
  const { phase = 0, expr = "neutral", mode = "march", look = 0, blink = false, lift = 60, prop = null, tilt = 0, headTilt = 0, wave,
    light = DEF_LIGHT, facing = 0, seed = 1, point, cheer, shrug } = opts;
  SIR = !!o.sir; GT = !!o.gent; NEW = SIR || GT; BACK = !!opts.back; LOOKUP = clamp(opts.lookUp ?? 0, 0, 1);
  const tq = BACK ? 0 : clamp(opts.turn ?? 0, -1, 1), sg = Math.sign(tq), aq = Math.abs(tq);
  TURN = tq;
  const Bd = NEW ? newBuild(o) : BUILD[o.build ?? "adult"], skin = o.skin ?? SKIN, two = Math.PI * 2, lid = lidOf(blink);
  const H = headBlob(seed, Bd.a, facing);
  if (NEW) H.b *= 1.07; // a little more room for the cap, the moustache and the mouth
  if (aq) H.asym = sg * (Math.abs(H.asym) * (1 - aq) + 0.11 * aq);   // the face side of a turned head bulges
  /** sideways scale of what is drawn on `side` of the body's centre line: the far side of a turned chest closes up */
  const kf = (side: number) => (aq && side === sg ? 1 - 0.42 * aq : 1 + 0.12 * aq);
  const W = 2 * H.a, HH = 2 * H.b, u = W / 100;
  const tall = (1 + Bd.torso + Bd.legs) * HH, sole = 975;
  // body bob 5 % (march) / 3 % (stroll) of the height, lowest at contact (phase 0 and 0.5)
  const bob = mode === "march" ? 0.025 * tall * Math.cos(2 * two * phase) : mode === "stroll" ? 0.015 * tall * Math.cos(2 * two * phase) : 0;
  const cr = clamp(opts.crouch ?? 0, 0, 1);
  const torsoBot = mode === "sit" ? sole - 0.2 * HH : sole - Bd.legs * HH * (1 - 0.42 * cr) + bob;
  const chin = torsoBot - Bd.torso * HH, hc = chin - H.b, crown = hc - H.b, hipY = torsoBot - 0.12 * HH;
  const thick = thickAngle(light), ow = 5 * u;
  const legCol = NEW ? o.pants : mix(o.pants, INK, 0.55), armCol = o.roman ? skin : mix(o.jacket, INK, 0.5), footCol = o.boots;
  const legW = (NEW ? 17 : 5.8) * u, footW = (NEW ? 10 : 7.5) * u;
  // Sir's trousers are real trouser legs with an ink outline; everyone else keeps the single-stroke leg
  const legS = (pts: P2[]) => { if (NEW) p.stroke(pts, legW + 6 * u, INK); p.stroke(pts, legW, legCol); };
  // ---- legs + feet (not rotated) ----
  p.rot = null;
  if (mode === "sit") {
    for (const side of [-1, 1]) {
      const h: P2 = [300 + side * 15 * u, hipY], k: P2 = [300 + side * 36 * u, hipY + 0.2 * HH], f: P2 = [300 + side * 44 * u, sole - 8 * u];
      if (!(GT && o.dress)) legS(curve(h, k, f));
      footStroke(p, [f[0] - side * 2 * u, f[1]], [f[0] + side * 12 * u, f[1] - 5 * u], footW, footCol);
    }
  } else if (mode === "fall") {
    const legs: [P2, P2, P2][] = [
      [[300 - 15 * u, hipY], [300 - 46 * u, hipY + 0.5 * HH], [300 - 70 * u, hipY + 0.72 * HH]],
      [[300 + 15 * u, hipY], [300 + 50 * u, hipY + 0.45 * HH], [300 + 76 * u, hipY + 0.22 * HH]],
    ];
    legs.forEach(([h, k, f], i) => {
      legS(curve(h, k, f));
      footStroke(p, f, [f[0] + (i ? 14 : -14) * u, f[1] + (i ? -6 : 4) * u], footW, footCol);
    });
  } else if (o.dress) {
    for (const side of [-1, 1]) {
      const stepUp = o.roman && (mode === "march" || mode === "stroll") ? Math.max(0, Math.sin(two * (phase + (side > 0 ? 0.5 : 0)))) * lift * (mode === "march" ? 0.9 : 0.4) : 0;
      const fx = 300 + side * 12 * u, fy = sole - 4 * u - stepUp;
      if (!GT) p.stroke([[fx, sole - 0.4 * HH], [fx + side * u, fy]], legW, legCol);
      footStroke(p, [fx - side * 3 * u, fy], [fx + side * 12 * u, fy + u], footW, footCol);
      if (o.roman) sandalStraps(p, fx, fy, side, u, footCol);
    }
  } else {
    const L = mode === "march" ? lift * 1.25 : mode === "stroll" ? lift * 0.55 : 0;
    // turned: the far leg is drawn first and stands a little higher, the feet close up and both point where he faces; a step also
    // carries the foot forward and back along that direction
    for (const [side, ph] of (sg > 0 ? [[1, 0.5], [-1, 0]] : [[-1, 0], [1, 0.5]]) as [number, number][]) {
      const up = Math.max(0, Math.sin(two * (phase + ph))) * L, far = aq > 0 && side === sg;
      const stepX = aq && L ? sg * Math.cos(two * (phase + ph)) * 13 * u * aq : 0;
      const hx = 300 + side * (NEW ? 13 : 15) * u * (1 - 0.2 * aq), fx = 300 + side * ((NEW ? 17 : 22) * (1 - 0.3 * aq) + 9 * cr) * u + 3 * u * tq + stepX, fy = sole - 4 * u - up - (far ? 2.5 * u * aq : 0);
      const k: P2 = [(hx + fx) / 2 + side * (1.5 * u + up * 0.16 + cr * 0.34 * HH), (hipY + fy) / 2 - up * 0.08];
      legS(curve([hx, hipY], k, [fx, fy]));
      const d = side * (1 - aq) + sg * aq;
      footStroke(p, [fx - d * 3 * u, fy], [fx + d * 13 * u, fy + 0.5 * u], footW, footCol);
      if (o.roman) sandalStraps(p, fx, fy, side, u, footCol);
    }
  }
  // ---- upper body: rotates about the hips (tilt + a small weight-shift sway on every step) ----
  const sway = mode === "march" ? 1.6 * Math.sin(two * phase) : mode === "stroll" ? 1.0 * Math.sin(two * phase) : 0;
  const A = tilt + sway;
  p.rot = A ? [rad(A), 300, hipY] : null;
  const dress = !!o.dress && (mode !== "sit" || GT) && mode !== "fall";
  const T: Blob = { a: ((Bd.tw / 2) * W) / 1.06, b: 0.5 * (torsoBot - (chin - 0.25 * HH)), nTop: 2.2, nBot: 2.6, egg: o.build === "stout" ? 0.17 : 0.12,
    asym: 0.04 * facing + 0.07 * tq, rot: 0, noise: 0.006, seed: seed + 7 };
  const tcx = 300 + (3 * facing + 6 * tq) * u, tcy = torsoBot - T.b, tp = blobPts(tcx, tcy, T);
  // the centre line of the clothes (shirt, buttons, tie) on a turned chest, at the collar and at the belly
  const ccx = tcx + CHEST_TURN * T.a * tq, ccxL = ccx + 4 * u * tq;
  const sh = (side: number): P2 => [tcx + side * 0.85 * T.a, chin + 0.12 * HH];
  const hang = (side: number, fwd: number): [P2, P2, P2] => {
    const S = sh(side), ex = tcx + side * (1.12 * T.a + 4 * u);
    const hx = ex + side * 3 * u - side * 6 * u * Math.max(0, fwd) + side * 4 * u * Math.max(0, -fwd);
    return [S, [ex, S[1] + 0.48 * HH], [hx, chin + 1.04 * HH - Math.abs(fwd) * 9 * u]];
  };
  const sw = mode === "march" || mode === "stroll" ? Math.sin(two * phase) : 0;
  // rifle at the order: butt by the right hip, held by the hanging right hand, muzzle past the crown
  const R0: P2 = [300 + 47 * u, torsoBot + 0.12 * HH], R1: P2 = [300 + 64 * u, crown - 0.32 * HH];
  const rifle = !!o.rifle && (mode === "march" || mode === "stand" || mode === "stroll");
  type Arm = { pts: [P2, P2, P2]; front: boolean; late?: boolean; near?: boolean };
  const arms: Arm[] = [];
  if (mode === "sit") for (const side of [-1, 1]) arms.push({ pts: [sh(side), [tcx + side * (1.1 * T.a + 6 * u), sh(side)[1] + 0.4 * HH], [tcx + side * (1.2 * T.a + 10 * u), torsoBot + 0.04 * HH]], front: false });
  else if (mode === "fall") for (const side of [-1, 1]) arms.push({ pts: [sh(side), [tcx + side * (1.15 * T.a + 12 * u), sh(side)[1] - 0.25 * HH], [tcx + side * (1.3 * T.a + 24 * u), sh(side)[1] - 0.68 * HH]], front: false });
  else if (opts.hands && NEW) {
    const Lh = sh(-1), Rh = sh(1);
    if (opts.hands === "loaf") { arms.push({ pts: hang(-1, 0), front: false }); arms.push({ pts: [Rh, [tcx + 1.12 * T.a + 16 * u, Rh[1] - 0.05 * HH], [tcx + 1.2 * T.a + 26 * u, Rh[1] - 0.55 * HH]], front: true }); }
    else if (opts.hands === "purseR") { arms.push({ pts: hang(-1, 0), front: false }); arms.push({ pts: [Rh, [tcx + 1.15 * T.a + 12 * u, Rh[1] + 0.3 * HH], [tcx + 1.3 * T.a + 20 * u, Rh[1] + 0.44 * HH]], front: true }); }
    else if (opts.hands === "purse") { arms.push({ pts: [Lh, [tcx - 1.12 * T.a - 4 * u, Lh[1] + 0.36 * HH], [tcx - 0.3 * T.a, Lh[1] + 0.58 * HH]], front: true }); arms.push({ pts: [Rh, [tcx + 1.12 * T.a + 4 * u, Rh[1] + 0.36 * HH], [tcx + 0.3 * T.a, Rh[1] + 0.58 * HH]], front: true }); }
    else { arms.push({ pts: [Lh, [tcx - 1.22 * T.a - 6 * u, Lh[1] - 0.1 * HH], [300 - 1.02 * H.a, hc - 0.55 * H.b]], front: true, late: true }); arms.push({ pts: [Rh, [tcx + 1.22 * T.a + 6 * u, Rh[1] - 0.1 * HH], [300 + 1.02 * H.a, hc - 0.55 * H.b]], front: true, late: true }); }
  } else if (opts.run && NEW) {
    for (const side of [-1, 1]) { const S = sh(side), sw2 = Math.sin(two * (phase + (side > 0 ? 0.5 : 0))); arms.push({ pts: [S, [tcx + side * (1.12 * T.a + 12 * u), S[1] + 0.3 * HH], [tcx + side * 0.8 * T.a, S[1] + (0.4 - 0.26 * sw2) * HH]], front: false }); }
  } else {
    if (cheer) { const S = sh(-1); arms.push({ pts: [S, [tcx - 1.1 * T.a - 10 * u, S[1] - 0.2 * HH * cheer], [tcx - 1.18 * T.a - 18 * u, S[1] - 0.62 * HH * cheer]], front: false }); }
    else if (shrug) { const S = sh(-1); arms.push({ pts: [S, [tcx - 1.15 * T.a - 8 * u, S[1] + 0.34 * HH], [tcx - 1.35 * T.a - 20 * u, S[1] + 0.12 * HH]], front: false }); }
    else arms.push({ pts: prop === "shako" ? hang(-1, 0) : hang(-1, -sw), front: false });
    if (cheer) { const S = sh(1); arms.push({ pts: [S, [tcx + 1.1 * T.a + 10 * u, S[1] - 0.2 * HH * cheer], [tcx + 1.18 * T.a + 18 * u, S[1] - 0.62 * HH * cheer]], front: false }); }
    else if (shrug) { const S = sh(1); arms.push({ pts: [S, [tcx + 1.15 * T.a + 8 * u, S[1] + 0.34 * HH], [tcx + 1.35 * T.a + 20 * u, S[1] + 0.12 * HH]], front: false }); }
    else if (point) { const S = sh(1); arms.push({ pts: [S, [tcx + 1.1 * T.a + 14 * u, S[1] + 0.1 * HH], [tcx + 1.2 * T.a + 40 * u * point, S[1] - 0.04 * HH]], front: false }); }
    else if (rifle) {
      const G = lerp2(R0, R1, 0.1);
      arms.push({ pts: [sh(1), [tcx + 1.12 * T.a + 5 * u, sh(1)[1] + 0.45 * HH], G], front: false });
    } else if (wave !== undefined) {
      const S = sh(1);
      arms.push({ pts: [S, [tcx + 1.1 * T.a + 10 * u + 3 * u * wave, S[1] - 0.22 * HH], [tcx + 1.18 * T.a + 16 * u + 12 * u * wave, S[1] - 0.6 * HH]], front: false });
    } else if (prop === "icecream") {
      const S = sh(1);
      arms.push({ pts: [S, [tcx + 1.05 * T.a + 4 * u, S[1] + 0.45 * HH], [tcx + 0.5 * T.a, S[1] + 0.4 * HH]], front: true });
    } else if (Array.isArray(prop)) {
      const S = sh(1), k = clamp(prop[1], 0, 1);
      const E = lerp2([tcx + 1.1 * T.a + 10 * u, S[1] - 0.15 * HH], [tcx + 1.2 * T.a + 10 * u, S[1] + 0.3 * HH], k);
      const Hd = lerp2([tcx + 1.15 * T.a + 14 * u, S[1] - 0.55 * HH], [tcx + 1.45 * T.a + 22 * u, S[1] + 0.35 * HH], k);
      arms.push({ pts: [S, E, Hd], front: true });
    } else arms.push({ pts: hang(1, sw), front: false });
  }
  // turned: the arm nearer the lens hangs in front of the coat, the other one is half hidden behind it
  if (aq) arms.forEach((a, i) => {
    const near = (i ? 1 : -1) === -sg, dx = near ? sg * 0.2 * T.a * aq : -sg * 0.12 * T.a * aq;
    a.pts = a.pts.map(([x, y], j) => (a.late && j === 2 ? [x, y] : [x + dx, y])) as [P2, P2, P2];
    if (near && !a.front) a.near = true;
  });
  // arms carry their own ink rim, so they read against any wall and against the coat
  const drawArm = (a: Arm) => {
    const c = curve(a.pts[0], a.pts[1], a.pts[2]); p.stroke(c, 8.4 * u, INK); p.stroke(c, o.roman ? 6.6 * u : 5 * u, armCol);
    if (o.roman === "baker") { p.g.save(); p.g.globalAlpha = 0.9; p.stroke(c.slice(Math.floor(c.length * 0.35), Math.floor(c.length * 0.75)), 5.2 * u, "#ffffff"); p.stroke(c.slice(Math.floor(c.length * 0.85)), 4.6 * u, "#ffffff"); p.g.restore(); }
    p.dot(a.pts[2][0], a.pts[2][1], 5.8 * u);
  };
  // behind the body: rifle, sword, arms
  if (rifle) {
    p.band([R0, R1], "#7a4b2a", 5 * u, 1.5 * u, "round");
    p.band([lerp2(R0, R1, 0.6), R1], "#8d949c", 2.4 * u, 1.2 * u, "round");
  }
  if (o.sword && mode !== "sit") {
    const s0: P2 = [tcx - 0.75 * T.a, torsoBot - 0.2 * HH];
    p.band([s0, [s0[0] - Math.sin(rad(25)) * 0.8 * HH, s0[1] + Math.cos(rad(25)) * 0.8 * HH]], "#c9ccd2", 3 * u, 1.2 * u, "round");
  }
  if (o.sir && mode !== "sit" && mode !== "fall" && !cheer && !shrug && !opts.hands) { // walking cane in HIS right hand: screen-left from the front, screen-right from behind
    const cs = BACK ? -1 : 1, [hx, hy] = arms[BACK ? 1 : 0].pts[2];
    p.band([[hx + cs * 1 * u, hy - 5 * u], [hx - cs * 5 * u, sole - 3 * u]], "#5a3a22", 3.4 * u, 1.5 * u, "round");
    p.ell(hx + cs * 1 * u, hy - 7 * u, 4.6 * u, 4.6 * u, GOLD, 2 * u);
  }
  if (o.cloak && !BACK) { const cl = [[tcx - 1.0 * T.a, chin + 0.08 * HH], [tcx + 1.0 * T.a, chin + 0.08 * HH], [tcx + 1.5 * T.a, sole - 0.05 * HH], [tcx - 1.5 * T.a, sole - 0.05 * HH]] as P2[]; p.gradFill(cl, o.cloak, mul(o.cloak, SH_CLOTH), light); p.inkRing(cl, ow * 0.9, thick); }
  for (const a of arms) if (!a.front && !a.near) drawArm(a);
  if (o.roman && o.hem !== undefined && !dress) tunicSkirt(p, o, tcx, torsoBot, sole, HH, T.a, u, light, thick);
  // torso / dress: shaded fill -> clothing clipped to it -> thick-thin ink ring
  if (dress) {
    const hem = sole - (GT ? 0.09 : 0.35) * HH; // the long skirt of the new look hangs to the ankles: only the shoes show
    const D: Blob = { a: (GT ? 0.42 : 0.5 * 0.98) * W, b: 0.5 * (hem - (chin - 0.2 * HH)), nTop: 2.0, nBot: 3.0, egg: GT ? 0.3 : 0.35, asym: 0.03 * facing + 0.05 * tq, rot: 0, noise: 0.006, seed: seed + 9 };
    const dp = blobPts(300, hem - D.b, D);
    p.gradFill(dp, o.dress!, mul(o.dress!, SH_CLOTH), light);
    p.inkRing(dp, ow, thick);
    const Sw: Blob = { a: 0.37 * W, b: 0.3 * HH, nTop: 2.2, nBot: 2.4, egg: 0.1, asym: 0, rot: 0, noise: 0.006, seed: seed + 8 };
    const sp = blobPts(300, chin + 0.12 * HH, Sw);
    p.gradFill(sp, o.jacket, mul(o.jacket, SH_CLOTH), light);
    p.inkRing(sp, ow * 0.9, thick);
    if (o.roman) { p.clip(dp, () => romanDress(p, o, tcx, chin, hem, HH, T.a, u)); }
  } else {
    p.gradFill(tp, o.jacket, mul(o.jacket, SH_CLOTH), light);
    p.clip(tp, () => {
      if (o.sir) { // tweed check, white shirt, mustard waistcoat, lapels
        const g = p.g; g.save(); g.globalAlpha = 0.22;
        for (let k = -8; k <= 8; k++) { p.stroke([[tcx + k * 9 * u, chin - 0.3 * HH], [tcx + k * 9 * u, torsoBot + 0.1 * HH]], 1.3 * u, "#3b2a1a"); p.stroke([[tcx - 1.4 * T.a, chin + k * 9 * u + 0.5 * HH], [tcx + 1.4 * T.a, chin + k * 9 * u + 0.5 * HH]], 1.3 * u, "#3b2a1a"); }
        g.restore();
        const top = chin - 0.02 * HH, vy = chin + 0.62 * HH;
        if (BACK) {
          // from behind: the white shirt collar over a darker coat collar, the centre seam, a half belt with two buttons, a vent
          const col: P2[] = [[tcx - 25 * u, top - 3 * u], [tcx + 25 * u, top - 3 * u]], wh: P2[] = [[tcx - 15 * u, top - 3 * u], [tcx + 15 * u, top - 3 * u]];
          for (let i = 0; i <= 12; i++) { const t = 1 - i / 6; col.push([tcx + 25 * u * t, chin + 0.03 * HH + 0.075 * HH * Math.sqrt(Math.max(0, 1 - t * t))]); wh.push([tcx + 15 * u * t, chin + 0.01 * HH + 0.03 * HH * Math.sqrt(Math.max(0, 1 - t * t))]); }
          p.poly(col, TWEED_DARK, 2.2 * u); p.poly(wh, "#ffffff", 1.8 * u);
          p.stroke([[tcx, chin + 0.11 * HH], [tcx, torsoBot + 0.1 * HH]], 2 * u);
          p.band([[tcx - 0.52 * T.a, vy + 0.04 * HH], [tcx + 0.52 * T.a, vy + 0.04 * HH]], TWEED_DARK, 0.085 * HH, 1.8 * u);
          for (const sd of [-1, 1]) { p.dot(tcx + sd * 0.4 * T.a, vy + 0.04 * HH, 3 * u, INK); p.dot(tcx + sd * 0.4 * T.a, vy + 0.04 * HH, 2.1 * u, GOLD); }
        } else {
          p.poly([[ccx - 15 * u * kf(-1), top], [ccx + 15 * u * kf(1), top], [ccxL, vy]], "#d6a53a", 2.2 * u);
          p.poly([[ccx - 11 * u * kf(-1), top], [ccx + 11 * u * kf(1), top], [(ccx + ccxL) / 2, chin + 0.3 * HH]], "#ffffff", 2 * u);
          for (const sd of [-1, 1]) p.poly([[ccx + sd * 15 * u * kf(sd), top], [ccx + sd * 27 * u * kf(sd), chin + 0.2 * HH], [ccxL + sd * 3 * u, vy + 2 * u], [ccxL, vy]], TWEED_DARK, 2.2 * u);
          p.stroke([[ccxL, vy], [ccxL + 3 * u * tq, torsoBot + 0.1 * HH]], 2.2 * u);
          for (const k of [0.65, 0.81]) { const x = ccx + (ccxL - ccx) * k, y = chin + (0.62 * k) * HH; p.dot(x, y, 2.6 * u, INK); p.dot(x, y, 1.8 * u, GOLD); }
          for (const y of [vy + 0.14 * HH, vy + 0.3 * HH]) { p.dot(ccxL + 4 * u + 2 * u * tq, y, 3 * u, INK); p.dot(ccxL + 4 * u + 2 * u * tq, y, 2.1 * u, "#3b2a1a"); }
          p.poly([[ccx + 17 * u * kf(1), chin + 0.36 * HH], [ccx + 26 * u * kf(1), chin + 0.36 * HH], [ccx + 25 * u * kf(1), chin + 0.43 * HH], [ccx + 18 * u * kf(1), chin + 0.43 * HH]], "#c62828", 1.4 * u);
        }
      }
      if (o.roman) romanTorso(p, o, tcx + 0.8 * (ccx - tcx), chin, torsoBot, HH, T.a, u);
      if (o.belt) {
        for (const s of [-1, 1]) p.band([[tcx - s * 0.75 * T.a, chin - 0.05 * HH], [tcx + s * 0.8 * T.a, torsoBot - 0.1 * HH]], o.belt!, 5.5 * u, 1.8 * u);
        const xc = tcx + 0.025 * T.a, yc = chin - 0.05 * HH + (torsoBot - 0.1 * HH - (chin - 0.05 * HH)) * (0.75 / 1.55);
        p.poly([[xc - 3.5 * u, yc - 3.5 * u], [xc + 3.5 * u, yc - 3.5 * u], [xc + 3.5 * u, yc + 3.5 * u], [xc - 3.5 * u, yc + 3.5 * u]], "#d9dde0", 1.5 * u);
      }
      if (o.sam) { // Sam Browne: waist belt + one shoulder strap + brass buckle
        p.band([[tcx + 0.85 * T.a, chin - 0.02 * HH], [tcx - 0.9 * T.a, torsoBot - 0.36 * HH]], o.sam, 4.6 * u, 1.6 * u);
        p.band([[tcx - 1.3 * T.a, torsoBot - 0.33 * HH], [tcx + 1.3 * T.a, torsoBot - 0.33 * HH]], o.sam, 0.1 * HH, 1.6 * u);
        if (!BACK) p.poly([[tcx - 5 * u, torsoBot - 0.385 * HH], [tcx + 5 * u, torsoBot - 0.385 * HH], [tcx + 5 * u, torsoBot - 0.275 * HH], [tcx - 5 * u, torsoBot - 0.275 * HH]], "#e2bb4c", 1.6 * u);
      }
      if (o.sash) p.band([[tcx - 1.3 * T.a, torsoBot - 0.32 * HH], [tcx + 1.3 * T.a, torsoBot - 0.32 * HH]], o.sash, 0.13 * HH, 1.8 * u);
      for (let i = 0; i < (o.sir || BACK ? 0 : 4); i++) {
        const y = chin + 0.12 * HH + i * 0.2 * HH;
        if (o.sash && Math.abs(y - (torsoBot - 0.32 * HH)) < 0.08 * HH) continue;
        const bx = ccx + (ccxL - ccx) * (i / 3) + 2 * u * facing; p.dot(bx, y, 2.2 * u + 0.8 * u, INK); p.dot(bx, y, 2.2 * u, o.buttons ?? shade(o.jacket, 0.7));
      }
    });
    p.inkRing(tp, ow, thick);
    if (o.roman === "soldier") for (const s of [-1, 1]) p.ell(tcx + s * 0.98 * T.a, chin + 0.18 * HH, 0.5 * T.a, 0.15 * HH, "#bcc4cd", 2.8 * u, 0, 360, s * 16);
    if (o.sir && !BACK) for (const s of [-1, 1]) // red bow tie over the collar
      p.poly([[ccx, chin + 0.035 * HH], [ccx + s * 13 * u * kf(s), chin - 0.03 * HH], [ccx + s * 13 * u * kf(s), chin + 0.1 * HH]], "#d12f2f", 2.2 * u);
  }
  const CH = o.sir && !BACK ? sirChain(opts, o) : null;
  if (CH) { const r0 = p.rot; p.rot = null; chainBody(p, CH); p.rot = r0; }
  if (o.shawl && !BACK) { // a blanket over the shoulders, open at the chest
    for (const sd of [-1, 1]) {
      const nk: P2 = [tcx + sd * 13 * u, chin + 0.02 * HH], s2: P2 = [tcx + sd * T.a * 1.16, chin + 0.14 * HH], ho: P2 = [tcx + sd * (T.a * 1.22 + 4 * u), chin + 0.62 * HH], hi: P2 = [tcx + sd * 8 * u, chin + 0.5 * HH], ni: P2 = [tcx + sd * 9 * u, chin + 0.2 * HH];
      p.poly([nk, s2, ho, hi, ni], o.shawl, 2.8 * u);
      p.stroke([[tcx + sd * T.a * 0.78, chin + 0.22 * HH], [tcx + sd * T.a * 0.86, chin + 0.55 * HH]], 1.8 * u, mix(o.shawl, INK, 0.4));
      p.stroke([[tcx + sd * T.a * 1.0, chin + 0.2 * HH], [tcx + sd * T.a * 1.08, chin + 0.58 * HH]], 1.6 * u, mix(o.shawl, INK, 0.3));
    }
  }
  for (const a of arms) if (a.near && !a.late) drawArm(a);
  // in front of the body: hands holding props
  for (const a of arms) if (a.front && !a.late) {
    drawArm(a);
    const [hx, hy] = a.pts[2];
    if (opts.hands === "purseR") { purse(p, hx + 2 * u, hy + 15 * u, u, 1.3); p.dot(hx, hy, 5.8 * u); }
    if (opts.hands === "loaf") { p.ell(hx, hy - 20 * u, 22 * u, 15 * u, "#c98c4a", 2.8 * u); p.ell(hx - 3 * u, hy - 24 * u, 13 * u, 6 * u, "#dba463", 0); for (const dx of [-12, -2, 8, 18]) p.stroke([[hx + (dx - 4) * u, hy - 30 * u], [hx + (dx + 3) * u, hy - 12 * u]], 2.2 * u, "#8a5424"); p.dot(hx, hy, 5.8 * u); }
    if (prop === "icecream") {
      p.poly([[hx - 8 * u, hy - 12 * u], [hx + 8 * u, hy - 12 * u], [hx, hy + 7 * u]], "#e0a35a", 1.8 * u);
      p.ell(hx, hy - 19 * u, 11 * u, 10 * u, "#f7c6d9", 2.2 * u);
      p.dot(hx, hy, 5.5 * u);
    } else if (Array.isArray(prop)) {
      const ang = rad(-70 + 105 * clamp(prop[1], 0, 1));
      const Rh = (pts: P2[]) => rotPts(pts, ang, hx, hy);
      p.band(Rh([[hx, hy + 12 * u], [hx, hy - 44 * u]]), "#8a5a34", 5 * u, 1.5 * u, "round");
      p.poly(Rh([[hx - 12 * u, hy - 58 * u], [hx + 20 * u, hy - 58 * u], [hx + 20 * u, hy - 42 * u], [hx - 12 * u, hy - 42 * u]]), "#7d848c", 2.2 * u);
      p.dot(hx, hy, 5.5 * u);
    }
  }
  if (opts.hands === "purse") {
    const y = chin + 0.98 * HH; purse(p, tcx, y, u, 1.25);
    for (const [dx, dy] of [[-22, 26], [6, 40], [26, 22], [-8, 56]] as const) { p.dot(tcx + dx * u, y + dy * u, 6.4 * u, INK); p.dot(tcx + dx * u, y + dy * u, 4.8 * u, "#e9b93a"); }
    for (const a of arms) p.dot(a.pts[2][0], a.pts[2][1], 5.8 * u);
  }
  if (prop === "shako") { // carried by the left hand
    const [hx, hy] = arms[0].pts[2];
    p.poly([[hx - 14 * u, hy + 3 * u], [hx + 14 * u, hy + 3 * u], [hx + 16 * u, hy + 30 * u], [hx - 16 * u, hy + 30 * u]], "#3a3d47", 2.2 * u);
    p.ell(hx, hy + 31 * u, 3.5 * u, 3.5 * u, "#2b7a4b", 1.5 * u);
    p.dot(hx, hy, 5.5 * u);
  }
  // ---- head: rotates with the body, plus its own tilt about the chin ----
  const Ah = A + headTilt + LOOKUP_TILT * LOOKUP * Math.sign(look), [cpx, cpy] = rotAbout([300, chin], rad(A), [300, hipY]);
  p.rot = Ah ? [rad(Ah), 300, chin, cpx - 300, cpy - chin] : null;
  hatBehind(p, o, H, 300, hc, light, thick, ow, false);
  const hp = blobPts(300, hc, H);
  p.shadedFill(hp, skin, mul(skin, SH_SKIN), light, H.a);
  p.inkRing(hp, ow, thick);
  if (NEW && aq > 0.5 && !BACK) napeHair(p, o, hp, hc, H, seed, light, ow, 300 - sg * 0.72 * H.a, -sg);
  tieOn(p, o, 300 + 0.8 * (ccx - 300), chin + 0.07 * HH, u);
  beardOn(p, o, hp, 300, hc, H, light, ow, 300 + (8 * facing + MOUTH_TURN * tq) * u);
  hatOn(p, o, hp, H, 300, hc, light, seed, facing, false);
  const brim = !!o.hat && o.hat !== "hair" && o.hat !== "bonnet" && o.hat !== "scarf";
  if (!BACK) faceFront(p, 300, hc, W, expr, facing, look, lid, brim, skin, o.moustache, o.build === "stout");
  { const gx = 300 + (7 * facing + FACE_TURN * tq) * u; glassesOn(p, o, [gx - 13 * u * turnK(-1, tq), gx + 13 * u * turnK(1, tq)], hc, u); }
  if (CH) { p.rot = null; chainLine(p, CH.headPts, CH.u); }
  p.rot = A ? [rad(A), 300, hipY] : null;
  for (const a of arms) if (a.late) drawArm(a);
  p.rot = null;
  BACK = false; LOOKUP = 0; TURN = 0;
  p.rot = null;
};

// ---------------- Sir Digsworth's monocle chain (Jesper 2026-11-16: fixed once and for all) ----------------
// A fine gold chain, a third as thick as the monocle's frame, with a thin dark outline. It is fixed to the lower OUTER edge of the frame
// (toward the edge of the face, never toward the nose), hangs in one soft arc outside the cheek (never over the mouth, the moustache or
// the pipe) and ends in a small loop through the buttonhole of the lapel: no loose ball. It swings a little, and late, when the head
// moves (FrontOpts.chain, from hangSway). Water, a blanket and hands held in front of the chest hide the part on the body: bodyFront
// draws that part right after the coat, before all of those.
/** width of the monocle's frame (ink ring) in u; the chain is a third of it */
const MONO_FRAME = 5.6;
const CHAIN_W = MONO_FRAME / 3, CHAIN_GOLD = CHAIN_W * 0.56;
const bez = (a: P2, c1: P2, c2: P2, b: P2, n = 14): P2[] => {
  const out: P2[] = [];
  for (let i = 0; i <= n; i++) { const t = i / n, q = 1 - t, k0 = q * q * q, k1 = 3 * q * q * t, k2 = 3 * q * t * t, k3 = t * t * t; out.push([k0 * a[0] + k1 * c1[0] + k2 * c2[0] + k3 * b[0], k0 * a[1] + k1 * c1[1] + k2 * c2[1] + k3 * b[1]]); }
  return out;
};
const chainLine = (p: Pen, pts: P2[], u: number) => { if (pts.length < 2) return; p.stroke(pts, CHAIN_W * u, INK); p.stroke(pts, CHAIN_GOLD * u, GOLD); };
/** the part on the body: the buttonhole (a short stitched slit in the lapel), the chain down to it and the little loop through it */
const chainBody = (p: Pen, ch: ChainInfo) => {
  const u = ch.u;
  p.stroke(ch.hole, 2.2 * u, INK); p.stroke(ch.hole, 0.8 * u, "#3b2a1a");
  chainLine(p, ch.bodyPts, u);
  const ring: P2[] = []; for (let i = 0; i <= 20; i++) { const a = (i / 20) * Math.PI * 2; ring.push([ch.ring[0] + 2.1 * u * Math.cos(a), ch.ring[1] + 2.1 * u * Math.sin(a)]); }
  chainLine(p, ring, u);
};
/** Sir Digsworth's monocle chain in canvas design units for given FrontOpts (the same numbers bodyFront draws with).
 *  upper = on the monocle's lower outer rim (moves with the head), lower = the buttonhole on the lapel (moves with the body),
 *  low = the point of the curve farthest below the straight line between them, clear = the smallest gap (in u) between the
 *  chain and the moustache, the mouth and the pipe. The layout check tests these. */
export type ChainInfo = { upper: P2; lower: P2; lowerBody: P2; low: P2; sag: number; below: boolean; mono: P2; monoR: number; torso: { x0: number; x1: number; y0: number; y1: number }; u: number; pts: P2[];
  headPts: P2[]; bodyPts: P2[]; hole: P2[]; ring: P2; clear: number; width: number };
export const sirChain = (opts: FrontOpts, o: Outfit = SIR_DIGSWORTH): ChainInfo => {
  const { expr = "neutral", mode = "march", tilt = 0, headTilt = 0, facing = 0, seed = 1, phase = 0 } = opts, lookUp = clamp(opts.lookUp ?? 0, 0, 1), two = Math.PI * 2;
  const Bd = newBuild(o), H = headBlob(seed, Bd.a, facing); H.b *= 1.07;
  const W = 2 * H.a, HH = 2 * H.b, u = W / 100, tall = (1 + Bd.torso + Bd.legs) * HH, sole = 975;
  const bob = mode === "march" ? 0.025 * tall * Math.cos(2 * two * phase) : mode === "stroll" ? 0.015 * tall * Math.cos(2 * two * phase) : 0;
  const torsoBot = mode === "sit" ? sole - 0.2 * HH : sole - Bd.legs * HH * (1 - 0.42 * clamp(opts.crouch ?? 0, 0, 1)) + bob, chin = torsoBot - Bd.torso * HH, hc = chin - H.b, hipY = torsoBot - 0.12 * HH;
  const A = tilt + (mode === "march" ? 1.6 * Math.sin(two * phase) : mode === "stroll" ? 1.0 * Math.sin(two * phase) : 0);
  const Ah = A + headTilt + LOOKUP_TILT * lookUp * Math.sign(opts.look ?? 0), [cpx, cpy] = rotAbout([300, chin], rad(A), [300, hipY]);
  const head = (q: P2): P2 => { const r = rotAbout(q, rad(Ah), [300, chin]); return [r[0] + cpx - 300, r[1] + cpy - chin]; };
  const body = (q: P2): P2 => rotAbout(q, rad(A), [300, hipY]);
  const shock = expr !== "neutral" && FACE[expr].eye[0] === "shock";
  // the same turn as bodyFront: the monocle follows HIS right eye, the buttonhole the lapel of that side
  const tq = opts.back ? 0 : clamp(opts.turn ?? 0, -1, 1), sg = Math.sign(tq), aq = Math.abs(tq);
  const fx = 300 + (7 * facing + FACE_TURN * tq) * u, ex = (shock ? 17 : 19) * u, ox = fx - ex * turnK(-1, tq), oy = hc + 3 * u - u, R = 9.5 * u, Rx = R * (sg < 0 ? 1 - 0.26 * aq : 1);
  const upper = head([ox - Rx * 0.7071, oy + R * 0.7071]), mono = head([ox, oy]);
  const tcx = 300 + (3 * facing + 6 * tq) * u, Ta = ((Bd.tw / 2) * W) / 1.06, ccx = tcx + CHEST_TURN * Ta * tq;
  // the buttonhole on the lapel at the viewer's left, the loop hanging in it
  const lowerBody: P2 = [ccx - 17 * u * (sg < 0 ? 1 - 0.42 * aq : 1 + 0.12 * aq), chin + 0.24 * HH], lower = body(lowerBody);
  const hole = [body([lowerBody[0] - 3.4 * u, lowerBody[1] - 1.9 * u]), body([lowerBody[0] + 3.2 * u, lowerBody[1] + 0.9 * u])];
  const ring = body([lowerBody[0] - 0.4 * u, lowerBody[1] + 1.7 * u]), end = body([lowerBody[0] - 2.0 * u, lowerBody[1] + 3.1 * u]);
  // swing: what the film gives (the head's movement, a beat late) plus the walk's own, 0.2 of a step behind the body
  const walk = mode === "march" ? 0.55 : mode === "stroll" ? 0.35 : 0;
  const sw = clamp((opts.chain ?? 0) + walk * Math.sin(two * (phase - 0.2)), -1, 1) * 7 * u;
  // outside the cheek (it may swing out freely, but only a little way in toward the moustache), then the lowest point of the arc on the chest
  // (turned to screen-right the monocle's cheek faces the lens: the arc hangs down that cheek, well left of the moustache;
  // turned to screen-left it hangs clear of the face outline)
  const q1x = tq > 0 ? 300 - (43 - 21 * tq) * u : tq < 0 ? 300 - (43 + 7 * aq) * u : Math.min(fx - 44 * u, 300 - 43 * u);
  const q1h = head([q1x, hc + 33 * u]), q1: P2 = [q1h[0] + Math.min(0.5 * sw, 2.5 * u), q1h[1]];
  const q2b = body([lowerBody[0] - 9 * u, lowerBody[1] + 12 * u]), q2: P2 = [q2b[0] + Math.min(0.9 * sw, 5 * u), q2b[1] - 0.12 * Math.abs(sw)];
  const pts = [
    ...bez(upper, [upper[0] - 5 * u, upper[1] + 7 * u], [q1[0] + 1 * u, q1[1] - 11 * u], q1, 12),
    ...bez(q1, [q1[0] - 1 * u, q1[1] + 11 * u], [q2[0] - 7 * u, q2[1] - 1 * u], q2, 18).slice(1),
    ...bez(q2, [q2[0] + 5 * u, q2[1] + 0.7 * u], [end[0] - 1.5 * u, end[1] + 4.5 * u], end, 8).slice(1),
  ];
  let i0 = pts.findIndex((q) => q[1] > cpy); if (i0 < 1) i0 = pts.length - 1;
  const headPts = pts.slice(0, i0 + 1), bodyPts = pts.slice(i0);
  // how far it stays from the moustache (stroke 8u), the mouth and the pipe
  const mx = 300 + (8 * facing + MOUTH_TURN * tq) * u, keep: [P2, number][] = [], km = (sd: number) => (aq && sd === sg ? 1 - 0.3 * aq : 1 + 0.05 * aq);
  for (const sd of [-1, 1]) for (const q of curve([mx + sd * 1 * u, hc + 23 * u], [mx + sd * 10.5 * u * km(sd), hc + 30 * u], [mx + sd * 20 * u * km(sd), hc + 22 * u], 12)) keep.push([head(q), 4 * u]);
  keep.push([head([mx, hc + 40 * u]), 9 * u], [head([mx + 22 * u, hc + 44 * u]), 10 * u]);
  let clear = Infinity; for (const q of pts) for (const [k, r] of keep) clear = Math.min(clear, Math.hypot(q[0] - k[0], q[1] - k[1]) - r - 0.5 * CHAIN_W * u);
  const dx = lower[0] - upper[0], dy = lower[1] - upper[1], len = Math.hypot(dx, dy) || 1;
  let n: P2 = [-dy / len, dx / len]; if (n[1] < 0) n = [-n[0], -n[1]]; if (Math.abs(n[1]) < 1e-6 && n[0] > 0) n = [-n[0], -n[1]];
  let low = pts[0], sag = -1;
  for (const q of pts) { const s = Math.abs((q[0] - upper[0]) * n[0] + (q[1] - upper[1]) * n[1]); if (s > sag) { sag = s; low = q; } }
  // it hangs: the lowest point of the arc is below the buttonhole it ends in
  const below = Math.max(...pts.map((q) => q[1])) > lower[1] + 4 * u;
  return { upper, lower, lowerBody, low, sag, below, mono, monoR: R, torso: { x0: tcx - Ta, x1: tcx + Ta, y0: chin - 0.25 * HH, y1: torsoBot }, u, pts, headPts, bodyPts, hole, ring, clear: clear / u, width: CHAIN_W };
};
/** how far something hanging from the head has swung at frame f, -1..1: a damped pendulum (about one swing a second) pushed by the
 *  head's sideways acceleration. `drive(f)` = where the head is at frame f, in head widths (any smooth measure of its sideways movement). */
export const hangSway = (f: number, drive: (f: number) => number, gain = 9): number => {
  let x = 0, v = 0;
  for (let i = f - 80; i <= f; i++) { const acc = drive(i + 1) - 2 * drive(i) + drive(i - 1); v += -0.045 * x - 0.16 * v - gain * acc; x += v; }
  return clamp(x, -1, 1);
};

/** design units the body travels in half a run cycle at stride 1, and the metres one whole cycle covers at scale 1 */
export const RUN_S = 225, RUN_M = (2 * 1.15 * RUN_S / 0.68) * 0.00216;
/** a thing carried in both hands in the side view, drawn at the hands */
const heldThing = (p: Pen, kind: NonNullable<SideOpts["hold"]>, x: number, y: number, u: number) => {
  if (kind === "basket" || kind === "tray") {
    for (const [dx, dy] of [[-14, -14], [6, -17], [22, -12], [-2, -27], [14, -26]] as const) { p.ell(x + dx * u, y + dy * u, 13 * u, 9 * u, "#c98c4a", 2.6 * u); p.stroke([[x + (dx - 5) * u, y + (dy - 3) * u], [x + (dx + 5) * u, y + (dy - 3) * u]], 1.8 * u, "#8a5424"); }
    if (kind === "basket") { const b: P2[] = [[x - 27 * u, y - 10 * u], [x + 33 * u, y - 10 * u], [x + 25 * u, y + 20 * u], [x - 19 * u, y + 20 * u]]; p.poly(b, "#b98a4e", 3 * u); p.clip(b, () => { for (let i = -3; i <= 4; i++) p.stroke([[x + i * 9 * u, y - 10 * u], [x + (i * 9 - 4) * u, y + 20 * u]], 1.6 * u, "#8a6234"); p.stroke([[x - 30 * u, y + 2 * u], [x + 34 * u, y + 2 * u]], 1.6 * u, "#8a6234"); }); }
    else p.band([[x - 30 * u, y - 5 * u], [x + 38 * u, y - 5 * u]], "#8a6240", 7 * u, 1.6 * u);
  } else if (kind === "purse") purse(p, x + 6 * u, y + 4 * u, u, 1.5);
  else if (kind === "bundle") { const b = ellPts(x + 8 * u, y - 4 * u, 30 * u, 24 * u, 0, 360, 0.2); p.poly(b, "#e3d3aa", 3 * u); p.stroke([[x - 8 * u, y - 16 * u], [x + 4 * u, y + 2 * u], [x + 26 * u, y - 12 * u]], 2 * u, "#b9a67a"); p.poly([[x + 2 * u, y - 30 * u], [x + 16 * u, y - 44 * u], [x + 20 * u, y - 28 * u]], "#e3d3aa", 2.6 * u); }
  else { // an amphora hugged to the chest
    const c = "#c47a4a", pr: [number, number][] = [[4, 26], [13, 12], [17, -8], [13, -26], [6, -36], [8, -44]];
    const pts: P2[] = [...pr.map(([r, h]) => [x + 8 * u + r * u, y + h * u] as P2), ...pr.slice().reverse().map(([r, h]) => [x + 8 * u - r * u, y + h * u] as P2)];
    p.poly(pts, c, 3 * u); for (const sd of [-1, 1]) p.stroke([[x + 8 * u + sd * 7 * u, y - 38 * u], [x + 8 * u + sd * 17 * u, y - 30 * u], [x + 8 * u + sd * 14 * u, y - 20 * u]], 2.6 * u, INK);
  }
};
export type SideOpts = {
  phase?: number; expr?: Expr; mode?: "march" | "stand" | "swing" | "push" | "run"; blink?: boolean | number; stomp?: number; pose?: number;
  /** something carried in front of the body with both hands (the arms hold it and do not swing) */
  hold?: "basket" | "purse" | "bundle" | "amphora" | "tray";
  /** extra forward lean in degrees (a stumble, a dive) */
  lean?: number;
  /** step length as a multiple of 0.8 m (370 units): matches 1.6 m/s at 2 steps/s; scale by the view's foreshortening */
  stride?: number; light?: number; seed?: number;
  /** push mode: where the hands land at pose 1, in final canvas units (e.g. the swing kid's back) */
  hand?: [number, number];
  /** Sir Digsworth's monocle chain: swing -1..1 (as in FrontOpts) */
  chain?: number;
};

/** two-bone leg, knee bending forward (+x) */
const ik = (hip: P2, ank: P2, l1: number, l2: number): P2 => {
  const dx = ank[0] - hip[0], dy = ank[1] - hip[1], d = clamp(Math.hypot(dx, dy), 1, l1 + l2 - 0.01);
  const A = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1)), k = Math.atan2(dy, dx) - A;
  return [hip[0] + l1 * Math.cos(k), hip[1] + l1 * Math.sin(k)];
};

/** hip height of the seated kid in `swing` mode (design units); swingKid seats the torso bottom on the plank */
const SWING_HIP = 733;

/** side view facing screen-right; march footfalls land at phase 0 (near foot) and 0.5 (far foot), like the front view.
 *  The stance foot is planted: it slides back at exactly the walking speed while the hip rises and falls over it. */
export const bodySide = (p: Pen, o: Outfit, opts: SideOpts) => {
  const { phase = 0, expr = "neutral", mode = "march", blink = false, stomp = 1, pose = 0, stride = 1, light = DEF_LIGHT, seed = 1 } = opts;
  SIR = !!o.sir; GT = !!o.gent; NEW = SIR || GT;
  const Bd = NEW ? newBuild(o) : BUILD[o.build ?? "adult"], skin = o.skin ?? SKIN, two = Math.PI * 2, lid = lidOf(blink);
  const H: Blob = { ...headBlob(seed, Bd.a, 1), asym: 0.12, rot: rad((mode === "stand" ? 0 : 3) + 3 * (rnd(seed, 7) - 0.5)) };
  if (NEW) H.b *= 1.07;
  const W = 2 * H.a, HH = 2 * H.b, u = W / 100, sole = 975, ankY = sole - 4 * u;
  const thick = thickAngle(light), ow = 5 * u;
  const legLen = (Bd.legs + 0.12) * HH - 4 * u, l1 = legLen / 2, l2 = legLen / 2;
  const nearCol = NEW ? o.pants : mix(o.pants, INK, 0.55), farCol = NEW ? shade(o.pants, 0.8) : mix(o.pants, INK, 0.75), footCol = o.boots;
  type LegS = { ank: P2; pitch: number; near: boolean };
  const legs: LegS[] = [];
  let hipY = ankY - legLen * 0.995, lean = 0, nearFwd = 0;
  if (mode === "march") {
    const S = 370 * stride, liftH = Math.max(22, 40 + 70 * (stomp - 1));
    const st = (ph: number) => {
      const c = (((phase + ph) % 1) + 1) % 1;
      if (c < 0.5) { const s = c / 0.5; return { x: S / 2 - S * s, h: 0, stance: true, s }; }
      const s = (c - 0.5) / 0.5; // swing: cycloid in world space, so the foot leaves and lands at zero ground speed
      return { x: -S / 2 + S * s - (S / Math.PI) * Math.sin(2 * Math.PI * s), h: liftH * Math.sin(Math.PI * s), stance: false, s };
    };
    const nL = st(0), fL = st(0.5), stance = nL.stance ? nL : fL;
    const Leff = legLen * (1 - 0.035 * Math.sin(Math.PI * stance.s));
    hipY = ankY - Math.sqrt(Math.max(1, Leff * Leff - stance.x * stance.x));
    for (const [L, near] of [[fL, false], [nL, true]] as const)
      legs.push({ ank: [300 + L.x, ankY - L.h], pitch: L.stance ? 0 : rad(35 * Math.sin(Math.PI * L.s) * (1 - 1.6 * L.s)), near });
    lean = 4 + 2 * Math.cos(2 * two * phase); // 6 deg at contact, 2 deg at passing
    nearFwd = nL.x / (S / 2);
  } else if (mode === "run") {
    // a sprint: each foot is on the ground for a third of the cycle, twice a cycle both feet are in the air; the heel kicks up
    // behind, the knee comes through high. The planted foot slides back at exactly the running speed (RUN_M metres a cycle).
    const S = RUN_S * stride;
    const st = (ph: number) => {
      const c = (((phase + ph) % 1) + 1) % 1;
      if (c < 0.34) { const q = c / 0.34; return { x: S * (0.55 - 1.15 * q), h: 0, stance: true, s: q }; }
      const q = (c - 0.34) / 0.66;
      return { x: S * (-0.6 + 1.15 * (q - (0.6 * Math.sin(two * q)) / two)), h: (150 * Math.sin(Math.PI * q) ** 0.8 * (1 - 0.35 * q) + 30 * Math.sin(Math.PI * q)) * Math.min(1, stride + 0.2), stance: false, s: q };
    };
    const nL = st(0), fL = st(0.5), c2 = (((2 * phase) % 1) + 1) % 1;
    hipY = ankY - 0.86 * legLen + 16 * Math.cos(two * (c2 - 0.34)) - 6;
    for (const [L, near] of [[fL, false], [nL, true]] as const)
      legs.push({ ank: [300 + L.x, ankY - L.h], pitch: L.stance ? rad(18 * L.s * L.s) : rad(65 * Math.sin(Math.PI * L.s) * (1 - 1.35 * L.s)), near });
    lean = 14 + 2 * Math.cos(two * 2 * phase);
    nearFwd = nL.x / (0.6 * S);
  } else if (mode === "push") {
    hipY = ankY - 0.87 * legLen;
    legs.push({ ank: [300 - 0.5 * legLen, ankY], pitch: rad(-8), near: false }, { ank: [300 + 0.32 * legLen, ankY], pitch: 0, near: true });
    lean = 14 * pose;
  } else if (mode === "swing") {
    hipY = SWING_HIP;
    const a = rad(60 * pose);
    for (const [dx, near] of [[-6, false], [0, true]] as const) {
      const knee: P2 = [300 + l1 * 0.98 + dx * u, hipY + 6 * u];
      legs.push({ ank: [knee[0] + l2 * Math.sin(a), knee[1] + l2 * Math.cos(a)], pitch: -a * 0.5, near });
    }
  } else {
    legs.push({ ank: [300 - 4 * u, ankY], pitch: 0, near: false }, { ank: [300 + 4 * u, ankY], pitch: 0, near: true });
  }
  const torsoBot = hipY + 0.12 * HH, chin = torsoBot - Bd.torso * HH, hc = chin - H.b, crown = hc - H.b, hip: P2 = [300, hipY];
  p.rot = null;
  for (const L of legs) {
    const knee = mode === "swing" ? ([300 + l1 * 0.98 + (L.near ? 0 : -6 * u), hipY + 6 * u] as P2) : ik(hip, L.ank, l1, l2);
    const hp0: P2 = [300 + (L.near ? 0 : -5 * u), hipY];
    if (NEW) p.stroke([hp0, knee, L.ank], 15 * u + 6 * u, INK);
    p.stroke([hp0, knee, L.ank], (NEW ? 15 : 5.8) * u, L.near ? nearCol : farCol);
    const c = Math.cos(L.pitch), s = Math.sin(L.pitch);
    footStroke(p, [L.ank[0] - 3 * u * c, L.ank[1] - 3 * u * s], [L.ank[0] + 13 * u * c, L.ank[1] + 13 * u * s + 0.5 * u],
      (NEW ? 10 : 7.5) * u, L.near ? footCol : footCol === INK ? INK : shade(footCol, 0.82));
  }
  lean += opts.lean ?? 0;
  // a long dress in the side view too (without it a woman turned into a stick figure whenever she walked)
  if (o.dress && mode === "run") { const k = 12 * u * nearFwd; p.poly([[300 - 0.3 * W, hipY - 0.12 * HH], [300 + 0.34 * W, hipY - 0.12 * HH], [300 + 0.56 * W + k, ankY - 0.3 * HH], [300 + 0.1 * W, ankY - 0.24 * HH], [300 - 0.52 * W + k, ankY - 0.28 * HH]], o.dress, ow); }   // gathered up to run: the shins and the feet show
  else if (o.dress && !GT) p.poly([[300 - 0.3 * W, hipY - 0.12 * HH], [300 + 0.34 * W, hipY - 0.12 * HH], [300 + 0.82 * W, ankY - 0.03 * HH], [300 - 0.82 * W, ankY - 0.03 * HH]], o.dress, ow); // wide enough to hide the striding legs: only the feet show
  // ---- upper body leans about the hip ----
  p.rot = lean ? [rad(lean), 300, hipY] : null;
  const T: Blob = { a: (o.build === "stout" ? 0.36 : 0.31) * W, b: 0.5 * (torsoBot - (chin - 0.25 * HH)), nTop: 2.2, nBot: 2.5, egg: 0.1, asym: 0.06,
    rot: 0, noise: 0.006, seed: seed + 7 };
  const tcx = 300 + 2 * u, tcy = torsoBot - T.b, tp = blobPts(tcx, tcy, T);
  const armCol = o.roman ? skin : mix(o.jacket, INK, 0.5), farArm = o.roman ? shade(skin, 0.84) : mix(o.jacket, INK, 0.68), armW = o.roman ? 6.6 * u : 5 * u;
  const S: P2 = [tcx + 0.05 * T.a, chin + 0.14 * HH], aLen = 0.95 * HH;
  // a sprinter's arm: bent at the elbow, the fist pumping from the hip to the chin
  const runArm = (ang: number): [P2, P2, P2] => { const e: P2 = [S[0] + Math.sin(ang) * aLen * 0.42, S[1] + Math.cos(ang) * aLen * 0.42], a2 = ang + rad(92); return [S, e, [e[0] + Math.sin(a2) * aLen * 0.4, e[1] + Math.cos(a2) * aLen * 0.4]]; };
  const holdArm = (dx: number): [P2, P2, P2] => [S, [S[0] + 0.22 * HH + dx, S[1] + 0.36 * HH], [S[0] + 0.5 * HH + dx, S[1] + 0.3 * HH]];
  const swingArm = (ang: number): [P2, P2, P2] => {
    const e: P2 = [S[0] + Math.sin(ang) * aLen * 0.5, S[1] + Math.cos(ang) * aLen * 0.5], a2 = ang + rad(16) * Math.sign(ang || 1);
    return [S, e, [e[0] + Math.sin(a2) * aLen * 0.5, e[1] + Math.cos(a2) * aLen * 0.5]];
  };
  const rifle = !!o.rifle && (mode === "march" || mode === "stand");
  const B0: P2 = [tcx + 0.72 * T.a, chin + 0.58 * HH], B1: P2 = [tcx - 0.95 * T.a - 22 * u, crown - 0.4 * HH];
  let near: [P2, P2, P2], far: [P2, P2, P2] | null;
  if (opts.hold) { near = holdArm(0); far = holdArm(-5 * u); }
  else if (mode === "run") { near = runArm(rad(-48) * nearFwd - rad(8)); far = runArm(rad(48) * nearFwd - rad(8)); }
  else if (mode === "swing") { near = [S, [S[0] + 12 * u, S[1] - 0.16 * HH], [300 + 6 * u, chin - 0.3 * HH]]; far = [S, [S[0] + 8 * u, S[1] - 0.18 * HH], [300 + 2 * u, chin - 0.36 * HH]]; }
  else if (mode === "push") {
    const reach = 0.55 * HH + 0.45 * HH * pose;
    let hN: P2 = [S[0] + reach, S[1] + 0.06 * HH];
    if (opts.hand) {
      // target is in final canvas units; the arm is drawn inside the lean rotation, so undo it
      const th = -rad(lean), dx = opts.hand[0] - 300, dy = opts.hand[1] - hipY;
      const tg: P2 = [300 + dx * Math.cos(th) - dy * Math.sin(th), hipY + dx * Math.sin(th) + dy * Math.cos(th)];
      hN = [hN[0] + (tg[0] - hN[0]) * pose, hN[1] + (tg[1] - hN[1]) * pose];
    }
    near = [S, [(S[0] + hN[0]) / 2, (S[1] + hN[1]) / 2 + 0.06 * HH], hN];
    far = [S, [(S[0] + hN[0]) / 2 - 4 * u, (S[1] + hN[1]) / 2 - 0.02 * HH], [hN[0] - 6 * u, hN[1] - 0.08 * HH]];
  } else if (rifle) { near = [S, [S[0] - 4 * u, S[1] + 0.42 * HH], B0]; far = mode === "march" ? swingArm(rad(30) * nearFwd) : swingArm(0); }
  else if (mode === "march") { near = swingArm(rad(-30) * nearFwd); far = swingArm(rad(30) * nearFwd); }
  else if (NEW) { near = swingArm(rad(7)); far = swingArm(rad(-4)); }   // standing: the arms hang close to the body
  else { near = swingArm(rad(13)); far = swingArm(rad(-15)); }
  if (far) { const c = curve(far[0], far[1], far[2]); p.stroke(c, 8.4 * u, INK); p.stroke(c, armW, farArm); p.dot(far[2][0], far[2][1], 5.8 * u); }
  const longDress = GT && !!o.dress && mode !== "run";
  if (longDress) {
    // the long dress of the new look, as from the front: one garment from the collar to the ankles, a short cape of the jacket colour
    const hem = sole - 0.09 * HH, wide = mode === "march" ? 0.37 : 0.3;
    const D: Blob = { a: wide * W, b: 0.5 * (hem - (chin - 0.2 * HH)), nTop: 2.0, nBot: 3.0, egg: mode === "march" ? 0.4 : 0.3, asym: 0.05, rot: 0, noise: 0.006, seed: seed + 9 };
    const dp = blobPts(tcx, hem - D.b, D);
    p.gradFill(dp, o.dress!, mul(o.dress!, SH_CLOTH), light); p.inkRing(dp, ow, thick);
    const sp = blobPts(tcx, chin + 0.12 * HH, { a: 0.29 * W, b: 0.3 * HH, nTop: 2.2, nBot: 2.4, egg: 0.1, asym: 0.04, rot: 0, noise: 0.006, seed: seed + 8 });
    p.gradFill(sp, o.jacket, mul(o.jacket, SH_CLOTH), light); p.inkRing(sp, ow * 0.9, thick);
    if (o.roman) p.clip(dp, () => romanDress(p, o, tcx, chin, hem, HH, T.a, u));
  }
  if (!longDress) p.gradFill(tp, o.jacket, mul(o.jacket, SH_CLOTH), light);
  if (!longDress) p.clip(tp, () => {
    if (o.roman === "soldier") { const y0 = chin + 0.02 * HH, y1 = torsoBot - 0.3 * HH, h = (y1 - y0) / 6; for (let i = 0; i < 6; i++) { p.poly([[tcx - 1.4 * T.a, y0 + i * h], [tcx + 1.4 * T.a, y0 + i * h], [tcx + 1.4 * T.a, y0 + (i + 1) * h + 1], [tcx - 1.4 * T.a, y0 + (i + 1) * h + 1]], i % 2 ? "#a3acb7" : "#bcc4cd", 0); p.stroke([[tcx - 1.4 * T.a, y0 + i * h], [tcx + 1.4 * T.a, y0 + i * h]], 2.6 * u, INK); } p.band([[tcx - 1.4 * T.a, y1], [tcx + 1.4 * T.a, y1]], "#6a4428", 0.1 * HH, 1.6 * u); }
    if (o.roman === "baker") p.poly([[tcx + 0.25 * T.a, chin + 0.34 * HH], [tcx + 1.4 * T.a, chin + 0.34 * HH], [tcx + 1.4 * T.a, torsoBot + 0.3 * HH], [tcx + 0.1 * T.a, torsoBot + 0.3 * HH]], "#d6b87a", 2.4 * u);
    if (o.roman === "boy" || o.roman === "merchant" || o.roman === "woman") p.band([[tcx - 1.4 * T.a, torsoBot - 0.22 * HH], [tcx + 1.4 * T.a, torsoBot - 0.22 * HH]], o.roman === "woman" ? "#e9d9b0" : "#6a4428", 0.07 * HH, 1.4 * u);
    if (o.belt) p.band([[tcx - 0.65 * T.a, chin - 0.05 * HH], [tcx + 0.75 * T.a, torsoBot - 0.1 * HH]], o.belt!, 5.5 * u, 1.8 * u);
    if (o.sash) p.band([[tcx - 1.3 * T.a, torsoBot - 0.32 * HH], [tcx + 1.3 * T.a, torsoBot - 0.32 * HH]], o.sash, 0.13 * HH, 1.8 * u);
    if (o.sir) {
      // the same suit as from the front: tweed check, the shirt and the mustard waistcoat showing at the open front, a dark lapel
      // running down to the top button, two coat buttons, a pocket flap
      const g = p.g; g.save(); g.globalAlpha = 0.22;
      for (let k = -8; k <= 8; k++) { p.stroke([[tcx + k * 9 * u, chin - 0.3 * HH], [tcx + k * 9 * u, torsoBot + 0.1 * HH]], 1.3 * u, "#3b2a1a"); p.stroke([[tcx - 1.4 * T.a, chin + k * 9 * u + 0.5 * HH], [tcx + 1.4 * T.a, chin + k * 9 * u + 0.5 * HH]], 1.3 * u, "#3b2a1a"); }
      g.restore();
      const top = chin - 0.02 * HH, vy = chin + 0.62 * HH;
      p.poly([[tcx + 0.5 * T.a, top], [tcx + 1.5 * T.a, top], [tcx + 1.5 * T.a, vy + 3 * u], [tcx + 0.98 * T.a, vy]], "#d6a53a", 2.2 * u);
      p.poly([[tcx + 0.62 * T.a, top], [tcx + 1.5 * T.a, top], [tcx + 1.5 * T.a, chin + 0.3 * HH]], "#ffffff", 2 * u);
      p.poly([[tcx + 0.12 * T.a, top], [tcx + 0.5 * T.a, top], [tcx + 1.0 * T.a, vy], [tcx + 0.86 * T.a, vy + 3 * u], [tcx + 0.22 * T.a, chin + 0.22 * HH]], TWEED_DARK, 2.2 * u);
      p.stroke([[tcx + 0.98 * T.a, vy], [tcx + 1.02 * T.a, torsoBot + 0.1 * HH]], 2.2 * u);
      for (const y of [vy + 0.14 * HH, vy + 0.3 * HH]) { p.dot(tcx + 0.78 * T.a, y, 3 * u, INK); p.dot(tcx + 0.78 * T.a, y, 2.1 * u, "#3b2a1a"); }
      p.stroke([[tcx - 0.3 * T.a, vy + 0.2 * HH], [tcx + 0.32 * T.a, vy + 0.22 * HH]], 2 * u);
    }
    if (!o.dress && !o.roman && !o.sir) for (let i = 0; i < 3; i++) { const y = chin + 0.16 * HH + i * 0.24 * HH; p.dot(tcx + 0.8 * T.a, y, 3 * u, INK); p.dot(tcx + 0.8 * T.a, y, 2.2 * u, o.buttons ?? shade(o.jacket, 0.7)); }
  });
  if (!longDress) p.inkRing(tp, ow, thick);
  if (o.sir) { // the red bow tie in profile: the knot at the collar, one wing toward the lens
    const bx = tcx + 0.92 * T.a, by = chin + 0.04 * HH;
    p.poly([[bx, by], [bx - 12 * u, by - 7 * u], [bx - 12 * u, by + 7 * u]], "#d12f2f", 2.2 * u);
    p.poly([[bx, by], [bx + 7 * u, by - 6 * u], [bx + 7 * u, by + 6 * u]], "#d12f2f", 2.2 * u);
  }
  // a Roman's short tunic: the skirt is one garment with the body, from the belt to the knee, swinging with the stride
  if (o.roman && o.hem !== undefined && !o.dress) {
    const top = torsoBot - 0.3 * HH, bot = torsoBot + (Bd.legs - o.hem) * HH - 0.1 * HH, k = 7 * u * nearFwd, sk: P2[] = [[tcx - 0.86 * T.a, top], [tcx + 0.9 * T.a, top], [tcx + 1.22 * T.a + k, bot - 3 * u], [tcx + 0.2 * T.a + k, bot + 3 * u], [tcx - 1.16 * T.a + k, bot]];
    p.gradFill(sk, o.jacket, mul(o.jacket, SH_CLOTH), light); p.poly(sk, null, ow * 0.9);
    p.clip(sk, () => {
      if (o.roman === "soldier") for (let i = 0; i < 6; i++) { const x = tcx - 1.0 * T.a + i * 0.42 * T.a; p.band([[x, top + 0.14 * HH], [x + k * 0.6, bot + 4 * u]], "#7a5030", 6 * u, 1.4 * u); }
      if (o.roman === "baker") p.poly([[tcx + 0.1 * T.a, top - 2 * u], [tcx + 1.4 * T.a, top - 2 * u], [tcx + 1.5 * T.a + k, bot + 8 * u], [tcx + 0.3 * T.a + k, bot + 8 * u]], "#d6b87a", 2.4 * u);
    });
    p.band([[tcx - 0.9 * T.a, top + 1 * u], [tcx + 0.94 * T.a, top + 1 * u]], o.roman === "baker" ? "#c4a468" : "#6a4428", 0.07 * HH, 1.4 * u);
  }
  if (rifle) {
    p.band([B0, B1], "#7a4b2a", 5 * u, 1.5 * u, "round");
    p.band([lerp2(B0, B1, 0.6), B1], "#8d949c", 2.4 * u, 1.2 * u, "round");
  }
  // Sir Digsworth's monocle chain in profile: from the lower back edge of the frame, behind the moustache, down to the buttonhole
  const hx = 300 + 4 * u;
  let sideChain: P2[] | null = null;
  if (o.sir) {
    const sw = clamp((opts.chain ?? 0) + (mode === "march" ? 0.55 * Math.sin(two * (phase - 0.2)) : 0), -1, 1) * 7 * u;
    const up: P2 = [hx + 27 * u - 6.7 * u, hc + 2 * u + 7.1 * u], hb: P2 = [tcx + 0.42 * T.a, chin + 0.26 * HH], end: P2 = [hb[0] - 2 * u, hb[1] + 3.1 * u];
    const q1: P2 = [hx + 3 * u - Math.max(-2.5 * u, 0.5 * sw), hc + 31 * u], q2: P2 = [hb[0] - 9 * u - Math.max(-5 * u, 0.9 * sw), hb[1] + 12 * u - 0.12 * Math.abs(sw)];
    const pts = [...bez(up, [up[0] - 7 * u, up[1] + 4 * u], [q1[0], q1[1] - 12 * u], q1, 12), ...bez(q1, [q1[0], q1[1] + 11 * u], [q2[0] - 7 * u, q2[1] - u], q2, 18).slice(1), ...bez(q2, [q2[0] + 5 * u, q2[1] + 0.7 * u], [end[0] - 1.5 * u, end[1] + 4.5 * u], end, 8).slice(1)];
    let i0 = pts.findIndex((q) => q[1] > chin); if (i0 < 1) i0 = pts.length - 1;
    sideChain = pts.slice(0, i0 + 1);
    const ring: P2[] = []; for (let i = 0; i <= 20; i++) { const a = (i / 20) * Math.PI * 2; ring.push([hb[0] - 0.4 * u + 2.1 * u * Math.cos(a), hb[1] + 1.7 * u + 2.1 * u * Math.sin(a)]); }
    const hole: P2[] = [[hb[0] - 3.4 * u, hb[1] - 1.9 * u], [hb[0] + 3.2 * u, hb[1] + 0.9 * u]];
    p.stroke(hole, 2.2 * u, INK); p.stroke(hole, 0.8 * u, "#3b2a1a"); chainLine(p, pts.slice(i0), u); chainLine(p, ring, u);
  }
  if (opts.hold) heldThing(p, opts.hold, near[2][0] + 4 * u, near[2][1], u);
  if (o.sir && !opts.hold && (mode === "stand" || mode === "march")) { // the cane in his right hand: the tip stays on the ground while the body leans
    const r0 = p.rot, [hx2, hy2] = rotAbout(near[2], rad(lean), [300, hipY]); p.rot = null;
    p.band([[hx2 + 1 * u, hy2 - 5 * u], [hx2 + 9 * u, sole - 3 * u]], "#5a3a22", 3.4 * u, 1.5 * u, "round");
    p.ell(hx2 + 1 * u, hy2 - 7 * u, 4.6 * u, 4.6 * u, GOLD, 2 * u);
    p.rot = r0;
  }
  { const c = curve(near[0], near[1], near[2]); p.stroke(c, 8.4 * u, INK); p.stroke(c, armW, armCol); p.dot(near[2][0], near[2][1], 5.8 * u); }
  // ---- head ----
  hatBehind(p, o, H, hx, hc, light, thick, ow, true);
  const hp = blobPts(hx, hc, H);
  p.shadedFill(hp, skin, mul(skin, SH_SKIN), light, H.a);
  p.inkRing(hp, ow, thick);
  if (NEW) napeHair(p, o, hp, hc, H, seed, light, ow, hx - 0.52 * H.a, -1);
  beardOn(p, o, hp.map(([x, y]) => [x < hx - 0.1 * H.a ? hx - 0.1 * H.a : x, y] as P2), hx, hc, H, light, ow, hx + 30 * (W / 100));
  hatOn(p, o, hp, H, hx, hc, light, seed, 1, true);
  const brim = !!o.hat && o.hat !== "hair" && o.hat !== "bonnet" && o.hat !== "scarf";
  faceSide(p, hx, hc, W, expr, lid, brim, skin, o.moustache, o.build === "stout");
  glassesOn(p, o, [hx + 27 * u], hc, u, [hx - 20 * u, hc - 4 * u]);
  if (sideChain) chainLine(p, sideChain, u);
  p.rot = null;
};

// ---------------- one entry for every view (craft kit, step 1) ----------------
/** the walking step of the short-legged new look, as a fraction of the old cast's 370-unit step */
export const WALK_STRIDE = 0.5;
/** the four views every figure can be drawn from. `dir` = which way it faces on screen (1 = screen-right, -1 = screen-left). */
export type View = "front" | "quarter" | "side" | "back";
export type FigOpts = Omit<FrontOpts, "mode" | "back" | "turn"> & {
  view?: View; dir?: 1 | -1; mode?: "stand" | "walk" | "run" | "sit" | "fall";
  /** side view only: step length, something carried in both hands, extra forward lean in degrees */
  stride?: number; hold?: SideOpts["hold"]; lean?: number;
};
/** Draws a figure in the 600 x 1000 design space (soles at y = 975) from the front, three-quarter, side or back.
 *  Front and three-quarter keep what is on HIS right and left where it belongs (monocle, cane, pocket square): the three-quarter
 *  view to screen-left is drawn, not mirrored. The side view shows the monocle from either side (a mirrored drawing). */
export const figure = (p: Pen, o: Outfit, opts: FigOpts) => {
  const { view = "front", dir = 1, mode = "stand", stride, hold, lean, ...rest } = opts;
  if (view === "side") {
    const g = p.g, flip = dir < 0, light = opts.light ?? DEF_LIGHT;
    if (flip) { g.save(); g.translate(600, 0); g.scale(-1, 1); }
    bodySide(p, o, { phase: opts.phase, expr: opts.expr, blink: opts.blink, seed: opts.seed, chain: opts.chain, stride: stride ?? (o.sir || o.gent ? WALK_STRIDE : 1), hold, lean,
      light: flip ? Math.PI - light : light, mode: mode === "walk" ? "march" : mode === "run" ? "run" : "stand" });
    if (flip) g.restore();
    return;
  }
  bodyFront(p, o, { ...rest, mode: mode === "walk" ? "stroll" : mode === "run" ? "march" : mode, back: view === "back", turn: view === "quarter" ? dir : 0,
    run: mode === "run" ? 1 : rest.run });
};

/** rope + seat + seated kid on a 700 x 2300 canvas; the pivot is design (350, 20); kid drawn at 0.92 scale */
export const swingKid = (p: Pen, o: Outfit, kick: number, expr: Expr, light = DEF_LIGHT, blink: number = 0) => {
  const rope = 1830, k = 1.1, HH = 2 * headBlob(5, BUILD[o.build ?? "adult"].a, 1).b;
  // two ropes from the pivot to the ends of a wide plank, the kid framed between them: a single rope behind the kid
  // ended at the cap and read as a hanging. Far rope behind the kid, near rope drawn over (clear of the face).
  const seat = rope + 18, x0 = 150, x1 = 550;
  p.line([[350, 20], [x0 + 16, seat + 4]], "#a07a4c", 10);
  p.poly(rrect(x0, seat, x1, seat + 36, 10), "#b5653f", 9);
  const g = p.g;
  g.save();
  g.translate(350 - 300 * k, rope + 18 - (SWING_HIP + 0.12 * HH) * k);
  g.scale(k, k);
  bodySide(new Pen(g), o, { expr, mode: "swing", pose: kick, light, seed: 5, blink });
  g.restore();
  p.line([[350, 20], [x1 - 16, seat + 4]], "#a07a4c", 10);
};

// ---------------- effects ----------------
export const fxNote = (p: Pen, kind: number, col = "#1f2a44") => {
  p.ell(70, 200, 46, 34, col, 8, 0, 360, -20);
  p.stroke([[110, 190], [110, 40]], 14);
  if (kind === 0) p.poly([[110, 40], [170, 70], [170, 110], [110, 82]], col, 8);
  else {
    p.ell(150, 170, 40, 30, col, 8, 0, 360, -20);
    p.stroke([[186, 160], [186, 20]], 14);
    p.poly([[110, 40], [186, 20], [186, 50], [110, 70]], col, 8);
  }
};

/** spark / impact star on a 500 x 500 canvas; t in 0..1 */
export const fxBurst = (p: Pen, t: number, col = "#fff3b0", rays = 10, r0 = 40, r1 = 230) => {
  const c = 250, e = 1 - (1 - t) ** 3;
  for (let i = 0; i < rays; i++) {
    const a = rad((i * 360) / rays + 7 * (i % 2)), ra = r0 + (r1 - r0) * e * (0.75 + 0.25 * (i % 2));
    p.poly([[c + r0 * 0.5 * Math.cos(a + 0.18), c + r0 * 0.5 * Math.sin(a + 0.18)], [c + ra * Math.cos(a), c + ra * Math.sin(a)],
      [c + r0 * 0.5 * Math.cos(a - 0.18), c + r0 * 0.5 * Math.sin(a - 0.18)]], col, Math.max(3, 8 * (1 - t)));
  }
  if (t < 0.5) p.ell(c, c, r0 * (1.4 - t), r0 * (1.4 - t), WHITE, 8);
};

/** water splash crown on an 800 x 800 canvas; t in 0..1 */
export const fxSplash = (p: Pen, t: number) => {
  const c = 400, size = 800, rise = Math.sin(Math.min(1, t * 1.3) * Math.PI);
  const blue = "#bfe8ff", deep = "#6cc0f0";
  if (rise > 0.02) {
    const pts: P2[] = [];
    for (let i = 0; i < 19; i++) {
      const h = (i % 2 ? 260 : 130) * rise * (0.7 + 0.3 * Math.sin(i * 1.7));
      pts.push([c - 330 + (660 * i) / 18, size - 120 - h]);
    }
    p.poly([...pts, [c + 330, size - 90], [c - 330, size - 90]], blue, 10);
    p.ell(c, size - 100, 360, 46, deep, 10);
  }
  for (let i = 0; i < 8; i++) {
    const a = rad(200 + i * 18), d = 120 + 380 * t, y = size - 160 + d * Math.sin(a) + 520 * t * t, r = 26 * (1 - t) + 6;
    if (t > 0.08 && y < size - 40) p.ell(c + d * Math.cos(a), y, r, r * 1.25, blue, 7);
  }
};

/** dust puff on a 300 x 300 canvas; t in 0..1 */
export const fxPuff = (p: Pen, t: number) => {
  for (let i = 0; i < 5; i++) {
    const a = rad(160 + i * 55), d = 40 + 70 * t, r = (34 + 20 * (i % 2)) * (1 - 0.6 * t);
    p.ell(150 + d * Math.cos(a), 180 + d * 0.45 * Math.sin(a), r, r * 0.8, `rgba(238,225,205,${(1 - t).toFixed(3)})`, 0);
  }
};

/** circling stars on a 420 x 210 canvas */
export const fxStars = (p: Pen, t: number) => {
  for (let i = 0; i < 4; i++) {
    const a = t * Math.PI * 2 + (i * Math.PI) / 2, x = 210 + 150 * Math.cos(a), y = 110 + 40 * Math.sin(a), pts: P2[] = [];
    for (let k = 0; k < 10; k++) { const r = k % 2 ? 14 : 34, b = rad(k * 36 - 90); pts.push([x + r * Math.cos(b), y + r * Math.sin(b)]); }
    p.poly(pts, "#ffd84a", 6);
  }
};

/** three jittering strain ticks on a 300 x 300 canvas */
export const fxCreak = (p: Pen, t: number) => {
  const j = 6 * Math.sin(t * 40);
  for (const a of [-30, 0, 30]) {
    const b = rad(a - 90);
    p.stroke([[150 + 70 * Math.cos(b) + j, 230 + 70 * Math.sin(b)], [150 + 100 * Math.cos(b) + 10 + j, 230 + 100 * Math.sin(b)],
      [150 + 130 * Math.cos(b) + j, 230 + 130 * Math.sin(b)]], 10);
  }
};

/** flat water ring (drawn top-down) on a 600 x 600 canvas; t in 0..1 */
export const fxRing = (p: Pen, t: number) => {
  // thin light water rings (white crest, pale blue trailing rings), thinning as they spread
  const g = p.g;
  for (let k = 0; k < 3; k++) {
    const u = t - k * 0.22;
    if (u <= 0 || u >= 1) continue;
    g.beginPath(); g.ellipse(300, 300, 60 + 230 * u, 60 + 230 * u, 0, 0, Math.PI * 2);
    g.strokeStyle = k === 0 ? "#f6fcff" : "#cfe8fa"; g.lineWidth = 9 * (1 - u) + 3; g.stroke();
  }
};

/** text-free sign on a 700 x 520 canvas: "no marching in step on the bridge". A bridge (deck + arch + piers), four
 *  identical pairs of marching legs in the same stride (in step), a bold red X over all of it. */
export const fxSign = (p: Pen) => {
  const g = p.g, RED = "#d42f2f";
  p.poly(rrect(14, 14, 686, 506, 40), "#f6ecd2", 0);
  p.poly(rrect(14, 14, 686, 506, 40), null, 14);
  // bridge: deck, stone arch underneath, two piers
  p.poly(rrect(70, 352, 630, 384, 8), "#8a5a3a", 9);
  g.beginPath(); g.moveTo(112, 470); g.quadraticCurveTo(350, 300, 588, 470);
  g.strokeStyle = INK; g.lineWidth = 16; g.lineCap = "round"; g.stroke();
  for (const x of [88, 612]) p.poly(rrect(x - 16, 384, x + 16, 470, 4), "#8a5a3a", 9);
  // four identical soldiers' legs mid-stride: same leg forward on every one = in step
  for (const x of [150, 278, 406, 534]) {
    p.poly(rrect(x - 30, 150, x + 30, 214, 14), "#357650", 9);                  // coat hem
    p.stroke([[x - 8, 210], [x + 34, 262], [x + 46, 338]], 15, INK);           // front leg
    p.stroke([[x + 6, 210], [x - 12, 274], [x - 36, 336]], 15, INK);           // back leg
    p.poly(rrect(x + 30, 330, x + 74, 350, 9), INK, 0);                          // boots point forward
    p.poly(rrect(x - 52, 328, x - 8, 348, 9), INK, 0);
  }
  // big red X
  for (const [a, b] of [[[96, 70], [604, 452]], [[604, 70], [96, 452]]] as [[number, number], [number, number]][]) {
    p.stroke([a, b], 58, "#ffffff");
    p.stroke([a, b], 42, RED);
  }
};

/** soft cartoon cloud on a 600 x 300 canvas */
export const fxCloud = (p: Pen, seed: number) => {
  const blobs: [number, number, number][] = [[150, 190, 80], [250, 150, 105], [360, 160, 95], [450, 195, 70], [300, 210, 90]];
  for (const [x, y, r] of blobs) p.ell(x + ((seed * 37) % 20) - 10, y, r, r * 0.8, "#ffffff", 0);
  p.ell(300, 235, 230, 40, "#ffffff", 0);
};

/** cast shadow on a 128 x 256 canvas: dark soft contact pool at the feet (y 205) and a softer tail that runs up the
 *  canvas = away from the sun, fading with distance; multiply colour (sRGB-encoded linear ratio), white = no change */
export const fxShadow = (p: Pen, col: string) => {
  const g = p.g;
  g.fillStyle = WHITE; g.fillRect(0, 0, 128, 256);
  g.save(); g.filter = "blur(9px)";
  const lg = g.createLinearGradient(0, 205, 0, 22);
  lg.addColorStop(0, mix(col, WHITE, 0.08)); lg.addColorStop(0.55, mix(col, WHITE, 0.3)); lg.addColorStop(1, mix(col, WHITE, 0.85));
  g.fillStyle = lg;
  g.beginPath(); g.moveTo(40, 205); g.bezierCurveTo(36, 120, 46, 50, 64, 30); g.bezierCurveTo(82, 50, 92, 120, 88, 205); g.closePath(); g.fill();
  g.fillStyle = col; g.beginPath(); g.ellipse(64, 205, 30, 17, 0, 0, Math.PI * 2); g.fill();
  g.restore();
};

/** tight contact shadow right under the feet on a 128 x 128 canvas: dark core, short fall-off (multiply colour) */
export const fxContact = (p: Pen, col: string) => {
  const g = p.g;
  g.fillStyle = WHITE; g.fillRect(0, 0, 128, 128);
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  for (const [r, k] of [[0, 0], [0.32, 0.02], [0.5, 0.22], [0.66, 0.58], [0.82, 0.88], [1, 1]] as const) gr.addColorStop(r, mix(col, WHITE, k));
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
};

/** floating wooden plank, side-on, on a 320 x 110 canvas */
export const fxPlank = (p: Pen) => {
  p.poly(rrect(14, 30, 306, 78, 10), "#a8744a", 9);
  p.line([[40, 46], [150, 44], [270, 50]], "#7d5234", 4);
  p.line([[60, 62], [200, 64], [284, 60]], "#7d5234", 4);
  p.dot(36, 54, 5, INK); p.dot(284, 54, 5, INK);
};

/** floating marching drum (no text) on a 260 x 240 canvas: white shell, red hoops, ink zig-zag cord */
export const fxDrum = (p: Pen) => {
  p.poly(rrect(40, 70, 220, 190, 16), "#f1ece0", 9);
  p.poly(rrect(32, 58, 228, 86, 12), "#c9373a", 8);
  p.poly(rrect(32, 176, 228, 204, 12), "#c9373a", 8);
  p.line([[52, 88], [82, 172], [112, 88], [142, 172], [172, 88], [202, 172]], INK, 6);
  p.ell(130, 58, 98, 18, "#f7f3ea", 8);
};

/** soft ground contact blob on a 128 x 128 canvas, multiply colour (sRGB-encoded linear ratio) in the centre */
export const fxBlob = (p: Pen, col: string) => {
  const g = p.g;
  g.fillStyle = WHITE; g.fillRect(0, 0, 128, 128);
  // soft contact shadow: flat core, then a long smooth (roughly gaussian) fall-off to white = no change
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  for (const [r, k] of [[0, 0], [0.5, 0.04], [0.64, 0.18], [0.76, 0.42], [0.87, 0.72], [0.95, 0.92], [1, 1]] as const) gr.addColorStop(r, mix(col, WHITE, k));
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
};

// ---------------- the Emu War cast (Western Australia, 1932) ----------------
export const KHAKI = "#93864e";
export const DIGGER: Outfit = { jacket: KHAKI, pants: "#877a45", boots: "#4a3324", hat: "slouch", cap: "#8a7a4c", sam: "#5e3d24", buttons: "#c9a94a" };
export const DIGGER2: Outfit = { ...DIGGER, skin: "#f5c9a0", cap: "#847446" };
export const MAJOR: Outfit = { ...DIGGER, hat: "peaked", cap: "#8f8250", moustache: "#5b3a22", build: "stout", buttons: "#e2bb4c" };
export const FARMER: Outfit = { jacket: "#b5583a", pants: "#56627e", boots: "#4a3324", hat: "slouch", cap: "#b99a62", buttons: "#e9dcc0", skin: "#f0c39a" };

// ---------------- more cast for the long film ----------------
export const FARMER2: Outfit = { ...FARMER, jacket: "#6f8a5a", pants: "#5a4a3a", cap: "#a88a5a", skin: SKIN };
export const FARMER3: Outfit = { ...FARMER, jacket: "#c9a25a", pants: "#4f5d7a", cap: "#8a6a44", skin: "#f5c9a0", moustache: "#5b3a22" };
export const MINISTER: Outfit = { jacket: "#3d4258", pants: "#2e3142", boots: INK, hat: "hair", hair: "#c2c2c8", moustache: "#9a9aa0", build: "stout", buttons: "#c9a94a" };
export const POLITICIAN: Outfit = { jacket: "#5a3a36", pants: "#2e3142", boots: INK, hat: "hair", hair: "#5a3b2a", buttons: "#c9a94a" };
export const POLITICIAN2: Outfit = { jacket: "#3f4a3a", pants: "#33352e", boots: INK, hat: "hair", hair: "#8a8a90", build: "stout", moustache: "#8a8a90" };
export const POLITICIAN3: Outfit = { jacket: "#4a4458", pants: "#2e3142", boots: INK, hat: "hair", hair: "#2f2a2a", skin: "#f5c9a0" };
export const CAMERAMAN: Outfit = { jacket: "#6b7f8e", pants: "#5a4a3a", boots: "#4a3324", hat: "cap", cap: "#39414d", skin: "#f5c9a0" };

// ---------------- the Wojtek film (Polish II Corps, 1942-47) ----------------
export const POLE: Outfit = { jacket: "#8a7f4c", pants: "#7f7444", boots: "#3a2a20", hat: "cap", cap: "#5d5a3a", sam: "#5e3d24", buttons: "#c9a94a" };
export const POLE2: Outfit = { ...POLE, skin: "#f5c9a0", cap: "#56533a", moustache: "#5b3a22" };
export const POLE3: Outfit = { ...POLE, skin: "#ecd0b6", cap: "#615e3e" };
export const BRIT_OFFICER: Outfit = { jacket: "#7d7a52", pants: "#77744e", boots: "#3a2a20", hat: "peaked", cap: "#7d7a52", moustache: "#8a6a44", build: "stout", sam: "#5e3d24", buttons: "#e2bb4c" };
export const VETERAN: Outfit = { jacket: "#5a6072", pants: "#3d3f4a", boots: INK, hat: "cap", cap: "#4a4c56", moustache: "#b9b9c0", hair: "#b4b4bc", buttons: "#8a8f9c" };
export const VETERAN2: Outfit = { jacket: "#6e5a4a", pants: "#3f3a36", boots: INK, hat: "cap", cap: "#5a4a3c", skin: "#f5c9a0", hair: "#a39a92", buttons: "#a99a84" };

// ---------------- the Romans of Pompeii (new look: gent + roman) ----------------
const TAN = "#ffe2c2";
export const ROMAN_BAKER: Outfit = { jacket: "#f1ede0", pants: "#f5c9a0", boots: "#7a5230", hat: "bakercap", cap: "#f6f3ea", moustache: "#4a3020", gent: true, roman: "baker", hem: 0.55, skin: "#f5c9a0" };
export const ROMAN_SOLDIER: Outfit = { jacket: "#c23a30", pants: "#f5c9a0", boots: "#6a4428", hat: "helmet", cap: "#aab3be", gent: true, roman: "soldier", hem: 0.52, skin: "#f5c9a0", moustache: "#3a2a1e", build: "stout" };
export const ROMAN_MERCHANT: Outfit = { jacket: "#7a2f4a", pants: TAN, boots: "#6a4428", hat: "hair", hair: "#5a3b2a", beard: "#6b4424", moustache: "#6b4424", dress: "#dcc58a", cloak: "#6a2540", gent: true, roman: "merchant", skin: "#ecd0b6" };
export const ROMAN_BOY: Outfit = { jacket: "#d9b87a", pants: TAN, boots: "#7a5230", hat: "hair", hair: "#4a3020", gent: true, roman: "boy", hem: 0.5, build: "kid" };
export const ROMAN_WOMAN: Outfit = { jacket: "#4f7f8c", pants: TAN, boots: "#7a5230", hat: "scarf", cap: "#e9d9b0", dress: "#b8584a", gent: true, roman: "woman" };
export const ROMAN_CROWD: Outfit[] = [
  { ...ROMAN_WOMAN, jacket: "#7a6aa8", dress: "#d9a85a", cap: "#efe3c4" },
  { ...ROMAN_BOY, jacket: "#c9754a", hair: "#2a1e18" },
  { ...ROMAN_BAKER, jacket: "#e6d9b8", cap: "#e9dcc0", moustache: "#2a1e18" },
  { ...ROMAN_WOMAN, jacket: "#a8564a", dress: "#6f8a5a", cap: "#d9c9a0" },
  { ...ROMAN_BOY, jacket: "#8fa86a", hair: "#6a4a2a", hem: 0.55 },
  { ...ROMAN_MERCHANT, jacket: "#4a6a8a", cloak: "#3a5470", dress: "#c9b27a", beard: undefined, hair: "#3a2a1e" },
  { ...ROMAN_WOMAN, jacket: "#c9a25a", dress: "#6a8aa8", cap: "#f1ead8" },
  { ...ROMAN_BAKER, jacket: "#d9c89a", cap: "#c9a25a", moustache: "#6a4a2a" },
  { ...ROMAN_BOY, jacket: "#b04a4a", hair: "#3a2a1e" },
  { ...ROMAN_WOMAN, jacket: "#5a8a6a", dress: "#c9754a", cap: "#e6d4a8" },
];
