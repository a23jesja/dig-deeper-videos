// "The Great Emu War" (Sir Digsworth short): flat ink-outlined characters in a painted 3D world.
// One three.js world (world.ts) posed per frame from the story (story.ts + scenes.ts). Post chain, as in the
// claude-animated-shorts engine: InkPass -> lens blur pre + main -> bloom -> NEUTRAL tone map -> grade, MSAA 4.
// Place changes crossfade by stacking a second canvas; the hook ends on a 4-frame white flash.
// Captions (one word at a time) and the mixed sound track are added here.
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
import { TOTAL, FLASH_AT, SHOTS, FPS, layersAt, dofAt } from "./story";
import wordsJson from "./words.json";

export const EMU_FRAMES = TOTAL;
type Props = { post?: { ink?: boolean; lens?: boolean; bloom?: boolean; grade?: boolean; dpr?: number }; captions?: boolean; audio?: boolean };
const props = () => getInputProps() as Props;

const makeBloom = () => {
  const b = new BloomEffect({ blendFunction: BlendFunction.ADD, intensity: 0.5, luminanceThreshold: 1.0, luminanceSmoothing: 0.2, mipmapBlur: true, levels: 6, radius: 0.6 });
  const mip = b.mipmapBlurPass;
  const setSize = mip.setSize.bind(mip);
  mip.setSize = (w: number, h: number) => setSize(Math.round((1920 * w) / Math.max(h, 1)), 1920);
  return b;
};
const fwd = new THREE.Vector3(), fpt = new THREE.Vector3();

const Inner: React.FC<{ id: number }> = ({ id }) => {
  const f = useCurrentFrame();
  const { camera, scene } = useThree();
  const world = useMemo(() => new World(), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  const on = useMemo(() => ({ ink: true, lens: true, bloom: true, grade: true, ...(props().post ?? {}) }), []);
  const fx = useMemo(() => ({
    ink: new InkPass(scene, camera as THREE.PerspectiveCamera),
    lens: new LensBlur({ maxCoC: 24, nearScale: 1.2 }),
    bloom: makeBloom(),
    tone: new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL }),
    grade: new GradeEffect(GRADES.day, GRADE_STRENGTH.day),
  }), [camera, scene]);
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
  const d = dofAt(f);
  cam.getWorldDirection(fwd);
  if (d.focus) fpt.set(...d.focus(f)); else fpt.copy(target);
  fx.lens.focus = Math.max(0.3, fpt.sub(cam.position).dot(fwd));
  fx.lens.cInf = d.cInf;
  gradeFor(fx.grade, SHOTS[id - 1].light);
  return (
    <>
      <primitive object={world.root} dispose={null} />
      {post}
    </>
  );
};

const ShotView: React.FC<{ id: number; alpha: number }> = ({ id, alpha }) => {
  const dpr = props().post?.dpr;
  return (
    <AbsoluteFill style={{ opacity: alpha }}>
      <ThreeCanvas width={1080} height={1920} {...(dpr ? { dpr } : {})} shadows gl={{ antialias: false, stencil: false, powerPreference: "high-performance", toneMappingExposure: 1.0 }}
        camera={{ fov: 40, near: 0.2, far: 1500 }}>
        <Inner id={id} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

// ---------------- captions: one word at a time, hard swaps ----------------
type Word = { w: string; a: number; b: number; line: string };
const WORDS = wordsJson as Word[];
const clean = (w: string) => w.replace(/[.,:;!?]+$/g, "").replace(/^[("]+/, "");
const Captions: React.FC = () => {
  const f = useCurrentFrame(), t = f / FPS;
  let cur: Word | null = null;
  for (let i = 0; i < WORDS.length; i++) {
    const w = WORDS[i], next = WORDS[i + 1];
    const end = next && next.a - w.b < 0.45 ? next.a : w.b + 0.22;
    if (t >= w.a - 0.03 && t < end - 0.03) { cur = w; break; }
  }
  if (!cur) return null;
  const n = Math.max(0, f - Math.round((cur.a - 0.03) * FPS)), pop = n === 0 ? 0.9 : n === 1 ? 1.06 : 1;
  const big = /\d/.test(cur.w);
  return (
    <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center" }}>
      <div style={{
        position: "absolute", top: "67.5%", transform: `translateY(-50%) scale(${pop})`, fontFamily: "'Arial Black', 'Segoe UI Black', Impact, sans-serif", fontWeight: 900,
        fontSize: big ? 104 : 92, letterSpacing: -1, color: big ? "#ffe14d" : "#ffffff", WebkitTextStroke: "14px #101014", paintOrder: "stroke fill", textShadow: "0 7px 0 rgba(16,16,20,0.9)",
        whiteSpace: "nowrap", lineHeight: 1,
      }}>{clean(cur.w)}</div>
    </AbsoluteFill>
  );
};

export const EmuShort: React.FC = () => {
  const f = useCurrentFrame();
  const p = props();
  const flash = f >= FLASH_AT && f < FLASH_AT + 4 ? [1, 0.75, 0.45, 0.2][f - FLASH_AT] : 0;
  return (
    <AbsoluteFill style={{ background: "#cfe3f2" }}>
      {layersAt(f).map((l, i) => <ShotView key={i ? "over" : "base"} id={l.id} alpha={l.alpha} />)}
      {flash > 0 && <AbsoluteFill style={{ background: "#ffffff", opacity: flash }} />}
      {p.captions !== false && <Captions />}
      {p.audio !== false && <Audio src={staticFile("emu/mix.wav")} />}
    </AbsoluteFill>
  );
};
