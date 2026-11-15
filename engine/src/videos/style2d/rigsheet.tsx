// The Sir Digsworth rig on show: `RigSheet` (one 1920x1080 picture: the joints, the draw order taken apart, six
// acted poses) and `RIG_FILM` (a 9 s acting test: breathing and blinking, anticipation and a wave, squash and
// stretch with shock lines, a hat tip with a bent spine, the telescope in both hands).
//   node scripts/stills.mjs RigSheet out/rig/sheet_ 0 1 png        (ENTRY=src/index2d.ts)
//   npx remotion render src/index2d.ts RigTest out/rig/rig-test.mp4
import React from "react";
import { AbsoluteFill } from "remotion";
import { cane, EASE, FACES, Hold, INK, mixFace, Part, Pose, SIR, SirDigsworth, solve, telescope, tw, Z_ORDER } from "./fig";
import { Draw, Film, GROUND, Scene } from "./scenes";

const FONT = "'Arial Black', 'Segoe UI Black', Impact, sans-serif";
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const c01 = (t: number) => Math.min(1, Math.max(0, t));
const mix2 = (a: [number, number], b: [number, number], t: number): [number, number] => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
const RED = "#d2302a";

// ---------------------------------------------------------------- the sheet
const BASE: Pose = { x: 0, y: 0, k: 1, turn: 0.3, lean: 4, bend: 5, bob: -0.05, front: "R", handL: [-0.36, 0.84], handR: [0.44, 1.22], headTilt: 3, still: true, face: { ...FACES.neutral, smile: 0.9, browY: [0.4, 0.8], lookX: 0.4 } };
const ACTS: { name: string; p: Partial<Pose>; hold?: Hold }[] = [
  { name: "IDLE", p: { turn: 0.1, lean: 1, bend: 0, bob: 0, handR: [0.3, 0.64], headTilt: 0, face: { ...FACES.neutral, smile: 0.6 } }, hold: { L: cane } },
  { name: "ANTICIPATION", p: { turn: 0.2, lean: -7, bend: -8, bob: -0.13, stretch: 0.9, handR: [0.2, 0.52], neck: 6, face: { ...FACES.sly, lookX: 0.6 } }, hold: { L: cane } },
  { name: "SHOCK", p: { turn: 0, lean: -3, bend: -4, bob: 0.05, stretch: 1.1, handL: [-0.44, 1.26], handR: [0.46, 1.3], hatLift: 0.09, shock: 9, sweat: 6, footL: [-0.13, 0.05], footR: [0.13, 0.02], face: { ...FACES.shock } } },
  { name: "HAT TIP", p: { turn: 0.15, lean: 9, bend: 10, handR: [0.3, 1.6], hatLift: 0.11, headTilt: 7, face: { ...FACES.neutral, smile: 1.2, eye: 0.3, browY: [0.7, 0.7] } }, hold: { L: cane } },
  { name: "TELESCOPE", p: { turn: 0.7, lean: 5, bend: 3, front: "L", handL: [0.16, 1.4], handR: [0.47, 1.44], face: { ...FACES.neutral, eye: 0.3, smile: 0.7, browY: [0.6, -0.2] } }, hold: { both: telescope("L") } },
  { name: "PLEADING", p: { turn: -0.35, lean: -6, bend: -7, bob: -0.04, front: "L", handL: [-0.3, 1.02], handR: [-0.1, 0.98], headTilt: -6, sweat: 9, nervous: 1, face: { ...FACES.worried, eye: 1.2, open: 0.3 } } },
];
const LEVELS: { part: Part; name: string }[] = [{ part: "backArm", name: "4 BACK ARM + CANE" }, { part: "body", name: "5 LEGS + TORSO" }, { part: "head", name: "6 HEAD · PIPE · HAT" }, { part: "frontArm", name: "7 FRONT ARM" }, { part: "all", name: "ASSEMBLED" }];
const Label: React.FC<{ x: number; y: number; t: string; size?: number; fill?: string; anchor?: "start" | "middle" | "end" }> = ({ x, y, t, size = 26, fill = INK, anchor = "middle" }) => <text x={x} y={y} textAnchor={anchor} fontFamily={FONT} fontSize={size} fill={fill}>{t}</text>;
export const RigSheet: React.FC = () => {
  const J: Pose = { ...BASE, x: 350, y: 985, k: 370 }, g = solve(J, SIR);
  const px = (m: [number, number]) => g.S(m), bones: [number, number][][] = [
    [g.hipS, g.neckS, g.head], ...g.arms.map((a) => [px(a.sho), px(a.elb), px(a.hand)]), ...g.legs.map((l) => [px(l.hip), px(l.knee), px(l.ank), px([l.foot[0] + 0.07, l.foot[1] + 0.02])]),
  ];
  // labels in two columns, a dashed leader to each joint
  const tags: { at: [number, number]; t: string; left: boolean; y: number }[] = [
    { at: g.head, t: "HEAD", left: true, y: 250 }, { at: g.neckS, t: "NECK", left: true, y: 400 }, { at: px(g.arms[0].sho), t: "SHOULDER", left: true, y: 500 }, { at: px(g.arms[0].elb), t: "ELBOW", left: true, y: 600 },
    { at: px(g.arms[0].hand), t: "WRIST", left: true, y: 700 }, { at: px(g.arms[1].hand), t: "HAND", left: false, y: 330 }, { at: px(g.arms[1].elb), t: "ELBOW", left: false, y: 470 }, { at: g.hipS, t: "HIP", left: false, y: 640 },
    { at: px(g.legs[1].knee), t: "KNEE", left: false, y: 800 }, { at: px(g.legs[1].ank), t: "ANKLE", left: false, y: 900 },
  ];
  return (
    <AbsoluteFill style={{ background: "#f3ead6" }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        <Label x={40} y={70} t="SIR DIGSWORTH · THE RIG" size={46} anchor="start" />
        <Label x={40} y={112} t="one chain of joints, limbs as curves, a strict draw order" size={22} fill="#7a5238" anchor="start" />
        {/* 1: the joints */}
        <g opacity={0.5}><SirDigsworth p={J} hold={{ L: cane }} /></g>
        {bones.map((b, i) => <path key={i} d={"M" + b.map((q) => q.join(" ")).join(" L")} fill="none" stroke={RED} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />)}
        {bones.flat().map((q, i) => <circle key={i} cx={q[0]} cy={q[1]} r={10} fill="#fff" stroke={RED} strokeWidth={5} />)}
        {tags.map((tg, i) => (<g key={i}><path d={`M${tg.at[0]} ${tg.at[1]} L${tg.left ? 150 : 560} ${tg.y - 8}`} stroke={INK} strokeWidth={2.5} strokeDasharray="6 6" /><Label x={tg.left ? 142 : 568} y={tg.y} t={tg.t} size={21} anchor={tg.left ? "end" : "start"} /></g>))}
        <Label x={350} y={1040} t="hip → spine → neck → head" size={17} fill="#7a5238" />
        <Label x={350} y={1064} t="shoulder → elbow → wrist → hand · hip → knee → ankle → foot" size={17} fill="#7a5238" />
        {/* 2: the draw order, taken apart */}
        <path d="M704 150 L704 1050" stroke="#c9b48a" strokeWidth={4} />
        <Label x={740} y={190} t="DRAW ORDER, BACK TO FRONT" size={30} anchor="start" />
        {LEVELS.map((lv, i) => (<g key={i}>
          <SirDigsworth p={{ ...BASE, x: 850 + i * 232, y: 548, k: 166 }} part={lv.part} hold={{ L: cane }} />
          <Label x={850 + i * 232} y={586} t={lv.name} size={17} fill={i === 4 ? RED : INK} />
          {i < 4 && <Label x={966 + i * 232} y={420} t={i === 3 ? "=" : "+"} size={40} fill="#7a5238" />}
        </g>))}
        {Z_ORDER.map((z, i) => <text key={i} x={1290} y={36 + i * 18.5} fontFamily="monospace" fontWeight={700} fontSize={15} fill={i > 2 && i < 7 ? RED : "#5a4a34"}>{z.replace(/\s{2,}/g, "  ")}</text>)}
        {/* 3: acting */}
        <Label x={740} y={660} t="ACTING: SQUASH, STRETCH, A BENT SPINE, PROPS IN THE GRIP" size={30} anchor="start" />
        {ACTS.map((a, i) => (<g key={i}>
          <SirDigsworth p={{ ...BASE, handR: [0.3, 0.64], ...a.p, x: 815 + i * 200, y: 1012, k: 150, still: true }} hold={a.hold} />
          <Label x={815 + i * 200} y={1052} t={a.name} size={18} />
        </g>))}
      </svg>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- the acting test
const BEATS: [number, string][] = [[0, "1 BREATHING AND BLINKING"], [45, "2 ANTICIPATION, WAVE"], [98, "3 SQUASH AND STRETCH"], [150, "4 HAT TIP, BENT SPINE"], [202, "5 TELESCOPE, TWO HANDS"]];
export const RIG_TOTAL = 272;
const RIG_SCENE: Scene = {
  name: "rig", from: 0, to: RIG_TOTAL,
  draw: (t) => {
    const k = 620, x = 540, bump = (t0: number, d: number) => Math.sin(Math.PI * c01((t - t0) / d));
    const wA = bump(45, 9), wU = EASE.back(c01((t - 52) / 10)) * (1 - tw(t, 86, 10)), wave = wU * Math.sin((t - 60) * 0.55);
    const sA = bump(98, 6), hop = bump(103, 10), sU = EASE.back(c01((t - 103) / 8)) * (1 - tw(t, 136, 12));
    const hA = bump(150, 7), hU = EASE.inOut(c01((t - 156) / 12)) * (1 - tw(t, 184, 12));
    const tA = bump(202, 7), tU = EASE.back(c01((t - 207) / 12)) * (1 - tw(t, 256, 12)), scan = Math.sin((t - 220) * 0.13) * c01(tU);
    const rest: [number, number] = [0.3, 0.64], idle = 1 - c01(Math.max(wU, sU, hU, tU));
    let handR = mix2(mix2(rest, [0.24, 0.52], wA), [0.44 + 0.09 * wave, 1.3 + 0.04 * Math.cos((t - 60) * 0.55)], c01(wU));
    handR = mix2(mix2(mix2(handR, [0.46, 1.3], c01(sU)), [0.3, 1.6], hU), [0.47 + 0.02 * scan, 1.44 + 0.05 * scan], c01(tU));
    const handL = mix2(mix2([-0.36, 0.84], [-0.44, 1.26], c01(sU)), [0.16 + 0.015 * scan, 1.4 + 0.035 * scan], c01(tU));
    const p: Pose = { x, y: GROUND, k, turn: lerp(lerp(0.14 * Math.sin(t * 0.07), 0, c01(sU)), 0.7, c01(tU)), front: tU > 0.25 ? "L" : "R",
      lean: 1.5 * Math.sin(t * 0.06) - 6 * wA + 3 * c01(wU) - 3 * sA - 2 * c01(sU) - 3 * hA + 9 * hU - 3 * tA + 5 * c01(tU),
      bend: -7 * wA + 4 * c01(wU) - 8 * sA - 3 * c01(sU) - 3 * hA + 10 * hU - 4 * tA + 3 * c01(tU),
      stretch: 1 - 0.07 * wA + 0.03 * bump(52, 10) - 0.11 * sA + 0.1 * hop - 0.05 * hA - 0.05 * tA + 0.03 * bump(207, 12),
      bob: -0.06 * wA - 0.12 * sA + 0.07 * hop - 0.05 * hA - 0.05 * tA, neck: 5 * wA - 5 * c01(sU) + 4 * hU + 4 * c01(tU), headTilt: 3 * wave + 7 * hU,
      handL, handR, footL: [-0.09 - 0.04 * c01(sU), 0.08 * hop], footR: [0.09 + 0.04 * c01(sU), 0.06 * hop], hatLift: 0.09 * hop + 0.03 * c01(sU) + 0.11 * hU,
      lookAt: idle > 0.5 && t < 44 ? [540 + 330 * Math.sin(t * 0.1), 640 - 160 * Math.cos(t * 0.1)] : undefined,
      shock: t >= 103 && t < 142 ? t - 103 : undefined, sweat: t >= 103 && t < 146 ? t - 103 : undefined, nervous: c01(sU),
      face: mixFace(mixFace(mixFace(mixFace({ ...FACES.neutral, smile: 0.6 }, { ...FACES.glee }, c01(wU)), { ...FACES.shock }, c01(sU)), { ...FACES.neutral, smile: 1.2, eye: 0.3, browY: [0.7, 0.7] }, hU), { ...FACES.neutral, eye: 0.3, smile: 0.7, browY: [0.6, -0.2] }, c01(tU)) };
    const q = t - 103, shake = q >= 0 ? Math.sin(q * 2.3) * 12 * Math.exp(-q / 8) : 0, e = EASE.soft(t / RIG_TOTAL), beat = [...BEATS].reverse().find((b) => t >= b[0])!;
    return [{ t: "cam", z: lerp(1, 1.06, e) + 0.03 * c01(sU), cx: 540 + shake, cy: 900 + shake * 0.4, px: lerp(-16, 16, e) + 14 * c01(tU) }, { t: "bg", img: "deck", zoom: 1.16, ox: 0, oy: 0 },
      { t: "fig", who: "sir", c: SIR, p, hold: tU > 0.25 ? { both: telescope("L") } : { L: cane } },
      { t: "tag", text: beat[1], y: 1462, age: t - beat[0] }] as Draw[];
  },
};
export const RIG_FILM: Film = { scenes: [RIG_SCENE], caps: [], cast: { sir: SIR }, audio: "", bgDir: "titanic", total: RIG_TOTAL, hook: [] };
