// Three thumbnails (1080 x 1920) for "I Survived the Titanic: Part 3": strong stills from the film's own world, 2-3 huge words on top.
// node scripts/stills.mjs Titanic3Thumb out/tit3/thumb_ 0,1,2 1 png
import React, { useEffect, useState } from "react";
import { AbsoluteFill, Sequence, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import { Film, FilmView } from "./Emu";
import { loadModels } from "./env/models";
import { THUMB, SHOW_T3, TOTAL_T3, layersT3, dofAtT3 } from "./titanic3";

const FILM: Film = { W: 1080, H: 1920, total: TOTAL_T3, flashAt: -100, show: SHOW_T3, layersAt: layersT3, dofAt: dofAtT3, words: [], audio: "titanic/mix-3.wav", cap: { top: "67.5%", size: 92, stroke: 14 } };
/** the film frame of each thumbnail and its words: [top y in px, [line, colour][]] */
const THUMBS: { f: number; y: number; lines: [string, string][]; size: number }[] = [
  { f: 22, y: 1372, lines: [["STILL", "#ffffff"], ["ON BOARD", "#ffe14d"]], size: 150 },
  { f: 630, y: 285, lines: [["2:20 A.M.", "#ffe14d"]], size: 150 },
  { f: 690, y: 290, lines: [["30 MEN,", "#ffffff"], ["1 BOAT", "#ffe14d"]], size: 170 },
];
export const TITANIC3_THUMB_FRAMES = THUMBS.length;
export const Titanic3Thumb: React.FC = () => {
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
        {T.lines.map(([l, c]) => <div key={l} style={{ fontSize: T.size, color: c, WebkitTextStroke: "26px #101014", paintOrder: "stroke fill", textShadow: "0 10px 0 rgba(16,16,20,0.9)", whiteSpace: "nowrap", strokeLinejoin: "round" } as React.CSSProperties}>{l}</div>)}
      </div>
    </AbsoluteFill>
  );
};
