// Step B: the view sheets of the chosen figure (cast.ts, looks.ts) on the skeleton (rig.ts).
//   frame 0 = Sir Digsworth front, three-quarter, side and back between the same guide lines, and a close-up with the chain
//   frame 1 = the same figure turned all the way round in steps of 30 degrees, walking, and to the left
//   frame 2 = the shared base: side characters from different eras and the dog, each in four views
//   frame 3 = the line-up: Sir Digsworth among them, in colour and as black silhouettes
// PROPS='{"audio":false}' node scripts/stills.mjs CastViews out/craft/cast_ 0-2 0.6 jpeg
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Ink } from "./ink";
import { solve, POSES, Pose, Props } from "./rig";
import { Design, FigOpts } from "./designs/common";
import { SIR_D, BAKER_D, SOLDIER_D, MERCHANT_D, KNIGHT_D, TOMMY_D, LADY_D, DOCKER_D, BOY_D, GRANNY_D } from "./looks";
import { DOG, BEAST_POSES, drawBeast } from "./beast";
import { INK } from "./ink";
import { Mover } from "./motion";

export const CW = 2600, CH = 1400, CAST_VIEW_FRAMES = 4;
const BG = "#ecdfc2", FLOOR = "#cfbb90", TXT = "#3b2a1a";
type G = CanvasRenderingContext2D;
const tall = (P: Props) => P.thigh + P.shin + P.ankle + P.spine + P.neck + P.head;
const fig = (g: G, D: Design, pose: Pose, yaw: number, o: FigOpts, x: number, y: number, sc: number) => {
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.translate(x, y); g.scale(sc, sc); D.draw(new Ink(g, D.ol), solve(D.props("sir"), pose, yaw), o); g.restore();
};
const label = (g: G, t: string, x: number, y: number, px = 34, align: CanvasTextAlign = "center") => { g.setTransform(1, 0, 0, 1, 0, 0); g.font = `700 ${px}px Arial`; g.textAlign = align; g.fillStyle = TXT; g.fillText(t, x, y); };
const floor = (g: G, x0: number, x1: number, y: number) => { g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = FLOOR; g.fillRect(x0, y, x1 - x0, 22); };
const VIEWS: [number, string][] = [[0, "FRAMIFRÅN"], [45, "SNETT FRAMIFRÅN"], [90, "FRÅN SIDAN"], [180, "BAKIFRÅN"]];
const walkPose = (() => { const m = new Mover([0, 0], 0); m.walk(3); return m.sample(1.62).pose; })();

const paint = (g: G, fr: number) => {
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = BG; g.fillRect(0, 0, CW, CH);
  if (fr === 0) {
    const D = SIR_D, P = D.props("sir"), sc = 1.02, FY = 1250, T = tall(P);
    // guide lines: crown, shoulders, hips, ground are at the same height in every view
    g.strokeStyle = "rgba(120,90,50,0.35)"; g.lineWidth = 2; g.setLineDash([10, 10]);
    for (const hgt of [T, P.thigh + P.shin + P.ankle + P.spine - P.shDrop, P.thigh + P.shin + P.ankle]) { g.beginPath(); g.moveTo(40, FY - hgt * sc); g.lineTo(1800, FY - hgt * sc); g.stroke(); }
    g.setLineDash([]);
    floor(g, 20, 1820, FY);
    VIEWS.forEach(([yaw, t], i) => { fig(g, D, yaw === 90 ? POSES.standSide : POSES.stand, yaw, {}, 240 + i * 445, FY, sc); label(g, t, 240 + i * 445, FY + 80); });
    g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = "#e0d0aa"; g.fillRect(1850, 50, 710, 1240);
    g.save(); g.beginPath(); g.rect(1850, 50, 710, 1240); g.clip();
    fig(g, D, POSES.stand, 38, { face: { gaze: [0.5, 0] } }, 2190, 50 + 2.55 * (T + 60) - 20, 2.55);
    g.restore(); label(g, "NÄRBILD: KEDJAN", 2205, FY + 80);
  } else if (fr === 1) {
    const D = SIR_D, sc = 0.52, FY = 640;
    floor(g, 20, CW - 20, FY);
    for (let i = 0; i < 12; i++) { fig(g, D, POSES.stand, i * 30, {}, 130 + i * 212, FY, sc); label(g, `${i * 30}°`, 130 + i * 212, FY + 60, 26); }
    const FY2 = 1290, s2 = 0.56; floor(g, 20, CW - 20, FY2);
    const items: [string, Pose, number, FigOpts][] = [
      ["GÅR, SNETT", walkPose, 45, {}], ["GÅR, SIDAN", walkPose, 90, {}], ["GÅR BORT", walkPose, 180, {}], ["SNETT VÄNSTER", POSES.stand, -45, {}], ["SIDAN VÄNSTER", POSES.standSide, -90, {}],
      ["VÄNSTER, SPEGLAD", POSES.standSide, -90, { capLift: 0 }], ["PEKAR", { ...POSES.point }, 90, { handR: "point", face: { brow: -0.6 } }], ["RYGGAR", POSES.recoil, 90, { handL: "open", handR: "open", face: { wide: 1, lid: 0, brow: 1, mouth: 0.8 } }], ["SPRINGER", POSES.run, 90, { handL: "fist", handR: "fist", capLift: 0.4 }],
    ];
    const xs = [120, 340, 560, 800, 1040, 1290, 1600, 2010, 2400];
    items.forEach(([t, pose, yaw, o], i) => {
      const x = xs[i];
      if (t.includes("SPEGLAD")) { g.save(); g.setTransform(-1, 0, 0, 1, 2 * x, 0); const tr = g.getTransform(); g.restore(); g.save(); g.setTransform(tr); g.translate(x, FY2); g.scale(s2, s2); D.draw(new Ink(g, D.ol), solve(D.props("sir"), pose, 90), o); g.restore(); }
      else fig(g, D, pose, yaw, o, x, FY2, s2);
      label(g, t, x, FY2 + 62, 22);
    });
  } else if (fr === 2) {
    const old: Pose = { ...POSES.stand, lean: 13, head: [0, -11, 0] };
    const cast: [Design, string, Pose?][] = [[BAKER_D, "ROMERSK BAGARE, 79"], [SOLDIER_D, "ROMERSK SOLDAT, 79"], [MERCHANT_D, "ROMERSK KÖPMAN (TJOCK)"], [KNIGHT_D, "RIDDARE, 1200-TAL"],
      [TOMMY_D, "SOLDAT 1916 (SMAL, UNG)"], [LADY_D, "DAM, 1890-TAL"], [DOCKER_D, "HAMNARBETARE, 1930-TAL"], [GRANNY_D, "GUMMA (GAMMAL)", old], [BOY_D, "BARN"]];
    const sc = 0.335, slot = (n: number) => [30 + (n % 4) * 645, 412 + Math.floor(n / 4) * 462];
    cast.forEach(([D, name, pose], n) => {
      const [x0, FY] = slot(n);
      floor(g, x0, x0 + 610, FY);
      VIEWS.forEach(([yaw], i) => fig(g, D, pose ? { ...(yaw === 90 ? POSES.standSide : POSES.stand), lean: pose.lean, head: pose.head } : yaw === 90 ? POSES.standSide : POSES.stand, yaw, {}, x0 + 86 + i * 148, FY, sc));
      label(g, name, x0 + 305, FY + 46, 22);
    });
    // one side character in three expressions: the base carries them
    { const [x0, FY] = slot(9), D = BAKER_D, P = D.props("sir"), hs = 0.62, hy = P.thigh + P.shin + P.ankle + P.spine + P.neck + P.head * 0.5;
      ([["NEUTRAL", {}], ["RÄDD", { wide: 1, lid: 0, brow: 1, mouth: 0.75, smile: -0.6 }], ["GLAD", { smile: 1, lid: 0.3, brow: 0.35, mouth: 0.3 }]] as [string, FigOpts["face"]][]).forEach(([t, face], i) => {
        const cx = x0 + 105 + i * 200, cy = FY - 190;
        g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = "#e0d0aa"; g.fillRect(cx - 95, cy - 110, 190, 230);
        g.save(); g.beginPath(); g.rect(cx - 95, cy - 110, 190, 230); g.clip(); fig(g, D, POSES.stand, i === 2 ? 20 : 0, { face }, cx, cy + hy * hs, hs); g.restore();
        label(g, t, cx, FY - 46, 20);
      });
      label(g, "SAMMA BAGARE, TRE UTTRYCK", x0 + 305, FY + 46, 22); }
    { const [x0, FY] = slot(10); floor(g, x0, x0 + 1250, FY);
      ([[0, "stand", 90], [45, "stand", 300], [90, "stand", 560], [90, "strain", 860], [180, "stand", 1150]] as [number, string, number][]).forEach(([yaw, pose, dx]) => { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.translate(x0 + dx, FY); g.scale(0.44, 0.44); drawBeast(DOG)(new Ink(g, 4.6), BEAST_POSES[pose], yaw); g.restore(); });
      label(g, "HUND: SAMMA DELAR OCH NITAR, EGET FYRBENT SKELETT", x0 + 625, FY + 46, 22); }
  } else {
    // the line-up: he must stand out among them by silhouette and by his accent colour
    const line: [Design, number][] = [[BAKER_D, 30], [KNIGHT_D, -30], [LADY_D, 20], [TOMMY_D, 30], [SIR_D, 0], [SOLDIER_D, -25], [MERCHANT_D, -20], [GRANNY_D, 25], [DOCKER_D, 25], [BOY_D, -30]];
    for (const [row, FY] of [[0, 620], [1, 1290]] as [number, number][]) {
      floor(g, 20, CW - 20, FY);
      line.forEach(([D, yaw], i) => {
        const x = 150 + i * 255, sc = 0.5;
        if (!row) { fig(g, D, POSES.stand, yaw, {}, x, FY, sc); return; }
        const c = document.createElement("canvas"); c.width = 700; c.height = 760; const q = c.getContext("2d")!;
        q.translate(350, 720); q.scale(sc, sc); D.draw(new Ink(q, D.ol), solve(D.props("sir"), POSES.stand, yaw), {});
        q.setTransform(1, 0, 0, 1, 0, 0); q.globalCompositeOperation = "source-in"; q.fillStyle = INK; q.fillRect(0, 0, 700, 760);
        g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(c, x - 350, FY - 720);
      });
    }
    label(g, "SIR DIGSWORTH BLAND BIFIGURERNA", CW / 2, 690, 28); label(g, "SAMMA RAD SOM SILUETTER", CW / 2, 1360, 28);
  }
  g.setTransform(1, 0, 0, 1, 0, 0);
};
export const CastViews: React.FC = () => {
  const fr = useCurrentFrame();
  return (<AbsoluteFill style={{ background: BG }}><canvas width={CW} height={CH} ref={(cv) => { if (cv) paint(cv.getContext("2d")!, fr); }} /></AbsoluteFill>);
};
