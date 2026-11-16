// "The Man Who Stole the Mona Lisa", shots 51-70: chapter 5 (the empty wall) and the start of chapter 6 (the wrong men).
import { FrontOpts, Pen } from "./toon";
import { fxLens, fxFrameEmpty, fxGlassPane, fxSign, fxMona, fxBarrier, fxAlps, fxNotreDame, fxSuitcase, fxHandLetter, fxStatue, fxPostSign, fxLouvre } from "./monatoon";
import { GUARD2, DIRECTOR, COPS, DETECTIVE, PIERET, EDITOR, KAFKA, BROD, FOLK } from "./monacast";
import { Who, person, hh } from "./castbase";
import { ramp, clamp01 } from "./story";
import { Sh, Ctx, at, GAL, STAIR, WALL_Y, WALL_Z, near, ins, P, S, sir, walk, fx, pop, ban, tag, stamp, sweat, wall, bubTo, sayTo, nameOver, hold } from "./monaKit";
import { COUNTRY, police, directorRoom, newsroom } from "./monaSets";
import { louvre } from "./monaShots1";
import { fxClosedBoard, fxLensPrint, fxArmC, fxRails, fxTrainC, fxTableC, fxSack, fxColumn, fxReward, fxKiosk, fxHungPage, fxMonaQ, fxMonaNo, fxHooksC, fxSuspects, fxPicBubble, fxSteamer } from "./monaPropsC";

type Ex = FrontOpts["expr"];
type Draw = (p: Pen) => void;
/** when the next shot cross-fades in, the cards leave on the frame the blend starts */
const out = (c: Ctx, x = 8) => c.b - x / 2;
/** a speech bubble with a drawing in it, its tail at the speaker's head (as thinkTo, but the drawing is there from the
 *  first frame: the bubble is never empty) */
const think = (c: Ctx, f0: number, hx: number, z: number, draw: Draw, key: string, cw: number, ch: number, iw: number, o: { side?: 1 | -1; w?: number; top?: number; f1?: number } = {}) => {
  const b = sayTo(c, f0, " ", hx, z, o);
  pop(c, f0, key, cw, ch, draw, b.x, b.y, z - 0.1, iw, 0, o.f1);
};
/** somebody running sideways across the frame (side view); gone once past x1 */
const run = (c: Ctx, who: Who, x0: number, x1: number, z: number, f0: number, v: number, expr: Ex = "stern"): number => {
  const d = Math.abs(x1 - x0), u = clamp01((c.f - f0) / ((d / v) * 30)), x = x0 + (x1 - x0) * u;
  if (u < 1) S(c, who, x, z, { mirror: x1 > x0, phase: u <= 0 ? undefined : ((d * u) / 1.6) % 1, expr });
  return u < 1 ? x : x1;
};
/** somebody in side view, bent forward with both hands held out (searching, examining): facing screen-right, or screen-left
 *  with mirror. Returns where the hands are. */
const bent = (c: Ctx, who: Who, x: number, z: number, mirror: boolean, expr: Ex = "stern", scale = 1): [number, number] => {
  person(c.out, c.cam, who, x, 0, z, { side: true, mirror, scale, so: { mode: "push", pose: 1, expr, blink: 0 } });
  return [x + (mirror ? 1 : -1) * 0.57 * scale, 0.87 * scale];
};
/** a magnifying glass whose handle ends in the hand at (hx, hy); the holder stands on the screen-left (+1) or the
 *  screen-right (-1) of the glass */
const lens = (c: Ctx, hx: number, hy: number, z: number, holder: 1 | -1, w = 0.5) =>
  fx(c, "lens", 340, 340, fxLens, hx - holder * 0.37 * w, hy + 0.37 * w, z, w, holder > 0 ? -Math.PI / 2 : 0);
/** the top of somebody's head or hat among the townsfolk (three wear top hats) */
const topOf = (k: number) => (k === 0 || k === 4 || k === 10 ? 2.15 : 1.86);
/** a bubble filled by a picture, its tail (or its thought dots) at the head of the person at (hx, z) */
const picBub = (c: Ctx, f0: number, key: string, hx: number, z: number, draw: Draw, cw: number, ch: number, o: { side?: 1 | -1; w?: number; top?: number; thought?: boolean; f1?: number } = {}) => {
  const side = o.side ?? -1, w = o.w ?? 1.2, h = (w * 420) / 520;
  pop(c, f0, `bub|${key}|${side}|${!!o.thought}`, 520, 420, (p) => fxPicBubble(p, side > 0, !!o.thought, cw, ch, draw), hx + side * (0.1 + 0.4 * w), (o.top ?? 1.8) + 0.04 + 0.462 * h, z - 0.05, w, 0, o.f1);
};
/** the near hand of somebody walking in side view: [reach forward, height] at stride phase ph (undefined = standing) */
const sideHand = (ph?: number): [number, number] => {
  let k = 0;
  if (ph !== undefined) { const cc = ((ph % 1) + 1) % 1; if (cc < 0.5) k = 1 - 4 * cc; else { const s = (cc - 0.5) / 0.5; k = -1 + 2 * s - (2 / Math.PI) * Math.sin(2 * Math.PI * s); } }
  const a = (-30 * k * Math.PI) / 180, a2 = a + ((16 * Math.PI) / 180) * Math.sign(a || 1), L = 0.2265;
  return [0.02 + L * (Math.sin(a) + Math.sin(a2)), 1.11 - L * (Math.cos(a) + Math.cos(a2))];
};
/** walk sideways from x0 to x1 carrying a thing that hangs from the hand (a suitcase), then stand; returns x */
const carry = (c: Ctx, who: Who, x0: number, x1: number, z: number, f0: number, v: number, key: string, cw: number, ch: number, draw: Draw, w: number, expr: Ex = "neutral"): number => {
  const d = Math.abs(x1 - x0), u = clamp01((c.f - f0) / Math.max(1, (d / v) * 30)), x = x0 + (x1 - x0) * u, ph = u <= 0 || u >= 1 ? undefined : ((d * u) / 1.6) % 1, dir = x1 > x0 ? 1 : -1;
  S(c, who, x, z, { mirror: x1 > x0, phase: ph, expr });
  const [hf, hy] = sideHand(ph), h = (w * ch) / cw;
  fx(c, key, cw, ch, draw, x + dir * hf, hy - 0.35 * h, z - 0.06, w);
  return x;
};

// ---- shot 53: sixty policemen, each somewhere of his own in the Salon Carre ----
type Cop = { x: number; z: number; k: "back" | "bent" | "walk" | "look"; dir: 1 | -1 };
const SEARCH: Cop[] = (() => {
  let s = 20110821;
  const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  const pts: { x: number; z: number }[] = [];
  // twelve along the back wall (not in front of the hooks)
  for (const x of [1.3, 2.35, 3.5, 4.6, 5.8, 7.0, -1.35, -2.45, -3.55, -4.7, -5.85, -7.05]) pts.push({ x: x + 0.24 * (rnd() - 0.5), z: 4.95 + 0.4 * rnd() });
  // forty-eight scattered over the floor: nobody nearer than a pace, nobody straight behind another, the hooks left in view
  for (let tries = 0; pts.length < 60 && tries < 400000; tries++) {
    const z = -2.5 + 6.7 * rnd(), x = (2 * rnd() - 1) * (0.53 * (z + 10.5) - 0.5);
    if (Math.abs(x) < 0.85 && z > 1.0) continue;
    if (pts.some((o) => Math.hypot(o.x - x, (o.z - z) / 0.7) < 1.13 || (Math.abs(o.x / (o.z + 10.5) - x / (z + 10.5)) * (z + 10.5) < 0.36 && Math.abs(o.z - z) < 2.0))) continue;
    pts.push({ x, z });
  }
  if (pts.length !== 60) throw new Error(`shot 53: ${pts.length} policemen placed, not 60`);
  let walkers = 0, bents = 0, backs = 0;
  return pts.map((p, i): Cop => {
    const dir: 1 | -1 = p.x > 0 ? -1 : 1;
    if (i < 12) return { ...p, k: i % 4 === 2 ? "bent" : "back", dir: (i % 8 === 2 ? 1 : -1) as 1 | -1 };
    const free = !pts.some((o, j) => j !== i && Math.abs(o.z - p.z) < 0.5 && dir * (o.x - p.x) > 0 && dir * (o.x - p.x) < 2.3);
    if (free && walkers < 9 && Math.abs(p.x) > 1.6) { walkers++; return { ...p, k: "walk", dir }; }
    if (i % 3 === 0 && bents < 16) { bents++; return { ...p, k: "bent", dir: (rnd() > 0.5 ? 1 : -1) as 1 | -1 }; }
    if (i % 3 === 1 && backs < 14 && p.z > -0.5) { backs++; return { ...p, k: "back", dir }; }
    return { ...p, k: "look", dir: (rnd() > 0.5 ? 1 : -1) as 1 | -1 };
  });
})();

// ---- shot 63: the queue: from the door of the Louvre it runs across the square in a zigzag, and off to the left ----
const QPATH: [number, number][] = [[0, 29.3], [-6.8, 22.6], [6.5, 9.6], [7.3, 6.6], [6.6, 3.8], [10.5, 2.4]];
/** the point s metres along the queue from the door, and the leg it is on */
const queueAt = (s: number): [number, number, number] => {
  for (let i = 0; i + 1 < QPATH.length; i++) {
    const [x0, z0] = QPATH[i], [x1, z1] = QPATH[i + 1], L = Math.hypot(x1 - x0, z1 - z0);
    if (s <= L || i + 2 === QPATH.length) return [x0 + ((x1 - x0) * s) / L, z0 + ((z1 - z0) * s) / L, i];
    s -= L;
  }
  return [0, 0, 0];
};
// ---- shot 67: the crowd before the empty wall. Seen from the camera every neighbour stands in another row, so heads
// overlap bodies but never heads; [x, z, who]. All sixteen townsfolk, mixed ----
const CROWD: [number, number, number][] = ([1, -1] as const).flatMap((side) =>
  (side > 0 ? [13, 7, 2, 9, 11, 0, 14, 5, 1, 8, 15, 4, 10] : [6, 3, 12, 15, 1, 10, 8, 13, 4, 2, 9, 0, 7]).map((k, j): [number, number, number] => {
    const z = [4.6, 2.0, 3.3][j % 3] + (((j * 7) % 3) - 1) * 0.08, r = 0.075 + 0.033 * j + (side < 0 ? 0.006 : 0);
    return [side * r * (z + 6.5), z, k];
  }));
/** shots 69-70: the table in the newspaper office (its top is 0.83 m up) */
const lootTable = (c: Ctx, z: number) => fx(c, "tableC", 600, 520, fxTableC, 1.94, 0.474, z, 1.066);
/** shots 54-55: where the frame and the glass stand on the service stairs */
const leftGlass = (c: Ctx) => c.out.fx.push({ key: "glassPane", cw: 560, ch: 760, draw: fxGlassPane, x: STAIR + 2.62, y: 0.4 + (0.86 * 760) / 560 / 2, z: 1.26, w: 0.86, h: (0.86 * 760) / 560, rot: -0.17, soft: true });
const leftFrame = (c: Ctx) => fx(c, "frameE", 700, 920, fxFrameEmpty, STAIR + 2.72, 0.6 + (1.0 * 920) / 700 / 2, 1.72, 1.0, -0.11);
/** a clear stretch of the square in front of the Louvre (no lamp posts or trees behind the heads) */
const LX = 120;
/** shot 57: a stretch of the quay with open water behind it */
const DX = 40;
/** the news kiosk */
const KX = -120;

export const SHOTS_3: Sh[] = [
  // ---------------- 5. the empty wall ----------------
  { name: "then everything happens at once", a: at("s5_1") - 5, zone: "paris", x: 8, cam: near(), draw: (c) => {
    louvre(c);
    // across the square behind: three men run the same way, one after the other, and never meet
    run(c, DETECTIVE, 9, -14, 8, c.a - 20, 5.6, "shock"); run(c, COPS[1], 3, -12, 5, c.a, 5, "shock"); run(c, COPS[2], 5, -12, 6.5, c.a + 10, 5, "nervous");
    // in front, on the left: a policeman runs in, stops and points the way; a museum guard throws up his arms
    const a1 = c.a - 8 + Math.round((5.6 / 5) * 30);
    if (run(c, COPS[0], 8.5, 2.9, 1.5, c.a - 8, 5, "shock") === 2.9) P(c, COPS[0], 2.9, 1.5, { expr: "stern", look: -1, facing: -1, point: 1 });
    bubTo(c, a1 + 2, "bang", 2.9, 1.5, { side: -1, w: 0.9 });
    if (run(c, GUARD2, 9.6, 4.4, 2.8, c.a + 4, 4.6, "shock") === 4.4) P(c, GUARD2, 4.4, 2.8, { expr: "shock", cheer: 1 });
  } },
  { name: "the Louvre is shut for a week", a: at("s5_2") - 4, zone: "paris", cam: near(), draw: (c) => {
    louvre(c);
    fx(c, "closedBoard", 900, 860, fxClosedBoard, 0, 1.243, 2.6, 2.6);
    P(c, COPS[0], 3.0, 1.6, { expr: "stern", look: -1, point: 1 }); P(c, COPS[2], -3.0, 1.6, { expr: "stern" });
  } },
  { name: "sixty policemen search it", a: at("s5_2", "Sixty") - 3, zone: "louvre", x: 8, cam: [[0, 4.4, -10.5], [0, 1.3, 3.5], 38, 0.0003], draw: (c) => {
    wall(c, "hooks");
    SEARCH.forEach((m, i) => {
      const who = COPS[i % 3], scale = 0.95 + 0.1 * hh(i, 5), s = Math.sin(c.f / 11 + i * 1.7);
      if (m.k === "back") P(c, who, m.x, m.z, { back: true, blink: 0, headTilt: (hh(i, 3) - 0.5) * 0.14 }, { scale });
      else if (m.k === "bent") { const [hx, hy] = bent(c, who, m.x, m.z, m.dir > 0, "stern", scale); lens(c, hx, hy, m.z - 0.05, m.dir > 0 ? -1 : 1, 0.42 * scale); }
      else if (m.k === "walk") { const d = (0.9 * (c.f - c.a + 12)) / 30; S(c, who, m.x + m.dir * d, m.z, { mirror: m.dir > 0, phase: (d / 1.6 + hh(i, 7)) % 1, expr: "stern", scale }); }
      else P(c, who, m.x, m.z, { expr: "stern", blink: 0, facing: m.dir, look: s > 0.3 ? 1 : s < -0.3 ? -1 : 0, point: i % 5 === 0 && m.dir < 0 ? 0.8 : undefined }, { scale });
    });
    tag(c, at("s5_2", "Sixty") + 2, "OFFICERS", "60", 0, 3.75, 5.4, 2.0, "#f6efd8", out(c));
  } },
  { name: "they find the frame and the glass on the staircase", a: at("s5_2", "They") - 3, zone: "louvre", x: 8, cam: [[STAIR + 3.4, 1.7, -4.2], [STAIR + 3.4, 1.2, 1.0], 36, 0.0004], draw: (c) => {
    const ar = c.a + 32;
    // looking up the service stairs: the glass and the frame lean on the banister wall where the thief left them
    leftFrame(c); leftGlass(c);
    P(c, COPS[1], STAIR + 4.8, 0.3, { expr: "shock", look: -1, facing: -1, point: 1 });
    bubTo(c, c.a + 4, "bang", STAIR + 4.8, 0.3, { side: 1, w: 0.85, f1: c.a + 64 });
    if (c.f < ar) walk(c, DETECTIVE, STAIR - 0.6, STAIR + 1.75, 0.3, c.a - 12, { v: 1.8 });
    else { const [hx, hy] = bent(c, DETECTIVE, STAIR + 1.75, 0.3, true, "stern"); lens(c, hx, hy, 0.24, -1, 0.5); }
  } },
  { name: "and they find a thumbprint", a: at("s5_2", "thumbprint") - 12, zone: "louvre", cam: [[STAIR + 2.6, 1.02, -0.28], [STAIR + 2.6, 1.02, 1.26], 30, 0.0008], draw: (c) => {
    const k = ramp(c.f, c.a, c.a + 9), lx = STAIR + 2.6 - 0.14 * (1 - k), ly = 1.06 - 0.06 * (1 - k), w = 0.56;
    leftGlass(c);
    // the detective's glass over the print on the pane; his hand holds the handle
    const cx = lx - 0.088 * w, cy = ly - 0.088 * w, hx = cx - 0.43 * w, hy = cy - 0.43 * w;
    fx(c, "armC", 500, 500, fxArmC, hx - 0.18, hy - 0.18, 1.12, 0.6);
    fx(c, "lensPrint", 340, 340, fxLensPrint, cx, cy, 1.1, w);
  } },
  { name: "the borders are watched", a: at("s5_3") - 4, zone: "louvre", x: 8, cam: [[COUNTRY + 3.0, 1.8, -7], [COUNTRY + 3.0, 2.6, 10], 40, 0.0004], draw: (c) => {
    const s = Math.sin(c.f / 9), part = (x0: number, x1: number) => (p: Pen) => { const g = p.g; g.save(); g.beginPath(); g.rect(x0, 0, x1 - x0, 420); g.clip(); fxBarrier(p); g.restore(); };
    fx(c, "alps", 1800, 620, fxAlps, COUNTRY + 3.0, 12, 60, 100);
    // the pole across the road; beside it the guard hut, big enough for a man (the same drawing, twice the size)
    fx(c, "barrierPole", 1000, 420, part(280, 1000), COUNTRY + 0.78, 1.2, 3.0, 6.0);
    fx(c, "barrierHut", 1000, 420, part(0, 280), COUNTRY - 0.75, 2.52, 3.5, 12.6);
    fx(c, "postFRANCE", 520, 640, (p) => fxPostSign(p, "FRANCE"), COUNTRY + 7.0, 0.92, 3.3, 1.5);
    // on the road in front of the pole: a traveller, his case in his hand at his side, stopped by one policeman; the other keeps watch
    P(c, COPS[0], COUNTRY + 1.3, 2.3, { expr: "stern", look: s > 0.2 ? 1 : s < -0.2 ? -1 : 0 });
    P(c, COPS[1], COUNTRY + 0.2, 2.5, { expr: "stern", look: -1, facing: -1, point: c.f >= c.a + 8 ? ramp(c.f, c.a + 8, c.a + 16) : undefined });
    P(c, FOLK[0], COUNTRY - 1.2, 2.4, { expr: "nervous", look: 1, facing: 1 }); hold(c, "suitcase", 460, 340, fxSuitcase, COUNTRY - 1.2, 2.4, -1, 0.56);
  } },
  { name: "ships and trains are searched", a: at("s5_3", "Ships") - 3, zone: "dock", x: 6, cam: [[DX - 2.2, 1.9, -12], [DX - 2.2, 2.0, 3.9], 38, 0.0005], draw: (c) => {
    // a train on the quay's own track; out on the water, clear of it, a liner
    fx(c, "steamerC", 1800, 700, fxSteamer, DX - 33.2, 4.2, 60, 22);
    for (const x of [DX - 10, DX + 10]) fx(c, "railsC", 2400, 24, fxRails, x, 0.13, 3.86, 20);
    c.out.fx.push({ key: "shadeC", cw: 64, ch: 64, draw: (p) => { p.g.fillStyle = "rgba(50,40,70,0.3)"; p.g.fillRect(0, 0, 64, 64); }, x: DX, y: 0.05, z: 3.2, w: 12.4, h: 1.5, flat: true });
    fx(c, "trainC", 1500, 640, fxTrainC, DX, 2.63, 3.9, 13.0);
    // a traveller's case on the customs table, under a policeman's glass (in front of the carriage, clear of its wheels)
    fx(c, "tableC", 600, 520, fxTableC, DX + 1.85, 0.474, -0.8, 1.066);
    fx(c, "suitcase", 460, 340, fxSuitcase, DX + 1.85, 1.065, -0.86, 0.72);
    const [hx, hy] = bent(c, COPS[0], DX + 2.9, -0.8, false, "stern"); lens(c, hx, hy + 0.02 * Math.sin(c.f / 5), -0.92, 1, 0.46);
    P(c, FOLK[6], DX + 0.8, -0.8, { expr: "nervous", look: 1, facing: 1 }); sweat(c, DX + 0.48, 1.62, -0.9);
    // another policeman walks along the engine, on the quay
    const d = (0.9 * (c.f - c.a + 10)) / 30; S(c, COPS[2], DX - 2.6 - d, 1.6, { phase: (d / 1.6) % 1, expr: "stern" });
  } },
  { name: "rewards are offered for her return", a: at("s5_3", "Rewards") - 3, zone: "paris", x: 8, cam: [[-5.5, 1.8, -4.6], [-5.5, 2.0, 8], 42, 0.0005], draw: (c) => {
    const X = -5.5;
    louvre(c);
    // a poster column on the square, the reward poster pasted on it; passers-by stop to read
    fx(c, "columnC", 800, 1300, fxColumn, X, 1.9, 2.4, 2.34);
    fx(c, "rewardC", 460, 620, fxReward, X, 1.88, 2.3, 1.0);
    P(c, FOLK[4], X + 1.35, 1.7, { back: true, point: 0.9 });
    P(c, FOLK[3], X - 1.5, 1.8, { expr: "shock", facing: 1, look: 1 });
    walk(c, FOLK[10], X - 5.8, X - 2.7, 2.4, c.a - 34, { v: 1.3, then: { expr: "smile", facing: 1, look: 1 } });
  } },
  { name: "the theft is on front pages around the world", a: at("s5_4") - 4, zone: "paris", cam: [[KX, 2.4, -6], [KX, 2.4, 0.7], 36, 0.0005], draw: (c) => {
    // a news kiosk: the day's front pages pegged on its line
    fx(c, "kioskC", 1800, 1040, fxKiosk, KX, 2.4, 0.75, 9);
    ([["PARIS GAZETTE", "LA JOCONDE|VOLÉE!", 2.2, 0.02], ["LONDON DAILY POST", "MONA LISA|STOLEN!", 0, -0.015], ["NEW YORK STAR", "MONA LISA|IS GONE!", -2.2, 0.025]] as const).forEach(([m, h, x, r], k) =>
      pop(c, c.a + 4 + k * 12, `hung${m}`, 600, 830, (p) => fxHungPage(p, m, h), KX + x, 2.625, 0.6, 1.8, r));
  } },
  { name: "the director who joked about Notre-Dame loses his post", a: at("s5_4", "director") - 5, zone: "office", x: 8, cam: [[0.4, 1.75, -6.2], [0.4, 1.6, 5.9], 34, 0.0005], draw: (c) => {
    directorRoom(c);
    const lo = at("s5_4", "loses") - 3, go = lo + 8, X = 1.4, Z = 0.4;
    // left of his desk and of the centre line (the caption falls on bare floor), his case already packed; then out he goes
    if (c.f < go) {
      P(c, DIRECTOR, X, Z, { expr: c.f >= lo ? "shock" : "nervous", look: c.f >= lo ? 0 : -1 });
      hold(c, "suitcase", 460, 340, fxSuitcase, X, Z, 1, 0.6);
      if (c.f < lo) sweat(c, X - 0.44, 1.62, Z - 0.1);
    } else carry(c, DIRECTOR, X, X + 6, Z, go, 1.7, "suitcase", 460, 340, fxSuitcase, 0.6, "pained");
    think(c, c.a + 8, X, Z, fxNotreDame, "notreDame", 560, 660, 0.4, { side: 1, w: 1.55, top: 1.72, f1: lo });
    stamp(c, lo, "OUT", X + 0.72, 2.3, Z - 0.05, 1.4, 0.1, out(c));
  } },
  { name: "everyone in France asks: who has her?", a: at("s5_5") - 4, zone: "paris", x: 8, cam: [[LX, 1.8, -6], [LX, 3.0, 20], 36, 0.0005], draw: (c) => {
    const wh = at("s5_5", "Who") - 3;
    fx(c, "louvre", 1800, 640, fxLouvre, LX, 7.8, 31, 44);
    // six different people, near and far, nobody in the middle of the foreground: [x, z, who, face, look, bubble side, thought, bubble width]
    const G: [number, number, number, Ex, number, 1 | -1, boolean, number][] = [[3.15, 1.4, 4, "stern", -1, -1, false, 0.9], [2.55, 2.4, 9, "nervous", 1, -1, true, 0.8], [0.65, 5.8, 10, "smile", -1, 1, false, 0.8],
      [-1.03, 5.4, 13, "shock", 1, -1, false, 0.85], [-2.2, 2.6, 12, "smile", -1, -1, true, 0.85], [-2.75, 1.1, 7, "nervous", 1, -1, false, 0.85]];
    G.forEach(([x, z, k, ex, lk, side, thought, w], i) => {
      const asks = c.f >= wh;
      P(c, FOLK[k], LX + x, z, { expr: asks ? (i % 2 ? "shock" : "nervous") : ex, look: lk, shrug: asks ? ramp(c.f, wh + i, wh + i + 8) : undefined });
      bubTo(c, c.a + 8 + i * 6, "q", LX + x, z, { side, w, thought, top: topOf(k), f1: wh });
    });
    think(c, wh, LX + 0.65, 5.8, fxMonaQ, "monaQ", 900, 620, 1.45, { side: -1, w: 3.4, top: 2.15, f1: out(c) });
  } },
  { name: "then, something strange", a: at("s5_6") - 5, zone: "louvre", x: 8, cam: [[0.3, 1.5, -0.4], [0.3, 1.6, 6], 34, 0.0012], draw: (c) => {
    wall(c, "hooks");
    sir(c, 1.05, 3.1, { expr: "neutral", lift: ramp(c.f, c.a + 12, c.a + 22) });
  } },
  { name: "when the Louvre opens again there is a queue outside", a: at("s5_7") - 4, zone: "paris", x: 8, cam: [[0.6, 6, -9], [0.6, 2.5, 22], 42, 0.0004], draw: (c) => {
    louvre(c);
    // a banner hung over the middle door (it covers the two windows above it)
    fx(c, "openSignC", 900, 300, (p) => fxSign(p, "THE MUSEUM IS", "OPEN TODAY", "#3f6a4a"), 0, 5.45, 30.6, 6.0);
    // seen from above, the queue zigzags from that door across the whole square and shuffles forward
    const adv = (0.35 * (c.f - c.a + 4)) / 30;
    for (let k = 0; k < 30; k++) {
      const s = 1.0 + 1.2 * k - adv;
      if (s < 0.5) continue;
      const [x, z, leg] = queueAt(s), who = FOLK[(k * 7 + 3) % 16], scale = 0.95 + 0.1 * hh(k, 9), phase = (((-s / 1.6) % 1) + 1) % 1, j = 0.12 * (hh(k, 2) - 0.5);
      if (leg === 2 || leg === 3) P(c, who, x + j, z, { back: true, mode: "stroll", phase, blink: 0 }, { scale });
      else S(c, who, x, z + j, { mirror: leg === 0, phase, scale });
    }
    // the poster column still stands on the square
    fx(c, "columnC", 800, 1300, fxColumn, -5.5, 1.9, 4.6, 2.34); fx(c, "rewardC", 460, 620, fxReward, -5.5, 1.88, 4.5, 1.0);
    P(c, FOLK[14], -4.1, 4.0, { back: true, headTilt: 0.04 });
  } },
  { name: "people pour into the Salon Carre to look at a wall", a: at("s5_7", "People") - 3, zone: "louvre", x: 8, cam: [[0, 2.0, -6.5], [0, 2.0, 6], 36, 0.0004], draw: (c) => {
    wall(c, "hooks");
    // some are there already; more come in through the doorway on the left and from both sides. Everybody has a place
    // of his own as the camera sees it, and the ones who walk in take the outer places, so nobody passes behind anybody
    ([[1.11, 3.6, 5], [1.7, 2.2, 2], [-1.09, 3.4, 0], [-1.74, 2.4, 7], [-3.0, 4.2, 8]] as const).forEach(([x, z, k], i) => P(c, FOLK[k], x, z, { back: true, headTilt: (hh(i, 2) - 0.5) * 0.1 }));
    walk(c, FOLK[9], 3.9, 3.05, 4.4, c.a - 6, { v: 1.2, then: { back: true } });
    walk(c, FOLK[12], 7.0, 2.96, 1.6, c.a - 30, { v: 1.7, then: { back: true } }); walk(c, FOLK[1], 8.2, 4.37, 3.2, c.a, { v: 1.7, then: { back: true } });
    walk(c, FOLK[13], -7.0, -2.96, 1.6, c.a - 26, { v: 1.7, then: { back: true } }); walk(c, FOLK[6], -8.2, -4.37, 3.2, c.a + 2, { v: 1.7, then: { back: true } });
  } },
  { name: "four hooks, and a space where a painting used to be", a: at("s5_7", "Four") - 3, zone: "louvre", cam: ins(0, 1.78, 5.8, 3.8, 34, 0.0009), draw: (c) => {
    const f0 = at("s5_7", "Four") - 2, n = Math.max(0, Math.min(4, 1 + Math.floor((c.f - f0) / 4)));
    fx(c, `hooksC${n}`, 700, 920, (p) => fxHooksC(p, n), GAL, WALL_Y, WALL_Z + 0.06, 1.0);
  } },
  { name: "a writer from Prague, on holiday with a friend: Franz Kafka", a: at("s5_8") - 4, zone: "louvre", cam: [[0.15, 1.7, -3.8], [0.15, 1.75, 6], 34, 0.0004], draw: (c) => {
    const wr = at("s5_8", "writer") - 3, fr = at("s5_8", "friend") - 3, fz = at("s5_8", "Franz") - 3;
    wall(c, "hooks");
    ([[2.95, 3.7, 5], [-2.5, 3.8, 9], [-3.5, 4.7, 13]] as const).forEach(([x, z, k], i) => P(c, FOLK[k], x, z, { back: true, headTilt: (i % 2 ? 1 : -1) * 0.03 }));
    // the two friends stand either side of the empty space; they turn round together when the narrator comes to them
    P(c, KAFKA, 1.28, 4.3, c.f >= wr ? { expr: "smile", facing: -1, look: c.f >= fz ? 0 : -1 } : { back: true });
    P(c, BROD, -1.21, 4.3, c.f >= wr ? { expr: "smile", facing: 1, look: 1, wave: c.f >= fr && c.f < fr + 24 ? Math.round(Math.sin((c.f - fr) / 3)) : undefined } : { back: true });
    // two cards of one kind, at one height
    nameOver(c, at("s5_8", "on") + 2, "FROM PRAGUE|THE WRITER", 1.28, 4.3, { w: 1.3, top: 2.15 });
    nameOver(c, at("s5_8", "His") + 2, "HIS FRIEND|MAX BROD", -1.05, 4.3, { w: 1.3, top: 2.15 });
  } },
  { name: "thousands come: they cannot stop thinking about her", a: at("s5_9") - 4, zone: "louvre", cam: [[0, 2.0, -6.5], [0, 2.2, 6], 36, 0.0003], draw: (c) => {
    const cn = at("s5_9", "cannot") - 3;
    wall(c, "hooks");
    // a crowd of backs in three loose rows, nobody straight behind anybody, the space with the hooks left in view
    CROWD.forEach(([x, z, k], i) => P(c, FOLK[k], x, z, { back: true, blink: 0, headTilt: (hh(i, 6) - 0.5) * 0.12 }, { scale: 0.96 + 0.08 * hh(i, 8) }));
    ban(c, at("s5_9", "come") + 6, "VISITORS|THOUSANDS", 0, 3.5, 5.4, 2.2, "#f6efd8", cn - 6);
    // she is in their heads
    ([[0, 1, 0], [13, -1, 8], [6, 1, 16]] as const).forEach(([i, side, d]) =>
      picBub(c, cn + d, "monaT", CROWD[i][0], CROWD[i][1], (p) => fxMona(p), 700, 920, { side, w: 1.0, thought: true, top: topOf(CROWD[i][2]), f1: out(c) }));
  } },
  // ---------------- 6. the wrong men ----------------
  { name: "the police need a thief; soon they think they have two", a: at("s6_1") - 5, zone: "office", x: 8, cam: [[-0.8, 1.8, -5.8], [-0.8, 2.0, 5.9], 36, 0.0005], draw: (c) => {
    police(c);
    const tw = at("s6_1", "two") - 3, X = -0.6, Z = 0.5;
    // the detective beside his desk (clear of the lamp): first at a loss, his eye on the wanted notices; then sure of himself
    P(c, DETECTIVE, X, Z, c.f >= tw ? { expr: "grin" } : { expr: "stern", look: 1, facing: 1 });
    bubTo(c, c.a + 12, "q", X, Z, { side: -1, w: 1.1, top: 1.86, thought: true, f1: tw });
    think(c, tw, X, Z, fxSuspects, "suspectsC", 900, 520, 0.66, { side: -1, w: 1.5, top: 1.86 });
  } },
  { name: "a young man writes to a Paris newspaper: he has stolen statues from the Louvre", a: at("s6_2") - 4, zone: "office", cam: [[4.25, 1.9, -4.8], [4.25, 1.85, 5.9], 34, 0.0003], draw: (c) => {
    newsroom(c);
    const cf = at("s6_2", "confession") - 3, no = at("s6_2", "Not") - 3, stt = at("s6_2", "statues") - 3, Z = 2.3;
    // the editor reads the letter at arm's length; the young man who wrote it stands by (the caption falls between them)
    P(c, EDITOR, 5.45, Z, { expr: c.f >= stt ? "shock" : c.f >= cf ? "nervous" : "neutral", point: 1, facing: -1, look: -1 });
    fx(c, "letterGP", 620, 780, (p) => fxHandLetter(p, "G. P."), 4.78, 1.17, Z - 0.06, 0.5, -0.05);
    P(c, PIERET, 3.5, Z, { expr: "grin", look: c.f >= stt ? -1 : 1, point: c.f >= stt + 1 ? ramp(c.f, stt, stt + 8) : undefined });
    // not her: what he took were small stone heads, and here they are, out of his sack
    picBub(c, no, "monaNoC", 3.5, Z, fxMonaNo, 700, 920, { side: -1, w: 1.25, top: 1.74, f1: stt });
    lootTable(c, Z); fx(c, "sackC", 320, 360, fxSack, 1.05, 0.232, Z - 0.05, 0.38);
    [0, 1, 2].forEach((k) => pop(c, stt + 2 + k * 6, "statue", 320, 440, fxStatue, 2.26 - k * 0.32, 1.025, Z - 0.05, 0.3));
    stamp(c, stt + 22, "STOLEN", 1.94, 1.95, Z - 0.1, 1.2, -0.08);
  } },
  { name: "his name is Gery Pieret", a: at("s6_3") - 4, zone: "office", cam: [[2.72, 2.0, -1.43], [2.72, 1.5, 2.3], 30, 0.0003], draw: (c) => {
    newsroom(c);
    const Z = 2.3;
    // closer: he on the left, his statues on the right, the caption between them (the editor is just out of frame)
    P(c, PIERET, 3.5, Z, { expr: "grin", point: 1 });
    lootTable(c, Z);
    [0, 1, 2].forEach((k) => fx(c, "statue", 320, 440, fxStatue, 2.26 - k * 0.32, 1.025, Z - 0.05, 0.3));
    nameOver(c, at("s6_3", "Géry") - 3, "THE THIEF OF THE STATUES|GÉRY PIERET", 3.5, Z, { w: 1.2 });
  } },
];
