// Drawings for shots 26-50 of "The Man Who Stole the Mona Lisa": the staff door in the wall of the Louvre, the door at
// the foot of the back stairs and its lock seen close, the back of the panel, and the pictures inside the bubbles.
import { Pen, INK, bodyFront } from "./toon";
import { fxMona, fxCamera, fxSmock, fxMark, fxCupboard } from "./monatoon";
import { PER } from "./monacast";

type P2 = [number, number];
const TWO = Math.PI * 2;
const B = (x0: number, y0: number, x1: number, y1: number): P2[] => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
const text = (p: Pen, s: string, x: number, y: number, px: number, fill: string, stroke = 0) => {
  const g = p.g;
  g.font = `900 ${px}px 'Arial Black', Impact, 'Segoe UI Black', sans-serif`; g.textAlign = "center"; g.textBaseline = "middle";
  if (stroke) { g.lineWidth = stroke; g.strokeStyle = INK; g.lineJoin = "round"; g.strokeText(s, x, y); }
  g.fillStyle = fill; g.fillText(s, x, y);
};
/** draw `fn` (made for a dw-wide design) at (x, y), scaled by k */
const at = (p: Pen, x: number, y: number, k: number, fn: (q: Pen) => void) => { const g = p.g; g.save(); g.translate(x, y); g.scale(k, k); fn(new Pen(g)); g.restore(); };

// ---------------- the Louvre, close: a stretch of the ground floor with the staff door ----------------
/** 16 m x 6 m of the wall at 200 px a metre, 3200 x 1200 canvas (the pavement is the bottom edge). The staff door is 1 m
 *  to the screen-right of the middle (x = 1800): an open doorway, dark inside, its leaf swung in, a plate above it. */
export const fxStaffWall = (p: Pen) => {
  const S = "#e4d8bc", SD = "#c9bb9a", J = "#d3c6a6", XD = 1800, g = p.g;
  g.fillStyle = S; g.fillRect(0, 0, 3200, 1200);
  // courses of stone
  for (let r = 0; r < 10; r++) {
    const y = 1100 - r * 112; if (y < 0) break;
    p.stroke([[0, y], [3200, y]], 4, J);
    for (let x = (r % 2) * 160 - 40; x < 3240; x += 320) p.stroke([[x, y], [x, y - 112]], 4, J);
  }
  // the plinth and the string course
  p.poly(B(-20, 1100, 3220, 1230), SD, 9);
  p.poly(B(-20, 478, 3220, 540), SD, 9); p.stroke([[0, 498], [3200, 498]], 4, "#b3a583");
  // tall windows above the string course
  for (let k = -4; k <= 3; k++) { const x = XD + 400 * k; p.poly(B(x - 96, -20, x + 96, 300), "#5d7f9a", 9); p.stroke([[x, 0], [x, 300]], 7); p.stroke([[x - 96, 150], [x + 96, 150]], 7); p.poly(B(x - 124, 300, x + 124, 330), SD, 8); }
  // the blind arches of the arcade
  for (let k = -4; k <= 3; k++) {
    if (k === 0) continue;
    const x = XD + 400 * k, a: P2[] = [[x - 112, 1100], [x - 112, 800]];
    for (let i = 0; i <= 14; i++) { const t = Math.PI * (1 + i / 14); a.push([x + 112 * Math.cos(t), 800 + 112 * Math.sin(t)]); }
    a.push([x + 112, 1100]);
    p.poly(a, "#d2c4a2", 9);
    p.clip(a, () => { g.fillStyle = "#bfb08c"; g.fillRect(x - 112, 680, 26, 430); });
    p.poly(a, null, 9);
  }
  // the staff door: stone surround, the opening, the leaf swung inwards, the step
  p.poly(B(XD - 196, 688, XD + 196, 1180), "#efe6cf", 11);
  p.poly(B(XD - 222, 660, XD + 222, 700), SD, 9);
  p.poly(B(XD - 132, 748, XD + 132, 1180), "#2b2430", 10);
  p.poly([[XD - 132, 748], [XD - 52, 792], [XD - 52, 1180], [XD - 132, 1180]], "#7a4a2c", 9);
  p.poly([[XD - 118, 800], [XD - 66, 826], [XD - 66, 960], [XD - 118, 950]], "#6a3f24", 5); p.poly([[XD - 118, 990], [XD - 66, 1000], [XD - 66, 1150], [XD - 118, 1156]], "#6a3f24", 5);
  p.dot(XD - 64, 978, 9, "#d9a93a");
  p.poly(B(XD - 228, 1176, XD + 228, 1206), SD, 9);
  // the notice over the door
  p.poly(B(XD - 172, 552, XD + 172, 652), "#8a2f33", 9); p.poly(B(XD - 160, 564, XD + 160, 640), null, 3);
  text(p, "CLOSED TODAY", XD, 583, 28, "#f1d98a"); text(p, "STAFF ONLY", XD, 620, 38, "#ffffff");
};
/** a white smock and a green tick beside it, 700 x 600 canvas: "he wears the smock, so he belongs here" */
export const fxSmockOk = (p: Pen) => { at(p, 20, 30, 0.9, fxSmock); at(p, 380, 150, 0.95, (q) => fxMark(q, true)); };
/** "the old story" told as a picture on a card, 700 x 760 canvas: a cupboard, its door ajar, two eyes in the dark */
export const fxOldStory = (p: Pen) => {
  p.poly(B(14, 14, 686, 746), "#f6efd8", 11); p.poly(B(40, 40, 660, 720), null, 4);
  text(p, "THE OLD STORY", 350, 100, 62, "#2b2430");
  at(p, 196, 156, 0.74, fxCupboard);
};

// ---------------- the door at the foot of the back stairs ----------------
/** the same door as monatoon's fxDoorS (520 x 900 canvas) with the lock where a hand reaches it: a brass plate, the knob
 *  at (404, 505), the keyhole under it. state 0 = shut · 1 = shut, the knob gone (a square hole) · 2 = open on daylight */
export const fxDoorB = (p: Pen, state = 0) => {
  p.poly(B(20, 20, 500, 890), "#5a4a3a", 12);
  if (state === 2) {
    const g = p.g, gr = g.createLinearGradient(0, 50, 0, 880); gr.addColorStop(0, "#9cc8f0"); gr.addColorStop(0.62, "#e6f1fa"); gr.addColorStop(0.63, "#d9cfb6"); gr.addColorStop(1, "#c9bea0");
    g.fillStyle = gr; g.fillRect(50, 50, 420, 834); p.poly(B(50, 50, 470, 884), null, 9);
    p.poly([[50, 50], [136, 100], [136, 884], [50, 884]], "#6f8a5c", 9); p.poly([[70, 130], [116, 152], [116, 430], [70, 430]], "#5f7a50", 5); p.poly([[70, 500], [116, 500], [116, 820], [70, 836]], "#5f7a50", 5);
    return;
  }
  p.poly(B(50, 50, 470, 884), "#6f8a5c", 9);
  for (const [y0, y1] of [[110, 430], [500, 820]]) p.poly(B(96, y0, 340, y1), "#5f7a50", 6);
  p.poly(B(370, 432, 438, 596), "#b98f2c", 6);
  for (const [x, y] of [[382, 444], [426, 444], [382, 584], [426, 584]] as P2[]) p.dot(x, y, 4.5, state === 0 ? "#6a4f12" : "#22262c");
  if (state === 0) { p.ell(404, 505, 27, 27, "#e9b93a", 8); p.ell(396, 497, 9, 7, "#fbe59a", 0); }
  else p.poly(B(394, 495, 414, 515), "#22262c", 4);
  p.poly(B(397, 548, 411, 574), "#22262c", 0); p.dot(404, 548, 9, "#22262c");
};
/** the lock seen close, 1600 x 900 canvas, all of it door (the picture has no edge to show): a brass plate held by four
 *  screws, the knob, the keyhole; a hand with a screwdriver, its tip in the screw it is working on.
 *  n = screws still in (4..0, taken out in the order top right, bottom right, top left, bottom left) · tool = the hand
 *  is there · w = the turn of the wrist (-1, 0, 1) · off = the knob is off and lies in his other hand */
export const fxLockB = (p: Pen, n = 4, tool = false, w = 0, off = false) => {
  const g = p.g, SK = "#f0c39a", SL = "#6a5340";
  g.fillStyle = "#6f8a5c"; g.fillRect(0, 0, 1600, 900);
  p.poly(B(-30, -30, 420, 930), "#5f7a50", 9); p.stroke([[452, 0], [452, 900]], 5, "#62794f");
  for (const y of [150, 420, 700]) p.stroke([[500, y], [1600, y + 14]], 4, "#667f55");
  // the plate
  p.poly(B(660, 104, 920, 612), "#b98f2c", 12); p.poly(B(684, 128, 896, 588), null, 4);
  const SC: P2[] = [[872, 152], [872, 564], [708, 152], [708, 564]];
  SC.forEach(([x, y], i) => {
    if (i < 4 - n) { p.dot(x, y, 13, "#3a2f14"); return; }
    p.dot(x, y, 19, INK); p.dot(x, y, 13, "#e9c85a"); p.stroke([[x - 9, y - 7], [x + 9, y + 7]], 5, "#6a4f12");
  });
  p.poly(B(768, 448, 812, 536), "#22262c", 6); p.ell(790, 448, 24, 24, "#22262c", 0);
  if (!off) { p.ell(790, 300, 96, 96, "#e9b93a", 13); p.ell(790, 300, 60, 60, null, 5); p.ell(760, 268, 30, 22, "#fbe59a", 0); }
  else { p.ell(790, 300, 44, 44, "#8a6a1e", 6); p.poly(B(770, 280, 810, 320), "#22262c", 6); }
  // the hand with the screwdriver: the tip sits in the screw
  if (tool) {
    const i = Math.min(3, 4 - n), [tx, ty] = off ? ([1030, 400] as P2) : SC[i], a = (off ? -0.12 : i < 2 ? 0.34 : 0.2) + 0.07 * w;
    const c = Math.cos(a), s = Math.sin(a), q = (d: number, o = 0): P2 => [tx + d * c - o * s, ty + d * s + o * c];
    const len = i < 2 || off ? 190 : 330;
    p.stroke([q(0), q(len)], 26, INK); p.stroke([q(0), q(len)], 14, "#c9ccd2");
    p.stroke([q(len), q(len + 210)], 70, INK); p.stroke([q(len), q(len + 210)], 54, "#c8312b");
    for (const d of [40, 90, 140]) p.stroke([q(len + d, -22), q(len + d, 22)], 5, "#8a1f1b");
    // sleeve, then the fist round the handle
    p.stroke([q(len + 150, 30), [1700, ty + (off ? 330 : 300)]], 150, INK); p.stroke([q(len + 150, 30), [1700, ty + (off ? 330 : 300)]], 130, SL);
    p.ell(q(len + 110)[0], q(len + 110)[1], 78, 64, SK, 10, 0, 360, (a * 180) / Math.PI);
    for (const d of [70, 104, 138]) p.stroke([q(len + d, -52), q(len + d - 6, -6)], 6);
  }
  // the knob in his other hand
  if (off) {
    p.stroke([[-80, 760], [250, 540]], 170, INK); p.stroke([[-80, 760], [250, 540]], 150, SL);
    p.ell(300, 500, 92, 74, SK, 10, 0, 360, -30);
    p.poly(B(318, 392, 352, 440), "#8a6a1e", 6); p.ell(336, 352, 76, 76, "#e9b93a", 12); p.ell(312, 326, 24, 18, "#fbe59a", 0);
    for (const d of [0, 1, 2]) p.ell(286 + d * 42, 428 + d * 8, 22, 40, SK, 8, 0, 360, -14);
  }
};
/** a shut padlock, 300 x 360 canvas */
export const fxPadlock = (p: Pen) => {
  p.arc(150, 140, 74, 96, 180, 360, 44, INK); p.arc(150, 140, 74, 96, 180, 360, 24, "#c9ccd2");
  p.stroke([[76, 140], [76, 190]], 44, INK); p.stroke([[224, 140], [224, 190]], 44, INK); p.stroke([[76, 140], [76, 190]], 24, "#c9ccd2"); p.stroke([[224, 140], [224, 190]], 24, "#c9ccd2");
  p.poly(B(34, 170, 266, 340), "#d8382f", 12); p.ell(150, 236, 24, 24, "#2b2430", 0); p.poly([[138, 240], [162, 240], [170, 300], [130, 300]], "#2b2430", 0);
};
/** the painting out of its frame, seen from behind, 460 x 640 canvas: one bare board of poplar with its grain, a crack
 *  and the museum's paper label */
export const fxPanelBack = (p: Pen) => {
  const a = B(22, 22, 438, 618);
  p.poly(a, "#b9925c", 0);
  p.clip(a, () => {
    for (let i = 0; i < 9; i++) { const x = 46 + i * 46, pts: P2[] = []; for (let y = 22; y <= 618; y += 28) pts.push([x + 9 * Math.sin(y / 70 + i * 1.7), y]); p.stroke(pts, i % 3 ? 3 : 5, i % 2 ? "#a37d47" : "#c9a570"); }
    p.ell(300, 210, 26, 40, "#9a733d", 4); p.ell(300, 210, 10, 16, "#7a5a2c", 0); p.ell(120, 470, 18, 28, "#9a733d", 4);
    p.stroke([[226, 22], [220, 120], [230, 200], [222, 262]], 4, "#5a3f1c");
  });
  p.poly(a, null, 10);
  p.poly([[236, 392], [404, 384], [408, 492], [240, 500]], "#f1ecdc", 5); text(p, "LOUVRE", 322, 424, 30, "#2b2430"); p.stroke([[262, 458], [384, 452]], 6, "#8b8478"); p.stroke([[262, 478], [340, 474]], 6, "#8b8478");
  p.ell(92, 110, 30, 30, "#b0342c", 6); p.ell(92, 110, 14, 14, "#8a2620", 0);
};

// ---------------- pictures inside the bubbles ----------------
/** what the plumber sees, 600 x 500 canvas: a man in a cap at a door whose knob is missing */
export const fxAtDoor = (p: Pen) => {
  p.poly(B(150, 30, 390, 480), "#5a4a3a", 10); p.poly(B(170, 50, 370, 476), "#6f8a5c", 7);
  p.poly(B(192, 84, 310, 240), "#5f7a50", 5); p.poly(B(192, 284, 310, 446), "#5f7a50", 5);
  p.poly(B(322, 214, 360, 316), "#b98f2c", 5); p.poly(B(331, 250, 351, 270), "#22262c", 0);
  text(p, "?", 470, 250, 230, "#d8382f", 18);
};
/** the framed Mona Lisa and the camera on its tripod, 900 x 520 canvas: "she is having her picture taken" */
export const fxMonaPhoto = (p: Pen, flash = false) => { at(p, 60, 30, 0.5, (q) => fxMona(q)); at(p, 520, 30, 0.56, (q) => fxCamera(q, flash)); };
/** the framed Mona Lisa and a question mark, 700 x 520 canvas: "where is she?" */
export const fxMonaAsk = (p: Pen) => { at(p, 40, 30, 0.5, (q) => fxMona(q)); text(p, "?", 540, 270, 330, "#d8382f", 22); };
/** a yellow number disc, 100 x 100 canvas */
export const fxBadge = (p: Pen, n: number) => { p.ell(50, 50, 40, 40, "#ffe14d", 8); text(p, String(n), 50, 54, 54, "#2b2430"); };
/** an alarm bell ringing, 340 x 340 canvas; k = swing -1..1. The lines of sound have a pale core, so they read on a dark wall */
export const fxBellB = (p: Pen, k = 0) => {
  p.rot = [k * 0.35, 170, 60];
  p.poly([[80, 230], [96, 130], [130, 76], [210, 76], [244, 130], [260, 230]], "#e9b93a", 11); p.poly(B(60, 226, 280, 258), "#c9992c", 9); p.ell(170, 276, 22, 22, "#8a6412", 7); p.poly(B(150, 40, 190, 80), "#8a6412", 7);
  p.rot = null;
  for (const s of [-1, 1]) for (const d of [0, 1]) { const a0 = s > 0 ? -60 : 120, a1 = s > 0 ? 60 : 240; p.arc(170 + s * 124, 150, 20 + d * 20, 50 + d * 26, a0, a1, 19, INK); p.arc(170 + s * 124, 150, 20 + d * 20, 50 + d * 26, a0, a1, 9, "#fff3c4"); }
};
/** the sound of steps coming from the screen-left, 360 x 300 canvas: three arcs opening to the right and two small boot soles */
export const fxSteps = (p: Pen, k = 0) => {
  for (let i = 0; i < 3; i++) { p.arc(-20, 150, 60 + i * 44, 70 + i * 40, -40, 40, 19, INK); p.arc(-20, 150, 60 + i * 44, 70 + i * 40, -40, 40, 9, "#fff3c4"); }
  text(p, "TAP", 262, 104 + (k ? 6 : 0), 62, "#fff3c4", 16); text(p, "TAP", 282, 196 - (k ? 6 : 0), 62, "#fff3c4", 16);
};
/** a hand as the figures have it: an ink dot, 60 x 60 canvas */
export const fxHand = (p: Pen) => { p.dot(30, 30, 26); };
/** a forearm reaching to the screen-left, the hand at its end, 200 x 80 canvas */
export const fxArm = (p: Pen, col = "#8c868c") => { p.stroke([[186, 40], [40, 40]], 34, INK); p.stroke([[186, 40], [40, 40]], 20, col); p.dot(30, 40, 24); };
export { TWO };
