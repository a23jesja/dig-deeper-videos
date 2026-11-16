// "The Man Who Stole the Mona Lisa", shots 1-25: the hook, chapter 1 (a small painting) and chapter 2 (the man who
// fitted the glass). +x is screen-left.
//
// How these shots are framed: where people stand full length the camera sits low (about waist height), so their feet
// land above the strip of the one-word caption and the caption lies on the floor; closer shots are framed with no
// floor in them, or with the people left and right of the centre line.
import { fxEiffel } from "./lustigtoon";
import { fxCalendar } from "./dailytoon";
import { TWEED } from "./toon";
import { person } from "./castbase";
import { fxLouvre, fxBundle, fxNotreDame, fxGlassPane, fxAlps, fxCamera, fxLens, fxLove, fxSign } from "./monatoon";
import { PER, PER_SMOCK, GUARD1, GUARD2, DIRECTOR, WORK2, WORK3, LEONARDO, KING, COPS, DETECTIVE, FOLK } from "./monacast";
import { ramp, clamp01, smooth } from "./story";
import { Sh, Ctx, at, GAL, STAIR, FLOR, WALL_Y, WALL_Z, office, P, S, sir, walk, wav, fx, pop, ban, tag, sparkle, sweat, thinkTo, bubTo, nameOver, hold } from "./monaKit";
import { COUNTRY, police, directorRoom, country } from "./monaSets";
import { fxMonaA, fxPanelA, fxEaselA, underArmOf, sideHand, fxFineBrush, fxWallBrush, fxBucket, fxCase, fxVMeasure, fxVArrow, fxHooksA, fxPaneA, fxRag, fxHMeasure, fxBoard, fxDeskSign, fxFileA, fxBubMonaQ, fxBubCanvasNo, fxBubPoplar } from "./monaPropsA";

type Draw = Parameters<typeof fx>[4];
const PS = { scale: 0.9 };
/** the Louvre across the square (zone "paris") */
export const louvre = (c: Ctx) => fx(c, "louvre", 1800, 640, fxLouvre, 0, 7.8, 31, 44);
const cal = (c: Ctx, f0: number, head: string, big: string, x: number, y: number, z: number, w: number, col = "#d8382f") => pop(c, f0, `cal|${head}|${big}`, 420, 480, (p) => fxCalendar(p, head, big, col), x, y, z, w);
/** people seen from behind, looking at the wall: xs = where they stand */
export const backs = (c: Ctx, xs: number[], z0: number, k0 = 0, cx = GAL) => xs.forEach((x, k) => P(c, FOLK[(k + k0) % 16], cx + x, z0 + (k % 2) * 0.6, { back: true, headTilt: ((k * 37) % 5 - 2) * 0.02 }));

// ---------------- what hangs on the gallery wall ----------------
/** the Mona Lisa on the wall of the Salon Carre (glass = under her pane; opacity = seen through) */
const mona = (c: Ctx, glass = false, opacity = 1) => {
  if (opacity >= 0.999) fx(c, glass ? "monaAglass" : "monaA", 700, 920, (p) => fxMonaA(p, glass), GAL, WALL_Y, WALL_Z, 1.0);
  else c.out.fx.push({ key: glass ? "monaAglass" : "monaA", cw: 700, ch: 920, draw: (p) => fxMonaA(p, glass), x: GAL, y: WALL_Y, z: WALL_Z, w: 1.0, h: 920 / 700, rot: 0, soft: true, opacity });
};
/** a pane of glass in its wooden edge (translucent, so the picture behind shows through), centre at (x, y) */
const pane = (c: Ctx, x: number, y: number, z = 5.6, w = 0.86) => c.out.fx.push({ key: "paneA", cw: 560, ch: 760, draw: fxPaneA, x, y, z, w, h: (w * 760) / 560, rot: 0, soft: true, opacity: 1 });
/** the bare patch with the four hooks, n of them numbered */
const hooks = (c: Ctx, n = 0) => fx(c, `hooksA${n}`, 700, 920, (p) => fxHooksA(p, n), GAL, WALL_Y, WALL_Z + 0.06, 1.0);

// ---------------- cameras ----------------
type CamT = Sh["cam"];
/** the square in front of the Louvre, from waist height */
const square = (cx = 0, rate = 0.0005, ly = 2.1, y = 0.9): CamT => [[cx, y, -6], [cx, ly, 20], 42, rate];
/** open country, from waist height */
const land = (dx = 0, z = -5.5, y = 0.6, rate = 0.0004): CamT => [[COUNTRY + dx, y, z], [COUNTRY + dx, y + 0.041 * (10 - z), 10], 40, rate];
/** the gallery from waist height: people stand full length near the wall (z = 3.4 .. 5.2) */
const gLow = (dx = 0, z = -2.6, y = 0.8, up = 0.03, rate = 0.0006): CamT => [[dx, y, z], [dx, y + up * (6 - z), 6], 34, rate];
/** the director's room, through a long lens */
const DIRCAM: CamT = [[-0.61, 1.8, -8], [-0.61, 1.75, 1.5], 28, 0.0001];
/** where the director stands: in front of his desk, clear of the lamp, on the screen-right of the bare wall between his two landscapes */
const DX = -2.12, DZ = 0.5;

// ---------------- hands (front view; metres; x of the body in, [x, y] of the hand out) ----------------
const HAND = {
  /** the screen-right arm stretched out by `point` */
  point: (x: number, p: number, sc = 1, stout = false): [number, number] => [x - ((stout ? 0.265 : 0.231) + 0.204 * p) * sc, (stout ? 1.146 : 1.161) * sc],
  /** the screen-right arm raised (wave -1..1) */
  wave: (x: number, w = 0, sc = 1, stout = false): [number, number] => [x - ((stout ? 0.343 : 0.309) + 0.061 * w) * sc, (stout ? 1.415 : 1.43) * sc],
  /** both arms up by `cheer`: side +1 the screen-left hand, -1 the screen-right one */
  cheer: (x: number, side: 1 | -1, ch = 1, sc = 1, stout = false): [number, number] => [x + side * (stout ? 0.353 : 0.319) * sc, ((stout ? 1.127 : 1.141) + 0.297 * ch) * sc],
  /** the palms-up shrug */
  shrug: (x: number, side: 1 | -1, sc = 1, stout = false): [number, number] => [x + side * (stout ? 0.4 : 0.362) * sc, (stout ? 1.069 : 1.084) * sc],
};
/** stride phase of somebody walking from x0 to x1 who is now at x (undefined = standing), as walk() draws it */
const phaseOf = (x: number, x0: number, x1: number) => (Math.abs(x - x0) < 1e-6 || Math.abs(x - x1) < 1e-6 ? undefined : (Math.abs(x - x0) / 1.6) % 1);
/** something that hangs from the near hand of a side-view walker; grip = how far down the drawing the handle is (0..1) */
const sideHold = (c: Ctx, key: string, cw: number, ch: number, draw: Draw, x: number, x0: number, x1: number, z: number, w: number, grip: number, scale = 1, stout = false) => {
  const [dx, hy] = sideHand(phaseOf(x, x0, x1), scale, stout), h = (w * ch) / cw;
  fx(c, key, cw, ch, draw, x + (x1 > x0 ? dx : -dx), hy - h * (0.5 - grip), z - 0.06, w);
};

export const SHOTS_1: Sh[] = [
  // ---------------- hook ----------------
  { name: "hook: a man walks out of the Louvre with her under his arm", a: 0, zone: "paris", cam: square(0, 0.0003, 1.73, 0.3), draw: (c) => {
    louvre(c);
    // he comes straight toward us from the middle door (1.2 m/s), the wrapped panel clamped under one arm
    const d = 3.8 * clamp01(c.f / 146), z = 1.6 - d;
    P(c, PER, 0, z, { mode: "stroll", phase: d / 1.6, expr: "smile", look: Math.sin(c.f / 14) > 0.3 ? 1 : -1 }, PS);
    fx(c, "bundle|armF|per", 520, 400, underArmOf(fxBundle, PER.o.jacket, 372, 14, 236, 356, 24), 0.27, 0.75, z - 0.06, 0.5, 0.1);
    ban(c, 44, "PARIS, AUGUST 1911", 2.4, 2.28, -0.5, 2.0);
    tag(c, at("h_1", "with") - 3, "UNDER THE CLOTH", "THE PAINTING", -2.05, 1.7, 0.2, 1.5);
  } },
  { name: "hook: the museum does not notice", a: at("h_2") - 4, zone: "louvre", x: 8, cam: [[0.25, 1.75, -0.4], [0.25, 2.163, 6], 34, 0.0005], draw: (c) => {
    hooks(c);
    P(c, GUARD1, 1.8, 5.0, { expr: "whistle", look: 1, facing: 1 }); P(c, GUARD2, -1.4, 5.0, { expr: "smile_closed", look: -1, facing: -1 });
    tag(c, at("h_2", "more") - 3, "NOT NOTICED FOR", "OVER 24 HOURS", 0.25, 3.36, 5.6, 1.7);
  } },
  { name: "hook: the police do not find her for two years", a: at("h_3") - 4, zone: "office", x: 8, cam: office(-2.4, -6.4, 1.9, 0.0003), draw: (c) => {
    police(c);
    const y2 = at("h_3", "more") - 4, y3 = at("h_3", "two") - 3, X = -0.2, Z = 1.6;
    if (c.f < y3 + 6) {   // he bends over the desk and goes through the papers with his lens
      const bob = 0.03 * Math.sin(c.f / 5);
      person(c.out, c.cam, DETECTIVE, X, 0, Z, { side: true, so: { mode: "push", pose: 1, hand: [555, 373], expr: "stern" } });
      fx(c, "lens", 340, 340, fxLens, X - 0.55 - 0.2 - bob, 1.3 - 0.2, Z - 0.06, 0.48, Math.PI);
    } else {              // nothing: he shrugs, the lens still in his hand
      P(c, DETECTIVE, X, Z, { expr: "pained", shrug: 1 });
      const [hx, hy] = HAND.shrug(X, -1); fx(c, "lens", 340, 340, fxLens, hx - 0.2, hy + 0.2, Z - 0.06, 0.48, -Math.PI / 2);
    }
    cal(c, c.a + 6, "YEAR", "1911", 1.03, 3.45, 1.2, 0.78, "#3a4150"); cal(c, y2, "YEAR", "1912", 0.19, 3.45, 1.2, 0.78, "#3a4150"); cal(c, y3, "YEAR", "1913", -0.65, 3.45, 1.2, 0.78);
  } },
  { name: "hook: the most famous painting in the world", a: at("h_4") - 4, zone: "louvre", x: 8, cam: gLow(0, -3.4, 0.8, 0.03, 0.0003), draw: (c) => {
    const fam = at("h_4", "famous") - 2;
    mona(c);
    // a loose crowd, backs to us, a gap in the middle so that she is seen, nobody straight behind anybody: [x, z, who, scale]
    ([[0.97, 4.9, 0, 1], [-0.9, 4.7, 5, 1], [1.49, 4.2, 3, 0.96], [-1.47, 4.3, 2, 1], [2.31, 5.0, 8, 1.02], [-2.29, 5.1, 7, 0.97], [2.48, 3.6, 13, 1], [-2.41, 3.5, 10, 1.03],
      [3.47, 4.6, 4, 0.98], [-3.51, 4.8, 9, 1]] as const).forEach(([x, z, k, s], i) =>
      P(c, FOLK[k], x, z, { back: true, headTilt: ((i * 37) % 5 - 2) * 0.02, cheer: i % 3 === 0 && c.f >= fam + i ? 0.8 + 0.2 * Math.sin(c.f / 3 + i) : undefined }, { scale: s }));
    sparkle(c, fam, 0, 2.5, 5.6, 0.9);
    ban(c, fam - 1, "TWO YEARS LATER|EVERYBODY KNOWS HER", 0, 3.1, 5.7, 3.2);
  } },
  { name: "intro: I'm Sir Digsworth", a: at("h_5") - 5, zone: "louvre", cam: [[0.4, 0.55, -1.5], [0.4, 0.775, 6], 34, 0.0006], draw: (c) => {
    mona(c);
    // large, right beside her: a wave hello, then he turns to her
    sir(c, 1.36, 3.4, c.n < 26 ? { wave: wav(c, c.n > 2) } : { wave: 1, look: -1, facing: -1 });
  } },
  { name: "the man who stole the Mona Lisa", a: at("h_5", "This") - 3, zone: "louvre", cam: [[0.4, 0.6, -5], [0.4, 1.26, 6], 34, 0.0005], draw: (c) => {
    const st = at("h_5", "stole") - 3, one = at("h_5", "one") - 2, X = -1.05, Z = 2.6;
    hooks(c);
    sir(c, 1.225, Z, { look: -1, point: c.f >= st ? ramp(c.f, st, st + 8) : undefined });
    P(c, PER_SMOCK, X, Z, { expr: c.f >= one ? "neutral" : "grin", wave: wav(c, c.f >= st && c.f < one, 1) }, PS);
    fx(c, "bundle|armF|perSmock", 520, 400, underArmOf(fxBundle, PER_SMOCK.o.jacket, 372, 14, 236, 356, 24), X + 0.27, 0.75, Z - 0.06, 0.5, 0.1);
    ban(c, st, "THE MAN WHO STOLE|THE MONA LISA", 0.4, 3.7, 5.6, 3.3);
    bubTo(c, one, "q", X, Z, { side: 1, thought: true, scale: 0.9, w: 0.8 });
  } },
  // ---------------- 1. a small painting ----------------
  { name: "Paris 1911: the Louvre, the Salon Carre", a: at("s1_1") - 5, zone: "louvre", cam: [[0, 2.2, -8.5], [0, 2.9, 6], 36, 0.0004], draw: (c) => {
    const rm = at("s1_1", "room") - 3;
    mona(c);
    P(c, GUARD1, -5.25, 5.2, { expr: "neutral", look: 1 });
    // two visitors look at her from either side (nobody stands in the middle, where the caption is)
    S(c, FOLK[1], 2.6, 4.4, { expr: "smile" }); S(c, FOLK[4], -2.6, 4.2, { mirror: true, expr: "smile" });
    walk(c, FOLK[0], 8.4, 5.5, 3.4, c.a - 30, { v: 0.9, then: { back: true } });
    walk(c, FOLK[5], -8.0, -5.3, 2.8, c.a - 20, { v: 0.8, then: { back: true } });
    ban(c, rm + 20, "THE NAME MEANS|THE SQUARE ROOM", 0, 3.75, 5.7, 3.4);
  } },
  { name: "a woman with a small smile", a: at("s1_1", "hangs") - 4, zone: "louvre", cam: [[0, 1.9, 2.3], [0, 1.83, 6], 30, 0.0005], draw: (c) => { mona(c); sparkle(c, at("s1_1", "smile") - 2, 0.1, 1.86, 5.6, 0.5); } },
  { name: "77 by 53 centimetres: under one arm", a: at("s1_2") - 4, zone: "louvre", cam: [[0.58, 1.6, 0.7], [0.58, 1.6, 6], 34, 0.0001], draw: (c) => {
    const h0 = at("s1_2", "Seventy-seven") - 3, w0 = at("s1_2", "fifty-three") - 3, arm = at("s1_2", "You") - 2, rem = at("s1_2", "Remember") - 3, X = 1.415, Z = 5.0;
    mona(c);
    pop(c, h0, "vmeas77", 640, 900, (p) => fxVMeasure(p, "77 cm"), -0.6 - 0.275, WALL_Y, WALL_Z - 0.1, 0.734);
    pop(c, w0, "hmeas53", 900, 330, (p) => fxHMeasure(p, "53 cm"), 0, WALL_Y + 0.657 + 0.165, WALL_Z - 0.1, 0.708);
    sir(c, X, Z, { look: -1, wave: c.f >= h0 && c.f < arm ? 1 : undefined, expr: c.f >= rem ? "grin" : "smile" });
    pop(c, arm, "panelA|armF|sir", 460, 640, underArmOf(fxPanelA, TWEED, 32, 16, 224, 596, 27), X - 0.36, 0.84, Z - 0.06, 0.44, -0.1);
  } },
  { name: "Leonardo begins her in Florence, around 1503, on poplar wood", a: at("s1_3") - 5, zone: "louvre", x: 8, cam: [[FLOR - 1.7, 0.8, -3.4], [FLOR - 1.7, 1.088, 3], 36, 0.0003], draw: (c) => {
    const bg = at("s1_3", "began") - 3, cv = at("s1_3", "canvas") - 3, po = at("s1_3", "panel") - 3, X = FLOR - 0.4, Z = 3.2, k = c.f >= bg ? "start" : "blank";
    fx(c, `easelA${k}`, 640, 1040, (p) => fxEaselA(p, k), X - 0.95, 0.9, Z + 0.1, 1.1);
    const pt = c.f >= bg && c.f < cv ? 0.86 + 0.14 * Math.sin(c.f / 4) : 0.8, [hx, hy] = HAND.point(X, pt), talk = c.f >= cv;
    P(c, LEONARDO, X, Z, { expr: talk ? "grin" : "smile", facing: talk ? 0 : -1, look: talk ? 0 : -1, point: pt });
    fx(c, "fineBrush", 320, 90, fxFineBrush, hx - 0.13, hy + 0.012, Z - 0.06, 0.32, 0.12);
    ban(c, bg, "ITALY|LEONARDO'S STUDIO", FLOR - 0.75, 2.82, Z - 0.05, 1.76, "#fff3c4", cv);
    thinkTo(c, cv, X, Z, fxBubCanvasNo, "bubCanvasNo", 800, 400, 1.0, { side: 1, top: 1.85, f1: po });
    thinkTo(c, po, X, Z, fxBubPoplar, "bubPoplar", 800, 400, 1.0, { side: 1, top: 1.85 });
  } },
  { name: "as an old man he takes her to France", a: at("s1_4") - 4, zone: "louvre", x: 8, cam: land(1.0, -5.5, 0.45), draw: (c) => {
    country(c, "france");
    // he walks up the path to the chateau, his back to us, the panel clamped under his arm
    const X = COUNTRY + 1.0, d = 2.5 * clamp01((c.f - c.a + 8) / 125), z = -1.5 + d;
    P(c, LEONARDO, X, z, { back: true, mode: "stroll", phase: d / 1.6 });
    fx(c, "panelA|armB|leonardo", 460, 640, underArmOf(fxPanelA, LEONARDO.o.jacket, 93, 16, 224, 596, 25), X - 0.3, 0.84, z - 0.06, 0.46, -0.1);
    ban(c, c.a + 6, "THE YEAR|1516", COUNTRY - 1.6, 2.45, 0.5, 1.9);
  } },
  { name: "the King of France acquires her: nearly 400 years", a: at("s1_4", "After") - 4, zone: "louvre", x: 8, cam: [[COUNTRY + 9.2, 0.6, -2.5], [COUNTRY + 9.2, 1.225, 10], 40, 0.0003], draw: (c) => {
    const kg = at("s1_4", "King") - 3, aq = at("s1_4", "acquired") - 2, fo = at("s1_4", "four") - 3, KX = COUNTRY + 11.3, Z = 3.4;
    country(c, "france");
    fx(c, "easelAmona", 640, 1040, (p) => fxEaselA(p, "mona"), COUNTRY + 10.31, 0.975, Z + 0.1, 1.2);
    const x = walk(c, KING, COUNTRY + 13.7, KX, Z, c.a - 40, { v: 1.35, then: { expr: "grin", look: -1, facing: -1, point: c.f >= aq ? ramp(c.f, aq, aq + 8) : undefined } });
    nameOver(c, kg, "FRANCIS I|1519", x, Z, { w: 1.9, top: 1.8, f1: fo });
    nameOver(c, fo, "IN FRANCE FOR|4 CENTURIES", x, Z, { w: 1.9, top: 1.8 });
  } },
  { name: "admirers send her love letters", a: at("s1_5") - 4, zone: "louvre", x: 8, cam: gLow(), draw: (c) => {
    const ad = at("s1_5", "adore") - 2, lv = at("s1_5", "love", 1) - 3;
    mona(c);
    // admirers, backs to us; from "love letters" each holds a letter up in the outer hand
    ([[1, 1.6, 5.0, 1], [0, -1.65, 4.9, -1], [5, 2.8, 4.4, 1], [8, -2.85, 4.5, -1]] as const).forEach(([k, x, z, side], i) => {
      const up = c.f >= lv + i * 4;
      P(c, FOLK[k], x, z, { back: true, headTilt: (i % 2 ? -1 : 1) * 0.03, cheer: up ? 1 : undefined });
      if (up) { const [hx, hy] = HAND.cheer(x, side); fx(c, "love", 320, 240, fxLove, hx + side * 0.06, hy + 0.15 + 0.02 * Math.sin(c.f / 5 + i), z - 0.06, 0.4, -side * 0.15); }
    });
    sparkle(c, ad, 0, 2.3, 5.5, 0.7);
  } },
  { name: "one treasure among thousands", a: at("s1_6") - 4, zone: "louvre", cam: [[0, 2.2, -8.5], [0, 2.9, 6], 36, 0.0003], draw: (c) => {
    mona(c);
    // everybody is looking at the other pictures: nobody stands in front of her
    ([[2, -2.95, 4.5], [7, -3.8, 4.95], [12, -4.6, 4.3], [13, -5.55, 5.0], [9, -6.5, 4.6], [3, 5.75, 4.4], [4, 6.85, 5.0]] as const).forEach(([k, x, z], i) => P(c, FOLK[k], x, z, { back: true, headTilt: ((i * 37) % 5 - 2) * 0.02 }));
    ban(c, c.a + 20, "THE LOUVRE HOLDS|MANY MASTERPIECES", 0, 3.75, 5.7, 3.4);
  } },
  { name: "the director: you might as well steal the towers of Notre-Dame", a: at("s1_7") - 4, zone: "office", x: 8, cam: DIRCAM, draw: (c) => {
    directorRoom(c);
    const nw = at("s1_7", "not") - 2, st = at("s1_7", "Steal") - 2, tw = at("s1_7", "towers") - 4;
    S(c, GUARD1, 1.5, 0.7, { expr: "neutral" });
    P(c, DIRECTOR, DX, DZ, { expr: c.f >= st ? "laugh" : "smile", shrug: c.f >= nw && c.f < st - 6 ? 1 : undefined });
    thinkTo(c, st, DX, DZ, fxBubMonaQ, "bubMonaQ", 800, 400, 0.95, { side: 1, w: 1.9, top: 1.72, f1: tw });
    thinkTo(c, tw, DX, DZ, fxNotreDame, "notreDame", 560, 660, 0.46, { side: 1, w: 1.9, top: 1.72 });
  } },
  { name: "then he goes on holiday", a: at("s1_8") - 4, zone: "office", cam: DIRCAM, draw: (c) => {
    directorRoom(c);
    S(c, GUARD1, 1.5, 0.7, { expr: "neutral" });
    const go = c.a + 10, x1 = -5.4;
    if (c.f < go) { P(c, DIRECTOR, DX, DZ, { expr: "grin", wave: wav(c, true) }); hold(c, "case", 460, 340, fxCase, DX, DZ, 1, 0.56, { dx: 0.033 }); }
    else { const x = walk(c, DIRECTOR, DX, x1, DZ, go, { v: 1.5, gone: true }); if (Math.abs(x - x1) > 1e-6) sideHold(c, "case", 460, 340, fxCase, x, DX, x1, DZ, 0.56, 0.1, 1, true); }
    pop(c, c.a + 40, "deskSign", 900, 340, (p) => fxDeskSign(p, "THE DIRECTOR", "BACK SOON"), -2.85, 1.17, 1.25, 1.0);
  } },
  // ---------------- 2. the man who fitted the glass ----------------
  { name: "the Louvre puts its best paintings behind glass", a: at("s2_1") - 5, zone: "louvre", x: 8, cam: gLow(), draw: (c) => {
    // a pane stands ready under the picture; Peruggia comes in from the doorway, and he and his mate lift it onto her
    const hl = at("s2_1", "glass") - 24, lv = at("s2_1", "brought"), u = ramp(c.f, hl, hl + 24), on = u > 0.985, PX = 0.43 + 0.287, WX = -(0.43 + 0.353), Z = 5.0, x0 = 4.7;
    const ch = c.f >= hl - 2 && c.f < hl + 34 ? Math.max(0.35, u) : undefined;
    mona(c, on);
    if (!on) pane(c, 0, 0.64 + (WALL_Y - 0.64) * u, 5.6, 0.9);
    P(c, WORK3, WX, Z, { back: true, cheer: ch });
    if (c.f < hl - 2) walk(c, PER_SMOCK, x0, PX, Z, hl - 2 - Math.ceil(((x0 - PX) / 1.5) * 30), { ...PS, v: 1.5, then: { back: true } });
    else if (c.f < lv) P(c, PER_SMOCK, PX, Z, { back: true, cheer: ch }, PS);
    else walk(c, PER_SMOCK, PX, 3.6, Z, lv, { ...PS, v: 1.2 });
    sparkle(c, hl + 24, 0, 2.2, 5.4, 0.7);
    ban(c, at("s2_1", "protect") - 3, "A NEW PRECAUTION", 0, 3.02, 5.9, 2.2);
  } },
  { name: "one of them is Vincenzo Peruggia", a: at("s2_2") - 4, zone: "louvre", cam: [[2.15, 1.3, -0.4], [2.15, 1.45, 3.4], 34, 0.0003], draw: (c) => {
    const X = 3.18, Z = 3.4;
    mona(c, true);
    P(c, PER_SMOCK, X, Z, { expr: "smile", look: -1 }, PS);
    ban(c, at("s2_2", "Vincenzo") - 3, "REMEMBER THIS FACE", 1.55, 2.6, 5.9, 1.5);
  } },
  { name: "born 1881 in Dumenza; a house painter; five foot three", a: at("s2_3") - 4, zone: "louvre", x: 8, cam: land(), draw: (c) => {
    const hp = at("s2_3", "house") - 3, ft = at("s2_3", "five") - 3, X = COUNTRY + 0.2, Z = 0, w = c.f >= hp ? wav(c, c.f < hp + 30) ?? 0 : undefined;
    fx(c, "alps", 1800, 620, fxAlps, COUNTRY, 24, 200, 150);
    country(c, "village");
    P(c, PER, X, Z, { expr: c.f >= hp ? "grin" : "smile", wave: w }, PS);
    hold(c, "bucket", 340, 420, fxBucket, X, Z, 1, 0.36, { scale: 0.9 });
    if (w !== undefined) { const [hx, hy] = HAND.wave(X, w, 0.9); fx(c, "wallBrush", 200, 440, fxWallBrush, hx - 0.058, hy + 0.16, Z - 0.06, 0.2, -0.35); }
    ban(c, at("s2_3", "1881") - 3, "DUMENZA, ITALY|BORN 1881", COUNTRY - 1.1, 2.5, 0.5, 2.0, "#fff3c4", ft); ban(c, ft, "HIS HEIGHT|5 FT 3", COUNTRY - 1.1, 2.5, 0.5, 2.0);
    pop(c, ft, "varrow", 160, 900, fxVArrow, X - 0.68, 0.77, Z + 0.05, 0.274);
  } },
  { name: "he has come to Paris for work", a: at("s2_3", "come") - 8, zone: "paris", x: 8, cam: square(-3.0, 0.0005, 2.16, 0.6), draw: (c) => {
    fx(c, "eiffel", 700, 1400, fxEiffel, 0, 10, 45, 10);
    const x0 = 0.95, x1 = -1.71, Z = -0.5, x = walk(c, PER, x0, x1, Z, c.a - 8, { ...PS, v: 1.5 });
    sideHold(c, "case", 460, 340, fxCase, x, x0, x1, Z, 0.5, 0.1, 0.9);
  } },
  { name: "the police have his photograph and his fingerprints", a: at("s2_4") - 4, zone: "office", x: 8, cam: [[3.7, 1.9, -4.2], [3.7, 1.3, 1.5], 34, 0.0002], draw: (c) => {
    police(c);
    const ph = at("s2_4", "photograph") - 3, fp = at("s2_4", "fingerprints") - 3, rem = at("s2_4", "Remember") - 3, flash = c.f >= ph && c.f < ph + 4, X = 2.31, Z = 2.2;
    // the policeman works the camera: both hands on it
    person(c.out, c.cam, COPS[2], 5.95, 0, Z + 0.05, { side: true, so: { mode: "push", pose: 1, hand: [520, 470], expr: "stern" } });
    fx(c, `cam${flash}`, 560, 820, (p) => fxCamera(p, flash), 5.05, 0.72, Z, 1.0);
    P(c, PER, X, Z, { expr: c.f >= ph && c.f < ph + 10 ? "shock" : "nervous", look: 1 }, PS); sweat(c, X + 0.3, 1.5, Z - 0.1);
    // his record card: the photograph first, the ten fingerprints when the narrator names them
    pop(c, ph + 5, `tag|record|${c.f >= fp}`, 600, 720, (p) => fxFileA(p, c.f >= fp), 1.36, 1.2, 1.8, 1.15);
    sparkle(c, fp, 1.255, 0.75, 1.7, 0.7); sparkle(c, rem, 1.255, 0.8, 1.7, 0.9); sparkle(c, rem + 12, 1.0, 0.72, 1.7, 0.6);
  } },
  { name: "Peruggia helps to make the glass case for the Mona Lisa", a: at("s2_5") - 4, zone: "louvre", x: 8, cam: gLow(), draw: (c) => {
    // the case is on: his mate steadies the frame, Peruggia polishes the glass; at her name he turns round
    const mo = at("s2_5", "Mona") - 3, X = 0.78, Z = 5.0, front = c.f >= mo - 6;
    mona(c, true);
    P(c, WORK3, -1.25, Z, { back: true, headTilt: 0.03 });
    if (front) P(c, PER_SMOCK, X, Z, { expr: "grin", look: -1 }, PS);
    else { const w = Math.sin(c.f / 3.2), [hx, hy] = HAND.wave(X, w, 0.9); P(c, PER_SMOCK, X, Z, { back: true, wave: w }, PS); fx(c, "rag", 200, 160, fxRag, hx - 0.03, hy + 0.03, Z - 0.06, 0.2); }
    if (!front && c.f % 30 < 9) sparkle(c, c.f - (c.f % 30), 0.1, 1.9, 5.4, 0.5);
    ban(c, mo, "HE HELPED MAKE|HER GLASS CASE", 0, 3.08, 5.9, 2.0);
  } },
  { name: "he knows how she hangs: four iron hooks", a: at("s2_6") - 4, zone: "louvre", cam: gLow(0, -1.0, 0.6, 0.03, 0.0003), draw: (c) => {
    // he takes her down (hands on the frame) and stands her on the floor against the wall: the four hooks are bare
    const hg = at("s2_6", "hangs") - 3, fo = at("s2_6", "four") - 2, no = at("s2_6", "nothing") - 2, u = ramp(c.f, hg, hg + 16), X = 0.5 + 0.287, Z = 5.2;
    hooks(c, c.f >= fo ? Math.min(4, 1 + Math.floor((c.f - fo) / 5)) : 0);
    fx(c, "monaAglass", 700, 920, (p) => fxMonaA(p, true), GAL, WALL_Y - (WALL_Y - 0.66) * u, WALL_Z - 0.04 - 0.4 * u, 1.0);
    if (c.f < hg - 8) P(c, PER_SMOCK, X, Z, { back: true }, PS);
    else if (c.f < hg + 15) P(c, PER_SMOCK, X, Z, { back: true, cheer: 1 - 0.5 * u }, PS);
    else P(c, PER_SMOCK, X, Z, { expr: "smile", look: -1, wave: 0 }, PS);
    tag(c, no, "NOT BOLTED ON", "JUST 4 HOOKS", -1.45, 2.2, 5.6, 1.1);
  } },
  { name: "he knows the back stairs", a: at("s2_6", "back") - 8, zone: "louvre", cam: [[STAIR + 3.0, 1.7, -5.0], [STAIR + 3.0, 1.9, 3], 36, 0.0004], draw: (c) => {
    // he climbs the service stairs, his back to us: one step every nine frames
    const k = Math.max(0, 0.5 + (c.f - c.a) / 9), ki = Math.floor(k), kf = smooth(k - ki);
    fx(c, "staffOnly", 900, 300, (p) => fxSign(p, "THE LOUVRE", "STAFF ONLY", "#2a4f6a"), STAIR - 0.3, 2.7, 4.98, 2.2);
    P(c, PER_SMOCK, STAIR + 4.6, 0.9 + 0.46 * (ki + kf), { back: true, mode: "march", phase: k / 2 }, { ...PS, y: 0.2 * (ki + 1 + kf) });
  } },
  { name: "every Monday the museum is closed to the public", a: at("s2_7") - 4, zone: "paris", x: 8, cam: square(), draw: (c) => {
    const mo = at("s2_7", "Monday") - 3, cl = at("s2_7", "closed") - 3;
    louvre(c);
    fx(c, "closedBoard", 900, 900, (p) => fxBoard(p, "THE LOUVRE", "CLOSED ON MONDAYS"), 0, 1.5, 3.2, 3.0);
    walk(c, FOLK[2], 5.9, 2.25, 2.0, c.a - 10, { v: 1.2, then: { expr: "neutral", look: -1, shrug: c.f >= cl ? 1 : undefined } });
    walk(c, FOLK[3], 7.0, 3.45, 2.5, c.a - 10, { v: 1.2, then: { expr: "pained", look: -1 } });
    P(c, PER, -3.1, 1.6, { expr: c.f >= mo ? "grin" : "smile", look: 1 }, PS);
  } },
];
export { clamp01 };
