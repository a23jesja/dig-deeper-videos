// What happens in every shot of the long film "The Man Who Sold the Eiffel Tower" (Victor Lustig). Landscape; +x is screen-left.
import { Outfit, FrontOpts, INK } from "./toon";
import { fxRoadSign, fxBanner, fxBulb, fxStamp } from "./wltoon";
import { fxEiffel, fxForSale, fxNewspaper, fxLetter, fxCash, fxLiberty, fxMoneyBox, fxNote, fxClock, fxSafe, fxPhone, fxKey, fxLocker, fxRope, fxBars, fxAlcatraz, fxStar, fxWallet } from "./lustigtoon";
import { Stage, CamInfo, person, q, lidAt } from "./castbase";
import { FPS, V3, ramp, clamp01 } from "./story";
import { Scene, Show, SIR } from "./scenes";
import { Who, man, pop, card, tag, banner, sparkle, sweat } from "./scenesP";
import { LUSTIG, D1, D2, POISSON, GENDARME, talkB, TW, TH } from "./scenesLs";
import { SHORE } from "./storyP";
import { TOWER } from "./storyLs";
import talkJson from "./talkLL.json";
import { SHOTS_LL, camAtLL, atLL as at, ALL } from "./storyLL";

const TALK = talkJson as number[];
const talk = (f: number) => TALK[Math.max(0, Math.min(TALK.length - 1, f))] ?? 0;
const T = (f: number) => f / FPS;
const KID: Who = { i: 36, o: { jacket: "#30324a", pants: "#55504a", boots: INK, hat: "hair", hair: "#2b2026" }, okey: "kidlustig" };
const YOUNG: Who = { i: 37, o: { ...LUSTIG.o, hat: "hair", hair: "#2b2026" }, okey: "younglustig" };
const TEACHER: Who = { i: 38, o: { jacket: "#5a4a58", pants: "#3a3540", boots: INK, hat: "hair", hair: "#8a8a90", build: "stout", moustache: "#8a8a90", buttons: "#c9a94a" }, okey: "teacher" };
const SHERIFF: Who = { i: 39, o: { jacket: "#8a6a4a", pants: "#4a4038", boots: INK, hat: "slouch", cap: "#6a4a2c", moustache: "#5b3a22", build: "stout", buttons: "#c9a94a" }, okey: "sheriff" };
const CAPONE: Who = { i: 40, o: { jacket: "#2f2a36", pants: "#2f2a36", boots: INK, hat: "slouch", cap: "#e9e4d2", build: "stout", buttons: "#c9a94a" }, okey: "capone" };
const CHEMIST: Who = { i: 41, o: { jacket: "#eef0f2", pants: "#55606a", boots: INK, hat: "hair", hair: "#5a3b2a", buttons: "#9aa4ae" }, okey: "chemist" };
const PHARM: Who = { i: 42, o: { jacket: "#eef0f2", pants: "#4a4038", boots: INK, hat: "hair", hair: "#8a8a90", moustache: "#8a8a90", buttons: "#9aa4ae" }, okey: "pharm" };
const BILLY: Who = { i: 43, o: { jacket: "#b03a5a", pants: "#b03a5a", boots: INK, hat: "hair", hair: "#d9a441", skin: "#f5c9a0", buttons: "#f4efe0" }, okey: "billy" };
const AG1: Who = { i: 44, o: { jacket: "#2e3142", pants: "#2e3142", boots: INK, hat: "slouch", cap: "#3a3d42", buttons: "#8a8f9c" }, okey: "agent1" }, AG2: Who = { i: 45, o: { ...AG1.o, skin: "#f5c9a0", moustache: "#3b2a1e" } as Outfit, okey: "agent2" };

/** the tower, far off; an optional tag on it */
const tower = (out: Stage, f: number, sale?: { f0: number; s: string }) => {
  out.fx.push({ key: "eiffel", cw: 700, ch: 1400, draw: fxEiffel, x: TOWER[0], y: TH / 2, z: TOWER[2], w: TW, h: TH });
  if (sale) card(out, f, sale.f0, `sale|${sale.s}`, 420, 260, (p) => fxForSale(p, sale.s), TOWER[0], 13.5, 60, 15);
};
const fx1 = (out: Stage, key: string, cw: number, ch: number, draw: (p: import("./toon").Pen) => void, x: number, y: number, z: number, w: number, rot = 0) => out.fx.push({ key, cw, ch, draw, x, y, z, w, h: (w * ch) / cw, rot });
const stamp = (out: Stage, f: number, f0: number, s: string, x: number, y: number, z: number, w: number, rot = 0.1) => card(out, f, f0, `stamp|${s}`, 640, 220, (p) => fxStamp(p, s), x, y, z, w, rot);
const abc = (g: CanvasRenderingContext2D) => {
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = "#2f4a3c"; g.fillRect(0, 0, 1024, 756); g.strokeStyle = "#e9e4d2"; g.lineWidth = 8; g.strokeRect(22, 22, 980, 712);
  g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#f4f1e6"; g.font = "900 190px 'Arial Black', Impact, sans-serif"; g.fillText("A B C", 512, 260); g.fillStyle = "#ffe27a"; g.fillText("1 2 3", 512, 520);
};

export const sceneAtLL = (id: number, f: number, cam: CamInfo): Scene => {
  const out: Scene = { places: [], fx: [], guns: [], crates: [], fan: f * 0.07 };
  const t = T(f), a = ALL[id], n = f - a, end = SHOTS_LL[id - 1].b;
  const sir = (x: number, z: number, fo: FrontOpts = {}) => person(out, cam, SIR, x, 0, z, { fo: { mode: "stand", expr: "smile", blink: lidAt(t, 3), ...fo }, talk: talk(f) });
  const wav = (on: boolean, ph = 0) => (on ? q(Math.sin(f / 3.2 + ph), 4) : undefined);
  const chr = (f0: number, ph = 0) => (f >= f0 ? q(0.7 + 0.3 * Math.sin(f * 0.5 + ph), 4) : undefined);
  const walkIn = (who: Who, x1: number, z: number, from: number, f0: number, dur: number, fo: FrontOpts) => {
    const u = ramp(f, f0, f0 + dur), x = from + (x1 - from) * u;
    if (f >= f0) man(out, cam, who, x, 0, z, u < 0.98 ? { mode: "march", phase: ((f - f0) / 9) % 1, expr: fo.expr ?? "smile" } : fo, t);
  };
  switch (id) {
    case 1: case 2: case 3: {
      // the sale, and the sale again
      const sold = at("hook1", "sold") - 2, any = at("hook2", "sold") - 2, ag = at("hook3", "again") - 3;
      tower(out, f, id === 3 ? { f0: f >= ag ? ag : a - 40, s: f >= ag ? "FOR SALE AGAIN" : "SOLD" } : id === 2 ? { f0: f >= any ? any : a - 40, s: f >= any ? "SOLD" : "FOR SALE" } : f >= sold ? { f0: sold, s: "FOR SALE" } : undefined);
      if (id === 1) sir(1.9, -3.6);
      man(out, cam, LUSTIG, 0.9, 0, 1, { expr: id === 1 && f < sold ? "smile" : "grin", look: -1 }, t);
      if (id === 1) fx1(out, "letter", 420, 520, (p) => fxLetter(p), 0.3, 1.25, 0.85, 0.5, -0.06);
      if (id < 3) { man(out, cam, D1, -1.1, 0, 1, { expr: "grin", look: 1 }, t); if (id === 2 || f >= sold) card(out, f, id === 1 ? sold : a - 40, "cash", 520, 380, fxCash, id === 2 ? 0.25 : -0.4, 0.95, 0.85, 0.7); }
      else { fx1(out, "cash", 520, 380, fxCash, 1.5, 0.3, 0.8, 0.6); walkIn(D2, -1.1, 1, -5.5, a, 26, { expr: "smile", look: 1 }); }
      break;
    }
    case 4: {
      tower(out, f);
      sir(1.6, -4.2, { wave: wav(n > 4 && n < 50) });
      man(out, cam, LUSTIG, -1.3, 0, -0.8, { expr: "grin", wave: wav(f >= at("intro", "Victor") - 2, 1) }, t);
      banner(out, f, at("intro", "Victor") - 3, "CON MAN|VICTOR LUSTIG", -1.3, 2.85, -0.8, 2.3, "#fff3c4");
      break;
    }
    case 5: {
      person(out, cam, KID, 0.6, 0, 0.5, { scale: 0.55, fo: { mode: "stand", expr: "grin", blink: lidAt(t, 51) } });
      tag(out, f, at("born", "1890") - 2, "BOHEMIA", "1890", 0.6, 1.85, 0.5, 1.3);
      break;
    }
    case 6: case 7: case 8: {
      // school: the first day, the report, the languages
      out.office = "minister";
      if (id < 8) {
        out.board = { pos: [3.6, 0, 3.4], key: "abc", draw: abc };
        const ex = at("born", "expelled") - 3, rude = at("born", "rude") - 3, idi = at("report", "idiot") - 3;
        man(out, cam, TEACHER, 2.0, 0, 1.5, { expr: id === 7 ? "stern" : f >= rude ? "shock" : "stern", look: -1, point: id === 6 && f >= ex ? 0.8 : undefined }, t);
        person(out, cam, KID, 0.3, 0, 1.5, { scale: 0.55, fo: { mode: "stand", expr: "grin", look: 1, blink: lidAt(t, 51), shrug: id === 7 && f >= idi ? 1 : undefined } });
        if (id === 6) { stamp(out, f, ex, "EXPELLED", 1.2, 3.0, 1.4, 2.0); talkB(out, f, rude, "@#$!", 0.0, 1.95, 1.5, 1.6); }
        else { fx1(out, "report", 420, 520, (p) => fxLetter(p, "SCHOOL REPORT"), 1.25, 1.5, 1.3, 0.7, 0.05); stamp(out, f, idi, "IDIOT", 1.25, 2.7, 1.3, 1.6); }
      } else {
        const not = at("languages", "not") - 2;
        man(out, cam, YOUNG, 1.5, 0, 1.5, { expr: "grin" }, t);
        if (f >= not && f < at("languages", "English") - 4) card(out, f, not, "bulb", 200, 260, fxBulb, 1.5, 2.7, 1.5, 0.6);
        ([["English", "ENGLISH|Hello!"], ["French", "FRENCH|Bonjour!"], ["Italian", "ITALIAN|Ciao!"], ["Hungarian", "HUNGARIAN|Szia!"]] as [string, string][]).forEach(([w, s], k) => banner(out, f, at("languages", w) - 2, s, 3.7, 3.55 - k * 0.6, 1.5, 2.0, ["#dfe9ff", "#fff3c4", "#dff0d0", "#ffe1dc"][k]));
      }
      break;
    }
    case 9: {
      // on the liner: a producer with no production
      const no = at("liners", "There") - 3;
      man(out, cam, YOUNG, 8.4 + 1.0, 3.76, 9.2, { expr: "grin", look: -1 }, t, false);
      man(out, cam, D1, 8.4 - 1.0, 3.76, 9.2, { expr: f >= no ? "shock" : "smile", look: 1 }, t, false);
      banner(out, f, at("liners", "producer") - 2, "BROADWAY|A NEW MUSICAL", 8.4, 6.45, 9.2, 2.6, "#fff3c4");
      card(out, f, at("liners", "investors") - 2, "cash", 520, 380, fxCash, 8.4, 4.75, 9.05, 0.6);
      stamp(out, f, no, "NO SHOW", 8.4, 6.4, 9.0, 2.2, 0.14);
      break;
    }
    case 10: case 11: case 12: {
      // the money box
      out.office = "minister";
      const six = at("box", "six") - 2, puts = at("trick", "puts") - 2, outs = at("trick", "out") - 3, hid = at("trick", "hid") - 3, th = at("sell", "thousands") - 3;
      man(out, cam, LUSTIG, 3.0, 0, 1.4, { expr: id === 12 ? "grin" : "smile", look: -1 }, t);
      man(out, cam, D2, -0.1, 0, 1.4, { expr: id === 11 && f >= outs ? "shock" : id === 12 ? "grin" : "smile", look: 1 }, t);
      fx1(out, "moneybox", 520, 380, fxMoneyBox, 1.45, 0.56, 1.2, 1.5);
      if (id === 10) { banner(out, f, at("box", "copy") - 2, "COPIES ANY BANKNOTE", 1.45, 2.7, 1.2, 2.6, "#fff3c4"); tag(out, f, six, "IT TAKES", "6 HOURS", 1.45, 3.55, 1.2, 1.6); }
      if (id === 11) {
        const u = ramp(f, puts, puts + 14), v = ramp(f, outs, outs + 14), six2 = at("trick", "Six") - 2;
        if (f >= puts && u < 1) fx1(out, "note", 320, 170, (p) => fxNote(p), 2.6 - 0.9 * u, 0.82, 1.1, 0.6);
        if (f >= six2 && f < outs) fx1(out, `clock${q(clamp01((f - six2) / (outs - six2)), 24)}`, 300, 300, (p) => fxClock(p, 6 * q(clamp01((f - six2) / (outs - six2)), 24)), 1.45, 2.45, 1.2, 0.9);
        if (f >= outs) fx1(out, "note", 320, 170, (p) => fxNote(p), 1.2 - 0.9 * v, 0.62, 1.1, 0.6);
        banner(out, f, hid, "HIDDEN INSIDE EARLIER", 1.45, 2.55, 1.2, 2.6, "#ffe1dc");
      }
      if (id === 12) { card(out, f, th, "cash", 520, 380, fxCash, 2.2, 1.0, 1.2, 0.65); banner(out, f, th, "SOLD FOR|THOUSANDS OF DOLLARS", 1.45, 3.1, 1.2, 2.8, "#dff0d0"); }
      break;
    }
    case 13: {
      // Texas: the sheriff wants his money back, and gets it
      const ch = at("sheriff", "Chicago") - 3, pay = at("sheriff", "pays") - 3, fake = at("sheriff", "fake") - 3;
      walkIn(SHERIFF, -1.3, 0.3, -5.5, a, 30, { expr: f >= fake + 14 ? "shock" : f >= pay ? "smile" : "stern", look: 1 });
      if (n > 30) { out.fx.push({ key: "star", cw: 200, ch: 200, draw: fxStar, x: -1.12, y: 1.28, z: 0.2, w: 0.2, h: 0.2 }); fx1(out, "moneybox", 520, 380, fxMoneyBox, -2.6, 0.4, 0.6, 1.1); }
      man(out, cam, LUSTIG, 1.4, 0, 0.3, { expr: f >= pay ? "grin" : "nervous", look: -1 }, t);
      if (f >= ch) card(out, f, ch, "rsCHICAGO", 400, 640, (p) => fxRoadSign(p, "CHICAGO"), 3.4, 1.6, 2.6, 2.0);
      if (f >= pay) { const u = ramp(f, pay, pay + 12), fk = f >= fake; fx1(out, `note${fk}`, 320, 170, (p) => fxNote(p, fk), 0.9 - 1.6 * u, 1.05, 0.2, 0.62, 0.1); }
      stamp(out, f, fake, "FAKE", 0.1, 2.7, 0.3, 1.8);
      break;
    }
    case 14: {
      const ex = at("paris", "expensive") - 3;
      tower(out, f);
      if (f >= ex) card(out, f, ex, "costly", 1000, 260, (p) => fxBanner(p, "REPAIRS AND PAINT|TOO EXPENSIVE"), TOWER[0], 14, 60, 17);
      man(out, cam, LUSTIG, 0.6, 0, 1, { expr: f >= ex ? "grin" : "neutral", look: -1 }, t);
      fx1(out, "paper", 420, 520, (p) => fxNewspaper(p), -0.1, 1.2, 0.8, 0.62, 0.06);
      tag(out, f, at("paris", "1925") - 2, "PARIS", "1925", -3.2, 2.6, 1, 1.6);
      if (f >= at("paris", "repaint") + 4) card(out, f, at("paris", "repaint") + 4, "bulb", 200, 260, fxBulb, 0.6, 2.75, 1, 0.6);
      break;
    }
    case 15: case 16: case 17: {
      // the hotel: the forged letter, the dealers, the secret, the money
      out.office = "minister";
      const dd = at("plan", "Deputy") - 3, sec = at("hotel", "secret") - 3, wish = at("hotel", "government") - 3, bribe = at("poisson", "bribe") - 3, pays = at("poisson", "pays", 1) - 3, sev = at("poisson", "70,000") - 2;
      man(out, cam, LUSTIG, 3.2, 0, 1.4, { expr: id === 17 && f >= bribe ? "grin" : "smile", look: -1 }, t);
      if (id === 15) { fx1(out, "letter", 420, 520, (p) => fxLetter(p), 2.5, 1.3, 1.25, 0.6, -0.06); banner(out, f, dd, "MINISTRY OF POSTS AND TELEGRAPHS|DEPUTY DIRECTOR-GENERAL", 2.2, 3.3, 1.4, 4.0, "#fff3c4"); }
      else {
        const paying = id === 17;
        ([[D1, 1.9], [POISSON, 0.9], [D2, -0.1]] as [Who, number][]).forEach(([w, x], k) => {
          if (id === 16) walkIn(w, x, 1.4, x - 5, a + k * 4, 24, { expr: f >= wish ? "shock" : "smile", look: 1 });
          else man(out, cam, w, w === POISSON ? 1.9 : w === D1 ? 0.6 : x, 0, w === POISSON ? 1.0 : 1.6, { expr: w === POISSON ? "grin" : "smile", look: 1 }, t);
        });
        if (id === 16 && f >= sec) talkB(out, f, wish > sec ? (f >= wish ? wish : sec) : sec, f >= wish ? "The tower is|FOR SALE. As scrap." : "It is a secret...", 3.0, 3.25, 1.4, 2.6, true);
        if (paying) {
          banner(out, f, at("poisson", "André") - 3, "SCRAP DEALER|ANDRÉ POISSON", 1.9, 2.75, 1.0, 2.2, "#fff3c4");
          card(out, f, bribe, "cash", 520, 380, fxCash, 2.55, 1.05, 0.9, 0.55); card(out, f, pays, "cash2", 520, 380, fxCash, 2.55, 0.5, 0.85, 0.55);
          tag(out, f, sev, "FRANCS", "70,000", 4.45, 3.2, 1.4, 1.6, "#dff0d0");
        }
      }
      break;
    }
    case 18: {
      const no = at("austria", "Nothing") - 3;
      fx1(out, "rsAUSTRIA", 400, 640, (p) => fxRoadSign(p, "AUSTRIA"), -2.0, 1.6, 2.6, 2.0);
      man(out, cam, LUSTIG, 0.6, 0, 1, { expr: f >= no ? "grin" : "nervous", look: -1 }, t);
      fx1(out, "paperZ", 420, 520, (p) => fxNewspaper(p, "ZEITUNG"), -0.1, 1.2, 0.8, 0.62, 0.06);
      fx1(out, "cash", 520, 380, fxCash, 1.5, 0.3, 0.8, 0.6);
      talkB(out, f, no, "Nothing!", 1.0, 2.8, 1, 1.6, true);
      break;
    }
    case 19: {
      tower(out, f);
      man(out, cam, POISSON, 1.0, 0, 1, { expr: "pained", look: -1 }, t); sweat(out, f, 1.34, 1.9, 0.9);
      man(out, cam, GENDARME, -1.2, 0, 1.4, { expr: "whistle", look: -1 }, t);
      talkB(out, f, at("austria", "ashamed") - 3, "...", 1.0, 2.75, 1, 1.2, true);
      break;
    }
    case 20: {
      const pol = at("again", "police") - 6, ag = at("again", "again") - 3;
      tower(out, f, f >= ag ? { f0: ag, s: "FOR SALE AGAIN" } : undefined);
      man(out, cam, LUSTIG, 1.8, 0, 1, { expr: f >= pol ? "shock" : "grin", look: -1 }, t);
      man(out, cam, D1, 0.3, 0, 1, { expr: f >= pol ? "shock" : "smile", look: 1 }, t); man(out, cam, D2, -0.8, 0, 1, { expr: "smile", look: 1 }, t);
      walkIn(GENDARME, -2.4, 0.6, -6.5, pol, 18, { expr: "stern", look: 1, point: 0 });
      talkB(out, f, pol + 14, "Police!", -2.0, 3.0, 0.6, 1.7);
      break;
    }
    case 21: {
      out.fx.push({ key: "liberty", cw: 420, ch: 900, draw: fxLiberty, x: 21, y: 10, z: 70, w: 9.3, h: 20 });
      man(out, cam, LUSTIG, 8.4, 3.76, 9.2, { expr: "grin", wave: q(Math.sin(f / 3.2), 4) }, t, false);
      fx1(out, "cash", 520, 380, fxCash, 7.6, 4.06, 9.0, 0.6);
      break;
    }
    case 22: case 23: {
      // Chicago: Al Capone's money, kept safe and handed back
      out.office = "minister";
      const fifty = at("capone", "50,000") - 2, safe = at("capone", "safe") - 3, gives = at("capone", "gives") - 3, five = at("capone2", "5,000") - 2, broke = at("capone2", "broke") - 3;
      man(out, cam, CAPONE, 0.4, 0, 1.4, { expr: id === 22 && f >= gives ? "shock" : "stern", look: 1 }, t);
      man(out, cam, LUSTIG, 2.6, 0, 1.4, { expr: id === 23 && f >= five ? "grin" : id === 23 ? "pained" : "smile", look: -1, shrug: id === 23 && f >= broke && f < five ? 1 : undefined }, t);
      banner(out, f, id === 22 ? at("capone", "Al") - 2 : a - 40, "AL CAPONE", 0.4, 2.75, 1.4, 1.7, "#fff3c4");
      if (id === 22) {
        const inSafe = f >= safe && f < gives;
        fx1(out, `safe${inSafe}`, 420, 480, (p) => fxSafe(p, inSafe), 4.6, 0.86, 1.6, 1.5);
        if (f >= fifty && !inSafe) { const back = f >= gives, u = back ? ramp(f, gives, gives + 12) : 1 - ramp(f, fifty, fifty + 12); fx1(out, "cash", 520, 380, fxCash, 2.0 - 1.0 * u * (back ? 1 : 1) - (back ? 0 : 0), 1.0, 1.2, 0.6); }
        tag(out, f, fifty, "INVEST", "$50,000", 1.5, 3.55, 1.4, 1.7, "#dff0d0");
        if (inSafe) tag(out, f, at("capone", "two") - 2, "IN THE SAFE", "2 MONTHS", 4.6, 2.6, 1.6, 1.6);
      } else if (f >= five) { tag(out, f, five, "A GIFT", "$5,000", 1.5, 3.4, 1.4, 1.7, "#dff0d0"); const u = ramp(f, five, five + 12); fx1(out, "note", 320, 170, (p) => fxNote(p), 0.9 + 1.2 * u, 1.05, 1.2, 0.62, 0.1); }
      break;
    }
    case 24: {
      // five years of printing
      out.office = "minister";
      man(out, cam, CHEMIST, 3.1, 0, 1.5, { expr: "smile", look: -1 }, t); man(out, cam, PHARM, 0.0, 0, 1.5, { expr: "smile", look: 1 }, t); man(out, cam, LUSTIG, 1.55, 0, 1.9, { expr: "grin" }, t);
      const k = Math.min(18, Math.floor(n / 9));
      for (let i = 0; i < k; i++) fx1(out, "noteF", 320, 170, (p) => fxNote(p), 0.7 + (i % 3) * 0.85, 0.12 + Math.floor(i / 3) * 0.2, 0.9, 0.7, ((i * 37) % 7 - 3) * 0.03);
      banner(out, f, at("fake", "chemist") - 2, "A CHEMIST", 3.1, 2.6, 1.5, 1.5); banner(out, f, at("fake", "pharmacist") - 2, "A PHARMACIST", 0.0, 2.6, 1.5, 1.8);
      banner(out, f, at("fake", "five") - 2, "FAKE DOLLARS FOR|5 YEARS", 1.55, 3.45, 1.5, 2.6, "#ffe1dc");
      break;
    }
    case 25: {
      out.office = "minister";
      const tel = at("billy", "telephones") - 3;
      man(out, cam, BILLY, 2.2, 0, 1.4, { expr: "stern", look: -1 }, t);
      banner(out, f, at("billy", "Billy") - 2, "BILLY MAY", 2.2, 2.7, 1.4, 1.6, "#ffe1dc");
      if (f >= tel) { fx1(out, "phone", 240, 360, fxPhone, 1.72, 1.5, 1.25, 0.42); talkB(out, f, tel + 6, "It's Lustig!", 2.6, 3.45, 1.4, 2.0, true); }
      walkIn(AG1, 0.3, 1.4, -4.5, at("billy", "federal") - 4, 20, { expr: "stern", look: 1 }); walkIn(AG2, -0.7, 1.6, -5.5, at("billy", "federal") - 2, 20, { expr: "stern", look: 1 });
      break;
    }
    case 26: case 27: {
      out.office = "minister";
      const key = at("key", "key") - 3, op = at("key", "51,000") - 6;
      man(out, cam, AG1, 2.8, 0, 1.4, { expr: "stern", look: -1 }, t); man(out, cam, AG2, 0.2, 0, 1.4, { expr: "stern", look: 1 }, t);
      if (id === 26) {
        man(out, cam, LUSTIG, 1.5, 0, 1.4, { expr: f >= key ? "whistle" : "nervous" }, t);
        banner(out, f, at("key", "New") - 2, "NEW YORK|MAY 1935", 1.5, 3.6, 1.4, 2.2, "#fff3c4");
        card(out, f, key, "key", 320, 150, fxKey, 1.5, 2.75, 1.3, 1.1);
      } else {
        const open = f >= op;
        fx1(out, `locker${open}`, 420, 620, (p) => fxLocker(p, open), 1.5, 1.45, 1.4, 1.9);
        banner(out, f, at("key", "Times") - 2, "TIMES SQUARE STATION", 1.5, 3.55, 1.4, 2.8);
        tag(out, f, op + 4, "FAKE DOLLARS", "$51,000", 4.3, 2.6, 1.4, 1.7, "#ffe1dc");
      }
      break;
    }
    case 28: {
      // down the wall on a rope
      const cl = at("escape", "climbs") - 3, free = at("escape", "27") - 3, u = ramp(f, cl, cl + 50);
      fx1(out, "jail", 700, 560, fxBars, 0, 3.0, 4, 7.5);
      fx1(out, "rope", 80, 900, fxRope, 0.35, 1.45, 3.92, 0.24);
      banner(out, f, a + 8, "THE DAY BEFORE HIS TRIAL", -3.4, 4.4, 3.9, 3.0);
      if (f >= cl && u < 1) person(out, cam, LUSTIG, 0.35, 2.3 * (1 - u), 3.8, { fo: { mode: "stand", expr: "grin", blink: lidAt(t, 61), cheer: 1 } }, false);
      else if (f >= cl) { const v = clamp01((f - cl - 50) / 40); person(out, cam, LUSTIG, 0.35 + 5.5 * v, 0, 3.6, { side: true, mirror: true, so: { mode: "march", phase: (v * 7) % 1 } }); }
      tag(out, f, free, "FREE FOR", "27 DAYS", 3.6, 2.4, 3.6, 2.0, "#dff0d0");
      break;
    }
    case 29: {
      fx1(out, "rsPITTSBURGH", 400, 640, (p) => fxRoadSign(p, "PITTSBURGH"), -2.6, 1.6, 2.6, 2.0);
      man(out, cam, LUSTIG, 0.6, 0, 1, { expr: "pained" }, t);
      walkIn(AG1, 1.7, 1, 6.5, a, 14, { expr: "stern", look: -1 }); walkIn(AG2, -0.5, 1, -5.5, a + 2, 14, { expr: "stern", look: 1 });
      break;
    }
    case 30: {
      const al = at("alcatraz", "Alcatraz") - 3;
      out.fx.push({ key: "alcatraz", cw: 1000, ch: 520, draw: fxAlcatraz, x: SHORE - 3, y: 6.9, z: 60, w: 30, h: 15.6 });
      man(out, cam, AG1, SHORE + 3.4, 0, 3, { expr: "stern", look: -1 }, t); man(out, cam, LUSTIG, SHORE + 2.2, 0, 3, { expr: "pained", look: -1 }, t);
      banner(out, f, al, "ALCATRAZ|20 YEARS", SHORE - 3, 7.6, 30, 9, "#ffe1dc");
      break;
    }
    case 31: {
      out.office = "minister";
      const ap = at("death", "apprentice") - 3;
      sir(3.6, 0.4);
      fx1(out, "certificate", 420, 520, (p) => fxLetter(p, "CERTIFICATE"), 2.0, 1.9, 1.4, 1.5, 0.03);
      tag(out, f, at("death", "1947") - 2, "VICTOR LUSTIG", "1890-1947", 2.0, 3.4, 1.4, 1.7);
      banner(out, f, ap, "OCCUPATION|APPRENTICE SALESMAN", -0.5, 2.3, 1.3, 2.1, "#fff3c4");
      banner(out, f, at("death", "counterfeiter") - 3, "AND COUNTERFEITER", -0.5, 1.55, 1.3, 2.1, "#ffe1dc");
      break;
    }
    case 32: case 33: {
      const still = at("end", "still") - 3;
      tower(out, f, id === 33 || f >= still ? { f0: id === 33 ? a - 40 : still, s: "NOT FOR SALE" } : undefined);
      sir(1.9, -3.6, { wave: wav(id === 33 && n > 30) });
      if (id === 33) { const u = clamp01(n / (end - a - 4)), x = 5.5 - 11 * u; person(out, cam, LUSTIG, x, 0, 1, { side: true, so: { mode: "march", phase: (u * 12) % 1 } }); fx1(out, "wallet", 260, 200, fxWallet, x - 0.3, 1.0, 0.9, 0.34, 0.2); }
      break;
    }
  }
  void chr; void sparkle; void pop;
  return out;
};
export const LUSTIG_LONG_SHOW: Show = { shots: SHOTS_LL, camAt: camAtLL, sceneAt: sceneAtLL, crowdFor: () => null, wheatAt: () => 1 };
export type { V3 };
