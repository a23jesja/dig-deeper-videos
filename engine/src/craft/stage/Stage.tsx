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
import { Film, Staged, shotAt, captions } from "./film";

export const SW = 1080, SH = 1920;
const dispose = (g: THREE.Object3D) => g.traverse((o) => { const m = o as THREE.Mesh; if (!m.isMesh || !m.userData.own) return; m.geometry?.dispose(); for (const mat of (Array.isArray(m.material) ? m.material : [m.material]) as THREE.MeshBasicMaterial[]) { mat.map?.dispose(); mat.dispose(); } (m.customDepthMaterial as THREE.Material | undefined)?.dispose(); });

const Scene: React.FC<{ film: Film }> = ({ film }) => {
  const fr = useCurrentFrame(), T = fr / film.fps, { camera } = useThree(), shot = shotAt(film, T), t = T - shot.a, u = t / (shot.b - shot.a);
  const world = useMemo(() => film.world(), [film]), last = useRef<THREE.Group | null>(null);
  const cam = shot.cam(t, u), rig = world.userData.rig as THREE.Object3D;
  const frame = useMemo(() => {
    if (last.current) dispose(last.current);
    const g = new THREE.Group(), seen = { fov: cam.fov, toSun: sunDir(rig) }, staged: Record<string, Staged> = {};
    for (const a of shot.cast(t, T)) {
      const p = figureCard(a.D, a.pose, a.o, { at: a.at, heading: a.heading, h: a.h }, cam.pos, 0, seen);
      p.mesh.userData.own = true; p.mesh.traverse((o) => { o.userData.own = true; }); g.add(p.mesh); staged[a.name] = { ...a, joint: p.joint, mesh: p.mesh };
    }
    shot.things?.(g, staged, t, T, cam);
    last.current = g; return g;
  }, [fr, film]);
  const c = camera as THREE.PerspectiveCamera, sk = film.hits ? shake(T, film.hits, 1) : [0, 0];
  c.position.set(cam.pos[0] + sk[0] * 0.012, cam.pos[1] + sk[1] * 0.012, cam.pos[2]); c.fov = cam.fov; c.near = 0.1; c.far = 3000; c.lookAt(cam.look[0] + sk[0] * 0.012, cam.look[1] + sk[1] * 0.012, cam.look[2]); c.updateProjectionMatrix();
  aimSun(rig, shot.sun?.target ?? cam.look, shot.sun?.reach ?? 9);
  setOutline(3.4, SH);
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
      {hook && <div style={{ position: "absolute", left: 40, right: 40, top: 1226, ...big(112) }}>{film.hook.text.map((l, i) => <div key={i} style={{ color: i === film.hook.text.length - 1 ? "#ffd83a" : "#ffffff" }}>{l}</div>)}</div>}
      {!hook && c && <div style={{ position: "absolute", left: 30, right: 30, top: 1440, ...big(96) }}>{c.text}</div>}
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
