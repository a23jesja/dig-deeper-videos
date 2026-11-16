// Step C: the motion library played by the chosen figure.
//   SirTest  (1080 x 1920, about 15 s): Sir Digsworth walks in from the side, turns, points, says a line, flinches, runs out and
//            stumbles. The ground tiles and the things on it are fixed in the world, so a foot that slid would show against them.
//   SirMoves (2600 x 1900): one cell per motion of the library, three moments of each.
// PROPS='{"audio":false}' node scripts/stills.mjs SirTest out/craft/st_ 0-440:15 0.25 jpeg
// npx remotion render src/index.ts SirTest out/craft/sir-test.mp4 --gl=angle --codec h264 --crf 20 --scale 0.5
import React from "react";
import { AbsoluteFill, Audio, Sequence, getInputProps, staticFile, useCurrentFrame } from "remotion";
import { Ink, hand, HandKind } from "./ink";
import { solve, Sk } from "./rig";
import { Mover, Sample, blink, mouthAt, shake } from "./motion";
import { SIR_D, LADY_D, BAKER_D, SIR } from "./looks";
import type { Design, FigOpts } from "./designs/common";
import { SIR_TEST, SIR_TEST_FRAMES, sirTestCam, sirTestZoom, sirTestHat, VIEW, WORDS, SAY, TFPS, T_OFF, W } from "./sirTest";
import { drawHat } from "./cast";
export { SIR_TEST_FRAMES, TFPS };

type G = CanvasRenderingContext2D;
export const TW = 1080, TH = 1920;

/** draw a figure from a motion sample with its soles at the screen point (x, y) */
const play = (g: G, D: Design, s: Sample, x: number, y: number, sc: number, t: number, extra: FigOpts = {}, talk = 0, under?: (g: G, sk: Sk) => void, over?: (g: G, sk: Sk) => void) => {
  const P = D.props("sir"), LL = P.thigh + P.shin;
  const sk = solve(P, s.pose, s.yaw);
  g.save(); g.translate(x, y - s.y * LL * sc); g.scale(sc, sc);
  under?.(g, sk);
  D.draw(new Ink(g, D.ol), sk, { handL: s.handL, handR: s.handR, sway: s.sway, capLift: Math.min(0.45, Math.max(0, Math.abs(s.drag) - 1.6) * 0.16), ...extra,
    face: { ...s.face, lid: Math.max(s.face.lid ?? 0.16, blink(t, 3)), mouth: Math.max(s.face.mouth ?? 0, talk), ...extra.face } });
  over?.(g, sk);
  g.restore();
};

// ---------------- the test clip ----------------
const S = SIR_TEST;
/** caption chunks: two or three words, never wider than the picture */
const CAPS: { a: number; b: number; t: string }[] = (() => {
  const out: { a: number; b: number; t: string }[] = []; let cur: W[] = [];
  const flush = () => { if (cur.length) out.push({ a: cur[0].a, b: cur[cur.length - 1].b + 0.1, t: cur.map((q) => q.w).join(" ") }); cur = []; };
  for (const w of WORDS) { if (cur.length && (cur.length >= 3 || [...cur, w].map((q) => q.w).join(" ").length > 13 || /[.!?]$/.test(cur[cur.length - 1].w))) flush(); cur.push(w); }
  flush(); return out;
})();

export const SirTest: React.FC = () => {
  const fr = useCurrentFrame(), p = getInputProps() as { audio?: boolean; marks?: boolean; mix?: boolean };
  const D = SIR_D, P = D.props("sir"), LL = P.thigh + P.shin, sc = VIEW.sc, px = LL * sc, FY = VIEW.FY, CX = VIEW.CX;
  return (
    <AbsoluteFill style={{ background: "#9fd4f7" }}>
      <canvas width={TW} height={TH} ref={(cv) => {
        if (!cv) return;
        const g = cv.getContext("2d")!, t = fr / TFPS + T_OFF, s = S.m.sample(t), sb = S.b.sample(t);
        // the camera follows him a little late, and shakes when the mountain goes off
        const camX = sirTestCam(t), sk2 = shake(t, [{ t: S.boom, amp: 1, dur: 0.55 }, ...S.m.cues().filter((q) => q.k === "thud").map((q) => ({ t: q.t, amp: 0.5, dur: 0.3 }))]);
        const X = (xw: number, par = 1) => CX + (xw - camX * par) * px;
        // the zoom is about the point on the ground in the middle of the picture
        const zm = sirTestZoom(t); g.setTransform(zm, 0, 0, zm, CX * (1 - zm) + sk2[0], FY * (1 - zm) + sk2[1]);
        const sky = g.createLinearGradient(0, 0, 0, FY); sky.addColorStop(0, "#58b4f2"); sky.addColorStop(1, "#d9f1ff"); g.fillStyle = sky; g.fillRect(-400, -500, TW + 800, FY + 500);
        // the mountain far away, on the side he points to; it smokes from the moment he speaks and blows when he flinches
        const mx = CX + 380 - camX * px * 0.1, MY = FY - 900, smoke = Math.max(0, t - S.sayAt + 0.6), big = Math.max(0, t - S.boom);
        g.fillStyle = "#6fb05a"; g.strokeStyle = "#33241b"; g.lineWidth = 6; g.beginPath(); g.moveTo(mx - 620, FY - 130); g.lineTo(mx - 70, MY); g.lineTo(mx + 70, MY); g.lineTo(mx + 560, FY - 130); g.closePath(); g.fill(); g.stroke();
        g.fillStyle = "#a89c86"; g.beginPath(); g.moveTo(mx - 190, MY + 170); g.lineTo(mx - 70, MY); g.lineTo(mx + 70, MY); g.lineTo(mx + 180, MY + 170); g.closePath(); g.fill(); g.stroke();
        // smoke (flat grey puffs: a stand-in until the world of step D), in open sky beside him, never behind his head
        for (let i = 0; i < 9; i++) { const life = smoke * 0.5 - i * 0.22; if (life <= 0) continue; const bg = Math.min(big, 1.6), r = 34 + i * 7 + bg * (10 + i * 5), y = MY - 10 - Math.min(life, 2.6) * (70 + bg * 40) - i * 30; g.fillStyle = i % 2 ? "#8e8a92" : "#a7a3ab"; g.beginPath(); g.arc(mx + Math.sin(i * 2.1) * (26 + bg * 26) + life * 10, y, r, 0, 7); g.fill(); g.lineWidth = 5; g.stroke(); }
        // a wall and the ground: tiles fixed in the world
        g.fillStyle = "#f0dfb6"; g.fillRect(-400, FY - 150, TW + 800, 150); g.fillStyle = "#c8402f"; g.fillRect(-400, FY - 70, TW + 800, 70); g.lineWidth = 6; g.strokeRect(-400, FY - 150, TW + 800, 150);
        g.fillStyle = "#d9c79c"; g.fillRect(-400, FY, TW + 800, TH - FY + 400);
        for (let i = -40; i < 40; i++) { const x0 = X(i * 0.5), x1 = X((i + 1) * 0.5); if (x1 < -400 || x0 > TW + 400) continue; g.fillStyle = i % 2 ? "#cdb98c" : "#e3d3aa"; g.fillRect(x0, FY, x1 - x0, 84); g.strokeStyle = "#8f7d55"; g.lineWidth = 4; g.strokeRect(x0, FY, x1 - x0, 84); }
        g.strokeStyle = "#33241b"; g.lineWidth = 6; g.beginPath(); g.moveTo(-400, FY); g.lineTo(TW + 400, FY); g.stroke();
        // two things standing on the ground: a milestone and a jar
        const stone = X(-2.6); g.fillStyle = "#b9b6ae"; g.beginPath(); g.moveTo(stone - 46, FY); g.lineTo(stone - 40, FY - 190); g.quadraticCurveTo(stone, FY - 240, stone + 40, FY - 190); g.lineTo(stone + 46, FY); g.closePath(); g.fill(); g.stroke();
        g.fillStyle = "#33241b"; g.font = "700 40px Georgia"; g.textAlign = "center"; g.fillText("IX", stone, FY - 110);
        const jar = X(1.55); g.fillStyle = "#d2693a"; g.beginPath(); g.moveTo(jar - 30, FY); g.quadraticCurveTo(jar - 96, FY - 120, jar - 34, FY - 210); g.lineTo(jar - 40, FY - 250); g.lineTo(jar + 40, FY - 250); g.lineTo(jar + 34, FY - 210); g.quadraticCurveTo(jar + 96, FY - 120, jar + 30, FY); g.closePath(); g.fill(); g.stroke();
        if (p.marks) for (const side of ["L", "R"] as const) { const f = s.feet[side]; g.fillStyle = f[2] ? "#c0353a" : "#3b6fb5"; g.fillRect(X(f[0]) - 4, FY + 96 + (side === "L" ? 0 : 16), 8, 14); }
        // soft shadows under the figures (soft, so that they are not taken for a joint between two tiles)
        const shadow = (x: number, y: number) => { const gr = g.createRadialGradient(x, y, 4, x, y, 150); gr.addColorStop(0, "rgba(60,40,20,0.3)"); gr.addColorStop(1, "rgba(60,40,20,0)"); g.save(); g.translate(0, y); g.scale(1, 0.16); g.translate(0, -y); g.fillStyle = gr; g.beginPath(); g.arc(x, y, 150, 0, 7); g.fill(); g.restore(); };
        const talking = t >= S.sayAt && t < S.sayAt + SAY, LLb = (BAKER_D.props("sir").thigh + BAKER_D.props("sir").shin) * VIEW.bakerSc, hat = sirTestHat(t);
        // the baker flees through the picture on the same motions, a step further from the lens
        shadow(CX + (sb.x * LLb / px - camX) * px, FY + VIEW.bakerDY + 4); play(g, BAKER_D, sb, CX + (sb.x * LLb / px - camX) * px, FY + VIEW.bakerDY, VIEW.bakerSc, t + 1.3);
        shadow(X(s.x), FY + 8);
        play(g, D, s, X(s.x), FY, sc, t, { hatOff: !hat.on }, talking ? mouthAt(WORDS, t - S.sayAt) : 0);
        // the cap, when it has left his head: it flies ahead of him in the fall, lands beside him, and he picks it up as he rises
        if (!hat.on) { g.save(); g.translate(hat.x, FY - hat.y); g.rotate((hat.rot * Math.PI) / 180); g.scale(sc, sc); drawHat(new Ink(g, D.ol), SIR, s.yaw); g.restore(); }
        // captions: two or three words in the lower third, across the shins (clear of face, chest and hands, and of the bottom 15 % that the Shorts interface covers)
        const c = CAPS.find((q) => t - S.sayAt >= q.a - 0.03 && t - S.sayAt < q.b);
        if (c) { g.setTransform(1, 0, 0, 1, 0, 0); g.font = "900 96px 'Arial Black', Arial"; g.textAlign = "center"; g.lineJoin = "round"; g.lineWidth = 22; g.strokeStyle = "#101014"; g.strokeText(c.t.toUpperCase().replace(/[.,]/g, ""), CX, 1470); g.fillStyle = "#ffffff"; g.fillText(c.t.toUpperCase().replace(/[.,]/g, ""), CX, 1470); }
        g.setTransform(1, 0, 0, 1, 0, 0);
      }} />
      {/* the mixed track (steps, blast, wind and the voice, from audio/craft_sfx.py); mix: false plays the voice alone */}
      {p.audio !== false && (p.mix === false ? <Sequence from={Math.round((S.sayAt - T_OFF) * TFPS)}><Audio src={staticFile("craft/kit-test.wav")} /></Sequence> : <Audio src={staticFile("craft/sir-test.wav")} />)}
    </AbsoluteFill>
  );
};

// ---------------- the sheet of motions ----------------
type Cell = { name: string; make: () => [Mover, number[]]; D?: Design; under?: (g: G, sk: Sk) => void; over?: (g: G, sk: Sk) => void };
const LN = "#33241b";
const boxAt = (g: G, x: number, y: number, w: number, h: number, col: string) => { g.fillStyle = col; g.strokeStyle = LN; g.lineWidth = 9; g.fillRect(x - w / 2, y - h, w, h); g.strokeRect(x - w / 2, y - h, w, h); };
const midHands = (sk: Sk): [number, number] => [(sk.j.tipL[0] + sk.j.tipR[0]) / 2, (sk.j.wrL[1] + sk.j.wrR[1]) / 2];
const PROPS: Record<string, Pick<Cell, "under" | "over">> = {
  sit: { under: (g, sk) => boxAt(g, sk.j.pelvis[0] - 30, 0, 230, -sk.j.pelvis[1] - 30, "#b0703c") },
  climb: { under: (g, sk) => { const x = sk.j.wrL[0] + 30; g.strokeStyle = LN; g.lineWidth = 34; for (const dx of [-90, 90]) { g.beginPath(); g.moveTo(x + dx, 400); g.lineTo(x + dx, -1900); g.stroke(); } g.strokeStyle = "#b0703c"; g.lineWidth = 20; for (const dx of [-90, 90]) { g.beginPath(); g.moveTo(x + dx, 400); g.lineTo(x + dx, -1900); g.stroke(); } for (let y = 300; y > -1900; y -= 170) { g.strokeStyle = LN; g.lineWidth = 26; g.beginPath(); g.moveTo(x - 90, y); g.lineTo(x + 90, y); g.stroke(); g.strokeStyle = "#c98a4c"; g.lineWidth = 13; g.beginPath(); g.moveTo(x - 90, y); g.lineTo(x + 90, y); g.stroke(); } } },
  carry: { over: (g, sk) => { const [x, y] = midHands(sk); boxAt(g, x, y + 60, 210, 170, "#c98a4c"); g.beginPath(); g.moveTo(x - 105, y - 25); g.lineTo(x + 105, y - 25); g.stroke(); } },
  pour: { over: (g, sk) => { const [x, y] = [sk.j.tipR[0], sk.j.wrR[1]]; g.save(); g.translate(x, y); g.rotate(0.9); g.fillStyle = "#d2693a"; g.strokeStyle = LN; g.lineWidth = 9; g.beginPath(); g.moveTo(-50, -70); g.lineTo(50, -70); g.lineTo(64, 60); g.lineTo(-64, 60); g.closePath(); g.fill(); g.stroke(); g.restore(); g.strokeStyle = "#5aa9e6"; g.lineWidth = 16; g.beginPath(); g.moveTo(x + 86, y + 6); g.quadraticCurveTo(x + 130, y + 120, x + 126, y + 330); g.stroke(); } },
  pull: { under: (g, sk) => { const [x, y] = midHands(sk); g.strokeStyle = LN; g.lineWidth = 20; g.beginPath(); g.moveTo(x - 60, y); g.lineTo(x + 900, y - 60); g.stroke(); g.strokeStyle = "#d9c08a"; g.lineWidth = 10; g.beginPath(); g.moveTo(x - 60, y); g.lineTo(x + 900, y - 60); g.stroke(); } },
};
const from = (f: (m: Mover) => number[] | void, at: number[] = []): (() => [Mover, number[]]) => () => { const m = new Mover([0, 0], 90), r = f(m); return [m, (r as number[] | undefined) ?? at]; };
const CELLS: Cell[] = [
  { name: "GÅ", make: from((m) => { m.walk(3); }, [1.05, 1.3, 1.55]) },
  { name: "SPRINGA", make: from((m) => { m.run(5); }, [0.7, 0.85, 1.0]) },
  { name: "STANNA (LITEN ÖVERSLÄNG)", make: from((m) => { m.run(3); const e = m.end; m.stand(0.5); return [e - 0.5, e - 0.2, e + 0.1]; }) },
  { name: "VÄNDA SIG", make: from((m) => { m.stand(0.1).turn(-180); return [0.12, 0.45, 0.85]; }) },
  { name: "SNUBBLA", make: from((m) => { m.run(2); const e = m.end; m.stumble(); return [e + 0.1, e + 0.3, e + 0.6]; }) },
  { name: "FALLA", make: from((m) => { m.run(2).stumble(); const e = m.end; m.fall(0.6); return [e + 0.08, e + 0.22, e + 0.6]; }) },
  { name: "RESA SIG", make: from((m) => { m.run(2).stumble().fall(0.5); const e = m.end; m.getup(); return [e + 0.1, e + 0.45, e + 0.85]; }) },
  { name: "DUCKA", make: from((m) => { m.stand(0.2).act("duck", 0.9); return [0.26, 0.45, 0.8]; }) },
  { name: "BÄRA", make: from((m) => { m.act("carry", 3, { wait: false }).stand(0.4).walk(2.4); return [0.9, 1.2, 1.5]; }), ...PROPS.carry },
  { name: "KASTA (ANSATS, KAST)", make: from((m) => { m.stand(0.2).act("windup", 0.5, { out: 0.12 }).act("release", 0.5, { in: 0.12, antic: 0 }); return [0.5, 0.78, 0.95]; }) },
  { name: "PEKA", make: from((m) => { m.stand(0.2).act("point", 1); return [0.24, 0.4, 0.9]; }) },
  { name: "RYGGA TILLBAKA", make: from((m) => { m.stand(0.2).step("L", -0.25, 0.18).act("recoil", 0.9, { in: 0.15, over: 2.4 }); return [0.25, 0.4, 0.8]; }) },
  { name: "KLÄTTRA", make: from((m) => { m.stand(0.1).climb(1.1, 4); return [0.3, 0.75, 1.2]; }), ...PROPS.climb },
  { name: "SITTA", make: from((m) => { m.stand(0.2).act("sit", 1.2, { in: 0.4 }); return [0.3, 0.5, 1.0]; }), ...PROPS.sit },
  { name: "HÄLLA", make: from((m) => { m.stand(0.2).act("pour", 1.2, { in: 0.4 }); return [0.3, 0.5, 1.0]; }), ...PROPS.pour },
  { name: "DRA", make: from((m) => { m.stand(0.2).step("R", 0.3, 0.2).act("pull", 1.2, { in: 0.35 }); return [0.3, 0.55, 1.0]; }), ...PROPS.pull },
  { name: "KJOL FÖLJER MED (BIFIGUR)", make: from((m) => { m.walk(2.2); const e = m.end; m.stand(0.4); return [0.9, e - 0.15, e + 0.12]; }), D: LADY_D },
  { name: "HANDFORMER", make: from((m) => { m.stand(1); }, [0.5]) },
];
export const MVW = 2600, MVH = 1900;
export const SirMoves: React.FC = () => (
  <AbsoluteFill style={{ background: "#ecdfc2" }}>
    <canvas width={MVW} height={MVH} ref={(cv) => {
      if (!cv) return;
      const g = cv.getContext("2d")!; g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = "#ecdfc2"; g.fillRect(0, 0, MVW, MVH);
      const cols = 6, cw = MVW / cols, chh = MVH / 3, sc = 0.3;
      CELLS.forEach((c, n) => {
        const x0 = (n % cols) * cw, y0 = Math.floor(n / cols) * chh, FY = y0 + chh - 96, D = c.D ?? SIR_D, P = D.props("sir"), LL = (P.thigh + P.shin) * sc, [m, ts] = c.make();
        g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = "#cfbb90"; g.fillRect(x0 + 10, FY, cw - 20, 16);
        if (n === CELLS.length - 1) {
          const k = new Ink(g, 5); k.ink = LN;
          ([["open", "ÖPPEN"], ["fist", "KNUTEN"], ["point", "PEKANDE"], ["grip", "GREPPANDE"], ["relaxed", "HÅLLANDE, VILA"]] as [HandKind, string][]).forEach(([hk, t], i) => {
            const cx = x0 + 80 + (i % 3) * 140 + (i > 2 ? 70 : 0), cy = y0 + 190 + Math.floor(i / 3) * 190;
            g.setTransform(1, 0, 0, 1, 0, 0); hand(k, [cx - 30, cy], -18, 96, hk, "#f6cfa6", false, false, 5);
            g.font = "700 17px Arial"; g.textAlign = "center"; g.fillStyle = "#3b2a1a"; g.fillText(t, cx + 14, cy + 78);
          });
        } else {
          const xs = ts.map((t) => m.sample(t).x), lo = Math.min(...xs), hi = Math.max(...xs), spread = Math.max(0, 0.86 - (hi - lo)) , mid = (lo + hi) / 2;
          ts.forEach((t, i) => { const s = m.sample(t), gap = (i - (ts.length - 1) / 2) * spread * 0.9, last = i === ts.length - 1; g.save(); g.beginPath(); g.rect(x0 + 6, y0 + 6, cw - 12, chh - 12); g.clip(); g.globalAlpha = last ? 1 : 0.55 + 0.2 * i; play(g, D, s, x0 + cw / 2 + (s.x - mid + gap) * LL * 1.0, FY, sc, t, {}, 0, last || c.under === PROPS.sit.under ? c.under : undefined, last ? c.over : undefined); g.restore(); });
        }
        g.setTransform(1, 0, 0, 1, 0, 0); g.font = "700 25px Arial"; g.textAlign = "center"; g.fillStyle = "#3b2a1a"; g.fillText(c.name, x0 + cw / 2, FY + 60);
        g.strokeStyle = "#c9b68a"; g.lineWidth = 2; g.strokeRect(x0 + 4, y0 + 4, cw - 8, chh - 8);
      });
    }} />
  </AbsoluteFill>
);
