// The museum guard: a 3D figure built from primitives (big round head, bean body, thin limbs, dark blue
// uniform, peaked cap with a gold badge, moustache). The rig is posed as a pure function of the frame:
//   - a body path (position + heading per frame),
//   - a footstep list: each foot is either planted (fixed world position, so it cannot slide) or swinging
//     along an arc to its next plant; plants are placed where the body will be at mid-stance,
//   - two-bone IK for the legs, pelvis height limited by leg reach (this gives the bob),
//   - arms swing against the legs, then blend to "hands up" and a baffled shrug.
import * as THREE from "three";

const D2R = Math.PI / 180;
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => { t = clamp01(t); return t * t * (3 - 2 * t); };
/** piecewise smooth interpolation through [frame, value] keys */
export const key = (f: number, k: [number, number][]) => {
  if (f <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) if (f <= k[i][0]) return lerp(k[i - 1][1], k[i][1], smooth((f - k[i - 1][0]) / (k[i][0] - k[i - 1][0])));
  return k[k.length - 1][1];
};

// ---------------- body path ----------------
const V = 0.0385;               // m per frame while strolling (0.5 m step every 13 frames)
const DEC0 = 106, DEC1 = 128;   // slows down to the stop
const STOP_X = 1.3;
const X_DEC0 = STOP_X - V * (DEC1 - DEC0) / 2;
const X0 = X_DEC0 - V * DEC0;
const BACK: [number, number] = [146, 168];   // walks back two steps
const WHIRL: [number, number] = [213, 236];  // spins round to the room
export type Pose2 = { x: number; z: number; yaw: number };
export const bodyAt = (f: number): Pose2 => {
  let x: number;
  if (f <= DEC0) x = X0 + V * f;
  else if (f <= DEC1) { const t = (f - DEC0) / (DEC1 - DEC0); x = X_DEC0 + V * (DEC1 - DEC0) * (t - t * t / 2); }
  else x = STOP_X;
  const b = smooth((f - BACK[0]) / (BACK[1] - BACK[0])), w = smooth((f - WHIRL[0]) / (WHIRL[1] - 2 - WHIRL[0]));
  x = lerp(lerp(x, 0.74, b), 0.82, w);
  const z = lerp(lerp(1.35, 1.25, b), 1.5, w);
  const yb = smooth((f - BACK[0]) / (BACK[1] - 2 - BACK[0])), yw = smooth((f - WHIRL[0]) / (WHIRL[1] - WHIRL[0]));
  const yaw = lerp(lerp(90, 210, yb), -12, yw);
  return { x, z, yaw };
};

// ---------------- footsteps ----------------
type Step = { lift: number; land: number; at: number };
const SWING = 11, PERIOD = 26, HALF_STANCE = (PERIOD - SWING) / 2, LAT = 0.085;
const stepsL: Step[] = [], stepsR: Step[] = [];
for (let k = -2; k <= 3; k++) {
  const l = -4 + PERIOD * k, r = 9 + PERIOD * k;
  stepsL.push({ lift: l, land: l + SWING, at: l + SWING + HALF_STANCE });
  stepsR.push({ lift: r, land: r + SWING, at: r + SWING + HALF_STANCE });
}
stepsL.push({ lift: 100, land: 111, at: DEC1 });   // last full step
stepsR.push({ lift: 113, land: 124, at: DEC1 });   // closing step: feet together
stepsL.push({ lift: 147, land: 157, at: BACK[1] }); // back to the bare spot, wall-side foot first
stepsR.push({ lift: 158, land: 168, at: BACK[1] });
stepsR.push({ lift: 213, land: 223, at: WHIRL[1] }); // whirl: right foot steps back and round
stepsL.push({ lift: 224, land: 234, at: WHIRL[1] });

type Foot = { x: number; y: number; z: number; yaw: number; pitch: number; swing: number };
const plantOf = (s: Step, side: number) => {
  const b = bodyAt(s.at), th = b.yaw * D2R;
  // side +1 = the figure's left (local +x)
  return { x: b.x + side * LAT * Math.cos(th), z: b.z - side * LAT * Math.sin(th), yaw: b.yaw };
};
const ANKLE = 0.07;
const footAt = (f: number, steps: Step[], side: number): Foot => {
  let i = 0;
  while (i + 1 < steps.length && steps[i + 1].lift <= f) i++;
  const s = steps[i], to = plantOf(s, side);
  if (f >= s.land || i === 0) return { ...to, y: ANKLE, pitch: 0, swing: 0 };
  const from = plantOf(steps[i - 1], side), t = (f - s.lift) / (s.land - s.lift);
  const e = 0.5 - 0.5 * Math.cos(Math.PI * t);
  const len = Math.hypot(to.x - from.x, to.z - from.z);
  const h = (0.06 + 0.06 * Math.min(1, len / 0.8)) * Math.sin(Math.PI * t);
  return {
    x: lerp(from.x, to.x, e), z: lerp(from.z, to.z, e), yaw: lerp(from.yaw, to.yaw, e),
    y: ANKLE + h, pitch: 0.3 * Math.sin(2 * Math.PI * t) * Math.min(1, len / 0.6), swing: Math.sin(Math.PI * t),
  };
};

// ---------------- meshes ----------------
const UP = new THREE.Vector3(0, 1, 0);
const tmpA = new THREE.Vector3(), tmpB = new THREE.Vector3(), tmpC = new THREE.Vector3(), tmpD = new THREE.Vector3();
const setLimb = (m: THREE.Mesh, a: THREE.Vector3, b: THREE.Vector3) => {
  tmpA.subVectors(b, a);
  const len = tmpA.length();
  m.position.copy(a).addScaledVector(tmpA, 0.5);
  m.scale.set(1, len, 1);
  m.quaternion.setFromUnitVectors(UP, tmpA.normalize());
};
/** two-bone IK: joint position between root and end, bending towards pole */
const ik = (root: THREE.Vector3, end: THREE.Vector3, a: number, b: number, pole: THREE.Vector3, out: THREE.Vector3) => {
  tmpA.subVectors(end, root);
  let d = tmpA.length();
  const dir = tmpA.normalize();
  d = Math.min(d, (a + b) * 0.9995);
  const x = (a * a - b * b + d * d) / (2 * d), h = Math.sqrt(Math.max(0, a * a - x * x));
  tmpB.copy(pole).addScaledVector(dir, -pole.dot(dir));
  if (tmpB.lengthSq() < 1e-8) tmpB.set(0, 0, 1);
  tmpB.normalize();
  return out.copy(root).addScaledVector(dir, x).addScaledVector(tmpB, h);
};

/** highest hip-joint height that both legs can reach at frame f (soft minimum with sharpness k) */
const hipLimit = (f: number, lmax: number, k: number) => {
  const b = bodyAt(f), th = b.yaw * D2R, lx = Math.cos(th), lz = -Math.sin(th);
  const feet = [footAt(f, stepsL, 1), footAt(f, stepsR, -1)];
  const sway = (feet[1].swing - feet[0].swing) * 0.022, px = b.x + lx * sway, pz = b.z + lz * sway;
  let acc = Math.exp(-(HIP_STAND + ANKLE) / k);
  for (let i = 0; i < 2; i++) {
    const s = i === 0 ? 1 : -1, dh = Math.hypot(feet[i].x - (px + lx * s * HIP_DX), feet[i].z - (pz + lz * s * HIP_DX));
    acc += Math.exp(-(feet[i].y + Math.sqrt(Math.max(0.0004, lmax * lmax - dh * dh))) / k);
  }
  return -k * Math.log(acc);
};

const THIGH = 0.31, SHIN = 0.31, LMAX = 0.612, HIP_STAND = 0.604, HIP_DX = 0.085, HIP_DY = -0.05;
const UARM = 0.24, FARM = 0.23, SHO_X = 0.19, SHO_Y = 0.345;
const HEAD_Y = 0.71, HEAD_R = 0.27;

export class Guard {
  root = new THREE.Group();
  private mats: THREE.Material[] = [];
  private torso = new THREE.Group();
  private head = new THREE.Group();
  private legs: { thigh: THREE.Mesh; shin: THREE.Mesh; knee: THREE.Mesh; hip: THREE.Mesh; shoe: THREE.Group }[] = [];
  private arms: { upper: THREE.Mesh; fore: THREE.Mesh; elbow: THREE.Mesh; sho: THREE.Mesh; hand: THREE.Mesh }[] = [];
  private eyes: THREE.Group[] = [];
  private pupils: THREE.Mesh[] = [];
  private brows: THREE.Mesh[] = [];
  private mouth!: THREE.Mesh;
  private tash: THREE.Mesh[] = [];

  constructor() {
    const M = (color: number, rough = 0.85, metal = 0) => {
      const m = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });
      this.mats.push(m);
      return m;
    };
    const navy = M(0x1e2a52), navyDark = M(0x151d3a), skin = M(0xf0b98e), skinDark = M(0xe39a78), gold = M(0xe2b23c, 0.35, 0.75);
    const black = M(0x15151a, 0.5), white = M(0xffffff, 0.6), hair = M(0x3a2414, 0.9), mouthM = M(0x3a0d12, 0.9), shoeM = M(0x16161b, 0.4);
    const mesh = (g: THREE.BufferGeometry, m: THREE.Material, parent: THREE.Object3D, p?: [number, number, number], s?: [number, number, number]) => {
      const o = new THREE.Mesh(g, m);
      o.castShadow = true; o.receiveShadow = true;
      if (p) o.position.set(...p);
      if (s) o.scale.set(...s);
      parent.add(o);
      return o;
    };
    const sph = new THREE.SphereGeometry(1, 40, 28);

    // --- torso: a lathe "bean" ---
    const prof = new THREE.SplineCurve([
      new THREE.Vector2(0.001, -0.135), new THREE.Vector2(0.12, -0.128), new THREE.Vector2(0.21, -0.07), new THREE.Vector2(0.238, 0.03),
      new THREE.Vector2(0.228, 0.15), new THREE.Vector2(0.198, 0.27), new THREE.Vector2(0.165, 0.36), new THREE.Vector2(0.11, 0.43), new THREE.Vector2(0.001, 0.455),
    ]).getPoints(40);
    const ZS = 0.84;
    mesh(new THREE.LatheGeometry(prof, 48), navy, this.torso, undefined, [1, 1, ZS]);
    const radAt = (y: number) => { let best = prof[0]; for (const p of prof) if (Math.abs(p.y - y) < Math.abs(best.y - y)) best = p; return best.x; };
    // belt, buckle, buttons, collar, epaulettes
    const belt = mesh(new THREE.TorusGeometry(radAt(0.0) + 0.004, 0.02, 12, 48), black, this.torso, [0, 0.0, 0], [1, 1, 1]);
    belt.rotation.x = Math.PI / 2; belt.scale.set(1, ZS, 1.2);
    mesh(new THREE.BoxGeometry(0.07, 0.055, 0.02), gold, this.torso, [0, 0.0, radAt(0) * ZS + 0.012]);
    for (const y of [0.09, 0.17, 0.25, 0.325]) mesh(sph, gold, this.torso, [0, y, radAt(y) * ZS + 0.004], [0.019, 0.019, 0.012]);
    const collar = mesh(new THREE.TorusGeometry(0.105, 0.028, 12, 40), navyDark, this.torso, [0, 0.425, 0.0]);
    collar.rotation.x = Math.PI / 2;
    for (const s of [-1, 1]) mesh(sph, gold, this.torso, [s * 0.165, 0.375, 0], [0.06, 0.02, 0.045]);
    this.root.add(this.torso);

    // --- head ---
    this.head.position.set(0, HEAD_Y, 0);
    this.head.rotation.order = "YXZ";
    this.torso.add(this.head);
    mesh(sph, skin, this.head, undefined, [HEAD_R, HEAD_R, HEAD_R]);
    for (const s of [-1, 1]) mesh(sph, skinDark, this.head, [s * 0.262, -0.01, 0], [0.035, 0.055, 0.045]);
    mesh(sph, skinDark, this.head, [0, -0.045, 0.262], [0.045, 0.04, 0.045]); // nose
    // hair fringe at the back and sides, under the cap
    const hairM = mesh(new THREE.SphereGeometry(HEAD_R + 0.008, 40, 20, 0, Math.PI * 2, 0, Math.PI * 0.5), hair, this.head, [0, 0, -0.012]);
    hairM.rotation.x = -0.95;
    for (const s of [-1, 1]) {
      const eye = new THREE.Group();
      eye.position.set(s * 0.098, 0.025, 0.238);
      eye.rotation.y = s * 0.36;
      this.head.add(eye);
      mesh(sph, white, eye, undefined, [0.052, 0.062, 0.03]);
      this.pupils.push(mesh(sph, black, eye, [0, 0, 0.024], [0.021, 0.024, 0.012]));
      this.eyes.push(eye);
      const brow = mesh(new THREE.CapsuleGeometry(0.011, 0.07, 6, 12), hair, this.head, [s * 0.1, 0.105, 0.245]);
      brow.rotation.z = Math.PI / 2 + s * 0.12; brow.rotation.y = s * 0.36;
      this.brows.push(brow);
      const t = mesh(sph, hair, this.head, [s * 0.062, -0.098, 0.252], [0.075, 0.028, 0.032]);
      t.rotation.z = -s * 0.32; t.rotation.y = s * 0.3;
      this.tash.push(t);
    }
    this.mouth = mesh(sph, mouthM, this.head, [0, -0.158, 0.218], [0.04, 0.01, 0.02]);
    // peaked cap
    const cap = new THREE.Group();
    cap.position.set(0, 0.16, 0); cap.rotation.x = -0.06;
    this.head.add(cap);
    mesh(new THREE.CylinderGeometry(0.262, 0.255, 0.075, 48), navyDark, cap, [0, 0.035, 0]);
    mesh(new THREE.CylinderGeometry(0.266, 0.266, 0.014, 48), gold, cap, [0, 0.076, 0]);
    mesh(new THREE.CylinderGeometry(0.305, 0.262, 0.09, 48), navy, cap, [0, 0.125, 0]);
    mesh(sph, navy, cap, [0, 0.168, 0], [0.305, 0.05, 0.305]);
    const visor = mesh(new THREE.CylinderGeometry(0.265, 0.265, 0.014, 40, 1, false, -Math.PI / 2, Math.PI), black, cap, [0, 0.008, 0.02], [1, 1, 1.28]);
    visor.rotation.x = 0.1;
    mesh(sph, gold, cap, [0, 0.085, 0.262], [0.05, 0.058, 0.016]);          // badge
    mesh(sph, navyDark, cap, [0, 0.085, 0.274], [0.022, 0.026, 0.01]);

    // --- limbs ---
    const cyl = (r: number) => new THREE.CylinderGeometry(r, r, 1, 20, 1);
    for (let i = 0; i < 2; i++) {
      const thigh = mesh(cyl(0.05), navy, this.root), shin = mesh(new THREE.CylinderGeometry(0.047, 0.04, 1, 20, 1), navy, this.root);
      const knee = mesh(sph, navy, this.root, undefined, [0.05, 0.05, 0.05]), hip = mesh(sph, navy, this.root, undefined, [0.056, 0.056, 0.056]);
      const shoe = new THREE.Group();
      shoe.rotation.order = "YXZ";
      this.root.add(shoe);
      mesh(new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), shoeM, shoe, [0, -ANKLE, 0.055], [0.062, 0.09, 0.135]);
      mesh(new THREE.CylinderGeometry(1, 1, 1, 32), shoeM, shoe, [0, -ANKLE + 0.008, 0.055], [0.062, 0.016, 0.135]);
      mesh(sph, navy, shoe, undefined, [0.045, 0.045, 0.045]);
      this.legs.push({ thigh, shin, knee, hip, shoe });
      const upper = mesh(cyl(0.04), navy, this.root), fore = mesh(new THREE.CylinderGeometry(0.038, 0.034, 1, 20, 1), navy, this.root);
      const elbow = mesh(sph, navy, this.root, undefined, [0.04, 0.04, 0.04]), sho = mesh(sph, navy, this.root, undefined, [0.05, 0.05, 0.05]);
      const hand = mesh(sph, skin, this.root, undefined, [0.056, 0.062, 0.05]);
      this.arms.push({ upper, fore, elbow, sho, hand });
    }
  }

  /** hide from the picture but keep casting shadows (used for the cut-in, shot from where he stands) */
  setGhost(ghost: boolean) {
    for (const m of this.mats) { m.colorWrite = !ghost; m.depthWrite = !ghost; }
  }

  update(f: number) {
    const b = bodyAt(f), th = b.yaw * D2R;
    const fwd = tmpC.set(Math.sin(th), 0, Math.cos(th)).clone(), left = new THREE.Vector3(Math.cos(th), 0, -Math.sin(th));
    const feet = [footAt(f, stepsL, 1), footAt(f, stepsR, -1)];

    // acting curves
    const shock = key(f, [[128, 0], [137, 0.45], [160, 0.6], [214, 0.7], [218, 1], [300, 1]]);
    const up = key(f, [[214, 0], [226, 1.12], [232, 0.97], [237, 1], [262, 1], [278, 0], [300, 0]]);
    const shrug = key(f, [[262, 0], [278, 1], [300, 1]]);
    const headYaw = key(f, [[0, 0], [118, 0], [124, -4], [129, -10], [137, 84], [141, 74], [146, 74], [166, 0], [213, 0], [240, 0], [246, 8], [256, -58], [268, -58], [272, -62], [284, 56], [300, 52]]);
    const headPitch = key(f, [[0, 0.02], [118, 0.02], [124, 0.08], [131, -0.02], [137, -0.12], [146, -0.14], [168, -0.22], [213, -0.2], [224, -0.02], [232, 0.1], [240, 0.0], [300, 0.0]]);
    const headRoll = key(f, [[0, 0], [118, 0], [125, 0.1], [131, 0], [137, -0.1], [166, 0], [300, 0]]);
    const twist = key(f, [[128, 0], [138, 24], [146, 24], [166, 0], [246, 0], [256, -14], [272, -14], [284, 14], [300, 12]]);
    const blink = Math.max(key(f, [[40, 0], [42, 1], [45, 0]]), key(f, [[96, 0], [98, 1], [101, 0]]), key(f, [[119, 0], [121, 1], [123, 0], [125, 1], [128, 0]]));
    const leanBack = key(f, [[214, 0], [226, 0.16], [236, 0.06], [300, 0.04]]);
    const hop = key(f, [[236, 0], [240, 0.02], [245, 0], [300, 0]]);

    // pelvis: over the path, shifted towards the supporting foot, height limited by leg reach
    const sway = (feet[1].swing - feet[0].swing) * 0.022; // right foot in the air -> lean to the left foot
    const px = b.x + left.x * sway, pz = b.z + left.z * sway;
    // height: a smoothed version of "as high as both legs allow" (window of 7 frames, stricter reach), then
    // clamped by the true reach at this frame so a planted foot can never be pulled off the floor
    let hy = 0, wsum = 0;
    for (let k = -3; k <= 3; k++) { const w = 4 - Math.abs(k); hy += w * hipLimit(f + k, LMAX - 0.014, 0.02); wsum += w; }
    hy = Math.min(hy / wsum, hipLimit(f, LMAX, 0.004));
    const speed = clamp01((bodyAt(f + 0.5).x - bodyAt(f - 0.5).x) / V);
    this.torso.position.set(px, hy - HIP_DY, pz);
    this.torso.rotation.order = "YXZ";
    this.torso.rotation.set(0.05 * speed - leanBack + 0.03 * shrug, th + twist * D2R * 0.5, sway * 1.6);
    this.torso.scale.set(1, 1 + 0.05 * up * (1 - shrug), 1);
    this.torso.updateMatrixWorld(true);

    // head and face
    this.head.rotation.set(headPitch, (headYaw - twist * 0.5) * D2R, headRoll);
    const eo = 1 + 0.42 * shock;
    for (let i = 0; i < 2; i++) {
      const s = i === 0 ? -1 : 1;
      this.eyes[i].scale.set(eo, eo * (1 - 0.92 * blink), 1);
      const lookX = key(f, [[128, 0], [134, 1], [146, 0.6], [166, 0], [246, 0], [254, -1], [270, -1], [280, 1], [300, 1]]);
      this.pupils[i].position.set(lookX * 0.02, 0.004 * shock, 0.024);
      const ps = 1 - 0.22 * shock;
      this.pupils[i].scale.set(0.021 * ps, 0.024 * ps, 0.012);
      this.brows[i].position.y = 0.105 + 0.05 * shock;
      this.brows[i].rotation.z = Math.PI / 2 + s * (-0.12 - 0.22 * shock);
      this.tash[i].position.y = -0.098 + 0.012 * shock;
    }
    const open = key(f, [[128, 0], [137, 0.35], [160, 0.5], [214, 0.6], [219, 1.1], [226, 1], [262, 1], [276, 0.7], [300, 0.75]]);
    this.mouth.scale.set(lerp(0.04, 0.058, open), lerp(0.008, 0.075, open), lerp(0.018, 0.03, open));
    this.mouth.position.set(0, -0.158 - 0.035 * open, 0.218 - 0.012 * open);
    this.head.updateMatrixWorld(true);

    // legs
    const hipW = new THREE.Vector3(), ank = new THREE.Vector3(), kneeP = new THREE.Vector3(), pole = new THREE.Vector3();
    for (let i = 0; i < 2; i++) {
      const s = i === 0 ? 1 : -1, ft = feet[i], L = this.legs[i];
      hipW.set(s * HIP_DX, HIP_DY, 0).applyMatrix4(this.torso.matrixWorld);
      ank.set(ft.x, ft.y, ft.z);
      const fy = ft.yaw * D2R;
      pole.set(Math.sin(th) + 0.6 * Math.sin(fy), 0.15, Math.cos(th) + 0.6 * Math.cos(fy));
      // if the swinging foot is out of reach, pull the ankle in (only ever happens in the air)
      tmpD.subVectors(ank, hipW);
      if (tmpD.length() > THIGH + SHIN - 0.002) ank.copy(hipW).addScaledVector(tmpD.normalize(), THIGH + SHIN - 0.002);
      ik(hipW, ank, THIGH, SHIN, pole, kneeP);
      setLimb(L.thigh, hipW, kneeP); setLimb(L.shin, kneeP, ank);
      L.knee.position.copy(kneeP); L.hip.position.copy(hipW);
      L.shoe.position.copy(ank);
      L.shoe.rotation.set(ft.pitch, fy, 0);
    }

    // arms: swing against the opposite leg; blend to hands-up and to the shrug
    const sho = new THREE.Vector3(), elb = new THREE.Vector3(), hnd = new THREE.Vector3(), u = new THREE.Vector3(), v = new THREE.Vector3();
    const q = this.torso.quaternion;
    for (let i = 0; i < 2; i++) {
      const s = i === 0 ? 1 : -1, A = this.arms[i], opp = feet[1 - i];
      const fore = (opp.x - px) * fwd.x + (opp.z - pz) * fwd.z;
      const phi = THREE.MathUtils.clamp(fore * 1.7, -0.55, 0.6), al = 0.13, be = 0.22 + 0.55 * Math.max(0, phi) + 0.1;
      u.set(s * Math.sin(al), -Math.cos(al) * Math.cos(phi), Math.cos(al) * Math.sin(phi));
      v.set(s * Math.sin(al * 0.4), -Math.cos(phi + be), Math.sin(phi + be));
      const shake = Math.sin(f * 1.9 + i) * 0.05 * clamp01(up) * (1 - shrug);
      const upU = tmpA.set(s * 0.78, 0.56, 0.12).normalize().clone(), upV = tmpA.set(s * (0.3 + shake), 1, 0.22).normalize().clone();
      const shU = tmpA.set(s * 0.5, -0.82, 0.12).normalize().clone(), shV = tmpA.set(s * 0.8, 0.42, 0.5).normalize().clone();
      u.lerp(upU, up).lerp(shU, shrug).normalize();
      v.lerp(upV, up).lerp(shV, shrug).normalize();
      u.applyQuaternion(q); v.applyQuaternion(q);
      sho.set(s * SHO_X, SHO_Y + 0.03 * clamp01(up) + 0.035 * shrug, 0).applyMatrix4(this.torso.matrixWorld);
      elb.copy(sho).addScaledVector(u, UARM);
      hnd.copy(elb).addScaledVector(v, FARM);
      setLimb(A.upper, sho, elb); setLimb(A.fore, elb, hnd);
      A.elbow.position.copy(elb); A.sho.position.copy(sho);
      A.hand.position.copy(hnd).addScaledVector(v, 0.035);
      A.hand.quaternion.setFromUnitVectors(UP, v);
    }
  }

  /** world position of the face, for the camera */
  headPos(out: THREE.Vector3) { return out.set(0, 0, 0).applyMatrix4(this.head.matrixWorld); }
}

/** debug: ankle positions at a frame (used to check that planted feet do not move) */
export const feetAt = (f: number) => [footAt(f, stepsL, 1), footAt(f, stepsR, -1)];

/** the walk without the figure: body path, feet, pelvis sway and hip height at a frame (used by the stick guard) */
export const walkAt = (f: number) => {
  const b = bodyAt(f), feet = [footAt(f, stepsL, 1), footAt(f, stepsR, -1)];
  const sway = (feet[1].swing - feet[0].swing) * 0.022;
  let hy = 0, wsum = 0;
  for (let k = -3; k <= 3; k++) { const w = 4 - Math.abs(k); hy += w * hipLimit(f + k, LMAX - 0.014, 0.02); wsum += w; }
  hy = Math.min(hy / wsum, hipLimit(f, LMAX, 0.004));
  const speed = clamp01((bodyAt(f + 0.5).x - bodyAt(f - 0.5).x) / V);
  return { b, feet, sway, hip: hy, speed };
};
