"use client";

// Dust field: one WebGL1 POINTS mesh, six analytic shapes in the vertex shader, blended by a spring-driven chapter index,
// then quantised to two colours by an ordered-dither post pass. Native scroll only. Mechanism: features/byotone-particle-field.
import { useEffect, useRef } from "react";

const TUNING = {
  particles: { full: 60000, constrained: 25000 },
  rows: 12,
  seed: 20261017,
  dprCap: { full: 1.5, constrained: 1.25 },
  renderRatio: { full: 1.0, constrained: 0.85 },
  fps: { full: 0, constrained: 30 }, // 0 = uncapped
  deadBand: 0.3, // settled for the first and last 30% of travel between chapter centres
  spring: { maxStep: 1.25, snapErr: 0.001, snapVel: 0.01 },
  pace: { normal: { seconds: 1.4, stagger: 0.18, drift: 0.22 }, orb: { seconds: 2.4, stagger: 0.4, drift: 0.34 } },
  camera: { fovDeg: 54, near: 0.08, far: 40, fillH: 0.7, fillW: 0.86, portraitLift: 0.08, rotationSpeed: 0.3 * 0.1 },
  post: { contrast: 1.6, gamma: 0.72, edge0: 0.025, edge1: 0.96, angle: 0.205, cell: 1.55, hashMix: 0.1, levels: 5, grain: 0.05, grainHz: 8 },
  colors: { ground: [12, 15, 20], ink: [233, 226, 210] },
  reducedFadeMs: 200, // out, then in: a 0.4 s cross-fade
  coarseResizeIgnorePx: 120,
  maxDt: 0.05,
} as const;

// Per-shape framing in world units; dist is fitted from these so the formation fills ~70% of the height (or 86% of the width).
type Pose = { halfW: number; halfH: number; depth: number; tilt: number; yaw: number; sway: number; yOff: number; fitW: boolean };
const POSES: Pose[] = [
  { halfW: 1.75, halfH: 1.75, depth: 0.4, tilt: 0, yaw: 0, sway: 0, yOff: 0, fitW: true }, // orb
  { halfW: 4.4, halfH: 1.45, depth: 0.9, tilt: 0, yaw: 0, sway: 0.18, yOff: 0, fitW: true }, // breath (halfW from aspect below)
  { halfW: 3.4, halfH: 2.3, depth: 0.2, tilt: -0.35, yaw: 0, sway: 0.25, yOff: 0, fitW: true }, // board
  { halfW: 1.05, halfH: 1.8, depth: 0.5, tilt: 0, yaw: 0.6, sway: 0.35, yOff: 0.07, fitW: true }, // skeleton
  { halfW: 1.8, halfH: 1.75, depth: 0.5, tilt: 0, yaw: 0, sway: 0.4, yOff: -0.25, fitW: true }, // airway
  { halfW: 0, halfH: 2.6, depth: 0.4, tilt: 0.05, yaw: 0, sway: 0.08, yOff: 0, fitW: false }, // strata (overflows the width)
];
const breathWidth = (aspect: number) => Math.min(8, Math.max(4.2, 5.2 * aspect)); // shared with the shader's uAspect

type Tier = "full" | "constrained";
type V3 = [number, number, number];

const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const smooth = (x: number) => x * x * (3 - 2 * x);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function pickTier(): Tier {
  const nav = navigator as Navigator & { deviceMemory?: number };
  const coarse = matchMedia("(pointer: coarse)").matches;
  const narrow = matchMedia("(max-width: 699.98px)").matches;
  const cores = nav.hardwareConcurrency ?? 8;
  const mem = nav.deviceMemory ?? 8;
  return coarse || narrow || cores <= 4 || mem <= 4 ? "constrained" : "full";
}

// Column-major mat4, only what this page needs.
const mat4 = {
  perspective(fovy: number, aspect: number, near: number, far: number) {
    const f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far);
    return new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0]);
  },
  lookAt(eye: V3, at: V3, up: V3) {
    let zx = eye[0] - at[0], zy = eye[1] - at[1], zz = eye[2] - at[2];
    let l = Math.hypot(zx, zy, zz) || 1;
    zx /= l; zy /= l; zz /= l;
    let xx = up[1] * zz - up[2] * zy, xy = up[2] * zx - up[0] * zz, xz = up[0] * zy - up[1] * zx;
    l = Math.hypot(xx, xy, xz) || 1;
    xx /= l; xy /= l; xz /= l;
    const yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
    return new Float32Array([
      xx, yx, zx, 0, xy, yy, zy, 0, xz, yz, zz, 0,
      -(xx * eye[0] + xy * eye[1] + xz * eye[2]), -(yx * eye[0] + yy * eye[1] + yz * eye[2]), -(zx * eye[0] + zy * eye[1] + zz * eye[2]), 1,
    ]);
  },
  multiply(a: Float32Array, b: Float32Array) {
    const o = new Float32Array(16);
    for (let c = 0; c < 4; c++)
      for (let r = 0; r < 4; r++)
        o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
    return o;
  },
  // Root transform: translate(0, y) * rotX(tilt) * rotY(yaw).
  root(tilt: number, yaw: number, y: number) {
    const cx = Math.cos(tilt), sx = Math.sin(tilt), cy = Math.cos(yaw), sy = Math.sin(yaw);
    return new Float32Array([cy, sx * sy, -cx * sy, 0, 0, cx, sx, 0, sy, -sx * cy, cx * cy, 0, 0, y, 0, 1]);
  },
};

const glsl = (n: number) => (Number.isInteger(n) ? n.toFixed(1) : String(n));
const rgb = (c: readonly number[]) => c.map((v) => v / 255) as V3;

const VERT = /* glsl */ `
precision highp float;
attribute vec3 position;
attribute vec4 aRandom;
uniform mat4 uModelView, uProjection;
uniform int uFromShape, uToShape;
uniform float uBlend, uStagger, uMorphDrift, uTime, uMotion, uPixelRatio, uDepthRef, uAspect, uAlphaScale, uMaxPoint;
uniform vec3 uColor;
varying vec3 vColor;
varying float vAlpha;
varying vec4 vSprite;
varying float vCore;

const float TAU = 6.2831853;

struct Id { vec3 cell; vec4 rnd; float t; float side; float ph1; float ph2; };
struct Shape { vec3 pos; vec3 nrm; float view; float size; float energy; float alpha; vec4 sprite; float core; };

Shape blank() {
  Shape s;
  s.pos = vec3(0.0); s.nrm = vec3(0.0, 0.0, 1.0); s.view = 0.0; s.size = 1.6; s.energy = 0.6; s.alpha = 0.35;
  s.sprite = vec4(3.0, 0.55, 0.22, 0.5); s.core = 0.6;
  return s;
}
float hash(float n) { return fract(sin(n * 127.1 + 311.7) * 43758.5453); }
float gauss(vec2 r) { return sqrt(-2.0 * log(max(r.x, 1e-4))) * cos(TAU * r.y); }
vec3 rotAxis(vec3 v, vec3 k, float a) { float c = cos(a), s = sin(a); return v * c + cross(k, v) * s + k * dot(k, v) * (1.0 - c); }

// 1. Orb: a thin shell, every particle on its own tilted loop; a fifth of them fall in from outside and flicker.
Shape orb(Id id) {
  Shape s = blank();
  float u = id.rnd.x * 2.0 - 1.0, phi = id.rnd.y * TAU, rr = sqrt(1.0 - u * u);
  vec3 axis = normalize(vec3(sin(id.ph2) * 0.6, 1.0, cos(id.ph2) * 0.6));
  vec3 dir = rotAxis(vec3(rr * cos(phi), u, rr * sin(phi)), axis, id.t * (0.1 + 0.22 * id.rnd.w) * id.side);
  float f = fract(id.cell.x * 3.0 + id.t * (0.04 + 0.05 * id.rnd.z));
  float infall = step(id.rnd.z, 0.22);
  float r = 1.6 * mix(1.0 + 0.03 * gauss(id.rnd.zw), 1.0 + 1.1 * (1.0 - f) * (1.0 - f), infall);
  s.pos = dir * r; s.nrm = dir; s.view = 1.0 - infall;
  s.energy = mix(0.55, 0.4 + 0.6 * f, infall);
  s.alpha = 0.4 * (0.65 + 0.35 * sin(id.t * (1.5 + 3.0 * id.rnd.w) + id.ph1)) * mix(1.0, smoothstep(0.0, 0.3, f), infall);
  s.size = 1.4 + 1.2 * id.rnd.w * id.rnd.w;
  return s;
}

// 2. Breath: exhaled-CO2-like trace (baseline, fast rise, sloping plateau, fast fall) scrolling left, a faint echo behind.
float capno(float ph) {
  float rise = clamp((ph - 0.40) / 0.06, 0.0, 1.0);
  float fall = 1.0 - clamp((ph - 0.88) / 0.05, 0.0, 1.0);
  return rise * fall * mix(0.82, 1.0, clamp((ph - 0.46) / 0.42, 0.0, 1.0));
}
Shape breath(Id id) {
  Shape s = blank();
  float W = clamp(5.2 * uAspect, 4.2, 8.0), P = clamp(W / 3.0, 1.9, 2.7), H = 2.4, speed = 0.07;
  float echo = step(10.0 / 12.0, id.cell.y), lag = 0.18 * echo;
  float x = (id.cell.x - 0.5) * W * 1.1;
  float sph = x / P + id.t * speed + lag;
  float k = floor(sph), ph = sph - k;
  if (id.rnd.z < 0.5) { // half the particles live on the two steep edges so the trace stays continuous
    ph = id.rnd.y < 0.45 ? mix(0.40, 0.46, id.rnd.w) : mix(0.88, 0.93, id.rnd.w);
    x = (k + ph - id.t * speed - lag) * P;
  }
  float y = -0.5 * H + H * capno(ph);
  s.pos = vec3(x + 0.015 * gauss(id.rnd.xw), y + 0.045 * gauss(id.rnd.wy) + 0.25 * echo, -0.9 * echo + 0.05 * gauss(id.rnd.yx));
  float edge = smoothstep(0.5 * W * 1.1, 0.5 * W * 1.1 - 0.6, abs(x));
  s.energy = 0.75 - 0.4 * echo;
  s.alpha = 0.34 * edge * mix(1.0, 0.32, echo);
  s.size = 1.5 + 0.8 * id.rnd.w;
  return s;
}

// 3. Board: pads on a jittered lattice, a central block, orthogonal traces with a pulse running along them, sparse haze.
vec2 padAt(float i) { return vec2(mod(i, 10.0), floor(i / 10.0)); }
Shape board(Id id) {
  Shape s = blank();
  float pitch = 0.62;
  vec2 hb = vec2(4.5, 3.0) * pitch;
  if (id.cell.y < 0.5) {
    float pi = floor(id.cell.x * 70.0);
    vec2 g = padAt(pi);
    vec2 c = g * pitch - hb + (vec2(hash(pi * 1.7), hash(pi * 3.1)) - 0.5) * 0.08;
    float sz = 0.1 + 0.06 * hash(pi * 5.3);
    vec2 q = (id.rnd.xy - 0.5) * 2.0;
    if (abs(c.x) < 1.0 && abs(c.y) < 0.75) { c = vec2(0.0); sz = 0.85; if (id.rnd.w > 0.5) { if (id.rnd.z < 0.5) q.x = sign(q.x); else q.y = sign(q.y); } }
    s.pos = vec3(c + q * sz, 0.0);
    s.energy = 0.9;
    s.alpha = 0.42 * (0.75 + 0.25 * sin(id.t * 0.8 + pi));
  } else if (id.cell.y < 0.8) {
    float k = floor(id.cell.x * 14.0), v = fract(id.cell.x * 14.0);
    float ai = floor(hash(k * 2.3) * 70.0);
    vec2 a = padAt(ai), b = padAt(mod(ai + 11.0 + floor(hash(k * 4.7) * 40.0), 70.0)); // never the same pad
    float l1 = abs(b.x - a.x), l2 = abs(b.y - a.y), d = v * (l1 + l2);
    vec2 p = d < l1 ? vec2(a.x + sign(b.x - a.x) * d, a.y) : vec2(b.x, a.y + sign(b.y - a.y) * (d - l1));
    s.pos = vec3(p * pitch - hb + (id.rnd.xy - 0.5) * 0.05, 0.0);
    float head = fract(id.t * 0.22 + hash(k * 9.1)) * 1.2 - 0.1;
    float pulse = exp(-pow((head - v) * 9.0, 2.0));
    s.energy = 0.45 + 0.55 * pulse;
    s.alpha = 0.22 + 0.3 * pulse;
    s.size = 1.3 + 0.9 * pulse;
  } else {
    s.pos = vec3((id.rnd.x - 0.5) * 9.0 + 0.2 * sin(id.t * 0.2 + id.ph1), (id.rnd.y - 0.5) * 6.5 + 0.2 * cos(id.t * 0.17 + id.ph2), (id.rnd.w - 0.5) * 2.0);
    s.energy = 0.3; s.alpha = 0.06; s.size = 1.2;
  }
  return s;
}

// 4. Skeleton: fifteen keypoints on a figure walking in place; particles along the limbs, clustered at the joints. No face.
void leg(vec3 hip, float ph, out vec3 knee, out vec3 ankle) {
  float a = 0.42 * sin(ph), flex = 0.12 + 0.6 * max(0.0, sin(ph + 1.9));
  knee = hip + 0.86 * vec3(sin(a), -cos(a), 0.0);
  ankle = knee + 0.86 * vec3(sin(a - flex), -cos(a - flex), 0.0);
}
void arm(vec3 sh, float ph, out vec3 elbow, out vec3 wrist) {
  float a = 0.32 * sin(ph), f = a + 0.25 + 0.2 * max(0.0, sin(ph));
  elbow = sh + 0.58 * vec3(sin(a), -cos(a), 0.0);
  wrist = elbow + 0.52 * vec3(sin(f), -cos(f), 0.0);
}
Shape skeleton(Id id) {
  Shape s = blank();
  float w = id.t * 1.7, bob = 0.04 * cos(2.0 * w);
  vec3 neck = vec3(0.0, 1.05 + bob, 0.0), pelvis = vec3(0.0, bob, 0.0), headC = neck + vec3(0.0, 0.37, 0.0);
  vec3 shL = neck + vec3(0.0, -0.06, 0.36), shR = neck + vec3(0.0, -0.06, -0.36);
  vec3 hpL = pelvis + vec3(0.0, -0.04, 0.17), hpR = pelvis + vec3(0.0, -0.04, -0.17);
  vec3 knL, anL, knR, anR, elL, wrL, elR, wrR;
  leg(hpL, w, knL, anL); leg(hpR, w + 3.14159, knR, anR);
  arm(shL, w + 3.14159, elL, wrL); arm(shR, w, elR, wrR);
  float seg = floor(id.cell.x * 15.0), u = fract(id.cell.x * 15.0);
  vec3 a = neck, b = pelvis;
  if (seg == 1.0) { b = shL; } else if (seg == 2.0) { b = shR; }
  else if (seg == 3.0) { a = shL; b = elL; } else if (seg == 4.0) { a = elL; b = wrL; }
  else if (seg == 5.0) { a = shR; b = elR; } else if (seg == 6.0) { a = elR; b = wrR; }
  else if (seg == 7.0) { a = pelvis; b = hpL; } else if (seg == 8.0) { a = pelvis; b = hpR; }
  else if (seg == 9.0) { a = hpL; b = knL; } else if (seg == 10.0) { a = knL; b = anL; }
  else if (seg == 11.0) { a = hpR; b = knR; } else if (seg == 12.0) { a = knR; b = anR; }
  else if (seg == 13.0) { b = headC - vec3(0.0, 0.2, 0.0); }
  bool joint = id.rnd.z < 0.14;
  if (joint) u = step(0.5, id.rnd.y);
  vec3 p = mix(a, b, u);
  if (seg == 14.0) { float th = u * TAU; p = headC + 0.2 * vec3(cos(th), sin(th), 0.0); }
  vec3 jit = vec3(gauss(id.rnd.xw), gauss(id.rnd.wx), gauss(id.rnd.yw));
  s.pos = p + jit * (joint ? 0.035 : 0.018);
  s.energy = joint ? 1.0 : 0.7;
  s.alpha = joint ? 0.3 : 0.34;
  s.size = joint ? 1.6 + 0.6 * id.rnd.w : 1.4;
  return s;
}

// 5. Airway: a trunk that bifurcates twice; particles stream down continuously, the terminal branches opening into a plume.
Shape airway(Id id) {
  Shape s = blank();
  bool wall = id.rnd.z < 0.35;
  float u = fract(id.cell.x + id.t * (wall ? 0.018 : 0.06 * (0.7 + 0.6 * id.rnd.w)));
  float sL = id.rnd.x < 0.5 ? -1.0 : 1.0, sR = fract(id.rnd.x * 7.0) < 0.5 ? -1.0 : 1.0;
  vec3 p0 = vec3(0.0, 1.9, 0.0), p1 = vec3(0.0, 0.55, 0.0);
  vec3 p2 = vec3(0.95 * sL, -0.35, 0.15 * sL);
  vec3 p3 = p2 + vec3(0.55 * sR + 0.1 * sL, -1.05, 0.25 * sR);
  float lvl = floor(u * 3.0), v = fract(u * 3.0);
  vec3 a = p0, b = p1;
  float r = 0.2;
  if (lvl == 1.0) { a = p1; b = p2; r = 0.15; } else if (lvl == 2.0) { a = p2; b = p3; r = 0.12 + 0.2 * v * v; }
  vec3 dir = normalize(b - a), n1 = normalize(cross(dir, vec3(0.0, 0.0, 1.0))), n2 = cross(dir, n1);
  float th = id.ph1 + (wall ? 0.0 : id.t * 0.3);
  float rad = wall ? r : r * 0.45 * abs(gauss(id.rnd.wy));
  s.pos = mix(a, b, v) + rad * (cos(th) * n1 + sin(th) * n2);
  s.energy = wall ? 0.45 : 0.85;
  s.alpha = (wall ? 0.2 : 0.32) * smoothstep(0.0, 0.03, u) * smoothstep(1.0, 0.9, u);
  s.size = wall ? 1.3 : 1.5 + 0.6 * id.rnd.w;
  return s;
}

// 6. Strata: twelve wavy laminae with a fold and a small fault; each band drifts sideways, its gaps travelling with it.
Shape strata(Id id) {
  Shape s = blank();
  float row = floor(id.cell.y * 12.0), dir = mod(row, 2.0) < 0.5 ? 1.0 : -1.0, W = 16.0;
  float xi = (id.cell.x - 0.5) * W;
  float x = (fract(id.cell.x + id.t * 0.006 * dir * (0.6 + 0.4 * hash(row))) - 0.5) * W;
  float thick = 0.012 + 0.04 * hash(row * 7.1);
  float y = (row - 5.5) * 0.38 + 0.55 * exp(-x * x / 10.0) - 0.18 * smoothstep(2.1, 2.3, x)
          + 0.07 * sin(x * 0.9 + row * 1.3 + id.t * 0.15) + 0.03 * sin(x * 2.3 - row) + thick * gauss(id.rnd.zw);
  float g = sin(xi * 0.7 + row * 2.1) * sin(xi * 0.31 + row * 5.7);
  s.pos = vec3(x, y, (id.rnd.x - 0.5) * 0.5);
  s.energy = 0.45 + 0.5 * hash(row * 3.3);
  s.alpha = 0.42 * smoothstep(0.62, 0.5, g) * smoothstep(0.5 * W, 0.5 * W - 1.0, abs(x));
  s.size = 1.4 + 0.6 * id.rnd.w;
  return s;
}

Shape sampleShape(int k, Id id) {
  if (k == 0) return orb(id);
  if (k == 1) return breath(id);
  if (k == 2) return board(id);
  if (k == 3) return skeleton(id);
  if (k == 4) return airway(id);
  return strata(id);
}

void main() {
  Id id;
  id.cell = position; id.rnd = aRandom; id.t = uTime * uMotion;
  id.side = aRandom.x < 0.5 ? -1.0 : 1.0; id.ph1 = aRandom.y * TAU; id.ph2 = aRandom.w * TAU;
  float p = clamp(uBlend * (1.0 + uStagger) - aRandom.z * uStagger, 0.0, 1.0);
  float b = p * p * (3.0 - 2.0 * p);
  Shape s = sampleShape(uFromShape, id);
  if (b > 0.0) {
    Shape t = sampleShape(uToShape, id);
    s.pos = mix(s.pos, t.pos, b); s.nrm = normalize(mix(s.nrm, t.nrm, b) + vec3(0.0, 0.0, 1e-4)); s.view = mix(s.view, t.view, b);
    s.size = mix(s.size, t.size, b); s.energy = mix(s.energy, t.energy, b); s.alpha = mix(s.alpha, t.alpha, b);
    s.sprite = mix(s.sprite, t.sprite, b); s.core = mix(s.core, t.core, b);
  }
  float release = 4.0 * b * (1.0 - b);
  float tw = uTime;
  s.pos += vec3(sin(tw * 0.43 + id.ph1), cos(tw * 0.37 + id.ph2), sin(tw * 0.29 + id.ph1 + id.ph2)) * release * uMorphDrift * (0.35 + 0.65 * aRandom.z);
  vec4 mv = uModelView * vec4(s.pos, 1.0);
  gl_Position = uProjection * mv;
  if (s.view > 0.0) {
    vec3 n = normalize((uModelView * vec4(s.nrm, 0.0)).xyz);
    float fres = pow(1.0 - abs(n.z), 1.15);
    s.energy = mix(s.energy, 0.2 + 0.8 * fres, s.view);
    s.alpha *= mix(1.0, 0.25 + 1.1 * fres, s.view);
  }
  float depth = clamp(uDepthRef / max(0.5, -mv.z), 0.5, 2.0);
  gl_PointSize = clamp(s.size * uPixelRatio * depth, 1.0, uMaxPoint);
  vColor = uColor * (0.55 + 0.45 * s.energy);
  vAlpha = s.alpha * (0.45 + 0.55 * s.energy) * uAlphaScale;
  vSprite = s.sprite; vCore = s.core;
}`;

const FRAG = /* glsl */ `
precision mediump float;
varying vec3 vColor;
varying float vAlpha;
varying vec4 vSprite;
varying float vCore;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float r2 = 4.0 * dot(c, c);
  if (r2 > 1.0) discard;
  float cov = exp(-r2 * vSprite.x) * vSprite.y + (1.0 - smoothstep(vSprite.z, vSprite.w, sqrt(r2))) * vCore;
  gl_FragColor = vec4(vColor, cov * vAlpha);
}`;

const POST_VERT = /* glsl */ `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

const P = TUNING.post;
// mediump by default; the pixel-coordinate path asks for highp where the GPU has it (fp16 cannot address a 2000 px canvas).
const POST_FRAG = /* glsl */ `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform sampler2D uSrc;
uniform vec2 uCanvas;
uniform float uDpr, uGrainTime;
uniform vec3 uBg, uInk;
float luma(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
float bayer2(vec2 a) { a = floor(a); return fract(a.x * 0.5 + a.y * a.y * 0.75); }
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
float hash2(vec2 p) { p = mod(p, 289.0); vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
void main() {
  vec3 src = texture2D(uSrc, gl_FragCoord.xy / uCanvas).rgb;
  float bg = luma(uBg);
  float sig = clamp((luma(src) - bg) / (1.0 - bg), 0.0, 1.0);
  sig = pow(clamp(sig * ${glsl(P.contrast)}, 0.0, 1.0), ${glsl(P.gamma)});
  sig = smoothstep(${glsl(P.edge0)}, ${glsl(P.edge1)}, sig);
  vec2 css = gl_FragCoord.xy / uDpr;
  float ca = cos(${glsl(P.angle)}), sa = sin(${glsl(P.angle)});
  vec2 cell = floor(mat2(ca, -sa, sa, ca) * css / ${glsl(P.cell)});
  float th = mix(bayer4(cell), hash2(cell), ${glsl(P.hashMix)});
  float cov = clamp(floor(sig * ${glsl(P.levels)} + th) / ${glsl(P.levels)}, 0.0, 1.0);
  float grain = hash2(cell + vec2(uGrainTime * 17.0, uGrainTime * 31.0));
  vec3 ground = mix(uBg, uInk, grain * grain * ${glsl(P.grain)});
  gl_FragColor = vec4(mix(ground, uInk, cov), 1.0);
}`;

type Frame = {
  from: number; to: number; blend: number; stagger: number; drift: number; time: number; motion: number;
  modelView: Float32Array; projection: Float32Array; depthRef: number; aspect: number; grainTime: number;
};

function compile(gl: WebGLRenderingContext, vs: string, fs: string, attribs: string[]) {
  const prog = gl.createProgram();
  if (!prog) return null;
  for (const [type, src] of [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]] as const) {
    const sh = gl.createShader(type);
    if (!sh) return null;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS) && !gl.isContextLost()) {
      console.warn("[dust] shader", gl.getShaderInfoLog(sh));
      return null;
    }
    gl.attachShader(prog, sh);
    gl.deleteShader(sh); // flagged; freed with the program
  }
  attribs.forEach((name, i) => gl.bindAttribLocation(prog, i, name));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS) && !gl.isContextLost()) {
    console.warn("[dust] link", gl.getProgramInfoLog(prog));
    return null;
  }
  return prog;
}

// Deterministic particle identity: cell = (column + r)/columns, (row + r)/rows, r; plus four stable randoms.
function particles(count: number) {
  const rows = TUNING.rows, cols = Math.ceil(count / rows), data = new Float32Array(count * 7);
  let s = TUNING.seed >>> 0;
  const rnd = () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0), s / 4294967296);
  for (let i = 0; i < count; i++) {
    const o = i * 7;
    data[o] = (Math.floor(i / rows) + rnd()) / cols;
    data[o + 1] = ((i % rows) + rnd()) / rows;
    data[o + 2] = rnd();
    for (let k = 0; k < 4; k++) data[o + 3 + k] = rnd();
  }
  return data;
}

function createRenderer(gl: WebGLRenderingContext, count: number) {
  const pts = compile(gl, VERT, FRAG, ["position", "aRandom"]);
  const post = compile(gl, POST_VERT, POST_FRAG, ["aPos"]);
  const pbuf = gl.createBuffer(), tbuf = gl.createBuffer(), tex = gl.createTexture(), fbo = gl.createFramebuffer();
  if (!pts || !post || !pbuf || !tbuf || !tex || !fbo) return null;
  gl.bindBuffer(gl.ARRAY_BUFFER, pbuf);
  gl.bufferData(gl.ARRAY_BUFFER, particles(count), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, tbuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const range = gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE) as Float32Array;
  const maxPoint = range?.[1] ?? 64;
  const u = (prog: WebGLProgram, names: string[]) => Object.fromEntries(names.map((n) => [n, gl.getUniformLocation(prog, n)]));
  const pu = u(pts, ["uModelView", "uProjection", "uFromShape", "uToShape", "uBlend", "uStagger", "uMorphDrift", "uTime", "uMotion",
    "uPixelRatio", "uDepthRef", "uAspect", "uAlphaScale", "uMaxPoint", "uColor"]);
  const qu = u(post, ["uSrc", "uCanvas", "uDpr", "uGrainTime", "uBg", "uInk"]);
  const bg = rgb(TUNING.colors.ground), ink = rgb(TUNING.colors.ink);
  const alphaScale = Math.sqrt(TUNING.particles.full / count);
  let dw = 1, dh = 1, rw = 1, rh = 1, pixelRatio = 1, displayDpr = 1;
  gl.disable(gl.DEPTH_TEST);
  gl.disable(gl.CULL_FACE);

  return {
    resize(cssW: number, dpr: number, w: number, h: number, ratio: number) {
      dw = w; dh = h; rw = Math.max(1, Math.round(w * ratio)); rh = Math.max(1, Math.round(h * ratio));
      pixelRatio = dpr * ratio; displayDpr = w / Math.max(1, cssW);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, rw, rh, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    },
    draw(f: Frame) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.viewport(0, 0, rw, rh);
      gl.clearColor(bg[0], bg[1], bg[2], 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(pts);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      gl.bindBuffer(gl.ARRAY_BUFFER, pbuf);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 28, 0);
      gl.enableVertexAttribArray(1);
      gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 28, 12);
      gl.uniformMatrix4fv(pu.uModelView, false, f.modelView);
      gl.uniformMatrix4fv(pu.uProjection, false, f.projection);
      gl.uniform1i(pu.uFromShape, f.from);
      gl.uniform1i(pu.uToShape, f.to);
      gl.uniform1f(pu.uBlend, f.blend);
      gl.uniform1f(pu.uStagger, f.stagger);
      gl.uniform1f(pu.uMorphDrift, f.drift);
      gl.uniform1f(pu.uTime, f.time);
      gl.uniform1f(pu.uMotion, f.motion);
      gl.uniform1f(pu.uPixelRatio, pixelRatio);
      gl.uniform1f(pu.uDepthRef, f.depthRef);
      gl.uniform1f(pu.uAspect, f.aspect);
      gl.uniform1f(pu.uAlphaScale, alphaScale);
      gl.uniform1f(pu.uMaxPoint, Math.min(14 * pixelRatio, maxPoint));
      gl.uniform3f(pu.uColor, ink[0], ink[1], ink[2]);
      gl.drawArrays(gl.POINTS, 0, count);
      gl.disableVertexAttribArray(1);
      gl.disable(gl.BLEND);

      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, dw, dh);
      gl.useProgram(post);
      gl.bindBuffer(gl.ARRAY_BUFFER, tbuf);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.uniform1i(qu.uSrc, 0);
      gl.uniform2f(qu.uCanvas, dw, dh);
      gl.uniform1f(qu.uDpr, displayDpr);
      gl.uniform1f(qu.uGrainTime, f.grainTime);
      gl.uniform3f(qu.uBg, bg[0], bg[1], bg[2]);
      gl.uniform3f(qu.uInk, ink[0], ink[1], ink[2]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    dispose() {
      if (gl.isContextLost()) return;
      gl.deleteProgram(pts); gl.deleteProgram(post);
      gl.deleteBuffer(pbuf); gl.deleteBuffer(tbuf); gl.deleteTexture(tex); gl.deleteFramebuffer(fbo);
    },
  };
}

type Renderer = NonNullable<ReturnType<typeof createRenderer>>;
type Probe = { frameMs: number; cpuMs: number; draws: number; tier: Tier; count: number; value: number; target: number; active: number; reduced: boolean; bench: (n?: number) => number };

function mountDust(scene: HTMLElement, canvas: HTMLCanvasElement): () => void {
  const root = scene.closest<HTMLElement>(".dust") ?? document.body;
  const sections = Array.from(root.querySelectorAll<HTMLElement>("[data-chapter]"));
  const dots = Array.from(root.querySelectorAll<HTMLElement>("[data-dot]"));
  const N = sections.length;
  if (N === 0) return () => undefined;

  const tier = pickTier();
  const count = TUNING.particles[tier], dprCap = TUNING.dprCap[tier], ratio = TUNING.renderRatio[tier], fps = TUNING.fps[tier];
  const coarse = matchMedia("(pointer: coarse)").matches;
  const rmq = matchMedia("(prefers-reduced-motion: reduce)");
  const dev = process.env.NODE_ENV !== "production";
  const atParam = dev ? new URLSearchParams(location.search).get("at") : null; // dev only: pin the shape index, e.g. ?at=2.5
  const at = atParam !== null && atParam !== "" && Number.isFinite(Number(atParam)) ? clamp(Number(atParam), 0, N - 1) : null;

  let reduced = rmq.matches;
  let centres: number[] = [];
  let value = at ?? 0, vel = 0, time = 0, active = -1, shown = 0, dirty = true;
  let cssW = 0, cssH = 0, dpr = 1;
  let gl: WebGLRenderingContext | null = null, renderer: Renderer | null = null;
  let raf = 0, last = 0, acc = 0, onScreen = true, lost = false, fadeTimer = 0;
  const frameRing: number[] = [], cpuRing: number[] = [];
  let draws = 0;

  const measure = () => {
    centres = sections.map((s) => { const r = s.getBoundingClientRect(); return r.top + window.scrollY + r.height / 2; });
  };
  const progressNow = () => {
    const probe = window.scrollY + window.innerHeight / 2;
    if (probe <= centres[0]) return 0;
    for (let i = 0; i < N - 1; i++) if (probe < centres[i + 1]) return i + (probe - centres[i]) / Math.max(1, centres[i + 1] - centres[i]);
    return N - 1;
  };
  const shapeIndex = (p: number) => {
    if (N < 2) return 0;
    const i = Math.min(Math.floor(p), N - 2), S = TUNING.deadBand;
    return i + smooth(clamp((p - i - S) / (1 - 2 * S), 0, 1));
  };
  const setActive = (i: number) => {
    if (i === active) return;
    const first = active < 0;
    active = i;
    sections.forEach((s, k) => { s.toggleAttribute("data-active", k === i); s.toggleAttribute("inert", k !== i); });
    dots.forEach((d, k) => (k === i ? d.setAttribute("aria-current", "step") : d.removeAttribute("aria-current")));
    if (!reduced) return;
    window.clearTimeout(fadeTimer);
    if (first) { shown = i; dirty = true; return; }
    canvas.style.opacity = "0"; // reduced motion: discrete shapes, 0.4 s cross-fade through the ground
    fadeTimer = window.setTimeout(() => { shown = active; dirty = true; canvas.style.opacity = "1"; }, TUNING.reducedFadeMs);
  };

  const pose = (i: number, aspect: number, visH: number, t: number) => {
    const p = POSES[i];
    const hw = i === 1 ? breathWidth(aspect) * 0.55 : p.halfW;
    const dist = Math.max(2 * p.halfH / (TUNING.camera.fillH * visH), p.fitW ? 2 * hw / (TUNING.camera.fillW * visH * aspect) : 0) + p.depth;
    const yaw = p.yaw + (p.sway > 0 ? p.sway * Math.sin((t * TUNING.camera.rotationSpeed) / p.sway) : 0);
    return { dist, tilt: p.tilt, yaw, yOff: p.yOff };
  };

  const render = () => {
    if (!renderer || cssW < 1 || cssH < 1) return;
    const motion = reduced ? 0 : 1;
    const v = reduced ? shown : value;
    const from = Math.min(N - 1, Math.floor(v)), to = Math.min(N - 1, from + 1), blend = v - from;
    const pace = from === 0 && blend > 0 ? TUNING.pace.orb : TUNING.pace.normal;
    const aspect = cssW / cssH, c = TUNING.camera;
    const fit = Math.max(Math.min(0.92, 1.4 / aspect), 0.62 / aspect);
    const fov = 2 * Math.atan(Math.tan((c.fovDeg / 2) * (Math.PI / 180)) * fit);
    const visH = 2 * Math.tan(fov / 2);
    const tt = time * motion, e = smooth(blend);
    const a = pose(from, aspect, visH, tt), b = pose(to, aspect, visH, tt);
    const dist = lerp(a.dist, b.dist, e);
    const lift = aspect < 1 ? c.portraitLift * visH * dist : 0;
    const view = mat4.lookAt([0, -lift, dist], [0, -lift, 0], [0, 1, 0]);
    const model = mat4.root(lerp(a.tilt, b.tilt, e), lerp(a.yaw, b.yaw, e), lerp(a.yOff, b.yOff, e));
    renderer.draw({
      from, to, blend, stagger: pace.stagger, drift: pace.drift, time, motion,
      modelView: mat4.multiply(view, model), projection: mat4.perspective(fov, aspect, c.near, c.far),
      depthRef: dist, aspect, grainTime: reduced ? 0 : Math.floor(performance.now() / (1000 / TUNING.post.grainHz)) % 1024,
    });
  };

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    let dt = Math.min(TUNING.maxDt, (now - last) / 1000);
    last = now;
    if (fps > 0) {
      const step = 1 / fps;
      acc += dt;
      if (acc < step - 0.001) return; // epsilon: rAF jitter must not drop a 30 fps frame
      acc = acc - step > step ? 0 : acc - step;
      dt = step;
    }
    const p = at ?? progressNow();
    setActive(Math.round(p));
    const target = at ?? shapeIndex(p);
    if (reduced) {
      if (!dirty) return;
    } else if (at !== null) {
      value = at;
    } else {
      const seg = Math.floor(Math.min(value, target));
      const w = 5 / (seg === 0 ? TUNING.pace.orb.seconds : TUNING.pace.normal.seconds);
      const goal = value + clamp(target - value, -TUNING.spring.maxStep, TUNING.spring.maxStep);
      const err = value - goal, k = Math.exp(-w * dt), tmp = (vel + w * err) * dt;
      value = goal + (err + tmp) * k;
      vel = (vel - w * tmp) * k;
      if (Math.abs(target - value) < TUNING.spring.snapErr && Math.abs(vel) < TUNING.spring.snapVel) { value = target; vel = 0; }
      value = clamp(value, 0, N - 1);
      time += dt;
    }
    const t0 = performance.now();
    render();
    dirty = false;
    draws++;
    if (dev) {
      frameRing.push(dt * 1000); cpuRing.push(performance.now() - t0);
      if (frameRing.length > 120) { frameRing.shift(); cpuRing.shift(); }
      const mean = (r: number[]) => r.reduce((s, x) => s + x, 0) / r.length;
      (window as Window & { __dust?: Probe }).__dust = { frameMs: mean(frameRing), cpuMs: mean(cpuRing), draws, tier, count, value: reduced ? shown : value, target, active, reduced, bench };
    }
  };

  // Dev only: n synchronous frames, each forced to completion by a 1 px readback, so the mean includes GPU time.
  const bench = (n = 120) => {
    if (!gl || !renderer) return NaN;
    const px = new Uint8Array(4), t0 = performance.now();
    for (let i = 0; i < n; i++) { render(); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); }
    return (performance.now() - t0) / n;
  };

  const sync = () => {
    const run = !!renderer && !lost && onScreen && document.visibilityState === "visible";
    if (run && !raf) { last = performance.now(); acc = 0; dirty = true; raf = requestAnimationFrame(frame); }
    else if (!run && raf) { cancelAnimationFrame(raf); raf = 0; }
  };

  const applySize = (w: number, h: number) => {
    cssW = w; cssH = h;
    dpr = Math.min(window.devicePixelRatio || 1, dprCap);
    const dw = Math.max(1, Math.round(w * dpr)), dh = Math.max(1, Math.round(h * dpr));
    canvas.style.width = `${w}px`; // explicit px so an ignored URL-bar resize leaves ground, not a stretched frame
    canvas.style.height = `${h}px`;
    canvas.width = dw; canvas.height = dh;
    renderer?.resize(w, dpr, dw, dh, ratio);
    dirty = true;
  };

  const init = () => {
    try {
      gl = canvas.getContext("webgl", { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: "low-power", premultipliedAlpha: false });
      renderer = gl ? createRenderer(gl, count) : null;
    } catch {
      renderer = null;
    }
    // data-ready only with a live renderer; without one, data-fallback puts the copy back into the page flow
    if (renderer) { root.setAttribute("data-ready", ""); root.removeAttribute("data-fallback"); }
    else { root.removeAttribute("data-ready"); root.setAttribute("data-fallback", ""); }
    if (renderer && cssW > 0) renderer.resize(cssW, dpr, canvas.width, canvas.height, ratio);
  };

  const onLost = (e: Event) => { e.preventDefault(); lost = true; renderer = null; root.removeAttribute("data-ready"); root.setAttribute("data-fallback", ""); sync(); };
  const onRestored = () => { lost = false; init(); sync(); };
  const onVisibility = () => sync();
  const onOrientation = () => measure();
  const onMotionPref = () => { reduced = rmq.matches; shown = active < 0 ? 0 : active; value = shown; vel = 0; canvas.style.opacity = "1"; dirty = true; };

  const ro = new ResizeObserver(() => {
    const w = scene.clientWidth, h = scene.clientHeight;
    if (w === cssW && h === cssH) return;
    if (coarse && w === cssW && Math.abs(h - cssH) < TUNING.coarseResizeIgnorePx) return;
    applySize(w, h);
    measure();
  });
  const rootRo = new ResizeObserver(() => measure());
  const io = new IntersectionObserver((entries) => { onScreen = entries[entries.length - 1].isIntersecting; sync(); }, { threshold: 0.01 });

  measure();
  applySize(scene.clientWidth, scene.clientHeight);
  init();
  ro.observe(scene);
  rootRo.observe(root);
  io.observe(canvas);
  canvas.addEventListener("webglcontextlost", onLost);
  canvas.addEventListener("webglcontextrestored", onRestored);
  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("orientationchange", onOrientation);
  rmq.addEventListener("change", onMotionPref);
  sync();

  return () => {
    cancelAnimationFrame(raf); raf = 0;
    window.clearTimeout(fadeTimer);
    ro.disconnect(); rootRo.disconnect(); io.disconnect();
    canvas.removeEventListener("webglcontextlost", onLost);
    canvas.removeEventListener("webglcontextrestored", onRestored);
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("orientationchange", onOrientation);
    rmq.removeEventListener("change", onMotionPref);
    renderer?.dispose(); renderer = null; gl = null;
    sections.forEach((s) => { s.removeAttribute("data-active"); s.removeAttribute("inert"); });
    dots.forEach((d) => d.removeAttribute("aria-current"));
    root.removeAttribute("data-ready");
    root.removeAttribute("data-fallback");
  };
}

export function DustField() {
  const scene = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => (scene.current && canvas.current ? mountDust(scene.current, canvas.current) : undefined), []);
  return (
    <div className="dust__scene" ref={scene}>
      <canvas ref={canvas} aria-hidden="true" />
    </div>
  );
}
