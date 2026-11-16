// One look for models and characters: toon shading (three flat tones) on every material. The black outlines
// come from the engine's InkPass (emu/ink.ts), which draws lines on depth jumps and creases of everything.
import * as THREE from "three";

let grad: THREE.DataTexture | null = null;
/** light ramp: shadow, half tone, lit (sampled by dot(N, L) from -1 to 1) */
export const gradient = () => {
  if (!grad) {
    grad = new THREE.DataTexture(new Uint8Array([105, 105, 196, 255]), 4, 1, THREE.RedFormat);
    grad.minFilter = grad.magFilter = THREE.NearestFilter;
    grad.generateMipmaps = false;
    grad.needsUpdate = true;
  }
  return grad;
};

let gradSoft: THREE.DataTexture | null = null;
/** gentle ramp for faces: the drawn features must stay readable, so the shadow side is only a little darker */
export const gradientSoft = () => {
  if (!gradSoft) {
    gradSoft = new THREE.DataTexture(new Uint8Array([222, 222, 240, 255]), 4, 1, THREE.RedFormat);
    gradSoft.minFilter = gradSoft.magFilter = THREE.NearestFilter;
    gradSoft.generateMipmaps = false;
    gradSoft.needsUpdate = true;
  }
  return gradSoft;
};
export const toon = (color: THREE.ColorRepresentation, map?: THREE.Texture, soft = false) => new THREE.MeshToonMaterial({ color, ...(map ? { map } : {}), gradientMap: soft ? gradientSoft() : gradient() });
/** drawn line colour, not lit: pupils, brows, mouth, thin limbs */
export const ink = (color: THREE.ColorRepresentation = 0x16131a) => new THREE.MeshBasicMaterial({ color });

/** replace every lit material under root with a toon material that keeps its colour, picture and cut-out */
export const toonify = (root: THREE.Object3D) => {
  const done = new Map<string, THREE.Material>();
  const conv = (m: THREE.Material): THREE.Material => {
    const s = m as THREE.MeshStandardMaterial;
    if (!s.isMeshStandardMaterial) return m;
    let t = done.get(m.uuid);
    if (!t) {
      t = new THREE.MeshToonMaterial({
        color: s.color, ...(s.map ? { map: s.map } : {}), gradientMap: gradient(), transparent: s.transparent, opacity: s.opacity, alphaTest: s.alphaTest,
        ...(s.alphaMap ? { alphaMap: s.alphaMap } : {}), side: s.side, emissive: s.emissive, emissiveIntensity: s.emissiveIntensity, depthWrite: s.depthWrite,
        polygonOffset: s.polygonOffset, polygonOffsetFactor: s.polygonOffsetFactor,
      });
      t.name = m.name;
      done.set(m.uuid, t);
    }
    return t;
  };
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.material = Array.isArray(mesh.material) ? mesh.material.map(conv) : conv(mesh.material);
  });
};

/** woven tweed: herringbone in two browns with a faint check */
export const tweedMap = (base = "#9a7748", dark = "#6f5236", light = "#b8935e", rep = 4) => {
  const S = 256, c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d")!;
  g.fillStyle = base; g.fillRect(0, 0, S, S);
  const cols = 8, cw = S / cols;
  g.lineWidth = 3;
  for (let k = 0; k < cols; k++) {
    const dir = k % 2 ? 1 : -1;
    for (let y = -cw; y < S + cw; y += 8) {
      g.strokeStyle = (Math.round(y / 8) + k) % 2 ? dark : light;
      g.globalAlpha = 0.55;
      g.beginPath(); g.moveTo(k * cw, y + (dir > 0 ? 0 : cw)); g.lineTo((k + 1) * cw, y + (dir > 0 ? cw : 0)); g.stroke();
    }
  }
  g.globalAlpha = 0.16; g.fillStyle = "#3a2414";
  for (let i = 0; i < 4; i++) { g.fillRect(0, i * 64 + 28, S, 5); g.fillRect(i * 64 + 28, 0, 5, S); }
  g.globalAlpha = 1;
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep); t.anisotropy = 8;
  return t;
};
