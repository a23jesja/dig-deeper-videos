// Drawings for "The Man Who Stole the Mona Lisa" (1911): the painting itself (our own cartoon of it), its frame, the
// four hooks, the staircase door, the trunk with the false bottom, far views of the Louvre and Florence, and the
// small things the story turns on (a doorknob, a thumbprint, a letter signed "Leonardo").
import { Pen, INK, curve } from "./toon";
import { monaHands } from "./monaPropsA";

type P2 = [number, number];
const TWO = Math.PI * 2;
const text = (p: Pen, s: string, x: number, y: number, px: number, fill: string, stroke = 0, font = "'Arial Black', Impact, 'Segoe UI Black', sans-serif", weight = 900) => {
  const g = p.g;
  g.font = `${weight} ${px}px ${font}`; g.textAlign = "center"; g.textBaseline = "middle";
  if (stroke) { g.lineWidth = stroke; g.strokeStyle = INK; g.lineJoin = "round"; g.strokeText(s, x, y); }
  g.fillStyle = fill; g.fillText(s, x, y);
};
const fit = (s: string, base: number, width: number) => Math.min(base, width / (0.82 * Math.max(1, s.length)));
const B = (x0: number, y0: number, x1: number, y1: number): P2[] => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
const RED = "#d8382f", GREEN = "#3faa55", PAPER = "#fbf6e6", GOLD = "#d9a93a", GOLD_D = "#a87c22", GOLD_L = "#f2d27a", SKIN = "#ecc9a0";
const circle = (cx: number, cy: number, r: number, n = 48): P2[] => { const o: P2[] = []; for (let i = 0; i < n; i++) o.push([cx + r * Math.cos((TWO * i) / n), cy + r * Math.sin((TWO * i) / n)]); return o; };
/** draw inside the box (x, y, w, h) using a design space dw x dh */
const within = (p: Pen, x: number, y: number, w: number, h: number, dw: number, dh: number, fn: () => void) => { const g = p.g; g.save(); g.translate(x, y); g.scale(w / dw, h / dh); fn(); g.restore(); };

// ---------------- the painting ----------------
/** the portrait, 400 x 560 design units, drawn into the box (x, y, w, h). A woman with a small smile, her hands folded, a hazy valley behind her. */
const drawMona0 = (p: Pen, x: number, y: number, w: number, h: number) => within(p, x, y, w, h, 400, 560, () => {
  const g = p.g, area = B(0, 0, 400, 560);
  p.clip(area, () => {
    const sky = g.createLinearGradient(0, 0, 0, 330); sky.addColorStop(0, "#8fa89a"); sky.addColorStop(0.6, "#c2c08e"); sky.addColorStop(1, "#b3a66e");
    g.fillStyle = sky; g.fillRect(0, 0, 400, 560);
    p.poly([[0, 150], [50, 96], [96, 140], [150, 110], [176, 160], [176, 330], [0, 330]], "#6f9488", 0);
    p.poly([[224, 150], [262, 104], [310, 150], [352, 92], [400, 140], [400, 330], [224, 330]], "#7a9a8a", 0);
    p.poly([[0, 230], [70, 200], [150, 232], [176, 250], [176, 330], [0, 330]], "#8a8f5e", 0);
    p.poly([[224, 246], [290, 214], [400, 240], [400, 330], [224, 330]], "#8a8f5e", 0);
    p.stroke([[20, 318], [56, 290], [34, 268], [80, 246], [62, 226]], 7, "#b3a67c");
    p.stroke([[300, 300], [400, 292]], 12, "#7fa3a8"); p.stroke([[318, 286], [372, 282]], 5, "#6a5a40");
    for (let i = 0; i < 3; i++) p.arc(330 + i * 18, 290, 8, 8, 180, 360, 3, "#6a5a40");
    p.poly(B(0, 322, 400, 344), "#7a6a44", 0);
    // hair behind, dress, neck
    p.poly([[112, 150], [92, 250], [84, 372], [150, 400], [250, 400], [316, 372], [308, 250], [288, 150], [200, 96]], "#3a2a1e", 7);
    p.poly([[40, 560], [56, 430], [112, 356], [200, 336], [288, 356], [344, 430], [360, 560]], "#3d4636", 8);
    p.poly([[146, 352], [254, 352], [240, 410], [200, 424], [160, 410]], SKIN, 6);
    p.poly([[172, 270], [228, 270], [236, 356], [164, 356]], SKIN, 0);
    p.arc(200, 352, 54, 22, 20, 160, 5, "#2f3628");
    // face
    p.ell(200, 208, 66, 88, SKIN, 7);
    p.ell(200, 160, 70, 60, "#3a2a1e", 0, 180, 360); p.poly([[130, 160], [200, 132], [270, 160], [270, 150], [200, 104], [130, 150]], "#3a2a1e", 0);
    p.stroke([[200, 108], [200, 140]], 3, "#5a4634");
    p.arc(200, 208, 66, 88, 190, 350, 7);
    for (const s of [-1, 1]) { p.ell(200 + s * 27, 201, 13, 6.5, "#fff6e6", 3); p.dot(200 + s * 27 + 3.5, 202, 5, "#3a2a1e"); p.ell(200 + s * 27, 196, 14.5, 6, SKIN, 0, 180, 360); p.arc(200 + s * 27, 199, 14.5, 7, 195, 345, 3.6); }
    p.stroke([[205, 204], [198, 236], [210, 240]], 4, "#b98a62");
    p.arc(201, 257, 19, 6, 12, 168, 5, "#8a3f3a"); p.stroke([[182, 258], [178, 255]], 4, "#8a3f3a"); p.stroke([[220, 258], [225, 254]], 4, "#8a3f3a");
    p.ell(168, 236, 13, 9, "rgba(226,140,120,0.35)", 0); p.ell(234, 236, 13, 9, "rgba(226,140,120,0.35)", 0);
    // sleeves and folded hands
    p.poly([[70, 470], [150, 452], [176, 500], [96, 540]], "#a8823f", 7); p.poly([[330, 470], [250, 452], [224, 500], [304, 540]], "#a8823f", 7);
    p.ell(214, 500, 62, 24, SKIN, 7, 0, 360, -6); p.ell(180, 484, 56, 22, SKIN, 7, 0, 360, 8);
    for (let i = 0; i < 3; i++) p.stroke([[150 + i * 16, 474], [146 + i * 16, 496]], 3, "#b98a62");
    g.fillStyle = "rgba(150,110,40,0.14)"; g.fillRect(0, 0, 400, 560);
  });
  p.poly(area, null, 8);
});
/** the Mona Lisa inside the box (x, y, w, h); her hands are the redrawn ones from monaPropsA (two hands with fingers) */
export const drawMona = (p: Pen, x: number, y: number, w: number, h: number) => { drawMona0(p, x, y, w, h); monaHands(p, x, y, w, h); };
/** a carved gilt frame round the box (x0, y0)-(x1, y1); t = moulding width */
const frame = (p: Pen, x0: number, y0: number, x1: number, y1: number, t: number) => {
  const g = p.g;
  g.beginPath(); g.rect(x0, y0, x1 - x0, y1 - y0); g.rect(x0 + t, y0 + t, x1 - x0 - 2 * t, y1 - y0 - 2 * t); g.fillStyle = GOLD; g.fill("evenodd");
  g.beginPath(); g.rect(x0 + t * 0.3, y0 + t * 0.3, x1 - x0 - t * 0.6, y1 - y0 - t * 0.6); g.rect(x0 + t * 0.62, y0 + t * 0.62, x1 - x0 - t * 1.24, y1 - y0 - t * 1.24); g.fillStyle = GOLD_L; g.fill("evenodd");
  for (const [cx, cy] of [[x0 + t / 2, y0 + t / 2], [x1 - t / 2, y0 + t / 2], [x0 + t / 2, y1 - t / 2], [x1 - t / 2, y1 - t / 2]] as P2[]) p.ell(cx, cy, t * 0.34, t * 0.34, GOLD_D, 5);
  for (const [cx, cy] of [[(x0 + x1) / 2, y0 + t / 2], [(x0 + x1) / 2, y1 - t / 2], [x0 + t / 2, (y0 + y1) / 2], [x1 - t / 2, (y0 + y1) / 2]] as P2[]) p.ell(cx, cy, t * 0.24, t * 0.24, GOLD_D, 4);
  p.poly(B(x0, y0, x1, y1), null, 11); p.poly(B(x0 + t, y0 + t, x1 - t, y1 - t), null, 7);
};
/** the Mona Lisa in her frame, 700 x 920 canvas. glass = a pane over her (two shine streaks) */
export const fxMona = (p: Pen, glass = false) => {
  drawMona(p, 110, 110, 480, 700); frame(p, 20, 20, 680, 900, 92);
  if (glass) { const g = p.g; g.fillStyle = "rgba(200,230,255,0.2)"; g.fillRect(112, 112, 476, 696); p.stroke([[150, 300], [330, 130]], 16, "rgba(255,255,255,0.6)"); p.stroke([[150, 380], [250, 286]], 9, "rgba(255,255,255,0.5)"); }
};
/** another portrait in the same frame (the picture hung in her place), 700 x 920 canvas */
export const fxOtherPortrait = (p: Pen) => {
  const g = p.g; g.fillStyle = "#5a5f4a"; g.fillRect(110, 110, 480, 700);
  p.poly([[160, 810], [176, 600], [250, 520], [350, 500], [450, 520], [524, 600], [540, 810]], "#3a3d48", 8);
  p.poly([[300, 520], [400, 520], [380, 590], [350, 604], [320, 590]], "#f1ecdc", 6);
  p.ell(350, 390, 84, 104, SKIN, 8); p.ell(350, 300, 150, 44, "#22242c", 8, 0, 360, -8);
  p.poly([[270, 440], [300, 520], [350, 548], [400, 520], [430, 440], [350, 476]], "#6a4a34", 7);
  for (const s of [-1, 1]) { p.ell(350 + s * 34, 380, 15, 9, "#fff6e6", 4); p.dot(350 + s * 34, 381, 6, "#3a2a1e"); }
  p.arc(350, 440, 26, 8, 20, 160, 5);
  frame(p, 20, 20, 680, 900, 92);
};
/** the bare wall where she hung, same 700 x 920 footprint: a paler patch and four iron hooks */
export const fxHooks = (p: Pen, numbers = 0) => {
  const g = p.g; g.fillStyle = "#c2474b"; g.fillRect(40, 40, 620, 840); // the unfaded patch where she hung: solid, so it shows in 3D too
  g.setLineDash([22, 16]); g.lineWidth = 10; g.strokeStyle = "rgba(50,14,18,0.9)"; g.strokeRect(40, 40, 620, 840); g.setLineDash([]);
  ([[190, 150], [510, 150], [190, 760], [510, 760]] as P2[]).forEach(([x, y], i) => {
    p.poly(B(x - 30, y - 38, x + 30, y + 6), "#5c6470", 8); p.stroke([[x, y], [x, y + 62], [x + 38, y + 62], [x + 38, y + 30]], 22, INK); p.stroke([[x, y], [x, y + 62], [x + 38, y + 62], [x + 38, y + 30]], 10, "#b9c0ca");
    if (i < numbers) { const bx = x < 350 ? x + 104 : x - 104; p.ell(bx, y + 12, 38, 38, "#ffe14d", 7); text(p, String(i + 1), bx, y + 15, 50, "#2b2430"); } // badges inside the outline, between the two columns
  });
};
/** the empty frame, 700 x 920 canvas */
export const fxFrameEmpty = (p: Pen) => { frame(p, 20, 20, 680, 900, 92); };
/** a pane of glass with a wooden edge (the glass case), 560 x 760 canvas */
export const fxGlassPane = (p: Pen) => {
  // see-through: only the wooden edge and two glints are solid, the picture behind stays visible
  const g = p.g; g.fillStyle = "rgba(190,225,250,0.16)"; g.fillRect(30, 30, 500, 700);
  p.stroke([[90, 300], [300, 90]], 18, "rgba(255,255,255,0.85)"); p.stroke([[90, 400], [220, 270]], 10, "rgba(255,255,255,0.8)"); p.stroke([[330, 660], [470, 520]], 10, "rgba(255,255,255,0.8)");
  g.lineWidth = 26; g.strokeStyle = INK; g.strokeRect(30, 30, 500, 700); g.lineWidth = 14; g.strokeStyle = "#8a5a34"; g.strokeRect(30, 30, 500, 700);
};
/** the painting out of its frame: a panel of poplar wood, 460 x 640 canvas. back = seen from behind (bare wood) */
export const fxPanel = (p: Pen, back = false) => {
  p.poly(B(22, 22, 438, 618), "#b08a56", 10);
  if (back) { for (let i = 0; i < 5; i++) p.stroke([[60 + i * 84, 40], [56 + i * 84, 600]], 4, "#8a6a3c"); for (const y of [170, 450]) p.poly(B(40, y, 420, y + 34), "#96713f", 6); }
  else drawMona(p, 38, 38, 384, 564);
};
/** the panel wrapped in a white smock, 520 x 400 canvas */
export const fxBundle = (p: Pen) => {
  // a panel wrapped in a linen smock and tied with string: soft corners, folds, a knot, a corner of dark wood showing
  p.poly([[96, 40], [470, 60], [452, 130], [100, 110]], "#6a4528", 9);
  const cloth: P2[] = [[70, 96], [130, 70], [300, 84], [440, 66], [486, 110], [470, 230], [484, 330], [420, 362], [250, 350], [110, 366], [56, 320], [72, 210]];
  p.poly(cloth, "#e6dcc2", 11);
  p.clip(cloth, () => {
    p.poly([[56, 300], [484, 280], [484, 380], [56, 380]], "#d3c5a3", 0);
    for (const [a, b, c] of [[[110, 80], [150, 200], [120, 360]], [[250, 84], [230, 210], [262, 350]], [[400, 70], [380, 200], [410, 360]]] as [P2, P2, P2][]) p.stroke(curve(a, b, c), 5, "#b8a880");
  });
  p.poly(cloth, null, 11);
  p.stroke([[60, 216], [480, 200]], 9, INK); p.stroke([[60, 216], [480, 200]], 5, "#8a5a34");
  p.stroke(curve([270, 78], [262, 210], [276, 356]), 9, INK); p.stroke(curve([270, 78], [262, 210], [276, 356]), 5, "#8a5a34");
  p.ell(266, 208, 15, 13, "#8a5a34", 5); p.stroke([[266, 208], [300, 176]], 5, "#8a5a34"); p.stroke([[266, 208], [236, 180]], 5, "#8a5a34");
};
/** a white workman's smock on a peg, 380 x 600 canvas */
export const fxSmock = (p: Pen) => {
  p.stroke([[190, 10], [190, 60]], 9); p.dot(190, 12, 12, "#8a6a4a");
  p.poly([[110, 70], [190, 50], [270, 70], [352, 170], [306, 214], [282, 180], [296, 570], [84, 570], [98, 180], [74, 214], [28, 170]], "#f4f1ea", 11);
  p.poly([[150, 60], [190, 110], [230, 60]], "#dcd7c8", 7); p.stroke([[190, 110], [190, 570]], 4, "#c9c4b6");
  for (let i = 0; i < 4; i++) p.dot(204, 170 + i * 96, 8, "#c9c4b6");
  p.poly(B(110, 400, 170, 470), "#e9e4d6", 5);
};

// ---------------- the staircase door ----------------
/** the door at the foot of the service stairs, 520 x 900 canvas. state 0 = shut, 1 = shut and the knob gone, 2 = open (daylight) */
export const fxDoorS = (p: Pen, state = 0) => {
  p.poly(B(20, 20, 500, 890), "#5a4a3a", 12);
  if (state === 2) {
    const g = p.g, gr = g.createLinearGradient(0, 50, 0, 880); gr.addColorStop(0, "#9cc8f0"); gr.addColorStop(0.62, "#e6f1fa"); gr.addColorStop(0.63, "#d9cfb6"); gr.addColorStop(1, "#c9bea0");
    g.fillStyle = gr; g.fillRect(50, 50, 420, 834); p.poly(B(50, 50, 470, 884), null, 9);
    p.poly([[50, 50], [130, 96], [130, 884], [50, 884]], "#6f8a5c", 9);
    return;
  }
  p.poly(B(50, 50, 470, 884), "#6f8a5c", 9);
  for (const [y0, y1] of [[110, 430], [500, 820]]) p.poly(B(100, y0, 420, y1), "#5f7a50", 6);
  if (state === 0) { p.ell(404, 470, 26, 26, "#d9a93a", 8); p.ell(404, 470, 9, 9, "#a87c22", 0); }
  else { p.ell(404, 470, 13, 13, "#22262c", 6); }
  p.poly(B(390, 520, 418, 566), "#3a3f48", 5); p.dot(404, 536, 5, "#0e0e12");
};
/** close on the lock: a brass knob and a screwdriver, 760 x 520 canvas. k: 0 the screwdriver at the knob, 1 the knob off and lying below */
export const fxKnob = (p: Pen, k = 0) => {
  p.poly(B(0, 0, 760, 520), "#6f8a5c", 0); p.poly(B(250, 60, 470, 460), "#b98f2c", 10);
  for (const [x, y] of [[282, 92], [438, 92], [282, 428], [438, 428]] as P2[]) { p.dot(x, y, 12, INK); p.dot(x, y, 8, "#e9c85a"); }
  p.poly(B(338, 330, 382, 400), "#22262c", 6);
  if (k === 0) { p.ell(360, 220, 74, 74, "#e9b93a", 11); p.ell(340, 198, 26, 20, "#fbe59a", 0); }
  else { p.ell(360, 220, 26, 26, "#22262c", 8); p.ell(150, 440, 62, 54, "#e9b93a", 11); p.ell(134, 424, 22, 16, "#fbe59a", 0); }
  const a = k === 0 ? -0.5 : -0.2, x0 = k === 0 ? 452 : 520, y0 = k === 0 ? 180 : 250;
  p.rot = [a, x0, y0]; p.poly(B(x0, y0 - 9, x0 + 150, y0 + 9), "#c9ccd2", 7); p.poly(B(x0 + 150, y0 - 30, x0 + 290, y0 + 30), "#c8312b", 9); p.rot = null;
};
/** a pair of pliers, 360 x 220 canvas */
export const fxPliers = (p: Pen) => {
  p.line([[40, 60], [200, 120], [330, 100]], "#8f9ba8", 20); p.line([[40, 170], [200, 100], [330, 130]], "#8f9ba8", 20);
  p.line([[40, 60], [150, 100]], "#c8312b", 22); p.line([[40, 170], [150, 122]], "#c8312b", 22); p.dot(206, 110, 12, "#3a4450");
};

// ---------------- the trunk ----------------
/** the wooden trunk, 820 x 600 canvas (stands on y = 586). state: 0 shut · 1 open, his things on top · 2 open, the false
 *  bottom bare · 3 the false bottom lifted, a wrapped parcel beneath · 4 the painting showing */
export const fxTrunk = (p: Pen, state = 0) => {
  const W = "#8a5a34", WD = "#6a4424";
  if (state === 0) {
    p.poly(B(40, 250, 780, 586), W, 12); p.poly([[40, 250], [70, 170], [750, 170], [780, 250]], "#9a6a40", 12);
    for (const x of [150, 670]) { p.poly(B(x - 26, 170, x + 26, 586), WD, 7); }
    p.poly(B(370, 232, 450, 300), GOLD, 8); p.dot(410, 268, 9, INK);
    for (const x of [70, 750]) p.poly(B(x - 22, 380, x + 22, 440), "#3a3f48", 6);
    return;
  }
  p.poly([[40, 250], [90, 20], [730, 20], [780, 250]], "#7a4c2a", 12); p.poly([[84, 236], [124, 50], [696, 50], [736, 236]], "#b99a72", 6);
  p.poly(B(40, 250, 780, 586), W, 12); p.poly(B(72, 262, 748, 430), "#3a2616", 7);
  for (const x of [150, 670]) p.poly(B(x - 26, 430, x + 26, 586), WD, 7);
  if (state === 1) {
    p.poly([[100, 300], [330, 284], [340, 420], [110, 428]], "#f1ecdc", 8); p.stroke([[214, 292], [222, 424]], 5, "#c9c4b6");
    p.poly([[360, 330], [520, 310], [540, 420], [372, 428]], "#5a6f8a", 8);
    p.poly([[560, 360], [690, 344], [716, 420], [570, 428]], "#3a2a1e", 8); p.ell(690, 372, 26, 22, "#2b2026", 6);
  } else if (state === 2) {
    p.poly(B(84, 300, 736, 424), "#a8824f", 8); for (let i = 1; i < 5; i++) p.stroke([[84 + i * 130, 302], [84 + i * 130, 422]], 4, "#7a5a34");
  } else {
    p.poly([[84, 300], [736, 300], [700, 120], [120, 120]], "#a8824f", 9); for (let i = 1; i < 5; i++) p.stroke([[84 + i * 130, 298], [120 + i * 116, 122]], 4, "#7a5a34");
    if (state === 3) { // the parcel: linen tied with string, lying in the hidden space
      p.poly([[250, 304], [570, 294], [580, 422], [260, 426]], "#e6dcc2", 9); p.stroke(curve([330, 300], [322, 362], [336, 424]), 5, "#b8a880"); p.stroke(curve([500, 298], [508, 360], [496, 422]), 5, "#b8a880");
      p.stroke([[254, 364], [578, 356]], 8, INK); p.stroke([[254, 364], [578, 356]], 4, "#8a5a34"); p.stroke([[414, 298], [420, 424]], 8, INK); p.stroke([[414, 298], [420, 424]], 4, "#8a5a34"); p.ell(417, 360, 12, 10, "#8a5a34", 4);
    } else { // unwrapped: she stands upright in the trunk, large, the linen fallen open at her sides
      p.poly([[236, 300], [300, 286], [300, 428], [230, 432]], "#e6dcc2", 7); p.poly([[520, 286], [590, 300], [596, 432], [520, 428]], "#e6dcc2", 7);
      drawMona(p, 290, 96, 240, 332); p.poly(B(290, 96, 530, 428), null, 10);
    }
  }
};
/** a small table top with a cloth over something flat, 620 x 300 canvas. k = the cloth's corner lifted (0..1) */
export const fxCloth = (p: Pen, k = 0) => {
  // a cloth draped over something flat: a soft outline, a hem that hangs in scallops, folds. k lifts its right end
  if (k > 0.02) { p.g.save(); p.g.beginPath(); p.g.rect(380, 60, 200, 190); p.g.clip(); drawMona(p, 150, 20, 430, 230); p.g.restore(); p.poly(B(380, 60, 580, 250), null, 7); }
  const lift = 150 * k, x1 = 580 - lift, top: P2[] = [[40, 190], [58, 124], [96, 104], [x1 - 60, 100], [x1 - 18, 118], [x1, 150 + lift * 0.4]], hem: P2[] = [];
  for (let i = 0; i <= 12; i++) { const u = i / 12; hem.push([x1 - (x1 - 40) * u, 236 + (i % 2 ? 26 : 0) + lift * 0.3 * (1 - u)]); }
  const cloth: P2[] = [...top, ...hem];
  p.poly(cloth, "#ece5d2", 10);
  p.clip(cloth, () => { for (const x of [120, 220, 320, 420]) if (x < x1 - 20) p.stroke(curve([x, 112], [x - 10, 180], [x + 8, 262]), 5, "#c2b594"); p.poly([[40, 232], [x1, 232], [x1, 290], [40, 290]], "rgba(150,135,100,0.25)", 0); });
  p.poly(cloth, null, 10);
  if (k > 0.02) p.poly([[x1, 150 + lift * 0.4], [x1 + 46, 94], [x1 + 60, 168]], "#f4f1ea", 8);
};

// ---------------- places seen from far away ----------------
/** the Louvre across the square, 1800 x 640 canvas (ground at y = 630): long wings, three pavilions with slate roofs */
export const fxLouvre = (p: Pen) => {
  const S = "#e4d8bc", SD = "#c9bb9a", R = "#6f7c8c";
  p.poly(B(20, 330, 1780, 630), S, 12);
  for (const [x, w, h] of [[140, 240, 250], [900, 320, 330], [1660, 240, 250]] as const) {
    p.poly([[x - w / 2, 330], [x - w / 2 + 30, 330 - h * 0.5], [x - w * 0.22, 330 - h], [x + w * 0.22, 330 - h], [x + w / 2 - 30, 330 - h * 0.5], [x + w / 2, 330]], R, 11);
    p.poly(B(x - w / 2, 300, x + w / 2, 630), S, 11); p.poly(B(x - 46, 470, x + 46, 630), "#5a4a3a", 8); p.arc(x, 470, 46, 46, 180, 360, 8);
    for (const dx of [-w * 0.3, w * 0.3]) p.poly(B(x + dx - 20, 370, x + dx + 20, 450), "#5d7f9a", 6);
    p.poly(B(x - 10, 330 - h - 46, x + 10, 330 - h), "#4a5560", 6);
  }
  for (let i = 0; i < 26; i++) { const x = 280 + i * 50; if ((x > 720 && x < 1080) || x > 1520) continue; p.poly(B(x, 390, x + 26, 470), "#5d7f9a", 5); p.arc(x + 13, 560, 15, 34, 180, 360, 5); p.poly(B(x - 2, 560, x + 28, 630), SD, 0); }
  p.poly(B(20, 330, 1780, 352), SD, 8); p.poly(B(20, 492, 1780, 506), SD, 0);
};
/** Florence from the hills, 1600 x 700 canvas (ground at y = 690): red roofs, the great dome and the bell tower */
export const fxFlorence = (p: Pen) => {
  const T = "#c9744a", W = "#eadfc6";
  for (let i = 0; i < 12; i++) { const x = 40 + i * 132, h = 150 + ((i * 53) % 90); p.poly(B(x, 690 - h, x + 124, 690), W, 9); p.poly([[x - 8, 690 - h], [x + 62, 690 - h - 46], [x + 132, 690 - h]], T, 9); for (let k = 0; k < 2; k++) p.poly(B(x + 26 + k * 50, 690 - h + 34, x + 50 + k * 50, 690 - h + 84), "#5d6f7a", 5); }
  p.poly(B(620, 360, 1010, 690), W, 11); p.poly(B(700, 300, 930, 372), W, 10);
  const dome: P2[] = []; for (let i = 0; i <= 20; i++) { const a = Math.PI * (1 + i / 20); dome.push([815 + 150 * Math.cos(a), 304 - 220 * Math.abs(Math.sin(a)) ** 0.85]); }
  p.poly([...dome, [965, 304], [665, 304]], T, 12);
  for (const dx of [-90, -30, 30, 90]) p.stroke([[815 + dx, 300], [815 + dx * 0.25, 96]], 6, "#f1e6cc");
  p.poly(B(797, 40, 833, 100), W, 8); p.dot(815, 30, 15, GOLD);
  p.poly(B(1070, 150, 1160, 690), W, 11); for (let i = 0; i < 5; i++) p.poly(B(1092, 190 + i * 96, 1138, 250 + i * 96), "#5d6f7a", 5); p.poly([[1062, 150], [1115, 96], [1168, 150]], T, 9);
};
/** the two towers of Notre-Dame, 560 x 660 canvas */
export const fxNotreDame = (p: Pen) => {
  const S = "#d9d2c0";
  p.poly(B(60, 330, 500, 650), S, 11);
  for (const x of [60, 320]) { p.poly(B(x, 40, x + 180, 340), S, 11); for (const dx of [36, 104]) { p.poly(B(x + dx, 90, x + dx + 40, 250), "#3a4450", 6); p.arc(x + dx + 20, 90, 20, 26, 180, 360, 6); } for (let i = 0; i < 5; i++) p.poly(B(x + 6 + i * 36, 14, x + 26 + i * 36, 44), S, 6); }
  p.ell(280, 430, 62, 62, "#5d7f9a", 9); for (let i = 0; i < 8; i++) { const a = (TWO * i) / 8; p.stroke([[280, 430], [280 + 60 * Math.cos(a), 430 + 60 * Math.sin(a)]], 4); }
  for (const x of [130, 280, 430]) { p.poly(B(x - 40, 540, x + 40, 650), "#5a4a3a", 7); p.arc(x, 540, 40, 44, 180, 360, 7); }
};
/** snow mountains, 1800 x 620 canvas */
export const fxAlps = (p: Pen) => {
  p.poly([[0, 620], [0, 420], [190, 190], [330, 360], [520, 110], [760, 400], [900, 250], [1120, 430], [1320, 150], [1560, 400], [1800, 300], [1800, 620]], "#8fa2b8", 12);
  for (const [x, y, s] of [[190, 190, 80], [520, 110, 110], [900, 250, 70], [1320, 150, 100]] as const) p.poly([[x - s, y + s * 1.25], [x, y], [x + s * 0.9, y + s * 1.3], [x + s * 0.4, y + s * 1.05], [x, y + s * 1.35], [x - s * 0.4, y + s * 1.05]], "#f4f6fa", 8);
  p.poly([[0, 620], [0, 520], [300, 450], [700, 520], [1100, 440], [1500, 520], [1800, 470], [1800, 620]], "#6f9a6a", 10);
};

// ---------------- easel, camera, small props ----------------
/** an easel with a canvas, 640 x 1040 canvas (feet on y = 1030). kind: "blank" · "start" (a first sketch of her) · "mona" · "other" (a landscape) · "cubist" */
export const fxEasel = (p: Pen, kind: "blank" | "start" | "mona" | "other" | "cubist" = "blank") => {
  const W = "#8a5a34";
  p.line([[320, 60], [120, 1026]], W, 22); p.line([[320, 60], [520, 1026]], W, 22); p.line([[320, 80], [320, 960]], "#6a4424", 18);
  p.poly(B(110, 700, 530, 736), W, 9);
  p.poly(B(130, 150, 510, 700), kind === "blank" ? "#f4efe0" : "#b08a56", 10);
  if (kind === "mona") drawMona(p, 146, 166, 348, 518);
  else if (kind === "start") { p.poly(B(146, 166, 494, 684), "#e9dcc0", 0); p.ell(320, 360, 62, 80, null, 6); p.stroke([[230, 684], [250, 520], [320, 470], [390, 520], [410, 684]], 6, "#7a5a3a"); p.arc(321, 404, 24, 9, 18, 162, 5, "#7a5a3a"); p.poly(B(146, 166, 494, 684), null, 7); }
  else if (kind === "other") { const g = p.g; g.fillStyle = "#9cc0d9"; g.fillRect(146, 166, 348, 518); p.poly([[146, 520], [260, 420], [360, 500], [494, 400], [494, 684], [146, 684]], "#6f9a6a", 0); p.ell(400, 270, 40, 40, "#f6e08a", 0); p.poly(B(146, 166, 494, 684), null, 7); }
  else if (kind === "cubist") { const C = ["#c9a25a", "#8a5a48", "#5a6f7a", "#e9dfc8", "#3a3d48", "#b9483a"]; let i = 0; for (const t of [[[146, 166], [330, 166], [240, 380]], [[330, 166], [494, 166], [494, 400], [240, 380]], [[146, 166], [240, 380], [146, 500]], [[240, 380], [494, 400], [380, 560]], [[146, 500], [240, 380], [380, 560], [260, 684], [146, 684]], [[380, 560], [494, 400], [494, 684], [260, 684]]] as P2[][]) p.poly(t, C[i++ % 6], 6); p.ell(300, 330, 26, 34, "#f4efe0", 6); p.dot(292, 326, 7); p.dot(318, 340, 7); }
};
/** a plate camera on a tripod, 560 x 820 canvas (feet on y = 810); flash = the powder going off */
export const fxCamera = (p: Pen, flash = false) => {
  for (const x of [120, 280, 440]) p.line([[280, 380], [x, 806]], "#8a5a34", 16);
  p.poly(B(150, 190, 410, 390), "#5a3a26", 11); p.poly([[150, 210], [70, 240], [70, 340], [150, 370]], "#2b2b30", 9);
  p.ell(430, 290, 44, 56, "#3a3f48", 10); p.ell(442, 290, 22, 30, "#9cc8f0", 5);
  if (flash) { const pts: P2[] = []; for (let i = 0; i < 20; i++) { const a = (TWO * i) / 20, r = i % 2 ? 60 : 130; pts.push([280 + r * Math.cos(a), 110 + r * Math.sin(a)]); } p.poly(pts, "#fff3b0", 8); }
  else { p.poly(B(260, 120, 300, 190), "#3a3f48", 7); p.poly(B(220, 96, 340, 124), "#8f9ba8", 7); }
};
/** a stone head (a small ancient statue), 320 x 440 canvas */
export const fxStatue = (p: Pen) => {
  p.poly(B(70, 370, 250, 430), "#8f8779", 9); p.poly([[124, 300], [196, 300], [206, 372], [114, 372]], "#b9b2a4", 9);
  p.ell(160, 190, 96, 124, "#c4bdae", 11); p.poly([[66, 150], [100, 60], [220, 60], [254, 150], [220, 120], [160, 104], [100, 120]], "#a8a092", 9);
  for (const s of [-1, 1]) { p.ell(160 + s * 38, 180, 20, 12, "#a8a092", 6); p.stroke([[160 + s * 18, 150], [160 + s * 62, 146]], 7, "#8f8779"); }
  p.poly([[150, 190], [170, 190], [176, 240], [144, 240]], "#b0a99a", 6); p.stroke([[130, 268], [190, 268]], 7, "#8f8779");
};
/** a suitcase, 460 x 340 canvas */
export const fxSuitcase = (p: Pen) => {
  p.poly(B(30, 90, 430, 320), "#8a5a34", 11); p.poly(B(180, 40, 280, 96), null, 12);
  for (const x of [110, 350]) p.poly(B(x - 16, 90, x + 16, 320), "#6a4424", 6); p.poly(B(206, 176, 254, 220), GOLD, 6);
};
/** a thumbprint on a piece of glass, 440 x 440 canvas */
export const fxThumb = (p: Pen, glass = true) => {
  if (glass) { p.poly([[40, 70], [380, 30], [410, 380], [70, 410]], "rgba(200,230,255,0.75)", 10); p.stroke([[90, 150], [170, 70]], 12, "rgba(255,255,255,0.8)"); }
  else p.poly(B(50, 50, 390, 390), PAPER, 9);
  // a thumb print: an oval pad of closed ridges around a core, broken here and there like a real smudge
  const g = p.g; g.save(); g.translate(220, 230); g.rotate(-0.22);
  for (let i = 0; i < 7; i++) {
    const rx = 14 + i * 13, ry = 20 + i * 19;
    for (const [a0, a1] of i % 2 ? [[20, 170], [195, 340]] : [[-70, 110], [130, 280]]) {
      g.beginPath(); g.ellipse(0, 6 - i * 2, rx, ry, 0, (a0 * Math.PI) / 180, (a1 * Math.PI) / 180); g.lineWidth = 7; g.lineCap = "round"; g.strokeStyle = "#3a3044"; g.stroke();
    }
  }
  g.beginPath(); g.ellipse(0, 4, 4, 7, 0, 0, 7); g.fillStyle = "#3a3044"; g.fill(); g.restore();
};
/** a police record card: a photograph, a name and two rows of fingerprints, 600 x 720 canvas */
export const fxFile = (p: Pen, name = "PERUGGIA, V.") => {
  p.poly(B(20, 20, 580, 700), PAPER, 11); text(p, "POLICE", 300, 64, 44, "#2a3f7a"); p.stroke([[60, 96], [540, 96]], 5, "#2a3f7a");
  p.poly(B(60, 124, 270, 384), "#cfc6b4", 8); p.ell(165, 222, 54, 66, SKIN, 7); p.poly([[84, 384], [100, 320], [165, 296], [230, 320], [246, 384]], "#5a4a3a", 7);
  p.ell(165, 170, 60, 30, "#3a2a1e", 0, 180, 360); p.stroke([[136, 248], [165, 240], [194, 248]], 9, "#2b2026"); p.dot(146, 216, 6); p.dot(184, 216, 6);
  text(p, name, 420, 170, fit(name, 40, 250), "#2b2430"); for (let i = 0; i < 4; i++) p.stroke([[306, 220 + i * 40], [i === 3 ? 440 : 540, 220 + i * 40]], 7, "#8b8478");
  for (let r = 0; r < 2; r++) for (let c = 0; c < 5; c++) { const x = 100 + c * 100, y = 470 + r * 120; p.poly(B(x - 40, y - 46, x + 40, y + 46), "#ffffff", 5); for (let i = 0; i < 3; i++) p.arc(x, y + 4, 9 + i * 9, 12 + i * 11, 160, 380, 4, "#3a3044"); }
};
/** a newspaper front page with her picture, 600 x 760 canvas */
export const fxFrontPage = (p: Pen, mast = "THE NEWS", head = "MONA LISA|STOLEN!") => {
  p.poly(B(20, 16, 580, 744), "#f1ecdc", 10); text(p, mast, 300, 62, fit(mast, 58, 500), "#2b2430", 0, "Georgia, 'Times New Roman', serif"); p.stroke([[44, 100], [556, 100]], 6);
  const L = head.split("|"); L.forEach((l, i) => text(p, l, 300, 150 + i * 66, fit(l, 68, 500), RED));
  const y0 = 126 + L.length * 66; drawMona(p, 60, y0, 210, 294);
  for (let i = 0; i < 8; i++) p.stroke([[300, y0 + 14 + i * 38], [i === 7 ? 470 : 550, y0 + 14 + i * 38]], 8, "#8b8478");
  for (let i = 0; i < 3; i++) p.stroke([[60, y0 + 330 + i * 36], [i === 2 ? 380 : 550, y0 + 330 + i * 36]], 8, "#8b8478");
};
/** a magazine cover with a year on it, 560 x 720 canvas */
export const fxMagazine = (p: Pen, year = "1932") => {
  p.poly(B(20, 16, 540, 704), "#f4e9c8", 10); p.poly(B(20, 16, 540, 150), "#2a4f9a", 10); text(p, "MAGAZINE", 280, 86, 62, "#ffffff");
  text(p, year, 280, 260, 120, RED, 12); text(p, "THE TRUE STORY", 280, 380, 40, "#2b2430"); text(p, "OF THE THEFT?", 280, 432, 40, "#2b2430");
  drawMona(p, 205, 480, 150, 200);
};
/** a letter in handwriting, 620 x 780 canvas. sign = the name at the foot, or "" for none; big = one line of large words in the middle */
export const fxHandLetter = (p: Pen, sign = "", big = "") => {
  p.poly(B(24, 20, 596, 760), PAPER, 10);
  const wavy = (y: number, x1: number) => { const pts: P2[] = []; for (let x = 70; x <= x1; x += 14) pts.push([x, y + 5 * Math.sin(x * 0.21 + y)]); p.stroke(pts, 6, "#4a4458"); };
  const rows = big ? [90, 136, 182, 470, 516] : [90, 136, 182, 228, 274, 320, 366, 412, 458];
  rows.forEach((y, i) => wavy(y, i === rows.length - 1 ? 360 : 548));
  if (big) big.split("|").forEach((l, i, a) => text(p, l, 310, 326 + (i - (a.length - 1) / 2) * 76, fit(l, 76, 480), RED, 0, "Georgia, 'Times New Roman', serif"));
  if (sign) { text(p, sign, 400, 640, fit(sign, 92, 360), "#2a3f7a", 0, "'Brush Script MT', 'Segoe Script', cursive", 400); p.stroke([[250, 694], [550, 684]], 5, "#2a3f7a"); }
};
/** a love letter: an envelope sealed with a heart, 320 x 240 canvas */
export const fxLove = (p: Pen) => {
  p.poly(B(16, 30, 304, 220), PAPER, 10); p.stroke([[16, 30], [160, 136], [304, 30]], 8);
  const h: P2[] = []; for (let i = 0; i < 40; i++) { const t = (TWO * i) / 40; h.push([160 + 3.1 * 16 * Math.sin(t) ** 3, 128 - 3.1 * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))]); }
  p.poly(h, "#e04a5a", 7);
};
/** a clock face with both hands, 320 x 320 canvas */
export const fxClock2 = (p: Pen, hour = 7, min = 0) => {
  p.ell(160, 160, 142, 142, "#fbf6e6", 13);
  for (let i = 0; i < 12; i++) { const a = (TWO * i) / 12; p.stroke([[160 + 112 * Math.sin(a), 160 - 112 * Math.cos(a)], [160 + 130 * Math.sin(a), 160 - 130 * Math.cos(a)]], i % 3 ? 5 : 11); }
  const ha = (TWO * ((hour % 12) + min / 60)) / 12, ma = (TWO * min) / 60;
  p.stroke([[160, 160], [160 + 70 * Math.sin(ha), 160 - 70 * Math.cos(ha)]], 15); p.stroke([[160, 160], [160 + 106 * Math.sin(ma), 160 - 106 * Math.cos(ma)]], 9); p.dot(160, 160, 13, RED);
};
/** a double-headed measuring arrow with a label, 760 x 200 canvas (lies flat; rotate the card for height) */
export const fxMeasure = (p: Pen, s: string) => {
  p.stroke([[40, 100], [720, 100]], 18, INK); p.stroke([[40, 100], [720, 100]], 8, "#ffe14d");
  for (const [x, d] of [[40, 1], [720, -1]] as const) p.poly([[x - d * 26, 100], [x + d * 36, 62], [x + d * 36, 138]], "#ffe14d", 8);
  p.poly(B(250, 40, 510, 160), "#ffe14d", 9); text(p, s, 380, 104, fit(s, 78, 240), "#2b2430");
};
/** a big tick or cross, 320 x 320 canvas */
export const fxMark = (p: Pen, ok: boolean) => {
  if (ok) { p.stroke([[50, 170], [130, 250], [270, 70]], 64, INK); p.stroke([[50, 170], [130, 250], [270, 70]], 40, GREEN); }
  else { for (const l of [[[60, 60], [260, 260]], [[260, 60], [60, 260]]] as P2[][]) p.stroke(l, 64, INK); for (const l of [[[60, 60], [260, 260]], [[260, 60], [60, 260]]] as P2[][]) p.stroke(l, 40, RED); }
};
/** a poster on a wall: a heading and her picture, 460 x 620 canvas */
export const fxPoster = (p: Pen, head = "REWARD") => {
  p.poly(B(20, 16, 440, 604), "#f6e9b8", 10); text(p, head, 230, 80, fit(head, 84, 380), RED); drawMona(p, 130, 140, 200, 280);
  text(p, "MISSING", 230, 474, 54, "#2b2430"); for (let i = 0; i < 2; i++) p.stroke([[70, 530 + i * 34], [390, 530 + i * 34]], 8, "#8b8478");
};
/** a steam locomotive and a carriage, 1300 x 480 canvas (wheels on y = 466) */
export const fxTrain = (p: Pen) => {
  p.poly(B(660, 170, 1260, 400), "#7a3f2a", 11); for (let i = 0; i < 5; i++) p.poly(B(700 + i * 110, 210, 780 + i * 110, 300), "#bfe3f5", 7);
  p.poly(B(60, 230, 600, 400), "#2f3a44", 11); p.poly(B(400, 130, 600, 400), "#3a4652", 11); p.poly(B(440, 170, 560, 250), "#bfe3f5", 7);
  p.poly(B(110, 110, 170, 236), "#22262c", 9); p.poly(B(96, 90, 184, 120), "#22262c", 8); p.ell(260, 220, 34, 26, "#d9a93a", 8);
  p.poly([[60, 400], [10, 440], [60, 440]], "#c8312b", 8);
  for (const x of [150, 300, 450, 760, 900, 1040, 1180]) { p.ell(x, 412, 54, 54, "#22262c", 10); p.ell(x, 412, 22, 22, "#8f9ba8", 5); }
  for (const [x, y, r] of [[140, 60, 40], [100, 10, 30]] as const) p.ell(x, y + 20, r, r * 0.8, "#e9e9ee", 7);
};
/** a border barrier: a striped pole across the road and a hut, 1000 x 420 canvas (ground at y = 410) */
export const fxBarrier = (p: Pen) => {
  p.poly(B(60, 120, 250, 410), "#e4d8bc", 11); p.poly([[40, 120], [155, 40], [270, 120]], "#6f7c8c", 10); p.poly(B(120, 250, 190, 410), "#5a4a3a", 7);
  p.poly(B(300, 190, 336, 410), "#3a3f48", 8);
  p.poly(B(300, 196, 960, 240), "#f4f1ea", 9); for (let i = 0; i < 6; i++) p.poly([[330 + i * 110, 196], [384 + i * 110, 196], [360 + i * 110, 240], [306 + i * 110, 240]], RED, 0);
  p.poly(B(300, 196, 960, 240), null, 9);
};
/** an alarm bell ringing, 340 x 340 canvas; k = swing -1..1 */
export const fxBell = (p: Pen, k = 0) => {
  p.rot = [k * 0.35, 170, 60];
  p.poly([[80, 230], [96, 130], [130, 76], [210, 76], [244, 130], [260, 230]], "#e9b93a", 11); p.poly(B(60, 226, 280, 258), "#c9992c", 9); p.ell(170, 276, 22, 22, "#8a6412", 7); p.poly(B(150, 40, 190, 80), "#8a6412", 7);
  p.rot = null;
  for (const s of [-1, 1]) for (const d of [0, 1]) p.arc(170 + s * 130, 150, 20 + d * 22, 50 + d * 26, s > 0 ? -60 : 120, s > 0 ? 60 : 240, 7);
};
/** a magnifying glass, 340 x 340 canvas */
export const fxLens = (p: Pen) => { p.line([[210, 210], [316, 316]], "#6a4424", 22); p.ell(140, 140, 112, 112, "rgba(200,230,255,0.55)", 0); p.arc(140, 140, 112, 112, 0, 360, 22, INK); p.arc(140, 140, 112, 112, 0, 360, 10, "#c9ccd2"); p.stroke([[80, 130], [130, 76]], 12, "rgba(255,255,255,0.8)"); };
/** prison bars across the whole card, 1000 x 760 canvas */
export const fxCellBars = (p: Pen) => { for (let i = 0; i < 9; i++) { const x = 60 + i * 110; p.poly(B(x - 15, 0, x + 15, 760), "#5c6470", 9); p.stroke([[x - 6, 10], [x - 6, 750]], 4, "#8f9ba8"); } for (const y of [90, 660]) p.poly(B(0, y - 18, 1000, y + 18), "#4a505c", 9); };
/** a pot of paint with a brush, 340 x 340 canvas */
export const fxPaintPot = (p: Pen) => { p.poly([[70, 150], [270, 150], [250, 320], [90, 320]], "#8f9ba8", 10); p.ell(170, 150, 100, 26, "#3f8ad0", 9); p.line([[190, 150], [290, 20]], "#c9a25a", 16); p.poly([[168, 172], [196, 124], [214, 136], [190, 186]], "#2b2b30", 6); p.stroke([[110, 200], [110, 290]], 10, "#3f8ad0"); };
/** a roll of canvas or a plank of wood, 420 x 260 canvas */
export const fxSupport = (p: Pen, wood: boolean) => {
  if (wood) { p.poly(B(30, 40, 390, 220), "#b08a56", 11); for (const y of [90, 140, 180]) p.stroke([[50, y], [370, y + 6]], 5, "#8a6a3c"); p.ell(280, 120, 20, 12, "#8a6a3c", 4); }
  else { p.poly(B(60, 80, 360, 190), "#efe6cf", 10); p.ell(60, 135, 34, 56, "#f6efdc", 10); p.ell(360, 135, 34, 56, "#e2d8be", 10); p.arc(360, 135, 16, 28, 0, 360, 5); for (let i = 0; i < 5; i++) p.stroke([[100 + i * 50, 92], [100 + i * 50, 178]], 3, "#cfc4a8"); }
};
/** a hotel sign, 900 x 300 canvas */
export const fxSign = (p: Pen, small: string, bigS: string, fill = "#2a4f6a") => { p.poly(B(16, 16, 884, 284), fill, 12); p.poly(B(40, 40, 860, 260), null, 6); text(p, small, 450, 90, fit(small, 56, 760), "#f1d98a"); text(p, bigS, 450, 184, fit(bigS, 96, 780), "#ffffff"); };
/** a cupboard with its door ajar and two eyes in the dark, 420 x 720 canvas */
export const fxCupboard = (p: Pen) => {
  p.poly(B(30, 20, 390, 700), "#6a4424", 12); p.poly(B(60, 50, 360, 670), "#1c1410", 8);
  p.poly([[60, 50], [230, 80], [230, 660], [60, 670]], "#8a5a34", 9); p.ell(206, 370, 12, 12, GOLD, 6);
  for (const x of [276, 318]) { p.ell(x, 250, 16, 20, "#ffffff", 5); p.dot(x - 3, 254, 7); }
};
/** a gravestone with lines of lettering that always fit, 420 x 480 canvas (stands on y = 470) */
export const fxTomb = (p: Pen, s: string) => {
  const top: P2[] = []; for (let i = 0; i <= 16; i++) { const a = Math.PI * (1 + i / 16); top.push([210 + 170 * Math.cos(a), 190 + 160 * Math.sin(a)]); }
  p.poly([[40, 470], ...top, [380, 470]], "#b9b4aa", 12); p.poly(B(20, 440, 400, 474), "#9a958b", 10);
  const L = s.split("|"); L.forEach((l, i) => text(p, l, 210, 250 + (i - (L.length - 1) / 2) * 70, Math.min(62, 290 / (0.74 * Math.max(1, l.length))), "#3a3640"));
};
/** a card with a small heading and one big line, both fitted to the card, 520 x 300 canvas */
export const fxTagCard = (p: Pen, head: string, big: string, fill = "#f6efd8") => {
  p.poly(B(14, 14, 506, 286), fill, 11);
  text(p, head, 260, 78, Math.min(50, 430 / (0.82 * Math.max(1, head.length))), "#6a5a40");
  text(p, big, 260, 190, Math.min(110, 430 / (0.84 * Math.max(1, big.length))), "#2b2430");
};
/** a name board on a post, 520 x 640 canvas (foot at y = 632) */
export const fxPostSign = (p: Pen, s: string) => { p.poly(B(244, 190, 276, 632), "#8a6a4a", 8); p.poly(B(16, 26, 504, 204), "#f6efd8", 11); text(p, s, 260, 118, Math.min(104, 430 / (0.86 * Math.max(1, s.length))), "#2b2430"); };
/** two piles for a queue rope: a brass post with a red rope end, 200 x 520 canvas */
export const fxPost = (p: Pen) => { p.poly(B(88, 60, 112, 480), "#d9a93a", 8); p.ell(100, 50, 26, 26, "#e9c85a", 8); p.ell(100, 490, 60, 18, "#a87c22", 8); };
/** the staff entrance: a stone doorway with a dark opening and a small plate, 600 x 860 canvas (threshold at y = 850) */
export const fxStaffDoor = (p: Pen) => {
  p.poly(B(20, 60, 580, 850), "#d9cdb0", 12);
  for (let i = 0; i < 7; i++) p.stroke([[20, 150 + i * 100], [580, 150 + i * 100]], 4, "#b9ad90");
  const arch: P2[] = [[130, 850], [130, 330]]; for (let i = 0; i <= 12; i++) { const a = Math.PI * (1 + i / 12); arch.push([300 + 170 * Math.cos(a), 330 + 150 * Math.sin(a)]); } arch.push([470, 850]);
  p.poly(arch, "#2b2430", 11);
  p.poly(B(150, 420, 290, 850), "#5a3a26", 8); p.dot(268, 640, 9, GOLD);
  p.poly(B(190, 90, 410, 160), "#2a4f6a", 8); text(p, "STAFF", 300, 128, 46, "#ffffff");
};
