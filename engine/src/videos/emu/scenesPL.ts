// What happens in every shot of the long film "The Pig War", frame by frame. Landscape; +x is screen-left.
import { fxStars, FARMER, FARMER2, FARMER3, Outfit, FrontOpts, INK } from "./toon";
import { fxPaper } from "./longtoon";
import { fxMuzzle } from "./emutoon";
import { fxMug, fxStamp, fxSheep } from "./wltoon";
import { fxCannon, fxRifle, fxPotato, fxGrave, fxTalk, fxBarrel, fxBook, fxEarth, fxPole, fxClothUK } from "./pigtoon";
import { Stage, CamInfo, person, pig, q, lidAt } from "./castbase";
import { FPS, V3, ramp, clamp01 } from "./story";
import { Scene, Show, dust, SIR } from "./scenes";
import { Who, U1, U2, U3, B1, B2, CUTLAR, GRIFFIN, ADMIRAL, KAISER, man, pop, card, tag, banner, say, bubble, sparkle, sweat, flag, ship } from "./scenesP";
import talkJson from "./talkPL.json";
import { SHORE, CAMPS, HX } from "./storyP";
import { SHOTS_PL, camAtPL, atL as at, APL, FARMX, GX, BANG_L, RACE_L } from "./storyPL";

const TALK = talkJson as number[];
const talk = (f: number) => TALK[Math.max(0, Math.min(TALK.length - 1, f))] ?? 0;
const T = (f: number) => f / FPS;
const US_O = U1.o, DARK: Outfit = { jacket: "#3a3540", pants: "#55504a", boots: INK, hat: "tophat", buttons: "#c9a94a" };
const US_DIP: Who = { i: 21, o: { ...DARK, skin: "#f5c9a0" }, okey: "usdip" }, UK_DIP: Who = { i: 22, o: { ...DARK, jacket: "#5a2f3a", moustache: "#8a6a44" }, okey: "ukdip" };
const PICKETT: Who = { i: 23, o: { ...US_O, hat: "peaked", cap: "#263a5e", moustache: "#5b3a22", sash: "#c9302b" }, okey: "pickett" };
const ROBERT: Who = { i: 24, o: { ...US_O, hat: "peaked", cap: "#263a5e", skin: "#f5c9a0" }, okey: "robert" };
const GOVERNOR: Who = { i: 25, o: { jacket: "#3b2f4a", pants: "#2e3142", boots: INK, hat: "tophat", moustache: "#d0d0d6", build: "stout", buttons: "#e2bb4c", sash: "#c8312b" }, okey: "governor" };
const CAPTAIN: Who = { i: 26, o: { jacket: "#22304f", pants: "#e9e4d2", boots: INK, hat: "peaked", cap: "#22304f", buttons: "#e2bb4c" }, okey: "captain" };
const PRESIDENT: Who = { i: 27, o: { jacket: "#2e3142", pants: "#2e3142", boots: INK, hat: "hair", hair: "#e9e9ee", build: "stout", buttons: "#c9a94a" }, okey: "president" };
const SCOTT: Who = { i: 28, o: { ...US_O, hat: "peaked", cap: "#263a5e", moustache: "#e9e9ee", build: "stout", sash: "#e2bb4c" }, okey: "scott" };
const RANGER: Who = { i: 29, o: { jacket: "#7a8a5a", pants: "#5a6a48", boots: INK, hat: "slouch", cap: "#b99a62", buttons: "#c9a94a" }, okey: "ranger" }, RANGER2: Who = { i: 30, o: { ...RANGER.o, skin: "#f5c9a0" }, okey: "ranger2" };
const SET2: Who = { i: 19, o: FARMER2, okey: "farmer2" }, SET3: Who = { i: 20, o: FARMER3, okey: "farmer3" };
void FARMER;

const talkB = (out: Stage, f: number, f0: number, s: string, x: number, y: number, z: number, w: number, flip = false) =>
  card(out, f, f0, `talk|${s}|${flip}`, 900, 460, (p) => fxTalk(p, s, flip), x, y, z, w);
const guns = (out: Stage, cx: number, n: number, z0 = 4) => {
  for (let k = 0; k < n; k++) out.fx.push({ key: "cannon", cw: 420, ch: 260, draw: fxCannon, x: cx + ((k % 7) - 3) * 1.0, y: 0.3, z: z0 + Math.floor(k / 7) * 2, w: 0.95, h: 0.59 });
};
const sheep = (out: Stage, f: number, list: [number, number][]) => list.forEach(([x, z], i) => { const k = q(0.5 + 0.5 * Math.sin(f / 5 + i * 2), 2); out.fx.push({ key: `sheep${k}`, cw: 400, ch: 320, draw: (p) => fxSheep(p, k), x, y: 0.46, z, w: 1.15, h: 0.92 }); });
const plants = (out: Stage, n: number, eatenTo = 99) => {
  let k = 0;
  for (const z of [1.0, 2.0]) for (const x of [1.3, 2.5, 3.7]) { if (k++ >= n) continue; const eaten = z === 1.0 && x > eatenTo; out.fx.push({ key: `potato${eaten}`, cw: 220, ch: 220, draw: (p) => fxPotato(p, eaten), x, y: 0.26, z, w: 0.52, h: 0.52 }); }
};

// ---- the map on the board (1024 x 756) ----
const chalkT = (g: CanvasRenderingContext2D, s: string, x: number, y: number, px: number, colr = "#2b2430") => { g.font = `900 ${px}px 'Arial Black', Impact, sans-serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = colr; g.fillText(s, x, y); };
const land = (g: CanvasRenderingContext2D, pts: number[][], fill: string) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fillStyle = fill; g.fill(); g.strokeStyle = "#3a4a3a"; g.lineWidth = 7; g.stroke(); };
const dashed = (g: CanvasRenderingContext2D, pts: number[][], colr: string, solid = false) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.setLineDash(solid ? [] : [26, 18]); g.strokeStyle = colr; g.lineWidth = 12; g.stroke(); g.setLineDash([]); };
/** stage: 0 the two coasts, 1 + one border line, 2 + the islands, 3 + two channels, 4 + names, 5 the verdict (islands American) */
const mapDraw = (stage: number) => (g: CanvasRenderingContext2D) => {
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = "#bfe3f2"; g.fillRect(0, 0, 1024, 756);
  land(g, [[0, 0], [250, 0], [290, 120], [240, 260], [300, 420], [250, 600], [280, 756], [0, 756]], "#e7c9c4");
  land(g, [[1024, 0], [770, 0], [730, 150], [790, 300], [740, 470], [780, 640], [750, 756], [1024, 756]], "#c9d7ee");
  chalkT(g, "VANCOUVER", 136, 330, 32); chalkT(g, "ISLAND", 136, 372, 32); chalkT(g, "(BRITISH)", 136, 414, 26, "#8a3a34");
  chalkT(g, "UNITED", 892, 330, 38); chalkT(g, "STATES", 892, 376, 38);
  const isl = stage >= 5 ? "#c9d7ee" : "#cfe3a8";
  if (stage >= 2) { land(g, [[450, 250], [540, 220], [590, 300], [560, 400], [470, 410], [430, 330]], isl); land(g, [[500, 450], [570, 440], [600, 520], [540, 570], [480, 530]], isl); land(g, [[590, 180], [640, 170], [650, 230], [600, 240]], isl); }
  if (stage === 1) { dashed(g, [[512, 0], [512, 756]], "#c8312b"); chalkT(g, "THE BORDER", 512, 60, 44, "#c8312b"); }
  if (stage >= 3) { dashed(g, [[370, 0], [350, 250], [390, 480], [360, 756]], "#c8312b", stage >= 5); if (stage < 5) dashed(g, [[690, 0], [700, 260], [670, 500], [690, 756]], "#2a3f7a"); }
  if (stage >= 4) { chalkT(g, "HARO", 376, 620, 34, "#c8312b"); chalkT(g, "STRAIT", 376, 660, 34, "#c8312b"); if (stage < 5) { chalkT(g, "ROSARIO", 668, 620, 34, "#2a3f7a"); chalkT(g, "STRAIT", 668, 660, 34, "#2a3f7a"); } chalkT(g, "SAN JUAN ISLANDS", 520, 110, 40); }
  if (stage >= 5) chalkT(g, "U.S.A.", 512, 330, 46, "#2a3f7a");
  g.strokeStyle = "#5a4630"; g.lineWidth = 16; g.strokeRect(8, 8, 1008, 740);
};
/** the island alone, with the two camps: stage 0 island, 1 + British camp (north), 2 + American camp (south) */
const campsDraw = (stage: number) => (g: CanvasRenderingContext2D) => {
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = "#bfe3f2"; g.fillRect(0, 0, 1024, 756);
  land(g, [[330, 120], [520, 70], [690, 150], [740, 330], [660, 520], [560, 690], [430, 640], [350, 470], [290, 300]], "#cfe3a8");
  chalkT(g, "SAN JUAN ISLAND", 512, 380, 46);
  chalkT(g, "N", 900, 110, 70); g.beginPath(); g.moveTo(900, 150); g.lineTo(900, 260); g.strokeStyle = "#2b2430"; g.lineWidth = 10; g.stroke();
  if (stage >= 1) { g.fillStyle = "#c8312b"; g.beginPath(); g.arc(470, 190, 26, 0, 7); g.fill(); chalkT(g, "BRITISH CAMP", 520, 250, 44, "#c8312b"); }
  if (stage >= 2) { g.fillStyle = "#2a3f7a"; g.beginPath(); g.arc(540, 590, 26, 0, 7); g.fill(); chalkT(g, "AMERICAN CAMP", 520, 520, 44, "#2a3f7a"); }
  g.strokeStyle = "#5a4630"; g.lineWidth = 16; g.strokeRect(8, 8, 1008, 740);
};
const BOARD: V3 = [3.4, 0, 3.4];

export const sceneAtPL = (id: number, f: number, cam: CamInfo): Scene => {
  const out: Scene = { places: [], fx: [], guns: [], crates: [], fan: f * 0.07 };
  const t = T(f), a = APL[id], n = f - a;
  const sir = (x: number, z: number, fo: FrontOpts = {}) => person(out, cam, SIR, x, 0, z, { fo: { mode: "stand", expr: "smile", blink: lidAt(t, 3), ...fo }, talk: talk(f) });
  const wav = (on: boolean, ph = 0) => (on ? q(Math.sin(f / 3.2 + ph), 4) : undefined);
  const chr = (f0: number, ph = 0) => (f >= f0 ? q(0.7 + 0.3 * Math.sin(f * 0.5 + ph), 4) : undefined);
  const fleet = (cx: number, count: number, w = 4.6, gap = 6.0, z = 30, f0 = -999) => { for (let k = 0; k < count; k++) { const g0 = f0 + k * 6; if (f >= g0) ship(out, cx + (k - (count - 1) / 2) * gap - 30 * (1 - ramp(f, g0, g0 + 26)), z, w); } };
  switch (id) {
    case 1: case 19: {
      // the stand-off at its height: guns and soldiers on the shore, warships on the strait
      const cx = SHORE - (id === 1 ? 1.5 : 0);
      const cn = id === 1 ? 14 : f >= at("grow", "14") - 2 ? 14 : 0, five = id === 1 || f >= at("grow", "5") - 2;
      if (id === 1) sir(SHORE + 2.2, -1.6);
      guns(out, cx, cn, 5);
      for (let k = 0; k < 5; k++) man(out, cam, [U1, U2, U3, U1, U2][k], cx + (k - 2) * 1.1, 0, 9, { expr: "stern" }, t);
      flag(out, f, true, cx + 4.3, 10);
      if (id === 1) fleet(cx, 5, 4.4, 5.6, 26); else { fleet(cx, 3, 4.4, 5.6, 26); if (five) for (const s of [-1, 1]) ship(out, cx + s * (11.2 + 30 * (1 - ramp(f, at("grow", "5") - 2, at("grow", "5") + 22))), 26, 4.4); }
      if (id === 19) {
        const us: [string, string, string][] = [["461", "AMERICANS", "461"], ["14", "CANNONS", "14"]], uk: [string, string, string][] = [["5", "WARSHIPS", "5"], ["70", "GUNS", "70"], ["2,140", "MEN", "2,140"]];
        let cu = -1, ck = -1; us.forEach(([w], k) => { if (f >= at("grow", w) - 2) cu = k; }); uk.forEach(([w], k) => { if (f >= at("grow", w) - 2) ck = k; });
        if (cu >= 0) tag(out, f, at("grow", us[cu][0]) - 2, us[cu][1], us[cu][2], cx + 6.0, 5.35, 20, 4.8, "#dfe9ff");
        if (ck >= 0) tag(out, f, at("grow", uk[ck][0]) - 2, uk[ck][1], uk[ck][2], cx - 6.0, 5.35, 20, 4.8, "#ffe1dc");
      }
      break;
    }
    case 2: case 3: case 7: {
      const mine = id === 7;
      if (id !== 3) { flag(out, f, true, HX + (mine ? 2.7 : 3.7), 3.4); flag(out, f, false, HX - (mine ? 2.7 : 3.7), 3.4); }
      man(out, cam, U1, HX + 1.2, 0, 1.8, { expr: "stern", look: -1, point: mine && f >= at("both", "say") - 2 ? 0.6 : undefined }, t); man(out, cam, B1, HX - 1.2, 0, 1.8, { expr: "stern", look: 1 }, t);
      if (!mine) { man(out, cam, U2, HX + 2.3, 0, 1.8, { expr: "stern", look: -1 }, t); man(out, cam, B2, HX - 2.3, 0, 1.8, { expr: "stern", look: 1 }, t); }
      if (id === 3) pig(out, cam, { x: HX, z: 1.6, mode: "stand", expr: n > 18 ? "shock" : "calm", blink: lidAt(t, 61) });
      if (mine) { const c0 = at("both", "say") - 2; say(out, f, c0, "Mine!", HX + 1.5, 2.95, 1.8, 1.3, true); say(out, f, c0 + 10, "Mine!", HX - 1.5, 2.95, 1.8, 1.3); }
      break;
    }
    case 4: {
      sir(HX + 1.6, -4.2, { wave: wav(n > 4 && n < 50) });
      pig(out, cam, { x: HX - 1.4, z: -3.2, mode: "stand", expr: "happy", mirror: true, blink: lidAt(t, 61) });
      banner(out, f, at("intro", "Pig") - 3, "1859|THE PIG WAR", HX - 1.4, 1.75, -3.2, 2.4, "#fff3c4");
      break;
    }
    case 5: case 6: case 25: case 30: {
      // the treaty and the map
      out.office = "minister";
      if (id === 5) {
        out.board = { pos: BOARD, key: `map${f >= at("treaty", "middle") - 2 ? 1 : 0}`, draw: mapDraw(f >= at("treaty", "middle") - 2 ? 1 : 0) };
        const ag = f >= at("treaty", "agree") - 2;
        man(out, cam, US_DIP, 1.0, 0, 1.5, { expr: ag ? "grin" : "smile", look: -1 }, t); man(out, cam, UK_DIP, -0.2, 0, 1.5, { expr: ag ? "grin" : "smile", look: 1 }, t);
        card(out, f, at("treaty", "treaty") - 2, "paper", 200, 260, fxPaper, 0.4, 1.25, 1.4, 0.42);
        tag(out, f, at("treaty", "1846") - 2, "OREGON TREATY", "1846", 0.4, 3.05, 1.5, 1.5);
      } else if (id === 6) {
        const st = f >= at("two", "San") - 2 ? 4 : f >= at("two", "between") - 2 ? 3 : f >= at("two", "two") - 2 ? 3 : 1;
        const st2 = f >= at("two", "San") - 2 ? 4 : f >= at("two", "two") - 2 ? 3 : 2;
        out.board = { pos: BOARD, key: `map${Math.max(st, st2)}`, draw: mapDraw(Math.max(st, st2)) };
      } else if (id === 25) {
        const st = f >= at("camps", "Americans") - 2 ? 2 : f >= at("camps", "British") - 2 ? 1 : 0;
        out.board = { pos: BOARD, key: `camps${st}`, draw: campsDraw(st) };
      } else {
        const st = f >= at("verdict", "islands") - 2 ? 5 : 4;
        out.board = { pos: BOARD, key: `map${st}`, draw: mapDraw(st) };
        card(out, f, at("verdict", "American") - 3, "stampA", 640, 220, (p) => fxStamp(p, "AMERICAN"), 3.4, 1.95, 3.2, 1.0, 0.1);
      }
      break;
    }
    case 8: {
      // Belle Vue sheep farm: the manager, his sheep, and his pigs going where they please
      const lets = at("sheep", "lets") - 4;
      man(out, cam, GRIFFIN, FARMX + 1.6, 0, 6.2, { expr: "smile" }, t);
      sheep(out, f, [[FARMX - 1.4, 7.2], [FARMX - 3.4, 8.6], [FARMX + 4.2, 7.8]]);
      if (f < lets + 4) banner(out, f, at("sheep", "Hudson's") - 2, "HUDSON'S BAY COMPANY|SHEEP FARM", FARMX, 3.75, 6.2, 3.8);
      if (f >= at("sheep", "Charles") - 2 && f < lets + 4) banner(out, f, at("sheep", "Charles") - 2, "CHARLES GRIFFIN", FARMX + 1.6, 2.5, 6.2, 1.9, "#fff3c4");
      if (f >= lets) [0, 1, 2].forEach((k) => { const u = (f - lets - k * 9) / 80, x = FARMX + 6.0 - 13 * u; if (u > 0) pig(out, cam, { x, z: 3.2 + k * 0.9, mode: "walk", phase: (u * 14 + k * 0.3) % 1, expr: "happy", blink: 0 }); });
      break;
    }
    case 9: {
      const pl0 = at("settlers", "plants") - 2, ly = at("settlers", "Lyman") - 2, np = Math.max(0, Math.min(6, Math.floor((f - pl0) / 5) + 1));
      const sl = 4 * (1 - ramp(f, a, a + 40));
      flag(out, f, true, 6.5 + sl * 0.5, 1.6);
      man(out, cam, SET2, 5.7 + sl, 0, 0.4, sl > 0.05 ? { mode: "march", phase: (n / 9) % 1, expr: "smile" } : { expr: "smile", look: -1 }, t);
      man(out, cam, SET3, 4.8 + sl, 0, -0.5, sl > 0.05 ? { mode: "march", phase: (n / 9 + 0.5) % 1, expr: "smile" } : { expr: "smile", look: -1 }, t);
      man(out, cam, CUTLAR, 3.7 + sl, 0, -0.6, sl > 0.05 ? { mode: "march", phase: (n / 9 + 0.2) % 1, expr: "smile" } : { expr: f >= pl0 ? "grin" : "smile", look: -1 }, t);
      if (f >= ly) banner(out, f, ly, "FROM KENTUCKY|LYMAN CUTLAR", 3.7, 2.7, -0.6, 2.2, "#fff3c4");
      if (f >= pl0) plants(out, np);
      break;
    }
    case 10: case 11: case 12: {
      // the potato patch: the pig, the farmer, the shot, the owner
      const dead = id === 12 || (id === 11 && f >= BANG_L), cu = at("morning", "Cutlar") - 4, px = id === 10 ? 3.0 + 0.004 * (APL[11] - f) : 3.0;
      plants(out, 6, px - 0.5);
      pig(out, cam, { x: px, z: 1.45, mode: dead ? "dead" : "eat", k: f / 9, blink: 0 });
      if (id === 11) dust(out, f, BANG_L, px, 0.1, 1.3, 1.2);
      if (dead) { const s = q((t * 0.9) % 1, 30); out.fx.push({ key: `stars${s}`, cw: 420, ch: 210, draw: (p) => fxStars(p, s), x: px - 0.42, y: 0.95, z: 1.4, w: 0.6, h: 0.3 }); }
      if (id > 10 || f >= cu) {
        const cx = id === 10 ? 0.7 - 2.6 * (1 - ramp(f, cu, cu + 16)) : 0.7, walking = id === 10 && f < cu + 16;
        const not = id === 10 && f >= at("morning", "Not") - 2;
        man(out, cam, CUTLAR, cx, 0, 1.3, walking ? { mode: "march", phase: (n / 9) % 1, expr: "neutral" } : { expr: id === 12 ? "nervous" : id === 11 ? "stern" : not ? "pained" : "shock", look: 1 }, t);
        if (not) talkB(out, f, at("morning", "Not") - 2, "Not again!", 0.2, 2.4, 1.3, 1.6, true);
        if (id === 11) {
          out.fx.push({ key: "rifle", cw: 560, ch: 120, draw: (p) => { p.g.save(); p.g.translate(560, 0); p.g.scale(-1, 1); fxRifle(p); p.g.restore(); }, x: cx + 0.62, y: 1.18, z: 1.25, w: 0.95, h: 0.2 });
          if (f >= BANG_L && f < BANG_L + 3) out.fx.push({ key: `muzzle${f - BANG_L + 1}`, cw: 300, ch: 300, draw: (p) => fxMuzzle(p, f - BANG_L + 1), x: cx + 1.15, y: 1.2, z: 1.24, w: 0.7, h: 0.7 });
        }
      }
      if (id === 10) tag(out, f, a + 8, "15 JUNE", "1859", 5.0, 2.25, 2.2, 1.4);
      if (id === 12) {
        const gx = 5.0 + 2.4 * (1 - ramp(f, a, a + 16));
        man(out, cam, GRIFFIN, gx, 0, 1.3, f < a + 16 ? { mode: "march", phase: (n / 8) % 1, expr: "shock" } : { expr: "stern", look: -1 }, t);
        banner(out, f, at("owner", "Griffin") - 3, "PROPERTY OF|C. GRIFFIN", px, 2.0, 1.45, 2.4, "#ffd9c9");
      }
      break;
    }
    case 13: case 14: {
      man(out, cam, CUTLAR, HX + 1.2, 0, 0, { expr: "nervous", look: -1, shrug: id === 13 && f >= at("offer", "10") - 2 ? 0.6 : undefined }, t);
      man(out, cam, GRIFFIN, HX - 1.2, 0, 0, { expr: "stern", look: 1, point: id === 13 && f >= at("offer", "demands") - 2 ? 0.7 : undefined }, t);
      pig(out, cam, { x: HX, z: 1.4, mode: "dead", scale: 0.55 });
      if (id === 13) { tag(out, f, at("offer", "10") - 2, "OFFER", "$10", HX + 1.2, 2.75, 0, 1.05); tag(out, f, at("offer", "100") - 2, "DEMAND", "$100", HX - 1.2, 2.75, 0, 1.05, "#ffd9c9"); }
      else {
        const c1 = at("quote", "it") - 2, c2 = at("quote", "it", 1) - 2;
        banner(out, f, a + 6, "THE STORY GOES...", HX, 3.42, 0, 2.0);
        if (f < c2) talkB(out, f, c1, "It was eating|my potatoes!", HX + 1.5, 2.55, 0, 2.2, true);
        else talkB(out, f, c2, "Keep your potatoes|out of MY PIG!", HX - 1.5, 2.55, 0, 2.4);
      }
      break;
    }
    case 15: {
      const so = at("arrest", "So") - 3;
      if (f < so) {
        man(out, cam, CUTLAR, HX + 1.9, 0, 0, { expr: "nervous", look: -1 }, t); sweat(out, f, HX + 2.25, 1.9, -0.1);
        man(out, cam, B1, HX + 0.1, 0, 0, { expr: "stern", look: 1 }, t); man(out, cam, GRIFFIN, HX - 1.5, 0, 0, { expr: "stern", look: 1 }, t);
        talkB(out, f, at("arrest", "arrest") - 4, "We will|arrest you!", HX - 0.3, 2.85, 0, 2.0);
      } else {
        [CUTLAR, SET2, SET3].forEach((w, k) => man(out, cam, w, GX + 1.2 + (1 - k) * 1.2, 0, 0.5, { expr: "shock", cheer: chr(so + 6 + k * 3, k) }, t));
        talkB(out, f, at("arrest", "ask") - 2, "Send the army!", GX + 1.2, 3.0, 0.5, 2.3);
      }
      break;
    }
    case 16: case 17: {
      // Captain Pickett and exactly sixty-six soldiers
      const sl = id === 16 ? 16 * (1 - ramp(f, a, a + 36)) : 0;
      for (let r = 0; r < 6; r++) for (let c = 0; c < 11; c++) man(out, cam, [U1, U2, U3][(r + c) % 3], SHORE + (c - 5) * 0.95 + sl, 0, 2 + r * 1.1, sl > 0.05 ? { mode: "march", phase: (n / 9 + c * 0.13) % 1, expr: "stern" } : { expr: "stern" }, t, false);
      flag(out, f, true, SHORE + 6.6 + sl, 4);
      man(out, cam, PICKETT, SHORE + sl * 0.6, 0, id === 16 ? -0.4 : -4, { expr: id === 17 ? "grin" : "stern", point: id === 17 && n > 8 ? 0.7 : undefined }, t);
      if (id === 16) { tag(out, f, at("pickett", "66") - 2, "SOLDIERS", "66", SHORE - 5.9, 3.6, 5, 2.4, "#dfe9ff"); banner(out, f, at("pickett", "Captain") - 2, "CAPTAIN GEORGE PICKETT", SHORE + sl * 0.6, 2.55, -0.4, 2.6, "#fff3c4"); }
      else talkB(out, f, at("bunker", "we'll") - 3, "We'll make a|Bunker Hill of it!", SHORE - 1.3, 2.55, -4, 2.0);
      break;
    }
    case 18: {
      fleet(SHORE, 3, 6.0, 8.2, 30, a - 8);
      tag(out, f, at("ships", "3") - 2, "WARSHIPS", "3", SHORE, 9.2, 20, 5.2, "#ffe1dc");
      break;
    }
    case 20: {
      // the redoubt, and the lieutenant who later wrote the rule book
      const X = SHORE + 30, rb = at("fort", "Robert's") - 3, pm = at("fort", "polite") - 3;
      for (const dx of [-3.1, 0, 3.1]) out.fx.push({ key: "earth", cw: 900, ch: 300, draw: fxEarth, x: X + dx, y: 0.5, z: 2.4, w: 3.0, h: 1.0 });
      man(out, cam, U1, X + 2.6, 0, 3.2, { expr: "stern" }, t); man(out, cam, U2, X - 2.2, 0, 3.2, { expr: "stern" }, t);
      for (const dx of [-5.2, 5.2]) out.fx.push({ key: "cannon", cw: 420, ch: 260, draw: fxCannon, x: X + dx, y: 0.3, z: 0.9, w: 0.95, h: 0.59 });
      flag(out, f, true, X + 6.6, 3.4);
      man(out, cam, ROBERT, X + 0.7, 0, 0, { expr: f >= rb ? "grin" : "smile", look: -1 }, t);
      banner(out, f, at("fort", "Henry") - 2, "LIEUTENANT HENRY ROBERT", X + 0.7, 2.6, 0, 2.5, "#fff3c4");
      card(out, f, rb, "bookRR", 420, 300, (p) => fxBook(p, "ROBERT'S|RULES OF|ORDER"), X - 1.0, 1.35, -0.1, 1.15, -0.08);
      talkB(out, f, pm, "Order, please!", X - 1.3, 3.25, 0, 1.9);
      break;
    }
    case 21: case 22: {
      // on the flagship: the governor wants the Americans removed; the admiral will not do it
      const ad = id === 22, r0 = at("baynes", "refuses") - 3;
      man(out, cam, GOVERNOR, 8.4 + 1.8, 3.76, 9.2, { expr: "stern", look: -1, point: !ad && f >= at("order", "orders") - 2 ? 0.8 : undefined }, t, false);
      man(out, cam, CAPTAIN, ad ? 8.4 - 1.9 : 8.4 - 0.2, 3.76, 9.2, { expr: ad ? "relief" : "nervous", look: 1 }, t, false);
      if (!ad) talkB(out, f, at("order", "push") - 3, "Push them off|the island!", 8.4 + 1.2, 6.65, 9.2, 2.3, true);
      if (ad) { man(out, cam, ADMIRAL, 8.4, 3.76, 9.2, { expr: f >= r0 ? "stern" : "neutral", shrug: f >= r0 ? ramp(f, r0, r0 + 8) : undefined }, t, false);
        if (f < at("baynes", "He") - 2) banner(out, f, at("baynes", "Rear") - 2, "REAR ADMIRAL BAYNES", 8.4, 6.45, 9.2, 2.6, "#fff3c4");
        if (f >= at("baynes", "He") - 2) say(out, f, at("baynes", "He") - 2, "A war...|over a PIG?", 8.4 - 0.4, 6.3, 9.2, 1.7); }
      break;
    }
    case 23: case 24: {
      out.office = "minister";
      if (id === 23) {
        person(out, cam, PRESIDENT, -2.2, 0.4, 2.3, { fo: { mode: "stand", expr: "stern", look: 1, blink: lidAt(t, 39), point: f >= at("scott", "sends") - 2 ? 0.8 : undefined } });
        man(out, cam, SCOTT, 0.9, 0, 1.4, { expr: "stern", look: -1 }, t);
        banner(out, f, at("scott", "President") - 2, "PRESIDENT BUCHANAN", -2.2, 3.4, 2.3, 2.4, "#fff3c4");
        banner(out, f, at("scott", "General") - 2, "GENERAL WINFIELD SCOTT", 0.9, 2.75, 1.4, 2.6, "#fff3c4");
      } else {
        const h0 = at("deal", "100") - 2;
        man(out, cam, SCOTT, 1.3, 0, 1.5, { expr: "smile", look: -1 }, t); man(out, cam, GOVERNOR, 0.0, 0, 1.5, { expr: "smile", look: 1 }, t);
        card(out, f, at("deal", "deal") - 2, "paper", 200, 260, fxPaper, 0.65, 1.25, 1.4, 0.42);
        tag(out, f, h0, "AMERICANS", "100 MEN", 2.6, 2.9, 1.5, 1.6, "#dfe9ff"); tag(out, f, h0 + 8, "BRITISH", "100 MEN", -1.3, 2.9, 1.5, 1.6, "#ffe1dc");
      }
      break;
    }
    case 26: case 27: case 28: case 33: {
      // the two camps
      const C = CAMPS;
      if (id !== 33) { flag(out, f, true, C + 3.7, 3.5); flag(out, f, false, C - 3.7, 3.5); }
      if (id === 26) {
        man(out, cam, U1, C + 1.2, 0, 0.5, { expr: "smile", look: -1 }, t); man(out, cam, U2, C + 2.3, 0, 0.5, { expr: "smile", look: -1 }, t);
        man(out, cam, B1, C - 1.2, 0, 0.5, { expr: "smile", look: 1 }, t); man(out, cam, B2, C - 2.3, 0, 0.5, { expr: "smile", look: 1 }, t);
        banner(out, f, at("twelve", "12") - 2, "1859 - 1872|12 YEARS", C, 3.6, 0.5, 2.8, "#fff3c4");
      } else if (id === 27) {
        const cl = at("friends", "holidays") - 4, u = ramp(f, cl, cl + 8), ru = clamp01((f - RACE_L) / (SHOTS_PL[26].b - RACE_L - 4));
        if (f < RACE_L) {
          man(out, cam, U1, C + 0.75, 0, 0, { expr: "laugh", look: -1 }, t); man(out, cam, B1, C - 0.75, 0, 0, { expr: "laugh", look: 1 }, t);
          for (const s of [-1, 1]) out.fx.push({ key: "mug", cw: 200, ch: 200, draw: fxMug, x: C + s * (0.42 - 0.26 * u), y: 1.15 + 0.3 * u, z: -0.3, w: 0.3, h: 0.3, rot: s * 0.25 * u });
          sparkle(out, f, cl + 8, C, 1.6, -0.35, 0.4);
          man(out, cam, U2, C + 2.6, 0, 0.6, { expr: "grin", look: -1, cheer: chr(cl + 6) }, t); man(out, cam, B2, C - 2.6, 0, 0.6, { expr: "grin", look: 1, cheer: chr(cl + 9, 1) }, t);
        } else {
          person(out, cam, U2, C + 3.6 - 5.2 * ru, 0, 2.2, { side: true, so: { mode: "march", phase: (ru * 8) % 1 } });
          person(out, cam, B2, C + 2.2 - 5.6 * ru, 0, 3.0, { side: true, so: { mode: "march", phase: (ru * 8 + 0.5) % 1 } });
          man(out, cam, U1, C + 4.6, 0, 4.2, { expr: "laugh", cheer: chr(RACE_L + 4) }, t); man(out, cam, B1, C - 4.6, 0, 4.2, { expr: "laugh", cheer: chr(RACE_L + 8, 1) }, t);
          banner(out, f, RACE_L, "SPORTS DAY", C, 3.9, 3.5, 2.8, "#fff3c4");
        }
      } else if (id === 28) {
        for (const [dx, dz] of [[-0.5, 1.6], [0.6, 1.9], [0.05, 1.2]]) out.fx.push({ key: "barrel", cw: 260, ch: 320, draw: fxBarrel, x: C + dx, y: 0.46, z: dz, w: 0.75, h: 0.92 });
        ([[U2, 1.7], [B2, -1.7]] as [Who, number][]).forEach(([w, x], k) => {
          person(out, cam, w, C + x, 0, 0.4, { fo: { mode: "sit", expr: "dazed", blink: 0 } });
          const s = q((t * 0.9 + k * 0.4) % 1, 30); out.fx.push({ key: `stars${s}`, cw: 420, ch: 210, draw: (p) => fxStars(p, s), x: C + x, y: 1.4, z: 0.4, w: 0.75, h: 0.37 });
          out.fx.push({ key: "mug", cw: 200, ch: 200, draw: fxMug, x: C + x * 0.62, y: 0.16, z: 0.1, w: 0.3, h: 0.3, rot: k ? -1.3 : 1.3 });
        });
        man(out, cam, RANGER, C + 3.0, 0, 0.6, { expr: "nervous", look: -1, shrug: f >= at("alcohol", "alcohol") - 4 ? 1 : undefined }, t);
        banner(out, f, at("alcohol", "rangers") - 2, "PARK RANGER", C + 3.0, 2.55, 0.6, 1.6, "#e7efd2");
        talkB(out, f, at("alcohol", "alcohol") - 2, "Hic!", C - 1.9, 2.35, 0.4, 1.4);
      } else {
        // today: the Union Jack goes up over the old British camp, raised by American park rangers
        const up = 1.0 + 3.3 * ramp(f, at("flag", "British") - 10, at("flag", "flies") + 6), wv = q(0.5 + 0.5 * Math.sin(f / 7), 6);
        out.fx.push({ key: "pole", cw: 60, ch: 900, draw: fxPole, x: C - 1.2, y: 2.6, z: 2.5, w: 0.35, h: 5.2 });
        out.fx.push({ key: `clothUK${wv}`, cw: 460, ch: 300, draw: (p) => fxClothUK(p, wv * 2), x: C - 1.2 - 0.85, y: up, z: 2.48, w: 1.6, h: 1.04 });
        man(out, cam, RANGER, C - 0.4, 0, 2.3, { expr: "smile", look: -1, cheer: f < at("flag", "flies") + 6 ? q(0.5 + 0.5 * Math.sin(f / 5), 4) : undefined }, t);
        man(out, cam, RANGER2, C + 0.9, 0, 2.3, { expr: "grin", look: -1 }, t);
        banner(out, f, at("flag", "national") - 3, "SAN JUAN ISLAND|NATIONAL HISTORICAL PARK", C + 4.2, 2.2, 2.6, 3.4, "#e7efd2");
      }
      break;
    }
    case 29: {
      out.office = "minister";
      person(out, cam, KAISER, -2.2, 0.4, 2.3, { fo: { mode: "stand", expr: "stern", blink: lidAt(t, 39) } });
      banner(out, f, at("kaiser", "German") - 3, "THE GERMAN EMPEROR|WILHELM I", -2.2, 3.5, 2.3, 2.6, "#fff3c4");
      break;
    }
    case 31: {
      ship(out, SHORE - 1 - 0.12 * n, 26, 7.5);
      man(out, cam, U1, SHORE + 2.4, 0, 3, { expr: "smile", look: -1, wave: wav(true) }, t); man(out, cam, U2, SHORE + 3.6, 0, 3.2, { expr: "smile", look: -1, wave: wav(true, 1) }, t);
      flag(out, f, true, SHORE + 5.4, 4);
      break;
    }
    case 32: {
      out.fx.push({ key: "gravePig", cw: 420, ch: 480, draw: (p) => fxGrave(p, "R.I.P.|THE PIG|1859"), x: HX, y: 0.86, z: 3, w: 1.5, h: 1.72 });
      banner(out, f, at("count", "13") - 2, "THE PIG WAR LASTED|13 YEARS", HX + 2.9, 2.3, 2, 2.9, "#fff3c4");
      banner(out, f, at("count", "one") - 2, "TOTAL CASUALTIES|1 PIG", HX - 2.9, 2.3, 2, 2.9, "#ffd9c9");
      break;
    }
    case 34: case 35: {
      const sx = GX - 0.6 + 1.5;
      plants(out, 6);
      out.fx.push({ key: "gravePig", cw: 420, ch: 480, draw: (p) => fxGrave(p, "R.I.P.|THE PIG|1859"), x: GX - 3.0, y: 0.7, z: 2.6, w: 1.2, h: 1.38 });
      sir(sx, -1.6, { wave: wav(id === 35 && n > 34) });
      if (id === 35) { const u = n / (SHOTS_PL[34].b - a), x = GX + 5.6 - 12 * u; pig(out, cam, { x, z: 0.2, mode: "walk", phase: (u * 16) % 1, expr: "happy", blink: 0 }); }
      break;
    }
  }
  return out;
};
export const PIG_LONG_SHOW: Show = { shots: SHOTS_PL, camAt: camAtPL, sceneAt: sceneAtPL, crowdFor: () => null, wheatAt: () => 1 };
