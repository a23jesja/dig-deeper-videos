// Environment kit, part 5: water. A sheet of waves (four swells summed in the vertex shader) that mirrors the sky
// (more at grazing angles), with a glitter path under the sun or moon and reflections of up to four lamps.
import * as THREE from "three";
import { Part } from "./util";

export type WaterOpts = { size?: number; y?: number; deep?: string; shallow?: string; skyTop?: string; skyHor?: string; sunCol?: string; sunDir?: THREE.Vector3; amp?: number; fogCol?: string; fogFar?: number };
export const makeWater = (o: WaterOpts = {}): Part & { lamps: THREE.Vector4[]; lampCols: THREE.Color[] } => {
  const size = o.size ?? 600, lamps = [0, 1, 2, 3].map(() => new THREE.Vector4(0, 0, 0, 0)), lampCols = [0, 1, 2, 3].map(() => new THREE.Color(0, 0, 0));
  const mat = new THREE.ShaderMaterial({
    fog: false,
    uniforms: { uTime: { value: 0 }, uAmp: { value: o.amp ?? 0.22 }, cDeep: { value: new THREE.Color(o.deep ?? "#0b2a4a") }, cShallow: { value: new THREE.Color(o.shallow ?? "#1c6c8c") },
      cTop: { value: new THREE.Color(o.skyTop ?? "#2f6fcc") }, cHor: { value: new THREE.Color(o.skyHor ?? "#c4dcf2") }, cSun: { value: new THREE.Color(o.sunCol ?? "#fff4d6") },
      uSun: { value: (o.sunDir ?? new THREE.Vector3(0.4, 0.5, 0.75)).clone().normalize() }, uLamp: { value: lamps }, uLampCol: { value: lampCols },
      cFog: { value: new THREE.Color(o.fogCol ?? o.skyHor ?? "#c4dcf2") }, uFogFar: { value: o.fogFar ?? 420 } },
    vertexShader: `uniform float uTime, uAmp; varying vec3 vW;
      void main(){ vec4 w = modelMatrix * vec4(position, 1.0);
        w.y += uAmp * sin(dot(w.xz, normalize(vec2(1.0, 0.35))) * 0.33 + uTime * 0.9) + uAmp * 0.6 * sin(dot(w.xz, normalize(vec2(-0.45, 1.0))) * 0.51 + uTime * 1.2);
        vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `uniform float uTime, uAmp, uFogFar; uniform vec3 cDeep, cShallow, cTop, cHor, cSun, uSun, cFog; uniform vec4 uLamp[4]; uniform vec3 uLampCol[4]; varying vec3 vW;
      // the slope of one swell: direction d, wave number k, speed sp, height a
      vec2 slope(vec2 p, vec2 d, float k, float sp, float a){ return d * (k * a * cos(dot(p, d) * k + uTime * sp)); }
      void main(){ vec2 p = vW.xz; vec2 g = vec2(0.0);
        g += slope(p, normalize(vec2(1.0, 0.35)), 0.33, 0.9, uAmp); g += slope(p, normalize(vec2(-0.45, 1.0)), 0.51, 1.2, uAmp * 0.6);
        g += slope(p, normalize(vec2(0.62, -0.78)), 0.93, 1.7, uAmp * 0.34); g += slope(p, normalize(vec2(-0.87, -0.31)), 1.71, 2.3, uAmp * 0.2);
        g += slope(p, normalize(vec2(0.23, 0.97)), 3.07, 3.1, uAmp * 0.11); g += slope(p, normalize(vec2(-0.71, 0.58)), 5.3, 4.2, uAmp * 0.07);
        g += slope(p, normalize(vec2(0.94, 0.19)), 9.1, 5.6, uAmp * 0.035);
        float dist = length(cameraPosition - vW); vec3 n = normalize(vec3(-g.x, 1.0, -g.y) * vec3(1.0, 1.0 + dist * 0.012, 1.0));   // far water is calmer to the eye
        vec3 v = normalize(cameraPosition - vW); float fres = pow(1.0 - max(dot(n, v), 0.0), 3.0);
        vec3 r = reflect(-v, n); r.y = abs(r.y); vec3 sky = mix(cHor, cTop, smoothstep(0.0, 0.6, r.y));
        vec3 body = mix(cDeep, cShallow, clamp(0.5 + (g.x + g.y) * 0.9, 0.0, 1.0));
        vec3 c = mix(body, sky, 0.15 + 0.8 * fres);
        float s = max(dot(r, uSun), 0.0); c += cSun * (pow(s, 320.0) * 3.0 + pow(s, 30.0) * 0.25);
        for (int i = 0; i < 4; i++) { vec3 l = uLamp[i].xyz - vW; float d = length(l); float sp = pow(max(dot(r, l / d), 0.0), 60.0); c += uLampCol[i] * sp * uLamp[i].w / (1.0 + 0.004 * d * d); }
        c = mix(c, cFog, smoothstep(uFogFar * 0.35, uFogFar, dist));
        gl_FragColor = vec4(c, 1.0); }`,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(size, size, 220, 220).rotateX(-Math.PI / 2), mat); mesh.position.y = o.y ?? 0; mesh.frustumCulled = false; mesh.layers.set(3);
  return { obj: mesh, update: (t) => { mat.uniforms.uTime.value = t; }, lamps, lampCols };
};
