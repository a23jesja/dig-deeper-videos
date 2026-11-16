// Craft kit, step 1 (views): check sheets for the four views of the drawn cast (src/craft/toon.ts).
// frame 0 = Sir Digsworth front, three-quarter, side, back and a close-up; frame 1 = the same turned the other way and walking;
// frame 2 = the shared base for side characters (a Roman baker, a Roman woman, a gentleman of 1912) in the same four views.
// PROPS='{"audio":false}' node scripts/stills.mjs SirViews out/craft/views_ 0,1,2 1 png
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Pen, figure, setTalk, SIR_DIGSWORTH, ROMAN_BAKER, ROMAN_WOMAN, ROMAN_SOLDIER, Outfit, FigOpts, View } from "./toon";

export const SIR_VIEWS_FRAMES = 3;
const W = 2600, H = 1400, BG = "#d8c6a2", FLOOR = "#a89674";
export const SirViews: React.FC = () => {
  const fr = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: BG }}>
      <canvas width={W} height={H} ref={(cv) => {
        if (!cv) return;
        const g = cv.getContext("2d")!;
        g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = BG; g.fillRect(0, 0, W, H);
        const label = (t: string, x: number, y: number, px = 40) => { g.setTransform(1, 0, 0, 1, 0, 0); g.font = `700 ${px}px Arial`; g.textAlign = "center"; g.fillStyle = "#3b2a1a"; g.fillText(t, x, y); };
        // a figure whose soles stand at (x, y) on the sheet, sc = scale of the 600 x 1000 design space
        const fig = (o: Outfit, fo: FigOpts, sc: number, x: number, y: number) => { g.setTransform(sc, 0, 0, sc, x - 300 * sc, y - 975 * sc); setTalk(0); figure(new Pen(g), o, { mode: "stand", seed: 3, light: -2.1, ...fo }); };
        const row = (o: Outfit, views: [View, 1 | -1, string, Partial<FigOpts>?][], y: number, sc: number, x0: number, dx: number) => {
          g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = FLOOR; g.fillRect(x0 - dx / 2, y, dx * views.length, 26);
          views.forEach(([view, dir, name, extra], i) => { fig(o, { view, dir, ...extra }, sc, x0 + i * dx, y); label(name, x0 + i * dx, y + 80); });
        };
        if (fr === 0) {
          row(SIR_DIGSWORTH, [["front", 1, "FRONT"], ["quarter", 1, "THREE-QUARTER"], ["side", 1, "SIDE"], ["back", 1, "BACK"]], 1230, 1.42, 240, 468);
          g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = "#cbb78f"; g.fillRect(1900, 60, 660, 1250);
          g.save(); g.beginPath(); g.rect(1900, 60, 660, 1250); g.clip();
          fig(SIR_DIGSWORTH, { view: "quarter", dir: 1 }, 2.9, 2205, 60 + 2.9 * 975 - 2.9 * 215);
          g.restore(); label("CLOSE-UP", 2230, 1368);
        } else if (fr === 1) {
          row(SIR_DIGSWORTH, [["quarter", -1, "THREE-QUARTER, LEFT"], ["side", -1, "SIDE, LEFT"], ["quarter", 1, "WALKING", { mode: "walk", phase: 0.12 }], ["side", 1, "WALKING", { mode: "walk", phase: 0.12 }], ["back", 1, "WALKING AWAY", { mode: "walk", phase: 0.12 }], ["front", 1, "SHOCK", { expr: "shock" }]], 1230, 1.3, 262, 422);
        } else {
          row(ROMAN_BAKER, [["front", 1, "FRONT"], ["quarter", 1, "THREE-QUARTER"], ["side", 1, "SIDE"], ["back", 1, "BACK"]], 590, 0.72, 190, 300);
          row(ROMAN_WOMAN, [["front", 1, "FRONT"], ["quarter", 1, "THREE-QUARTER"], ["side", 1, "SIDE"], ["back", 1, "BACK"]], 590, 0.72, 1490, 300);
          row(ROMAN_SOLDIER, [["front", 1, "FRONT"], ["quarter", 1, "THREE-QUARTER"], ["side", 1, "SIDE"], ["back", 1, "BACK"]], 1300, 0.72, 190, 300);
          row({ jacket: "#3d4258", pants: "#2e3142", boots: "#241726", hat: "bowler", cap: "#2b2a30", moustache: "#5b3a22", gent: true, tie: "#7a2f4a" }, [["front", 1, "FRONT"], ["quarter", 1, "THREE-QUARTER"], ["side", 1, "SIDE"], ["back", 1, "BACK"]], 1300, 0.72, 1490, 300);
        }
        g.setTransform(1, 0, 0, 1, 0, 0);
      }} />
    </AbsoluteFill>
  );
};
