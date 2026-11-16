// Check picture for the movements of the Pompeii film: the side-view sprint (six phases), things carried, Sir Digsworth ducking, the loaf.
// PROPS='{"audio":false}' node scripts/stills.mjs PompMoves out/pomp1/moves_ 0,1 1 png
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Pen, bodyFront, bodySide, setTalk, SIR_DIGSWORTH, ROMAN_BAKER, ROMAN_SOLDIER, ROMAN_MERCHANT, ROMAN_BOY, ROMAN_WOMAN, ROMAN_CROWD, Outfit, FrontOpts, SideOpts } from "./toon";
import { fxLoaf, fxCoin } from "./dogtoon";

export const POMP_MOVES_FRAMES = 2;
export const PompMoves: React.FC = () => {
  const fr = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#d8c6a2" }}>
      <canvas width={2400} height={1300} ref={(cv) => {
        if (!cv) return;
        const g = cv.getContext("2d")!;
        g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = "#d8c6a2"; g.fillRect(0, 0, 2400, 1300);
        const sc = 0.62;
        const row = (y: number) => { g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = "#a89674"; g.fillRect(0, y, 2400, 14); };
        const side = (o: Outfit, so: SideOpts, i: number, gy: number, seed = 11, mirror = false) => { g.setTransform(mirror ? -sc : sc, 0, 0, sc, i * 300 + (mirror ? 600 * sc : 0) - 30, gy - 975 * sc); setTalk(0); bodySide(new Pen(g), o, { seed, light: -2.1, ...so }); };
        const front = (o: Outfit, fo: FrontOpts, i: number, gy: number, seed = 3) => { g.setTransform(sc, 0, 0, sc, i * 300 - 30, gy - 975 * sc); setTalk(0); bodyFront(new Pen(g), o, { mode: "stand", seed, light: -2.1, ...fo }); };
        if (fr === 0) {
          row(630); row(1270);
          for (let i = 0; i < 8; i++) side(ROMAN_BAKER, { mode: "run", phase: i / 8, expr: "shock" }, i, 630, 11);
          side(ROMAN_SOLDIER, { mode: "run", phase: 0.1, expr: "shock" }, 0, 1270, 12);
          side(ROMAN_SOLDIER, { mode: "run", phase: 0.6, expr: "stern" }, 1, 1270, 12);
          side(ROMAN_MERCHANT, { mode: "run", phase: 0.2, expr: "shock", hold: "purse" }, 2, 1270, 13);
          side(ROMAN_WOMAN, { mode: "run", phase: 0.45, expr: "shock", hold: "bundle" }, 3, 1270, 15);
          side(ROMAN_CROWD[2], { mode: "run", phase: 0.7, expr: "nervous", hold: "amphora" }, 4, 1270, 21);
          side(ROMAN_BOY, { mode: "run", phase: 0.3, expr: "shock" }, 5, 1270, 14);
          side(ROMAN_BAKER, { mode: "run", phase: 0.85, expr: "shock", hold: "basket" }, 6, 1270, 11);
          side(ROMAN_CROWD[5], { mode: "run", phase: 0.5, expr: "shock" }, 7, 1270, 23, true);
        } else {
          row(630); row(1270);
          front(SIR_DIGSWORTH, { crouch: 0, hands: "head", expr: "shock" }, 0, 630);
          front(SIR_DIGSWORTH, { crouch: 0.5, hands: "head", expr: "shock", lookUp: 0.9, look: 0.4 }, 1, 630);
          front(SIR_DIGSWORTH, { crouch: 1, hands: "head", expr: "shock" }, 2, 630);
          front(SIR_DIGSWORTH, { mode: "march", phase: 0.15, lift: 110, run: 1, expr: "shock" }, 3, 630);
          front(SIR_DIGSWORTH, { mode: "march", phase: 0.65, lift: 110, hands: "head", crouch: 0.4, expr: "shock" }, 4, 630);
          front(SIR_DIGSWORTH, { mode: "march", phase: 0.4, lift: 100, run: 1, back: true }, 5, 630);
          front(SIR_DIGSWORTH, { hands: "loaf", expr: "smile" as never }, 6, 630);
          front(SIR_DIGSWORTH, { mode: "fall", expr: "shock" }, 7, 630);
          front(ROMAN_MERCHANT, { hands: "purseR", expr: "neutral" }, 0, 1270, 13);
          front(ROMAN_MERCHANT, { hands: "purse", expr: "shock" }, 1, 1270, 13);
          front(ROMAN_MERCHANT, { mode: "march", phase: 0.2, lift: 90, hands: "purse", expr: "shock" }, 2, 1270, 13);
          front(ROMAN_BAKER, { hands: "loaf", expr: "grin" }, 3, 1270, 11);
          front(ROMAN_SOLDIER, { mode: "march", phase: 0.15, lift: 110, run: 1, expr: "shock" }, 4, 1270, 12);
          front(ROMAN_WOMAN, { mode: "march", phase: 0.3, lift: 90, run: 1, expr: "shock", back: true }, 5, 1270, 15);
          g.setTransform(1.6, 0, 0, 1.6, 1830, 800); fxLoaf(new Pen(g)); g.setTransform(1.2, 0, 0, 1.2, 2200, 860); fxCoin(new Pen(g));
        }
        g.setTransform(1, 0, 0, 1, 0, 0);
      }} />
    </AbsoluteFill>
  );
};
