// What happens in every shot of the long film "The Army That Lost a War to Birds". New beats are staged here;
// beats that also exist in the short are borrowed from scenes.ts through the frame map in storyLong.ts.
import { fxBurst, fxStars, MAJOR, DIGGER, DIGGER2, FARMER, FARMER2, FARMER3, MINISTER, POLITICIAN, POLITICIAN2, POLITICIAN3, CAMERAMAN, Expr, FrontOpts, Outfit } from "./toon";
import { EmuOpts, EMU_WALK_M, EMU_RUN_M, fxSmoke } from "./emutoon";
import { fxBubble, fxRabbit, fxHeight, fxPaper, fxRound, fxEquals, fxSweat, Icon } from "./longtoon";
import { Stage, CamInfo, person, emu, hh, q, lidAt } from "./castbase";
import { FPS, V3, clamp01, ramp, lerp, TRIO, CAMP_GUNS, PLAIN_GUNS, DAM_GUN, bankY, riseY, RISE_Z0, FIELD, HOME_CAM, HOME_DIR, SIR_END } from "./story";
import { Scene, Show, CrowdSpec, sceneAt as emuScene, crowdFor as emuCrowd, wheatAt as emuWheat, WHO, SIR, TR, dropY, dust, firing, burst, flash, peckAt, emuBlink, setTalkFn } from "./scenes";
import { SHOTS_L, camAtL, fsOf, BORROW } from "./storyLong";
import talkJson from "./talkLong.json";

const TALK = talkJson as number[];
const talkL = (f: number) => TALK[Math.max(0, Math.min(TALK.length - 1, f))] ?? 0;
const T = (f: number) => f / FPS;
type Who = { i: number; o: Outfit; okey: string };
const FARM: Who[] = [{ i: 5, o: FARMER, okey: "farmer" }, { i: 8, o: FARMER2, okey: "farmer2" }, { i: 9, o: FARMER3, okey: "farmer3" }];
const DIG: Who[] = [WHO.s1, WHO.s2, { i: 7, o: DIGGER, okey: "dig3" }];
const MIN: Who = { i: 12, o: MINISTER, okey: "minister" };
const POLS: Who[] = [{ i: 13, o: POLITICIAN, okey: "pol1" }, { i: 14, o: POLITICIAN2, okey: "pol2" }, { i: 15, o: POLITICIAN3, okey: "pol3" }];
const CAMMAN: Who = { i: 16, o: CAMERAMAN, okey: "camman" };

const bubble = (out: Stage, f: number, f0: number, kind: Icon, x: number, y: number, z: number, w = 2.0, thought = false, flip = false) => {
  if (f < f0) return;
  const pop = f - f0 < 5 ? 0.6 + 0.4 * ((f - f0 + 1) / 5) : 1 + 0.015 * Math.sin((f - f0) / 6);
  out.fx.push({ key: `bub|${kind}|${thought}|${flip}`, cw: 520, ch: 420, draw: (p) => fxBubble(p, kind, thought, flip), x, y, z, w: w * pop, h: w * 0.808 * pop });
};
const man = (out: Stage, cam: CamInfo, who: Who, x: number, y: number, z: number, fo: FrontOpts, t: number, shadow = true) =>
  person(out, cam, who, x, y, z, { fo: { mode: "stand", blink: lidAt(t, who.i + 30), ...fo } }, shadow);

// ---------------- the chalk board ----------------
export type Row = { l?: string; r?: string; c?: string; y: number; lc?: string; lpx?: number; rpx?: number; cx?: number };
const boardBase = (g: CanvasRenderingContext2D, title: string) => {
  const W = 1024, H = 756;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.fillStyle = "#2f4a3c"; g.fillRect(0, 0, W, H);
  g.fillStyle = "rgba(255,255,255,0.05)"; for (let i = 0; i < 40; i++) g.fillRect((i * 173) % W, (i * 97) % H, 160, 9);
  g.strokeStyle = "#e9e4d2"; g.lineWidth = 8; g.strokeRect(22, 22, W - 44, H - 44);
  chalk(g, title, W / 2, 112, title.length > 16 ? 70 : 96, "#ffe27a");
  g.strokeStyle = "#ffe27a"; g.lineWidth = 8; g.beginPath(); g.moveTo(120, 182); g.lineTo(W - 120, 182); g.stroke();
};
const chalk = (g: CanvasRenderingContext2D, s: string, x: number, y: number, px: number, colr = "#f4f1e6", align: CanvasTextAlign = "center") => {
  g.font = `900 ${px}px 'Arial Black', Impact, 'Segoe UI Black', sans-serif`; g.textAlign = align; g.textBaseline = "middle";
  g.fillStyle = "rgba(0,0,0,0.25)"; g.fillText(s, x + 4, y + 5);
  g.fillStyle = colr; g.fillText(s, x, y);
};
const rowsDraw = (title: string, rows: Row[]) => (g: CanvasRenderingContext2D) => {
  boardBase(g, title);
  for (const r of rows) {
    if (r.l) chalk(g, r.l, r.cx ?? 70, r.y, r.lpx ?? 84, r.lc ?? "#f4f1e6", r.cx ? "center" : "left");
    if (r.r) chalk(g, r.r, 954, r.y, r.rpx ?? 150, r.c ?? "#ffffff", "right");
  }
};
export const board = (out: Scene, pos: V3, title: string, rows: Row[]) => { out.board = { pos, key: title + "|" + JSON.stringify(rows), draw: rowsDraw(title, rows) }; };

/** take a shot from the short film (its own staging, its frame) */
const borrow = (out: Scene, id: number, f: number, cam: CamInfo) => {
  const sc = emuScene(BORROW[id], fsOf(id, f), cam);
  out.places.push(...sc.places); out.fx.push(...sc.fx); out.guns.push(...sc.guns); out.crates.push(...sc.crates);
  out.truck = sc.truck; out.board = sc.board; out.tally = sc.tally; out.brass = sc.brass; out.aftermath = sc.aftermath;
};
const fieldPeckers = (out: Scene, cam: CamInfo, f: number, n: number, x0 = -13, x1 = 13, z0 = 7, z1 = 26) => {
  for (let i = 0; i < n; i++) {
    const z = z0 + (z1 - z0) * hh(i, 81), x = x0 + (x1 - x0) * hh(i, 82), p = peckAt(f + Math.floor(hh(i, 83) * 30)), d = 1.2 * T(f % 600);
    if (i % 5 === 0) emu(out, cam, { i, x: x + (hh(i, 84) > 0.5 ? 1 : -1) * d, z, dx: hh(i, 84) > 0.5 ? 1 : -1, dz: 0, view: "side", mode: "walk", phase: d / EMU_WALK_M + hh(i, 85), expr: "calm" });
    else emu(out, cam, { i, x, z, dx: hh(i, 84) > 0.5 ? 1 : -1, dz: 0, view: "side", mode: "peck", peck: p.k, jab: p.jab, gulp: p.gulp, reach: 150, expr: "calm" });
  }
};

// ---------------- crowds + wheat ----------------
export const crowdForL = (id: number, f: number): CrowdSpec | null => {
  if (id === 1) return emuCrowd(1, 60);
  if (BORROW[id] && id !== 39) return emuCrowd(BORROW[id], fsOf(id, f));
  if (id === 12) return emuCrowd(4, 340);
  if (id === 37) return emuCrowd(13, 1320);
  if (id === 8) return { // the yearly walk to the coast: one long column
    n: 640, view: "side", buckets: 8, k: 0.36,
    at: (i) => ({ x: 6 + 104 * hh(i, 4) + 1.3 * T(f - 855), y: 0, z: 17 + 17 * hh(i, 5) + 3 * Math.sin(hh(i, 4) * 9), s: 0.9 + 0.2 * hh(i, 6), mirror: true }),
    pose: (b) => ({ mode: "walk", phase: (1.3 * T(f)) / EMU_WALK_M + b / 8, seed: b + 1, expr: "calm" }),
  };
  if (id === 18 || id === 19) return { // about fifty emus (exactly fifty here)
    n: 50, view: id === 18 ? "side" : "front", buckets: 8, k: 0.5,
    at: (i) => ({ x: (hh(i, 7) - 0.5) * 24, y: 0, z: 58 + 12 * hh(i, 8) - (id === 19 ? 1.4 * T(f - 2023) : 0), s: 0.9 + 0.2 * hh(i, 9), mirror: hh(i, 10) > 0.5 }),
    pose: (b) => { const p = peckAt(f + b * 4 + (b % 3) * 7); return id === 18 ? { mode: "peck", peck: p.k, jab: p.jab, reach: 60, seed: b + 1, expr: "calm" } : { mode: "walk", phase: (1.4 * T(f)) / EMU_WALK_M + b / 8, seed: b + 1, expr: "deadpan" }; },
  };
  return null;
};
export const wheatAtL = (id: number, f: number, x: number, z: number) => {
  if (id === 4) return f < 512 ? 0 : clamp01((f - 512 - 6 * hh(Math.round(x * 3 + z * 7), 3) - (z - FIELD.z0) * 0.35) / 14); // it grows, front rows first
  if (id === 9 || id === 10 || id === 11) return emuWheat(4, fsOf(id, f), x, z);
  if (id === 12) return emuWheat(4, 340, x, z);
  if (id === 37 || id === 38) return emuWheat(13, 0, x, z);
  if (id === 48) return emuWheat(15, 0, x, z);
  return 1;
};

// ---------------- the shots ----------------
export const sceneAtL = (id: number, f: number, cam: CamInfo): Scene => {
  const out: Scene = { places: [], fx: [], guns: [], crates: [], fan: f * 0.07 };
  const t = T(f);
  setTalkFn(() => talkL(f));
  if (BORROW[id]) borrow(out, id, f, cam);
  switch (id) {
    case 1: {
      TR.forEach((n, k) => man(out, cam, WHO[n], TRIO[k][0], 0, TRIO[k][2], { expr: k === 0 ? "stern" : k === 1 ? "smile" : "neutral" }, t));
      CAMP_GUNS.forEach((g, k) => out.guns.push({ pos: g, yaw: Math.PI + (k ? -0.5 : 0.5) }));
      const sc = emuScene(2, 100 + Math.round(f / 3), cam); out.places.push(...sc.places); out.fx.push(...sc.fx);
      break;
    }
    case 2: {
      const ex: Expr[] = ["dazed", "pained", "dazed"];
      TR.forEach((n, k) => {
        const x = 0.9 + k * 1.15, z = 1.2 + (k % 2) * 0.4;
        person(out, cam, WHO[n], x, 0, z, { fo: { mode: "sit", expr: ex[k], blink: 0 } });
        const u = q((t * 0.9 + k * 0.33) % 1, 30);
        out.fx.push({ key: `stars${u}`, cw: 420, ch: 210, draw: (pp) => fxStars(pp, u), x, y: 1.4, z, w: 0.78, h: 0.39 });
      });
      out.guns.push({ pos: [-0.9, 0.12, 2.6], yaw: 2.2, roll: 1.35 }, { pos: [5.1, 0.12, 2.4], yaw: 3.9, roll: -1.35 });
      emu(out, cam, { i: 2, x: -1.9, z: -2.6, dx: 0, dz: -1, view: "front", mode: "stand", scale: 1.0, expr: f >= 199 ? "smug" : "deadpan", blink: f >= 205 && f < 211 ? [0.5, 1, 1, 1, 1, 0.5][f - 205] : 0, nod: f >= 199 ? 5 : 0 });
      break;
    }
    case 3: {
      person(out, cam, SIR, 0, 0, -4.5, { fo: { mode: "stand", expr: "smile", blink: lidAt(t, 3), wave: f >= 232 && f < 300 ? q(Math.sin((f - 232) / 3.2), 4) : undefined }, talk: talkL(f) });
      break;
    }
    case 4: case 13: {
      // three soldiers at the fence become three farmers (and, in 13, stand to attention as the old soldiers they are)
      const soldier = id === 4 ? f < 478 : f >= 1305;
      const swap = id === 4 ? 478 : 1305;
      [-1.6, 0, 1.6].forEach((x, k) => {
        if (id === 4 && f < 416) { // marching in from the left of frame, in step
          const d = 1.6 * T(416 - f), xx = x + d;
          person(out, cam, DIG[k], xx, 0, 2.4, { side: true, so: { mode: "march", phase: ((40 - d) / 1.6) % 1, stomp: 1, stride: 1, expr: "stern", blink: lidAt(t, 30 + k) } });
          return;
        }
        const n = f - swap - k * 2, hop = n >= 0 && n < 8 ? 0.22 * Math.sin((Math.PI * n) / 8) : 0;
        man(out, cam, soldier ? DIG[k] : FARM[k], x, hop, 2.4, { expr: soldier ? (id === 13 ? "stern" : "neutral") : id === 4 && f > 530 ? "grin" : "smile" }, t, hop < 0.02);
        dust(out, f, swap + k * 2, x, 0, 2.2, 0.9, 10);
      });
      break;
    }
    case 5: case 6: {
      const sad = f >= 623, help = f >= 653, zero = f >= 686, pr = q(ramp(f, 604, 640), 12);
      [-3.4, -2.0, -0.6].forEach((x, k) => man(out, cam, FARM[k], x, 0, 2.2, id === 6
        ? { expr: f >= 760 ? "shock" : "nervous", look: f >= 747 ? 1 : 0 }
        : { expr: zero ? "pained" : sad ? (k === 1 ? "shock" : "nervous") : k === 1 ? "smile" : "neutral", shrug: zero ? q(ramp(f, 686, 694), 4) || undefined : undefined }, t));
      out.board = { pos: [1.8, 0, 2.6], key: `price|${pr}|${help}|${zero}`, draw: (g) => {
        boardBase(g, "WHEAT PRICE");
        g.strokeStyle = "#e9e4d2"; g.lineWidth = 7; g.beginPath(); g.moveTo(130, 220); g.lineTo(130, 520); g.lineTo(900, 520); g.stroke();
        if (pr > 0) { // the price line falls off a cliff
          const pts: [number, number][] = [[140, 250], [300, 262], [430, 300], [540, 400], [680, 470], [880, 505]];
          g.strokeStyle = "#ff8f7a"; g.lineWidth = 16; g.lineJoin = "round"; g.lineCap = "round"; g.beginPath();
          const n = pr * (pts.length - 1);
          pts.forEach((pt, i) => { if (i <= Math.floor(n)) { if (i) g.lineTo(pt[0], pt[1]); else g.moveTo(pt[0], pt[1]); } });
          const i0 = Math.floor(n); if (i0 < pts.length - 1) g.lineTo(lerp(pts[i0][0], pts[i0 + 1][0], n - i0), lerp(pts[i0][1], pts[i0 + 1][1], n - i0));
          g.stroke();
        }
        if (help) chalk(g, "GOVERNMENT HELP", 70, 640, 60, "#f4f1e6", "left");
        if (zero) chalk(g, "£0", 954, 636, 120, "#ff8f7a", "right");
      } };
      break;
    }
    case 12: {
      // one emu shoulders through the fence; the rabbits follow through the hole
      const ze = -1.8 + 1.5 * T(f - 1172);
      if (ze < 9) emu(out, cam, { i: 3, x: 11.6, z: ze, dx: 0, dz: 1, view: "back", mode: "walk", phase: (1.5 * T(f - 1172)) / EMU_WALK_M, scale: 1.0 });
      if (f >= 1186 && f < 1192) { const u = q((f - 1186) / 6, 6); out.fx.push({ key: `burst${u}`, cw: 500, ch: 500, draw: (p) => fxBurst(p, u, "#fff3b0", 9), x: 11.6, y: 0.8, z: 3.9, w: 1.6, h: 1.6 }); }
      dust(out, f, 1186, 11.2, 0, 3.8, 1.3, 14); dust(out, f, 1188, 12.1, 0, 3.8, 1.1, 14);
      for (let i = 0; i < 5; i++) {
        const s0 = 1230 + i * 7, u = T(f - s0);
        if (u < 0) continue;
        const x = 16.5 - 3.4 * u - i * 0.25, z = 0.6 + 2.4 * u, k = Math.abs(Math.sin(u * Math.PI * 2.6 + i));
        out.fx.push({ key: `rabbit${q(k, 5)}`, cw: 300, ch: 240, draw: (p) => fxRabbit(p, q(k, 5)), x, y: 0.22 + 0.3 * k, z, w: 0.62, h: 0.5 });
      }
      break;
    }
    case 14: case 15: case 44: case 45: {
      out.office = "minister";
      const asking = id === 14 ? f >= 1352 : id === 44;
      const pulse = id === 44 ? Math.max(0, ...[4838, 4881, 4933].map((y) => 1 - Math.abs(f - y - 6) / 10)) : 0;
      [1.2, 2.4, 3.6].forEach((x, k) => man(out, cam, FARM[k], x, 0, 1.4, {
        expr: id === 45 ? (f >= 5018 ? "pained" : "nervous") : id === 15 ? (f >= 1474 ? "grin" : "neutral") : asking ? "neutral" : "stern",
        cheer: pulse > 0.1 && k === 1 ? q(pulse, 4) : undefined, look: -1 }, t));
      man(out, cam, MIN, -2.2, 0, 2.35, id === 15
        ? { expr: f >= 1461 ? "grin" : "neutral", headTilt: f >= 1461 && f < 1490 ? 5 * Math.sin((f - 1461) * 0.7) : 0 }
        : id === 45 ? { expr: "stern", headTilt: 7 * Math.sin((f - 4972) * 0.55) } : { expr: id === 44 ? "stern" : "neutral", look: 1 }, t, false);
      if (id === 14) bubble(out, f, 1398, "gun", 2.4, 2.9, 1.4, 2.3);
      if (id === 15 && f < 1500) bubble(out, f, 1466, "tick", -2.0, 3.15, 2.35, 1.5, false, true);
      if (id === 15) bubble(out, f, 1537, "target", -4.3, 2.9, 2.35, 2.0, true, true);
      if (id >= 44) {
        const yrs = ["1934", "1943", "1948"], at = [4838, 4881, 4933];
        out.board = { pos: [0.3, 0, 3.4], key: `yrs|${yrs.map((_, k) => f >= at[k]).join()}|${id === 45 && f >= 5018}`, draw: (g) => {
          boardBase(g, "THE ARMY, AGAIN?");
          yrs.forEach((y, k) => { if (f >= at[k]) chalk(g, y, 90, 290 + k * 150, 138, "#ffffff", "left"); });
          if (id === 45 && f >= 5018) yrs.forEach((_, k) => chalk(g, "NO", 930, 290 + k * 150, 138, "#ff8f7a", "right"));
        } };
      }
      break;
    }
    case 17: {
      // the cameraman and his camera arrive last
      const y = dropY(f, 1806, 1.6);
      if (y >= 0) {
        man(out, cam, CAMMAN, 3.5, y, -1.0, { expr: f >= 1815 ? "grin" : "neutral" }, t, y < 0.02);
        out.filmCam = { pos: [2.75, y, -2.2], yaw: -0.87, crank: f >= 1814 ? (f - 1814) * 0.5 : 0 };
        dust(out, f, 1806, 3.2, 0, -1.6, 1.2);
      }
      break;
    }
    case 18: {
      if (f >= 1957 && f < 1988) { const sc = emuScene(7, 624 + ((f - 1957) % 30), cam); out.places.push(...sc.places); out.fx.push(...sc.fx); out.guns.push(...sc.guns); break; }
      PLAIN_GUNS.forEach((g, k) => { out.guns.push({ pos: g, yaw: 0 }); man(out, cam, DIG[k], g[0], 0, g[2] - 0.72, { back: true, blink: 0 }, t); });
      man(out, cam, WHO.major, 0, 0, -1.8, { back: true, blink: 0, point: f >= 1890 ? 1 : undefined }, t);
      if (f < 1899) board(out, [-3.3, 0, 1.2], "2 NOVEMBER", [{ l: "1932", cx: 512, y: 420, lpx: 230, lc: "#ffffff" }]);
      // bullets fall well short of the birds
      if (f >= 1988) for (let k = 0; k < 9; k++) dust(out, f, 1990 + k * 3, (hh(k, 3) - 0.5) * 16, 0, 44 + hh(k, 5) * 5, 1.8, 12);
      break;
    }
    case 19: {
      [[-8, 75], [0.5, 77.5], [8.5, 75]].forEach(([x, z], k) => man(out, cam, FARM[k], x, 0, z - 1.4 * T(f - 2023), { expr: "shock", cheer: q(0.5 + 0.5 * Math.sin(f * 0.6 + k * 2), 4) }, t));
      break;
    }
    case 23: {
      // the three behind the bank, seen from the water: waiting, sweating
      const gzz = DAM_GUN[2] - 0.78, by = (x: number, z: number) => bankY(x, z) - 0.05;
      out.guns.push({ pos: DAM_GUN, yaw: 0, h: 0.45 });
      const look = Math.sin((f - 2391) / 7) > 0 ? 1 : -1;
      man(out, cam, WHO.s1, 0, by(0, gzz), gzz, { expr: "nervous", look, blink: 0 }, t, false);
      person(out, cam, WHO.major, -1.15, by(-1.15, gzz + 0.1) - 0.22, gzz + 0.1, { fo: { mode: "stand", expr: "stern", look: -look as -1 | 1, blink: lidAt(t, 12) } }, false);
      person(out, cam, WHO.s2, 1.15, by(1.15, gzz + 0.05) - 0.26, gzz + 0.05, { fo: { mode: "stand", expr: f >= 2429 ? "shock" : "nervous", look, blink: 0 } }, false);
      for (const [x, k] of [[0.34, 0], [1.5, 13]] as const) { const u = ((f - 2391 + k) % 24) / 24; out.fx.push({ key: "sweat", cw: 80, ch: 110, draw: fxSweat, x, y: by(0, gzz) + (x < 1 ? 1.62 : 1.05) - 0.3 * u, z: gzz - 0.05, w: 0.09, h: 0.12 }); }
      break;
    }
    case 26: {
      // twelve birds down (exactly twelve); the other thousand are dust on the horizon
      for (let i = 0; i < 12; i++) {
        const x = -4.9 + (i % 6) * 2.05 + (hh(i, 3) - 0.5) * 0.5, z = 18.6 + Math.floor(i / 6) * 3.0 + hh(i, 5) * 0.8;
        emu(out, cam, { i, x, y: 0.34, z, dx: hh(i, 7) > 0.5 ? 1 : -1, dz: 0, view: "side", mode: "stand", blink: 1, roll: -Math.PI / 2, shadow: false });
        if (i % 3 === 0) { const u = q((t * 0.9 + i * 0.2) % 1, 30); out.fx.push({ key: `stars${u}`, cw: 420, ch: 210, draw: (pp) => fxStars(pp, u), x: x + (hh(i, 7) > 0.5 ? 1.5 : -1.5), y: 0.95, z, w: 0.7, h: 0.35 }); }
      }
      for (let i = 0; i < 18; i++) {
        const a = -0.9 + (i / 17) * 1.8, d = 26 + 8.5 * T(f - 2529) + hh(i, 9) * 14, x = Math.sin(a) * d, z = 22 + Math.cos(a) * d;
        emu(out, cam, { i: i + 20, x, z, dx: Math.sin(a), dz: Math.cos(a), view: "back", mode: "run", phase: d / EMU_RUN_M + hh(i, 11), shadow: false });
        if (i % 2 === 0) dust(out, 0, -((f + i * 5) % 12), x, 0, z - 1, 1.6, 12);
      }
      break;
    }
    case 27: {
      const L: V3 = [0.25, 0, 31];
      if (f < 2668) {
        [[0, 4], [-1.2, 4.6], [1.2, 4.6]].forEach(([x, z], k) => man(out, cam, WHO[TR[k]], x, 0, z, { expr: f >= 2635 ? (k === 0 ? "stern" : "nervous") : "neutral", look: 0 }, t));
        bubble(out, f, 2640, "q", 1.9, 2.75, 4.2, 1.5);
        break;
      }
      const warn = f >= 2867, flee = f >= 2880;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + 0.4, r0 = 3.2 + 1.6 * hh(i, 3), x0 = Math.cos(a) * r0 * 1.5, z0 = 28.2 + Math.sin(a) * r0 * 0.8;
        const p = peckAt(f + Math.floor(hh(i, 4) * 30)), d = flee ? 7.5 * Math.max(0, T(f - 2880 - (i % 3))) : 0, dir = x0 > 0 ? 1 : -1;
        emu(out, cam, { i: i + 1, x: x0 + dir * d, z: z0, dx: dir, dz: 0, view: "side", mode: flee && d > 0 ? "run" : "peck", peck: warn ? 0 : p.k, jab: warn ? 0 : p.jab, reach: 60,
          phase: d / EMU_RUN_M + hh(i, 5), expr: warn ? "alarm" : "calm", blink: warn ? 0 : emuBlink(f, i) });
      }
      // the leader: bigger, darker, crest up, watching
      const scan = f >= 2834 && f < 2867 ? Math.floor((f - 2834) / 9) % 2 === 0 : true;
      emu(out, cam, { i: 0, x: L[0], z: L[2], dx: scan ? 1 : -1, dz: 0, view: "side", mirror: !scan, mode: "stand", scale: 1.22, leader: true, expr: warn || (f >= 2803 && f < 2834) ? "alarm" : "deadpan",
        nod: 4 * Math.sin(f / 9), blink: warn ? 0 : emuBlink(f, 0) });
      if (f >= 2773 && f < 2806) out.fx.push({ key: "height", cw: 260, ch: 600, draw: fxHeight, x: L[0] - 1.05, y: 0.94, z: L[2], w: 0.8, h: 1.86 });
      if (warn) bubble(out, f, 2867, "bang", L[0] - 1.3, 3.0, L[2], 1.3, false, true);
      break;
    }
    case 28: {
      // guerrilla tactics: heads rise from behind the bushes; the "emu command" in its cap gives the nod; all vanish
      const spots: [number, number, number][] = [[-2.94, 5.7, 2941], [2.96, 5.7, 2950], [-4.8, 6.7, 2962], [4.8, 6.7, 2972], [-6.4, 8.2, 2986], [6.4, 8.2, 2996]];
      spots.forEach(([x, z, at], i) => {
        const up = ramp(f, at, at + 7) * (1 - ramp(f, 3024 + i * 2, 3032 + i * 2));
        if (up > 0.02) emu(out, cam, { i: i + 2, x, y: bankY(x, z) - 1.9 + 2.0 * up, z, dx: 0, dz: -1, view: "front", mode: "stand", scale: 1.05, expr: "deadpan", blink: emuBlink(f, i + 2), shadow: false });
      });
      emu(out, cam, { i: 0, x: 0, y: bankY(0, 5.2) - 1.9 * (1 - ramp(f, 2906, 2916)), z: 5.2, dx: 0, dz: -1, view: "front", mode: "stand", scale: 1.2, leader: true, cap: true, shadow: false, expr: f >= 3005 ? "smug" : "deadpan", nod: f >= 3005 && f < 3022 ? 9 * Math.sin((f - 3005) * 0.55) : 0, blink: emuBlink(f, 0) });
      break;
    }
    case 32: {
      TR.forEach((n, k) => man(out, cam, WHO[n], TRIO[k][0], 0, TRIO[k][2], { expr: f >= 3476 ? "nervous" : "neutral", shrug: f >= 3476 ? q(ramp(f, 3476, 3484), 4) || undefined : undefined }, t));
      if (f < 3536) TR.forEach((_, k) => bubble(out, f, 3482 + k * 4, "q", TRIO[k][0] - 0.75, 2.55, TRIO[k][2], 0.95));
      if (f >= 3526) board(out, [3.3, 0, 0.9], "EMUS HIT", f >= 3549 ? [{ r: "50 ?", y: 430, rpx: 250, c: "#ffffff" }] : []);
      out.brass = true; out.brassAt = [-3.2, 0, 1.2];
      break;
    }
    case 33: {
      const ok = f >= 3672;
      man(out, cam, WHO.major, 0, 0, 0, { expr: f >= 3625 ? "smile_closed" : "stern" }, t);
      out.fx.push({ key: "paper", cw: 200, ch: 260, draw: fxPaper, x: -0.42, y: 0.98 + 0.01 * Math.sin(f / 5), z: -0.12, w: 0.3, h: 0.39 });
      [[-1.3, 0.5], [1.3, 0.5]].forEach(([x, z], k) => man(out, cam, WHO[TR[k + 1]], x, 0, z, { expr: ok ? "grin" : "neutral", cheer: ok ? q(0.7 + 0.3 * Math.sin(f * 0.5 + k), 4) : undefined }, t));
      bubble(out, f, 3676, "tick", 1.9, 2.75, 0.4, 1.3, false, true);
      break;
    }
    case 34: {
      // called home: three backs walk toward the low sun; an emu watches from the side
      const d0 = 6.5 + 1.1 * T(f - 3719), rt: [number, number] = [-HOME_DIR[1], HOME_DIR[0]];
      TR.forEach((n, k) => {
        const side = (k === 0 ? 0 : k === 1 ? 1 : -1) * 1.4, d = d0 - (k === 0 ? 0 : 0.45);
        const x = HOME_CAM[0] + HOME_DIR[0] * d + rt[0] * side, z = HOME_CAM[2] + HOME_DIR[1] * d + rt[1] * side;
        person(out, cam, WHO[n], x, 0, z, { fo: { mode: "stroll", back: true, phase: (d / 1.4 + k * 0.37) % 1, lift: 60, tilt: 3, blink: 0 } });
        if (k === 1) out.guns.push({ pos: [x + rt[0] * 0.16, 1.4, z + rt[1] * 0.16], yaw: Math.atan2(HOME_DIR[0], HOME_DIR[1]) + Math.PI, pitch: -0.55, legs: false });
      });
      const ex = HOME_CAM[0] + HOME_DIR[0] * 4.4 + rt[0] * 2.5, ez = HOME_CAM[2] + HOME_DIR[1] * 4.4 + rt[1] * 2.5;
      emu(out, cam, { i: 4, x: ex, z: ez, dx: -rt[0], dz: -rt[1], view: "side", mode: "stand", scale: 1.0, expr: "smug", blink: emuBlink(f, 4), nod: 3 * Math.sin(f / 15) });
      break;
    }
    case 35: {
      man(out, cam, WHO.major, 0.9, 0, -1, { expr: f >= 3870 ? "smile" : f >= 3836 ? "shock" : "neutral", headTilt: f >= 3902 ? -5 : 0 }, t);
      bubble(out, f, 3900, "tank", -1.5, 2.25, -1, 2.7, true);
      break;
    }
    case 36: {
      out.office = "parliament";
      man(out, cam, POLS[0], 0, 0, 1.25, { expr: f >= 4013 ? "grin" : "smile", point: f >= 4029 ? q(ramp(f, 4029, 4036), 4) || undefined : undefined }, t, false);
      person(out, cam, POLS[1], -3.6, 0.58, 2.2, { fo: { mode: "sit", expr: f >= 4081 ? "laugh" : "smile", blink: lidAt(t, 44) } }, false);
      person(out, cam, POLS[2], 3.4, 0.58, 2.2, { fo: { mode: "sit", expr: f >= 4085 ? "laugh" : "neutral", blink: lidAt(t, 45) } }, false);
      bubble(out, f, 4046, "medal", 1.95, 3.05, 1.25, 2.3);
      break;
    }
    case 37: fieldPeckers(out, cam, f, 30); break;
    case 48: {
      // the last word: Emus 1, Australia 0
      if (f >= 5440) board(out, [2.5, 0, -0.5], "FINAL SCORE", [{ l: "EMUS", y: 330, lpx: 96, ...(f >= 5462 ? { r: "1", rpx: 190, c: "#ffffff" } : {}) }, { l: "AUSTRALIA", y: 560, lpx: 96, ...(f >= 5492 ? { r: "0", rpx: 190, c: "#ff8f7a" } : {}) }]);
      break;
    }
    case 40: case 41: {
      if (id === 40) board(out, [0.5, 0, -0.3], "DECEMBER", [{ l: "EMUS A WEEK", y: 330, lpx: 78 }, ...(f >= 4343 ? [{ r: "about 100", y: 520, rpx: 150, c: "#ffffff" } as Row] : [])]);
      else board(out, [0.5, 0, -0.3], "FINAL SCORE", []);
      man(out, cam, WHO.major, 1.75, 0, -1.5, id === 40 ? { expr: "stern", point: 1 } : { expr: "smile", wave: f >= 4414 ? q(Math.sin((f - 4414) / 3.2), 4) : undefined }, t);
      break;
    }
    case 43: {
      // ten bullets = one bird
      for (let k = 0; k < 10; k++) { const n = f - (4692 + k * 2.6); if (n >= 0) out.fx.push({ key: "round", cw: 120, ch: 400, draw: fxRound, x: 2.3 - k * 0.37, y: 0.32 + (n < 4 ? 0.12 * (1 - n / 4) : 0), z: -1.5, w: 0.19, h: 0.63 }); }
      if (f >= 4727) out.fx.push({ key: "equals", cw: 200, ch: 200, draw: fxEquals, x: -1.45, y: 0.5, z: -1.5, w: 0.46, h: 0.46 });
      const y = dropY(f, 4745, 1.4);
      if (y >= 0) { emu(out, cam, { i: 2, x: -2.55, y, z: -1.5, dx: 0, dz: -1, view: "front", mode: "stand", scale: 1.0, expr: "smug", blink: emuBlink(f, 2), shadow: y < 0.02 }); dust(out, f, 4745, -2.55, 0, -1.7, 1.0); }
      break;
    }
    case 46: case 47: {
      const up = id === 47 ? 1 : ramp(f, 5104, 5118);
      out.tallFence = up;
      for (let i = 0; i < 7; i++) emu(out, cam, { i, x: -6.2 + i * 1.15 + (hh(i, 3) - 0.5) * 0.3, z: 0.7 + hh(i, 5) * 1.2, dx: 0, dz: 1, view: "back", mode: "stand", nod: up >= 1 ? 6 * Math.sin(f / 8 + i) : 0 });
      if (id === 46 && f >= 5134) board(out, [3.6, 0, 0.6], "REWARD", [{ l: "FOR EVERY EMU", cx: 512, y: 360, lpx: 92, lc: "#ffffff" }, { l: "£", cx: 512, y: 560, lpx: 190, lc: "#ffe27a" }]);
      if (id === 47) { const n = Math.round(57034 * ramp(f, 5286, 5326)); board(out, [3.6, 0, 0.6], "REWARDS CLAIMED", [{ l: "6 MONTHS OF 1934", cx: 512, y: 300, lpx: 66 }, ...(f >= 5286 ? [{ l: n.toLocaleString("en-US"), cx: 512, y: 500, lpx: 210, lc: "#ffffff" } as Row] : [])]); }
      if (f >= 5134) man(out, cam, FARM[0], 5.75, 0, 0.5, { expr: id === 47 && f >= 5326 ? "grin" : "smile", point: id === 46 ? 1 : undefined, cheer: id === 47 && f >= 5328 ? 1 : undefined }, t);
      break;
    }
  }
  setTalkFn(null);
  return out;
};

export const LONG_SHOW: Show = { shots: SHOTS_L, camAt: camAtL, sceneAt: sceneAtL, crowdFor: crowdForL, wheatAt: wheatAtL };
export { fxSmoke, firing, burst, flash, riseY, RISE_Z0, SIR_END, MAJOR, DIGGER2 };
export type { EmuOpts };
