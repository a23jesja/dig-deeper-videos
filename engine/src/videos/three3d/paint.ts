// Canvas textures for the Salon Carre scene: signs with text, wall, parquet, dado, the pale patch and the
// cartoon "old master" paintings that go into the CC0 frames. Everything is drawn from a seed: no clocks, no Math.random.
import * as THREE from "three";

export const rng = (seed: number) => () => {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 4294967296;
};

const cv = (w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] => {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  return [c, c.getContext("2d")!];
};
const tex = (c: HTMLCanvasElement, rx = 1, ry = 1) => {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (rx !== 1 || ry !== 1) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); }
  t.needsUpdate = true;
  return t;
};
const SERIF = "Georgia, 'Times New Roman', 'Book Antiqua', serif";

/** brass wall plate, two engraved lines */
export const plateTexture = () => {
  const W = 1024, H = 340, [c, g] = cv(W, H);
  const gr = g.createLinearGradient(0, 0, 0, H);
  gr.addColorStop(0, "#e9cf86"); gr.addColorStop(0.45, "#c9a24a"); gr.addColorStop(0.55, "#d9b860"); gr.addColorStop(1, "#a9812f");
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  const r = rng(7);
  g.globalAlpha = 0.07;
  for (let i = 0; i < 260; i++) { g.fillStyle = r() > 0.5 ? "#fff6d0" : "#5a3d10"; g.fillRect(0, r() * H, W, 1 + r() * 1.5); }
  g.globalAlpha = 1;
  g.strokeStyle = "#7a5a1c"; g.lineWidth = 10; g.strokeRect(5, 5, W - 10, H - 10);
  g.strokeStyle = "#f6e6a8"; g.lineWidth = 3; g.strokeRect(16, 16, W - 32, H - 32);
  for (const [x, y] of [[44, 44], [W - 44, 44], [44, H - 44], [W - 44, H - 44]]) {
    g.fillStyle = "#6b4d18"; g.beginPath(); g.arc(x, y, 13, 0, 7); g.fill();
    g.fillStyle = "#e8d08a"; g.beginPath(); g.arc(x - 2, y - 2, 9, 0, 7); g.fill();
    g.strokeStyle = "#5a3d10"; g.lineWidth = 3; g.beginPath(); g.moveTo(x - 7, y + 5); g.lineTo(x + 5, y - 7); g.stroke();
  }
  g.textAlign = "center"; g.textBaseline = "middle";
  const line = (s: string, y: number, px: number) => {
    g.font = `bold ${px}px ${SERIF}`;
    g.fillStyle = "rgba(255,244,200,0.75)"; g.fillText(s, W / 2 + 2, y + 3);
    g.fillStyle = "#24160a"; g.fillText(s, W / 2, y);
  };
  line("LEONARDO DA VINCI", 118, 84);
  g.fillStyle = "#24160a"; g.fillRect(W / 2 - 150, 176, 300, 5);
  line("LA JOCONDE", 244, 84);
  return tex(c);
};

/** painted room sign over the doorway */
export const salonSignTexture = () => {
  const W = 1024, H = 240, [c, g] = cv(W, H);
  g.fillStyle = "#12302b"; g.fillRect(0, 0, W, H);
  g.strokeStyle = "#d9b45a"; g.lineWidth = 10; g.strokeRect(14, 14, W - 28, H - 28);
  g.lineWidth = 3; g.strokeRect(30, 30, W - 60, H - 60);
  g.textAlign = "center"; g.textBaseline = "middle";
  g.font = `bold 118px ${SERIF}`;
  g.fillStyle = "#0a1a17"; g.fillText("SALON CARRÉ", W / 2 + 4, H / 2 + 9);
  g.fillStyle = "#edcc74"; g.fillText("SALON CARRÉ", W / 2, H / 2 + 4);
  return tex(c);
};

/** small enamel card on a stanchion */
export const cardTexture = () => {
  const W = 512, H = 300, [c, g] = cv(W, H);
  g.fillStyle = "#f3ead2"; g.fillRect(0, 0, W, H);
  g.strokeStyle = "#1c2a4a"; g.lineWidth = 12; g.strokeRect(10, 10, W - 20, H - 20);
  g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#1c2a4a";
  g.font = `bold 62px ${SERIF}`; g.fillText("DÉFENSE", W / 2, 100);
  g.fillText("DE TOUCHER", W / 2, 196);
  return tex(c);
};

/** red wall covering with a quiet damask repeat */
export const wallTexture = (base = "#93242a") => {
  const S = 512, [c, g] = cv(S, S);
  g.fillStyle = base; g.fillRect(0, 0, S, S);
  const motif = (x: number, y: number, s: number) => {
    g.save(); g.translate(x, y); g.scale(s, s);
    g.beginPath();
    g.moveTo(0, -70); g.bezierCurveTo(46, -40, 46, 20, 0, 62); g.bezierCurveTo(-46, 20, -46, -40, 0, -70);
    g.fill();
    g.beginPath(); g.ellipse(-52, 34, 20, 34, -0.6, 0, 7); g.ellipse(52, 34, 20, 34, 0.6, 0, 7); g.fill();
    g.beginPath(); g.arc(0, 92, 12, 0, 7); g.fill();
    g.restore();
  };
  g.fillStyle = "rgba(60,8,14,0.20)";
  for (const [x, y] of [[128, 128], [384, 384], [128, 640], [640, 128], [-128, 384], [384, -128]]) motif(x, y, 1);
  g.fillStyle = "rgba(255,170,150,0.07)";
  for (const [x, y] of [[384, 128], [128, 384], [-128, 128], [640, 384]]) motif(x, y + 6, 0.62);
  const r = rng(11);
  for (let i = 0; i < 2500; i++) { g.fillStyle = `rgba(${r() > 0.5 ? "255,200,190" : "40,0,6"},0.05)`; g.fillRect(r() * S, r() * S, 2, 2 + r() * 5); }
  return c;
};
export const wallMap = (rx: number, ry: number, base?: string) => tex(wallTexture(base), rx, ry);

/** chevron parquet */
export const parquetMap = (rx: number, ry: number) => {
  const S = 1024, [c, g] = cv(S, S), r = rng(23);
  g.fillStyle = "#a8743c"; g.fillRect(0, 0, S, S);
  const cols = 4, cw = S / cols, pw = 32; // plank width along the slanted direction
  for (let k = 0; k < cols; k++) {
    g.save(); g.beginPath(); g.rect(k * cw, 0, cw, S); g.clip();
    const dir = k % 2 ? 1 : -1;
    for (let i = -cw / pw - 2; i < S / pw + 2; i++) {
      const y0 = i * pw, tones = ["#b07a40", "#a56f38", "#b98548", "#9c6832", "#ad7b45"];
      // tone picked from a hash that repeats over the tile height so the texture wraps
      const idx = ((Math.round(i) % (S / pw)) + S / pw) % (S / pw);
      g.fillStyle = tones[(idx * 7 + k * 3) % tones.length];
      g.beginPath();
      g.moveTo(k * cw, y0 + (dir > 0 ? 0 : cw)); g.lineTo((k + 1) * cw, y0 + (dir > 0 ? cw : 0));
      g.lineTo((k + 1) * cw, y0 + (dir > 0 ? cw : 0) + pw); g.lineTo(k * cw, y0 + (dir > 0 ? 0 : cw) + pw);
      g.closePath(); g.fill();
      g.strokeStyle = "rgba(60,32,10,0.55)"; g.lineWidth = 2; g.stroke();
    }
    g.restore();
    g.fillStyle = "rgba(60,32,10,0.6)"; g.fillRect(k * cw - 1, 0, 2, S);
  }
  g.globalAlpha = 0.05;
  for (let i = 0; i < 1500; i++) { g.fillStyle = r() > 0.5 ? "#fff1d0" : "#2a1404"; g.fillRect(r() * S, r() * S, 1 + r() * 30, 1); }
  g.globalAlpha = 1;
  return tex(c, rx, ry);
};

/** wooden dado: framed panels */
export const dadoMap = (rx: number) => {
  const W = 512, H = 512, [c, g] = cv(W, H), r = rng(31);
  g.fillStyle = "#6b4222"; g.fillRect(0, 0, W, H);
  g.globalAlpha = 0.10;
  for (let i = 0; i < 500; i++) { g.fillStyle = r() > 0.5 ? "#c08a50" : "#2a1404"; g.fillRect(0, r() * H, W, 1 + r() * 2); }
  g.globalAlpha = 1;
  g.fillStyle = "#5a361a"; g.fillRect(48, 70, W - 96, H - 150);
  g.strokeStyle = "#3d230f"; g.lineWidth = 10; g.strokeRect(48, 70, W - 96, H - 150);
  g.strokeStyle = "#8a5a30"; g.lineWidth = 4; g.strokeRect(62, 84, W - 124, H - 178);
  g.fillStyle = "#3d230f"; g.fillRect(0, 0, 4, H); g.fillRect(W - 4, 0, 4, H);
  return tex(c, rx, 1);
};

/** the slightly paler rectangle left behind by the painting, with a dust line; alpha overlay */
export const patchTexture = () => {
  const W = 512, H = 700, [c, g] = cv(W, H);
  g.clearRect(0, 0, W, H);
  g.fillStyle = "rgba(255,190,160,0.13)"; g.fillRect(14, 14, W - 28, H - 28);
  const gr = g.createLinearGradient(0, 0, 0, H);
  gr.addColorStop(0, "rgba(255,230,210,0.05)"); gr.addColorStop(1, "rgba(255,230,210,0)");
  g.fillStyle = gr; g.fillRect(14, 14, W - 28, H - 28);
  g.shadowColor = "rgba(40,4,8,0.6)"; g.shadowBlur = 10;
  g.strokeStyle = "rgba(48,6,10,0.42)"; g.lineWidth = 5; g.strokeRect(13, 13, W - 26, H - 26);
  g.shadowBlur = 0;
  // dust streaks under the top edge
  const r = rng(5);
  for (let i = 0; i < 26; i++) { g.fillStyle = "rgba(48,6,10,0.10)"; g.fillRect(24 + r() * (W - 48), 18, 2 + r() * 3, 10 + r() * 46); }
  return tex(c);
};

/** cartoon old-master paintings: 0 portrait, 1 landscape, 2 still life, 3 ship at sea */
export const paintingTexture = (seed: number, kind: number, aspect: number) => {
  const H = 512, W = Math.max(128, Math.round(H * aspect)), [c, g] = cv(W, H), r = rng(seed * 97 + 13);
  const pick = <T,>(a: T[]) => a[Math.floor(r() * a.length)];
  if (kind === 0) {
    const bg = g.createRadialGradient(W * 0.5, H * 0.4, 20, W * 0.5, H * 0.5, H * 0.75);
    bg.addColorStop(0, pick(["#6b5230", "#5a4a3a", "#4d5440"])); bg.addColorStop(1, "#1d140c");
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    const cloth = pick(["#2a2f55", "#5a1f1f", "#1f3a2c", "#3a2a1a"]);
    g.fillStyle = cloth; g.beginPath(); g.ellipse(W / 2, H * 1.02, W * 0.46, H * 0.36, 0, 0, 7); g.fill();
    g.fillStyle = "#e8d8c0"; g.beginPath(); g.ellipse(W / 2, H * 0.70, W * 0.17, H * 0.05, 0, 0, 7); g.fill();
    g.fillStyle = "#d9a57c"; g.fillRect(W / 2 - W * 0.07, H * 0.52, W * 0.14, H * 0.17);
    g.fillStyle = pick(["#2a1a10", "#5a3a1c", "#8a8a88"]); g.beginPath(); g.ellipse(W / 2, H * 0.36, W * 0.25, H * 0.22, 0, 0, 7); g.fill();
    g.fillStyle = "#e2b08a"; g.beginPath(); g.ellipse(W / 2, H * 0.41, W * 0.19, H * 0.19, 0, 0, 7); g.fill();
    g.fillStyle = "#2a1a10"; g.beginPath(); g.arc(W / 2 - W * 0.07, H * 0.39, 5, 0, 7); g.arc(W / 2 + W * 0.07, H * 0.39, 5, 0, 7); g.fill();
    g.strokeStyle = "#7a3a2a"; g.lineWidth = 4; g.beginPath(); g.arc(W / 2, H * 0.47, W * 0.06, 0.3, 2.84); g.stroke();
    if (r() > 0.5) { g.fillStyle = "#15100c"; g.beginPath(); g.ellipse(W / 2, H * 0.24, W * 0.30, H * 0.05, 0, 0, 7); g.fill(); g.fillRect(W / 2 - W * 0.17, H * 0.10, W * 0.34, H * 0.14); }
  } else if (kind === 1) {
    const sky = g.createLinearGradient(0, 0, 0, H * 0.65);
    sky.addColorStop(0, pick(["#6f8fa8", "#8a9aa0", "#5f7f90"])); sky.addColorStop(1, pick(["#f0d9a0", "#f3c98a", "#e8e0c0"]));
    g.fillStyle = sky; g.fillRect(0, 0, W, H);
    g.fillStyle = "rgba(255,250,235,0.75)";
    for (let i = 0; i < 4; i++) { const x = r() * W, y = H * (0.1 + r() * 0.25); g.beginPath(); g.ellipse(x, y, 50 + r() * 60, 16 + r() * 12, 0, 0, 7); g.fill(); }
    g.fillStyle = "#7d9080"; g.beginPath(); g.moveTo(0, H * 0.62);
    for (let x = 0; x <= W; x += 20) g.lineTo(x, H * (0.56 + 0.06 * Math.sin(x * 0.012 + seed)));
    g.lineTo(W, H); g.lineTo(0, H); g.fill();
    g.fillStyle = "#4f6a3c"; g.beginPath(); g.moveTo(0, H * 0.74);
    for (let x = 0; x <= W; x += 20) g.lineTo(x, H * (0.70 + 0.04 * Math.sin(x * 0.02 + seed * 2)));
    g.lineTo(W, H); g.lineTo(0, H); g.fill();
    g.fillStyle = "#9fc0c8"; g.beginPath(); g.moveTo(W * 0.45, H); g.quadraticCurveTo(W * 0.7, H * 0.82, W * 0.5, H * 0.72); g.quadraticCurveTo(W * 0.75, H * 0.84, W * 0.7, H); g.fill();
    const tx = W * (0.15 + r() * 0.2);
    g.fillStyle = "#3a2a16"; g.fillRect(tx - 6, H * 0.5, 12, H * 0.34);
    g.fillStyle = "#2f4a26"; for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(tx + (r() - 0.5) * 90, H * (0.42 + r() * 0.14), 34 + r() * 26, 0, 7); g.fill(); }
  } else if (kind === 2) {
    g.fillStyle = "#231810"; g.fillRect(0, 0, W, H);
    const bg = g.createRadialGradient(W * 0.4, H * 0.4, 10, W * 0.5, H * 0.5, H * 0.8);
    bg.addColorStop(0, "rgba(120,90,50,0.6)"); bg.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = bg; g.fillRect(0, 0, W, H);
    g.fillStyle = "#5a3418"; g.fillRect(0, H * 0.68, W, H * 0.32);
    g.fillStyle = "#e9e2d0"; g.beginPath(); g.moveTo(W * 0.1, H * 0.70); g.lineTo(W * 0.6, H * 0.70); g.lineTo(W * 0.5, H); g.lineTo(0, H); g.fill();
    g.fillStyle = "#2c4a34"; g.fillRect(W * 0.70, H * 0.28, W * 0.10, H * 0.42); g.fillRect(W * 0.735, H * 0.16, W * 0.03, H * 0.14);
    g.fillStyle = "#b9a070"; g.beginPath(); g.ellipse(W * 0.38, H * 0.70, W * 0.24, H * 0.07, 0, 0, Math.PI); g.fill();
    const fr = ["#c0392b", "#e0a030", "#7a9a30", "#8a3a6a", "#d96a2a"];
    for (let i = 0; i < 6; i++) { g.fillStyle = fr[i % fr.length]; g.beginPath(); g.arc(W * (0.22 + i * 0.065), H * (0.64 - (i % 2) * 0.05), W * 0.05, 0, 7); g.fill(); }
  } else {
    const sky = g.createLinearGradient(0, 0, 0, H * 0.6);
    sky.addColorStop(0, "#56708a"); sky.addColorStop(1, "#e6cf9c"); g.fillStyle = sky; g.fillRect(0, 0, W, H);
    g.fillStyle = "#2f5560"; g.fillRect(0, H * 0.6, W, H * 0.4);
    g.strokeStyle = "rgba(220,240,240,0.5)"; g.lineWidth = 3;
    for (let i = 0; i < 9; i++) { const y = H * (0.66 + r() * 0.3), x = r() * W; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 30, y - 8, x + 60, y); g.stroke(); }
    const sx = W * 0.5, sy = H * 0.62;
    g.fillStyle = "#3a2414"; g.beginPath(); g.moveTo(sx - W * 0.2, sy - 10); g.lineTo(sx + W * 0.22, sy - 10); g.lineTo(sx + W * 0.15, sy + 26); g.lineTo(sx - W * 0.14, sy + 26); g.fill();
    g.fillRect(sx - 3, sy - H * 0.36, 6, H * 0.36); g.fillRect(sx + W * 0.1, sy - H * 0.26, 5, H * 0.26);
    g.fillStyle = "#efe6cf";
    g.beginPath(); g.moveTo(sx - W * 0.14, sy - H * 0.06); g.quadraticCurveTo(sx - W * 0.02, sy - H * 0.2, sx - W * 0.12, sy - H * 0.33); g.lineTo(sx + W * 0.07, sy - H * 0.33); g.quadraticCurveTo(sx + W * 0.13, sy - H * 0.2, sx + W * 0.06, sy - H * 0.06); g.fill();
    g.beginPath(); g.moveTo(sx + W * 0.09, sy - H * 0.05); g.lineTo(sx + W * 0.2, sy - H * 0.05); g.lineTo(sx + W * 0.12, sy - H * 0.24); g.fill();
  }
  // varnish: warm glaze and dark edge
  g.fillStyle = "rgba(120,80,20,0.14)"; g.fillRect(0, 0, W, H);
  const vg = g.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.85);
  vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(10,5,0,0.55)");
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  return tex(c);
};
