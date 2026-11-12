// What happens in every shot of the long Wojtek film "The Bear Who Joined the Army", frame by frame.
// The camera stands at -z and looks toward +z in almost every shot, so +x is screen-left.
import { fxBurst, fxStars, POLE, POLE2, POLE3, BRIT_OFFICER, VETERAN, VETERAN2, FARMER, FARMER2, FARMER3, PARENT, CAMERAMAN, Outfit, FrontOpts, Pen } from "./toon";
import { fxBadge } from "./beartoon";
import { fxSay, fxCard, fxNoPets, fxSparkle, fxBubble, fxSweat, Icon } from "./longtoon";
import { fxMuzzle, fxSmoke } from "./emutoon";
import { fxCig, fxMug, fxStamp, fxBanner, fxRoadSign, fxCrateOpen, fxBigCrate, fxSheep, fxBulb, fxArrow } from "./wltoon";
import { Stage, CamInfo, person, bear, q, lidAt, hh } from "./castbase";
import { FPS, V3, ramp, clamp01, hillY } from "./story";
import { Scene, Show, TruckS, dust, SIR } from "./scenes";
import { board } from "./scenesLong";
import talkJson from "./talkWL.json";
import { SHOTS_WL, camAtWL, at, A, X0, truckXL, GUNS_WL, HE, NV, SET, carryL } from "./storyWL";

const TALK = talkJson as number[];
const talk = (f: number) => TALK[Math.max(0, Math.min(TALK.length - 1, f))] ?? 0;
const T = (f: number) => f / FPS;
type Who = { i: number; o: Outfit; okey: string };
const P1: Who = { i: 4, o: POLE, okey: "pole1" }, P2: Who = { i: 6, o: POLE2, okey: "pole2" }, P3: Who = { i: 9, o: POLE3, okey: "pole3" };
const P4: Who = { i: 11, o: { ...POLE, skin: "#f0c39a", cap: "#5a5738" }, okey: "pole4" };
const LT: Who = { i: 10, o: { ...POLE, hat: "peaked", cap: "#5d5a3a", moustache: "#3b2a1e" }, okey: "polelt" };
const BOY: Who = { i: 23, o: { jacket: "#d9c7a0", pants: "#7a6a58", boots: "#5a3b2a", hat: "hair", hair: "#2f2a2a", skin: "#c99067" }, okey: "boy" };
const OFF: Who = { i: 2, o: BRIT_OFFICER, okey: "brit" };
const TOMMY: Who = { i: 17, o: { ...BRIT_OFFICER, build: undefined, moustache: undefined, hat: "cap", cap: "#6f6c48" }, okey: "tommy" };
const V1: Who = { i: 12, o: VETERAN, okey: "vet1" }, V2: Who = { i: 14, o: VETERAN2, okey: "vet2" }, V3v: Who = { i: 15, o: { ...VETERAN, jacket: "#4f5a4a", cap: "#3d4438", hair: "#d0d0d6" }, okey: "vet3" };
const LOCALS: Who[] = [{ i: 18, o: FARMER, okey: "farmer" }, { i: 19, o: FARMER2, okey: "farmer2" }, { i: 20, o: FARMER3, okey: "farmer3" }];
const KID1: Who = { i: 21, o: { ...PARENT, jacket: "#c9603c" }, okey: "kid1" }, KID2: Who = { i: 22, o: { ...PARENT, jacket: "#3f8a8a", hair: "#c9a04a" }, okey: "kid2" };
const CAMMAN: Who = { i: 16, o: CAMERAMAN, okey: "camman" };

const man = (out: Stage, cam: CamInfo, who: Who, x: number, y: number, z: number, fo: FrontOpts, t: number, shadow = true) =>
  person(out, cam, who, x, y, z, { fo: { mode: "stand", blink: lidAt(t, who.i + 30), ...fo } }, shadow);
const pop = (f: number, f0: number) => (f - f0 < 5 ? 0.6 + 0.4 * ((f - f0 + 1) / 5) : 1 + 0.012 * Math.sin((f - f0) / 6));
const card = (out: Stage, f: number, f0: number, key: string, cw: number, ch: number, draw: (p: Pen) => void, x: number, y: number, z: number, w: number, rot = 0) => {
  if (f >= f0) out.fx.push({ key, cw, ch, draw, x, y, z, w: w * pop(f, f0), h: ((w * ch) / cw) * pop(f, f0), rot });
};
const tag = (out: Stage, f: number, f0: number, head: string, big: string, x: number, y: number, z: number, w: number, fill = "#f6efd8") =>
  card(out, f, f0, `tag|${head}|${big}|${fill}`, 520, 300, (p) => fxCard(p, head, big, fill), x, y, z, w);
const banner = (out: Stage, f: number, f0: number, s: string, x: number, y: number, z: number, w: number, fill = "#f6efd8") =>
  card(out, f, f0, `ban|${s}|${fill}`, 1000, 260, (p) => fxBanner(p, s, fill), x, y, z, w);
const bubble = (out: Stage, f: number, f0: number, kind: Icon, x: number, y: number, z: number, w = 1.2, thought = false, flip = false) =>
  card(out, f, f0, `bub|${kind}|${thought}|${flip}`, 520, 420, (p) => fxBubble(p, kind, thought, flip), x, y, z, w);
const sparkle = (out: Stage, f: number, f0: number, x: number, y: number, z: number, s = 0.5) => {
  const n = f - f0;
  if (n >= 0 && n < 9) for (const [dx, dy, k] of [[-0.3, 0.2, 1], [0.32, 0.12, 0.7], [0.02, 0.42, 0.85]]) out.fx.push({ key: "sparkle", cw: 200, ch: 200, draw: fxSparkle, x: x + dx * (1 + n / 9), y: y + dy * (1 + n / 9), z, w: s * k * (1 - n / 10), h: s * k * (1 - n / 10), rot: n * 0.2 });
};
const sweat = (out: Stage, f: number, x: number, y: number, z: number) => { const u = ((f % 18) / 18); out.fx.push({ key: "sweat", cw: 80, ch: 108, draw: fxSweat, x, y: y - 0.18 * u, z, w: 0.13, h: 0.175, opacity: 1 - u * 0.5 }); };
const blinkB = (f: number) => lidAt(T(f), 77);
const truckAt = (x: number, z: number, yaw: number, f = 0, moving = false): TruckS => ({
  x, z, yaw, y: moving ? 0.03 * Math.abs(Math.sin(f * 0.55)) : 0, pitch: moving ? 0.012 * Math.sin(f * 0.4) : 0, roll: 0, wheel: moving ? x / 0.43 : 0,
  wheelY: [0, 0, 0, 0], gunPitch: 0, gunYaw: 0, gunLift: 0, noGun: true,
});
const crates = (list: number[][]) => list.map(([x, y, z, yaw]) => ({ pos: [x, y, z] as V3, yaw }));
/** the 25-pounder: recoil, muzzle flash, and the shell bursting on the hill a little later */
const gunFire = (out: Scene, f: number, shots: number[], gp: V3) => {
  const sh = shots.find((s) => f >= s && f < s + 10);
  out.fieldGun = { pos: gp, yaw: 0.1, recoil: sh !== undefined ? Math.max(0, 1 - (f - sh) / 9) : 0 };
  if (sh !== undefined && f - sh < 2) out.fx.push({ key: `muzzle${f - sh + 1}`, cw: 300, ch: 300, draw: (p) => fxMuzzle(p, f - sh + 1), x: gp[0] + 0.28, y: 1.85, z: gp[2] + 2.7, w: 1.5, h: 1.5 });
  for (const s of shots) { const n = f - s - 18; if (n >= 0 && n < 16) { const hx = -40 + 80 * hh(s, 3), hz = 150 + 50 * hh(s, 5), u = q(n / 16, 8); out.fx.push({ key: `burst${u}`, cw: 500, ch: 500, draw: (p) => fxBurst(p, u, "#ffd9a0", 9), x: hx, y: hillY(hx, hz) + 6, z: hz, w: 26, h: 26 }); } }
};
const zooBoard = (out: Scene, pos: V3) => { out.board = { pos, key: "zoo", draw: (g) => {
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = "#2f4a3c"; g.fillRect(0, 0, 1024, 756); g.strokeStyle = "#e9e4d2"; g.lineWidth = 8; g.strokeRect(22, 22, 980, 712);
  g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#ffe27a"; g.font = "900 150px 'Arial Black', Impact, sans-serif"; g.fillText("EDINBURGH", 512, 270); g.fillStyle = "#ffffff"; g.font = "900 230px 'Arial Black', Impact, sans-serif"; g.fillText("ZOO", 512, 520);
} }; };

// Monte Cassino lay-out (shots 26-32): the gun on the left, the truck at the back, the stack on the right
const GUN: V3 = [2.6, 0, 3.6], G12 = [[-2.0, 0, -0.5, 0.05], [-1.14, 0, -0.45, -0.06]], C3 = [-1.57, 0.42, -0.48, 0.02], C4 = [-1.57, 0.84, -0.48, -0.03];

export const sceneAtWL = (id: number, f: number, cam: CamInfo): Scene => {
  const out: Scene = { places: [], fx: [], guns: [], crates: [], fan: f * 0.07 };
  const t = T(f), a = A[id], n = f - a;
  const sir = (x: number, z: number, fo: FrontOpts = {}) => person(out, cam, SIR, x, 0, z, { fo: { mode: "stand", expr: "smile", blink: lidAt(t, 3), ...fo }, talk: talk(f) });
  const wav = (on: boolean, ph = 0) => (on ? q(Math.sin(f / 3.2 + ph), 4) : undefined);
  const chr = (f0: number, ph = 0) => (f >= f0 ? q(0.7 + 0.3 * Math.sin(f * 0.5 + ph), 4) : undefined);
  switch (id) {
    case 1: {
      // Sir Digsworth in front of the battle: the gun fires at the abbey hill behind him
      sir(1.5, -4.6);
      gunFire(out, f, GUNS_WL[1], [-2.6, 0, 3.2]);
      person(out, cam, P2, -2.7, 0, 1.8, { fo: { mode: "stand", back: true, blink: 0 } });
      out.truck = truckAt(3.6, 12.5, Math.PI / 2 + 0.25);
      tag(out, f, at("hook2", "six") - 2, "HEIGHT", "5 FT 11", -0.1, 2.4, -4.4, 1.15);
      tag(out, f, at("hook2", "beer") - 2, "FAVOURITE", "BEER", -1.4, 2.4, -4.4, 1.15, "#fff3c4");
      break;
    }
    case 2: {
      // the line-up: four soldiers, and the one in the middle is a bear
      const gl = n > 16;
      ([[3.2, P1], [1.6, P2], [-1.6, P3], [-3.2, P4]] as [number, Who][]).forEach(([x, w]) => man(out, cam, w, x, 0, 0.15, { expr: gl ? "nervous" : "stern", look: gl ? (x > 0 ? -1 : 1) : 0 }, t));
      bear(out, cam, { x: 0, z: 0, cap: true, pose: "salute", k: ramp(f, a + 3, a + 10), expr: "proud", blink: blinkB(f) });
      break;
    }
    case 3: {
      const w0 = at("intro", "Wojtek") - 3;
      sir(1.5, -4.2, { wave: wav(n > 4 && n < 56) });
      bear(out, cam, { x: -1.3, z: -0.8, cap: true, pose: f >= w0 ? "wave" : "stand", k: f >= w0 ? (f - w0) / 6 : 1, expr: f >= w0 ? "happy" : "calm", blink: blinkB(f) });
      tag(out, f, w0, "SOLDIER BEAR", "WOJTEK", -1.3, 2.95, -0.8, 2.0, "#fff3c4");
      break;
    }
    case 4: {
      // a truck and a marching column on the road through Iran
      const x = truckXL(4, f);
      out.truck = truckAt(x, 0, 0, f, true);
      [P1, P2, P3, P4].forEach((w, k) => person(out, cam, w, x - 3.4 - k * 1.3, 0, 1.7, { side: true, so: { mode: "march", phase: (x / 1.6 + k * 0.5) % 1 } }));
      tag(out, f, a + 8, "SPRING 1942", "IRAN", x - 5.4, 3.45, -1.5, 2.3);
      break;
    }
    case 5: case 6: {
      // by the road near Hamadan: a boy with a bear cub, a lieutenant with a coin
      out.truck = truckAt(3.4, 5.6, Math.PI);
      const sad = id === 5 && f >= at("boy", "Hunters") - 4, c0 = at("buy", "cub") - 4, got = id === 6 && f >= c0, u = got ? clamp01((f - c0) / 10) : 0;
      man(out, cam, LT, 0.6, 0, 0, { expr: got ? "grin" : sad ? "pained" : "smile", look: -1 }, t);
      man(out, cam, P1, 1.9, 0, 0.3, { expr: sad ? "pained" : "smile", look: -1 }, t);
      man(out, cam, P2, 3.1, 0, 0.1, { expr: sad ? "pained" : "smile", look: -1 }, t);
      person(out, cam, BOY, -1.3, 0, 0, { scale: 0.7, fo: { mode: "stand", expr: got ? "grin" : sad ? "pained" : "smile", look: 1, blink: lidAt(t, 44) } });
      bear(out, cam, { x: -1.3 + 1.05 * u, y: 0.42 * (1 - u) + 0.5 * Math.sin(Math.PI * u), z: -0.25, cub: true, scale: 0.34 + 0.06 * u, pose: u >= 1 ? "cheer" : "sit", k: ramp(f, c0 + 10, c0 + 16),
        expr: u >= 1 ? "happy" : sad ? "sleepy" : "calm", blink: sad ? 0.6 : blinkB(f), shadow: u >= 1 });
      if (id === 6 && f < c0 + 14) bubble(out, f, at("buy", "buys") - 2, "coin", 0.6, 2.7, 0, 1.15);
      break;
    }
    case 7: {
      const j = at("join", "joins") - 2;
      out.truck = truckAt(0.6, 4.8, Math.PI / 2 - 0.2);
      ([[3.4, P1], [2.0, P2], [-2.0, P3], [-3.4, P4]] as [number, Who][]).forEach(([x, w], i) => man(out, cam, w, x, 0, 0.3, { expr: f >= j ? "grin" : "smile", look: x > 0 ? -1 : 1, cheer: chr(j + i * 2, i) }, t));
      bear(out, cam, { x: 0, z: -0.3, cub: true, pose: f >= j ? "cheer" : "sit", k: ramp(f, j, j + 7), expr: f >= j ? "happy" : "calm", blink: blinkB(f) });
      banner(out, f, at("join", "army") - 2, "AUGUST 1942|2nd TRANSPORT COMPANY", 0, 3.45, 0.3, 3.0);
      break;
    }
    case 8: case 9: {
      const feed = id === 9 || f >= at("milk", "feed") - 3;
      if (id === 8) man(out, cam, P1, 1.9, 0, 0.3, { expr: feed ? "smile" : "nervous", look: -1 }, t);
      bear(out, cam, { x: -0.2, z: -0.6, cub: true, pose: feed ? "drink" : "sit", k: feed ? 0.85 + 0.15 * Math.sin(f / 4) : 1, expr: feed ? "happy" : "sleepy", blink: feed ? blinkB(f) : 0.5 });
      if (id === 9) tag(out, f, at("name", "Wojtek") - 3, "HIS NAME", "WOJTEK", -0.2, 1.47, -0.6, 0.8, "#fff3c4");
      break;
    }
    case 10: case 11: {
      // he grows; the menu goes up on the board; beer
      const g0 = at("menu", "grows") - 2, grown = id === 11 || f >= g0, drink = id === 11 && f >= at("beer", "beer") - 4;
      bear(out, cam, { x: 1.2, z: 0, cub: !grown, scale: grown ? 1.02 * (id === 10 && f - g0 < 6 ? 0.8 + 0.2 * ((f - g0) / 6) : 1) : 0.5, pose: drink ? "drink" : "stand",
        k: drink ? ramp(f, at("beer", "beer") - 4, at("beer", "beer") + 5) * (0.9 + 0.1 * Math.sin(f / 5)) : 1, expr: drink ? "happy" : "calm", blink: blinkB(f) });
      if (id === 10) dust(out, f, g0, 1.2, 0, -0.3, 1.5);
      man(out, cam, P1, 2.9, 0, 0.3, { expr: id === 10 && grown && f < g0 + 24 ? "shock" : "smile", look: -1 }, t);
      if (id === 11 && f >= at("beer", "beer", 1) - 2) board(out, [-2.4, 0, 1.0], "FAVOURITE DRINK", [{ l: "BEER", y: 450, lpx: 250, cx: 512, lc: "#ffe27a" }]);
      else board(out, [-2.4, 0, 1.0], "WOJTEK'S MENU", ["fruit", "marmalade", "honey", "syrup"].filter((w) => id === 11 || f >= at("menu", w) - 2).map((w, i) => ({ l: w.toUpperCase(), y: 282 + i * 116, lpx: 82 })));
      break;
    }
    case 12: {
      const c0 = at("cig", "cigarettes") - 2, sm = at("cig", "smokes") - 2, eat = at("cig", "eats") - 3;
      bear(out, cam, { x: 0, z: 0, pose: "stand", expr: f >= eat ? "happy" : "calm", blink: f >= eat && f < eat + 14 ? 1 : blinkB(f) });
      if (f >= c0 && f < eat) {
        out.fx.push({ key: "cig", cw: 300, ch: 80, draw: fxCig, x: -0.3, y: 1.38, z: -0.35, w: 0.42 * pop(f, c0), h: 0.112 * pop(f, c0), rot: 0.12 });
        if (f >= sm) { const u = q(((f - sm) % 24) / 24, 12); out.fx.push({ key: `smoke${u}`, cw: 300, ch: 300, draw: (p) => fxSmoke(p, u), x: -0.55, y: 1.58 + 0.35 * u, z: -0.36, w: 0.42, h: 0.42, soft: true, opacity: 0.85 * (1 - u * 0.6) }); }
      }
      sparkle(out, f, eat, -0.15, 1.3, -0.4, 0.35);
      man(out, cam, P2, 2.2, 0, 0.4, { expr: f >= eat ? "shock" : f >= sm ? "nervous" : "smile", look: -1 }, t);
      break;
    }
    case 13: {
      const d0 = at("coffee", "drinks") - 3, up = ramp(f, d0, d0 + 8);
      bear(out, cam, { x: 0.5, z: 0, pose: "stand", expr: f >= d0 ? "happy" : "sleepy", blink: f >= d0 + 6 ? 1 : blinkB(f) });
      out.fx.push({ key: "mug", cw: 200, ch: 200, draw: fxMug, x: 0.02 + 0.3 * up, y: 0.98 + 0.4 * up, z: -0.35, w: 0.36, h: 0.36, rot: -0.5 * up });
      if (f < d0) { const u = q((f % 30) / 30, 10); out.fx.push({ key: `smoke${u}`, cw: 300, ch: 300, draw: (p) => fxSmoke(p, u), x: 0.04, y: 1.25 + 0.3 * u, z: -0.36, w: 0.3, h: 0.3, soft: true, opacity: 0.6 * (1 - u * 0.7) }); }
      man(out, cam, P1, -1.6, 0, 0.3, { expr: n < 30 ? "relief_open" : "smile", look: 1 }, t);
      break;
    }
    case 14: {
      // dusk by the tent: the bear asleep between two soldiers
      bear(out, cam, { x: 4.4, z: 3.4, pose: "sit", expr: "sleepy", blink: 1 });
      person(out, cam, P1, 5.9, 0, 3.5, { fo: { mode: "sit", expr: "smile_closed", blink: 1 } });
      person(out, cam, P2, 2.9, 0, 3.5, { fo: { mode: "sit", expr: "smile_closed", blink: 1 } });
      out.fx.push({ key: "zzz", cw: 620, ch: 420, draw: (p) => fxSay(p, "Z z z"), x: 3.55, y: 2.15 + 0.08 * Math.sin(n / 9), z: 3.3, w: 0.95, h: 0.64 });
      break;
    }
    case 15: {
      // he wrestles one of them flat, salutes, and marches on his hind legs
      const W = at("copy", "wrestles"), SL = at("copy", "salute") - 4, M = at("copy", "marches") - 4;
      const march = f >= M, zz = march ? -1.0 * T(f - M) : 0, ph = march ? T(f - M) / 1.3 : 0;
      const thrown = f >= W + 8, u = clamp01((f - (W + 8)) / 9), land = f >= W + 17;
      const mo = (k: number): FrontOpts => (march ? { mode: "march", phase: (ph + k * 0.5) % 1, expr: "grin", lift: 60 } : { expr: f >= W + 8 && f < SL ? "laugh" : "smile" });
      man(out, cam, P1, 1.9, 0, 0.2 + zz, mo(0), t); man(out, cam, P3, 3.3, 0, 0.2 + zz, mo(1), t); man(out, cam, P4, -3.3, 0, 0.2 + zz, mo(1), t);
      if (!thrown) man(out, cam, P2, -1.9, 0, 0.2, { expr: f >= W ? "nervous" : "smile" }, t);
      else if (!land) person(out, cam, P2, -1.9, 1.7 * Math.sin(Math.PI * u), 0.2, { fo: { mode: "fall", expr: "shock", tilt: 60 * u, blink: 0 } }, false);
      else { person(out, cam, P2, -1.9, 0, 0.2, { fo: { mode: "sit", expr: "dazed", blink: 0 } }); const s = q((t * 0.9) % 1, 30); out.fx.push({ key: `stars${s}`, cw: 420, ch: 210, draw: (p) => fxStars(p, s), x: -1.9, y: 1.4, z: 0.2, w: 0.75, h: 0.37 }); }
      dust(out, f, W + 17, -1.9, 0, 0, 1.1);
      const wres = f >= W && f < SL;
      bear(out, cam, { x: 0, z: zz, pose: march ? "stand" : wres ? "cheer" : f >= SL ? "salute" : "stand", k: wres ? 1 : ramp(f, SL, SL + 7), walk: march, phase: ph + 0.25,
        expr: wres ? "happy" : f >= SL && !march ? "proud" : "calm", cap: f >= SL, blink: blinkB(f) });
      break;
    }
    case 16: {
      // on the road: three countries go by, the bear rides in the back
      const x = truckXL(16, f);
      out.truck = truckAt(x, 0, 0, f, true);
      bear(out, cam, { x: x - 1.35, y: 0.78 + out.truck.y, z: -0.05, scale: 0.8, pose: "stand", expr: "happy", blink: blinkB(f), shadow: false });
      for (const s of ["Iraq", "Syria", "Egypt"]) out.fx.push({ key: "rs" + s, cw: 400, ch: 640, draw: (p) => fxRoadSign(p, s.toUpperCase()), x: truckXL(16, at("travel", s)) - 0.4, y: 1.75, z: -2.6, w: 2.2, h: 3.5 });
      break;
    }
    case 17: case 18: case 19: {
      // the quay in Egypt: the file goes aboard, the officer stops the bear; the soldiers have an idea
      const rampY = (z: number) => Math.max(0, Math.min(3.6, ((z - 4.0) / 4.8) * 3.6));
      const stopF = at("ship", "rule") - 8, noF = at("ship", "no") - 3, stop = id === 19 || (id === 18 && f >= stopF);
      const idea = at("idea", "idea") - 2, pet = at("idea", "pet") - 2, sol = at("idea", "soldier") - 3, made = id === 19 && f >= sol;
      if (id === 18) for (let k = 0; k < 3; k++) {
        const z = 4.6 + 2.0 * T(n) - k * 1.6;
        if (z > -1 && z < 9) person(out, cam, [P3, P4, P3][k], 3.2, rampY(z), z, { fo: { mode: "stroll", back: true, phase: (z / 1.4 + k * 0.3 + 4) % 1, lift: 60, blink: 0 } }, z < 4);
      }
      man(out, cam, OFF, 2.45, 0, 3.3, { expr: made ? "shock" : "stern", wave: id === 18 && stop ? 0 : undefined }, t);
      if ((id === 18 && f >= noF) || id === 19) card(out, f, id === 18 ? noF : a - 40, "nopets", 300, 300, fxNoPets, 2.45, 2.75, 3.3, 0.8);
      const gr = id === 19 && f >= idea;
      man(out, cam, P1, -0.2, 0, 2.5, { expr: made || gr ? "grin" : stop ? "shock" : "smile", look: 1, cheer: made ? chr(sol + 2) : undefined }, t);
      man(out, cam, P2, -1.35, 0, 2.5, { expr: made || gr ? "grin" : stop ? "shock" : "smile", look: 1, cheer: made ? chr(sol + 5, 1) : undefined }, t);
      bear(out, cam, { x: 1.2, z: 2.3, cap: made, pose: made ? "salute" : "stand", k: ramp(f, sol + 2, sol + 9), expr: made ? "proud" : stop ? "sleepy" : "calm", blink: blinkB(f) });
      if (id === 17) bubble(out, f, at("problem", "problem") - 2, "bang", -0.2, 2.9, 2.5, 1.2);
      if (id === 19) {
        if (f < pet) card(out, f, idea, "bulb", 200, 260, fxBulb, -0.2, 2.75, 2.5, 0.62);
        else if (!made) bubble(out, f, pet, "no", 1.2, 3.0, 2.3, 1.3, true);
        sparkle(out, f, sol, 1.2, 1.75, 2.1, 0.5);
      }
      break;
    }
    case 20: case 21: {
      // the orderly room: Wojtek is enlisted; then his papers
      out.office = "minister";
      const en = at("enlist", "enlisted") - 2, pv = at("enlist", "private") - 3;
      person(out, cam, P3, -2.2, 0, 2.3, { fo: { mode: "stand", expr: f >= en ? "grin" : "stern", look: 1, blink: lidAt(t, 39) } });
      bear(out, cam, { x: 0.6, z: 1.2, cap: true, pose: f >= pv ? "salute" : "stand", k: ramp(f, pv, pv + 7), expr: f >= pv ? "proud" : "calm", blink: blinkB(f) });
      if (id === 20) {
        man(out, cam, P1, 2.5, 0, 1.5, { expr: "grin", look: -1, cheer: chr(en + 2) }, t); man(out, cam, P2, 3.6, 0, 1.5, { expr: "grin", look: -1, cheer: chr(en + 5, 1) }, t);
        out.fx.push({ key: "ban22", cw: 1000, ch: 260, draw: (p) => fxBanner(p, "POLISH ARMY|22nd ARTILLERY SUPPLY COMPANY"), x: 0.6, y: 3.65, z: 5.7, w: 5.2, h: 1.35 });
        card(out, f, en, "stampE", 640, 220, (p) => fxStamp(p, "ENLISTED"), -0.95, 2.3, 1.0, 1.5, 0.12);
      } else {
        tag(out, f, at("papers", "paybook") - 2, "ARMY PAYBOOK", "Pte WOJTEK", 2.15, 2.62, 1.2, 1.25, "#e9e2c8");
        tag(out, f, at("papers", "rank") - 2, "RANK", "PRIVATE", 0.6, 2.62, 1.2, 1.25);
        tag(out, f, at("papers", "serial") - 2, "SERIAL NUMBER", "253", -0.95, 2.62, 1.2, 1.25);
      }
      break;
    }
    case 22: {
      const k0 = at("keepers", "looking") - 3;
      bear(out, cam, { x: 0, z: 0, cap: true, pose: f >= k0 ? "cheer" : "stand", k: ramp(f, k0, k0 + 7), expr: "happy", blink: blinkB(f) });
      for (const [x, w] of [[1.7, P1], [-1.7, P2]] as [number, Who][]) {
        man(out, cam, w, x, 0, 0.2, { expr: f >= k0 ? "nervous" : "smile", look: x > 0 ? -1 : 1 }, t);
        if (f >= k0) sweat(out, f + (x > 0 ? 0 : 9), x + (x > 0 ? 0.34 : -0.34), 1.9, 0.1);
      }
      break;
    }
    case 23: {
      bear(out, cam, { x: 4.6, z: 3.6, pose: "sit", expr: "happy", blink: blinkB(f) });
      person(out, cam, P1, 6.1, 0, 3.7, { fo: { mode: "sit", expr: "smile", blink: lidAt(t, 34), look: -1 } });
      person(out, cam, P2, 3.1, 0, 3.7, { fo: { mode: "sit", expr: "grin", blink: lidAt(t, 36), look: 1 } });
      break;
    }
    case 24: {
      const x = truckXL(24, f); out.truck = truckAt(x, 0, 0, f, true); const by = out.truck.y;
      bear(out, cam, { x: x - 1.3, y: 1.3 + by, z: 0.86, scale: 0.72, pose: "stand", expr: "happy", blink: blinkB(f), shadow: false });
      out.fx.push({ key: "bigcrate", cw: 640, ch: 520, draw: fxBigCrate, x: x - 1.3, y: 1.41 + by, z: 0.92, w: 1.55, h: 1.26 });
      break;
    }
    case 25: {
      // on deck, at the rail: off to Italy
      bear(out, cam, { x: 8, y: 3.76, z: 9.2, cap: true, pose: "wave", k: n / 6, expr: "happy", blink: blinkB(f), shadow: false });
      man(out, cam, P1, 6.3, 3.76, 9.2, { expr: "grin", wave: wav(true) }, t, false); man(out, cam, P2, 9.7, 3.76, 9.2, { expr: "grin", wave: wav(true, 1) }, t, false);
      break;
    }
    case 26: case 27: case 28: case 29: case 30: case 31: case 32: {
      if (id !== 27) out.truck = truckAt(0.6, 10.8, Math.PI / 2 + 0.2);
      if (id !== 29 && id !== 32) { gunFire(out, f, GUNS_WL[26], GUN); person(out, cam, P2, 2.7, 0, 2.2, { fo: { mode: "stand", back: true, blink: 0 } }); }
      if (id === 26 || id === 28) {
        if (id === 28) out.shellCrates = crates(G12);
        man(out, cam, P1, -0.6, 0, 6.5, { expr: "stern" }, t); man(out, cam, P3, 1.9, 0, 7.4, { expr: "stern" }, t);
        if (id === 28) { const s0 = at("job", "shells") - 3; if (f >= s0) out.fx.push({ key: "arrow", cw: 400, ch: 160, draw: fxArrow, x: 0.2 + 0.25 * Math.sin((f - s0) / 5), y: 0.95, z: 1.2, w: 2.0 * pop(f, s0), h: 0.8 * pop(f, s0), rot: Math.PI - 0.12 }); }
      } else if (id === 27) {
        out.shellCrates = crates(G12);
        bear(out, cam, { x: -1.9, z: 1.5, cap: true, pose: "stand", expr: "proud", blink: blinkB(f) });
        tag(out, f, at("ninety", "weighs") - 2, "WEIGHT", "90 KG", -3.7, 2.05, 1.5, 1.45);
      } else if (id === 29) {
        // one crate, opened: exactly four shells; a hundred pounds
        const h0 = at("job", "holds") - 2, w0 = at("job", "hundred") - 3, ns = Math.max(0, Math.min(4, Math.floor((f - h0) / 5) + 1));
        out.fx.push({ key: `open${ns}`, cw: 800, ch: 520, draw: (p) => fxCrateOpen(p, ns), x: 0.3, y: 1.45, z: 2.0, w: 2.8, h: 1.82 });
        tag(out, f, w0, "WEIGHT", "100 LB", 2.75, 1.75, 2.0, 1.35);
        man(out, cam, P1, -2.4, 0, 2.2, { expr: f >= w0 ? "pained" : "smile", look: 1, tilt: f >= w0 ? 8 : 0 }, t);
        out.shellCrates = crates([[-2.4, f >= w0 ? 0.04 + 0.03 * Math.sin(f * 0.9) : 0, 1.6, 0.1]]);
        if (f >= w0) sweat(out, f, -2.75, 1.95, 2.1);
      } else if (id === 30) {
        const cp = at("carry", "copied") - 3, c = carryL(f), set = f >= SET;
        if (f < HE) {
          // a soldier carries a crate to the stack; the bear watches from the truck, then picks one up himself
          const u = clamp01((n - 2) / (HE - 12 - a - 2)), px = 0.2 - 1.77 * u, pz = 8.5 - 8.2 * u;
          man(out, cam, P1, px, 0, pz, u < 1 ? { mode: "march", phase: (u * 9) % 1, expr: "stern", lift: 40 } : { expr: "relief" }, t);
          out.shellCrates = crates([...G12, u < 1 ? [px, 0.9, pz - 0.3, 0] : C3]);
          dust(out, f, HE - 12, -1.57, 0.5, -0.5, 0.8, 8);
          bear(out, cam, { x: c.x, z: c.z, cap: true, pose: f >= cp ? "carry" : "stand", expr: f >= cp ? "happy" : "calm", blink: blinkB(f), crate: "25 PDR" });
          man(out, cam, P3, -0.7, 0, 9.0, { expr: f >= cp ? "shock" : "stern", look: 1 }, t);
        } else if (f < NV) {
          bear(out, cam, { x: c.x, z: c.z, cap: true, pose: "carry", walk: true, phase: ((9.2 - c.z) / 1.5) % 1, expr: "calm", blink: blinkB(f), crate: "25 PDR" });
        } else {
          out.shellCrates = crates([...G12, C3, ...(set ? [C4] : [])]);
          bear(out, cam, { x: c.x, z: c.z, cap: true, pose: set ? "salute" : "carry", k: ramp(f, SET + 4, SET + 11), walk: !set, phase: ((9.2 - c.z) / 1.5) % 1, expr: set ? "proud" : "calm", blink: blinkB(f), crate: "25 PDR" });
          dust(out, f, SET, -1.57, 0.9, -0.5, 0.9, 10);
          man(out, cam, P1, -3.1, 0, 0.7, { expr: set ? "grin" : "shock", look: 1, cheer: set ? chr(SET + 3) : undefined }, t);
        }
      } else if (id === 31) {
        out.shellCrates = crates([...G12, C3, C4]);
        bear(out, cam, { x: -1.2, z: 1.2, cap: true, pose: "salute", k: 1, expr: "proud", blink: blinkB(f) });
        man(out, cam, P1, -3.1, 0, 0.7, { expr: "grin", look: 1 }, t);
        const q0 = at("doubt", "not") - 2;
        sir(1.5, -4.4, { shrug: ramp(f, q0, q0 + 8) || undefined });
        bubble(out, f, q0, "q", 0.4, 2.4, -4.4, 0.95, true);
      } else {
        // the British soldier who saw it
        out.shellCrates = crates([...G12, C3, C4]);
        const u = clamp01(n / (SHOTS_WL[31].b - a)), bz = 7.6 - 3.6 * u;
        bear(out, cam, { x: -1.4, z: bz, cap: true, pose: "carry", walk: true, phase: ((9.2 - bz) / 1.5) % 1, expr: "calm", blink: blinkB(f), crate: "25 PDR" });
        const s0 = at("doubt", "seeing") - 4;
        man(out, cam, TOMMY, 1.5, 0, 0.4, { expr: f >= s0 ? "shock" : "neutral", look: -1, point: ramp(f, s0, s0 + 6) || undefined }, t);
      }
      break;
    }
    case 33: case 34: {
      const cw = at("corporal", "corporal") - 3, corp = id === 34 && f >= cw;
      ([[1.6, P1], [-1.6, P2], [3.1, P3], [-3.1, P4]] as [number, Who][]).forEach(([x, w], i) => man(out, cam, w, x, 0, 0.3, { expr: "grin", look: x > 0 ? -1 : 1, cheer: corp ? chr(cw + 4 + i * 2, i) : undefined }, t));
      bear(out, cam, { x: 0, z: 0, cap: true, stripes: corp, pose: "salute", k: id === 33 ? ramp(f, a + 4, a + 11) : 1, expr: "proud", blink: blinkB(f) });
      if (id === 33) card(out, f, at("badge", "badge") + 3, "badge", 400, 440, fxBadge, 0, 3.45, 0.1, 1.7);
      else sparkle(out, f, cw, -0.45, 0.72, -0.25, 0.42);
      break;
    }
    case 35: case 36: case 37: {
      // Sunwick Farm, Berwickshire: sheep, locals, and the day the company is demobilised
      ([[5.4, 3.4], [7.0, 5.2], [-4.6, 6.4]] as [number, number][]).forEach(([x, z], i) => { const k = q(0.5 + 0.5 * Math.sin(f / 5 + i * 2), 2); out.fx.push({ key: `sheep${k}`, cw: 400, ch: 320, draw: (p) => fxSheep(p, k), x, y: 0.46, z, w: 1.15, h: 0.92 }); });
      const dm = at("demob", "demobilised") - 3;
      bear(out, cam, { x: 0.3, z: 0.5, cap: true, stripes: true, pose: id === 36 ? "wave" : id === 37 ? "sit" : "stand", k: id === 36 ? n / 6 : 1, expr: id === 37 ? "sleepy" : "happy", blink: blinkB(f) });
      if (id !== 36) {
        man(out, cam, P1, 2.0, 0, 0.6, { expr: id === 37 ? "pained" : "smile", look: -1, wave: wav(id === 37 && f >= dm) }, t);
        man(out, cam, P2, -1.4, 0, 0.6, { expr: id === 37 ? "pained" : "smile", look: 1, wave: wav(id === 37 && f >= dm + 6, 1) }, t);
      }
      if (id === 35) tag(out, f, at("scot", "Scotland") - 3, "BERWICKSHIRE", "SCOTLAND", 0.3, 3.05, 0.5, 1.8);
      if (id === 36) {
        const hon = at("locals", "honorary") - 3;
        man(out, cam, LOCALS[0], 2.0, 0, 0.6, { expr: "grin", look: -1, cheer: chr(a + 6) }, t); man(out, cam, LOCALS[1], 3.2, 0, 0.9, { expr: "laugh", look: -1, wave: wav(true) }, t);
        man(out, cam, LOCALS[2], -1.4, 0, 0.6, { expr: "grin", look: 1, cheer: chr(a + 10, 1) }, t);
        person(out, cam, KID1, -2.5, 0, 0.4, { scale: 0.62, fo: { mode: "stand", expr: "laugh", look: 1, blink: lidAt(t, 51), cheer: chr(a + 4, 2) } });
        banner(out, f, hon, "HONORARY MEMBER|WOJTEK", 0.3, 3.05, 0.5, 2.6, "#fff3c4");
      }
      if (id === 37) card(out, f, dm, "stampD", 640, 220, (p) => fxStamp(p, "DEMOBILISED"), 0.3, 2.75, 0.4, 2.1, 0.1);
      break;
    }
    case 38: case 39: case 40: case 41: case 42: case 43: case 44: {
      if (id !== 43) zooBoard(out, [-4.6, 0, 10.2]);
      const vets = id === 39 || id === 40 || id === 42 || id === 44;
      const vw = id === 44 ? false : id === 39 ? f >= at("visit", "visit") - 10 : true;
      if (vets) ([[V1, 1.0], [V2, -0.8], [V3v, 2.5]] as [Who, number][]).forEach(([w, x], i) => person(out, cam, w, x, 0, -0.5, { fo: { mode: "stand", back: true, blink: 0, wave: wav(vw && (id !== 40 || i === 2), i) } }));
      const B = { x: 0.25, z: 5.2, scale: 1.08, blink: blinkB(f) };
      if (id === 38) bear(out, cam, { ...B, pose: "sit", expr: "sleepy" });
      else if (id === 39) { const up = f >= at("visit", "comrades") - 2; bear(out, cam, { ...B, pose: up ? "wave" : "sit", k: up ? (f - at("visit", "comrades")) / 6 : 1, expr: up ? "happy" : "calm" }); }
      else if (id === 40) {
        // two cigarettes fly over the rail; he eats them
        const th = [at("throw", "throw") + 1, at("throw", "cigarettes") + 2], eat = at("throw", "eats") - 3;
        th.forEach((f0, i) => { const u = (f - f0) / 16; if (u >= 0 && u < 1) out.fx.push({ key: "cig", cw: 300, ch: 80, draw: fxCig, x: (i ? -0.8 : 1.0) + (0.25 - (i ? -0.8 : 1.0)) * u, y: 1.7 - 0.25 * u + 1.3 * Math.sin(Math.PI * u), z: -0.4 + 5.4 * u, w: 0.62, h: 0.165, rot: f * 0.5 }); });
        const caught = f >= th[0] + 16;
        bear(out, cam, { ...B, pose: caught && f < eat ? "cheer" : "stand", k: 1, expr: caught ? "happy" : "calm", blink: f >= eat && f < eat + 14 ? 1 : blinkB(f) });
        sparkle(out, f, th[0] + 16, 0.25, 1.55, 5.0, 0.5); sparkle(out, f, th[1] + 16, 0.25, 1.55, 5.0, 0.5);
      } else if (id === 41) {
        // a film camera at the rail, two children watching
        out.filmCam = { pos: [2.6, 0, -1.3], yaw: 0.35, crank: n * 0.5 };
        person(out, cam, CAMMAN, 3.35, 0, -1.9, { fo: { mode: "stand", back: true, blink: 0 } });
        person(out, cam, KID1, -0.9, 0, -0.5, { scale: 0.62, fo: { mode: "stand", back: true, blink: 0, cheer: chr(a + 6) } });
        person(out, cam, KID2, -1.9, 0, -0.5, { scale: 0.62, fo: { mode: "stand", back: true, blink: 0, wave: wav(true, 1) } });
        bear(out, cam, { ...B, pose: "wave", k: n / 6, expr: "happy" });
        banner(out, f, at("tv", "children's") - 3, "ON CHILDREN'S TELEVISION|BLUE PETER", 0.25, 3.7, 5.2, 3.4);
      } else if (id === 42) {
        const an = at("polish", "answers") - 6;
        bear(out, cam, { ...B, pose: f >= an ? "wave" : "stand", k: f >= an ? (f - an) / 6 : 1, expr: f >= an ? "happy" : "calm" });
        card(out, f, at("polish", "call") - 2, "sayCzesc", 620, 420, (p) => fxSay(p, "Cześć,|Wojtek!"), 1.9, 3.1, 3.5, 2.0);
      } else if (id === 43) {
        bear(out, cam, { ...B, scale: 1.25, pose: "stand", expr: "proud" });
        tag(out, f, at("big", "nearly") - 2, "NEARLY", "500 KG", -2.5, 2.0, 5.2, 1.8);
      } else tag(out, f, a + 6, "WOJTEK", "1942 – 1963", 0.6, 2.75, 5.2, 3.3);
      break;
    }
    case 45: case 46: {
      // the park: two bronze bears on stone plinths
      const wk = at("outro", "bear") + 8;
      bear(out, cam, { x: X0 + 1.9, y: 1.1, z: 3, scale: 0.9, pose: "stand", expr: "calm", blink: id === 46 && f >= wk && f < wk + 6 ? 1 : 0, shadow: false, tint: 0x86a890 });
      bear(out, cam, { x: X0 - 1.9, y: 1.1, z: 3, scale: 0.9, pose: "salute", k: 1, cap: true, expr: "calm", blink: 0, shadow: false, tint: 0x86a890 });
      banner(out, f, id === 45 ? at("statues", "Edinburgh") - 2 : a - 40, "EDINBURGH", X0 + 1.9, 0.6, 2.3, 1.25, "#d8d2c2");
      banner(out, f, id === 45 ? at("statues", "Krakow") - 2 : a - 40, "KRAKÓW", X0 - 1.9, 0.6, 2.3, 1.25, "#d8d2c2");
      if (id === 46) {
        const al = at("end3") - 2, ou = at("outro") - 2;
        sir(X0, -3.4, { expr: f >= al && f < ou ? "whistle" : "smile", look: f >= al && f < ou ? 1 : 0, wave: wav(f >= ou + 30) });
      }
      break;
    }
  }
  return out;
};
export const WOJTEK_LONG_SHOW: Show = { shots: SHOTS_WL, camAt: camAtWL, sceneAt: sceneAtWL, crowdFor: () => null, wheatAt: () => 1 };
