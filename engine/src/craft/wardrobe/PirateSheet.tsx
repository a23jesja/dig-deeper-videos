// The figure sheet of Roberts' bedtime (the script and shot-list STOPP, 28 Nov): the four pirates beside Sir Digsworth in three-quarter, the
// same five as silhouettes (frame 0); each pirate's head through a turn (0 to 60 degrees, the rig's angles) and speaking at three-quarter and
// 60 degrees (frame 1).
//   PROPS='{}' node scripts/stills.mjs PirateSheet out/kit/pirates_ 0-1 1 png
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Ink } from "../ink";
import { solve, POSES, type Pose } from "../rig";
import type { Design, FigOpts, Face } from "../designs/common";
import { FLAT } from "../designs/flat";
import { KIT_DESIGN } from "./kit";
import { ROBERTS_LOOK, RUM_LOOK, YOUNG_LOOK, GUNNER_LOOK, PIRATE_HEIGHTS } from "./pirates";

export const PSW = 2400, PSH = 1500, PIRATE_FRAMES = 2;
const BG = "#efe6d2", TXT = "#2b1d12";
type G = CanvasRenderingContext2D;
type Person = { name: string; D: Design; o: FigOpts; h: number };
const SIR: Person = { name: "SIR DIGSWORTH (orörd)", D: FLAT[0], o: { who: "sir" }, h: 1.75 };
const PEOPLE: Person[] = [SIR,
  { name: "ROBERTS", D: KIT_DESIGN, o: { who: "sir", look: ROBERTS_LOOK }, h: PIRATE_HEIGHTS.roberts },
  { name: "ROMPIRATEN", D: KIT_DESIGN, o: { who: "sir", look: RUM_LOOK }, h: PIRATE_HEIGHTS.rum },
  { name: "UNGA PIRATEN", D: KIT_DESIGN, o: { who: "sir", look: YOUNG_LOOK }, h: PIRATE_HEIGHTS.young },
  { name: "KANONJÄREN", D: KIT_DESIGN, o: { who: "sir", look: GUNNER_LOOK }, h: PIRATE_HEIGHTS.gunner }];
const headTo = (yaw: number, nod = 0): [number, number, number] => [Math.sign(yaw) * 45 - yaw, nod, 0];
const draw = (g: G, p: Person, pose: Pose, yaw: number, face: Face, x: number, y: number, sc: number) => {
  const sk = solve(p.D.props("sir"), pose, yaw), s = sc * (p.h / 1.75);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.translate(x, y); g.scale(s, s); p.D.draw(new Ink(g, p.D.ol), sk, { ...p.o, face }); g.restore(); };
const silhouette = (g: G, p: Person, pose: Pose, yaw: number, x: number, y: number, sc: number) => {
  const c = document.createElement("canvas"); c.width = PSW; c.height = PSH; const h = c.getContext("2d")!;
  draw(h, p, pose, yaw, { pupil: 1 }, x, y, sc); h.globalCompositeOperation = "source-in"; h.fillStyle = "#111"; h.fillRect(0, 0, PSW, PSH); g.drawImage(c, 0, 0); };
const text = (g: G, t: string, x: number, y: number, px: number, wt = 700) => { g.setTransform(1, 0, 0, 1, 0, 0); g.font = `${wt} ${px}px Arial`; g.textAlign = "center"; g.fillStyle = TXT; g.fillText(t, x, y); };
const SMILE: Face = { pupil: 1, smile: 0.5, gaze: [0.3, 0.1], lid: 0.1 };

const sheet0 = (g: G) => {
  text(g, "Piraterna bredvid Sir, 3/4", 700, 70, 44);
  const xs = [150, 420, 700, 960, 1220], base = 900, sc = 0.9, pose = { ...POSES.stand, head: headTo(38, 4) };
  PEOPLE.forEach((p, i) => { draw(g, p, pose, 38, SMILE, xs[i], base, sc); text(g, p.name, xs[i], base + 50, 26); });
  text(g, "Samma fem som siluetter", 1880, 70, 44);
  PEOPLE.forEach((p, i) => silhouette(g, p, pose, 38, 1480 + i * 205, base, sc * 0.78));
  text(g, "Roberts: håret i knut och en röd fjäder på hatten är förslag (kit.ts, ditt ja); här utan dem", 1200, 1060, 30, 400);
  text(g, "Framifrån (0°)", 700, 1140, 36);
  PEOPLE.slice(1).forEach((p, i) => draw(g, p, { ...POSES.stand, head: [0, 0, 0] }, 0, SMILE, 350 + i * 520, 1470, 0.5));
};
const sheet1 = (g: G) => {
  text(g, "Varje ny pirats huvud genom en vändning (0-60°)", 900, 56, 38);
  text(g, "Talande: 3/4 och 60°", 2080, 56, 30);
  const yaws = [0, 15, 28, 40, 50, 60], kits = PEOPLE.slice(1), bases = [400, 760, 1110, 1460];
  kits.forEach((p, r) => yaws.forEach((y, c) => { const x = 140 + c * 290;
    draw(g, p, { ...POSES.stand, head: [0, 0, 0] }, y, { pupil: 1, smile: 0.3, gaze: [0.2, 0] }, x, bases[r], 0.46);
    if (r === 3) text(g, `${y}°`, x, 1495, 30); }));
  kits.forEach((p, r) => [38, 60].forEach((y, c) => { const x = 1980 + c * 250;
    draw(g, p, { ...POSES.stand, head: [0, 0, 0] }, y, { pupil: 1, mouth: 0.85, smile: 0.1, gaze: [0.2, 0] }, x, bases[r], 0.46); }));
};

export const PirateSheet: React.FC = () => { const fr = useCurrentFrame();
  return <AbsoluteFill style={{ background: BG }}><canvas width={PSW} height={PSH} ref={(cv) => { if (!cv) return; const g = cv.getContext("2d")!; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, PSW, PSH); (fr === 0 ? sheet0 : sheet1)(g); }} /></AbsoluteFill>; };
