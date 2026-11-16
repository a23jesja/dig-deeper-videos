// Variant 2: the same painted background, the guard as a jointed cut-out puppet. Parts (public/threeway/*.png) were cut
// from model-painted sheet cells by out/three-ways/scripts/cut_guard.py, which also wrote rig.ts.
//   profile rig : head_side + torso_side (near arm painted on) + two legs (upper / lower / foot) with two-bone IK;
//                 the feet follow the engine's gait (stance foot fixed on the floor, swing foot on a cycloid)
//   front rig   : torso, arms (IK), legs, and a head that is swapped between three painted states
//   back        : one whole cut-out
// Seams: parts overlap ~10 px at every joint and a round cap in the limb's colour sits on each knee and elbow.
import React from "react";
import { Img, staticFile, useCurrentFrame } from "remotion";
import { guard, FIG, FLOOR_Y, sm, Guard } from "./scene";
import { Gallery, ContactShadow } from "./Gallery";
import { PARTS, J, FIG_W, FIG_H, LEG_COL, LEG_W } from "./rig";

type P2 = [number, number];
const K = FIG / 1.28;                       // the sheet cells are 1.28x the engine's design units
const deg = (r: number) => (r * 180) / Math.PI;
const ang = (a: P2, b: P2) => Math.atan2(b[1] - a[1], b[0] - a[0]);
const dist = (a: P2, b: P2) => Math.hypot(b[0] - a[0], b[1] - a[1]);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const norm = (d: number) => { let x = d; while (x > 180) x -= 360; while (x < -180) x += 360; return x; };
const NAVY = "#202a48";

const Rot: React.FC<{ at: P2; a: number; d?: P2; flip?: boolean; dim?: number; children?: React.ReactNode }> = ({ at, a, d = [0, 0], flip, dim, children }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: FIG_W, height: FIG_H, transformOrigin: `${at[0]}px ${at[1]}px`,
    transform: `translate(${d[0]}px, ${d[1]}px) rotate(${a}deg)${flip ? " scaleX(-1)" : ""}`, filter: dim ? `brightness(${dim})` : undefined }}>{children}</div>
);
const Part: React.FC<{ n: keyof typeof PARTS }> = ({ n }) => {
  const p = PARTS[n];
  return <Img src={staticFile("threeway/" + p.file)} style={{ position: "absolute", left: p.x, top: p.y, width: p.w, height: p.h }} />;
};
const Cap: React.FC<{ at: P2; r: number; col: string; ring?: string }> = ({ at, r, col, ring }) => (
  <div style={{ position: "absolute", left: at[0] - r, top: at[1] - r, width: 2 * r, height: 2 * r, borderRadius: "50%", background: col, boxShadow: ring ? `0 0 0 2.5px ${ring}` : undefined }} />
);
const ik = (root: P2, mid: P2, end: P2, target: P2, bend: number): [number, number] => {
  const l1 = dist(root, mid), l2 = dist(mid, end);
  const d = Math.max(Math.abs(l1 - l2) + 1, Math.min(l1 + l2 - 0.5, dist(root, target)));
  const base = ang(root, target), A = Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d))));
  const a1 = base + bend * A, m: P2 = [root[0] + l1 * Math.cos(a1), root[1] + l1 * Math.sin(a1)];
  const t: P2 = [root[0] + d * Math.cos(base), root[1] + d * Math.sin(base)];
  const r1 = norm(deg(a1 - ang(root, mid)));
  return [r1, norm(deg(ang(m, t) - ang(mid, end)) - r1)];
};

/** one leg of the profile rig: the front view's right leg parts, hung from the profile's hip */
const SideLeg: React.FC<{ hip: P2; ankle: P2; dim?: number }> = ({ hip, ankle, dim }) => {
  const off: P2 = [hip[0] - J.hipR[0], hip[1] - J.hipR[1]];
  const [a1, a2] = ik(J.hipR, J.knR, J.anR, [ankle[0] - off[0], ankle[1] - off[1]], -1);    // the knee bends forward
  return (
    <Rot at={J.hipR} a={a1} d={off} dim={dim}>
      <Part n="legR_upper" />
      <Rot at={J.knR} a={a2}><Part n="legR_lower" /><Rot at={J.anR} a={-(a1 + a2)}><Part n="footR" /></Rot></Rot>
      <Cap at={J.knR} r={LEG_W / 2 + 0.5} col={LEG_COL} />
    </Rot>
  );
};
const Side: React.FC<{ g: Guard }> = ({ g }) => {
  const S = 370 * 1.28 * g.stride, liftH = 34 * 1.28 * (g.stride / 0.7), L = J.anR[1] - J.hipR[1];
  const st = (ph: number) => {                                   // the engine's gait: stance foot fixed, swing foot on a cycloid
    const c = (((g.phase + ph) % 1) + 1) % 1;
    if (c < 0.5) { const s = c / 0.5; return { x: S / 2 - S * s, h: 0, stance: true, s }; }
    const s = (c - 0.5) / 0.5;
    return { x: -S / 2 + S * s - (S / (2 * Math.PI)) * Math.sin(2 * Math.PI * s), h: liftH * Math.sin(Math.PI * s), stance: false, s };
  };
  const near = st(0), far = st(0.5), stance = near.stance ? near : far;
  const drop = L - Math.sqrt(Math.max(1, L * L - stance.x * stance.x)) + 0.02 * L * Math.sin(Math.PI * stance.s) * (g.stride / 0.7);
  const hip: P2 = [J.s_hip[0], J.s_hip[1] + 13 + drop], ground = J.anR[1] + (J.s_hip[1] + 13 - J.hipR[1]);
  const lean = 3.5 * (g.stride / 0.7), nod = 1.2 * Math.sin(4 * Math.PI * g.phase) * (g.stride / 0.7);
  return (
    <>
      <SideLeg hip={hip} ankle={[hip[0] + far.x, ground - far.h]} dim={0.62} />
      <SideLeg hip={hip} ankle={[hip[0] + near.x, ground - near.h]} />
      <Rot at={J.s_hip} a={lean} d={[0, drop]}>
        <Part n="torso_side" />
        <Rot at={J.s_neck} a={-lean * 0.6 + nod}><Part n="head_side" /></Rot>
      </Rot>
    </>
  );
};
const Front: React.FC<{ g: Guard; f: number }> = ({ g, f }) => {
  const hop = g.shock ? -26 * Math.sin(Math.PI * sm((f - 215) / 12)) * (f < 227 ? 1 : 0) : 0;
  const down = (sh: P2, s: number): P2 => [sh[0] + s * 46, sh[1] + 250];
  const shake = g.arms * 10 * Math.sin(f * 1.1);
  const tL: P2 = [lerp(down(J.shL, -1)[0], J.wrL[0], g.arms) - shake, lerp(down(J.shL, -1)[1], J.wrL[1], g.arms)];
  const tR: P2 = [lerp(down(J.shR, 1)[0], J.wrR[0], g.arms) + shake, lerp(down(J.shR, 1)[1], J.wrR[1], g.arms)];
  const [l1, l2] = ik(J.shL, J.elL, J.wrL, tL, +1), [r1, r2] = ik(J.shR, J.elR, J.wrR, tR, -1);
  const head: keyof typeof PARTS = g.facing ? "head_look" : g.shock ? "head_shock" : "head_neutral";
  const arm = (sd: "L" | "R", a1: number, a2: number) => {
    const sh = sd === "L" ? J.shL : J.shR, el = sd === "L" ? J.elL : J.elR;
    return (
      <Rot at={sh} a={a1}>
        <Part n={`arm${sd}_upper` as keyof typeof PARTS} />
        <Rot at={el} a={a2}><Part n={`arm${sd}_lower` as keyof typeof PARTS} /><Part n={`hand${sd}` as keyof typeof PARTS} /></Rot>
        <Cap at={el} r={9} col={NAVY} ring={LEG_COL} />
      </Rot>
    );
  };
  return (
    <Rot at={J.hip} a={0} d={[0, hop]}>
      {(["L", "R"] as const).map((sd) => (<React.Fragment key={sd}><Part n={`leg${sd}_upper` as keyof typeof PARTS} /><Part n={`leg${sd}_lower` as keyof typeof PARTS} /><Part n={`foot${sd}` as keyof typeof PARTS} /></React.Fragment>))}
      <Part n="torso" />
      {arm("L", l1, l2)}{arm("R", r1, r2)}
      {/* head states: the "look" head is mirrored for looking left; a small turn sells the direction */}
      <Rot at={J.neck} a={g.facing * 8 + (g.shock ? 2 * Math.sin(f * 0.9) * g.arms : 0)} d={[g.facing * 18, 0]} flip={g.facing < 0}><Part n={head} /></Rot>
    </Rot>
  );
};

export const ThreeWay2: React.FC = () => {
  const f = useCurrentFrame(), g = guard(f);
  const side = g.view === "sideR" || g.view === "sideL";
  const cx = side ? J.s_hip[0] : g.view === "back" ? J.b_cx : J.hip[0], sole = g.view === "back" ? J.b_sole : J.sole;
  return (
    <Gallery f={f}>
      <ContactShadow x={g.x} spread={g.walking ? 1 + 0.25 * (g.stride / 0.7) : 1} />
      <div style={{ position: "absolute", left: g.x - cx * K, top: FLOOR_Y - sole * K, width: FIG_W, height: FIG_H, transformOrigin: "0 0", transform: `scale(${K})` }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: FIG_W, height: FIG_H, transformOrigin: `${cx}px 0`, transform: g.view === "sideL" ? "scaleX(-1)" : undefined }}>
          {side ? <Side g={g} /> : g.view === "back" ? <Part n="back" /> : <Front g={g} f={f} />}
        </div>
      </div>
    </Gallery>
  );
};
