"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { BOOMERANG_PATH } from "./boomerang";

/* ==================================================================
   Jelly field

   The ground of the second screen, seen through a slab of jelly.

   Under the slab the ground is white, and on it lie things of black
   glass: the boomerang, huge on the right and tipped as if caught
   mid-throw, and ten loose drops of no set shape that wander slowly
   over the whole screen, each one lobed and slowly changing its outline. They are lit as solids, so they read as objects rather
   than as ink: dark in the body, a rim that catches the white around
   them, a hard highlight from the top left and a soft shadow thrown
   down and to the right. Where a drop comes close to another, or to the
   mark, the two pull together the way two drops of oil do. The mark's
   edge is softened a few pixels, but its outline is its own.

   The mark is not there when the screen opens: it drags itself in from
   past the right edge, quick to start and slow to stop as if the jelly
   were holding it back, trailing a smear of itself and shoving the slab
   aside as it goes, and comes to rest where it always stands, with the
   jelly still wobbling from its arrival.

   No drop ever goes behind the words. The drops are based evenly through
   the room the words and the mark leave, whatever the shape of the
   screen, and one that wanders up to the words slides along their edge.

   The slab covers the whole screen and never stops moving: it wobbles
   in place the way a set jelly does when the plate is touched, just as
   much in every part of the screen, so everything under it is always
   visibly bent. The hand does not carry the effect, it touches it. A moving
   pointer presses a dent into the slab, and the dent is dragged along
   with it; when the pointer stops or leaves, the jelly springs back,
   overshoots into a bulge, and wobbles itself flat. The slab is a
   grid of springs, each tied to its rest and to its neighbours, which
   is what makes a poke spread a little way and die down rather than
   travel off like a ripple on water.

   Drawn on one WebGL2 canvas, and only while it can be seen. For anyone
   who has asked for less motion it is drawn once and holds still, and
   the pointer does nothing to it.

   The mark keeps one pose on every screen. Where the screen is wide it
   stands on the right of the copy; where it is upright it lies across the
   bottom right, under the copy.
   ================================================================== */

/** Mark units: the elbow's outer point, before rotation (see boomerang.tsx). */
const ELBOW = { x: 0, y: 58 };
/** The slab's springs, one per this many CSS pixels. */
const CELL = 8;
/** Pull back to rest, pull towards the neighbours, and loss, per second. */
const REST = 70;
const COUPLE = 420;
const DAMP = 2.4;
/** How hard a moving pointer presses, in CSS pixels per second squared,
    and over what radius, in CSS pixels. The slab's height is in CSS pixels. */
const PRESS = 2600;
const PRESS_RADIUS = 85;
/** The pointer speed, in CSS pixels per second, that presses fully. */
const FULL_SPEED = 900;
/** How deep the jelly's own wobble is, in CSS pixels, wave by wave. Seven
    of them together bend what is under it by about 24px on average. */
const WOBBLE = 12;
/** How far the slab bends what is under it, in CSS pixels per unit of slope. */
const REFRACT = 85;
/** How far a drop keeps from the words: its own reach, lobes included,
    as a multiple of its radius, and a margin on top, in CSS pixels. */
const CLEAR_REACH = 2.3;
const CLEAR_MARGIN = 22;
/** Below this width to height, the screen counts as upright: the mark lies
    low and the copy sits high (matches the `upright` variant in CSS). */
const UPRIGHT = 23 / 20;
const MAX_DPR = 1.5;
/** Where the still screen is frozen, in seconds. */
const STILL_T = 24;

/** The boomerang's way in: how long it takes to drag itself across, in
    seconds, and how long a smear it leaves behind at full speed. */
const ENTER_S = 2.1;
const SMEAR = 0.11;
/** The longest that smear gets, in CSS pixels. */
const MAX_SMEAR = 90;
/** How hard the mark shoves the jelly aside on its way in. */
const SHOVE = 2400;
const SHOVE_RADIUS = 130;

/** A fixed sequence of numbers that look random, so the drops are the
    same on every visit. */
function seeded(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* The loose drops. Where they sit is worked out for each screen (see
   layoutDrops); what each one is stays fixed: its periods in seconds, its
   size as a share of the screen's shorter side, and how drawn out it is.
   None is a single round shape: each is a body with two lobes
   hung off it at angles of its own, and the lobes drift round the body
   and swell and shrink on their own slow clocks, so every drop keeps
   changing its outline without ever coming apart. */
const DROPS = (() => {
  const r = seeded(7);
  const range = (lo: number, hi: number) => lo + r() * (hi - lo);
  return Array.from({ length: 13 }, () => ({
    px: range(55, 125),
    py: range(55, 125),
    r: range(0.035, 0.085),
    aspect: range(1.1, 1.8),
    spin: range(0.03, 0.08) * (r() < 0.5 ? -1 : 1),
    lobes: [0, 1].map(() => ({
      angle: range(0, Math.PI * 2),
      reach: range(0.55, 0.95),
      size: range(0.45, 0.75),
      aspect: range(1, 1.9),
      drift: range(0.12, 0.35) * (r() < 0.5 ? -1 : 1),
    })),
  }));
})();
/** Three shapes to a drop. */
const MAX_BLOBS = 13 * 3;

const VERTEX = `#version 300 es
in vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }`;

const FRAGMENT = `#version 300 es
precision highp float;
out vec4 outColor;

uniform vec2 u_size;      // CSS pixels
uniform float u_dpr;
uniform float u_t;
uniform vec4 u_drop[${MAX_BLOBS}];   // x, y, radius, aspect (CSS pixels)
uniform float u_turn[${MAX_BLOBS}];
uniform int u_drops;
uniform float u_markPad;  // how far the mark's texture reaches left of the screen
uniform float u_shift;     // how far right of its place the mark still is
uniform float u_smear;     // how long a tail it drags behind it
uniform sampler2D u_mark;  // r: the mark, softened; g: the mark, rounded
uniform sampler2D u_slab;  // the slab's height, one texel per spring

// The loose drops as one field: above 0.5 is inside one. Drops that come
// close pull together.
float drops(vec2 p) {
  // Two slow warps, a broad one and a tighter one, so no edge is ever a
  // clean curve.
  vec2 w = p + vec2(sin(p.y * 0.0061 + u_t * 0.31), cos(p.x * 0.0053 - u_t * 0.27)) * 16.0
             + vec2(sin(p.y * 0.017 - u_t * 0.5), cos(p.x * 0.019 + u_t * 0.45)) * 7.0;
  float f = 0.0;
  for (int i = 0; i < ${MAX_BLOBS}; i++) {
    if (i >= u_drops) break;
    vec4 d = u_drop[i];
    vec2 far = w - d.xy;
    // Too far to count for anything here.
    if (dot(far, far) > 9.0 * d.z * d.z * d.w * d.w) continue;
    float c = cos(u_turn[i]);
    float s = sin(u_turn[i]);
    vec2 q = w - d.xy;
    q = vec2(c * q.x + s * q.y, -s * q.x + c * q.y);
    q.x /= d.w;
    f += exp(-dot(q, q) / (d.z * d.z));
  }
  return f;
}

// The mark on its own, so no drop ever runs into its outline: softened at
// the edge, rounded across for the light. Also above 0.5 inside.
float markAt(vec2 p) {
  vec2 uv = vec2((p.x + u_markPad) / (u_size.x + u_markPad), p.y / u_size.y);
  vec2 m = texture(u_mark, uv).rg;
  return m.r * 0.6 + m.g * 0.6;
}

// Where it is on its way in, with the tail it drags behind it: copies laid
// back towards where it came from, each a little thinner.
float mark(vec2 p) {
  vec2 b = p - vec2(u_shift, 0.0);
  float f = markAt(b);
  if (u_smear > 0.5) {
    // Close enough together that the tail reads as one smear, not a stack.
    for (int k = 1; k <= 14; k++) {
      float s = float(k) / 14.0;
      f = max(f, markAt(b - vec2(u_smear * s, 0.0)) * (1.0 - 0.4 * s));
    }
  }
  return f;
}

const vec3 LIGHT = vec3(-0.45, -0.6, 0.66);

// A drop's surface from its field: a dome, gentle over the middle and
// steep at the edge, so it reads as a solid bead and not as a dish.
float dome(float f) {
  // Levels off smoothly where drops pile up, never to a flat top.
  return sqrt(1.0 - exp(-max(f - 0.44, 0.0) * 2.2));
}

// Black glass, from the field's slope: a dark body, a rim that catches the
// white ground, one hard highlight and a broad soft one.
float glass(vec2 g, float steep) {
  vec3 n = normalize(vec3(-g * steep, 1.0));
  vec3 h = normalize(normalize(LIGHT) + vec3(0.0, 0.0, 1.0));
  float nh = max(dot(n, h), 0.0);
  float rim = pow(1.0 - n.z, 3.0);
  return min(0.015 + rim * 0.45 + pow(nh, 90.0) * 0.95 + pow(nh, 10.0) * 0.08, 1.0);
}

// The springs' height at a point: what the hand and the mark have done.
float slab(vec2 p) {
  return texture(u_slab, p / u_size).r;
}

// The slope of the jelly's own wobble, which never stops. Seven waves,
// one to each of seven directions spread evenly round the half circle and
// of lengths close to one another, each standing in place and swinging on
// a clock of its own, with a slow drift under it. Laid over one another
// like that they have no grain and no calm patches: the jelly moves as
// much in one part of the screen as in any other, and at every moment.
vec2 wobble(vec2 p) {
  vec2 g = vec2(0.0);
  for (int i = 0; i < 7; i++) {
    float fi = float(i);
    float a = fi * 0.4488 + 0.21;               // pi / 7 apart
    vec2 d = vec2(cos(a), sin(a));
    float len = 300.0 + 60.0 * mod(fi * 3.0, 5.0);
    float k = 6.2832 / len;
    float swing = cos(u_t * (1.15 + 0.17 * fi) + fi * 2.4);
    float s = dot(p, d) * k + fi * 1.9 + u_t * 0.22 * (mod(fi, 2.0) * 2.0 - 1.0);
    g += d * (k * cos(s) * swing);
  }
  return g * ${WOBBLE.toFixed(1)};
}

void main() {
  vec2 p = vec2(gl_FragCoord.x, u_size.y * u_dpr - gl_FragCoord.y) / u_dpr;

  // The slab: its slope bends what is seen through it.
  // Read a whole spring either side: the springs are filtered linearly, and
  // a slope read across one spring is continuous where a finer one would
  // step at every spring and show the grid.
  float e = ${CELL.toFixed(1)};
  vec2 gs = vec2(slab(p + vec2(e, 0.0)) - slab(p - vec2(e, 0.0)),
                 slab(p + vec2(0.0, e)) - slab(p - vec2(0.0, e))) / (2.0 * e);
  gs += wobble(p);
  vec2 q = p + gs * ${REFRACT.toFixed(1)};
  vec3 ns = normalize(vec3(-gs, 1.0));

  // What lies under it, at the bent point: the drops, and the mark over
  // them.
  float d = 1.5;
  float fd = drops(q);
  float hd = dome(fd);
  vec2 gd = vec2(dome(drops(q + vec2(d, 0.0))) - hd, dome(drops(q + vec2(0.0, d))) - hd) / d;
  float fm = mark(q);
  vec2 gm = vec2(mark(q + vec2(2.0, 0.0)) - mark(q - vec2(2.0, 0.0)),
                 mark(q + vec2(0.0, 2.0)) - mark(q - vec2(0.0, 2.0))) / 4.0;
  float bodyD = smoothstep(0.44, 0.56, fd);
  float bodyM = smoothstep(0.44, 0.56, fm);

  // A soft shadow from both, thrown down and to the right.
  vec2 fall = q - vec2(14.0, 20.0);
  float shade = smoothstep(0.15, 0.9, max(drops(fall), mark(fall))) * 0.1;
  float col = 1.0 - shade;
  col = mix(col, glass(gd, 70.0), bodyD);
  col = mix(col, glass(gm, 150.0), bodyM);

  vec3 l = normalize(LIGHT);
  vec3 h = normalize(l + vec3(0.0, 0.0, 1.0));

  // The slab itself: its slopes lighten and darken the ground a little,
  // and it has a sheen of its own where it faces the light.
  float lit = dot(ns, l) - l.z;
  // Strong enough that the jelly can be seen lying over the white, as soft
  // moving shade, and not only in what it does to the black under it.
  col *= 1.0 + lit * 0.6;
  float sheen = pow(max(dot(ns, h), 0.0), 90.0);
  col += sheen * 0.5 * (1.0 - col);

  outColor = vec4(vec3(clamp(col, 0.0, 1.0)), 1.0);
}`;

/** Where the mark stands for a screen of this size. */
function placeMark(w: number, h: number) {
  // One pose everywhere, tipped as if thrown: the elbow points up and to
  // the left, one arm runs out past the right edge, rising, and the other
  // drops away past the bottom. The inside of the elbow always stays on
  // the screen: the notch is what makes it the mark and not a blot.
  const theta = Math.PI / 2 + 0.36;
  let scale: number;
  let elbow: { x: number; y: number };
  if (w / h < UPRIGHT) {
    // Upright: the copy has the top of the screen, so the mark lies across
    // the bottom right, the rising arm leaving past the right edge below
    // the words. Never so small that that arm stops short of the edge.
    scale = Math.max(w * 0.0052, Math.min(w * 0.0078, h * 0.0042));
    elbow = { x: w * 0.3, y: h * 0.72 };
  } else {
    // Wide: the copy has the left, the mark stands on the right.
    scale = Math.min(h * 0.0058, w * 0.0037);
    elbow = { x: w * 0.735, y: h * 0.47 };
  }
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  const ox = elbow.x - (ELBOW.x * c - ELBOW.y * s) * scale;
  const oy = elbow.y - (ELBOW.x * s + ELBOW.y * c) * scale;
  return { theta, scale, ox, oy, elbow };
}

/** Box blurs a float image in place, `passes` times at radius `r`. */
function smoothFloats(img: Float32Array, w: number, h: number, r: number, passes: number) {
  const tmp = new Float32Array(img.length);
  const span = r * 2 + 1;
  for (let pass = 0; pass < passes; pass++) {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let sum = 0;
        for (let k = -r; k <= r; k++) sum += img[y * w + Math.min(w - 1, Math.max(0, x + k))];
        tmp[y * w + x] = sum / span;
      }
    }
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let sum = 0;
        for (let k = -r; k <= r; k++) sum += tmp[Math.min(h - 1, Math.max(0, y + k)) * w + x];
        img[y * w + x] = sum / span;
      }
    }
  }
}

/** The mark as two soft masks: one softened only at the edge, for its
    outline, and one rounded right across, for how it catches the light. */
function drawMark(w: number, h: number, pad: number) {
  const place = placeMark(w, h);
  // At half resolution, then smoothed as floats: an 8-bit mask read for
  // its slope shows its steps as bands in the highlights.
  const k = 0.5;
  // Wider than the screen by `pad` on the left: while the mark is still
  // on its way in, what is drawn there is the part of it now off the left
  // edge, and it has to exist to be seen.
  const cw = Math.max(1, Math.round((w + pad) * k));
  const ch = Math.max(1, Math.round(h * k));
  const layer = (blur: number) => {
    const c = document.createElement("canvas");
    c.width = cw;
    c.height = ch;
    const pen = c.getContext("2d", { willReadFrequently: true });
    if (!pen) return null;
    pen.filter = `blur(${blur * k}px)`;
    pen.setTransform(k, 0, 0, k, pad * k, 0);
    pen.translate(place.ox, place.oy);
    pen.rotate(place.theta);
    pen.scale(place.scale, place.scale);
    pen.fillStyle = "#fff";
    pen.fill(new Path2D(BOOMERANG_PATH));
    return pen.getImageData(0, 0, cw, ch).data;
  };
  // The rounding follows the arm's own thickness.
  const arm = 19 * place.scale;
  const edge = layer(Math.max(2, arm * 0.05));
  const round = layer(arm * 0.3);
  const n = cw * ch;
  const a = new Float32Array(n);
  const b = new Float32Array(n);
  if (edge && round) {
    for (let i = 0; i < n; i++) {
      a[i] = edge[i * 4 + 3] / 255;
      b[i] = round[i * 4 + 3] / 255;
    }
    smoothFloats(a, cw, ch, 1, 2);
    smoothFloats(b, cw, ch, 2, 3);
  }
  const out = new Float32Array(n * 2);
  let left = cw;
  for (let i = 0; i < n; i++) {
    out[i * 2] = a[i];
    out[i * 2 + 1] = b[i];
    if (a[i] > 0.05) left = Math.min(left, i % cw);
  }
  // The mark's leftmost point, in CSS pixels, for knowing how far right it
  // has to start to be out of sight.
  return { data: out, width: cw, height: ch, left: left / k - pad, elbow: place.elbow, mask: a, scale: k };
}

export function JellyField({
  className,
  arrive,
  arriveDelay = 0,
}: {
  className?: string;
  /** Given, the mark waits out of sight until this turns true, and then
      drags itself in from the right. Left out, it is simply there. */
  arrive?: boolean;
  /** Seconds between `arrive` turning true and the mark setting off. */
  arriveDelay?: number;
}) {
  const reduce = useReducedMotion() ?? false;
  const canvas = useRef<HTMLCanvasElement>(null);
  const entrance = arrive !== undefined;
  // When the mark sets off, on the performance clock; null until then.
  const setOff = useRef<number | null>(null);

  useEffect(() => {
    if (arrive && setOff.current === null) setOff.current = performance.now() + arriveDelay * 1000;
  }, [arrive, arriveDelay]);

  useEffect(() => {
    const view = canvas.current;
    if (!view) return;
    const gl = view.getContext("webgl2", { antialias: false });
    if (!gl) return;

    const compile = (type: number, source: string) => {
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, source);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(s));
        return null;
      }
      return s;
    };
    const vs = compile(gl.VERTEX_SHADER, VERTEX);
    const fs = compile(gl.FRAGMENT_SHADER, FRAGMENT);
    const program = gl.createProgram();
    if (!vs || !fs || !program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const cache = new Map<string, WebGLUniformLocation | null>();
    const u = (name: string) => {
      if (!cache.has(name)) cache.set(name, gl.getUniformLocation(program, name));
      return cache.get(name) ?? null;
    };

    const texture = (unit: number) => {
      const t = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return t;
    };
    const markTex = texture(0);
    const slabTex = texture(1);
    gl.uniform1i(u("u_mark"), 0);
    gl.uniform1i(u("u_slab"), 1);

    const section = view.closest("section") ?? view.parentElement ?? view;

    let disposed = false;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let seconds = reduce ? STILL_T : 0;

    /* ---- the slab ---- */

    let cols = 0;
    let rows = 0;
    let height = new Float32Array(0);
    let speed = new Float32Array(0);

    const pointer = { x: 0, y: 0, at: 0, inside: false, fresh: false };
    let press = 0;
    let pace = 0;

    // What is pressing on the slab this step: the hand, and the mark while
    // it drags itself in. In cells.
    type Poke = { x: number; y: number; r: number; force: number; q0: number; q1: number; r0: number; r1: number };
    let shove: { x: number; y: number; force: number } | null = null;

    const poke = (x: number, y: number, radius: number, force: number): Poke => {
      const px = x / CELL;
      const py = y / CELL;
      const pr = radius / CELL;
      return {
        x: px,
        y: py,
        r: pr,
        force,
        q0: Math.max(0, Math.floor(px - pr * 3)),
        q1: Math.min(cols - 1, Math.ceil(px + pr * 3)),
        r0: Math.max(0, Math.floor(py - pr * 3)),
        r1: Math.min(rows - 1, Math.ceil(py + pr * 3)),
      };
    };

    const stepSlab = (dt: number) => {
      // The press follows how fast the hand is moving: in quickly, out
      // more slowly, so a dent outlives the flick that made it by a beat.
      const want = pointer.inside ? Math.min(pace / FULL_SPEED, 1) : 0;
      press += (want - press) * (want > press ? 0.35 : 0.1);
      pace *= 0.8;

      const pokes: Poke[] = [];
      if (press > 0.001) pokes.push(poke(pointer.x, pointer.y, PRESS_RADIUS, press * PRESS));
      if (shove && shove.force > 1) pokes.push(poke(shove.x, shove.y, SHOVE_RADIUS, shove.force));

      // Two half steps keep the springs steady at 60fps.
      const sub = dt / 2;
      for (let pass = 0; pass < 2; pass++) {
        for (let r = 0; r < rows; r++) {
          const up = r > 0 ? -cols : 0;
          const down = r < rows - 1 ? cols : 0;
          for (let q = 0; q < cols; q++) {
            const i = r * cols + q;
            const left = q > 0 ? -1 : 0;
            const right = q < cols - 1 ? 1 : 0;
            const hi = height[i];
            const lap = height[i + left] + height[i + right] + height[i + up] + height[i + down] - 4 * hi;
            let a = -REST * hi + COUPLE * lap - DAMP * speed[i];
            for (const k of pokes) {
              if (q < k.q0 || q > k.q1 || r < k.r0 || r > k.r1) continue;
              const dx = q - k.x;
              const dy = r - k.y;
              // Pressed down, into the slab.
              a -= k.force * Math.exp(-(dx * dx + dy * dy) / (k.r * k.r));
            }
            speed[i] += a * sub;
          }
        }
        for (let i = 0; i < height.length; i++) height[i] += speed[i] * sub;
      }
    };

    const sendSlab = () => {
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, slabTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16F, cols, rows, 0, gl.RED, gl.FLOAT, height);
    };

    /* ---- the drops ---- */

    // Where the words are, in the section's CSS pixels. It only ever grows
    // until the screen changes size: the rotating line is measured at each
    // of its widths in turn, and the drops are kept clear of the widest.
    let quiet: DOMRect | null = null;
    const measureQuiet = () => {
      const origin = section.getBoundingClientRect();
      const range = document.createRange();
      let x0 = Infinity;
      let y0 = Infinity;
      let x1 = -Infinity;
      let y1 = -Infinity;
      for (const el of section.querySelectorAll("[data-jelly-quiet]")) {
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
          if (!node.textContent?.trim() || node.parentElement?.closest(".sr-only")) continue;
          range.selectNodeContents(node);
          const b = range.getBoundingClientRect();
          if (!b.width) continue;
          x0 = Math.min(x0, b.left - origin.left);
          y0 = Math.min(y0, b.top - origin.top);
          x1 = Math.max(x1, b.right - origin.left);
          y1 = Math.max(y1, b.bottom - origin.top);
        }
      }
      if (!Number.isFinite(x0)) return;
      if (quiet) {
        const grew =
          x0 < quiet.left - 4 || y0 < quiet.top - 4 || x1 > quiet.right + 4 || y1 > quiet.bottom + 4;
        if (!grew) return;
        x0 = Math.min(x0, quiet.left);
        y0 = Math.min(y0, quiet.top);
        x1 = Math.max(x1, quiet.right);
        y1 = Math.max(y1, quiet.bottom);
      }
      quiet = new DOMRect(x0, y0, x1 - x0, y1 - y0);
      layoutDrops();
    };

    // The mark as it stands once it has arrived, for keeping drops from
    // being set down under it.
    let markMask: { data: Float32Array; width: number; height: number; pad: number; k: number } | null = null;
    const underMark = (x: number, y: number) => {
      if (!markMask) return false;
      const q = Math.floor((x + markMask.pad) * markMask.k);
      const r = Math.floor(y * markMask.k);
      if (q < 0 || r < 0 || q >= markMask.width || r >= markMask.height) return false;
      return markMask.data[r * markMask.width + q] > 0.2;
    };

    /** How far drop i keeps from the words. */
    const clearance = (i: number) => DROPS[i].r * Math.min(w, h) * CLEAR_REACH + CLEAR_MARGIN;
    const inWords = (x: number, y: number, c: number) =>
      !!quiet && x > quiet.left - c && x < quiet.right + c && y > quiet.top - c && y < quiet.bottom + c;

    /* Where each drop is based, for this screen. Each is set down in turn
       at whichever of many free spots is furthest from the drops already
       down, weighed by how big the two are, then all are eased apart a
       little more. However the screen is shaped, the drops end up spread
       evenly through the room the words and the mark leave, round the
       words rather than bunched to one side of them. Each drop then
       wanders a little way round its base. */
    let bases: { x: number; y: number }[] = [];
    let wander = 0;
    const layoutDrops = () => {
      const n = count();
      const pick = seeded(11);
      const x0 = w * 0.03;
      const x1 = w * 0.97;
      // Clear of the floating bar, which would cut the top off a drop.
      const y0 = Math.max(h * 0.07, 110);
      const y1 = h * 0.95;
      const free = (x: number, y: number, i: number) => !inWords(x, y, clearance(i)) && !underMark(x, y);

      // How much room a drop takes: what it reaches, lobes included.
      const side = Math.min(w, h);
      const reach = (i: number) => DROPS[i].r * side * CLEAR_REACH;
      // Distance to the nearest edge counts too, so the edges fill as well.
      // Distance to the nearest edge counts for less than distance to a
      // neighbour, so drops are not all drawn to the same margin and lined
      // up along it.
      const edgeGap = (x: number, y: number) => Math.min(x - x0, x1 - x, y - y0, y1 - y) * 3;

      bases = [];
      for (let i = 0; i < n; i++) {
        let best = { x: x0 + (x1 - x0) / 2, y: y0 + (y1 - y0) / 2 };
        let bestScore = -Infinity;
        for (let tries = 0; tries < 60; tries++) {
          const x = x0 + pick() * (x1 - x0);
          const y = y0 + pick() * (y1 - y0);
          if (!free(x, y, i)) continue;
          let score = edgeGap(x, y);
          for (let j = 0; j < bases.length; j++) {
            const d = Math.hypot(x - bases[j].x, y - bases[j].y) - reach(i) - reach(j);
            score = Math.min(score, d);
          }
          if (score > bestScore) {
            bestScore = score;
            best = { x, y };
          }
        }
        bases.push(best);
      }

      const room = Math.sqrt(((x1 - x0) * (y1 - y0) * 0.7) / n);
      for (let pass = 0; pass < 30; pass++) {
        for (let i = 0; i < n; i++) {
          const b = bases[i];
          let fx = 0;
          let fy = 0;
          for (let j = 0; j < n; j++) {
            if (j === i) continue;
            const dx = b.x - bases[j].x;
            const dy = b.y - bases[j].y;
            const d = Math.hypot(dx, dy) || 1;
            // Never closer than the two reach, so neighbours stay apart.
            const want = Math.max(room, (reach(i) + reach(j)) * 1.2);
            if (d < want) {
              fx += (dx / d) * (want - d);
              fy += (dy / d) * (want - d);
            }
          }
          const nx = Math.min(Math.max(b.x + fx * 0.12, x0), x1);
          const ny = Math.min(Math.max(b.y + fy * 0.12, y0), y1);
          // A move into the words or under the mark is taken only along
          // the axis that stays clear, so drops slide round them.
          if (free(nx, ny, i)) {
            b.x = nx;
            b.y = ny;
          } else if (free(nx, b.y, i)) {
            b.x = nx;
          } else if (free(b.x, ny, i)) {
            b.y = ny;
          }
        }
      }
      // Then each is knocked a little off where the spacing left it, so no
      // two sit on the same line.
      for (let i = 0; i < n; i++) {
        const b = bases[i];
        const nx = Math.min(Math.max(b.x + (pick() - 0.5) * room * 0.5, x0), x1);
        const ny = Math.min(Math.max(b.y + (pick() - 0.5) * room * 0.5, y0), y1);
        if (free(nx, ny, i)) {
          b.x = nx;
          b.y = ny;
        }
      }
      wander = Math.min(room * 0.28, Math.min(w, h) * 0.07);
    };

    const dropData = new Float32Array(MAX_BLOBS * 4);
    const turnData = new Float32Array(MAX_BLOBS);
    const count = () => (Math.min(w, h) < 600 ? 6 : 10);
    const placeDrops = () => {
      const side = Math.min(w, h);
      const n = count();
      let blobs = 0;
      for (let i = 0; i < n && i < bases.length; i++) {
        const d = DROPS[i];
        let x = bases[i].x + wander * Math.sin((seconds * Math.PI * 2) / d.px + i * 1.7);
        let y = bases[i].y + wander * Math.sin((seconds * Math.PI * 2) / d.py + i * 2.3);
        // Never behind the words: a drop that wanders up to them is held
        // at their edge, and slides along it.
        const c = clearance(i);
        if (quiet && inWords(x, y, c)) {
          const out = [
            { d: x - (quiet.left - c), x: quiet.left - c, y },
            { d: quiet.right + c - x, x: quiet.right + c, y },
            { d: y - (quiet.top - c), x, y: quiet.top - c },
            { d: quiet.bottom + c - y, x, y: quiet.bottom + c },
          ].sort((a, b) => a.d - b.d)[0];
          x = out.x;
          y = out.y;
        }
        const r = d.r * side;
        const turn = i * 0.9 + seconds * d.spin;
        dropData.set([x, y, r, d.aspect], blobs * 4);
        turnData[blobs++] = turn;
        d.lobes.forEach((lobe, j) => {
          const angle = turn + lobe.angle + seconds * lobe.drift;
          const reach = r * lobe.reach * (1 + 0.15 * Math.sin(seconds * 0.4 + i + j * 2));
          const size = r * lobe.size * (1 + 0.2 * Math.sin(seconds * 0.33 * (j + 1) + i * 1.3));
          dropData.set([x + Math.cos(angle) * reach, y + Math.sin(angle) * reach, size, lobe.aspect], blobs * 4);
          turnData[blobs++] = angle;
        });
      }
      return blobs;
    };

    /* ---- the mark's way in ---- */

    // How far right it starts, to be out of sight; and the point of it that
    // leads, which is where it shoves the jelly.
    let away = 0;
    let lead = { x: 0, y: 0 };
    let shift = 0;
    let smear = 0;
    let arrived = !entrance || reduce;
    let markPad = 0;

    const moveMark = (now: number) => {
      shove = null;
      if (arrived) {
        shift = 0;
        smear = 0;
        return;
      }
      const start = setOff.current;
      const t = start === null ? 0 : Math.max((now - start) / 1000 / ENTER_S, 0);
      if (t >= 1) {
        arrived = true;
        shift = 0;
        smear = 0;
        return;
      }
      // Quick to start, long to stop, as if the jelly were holding it back.
      const left = 1 - t;
      shift = away * Math.pow(left, 3.5);
      const pace = start === null ? 0 : (away * 3.5 * Math.pow(left, 2.5)) / ENTER_S;
      smear = Math.min(pace * SMEAR, MAX_SMEAR);
      shove = { x: lead.x + shift, y: lead.y, force: SHOVE * Math.min(pace / 1500, 1) };
    };

    /* ---- drawing ---- */

    const size = () => {
      const rect = view.getBoundingClientRect();
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      view.width = Math.round(w * dpr);
      view.height = Math.round(h * dpr);

      // Only a mark that will come in needs anything past the left edge.
      markPad = arrived ? 0 : Math.round(w * 1.1);
      const mark = drawMark(w, h, markPad);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, markTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG16F, mark.width, mark.height, 0, gl.RG, gl.FLOAT, mark.data);
      away = Math.min(w - mark.left + 60, markPad);
      lead = { x: mark.left, y: mark.elbow.y };
      markMask = { data: mark.mask, width: mark.width, height: mark.height, pad: markPad, k: mark.scale };

      cols = Math.max(2, Math.ceil(w / CELL));
      rows = Math.max(2, Math.ceil(h / CELL));
      height = new Float32Array(cols * rows);
      speed = new Float32Array(cols * rows);
      sendSlab();
      quiet = null;
      measureQuiet();
      if (!quiet) layoutDrops();
    };

    const render = () => {
      const n = placeDrops();
      gl.viewport(0, 0, view.width, view.height);
      gl.uniform2f(u("u_size"), w, h);
      gl.uniform1f(u("u_dpr"), dpr);
      gl.uniform1f(u("u_t"), seconds);
      gl.uniform4fv(u("u_drop"), dropData);
      gl.uniform1fv(u("u_turn"), turnData);
      gl.uniform1i(u("u_drops"), n);
      gl.uniform1f(u("u_markPad"), markPad);
      gl.uniform1f(u("u_shift"), shift);
      gl.uniform1f(u("u_smear"), smear);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    /* ---- the clock ---- */

    let frame = 0;
    let last = 0;
    let visible = false;

    const tick = (t: number) => {
      const dt = last ? Math.min((t - last) / 1000, 1 / 20) : 1 / 60;
      last = t;
      seconds += dt;
      moveMark(t);
      stepSlab(dt);
      sendSlab();
      render();
      frame = visible ? requestAnimationFrame(tick) : 0;
      if (!frame) last = 0;
    };

    const wake = () => {
      if (reduce || frame || !visible || disposed) return;
      frame = requestAnimationFrame(tick);
    };

    let queued = 0;
    const refit = () => {
      if (queued) return;
      queued = requestAnimationFrame(() => {
        queued = 0;
        if (disposed) return;
        size();
        moveMark(performance.now());
        render();
      });
    };
    refit();
    document.fonts.ready.then(() => {
      if (disposed) return;
      measureQuiet();
      if (reduce) render();
    });

    const resize = new ResizeObserver(refit);
    resize.observe(view);

    // The rotating line changes width as it turns, so the words are
    // measured again every so often.
    const remeasure = reduce ? 0 : window.setInterval(measureQuiet, 700);

    const seen = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      wake();
    });
    seen.observe(view);

    const onMove = (event: PointerEvent) => {
      const rect = view.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      if (pointer.inside && !pointer.fresh) {
        const gap = Math.max((event.timeStamp - pointer.at) / 1000, 1 / 240);
        pace = Math.max(pace, Math.hypot(x - pointer.x, y - pointer.y) / gap);
      }
      pointer.x = x;
      pointer.y = y;
      pointer.at = event.timeStamp;
      pointer.inside = true;
      pointer.fresh = false;
    };
    const onLeave = () => {
      pointer.inside = false;
      pointer.fresh = true;
    };

    if (!reduce) {
      section.addEventListener("pointermove", onMove as EventListener);
      section.addEventListener("pointerleave", onLeave);
      section.addEventListener("pointercancel", onLeave);
    }

    const onLost = (event: Event) => event.preventDefault();
    view.addEventListener("webglcontextlost", onLost);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      cancelAnimationFrame(queued);
      window.clearInterval(remeasure);
      resize.disconnect();
      seen.disconnect();
      section.removeEventListener("pointermove", onMove as EventListener);
      section.removeEventListener("pointerleave", onLeave);
      section.removeEventListener("pointercancel", onLeave);
      view.removeEventListener("webglcontextlost", onLost);
      gl.deleteTexture(markTex);
      gl.deleteTexture(slabTex);
      gl.deleteBuffer(quad);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [reduce, entrance]);

  return <canvas ref={canvas} aria-hidden="true" className={`block h-full w-full ${className ?? ""}`} />;
}
