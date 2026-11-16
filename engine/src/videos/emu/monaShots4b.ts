// "The Man Who Stole the Mona Lisa", shots 111-132: the end of chapter 9 (why?) and chapter 10 (the star).
// +x is screen-left. The Louvre is the red gallery (GAL); only the exhibition in Florence is in the green one (UFF).
// In both galleries the plain wall runs from x = -2.2 (the big painting) to x = +2.3 (the doorway).
import { fxRoadSign } from "./wltoon";
import { fxCash } from "./lustigtoon";
import { fxSparkle } from "./longtoon";
import { hh } from "./castbase";
import { fxCalendar, fxFlag3 } from "./dailytoon";
import { fxTomb, fxFlorence, fxMark, fxMona, fxSuitcase, fxEasel, fxPanel, fxFrontPage, fxFrameEmpty } from "./monatoon";
import { PER, PER_SMOCK, PER_SUIT, GUARD1, GUARD2, WORK1, WORK3, LEONARDO, JUDGE, CARAB1, MARQUIS, FOLK } from "./monacast";
import { ramp } from "./story";
import { Sh, Ctx, at, GAL, STAIR, UFF, WALL_Z, near, office, P, sir, walk, fx, pop, ban, tag, stamp, wall, q, sayTo, thinkTo, nameOver, hold, underArm } from "./monaKit";
import { COUNTRY, country, court, newsroom } from "./monaSets";
import { louvre } from "./monaShots1";
import { FORGER, NEWSMAN, PER_RIFLE, SOLDIERS, MODERN, CELL, fxPost32, fxGhost, fxBrass, fxFlagPole, fxRope, fxKiosk, fxPhoneCam, fxYardWall, fxChapel, fxCrossGrave, fxOldStone, fxMound, fxObitPage, fxCellFront, fxDuomoFront, fxLane, fxCellInside, FR_COLS } from "./monaPropsF";

type CamT = [[number, number, number], [number, number, number], number, number?];
const PS = { scale: 0.9 };
const cal = (c: Ctx, f0: number, head: string, big: string, x: number, y: number, z: number, w: number, col = "#d8382f", f1 = 1e9) => pop(c, f0, `cal|${head}|${big}`, 420, 480, (p) => fxCalendar(p, head, big, col), x, y, z, w, 0, f1);
/** Florence across the square (zone "paris") */
const florence = (c: Ctx) => { fx(c, "florence", 1600, 700, fxFlorence, 0, 10, 31, 46); fx(c, "duomoFront", 390, 330, fxDuomoFront, -0.431, 4.97, 30.9, 11.2); };
/** Sir Digsworth beside her in the Salon Carre, full length: he stands at x = SX, close to the wall */
const PRES: CamT = [[0, 1.25, -0.2], [0, 1.25, 6], 34, 0.0004];
const SX = 1.25, SZ = 5.2;
/** a gallery seen from a little above, so that everybody's feet stay above the caption */
const gHigh = (cx: number, dx = 0, rate = 0.0004): CamT => [[cx + dx, 2.6, -5], [cx + dx, 1.2, 6], 34, rate];
/** where a raised hand is (front view, `cheer` 0..1): side +1 = the hand on the screen-left */
const handUp = (x: number, cheer: number, side: 1 | -1, scale = 1): [number, number] => [x + side * 0.319 * scale, (1.142 + 0.2975 * cheer) * scale];
/** a small Italian flag on its staff, held in the raised screen-right hand */
const flagHeld = (c: Ctx, x: number, z: number, cheer: number, w = 0.62, scale = 1) => {
  const [hx, hy] = handUp(x, cheer, -1, scale);
  fx(c, "flagIt", 360, 300, (p) => fxFlag3(p, "it"), hx - (152 * w) / 360, hy + (142 * w) / 360 - 0.05, z - 0.05, w);
};
/** one star that twinkles in place for half a second */
const star = (c: Ctx, f0: number, x: number, y: number, z: number, s = 0.4) => { const n = c.f - f0; if (n >= 0 && n < 16) fx(c, "sparkle", 200, 200, fxSparkle, x, y, z, s * Math.sin((Math.PI * (n + 1)) / 17), n * 0.12); };
/** somebody nobody found: the cut-out that takes a person's place (same footprint as a person) */
const ghost = (c: Ctx, f0: number, hat: "tophat" | "beret", x: number, z: number) => pop(c, f0, "ghost" + hat, 600, 1000, (p) => fxGhost(p, hat), x, 1.026, z, 1.296);
/** France (shots 124 to 126) lies 60 m from the road of the army camp: grass, the stone house, a garden path to its door */
const FR = COUNTRY + 60;
const france = (c: Ctx) => {
  country(c, "savoy", FR);
  c.out.fx.push({ key: "lane", cw: 200, ch: 1000, draw: fxLane, x: FR + 4.5, y: 0.035, z: 4.4, w: 1.5, h: 21, flat: true });
};
/** the churchyard beside the house (shots 125, 126): the camera aims at YX, his grave is at GX */
const YX = FR - 1.5, GX = FR - 3.6;
const yard = (c: Ctx) => {
  france(c);
  [-4.7, -10.7, -16.7].forEach((dx, k) => fx(c, k ? "yardWall" : "yardWallP", 1600, 300, (p) => fxYardWall(p, !k), FR + dx, 0.53, 13, 6));
  fx(c, "chapel", 700, 900, fxChapel, FR - 2.0, 1.89, 11.5, 3.0);
  fx(c, "crossG", 300, 460, fxCrossGrave, FR - 5.9, 0.56, 4.8, 0.75); fx(c, "crossG", 300, 460, fxCrossGrave, FR - 8.2, 0.56, 9, 0.75);
  fx(c, "oldStone", 300, 380, fxOldStone, FR - 6.9, 0.435, 3.2, 0.7); fx(c, "oldStone", 300, 380, fxOldStone, FR - 4.9, 0.435, 7.6, 0.7); fx(c, "oldStone", 300, 380, fxOldStone, FR - 7.9, 0.435, 6.4, 0.7);
  fx(c, "tombPer", 420, 480, (p) => fxTomb(p, "VINCENZO|PERUGGIA|1881 - 1925"), GX, 0.89, 2.0, 1.6);
  fx(c, "mound", 800, 240, fxMound, GX, 0.33, 1.55, 2.3);
};
const OX = 4.4;
/** the cell of shot 128: the wall with the barred window stands at CZ, Peruggia behind the middle of the window */
const CX0 = STAIR - 2.6, CZ = 2.4, CAMZ = -1.9, PZ = CZ + 0.5;
const CWX = CX0 + (950 - (CELL.x0 + CELL.w / 2)) * 0.004, CPX = CX0 + ((CWX - CX0) * (PZ - CAMZ)) / (CZ - CAMZ);

export const SHOTS_4B: Sh[] = [
  { name: "it comes from one magazine article, printed in 1932", a: at("s9_6") - 4, zone: "louvre", cam: PRES, draw: (c) => {
    const it = at("s9_6", "It", 1) - 3, X = 1.75;
    // he holds the magazine up from the start, and shakes it when he names it
    const wv = c.f >= it && c.f < it + 44 ? q(0.6 * Math.sin((c.f - it) / 3.5), 4) : 0;
    wall(c, "mona");
    sir(c, X, SZ, { expr: "smile", wave: wv });
    fx(c, "post32", 560, 720, fxPost32, X - 0.53 - 0.061 * wv, 1.68, SZ + 0.04, 0.62, -0.04 - 0.05 * wv);
    tag(c, at("s9_6", "one") - 3, "THE ONLY SOURCE", "NO OTHER PROOF", -1.33, 2.0, 5.4, 1.3);
  } },
  { name: "nobody has ever found the marquis, the forger, or a single one of the six", a: at("s9_6", "And") - 3, zone: "louvre", cam: [[-0.5, 1.6, -2.2], [-0.5, 1.72, 6], 34, 0.0004], draw: (c) => {
    const mq = at("s9_6", "marquis") - 3, fg = at("s9_6", "forger") - 3, sx = at("s9_6", "single") - 3;
    // the six copies hang where she hung; when nobody finds them only the frames are left
    for (let k = 0; k < 6; k++) { const x = 0.1 + (1 - (k % 3)) * 0.57, y = k < 3 ? 2.52 : 1.74;
      if (c.f < sx + k * 2) fx(c, "monaFake", 700, 920, (p) => fxMona(p), x, y, WALL_Z - 0.04, 0.48); else pop(c, sx + k * 2, "frameEmpty", 700, 920, fxFrameEmpty, x, y, WALL_Z - 0.04, 0.48); }
    if (c.f < mq) P(c, MARQUIS, 1.45, 5.0, { expr: "grin" }); else ghost(c, mq, "tophat", 1.45, 5.0);
    nameOver(c, c.a + 5, "THE SELLER", 1.45, 5.0, { w: 1.1, top: 2.15 });
    fx(c, "easelmona", 640, 1040, (p) => fxEasel(p, "mona"), -2.5, 0.757, 4.9, 0.95);
    if (c.f < fg) P(c, FORGER, -1.4, 5.0, { expr: "smile", look: -1 }); else ghost(c, fg, "beret", -1.4, 5.0);
    nameOver(c, c.a + 9, "THE COPYIST", -1.4, 5.0, { w: 1.1 });
    stamp(c, sx + 12, "NEVER FOUND", 0.1, 3.38, 5.4, 1.9, 0.04);
  } },
  { name: "the truth seems simpler: one man, one smock, a painting small enough to carry", a: at("s9_7") - 4, zone: "louvre", x: 8, cam: [[0.25, 1.35, -1.0], [0.25, 1.4, 6], 34, 0.0004], draw: (c) => {
    const m = at("s9_7", "One") - 3, sm = at("s9_7", "one", 1) - 3, pa = at("s9_7", "painting") - 3, X = 1.4, Z = 4.6, got = c.f >= pa;
    wall(c, got ? "hooks" : "mona");
    P(c, c.f >= sm ? PER_SMOCK : PER, X, Z, { expr: got ? "grin" : "smile", look: got ? 0 : -1 }, PS);
    if (got) underArm(c, "panel", 460, 640, (p) => fxPanel(p), X, Z, 1, 0.42, { scale: 0.9, dy: -0.06 });
    tag(c, m, "THE WHOLE GANG", "1", -1.3, 2.7, 5.4, 1.15); tag(c, sm, "THE DISGUISE", "1", -1.3, 2.0, 5.4, 1.15); tag(c, pa, "THE LOOT", "1", -1.3, 1.3, 5.4, 1.15);
  } },
  { name: "Italy does not much mind: to many Italians he is a hero", a: at("s9_8") - 4, zone: "paris", x: 8, cam: near(), draw: (c) => {
    const he = at("s9_8", "hero") - 3;
    florence(c);
    // two groups, the middle of the square left open; every flag is in a raised hand
    ([[8, 4.0, 1.3, 0], [11, 3.1, 2.4, 0], [14, 1.9, 1.3, 1], [9, -1.8, 1.2, 1], [12, -3.55, 2.3, 0], [15, -4.3, 1.2, 0], [10, 0.6, 9, 0], [13, -0.7, 8.4, 1]] as const).forEach(([i, x, z, flag], k) => {
      const ch = 0.6 + 0.3 * Math.sin(c.f / 4 + k * 1.7);
      P(c, FOLK[i], x, z, { expr: k % 3 ? "laugh" : "grin", cheer: ch });
      if (flag) flagHeld(c, x, z, ch);
    });
    sayTo(c, he, "VIVA|PERUGGIA!", 1.9, 1.3, { w: 2.0, top: 1.8 });
    sayTo(c, he + 8, "BRAVO!", -1.8, 1.2, { w: 1.5, top: 1.8, side: 1 });
  } },
  { name: "his trial in Florence, 1914: one year and fifteen days, cut to seven months; he walks free", a: at("s9_9") - 4, zone: "office", x: 8, cam: office(1.9, -6.6, 1.7), draw: (c) => {
    court(c, "it");
    const on = at("s9_9", "one") - 3, sv = at("s9_9", "seven") - 3, al = at("s9_9", "already") - 3, so = at("s9_9", "So") - 3, BX = 3.85;
    P(c, JUDGE, 0, 1.3, { expr: "stern", look: 1, facing: 1 }, { y: 0.55 });
    if (c.f < so) P(c, PER_SUIT, 3.4, 0.5, { expr: c.f >= al ? "smile" : c.f >= sv ? "relief" : "nervous", look: -1, facing: -1 }, PS); else walk(c, PER_SUIT, 3.4, 9.4, 0.5, so, { ...PS, v: 1.8, gone: true });
    P(c, CARAB1, 4.7, 1.1, { expr: "stern", look: -1 });
    ban(c, on, "THE SENTENCE|1 YEAR + 15 DAYS", BX, 3.1, 0.5, 2.8, "#fff3c4", sv); ban(c, sv, "THEN ONLY|7 MONTHS", BX, 3.1, 0.5, 2.8, "#fff3c4", al);
    ban(c, al, "TIME ALREADY SERVED|7 MONTHS", BX, 3.1, 0.5, 2.8, "#dff0d0", so);
    stamp(c, so, "RELEASED", BX, 3.1, 0.5, 2.0);
  } },
  // ---------------- 10. the star ----------------
  { name: "first she is shown in Italy: two weeks in the Uffizi, and people queue to see her", a: at("s10_1") - 5, zone: "louvre", x: 10, cam: [[UFF + 1.4, 2.5, -5.2], [UFF + 1.4, 1.0, 6], 34, 0.0004], draw: (c) => {
    wall(c, "mona", UFF);
    fx(c, "uffPlate", 900, 220, (p) => fxBrass(p, "FIRENZE|GALLERIA DEGLI UFFIZI"), UFF, 3.2, WALL_Z - 0.03, 1.8);
    fx(c, "flagPoleBF", 420, 1000, (p) => fxFlagPole(p, true, true), UFF - 2.1 + 0.3, 1.05, 5.5, 0.9);
    fx(c, "rope", 1000, 440, fxRope, UFF, 0.37, 5.0, 1.7);
    // one visitor at the rope (beside its post), a queue behind him from the first frame, two more people joining it
    P(c, FOLK[2], UFF + 1.2, 4.6, { back: true });
    ([[5, 1.95, 4.3, "smile"], [8, 2.7, 4.45, "neutral"], [3, 3.45, 4.2, "smile_closed"], [12, 4.2, 4.4, "smile"]] as const).forEach(([i, x, z, expr]) => P(c, FOLK[i], UFF + x, z, { expr, facing: -1, look: -1 }));
    ([[7, 4.95, 4.25, "neutral"], [14, 5.65, 4.5, "smile"]] as const).forEach(([i, x, z, expr], k) =>
      walk(c, FOLK[i], UFF + 8.6, UFF + x, z, c.a + 4 + k * 22, { v: 1.7, hide: true, then: { expr, facing: -1, look: -1 } }));
    tag(c, at("s10_1", "two") - 3, "ON SHOW FOR", "2 WEEKS", UFF - 1.35, 2.55, 5.4, 1.0);
  } },
  { name: "on 4 January 1914 she returns to the Louvre", a: at("s10_2") - 4, zone: "louvre", x: 8, cam: gHigh(GAL, 0.1, 0.0005), draw: (c) => {
    const re = at("s10_2", "returns") - 14, u = ramp(c.f, re, re + 28), up = u >= 1, ch = 0.45 + 0.55 * u;
    if (up) { wall(c, "mona"); P(c, WORK1, -1.35, 5.2, { expr: "grin", look: 1 }); P(c, WORK3, 1.35, 5.2, { expr: "grin", look: -1 }); }
    else {
      // one workman lifts her onto the hooks with both hands on the frame; the other shows him where
      wall(c, "hooks");
      fx(c, "monamona", 700, 920, (p) => fxMona(p), 0, handUp(0, ch, 1)[1] + 0.51, WALL_Z - 0.05 - 0.3 * (1 - u), 1.0);
      P(c, WORK1, 0, 5.2, { back: true, cheer: ch }); P(c, WORK3, 1.35, 5.2, { expr: "smile", look: -1, facing: -1, point: 1 });
    }
    P(c, GUARD1, 3.3, 4.4, { expr: "smile", look: -1, cheer: up ? 0.7 : undefined }); P(c, GUARD2, -3.1, 4.4, { expr: "smile", look: 1, cheer: up ? 0.7 : undefined });
    cal(c, c.a + 8, "JANUARY", "4", 1.55, 2.75, 5.4, 0.9);
    star(c, re + 28, 0.78, 2.45, 5.5, 0.45); star(c, re + 33, -0.78, 2.2, 5.5, 0.4); star(c, re + 38, 0.8, 2.05, 5.5, 0.36);
    ban(c, re + 28, "AFTER MORE THAN 2 YEARS|HOME AGAIN", 0, 3.62, 5.4, 2.6);
  } },
  { name: "but she is not the same painting that left", a: at("s10_3") - 4, zone: "louvre", cam: [[0, 1.75, 1.6], [0, 1.7, 6], 30, 0.0016], draw: (c) => {
    wall(c, "mona");
    [6, 24, 42, 58].forEach((d, k) => { star(c, c.a + d, 0.8, [2.35, 1.6, 2.1, 1.75][k], 5.5, 0.34); star(c, c.a + d + 4, -0.8, [1.75, 2.4, 1.55, 2.2][k], 5.5, 0.3); star(c, c.a + d + 8, k % 2 ? 0.95 : -0.95, [2.05, 2.0, 2.45, 1.5][k], 5.5, 0.22); });
  } },
  { name: "for more than two years her face has been in newspapers all over the world", a: at("s10_4") - 4, zone: "paris", x: 8, cam: [[0, 1.9, -6.5], [0, 2.3, 20], 42, 0.0004], draw: (c) => {
    // a newspaper stand: six front pages from six cities are pinned up one after another
    fx(c, "kiosk", 1400, 1300, fxKiosk, 0, 2.012, 1.6, 4.4);
    ([["PARIS", 1.1, 2.5], ["LONDON", 0, 2.5], ["NEW YORK", -1.1, 2.5], ["ROME", 1.1, 1.5], ["BERLIN", 0, 1.5], ["MADRID", -1.1, 1.5]] as const).forEach(([m, x, y], k) =>
      pop(c, c.a + 6 + k * 8, `fpS${m}`, 600, 760, (p) => fxFrontPage(p, m, "MONA LISA"), x, y, 1.5, 0.72));
    P(c, FOLK[4], 2.45, 0.6, { back: true }); P(c, FOLK[11], -2.2, 0.4, { back: true, headTilt: 0.04 });
  } },
  { name: "people who have never set foot in a museum know exactly what she looks like", a: at("s10_4", "People") - 3, zone: "paris", cam: [[0, 0.6, -4.5], [0, 4.4, 20], 54, 0.0004], draw: (c) => {
    const kn = at("s10_4", "know") - 3;
    louvre(c);
    // each of them holds the paper out in a raised hand; the tail of the bubble ends at the same head
    ([[5, 3.7, 1.5, 1.8, "smile", 1], [0, 1.9, 1.0, 2.15, "grin", 0.6], [10, -1.9, 1.6, 2.15, "smile_closed", 0.9], [15, -3.6, 1.1, 1.8, "smile", 0.6]] as const).forEach(([i, x, z, top, expr, pt], k) => {
      P(c, FOLK[i], x, z, { expr, look: k < 2 ? -0.5 : 0.5, point: pt });
      fx(c, "fpSmall", 600, 760, (p) => fxFrontPage(p, "NEWS", "MONA LISA"), x - (0.231 + 0.204 * pt) - 0.17, 1.19, z + 0.04, 0.42, -0.05 * (k % 2 ? 1 : -1));
      thinkTo(c, kn + k * 4, x, z, (p) => fxMona(p), "monaT", 700, 920, 0.4, { side: k < 2 ? -1 : 1, w: 1.6, top });
    });
  } },
  { name: "she left as a masterpiece and comes back as a celebrity; today millions a year come to see her", a: at("s10_5") - 4, zone: "louvre", x: 8, cam: [[0, 2.6, -6.5], [0, 1.5, 6], 36, 0.0003], draw: (c) => {
    const ma = at("s10_5", "masterpiece") - 3, ce = at("s10_5", "celebrity") - 3, to = at("s10_5", "Today") - 3;
    wall(c, "mona");
    ban(c, ma, "1911|A MASTERPIECE", 0, 3.6, 5.4, 2.6, "#f6efd8", ce); ban(c, ce, "1914|A CELEBRITY", 0, 3.6, 5.4, 2.6, "#fff3c4", to);
    ban(c, to, "A CENTURY LATER|MILLIONS OF VISITORS", 0, 3.6, 5.4, 2.6);
    if (c.f < to) {
      // 1914: the visitors walk in from both sides; the way to her stays open in the middle
      ([[0, 1.2, 4.5], [3, 2.0, 3.3], [6, 3.3, 4.4], [13, 4.4, 2.6], [2, 3.35, 1.7], [1, -1.3, 4.3], [4, -2.5, 3.6], [7, -2.9, 1.8], [10, -4.1, 3.1], [15, -5.0, 4.2]] as const).forEach(([i, x, z], k) =>
        walk(c, FOLK[i], (x > 0 ? 1 : -1) * (0.5776 * (z + 6.5) + 0.7), x, z, ma + 6 + (k % 5) * 7, { v: 2.2, hide: true, then: { back: true, headTilt: ((k * 37) % 5 - 2) * 0.02 } }));
      [[-0.85, 2.6], [0.85, 2.5], [-0.82, 2.45], [0.85, 2.65]].forEach(([x, y], k) => star(c, ce + 4 + k * 7, x, y, 5.5, 0.5));
    } else {
      // today: a far bigger crowd in today's clothes, telephones held up
      let n = 0;
      for (const s of [-1, 1]) ([[4.6, 4, 0], [3.7, 3, 0.45], [2.8, 2, 0.75], [2.0, 2, 0.95]] as const).forEach(([zr, cnt, off]) => { for (let j = 0; j < cnt; j++, n++) {
        const x = s * (1.15 + off + j * 1.25 + 0.24 * (hh(n, 3) - 0.5)), z = zr + 0.3 * (hh(n, 5) - 0.5), ph = n % 2 === 0;
        P(c, MODERN[n % 24], x, z, { back: true, wave: ph ? 0 : undefined, headTilt: (hh(n, 7) - 0.5) * 0.08 });
        if (ph) fx(c, "phoneCam", 160, 300, fxPhoneCam, x - 0.309, 1.56, z - 0.05, 0.16);
      } });
    }
  } },
  { name: "and Peruggia?", a: at("s10_6") - 5, zone: "louvre", cam: PRES, draw: (c) => {
    wall(c, "mona");
    sir(c, SX, SZ, { expr: "neutral", shrug: ramp(c.f, c.a + 4, c.a + 12) });
  } },
  { name: "he fights for Italy in the First World War", a: at("s10_7") - 4, zone: "louvre", x: 8, cam: [[COUNTRY, 1.35, -3.1], [COUNTRY, 1.35, 10], 40, 0.0004], draw: (c) => {
    country(c, "front");
    fx(c, "flagPoleG", 420, 1000, (p) => fxFlagPole(p, false), COUNTRY - 1.3 - 0.5, 1.75, 5.6, 1.5);
    P(c, SOLDIERS[0], COUNTRY - 2.7, 4.4, { expr: "neutral", look: 1 }); P(c, SOLDIERS[1], COUNTRY + 3.7, 4.8, { expr: "neutral", look: -1 });
    P(c, PER_RIFLE, COUNTRY + 1.25, 1.5, { expr: "smile" }, PS);
    nameOver(c, c.a + 8, "PERUGGIA|IN THE ITALIAN ARMY", COUNTRY + 1.25, 1.5, { scale: 0.9, w: 2.3 });
  } },
  { name: "then he goes back to live in France, of all places", a: at("s10_7", "Then") - 3, zone: "louvre", cam: [[FR + 0.2, 1.4, -4.0], [FR + 0.2, 1.5, 10], 40, 0.0004], draw: (c) => {
    const of = at("s10_7", "of") - 3, X1 = FR - 1.12, Z = 1.5;
    france(c);
    fx(c, "flagPoleFr", 420, 1000, (p) => fxFlagPole(p, false, false, FR_COLS), FR - 2.45 - 0.4, 1.4, 2.6, 1.2);
    // he walks in past the flag, toward the house; the suitcase is in his hand until he puts it down to shrug
    const x = walk(c, PER, FR - 4.4, X1, Z, c.a - 20, { ...PS, v: 1.5, then: { expr: "smile", shrug: c.f > of ? ramp(c.f, of, of + 8) : undefined } });
    if (x < X1) fx(c, "suitcase", 460, 340, fxSuitcase, x, 0.69 * 0.9 - 0.185 + 0.04, Z - 0.06, 0.5);
    else if (c.f <= of) hold(c, "suitcase", 460, 340, fxSuitcase, X1, Z, -1, 0.5, { scale: 0.9 });
    else fx(c, "suitcase", 460, 340, fxSuitcase, X1 - 0.52, 0.17, Z - 0.05, 0.5);
  } },
  { name: "he dies there in 1925, on his forty-fourth birthday", a: at("s10_8") - 4, zone: "louvre", x: 10, cam: [[YX, 1.5, -5], [YX, 1.6, 2], 36, 0.0006], draw: (c) => {
    yard(c);
    ban(c, at("s10_8", "forty-fourth") - 3, "DIED 8 OCTOBER 1925|AGED EXACTLY 44", YX - 0.28, 3.02, 2.0, 1.9);
  } },
  { name: "and nobody notices (his death)", a: at("s10_9") - 8, zone: "louvre", cam: [[YX, 2.4, -10.5], [YX, 1.4, 2], 36, 0.0009], draw: (c) => {
    yard(c);
  } },
  { name: "the newspapers do not report his death until 1947, 22 years late, when another man using his name dies", a: at("s10_10") - 4, zone: "office", x: 10, cam: [[OX, 1.9, -5.8], [OX, 1.9, 1.5], 33.5, 0.0002], draw: (c) => {
    const y47 = at("s10_10", "1947") - 3, tt = at("s10_10", "Twenty-two") - 3, an = at("s10_10", "another") - 3;
    newsroom(c, "DAILY COURIER");
    // the wall calendar runs from the year he died to the year the papers noticed
    const yr = Math.min(1947, 1925 + Math.max(0, Math.floor((c.f - (c.a + 10)) / 3)));
    fx(c, `wcal${yr}`, 420, 480, (p) => fxCalendar(p, " ", String(yr), yr === 1947 ? "#d8382f" : "#3a4150"), 2.6, 2.4, 5.9, 0.9);
    pop(c, y47, "obit47", 600, 760, fxObitPage, 4.2, 2.5, 5.9, 1.7);
    P(c, NEWSMAN, 5.9, 2.6, { expr: c.f >= an ? "shock" : "neutral", look: -1, facing: -1, point: c.f >= y47 ? ramp(c.f, y47, y47 + 8) : undefined });
    ban(c, tt, "DIED 1925 - REPORTED 1947|22 YEARS LATE", 1.8, 2.45, 2.2, 2.0);
    stamp(c, an, "WRONG MAN", 4.47, 2.3, 5.6, 1.1, 0.12);
  } },
  { name: "he wanted a fortune; he got seven months in jail", a: at("s10_11") - 4, zone: "louvre", x: 8, cam: [[CX0, 1.36, CAMZ], [CX0, 1.36, 4], 34, 0.0005], draw: (c) => {
    const go = at("s10_11", "got") - 3, no = go - 6, wake = go + 6;
    // he is behind the middle of the barred window, between two bars, from the first frame; the fortune is only in his head
    P(c, PER_SUIT, CPX, PZ, { expr: c.f >= no ? "pained" : "smile_closed" }, PS);
    fx(c, "cellInside", 600, 480, fxCellInside, CPX, 1.5, PZ + 0.6, 4.2);
    fx(c, "cellFront", 1900, 900, fxCellFront, CX0, 1.8, CZ, 7.6);
    const b = thinkTo(c, c.a + 6, CPX, PZ, fxCash, "cash", 520, 380, 0.45, { scale: 0.9, w: 1.6, f1: wake });
    pop(c, no, "noCash", 320, 320, (p) => fxMark(p, false), b.x, b.y, PZ - 0.14, 0.4, 0, wake);
    tag(c, wake, "INSTEAD", "7 MONTHS", CX0 - 1.25, 1.75, CZ - 0.1, 1.35);
  } },
  { name: "but he did one thing nobody else has ever managed", a: at("s10_12") - 4, zone: "louvre", x: 8, cam: PRES, draw: (c) => {
    wall(c, "mona");
    const pt = ramp(c.f, c.a + 20, c.a + 28);
    sir(c, SX, SZ, { point: pt, expr: "smile", look: pt > 0 ? -1 : undefined });
  } },
  { name: "Leonardo da Vinci made her a masterpiece", a: at("s10_13") - 4, zone: "louvre", cam: PRES, draw: (c) => {
    wall(c, "mona");
    P(c, LEONARDO, 1.2, 5.0, { expr: "smile", look: -1, facing: -1, point: ramp(c.f, c.a + 4, c.a + 12) });
    nameOver(c, c.a + 8, "THE PAINTER", 1.2, 5.0, { w: 1.15 });
    [[-0.75, 2.35], [-0.78, 1.5], [0, 1.02]].forEach(([x, y], k) => star(c, at("s10_13", "masterpiece") - 3 + k * 5, x, y, 5.5, 0.42));
  } },
  { name: "Vincenzo Peruggia made her famous", a: at("s10_13", "Vincenzo") - 3, zone: "louvre", cam: PRES, draw: (c) => {
    const fa = at("s10_13", "famous") - 3;
    wall(c, "mona");
    P(c, LEONARDO, 1.2, 5.0, { expr: "smile", look: -1, facing: -1, point: 1 }); nameOver(c, -1e9, "THE PAINTER", 1.2, 5.0, { w: 1.15 });
    P(c, PER_SMOCK, -1.2, 5.0, { expr: "grin", look: 1, facing: 1, shrug: ramp(c.f, c.a + 6, c.a + 14) }, PS);
    nameOver(c, c.a + 8, "THE THIEF", -1.2, 5.0, { w: 1.15, top: 1.8 });
    [[-0.72, 2.62, 0.36], [0.72, 2.62, 0.36], [0, 1.0, 0.4]].forEach(([x, y, sz], k) => star(c, fa + k * 4, x, y, 5.5, sz));
  } },
  { name: "outro: keep an eye on your valuables, especially on Mondays", a: at("s10_14") - 5, zone: "louvre", cam: PRES, draw: (c) => {
    const es = at("s10_14", "Especially") - 3, take = at("s10_14", "Mondays") + 16, gone = c.f >= take, PX = -0.95, PZ2 = 4.9;
    wall(c, gone ? "hooks" : "mona");
    sir(c, SX, SZ, { wave: !gone && c.n > 4 && c.n < 40 ? q(Math.sin(c.f / 3.2), 4) : undefined, expr: gone ? "shock" : c.f >= es ? "grin" : "smile", look: gone ? -1 : undefined });
    cal(c, es, "CLOSED ON", "MON", -1.56, 2.2, 5.4, 0.8);
    // the thief again: he walks in behind Sir Digsworth's back, and runs off with her
    if (!gone) walk(c, PER_SMOCK, -3.6, PX, PZ2, es + 2, { ...PS, v: 2.4, hide: true, then: { expr: "grin", look: 1, facing: 1 } });
    else { const x = walk(c, PER_SMOCK, PX, -4.6, PZ2, take, { ...PS, v: 2.8, gone: true }); if (x > -4.59) fx(c, "monamona", 700, 920, (p) => fxMona(p), x - 0.24, 0.74, PZ2 + 0.05, 0.46, -0.1); }
  } },
];
