// Short: "Did pirates really make you walk the plank?" One pirate sloop at sea (world/ship.ts), played on the stage (stage/Stage.tsx).
// The shots are cut to the narration's lines (voice/pirate-plank). Sources and what must not be claimed: granskning/pirate-plank/manus.md.
// The picture of the plank at the start is the story everybody knows; the rest shows what the sources say pirates did instead.
import * as THREE from "three";
import { Film, Shot, Cam, V3, Staged, Word, play, talk, smooth } from "../stage/film";
import { mover, mt, wag, arm } from "../stage/acting";
import { lens, aim, once, noShade, put, between, near } from "../stage/staging";
import { pirateShip, SHIP, SEA, farSloop } from "../world/ship";
import { mesh, box, ball, rod } from "../world/kit";
import { coin, cutlass, storyBook, articlesSheet, moneySack, sharkFin, sharkBody, foamRing, hookHand, bottle, pistol } from "../world/props";
import { SIR_D, CAPTAIN_D, PIRATE_D, MATE_D } from "../looks";
import type { Pose } from "../rig";
import words from "../../../voice/pirate-plank/words.json";
import lines from "../../../voice/pirate-plank/lines.json";

const W = words as Word[], L = Object.fromEntries((lines as { id: string; a: number; b: number }[]).map((l) => [l.id, l]));
const cut = (a: string, b: string) => (L[a].b + L[b].a) / 2;       // a cut falls in the pause between two lines
const END = L.origin.b + 0.6;
/** when a word of a line is spoken (film seconds) */
const at = (line: string, re: RegExp) => W.find((w) => w.line === line && re.test(w.w))!.a;
const P = (o: Partial<Pose>) => o;
const rad = (d: number) => (d * Math.PI) / 180;
const PL = SHIP.plank;

// ---------------- the things of the ship (made once, moved by the shots) ----------------
const CUTLASS = once(() => noShade(cutlass())), FIN = once(() => sharkFin(0.66)), FOAM = once(() => foamRing(0.42)), FOAM2 = once(() => foamRing(0.5));
const COINS = [0, 1, 2, 3, 4, 5, 6, 7].map(() => once(() => noShade(coin(0.045))));
const BOOK_T = once(() => storyBook(["TREASURE", "ISLAND"], "island", 0.36, 0.46, "#2f6f8f")), BOOK_P = once(() => storyBook(["PETER PAN"], "plank")), SHEET = once(() => articlesSheet(0.36, 0.475)), SACK = once(() => noShade(moneySack(0.24, "800")));
const SHARK = once(() => sharkBody(2.3, 1)), SHARK_SHUT = once(() => sharkBody(2.3, 0.12));
const HOOK = once(() => hookHand()), BOTTLE = once(() => bottle(0.34)), PISTOL = once(() => pistol()), SLOOP = once(() => farSloop());
/** the cutlass in a figure's right hand: the blade points the way he faces, raised by `deg` degrees */
const sword = (g: THREE.Group, a: Staged, cam: Cam, deg: number, hand: "tipR" | "tipL" = "tipR") => { const k = put(g, CUTLASS(), near(a.joint(hand), cam, 0.05)); k.rotation.set(0, rad(a.heading - 90), rad(deg)); return k; };
/** the shark: its fin cutting the water at (x, z) and going toward `dir` degrees, the white water round it, its dark back under the surface */
const shark = (g: THREE.Group, x: number, z: number, dir: number, t: number) => {
  const ry = rad(dir - 90); put(g, FIN(), [x, SEA - 0.05 + 0.04 * Math.sin(t * 3), z], ry); put(g, FOAM(), [x, SEA + 0.02, z], ry);
  g.add(mesh(ball(1, 14), "#1b5b98", { at: [x - Math.sin(rad(dir)) * 0.35, SEA + 0.012, z - Math.cos(rad(dir)) * 0.35], scale: [1.7, 0.012, 0.46], rot: [0, ry, 0], line: 0, shadow: false }));
};
/** a shark going round the point (cx, cz) */
const circling = (g: THREE.Group, cx: number, cz: number, r: number, t: number, w = 1.5, a0 = 0) => { const a = a0 + t * w; shark(g, cx + r * Math.cos(a), cz + r * Math.sin(a), (Math.atan2(-Math.sin(a) * w, Math.cos(a) * w) * 180) / Math.PI, t); };
/** the shark coming up out of the water at (x, z), jaws first, toward `dir`, and falling back: u = 0 as its nose breaks the surface,
 *  1 as it is gone again; `top` = how far above the sea its nose gets. The jaws shut at the top */
const lunge = (g: THREE.Group, x: number, z: number, dir: number, u: number, top = 1.9, dur = 1) => {
  splash(g, [x, SEA, z], u * dur, 0.8); splash(g, [x + Math.sin(rad(dir)) * 0.5, SEA, z + Math.cos(rad(dir)) * 0.5], (u - 0.86) * dur, 1);
  if (u <= 0 || u >= 1) return;
  const k = put(g, u < 0.52 ? SHARK() : SHARK_SHUT(), [x + Math.sin(rad(dir)) * 0.5 * u, SEA - 1.35 + (top + 0.25) * Math.sin(Math.PI * u), z + Math.cos(rad(dir)) * 0.5 * u]); k.rotation.set(0, rad(dir - 90), rad(76 - 40 * u * u));
};
/** water thrown up where something heavy has gone in: a crown of drops, a column, rings that widen. u = seconds since it hit */
const splash = (g: THREE.Group, p: V3, u: number, big = 1) => {
  if (u < 0) return;
  for (let k = 0; k < 16; k++) { const a = (k / 16) * 6.283 + 0.3, v = (1.4 + 0.9 * ((k * 7) % 4) / 3) * big, x = Math.cos(a) * v * u * 0.8, z = Math.sin(a) * v * u * 0.8, y = (4.2 + 1.3 * (k % 3)) * big * u - 6.5 * u * u;
    if (y > 0) g.add(mesh(ball(0.07 * big * Math.max(0.4, 1 - u * 0.5), 8), k % 2 ? "#ffffff" : "#bfe3fb", { at: [p[0] + x, p[1] + y, p[2] + z], line: 0.5, shadow: false })); }
  const col = Math.max(0, 1 - u / 0.7); if (col > 0) g.add(mesh(ball(1, 12), "#eaf6ff", { at: [p[0], p[1] + 0.5 * big * Math.sin(Math.PI * Math.min(1, u / 0.5)), p[2]], scale: [0.36 * big * (0.6 + u), 0.9 * big * col + 0.05, 0.36 * big * (0.6 + u)], line: 0.7, shadow: false }));
  for (const [o, f] of [[0, FOAM], [0.25, FOAM2]] as [number, () => THREE.Object3D][]) { const v = u - o; if (v > 0) { const r = put(g, f(), [p[0], p[1] + 0.02, p[2]]); r.scale.setScalar(0.6 + v * 2.6 * big); } }
};
/** drops falling from somebody who is soaked */
const drips = (g: THREE.Group, a: Staged, t: number, cam: Cam, n = 7) => {
  for (let k = 0; k < n; k++) { const j = (["elL", "elR", "wrL", "wrR", "crown", "pelvis", "neck"] as const)[k % 7], p = near(a.joint(j), cam, 0.06), u = (t * 1.6 + k * 0.37) % 1, y = p[1] - 0.05 - 1.3 * u * u;
    if (y > a.at[1] + 0.03) g.add(mesh(ball(0.022, 6), "#9fd4f6", { at: [p[0] + 0.03 * Math.sin(k * 5), y, p[2]], scale: [1, 1.7, 1], line: 0, shadow: false })); }
};
/** a coin in the air: thrown from p at time 0 with the speed v, turning as it goes */
const tossed = (g: THREE.Group, k: number, p: V3, v: V3, u: number, floor: number) => {
  if (u < 0) return; const y = p[1] + v[1] * u - 4.9 * u * u; const c = put(g, COINS[k % COINS.length](), [p[0] + v[0] * u, Math.max(floor + 0.02, y), p[2] + v[2] * u]); c.rotation.set(y > floor + 0.02 ? Math.PI / 2 + u * 14 : 0, k, 0);
};

const shots: Shot[] = [];
const add = (s: Shot) => shots.push(s);

// 1. THE HOOK: the picture everybody knows. Sir Digsworth at the very end of the plank, the captain's cutlass at his back, and a
//    shark coming up out of the water at his feet with its jaws open
{
  const V = aim(5.62, PL.z, 4.45, -0.06, -55, -0.25, 0, 56), [kx, kz] = V.spot(3.5, -0.8);
  const sir = mover(SIR_D, 1.8, 5.62, PL.z, 90); sir.stand(8);
  sir.actAt(-1, { armL: arm(8, 82, 20, 96), armR: arm(8, 82, 20, 96), lean: -3, head: [0, 12, 0] }, 9, { in: 0.01, handL: "open", handR: "open", face: { wide: 1, lid: 0, brow: 1, smile: -1, mouth: 0.5, gaze: [0.4, 0.9] } });
  // he snatches his foot away from the jaws and nearly goes over backward
  sir.actAt(-0.2, { legL: { th: [70, 10], sh: [-40, 0], pitch: 30 }, lean: -16, pz: -0.06, armL: arm(60, 70, 130, 60), armR: arm(40, 80, 100, 96) }, 0.95, { in: 0.12, out: 0.3, antic: 0, over: 1.6, handL: "open", handR: "open" });
  wag(sir, 0.8, 4, P({ roll: 8, armL: arm(8, 58, 20, 66), armR: arm(8, 104, 24, 122) }), P({ roll: -8, armL: arm(8, 104, 24, 122), armR: arm(8, 58, 20, 66) }), 0.7, { handL: "open", handR: "open" });
  const cap = mover(CAPTAIN_D, 1.86, 3.55, PL.z, 90); cap.stand(6);
  cap.actAt(-1, { armR: arm(76, 4, 84, 0), armL: arm(14, 8, 44, 4), lean: 8 }, 9, { in: 0.01, handR: "grip", handL: "fist", face: { brow: -1, smile: 0.3, lid: 0.15 } });
  for (const t0 of [0.9, 1.7]) cap.actAt(t0, { armR: arm(86, 4, 90, 0), pz: 0.08, lean: 15 }, 0.34, { in: 0.09, out: 0.2, antic: 0.4, over: 1.6, handR: "grip" });
  add({ id: "hook", a: 0, b: cut("hook", "story"), still: 0.14,
    sounds: [{ t: 0, k: "splash", g: 1.1, p: -0.5 }, { t: 0.19, k: "snap", p: -0.4 }, { t: 0.56, k: "splash", g: 0.9, p: -0.5 }, { t: 0.05, k: "creak", g: 0.7 }, { t: 0.9, k: "whoosh", g: 0.5, p: 0.5 }, { t: 1.3, k: "creak", g: 0.6 }, { t: 1.7, k: "whoosh", g: 0.5, p: 0.5 }],
    cam: (_t, u) => V.push(0.2 * u), sun: { target: [4.6, 0, 0.6], reach: 7 },
    cast: (t, T) => [play("cap", CAPTAIN_D, cap, t, [0, PL.y, 0], 1.86, { seed: 5 }), play("sir", SIR_D, sir, t, [0, PL.y, 0], 1.8, { talk: talk(W, T, ["hook"]), blink: false })],
    things: (g, c, t, _T, cam) => { sword(g, c.cap, cam, 4); lunge(g, kx, kz, -150, (t + 0.36) / 1.05, 2.05, 1.05); if (t > 1.0) circling(g, kx + 0.2, kz + 0.9, 0.8, t, 1.7, 2.2); } });
}
// 2. A PLANK, A SWORD, A SHARK: from above. He counts them off: the plank under his feet, the blade behind him, and the shark, which
//    comes up again as he points at it
const storyMid = at("story", /^Just/) - 0.12;
{
  const V = aim(5.5, PL.z, 4.0, 0.16, -120, 3.45, -31, 42), t0 = cut("hook", "story");
  const sir = mover(SIR_D, 1.8, 5.5, PL.z, 90); sir.stand(8);
  const tp = at("story", /plank/) - t0, ts = at("story", /sword/) - t0, tk = at("story", /shark/) - t0;
  sir.actAt(-1, { armL: arm(8, 60, 20, 70), armR: arm(8, 60, 20, 70), head: [0, 10, 0] }, 9, { in: 0.01, handL: "open", handR: "open", face: { wide: 0.7, lid: 0, brow: 0.8, gaze: [0, 0.6] } });
  sir.actAt(tp, { armR: arm(38, 10, 30, 0), lean: 12, head: [0, 26, 0] }, ts - tp + 0.05, { in: 0.14, out: 0.12, antic: 0.3, over: 1.8, handR: "point", face: { brow: 0.6, wide: 0.6, lid: 0, gaze: [0, 1] } });
  sir.actAt(ts, { armL: arm(150, 16, 232, 6), twist: 24, head: [42, 0, 0], lean: -3 }, tk - ts + 0.05, { in: 0.14, out: 0.12, antic: 0.3, over: 1.8, handL: "point", face: { brow: 1, wide: 0.8, lid: 0, gaze: [0.9, 0] } });
  sir.actAt(tk, { armR: arm(30, 60, 20, 50), roll: -6, head: [-30, 24, 0], lean: 4 }, 3, { in: 0.14, antic: 0.3, over: 2, handR: "point", face: { brow: 1, wide: 1, lid: 0, mouth: 0.5, gaze: [-0.8, 1] } });
  const cap = mover(CAPTAIN_D, 1.86, 3.4, PL.z, 90); cap.stand(8);
  cap.actAt(-1, { armR: arm(76, 4, 84, 0), armL: arm(14, 8, 44, 4), lean: 8 }, 9, { in: 0.01, handR: "grip", handL: "fist", face: { brow: -1, smile: 0.3, lid: 0.15 } });
  cap.actAt(ts - 0.05, { armR: arm(86, 4, 90, 0), pz: 0.08, lean: 15 }, 0.4, { in: 0.09, out: 0.2, antic: 0.4, over: 1.6, handR: "grip" });
  add({ id: "count", a: t0, b: storyMid, still: tk + 0.38,
    sounds: [{ t: tp, k: "creak", g: 0.7 }, { t: ts - 0.05, k: "shing", p: 0.3 }, { t: tk - 0.12, k: "splash", g: 1.0, p: -0.5 }, { t: tk - 0.12 + 0.52 * 0.95, k: "snap", p: -0.5 }, { t: tk - 0.12 + 0.86 * 0.95, k: "splash", g: 0.8, p: -0.5 }],
    cam: (_t, u) => V.push(0.14 * u), sun: { target: [4.6, 0, 0.6], reach: 7 },
    cast: (t, T) => [play("cap", CAPTAIN_D, cap, t, [0, PL.y, 0], 1.86, { seed: 5 }), play("sir", SIR_D, sir, t, [0, PL.y, 0], 1.8, { talk: talk(W, T, ["story"]), blink: false })],
    things: (g, c, t, _T, cam) => { const k = sword(g, c.cap, cam, 4); k.rotation.x = Math.PI / 2; const [lx, lz] = V.spot(3.95, -0.78); if (t < tk - 0.2) circling(g, lx, lz, 0.5, t, 1.7, 2.6); lunge(g, lx, lz, 80, (t - tk + 0.12) / 0.95, 2.55, 0.95); } });
}
// 3. JUST LIKE THE STORIES: from below, at the end of the plank. He shakes both fists in the air, delighted; behind him the captain
//    lets his blade sink and scratches his head
{
  const V = aim(5.5, PL.z, 2.5, -0.1, -67, 0.5, 14, 50);
  const sir = mover(SIR_D, 1.8, 5.5, PL.z, 90); sir.stand(8);
  sir.actAt(-1, { armL: arm(150, 30, 180, 12), armR: arm(150, 30, 180, 12), lean: -5, head: [0, -8, 0] }, 9, { in: 0.01, handL: "fist", handR: "fist", face: { smile: 1, wide: 0.5, lid: 0, brow: 1 } });
  wag(sir, 0.02, 3, P({ armL: arm(160, 30, 190, 12), armR: arm(160, 30, 190, 12), py: 0.03 }), P({ armL: arm(138, 34, 166, 16), armR: arm(138, 34, 166, 16), py: -0.02 }), 0.36, { handL: "fist", handR: "fist" });
  const cap = mover(CAPTAIN_D, 1.86, 3.25, PL.z + 0.05, 90); cap.stand(8);
  cap.actAt(-1, { armR: arm(14, 8, 34, 0), armL: arm(128, 30, 206, -24), head: [0, 0, -9], lean: -3 }, 9, { in: 0.01, handR: "grip", handL: "relaxed", face: { brow: 0.9, lid: 0.1, smile: -0.5, gaze: [0, -0.2] } });
  wag(cap, 0.1, 3, P({ armL: arm(132, 30, 212, -24) }), P({ armL: arm(124, 30, 198, -24) }), 0.3, { handL: "relaxed" });
  add({ id: "stories", a: storyMid, b: cut("story", "rules"), still: 0.62,
    sounds: [{ t: 0.08, k: "whoosh", g: 0.4 }, { t: 0.44, k: "whoosh", g: 0.4 }, { t: 0.2, k: "creak", g: 0.6 }, { t: 0.8, k: "whoosh", g: 0.4 }],
    cam: (_t, u) => V.push(0.08 * u), sun: { target: [4.6, 0, 0.6], reach: 7 },
    cast: (t, T) => [play("cap", CAPTAIN_D, cap, t, [0, PL.y, 0], 1.86, { seed: 5 }), play("sir", SIR_D, sir, t, [0, PL.y, 0], 1.8, { talk: talk(W, T, ["story"]), blink: false })],
    things: (g, c, _t, _T, cam) => { sword(g, c.cap, cam, -62); } });
}
// 4. NOT QUITE. REAL PIRATES HAD WRITTEN RULES: on deck. The captain wags a rolled paper at him, then lets it fall open: the
//    articles. He raps on them; Sir Digsworth leans in and reads through his monocle
{
  const a0 = cut("story", "rules"), V = lens(0.9, 1.14, 3.9, 0, -1, 0, 50), [cx, cz] = V.spot(2.0, -0.2), [qx, qz] = V.spot(2.8, 0.36), open = at("rules", /^Real/) - a0 - 0.05, rap = at("rules", /^written/) - a0;
  const cap = mover(CAPTAIN_D, 1.86, cx, cz, V.toward(cx, cz, 6)); cap.stand(8);
  cap.actAt(-1, { armL: arm(74, 26, 150, 6), armR: arm(10, 14, 40, 0), head: [0, 2, 0] }, open + 0.1, { in: 0.01, out: 0.14, handL: "grip", handR: "fist", face: { brow: -0.5, smile: 0.36, lid: 0.15, gaze: [0.5, 0] } });
  wag(cap, 0.05, open - 0.1, P({ armL: arm(74, 40, 150, 26), head: [10, 2, 0] }), P({ armL: arm(74, 12, 150, -14), head: [-10, 2, 0] }), 0.36, { handL: "grip" });
  cap.actAt(open, { armL: arm(40, 30, 100, 4), armR: arm(34, 30, 100, 10), head: [0, 6, 0] }, 9, { in: 0.16, antic: 0.3, over: 1.6, handL: "grip", handR: "point", face: { brow: 0.4, smile: 0.38, lid: 0.1, gaze: [0, 0.6] } });
  wag(cap, rap, 3, P({ armR: arm(44, 16, 104, -34) }), P({ armR: arm(36, 28, 96, -8) }), 0.34, { handR: "point" });
  const sir = mover(SIR_D, 1.8, qx, qz, V.toward(qx, qz, -20)); sir.stand(8);
  sir.actAt(-1, { armL: arm(8, 12, 20, 0), head: [-10, 0, 0] }, open + 0.5, { in: 0.01, out: 0.2, face: { brow: 0.8, wide: 0.3, gaze: [-0.7, 0.1] } });
  sir.actAt(open + 0.15, { lean: 15, armR: arm(84, 22, 152, -14), head: [-18, 12, -6] }, 9, { in: 0.3, antic: 0.3, over: 1.5, handR: "grip", face: { brow: 1, wide: 0.5, lid: 0, gaze: [-0.8, 0.6] } });
  add({ id: "rules", a: a0, b: cut("rules", "limb"), still: rap + 0.35,
    sounds: [{ t: 0.1, k: "whoosh", g: 0.3 }, { t: 0.46, k: "whoosh", g: 0.3 }, { t: open + 0.05, k: "paper", p: -0.2 }, ...[0, 0.34, 0.68].map((d) => ({ t: rap + d, k: "tap", g: 0.8, p: -0.1 }))],
    cam: (_t, u) => V.push(0.14 * u), sun: { target: [0.9, 0, 1.6], reach: 5 },
    cast: (t) => [play("sir", SIR_D, sir, t, [0, 0, 0], 1.8, { blink: false }), play("cap", CAPTAIN_D, cap, t, [0, 0, 0], 1.86, { seed: 5 })],
    things: (g, c, t, _T, cam) => {
      if (t < open) { const p = near(c.cap.joint("tipL"), cam, 0.06); g.add(rod([p[0] - 0.02, p[1] - 0.12, p[2]], [p[0] + 0.04, p[1] + 0.26, p[2]], 0.04, "#f3e6c4", { line: 0.7, shadow: false })); return; }
      // the sheet falls open from his hands and swings to rest
      const u = (t - open) / 0.22, s = u < 1 ? 0.12 + 0.88 * smooth(u) : 1 + 0.06 * Math.sin((t - open - 0.22) * 16) * Math.exp(-(t - open - 0.22) * 6), p = near(c.cap.joint("neck"), cam, 0.16), top = p[1] - 0.1, k = put(g, SHEET(), [p[0], top - 0.2375 * s, p[2]]);
      k.lookAt(cam.pos[0], top - 0.2375 * s, cam.pos[2]); k.scale.set(1, s, 1); k.rotation.z += 0.04; } });
}
/** the hook on the end of his right arm: it covers the fist of the drawing, points on along the forearm and curls in the plane of the picture */
function hooked(g: THREE.Group, a: Staged, cam: Cam) {
  const e = new THREE.Vector3(...a.joint("elR")), w = new THREE.Vector3(...a.joint("wrR")), x = w.clone().sub(e).normalize(), p = near([w.x - x.x * 0.03, w.y - x.y * 0.03, w.z - x.z * 0.03], cam, 0.07);
  const z = new THREE.Vector3(cam.pos[0] - w.x, cam.pos[1] - w.y, cam.pos[2] - w.z); z.addScaledVector(x, -z.dot(x)).normalize(); const y = z.clone().cross(x), k = HOOK();
  k.position.set(...p); k.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z)); g.add(k);
}
// 5. LOSE A LIMB IN BATTLE, AND THE CREW PAID YOU EIGHT HUNDRED PIECES OF EIGHT: one of the crew holds up the iron hook where his
//    hand was; the captain nods at it and swings a heavy sack into his arms. He sags under it and coins jump out
const limbA = cut("rules", "limb");
{
  const V = lens(-1.75, 1.1, 4.0, 1, -0.1, 4, 50), [mx, mz] = V.spot(2.6, -0.36), [cx, cz] = V.spot(3.3, 0.5), give = at("limb", /^paid/) - limbA - 0.12;
  const cap = mover(CAPTAIN_D, 1.86, cx, cz, V.toward(cx, cz, -40)); cap.stand(8);
  cap.actAt(-1, { armL: arm(30, 10, 84, -6), armR: arm(30, 10, 84, -6), lean: -6, twist: -10, head: [8, 0, 0] }, give + 0.2, { in: 0.01, out: 0.16, handL: "grip", handR: "grip", face: { smile: 0.2, brow: 0.6, gaze: [-0.7, -0.4] } });
  for (const t0 of [0.75, 1.15]) cap.actAt(t0, { head: [8, 14, 0] }, 0.3, { in: 0.1, out: 0.14, antic: 0.2, over: 1.4 });
  cap.actAt(give - 0.2, { armL: arm(80, 8, 92, 0), armR: arm(84, 8, 96, 0), lean: 14, pz: 0.06 }, 0.6, { in: 0.2, out: 0.3, antic: 0.5, over: 1.6, handL: "open", handR: "open" });
  cap.actAt(give + 0.45, { armR: arm(40, 30, 130, 30), armL: arm(10, 12, 30, 0), head: [8, -4, 0] }, 9, { in: 0.3, handR: "open", face: { smile: 0.38, brow: 0.6, gaze: [-0.8, 0.2] } });
  const m = mover(MATE_D, 1.8, mx, mz, V.toward(mx, mz, 44)); m.stand(8);
  m.actAt(-1, { armL: arm(10, 12, 30, 0), armR: arm(20, 12, 60, -6), head: [0, 6, 0] }, 0.5, { in: 0.01, out: 0.2, handL: "relaxed", handR: "fist", face: { brow: 0.6, smile: -0.5, lid: 0.25, gaze: [0.4, 0.5] } });
  m.actAt(0.15, { armR: arm(122, 16, 176, 0), lean: -3, head: [6, -12, 0] }, give - 0.4, { in: 0.3, out: 0.2, antic: 0.4, over: 1.8, handR: "fist", face: { brow: 0.9, smile: -0.5, lid: 0.15, gaze: [0.5, -0.8] } });
  m.actAt(give - 0.3, { armL: arm(50, 14, 100, 0), armR: arm(50, 14, 100, 0), head: [0, 2, 0] }, 0.5, { in: 0.2, out: 0.15, handL: "open", handR: "fist", face: { brow: 0.8, wide: 0.4, lid: 0, gaze: [0.8, 0] } });
  m.actAt(give, { armL: arm(44, 10, 100, -14), armR: arm(44, 10, 100, -14), py: -0.14, lean: 10, head: [0, 12, 0] }, 9, { in: 0.14, over: 2.6, handL: "grip", handR: "fist", face: { wide: 1, lid: 0, brow: 1, smile: 0.9, mouth: 0.6, gaze: [0, 0.7] } });
  add({ id: "paid", a: limbA, b: cut("limb", "maroon"), still: give + 0.42,
    sounds: [{ t: 0.15, k: "whoosh", g: 0.4, p: -0.2 }, { t: 0.5, k: "ting", p: -0.2 }, { t: give - 0.2, k: "whoosh", g: 0.6, p: 0.3 }, { t: give + 0.03, k: "sack", p: -0.2 }, ...[0.62, 0.7, 0.76, 0.84, 0.9, 1.0].map((d, i) => ({ t: give + d, k: "coin", g: 0.7, p: -0.4 + 0.1 * i }))],
    cam: (_t, u) => V.push(0.16 * u), sun: { target: [1.4, 0, 3.7], reach: 6 },
    cast: (t) => [play("cap", CAPTAIN_D, cap, t, [0, 0, 0], 1.86, { seed: 5 }), play("m", MATE_D, m, t, [0, 0, 0], 1.8, { seed: 7, blink: false })],
    things: (g, c, t, _T, cam) => { hooked(g, c.m, cam);
      const from = between(c.cap.joint("wrL"), c.cap.joint("wrR")), to = between(c.m.joint("wrL"), c.m.joint("wrR")), u = smooth((t - give + 0.12) / 0.2), p = near(between(from, to, u), cam, 0.14), s = put(g, SACK(), [p[0], p[1] - 0.2 + 0.3 * Math.sin(Math.PI * u) * (u < 1 ? 1 : 0), p[2]]); s.lookAt(cam.pos[0], s.position.y, cam.pos[2]);
      for (let i = 0; i < 6; i++) tossed(g, i, [to[0], to[1] + 0.3, to[2] + 0.1], [0.3 * Math.sin(i * 1.9), 2.5 + 0.4 * (i % 3), -0.35 - 0.3 * Math.abs(Math.cos(i * 2.3))], t - give - 0.04 - i * 0.03, 0); } });
}
// 6. CHEAT THE CREW: over the captain's shoulder. He holds up the coin he has found in the man's headscarf; the man claps both
//    hands to it, caught, and more coins fall out between his fingers
const maroonMid = at("maroon", /^and$/) - 0.08;
{
  const V = lens(0.7, 1.62, 4.7, 0.42, -1, -7, 58), [cx, cz] = V.spot(1.3, -0.42), [px, pz] = V.spot(2.6, 0.16);
  const cap = mover(CAPTAIN_D, 1.86, cx, cz, V.toward(cx, cz, 176)); cap.stand(8);
  cap.actAt(-1, { armR: arm(118, 8, 176, 0), head: [-10, 0, 0] }, 9, { in: 0.01, handR: "grip" });
  wag(cap, 0.1, 3, P({ armR: arm(122, 8, 180, 0) }), P({ armR: arm(112, 8, 170, 0) }), 0.3, { handR: "grip" });
  const pir = mover(PIRATE_D, 1.76, px, pz, V.toward(px, pz, 4)); pir.stand(8);
  pir.actAt(-1, { armL: arm(74, 34, 170, -22), armR: arm(74, 34, 170, -22), lean: -8, py: -0.1, head: [0, 10, 5] }, 9, { in: 0.01, handL: "open", handR: "open", face: { smile: -1, mouth: 0.45, brow: 1, wide: 1, lid: 0, gaze: [-0.6, -0.4] } });
  wag(pir, 0.1, 3, P({ roll: 2.5, py: -0.11 }), P({ roll: -2.5, py: -0.09 }), 0.14);
  add({ id: "cheat", a: cut("limb", "maroon"), b: maroonMid, still: 0.62,
    sounds: [{ t: 0.05, k: "ting", g: 0.8, p: -0.3 }, ...[0.3, 0.46, 0.62, 0.78, 0.94].map((t) => ({ t, k: "coin", g: 0.8, p: 0.3 }))],
    cam: (_t, u) => V.push(0.08 * u), sun: { target: [1.6, 0, 2.6], reach: 5 },
    cast: (t) => [play("pir", PIRATE_D, pir, t, [0, 0, 0], 1.76, { seed: 8, blink: false }), play("cap", CAPTAIN_D, cap, t, [0, 0, 0], 1.86, { seed: 5 })],
    things: (g, c, t, _T, cam) => { const p = near(c.cap.joint("tipR"), cam, -0.06), k = put(g, COINS[7](), [p[0], p[1] + 0.05, p[2]]); k.scale.setScalar(1.5); k.rotation.set(Math.PI / 2, 0, 0);
      const s = near(c.pir.joint("skull"), cam, 0.1); for (let i = 0; i < 6; i++) { const u = (t + 0.5 - i * 0.16) % 0.96, q = put(g, COINS[i](), [s[0] - 0.2 + 0.08 * i, Math.max(0.03, s[1] + 0.02 - 4.9 * u * u), s[2]]); q.scale.setScalar(1.5); q.rotation.set(Math.PI / 2 + u * 12, i, 0); } } });
}
// 7. AND YOU WERE LEFT ON AN EMPTY ISLAND: the same man on the sand under the one palm, shaking his fist after the ship, which
//    sails away without him
const [ix, iy, iz] = SHIP.island, sand = (x: number, z: number) => iy - 0.3 + 0.95 * Math.sqrt(Math.max(0, 1 - ((x - ix) / 5.2) ** 2 - ((z - iz) / 3.8) ** 2));
const gunA = at("maroon", /^with$/) - 0.12;
{
  const V = aim(SHIP.palm[0], SHIP.palm[2], 6.6, 0.55, 176, iy + 1.5, 6, 46), [px, pz] = V.spot(4.3, -0.12);
  const pir = mover(PIRATE_D, 1.76, px + 0.75, pz + 0.1, -98); pir.walk(mt(pir, 0.75), { run: true }).stand(6);
  pir.actAt(-1, { armL: arm(118, 6, 132, 0), armR: arm(30, 24, 70, 10), lean: 8, head: [0, -8, 0] }, 9, { in: 0.01, handR: "fist", handL: "fist", face: { wide: 0.6, lid: 0, brow: -1, mouth: 0.8, smile: -1, gaze: [-0.6, -0.3] } });
  wag(pir, 0.3, 5, P({ armL: arm(128, 6, 150, 0), py: 0.03 }), P({ armL: arm(108, 6, 112, 0), py: -0.02 }), 0.3, { handL: "fist" });
  add({ id: "island", a: maroonMid, b: gunA, still: 1.3,
    sounds: [0.08, 0.3, 0.52].map((t) => ({ t, k: "step", run: true, surface: "sand", g: 0.8 })), beds: [{ k: "surf", a: 0, b: 2.1, g: 1 }],
    cam: (_t, u) => V.push(-0.2 * u), sun: { target: [ix, iy, iz], reach: 8 },
    cast: (t) => { const a = play("pir", PIRATE_D, pir, t, [0, 0, 0], 1.76, { seed: 8, blink: false }); a.at[1] = sand(a.at[0], a.at[2]) - 0.02; return [a]; },
    things: (g, _c, t) => { const [sx, sz] = V.spot(62 + 2.5 * t, -9.6); put(g, SLOOP(), [sx, SEA - 0.4, sz], 0.5); } });
}
// 8. WITH A GUN AND A BOTTLE OF WATER: from the sand. The pistol and the bottle they left him stand near the lens; behind them he
//    drops to his knees and hangs his head, the ship small on the horizon
{
  const V = lens(ix - 1.5, iy + 1.12, iz + 3.4, -0.04, -1, -4, 56), [px, pz] = V.spot(3.6, 0.05), [gx, gz] = V.spot(2.0, -0.3), [bx, bz] = V.spot(2.1, 0.34);
  const pir = mover(PIRATE_D, 1.76, px, pz, V.toward(px, pz, -8)); pir.stand(8);
  pir.actAt(-1, { armL: arm(20, 16, 50, 6), armR: arm(20, 16, 50, 6), head: [0, -6, 0] }, 0.5, { in: 0.01, out: 0.14, handL: "fist", handR: "fist", face: { brow: -0.6, smile: -1, lid: 0.1, gaze: [0, -0.3] } });
  pir.actAt(0.22, { py: -0.52, lean: 14, armL: arm(26, 14, 44, 4), armR: arm(26, 14, 44, 4), head: [0, 4, 0] }, 9, { in: 0.2, antic: 0.2, over: 1.8, handL: "open", handR: "open", face: { brow: 1, smile: -1, lid: 0.3, gaze: [0, 0.6] } });
  pir.actAt(0.85, { head: [0, 30, 0], lean: 22 }, 9, { in: 0.4, over: 1.2, face: { brow: 1, smile: -1, lid: 0.55, gaze: [0, 1] } });
  wag(pir, 1.2, 3, P({ head: [9, 30, 0] }), P({ head: [-9, 30, 0] }), 0.7);
  add({ id: "gun", a: gunA, b: cut("maroon", "answer"), still: 1.3,
    sounds: [{ t: 0.4, k: "thud", g: 0.7, surface: "sand" }], beds: [{ k: "surf", a: 0, b: 2.4, g: 1 }],
    cam: (_t, u) => V.push(0.12 * u), sun: { target: [ix, iy, iz], reach: 8 },
    cast: (t) => { const a = play("pir", PIRATE_D, pir, t, [0, 0, 0], 1.76, { seed: 8 }); a.at[1] += sand(a.at[0], a.at[2]) - 0.02; return [a]; },
    things: (g, _c, t) => { const b = put(g, BOTTLE(), [bx, sand(bx, bz) - 0.02, bz]); b.scale.setScalar(1.15); b.rotation.z = 0.08; const p = put(g, PISTOL(), [gx - 0.2, sand(gx, gz) + 0.16, gz]); p.rotation.z = 0.2; p.scale.setScalar(0.9);
      const [sx, sz] = V.spot(80 + 2.5 * t, -9); put(g, SLOOP(), [sx, SEA - 0.4, sz], 0.5); } });
}
// 9. BUT THE PLANK? ALMOST NEVER RECORDED: from the plank, looking back at the ship. The captain shakes his head and wags a finger,
//    then comes for the lens with both hands
const answerMid = at("answer", /^Unwanted/) - 0.2;
{
  const V = lens(5.2, PL.y + 0.3, PL.z, -1, 0, 15, 60), go = at("answer", /^recorded/) + 0.25 - cut("maroon", "answer");
  const cap = mover(CAPTAIN_D, 1.86, 2.75, PL.z, 90); cap.stand(go).walk(mt(cap, 0.9)).stand(4);
  cap.actAt(-1, { armL: arm(30, 40, 100, 50), armR: arm(30, 40, 100, 50), head: [0, 10, 0], lean: 2 }, 1.1, { in: 0.01, out: 0.2, handL: "open", handR: "open", face: { brow: 1, lid: 0.1, smile: -0.4, gaze: [0, 0.8] } });
  cap.actAt(0.85, { armR: arm(60, 16, 150, 4), armL: arm(-10, 20, 30, 30), head: [0, 6, 0] }, go - 0.75, { in: 0.2, out: 0.15, handR: "point", handL: "fist", face: { brow: -0.6, lid: 0.25, smile: -0.5, gaze: [0, 0.6] } });
  wag(cap, 1.0, go - 1.0, P({ head: [24, 6, 0], armR: arm(60, 30, 150, 24) }), P({ head: [-24, 6, 0], armR: arm(60, 2, 150, -18) }), 0.44, { handR: "point" });
  cap.actAt(go, { armL: arm(70, 24, 60, 10), armR: arm(70, 24, 60, 10), lean: 20, head: [0, 14, 0] }, 9, { in: 0.25, antic: 0.5, over: 1.5, handL: "open", handR: "open", face: { brow: -1, lid: 0, smile: 0.7, mouth: 0.4, gaze: [0, 0.8] } });
  add({ id: "never", a: cut("maroon", "answer"), b: answerMid, still: 1.5,
    sounds: [{ t: go + 0.15, k: "step", surface: "wood" }, { t: go + 0.5, k: "step", surface: "wood", g: 1.2 }, { t: go + 0.3, k: "whoosh", g: 0.7 }],
    cam: (t) => V.push(-0.2 * smooth((t - go) / 0.6), 0, 6 * smooth((t - go) / 0.6)), sun: { target: [2, 0, 0.6], reach: 6 },
    cast: (t) => [play("cap", CAPTAIN_D, cap, t, [0, 0.02, 0], 1.86, { seed: 5 })] });
}
// 10. UNWANTED MEN SIMPLY WENT OVER THE SIDE: from over the water, aft of the plank (which is behind the lens). The captain carries
//     him to the rail over his head and heaves; the lens follows him as he turns over in the air and goes in with a splash
const SPLASH: V3 = [4.9, SEA, 3.5];
const heave = at("answer", /^simply/) + 0.05 - answerMid, fly = 1.2, hit = answerMid + heave + fly;
{
  const POS: V3 = [5.5, 1.75, 1.15], RAIL = 2.3;
  const cap = mover(CAPTAIN_D, 1.86, RAIL - 0.95, SPLASH[2], 90); cap.walk(mt(cap, 0.95)).stand(6);
  cap.actAt(-1, { armL: arm(166, 16, 184, 4), armR: arm(166, 16, 184, 4), lean: -4 }, heave + 0.02, { in: 0.01, out: 0.1, handL: "open", handR: "open", face: { brow: -1, lid: 0.2, smile: 0.36 } });
  cap.actAt(heave - 0.3, { armL: arm(190, 16, 200, 4), armR: arm(190, 16, 200, 4), lean: -16, py: -0.08 }, 0.3, { in: 0.2, out: 0.06, antic: 0, over: 1, handL: "open", handR: "open" });
  cap.actAt(heave, { armL: arm(104, 16, 100, 4), armR: arm(104, 16, 100, 4), lean: 22, pz: 0.1 }, 0.6, { in: 0.1, out: 0.3, antic: 0, over: 1.8, handL: "open", handR: "open" });
  cap.actAt(heave + 0.7, { armL: arm(40, 14, 110, -30), armR: arm(40, 14, 110, -30), head: [0, 12, 0] }, 9, { in: 0.25, handL: "open", handR: "open", face: { smile: 0.38, brow: 0.5, lid: 0.2, gaze: [0, 0.6] } });
  const sir = mover(SIR_D, 1.8, 0, 0, 90); sir.stand(9);
  sir.actAt(-1, { armL: arm(70, 60, 110, 70), armR: arm(140, 50, 170, 40), legL: { th: [40, 14], sh: [-30, 0], pitch: 20 }, legR: { th: [-24, 10], sh: [-70, 0], pitch: 30 }, head: [0, -10, 0] }, 9, { in: 0.01, handL: "open", handR: "open", face: { wide: 1, lid: 0, brow: 1, mouth: 1 } });
  wag(sir, 0, 5, P({ legL: { th: [-20, 14], sh: [-60, 0], pitch: 20 }, legR: { th: [44, 10], sh: [-26, 0], pitch: 30 }, armL: arm(140, 50, 170, 40), armR: arm(70, 60, 110, 70) }), P({ legL: { th: [40, 14], sh: [-30, 0], pitch: 20 }, legR: { th: [-24, 10], sh: [-70, 0], pitch: 30 } }), 0.4, { handL: "open", handR: "open" });
  /** where the middle of him is, and how far he has turned */
  const x0 = RAIL + 0.1, y0 = 2.75, flight = (t: number, cx: number): [V3, number] => { if (t < heave) return [[cx + 0.1, y0 + 0.02 * Math.sin(t * 14), SPLASH[2]], 90 + 5 * Math.sin(t * 9)]; const u = t - heave, vx = (SPLASH[0] - x0) / fly, vy = (SEA - 0.3 - y0 + 4.9 * fly * fly) / fly; return [[x0 + vx * u, y0 + vy * u - 4.9 * u * u, SPLASH[2]], 90 + 400 * u]; };
  const capX = (t: number) => RAIL - 0.95 + 0.95 * smooth(t / (heave - 0.25));
  add({ id: "over", a: answerMid, b: cut("answer", "origin"), still: heave + 0.14,
    sounds: [{ t: 0.12, k: "step", surface: "wood", p: 0.4 }, { t: 0.5, k: "step", surface: "wood", p: 0.3 }, { t: heave - 0.05, k: "whoosh", g: 0.9, p: 0.2 }, { t: heave + 0.05, k: "fall", dur: fly - 0.1, p: 0 }, { t: heave + fly, k: "splash", g: 1.4, big: 1.4, p: -0.2 }],
    // the lens holds the two of them at the rail, then follows him down to the water
    cam: (t) => { const [p] = flight(Math.min(t, heave + fly), capX(t)), k = smooth((t - heave - 0.3) / 0.5), look: V3 = [p[0] * k + (capX(t) + 0.15) * (1 - k), Math.max(SEA + 0.9, p[1] - 0.2) * k + 2.0 * (1 - k), SPLASH[2]]; return { pos: POS, look, fov: 52 }; },
    sun: { target: [3.5, 0, 3.4], reach: 7 },
    cast: (t, T) => { const c = play("cap", CAPTAIN_D, cap, t, [0, 0, 0], 1.86, { seed: 5 }), [p, spin] = flight(t, c.at[0]);
      return t > heave + fly + 0.05 ? [c] : [c, { ...play("sir", SIR_D, sir, t, [0, 0, 0], 1.8, { talk: talk(W, T, ["answer"]), blink: false }), at: p, spin }]; },
    things: (g, _c, t) => { splash(g, SPLASH, t - heave - fly, 1.3); } });
}
// 11. THE PLANK COMES FROM STORIES: at the water. He comes up spouting, the book he had in his pocket held high and dry
const originMid = at("origin", /^like$/) - 0.1;
{
  const [wx, , wz] = SPLASH, V = lens(wx + 0.2, SEA + 1.15, wz + 2.6, -0.08, -1, -14, 46), t0 = cut("answer", "origin");
  const sir = mover(SIR_D, 1.8, wx, wz, V.toward(wx, wz, -8)); sir.stand(9);
  sir.actAt(-1, { armL: arm(40, 60, 80, 70), armR: arm(160, 20, 184, 0), head: [0, -8, 0] }, 9, { in: 0.01, handL: "open", handR: "grip", face: { wide: 0.6, lid: 0, brow: 1, mouth: 0.5, gaze: [0.3, -0.4] } });
  wag(sir, 0, 4, P({ armL: arm(40, 76, 70, 96) }), P({ armL: arm(40, 50, 96, 50) }), 0.5, { handL: "open" });
  const bob = (t: number) => SEA - 1.48 + 0.34 * smooth(t / 0.3) + 0.05 * Math.sin(t * 5);
  add({ id: "stories2", a: t0, b: originMid, still: 1.0,
    sounds: [{ t: 0.05, k: "bubble" }, { t: 0.28, k: "spray", p: -0.2 }, { t: 0.9, k: "drip" }, { t: 1.3, k: "drip" }], beds: [{ k: "lap", a: 0, b: 1.8, g: 1 }],
    cam: (_t, u) => V.push(0.1 * u), sun: { target: [wx, SEA, wz], reach: 6 },
    cast: (t, T) => [play("sir", SIR_D, sir, t, [0, bob(t), 0], 1.8, { talk: Math.max(talk(W, T, ["origin"]), t < 0.5 ? 0.8 : 0), blink: false })],
    things: (g, c, t, _T, cam) => { const a = c.sir, p = near(a.joint("tipR"), cam, 0.05), k = put(g, BOOK_T(), [p[0], p[1] + 0.2, p[2]]); k.lookAt(cam.pos[0], p[1] + 0.2, cam.pos[2]);
      const f = put(g, FOAM2(), [wx, SEA + 0.03, wz]); f.scale.setScalar(1.25 + 0.1 * Math.sin(t * 5));
      // what he spits out, in an arc
      if (t < 0.9) { const m = near(a.joint("skull"), cam, 0.2); for (let i = 0; i < 8; i++) { const u = i / 8; g.add(mesh(ball(0.03, 6), "#bfe3fb", { at: [m[0] - 0.12 - 0.5 * u, m[1] - 0.2 + 0.5 * u - 0.9 * u * u, m[2]], line: 0, shadow: false })); } } } });
}
// 12. LIKE TREASURE ISLAND AND PETER PAN: back on deck, dripping. He holds up one book, then thrusts the other at the captain, who
//     bends over its cover, points at the pirate on it and then at himself
{
  const V = lens(2.25, 1.25, 4.6, -0.05, -1, 3, 54), [qx, qz] = V.spot(3.3, -0.3), [cx, cz] = V.spot(3.7, 0.52), tI = at("origin", /Treasure/) - originMid, tP = at("origin", /Peter/) - originMid;
  const sir = mover(SIR_D, 1.8, qx, qz, V.toward(qx, qz, 6)); sir.stand(9);
  sir.actAt(-1, { armR: arm(30, 20, 70, 0), armL: arm(30, 14, 76, 0), head: [0, 2, 0] }, tI + 0.3, { in: 0.01, out: 0.2, handL: "grip", handR: "grip", face: { smile: 0.6, brow: 0.6, gaze: [0, 0] } });
  sir.actAt(tI - 0.1, { armR: arm(124, 22, 174, 8), head: [-10, -4, 0] }, 9, { in: 0.24, antic: 0.4, over: 2, handR: "grip", face: { smile: 1, brow: 1, lid: 0.1, gaze: [-0.6, -0.3] } });
  sir.actAt(tP - 0.14, { armL: arm(34, 22, 80, 16), head: [14, 0, 0], twist: -8 }, 9, { in: 0.2, antic: 0.5, over: 2.2, handL: "grip", face: { smile: 1, brow: 1, lid: 0.1, gaze: [0.8, 0.1] } });
  const cap = mover(CAPTAIN_D, 1.86, cx, cz, V.toward(cx, cz, -22)); cap.stand(9);
  cap.actAt(-1, { armL: arm(128, 30, 206, -24), armR: arm(10, 12, 30, 0), head: [-14, 0, 6] }, tP + 0.2, { in: 0.01, out: 0.2, handL: "relaxed", face: { brow: 0.8, lid: 0.1, smile: -0.3, gaze: [-0.8, 0] } });
  cap.actAt(tP + 0.05, { lean: 18, armR: arm(46, 4, 70, -24), armL: arm(10, 12, 30, 0), head: [-18, 16, 0] }, 9, { in: 0.26, antic: 0.3, over: 1.6, handR: "point", face: { brow: 1, wide: 0.9, lid: 0, mouth: 0.4, gaze: [-0.7, 0.7] } });
  cap.actAt(tP + 0.75, { lean: 4, armL: arm(40, 10, 150, -44), head: [-6, -2, 0] }, 9, { in: 0.22, antic: 0.3, over: 1.8, handL: "point", face: { brow: 1, wide: 1, lid: 0, mouth: 0.7, smile: 0.5, gaze: [-0.4, 0] } });
  add({ id: "books", a: originMid, b: END, still: tP + 1.05,
    sounds: [{ t: tI + 0.12, k: "book", p: -0.3 }, { t: tP + 0.06, k: "book", p: 0.3 }, ...[0.2, 0.55, 0.95, 1.3, 1.7, 2.1, 2.5].map((t) => ({ t, k: "drip", g: 0.7, p: -0.2 }))],
    cam: (_t, u) => V.push(0.14 * u), sun: { target: [1.5, 0, 1.4], reach: 6 },
    cast: (t, T) => [play("cap", CAPTAIN_D, cap, t, [0, 0, 0], 1.86, { seed: 5, blink: false }), play("sir", SIR_D, sir, t, [0, 0, 0], 1.8, { talk: talk(W, T, ["origin"]) })],
    things: (g, c, t, _T, cam) => {
      const hold = (b: THREE.Object3D, p: V3, up: number, d: number) => { const q = near(p, cam, d); put(g, b, [q[0], q[1] + up, q[2]]); b.lookAt(cam.pos[0], q[1] + up, cam.pos[2]); };
      hold(BOOK_T(), c.sir.joint("tipR"), 0.14, 0.08); hold(BOOK_P(), c.sir.joint("tipL"), -0.02, 0.1);
      drips(g, c.sir, t, cam); g.add(mesh(ball(1, 14), "#9fd4f6", { at: [c.sir.at[0], 0.012, c.sir.at[2]], scale: [0.5, 0.01, 0.34], line: 0.5, shadow: false })); } });
}

export const PIRATE_PLANK: Film = {
  id: "pirate-plank", fps: 30, seconds: END, sky: "#9fd6ff", world: pirateShip, shots, words: W,
  hook: { text: ["DID PIRATES", "MAKE YOU WALK", "THE PLANK?"], a: 0, b: L.hook.b + 0.2, size: 96 },
  sign: { text: "Dramatised. The rules are from pirate articles printed in 1724.", a: limbA + 0.5, b: limbA + 2.5 },
  hits: [{ t: hit, amp: 1, dur: 0.4 }], beds: [{ k: "sea", a: 0, b: END, g: 1 }, { k: "wind", a: 0, b: END, g: 0.35 }], music: "shanty", audio: "craft/pirate-plank.wav",
};
