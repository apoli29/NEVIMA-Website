"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { isCoarse } from "./quality";

/* ==================================================================
   Jelly field

   The ground of the second screen, seen through a sheet of water. It is
   the piece on show: the screen is hung round it like a gallery wall,
   with its label beside it (see home.tsx).

   Under the water the ground is white, and on it lie a dozen loose drops of
   black glass, of no set shape, each one lobed and slowly changing its
   outline, that wander very slowly through the room the words leave.
   They are lit as solids, so they read as objects rather than as ink:
   dark in the body, a rim that catches the white around them, a hard
   highlight from the top left and a soft shadow thrown down and to the
   right. Where two drops come close they pull together the way two drops
   of oil do.

   The drops are not there when the screen opens: as the black lifts they
   land on the water one after another, each swelling out of nothing where
   it lands and sending its own ring across the surface.

   No drop ever goes behind the words. The words are not one block but
   several, wherever on the screen each one is set ([data-jelly-quiet]),
   and the drops keep clear of each of them; one that wanders up to a block
   slides along its edge, and never out past the edge of the screen.

   Two drops more are set down once the rest are, perched over the index
   ([data-jelly-perch]), in the open water above it that its block leaves
   empty. They keep clear of the index itself rather than of the whole
   block (the form that block was kept tall for now opens in the middle
   of the screen, see proposal-flow.tsx). Being laid last, they move none
   of the others.

   The water covers the whole screen and never stops moving: a swell of
   eight waves runs across it from every side, just as much in every part
   of the screen. It shows on the white as it would on the floor of a
   pool, a moving net of light and faint shade, and on the black as bent
   outlines and a sheen. The hand does not carry the effect, it disturbs
   it: a moving pointer draws a wake through the water, deeper the faster
   it goes, and a click lets a drop of water fall where it lands; either
   way the rings run out across the surface and die away. The water is a
   grid of springs, each tied to its neighbours, stepped at a fixed rate
   whatever the frame rate, so a slow frame can never make it run away.

   Drawn on one WebGL2 canvas, and only while it can be seen. For anyone
   who has asked for less motion it is drawn once and holds still, and
   clicks do nothing to it.
   ================================================================== */

/** The slab's springs, one per this many CSS pixels. On a touch device
    they are set further apart, which costs the water a little of its
    fineness and saves the phone the greater part of the stepping (see
    quality.ts). COUPLE is scaled to match, so the ripples still run
    across the screen at the same speed. */
const CELL = 8;
const COARSE_CELL = 12;
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
const COARSE_MAX_STEPS = 4;
/** What the hand does to the water is cut to this share of what it once
    was (the user asked for 60% less, then for 80% of that), the click
    and the wake alike. */
const HAND = 0.32;
/** A click lets a drop of water fall: how deep it strikes, in CSS pixels,
    and how wide, in CSS pixels. Light: a ripple, not a splash. */
const DROP_DEPTH = 9 * HAND;
const DROP_RADIUS = 18;
/** A moving pointer draws a wake through the water, as a finger would:
    each touch is at most this deep, in CSS pixels, and this wide, and it
    is as deep as that only at this pointer speed, in CSS pixels a second.
    Touches are laid at most this far apart along the way, in CSS pixels. */
const WAKE_DEPTH = 1.75 * HAND;
const WAKE_RADIUS = 22;
const WAKE_SPEED = 800;
const WAKE_SPACING = 10;
/** How deep the water's own swell is, in CSS pixels, wave by wave. */
const SWELL = 7;
/** How far the water bends what is under it, in CSS pixels per unit of
    slope, and how much of that the drops take: enough to be plainly under
    water but not so much that the passing swell sets them moving. */
const REFRACT = 85;
const DROP_BEND = 0.45;
/** How strongly the water throws light and shade on the white under it. */
const CAUSTIC = 9;
/** The drops' own slow life (wander, turn, lobes) runs at this share of
    real time. */
const DROP_PACE = 0.18;
/** Every drop's size, as a share of the size it was first drawn at: the
    user found them all a little big. */
const DROP_SIZE = 0.83;
/** How far a drop keeps from the words: its own reach, lobes included,
    as a multiple of its radius (no drop is ever seen past 1.9 of it, see
    EXTENT), and a margin on top, in CSS pixels. */
const CLEAR_REACH = 2;
const CLEAR_MARGIN = 22;
/** A drop is seen a little past its own reach: the glass is warped up to
    23px as it moves (see drops() in the shader) and bent by the water a
    few pixels more. On a phone, where the drops are small, that is enough
    to reach the subtitle, so a block marked [data-jelly-wide] is kept this
    much further off on screens narrower than PHONE_W. It is laid on after
    the drops are spread, so only a drop that would come near that block
    moves; every other drop stays where it was. */
const WARP_PAD = 32;
const PHONE_W = 768;
/** The least room, in CSS pixels, kept between a drop at the far end of
    its roaming and the edge of the screen and the floating bar. */
const EDGE_MARGIN = 16;
const NAV_GAP = 20;
/** A screen whose shorter side is under this, in CSS pixels, is a phone:
    it has fewer drops, and the user asked for them there a tenth bigger
    and set a little further apart. */
const SMALL = 600;
const SMALL_GROW = 1.1;
const SMALL_SPREAD = 1.2;
/** The drops perched over the index, at most (the user: one or two more
    in the empty room above it, every other drop left where it is). */
const PERCHED = 2;
/** The landing: the drops come down this far apart, in seconds, each
    swelling to its size over this long, and each strikes the water this
    deep, in CSS pixels, over a ring as wide as itself. */
const LAND_GAP_S = 0.11;
const LAND_S = 0.9;
const LAND_DEPTH = 7;

const MAX_DPR = 1.5;
/** A phone draws the same screen over four times as many pixels as it
    has sense to pay for here, so the water is drawn at one pixel per
    CSS pixel there and let up to the screen. */
const COARSE_DPR = 1;
/** Where the still screen is frozen, in seconds. */
const STILL_T = 24;

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
uniform float u_cell;      // CSS pixels between springs
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
    // Not landed yet.
    if (d.z < 0.5) continue;
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

// The springs' height at a point: the ripples from clicks, the pointer's
// wake and the drops landing.
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
  float e = u_cell;
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
  vec2 q = p + gs * ${(REFRACT * DROP_BEND).toFixed(2)};
  vec3 ns = normalize(vec3(-gs, 1.0));

  // What lies under it, at the bent point.
  float d = 1.5;
  float fd = drops(q);
  float hd = dome(fd);
  vec2 gd = vec2(dome(drops(q + vec2(d, 0.0))) - hd, dome(drops(q + vec2(0.0, d))) - hd) / d;
  float bodyD = smoothstep(0.44, 0.56, fd);

  // A soft shadow, thrown down and to the right.
  float shade = smoothstep(0.15, 0.9, drops(q - vec2(14.0, 20.0))) * 0.1;
  float col = 1.0 - shade;
  col = mix(col, glass(gd, 70.0), bodyD);

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

/** Eased out with a slight overshoot, as a drop settling as it lands. */
function landing(t: number) {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  const c = 1.4;
  const u = t - 1;
  return 1 + (c + 1) * u * u * u + c * u * u;
}

/** A block of words, in the field's CSS pixels, and any extra room a drop
    keeps from it on top of its own clearance. */
type Box = { left: number; top: number; right: number; bottom: number; pad: number };

export function JellyField({
  className,
  arrive,
  arriveDelay = 0,
  covered = false,
}: {
  className?: string;
  /** Something opaque has been drawn over the whole field (the sections
      that close over the second screen): it is on the screen but cannot
      be seen, so it is held still rather than drawn for nobody. */
  covered?: boolean;
  /** Given, the drops wait out of sight until this turns true, and then
      land on the water one by one. Left out, they are simply there. */
  arrive?: boolean;
  /** Seconds between `arrive` turning true and the first drop landing. */
  arriveDelay?: number;
}) {
  const reduce = useReducedMotion() ?? false;
  const canvas = useRef<HTMLCanvasElement>(null);
  const coveredRef = useRef(covered);
  const wakeRef = useRef<() => void>(() => {});
  useEffect(() => {
    coveredRef.current = covered;
    wakeRef.current();
  }, [covered]);
  const entrance = arrive !== undefined;
  // When the first drop lands, on the performance clock; null until then.
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

    const slabTex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, slabTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.uniform1i(u("u_slab"), 0);

    const section = view.closest("section") ?? view.parentElement ?? view;

    // What this device is asked to draw (see quality.ts).
    const coarse = isCoarse();
    const cell = coarse ? COARSE_CELL : CELL;
    const maxDpr = coarse ? COARSE_DPR : MAX_DPR;
    const maxSteps = coarse ? COARSE_MAX_STEPS : MAX_STEPS;
    // A ripple's speed across the screen is cell * sqrt(COUPLE): springs
    // set further apart must pull on each other more gently to carry it
    // at the same pace.
    const couple = COUPLE * (CELL / cell) ** 2;

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

    // Touches waiting for the next step: drops let fall by clicks, the
    // pointer's wake and the drops landing. Depth and radius in CSS pixels.
    const falls: { x: number; y: number; depth: number; radius: number }[] = [];
    const pointer = { x: 0, y: 0, at: 0, inside: false };
    // Time not yet stepped through, in seconds.
    let owed = 0;

    const stepSlab = (dt: number) => {
      // Each touch strikes the surface once: a small, sharp dip, which the
      // springs then carry outwards as rings.
      for (const f of falls.splice(0)) {
        const px = f.x / cell;
        const py = f.y / cell;
        const pr = f.radius / cell;
        const q0 = Math.max(0, Math.floor(px - pr * 3));
        const q1 = Math.min(cols - 1, Math.ceil(px + pr * 3));
        const r0 = Math.max(0, Math.floor(py - pr * 3));
        const r1 = Math.min(rows - 1, Math.ceil(py + pr * 3));
        for (let r = r0; r <= r1; r++) {
          for (let q = q0; q <= q1; q++) {
            const dx = q - px;
            const dy = r - py;
            height[r * cols + q] -= f.depth * Math.exp(-(dx * dx + dy * dy) / (pr * pr));
          }
        }
      }

      // Always the same small step, however long the frame took, and never
      // more than a few of them to catch up.
      owed = Math.min(owed + dt, STEP_S * maxSteps);
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
            speed[i] += (-REST * hi + couple * lap - DAMP * speed[i]) * sub;
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
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, slabTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16F, cols, rows, 0, gl.RED, gl.FLOAT, height);
    };

    /* ---- the drops ---- */

    /* Where the words are, in the section's CSS pixels: one box for each
       block marked [data-jelly-quiet], read as it stands at rest. Not the
       words themselves, whose extent changes as the headline's last line
       turns over, and not where a block happens to be while it rises into
       place: the drops are laid out round these boxes, and boxes that kept
       changing had them laid out again and again, drops trading places
       across the screen. Read again only when the screen changes size or
       the fonts arrive, and only acted on if one moved. */
    let quiet: Box[] = [];
    // The words as the perched drops see them: the index's own box in place
    // of the block it stands in, so they may sit in the room above it.
    let perchQuiet: Box[] = [];
    // The index, and which of the quiet blocks it stands in (-1: none).
    let perch: Box | null = null;
    let perchHost = -1;
    let measured = false;
    const measureQuiet = () => {
      const origin = section.getBoundingClientRect();
      const boxOf = (el: Element): Box | null => {
        const b = el.getBoundingClientRect();
        if (!b.width || !b.height) return null;
        // Undo any lift still being animated on the way in.
        let lift = 0;
        for (let a = el.parentElement; a && a !== section; a = a.parentElement) {
          const t = getComputedStyle(a).transform;
          if (t && t !== "none") lift += new DOMMatrixReadOnly(t).m42;
        }
        return {
          left: b.left - origin.left,
          top: b.top - origin.top - lift,
          right: b.right - origin.left,
          bottom: b.bottom - origin.top - lift,
          pad: el.hasAttribute("data-jelly-wide") && w < PHONE_W ? WARP_PAD : 0,
        };
      };
      const next: Box[] = [];
      let host = -1;
      const perchEl = section.querySelector("[data-jelly-perch]");
      for (const el of section.querySelectorAll("[data-jelly-quiet]")) {
        const b = boxOf(el);
        if (!b) continue;
        if (perchEl && el.contains(perchEl)) host = next.length;
        next.push(b);
      }
      const nextPerch = perchEl && host >= 0 ? boxOf(perchEl) : null;
      const near = (a: Box, b: Box) =>
        Math.abs(a.left - b.left) < 2 &&
        Math.abs(a.top - b.top) < 2 &&
        Math.abs(a.right - b.right) < 2 &&
        Math.abs(a.bottom - b.bottom) < 2;
      const same =
        measured &&
        next.length === quiet.length &&
        next.every((b, i) => near(b, quiet[i])) &&
        (nextPerch && perch ? near(nextPerch, perch) : nextPerch === perch);
      if (same) return;
      quiet = next;
      perch = nextPerch;
      perchHost = nextPerch ? host : -1;
      perchQuiet = quiet.map((b, i) => (i === perchHost && perch ? perch : b));
      measured = true;
      layoutDrops();
    };

    /** What the drops' sizes are shares of: the screen's shorter side,
        a tenth more on a phone. */
    const dropSide = () => {
      const s = Math.min(w, h);
      return s < SMALL ? s * SMALL_GROW : s;
    };
    /** How far drop i keeps from the words. */
    const clearance = (i: number) => DROPS[i].r * dropSide() * CLEAR_REACH + CLEAR_MARGIN;
    /** Whether a drop centred here, keeping clearance c, is too near a
        block: with the block's own extra room, unless asked to leave it
        out (the spreading does, see WARP_PAD). */
    const inBox = (b: Box, x: number, y: number, c: number, padded = true) => {
      const e = c + (padded ? b.pad : 0);
      return x > b.left - e && x < b.right + e && y > b.top - e && y < b.bottom + e;
    };
    // The drops perched over the index (see PERCHED).
    let perched = new Set<number>();
    /** The words drop i keeps clear of. */
    const wordsFor = (i: number) => (perched.has(i) ? perchQuiet : quiet);
    const inWords = (i: number, x: number, y: number, c: number, padded = true) =>
      wordsFor(i).some((b) => inBox(b, x, y, c, padded));

    // Where the floating bar sits over the field, in its CSS pixels.
    let bar: { left: number; right: number; bottom: number } | null = null;

    /** The drop's body, in CSS pixels, at its full size. */
    const body = (i: number) => DROPS[i].r * dropSide() * EXTENT[i];
    /** The box a drop's centre must stay in to be whole on the screen. */
    const within = (i: number, extra = 0) => {
      const e = body(i) + EDGE_MARGIN + extra;
      return { x0: e, x1: w - e, y0: e, y1: h - e };
    };
    const underBar = (x: number, i: number) =>
      !!bar && x + body(i) > bar.left - NAV_GAP && x - body(i) < bar.right + NAV_GAP;

    /** Held on the screen and clear of the floating bar. */
    const pin = (i: number, x: number, y: number, extra = 0) => {
      const k = within(i, extra);
      if (k.x1 > k.x0) x = Math.min(Math.max(x, k.x0), k.x1);
      if (k.y1 > k.y0) y = Math.min(Math.max(y, k.y0), k.y1);
      if (bar && underBar(x, i)) y = Math.max(y, bar.bottom + NAV_GAP + body(i) + extra);
      return { x, y };
    };

    /** Out of the words by the shortest way that stays on the screen: of
        every edge of every block the point is in, the nearest one whose
        far side is clear water. A few passes, for a point pushed out of
        one block into another. */
    const clear = (i: number, x: number, y: number, c: number) => {
      for (let pass = 0; pass < 4; pass++) {
        const hit = wordsFor(i).find((b) => inBox(b, x, y, c));
        if (!hit) return { x, y };
        const k = within(i);
        const e = c + hit.pad;
        const exits = [
          { x: hit.left - e, y },
          { x: hit.right + e, y },
          { x, y: hit.top - e },
          { x, y: hit.bottom + e },
        ]
          .filter((p) => p.x >= k.x0 && p.x <= k.x1 && p.y >= k.y0 && p.y <= k.y1)
          .sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y));
        const free = exits.find((p) => !inWords(i, p.x, p.y, c)) ?? exits[0];
        if (!free) return { x, y };
        x = free.x;
        y = free.y;
      }
      return { x, y };
    };

    /* Where each drop is based, for this screen. The screen is read as a
       square with words in some of its corners (the headline top left,
       the subtitle top right, the index bottom right, the readouts along
       the foot), and the drops are spread as evenly as they can be through
       the room the words leave: every drop as far as it can be from its
       neighbours, from the words and from the edges, all at once.

       Worked out, not drawn by hand, so the balance holds on any screen.
       The biggest drop goes down first, in the middle of the largest open
       water; each one after it goes wherever the open water is now widest,
       weighed by how big it is. Then all of them are nudged, a little at a
       time, towards wherever the narrowest gap round them grows, until no
       move makes any gap wider. Nothing random: the same screen always
       gets the same layout, so a drop never trades places on a reload.

       Each drop then roams round its base, as far as the room round it
       allows, and never as far as a neighbour's half of the water. */
    // Indexed by drop: where each is based, and where it is shown now.
    let bases: { x: number; y: number }[] = [];
    let shown: { x: number; y: number }[] = [];
    // The drops on screen, in drawing order.
    let active: number[] = [];
    // Each drop's turn to land, by its index (see layoutDrops).
    let landSlot = new Map<number, number>();
    // How far each drop roams round its base: the full wander where it has
    // open water round it, less where an edge or a neighbour is near.
    let roam: number[] = [];
    let wander = 0;
    // The screen size the drops were last laid out for.
    let laidFor = "";

    /** How far a point is from a block of words, 0 inside it. */
    const toBox = (b: Box, x: number, y: number) =>
      Math.hypot(Math.max(b.left - x, 0, x - b.right), Math.max(b.top - y, 0, y - b.bottom));

    const layoutDrops = () => {
      // Nothing to lay out on until the field has been given its size.
      if (!w || !h) return;
      const n = count();
      const side = Math.min(w, h);
      // Biggest first: the big ones need the open water the small ones can
      // do without.
      const order = Array.from({ length: n }, (_, i) => i).sort((a, b) => body(b) - body(a));
      perched = new Set();
      const top = bar ? bar.bottom + NAV_GAP : EDGE_MARGIN;

      /* How much open water there is round drop i at (x, y), as the
         narrowest of its gaps: to the edges of the screen, to the words
         and to every drop already down, each measured from the drop's
         own edge. Edges count for a little less than words and drops, so
         the drops do not all keep to the middle of the screen. Below zero
         the spot is not allowed at all. */
      const openAt = (i: number, x: number, y: number, others: number[], at: { x: number; y: number }[]) => {
        const r = body(i);
        const edge = Math.min(x - r, w - x - r, y - r - top, h - y - r) - EDGE_MARGIN;
        if (edge < 0 || inWords(i, x, y, clearance(i), false)) return -Infinity;
        let gap = edge * 1.6;
        for (const b of wordsFor(i)) gap = Math.min(gap, toBox(b, x, y) - r);
        for (const j of others) {
          gap = Math.min(gap, Math.hypot(x - at[j].x, y - at[j].y) - r - body(j));
        }
        return gap;
      };

      const next: { x: number; y: number }[] = [];
      const placed: number[] = [];
      const step = Math.max(8, Math.round(side / 70));
      for (const i of order) {
        let best: { x: number; y: number } | null = null;
        let bestGap = -Infinity;
        for (let y = top; y <= h; y += step) {
          for (let x = 0; x <= w; x += step) {
            const gap = openAt(i, x, y, placed, next);
            if (gap > bestGap) {
              bestGap = gap;
              best = { x, y };
            }
          }
        }
        // No clear water for it anywhere: better left out than on words.
        if (!best) continue;
        next[i] = best;
        placed.push(i);
      }

      // Evened out: each drop in turn tries a short move each way and
      // takes the one that most widens its narrowest gap. The moves get
      // shorter as the layout settles.
      for (let pass = 0, reach = step * 4; pass < 60 && reach >= 1; pass++) {
        let moved = false;
        for (const i of placed) {
          const others = placed.filter((j) => j !== i);
          let here = openAt(i, next[i].x, next[i].y, others, next);
          for (let k = 0; k < 8; k++) {
            const a = (k / 8) * Math.PI * 2;
            const x = next[i].x + Math.cos(a) * reach;
            const y = next[i].y + Math.sin(a) * reach;
            const gap = openAt(i, x, y, others, next);
            if (gap > here + 0.25) {
              here = gap;
              next[i] = { x, y };
              moved = true;
            }
          }
        }
        if (!moved) reach /= 2;
      }

      // Each drop roams a fair way round its base, not pinned to it.
      const spread = side < SMALL ? SMALL_SPREAD : 1;
      wander = side * 0.1 * spread;

      // Only now the blocks' extra room (see WARP_PAD): a drop that falls
      // inside it is taken out by the shortest way, and no other moves.
      for (const i of placed) next[i] = clear(i, next[i].x, next[i].y, clearance(i));

      /* Then the drops perched over the index, the next ones along, laid
         the same way but only in the room above it, centred over its
         column, with every drop already down left where it is. None is
         set down where there is no clear water for it there. */
      if (perch && perchHost >= 0) {
        const host = quiet[perchHost];
        // Over the index's column and above it; the index itself, the
        // other words, the edges and the drops already down are kept clear
        // of by openAt.
        const inRoom = (_i: number, x: number, y: number) =>
          y <= perch!.top && x >= host.left && x <= host.right;
        for (let k = 0; k < PERCHED && n + k < DROPS.length; k++) {
          const i = n + k;
          perched.add(i);
          const openHere = (x: number, y: number) => (inRoom(i, x, y) ? openAt(i, x, y, placed, next) : -Infinity);
          let best: { x: number; y: number } | null = null;
          let bestGap = -Infinity;
          for (let y = top; y <= perch.top; y += step) {
            for (let x = host.left; x <= host.right; x += step) {
              const gap = openHere(x, y);
              if (gap > bestGap) {
                bestGap = gap;
                best = { x, y };
              }
            }
          }
          if (!best || bestGap < 0) {
            perched.delete(i);
            break;
          }
          next[i] = best;
          placed.push(i);
        }
        // Evened out between themselves, the others held still.
        const mine = placed.filter((i) => perched.has(i));
        for (let pass = 0, reach = step * 4; pass < 60 && reach >= 1; pass++) {
          let moved = false;
          for (const i of mine) {
            const others = placed.filter((j) => j !== i);
            let here = openAt(i, next[i].x, next[i].y, others, next);
            for (let k = 0; k < 8; k++) {
              const a = (k / 8) * Math.PI * 2;
              const x = next[i].x + Math.cos(a) * reach;
              const y = next[i].y + Math.sin(a) * reach;
              if (!inRoom(i, x, y)) continue;
              const gap = openAt(i, x, y, others, next);
              if (gap > here + 0.25) {
                here = gap;
                next[i] = { x, y };
                moved = true;
              }
            }
          }
          if (!moved) reach /= 2;
        }
      }

      active = placed;

      /* The order they land in: the order they were laid, biggest first,
         with the perched drops set in among the rest at even intervals
         rather than coming down last, on their own, after the others had
         all landed (the user: it looked unnatural). */
      const main = placed.filter((i) => !perched.has(i));
      const extra = placed.filter((i) => perched.has(i));
      const sequence = [...main];
      extra.forEach((i, k) => {
        sequence.splice(Math.round(((k + 1) * main.length) / (extra.length + 1)) + k, 0, i);
      });
      landSlot = new Map(sequence.map((i, slot) => [i, slot]));

      // How far each drop may roam from its base: as far as the wander goes,
      // but never so far that its body would reach an edge or the bar, nor
      // past its half of the water between it and its nearest neighbour,
      // so two never meet and the balance is kept while they move. (It
      // roams on both axes at once, hence the root of two.)
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
        for (const j of active) {
          if (j === i) continue;
          const gap = Math.hypot(b.x - next[j].x, b.y - next[j].y) - keep - body(j);
          r = Math.min(r, gap / 2 / Math.SQRT2);
        }
        // A perched drop roams no nearer the index, or any other words,
        // than the margin every drop keeps.
        if (perched.has(i)) {
          for (const q of perchQuiet) r = Math.min(r, toBox(q, b.x, b.y) - keep - CLEAR_MARGIN);
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
        shown = next.map((b) => (b ? { ...b } : b));
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

    /* ---- the landing ---- */

    // Whether the drops are all down (or never had to come down), and which
    // have struck the water so far.
    let landed = !entrance || reduce;
    const struck = new Set<number>();
    /** How far into its landing drop i is, 0 to 1, by its place in the
        landing order (see landSlot). */
    const grown = (slot: number, now: number) => {
      if (landed) return 1;
      const start = setOff.current;
      if (start === null) return 0;
      return Math.min(Math.max((now - start - slot * LAND_GAP_S * 1000) / (LAND_S * 1000), 0), 1);
    };

    const dropData = new Float32Array(MAX_BLOBS * 4);
    const turnData = new Float32Array(MAX_BLOBS);
    const count = () => (Math.min(w, h) < SMALL ? 6 : 11);
    const placeDrops = (now: number) => {
      const side = dropSide();
      let blobs = 0;
      let down = 0;
      // The drops live on a slower clock than the water.
      const slow = seconds * DROP_PACE;
      active.forEach((i, slot) => {
        if (!shown[i]) return;
        const d = DROPS[i];
        const go = roam[i] ?? wander;
        let x = shown[i].x + go * Math.sin((slow * Math.PI * 2) / d.px + i * 1.7);
        let y = shown[i].y + go * Math.sin((slow * Math.PI * 2) / d.py + i * 2.3);
        // Never behind the words: a drop that wanders up to them is held
        // at their edge, and slides along it; never off the screen, nor up
        // under the floating bar.
        ({ x, y } = pin(i, x, y));
        ({ x, y } = clear(i, x, y, clearance(i)));

        // Coming down: it swells out of nothing where it lands, and the
        // moment it touches it strikes the water.
        const g = grown(landSlot.get(i) ?? slot, now);
        if (g >= 1) down++;
        if (g > 0 && !struck.has(i)) {
          struck.add(i);
          if (!landed) {
            falls.push({ x, y, depth: LAND_DEPTH, radius: d.r * side * 0.9 });
          }
        }
        const r = d.r * side * landing(g);

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
      });
      if (!landed && active.length > 0 && down === active.length) landed = true;
      return blobs;
    };

    /* ---- drawing ---- */

    const size = () => {
      const rect = view.getBoundingClientRect();
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      view.width = Math.round(w * dpr);
      view.height = Math.round(h * dpr);

      // The floating bar, read from the page, where it rests at the top.
      const barEl = document.querySelector("header .shell > div");
      if (barEl) {
        const b = barEl.getBoundingClientRect();
        const o = view.getBoundingClientRect();
        bar = { left: b.left - o.left, right: b.right - o.left, bottom: b.bottom - o.top };
      }

      cols = Math.max(2, Math.ceil(w / cell));
      rows = Math.max(2, Math.ceil(h / cell));
      height = new Float32Array(cols * rows);
      speed = new Float32Array(cols * rows);
      sendSlab();
      // Always laid out afresh for a new size, even if the words' boxes
      // have not moved.
      measured = false;
      measureQuiet();
    };

    const draw = (n: number) => {
      gl.viewport(0, 0, view.width, view.height);
      gl.uniform2f(u("u_size"), w, h);
      gl.uniform1f(u("u_dpr"), dpr);
      gl.uniform1f(u("u_cell"), cell);
      gl.uniform1f(u("u_t"), seconds);
      gl.uniform1f(u("u_td"), seconds * DROP_PACE);
      gl.uniform4fv(u("u_drop"), dropData);
      gl.uniform1fv(u("u_turn"), turnData);
      gl.uniform1i(u("u_drops"), n);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    const render = (now: number) => draw(placeDrops(now));

    /* ---- the clock ---- */

    let frame = 0;
    let last = 0;
    let visible = false;
    /** On the screen and not covered over. */
    const onScreen = () => visible && !coveredRef.current;

    const tick = (t: number) => {
      // Under the curtain until the drops start to land, nothing here can
      // be seen, and the water would only be taking frames from the flight
      // above it. Held, not stopped, so it picks up on the first frame it
      // is due.
      if (!landed && (setOff.current === null || t < setOff.current)) {
        last = 0;
        frame = onScreen() ? requestAnimationFrame(tick) : 0;
        return;
      }
      const dt = last ? Math.min((t - last) / 1000, 1 / 20) : 1 / 60;
      last = t;
      seconds += dt;
      glideDrops(dt);
      // Placed before the step, so a drop that lands this frame strikes
      // the water this frame.
      const n = placeDrops(t);
      stepSlab(dt);
      sendSlab();
      draw(n);
      frame = onScreen() ? requestAnimationFrame(tick) : 0;
      if (!frame) last = 0;
    };

    const wake = () => {
      if (reduce || frame || !onScreen() || disposed) return;
      frame = requestAnimationFrame(tick);
    };
    wakeRef.current = wake;

    let queued = 0;
    const refit = () => {
      if (queued) return;
      queued = requestAnimationFrame(() => {
        queued = 0;
        if (disposed) return;
        size();
        render(performance.now());
      });
    };
    refit();
    document.fonts.ready.then(() => {
      // The fonts can be ready before the field has its size; the first
      // sizing measures the words then.
      if (disposed || !w) return;
      measureQuiet();
      if (reduce) render(performance.now());
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
      gl.deleteTexture(slabTex);
      gl.deleteBuffer(quad);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [reduce, entrance]);

  return <canvas ref={canvas} aria-hidden="true" className={`block h-full w-full ${className ?? ""}`} />;
}
