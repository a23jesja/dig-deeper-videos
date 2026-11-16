// Short 1: "Someone stole the Mona Lisa" (1911). Vertical 1080x1920, timed to the voice (wordsMonaShort.json).
// Script and sources: SCRIPT-mona-lisa-short.md / FACTS-mona-lisa.md. One canvas; update(f) poses everything as a
// pure function of the frame. Shots start on words:
//   hook   hands lift the painting off the four hooks          paris  the painting, then the FERME sign
//   who    Peruggia in the white smock                          lift   he lifts, wraps, walks out
//   guards two guards shrug (the photographers)                 artist the painter arrives; the guard's shock
//   det    detectives + "60 DETECTIVES"; Picasso questioned     queue  the queue at the empty wall
//   trunk  the false bottom                                     letter the letter signed Leonardo; the arrest
//   back   the painting is back                                 end    Sir Digsworth tips his cap
import React, { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { AbsoluteFill, Audio, continueRender, delayRender, getInputProps, staticFile, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { EffectComposer } from "@react-three/postprocessing";
import { ToneMappingEffect, ToneMappingMode } from "postprocessing";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MODEL_IDS } from "../three3d/stage";
import { key } from "../three3d/guard";
import { InkPass, noInkFallback } from "../emu/ink";
import { toonify } from "./toonify";
import { Arm, ARM_HANG, Face, FACES, makeGuard, makeSir, mirror, Pose, SIR_ARMS, Stick } from "./stick";
import { makeBrush, makeBundle, makeGlass, makeMona, makePalette, makePanel, makePerson, makePeruggia, makePicasso, tash, walk } from "./cast";
import { Assets, buildClosedSign, buildDesk, buildLamp, buildLetter, buildLouvre, buildRoom, buildTrunk } from "./world";
import { guardPose } from "./StyleScene";
import wordsJson from "./wordsMonaShort.json";

type Word = { w: string; a: number; b: number; line: string };
const WORDS = wordsJson as Word[];
const FPS = 30, W = 1080, H = 1920;
export const MONA_SHORT_TOTAL = 1490;
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
/** frame at which a word of a line starts (the line's first word if none is given) */
const at = (line: string, word?: string, n = 0) => {
  const L = WORDS.filter((w) => w.line === line);
  return Math.round((word ? L.filter((w) => norm(w.w) === norm(word))[n] : L[0]).a * FPS);
};
const S = {
  hook: 0, paris: at("paris") - 1, who: at("who") - 1, lift: at("lift") - 1, guards: at("guards") - 1, artist: at("artist") - 1, react: at("artist", "finds") + 1,
  det: at("police") - 1, pic: at("police", "Even") - 1, queue: at("queue") - 1, trunk: at("trunk") - 1, letter: at("letter") - 1, arrest: at("letter", "and") - 1,
  back: at("back"), end: at("end"),
};
export const MONA_SHORT_CUTS = Object.values(S);

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const c01 = (t: number) => Math.min(1, Math.max(0, t));
const ease = (t: number) => { t = c01(t); return t * t * (3 - 2 * t); };
const mixFace = (a: Face, b: Face, t: number): Face => ({
  eye: lerp(a.eye, b.eye, t), pupil: 1, lookX: lerp(a.lookX, b.lookX, t), lookY: lerp(a.lookY, b.lookY, t),
  browY: [lerp(a.browY[0], b.browY[0], t), lerp(a.browY[1], b.browY[1], t)], browTilt: [lerp(a.browTilt[0], b.browTilt[0], t), lerp(a.browTilt[1], b.browTilt[1], t)],
  open: lerp(a.open, b.open, t), smile: lerp(a.smile, b.smile, t), width: lerp(a.width, b.width, t),
});
const look = (f: Face, x: number, y = 0): Face => ({ ...f, lookX: x, lookY: y });
const blinkAt = (f: number, seed: number) => { const p = (f + seed * 37) % 96; return p < 4 ? [0.5, 0.05, 0.05, 0.5][p] : 1; };
const SHRUG: Arm = { u: [0.55, -0.8, 0.12], v: [0.8, 0.42, 0.5] };
const UP: Arm = { u: [0.78, 0.56, 0.12], v: [0.3, 1, 0.22] };
const mixArm = (a: Arm, b: Arm, t: number): Arm => ({ u: [lerp(a.u[0], b.u[0], t), lerp(a.u[1], b.u[1], t), lerp(a.u[2], b.u[2], t)], v: [lerp(a.v[0], b.v[0], t), lerp(a.v[1], b.v[1], t), lerp(a.v[2], b.v[2], t)] });
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

const loadAssets = async (): Promise<Assets> => {
  const gl = new GLTFLoader(), tl = new THREE.TextureLoader();
  const tex = (p: string) => tl.loadAsync(staticFile(p)).then((t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; });
  const [models, paints, mona] = await Promise.all([
    Promise.all(MODEL_IDS.map((id) => gl.loadAsync(staticFile(`three3d/polyhaven/${id}/${id}.gltf`)).then((g) => [id, g.scene] as const))),
    Promise.all([0, 1, 2, 3, 4, 5, 6].map((i) => tex(`style/paint/p${i}.jpg`))),
    tex("style/mona.jpg"),
  ]);
  return { models: Object.fromEntries(models), paints, mona };
};

// ---------------------------------------------------------------- the world and the cast
const TRUNK_X = 40, PIC_X = 60, HOTEL_X = 80;
const build = (assets: Assets) => {
  const stage = buildLouvre(assets), root = stage.root;
  const rooms = { trunk: buildRoom(TRUNK_X, 0x7d8a70, 0x8a6a45, 0x5c6650), pic: buildRoom(PIC_X, 0x4a5568, 0x6b5a48, 0x333c4c), hotel: buildRoom(HOTEL_X, 0xb58a4a, 0x7a5a3a, 0x7a5326) };
  root.add(rooms.trunk, rooms.pic, rooms.hotel);
  const mona = makeMona(assets.mona!), bundle = makeBundle(), panel = makePanel(assets.mona!), sign = buildClosedSign(), letter = buildLetter();
  root.add(mona, bundle, sign, letter.g);
  sign.position.set(0, 0.37, 0.645);
  const trunk = buildTrunk();
  trunk.g.position.set(TRUNK_X, 0, 1.0);
  root.add(trunk.g);
  // the false bottom is hinged at its left edge
  const pivot = new THREE.Group();
  pivot.position.set(-0.455, 0.3, 0);
  trunk.g.add(pivot); trunk.tray.position.set(0.455, 0, 0); pivot.add(trunk.tray);
  panel.rotation.order = "YXZ"; panel.rotation.set(-Math.PI / 2, Math.PI / 2, 0); panel.position.set(0, 0.07, 0);
  trunk.g.add(panel);
  const bed = buildDesk(1.9, 0.9, 0.42, 0x4a3320); bed.position.set(TRUNK_X - 1.9, 0, 0.6); root.add(bed);
  const desk = buildDesk(); desk.position.set(PIC_X, 0, 1.25); root.add(desk);
  const lamp = buildLamp(); lamp.position.set(PIC_X + 0.1, 2.3, 1.1); root.add(lamp);
  const hdesk = buildDesk(1.0, 0.5, 0.74, 0x6a4424); hdesk.position.set(HOTEL_X - 1.6, 0, 0.4); root.add(hdesk);

  const thief = makePeruggia(), guardA = makeGuard(), guardB = makeGuard(), sir = makeSir();
  thief.armLen = 1.3;
  tash(guardB, "walrus");
  const artist = makePerson({ shape: "smock", coat: 0x4f79b8, hat: "beret", hatColor: 0xa83232, shoe: 0x3a2a1c, buttons: 0x2b3f66 });
  artist.arms[0].hand.add(makePalette()); artist.arms[1].hand.add(makeBrush());
  const dets = [0, 1, 2].map((i) => {
    const d = makePerson({ shape: "coat", coat: [0x3a3f4b, 0x4a4036, 0x2f3d3a][i], hat: "bowler", hatColor: 0x1b1b22, band: 0x3a3a44, tash: (["walrus", "brush", "none"] as const)[i], belt: 0x1b1b22, buttons: 0x15151a });
    d.arms[1].hand.add(makeGlass());
    return d;
  });
  const picasso = makePicasso();
  const vis = [
    makePerson({ shape: "dress", coat: 0x7a3b6e, hat: "lady", hatColor: 0x4a2a55, band: 0xd9a93c }),
    makePerson({ shape: "coat", coat: 0x2f3640, hat: "top", hatColor: 0x1b1b22, band: 0x7a1420, tash: "curl", buttons: 0xd8d8d8 }),
    makePerson({ shape: "jacket", coat: 0xb9a27a, hat: "boater", hatColor: 0xe8d9a8, band: 0xc0342c, tash: "walrus", shoe: 0x5a3a20, buttons: 0x6b5a3a }),
    makePerson({ shape: "dress", coat: 0x2e6b6a, hat: "lady", hatColor: 0xf0e6cc, band: 0xc0342c }),
    makePerson({ shape: "jacket", coat: 0x55606e, hat: "flat", hatColor: 0x6a4a36, tash: "brush", shoe: 0x3a2a1c }),
    makePerson({ shape: "coat", coat: 0x6b2f2f, hat: "bowler", hatColor: 0x4a3320, band: 0x2a1c12, buttons: 0xd9a93c }),
  ];
  const pols = [0, 1].map((i) => makePerson({ shape: "coat", coat: 0x1f2a44, hat: "kepi", hatColor: 0x1f2a44, band: 0xb0302a, tash: i ? "brush" : "curl", buttons: 0xd8d8d8, belt: 0xf2f2f2, collar: 0xb0302a }));
  const all: Stick[] = [thief, guardA, guardB, sir, artist, ...dets, picasso, ...vis, ...pols];
  for (const s of all) root.add(s.root);
  toonify(rooms.trunk); // (already toon; harmless)
  noInkFallback(root);
  return { stage, root, mona, bundle, panel, sign, letter, trunk, pivot, thief, guardA, guardB, sir, artist, dets, picasso, vis, pols, all };
};
type World = ReturnType<typeof build>;

// ---------------------------------------------------------------- the theft itself (used by the hook and by "lift")
const PX = 0.5, PZ = 0.32, PYAW = 250; // he stands beyond the painting from the camera, facing it and us
const rotY = (x: number, z: number, a: number): [number, number] => [x * Math.cos(a) + z * Math.sin(a), -x * Math.sin(a) + z * Math.cos(a)];
/** t = frames into the lift: where the painting is, and the thief holding it */
const theft = (w: World, t: number, carry = 1) => {
  const a = ease(t / 16), b = ease((t - 14) / 26), c = ease((t - 40) / 40) * carry;
  const cx = 0.13 * c, cy = 1.8 + 0.075 * a - 0.115 * b - 0.24 * c, cz = 0.085 + 0.2 * b + 0.135 * c, psi = -0.12 * b - 0.13 * c;
  w.mona.visible = true;
  w.mona.position.set(cx, cy, cz); w.mona.rotation.set(0.06 * b, psi, 0.03 * Math.sin(t * 0.35) * b);
  const grip = (lx: number, ly: number, lz: number) => { const [x, z] = rotY(lx, lz, psi); return V(cx + x, cy + ly, cz + z); };
  const p: Pose = { x: PX, z: PZ, yaw: PYAW, stretch: 1 + 0.04 * a * (1 - b), lean: -0.05 * a + 0.04 * c };
  p.arms = [w.thief.reach(p, 0, grip(0.25, -0.47, 0.07)), w.thief.reach(p, 1, grip(0.36, -0.3, 0.06))];
  p.head = { yaw: lerp(34, 46, ease((t - 34) / 22)), pitch: lerp(-0.2, 0, ease((t - 30) / 20)), roll: 0 };
  p.face = mixFace({ ...FACES.suspicious, eye: 1, browY: [-0.2, -0.2], browTilt: [0.25, 0.25], smile: 0.1, lookX: 0 }, { ...FACES.glee, lookX: 0.5 }, ease((t - 44) / 16));
  w.thief.root.visible = true; w.thief.parts.smock.visible = true;
  w.thief.pose(p);
  return { cx, cy, cz, psi };
};

// ---------------------------------------------------------------- one frame
const stand = (s: Stick, x: number, z: number, yaw: number, extra: Partial<Pose> = {}) => { s.root.visible = true; s.pose({ x, z, yaw, ...extra }); };
const update = (w: World, f: number, cam: THREE.PerspectiveCamera) => {
  for (const s of w.all) s.root.visible = false;
  w.mona.visible = w.bundle.visible = w.sign.visible = w.letter.g.visible = false;
  w.mona.position.set(0, 1.8, 0.085); w.mona.rotation.set(0, 0, 0);
  let cx = 0; // which place the key light serves
  const C = (px: number, py: number, pz: number, lx: number, ly: number, lz: number, fov: number) => { cam.position.set(px, py, pz); cam.fov = fov; cam.lookAt(lx, ly, lz); };

  if (f < S.paris) {
    // HOOK: the painting is already coming off the hooks
    // the thief in profile at the left, both hands on the frame's edge: he lifts it and swings it off the wall like a
    // door, and the four hooks come into view behind it
    const t = f + 5, e = ease(f / 131), a = ease(t / 14), b2 = ease((t - 12) / 34), c = ease((t - 48) / 50);
    // hinge = the painting's right edge; his edge (the left one) comes off the wall towards him and us
    const psi = 0.6 * b2 - 0.22 * c, hx = 0.34 - 0.24 * b2 - 0.36 * c, cy = 1.8 + 0.075 * a - 0.1 * b2 - 0.8 * c, hz = 0.085 + 0.02 * b2 + 0.15 * c, wob = 0.02 * Math.sin(t * 0.33) * b2;
    const lx = hx - 0.68 * Math.cos(psi), lz = hz + 0.68 * Math.sin(psi);
    w.mona.visible = true; w.mona.position.set((hx + lx) / 2, cy, (hz + lz) / 2); w.mona.rotation.set(0, psi, wob);
    const grip = (ly: number) => V(lx + 0.02, cy + ly, lz + 0.07);
    const p: Pose = { x: -0.8 - 0.13 * c, z: 0.36, yaw: 90, stretch: 1 + 0.05 * a * (1 - b2), lean: 0.05 - 0.06 * b2 };
    p.arms = [w.thief.reach(p, 0, grip(-0.36)), w.thief.reach(p, 1, grip(-0.12))];
    p.head = { yaw: lerp(-16, -42, ease((t - 44) / 20)), pitch: lerp(-0.2, -0.04, b2), roll: 0 };
    p.face = mixFace({ ...FACES.neutral, eye: 1, browY: [-0.2, -0.2], browTilt: [0.25, 0.25], smile: 0.15, lookX: 0.7, lookY: 0.4 }, { ...FACES.glee, lookX: -0.3 }, ease((t - 46) / 14));
    w.thief.root.visible = true; w.thief.parts.smock.visible = true; w.thief.pose(p);
    C(lerp(0.3, 0.2, e), 1.65, lerp(3.0, 2.8, e), -0.26, 1.82, 0.1, 40);
  } else if (f < S.who) {
    // PARIS: the painting on its hooks, then down to the sign on the rope
    const e = ease((f - (at("paris", "The") - 14)) / 26), d = (f - S.paris) / (S.who - S.paris);
    w.mona.visible = w.sign.visible = true;
    w.sign.rotation.z = 0.05 * Math.sin(f * 0.09) * e;
    C(lerp(0.2, 0.1, e), lerp(1.45, 0.7, e), lerp(2.75 - 0.15 * d, 2.2, e), lerp(0.03, 0, e), lerp(1.56, 0.28, e), lerp(0, 0.64, e), 40);
  } else if (f < S.lift) {
    // WHO: Peruggia, looking about him, then showing off the smock
    const t = f - S.who, sm = at("who", "dressed") - S.who, g = ease((t - sm) / 12);
    w.mona.visible = true;
    const hy = key(t, [[0, 0], [12, 38], [40, 38], [58, -38], [86, -38], [102, 0], [sm, 0], [sm + 10, 0]]);
    const tug: Arm = { u: [0.4, -0.75, 0.5], v: [-0.55, 0.62, 0.5] }, bounce = Math.max(0, Math.sin((t - sm) * 0.42)) * g;
    stand(w.thief, 0.5, 0.5, 8, {
      head: { yaw: hy, pitch: 0.2 * g * (1 - ease((t - sm - 22) / 10)), roll: 0.06 * Math.sin(t * 0.07) },
      arms: [mixArm(ARM_HANG, tug, g), mixArm(ARM_HANG, tug, g)], stretch: 1 + 0.02 * bounce,
      face: mixFace({ ...FACES.suspicious, eye: blinkAt(f, 1), lookX: hy / 40, browY: [-0.3, 0.5] }, { ...FACES.glee, eye: blinkAt(f, 1) }, ease((t - sm - 18) / 10)),
    });
    w.thief.parts.smock.visible = true;
    const e = ease(t / (S.lift - S.who));
    C(lerp(0.72, 0.66, e), 1.45, lerp(3.75, 3.45, e), 0.38, 1.14, 0.5, 38);
  } else if (f < S.guards) {
    // LIFT: off the hooks, into the smock, out
    const t = f - S.lift, wrap = at("lift", "wraps") - S.lift + 5, go = at("lift", "walks") - S.lift - 8;
    const e = ease(t / (S.guards - S.lift));
    C(lerp(-1.75, -2.1, e), 1.5, lerp(2.35, 2.6, e), lerp(0.1, -0.35, e), 1.3, 0.3, 44);
    if (t < 34) {
      theft(w, t * 1.6, 0.6);
    } else if (t < go) {
      const st = theft(w, 54.4, 0.6), k = ease((t - 34) / 16); // off the wall; now down to his chest
      const y = lerp(st.cy, 0.9, k), z = lerp(st.cz, 0.5, k), x = lerp(st.cx, 0.12, k), psi = lerp(st.psi, -0.5, k);
      const wrapped = t >= wrap, sq = wrapped ? Math.max(0, 1 - (t - wrap) / 5) : 0;
      const obj = wrapped ? w.bundle : w.mona;
      w.mona.visible = !wrapped; w.bundle.visible = wrapped;
      obj.position.set(x, y, z); obj.rotation.set(0.05, psi, 0); obj.scale.setScalar(1 + 0.18 * sq);
      const grip = (lx: number, ly: number, lz: number) => { const [gx, gz] = rotY(lx, lz, psi); return V(x + gx, y + ly, z + gz); };
      const p: Pose = { x: PX, z: PZ, yaw: PYAW, stretch: 1 - 0.05 * sq };
      p.arms = [w.thief.reach(p, 0, grip(0.2, 0.2, 0.08)), w.thief.reach(p, 1, grip(0.36, 0.3, 0.06))];
      p.head = { yaw: lerp(40, 50, k), pitch: 0.08 * k };
      p.face = wrapped ? { ...FACES.glee, lookX: 0.4 } : mixFace(FACES.neutral, { ...FACES.suspicious, eye: 1, lookX: 0.6 }, k);
      w.thief.pose(p);
      w.thief.parts.smock.visible = !wrapped;
    } else {
      const s = ((t - go) / 30) * 1.2, p = walk(s, 2.4, PX, PZ + 0.2, -90);
      w.thief.root.visible = true; w.thief.parts.smock.visible = false;
      w.bundle.visible = true; w.bundle.scale.setScalar(1);
      w.bundle.position.set(p.x - 0.1, 1.0, p.z - 0.33); w.bundle.rotation.set(0, 0, 0.16 + 0.03 * Math.sin(s * 8)); // under the far arm, so he stays in view
      p.arms = [p.arms![0], w.thief.reach(p, 1, V(p.x - 0.25, 1.3, p.z - 0.3))];
      p.head = { yaw: 30, pitch: 0 }; p.face = { ...FACES.glee, lookX: 0.5, eye: blinkAt(f, 2) };
      w.thief.pose(p);
    }
  } else if (f < S.artist) {
    // GUARDS: they see the gap and shrug
    const t = f - S.guards, sh = ease((at("guards", "shrug") - 6 - S.guards - t) / -10), nod = Math.sin(t * 0.3) * 0.05 * sh;
    [w.guardA, w.guardB].forEach((g, i) => {
      const s = i ? -1 : 1, x = -0.56 * s, p: Pose = { x, z: 1.6, yaw: 100 * s, hip: 0.674 - 0.004 * Math.sin(t * 0.1 + i) };
      const point = g.reach(p, i ? 1 : 0, V(-0.05 * s, 1.95, 0.1));
      p.arms = i ? [mixArm(ARM_HANG, SHRUG, sh), mixArm(ease(t / 10 - 0.6) > 0.5 ? point : ARM_HANG, SHRUG, sh)] : [mixArm(point, SHRUG, sh), mixArm(ARM_HANG, SHRUG, sh)];
      p.head = { yaw: lerp(-58 * s, -66 * s, sh), pitch: lerp(-0.2, 0.02, sh) + nod, roll: 0.12 * s * sh };
      p.face = mixFace({ ...FACES.shock, open: 0.35, eye: 1.15, lookX: 0.9 * s, lookY: 0.5 }, { ...FACES.neutral, smile: -0.2, browY: [0.7, 0.7], eye: blinkAt(f, i + 3) }, sh);
      g.root.visible = true; g.pose(p);
    });
    const e = ease(t / (S.artist - S.guards));
    C(0, 2.7, lerp(5.2, 4.9, e), 0, 1.3, 1.6, 40);
  } else if (f < S.react) {
    // ARTIST: strolls in with palette and brush, stops dead
    const t = f - S.artist, stop = S.react - S.artist - 16, s = Math.min(1, t / stop) * 1.6, p = walk(s, 1.6, 2.3, 1.15, -90), k = ease((t - stop) / 6);
    p.arms = [{ u: [0.35, -0.85, 0.35], v: [0.1, 0.25, 1] }, mixArm(p.arms![1], UP, k)];
    p.head = { yaw: lerp(18, 4, k), pitch: lerp(0.04 * Math.sin(t * 0.4), -0.1, k) };
    p.face = mixFace({ ...FACES.neutral, smile: 0.9, eye: blinkAt(f, 5), browY: [0.3, 0.3] }, { ...FACES.shock, lookX: -1 }, k);
    p.stretch = 1 + 0.05 * k;
    w.artist.root.visible = true; w.artist.pose(p);
    const gx = p.x;
    C(gx - 1.9, 1.4, 2.7, gx + 0.08, 1.2, 0.9, 40);
  } else if (f < S.det) {
    // the guard's reaction: he spins to the camera, hands up, the hooks behind him
    const t = f - S.react;
    w.guardA.root.visible = true; w.guardA.pose(guardPose(229 + t));
    const e = ease(t / (S.det - S.react));
    C(lerp(0.36, 0.42, e), 1.35, lerp(4.6, 4.35, e), 0.53, 1.3, 1.5, 40);
  } else if (f < S.pic) {
    // DETECTIVES at the wall with magnifying glasses
    const t = f - S.det;
    w.dets.forEach((d, i) => {
      // three in a row, bent over their magnifying glasses, searching the floor towards us
      const x = -0.5 + i * 0.5, z = 1.45 + (i === 1 ? 0.25 : 0), yaw = [14, 0, -14][i], sw = Math.sin(t * 0.25 + i * 2.1), step = 0.1 * Math.sin(t * 0.12 + i);
      const p: Pose = { x: x + step * 0.3, z, yaw, lean: 0.4 + 0.05 * sw, hip: 0.6 };
      p.arms = [{ u: [0.5, -0.9, -0.2], v: [0.2, -0.9, -0.3] }, d.reach(p, 1, V(x + step * 0.3 - 0.1 + 0.1 * sw, 0.95 + 0.05 * Math.cos(t * 0.25 + i), z + 0.45))];
      p.head = { yaw: 12 * sw, pitch: -0.28 };
      p.face = { ...FACES.suspicious, eye: i === 1 ? 1.25 : 1, browY: i === 1 ? [0.6, 0.6] : [-0.3, 0.5], browTilt: i === 1 ? [0, 0] : [0.3, -0.1], lookX: 0.5 * sw, lookY: -0.6, smile: -0.3 };
      d.root.visible = true; d.pose(p);
    });
    const e = ease(t / (S.pic - S.det));
    C(0, 1.5, lerp(4.9, 4.6, e), 0, 1.12, 1.45, 40);
  } else if (f < S.queue) {
    // PICASSO is questioned; wrong man
    const t = f - S.pic, wr = at("police", "Wrong") - S.pic, k = ease((t - wr) / 8), X = PIC_X;
    cx = X;
    stand(w.picasso, X + 0.28, 0.62, -12, {
      arms: [mixArm({ u: [0.4, -0.8, 0.45], v: [-0.2, -0.5, 0.85] }, SHRUG, k), mixArm({ u: [0.4, -0.8, 0.45], v: [-0.2, -0.5, 0.85] }, SHRUG, k)],
      head: { yaw: lerp(14, -4, k), pitch: 0.03 * Math.sin(t * 0.5) * (1 - k), roll: 0.04 * Math.sin(t * 0.33) },
      face: mixFace({ ...FACES.worried, lookX: 0.7, eye: 1.2 * blinkAt(f, 7) }, { ...FACES.glee }, k), hip: 0.674 - 0.006 * (1 - k) * Math.abs(Math.sin(t * 0.5)),
    });
    const d = w.dets[0], lean = 0.1 + 0.12 * ease((t - (at("police", "questioned") - S.pic) + 6) / 10) * (1 - k), p: Pose = { x: X - 0.56, z: 1.3, yaw: 78, lean };
    p.arms = [mixArm(d.reach(p, 0, V(X + 0.1, 1.38, 0.8)), SHRUG, k), mixArm({ u: [0.3, -0.9, 0.2], v: [0.3, 0.3, 0.9] }, SHRUG, k)];
    p.head = { yaw: lerp(-16, -62, k), pitch: 0 };
    p.face = mixFace({ ...FACES.suspicious, eye: 1, browY: [-0.3, -0.3], browTilt: [0.3, 0.3], lookX: 0.4, open: 0.3 + 0.25 * Math.sin(t * 0.8), smile: 0 }, { ...FACES.worried, smile: -0.5 }, k);
    d.root.visible = true; d.pose(p);
    const e = ease(t / (S.queue - S.pic));
    C(X + 0.1, 1.5, lerp(4.25, 3.95, e), X - 0.1, 1.2, 0.9, 40);
  } else if (f < S.trunk) {
    // QUEUE: everyone stares at the bare wall; Sir Digsworth, second in line, turns to us
    const t = f - S.queue, turn = ease((t - (at("queue", "stare") - S.queue)) / 12);
    const line: Stick[] = [w.sir, w.vis[0], w.vis[1], w.vis[2], w.vis[3], w.vis[4], w.vis[5], w.dets[0], w.artist, w.dets[1], w.picasso, w.dets[2]];
    line.forEach((s, i) => {
      const x = 0.5 + i * 0.62, isSir = s === w.sir, sw = Math.sin(t * 0.09 + i * 1.7);
      const p: Pose = { x, z: 1.08 + 0.05 * Math.sin(i * 2.3), yaw: -90, hip: 0.674 - 0.004 - 0.004 * sw, roll: 0.012 * sw };
      p.head = { yaw: isSir ? lerp(30, 52, turn) : 28 - 6 * Math.sin(i * 1.3) + 3 * sw, pitch: isSir ? lerp(-0.1, 0, turn) : -0.1, roll: 0.03 * sw };
      p.face = isSir ? mixFace({ ...FACES.neutral, lookX: -0.8, browY: [0.5, 0.5], smile: 0 }, mirror(FACES.suspicious), turn) : { ...FACES.neutral, lookX: -0.9, lookY: 0.4, browY: [0.6, 0.6], smile: i % 3 ? 0 : 0.4, open: i % 4 === 2 ? 0.3 : 0, eye: blinkAt(f, i + 9) };
      if (isSir) p.arms = SIR_ARMS;
      s.root.visible = true; s.pose(p);
    });
    const e = ease(t / (S.trunk - S.queue));
    C(lerp(-1.0, -0.8, e), 1.6, lerp(4.3, 4.1, e), 0.45, 1.36, 0.6, 44);
  } else if (f < S.letter) {
    // TRUNK: the lid, the false bottom, the painting underneath
    const t = f - S.trunk, X = TRUNK_X, up = ease((t - 22) / 20), down = ease((t - 12) / 14), out = ease((t - (at("trunk", "trunk") - S.trunk) + 12) / 18);
    cx = X;
    w.trunk.lid.rotation.x = lerp(-0.7, -1.85, ease(t / 14));
    const ang = 1.5 * up;
    w.pivot.rotation.z = ang;
    // the painting comes up out of the trunk and is turned upright towards us
    const q0 = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, Math.PI / 2, 0, "YXZ")), q1 = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.08, -0.55, 0.04 * Math.sin(t * 0.2)));
    w.panel.quaternion.copy(q0).slerp(q1, out);
    const pc = V(lerp(0, 0.02, out), lerp(0.07, 0.86, out), lerp(0, 0.1, out));
    w.panel.position.copy(pc);
    const edge = V(X - 0.455 + 0.86 * Math.cos(ang), 0.3 + 0.86 * Math.sin(ang) + 0.02, 1.0);
    const hold = (dx: number, dy: number) => V(X + pc.x + dx * Math.cos(0.55), pc.y + dy, 1.0 + pc.z + 0.03 - dx * Math.sin(-0.55));
    const p: Pose = { x: X + 0.84, z: 1.0, yaw: -90, hip: lerp(0.674, lerp(lerp(0.5, 0.6, up), 0.66, out), down), lean: lerp(0.1, lerp(lerp(0.85, 0.5, up), 0.3, out), down) };
    const tL = edge.clone().setZ(1.14).lerp(hold(0.27, 0.05), out), tR = edge.clone().setZ(0.86).lerp(hold(0.2, 0.36), out);
    p.arms = [w.thief.reach(p, 0, tL), w.thief.reach(p, 1, tR)];
    p.head = { yaw: lerp(20, 58, out), pitch: lerp(0.3, 0, out) };
    p.face = mixFace({ ...FACES.neutral, lookY: -0.6, eye: blinkAt(f, 4) }, { ...FACES.glee, lookX: 0.6 }, out);
    w.thief.root.visible = true; w.thief.parts.smock.visible = false; w.thief.pose(p);
    const e = ease(t / (S.letter - S.trunk));
    C(X - lerp(1.75, 1.6, e), lerp(2.05, 1.95, e), lerp(2.9, 2.7, e), X + 0.25, 0.8, 1.0, 44);
  } else if (f < S.arrest) {
    // LETTER: address at the top, then the signature is written
    const t = f - S.letter, X = HOTEL_X;
    cx = X;
    w.letter.g.visible = true;
    w.letter.g.position.set(X + 0.004 * Math.sin(t * 0.13), 1.45 + 0.004 * Math.sin(t * 0.17), 2.0);
    w.letter.g.rotation.set(-0.04, 0, 0.012 * Math.sin(t * 0.11));
    w.letter.write((f - (at("letter", "signed") - 2)) / 22);
    const e = ease(t / (S.arrest - S.letter));
    C(X, 1.42, lerp(3.85, 3.7, e), X, 1.36, 2.0, 40);
  } else if (f < S.back) {
    // ARREST: two policemen have him by the arms
    const t = f - S.arrest, X = HOTEL_X, tug = Math.sin(t * 0.5) * 0.03;
    cx = X;
    const pp: Pose = { x: X + tug, z: 1.0, yaw: 0, roll: tug * 2, hip: 0.66 };
    pp.arms = [{ u: [0.5, -1, 0.1], v: [0.3, -1, 0.2] }, { u: [0.5, -1, 0.1], v: [0.3, -1, 0.2] }];
    pp.head = { yaw: 30 * Math.sin(t * 0.25), pitch: 0 };
    pp.face = { ...FACES.worried, eye: 1.2, lookX: Math.sin(t * 0.25), open: 0.3 };
    w.thief.root.visible = true; w.thief.parts.smock.visible = false; w.thief.pose(pp);
    w.pols.forEach((o, i) => {
      const s = i ? -1 : 1, p: Pose = { x: X - 0.53 * s, z: 1.08, yaw: 62 * s, lean: 0.04 };
      const grab = o.reach(p, i ? 1 : 0, V(X - 0.3 * s + tug, 0.98, 1.04));
      p.arms = i ? [ARM_HANG, grab] : [grab, ARM_HANG];
      p.head = { yaw: -44 * s, pitch: 0 };
      p.face = { ...FACES.suspicious, eye: 1, browY: [-0.4, -0.4], browTilt: [0.3, 0.3], smile: -0.3, lookX: 0.5 * s };
      o.root.visible = true; o.pose(p);
    });
    const e = ease(t / (S.back - S.arrest));
    C(X, 1.5, lerp(4.5, 4.25, e), X, 1.2, 1.0, 40);
  } else if (f < S.end) {
    // BACK: on her hooks again, visitors cheer
    const t = f - S.back, ch = ease((t - (at("back", "back") - S.back) + 8) / 10);
    w.mona.visible = true;
    const who: [Stick, number, number, number][] = [[w.vis[0], -0.62, 0.45, 28], [w.vis[1], 0.62, 0.45, -28]];
    who.forEach(([s, x, z, yaw], i) => {
      const sg = yaw > 0 ? 1 : -1, hop = Math.max(0, Math.sin(t * 0.45 + i * 1.6)) * ch, wv = Math.sin(t * 0.7 + i) * 0.25 * ch;
      const upA: Arm = { u: [0.7, 0.6, 0.2], v: [0.2 + wv, 1, 0.2] };
      stand(s, x, z, yaw, {
        hip: 0.674 - 0.03 * hop, stretch: 1 + 0.03 * hop, arms: [mixArm(ARM_HANG, upA, ch), mixArm(ARM_HANG, upA, ch)],
        head: { yaw: lerp(38 * sg, 0, ch), pitch: lerp(-0.2, 0, ch), roll: 0.05 * wv },
        face: mixFace({ ...FACES.neutral, lookX: 0.9 * sg, lookY: 0.6, browY: [0.6, 0.6] }, { ...FACES.glee, eye: blinkAt(f, i) }, ch),
      });
    });
    const e = ease(t / (S.end - S.back));
    C(0, 1.5, lerp(5.5, 4.9, e), 0, 1.52, 0.3, 40);
  } else {
    // END: Sir Digsworth, delighted, tips his cap
    const t = f - S.end, tip = at("end", "famous") - S.end - 6, k = ease((t - tip) / 9) * (1 - ease((t - tip - 34) / 10));
    w.mona.visible = true;
    const p: Pose = { x: 0.85, z: 1.5, yaw: -14, hip: 0.674 - 0.004 * Math.sin(t * 0.12), lean: 0.06 * k };
    const capTop = V(0.85 + 0.2, 1.424 + 0.3 + 0.08 * k, 1.5 + 0.2);
    p.arms = [mixArm(ARM_HANG, w.sir.reach(p, 0, capTop), k), SIR_ARMS[1]];
    p.head = { yaw: lerp(6, 0, k), pitch: 0.12 * k, roll: 0.04 * Math.sin(t * 0.08) };
    const wink = t > tip + 50 && t < tip + 62;
    p.face = { ...FACES.glee, eye: wink ? 0.2 : blinkAt(f, 11), browY: [1, 1] };
    w.sir.root.visible = true; w.sir.pose(p);
    const cap = w.sir.parts.cap;
    cap.position.set(0, 0.13 * k, 0.03 * k); cap.rotation.set(0.07 - 0.25 * k, 0, 0.12 * k);
    stand(w.vis[0], -0.62, 1.0, 96, { head: { yaw: -22, pitch: -0.22 }, face: { ...FACES.glee, lookX: 0.8, lookY: 0.6 } });
    const e = ease(t / (MONA_SHORT_TOTAL - S.end));
    C(lerp(1.1, 1.06, e), 1.5, lerp(4.2, 3.95, e), 0.73, 1.26, 1.5, 40);
  }
  // the daylight follows the place
  w.stage.key.position.set(cx - 4.2, 10.5, 6.5); w.stage.key.target.position.set(cx, 0.6, 0.6);
  w.stage.key.target.updateMatrixWorld();
  cam.near = 0.1; cam.far = 80;
  cam.updateProjectionMatrix(); cam.updateMatrixWorld(true);
};

// ---------------------------------------------------------------- thumbnails (frames 0-2 of MonaThumb)
const thumb = (w: World, f: number, cam: THREE.PerspectiveCamera) => {
  for (const s of w.all) s.root.visible = false;
  w.mona.visible = w.bundle.visible = w.sign.visible = w.letter.g.visible = false;
  let cx = 0;
  const C = (px: number, py: number, pz: number, lx: number, ly: number, lz: number, fov: number) => { cam.position.set(px, py, pz); cam.fov = fov; cam.lookAt(lx, ly, lz); };
  if (f === 0) {
    // the thief sneaks off with her, the bare hooks behind him
    w.mona.visible = true; w.mona.scale.setScalar(1);
    w.mona.position.set(-0.2, 1.42, 1.72); w.mona.rotation.set(0.04, 0.2, -0.08);
    const p: Pose = { x: 0.42, z: 1.3, yaw: -16, lean: 0.05 };
    p.arms = [w.thief.reach(p, 0, V(0.14, 1.2, 1.76)), w.thief.reach(p, 1, V(0.12, 1.55, 1.72))];
    p.head = { yaw: 10, pitch: 0, roll: -0.08 }; p.face = { ...FACES.glee, lookX: -0.9, browY: [0.2, 0.9] };
    w.thief.root.visible = true; w.thief.parts.smock.visible = true; w.thief.pose(p);
    C(0.02, 1.5, 4.25, 0.08, 1.52, 1.4, 40);
  } else if (f === 1) {
    // the guard, hands up, in front of the four hooks
    w.guardA.root.visible = true; w.guardA.pose(guardPose(240));
    C(0.4, 1.4, 4.1, 0.5, 1.5, 1.5, 40);
  } else {
    cx = PIC_X;
    stand(w.picasso, PIC_X + 0.3, 0.62, -12, { arms: [UP, UP], face: { ...FACES.shock, lookX: 0.6 }, head: { yaw: 10 } });
    const d = w.dets[0], p: Pose = { x: PIC_X - 0.5, z: 1.3, yaw: 70, lean: 0.2 };
    p.arms = [d.reach(p, 0, V(PIC_X + 0.1, 1.4, 0.8)), ARM_HANG]; p.head = { yaw: -30 };
    p.face = { ...FACES.suspicious, eye: 1, browY: [-0.4, -0.4], browTilt: [0.35, 0.35], open: 0.5, smile: 0, lookX: 0.5 };
    d.root.visible = true; d.pose(p);
    C(PIC_X + 0.05, 1.5, 3.6, PIC_X - 0.08, 1.45, 0.9, 40);
  }
  w.stage.key.position.set(cx - 4.2, 10.5, 6.5); w.stage.key.target.position.set(cx, 0.6, 0.6); w.stage.key.target.updateMatrixWorld();
  cam.near = 0.1; cam.far = 80; cam.updateProjectionMatrix(); cam.updateMatrixWorld(true);
};

const Inner: React.FC<{ assets: Assets; ready: () => void; thumbs?: boolean }> = ({ assets, ready, thumbs }) => {
  const f = useCurrentFrame();
  const { camera, scene } = useThree();
  const cam = camera as THREE.PerspectiveCamera;
  const world = useMemo(() => build(assets), [assets]);
  const fx = useMemo(() => ({
    ink: new InkPass(scene, cam, { widthNear: 7.5, widthFar: 4.5, distNear: 3, distFar: 30 }),
    tone: new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL }),
  }), [scene, cam]);
  useEffect(() => () => fx.ink.dispose(), [fx]);
  useMemo(() => { scene.background = new THREE.Color(0x2a1a16); }, [scene]);
  useEffect(() => { ready(); }, [ready]);
  if (thumbs) thumb(world, f, cam); else update(world, f, cam);
  return (
    <>
      <primitive object={world.root} dispose={null} />
      <EffectComposer multisampling={4}>
        <primitive object={fx.ink} dispose={null} />
        <primitive object={fx.tone} dispose={null} />
      </EffectComposer>
    </>
  );
};

// ---------------------------------------------------------------- text on the picture
const FONT = "'Arial Black', 'Segoe UI Black', Impact, sans-serif";
const outline = (px: number): React.CSSProperties => ({ WebkitTextStroke: `${px}px #101014`, paintOrder: "stroke fill", textShadow: "0 6px 0 rgba(16,16,20,0.9)", strokeLinejoin: "round" } as React.CSSProperties);
const pop = (n: number) => (n <= 0 ? 0.6 : n === 1 ? 1.12 : n === 2 ? 0.97 : 1);
/** a label in the top band (below the interface strip): date, place, name */
const Tag: React.FC<{ from: number; to: number; text: string; sub?: string; top?: string; color?: string }> = ({ from, to, text, sub, top = "16.5%", color = "#ffe14d" }) => {
  const f = useCurrentFrame();
  if (f < from || f >= to) return null;
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", transform: `scale(${pop(f - from)})` }}>
      <div style={{ fontFamily: FONT, fontSize: text.length > 18 ? 58 : 68, color, background: "#16131a", padding: "10px 30px 14px", borderRadius: 14, border: "5px solid #f6efdc", whiteSpace: "nowrap", letterSpacing: 1 }}>{text}</div>
      {sub && <div style={{ fontFamily: FONT, fontSize: 54, color: "#ffffff", marginTop: 8, ...outline(11) }}>{sub}</div>}
    </div>
  );
};
const clean = (w: string) => w.replace(/[.,:;!?]+$/g, "").replace(/^[("]+/, "");
const Captions: React.FC = () => {
  const f = useCurrentFrame(), t = f / FPS;
  if (f < S.paris) return null; // the hook is its own text
  let cur: Word | null = null;
  for (let i = 0; i < WORDS.length; i++) {
    const w = WORDS[i], next = WORDS[i + 1];
    const end = next && next.a - w.b < 0.45 ? next.a : w.b + 0.22;
    if (t >= w.a - 0.03 && t < end - 0.03) { cur = w; break; }
  }
  if (!cur) return null;
  const n = Math.max(0, f - Math.round((cur.a - 0.03) * FPS)), big = /\d/.test(cur.w);
  return (
    <div style={{ position: "absolute", top: "67.5%", left: 0, right: 0, textAlign: "center", transform: `translateY(-50%) scale(${n === 0 ? 0.9 : n === 1 ? 1.06 : 1})`, fontFamily: FONT, fontSize: big ? 104 : 92, letterSpacing: -1, color: big ? "#ffe14d" : "#ffffff", whiteSpace: "nowrap", lineHeight: 1, ...outline(14) }}>{clean(cur.w)}</div>
  );
};
const Overlays: React.FC = () => {
  const f = useCurrentFrame();
  const nobody = at("hook", "And") - 1, wrong = at("police", "Wrong") - 1, photo = at("guards", "photographers") - 3;
  return (
    <AbsoluteFill>
      {f < S.paris && (
        <div style={{ position: "absolute", top: "15.5%", left: 0, right: 0, textAlign: "center", fontFamily: FONT, lineHeight: 1.02 }}>
          <div style={{ fontSize: 176, color: "#ffe14d", transform: `scale(${f < 3 ? 1 : pop(f - 3 + 3)})`, ...outline(20) }}>STOLEN.</div>
          {f >= nobody && <div style={{ fontSize: 80, color: "#ffffff", marginTop: 6, transform: `scale(${pop(f - nobody)})`, ...outline(14) }}>AND NOBODY NOTICED.</div>}
        </div>
      )}
      <Tag from={S.paris + 2} to={at("paris", "The") - 12} text="PARIS, 21 AUGUST 1911" />
      <Tag from={at("who") + 2} to={S.lift} text="VINCENZO PERUGGIA" sub="house painter" top="75.5%" />
      <Tag from={at("artist") + 4} to={S.det} text="TUESDAY, 11 A.M." />
      {f >= S.det + 2 && f < S.pic && (
        <div style={{ position: "absolute", top: "15.5%", left: 0, right: 0, display: "flex", justifyContent: "center", transform: `scale(${pop(f - S.det - 2)}) rotate(-2deg)` }}>
          <div style={{ fontFamily: FONT, background: "#f6efdc", border: "10px solid #5a3a20", borderRadius: 10, padding: "6px 44px 14px", textAlign: "center", boxShadow: "0 10px 0 rgba(16,16,20,0.7)" }}>
            <div style={{ fontSize: 190, color: "#b0302a", lineHeight: 0.95 }}>60</div>
            <div style={{ fontSize: 66, color: "#16131a", lineHeight: 1 }}>DETECTIVES</div>
          </div>
        </div>
      )}
      <Tag from={at("police", "Pablo")} to={wrong} text="PABLO PICASSO" sub="questioned" top="76%" />
      {f >= wrong && f < S.queue && (
        <div style={{ position: "absolute", top: "76%", left: 0, right: 0, display: "flex", justifyContent: "center", transform: `scale(${f - wrong < 3 ? [2.2, 1.3, 0.94][f - wrong] : 1}) rotate(-7deg)` }}>
          <div style={{ fontFamily: FONT, fontSize: 104, color: "#d2302a", border: "12px solid #d2302a", borderRadius: 18, padding: "0 34px 8px", background: "rgba(246,239,220,0.92)", letterSpacing: 4 }}>RELEASED</div>
        </div>
      )}
      {f >= photo && f < S.artist && (
        <div style={{ position: "absolute", top: "13.5%", left: "6%", transform: `scale(${pop(f - photo)})`, transformOrigin: "60% 100%" }}>
          <svg width="420" height="300" viewBox="0 0 420 300">
            <ellipse cx="210" cy="118" rx="196" ry="106" fill="#ffffff" stroke="#16131a" strokeWidth="10" />
            <circle cx="150" cy="246" r="20" fill="#ffffff" stroke="#16131a" strokeWidth="8" /><circle cx="128" cy="284" r="11" fill="#ffffff" stroke="#16131a" strokeWidth="7" />
            {/* a plate camera on a tripod */}
            <rect x="150" y="62" width="104" height="76" rx="8" fill="#5a3a20" stroke="#16131a" strokeWidth="8" />
            <polygon points="254,74 300,58 300,142 254,126" fill="#2a2a30" stroke="#16131a" strokeWidth="8" strokeLinejoin="round" />
            <circle cx="312" cy="100" r="20" fill="#cfe9ff" stroke="#16131a" strokeWidth="8" />
            <path d="M202 138 L170 196 M202 138 L202 198 M202 138 L236 196" stroke="#16131a" strokeWidth="9" strokeLinecap="round" fill="none" />
            <path d="M112 70 l-24 -22 M100 104 h-32 M112 136 l-24 20" stroke="#f0bd3c" strokeWidth="9" strokeLinecap="round" />
          </svg>
        </div>
      )}
      <Tag from={at("trunk", "two") - 2} to={S.letter} text="2 YEARS" top="77%" />
      <Tag from={at("letter", "and")} to={S.back} text="FLORENCE, DECEMBER 1913" />
      <Tag from={at("back", "January") - 2} to={S.end} text="4 JANUARY 1914" />
      <Captions />
    </AbsoluteFill>
  );
};

export const MonaShort: React.FC = () => {
  const p = getInputProps() as { audio?: boolean; text?: boolean };
  const [handle] = useState(() => delayRender("mona short: loading models and paintings", { timeoutInMilliseconds: 120000 }));
  const [assets, setAssets] = useState<Assets | null>(null);
  useEffect(() => {
    let dead = false;
    loadAssets().then((a) => { if (!dead) setAssets(a); }).catch((e) => { console.error(e); throw e; });
    return () => { dead = true; };
  }, []);
  const ready = useMemo(() => () => continueRender(handle), [handle]);
  return (
    <AbsoluteFill style={{ background: "#2a1a16" }}>
      {assets && (
        <ThreeCanvas width={W} height={H} shadows gl={{ antialias: false, stencil: false, powerPreference: "high-performance", toneMappingExposure: 1.0 }} camera={{ fov: 40, near: 0.1, far: 80 }}>
          <Inner assets={assets} ready={ready} />
        </ThreeCanvas>
      )}
      {p.text !== false && <Overlays />}
      {p.audio !== false && <Audio src={staticFile("mona/mix-short.wav")} />}
    </AbsoluteFill>
  );
};

const THUMB_WORDS: [string, string][] = [["GONE", "2 YEARS"], ["WHERE", "IS SHE?"], ["WRONG", "MAN"]];
export const MonaShortThumb: React.FC = () => {
  const f = useCurrentFrame();
  const [handle] = useState(() => delayRender("mona thumbs: loading", { timeoutInMilliseconds: 120000 }));
  const [assets, setAssets] = useState<Assets | null>(null);
  useEffect(() => { loadAssets().then(setAssets).catch((e) => { console.error(e); throw e; }); }, []);
  const ready = useMemo(() => () => continueRender(handle), [handle]);
  const [a, b] = THUMB_WORDS[Math.min(2, f)];
  return (
    <AbsoluteFill style={{ background: "#2a1a16" }}>
      {assets && (
        <ThreeCanvas width={W} height={H} shadows gl={{ antialias: false, stencil: false, powerPreference: "high-performance", toneMappingExposure: 1.0 }} camera={{ fov: 40, near: 0.1, far: 80 }}>
          <Inner assets={assets} ready={ready} thumbs />
        </ThreeCanvas>
      )}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0) 45%, rgba(10,4,2,0.6) 100%)" }} />
      <div style={{ position: "absolute", top: "61%", left: 0, right: 0, textAlign: "center", fontFamily: FONT, lineHeight: 0.98, transform: "rotate(-3deg)" }}>
        <div style={{ fontSize: 230, color: "#ffffff", ...outline(30) }}>{a}</div>
        <div style={{ fontSize: b.length > 6 ? 196 : 230, color: "#ffe14d", ...outline(30) }}>{b}</div>
      </div>
    </AbsoluteFill>
  );
};
