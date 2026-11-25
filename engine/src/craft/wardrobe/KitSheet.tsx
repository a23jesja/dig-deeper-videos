// The wardrobe's figure sheet (STOPP, the cloud session 25 Nov): the dinner's three people beside Sir Digsworth in three-quarter, the same
// four as black silhouettes, the captain seated with both hands showing (frame 0); each new head through a turn (0 to 60 degrees, the angles
// the rig uses; never beyond 60) and each face speaking at three-quarter and near profile (frame 1).
//   PROPS='{}' node scripts/stills.mjs KitSheet out/kit/sheet_ 0-1 1 png
import React, { useEffect, useRef } from "react";
import { AbsoluteFill, useCurrentFrame, delayRender, continueRender } from "remotion";
import { Ink } from "../ink";
import { solve, POSES, type Pose } from "../rig";
import type { Design, FigOpts, Face } from "../designs/common";
import { FLAT } from "../designs/flat";
import { KIT_DESIGN } from "./kit";
import { CAPTAIN_LOOK, SAILOR_LOOK, BOY_LOOK, KIT_HEIGHTS } from "./cast";

export const KSW = 2400, KSH = 1500, KIT_FRAMES = 2;
const BG = "#efe6d2", TXT = "#2b1d12";
type G = CanvasRenderingContext2D;
type Person = { name: string; D: Design; o: FigOpts; h: number };
const SIR: Person = { name: "SIR DIGSWORTH (orörd)", D: FLAT[0], o: { who: "sir" }, h: 1.75 };
const PEOPLE: Person[] = [SIR,
  { name: "KAPTENEN", D: KIT_DESIGN, o: { who: "sir", look: CAPTAIN_LOOK }, h: KIT_HEIGHTS.captain },
  { name: "SJÖMANNEN", D: KIT_DESIGN, o: { who: "sir", look: SAILOR_LOOK }, h: KIT_HEIGHTS.sailor },
  { name: "POJKEN", D: KIT_DESIGN, o: { who: "sir", look: BOY_LOOK }, h: KIT_HEIGHTS.boy }];
const headTo = (yaw: number, nod = 0): [number, number, number] => [Math.sign(yaw) * 45 - yaw, nod, 0];

const draw = (g: G, p: Person, pose: Pose, yaw: number, face: Face, x: number, y: number, sc: number) => {
  const sk = solve(p.D.props("sir"), pose, yaw), s = sc * (p.h / 1.75);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.translate(x, y); g.scale(s, s); p.D.draw(new Ink(g, p.D.ol), sk, { ...p.o, face }); g.restore(); };
/** the figure drawn alone on its own canvas and filled black: its silhouette */
const silhouette = (g: G, p: Person, pose: Pose, yaw: number, x: number, y: number, sc: number) => {
  const c = document.createElement("canvas"); c.width = KSW; c.height = KSH; const h = c.getContext("2d")!;
  draw(h, p, pose, yaw, { pupil: 1 }, x, y, sc); h.globalCompositeOperation = "source-in"; h.fillStyle = "#111"; h.fillRect(0, 0, KSW, KSH);
  g.drawImage(c, 0, 0); };
const text = (g: G, t: string, x: number, y: number, px: number, wt = 700) => { g.setTransform(1, 0, 0, 1, 0, 0); g.font = `${wt} ${px}px Arial`; g.textAlign = "center"; g.fillStyle = TXT; g.fillText(t, x, y); };
const SMILE: Face = { pupil: 1, smile: 0.5, gaze: [0.3, 0.1], lid: 0.1 };

const sheet0 = (g: G) => {
  text(g, "Middagens tre bredvid Sir, 3/4", 640, 70, 44);
  const xs = [150, 450, 760, 1060], base = 760, sc = 0.82, pose = { ...POSES.stand, head: headTo(38, 4) };
  PEOPLE.forEach((p, i) => { draw(g, p, pose, 38, SMILE, xs[i], base, sc); text(g, p.name, xs[i], base + 50, 26); });
  text(g, "Samma fyra som siluetter", 1760, 70, 44);
  PEOPLE.forEach((p, i) => silhouette(g, p, pose, 38, 1270 + i * 300, base, sc));
  // the captain seated, both hands on his knees (the near hand on the near knee, the far one on the far knee, 86 % of it in sight)
  text(g, "Kaptenen sittande, 3/4, båda händerna synliga", 640, 900, 40);
  const C = PEOPLE[1], yaw = 40, s0 = solve(C.D.props("sir"), POSES.stand, yaw);
  const sp: Pose = { ...POSES.stand, pz: -0.52, py: -0.43, lean: 8, head: headTo(yaw, 4), [`arm${s0.near}`]: [[10, -20], [40, 20]], [`arm${s0.far}`]: [[-20, 5], [45, 20]] } as Pose;
  const sx = 640, sy = 1440, k = 0.82 * (C.h / 1.75);
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = "#8a5a33"; g.strokeStyle = "#241726"; g.lineWidth = 7;      // (the stool, for the sheet only: its top under the seat)
  g.beginPath(); g.rect(sx - 150 * k, sy - 104 * k, 130 * k, 18 * k); g.fill(); g.stroke();
  for (const dx of [-140, -40]) { g.beginPath(); g.rect(sx + dx * k, sy - 86 * k, 12 * k, 86 * k); g.fill(); g.stroke(); }
  draw(g, C, sp, yaw, { pupil: 1, smile: 0.2, gaze: [0.4, 0.2] }, sx, sy, 0.82);
  text(g, "(telefonstorlek: samma rader i 360 px bredd i en egen fil)", 1760, 1440, 26, 400);
};
const sheet1 = (g: G) => {
  text(g, "Varje nytt huvud genom en vändning (0-60°, riggens vinklar, aldrig bortom 60°)", 1000, 56, 38);
  text(g, "Talande, munnen öppen: 3/4 och 60°", 2080, 56, 30);
  const yaws = [0, 15, 28, 40, 50, 60], kits = PEOPLE.slice(1), bases = [560, 1010, 1440];
  kits.forEach((p, r) => yaws.forEach((y, c) => { const x = 150 + c * 300;
    draw(g, p, { ...POSES.stand, head: [0, 0, 0] }, y, { pupil: 1, smile: 0.3, gaze: [0.2, 0] }, x, bases[r], 0.64);
    if (r === 0) text(g, `${y}°`, x, 110, 30); }));
  kits.forEach((p, r) => [38, 60].forEach((y, c) => { const x = 2000 + c * 260;
    draw(g, p, { ...POSES.stand, head: [0, 0, 0] }, y, { pupil: 1, mouth: 0.85, smile: 0.1, gaze: [0.2, 0] }, x, bases[r], 0.64); }));
};

export const KitSheet: React.FC = () => {
  const f = useCurrentFrame(), ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => { const h = delayRender(); const g = ref.current!.getContext("2d")!; g.fillStyle = BG; g.fillRect(0, 0, KSW, KSH);
    if (f === 0) sheet0(g); else sheet1(g); continueRender(h); }, [f]);
  return <AbsoluteFill><canvas ref={ref} width={KSW} height={KSH} /></AbsoluteFill>;
};
