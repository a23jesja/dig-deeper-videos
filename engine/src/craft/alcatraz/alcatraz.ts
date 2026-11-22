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
// (v1b: the cone fades out before the spot and the spot is a soft glow: a cone ending in a hard straight edge across the face read as a pasted
//  see-through quad, the review of STOPP 1, point 6)
const cone = (g: G, x0: number, y0: number, x1: number, y1: number, r: number, a: number) => {
  const dx = x1 - x0, dy = y1 - y0, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
  for (const [w, al] of [[1, 0.16], [0.7, 0.14], [0.42, 0.14]] as [number, number][]) {
    const gr = g.createLinearGradient(x0, y0, x0 + dx * 0.85, y0 + dy * 0.85); gr.addColorStop(0, `rgba(255,240,170,${al * 2 * a})`); gr.addColorStop(0.7, `rgba(255,240,170,${al * a})`); gr.addColorStop(1, "rgba(255,240,170,0)");
    g.fillStyle = gr; g.beginPath(); g.moveTo(x0 + nx * 8, y0 + ny * 8); g.lineTo(x0 + dx * 0.85 + nx * r * w, y0 + dy * 0.85 + ny * r * w); g.lineTo(x0 + dx * 0.85 - nx * r * w, y0 + dy * 0.85 - ny * r * w); g.lineTo(x0 - nx * 8, y0 - ny * 8); g.closePath(); g.fill(); }
  glow(g, x1, y1, r * 1.3, "rgba(255,244,190,A)", 0.6 * a); };

// ---------------------------------------------------------------- hands ----------------------------------------------------------------
// A hand in the look of the figures: a round palm, four short fingers and a thumb, a cuff and a sleeve, drawn in two parts so that a held
// thing goes between them: the back (sleeve, cuff, palm, thumb) behind it, the fingers in front of it (the grip rule of 17 Nov: fingers in
// front of the thing, the palm behind). ang: the direction the hand points (radians), s: its size (1 = a palm 70 px across)
const SKIN = "#f7c9a3";
type HandSpec = { x: number; y: number; ang: number; s: number; sleeve: string; cuff?: string; curl?: number; thumb?: number };
/** what the drawing of a frame puts down, for the checks (clip_check, the Alcatraz shots): each sleeve's far end and each cloth on its support */
export const DRAWN = { sleeves: [] as { end: P2; wrist: P2 }[], cloths: [] as { what: string; top: number; support: number; bottom: number }[],
  /** an upright (a bar, a bed's leg): its foot and the floor it must stand on (or reach past the picture's edge) */ uprights: [] as { what: string; foot: number; floor: number; x: number }[],
  /** a thing that can come and go (a coat, a poster, the boat): where it is, so a check sees where it first shows and whether a hand is there */ things: [] as { what: string; at: P2 }[],
  /** print (a poster's front, a map's labels) and whether it is drawn mirrored */ prints: [] as { what: string; mirrored: boolean }[] };
/** a forearm without a body goes out through the picture's edge: its sleeve runs far back (len 3000; the check's planted fault 260, the
 *  first draft's, whose forearms ended in the middle of the picture, the review of STOPP 1, point 1) */
export const SLEEVE = { len: 3000 };
const handBack = (g: G, h: HandSpec) => {
  const L = SLEEVE.len; DRAWN.sleeves.push({ wrist: [h.x, h.y], end: [h.x - Math.cos(h.ang) * L * h.s, h.y - Math.sin(h.ang) * L * h.s] });
  g.save(); g.translate(h.x, h.y); g.rotate(h.ang); g.scale(h.s, h.s);
  poly(g, [[-L, -34], [-40, -40], [-40, 40], [-L, 34]], h.sleeve);            // sleeve, from behind the wrist back to past the picture's edge
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
/** an inmate in moonlight (the roof, the raft): his colours dimmed and blue, the face still clear */
const MOON: Look = { col: { coat: "#4f6c96", vest: "#6a86ad", shirt: "#6a86ad", tie: "#6a86ad", trous: "#2b3550", shoe: "#1c1a24", cap: "#262c3a", hair: "#2a2230", skin: "#d9c2b6", nose: "#c99a8c" }, band: "#262c3a", mono: false, pipe: false, moustache: false };
const GUARD_SLEEVE = "#33456a", INMATE_SLEEVE = "#7ea6cf";

// ---------------------------------------------------------------- props ----------------------------------------------------------------
/** the fake head on a pillow: a round face of plaster colour with painted shut eyes and real-looking hair (Bureau of Prisons: "realistic
 *  dummy heads (complete with human hair)") */
const fakeHead = (g: G, x: number, y: number, s: number, light = 0, hair = "#5a3a24") => {
  g.save(); g.translate(x, y); g.scale(s, s);
  ell(g, 0, 0, 92, 96, light > 0.5 ? "#f1cfae" : "#e7c39f");
  poly(g, [[-96, -6], [-90, -70], [-40, -104], [30, -106], [86, -72], [96, -10], [70, -50], [20, -70], [-30, -66], [-74, -40]], hair);
  for (const sx of [-34, 34]) line(g, [[sx - 16, 10], [sx, 16], [sx + 16, 10]], OL * 0.8);       // painted shut eyes
  ell(g, 0, 34, 10, 8, "#e0a68c", OL * 0.7);
  line(g, [[-14, 60], [14, 60]], OL * 0.7);
  g.restore(); };
const pillow = (g: G, x: number, y: number, s: number) => rrect(g, x - 150 * s, y - 60 * s, 300 * s, 120 * s, 50 * s, "#eef0f2");
/** a blanket lying on a bed whose top is at support: registered for the check that a cloth never hangs below what holds it */
/** the check's planted fault: drop > 0 lets a blanket hang that far below its bed's top (the first draft's shot 13) */
export const PLANT = { drop: 0, hang: 0, pop: false, mirror: false, shortBars: false, snap: false };
/** (v1b: a blanket lies on the bed and folds over its front edge by at most 30 px; hanging 220 px down it went through the bed's board, the
 *  independent review of STOPP 1 point 16. PLANT.hang: the check's planted fault, a blanket that long again) */
const blanketOn = (g: G, x: number, w: number, top0: number, support: number, col = "#6f7f68", what = "blanket") => { const top = top0 + PLANT.drop, bottom = support + 30 + PLANT.hang; DRAWN.cloths.push({ what, top, support, bottom }); blanket(g, x, 0, w, top, col, bottom - top); };
const blanket = (g: G, x: number, y: number, w: number, top: number, col = "#6f7f68", h = 220) => {
  poly(g, [[x, top + 20], [x + w * 0.2, top], [x + w * 0.55, top + 14], [x + w, top + 4], [x + w + 10, top + h], [x - 10, top + h]], col);
  line(g, [[x + w * 0.08, top + 60], [x + w * 0.92, top + 54]], OL * 0.6, "#4f5d4a"); };
/** prison bars across the picture, x0 to x1, every gap px */
/** (v1b: the bars stand on the floor (y1, the floor's line) and run up past the picture's top; they ended in the air under the cross bar, the
 *  independent review of STOPP 1 point 13. PLANT.shortBars: the check's planted fault, bars stopping 120 above the floor) */
const bars = (g: G, x0: number, x1: number, y0: number, y1: number, gap: number, col = "#5d6675") => {
  const foot = PLANT.shortBars ? y1 - 120 : y1; for (let x = x0; x <= x1; x += gap) { DRAWN.uprights.push({ what: "bar", foot, floor: y1, x }); rect(g, x - 9, y0 - 3000, 18, foot - y0 + 3000, col, OL * 0.8); }
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
const heldTorch = (g: G, hx: number, hy: number, ang: number, spot: P2 | null, light: number, s = 1.2) => {
  const dx = Math.cos(ang), dy = Math.sin(ang), lens: P2 = [hx + dx * 64 * s, hy + dy * 64 * s];
  if (spot && light > 0) { g.save(); g.globalCompositeOperation = "lighter"; cone(g, lens[0], lens[1], spot[0], spot[1], 130 * s / 1.2, light); g.restore(); }
  // (v1b: the torch's tail behind the sleeve and the palm, its head in front of the palm, the fingers round it: drawn over the sleeve it seemed
  //  to go through the wrist, the independent review of STOPP 1 point 28)
  const H: HandSpec = { x: hx, y: hy, ang, s: 1.1 * s / 1.2, sleeve: GUARD_SLEEVE, curl: 1 };
  torch(g, hx + dx * 10 * s, hy + dy * 10 * s, ang, s); handBack(g, H);
  g.save(); g.translate(hx + dx * 10 * s, hy + dy * 10 * s); g.rotate(ang); g.scale(s, s); poly(g, [[10, -26], [44, -40], [44, 40], [10, 26]], "#5c616c"); ell(g, 44, 0, 8, 40, "#fff6c8", OL * 0.6); g.restore();
  handFingers(g, H); };

// 1  the cell at night, close: the fake head and its pillow fill the picture, the guard's hand with the torch at the lower right, its light on
//    the head from frame 0 (the hook: the light hits the head in frame 1, condition 2; v1b: the head 50-80 % of the width and the hand in the
//    picture, the review of STOPP 1 point 6: the head filled 18 %)
const BED_Y = 1240, HEAD: P2 = [330, 1120], HEAD_S = 1.12;
const cellClose = (g: G, light: number) => {
  cellWall(g, "#2b3346");
  rect(g, 60, BED_Y, 900, 60, "#5b4a3c"); for (const lx of [90, 900]) { DRAWN.uprights.push({ what: "bed leg", foot: 1700, floor: 1700, x: lx }); rect(g, lx, BED_Y + 60, 30, 1700 - BED_Y - 60, "#5b4a3c"); }
  pillow(g, 330, BED_Y - 30, 1.3);
  blanketOn(g, 430, 560, BED_Y - 128, BED_Y); fakeHead(g, HEAD[0], HEAD[1], HEAD_S, light);
  bars(g, 150, 590, 700, 1700, 440); };
/** the cell's camera: shot 1 and the loop's shot 17 the same, so the loop's last frame runs into the first; it creeps in */
const cellCam = (t: number, t0 = 0) => ({ cx: 390, cy: 1150, z: 2.6 + 0.12 * smooth((t - t0) / 1.8) });
const s01 = (): Shot => { const sh = propShot("a01", "1 Ficklampan", 1.8, (g, t) => {
  // (v1b, the hook: A's close framing with C's sweep, the light moving in frame 0 and on the head within 0.3 s, then settling on it; it stood
  //  nearly still for 1.8 s, the review of STOPP 1 and its independent review)
  const u = smooth(Math.min(1, t / 0.3)), v = smooth((t - 0.3) / 1.2), sx = lerp(560, HEAD[0] + 30, u) - 30 * v, sy = lerp(1300, HEAD[1] - 6, u) - 4 * v;
  cellClose(g, u);
  const hx = lerp(600, 540, u), hy = lerp(1460, 1410, u), a = Math.atan2(sy - hy, sx - hx); heldTorch(g, hx, hy, a, [sx, sy], 1, 0.9);
}, [{ t: 0, k: "tap", g: 1.4 }]); sh.camera = (t) => cellCam(t); return sh; };

// 2  extreme close-up of the guard's eyes narrowing (the guard's head on the rig, the camera pushing in on his eyes)
const eyesShot = (id: string, title: string, seconds: number, look: Look, faceAt: (t: number) => Face, ownBg: (g: G, t: number) => void, front?: (g: G, t: number, figs: Fig[]) => void, seed = 6, up = 10): Shot => {
  const m = figure("sir", 0, 0); m.stand(seconds + 1);
  // (a blink seed with no blink in the shot: an eye close-up blinking in its first frames, the hook lab B draft)
  const cast: Cast[] = [{ name: "eyes", m, who: "sir", look, seed, pose: (t, p) => ({ ...p, head: [0, 2, 0] }) }];
  const g0 = castAt(cast, 0)[0], sk = jointPx(g0, "skull"), s = scaleOf("sir");
  const eye: P2 = [sk[0], sk[1] - 118 * s];
  return { id, title, seconds, cast, events: {}, shot: "medium", ownBg, front, offFrameOK: () => true, camera: (t) => ({ cx: eye[0], cy: eye[1] + up * s, z: 4.0 + 0.6 * smooth(t / seconds) }) } as Shot;
};
const s02 = (): Shot => {
  // (v1b: the eyes higher in the picture's lower half, so the cap's gold badge sits under the opening's text: it showed through the letters,
  //  the review of STOPP 1 point 7)
  const sh = eyesShot("a02", "2 Vaktens ögon", 1.6, GUARD, () => ({}), (g) => { fillAll(g, "#1c2232"); }, undefined, 6, -95);
  ease(sh.cast[0].m, -1, {}, 0.01, { face: { pupil: 1, gaze: [0.2, 0.3] } });
  ease(sh.cast[0].m, 0.3, { head: [0, 4, 0] }, 0.35, { face: { pupil: 1, gaze: [0.3, 0.4], brow: -0.8, lid: 0.28 } });
  sh.front = (g, t) => { g.save(); g.globalCompositeOperation = "lighter"; glow(g, sh.camera(t).cx + 70, sh.camera(t).cy + 140, 260, "rgba(255,240,170,A)", 0.25); g.restore(); };
  return sh; };

// 3  three cells in a row, the camera gliding along the bars while the guard's torch light passes over each bed (a head under a blanket in each)
const s03 = (): Shot => propShot("a03", "3 Tre celler", 2.4, (g, t) => {
  const pan = lerp(0, 1000, smooth(t / 2.4)), base = -pan;
  fillAll(g, "#262d3e");
  for (let i = 0; i < 3; i++) { const x = base + 220 + i * 760;
    rect(g, x - 40, 520, 700, 1180, "#2f384c", OL);
    // (v1b: the bed stands on legs on the floor and each head is a different man's: a slab floating 640 px over the floor, one head cloned,
    //  the independent review of STOPP 1 points 14 and 27)
    rect(g, x + 40, 1220, 560, 50, "#5b4a3c"); for (const lx of [x + 60, x + 560]) { DRAWN.uprights.push({ what: "bed leg", foot: 1700, floor: 1700, x: lx }); rect(g, lx, 1270, 24, 430, "#5b4a3c"); }
    pillow(g, x + 170, 1190, 0.8); blanketOn(g, x + 240, 360, 1110, 1220); fakeHead(g, x + 170, 1120, 0.66, 0, ["#5a3a24", "#2e2a26", "#8a5a30"][i]);
    rect(g, x + 676, 760, 40, 60, "#4a4f5c", OL * 0.6); g.save(); g.globalCompositeOperation = "lighter"; glow(g, x + 696, 790, 200, "rgba(255,220,150,A)", 0.25); g.restore(); }
  // the torch's spot sweeping along the beds, a little ahead of the camera
  const sx = 520 + pan * 1.1 - 100 + Math.sin(t * 2.2) * 40; g.save(); g.globalCompositeOperation = "lighter"; glow(g, sx, 1150, 210, "rgba(255,244,190,A)", 0.5); g.restore();
  for (let i = 0; i < 3; i++) { const x = base + 220 + i * 760; for (let b = 0; b <= 6; b++) { DRAWN.uprights.push({ what: "bar", foot: 1700, floor: 1700, x: x - 30 + b * 112 }); rect(g, x - 30 + b * 112, -2000, 16, 3700, "#5d6675", OL * 0.7); } rect(g, x - 50, 560, 720, 20, "#5d6675", OL * 0.7); }
  rect(g, -100, 1700, 1400, 300, "#1c212e", 0);
}, [{ t: 0.9, k: "drip", g: 0.8 }], { cx: 560, cy: 1120, z: 1.5 });

// 4  the map on the table: the rocky island with its prison, the bay with its waves, the city with its towers across the water (labelled);
//    a hand moves a little paper boat from the island toward the city, a candle burns beside it (v1b: the review of STOPP 1 point 8, the map
//    could not be read and the city looked like a bar chart)
const s04 = (): Shot => propShot("a04", "4 Kartan", 2.5, (g, t) => {
  fillAll(g, "#5a3d2a"); for (let y = 0; y < 1920; y += 90) line(g, [[-50, y + 30], [1200, y]], 4, "rgba(30,15,5,0.35)");
  poly(g, [[110, 470], [990, 440], [1010, 1400], [90, 1440]], "#efe2c0");
  poly(g, [[130, 640], [980, 600], [990, 1380], [140, 1410]], "#8fb9d6", OL * 0.7);                                          // the bay
  for (let r = 0; r < 7; r++) for (let c = 0; c < 4; c++) { const x = 190 + c * 200 + (r % 2) * 90, y = 720 + r * 95; line(g, [[x, y], [x + 22, y - 10], [x + 44, y]], 4, "#5f8fb3"); }
  poly(g, [[110, 470], [990, 440], [985, 640], [700, 655], [520, 610], [300, 650], [115, 640]], "#e2d3a8", OL * 0.7);          // the city's shore
  for (let i = 0; i < 9; i++) { const x = 330 + i * 68, h = 70 + ((i * 53) % 90); rect(g, x, 600 - h, 52, h, "#b8ab8c", OL * 0.5); for (let w = 0; w < h - 20; w += 26) ell(g, x + 26, 600 - h + 14 + w, 7, 6, "#efe2c0", 0); }
  g.fillStyle = INK; g.font = "bold 50px Arial"; g.textAlign = "center"; g.fillText("SAN FRANCISCO", 620, 525);
  poly(g, [[300, 1080], [345, 1040], [430, 1035], [470, 1075], [440, 1110], [330, 1115]], "#a89772", OL * 0.7);                // the island
  rect(g, 345, 1040, 70, 34, "#d8d0c0", OL * 0.5); rect(g, 425, 1005, 14, 44, "#d8d0c0", OL * 0.5);
  g.fillStyle = INK; g.font = "bold 46px Arial"; g.fillText("ALCATRAZ", 390, 1175);
  const u = smooth((t - 0.4) / 1.6), mx = lerp(470, 640, u), my = lerp(1040, 690, u);
  // the boat's trail, dotted, from the island (v1b: it left no trace, point 26)
  for (let k = 0; k <= 12; k++) { const w = (k / 12) * u, qx = lerp(470, 640, w), qy = lerp(1040, 690, w); if (k % 2 === 0 && w < u - 0.04) ell(g, qx, qy + 20, 6, 6, "#c0392b", 0); }
  DRAWN.things.push({ what: "boat", at: [mx, my] });
  // the paper boat in the fingers (the fingers over its lower half)
  const MH: HandSpec = { x: mx - 0.58 * 66, y: my + 0.81 * 66, ang: -0.95, s: 0.95, sleeve: INMATE_SLEEVE, curl: 0.8, thumb: 0.9 };
  handBack(g, MH); poly(g, [[mx - 40, my - 4], [mx + 40, my - 4], [mx + 26, my + 16], [mx - 26, my + 16]], "#fffaf0", OL * 0.7); poly(g, [[mx - 4, my - 4], [mx - 4, my - 46], [mx + 24, my - 8]], "#fffaf0", OL * 0.7); handFingers(g, MH);
  // (v1b: no candle: drawn from the side on a table seen from above, its glow blue on the map, the independent review of STOPP 1 point 26)
}, [{ t: 0.45, k: "paper", g: 0.7 }]);

// 5  hands: the homemade tool scraping round the vent grill; then the grill comes loose and the other hand pulls it out: a dark hole behind
const s05 = (): Shot => propShot("a05", "5 Ventilen", 3.7, (g, t) => {
  fillAll(g, "#8c8a84"); for (let i = 0; i < 40; i++) { const x = (i * 263) % 1080, y = (i * 571) % 1920; ell(g, x, y, 6, 4, "#7a7872", 0); }
  const off = smooth((t - 2.7) / 0.8);
  rect(g, 300, 660, 480, 360, "#15171c"); line(g, [[290, 650], [790, 650], [790, 1030], [290, 1030], [290, 650]], 5, "#5f5d58");      // the hole behind
  g.save(); g.translate(540 + off * 260, 840 + off * 120); g.rotate(off * 0.35); grill(g, -240, -180, 480, 360); g.restore();
  // (v1b: the tool's tip works the grill's lower edge (its frame) and the dust falls from where it scrapes: it scraped the floor under the
  //  grill and the dust fell anywhere, the independent review of STOPP 1 point 25)
  const tipAt = (tt: number) => { const k = (tt * 1.6) % 2, u = k < 1 ? smooth(k) : smooth(2 - k); return lerp(330, 750, u); };
  for (let i = 0; i < 18; i++) { const age = (i * 0.11) % 1.2, t0 = t - age; if (t0 < 0 || t0 > 2.7) continue; const x0 = tipAt(t0) + ((i * 37) % 30) - 15; ell(g, x0, 1024 + age * age * 900, 5, 5, "#d9d2c0", 0); }
  if (t < 2.7) { const tx = tipAt(t), ty = 1020;
    const H: HandSpec = { x: tx + 120, y: ty + 160, ang: -2.3, s: 1.1, sleeve: INMATE_SLEEVE, curl: 1 };
    handBack(g, H); g.save(); g.translate(tx, ty); g.rotate(-2.3 + Math.PI); rrect(g, -6, -8, 190, 16, 6, "#b9bec6", OL * 0.7); g.restore(); handFingers(g, H); }
  // the other hand on the grill's top right corner, then pulling it out with it
  { const cx = 780 + off * 260 - off * 30, cy = 660 + off * 120 + off * 60; const S2: HandSpec = { x: cx + 20, y: cy - 28, ang: 2.45, s: 1.0, sleeve: INMATE_SLEEVE, curl: 0.5, thumb: 0.2 }; handBack(g, S2); handFingers(g, S2); }
}, [...[0.15, 0.78, 1.4, 2.03, 2.65].map((t) => ({ t, k: "scratch", g: 0.9 })), { t: 2.75, k: "thunk", g: 0.8 }], { cx: 600, cy: 1000, z: 1.2 + 0.08 * 0 });

// 6  raincoats (collar, sleeves, buttons) laid one over another, and the raft growing out of them: its outline closes round them at the end;
//    two hands press a seam (v1b: the coats read as tiles, the review of STOPP 1 point 9)
const COATS: [number, number, number][] = [[300, 760, -0.2], [560, 720, 0.1], [810, 790, 0.25], [330, 1080, 0.15], [610, 1060, -0.1], [870, 1110, 0.2], [460, 1380, -0.15], [740, 1390, 0.12]];
const coat = (g: G) => {
  poly(g, [[-70, -120], [-150, -40], [-170, 60], [-120, 70], [-100, 0], [-100, 130], [100, 130], [100, 0], [120, 70], [170, 60], [150, -40], [70, -120]], "#c7b56a");
  poly(g, [[-70, -120], [0, -70], [70, -120], [40, -130], [0, -100], [-40, -130]], "#b19f55", OL * 0.8);       // the collar
  line(g, [[0, -70], [0, 130]], OL * 0.6, "#8f7f42"); for (const y of [-30, 20, 70]) ell(g, 12, y, 6, 6, "#6b5c2c", 0); };
const s06 = (): Shot => propShot("a06", "6 Regnrockarna", 2.2, (g, t) => {
  fillAll(g, "#4a4f5a");
  const grow = smooth((t - 1.6) / 0.5);
  if (grow > 0) { g.save(); g.globalAlpha = grow; rrect(g, 120, 570, 860, 990, 300, "#9a8a48", OL * 1.4); g.restore(); }
  // (v1b: each coat is carried in from the picture's lower edge by a hand holding its collar and laid down; they popped in whole in the
  //  middle of the picture, the independent review of STOPP 1 point 15. PLANT.pop: the check's planted fault, in place and no hand)
  const carry: HandSpec[] = [];
  COATS.forEach(([x, y, r], i) => { const t0 = i * 0.17, u = smooth((t - t0) / 0.32); if (u <= 0) return;
    const yy = PLANT.pop ? y : lerp(2300, y, u), xx = PLANT.pop ? x : lerp(540, x, u);
    g.save(); g.translate(xx, yy); g.rotate(r); coat(g); g.restore(); DRAWN.things.push({ what: `coat ${i + 1}`, at: [xx, yy] });
    if (!PLANT.pop && u < 1 && t - t0 < 0.42) carry.push({ x: xx + Math.sin(r) * 120, y: yy - Math.cos(r) * 120 + 40, ang: -Math.PI / 2 + r, s: 0.95, sleeve: INMATE_SLEEVE, curl: 0.9 }); });
  for (const H of carry) { handBack(g, H); handFingers(g, H); }
  if (grow > 0) { g.save(); g.globalAlpha = grow; g.beginPath(); g.roundRect(120, 570, 860, 990, 300); g.lineWidth = 18; g.strokeStyle = "#6b5c2c"; g.stroke(); g.restore(); }
  const p = Math.sin(t * 5) * 6;
  hand(g, { x: 480, y: 1210 + p, ang: -1.3, s: 1.0, sleeve: INMATE_SLEEVE, curl: 0.2, thumb: 0.3 });
  hand(g, { x: 660, y: 1220 - p, ang: -1.85, s: 1.0, sleeve: INMATE_SLEEVE, curl: 0.2, thumb: 0.3 });
}, [0, 0.35, 0.7, 1.05, 1.4].map((t) => ({ t, k: "flap", g: 0.6 })));

// 7  the fake head laid on the pillow by two hands holding its sides; then a hand slides the blanket up the bed to its chin (the blanket on the
//    bed all the time: v1b, it hung below the bed's edge, the review of STOPP 1 points 1 and 2)
const s07 = (): Shot => propShot("a07", "7 Huvudet på kudden", 1.2, (g, t) => {
  cellWall(g, "#30384a"); rect(g, 60, 1180, 960, 70, "#5b4a3c"); for (const lx of [80, 990]) { DRAWN.uprights.push({ what: "bed leg", foot: 2100, floor: 2100, x: lx }); rect(g, lx, 1250, 26, 850, "#5b4a3c"); }
  pillow(g, 360, 1140, 1.2);
  const u = smooth(t / 0.55), hy = lerp(900, 1070, u), off = smooth((t - 0.6) / 0.3) * 260;
  const bx = lerp(900, 470, smooth((t - 0.55) / 0.5));
  blanketOn(g, bx, 1040 - bx + 470, 1062, 1180);
  // (v1b: the hands hold the head low at its sides, at the jaw, so they never cover the painted eyes: it looked like a live man rubbing his
  //  eyes, the independent review of STOPP 1 point 29)
  DRAWN.things.push({ what: "head", at: [360, hy] });
  if (t < 0.9) { const L: HandSpec = { x: 240 - off, y: hy + 62, ang: 0.35, s: 0.9, sleeve: INMATE_SLEEVE, curl: 0.35 }, R: HandSpec = { x: 480 + off, y: hy + 62, ang: Math.PI - 0.35, s: 0.9, sleeve: INMATE_SLEEVE, curl: 0.35 };
    handBack(g, L); handBack(g, R); fakeHead(g, 360, hy, 0.95); handFingers(g, L); handFingers(g, R); } else fakeHead(g, 360, 1070, 0.95);
  // (v1b: the hand that pulls the blanket comes down from the top edge before it takes the edge: it popped in whole, point 16)
  { const come = smooth((t - 0.3) / 0.25), H: HandSpec = { x: bx + 30, y: lerp(400, 1030, come), ang: 1.75, s: 0.9, sleeve: INMATE_SLEEVE, curl: 1, thumb: 0.2 };
    if (come > 0) { handBack(g, H); if (come >= 1) blanket(g, bx, 0, 60, 1062, "#6f7f68", 1210 - 1062); handFingers(g, H); } }
}, [{ t: 0.5, k: "sack", g: 0.7 }, { t: 0.7, k: "flap", g: 0.5 }], { cx: 540, cy: 1120, z: 1.5 });

// 8  the roof hatch opened from inside (the shot type 08, open a door, with the hatch as the door), seen from below: the hand on the lid's edge
//    first, then the lid swings up and the night sky shows
const s08 = (): Shot => propShot("a08", "8 Takluckan", 1.4, (g, t) => {
  fillAll(g, "#2a3040");
  const open = smooth((t - 0.35) / 0.8), x0 = 280, x1 = 800, y0 = 520, y1 = 1000;
  rect(g, x0 - 30, y0 - 30, x1 - x0 + 60, y1 - y0 + 60, "#4b5163");
  poly(g, [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], "#0f1730", OL);
  ell(g, 640, 640, 46, 46, "#f4f0d6", OL * 0.6); for (const [sx, sy] of [[360, 600], [470, 880], [720, 900], [560, 560]]) ell(g, sx, sy, 4, 4, "#f4f0d6", 0);
  g.save(); g.globalCompositeOperation = "lighter"; glow(g, 640, 900, 520 * open, "rgba(170,190,255,A)", 0.25 * open); g.restore();
  const ly = lerp(y1, y0 + 30, open); poly(g, [[x0, y0], [x1, y0], [x1, ly], [x0, ly]], "#6b6f7c"); line(g, [[x0 + 30, (y0 + ly) / 2], [x1 - 30, (y0 + ly) / 2]], OL * 0.6, "#4b4f5a");
  // (v1b: the fingers over the lid's edge from start to end, the palm under it: from frame 490 it no longer clearly touched, the independent
  //  review of STOPP 1 point 17)
  { const H: HandSpec = { x: 560, y: ly + 34, ang: -1.57, s: 1.15, sleeve: INMATE_SLEEVE, curl: 0.55, thumb: 0.4 }; handBack(g, H); line(g, [[x0, ly], [x1, ly]], OL); handFingers(g, H); }
}, [{ t: 0.3, k: "thunk", g: 1.0 }, { t: 0.4, k: "whoosh", g: 0.4, dur: 0.6 }], { cx: 540, cy: 860, z: 1.3 });

// 9  the roof in moonlight: three men walking bent low in a row, whole and apart (the shot type 02, walk), the searchlight's beam sweeping across
//    the sky over them and missing them. A wide shot: three whole figures with air between them fill a third of the height in 9:16 (the review
//    of STOPP 1 point 3 asked for three whole figures apart; at 50 % they were cut by the edges and hid each other's heads)
const ROOF = FM.GY;
const s09 = (): Shot => {
  const seconds = 1.6, cast: Cast[] = [];
  for (let i = 0; i < 3; i++) { const m = figure("sir", -0.7 + i * 0.52, 90, 0.45); m.walk(2.0, { step: 0.72, tau: 0.6, keep: true }); m.stand(2);
    ease(m, -1, { lean: 26, head: [0, 10, 0] }, 0.01, { face: { pupil: 1, gaze: [0.5, -0.2] } }); cast.push({ name: `man${i}`, m, who: "sir", look: MOON, seed: 20 + i, armWipe: false, hands: { L: [[0, "fist"]], R: [[0, "fist"]] } }); }
  // (the camera follows the group's middle, so the three stay whole and apart in a frame a third of whose height they fill)
  const c0 = fitCam(cast, 0.05, 1.2), mid = (t: number) => { const f = castAt(cast, t); return f.reduce((a, q) => a + q.x, 0) / f.length; }, dx0 = c0.cx - mid(0);
  const camAt = (t: number) => ({ ...c0, cx: mid(t) + dx0 }); const cam = c0;
  return { id: "a09", title: "9 Taket", seconds, cast, events: {}, shot: "wide", camera: camAt,
    ownBg: (g, t) => { const cam = camAt(t); fillAll(g, "#121a33"); const mx = cam.cx + 260, my = ROOF - 900; ell(g, mx, my, 60, 60, "#f4f0d6", OL * 0.6); g.save(); g.globalCompositeOperation = "lighter"; glow(g, mx, my, 360, "rgba(170,190,255,A)", 0.3);
      // the searchlight: from a tower off the left edge, a bright beam sweeping across the sky above their heads and passing them
      // (v1b: the beam comes from a lamp shown at the picture's left edge and fades along its length: a grey wedge with a hard edge came in from
      //  nowhere, point 23)
      const v0 = viewOf(cam), bx = v0.x0 + 30, by = ROOF - 640, a = lerp(-0.75, -0.2, smooth(t / seconds)), L = 2200;
      for (const [w, al] of [[0.1, 0.12], [0.06, 0.16], [0.03, 0.24]] as [number, number][]) { const gr = g.createLinearGradient(bx, by, bx + Math.cos(a) * L, by + Math.sin(a) * L); gr.addColorStop(0, `rgba(255,248,210,${al})`); gr.addColorStop(1, "rgba(255,248,210,0)"); g.fillStyle = gr; g.beginPath(); g.moveTo(bx, by); g.lineTo(bx + Math.cos(a - w) * L, by + Math.sin(a - w) * L); g.lineTo(bx + Math.cos(a + w) * L, by + Math.sin(a + w) * L); g.closePath(); g.fill(); }
      glow(g, bx, by, 90, "rgba(255,250,220,A)", 0.9);
      g.restore();
      ell(g, viewOf(cam).x0 + 30, ROOF - 640, 26, 26, "#fff6d0", OL * 0.6);
      rect(g, cam.cx - 1500, ROOF - FM.LINE / 2, 3000, 900, "#59617a", 0); line(g, [[cam.cx - 1500, ROOF - FM.LINE / 2], [cam.cx + 1500, ROOF - FM.LINE / 2]], 12);
      // (v1b: no blocks at the roof's edge: the feet crossed them, in front or inside could not be told, the independent review of STOPP 1 point 23)
    } } as Shot; };

// 10 down along the pipe toward the water: the camera rides down the wall and shows only their shadows, each with both hands on the pipe,
//    going down hand under hand (v1b: standing figures stacked beside the pipe, not holding it, the review of STOPP 1 point 4)
/** a figure laid flat on a wall as a shadow: drawn on a canvas of its own in one dark colour and laid on at a set strength, so its parts do not
 *  darken where they overlap */
const shadowOf = (g: G, x: number, y: number, s: number, draw: (k: Ink) => void, a: number) => {
  const cv = (g as unknown as { canvas?: { width: number; height: number } }).canvas, Off = (globalThis as unknown as { OffscreenCanvas?: new (w: number, h: number) => { getContext(t: "2d"): CanvasRenderingContext2D } }).OffscreenCanvas;
  if (!cv || !Off || !cv.width) return;
  const off = new Off(cv.width, cv.height), og = off.getContext("2d"); og.setTransform(g.getTransform()); og.translate(x, y); og.scale(s, s); draw(new Ink(og, D.ol));
  og.setTransform(1, 0, 0, 1, 0, 0); og.globalCompositeOperation = "source-in"; og.fillStyle = "#070a14"; og.fillRect(0, 0, cv.width, cv.height);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = a; g.drawImage(off as unknown as CanvasImageSource, 0, 0); g.restore(); };
const PIPE_X = 625;
const climbDown = (u: number): Pose => { const w = Math.sin(u * Math.PI * 2);
  // (v1b: hand under hand, each arm reaching down in turn and the knees bending with it: the shadows slid without moving their limbs, point 24)
  return { lean: 4, armL: [[118 + w * 34, 6], [70 + w * 26, 4]], armR: [[118 - w * 34, 6], [70 - w * 26, 4]], head: [0, 8, 0],
    legL: undefined, legR: undefined } as unknown as Pose; };
const s10 = (): Shot => propShot("a10", "10 Röret", 1.5, (g, t) => {
  // (v1b: the camera half as fast and the bricks low in contrast: they rolled up to 30 px a frame, the independent review of STOPP 1 point 24)
  const camY = lerp(0, 420, smooth(t / 1.5));
  g.save(); g.translate(0, -camY);
  fillAll(g, "#56607a"); for (let y = 0; y < 3200; y += 70) for (let x = (y / 70) % 2 ? 0 : 60; x < 1100; x += 120) rect(g, x, y, 116, 66, "#5c6782", 2);
  for (let i = 0; i < 3; i++) { const y = 300 + i * 760 + t * 360, p = solve(D.props("sir"), climbDown(t * 1.3 + i * 0.33), 90), sc = scaleOf("sir") * 0.78;
    const wr = p.j.wrR as unknown as number[], wl = p.j.wrL as unknown as number[], hx = PIPE_X - ((wr[0] + wl[0]) / 2) * sc;      // the hands at the pipe
    shadowOf(g, hx - 6, y, sc, (k) => D.draw(k, p, { look: SHADE }), 0.62); }
  rect(g, 600, -200, 50, 3400, "#6f7684", OL); for (let y = 100; y < 3200; y += 380) rect(g, 580, y, 90, 26, "#555c69", OL * 0.7);
  g.restore();
  g.save(); g.globalCompositeOperation = "lighter"; glow(g, 900, 300, 900, "rgba(150,170,230,A)", 0.18); g.restore();
});

// 11 down at the water: the raft at the rocks with the three of them sitting in it, their heads and faces clear in the moonlight; then it glides
//    out over the waves as one stiff thing, no paddle seen (v1b: an empty yellow ellipse with dark blocks, the review of STOPP 1 point 5)
const manInRaft = (g: G, x: number, y: number) => {
  rrect(g, x - 52, y - 10, 104, 90, 30, MOON.col!.coat);                                                       // shoulders
  ell(g, x, y - 60, 60, 62, MOON.col!.skin); poly(g, [[x - 62, y - 70], [x - 58, y - 112], [x - 20, y - 130], [x + 30, y - 128], [x + 62, y - 104], [x + 64, y - 72]], MOON.col!.cap, OL * 0.9);
  for (const sx of [-20, 20]) { ell(g, x + sx, y - 58, 12, 15, "#ffffff", OL * 0.6); ell(g, x + sx + 3, y - 56, 6, 7, INK, 0); }
  ell(g, x + 2, y - 34, 9, 7, MOON.col!.nose, OL * 0.5); };
const raft = (g: G, x: number, y: number, s: number, rot: number) => {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  for (let i = 0; i < 3; i++) manInRaft(g, -120 + i * 120, -50);
  rrect(g, -210, -40, 420, 90, 44, "#b8a65e"); for (const xx of [-110, 0, 110]) line(g, [[xx, -36], [xx, 46]], OL * 0.5, "#8f7f42"); line(g, [[-180, 4], [180, 4]], OL * 0.5, "#8f7f42");
  g.restore(); };
const waves = (g: G, t: number, y0: number, col = "#16233f") => { fillAll(g, "#0b1226"); rect(g, -100, y0, 1300, 2000, col, 0);
  for (let r = 0; r < 9; r++) { const y = y0 + 40 + r * 110, ph = t * (1.2 + r * 0.05) + r; g.beginPath(); for (let x = -40; x <= 1120; x += 20) { const yy = y + Math.sin(x / 60 + ph) * 6; x === -40 ? g.moveTo(x, yy) : g.lineTo(x, yy); } g.lineWidth = 4; g.strokeStyle = "rgba(140,170,220,0.35)"; g.stroke(); } };
const s11 = (): Shot => propShot("a11", "11 Flotten", 1.7, (g, t) => {
  waves(g, t, 1000);
  ell(g, 820, 360, 50, 50, "#f4f0d6", OL * 0.6); g.save(); g.globalCompositeOperation = "lighter"; glow(g, 820, 360, 300, "rgba(170,190,255,A)", 0.25); g.restore();
  poly(g, [[-60, 1250], [220, 1190], [330, 1330], [300, 1560], [-60, 1600]], "#2a2e38");
  poly(g, [[-60, 1500], [160, 1440], [260, 1580], [-60, 1700]], "#22262f");
  // (v1b: the raft starts in the water right of the rocks: drawn over the rock it seemed to sit inside it, the independent review of STOPP 1
  //  point 21)
  const u = smooth((t - 0.35) / 1.3), x = lerp(640, 820, u), y = lerp(1300, 1140, u), s = lerp(1.2, 0.82, u);
  raft(g, x, y + Math.sin(t * 3) * 6, s, Math.sin(t * 2.4) * 0.03);
}, [{ t: 0.35, k: "splash", g: 0.7, big: 0.6 }]);

// 12 extreme close-up: one of the men's eyes on the water, the searchlight's light crossing them
const s12 = (): Shot => {
  const sh = eyesShot("a12", "12 Ögonen på vattnet", 1.1, INMATE, () => ({}), (g, t) => { waves(g, t, -100, "#101b33"); }, undefined, 4);
  ease(sh.cast[0].m, -1, {}, 0.01, { face: { pupil: 1, wide: 0.7, gaze: [-0.5, -0.2] } });
  // (v1b: the searchlight crosses the water behind his head, soft, and leaves his face and eyes as they are: laid over everything it greyed
  //  the pupils and its edge was hard, the independent review of STOPP 1 point 22)
  sh.ownBg = (g, t) => { waves(g, t, -100, "#101b33"); const c = sh.camera(t), x = c.cx - 300 + t * 560; g.save(); g.globalCompositeOperation = "lighter";
    for (const [w, al] of [[140, 0.10], [80, 0.12], [36, 0.16]] as [number, number][]) { const gr = g.createLinearGradient(x - w, 0, x + w, 0); gr.addColorStop(0, "rgba(255,248,210,0)"); gr.addColorStop(0.5, `rgba(255,248,210,${al})`); gr.addColorStop(1, "rgba(255,248,210,0)"); g.fillStyle = gr; g.fillRect(x - w, c.cy - 600, 2 * w, 1200); }
    g.restore(); };
  sh.front = undefined;
  return sh; };

// 13 sunrise: the guard's hand takes the blanket's edge (fingers over it, the thumb under) and folds it back along the bed, and the fake head and
//    the empty bed show (v1b: the blanket slid below the bed's edge and hung in the air, the hand lay flat on its middle, the review of STOPP 1
//    point 2)
const s13 = (): Shot => propShot("a13", "13 Filten", 1.2, (g, t) => {
  fillAll(g, "#c98a5a"); g.save(); g.globalCompositeOperation = "lighter"; glow(g, 900, 300, 900, "rgba(255,190,120,A)", 0.45); g.restore();
  for (let i = 0; i < 5; i++) poly(g, [[700 + i * 70, 0], [740 + i * 70, 0], [340 + i * 70, 1920], [300 + i * 70, 1920]], "rgba(255,230,180,0.18)", 0);
  rect(g, 60, 1180, 960, 70, "#6b5442"); for (const lx of [80, 990]) { DRAWN.uprights.push({ what: "bed leg", foot: 2100, floor: 2100, x: lx }); rect(g, lx, 1250, 26, 850, "#6b5442"); }
  pillow(g, 360, 1140, 1.2); fakeHead(g, 360, 1070, 0.95, 1);
  // the empty bed under the blanket: a rolled-up shirt where a body should be
  rrect(g, 470, 1110, 300, 70, 30, "#9dbedd", OL * 0.8);
  const u = smooth((t - 0.2) / 0.65), bx = lerp(220, 640, u);
  blanketOn(g, bx, 980 - bx + 220 - 220 * 0.0, 1030, 1180, "#7b8a72");
  // the fold at the blanket's edge (its underside shows), the guard's fingers over it and the thumb behind
  const H: HandSpec = { x: bx + 24, y: 1000, ang: 1.62, s: 1.0, sleeve: GUARD_SLEEVE, curl: 1, thumb: 0.1 };
  handBack(g, H); rrect(g, bx - 18, 1030, 46, 210, 16, "#93a38a", OL * 0.8); handFingers(g, H);
}, [{ t: 0.2, k: "flap", g: 1.0 }], { cx: 580, cy: 1150, z: 1.45 });

// 14 the guard is frightened (the shot type 06, react): he jerks back, eyes wide, while the alarm light flashes red
const s14 = (): Shot => {
  const seconds = 1.5, m = figure("sir", 0, 20); m.stand(seconds + 1);
  ease(m, -1, { head: [0, 0, 0] }, 0.01, { face: { pupil: 1, brow: 0.3 } });
  // (v1b: the fright comes over 0.4 s and the hands stay as they are: the fists became open palms in one frame and the face jumped to wide eyes
  //  and an open mouth in the next, the independent review of STOPP 1 point 18. PLANT.snap: the check's planted fault, 0.03 s)
  ease(m, 0.2, { lean: -9, head: [0, -8, 0], armL: [[30, 22], [70, 18]], armR: [[30, 22], [70, 18]] }, PLANT.snap ? 0.03 : 0.4, { face: { wide: 1, brow: 1, sad: 0.5, pupil: 0.6, mouth: 0.6, smile: -0.7 } });
  const cast: Cast[] = [{ name: "guard", m, who: "sir", look: GUARD, seed: 12, armWipe: false, hands: { L: [[0, "relaxed"]], R: [[0, "relaxed"]] } }];
  const cam = fitCam(cast, seconds, 1.75);
  return { id: "a14", title: "14 Vakten blir rädd", seconds, cast, events: {}, shot: "full", camera: () => cam,
    ownBg: (g, t) => { fillAll(g, "#55606f"); rect(g, cam.cx - 900, FM.GY - FM.LINE / 2, 1800, 600, "#3b4250", 0); line(g, [[cam.cx - 900, FM.GY - FM.LINE / 2], [cam.cx + 900, FM.GY - FM.LINE / 2]], 12);
      bars(g, cam.cx - 520, cam.cx + 520, FM.GY - 1100, FM.GY - FM.LINE / 2, 160, "#6c7584"); },
    front: (g, t) => { const on = 0.5 + 0.5 * Math.sin(t * Math.PI * 2 * 1.6); g.save(); g.globalCompositeOperation = "lighter"; glow(g, cam.cx + 280, FM.GY - 980, 900, "rgba(255,40,40,A)", 0.45 * on); g.restore(); } } as Shot; };

// 15 hands put up three wanted posters on a board (a thumb pressing the third one's pin); all three inside the picture
// (v1b: seen from behind (its transform mirrored) a poster shows its blank back: it showed its front mirrored, WANTED backwards, the independent
//  review of STOPP 1 point 20. PLANT.mirror: the check's planted fault)
const poster = (g: G, x: number, y: number, rot: number, face: number) => { g.save(); g.translate(x, y); g.rotate(rot);
  { const m = g.getTransform(), mir = m.a * m.d - m.b * m.c < 0; DRAWN.prints.push({ what: "poster", mirrored: mir && PLANT.mirror });
    if (mir && !PLANT.mirror) { rect(g, -130, -170, 260, 340, "#e2d8bc"); line(g, [[-90, -120], [90, -120]], 4, "#cfc3a3"); g.restore(); return; } }
  rect(g, -130, -170, 260, 340, "#efe6cc"); g.fillStyle = INK; g.font = "bold 46px Arial"; g.textAlign = "center"; g.fillText("WANTED", 0, -110);
  ell(g, 0, 10, 64, 66, "#e7c39f", OL * 0.7); poly(g, [[-66, 0], [-60, -46], [0, -66], [60, -46], [66, 0], [40, -30], [-40, -30]], ["#3a2a20", "#6b4a2e", "#2e2a26"][face], OL * 0.6);
  for (const sx of [-24, 24]) ell(g, sx, 4, 7, 7, INK, 0); line(g, [[-18, 42], [18, 42]], OL * 0.6);
  ell(g, 0, -150, 10, 10, "#c0392b", OL * 0.5); g.restore(); };
const s15 = (): Shot => propShot("a15", "15 Affischerna", 2.0, (g, t) => {
  fillAll(g, "#a0784f"); for (let i = 0; i < 60; i++) ell(g, (i * 211) % 1080, (i * 433) % 1920, 6, 6, "#8d6a45", 0);
  poster(g, 340, 700, -0.05, 0); poster(g, 595, 760, 0.04, 1);
  const u = smooth(t / 0.7), x = lerp(1300, 840, u), y = lerp(960, 720, u);      // (v1b: from outside the picture with the hand: it slid in alone first, point 19)
  DRAWN.things.push({ what: "poster 3", at: [x, y] });
  poster(g, x, y, 0.06 * (1 - u) - 0.03, 2);
  hand(g, { x: x + 28, y: y - 176, ang: 2.4, s: 0.95, sleeve: GUARD_SLEEVE, curl: 0.5, thumb: 1 });
}, [{ t: 0.75, k: "tap", g: 1.0 }, { t: 0.2, k: "paper", g: 0.8 }], { cx: 600, cy: 760, z: 1.25 });

// 16 the empty bay in the morning light: the camera glides over the water toward the city, and the wind carries a poster off the city's shore
//    across the sky (v1b: it rose out of the water, the review of STOPP 1 point 10)
const s16 = (): Shot => propShot("a16", "16 Bukten", 2.1, (g, t) => {
  const gr = g.createLinearGradient(0, 0, 0, 1000); gr.addColorStop(0, "#f2b98a"); gr.addColorStop(1, "#f7dcb0"); g.fillStyle = gr; g.fillRect(-100, -100, 1300, 2200);
  const dx = -smooth(t / 2.1) * 120;
  for (let i = 0; i < 14; i++) { const x = 60 + i * 74 + dx * 0.3, h = 60 + ((i * 37) % 90); rect(g, x, 980 - h, 60, h, "#c4a088", OL * 0.5); for (let w = 14; w < h - 10; w += 24) ell(g, x + 30, 980 - h + w, 6, 5, "#f7dcb0", 0); }
  rect(g, -100, 980, 1300, 1000, "#7fa6c2", 0); line(g, [[-100, 980], [1200, 980]], 8);
  for (let r = 0; r < 8; r++) { const y = 1060 + r * 120; g.beginPath(); for (let x = -40; x <= 1120; x += 20) { const yy = y + Math.sin(x / 70 + t * 1.5 + r) * 7; x === -40 ? g.moveTo(x + dx, yy) : g.lineTo(x + dx, yy); } g.lineWidth = 4; g.strokeStyle = "rgba(255,255,255,0.4)"; g.stroke(); }
  // (v1b: small by the city and growing as the wind carries it toward us, its blank back showing when it turns: it showed its front mirrored and
  //  was as big as a house over the city, the independent review of STOPP 1 point 20)
  const u = smooth(t / 2.1), px2 = lerp(860, 160, u), py = lerp(930, 380, u) + Math.sin(t * 4) * 20 * u, sc = lerp(0.12, 0.62, u);
  g.save(); g.translate(px2, py); g.rotate(-t * 1.8); g.scale(sc, sc * Math.cos(t * 2.6 + 0.4)); poster(g, 0, 0, 0, 0); g.restore();
}, [{ t: 0.1, k: "flap", g: 0.7 }]);

// 17 the loop: the head on the pillow in the dark, the guard's hand coming in at the lower right and the torch's light reaching the head, to
//    the first frame of shot 1 (the same camera and place)
const s17 = (): Shot => { const sh = propShot("a17", "17 Loopen", 2.5, (g, t) => {
  const u = smooth((t - 1.4) / 1.1), sx = lerp(900, 560, u), sy = lerp(1500, 1300, u);
  cellClose(g, 0);
  if (u > 0) { const hx = lerp(760, 600, u), hy = lerp(1640, 1460, u), a = Math.atan2(sy - hy, sx - hx); heldTorch(g, hx, hy, a, [sx, sy], u, 0.9); }
}); sh.camera = (t) => { const c = cellCam(1.8); return { ...c, z: lerp(2.72, 2.6, smooth((t - 0.6) / 1.9)) }; }; return sh; };

export const SHOTS: Record<string, () => Shot> = { a01: s01, a02: s02, a03: s03, a04: s04, a05: s05, a06: s06, a07: s07, a08: s08, a09: s09, a10: s10, a11: s11, a12: s12, a13: s13, a14: s14, a15: s15, a16: s16, a17: s17 };
export type { Shot };
void footY; void INK;
