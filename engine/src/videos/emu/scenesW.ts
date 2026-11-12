// What happens in every shot of the Wojtek short, frame by frame.
import { fxBurst, fxStars, POLE, POLE2, POLE3, BRIT_OFFICER, VETERAN, VETERAN2, Outfit, FrontOpts } from "./toon";
import { fxBadge } from "./beartoon";
import { fxSay, fxCard, fxNoPets, fxSparkle } from "./longtoon";
import { fxMuzzle } from "./emutoon";
import { Stage, CamInfo, person, bear, q, lidAt, hh } from "./castbase";
import { FPS, V3, ramp, clamp01, hillY } from "./story";
import { Scene, Show, dust, dropY, SIR } from "./scenes";
import talkJson from "./talkW.json";
const TALK = talkJson as number[];
import { SHOTS_W, camAtW, FW, carryZ } from "./storyW";

const T = (f: number) => f / FPS;
type Who = { i: number; o: Outfit; okey: string };
const P1: Who = { i: 4, o: POLE, okey: "pole1" }, P2: Who = { i: 6, o: POLE2, okey: "pole2" }, P3: Who = { i: 9, o: POLE3, okey: "pole3" };
const OFF: Who = { i: 2, o: BRIT_OFFICER, okey: "brit" }, V1: Who = { i: 12, o: VETERAN, okey: "vet1" }, V2: Who = { i: 14, o: VETERAN2, okey: "vet2" };
const man = (out: Stage, cam: CamInfo, who: Who, x: number, y: number, z: number, fo: FrontOpts, t: number, shadow = true) =>
  person(out, cam, who, x, y, z, { fo: { mode: "stand", blink: lidAt(t, who.i + 30), ...fo } }, shadow);
const pop = (f: number, f0: number) => (f - f0 < 5 ? 0.6 + 0.4 * ((f - f0 + 1) / 5) : 1 + 0.012 * Math.sin((f - f0) / 6));
const card = (out: Stage, f: number, f0: number, key: string, cw: number, ch: number, draw: (p: import("./toon").Pen) => void, x: number, y: number, z: number, w: number) => {
  if (f >= f0) out.fx.push({ key, cw, ch, draw, x, y, z, w: w * pop(f, f0), h: ((w * ch) / cw) * pop(f, f0) });
};
const sparkle = (out: Stage, f: number, f0: number, x: number, y: number, z: number, s = 0.5) => {
  const n = f - f0;
  if (n >= 0 && n < 9) for (const [dx, dy, k] of [[-0.3, 0.2, 1], [0.32, 0.12, 0.7], [0.02, 0.42, 0.85]]) out.fx.push({ key: "sparkle", cw: 200, ch: 200, draw: fxSparkle, x: x + dx * (1 + n / 9), y: y + dy * (1 + n / 9), z, w: s * k * (1 - n / 10), h: s * k * (1 - n / 10), rot: n * 0.2 });
};
const blinkB = (f: number) => lidAt(T(f), 77);

export const sceneAtW = (id: number, f: number, cam: CamInfo): Scene => {
  const out: Scene = { places: [], fx: [], guns: [], crates: [], fan: f * 0.07 };
  const t = T(f);
  switch (id) {
    case 1: case 2: {
      // a line of soldiers at attention; the one in the middle is a bear. Sir Digsworth tells it from the front (shot 1)
      if (id === 1) person(out, cam, SIR, 0, 0, -6.6, { fo: { mode: "stand", expr: "smile", blink: lidAt(t, 3) }, talk: TALK[f] ?? 0 });
      man(out, cam, P1, 1.3, 0, 0.15, { expr: "stern" }, t); man(out, cam, P2, -1.3, 0, 0.15, { expr: f >= FW.beer ? "grin" : "stern" }, t);
      const drink = id === 2 && f >= FW.taste - 2;
      bear(out, cam, { x: 0, z: 0, cap: true, pose: drink ? "drink" : f >= FW.enlisted ? "salute" : "stand", k: drink ? ramp(f, FW.taste - 2, FW.taste + 8) : ramp(f, FW.enlisted, FW.enlisted + 6) * (id === 2 ? 1 - ramp(f, 150, 158) : 1),
        expr: drink ? "happy" : f >= FW.enlisted ? "proud" : "calm", stripes: id === 2 && f >= FW.rank, blink: blinkB(f) });
      if (id === 2) {
        sparkle(out, f, FW.rank, -0.45, 0.72, -0.25, 0.36);
        if (f < FW.taste - 4) card(out, f, FW.serial, "tag253", 520, 300, (p) => fxCard(p, "SERIAL NUMBER", "253"), 0, 2.56, -0.2, 0.86);
      }
      break;
    }
    case 3: case 4: {
      // Iran: two soldiers and a very small bear
      const happy = f >= FW.adopted;
      if (id === 3) { man(out, cam, P1, 0.7, 0, 0.8, { expr: happy ? "smile" : "neutral", look: -1 }, t); man(out, cam, P2, -0.7, 0, 0.8, { expr: happy ? "grin" : "neutral", look: 1 }, t); }
      else man(out, cam, P1, 0.95, 0, 0.5, { expr: "smile", look: -1 }, t);
      const drink = id === 4;
      bear(out, cam, { x: 0, z: -0.6, cub: true, pose: drink ? "drink" : happy ? "cheer" : "sit", k: drink ? 0.85 + 0.15 * Math.sin(f / 4) : ramp(f, FW.adopted, FW.adopted + 7),
        expr: drink ? "happy" : happy ? "happy" : "sleepy", blink: blinkB(f) });
      if (id === 3 && happy) sparkle(out, f, FW.adopted + 2, 0, 1.15, -0.7, 0.4);
      if (id === 4) card(out, f, FW.named + 6, "nameW", 520, 300, (p) => fxCard(p, "HIS NAME", "WOJTEK", "#fff3c4"), -0.02, 1.2, -0.5, 0.62);
      break;
    }
    case 5: {
      // he grows up among them: wrestles one flat, salutes, marches on his hind legs
      const grown = f >= 512, march = f >= FW.marched - 4, zz = march ? -0.9 * T(f - (FW.marched - 4)) : 0, ph = march ? (0.9 * T(f - FW.marched)) / 1.3 : 0;
      const thrown = f >= FW.wrestled + 8, u = clamp01((f - (FW.wrestled + 8)) / 9), land = f >= FW.wrestled + 17;
      // the soldier on the right is the one who gets wrestled
      if (march) man(out, cam, P2, -1.2, 0, 0.2 + zz, { mode: "march", phase: ph % 1, expr: "grin", lift: 60 }, t);
      else if (!thrown) man(out, cam, P2, -1.3, 0, 0.2, { expr: f >= FW.wrestled ? "nervous" : "smile" }, t);
      else if (!land) person(out, cam, P2, -1.3, 1.7 * Math.sin(Math.PI * u), 0.2, { fo: { mode: "fall", expr: "shock", tilt: 60 * u, blink: 0 } }, false);
      else { person(out, cam, P2, -1.3, 0, 0.2, { fo: { mode: "sit", expr: "dazed", blink: 0 } }); const s = q((t * 0.9) % 1, 30); out.fx.push({ key: `stars${s}`, cw: 420, ch: 210, draw: (p) => fxStars(p, s), x: -1.3, y: 1.4, z: 0.2, w: 0.75, h: 0.37 }); }
      dust(out, f, FW.wrestled + 17, -1.3, 0, 0, 1.1);
      man(out, cam, P1, march ? 1.2 : 1.3, 0, 0.2 + zz, march ? { mode: "march", phase: ph % 1, expr: "grin", lift: 60 } : { expr: f >= FW.wrestled + 8 && f < FW.saluted ? "laugh" : "smile" }, t);
      const wres = f >= FW.wrestled && f < FW.saluted - 4;
      bear(out, cam, { x: 0, z: zz, cub: !grown, scale: grown ? 1.02 * (f - 512 < 6 ? 0.8 + 0.2 * ((f - 512) / 6) : 1) : 0.5 + 0.12 * ramp(f, 494, 512),
        pose: march ? "stand" : wres ? "cheer" : f >= FW.saluted - 4 ? "salute" : "stand", k: wres ? 1 : ramp(f, FW.saluted - 4, FW.saluted + 3), walk: march, phase: ph + 0.25,
        expr: wres ? "happy" : f >= FW.saluted - 4 && !march ? "proud" : "calm", cap: f >= FW.saluted - 4, blink: blinkB(f) });
      dust(out, f, 512, 0, 0, -0.3, 1.5);
      break;
    }
    case 6: case 7: {
      // the quay: soldiers file up the gangway; at its foot an officer, a sign, and a bear who may not come
      const rampY = (z: number) => Math.max(0, Math.min(3.6, ((z - 4.0) / 4.8) * 3.6));
      if (id === 6) for (let k = 0; k < 3; k++) {
        const z = 7.8 + 2.1 * T(f - 646) - k * 1.5;
        if (z > -1 && z < 9) person(out, cam, [P2, P3, P2][k], 3.2, rampY(z), z, { fo: { mode: "stroll", back: true, phase: (z / 1.4 + k * 0.3 + 4) % 1, lift: 60, blink: 0 } }, z < 4);
      }
      const stop = f >= FW.and_ship - 6, made = id === 7 && f >= FW.private;
      if (id === 6) {
        man(out, cam, OFF, 2.45, 0, 3.3, { expr: "stern", wave: stop ? 0 : undefined }, t);
        if (stop) card(out, f, FW.and_ship - 4, "nopets", 300, 300, fxNoPets, 2.45, 2.75, 3.3, 0.8);
      }
      const ck = (d: number) => id !== 7 ? undefined : f >= FW.paybook - 4 ? q(ramp(f, FW.paybook - 4 + d, FW.paybook + 3 + d), 4) || undefined : f >= FW.made + d && f < FW.private - 6 ? q(ramp(f, FW.made + d, FW.made + 6 + d) * (1 - ramp(f, FW.private - 14, FW.private - 6)), 4) || undefined : undefined;
      man(out, cam, P1, 0.05, 0, 2.5, { expr: id === 7 ? "grin" : stop ? "shock" : "smile", look: 1, cheer: ck(0) }, t);
      if (id === 7) man(out, cam, P2, -0.62, 0, 2.5, { expr: made ? "laugh" : "grin", look: 1, cheer: ck(3) }, t);
      bear(out, cam, { x: 1.2, z: 2.3, cap: made, pose: made ? "salute" : "stand", k: ramp(f, FW.wojtek2, FW.wojtek2 + 6), expr: made ? "proud" : stop ? "sleepy" : "calm", blink: blinkB(f), look: stop && !made ? 1 : 0 });
      if (id === 7) {
        sparkle(out, f, FW.private, 1.2, 1.75, 2.1, 0.5);
        card(out, f, FW.paybook - 4, "paybook", 520, 300, (p) => fxCard(p, "ARMY PAYBOOK", "Pte WOJTEK", "#e9e2c8"), 1.1, 2.95, 2.3, 1.15);
      }
      break;
    }
    case 8: {
      const wide = f < 990;
      // the gun fires at the hill; shells burst below the abbey
      const shots = [905, 935, 965, 1010, 1050, 1096], sh = shots.find((s) => f >= s && f < s + 10), rec = sh !== undefined ? Math.max(0, 1 - (f - sh) / 9) : 0;
      out.fieldGun = { pos: [-1.0, 0, 3.6], yaw: 0.1, recoil: rec };
      if (sh !== undefined && f - sh < 2) out.fx.push({ key: `muzzle${f - sh + 1}`, cw: 300, ch: 300, draw: (p) => fxMuzzle(p, f - sh + 1), x: -0.72, y: 1.85, z: 6.3, w: 1.5, h: 1.5 });
      for (const s of shots) { const n = f - s - 18; if (n >= 0 && n < 16) { const hx = -40 + 80 * hh(s, 3), hz = 150 + 50 * hh(s, 5), u = q(n / 16, 8); out.fx.push({ key: `burst${u}`, cw: 500, ch: 500, draw: (p) => fxBurst(p, u, "#ffd9a0", 9), x: hx, y: hillY(hx, hz) + 6, z: hz, w: 26, h: 26 }); } }
      person(out, cam, P2, -1.1, 0, 2.2, { fo: { mode: "stand", back: true, blink: 0 } });
      out.truck = { x: 2.3, z: 10.6, yaw: Math.PI / 2 + 0.25, y: 0, pitch: 0, roll: 0, wheel: 0, wheelY: [0, 0, 0, 0], gunPitch: 0, gunYaw: 0, gunLift: 0, noGun: true };
      // the stack he is building, one crate at a time; he never drops one
      const set = f >= 1088;
      out.shellCrates = [[-0.13, 0, -0.5, 0.05], [0.73, 0, -0.45, -0.06], ...(set ? [[0.3, 0.42, -0.48, 0.02]] : [])].map(([x, y, z, yaw]) => ({ pos: [x, y, z] as V3, yaw }));
      if (!wide) {
        const z = carryZ(f);
        const bz = Math.max(1.2, z);
        bear(out, cam, { x: 0.5 + 0.4 * ((bz - 1.2) / 8), z: bz, cap: true, pose: set ? "salute" : "carry", k: ramp(f, 1092, 1099), walk: !set, phase: ((9.2 - z) / 1.5) % 1, expr: set ? "proud" : "calm", blink: blinkB(f), crate: "25 PDR" });
        dust(out, f, 1088, 0.3, 0.5, -0.5, 0.9, 10);
      }
      break;
    }
    case 9: {
      // two stripes on his arm, and the badge the company painted on everything
      const corp = f >= FW.corporal;
      man(out, cam, P1, 1.28, 0, 0.3, { expr: corp ? "grin" : "smile", cheer: f >= FW.corporal + 6 && f < FW.a_bear ? q(0.7 + 0.3 * Math.sin(f * 0.5), 4) : undefined }, t);
      man(out, cam, P2, -1.28, 0, 0.3, { expr: corp ? "grin" : "smile", cheer: f >= FW.corporal + 8 && f < FW.a_bear ? q(0.7 + 0.3 * Math.sin(f * 0.5 + 1), 4) : undefined }, t);
      bear(out, cam, { x: 0, z: 0, cap: true, stripes: corp, pose: "salute", k: ramp(f, FW.promoted, FW.promoted + 6), expr: "proud", blink: blinkB(f) });
      sparkle(out, f, FW.corporal, -0.45, 0.72, -0.25, 0.42);
      card(out, f, FW.a_bear + 2, "badge", 400, 440, fxBadge, 0, 3.55, 0.1, 1.55);
      break;
    }
    case 10: case 11: {
      // the zoo: two old comrades at the rail, the bear on his grass
      const up = f >= FW.spoke - 2;
      person(out, cam, V1, 0.8, 0, -0.5, { fo: { mode: "stand", back: true, blink: 0, wave: f >= FW.visit - 8 ? q(Math.sin(f / 3.2), 4) : undefined } });
      person(out, cam, V2, -0.8, 0, -0.5, { fo: { mode: "stand", back: true, blink: 0, wave: id === 11 && f >= FW.answered ? q(Math.sin(f / 3.2 + 1), 4) : undefined } });
      bear(out, cam, { x: 0.25, z: 5.2, pose: up ? "wave" : "sit", k: up ? (f - FW.spoke) / 6 : 1, expr: up ? "happy" : f >= FW.old ? "calm" : "sleepy", blink: up ? 0 : blinkB(f), scale: 1.08 });
      out.board = { pos: [-1.85, 0, 10.2], key: "zoo", draw: (g) => {
        g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = "#2f4a3c"; g.fillRect(0, 0, 1024, 756); g.strokeStyle = "#e9e4d2"; g.lineWidth = 8; g.strokeRect(22, 22, 980, 712);
        g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#ffe27a"; g.font = "900 150px 'Arial Black', Impact, sans-serif"; g.fillText("EDINBURGH", 512, 270); g.fillStyle = "#ffffff"; g.font = "900 230px 'Arial Black', Impact, sans-serif"; g.fillText("ZOO", 512, 520);
      } };
      if (id === 11 && f >= 1412 && f < 1478) out.fx.push({ key: "sayCzesc", cw: 620, ch: 420, draw: (p) => fxSay(p, "Cześć,|Wojtek!"), x: 0.85, y: 3.05, z: 3.5, w: 1.9 * pop(f, 1412), h: 1.29 * pop(f, 1412) });
      break;
    }
  }
  return out;
};
export const WOJTEK_SHOW: Show = { shots: SHOTS_W, camAt: camAtW, sceneAt: sceneAtW, crowdFor: () => null, wheatAt: () => 1 };
export { dropY };
