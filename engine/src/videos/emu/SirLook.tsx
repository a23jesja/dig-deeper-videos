// Check picture for Sir Digsworth's drawing: four close-ups + one full figure, drawn straight onto a 2D canvas.
// node scripts/stills.mjs SirLook out/sir/look_ 0 1 png
import React from "react";
import { AbsoluteFill, getInputProps, useCurrentFrame } from "remotion";
import { FAMILY } from "./titanic3Scenes";
import { Pen, bodyFront, bodySide, setTalk, SIR_DIGSWORTH, Expr } from "./toon";

export const SirLook: React.FC = () => {
  const fr = useCurrentFrame();
  const props = getInputProps() as { y0?: number; squint?: string; views?: boolean; family?: boolean };
  const y0 = props.y0 ?? 195, squint = (props.squint ?? "squint") as Expr;
  return (
    <AbsoluteFill style={{ background: "#f4ecd8" }}>
      <canvas width={1920} height={1080} ref={(cv) => {
        if (!cv) return;
        const g = cv.getContext("2d")!;
        g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, 1920, 1080);
        g.fillStyle = "#f4ecd8"; g.fillRect(0, 0, 1920, 1080);
        if (props.family || fr === 1) { // frame 1: the family on one ground line, two of them seated
          g.fillStyle = "#1c2438"; g.fillRect(0, 0, 1920, 1080);
          const sc = 0.82, gy = 1020, list: [any, any, number][] = [[SIR_DIGSWORTH, { expr: "neutral" }, 0], [FAMILY.officer, { expr: "stern" }, 1], [FAMILY.lady, { expr: "shock" }, 2], [FAMILY.kid, { expr: "nervous" }, 3], [FAMILY.gent, { expr: "shock" }, 4],
            [FAMILY.lady, { expr: "neutral", mode: "sit" }, 5], [FAMILY.kid, { expr: "smile", mode: "sit" }, 6]];
          g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = "#2a3350"; g.fillRect(0, gy, 1920, 60);
          for (const [o, extra, i] of list) { g.setTransform(sc, 0, 0, sc, 150 + i * 255 - 300 * sc, gy - 975 * sc); setTalk(0); bodyFront(new Pen(g), o, { mode: "stand", seed: 3 + i, ...extra }); }
          return;
        }
        if (props.views) { // other views: side walk, side stand, back, sit, cheer, point, talk, shrug
          const vs: ((p: Pen) => void)[] = [
            (p) => bodySide(p, SIR_DIGSWORTH, { mode: "stand", seed: 3 }),
            (p) => bodySide(p, SIR_DIGSWORTH, { mode: "march", phase: 0.2, seed: 3 }),
            (p) => bodyFront(p, SIR_DIGSWORTH, { mode: "stand", seed: 3, back: true }),
            (p) => bodyFront(p, SIR_DIGSWORTH, { mode: "sit", expr: "smile", seed: 3 }),
            (p) => bodyFront(p, SIR_DIGSWORTH, { mode: "stand", expr: "grin", seed: 3, cheer: 1 }),
            (p) => bodyFront(p, SIR_DIGSWORTH, { mode: "stand", expr: "smile", seed: 3, point: 1 }),
            (p) => { setTalk(0.9); bodyFront(p, SIR_DIGSWORTH, { mode: "stand", seed: 3 }); setTalk(0); },
            (p) => bodyFront(p, SIR_DIGSWORTH, { mode: "stand", seed: 3, shrug: 1, blink: 0.6 }),
          ];
          vs.forEach((v, i) => { g.setTransform(0.44, 0, 0, 0.44, 20 + i * 235, 300); v(new Pen(g)); });
          return;
        }
        const label = (t: string, x: number, y: number) => { g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = "#3b2a1a"; g.font = "bold 28px sans-serif"; g.fillText(t, x, y); };
        const cells: [string, Expr, number, number][] = [
          ["Neutral", "neutral", 40, 60], ["Förvånad", "shock", 610, 60],
          ["Kisande", squint, 40, 600], ["Glad", "grin", 610, 600],
        ];
        const cw = 540, ch = 470, s = cw / 450;
        for (const [name, expr, x, y] of cells) {
          g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
          g.beginPath(); g.rect(x, y, cw, ch); g.clip();
          g.fillStyle = "#fbf6e8"; g.fillRect(x, y, cw, ch);
          g.setTransform(s, 0, 0, s, x - 75 * s, y - y0 * s);
          setTalk(0);
          bodyFront(new Pen(g), SIR_DIGSWORTH, { mode: "stand", expr, seed: 3 });
          g.restore();
          g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.strokeStyle = "#b9a98a"; g.lineWidth = 2; g.strokeRect(x, y, cw, ch); g.restore();
          label(name, x, y - 12);
        }
        // full figure
        const fs = 0.96, fx = 1270, fy = 70;
        g.setTransform(fs, 0, 0, fs, fx, fy);
        g.fillStyle = "rgba(60,40,20,0.2)"; g.beginPath(); g.ellipse(300, 978, 150, 14, 0, 0, Math.PI * 2); g.fill();
        g.strokeStyle = "#8a7a5a"; g.lineWidth = 3; g.beginPath(); g.moveTo(-40, 979); g.lineTo(640, 979); g.stroke();
        setTalk(0);
        bodyFront(new Pen(g), SIR_DIGSWORTH, { mode: "stand", expr: "neutral", seed: 3 });
        label("Helfigur", fx, fy - 30);
      }} />
    </AbsoluteFill>
  );
};
