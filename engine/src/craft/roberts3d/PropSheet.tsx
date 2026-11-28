// The drinking things' sheet (the reviewer's decision 28 Nov): frame 0 the hook's mug, raised beside the rum pirate's beard at the chin's height,
// clear of his mouth, beard, eyes and nose by 20 px or more, in three-quarter both ways and at 15 degrees; frame 1 the planted fault, the mug at
// his mouth. (The pour of shot 8 and the dip of shot 14 follow on frames 2-5.)
//   PROPS='{}' node scripts/stills.mjs PropSheet out/rob/prop_ 0-1 1 png
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Ink, hand as inkHand } from "../ink";
import { solve } from "../rig";
import { handFlip } from "../designs/common";
import { KIT_DESIGN } from "../wardrobe/kit";
import { RUM_LOOK, PIRATE_HEIGHTS } from "../wardrobe/pirates";
import { hookMugPose, mugAt, mugSide, MUG, pourPair, dipPose, KEG, POUR_ARM, POUR_TILT } from "./props";
import { mouthMid, RUM, type P2 } from "./rum";
import { YOUNG_LOOK } from "../wardrobe/pirates";

export const PRSW = 2400, PRSH = 1500;
let THIRD = 25;      // (the pour and the dip at 25 degrees: at 15 the raised near arm's sleeve cap rises into the chin, the frozen rig's drawing)
type G = CanvasRenderingContext2D;
const PEWTER = "#9ea4a8", PEWTER_IN = "#4a4e52", RUMC = "#c07a2a";
/** the mug in a hand: its body, the dark inside seen in its rim, the rim, a handle on the side away from his face, then his fingers over it */
export const drawMug = (k: Ink, sk: ReturnType<typeof solve>, side: "L" | "R", skin: string, at?: P2, splash = false) => {
  const m = mugAt(sk, side), dx = at ? at[0] - m.c[0] : 0, dy = at ? at[1] - m.c[1] : 0, sh = (P: P2[]) => P.map(([x, y]) => [x + dx, y + dy] as P2);
  const f = Math.sign(Math.sin(sk.faceYaw * Math.PI / 180) || 1), hx = m.c[0] + dx + f * (MUG.w / 2), cy = m.c[1] + dy;
  k.group([[[hx, cy - 24], [hx + f * 22, cy - 22], [hx + f * 26, cy + 4], [hx + f * 20, cy + 20], [hx, cy + 18], [hx, cy + 8], [hx + f * 12, cy + 8], [hx + f * 14, cy - 10], [hx, cy - 12]]], PEWTER);      // (the handle at the mug as drawn: already moved with it)
  k.group([sh(m.body)], PEWTER); k.group([sh(m.rim)], PEWTER_IN);
  if (splash) { const top = m.c[1] + dy - MUG.h / 2, cx = m.c[0] + dx, kk = new Ink(k.g, 4);      // (the rum slopping over the rim on its way up: a tongue over the back edge and three drops, its own thin ink)
    kk.group([[[cx - f * 26, top + 2], [cx - f * 22, top - 10], [cx - f * 12, top - 18], [cx + f * 2, top - 20], [cx + f * 14, top - 14], [cx + f * 22, top - 4], [cx + f * 24, top + 3]]], RUMC);
    for (const [ox, oy, r] of [[-f * 26, -34, 6], [-f * 6, -40, 5], [f * 14, -32, 4.5]] as [number, number, number][]) kk.group([Array.from({ length: 12 }, (_, i): P2 => [cx + ox + r * Math.cos((i / 12) * 2 * Math.PI), top + oy + r * 1.25 * Math.sin((i / 12) * 2 * Math.PI)])], RUMC); }
  const hf = handFlip(sk, side, "grip"); inkHand(k, hf.w, hf.d, sk.P.hand, "grip", skin, hf.flip, false, k.ol, "fingers");
  return { ...m, c: [m.c[0] + dx, m.c[1] + dy] as P2 }; };
const draw = (g: G, yaw: number, fault: boolean, x: number, y: number, sc: number) => {
  const pose = hookMugPose(yaw), sk = solve(KIT_DESIGN.props("sir"), pose, yaw), s = sc * (PIRATE_HEIGHTS.rum / 1.75), side = mugSide(sk);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.translate(x, y); g.scale(s, s); const k = new Ink(g, KIT_DESIGN.ol);
  KIT_DESIGN.draw(k, sk, { who: "sir", look: RUM_LOOK, face: { pupil: 1, mouth: 0.8, gaze: [0.7, 0.1], lid: 0.04, smile: 0.6 }, handR: "grip", handL: "grip" } as never);      // (the mouth open, his eyes on the mug)
  drawMug(k, sk, side, (RUM_LOOK as unknown as { col: { skin: string } }).col.skin, fault ? mouthMid(sk, 0.8).c : undefined, true); g.restore(); };
/** shot 8's pour on the sheet: the young pirate holds out his mug, the rum pirate opposite pours with the bottle's neck down inside it, its tip
 *  behind the mug's front wall (fault: the neck through the mug's wall, beside the opening, drawn over it) */
const SKIN = (L: unknown) => (L as { col: { skin: string } }).col.skin;
const bottle = (k: Ink, p: { u: P2; n: P2; b0: P2; b1: P2 }) => { const nn: P2 = [-p.u[1], p.u[0]], sd = (c: P2, w: number, s2: number): P2 => [c[0] + nn[0] * w * s2, c[1] + nn[1] * w * s2];
  k.group([[sd(p.b0, RUM.bodyW / 2, 1), sd(p.b1, RUM.bodyW / 2, 1), sd(p.b1, RUM.neckW / 2, 1), sd(p.n, RUM.neckW / 2, 1), sd(p.n, RUM.neckW / 2, -1), sd(p.b1, RUM.neckW / 2, -1), sd(p.b1, RUM.bodyW / 2, -1), sd(p.b0, RUM.bodyW / 2, -1)]], "#2f5a3a"); };
const drawPour = (g: G, yaw: number, fault: boolean, x: number, y: number, sc: number) => {
  const sY = sc * (PIRATE_HEIGHTS.young / 1.75), sR = sc * (PIRATE_HEIGHTS.rum / 1.75), P = pourPair(yaw, sY, sR, POUR_TILT, 14, fault, POUR_ARM);      // (his mug held well out, the bottle 65 degrees from straight down: what the pourer, turned 15 degrees, reaches with his near arm clear of his own beard)
  const at = (xx: number, s: number) => { g.setTransform(1, 0, 0, 1, 0, 0); g.translate(xx, y); g.scale(s, s); return new Ink(g, KIT_DESIGN.ol); };
  g.save();
  let k = at(x + P.dx, sR); KIT_DESIGN.draw(k, P.rum, { who: "sir", look: RUM_LOOK, face: { pupil: 1, mouth: 0.3, gaze: [-0.3 * P.f, 0.5], lid: 0.06, smile: 0.5 }, handR: "grip", handL: "grip" } as never);
  k = at(x, sY); KIT_DESIGN.draw(k, P.young, { who: "sir", look: YOUNG_LOOK, face: { pupil: 1, mouth: 0.4, gaze: [0.4 * P.f, 0.5], lid: 0.06, smile: 0.7 }, handR: "grip", handL: "grip" } as never);
  const m = P.m, front: P2[] = [...Array.from({ length: 11 }, (_, i): P2 => [m.c[0] - MUG.w / 2 + (MUG.w * i) / 10, P.op.y + (MUG.rd / 2) * Math.sin((i / 10) * Math.PI)]), [m.c[0] + MUG.w / 2, m.c[1] + MUG.h / 2], [m.c[0] - MUG.w / 2, m.c[1] + MUG.h / 2]];
  k.group([m.body], PEWTER); k.group([m.rim], PEWTER_IN);
  if (fault) { k.group([front], PEWTER); bottle(k, P.p); } else { bottle(k, P.p); k.group([front], PEWTER); }      // (the fault: the neck drawn over the wall, out its side)
  let hf = handFlip(P.young, P.side, "grip"); inkHand(k, hf.w, hf.d, P.young.P.hand, "grip", SKIN(YOUNG_LOOK), hf.flip, false, k.ol, "fingers");
  k = at(x + P.dx, sR); hf = handFlip(P.rum, P.rumSide, "grip"); inkHand(k, hf.w, hf.d, P.rum.P.hand, "grip", SKIN(RUM_LOOK), hf.flip, false, k.ol, "fingers");
  g.restore(); };
/** shot 14's dip on the sheet: the opened keg, waist-high, the young pirate's mug lowered into it, its lower half behind the keg's front wall
 *  (fault: the mug pushed out through the keg's side, drawn over the wall) */
const drawDip = (g: G, yaw: number, fault: boolean, x: number, y: number, sc: number) => {
  const d = dipPose(yaw, fault), s = sc * (PIRATE_HEIGHTS.young / 1.75), mid = d.keg.x;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.translate(x, y); g.scale(s, s); const k = new Ink(g, KIT_DESIGN.ol);
  KIT_DESIGN.draw(k, d.sk, { who: "sir", look: YOUNG_LOOK, face: { pupil: 1, mouth: 0.4, gaze: [0.4 * d.f, 0.6], lid: 0.06, smile: 0.6 }, handR: "grip", handL: "grip" } as never);
  const ell = (cy: number, rx: number, ry: number, a0 = 0, a1 = 2 * Math.PI, n = 24) => Array.from({ length: n + 1 }, (_, i): P2 => [mid + rx * Math.cos(a0 + ((a1 - a0) * i) / n), cy + ry * Math.sin(a0 + ((a1 - a0) * i) / n)]);
  k.group([[...ell(d.keg.rimY, KEG.w / 2, KEG.rd / 2, Math.PI, 2 * Math.PI), [mid + KEG.w / 2, d.keg.floorY], [mid - KEG.w / 2, d.keg.floorY]]], "#7a5230");      // (its back half and staves)
  k.group([ell(d.keg.rimY, KEG.w / 2 - 10, KEG.rd / 2 - 6)], "#2a1a10");      // (the dark rum inside, the lid knocked in)
  const frontW: P2[] = [...ell(d.keg.rimY, KEG.w / 2, KEG.rd / 2, 0, Math.PI), [mid - KEG.w / 2, d.keg.floorY], [mid + KEG.w / 2, d.keg.floorY]];
  const wall = () => { k.group([frontW], "#8a5e36"); for (const hy of [d.keg.rimY + 34, d.keg.floorY - 34]) k.group([[[mid - KEG.w / 2, hy - 5], [mid + KEG.w / 2, hy - 5], [mid + KEG.w / 2, hy + 5], [mid - KEG.w / 2, hy + 5]]], "#3a3a3a"); };
  const hf = handFlip(d.sk, d.side, "grip");
  if (fault) { wall(); k.group([d.m.body], PEWTER); k.group([d.m.rim], PEWTER_IN); inkHand(k, hf.w, hf.d, d.sk.P.hand, "grip", SKIN(YOUNG_LOOK), hf.flip, false, k.ol, "fingers"); }
  else { k.group([d.m.body], PEWTER); k.group([d.m.rim], PEWTER_IN); inkHand(k, hf.w, hf.d, d.sk.P.hand, "grip", SKIN(YOUNG_LOOK), hf.flip, false, k.ol, "fingers"); wall(); }
  g.restore(); };
const text = (g: G, t: string, x: number, y: number, px: number) => { g.setTransform(1, 0, 0, 1, 0, 0); g.font = `700 ${px}px Arial`; g.textAlign = "center"; g.fillStyle = "#2b1d12"; g.fillText(t, x, y); };
export const PropSheet: React.FC = () => { const fr = useCurrentFrame();
  return <AbsoluteFill style={{ background: "#efe6d2" }}><canvas width={PRSW} height={PRSH} ref={(cv) => { if (!cv) return; const g = cv.getContext("2d")!; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, PRSW, PRSH);
    const T = ["Hooken: skålen, muggen lyft bredvid huvudet i munhöjd, minst 20 px från huvud, skägg, mun, ögon och näsa", "PLANTERAT FEL: muggen vid munnen (kontrollen ska fälla)",
      "Bild 8: flaskhalsen nere i muggen, dess spets bakom muggens främre kant", "PLANTERAT FEL: halsen genom muggens vägg (kontrollen ska fälla)",
      "Bild 14: muggen nere i den öppnade kaggen, nedre halvan skymd av kaggens framvägg", "PLANTERAT FEL: muggen genom kaggens vägg (kontrollen ska fälla)"];
    text(g, T[fr], 1200, 70, 36);
    const fn = fr < 2 ? draw : fr < 4 ? drawPour : drawDip;
    const pour = fr >= 2 && fr < 4, cols: [number, number][] = pour ? [[45, 300], [-45, 1300], [THIRD, 1750]] : fr >= 4 ? [[45, 600], [-45, 1800]] : [[45, 420], [-45, 1200], [30, 1980]];      // (the dip at plus and minus 45 only: at 25 its sleeve steps at the elbow)      // (the pour's pairs: each young pirate placed so his pourer stays in his own third)
    cols.forEach(([yaw, x]) => { fn(g, yaw, fr % 2 === 1, x, 1380, pour ? 1.0 : 1.6); text(g, `${yaw}°`, pour ? x + (yaw < 0 ? -220 : 220) : x, 1440, 30); }); }} /></AbsoluteFill>; };
