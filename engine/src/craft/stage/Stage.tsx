// The stage: plays a Film (film.ts) in its world. Each frame it sets the shot's camera, aims the sun's shadow area at what the shot
// shows, stands the cast in the world as cards drawn for the angle they are seen from, lets the shot add the things they hold, and
// lays the captions over the picture. Shared by every Short.
import React, { useMemo, useRef } from "react";
import { castOf } from "./film";
import * as THREE from "three";
import { AbsoluteFill, Audio, getInputProps, staticFile, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { setOutline, aimSun, sunDir, setCardLight } from "../world/kit";
import { figureCard } from "../world/people";
import { shake } from "../motion";
import { Film, Cam, Staged, shotAt, captions, capWidth, hookTop, CAP_TOP } from "./film";

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
    // the scene's light on the figures, for this shot (kit.CardLight); none = the cards as they always were
    setCardLight(shot.light ?? film.light ?? null);
    for (const a of castOf(shot)(t, T)) {
      const p = figureCard(a.D, a.pose, a.o, { at: a.at, heading: a.heading, h: a.h, land: a.land }, cam.pos, 0, seen);
      if (a.spin !== undefined) { const th = (a.spin * Math.PI) / 180, az = p.mesh.rotation.y, hh = a.h / 2; p.mesh.rotation.z = th; p.mesh.position.set(a.at[0] + Math.sin(th) * hh * Math.cos(az), a.at[1] - Math.cos(th) * hh, a.at[2] - Math.sin(th) * hh * Math.sin(az)); }
      if (a.noShade) for (const k of p.mesh.children) if ((k as THREE.Mesh).receiveShadow) k.visible = false;
      p.mesh.userData.own = true; p.mesh.traverse((o) => { o.userData.own = true; }); g.add(p.mesh); staged[a.name] = { ...a, joint: p.joint, mesh: p.mesh, mark: p.mark, seen };
    }
    shot.things?.(g, staged, t, T, cam); setCardLight(null);
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
  const T = useCurrentFrame() / film.fps, caps = useMemo(() => captions(film.words, (w) => w.b <= film.hook.b + 0.02, film.shots.map((s) => s.a)), [film]);
  const c = caps.find((q) => T >= q.a - 0.03 && T < q.b), hook = T >= film.hook.a && T < film.hook.b, sign = film.sign && T >= film.sign.a && T < film.sign.b;
  return (
    <AbsoluteFill>
      {hook && <div style={{ position: "absolute", left: 40, right: 40, top: hookTop(film), ...big(film.hook.size ?? 108) }}>{film.hook.text.map((l, i) => <div key={i} style={{ color: i === film.hook.text.length - 1 ? "#ffd83a" : "#ffffff" }}>{l}</div>)}</div>}
      {!hook && c && <div style={{ position: "absolute", left: 30, right: 30, top: film.shots.find((x) => T >= x.a && T < x.b)?.capsTop ?? CAP_TOP, whiteSpace: "nowrap", ...big(Math.round(96 * Math.min(1, 8.9 / capWidth(c.text)))) }}>{c.text}</div>}
      {(film.labels ?? []).filter((q) => T >= q.a && T < q.b).map((q, i) => <div key={`l${i}`} style={{ position: "absolute", left: 30, right: 30, top: q.top ?? 300, whiteSpace: "nowrap", ...big(q.size ?? 110), color: q.col ?? "#ffd83a" }}>{q.text(T)}</div>)}
      {sign && <div style={{ position: "absolute", left: 50, right: 50, top: 296, padding: "12px 24px", background: "rgba(16,16,20,0.8)", color: "#ffffff", font: "700 40px Arial, sans-serif", borderRadius: 12, textAlign: "center", lineHeight: 1.2 }}>{film.sign!.text}</div>}
    </AbsoluteFill>
  );
};
/** where a place in the world is on the picture, seen by `cam` (null behind the lens) */
const toScreen = (cam: Cam, p: [number, number, number]): [number, number] | null => {
  const c = new THREE.PerspectiveCamera(cam.fov, SW / SH, 0.1, 3000); c.position.set(cam.pos[0], cam.pos[1], cam.pos[2]); c.lookAt(cam.look[0], cam.look[1], cam.look[2]); c.updateMatrixWorld();
  const v = new THREE.Vector3(p[0], p[1], p[2]).project(c); return v.z > 1 ? null : [((v.x + 1) / 2) * SW, ((1 - v.y) / 2) * SH];
};
const backOut = (k: number) => 1 + 2.7 * (k - 1) ** 3 + 1.7 * (k - 1) ** 2;
/** the film's speech bubbles: a white rounded bubble with the comic outline, above the speaker's head with its tail toward it; it pops
 *  up in 0.14 s with a little overshoot and goes in 0.08 s. Kept inside the picture and above the captions. */
const Bubbles: React.FC<{ film: Film }> = ({ film }) => {
  const T = useCurrentFrame() / film.fps, live = (film.bubbles ?? []).filter((q) => T >= q.a && T < q.b);
  if (!live.length) return null;
  const shot = shotAt(film, T), t = T - shot.a, cam = shot.cam(t, t / (shot.b - shot.a)), cast = castOf(shot)(t, T);
  return (
    <AbsoluteFill>
      {live.map((q, i) => {
        const who = cast.find((x) => x.name === q.who), head = who ? toScreen(cam, [who.at[0], who.at[1] + who.h * 0.9, who.at[2]]) : null, H = head ?? [SW / 2, 760];
        const px = q.size ?? 72, w = Math.min(SW - 80, q.text.length * px * 0.66 + 80), h = Math.round(px * 1.12 + 44);
        const x = Math.max(40 + w / 2, Math.min(SW - 40 - w / 2, H[0] + (q.dx ?? 0))), y = Math.max(40 + h, Math.min(1400, H[1] + (q.dy ?? -px * 2.6)));
        const k = Math.min(1, (T - q.a) / 0.14), out = Math.min(1, Math.max(0, (q.b - T) / 0.08)), s = (k < 1 ? 0.6 + 0.4 * backOut(k) : 1) * (0.7 + 0.3 * out);
        // the tail: from the bubble's lower edge toward the head, stopping well short of the face
        // (its base slides along the bubble's lower edge to above the head, so that a bubble kept inside the picture still points at him)
        const bx = Math.max(x - w / 2 + 50, Math.min(x + w / 2 - 50, H[0])), dx = H[0] - bx, dy = H[1] - y, far = Math.hypot(dx, dy) || 1, reach = Math.min(110, far * 0.55), tip = [bx + (dx / far) * reach, y + (dy / far) * reach];
        return (
          <React.Fragment key={`b${i}`}>
            <svg width={SW} height={SH} style={{ position: "absolute", left: 0, top: 0, opacity: k * out }}><polygon points={`${bx - 26},${y - 8} ${bx + 26},${y - 8} ${tip[0]},${tip[1]}`} fill="#fffdf5" stroke={STROKE} strokeWidth={7} strokeLinejoin="round" /></svg>
            <div style={{ position: "absolute", left: x - w / 2, top: y - h, width: w, height: h, boxSizing: "border-box", background: "#fffdf5", border: `7px solid ${STROKE}`, borderRadius: h / 2, display: "flex", alignItems: "center", justifyContent: "center", font: `900 ${px}px 'Arial Black', Arial, sans-serif`, color: STROKE, whiteSpace: "nowrap", transform: `scale(${s})`, transformOrigin: `${bx - (x - w / 2)}px 100%`, opacity: out }}>{q.text}</div>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};
/** the film's veils of smoke: soft, lighter in the middle, thickening as they come */
const Veils: React.FC<{ film: Film }> = ({ film }) => {
  const T = useCurrentFrame() / film.fps;
  return <>{(film.veils ?? []).filter((v) => T >= v.a).map((v, i) => { const u = Math.min(1, (T - v.a) / (v.b - v.a)), o = v.to * u * u * (3 - 2 * u);
    return <AbsoluteFill key={`v${i}`} style={{ opacity: o, background: `radial-gradient(ellipse at 50% 42%, ${v.col}ee 0%, ${v.col} 55%, ${v.col} 100%)` }} />; })}</>;
};
/** the film's tint for the time T, multiplied over the picture */
const Grade: React.FC<{ film: Film; at?: number }> = ({ film, at }) => { const fr = useCurrentFrame(), g = film.grade?.(at ?? fr / film.fps); return g ? <AbsoluteFill style={{ background: g, mixBlendMode: "multiply" }} /> : null; };
export const Stage: React.FC<{ film: Film }> = ({ film }) => {
  const p = getInputProps() as { audio?: boolean; words?: boolean };
  return (
    <AbsoluteFill style={{ background: film.sky }}>
      <ThreeCanvas width={SW} height={SH} shadows="soft" flat gl={{ antialias: true }} camera={{ fov: 55, near: 0.1, far: 3000 }}>
        <Scene film={film} />
      </ThreeCanvas>
      <Grade film={film} />
      <Veils film={film} />
      {p.words !== false && <Bubbles film={film} />}
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
      <Grade film={film} at={k.T} />
      <AbsoluteFill>
        <div style={{ position: "absolute", left: 40, right: 40, top: Math.round((k.y ?? 0.17) * TH), ...big(px), textAlign: k.side ?? "center", lineHeight: 0.98, transform: `rotate(${k.tilt ?? -3}deg)` }}>{k.words.map((l, i) => <div key={i} style={{ color: i === k.words.length - 1 ? "#ffd83a" : "#ffffff" }}>{l}</div>)}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
