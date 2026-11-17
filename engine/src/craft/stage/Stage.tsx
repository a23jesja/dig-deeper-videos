// The stage: plays a Film (film.ts) in its world. Each frame it sets the shot's camera, aims the sun's shadow area at what the shot
// shows, stands the cast in the world as cards drawn for the angle they are seen from, lets the shot add the things they hold, and
// lays the captions over the picture. Shared by every Short.
import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { AbsoluteFill, Audio, getInputProps, staticFile, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { setOutline, aimSun, sunDir } from "../world/kit";
import { figureCard } from "../world/people";
import { shake } from "../motion";
import { Film, Cam, Staged, shotAt, captions, capWidth } from "./film";

export const SW = 1080, SH = 1920;
const dispose = (g: THREE.Object3D) => g.traverse((o) => { const m = o as THREE.Mesh; if (!m.isMesh || !m.userData.own) return; m.geometry?.dispose(); for (const mat of (Array.isArray(m.material) ? m.material : [m.material]) as THREE.MeshBasicMaterial[]) { mat.map?.dispose(); mat.dispose(); } (m.customDepthMaterial as THREE.Material | undefined)?.dispose(); });

/** at, view, res: a still of the film at the time `at` from the camera `view`, on a picture `res` pixels high (a thumbnail) */
const Scene: React.FC<{ film: Film; at?: number; view?: Cam; res?: number }> = ({ film, at, view, res }) => {
  const fr = useCurrentFrame(), T = at ?? fr / film.fps, { camera } = useThree(), shot = shotAt(film, T), t = T - shot.a, u = t / (shot.b - shot.a);
  const world = useMemo(() => film.world(), [film]), last = useRef<THREE.Group | null>(null);
  const cam = view ?? shot.cam(t, u), rig = world.userData.rig as THREE.Object3D;
  const frame = useMemo(() => {
    if (last.current) dispose(last.current);
    const g = new THREE.Group(), seen = { fov: cam.fov, toSun: sunDir(rig) }, staged: Record<string, Staged> = {};
    for (const a of shot.cast(t, T)) {
      const p = figureCard(a.D, a.pose, a.o, { at: a.at, heading: a.heading, h: a.h }, cam.pos, 0, seen);
      if (a.spin !== undefined) { const th = (a.spin * Math.PI) / 180, az = p.mesh.rotation.y, hh = a.h / 2; p.mesh.rotation.z = th; p.mesh.position.set(a.at[0] + Math.sin(th) * hh * Math.cos(az), a.at[1] - Math.cos(th) * hh, a.at[2] - Math.sin(th) * hh * Math.sin(az)); }
      if (a.noShade) for (const k of p.mesh.children) if ((k as THREE.Mesh).receiveShadow) k.visible = false;
      p.mesh.userData.own = true; p.mesh.traverse((o) => { o.userData.own = true; }); g.add(p.mesh); staged[a.name] = { ...a, joint: p.joint, mesh: p.mesh };
    }
    shot.things?.(g, staged, t, T, cam);
    last.current = g; return g;
  }, [fr, film, at]);
  const c = camera as THREE.PerspectiveCamera, sk = film.hits && at === undefined ? shake(T, film.hits, 1) : [0, 0];
  c.position.set(cam.pos[0] + sk[0] * 0.012, cam.pos[1] + sk[1] * 0.012, cam.pos[2]); c.fov = cam.fov; c.near = 0.1; c.far = 3000; c.lookAt(cam.look[0] + sk[0] * 0.012, cam.look[1] + sk[1] * 0.012, cam.look[2]); c.updateProjectionMatrix();
  aimSun(rig, shot.sun?.target ?? cam.look, shot.sun?.reach ?? 9);
  for (const o of (world.userData.named as THREE.Object3D[] | undefined) ?? []) o.visible = !shot.hide?.includes(o.name);
  (world.userData.tick as ((t: number) => void) | undefined)?.(T);   // what moves by itself in the world (the sea)
  setOutline(res ? 2.6 : 3.4, res ?? SH);
  return (<><primitive object={world} dispose={null} /><primitive object={frame} dispose={null} /></>);
};

const STROKE = "#101014";
const big = (px: number): React.CSSProperties => ({ font: `900 ${px}px 'Arial Black', Arial, sans-serif`, color: "#ffffff", WebkitTextStroke: `${Math.round(px * 0.2)}px ${STROKE}`, paintOrder: "stroke fill", textAlign: "center", lineHeight: 1.08, letterSpacing: "-0.01em" });
/** captions two or three words at a time in the lower third, above the part the Shorts interface covers; the question as the hook */
const Words: React.FC<{ film: Film }> = ({ film }) => {
  const T = useCurrentFrame() / film.fps, caps = useMemo(() => captions(film.words, (w) => w.b <= film.hook.b + 0.02), [film]);
  const c = caps.find((q) => T >= q.a - 0.03 && T < q.b), hook = T >= film.hook.a && T < film.hook.b, sign = film.sign && T >= film.sign.a && T < film.sign.b;
  return (
    <AbsoluteFill>
      {hook && <div style={{ position: "absolute", left: 40, right: 40, top: 1292 - Math.round((film.hook.size ?? 108) * 1.09) * Math.max(0, film.hook.text.length - 2), ...big(film.hook.size ?? 108) }}>{film.hook.text.map((l, i) => <div key={i} style={{ color: i === film.hook.text.length - 1 ? "#ffd83a" : "#ffffff" }}>{l}</div>)}</div>}
      {!hook && c && <div style={{ position: "absolute", left: 30, right: 30, top: 1440, whiteSpace: "nowrap", ...big(Math.round(96 * Math.min(1, 8.9 / capWidth(c.text)))) }}>{c.text}</div>}
      {sign && <div style={{ position: "absolute", left: 50, right: 50, top: 296, padding: "12px 24px", background: "rgba(16,16,20,0.8)", color: "#ffffff", font: "700 40px Arial, sans-serif", borderRadius: 12, textAlign: "center", lineHeight: 1.2 }}>{film.sign!.text}</div>}
    </AbsoluteFill>
  );
};
export const Stage: React.FC<{ film: Film }> = ({ film }) => {
  const p = getInputProps() as { audio?: boolean; words?: boolean };
  return (
    <AbsoluteFill style={{ background: film.sky }}>
      <ThreeCanvas width={SW} height={SH} shadows="soft" flat gl={{ antialias: true }} camera={{ fov: 55, near: 0.1, far: 3000 }}>
        <Scene film={film} />
      </ThreeCanvas>
      {p.words !== false && <Words film={film} />}
      {p.audio !== false && film.audio && <Audio src={staticFile(film.audio)} />}
    </AbsoluteFill>
  );
};
/** the film's thumbnail proposals, one per frame of the composition (1280 x 720) */
export const TW = SW, TH = SH;
export const Thumbs: React.FC<{ film: Film }> = ({ film }) => {
  const list = film.thumbs ?? [], k = list[Math.min(list.length - 1, useCurrentFrame())], px = k?.size ?? 124;
  if (!k) return null;
  return (
    <AbsoluteFill style={{ background: film.sky }}>
      <ThreeCanvas width={TW} height={TH} shadows="soft" flat gl={{ antialias: true }} camera={{ fov: 45, near: 0.1, far: 3000 }}>
        <Scene film={film} at={k.T} view={k.cam} />
      </ThreeCanvas>
      <AbsoluteFill>
        <div style={{ position: "absolute", left: 40, right: 40, top: Math.round((k.y ?? 0.17) * TH), ...big(px), textAlign: k.side ?? "center", lineHeight: 0.98, transform: `rotate(${k.tilt ?? -3}deg)` }}>{k.words.map((l, i) => <div key={i} style={{ color: i === k.words.length - 1 ? "#ffd83a" : "#ffffff" }}>{l}</div>)}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
