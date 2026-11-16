// "I Survived Pompeii: Part 1" (Short, 1080 x 1920): the Roman street world with the engine's drawn cast, hook text, one-word captions, sound.
import React, { useEffect, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import { Film, FilmView } from "./Emu";
import { loadModels } from "./env/models";
import { SHOW_P1, TOTAL_P1, HOOK, HOOK_END, PART2, PART2_A, WORDS_P1, CHUNKS, layersP1, dofAtP1 } from "./pompeii1";

const FILM: Film = { W: 1080, H: 1920, total: TOTAL_P1, flashAt: -100, show: SHOW_P1, layersAt: layersP1, dofAt: dofAtP1, words: WORDS_P1, chunks: CHUNKS, capFrom: HOOK_END, lens: { maxCoC: 36, nearScale: 3 }, audio: "pompeii/mix-1.wav", cap: { top: "78%", size: 132, stroke: 20, chunks: true } };
export const POMPEII1_FRAMES = TOTAL_P1;
export const bigText = (lines: string[], T: { x: number; y: number; w: number; h: number; size: number }, pop: number): React.ReactElement => (
  <div style={{ position: "absolute", left: T.x, width: T.w, top: T.y, height: T.h, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Arial Black', Impact, sans-serif", fontSize: T.size, lineHeight: 1.06, color: "#ffe14d",
    WebkitTextStroke: "16px #101014", paintOrder: "stroke fill", textShadow: "0 7px 0 rgba(16,16,20,0.9)", whiteSpace: "nowrap", scale: String(pop), letterSpacing: -2 } as React.CSSProperties}>{lines.map((l) => <div key={l}>{l}</div>)}</div>
);
export const Pompeii1: React.FC = () => {
  const f = useCurrentFrame();
  const [ok, setOk] = useState(false);
  const [h] = useState(() => delayRender("models"));
  useEffect(() => { loadModels((p) => staticFile(p)).then(() => { setOk(true); continueRender(h); }); }, [h]);
  if (!ok) return null;
  const pop = f === 0 ? 1 : f === 1 ? 1.08 : 1, pop2 = f === PART2_A ? 0.9 : f === PART2_A + 1 ? 1.08 : 1;
  return (
    <AbsoluteFill>
      <FilmView film={FILM} />
      {f < HOOK_END && bigText(HOOK.lines, HOOK, pop)}
      {f >= PART2_A && bigText(PART2.lines, PART2, pop2)}
    </AbsoluteFill>
  );
};
