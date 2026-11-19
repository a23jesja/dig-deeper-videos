// A painted background as three flat layers at three depths before a lens (the painted-cabin test, Jesper 19 Nov 2026: a picture
// painted with SDXL, split by Depth Anything V2 Small into a foreground, a middle and a background; scripts/depth_layers.py). Each
// layer is a plane square to the lens, so big that from where the lens starts it fills the picture exactly; as the lens goes in, the
// near layer grows faster than the far one, and the room gets its depth. The figures stand as cards between the middle and the near
// layer, on an unseen floor that only takes their shadows. The layers take no light: the painting has its own.
import * as THREE from "three";
import { sunRig, type Sun } from "./kit";
import type { V3 } from "../stage/film";

/** the three layers' pictures (in node, where no picture is loaded, the layers stand empty: the checks see the planes and the floor) */
export type Layers = { far?: TexImageSource; mid?: TexImageSource; near?: TexImageSource };
/** where the layers stand: metres before the lens, looking along -z from `lens` with the field of view `fov` (pitch 0) */
export type LayerDepths = { far: number; mid: number; near: number };

export const paintedSet = (L: Layers, lens: V3, fov: number, D: LayerDepths, light: Sun, floorY = 0) => {
  const root = new THREE.Group(), tan = Math.tan((fov * Math.PI) / 360);
  (["far", "mid", "near"] as const).forEach((k, i) => {
    const d = D[k], H = 2 * d * tan, W = (H * 1080) / 1920, img = L[k];
    const mat = new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: k !== "far", depthWrite: k === "far", toneMapped: false });
    if (img) { const t = new THREE.Texture(img); t.colorSpace = THREE.SRGBColorSpace; t.needsUpdate = true; mat.map = t; }
    else mat.visible = k === "far";
    const m = new THREE.Mesh(new THREE.PlaneGeometry(W, H), mat); m.position.set(lens[0], lens[1], lens[2] - d); m.renderOrder = i; m.name = `painted ${k}`;
    m.castShadow = false; m.receiveShadow = false; root.add(m); });
  // the unseen floor: it takes the figures' shadows on the painted boards, from the lens to the middle layer
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(6, D.mid), new THREE.ShadowMaterial({ opacity: 0.32 }));
  fl.rotation.x = -Math.PI / 2; fl.position.set(lens[0], floorY + 0.002, lens[2] - D.mid / 2); fl.receiveShadow = true; fl.renderOrder = 1.5; fl.name = "painted floor"; root.add(fl);
  const rig = sunRig(light, [lens[0], floorY, lens[2] - D.mid]); root.add(rig); root.userData.rig = rig;
  return root;
};
