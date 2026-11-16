// Three thumbnails (1080 x 1920) for "I Survived Pompeii: Part 1": stills from the film's own world, 2-3 huge words in the free band under the biggest figure.
// node scripts/stills.mjs Pompeii1Thumb out/pomp1/thumb_ 0,1,2 1 png
import React, { useEffect, useState } from "react";
import { AbsoluteFill, Sequence, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import { Film, FilmView } from "./Emu";
import { loadModels } from "./env/models";
import { THUMB, SHOW_P1, TOTAL_P1, layersP1, dofAtP1 } from "./pompeii1";

const FILM: Film = { W: 1080, H: 1920, total: TOTAL_P1, flashAt: -100, show: SHOW_P1, layersAt: layersP1, dofAt: dofAtP1, words: [], audio: "pompeii/mix-1.wav", cap: { top: "67.5%", size: 92, stroke: 14 } };
/** the film frame of each thumbnail and its words: [top y in px, [line, colour][]] */
const THUMBS: { f: number; y: number; lines: [string, string][]; size: number }[] = [
  { f: 28, y: 1352, lines: [["IT JUST", "#ffffff"], ["EXPLODED", "#ffe14d"]], size: 130 },
  { f: 1180, y: 1352, lines: [["NOT RAIN.", "#ffffff"], ["STONES.", "#ffe14d"]], size: 130 },
  { f: 1000, y: 1352, lines: [["RUN.", "#ffe14d"]], size: 270 },
];
export const POMPEII1_THUMB_FRAMES = THUMBS.length;
export const Pompeii1Thumb: React.FC = () => {
  const i = Math.min(useCurrentFrame(), THUMBS.length - 1), T = THUMBS[i];
  THUMB.mode = i;
  const [ok, setOk] = useState(false);
  const [h] = useState(() => delayRender("models"));
  useEffect(() => { loadModels((p) => staticFile(p)).then(() => { setOk(true); continueRender(h); }); }, [h]);
  if (!ok) return null;
  return (
    <AbsoluteFill>
      <Sequence from={i - T.f} layout="none"><FilmView film={FILM} /></Sequence>
      <div style={{ position: "absolute", left: 0, width: 1080, top: T.y, display: "flex", flexDirection: "column", alignItems: "center", fontFamily: "'Arial Black', Impact, sans-serif", lineHeight: 1.0, letterSpacing: -2 }}>
        {T.lines.map(([l, c]) => <div key={l} style={{ fontSize: T.size, color: c, WebkitTextStroke: "24px #101014", paintOrder: "stroke fill", textShadow: "0 9px 0 rgba(16,16,20,0.9)", whiteSpace: "nowrap", strokeLinejoin: "round" } as React.CSSProperties}>{l}</div>)}
      </div>
    </AbsoluteFill>
  );
};
