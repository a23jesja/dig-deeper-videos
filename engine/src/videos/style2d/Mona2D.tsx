// Short 1 in 2D: "Someone stole the Mona Lisa". Draws the scene lists from scenes.tsx in three layers that move
// at different speeds under one camera (painted background, characters, foreground), then the captions and tags.
// One <Sequence> per scene; every animation is a function of the frame.
import React from "react";
import { AbsoluteFill, Audio, getInputProps, Img, Sequence, staticFile, useCurrentFrame } from "remotion";
import type { Caption } from "@remotion/captions";
import { Fig, INK } from "./fig";
import { DEPTH, Draw, Film, FPS, H, Layer, MONA_FILM, paintBox, Scene, tagBox, W } from "./scenes";
import { TITANIC1, TITANIC1_THUMB } from "./titanic1";
import { DANCE } from "./dance";
import { TITANIC2, TITANIC2_THUMB } from "./titanic2";

const FONT = "'Arial Black', 'Segoe UI Black', Impact, sans-serif";
const pop = (n: number) => (n <= 0 ? 0.6 : n === 1 ? 1.12 : n === 2 ? 0.97 : 1);

const Paint: React.FC<{ d: Extract<Draw, { t: "paint" }> }> = ({ d }) => {
  const b = paintBox(d), f = d.w * 0.11, id = `p${Math.round(d.cx)}_${Math.round(d.cy)}_${d.kind}`;
  const tr = `translate(${d.cx} ${d.cy}) rotate(${d.rot ?? 0}) scale(${d.scale ?? 1}) translate(${-d.cx} ${-d.cy})`;
  if (d.kind === "bundle") return (
    <g transform={tr}>
      <path d={`M${b.x + 14} ${b.y + 8} Q${d.cx} ${b.y - 14} ${b.x + b.w - 10} ${b.y + 12} Q${b.x + b.w + 12} ${d.cy} ${b.x + b.w - 8} ${b.y + b.h - 10} Q${d.cx} ${b.y + b.h + 12} ${b.x + 10} ${b.y + b.h - 8} Q${b.x - 12} ${d.cy} ${b.x + 14} ${b.y + 8} Z`} fill="#f4f1e6" stroke={INK} strokeWidth={9} strokeLinejoin="round" />
      <path d={`M${b.x + 30} ${b.y + b.h * 0.3} Q${d.cx} ${b.y + b.h * 0.36} ${b.x + b.w - 24} ${b.y + b.h * 0.28} M${b.x + 26} ${b.y + b.h * 0.7} Q${d.cx} ${b.y + b.h * 0.64} ${b.x + b.w - 26} ${b.y + b.h * 0.72} M${d.cx + 30} ${b.y + 14} Q${d.cx + 10} ${d.cy} ${d.cx + 34} ${b.y + b.h - 14}`} fill="none" stroke="#8f97a6" strokeWidth={7} strokeLinecap="round" />
      <circle cx={d.cx + 22} cy={b.y + b.h * 0.3} r={11} fill="#8f97a6" stroke={INK} strokeWidth={5} /><circle cx={d.cx + 24} cy={b.y + b.h * 0.7} r={11} fill="#8f97a6" stroke={INK} strokeWidth={5} />
    </g>
  );
  const inner = d.kind === "mona" ? f : 10;
  return (
    <g clipPath={d.clipBelow ? `url(#${id}c)` : undefined}>
    {d.clipBelow && <clipPath id={`${id}c`}><rect x={0} y={0} width={W} height={d.clipBelow} /></clipPath>}
    <g transform={tr}>
      <rect x={b.x + 8} y={b.y + 12} width={b.w} height={b.h} fill="rgba(30,8,6,0.28)" />
      <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={d.kind === "mona" ? 8 : 3} fill={d.kind === "mona" ? "#e2a92c" : "#7a5238"} stroke={INK} strokeWidth={9} strokeLinejoin="round" />
      {d.kind === "mona" && <rect x={b.x + f * 0.42} y={b.y + f * 0.42} width={b.w - f * 0.84} height={b.h - f * 0.84} fill="none" stroke="#a8761a" strokeWidth={5} />}
      <clipPath id={id}><rect x={b.x + inner} y={b.y + inner} width={b.w - 2 * inner} height={b.h - 2 * inner} /></clipPath>
      <image href={staticFile("mona2d/mona.jpg")} x={b.x + inner} y={b.y + inner} width={b.w - 2 * inner} height={b.h - 2 * inner} preserveAspectRatio="xMidYMid slice" clipPath={`url(#${id})`} />
      <rect x={b.x + inner} y={b.y + inner} width={b.w - 2 * inner} height={b.h - 2 * inner} fill="none" stroke={INK} strokeWidth={6} />
    </g>
    </g>
  );
};

const Tag: React.FC<{ d: Extract<Draw, { t: "tag" }> }> = ({ d }) => {
  const b = tagBox(d), long = d.text.length > 18;
  return (
    <g transform={`translate(${W / 2} ${b.y + 48}) scale(${pop(d.age)}) translate(${-W / 2} ${-(b.y + 48)})`}>
      <rect x={b.x} y={b.y} width={b.w} height={96} rx={14} fill={INK} stroke="#f6efdc" strokeWidth={5} />
      <text x={W / 2} y={b.y + (long ? 67 : 70)} textAnchor="middle" fontFamily={FONT} fontSize={long ? 54 : 64} fill="#ffe14d" letterSpacing={1}>{d.text}</text>
      {d.sub && <text x={W / 2} y={b.y + 146} textAnchor="middle" fontFamily={FONT} fontSize={46} fill="#ffffff" stroke={INK} strokeWidth={10} paintOrder="stroke" strokeLinejoin="round">{d.sub}</text>}
    </g>
  );
};

const layerOf = (d: Draw): Layer => (d.t === "node" ? d.layer ?? "mid" : "mid");
const LAYERS: Layer[] = ["sky", "sea", "bg", "mid", "fg"];
/** Strict order, back to front: painted background | sky | sea | background props | characters | foreground | tags.
 *  Each layer takes its own share of the camera's zoom and pan (parallax). Every layer but the sky is drawn through
 *  a small displacement filter whose noise changes five times a second, so outlines wobble like re-inked drawings. */
const SceneView: React.FC<{ scene: Scene; film: Film; at?: number }> = ({ scene, film, at: fixed }) => {
  const frame = useCurrentFrame(), t = fixed ?? frame, T = scene.to - scene.from, ds = scene.draw(t, T), abs = scene.from + t;
  const ip = getInputProps() as { texture?: boolean };
  const cam = (ds.find((d) => d.t === "cam") as Extract<Draw, { t: "cam" }> | undefined) ?? { t: "cam", z: 1, cx: W / 2, cy: H / 2 };
  const rot = cam.rot ?? 0, px = cam.px ?? 0, py = cam.py ?? 0;
  const tf = (l: Layer) => { const z = 1 + (cam.z - 1) * DEPTH[l].z; return `translate(${-px * DEPTH[l].pan} ${-py * DEPTH[l].pan}) translate(${cam.cx} ${cam.cy}) rotate(${rot}) scale(${z}) translate(${-cam.cx} ${-cam.cy})`; };
  const bgd = ds.find((d) => d.t === "bg") as Extract<Draw, { t: "bg" }>;
  const s = (H / 2208) * bgd.zoom, zb = 1 + (cam.z - 1) * DEPTH.paint.z;
  const draw = (d: Draw, i: number) => d.t === "fig" ? <Fig key={i} p={d.p} c={d.c ?? film.cast[d.who]} part={d.part} hold={d.hold} f={abs} /> : d.t === "paint" ? <Paint key={i} d={d} /> : d.t === "node" ? <g key={i}>{d.el}</g> : null;
  const boil = Math.floor(abs / 6) % 5;
  const layer = (name: Layer) => {
    const items = ds.map((d, i) => (d.t !== "tag" && d.t !== "cam" && d.t !== "bg" && layerOf(d) === name ? draw(d, i) : null));
    if (!items.some(Boolean)) return null;
    const rough = ip.texture !== false && name !== "sky", id = `ink-${scene.name}-${name}`;
    return (
      <svg key={name} width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", left: 0, top: 0 }}>
        {rough && <defs><filter id={id} filterUnits="userSpaceOnUse" x={-40} y={-40} width={W + 80} height={H + 80}>
          <feTurbulence type="fractalNoise" baseFrequency={0.022} numOctaves={2} seed={3 + boil * 11 + LAYERS.indexOf(name)} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={5.5} xChannelSelector="R" yChannelSelector="G" />
        </filter></defs>}
        <g filter={rough ? `url(#${id})` : undefined}><g transform={tf(name)}>{items}</g></g>
      </svg>
    );
  };
  return (
    <AbsoluteFill style={{ background: "#2a1a16" }}>
      <Img src={staticFile(`${film.bgDir}/${bgd.img}.jpg`)} style={{ position: "absolute", width: 1248 * s, height: 2208 * s, left: (W - 1248 * s) / 2 + bgd.ox, top: (H - 2208 * s) / 2 + bgd.oy, transformOrigin: `${cam.cx - ((W - 1248 * s) / 2 + bgd.ox)}px ${cam.cy - ((H - 2208 * s) / 2 + bgd.oy)}px`, translate: `${-px * DEPTH.paint.pan}px ${-py * DEPTH.paint.pan}px`, scale: String(zb), rotate: `${rot}deg` }} />
      {LAYERS.map(layer)}
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", left: 0, top: 0 }}>
        {ds.map((d, i) => (d.t === "tag" && d.age >= 0 ? <Tag key={i} d={d} /> : null))}
      </svg>
    </AbsoluteFill>
  );
};

const outline = (px: number): React.CSSProperties => ({ WebkitTextStroke: `${px}px #101014`, paintOrder: "stroke fill", textShadow: "0 6px 0 rgba(16,16,20,0.9)" } as React.CSSProperties);
/** the hook, as text while the voice says it (in the caption band; the word captions start after it) */
const HookText: React.FC<{ film: Film }> = ({ film }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", top: 1214, left: 0, right: 0, textAlign: "center", fontFamily: FONT, lineHeight: 1.04 }}>
      {film.hook.map((h, i) => (f >= h.from ? <div key={i} style={{ fontSize: h.size, color: h.color, whiteSpace: "nowrap", scale: String(f < 3 ? 1 : pop(f - h.from + (h.from ? 0 : 3))), ...outline(h.size > 120 ? 20 : 14) }}>{h.text}</div> : null))}
    </div>
  );
};
const clean = (w: string) => w.trim().replace(/[.,:;!?]+$/g, "").replace(/^[("]+/, "");
/** one word at a time, hard swaps, at 67.5 % */
const Captions: React.FC<{ captions: Caption[]; from: number }> = ({ captions, from }) => {
  const f = useCurrentFrame(), ms = (f / FPS) * 1000;
  if (f < from) return null;
  let cur: Caption | null = null;
  for (let i = 0; i < captions.length; i++) {
    const w = captions[i], next = captions[i + 1];
    const end = next && next.startMs - w.endMs < 450 ? next.startMs : w.endMs + 220;
    if (ms >= w.startMs - 30 && ms < end - 30) { cur = w; break; }
  }
  if (!cur) return null;
  const n = Math.max(0, f - Math.round(((cur.startMs - 30) / 1000) * FPS)), big = /\d/.test(cur.text);
  return (
    <div style={{ position: "absolute", top: "67.5%", left: 0, right: 0, textAlign: "center", translate: "0 -50%", scale: String(n === 0 ? 0.9 : n === 1 ? 1.06 : 1), fontFamily: FONT, fontSize: 92, letterSpacing: -1, color: big ? "#ffe14d" : "#ffffff", whiteSpace: "nowrap", lineHeight: 1, ...outline(14) }}>{clean(cur.text)}</div>
  );
};

const FilmView: React.FC<{ film: Film }> = ({ film }) => {
  const p = getInputProps() as { audio?: boolean; text?: boolean };
  const hookEnd = film.scenes[0].to;
  return (
    <AbsoluteFill style={{ background: "#2a1a16" }}>
      {film.scenes.map((s) => (
        <Sequence key={s.name} name={s.name} from={s.from} durationInFrames={s.to - s.from}>
          <SceneView scene={s} film={film} />
        </Sequence>
      ))}
      {p.text !== false && <Sequence name="hook text" from={0} durationInFrames={hookEnd}><HookText film={film} /></Sequence>}
      {p.text !== false && <Captions captions={film.caps as unknown as Caption[]} from={hookEnd} />}
      {p.audio !== false && <Audio src={staticFile(film.audio)} />}
    </AbsoluteFill>
  );
};
export const Mona2D: React.FC = () => <FilmView film={MONA_FILM} />;
export const Titanic1: React.FC = () => <FilmView film={TITANIC1} />;
export const Dance: React.FC = () => <FilmView film={DANCE} />;
export const Titanic2: React.FC = () => <FilmView film={TITANIC2} />;

// ---------------------------------------------------------------- thumbnails: frames 0-2, one picture each
type Thumb = { scene: string | Scene; at: number; a: string; b: string; top?: boolean };
const THUMBS: Thumb[] = [
  { scene: "hook", at: 62, a: "GONE", b: "2 YEARS" },
  { scene: "react", at: 16, a: "WHERE", b: "IS SHE?" },
  { scene: "pic", at: 2, a: "WRONG", b: "MAN" },
];
const TITANIC_THUMBS: Thumb[] = [
  { scene: TITANIC1_THUMB, at: 0, a: "TOO", b: "LATE", top: true },
  { scene: "count", at: 70, a: "20", b: "LIFEBOATS" },
  { scene: "cliff", at: 40, a: "GOING", b: "DOWN" },
];
const ThumbView: React.FC<{ film: Film; thumbs: Thumb[] }> = ({ film, thumbs }) => {
  const f = useCurrentFrame(), th = thumbs[Math.min(2, f)], sc = typeof th.scene === "string" ? film.scenes.find((s) => s.name === th.scene)! : th.scene;
  return (
    <AbsoluteFill>
      <SceneView scene={sc} film={film} at={th.at} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0) 50%, rgba(10,4,2,0.55) 100%)" }} />
      {th.top && <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(8,10,22,0.6) 0%, rgba(8,10,22,0) 34%)" }} />}
      <div style={{ position: "absolute", top: th.top ? "5.5%" : "62%", left: 0, right: 0, textAlign: "center", fontFamily: FONT, lineHeight: 0.98, rotate: "-3deg" }}>
        <div style={{ fontSize: 220, color: "#ffffff", ...outline(30) }}>{th.a}</div>
        <div style={{ fontSize: th.b.length > 7 ? 150 : th.b.length > 6 ? 190 : 220, color: "#ffe14d", ...outline(30) }}>{th.b}</div>
      </div>
    </AbsoluteFill>
  );
};
export const Mona2DThumb: React.FC = () => <ThumbView film={MONA_FILM} thumbs={THUMBS} />;
export const Titanic1Thumb: React.FC = () => <ThumbView film={TITANIC1} thumbs={TITANIC_THUMBS} />;
const DANCE_THUMBS: Thumb[] = [
  { scene: "hook", at: 22, a: "CAN'T", b: "STOP" },
  { scene: "worse", at: 80, a: "400", b: "DANCERS" },
  { scene: "doctors", at: 110, a: "THE", b: "CURE?!" },
];
export const DanceThumb: React.FC = () => <ThumbView film={DANCE} thumbs={DANCE_THUMBS} />;
const TITANIC2_THUMBS: Thumb[] = [
  { scene: TITANIC2_THUMB, at: 0, a: "LEFT", b: "BEHIND", top: true },
  { scene: "none", at: 6, a: "NO", b: "BOATS" },
  { scene: "cliff", at: 54, a: "IT'S", b: "SINKING" },
];
export const Titanic2Thumb: React.FC = () => <ThumbView film={TITANIC2} thumbs={TITANIC2_THUMBS} />;
