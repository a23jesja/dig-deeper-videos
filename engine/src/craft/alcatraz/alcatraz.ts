// Alcatraz 1962 ("Three Men Vanished From Alcatraz in 1962"), a Short in the flat 2D look A Knopp. The script, the sources and the shot list:
// granskning/alcatraz/stopp-manus-kallor-bildlista-v2.md (approved), with the shots 8-11 rewritten to the approved shot types for tonight
// (the review session, 22 Nov: no climbing and no paddling, which are no shot types yet).
// Each shot is a Clip of the shot-type kit (its own seconds, camera, background and things in front), so clip_check runs on it as on the
// library's clips; the film (AlcatrazFilm.tsx) plays them one after another on the narration's times.
import { solve, type Pose } from "../rig";
import type { Face, Look } from "../designs/common";
import { ease } from "../stage/acting";
import { FM, D, figure, castAt, jointPx, scaleOf, footY, fitCam, px, viewOf, figBox, type Clip, type Cast, type Fig } from "../clips/clipKit";
import { Ink } from "../ink";

type G = CanvasRenderingContext2D;
type P2 = [number, number];
const INK = "#241726", OL = 9;
const smooth = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const env = (t: number, a: number, up: number, b: number, down: number) => (t < a ? 0 : t < a + up ? smooth((t - a) / up) : t < b ? 1 : t < b + down ? 1 - smooth((t - b) / down) : 0);
/** the screen as the world: a prop-only shot is drawn in picture pixels (zoom 1) */
const SCREEN = { cx: FM.W / 2, cy: FM.H / 2, z: 1 };

// ---------------------------------------------------------------- drawing helpers ----------------------------------------------------------------
const poly = (g: G, pts: P2[], fill: string | null, w = OL, close = true) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); if (close) g.closePath();
  if (fill) { g.fillStyle = fill; g.fill(); } if (w) { g.lineWidth = w; g.lineJoin = "round"; g.lineCap = "round"; g.strokeStyle = INK; g.stroke(); } };
const rect = (g: G, x: number, y: number, w: number, h: number, fill: string, lw = OL) => poly(g, [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], fill, lw);
const rrect = (g: G, x: number, y: number, w: number, h: number, r: number, fill: string, lw = OL) => { g.beginPath(); g.roundRect(x, y, w, h, r); g.fillStyle = fill; g.fill(); if (lw) { g.lineWidth = lw; g.strokeStyle = INK; g.stroke(); } };
const ell = (g: G, x: number, y: number, rx: number, ry: number, fill: string | null, lw = OL, rot = 0) => { g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.lineWidth = lw; g.strokeStyle = INK; g.stroke(); } };
const line = (g: G, pts: P2[], w = OL, col = INK) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.lineWidth = w; g.lineCap = "round"; g.lineJoin = "round"; g.strokeStyle = col; g.stroke(); };
const fillAll = (g: G, col: string) => { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = col; g.fillRect(0, 0, 4000, 4000); g.restore(); };
/** a soft light: a radial glow (a torch's spot, a moon, a siren) */
const glow = (g: G, x: number, y: number, r: number, col: string, a: number) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, col.replace("A", String(a))); gr.addColorStop(1, col.replace("A", "0")); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); };
/** a light's cone from (x0, y0) to a spot at (x1, y1) of radius r */
const cone = (g: G, x0: number, y0: number, x1: number, y1: number, r: number, a: number) => {
  const dx = x1 - x0, dy = y1 - y0, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
  const gr = g.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, `rgba(255,240,170,${0.55 * a})`); gr.addColorStop(1, `rgba(255,240,170,${0.22 * a})`);
  g.fillStyle = gr; g.beginPath(); g.moveTo(x0 + nx * 10, y0 + ny * 10); g.lineTo(x1 + nx * r, y1 + ny * r); g.lineTo(x1 - nx * r, y1 - ny * r); g.lineTo(x0 - nx * 10, y0 - ny * 10); g.closePath(); g.fill();
  glow(g, x1, y1, r * 1.25, "rgba(255,244,190,A)", 0.55 * a); };

// ---------------------------------------------------------------- hands ----------------------------------------------------------------
// A hand in the look of the figures: a round palm, four short fingers and a thumb, a cuff and a sleeve, drawn in two parts so that a held
// thing goes between them: the back (sleeve, cuff, palm, thumb) behind it, the fingers in front of it (the grip rule of 17 Nov: fingers in
// front of the thing, the palm behind). ang: the direction the hand points (radians), s: its size (1 = a palm 70 px across)
const SKIN = "#f7c9a3";
type HandSpec = { x: number; y: number; ang: number; s: number; sleeve: string; cuff?: string; curl?: number; thumb?: number };
const handBack = (g: G, h: HandSpec) => {
  g.save(); g.translate(h.x, h.y); g.rotate(h.ang); g.scale(h.s, h.s);
  poly(g, [[-260, -34], [-40, -40], [-40, 40], [-260, 34]], h.sleeve);            // sleeve, from behind the wrist back
  rrect(g, -52, -40, 26, 80, 8, h.cuff ?? "#fffaf0");                              // cuff
  ell(g, 6, 0, 40, 36, SKIN);                                                      // palm
  const th = h.thumb ?? 0.6; g.save(); g.translate(4, -30); g.rotate(-0.9 + th * 0.6); ell(g, 22, 0, 24, 13, SKIN); g.restore();      // thumb
  g.restore(); };
const handFingers = (g: G, h: HandSpec) => {
  g.save(); g.translate(h.x, h.y); g.rotate(h.ang); g.scale(h.s, h.s);
  const c = h.curl ?? 0.6;
  for (let i = 0; i < 4; i++) { const y = -24 + i * 16; g.save(); g.translate(30, y); g.rotate(c * 0.9); ell(g, 18 - c * 4, 0, 22 - c * 6, 9, SKIN, OL * 0.8); g.restore(); }
  g.restore(); };
const hand = (g: G, h: HandSpec) => { handBack(g, h); handFingers(g, h); };

// ---------------------------------------------------------------- the people's looks ----------------------------------------------------------------
/** the guard: a navy uniform and cap with a black band and a gold badge, a grey moustache; no monocle, no pipe */
const GUARD: Look = { col: { coat: "#33456a", vest: "#33456a", shirt: "#dfe5ec", tie: "#1b2235", trous: "#2a3756", shoe: "#1d1a22", cap: "#2c3b5c", hair: "#8d8a86" }, band: "#15192a", badge: "#e8c45a", mono: false, pipe: false, brow: "#6e6a66" };
/** an inmate: a blue prison shirt, dark trousers, a dark knit cap; clean-shaven, no monocle, no pipe */
const INMATE: Look = { col: { coat: "#7ea6cf", vest: "#9dbedd", shirt: "#9dbedd", tie: "#9dbedd", trous: "#33405a", shoe: "#26222a", cap: "#3a3f4c", hair: "#3a2a20" }, band: "#3a3f4c", mono: false, pipe: false, moustache: false };
/** an inmate seen against the moon: all of him one dark colour */
const SHADE: Look = { col: { coat: "#202a3c", vest: "#202a3c", shirt: "#202a3c", tie: "#202a3c", trous: "#1a2232", shoe: "#141a26", cap: "#1a2232", hair: "#1a2232", skin: "#2a3550", nose: "#2a3550" }, band: "#1a2232", mono: false, pipe: false, moustache: false, brow: "#1a2232" };
const GUARD_SLEEVE = "#33456a", INMATE_SLEEVE = "#7ea6cf";

// ---------------------------------------------------------------- props ----------------------------------------------------------------
/** the fake head on a pillow: a round face of plaster colour with painted shut eyes and real-looking hair (Bureau of Prisons: "realistic
 *  dummy heads (complete with human hair)") */
const fakeHead = (g: G, x: number, y: number, s: number, light = 0) => {
  g.save(); g.translate(x, y); g.scale(s, s);
  ell(g, 0, 0, 92, 96, light > 0.5 ? "#f1cfae" : "#e7c39f");
  poly(g, [[-96, -6], [-90, -70], [-40, -104], [30, -106], [86, -72], [96, -10], [70, -50], [20, -70], [-30, -66], [-74, -40]], "#5a3a24");
  for (const sx of [-34, 34]) line(g, [[sx - 16, 10], [sx, 16], [sx + 16, 10]], OL * 0.8);       // painted shut eyes
  ell(g, 0, 34, 10, 8, "#e0a68c", OL * 0.7);
  line(g, [[-14, 60], [14, 60]], OL * 0.7);
  g.restore(); };
const pillow = (g: G, x: number, y: number, s: number) => rrect(g, x - 150 * s, y - 60 * s, 300 * s, 120 * s, 50 * s, "#eef0f2");
const blanket = (g: G, x: number, y: number, w: number, top: number, col = "#6f7f68") => {
  poly(g, [[x, top + 20], [x + w * 0.2, top], [x + w * 0.55, top + 14], [x + w, top + 4], [x + w + 10, top + 220], [x - 10, top + 220]], col);
  line(g, [[x + w * 0.08, top + 60], [x + w * 0.92, top + 54]], OL * 0.6, "#4f5d4a"); };
/** prison bars across the picture, x0 to x1, every gap px */
const bars = (g: G, x0: number, x1: number, y0: number, y1: number, gap: number, col = "#5d6675") => {
  for (let x = x0; x <= x1; x += gap) rect(g, x - 9, y0, 18, y1 - y0, col, OL * 0.8);
  rect(g, x0 - 20, y0 + 60, x1 - x0 + 40, 22, col, OL * 0.8); rect(g, x0 - 20, y1 - 140, x1 - x0 + 40, 22, col, OL * 0.8); };
const cellWall = (g: G, col = "#3b4558") => { fillAll(g, col); for (let y = 200; y < 1900; y += 120) line(g, [[-100, y], [1200, y]], 3, "rgba(20,20,40,0.25)"); };
const torch = (g: G, x: number, y: number, ang: number, s: number) => { g.save(); g.translate(x, y); g.rotate(ang); g.scale(s, s); rrect(g, -120, -20, 130, 40, 10, "#3d4048"); poly(g, [[10, -26], [44, -40], [44, 40], [10, 26]], "#5c616c"); ell(g, 44, 0, 8, 40, "#fff6c8", OL * 0.6); g.restore(); };
/** a vent grill in the wall: a frame and slats */
const grill = (g: G, x: number, y: number, w: number, h: number) => { rect(g, x, y, w, h, "#8a8f98"); for (let i = 1; i < 6; i++) { const yy = y + (h * i) / 6; line(g, [[x + 18, yy], [x + w - 18, yy]], OL * 1.2); } };
const SPOT: P2 = [0, 0];
void SPOT;

// ---------------------------------------------------------------- the shots ----------------------------------------------------------------
type Shot = Clip & { sounds?: { t: number; k: string; g?: number; p?: number; dur?: number; big?: number }[] };
const propShot = (id: string, title: string, seconds: number, draw: (g: G, t: number) => void, sounds?: Shot["sounds"], cam: { cx: number; cy: number; z: number } = SCREEN): Shot =>
  ({ id, title, seconds, cast: [], events: {}, shot: "full", camera: () => cam, ownBg: draw, sounds });
/** the cell's camera: shot 1 and the loop's shot 17 the same, so the loop's last frame runs into the first */
const CELL_CAM = { cx: 520, cy: 1250, z: 1.45 };

/** the guard's hand holding the torch (the palm behind, the fingers round the torch in front), and the light from its lens to the spot */
const heldTorch = (g: G, hx: number, hy: number, ang: number, spot: P2 | null, light: number) => {
  const dx = Math.cos(ang), dy = Math.sin(ang), s = 1.2, lens: P2 = [hx + dx * 64 * s, hy + dy * 64 * s];
  if (spot && light > 0) { g.save(); g.globalCompositeOperation = "lighter"; cone(g, lens[0], lens[1], spot[0], spot[1], 150, light); g.restore(); }
  const H: HandSpec = { x: hx, y: hy, ang, s: 1.1, sleeve: GUARD_SLEEVE, curl: 1 };
  handBack(g, H); torch(g, hx + dx * 10 * s, hy + dy * 10 * s, ang, s); handFingers(g, H); };
// 1  the cell at night: the guard's torch already on the pillow in the first frame, its spot settling on the fake head (hook: the light
//    hits the head from frame 1, the automation session's condition 2)
const BED_Y = 1240;
const cellNight = (g: G, light: number, spotX: number, spotY: number, t: number, sleeper = true) => {
  cellWall(g, "#2b3346");
  rect(g, 120, BED_Y, 840, 60, "#5b4a3c"); rect(g, 150, BED_Y + 60, 30, 260, "#5b4a3c"); rect(g, 900, BED_Y + 60, 30, 260, "#5b4a3c");      // bed
  pillow(g, 320, BED_Y - 30, 1.1);
  if (sleeper) { blanket(g, 420, 0, 520, BED_Y - 120); fakeHead(g, 330, BED_Y - 110, 0.9, light); }
  void t; void light; void spotX; void spotY; };
const s01 = (): Shot => propShot("a01", "1 Ficklampan", 1.8, (g, t) => {
  const u = smooth(t / 0.9), sx = lerp(400, 330, u), sy = lerp(1060, BED_Y - 120, u);
  cellNight(g, 1, sx, sy, t); bars(g, 40, 1060, 300, 1700, 170);
  const hx = lerp(330, 320, u), hy = lerp(1760, 1750, u), a = Math.atan2(sy - hy, sx - hx); heldTorch(g, hx, hy, a, [sx, sy], 1);
}, [{ t: 0, k: "tap", g: 1.4 }], CELL_CAM);

// 2  extreme close-up of the guard's eyes narrowing (the guard's head on the rig, the camera on his eyes)
const eyesShot = (id: string, title: string, seconds: number, look: Look, faceAt: (t: number) => Face, ownBg: (g: G, t: number) => void, front?: (g: G, t: number, figs: Fig[]) => void, seed = 6): Shot => {
  const m = figure("sir", 0, 0); m.stand(seconds + 1);
  // (a blink seed with no blink in the shot: an eye close-up blinking in its first frames, the hook lab B draft)
  const cast: Cast[] = [{ name: "eyes", m, who: "sir", look, seed, pose: (t, p) => ({ ...p, head: [0, 2, 0] }) }];
  const g0 = castAt(cast, 0)[0], sk = jointPx(g0, "skull"), s = scaleOf("sir");
  const eye: P2 = [sk[0], sk[1] - 118 * s];
  return { id, title, seconds, cast, events: {}, shot: "medium", ownBg, front, offFrameOK: () => true, camera: (t) => ({ cx: eye[0], cy: eye[1] + 10 * s, z: 4.2 + 0.25 * t }) } as Shot;
};
const s02 = (): Shot => {
  const sh = eyesShot("a02", "2 Vaktens ögon", 1.6, GUARD, () => ({}), (g) => { fillAll(g, "#1c2232"); });
  ease(sh.cast[0].m, -1, {}, 0.01, { face: { pupil: 1, gaze: [0.2, 0.3] } });
  ease(sh.cast[0].m, 0.35, {}, 0.35, { face: { pupil: 1, gaze: [0.25, 0.35], brow: -0.8, lid: 0.28 } });
  sh.front = (g, t) => { g.save(); g.globalCompositeOperation = "lighter"; glow(g, sh.camera(t).cx + 70, sh.camera(t).cy + 140, 260, "rgba(255,240,170,A)", 0.25); g.restore(); };
  return sh; };

// 3  three cells in a row, the camera gliding along the bars: in each a pillow with a head under a blanket (they look asleep)
const s03 = (): Shot => propShot("a03", "3 Tre celler", 2.4, (g, t) => {
  const pan = lerp(0, 560, smooth(t / 2.4)), base = -pan;
  fillAll(g, "#262d3e");
  for (let i = 0; i < 3; i++) { const x = base + 220 + i * 760;
    rect(g, x - 40, 520, 700, 1180, "#2f384c", OL);
    rect(g, x + 40, 1220, 560, 50, "#5b4a3c"); pillow(g, x + 170, 1190, 0.8); blanket(g, x + 240, 0, 360, 1110); fakeHead(g, x + 170, 1120, 0.66);
    for (let b = 0; b <= 6; b++) rect(g, x - 30 + b * 112, 520, 16, 1180, "#5d6675", OL * 0.7);
    rect(g, x - 50, 560, 720, 20, "#5d6675", OL * 0.7);
    rect(g, x + 676, 760, 40, 60, "#4a4f5c", OL * 0.6); g.save(); g.globalCompositeOperation = "lighter"; glow(g, x + 696, 800, 200, "rgba(255,220,150,A)", 0.25); g.restore(); }
  rect(g, -100, 1700, 1400, 300, "#1c212e", 0);
}, [{ t: 0.9, k: "drip", g: 0.8 }], { cx: 560, cy: 1120, z: 1.5 });

// 4  the map on the table: the island in the bay, the city across the water; a hand moves a marker from the island toward the city, a candle
//    burns beside it
const s04 = (): Shot => propShot("a04", "4 Kartan", 2.5, (g, t) => {
  fillAll(g, "#5a3d2a"); for (let y = 0; y < 1920; y += 90) line(g, [[-50, y + 30], [1200, y]], 4, "rgba(30,15,5,0.35)");
  poly(g, [[110, 520], [990, 480], [1010, 1380], [90, 1420]], "#efe2c0");
  poly(g, [[130, 600], [500, 560], [640, 700], [760, 640], [980, 700], [990, 1360], [140, 1390]], "#8fb9d6", OL * 0.7);      // the bay
  poly(g, [[760, 520], [990, 500], [990, 820], [880, 780], [800, 690]], "#d9c79a", OL * 0.7);                              // the city's shore
  for (let i = 0; i < 6; i++) rect(g, 820 + i * 26, 560 - (i % 3) * 20, 20, 80 + (i % 3) * 20, "#a59a80", OL * 0.5);
  ell(g, 380, 1040, 52, 30, "#c9b48a", OL * 0.7);                                                                        // the island
  rect(g, 360, 1010, 30, 22, "#7d7468", OL * 0.5);
  const u = smooth((t - 0.5) / 1.4), mx = lerp(400, 760, u), my = lerp(1030, 760, u);
  // (the fingers on the marker the whole way: the hand lagged 60-90 px behind it, the risk sheet's first draft)
  // (the fingers over the marker's lower half, so the marker shows above them)
  const MH: HandSpec = { x: mx - 0.58 * 62, y: my + 0.81 * 62, ang: -0.95, s: 0.95, sleeve: INMATE_SLEEVE, curl: 0.8, thumb: 0.9 };
  handBack(g, MH); ell(g, mx, my, 30, 30, "#c0392b", OL * 0.8); handFingers(g, MH);
  // the candle: its flame sways slowly (no flicker from frame to frame)
  rect(g, 870, 1500, 70, 210, "#f2ead8"); const sw = Math.sin(t * 3.1) * 4;
  g.save(); g.globalCompositeOperation = "lighter"; glow(g, 905, 1440, 220, "rgba(255,200,110,A)", 0.4); g.restore();
  poly(g, [[905 + sw, 1420], [925, 1478], [905, 1500], [885, 1478]], "#ffcf5a", OL * 0.6);
}, [{ t: 0.55, k: "tap", g: 0.8 }]);

// 5  hands: a homemade tool scraping round the vent grill in the cell wall, dust falling
const s05 = (): Shot => propShot("a05", "5 Ventilen", 3.7, (g, t) => {
  fillAll(g, "#8c8a84"); for (let i = 0; i < 40; i++) { const x = (i * 263) % 1080, y = (i * 571) % 1920; ell(g, x, y, 6, 4, "#7a7872", 0); }
  grill(g, 300, 660, 480, 360);
  line(g, [[290, 650], [790, 650], [790, 1030], [290, 1030], [290, 650]], 5, "#5f5d58");
  // the scrape: along the grill's lower edge and back, four strokes
  const k = (t * 1.6) % 2, u = k < 1 ? smooth(k) : smooth(2 - k), tx = lerp(340, 740, u), ty = 1046;
  for (let i = 0; i < 14; i++) { const a = ((t * 0.9 + i * 0.137) % 1), x = 330 + ((i * 97) % 440), y = 1050 + a * 700; ell(g, x, y, 5, 5, "#d9d2c0", 0); }
  const H: HandSpec = { x: tx + 120, y: ty + 160, ang: -2.3, s: 1.1, sleeve: INMATE_SLEEVE, curl: 1 };
  handBack(g, H); g.save(); g.translate(tx, ty); g.rotate(-2.3 + Math.PI); rrect(g, -6, -8, 190, 16, 6, "#b9bec6", OL * 0.7); g.restore(); handFingers(g, H);
  // the other hand steadying the grill's corner
  { const S2: HandSpec = { x: 800, y: 632, ang: 2.45, s: 1.0, sleeve: INMATE_SLEEVE, curl: 0.5, thumb: 0.2 }; handBack(g, S2); handFingers(g, S2); }
}, [0.15, 0.78, 1.4, 2.03, 2.65, 3.28].map((t) => ({ t, k: "scratch", g: 0.9 })), { cx: 580, cy: 1000, z: 1.2 });

// 6  raincoats laid one over another, the raft growing (seen from above); two hands press a seam
const COATS: [number, number, number][] = [[260, 760, -0.2], [520, 720, 0.1], [780, 780, 0.25], [330, 1080, 0.15], [610, 1060, -0.1], [860, 1110, 0.2], [440, 1360, -0.15], [720, 1380, 0.12]];
const s06 = (): Shot => propShot("a06", "6 Regnrockarna", 2.2, (g, t) => {
  fillAll(g, "#4a4f5a");
  COATS.forEach(([x, y, r], i) => { const t0 = i * 0.2, u = smooth((t - t0) / 0.3); if (u <= 0) return;
    g.save(); g.translate(x, y - (1 - u) * 160); g.rotate(r); g.globalAlpha = 1;
    rrect(g, -170, -120, 340, 240, 40, "#c7b56a"); line(g, [[-150, -10], [150, -10]], OL * 0.5, "#9b8b4a"); line(g, [[0, -110], [0, 110]], OL * 0.5, "#9b8b4a"); g.restore(); });
  const p = Math.sin(t * 5) * 6;
  hand(g, { x: 470, y: 1180 + p, ang: -1.3, s: 1.0, sleeve: INMATE_SLEEVE, curl: 0.2, thumb: 0.3 });
  hand(g, { x: 650, y: 1190 - p, ang: -1.85, s: 1.0, sleeve: INMATE_SLEEVE, curl: 0.2, thumb: 0.3 });
}, [0, 0.4, 0.8, 1.2].map((t) => ({ t, k: "flap", g: 0.6 })));

// 7  the fake head laid on the pillow, the blanket pulled up (two hands holding the head by its sides; then one hand on the blanket's edge)
const s07 = (): Shot => propShot("a07", "7 Huvudet på kudden", 1.2, (g, t) => {
  cellWall(g, "#30384a"); rect(g, 60, 1180, 960, 70, "#5b4a3c"); pillow(g, 360, 1140, 1.2);
  const u = smooth(t / 0.55), hy = lerp(900, 1070, u), off = smooth((t - 0.6) / 0.3) * 220;
  const bTop = lerp(1300, 1130, smooth((t - 0.55) / 0.5));
  if (t < 0.9) { const L: HandSpec = { x: 250 - off, y: hy + 10, ang: 0.2, s: 0.9, sleeve: INMATE_SLEEVE, curl: 0.35 }, R: HandSpec = { x: 470 + off, y: hy + 10, ang: Math.PI - 0.2, s: 0.9, sleeve: INMATE_SLEEVE, curl: 0.35 };
    handBack(g, L); handBack(g, R); fakeHead(g, 360, hy, 0.95); handFingers(g, L); handFingers(g, R); } else fakeHead(g, 360, 1070, 0.95);
  blanket(g, 470, 0, 520, bTop);
  if (t > 0.5) hand(g, { x: 760, y: bTop + 30, ang: -1.75, s: 0.9, sleeve: INMATE_SLEEVE, curl: 0.9 });
}, [{ t: 0.5, k: "sack", g: 0.7 }, { t: 0.7, k: "flap", g: 0.5 }], { cx: 540, cy: 1120, z: 1.5 });

// 8  the roof hatch opened from inside (the shot type 08, open a door, with the hatch as the door), seen from below: a hand takes the edge
//    first, then the lid swings up and the night sky shows
const s08 = (): Shot => propShot("a08", "8 Takluckan", 1.4, (g, t) => {
  fillAll(g, "#2a3040");
  const open = smooth((t - 0.35) / 0.8), x0 = 280, x1 = 800, y0 = 520, y1 = 1000;
  rect(g, x0 - 30, y0 - 30, x1 - x0 + 60, y1 - y0 + 60, "#4b5163");
  poly(g, [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], "#0f1730", OL);                                          // the opening: night sky
  ell(g, 640, 640, 46, 46, "#f4f0d6", OL * 0.6); for (const [sx, sy] of [[360, 600], [470, 880], [720, 900], [560, 560]]) ell(g, sx, sy, 4, 4, "#f4f0d6", 0);
  g.save(); g.globalCompositeOperation = "lighter"; glow(g, 640, 900, 520 * open, "rgba(170,190,255,A)", 0.25 * open); g.restore();
  // the lid: hinged at the top edge, its lower edge rising as it opens (seen from below it shortens)
  const ly = lerp(y1, y0 + 30, open); poly(g, [[x0, y0], [x1, y0], [x1, ly], [x0, ly]], "#6b6f7c"); line(g, [[x0 + 30, (y0 + ly) / 2], [x1 - 30, (y0 + ly) / 2]], OL * 0.6, "#4b4f5a");
  // the hand on the lid's lower edge, pushing it up
  hand(g, { x: 560, y: ly + 58, ang: -1.57, s: 1.15, sleeve: INMATE_SLEEVE, curl: 0.15, thumb: 0.4 });      // (its fingertips on the lid's edge: 100 px under it, the risk sheet's first draft)
}, [{ t: 0.3, k: "thunk", g: 1.0 }, { t: 0.4, k: "whoosh", g: 0.4, dur: 0.6 }], { cx: 540, cy: 860, z: 1.3 });

// 9  the roof in moonlight: three men walking crouched in a row (the shot type 02, walk), the searchlight sweeping past above them
const ROOF = FM.GY;
const s09 = (): Shot => {
  // (they walk in a row past a camera close enough for a full shot (50 % of the height or more), coming in at the left edge and going out at
  //  the right like the shot type 02; at 29 % three men side by side were too small, and a first step from feet together put a shoe on the
  //  other, clip_check on the first draft)
  const seconds = 1.6, cast: Cast[] = [], Z = 1.62;
  for (let i = 0; i < 3; i++) { const m = figure("sir", -0.25 - i * 0.5, 90, 0.15); m.walk(2.0, { step: 0.72, tau: 0.6, keep: true }); m.stand(2);
    ease(m, -1, { lean: 14, head: [0, 6, 0] }, 0.01, { face: { pupil: 1, gaze: [0.4, -0.1] } }); cast.push({ name: `man${i}`, m, who: "sir", look: SHADE, seed: 20 + i, armWipe: false, hands: { L: [[0, "fist"]], R: [[0, "fist"]] } }); }
  const top = footY("sir") - FM.PPM * FM.HM - 130, cam = { cx: px(0.05), cy: top + FM.H / (2 * Z), z: Z };
  const view = viewOf(cam), out = (name: string, t: number) => { const g = castAt(cast, t).find((q) => q.name === name)!, xs = figBox(g).map((q) => q[0]); return Math.min(...xs) < view.x0 + 0.03 * (view.x1 - view.x0) || Math.max(...xs) > view.x1 - 0.03 * (view.x1 - view.x0); };
  return { id: "a09", title: "9 Taket", seconds, cast, events: {}, shot: "full", camera: () => cam, offFrameOK: out,
    ownBg: (g, t) => { fillAll(g, "#121a33"); ell(g, cam.cx + 300, ROOF - 980, 70, 70, "#f4f0d6", OL * 0.6); g.save(); g.globalCompositeOperation = "lighter"; glow(g, cam.cx + 300, ROOF - 980, 380, "rgba(170,190,255,A)", 0.3);
      // the searchlight: a beam from a tower at the left sweeping over their heads
      const a = lerp(-0.55, 0.15, smooth(t / seconds)), bx = cam.cx - 700, by = ROOF - 700, L = 1900;
      g.fillStyle = "rgba(255,248,210,0.22)"; g.beginPath(); g.moveTo(bx, by); g.lineTo(bx + Math.cos(a - 0.07) * L, by + Math.sin(a - 0.07) * L - 500); g.lineTo(bx + Math.cos(a + 0.07) * L, by + Math.sin(a + 0.07) * L - 500); g.closePath(); g.fill(); g.restore();
      rect(g, cam.cx - 1500, ROOF - FM.LINE / 2, 3000, 900, "#59617a", 0);      // (lighter than their shoes: on a dark roof the feet could not be seen, the risk sheet) line(g, [[cam.cx - 1500, ROOF - FM.LINE / 2], [cam.cx + 1500, ROOF - FM.LINE / 2]], 12);
      for (let i = -6; i < 7; i++) rect(g, cam.cx + i * 260, ROOF - FM.LINE / 2 - 70, 60, 70, "#3a4050", OL * 0.7); } } as Shot; };

/** a figure laid flat on a wall as a shadow: drawn on a canvas of its own in one dark colour and laid on at a set strength, so its parts do not
 *  darken where they overlap */
const shadowOf = (g: G, x: number, y: number, s: number, draw: (k: Ink) => void, a: number) => {
  const cv = (g as unknown as { canvas?: { width: number; height: number } }).canvas, Off = (globalThis as unknown as { OffscreenCanvas?: new (w: number, h: number) => { getContext(t: "2d"): CanvasRenderingContext2D } }).OffscreenCanvas;
  if (!cv || !Off || !cv.width) return;
  const off = new Off(cv.width, cv.height), og = off.getContext("2d"); og.setTransform(g.getTransform()); og.translate(x, y); og.scale(s, s); draw(new Ink(og, D.ol));
  og.setTransform(1, 0, 0, 1, 0, 0); og.globalCompositeOperation = "source-in"; og.fillStyle = "#070a14"; og.fillRect(0, 0, cv.width, cv.height);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = a; g.drawImage(off as unknown as CanvasImageSource, 0, 0); g.restore(); };
// 10 down along the pipe toward the water: the camera rides down the wall and shows only their shadows going down beside the pipe
const climbPose = (u: number): Pose => { const w = Math.sin(u * Math.PI * 2) * 12;
  return { lean: 0, armL: [[160 + w, 14], [170 + w, 8]], armR: [[160 - w, 14], [170 - w, 8]], head: [0, -6, 0] } as Pose; };
const s10 = (): Shot => {
  const m = figure("sir", 0, 0); m.stand(4); const fig0 = castAt([{ name: "sh", m, who: "sir" }], 0)[0];
  void fig0;
  return propShot("a10", "10 Röret", 1.5, (g, t) => {
    const camY = lerp(0, 900, smooth(t / 1.5));
    g.save(); g.translate(0, -camY);
    fillAll(g, "#56607a"); for (let y = 0; y < 3200; y += 70) for (let x = (y / 70) % 2 ? 0 : 60; x < 1100; x += 120) rect(g, x, y, 116, 66, "#636e8a", 2);
    rect(g, 600, -200, 50, 3400, "#6f7684", OL); for (let y = 100; y < 3200; y += 380) rect(g, 580, y, 90, 26, "#555c69", OL * 0.7);
    // the shadows: each man's figure laid flat on the wall in one dark colour, sliding down beside the pipe, one after another
    for (let i = 0; i < 3; i++) { const y = 300 + i * 760 + t * 820; const p = solve(D.props("sir"), { ...climbPose(t * 1.4 + i * 0.3) }, 0);
      shadowOf(g, 450, y, scaleOf("sir") * 0.78, (k) => D.draw(k, p, { look: SHADE }), 0.62); }
    g.restore();
    g.save(); g.globalCompositeOperation = "lighter"; glow(g, 900, 300, 900, "rgba(150,170,230,A)", 0.18); g.restore();
  }); };

// 11 down at the water: the raft at the rocks with the three of them in it, then it glides out over the waves, seen from a distance, moving
//    as one stiff thing (no paddle is seen)
const raft = (g: G, x: number, y: number, s: number, rot: number) => {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  for (let i = 0; i < 3; i++) { const hx = -90 + i * 90; ell(g, hx, -70, 44, 46, "#1a2232"); rrect(g, hx - 48, -112, 96, 34, 14, "#1a2232", OL * 0.8); }
  rrect(g, -190, -40, 380, 80, 40, "#b8a65e"); line(g, [[-150, 0], [150, 0]], OL * 0.5, "#8f7f42");
  g.restore(); };
const waves = (g: G, t: number, y0: number, col = "#16233f") => { fillAll(g, "#0b1226"); rect(g, -100, y0, 1300, 2000, col, 0);
  for (let r = 0; r < 9; r++) { const y = y0 + 40 + r * 110, ph = t * (1.2 + r * 0.05) + r; g.beginPath(); for (let x = -40; x <= 1120; x += 20) { const yy = y + Math.sin(x / 60 + ph) * 6; x === -40 ? g.moveTo(x, yy) : g.lineTo(x, yy); } g.lineWidth = 4; g.strokeStyle = "rgba(140,170,220,0.35)"; g.stroke(); } };
const s11 = (): Shot => propShot("a11", "11 Flotten", 1.7, (g, t) => {
  waves(g, t, 1000);
  ell(g, 820, 360, 50, 50, "#f4f0d6", OL * 0.6);
  poly(g, [[-60, 1250], [260, 1180], [420, 1320], [380, 1560], [-60, 1600]], "#2a2e38");                       // the rocks they left from
  poly(g, [[-60, 1500], [180, 1440], [300, 1580], [-60, 1700]], "#22262f");
  const u = smooth((t - 0.25) / 1.4), x = lerp(470, 780, u), y = lerp(1330, 1150, u), s = lerp(1.7, 1.05, u);
  raft(g, x, y + Math.sin(t * 3) * 6, s, Math.sin(t * 2.4) * 0.03);
}, [{ t: 0.25, k: "splash", g: 0.7, big: 0.6 }]);

// 12 extreme close-up: one of the men's eyes on the water, the searchlight's light crossing them
const s12 = (): Shot => {
  const sh = eyesShot("a12", "12 Ögonen på vattnet", 1.1, INMATE, () => ({}), (g, t) => { waves(g, t, -100, "#101b33"); }, undefined, 4);
  ease(sh.cast[0].m, -1, {}, 0.01, { face: { pupil: 1, wide: 0.7, gaze: [-0.5, -0.2] } });
  sh.front = (g, t) => { const c = sh.camera(t), x = c.cx - 260 + t * 520; g.save(); g.globalCompositeOperation = "lighter"; g.fillStyle = "rgba(255,248,210,0.30)"; g.beginPath(); g.moveTo(x - 60, c.cy - 400); g.lineTo(x + 60, c.cy - 400); g.lineTo(x + 160, c.cy + 400); g.lineTo(x + 40, c.cy + 400); g.closePath(); g.fill(); g.restore(); };
  return sh; };

// 13 sunrise: the guard's hand takes the blanket's edge and pulls it back, and the fake head shows (the review's change in v2)
const s13 = (): Shot => propShot("a13", "13 Filten", 1.2, (g, t) => {
  fillAll(g, "#c98a5a"); g.save(); g.globalCompositeOperation = "lighter"; glow(g, 900, 300, 900, "rgba(255,190,120,A)", 0.45); g.restore();
  for (let i = 0; i < 5; i++) poly(g, [[700 + i * 70, 0], [740 + i * 70, 0], [340 + i * 70, 1920], [300 + i * 70, 1920]], "rgba(255,230,180,0.18)", 0);
  rect(g, 60, 1180, 960, 70, "#6b5442"); pillow(g, 360, 1140, 1.2); fakeHead(g, 360, 1070, 0.95, 1);
  const u = smooth((t - 0.25) / 0.6), top = lerp(960, 1300, u);
  blanket(g, 220, 0, 760, top, "#7b8a72");
  hand(g, { x: 560, y: top + 40 - 20, ang: 1.45, s: 1.0, sleeve: GUARD_SLEEVE, curl: 1 });
}, [{ t: 0.25, k: "flap", g: 1.0 }], { cx: 580, cy: 1150, z: 1.45 });

// 14 the guard is frightened (the shot type 06, react): he jerks back, eyes wide, while the alarm light flashes red
const s14 = (): Shot => {
  const seconds = 1.5, m = figure("sir", 0, 20); m.stand(seconds + 1);
  ease(m, -1, { head: [0, 0, 0] }, 0.01, { face: { pupil: 1, brow: 0.3 } });
  ease(m, 0.2, { lean: -9, head: [0, -8, 0], armL: [[30, 22], [70, 18]], armR: [[30, 22], [70, 18]] }, 0.18, { face: { wide: 1, brow: 1, sad: 0.5, pupil: 0.6, mouth: 0.6, smile: -0.7 } });
  const cast: Cast[] = [{ name: "guard", m, who: "sir", look: GUARD, seed: 12, armWipe: false, hands: { L: [[0, "relaxed"], [0.25, "open"]], R: [[0, "relaxed"], [0.25, "open"]] } }];
  const cam = fitCam(cast, seconds, 1.75);
  return { id: "a14", title: "14 Vakten blir rädd", seconds, cast, events: {}, shot: "full", camera: () => cam,
    ownBg: (g, t) => { fillAll(g, "#55606f"); rect(g, cam.cx - 900, FM.GY - FM.LINE / 2, 1800, 600, "#3b4250", 0); line(g, [[cam.cx - 900, FM.GY - FM.LINE / 2], [cam.cx + 900, FM.GY - FM.LINE / 2]], 12);
      bars(g, cam.cx - 520, cam.cx + 520, FM.GY - 1100, FM.GY - FM.LINE / 2, 160, "#6c7584"); },
    front: (g, t) => { const on = 0.5 + 0.5 * Math.sin(t * Math.PI * 2 * 1.6); g.save(); g.globalCompositeOperation = "lighter"; glow(g, cam.cx + 280, FM.GY - 980, 900, "rgba(255,40,40,A)", 0.45 * on); g.restore(); } } as Shot; };

// 15 hands put up three wanted posters on a board (a thumb pressing the third one's pin)
const poster = (g: G, x: number, y: number, rot: number, face: number) => { g.save(); g.translate(x, y); g.rotate(rot);
  rect(g, -130, -170, 260, 340, "#efe6cc"); g.fillStyle = INK; g.font = "bold 46px Arial"; g.textAlign = "center"; g.fillText("WANTED", 0, -110);
  ell(g, 0, 10, 64, 66, "#e7c39f", OL * 0.7); poly(g, [[-66, 0], [-60, -46], [0, -66], [60, -46], [66, 0], [40, -30], [-40, -30]], ["#3a2a20", "#6b4a2e", "#2e2a26"][face], OL * 0.6);
  for (const sx of [-24, 24]) ell(g, sx, 4, 7, 7, INK, 0); line(g, [[-18, 42], [18, 42]], OL * 0.6);
  ell(g, 0, -150, 10, 10, "#c0392b", OL * 0.5); g.restore(); };
const s15 = (): Shot => propShot("a15", "15 Affischerna", 2.0, (g, t) => {
  fillAll(g, "#a0784f"); for (let i = 0; i < 60; i++) ell(g, (i * 211) % 1080, (i * 433) % 1920, 6, 6, "#8d6a45", 0);
  poster(g, 230, 700, -0.05, 0); poster(g, 520, 760, 0.04, 1);
  const u = smooth(t / 0.7), x = lerp(1100, 810, u), y = lerp(900, 720, u);
  poster(g, x, y, 0.06 * (1 - u) - 0.03, 2);
  hand(g, { x: x + 28, y: y - 176, ang: 2.4, s: 0.95, sleeve: GUARD_SLEEVE, curl: 0.5, thumb: 1 });      // (the fingertips on the pin at the poster's top)
}, [{ t: 0.75, k: "tap", g: 1.0 }, { t: 0.2, k: "paper", g: 0.8 }], { cx: 560, cy: 760, z: 1.35 });

// 16 the empty bay in the morning light: the camera glides over the water toward the city, where the wind lifts a poster
const s16 = (): Shot => propShot("a16", "16 Bukten", 2.1, (g, t) => {
  const gr = g.createLinearGradient(0, 0, 0, 1000); gr.addColorStop(0, "#f2b98a"); gr.addColorStop(1, "#f7dcb0"); g.fillStyle = gr; g.fillRect(-100, -100, 1300, 2200);
  const dx = -smooth(t / 2.1) * 120;
  for (let i = 0; i < 14; i++) { const x = 60 + i * 74 + dx * 0.3, h = 60 + ((i * 37) % 90); rect(g, x, 980 - h, 60, h, "#c4a088", OL * 0.5); }
  rect(g, -100, 980, 1300, 1000, "#7fa6c2", 0); line(g, [[-100, 980], [1200, 980]], 8);
  for (let r = 0; r < 8; r++) { const y = 1060 + r * 120; g.beginPath(); for (let x = -40; x <= 1120; x += 20) { const yy = y + Math.sin(x / 70 + t * 1.5 + r) * 7; x === -40 ? g.moveTo(x + dx, yy) : g.lineTo(x + dx, yy); } g.lineWidth = 4; g.strokeStyle = "rgba(255,255,255,0.4)"; g.stroke(); }
  const u = smooth(t / 2.1), px2 = lerp(140, 900, u), py = lerp(1500, 620, u) + Math.sin(t * 4) * 30;
  g.save(); g.translate(px2, py); g.rotate(t * 2.2); g.scale(0.55, 0.55 * Math.cos(t * 3)); poster(g, 0, 0, 0, 0); g.restore();
}, [{ t: 0.1, k: "flap", g: 0.7 }]);

// 17 the loop: the head on the pillow in the dark, and the torch's light sweeping in, to the first frame of shot 1
const s17 = (): Shot => propShot("a17", "17 Loopen", 2.5, (g, t) => {
  const u = smooth((t - 1.4) / 1.1), sx = lerp(120, 400, u), sy = lerp(1500, 1060, u);
  cellNight(g, 0, sx, sy, t); bars(g, 40, 1060, 300, 1700, 170);
  if (u > 0) { const hx = lerp(60, 330, u), hy = lerp(1900, 1760, u), a = Math.atan2(sy - hy, sx - hx); heldTorch(g, hx, hy, a, [sx, sy], u); }
}, [], CELL_CAM);

export const SHOTS: Record<string, () => Shot> = { a01: s01, a02: s02, a03: s03, a04: s04, a05: s05, a06: s06, a07: s07, a08: s08, a09: s09, a10: s10, a11: s11, a12: s12, a13: s13, a14: s14, a15: s15, a16: s16, a17: s17 };
export type { Shot };
void footY; void INK;
