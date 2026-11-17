// Short: "Did pirates really make you walk the plank?" One pirate sloop at sea (world/ship.ts), played on the stage (stage/Stage.tsx).
// The shots are cut to the narration's lines (voice/pirate-plank). Sources and what must not be claimed: granskning/pirate-plank/manus.md.
// The picture of the plank at the start is the story everybody knows; the rest shows what the sources say pirates did instead.
import * as THREE from "three";
import { Film, Shot, Cam, V3, Staged, Word, play, talk, smooth, mix3 } from "../stage/film";
import { mover, mt, wag, arm } from "../stage/acting";
import { lens, aim, once, noShade, put, between, near } from "../stage/staging";
import { pirateShip, SHIP, SEA, farSloop, plankBoard } from "../world/ship";
import { mesh, box, ball, rod, arc } from "../world/kit";
import { coin, cutlass, storyBook, articlesSheet, moneySack, sharkFin, sharkBody, foamRing, hookHand, bottle, pistol } from "../world/props";
import { SIR_D, CAPTAIN_D, PIRATE_D, MATE_D } from "../looks";
import type { Pose } from "../rig";
import words from "../../../voice/pirate-plank/words.json";
import lines from "../../../voice/pirate-plank/lines.json";

const W = words as Word[], L = Object.fromEntries((lines as { id: string; a: number; b: number }[]).map((l) => [l.id, l]));
const cut = (a: string, b: string) => (L[a].b + L[b].a) / 2;       // a cut falls in the pause between two lines
const END = L.origin.b + 1.0;
/** when a word of a line is spoken (film seconds) */
const at = (line: string, re: RegExp) => W.find((w) => w.line === line && re.test(w.w))!.a;
const P = (o: Partial<Pose>) => o;
const rad = (d: number) => (d * Math.PI) / 180;
const PL = SHIP.plank;

// ---------------- the things of the ship (made once, moved by the shots) ----------------
const CUTLASS = once(() => noShade(cutlass())), FIN = once(() => sharkFin(0.66)), FOAM = once(() => foamRing(0.42)), FOAM2 = once(() => foamRing(0.5));
const COINS = [0, 1, 2, 3, 4, 5, 6, 7].map(() => once(() => noShade(coin(0.045))));
const BOOK_T = once(() => storyBook(["TREASURE", "ISLAND"], "island", 0.46, 0.56, "#2f6f8f")), BOOK_P = once(() => storyBook(["PETER", "PAN"], "plank", 0.42, 0.52)), SHEET = once(() => articlesSheet(0.46, 0.607)), SACK = once(() => noShade(moneySack(0.24, "800")));
const SHARK = once(() => sharkBody(2.3, 1)), SHARK_SHUT = once(() => sharkBody(2.3, 0.12));
const BOARD = once(() => plankBoard());
/** the moments of wag(m, t0, dur, a, b, period): one for each swing, `lead` seconds from its start, kept inside a shot `len` long */
const swings = (t0: number, dur: number, period: number, len: number, lead = 0): number[] => { const o: number[] = []; for (let t = t0; t < t0 + dur - 1e-6; t += period) if (t + lead >= 0 && t + lead < len - 0.05) o.push(t + lead); return o; };
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
/** water thrown up where something heavy has gone in: a crown of drops, a column, rings that widen (not round somebody who is in the
 *  water: there a ring reads as a lifebuoy). u = seconds since it hit */
const splash = (g: THREE.Group, p: V3, u: number, big = 1, rings = true) => {
  if (u < 0) return;
  for (let k = 0; k < 16; k++) { const a = (k / 16) * 6.283 + 0.3, v = (1.4 + 0.9 * ((k * 7) % 4) / 3) * big, x = Math.cos(a) * v * u * 0.8, z = Math.sin(a) * v * u * 0.8, y = (4.2 + 1.3 * (k % 3)) * big * u - 6.5 * u * u;
    if (y > 0) g.add(mesh(ball(0.07 * big * Math.max(0.4, 1 - u * 0.5), 8), k % 2 ? "#ffffff" : "#bfe3fb", { at: [p[0] + x, p[1] + y, p[2] + z], line: 0.5, shadow: false })); }
  // the water that stands up where it went in: a low crown of tongues leaning outward, gone in half a second
  const col = Math.sin(Math.PI * Math.min(1, u / 0.55)); if (u < 0.55) for (let k = 0; k < 7; k++) { const a = (k / 7) * 6.283 + 0.5, r = 0.2 * big * (0.6 + u * 2);
    g.add(mesh(ball(1, 16), k % 2 ? "#ffffff" : "#d6ecfb", { at: [p[0] + Math.cos(a) * r, p[1] + 0.16 * big * col, p[2] + Math.sin(a) * r], scale: [0.13 * big, (0.14 + 0.2 * col) * big, 0.13 * big], rot: [Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5], line: 0.35, shadow: false }));
      g.add(mesh(ball(0.085 * big, 12), k % 2 ? "#d6ecfb" : "#ffffff", { at: [p[0] + Math.cos(a) * r * 1.25, p[1] + (0.3 + 0.24 * col) * big * col, p[2] + Math.sin(a) * r * 1.25], line: 0.35, shadow: false })); }
  if (rings) for (const [o, f] of [[0, FOAM], [0.25, FOAM2]] as [number, () => THREE.Object3D][]) { const v = u - o; if (v > 0) { const r = put(g, f(), [p[0], p[1] + 0.02, p[2]]); r.scale.setScalar(0.6 + v * 2.6 * big); } }
};
/** drops falling from somebody who is soaked */
const drips = (g: THREE.Group, a: Staged, t: number, cam: Cam, n = 7) => {
  for (let k = 0; k < n; k++) { const j = (["elL", "elR", "crown", "pelvis", "neck", "wrL", "wrR"] as const)[k % 7], p = near(a.joint(j), cam, 0.06), u = (t * 1.6 + k * 0.37) % 1, y = p[1] - 0.05 - 1.3 * u * u;
    if (y > a.at[1] + 0.03) g.add(mesh(ball(0.022, 6), "#9fd4f6", { at: [p[0] + 0.03 * Math.sin(k * 5), y, p[2]], scale: [1, 1.7, 1], line: 0, shadow: false })); }
};
/** where somebody or something stands in the sea at (x, z): a row of small swells toward the lens that hides the straight cut of
 *  the water across a figure, and broken foam round it (never a ring) */
const waterline = (g: THREE.Group, x: number, z: number, cam: Cam, t: number, w = 0.9) => {
  const dx = cam.pos[0] - x, dz = cam.pos[2] - z, n = Math.hypot(dx, dz) || 1, ux = dx / n, uz = dz / n, rx = -uz, rz = ux;
  for (let i = 0; i < 13; i++) { const o = (i / 12 - 0.5) * w * 1.25, r = 0.055 + 0.025 * ((i * 7) % 3), d = 0.05 + 0.025 * (i % 3);
    g.add(mesh(ball(1, 10), i % 2 ? "#ffffff" : "#cfe9fb", { at: [x + rx * o + ux * d, SEA + 0.01 + 0.02 * Math.sin(t * 4 + i * 1.7), z + rz * o + uz * d], scale: [r * 1.5, r * 0.5, r * 0.8], rot: [0, Math.atan2(rx, rz) + Math.PI / 2, 0], line: 0.35, shadow: false })); }
  for (let i = 0; i < 16; i++) { const a = i * 2.4 + 0.3, rr = w * (0.62 + 0.36 * ((i * 5) % 4) / 3) + 0.04 * Math.sin(t * 3 + i);
    if (Math.cos(a) * rr * ux + Math.sin(a) * rr * 0.8 * uz > 0.45 * w) continue;   // none close under the lens, where they would look like floes
    g.add(mesh(ball(1, 8), i % 3 ? "#ffffff" : "#d6ecfb", { at: [x + Math.cos(a) * rr, SEA + 0.008, z + Math.sin(a) * rr * 0.8], scale: [0.06 + 0.03 * (i % 3), 0.01, 0.03 + 0.02 * (i % 2)], rot: [0, a * 1.7, 0], line: 0, shadow: false })); }
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
  wag(sir, 0.8, 0.9, P({ roll: 8, armL: arm(8, 58, 20, 66), armR: arm(8, 104, 24, 122) }), P({ roll: -8, armL: arm(8, 104, 24, 122), armR: arm(8, 58, 20, 66) }), 0.7, { handL: "open", handR: "open" });
  // and again when it comes back
  sir.actAt(1.72, { legR: { th: [74, 10], sh: [-44, 0], pitch: 30 }, lean: -18, pz: -0.07, armL: arm(50, 76, 120, 70), armR: arm(64, 70, 136, 60) }, 0.9, { in: 0.12, out: 0.25, antic: 0.2, over: 1.6, handL: "open", handR: "open" });
  const cap = mover(CAPTAIN_D, 1.86, 3.22, PL.z, 90); cap.stand(6);
  cap.actAt(-1, { armR: arm(76, 4, 84, 0), armL: arm(14, 8, 44, 4), lean: 8 }, 9, { in: 0.01, handR: "grip", handL: "fist", face: { brow: -1, smile: 0.3, lid: 0.15 } });
  for (const t0 of [0.9, 1.7]) cap.actAt(t0, { armR: arm(86, 4, 90, 0), pz: 0.08, lean: 15 }, 0.34, { in: 0.09, out: 0.2, antic: 0.4, over: 1.6, handR: "grip" });
  add({ id: "hook", a: 0, b: cut("hook", "story"), still: 0.14,
    sounds: [{ t: 0, k: "splash", g: 1.1, p: -0.5 }, { t: 0.19, k: "snap", p: -0.4 }, { t: 0.56, k: "splash", g: 0.9, p: -0.5 }, { t: 0.05, k: "creak", g: 0.7 }, { t: 0.9, k: "whoosh", g: 0.5, p: 0.5 }, { t: 1.3, k: "creak", g: 0.6 }, { t: 1.7, k: "whoosh", g: 0.5, p: 0.5 }, { t: 1.62, k: "splash", g: 1.0, p: -0.4 }, { t: 2.14, k: "snap", p: -0.4 }, { t: 2.5, k: "splash", g: 0.8, p: -0.4 }],
    cam: (_t, u) => V.push(0.2 * u), sun: { target: [4.6, 0, 0.6], reach: 7 },
    cast: (t, T) => [play("cap", CAPTAIN_D, cap, t, [0, PL.y, 0], 1.86, { seed: 5 }), play("sir", SIR_D, sir, t, [0, PL.y, 0], 1.8, { talk: talk(W, T, ["hook"]), blink: false })],
    things: (g, c, t, _T, cam) => { sword(g, c.cap, cam, 4); lunge(g, kx, kz, -150, (t + 0.36) / 1.05, 2.05, 1.05); if (t > 1.0 && t < 1.5) circling(g, kx + 0.2, kz + 0.9, 0.8, t, 1.7, 2.2); lunge(g, kx + 0.25, kz + 0.2, -150, (t - 1.62) / 1.0, 1.95, 1.0); } });
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
// 4. NOT QUITE. REAL PIRATES HAD WRITTEN RULES: at the mast. The captain wags a rolled paper at him, claps it to the mast, where it
//    unrolls, and drives a nail through its head with two blows of his fist: the articles. Sir Digsworth steps up, reads down them
//    through his monocle and starts back at the sum at their foot
{
  const a0 = cut("story", "rules"), [mx, , mz] = SHIP.mast, V = lens(1.175, 1.3, 1.541, -0.35, -0.937, 2, 54), RX = 0.937, RZ = -0.35;      // (RX, RZ) = a metre to the right in the picture
  const UPT = at("rules", /^Real/) - a0 - 0.3, KNOCK = [UPT + 0.5, UPT + 0.84], READ = at("rules", /^written/) - a0 - 0.1, START = READ + 0.72, TOP = 2.5, SH = 0.607;      // the sheet is nailed up above their heads, SH high
  const cap = mover(CAPTAIN_D, 1.86, mx - RX * 0.56, mz - RZ * 0.56, 110.5); cap.stand(8);
  // "not quite": the roll wagged at him
  cap.actAt(-1, { armL: arm(138, 16, 168, 10), armR: arm(10, 10, 34, 0), head: [0, -8, 0] }, UPT - 0.1 + 1, { in: 0.01, out: 0.1, handL: "grip", handR: "fist", face: { brow: -0.5, smile: 0.36, lid: 0.15, gaze: [0.6, 0] } });
  wag(cap, 0.05, UPT - 0.2, P({ armL: arm(146, 16, 180, 10), head: [12, -8, 0] }), P({ armL: arm(130, 16, 154, 10), head: [-12, -8, 0] }), 0.3, { handL: "grip" });
  // the roll clapped to the mast
  cap.actAt(UPT - 0.12, { armL: arm(150, 6, 172, 0), lean: 4, head: [0, -22, 0] }, KNOCK[0] - UPT + 0.3, { in: 0.14, out: 0.2, antic: 0.5, over: 1.8, handL: "open", face: { brow: -0.6, lid: 0.1, smile: 0.2, gaze: [0.6, -0.5] } });
  // two blows of the fist on the nail
  for (const t0 of KNOCK) { cap.actAt(t0 - 0.2, { armR: arm(168, 6, 214, 0), lean: -6, head: [0, -22, 0] }, 0.2, { in: 0.14, out: 0.04, antic: 0, over: 1, handR: "fist" });
    cap.actAt(t0, { armR: arm(152, 6, 170, 0), lean: 6, head: [0, -20, 0] }, 0.2, { in: 0.06, out: 0.12, antic: 0, over: 1.9, handR: "fist", face: { brow: -1, lid: 0.1, smile: -0.3, mouth: 0.3 } }); }
  // he steps back and shows it with his whole arm
  cap.actAt(READ, { armR: arm(136, 6, 150, 0), armL: arm(20, 30, -20, 50), head: [0, -4, 0] }, 9, { in: 0.2, antic: 0.3, over: 1.6, handR: "point", handL: "fist", face: { brow: 0.6, smile: 0.38, lid: 0.1, gaze: [0.7, 0] } });
  wag(cap, READ + 0.3, 3, P({ armR: arm(140, 6, 158, 0) }), P({ armR: arm(130, 6, 140, 0) }), 0.36, { handR: "point" });
  const sir = mover(SIR_D, 1.8, mx + RX * 0.6, mz + RZ * 0.6, -69.5); sir.stand(UPT + 0.25).walk(mt(sir, 0.12), { step: 0.12 }).stand(5);
  // his arms come down from his cheer, and he looks up at the roll
  sir.actAt(-1, { armL: arm(150, 24, 190, 10), armR: arm(150, 24, 190, 10), lean: -4, head: [0, -6, 0] }, 0.42 + 1, { in: 0.01, out: 0.3, handL: "fist", handR: "fist", face: { smile: 0.8, brow: 0.8 } });
  sir.actAt(0.2, { armL: arm(8, 12, 20, 0), armR: arm(30, 10, 80, 0), head: [0, -10, 8], lean: -3 }, UPT + 0.1, { in: 0.36, out: 0.2, antic: 0, over: 1.4, handR: "open", face: { brow: 0.9, wide: 0.4, smile: -0.3, gaze: [-0.7, -0.6] } });
  // he bends to it and reads down it, the monocle held to his eye
  sir.actAt(UPT + 0.45, { lean: 3, armR: arm(84, 22, 152, -14), head: [0, -24, 0] }, START - UPT - 0.4, { in: 0.25, out: 0.1, antic: 0.3, over: 1.5, handR: "grip", face: { brow: 1, wide: 0.5, lid: 0, gaze: [-0.8, 0.2] } });
  sir.actAt(READ, { head: [0, -8, 0], lean: 6 }, START - READ, { in: 0.5, out: 0.08, antic: 0, over: 1, face: { brow: 1, wide: 0.6, lid: 0, gaze: [-0.8, -0.4] } });
  // and starts back at what he finds there
  sir.actAt(START, { lean: -9, pz: -0.05, armL: arm(60, 30, 130, 30), armR: arm(120, 8, 140, 0), head: [0, -14, 0] }, 9, { in: 0.14, antic: 0.2, over: 2.2, handL: "open", handR: "point", face: { brow: 1, wide: 1, lid: 0, mouth: 0.7, gaze: [-0.8, 0.3] } });
  add({ id: "rules", a: a0, b: cut("rules", "limb"), still: READ + 0.3,
    sounds: [{ t: 0.1, k: "whoosh", g: 0.3 }, { t: 0.4, k: "whoosh", g: 0.3 }, { t: UPT, k: "thunk", g: 0.8, p: -0.1 }, { t: UPT + 0.06, k: "paper", p: -0.1 }, ...KNOCK.map((t) => ({ t: t + 0.05, k: "thunk", g: 1.1, p: -0.1 })),
      { t: UPT + 0.4, k: "step", surface: "wood", g: 0.7, p: 0.3 }, { t: START, k: "scuff", g: 0.9, p: 0.3 }],
    cam: (_t, u) => V.push(0.14 * u), sun: { target: [mx, 0, mz + 1], reach: 5 },
    cast: (t) => [{ ...play("sir", SIR_D, sir, t, [0, 0, 0], 1.8, { blink: false }), noShade: true }, { ...play("cap", CAPTAIN_D, cap, t, [0, 0, 0], 1.86, { seed: 5 }), noShade: true }],
    things: (g, c, t, _T, cam) => {
      if (t < UPT) { const p = near(c.cap.joint("tipL"), cam, 0.06); g.add(rod([p[0] - 0.02, p[1] - 0.14, p[2]], [p[0] + 0.03, p[1] + 0.24, p[2]], 0.04, "#f3e6c4", { line: 0.7, shadow: false })); return; }
      // the sheet hangs on the front of the mast by its nail and unrolls downward; each blow of the fist shakes it
      const u = (t - UPT) / 0.4, s = u < 1 ? 0.1 + 0.9 * u * u : 1 + 0.06 * Math.sin((t - UPT - 0.4) * 16) * Math.exp(-(t - UPT - 0.4) * 6), jolt = KNOCK.reduce((n, t0) => n + (t > t0 ? Math.exp(-(t - t0) * 10) : 0), 0);
      const p = near([mx, TOP, mz], cam, 0.245), k = put(g, SHEET(), [p[0], TOP - (SH / 2) * s, p[2]]); k.lookAt(cam.pos[0], TOP - (SH / 2) * s, cam.pos[2]); k.scale.set(1, s, 1); k.rotation.z += 0.03 + 0.07 * jolt;
      if (t > KNOCK[0]) { const q = near([mx, TOP - 0.03, mz], cam, 0.262); g.add(mesh(ball(0.018, 8), "#3a3f48", { at: q, line: 0, shadow: false })); } } });
}
/** the hook on the end of his right arm: it covers the fist of the drawing, points on along the forearm and curls in the plane of the picture */
function hooked(g: THREE.Group, a: Staged, cam: Cam) {
  const e = new THREE.Vector3(...a.joint("elR")), w = new THREE.Vector3(...a.joint("wrR")), x = w.clone().sub(e).normalize(), p = near([w.x - x.x * 0.03, w.y - x.y * 0.03, w.z - x.z * 0.03], cam, 0.07);
  const z = new THREE.Vector3(cam.pos[0] - w.x, cam.pos[1] - w.y, cam.pos[2] - w.z); z.addScaledVector(x, -z.dot(x)).normalize(); const y = z.clone().cross(x), k = HOOK();
  k.position.set(...p); k.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z)); g.add(k);
}
// 5. LOSE A LIMB IN BATTLE: close on one of the crew. He brings up the iron hook where his hand was, turns it before his eyes,
//    snaps at the air with it, and looks round as something heavy is lifted behind him
const limbA = cut("rules", "limb"), paidA = at("limb", /^and$/) - 0.1;
{
  const V = lens(-1.75, 1.42, 4.0, 1, -0.1, 0, 54), [mx, mz] = V.spot(1.95, 0.25), len = paidA - limbA;
  const m = mover(MATE_D, 1.8, mx, mz, V.toward(mx, mz, 30)); m.stand(8);
  m.actAt(-1, { armL: arm(10, 12, 30, 0), armR: arm(24, 40, 44, 40), head: [0, 14, 0] }, 0.3 + 1, { in: 0.01, out: 0.15, handL: "relaxed", handR: "fist", face: { brow: 0.8, smile: -0.6, lid: 0.25, gaze: [0.3, 0.9] } });
  m.actAt(0.06, { armR: arm(70, 60, 150, 50) }, 0.32, { in: 0.16, out: 0.16, antic: 0, over: 1, handR: "fist" });      // out sideways first, so it never crosses his face
  m.actAt(0.2, { armR: arm(150, 34, 182, 30), lean: -3, head: [-26, -8, 0] }, 9, { in: 0.26, antic: 0, over: 1.5, handR: "fist", face: { brow: 0.9, smile: -0.5, lid: 0.15, gaze: [0.5, -0.8] } });
  wag(m, 0.5, len - 1.0, P({ armR: arm(156, 36, 190, 32), head: [-30, -12, 0] }), P({ armR: arm(142, 32, 170, 28), head: [-20, -4, 0] }), 0.3, { handR: "fist" });
  // and he looks round at what is coming
  m.actAt(len - 0.42, { head: [34, 0, 0], armR: arm(146, 34, 178, 30), armL: arm(20, 10, 60, 0) }, 9, { in: 0.2, antic: 0.3, over: 1.5, handR: "fist", face: { brow: 1, wide: 0.6, lid: 0, smile: 0.1, gaze: [0.9, 0] } });
  add({ id: "limb", a: limbA, b: paidA, still: 0.6,
    sounds: [{ t: 0.14, k: "whoosh", g: 0.4, p: -0.2 }, { t: 0.42, k: "ting", g: 0.7, p: -0.2 }, ...swings(0.5, len - 1.0, 0.3, len).map((t) => ({ t, k: "whoosh", dur: 0.2, g: 0.3, p: -0.2 })), { t: len - 0.4, k: "creak", g: 0.6, p: 0.4 }],
    cam: (_t, u) => V.push(0.1 * u), sun: { target: [1.4, 0, 3.7], reach: 6 },
    cast: (t) => [play("m", MATE_D, m, t, [0, 0, 0], 1.8, { seed: 7 })],
    things: (g, c, _t, _T, cam) => { hooked(g, c.m, cam); } });
}
// 5b. AND THE CREW PAID YOU EIGHT HUNDRED PIECES OF EIGHT: wider. The captain, bent double, lifts a heavy sack off the deck, swings
//     it up and into the man's arms; the man's knees give under it, coins jump out, he staggers a step, then has it hanging by its neck from
//     his hook and beams, and the captain opens a hand to him and nods
{
  const V = lens(-1.75, 1.05, 4.0, 1, -0.1, 0, 56), [mx, mz] = V.spot(2.8, -0.4), [cx, cz] = V.spot(3.4, 0.56), len = cut("limb", "maroon") - paidA;
  const LIFT = 0.25, give = at("limb", /^eight$/) - paidA - 0.05, CLAP = give + 1.0;
  const cap = mover(CAPTAIN_D, 1.86, cx, cz, V.toward(cx, cz, -40)); cap.stand(8);
  // bent over the sack on the deck
  cap.actAt(-1, { lean: 42, py: -0.24, armL: arm(30, 8, 14, 0), armR: arm(30, 8, 14, 0), head: [0, 18, 0] }, LIFT + 1, { in: 0.01, out: 0.1, handL: "grip", handR: "grip", face: { brow: -1, lid: 0.2, smile: -0.5, mouth: 0.3 } });
  // up with it to his chest, leaning back against its weight
  cap.actAt(LIFT, { lean: -10, py: -0.04, armL: arm(46, 8, 100, -6), armR: arm(46, 8, 100, -6), head: [8, -4, 0] }, give - LIFT - 0.18, { in: 0.34, out: 0.1, antic: 0.3, over: 1.3, handL: "grip", handR: "grip", face: { brow: -1, lid: 0.1, smile: -0.7, mouth: 0.5 } });
  // and swung across into the man's arms
  cap.actAt(give - 0.2, { armL: arm(60, 8, 82, 0), armR: arm(64, 8, 86, 0), lean: 16, pz: 0.06 }, 0.55, { in: 0.18, out: 0.3, antic: 0.5, over: 1.6, handL: "open", handR: "open", face: { brow: 0.4, lid: 0, smile: 0.3, mouth: 0.5, gaze: [-0.8, 0] } });
  cap.actAt(give + 0.4, { armL: arm(10, 12, 30, 0), armR: arm(20, 14, 40, 0), head: [8, -2, 0] }, 9, { in: 0.25, handR: "open", face: { smile: 0.38, brow: 0.6, gaze: [-0.8, 0.2] } });
  cap.actAt(CLAP, { armL: arm(52, 40, 104, 50), lean: 4, head: [8, 10, 0] }, 9, { in: 0.2, antic: 0.4, over: 1.7, handL: "open", face: { smile: 0.38, brow: 0.9, gaze: [-0.8, 0.2] } });
  wag(cap, CLAP + 0.25, 3, P({ head: [8, 14, 0] }), P({ head: [8, -4, 0] }), 0.36);
  const m = mover(MATE_D, 1.8, mx, mz, V.toward(mx, mz, 44)); m.stand(give + 0.12).step("L", -0.2, 0.2).stand(6);
  // his eyes follow the sack up; he holds out hook and hand for it
  m.actAt(-1, { armL: arm(10, 12, 30, 0), armR: arm(26, 6, 60, -6), head: [10, 12, 0] }, give - 0.4 + 1, { in: 0.01, out: 0.15, handL: "relaxed", handR: "fist", face: { brow: 0.9, wide: 0.4, lid: 0, smile: 0.1, gaze: [0.8, 0.6] } });
  m.actAt(give - 0.45, { armL: arm(40, 12, 80, -4), armR: arm(58, 10, 106, -6), head: [6, 4, 0], lean: 3 }, 0.6, { in: 0.2, out: 0.1, antic: 0, over: 1.5, handL: "open", handR: "fist", face: { brow: 1, wide: 0.6, lid: 0, smile: 0.4, gaze: [0.8, 0] } });
  // it lands in his arms: his knees give
  m.actAt(give, { armL: arm(30, 10, 76, -14), armR: arm(46, 8, 98, -14), py: -0.22, lean: 9, head: [0, 14, 0] }, 0.72, { in: 0.1, out: 0.3, antic: 0, over: 2.4, handL: "grip", handR: "fist", face: { wide: 1, lid: 0, brow: 1, smile: -0.3, mouth: 0.7, gaze: [0, 0.8] } });
  // then he has it, and beams over it
  m.actAt(give + 0.42, { armL: arm(36, 10, 84, -14), armR: arm(54, 8, 108, -16), py: -0.06, lean: 2, head: [10, -4, 0] }, 9, { in: 0.3, antic: 0, over: 1.6, handL: "grip", handR: "fist", face: { wide: 0.5, lid: 0, brow: 1, smile: 1, mouth: 0.6, gaze: [0.7, -0.1] } });
  wag(m, give + 0.9, 3, P({ py: -0.03, roll: 3 }), P({ py: -0.08, roll: -3 }), 0.36);
  add({ id: "paid", a: paidA, b: cut("limb", "maroon"), still: give + 0.3,
    sounds: [{ t: LIFT, k: "creak", g: 0.7, p: 0.3 }, { t: LIFT + 0.1, k: "rattle", dur: 0.5, g: 0.5, p: 0.3 }, { t: give - 0.2, k: "whoosh", g: 0.6, p: 0.2 }, { t: give + 0.03, k: "sack", p: -0.2 }, { t: give + 0.2, k: "step", surface: "wood", g: 1.1, p: -0.3 },
      ...[0.12, 0.2, 0.28, 0.38, 0.5, 0.64, 0.8].map((d, i) => ({ t: give + d, k: "coin", g: 0.7, p: -0.4 + 0.1 * i })), { t: CLAP, k: "whoosh", dur: 0.25, g: 0.3, p: 0.3 }],
    cam: (_t, u) => V.push(0.14 * u), sun: { target: [1.4, 0, 3.7], reach: 6 },
    cast: (t) => [play("cap", CAPTAIN_D, cap, t, [0, 0, 0], 1.86, { seed: 5 }), play("m", MATE_D, m, t, [0, 0, 0], 1.8, { seed: 7 })],
    things: (g, c, t, _T, cam) => { hooked(g, c.m, cam);
      // the sack: in the captain's two hands (on the deck while he is bent over it), then across at chest height, then hanging by its
      // neck from the man's hook with his hand under it; it lies behind the hook, so the hook is seen in its neck
      const his = between(c.cap.joint("wrL"), c.cap.joint("wrR")), hk = c.m.joint("wrR"), mine: V3 = [hk[0], hk[1] - 0.4, hk[2]], u = smooth((t - give + 0.14) / 0.2), q = between([his[0], his[1] - 0.2, his[2]] as V3, mine, u), p = near(q, cam, 0.04);
      const s = put(g, SACK(), [p[0], Math.max(0.22, p[1] + 0.06 * Math.sin(Math.PI * u) * (u < 1 ? 1 : 0)), p[2]]); s.lookAt(cam.pos[0], s.position.y, cam.pos[2]);
      // the coins that jump out fly low to the sides, never across a face
      for (let i = 0; i < 6; i++) tossed(g, i, [mine[0] - 0.12, mine[1] + 0.3, mine[2]], [-0.3, 1.3 + 0.3 * (i % 3), (i % 2 ? 1 : -1) * (0.7 + 0.25 * (i % 3))], t - give - 0.04 - i * 0.03, 0); } });
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
      const s = near(c.pir.joint("skull"), cam, 0.1); for (let i = 0; i < 6; i++) { const u = (t + 0.5 - i * 0.16) % 0.96, off = (i % 2 ? 1 : -1) * (0.3 + 0.05 * (i >> 1)), q = put(g, COINS[i](), [s[0] + 0.92 * off, Math.max(0.03, s[1] + 0.02 - 4.9 * u * u), s[2] + 0.39 * off]); q.scale.setScalar(1.5); q.rotation.set(Math.PI / 2 + u * 12, i, 0); } } });
}
// 7. AND YOU WERE LEFT ON AN EMPTY ISLAND: the same man on the sand under the one palm, shaking his fist after the ship, which
//    sails away without him
const [ix, iy, iz] = SHIP.island, sand = (x: number, z: number) => iy - 0.3 + 0.95 * Math.sqrt(Math.max(0, 1 - ((x - ix) / 5.2) ** 2 - ((z - iz) / 3.8) ** 2));
const gunA = at("maroon", /^with$/) - 0.12;
{
  const V = aim(SHIP.palm[0], SHIP.palm[2], 6.6, 0.75, 176, iy + 1.5, 6, 46), [px, pz] = V.spot(4.3, -0.42);
  const pir = mover(PIRATE_D, 1.76, px + 0.75, pz + 0.1, -68); pir.walk(mt(pir, 0.75), { run: true }).stand(6);
  pir.actAt(-1, { armR: arm(132, 6, 150, 0), armL: arm(20, 30, 70, 30), lean: 8, head: [26, -8, 0] }, 9, { in: 0.01, handR: "fist", handL: "fist", face: { wide: 0.6, lid: 0, brow: -1, mouth: 0.8, smile: -1, gaze: [-0.6, -0.3] } });
  wag(pir, 0.3, 5, P({ armR: arm(142, 6, 168, 0), py: 0.03 }), P({ armR: arm(120, 6, 128, 0), py: -0.02 }), 0.3, { handR: "fist" });
  add({ id: "island", a: maroonMid, b: gunA, still: 1.3,
    sounds: [0.08, 0.3, 0.52].map((t) => ({ t, k: "step", run: true, surface: "sand", g: 0.8 })), beds: [{ k: "surf", a: 0, b: 2.1, g: 1 }],
    cam: (_t, u) => V.push(-0.2 * u), sun: { target: [ix, iy, iz], reach: 8 },
    cast: (t) => { const a = play("pir", PIRATE_D, pir, t, [0, 0, 0], 1.76, { seed: 8, blink: false }); a.at[1] = sand(a.at[0], a.at[2]) - 0.02; return [a]; },
    things: (g, _c, t) => { const [sx, sz] = V.spot(170 + 3 * t, -33.2); put(g, SLOOP(), [sx, SEA - 0.4, sz], 0.5); } });
}
// 8. WITH A GUN AND A BOTTLE OF WATER: from the sand. The pistol and the bottle they left him stand near the lens; behind them he
//    drops to his knees and hangs his head, the ship small on the horizon
{
  const V = lens(ix - 1.5, iy + 1.0, iz + 2.6, -0.04, -1, -5, 56), [px, pz] = V.spot(3.0, 0.06), [gx, gz] = V.spot(1.5, -0.1), [bx, bz] = V.spot(1.45, 0.3);
  // he comes in from the side, bowed, toward the things they left him
  const pir = mover(PIRATE_D, 1.76, px + 0.1 - 0.77, pz - 0.64, 50); pir.walk(mt(pir, 1.0), { step: 0.8 }).stand(8);
  pir.actAt(-1, { armL: arm(26, 10, 44, 0), armR: arm(26, 10, 44, 0), head: [0, 28, 0], lean: 17 }, 0.9 + 1, { in: 0.01, out: 0.15, handL: "relaxed", handR: "relaxed", face: { brow: 1, smile: -1, lid: 0.3, gaze: [0, 0.9] } });
  wag(pir, 0, 0.8, P({ roll: 5 }), P({ roll: -5 }), 0.4);      // he staggers
  const sit = 0.8;
  pir.actAt(sit, { py: -0.5, pz: -0.16, lean: 20, armL: arm(88, 12, 160, -30), armR: arm(88, 12, 160, -30), head: [0, 26, 0] }, 9, { in: 0.26, antic: 0.3, over: 1.6, handL: "open", handR: "open", face: { brow: 1, smile: -1, lid: 0.3, gaze: [0, 1] } });
  wag(pir, sit + 0.45, 3, P({ head: [8, 26, 0], roll: 2 }), P({ head: [-8, 26, 0], roll: -2 }), 0.6);
  add({ id: "gun", a: gunA, b: cut("maroon", "answer"), still: 1.3,
    sounds: [{ t: 0.2, k: "step", surface: "sand", g: 0.7 }, { t: 0.6, k: "step", surface: "sand", g: 0.7 }, { t: sit + 0.22, k: "thud", g: 0.7, surface: "sand" }], beds: [{ k: "surf", a: 0, b: 2.4, g: 1 }],
    cam: (_t, u) => V.push(0.12 * u), sun: { target: [ix, iy, iz], reach: 8 },
    cast: (t) => { const a = play("pir", PIRATE_D, pir, t, [0, 0, 0], 1.76, { seed: 8, blink: false }); a.at[1] += sand(a.at[0], a.at[2]) - 0.02; return [a]; },
    things: (g, _c, t) => { const b = put(g, BOTTLE(), [bx, sand(bx, bz) - 0.02, bz]); b.rotation.z = 0.08; const p = put(g, PISTOL(), [gx - 0.16, sand(gx, gz) + 0.16, gz]); p.rotation.z = 0.2; p.scale.setScalar(0.85);
      const [sx, sz] = V.spot(125 + 3 * t, 24); put(g, SLOOP(), [sx, SEA - 0.4, sz], 0.5);
      // shells beside them
      for (const [d, l, c] of [[1.15, 0.5, "#fbf3df"], [1.25, -0.25, "#e89a8a"], [1.05, -0.3, "#c9b8a0"], [1.6, 0.52, "#fbf3df"]] as [number, number, string][]) { const [qx, qz] = V.spot(d, l); g.add(mesh(ball(0.03, 10), c, { at: [qx, sand(qx, qz) + 0.004, qz], scale: [1.3, 0.4, 1], line: 0.6, shadow: false })); }
    } });
}
// 9. BUT THE PLANK? ALMOST NEVER RECORDED: seen from out over the water, beside the plank. The captain shakes his head at it, stoops,
//    heaves its inboard end up and sends it sliding out past the lens into the sea; then he claps the dust off his hands
const answerMid = at("answer", /^Unwanted/) - 0.2;
const neverA = cut("maroon", "answer"), GRAB = 0.8, HEAVE = 1.12, SHOVE = 1.42, PLANK_IN = neverA + SHOVE + 0.86;      // the board is in the water at PLANK_IN (film time)
{
  const X0 = PL.x0 - 0.9, LEN = PL.x1 - X0, V: Cam = { pos: [5.0, 0.95, PL.z - 0.75], look: [1.75, 1.0, PL.z + 0.05], fov: 48 };
  const cap = mover(CAPTAIN_D, 1.86, X0 - 0.3, PL.z + 0.05, 72); cap.stand(8);
  // fists on his hips, he shakes his head at it
  cap.actAt(-1, { armL: arm(24, 44, -24, 60), armR: arm(24, 44, -24, 60), head: [0, 16, 0], lean: 5 }, GRAB - 0.2 + 1, { in: 0.01, out: 0.15, handL: "fist", handR: "fist", face: { brow: -0.6, lid: 0.2, smile: -0.5, gaze: [0, 0.8] } });
  wag(cap, 0.1, GRAB - 0.35, P({ head: [24, 16, 0] }), P({ head: [-24, 16, 0] }), 0.36);
  // stoops and takes hold of its end
  cap.actAt(GRAB - 0.22, { lean: 44, py: -0.3, armL: arm(34, 8, 16, 0), armR: arm(34, 8, 16, 0), head: [0, 22, 0] }, HEAVE - GRAB + 0.22, { in: 0.2, out: 0.1, antic: 0.2, over: 1.2, handL: "grip", handR: "grip", face: { brow: -1, lid: 0.3, smile: -0.6 } });
  // heaves it up to his chest
  cap.actAt(HEAVE, { lean: -9, armL: arm(70, 8, 112, 0), armR: arm(70, 8, 112, 0), head: [0, -6, 0] }, SHOVE - HEAVE + 0.05, { in: 0.2, out: 0.08, antic: 0.3, over: 1.5, handL: "grip", handR: "grip", face: { brow: -1, lid: 0.1, smile: -0.8, mouth: 0.4 } });
  // shoves it out
  cap.actAt(SHOVE, { lean: 26, pz: 0.1, armL: arm(96, 10, 100, 0), armR: arm(96, 10, 100, 0), head: [0, 8, 0] }, 0.5, { in: 0.1, out: 0.25, antic: 0.2, over: 1.8, handL: "open", handR: "open", face: { brow: -1, lid: 0, smile: -0.4, mouth: 0.6 } });
  // watches it go down, his hands on his knees
  cap.actAt(SHOVE + 0.36, { lean: 28, py: -0.08, armL: arm(44, 10, 26, 0), armR: arm(44, 10, 26, 0), head: [0, 26, 0] }, 0.56, { in: 0.16, out: 0.14, antic: 0, over: 1.3, handL: "open", handR: "open", face: { brow: 0.6, lid: 0, smile: 0.2, gaze: [0, 1] } });
  // and claps the dust off his hands, pleased with himself
  cap.actAt(SHOVE + 0.88, { armL: arm(52, 10, 122, -40), armR: arm(52, 10, 122, -40), head: [-16, -4, 0] }, 9, { in: 0.2, handL: "open", handR: "open", face: { brow: 0.5, lid: 0.15, smile: 0.38, gaze: [0.4, 0] } });
  wag(cap, SHOVE + 1.0, 3, P({ armL: arm(52, 10, 122, -54), armR: arm(52, 10, 122, -26) }), P({ armL: arm(52, 10, 122, -26), armR: arm(52, 10, 122, -54) }), 0.2, { handL: "open", handR: "open" });
  add({ id: "never", a: neverA, b: answerMid, still: SHOVE + 0.1, hide: ["plank"],
    // the board creaks as it is taken up, scrapes over the side as it is shoved, and goes in with a splash; then his hands, clapped clean
    sounds: [{ t: GRAB, k: "creak", g: 0.8 }, { t: HEAVE, k: "creak", g: 0.6 }, { t: SHOVE, k: "whoosh", g: 0.8, p: 0.2 }, { t: SHOVE + 0.05, k: "scuff", g: 1.1, p: 0.2 }, { t: SHOVE + 0.86, k: "splash", g: 1.2, big: 1.2, p: 0.4 },
      ...swings(SHOVE + 1.0, 3, 0.2, answerMid - neverA, 0.08).map((t) => ({ t, k: "tap", g: 0.6, p: -0.1 }))],
    cam: () => V, sun: { target: [2, 0, 0.6], reach: 6 },
    cast: (t) => [play("cap", CAPTAIN_D, cap, t, [0, 0, 0], 1.86, { seed: 5 })],
    things: (g, c, t) => {
      // the board: at rest on the deck and over the rail; then its inboard end follows his hands and it leans over the gunwale; then it
      // slides out along its own length and falls
      const rest: V3 = [X0, PL.y - 0.035, PL.z], piv: V3 = [SHIP.half, PL.y - 0.035, PL.z], h = between(c.cap.joint("wrL"), c.cap.joint("wrR"));
      const k = smooth((t - GRAB + 0.05) / 0.12), held: V3 = [X0 + 0.04, Math.max(rest[1], h[1] - 0.06), PL.z], e0 = mix3(rest, held, t < SHOVE ? k : 1), u = Math.max(0, t - SHOVE);
      // after the shove his hands are no longer on it: it keeps the lean it had and goes
      const E: V3 = t < SHOVE ? e0 : [X0 + 0.04, 1.28, PL.z], dx = piv[0] - E[0], dy = piv[1] - E[1], n = Math.hypot(dx, dy) || 1, ux = dx / n, uy = dy / n, s = 3.2 * u + 3 * u * u, fall = 4.9 * Math.max(0, u - 0.18) ** 2;
      const b = put(g, BOARD(), [E[0] + ux * (LEN / 2 + s), E[1] + uy * (LEN / 2 + s) - fall, PL.z]); b.rotation.z = Math.atan2(uy, ux) - 1.1 * Math.max(0, u - 0.15);
      splash(g, [5.6, SEA, PL.z + 0.2], t - SHOVE - 0.86, 1.2);
    } });
}
// 10. UNWANTED MEN SIMPLY WENT OVER THE SIDE: along the ship's side from just forward of where the plank was. The captain has him
//     over his head at the rail, swings back and heaves him out flat; the lens keeps him in the middle of the picture all the way down, and when he
//     has gone in it holds the ship's side with the captain looking down from the rail, and the splash below
const SPLASH: V3 = [4.4, SEA, 4.2];
const heave = at("answer", /^simply/) + 0.05 - answerMid, fly = 1.2, hit = answerMid + heave + fly;
{
  const RAIL = 2.3, WIND = heave - 0.36;
  const cap = mover(CAPTAIN_D, 1.86, RAIL - 0.5, SPLASH[2], 90); cap.walk(mt(cap, 0.5)).stand(6);
  cap.actAt(-1, { armL: arm(166, 16, 184, 4), armR: arm(166, 16, 184, 4), lean: -4 }, WIND + 0.02 + 1, { in: 0.01, out: 0.1, handL: "open", handR: "open", face: { brow: -1, lid: 0.2, smile: 0.36 } });
  // he swings back with him, his knees giving
  cap.actAt(WIND, { armL: arm(200, 16, 216, 4), armR: arm(200, 16, 216, 4), lean: -22, py: -0.12 }, 0.36, { in: 0.24, out: 0.06, antic: 0, over: 1, handL: "open", handR: "open", face: { brow: -1, lid: 0.1, smile: -0.4, mouth: 0.3 } });
  // heaves, and stays down over the rail to watch him go
  cap.actAt(heave, { armL: arm(96, 16, 92, 4), armR: arm(96, 16, 92, 4), lean: 16, pz: 0.08, py: -0.06, head: [0, 18, 0] }, fly + 0.1, { in: 0.1, out: 0.3, antic: 0, over: 1.8, handL: "open", handR: "open", face: { brow: -0.6, lid: 0, smile: 0.2, mouth: 0.5, gaze: [0, 1] } });
  // then claps his hands clean
  cap.actAt(heave + fly, { armL: arm(52, 10, 122, -40), armR: arm(52, 10, 122, -40), lean: 16, head: [0, 20, 0] }, 9, { in: 0.25, handL: "open", handR: "open", face: { smile: 0.38, brow: 0.5, lid: 0.15, gaze: [0, 0.9] } });
  wag(cap, heave + fly + 0.15, 3, P({ armL: arm(52, 10, 122, -54), armR: arm(52, 10, 122, -26) }), P({ armL: arm(52, 10, 122, -26), armR: arm(52, 10, 122, -54) }), 0.24, { handL: "open", handR: "open" });
  const sir = mover(SIR_D, 1.8, 0, 0, 90); sir.stand(9);
  sir.actAt(-1, { armL: arm(70, 60, 110, 70), armR: arm(140, 50, 170, 40), legL: { th: [40, 14], sh: [-30, 0], pitch: 20 }, legR: { th: [-24, 10], sh: [-70, 0], pitch: 30 }, head: [0, -10, 0] }, 9 + 1, { in: 0.01, handL: "open", handR: "open", face: { wide: 1, lid: 0, brow: 1, mouth: 1 } });
  wag(sir, 0, 5, P({ legL: { th: [-20, 14], sh: [-60, 0], pitch: 20 }, legR: { th: [44, 10], sh: [-26, 0], pitch: 30 }, armL: arm(140, 50, 170, 40), armR: arm(70, 60, 110, 70) }), P({ legL: { th: [40, 14], sh: [-30, 0], pitch: 20 }, legR: { th: [-24, 10], sh: [-70, 0], pitch: 30 } }), 0.3, { handL: "open", handR: "open" });
  /** where the middle of him is, and how far he has turned: he rides on the captain's hands (and swings back with them), then flies */
  const x0 = RAIL + 0.45, y0 = 2.66, capX = (t: number) => RAIL - 0.5 + 0.5 * smooth(t / Math.max(0.2, WIND - 0.1));
  const flight = (t: number): [V3, number] => {
    if (t < heave) { const w = smooth((t - WIND) / 0.26) * (1 - smooth((t - heave + 0.08) / 0.08)); return [[capX(t) + 0.34 - 0.3 * w, y0 + 0.02 * Math.sin(t * 14) - 0.06 * w, SPLASH[2]], 90 + 5 * Math.sin(t * 9) + 16 * w]; }
    const u = t - heave, vx = (SPLASH[0] - x0) / fly, vy = (SEA - 0.3 - y0 + 4.9 * fly * fly) / fly; return [[x0 + vx * u, y0 + vy * u - 4.9 * u * u, SPLASH[2]], 90 + 62 * u]; };      // he goes over flat and tips into a dive
  add({ id: "over", a: answerMid, b: cut("answer", "origin"), still: heave + 0.45, hide: ["plank"],
    sounds: [{ t: 0.1, k: "step", surface: "wood", p: 0.4 }, { t: 0.4, k: "step", surface: "wood", p: 0.3 }, { t: WIND, k: "creak", g: 0.6, p: 0.3 }, { t: heave - 0.05, k: "whoosh", g: 0.9, p: 0.2 }, { t: heave + 0.05, k: "fall", dur: fly - 0.1, p: 0 }, { t: heave + fly, k: "splash", g: 1.4, big: 1.4, p: -0.2 },
      ...swings(heave + fly + 0.15, 3, 0.24, cut("answer", "origin") - answerMid, 0.1).map((t) => ({ t, k: "tap", g: 0.5, p: 0.4 }))],
    // the lens holds the two of them at the rail, goes with him the moment he leaves the hands, and draws back as he falls; when he
    // is in, it settles on the ship's side between the captain above and the splash below
    cam: (t) => { const [p] = flight(Math.min(t, heave + fly)), go = smooth((t - WIND - 0.05) / 0.3), back = smooth((t - heave) / fly), end = smooth((t - heave - fly + 0.1) / 0.3);
      const two: V3 = [capX(t) + 0.25, 1.9, SPLASH[2]], rest: V3 = [3.45, -0.05, SPLASH[2]], follow = mix3(two, [p[0], p[1], SPLASH[2]], go);
      return { pos: [4.05, 2.25 - 0.3 * back, 0.98 - 1.5 * back], look: mix3(follow, rest, end), fov: 58 + 4 * back }; },
    sun: { target: [3.2, 0, 4.2], reach: 7 },
    cast: (t, T) => { const c = play("cap", CAPTAIN_D, cap, t, [0, 0, 0], 1.86, { seed: 5 }), [p, spin] = flight(t);
      return t > heave + fly + 0.05 ? [c] : [c, { ...play("sir", SIR_D, sir, t, [0, 0, 0], 1.8, { talk: talk(W, T, ["answer"]), blink: false }), at: p, spin }]; },
    things: (g, _c, t) => { splash(g, SPLASH, t - heave - fly, 1.3); } });
}
// 11. THE PLANK COMES FROM STORIES: at the water. First only his hand comes up, holding the book dry; then he bursts up after it,
//     spouts, shakes the water off and paddles, the book held high
const originMid = at("origin", /^like$/) - 0.1;
{
  const [wx, , wz] = SPLASH, V = lens(wx + 0.2, SEA + 1.15, wz + 2.6, -0.08, -1, -14, 46), t0 = cut("answer", "origin"), UP = 0.32;
  const sir = mover(SIR_D, 1.8, wx, wz, V.toward(wx, wz, -8)); sir.stand(9);
  sir.actAt(-1, { armL: arm(40, 60, 80, 70), armR: arm(160, 20, 184, 0), head: [0, -8, 0] }, 9 + 1, { in: 0.01, handL: "open", handR: "grip", face: { wide: 0.8, lid: 0, brow: 1, mouth: 0.5, gaze: [0.3, -0.4] } });
  // he shakes his head hard as he comes up, then paddles with his free arm and looks up at the book he has saved
  wag(sir, UP + 0.2, 0.5, P({ head: [26, -6, 0], roll: 5 }), P({ head: [-26, -6, 0], roll: -5 }), 0.2);
  wag(sir, 0, 4, P({ armL: arm(40, 76, 60, 104) }), P({ armL: arm(46, 44, 104, 40) }), 0.42, { handL: "open" });
  sir.actAt(UP + 0.75, { armR: arm(168, 14, 190, -6), head: [-12, -22, 0], py: 0.04 }, 9, { in: 0.2, antic: 0.3, over: 1.8, handR: "grip", face: { smile: 1, brow: 1, wide: 0.4, lid: 0, gaze: [-0.4, -0.9] } });
  wag(sir, UP + 0.95, 3, P({ armR: arm(172, 14, 196, -6) }), P({ armR: arm(164, 14, 182, -6) }), 0.3, { handR: "grip" });
  // under at first, with only the arm and the book above the water; then up with a rush, and bobbing
  const bob = (t: number) => SEA - 1.48 - 0.42 * (1 - smooth((t - UP + 0.14) / 0.2)) + 0.34 + 0.1 * Math.exp(-Math.max(0, t - UP) * 5) * Math.sin(Math.max(0, t - UP) * 16) + 0.05 * Math.sin(t * 5);
  add({ id: "stories2", a: t0, b: originMid, still: 1.0, hide: ["plank"],
    sounds: [{ t: 0.02, k: "bubble" }, { t: UP - 0.1, k: "splash", g: 0.8, big: 0.6, p: -0.1 }, { t: UP + 0.12, k: "spray", p: -0.2 }, { t: UP + 0.5, k: "drip" }, { t: 1.2, k: "drip" }, { t: 1.5, k: "drip" }], beds: [{ k: "lap", a: 0, b: 1.9, g: 1 }],
    cam: (_t, u) => V.push(0.14 * u), sun: { target: [wx, SEA, wz], reach: 6 },
    cast: (t, T) => [play("sir", SIR_D, sir, t, [0, bob(t), 0], 1.8, { talk: Math.max(talk(W, T, ["origin"]), t > UP && t < UP + 0.5 ? 0.8 : 0), blink: false })],
    things: (g, c, t, _T, cam) => { const a = c.sir, p = near(a.joint("tipR"), cam, 0.05), k = put(g, BOOK_T(), [p[0], p[1] + 0.25, p[2]]); k.lookAt(cam.pos[0], p[1] + 0.25, cam.pos[2]);
      waterline(g, wx, wz, cam, t, 0.95);
      // the rings he has sent out, seen as broken arcs on the lens side, widening
      for (let i = 0; i < 4; i++) { const r = 0.42 + 0.2 * i + 0.09 * t, turn = 0.75 + 0.1 * i, q = mesh(arc(r, 0.02, turn, 14), i % 2 ? "#d6ecfb" : "#ffffff", { at: [wx, SEA + 0.012, wz], rot: [Math.PI / 2, 0, Math.PI / 2 - turn / 2 + 0.35 * (i % 2 ? 1 : -1)], line: 0, shadow: false }); q.scale.set(1, 1, 0.3); g.add(q); }
      // the water he throws up as he bursts out, and what he spouts in an arc
      splash(g, [wx, SEA, wz + 0.1], t - UP + 0.1, 0.6, false);
      if (t > UP + 0.1 && t < UP + 0.75) { const m = near(a.joint("skull"), cam, 0.2), v = (t - UP - 0.1) / 0.65; for (let i = 0; i < 9; i++) { const u = (i / 9) * Math.min(1, v * 2.5); g.add(mesh(ball(0.032, 6), "#bfe3fb", { at: [m[0] - 0.12 - 0.62 * u, m[1] - 0.2 + 0.55 * u - 1.0 * u * u, m[2]], line: 0, shadow: false })); } } } });
}
// 12. LIKE TREASURE ISLAND AND PETER PAN: back on deck, dripping. One book at a time, held up in the open space between the two of
//     them. He shakes Treasure Island at the captain and puts it into his hand; the captain glances at it and flings it away over
//     his shoulder. He draws Peter Pan out of his coat and holds it up; the captain jabs a finger at the pirate on its cover,
//     throws up his hands and stamps off. Sir Digsworth looks after him and shrugs
{
  const V = lens(2.25, 1.25, 4.6, -0.05, -1, 2, 56), [qx, qz] = V.spot(3.0, -0.46), [cx, cz] = V.spot(3.3, 0.6), tI = at("origin", /Treasure/) - originMid, tP = at("origin", /Peter/) - originMid, len = END - originMid;
  const HAND = tI + 0.42, TOSS = HAND + 0.36, REL = TOSS + 0.1, COAT = tP - 0.36, OUT = tP - 0.1, JAB = tP + 0.3, HUFF = Math.min(JAB + 0.45, len - 0.9);
  const sir = mover(SIR_D, 1.8, qx, qz, V.toward(qx, qz, 24)); sir.stand(9);
  // Treasure Island held out before him, shaken as he names it
  sir.actAt(-1, { armL: arm(84, 8, 112, 0), armR: arm(20, 34, -24, 50), lean: 3, head: [0, -2, 0] }, HAND + 1, { in: 0.01, out: 0.12, handL: "grip", handR: "fist", face: { smile: 0.9, brow: 0.9, lid: 0.1, gaze: [0.8, 0] } });
  wag(sir, tI - 0.1, HAND - tI, P({ armL: arm(88, 8, 120, 0) }), P({ armL: arm(80, 8, 104, 0) }), 0.28, { handL: "grip" });
  // into the captain's hands with it
  sir.actAt(HAND - 0.1, { armL: arm(94, 14, 106, 8), lean: 1 }, COAT - HAND + 0.1, { in: 0.2, out: 0.14, antic: 0, over: 1.2, handL: "open", face: { smile: 1, brow: 1, lid: 0.1, gaze: [0.8, 0.5] } });
  // a hand into his coat, and out and up with Peter Pan
  sir.actAt(COAT, { armL: arm(30, -6, 128, -52), lean: 0 }, OUT - COAT + 0.02, { in: 0.16, out: 0.08, antic: 0, over: 1, handL: "grip", face: { smile: 0.7, brow: 0.6, gaze: [0.2, 0.5] } });
  sir.actAt(OUT, { armL: arm(96, 6, 156, -2), lean: 3, head: [0, -4, 0] }, 9, { in: 0.3, antic: 0, over: 1.6, handL: "grip", face: { smile: 1, brow: 1, lid: 0.1, gaze: [0.8, -0.2] } });
  // he looks after the captain, a hand half lifted after him, the book still up; when the captain's back is turned he lets the book
  // sink, turns to us and shrugs, and his shoulders go on working
  sir.actAt(HUFF + 0.12, { armR: arm(44, 20, 104, 24), lean: 6, head: [12, 2, 0] }, 0.5, { in: 0.2, out: 0.2, antic: 0, over: 1.1, handR: "open", face: { brow: 1, wide: 0.6, lid: 0, smile: -0.2, mouth: 0.4, gaze: [0.9, 0] } });
  sir.actAt(HUFF + 0.5, { armL: arm(42, 34, 96, 40), armR: arm(30, 14, 100, 18), py: 0.03, lean: -2, head: [-24, 0, 6] }, 9, { in: 0.26, antic: 0, over: 1.4, handL: "grip", handR: "open", face: { smile: 0.5, brow: 1, wide: 0.4, lid: 0, gaze: [-0.4, 0] } });
  wag(sir, HUFF + 0.74, 2, P({ py: 0.07, roll: 4, head: [-44, 0, 6], armR: arm(40, 16, 116, 22) }), P({ py: -0.01, roll: -4, head: [4, 0, 6], armR: arm(24, 12, 84, 14) }), 0.36, { handR: "open" });      // and shakes his head
  const h0 = V.toward(cx, cz, -34), cap = mover(CAPTAIN_D, 1.86, cx, cz, h0); cap.stand(HUFF + 0.14).turn(146, 0.3).walk(mt(cap, 3), { step: 0.5 });
  cap.actAt(-1, { armL: arm(128, 30, 206, -24), armR: arm(10, 12, 30, 0), head: [-14, 0, 6] }, HAND - 0.1 + 1, { in: 0.01, out: 0.12, handL: "relaxed", face: { brow: 0.8, lid: 0.1, smile: -0.3, gaze: [-0.8, 0] } });
  // he takes the book in one hand, out between the two of them, and glances at it; his other fist goes to his hip
  cap.actAt(HAND - 0.1, { armL: arm(20, 30, -20, 50) }, HUFF - HAND + 0.1, { in: 0.2, out: 0.1, antic: 0, over: 1, handL: "fist" });
  cap.actAt(HAND - 0.1, { armR: arm(62, 22, 112, 10), lean: 2, head: [-14, 0, 0] }, TOSS - HAND + 0.24, { in: 0.16, out: 0.1, antic: 0, over: 1.3, handR: "grip", face: { brow: 1, wide: 0.7, lid: 0, mouth: 0.3, gaze: [-0.7, 0.3] } });
  // and flings it away over his shoulder
  cap.actAt(TOSS, { armR: arm(168, 10, 206, 0), lean: -5, head: [-6, -6, 0] }, 0.3, { in: 0.12, out: 0.14, antic: 0, over: 1.8, handR: "open", face: { brow: -0.8, lid: 0.2, smile: -0.7, mouth: 0.3, gaze: [-0.6, 0] } });
  // a fist on each hip while the next one comes out
  cap.actAt(TOSS + 0.3, { armR: arm(20, 30, -20, 50), head: [-14, 2, 0] }, JAB - TOSS - 0.4, { in: 0.16, out: 0.1, antic: 0, over: 1.3, handR: "fist", face: { brow: -0.5, lid: 0.15, smile: -0.5, gaze: [-0.8, 0] } });
  // a finger jabbed at the pirate on its cover
  cap.actAt(JAB - 0.14, { armR: arm(84, 8, 110, 0), lean: 6, head: [-16, -6, 0] }, HUFF - JAB + 0.14, { in: 0.14, out: 0.08, antic: 0.4, over: 1.8, handR: "point", face: { brow: 1, wide: 0.9, lid: 0, mouth: 0.4, gaze: [-0.8, -0.3] } });
  wag(cap, JAB + 0.1, HUFF - JAB - 0.1, P({ armR: arm(88, 8, 118, 0) }), P({ armR: arm(78, 8, 98, 0) }), 0.2, { handR: "point" });
  // both hands thrown up, and off he stamps with his arms folded
  cap.actAt(HUFF, { armL: arm(130, 40, 176, 30), armR: arm(130, 40, 176, 30), lean: -6, head: [0, -12, 0] }, 0.42, { in: 0.12, out: 0.2, antic: 0.3, over: 1.8, handL: "open", handR: "open", face: { brow: -1, lid: 0.2, smile: -1, mouth: 0.4 } });
  cap.actAt(HUFF + 0.45, { armL: arm(40, 10, 100, -50), armR: arm(44, 10, 104, -50), head: [0, -12, 0] }, 9, { in: 0.2, handL: "fist", handR: "fist", face: { brow: -1, lid: 0.3, smile: -1 } });
  add({ id: "books", a: originMid, b: END, still: tP + 0.3, hide: ["plank"],
    sounds: [{ t: tI - 0.05, k: "book", p: -0.2 }, { t: HAND + 0.1, k: "paper", g: 0.8, p: 0.2 }, { t: COAT + 0.1, k: "paper", g: 0.5, p: -0.3 }, { t: OUT + 0.2, k: "book", p: -0.1 }, { t: JAB, k: "tap", g: 0.8, p: 0.1 }, { t: JAB + 0.2, k: "tap", g: 0.7, p: 0.1 }, { t: TOSS + 0.04, k: "whoosh", g: 0.8, p: 0.4 }, { t: TOSS + 0.95, k: "thud", g: 0.5, p: 0.8 }, { t: HUFF, k: "whoosh", g: 0.6, p: 0.4 },
      ...cap.cues().filter((q) => q.k === "step" && q.t > HUFF && q.t < len).map((q) => ({ t: q.t, k: "step", surface: "wood", g: 1.2, p: 0.4 })), ...[0.2, 0.7, 1.3, 1.9, 2.4].map((t) => ({ t, k: "drip", g: 0.7, p: -0.3 }))],
    cam: (_t, u) => V.push(0.14 * u), sun: { target: [1.5, 0, 1.4], reach: 6 },
    cast: (t, T) => [play("cap", CAPTAIN_D, cap, t, [0, 0, 0], 1.86, { seed: 5 }), play("sir", SIR_D, sir, t, [0, 0, 0], 1.8, { talk: talk(W, T, ["origin"]), blink: false })],
    things: (g, c, t, _T, cam) => {
      // a book stands on the hand that holds it, by its lower edge, behind the card, so that the fingers show on it
      const on = (b: THREE.Object3D, p: V3, hgt: number) => { const q = near(p, cam, -0.04); put(g, b, [q[0], q[1] + hgt / 2 + 0.02, q[2]]); b.lookAt(cam.pos[0], q[1] + hgt / 2 + 0.02, cam.pos[2]); return b; };
      // Treasure Island: on Sir Digsworth's hand; across onto the captain's; and away over his shoulder, turning, out of the picture
      const mine = c.sir.joint("tipL"), his = c.cap.joint("tipR"), k = smooth((t - HAND) / 0.22), u = t - REL;
      if (u < 0) on(BOOK_T(), mix3(mine, his, k), 0.56);
      else if (u < 1) { const f: V3 = [c.cap.at[0] - 0.05 + 1.5 * u, 2.3 + 3.6 * u - 4.9 * u * u, c.cap.at[2] - 0.4 * u], q = mix3([his[0], his[1] + 0.3, his[2]], f, smooth(u / 0.08)), b = put(g, BOOK_T(), q); b.lookAt(cam.pos[0], q[1], cam.pos[2]); b.rotateZ(-9 * u); }
      // Peter Pan: out of his coat in the same hand, which holds it by its edge: the fingers lie over the cover's side
      if (t >= OUT) { const fx = cam.look[0] - cam.pos[0], fz = cam.look[2] - cam.pos[2], n = Math.hypot(fx, fz) || 1, d = 0.42 / 2 - 0.07, q = near([mine[0] - (fz / n) * d, mine[1] + 0.04, mine[2] + (fx / n) * d], cam, -0.04), b = put(g, BOOK_P(), q); b.lookAt(cam.pos[0], q[1], cam.pos[2]); }
      drips(g, c.sir, t, cam, 3); g.add(mesh(ball(1, 14), "#9fd4f6", { at: [c.sir.at[0], 0.012, c.sir.at[2]], scale: [0.5, 0.01, 0.34], line: 0.5, shadow: false })); } });
}

export const PIRATE_PLANK: Film = {
  id: "pirate-plank", fps: 30, seconds: END, sky: "#9fd6ff", world: pirateShip, shots, words: W,
  hook: { text: ["DID PIRATES", "MAKE YOU WALK", "THE PLANK?"], a: 0, b: L.hook.b + 0.2, size: 96 },
  sign: { text: "Dramatised. The rules are from pirate articles printed in 1724.", a: maroonMid + 0.04, b: maroonMid + 2.04 },
  // each is the film's own frame at that time (text.md names the times), with the words laid over it
  thumbs: [
    { T: 0.14, words: ["WALK THE", "PLANK?"], y: 0.62, size: 150 },
    { T: answerMid + heave + 0.4, words: ["NO PLANK", "NEEDED"], y: 0.16, size: 140 },
    { T: cut("answer", "origin") + 1.3, words: ["JUST A", "STORY?"], y: 0.71, size: 140 },
  ],
  hits: [{ t: PLANK_IN, amp: 0.5, dur: 0.3 }, { t: hit, amp: 1, dur: 0.4 }], beds: [{ k: "sea", a: 0, b: END, g: 1 }, { k: "wind", a: 0, b: END, g: 0.35 }], music: "shanty", audio: "craft/pirate-plank.wav",
};
