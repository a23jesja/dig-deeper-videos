// Drawings and small helpers for shots 90-110 of "The Man Who Stole the Mona Lisa" (Florence, the trial, the three
// stories): the cathedral of Florence, the hotel front, the trunk in its states, letters held in two hands, the wall
// telephone, and where a figure's hands are (so that what he carries sits in his hand).
import { Pen, INK, headBlob, curve } from "./toon";
import { Who } from "./castbase";
import { drawMona } from "./monatoon";

type P2 = [number, number];
const TWO = Math.PI * 2, rad = (d: number) => (d * Math.PI) / 180;
const B = (x0: number, y0: number, x1: number, y1: number): P2[] => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
const text = (p: Pen, s: string, x: number, y: number, px: number, fill: string, font = "'Arial Black', Impact, 'Segoe UI Black', sans-serif", weight = 900) => {
  const g = p.g; g.font = `${weight} ${px}px ${font}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = fill; g.fillText(s, x, y);
};
const fit = (s: string, base: number, width: number) => Math.min(base, width / (0.82 * Math.max(1, s.length)));
const PAPER = "#fbf6e6", GOLD = "#d9a93a", WOOD = "#8a5a34", WOOD_D = "#6a4424", SKIN = "#f0c39a";
const SCRIPT = "'Segoe Script', 'Brush Script MT', 'Lucida Handwriting', cursive";
/** a pointed arch standing on y1: (x0..x1) wide, springing at ys, apex at ya */
const arch = (x0: number, x1: number, y1: number, ys: number, ya: number): P2[] => {
  const cx = (x0 + x1) / 2, pts: P2[] = [[x0, y1], [x0, ys]];
  for (let i = 1; i < 8; i++) pts.push([x0 + ((cx - x0) * i) / 8, ys - (ys - ya) * Math.sin((Math.PI / 2) * (i / 8)) ** 0.9]);
  pts.push([cx, ya]);
  for (let i = 7; i >= 1; i--) pts.push([x1 - ((x1 - cx) * i) / 8, ys - (ys - ya) * Math.sin((Math.PI / 2) * (i / 8)) ** 0.9]);
  pts.push([x1, ys], [x1, y1]);
  return pts;
};

// ---------------- where the hands are ----------------
const K = 0.00216; // metres per design unit (castbase SU)
const frame = (who: Who) => {
  const seed = ((who.i * 5 + 3) % 7) + 1, stout = who.o.build === "stout";
  const H = headBlob(seed, 118, 0), W = 2 * H.a, HH = 2 * H.b, u = W / 100;
  return { stout, W, HH, u, torso: stout ? 1.15 : 1.1, legs: stout ? 1.32 : 1.4, tw: stout ? 0.92 : 0.8 };
};
/** The hand of somebody drawn from the front (monaKit P), as [x, y] in metres. kind: "point" (the screen-right arm stretched
 *  out, k = FrontOpts.point), "cheerR" / "cheerL" (screen-right / screen-left hand of a cheer k), "wave" (the raised
 *  screen-right hand), "hangR" / "hangL" (arms down). x = where the person stands. */
export const frontHand = (who: Who, x: number, kind: "point" | "cheerR" | "cheerL" | "wave" | "hangR" | "hangL", k = 1, scale = 1): P2 => {
  const F = frame(who), torsoBot = 975 - F.legs * F.HH, chin = torsoBot - F.torso * F.HH, Ta = ((F.tw / 2) * F.W) / 1.06, sy = chin + 0.12 * F.HH;
  let cx = 0, cy = 0;
  if (kind === "point") { cx = 1.2 * Ta + 40 * F.u * k; cy = sy - 0.04 * F.HH; }
  else if (kind === "cheerR" || kind === "cheerL") { cx = (kind === "cheerR" ? 1 : -1) * (1.18 * Ta + 18 * F.u); cy = sy - 0.62 * F.HH * k; }
  else if (kind === "wave") { cx = 1.18 * Ta + 16 * F.u; cy = sy - 0.6 * F.HH; }
  else { cx = (kind === "hangR" ? 1 : -1) * (1.12 * Ta + 7 * F.u); cy = chin + 1.04 * F.HH; }
  return [x - cx * K * scale, (975 - cy) * K * scale];
};
/** The near hand of somebody drawn from the side (monaKit S / walk): phase = the stride phase, or undefined when he
 *  stands; mirror = he faces screen-left. Returns [x, y] in metres. */
export const sideHand = (who: Who, x: number, phase: number | undefined, mirror: boolean, scale = 1): P2 => {
  const F = frame(who), ankY = 975 - 4 * F.u, legLen = (F.legs + 0.12) * F.HH - 4 * F.u;
  let hipY = ankY - legLen * 0.995, lean = 0, nearFwd = 0;
  if (phase !== undefined) {
    const S = 370, st = (ph: number) => { const c = (((phase + ph) % 1) + 1) % 1; return c < 0.5 ? { x: S / 2 - S * (c / 0.5), stance: true, s: c / 0.5 } : { x: -S / 2 + S * ((c - 0.5) / 0.5) - (S / Math.PI) * Math.sin(TWO * ((c - 0.5) / 0.5)), stance: false, s: (c - 0.5) / 0.5 }; };
    const nL = st(0), fL = st(0.5), stance = nL.stance ? nL : fL, Leff = legLen * (1 - 0.035 * Math.sin(Math.PI * stance.s));
    hipY = ankY - Math.sqrt(Math.max(1, Leff * Leff - stance.x * stance.x)); lean = 4 + 2 * Math.cos(2 * TWO * phase); nearFwd = nL.x / (S / 2);
  }
  const torsoBot = hipY + 0.12 * F.HH, chin = torsoBot - F.torso * F.HH, Ta = (F.stout ? 0.36 : 0.31) * F.W;
  const sx = 300 + 2 * F.u + 0.05 * Ta, sy = chin + 0.14 * F.HH, aLen = 0.95 * F.HH, ang = rad(-30) * nearFwd, a2 = ang + rad(16) * Math.sign(ang || 1);
  const hx = sx + (Math.sin(ang) + Math.sin(a2)) * aLen * 0.5, hy = sy + (Math.cos(ang) + Math.cos(a2)) * aLen * 0.5;
  const r = rad(lean), dx = hx - 300, dy = hy - hipY, rx = 300 + dx * Math.cos(r) - dy * Math.sin(r), ry = hipY + dx * Math.sin(r) + dy * Math.cos(r);
  return [x + (mirror ? 1 : -1) * (rx - 300) * K * scale, (975 - ry) * K * scale];
};

// ---------------- Florence ----------------
/** The cathedral square of Florence, 2900 x 820 canvas (ground at y = 810; the cathedral in the middle, x = 1450): an
 *  unbroken row of houses with red roofs on both sides, the striped marble front of the cathedral with its three doors and
 *  rose window, the red dome behind it, the bell tower. It is a backdrop that closes the square from edge to edge. */
export const fxDuomo = (p: Pen) => {
  const T = "#c9744a", TD = "#a85a36", M = "#f1e8d2", GRN = "#6f8f78", PINK = "#d9a08a", GL = "#5d7f9a", DOOR = "#5a3a26";
  const WALLS = ["#ecd9b4", "#e6c79c", "#f0e2c4", "#e9cfa6", "#f2dcc0"];
  const house = (x: number, w: number, h: number, wall: string, fl: number) => {
    p.poly(B(x, 810 - h, x + w, 810), wall, 9); p.poly([[x - 8, 810 - h], [x + w / 2, 810 - h - 44], [x + w + 8, 810 - h]], T, 9);
    for (let r = 0; r < fl; r++) for (let k = 0; k < 2; k++) { const wx = x + w * (0.28 + 0.44 * k) - 15, wy = 810 - h + 36 + r * ((h - 130) / Math.max(1, fl - 1)); p.poly(B(wx, wy, wx + 30, wy + 50), GL, 5); }
    p.poly(arch(x + w / 2 - 22, x + w / 2 + 22, 810, 750, 728), DOOR, 6);
  };
  const row = (x0: number, ws: number[], hs: number[]) => { let x = x0; ws.forEach((w, i) => { house(x, w, hs[i], WALLS[(i * 3 + (x0 ? 2 : 0)) % 5], hs[i] > 400 ? 4 : 3); x += w; }); };
  row(0, [150, 140, 130, 150, 140, 130, 150, 130, 120], [430, 340, 470, 380, 310, 440, 360, 420, 460]);
  row(1822, [130, 150, 140, 130, 150, 140, 130, 108], [350, 460, 320, 410, 470, 360, 430, 390]);
  p.poly(B(1660, 640, 1706, 810), M, 8);
  p.g.save(); p.g.translate(550, 0);
  // the dome on its drum, behind the front
  p.poly(B(772, 372, 1028, 452), M, 10); for (const x of [820, 900, 980]) p.ell(x, 412, 20, 20, GL, 6);
  const dome: P2[] = []; for (let i = 0; i <= 24; i++) { const a = Math.PI * (1 + i / 24); dome.push([900 + 148 * Math.cos(a), 376 - 196 * Math.abs(Math.sin(a)) ** 0.8]); }
  p.poly(dome, T, 11);
  p.clip(dome, () => { for (const dx of [-100, -50, 0, 50, 100]) p.stroke(curve([900 + dx, 380], [900 + dx * 0.8, 270], [900 + dx * 0.12, 182]), 9, "#f4ead2"); });
  p.poly(dome, null, 11);
  p.poly(B(880, 134, 920, 186), M, 8); p.poly([[872, 138], [900, 100], [928, 138]], TD, 7); p.dot(900, 92, 11, INK); p.dot(900, 92, 8, GOLD);
  // the bell tower
  p.poly(B(1166, 268, 1262, 810), M, 10); p.poly(B(1156, 252, 1272, 276), M, 8);
  for (let i = 0; i < 5; i++) { const y = 300 + i * 100; p.stroke([[1166, y + 84], [1262, y + 84]], 5, GRN); for (const x of [1196, 1232]) p.poly(arch(x - 12, x + 12, y + 66, y + 26, y + 8), i === 4 ? DOOR : GL, 5); }
  // the front: two aisles, the nave with its gable, bands of green and pink marble
  p.poly(B(690, 560, 1110, 810), M, 10); p.poly([[690, 560], [790, 520], [790, 560]], M, 9); p.poly([[1110, 560], [1010, 520], [1010, 560]], M, 9);
  p.poly(B(790, 470, 1010, 810), M, 10); p.poly([[780, 474], [900, 404], [1020, 474]], M, 10); p.poly([[836, 462], [900, 426], [964, 462]], PINK, 6);
  for (const y of [600, 640, 700]) p.stroke([[696, y], [1104, y]], 5, GRN);
  for (const y of [500, 536]) p.stroke([[796, y], [1004, y]], 5, GRN);
  p.stroke([[696, 580], [1104, 580]], 4, PINK); p.stroke([[696, 660], [1104, 660]], 4, PINK);
  p.ell(900, 590, 44, 44, GL, 8); for (let i = 0; i < 8; i++) { const a = (TWO * i) / 8; p.stroke([[900, 590], [900 + 42 * Math.cos(a), 590 + 42 * Math.sin(a)]], 4); } p.ell(900, 590, 10, 10, GOLD, 4);
  for (const x of [740, 1060]) p.ell(x, 632, 22, 22, GL, 6);
  for (const [x, w, ys, ya] of [[740, 30, 742, 706], [900, 44, 716, 668], [1060, 30, 742, 706]] as const) { p.poly(arch(x - w - 12, x + w + 12, 810, ys - 6, ya - 20), PINK, 7); p.poly(arch(x - w, x + w, 810, ys, ya), DOOR, 7); p.stroke([[x, ya + 6], [x, 806]], 4); }
  for (const x of [690, 790, 1010, 1110]) p.poly(B(x - 9, x === 690 || x === 1110 ? 548 : 458, x + 9, 810), M, 6);
  p.g.restore();
};
/** the Italian flag on a tall pole with a stone foot, 520 x 1300 canvas (stands on y = 1290) */
export const fxFlagPole = (p: Pen) => {
  p.poly(B(60, 1236, 180, 1290), "#b9b2a4", 9); p.poly(B(84, 1190, 156, 1240), "#c9c2b4", 8);
  p.poly(B(110, 60, 130, 1194), "#8a6a4a", 7); p.dot(120, 46, 20, INK); p.dot(120, 46, 14, GOLD);
  const band = (x0: number, x1: number, c: string) => { const top: P2[] = [], bot: P2[] = []; for (let i = 0; i <= 6; i++) { const x = x0 + ((x1 - x0) * i) / 6, w = 10 * Math.sin((x - 130) / 46); top.push([x, 84 + w]); bot.push([x, 274 + w]); } p.poly([...top, ...bot.reverse()], c, 0); };
  band(130, 224, "#3f9a55"); band(224, 318, "#ffffff"); band(318, 412, "#d8382f");
  const out: P2[] = [], lo: P2[] = []; for (let i = 0; i <= 18; i++) { const x = 130 + (282 * i) / 18, w = 10 * Math.sin((x - 130) / 46); out.push([x, 84 + w]); lo.push([x, 274 + w]); }
  p.poly([...out, ...lo.reverse()], null, 9);
};
/** The front of the Hotel Tripoli-Italia, 1800 x 1050 canvas (pavement at y = 1040): ochre wall, an open doorway under its
 *  sign (door at x = 614), two windows with shutters and flower boxes, a wall lamp. */
export const fxHotel = (p: Pen) => {
  const WALL = "#e9c98c", STONE = "#b9ad90", GL = "#5d7f9a", SH = "#4f7a5a";
  p.poly(B(10, 10, 1790, 1040), WALL, 12);
  for (let i = 0; i < 9; i++) p.stroke([[30 + i * 210, 700 + (i % 3) * 60], [110 + i * 210, 700 + (i % 3) * 60]], 5, "#d6b474");
  p.poly(B(10, 950, 1790, 1040), STONE, 10); for (let i = 1; i < 12; i++) p.stroke([[10 + i * 150, 954], [10 + i * 150, 1036]], 4, "#9a8f74");
  p.poly(B(10, 400, 1790, 436), STONE, 9);
  // upper windows (mostly above the frame)
  for (const x of [330, 900, 1300, 1660]) { p.poly(B(x - 80, 120, x + 80, 370), GL, 9); p.poly(B(x - 126, 112, x - 80, 378), SH, 7); p.poly(B(x + 80, 112, x + 126, 378), SH, 7); }
  // the doorway: stone surround, dark hall, the two leaves folded back, a step
  p.poly(arch(484, 744, 1040, 700, 640), STONE, 11);
  p.poly(arch(516, 712, 1040, 716, 668), "#c99a62", 9); p.poly(B(520, 990, 708, 1040), "#8a6a4a", 0); p.poly(B(560, 860, 668, 990), "#7a4c2a", 6); p.poly(B(552, 846, 676, 864), "#5a3a26", 5);
  p.poly([[516, 720], [556, 740], [556, 1040], [516, 1040]], "#2f5a4a", 7); p.poly([[712, 720], [672, 740], [672, 1040], [712, 1040]], "#2f5a4a", 7);
  p.dot(548, 890, 8, GOLD); p.dot(680, 890, 8, GOLD);
  p.poly(B(470, 1012, 758, 1040), "#c9c2b4", 8);
  // the sign above the door
  p.poly(B(300, 446, 928, 612), "#2a4f6a", 12); p.poly(B(322, 468, 906, 590), null, 5);
  text(p, "HOTEL", 614, 500, 44, "#f1d98a"); text(p, "TRIPOLI-ITALIA", 614, 554, fit("TRIPOLI-ITALIA", 76, 540), "#ffffff");
  for (const x of [360, 868]) p.stroke([[x, 436], [x, 446]], 8);
  // ground-floor windows
  for (const x of [1110, 1480]) {
    p.poly(B(x - 100, 610, x + 100, 890), "#f4efe0", 10); p.poly(B(x - 84, 626, x + 84, 874), GL, 6); p.stroke([[x, 626], [x, 874]], 7, "#f4efe0"); p.stroke([[x - 84, 740], [x + 84, 740]], 7, "#f4efe0");
    p.poly(B(x - 156, 600, x - 100, 900), SH, 8); p.poly(B(x + 100, 600, x + 156, 900), SH, 8);
    for (const sx of [x - 128, x + 128]) for (let k = 0; k < 6; k++) p.stroke([[sx - 18, 630 + k * 46], [sx + 18, 630 + k * 46]], 4, "#3a5f44");
    p.poly(B(x - 110, 890, x + 110, 930), "#a0522d", 8); for (let k = 0; k < 7; k++) { p.ell(x - 90 + k * 30, 880, 15, 13, "#3f8a4a", 4); p.dot(x - 90 + k * 30, 872, 7, k % 2 ? "#d8382f" : "#f2c63a"); }
  }
  // a lamp on a bracket, the house number
  p.poly(B(196, 612, 214, 700), "#2b2b30", 5); p.stroke([[214, 636], [270, 636], [270, 656]], 8); p.stroke([[214, 676], [250, 640]], 6);
  p.poly([[244, 692], [296, 692], [286, 760], [254, 760]], "#f6e7b0", 7); p.stroke([[270, 694], [270, 758]], 4); p.poly([[234, 692], [270, 654], [306, 692]], "#2b2b30", 6); p.poly(B(250, 760, 290, 772), "#2b2b30", 5);
  p.poly(B(790, 700, 850, 752), "#f4efe0", 6); text(p, "2", 820, 728, 38, "#2a4f6a");
};

// ---------------- the trunk ----------------
// One trunk for the whole film: brown wood like the trunk in Paris, darker straps, a brass lock and brass corners.
const TK = "#8a5a34", TK_L = "#9a6a40", TK_D = "#6a4424", STRAP = "#5a3a22";
const trunkBody = (p: Pen, x0: number, y0: number, x1: number, y1: number) => {
  p.poly(B(x0, y0, x1, y1), TK, 11);
  const w = x1 - x0; for (let i = 1; i < 3; i++) p.stroke([[x0 + 8, y0 + ((y1 - y0) * i) / 3], [x1 - 8, y0 + ((y1 - y0) * i) / 3]], 4, TK_D);
  for (const x of [x0 + w * 0.16, x1 - w * 0.16]) p.poly(B(x - 0.032 * w, y0, x + 0.032 * w, y1), STRAP, 6);
  for (const x of [x0, x1]) { p.poly(B(x - (x === x0 ? 0 : 0.04 * w), y1 - 0.05 * w, x + (x === x0 ? 0.04 * w : 0), y1), GOLD, 5); }
  p.poly(B(x0, y0, x1, y1), null, 11);
};
/** Peruggia's trunk, 900 x 760 canvas (stands on y = 750; the body is 820 wide: at a card width of 0.99 m the trunk is
 *  0.9 m wide). state: 0 shut, with its leather handle on top (the top of the handle at y = 276) · 1 open, his clothes on
 *  top · 2 the false bottom lifted out: the parcel in its cloth lies in the trunk · 3 unwrapped: the cloth hangs over the
 *  edge and the false bottom leans inside the lid */
export const fxTrunk = (p: Pen, state = 0) => {
  if (state === 0) {
    p.arc(450, 362, 92, 84, 180, 360, 30, INK); p.arc(450, 362, 92, 84, 180, 360, 16, "#5a3a26");
    trunkBody(p, 40, 440, 860, 748); p.poly([[40, 440], [74, 356], [826, 356], [860, 440]], TK_L, 11);
    for (const x of [172, 728]) p.poly([[x - 26, 440], [x - 22, 356], [x + 22, 356], [x + 26, 440]], STRAP, 6);
    p.poly(B(408, 410, 492, 488), GOLD, 8); p.dot(450, 452, 10, INK);
    return;
  }
  // the lid, standing open, and its lining
  p.poly([[60, 420], [96, 40], [804, 40], [840, 420]], TK_D, 11); p.poly([[96, 406], [126, 72], [774, 72], [804, 406]], "#c9b48a", 6);
  if (state === 3) { p.poly([[150, 414], [176, 110], [600, 96], [640, 410]], "#a8824f", 9); for (let i = 1; i < 4; i++) p.stroke([[150 + i * 122, 410], [176 + i * 106, 108]], 4, "#7a5a34"); p.poly(B(340, 236, 430, 262), "#5a3a26", 5); }
  // the inside, seen from a little above
  p.poly(B(60, 400, 840, 520), "#2f2a26", 9);
  if (state === 1) {
    p.poly([[110, 500], [120, 402], [372, 386], [388, 500]], "#f1ecdc", 8); p.stroke([[244, 394], [250, 500]], 5, "#c9c4b6"); p.poly([[196, 392], [244, 432], [292, 390]], "#dcd7c8", 5);
    p.poly([[400, 500], [410, 420], [590, 404], [612, 500]], "#5a6f8a", 8); p.stroke([[420, 452], [600, 440]], 5, "#465a72");
    p.poly([[628, 500], [640, 440], [700, 416], [790, 432], [800, 500]], "#6a4a34", 8); p.ell(742, 446, 34, 20, "#2b2026", 6);
  } else if (state === 2) {
    const cloth: P2[] = [[214, 500], [206, 420], [250, 384], [430, 394], [640, 380], [694, 420], [688, 500]];
    p.poly(cloth, "#e6dcc2", 10);
    p.clip(cloth, () => { for (const x of [300, 450, 600]) p.stroke(curve([x, 384], [x - 16, 440], [x + 6, 500]), 5, "#b8a880"); });
    p.stroke([[208, 448], [692, 440]], 9, INK); p.stroke([[208, 448], [692, 440]], 5, WOOD); p.stroke(curve([452, 390], [446, 440], [456, 500]), 9, INK); p.stroke(curve([452, 390], [446, 440], [456, 500]), 5, WOOD);
    p.ell(450, 444, 15, 13, WOOD, 5); p.stroke([[450, 444], [484, 414]], 5, WOOD); p.stroke([[450, 444], [420, 416]], 5, WOOD);
  }
  // the front of the trunk
  trunkBody(p, 40, 500, 860, 748); p.poly(B(408, 500, 492, 560), GOLD, 8); p.dot(450, 530, 9, INK);
  if (state === 3) { const c: P2[] = [[236, 470], [300, 446], [470, 458], [640, 444], [676, 476], [660, 590], [600, 640], [540, 600], [470, 660], [380, 610], [300, 650], [250, 590]]; p.poly(c, "#e6dcc2", 10); p.clip(c, () => { for (const x of [330, 450, 580]) p.stroke(curve([x, 452], [x - 14, 540], [x + 8, 650]), 5, "#b8a880"); }); p.poly(c, null, 10); }
};
/** the false bottom of the trunk: a thin board with a finger hole, 560 x 380 canvas */
export const fxFalseBottom = (p: Pen) => {
  p.poly(B(20, 20, 540, 360), "#a8824f", 11); for (let i = 1; i < 4; i++) p.stroke([[20 + i * 130, 26], [20 + i * 130, 354]], 5, "#7a5a34");
  p.ell(280, 190, 34, 20, "#3a2616", 6); for (const [x, y] of [[50, 50], [510, 50], [50, 330], [510, 330]]) p.dot(x, y, 7, "#5a3a26");
};

// ---------------- letters ----------------
/** an envelope with a stamp, a postmark and an address, 320 x 240 canvas */
export const fxEnvelope = (p: Pen) => {
  p.poly(B(16, 30, 304, 220), PAPER, 10);
  for (const [y, x1] of [[120, 190], [150, 210], [180, 160]]) p.stroke([[70, y], [x1, y]], 7, "#4a4458");
  p.poly(B(238, 48, 286, 104), "#c8553a", 6); p.ell(262, 76, 11, 13, "#f4d9c0", 0);
  p.arc(214, 86, 26, 26, 0, 360, 5, "#4a4458"); for (const dy of [-8, 2, 12]) p.stroke([[170, 86 + dy], [206, 86 + dy]], 4, "#4a4458");
};
/** a small pile of opened letters and envelopes lying on a table, 520 x 300 canvas (lies on y = 290) */
export const fxLetterPile = (p: Pen) => {
  const sheet = (pts: P2[], lines: [P2, P2][]) => { p.poly(pts, PAPER, 9); for (const l of lines) p.stroke(l, 5, "#4a4458"); };
  sheet([[30, 286], [70, 190], [330, 176], [318, 286]], [[[96, 214], [296, 202]], [[90, 240], [300, 228]], [[84, 264], [230, 256]]]);
  sheet([[190, 286], [176, 150], [440, 130], [486, 276]], [[[212, 180], [420, 162]], [[216, 208], [434, 190]], [[220, 236], [444, 218]], [[224, 262], [380, 250]]]);
  p.poly([[250, 286], [276, 196], [500, 210], [490, 286]], PAPER, 9); p.stroke([[276, 196], [382, 252], [500, 210]], 6);
  p.poly(B(440, 226, 478, 266), "#c8553a", 5);
};
type LetterOpts = { cuff: string; mona?: boolean; flag?: boolean; sign?: string; quote?: string };
/** A letter held up in two hands, 760 x 1040 canvas (the sleeves run off its lower edge, which belongs below the frame): handwriting, and step by step a little sketch of the painting, an
 *  arrow to the Italian flag, a line of large handwriting (quote, "LINE|LINE") and the signature. The lower fifth of the
 *  sheet stays empty (the caption sits there). cuff = the colour of the reader's sleeves. */
export const fxLetterHands = (p: Pen, o: LetterOpts) => {
  // the sleeves and the backs of the hands behind the sheet
  for (const s of [-1, 1]) { const X = (x: number) => 380 + s * x; p.poly([[X(214), 1040], [X(246), 846], [X(262), 836], [X(352), 836], [X(368), 850], [X(404), 1040]], o.cuff, 11); p.poly([[X(250), 852], [X(256), 828], [X(356), 828], [X(364), 852]], "#f4efe0", 8); p.ell(X(300), 806, 52, 34, SKIN, 9); }
  p.poly(B(96, 20, 664, 960), PAPER, 11);
  const wavy = (y: number, x0: number, x1: number) => { const pts: P2[] = []; for (let x = x0; x <= x1; x += 14) pts.push([x, y + 5 * Math.sin(x * 0.21 + y)]); p.stroke(pts, 6, "#4a4458"); };
  wavy(80, 140, 420); wavy(126, 140, 620); wavy(170, 140, 620);
  if (o.quote) o.quote.split("|").forEach((l, i, a) => { const y = 326 + (i - (a.length - 1) / 2) * 96; text(p, l, 380, y, fit(l, 84, 500) * 1.25, "#2a3f7a", SCRIPT, 700); if (i === a.length - 1) p.stroke([[190, y + 52], [570, y + 44]], 6, "#2a3f7a"); });
  else {
    const rows = [224, 268, 312, 356, 400, 444];
    if (o.mona) { p.poly(B(146, 214, 304, 444), "#b08a56", 8); drawMona(p, 157, 225, 136, 208); }
    if (o.flag) {
      p.stroke([[330, 330], [410, 330]], 12); p.poly([[404, 300], [452, 330], [404, 360]], INK, 0);
      ["#3f9a55", "#ffffff", "#d8382f"].forEach((c, i) => p.poly(B(476 + i * 44, 266, 520 + i * 44, 394), c, 0)); p.poly(B(476, 266, 608, 394), null, 8);
    }
    rows.forEach((y, i) => { if (o.flag) return; wavy(y, o.mona ? 336 : 140, i === rows.length - 1 ? (o.mona ? 470 : 380) : 620); });
  }
  wavy(492, 140, 600); wavy(534, 140, 330);
  if (o.sign) { text(p, o.sign, 458, 596, fit(o.sign, 96, 330) * 1.2, "#2a3f7a", SCRIPT, 700); p.stroke([[300, 648], [610, 638]], 6, "#2a3f7a"); }
  // the thumbs on the sheet
  for (const s of [-1, 1]) { const x = 380 + s * 250; p.ell(x, 800, 50, 26, SKIN, 9, 0, 360, s * 28); p.arc(x - s * 28, 790, 13, 9, s > 0 ? 200 : 250, s > 0 ? 290 : 340, 4, "#c98f6a"); }
};

// ---------------- small things ----------------
/** a magnifying glass held by its handle at the lower left, 340 x 340 canvas (the hand takes the end of the handle at 24, 316) */
export const fxLensL = (p: Pen) => { p.line([[130, 210], [24, 316]], WOOD_D, 22); p.ell(200, 140, 112, 112, "rgba(200,230,255,0.55)", 0); p.arc(200, 140, 112, 112, 0, 360, 22, INK); p.arc(200, 140, 112, 112, 0, 360, 10, "#c9ccd2"); p.stroke([[150, 120], [196, 70]], 12, "rgba(255,255,255,0.8)"); };
/** the bare panel standing high on a gallery easel, 640 x 1100 canvas (feet on y = 1090; the panel from y = 200 to 600) */
export const fxEaselPanel = (p: Pen) => {
  p.line([[320, 60], [320, 610]], WOOD_D, 18); p.line([[320, 50], [112, 1084]], WOOD, 22); p.line([[320, 50], [528, 1084]], WOOD, 22);
  p.poly(B(150, 600, 490, 636), WOOD, 9); p.poly(B(240, 172, 400, 202), WOOD, 8);
  p.poly(B(180, 200, 460, 600), "#b08a56", 10); drawMona(p, 193, 213, 254, 374);
};
/** A wall telephone, 400 x 460 canvas: a wooden box with one bell on top, a speaking horn and a small shelf (box centre
 *  at 310, 230). off = the earpiece lifted off its hook and held at (60, 250), its cord running back to the box. */
export const fxWallPhone = (p: Pen, off = false) => {
  p.poly(B(230, 60, 390, 420), "#7a4c2a", 11); p.poly(B(246, 150, 374, 300), "#8a5a34", 6);
  p.ell(310, 78, 44, 40, "#c9ccd2", 9, 180, 360); p.poly(B(262, 76, 358, 92), "#8f9ba8", 6); p.dot(310, 110, 9, INK);
  p.poly([[292, 196], [328, 196], [350, 262], [270, 262]], "#2b2b30", 8); p.poly(B(302, 176, 318, 198), "#2b2b30", 5);
  p.poly(B(246, 330, 374, 352), "#5a3a26", 6); p.stroke([[390, 230], [398, 230], [398, 270]], 9); p.dot(398, 276, 9, INK);
  p.stroke([[230, 176], [196, 176], [196, 160]], 10); p.stroke([[196, 176], [196, 192]], 10);
  const ear = (x: number, y: number, a: number) => { p.rot = [a, x, y]; p.poly(B(x - 17, y - 44, x + 17, y + 36), "#2b2b30", 8); p.poly([[x - 26, y - 62], [x + 26, y - 62], [x + 17, y - 44], [x - 17, y - 44]], "#3a3f48", 7); p.rot = null; };
  const cord = (c: P2[]) => { p.stroke(c, 10, INK); p.stroke(c, 5, "#6a4a2c"); };
  if (off) { cord(curve([64, 286], [150, 404], [238, 380])); ear(60, 250, -0.25); }
  else { cord(curve([196, 258], [204, 372], [238, 388])); ear(196, 222, 0); }
};
/** the front of a washstand: two drawers with brass knobs, 520 x 520 canvas */
export const fxDrawers = (p: Pen) => {
  p.poly(B(8, 8, 512, 512), WOOD, 11);
  for (const y of [44, 276]) { p.poly(B(40, y, 480, y + 196), "#9a6a40", 7); for (const x of [150, 370]) { p.dot(x, y + 98, 17, INK); p.dot(x, y + 98, 12, GOLD); } }
};
/** a wash jug standing in its basin, 320 x 330 canvas (stands on y = 322) */
export const fxJug = (p: Pen) => {
  p.poly([[30, 250], [290, 250], [250, 320], [70, 320]], "#f4efe0", 10); p.stroke([[52, 272], [268, 272]], 6, "#5d7f9a");
  p.arc(214, 150, 46, 60, -80, 80, 22, INK); p.arc(214, 150, 46, 60, -80, 80, 10, "#f4efe0");
  p.poly([[112, 250], [96, 170], [118, 104], [108, 60], [92, 40], [128, 46], [196, 46], [186, 104], [212, 170], [196, 250]], "#f4efe0", 10);
  p.stroke([[100, 170], [208, 170]], 7, "#5d7f9a"); p.stroke([[114, 104], [190, 104]], 5, "#5d7f9a");
};
/** a card that points the way to Italy: an arrow to the screen-left and the tricolour, 520 x 300 canvas */
export const fxToItaly = (p: Pen) => {
  p.poly(B(14, 14, 506, 286), "#f6efd8", 11);
  p.stroke([[214, 150], [74, 150]], 36, INK); p.poly([[40, 150], [112, 88], [112, 212]], INK, 0); p.stroke([[212, 150], [100, 150]], 18, "#ffe14d"); p.poly([[58, 150], [104, 110], [104, 190]], "#ffe14d", 0);
  ["#3f9a55", "#ffffff", "#d8382f"].forEach((c, i) => p.poly(B(258 + i * 70, 70, 328 + i * 70, 230), c, 0)); p.poly(B(258, 70, 468, 230), null, 9);
};
/** An arm drawn over something that is carried, from the shoulder down to the hand that grips it: 400 x 400 canvas at
 *  1.5 mm a unit (card width 0.6 m), centred half-way. (dx, dy) = hand minus shoulder in metres, +x = screen-left. */
export const fxArmOver = (p: Pen, col: string, dx: number, dy: number, bend = 0.14) => {
  const k = 1 / 0.0015, a: P2 = [200 + (dx / 2) * k, 200 + (dy / 2) * k], b: P2 = [200 - (dx / 2) * k, 200 - (dy / 2) * k], l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, sg = dx >= 0 ? 1 : -1;
  const c = curve(a, [200 + ((b[1] - a[1]) / l) * bend * l * sg, 200 - ((b[0] - a[0]) / l) * bend * l * sg], b);
  p.stroke(c, 29, INK); p.stroke(c, 17, col); p.dot(b[0], b[1], 20, INK);
};
/** a pair of handcuffs hanging from a hand, 200 x 360 canvas (held at the top, 100, 20) */
export const fxCuffs = (p: Pen) => {
  for (const [x, y] of [[70, 110], [130, 250]] as P2[]) { p.arc(x, y, 46, 46, 0, 360, 26, INK); p.arc(x, y, 46, 46, 0, 360, 13, "#c9ccd2"); }
  p.stroke([[100, 20], [84, 62]], 12, INK); p.stroke([[100, 20], [84, 62]], 5, "#c9ccd2"); p.stroke([[92, 152], [112, 208]], 12, INK); p.stroke([[92, 152], [112, 208]], 5, "#c9ccd2");
};
/** what Peruggia dreams of: a fan of banknotes and a pile of coins, 420 x 300 canvas */
export const fxLire = (p: Pen) => {
  for (const [a, c] of [[-0.42, "#a9d08a"], [-0.14, "#bfe0a8"], [0.14, "#a9d08a"]] as [number, string][]) { p.rot = [a, 170, 250]; p.poly(B(80, 60, 260, 170), c, 8); p.ell(170, 115, 30, 30, "#8fc07a", 5); p.rot = null; }
  for (let i = 0; i < 4; i++) p.ell(330, 250 - i * 26, 56, 18, i % 2 ? "#e9b93a" : "#f2cf5a", 7);
};
/** a carabiniere's hat (the picture in the bubble of the man who telephones the police), 360 x 240 canvas */
export const fxPoliceHat = (p: Pen) => {
  p.poly([[20, 200], [70, 110], [130, 50], [230, 50], [290, 110], [340, 200], [180, 170]], "#1c2740", 11);
  p.dot(180, 112, 30, INK); p.dot(180, 112, 24, "#c8312b"); p.dot(180, 112, 15, "#f4efe0"); p.dot(180, 112, 7, "#3f8a4a");
};
/** the glazed pane of the street door of the shop: glazing bars, the street beyond, a lace half-curtain, 400 x 400 canvas */
export const fxDoorPane = (p: Pen) => {
  p.poly(B(10, 10, 390, 390), "#a9cfe6", 10); p.poly(B(14, 250, 386, 386), "#d9cdb0", 0); p.poly(B(40, 150, 150, 250), "#e6c79c", 4); p.poly([[30, 150], [95, 110], [160, 150]], "#c9744a", 4); p.poly(B(230, 120, 360, 250), "#ecd9b4", 4); p.poly([[220, 120], [295, 76], [370, 120]], "#c9744a", 4);
  p.poly(B(14, 200, 386, 386), "rgba(250,246,232,0.82)", 0); for (let i = 0; i < 9; i++) p.arc(36 + i * 41, 200, 20, 16, 180, 360, 5, "#f4efe0");
  p.stroke([[200, 12], [200, 388]], 12, "#5a3a26"); p.stroke([[12, 200], [388, 200]], 12, "#5a3a26"); p.poly(B(10, 10, 390, 390), null, 12);
};
