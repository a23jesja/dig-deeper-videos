// The pen of the new cast: shapes with an ink line, flat two-tone shading, hatching, a tweed weave, and the small parts every design
// shares (eyes with lids and shine, hands with fingers, shoes, the monocle and its chain). No design lives here.
export type P2 = [number, number];
export const INK = "#241726";
/** the simplified surface, on trial (Jesper 18 Nov): flat colours with no weave, hatching or shaded edge, a thicker line, bigger eyes.
 *  Off unless a render asks for it (input prop `simple`, Root.tsx); the films keep the frozen look */
export const STYLE = { simple: false };
export const R = Math.PI / 180;
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
export const add = (a: P2, b: P2, k = 1): P2 => [a[0] + b[0] * k, a[1] + b[1] * k];
export const sub = (a: P2, b: P2): P2 => [a[0] - b[0], a[1] - b[1]];
export const len = (a: P2) => Math.hypot(a[0], a[1]);
export const unit = (a: P2): P2 => { const l = len(a) || 1; return [a[0] / l, a[1] / l]; };
export const mid = (a: P2, b: P2, t = 0.5): P2 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
export const rot = (p: P2, deg: number, c: P2 = [0, 0]): P2 => {
  const co = Math.cos(deg * R), si = Math.sin(deg * R), x = p[0] - c[0], y = p[1] - c[1];
  return [c[0] + x * co - y * si, c[1] + x * si + y * co];
};
export const angle = (a: P2, b: P2) => Math.atan2(b[1] - a[1], b[0] - a[0]) / R;
export const shift = (pts: P2[], dx: number, dy: number): P2[] => pts.map(([x, y]) => [x + dx, y + dy]);
/** k < 1 darkens, k > 1 lightens */
export const shade = (c: string, k: number) => {
  const n = parseInt(c.slice(1), 16), ch = (v: number) => clamp(Math.round(k <= 1 ? v * k : v + (255 - v) * (k - 1)), 0, 255).toString(16).padStart(2, "0");
  return `#${ch((n >> 16) & 255)}${ch((n >> 8) & 255)}${ch(n & 255)}`;
};
export const mix = (a: string, b: string, t: number) => {
  const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16);
  const ch = (s: number) => Math.round(((A >> s) & 255) * (1 - t) + ((B >> s) & 255) * t).toString(16).padStart(2, "0");
  return `#${ch(16)}${ch(8)}${ch(0)}`;
};

/** a smooth curve through the points (Catmull-Rom) */
export const spline = (pts: P2[], closed = true, n = 6): P2[] => {
  const N = pts.length, out: P2[] = [], at = (i: number) => (closed ? pts[(i + N) % N] : pts[clamp(i, 0, N - 1)]);
  for (let i = 0; i < (closed ? N : N - 1); i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    for (let k = 0; k < n; k++) {
      const t = k / n, t2 = t * t, t3 = t2 * t, f = (a: number, b: number, c: number, d: number) => 0.5 * (2 * b + (c - a) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (3 * b - a - 3 * c + d) * t3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  if (!closed) out.push(pts[N - 1]);
  return out;
};
/** a contour given as its right half, from the bottom centre up to the top centre */
export const sym = (half: P2[]): P2[] => [...half, ...half.filter((p) => Math.abs(p[0]) > 0.01).map(([x, y]) => [-x, y] as P2).reverse()];
export const ellPts = (cx: number, cy: number, rx: number, ry: number, rotDeg = 0, a0 = 0, a1 = 360, n = 36): P2[] => {
  const pts: P2[] = [];
  for (let i = 0; i <= n; i++) { const a = (a0 + ((a1 - a0) * i) / n) * R; pts.push(rot([cx + rx * Math.cos(a), cy + ry * Math.sin(a)], rotDeg, [cx, cy])); }
  return pts;
};
/** a tapered piece of a limb from a to b: half-width wa at a and wb at b, with a swelling (a calf, a forearm) at `at`.
 *  flat = straight cut edges and square ends (the woodcut and the card puppet) */
export const seg = (a: P2, b: P2, wa: number, wb: number, bulge = 0, at = 0.35, flat = false): P2[] => {
  const d = sub(b, a), u = unit(d), nr: P2 = [-u[1], u[0]], n = flat ? (bulge ? 2 : 1) : 8, lf: P2[] = [], rt: P2[] = [];
  for (let i = 0; i <= n; i++) {
    const t = flat && bulge && i === 1 ? at : i / n, w = lerp(wa, wb, t) + bulge * Math.exp(-(((t - at) / 0.3) ** 2)), c = add(a, d, t);
    lf.push(add(c, nr, w)); rt.push(add(c, nr, -w));
  }
  if (flat) return [...lf, ...rt.reverse()];
  const capB: P2[] = [], capA: P2[] = [];
  for (let k = 1; k < 6; k++) { const q = (k / 6) * Math.PI; capB.push(add(add(b, nr, wb * Math.cos(q)), u, wb * Math.sin(q))); capA.push(add(add(a, nr, -wa * Math.cos(q)), u, -wa * Math.sin(q))); }
  return [...lf, ...capB, ...rt.reverse(), ...capA];
};

export class Ink {
  g: CanvasRenderingContext2D; ol: number; ink = INK;
  /** thick = how much heavier the simplified line is (fingers drawn over a held thing take less: they lie over a hand already outlined) */
  constructor(g: CanvasRenderingContext2D, ol = 9, thick = 1.8) { this.g = g; this.ol = STYLE.simple ? ol * thick : ol; }
  /** places the drawing has noted while it was drawn (an eye, say), in canvas pixels: so that the stage can put a real thing there */
  marks: Record<string, P2> = {};
  mark(name: string, x: number, y: number) { const m = this.g.getTransform(); this.marks[name] = [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f]; }
  trace(pts: P2[], close = true) { const g = this.g; pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); if (close) g.closePath(); }
  /** a filled shape with an ink line; fill = null draws the line only, ol = 0 the fill only */
  shape(pts: P2[], fill: string | null, ol = this.ol) {
    const g = this.g; g.beginPath(); this.trace(pts);
    if (fill) { g.fillStyle = fill; g.fill(); }
    if (ol) { g.lineWidth = ol; g.strokeStyle = this.ink; g.lineJoin = "round"; g.stroke(); }
  }
  line(pts: P2[], w: number, col = this.ink, cap: CanvasLineCap = "round") {
    const g = this.g; g.beginPath(); this.trace(pts, false); g.lineCap = cap; g.lineJoin = "round"; g.lineWidth = w; g.strokeStyle = col; g.stroke();
  }
  /** several pieces as one shape: the ink goes under all of them, so no line shows where they overlap */
  group(pieces: P2[][], fill: string, ol = this.ol) {
    const g = this.g; g.lineJoin = "round"; g.strokeStyle = this.ink; g.lineWidth = ol * 1.7;
    if (ol) for (const q of pieces) { g.beginPath(); this.trace(q); g.stroke(); }
    g.fillStyle = fill; for (const q of pieces) { g.beginPath(); this.trace(q); g.fill(); }
  }
  dot(x: number, y: number, r: number, col = this.ink) { const g = this.g; g.beginPath(); g.arc(x, y, r, 0, 7); g.fillStyle = col; g.fill(); }
  clip(pts: P2[], fn: () => void) { const g = this.g; g.save(); g.beginPath(); this.trace(pts); g.clip(); fn(); g.restore(); }
  /** the second tone: the strip of a shape on the side away from the light (dx, dy = which way the shadow lies and how wide) */
  shadeEdge(pts: P2[], col: string, dx: number, dy: number) {
    if (STYLE.simple) return; const g = this.g; g.save(); g.beginPath(); this.trace(pts); g.clip();
    g.beginPath(); g.rect(-4000, -4000, 8000, 8000); this.trace(shift(pts, -dx, -dy)); g.fillStyle = col; g.fill("evenodd"); g.restore();
  }
  /** draw in a turned and possibly mirrored frame */
  at(x: number, y: number, deg: number, flip: boolean, fn: () => void) { const g = this.g; g.save(); g.translate(x, y); g.rotate(deg * R); if (flip) g.scale(-1, 1); fn(); g.restore(); }
  /** parallel cut lines inside a shape (woodcut shadow) */
  hatch(pts: P2[], deg: number, gap: number, w: number, col = this.ink, c0?: P2) {
    if (STYLE.simple) return;
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    for (const [x, y] of pts) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    const c: P2 = c0 ?? [(x0 + x1) / 2, (y0 + y1) / 2], r = Math.hypot(x1 - x0, y1 - y0) / 2 + gap + (c0 ? len(sub(c0, [(x0 + x1) / 2, (y0 + y1) / 2])) : 0);
    const u: P2 = [Math.cos(deg * R), Math.sin(deg * R)], n: P2 = [-u[1], u[0]];
    this.clip(pts, () => { for (let d = -Math.ceil(r / gap) * gap; d <= r; d += gap) this.line([add(add(c, n, d), u, -r), add(add(c, n, d), u, r)], w, col, "butt"); });
  }
  /** a herringbone weave inside a shape, laid from the point o along the direction deg so that it moves with the part it sits on */
  tweed(pts: P2[], col: string, o: P2, deg = 0, gap = 15, w = 2.6) {
    if (STYLE.simple) return; const g = this.g; let r = 0; for (const p of pts) r = Math.max(r, len(sub(p, o)));
    this.clip(pts, () => {
      g.save(); g.translate(o[0], o[1]); g.rotate(deg * R); g.beginPath();
      const cw = gap * 1.25, n = Math.ceil(r / cw) + 1, m = Math.ceil(r / gap) + 1;
      for (let i = -n; i < n; i++) for (let k = -m; k <= m; k++) { g.moveTo(i * cw, k * gap); g.lineTo((i + 1) * cw, k * gap + (i & 1 ? cw : -cw) * 0.8); }
      g.lineWidth = w; g.strokeStyle = col; g.lineCap = "butt"; g.stroke(); g.restore();
    });
  }
}

// ---------------- eyes ----------------
/** gaze = where the eye looks (-1..1 right, -1..1 down); lid = how far the upper lid is down (0 open, 1 shut); low = the lower lid up;
 *  flat = a cut-paper eye (no line round the ball) */
export type EyeO = { gaze?: P2; lid?: number; low?: number; skin: string; iris?: number; ol?: number; lash?: number; white?: string; rotDeg?: number };
export const eye = (k: Ink, cx: number, cy: number, rx: number, ry: number, o: EyeO) => {
  if (STYLE.simple) { rx *= 1.38; ry *= 1.38; o = { ...o, iris: (o.iris ?? 0.56) * 1.08 }; }
  const ball = ellPts(cx, cy, rx, ry, o.rotDeg ?? 0), ol = o.ol ?? k.ol * 0.55, gz = o.gaze ?? [0, 0], lid = o.lid ?? 0.1, low = o.low ?? 0;
  k.shape(ball, o.white ?? "#fffdf4", 0);
  k.clip(ball, () => {
    const r = Math.min(rx, ry) * (o.iris ?? 0.56), px = cx + gz[0] * (rx - r * 0.72), py = cy + gz[1] * (ry - r * 0.72) + ry * 0.06;
    k.dot(px, py, r);
    k.dot(px - r * 0.36, py - r * 0.4, r * 0.36, "#ffffff"); k.dot(px + r * 0.4, py + r * 0.36, r * 0.15, "#ffffff");
    if (lid > 0.01) {
      const y = cy - ry + 2 * ry * lid, edge = spline([[cx - rx - 3, y - ry * 0.16], [cx, y + ry * 0.08], [cx + rx + 3, y - ry * 0.16]], false, 8);
      k.shape([[cx - rx - 3, cy - ry - 4], [cx + rx + 3, cy - ry - 4], ...edge.slice().reverse()], o.skin, 0);
      k.line(edge, o.lash ?? k.ol * 0.8);
    }
    if (low > 0.01) {
      const y = cy + ry - 2 * ry * low, edge = spline([[cx - rx - 3, y + ry * 0.14], [cx, y - ry * 0.08], [cx + rx + 3, y + ry * 0.14]], false, 8);
      k.shape([[cx - rx - 3, cy + ry + 4], [cx + rx + 3, cy + ry + 4], ...edge.slice().reverse()], o.skin, 0);
      k.line(edge, ol);
    }
  });
  if (ol) k.shape(ball, null, ol);
  if (lid < 0.95) k.line(ellPts(cx, cy, rx, ry, o.rotDeg ?? 0, 198, 342, 12), o.lash ?? k.ol * 0.8);
};

// ---------------- hands ----------------
export type HandKind = "relaxed" | "open" | "fist" | "point" | "grip" | "two";
/** a hand at the wrist, fingers along `deg`; thumbFlip puts the thumb on the other side; cut = straight-edged (woodcut, card) */
/** layer = "fingers": only the four closed fingers of a hand that holds something, without the heel of the hand and the thumb. The
 *  stage draws them on a card of their own in front of the thing held, so that the thing lies between the palm and the fingers */
export const hand = (k: Ink, wrist: P2, deg: number, h: number, kind: HandKind, col: string, thumbFlip: boolean, cut = false, ol = k.ol, layer: "all" | "fingers" = "all") => {
  const S = (pts: P2[]) => pts.map(([x, y]) => [x * h, y * h] as P2), body = (pts: P2[]) => (cut ? S(pts) : spline(S(pts), true, 5));
  const fin = (x: number, y: number, a: number, l: number, w0 = 0.085, w1 = 0.07) => seg([x * h, y * h], [(x + l * Math.cos(a * R)) * h, (y + l * Math.sin(a * R)) * h], w0 * h, w1 * h, 0, 0.3, cut);
  const g = k.g; g.save(); g.translate(wrist[0], wrist[1]); g.rotate(deg * R); if (thumbFlip) g.scale(1, -1);
  const thin = ol * 0.5;
  if (layer === "fingers") {
    k.group([body([[0.22, -0.33], [0.42, -0.36], [0.62, -0.34], [0.76, -0.12], [0.74, 0.18], [0.52, 0.35], [0.36, 0.35], [0.22, 0.31]])], col, ol);
    for (const y of [-0.16, 0.0, 0.16]) k.line([[0.34 * h, y * h], [0.74 * h, (y + 0.02) * h]], thin);
    k.group([fin(0.26, 0.3, -30, 0.36, 0.105, 0.09)], col, ol * 0.6);      // the thumb, laid over the fingers on the near side
  } else if (kind === "open") {
    const palm = body([[0, -0.22], [0.28, -0.33], [0.5, -0.33], [0.56, 0], [0.5, 0.3], [0.28, 0.32], [0, 0.22]]);
    k.group([fin(0.46, -0.25, -20, 0.44), fin(0.5, -0.09, -7, 0.52), fin(0.5, 0.08, 6, 0.48), fin(0.45, 0.23, 20, 0.38, 0.08, 0.065), fin(0.16, 0.22, 62, 0.4, 0.1, 0.085), palm], col, ol);
  } else if (kind === "relaxed" && Math.abs((((deg - 90) % 360) + 540) % 360 - 180) < 38) {
    // a hand at rest hanging down: seen edge on, its palm to the thigh, the fingers loosely curled in at the tip and the thumb laid along
    // the front (the review of round 2: hanging, the mitten showed its palm to the lens with the thumb spread, stiff)
    const side = body([[0, -0.15], [0.3, -0.19], [0.62, -0.17], [0.8, -0.07], [0.83, 0.07], [0.7, 0.16], [0.34, 0.18], [0, 0.15]]);
    k.group([side, fin(0.16, 0.12, 26, 0.3, 0.09, 0.075)], col, ol);
    k.line(spline([[0.58 * h, -0.15 * h], [0.7 * h, -0.02 * h], [0.62 * h, 0.12 * h]], false, 5), thin);
  } else if (kind === "relaxed") {
    const mit = body([[0, -0.22], [0.32, -0.32], [0.72, -0.3], [0.97, -0.17], [1.0, 0.04], [0.86, 0.23], [0.4, 0.3], [0, 0.22]]);
    k.group([fin(0.2, 0.2, 48, 0.36, 0.115, 0.09), mit], col, ol);
    for (const y of [-0.16, -0.02, 0.12]) k.line([[0.66 * h, y * h], [0.93 * h, (y + 0.015) * h]], thin);
  } else {
    const fist = body([[0, -0.22], [0.3, -0.35], [0.62, -0.34], [0.76, -0.12], [0.74, 0.18], [0.52, 0.35], [0.2, 0.33], [0, 0.22]]);
    const pieces = [fist]; if (kind === "point") pieces.unshift(fin(0.58, -0.22, 0, 0.6, 0.1, 0.08));
    // two fingers up (counting two), a little apart: the first and the middle finger
    if (kind === "two") pieces.unshift(fin(0.58, -0.24, -8, 0.6, 0.1, 0.08), fin(0.62, -0.06, 6, 0.58, 0.1, 0.08));
    k.group(pieces, col, ol);
    k.group([fin(0.3, 0.3, -32, 0.34, 0.1, 0.09)], col, ol * 0.5);
    for (const y of [-0.12, 0.02, 0.15]) k.line([[0.6 * h, y * h], [0.74 * h, (y + 0.02) * h]], thin);
  }
  g.restore();
};

// ---------------- monocle and chain ----------------
export const MONO_FRAME = 5.6, GOLD = "#e9b93a";
/** the monocle: glass with a streak of shine, a gold frame; returns nothing, the chain is drawn by `chain` */
export const monocle = (k: Ink, cx: number, cy: number, rx: number, ry: number, fw = MONO_FRAME, gold = GOLD) => {
  const ring = ellPts(cx, cy, rx, ry), g = k.g;
  k.clip(ring, () => { g.globalAlpha = 0.22; k.shape(ring, "#bfe6f2", 0); g.globalAlpha = 0.75; k.line([[cx - rx * 0.55, cy + ry * 0.1], [cx - rx * 0.1, cy - ry * 0.6]], rx * 0.16, "#ffffff"); g.globalAlpha = 1; });
  k.shape(ring, null, fw + 4.5); const ink = k.ink; k.ink = gold; k.shape(ring, null, fw); k.ink = ink;
};
/** the chain: a third as thick as the frame, from the frame's lower outer edge in a soft bow to the lapel */
export const chain = (k: Ink, a: P2, b: P2, bow: P2, fw = MONO_FRAME, gold = GOLD) => {
  const pts = spline([a, bow, b], false, 10);
  k.line(pts, fw / 3 + 2.2); k.line(pts, fw / 3, gold);
};
