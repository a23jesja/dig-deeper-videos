// Drawings for shots 1-25 of "The Man Who Stole the Mona Lisa": the things that misread in the first cut, redrawn,
// and the things that have to sit in somebody's hand or under somebody's arm.
import { Pen, INK, mix } from "./toon";
import { fxMona, fxEasel, fxPanel, fxSupport, fxMark, fxFile } from "./monatoon";

type P2 = [number, number];
type Draw = (p: Pen) => void;
const B = (x0: number, y0: number, x1: number, y1: number): P2[] => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
const SKIN = "#ecc9a0", PAPER = "#fbf6e6", YELLOW = "#ffe14d";
const text = (p: Pen, s: string, x: number, y: number, px: number, fill: string, stroke = 0) => {
  const g = p.g;
  g.font = `900 ${px}px 'Arial Black', Impact, 'Segoe UI Black', sans-serif`; g.textAlign = "center"; g.textBaseline = "middle";
  if (stroke) { g.lineWidth = stroke; g.strokeStyle = INK; g.lineJoin = "round"; g.strokeText(s, x, y); }
  g.fillStyle = fill; g.fillText(s, x, y);
};
/** letters sized so that the line is never wider than `width` (Arial Black capitals run to 0.9 em) */
const fit = (s: string, base: number, width: number) => Math.min(base, width / (0.9 * Math.max(1, s.length)));
/** draw inside the box (x, y, w, h) using a design space dw x dh */
const within = (p: Pen, x: number, y: number, w: number, h: number, dw: number, dh: number, fn: () => void) => { const g = p.g; g.save(); g.translate(x, y); g.scale(w / dw, h / dh); fn(); g.restore(); };

// ---------------- her hands ----------------
/** one hand lying flat: the back of the hand and four fingers pointing to dir (+1 = right) */
const flatHand = (p: Pen, cx: number, cy: number, dir: number) => {
  for (let i = 0; i < 4; i++) {
    const y0 = cy - 10.5 + i * 7, L = 36 - Math.abs(i - 1.3) * 5, a: P2 = [cx + dir * 10, y0], b: P2 = [cx + dir * (12 + L), y0 + 1.5 + i * 1.3];
    p.stroke([a, b], 11, INK); p.stroke([a, b], 6.4, SKIN);
  }
  const t: P2[] = [[cx + dir * 2, cy - 13], [cx + dir * 22, cy - 19]];
  p.stroke(t, 11, INK); p.stroke(t, 6.4, SKIN);
  p.ell(cx - dir * 6, cy, 24, 16, SKIN, 5);
};
/** her folded hands, drawn over the portrait that fills the box (x, y, w, h): two sleeves and two hands with fingers,
 *  the right hand lying over the left (the portrait itself is drawMona in monatoon: 400 x 560 design units) */
export const monaHands = (p: Pen, x: number, y: number, w: number, h: number) => within(p, x, y, w, h, 400, 560, () => {
  const g = p.g;
  g.save(); g.beginPath(); g.rect(60, 444, 280, 112); g.clip();
  g.fillStyle = "#3d4636"; g.fillRect(60, 444, 280, 112);
  p.poly([[56, 494], [138, 462], [176, 476], [186, 514], [118, 548], [56, 560]], "#a8823f", 7);
  p.poly([[344, 494], [262, 462], [224, 476], [214, 514], [282, 548], [344, 560]], "#a8823f", 7);
  flatHand(p, 226, 518, -1);
  flatHand(p, 176, 498, 1);
  g.fillStyle = "rgba(150,110,40,0.14)"; g.fillRect(60, 444, 280, 112);
  g.restore();
});
/** the Mona Lisa in her frame (700 x 920 canvas), her hands drawn as hands. glass = a pane over her */
export const fxMonaA = (p: Pen, glass = false) => {
  fxMona(p, false);
  const g = p.g;
  g.save(); g.beginPath(); g.rect(116, 116, 468, 688); g.clip(); monaHands(p, 110, 110, 480, 700); g.restore();
  if (glass) { g.fillStyle = "rgba(200,230,255,0.2)"; g.fillRect(112, 112, 476, 696); p.stroke([[150, 300], [330, 130]], 16, "rgba(255,255,255,0.6)"); p.stroke([[150, 380], [250, 286]], 9, "rgba(255,255,255,0.5)"); }
};
/** the panel out of its frame, front (460 x 640 canvas) */
export const fxPanelA = (p: Pen) => { fxPanel(p); monaHands(p, 38, 38, 384, 564); };
/** the easel (640 x 1040 canvas) */
export const fxEaselA = (p: Pen, kind: "blank" | "start" | "mona") => { fxEasel(p, kind); if (kind === "mona") monaHands(p, 146, 166, 348, 518); };

// ---------------- things under an arm, things in a hand ----------------
/** A thing clamped under an arm: the thing, then the sleeve coming down over it and the hand gripping its lower edge.
 *  (ax, ay) = where the arm comes in at the top, (hx, hy) = the hand, t = width of the sleeve, all in canvas units. */
export const underArmOf = (thing: Draw, jacket: string, ax: number, ay: number, hx: number, hy: number, t: number): Draw => (p) => {
  thing(p);
  const mx = (ax + hx) / 2 + (hx > ax ? -1 : 1) * 0.1 * Math.abs(hy - ay), pts: P2[] = [];
  for (let i = 0; i <= 12; i++) { const u = i / 12; pts.push([(1 - u) * (1 - u) * ax + 2 * u * (1 - u) * mx + u * u * hx, ay + (hy - ay) * u]); }
  p.stroke(pts, t * 1.68, INK); p.stroke(pts, t, mix(jacket, INK, 0.5)); p.dot(hx, hy, t * 1.16);
};
/** Where the near hand of a side-view walker is (the swinging arm of bodySide): [metres ahead of the body in the walking
 *  direction, height, how far the body has sunk in mid-stride]. phase undefined = standing still. */
export const sideHand = (phase: number | undefined, scale = 1, stout = false): [number, number, number] => {
  const U = 2.36, HH = 222, SU = 0.00216, sole = 975, ankY = sole - 4 * U, legLen = ((stout ? 1.32 : 1.4) + 0.12) * HH - 4 * U, aLen = 0.95 * HH;
  const stand = ankY - legLen * 0.995;
  let hipY = stand, lean = 0, fwd = 0;
  if (phase !== undefined) {
    const S = 370, st = (ph: number) => {
      const c = (((phase + ph) % 1) + 1) % 1;
      if (c < 0.5) { const s = c / 0.5; return { x: S / 2 - S * s, stance: true, s }; }
      const s = (c - 0.5) / 0.5; return { x: -S / 2 + S * s - (S / Math.PI) * Math.sin(2 * Math.PI * s), stance: false, s };
    };
    const nL = st(0), fL = st(0.5), stance = nL.stance ? nL : fL, Leff = legLen * (1 - 0.035 * Math.sin(Math.PI * stance.s));
    hipY = ankY - Math.sqrt(Math.max(1, Leff * Leff - stance.x * stance.x));
    lean = ((4 + 2 * Math.cos(4 * Math.PI * phase)) * Math.PI) / 180; fwd = nL.x / (S / 2);
  }
  const chin = hipY + 0.12 * HH - (stout ? 1.15 : 1.1) * HH, Ta = (stout ? 0.36 : 0.31) * 236;
  const sx = 300 + 2 * U + 0.05 * Ta, sy = chin + 0.14 * HH, ang = (-30 * fwd * Math.PI) / 180, a2 = ang + ((16 * Math.PI) / 180) * Math.sign(ang || 1);
  const hx = sx + (Math.sin(ang) + Math.sin(a2)) * aLen * 0.5, hy = sy + (Math.cos(ang) + Math.cos(a2)) * aLen * 0.5;
  const c = Math.cos(lean), s = Math.sin(lean), rx = 300 + (hx - 300) * c - (hy - hipY) * s, ry = hipY + (hx - 300) * s + (hy - hipY) * c;
  return [(rx - 300) * SU * scale, (sole - ry) * SU * scale, (hipY - stand) * SU * scale];
};

// ---------------- small things ----------------
/** a painter's fine brush, 320 x 90 canvas: held at the left end, the wet tip on the right */
export const fxFineBrush = (p: Pen) => {
  p.line([[26, 45], [222, 45]], "#b98a4a", 13); p.poly(B(214, 30, 252, 60), "#c9ccd2", 7);
  p.poly([[252, 30], [300, 40], [312, 45], [300, 50], [252, 60]], "#6a4a34", 7);
};
/** a house painter's brush held upright, 200 x 440 canvas: the grip at (100, 390), wet blue bristles on top */
export const fxWallBrush = (p: Pen) => {
  p.poly(B(82, 230, 118, 420), "#c9a25a", 9); p.poly(B(56, 190, 144, 240), "#8f9ba8", 9);
  p.poly([[50, 190], [150, 190], [158, 40], [42, 40]], "#e9dfc8", 9);
  p.poly([[42, 40], [158, 40], [154, 110], [136, 96], [118, 124], [100, 100], [80, 128], [62, 98], [46, 112]], "#3f8ad0", 8);
  for (const x of [76, 100, 124]) p.stroke([[x, 136], [x, 182]], 4, "#b8ab8c");
};
/** a bucket of blue paint hanging from its wire handle, 340 x 420 canvas: the hand holds the top of the handle (170, 26) */
export const fxBucket = (p: Pen) => {
  const arc: P2[] = []; for (let i = 0; i <= 16; i++) { const a = Math.PI * (1 + i / 16); arc.push([170 + 104 * Math.cos(a), 196 + 168 * Math.sin(a)]); }
  p.stroke(arc, 15, INK); p.stroke(arc, 6, "#c9ccd2");
  p.poly([[66, 196], [274, 196], [252, 400], [88, 400]], "#8f9ba8", 10); p.ell(170, 196, 104, 28, "#3f8ad0", 9);
  p.stroke([[100, 250], [104, 330]], 12, "#3f8ad0"); p.stroke([[234, 236], [232, 280]], 12, "#3f8ad0");
  for (const x of [66, 274]) p.dot(x, 196, 11);
};
/** a suitcase, 460 x 340 canvas (as fxSuitcase in monatoon, with a handle that reads as one): the grip at (230, 34) */
export const fxCase = (p: Pen) => {
  p.poly(B(170, 34, 290, 100), null, 16); p.stroke([[170, 100], [170, 40], [290, 40], [290, 100]], 7, "#6a4424");
  p.poly(B(30, 96, 430, 322), "#8a5a34", 11);
  for (const x of [112, 348]) p.poly(B(x - 17, 96, x + 17, 322), "#6a4424", 6);
  p.poly(B(204, 180, 256, 226), "#d9a93a", 6); for (const [x, y] of [[44, 110], [416, 110], [44, 308], [416, 308]]) p.dot(x, y, 7, "#d9a93a");
};
/** a height gauge: a vertical double arrow (x = 80, tips at y = 14 and 886) and an upright label beside it, 640 x 900 canvas */
export const fxVMeasure = (p: Pen, s: string) => {
  p.stroke([[80, 40], [80, 860]], 18, INK); p.stroke([[80, 40], [80, 860]], 8, YELLOW);
  p.poly([[80, 14], [42, 78], [118, 78]], YELLOW, 8); p.poly([[80, 886], [42, 822], [118, 822]], YELLOW, 8);
  p.stroke([[92, 450], [152, 450]], 10); p.poly(B(150, 362, 622, 538), YELLOW, 10); text(p, s, 386, 456, fit(s, 118, 420), "#2b2430");
};
/** a bare vertical double arrow (tips at y = 14 and 886), 160 x 900 canvas */
export const fxVArrow = (p: Pen) => {
  p.stroke([[80, 40], [80, 860]], 18, INK); p.stroke([[80, 40], [80, 860]], 8, YELLOW);
  p.poly([[80, 14], [42, 78], [118, 78]], YELLOW, 8); p.poly([[80, 886], [42, 822], [118, 822]], YELLOW, 8);
};
/** a pane of glass with a wooden edge, 560 x 760 canvas: tinted so that it shows against a wall (use it on a translucent card) */
export const fxPaneA = (p: Pen) => {
  const g = p.g; g.fillStyle = "rgba(205,232,250,0.42)"; g.fillRect(30, 30, 500, 700);
  p.stroke([[90, 300], [300, 90]], 20, "rgba(255,255,255,0.9)"); p.stroke([[90, 400], [220, 270]], 11, "rgba(255,255,255,0.85)"); p.stroke([[330, 660], [470, 520]], 11, "rgba(255,255,255,0.85)");
  g.lineWidth = 30; g.strokeStyle = INK; g.strokeRect(30, 30, 500, 700); g.lineWidth = 16; g.strokeStyle = "#8a5a34"; g.strokeRect(30, 30, 500, 700);
};
/** a polishing rag, 200 x 160 canvas */
export const fxRag = (p: Pen) => { p.poly([[30, 50], [90, 24], [170, 44], [176, 110], [120, 138], [44, 124]], "#e9e4d6", 9); p.stroke([[70, 60], [130, 100]], 5, "#c9c4b6"); };
/** a width gauge: a horizontal double arrow (y = 270, tips at x = 14 and 886) under an upright label, 900 x 330 canvas */
export const fxHMeasure = (p: Pen, s: string) => {
  p.stroke([[40, 270], [860, 270]], 18, INK); p.stroke([[40, 270], [860, 270]], 8, YELLOW);
  p.poly([[14, 270], [78, 232], [78, 308]], YELLOW, 8); p.poly([[886, 270], [822, 232], [822, 308]], YELLOW, 8);
  p.stroke([[450, 258], [450, 200]], 10); p.poly(B(110, 12, 790, 202), YELLOW, 10); text(p, s, 450, 112, fit(s, 140, 600), "#2b2430");
};
/** the bare wall where she hung, 700 x 920 canvas: a paler patch and four iron hooks (a screwed plate and a bent peg);
 *  `numbers` of them carry a yellow badge, set inside the patch */
export const fxHooksA = (p: Pen, numbers = 0) => {
  const g = p.g; g.fillStyle = "rgba(255,232,214,0.16)"; g.fillRect(40, 40, 620, 840);
  g.setLineDash([22, 16]); g.lineWidth = 8; g.strokeStyle = "rgba(60,20,20,0.6)"; g.strokeRect(40, 40, 620, 840); g.setLineDash([]);
  ([[178, 150], [522, 150], [178, 740], [522, 740]] as P2[]).forEach(([x, y], i) => {
    p.poly([[x - 26, y - 44], [x + 26, y - 44], [x + 26, y + 36], [x - 26, y + 36]], "#3f4650", 8);
    for (const dy of [-28, 22]) { p.dot(x, y + dy, 8, INK); p.dot(x, y + dy, 5, "#aeb6c0"); }
    const hook: P2[] = [[x, y - 4], [x, y + 60]]; for (let k = 0; k <= 8; k++) { const a = (Math.PI * k) / 8; hook.push([x + 27 - 27 * Math.cos(a), y + 60 + 27 * Math.sin(a)]); } hook.push([x + 54, y + 24]);
    p.stroke(hook, 26, INK); p.stroke(hook, 13, "#6b7480"); p.stroke(hook.slice(0, 2), 4, "#aeb6c0");
    if (i < numbers) { const bx = x + (i % 2 ? -116 : 122), by = y + 20; p.ell(bx, by, 40, 40, YELLOW, 7); text(p, String(i + 1), bx, by + 3, 52, "#2b2430"); }
  });
};
/** a notice board on two posts, 900 x 900 canvas (the feet on y = 890): a small line and a big line */
export const fxBoard = (p: Pen, small: string, big: string, fill = "#8a2f33") => {
  for (const x of [170, 730]) p.poly(B(x - 20, 270, x + 20, 890), "#7a5236", 9);
  p.poly(B(16, 16, 884, 300), fill, 12); p.poly(B(40, 40, 860, 276), null, 6);
  text(p, small, 450, 98, fit(small, 56, 760), "#f1d98a"); text(p, big, 450, 196, fit(big, 96, 780), "#ffffff");
};
/** a small sign standing on a desk, 900 x 340 canvas (its foot on y = 334) */
export const fxDeskSign = (p: Pen, small: string, big: string, fill = "#3f6a4a") => {
  p.poly([[250, 334], [300, 280], [600, 280], [650, 334]], "#5a3a26", 9);
  p.poly(B(16, 16, 884, 290), fill, 12); p.poly(B(40, 40, 860, 266), null, 6);
  text(p, small, 450, 94, fit(small, 56, 760), "#f1d98a"); text(p, big, 450, 190, fit(big, 96, 780), "#ffffff");
};
/** the police record card (600 x 720 canvas); prints = false leaves the two rows of fingerprints still empty */
export const fxFileA = (p: Pen, prints: boolean) => {
  fxFile(p);
  if (!prints) { p.poly(B(44, 410, 556, 684), PAPER, 0); for (let r = 0; r < 2; r++) for (let c = 0; c < 5; c++) { const x = 100 + c * 100, y = 470 + r * 120; p.poly(B(x - 40, y - 46, x + 40, y + 46), "#ffffff", 5); } }
};

// ---------------- pictures that go inside a speech bubble (800 x 400 canvas) ----------------
/** "steal the Mona Lisa?": her picture and a question mark */
export const fxBubMonaQ = (p: Pen) => {
  within(p, 150, 10, 289, 380, 700, 920, () => fxMonaA(p));
  text(p, "?", 580, 214, 330, "#d8382f", 26);
};
/** not on canvas: a roll of canvas, crossed out */
export const fxBubCanvasNo = (p: Pen) => {
  within(p, 60, 60, 452, 280, 420, 260, () => fxSupport(p, false));
  within(p, 520, 80, 240, 240, 320, 320, () => fxMark(p, false));
};
/** on a panel of poplar wood: a thick board with its grain, ticked */
export const fxBubPoplar = (p: Pen) => {
  p.poly([[70, 316], [470, 290], [492, 322], [92, 350]], "#8f6a3a", 10);
  p.poly([[60, 84], [460, 58], [470, 290], [70, 316]], "#c9a268", 10);
  p.clip([[66, 90], [454, 64], [464, 284], [76, 310]], () => {
    for (let i = 0; i < 5; i++) { const pts: P2[] = []; for (let x = 50; x <= 480; x += 20) pts.push([x, 112 + i * 44 - x * 0.065 + 7 * Math.sin(x * 0.03 + i * 1.7)]); p.stroke(pts, 5, "#a07c46"); }
    for (const [x, y] of [[170, 150], [360, 230]]) { p.arc(x, y, 20, 10, 0, 360, 4, "#8f6a3a"); p.arc(x, y, 8, 4, 0, 360, 4, "#8f6a3a"); }
  });
  within(p, 530, 70, 240, 240, 320, 320, () => fxMark(p, true));
};
