// What happens in every shot of the short "The Pig War" (1859), frame by frame. Portrait: +x is screen-left.
import { fxStars, FARMER, Outfit, FrontOpts, Pen, INK } from "./toon";
import { fxSay, fxCard, fxSparkle, fxBubble, fxSweat, Icon } from "./longtoon";
import { fxMuzzle } from "./emutoon";
import { fxMug, fxStamp, fxBanner } from "./wltoon";
import { fxFlagUS, fxFlagUK, fxWarship, fxCannon, fxRifle, fxPotato, fxGrave } from "./pigtoon";
import { Stage, CamInfo, person, pig, q, lidAt } from "./castbase";
import { FPS, ramp, clamp01 } from "./story";
import { Scene, Show, dust, SIR } from "./scenes";
import talkJson from "./talkP.json";
import { SHOTS_P, camAtP, atP as at, AP, SHORE, CAMPS, HX, BANG, CUT1, RACE } from "./storyP";

const TALK = talkJson as number[];
const talk = (f: number) => TALK[Math.max(0, Math.min(TALK.length - 1, f))] ?? 0;
const T = (f: number) => f / FPS;
export type Who = { i: number; o: Outfit; okey: string };
const US_O: Outfit = { jacket: "#2f4a7a", pants: "#8fb0d6", boots: INK, hat: "cap", cap: "#263a5e", buttons: "#e2bb4c" };
const UK_O: Outfit = { jacket: "#c23b32", pants: "#2e3142", boots: INK, hat: "shako", buttons: "#e2bb4c", sash: "#f4efe0" };
export const U1: Who = { i: 4, o: US_O, okey: "us1" }, U2: Who = { i: 6, o: { ...US_O, skin: "#f5c9a0", moustache: "#5b3a22" }, okey: "us2" }, U3: Who = { i: 9, o: { ...US_O, skin: "#ecd0b6" }, okey: "us3" };
export const B1: Who = { i: 5, o: UK_O, okey: "uk1" }, B2: Who = { i: 8, o: { ...UK_O, skin: "#f5c9a0", moustache: "#8a6a44" }, okey: "uk2" };
export const CUTLAR: Who = { i: 18, o: FARMER, okey: "cutlar" };
export const GRIFFIN: Who = { i: 13, o: { jacket: "#3a3540", pants: "#55504a", boots: INK, hat: "tophat", moustache: "#7a4a2a", build: "stout", buttons: "#c9a94a" }, okey: "griffin" };
export const ADMIRAL: Who = { i: 2, o: { jacket: "#22304f", pants: "#e9e4d2", boots: INK, hat: "peaked", cap: "#22304f", moustache: "#d0d0d6", build: "stout", buttons: "#e2bb4c", sash: "#e2bb4c" }, okey: "admiral" };
export const KAISER: Who = { i: 12, o: { jacket: "#2c3b5a", pants: "#22283a", boots: INK, hat: "peaked", cap: "#2c3b5a", moustache: "#e9e9ee", build: "stout", buttons: "#e2bb4c", sash: "#d98a2b" }, okey: "kaiser" };

export const man = (out: Stage, cam: CamInfo, who: Who, x: number, y: number, z: number, fo: FrontOpts, t: number, shadow = true) =>
  person(out, cam, who, x, y, z, { fo: { mode: "stand", blink: lidAt(t, who.i + 30), ...fo } }, shadow);
export const pop = (f: number, f0: number) => (f - f0 < 5 ? 0.6 + 0.4 * ((f - f0 + 1) / 5) : 1 + 0.012 * Math.sin((f - f0) / 6));
export const card = (out: Stage, f: number, f0: number, key: string, cw: number, ch: number, draw: (p: Pen) => void, x: number, y: number, z: number, w: number, rot = 0) => {
  if (f >= f0) out.fx.push({ key, cw, ch, draw, x, y, z, w: w * pop(f, f0), h: ((w * ch) / cw) * pop(f, f0), rot });
};
export const tag = (out: Stage, f: number, f0: number, head: string, big: string, x: number, y: number, z: number, w: number, fill = "#f6efd8") =>
  card(out, f, f0, `tag|${head}|${big}|${fill}`, 520, 300, (p) => fxCard(p, head, big, fill), x, y, z, w);
export const banner = (out: Stage, f: number, f0: number, s: string, x: number, y: number, z: number, w: number, fill = "#f6efd8") =>
  card(out, f, f0, `ban|${s}|${fill}`, 1000, 260, (p) => fxBanner(p, s, fill), x, y, z, w);
export const say = (out: Stage, f: number, f0: number, s: string, x: number, y: number, z: number, w: number, flip = false) =>
  card(out, f, f0, `say|${s}|${flip}`, 620, 420, (p) => fxSay(p, s, flip), x, y, z, w);
export const bubble = (out: Stage, f: number, f0: number, kind: Icon, x: number, y: number, z: number, w = 1.2, thought = false, flip = false) =>
  card(out, f, f0, `bub|${kind}|${thought}|${flip}`, 520, 420, (p) => fxBubble(p, kind, thought, flip), x, y, z, w);
export const sparkle = (out: Stage, f: number, f0: number, x: number, y: number, z: number, s = 0.5) => {
  const n = f - f0;
  if (n >= 0 && n < 9) for (const [dx, dy, k] of [[-0.3, 0.2, 1], [0.32, 0.12, 0.7], [0.02, 0.42, 0.85]]) out.fx.push({ key: "sparkle", cw: 200, ch: 200, draw: fxSparkle, x: x + dx * (1 + n / 9), y: y + dy * (1 + n / 9), z, w: s * k * (1 - n / 10), h: s * k * (1 - n / 10), rot: n * 0.2 });
};
export const sweat = (out: Stage, f: number, x: number, y: number, z: number) => { const u = (f % 18) / 18; out.fx.push({ key: "sweat", cw: 80, ch: 108, draw: fxSweat, x, y: y - 0.18 * u, z, w: 0.13, h: 0.175, opacity: 1 - u * 0.5 }); };
/** a flag on its pole (pole at x; the cloth flies toward the middle of the picture) */
export const flag = (out: Stage, f: number, us: boolean, poleX: number, z: number, w = 1.7) => {
  const wv = q(0.5 + 0.5 * Math.sin(f / 7 + (us ? 0 : 2)), 6), h = (w * 720) / 520, off = 0.423 * w;
  if (us) out.fx.push({ key: `flagUS${wv}`, cw: 520, ch: 720, draw: (p) => fxFlagUS(p, wv * 2), x: poleX - off, y: h / 2, z, w, h });
  else out.fx.push({ key: `flagUK${wv}`, cw: 520, ch: 720, draw: (p) => { p.g.save(); p.g.translate(520, 0); p.g.scale(-1, 1); fxFlagUK(p, wv * 2); p.g.restore(); }, x: poleX + off, y: h / 2, z, w, h });
};
/** a warship on the strait; its waterline sits on the sea */
export const ship = (out: Stage, x: number, z: number, w = 6) => { const h = w * 0.76; out.fx.push({ key: "warship", cw: 1000, ch: 760, draw: fxWarship, x, y: h / 2 - (60 / 760) * h + 0.04, z, w, h }); };
const cannons = (out: Stage, n: number) => {
  let k = 0;
  for (const [row, m] of [[0, 5], [1, 5], [2, 4]]) for (let c = 0; c < m; c++, k++) if (k < n) out.fx.push({ key: "cannon", cw: 420, ch: 260, draw: fxCannon, x: SHORE + (c - (m - 1) / 2) * 0.88, y: 0.27, z: 3 + row * 2, w: 0.85, h: 0.53 });
};

export const sceneAtP = (id: number, f: number, cam: CamInfo): Scene => {
  const out: Scene = { places: [], fx: [], guns: [], crates: [], fan: f * 0.07 };
  const t = T(f), a = AP[id], n = f - a;
  const sir = (x: number, z: number, fo: FrontOpts = {}) => person(out, cam, SIR, x, 0, z, { fo: { mode: "stand", expr: "smile", blink: lidAt(t, 3), ...fo }, talk: talk(f) });
  switch (id) {
    case 1: case 2: {
      // two armies, one pig. Sir Digsworth tells it from the front
      const pg = at("hook1", "pig") - 2, the = at("hook2", "The") - 2;
      if (id === 1) { if (f < CUT1) sir(HX, -6.6); flag(out, f, true, HX + 1.9, 3.6); flag(out, f, false, HX - 1.9, 3.6); }
      if (id === 1) { man(out, cam, U1, HX + 1.35, 0, 1.9, { expr: "stern", look: -1 }, t); man(out, cam, B1, HX - 1.35, 0, 1.9, { expr: "stern", look: 1 }, t); }
      pig(out, cam, { x: HX, z: 1.6, mode: "stand", expr: (id === 1 && f >= pg) || (id === 2 && f >= the) ? "shock" : "calm", blink: lidAt(t, 61) });
      if (id === 2) { tag(out, f, at("hook2", "casualties") - 2, "CASUALTIES", "1", HX, 1.52, 1.6, 1.1); if (f >= the) sweat(out, f, HX - 0.3, 0.92, 1.5); }
      break;
    }
    case 3: {
      // one island, two flags
      const c0 = at("island", "claimed") - 2, nb = at("island", "nobody") - 2;
      flag(out, f, true, HX + 1.9, 2); flag(out, f, false, HX - 1.9, 2);
      man(out, cam, U1, HX + 0.85, 0, 0.3, { expr: "stern", look: -1, point: f >= c0 ? 0.6 : undefined }, t);
      man(out, cam, B1, HX - 0.85, 0, 0.3, { expr: "stern", look: 1 }, t);
      if (f < nb) { say(out, f, c0, "Mine!", HX + 0.92, 2.85, 0.3, 1.2, true); say(out, f, c0 + 9, "Mine!", HX - 0.92, 2.85, 0.3, 1.2); }
      else bubble(out, f, nb, "q", HX, 2.95, 0.3, 1.25, true);
      break;
    }
    case 4: {
      // the potato patch: the pig eats its way along the row; the farmer finds it
      const dead = f >= BANG, px = dead ? 2.7 : 2.7 + 0.003 * (BANG - f), fm = at("shot", "farmer") - 4, close = false;
      for (const z of [1.0, 2.0]) for (const x of [1.3, 2.5, 3.7]) { const eaten = px - 0.5 < x && z === 1.0; out.fx.push({ key: `potato${eaten}`, cw: 220, ch: 220, draw: (p) => fxPotato(p, eaten), x, y: 0.26, z, w: 0.52, h: 0.52 }); }
      pig(out, cam, { x: px, z: 1.45, mode: dead ? "dead" : "eat", k: f / 9, blink: 0 });
      dust(out, f, BANG, px, 0.1, 1.3, 1.2);
      if (dead) { const s = q((t * 0.9) % 1, 30); out.fx.push({ key: `stars${s}`, cw: 420, ch: 210, draw: (p) => fxStars(p, s), x: px - 0.42, y: 0.95, z: 1.4, w: 0.6, h: 0.3 }); }
      if (f >= fm && !close) {
        const fxr = 1.15 - 0.9 * (1 - ramp(f, fm, fm + 12)), aim = f >= BANG - 14;
        man(out, cam, CUTLAR, fxr, 0, 1.3, f < fm + 12 ? { mode: "march", phase: (n / 9) % 1, expr: "stern" } : { expr: f >= BANG ? "stern" : f >= at("shot", "found") - 2 ? "shock" : "neutral", look: 1 }, t);
        if (aim) out.fx.push({ key: "rifle", cw: 560, ch: 120, draw: (p) => { p.g.save(); p.g.translate(560, 0); p.g.scale(-1, 1); fxRifle(p); p.g.restore(); }, x: fxr + 0.52, y: 1.18, z: 1.25, w: 0.75, h: 0.16 });
        if (f >= BANG && f < BANG + 3) out.fx.push({ key: `muzzle${f - BANG + 1}`, cw: 300, ch: 300, draw: (p) => fxMuzzle(p, f - BANG + 1), x: fxr + 0.95, y: 1.2, z: 1.24, w: 0.6, h: 0.6 });
      }
      break;
    }
    case 5: {
      man(out, cam, CUTLAR, HX + 0.9, 0, 0, { expr: "nervous", look: -1, shrug: f >= at("money", "10") - 2 ? 0.6 : undefined }, t);
      man(out, cam, GRIFFIN, HX - 0.9, 0, 0, { expr: "stern", look: 1, point: f >= at("money", "wanted") - 2 ? 0.7 : undefined }, t);
      pig(out, cam, { x: HX, z: 1.4, mode: "dead", scale: 0.55 });
      tag(out, f, at("money", "10") - 2, "OFFER", "$10", HX + 0.72, 2.7, 0, 0.85);
      tag(out, f, at("money", "100") - 2, "DEMAND", "$100", HX - 0.72, 2.7, 0, 0.85, "#ffd9c9");
      break;
    }
    case 6: case 7: {
      // the shore: American soldiers (and cannons) below, British warships on the strait above
      const s0 = at("troops", "soldiers") - 6, w0 = at("troops", "warships") - 5, five = at("peak", "5") - 2;
      const z = id === 6 ? 3 : 10;
      if (id === 7 || f >= s0) [U1, U2, U3].forEach((w, k) => {
        const x = SHORE + (1 - k) * 1.1, sl = id === 6 ? 3.2 * (1 - ramp(f, s0 + k * 3, s0 + 16 + k * 3)) : 0;
        man(out, cam, w, x + sl, 0, z, sl > 0.02 ? { mode: "march", phase: (n / 8 + k * 0.3) % 1, expr: "stern" } : { expr: "stern" }, t);
      });
      flag(out, f, true, SHORE + 2.05, id === 6 ? 4.5 : 11.5);
      ([-3.3, 0, 3.3, -6.6, 6.6]).forEach((x, k) => {
        const f0 = k < 3 ? (id === 6 ? w0 + k * 3 : -999) : five + (k - 3) * 6;
        if (id === 6 && k >= 3) return;
        if (f >= f0) ship(out, SHORE + (id === 6 ? x * 1.36 : x * 0.78) + (k === 4 ? 9 : -9) * (1 - ramp(f, f0, f0 + (id === 6 ? 12 : 20))), 28, id === 6 ? 4.2 : 2.4);
      });
      if (id === 7) {
        cannons(out, 14);
        const c: [string, string, string][] = [["461", "AMERICANS", "461"], ["14", "CANNONS", "14"], ["5", "WARSHIPS", "5"], ["2,140", "MEN", "2,140"]];
        let cur = -1; c.forEach(([w], k) => { if (f >= at("peak", w) - 2) cur = k; });
        if (cur >= 0) tag(out, f, at("peak", c[cur][0]) - 2, c[cur][1], c[cur][2], SHORE, 10.6, 30, 6.5, cur < 2 ? "#dfe9ff" : "#ffe1dc");
      }
      break;
    }
    case 8: {
      // the admiral, on his own deck, will not have it
      const r0 = at("admiral", "refused") - 3;
      man(out, cam, ADMIRAL, 8, 3.76, 9.2, { expr: f >= r0 ? "stern" : "neutral", shrug: f >= r0 ? ramp(f, r0, r0 + 8) : undefined }, t, false);
      say(out, f, r0, "A war...|over a PIG?", 8, 6.48, 9.2, 1.6);
      break;
    }
    case 9: case 10: {
      // two camps on one island
      flag(out, f, true, CAMPS + 1.95, 3.5); flag(out, f, false, CAMPS - 1.95, 3.5);
      if (id === 9) {
        man(out, cam, U1, CAMPS + 0.55, 0, 0.5, { expr: "smile", look: -1 }, t); man(out, cam, U2, CAMPS + 1.3, 0, 0.5, { expr: "smile", look: -1 }, t);
        man(out, cam, B1, CAMPS - 0.55, 0, 0.5, { expr: "smile", look: 1 }, t); man(out, cam, B2, CAMPS - 1.3, 0, 0.5, { expr: "smile", look: 1 }, t);
        banner(out, f, at("share", "12") - 2, "TOGETHER FOR|12 YEARS", CAMPS, 3.5, 0.5, 2.3, "#fff3c4");
      } else {
        const cl = at("sports", "holidays") - 4, u = ramp(f, cl, cl + 8), ru = clamp01((f - RACE) / (SHOTS_P[9].b - RACE - 4));
        if (f < RACE) {
          man(out, cam, U1, CAMPS + 0.75, 0, 0, { expr: "laugh", look: -1 }, t); man(out, cam, B1, CAMPS - 0.75, 0, 0, { expr: "laugh", look: 1 }, t);
          for (const s of [-1, 1]) out.fx.push({ key: "mug", cw: 200, ch: 200, draw: fxMug, x: CAMPS + s * (0.42 - 0.26 * u), y: 1.15 + 0.3 * u, z: -0.3, w: 0.3, h: 0.3, rot: s * 0.25 * u });
          sparkle(out, f, cl + 8, CAMPS, 1.6, -0.35, 0.4);
        } else {
          person(out, cam, U2, CAMPS + 1.1 - 1.6 * ru, 0, 2.2, { side: true, so: { mode: "march", phase: (ru * 5) % 1 } });
          person(out, cam, B2, CAMPS + 0.1 - 2.0 * ru, 0, 3.0, { side: true, so: { mode: "march", phase: (ru * 5 + 0.5) % 1 } });
          banner(out, f, RACE, "SPORTS DAY", CAMPS - 0.3, 3.5, 3.5, 2.4, "#fff3c4");
        }
      }
      break;
    }
    case 11: {
      // the referee: the German emperor
      out.office = "minister";
      const am = at("kaiser", "America") - 3;
      person(out, cam, KAISER, -2.2, 0.4, 2.3, { fo: { mode: "stand", expr: f >= am ? "smile" : "stern", blink: lidAt(t, 39) } });
      banner(out, f, a + 8, "THE GERMAN EMPEROR|WILHELM I", -2.2, 3.5, 2.3, 1.85);
      card(out, f, am, "stampA", 640, 220, (p) => fxStamp(p, "AMERICAN"), -2.2, 2.72, 1.6, 1.6, 0.1);
      break;
    }
    case 12: {
      sir(0.45, -1.2, { shrug: n > 40 ? ramp(f, a + 40, a + 48) : undefined });
      out.fx.push({ key: "gravePig", cw: 420, ch: 480, draw: (p) => fxGrave(p, "R.I.P.|THE PIG|1859"), x: -0.6, y: 0.86, z: 3, w: 1.5, h: 1.72 });
      break;
    }
  }
  return out;
};
export const PIG_SHOW: Show = { shots: SHOTS_P, camAt: camAtP, sceneAt: sceneAtP, crowdFor: () => null, wheatAt: () => 1 };
