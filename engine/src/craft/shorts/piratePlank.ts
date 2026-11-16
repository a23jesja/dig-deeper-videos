// Short: "Did pirates really make you walk the plank?" One pirate sloop at sea (world/ship.ts), played on the stage (stage/Stage.tsx).
// The shots are cut to the narration's lines (voice/pirate-plank). Sources and what must not be claimed: granskning/pirate-plank/manus.md.
// The picture of the plank at the start is the story everybody knows; the rest shows what the sources say pirates did instead.
import * as THREE from "three";
import { Film, Shot, Cam, V3, Staged, Word, play, talk, smooth } from "../stage/film";
import { mover, mt, wag, arm } from "../stage/acting";
import { lens, aim, once, noShade, put, between, near } from "../stage/staging";
import { pirateShip, SHIP, SEA, merchantSide, MERCHANT_DECK } from "../world/ship";
import { mesh, box, ball, rod } from "../world/kit";
import { chest, coin, cutlass, flagCloth, storyBook, articlesSheet, moneySack, sharkFin, sharkBody, foamRing, hookHand, bottle } from "../world/props";
import { SIR_D, CAPTAIN_D, PIRATE_D, MATE_D, SAILOR_D, DOCKHAND_D } from "../looks";
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
const PL = SHIP.plank, AFT = SHIP.aft;

// ---------------- the things of the ship (made once, moved by the shots) ----------------
const CUTLASS = once(() => noShade(cutlass())), FIN = once(() => sharkFin(0.66)), FOAM = once(() => foamRing(0.42)), FOAM2 = once(() => foamRing(0.5));
const FLAG = once(() => flagCloth("black", 1.7, 1.15)), CHEST = once(() => chest(true, true, 0.8, 0.46, 0.52)), COINS = [0, 1, 2, 3, 4, 5, 6, 7].map(() => once(() => noShade(coin(0.045))));
const BOOK_T = once(() => storyBook(["TREASURE", "ISLAND"])), BOOK_P = once(() => storyBook(["PETER PAN"])), SHEET = once(() => articlesSheet(0.36, 0.475)), SACK = once(() => noShade(moneySack(0.24, "800")));
const SHARK = once(() => sharkBody(2.3, 1)), SHARK_SHUT = once(() => sharkBody(2.3, 0.12));
const HOOK = once(() => hookHand()), BOTTLE = once(() => bottle(0.34)), MERCHANT = once(() => merchantSide());
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

// 1. THE HOOK: the picture everybody knows. Sir Digsworth at the end of the plank, the captain's cutlass at his back, and a shark
//    coming up out of the water at his feet with its jaws open
{
  const V = aim(5.25, PL.z, 4.45, 0.02, -55, -0.25, 0, 56), [kx, kz] = V.spot(3.55, -0.74);
  const sir = mover(SIR_D, 1.8, 5.25, PL.z, 90); sir.stand(8);
  sir.actAt(-1, { armL: arm(8, 82, 20, 96), armR: arm(8, 82, 20, 96), lean: -3, head: [0, 12, 0] }, 9, { in: 0.01, handL: "open", handR: "open", face: { wide: 1, lid: 0, brow: 1, smile: -1, mouth: 0.5, gaze: [0.4, 0.9] } });
  // he snatches his foot away from the jaws and nearly goes over backward
  sir.actAt(-0.2, { legL: { th: [70, 10], sh: [-40, 0], pitch: 30 }, lean: -16, pz: -0.06, armL: arm(60, 70, 130, 60), armR: arm(40, 80, 100, 96) }, 0.95, { in: 0.12, out: 0.3, antic: 0, over: 1.6, handL: "open", handR: "open" });
  wag(sir, 0.8, 4, P({ roll: 8, armL: arm(8, 58, 20, 66), armR: arm(8, 104, 24, 122) }), P({ roll: -8, armL: arm(8, 104, 24, 122), armR: arm(8, 58, 20, 66) }), 0.7, { handL: "open", handR: "open" });
  const cap = mover(CAPTAIN_D, 1.86, 2.9, PL.z, 90); cap.stand(6);
  cap.actAt(-1, { armR: arm(76, 4, 84, 0), armL: arm(-14, 26, 50, 44), lean: 8 }, 9, { in: 0.01, handR: "grip", handL: "fist", face: { brow: -1, smile: 0.3, lid: 0.15 } });
  for (const t0 of [0.9, 1.7]) cap.actAt(t0, { armR: arm(86, 4, 90, 0), pz: 0.08, lean: 15 }, 0.34, { in: 0.09, out: 0.2, antic: 0.4, over: 1.6, handR: "grip" });
  add({ id: "hook", a: 0, b: cut("hook", "story"), still: 0.14,
    cam: (_t, u) => V.push(0.2 * u), sun: { target: [4.4, 0, 0.6], reach: 7 },
    cast: (t, T) => [play("cap", CAPTAIN_D, cap, t, [0, 0.02, 0], 1.86, { seed: 5 }), play("sir", SIR_D, sir, t, [0, PL.y, 0], 1.8, { talk: talk(W, T, ["hook"]), blink: false })],
    things: (g, c, t, _T, cam) => { sword(g, c.cap, cam, 4); lunge(g, kx, kz, -150, (t + 0.36) / 1.05, 2.05, 1.05); if (t > 1.0) circling(g, kx + 0.2, kz + 0.9, 0.8, t, 1.7, 2.2); } });
}
// 2. A PLANK, A SWORD, A SHARK: from above. He counts them off: the plank under his feet, the blade behind him, and the shark, which
//    comes up again as he points at it
const storyMid = at("story", /^Just/) - 0.12;
{
  const V = aim(5.0, PL.z, 4.0, 0.16, -120, 3.45, -31, 42), t0 = cut("hook", "story");
  const sir = mover(SIR_D, 1.8, 5.0, PL.z, 90); sir.stand(8);
  const tp = at("story", /plank/) - t0, ts = at("story", /sword/) - t0, tk = at("story", /shark/) - t0;
  sir.actAt(-1, { armL: arm(8, 60, 20, 70), armR: arm(8, 60, 20, 70), head: [0, 10, 0] }, 9, { in: 0.01, handL: "open", handR: "open", face: { wide: 0.7, lid: 0, brow: 0.8, gaze: [0, 0.6] } });
  sir.actAt(tp, { armR: arm(38, 10, 30, 0), lean: 12, head: [0, 26, 0] }, ts - tp + 0.05, { in: 0.14, out: 0.12, antic: 0.3, over: 1.8, handR: "point", face: { brow: 0.6, wide: 0.6, lid: 0, gaze: [0, 1] } });
  sir.actAt(ts, { armL: arm(150, 16, 232, 6), twist: 24, head: [42, 0, 0], lean: -3 }, tk - ts + 0.05, { in: 0.14, out: 0.12, antic: 0.3, over: 1.8, handL: "point", face: { brow: 1, wide: 0.8, lid: 0, gaze: [0.9, 0] } });
  sir.actAt(tk, { armR: arm(30, 60, 20, 50), roll: -6, head: [-30, 24, 0], lean: 4 }, 3, { in: 0.14, antic: 0.3, over: 2, handR: "point", face: { brow: 1, wide: 1, lid: 0, mouth: 0.5, gaze: [-0.8, 1] } });
  const cap = mover(CAPTAIN_D, 1.86, 2.9, PL.z, 90); cap.stand(8);
  cap.actAt(-1, { armR: arm(76, 4, 84, 0), armL: arm(-14, 26, 50, 44), lean: 8 }, 9, { in: 0.01, handR: "grip", handL: "fist", face: { brow: -1, smile: 0.3, lid: 0.15 } });
  cap.actAt(ts - 0.05, { armR: arm(86, 4, 90, 0), pz: 0.08, lean: 15 }, 0.4, { in: 0.09, out: 0.2, antic: 0.4, over: 1.6, handR: "grip" });
  add({ id: "count", a: t0, b: storyMid, still: tk + 0.38,
    cam: (_t, u) => V.push(0.14 * u), sun: { target: [4.4, 0, 0.6], reach: 7 },
    cast: (t, T) => [play("cap", CAPTAIN_D, cap, t, [0, 0.02, 0], 1.86, { seed: 5 }), play("sir", SIR_D, sir, t, [0, PL.y, 0], 1.8, { talk: talk(W, T, ["story"]), blink: false })],
    things: (g, c, t, _T, cam) => { const k = sword(g, c.cap, cam, 4); k.rotation.x = Math.PI / 2; if (t < tk - 0.2) { const [fx, fz] = V.spot(3.95, -0.78); circling(g, fx, fz, 0.5, t, 1.7, 2.6); } const [lx, lz] = V.spot(3.95, -0.78); lunge(g, lx, lz, 80, (t - tk + 0.12) / 0.95, 2.55, 0.95); } });
}
// 3. JUST LIKE THE STORIES: from below, at the end of the plank. He shakes both fists in the air, delighted; behind him the captain
//    lets his blade sink and scratches his head
{
  const V = aim(5.0, PL.z, 2.5, -0.1, -67, 0.5, 14, 50);
  const sir = mover(SIR_D, 1.8, 5.0, PL.z, 90); sir.stand(8);
  sir.actAt(-1, { armL: arm(150, 30, 180, 12), armR: arm(150, 30, 180, 12), lean: -5, head: [0, -8, 0] }, 9, { in: 0.01, handL: "fist", handR: "fist", face: { smile: 1, wide: 0.5, lid: 0, brow: 1 } });
  wag(sir, 0.02, 3, P({ armL: arm(160, 30, 190, 12), armR: arm(160, 30, 190, 12), py: 0.03 }), P({ armL: arm(138, 34, 166, 16), armR: arm(138, 34, 166, 16), py: -0.02 }), 0.36, { handL: "fist", handR: "fist" });
  const cap = mover(CAPTAIN_D, 1.86, 2.75, PL.z + 0.05, 90); cap.stand(8);
  cap.actAt(-1, { armR: arm(14, 8, 34, 0), armL: arm(128, 30, 206, -24), head: [0, 0, -9], lean: -3 }, 9, { in: 0.01, handR: "grip", handL: "relaxed", face: { brow: 0.9, lid: 0.1, smile: -0.5, gaze: [0, -0.2] } });
  wag(cap, 0.1, 3, P({ armL: arm(132, 30, 212, -24) }), P({ armL: arm(124, 30, 198, -24) }), 0.3, { handL: "relaxed" });
  add({ id: "stories", a: storyMid, b: cut("story", "loot"), still: 0.62,
    cam: (_t, u) => V.push(0.08 * u), sun: { target: [4.4, 0, 0.6], reach: 7 },
    cast: (t, T) => [play("cap", CAPTAIN_D, cap, t, [0, 0.02, 0], 1.86, { seed: 5 }), play("sir", SIR_D, sir, t, [0, PL.y, 0], 1.8, { talk: talk(W, T, ["story"]), blink: false })],
    things: (g, c, _t, _T, cam) => { sword(g, c.cap, cam, -62); } });
}
// 4. PIRATES WANTED LOOT, NOT A FIGHT: from the deck. The cutlass stands stuck in the planks, still quivering; behind it the captain
//    is down on his knees at a chest of gold and throws the coins in the air
{
  const V = lens(1.7, 0.5, 5.0, -0.06, -1, 6, 56), [hx, hz] = V.spot(2.3, -0.1), [kx, kz] = V.spot(2.9, 0.34), [sx, sz] = V.spot(1.9, -0.25);
  const cap = mover(CAPTAIN_D, 1.86, kx, kz, V.toward(kx, kz, -26)); cap.stand(8);
  cap.actAt(-1, { py: -0.42, lean: 12, armL: arm(60, 30, 130, 20), armR: arm(60, 30, 130, 20), head: [0, -8, 0] }, 9, { in: 0.01, handL: "open", handR: "open", face: { smile: 1, wide: 0.6, lid: 0, brow: 0.8, mouth: 0.6, gaze: [0, -0.5] } });
  wag(cap, 0.05, 4, P({ armL: arm(40, 20, 96, 6), armR: arm(40, 20, 96, 6), lean: 20, head: [0, 8, 0] }), P({ armL: arm(118, 30, 168, 18), armR: arm(118, 30, 168, 18), lean: 4, head: [0, -12, 0] }), 0.7, { handL: "open", handR: "open" });
  add({ id: "loot", a: cut("story", "loot"), b: cut("loot", "flag"), still: 0.62,
    cam: (_t, u) => V.push(0.12 * u), sun: { target: [1.5, 0, 2.6], reach: 6 },
    cast: (t) => [play("cap", CAPTAIN_D, cap, t, [0, 0, 0], 1.86, { seed: 5, blink: false })],
    things: (g, c, t) => {
      const ch = put(g, CHEST(), [hx, 0, hz], 0.45); const l = ch.children.find((q) => q.userData.lid); if (l) l.rotation.x = -1.1;
      // the cutlass in the deck: it went in a moment ago and still shakes
      const k = put(g, CUTLASS(), [sx, 1.0, sz], 0); k.rotation.z = -Math.PI / 2 - 0.16 + 0.08 * Math.sin(t * 38) * Math.exp(-t * 2.2);
      // coins thrown up from his hands, one after another
      const h = between(c.cap.joint("wrL"), c.cap.joint("wrR"));
      for (let i = 0; i < 8; i++) { const u = ((t + i * 0.17) % 1.36); tossed(g, i, [hx - 0.3 + 0.05 * i, 0.72, hz + 0.16], [-0.25 + 0.3 * Math.sin(i * 2.4), 2.7 + 0.3 * (i % 3), 0.3 + 0.2 * Math.cos(i * 1.7)], u, 0.6); }
    } });
}
// 5. SO THEIR BLACK FLAG WAS MEANT TO: on the quarterdeck a pirate hauls the black flag up its staff, hand over hand
const flagMid = at("flag", /^scare/) - 0.1;
{
  const [sx, sy, sz] = SHIP.staff.at, V = aim(sx + 0.3, sz - 0.05, 2.9, -0.12, -19, AFT + 0.5, 17, 64), [px, pz] = [sx + 0.74, sz - 0.1];
  const pir = mover(PIRATE_D, 1.76, px, pz, V.toward(px, pz, 22)); pir.stand(8);
  pir.actAt(-1, { lean: -7, head: [10, -26, 0] }, 9, { in: 0.01, handL: "grip", handR: "grip", face: { brow: -0.6, lid: 0.1, smile: 0.36, gaze: [0.3, -1] } });
  wag(pir, -0.3, 6, P({ armR: arm(150, 14, 176, -6), armL: arm(74, 14, 118, -10), py: -0.03, lean: -10 }), P({ armL: arm(150, 14, 176, -6), armR: arm(74, 14, 118, -10), py: 0.01, lean: -5 }), 0.56, { handL: "grip", handR: "grip" });
  const rise = (t: number) => sy + 1.75 + (SHIP.staff.h - 1.82) * smooth((t + 0.2) / 1.75);
  add({ id: "flag", a: cut("loot", "flag"), b: flagMid, still: 1.5,
    cam: (_t, u) => V.push(-0.1 * u, 0, 2 * u), sun: { target: [sx, sy, sz], reach: 6 },
    cast: (t) => [play("pir", PIRATE_D, pir, t, [0, AFT, 0], 1.76, { seed: 8, blink: false })],
    things: (g, c, t) => { const y = rise(t), f = put(g, FLAG(), [sx - 0.09, y, sz - 0.08], Math.PI + 0.25 + 0.16 * Math.sin(t * 7)); f.rotation.z = 0.06 * Math.sin(t * 9 + 1);
      const top: V3 = [sx + 0.07, sy + SHIP.staff.h, sz + 0.05], h = c.pir.joint(Math.floor((t + 0.3) / 0.28) % 2 ? "wrL" : "wrR"); g.add(rod(top, [h[0] - 0.05, h[1], h[2]], 0.014, "#e8dcc0", { line: 0.5, shadow: false }), rod([h[0] - 0.05, h[1], h[2]], [sx + 0.2, sy + 0.2, sz + 0.2], 0.014, "#e8dcc0", { line: 0.5, shadow: false })); } });
}
// 6. SCARE A CREW INTO GIVING UP: over the water, on the merchant ship's rail, two sailors see it and throw their hands up
{
  const M: V3 = [-9.4, 0, 1.4], V = lens(-1.4, MERCHANT_DECK + 1.3, 1.4, -1, 0, 0.3, 19.5), d0 = -M[0] - 1.4 + 0.75;
  const [ax, az] = V.spot(d0, -0.3), [bx, bz] = V.spot(d0 + 0.5, 0.34);
  const up = (m: ReturnType<typeof mover>, t0: number, k: number) => {
    m.stand(8); m.actAt(-1, { armL: arm(20, 14, 70, 0), armR: arm(20, 14, 70, 0), head: [14 * k, -16, 0] }, t0 + 1.1, { in: 0.01, out: 0.1, face: { wide: 0.6, lid: 0, brow: 1, gaze: [0.5 * k, -0.9] } });
    m.actAt(t0, { armL: arm(158, 20, 184, 2), armR: arm(158, 20, 184, 2), lean: -8, py: -0.03, head: [8 * k, -10, 0] }, 9, { in: 0.16, antic: 0.5, over: 2.4, handL: "open", handR: "open", face: { wide: 1, lid: 0, brow: 1, mouth: 0.7, smile: -0.8, gaze: [0.4 * k, -0.7] } });
    wag(m, t0 + 0.3, 4, P({ roll: 2.5, py: -0.02 }), P({ roll: -2.5, py: -0.035 }), 0.16);
  };
  const a = mover(SAILOR_D, 1.76, ax, az, 90); up(a, 0.35, 1); const b = mover(DOCKHAND_D, 1.7, bx, bz, 90); up(b, 0.55, -1);
  add({ id: "scare", a: flagMid, b: cut("flag", "rules"), still: 1.3,
    cam: (_t, u) => V.push(0.5 * u), sun: { target: [M[0], 0, M[2]], reach: 7 },
    cast: (t) => [play("b", DOCKHAND_D, b, t, [0, MERCHANT_DECK, 0], 1.7, { seed: 2, blink: false }), play("a", SAILOR_D, a, t, [0, MERCHANT_DECK, 0], 1.76, { seed: 6, blink: false })],
    things: (g) => { put(g, MERCHANT(), M); } });
}
// 7. AND THEY HAD RULES: the captain holds the written articles up to the lens and raps on them; Sir Digsworth reads over his shoulder
const rulesA = at("rules", /^Lose/) - 0.15, rulesB = at("rules", /^and$/) - 0.1;
{
  const V = lens(0.9, 1.14, 3.9, 0, -1, 0, 50), [cx, cz] = V.spot(2.0, -0.2), [qx, qz] = V.spot(2.8, 0.34);
  const cap = mover(CAPTAIN_D, 1.86, cx, cz, V.toward(cx, cz, 6)); cap.stand(8);
  cap.actAt(-1, { armL: arm(34, 26, 92, -4), armR: arm(34, 30, 100, 10), head: [0, 6, 0] }, 9, { in: 0.01, handL: "grip", handR: "point", face: { brow: -0.5, smile: 0.36, lid: 0.1, gaze: [0, 0.5] } });
  wag(cap, 0.15, 3, P({ armR: arm(44, 16, 104, -34) }), P({ armR: arm(36, 28, 96, -8) }), 0.34, { handR: "point" });
  const sir = mover(SIR_D, 1.8, qx, qz, V.toward(qx, qz, -20)); sir.stand(8);
  sir.actAt(-1, { lean: 14, armR: arm(96, 10, 170, -38), head: [-18, 12, -6] }, 9, { in: 0.01, handR: "grip", face: { brow: 1, wide: 0.5, lid: 0, gaze: [-0.8, 0.6] } });
  add({ id: "rules", a: cut("flag", "rules"), b: rulesA, still: 0.7,
    cam: (_t, u) => V.push(0.1 * u), sun: { target: [0.9, 0, 1.6], reach: 5 },
    cast: (t) => [play("sir", SIR_D, sir, t, [0, 0, 0], 1.8, { blink: false }), play("cap", CAPTAIN_D, cap, t, [0, 0, 0], 1.86, { seed: 5 })],
    things: (g, c, _t, _T, cam) => { const p = near(c.cap.joint("neck"), cam, 0.16), k = put(g, SHEET(), [p[0], p[1] - 0.33, p[2]]); k.lookAt(cam.pos[0], p[1] - 0.33, cam.pos[2]); k.rotation.z += 0.04; } });
}
// 8. LOSE A LIMB IN BATTLE: from the deck, by the guns. One of the crew holds up the iron hook where his hand was
{
  const V = lens(-0.2, 0.42, 2.2, -0.82, -0.57, 17, 60), [mx, mz] = V.spot(2.45, 0.02);
  const m = mover(MATE_D, 1.8, mx, mz, V.toward(mx, mz, -16)); m.stand(8);
  m.actAt(-1, { armR: arm(20, 12, 60, -10), armL: arm(6, 14, 20, 0), head: [0, 10, 0] }, 1.0, { out: 0.2, handR: "fist", face: { brow: 0.4, smile: -0.5, lid: 0.3, gaze: [0, 0.6] } });
  m.actAt(0.25, { armR: arm(100, 26, 172, 4), lean: -4, head: [-18, -10, 0] }, 9, { in: 0.3, antic: 0.4, over: 1.8, handR: "fist", face: { brow: 0.9, smile: -0.36, lid: 0.15, gaze: [-0.8, -0.6] } });
  m.actAt(0.95, { armL: arm(24, 30, 80, 30), roll: 4 }, 9, { in: 0.25, over: 1.5, handL: "open" });
  add({ id: "limb", a: rulesA, b: rulesB, still: 1.0,
    cam: (_t, u) => V.push(0.1 * u), sun: { target: [-1.6, 0, 0.8], reach: 5 },
    cast: (t) => [play("m", MATE_D, m, t, [0, 0, 0], 1.8, { seed: 7 })],
    things: (g, c, _t, _T, cam) => hooked(g, c.m, cam) });
}
/** the hook on the end of his right arm: it covers the fist of the drawing, points on along the forearm and curls in the plane of the picture */
function hooked(g: THREE.Group, a: Staged, cam: Cam) {
  const e = new THREE.Vector3(...a.joint("elR")), w = new THREE.Vector3(...a.joint("wrR")), x = w.clone().sub(e).normalize(), p = near([w.x - x.x * 0.03, w.y - x.y * 0.03, w.z - x.z * 0.03], cam, 0.07);
  const z = new THREE.Vector3(cam.pos[0] - w.x, cam.pos[1] - w.y, cam.pos[2] - w.z); z.addScaledVector(x, -z.dot(x)).normalize(); const y = z.clone().cross(x), k = HOOK();
  k.position.set(...p); k.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z)); g.add(k);
}
// 9. AND THE CREW PAID YOU EIGHT HUNDRED PIECES OF EIGHT: from the side. The captain swings a heavy sack into his arms; he sags under it
//    and coins jump out
{
  const V = lens(-1.75, 1.1, 4.0, 1, -0.1, 4, 50), [mx, mz] = V.spot(2.6, -0.36), [cx, cz] = V.spot(3.3, 0.5), give = 0.75;
  const cap = mover(CAPTAIN_D, 1.86, cx, cz, V.toward(cx, cz, -40)); cap.stand(8);
  cap.actAt(-1, { armL: arm(36, 10, 100, -6), armR: arm(36, 10, 100, -6), lean: -8, twist: -14 }, give + 0.2, { in: 0.01, out: 0.16, handL: "grip", handR: "grip", face: { smile: 0.36, brow: 0.3, gaze: [-0.8, 0.2] } });
  cap.actAt(give - 0.2, { armL: arm(80, 8, 92, 0), armR: arm(84, 8, 96, 0), lean: 14, pz: 0.06 }, 0.6, { in: 0.2, out: 0.3, antic: 0.5, over: 1.6, handL: "open", handR: "open" });
  cap.actAt(give + 0.45, { armR: arm(40, 30, 130, 30), armL: arm(10, 12, 30, 0), head: [8, -4, 0] }, 9, { in: 0.3, handR: "open", face: { smile: 0.38, brow: 0.6, gaze: [-0.8, 0.2] } });
  const m = mover(MATE_D, 1.8, mx, mz, V.toward(mx, mz, 44)); m.stand(8);
  m.actAt(-1, { armL: arm(50, 14, 100, 0), armR: arm(50, 14, 100, 0), head: [0, 2, 0] }, give + 0.2, { in: 0.01, out: 0.15, handL: "open", handR: "fist", face: { brow: 0.8, wide: 0.4, lid: 0, gaze: [0.8, 0] } });
  m.actAt(give, { armL: arm(44, 10, 100, -14), armR: arm(44, 10, 100, -14), py: -0.14, lean: 10, head: [0, 12, 0] }, 9, { in: 0.14, over: 2.6, handL: "grip", handR: "fist", face: { wide: 1, lid: 0, brow: 1, smile: 0.9, mouth: 0.6, gaze: [0, 0.7] } });
  add({ id: "paid", a: rulesB, b: cut("rules", "maroon"), still: give + 0.42,
    cam: (_t, u) => V.push(0.14 * u), sun: { target: [1.4, 0, 3.7], reach: 6 },
    cast: (t) => [play("cap", CAPTAIN_D, cap, t, [0, 0, 0], 1.86, { seed: 5 }), play("m", MATE_D, m, t, [0, 0, 0], 1.8, { seed: 7, blink: false })],
    things: (g, c, t, _T, cam) => { hooked(g, c.m, cam);
      const from = between(c.cap.joint("wrL"), c.cap.joint("wrR")), to = between(c.m.joint("wrL"), c.m.joint("wrR")), u = smooth((t - give + 0.12) / 0.2), p = near(between(from, to, u), cam, 0.14), s = put(g, SACK(), [p[0], p[1] - 0.2 + 0.3 * Math.sin(Math.PI * u) * (u < 1 ? 1 : 0), p[2]]); s.lookAt(cam.pos[0], s.position.y, cam.pos[2]);
      for (let i = 0; i < 6; i++) tossed(g, i, [to[0], to[1] + 0.3, to[2] + 0.1], [0.3 * Math.sin(i * 1.9), 2.5 + 0.4 * (i % 3), -0.35 - 0.3 * Math.abs(Math.cos(i * 2.3))], t - give - 0.04 - i * 0.03, 0); } });
}
// 10. CHEAT THE CREW: over the captain's shoulder. He holds up the coin he has found in the man's headscarf; more fall out of it
const maroonMid = at("maroon", /^and$/) - 0.08;
{
  const V = lens(0.7, 1.62, 4.7, 0.42, -1, -7, 58), [cx, cz] = V.spot(1.3, -0.42), [px, pz] = V.spot(2.6, 0.16);
  const cap = mover(CAPTAIN_D, 1.86, cx, cz, V.toward(cx, cz, 176)); cap.stand(8);
  cap.actAt(-1, { armR: arm(118, 8, 176, 0), head: [-10, 0, 0] }, 9, { in: 0.01, handR: "grip" });
  wag(cap, 0.1, 3, P({ armR: arm(122, 8, 180, 0) }), P({ armR: arm(112, 8, 170, 0) }), 0.3, { handR: "grip" });
  const pir = mover(PIRATE_D, 1.76, px, pz, V.toward(px, pz, 4)); pir.stand(8);
  pir.actAt(-1, { armL: arm(40, 26, 112, 34), armR: arm(40, 26, 112, 34), lean: -9, py: -0.05, head: [0, 6, 4] }, 9, { in: 0.01, handL: "open", handR: "open", face: { smile: 0.38, mouth: 0.5, brow: 1, wide: 0.9, lid: 0, gaze: [-0.5, -0.3] } });
  wag(pir, 0.2, 3, P({ roll: 3, py: -0.06 }), P({ roll: -3, py: -0.04 }), 0.22);
  add({ id: "cheat", a: cut("rules", "maroon"), b: maroonMid, still: 0.7,
    cam: (_t, u) => V.push(0.08 * u), sun: { target: [1.6, 0, 2.6], reach: 5 },
    cast: (t) => [play("pir", PIRATE_D, pir, t, [0, 0, 0], 1.76, { seed: 8, blink: false }), play("cap", CAPTAIN_D, cap, t, [0, 0, 0], 1.86, { seed: 5 })],
    things: (g, c, t, _T, cam) => { const p = near(c.cap.joint("tipR"), cam, -0.06), k = put(g, COINS[7](), [p[0], p[1] + 0.05, p[2]]); k.scale.setScalar(1.5); k.rotation.set(Math.PI / 2, 0, 0);
      const s = near(c.pir.joint("skull"), cam, 0.08); for (let i = 0; i < 4; i++) tossed(g, i, [s[0] + 0.14, s[1] + 0.1, s[2]], [0.5 + 0.2 * i, 0.9, 0.1], (t + 0.25 - i * 0.22) % 1.1, 0); } });
}
// 11. AND YOU WERE LEFT ON AN EMPTY ISLAND: the same man alone on the sand under the one palm, with the bottle they left him,
//     running to the water's edge and waving after the ship
{
  const [ix, iy, iz] = SHIP.island, top = (x: number, z: number) => iy - 0.3 + 0.95 * Math.sqrt(Math.max(0, 1 - ((x - ix) / 5.2) ** 2 - ((z - iz) / 3.8) ** 2));
  const V = lens(ix + 0.75, iy + 1.25, iz + 4.1, -0.1, -1, 4, 46);
  const pir = mover(PIRATE_D, 1.76, ix + 0.2, iz - 0.9, 0); pir.walk(mt(pir, 1.9), { run: true }).stand(6);
  pir.actAt(-1, { armL: arm(150, 30, 176, 10), armR: arm(150, 30, 176, 10) }, 9, { in: 0.01, handL: "open", handR: "open", face: { wide: 1, lid: 0, brow: 1, mouth: 0.8, smile: -0.8, gaze: [0, -0.2] } });
  wag(pir, 0, 5, P({ armL: arm(156, 34, 176, 24), armR: arm(156, 8, 178, -10) }), P({ armL: arm(156, 8, 178, -10), armR: arm(156, 34, 176, 24) }), 0.44, { handL: "open", handR: "open" });
  add({ id: "island", a: maroonMid, b: cut("maroon", "answer"), still: 1.25,
    cam: (_t, u) => V.push(-0.25 * u), sun: { target: [ix, iy, iz], reach: 8 },
    cast: (t) => { const a = play("pir", PIRATE_D, pir, t, [0, 0, 0], 1.76, { seed: 8, blink: false }); a.at[1] = top(a.at[0], a.at[2]) - 0.02; return [a]; },
    things: (g) => { const [bx, bz] = V.spot(3.1, 0.44); const b = put(g, BOTTLE(), [bx, top(bx, bz) - 0.02, bz]); b.rotation.z = 0.12; } });
}
// 12. BUT THE PLANK? ALMOST NEVER RECORDED: from the plank, looking back at the ship. The captain shakes his head and wags a finger,
//     then comes for the lens with both hands
const answerMid = at("answer", /^Unwanted/) - 0.2;
{
  const V = lens(5.2, PL.y + 0.3, PL.z, -1, 0, 15, 60), go = at("answer", /^recorded/) + 0.25 - cut("maroon", "answer");
  const cap = mover(CAPTAIN_D, 1.86, 2.75, PL.z, 90); cap.stand(go).walk(mt(cap, 0.9)).stand(4);
  cap.actAt(-1, { armL: arm(30, 40, 100, 50), armR: arm(30, 40, 100, 50), head: [0, 10, 0], lean: 2 }, 1.1, { in: 0.01, out: 0.2, handL: "open", handR: "open", face: { brow: 1, lid: 0.1, smile: -0.4, gaze: [0, 0.8] } });
  cap.actAt(0.85, { armR: arm(60, 16, 150, 4), armL: arm(-10, 20, 30, 30), head: [0, 6, 0] }, go - 0.75, { in: 0.2, out: 0.15, handR: "point", handL: "fist", face: { brow: -0.6, lid: 0.25, smile: -0.5, gaze: [0, 0.6] } });
  wag(cap, 1.0, go - 1.0, P({ head: [24, 6, 0], armR: arm(60, 30, 150, 24) }), P({ head: [-24, 6, 0], armR: arm(60, 2, 150, -18) }), 0.44, { handR: "point" });
  cap.actAt(go, { armL: arm(70, 24, 60, 10), armR: arm(70, 24, 60, 10), lean: 20, head: [0, 14, 0] }, 9, { in: 0.25, antic: 0.5, over: 1.5, handL: "open", handR: "open", face: { brow: -1, lid: 0, smile: 0.7, mouth: 0.4, gaze: [0, 0.8] } });
  add({ id: "never", a: cut("maroon", "answer"), b: answerMid, still: 1.5,
    cam: (t) => V.push(-0.2 * smooth((t - go) / 0.6), 0, 6 * smooth((t - go) / 0.6)), sun: { target: [2, 0, 0.6], reach: 6 },
    cast: (t) => [play("cap", CAPTAIN_D, cap, t, [0, 0.02, 0], 1.86, { seed: 5 })] });
}
// 13. UNWANTED MEN SIMPLY WENT OVER THE SIDE: from astern, low over the water. The captain carries him to the rail over his head and
//     heaves; the lens follows him as he turns over in the air and goes in with a splash
const SPLASH: V3 = [4.7, SEA, 2.6];
const heave = at("answer", /^simply/) + 0.05 - answerMid, fly = 1.2, hit = answerMid + heave + fly;
{
  const POS: V3 = [3.7, 0.5, 8.0];
  const cap = mover(CAPTAIN_D, 1.86, 1.3, SPLASH[2], 90); cap.walk(mt(cap, 0.95)).stand(6);
  cap.actAt(-1, { armL: arm(166, 16, 184, 4), armR: arm(166, 16, 184, 4), lean: -4 }, heave + 0.02, { in: 0.01, out: 0.1, handL: "open", handR: "open", face: { brow: -1, lid: 0.2, smile: 0.36 } });
  cap.actAt(heave - 0.3, { armL: arm(190, 16, 200, 4), armR: arm(190, 16, 200, 4), lean: -16, py: -0.08 }, 0.3, { in: 0.2, out: 0.06, antic: 0, over: 1, handL: "open", handR: "open" });
  cap.actAt(heave, { armL: arm(104, 16, 100, 4), armR: arm(104, 16, 100, 4), lean: 22, pz: 0.1 }, 0.5, { in: 0.1, out: 0.3, antic: 0, over: 1.8, handL: "open", handR: "open" });
  cap.actAt(heave + 0.6, { armL: arm(40, 14, 110, -30), armR: arm(40, 14, 110, -30), head: [0, 12, 0] }, 9, { in: 0.25, handL: "open", handR: "open", face: { smile: 0.38, brow: 0.5, lid: 0.2, gaze: [0, 0.6] } });
  wag(cap, heave + 0.8, 3, P({ armL: arm(46, 14, 118, -36) }), P({ armL: arm(36, 14, 100, -20) }), 0.24, { handL: "open", handR: "open" });
  const sir = mover(SIR_D, 1.8, 0, 0, 90); sir.stand(9);
  sir.actAt(-1, { armL: arm(70, 60, 110, 70), armR: arm(140, 50, 170, 40), legL: { th: [40, 14], sh: [-30, 0], pitch: 20 }, legR: { th: [-24, 10], sh: [-70, 0], pitch: 30 }, head: [0, -10, 0] }, 9, { in: 0.01, handL: "open", handR: "open", face: { wide: 1, lid: 0, brow: 1, mouth: 1 } });
  wag(sir, 0, 5, P({ legL: { th: [-20, 14], sh: [-60, 0], pitch: 20 }, legR: { th: [44, 10], sh: [-26, 0], pitch: 30 }, armL: arm(140, 50, 170, 40), armR: arm(70, 60, 110, 70) }), P({ legL: { th: [40, 14], sh: [-30, 0], pitch: 20 }, legR: { th: [-24, 10], sh: [-70, 0], pitch: 30 } }), 0.4, { handL: "open", handR: "open" });
  /** where the middle of him is, and how far he has turned */
  const x0 = 2.4, y0 = 2.75, flight = (t: number, cx: number): [V3, number] => { if (t < heave) return [[cx + 0.1, y0 + 0.02 * Math.sin(t * 14), SPLASH[2]], 90 + 5 * Math.sin(t * 9)]; const u = t - heave, vx = (SPLASH[0] - x0) / fly, vy = (SEA - 0.3 - y0 + 4.9 * fly * fly) / fly; return [[x0 + vx * u, y0 + vy * u - 4.9 * u * u, SPLASH[2]], 90 + 400 * u]; };
  const capX = (t: number) => 1.3 + 0.95 * smooth(t / (heave - 0.25));
  add({ id: "over", a: answerMid, b: cut("answer", "origin"), still: heave + 0.92,
    // the lens holds the two of them, then follows him down to the water
    cam: (t) => { const [p] = flight(Math.min(t, heave + fly), capX(t)), k = smooth((t - heave + 0.1) / 0.5), look: V3 = [p[0] * k + (capX(t) + 0.2) * (1 - k), Math.max(SEA + 0.75, p[1] - 0.2) * k + 1.75 * (1 - k), SPLASH[2]]; return { pos: POS, look, fov: 42 }; },
    sun: { target: [3.5, 0, 2.6], reach: 7 },
    cast: (t, T) => { const c = play("cap", CAPTAIN_D, cap, t, [0, 0, 0], 1.86, { seed: 5 }), [p, spin] = flight(t, c.at[0]);
      return t > heave + fly + 0.05 ? [c] : [c, { ...play("sir", SIR_D, sir, t, [0, 0, 0], 1.8, { talk: talk(W, T, ["answer"]), blink: false }), at: p, spin }]; },
    things: (g, _c, t) => { splash(g, SPLASH, t - heave - fly, 1.3); circling(g, 6.9, 0.2, 0.7, t, 1.2, 1); } });
}
// 14. THE PLANK COMES FROM STORIES: at the water. He comes up spouting, the book he had in his pocket held high and dry; the fin turns
//     toward him
const originMid = at("origin", /^like$/) - 0.1;
{
  const [wx, , wz] = SPLASH, V = lens(wx + 0.2, SEA + 1.15, wz + 2.6, -0.08, -1, -14, 46), t0 = cut("answer", "origin");
  const sir = mover(SIR_D, 1.8, wx, wz, V.toward(wx, wz, -8)); sir.stand(9);
  sir.actAt(-1, { armL: arm(40, 60, 80, 70), armR: arm(160, 20, 184, 0), head: [0, -8, 0] }, 9, { in: 0.01, handL: "open", handR: "grip", face: { wide: 0.6, lid: 0, brow: 1, mouth: 0.5, gaze: [0.3, -0.4] } });
  wag(sir, 0, 4, P({ armL: arm(40, 76, 70, 96) }), P({ armL: arm(40, 50, 96, 50) }), 0.5, { handL: "open" });
  const bob = (t: number) => SEA - 1.48 + 0.34 * smooth(t / 0.3) + 0.05 * Math.sin(t * 5);
  add({ id: "stories2", a: t0, b: originMid, still: 1.0,
    cam: (_t, u) => V.push(0.1 * u), sun: { target: [wx, SEA, wz], reach: 6 },
    cast: (t, T) => [play("sir", SIR_D, sir, t, [0, bob(t), 0], 1.8, { talk: Math.max(talk(W, T, ["origin"]), t < 0.5 ? 0.8 : 0), blink: false })],
    things: (g, c, t, _T, cam) => { const a = c.sir, p = near(a.joint("tipR"), cam, 0.05), k = put(g, BOOK_T(), [p[0], p[1] + 0.2, p[2]]); k.lookAt(cam.pos[0], p[1] + 0.2, cam.pos[2]);
      const f = put(g, FOAM2(), [wx, SEA + 0.03, wz]); f.scale.setScalar(1.25 + 0.1 * Math.sin(t * 5));
      // what he spits out, in an arc
      if (t < 0.9) { const m = near(a.joint("skull"), cam, 0.2); for (let i = 0; i < 8; i++) { const u = i / 8; g.add(mesh(ball(0.03, 6), "#bfe3fb", { at: [m[0] - 0.12 - 0.5 * u, m[1] - 0.2 + 0.5 * u - 0.9 * u * u, m[2]], line: 0, shadow: false })); } }
      shark(g, wx + 0.72 - 0.3 * t, wz - 1.7 + 0.1 * t, -75, t); } });
}
// 15. LIKE TREASURE ISLAND AND PETER PAN: back on deck, dripping. He holds his book up; the captain pulls out his own and beams
{
  const V = lens(1.9, 1.3, 4.6, -0.05, -1, 4, 54), [qx, qz] = V.spot(3.0, -0.3), [cx, cz] = V.spot(3.6, 0.5), tI = at("origin", /Treasure/) - originMid, tP = at("origin", /Peter/) - originMid;
  const sir = mover(SIR_D, 1.8, qx, qz, V.toward(qx, qz, 8)); sir.stand(9);
  sir.actAt(-1, { armL: arm(30, 10, 70, -16), armR: arm(30, 10, 70, -16), head: [10, 6, 0] }, tI + 0.3, { in: 0.01, out: 0.2, handL: "grip", handR: "grip", face: { smile: 0.6, brow: 0.6, gaze: [0.6, 0] } });
  sir.actAt(tI - 0.1, { armL: arm(34, 10, 92, -20), armR: arm(34, 10, 92, -20), head: [10, -4, 0], lean: -3 }, 9, { in: 0.24, antic: 0.4, over: 2, handL: "grip", handR: "grip", face: { smile: 1, brow: 1, lid: 0.1, gaze: [0.7, -0.2] } });
  const cap = mover(CAPTAIN_D, 1.86, cx, cz, V.toward(cx, cz, -12)); cap.stand(9);
  cap.actAt(-1, { armR: arm(30, 10, 110, -40), armL: arm(10, 12, 30, 0), head: [-14, 4, 0] }, tP + 0.3, { in: 0.01, out: 0.2, handR: "grip", face: { brow: 0.8, lid: 0.1, gaze: [-0.8, 0.2] } });
  cap.actAt(tP - 0.12, { armR: arm(164, 10, 182, 0), head: [-8, -6, 0], py: 0.02 }, 9, { in: 0.24, antic: 0.5, over: 2.2, handR: "grip", face: { smile: 1, wide: 0.5, lid: 0, brow: 1, mouth: 0.5, gaze: [-0.4, -0.6] } });
  add({ id: "books", a: originMid, b: END, still: tP + 0.45,
    cam: (_t, u) => V.push(0.14 * u), sun: { target: [1.5, 0, 1.6], reach: 6 },
    cast: (t, T) => [play("cap", CAPTAIN_D, cap, t, [0, 0, 0], 1.86, { seed: 5, blink: false }), play("sir", SIR_D, sir, t, [0, 0, 0], 1.8, { talk: talk(W, T, ["origin"]) })],
    things: (g, c, t, _T, cam) => {
      const hold = (b: THREE.Object3D, p: V3, up: number) => { const q = near(p, cam, 0.08); put(g, b, [q[0], q[1] + up, q[2]]); b.lookAt(cam.pos[0], q[1] + up, cam.pos[2]); };
      hold(BOOK_T(), between(c.sir.joint("wrL"), c.sir.joint("wrR")), 0.02); if (t > tP - 0.2) hold(BOOK_P(), c.cap.joint("tipR"), 0.18);
      drips(g, c.sir, t, cam); g.add(mesh(ball(1, 14), "#9fd4f6", { at: [c.sir.at[0], 0.012, c.sir.at[2]], scale: [0.5, 0.01, 0.34], line: 0.5, shadow: false })); } });
}

export const PIRATE_PLANK: Film = {
  id: "pirate-plank", fps: 30, seconds: END, sky: "#9fd6ff", world: pirateShip, shots, words: W,
  hook: { text: ["DID PIRATES", "MAKE YOU WALK", "THE PLANK?"], a: 0, b: L.hook.b + 0.2, size: 96 },
  sign: { text: "Dramatised. The rules are from pirate articles printed in 1724.", a: rulesB + 0.3, b: rulesB + 2.3 },
  hits: [{ t: hit, amp: 1, dur: 0.4 }], audio: "craft/pirate-plank.wav",
};
