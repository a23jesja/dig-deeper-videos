// Step A of the big build: the sheet of design directions for Sir Digsworth (DAILY-RULES "Our own character design").
// Every direction is a skin on the same skeleton (rig.ts). One panel per direction: front, side, an action pose with weight in rim light
// (warm from one side, cold from the other), next to a side character, three faces that show the eyes acting, two silhouettes and the
// figure at phone size.
//   SirDesigns  (3200 x 3300): frame 0 = all directions on one sheet
//   SirDesign   (1600 x 1100): frame n = direction n + 1 alone, large
// PROPS='{"audio":false}' node scripts/stills.mjs SirDesigns out/craft/designs_ 0 0.5 jpeg
// PROPS='{"audio":false}' node scripts/stills.mjs SirDesign out/craft/design_ 0-5 1 jpeg
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Ink, INK } from "./ink";
import { solve, POSES, Pose, Props } from "./rig";
import { Design, FigOpts, Who } from "./designs/common";
import { DIRECTIONS } from "./designs";

export const PW = 1600, PH = 1100;
const BG = "#e9dcc0", FLOOR = "#cdb98f", NIGHT = "#1d2440", TXT = "#3b2a1a";
type G = CanvasRenderingContext2D;
const tall = (P: Props) => P.thigh + P.shin + P.ankle + P.spine + P.neck + P.head * 1.2;

/** one figure with its soles at (x, y). mode: plain, rim (dusk with a warm and a cold edge light) or sil (black silhouette) */
const fig = (g: G, D: Design, who: Who, pose: Pose, yaw: number, o: FigOpts, x: number, y: number, sc: number, mode: "plain" | "rim" | "sil" = "plain", clip?: number[]) => {
  const sk = solve(D.props(who), pose, yaw);
  const paint = (c: G, tx: number, ty: number) => { c.save(); c.translate(tx, ty); c.scale(sc, sc); D.draw(new Ink(c, D.ol), sk, { who, ...o }); c.restore(); };
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  if (clip) { g.beginPath(); g.rect(clip[0], clip[1], clip[2], clip[3]); g.clip(); }
  if (mode === "plain") { paint(g, x, y); g.restore(); return; }
  const w = Math.ceil(1500 * sc), h = Math.ceil(1500 * sc), ox = Math.round(x - w / 2), oy = Math.round(y - h * 0.88);
  const mk = () => { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; };
  const base = mk(), bg = base.getContext("2d")!; paint(bg, x - ox, y - oy);
  const tint = (col: string, dx?: number, dy?: number) => {
    const c = mk(), q = c.getContext("2d")!; q.drawImage(base, 0, 0);
    if (dx !== undefined) { q.globalCompositeOperation = "destination-out"; q.drawImage(base, dx, dy!); }
    q.globalCompositeOperation = "source-in"; q.fillStyle = col; q.fillRect(0, 0, w, h); return c;
  };
  if (mode === "sil") g.drawImage(tint(INK), ox, oy);
  else {
    const d = Math.max(4, 15 * sc);
    g.drawImage(base, ox, oy); g.drawImage(tint("rgba(22,26,74,0.4)"), ox, oy);
    g.drawImage(tint("#ffb24a", d, d * 0.2), ox, oy); g.drawImage(tint("#8fdcff", -d, d * 0.12), ox, oy);
  }
  g.restore();
};

/** the scale and sideways shift that put a posed figure (seen from the side) in the middle of a cell of the given width */
const fitIn = (D: Design, pose: Pose, o: FigOpts, sc: number, width: number) => {
  const sk = solve(D.props("sir"), pose, 90), P = sk.P, xs = Object.values(sk.j).map((p) => p[0]);
  xs.push(sk.j.skull[0] - (D.faceW ?? P.head * 0.6), sk.j.skull[0] + (D.faceW ?? P.head * 0.6) * 1.2);
  if (o.prop === "cane" && sk.j.wrR[1] < sk.j.pelvis[1]) xs.push(sk.j.wrR[0] + P.fore * 1.5);
  const lo = Math.min(...xs) - P.hand * 0.4, hi = Math.max(...xs) + P.hand * 0.4, s = Math.min(sc, width / (hi - lo));
  return { sc: s, dx: (-(lo + hi) / 2) * s };
};
export type Direction = { D: Design; line: string; action: string; ao: FigOpts; so?: FigOpts };
const FACES: [string, FigOpts["face"]][] = [["BLICK ÅT SIDAN", { gaze: [-0.85, 0.05], lid: 0.14 }], ["MISSTÄNKSAM", { gaze: [0.5, 0.25], lid: 0.56, brow: -0.8 }], ["FÖRSKRÄCKT", { gaze: [0, -0.1], lid: 0, wide: 1, brow: 1, mouth: 0.8 }]];

const panel = (g: G, dn: Direction, n: number, bx: number, by: number) => {
  const { D } = dn, sir = D.props("sir"), sc = 610 / tall(sir), FY = by + 770;
  const text = (t: string, x: number, y: number, px = 24, align: CanvasTextAlign = "center", col = TXT, wt = 700) => { g.setTransform(1, 0, 0, 1, 0, 0); g.font = `${wt} ${px}px Arial`; g.textAlign = align; g.fillStyle = col; g.fillText(t, bx + x, y + by); };
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.fillStyle = BG; g.fillRect(bx, by, PW, PH);
  g.fillStyle = NIGHT; g.fillRect(bx + 800, by + 84, 400, 716);
  const gr = g.createLinearGradient(0, by + 84, 0, by + 800); gr.addColorStop(0, "#141a33"); gr.addColorStop(1, "#33355a"); g.fillStyle = gr; g.fillRect(bx + 800, by + 84, 400, 716);
  g.fillStyle = FLOOR; g.fillRect(bx, FY, 800, 30); g.fillRect(bx + 1200, FY, 400, 30); g.fillStyle = "#0f1326"; g.fillRect(bx + 800, FY, 400, 30);
  text(`${n + 1}`, 28, 60, 54, "left"); text(D.name.toUpperCase(), 78, 46, 34, "left"); text(dn.line, 80, 74, 21, "left", "#5d4a33", 400);
  // front, side
  fig(g, D, "sir", POSES.stand, 0, { ...dn.so }, bx + 200, FY, sc);
  fig(g, D, "sir", POSES.standSide, 90, { ...dn.so }, bx + 600, FY, sc);
  // action in rim light
  const fit = fitIn(D, POSES[dn.action], dn.ao, sc * 0.94, 356);
  fig(g, D, "sir", POSES[dn.action], 90, dn.ao, bx + 1000 + fit.dx, FY, fit.sc, "rim", [bx + 800, by + 84, 400, 716]);
  // with the side character: they look at each other
  const s4 = Math.min(sc * 0.8, 88 / (D.faceW ?? sir.head * 0.6));
  fig(g, D, "sir", { ...POSES.stand, head: [14, 0, 0] }, 0, { ...dn.so, face: { gaze: [0.8, 0.1] } }, bx + 1300, FY, s4);
  fig(g, D, "baker", { ...POSES.stand, head: [-14, 0, 0], armL: [[20, 12], [78, -8]] }, 0, { prop: "loaf", handL: "grip", face: { gaze: [-0.8, -0.1] } }, bx + 1500, FY, s4);
  for (const [t, x] of [["FRAMIFRÅN", 200], ["FRÅN SIDAN", 600], ["I RÖRELSE, KANTLJUS", 1000], ["MED BIFIGUR (BAGARE)", 1400]] as [string, number][]) text(t, x, 832, 21, "center", x === 1000 ? "#3b2a1a" : TXT);
  // the eyes acting: three faces
  const hy = sir.thigh + sir.shin + sir.ankle + sir.spine + sir.neck + sir.head * 0.5, hs = Math.min(150 / sir.head, 104 / (D.faceW ?? sir.head * 0.6));
  FACES.forEach(([t, face], i) => {
    const cx = bx + 130 + i * 250, cy = by + 955;
    g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = "#dccba6"; g.fillRect(cx - 115, cy - 100, 230, 200);
    fig(g, D, "sir", POSES.stand, 0, { face }, cx, cy + hy * hs, hs, "plain", [cx - 115, cy - 100, 230, 200]);
    text(t, 130 + i * 250, 1082, 18);
  });
  // silhouettes and phone size
  const ss = 190 / tall(sir);
  fig(g, D, "sir", POSES.stand, 0, {}, bx + 870, by + 1050, ss, "sil"); fig(g, D, "sir", POSES.standSide, 90, {}, bx + 1030, by + 1050, ss, "sil");
  const fs = fitIn(D, POSES[dn.action], dn.ao, ss, 190);
  fig(g, D, "sir", POSES[dn.action], 90, dn.ao, bx + 1215 + fs.dx, by + 1050, fs.sc, "sil");
  text("SILUETT", 1040, 1082, 18);
  const ts = 110 / tall(sir);
  fig(g, D, "sir", POSES.stand, 0, {}, bx + 1400, by + 1050, ts); fig(g, D, "sir", POSES.standSide, 90, {}, bx + 1500, by + 1050, ts);
  text("I MOBILSTORLEK", 1450, 1082, 18);
  g.setTransform(1, 0, 0, 1, 0, 0); g.strokeStyle = "#b9a57c"; g.lineWidth = 3; g.strokeRect(bx + 1.5, by + 1.5, PW - 3, PH - 3);
};

const Canvas: React.FC<{ w: number; h: number; paint: (g: G) => void }> = ({ w, h, paint }) => (
  <AbsoluteFill style={{ background: BG }}>
    <canvas width={w} height={h} ref={(cv) => { if (!cv) return; const g = cv.getContext("2d")!; g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = BG; g.fillRect(0, 0, w, h); paint(g); }} />
  </AbsoluteFill>
);
export const SIR_DESIGN_FRAMES = DIRECTIONS.length;
export const SirDesigns: React.FC = () => <Canvas w={PW * 2} h={PH * 3} paint={(g) => DIRECTIONS.forEach((d, i) => panel(g, d, i, (i % 2) * PW, Math.floor(i / 2) * PH))} />;
export const SirDesign: React.FC = () => { const fr = useCurrentFrame(); return <Canvas w={PW} h={PH} paint={(g) => panel(g, DIRECTIONS[Math.min(fr, DIRECTIONS.length - 1)], Math.min(fr, DIRECTIONS.length - 1), 0, 0)} />; };
