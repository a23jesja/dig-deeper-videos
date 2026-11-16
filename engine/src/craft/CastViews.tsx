// Step B: the view sheets of the chosen figure (cast.ts, looks.ts) on the skeleton (rig.ts).
//   frame 0 = Sir Digsworth front, three-quarter, side and back between the same guide lines, and a close-up with the chain
//   frame 1 = the same figure turned all the way round in steps of 30 degrees, walking, and to the left
//   frame 2 = the shared base: side characters from different eras and the dog, each in four views
//   frame 3 = the line-up: Sir Digsworth among them, in colour and as black silhouettes
//   frame 4 = the frozen look on one sheet (approved 2026-11-16): five views between the same guide lines, six faces, the faces at
//             phone size, the side view laughing and shocked, two side characters beside him (drawn 2600 x 1900, shown scaled)
// PROPS='{"audio":false}' node scripts/stills.mjs CastViews out/craft/cast_ 0-2 0.6 jpeg
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Ink } from "./ink";
import { solve, POSES, Pose, Props } from "./rig";
import { Design, FigOpts, Face } from "./designs/common";
import { SIR_D, BAKER_D, SOLDIER_D, MERCHANT_D, KNIGHT_D, TOMMY_D, LADY_D, DOCKER_D, BOY_D, GRANNY_D } from "./looks";
import { DOG, BEAST_POSES, drawBeast } from "./beast";
import { INK } from "./ink";
import { Mover } from "./motion";

export const CW = 2600, CH = 1400, CAST_VIEW_FRAMES = 5;
const BG = "#ecdfc2", FLOOR = "#cfbb90", TXT = "#3b2a1a";
type G = CanvasRenderingContext2D;
const tall = (P: Props) => P.thigh + P.shin + P.ankle + P.spine + P.neck + P.head;
let FZ: DOMMatrix | null = null;
const base = (g: G) => { if (FZ) g.setTransform(FZ); else g.setTransform(1, 0, 0, 1, 0, 0); };
const fig = (g: G, D: Design, pose: Pose, yaw: number, o: FigOpts, x: number, y: number, sc: number) => {
  g.save(); base(g); g.translate(x, y); g.scale(sc, sc); D.draw(new Ink(g, D.ol), solve(D.props("sir"), pose, yaw), o); g.restore();
};
const label = (g: G, t: string, x: number, y: number, px = 34, align: CanvasTextAlign = "center") => { base(g); g.font = `700 ${px}px Arial`; g.textAlign = align; g.fillStyle = TXT; g.fillText(t, x, y); };
const floor = (g: G, x0: number, x1: number, y: number) => { g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = FLOOR; g.fillRect(x0, y, x1 - x0, 22); };
const VIEWS: [number, string][] = [[0, "FRAMIFRÅN"], [45, "SNETT FRAMIFRÅN"], [90, "FRÅN SIDAN"], [180, "BAKIFRÅN"]];
const walkPose = (() => { const m = new Mover([0, 0], 0); m.walk(3); return m.sample(1.62).pose; })();

const A_FACES: [string, Face][] = [["NEUTRAL", {}], ["FÖRTJUST", { lid: 0.9, smile: 1, brow: 0.5 }], ["CHOCKAD", { wide: 1, lid: 0, brow: 1, mouth: 0.8, smile: -0.3 }], ["MISSTÄNKSAM", { lid: 0.52, brow: -0.5, smile: -0.6, gaze: [0.8, 0] }], ["ARG", { brow: -1, lid: 0.22, smile: -1, mouth: 0.14 }], ["SKRATTAR", { lid: 0.9, smile: 1, mouth: 1, brow: 0.4 }]];
const paintFrozen = (g: G) => {
  const D = SIR_D, P = D.props("sir"), sc = 0.7, FY = 900, T = tall(P);
  label(g, "SIR DIGSWORTH, FRYST UTSEENDE (2026-11-16): FEM VYER, SEX MINER, BIFIGURER I SAMMA FORM", 900, 64, 30);
  g.strokeStyle = "rgba(120,90,50,0.4)"; g.lineWidth = 2; g.setLineDash([10, 10]);
  for (const hgt of [T, P.thigh + P.shin + P.ankle + P.spine + P.neck, P.thigh + P.shin + P.ankle + P.spine - P.shDrop, P.thigh + P.shin + P.ankle]) { g.beginPath(); g.moveTo(30, FY - hgt * sc); g.lineTo(1810, FY - hgt * sc); g.stroke(); }
  g.setLineDash([]); g.fillStyle = FLOOR; g.fillRect(20, FY, 1800, 20);
  const views: [string, Pose, number][] = [["FRAMIFRÅN", POSES.stand, 0], ["SNETT FRAMIFRÅN", POSES.stand, 45], ["FRÅN SIDAN", POSES.standSide, 90], ["SIDAN ÅT ANDRA HÅLLET", POSES.standSide, -90], ["BAKIFRÅN", POSES.stand, 180]];
  views.forEach(([t, pose, yaw], i) => { const x = 200 + i * 360; fig(g, D, pose, yaw, {}, x, FY, sc); label(g, t, x, FY + 62, 24); });
  // six faces, large
  const hs = 0.92, hy = P.thigh + P.shin + P.ankle + P.spine + P.neck, FY2 = 1440;
  A_FACES.forEach(([t, face], i) => {
    const cx = 170 + i * 290, cy = FY2 - 170;
    base(g); g.fillStyle = "#e0d0aa"; g.fillRect(cx - 135, cy - 250, 270, 400);
    g.save(); g.beginPath(); g.rect(cx - 135, cy - 250, 270, 400); g.clip(); fig(g, D, POSES.stand, 0, { face }, cx, cy + 40 + hy * hs, hs); g.restore();
    label(g, t, cx, FY2 + 26, 26);
  });
  // the same faces at the size they have on a phone (a Short shown 360 points wide)
  const ms = 1.16 / 3, FY3 = 1700;
  label(g, "MOBILSTORLEK", 130, FY3 - 30, 22);
  A_FACES.forEach(([, face], i) => { const cx = 330 + i * 150; g.save(); base(g); g.beginPath(); g.rect(cx - 72, FY3 - 110, 144, 160); g.clip(); fig(g, D, POSES.stand, 0, { face }, cx, FY3 + 40 + hy * ms, ms); g.restore(); });
  // the side view laughing and shocked, and two side characters with the same larger heads
  const s4 = 0.42, FYs = 1500, FY4 = 1860, s5 = 0.28;
  base(g); g.fillStyle = FLOOR; g.fillRect(1820, FYs, 740, 14); g.fillRect(1300, FY4, 1260, 14);
  fig(g, D, POSES.standSide, 90, { face: { smile: 1, mouth: 0.9, lid: 0.9, brow: 0.4 } }, 2000, FYs, s4); fig(g, D, POSES.standSide, -90, { face: { wide: 1, lid: 0, brow: 1, mouth: 0.8 } }, 2370, FYs, s4);
  label(g, "SIDAN: SKRATTAR, CHOCKAD", 2190, FYs + 44, 22);
  fig(g, BAKER_D, POSES.stand, 0, { face: { smile: 0.9 } }, 1420, FY4, s5); fig(g, BAKER_D, POSES.standSide, 90, {}, 1640, FY4, s5);
  fig(g, SOLDIER_D, POSES.stand, 0, {}, 1900, FY4, s5); fig(g, SOLDIER_D, POSES.standSide, -90, {}, 2120, FY4, s5); fig(g, D, POSES.stand, 0, {}, 2400, FY4, s5);
  label(g, "BIFIGURER MED SAMMA STÖRRE HUVUD (BAGAREN, SOLDATEN) BREDVID SIR DIGSWORTH", 1930, FY4 + 40, 20);
  base(g);
};
const paint = (g: G, fr: number) => {
  FZ = null; g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = BG; g.fillRect(0, 0, CW, CH);
  if (fr === 4) { g.save(); const k = CH / 1900; g.translate((CW - 2600 * k) / 2, 0); g.scale(k, k); FZ = g.getTransform(); paintFrozen(g); g.restore(); return; }
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
