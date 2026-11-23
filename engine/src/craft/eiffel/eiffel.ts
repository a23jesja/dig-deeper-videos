// Who Sold the Eiffel Tower in 1925, a Short in the flat 2D look A Knopp. The script, the sources and the shot list:
// granskning/eiffel/stopp-manus-kallor-bildlista-v4c.md (approved 23 Nov, the text locked), the binding build requirements of the review's v4
// verdict. Built as the flat Alcatraz (src/craft/alcatraz/alcatraz.ts, left untouched): each shot a Clip of the shot-type kit, so clip_check
// runs on it as on the library's clips; the film (EiffelFilm.tsx) plays them on the narration's times (timeline.ts).
// Only the eight approved shot types (01 stand and talk, 04 hold with both hands, 05 point, 07 sit; 02, 03, 06, 08 not used), hand-only
// close-ups whose forearm leaves the picture, and things on a table. Faces only from the approved six (smug, delighted, shock, hard squeeze,
// grimace, tear). No print but squiggles on the bid, the cheque, the letter and the seal; the date MAI 1925 on the newspaper as an object;
// the stamp's SOLD as a cartoon mark (the same word as the voice).
import type { Pose } from "../rig";
import type { Face, Look } from "../designs/common";
import { ease, mt } from "../stage/acting";
import { solve } from "../rig";
import { FM, D, figure, castAt, poseAt, jointPx, scaleOf, footY, fitCam, px, viewOf, reach, thighUnder, heightOf, type Clip, type Cast, type Fig } from "../clips/clipKit";
import { DRAWN, SLEEVE } from "../alcatraz/alcatraz";
import { Ink } from "../ink";
import MOUTH_D01 from "./mouth-d01.json";

type G = CanvasRenderingContext2D;
type P2 = [number, number];
const INK = "#241726", OL = 9, SKIN = "#f7c9a3";
const smooth = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const env = (t: number, a: number, up: number, b: number, down: number) => (t < a ? 0 : t < a + up ? smooth((t - a) / up) : t < b ? 1 : t < b + down ? 1 - smooth((t - b) / down) : 0);
const lerpArm = (a: Pose["armL"], b: Pose["armL"], w: number): Pose["armL"] => [0, 1].map((i) => [0, 1].map((k) => a![i][k] + (b![i][k] - a![i][k]) * w)) as Pose["armL"];
const LINE_TOP = FM.GY - FM.LINE / 2;

// ---------------------------------------------------------------- drawing helpers (as the flat Alcatraz's) ----------------------------------------------------------------
const poly = (g: G, pts: P2[], fill: string | null, w = OL, close = true) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); if (close) g.closePath();
  if (fill) { g.fillStyle = fill; g.fill(); } if (w) { g.lineWidth = w; g.lineJoin = "round"; g.lineCap = "round"; g.strokeStyle = INK; g.stroke(); } };
const rect = (g: G, x: number, y: number, w: number, h: number, fill: string, lw = OL) => poly(g, [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], fill, lw);
const rrect = (g: G, x: number, y: number, w: number, h: number, r: number, fill: string, lw = OL) => { g.beginPath(); g.roundRect(x, y, w, h, r); g.fillStyle = fill; g.fill(); if (lw) { g.lineWidth = lw; g.strokeStyle = INK; g.stroke(); } };
const ell = (g: G, x: number, y: number, rx: number, ry: number, fill: string | null, lw = OL, rot = 0) => { g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.lineWidth = lw; g.strokeStyle = INK; g.stroke(); } };
const line = (g: G, pts: P2[], w = OL, col = INK) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.lineWidth = w; g.lineCap = "round"; g.lineJoin = "round"; g.strokeStyle = col; g.stroke(); };
const fillAll = (g: G, col: string) => { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = col; g.fillRect(0, 0, 4000, 4000); g.restore(); };
const glow = (g: G, x: number, y: number, r: number, col: string, a: number) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, col.replace("A", String(a))); gr.addColorStop(1, col.replace("A", "0")); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); };
/** squiggles: lines of "writing" with no letters or numbers in them (the review: no print on the bid, the cheque, the letter or the seal) */
const squiggles = (g: G, x: number, y: number, w: number, rows: number, gap: number, col = "#5a4a5a", lw = 4) => {
  for (let r = 0; r < rows; r++) { const yy = y + r * gap, ww = w * (r === rows - 1 ? 0.55 : 0.9 - 0.08 * (r % 3)); g.beginPath();
    for (let k = 0; k <= 24; k++) { const xx = x + (ww * k) / 24, dy = Math.sin(k * 1.9 + r) * gap * 0.12; k ? g.lineTo(xx, yy + dy) : g.moveTo(xx, yy + dy); } g.lineWidth = lw; g.strokeStyle = col; g.lineCap = "round"; g.stroke(); } };

// hands as the flat Alcatraz draws them (approved): the back (sleeve to past the picture's edge, cuff, palm, thumb) behind a held thing, the
// fingers in front of it; registered in DRAWN for the checks (a forearm without a body leaves the picture within 3.5 hand lengths)
type HandSpec = { id?: string; x: number; y: number; ang: number; s: number; sleeve: string; cuff?: string; curl?: number; thumb?: number; flip?: boolean };
const handBack = (g: G, h: HandSpec) => {
  const L = SLEEVE.len; DRAWN.sleeves.push({ id: h.id ?? "", s: h.s, wrist: [h.x, h.y], end: [h.x - Math.cos(h.ang) * L * h.s, h.y - Math.sin(h.ang) * L * h.s] });
  g.save(); g.translate(h.x, h.y); g.rotate(h.ang); g.scale(h.s, h.flip ? -h.s : h.s);
  poly(g, [[-L, -34], [-40, -40], [-40, 40], [-L, 34]], h.sleeve);
  rrect(g, -52, -40, 26, 80, 8, h.cuff ?? "#fffaf0");
  ell(g, 6, 0, 40, 36, SKIN);
  const th = h.thumb ?? 0.6; g.save(); g.translate(4, -30); g.rotate(-0.9 + th * 0.6); ell(g, 22, 0, 24, 13, SKIN); g.restore();
  g.restore(); };
const handFingers = (g: G, h: HandSpec) => {
  g.save(); g.translate(h.x, h.y); g.rotate(h.ang); g.scale(h.s, h.flip ? -h.s : h.s);
  const c = h.curl ?? 0.6;
  for (let i = 0; i < 4; i++) { const y = -24 + i * 16; g.save(); g.translate(30, y); g.rotate(c * 0.9); ell(g, 18 - c * 4, 0, 22 - c * 6, 9, SKIN, OL * 0.8); g.restore(); }
  g.restore(); };

// ---------------------------------------------------------------- the people (Looks on the frozen rig: colours only, the round body kept) ----------------------------------------------------------------
/** the con man: a dark suit, a dark cap with a black band, a dark moustache; no monocle, no pipe */
export const CON: Look = { col: { coat: "#2c2c36", vest: "#3d3d4b", shirt: "#efe9dc", tie: "#8a2333", trous: "#26262e", shoe: "#18161c", cap: "#22222a", hair: "#2a1f1a" }, band: "#0f0f14", mono: false, pipe: false, brow: "#2a1f1a" };
/** the young dealer: a light suit, a brown cap, clean-shaven */
export const YOUNG: Look = { col: { coat: "#cdb88c", vest: "#ddcca4", shirt: "#fbf7ee", tie: "#35598f", trous: "#b8a47c", shoe: "#4a3428", cap: "#7a5a3a", hair: "#6b4a2e" }, band: "#5a4028", mono: false, pipe: false, moustache: false, brow: "#6b4a2e" };
/** the other dealer (from shot 15): a grey suit, a green cap, a grey moustache */
export const GREY: Look = { col: { coat: "#7c7f88", vest: "#8d9099", shirt: "#f1efe9", tie: "#3c4a3c", trous: "#6a6c74", shoe: "#26222a", cap: "#3d6a48", hair: "#8a8a86" }, band: "#2a4a32", mono: false, pipe: false, brow: "#6e6e6a" };
/** two dealers on the bench who are never seen again (shot 7): recoloured */
const BENCH2: Look = { col: { coat: "#5a4a6a", vest: "#6a5a7a", shirt: "#f1efe9", tie: "#c9a24a", trous: "#4a3e58", shoe: "#26222a", cap: "#3a2e48", hair: "#2e2a26" }, band: "#241c30", mono: false, pipe: false, moustache: false, brow: "#2e2a26" };
const BENCH3: Look = { col: { coat: "#4a6a74", vest: "#5a7a84", shirt: "#f1efe9", tie: "#7a2a2a", trous: "#3e5860", shoe: "#26222a", cap: "#2e4a52", hair: "#a07a50" }, band: "#1e343a", mono: false, pipe: false, brow: "#8a6a40" };
/** the Paris policeman: a navy coat and cap with a red band and a gold badge (the kepi and cape are new shapes: colours only) */
export const POLICE: Look = { col: { coat: "#1f2a4a", vest: "#1f2a4a", shirt: "#e9edf3", tie: "#141a2e", trous: "#1a2340", shoe: "#141218", cap: "#1f2a4a", hair: "#3a2a20" }, band: "#b3262b", badge: "#e8c45a", mono: false, pipe: false, brow: "#3a2a20" };
const CON_SLEEVE = "#2c2c36", YOUNG_SLEEVE = "#cdb88c";

/** the approved six faces (FlatStyle.tsx MINER, Jesper 20 Nov): smug, delighted, shock, hard squeeze, grimace, tear */
// (the resting lids of smug and grimace at 0.3: a blink is lid = max(rest, blink) and clipKit draws any lid from 0.3 to 0.75 at 0.42, so at
//  0.55 and 0.32 the blink's half lid looked like the rest and the eye went straight to shut; at 0.3 it goes 0.30, 0.42, shut, 0.42, 0.30,
//  DAILY-RULES 9 and the reviewer of v10)
export const FACES: Record<string, Face> = {
  smug: { lid: 0.3, smirk: 1, brow: -0.25, smile: 0.15, gaze: [0.7, 0], pupil: 1, mouth: 0 },
  delighted: { smile: 0.3, mouth: 0, brow: 0.5, pupil: 1 },      // (smile 0.3: at 1 the rig opened a D-shaped grin with the tongue showing, which two independent reviews read as talking; non-speakers keep the mouth shut)      // (the mouth shut: only Daniel's line is spoken in the picture, the independent review)
  shock: { wide: 1, brow: 1, sad: 0.6, pupil: 0.5, mouth: 0.5, smile: -0.7 },
  squeeze: { squeeze: 1, smile: -0.6, mouth: 0.3, teeth: 1, brow: -0.4, pupil: 1 },
  calm: { pupil: 1, smile: 0.2, mouth: 0 },
  grimace: { brow: -1, lid: 0.3, smile: -0.5, teeth: 1, mouth: 0.42, pupil: 1 },
  tear: { tear: 1, sad: 1, smile: -1, lid: 0.45, mouth: 0.35, gaze: [0, 0.3], pupil: 1 },
};

// ---------------------------------------------------------------- the things ----------------------------------------------------------------
/** the Eiffel Tower, flat: four legs from a wide base under an arch, two platforms, the narrowing shaft and the spire; lattice lines in it.
 *  x, y: the middle of its base; h: its height; col: its iron's colour */
const tower = (g: G, x: number, y: number, h: number, col = "#6a5040", lw = OL, lattice = true) => {
  const w = h * 0.42, p1 = y - h * 0.22, p2 = y - h * 0.47, top = y - h;
  const L: P2[] = [[x - w / 2, y], [x - w * 0.28, p1], [x - w * 0.12, p2], [x - w * 0.035, top + h * 0.12], [x, top], [x + w * 0.035, top + h * 0.12], [x + w * 0.12, p2], [x + w * 0.28, p1], [x + w / 2, y]];
  poly(g, L.concat([[x + w * 0.3, y], [x + w * 0.2, y - h * 0.12], [x, y - h * 0.15], [x - w * 0.2, y - h * 0.12], [x - w * 0.3, y]]), col, lw);
  rect(g, x - w * 0.33, p1 - h * 0.02, w * 0.66, h * 0.035, col, lw * 0.8); rect(g, x - w * 0.17, p2 - h * 0.02, w * 0.34, h * 0.03, col, lw * 0.8);
  if (lattice) { const lc = "rgba(36,23,38,0.55)", lw2 = Math.max(1.5, lw * 0.35);
    for (let k = 1; k < 6; k++) { const yy = y - (h * 0.92 * k) / 6, half = w / 2 * (1 - (k / 6) * 0.93) * 0.9; line(g, [[x - half, yy], [x + half, yy - h * 0.05]], lw2, lc); line(g, [[x + half, yy], [x - half, yy - h * 0.05]], lw2, lc); } } };
/** the tower model on the stamp table: the same shape, small, on a little plinth */
const towerModel = (g: G, x: number, y: number, h: number) => { rect(g, x - h * 0.3, y - h * 0.04, h * 0.6, h * 0.08, "#5a3a2a", OL * 0.8); tower(g, x, y - h * 0.04, h, "#8a7058", OL * 0.8); };
/** the paper with the tower drawn on it, and (when stamped) the red SOLD mark */
const towerPaper = (g: G, x: number, y: number, w: number, h: number, sold: boolean) => {
  rect(g, x, y, w, h, "#f3ead2", OL * 0.8); tower(g, x + w / 2, y + h * 0.9, h * 0.78, "#f3ead2", 5, true);
  // (the mark the size of the stamp's own silhouette and where it stands at contact, so at frame 1 it lies wholly under the stamp and only shows as
  //  the stamp lifts: a mark larger than the stamp showed round it at the contact, the review's v4 point 8)
  if (sold) { g.save(); g.translate(x + w * 0.5, y + h * 0.533); g.rotate(-0.05);
    g.fillStyle = "rgba(246,214,204,0.92)"; g.beginPath(); g.roundRect(-w * 0.27, -h * 0.09, w * 0.54, h * 0.18, 12); g.fill();      // (the stamp's ink over the drawing: the tower's lines showed through the mark, the independent review)
    g.lineWidth = 9; g.strokeStyle = "#c0262e"; g.beginPath(); g.roundRect(-w * 0.27, -h * 0.09, w * 0.54, h * 0.18, 12); g.stroke();
    g.fillStyle = "#c0262e"; g.font = `900 ${Math.round(h * 0.125)}px 'Arial Black', Arial, sans-serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("SOLD", 0, 4); g.restore(); } };
/** a rubber stamp seen from above and in front: the dark rubber pad (its face never shown), the wooden block and the round handle */
const stamp = (g: G, x: number, y: number, s: number) => { g.save(); g.translate(x, y); g.scale(s, s);
  rrect(g, -120, -18, 240, 36, 8, "#3a2a2e", OL); rrect(g, -100, -80, 200, 66, 10, "#8a5a36", OL); rrect(g, -26, -170, 52, 96, 18, "#6b4428", OL); ell(g, 0, -180, 46, 30, "#7a4e2e", OL); g.restore(); };
/** a letter with a seal (squiggles only), held up or lying; back: its blank back */
const letter = (g: G, x: number, y: number, w: number, h: number, back = false) => { rect(g, x, y, w, h, back ? "#e6dcc2" : "#f4ecd6", OL * 0.8);
  if (back) return; squiggles(g, x + w * 0.1, y + h * 0.15, w * 0.8, 6, h * 0.1, "#6a5a6a", 3.5); ell(g, x + w * 0.72, y + h * 0.83, w * 0.11, w * 0.11, "#b3262b", OL * 0.6); ell(g, x + w * 0.72, y + h * 0.83, w * 0.05, w * 0.05, "#8a1a22", 0); };
const cheque = (g: G, x: number, y: number, w: number, h: number) => { rect(g, x, y, w, h, "#dfeee0", OL * 0.7); squiggles(g, x + w * 0.08, y + h * 0.22, w * 0.84, 3, h * 0.22, "#4a6a5a", 3.5); line(g, [[x + w * 0.55, y + h * 0.82], [x + w * 0.9, y + h * 0.82]], 3, "#4a6a5a"); };
const cupAndSaucer = (g: G, x: number, y: number, s: number, hop = 0) => { ell(g, x, y + 6, 70 * s, 14 * s, "#f2efe8", OL * 0.7);
  g.save(); g.translate(0, -hop); poly(g, [[x - 40 * s, y - 50 * s], [x + 40 * s, y - 50 * s], [x + 32 * s, y], [x - 32 * s, y]], "#f6f3ec", OL * 0.7); ell(g, x + 48 * s, y - 28 * s, 14 * s, 16 * s, null, OL * 0.6); g.restore(); };
/** an envelope sticking up out of a breast pocket (the bribe, its result shown) */
const pocketEnvelope = (g: G, x: number, y: number, s: number) => { poly(g, [[x - 34 * s, y], [x - 30 * s, y - 56 * s], [x + 30 * s, y - 62 * s], [x + 34 * s, y]], "#efe4c6", OL * 0.6); line(g, [[x - 30 * s, y - 56 * s], [x, y - 30 * s], [x + 30 * s, y - 62 * s]], OL * 0.4); };

// ---------------------------------------------------------------- the places ----------------------------------------------------------------
/** the evening sky of Paris (warm low, blue high) */
const eveningSky = (g: G, y0: number, y1: number) => { const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, "#3b4c7a"); gr.addColorStop(0.6, "#c9776a"); gr.addColorStop(1, "#f2b27a"); g.fillStyle = gr; g.fillRect(-4000, y0, 9000, y1 - y0); };
/** the hotel suite behind standing or seated figures: striped wallpaper, a dado, the floor, a crystal chandelier's warm glow above; a window
 *  with the evening and the tower small in it (window: its left x; towerY: the tower's base). colours: the suite (warm) or the second hotel */
type Suite = { wall: string; stripe: string; dado: string; floor: string };
const SUITE: Suite = { wall: "#8f5a4a", stripe: "#7e4e40", dado: "#5e3a30", floor: "#4a3028" };
const SUITE2: Suite = { wall: "#4f6e6c", stripe: "#44605e", dado: "#2f4442", floor: "#3a3440" };
const suite = (g: G, cam: { cx: number; cy: number; z: number }, s: Suite, win?: { x: number; w: number; top: number; bottom: number; towerX: number; towerY: number; towerH: number }) => {
  const v = viewOf(cam), x0 = v.x0 - 200, x1 = v.x1 + 200; g.fillStyle = s.wall; g.fillRect(x0, v.y0 - 200, x1 - x0, LINE_TOP - v.y0 + 200);
  for (let x = Math.floor(x0 / 90) * 90; x < x1; x += 90) { g.fillStyle = s.stripe; g.fillRect(x, v.y0 - 200, 34, LINE_TOP - v.y0 + 200); }
  rect(g, x0, LINE_TOP - 260, x1 - x0, 24, s.dado, 0); g.fillStyle = s.dado; g.fillRect(x0, LINE_TOP - 236, x1 - x0, 236);
  if (win) { g.save(); g.beginPath(); g.rect(win.x, win.top, win.w, win.bottom - win.top); g.clip(); eveningSky(g, win.top, win.bottom);
    tower(g, win.towerX, win.towerY, win.towerH, "#4a3a44", Math.max(3, OL * 0.5)); rect(g, win.x - 10, win.bottom - 70, win.w + 20, 80, "#5a4a5a", 0); g.restore();
    rect(g, win.x, win.top, win.w, win.bottom - win.top, null as unknown as string, 16); g.lineWidth = 16; g.strokeStyle = "#e9dcc4"; g.strokeRect(win.x, win.top, win.w, win.bottom - win.top);
    line(g, [[win.x + win.w / 2, win.top], [win.x + win.w / 2, win.bottom]], 10, "#e9dcc4"); line(g, [[win.x, (win.top + win.bottom) / 2], [win.x + win.w, (win.top + win.bottom) / 2]], 10, "#e9dcc4"); }
  g.fillStyle = s.floor; g.fillRect(x0, LINE_TOP, x1 - x0, v.y1 - LINE_TOP + 200); line(g, [[x0, FM.GY], [x1, FM.GY]], FM.LINE);
  g.save(); g.globalCompositeOperation = "lighter"; glow(g, cam.cx, v.y0 + 120, 900, "rgba(255,210,150,A)", 0.16); g.restore(); };
/** a wooden table top seen from above at an angle (the close-ups of things on it) */
const tableTop = (g: G, col = "#7a4e30") => { fillAll(g, col); for (let i = 0; i < 14; i++) line(g, [[-200, 140 + i * 150], [1300, 120 + i * 150]], 3, "rgba(40,20,10,0.25)"); };

// ---------------------------------------------------------------- the shots ----------------------------------------------------------------
type Shot = Clip & { sounds?: { t: number; k: string; g?: number; p?: number; dur?: number; big?: number }[] };
const SCREEN = { cx: FM.W / 2, cy: FM.H / 2, z: 1 };
const propShot = (id: string, title: string, seconds: number, draw: (g: G, t: number) => void, sounds?: Shot["sounds"], cam: (t: number) => { cx: number; cy: number; z: number } = () => SCREEN): Shot =>
  ({ id, title, seconds, cast: [], events: {}, shot: "full", camera: cam, ownBg: draw, sounds });

// 1 and 19  the stamp: the paper with the tower drawn on it beside the tower model, the con man's hand on the stamp. Shot 1's first frame is the
//    contact (the voice and the only sound hit); the stamp lifts about 40 px (and 80 px aside) over 12 frames and SOLD shows the right way round;
//    its rubber face never shows. Shot 19: the same set-up, the stamp coming down over "offers?", its last frame one frame before contact, a few
//    px above the paper, with no sound (the review's v4 verdict, points 8 and 10). Camera: a slow push-in in both.
const PAPER = { x: 330, y: 760, w: 420, h: 540 }, STAMP_AT: P2 = [PAPER.x + PAPER.w * 0.5, PAPER.y + PAPER.h * 0.6];
const stampScene = (g: G, sx: number, sy: number, sold: boolean) => { tableTop(g); towerModel(g, 900, 1300, 460);
  towerPaper(g, PAPER.x, PAPER.y, PAPER.w, PAPER.h, sold);
  // (the hand on the stamp's handle from above-right, the forearm out through the picture's top edge)
  const H: HandSpec = { id: "stamp", x: sx + 70, y: sy - 200, ang: Math.PI * 0.95, s: 1.35, sleeve: CON_SLEEVE, curl: 0.9, thumb: 0.5 };      // (the fist on the handle's top, the forearm out through the right edge, nearly level: at 0.8 pi the sleeve rose into the hook text's line ends, the fifth review)
  stamp(g, sx, sy, 1.2); DRAWN.things.push({ what: "stamp", at: [sx, sy], carried: true, look: "stamp" }); handBack(g, H); handFingers(g, H); };
const stampCam = (t: number, sec: number) => ({ cx: 590, cy: 1010, z: lerp(1.55, 1.62, smooth(t / sec)) });
const s01 = (): Shot => propShot("e01", "1 Stämpeln (SOLD)", 1.6, (g, t) => {
  // (12 frames, 0.1-0.5 s: lifted 40 px; then aside to the upper right over 0.8 s, about 9 px a frame, so the whole SOLD shows)
  // (lifted 40 px over 12 frames, 0.1-0.5 s; then on up off the mark over 0.95 s, so the whole SOLD shows: at most about 10 px a frame on the
  //  screen; aside it went 26 px a frame, scripts/eiffel_check.mjs)
  const u = smooth((t - 0.1) / 0.4), v = smooth((t - 0.5) / 0.95);
  stampScene(g, STAMP_AT[0] + 85 * v, STAMP_AT[1] - 40 * u - 95 * v, true);      // (up and to the right: straight up, the sleeve rose behind the hook text's lower line in opening (d), where the text stays 3 s over this shot, the sixth review)
}, [{ t: 0, k: "gavel", g: 1.2 }, { t: 0, k: "tap", g: 1.0 }], (t) => stampCam(t, 1.6));
const s19 = (): Shot => propShot("e19", "19 Stämpeln på väg ner (loopen)", 0.73, (g, t) => {
  // (from the lifted place down to 3 px above the paper at the last frame, 0.67 s; contact is frame 1 of the film)
  const last = 0.73 - 1 / FM.FPS, u = smooth(Math.min(1, t / last)), lift = lerp(50, 3, u);
  stampScene(g, STAMP_AT[0], STAMP_AT[1] - lift, false);
}, [], (t) => ({ ...stampCam(0, 1.6), z: lerp(1.585, stampCam(0, 1.6).z, smooth(Math.min(1, t / (0.73 - 1 / FM.FPS)))) }));      // (a slow pull-back ending on frame 1's framing, so the loop meets it)

// 2  "It was never his.": the con man in the foreground, 55-70 % of the height, smug, his mouth shut, standing as 01 (no gesture); the tower
//    behind him in the evening light. Camera: a slow push-in.
const s02 = (): Shot => { const seconds = 2.2, m = figure("sir", -0.15, 18); m.stand(seconds + 1);
  // (a slow smug nod already under way in the first frame, for opening (c), which starts on this shot)
  // (the head's yaw 0 on a body turned 18: the face's yaw stays well under the front/three-quarter switch at 26.7; at 6 the nod's idle carried it
  //  over and the view turned back within a second, clip_check)
  ease(m, -1, { head: [0, 0, 0] }, 0.01, { face: FACES.smug }); ease(m, -0.2, { head: [0, 6, 0] }, 0.6, { face: FACES.smug }); ease(m, 0.5, { head: [0, 1, 0] }, 0.7, { face: FACES.smug }); ease(m, 1.05, { head: [0, 3, -3], lean: -6 }, 0.45, { face: FACES.delighted });      // (the second body action: he leans back, pleased, and grins)
  // (he holds up the stamped paper, the tower drawn on it with SOLD across, at his chest (04): the claim and his face together in frame 1; at
  //  phone size the face alone with the words left the claim to the text, the independent review)
  // (the review of v10: a body action before 1.0 s in opening (c): he lifts the SOLD paper toward us from the first frame (04's lift, 24 px over
  //  0.5 s), then leans back, pleased with himself (1.05 s))
  const h = holdSheet("con", m, -0.15, "sold", false, false, (t: number) => 24 * env(t, 0, 0.5, 99, 0.3));
  const cast: Cast[] = [{ name: "con", m, who: "sir", look: CON, seed: 9, armWipe: false, hands: { L: [[0, "grip"]], R: [[0, "grip"]] }, pose: h.pose }];
  const z = (0.62 * FM.H) / (FM.PPM * heightOf("sir")), c0 = fitCam(cast, seconds, z);
  // (the figure low enough that the hook's two lines (to y 345) stay clear of his cap: the text lay over it in the draft)
  const cam = (t: number) => { const z = c0.z * lerp(0.96, 1, smooth(t / seconds)); return { ...c0, cy: c0.cy - 150 / z, z }; };
  return { id: "e02", title: "2 Bedragaren framför tornet", seconds, cast, events: {}, shot: "full", camera: cam, contacts: h.contacts, over: h.over,
    ownBg: (g, t) => { const c = cam(t), v = viewOf(c); eveningSky(g, v.y0 - 200, LINE_TOP - 300);
      for (let i = 0; i < 9; i++) { const hx = v.x0 - 100 + i * 190, hh = 260 + ((i * 53) % 140); rect(g, hx, LINE_TOP - 300 - hh, 180, hh + 300, ["#5a4458", "#4e3c52", "#644a5c"][i % 3], OL * 0.6); }
      tower(g, c.cx + 250, LINE_TOP - 280, 640, "#4a3a50", OL * 0.7);
      g.fillStyle = "#3a3038"; g.fillRect(v.x0 - 200, LINE_TOP - 300, v.x1 - v.x0 + 400, 300); g.fillStyle = "#6a5a5e"; g.fillRect(v.x0 - 200, LINE_TOP, v.x1 - v.x0 + 400, 800); line(g, [[v.x0 - 200, FM.GY], [v.x1 + 200, FM.GY]], FM.LINE); } } as Shot; };

// 3 and 4  the newspaper on the suite's table: the masthead's date MAI 1925 (3), then its picture of the tower with rust on it (4); no price,
//    no scaffolding. Camera: a slow slide sideways (3), a slow glide down (4). The cut to shot 5 after "fix".
const paperPage = (g: G) => { tableTop(g, "#6e4630"); g.save(); g.translate(540, 980); g.rotate(-0.04);
  rect(g, -470, -760, 940, 1540, "#eee6d2", OL); line(g, [[-430, -560], [430, -560]], 6); line(g, [[-430, -548], [430, -548]], 3);
  // the masthead: a heavy black band of the paper's name as squiggles (no readable name), and the date on its own as an object
  squiggles(g, -400, -690, 800, 2, 52, "#2a2428", 14);      // (the paper's name as thick squiggles: a black band read as struck out, the review of v10)
  g.fillStyle = "#2a2428"; g.font = "900 64px Georgia, 'Times New Roman', serif"; g.textAlign = "center"; g.textBaseline = "alphabetic"; g.fillText("MAI 1925", 0, -470);
  squiggles(g, -430, -400, 380, 9, 34, "#4a424a", 4); squiggles(g, 50, -400, 380, 9, 34, "#4a424a", 4);
  // the picture: the tower with rust (brown blotches on its iron)
  rect(g, -400, -40, 800, 600, "#d8cfb8", OL * 0.7); g.save(); g.beginPath(); g.rect(-400, -40, 800, 600); g.clip(); tower(g, 0, 540, 560, "#857262", 5, true);
  // (the rust on the tower's own iron: blotches spread across its width at their height, inside its outline, the independent review)
  for (let i = 0; i < 22; i++) { const yy = 520 - ((i * 211) % 480), half = 0.21 * 560 * (1 - (540 - yy) / 560) * 0.55; ell(g, ((i * 97) % 200 - 100) / 100 * half, yy, 9 + (i % 3) * 3, 6 + (i % 2) * 3, "#9a4a24", 0); } g.restore();
  squiggles(g, -430, 600, 860, 3, 34, "#4a424a", 4); g.restore(); };
const s03 = (): Shot => { const seconds = 1.6, m = figure("sir", 0, 0); m.stand(seconds + 1);
  // (the body action, the review of v10: he lowers the newspaper 40 px (0.2-0.65 s) to look over it at us, and leans back a little)
  ease(m, -1, { head: [0, 8, 0] }, 0.01, { face: { ...FACES.smug, gaze: [0, 0.8] } });
  ease(m, 0.3, { head: [0, 2, 0], lean: -4 }, 0.45, { face: { ...FACES.delighted, gaze: [0, 0.1] } });
  const h = holdSheet("con", m, 0, "news", false, false, (t: number) => -40 * env(t, 0.2, 0.45, 99, 0.3));
  const cast: Cast[] = [{ name: "con", m, who: "sir", look: CON, seed: 9, armWipe: false, hands: { L: [[0, "grip"]], R: [[0, "grip"]] }, pose: h.pose }];
  const c0 = fitCam(cast, seconds, 2.7, [], () => false, 0.06), cam = (t: number) => ({ ...c0, z: c0.z * lerp(0.97, 1, smooth(t / seconds)) });
  return { id: "e03", title: "3 Han läser tidningen", seconds, cast, events: {}, shot: "medium", camera: cam, contacts: h.contacts, over: h.over, ownBg: (g, t) => suite(g, cam(t), SUITE) } as Shot; };
const s04 = (): Shot => propShot("e04", "4 Tidningen: det rostiga tornet", 1.5, (g) => paperPage(g), [], (t) => ({ cx: 545, cy: lerp(1160, 1240, smooth(t / 1.5)), z: 1.55 }));

// 5  "He was a con man.": the con man standing beside the suite's table (the newspaper on it), in 01's framing, smug, his mouth shut, no gesture.
//    Camera: a slow push-in.
const s05 = (): Shot => { const seconds = 1.6, m = figure("sir", -0.1, 56); m.stand(0.1);
  // (the body actions, the review of v10: he turns from three-quarter to face us (03's turn, 0.1-0.85 s), then leans back, smug (1.0 s))
  m.turn(-26, 0.7, 0.015); m.stand(seconds + 1);      // (56 to 30 degrees, inside the three-quarter drawing: through the switch to the front the face's redraw flickered at this size, v11)
  ease(m, -1, { head: [0, 2, 0] }, 0.01, { face: { ...FACES.smug, gaze: [0.5, 0] } });
  ease(m, 1.0, { head: [0, -3, -3], lean: -6 }, 0.35, { face: { ...FACES.delighted, gaze: [0, 0] } });
  const cast: Cast[] = [{ name: "con", m, who: "sir", look: CON, seed: 1,      // (seed 1: no blink during the turn; with 9 a blink fell on the turn and the eyes shut as the head changed drawings, flicker on v11)
     armWipe: false, hands: { L: [[0, "relaxed"]], R: [[0, "relaxed"]] } }];
  const tx0 = px(0.3), tx1 = px(0.84), c0 = fitCam(cast, seconds, 2.7, [], () => false, 0.06);
  const cam = (t: number) => ({ ...c0, z: c0.z * lerp(0.95, 1, smooth(t / seconds)) });
  return { id: "e05", title: "5 Bedragaren vid bordet", seconds, cast, events: {}, shot: "medium", camera: cam, groundProps: [{ name: "table", x0: tx0, x1: tx1 }],
    ownBg: (g, t) => { suite(g, cam(t), SUITE); rect(g, tx0, LINE_TOP - 420, tx1 - tx0, 34, "#6e4630"); for (const lx of [tx0 + 20, tx1 - 40]) { DRAWN.uprights.push({ what: "table leg", foot: LINE_TOP, floor: LINE_TOP, x: lx }); rect(g, lx, LINE_TOP - 386, 22, 386, "#5a3826"); }
      g.save(); g.translate((tx0 + tx1) / 2, LINE_TOP - 432); g.rotate(-0.05); rect(g, -100, -14, 200, 14, "#eee6d2", OL * 0.6); g.restore(); } } as Shot; };

/** the zoom at which a standing figure is `frac` of the picture's height (the review of v10: at least 0.6 alone, 0.45 in two- and three-shots) */
const ZH = (frac: number) => (frac * FM.H) / (FM.PPM * heightOf("sir"));
/** a camera whose ground line lies `feet` down the picture: the lower part free for the phone's buttons, no more than about 20 % */
const camFeet = (cx: number, z: number, feet = 0.8) => ({ cx, cy: footY("sir") - ((feet - 0.5) * FM.H) / z, z });
/** 05's point (shot 8's geometry): the arm up, the finger out toward `TW` at 0.93 of the arm along the line from the shoulder, bent 22 */
const pointer = (name: string, m: ReturnType<typeof figure>, sx: number, TW: P2, UP: number, HOLD0: number, HOLD1: number, DOWN: number) => {
  let held: Pose["armL"] | null = null;
  const heldArm = () => { if (held) return held; const { pose: p, heading } = poseAt({ name, m, who: "sir", seed: 7 }, HOLD0), P = D.props("sir"), s = scaleOf("sir"), armLen = (P.upper + P.fore + P.hand) * s;
    const sk = solve(P, p, heading), q = sk.j.shL as unknown as number[], sh: P2 = [sx + q[0] * s, footY("sir") + q[1] * s], dx = TW[0] - sh[0], dy = TW[1] - sh[1], l = Math.hypot(dx, dy);
    held = reach("sir", sx, p, heading, "L", [sh[0] + (dx / l) * 0.93 * armLen, sh[1] + (dy / l) * 0.93 * armLen], true, { bend: 22, elbowOut: sh[0] + 20 }).armL; return held; };
  return (t: number, p: Pose): Pose => { const w = env(t, UP, HOLD0 - UP, HOLD1, DOWN - HOLD1); return w <= 0 ? p : { ...p, armL: lerpArm(p.armL, heldArm(), w) }; }; };

// 6, 14, 15, 16  a figure holding a sheet up with both hands at his chest (04, the approved hold): each hand on the sheet's side, its heel and
//    back round the side edge, the thumb over the front; the sheet's face (or its blank back) to us
const SHEET = { w: 150, h: 160 };      // (shorter than 04's chest, so the paper's top stays under the chin, the independent review)
type Held = "letter" | "back" | "news" | "cheque" | "envelope" | "bid" | "sold";
const newspaperHeld = (g: G, x: number, y: number, w: number, h: number) => { rect(g, x, y, w, h, "#eee6d2", OL * 0.8); squiggles(g, x + w * 0.1, y + h * 0.09, w * 0.8, 2, h * 0.05, "#2a2428", 4);      // (the paper's name as squiggles: a black band read as struck out, the review of v10)
  g.fillStyle = "#2a2428"; g.font = `900 ${Math.round(h * 0.075)}px Georgia, 'Times New Roman', serif`; g.textAlign = "center"; g.textBaseline = "alphabetic"; g.fillText("MAI 1925", x + w / 2, y + h * 0.29);
  rect(g, x + w * 0.12, y + h * 0.36, w * 0.76, h * 0.4, "#d8cfb8", 3); tower(g, x + w / 2, y + h * 0.74, h * 0.34, "#857262", 2.5, false); squiggles(g, x + w * 0.1, y + h * 0.84, w * 0.8, 2, h * 0.06, "#4a424a", 2.5); };
const envelopeHeld = (g: G, x: number, y: number, w: number, h: number) => { rect(g, x, y + h * 0.3, w, h * 0.42, "#efe4c6", OL * 0.7); line(g, [[x, y + h * 0.3], [x + w / 2, y + h * 0.52], [x + w, y + h * 0.3]], OL * 0.5);
  for (let k = 0; k < 3; k++) rect(g, x + w * (0.2 + k * 0.05), y + h * (0.22 - k * 0.025), w * 0.5, h * 0.1, "#bcd6b8", 3); };
/** lift: 04's lift of the held thing (px up at time t), the second beat of a longer shot */
const holdSheet = (name: string, m: ReturnType<typeof figure>, x: number, kind: Held = "letter", seatedFront = false, fixed = false, lift0: (t: number) => number = () => 0, up = 250) => { let lift = lift0;
  // (the sheet at the figure's own chest, from his solved skeleton: seated, a sheet at a standing chest's height covered his mouth)
  let chest: P2 | null = null;
  const at = (): P2 => { if (!chest) { const pel = (mm: ReturnType<typeof figure>, nm: string) => { const a = poseAt({ name: nm, m: mm, who: "sir" }, 0.3), sk = solve(D.props("sir"), a.pose, a.heading); return (sk.j.pelvis as unknown as number[])[1] * scaleOf("sir"); };
    const ref = figure("sir", 0, 0); ref.stand(3); chest = [px(x), footY("sir") - up + (pel(m, name) - pel(ref, "ref"))];      // (up: 04's 250 over the soles; 236 where a face looks down onto it, clear of the chin)
    // (seated and facing left: in front of his shoulders, a little under them, where both hands reach)
    if (seatedFront) { const a = poseAt({ name, m, who: "sir" }, 0.3), sk = solve(D.props("sir"), a.pose, a.heading), s2 = scaleOf("sir"), L = sk.j.shL as unknown as number[], Rr = sk.j.shR as unknown as number[], P = D.props("sir"), arm = (P.upper + P.fore) * s2;
      chest = [px(x) + ((L[0] + Rr[0]) / 2) * s2 - 0.52 * arm, footY("sir") + ((L[1] + Rr[1]) / 2) * s2 + 0.25 * arm]; } } return chest; };
  const side = (d: 1 | -1, t = 0): P2 => { const [cx, cy] = at(); return [cx + d * (SHEET.w / 2 - 16), cy + 4 - lift(t)]; };
  const solve2 = (p: Pose, heading: number, t = 0): Pose => { const xx = px(x); return reach("sir", xx, reach("sir", xx, p, heading, "L", side(1, t), false, { elbowBelow: true }), heading, "R", side(-1, t), false, { elbowBelow: true }); };
  let ref: Pose | null = null;
  // (fixed: the arms found once and kept, for a hold whose per-frame search swapped between two near-equal elbows, clip_check's jitter)
  // (a lift: the arms found once at rest and once at the top of the lift, and blended between them by the lift's own curve; searched each
  //  frame, the arm swapped between two near-equal elbows and jittered, clip_check. The thing is then carried by the hands)
  let LMAX = 0; for (let k = 0; k <= 90; k++) LMAX = Math.abs(lift(k / 30)) > Math.abs(LMAX) ? lift(k / 30) : LMAX;
  let top: Pose | null = null;
  const hold = (t: number, p: Pose, heading: number): Pose => { if (!ref) { const a = poseAt({ name, m, who: "sir" }, 0); ref = solve2(a.pose, a.heading); }
    if (LMAX !== 0) { if (!top) { const a = poseAt({ name, m, who: "sir" }, 0), sv = lift; lift = () => LMAX; top = solve2({ ...a.pose, armL: ref.armL, armR: ref.armR }, a.heading, 0); lift = sv; }
      const w = lift(t) / LMAX; return { ...p, armL: lerpArm(ref.armL, top.armL, w), armR: lerpArm(ref.armR, top.armR, w) }; }
    return fixed ? { ...p, armL: ref.armL, armR: ref.armR } : solve2({ ...p, armL: ref.armL, armR: ref.armR }, heading, t); };
  let off0: P2 | null = null;
  // (the offset from the hands to the thing, found from the figure at t = 0 (at rest), whatever frame is drawn first: taken from the first
  //  frame drawn, it differed between the renderer's parallel chunks and the paper jumped, the flicker measure on v4)
  const carried = (f: Fig): P2 => { const a = jointPx(f, "wrL"), b = jointPx(f, "wrR"), mid: P2 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    if (!off0) { const f0 = castAt([{ name, m, who: "sir", pose: hold }], 0)[0], a0 = jointPx(f0, "wrL"), b0 = jointPx(f0, "wrR"), c0 = at(); off0 = [c0[0] - (a0[0] + b0[0]) / 2, c0[1] - (a0[1] + b0[1]) / 2]; }
    return [mid[0] + off0[0], mid[1] + off0[1]]; };
  const over = (g: G, t: number, f: Fig) => { if (f.name !== name) return; const carry = fixed || LMAX !== 0, [cx, cy0] = carry ? carried(f) : at(), cy = cy0 - (carry ? 0 : lift(t)), x0 = cx - SHEET.w / 2, y0 = cy - SHEET.h / 2;
    if (kind === "sold") towerPaper(g, x0 - 10, y0 - 10, SHEET.w + 20, SHEET.h + 20, true); else if (kind === "news") newspaperHeld(g, x0, y0, SHEET.w, SHEET.h); else if (kind === "cheque") cheque(g, x0 - 10, cy - 46, SHEET.w + 20, 92); else if (kind === "envelope") envelopeHeld(g, x0, y0, SHEET.w, SHEET.h);
    else if (kind === "bid") { const bh = SHEET.h * 0.6, by = cy - bh / 2; rect(g, x0, by, SHEET.w, bh, "#f4ecd6", OL * 0.8); squiggles(g, x0 + SHEET.w * 0.1, by + bh * 0.18, SHEET.w * 0.8, 4, bh * 0.18, "#6a5a6a", 3.5); } else letter(g, x0, y0, SHEET.w, SHEET.h, kind === "back");      // (the bid shorter, so its top stays under his chin, the independent review)
    for (const d of [-1, 1]) { const ex = cx + d * SHEET.w / 2, hy = cy + 6; g.save(); g.translate(ex, hy);
      g.beginPath(); g.moveTo(d * 20, -34); g.quadraticCurveTo(d * 30, 0, d * 20, 34); g.lineTo(-d * 6, 34); g.quadraticCurveTo(-d * 12, 0, -d * 6, -34); g.closePath(); g.fillStyle = SKIN; g.fill(); g.lineWidth = 7; g.strokeStyle = INK; g.stroke();
      for (const yy of [-14, 2, 18]) { g.beginPath(); g.moveTo(-d * 4, yy); g.lineTo(d * 10, yy + 2); g.lineWidth = 3.5; g.stroke(); }
      g.beginPath(); g.ellipse(-d * 22, -26, 18, 10, d * 0.35, 0, Math.PI * 2); g.fillStyle = SKIN; g.fill(); g.lineWidth = 6; g.stroke(); g.restore(); } };
  // (fixed: the hands carry the thing, so it moves with them as he breathes; the check's contact (the wrists at the thing's sides) holds by
  //  construction and is left out)
  if (fixed || LMAX !== 0) return { pose: hold, over, contacts: [] };
  return { pose: hold, over, contacts: [{ who: name, side: "L" as const, t0: 0, t1: 99, at: (t: number) => side(1, t), tol: 4, what: `${name}'s left hand at the sheet's right side` }, { who: name, side: "R" as const, t0: 0, t1: 99, at: (t: number) => side(-1, t), tol: 4, what: `${name}'s right hand at the sheet's left side` }] }; };
const s06 = (): Shot => { const seconds = 2.0, m = figure("sir", 0, 36); m.stand(seconds + 1);
  // (the body actions, the review of v10: he lifts the sealed letter to show it (0.15-0.55 s), then bows like an official (1.0-1.35 s) and
  //  straightens (1.45-1.8 s))
  ease(m, -1, { head: [0, 6, 0] }, 0.01, { face: { ...FACES.smug, gaze: [0, 0.5] } });
  ease(m, 0.95, { head: [0, 8, 0], lean: 7 }, 0.5, { face: { ...FACES.smug, gaze: [0, 0.3] } });      // (7 degrees over 0.5 s each way: at 12 over 0.35 s the head moved 20 px a frame, flicker on v11)
  ease(m, 1.5, { head: [0, 2, 0], lean: 0 }, 0.5, { face: { ...FACES.delighted, gaze: [0, 0.1] } });
  const h = holdSheet("con", m, 0, "letter", false, false, (t: number) => 22 * env(t, 0.15, 0.4, 99, 0.3), 240);
  const cast: Cast[] = [{ name: "con", m, who: "sir", look: CON, seed: 9, armWipe: false, hands: { L: [[0, "grip"]], R: [[0, "grip"]] }, pose: h.pose }];
  const c0 = fitCam(cast, seconds, ZH(0.63), [], () => false, 0.05), cam = (t: number) => ({ ...c0, z: c0.z * lerp(1, 0.98, smooth(t / seconds)) });
  return { id: "e06", title: "6 Brevet med sigillet", seconds, cast, events: {}, shot: "full", camera: cam, contacts: h.contacts, over: h.over, ownBg: (g, t) => suite(g, cam(t), SUITE) } as Shot; };

// 7, 9, 10  the dealers seated on a bench in profile, all facing the same way, their hands on their thighs (07, the approved sit, already seated);
//    on the bench's top under their thighs; at least 40 px between their boxes (checked in scripts/eiffel_check.mjs)
/** a figure already seated from the first frame (07's seated pose: back 0.52, down 0.43, leaning 16), so nothing pops in */
const SIT = { pz: -0.52, py: -0.43, lean: 16 };
const seated = (name: string, xm: number, head: [number, number, number], face: Face) => { const m = figure("sir", xm, -90); m.stand(12);
  ease(m, -1, { ...SIT, head } as Partial<Pose>, 0.01, { face }); void name; return m; };
const kneesHook = (xm: number) => (t: number, p: Pose, heading: number): Pose => { const x = px(xm), sk = solve(D.props("sir"), p, heading), s = scaleOf("sir"), K = (j: "knL" | "knR"): P2 => { const q = sk.j[j] as unknown as number[], h = sk.j[j === "knL" ? "hipL" : "hipR"] as unknown as number[], u = 0.4;
    return [x + (h[0] + (q[0] - h[0]) * u) * s, footY("sir") + (h[1] + (q[1] - h[1]) * u) * s - 22]; };
  const q = reach("sir", x, reach("sir", x, p, heading, "L", K("knL"), false, { abdFix: 8 }), heading, "R", K("knR"), false, { abdFix: 8 }); return { ...p, armL: q.armL, armR: q.armR }; };
/** a seated figure's seat as 07 finds it: from a third of the thigh behind the hip to 0.95 of it in front, its top at the lowest point of the
 *  thighs' drawn undersides over it (clipKit thighUnder) */
const seatOf = (c: Cast) => { const g0 = castAt([c], 0.5)[0], s = scaleOf("sir"), pel = jointPx(g0, "pelvis"), TH = D.props("sir").thigh * s, x0 = pel[0] - 0.33 * TH, x1 = pel[0] + 0.95 * TH;
  const under = thighUnder(g0).filter(([xx]) => xx >= x0 && xx <= x1); return { x0, x1, top: Math.max(...under.map((q) => q[1])) + 4 }; };
const benchTop = (cast: Cast[]) => Math.max(...cast.map((c) => seatOf(c).top));
const bench = (g: G, x0: number, x1: number, top: number) => { rect(g, x0, top, x1 - x0, 30, "#6e4630"); for (const lx of [x0 + 20, (x0 + x1) / 2 - 11, x1 - 42]) { DRAWN.uprights.push({ what: "bench leg", foot: LINE_TOP, floor: LINE_TOP, x: lx }); rect(g, lx, top + 30, 22, LINE_TOP - top - 30, "#5a3826"); } };
const BENCH_X = [-0.72, 0, 0.72];      // (0.53 m apart: at least 40 px between the figures' boxes, and the three large enough for a wide shot)
const s07 = (): Shot => { const seconds = 1.5;
  // (the review of v10: the con man in the picture with the dealers: he holds up the sealed letter to them (04's lift, 0.1-0.5 s) and the two
  //  seated dealers react, each jerking back a little (06's jerk, 0.65 and 0.8 s); seated in profile they face him. Three figures need the
  //  dealers 40 px apart (eiffel_check), so the figures are about 28 % of the height: at 45 % only two fit, a deviation in STOPP v11)
  const DX = [0.05, 0.82], looks = [BENCH2, YOUNG];
  const ms = DX.map((xm, i) => { const fc = i === 1 ? { ...FACES.delighted, gaze: [-0.5, 0] as [number, number] } : { ...FACES.calm, gaze: [-0.5, 0] as [number, number] }, mm = seated(`d${i}`, xm, [6, 0, 0], fc);
    ease(mm, 0.65 + i * 0.15, { ...SIT, lean: 7, head: [4, -5, 0] } as Partial<Pose>, 0.22, { face: { ...fc, brow: 0.6, gaze: [-0.7, -0.1] } }); return mm; });
  const c = figure("sir", -0.46, 30); c.stand(seconds + 1);
  ease(c, -1, { head: [8, 2, 0] }, 0.01, { face: { ...FACES.smug, gaze: [0.6, 0.1] } }); ease(c, 0.9, { head: [8, 4, -3] }, 0.35, { face: { ...FACES.delighted, gaze: [0.6, 0.1] } });
  const h = holdSheet("con", c, -0.46, "letter", false, false, (t: number) => 22 * env(t, 0.1, 0.4, 99, 0.3));
  const dealers: Cast[] = ms.map((mm, i) => ({ name: `d${i}`, m: mm, who: "sir", look: looks[i], seed: 30 + i, armWipe: false, pose: kneesHook(DX[i]), hands: { L: [[0, "fist"]], R: [[0, "fist"]] } } as Cast));
  const cast: Cast[] = [{ name: "con", m: c, who: "sir", look: CON, seed: 9, armWipe: false, pose: h.pose, hands: { L: [[0, "grip"]], R: [[0, "grip"]] } }, ...dealers];
  const seats = dealers.map(seatOf), top = Math.max(...seats.map((q) => q.top)); for (const q of seats) q.top = top;
  const x0 = Math.min(...seats.map((q) => q.x0)) - 10, x1 = Math.max(...seats.map((q) => q.x1)) + 10;
  const c1 = fitCam(cast, seconds, ZH(0.5), [], () => false, 0.04), c0 = camFeet(c1.cx, c1.z, 0.8), cam = (t: number) => ({ ...c0, cx: c0.cx + lerp(-4, 4, smooth(t / seconds)) });
  return { id: "e07", title: "7 Han visar brevet för handlarna", seconds, cast, events: {}, shot: "wide", camera: cam, seats, contacts: h.contacts, over: h.over,
    ownBg: (g, t) => suite(g, cam(t), SUITE), back: (g) => bench(g, x0, x1, top) } as Shot; };

// 8  he points out of the suite's window at the real tower, small and far off in it at his chest's height (05, the approved point: the eyes
//    first, the arm up, the finger out under a second, down; a full shot, about 52 % of the height). Camera: still, a slow push-in.
const s08 = (): Shot => { const seconds = 1.7, sx = px(0) - 90, m = figure("sir", (sx - FM.W / 2) / FM.PPM, 25); m.stand(seconds + 1);
  ease(m, -1, { head: [6, 0, 0] }, 0.01, { face: { ...FACES.smug, gaze: [0.4, 0.05] } });
  ease(m, 0.15, { head: [16, 4, 0] }, 0.3, { face: { ...FACES.smug, gaze: [1, 0.3] } });
  const sh0 = (() => { const { pose: p, heading } = poseAt({ name: "con", m, who: "sir", seed: 7 }, 0.6), sk = solve(D.props("sir"), p, heading), q = sk.j.shL as unknown as number[], s = scaleOf("sir"); return [sx + q[0] * s, footY("sir") + q[1] * s] as P2; })();
  const TW: P2 = [sx + 355, 1237]; void sh0;      // (the tower's middle at his chest's height in the window: 05's ship's place, 355 px out at y 1237)
  const UP = 0.2, HOLD0 = 0.72, HOLD1 = 0.98, DOWN = 1.48, P_ON = 0.62, P_OFF = 1.1;      // (the arm down over 0.5 s: over 0.36 s it failed the flicker measure on the film)      // (the finger out 0.56 s; the arm up over 0.52 s: over 0.3 s it failed the flicker measure)
  let held: Pose["armL"] | null = null;
  const heldArm = () => { if (held) return held; const { pose: p, heading } = poseAt({ name: "con", m, who: "sir", seed: 7 }, HOLD0), P = D.props("sir"), s = scaleOf("sir"), armLen = (P.upper + P.fore + P.hand) * s;
    const sk = solve(P, p, heading), q = sk.j.shL as unknown as number[], sh: P2 = [sx + q[0] * s, footY("sir") + q[1] * s], dx = TW[0] - sh[0], dy = TW[1] - sh[1], l = Math.hypot(dx, dy);
    held = reach("sir", sx, p, heading, "L", [sh[0] + (dx / l) * 0.93 * armLen, sh[1] + (dy / l) * 0.93 * armLen], true, { bend: 22, elbowOut: sh[0] + 20 }).armL; return held; };
  const aim = (t: number, p: Pose): Pose => { const w = env(t, UP, HOLD0 - UP, HOLD1, DOWN - HOLD1); return w <= 0 ? p : { ...p, armL: lerpArm(p.armL, heldArm(), w) }; };
  const cast: Cast[] = [{ name: "con", m, who: "sir", look: CON, seed: 7, armWipe: false, pose: aim, hands: { R: [[0, "relaxed"]], L: [[0, "relaxed"], [P_ON, "point"], [P_OFF, "fist"]] } }];
  const win = { x: TW[0] - 95, w: 190, top: TW[1] - 200, bottom: TW[1] + 95, towerX: TW[0], towerY: TW[1] + 70, towerH: 170 };
  const c0 = fitCam(cast, seconds, ZH(0.62), [[TW[0] + 60, TW[1] - 100], [TW[0] - 60, TW[1] + 60]], () => false, 0.04), cam = (_t?: number) => c0;      // (62 % of the height, the review of v10)      // (still, framed as 05: a push-in took the margin)
  return { id: "e08", title: "8 Han pekar på tornet", seconds, cast, events: { UP, HOLD0, HOLD1, DOWN }, shot: "full", camera: cam,
    points: [{ who: "con", t0: HOLD0, t1: HOLD1, side: "L", target: TW, horizon: TW[1], arm: [UP, DOWN], box: [TW[0] - 40, TW[1] - 100, TW[0] + 40, TW[1] + 70] }],
    ownBg: (g, t) => suite(g, cam(t), SUITE, win) } as Shot; };

// 9  the young dealer, still seated as in shot 7 (the bench in view): "Do you deliver?" (Daniel, the only lip sync). Camera: a slow push-in.
const s09 = (): Shot => { const seconds = 1.5, m = seated("young", 0, [14, 2, 0], { ...FACES.delighted, mouth: 0, gaze: [-0.6, 0] });
  // (he holds his bid already, as in shot 10 (the review of v10: his hands were empty here and the paper was in them a moment later), and lifts
  //  it as he asks (0.1-0.5 s, 04's lift seated))
  const M = MOUTH_D01 as { t0: number; len: number; mouth: number[] };
  const h = holdSheet("young", m, 0, "bid", true, false, (t: number) => 18 * env(t, 0.1, 0.4, 99, 0.3));
  const cast: Cast[] = [{ name: "young", m, who: "sir", look: YOUNG, seed: 31, armWipe: false, pose: h.pose, mouth: M, hands: { L: [[0, "grip"]], R: [[0, "grip"]] } }];
  const seat = seatOf({ ...cast[0], pose: kneesHook(0) }), c0 = fitCam(cast, seconds, 2.6, [[seat.x1 + 60, FM.GY + 40], [seat.x0 - 60, seat.top]], () => false, 0.05), cam = (t: number) => ({ ...c0, z: c0.z * lerp(0.97, 1, smooth(t / seconds)) });
  return { id: "e09", title: "9 Do you deliver?", seconds, cast, events: { LINE: M.t0 }, shot: "full", camera: cam, seats: [seat], contacts: h.contacts, over: h.over,
    ownBg: (g, t) => suite(g, cam(t), SUITE), back: (g) => bench(g, seat.x0 - 300, seat.x1 + 300, seat.top) } as Shot; };

// 10 "One dealer won.": the young dealer, still seated, holds his bid up at his chest with both hands (04 seated), delighted. Camera: a push-in.
const s10 = (): Shot => { const seconds = 1.6;
  // (the review of v10: the winner and the man on his right, who faces him (seated in profile, all facing left): the winner lifts his bid (0.15 s),
  //  the loser jerks back and grimaces (06's jerk, 0.6 s), then leans in to look (1.05 s); two figures, large)
  const DX = [0, 0.69], looks = [YOUNG, BENCH3];
  const ms = DX.map((xm, i) => seated(`d${i}`, xm, [6, 0, 0], i === 0 ? { ...FACES.delighted, gaze: [-0.3, 0.2] } : { ...FACES.calm, gaze: [-0.8, 0.1] }));
  ease(ms[1], 0.6, { ...SIT, lean: 6, head: [12, -4, 0] } as Partial<Pose>, 0.22, { face: { ...FACES.grimace, gaze: [-0.9, 0] } });
  ease(ms[1], 1.05, { ...SIT, lean: 14, head: [12, 8, 0] } as Partial<Pose>, 0.35, { face: { ...FACES.grimace, gaze: [-0.9, 0.2] } });
  const h = holdSheet("d0", ms[0], DX[0], "bid", true, false, (t: number) => 18 * env(t, 0.15, 0.4, 99, 0.3));
  const cast: Cast[] = ms.map((m, i) => ({ name: `d${i}`, m, who: "sir", look: looks[i], seed: 30 + i, armWipe: false, pose: i === 0 ? h.pose : kneesHook(DX[i]), hands: i === 0 ? { L: [[0, "grip"]], R: [[0, "grip"]] } : { L: [[0, "fist"]], R: [[0, "fist"]] } } as Cast));
  const seats = cast.map((c, i) => seatOf({ ...c, pose: kneesHook(DX[i]) })), top = Math.max(...seats.map((q) => q.top)); for (const q of seats) q.top = top;
  const x0 = Math.min(...seats.map((q) => q.x0)) - 10, x1 = Math.max(...seats.map((q) => q.x1)) + 10;
  const c1 = fitCam(cast, seconds, ZH(0.62), [], () => false, 0.035), c0 = camFeet(c1.cx, c1.z, 0.8), cam = (t: number) => ({ ...c0, z: c0.z * lerp(0.99, 1, smooth(t / seconds)) });
  return { id: "e10", title: "10 Budet vinner", seconds, cast, events: {}, shot: "wide", camera: cam, contacts: h.contacts, over: h.over, seats,
    ownBg: (g, t) => suite(g, cam(t), SUITE), back: (g) => bench(g, x0, x1, top) } as Shot; };

// 11 "The dealer paid for the tower.": a hand-only close-up: the dealer's hand pushes the cheque over the table (EB: a certified check), about
//    4 px a frame, his forearm out through the right edge. No tower model on this table. Camera: following the cheque slowly.
const s11 = (): Shot => { const seconds = 1.6, d = figure("sir", -0.34, 28); d.stand(seconds + 1);
  // (the review of v10: the dealer leans in and holds the cheque out to the con man (0.15-0.5 s, 04's lift with a lean); the con man reacts,
  //  jerking back with a grin (06's jerk, 0.7 s), then leans in to it (1.15 s)
  ease(d, -1, { head: [6, 2, 0] }, 0.01, { face: { ...FACES.delighted, gaze: [0.7, 0] } }); ease(d, 0.15, { head: [6, -2, 0], lean: 10 }, 0.35, { face: { ...FACES.delighted, gaze: [0.8, 0] } });
  const c = figure("sir", 0.35, -28); c.stand(seconds + 1); ease(c, -1, { head: [-4, 2, 0] }, 0.01, { face: { ...FACES.smug, gaze: [-0.7, 0.2] } });
  ease(c, 0.7, { head: [-6, -6, 0], lean: -9 }, 0.22, { face: { ...FACES.delighted, brow: 0.8, gaze: [-0.8, 0.2] } }); ease(c, 1.15, { head: [-4, 6, -3], lean: 7 }, 0.35, { face: { ...FACES.smug, gaze: [-0.8, 0.4] } });
  const h = holdSheet("young", d, -0.34, "cheque", false, false, (t: number) => 26 * env(t, 0.15, 0.35, 99, 0.3));
  const cast: Cast[] = [{ name: "young", m: d, who: "sir", look: YOUNG, seed: 31, armWipe: false, pose: h.pose, hands: { L: [[0, "grip"]], R: [[0, "grip"]] } },
    { name: "con", m: c, who: "sir", look: CON, seed: 9, armWipe: false, hands: { L: [[0, "relaxed"]], R: [[0, "relaxed"]] } }];
  const c1 = fitCam(cast, seconds, ZH(0.5), [], () => false, 0.04), c0 = camFeet(c1.cx, c1.z, 0.8), cam = (t: number) => ({ ...c0, z: c0.z * lerp(0.985, 0.995, smooth(t / seconds)) });
  return { id: "e11", title: "11 Checken", seconds, cast, events: {}, shot: "wide", camera: cam, contacts: h.contacts, over: h.over, ownBg: (g, t) => suite(g, cam(t), SUITE), sounds: [{ t: 0.15, k: "paper", g: 0.8 }] } as Shot; };

// 12 "The con man got a bribe too.": the con man holds the envelope with both hands at his chest (04, smug), the dealer beside him (01,
//    delighted, a small head move). Camera: a slow push-in.
const s12 = (): Shot => { const seconds = 1.9, c = figure("sir", 0, -15); c.stand(seconds + 1);
  // (the body actions, the review of v10: he lifts the bribe's envelope (0.2-0.6 s), then leans back, pleased with himself (1.1-1.45 s))
  ease(c, -1, { head: [0, 6, 0] }, 0.01, { face: { ...FACES.smug, gaze: [0, 0.6] } }); ease(c, 0.6, { head: [0, 2, 0] }, 0.4, { face: { ...FACES.smug, gaze: [-0.6, 0.1] } });
  ease(c, 1.1, { head: [0, 3, -3], lean: -7 }, 0.35, { face: { ...FACES.delighted, gaze: [0, 0] } });
  const h = holdSheet("con", c, 0, "envelope", false, false, (t: number) => 24 * env(t, 0.2, 0.4, 99, 0.3));
  const cast: Cast[] = [{ name: "con", m: c, who: "sir", look: CON, seed: 9, armWipe: false, pose: h.pose, hands: { L: [[0, "grip"]], R: [[0, "grip"]] } }];
  const c0 = fitCam(cast, seconds, 2.7, [], () => false, 0.06), cam = (t: number) => ({ ...c0, z: c0.z * lerp(0.97, 1, smooth(t / seconds)) });
  return { id: "e12", title: "12 Mutan", seconds, cast, events: {}, shot: "medium", camera: cam, contacts: h.contacts, over: h.over, ownBg: (g, t) => suite(g, cam(t), SUITE), sounds: [{ t: 0.25, k: "paper", g: 0.6 }] } as Shot; };

// 13 "Then he vanished with the money.": the con man walks off to the right (02, walk, in profile, loose fists), the envelope sticking up from
//    his breast pocket, out of the picture past the open door; smug. Camera: still. (No footsteps: no sound.)
const s13 = (): Shot => { const seconds = 1.8, m = figure("sir", 0, 90, 0.45);
  // (the review of v10: the figure 60 % of the height, and the money as a thing he really carries: the bribe's envelope in a breast pocket low
  //  on the chest, seen from the side as he walks (it stood at his chin facing us and read as floating))
  // (31 % of the height, not 60: a walking figure at 60 % moved 23 px a frame, over the 12 px limit (flicker on v11); v10's walk, which passed)
  m.walk(mt(m, 3.0), { step: 0.8, tau: 0.6, keep: true }); m.stand(4);
  ease(m, -1, { head: [0, 0, 0] }, 0.01, { face: { ...FACES.smug, gaze: [0.6, 0] } });
  const cast: Cast[] = [{ name: "con", m, who: "sir", look: CON, seed: 9, armWipe: false, hands: { L: [[0, "fist"]], R: [[0, "fist"]] } }];
  const z = ZH(0.31), x0 = castAt(cast, 0)[0].x, cam = camFeet(x0 - 0.2 * FM.W / z, z, 0.82);
  const v = viewOf(cam), door = { x: v.x1 - 250, top: LINE_TOP - 760, w: 300 };
  return { id: "e13", title: "13 Han försvinner", seconds, cast, events: {}, shot: "wide", camera: () => cam, offFrameOK: (n, t) => t > 0.5,
    ownBg: (g) => { suite(g, cam, SUITE); rect(g, door.x, door.top, door.w, LINE_TOP - door.top, "#8a7258");      // (a lit corridor beyond: his black suit vanished against a black opening, the fifth review)
      g.lineWidth = 16; g.strokeStyle = "#e9dcc4"; g.strokeRect(door.x - 8, door.top - 8, door.w + 16, LINE_TOP - door.top + 8); },
    over: (g, t, f) => { const nk = jointPx(f, "neck"), pel = jointPx(f, "pelvis"), x = nk[0] + (pel[0] - nk[0]) * 0.45 + 34, y = nk[1] + (pel[1] - nk[1]) * 0.42;
      g.save(); g.translate(x, y); g.rotate(0.12); rect(g, -9, -58, 18, 64, "#efe4c6", OL * 0.6); rect(g, -6, -50, 12, 10, "#bcd6b8", 2.5); g.restore();
      line(g, [[x - 26, y + 4], [x + 22, y + 6]], OL * 0.7); } } as Shot; };

// 14 "The dealer was too embarrassed to tell the police.": the young dealer holds the letter at his chest (04), its blank back to us, his
//    eyes squeezed hard shut (the approved hard squeeze). Camera: a slow push-in.
const s14 = (): Shot => { const seconds = 2.6, m = figure("sir", 0, 0); m.stand(0.95);
  // (the body actions, the review of v10: he lowers the letter (0.25-0.65 s), turns his body away (1.0-1.5 s, 03's turn), then slumps forward
  //  (1.9-2.3 s)); the face: hard squeeze, then the grimace
  m.turn(-18, 0.5, 0.015); m.stand(seconds + 1);
  ease(m, -1, { head: [0, 4, 0] }, 0.01, { face: FACES.squeeze }); ease(m, 1.0, { head: [-4, 8, 3] }, 0.5, { face: FACES.squeeze });
  ease(m, 1.9, { head: [-2, 14, 0], lean: 9 }, 0.4, { face: { ...FACES.grimace, gaze: [0, 0.6] } });
  const h = holdSheet("young", m, 0, "back", false, false, (t: number) => -22 * env(t, 0.25, 0.4, 99, 0.3), 236);
  const cast: Cast[] = [{ name: "young", m, who: "sir", look: YOUNG, seed: 31, armWipe: false, pose: h.pose, hands: { L: [[0, "grip"]], R: [[0, "grip"]] } }];
  const c0 = fitCam(cast, seconds, 2.7, [], () => false, 0.06), cam = (t: number) => ({ ...c0, z: c0.z * lerp(0.97, 1, smooth(t / seconds)) });
  return { id: "e14", title: "14 Han skäms", seconds, cast, events: {}, shot: "medium", camera: cam, contacts: h.contacts, over: h.over, ownBg: (g, t) => suite(g, cam(t), SUITE) } as Shot; };

// 15 "Later, the con man tried again.": the second hotel (the suite recoloured: other wallpaper and table), the con man already standing with the
//    letter (04), the grey dealer (his first shot) standing and looking at it (01, mouth shut). Camera: a slow slide sideways.
const s15 = (): Shot => { const seconds = 2.2, m = figure("sir", -0.34, 30); m.stand(seconds + 1);
  // (the review of v10, the body actions: the con man leans in to the grey dealer, smug (0.15-0.5 s); the grey dealer lifts the letter to read it
  //  (0.7-1.1 s) and then jerks back, doubting it (06's jerk, 1.45 s); the con man straightens and grins (1.75 s). The letter is the grey dealer's
  //  from the start, as at the police desk in shot 16)
  ease(m, -1, { head: [8, 2, 0] }, 0.01, { face: { ...FACES.smug, gaze: [0.6, 0.1] } }); ease(m, 0.15, { head: [8, 6, 0], lean: 9 }, 0.35, { face: { ...FACES.smug, gaze: [0.7, 0.3] } });
  ease(m, 1.75, { head: [8, 2, -3], lean: 0 }, 0.35, { face: { ...FACES.delighted, gaze: [0.6, 0.1] } });
  const n = figure("sir", 0.34, -30); n.stand(seconds + 1); ease(n, -1, { head: [-8, 4, 0] }, 0.01, { face: { ...FACES.calm, gaze: [-0.6, 0.3] } });
  ease(n, 1.45, { head: [-8, -4, 0], lean: -8 }, 0.22, { face: { ...FACES.grimace, gaze: [-0.7, 0.1] } });
  const h = holdSheet("grey", n, 0.34, "letter", false, false, (t: number) => 20 * env(t, 0.7, 0.4, 99, 0.3));
  const cast: Cast[] = [{ name: "con", m, who: "sir", look: CON, seed: 9, armWipe: false, hands: { L: [[0, "relaxed"]], R: [[0, "relaxed"]] } },
    { name: "grey", m: n, who: "sir", look: GREY, seed: 41, armWipe: false, pose: h.pose, hands: { L: [[0, "grip"]], R: [[0, "grip"]] } }];
  const c1 = fitCam(cast, seconds, ZH(0.5), [], () => false, 0.04), c0 = camFeet(c1.cx, c1.z, 0.8), cam = (t: number) => ({ ...c0, cx: c0.cx + lerp(-4, 4, smooth(t / seconds)) });
  return { id: "e15", title: "15 Det andra hotellet", seconds, cast, events: {}, shot: "wide", camera: cam, contacts: h.contacts, over: h.over, ownBg: (g, t) => suite(g, cam(t), SUITE2) } as Shot; };

// 16 "This time, another dealer told the police.": the police desk beside them; the grey dealer holds the letter up (04); the policeman
//    stands (01, mouth shut) with the shock face and a small head move. Both whole on the floor, the feet in view. Camera: a slow push-in.
const DESK = { x0: px(-0.95), x1: px(-0.52) };      // (the desk at the policeman's side, so the two can stand closer and larger, the review of v10)
const s16 = (): Shot => { const seconds = 2.4, a = figure("sir", 0.34, -25); a.stand(seconds + 1);      // (the grey dealer at the right with the letter, as in shot 15)
  ease(a, -1, { head: [-6, 2, 0] }, 0.01, { face: { ...FACES.calm, smile: -0.2, gaze: [-0.6, 0] } }); ease(a, 0.5, { head: [-6, -3, 0] }, 0.6, { face: { ...FACES.calm, smile: -0.2, gaze: [-0.7, 0] } });
  const p = figure("sir", -0.33, 12); p.stand(seconds + 1); const SHOCK_P: Face = { ...FACES.shock, sad: 1, smile: -1, mouth: 0.8 };      // (turned 12 and the head 8: the face stays in the front drawing, so the open mouth shows whole; in three-quarter it read as a small smile, the fourth review)      // (the shock's open mouth and the corners right down: with the moustache a small mouth read as a smile, the independent reviews)
  ease(p, -1, { head: [6, 0, 0] }, 0.01, { face: { ...FACES.calm, gaze: [0.6, 0] } }); ease(p, 1.1, { head: [8, -8, 0], lean: -9 }, 0.35, { face: SHOCK_P });      // (the beat: he reads it and jerks back in shock, 06's jerk)
  ease(a, 1.6, { head: [-6, 4, 0], lean: 9 }, 0.35, { face: { ...FACES.calm, smile: -0.3, brow: -0.3, gaze: [-0.8, 0.1] } });      // (the body actions, the review of v10: he lifts the letter (0.2 s), the policeman jerks back (1.1 s), he leans in to the policeman, serious (1.6 s))
  const h = holdSheet("grey", a, 0.34, "letter", false, false, (t: number) => 20 * env(t, 0.2, 0.4, 99, 0.3));      // (the second beat: he holds the letter up to the policeman)
  const cast: Cast[] = [{ name: "grey", m: a, who: "sir", look: GREY, seed: 41, armWipe: false, pose: h.pose, hands: { L: [[0, "grip"]], R: [[0, "grip"]] } },
    { name: "police", m: p, who: "sir", look: POLICE, seed: 51, armWipe: false, hands: { L: [[0, "relaxed"]], R: [[0, "relaxed"]] } }];
  const c1 = fitCam(cast, seconds, ZH(0.5), [], () => false, 0.04), c0 = camFeet(c1.cx, c1.z, 0.8), cam = (t: number) => ({ ...c0, z: c0.z * lerp(0.99, 1, smooth(t / seconds)) });
  return { id: "e16", title: "16 Polisdisken", seconds, cast, events: {}, shot: "wide", camera: cam, contacts: h.contacts, over: h.over, groundProps: [{ name: "desk", x0: DESK.x0, x1: DESK.x1 }],
    ownBg: (g, t) => { const c = cam(t), v = viewOf(c); g.fillStyle = "#6a7080"; g.fillRect(v.x0 - 200, v.y0 - 200, v.x1 - v.x0 + 400, LINE_TOP - v.y0 + 200);
      for (let y = LINE_TOP - 1400; y < LINE_TOP; y += 120) line(g, [[v.x0 - 200, y], [v.x1 + 200, y]], 3, "rgba(30,30,50,0.25)");
      g.fillStyle = "#4a4a56"; g.fillRect(v.x0 - 200, LINE_TOP, v.x1 - v.x0 + 400, v.y1 - LINE_TOP + 200); line(g, [[v.x0 - 200, FM.GY], [v.x1 + 200, FM.GY]], FM.LINE);
      rect(g, DESK.x0, LINE_TOP - 380, DESK.x1 - DESK.x0, 380, "#5a3a28"); rect(g, DESK.x0 - 16, LINE_TOP - 400, DESK.x1 - DESK.x0 + 32, 30, "#6e4630"); rect(g, DESK.x0 + 40, LINE_TOP - 300, DESK.x1 - DESK.x0 - 80, 60, "#4a3020", OL * 0.6);
    } } as Shot; };

// 17 "The con man fled to America.": the con man large on the liner's deck (01, about 45 % of the height), smug, a small head move; behind him
//    the rail, the evening sea and the ship's red funnel; the wind. Camera: a slow pan.
const s17 = (): Shot => { const seconds = 2.0;
  // (the review of v10: he walks along the rail (02, 0-1.2 s), stops and turns to look back the way he came (03's turn, 1.25-1.85 s); 60 % of
  //  the height, the camera following him. The red funnel stands on the ship: on a white deckhouse on the deck, in front of the rail (behind the
  //  rail it stood in the sea))
  // (walking from the first frame to the last, staggered into a stride; at 0.9 s he looks back over his shoulder, the way he came, and grins)
  // (31 % of the height and a still camera: at 60 % with the camera following, the deck and the rail moved 23 px a frame, over the 12 px
  //  limit (flicker on v11); v10's walk, across the picture)
  const m = figure("sir", 0, 90, 0.45); m.walk(mt(m, 3.0), { step: 0.8, tau: 0.6, keep: true }); m.stand(4); const T_STOP = 99;
  ease(m, -1, { head: [0, 0, 0] }, 0.01, { face: { ...FACES.smug, gaze: [0.6, 0] } }); ease(m, 0.9, { head: [0, -2, 0] }, 0.5, { face: { ...FACES.delighted, gaze: [-0.9, -0.1] } });      // (he looks back with his eyes, the head in profile: turned, the head changed drawings and flickered, v11)
  const cast: Cast[] = [{ name: "con", m, who: "sir", look: CON, seed: 9, armWipe: false, hands: { L: [[0, "fist"]], R: [[0, "fist"]] } }];
  const z = ZH(0.31), xs: number[] = []; for (let k = 0; k <= Math.ceil(seconds * 30) + 2; k++) xs.push(castAt(cast, k / 30)[0].x);
  const xAt = (t: number) => { const k = Math.max(0, Math.min(xs.length - 1, t * 30)), i = Math.floor(k), f = k - i; return xs[i] + ((xs[Math.min(xs.length - 1, i + 1)] ?? xs[i]) - xs[i]) * f; };
  void xAt; const CAM = camFeet((xs[0] + xs[xs.length - 1]) / 2, z, 0.82), cam = (_t: number) => CAM;
  const FX = CAM.cx - 0.5 * FM.W / z + 120;      // (the deckhouse and its funnel at the left, behind where he starts)
  return { id: "e17", title: "17 Ångaren", seconds, cast, events: { T_STOP }, shot: "wide", camera: cam,
    ownBg: (g, t) => { const c = cam(t), v = viewOf(c); const gr = g.createLinearGradient(0, v.y0, 0, LINE_TOP - 380); gr.addColorStop(0, "#5a6ea0"); gr.addColorStop(0.6, "#e9a07a"); gr.addColorStop(1, "#f7d2a0"); g.fillStyle = gr; g.fillRect(v.x0 - 400, v.y0 - 400, v.x1 - v.x0 + 800, LINE_TOP - 380 - v.y0 + 400);
      const sea = LINE_TOP - 380; g.fillStyle = "#2e4a6a"; g.fillRect(v.x0 - 400, sea, v.x1 - v.x0 + 800, 400);
      for (let r = 0; r < 4; r++) { const y = sea + 30 + r * 70; g.beginPath(); for (let x = v.x0 - 400; x <= v.x1 + 400; x += 30) { const yy = y + Math.sin(x / 70 + t * 1.6 + r) * 6; x === v.x0 - 400 ? g.moveTo(x, yy) : g.lineTo(x, yy); } g.lineWidth = 5; g.strokeStyle = "rgba(220,230,255,0.35)"; g.stroke(); }
      line(g, [[v.x0 - 400, LINE_TOP - 300], [v.x1 + 400, LINE_TOP - 300]], OL * 1.4); for (let x = Math.floor((v.x0 - 400) / 160) * 160; x < v.x1 + 400; x += 160) { line(g, [[x, LINE_TOP - 300], [x, LINE_TOP - 6]], OL); DRAWN.scenery.push({ what: "rail post", at: [x, LINE_TOP - 150] }); }      // (the rail's posts stand still as he passes them, registered for the walk check)
      line(g, [[v.x0 - 400, LINE_TOP - 150], [v.x1 + 400, LINE_TOP - 150]], OL * 0.8);
      g.fillStyle = "#b89a72"; g.fillRect(v.x0 - 400, LINE_TOP, v.x1 - v.x0 + 800, v.y1 - LINE_TOP + 400); for (let y = LINE_TOP + 60; y < v.y1; y += 60) line(g, [[v.x0 - 400, y], [v.x1 + 400, y]], 3, "rgba(60,40,20,0.3)");
      // (the deckhouse on the deck, in front of the rail, the funnel on its roof; smoke drifting off)
      rect(g, FX - 230, LINE_TOP - 520, 460, 520, "#efe9dc", OL); for (let k = 0; k < 3; k++) ell(g, FX - 140 + k * 140, LINE_TOP - 380, 34, 34, "#7a9ab8", OL * 0.7);
      rect(g, FX - 90, v.y0 - 200, 180, LINE_TOP - 520 - v.y0 + 200, "#b8432e", OL); rect(g, FX - 90, v.y0 - 200, 180, 220, "#262230", OL);
      for (let k = 0; k < 3; k++) ell(g, FX + 80 + k * 140 + t * 30, v.y0 + 60 - k * 30, 90 + k * 20, 50 + k * 10, "rgba(90,80,90,0.45)", 0);
      line(g, [[v.x0 - 400, FM.GY], [v.x1 + 400, FM.GY]], FM.LINE); } } as Shot; };

// 18 "Or so the story goes.": the con man in front of the tower in the evening (01, smug, a small head move; the automation session: him, not
//    Sir, who is not in the film). Camera: a slow pull-back.
const s18 = (): Shot => { const seconds = 1.7, m = figure("sir", -0.1, -38); m.stand(seconds + 1);      // (turned three-quarter left, a medium shot at night: shot 2's frontal evening set-up made the cut into the loop a jump cut)
  ease(m, -1, { head: [0, 0, 0] }, 0.01, { face: { ...FACES.smug, gaze: [0.3, 0] } }); ease(m, 0.3, { head: [0, -5, -4] }, 0.5, { face: { ...FACES.smug, gaze: [0.5, -0.2] } }); ease(m, 0.95, { head: [0, 2, 3], lean: -7 }, 0.4, { face: { ...FACES.delighted, gaze: [0, 0] } });      // (the body actions, the review of v10: he lifts the SOLD paper (0.15-0.55 s), then leans back, pleased (0.95 s))
  // (he holds the stamped SOLD paper, as in shot 2 that the loop cuts to: it popped into his hands at the cut, the fourth review; a small lift is a beat)
  const h = holdSheet("con", m, -0.1, "sold", false, false, (t: number) => 20 * env(t, 0.15, 0.4, 99, 0.3));
  const cast: Cast[] = [{ name: "con", m, who: "sir", look: CON, seed: 9, armWipe: false, pose: h.pose, hands: { L: [[0, "grip"]], R: [[0, "grip"]] } }];
  const c0 = fitCam(cast, seconds, 2.5, [], () => false, 0.06), cam = (t: number) => ({ ...c0, z: c0.z * lerp(1, 0.97, smooth(t / seconds)) });
  return { id: "e18", title: "18 Han framför tornet", seconds, cast, events: {}, shot: "medium", camera: cam, contacts: h.contacts, over: h.over,
    ownBg: (g, t) => { const c = cam(t), v = viewOf(c); eveningSky(g, v.y0 - 300, LINE_TOP - 200);      // (the evening, as shot 2, so time does not run backwards into the loop; three-quarter and closer, so the cut is not a jump cut)
      for (let i = 0; i < 12; i++) { const hx = v.x0 - 100 + i * 130, hh = 120 + ((i * 61) % 150); rect(g, hx, LINE_TOP - 200 - hh, 124, hh + 200, ["#5a4458", "#4e3c52", "#644a5c"][i % 3], OL * 0.5); }
      tower(g, c.cx - 230, LINE_TOP - 190, 900, "#4a3a50", OL * 0.8); g.fillStyle = "#3a3038"; g.fillRect(v.x0 - 300, LINE_TOP - 200, v.x1 - v.x0 + 600, 200); g.fillStyle = "#6a5a5e"; g.fillRect(v.x0 - 300, LINE_TOP, v.x1 - v.x0 + 600, v.y1 - LINE_TOP + 300); line(g, [[v.x0 - 300, FM.GY], [v.x1 + 300, FM.GY]], FM.LINE);
    } } as Shot; };

export const SHOTS: Record<string, () => Shot> = { e01: s01, e02: s02, e03: s03, e04: s04, e05: s05, e06: s06, e07: s07, e08: s08, e09: s09, e10: s10, e11: s11, e12: s12, e13: s13, e14: s14, e15: s15, e16: s16, e17: s17, e18: s18, e19: s19 };
export type { Shot };
void rrect; void castAt;
