// Roberts' bedtime (Emu look): the shots, in the order of the approved action list (granskning/roberts-emu/stopp-1.md, the reviewer's yes
// 28 Nov with his one list): something new every 1-2 s, faces acting, the young pirate never with a drink.
import React from "react";
import { Audio, staticFile } from "remotion";
import { Pen, fxPuff, fxStars, fxBurst, INK, bodyFront, type FrontOpts } from "../emu/toon";
import { ShotView, SPECS, proj, clamp, ease, lerp, useT, W as W_, H as H_, type Shot, type Actor, type P2 } from "./engine";
/** a swinging pirate on the prize-taking ropes (c2), drawn straight in the picture */
const bodyFrontQuick = (p: Pen, i: number, t: number) => bodyFront(p, crew(200 + i), { mode: "fall", cheer: 1, expr: "laugh", facing: 1, light: 2.6, phase: t });
import { ROBERTS, RUM, YOUNG, GUNNER, crew, crowdPlaces, rnd, mug, bottle, watch, fiddle, teacup, teapot, articles, book, hourglass, WORDS, talkOf } from "./cast";

const L0 = 2.6;      // (the key light's angle in the plates: the moon and lanterns over the port side)
const stand = (o: Partial<FrontOpts> = {}): FrontOpts => ({ mode: "stand", light: L0, ...o });
const still = (x: number, y: number) => () => [x, y] as [number, number];
/** a partying crew member: arms going up and down with a mug in the raised hand, a jig's bounce, laughing */
const reveller = (i: number, at: [number, number], withMug = true): Actor => { const sp = 5 + 3 * rnd(i, 3), ph = 6.28 * rnd(i, 4);
  return { o: crew(i), h: 1.55 + 0.3 * rnd(i, 5), at: () => at, lift: (t) => 0.06 * Math.abs(Math.sin(t * sp + ph)),
    f: (t) => stand({ mode: rnd(i, 6) < 0.4 ? "march" : "stand", phase: t * 1.6 + ph, cheer: 0.55 + 0.45 * Math.sin(t * sp * 0.5 + ph), expr: (["laugh", "grin", "laugh", "smile"] as const)[i % 4], facing: rnd(i, 7) < 0.5 ? -1 : 1 }),
    hold: withMug ? (p, h, t) => mug(p, h[1], 10 * Math.sin(t * sp + ph)) : undefined }; };

// ---- a1 (0.0-1.2): wide, the deck full of partying pirates; a fiddle, a jig, mugs up ----
const A1_PLACES = crowdPlaces(26, -4.6, 2.8, -1.85, 1.85, 11);
const a1: Shot = { id: "a1", blur: 2, focus: 5.5, drift: [1.06, 1.12, 0, -20], capY: 1460,
  actors: [...A1_PLACES.map((q, i) => reveller(i, q, i % 5 !== 2)),
    { o: crew(40), h: 1.7, at: still(1.4, 0.9), f: (t) => stand({ expr: "laugh", facing: -1, reachL: [230, 470], reachR: [380, 520] }), hold: (p, h, t) => fiddle(p, h[0], h[1], t) },
    { o: RUM, h: 1.62, at: still(0.4, -0.9), lift: (t) => 0.08 * Math.abs(Math.sin(t * 9)), f: (t) => stand({ mode: "march", phase: t * 3, cheer: 1, expr: "laugh", facing: 1 }), hold: (p, h, t) => mug(p, h[1], 15 * Math.sin(t * 9)), sharp: true },
    { o: YOUNG, h: 1.48, at: still(1.6, -1.2), lift: (t) => 0.1 * Math.abs(Math.sin(t * 10)), f: (t) => stand({ mode: "march", phase: t * 4, cheer: 0.5 + 0.5 * Math.sin(t * 10), expr: "grin", facing: -1 }), sharp: true },
    { o: GUNNER, h: 1.78, at: still(-0.6, 0.5), f: (t) => stand({ cheer: 1, expr: "laugh", facing: 1 }), hold: (p, h, t) => mug(p, h[1], -10 + 20 * Math.sin(t * 6)) }] };

// ---- a2 (1.2-2.4): Roberts by the barrel's lantern checks his watch, takes a breath, blows; the lantern dies (plate 2 at 1.0) ----
const LAMP7: [number, number, number] = [-0.34, -1.74, 1.08];
const a2: Shot = { id: "a2", blur: 3, focus: 3, drift: [1.0, 1.06, 10, 0], capY: 1500,
  actors: [{ o: ROBERTS, h: 1.86, at: still(-0.96, -1.36), sharp: true,
    f: (t) => stand({ facing: 1, look: 0.6, expr: t < 0.45 ? "stern" : t < 0.75 ? "shock" : "whistle", headTilt: t < 0.45 ? 8 : t < 0.75 ? -4 : 6, reachR: t < 0.45 ? [380, 470] : undefined }),
    hold: (p, h, t) => { if (t < 0.45) watch(p, h[1]); },
    fx: (p, t, toD) => { if (t < 0.75 || t > 1.15) return; const m: P2 = [262, 320], q = proj("a2", LAMP7), l = toD([q[0], q[1]]), u = (t - 0.75) / 0.4;
      for (let i = 0; i < 3; i++) { const v = clamp(u * 1.3 - i * 0.15); if (v <= 0) continue; const x = lerp(m[0], l[0], v), y = lerp(m[1], l[1], v) + (i - 1) * 14; p.g.globalAlpha = 0.9 * (1 - v * 0.6); p.stroke([[x + 20, y], [x - 20, y + 4]], 7, "#eaf2ff"); p.g.globalAlpha = 1; } } }] };

// ---- a3 (2.4-3.6): the young pirate hangs on the bell rope, swinging; the bell rings ----
const BELL: [number, number, number] = [2.38, -1.14, 1.62];
const a3: Shot = { id: "a3", blur: 2.5, focus: 2.4, drift: [1.02, 1.08, 0, 10], capY: 1500,
  actors: [{ o: YOUNG, h: 1.48, at: (t) => [2.38 + 0.12 * Math.sin(t * 7), -0.98], lift: (t) => 0.22 + 0.08 * Math.sin(t * 7 + 1), rot: (t) => 8 * Math.sin(t * 7), sharp: true,
    f: (t) => stand({ mode: "fall", expr: t % 0.6 < 0.3 ? "grin" : "shock", facing: 1, cheer: 1 }),
    hold: (p, h, t, toD) => { const q = proj("a3", BELL), b = toD([q[0], q[1]]), mid: P2 = [h[1][0], h[1][1] + 6];
      p.stroke([b, mid, [mid[0], mid[1] + 40]], 16, INK); p.stroke([b, mid, [mid[0], mid[1] + 40]], 9, "#c9b48a"); },
    fx: (p, t, toD) => { const q = proj("a3", BELL), b = toD([q[0], q[1]]), u = (t * 7) % 2; if (u < 1) { p.g.globalAlpha = 1 - u; for (const r of [90, 140]) p.arc(b[0], b[1], r + 40 * u, r + 40 * u, 200, 340, 9, "#ffe9a8"); p.g.globalAlpha = 1; } } }] };

// ---- a4 (3.6-4.8): high from the bow, the starboard lanterns go out pang-pang-pang; the crew below groan, slumping at each ----
const A4_LAMPS: [number, number, number][] = [[-3.0, 2.2, 1.0], [0.0, 2.2, 1.0], [3.0, 2.2, 1.0]], A4_AT = [0.15, 0.5, 0.85];
const A4_PLACES = crowdPlaces(12, -2.5, 4.5, -1.6, 1.2, 31);
const a4: Shot = { id: "a4", blur: 2, focus: 5, drift: [1.04, 1.1, 0, 0], capY: 1480,
  actors: A4_PLACES.map((q, i): Actor => ({ o: crew(60 + i), h: 1.6 + 0.25 * rnd(i, 9), at: () => q,
    f: (t) => { const n = A4_AT.filter((a) => t > a).length; return stand({ expr: n === 0 ? "grin" : n < 3 ? "pained" : "nervous", shrug: n > 0 ? clamp((t - A4_AT[n - 1]) * 8) : 0, headTilt: 4 * n, facing: rnd(i, 3) < 0.5 ? -1 : 1 }); } })),
  over: (g, t) => { A4_LAMPS.forEach((L, j) => { const u = (t - A4_AT[j]) / 0.35; if (u <= 0 || u >= 1) return; const q = proj("a4", L); g.save(); g.translate(q[0], q[1]); const p = new Pen(g); g.scale(0.5, 0.5); fxPuff(p, u); g.restore(); }); } };

// ---- a5 (4.8-6.0): pitch black, only eyes: 30 pairs blinking and looking about ----
const EYES = Array.from({ length: 30 }, (_, i) => ({ x: 90 + 900 * rnd(i, 1), y: 420 + 1100 * rnd(i, 2), s: 0.6 + 0.7 * rnd(i, 3), b: rnd(i, 4) * 1.2 }));
const a5: Shot = { id: "a4", black: true, actors: [], capY: 1640,
  over: (g, t) => { for (const e of EYES) { const blink = Math.abs(((t + e.b) % 1.2) - 0.1) < 0.06, look = Math.sin(t * 3 + e.b * 5) * 5 * e.s;
    for (const sd of [-1, 1]) { const x = e.x + sd * 22 * e.s; g.fillStyle = "#f4f2ea"; g.beginPath(); g.ellipse(x, e.y, 14 * e.s, (blink ? 2 : 18) * e.s, 0, 0, 7); g.fill();
      if (!blink) { g.fillStyle = "#111"; g.beginPath(); g.arc(x + look, e.y + 3 * e.s, 7 * e.s, 0, 7); g.fill(); } } } } };

// ---- a6 (6.0-7.4): close: the rum pirate squints into his mug, turns it upside down, the last drop lands on his nose ----
const a6: Shot = { id: "a6", blur: 3, focus: 2.7, drift: [1.0, 1.05, 0, 10], capY: 1560, tint: "rgba(10,18,50,0.25)", moon: true,
  actors: [{ o: RUM, h: 1.62, at: still(-2.62, 0.93), sharp: true, talk: (t) => talkOf(["d3"], t + 6.0),
    f: (t) => stand({ facing: 1, expr: t < 0.7 ? "nervous" : t < 1.05 ? "shock" : "dazed", look: 0.6, headTilt: t < 0.7 ? 10 : 2, reachR: [400, 640] }),
    hold: (p, h, t) => { const up = ease((t - 0.6) / 0.3); mug(p, h[1], 180 * up, false, 0.6); },
    fx: (p, t) => { if (t < 0.95) return; const u = clamp((t - 0.95) / 0.25), y = lerp(560, 330, 1 - u) ; void y; const yy = lerp(600, 320, u); if (u < 1) p.ell(400 - 120 * u, yy, 10, 14, "#b0682a", 3); } }] };

// ---- a7 (7.4-8.8): in the dark two pirates walk into each other; one drops his mug, it flies glinting in the moonlight ----
const a7: Shot = { id: "a7", blur: 2.5, focus: 3.2, drift: [1.02, 1.06, 0, 0], capY: 1500, tint: "rgba(8,14,40,0.30)", moon: true,
  // (they walk into each other body to body, bounce back a step and sit down hard on the deck, stars round their heads)
  actors: ([[[-3.35, 0.15], [-2.9, 0.57], [-2.98, 0.49], 1], [[-1.95, 1.3], [-2.41, 0.92], [-2.33, 0.99], -1]] as [[number, number], [number, number], [number, number], 1 | -1][]).map(([s0, s1, s2, fc], i): Actor => ({
    o: crew(70 + i), h: i ? 1.75 : 1.7, sharp: true,
    at: (t) => (t < 0.6 ? [lerp(s0[0], s1[0], ease(t / 0.6)), lerp(s0[1], s1[1], ease(t / 0.6))] : [lerp(s1[0], s2[0], ease((t - 0.6) / 0.2)), lerp(s1[1], s2[1], ease((t - 0.6) / 0.2))]),
    lift: (t) => (t > 0.62 && t < 0.82 ? 0.1 * Math.sin(((t - 0.62) / 0.2) * Math.PI) : 0),
    f: (t) => (t < 0.6 ? stand({ mode: "march", phase: t * 3, expr: "nervous", facing: fc, reachR: i ? undefined : [470, 520] }) : stand({ mode: t < 0.68 ? "stand" : "sit", expr: t < 0.75 ? "shock" : "dazed", facing: fc })),
    hold: (p, h, t) => { if (!i && t < 0.6) mug(p, h[1], 0, true, 0.7); }, fx: (p, t) => { if (t > 0.8) { p.g.save(); p.g.translate(0, 300); fxStars(p, (t - 0.8) * 2); p.g.restore(); } } })),
  over: (g, t) => { if (t < 0.6) return; const u = clamp((t - 0.6) / 0.8), a = proj("a7", [-2.7, 0.75, 1.1]), x = a[0] + 30 * u, y = a[1] - 1050 * u;
    if (t > 0.6 && t < 0.75) { g.save(); g.translate(a[0], a[1]); const p = new Pen(g); g.scale(0.6, 0.6); fxBurst(p, (t - 0.6) / 0.15); g.restore(); }
    g.save(); g.translate(x, y); g.rotate(u * 9); g.scale(0.9, 0.9); mug(new Pen(g), [0, 0], 0, false, 0.9); g.restore(); } };

// ---- b1 (8.8-10.3): the articles unrolled with a snap; Roberts' finger taps rule IV and it is ringed in red ----
const b1: Shot = { id: "b1", blur: 9, drift: [1.0, 1.05, 0, 0], tint: "rgba(8,14,40,0.35)", capY: 1560, actors: [],
  over: (g, t) => { const u = ease(t / 0.35); articles(g, 540, 820, 700, u, clamp((t - 0.9) / 0.3));
    if (t > 0.55) { const k = clamp((t - 0.55) / 0.3), x = lerp(1180, 600, ease(k)), y = lerp(1300, 1000, ease(k)) + (t > 0.85 && t < 1.0 ? 14 : 0);      // (Roberts' red sleeve and his finger coming in from the right)
      g.save(); g.lineCap = "round"; g.strokeStyle = "#241726"; g.lineWidth = 92; g.beginPath(); g.moveTo(1300, 1500); g.lineTo(x + 60, y + 40); g.stroke(); g.strokeStyle = "#a8262c"; g.lineWidth = 74; g.stroke();
      g.fillStyle = "#ffe2c2"; g.strokeStyle = "#241726"; g.lineWidth = 10; g.beginPath(); g.ellipse(x, y, 44, 40, 0, 0, 7); g.fill(); g.stroke(); g.beginPath(); g.ellipse(x - 60, y - 14, 40, 16, -0.3, 0, 7); g.fill(); g.stroke(); g.restore(); } } };

// ---- b2 (10.3-11.7): low, in moonlight: Roberts up on a barrel points down at the crew, who cower ----
const b2: Shot = { id: "b2", blur: 2.5, focus: 2.8, drift: [1.0, 1.06, 0, -15], capY: 1560, tint: "rgba(8,14,40,0.15)", moon: true,
  actors: [{ o: ROBERTS, h: 1.86, at: still(-2.6, 1.75), lift: () => 0.86, sharp: true, f: (t) => stand({ facing: -1, expr: "stern", point: 1, headTilt: 8 * Math.sin(t * 6) * (t < 0.6 ? 1 : 0) }) },
    ...([[-1.9, 1.25], [-1.45, 1.55], [-2.2, 0.95]] as [number, number][]).map((q, i): Actor => ({ o: crew(80 + i), h: 1.7, at: () => q, sharp: true,
      f: (t) => stand({ expr: "nervous", shrug: clamp(t * 3 - i * 0.3), headTilt: 10, facing: 1 }), rot: (t) => -8 * clamp(t * 3 - i * 0.3) }))] };

// ---- b3/b4 (11.7-14.0): close: Roberts pours tea, little finger out; blows on it and smiles; behind him the rum pirate grimaces ----
const teaShot = (blow: boolean): Shot => ({ id: "b3", blur: 3, focus: 1.8, drift: blow ? [1.06, 1.1, 0, 0] : [1.0, 1.05, 0, 0], capY: 1600, tint: "rgba(8,14,40,0.12)", moon: true,
  actors: [{ o: ROBERTS, h: 1.86, at: still(-0.96, -1.36), sharp: true, f: (t) => stand({ facing: 1, expr: blow ? (t < 0.6 ? "whistle" : "smile_closed") : "smile", look: 0.5, headTilt: blow ? 6 : 3, reachR: [400, 600], reachL: blow ? undefined : [190, 520] }),
    hold: (p, h, t) => { teacup(p, h[1], blow ? 1 - t : 0.4); if (!blow) { teapot(p, h[0], 30 * ease(t / 0.4)); if (t > 0.35) { p.g.save(); p.g.globalAlpha = 0.9; p.stroke([[h[0][0] - 100, h[0][1] - 30], [h[1][0] - 10, h[1][1] - 40]], 6, "#7a4a2a"); p.g.restore(); } }
      if (!blow) { p.stroke([[h[1][0] + 20, h[1][1] - 10], [h[1][0] + 46, h[1][1] - 40]], 9, INK); p.stroke([[h[1][0] + 20, h[1][1] - 10], [h[1][0] + 46, h[1][1] - 40]], 5, "#ffe2c2"); } } },      // (his little finger out)
    ...(blow ? [{ o: RUM, h: 1.62, at: still(-1.95, -1.78), f: (t: number) => stand({ mode: "sit", facing: 1, expr: t < 0.4 ? "neutral" : "pained", headTilt: -6 }), hold: (p: Pen, h: P2[]) => mug(p, h[1], 0, true) } as Actor] : [])] });
const b3 = teaShot(false), b4 = teaShot(true);

// ---- b5 (14.0-15.6): the hatch bangs open; the rum pirate climbs up with his mug, grinning; two more after him ----
const RIM = (id: string): P2[] => { const q = (x: number, y: number) => proj(id, [x, y, 0.22]); const a = q(-2.1, -0.4), b = q(-1.3, -0.4), c = q(-1.3, 0.3); return [[-200, -200], [1280, -200], [1280, c[1]], [c[0], c[1]], [b[0], b[1]], [a[0], a[1]], [-200, a[1]]]; };
const climber = (o: typeof RUM, h: number, delay: number, x: number, out: [number, number], mugIn: boolean, ex: "grin" | "laugh"): Actor => ({ o, h, sharp: true,
  at: (t) => (t < delay + 0.55 ? [x, 0.0] : [lerp(x, out[0], ease((t - delay - 0.55) / 0.4)), lerp(0.0, out[1], ease((t - delay - 0.55) / 0.4))]),
  lift: (t) => (t < delay + 0.55 ? lerp(-2.0, 0.22, ease((t - delay) / 0.55)) : lerp(0.22, 0, ease((t - delay - 0.55) / 0.3))),
  clip: (t) => (t < delay + 0.6 ? RIM("b5") : null), f: (t) => stand({ mode: t > delay + 0.55 ? "march" : "stand", phase: t * 3, expr: ex, cheer: t < delay + 0.5 ? 0.8 : 0, facing: 1, reachR: mugIn && t > delay + 0.5 ? [420, 480] : undefined }),
  hold: (p, h, t) => { if (mugIn) mug(p, h[1], 0, true, 0.5); } });
const b5: Shot = { id: "b5", blur: 2, focus: 2.6, drift: [1.0, 1.05, 0, 0], capY: 1600, tint: "rgba(8,14,40,0.15)", moon: true,
  actors: [climber(RUM, 1.62, 0.05, -1.75, [-2.75, 0.35], true, "grin"), climber(crew(90), 1.7, 0.75, -1.65, [-3.05, -0.1], true, "laugh"), climber(crew(91), 1.65, 1.15, -1.8, [-2.6, 0.9], false, "grin")],
  over: (g, t) => { if (t < 0.25) { g.save(); const q = proj("b5", [-1.7, -0.05, 0.3]); g.translate(q[0], q[1]); const p = new Pen(g); g.scale(0.8, 0.8); fxBurst(p, t / 0.25); g.restore(); } } };

// ---- b6 (15.6-17.2): out on the moonlit deck they stumble; one sits down hard on his backside ----
const b6: Shot = { id: "b6", blur: 2, focus: 2.6, drift: [1.05, 1.0, 0, 0], capY: 1600, tint: "rgba(8,14,40,0.15)", moon: true,
  actors: [{ o: RUM, h: 1.62, at: (t) => [lerp(-1.0, -0.4, t / 1.6), lerp(0.9, 0.5, t / 1.6)], rot: (t) => 10 * Math.sin(t * 7), sharp: true, f: (t) => stand({ mode: "march", phase: t * 2.5, expr: "grin", facing: 1, reachR: [420, 480] }), hold: (p, h) => mug(p, h[1], 0, true, 0.5) },
    { o: crew(90), h: 1.7, at: (t) => [lerp(-1.6, -1.3, ease(t / 0.6)), lerp(1.0, 1.25, ease(t / 0.6))], sharp: true, lift: (t) => (t > 0.6 && t < 0.8 ? 0.15 * Math.sin(((t - 0.6) / 0.2) * Math.PI) : 0),
      f: (t) => (t < 0.6 ? stand({ mode: "march", phase: t * 3, expr: "laugh", facing: 1 }) : stand({ mode: "sit", expr: t < 0.9 ? "shock" : "dazed", facing: 1 })), fx: (p, t) => { if (t > 0.8) fxStars(p, (t - 0.8) * 1.5); } },
    { o: crew(91), h: 1.65, at: (t) => [lerp(-2.4, -2.6, t / 1.6), 0.85], rot: (t) => -12 * Math.sin(t * 5 + 1), sharp: true, f: (t) => stand({ mode: "march", phase: t * 2.2, expr: "grin", facing: -1 }) }] };

// ---- b7 (17.2-18.9): the gunner pours from his bottle into the rum pirate's mug, rum splashing; the young pirate tired behind, no mug ----
const b7: Shot = { id: "b7", blur: 2.5, focus: 3.0, drift: [1.0, 1.06, 0, 0], capY: 1600, tint: "rgba(8,14,40,0.12)", moon: true,
  actors: [{ o: RUM, h: 1.62, at: still(-2.515, 0.4), sharp: true, f: (t) => stand({ facing: 1, expr: "grin", look: 0.5, headTilt: 8, reachR: [430, 560] }), hold: (p, h, t) => { mug(p, h[1], 0, true, 0.4); const u = (t * 3) % 1; p.ell(h[1][0] + 30 - 40 * u, h[1][1] - 80 - 60 * u + 90 * u * u, 7, 9, "#b0682a", 3); p.ell(h[1][0] - 20 + 50 * u, h[1][1] - 80 - 40 * u + 80 * u * u, 6, 8, "#b0682a", 3); } },
    { o: GUNNER, h: 1.78, at: still(-1.778, 1.139), sharp: true, f: (t) => stand({ facing: -1, expr: "grin", look: -0.5, reachL: [160, 430] }), hold: (p, h) => bottle(p, h[0], -125) },
    { o: YOUNG, h: 1.48, at: still(-3.4, 0.35), f: (t) => stand({ facing: 1, expr: "nervous", headTilt: 10 + 4 * Math.sin(t * 3), look: 0.4 }) }] };

// ---- b8 (18.9-20.6): a thick book thumps onto the deck in a puff of dust; its pages flutter ----
const b8: Shot = { id: "b8", blur: 2, drift: [1.0, 1.04, 0, 0], capY: 1600, tint: "rgba(8,14,40,0.10)", moon: true, actors: [],
  over: (g, t) => { const q = proj("b8", [1.6, -0.5, 0]), fall = ease(t / 0.3), y = lerp(-400, q[1], fall) - (t > 0.3 && t < 0.45 ? 40 * Math.sin(((t - 0.3) / 0.15) * Math.PI) : 0);
    book(g, q[0], y, 620, clamp((t - 0.45) / 0.3), t); if (t > 0.3 && t < 0.9) { g.save(); g.translate(q[0], q[1] + 120); const p = new Pen(g); g.scale(1.4, 1.0); fxPuff(p, (t - 0.3) / 0.6); g.restore(); } } };

// ---- b9 (20.6-22.0): Roberts clasps his hands and looks hopeful; little stars twinkle round his head ----
const b9: Shot = { id: "b3", blur: 3, focus: 1.8, drift: [1.04, 1.1, 0, -20], capY: 1600, tint: "rgba(8,14,40,0.12)", moon: true,
  actors: [{ o: ROBERTS, h: 1.86, at: still(-0.96, -1.36), sharp: true, f: (t) => stand({ facing: 1, expr: "relief", look: 0.3, headTilt: -6 + 3 * Math.sin(t * 4), reachL: [270, 560], reachR: [330, 560] }),
    fx: (p, t) => { p.g.save(); p.g.translate(300, 120); fxStars(p, (t * 0.8) % 1); p.g.restore(); } }] };

// ---- b10 (22.0-23.3): Roberts turns an hourglass over; behind him two pirates glance at each other ----
const b10: Shot = { id: "b3", blur: 3, focus: 1.8, drift: [1.1, 1.04, 0, 0], capY: 1600, tint: "rgba(8,14,40,0.12)", moon: true,
  actors: [{ o: ROBERTS, h: 1.86, at: still(-0.8, -1.5), sharp: true, f: () => stand({ facing: 1, expr: "stern", look: 0.6, reachR: [410, 730] }), hold: (p, h, t) => hourglass(p, h[1], 180 * ease(t / 0.4), clamp((t - 0.4) / 1.0)) },
    { o: crew(92), h: 1.7, at: still(-1.7, -1.9), f: (t) => stand({ mode: "sit", facing: t < 0.6 ? 1 : -1, expr: "grin", look: t < 0.6 ? 0.8 : -0.8 }) },
    { o: crew(93), h: 1.66, at: still(-2.05, -1.95), f: (t) => stand({ mode: "sit", facing: t < 0.7 ? -1 : 1, expr: "grin", look: t < 0.7 ? -0.8 : 0.8 }) }] };

// ---- b11 (23.3-24.3): smash cut: the moonlit deck partying wilder than before ----
const B11 = crowdPlaces(32, -4.8, 3.2, -1.9, 1.9, 51);
const b11: Shot = { id: "b11", blur: 2, focus: 5.5, drift: [1.12, 1.0, 0, 0], capY: 1460, tint: "rgba(8,14,40,0.10)", moon: true,
  actors: [...B11.map((q, i) => { const r = reveller(100 + i, q, (i % 4) !== 1); return { ...r, lift: (t: number) => 0.14 * Math.abs(Math.sin(t * 11 + i)) }; }),
    { o: RUM, h: 1.62, at: still(0.4, -0.9), lift: (t) => 0.2 * Math.abs(Math.sin(t * 12)), sharp: true, f: (t) => stand({ mode: "march", phase: t * 5, cheer: 1, expr: "laugh", facing: 1 }), hold: (p, h, t) => mug(p, h[1], 25 * Math.sin(t * 12), true, 0.5) }] };

// ---- small toon props and effects drawn in the picture or in a holder's design space ----
const keg = (p: Pen, c: P2, w: number, open: number) => { p.poly([[c[0] - w / 2, c[1] - w * 0.9], [c[0] + w / 2, c[1] - w * 0.9], [c[0] + w * 0.56, c[1] - w * 0.45], [c[0] + w / 2, c[1]], [c[0] - w / 2, c[1]], [c[0] - w * 0.56, c[1] - w * 0.45]], "#8a5a30", 7);
  for (const f of [0.22, 0.68]) p.stroke([[c[0] - w * 0.53, c[1] - w * 0.9 * (1 - f)], [c[0] + w * 0.53, c[1] - w * 0.9 * (1 - f)]], 7, "#3a3a3a");
  p.ell(c[0], c[1] - w * 0.9, w / 2, w * 0.12, open > 0.5 ? "#3a1a0a" : "#a06a38", 6); };
const pin = (p: Pen, h: P2, a: number) => { const g = p.g; g.save(); g.translate(h[0], h[1]); g.rotate((a * Math.PI) / 180); p.poly([[-10, 20], [10, 20], [14, -110], [0, -130], [-14, -110]], "#a06a38", 6); g.restore(); };
const cutlass = (p: Pen, h: P2, a: number) => { const g = p.g; g.save(); g.translate(h[0], h[1]); g.rotate((a * Math.PI) / 180); p.poly([[-6, -10], [6, -10], [16, -200], [-2, -230], [-8, -200]], "#d8dde2", 6); p.poly([[-26, -10], [26, -10], [26, 4], [-26, 4]], "#e9b93a", 5); g.restore(); };
const telescope = (p: Pen, h: P2, a: number) => { const g = p.g; g.save(); g.translate(h[0], h[1]); g.rotate((a * Math.PI) / 180); p.poly([[-14, 0], [14, 0], [10, -150], [-10, -150]], "#7a4a22", 6); p.poly([[-16, -150], [16, -150], [16, -170], [-16, -170]], "#e9b93a", 5); g.restore(); };
const hatFly = (g: CanvasRenderingContext2D, x: number, y: number, r: number, col: string) => { g.save(); g.translate(x, y); g.rotate(r); g.fillStyle = col; g.strokeStyle = INK; g.lineWidth = 8; g.beginPath(); g.moveTo(-60, 10); g.quadraticCurveTo(0, -60, 60, 10); g.closePath(); g.fill(); g.stroke(); g.restore(); };
const zzz = (g: CanvasRenderingContext2D, x: number, y: number, t: number, s = 1) => { g.save(); g.font = `900 ${Math.round(52 * s)}px 'Arial Black', Arial`; g.fillStyle = "#f4f2ea"; g.strokeStyle = INK; g.lineWidth = 8; g.textAlign = "center";
  for (let i = 0; i < 3; i++) { const u = (t * 0.9 + i / 3) % 1; g.globalAlpha = Math.sin(Math.PI * u); g.strokeText("z", x + 30 * u * s + i * 10, y - 120 * u * s); g.fillText("z", x + 30 * u * s + i * 10, y - 120 * u * s); } g.restore(); };
const smoke = (g: CanvasRenderingContext2D, x: number, y: number, u: number, r: number, col = "rgba(225,225,225,") => { for (let i = 0; i < 9; i++) { const a = (i / 9) * 6.28, d = r * u * (0.6 + 0.4 * Math.sin(i * 7)); g.fillStyle = col + (0.75 * (1 - u * 0.6)) + ")"; g.beginPath(); g.arc(x + Math.cos(a) * d, y + Math.sin(a) * d * 0.6 - 30 * u, r * (0.35 + 0.4 * u), 0, 7); g.fill(); } };
const gull = (g: CanvasRenderingContext2D, x: number, y: number, flap: number, s = 1) => { g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = INK; g.lineWidth = 7; g.fillStyle = "#f4f4f0";
  g.beginPath(); g.ellipse(0, 0, 38, 22, 0, 0, 7); g.fill(); g.stroke(); g.beginPath(); g.arc(30, -18, 16, 0, 7); g.fill(); g.stroke(); g.fillStyle = "#e9a83a"; g.beginPath(); g.moveTo(44, -18); g.lineTo(64, -14); g.lineTo(44, -10); g.fill(); g.stroke();
  g.fillStyle = "#cfd3d6"; g.beginPath(); g.moveTo(-10, -6); g.lineTo(-40, -6 - 50 * flap); g.lineTo(20, -10); g.closePath(); g.fill(); g.stroke(); g.fillStyle = INK; g.beginPath(); g.arc(34, -22, 3, 0, 7); g.fill(); g.restore(); };
const DK = "rgba(8,14,40,0.12)";

// ---- c1 (24.3-25.8): "To the captain!": a ring of mugs crash together, rum splashing; the young pirate raises a teacup and saucer ----
const C1 = crowdPlaces(9, -3.0, -0.6, -1.8, 0.6, 71, [[-1.4, -0.9]]);
const c1: Shot = { id: "c1", blur: 2.5, focus: 2.8, drift: [1.0, 1.08, 0, 0], tint: DK, moon: true,
  actors: [...C1.map((q, i): Actor => ({ o: crew(120 + i), h: 1.6 + 0.25 * rnd(i, 3), at: () => q, f: (t) => stand({ cheer: t < 0.45 ? ease(t / 0.45) : 1, expr: t > 0.45 ? "laugh" : "grin", facing: q[0] > -1.6 ? -1 : 1 }), hold: (p, h, t) => mug(p, h[1], t > 0.45 ? 20 * Math.sin((t - 0.45) * 30) * Math.exp(-(t - 0.45) * 4) : 0, true, 0.5) })),
    { o: RUM, h: 1.62, at: still(-1.4, -0.9), sharp: true, talk: (t) => talkOf(["d9"], t + 24.3), f: (t) => stand({ cheer: 1, expr: "laugh", facing: -1 }), hold: (p, h) => mug(p, h[1], 10, true, 0.7) },
    { o: YOUNG, h: 1.48, at: still(-0.75, -1.45), sharp: true, f: () => stand({ expr: "grin", facing: -1, reachR: [440, 470] }), hold: (p, h) => teacup(p, h[1], 0.3) }],
  over: (g, t) => { if (t < 0.45 || t > 0.95) return; const q = proj("c1", [-1.9, -0.4, 1.9]), u = (t - 0.45) / 0.5; for (let i = 0; i < 14; i++) { const a = (i / 14) * 6.28, d = 260 * u; g.fillStyle = "#b0682a"; g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.ellipse(q[0] + Math.cos(a) * d, q[1] + Math.sin(a) * d * 0.6 + 200 * u * u, 10, 13, 0, 0, 7); g.fill(); g.stroke(); }
    g.save(); g.translate(q[0], q[1]); const p = new Pen(g); g.scale(0.9, 0.9); fxBurst(p, u); g.restore(); } };

// ---- c2 (25.8-27.6): a captured ship alongside in the moonlight; pirates swing across to it on ropes ----
const c2: Shot = { id: "c2", blur: 1.5, drift: [1.0, 1.08, 0, -30], tint: DK, moon: true, actors: [],
  over: (g, t) => { for (let i = 0; i < 4; i++) { const u = clamp((t - i * 0.3) / 0.9); if (u <= 0) continue; const top: P2 = [260 + i * 170, 120], ang = lerp(-0.9, 0.7, ease(u)), L = 900 + 60 * i, x = top[0] + Math.sin(ang) * L, y = top[1] + Math.cos(ang) * L;
    g.strokeStyle = "#c9b48a"; g.lineWidth = 7; g.beginPath(); g.moveTo(top[0], top[1]); g.lineTo(x, y); g.stroke();
    g.save(); g.translate(x, y + 330 * 0.45); g.rotate(-ang * 0.4); g.scale(0.45, 0.45); g.translate(-300, -985); const p = new Pen(g); bodyFrontQuick(p, i, t); g.restore(); } } };

// ---- c3 (27.6-29.4): they cheer: hats flung into the air, pistols fired upwards with a bang and a puff ----
const c3: Shot = { ...c1, drift: [1.08, 1.0, 0, 0],
  actors: [...C1.map((q, i): Actor => ({ o: crew(120 + i), h: 1.6 + 0.25 * rnd(i, 3), at: () => q, lift: (t) => 0.1 * Math.abs(Math.sin(t * 9 + i)), f: (t) => stand({ cheer: 1, expr: "laugh", facing: q[0] > -1.6 ? -1 : 1, mode: "march", phase: t * 3 + i }) })),
    { o: GUNNER, h: 1.78, at: still(-1.4, -0.9), sharp: true, f: () => stand({ cheer: 1, expr: "laugh", facing: -1 }), hold: (p, h, t) => { for (const hh of h) { p.poly([[hh[0] - 8, hh[1]], [hh[0] + 8, hh[1]], [hh[0] + 10, hh[1] - 90], [hh[0] - 4, hh[1] - 96]], "#4a3a2a", 5); } } }],
  over: (g, t) => { const q = proj("c1", [-1.4, -0.9, 2.2]);
    [0.2, 0.7, 1.2].forEach((a, j) => { const u = (t - a) / 0.5; if (u > 0 && u < 1) { smoke(g, q[0] + (j - 1) * 120, q[1] - 60 * u, u, 60); if (u < 0.2) { g.save(); g.translate(q[0] + (j - 1) * 120, q[1]); const p = new Pen(g); g.scale(0.5, 0.5); fxBurst(p, u / 0.2); g.restore(); } } });
    ["#2a4f9a", "#c42a2e", "#2f7a4a", "#d9a441"].forEach((c, j) => { const u = clamp((t - 0.1 * j) / 1.4); hatFly(g, 200 + j * 230 + 40 * Math.sin(u * 6), 1100 - 1300 * u + 1100 * u * u, u * 8, c); }); } };

// ---- c4 (29.4-31.0): the young pirate staggers in with a keg; the rum pirate knocks its lid in with a belaying pin; the adults dip their mugs ----
const c4: Shot = { id: "c4", blur: 2.5, focus: 2.3, drift: [1.0, 1.06, 0, 0], tint: DK, moon: true,
  actors: [{ o: YOUNG, h: 1.48, at: (t) => [lerp(-1.0, -0.15, ease(t / 0.5)), lerp(1.3, 0.7, ease(t / 0.5))], sharp: true, rot: (t) => (t < 0.5 ? 6 * Math.sin(t * 20) : 0),
      f: (t) => stand({ mode: t < 0.5 ? "march" : "stand", phase: t * 4, expr: t < 0.5 ? "pained" : "relief", facing: -1, reachL: [230, 640], reachR: [370, 640] }), hold: (p, h, t) => { if (t < 0.5) keg(p, [300, 760], 220, 0); } },
    { o: RUM, h: 1.62, at: still(-0.25, 0.2), sharp: true, f: (t) => stand({ facing: 1, expr: t < 0.9 ? "grin" : "laugh", reachR: t < 0.9 ? [460, 260 + 260 * ease((t - 0.55) / 0.25)] : undefined, reachL: t < 0.9 ? undefined : [140, 560] }), hold: (p, h, t) => { if (t < 0.9) pin(p, h[1], -30 + 70 * ease((t - 0.55) / 0.25)); else mug(p, h[0], -20, true, 0.5); } },
    { o: GUNNER, h: 1.78, at: still(0.8, 0.3), sharp: true, f: (t) => stand({ facing: -1, expr: "grin", reachL: t > 1.0 ? [180, 700] : undefined }), hold: (p, h, t) => { if (t > 1.0) mug(p, h[0], -20, true, 0.5); } }],
  over: (g, t) => { if (t < 0.5) return; const q = proj("c4", [0.3, -0.05, 0]), w = (proj("c4", [0.3, -0.05, 0.5])[1] - q[1]) * -1.1; keg(new Pen(g), [q[0], q[1]], w, t > 0.8 ? 1 : 0);
    if (t > 0.8 && t < 1.0) { g.save(); g.translate(q[0], q[1] - w * 0.9); const p = new Pen(g); g.scale(0.6, 0.6); fxBurst(p, (t - 0.8) / 0.2); g.restore(); } } };

// ---- c5 (31.0-32.6): a pile of empty bottles topples with a clink; the pirates drop asleep one after another in heaps, snoring ----
// (only those standing inside the picture; each falls towards the side with room for his head, no further than that room allows)
const C5 = crowdPlaces(10, -3.3, -0.6, -1.8, 0.5, 91).filter((q) => { const x = proj("c1", [q[0], q[1], 0])[0]; return x > 140 && x < 940; });
const c5Rot = (q: [number, number], h: number) => { const f = proj("c1", [q[0], q[1], 0]), L = 0.85 * (f[1] - proj("c1", [q[0], q[1], h])[1]), r = 940 - f[0], l = f[0] - 140;
  return (r >= l ? 1 : -1) * (Math.asin(Math.min(0.97, Math.max(r, l) / L)) * 180) / Math.PI; };
const c5: Shot = { id: "c1", blur: 2.5, focus: 2.8, drift: [1.08, 1.0, 0, 20], tint: "rgba(8,14,40,0.2)", moon: true,
  actors: C5.map((q, i): Actor => ({ o: crew(140 + i), h: 1.6 + 0.25 * rnd(i, 3), at: () => q, rot: (t) => (t > 0.15 * i ? c5Rot(q, 1.6 + 0.25 * rnd(i, 3)) * ease((t - 0.15 * i) / 0.25) : 6 * Math.sin(t * 5 + i)),
    f: (t) => (t > 0.15 * i ? stand({ mode: "fall", expr: "dazed", facing: 1 }) : stand({ expr: "dazed", facing: 1, mode: "march", phase: t * 2 })), fx: (p, t, toD) => { if (t > 0.15 * i + 0.3) { void toD; } } })),
  extraZones: () => [[200, 1440, 820, 1800]], over: (g, t) => { const b = proj("c1", [-0.1, 0.3, 0]); for (let i = 0; i < 9; i++) { const fall = clamp((t - 0.05 * i) / 0.4), row = Math.floor(i / 3), col = i % 3, x = b[0] - 90 + col * 70 + (row % 2) * 30 + fall * (i - 4) * 35, y = b[1] - row * 110 + fall * row * 110;
      g.save(); g.translate(x, y); g.rotate(fall * (i % 2 ? 1.4 : -1.4)); bottle(new Pen(g), [0, 0], 0); g.restore(); }      // (the bottles on the open deck in front of them all, where they are seen to topple, never over a face; no word over them)
    C5.forEach((q, i) => { if (t > 0.15 * i + 0.35) { const h = proj("c1", [q[0], q[1], 0.6]); zzz(g, h[0], h[1], t + i * 0.3, 0.8); } }); } };

// ---- c6 (32.6-34.0): dawn: the sun up over the sea; the sleepers in heaps; a gull lands on one sleeping head ----
// (the sleepers sit slumped asleep in a heap in front of the mast and clear of the bell post: lying, they were longer than the deck in the picture,
//  and behind the post and the mast they were drawn over them)
const C6: [number, number, number][] = [[1.2, -0.2, 1], [0.4, 1.0, -1], [0.8, 1.0, 1], [1.2, 0.6, -1], [1.6, 0.2, 1]];
const c6Head = (q: [number, number, number], k = 0.62): P2 => { const f = proj("c6", [q[0], q[1], 0]), hp = f[1] - proj("c6", [q[0], q[1], 1.65])[1]; return [f[0] + q[2] * 0.04 * hp, f[1] - k * hp]; };
const c6: Shot = { id: "c6", blur: 2, focus: 3.4, drift: [1.0, 1.08, 0, 0],
  actors: C6.map((q, i): Actor => ({ o: crew(160 + i), h: 1.65, at: () => [q[0], q[1]], f: (t) => stand({ mode: "sit", expr: "smile_closed", facing: q[2] as 1 | -1, headTilt: q[2] * (14 + 3 * Math.sin(t * 2 + i)) }) })),
  under: (g, t) => { const y = lerp(760, 560, ease(t / 1.4)); g.save(); g.fillStyle = "rgba(255,214,140,0.9)"; g.beginPath(); g.arc(860, y, 70, 0, 7); g.fill(); g.restore(); },
  over: (g, t) => { const q = c6Head(C6[3], 0.66), u = ease(t / 0.8), x = lerp(-80, q[0], u), y = lerp(200, q[1] - 20, u) - (u < 1 ? 160 * Math.sin(u * Math.PI) : 0); gull(g, x, y, u < 1 ? Math.abs(Math.sin(t * 14)) : 0.1, 1.1);
    C6.forEach((qq, i) => { if (i === 3 && t > 0.6) return; const h = c6Head(qq, 0.7); zzz(g, h[0], h[1], t + i * 0.4, 0.7); }); } };

// ---- c7 (34.0-35.2): a navy warship comes out of the mist, its guns run out ----
const c7: Shot = { id: "c7", blur: 0.8, drift: [1.0, 1.12, 0, 40], actors: [],
  over: (g, t) => { const a = 0.55 * (1 - ease(t / 1.2)); g.fillStyle = `rgba(232,234,238,${a})`; g.fillRect(0, 0, W_, H_); } };

// ---- c8 (35.2-36.6): close: sleepers; one hugs his mug like a teddy; one wakes and sees everything twice ----
const c8: Shot = { id: "c8", blur: 2.5, focus: 1.9, drift: [1.04, 1.0, 0, 0],
  actors: [{ o: RUM, h: 1.62, at: still(1.6, -1.85), rot: () => 80, sharp: true, f: () => stand({ mode: "fall", expr: "smile_closed", facing: 1, reachR: [330, 520], reachL: [270, 520] }), hold: (p, h) => mug(p, [300, 560], 0, false), fx: (p, t) => { p.g.save(); p.g.translate(0, 0); p.g.restore(); } },
    { o: crew(180), h: 1.7, at: still(0.0, -1.4), sharp: true, f: (t) => stand({ mode: "sit", expr: t < 0.6 ? "smile_closed" : "dazed", facing: -1 }) }],
  over: (g, t) => { const q = proj("c8", [1.6, -1.85, 0.5]); zzz(g, q[0] + 700, q[1] - 120, t, 1);
    if (t > 0.6) { const h = proj("c8", [0.0, -1.4, 1.0]), off = 40 * Math.sin(t * 6); g.save(); g.globalAlpha = 0.45; g.drawImage(g.canvas, h[0] - 300, h[1] - 500, 600, 700, h[0] - 300 + off, h[1] - 500, 600, 700); g.restore(); } } };

// ---- c9 (36.6-37.9): a pirate gets up, wobbles round in a circle and topples head first into a barrel, his boots sticking out and kicking ----
// (the barrel by the rail, its lantern out at dawn; while he dives the barrel's column below its rim hides what is inside it)
const BAR9: [number, number] = [-0.34, -1.74], S9: [number, number] = [0.75, -1.75], E9: [number, number] = [-0.756, 0.655];      // (E9: the deck direction that is right in c8's picture)
const c9at = (t: number): [number, number] => [S9[0] + 0.1 * Math.sin(Math.min(t, 0.7) * 7), S9[1] - 0.06 + 0.06 * Math.cos(Math.min(t, 0.7) * 7)];
const c9u = (t: number) => ease((t - 0.7) / 0.3);
/** his feet (deck x, y and height) while he dives: the hips go from beside the barrel to its rim in an arc, the body turning head first about them */
/** his feet (deck x, y and height) while he dives: he springs up, his hips go over the barrel in a high arc, the body turning head first about
 *  them toward the open deck (to the left in the picture: turned the other way his head swung out of the picture) and down into the barrel */
const c9feet = (t: number): [number, number, number] => { const a = c9at(t), u = c9u(t), r = -Math.PI * u, H = 0.45 * 1.7;
  const v = ease(Math.min(1, u * 1.6)), hx = lerp(a[0], BAR9[0], v), hy = lerp(a[1], BAR9[1], v), hz = lerp(H, 0.95, u) + 0.5 * Math.sin(Math.PI * u);
  return [hx - H * Math.sin(r) * E9[0], hy - H * Math.sin(r) * E9[1], hz - H * Math.cos(r)]; };
const c9: Shot = { id: "c8", blur: 2.5, focus: 2.2, drift: [1.0, 1.05, 0, 0],
  actors: [{ o: crew(181), h: 1.7, sharp: true,
    at: (t) => { if (t < 0.7) return c9at(t); const f = c9feet(t); return [f[0], f[1]]; },
    lift: (t) => (t < 0.7 ? 0 : c9feet(t)[2]),
    rot: (t) => (t < 0.7 ? 14 * Math.sin(t * 9) : -180 * c9u(t)),
    clip: (t) => { if (t < 0.85) return null; const r0 = proj("c8", [BAR9[0], BAR9[1], 0]), r = proj("c8", [BAR9[0], BAR9[1], 0.9]), half = 1.1 * (r0[1] - r[1]) / 0.9;      // (below the rim, a column wider than the barrel: whatever of him is in it is inside the barrel)
      return [[-200, -200], [1280, -200], [1280, 2200], [r[0] + half, 2200], [r[0] + half, r[1]], [r[0] - half, r[1]], [r[0] - half, 2200], [-200, 2200]]; },
    f: (t) => stand({ mode: "march", phase: t < 1.0 ? t * 3 : t * 9, expr: "dazed", facing: 1, cheer: t > 0.8 ? 1 : 0 }), fx: (p, t) => { if (t < 0.7) fxStars(p, t % 1); } }] };

// ---- c10 (37.9-39.7): "Wake up! Warship!": the young pirate drops his telescope and rings the bell; everyone sits bolt upright ----
const c10: Shot = { id: "c10", blur: 2.5, focus: 2.4, drift: [1.04, 1.1, 0, 10],
  actors: [{ o: YOUNG, h: 1.48, at: (t) => [2.38 + 0.12 * Math.sin(t * 8), -0.98], lift: (t) => (t > 0.4 ? 0.22 + 0.08 * Math.sin(t * 8 + 1) : 0), rot: (t) => (t > 0.4 ? 8 * Math.sin(t * 8) : 0), sharp: true, talk: (t) => talkOf(["w13"], t + 37.9),
    f: (t) => (t < 0.4 ? stand({ expr: "shock", facing: 1, reachR: [420, 400] }) : stand({ mode: "fall", expr: "shock", facing: 1, cheer: 1 })),
    hold: (p, h, t, toD) => { if (t < 0.4) telescope(p, h[1], -60 + 200 * ease(t / 0.4)); else { const q = proj("c10", BELL), b = toD([q[0], q[1]]), mid: P2 = [h[1][0], h[1][1] + 6]; p.stroke([b, mid, [mid[0], mid[1] + 40]], 16, INK); p.stroke([b, mid, [mid[0], mid[1] + 40]], 9, "#c9b48a"); } },
    fx: (p, t, toD) => { if (t < 0.4) return; const q = proj("c10", BELL), b = toD([q[0], q[1]]), u = (t * 8) % 2; if (u < 1) { p.g.globalAlpha = 1 - u; for (const r of [90, 140]) p.arc(b[0], b[1], r + 40 * u, r + 40 * u, 200, 340, 9, "#ffe9a8"); p.g.globalAlpha = 1; } } },
    ...([[1.0, -0.6], [0.2, 0.2], [1.6, 0.6], [-0.4, -0.9]] as [number, number][]).map((q, i): Actor => ({ o: crew(190 + i), h: 1.65, at: () => q, rot: (t) => (t < 0.7 + 0.1 * i ? 80 : 80 * (1 - ease((t - 0.7 - 0.1 * i) / 0.15))),
      f: (t) => (t < 0.7 + 0.1 * i ? stand({ mode: "fall", expr: "smile_closed", facing: 1 }) : stand({ mode: "sit", expr: "shock", facing: 1 })) }))] };

// ---- c11 (39.7-41.6): low: Roberts pulls down his hat brim, sets his teacup on the rail, draws his cutlass ----
const c11: Shot = { id: "c11", blur: 2, focus: 1.8, drift: [1.0, 1.08, 0, 30],
  actors: [{ o: ROBERTS, h: 1.86, at: still(1.2, -1.65), sharp: true, f: (t) => stand({ facing: -1, expr: "stern", headTilt: t < 0.5 ? 8 : 0, reachR: t < 0.5 ? [455, 265] : t < 1.1 ? [470, 560] : [520, 300], reachL: t > 1.1 ? [200, 600] : undefined }),
    hold: (p, h, t) => { if (t > 0.5 && t < 1.1) teacup(p, h[1]); if (t > 1.1) cutlass(p, h[1], lerp(150, 20, ease((t - 1.1) / 0.35))); } }],
  over: (g, t) => { if (t > 1.1) { const q = proj("c11", [1.6, -2.1, 0.86]); teacup(new Pen(g), [q[0], q[1]], 0); } } };

// ---- c12 (41.6-42.7): the warship's broadside: flashes along her side, smoke, splashes in the sea; no hit seen ----
const c12: Shot = { id: "c7", blur: 0.8, drift: [1.12, 1.18, 0, 40], actors: [],
  over: (g, t) => { for (let i = 0; i < 6; i++) { const a = 0.08 * i, u = (t - a) / 0.6, x = 250 + i * 110, y = 980; if (u <= 0) continue; if (u < 0.15) { g.save(); g.translate(x, y); const p = new Pen(g); g.scale(0.6, 0.6); fxBurst(p, u / 0.15, "#fff0b0"); g.restore(); } smoke(g, x, y - 30 * u, Math.min(1, u), 70); }
    for (let i = 0; i < 4; i++) { const u = (t - 0.35 - 0.1 * i) / 0.4; if (u > 0 && u < 1) { g.fillStyle = "rgba(240,248,255,0.85)"; g.beginPath(); g.ellipse(180 + i * 230, 1340, 50 * u, 160 * Math.sin(Math.PI * u), 0, 0, 7); g.fill(); } } } };

// ---- c13 (42.7-43.8): Roberts' silhouette in the smoke; his teacup on the rail rattles and falls ----
const c13: Shot = { id: "c11", blur: 3, focus: 1.8, drift: [1.08, 1.12, 0, 30],
  // (a silhouette: all of him dark, the smoke drifting behind him, never over his head)
  actors: [{ o: { ...ROBERTS, jacket: "#1c1820", pants: "#1c1820", buttons: "#1c1820", skin: "#26222c", moustache: "#1c1820", sash: "#1c1820" }, h: 1.86, at: still(1.2, -1.65), sharp: true, f: () => stand({ facing: -1, expr: "stern", back: true, reachR: [520, 300] }), hold: (p, h) => cutlass(p, h[1], 20) }],
  under: (g, t) => { g.fillStyle = "rgba(200,200,205,0.55)"; g.fillRect(0, 0, W_, H_); smoke(g, 260, 700, 0.6 + 0.3 * t, 260, "rgba(235,235,238,"); smoke(g, 860, 900, 0.5 + 0.3 * t, 220, "rgba(235,235,238,"); },
  over: (g, t) => { smoke(g, 540 + 80 * t, 1820, 0.5 + 0.3 * t, 200, "rgba(235,235,238,");
    const q = proj("c11", [1.6, -2.1, 0.86]), u = clamp((t - 0.45) / 0.5); g.save(); g.translate(q[0] + (t < 0.45 ? 6 * Math.sin(t * 60) : 60 * u), q[1] + 700 * u * u); g.rotate(u * 4); teacup(new Pen(g), [0, 0], 0); g.restore(); } };

// ---- c14 (43.8-45.0): back to the party at the start: the barrel's lantern lit again ----
const c14: Shot = { ...a1, drift: [1.12, 1.06, 0, -20] };
// ---- c15 (45.0-46.0): close: Roberts turns to us and winks (the loop cuts to the first frame) ----
const c15: Shot = { id: "a2", blur: 3, focus: 3, drift: [1.12, 1.18, 0, -60],
  actors: [{ o: ROBERTS, h: 1.86, at: still(-0.96, -1.36), sharp: true, f: (t) => stand({ facing: 0, expr: t > 0.5 && t < 0.8 ? "smile_closed" : "smile", look: 0, reachR: [420, 560] }), hold: (p, h) => teacup(p, h[1], 0.4) }] };

const SHOTS: Shot[] = [a1, a2, a3, a4, a5, a6, a7, b1, b2, b3, b4, b5, b6, b7, b8, b9, b10, b11, c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11, c12, c13, c14, c15];
/** the shot's timing: a5 (the black) sits between a4 and a6 (4.8-6.0) though it has no plate of its own */
const TIMES: [string, number, number][] = [["a1", 0, 1.2], ["a2", 1.2, 2.4], ["a3", 2.4, 3.6], ["a4", 3.6, 4.8], ["a5", 4.8, 6.0], ["a6", 6.0, 7.4], ["a7", 7.4, 8.8],
  ["b1", 8.8, 10.3], ["b2", 10.3, 11.7], ["b3", 11.7, 13.0], ["b4", 13.0, 14.0], ["b5", 14.0, 15.6], ["b6", 15.6, 17.2], ["b7", 17.2, 18.9], ["b8", 18.9, 20.6], ["b9", 20.6, 22.0], ["b10", 22.0, 23.3], ["b11", 23.3, 24.3],
  ["c1", 24.3, 25.8], ["c2", 25.8, 27.6], ["c3", 27.6, 29.4], ["c4", 29.4, 31.0], ["c5", 31.0, 32.6], ["c6", 32.6, 34.0], ["c7", 34.0, 35.2], ["c8", 35.2, 36.6], ["c9", 36.6, 37.9], ["c10", 37.9, 39.7], ["c11", 39.7, 41.6], ["c12", 41.6, 42.7], ["c13", 42.7, 43.8], ["c14", 43.8, 45.0], ["c15", 45.0, 46.0]];
export const ROBERTS_EMU_S = 46.0;
export const RobertsFilm: React.FC = () => { const T = useT(), i = Math.max(0, TIMES.findIndex(([, a, b]) => T >= a && T < b)), [, t0, t1] = TIMES[i], shot = SHOTS[i];
  const spec = { ...(SPECS.find((s) => s.id === shot.id) ?? SPECS[0]), t0, t1 };
  return <><ShotView shot={shot} spec={spec} t={T - t0} words={WORDS} T={T} /><Audio src={staticFile("craft/roberts-emu.wav")} /></>; };
