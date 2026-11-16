// The cast (step B): the jointed card figure Jesper chose, drawn so that it turns. Every part of the face, the hat and the clothes sits
// at an angle round the head or body and is projected by the view angle, so front, three-quarter, side and back come out of one drawing,
// equally tall and wide, with no jump between them. A figure is a Look (sizes, colours, hat, clothes) on the shared skeleton (rig.ts):
// Sir Digsworth and every side character are Looks of this one base, so a new figure for any era needs no new drawing code.
// Card pieces cast a small shadow on the piece under them and are held by brass pins at the joints; the jaw is a piece that drops.
import { Ink, P2, R, sym, spline, ellPts, seg, mid, shade, shift, clamp, lerp, hand, angle, len, sub, add, unit, chain } from "./ink";
import { Sk, Side, Props, Joint, Pose, solve } from "./rig";
import { FigOpts, Face, frame, shoePts, thumbFlip, loaf, cane } from "./designs/common";

export type Look = {
  id: string; P: Props;
  /** the head: half-width across the ears, half-depth nose to nape, height chin to crown */
  /** jaw = width of the jaw (1 = square, 0.75 = narrow), round = how rounded the skull is (0 = boxy, 1 = a child's round head), eye = size of the eyes (1 = normal) */
  head: { a: number; b: number; H: number; jaw?: number; round?: number; eye?: number };
  skin: string; brow: string;
  /** cap = tweed flat cap, helmet = Roman, greathelm = a knight's bucket helm, brodie = the steel helmet of 1916, boater / tophat = brimmed hats, band = a headband */
  hat: "cap" | "helmet" | "greathelm" | "brodie" | "boater" | "tophat" | "tricorn" | "band" | "none"; hatCol?: string; hatBand?: string;
  /** width of the brim of a brimmed hat (1 = as drawn; a white brodie with a small brim is a mob cap) */
  brim?: number;
  /** short = hair on top and behind, bald = a wreath at the sides, back = only behind (under a hat), bun = on top with a knot behind */
  hair?: { col: string; kind: "short" | "bald" | "back" | "bun" | "queue" };
  lash?: boolean; lips?: string;
  /** moustache: colour, how far the tips reach (in head half-widths), how far they turn up, thickness at the root */
  mous?: { col: string; span: number; curl: number; w: number }; beard?: string;
  monocle?: boolean; pipe?: boolean;
  /** jacket = lapels over a waistcoat (plain = buttoned to the neck, as a uniform or a work jacket); tunic = one garment whose length is its rows
   *  (a short tunic, a long robe, a dress to the ground with skirt = true) */
  top: "jacket" | "tunic"; plain?: boolean; skirt?: boolean; coat: string; accent: string; weave?: boolean; emblem?: "cross"; armCol?: string;
  /** torso rows [height above the pelvis, half-width from the front, depth in front of the spine, depth behind] from the hem up */
  rows: number[][];
  armour?: boolean; apron?: string; cloak?: string; belt?: string;
  legs: "trousers" | "bare"; trous?: string; feet: "shoes" | "sandals" | "boots"; spats?: boolean; sleeve: "long" | "short";
  /** knee breeches: the colour of the stockings below the knee; buckle = a buckle on the shoe */
  stockings?: string; buckle?: boolean; cuffs?: string;
  /** half-widths of arm and leg at root, joint and end */
  arm: number[]; leg: number[];
};
export const LINE = "#33241b", BRASS = "#e7bb48", CREAM = "#fbf3df";
const WEAVE = "rgba(96,60,22,0.36)", MOUTH = "#4a1a22";

/** a piece of card: its shadow on what lies under it, then the card with a thin line */
const piece = (k: Ink, pts: P2[], fill: string, weave?: P2, tilt = 0) => {
  k.shape(shift(pts, 5, 6), "rgba(52,32,16,0.24)", 0); k.shape(pts, fill, 0); if (weave) k.tweed(pts, WEAVE, weave, tilt, 14, 2.4); k.shape(pts, null);
};
const pin = (k: Ink, p: P2, r = 8) => { k.dot(p[0] + 2, p[1] + 2.5, r, "rgba(52,32,16,0.28)"); k.dot(p[0], p[1], r, "#7d5f1a"); k.dot(p[0], p[1], r - 1.8, BRASS); k.dot(p[0] - r * 0.3, p[1] - r * 0.3, r * 0.28, "#fff4c4"); };
/** a tapered ribbon along a line of points (a moustache half, a crest): half-widths per point */
export const ribbon = (pts: P2[], w: number[]): P2[] => {
  const c = spline(pts, false, 5), n = c.length, lf: P2[] = [], rt: P2[] = [];
  for (let i = 0; i < n; i++) {
    const a = c[Math.max(0, i - 1)], b = c[Math.min(n - 1, i + 1)], u = unit(sub(b, a)), nr: P2 = [-u[1], u[0]], t = (i / (n - 1)) * (w.length - 1), j = Math.min(w.length - 2, Math.floor(t)), ww = lerp(w[j], w[j + 1], t - j);
    lf.push(add(c[i], nr, ww)); rt.push(add(c[i], nr, -ww));
  }
  return [...lf, ...rt.reverse()];
};

/** the outline round a set of points (a peak or a nose that folds over itself when seen from the side) */
export const hull = (pts: P2[]): P2[] => {
  const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o: P2, a: P2, b: P2) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo: P2[] = [], up: P2[] = [];
  for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (const q of p.slice().reverse()) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
  return [...lo.slice(0, -1), ...up.slice(0, -1)];
};

// ---------------- the head that turns ----------------
type HG = { a: number; b: number; H: number; sin: number; cos: number; w: number };
/** a point of the head given by where it sits (X to the figure's left, Z forward): its place on the card and its depth toward the lens */
const p3 = (h: HG, X: number, Z: number) => ({ x: X * h.cos + Z * h.sin, d: Z * h.cos - X * h.sin });
/** a point on the head's surface at an angle round it (0 = nose, 90 = the figure's left ear, 180 = nape); rho < 1 sits inside the outline */
const at = (h: HG, az: number, rho = 1) => p3(h, h.a * Math.sin(az * R) * rho, h.b * Math.cos(az * R) * rho);

/** the tweed cap: a flat crown wider than the skull, the peak as wide as the cap and joined to its lower edge.
 *  stage: behind = only what lies behind the skull (the peak, seen from the back), front = the rest */
const capDraw = (k: Ink, L: Look, h: HG, lift: number, away: boolean, stage: "behind" | "front" | "both") => {
  const { a, b, H, w } = h, yb = -0.87 * H, capX = -0.1 * b * h.sin, col = L.hatCol ?? "#b58a4c", wc = 1.2 * w;
  const peak = () => {
    const inn: P2[] = [], out: P2[] = [];
    for (let az = -72; az <= 72; az += 12) { const c = Math.cos((az * 90 / 72) * R), q = p3(h, 1.16 * a * Math.sin(az * R), 1.16 * b * Math.cos(az * R)), q2 = p3(h, (1.16 * a + 0.2 * a * c) * Math.sin(az * R), (1.16 * b + 0.5 * a * c) * Math.cos(az * R)); inn.push([q.x + capX, yb - 0.035 * H]); out.push([q2.x + capX, yb + 0.015 * H + 0.03 * H * c]); }
    piece(k, hull([...inn, ...out]), shade(col, 0.74));
  };
  if (stage !== "front" && away) peak();
  if (stage === "behind") return;
  k.g.save(); k.g.translate(-lift * 16 * h.sin, -lift * 0.2 * H); k.g.translate(capX, yb); k.g.rotate((6 * h.sin - lift * 10 * h.sin) * R); k.g.translate(-capX, -yb);
  const crown = spline(([[-wc, 0], [-1.07 * wc, -0.13 * H], [-0.72 * wc, -0.31 * H], [0, -0.35 * H], [0.74 * wc, -0.31 * H], [1.07 * wc, -0.13 * H], [wc, 0], [0, 0.035 * H]] as P2[]).map(([x, y]) => [x + capX, y + yb] as P2), true, 5);
  piece(k, crown, col, [capX, yb - 0.2 * H]);
  if (L.hatBand) k.clip(crown, () => { k.shape([[-2 * wc, yb - 0.075 * H], [2 * wc, yb - 0.075 * H], [2 * wc, yb + 0.05 * H], [-2 * wc, yb + 0.05 * H]], L.hatBand!, k.ol * 0.8); });
  k.shape(crown, null);
  if (!away) peak();
  pin(k, [capX, yb - 0.345 * H], 6);
  k.g.restore();
};
const headGeo = (L: Look, phiDeg: number): HG => { const { a, b, H } = L.head, phi = phiDeg * R; return { a, b, H, sin: Math.sin(phi), cos: Math.cos(phi), w: Math.hypot(a * Math.cos(phi), b * Math.sin(phi)) }; };
/** a figure's hat by itself, lying or flying: its middle at the origin, seen from the angle phi */
export const drawHat = (k: Ink, L: Look, phiDeg: number) => {
  const ink0 = k.ink; k.ink = LINE; k.g.save(); k.g.translate(0, 1.02 * L.head.H);
  if (L.hat === "cap") capDraw(k, L, headGeo(L, phiDeg), 0, Math.cos(phiDeg * R) < -0.3, "both");
  k.g.restore(); k.ink = ink0;
};

const drawHead = (k: Ink, L: Look, phiDeg: number, f: Face, o: FigOpts) => {
  const HAT = o.hatOff ? "none" : L.hat;
  const { a, b, H } = L.head, phi = phiDeg * R, h: HG = { a, b, H, sin: Math.sin(phi), cos: Math.cos(phi), w: Math.hypot(a * Math.cos(phi), b * Math.sin(phi)) }, w = h.w;
  // away = seen from behind. The limit lies well past the profile, so that the small turns of the head in a walk seen from the side never flip the face parts behind the skull
  const m = f.mouth ?? 0, away = h.cos < -0.3, skin = L.skin, skinD = shade(skin, 0.86);
  // the skull card: square-jawed from the front; from the side it gets a chin and a brow in front, a rounded back and a narrow nape
  const jw = L.head.jaw ?? 1, rd = L.head.round ?? 0.3, sa = Math.abs(h.sin), fr = h.sin >= 0 ? 1 : -1, EY = L.head.eye ?? 1;
  const prof = (side: number): P2[] => {
    const fv = [0.7 * jw - 0.2 * rd, jw - 0.08 * rd, 1.01, 1 - 0.08 * rd, 0.74 - 0.22 * rd], sv = side === fr ? [0.6, 1.05, 0.94, 0.99, 0.7] : [0.3, 0.62, 1.04, 1.0, 0.64];
    return [6, -0.11 * H, -0.5 * H, -0.82 * H, -0.975 * H].map((y, j) => [side * w * lerp(fv[j], sv[j], sa), y] as P2);
  };
  const skull = spline([[0, 6], ...prof(1), [0, -H], ...prof(-1).reverse()], true, 5);
  const nose0 = at(h, 0), yEye = -0.61 * H, yM = -0.3 * H;
  // --- parts that lie behind the skull card ---
  const mousHalf = (s: number) => {
    if (!L.mous) return; const M = L.mous, r = M.span * a;
    // From the front and from behind the two halves spread to the sides. From the side the near half sweeps back across the cheek
    // to its curled tip and the far half shows as a waxed point out in front of the face, so the same moustache reads in profile.
    const G = ([[0, 0, b * 1.0], [0.3 * a, 2, b * 0.98], [0.62 * r, 7, b * 0.74], [0.86 * r, 6, b * 0.5], [0.98 * r, -8 * M.curl, b * 0.38], [0.97 * r, -30 * M.curl, b * 0.36]] as number[][]).map(([X, y, Z]) => [p3(h, s * X, Z).x, yM + y] as P2);
    const dirx = h.sin >= 0 ? 1 : -1, nearHalf = s * dirx < 0, k2 = M.span / 1.24;
    const S = (nearHalf ? [[0.97, 0], [0.74, 7], [0.42, 10], [0.12, 2], [-0.02, -16 * M.curl], [0.06, -34 * M.curl]] : [[0.97, 0], [1.1, 4], [1.26, 1], [1.38, -9 * M.curl], [1.4, -24 * M.curl], [1.34, -34 * M.curl]]).map(([x, y]) => [dirx * b * (0.97 + (x - 0.97) * k2), yM + y] as P2);
    const q = Math.abs(h.sin) ** 2 * (h.cos > -0.3 ? 1 : 0), P = G.map((g, n) => [lerp(g[0], S[n][0], q), lerp(g[1], S[n][1], q)] as P2);
    piece(k, ribbon(P, [M.w, M.w, M.w * 0.88, M.w * 0.66, M.w * 0.42, M.w * 0.18]), M.col);
  };
  const pipe = () => {
    if (!L.pipe) return; const r0 = at(h, 30), t = p3(h, a * 0.5 + a * 0.62, b * 0.86 + a * 0.5), y0 = -0.2 * H + 0.09 * H * m, y1 = y0 + 0.11 * H;
    piece(k, seg([r0.x, y0], [t.x, y1], 5, 5, 0, 0.3, true), "#3a2618");
    piece(k, [[t.x - 15, y1 - 34], [t.x + 15, y1 - 34], [t.x + 12, y1 + 7], [t.x - 12, y1 + 7]], "#8a4f2a");
    return t.d;
  };
  const ear = (s: number) => { const e = at(h, s * 90); return { e, draw: () => piece(k, ellPts(e.x, -0.5 * H, 0.17 * a, 0.12 * H), skinD) }; };
  const ears = [ear(-1), ear(1)];
  const tipBehind = L.pipe ? p3(h, a * 1.12, b * 0.86 + a * 0.5).d < -0.15 * b : false;
  if (tipBehind) pipe();
  if (away) { mousHalf(-1); mousHalf(1); }
  for (const e of ears) if (Math.abs(e.e.d) < 0.55 * a) e.draw();
  // the peak of the cap hides behind the head when he faces away
  if (HAT === "cap") capDraw(k, L, h, o.capLift ?? 0, away, "behind");
  // --- the skull, the hair on it ---
  if (L.hair?.kind === "bun") { const q = at(h, 180, 1.0); piece(k, ellPts(q.x, -0.9 * H, 0.42 * a, 0.2 * H), L.hair.col); }
  const queue = () => { const q = at(h, 180, 1.0), dx = -0.16 * b * h.sin; piece(k, seg([q.x, -0.3 * H], [q.x + dx, 0.2 * H], 0.11 * a, 0.045 * a), L.hair!.col); piece(k, seg([q.x + dx * 0.1, -0.27 * H], [q.x + dx * 0.24, -0.19 * H], 0.13 * a, 0.13 * a, 0, 0.3, true), "#2a2220"); };
  if (L.hair?.kind === "queue" && h.cos > -0.3) queue();
  piece(k, skull, skin);
  if (L.hair) {
    // the hairline runs from the top of the brow back behind the ear down to the nape, so the hair follows the head in every view
    const tailed = L.hair.kind === "queue", kind = tailed || (o.hatOff && L.hair.kind === "back") ? "short" : L.hair.kind, y0 = kind === "bald" ? -0.72 * H : -1.03 * H, patches: P2[][] = [];
    for (const half of [0, 1]) {
      const rowsH: number[][] = [];
      for (let q = 0; q <= 8; q++) {
        const y = lerp(y0, -0.27 * H, q / 8), edge = lerp(kind === "bald" ? 100 : kind === "back" ? 108 : 86, 152, q / 8), xs: number[] = [];
        for (let az = half ? 180 : edge; az <= (half ? 360 - edge : 180); az += 4) { const pt = at(h, az, 1.03); if (pt.d > -0.03 * b) xs.push(pt.x); }
        if (xs.length) rowsH.push([y, Math.min(...xs) - (Math.min(...xs) < -0.84 * w ? 40 : 0), Math.max(...xs) + (Math.max(...xs) > 0.84 * w ? 40 : 0)]);
      }
      if (rowsH.length > 1) patches.push([...rowsH.map(([y, x0]) => [x0 - (half ? 3 : 0), y] as P2), ...rowsH.map(([y, , x1]) => [x1 + (half ? 0 : 3), y] as P2).reverse()]);
    }
    k.clip(skull, () => {
      const all = kind === "short" || kind === "bun" ? [...patches, [[-2 * w, -1.2 * H], [2 * w, -1.2 * H], [2 * w, -0.78 * H], [0, -0.75 * H], [-2 * w, -0.78 * H]] as P2[]] : patches;
      if (all.length) k.group(all, L.hair!.col, k.ol * 0.7);
    });
  }
  if (L.hair?.kind === "queue" && h.cos <= -0.3) queue();
  // --- the face (not drawn from behind) ---
  if (!away || h.cos > -0.3) {
    const vis = nose0.d > -0.3 * b;
    // the jaw is its own card: it slides down over a dark card when he speaks
    if (vis && m > 0.04) { const c = at(h, 0, 0.5).x; k.clip(skull, () => { k.shape([[c - 0.5 * w, -0.24 * H], [c + 0.5 * w, -0.24 * H], [c + 0.44 * w, -0.1 * H + 0.1 * H * m], [c - 0.44 * w, -0.1 * H + 0.1 * H * m]], MOUTH, 0); k.shape(ellPts(c, -0.1 * H + 0.07 * H * m, 0.24 * w, 0.045 * H), "#e0707a", 0); }); }
    const dy = 0.1 * H * m, low: P2[] = [[-2 * w, -0.19 * H + dy], [2 * w, -0.19 * H + dy], [2 * w, 60 + dy], [-2 * w, 60 + dy]];
    k.clip(shift(skull, 0, dy), () => { k.shape(shift(low, 0, 6), "rgba(52,32,16,0.2)", 0); k.shape(low, shade(skin, 0.965)); });
    if (m > 0.04) k.clip(low, () => k.shape(shift(skull, 0, dy), null));
    if (vis) { const sm = f.smile ?? 0.25, xl = at(h, -30, 0.7).x, xr = at(h, 30, 0.7).x, ym = -0.19 * H + dy; k.clip(shift(skull, 0, dy), () => k.line(spline([[xl, ym - sm * 0.055 * H], [lerp(xl, xr, 0.25) + h.sin * 0.05 * a, ym + sm * 0.012 * H], [lerp(xl, xr, 0.75) + h.sin * 0.05 * a, ym + sm * 0.012 * H], [xr, ym - sm * 0.055 * H]], false, 6), 4.6)); }
    if (L.lips && vis) { const q = at(h, 0, 0.72); piece(k, ellPts(q.x, -0.215 * H + 0.1 * H * m, 0.2 * a * Math.max(0.35, Math.abs(h.cos)), 0.032 * H), L.lips); }
    if (L.beard) { const xs: P2[] = []; for (let az = -100; az <= 100; az += 20) { const q = at(h, az, 1.04); if (q.d > -0.1 * b) xs.push([q.x, -0.32 * H + 0.1 * H * m * 0.5]); } if (xs.length > 1) { const lo = xs.map(([x], i) => [x * 0.92, 0.2 * H * (1 - Math.abs(i / (xs.length - 1) - 0.5) * 1.2) + 0.1 * H * m] as P2).reverse(); piece(k, spline([...xs, ...lo], true, 4), L.beard); } }
    if (!tipBehind) pipe();
    const eye = (s: number) => {
      const q = at(h, s * 26, 0.8); if (q.d < 0.1 * b) return;
      const fs = clamp(Math.cos(s * 26 * R + phi), 0.42, 1) ** 0.85, r = 0.29 * a * EY, rx = r * fs, ry = r * (1 + 0.16 * (f.wide ?? 0)), ball = ellPts(q.x, yEye, rx, ry), gz = f.gaze ?? [0, 0], lid = f.lid ?? 0.16;
      k.shape(ball, "#fffdf6");
      k.clip(ball, () => {
        const px = q.x + gz[0] * rx * 0.5 + h.sin * rx * 0.22, py = yEye + gz[1] * ry * 0.5; k.shape(ellPts(px, py, rx * 0.5, ry * 0.5), "#2a1f1a", 0); k.dot(px - rx * 0.17, py - ry * 0.2, r * 0.13, "#ffffff");
        if (lid > 0.01) { const y = yEye - ry + 2 * ry * lid; k.shape([[q.x - rx - 2, yEye - ry - 2], [q.x + rx + 2, yEye - ry - 2], [q.x + rx + 2, y], [q.x - rx - 2, y]], shade(skin, 0.86), 0); k.line([[q.x - rx - 2, y], [q.x + rx + 2, y]], 4, LINE, "butt"); }
      });
      k.shape(ball, null);
      if (L.lash) for (const j of [0, 1]) k.line([[q.x + s * rx * (0.7 + 0.25 * j) * (h.cos > 0.3 ? 1 : 0.4), yEye - ry * (0.75 - 0.3 * j)], [q.x + s * rx * (1.05 + 0.3 * j) * (h.cos > 0.3 ? 1 : 0.4), yEye - ry * (1.1 - 0.35 * j)]], 3.4);
      if (L.monocle && s < 0) { const ring = ellPts(q.x, yEye, Math.max(rx * 1.36, ry * 1.02), ry * 1.34); k.clip(ring, () => { k.g.globalAlpha = 0.2; k.shape(ring, "#bfe6f2", 0); k.g.globalAlpha = 0.8; k.line([[q.x - rx * 0.7, yEye + ry * 0.2], [q.x - rx * 0.1, yEye - ry * 0.8]], rx * 0.2, "#ffffff"); k.g.globalAlpha = 1; }); k.shape(ring, null, 12.5); const i = k.ink; k.ink = BRASS; k.shape(ring, null, 7.5); k.ink = i; }
      // the brow is its own piece: up for surprise, down toward the nose for a frown
      const bi = at(h, s * 9, 0.8), bo = at(h, s * 44, 0.8), by = yEye - ry - 0.05 * H, bw = f.brow ?? 0, th = 0.034 * H;
      const yi = by - 0.014 * H - 0.055 * H * Math.max(bw, 0) + 0.045 * H * Math.max(-bw, 0), yo = by + 0.008 * H - 0.04 * H * Math.max(bw, 0) - 0.022 * H * Math.max(-bw, 0);
      piece(k, [[bi.x, yi], [(bi.x + bo.x) / 2, (yi + yo) / 2 - 0.012 * H], [bo.x, yo], [bo.x, yo + th * 0.8], [(bi.x + bo.x) / 2, (yi + yo) / 2 - 0.012 * H + th], [bi.x, yi + th]], L.brow);
    };
    const far = h.sin >= 0 ? 1 : -1;
    if (vis) eye(far);
    if (!away) { mousHalf(far); mousHalf(-far); if (L.mous && h.cos > 0.5) pin(k, [nose0.x * 0.9, yM + 1], 4); }
    if (vis) {
      eye(-far);
      const t0 = at(h, 0, 0.9), n1 = at(h, -7, 0.9), n2 = at(h, 7, 0.9), c1 = at(h, -13, 0.9), c2 = at(h, 13, 0.9), out = 0.5 * a * h.sin;
      piece(k, hull([[n1.x, -0.52 * H], [n2.x, -0.52 * H], [c1.x + out * 0.5, -0.4 * H], [c2.x + out * 0.5, -0.4 * H], [t0.x + out, -0.4 * H], [t0.x + out * 0.86, -0.365 * H], [t0.x, -0.35 * H]]), shade(skin, 0.9));
    }
  }
  for (const e of ears) if (Math.abs(e.e.d) >= 0.55 * a && e.e.d > 0) e.draw();
  // --- what sits on the head ---
  if (HAT === "cap") {
    capDraw(k, L, h, o.capLift ?? 0, away, "front");
  } else if (HAT === "helmet") {
    const col = L.hatCol ?? "#b9c3cd", dome = spline(sym([[0, -0.66 * H], [1.06 * w, -0.66 * H], [1.08 * w, -0.86 * H], [0.74 * w, -1.05 * H], [0, -1.1 * H]]), true, 5);
    // the crest runs from brow to nape: a thin fin from the front, a fan from the side
    const fan: P2[] = [], base: P2[] = []; for (let t = 15; t <= 165; t += 15) { const Z = b * Math.cos(t * R), q = p3(h, 0, Z * 1.02); base.push([q.x, -0.94 * H - 0.14 * H * Math.sin(t * R)]); fan.push([q.x, -0.94 * H - 0.4 * H * Math.sin(t * R)]); }
    const fin = Math.max(10, 0.12 * a * Math.abs(h.cos)); piece(k, hull([...shift(base, -fin, 0), ...shift(base, fin, 0), ...shift(fan, -fin, 0), ...shift(fan, fin, 0)]), L.accent);
    piece(k, dome, col);
    k.clip(dome, () => k.shape([[-2 * w, -0.74 * H], [2 * w, -0.74 * H], [2 * w, -0.64 * H], [-2 * w, -0.64 * H]], shade(col, 0.8), k.ol));
    for (const s of [-1, 1]) { const q = at(h, s * 72, 1.03); if (q.d > -0.25 * a) piece(k, spline([[q.x - 0.16 * a, -0.66 * H], [q.x + 0.16 * a, -0.66 * H], [q.x + 0.12 * a, -0.3 * H], [q.x, -0.22 * H], [q.x - 0.12 * a, -0.3 * H]], true, 4), col); }
    const nk = at(h, 180, 1.05); if (nk.d > -0.3 * b) piece(k, [[nk.x - 0.8 * w * Math.abs(h.cos) - 0.3 * b * Math.abs(h.sin), -0.66 * H], [nk.x + 0.8 * w * Math.abs(h.cos) + 0.3 * b * Math.abs(h.sin), -0.66 * H], [nk.x + 0.9 * w * Math.abs(h.cos) + 0.34 * b * Math.abs(h.sin), -0.5 * H], [nk.x - 0.9 * w * Math.abs(h.cos) - 0.34 * b * Math.abs(h.sin), -0.5 * H]], shade(col, 0.88));
  } else if (HAT === "greathelm") {
    const col = L.hatCol ?? "#b9c3cd", helm = spline(sym([[0, 14], [0.86 * w, 14], [1.1 * w, -0.1 * H], [1.12 * w, -0.9 * H], [0.98 * w, -1.06 * H], [0, -1.08 * H]]), true, 5);
    piece(k, helm, col);
    k.clip(helm, () => {
      k.shape([[-2 * w, -1.2 * H], [2 * w, -1.2 * H], [2 * w, -0.98 * H], [-2 * w, -0.98 * H]], shade(col, 0.86), k.ol);
      const xs: number[] = []; for (let az = -62; az <= 62; az += 6) { const q = at(h, az, 1.1); if (q.d > 0) xs.push(q.x); }
      if (xs.length > 1) { k.shape([[Math.min(...xs), -0.66 * H], [Math.max(...xs), -0.66 * H], [Math.max(...xs), -0.58 * H], [Math.min(...xs), -0.58 * H]], "#231a16", 0); const c = at(h, 0, 1.1); if (c.d > 0) { k.line([[c.x, -0.98 * H], [c.x, 10]], k.ol * 1.4); for (const az of [16, 26, 36]) for (const y of [-0.42, -0.32, -0.22]) { const q = at(h, az, 1.1); if (q.d > 0) k.dot(q.x, y * H, 3.2); } } }
    });
    k.shape(helm, null);
  } else if (HAT === "brodie" || HAT === "boater" || HAT === "tophat") {
    const col = L.hatCol ?? "#8a8448", yb2 = -0.8 * H, rb = (HAT === "brodie" ? 1.5 : HAT === "boater" ? 1.55 : 1.34) * w * (L.brim ?? 1), ch = HAT === "tophat" ? 0.62 * H : HAT === "boater" ? 0.2 * H : 0.3 * H;
    const brim = ellPts(0, yb2, rb, 0.055 * H + 0.02 * H * Math.abs(h.sin));
    const crown = HAT === "brodie" ? spline([[-1.03 * w, yb2], [-0.92 * w, yb2 - ch * 0.7], [0, yb2 - ch], [0.92 * w, yb2 - ch * 0.7], [1.03 * w, yb2], [0, yb2 + 0.02 * H]], true, 5)
      : ([[-1.0 * w, yb2], [-1.02 * w, yb2 - ch], [1.02 * w, yb2 - ch], [1.0 * w, yb2]] as P2[]);
    piece(k, brim, shade(col, 0.86)); piece(k, crown, col);
    if (L.hatBand) k.clip(crown, () => k.shape([[-2 * w, yb2 - 0.11 * H], [2 * w, yb2 - 0.11 * H], [2 * w, yb2 + 0.02 * H], [-2 * w, yb2 + 0.02 * H]], L.hatBand!, k.ol));
    k.shape(crown, null);
  } else if (HAT === "tricorn") {
    // three corners, one over the brow; the brim is turned up between them
    const col = L.hatCol ?? "#2a2a30", yb3 = -0.82 * H, rim: P2[] = [], top: P2[] = [];
    for (let az = 0; az < 360; az += 10) { const c = Math.max(0, Math.cos(3 * az * R)), r = 1.12 + 0.52 * c ** 1.5, q = p3(h, r * a * Math.sin(az * R), r * b * Math.cos(az * R)); rim.push([q.x, yb3 + 0.03 * H]); top.push([q.x * 0.92, yb3 - 0.2 * H * (1 - c)]); }
    const brimPts = hull([...rim, ...top]); piece(k, brimPts, col);
    k.clip(brimPts, () => k.line(hull(top), 5, L.hatBand ?? "#e7bb48"));
    piece(k, spline([[-0.86 * w, yb3 - 0.1 * H], [-0.7 * w, yb3 - 0.3 * H], [0, yb3 - 0.36 * H], [0.7 * w, yb3 - 0.3 * H], [0.86 * w, yb3 - 0.1 * H], [0, yb3 - 0.05 * H]], true, 5), shade(col, 1.25));
  } else if (HAT === "band") k.clip(skull, () => k.shape([[-2 * w, -0.82 * H], [2 * w, -0.82 * H], [2 * w, -0.72 * H], [-2 * w, -0.72 * H]], L.hatCol ?? CREAM, k.ol));
  // where the monocle's chain starts and bows (card coordinates of the head), if the monocle shows
  const me = at(h, -26, 0.8), fs = clamp(Math.cos(-26 * R + phi), 0.42, 1) ** 0.85, rx = Math.max(0.29 * a * EY * fs * 1.36, 0.29 * a * EY * 1.02), out = at(h, -70).x < me.x ? -1 : 1;
  return L.monocle && me.d >= 0.1 * b && (!away || h.cos > -0.3) ? { start: [me.x + out * rx * 0.72, yEye + 0.29 * a * EY * 1.34 * 0.72] as P2, bow: [at(h, -78, 1.12).x + out * 6, -0.16 * H] as P2 } : null;
};

// ---------------- the whole figure ----------------
/** is the figure drawn as its mirror image at this view angle? A figure with marks on one side only (the monocle, the pipe) is
 *  mirrored whenever it faces screen-left in a side view, so that its marks show in both directions: the pose stays the true one
 *  (left and right limbs are swapped before the mirror), only the skin is flipped. */
export const mirrored = (L: Look, yawDeg: number) => { const y = ((((yawDeg + 180) % 360) + 360) % 360) - 180; return !!L.monocle && y > -128 && y < -52; };
/** does the monocle show at this view angle (for the checks)? */
export const monocleShows = (L: Look, yawDeg: number) => { if (!L.monocle) return true; const y = mirrored(L, yawDeg) ? -yawDeg : yawDeg, h = headGeo(L, y); return at(h, -26, 0.8).d >= 0.1 * L.head.b && h.cos >= -0.3; };
export const swapPose = (p: Pose): Pose => ({ ...p, px: -(p.px ?? 0), roll: -(p.roll ?? 0), twist: -(p.twist ?? 0), hipTilt: -(p.hipTilt ?? 0), head: p.head ? [-p.head[0], p.head[1], -p.head[2]] : undefined, armL: p.armR, armR: p.armL, handL: p.handR, handR: p.handL, legL: p.legR, legR: p.legL });
export const drawCast = (L: Look) => {
  const inner = drawTrue(L);
  return (k: Ink, sk: Sk, o: FigOpts) => {
    if (!mirrored(L, sk.yaw)) return inner(k, sk, o);
    k.g.save(); k.g.scale(-1, 1);
    inner(k, solve(sk.P, swapPose(sk.pose), -sk.yaw), { ...o, handL: o.handR, handR: o.handL, face: o.face ? { ...o.face, gaze: o.face.gaze ? [-o.face.gaze[0], o.face.gaze[1]] : undefined } : undefined });
    k.g.restore();
  };
};
const drawTrue = (L: Look) => (k: Ink, sk: Sk, o: FigOpts) => {
  const ink0 = k.ink; k.ink = LINE;
  const F = frame(sk), P = sk.P, f = o.face ?? {}, front = sk.cos > 0.12, back = sk.cos < -0.12, sideOn = Math.abs(sk.sin) > 0.5, d = Math.sign(sk.sin) || 1, jk = L.top === "jacket";
  const J = (n: string, s: Side) => sk.j[(n + s) as Joint], coatD = shade(L.coat, 0.76), weave = L.weave ? F.o : undefined;
  /** the torso's surface: a point l to the figure's left at height a, on the front (or the back) of the body */
  const row = (a: number) => { const r = L.rows; let i = 0; while (i < r.length - 2 && r[i + 1][0] < a) i++; const t = clamp((a - r[i][0]) / (r[i + 1][0] - r[i][0]), 0, 1); return [0, 1, 2, 3].map((j) => lerp(r[i][j], r[i + 1][j], t)); };
  const S = (l: number, a: number, onBack = false) => { const r = row(a), u = clamp(l / r[1], -1, 1); return F.Q(l, (onBack ? -r[3] : r[2]) * Math.sqrt(1 - u * u), a); };
  // the hem trails behind the move and swings past when it stops: the lower rows are pushed back along the way the figure faces
  const sw = (o.sway ?? 0) * sk.sin, hemAt = (i: number) => -sw * (i === 0 ? (L.skirt ? 46 : 26) : i === 1 ? (L.skirt ? 26 : 10) : L.skirt && i === 2 ? 10 : 0);
  const outline = () => { const c = Math.abs(sk.cos), s = Math.abs(sk.sin), fr = sk.sin >= 0; return spline([...L.rows.map(([a, w, df, db], i) => F.T(Math.hypot(w * c, (fr ? df : db) * s) + hemAt(i), a)), ...L.rows.map(([a, w, df, db], i) => F.T(-Math.hypot(w * c, (fr ? db : df) * s) + hemAt(i), a)).reverse()], true, 5); };
  const leg = (s: Side) => {
    const H = J("hip", s), K = J("kn", s), A = J("an", s), bare = L.legs === "bare", col = bare ? L.skin : L.trous ?? "#463a37";
    const sp = shoePts(sk, s, 50, bare ? 0.27 : 0.34, bare ? 0.15 : 0.2);
    if (L.skirt) { piece(k, sp.pts, "#2a2220"); return; }
    piece(k, seg(K, A, L.leg[1] * (L.stockings ? 0.86 : 1), L.leg[2], bare || L.stockings ? 6 : 3), L.stockings ?? col);
    if (L.feet === "sandals") { piece(k, sp.pts, shade(L.skin, 0.97)); for (const u of [0.3, 0.6]) k.line([add(add(sp.O, sp.ex, sp.span * u), sp.up, 2), add(add(sp.O, sp.ex, sp.span * (u + 0.05)), sp.up, P.foot * (u < 0.5 ? 0.27 : 0.18))], 6, "#7a4a2a", "butt"); k.line([sp.O, add(sp.O, sp.ex, sp.span)], 7, "#7a4a2a", "butt"); }
    else { piece(k, sp.pts, "#2a2220"); if (L.feet === "boots") piece(k, seg(mid(K, A, 0.5), add(A, [0, P.ankle * 0.3]), L.leg[2] + 5, L.leg[2] + 6, 0, 0.3, true), "#3a2a22"); if (L.spats) piece(k, seg(mid(K, A, 0.84), add(A, [0, P.ankle * 0.45]), L.leg[2] + 3, L.leg[2] + 7, 0, 0.3, true), "#f6eedb"); }
    piece(k, seg(H, K, L.leg[0], L.leg[1]), col);
    if (L.stockings) piece(k, seg(mid(K, A, 0.02), mid(K, A, 0.14), L.leg[1] * 1.04, L.leg[1] * 0.98, 0, 0.3, true), shade(col, 0.8));
    if (L.buckle && L.feet === "shoes") { const c = add(add(sp.O, sp.ex, sp.span * 0.55), sp.up, P.foot * 0.2); k.shape([[c[0] - 9, c[1] - 8], [c[0] + 9, c[1] - 8], [c[0] + 9, c[1] + 8], [c[0] - 9, c[1] + 8]], BRASS, k.ol * 0.7); }
    pin(k, K, 7);
  };
  const arm = (s: Side) => {
    const Sh = J("sh", s), E = J("el", s), W = J("wr", s), T = J("tip", s), kind = (s === "L" ? o.handL : o.handR) ?? "relaxed", long = L.sleeve === "long", col = long ? L.armCol ?? L.coat : L.skin;
    const hs = () => hand(k, W, len(sub(T, W)) > 6 ? angle(W, T) : angle(E, W), P.hand, kind, L.skin, thumbFlip(sk, s), false, k.ol);
    if (o.prop === "loaf" && s === "L") loaf(k, mid(W, T, 0.9), P.hand * 0.62);
    if (o.prop === "cane" && s === "R") { const g = mid(W, T, 0.45); cane(k, g, W[1] < sk.j.pelvis[1] ? add(g, unit(sub(W, E)), P.fore * 1.4) : [g[0] + 14 * d, 0], 9); }
    if (long && !L.armCol) piece(k, seg(mid(E, W, 0.84), mid(E, W, 1.05), L.arm[2] * 0.84, L.arm[2] * 0.84, 0, 0.3, true), CREAM);
    const cuff = () => { if (long && L.cuffs) piece(k, seg(mid(E, W, 0.6), mid(E, W, 0.9), L.arm[2] + 7, L.arm[2] + 9, 0, 0.3, true), L.cuffs); };
    hs();
    piece(k, seg(E, W, L.arm[1], L.arm[2], long ? 2 : 5), col, long && L.weave ? E : undefined);
    cuff();
    piece(k, seg(Sh, E, L.arm[0], L.arm[1]), col, long && L.weave ? Sh : undefined);
    if (!long) piece(k, seg(Sh, mid(Sh, E, 0.5), L.arm[0] + 6, L.arm[0] + 4), L.coat);
    if (L.armour) piece(k, seg(add(Sh, [0, -6]), mid(Sh, E, 0.32), L.arm[0] + 12, L.arm[0] + 10), "#b9c3cd");
    pin(k, Sh, 8); pin(k, E, 7);
  };
  let chainEnds: { start: P2; bow: P2 } | null = null;
  const torso = () => {
    const top = L.rows[L.rows.length - 1][0], t = outline();
    piece(k, seg(F.T(0, top - 12), sk.j.skull, P.head * 0.12, P.head * 0.115, 0, 0.3, true), L.skin);
    if (L.cloak && back) piece(k, spline([S(-L.rows[3][1] * 0.9, top - 10, true), S(L.rows[3][1] * 0.9, top - 10, true), S(L.rows[1][1] * 1.05, L.rows[0][0] + 40, true), S(-L.rows[1][1] * 1.05, L.rows[0][0] + 40, true)], true, 4), L.cloak);
    piece(k, t, L.coat, weave, F.tilt);
    k.clip(t, () => {
      if (jk && L.plain && front) { k.line([S(0, top), S(0, L.rows[0][0])], k.ol); for (const s of [-1, 1]) k.shape([S(s * 30, top * 0.74), S(s * 62, top * 0.74), S(s * 62, top * 0.56), S(s * 30, top * 0.56)], shade(L.coat, 1.12), k.ol); k.shape([S(-30, top + 4), S(30, top + 4), S(22, top - 26), S(0, top - 14), S(-22, top - 26)], shade(L.coat, 0.84), k.ol); }
      if (L.emblem === "cross" && front) { k.shape([S(-10, top * 0.84), S(10, top * 0.84), S(10, top * 0.2), S(-10, top * 0.2)], L.accent, 0); k.shape([S(-38, top * 0.66), S(38, top * 0.66), S(38, top * 0.52), S(-38, top * 0.52)], L.accent, 0); }
      if (jk && !L.plain && front) {
        k.shape([S(-30, top - 20), S(30, top - 20), S(38, top * 0.44), S(15, top * 0.1), S(0, top * 0.04), S(-15, top * 0.1), S(-38, top * 0.44)], L.accent, k.ol);
        k.shape([S(-20, top), S(20, top), S(0, top * 0.72)], CREAM, k.ol);
        for (const s of [-1, 1]) { const lap = [S(s * 20, top + 2), S(s * 64, top * 0.84), S(s * 48, top * 0.74), S(s * 8, top * 0.46)]; k.shape(shift(lap, 4, 5), "rgba(52,32,16,0.22)", 0); k.shape(lap, shade(L.coat, 1.14)); k.line([S(s * 8, top * 0.46), S(s * 26, L.rows[0][0])], k.ol); }
      }
      if (jk && back) { k.shape([S(-30, top + 10, true), S(30, top + 10, true), S(34, top - 16, true), S(-34, top - 16, true)], L.plain ? shade(L.coat, 0.84) : CREAM, k.ol); k.line([S(0, top - 16, true), S(0, L.rows[0][0], true)], k.ol); k.shape([S(-42, top * 0.33, true), S(42, top * 0.33, true), S(42, top * 0.23, true), S(-42, top * 0.23, true)], coatD, k.ol); }
      if (L.armour) { const y0 = top * 0.3; k.shape([F.T(-400, y0), F.T(400, y0), F.T(400, top + 40), F.T(-400, top + 40)], "#b9c3cd", k.ol); for (let a = y0 + 34; a < top; a += 34) k.line([F.T(-400, a), F.T(400, a)], k.ol * 0.8); }
      if (L.apron && front) k.shape([S(-L.rows[3][1] * 0.6, top * 0.78), S(L.rows[3][1] * 0.6, top * 0.78), S(L.rows[0][1] * 0.68, L.rows[0][0] + 24), S(-L.rows[0][1] * 0.68, L.rows[0][0] + 24)], L.apron, k.ol);
      if (L.apron && !front && !back) k.shadeEdge(t, L.apron, 24 * d, 0);
      if (L.cloak && front) k.shape([S(-L.rows[3][1], top + 6), S(L.rows[3][1] * 0.2, top + 6), S(L.rows[2][1] * 1.2, top * 0.3), S(L.rows[1][1] * 1.2, top * 0.1), S(-L.rows[3][1] * 1.2, top * 0.62)], L.cloak, k.ol);
      if (L.belt) k.line([F.T(-400, top * 0.3), F.T(400, top * 0.3)], 12, L.belt, "butt");
    });
    k.shape(t, null);
    if (jk && L.plain && front) for (const a of [0.86, 0.66, 0.46, 0.14]) pin(k, S(0, top * a), 4.5);
    if (jk && !L.plain && front) {
      for (const a of [0.56, 0.4, 0.24]) pin(k, S(0, top * a), 4.5);
      const c = S(0, top - 10); for (const s of [-1, 1]) piece(k, [c, S(s * 36, top + 6), S(s * 36, top - 28)], L.accent); pin(k, c, 5);
    } else if (jk && !L.plain && !back && !front) { const c = F.T(34 * d, top - 10); piece(k, [c, [c[0] + 26 * d, c[1] - 15], [c[0] + 26 * d, c[1] + 15]], L.accent); }
    if (jk && back) for (const s of [-1, 1]) pin(k, S(s * 36, top * 0.28, true), 4.5);
    if (L.armour && front) for (const l of [-24, -8, 8, 24]) piece(k, [S(l - 7, top * 0.3), S(l + 7, top * 0.3), S(l + 7, top * 0.02), S(l - 7, top * 0.02)], "#8a5a36");
  };
  const head = () => {
    k.g.save(); k.g.translate(sk.j.skull[0], sk.j.skull[1]); k.g.rotate(sk.headTilt * R);
    const ce = drawHead(k, L, sk.faceYaw, f, o);
    k.g.restore();
    if (ce) { const a = sk.headTilt * R, w = (p: P2): P2 => [sk.j.skull[0] + p[0] * Math.cos(a) - p[1] * Math.sin(a), sk.j.skull[1] + p[0] * Math.sin(a) + p[1] * Math.cos(a)]; chainEnds = { start: w(ce.start), bow: w(ce.bow) }; }
  };
  const top = L.rows[L.rows.length - 1][0];
  const chainDraw = () => { if (chainEnds && sk.cos > -0.05) { const e = chainEnds as { start: P2; bow: P2 }, end = S(-46, top * 0.8), bow: P2 = [Math.min(e.bow[0], e.start[0] + 2) * 1 + (e.bow[0] - e.start[0]) * 0, e.bow[1]]; chain(k, e.start, end, [bow[0] - sw * 16, (bow[1] + end[1]) / 2 - 6], 6, BRASS); k.dot(end[0], end[1], 3.4, "#7d5f1a"); } };
  const { near, far } = sk;
  if (sideOn) { arm(far); leg(far); leg(near); torso(); head(); chainDraw(); arm(near); }
  else {
    const late = (s: Side) => sk.z[`wr${s}`] - sk.z[`sh${s}`] > P.upper * 0.6;
    leg(far); leg(near);
    if (back) { for (const s of [far, near]) if (late(s)) arm(s); torso(); for (const s of [far, near]) if (!late(s)) arm(s); head(); }
    else { torso(); for (const s of [far, near]) if (!late(s)) arm(s); head(); chainDraw(); for (const s of [far, near]) if (late(s)) arm(s); }
  }
  k.ink = ink0;
};
