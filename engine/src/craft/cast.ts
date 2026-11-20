// The cast (step B): the jointed card figure Jesper chose, drawn so that it turns. Every part of the face, the hat and the clothes sits
// at an angle round the head or body and is projected by the view angle, so front, three-quarter, side and back come out of one drawing,
// equally tall and wide, with no jump between them. A figure is a Look (sizes, colours, hat, clothes) on the shared skeleton (rig.ts):
// Sir Digsworth and every side character are Looks of this one base, so a new figure for any era needs no new drawing code.
// Card pieces cast a small shadow on the piece under them and are held by brass pins at the joints; the jaw is a piece that drops.
import { STYLE, Ink, P2, R, sym, spline, ellPts, seg, mid, shade, shift, clamp, lerp, hand, angle, len, sub, add, unit, chain, HandKind } from "./ink";
import { Sk, Side, Props, Joint, Pose, solve } from "./rig";
import { FigOpts, Face, frame, shoePts, thumbFlip, loaf, cane } from "./designs/common";

/** the body is drawn side on (the far arm behind the torso) when |sin| of its turn is over this. Not 0.5: a turn of a round 30 degrees sat
 *  exactly on 0.5 and the order flipped from frame to frame with the rounding, so the far arm and the shoulder button came and went (the
 *  eye patch Short v1r, frames 288-292 and 632, the review of 20 Nov) */
/** the forearm is drawn over the upper arm when the wrist is this much of a forearm nearer the lens than the elbow */
export const FORE_TOP = 0.25;
export const SIDE_ON = 0.513;
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
  hair?: { col: string; kind: "short" | "bald" | "back" | "bun" | "queue" | "messy" };
  /** stripes down trousers (a sailor's striped slops): their colour, on the trousers' own colour */
  trousStripes?: string;
  lash?: boolean; lips?: string;
  /** moustache: colour, how far the tips reach (in head half-widths), how far they turn up, thickness at the root */
  mous?: { col: string; span: number; curl: number; w: number }; beard?: string;
  /** true = the corrected beard (its sheet was approved on 17 Nov 2026; looks.ts castDesign switches it on for every look): it starts at the sideburns, follows
   *  the jaw to a rounded foot with tufts, leaves the mouth open, moves down with the jaw, and has a moustache of its own over the lip */
  beard2?: boolean;
  /** a beard that grows up the cheeks almost to the eyes (Blackbeard: "as to Breadth, it came up to his Eyes") */
  beardHigh?: boolean;
  /** small plaited tails hanging from the beard's foot, each tied with a ribbon of the colour given (one tail per colour) */
  tails?: string[];
  /** one tail being plaited by his fingers (Jesper's review of Blackbeard v3: show the fingers twisting a plait): drawn twice as long
   *  and wide as the others (a tail beside a fist was hidden by it), its lobes at `phase` of their twist (a few looks at phases in turn
   *  make it turn), with no ribbon until it is tied; the drawing marks its top and its end ("plaitTop", "plaitEnd") for the hands */
  plait?: { tail: number; phase: number; /** tied: its ribbon on, as the other tails */ tied?: boolean };
  /** a lit slow-match tucked under the hat on each side of the face, its tip glowing (the drawing marks the tips "fuseA" and "fuseB"
   *  so that the stage can make them smoke: staging.ts fuseSmoke) */
  fuses?: boolean;
  /** the fuses tucked in but not lit yet: a dark tip, no glow, no marks (so the stage gives them no smoke) */
  fusesUnlit?: boolean;
  /** only the fuse on this side of his face (-1 = the one drawn on the left of the face card, "fuseA"; 1 = the right, "fuseB") */
  fuseSide?: -1 | 1;
  /** true = the corrected open mouth (its sheet was approved on 17 Nov 2026; looks.ts castDesign switches it on for every look): an open mouth is the opening
   *  alone, with no mouth line across it; the mood lies in the opening's shape (its upper edge and the lower lip bend up at the
   *  corners in a smile, down in anger and fear), and a narrow angry opening shows clenched teeth */
  mouth2?: boolean;
  monocle?: boolean; pipe?: boolean;
  /** jacket = lapels over a waistcoat (plain = buttoned to the neck, as a uniform or a work jacket); tunic = one garment whose length is its rows
   *  (a short tunic, a long robe, a dress to the ground with skirt = true) */
  top: "jacket" | "tunic"; plain?: boolean; skirt?: boolean; coat: string; accent: string; weave?: boolean; emblem?: "cross"; armCol?: string;
  /** torso rows [height above the pelvis, half-width from the front, depth in front of the spine, depth behind] from the hem up */
  rows: number[][];
  armour?: boolean; apron?: string; cloak?: string; belt?: string;
  /** a gladiator: the chest bare (the torso in the skin's colour, with the lines of the chest), a loincloth (`loin`) under a wide belt (`balteus`) */
  bare?: boolean; loin?: string; balteus?: string;
  /** a gladiator's quilted guard on one arm (manica); the net fighter's metal guard standing up from that shoulder (galerus); a metal greave on one shin */
  manica?: Side; galerus?: Side; greave?: Side;
  /** two coloured stripes down the front and the back of a tunic (a referee's) */
  clavi?: string;
  /** how tall the crest of a helmet stands (a part of the head's height; a soldier's is 0.4) */
  crestH?: number;
  /** a murmillo's visor on the helmet: a plate over the face from the brim down past the chin, with a grille of round holes over the eyes */
  visor?: "grille";
  /** a pattern woven into a tunic and its long sleeves: stripes across it in `col`, or a check (thinner stripes both ways) */
  stripes?: { col: string; check?: boolean };
  /** a neckerchief tied at the throat, its knot and two ends in front (its colour) */
  scarf?: string;
  /** Blackbeard's sling (Johnson 1724: "a Sling over his Shoulders, with three brace of Pistols, hanging in Holsters like Bandaliers"):
   *  a broad strap from his left shoulder across his chest to his right hip, three holsters on it with two pistol butts out of each */
  sling?: boolean;
  /** a linen bandage wound round the forearm of this side; `wrapLeg` round the shin */
  wrap?: Side; wrapLeg?: Side;
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
  if (!STYLE.simple) k.shape(shift(pts, 5, 6), "rgba(52,32,16,0.24)", 0); k.shape(pts, fill, 0); if (weave) k.tweed(pts, WEAVE, weave, tilt, 14, 2.4); k.shape(pts, null);
};
const pin = (k: Ink, p: P2, r = 8) => { if (STYLE.simple) return; k.dot(p[0] + 2, p[1] + 2.5, r, "rgba(52,32,16,0.28)"); k.dot(p[0], p[1], r, "#7d5f1a"); k.dot(p[0], p[1], r - 1.8, BRASS); k.dot(p[0] - r * 0.3, p[1] - r * 0.3, r * 0.28, "#fff4c4"); };
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
/** how far the head is drawn turned when the figure is seen from the angle phi. From the side the head stays turned a little toward
 *  the lens (56 degrees instead of 90), so that both the moustache's shape and the face are those of the front view and he is the
 *  same man from every side; past the side view it swings on to the true angle, so the back of the head is the back of the head. */
export const faceTurn = (phiDeg: number) => {
  const y = ((((phiDeg + 180) % 360) + 360) % 360) - 180, a = Math.abs(y), s = y < 0 ? -1 : 1;
  return s * (a <= 45 ? a : a <= 90 ? 45 + (a - 45) * (11 / 45) : a <= 110 ? 56 + (a - 90) * (54 / 20) : a);
};
const headGeo = (L: Look, phiDeg: number): HG => { const { a, b, H } = L.head, phi = phiDeg * R; return { a, b, H, sin: Math.sin(phi), cos: Math.cos(phi), w: Math.hypot(a * Math.cos(phi), b * Math.sin(phi)) }; };
/** a figure's hat by itself, lying or flying: its middle at the origin, seen from the angle phi */
export const drawHat = (k: Ink, L: Look, phiDeg: number) => {
  const ink0 = k.ink; k.ink = LINE; k.g.save(); k.g.translate(0, 1.02 * L.head.H);
  if (L.hat === "cap") capDraw(k, L, headGeo(L, phiDeg), 0, Math.cos(phiDeg * R) < -0.3, "both");
  k.g.restore(); k.ink = ink0;
};

const drawHead = (k: Ink, L: Look, phiTrue: number, f: Face, o: FigOpts) => {
  const HAT = o.hatOff ? "none" : L.hat, phiDeg = faceTurn(phiTrue);
  // the head stays turned toward the lens in a side view, so the eyes carry the direction: they look the way the body faces
  const ahead = Math.sin((((((phiTrue - phiDeg + 180) % 360) + 360) % 360) - 180) * R);
  const { a, b, H } = L.head, u = H / 200, phi = phiDeg * R, h: HG = { a, b, H, sin: Math.sin(phi), cos: Math.cos(phi), w: Math.hypot(a * Math.cos(phi), b * Math.sin(phi)) }, w = h.w;
  // away = seen from behind. The limit lies well past the profile, so that the small turns of the head in a walk seen from the side never flip the face parts behind the skull
  const m = f.mouth ?? 0, away = h.cos < -0.3, skin = L.skin, skinD = shade(skin, 0.86);
  // the skull card: square-jawed from the front; from the side it gets a chin and a brow in front, a rounded back and a narrow nape
  const jw = L.head.jaw ?? 1, rd = L.head.round ?? 0.3, sa = Math.abs(h.sin), fr = h.sin >= 0 ? 1 : -1, EY = L.head.eye ?? 1;
  const prof = (side: number): P2[] => {
    const fv = [0.7 * jw - 0.2 * rd, jw - 0.08 * rd, 1.01, 1 - 0.08 * rd, 0.74 - 0.22 * rd], sv = side === fr ? [0.6, 1.05, 0.94, 0.99, 0.7] : [0.3, 0.62, 1.04, 1.0, 0.64];
    return [6, -0.11 * H, -0.5 * H, -0.82 * H, -0.975 * H].map((y, j) => [side * w * lerp(fv[j], sv[j], sa), y] as P2);
  };
  const skull = spline([[0, 6], ...prof(1), [0, -H], ...prof(-1).reverse()], true, 5);
  const nose0 = at(h, 0), yEye = -0.565 * H, yM = -0.315 * H, yJaw = -0.18 * H, drop = 0.16 * H * m;
  // --- parts that lie behind the skull card ---
  const mousHalf = (s: number) => {
    const M = L.mous ?? (L.beard && L.beard2 ? { col: L.beard, span: 0.74, curl: -0.42 + 0.6 * Math.max(L.mouth2 ? 0.1 : -9, f.smile ?? 0.25), w: 15 } : undefined); if (!M) return; const r = M.span * a;
    // From the front and from behind the two halves spread to the sides. From the side the near half sweeps back across the cheek
    // to its curled tip and the far half shows as a waxed point out in front of the face, so the same moustache reads in profile.
    const G = ([[0, 0, b * 1.0], [0.3 * a, 2, b * 0.98], [0.62 * r, 7, b * 0.74], [0.86 * r, 6, b * 0.5], [0.98 * r, -8 * M.curl, b * 0.38], [0.97 * r, -30 * M.curl, b * 0.36]] as number[][]).map(([X, y, Z]) => [p3(h, s * X, Z).x, yM + y * u] as P2);
    const dirx = h.sin >= 0 ? 1 : -1, nearHalf = s * dirx < 0, k2 = M.span / 1.24;
    // a beard's moustache has no waxed point out in front of the face: from the side its far half is hidden. It shrinks toward its root as
    // the head turns from |sin| 0.35 to 0.55 and grows back the same way (it was cut off whole at 0.45 and came and went in one frame,
    // the eye patch Short v1r at 1.3 s and 23.6 s, the review of 20 Nov)
    const farK = !L.mous && !nearHalf ? (() => { const c = clamp((0.55 - Math.abs(h.sin)) / 0.2, 0, 1); return c * c * (3 - 2 * c); })() : 1;
    if (farK <= 0.001) return;
    const S = (nearHalf ? [[0.97, 0], [0.74, 7], [0.42, 10], [0.12, 2], [-0.02, -16 * M.curl], [0.06, -34 * M.curl]] : [[0.97, 0], [1.1, 4], [1.26, 1], [1.38, -9 * M.curl], [1.4, -24 * M.curl], [1.34, -34 * M.curl]]).map(([x, y]) => [dirx * b * (0.97 + (x - 0.97) * k2), yM + y * u] as P2);
    const q = Math.abs(h.sin) ** 2 * (h.cos > -0.3 ? 1 : 0), P = G.map((g, n) => [lerp(g[0], S[n][0], q), lerp(g[1], S[n][1], q)] as P2);
    const P2 = farK < 1 ? P.map(([x, y]) => [P[0][0] + (x - P[0][0]) * farK, P[0][1] + (y - P[0][1]) * farK] as P2) : P;
    piece(k, ribbon(P2, [M.w, M.w, M.w * 0.88, M.w * 0.66, M.w * 0.42, M.w * 0.18].map((w) => w * farK)), M.col);
  };
  const pipe = () => {
    // (the stem's end in the corner of the mouth, where the mouth line ends (36 degrees round, 0.72 of the way out): rooted on the face's
    //  outline at 34 degrees it began past the mouth's end, in his cheek, whenever his head was turned; the independent review of
    //  gladiators v5)
    // (the stem runs out to the side, 80 degrees from straight ahead: at 43 degrees, with his head turned that far toward the lens, it
    //  was seen end on as a brown block under the moustache, "a tooth": the shot library review A. And the stem stays in the closed
    //  corner of the mouth when he talks, the mouth opening on the other side (review B: "the pipe hangs in an open mouth"); pipeHold:
    //  false = as before, the stem dropping with the jaw in the open mouth (the proof's planted fault)
    if (!L.pipe) return; const old = o.pipeHold === false, r0 = at(h, 34, 0.72), t = old ? p3(h, a * 0.5 + a * 0.62, b * 0.86 + a * 0.5) : p3(h, a * 1.22, b * 0.6 + a * 0.14), y0 = yJaw - 0.01 * H + (old ? drop * 0.6 : 0), y1 = y0 + 0.11 * H;
    if (old && m > 0.04 && t.d > -0.15 * b) k.mark("pipeOpen", r0.x, y0);
    // (seen as the picture shows it, the stem always runs out from the corner of the mouth away from the face's middle, and at least half a
    //  head wide: in the far corner near profile it sticks out in front of the chin, as a pipe does, instead of going behind the head. The
    //  pipe faded out there in step 1, and before that its bowl floated beside the cheek with no stem: the review of step 1. It is drawn on
    //  top, so it is held in the mouth at every angle the rig may draw, the same corner of the mouth all the way round)
    if (!old) { const sx = Math.sign(r0.x - at(h, 0, 0.72).x) || 1, dx = t.x - r0.x, need = 0.55 * a; t.x = r0.x + sx * Math.max(need, Math.sign(dx) === sx ? Math.abs(dx) : 0); }
    k.mark("pipeOn", r0.x, y0); const fault = o.pipeFault; if (fault === "gone") return t.d;
    const fade = fault === "fade" ? 0.45 : 1;
    const a0 = k.g.globalAlpha; k.g.globalAlpha = a0 * fade;
    if (old) { piece(k, seg([r0.x, y0], [t.x, y1], 5 * u, 5 * u, 0, 0.3, true), "#3a2618"); piece(k, [[t.x - 15 * u, y1 - 34 * u], [t.x + 15 * u, y1 - 34 * u], [t.x + 12 * u, y1 + 7 * u], [t.x - 12 * u, y1 + 7 * u]], "#8a4f2a"); }
    else {
      // (a pipe, not a block: the stem dips from the lips and rises into the bowl's lower side; the bowl round at the bottom, its dark
      //  mouth showing at the top, a streak of shine. The upright brown trapezoid read as a tooth or a block under the moustache, round 2)
      const sx = Math.sign(t.x - r0.x) || 1, end: P2 = [t.x - sx * 8 * u, y1 + 1 * u], midP: P2 = [(r0.x + end[0]) / 2, Math.max(y0, end[1]) + 4 * u];
      if (fault === "loose") t.x = r0.x + sx * 0.9 * a;      // (the planted fault: the bowl beside the cheek, no stem)
      else { k.line(spline([[r0.x, y0], midP, end], false, 6), 7 * u, "#2a1a10", "round"); k.line(spline([[r0.x, y0], midP, end], false, 6), 4 * u, "#4a3020", "round"); k.mark("pipeRoot", r0.x, y0); }
      const bowl = spline([[t.x - 13 * u, y1 - 30 * u], [t.x + 13 * u, y1 - 30 * u], [t.x + 13 * u, y1 - 8 * u], [t.x + 7 * u, y1 + 5 * u], [t.x, y1 + 8 * u], [t.x - 7 * u, y1 + 5 * u], [t.x - 13 * u, y1 - 8 * u]], true, 5);
      piece(k, bowl, "#8a4f2a"); k.shape(ellPts(t.x, y1 - 30 * u, 12 * u, 4 * u), "#2a1810", k.ol * 0.6);
      k.line([[t.x - sx * 7 * u, y1 - 22 * u], [t.x - sx * 7 * u, y1 - 6 * u]], 2.5 * u, "rgba(255,220,170,0.55)", "round"); }
    k.g.globalAlpha = a0; k.mark("pipeTip", t.x, y1); if (fade < 1) k.mark("pipeFade", t.x, y1);
    return t.d;
  };
  const ear = (s: number) => { const e = at(h, s * 90); return { e, draw: () => piece(k, ellPts(e.x, -0.5 * H, 0.17 * a, 0.12 * H), skinD) }; };
  const ears = [ear(-1), ear(1)];
  const tipBehind = L.pipe && o.pipeHold === false ? p3(h, a * 1.12, b * 0.86 + a * 0.5).d < -0.15 * b : false;      // (the pipe now always in front: see pipe)
  if (tipBehind) pipe();
  if (away) { mousHalf(-1); mousHalf(1); }
  // (the ears: each behind the skull, where only what sticks out past its outline shows. The near ear comes round onto the side of the head
  //  as it turns, shown on top from its outer edge inward over 9-33 degrees of turn, so that it glides out from behind the outline. Before,
  //  it was switched from behind the head to on top in one frame at 33 degrees, hidden on one frame and whole on the next: the shot
  //  library's 03, frame 31. How much of each ear shows is noted for the checks, "earA" and "earB": motionCheck's ear test)
  type Ear = (typeof ears)[number];
  const sstep = (e0: number, e1: number, x: number) => { const q = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return q * q * (3 - 2 * q); };
  /** how far the ear has come round on top (0 = all behind the skull, 1 = whole on top) */
  const earGrow = (e: Ear) => (o.earPop ? (Math.abs(e.e.d) >= 0.55 * a && e.e.d > 0 ? 1 : 0) : e.e.d > 0 ? sstep(0.15, 0.55, Math.abs(h.sin)) : 0);
  // (an ear not wholly on top is always drawn behind the skull, which hides what of it lies inside the head's outline. It was drawn behind
  //  only while its depth was under 0.55 of the head's half-width, so the far ear's part past the outline was switched off and on as the
  //  head turned, the mate's ear at 28.7 s, the independent review of v1r. earPop = the old switch, the proof's planted fault)
  const earBehind = (e: Ear) => (o.earPop ? Math.abs(e.e.d) < 0.55 * a : earGrow(e) < 1);
  /** the part of the ear on top: an ellipse from its outer edge inward, as wide as the turn has brought it round */
  const earTop = (e: Ear) => { const k2 = earGrow(e), ox = Math.sign(e.e.x) || 1, rx = 0.17 * a * k2; return { k2, cx: e.e.x + ox * (0.17 * a - rx), rx }; };
  ears.forEach((e, n) => { const T = earTop(e), behind = earBehind(e); let seen = 0, all = 0;
    for (let i = -3; i <= 3; i++) for (let j = -2; j <= 2; j++) { if ((i / 3.5) ** 2 + (j / 2.5) ** 2 > 1) continue; const p: P2 = [e.e.x + (i / 3) * 0.17 * a, -0.5 * H + (j / 2) * 0.12 * H]; all++;
      const onTop = T.k2 >= 1 || (T.rx > 0 && ((p[0] - T.cx) / (T.rx * 3.5 / 3)) ** 2 + ((p[1] + 0.5 * H) / (0.12 * H * 2.5 / 2)) ** 2 <= 1);      // (the same ellipse as the samples' own: the drawn one, tested at the grid's corners, left them out)
      if (onTop || (behind && !within(skull, p))) seen++; }
    k.val(n ? "earB" : "earA", seen / all); });
  for (const e of ears) if (earBehind(e)) e.draw();
  // the peak of the cap hides behind the head when he faces away
  if (HAT === "cap") capDraw(k, L, h, o.capLift ?? 0, away, "behind");
  // --- the skull, the hair on it ---
  if (L.hair?.kind === "bun") { const q = at(h, 180, 1.0); piece(k, ellPts(q.x, -0.9 * H, 0.42 * a, 0.2 * H), L.hair.col); }
  const queue = () => { const q = at(h, 180, 1.0), dx = -0.16 * b * h.sin; piece(k, seg([q.x, -0.3 * H], [q.x + dx, 0.2 * H], 0.11 * a, 0.045 * a), L.hair!.col); piece(k, seg([q.x + dx * 0.1, -0.27 * H], [q.x + dx * 0.24, -0.19 * H], 0.13 * a, 0.13 * a, 0, 0.3, true), "#2a2220"); };
  if (L.hair?.kind === "queue" && h.cos > -0.3) queue();
  piece(k, skull, skin);
  // (the head's outline at its widest, a hat's brim further out, for the checks: motionCheck.ts holds the whole drawn head inside the
  //  picture; round the joints alone, the back of a head in profile was cut by the edge and passed)
  { const xs = skull.map((p) => p[0]), brim = HAT === "none" ? 0 : HAT === "band" ? 0.03 * H : 0.16 * H; /* (a headscarf has no brim: counted as one, a close-up's head was a brim wider than it is) */ k.mark("headMin", Math.min(...xs) - brim, -0.6 * H); k.mark("headMax", Math.max(...xs) + brim, -0.6 * H); }
  if (L.hair) {
    // the hairline runs from the top of the brow back behind the ear down to the nape, so the hair follows the head in every view
    const tailed = L.hair.kind === "queue", kind = tailed || (o.hatOff && L.hair.kind === "back") || L.hair.kind === "messy" ? "short" : L.hair.kind, y0 = kind === "bald" ? -0.72 * H : -1.03 * H, patches: P2[][] = [];
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
    if (L.hair.kind === "messy") {
      // tousled: five soft locks stand out along the top of the head's outline, leaning one way and the other, of uneven length; and a
      // lock is swept across the brow from one side, above the eyebrows, when the face is turned to us
      const top = skull.filter((p) => p[1] < -0.72 * H).sort((p, q) => p[0] - q[0]), n = top.length, c: P2 = [0, -0.6 * H];
      for (let i = 1; i < 6; i++) { const p = top[Math.round(((n - 1) * i) / 6)]; if (!p) continue;
        const d = unit(sub(p, c)), t: P2 = [-d[1], d[0]], side = i % 2 ? 1 : -1, len = (0.09 + 0.035 * ((i * 7) % 3)) * H, lean = side * (0.05 + 0.025 * (i % 3)) * H, tip = add(add(p, d, len), t, lean);
        piece(k, spline([add(p, t, -0.1 * H), add(add(p, d, len * 0.55), t, lean * 0.35 - 0.035 * H), tip, add(add(p, d, len * 0.45), t, lean * 0.45 + 0.04 * H), add(p, t, 0.1 * H), add(p, d, -0.07 * H)], true, 5), L.hair.col); }
      if (!away && h.cos > 0.2) { const a1 = at(h, -64, 1.03), a2 = at(h, 22, 1.03);
        if (a1.d > -0.1 * b && a2.d > -0.1 * b) piece(k, spline([[a1.x, -0.99 * H], [(a1.x + a2.x) / 2, -0.97 * H], [a2.x + 0.04 * w, -0.86 * H], [a2.x - 0.06 * w, -0.85 * H], [(a1.x + a2.x) / 2, -0.88 * H], [a1.x, -0.84 * H]], true, 5), L.hair.col); }
    }
  }
  if (L.hair?.kind === "queue" && h.cos <= -0.3) queue();
  // --- the face (not drawn from behind) ---
  if (!away || h.cos > -0.3) {
    const vis = nose0.d > -0.3 * b;
    // the jaw is its own card: it slides down over a dark card when he speaks. The mouth is large and lies clear of the moustache,
    // so that it reads at phone size: a line that bends with the mood when shut, a dark opening with a tongue (and teeth in a laugh) when open
    const sm = f.smile ?? 0.25, mw0 = (0.44 + 0.12 * Math.max(sm, 0)) * w;
    // (a pipe in the corner of the mouth: open, the mouth opens on the other side and the pipe's corner stays shut round the stem)
    const pc = L.pipe && o.pipeHold !== false && !tipBehind && m > 0.04 ? at(h, 34, 0.72).x : null, c00 = at(h, 0, 0.5).x, ps = pc === null ? 0 : Math.sign(pc - c00) || 1;
    const mw = pc === null ? mw0 : mw0 * 0.45, c0 = pc === null ? c00 : pc - ps * (0.35 * mw0 + mw),      // (the opening ends a third of a mouth's width short of the stem, wherever the stem's corner is: set from the face's middle, it reached the stem with the head turned toward the pipe's side, the review of round 2)
      isOpen = m > 0.04, clench = !STYLE.simple && !!L.mouth2 && isOpen && sm < -0.3 && m < 0.35, bend = L.mouth2 && isOpen ? (clench ? 1 : sm) : 0;
    // the corrected mouth: the upper edge of the opening and the lower lip (the top of the jaw card) bend with the mood
    const lipY = (x: number) => clench ? 0.055 * H * Math.min(1, Math.max(0, (1 - Math.abs(x - c0) / mw) / 0.25)) : bend * 0.05 * H * Math.max(0, 1 - ((x - c0) / mw) ** 2);      // clenched teeth: the lower lip is drawn straight down off them, so the mouth is an arch on a flat foot
    if (vis && isOpen && L.mouth2) { k.clip(skull, () => {
      const top = yJaw - 0.05 * H, cy = sm * 0.06 * H, up: P2[] = [-1, -0.6, -0.2, 0.2, 0.6, 1].map((x) => [c0 + x * mw, top - cy * x * x + 0.35 * cy * (1 - x * x)] as P2), hole: P2[] = [...up, [c0 + mw * 0.9, yJaw + drop + 0.14 * H], [c0 - mw * 0.9, yJaw + drop + 0.14 * H]];
      k.shape(hole, MOUTH, 0);
      k.clip(hole, () => {
        if (clench) {      // a narrow angry mouth: clenched teeth
          k.shape([[c0 - mw, top - 0.1 * H], [c0 + mw, top - 0.1 * H], [c0 + mw, yJaw + drop + 0.14 * H], [c0 - mw, yJaw + drop + 0.14 * H]], "#fffdf6", 0);
          k.line([[c0 - mw, (top + yJaw + drop + 0.04 * H) / 2], [c0 + mw, (top + yJaw + drop + 0.04 * H) / 2]], 3 * u);      // (one line between the rows: four uprights read as a grille, a skull's teeth, the review of round 2)
        } else {
          k.shape(ellPts(c0, yJaw + drop + 0.03 * H + Math.max(0, sm) * 0.05 * H, mw * 0.56, 0.07 * H), "#e0707a", 0);
          if (sm > 0.3 && m > 0.45) k.shape([[c0 - mw, top - 0.1 * H], [c0 + mw, top - 0.1 * H], [c0 + mw * 0.9, yJaw + 0.02 * H], [c0 - mw * 0.9, yJaw + 0.02 * H]], "#fffdf6", k.ol * 0.6);
        }
      });
      k.line(spline(up, false, 4), 4.6 * u);
      if (pc !== null) k.line([[c0 + ps * mw * 0.98, top + 0.02 * H], [pc, yJaw - 0.005 * H]], 5 * u);
    }); }
    if (vis && isOpen && !L.mouth2) { const c = c0; k.clip(skull, () => {
      k.shape([[c - mw, yJaw - 0.05 * H], [c + mw, yJaw - 0.05 * H], [c + mw * 0.9, yJaw + drop + 0.06 * H], [c - mw * 0.9, yJaw + drop + 0.06 * H]], MOUTH, 0);
      k.shape(ellPts(c, yJaw + drop + 0.01 * H, mw * 0.56, 0.06 * H), "#e0707a", 0);
      if (sm > 0.3 && m > 0.45) k.shape([[c - mw * 0.82, yJaw - 0.06 * H], [c + mw * 0.82, yJaw - 0.06 * H], [c + mw * 0.78, yJaw + 0.035 * H], [c - mw * 0.78, yJaw + 0.035 * H]], "#fffdf6", k.ol * 0.6);
    }); }
    const dy = drop, lip: P2[] = bend ? [-1, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1].map((x) => [c0 + x * mw, yJaw + dy + lipY(c0 + x * mw)] as P2) : [];
    const low: P2[] = [[-2 * w, yJaw + dy], ...lip, [2 * w, yJaw + dy], [2 * w, 60 + dy], [-2 * w, 60 + dy]];
    // (the jaw's card is the head's outline with only its chin let down, so that its sides go on straight from the face's: the whole outline
    //  moved down jutted past the face on a turned head, the review of round 2)
    // (and the drop comes in over 0.08 of the head below the hinge: let down whole at the hinge, the outline stepped out at the jaw's sides and
    //  a beard's edge showed a double outline with a notch and a strip of skin, the expression sheet v1, the review of 20 Nov)
    const jawO = dy ? skull.map(([x, y]) => [x, y > yJaw ? y + dy * Math.min(1, (y - yJaw) / (0.08 * H)) : y] as P2) : skull;
    k.clip(jawO, () => { k.shape(shift(low, 0, 6), "rgba(52,32,16,0.2)", 0); k.shape(low, shade(skin, 0.965)); });
    if (m > 0.04) k.clip(low, () => k.shape(jawO, null));
    if (vis && !(L.mouth2 && isOpen)) { const xl = at(h, -36, 0.72).x, xr = at(h, 36, 0.72).x, ym = yJaw + dy, smk = f.smirk ?? 0, te = f.teeth ?? 0;
      // (smirk: one corner up and the other flat, a smug half-smile; teeth: a grimace, the lips drawn back off clenched teeth, Jesper 20 Nov)
      const yl = ym - sm * 0.075 * H - Math.max(0, -smk) * 0.09 * H + Math.max(0, smk) * 0.02 * H, yr = ym - sm * 0.075 * H - Math.max(0, smk) * 0.09 * H + Math.max(0, -smk) * 0.02 * H;
      if (te > 0.5) { const tw = (xr - xl) * 0.5, th = 0.045 * H, cx2 = (xl + xr) / 2;
        k.clip(jawO, () => { k.shape(spline([[cx2 - tw, ym - th], [cx2 + tw, ym - th], [cx2 + tw * 1.08, ym], [cx2 + tw, ym + th], [cx2 - tw, ym + th], [cx2 - tw * 1.08, ym]], true, 4), "#fffdf6", 5.4 * u);
          k.line([[cx2 - tw * 1.02, ym], [cx2 + tw * 1.02, ym]], 3.4 * u); for (const fx of [-0.5, 0, 0.5]) k.line([[cx2 + fx * tw, ym - th * 0.9], [cx2 + fx * tw, ym + th * 0.9]], 2.6 * u); }); }
      else k.clip(jawO, () => k.line(spline([[xl, yl], [lerp(xl, xr, 0.25) + h.sin * 0.05 * a, ym + sm * 0.018 * H - smk * 0.012 * H], [lerp(xl, xr, 0.75) + h.sin * 0.05 * a, ym + sm * 0.018 * H + smk * 0.012 * H], [xr, yr]], false, 6), 6.4 * u)); }
    if (L.lips && vis) { const q = at(h, 0, 0.72); piece(k, ellPts(q.x, yJaw - 0.025 * H + drop, 0.2 * a * Math.max(0.35, Math.abs(h.cos)), 0.032 * H), L.lips); }
    if (L.beard && !L.beard2) { const xs: P2[] = []; for (let az = -100; az <= 100; az += 20) { const q = at(h, az, 1.04); if (q.d > -0.1 * b) xs.push([q.x, -0.32 * H + drop * 0.5]); } if (xs.length > 1) { const lo = xs.map(([x], i) => [x * 0.92, 0.2 * H * (1 - Math.abs(i / (xs.length - 1) - 0.5) * 1.2) + drop] as P2).reverse(); piece(k, spline([...xs, ...lo], true, 4), L.beard); } }
    if (L.beard && L.beard2) {
      // The corrected beard. Outer edge: from one sideburn down the jaw to a rounded foot under the chin and up to the other sideburn,
      // with tufts along it. Inner edge: from the sideburn across the cheek to the corner of the mouth, under the lower lip, and back.
      // So the mouth lies open in it, as large as on a shaven face. What lies under the jaw's hinge goes down with the jaw.
      // In a sour or frightened face (smile below 0) the opening round the mouth is shallow and its corners sit lower: the deep bowl
      // under the lower lip read as a grin whatever the mouth itself did.
      const A = 100, seen = (q: { d: number }) => q.d > -0.12 * b, outer: P2[] = [], inner: P2[] = [], sour = Math.min(1, Math.max(0, -(f.smile ?? 0.25))) * 0.07 * H;
      for (let az = -A; az <= A; az += 4) { const q = at(h, az, 1.05); if (!seen(q)) continue; const t = Math.abs(az) / A, low = Math.max(0, 1 - Math.abs(az) / 72);
        const y0b = (t > 0.69 ? lerp(-0.02 * H, -0.5 * H, (t - 0.69) / 0.31) : lerp(0.2 * H, -0.02 * H, (t / 0.69) ** 1.6)) + (Math.abs(az) < 66 ? 0.05 * H * (1 - Math.abs(((az + 132) % 24) - 12) / 12) : 0);      // five tufts along the foot
        // (below the hinge the beard goes down with the jaw as the jaw's card does, over the same 0.08 of the head: going down only near the chin,
        //  it left the jaw card's corner standing out beside it at the hinge, a step and a second outline, the expression sheet, the review of 20 Nov)
        const y = y0b + drop * Math.max(low, Math.min(1, Math.max(0, (y0b - yJaw) / (0.08 * H))));
        outer.push([q.x * (t > 0.69 ? 1 : lerp(0.9, 1, t / 0.69)), y]); }
      // a high beard rises steeply from the corner of the mouth to just under the eye and stays there to the sideburn
      const cheek = (side: number, u: number): P2 | null => { const q = at(h, side * lerp(40, 96, u), 0.99); return seen(q) ? [q.x, L.beardHigh ? lerp(yJaw - 0.08 * H + sour, -0.47 * H, Math.min(1, u * 1.6) ** 0.5) - 0.09 * H * Math.max(0, u - 0.62) / 0.38 : lerp(yJaw - 0.08 * H + sour, -0.56 * H, u ** 1.3)] : null; };
      for (let u = 1; u >= 0; u -= 0.125) { const q = cheek(1, u); if (q) inner.push(q); }
      for (let az = 40; az >= -40; az -= 8) { const q = at(h, az, 0.9); if (seen(q)) inner.push([q.x, lerp(yJaw + 0.105 * H - sour, yJaw - 0.08 * H + sour, (Math.abs(az) / 40) ** 2) + drop * (1 - 0.5 * (Math.abs(az) / 40) ** 2)]); }
      for (let u = 0; u <= 1; u += 0.125) { const q = cheek(-1, u); if (q) inner.push(q); }
      if (outer.length > 2 && inner.length > 2) piece(k, spline([...outer, ...inner], true, 2), L.beard);
      // the plaited tails, each tied with a ribbon: they hang from the foot of the beard and go down with the jaw
      if (L.tails?.length) { const n = L.tails.length;
        L.tails.forEach((col, i) => { const az = n === 1 ? 0 : lerp(-52, 52, i / (n - 1)), q = at(h, az, 1.02); if (!seen(q)) return;
          const t0 = Math.abs(az) / A, y0 = lerp(0.2 * H, -0.02 * H, (t0 / 0.69) ** 1.6) + drop * Math.max(0, 1 - Math.abs(az) / 72) - 0.02 * H, len0 = (0.3 + 0.05 * ((i * 7) % 3)) * H, wd0 = 0.05 * H * Math.max(0.45, Math.abs(Math.cos((az * Math.PI) / 180 + phi)));
          const pl = L.plait && L.plait.tail === i ? L.plait.phase : null, big = pl !== null, len = big ? len0 * 2.2 : len0, wd = big ? wd0 * 1.7 : wd0;
          for (let j = 0; j < 4; j++) { const yy = y0 + len * (j + 0.5) / 4.4, tw = pl === null ? 1 : 0.78 + 0.3 * Math.abs(Math.cos(j * 1.6 + pl)), sx = pl === null ? Math.sin(j * 2.1) * 0.008 * H : Math.sin(j * 2.1 + pl) * 0.016 * H;
            piece(k, ellPts(q.x + sx, yy, wd * (1 - j * 0.12) * tw, len / 7.4), L.beard!);
            if (pl !== null) k.line([[q.x + sx - wd * 0.6, yy - len / 14], [q.x + sx + wd * 0.6, yy + len / 14]], 2.4 * u); }
          if (pl !== null) { k.mark("plaitTop", q.x, y0 + len * 0.1); k.mark("plaitEnd", q.x, y0 + len * 0.9); if (!L.plait!.tied) return; }
          const yb = y0 + len * 0.95, bx = q.x, bw = 0.075 * H;
          piece(k, [[bx, yb], [bx - bw, yb - bw * 0.55], [bx - bw, yb + bw * 0.55]], col); piece(k, [[bx, yb], [bx + bw, yb - bw * 0.55], [bx + bw, yb + bw * 0.55]], col); piece(k, ellPts(bx, yb, bw * 0.32, bw * 0.32), shade(col, 0.82)); }); }
    }
    // lit slow-matches under the hat, one on each side of the face: a twisted cord from under the brim down beside the cheek, its tip
    // glowing; the brim (drawn after) covers its top. The tips are marked for the stage, which makes them smoke and flicker
    if (L.fuses && !away) for (const s of [-1, 1]) { const q = at(h, s * 82, 1.06); if (q.d < -0.18 * b || (L.fuseSide && s !== L.fuseSide)) continue;
      const out = Math.sign(q.x || s), x0 = q.x - out * 0.02 * H, y0 = -0.96 * H, x1 = q.x + out * 0.1 * H, y1 = -0.42 * H, cord: P2[] = [[x0, y0], [q.x + out * 0.07 * H, -0.74 * H], [x1, y1]];
      k.line(spline(cord, false, 5), 17 * u, "#3a2414"); k.line(spline(cord, false, 5), 11 * u, "#5a3a22"); for (let j = 1; j < 8; j++) { const p = spline(cord, false, 5), c = p[Math.round((p.length - 1) * j / 8)]; k.line([[c[0] - 5 * u, c[1] - 4 * u], [c[0] + 5 * u, c[1] + 4 * u]], 2.6 * u, "#8a6440"); }
      if (L.fusesUnlit) { piece(k, ellPts(x1, y1, 0.032 * H, 0.036 * H), "#3a2a1c"); k.mark(s < 0 ? "fuseA" : "fuseB", x1, y1); continue; }      // (marked too: a spill is put to it)
      const gr = k.g.createRadialGradient(x1, y1, 0, x1, y1, 0.16 * H); gr.addColorStop(0, "rgba(255,140,40,0.55)"); gr.addColorStop(1, "rgba(255,110,30,0)"); k.g.fillStyle = gr; k.g.beginPath(); k.g.arc(x1, y1, 0.16 * H, 0, 7); k.g.fill();
      piece(k, ellPts(x1, y1, 0.04 * H, 0.046 * H), "#ff6a1a"); k.shape(ellPts(x1, y1 + 0.006 * H, 0.02 * H, 0.024 * H), "#ffe08a", 0); k.mark(s < 0 ? "fuseA" : "fuseB", x1, y1); }
    const eye = (s: number) => {
      const q = at(h, s * 28, 0.8); if (q.d < 0.1 * b) return;
      k.mark(s < 0 ? "eyeA" : "eyeB", q.x, yEye);
      const fs = clamp(Math.cos(s * 28 * R + phi), 0.42, 1) ** 0.85, r = 0.32 * a * (STYLE.simple ? Math.min(EY * 1.4, Math.max(EY, 1.45)) : EY), rx = r * fs, ry = r * (1 + 0.16 * (f.wide ?? 0)), ball = ellPts(q.x, yEye, rx, ry), gz = f.gaze ?? [0, 0], lid = f.lid ?? 0.16;
      // a shut eye is one arc and nothing else (no outline of the open eye is left round it, which read as spectacles): it bows upward
      // in a smile and downward otherwise
      const cx = (x: number) => { const m = k.g.getTransform(); return m.a * x + m.c * yEye + m.e; }, one = Math.abs(f.shut ?? 0) > 0.5 && Math.sign(cx(q.x) - cx(at(h, 0, 0.8).x)) === Math.sign(f.shut ?? 0);
      const shut = lid > 0.7 || one,      // (a lid lower than this left a ring with no eye in it: drawn shut instead, the flicker of 20 Nov)
      bow = (f.smile ?? 0) > 0.4 && !one ? -1 : 1;
      // (squeezed hard shut: a chevron pointing at the nose, the lids pressed together, Jesper 20 Nov "eyes squeezed shut")
      const sq = f.squeeze ?? 0;
      if (sq > 0.5) { const tip = q.x - s * rx * 0.55, back = q.x + s * rx * 0.9; k.line([[back, yEye - ry * 0.62], [tip, yEye], [back, yEye + ry * 0.62]], 7.2 * u, LINE, "round"); }
      else if (shut) k.line(spline([[q.x - rx * 0.86, yEye - bow * ry * 0.14], [q.x, yEye + bow * ry * 0.34], [q.x + rx * 0.86, yEye - bow * ry * 0.14]], false, 8), 6.4 * u);
      else { k.shape(ball, "#fffdf6"); k.clip(ball, () => {
        const px = q.x + clamp(gz[0] * 0.5 + h.sin * 0.22 + ahead * 0.5, -0.56, 0.56) * rx, py = yEye + gz[1] * ry * 0.5; k.mark(s < 0 ? "pupilA" : "pupilB", px, py); const pu = Math.max(0.5, Math.min(1.6, f.pupil ?? 1)); k.shape(ellPts(px, py, rx * 0.5 * pu, ry * 0.5 * pu), "#2a1f1a", 0); k.dot(px - rx * 0.17, py - ry * 0.2, r * 0.13, "#ffffff");
        if (lid > (STYLE.simple ? 0.35 : 0.01)) { const y = yEye - ry + 2 * ry * lid; k.shape([[q.x - rx - 2, yEye - ry - 2], [q.x + rx + 2, yEye - ry - 2], [q.x + rx + 2, y], [q.x - rx - 2, y]], STYLE.simple ? skin : shade(skin, 0.86), 0); if (!STYLE.simple) { const lk = clamp((lid - 0.01) / 0.09, 0, 1), lw = 4.6 * u * lk * lk * (3 - 2 * lk); if (lw > 0.05) k.line([[q.x - rx - 2, y], [q.x + rx + 2, y]], lw, LINE, "butt"); } }      // (the lid line grows from nothing at lid 0.01 to its full width at 0.1: it was drawn whole as soon as the lid passed 0.01, and came in one frame, the review of v1r)
      });
      k.shape(ball, null); }
      // (a tear under the eye on the right of the picture, a pale blue drop with its outline and a glint, and the wet trail to it)
      if ((f.tear ?? 0) > 0.05 && s > 0) { const tr = r * 0.62 * Math.min(1, f.tear ?? 0), tx = q.x + rx * 0.55, ty = yEye + ry * 1.35 + tr * 1.2;
        k.line([[q.x + rx * 0.3, yEye + ry * 0.85], [tx, ty - tr * 1.2]], 5 * u, "#8fd3ff", "round");
        k.shape(spline([[tx, ty - tr * 1.9], [tx + tr * 0.85, ty - tr * 0.1], [tx + tr * 0.6, ty + tr * 0.75], [tx, ty + tr], [tx - tr * 0.6, ty + tr * 0.75], [tx - tr * 0.85, ty - tr * 0.1]], true, 6), "#8fd3ff", 3.6 * u);
        k.dot(tx - tr * 0.3, ty - tr * 0.25, tr * 0.22, "#ffffff"); }
      if (L.lash) for (const j of [0, 1]) k.line([[q.x + s * rx * (0.7 + 0.25 * j) * (h.cos > 0.3 ? 1 : 0.4), yEye - ry * (0.75 - 0.3 * j)], [q.x + s * rx * (1.05 + 0.3 * j) * (h.cos > 0.3 ? 1 : 0.4), yEye - ry * (1.1 - 0.35 * j)]], 3.4);
      if (L.monocle && s < 0) mono = { x: q.x, rx, ry };
      // an eye patch over this eye (FigOpts.patch: "A" his right eye, "B" his left): black cloth a little larger than the eye, the strap
      // drawn after both eyes
      if (o.patch && (o.patch === "A") === s < 0) { const px = q.x + (o.patchFault === "off" ? s * 2.4 * rx : 0);      // (patchFault "off": beside the eye, the proof's planted fault)
        k.mark(s < 0 ? "patchA" : "patchB", px, yEye); piece(k, spline([[px - rx * 1.3, yEye - ry * 1.05], [px + rx * 1.3, yEye - ry * 1.05], [px + rx * 1.15, yEye + ry * 0.75], [px, yEye + ry * 1.25], [px - rx * 1.15, yEye + ry * 0.75]], true, 6), "#1c1612"); }
      // the brow is its own piece: up for surprise, down toward the nose for a frown
      const bi = at(h, s * 9, 0.8), bo = at(h, s * 46, 0.8), by = yEye - ry - 0.04 * H, bw = f.brow ?? 0, th = 0.04 * H;
      const sd2 = f.sad ?? 0, yi = by - 0.014 * H - 0.055 * H * Math.max(bw, 0) + 0.045 * H * Math.max(-bw, 0) - 0.06 * H * sd2, yo = by + 0.008 * H - 0.04 * H * Math.max(bw, 0) - 0.022 * H * Math.max(-bw, 0) + 0.035 * H * sd2;      // (sad: the inner end up, the outer down)
      piece(k, [[bi.x, yi], [(bi.x + bo.x) / 2, (yi + yo) / 2 - 0.012 * H], [bo.x, yo], [bo.x, yo + th * 0.8], [(bi.x + bo.x) / 2, (yi + yo) / 2 - 0.012 * H + th], [bi.x, yi + th]], L.brow);
    };
    // (the monocle is drawn after the nose, which lay over its glass, and within the head's outline, which it went past on the far eye
    //  of a turned head: the shot library review D)
    let mono: { x: number; rx: number; ry: number } | null = null;
    const monocle = () => { if (!mono) return; const { x, rx, ry } = mono, ring = ellPts(x, yEye, Math.max(rx * 1.36, ry * 1.02), ry * 1.34);
      k.clip(skull, () => { k.clip(ring, () => { k.g.globalAlpha = 0.2; k.shape(ring, "#bfe6f2", 0); k.g.globalAlpha = 0.8; k.line([[x - rx * 0.7, yEye + ry * 0.2], [x - rx * 0.1, yEye - ry * 0.8]], rx * 0.2, "#ffffff"); k.g.globalAlpha = 1; }); k.shape(ring, null, 12.5); const i = k.ink; k.ink = BRASS; k.shape(ring, null, 7.5); k.ink = i; }); };
    // the patch's strap: from the patch round the side of the head above the ear, and up across the brow to the far side of the crown,
    // on the head's surface as it turns (only what faces the lens is drawn, inside the head's outline)
    const strap = () => { if (!o.patch) return; const s = o.patch === "A" ? -1 : 1;
      for (const [az1, y1] of [[s * 100, -0.66 * H], [-s * 80, -0.92 * H]] as [number, number][]) { const pts: P2[] = []; let run: P2[] = [];
        for (let i = 0; i <= 16; i++) { const az = s * 28 + (az1 - s * 28) * (i / 16), q = at(h, az, 1.0), y = yEye - 0.03 * H + (y1 - yEye + 0.03 * H) * (i / 16); if (q.d > -0.02 * b) run.push([q.x, y]); else if (run.length) break; }
        pts.push(...run); if (pts.length > 1) k.clip(skull, () => k.line(spline(pts, false, 4), 0.026 * H, "#1c1612", "round")); } };
    const far = h.sin >= 0 ? 1 : -1;
    if (vis) eye(far);
    if (!away) { mousHalf(far); mousHalf(-far); if (L.mous && h.cos > 0.5) pin(k, [nose0.x * 0.9, yM + 1], 4); }
    // (the pipe after the moustache: drawn before it, the moustache hid the stem and left only the bowl under it, a tooth or a block,
    //  with the head turned toward the pipe's side; or a bowl floating off the face near profile. The review of round 2)
    if (!tipBehind && !away) pipe();
    if (vis) {
      eye(-far);
      const t0 = at(h, 0, 0.9), n1 = at(h, -7, 0.9), n2 = at(h, 7, 0.9), c1 = at(h, -13, 0.9), c2 = at(h, 13, 0.9), out = 0.5 * a * h.sin;
      piece(k, hull([[n1.x, -0.49 * H], [n2.x, -0.49 * H], [c1.x + out * 0.5, -0.385 * H], [c2.x + out * 0.5, -0.385 * H], [t0.x + out, -0.385 * H], [t0.x + out * 0.86, -0.35 * H], [t0.x, -0.335 * H]]), shade(skin, 0.9));
      monocle();
      strap();
    }
  }
  // (the part on top grows with its outline: drawn with the full outline from the first sliver, a thin ear stood beside the head as a dark
  //  stick or ring and came and went in one frame, the eye patch Short v1r at 15.2 s and 19.2 s, the independent review of 20 Nov)
  for (const e of ears) { const T = earTop(e); if (STYLE.simple || T.k2 <= 0) continue; if (T.k2 >= 1) e.draw();
    // (and fades in: cut off below a width it vanished whole from in front of the beard to behind it in one frame, the mate at 28.7 s)
    else if (T.rx > 0.01 * a) { const al = sstep(0.05, 0.65, T.k2), ow = sstep(0.2, 0.7, T.k2); if (al > 0.01) { const a0 = k.g.globalAlpha; k.g.globalAlpha = a0 * al; k.shape(ellPts(T.cx, -0.5 * H, T.rx, 0.12 * H), skinD, k.ol * ow); k.g.globalAlpha = a0; } } }
  // --- what sits on the head ---
  if (HAT === "cap") {
    capDraw(k, L, h, o.capLift ?? 0, away, "front");
  } else if (HAT === "helmet") {
    const col = L.hatCol ?? "#b9c3cd", dome = spline(sym([[0, -0.66 * H], [1.06 * w, -0.66 * H], [1.08 * w, -0.86 * H], [0.74 * w, -1.05 * H], [0, -1.1 * H]]), true, 5);
    // the crest runs from brow to nape: a thin fin from the front, a fan from the side
    const fan: P2[] = [], base: P2[] = []; for (let t = 15; t <= 165; t += 15) { const Z = b * Math.cos(t * R), q = p3(h, 0, Z * 1.02); base.push([q.x, -0.94 * H - 0.14 * H * Math.sin(t * R)]); fan.push([q.x, -0.94 * H - (L.crestH ?? 0.4) * H * Math.sin(t * R)]); }
    if (L.brim) piece(k, ellPts(0, -0.68 * H, 1.32 * w * L.brim, 0.05 * H + 0.06 * H * Math.abs(h.sin)), shade(col, 0.9));
    const fin = Math.max(10, 0.12 * a * Math.abs(h.cos)); piece(k, hull([...shift(base, -fin, 0), ...shift(base, fin, 0), ...shift(fan, -fin, 0), ...shift(fan, fin, 0)]), L.accent);
    piece(k, dome, col);
    k.clip(dome, () => k.shape([[-2 * w, -0.74 * H], [2 * w, -0.74 * H], [2 * w, -0.64 * H], [-2 * w, -0.64 * H]], shade(col, 0.8), k.ol));
    for (const s of [-1, 1]) { const q = at(h, s * 72, 1.03); if (q.d > -0.25 * a) piece(k, spline([[q.x - 0.16 * a, -0.66 * H], [q.x + 0.16 * a, -0.66 * H], [q.x + 0.12 * a, -0.3 * H], [q.x, -0.22 * H], [q.x - 0.12 * a, -0.3 * H]], true, 4), col); }
    const nk = at(h, 180, 1.05); if (nk.d > -0.3 * b) piece(k, [[nk.x - 0.8 * w * Math.abs(h.cos) - 0.3 * b * Math.abs(h.sin), -0.66 * H], [nk.x + 0.8 * w * Math.abs(h.cos) + 0.3 * b * Math.abs(h.sin), -0.66 * H], [nk.x + 0.9 * w * Math.abs(h.cos) + 0.34 * b * Math.abs(h.sin), -0.5 * H], [nk.x - 0.9 * w * Math.abs(h.cos) - 0.34 * b * Math.abs(h.sin), -0.5 * H]], shade(col, 0.88));
    if (L.visor === "grille") {
      // the visor: a plate round the front of the face from the brim down past the chin (as wide as the face is turned to us), the
      // grille's round holes in rows over the eyes and nose where the plate faces the lens, a raised rim round the grille; then the
      // brim's near half again, over the plate's top edge
      const top: P2[] = [], bot: P2[] = [], rows = [-0.6, -0.5, -0.4, -0.3];
      for (let az = -88; az <= 88; az += 4) { const q = at(h, az, 1.07); if (q.d > -0.04 * b) { top.push([q.x, -0.69 * H]); bot.push([q.x, (0.0 + 0.07 * Math.cos(az * R)) * H]); } }
      if (top.length > 1) { const plate = [...top, ...bot.reverse()]; piece(k, plate, shade(col, 0.95));
        const g0 = at(h, -48, 1.08), g1 = at(h, 48, 1.08);
        k.clip(plate, () => { if (g0.d > -0.1 * b || g1.d > -0.1 * b) { const xa = g0.d > -0.1 * b ? g0.x : Math.min(...top.map((p) => p[0])), xb = g1.d > -0.1 * b ? g1.x : Math.max(...top.map((p) => p[0]));
            k.shape([[Math.min(xa, xb), -0.66 * H], [Math.max(xa, xb), -0.66 * H], [Math.max(xa, xb), -0.23 * H], [Math.min(xa, xb), -0.23 * H]], shade(col, 0.82), k.ol * 0.8); }
          for (let az = -42; az <= 42; az += 12) for (const y of rows) { const q = at(h, az, 1.08), f = q.d / b; if (f > 0.12) k.dot(q.x, y * H, 0.05 * a * (0.45 + 0.55 * f), "#1c1612"); } });
        k.shape(plate, null);
        if (L.brim) k.clip([[-3 * w, -0.68 * H], [3 * w, -0.68 * H], [3 * w, 0.2 * H], [-3 * w, 0.2 * H]], () => piece(k, ellPts(0, -0.68 * H, 1.32 * w * L.brim!, 0.05 * H + 0.06 * H * Math.abs(h.sin)), shade(col, 0.9))); }
    }
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
    // (Jesper 19 Nov: "så att spetsen inte blir en platt svart kil". The corner tips are rounded, the brim's near faces (turned up toward
    // the lens) are a tone lighter than its far side, so that each corner reads as a folded brim with a body, and the brim's edge is
    // drawn even on a black hat whose band is as black as the hat)
    const near: { r: P2; t: P2; d: number }[] = [];
    for (let az = 0; az < 360; az += 10) { const c = Math.max(0, Math.cos(3 * az * R)), r = 1.12 + 0.52 * c ** 1.5, q = p3(h, r * a * Math.sin(az * R), r * b * Math.cos(az * R)); rim.push([q.x, yb3 + 0.03 * H]); top.push([q.x * 0.92, yb3 - 0.2 * H * (1 - c)]); near.push({ r: rim[rim.length - 1], t: top[top.length - 1], d: q.d }); }
    const brimPts = spline(hull([...rim, ...top]), true, 4); piece(k, brimPts, shade(col, 0.9));
    const dark = parseInt(col.slice(1, 3), 16) + parseInt(col.slice(3, 5), 16) + parseInt(col.slice(5, 7), 16) < 150, lit = shade(col, dark ? 1.18 : 1.12);
    k.clip(brimPts, () => { for (let i = 0; i < near.length; i++) { const p = near[i], n = near[(i + 1) % near.length]; if (p.d <= 0 && n.d <= 0) continue;
        k.shape([p.t, n.t, n.r, p.r], lit, 0); }
      k.line(hull(top), 5, L.hatBand && L.hatBand !== col ? L.hatBand : shade(col, dark ? 1.4 : 1.3)); });
    k.shape(brimPts, null);
    piece(k, spline([[-0.86 * w, yb3 - 0.1 * H], [-0.7 * w, yb3 - 0.3 * H], [0, yb3 - 0.36 * H], [0.7 * w, yb3 - 0.3 * H], [0.86 * w, yb3 - 0.1 * H], [0, yb3 - 0.05 * H]], true, 5), shade(col, 1.25));
  } else if (HAT === "band") k.clip(skull, () => k.shape([[-2 * w, -0.82 * H], [2 * w, -0.82 * H], [2 * w, -0.72 * H], [-2 * w, -0.72 * H]], L.hatCol ?? CREAM, k.ol));
  // where the monocle's chain starts and bows (card coordinates of the head), if the monocle shows
  const me = at(h, -28, 0.8), fs = clamp(Math.cos(-28 * R + phi), 0.42, 1) ** 0.85, rx = Math.max(0.32 * a * EY * fs * 1.36, 0.32 * a * EY * 1.02), out = at(h, -70).x < me.x ? -1 : 1;
  return L.monocle && me.d >= 0.1 * b && (!away || h.cos > -0.3) ? { start: [me.x + out * rx * 0.72, yEye + 0.32 * a * EY * 1.34 * 0.72] as P2, bow: [at(h, -78, 1.12).x + out * 6, -0.16 * H] as P2 } : null;
};

// ---------------- the whole figure ----------------
/** is the figure drawn as its mirror image at this view angle? A figure with marks on one side only (the monocle, the pipe) is
 *  mirrored whenever it faces screen-left in a side view, so that its marks show in both directions: the pose stays the true one
 *  (left and right limbs are swapped before the mirror), only the skin is flipped. */
export const mirrored = (L: Look, yawDeg: number) => { const y = ((((yawDeg + 180) % 360) + 360) % 360) - 180; return !!L.monocle && y > -128 && y < -52; };
/** does the monocle show at this view angle (for the checks)? */
export const monocleShows = (L: Look, yawDeg: number) => { if (!L.monocle) return true; const y = mirrored(L, yawDeg) ? -yawDeg : yawDeg, h = headGeo(L, faceTurn(y)); return at(h, -28, 0.8).d >= 0.1 * L.head.b && h.cos >= -0.3; };
export const swapPose = (p: Pose): Pose => ({ ...p, px: -(p.px ?? 0), roll: -(p.roll ?? 0), twist: -(p.twist ?? 0), hipTilt: -(p.hipTilt ?? 0), head: p.head ? [-p.head[0], p.head[1], -p.head[2]] : undefined, armL: p.armR, armR: p.armL, handL: p.handR, handR: p.handL, legL: p.legR, legR: p.legL });
/** the closed fingers of the hands that hold something (`sides`), drawn where the figure's own hands are: the stage puts this layer
 *  in front of the thing held */
export const drawFingers = (L: Look) => (k: Ink, sk0: Sk, sides: Side[], whole?: Partial<Record<Side, HandKind>>) => {
  const mir = mirrored(L, sk0.yaw), sk = mir ? solve(sk0.P, swapPose(sk0.pose), -sk0.yaw) : sk0;
  if (mir) { k.g.save(); k.g.scale(-1, 1); }
  for (const s0 of sides) { const s: Side = mir ? (s0 === "L" ? "R" : "L") : s0, E = sk.j[`el${s}`], W = sk.j[`wr${s}`], T = sk.j[`tip${s}`];
    const kind = whole?.[s0];
    // (a thing shown by its edges: the thumb laid over its front from the hand toward the middle of the body, where the thing is; along
    //  the hand it pointed out past the edge, beside the book. The fist is on the figure's card, behind the thing)
    if (kind === "thumb") { const h = sk.P.hand, a0 = (len(sub(T, W)) > 6 ? angle(W, T) : angle(E, W)) * R, B: P2 = [W[0] + Math.cos(a0) * 0.42 * h, W[1] + Math.sin(a0) * 0.42 * h], dir = Math.sign(sk.j.neck[0] - B[0]) || 1;
      // (only the thumb's last joint over the edge: half a hand long, it lay across the page like a pink sausage, the eye patch Short v1d)
      k.group([seg([B[0] + dir * 0.03 * h, B[1] - 0.05 * h], [B[0] + dir * 0.24 * h, B[1] - 0.08 * h], 0.12 * h, 0.1 * h, 0, 0.3, false)], L.skin, k.ol); continue; }      // (from the middle of the fist, which reaches out past the edge)
    hand(k, W, len(sub(T, W)) > 6 ? angle(W, T) : angle(E, W), sk.P.hand, kind ?? "fist", L.skin, thumbFlip(sk, s), false, k.ol, "all"); }
  if (mir) k.g.restore();
};
/** the convex hull of points (Andrew's monotone chain), counter-clockwise */
const convexHull = (p: P2[]): P2[] => { const q = [...p].sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o: P2, a: P2, b: P2) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo: P2[] = [], hi: P2[] = []; for (const x of q) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], x) <= 0) lo.pop(); lo.push(x); }
  for (const x of q.reverse()) { while (hi.length >= 2 && cr(hi[hi.length - 2], hi[hi.length - 1], x) <= 0) hi.pop(); hi.push(x); }
  return [...lo.slice(0, -1), ...hi.slice(0, -1)]; };
/** a clip region that is everything but the convex polygon `h`: a large frame round it, joined to `h` gone round the other way */
const outside = (h: P2[]): P2[] => { const ar = h.reduce((s, p, i) => { const q = h[(i + 1) % h.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0), hh = ar > 0 ? [...h].reverse() : h, B = 1e5;
  const frame: P2[] = [[-B, -B], [-B, B], [B, B], [B, -B]], fa = frame.reduce((s, p, i) => { const q = frame[(i + 1) % 4]; return s + p[0] * q[1] - q[0] * p[1]; }, 0), fr = fa > 0 ? frame : [...frame].reverse();      // (hh always goes round the negative way, the frame the positive)
  return [...fr, fr[0], hh[0], ...hh.slice(1), hh[0], fr[0]]; };
/** is p inside the closed outline `poly` */
const within = (poly: P2[], p: P2) => { let i = false; for (let a = 0, b = poly.length - 1; a < poly.length; b = a++) { const [xa, ya] = poly[a], [xb, yb] = poly[b]; if (ya > p[1] !== yb > p[1] && p[0] < ((xb - xa) * (p[1] - ya)) / (yb - ya) + xa) i = !i; } return i; };
/** the drawing-order choices of each arm, and whether changing them would show (the review of v1t: the mate's upper arm with its shoulder
 *  cap jumped in front of his beard in one frame and back in one frame, 18/45, 257/293, 1048/1070; his forearm swapped over and under
 *  the upper arm at 88/135 and 419; an order may change only where the two parts do not overlap in the picture). In the drawing's own
 *  terms (a mirrored figure: on its mirror skeleton, see orderFlags):
 *  - after: the arm drawn after the head (from the front: its wrist toward the lens, or at the face) or, from behind, before the torso
 *  - face: the hand lies over the face (an arm drawn behind the head there would hide the hand in it)
 *  - freeArm: the arm, its hand and its width clear of the head and the beard below it, with a margin (a change cannot be seen)
 *  - fore: the forearm drawn over the upper arm (the wrist toward the lens from the elbow)
 *  - freeFore: never: forearm and upper arm always meet at the elbow, and their round ends there show the swap even with the arm straight
 *    (v1t 419-420), so the forearm's order holds for the whole shot */
type LR = { L: boolean; R: boolean };
export type ArmOrder = { after: LR; face: LR; freeArm: LR; fore: LR; freeFore: LR };
const armOrder = (L: Look, sk: Sk): ArmOrder => {
  const P = sk.P, back = sk.cos < -0.12, sideOn = Math.abs(sk.sin) > SIDE_ON;
  const hc = mid(sk.j.skull, sk.j.crown, 0.5), hw = Math.hypot(L.head.a * sk.cos, L.head.b * sk.sin), hh = L.head.H / 2;
  const inHead = (p: P2) => ((p[0] - hc[0]) / hw) ** 2 + ((p[1] - hc[1]) / hh) ** 2 < 1;
  const dn = unit(sub(sk.j.pelvis, hc)), bc = add(hc, [dn[0] * hh * 0.3, dn[1] * hh * 0.3]), A = hw * 1.3, B = hh * 1.6;
  const r: Record<string, boolean>[] = [{}, {}, {}, {}, {}];
  for (const s of ["L", "R"] as const) { const Sh = sk.j[`sh${s}`], E = sk.j[`el${s}`], W = sk.j[`wr${s}`], T = sk.j[`tip${s}`];
    const late = sk.z[`wr${s}`] - sk.z[`sh${s}`] > P.upper * 0.6, face = !back && inHead(W);
    const near = (p: P2, w: number) => ((p[0] - bc[0]) / (A + w)) ** 2 + ((p[1] - bc[1]) / (B + w)) ** 2 < 1;
    let clear = true; const wa = L.arm[0] / 2 + 6, o2 = s === "L" ? "R" : "L", oth: P2[] = [sk.j[`sh${o2}`], sk.j[`el${o2}`], sk.j[`wr${o2}`], sk.j[`tip${o2}`]];
    // (clear of the other arm too: an arm drawn later or earlier also changes its order with the other one where they cross)
    const dSeg = (p: P2, a: P2, b: P2) => { const ab = sub(b, a), l2 = ab[0] ** 2 + ab[1] ** 2 || 1, t = clamp(((p[0] - a[0]) * ab[0] + (p[1] - a[1]) * ab[1]) / l2, 0, 1); return Math.hypot(p[0] - a[0] - t * ab[0], p[1] - a[1] - t * ab[1]); };
    const byOther = (p: P2) => dSeg(p, oth[0], oth[1]) < 2 * wa || dSeg(p, oth[1], oth[2]) < 2 * wa || dSeg(p, oth[2], oth[3]) < wa + P.hand * 0.55;
    for (let i = 0; i <= 8 && clear; i++) { const k = i / 8, p1 = mid(Sh, E, k), p2 = mid(E, W, k); if (near(p1, wa) || near(p2, wa) || byOther(p1) || byOther(p2)) clear = false; }
    for (let i = 0; i <= 4 && clear; i++) if (near(mid(W, T, i / 4), P.hand * 0.55)) clear = false;
    r[0][s] = back ? late : late || face; r[1][s] = face; r[2][s] = sideOn || (!back && clear);
    r[3][s] = sk.z[`wr${s}`] - sk.z[`el${s}`] > FORE_TOP * P.fore; r[4][s] = false; }
  const lr = (x: Record<string, boolean>): LR => ({ L: !!x.L, R: !!x.R });
  return { after: lr(r[0]), face: lr(r[1]), freeArm: lr(r[2]), fore: lr(r[3]), freeFore: lr(r[4]) };
};
const swapLR = (o: ArmOrder): ArmOrder => { const w = (x: LR): LR => ({ L: x.R, R: x.L }); return { after: w(o.after), face: w(o.face), freeArm: w(o.freeArm), fore: w(o.fore), freeFore: w(o.freeFore) }; };
/** armOrder for the figure as the stage sees it (`sk0`, the true skeleton): a mirrored figure is drawn from its mirror skeleton with its
 *  sides swapped, so the choices are made there and given back on the figure's own sides */
export const orderFlags = (L: Look, sk0: Sk): ArmOrder => { const mir = mirrored(L, sk0.yaw); return mir ? swapLR(armOrder(L, solve(sk0.P, swapPose(sk0.pose), -sk0.yaw))) : armOrder(L, sk0); };
export const drawCast = (L: Look) => {
  const inner = drawTrue(L);
  return (k: Ink, sk: Sk, o: FigOpts) => {
    if (!(o.mirror ?? mirrored(L, sk.yaw))) return inner(k, sk, o);
    k.g.save(); k.g.scale(-1, 1);
    inner(k, solve(sk.P, swapPose(sk.pose), -sk.yaw), { ...o, handL: o.handR, handR: o.handL, foreTopFix: o.foreTopFix ? { L: o.foreTopFix.R, R: o.foreTopFix.L } : undefined, armFix: o.armFix ? { L: o.armFix.R, R: o.armFix.L } : undefined, patch: o.patch === "A" ? "B" : o.patch === "B" ? "A" : undefined, face: o.face ? { ...o.face, gaze: o.face.gaze ? [-o.face.gaze[0], o.face.gaze[1]] : undefined } : undefined });
    k.g.restore();
    // drawn as its mirror image, the drawing's left arm is the figure's right
    const m = k.marks, hl = m.hidL, hr = m.hidR; delete m.hidL; delete m.hidR; if (hl) m.hidR = hl; if (hr) m.hidL = hr;
    // (and its eyes: the eye patch stays on the figure's own eye, never moved by the mirror, the eye patch Short; the marks follow it)
    for (const [x, y] of [["eyeA", "eyeB"], ["pupilA", "pupilB"], ["patchA", "patchB"]]) { const ma = m[x], mb = m[y]; delete m[x]; delete m[y]; if (ma) m[y] = ma; if (mb) m[x] = mb; }
    { const v = k.vals; for (const n of ["foreTop", "freeArm", "freeFore", "armAfter"]) { const l = v[`${n}L`], r = v[`${n}R`]; delete v[`${n}L`]; delete v[`${n}R`]; if (l !== undefined) v[`${n}R`] = l; if (r !== undefined) v[`${n}L`] = r; } }
  };
};
const drawTrue = (L: Look) => (k: Ink, sk: Sk, o: FigOpts) => {
  const ink0 = k.ink; k.ink = LINE;
  const F = frame(sk, o.drape !== false), P = sk.P, f = o.face ?? {}, front = sk.cos > 0.12, back = sk.cos < -0.12, sideOn = Math.abs(sk.sin) > SIDE_ON, d = Math.sign(sk.sin) || 1, jk = L.top === "jacket";
  const J = (n: string, s: Side) => sk.j[(n + s) as Joint], coatD = shade(L.coat, 0.76), weave = L.weave ? F.o : undefined;
  /** the torso's surface: a point l to the figure's left at height a, on the front (or the back) of the body */
  const row = (a: number) => { const r = L.rows; let i = 0; while (i < r.length - 2 && r[i + 1][0] < a) i++; const t = clamp((a - r[i][0]) / (r[i + 1][0] - r[i][0]), 0, 1); return [0, 1, 2, 3].map((j) => lerp(r[i][j], r[i + 1][j], t)); };
  const S = (l: number, a: number, onBack = false) => { const r = row(a), u = clamp(l / r[1], -1, 1); return F.Q(l, (onBack ? -r[3] : r[2]) * Math.sqrt(1 - u * u), a); };
  // the hem trails behind the move and swings past when it stops: the lower rows are pushed back along the way the figure faces
  const sw = (o.sway ?? 0) * sk.sin, hemAt = (i: number) => -sw * (i === 0 ? (L.skirt ? 46 : 26) : i === 1 ? (L.skirt ? 26 : 10) : L.skirt && i === 2 ? 10 : 0);
  // THE KNEE DRAPE (seated: frame's drape at half or more, and a garment that reaches below the waist): the torso is drawn down to the
  // pelvis only, and below it the garment is one piece of cloth laid over both thighs and, past the knees, hanging down the shins, as far
  // along the legs as the hem hangs below the pelvis standing (the same cloth: it does not get shorter for sitting down). Drawn as the hull
  // round both legs' cloth (each a tube a little wider than the leg, flaring at the hem) and the waist; from the waist down it is laid over
  // the torso's lower edge, so that there is no seam. (The review of the first drape sheet, 20 Nov: a white cushion on the near thigh with a
  // notch at the waist, the far thigh bare, skin under the robe at the seat, the hem at the knee)
  const lapOn = F.drape >= 0.5 && -L.rows[0][0] > 8 && !L.bare;
  const rowsUp = (): number[][] => { if (!lapOn) return L.rows; const up = L.rows.filter((r) => r[0] > 0); return [[0, ...row(0).slice(1)], ...up]; };
  /** the torso's outline; `open` = without its bottom edge (seated with the knee drape, where the lap's cloth goes on below it) */
  const outline = (open = false) => { const c = Math.abs(sk.cos), s = Math.abs(sk.sin), fr = sk.sin >= 0, R = rowsUp(); return spline([...R.map(([a, w, df, db], i) => F.T(Math.hypot(w * c, (fr ? df : db) * s) + hemAt(i), a)), ...R.map(([a, w, df, db], i) => F.T(-Math.hypot(w * c, (fr ? db : df) * s) + hemAt(i), a)).reverse()], !open, 5); };
  // stripes down a piece of the trouser leg from p to q (its half-widths w0, w1), clipped to the piece
  const stripesOn = (p: P2, q: P2, w0: number, w1: number, colS: string) => { const poly = seg(p, q, w0, w1), d = unit(sub(q, p)), n: P2 = [-d[1], d[0]];
    k.clip(poly, () => { for (const f of [-0.62, -0.1, 0.42]) k.line([add(add(p, n, w0 * f), d, -20), add(add(q, n, w1 * f), d, 20)], Math.max(5, 0.24 * w0), colS, "butt"); }); k.shape(poly, null); };
  const leg = (s: Side) => {
    const H = J("hip", s), K = J("kn", s), A = J("an", s), bare = L.legs === "bare", col = bare ? L.skin : L.trous ?? "#463a37";
    const sp = shoePts(sk, s, 50, bare ? 0.27 : 0.34, bare ? 0.15 : 0.2);
    if (L.skirt) { piece(k, sp.pts, "#2a2220"); return; }
    piece(k, seg(K, A, L.leg[1] * (L.stockings ? 0.86 : 1), L.leg[2], bare || L.stockings ? 6 : 3), L.stockings ?? col);
    if (L.trousStripes && !bare) stripesOn(K, A, L.leg[1], L.leg[2], L.trousStripes);
    if (L.wrapLeg === s) { piece(k, seg(mid(K, A, 0.06), mid(K, A, 0.8), L.leg[1] + 5, L.leg[2] + 5, 0, 0.3, true), "#f6f2e6"); const dv = unit(sub(A, K)), pp: P2 = [-dv[1], dv[0]]; for (const u of [0.25, 0.45, 0.65]) { const m = mid(K, A, u), w0 = L.leg[1] + 3; k.line([add(add(m, pp, -w0), dv, -4), add(add(m, pp, w0), dv, 4)], k.ol * 0.45, "#bdb5a2"); } }
    if (L.greave === s) { piece(k, seg(mid(K, A, 0.04), mid(K, A, 0.86), L.leg[1] + 6, L.leg[2] + 5, 0, 0.3, true), "#c9ced6"); k.line([mid(K, A, 0.1), mid(K, A, 0.8)], k.ol * 0.5); }
    if (L.feet === "sandals") { piece(k, sp.pts, shade(L.skin, 0.97)); for (const u of [0.3, 0.6]) k.line([add(add(sp.O, sp.ex, sp.span * u), sp.up, 2), add(add(sp.O, sp.ex, sp.span * (u + 0.05)), sp.up, P.foot * (u < 0.5 ? 0.27 : 0.18))], 6, "#7a4a2a", "butt"); k.line([sp.O, add(sp.O, sp.ex, sp.span)], 7, "#7a4a2a", "butt"); }
    else { piece(k, sp.pts, "#2a2220"); if (L.feet === "boots") piece(k, seg(mid(K, A, 0.5), add(A, [0, P.ankle * 0.3]), L.leg[2] + 5, L.leg[2] + 6, 0, 0.3, true), "#3a2a22"); if (L.spats) piece(k, seg(mid(K, A, 0.84), add(A, [0, P.ankle * 0.45]), L.leg[2] + 3, L.leg[2] + 7, 0, 0.3, true), "#f6eedb"); }
    piece(k, seg(H, K, L.leg[0], L.leg[1]), col);
    if (L.trousStripes && !bare) stripesOn(H, K, L.leg[0], L.leg[1], L.trousStripes);
    if (L.stockings) piece(k, seg(mid(K, A, 0.02), mid(K, A, 0.14), L.leg[1] * 1.04, L.leg[1] * 0.98, 0, 0.3, true), shade(col, 0.8));
    if (L.buckle && L.feet === "shoes") { const c = add(add(sp.O, sp.ex, sp.span * 0.55), sp.up, P.foot * 0.2); k.shape([[c[0] - 9, c[1] - 8], [c[0] + 9, c[1] - 8], [c[0] + 9, c[1] + 8], [c[0] - 9, c[1] + 8]], BRASS, k.ol * 0.7); }
    pin(k, K, 7);
  };
  /** the woven pattern on a sleeve from A0 to B0 (half-widths wa, wb; `pts` its outline): stripes round the arm, and for a check lines
   *  along it too; the outline is drawn again over them */
  const STRIPE = { gap: 30, w: 12, wc: 8 };
  const woven = (A0: P2, B0: P2, wa: number, wb: number, pts: P2[]) => {
    const W0 = L.stripes; if (!W0) return; const v = sub(B0, A0), n = len(v), u = unit(v), p: P2 = [-u[1], u[0]], r = Math.max(wa, wb) + 8, w = W0.check ? STRIPE.wc : STRIPE.w;
    k.clip(pts, () => { for (let s = -STRIPE.gap; s < n + STRIPE.gap; s += STRIPE.gap) { const m = add(A0, u, s); k.shape([add(m, p, -r), add(m, p, r), add(add(m, p, r), u, w), add(add(m, p, -r), u, w)], W0.col, 0); }
      if (W0.check) for (const o of [-0.55, 0, 0.55]) k.line([add(A0, p, o * wa), add(B0, p, o * wb)], w, W0.col, "butt"); });
    k.shape(pts, null);
  };
  const arm = (s: Side) => {
    const Sh = J("sh", s), E = J("el", s), W = J("wr", s), T = J("tip", s), kind = (s === "L" ? o.handL : o.handR) ?? "relaxed", long = L.sleeve === "long", col = long ? L.armCol ?? L.coat : L.skin;
    const hs = () => hand(k, W, len(sub(T, W)) > 6 ? angle(W, T) : angle(E, W), P.hand, kind, L.skin, thumbFlip(sk, s), false, k.ol);
    if (o.prop === "loaf" && s === "L") loaf(k, mid(W, T, 0.9), P.hand * 0.62);
    if (o.prop === "cane" && s === "R") { const g = mid(W, T, 0.45); cane(k, g, W[1] < sk.j.pelvis[1] ? add(g, unit(sub(W, E)), P.fore * 1.4) : [g[0] + 14 * d, 0], 9); }
    // (the upper arm is drawn over the forearm, except where the forearm comes toward the lens from the elbow: then the forearm and the
    //  hand lie over the upper arm. Drawn under it always, a forearm raised before the chest or a hand on the chest vanished behind the
    //  upper arm and the hand seemed to grow out of the shoulder: the shot library's 06 frames 44-119. foreUnder = as before, the proof's
    //  planted fault)
    const foreTop = !o.foreUnder && (o.foreTopFix ? o.foreTopFix[s] : sk.z[`wr${s}`] - sk.z[`el${s}`] > FORE_TOP * P.fore); k.val(`foreTop${s}`, foreTop ? 1 : 0);
    const up = () => { const upper = seg(Sh, E, L.arm[0], L.arm[1]); piece(k, upper, col, long && L.weave ? Sh : undefined); if (long) woven(Sh, E, L.arm[0], L.arm[1], upper);
      if (!long) piece(k, seg(Sh, mid(Sh, E, 0.5), L.arm[0] + 6, L.arm[0] + 4), L.coat);
      if (L.armour) piece(k, seg(add(Sh, [0, -6]), mid(Sh, E, 0.32), L.arm[0] + 12, L.arm[0] + 10), "#b9c3cd"); };
    if (foreTop) up();
    if (long && !L.armCol) piece(k, seg(mid(E, W, 0.84), mid(E, W, 1.05), L.arm[2] * 0.84, L.arm[2] * 0.84, 0, 0.3, true), CREAM);
    const cuff = () => { if (long && L.cuffs && !STYLE.simple) piece(k, seg(mid(E, W, 0.6), mid(E, W, 0.9), L.arm[2] + 7, L.arm[2] + 9, 0, 0.3, true), L.cuffs); };
    hs();
    const fore = seg(E, W, L.arm[1], L.arm[2], long ? 2 : 5); piece(k, fore, col, long && L.weave ? E : undefined); if (long) woven(E, W, L.arm[1], L.arm[2], fore);
    cuff();
    if (!foreTop) up();
    if (L.wrap === s) { const wc = "#f6f2e6"; piece(k, seg(mid(E, W, 0.12), mid(E, W, 0.82), L.arm[1] + 4, L.arm[2] + 4, 2), wc); const dv = unit(sub(W, E)), pp: P2 = [-dv[1], dv[0]]; for (const u of [0.25, 0.4, 0.55, 0.7]) { const m = mid(E, W, u), w0 = L.arm[1] + 3; k.line([add(add(m, pp, -w0), dv, -4), add(add(m, pp, w0), dv, 4)], k.ol * 0.45, "#bdb5a2"); } }
    if (L.manica === s) { const mc = "#efe6cf", band = (A0: P2, B0: P2, wa: number, wb: number) => { piece(k, seg(A0, B0, wa, wb, 2), mc); const dv = unit(sub(B0, A0)), pp: P2 = [-dv[1], dv[0]]; for (const u of [0.2, 0.4, 0.6, 0.8]) { const m = mid(A0, B0, u), w0 = (wa + (wb - wa) * u) * 0.95; k.line([add(m, pp, -w0), add(m, pp, w0)], k.ol * 0.55); } };
      band(mid(E, W, 0.02), mid(E, W, 0.9), L.arm[1] + 5, L.arm[2] + 5); band(Sh, E, L.arm[0] + 5, L.arm[1] + 5); }
    if (L.galerus === s) { const out = Math.sign(Sh[0] - sk.j.neck[0]) || 1, q = (x: number, y: number): P2 => [Sh[0] + out * x, Sh[1] + y]; piece(k, [q(-8, -10), q(74, -2), q(96, -112), q(40, -118)], "#c9ced6"); k.line([q(14, -40), q(84, -38)], k.ol * 0.6); }
    pin(k, Sh, 8); pin(k, E, 7);
  };
  let chainEnds: { start: P2; bow: P2 } | null = null;
  /** the knee drape (see lapOn): the cloth over the lap, from the waist down, in one piece */
  const lapDrape = () => {
    const hemLen = -L.rows[0][0], pts: P2[] = [], ring = (c: P2, r: number) => { for (let i = 0; i < 16; i++) { const q = (i / 16) * 2 * Math.PI; pts.push([c[0] + r * Math.cos(q), c[1] + r * Math.sin(q)]); } };
    for (const sd of ["L", "R"] as Side[]) { const H = J("hip", sd), K = J("kn", sd), A = J("an", sd);
      // (round the hip only the leg's own width and a little: wider, the cloth went down past the seat's top)
      ring(H, L.leg[0] + 8);
      if (hemLen > P.thigh) { ring(K, L.leg[1] + 12); ring(mid(K, A, Math.min(1, (hemLen - P.thigh) / P.shin)), L.leg[2] + 18); }
      else ring(mid(H, K, hemLen / P.thigh), L.leg[1] + 14); }
    // the waist, where the torso's piece ends: both its sides at the pelvis
    const r0 = row(0), c = Math.abs(sk.cos), s2 = Math.abs(sk.sin), fr = sk.sin >= 0, lf = Math.hypot(r0[1] * c, (fr ? r0[2] : r0[3]) * s2), lb = Math.hypot(r0[1] * c, (fr ? r0[3] : r0[2]) * s2);
    pts.push(F.T(lf, 0), F.T(-lb, 0));
    const hull = convexHull(pts); piece(k, hull, L.coat, weave, F.tilt); return hull;
  };
  const torso = () => {
    const top = L.rows[L.rows.length - 1][0], t = outline();
    piece(k, seg(F.T(0, top - 12), sk.j.skull, P.head * 0.12, P.head * 0.115, 0, 0.3, true), L.skin);
    if (L.cloak && back) piece(k, spline([S(-L.rows[3][1] * 0.9, top - 10, true), S(L.rows[3][1] * 0.9, top - 10, true), S(L.rows[1][1] * 1.05, L.rows[0][0] + 40, true), S(-L.rows[1][1] * 1.05, L.rows[0][0] + 40, true)], true, 4), L.cloak);
    // (seated with the knee drape: the lap's cloth first, then the torso over it with no shadow and no line along its bottom edge, so that
    //  the cloth runs on from the waist without a seam)
    // (and the torso's own side lines stop where they come onto the lap's cloth: inside it they read as a seam down the lap)
    let offLap = (f: () => void) => f();
    if (lapOn) { const hull = lapDrape(); offLap = (f) => k.clip(outside(hull), f); k.shape(t, L.coat, 0); if (weave) k.tweed(t, WEAVE, weave, F.tilt, 14, 2.4); offLap(() => k.line(outline(true), k.ol)); }
    else piece(k, t, L.bare ? L.skin : L.coat, weave, F.tilt);
    k.clip(t, () => {
      // a striped (or checked) shirt: bands across the body, level in the figure's own frame; a check adds bands down it, on the
      // surface of the body so that they close up toward its sides
      if (L.stripes) { const bot = L.rows[0][0] - 40, w = L.stripes.check ? STRIPE.wc : STRIPE.w, wide = Math.max(...L.rows.map((r) => r[1]));
        for (let a = bot; a < top + 30; a += STRIPE.gap) k.shape([F.T(-400, a), F.T(400, a), F.T(400, a + w), F.T(-400, a + w)], L.stripes.col, 0);
        if (L.stripes.check) for (let l = -wide + STRIPE.gap / 2; l < wide; l += STRIPE.gap) k.shape([S(l - w / 2, top + 30, back), S(l + w / 2, top + 30, back), S(l + w / 2, bot, back), S(l - w / 2, bot, back)], L.stripes.col, 0); }
      if (L.bare && front && !STYLE.simple) { for (const s of [-1, 1]) k.line(spline([S(s * 52, top * 0.66), S(s * 26, top * 0.56), S(s * 4, top * 0.62)], false, 6), k.ol * 0.6); k.dot(S(0, top * 0.36)[0], S(0, top * 0.36)[1], 4, shade(L.skin, 0.7)); }
      if (L.bare && back) k.line([S(0, top * 0.86, true), S(0, top * 0.36, true)], k.ol * 0.5);
      if (L.clavi && (front || back)) for (const s of [-1, 1]) k.shape([S(s * 22 - 7, top + 6, back), S(s * 22 + 7, top + 6, back), S(s * 22 + 7, L.rows[0][0] - 10, back), S(s * 22 - 7, L.rows[0][0] - 10, back)], L.clavi, 0);
      if (L.loin) { k.shape([F.T(-400, L.rows[0][0] - 20), F.T(400, L.rows[0][0] - 20), F.T(400, top * 0.14), F.T(-400, top * 0.14)], L.loin, k.ol); if (front) k.shape([S(-26, top * 0.14), S(26, top * 0.14), S(18, L.rows[0][0] + 6), S(-18, L.rows[0][0] + 6)], shade(L.loin, 0.88), k.ol * 0.7); }
      if (L.balteus) { k.shape([F.T(-400, top * 0.12), F.T(400, top * 0.12), F.T(400, top * 0.27), F.T(-400, top * 0.27)], L.balteus, k.ol); if (front && !STYLE.simple) for (const l of [-40, -14, 14, 40]) k.dot(S(l, top * 0.195)[0], S(l, top * 0.195)[1], 5, BRASS); }
      if (jk && L.plain && front) { k.line([S(0, top), S(0, L.rows[0][0])], k.ol); for (const s of [-1, 1]) k.shape([S(s * 30, top * 0.74), S(s * 62, top * 0.74), S(s * 62, top * 0.56), S(s * 30, top * 0.56)], shade(L.coat, 1.12), k.ol); k.shape([S(-30, top + 4), S(30, top + 4), S(22, top - 26), S(0, top - 14), S(-22, top - 26)], shade(L.coat, 0.84), k.ol); }
      if (L.emblem === "cross" && front) { k.shape([S(-10, top * 0.84), S(10, top * 0.84), S(10, top * 0.2), S(-10, top * 0.2)], L.accent, 0); k.shape([S(-38, top * 0.66), S(38, top * 0.66), S(38, top * 0.52), S(-38, top * 0.52)], L.accent, 0); }
      if (jk && !L.plain && front) {
        k.shape([S(-30, top - 20), S(30, top - 20), S(38, top * 0.44), S(15, top * 0.1), S(0, top * 0.04), S(-15, top * 0.1), S(-38, top * 0.44)], L.accent, k.ol);
        k.shape([S(-20, top), S(20, top), S(0, top * 0.72)], CREAM, k.ol);
        for (const s of [-1, 1]) { const lap = [S(s * 20, top + 2), S(s * 64, top * 0.84), S(s * 48, top * 0.74), S(s * 8, top * 0.46)]; k.shape(shift(lap, 4, 5), "rgba(52,32,16,0.22)", 0); k.shape(lap, shade(L.coat, 1.14)); k.line([S(s * 8, top * 0.46), S(s * 26, L.rows[0][0])], k.ol); }
      }
      if (jk && back) { k.shape([S(-30, top + 10, true), S(30, top + 10, true), S(34, top - 16, true), S(-34, top - 16, true)], L.plain ? shade(L.coat, 0.84) : CREAM, k.ol); k.line([S(0, top - 16, true), S(0, L.rows[0][0], true)], k.ol); k.shape([S(-42, top * 0.33, true), S(42, top * 0.33, true), S(42, top * 0.23, true), S(-42, top * 0.23, true)], coatD, k.ol); }
      if (L.armour) { const y0 = top * 0.3; k.shape([F.T(-400, y0), F.T(400, y0), F.T(400, top + 40), F.T(-400, top + 40)], "#b9c3cd", k.ol); if (!STYLE.simple) for (let a = y0 + 34; a < top; a += 34) k.line([F.T(-400, a), F.T(400, a)], k.ol * 0.8); }
      if (L.apron && front) k.shape([S(-L.rows[3][1] * 0.6, top * 0.78), S(L.rows[3][1] * 0.6, top * 0.78), S(L.rows[0][1] * 0.68, L.rows[0][0] + 24), S(-L.rows[0][1] * 0.68, L.rows[0][0] + 24)], L.apron, k.ol);
      if (L.apron && !front && !back) k.shadeEdge(t, L.apron, 24 * d, 0);
      if (L.cloak && front) k.shape([S(-L.rows[3][1], top + 6), S(L.rows[3][1] * 0.2, top + 6), S(L.rows[2][1] * 1.2, top * 0.3), S(L.rows[1][1] * 1.2, top * 0.1), S(-L.rows[3][1] * 1.2, top * 0.62)], L.cloak, k.ol);
      if (L.belt) k.line([F.T(-400, top * 0.3), F.T(400, top * 0.3)], 12, L.belt, "butt");
      // the sling: from his left shoulder across his chest to his right hip (on his back the other way round), three holsters with two
      // pistol butts standing out of each on the front
      // (from his left shoulder down to his right hip, broad, so that it reads as a bandolier across the whole chest)
      if (L.sling) { const a0: P2 = [100, top + 10], a1: P2 = [-92, -24], on = (u: number, w: number): P2 => S(lerp(a0[0], a1[0], u) + w, lerp(a0[1], a1[1], u), back);
        k.shape([on(0, -24), on(0, 24), on(1, 24), on(1, -24)], "#4a3020", k.ol * 0.8);
        // (the three holsters low on the strap, below the beard, so that all six pistols show)
        // (each holster hangs down from the strap with the butts of its two pistols standing up out of it; these offsets are on the
        // canvas, where y runs down)
        if (!back) for (const u of [0.42, 0.66, 0.9]) { const c = on(u, 0); for (const sx of [-1, 1]) { k.shape([[c[0] + sx * 15 - 9, c[1] - 2], [c[0] + sx * 15 + 9, c[1] - 2], [c[0] + sx * 20 + 9, c[1] - 42], [c[0] + sx * 20 - 9, c[1] - 42]], "#6a4428", k.ol * 0.6); k.dot(c[0] + sx * 20, c[1] - 45, 11, BRASS); }
          k.shape([[c[0] - 32, c[1] - 8], [c[0] + 32, c[1] - 8], [c[0] + 27, c[1] + 50], [c[0] - 27, c[1] + 50]], "#2e2016", k.ol * 0.7); } }
    });
    if (lapOn) offLap(() => k.line(outline(true), k.ol)); else k.shape(t, null);
    // the neckerchief: a band round the throat, and in front its knot with two short ends hanging from it (seen from behind, its point
    // hangs down his back)
    if (L.scarf) { const nw = P.head * 0.14;
      piece(k, [F.T(-nw * 1.35, top - 16), F.T(nw * 1.35, top - 16), F.T(nw * 1.05, top + 20), F.T(-nw * 1.05, top + 20)], L.scarf);
      if (back) piece(k, [S(-nw * 1.4, top - 10, true), S(nw * 1.4, top - 10, true), S(0, top * 0.74, true)], L.scarf);
      else { for (const s of [-1, 1]) piece(k, [S(s * 6, top - 24), S(s * 36, top * 0.7), S(s * 16, top * 0.73)], shade(L.scarf, 0.9)); piece(k, [S(-18, top - 6), S(18, top - 6), S(13, top - 34), S(-13, top - 34)], L.scarf); } }
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
  // the head as drawn (an ellipse round the middle of the skull) and the torso's outline: an arm drawn before them is hidden where it
  // lies over them. A hand whose forearm is hidden that way is noted ("hidL", "hidR"): if it holds something, its fist would float
  const hc = mid(sk.j.skull, sk.j.crown, 0.5), hw = Math.hypot(L.head.a * sk.cos, L.head.b * sk.sin), hh = L.head.H / 2, tor = outline();
  const inHead = (p: P2) => ((p[0] - hc[0]) / hw) ** 2 + ((p[1] - hc[1]) / hh) ** 2 < 1, inTorso = (p: P2) => within(tor, p), inBody = (p: P2) => inHead(p) || inTorso(p);
  const hid = (s: Side, by: (p: P2) => boolean) => { const W = sk.j[`wr${s}`]; if (by(W) && by(mid(sk.j[`el${s}`], W, 0.5))) k.mark(`hid${s}`, W[0], W[1]); };
  // (the order the body is drawn in, noted for motionCheck's order test: a part that changes order for one frame appears or vanishes, as the
  //  mate's far arm and the pirate's shoulder button did at a turn of exactly 30 degrees, the review of v1r)
  // (each arm drawn after the head or before it as the stage settled it for the shot, o.armFix: from one frame to the next it may change
  //  only where the arm is clear of the head, the review of v1t; armOrder for what each choice means)
  const ao = armOrder(L, sk), after = (s: Side) => (o.armFix ? o.armFix[s] : ao.after[s]);
  k.val("order", (sideOn ? 1 : 0) + (back ? 2 : 0) + (!sideOn && after("L") ? 4 : 0) + (!sideOn && after("R") ? 8 : 0));
  for (const s of ["L", "R"] as const) { k.val(`armAfter${s}`, !sideOn && after(s) ? 1 : 0); k.val(`freeArm${s}`, ao.freeArm[s] ? 1 : 0); k.val(`freeFore${s}`, ao.freeFore[s] ? 1 : 0); }
  if (sideOn) { hid(far, inBody); arm(far); leg(far); leg(near); torso(); head(); chainDraw(); arm(near); }
  else {
    // seen from the front, a hand at the face is in front of the face: its arm is drawn after the head, never behind it
    leg(far); leg(near);
    if (back) { for (const s of [far, near]) if (after(s)) { hid(s, inBody); arm(s); } torso(); for (const s of [far, near]) if (!after(s)) { hid(s, inHead); arm(s); } head(); }
    else { torso(); for (const s of [far, near]) if (!after(s)) { hid(s, inHead); arm(s); } head(); chainDraw(); for (const s of [far, near]) if (after(s)) arm(s); }
  }
  k.ink = ink0;
};
