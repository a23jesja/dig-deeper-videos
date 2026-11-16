// Check picture for the Roman cast of the Pompeii film: frame 0 = everyone in a row beside Sir Digsworth (full figure, one ground line),
// frame 1 = poses (running, loaf, purse, hands on the cap, the dog sitting, standing, running, barking).
// node scripts/stills.mjs PompCast out/pomp1/cast_ 0,1 1 png
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Pen, bodyFront, setTalk, SIR_DIGSWORTH, ROMAN_BAKER, ROMAN_SOLDIER, ROMAN_MERCHANT, ROMAN_BOY, ROMAN_WOMAN, Outfit, FrontOpts } from "./toon";
import { dogSide, DogOpts, fxLoaf, fxPumice, fxCoin, fxTile } from "./dogtoon";

export const POMP_CAST_FRAMES = 4;
export const PompCast: React.FC = () => {
  const fr = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#c9b89a" }}>
      <canvas width={2240} height={1000} ref={(cv) => {
        if (!cv) return;
        const g = cv.getContext("2d")!;
        g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, 2240, 1000);
        g.fillStyle = "#d8c6a2"; g.fillRect(0, 0, 2240, 1000); g.fillStyle = "#a89674"; g.fillRect(0, 930, 2240, 70);
        const sc = fr === 0 ? 1.32 : 0.92, slot = fr === 0 ? 300 : 262, gy = 930;
        const fig = (o: Outfit, fo: FrontOpts, i: number, seed: number, x = 0, talk = 0) => { g.setTransform(sc * 0.5, 0, 0, sc * 0.5, 10 + i * slot - 300 * sc * 0.5 + 150 + x, gy - 975 * sc * 0.5); setTalk(talk); bodyFront(new Pen(g), o, { mode: "stand", seed, ...fo }); setTalk(0); };
        const dog = (o: DogOpts, i: number, w = 900, s = 0.3) => { g.setTransform(s, 0, 0, s, 10 + i * slot, gy - 975 * s); dogSide(new Pen(g), o); void w; };
        if (fr === 0) {
          fig(SIR_DIGSWORTH, { expr: "neutral" }, 0, 3);
          fig(ROMAN_BAKER, { expr: "grin" }, 1, 11); fig(ROMAN_SOLDIER, { expr: "stern" }, 2, 12); fig(ROMAN_MERCHANT, { expr: "neutral" }, 3, 13);
          fig(ROMAN_BOY, { expr: "grin" }, 4, 14); fig(ROMAN_WOMAN, { expr: "nervous" }, 5, 15);
          dog({ mode: "sit", chain: true, expr: "happy", k: 0.25 }, 6, 900, 0.46);
        } else if (fr === 1) {
          fig(ROMAN_BAKER, { mode: "march", phase: 0.15, lift: 110, run: 1, expr: "shock", hands: undefined }, 0, 21);
          fig(ROMAN_BAKER, { hands: "loaf", expr: "shock" }, 1, 22);
          fig(ROMAN_SOLDIER, { mode: "march", phase: 0.65, lift: 110, run: 1, expr: "shock" }, 2, 23);
          fig(ROMAN_MERCHANT, { hands: "purse", expr: "shock" }, 3, 24);
          fig(SIR_DIGSWORTH, { hands: "head", expr: "shock" }, 4, 3);
          fig(ROMAN_WOMAN, { mode: "march", phase: 0.2, lift: 90, expr: "shock" }, 5, 25);
          dog({ mode: "stand", expr: "calm" }, 6, 900, 0.3); dog({ mode: "run", phase: 0.2, expr: "happy" }, 7, 900, 0.3);
          g.setTransform(1, 0, 0, 1, 0, 0);
        } else if (fr === 3) {   // measuring sheet: plain magenta, scale 0.5, persons in 300 px cells (row 2), dogs in 450 px cells (row 1); sizes for scripts/kit_check.mjs are read off this still
          g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = "#ff00ff"; g.fillRect(0, 0, 2240, 1000);
          const cells: [Outfit, FrontOpts][] = [[SIR_DIGSWORTH, {}], [ROMAN_BAKER, {}], [ROMAN_SOLDIER, {}], [ROMAN_MERCHANT, {}], [ROMAN_BOY, {}], [ROMAN_WOMAN, {}]];
          cells.forEach(([o, fo], i) => { g.setTransform(0.5, 0, 0, 0.5, i * 300, 450); setTalk(0); bodyFront(new Pen(g), o, { mode: "stand", seed: 3, expr: "neutral", ...fo }); });
          (["sit", "stand", "run", "bark"] as const).forEach((m, i) => { g.setTransform(0.5, 0, 0, 0.5, i * 450, 0); dogSide(new Pen(g), { mode: m, chain: false, k: 0.25, phase: 0.2 }); });
          g.setTransform(1, 0, 0, 1, 0, 0);
        } else {
          dog({ mode: "bark", expr: "shock" }, 0, 900, 0.3); dog({ mode: "sit", chain: false, expr: "happy", k: 0.6 }, 1, 900, 0.3);
          const card = (draw: (p: Pen) => void, x: number, y: number, s: number) => { g.setTransform(s, 0, 0, s, x, y); draw(new Pen(g)); };
          card(fxLoaf, 700, 700, 1.2); card((p) => fxPumice(p, 1), 1000, 650, 1.2); card((p) => fxPumice(p, 4), 1300, 700, 0.8); card(fxCoin, 1500, 700, 1.2); card(fxTile, 1700, 700, 1.2);
        }
      }} />
    </AbsoluteFill>
  );
};
