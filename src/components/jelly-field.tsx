"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { BOOMERANG_PATH } from "./boomerang";

/* ==================================================================
   Jelly field

   The ground of the second screen, seen through a sheet of water.

   Under the water the ground is white, and on it lie things of black
   glass: the boomerang, huge on the right and tipped as if caught
   mid-throw, and ten loose drops of no set shape, each one lobed and
   slowly changing its outline, that wander very slowly round the words.
   They are lit as solids, so they read as objects rather than as ink:
   dark in the body, a rim that catches the white around them, a hard
   highlight from the top left and a soft shadow thrown down and to the
   right. Where two drops come close they pull together the way two drops
   of oil do. The mark's edge is softened a few pixels, but its outline is
   its own, and it stays its own under the water: the water bends the
   drops fully and the mark only a little, so the mark is plainly under
   the same water and never loses its shape.

   The mark is not there when the screen opens: it drags itself in from
   past the right edge, quick to start and slow to stop, trailing a smear
   of itself and pushing the water aside as it goes, and comes to rest
   where it always stands, the water still rippling from its arrival.

   No drop ever goes behind the words. The drops are based evenly through
   the room the words and the mark leave, whatever the shape of the
   screen, and one that wanders up to the words slides along their edge.

   The water covers the whole screen and never stops moving: a swell of
   eight waves runs across it from every side, just as much in every part
   of the screen. It shows on the white as it would on the floor of a
   pool, a moving net of light and faint shade, and on the black as bent
   outlines and a sheen. The hand does not carry the effect, it disturbs
   it: a moving pointer draws a wake through the water, deeper the faster
   it goes, and a click lets a drop of water fall where it lands; either
   way the rings run out across the surface and die away. The water is a grid of springs, each tied to its
   neighbours, stepped at a fixed rate whatever the frame rate, so a slow
   frame can never make it run away.

   Drawn on one WebGL2 canvas, and only while it can be seen. For anyone
   who has asked for less motion it is drawn once and holds still, and
   clicks do nothing to it.

   The mark keeps one pose on every screen. Where the screen is wide it
   stands on the right of the copy; where it is upright it lies across the
   bottom right, under the copy.
   ================================================================== */

/** Mark units: the elbow's outer point, before rotation (see boomerang.tsx). */
const ELBOW = { x: 0, y: 58 };
/** The slab's springs, one per this many CSS pixels. */
const CELL = 8;
/** The water's springs, per second: a faint pull back to rest, a strong
    pull towards the neighbours (which is what carries a ripple outwards,
    at about 260px a second) and a little loss, so rings run a good way
    before they die. The slab's height is in CSS pixels. */
const REST = 6;
const COUPLE = 1100;
const DAMP = 0.9;
/** The springs are stepped this often, whatever the frame rate: a step
    that grows with a slow frame is what made the water blow up and the
    screen go black. At most this many steps are caught up per frame. */
const STEP_S = 1 / 120;
const MAX_STEPS = 8;
/** A click lets a drop of water fall: how deep it strikes, in CSS pixels,
    and how wide, in CSS pixels. Light: a ripple, not a splash. */
const DROP_DEPTH = 9;
const DROP_RADIUS = 18;
/** A moving pointer draws a wake through the water, as a finger would:
    each touch is at most this deep, in CSS pixels, and this wide, and it
    is as deep as that only at this pointer speed, in CSS pixels a second.
    Touches are laid at most this far apart along the way, in CSS pixels. */
const WAKE_DEPTH = 1.75;
const WAKE_RADIUS = 22;
const WAKE_SPEED = 800;
const WAKE_SPACING = 10;
/** How deep the water's own swell is, in CSS pixels, wave by wave. */
const SWELL = 7;
/** How far the water bends what is under it, in CSS pixels per unit of
    slope, and how much of that the drops and the mark take. The drops are
    bent enough to be plainly under water but not so much that the passing
    swell sets them moving; the mark far less, so it keeps its outline. */
const REFRACT = 85;
const DROP_BEND = 0.45;
const MARK_BEND = 0.18;
/** How strongly the water throws light and shade on the white under it. */
const CAUSTIC = 9;
/** The drops' own slow life (wander, turn, lobes) runs at this share of
    real time. */
const DROP_PACE = 0.18;
/** Every drop's size, as a share of the size it was first drawn at: the
    user found them all a little big. */
const DROP_SIZE = 0.83;
/** How far a drop keeps from the words: its own reach, lobes included,
    as a multiple of its radius, and a margin on top, in CSS pixels. */
const CLEAR_REACH = 2.3;
const CLEAR_MARGIN = 22;
/** The least room, in CSS pixels, kept between a drop at the far end of
    its roaming and the edge of the screen, the mark and the floating bar. */
const EDGE_MARGIN = 16;
const MARK_MARGIN = 56;
const NAV_GAP = 20;
/** Every drop keeps room to roam at least this share of the full wander:
    one set down hard against an edge is drawn in far enough to move. */
const MIN_ROAM = 0.35;
/** On an upright screen, a drop bigger than this (as a share of the
    screen's shorter side) lying in the mark's notch is split in two, each
    this share of its radius: together a quarter smaller than it was. */
const SPLIT_ABOVE = 0.07 * DROP_SIZE;
/** A screen whose shorter side is under this, in CSS pixels, is a phone:
    it has fewer drops, and the user asked for them there a tenth bigger
    and set a little further apart. */
const SMALL = 600;
const SMALL_GROW = 1.1;
const SMALL_SPREAD = 1.2;

/* The wide layout, set by hand from the user's own marked-up screenshots
   rather than worked out, because it is art directed drop by drop and a
   worked-out layout shifts with every few pixels of screen height. Each
   entry is a drop (which fixes its size and shape) and where it is based,
   as shares of the screen's width and height. The usual keeping-clear
   (words, mark, bar, edges) still applies over it. */
// Staggered on purpose: no two share a line, across or down.
const WIDE_LAYOUT: { drop: number; at: [number, number] }[] = [
  // Top left, just under the left end of the floating bar.
  { drop: 6, at: [0.182, 0.2] },
  // Above the headline, left.
  { drop: 8, at: [0.312, 0.339] },
  // Above the headline, right.
  { drop: 9, at: [0.552, 0.222] },
  // Beside the top of the mark.
  { drop: 12, at: [0.738, 0.17] },
  // Left of the headline, the biggest.
  { drop: 4, at: [0.112, 0.515] },
  // Bottom left.
  { drop: 1, at: [0.058, 0.8] },
  // Under the subtitle.
  { drop: 10, at: [0.262, 0.885] },
  // Under the links.
  { drop: 11, at: [0.468, 0.815] },
  // Inside the mark's bend.
  { drop: 3, at: [0.69, 0.752] },
  // Right of the mark.
  { drop: 7, at: [0.948, 0.585] },
];
const SPLIT_SCALE = Math.sqrt(0.75 / 2);
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
const SHOVE = 900;
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
    r: range(0.035, 0.085) * DROP_SIZE,
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
/** How far each drop is seen to reach from its centre, as a multiple of
    its radius: its body drawn out along its length, or its furthest lobe
    at its furthest and fullest, whichever is further, but no more than a
    drop is ever seen to reach (a lobe's long axis mostly lies across the
    drop, not out from it). */
const EXTENT = DROPS.map((d) =>
  Math.min(
    Math.max(d.aspect * 0.9, ...d.lobes.map((l) => l.reach * 1.15 + l.size * 1.2 * l.aspect * 0.85)),
    1.9,
  ),
);
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
uniform float u_td;        // the drops' own, slower clock
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
  vec2 w = p + vec2(sin(p.y * 0.0061 + u_td * 0.31), cos(p.x * 0.0053 - u_td * 0.27)) * 16.0
             + vec2(sin(p.y * 0.017 - u_td * 0.5), cos(p.x * 0.019 + u_td * 0.45)) * 7.0;
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

// The springs' height at a point: the ripples from clicks and from the
// mark's arrival.
float slab(vec2 p) {
  return texture(u_slab, p / u_size).r;
}

// The water's own swell, which never stops: eight waves running across the
// screen, one to each of eight directions spread evenly round the circle,
// of lengths close to one another and each at the pace water of that length
// runs. Laid over one another they have no grain and no calm patches: the
// water moves as much in one part of the screen as in any other. Returns
// the slope (xy) and how much the surface curves (z), which is what
// gathers the light into lines on the white under it.
vec3 swell(vec2 p) {
  vec3 g = vec3(0.0);
  for (int i = 0; i < 8; i++) {
    float fi = float(i);
    float a = fi * 0.7854 + 0.31 + 0.2 * sin(fi * 2.3);   // about pi / 4 apart
    vec2 d = vec2(cos(a), sin(a));
    float len = 190.0 + 45.0 * mod(fi * 3.0, 5.0);
    float k = 6.2832 / len;
    // Deep-water pace: longer waves run faster.
    float pace = sqrt(9.81 * 60.0 / k) * 0.006;
    float s = dot(p, d) * k - u_t * pace * k * 60.0 + fi * 1.9;
    g.xy += d * (k * cos(s));
    g.z -= k * k * sin(s);
  }
  return g * ${SWELL.toFixed(1)};
}

void main() {
  vec2 p = vec2(gl_FragCoord.x, u_size.y * u_dpr - gl_FragCoord.y) / u_dpr;

  // The slab: its slope bends what is seen through it.
  // Read a whole spring either side: the springs are filtered linearly, and
  // a slope read across one spring is continuous where a finer one would
  // step at every spring and show the grid.
  float e = ${CELL.toFixed(1)};
  float h0 = slab(p);
  float hx0 = slab(p - vec2(e, 0.0));
  float hx1 = slab(p + vec2(e, 0.0));
  float hy0 = slab(p - vec2(0.0, e));
  float hy1 = slab(p + vec2(0.0, e));
  vec2 gs = vec2(hx1 - hx0, hy1 - hy0) / (2.0 * e);
  float curve = (hx0 + hx1 + hy0 + hy1 - 4.0 * h0) / (e * e);
  vec3 sw = swell(p);
  gs += sw.xy;
  curve += sw.z;
  // The drops are bent by the water fully; the mark far less, so it
  // never loses its shape under it.
  vec2 q = p + gs * ${(REFRACT * DROP_BEND).toFixed(2)};
  vec2 qm = p + gs * ${(REFRACT * MARK_BEND).toFixed(2)};
  vec3 ns = normalize(vec3(-gs, 1.0));

  // What lies under it, at the bent point: the drops, and the mark over
  // them.
  float d = 1.5;
  float fd = drops(q);
  float hd = dome(fd);
  vec2 gd = vec2(dome(drops(q + vec2(d, 0.0))) - hd, dome(drops(q + vec2(0.0, d))) - hd) / d;
  float fm = mark(qm);
  vec2 gm = vec2(mark(qm + vec2(2.0, 0.0)) - mark(qm - vec2(2.0, 0.0)),
                 mark(qm + vec2(0.0, 2.0)) - mark(qm - vec2(0.0, 2.0))) / 4.0;
  float bodyD = smoothstep(0.44, 0.56, fd);
  float bodyM = smoothstep(0.44, 0.56, fm);

  // A soft shadow from both, thrown down and to the right.
  vec2 fall = q - vec2(14.0, 20.0);
  float shade = smoothstep(0.15, 0.9, max(drops(fall), mark(qm - vec2(14.0, 20.0)))) * 0.1;
  float col = 1.0 - shade;
  col = mix(col, glass(gd, 70.0), bodyD);
  col = mix(col, glass(gm, 150.0), bodyM);

  vec3 l = normalize(LIGHT);
  vec3 h = normalize(l + vec3(0.0, 0.0, 1.0));

  // The water itself. Where its surface bulges it spreads the light thin
  // and the white under it goes a shade grey; where it dips it gathers
  // the light, and the white stays white: the moving net of light lines a
  // pool throws on its floor. Its slopes shade the ground a little more,
  // and it has a sheen of its own where it faces the light.
  col *= 1.0 - clamp(curve * ${CAUSTIC.toFixed(1)}, 0.0, 0.11);
  float lit = dot(ns, l) - l.z;
  col *= 1.0 + lit * 0.35;
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

    // Touches waiting for the next step: drops let fall by clicks, and the
    // pointer's wake. Depth and radius in CSS pixels.
    const falls: { x: number; y: number; depth: number; radius: number }[] = [];
    const pointer = { x: 0, y: 0, at: 0, inside: false };
    // Time not yet stepped through, in seconds.
    let owed = 0;

    // What is pressing on the slab this step: the mark while it drags
    // itself in. In cells.
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
      // A fallen drop strikes the surface once: a small, sharp dip, which
      // the springs then carry outwards as rings.
      for (const f of falls.splice(0)) {
        const k = poke(f.x, f.y, f.radius, 0);
        for (let r = k.r0; r <= k.r1; r++) {
          for (let q = k.q0; q <= k.q1; q++) {
            const dx = q - k.x;
            const dy = r - k.y;
            height[r * cols + q] -= f.depth * Math.exp(-(dx * dx + dy * dy) / (k.r * k.r));
          }
        }
      }

      const pokes: Poke[] = [];
      if (shove && shove.force > 1) pokes.push(poke(shove.x, shove.y, SHOVE_RADIUS, shove.force));

      // Always the same small step, however long the frame took, and never
      // more than a few of them to catch up.
      owed = Math.min(owed + dt, STEP_S * MAX_STEPS);
      const sub = STEP_S;
      for (; owed >= sub; owed -= sub) {
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

      // Should anything ever run away all the same, the water is stilled
      // rather than left to fill the screen with black.
      let wild = false;
      for (let i = 0; i < height.length; i += 97) {
        if (!Number.isFinite(height[i]) || Math.abs(height[i]) > 400) {
          wild = true;
          break;
        }
      }
      if (wild) {
        height.fill(0);
        speed.fill(0);
      }
    };

    const sendSlab = () => {
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, slabTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16F, cols, rows, 0, gl.RED, gl.FLOAT, height);
    };

    /* ---- the drops ---- */

    /* Where the words are, in the section's CSS pixels: the box of the
       block they are set in (headline, subtitle and links), read as it
       stands at rest. Not the words themselves, whose extent changes as the
       headline's last line turns over, and not where the block happens to
       be while it rises into place: the drops are laid out round this box,
       and a box that kept changing had them laid out again and again, drops
       trading places across the screen. Read again only when the screen
       changes size or the fonts arrive, and only acted on if it moved. */
    let quiet: DOMRect | null = null;
    const measureQuiet = () => {
      const origin = section.getBoundingClientRect();
      let x0 = Infinity;
      let y0 = Infinity;
      let x1 = -Infinity;
      let y1 = -Infinity;
      for (const el of section.querySelectorAll("[data-jelly-quiet]")) {
        const b = el.getBoundingClientRect();
        if (!b.width) continue;
        // Undo any lift still being animated on the way in.
        let lift = 0;
        for (let a = el.parentElement; a && a !== section; a = a.parentElement) {
          const t = getComputedStyle(a).transform;
          if (t && t !== "none") lift += new DOMMatrixReadOnly(t).m42;
        }
        x0 = Math.min(x0, b.left - origin.left);
        y0 = Math.min(y0, b.top - origin.top - lift);
        x1 = Math.max(x1, b.right - origin.left);
        y1 = Math.max(y1, b.bottom - origin.top - lift);
      }
      if (!Number.isFinite(x0)) return;
      const next = new DOMRect(x0, y0, x1 - x0, y1 - y0);
      const same =
        quiet &&
        Math.abs(quiet.left - next.left) < 2 &&
        Math.abs(quiet.top - next.top) < 2 &&
        Math.abs(quiet.right - next.right) < 2 &&
        Math.abs(quiet.bottom - next.bottom) < 2;
      if (same) return;
      quiet = next;
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

    /** What the drops' sizes are shares of: the screen's shorter side,
        a tenth more on a phone. */
    const dropSide = () => {
      const s = Math.min(w, h);
      return s < SMALL ? s * SMALL_GROW : s;
    };
    /** How far drop i keeps from the words. */
    const clearance = (i: number) => DROPS[i].r * dropSide() * CLEAR_REACH + CLEAR_MARGIN;
    const inWords = (x: number, y: number, c: number) =>
      !!quiet && x > quiet.left - c && x < quiet.right + c && y > quiet.top - c && y < quiet.bottom + c;

    /* Where each drop is based, for this screen. Each is set down in turn
       at whichever of many free spots is furthest from the drops already
       down, weighed by how big the two are, then all are eased apart a
       little more. However the screen is shaped, the drops end up spread
       evenly through the room the words and the mark leave, round the
       words rather than bunched to one side of them.

       That is the layout the user approved, and it is kept exactly: the
       same spots from the same sequence of numbers. Only the drops it
       leaves in trouble are then moved, each the least it takes: one an
       edge cuts into is drawn in until it is whole, and one lying on or
       against the mark is taken to the nearest spot clear of it. On an
       upright screen a big drop in the mark's notch is split into two
       smaller ones. Each drop then roams round its base as far as the
       room round it allows. */
    // Indexed by drop: where each is based, and where it is shown now.
    let bases: { x: number; y: number }[] = [];
    let shown: { x: number; y: number }[] = [];
    // The drops on screen, in drawing order.
    let active: number[] = [];
    // Each drop's size, as a share of its own (only a split drop's is less).
    let scale: number[] = [];
    // How far each drop roams round its base: the full wander where it has
    // open water round it, less where the mark or an edge is near.
    let roam: number[] = [];
    let wander = 0;
    // The screen size the drops were last laid out for.
    let laidFor = "";
    // Where the mark's elbow is, for knowing which drops lie in its notch.
    let elbowX = 0;
    // Where the floating bar sits over the field, in its CSS pixels.
    let bar: { left: number; right: number; bottom: number } | null = null;

    const layoutDrops = () => {
      // Nothing to lay out on until the field has been given its size.
      if (!w || !h) return;
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
      const size = dropSide();
      const reach = (i: number) => DROPS[i].r * size * CLEAR_REACH;
      // Distance to the nearest edge counts for less than distance to a
      // neighbour, so drops are not all drawn to the same margin and lined
      // up along it.
      const edgeGap = (x: number, y: number) => Math.min(x - x0, x1 - x, y - y0, y1 - y) * 3;

      const next: { x: number; y: number }[] = [];
      for (let i = 0; i < n; i++) {
        let best = { x: x0 + (x1 - x0) / 2, y: y0 + (y1 - y0) / 2 };
        let bestScore = -Infinity;
        for (let tries = 0; tries < 60; tries++) {
          const x = x0 + pick() * (x1 - x0);
          const y = y0 + pick() * (y1 - y0);
          if (!free(x, y, i)) continue;
          let score = edgeGap(x, y);
          for (let j = 0; j < next.length; j++) {
            const d = Math.hypot(x - next[j].x, y - next[j].y) - reach(i) - reach(j);
            score = Math.min(score, d);
          }
          if (score > bestScore) {
            bestScore = score;
            best = { x, y };
          }
        }
        next.push(best);
      }

      // On a phone the drops are pushed a little further apart.
      const spread = side < SMALL ? SMALL_SPREAD : 1;
      const room = Math.sqrt(((x1 - x0) * (y1 - y0) * 0.7) / n) * spread;
      for (let pass = 0; pass < 30; pass++) {
        for (let i = 0; i < n; i++) {
          const b = next[i];
          let fx = 0;
          let fy = 0;
          for (let j = 0; j < n; j++) {
            if (j === i) continue;
            const dx = b.x - next[j].x;
            const dy = b.y - next[j].y;
            const d = Math.hypot(dx, dy) || 1;
            // Never closer than the two reach, so neighbours stay apart.
            const want = Math.max(room, (reach(i) + reach(j)) * 1.2 * spread);
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
        const b = next[i];
        const nx = Math.min(Math.max(b.x + (pick() - 0.5) * room * 0.5, x0), x1);
        const ny = Math.min(Math.max(b.y + (pick() - 0.5) * room * 0.5, y0), y1);
        if (free(nx, ny, i)) {
          b.x = nx;
          b.y = ny;
        }
      }
      // Each drop roams a fair way round its base, not pinned to it.
      wander = Math.min(room * 0.45, side * 0.12);

      /* ---- the few that need moving ---- */

      scale = new Array<number>(DROPS.length).fill(1);
      const order = Array.from({ length: n }, (_, i) => i);

      // Upright: a big drop in the mark's notch is two smaller ones, which
      // between them take a quarter less room than it did.
      if (w / h < UPRIGHT) {
        let spare = n;
        for (const i of order.slice()) {
          if (DROPS[i].r <= SPLIT_ABOVE || next[i].x <= elbowX || spare >= DROPS.length) continue;
          const j = spare++;
          const small = DROPS[i].r * SPLIT_SCALE;
          scale[i] = SPLIT_SCALE;
          scale[j] = small / DROPS[j].r;
          const apart = small * size * EXTENT[i];
          const b = next[i];
          // Set well apart, so the two read as two and do not run back into one.
          next[j] = { x: b.x + apart * 1.4, y: b.y + apart * 0.9 };
          next[i] = { x: b.x - apart * 1.4, y: b.y - apart * 0.9 };
          order.push(j);
        }
      } else {
        // Wide: the hand-set layout, in place of the worked-out one.
        order.length = 0;
        for (const spot of WIDE_LAYOUT) {
          next[spot.drop] = { x: spot.at[0] * w, y: spot.at[1] * h };
          order.push(spot.drop);
        }
      }

      const body = (i: number) => DROPS[i].r * scale[i] * size * EXTENT[i];
      // Whether a drop at this x would pass under the floating bar.
      const underBar = (x: number, i: number) =>
        !!bar && x + body(i) > bar.left - NAV_GAP && x - body(i) < bar.right + NAV_GAP;
      const least = wander * MIN_ROAM;
      // Clear of the mark all the way round, at this distance.
      const offMark = (x: number, y: number, c: number) => {
        if (underMark(x, y)) return false;
        for (const ring of [0.5, 1]) {
          for (let k = 0; k < 16; k++) {
            const a = (k / 16) * Math.PI * 2;
            if (underMark(x + Math.cos(a) * c * ring, y + Math.sin(a) * c * ring)) return false;
          }
        }
        return true;
      };

      active = [];
      for (const i of order) {
        const b = next[i];
        const e = body(i) + EDGE_MARGIN + least;
        // Drawn in from any edge that cuts into it, far enough to roam.
        if (w > e * 2) b.x = Math.min(Math.max(b.x, e), w - e);
        if (h > e * 2) b.y = Math.min(Math.max(b.y, e), h - e);
        // Held below the floating bar, never under it.
        if (bar && underBar(b.x, i)) b.y = Math.max(b.y, bar.bottom + NAV_GAP + body(i) + least);
        // Taken off the mark, to the nearest spot that clears it; and a half
        // of a split drop lying on another drop is moved the same way, so
        // the two halves stay two.
        const c = body(i) + MARK_MARGIN;
        const clash = (x: number, y: number) =>
          active.some((k) => Math.hypot(x - next[k].x, y - next[k].y) < body(i) + body(k));
        if (!offMark(b.x, b.y, c) || (scale[i] < 1 && clash(b.x, b.y))) {
          let found: { x: number; y: number } | null = null;
          for (let dist = 6; dist <= side * 0.7 && !found; dist += 6) {
            for (let k = 0; k < 24; k++) {
              const a = (k / 24) * Math.PI * 2;
              const x = b.x + Math.cos(a) * dist;
              const y = b.y + Math.sin(a) * dist;
              if (x < e || x > w - e || y < e || y > h - e) continue;
              if (inWords(x, y, clearance(i)) || !offMark(x, y, c)) continue;
              // Nor onto another drop: two moved off the mark would
              // otherwise land on the same spot and run into one.
              if (clash(x, y)) continue;
              found = { x, y };
              break;
            }
          }
          // No clear water for it anywhere: better left out than on the mark.
          if (!found) continue;
          b.x = found.x;
          b.y = found.y;
        }
        active.push(i);
      }

      // How far each drop may roam from its base: as far as the wander goes,
      // but never so far that its body would reach the mark or an edge.
      roam = new Array<number>(DROPS.length).fill(0);
      for (const i of active) {
        const b = next[i];
        const keep = body(i);
        let r = Math.min(
          b.x - keep - EDGE_MARGIN,
          w - b.x - keep - EDGE_MARGIN,
          b.y - keep - EDGE_MARGIN,
          h - b.y - keep - EDGE_MARGIN,
          wander,
        );
        for (let c = keep + MARK_MARGIN; c <= keep + MARK_MARGIN + wander; c += 6) {
          if (!offMark(b.x, b.y, c)) {
            r = Math.min(r, c - keep - MARK_MARGIN - 6);
            break;
          }
        }
        if (bar && underBar(b.x, i)) r = Math.min(r, b.y - keep - bar.bottom - NAV_GAP);
        // One beside the bar, level with it, roams no further than the bar.
        else if (bar && b.y - keep < bar.bottom + NAV_GAP + wander) {
          if (b.x < bar.left) r = Math.min(r, bar.left - NAV_GAP - keep - b.x);
          else if (b.x > bar.right) r = Math.min(r, b.x - keep - bar.right - NAV_GAP);
        }
        roam[i] = Math.max(r, 0);
      }

      // A new screen size is a fresh layout, set straight down; the same
      // screen laid out again (the fonts arriving) is glided into.
      const screen = `${w}x${h}`;
      const fresh = screen !== laidFor;
      laidFor = screen;
      bases = next;
      if (reduce || fresh) {
        shown = next.map((b) => ({ ...b }));
        return;
      }
      for (const i of active) {
        if (!shown[i]) shown[i] = { ...next[i] };
      }
    };

    const glideDrops = (dt: number) => {
      const f = 1 - Math.exp(-dt * 1.6);
      for (const i of active) {
        if (!shown[i] || !bases[i]) continue;
        shown[i].x += (bases[i].x - shown[i].x) * f;
        shown[i].y += (bases[i].y - shown[i].y) * f;
      }
    };

    const dropData = new Float32Array(MAX_BLOBS * 4);
    const turnData = new Float32Array(MAX_BLOBS);
    const count = () => (Math.min(w, h) < SMALL ? 6 : 10);
    const placeDrops = () => {
      const side = dropSide();
      let blobs = 0;
      // The drops live on a slower clock than the water.
      const slow = seconds * DROP_PACE;
      for (const i of active) {
        if (!shown[i]) continue;
        const d = DROPS[i];
        const go = roam[i] ?? wander;
        let x = shown[i].x + go * Math.sin((slow * Math.PI * 2) / d.px + i * 1.7);
        let y = shown[i].y + go * Math.sin((slow * Math.PI * 2) / d.py + i * 2.3);
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
        const r = d.r * (scale[i] ?? 1) * side;
        // And never so near an edge that the edge cuts into it, nor up
        // under the floating bar.
        const reachOut = r * EXTENT[i];
        const edge = reachOut + EDGE_MARGIN;
        if (w > edge * 2) x = Math.min(Math.max(x, edge), w - edge);
        if (h > edge * 2) y = Math.min(Math.max(y, edge), h - edge);
        if (bar && x + reachOut > bar.left - NAV_GAP && x - reachOut < bar.right + NAV_GAP) {
          y = Math.max(y, bar.bottom + NAV_GAP + reachOut);
        }
        const turn = i * 0.9 + slow * d.spin;
        dropData.set([x, y, r, d.aspect], blobs * 4);
        turnData[blobs++] = turn;
        d.lobes.forEach((lobe, j) => {
          const angle = turn + lobe.angle + slow * lobe.drift;
          const reach = r * lobe.reach * (1 + 0.15 * Math.sin(slow * 0.4 + i + j * 2));
          const size = r * lobe.size * (1 + 0.2 * Math.sin(slow * 0.33 * (j + 1) + i * 1.3));
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
      elbowX = mark.elbow.x;
      // The floating bar, read from the page, where it rests at the top.
      const barEl = document.querySelector("header .shell > div");
      if (barEl) {
        const b = barEl.getBoundingClientRect();
        const o = view.getBoundingClientRect();
        bar = { left: b.left - o.left, right: b.right - o.left, bottom: b.bottom - o.top };
      }
      markMask = { data: mark.mask, width: mark.width, height: mark.height, pad: markPad, k: mark.scale };

      cols = Math.max(2, Math.ceil(w / CELL));
      rows = Math.max(2, Math.ceil(h / CELL));
      height = new Float32Array(cols * rows);
      speed = new Float32Array(cols * rows);
      sendSlab();
      // Always laid out afresh for a new size, even if the words' box has
      // not moved.
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
      gl.uniform1f(u("u_td"), seconds * DROP_PACE);
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
      // Under the curtain until the mark sets off, nothing here can be seen,
      // and the water would only be taking frames from the flight above it.
      // Held, not stopped, so it picks up on the first frame it is due.
      if (entrance && !arrived && (setOff.current === null || t < setOff.current)) {
        last = 0;
        frame = visible ? requestAnimationFrame(tick) : 0;
        return;
      }
      const dt = last ? Math.min((t - last) / 1000, 1 / 20) : 1 / 60;
      last = t;
      seconds += dt;
      glideDrops(dt);
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
      // The fonts can be ready before the field has its size; the first
      // sizing measures the words then.
      if (disposed || !w) return;
      measureQuiet();
      if (reduce) render();
    });

    const resize = new ResizeObserver(refit);
    resize.observe(view);


    const seen = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      wake();
    });
    seen.observe(view);

    // A click, or a tap, lets a drop of water fall where it lands.
    const onDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      const rect = view.getBoundingClientRect();
      falls.push({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        depth: DROP_DEPTH,
        radius: DROP_RADIUS,
      });
    };

    // A moving pointer touches the water all along its way, as deep as it
    // is fast, so it leaves a wake of small waves behind it that spread
    // and run out; a pointer at rest leaves the water be.
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const rect = view.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      if (pointer.inside) {
        const gap = Math.max((event.timeStamp - pointer.at) / 1000, 1 / 240);
        const way = Math.hypot(x - pointer.x, y - pointer.y);
        const depth = WAKE_DEPTH * Math.min(way / gap / WAKE_SPEED, 1);
        if (depth > 0.05) {
          const touches = Math.max(1, Math.ceil(way / WAKE_SPACING));
          for (let i = 1; i <= touches; i++) {
            const t = i / touches;
            falls.push({
              x: pointer.x + (x - pointer.x) * t,
              y: pointer.y + (y - pointer.y) * t,
              depth: depth / Math.sqrt(touches),
              radius: WAKE_RADIUS,
            });
          }
        }
      }
      pointer.x = x;
      pointer.y = y;
      pointer.at = event.timeStamp;
      pointer.inside = true;
    };
    const onLeave = () => {
      pointer.inside = false;
    };

    if (!reduce) {
      section.addEventListener("pointerdown", onDown as EventListener);
      section.addEventListener("pointermove", onMove as EventListener);
      section.addEventListener("pointerleave", onLeave);
    }

    const onLost = (event: Event) => event.preventDefault();
    view.addEventListener("webglcontextlost", onLost);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      cancelAnimationFrame(queued);
      resize.disconnect();
      seen.disconnect();
      section.removeEventListener("pointerdown", onDown as EventListener);
      section.removeEventListener("pointermove", onMove as EventListener);
      section.removeEventListener("pointerleave", onLeave);
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
