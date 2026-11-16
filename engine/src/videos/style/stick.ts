// Stickmen with volume (the look decided 2026-11-14): a big round WHITE head with a black outline and a face of a
// few black strokes and dots (dot eyes, brows, a line for a mouth; no ears, nose, skin tone or irises), thin black
// arms and legs, mitten hands, and a body that is one simple garment shape.
// `Stick` is the shared rig; `makeGuard()` and `makeSir()` dress it. Everything is posed by `pose()`, a pure
// function of its arguments: feet are given as world positions (so a planted foot cannot slide), legs are solved
// with two-bone IK, arms are given as directions in the body's own space.
import * as THREE from "three";
import { ink, toon, tweedMap } from "./toonify";

const D2R = Math.PI / 180;
export const R = 0.3, HEAD_Y = 0.7;
export const THIGH = 0.31, SHIN = 0.31, HIP_DX = 0.08, HIP_DY = -0.05, ANKLE = 0.07, STAND = 0.674, LAT = 0.085;
export const UARM = 0.24, FARM = 0.23, SHO_X = 0.2, SHO_Y = 0.33;

export type Face = {
  eye: number;                 // eye opening, 1 = normal
  pupil: number;               // pupil size, 1 = normal
  lookX: number; lookY: number; // -1..1
  browY: [number, number];     // lift per brow (figure's right, figure's left), -1..1
  browTilt: [number, number];  // + = inner end down (angry), - = inner end up (worried)
  open: number;                // mouth opening 0..1
  smile: number;               // -1 frown .. 1 smile
  width: number;               // mouth width, 1 = normal
};
export const FACES = {
  neutral: { eye: 1, pupil: 1, lookX: 0, lookY: 0, browY: [0, 0], browTilt: [0, 0], open: 0, smile: 0.3, width: 1 },
  shock: { eye: 1.3, pupil: 0.62, lookX: 0, lookY: 0, browY: [1, 1], browTilt: [-0.28, -0.28], open: 1, smile: 0, width: 0.85 },
  suspicious: { eye: 0.3, pupil: 1.05, lookX: 0.75, lookY: 0, browY: [-0.35, 0.6], browTilt: [0.3, -0.12], open: 0, smile: -0.55, width: 0.75 },
  glee: { eye: 1.05, pupil: 1.1, lookX: 0, lookY: 0.1, browY: [1, 1], browTilt: [-0.2, -0.2], open: 0, smile: 1.7, width: 1.5 },
  worried: { eye: 1.12, pupil: 0.8, lookX: 0, lookY: 0, browY: [0.6, 0.6], browTilt: [-0.5, -0.5], open: 0, smile: -0.9, width: 0.9 },
} satisfies Record<string, Face>;
/** the same face with left and right swapped (Sir Digsworth squints with the eye that has no monocle) */
export const mirror = (f: Face): Face => ({ ...f, lookX: -f.lookX, browY: [f.browY[1], f.browY[0]], browTilt: [f.browTilt[1], f.browTilt[0]] });

export type Foot = { x: number; y: number; z: number; yaw: number; pitch: number };
/** upper-arm and forearm directions in the body's own space, written for the LEFT arm (x is mirrored for the right) */
export type Arm = { u: [number, number, number]; v: [number, number, number] };
export const ARM_HANG: Arm = { u: [0.5, -1, 0.02], v: [0.1, -1, 0.12] };
export type Pose = {
  x: number; z: number; yaw: number;            // where the body is and where it faces (degrees, 0 = towards +z)
  hip?: number;                                 // hip joint height (default: standing)
  lean?: number; roll?: number; twist?: number; // radians, radians, degrees
  stretch?: number;
  feet?: [Foot, Foot];                          // [left, right]; default: planted under the body
  arms?: [Arm, Arm];                            // [left, right]
  head?: { yaw?: number; pitch?: number; roll?: number }; // degrees, radians, radians
  face?: Face;
};
export type Look = { head: number; glove: number; shoe: number; mouthEl: number; browMax: number };
export const EYE_AZ = 0.33, EYE_EL = 0.06, BROW_EL = 0.34;

const UP = new THREE.Vector3(0, 1, 0);
const tA = new THREE.Vector3(), tB = new THREE.Vector3(), tC = new THREE.Vector3();
export const SPH = new THREE.SphereGeometry(1, 40, 28);

export const setLimb = (m: THREE.Mesh, a: THREE.Vector3, b: THREE.Vector3) => {
  tA.subVectors(b, a);
  const len = tA.length();
  m.position.copy(a).addScaledVector(tA, 0.5);
  m.scale.set(1, len, 1);
  m.quaternion.setFromUnitVectors(UP, tA.normalize());
};
/** two-bone IK: the joint between root and end, bending towards pole */
const ik = (root: THREE.Vector3, end: THREE.Vector3, a: number, b: number, pole: THREE.Vector3, out: THREE.Vector3) => {
  tA.subVectors(end, root);
  let d = tA.length();
  const dir = tA.normalize();
  d = Math.min(d, (a + b) * 0.9995);
  const x = (a * a - b * b + d * d) / (2 * d), h = Math.sqrt(Math.max(0, a * a - x * x));
  tB.copy(pole).addScaledVector(dir, -pole.dot(dir));
  if (tB.lengthSq() < 1e-8) tB.set(0, 0, 1);
  tB.normalize();
  return out.copy(root).addScaledVector(dir, x).addScaledVector(tB, h);
};

export const mesh = (g: THREE.BufferGeometry, m: THREE.Material, parent: THREE.Object3D, p?: [number, number, number], s?: [number, number, number]) => {
  const o = new THREE.Mesh(g, m);
  o.castShadow = true; o.receiveShadow = true;
  if (p) o.position.set(...p);
  if (s) o.scale.set(...s);
  parent.add(o);
  return o;
};
/** point on the head: az = angle round the head from straight ahead, el = angle up */
export const onHead = (az: number, el: number, r = R, out = new THREE.Vector3()) => out.set(r * Math.sin(az) * Math.cos(el), r * Math.sin(el), r * Math.cos(az) * Math.cos(el));
/** a group sitting on the head at (az, el), its z axis pointing out of the head */
export const surf = (parent: THREE.Object3D, az: number, el: number, r = R) => {
  const g = new THREE.Group();
  g.rotation.order = "YXZ";
  g.rotation.set(-el, az, 0);
  onHead(az, el, r, g.position);
  parent.add(g);
  return g;
};
/** a tube along points whose thickness follows rad(t), t = 0..1 along the tube */
export const taperTube = (pts: THREE.Vector3[], rad: (t: number) => number, seg = 40) => {
  const curve = new THREE.CatmullRomCurve3(pts), RS = 10, g = new THREE.TubeGeometry(curve, seg, 1, RS, false);
  const pos = g.attributes.position, c = new THREE.Vector3(), v = new THREE.Vector3();
  for (let j = 0; j <= seg; j++) {
    curve.getPointAt(j / seg, c);
    for (let k = 0; k <= RS; k++) {
      const i = j * (RS + 1) + k;
      v.fromBufferAttribute(pos, i).sub(c).multiplyScalar(rad(j / seg)).add(c);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
  }
  g.computeVertexNormals();
  return g;
};
/** a body garment turned on a lathe from (radius, height) points; returns the mesh and its radius at a height */
export const garment = (parent: THREE.Object3D, pts: [number, number][], m: THREE.Material, zs: number) => {
  const prof = new THREE.SplineCurve(pts.map(([r, y]) => new THREE.Vector2(r, y))).getPoints(48);
  mesh(new THREE.LatheGeometry(prof, 56), m, parent, undefined, [1, 1, zs]);
  return (y: number) => { let best = prof[0]; for (const p of prof) if (Math.abs(p.y - y) < Math.abs(best.y - y)) best = p; return best.x; };
};

export class Stick {
  root = new THREE.Group();
  torso = new THREE.Group();
  head = new THREE.Group();
  /** world position of the hands after pose(): [left, right] */
  hands = [new THREE.Vector3(), new THREE.Vector3()];
  /** called at the end of pose(), for props that follow the body (a cane) */
  after?: (s: Stick, p: Pose) => void;
  /** eye opening is never taken below this (index 0 = figure's right eye), e.g. behind a monocle */
  eyeMin: [number, number] = [0, 0];
  eyeMax: [number, number] = [9, 9];
  /** a brow is never lowered below this (so it cannot sit on a monocle) */
  browMin: [number, number] = [-9, -9];
  private legs: { thigh: THREE.Mesh; shin: THREE.Mesh; knee: THREE.Mesh; shoe: THREE.Group }[] = [];
  /** named extra parts a costume wants to move later (a cap that is tipped, a smock that comes off) */
  parts: Record<string, THREE.Object3D> = {};
  /** arm length factor (a character who has to reach far) */
  armLen = 1;
  arms: { upper: THREE.Mesh; fore: THREE.Mesh; elbow: THREE.Mesh; hand: THREE.Group }[] = [];
  private eyes: THREE.Group[] = [];
  private brows: THREE.Group[] = [];
  private mouthLine: THREE.Mesh;
  private mouthG: THREE.Group;
  private black = ink();

  constructor(public look: Look) {
    const white = toon(look.head, undefined, true), black = this.black;
    this.root.add(this.torso);
    this.torso.rotation.order = "YXZ";
    this.head.position.set(0, HEAD_Y, 0);
    this.head.rotation.order = "YXZ";
    this.torso.add(this.head);

    // --- head: a plain white ball (the ink pass draws its black outline); no shadows cast across the face ---
    mesh(SPH, white, this.head, undefined, [R, R, R]).receiveShadow = false;

    // --- drawn face: two black dots, two brow strokes ---
    for (const s of [-1, 1]) {
      const eye = surf(this.head, s * EYE_AZ, EYE_EL, R + 0.001);
      mesh(SPH, black, eye, [0, 0, 0], [1, 1, 0.006]);
      this.eyes.push(eye);
      const brow = surf(this.head, s * EYE_AZ, BROW_EL, R + 0.004);
      const bar = mesh(new THREE.CapsuleGeometry(0.01, 0.075, 6, 14), black, brow);
      bar.rotation.z = Math.PI / 2;
      this.brows.push(brow);
    }
    // --- mouth: a drawn line (rebuilt per face) or, when open, a plain black oval ---
    this.mouthLine = mesh(new THREE.BufferGeometry(), black, this.head);
    this.mouthG = surf(this.head, 0, look.mouthEl, R - 0.006);
    mesh(SPH, black, this.mouthG, [0, 0, 0], [1, 1, 0.7]);

    // --- thin limbs, mitten hands, shoes ---
    const cyl = (r: number) => new THREE.CylinderGeometry(r, r, 1, 14, 1);
    const glove = toon(look.glove), shoeM = toon(look.shoe);
    for (let i = 0; i < 2; i++) {
      const s = i === 0 ? 1 : -1;
      const thigh = mesh(cyl(0.023), black, this.root), shin = mesh(cyl(0.023), black, this.root), knee = mesh(SPH, black, this.root, undefined, [0.023, 0.023, 0.023]);
      const shoe = new THREE.Group();
      shoe.rotation.order = "YXZ";
      this.root.add(shoe);
      mesh(new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), shoeM, shoe, [0, -ANKLE, 0.05], [0.066, 0.092, 0.14]);
      mesh(new THREE.CylinderGeometry(1, 1, 1, 32), shoeM, shoe, [0, -ANKLE + 0.008, 0.05], [0.066, 0.016, 0.14]);
      this.legs.push({ thigh, shin, knee, shoe });
      const upper = mesh(cyl(0.02), black, this.root), fore = mesh(cyl(0.02), black, this.root), elbow = mesh(SPH, black, this.root, undefined, [0.02, 0.02, 0.02]);
      const hand = new THREE.Group();
      this.root.add(hand);
      mesh(SPH, glove, hand, [0, 0.045, 0], [0.058, 0.072, 0.046]);                 // mitten
      mesh(SPH, glove, hand, [s * 0.046, 0.03, 0.022], [0.024, 0.036, 0.024]);      // thumb
      this.arms.push({ upper, fore, elbow, hand });
    }
    this.setFace(FACES.neutral);
  }

  setFace(f: Face) {
    const L = this.look;
    for (let i = 0; i < 2; i++) {
      const s = i === 0 ? -1 : 1;
      const open = Math.min(this.eyeMax[i], Math.max(f.eye, this.eyeMin[i]));
      // a dot when open, a short flat stroke when half shut
      const slit = open < 0.6, w = slit ? 0.05 : 0.03 + 0.006 * (open - 1), hgt = slit ? 0.009 : 0.04 * open;
      onHead(s * EYE_AZ + f.lookX * 0.07, EYE_EL + f.lookY * 0.05, R + 0.001, this.eyes[i].position);
      this.eyes[i].rotation.set(-(EYE_EL + f.lookY * 0.05), s * EYE_AZ + f.lookX * 0.07, 0);
      this.eyes[i].scale.set(w, hgt, 1);
      const el = BROW_EL + Math.min(L.browMax, 0.07 * Math.max(this.browMin[i], f.browY[i])) - 0.03 * (slit ? 1 : 0); // brows follow a narrowed eye down
      onHead(s * EYE_AZ, el, R + 0.004, this.brows[i].position);
      this.brows[i].rotation.set(-el, s * EYE_AZ, s * f.browTilt[i]);
    }
    const isOpen = f.open > 0.05;
    this.mouthLine.visible = !isOpen;
    this.mouthG.visible = isOpen;
    if (isOpen) {
      const w = 0.05 * f.width, h = 0.014 + 0.062 * f.open;
      const el = L.mouthEl - 0.1 * f.open;
      onHead(0, el, R - 0.006, this.mouthG.position);
      this.mouthG.rotation.set(-el, 0, 0);
      this.mouthG.scale.set(w, h, 0.02);
    } else {
      const pts: THREE.Vector3[] = [], w = 0.2 * f.width;
      for (let k = 0; k <= 10; k++) { const t = k / 5 - 1; pts.push(onHead(t * w, L.mouthEl + f.smile * (0.15 * t * t - 0.05), R + 0.004)); }
      this.mouthLine.geometry.dispose();
      this.mouthLine.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.0095, 8, false);
    }
  }

  pose(p: Pose) {
    const th = p.yaw * D2R, tw = (p.twist ?? 0) * D2R;
    const fwd = new THREE.Vector3(Math.sin(th), 0, Math.cos(th)), left = new THREE.Vector3(Math.cos(th), 0, -Math.sin(th));
    const feet = p.feet ?? ([1, -1].map((s) => ({ x: p.x + s * LAT * left.x, z: p.z + s * LAT * left.z, y: ANKLE, yaw: p.yaw + s * 9, pitch: 0 })) as [Foot, Foot]);
    this.torso.position.set(p.x, (p.hip ?? STAND) - HIP_DY, p.z);
    this.torso.rotation.set(p.lean ?? 0, th + tw, p.roll ?? 0);
    this.torso.scale.set(1, p.stretch ?? 1, 1);
    this.torso.updateMatrixWorld(true);
    const h = p.head ?? {};
    this.head.rotation.set(h.pitch ?? 0, (h.yaw ?? 0) * D2R - tw, h.roll ?? 0);
    if (p.face) this.setFace(p.face);

    const hipW = new THREE.Vector3(), ank = new THREE.Vector3(), kneeP = new THREE.Vector3(), pole = new THREE.Vector3();
    for (let i = 0; i < 2; i++) {
      const s = i === 0 ? 1 : -1, ft = feet[i], Lg = this.legs[i], fy = ft.yaw * D2R;
      hipW.set(s * HIP_DX, HIP_DY, 0).applyMatrix4(this.torso.matrixWorld);
      ank.set(ft.x, ft.y, ft.z);
      pole.set(Math.sin(th) + 0.6 * Math.sin(fy), 0.15, Math.cos(th) + 0.6 * Math.cos(fy));
      tC.subVectors(ank, hipW);
      if (tC.length() > THIGH + SHIN - 0.002) ank.copy(hipW).addScaledVector(tC.normalize(), THIGH + SHIN - 0.002);
      ik(hipW, ank, THIGH, SHIN, pole, kneeP);
      setLimb(Lg.thigh, hipW, kneeP); setLimb(Lg.shin, kneeP, ank);
      Lg.knee.position.copy(kneeP);
      Lg.shoe.position.copy(ank);
      Lg.shoe.rotation.set(ft.pitch, fy, 0);
    }

    const sho = new THREE.Vector3(), elb = new THREE.Vector3(), hnd = new THREE.Vector3(), u = new THREE.Vector3(), v = new THREE.Vector3();
    const hx = new THREE.Vector3(), hz = new THREE.Vector3(), basis = new THREE.Matrix4(), q = this.torso.quaternion;
    const bodyFwd = new THREE.Vector3(0, 0, 1).applyQuaternion(q);
    for (let i = 0; i < 2; i++) {
      const s = i === 0 ? 1 : -1, A = this.arms[i], a = (p.arms ?? [ARM_HANG, ARM_HANG])[i];
      u.set(s * a.u[0], a.u[1], a.u[2]).normalize().applyQuaternion(q);
      v.set(s * a.v[0], a.v[1], a.v[2]).normalize().applyQuaternion(q);
      sho.set(s * SHO_X, SHO_Y, 0).applyMatrix4(this.torso.matrixWorld);
      elb.copy(sho).addScaledVector(u, UARM * this.armLen);
      hnd.copy(elb).addScaledVector(v, FARM * this.armLen);
      setLimb(A.upper, sho, elb); setLimb(A.fore, elb, hnd);
      A.elbow.position.copy(elb);
      // hand frame: y along the forearm, z as close to "in front of the body" as possible (the thumb side)
      hz.copy(bodyFwd).addScaledVector(v, -bodyFwd.dot(v));
      if (hz.lengthSq() < 1e-4) hz.set(0, 1, 0).addScaledVector(v, -v.y);
      hz.normalize(); hx.crossVectors(v, hz);
      A.hand.position.copy(hnd);
      A.hand.quaternion.setFromRotationMatrix(basis.makeBasis(hx, v, hz));
      this.hands[i].copy(hnd).addScaledVector(v, 0.045);
    }
    this.after?.(this, p);
  }

  /** the arm (i = 0 left, 1 right) that puts its hand at a world point, for the body pose p */
  reach(p: Pose, i: number, target: THREE.Vector3): Arm {
    const s = i === 0 ? 1 : -1, th = p.yaw * D2R + (p.twist ?? 0) * D2R;
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(p.lean ?? 0, th, p.roll ?? 0, "YXZ"));
    const m = new THREE.Matrix4().compose(new THREE.Vector3(p.x, (p.hip ?? STAND) - HIP_DY, p.z), q, new THREE.Vector3(1, p.stretch ?? 1, 1));
    const sho = new THREE.Vector3(s * SHO_X, SHO_Y, 0).applyMatrix4(m), elb = new THREE.Vector3();
    const pole = new THREE.Vector3(s * 0.7, -1, -0.35).applyQuaternion(q);
    const wrist = target.clone(), d = wrist.clone().sub(sho);
    const ua = UARM * this.armLen, fa = FARM * this.armLen;
    if (d.length() > ua + fa - 0.004) wrist.copy(sho).addScaledVector(d.normalize(), ua + fa - 0.004);
    ik(sho, wrist, ua, fa, pole, elb);
    const qi = q.clone().invert();
    const u = elb.clone().sub(sho).normalize().applyQuaternion(qi), v = wrist.clone().sub(elb).normalize().applyQuaternion(qi);
    return { u: [s * u.x, u.y, u.z], v: [s * v.x, v.y, v.z] };
  }
}

// ---------------------------------------------------------------- the museum guard
export const makeGuard = () => {
  const s = new Stick({ head: 0xfdfbf5, glove: 0xfbf6ea, shoe: 0x1b1b22, mouthEl: -0.42, browMax: 0.06 });
  const blue = toon(0x3558a8), dark = toon(0x1f3270), gold = toon(0xf0bd3c), black = toon(0x1b1b22);
  const ZS = 0.86;
  const rad = garment(s.torso, [[0.001, -0.2], [0.2, -0.2], [0.226, -0.11], [0.214, 0.0], [0.226, 0.11], [0.212, 0.23], [0.176, 0.33], [0.115, 0.41], [0.001, 0.44]], blue, ZS);
  const belt = mesh(new THREE.TorusGeometry(rad(0) + 0.004, 0.024, 12, 56), black, s.torso, [0, 0, 0], [1, ZS, 1.3]);
  belt.rotation.x = Math.PI / 2;
  mesh(new THREE.BoxGeometry(0.085, 0.07, 0.024), gold, s.torso, [0, 0, rad(0) * ZS + 0.016]);
  for (const y of [0.1, 0.18, 0.26, 0.33]) mesh(SPH, gold, s.torso, [0, y, rad(y) * ZS + 0.004], [0.024, 0.024, 0.014]);
  const collar = mesh(new THREE.TorusGeometry(0.105, 0.032, 12, 40), dark, s.torso, [0, 0.42, 0]);
  collar.rotation.x = Math.PI / 2;
  // peaked cap: band, gold piping, wide crown, a peak that grows out of the band, badge
  const cap = new THREE.Group();
  s.head.add(cap);
  mesh(new THREE.CylinderGeometry(0.264, 0.258, 0.075, 56), dark, cap, [0, 0.205, 0]);
  mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.016, 56), gold, cap, [0, 0.247, 0]);
  mesh(new THREE.CylinderGeometry(0.325, 0.266, 0.095, 56), blue, cap, [0, 0.3, 0]);
  mesh(SPH, blue, cap, [0, 0.347, 0], [0.325, 0.05, 0.325]);
  const peak = mesh(new THREE.CylinderGeometry(0.262, 0.262, 0.018, 48, 1, false, -Math.PI / 2, Math.PI), black, cap, [0, 0.178, 0.03], [1, 1, 1.28]);
  peak.rotation.x = 0.05;
  mesh(SPH, gold, cap, [0, 0.262, 0.27], [0.055, 0.062, 0.02]);
  mesh(SPH, dark, cap, [0, 0.262, 0.286], [0.024, 0.028, 0.01]);
  return s;
};

// ---------------------------------------------------------------- Sir Digsworth
export const makeSir = () => {
  const s = new Stick({ head: 0xfdfbf5, glove: 0xfbf6ea, shoe: 0x5a3a20, mouthEl: -0.6, browMax: 0.07 });
  s.eyeMin = [0.72, 0]; s.eyeMax = [1, 9]; s.browMin = [0.45, -9]; // the eye behind the monocle never closes to a slit
  const tweed = toon(0xffffff, tweedMap()), tweedDark = toon(0xffffff, tweedMap("#6f5236", "#4a3522", "#8b6b47")), capTweed = toon(0xffffff, tweedMap("#8b6b47", "#63482e", "#a98a5e", 3));
  const vest = toon(0x5c6b38), shirt = toon(0xfdf8ee), red = toon(0xc0342c), gold = toon(0xf0bd3c), tash = ink(0x1c1410), wood = toon(0x4a2a14), black = toon(0x1b1b22);
  const ZS = 0.88;
  const rad = garment(s.torso, [[0.001, -0.2], [0.232, -0.2], [0.256, -0.1], [0.26, 0.02], [0.246, 0.15], [0.212, 0.28], [0.15, 0.39], [0.001, 0.44]], tweed, ZS);
  const front = (y: number) => rad(y) * ZS;
  // waistcoat between the open jacket fronts, shirt, lapels, buttons, bow tie
  mesh(SPH, vest, s.torso, [0, 0.05, front(0.05) - 0.014], [0.1, 0.23, 0.03]);
  mesh(SPH, shirt, s.torso, [0, 0.335, front(0.335) - 0.004], [0.075, 0.07, 0.028]);
  for (const k of [-1, 1]) {
    // the jacket's front edges: a dark strip down each side of the waistcoat, wider apart at the collar
    const lap = mesh(SPH, tweedDark, s.torso, [k * 0.112, 0.09, front(0.09) - 0.006], [0.024, 0.27, 0.02]);
    lap.rotation.z = -k * 0.1; lap.rotation.y = k * 0.4;
  }
  for (const y of [-0.06, 0.03, 0.12]) mesh(SPH, gold, s.torso, [0, y, front(y) + 0.02], [0.02, 0.02, 0.012]);
  const bow = new THREE.Group();
  bow.position.set(0, 0.392, front(0.392) + 0.05);
  s.torso.add(bow);
  for (const k of [-1, 1]) mesh(new THREE.ConeGeometry(0.058, 0.1, 20), red, bow, [k * 0.055, 0, 0], [1, 1, 0.5]).rotation.z = k * Math.PI / 2;
  mesh(SPH, red, bow, [0, 0, 0.008], [0.026, 0.03, 0.022]);

  // handlebar moustache: thick under the nose, thin curled tips; the mouth sits below it
  for (const k of [-1, 1]) {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 12; i++) {
      const t = i / 12, curl = Math.max(0, (t - 0.62) / 0.38);
      pts.push(onHead(k * (0.03 + 0.56 * t), -0.31 - 0.05 * Math.sin(Math.PI * Math.min(1, t / 0.7)) + 0.2 * curl * curl, R + 0.014 + 0.012 * curl));
    }
    mesh(taperTube(pts, (t) => 0.007 + 0.021 * Math.pow(1 - t, 0.8)), tash, s.head);
  }
  // monocle: a gold ring exactly round the figure's right eye (it sits on the eye's own spot on the head)
  const mono = surf(s.head, -EYE_AZ, EYE_EL, R + 0.014);
  mesh(new THREE.TorusGeometry(0.07, 0.009, 10, 48), gold, mono, [0, 0, 0], [1, 1, 1]);
  // pipe: the stem comes out of the corner of the mouth, on the other side from the monocle
  const pipe = surf(s.head, 0.2, -0.6, R - 0.03);
  const stem = new THREE.Group();
  stem.rotation.set(0.42, 0.5, 0);
  pipe.add(stem);
  mesh(new THREE.CylinderGeometry(0.011, 0.014, 0.17, 12), black, stem, [0, 0, 0.085]).rotation.x = Math.PI / 2;
  const bowl = new THREE.Group();
  bowl.position.set(0, 0.02, 0.185); bowl.rotation.x = -0.42;
  stem.add(bowl);
  mesh(new THREE.CylinderGeometry(0.04, 0.031, 0.085, 24), wood, bowl);
  mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.006, 24), toon(0x2a1608), bowl, [0, 0.042, 0]);

  // tweed flat cap: one soft crown, and a peak that is part of it (it starts inside the crown), button on top
  const cap = new THREE.Group();
  cap.rotation.x = 0.07;
  s.head.add(cap);
  s.parts.cap = cap;
  mesh(SPH, capTweed, cap, [0, 0.262, 0.012], [0.33, 0.105, 0.35]);
  const peak = mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.024, 48, 1, false, -Math.PI / 2, Math.PI), capTweed, cap, [0, 0.205, 0.215], [1.22, 1, 0.95]);
  peak.rotation.x = 0.16;
  mesh(SPH, capTweed, cap, [0, 0.368, 0.012], [0.034, 0.02, 0.034]);

  // cane: from the right hand to the floor, brass knob and ferrule
  const cane = mesh(new THREE.CylinderGeometry(0.015, 0.013, 1, 12), wood, s.root);
  const knob = mesh(SPH, gold, s.root, undefined, [0.036, 0.036, 0.036]), tip = mesh(new THREE.CylinderGeometry(0.016, 0.014, 0.04, 12), gold, s.root);
  const top = new THREE.Vector3(), foot = new THREE.Vector3();
  s.after = (st, p) => {
    const th = p.yaw * D2R, hnd = st.hands[1];
    foot.set(hnd.x + 0.09 * Math.sin(th) - 0.05 * Math.cos(th), 0, hnd.z + 0.09 * Math.cos(th) + 0.05 * Math.sin(th));
    top.copy(hnd).sub(foot).normalize().multiplyScalar(0.07).add(hnd);
    setLimb(cane, foot, top);
    knob.position.copy(top);
    tip.position.copy(foot).setY(0.02);
  };
  return s;
};
/** Sir Digsworth's arms when he stands with the cane: left hangs, right holds the knob in front of him */
export const SIR_ARMS: [Arm, Arm] = [ARM_HANG, { u: [0.5, -0.95, 0.1], v: [0.1, -0.72, 0.6] }];
