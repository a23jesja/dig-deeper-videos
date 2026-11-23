// The flat v4's approved drawings, copied unchanged from src/craft/alcatraz/alcatraz.ts (that file is left untouched): the fake head (painted
// shut eyes, hair), the guard's hand holding the torch by the grip rule (palm and thumb behind, the shaft over the palm, four fingers round it
// in front) and the light's cone with its soft spot. Used by the style test v12: the fake head as a picture on a card in the Blender set (so
// the bars and the light treat it as a thing in the cell, and every face is flat Knopp), the hand and the torch over the plate.
type G = CanvasRenderingContext2D;
type P2 = [number, number];
const INK = "#241726", OL = 9;
export const SKIN = "#f7c9a3";
const poly = (g: G, pts: P2[], fill: string | null, w = OL, close = true) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); if (close) g.closePath();
  if (fill) { g.fillStyle = fill; g.fill(); } if (w) { g.lineWidth = w; g.lineJoin = "round"; g.lineCap = "round"; g.strokeStyle = INK; g.stroke(); } };
const rrect = (g: G, x: number, y: number, w: number, h: number, r: number, fill: string, lw = OL) => { g.beginPath(); g.roundRect(x, y, w, h, r); g.fillStyle = fill; g.fill(); if (lw) { g.lineWidth = lw; g.strokeStyle = INK; g.stroke(); } };
const ell = (g: G, x: number, y: number, rx: number, ry: number, fill: string | null, lw = OL, rot = 0) => { g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.lineWidth = lw; g.strokeStyle = INK; g.stroke(); } };
const line = (g: G, pts: P2[], w = OL, col = INK) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.lineWidth = w; g.lineCap = "round"; g.lineJoin = "round"; g.strokeStyle = col; g.stroke(); };
const glow = (g: G, x: number, y: number, r: number, col: string, a: number) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, col.replace("A", String(a))); gr.addColorStop(1, col.replace("A", "0")); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); };

/** the fake head (v4's fakeHead): a round face of plaster colour with painted shut eyes and real-looking hair */
export const fakeHead = (g: G, x: number, y: number, s: number, light = 0, hair = "#5a3a24") => {
  g.save(); g.translate(x, y); g.scale(s, s);
  ell(g, 0, 0, 92, 96, light > 0.5 ? "#f1cfae" : "#e7c39f");
  poly(g, [[-96, -6], [-90, -70], [-40, -104], [30, -106], [86, -72], [96, -10], [70, -50], [20, -70], [-30, -66], [-74, -40]], hair);
  for (const sx of [-34, 34]) line(g, [[sx - 16, 10], [sx, 16], [sx + 16, 10]], OL * 0.8);
  ell(g, 0, 34, 10, 8, "#e0a68c", OL * 0.7);
  line(g, [[-14, 60], [14, 60]], OL * 0.7);
  g.restore(); };

/** v4's cone: from (x0, y0) to a spot at (x1, y1) of radius r, fading before the spot, the spot a soft glow */
export const cone = (g: G, x0: number, y0: number, x1: number, y1: number, r: number, a: number) => {
  const dx = x1 - x0, dy = y1 - y0, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
  for (const [w, al] of [[1, 0.16], [0.7, 0.14], [0.42, 0.14]] as [number, number][]) {
    const gr = g.createLinearGradient(x0, y0, x0 + dx * 0.85, y0 + dy * 0.85); gr.addColorStop(0, `rgba(255,240,170,${al * 2 * a})`); gr.addColorStop(0.7, `rgba(255,240,170,${al * a})`); gr.addColorStop(1, "rgba(255,240,170,0)");
    g.fillStyle = gr; g.beginPath(); g.moveTo(x0 + nx * 8, y0 + ny * 8); g.lineTo(x0 + dx * 0.85 + nx * r * w, y0 + dy * 0.85 + ny * r * w); g.lineTo(x0 + dx * 0.85 - nx * r * w, y0 + dy * 0.85 - ny * r * w); g.lineTo(x0 - nx * 8, y0 - ny * 8); g.closePath(); g.fill(); }
  glow(g, x1, y1, r * 1.3, "rgba(255,244,190,A)", 0.6 * a); };

/** v4's hand: the back (sleeve to past the picture's edge, cuff, palm, thumb) behind the held thing, the fingers in front of it */
type HandSpec = { x: number; y: number; ang: number; s: number; sleeve: string; cuff?: string; curl?: number; thumb?: number; sleeveLen?: number };
const handBack = (g: G, h: HandSpec) => { const L = h.sleeveLen ?? 3000;
  g.save(); g.translate(h.x, h.y); g.rotate(h.ang); g.scale(h.s, h.s);
  if (L > 0) poly(g, [[-L, -34], [-40, -40], [-40, 40], [-L, 34]], h.sleeve);
  if (L > 0) rrect(g, -52, -40, 26, 80, 8, h.cuff ?? "#fffaf0");
  ell(g, 6, 0, 40, 36, SKIN);
  const th = h.thumb ?? 0.6; g.save(); g.translate(4, -30); g.rotate(-0.9 + th * 0.6); ell(g, 22, 0, 24, 13, SKIN); g.restore();
  g.restore(); };

/** v4's heldTorch: the guard's hand holding the torch, its light from the lens to the spot. Returns the lens.
 *  sleeveLen 0: only the palm, the thumb, the torch and the fingers (drawn over the rig's own hand, whose arm and cuff are the figure's) */
export const heldTorch = (g: G, hx: number, hy: number, ang: number, spot: P2 | null, light: number, s = 1.2, sleeve = "#33456a", sleeveLen = 3000): P2 => {
  const dx = Math.cos(ang), dy = Math.sin(ang), lens: P2 = [hx + dx * 82 * s, hy + dy * 82 * s];
  if (spot && light > 0) { g.save(); g.globalCompositeOperation = "lighter"; cone(g, lens[0], lens[1], spot[0], spot[1], 130 * s / 1.2, light); g.restore(); }
  const H: HandSpec = { x: hx, y: hy, ang, s: 1.1 * s / 1.2, sleeve, curl: 1, sleeveLen };
  handBack(g, H);
  g.save(); g.translate(hx, hy); g.rotate(ang); g.scale(s, s);
  rrect(g, -22, -18, 70, 36, 8, "#3d4048");
  poly(g, [[46, -24], [80, -38], [80, 38], [46, 24]], "#5c616c"); ell(g, 80, 0, 8, 38, "#fff6c8", OL * 0.6);
  g.restore();
  g.save(); g.translate(hx, hy); g.rotate(ang); g.scale(H.s, H.s); for (let i = 0; i < 4; i++) { const y = -22 + i * 15; ell(g, 14, y, 14, 9, SKIN, OL * 0.8); } g.restore();
  return lens; };
