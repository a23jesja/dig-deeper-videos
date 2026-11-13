// Sir Digsworth films: flat ink-outlined characters in a painted 3D world.
// One three.js world (world.ts) posed per frame from a film's story + scenes. Post chain, as in the
// claude-animated-shorts engine: InkPass -> lens blur pre + main -> bloom -> NEUTRAL tone map -> grade, MSAA 4.
// Place changes crossfade by stacking a second canvas; the hook ends on a 4-frame white flash.
// Captions (one word at a time) and the mixed sound track are added here.
//   EmuShort: "The Great Emu War" (1080 x 1920, 55 s)      EmuLong: "The Army That Lost a War to Birds" (1920 x 1080, 3 min)
import React, { useEffect, useMemo } from "react";
import * as THREE from "three";
import { AbsoluteFill, Audio, getInputProps, staticFile, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { EffectComposer } from "@react-three/postprocessing";
import { BlendFunction, BloomEffect, ToneMappingEffect, ToneMappingMode } from "postprocessing";
import { World } from "./world";
import { InkPass, noInkFallback } from "./ink";
import { LensBlur } from "./lensblur";
import { GradeEffect, GRADES, GRADE_STRENGTH, gradeFor } from "./grade";
import { TOTAL, FLASH_AT, FPS, layersAt, dofAt, V3 } from "./story";
import { EMU_SHOW, Show } from "./scenes";
import { LONG_SHOW } from "./scenesLong";
import { TOTAL_L, FLASH_L, layersL, dofAtL } from "./storyLong";
import wordsJson from "./words.json";
import wordsLongJson from "./wordsLong.json";
import { WOJTEK_SHOW } from "./scenesW";
import { TOTAL_W, FLASH_W, layersW, dofAtW } from "./storyW";
import wordsWJson from "./wordsW.json";
import { WOJTEK_LONG_SHOW } from "./scenesWL";
import { TOTAL_WL, FLASH_WL, layersWL, dofAtWL } from "./storyWL";
import wordsWLJson from "./wordsWL.json";
import { PIG_SHOW } from "./scenesP";
import { TOTAL_P, FLASH_P, layersP, dofAtP } from "./storyP";
import wordsPJson from "./wordsP.json";
import { PIG_LONG_SHOW } from "./scenesPL";
import { TOTAL_PL, FLASH_PL, layersPL, dofAtPL } from "./storyPL";
import wordsPLJson from "./wordsPL.json";
import { LUSTIG_SHOW } from "./scenesLs";
import { TOTAL_LS, FLASH_LS, layersLs, dofAtLs } from "./storyLs";
import wordsLsJson from "./wordsLs.json";

type Word = { w: string; a: number; b: number; line: string };
type Film = {
  W: number; H: number; total: number; flashAt: number; show: Show;
  layersAt: (f: number) => { id: number; alpha: number }[];
  dofAt: (f: number) => { cInf: number; focus?: (f: number) => V3 };
  words: Word[]; audio: string; cap: { top: string; size: number; stroke: number };
};
const SHORT: Film = { W: 1080, H: 1920, total: TOTAL, flashAt: FLASH_AT, show: EMU_SHOW, layersAt, dofAt, words: wordsJson as Word[], audio: "emu/mix.wav", cap: { top: "67.5%", size: 92, stroke: 14 } };
const LONG: Film = { W: 1920, H: 1080, total: TOTAL_L, flashAt: FLASH_L, show: LONG_SHOW, layersAt: layersL, dofAt: dofAtL, words: wordsLongJson as Word[], audio: "emu/mix-long.wav", cap: { top: "86%", size: 70, stroke: 11 } };
const WSHORT: Film = { W: 1080, H: 1920, total: TOTAL_W, flashAt: FLASH_W, show: WOJTEK_SHOW, layersAt: layersW, dofAt: dofAtW, words: wordsWJson as Word[], audio: "wojtek/mix.wav", cap: { top: "67.5%", size: 92, stroke: 14 } };
const WLONG: Film = { W: 1920, H: 1080, total: TOTAL_WL, flashAt: FLASH_WL, show: WOJTEK_LONG_SHOW, layersAt: layersWL, dofAt: dofAtWL, words: wordsWLJson as Word[], audio: "wojtek/mix-long.wav", cap: { top: "86%", size: 70, stroke: 11 } };
const PSHORT: Film = { W: 1080, H: 1920, total: TOTAL_P, flashAt: FLASH_P, show: PIG_SHOW, layersAt: layersP, dofAt: dofAtP, words: wordsPJson as Word[], audio: "pig/mix.wav", cap: { top: "67.5%", size: 92, stroke: 14 } };
const PLONG: Film = { W: 1920, H: 1080, total: TOTAL_PL, flashAt: FLASH_PL, show: PIG_LONG_SHOW, layersAt: layersPL, dofAt: dofAtPL, words: wordsPLJson as Word[], audio: "pig/mix-long.wav", cap: { top: "86%", size: 70, stroke: 11 } };
const LSHORT: Film = { W: 1080, H: 1920, total: TOTAL_LS, flashAt: FLASH_LS, show: LUSTIG_SHOW, layersAt: layersLs, dofAt: dofAtLs, words: wordsLsJson as Word[], audio: "lustig/mix.wav", cap: { top: "67.5%", size: 92, stroke: 14 } };
export const PIG_FRAMES = TOTAL_P, PIG_LONG_FRAMES = TOTAL_PL, LUSTIG_FRAMES = TOTAL_LS;
export const EMU_FRAMES = TOTAL, EMU_LONG_FRAMES = TOTAL_L, WOJTEK_FRAMES = TOTAL_W, WOJTEK_LONG_FRAMES = TOTAL_WL;

type Props = { post?: { ink?: boolean; lens?: boolean; bloom?: boolean; grade?: boolean; dpr?: number }; captions?: boolean; audio?: boolean };
const props = () => getInputProps() as Props;

const makeBloom = (H: number) => {
  const b = new BloomEffect({ blendFunction: BlendFunction.ADD, intensity: 0.5, luminanceThreshold: 1.0, luminanceSmoothing: 0.2, mipmapBlur: true, levels: 6, radius: 0.6 });
  const mip = b.mipmapBlurPass;
  const setSize = mip.setSize.bind(mip);
  mip.setSize = (w: number, h: number) => setSize(Math.round((H * w) / Math.max(h, 1)), H);
  return b;
};
const fwd = new THREE.Vector3(), fpt = new THREE.Vector3();

const Inner: React.FC<{ id: number; film: Film }> = ({ id, film }) => {
  const f = useCurrentFrame();
  const { camera, scene } = useThree();
  const world = useMemo(() => new World(film.show), [film]);
  const target = useMemo(() => new THREE.Vector3(), []);
  const on = useMemo(() => ({ ink: true, lens: true, bloom: true, grade: true, ...(props().post ?? {}) }), []);
  const fx = useMemo(() => ({
    ink: new InkPass(scene, camera as THREE.PerspectiveCamera),
    lens: new LensBlur({ maxCoC: 24, nearScale: 1.2 }),
    bloom: makeBloom(film.H),
    tone: new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL }),
    grade: new GradeEffect(GRADES.day, GRADE_STRENGTH.day),
  }), [camera, scene, film]);
  useEffect(() => () => fx.ink.dispose(), [fx]);
  const post = useMemo(() => {
    const kids = [
      on.ink ? <primitive key="ink" object={fx.ink} dispose={null} /> : null,
      on.lens ? <primitive key="pre" object={fx.lens.pre} dispose={null} /> : null,
      on.lens ? <primitive key="main" object={fx.lens.main} dispose={null} /> : null,
      on.bloom ? <primitive key="bloom" object={fx.bloom} dispose={null} /> : null,
      <primitive key="tone" object={fx.tone} dispose={null} />,
      on.grade ? <primitive key="grade" object={fx.grade} dispose={null} /> : null,
    ].filter(Boolean) as React.JSX.Element[];
    return <EffectComposer multisampling={4}>{kids}</EffectComposer>;
  }, [fx, on]);
  const cam = camera as THREE.PerspectiveCamera;
  target.copy(world.update(id, f, cam, scene));
  noInkFallback(world.root);
  const d = film.dofAt(f);
  cam.getWorldDirection(fwd);
  if (d.focus) fpt.set(...d.focus(f)); else fpt.copy(target);
  fx.lens.focus = Math.max(0.3, fpt.sub(cam.position).dot(fwd));
  fx.lens.cInf = d.cInf;
  gradeFor(fx.grade, film.show.shots[id - 1].light);
  return (
    <>
      <primitive object={world.root} dispose={null} />
      {post}
    </>
  );
};

const ShotView: React.FC<{ id: number; alpha: number; film: Film }> = ({ id, alpha, film }) => {
  const dpr = props().post?.dpr;
  return (
    <AbsoluteFill style={{ opacity: alpha }}>
      <ThreeCanvas width={film.W} height={film.H} {...(dpr ? { dpr } : {})} shadows gl={{ antialias: false, stencil: false, powerPreference: "high-performance", toneMappingExposure: 1.0 }}
        camera={{ fov: 40, near: 0.2, far: 1500 }}>
        <Inner id={id} film={film} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

// ---------------- captions: one word at a time, hard swaps ----------------
const clean = (w: string) => w.replace(/[.,:;!?]+$/g, "").replace(/^[("]+/, "");
const Captions: React.FC<{ film: Film }> = ({ film }) => {
  const f = useCurrentFrame(), t = f / FPS, W = film.words;
  let cur: Word | null = null;
  for (let i = 0; i < W.length; i++) {
    const w = W[i], next = W[i + 1];
    const end = next && next.a - w.b < 0.45 ? next.a : w.b + 0.22;
    if (t >= w.a - 0.03 && t < end - 0.03) { cur = w; break; }
  }
  if (!cur) return null;
  const n = Math.max(0, f - Math.round((cur.a - 0.03) * FPS)), pop = n === 0 ? 0.9 : n === 1 ? 1.06 : 1;
  const big = /\d/.test(cur.w), c = film.cap;
  return (
    <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center" }}>
      <div style={{
        position: "absolute", top: c.top, transform: `translateY(-50%) scale(${pop})`, fontFamily: "'Arial Black', 'Segoe UI Black', Impact, sans-serif", fontWeight: 900,
        fontSize: big ? c.size * 1.13 : c.size, letterSpacing: -1, color: big ? "#ffe14d" : "#ffffff", WebkitTextStroke: `${c.stroke}px #101014`, paintOrder: "stroke fill", textShadow: "0 6px 0 rgba(16,16,20,0.9)",
        whiteSpace: "nowrap", lineHeight: 1,
      }}>{clean(cur.w)}</div>
    </AbsoluteFill>
  );
};

const FilmView: React.FC<{ film: Film }> = ({ film }) => {
  const f = useCurrentFrame();
  const p = props();
  const flash = f >= film.flashAt && f < film.flashAt + 4 ? [1, 0.75, 0.45, 0.2][f - film.flashAt] : 0;
  return (
    <AbsoluteFill style={{ background: "#cfe3f2" }}>
      {film.layersAt(f).map((l, i) => <ShotView key={i ? "over" : "base"} id={l.id} alpha={l.alpha} film={film} />)}
      {flash > 0 && <AbsoluteFill style={{ background: "#ffffff", opacity: flash }} />}
      {p.captions !== false && <Captions film={film} />}
      {p.audio !== false && <Audio src={staticFile(film.audio)} />}
    </AbsoluteFill>
  );
};
export const EmuShort: React.FC = () => <FilmView film={SHORT} />;
export const EmuLong: React.FC = () => <FilmView film={LONG} />;
export const WojtekShort: React.FC = () => <FilmView film={WSHORT} />;
export const WojtekLong: React.FC = () => <FilmView film={WLONG} />;
export const PigShort: React.FC = () => <FilmView film={PSHORT} />;
export const PigLong: React.FC = () => <FilmView film={PLONG} />;
export const LustigShort: React.FC = () => <FilmView film={LSHORT} />;
