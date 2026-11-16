// A body drawn with a soft curved line and two flat tones, set by numbers: torso rows, limb widths, colours. Directions that differ in
// proportion and head (the long-shanks, the big head) use it with their own heads and details.
import { Ink, P2, seg, mid, shade, chain, add, sub, unit } from "../ink";
import { Sk, Side } from "../rig";
import { FigOpts, Face, frame, torsoPts, J, limb, handAt, shoe, sandal, layers, headPose, headToWorld, loaf, cane } from "./common";

type F = ReturnType<typeof frame>;
export type Body = { rows: number[][]; arm: number[]; armB?: number[]; leg: number[]; legB?: number[]; shoeW: number; shoeH?: [number, number]; neck: number };
export type Soft = {
  sir: Body; baker: Body;
  col: { coat: string; coatD: string; weave: string; trous: string; shoe: string; skin: string; skinD: string; shirt: string; tunic: string; apron: string; bakerSkin: string };
  heads: { sirFront: (k: Ink, f: Face, tx: number, lift: number) => void; sirSide: (k: Ink, f: Face, lift: number) => void; bakerFront: (k: Ink, f: Face, tx: number) => void; bakerSide: (k: Ink, f: Face) => void };
  /** the marks on Sir Digsworth's coat seen from the front and from the side (d = which way he faces), and what hangs behind him */
  front: (k: Ink, sk: Sk, F: F) => void; side?: (k: Ink, sk: Sk, F: F, d: number) => void; tail?: (k: Ink, sk: Sk, F: F, d: number, sideOn: boolean) => void;
  /** the chain: where it leaves the monocle and bows (head-local), and where it ends on the coat [to the left, above the pelvis] */
  chainFront: [P2, P2, P2]; chainSide: [P2, P2];
  turn: number; apronTop: number; apronHem: number; belt: number;
};

export const drawSoft = (c: Soft) => (k: Ink, sk: Sk, o: FigOpts) => {
  const baker = o.who === "baker", B = baker ? c.baker : c.sir, Fr = frame(sk), P = sk.P, f = o.face ?? {}, hp = headPose(sk), front = sk.cos > 0.35, d = Math.sign(sk.sin) || 1, sideOn = Math.abs(sk.sin) > 0.6;
  const skin = baker ? c.col.bakerSkin : c.col.skin, C = c.col;
  const leg = (s: Side) => {
    const pc = limb(J(sk, "hip", s), J(sk, "kn", s), J(sk, "an", s), B.leg, B.legB ?? [0, 5]), col = baker ? skin : C.trous;
    k.group(pc, col); for (const q of pc) k.shadeEdge(q, baker ? C.skinD : shade(col, 0.74), 9, 4);
    if (baker) sandal(k, sk, s, skin, "#7a4a2a", B.shoeW); else shoe(k, sk, s, C.shoe, B.shoeW, { hA: B.shoeH?.[0], hT: B.shoeH?.[1] });
  };
  const arm = (s: Side) => {
    const S = J(sk, "sh", s), E = J(sk, "el", s), W = J(sk, "wr", s), T = J(sk, "tip", s), kind = (s === "L" ? o.handL : o.handR) ?? "relaxed";
    const pc = limb(S, E, W, B.arm, B.armB ?? [0, 3]);
    if (baker) {
      k.group(pc, skin); for (const q of pc) k.shadeEdge(q, C.skinD, 8, 4);
      const cp = seg(S, mid(S, E, 0.5), B.arm[0] + 5, B.arm[0] + 3); k.group([cp], C.tunic); k.shadeEdge(cp, shade(C.tunic, 0.8), 9, 4);
      if (o.prop === "loaf" && s === "L") loaf(k, mid(W, T, 0.9), P.hand * 0.62);
    } else {
      k.group([seg(mid(E, W, 0.82), mid(E, W, 1.06), B.arm[2] * 0.82, B.arm[2] * 0.82, 0, 0.3, true)], C.shirt);
      k.group(pc, C.coat); for (const q of pc) { k.tweed(q, C.weave, S, 0, 15); k.shadeEdge(q, C.coatD, 10, 5); }
      if (o.prop === "cane" && s === "R") { const g = mid(W, T, 0.45), u = unit(sub(W, E)); cane(k, g, W[1] < sk.j.pelvis[1] ? add(g, u, P.fore * 1.4) : [g[0] + 14 * d, 0], 9); }
    }
    handAt(k, sk, s, kind, skin);
  };
  const torso = () => {
    if (B.neck) k.group([seg(Fr.T(0, P.spine - 14), sk.j.skull, B.neck, B.neck * 0.94)], skin);
    const t = torsoPts(sk, B.rows);
    if (baker) {
      k.shape(t, C.tunic, 0); k.shadeEdge(t, shade(C.tunic, 0.8), 20, 8);
      if (front) k.clip(t, () => k.shape([Fr.Q(-B.rows[3][1] * 0.6, 0, c.apronTop), Fr.Q(B.rows[3][1] * 0.6, 0, c.apronTop), Fr.Q(B.rows[0][1] * 0.66, 0, c.apronHem), Fr.Q(-B.rows[0][1] * 0.66, 0, c.apronHem)], C.apron, k.ol * 0.6));
      else if (sideOn) k.shadeEdge(t, C.apron, 26 * d, 0);
      k.clip(t, () => k.line([Fr.T(-260, c.belt), Fr.T(260, c.belt)], 12, "#8a5a3a", "butt"));
      k.shape(t, null); return;
    }
    k.shape(t, C.coat, 0); k.tweed(t, C.weave, Fr.o, Fr.tilt, 15); k.shadeEdge(t, C.coatD, 20, 8);
    if (front) k.clip(t, () => c.front(k, sk, Fr)); else if (sideOn) c.side?.(k, sk, Fr, d);
    k.shape(t, null);
  };
  const head = () => {
    k.at(sk.j.skull[0], sk.j.skull[1], sk.headTilt, hp.side && hp.flip, () => {
      if (baker) (hp.side ? c.heads.bakerSide(k, f) : c.heads.bakerFront(k, f, hp.turn * c.turn));
      else (hp.side ? c.heads.sirSide(k, f, o.capLift ?? 0) : c.heads.sirFront(k, f, hp.turn * c.turn, o.capLift ?? 0));
    });
    if (baker) return;
    const w = headToWorld(sk, hp.side && hp.flip);
    if (hp.side) { const a = w(c.chainSide[0]), b = Fr.T(c.chainSide[1][0] * d, c.chainSide[1][1]); chain(k, a, b, [(a[0] + b[0]) / 2 - 18 * d, (a[1] + b[1]) / 2 + 22]); }
    else chain(k, w([c.chainFront[0][0] + hp.turn * c.turn, c.chainFront[0][1]]), Fr.Q(c.chainFront[2][0], 0, c.chainFront[2][1]), w(c.chainFront[1]));
  };
  layers(sk, { arm, leg, torso, head, tail: () => { if (!baker) c.tail?.(k, sk, Fr, d, sideOn); } });
};

/** a briar pipe: a stem from the mouth and a bowl */
export const briar = (k: Ink, a: P2, b: P2, s = 1) => {
  k.line([a, b], 15 * s); k.line([a, b], 8 * s, "#3a2618");
  const bowl: P2[] = [[b[0] - 12 * s, b[1] - 34 * s], [b[0] + 26 * s, b[1] - 34 * s], [b[0] + 21 * s, b[1] + 9 * s], [b[0] - 8 * s, b[1] + 9 * s]];
  k.shape(bowl, "#6b3f22"); k.shadeEdge(bowl, "#4a2a16", 8 * s, 0); k.shape(bowl, null); k.line([bowl[0], bowl[1]], 7 * s, "#2c1a10");
};
