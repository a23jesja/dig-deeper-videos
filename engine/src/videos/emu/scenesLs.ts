// What happens in every shot of the short "The Man Who Sold the Eiffel Tower" (Victor Lustig, 1925). Portrait; +x is screen-left.
import { Outfit, FrontOpts, INK } from "./toon";
import { fxRoadSign, fxBanner, fxBulb } from "./wltoon";
import { fxTalk } from "./pigtoon";
import { fxEiffel, fxForSale, fxNewspaper, fxLetter, fxCash, fxLiberty } from "./lustigtoon";
import { Stage, CamInfo, person, q, lidAt } from "./castbase";
import { FPS, ramp, clamp01 } from "./story";
import { Scene, Show, SIR } from "./scenes";
import { Who, man, card, tag, banner, sparkle, sweat } from "./scenesP";
import talkJson from "./talkLs.json";
import { SHOTS_LS, camAtLs, atS as at, ALS, TOWER } from "./storyLs";

const TALK = talkJson as number[];
const talk = (f: number) => TALK[Math.max(0, Math.min(TALK.length - 1, f))] ?? 0;
const T = (f: number) => f / FPS;
export const LUSTIG: Who = { i: 31, o: { jacket: "#30324a", pants: "#30324a", boots: INK, hat: "tophat", moustache: "#2b2026", buttons: "#e2bb4c" }, okey: "lustig" };
export const D1: Who = { i: 32, o: { jacket: "#6a5a48", pants: "#4a4038", boots: INK, hat: "cap", cap: "#4a4038", build: "stout", moustache: "#5b3a22", buttons: "#c9a94a" }, okey: "dealer1" };
export const D2: Who = { i: 33, o: { jacket: "#55606a", pants: "#3a4048", boots: INK, hat: "hair", hair: "#8a8a90", build: "stout", buttons: "#c9a94a" }, okey: "dealer2" };
export const POISSON: Who = { i: 34, o: { jacket: "#7a4a3a", pants: "#3f3a36", boots: INK, hat: "cap", cap: "#5a3a2c", moustache: "#5b3a22", skin: "#f5c9a0", buttons: "#c9a94a" }, okey: "poisson" };
export const GENDARME: Who = { i: 35, o: { jacket: "#22304f", pants: "#22304f", boots: INK, hat: "cap", cap: "#1c2740", moustache: "#2b2026", buttons: "#c9ccd2", sash: "#f4efe0" } as Outfit, okey: "gendarme" };
export const TW = 28, TH = 56;

export const talkB = (out: Stage, f: number, f0: number, s: string, x: number, y: number, z: number, w: number, flip = false) =>
  card(out, f, f0, `talk|${s}|${flip}`, 900, 460, (p) => fxTalk(p, s, flip), x, y, z, w);
/** the tower, far off; an optional tag hangs on it */
export const tower = (out: Stage, f: number, sale?: { f0: number; s: string; y?: number }) => {
  out.fx.push({ key: "eiffel", cw: 700, ch: 1400, draw: fxEiffel, x: TOWER[0], y: TH / 2, z: TOWER[2], w: TW, h: TH });
  if (sale) card(out, f, sale.f0, `sale|${sale.s}`, 420, 260, (p) => fxForSale(p, sale.s), TOWER[0], sale.y ?? 12.6, 60, sale.s.length > 10 ? 13 : 10.5);
};

export const sceneAtLs = (id: number, f: number, cam: CamInfo): Scene => {
  const out: Scene = { places: [], fx: [], guns: [], crates: [], fan: f * 0.07 };
  const t = T(f), a = ALS[id], n = f - a;
  const sir = (x: number, z: number, fo: FrontOpts = {}) => person(out, cam, SIR, x, 0, z, { fo: { mode: "stand", expr: "smile", blink: lidAt(t, 3), ...fo }, talk: talk(f) });
  const chr = (f0: number, ph = 0) => (f >= f0 ? q(0.7 + 0.3 * Math.sin(f * 0.5 + ph), 4) : undefined);
  switch (id) {
    case 1: case 2: {
      // the tower, a gentleman in a top hat, and a buyer with a case of money
      const sold = id === 2 || f >= at("hook1", "sold") - 2, ag = at("hook2", "again") - 3;
      tower(out, f, id === 2 && f >= ag ? { f0: ag, s: "FOR SALE AGAIN" } : sold ? { f0: at("hook1", "sold") - 2, s: "FOR SALE" } : undefined);
      if (id === 1) sir(0, -6.4);
      const pz = id === 1 ? -1 : 2;
      man(out, cam, LUSTIG, id === 1 ? 1.3 : 0.95, 0, pz, { expr: sold ? "grin" : "smile", look: -1 }, t);
      man(out, cam, id === 1 ? D1 : D2, id === 1 ? -1.3 : -0.95, 0, pz, { expr: sold ? "grin" : "smile", look: 1 }, t);
      if (sold) card(out, f, id === 1 ? at("hook1", "sold") - 2 : a - 40, "cash", 520, 380, fxCash, id === 1 ? -0.62 : -0.1, 0.95, pz - 0.15, 0.7);
      break;
    }
    case 3: {
      tower(out, f);
      man(out, cam, LUSTIG, 0, 0, 0, { expr: "grin" }, t);
      banner(out, f, at("who", "Victor") - 3, "CON MAN|VICTOR LUSTIG", 0, 2.72, 0, 1.55, "#fff3c4");
      break;
    }
    case 4: {
      // the newspaper: the tower costs too much to keep up
      const ex = at("news", "expensive") - 3, idea = at("news", "repaint") + 4;
      tower(out, f);
      if (f >= ex) card(out, f, ex, "costly", 1000, 260, (p) => fxBanner(p, "REPAIRS AND PAINT|TOO EXPENSIVE"), TOWER[0], 13.6, 60, 12);
      man(out, cam, LUSTIG, 0.45, 0, 2, { expr: f >= idea ? "grin" : "neutral", look: -1 }, t);
      out.fx.push({ key: "paper", cw: 420, ch: 520, draw: (p) => fxNewspaper(p), x: -0.2, y: 1.2, z: 1.8, w: 0.62, h: 0.77, rot: 0.06 });
      if (f >= idea) card(out, f, idea, "bulb", 200, 260, fxBulb, 0.45, 2.75, 2, 0.6);
      break;
    }
    case 5: case 6: case 7: case 10: {
      // the hotel: the "official", his letter, and the scrap dealers
      out.office = "minister";
      const inv = at("pose", "invited") - 4, pay = at("poisson", "paid") - 4, pol = at("again", "police") - 4, told = id === 10 && f >= pol;
      const slide = id === 5 ? 3.4 * (1 - ramp(f, inv, inv + 22)) : 0, here = id !== 5 || f >= inv;
      man(out, cam, LUSTIG, 2.6, 0, 0.5, { expr: told ? "shock" : id === 7 && f >= pay ? "grin" : "smile", look: -1 }, t);
      if (id === 5) { out.fx.push({ key: "letter", cw: 420, ch: 520, draw: (p) => fxLetter(p), x: 1.95, y: 1.25, z: 0.35, w: 0.56, h: 0.69, rot: -0.06 }); banner(out, f, at("pose", "government") - 3, "MINISTRY OF POSTS AND TELEGRAPHS|DEPUTY DIRECTOR-GENERAL", 1.7, 3.3, 0.5, 2.5, "#fff3c4"); }
      if (here) {
        const who = id === 10 ? [D2, D1] : [D1, POISSON, D2], xs = id === 10 ? [1.5, 0.6] : [2.2, 1.4, 0.6];
        who.forEach((w, k) => {
          const paying = id === 7 && w === POISSON, x = paying ? 1.5 : xs[k] - slide, z = paying ? 0.6 : 2.2;
          man(out, cam, w, x, 0, z, slide > 0.05 ? { mode: "march", phase: (n / 9 + k * 0.3) % 1, expr: "smile" } : { expr: told ? "shock" : id === 6 && f >= at("secret", "tower") - 2 ? "shock" : paying ? "grin" : "smile", look: 1 }, t);
        });
      }
      if (id === 6) talkB(out, f, at("secret", "tower") - 3, "The tower is|FOR SALE. Shh!", 1.6, 3.35, 0.5, 2.4, true);
      if (id === 7) {
        banner(out, f, at("poisson", "André") - 3, "SCRAP DEALER|ANDRÉ POISSON", 1.75, 2.75, 0.6, 1.7, "#fff3c4");
        card(out, f, pay, "cash", 520, 380, fxCash, 2.05, 1.0, 0.4, 0.62);
        tag(out, f, at("poisson", "70,000") - 2, "FRANCS", "70,000", 1.7, 3.65, 0.5, 1.5, "#dff0d0");
      }
      if (told) {
        const gx = 0.5 - 2.2 * (1 - ramp(f, pol, pol + 14));
        man(out, cam, GENDARME, gx, 0, 0.9, f < pol + 14 ? { mode: "march", phase: (n / 7) % 1, expr: "stern" } : { expr: "stern", look: 1, point: 0 }, t);
        talkB(out, f, pol + 10, "Police!", 1.15, 3.2, 0.9, 1.6);
      }
      break;
    }
    case 8: {
      // over the border with the money
      const u = clamp01(n / (SHOTS_LS[7].b - a - 4)), x = 2.4 - 4.8 * u;
      out.fx.push({ key: "rsAUSTRIA", cw: 400, ch: 640, draw: (p) => fxRoadSign(p, "AUSTRIA"), x: -0.5, y: 1.75, z: 2.8, w: 2.2, h: 3.5 });
      person(out, cam, LUSTIG, x, 0, 1, { side: true, so: { mode: "march", phase: (u * 9) % 1 } });
      out.fx.push({ key: "cash", cw: 520, ch: 380, draw: fxCash, x: x - 0.1, y: 0.8 + 0.05 * Math.sin(u * 56), z: 0.9, w: 0.55, h: 0.4 });
      break;
    }
    case 9: {
      // Poisson says nothing; the policeman never hears of it
      tower(out, f);
      man(out, cam, POISSON, 0.8, 0, 2, { expr: "pained", look: -1 }, t); sweat(out, f, 1.14, 1.9, 1.9);
      man(out, cam, GENDARME, -0.9, 0, 2.4, { expr: "whistle", look: -1 }, t);
      talkB(out, f, at("shame", "embarrassed") - 3, "...", 0.8, 2.75, 2, 1.1, true);
      break;
    }
    case 11: {
      // on the boat to America
      out.fx.push({ key: "liberty", cw: 420, ch: 900, draw: fxLiberty, x: 12.6, y: 15, z: 70, w: 14, h: 30 });
      man(out, cam, LUSTIG, 8, 3.76, 9.2, { expr: "grin", wave: q(Math.sin(f / 3.2), 4) }, t, false);
      out.fx.push({ key: "cash", cw: 520, ch: 380, draw: fxCash, x: 7.35, y: 3.76 + 0.3, z: 9.0, w: 0.6, h: 0.44 });
      break;
    }
    case 12: {
      const nv = at("end", "never") - 3;
      tower(out, f, f >= nv ? { f0: nv, s: "NOT FOR SALE" } : undefined);
      sir(0, -6.4, { shrug: f >= nv + 20 ? ramp(f, nv + 20, nv + 28) : undefined });
      sparkle(out, f, nv, TOWER[0], 13, 58, 5);
      break;
    }
  }
  void chr;
  return out;
};
export const LUSTIG_SHOW: Show = { shots: SHOTS_LS, camAt: camAtLs, sceneAt: sceneAtLs, crowdFor: () => null, wheatAt: () => 1 };
