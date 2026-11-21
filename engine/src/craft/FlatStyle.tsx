// The flat 2D style test (Jesper, 21 Nov 2026): one sheet per direction (designs/flat.ts). Sir Digsworth from the front and from the
// side, Ada (the supporting figure) the same, a scene on a flat painted background with a ground line, his six faces, and all of it at
// phone size: the scene in a frame as large as a phone's screen on this sheet, the figures and faces as they are in a medium shot there.
// The skeleton and the gestures are the engine's own (rig.ts POSES, stage/gestures.ts GESTURES), unchanged.
//   PROPS='{"audio":false}' node scripts/stills.mjs FlatStyle out/craft/flat_ 0-2 1 png
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Ink } from "./ink";
import { solve, POSES, Pose, Props } from "./rig";
import { Design, FigOpts, Face, Who } from "./designs/common";
import { FLAT, FLAT_SPECS, FLAT_LINES, OTHER_NAME } from "./designs/flat";
import { GESTURES } from "./stage/gestures";

export const FSW = 2700, FSH = 1800, FLAT_FRAMES = 4;
const BG = "#f3ecdc", PANEL = "#e7dcc4", TXT = "#2b1d12", SUB = "#5d4a33", INK = "#241726";
type G = CanvasRenderingContext2D;
const tall = (P: Props) => P.thigh + P.shin + P.ankle + P.spine + P.neck + P.head * 1.45;
const headMid = (P: Props) => P.thigh + P.shin + P.ankle + P.spine + P.neck + P.head * 0.5;

const fig = (g: G, D: Design, who: Who, pose: Pose, yaw: number, o: FigOpts, x: number, y: number, sc: number, clip?: number[]) => {
  const sk = solve(D.props(who), pose, yaw);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  if (clip) { g.beginPath(); g.rect(clip[0], clip[1], clip[2], clip[3]); g.clip(); }
  g.translate(x, y); g.scale(sc, sc); D.draw(new Ink(g, D.ol), sk, { who, ...o }); g.restore();
};
const text = (g: G, t: string, x: number, y: number, px: number, wt = 700, align: CanvasTextAlign = "center", col = TXT) => {
  g.setTransform(1, 0, 0, 1, 0, 0); g.font = `${wt} ${px}px Arial`; g.textAlign = align; g.fillStyle = col; g.fillText(t, x, y); };
const box = (g: G, x: number, y: number, w: number, h: number, col: string) => { g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = col; g.fillRect(x, y, w, h); };

// ---------------- the painted backgrounds (in a 1080 x 1920 frame; the ground line at 1500) ----------------
const GY = 1500;
type Sh = [number, number][];
const poly = (g: G, pts: Sh, col: string, w = 8) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fillStyle = col; g.fill(); if (w) { g.lineWidth = w; g.lineJoin = "round"; g.strokeStyle = INK; g.stroke(); } };
const circ = (g: G, x: number, y: number, r: number, col: string, w = 8) => { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = col; g.fill(); if (w) { g.lineWidth = w; g.strokeStyle = INK; g.stroke(); } };
const rect = (g: G, x: number, y: number, w: number, h: number, col: string, lw = 8) => poly(g, [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], col, lw);
/** a cloud: three puffs on a rounded base, one outline round the whole (the ink drawn under all the parts, then all the fills) */
const cloud = (g: G, x: number, y: number, s: number) => {
  const parts: ((c: G) => void)[] = [(c) => c.arc(x, y, 70 * s, 0, Math.PI * 2), (c) => c.arc(x + 80 * s, y - 20 * s, 90 * s, 0, Math.PI * 2), (c) => c.arc(x + 170 * s, y, 66 * s, 0, Math.PI * 2),
    (c) => { c.moveTo(x, y + 66 * s); c.lineTo(x + 170 * s, y + 66 * s); c.arc(x + 170 * s, y + 33 * s, 33 * s, Math.PI / 2, -Math.PI / 2, true); c.lineTo(x, y); c.arc(x, y + 33 * s, 33 * s, -Math.PI / 2, Math.PI / 2, true); }];
  for (const pass of [0, 1]) for (const p of parts) { g.beginPath(); p(g); g.closePath(); if (pass) { g.fillStyle = "#ffffff"; g.fill(); } else { g.lineWidth = 16; g.lineJoin = "round"; g.strokeStyle = INK; g.stroke(); } }
};
const groundLine = (g: G, col: string) => { rect(g, -20, GY, 1120, 440, col, 0); g.beginPath(); g.moveTo(-20, GY); g.lineTo(1100, GY); g.lineWidth = 12; g.strokeStyle = INK; g.stroke(); };
const BGS: ((g: G) => void)[] = [
  // A: a dig in the desert, noon
  (g) => { rect(g, -20, -20, 1120, 1960, "#f6e2b3", 0); circ(g, 820, 380, 110, "#ffcf5c");
    poly(g, [[-20, 1180], [120, 1180], [170, 1060], [330, 1060], [380, 1180], [640, 1200], [700, 1110], [860, 1110], [930, 1210], [1100, 1210], [1100, 1520], [-20, 1520]], "#e0a868");
    poly(g, [[-20, 1330], [260, 1250], [560, 1320], [820, 1270], [1100, 1330], [1100, 1520], [-20, 1520]], "#eab676");
    groundLine(g, "#d39350");
    poly(g, [[60, 1560], [330, 1560], [300, 1640], [90, 1640]], "#8a5a33");
    g.lineCap = "round"; g.beginPath(); g.moveTo(960, 1520); g.lineTo(1010, 1290); g.lineWidth = 34; g.strokeStyle = INK; g.stroke(); g.lineWidth = 18; g.strokeStyle = "#9c6a3c"; g.stroke();
    poly(g, [[930, 1500], [990, 1500], [1000, 1590], [960, 1620], [920, 1590]], "#b9c2c8"); },
  // B: a London street at dusk
  (g) => { rect(g, -20, -20, 1120, 1960, "#b8cde0", 0); circ(g, 200, 330, 70, "#f6f1dc");
    for (const [x, w, h] of [[-30, 300, 820], [250, 260, 640], [500, 330, 900], [820, 300, 700]]) { rect(g, x, GY - h, w, h + 20, "#8a99ab");
      for (let yy = GY - h + 70; yy < GY - 170; yy += 150) for (let xx = x + 50; xx < x + w - 60; xx += 110) rect(g, xx, yy, 56, 84, "#f3d98b", 6); }
    for (const [x, w] of [[30, 140], [560, 160]]) rect(g, x, GY - 230, w, 230, "#5b4a52");
    groundLine(g, "#a9a7a0"); rect(g, -20, GY + 120, 1120, 26, "#8d8b85", 6);
    // (the lamp at the right edge: in the middle it stood behind Sir's head as he ran, the v2 sheet)
    g.beginPath(); g.moveTo(1030, GY); g.lineTo(1030, 980); g.lineWidth = 34; g.strokeStyle = INK; g.stroke(); g.lineWidth = 18; g.strokeStyle = "#3b4048"; g.stroke();
    poly(g, [[970, 980], [1090, 980], [1070, 900], [990, 900]], "#ffe08a"); poly(g, [[960, 900], [1100, 900], [1030, 850]], "#3b4048"); },
  // C: a harbour, morning
  (g) => { rect(g, -20, -20, 1120, 1960, "#9ad3e6", 0);
    for (const [x, y, s] of [[200, 330, 1], [760, 520, 0.8]]) cloud(g, x, y, s);
    rect(g, -20, 1160, 1120, 360, "#2f7fb3");
    poly(g, [[520, 1150], [900, 1150], [860, 1220], [560, 1220]], "#6b3b2a");
    g.beginPath(); g.moveTo(700, 1150); g.lineTo(700, 880); g.lineWidth = 10; g.strokeStyle = INK; g.stroke();
    poly(g, [[710, 900], [830, 1120], [710, 1120]], "#f4ecd8"); poly(g, [[690, 930], [600, 1120], [690, 1120]], "#f4ecd8");
    groundLine(g, "#b07a46");
    rect(g, 820, GY - 190, 200, 190, "#c99a5c"); rect(g, 860, GY - 330, 140, 140, "#d8ad6e");
    poly(g, [[70, GY], [70, GY - 90], [90, GY - 120], [150, GY - 120], [170, GY - 90], [170, GY]], "#3b3b44"); },
];
/** the run of the action scene (Jesper choosing A, 21 Nov: more forward lean and a clear stride, the back foot pushing off): rig.ts run with
 *  the body leaning 27 degrees into it, the back leg straight on its toe pushing off, the front knee bent high */
const RUN: Pose = { ...POSES.run, lean: 34, pz: 0.16, legL: { z: -1.0, pitch: 66, toe: 4 }, legR: { th: [80, 2], sh: [-22, 0], pitch: 10 }, armL: [[46, 8], [126, 6]], armR: [[-60, 12], [10, 6]], head: [0, -14, 0] };
/** the scene, an action: Sir runs, his cap lifting off in the wind, startled; Ada points the way (rig.ts run, the gesture library's point).
 *  (v1: Sir explaining and Ada shrugging stood still, and their hands met in the middle of the picture, the review of 21 Nov) */
const scene = (g: G, i: number, x: number, y: number, w: number) => {
  const D = FLAT[i], u = w / 1080, sir = D.props("sir"), sc = 930 / tall(sir);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.beginPath(); g.rect(x, y, w, w * 16 / 9); g.clip(); g.translate(x, y); g.scale(u, u); BGS[i](g); g.restore();
  const pt = GESTURES.point, clip = [x, y, w, w * 16 / 9];
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.beginPath(); g.rect(clip[0], clip[1], clip[2], clip[3]); g.clip(); g.translate(x, y); g.scale(u, u);
  for (const [dx, dy, r] of [[150, -26, 34], [96, -14, 24], [52, -6, 15]]) circ(g, 620 - dx, GY + dy, r, "#efe6d2", 6);      // (dust kicked up behind him: flat puffs)
  g.restore();
  // (Ada behind him on the left points the way he runs, to the right: the two apart, no hand near the other figure)
  fig(g, D, "baker", pt.pose("ahead", 0) as Pose, 80, { ...pt.hands, face: { brow: 0.5, mouth: 0.4, smile: 0.2, gaze: [0.6, -0.1] } }, x + 210 * u, y + GY * u, sc * u * 0.82, clip);
  fig(g, D, "sir", RUN, 88, { handL: "fist", handR: "fist", capLift: 0.4, face: { wide: 1, brow: 1, mouth: 0.55, smile: -0.3, pupil: 0.6, gaze: [0.6, 0] } }, x + 720 * u, y + GY * u, sc * u * 0.86, clip);
  g.setTransform(1, 0, 0, 1, 0, 0); g.lineWidth = 3; g.strokeStyle = INK; g.strokeRect(x, y, w, w * 16 / 9);
};

const MINER: [string, string, Face][] = [
  ["GLAD", "leende, glad blick", { smile: 1, mouth: 0.55, brow: 0.5 }],
  ["RÄDD", "stora ögon, små pupiller, ledsna bryn", { wide: 1, brow: 1, sad: 0.6, pupil: 0.5, mouth: 0.5, smile: -0.7 }],
  ["ARG", "bryn ned mot näsan, sammanbitna tänder", { brow: -1, lid: 0.32, smile: -0.5, teeth: 1, mouth: 0.42 }],
  ["BLUNDANDE", "lugnt slutna ögon", { lid: 1, smile: 0.15 }],
  ["GRÅTANDE", "tårar, mungiporna ned", { tear: 1, sad: 1, smile: -1, lid: 0.45, mouth: 0.35, gaze: [0, 0.3] }],
  ["SJÄLVBELÅTEN", "halvblick åt sidan, ena mungipan upp", { lid: 0.55, smirk: 1, brow: -0.25, smile: 0.15, gaze: [0.7, 0] }],
];
/** a face in a cell: head height hpx */
const bust = (g: G, D: Design, face: Face, cx: number, cy: number, hpx: number, cw: number, ch: number, col = PANEL) => {
  const P = D.props("sir"), hs = hpx / P.head;
  box(g, cx - cw / 2, cy - ch / 2, cw, ch, col);
  fig(g, D, "sir", POSES.stand, 12, { face }, cx, cy + 22 * (hpx / 220) + headMid(P) * hs, hs, [cx - cw / 2, cy - ch / 2, cw, ch]);
};

const sheet = (g: G, i: number, v3 = false) => {
  const D = FLAT[i], spec = FLAT_SPECS[i], sir = D.props("sir");
  box(g, 0, 0, FSW, FSH, BG);
  text(g, `RIKTNING ${D.name.toUpperCase()}${v3 ? "  (v3: munnen syns alltid, pipan i munnen från sidan, tydligare löpsteg)" : ""}`, 40, 72, v3 ? 40 : 52, 800, "left");
  text(g, FLAT_LINES[i], 40, 112, 25, 400, "left", SUB);
  text(g, "Platt 2D ritad i kod: jämn tjock kontur, platta färger, inget mönster, inget ljus. Skelettet och gestbiblioteket är motorns egna, oförändrade.", 40, 146, 21, 400, "left", SUB);
  // the turnaround: Sir and Ada, front and side
  box(g, 40, 170, 1400, 880, PANEL);
  const sc = Math.min(800 / tall(sir), 330 / (2 * spec.faceW)), FY = 990;
  box(g, 40, FY, 1400, 60, "#d8c9a6");
  fig(g, D, "sir", POSES.stand, 0, {}, 205, FY, sc);
  fig(g, D, "sir", POSES.standSide, 90, {}, 530, FY, sc);
  fig(g, D, "baker", POSES.stand, 0, {}, 945, FY, sc);
  fig(g, D, "baker", POSES.standSide, 90, {}, 1265, FY, sc);
  ([["SIR FRAMIFRÅN", 205], ["SIR FRÅN SIDAN", 550], [`${OTHER_NAME.split(",")[0]} FRAMIFRÅN`, 945], [`${OTHER_NAME.split(",")[0]} FRÅN SIDAN`, 1275]] as [string, number][]).forEach(([t, x]) => text(g, t, x, 1032, 22, 800));
  text(g, `Bifigur: ${OTHER_NAME.toLowerCase().replace("ada", "Ada")}, i samma stil`, 1420, 206, 20, 400, "right", SUB);
  // the scene
  scene(g, i, 1480, 170, 495);
  text(g, "ACTIONSCEN: platt målad bakgrund, marklinje", 1727, 1060 + 12, 20, 800);
  text(g, "Sir springer (run), Ada pekar vägen (point)", 1727, 1094, 18, 400, "center", SUB);
  // phone size
  box(g, 2010, 170, 660, 880, PANEL);
  text(g, "MOBILSTORLEK", 2340, 206, 24, 800);
  const PWD = 252; g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = INK; g.fillRect(2030, 236, PWD + 24, PWD * 16 / 9 + 44);
  scene(g, i, 2042, 258, PWD);
  text(g, "scenen så stor som", 2168, 770, 17, 400, "center", SUB); text(g, "telefonens skärm", 2168, 792, 17, 400, "center", SUB);
  const ms = (PWD * 16 / 9) * 0.31 / tall(sir), my = 520;
  box(g, 2330, my - 230, 320, 260, BG);
  fig(g, D, "sir", POSES.stand, 0, {}, 2390, my, ms); fig(g, D, "sir", POSES.standSide, 90, {}, 2490, my, ms); fig(g, D, "baker", POSES.stand, 0, {}, 2590, my, ms);
  text(g, "helfigur på telefonen", 2490, my + 34, 17, 400, "center", SUB);
  MINER.forEach(([, , face], n) => bust(g, D, face, 2380 + (n % 3) * 100, 640 + Math.floor(n / 3) * 104, 54, 92, 96, BG));
  text(g, "minerna i halvbild", 2480, 862, 17, 400, "center", SUB); text(g, "på telefonen", 2480, 884, 17, 400, "center", SUB);
  // colours
  const cols = Object.entries(spec.col).filter(([n]) => ["skin", "cap", "coat", "vest", "shirt", "trous", "dress"].includes(n) && !(spec.noCoat && n === "coat"));
  const names: Record<string, string> = { skin: "hud", cap: "keps", coat: "rock", vest: "väst", shirt: "skjorta", trous: "byxor", dress: "Adas klänning" };
  cols.forEach(([n, c], k) => { const x = 2040 + (k % 4) * 156, y = 930 + Math.floor(k / 4) * 56; box(g, x, y, 40, 40, c); g.lineWidth = 3; g.strokeStyle = INK; g.strokeRect(x, y, 40, 40); text(g, names[n], x + 48, y + 27, 17, 400, "left"); });
  // the six faces, large and at phone size
  text(g, "SEX MINER", 40, 1120, 30, 800, "left");
  MINER.forEach(([t, what, face], n) => { const cx = 40 + 170 + n * 345;
    bust(g, D, face, cx, 1300, 230, 330, 300);
    text(g, t, cx, 1490, 28, 800); text(g, what, cx, 1522, 19, 400, "center", SUB);
    bust(g, D, face, cx, 1640, 54, 92, 96);
    text(g, "mobil", cx, 1712, 16, 400, "center", SUB); });
  // (v3: the mouth moving with the voice in the neutral face: closed, half open, open)
  if (v3) { text(g, "TAL I NEUTRAL MIN", 2390, 1120, 26, 800);
    ([["STÄNGD", 0], ["HALVÖPPEN", 0.35], ["ÖPPEN", 0.7]] as [string, number][]).forEach(([t, m], n) => { const cx = 2210 + n * 180; bust(g, D, { mouth: m }, cx, 1290, 150, 170, 260); text(g, t, cx, 1450, 20, 800); }); }
  g.setTransform(1, 0, 0, 1, 0, 0);
};

export const FlatStyle: React.FC = () => {
  // (frames 0-2: the three directions; frame 3: A Knopp v3, Jesper's choice with his three fixes)
  const fr = useCurrentFrame(), i = fr >= 3 ? 0 : Math.min(fr, FLAT.length - 1);
  return <AbsoluteFill style={{ background: BG }}><canvas width={FSW} height={FSH} ref={(cv) => { if (cv) sheet(cv.getContext("2d")!, i, fr >= 3); }} /></AbsoluteFill>;
};
