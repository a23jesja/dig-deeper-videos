// 2D puppets built from Jesper's figure kit (public/kit, cut by scripts/kit_cut.py).
// Two rigs share one skeleton: "sir" (Sir Digsworth's own torso, heads and gloves) and "base" (the plain stick
// figure, dressed from the wardrobe and tinted per scene). Heads, expressions, mouth shapes, hands and hats are
// swappable images; limbs are ink strokes solved from hand and foot targets, so every pose bends smoothly.
// `solve()` returns the screen boxes the layout check uses, so what is checked is what is drawn.
import React from "react";
import { Img, staticFile } from "remotion";
import parts from "./parts.json";

type Part = { w: number; h: number; cx?: number; cy?: number; r?: number; sleeves?: boolean; shoL?: number[]; shoR?: number[]; sleeveW?: number; sleeveCol?: number[]; neck?: number[] };
export const PARTS = parts as unknown as Record<string, Part>;
export const INK = "#16131a";
type P2 = [number, number];

/** units: 1 = roughly half a metre of cartoon; x right, y up, origin on the ground between the feet */
export const HEAD_R = 0.3, NECK = 1.5, HEAD_Y = 1.75, SHO_Y = 1.38, SHO_X = 0.22, HIP_Y = 0.74, HIP_X = 0.12, UA = 0.33, FA = 0.31, TH = 0.37, SH = 0.37, LW = 0.03;
export const FIG_H = HEAD_Y + HEAD_R; // bare-headed height

export type Look = {
  kind: "sir" | "base";
  garment?: string; tint?: string;          // wardrobe/garment_<name>, multiplied by this colour
  hat?: string; hatTint?: string; hatDy?: number;
  tash?: string; beard?: string; hair?: string; hairTint?: string;
  skin?: string;                             // tint of bare-arm mittens etc. (unused: mittens stay white)
  /** extra ink drawn on the torso, in units with the origin at the shoulder line centre (y down) */
  trim?: React.ReactNode;
};
export type HandShape = "rest" | "open" | "pointing" | "fist" | "waving" | "thumb";
export type Pose = {
  x: number; y: number; k: number;          // ground point on screen (px), pixels per unit
  lean?: number; bob?: number;               // degrees (+ = to screen right), units
  handL?: P2; handR?: P2;                    // hand targets in units (L = the arm on screen left)
  shapeL?: HandShape; shapeR?: HandShape; angL?: number; angR?: number; // hand picture and its direction (deg, 0 = right, -90 = up)
  footL?: P2; footR?: P2;                    // [x, lift]
  kneeDir?: number;                          // -1 / 1: both knees bend this way (side-on), default outwards
  head?: string;                             // head picture: sir: talk_*, expr_*, head_side; base: face_*, talk_*, head_front, head_side
  headTilt?: number; headFlip?: boolean; headDx?: number; headDy?: number;
  hatLift?: number;
  armsBehind?: boolean;
};

/** where the wrist is in each hand picture (fractions), which way the hand points there (deg, 0 = right, 90 = down),
 *  its size (longest side, units), and `side`: a hand drawn pointing sideways is mirrored by where it points (so the
 *  thumb stays up); the others are mirrored by which arm they sit on (so the thumb stays towards the body). */
const HANDS: Record<HandShape, { ax: number; ay: number; dir: number; size: number; side?: boolean }> = {
  rest: { ax: 0.62, ay: 0.1, dir: 108, size: 0.2 },
  open: { ax: 0.43, ay: 0.92, dir: -90, size: 0.29 },
  pointing: { ax: 0.08, ay: 0.52, dir: -4, size: 0.3, side: true },
  fist: { ax: 0.24, ay: 0.86, dir: -55, size: 0.22 },
  waving: { ax: 0.2, ay: 0.78, dir: -50, size: 0.36 },
  thumb: { ax: 0.1, ay: 0.68, dir: 0, size: 0.25, side: true },
};
/** hats: width in head radii, centre offset from the head centre in head radii (y down) */
export const HATS: Record<string, { w: number; dx?: number; dy: number }> = {
  officer: { w: 2.85, dy: -1.06 }, flatcap: { w: 2.7, dx: -0.1, dy: -0.98 }, bowler: { w: 3.05, dy: -0.92 }, top: { w: 2.9, dy: -1.3 }, brodie: { w: 3.1, dy: -0.9 },
  bobby: { w: 2.5, dy: -1.02 }, sailor: { w: 2.6, dy: -0.92 }, straw: { w: 3.5, dy: -0.85 }, crown: { w: 2.2, dy: -1.25 }, ushanka: { w: 2.9, dy: -0.72 }, scarf: { w: 2.75, dy: 0.28 }, knight: { w: 2.7, dy: -0.12 },
};
const FACE_HAIR: Record<string, { w: number; dy: number }> = {
  tash_handlebar: { w: 1.25, dy: 0.2 }, tash_thin: { w: 0.95, dy: 0.2 }, tash_walrus: { w: 1.25, dy: 0.22 }, beard_full: { w: 1.75, dy: 0.62 }, beard_goatee: { w: 1.3, dy: 0.72 },
  hair_short: { w: 2.3, dy: -0.72 }, hair_bun: { w: 2.5, dy: -0.55 }, hair_long: { w: 2.5, dy: 0.25 },
};

const ik = (a: P2, b: P2, l1: number, l2: number, pick: (j: P2, alt: P2) => boolean): { j: P2; end: P2 } => {
  let dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1e-6;
  const max = (l1 + l2) * 0.999;
  if (d > max) { dx *= max / d; dy *= max / d; d = max; }
  const end: P2 = [a[0] + dx, a[1] + dy], m = (l1 * l1 - l2 * l2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, l1 * l1 - m * m));
  const ux = dx / d, uy = dy / d, j1: P2 = [a[0] + ux * m - uy * h, a[1] + uy * m + ux * h], j2: P2 = [a[0] + ux * m + uy * h, a[1] + uy * m - ux * h];
  const j = pick(j1, j2) ? j1 : j2, mid: P2 = [a[0] + dx * (l1 / (l1 + l2)), a[1] + dy * (l1 / (l1 + l2))];
  // a limb within 8 % of its full length is drawn straight: the joint slides onto the line, so there is no kink
  let u = Math.min(1, Math.max(0, (max - d) / (0.08 * max))); u = u * u * (3 - 2 * u);
  return { j: [mid[0] + (j[0] - mid[0]) * u, mid[1] + (j[1] - mid[1]) * u], end };
};

const torsoOf = (l: Look) => (l.kind === "sir" ? "sir/torso" : l.garment ? `wardrobe/garment_${l.garment}` : null);
/** how the torso picture sits on the skeleton: px -> units, and where its shoulder line is */
const torsoFit = (l: Look) => {
  const key = torsoOf(l); if (!key) return null;
  const p = PARTS[key], f = l.kind === "sir" ? 1.04 : 1.12;
  const sl = p.sleeves && p.shoL && p.shoR ? { x0: p.shoL[0], x1: p.shoR[0], y: (p.shoL[1] + p.shoR[1]) / 2 } : { x0: p.w * 0.1, x1: p.w * 0.9, y: p.h * 0.1 };
  const s = (2 * SHO_X * f) / (sl.x1 - sl.x0);
  return { key, p, s, mx: (sl.x0 + sl.x1) / 2, sy: sl.y, shoHalf: SHO_X * f, sleeveW: p.sleeves ? (p.sleeveW ?? 40) * s : 0, bottom: SHO_Y + 0.03 - (p.h - sl.y) * s, half: (p.w * s) / 2 };
};

/** the figure's points on screen (px) and its boxes */
export const solve = (p: Pose, l: Look) => {
  const k = p.k, th = ((p.lean ?? 0) * Math.PI) / 180, bob = p.bob ?? 0;
  const S = (m: P2): P2 => [p.x + m[0] * k, p.y - m[1] * k];
  /** body space (rotates about the hips) -> units */
  const T = (u: number, v: number): P2 => [u * Math.cos(th) + (v - HIP_Y) * Math.sin(th), HIP_Y + bob - u * Math.sin(th) + (v - HIP_Y) * Math.cos(th)];
  const fit = torsoFit(l), sh = fit ? fit.shoHalf : SHO_X, sw = fit?.sleeveW ?? 0;
  const head = T(p.headDx ?? 0, HEAD_Y + (p.headDy ?? 0));
  const sho = [T(-sh + sw * 0.42, SHO_Y + 0.02 - sw * 0.5), T(sh - sw * 0.42, SHO_Y + 0.02 - sw * 0.5)];
  const hands = [p.handL ?? [-0.42, 0.77], p.handR ?? [0.42, 0.77]] as P2[];
  const arms = [0, 1].map((i) => {
    const s = i ? 1 : -1;
    const r = ik(sho[i], hands[i], UA, FA, (a, b) => (Math.abs(a[0] - b[0]) > 0.02 ? (a[0] - b[0]) * s > 0 : a[1] < b[1]));
    return { sho: sho[i], elb: r.j, hand: r.end };
  });
  const feet = [p.footL ?? [-0.125, 0], p.footR ?? [0.125, 0]] as P2[];
  const legs = [0, 1].map((i) => {
    const s = i ? 1 : -1, hj = T(s * HIP_X, HIP_Y), ank: P2 = [feet[i][0], feet[i][1] + 0.015];
    const dir = p.kneeDir ?? s;
    const r = ik(hj, ank, TH, SH, (a, b) => (a[0] - b[0]) * dir > 0);
    return { hip: hj, knee: r.j, ank: r.end };
  });
  const hat = l.kind === "base" && l.hat ? HATS[l.hat] : null, hp = hat ? PARTS[`wardrobe/hat_${l.hat}`] : null;
  // head picture box in units around the head centre (sir's cap is part of the picture)
  const hk = headKey(p, l), hpic = PARTS[hk], hs = HEAD_R / hpic.r!;
  let top = hpic.cy! * hs, left = hpic.cx! * hs, right = (hpic.w - hpic.cx!) * hs;
  if (hat && hp) { const w = hat.w * HEAD_R, h = (w * hp.h) / hp.w; top = Math.max(top, -hat.dy * HEAD_R + h / 2 + (p.hatLift ?? 0)); left = Math.max(left, w / 2 - (hat.dx ?? 0) * HEAD_R); right = Math.max(right, w / 2 + (hat.dx ?? 0) * HEAD_R); }
  const xs = [head[0] - left, head[0] + right, ...arms.flatMap((a) => [a.hand[0] - 0.12, a.hand[0] + 0.12, a.elb[0] - sw / 2, a.elb[0] + sw / 2]), ...legs.flatMap((g) => [g.ank[0] - 0.14, g.ank[0] + 0.14]), ...(fit ? [-fit.half, fit.half] : [])];
  const ys = [head[1] + top, ...arms.map((a) => a.hand[1] + 0.14)];
  const hsS = S(head), x0 = Math.min(...xs), x1 = Math.max(...xs), y1 = Math.max(...ys);
  return {
    k, th, S, T, fit, head: hsS, arms, legs, feet, headKey: hk,
    faceBox: { x: hsS[0] - HEAD_R * k, y: hsS[1] - HEAD_R * k, w: 2 * HEAD_R * k, h: 2 * HEAD_R * k },
    box: { x: p.x + x0 * k, y: p.y - y1 * k, w: (x1 - x0) * k, h: y1 * k },
  };
};
const headKey = (p: Pose, l: Look) => `${l.kind}/${p.head ?? (l.kind === "sir" ? "talk_closed" : "face_neutral")}`;

const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16) / 255);
const Tint: React.FC<{ id: string; color: string }> = ({ id, color }) => {
  const [r, g, b] = hex(color);
  return <filter id={id} colorInterpolationFilters="sRGB" x="0" y="0" width="1" height="1"><feColorMatrix type="matrix" values={`${r} 0 0 0 0  0 ${g} 0 0 0  0 0 ${b} 0 0  0 0 0 1 0`} /></filter>;
};
const mul = (c: number[] | undefined, t?: string) => { const a = c ?? [246, 244, 236], m = t ? hex(t) : [1, 1, 1]; return `rgb(${a.map((v, i) => Math.round(v * m[i])).join(",")})`; };

let uid = 0;
/** one puppet. `part`: "all", or "hands" to draw only the hands again on top of something held */
export const Puppet: React.FC<{ p: Pose; l: Look; part?: "all" | "hands" }> = ({ p, l, part = "all" }) => {
  const g = solve(p, l), k = g.k, id = React.useMemo(() => `k${uid++}`, []);
  const px = (m: P2) => g.S(m).map((v) => v.toFixed(1)).join(" ");
  const fit = g.fit, deg = p.lean ?? 0;
  const sleeveCol = fit ? mul(fit.p.sleeveCol, l.kind === "base" ? l.tint : undefined) : "";
  const hand = (a: (typeof g.arms)[number], i: number) => {
    const shape = (i ? p.shapeR : p.shapeL) ?? "rest", h = HANDS[shape], key = `${l.kind === "sir" && shape !== "rest" ? "sir" : "base"}/hand_${shape}`, im = PARTS[key];
    const [wx, wy] = g.S(a.hand), [ex, ey] = g.S(a.elb), fore = (Math.atan2(wy - ey, wx - ex) * 180) / Math.PI;
    const want = (i ? p.angR : p.angL) ?? (shape === "thumb" ? (i ? 0 : 180) : fore);
    const mir = h.side ? Math.cos((want * Math.PI) / 180) < 0 : i === 1, dir = mir ? 180 - h.dir : h.dir, s = (h.size * k) / Math.max(im.w, im.h);
    return <g key={`h${i}`} transform={`translate(${wx} ${wy}) rotate(${want - dir}) scale(${mir ? -s : s} ${s}) translate(${-h.ax * im.w} ${-h.ay * im.h})`}><image href={staticFile(`kit/${key}.png`)} width={im.w} height={im.h} /></g>;
  };
  if (part === "hands") return <g>{g.arms.map(hand)}</g>;
  const arm = (a: (typeof g.arms)[number], i: number) => {
    const d = `M${px(a.sho)} L${px(a.elb)} L${px(a.hand)}`, sw = (fit?.sleeveW ?? 0) * k;
    // the sleeve stops a little before the wrist; the bare line shows there
    const cut: P2 = [a.elb[0] + (a.hand[0] - a.elb[0]) * 0.94, a.elb[1] + (a.hand[1] - a.elb[1]) * 0.94], ds = `M${px(a.sho)} L${px(a.elb)} L${px(cut)}`;
    return (<g key={i}>
      <path d={d} stroke={INK} strokeWidth={LW * k} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {sw > 0 && <><path d={ds} stroke={INK} strokeWidth={sw + 0.03 * k} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d={ds} stroke={sleeveCol} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d={`M${px(a.elb)} L${px(cut)}`} stroke="rgba(0,0,0,0.13)" strokeWidth={sw} strokeLinecap="butt" fill="none" /></>}
      {hand(a, i)}
    </g>);
  };
  const hk = g.headKey, hp = PARTS[hk], hs = (HEAD_R * k) / hp.r!;
  const hat = l.kind === "base" && l.hat ? HATS[l.hat] : null, hatP = hat ? PARTS[`wardrobe/hat_${l.hat}`] : null;
  const R = HEAD_R * k;
  const stick = (n: string, tint: string | undefined, w: number, dy: number, dx = 0, lift = 0) => {
    const im = PARTS[`wardrobe/${n}`], ww = w * R, hh = (ww * im.h) / im.w;
    return <image key={n} href={staticFile(`kit/wardrobe/${n}.png`)} x={-ww / 2 + dx * R} y={dy * R - hh / 2 - lift * k} width={ww} height={hh} filter={tint ? `url(#${id}${n})` : undefined} />;
  };
  const hipS = g.S(g.T(0, HIP_Y)), shoS = g.S(g.T(0, SHO_Y + 0.03));
  return (
    <g>
      <defs>
        {l.tint && <Tint id={`${id}g`} color={l.tint} />}
        {l.hat && l.hatTint && <Tint id={`${id}hat_${l.hat}`} color={l.hatTint} />}
        {l.hairTint && [l.tash, l.beard, l.hair].filter(Boolean).map((n) => <Tint key={n} id={`${id}${n}`} color={l.hairTint!} />)}
      </defs>
      <ellipse cx={p.x} cy={p.y + 0.01 * k} rx={0.42 * k} ry={0.055 * k} fill="rgba(20,12,8,0.28)" />
      {p.armsBehind && g.arms.map(arm)}
      {g.legs.map((lg, i) => (<g key={i}>
        <path d={`M${px(lg.hip)} L${px(lg.knee)} L${px(lg.ank)}`} stroke={INK} strokeWidth={LW * k} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d={`M${px(lg.ank)} l${(p.kneeDir ?? (i ? 1 : -1)) * 0.11 * k} ${0.012 * k}`} stroke={INK} strokeWidth={LW * k} strokeLinecap="round" />
      </g>))}
      <g transform={`translate(${hipS[0]} ${hipS[1]}) rotate(${deg}) scale(${k})`} stroke={INK} strokeWidth={LW} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d={`M${-SHO_X} ${-(SHO_Y - HIP_Y)} L0 ${-(NECK - 0.06 - HIP_Y)} L${SHO_X} ${-(SHO_Y - HIP_Y)} M0 ${-(NECK - 0.06 - HIP_Y)} L0 0 M${-HIP_X} 0 L${HIP_X} 0`} />
        {!fit && <rect x={-0.05} y={-(NECK + 0.03 - HIP_Y)} width={0.1} height={0.1} rx={0.015} fill="#f4f1ea" strokeWidth={0.018} />}
      </g>
      {fit && (
        <g transform={`translate(${shoS[0]} ${shoS[1]}) rotate(${deg}) scale(${fit.s * k})`}>
          <image href={staticFile(`kit/${fit.key}.png`)} x={-fit.mx} y={-fit.sy} width={fit.p.w} height={fit.p.h} filter={l.kind === "base" && l.tint ? `url(#${id}g)` : undefined} />
          {l.trim && <g transform={`scale(${1 / fit.s})`}>{l.trim}</g>}
        </g>
      )}
      <g transform={`translate(${g.head[0]} ${g.head[1]}) rotate(${deg + (p.headTilt ?? 0)})`}>
        {l.kind === "base" && l.hair === "hair_long" && stick("hair_long", l.hairTint, FACE_HAIR.hair_long.w, FACE_HAIR.hair_long.dy)}
        <g transform={`scale(${p.headFlip ? -hs : hs} ${hs}) translate(${-hp.cx!} ${-hp.cy!})`}><image href={staticFile(`kit/${hk}.png`)} width={hp.w} height={hp.h} /></g>
        {l.kind === "base" && <g transform={p.headFlip ? "scale(-1 1)" : undefined}>
          {l.beard && stick(l.beard, l.hairTint, FACE_HAIR[l.beard].w, FACE_HAIR[l.beard].dy)}
          {l.tash && stick(l.tash, l.hairTint, FACE_HAIR[l.tash].w, FACE_HAIR[l.tash].dy)}
          {l.hair && l.hair !== "hair_long" && stick(l.hair, l.hairTint, FACE_HAIR[l.hair].w, FACE_HAIR[l.hair].dy)}
          {hat && hatP && stick(`hat_${l.hat}`, l.hatTint, hat.w, hat.dy + (l.hatDy ?? 0), hat.dx ?? 0, p.hatLift ?? 0)}
        </g>}
      </g>
      {!p.armsBehind && g.arms.map(arm)}
    </g>
  );
};

/** hidden <Img> tags make Remotion wait until every kit picture a film uses is loaded */
export const KitPreload: React.FC<{ keys?: string[] }> = ({ keys }) => (
  <div style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", opacity: 0 }}>
    {(keys ?? Object.keys(PARTS).filter((n) => !/full_|view_|pose_|mouthhead_|body_/.test(n))).map((n) => <Img key={n} src={staticFile(`kit/${n}.png`)} style={{ width: 1, height: 1 }} />)}
  </div>
);

/** mouth shape for a moment in a spoken word (rough, from the letters): which talk_* head to show */
export type Mouth = "closed" | "slight" | "open" | "wide" | "oo" | "smile";
export const mouthOf = (word: string, u: number): Mouth => {
  const w = word.toLowerCase().replace(/[^a-z]/g, ""); if (!w) return "closed";
  const syl = w.match(/[^aeiouy]*[aeiouy]+|[^aeiouy]+$/g) ?? [w], n = syl.length * 2, i = Math.min(n - 1, Math.floor(u * n)), s = syl[Math.floor(i / 2)], open = i % 2 === 1 || syl.length === 1 && u > 0.25 && u < 0.8;
  const v = (s.match(/[aeiouy]+/) ?? [""])[0];
  if (!open) return /^[mbp]/.test(s) ? "closed" : /^[fv]/.test(s) ? "slight" : /^[wrq]/.test(s) ? "oo" : "slight";
  if (!v) return "slight";
  return /^(oo|ou|u|ow|o)/.test(v) ? (v.startsWith("o") && v.length === 1 ? "open" : "oo") : /^(a|au|ai)/.test(v) ? "wide" : /^(ee|i|y)/.test(v) ? "smile" : "open";
};
