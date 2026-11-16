// Jointed cut-out puppet of Sir Digsworth, built from transparent PNG parts (public/puppet/*.png) that were cut
// from one model-painted drawing. Rig data (part boxes and joints, in the 768 x 1280 space of that drawing) is in rig.ts,
// written by out/figures-ai/scripts/cut_parts.py. Forward kinematics with nested, rotated wrappers; limbs solved
// with a two-bone IK towards hand / ankle targets. Mouth and eyelid are small code-drawn overlays (no cut states).
import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { act } from "./act";
import { Room, Shadow, FLOOR_Y } from "./Room";
import { PARTS, J, FIG_W, FIG_H, SKIN, INK } from "./rig";

type P2 = [number, number];
const deg = (r: number) => (r * 180) / Math.PI;
const ang = (a: P2, b: P2) => Math.atan2(b[1] - a[1], b[0] - a[0]);
const dist = (a: P2, b: P2) => Math.hypot(b[0] - a[0], b[1] - a[1]);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerp2 = (a: P2, b: P2, t: number): P2 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
const norm = (d: number) => { let x = d; while (x > 180) x -= 360; while (x < -180) x += 360; return x; };

/** rotation wrapper: everything inside turns by `a` degrees about the figure-space point `at` (then shifts by d) */
const Rot: React.FC<{ at: P2; a: number; d?: P2; children?: React.ReactNode }> = ({ at, a, d = [0, 0], children }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: FIG_W, height: FIG_H, transformOrigin: `${at[0]}px ${at[1]}px`, transform: `translate(${d[0]}px, ${d[1]}px) rotate(${a}deg)` }}>{children}</div>
);
const Part: React.FC<{ n: keyof typeof PARTS }> = ({ n }) => {
  const p = PARTS[n];
  return <Img src={staticFile("puppet/" + p.file)} style={{ position: "absolute", left: p.x, top: p.y, width: p.w, height: p.h }} />;
};

/** two-bone IK: joint angles (degrees, relative to the cut pose) that bring the end of the chain root-mid-end to `target`;
 *  bend = +1 / -1 picks the side the middle joint goes to */
const ik = (root: P2, mid: P2, end: P2, target: P2, bend: number): [number, number] => {
  const l1 = dist(root, mid), l2 = dist(mid, end);
  const d = Math.max(Math.abs(l1 - l2) + 1, Math.min(l1 + l2 - 1, dist(root, target)));
  const base = ang(root, target), A = Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d))));
  const a1 = base + bend * A;                                             // absolute direction of the first bone
  const m: P2 = [root[0] + l1 * Math.cos(a1), root[1] + l1 * Math.sin(a1)];
  const t: P2 = [root[0] + d * Math.cos(base), root[1] + d * Math.sin(base)];
  const a2 = ang(m, t);                                                   // absolute direction of the second bone
  const r1 = norm(deg(a1 - ang(root, mid)));
  return [r1, norm(deg(a2 - ang(mid, end)) - r1)];
};

export const Figure: React.FC<{ f: number }> = ({ f }) => {
  const a = act(f), two = Math.PI * 2;
  const bob = a.walk * 10 * Math.cos(2 * two * a.phase) + (1 - a.walk) * 2 * Math.sin(f * 0.12);     // breathing when still
  const sway = a.walk * 2.2 * Math.sin(two * a.phase);                                                // torso rocks over the stance leg
  // feet: each lifts for half the cycle while walking
  const lift = (ph: number) => a.walk * 70 * Math.max(0, Math.sin(two * ph));
  const ankL: P2 = [J.anL[0] + 4 * a.walk, J.anL[1] - lift(a.phase)], ankR: P2 = [J.anR[0] - 4 * a.walk, J.anR[1] - lift(a.phase + 0.5)];
  const hipL: P2 = [J.hipL[0], J.hipL[1] + bob], hipR: P2 = [J.hipR[0], J.hipR[1] + bob];
  const [l1, l2] = ik(J.hipL, J.knL, J.anL, [ankL[0] - (hipL[0] - J.hipL[0]), ankL[1] - (hipL[1] - J.hipL[1])], +1);
  const [r1, r2] = ik(J.hipR, J.knR, J.anR, [ankR[0] - (hipR[0] - J.hipR[0]), ankR[1] - (hipR[1] - J.hipR[1])], -1);
  // hands: left holds the cane (swings a little while walking, lifts it at the end); right hangs, then goes to the cap
  const swing = a.walk * 16 * Math.sin(two * a.phase);
  const handL: P2 = lerp2([J.restL[0] - swing * 0.4, J.restL[1] - Math.abs(swing) * 0.3], [J.restL[0] - 70, J.restL[1] - 150], a.cane);
  const handR: P2 = lerp2([J.restR[0] + swing * 0.5, J.restR[1]], [J.capGrip[0] + 22, J.capGrip[1] - 26 * a.tip], a.arm);
  const [al1, al2] = ik(J.shL, J.elL, J.wrL, handL, +1);
  const [ar1, ar2] = ik(J.shR, J.elR, J.wrR, handR, -1);
  const caneRest = norm(90 - deg(ang(J.shL, J.elL)) - 0) ;                                             // unused guard
  void caneRest;
  // the cane hangs from the left hand: its own angle is set in world space (compensating the arm's rotation)
  const caneWorld = lerp(4 + swing * 0.5, -38, a.cane);
  const head = sway * -0.6 + 3 * a.talk * Math.sin(f * 0.5) + 5 * a.arm;
  const mouthH = 3 + 15 * a.talk;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: FIG_W, height: FIG_H }}>
      {/* legs, behind the body */}
      <Rot at={J.hipL} a={l1} d={[0, bob]}><Part n="legL_upper" /><Rot at={J.knL} a={l2}><Part n="legL_lower" /><Rot at={J.anL} a={-(l1 + l2)}><Part n="footL" /></Rot></Rot></Rot>
      <Rot at={J.hipR} a={r1} d={[0, bob]}><Part n="legR_upper" /><Rot at={J.knR} a={r2}><Part n="legR_lower" /><Rot at={J.anR} a={-(r1 + r2)}><Part n="footR" /></Rot></Rot></Rot>
      <Rot at={J.hip} a={sway} d={[0, bob]}>
        <Part n="torso" />
        {/* left arm with the cane */}
        <Rot at={J.shL} a={al1}><Part n="armL_upper" /><Rot at={J.elL} a={al2}>
          <Rot at={J.wrL} a={caneWorld - al1 - al2 - sway}><Part n="cane" /></Rot>
          <Part n="armL_lower" /><Part n="handL" />
        </Rot></Rot>
        {/* head: skin head, face overlays, cap on its hinge */}
        <Rot at={J.neck} a={head}>
          <Part n="head" />
          <div style={{ position: "absolute", left: J.mouth[0] - 13, top: J.mouth[1] - mouthH / 2, width: 26, height: mouthH, borderRadius: "50%", background: "#3a1c22", border: `3px solid ${INK}`, boxSizing: "border-box", opacity: a.talk > 0 ? 1 : 0 }} />
          <div style={{ position: "absolute", left: J.eye[0] - 30, top: J.eye[1] - 16, width: 60, height: 30 * a.blink, background: SKIN, borderBottom: a.blink > 0.15 ? `5px solid ${INK}` : "none", borderRadius: "40% 40% 0 0", opacity: a.blink > 0.02 ? 1 : 0 }} />
          <Rot at={J.capHinge} a={-16 * a.tip} d={[0, -22 * a.tip]}><Part n="cap" /></Rot>
        </Rot>
        {/* right arm in front of everything (it reaches the cap) */}
        <Rot at={J.shR} a={ar1}><Part n="armR_upper" /><Rot at={J.elR} a={ar2}><Part n="armR_lower" /><Part n="handR" /></Rot></Rot>
      </Rot>
    </div>
  );
};

const SCALE = 0.86 / 1.28;   // same on-screen size as today's drawing (0.86 of its 1000-unit cell; the parts are 1.28x that)
export const PuppetTest: React.FC = () => {
  const f = useCurrentFrame(), a = act(f);
  return (
    <AbsoluteFill>
      <Room />
      <Shadow x={a.x} />
      <div style={{ position: "absolute", left: a.x - (FIG_W / 2) * SCALE, top: FLOOR_Y - J.sole * SCALE, width: FIG_W, height: FIG_H, transformOrigin: "0 0", transform: `scale(${SCALE})` }}>
        <Figure f={f} />
      </div>
    </AbsoluteFill>
  );
};
