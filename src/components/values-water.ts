"use client";

import { useEffect, type RefObject } from "react";

/* ==================================================================
   Values water

   The second screen's water and glass (see jelly-field.tsx), set down
   again for the values: the same white ground under the same moving
   sheet of water, the same black glass, the same hand in the water (a
   wake behind a moving pointer, a ring where a click lands). What is
   different is the drops. There are four, one to a value, all about the
   same size and each as irregular as the drops on the home page: a body
   with two lobes drifting round it. They sit where the page lays out
   their buttons, so the words under them and the glass above them are
   always in the same place.

   Choosing a value pulls all four together. The one chosen sets off
   first and the others follow it, each a beat later, along a slight
   arc; where they meet they run into one another as oil does, and the
   lobes are drawn in so the four become one smooth piece. While they
   travel the glass loses its highlight, because the piece they become
   is the site's call-to-action drop, and that one has none: the four
   are laid out to the size of that drop (worked out below so that the
   joined field fills its box), and once they have met, the drawn glass
   hands over to the real one, which carries the value in white. Letting
   go runs the same way backwards.

   The shader is the home page's, kept in step with it by hand: if the
   glass or the water there changes, this should follow.
   ================================================================== */

/** What the page tells the water, and what the water tells it back. */
export type ValuesControl = {
  /** 1 to pull the drops together, 0 to let them go. */
  target: 0 | 1;
  /** The value chosen: its drop leads. */
  lead: number;
  /** The four drops' buttons, which they are drawn on. */
  slots: (HTMLElement | null)[];
  /** The joined drop, the real one, laid out where the four meet. */
  merged: HTMLElement | null;
  /** Read the boxes again before the next frame. */
  remeasure: boolean;
  /** The four have met and the real drop is fully in. */
  onJoined: () => void;
  /** The four are back where they rest. */
  onParted: () => void;
};

/* ---- the water, as on the home page ---------------------------------- */

const CELL = 8;
const REST = 6;
const COUPLE = 1100;
const DAMP = 0.9;
const STEP_S = 1 / 120;
const MAX_STEPS = 8;
const HAND = 0.32;
const DROP_DEPTH = 9 * HAND;
const DROP_RADIUS = 18;
const WAKE_DEPTH = 1.75 * HAND;
const WAKE_RADIUS = 22;
const WAKE_SPEED = 800;
const WAKE_SPACING = 10;
const SWELL = 7;
const REFRACT = 85;
const DROP_BEND = 0.45;
const CAUSTIC = 9;
const DROP_PACE = 0.18;
const MAX_DPR = 1.5;
const STILL_T = 24;

/* ---- the four ---------------------------------------------------------- */

/** How long the four take to come together, in seconds, and how long
    the drawn glass then takes to hand over to the real drop. */
const JOIN_S = 1.25;
const HAND_OVER_S = 0.38;
/** How much later than the one chosen the last of the others sets off,
    as a share of the join. */
const FOLLOW = 0.16;
/** The body's radius as a share of its button's width: the field is half
    strength at about 0.83 of it, and the lobes reach a little past that. */
const BODY = 0.34;
/** The rings the drops strike as they meet, and as one is chosen. */
const MEET_DEPTH = 6;
const PICK_DEPTH = 4;

function seeded(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Each drop's own character, the same on every visit. Sizes stay close
    (the user asked for four of a size); outlines do not. */
const DROPS = (() => {
  const r = seeded(19);
  const range = (lo: number, hi: number) => lo + r() * (hi - lo);
  return Array.from({ length: 4 }, () => ({
    px: range(55, 110),
    py: range(55, 110),
    size: range(0.95, 1.05),
    aspect: range(1.05, 1.3),
    tilt: range(0, Math.PI),
    spin: range(0.03, 0.07) * (r() < 0.5 ? -1 : 1),
    lobes: [0, 1].map(() => ({
      angle: range(0, Math.PI * 2),
      reach: range(0.5, 0.75),
      size: range(0.45, 0.65),
      aspect: range(1, 1.5),
      drift: range(0.12, 0.3) * (r() < 0.5 ? -1 : 1),
    })),
  }));
})();
const BLOBS = 4 * 3;

const VERTEX = `#version 300 es
in vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }`;

const FRAGMENT = `#version 300 es
precision highp float;
out vec4 outColor;

uniform vec2 u_size;
uniform float u_dpr;
uniform float u_t;
uniform float u_td;
uniform vec4 u_drop[${BLOBS}];
uniform float u_turn[${BLOBS}];
uniform float u_warp;   // how far the outline wanders: less as they join
uniform float u_spec;   // the highlight: none on the joined drop
uniform float u_show;   // the drawn glass, handing over to the real drop
uniform sampler2D u_slab;

float drops(vec2 p) {
  vec2 w = p + (vec2(sin(p.y * 0.0061 + u_td * 0.31), cos(p.x * 0.0053 - u_td * 0.27)) * 16.0
             + vec2(sin(p.y * 0.017 - u_td * 0.5), cos(p.x * 0.019 + u_td * 0.45)) * 7.0) * u_warp;
  float f = 0.0;
  for (int i = 0; i < ${BLOBS}; i++) {
    vec4 d = u_drop[i];
    if (d.z < 0.5) continue;
    vec2 far = w - d.xy;
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

float dome(float f) {
  return sqrt(1.0 - exp(-max(f - 0.44, 0.0) * 2.2));
}

float glass(vec2 g, float steep) {
  vec3 n = normalize(vec3(-g * steep, 1.0));
  vec3 h = normalize(normalize(LIGHT) + vec3(0.0, 0.0, 1.0));
  float nh = max(dot(n, h), 0.0);
  float rim = pow(1.0 - n.z, 3.0);
  return min(0.015 + rim * 0.45 + (pow(nh, 90.0) * 0.95 + pow(nh, 10.0) * 0.08) * u_spec, 1.0);
}

float slab(vec2 p) {
  return texture(u_slab, p / u_size).r;
}

vec3 swell(vec2 p) {
  vec3 g = vec3(0.0);
  for (int i = 0; i < 8; i++) {
    float fi = float(i);
    float a = fi * 0.7854 + 0.31 + 0.2 * sin(fi * 2.3);
    vec2 d = vec2(cos(a), sin(a));
    float len = 190.0 + 45.0 * mod(fi * 3.0, 5.0);
    float k = 6.2832 / len;
    float pace = sqrt(9.81 * 60.0 / k) * 0.006;
    float s = dot(p, d) * k - u_t * pace * k * 60.0 + fi * 1.9;
    g.xy += d * (k * cos(s));
    g.z -= k * k * sin(s);
  }
  return g * ${SWELL.toFixed(1)};
}

void main() {
  vec2 p = vec2(gl_FragCoord.x, u_size.y * u_dpr - gl_FragCoord.y) / u_dpr;

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
  vec2 q = p + gs * ${(REFRACT * DROP_BEND).toFixed(2)};
  vec3 ns = normalize(vec3(-gs, 1.0));

  float col = 1.0;
  if (u_show > 0.001) {
    float d = 1.5;
    float fd = drops(q);
    float hd = dome(fd);
    vec2 gd = vec2(dome(drops(q + vec2(d, 0.0))) - hd, dome(drops(q + vec2(0.0, d))) - hd) / d;
    float bodyD = smoothstep(0.44, 0.56, fd) * u_show;
    float shade = smoothstep(0.15, 0.9, drops(q - vec2(14.0, 20.0))) * 0.1 * u_show;
    col = 1.0 - shade;
    col = mix(col, glass(gd, 70.0), bodyD);
  }

  vec3 l = normalize(LIGHT);
  vec3 h = normalize(l + vec3(0.0, 0.0, 1.0));
  col *= 1.0 - clamp(curve * ${CAUSTIC.toFixed(1)}, 0.0, 0.11);
  float lit = dot(ns, l) - l.z;
  col *= 1.0 + lit * 0.35;
  float sheen = pow(max(dot(ns, h), 0.0), 90.0);
  col += sheen * 0.5 * (1.0 - col);

  outColor = vec4(vec3(clamp(col, 0.0, 1.0)), 1.0);
}`;

/* ---- helpers ------------------------------------------------------------ */

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Where a body rests: the middle of its button, and how big it is. */
type Home = { x: number; y: number; r: number };
/** Where the four meet: every blob of every drop on one line, evenly
    spaced, all of one radius. */
type Meet = { xs: number[]; y: number; r: number };

/** The joined field of equal round blobs in a row, at a point. */
function field(xs: number[], r: number, x: number, y: number) {
  let f = 0;
  for (const xi of xs) f += Math.exp(-((x - xi) ** 2 + y * y) / (r * r));
  return f;
}

/** All twelve blobs (a body and two lobes from each drop) laid out in a
    row so that, joined, the field is at half strength exactly on the edges
    of the box: half its height above and below the middle, half its width
    either side. Twelve close together make a smooth, even piece; four
    alone pinched in between one another. Worked out by halving, which is
    cheap and cannot fail to settle. */
function meetFor(cx: number, cy: number, w: number, h: number): Meet {
  const half = h / 2;
  const row = (s: number) => Array.from({ length: BLOBS }, (_, k) => (k - (BLOBS - 1) / 2) * s);
  const rFor = (s: number) => {
    const xs = row(s);
    let lo = half * 0.1;
    let hi = half * 2;
    for (let n = 0; n < 40; n++) {
      const mid = (lo + hi) / 2;
      if (field(xs, mid, 0, half) < 0.5) lo = mid;
      else hi = mid;
    }
    return { xs, r: (lo + hi) / 2 };
  };
  // A wider spacing reaches further out at the ends.
  let lo = 0;
  let hi = w / (BLOBS - 1);
  for (let n = 0; n < 40; n++) {
    const s = (lo + hi) / 2;
    const { xs, r } = rFor(s);
    // How far out along the middle the field stays at half strength.
    const endX = xs[BLOBS - 1];
    let a = endX;
    let b = endX + r * 3;
    for (let m = 0; m < 30; m++) {
      const mid = (a + b) / 2;
      if (field(xs, r, mid, 0) > 0.5) a = mid;
      else b = mid;
    }
    if ((a + b) / 2 < w / 2) lo = s;
    else hi = s;
  }
  const { xs, r } = rFor((lo + hi) / 2);
  return { xs: xs.map((x) => x + cx), y: cy, r };
}

/* ======================================================================= */

export function useValuesWater(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  control: RefObject<ValuesControl>,
  reduce: boolean,
) {
  useEffect(() => {
    const view = canvasRef.current;
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

    let disposed = false;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let seconds = reduce ? STILL_T : 0;

    /* ---- the slab, as on the home page ---- */

    let cols = 0;
    let rows = 0;
    let height = new Float32Array(0);
    let speed = new Float32Array(0);
    const falls: { x: number; y: number; depth: number; radius: number }[] = [];
    const pointer = { x: 0, y: 0, at: 0, inside: false };
    let owed = 0;

    const stepSlab = (dt: number) => {
      for (const f of falls.splice(0)) {
        const px = f.x / CELL;
        const py = f.y / CELL;
        const pr = f.radius / CELL;
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
            speed[i] += (-REST * hi + COUPLE * lap - DAMP * speed[i]) * sub;
          }
        }
        for (let i = 0; i < height.length; i++) height[i] += speed[i] * sub;
      }
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

    /* ---- where the drops rest, and where they meet ---- */

    let homes: Home[] = [];
    let meet: Meet | null = null;

    const measure = () => {
      const c = control.current;
      const o = view.getBoundingClientRect();
      homes = c.slots.map((el) => {
        if (!el) return { x: -999, y: -999, r: 0 };
        const b = el.getBoundingClientRect();
        return {
          x: b.left - o.left + b.width / 2,
          y: b.top - o.top + b.height / 2,
          r: b.width * BODY,
        };
      });
      const m = c.merged;
      if (m) {
        const b = m.getBoundingClientRect();
        // The real drop's glass reaches past its box (see .abt-val-drop::before):
        // the four meet to the glass, not to the box.
        const fs = parseFloat(getComputedStyle(m).fontSize) || 16;
        const left = b.left - o.left - 0.36 * fs;
        const top = b.top - o.top - 0.3 * fs;
        const bw = b.width + 0.86 * fs;
        const bh = b.height + 0.72 * fs;
        if (bw > 0 && bh > 0) meet = meetFor(left + bw / 2, top + bh / 2, bw, bh);
      }
      c.remeasure = false;
    };

    /* ---- the join ---- */

    // 0 at rest, 1 when the four have met, 1 + HAND_OVER when the real drop
    // has taken over. Driven toward the target at a steady pace; each
    // drop eases its own share of it.
    const END = 1 + HAND_OVER_S / JOIN_S;
    let k = 0;
    let wasMet = false;
    let reported: "joined" | "parted" = "parted";

    const share = (i: number) => {
      const c = control.current;
      // The one chosen first; the others by how far they are from it.
      const lead = homes[c.lead];
      const dist = lead && homes[i] ? Math.hypot(homes[i].x - lead.x, homes[i].y - lead.y) : 0;
      const most = Math.max(
        1,
        ...homes.map((hm) => (lead ? Math.hypot(hm.x - lead.x, hm.y - lead.y) : 0)),
      );
      const delay = i === c.lead ? 0 : FOLLOW * (0.35 + 0.65 * (dist / most));
      return easeInOut(clamp01((Math.min(k, 1) - delay) / (1 - delay)));
    };

    const dropData = new Float32Array(BLOBS * 4);
    const turnData = new Float32Array(BLOBS);

    const placeDrops = () => {
      const slow = seconds * DROP_PACE;
      let blobs = 0;
      /** Writes one blob, carried from where it is to its place in the
          row by m, and pushed off its way by (ox, oy). */
      const put = (
        slot: number,
        x: number,
        y: number,
        r: number,
        aspect: number,
        turn: number,
        m: number,
        ox: number,
        oy: number,
      ) => {
        if (meet && m > 0) {
          x = lerp(x, meet.xs[slot], m) + ox;
          y = lerp(y, meet.y, m) + oy;
          r = lerp(r, meet.r, m);
          aspect = lerp(aspect, 1, m);
        }
        dropData.set([x, y, r < 0.6 ? 0 : r, aspect], blobs * 4);
        turnData[blobs++] = turn;
      };
      DROPS.forEach((d, i) => {
        const home = homes[i];
        if (!home) return;
        const m = meet ? share(i) : 0;
        // A slow wander round the button's middle, gone once joined.
        const go = home.r * 0.08 * (1 - m);
        const x = home.x + go * Math.sin((slow * Math.PI * 2) / d.px + i * 1.7);
        const y = home.y + go * Math.sin((slow * Math.PI * 2) / d.py + i * 2.3);
        const r = home.r * d.size;
        const turn = d.tilt + slow * d.spin;
        // Along a slight arc rather than a ruled line: the whole drop is
        // bowed sideways off its way, most half-way along it.
        let ox = 0;
        let oy = 0;
        if (meet && m > 0) {
          const dx = meet.xs[i * 3 + 1] - home.x;
          const dy = meet.y - home.y;
          const len = Math.hypot(dx, dy) || 1;
          const bow = Math.sin(Math.PI * m) * home.r * 0.35 * (i % 2 ? 1 : -1);
          ox = (-dy / len) * bow;
          oy = (dx / len) * bow;
        }
        // Each drop's body takes the middle of its three places in the
        // row, and its lobes the places either side.
        put(i * 3 + 1, x, y, r, d.aspect, turn, m, ox, oy);
        d.lobes.forEach((lobe, j) => {
          const angle = turn + lobe.angle + slow * lobe.drift;
          const reach = r * lobe.reach * (1 + 0.15 * Math.sin(slow * 0.4 + i + j * 2));
          const size = r * lobe.size * (1 + 0.2 * Math.sin(slow * 0.33 * (j + 1) + i * 1.3));
          put(
            i * 3 + j * 2,
            x + Math.cos(angle) * reach,
            y + Math.sin(angle) * reach,
            size,
            lobe.aspect,
            angle,
            m,
            ox,
            oy,
          );
        });
      });
      return blobs;
    };

    /* ---- drawing ---- */

    const size = () => {
      const rect = view.getBoundingClientRect();
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      view.width = Math.round(w * dpr);
      view.height = Math.round(h * dpr);
      cols = Math.max(2, Math.ceil(w / CELL));
      rows = Math.max(2, Math.ceil(h / CELL));
      height = new Float32Array(cols * rows);
      speed = new Float32Array(cols * rows);
      sendSlab();
      measure();
    };

    const draw = () => {
      placeDrops();
      const hand = clamp01((k - 1) / (END - 1));
      const joined = clamp01(k);
      gl.viewport(0, 0, view.width, view.height);
      gl.uniform2f(u("u_size"), w, h);
      gl.uniform1f(u("u_dpr"), dpr);
      gl.uniform1f(u("u_t"), seconds);
      gl.uniform1f(u("u_td"), seconds * DROP_PACE);
      gl.uniform4fv(u("u_drop"), dropData);
      gl.uniform1fv(u("u_turn"), turnData);
      gl.uniform1f(u("u_warp"), 1 - 0.75 * joined);
      gl.uniform1f(u("u_spec"), 1 - joined);
      gl.uniform1f(u("u_show"), 1 - hand);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      // The real drop comes in exactly as the drawn one goes.
      const merged = control.current.merged;
      if (merged) merged.style.opacity = String(hand);
    };

    /** Moves the join on by dt, strikes the water when the four meet and
        tells the page when either end is reached. */
    const advance = (dt: number) => {
      const c = control.current;
      if (c.remeasure) measure();
      const goal = c.target ? END : 0;
      if (reduce) k = goal;
      else if (k < goal) k = Math.min(goal, k + dt / JOIN_S);
      else if (k > goal) k = Math.max(goal, k - dt / JOIN_S);

      const met = k >= 1;
      if (met && !wasMet && meet && !reduce) {
        const cx = (meet.xs[0] + meet.xs[BLOBS - 1]) / 2;
        falls.push({ x: cx, y: meet.y, depth: MEET_DEPTH, radius: meet.r * 1.6 });
      }
      wasMet = met;

      if (k >= END && reported !== "joined") {
        reported = "joined";
        c.onJoined();
      } else if (k <= 0 && reported !== "parted") {
        reported = "parted";
        c.onParted();
      }
    };

    /* ---- the clock ---- */

    let frame = 0;
    let last = 0;
    let visible = false;

    const tick = (t: number) => {
      const dt = last ? Math.min((t - last) / 1000, 1 / 20) : 1 / 60;
      last = t;
      if (!reduce) seconds += dt;
      advance(dt);
      if (!reduce) {
        stepSlab(dt);
        sendSlab();
      }
      draw();
      // Held still for anyone who asked for less motion: one frame per
      // change, and none in between.
      frame = visible && !reduce ? requestAnimationFrame(tick) : 0;
      if (!frame) last = 0;
    };

    const wake = () => {
      if (frame || !visible || disposed) return;
      frame = requestAnimationFrame(tick);
    };

    let queued = 0;
    const refit = () => {
      if (queued) return;
      queued = requestAnimationFrame(() => {
        queued = 0;
        if (disposed) return;
        size();
        draw();
      });
    };
    refit();
    document.fonts.ready.then(() => {
      if (disposed || !w) return;
      measure();
      draw();
    });

    const resize = new ResizeObserver(refit);
    resize.observe(view);

    const seen = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      wake();
    });
    seen.observe(view);

    // The page asks for a frame whenever it changes the target, even with
    // less motion asked for, where nothing else would draw one.
    const nudge = () => wake();
    section.addEventListener("values:change", nudge);

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
    // A drop chosen from the keyboard strikes the water as a click would.
    const onPick = (event: Event) => {
      const i = (event as CustomEvent<number>).detail;
      const home = homes[i];
      if (home && !reduce) falls.push({ x: home.x, y: home.y, depth: PICK_DEPTH, radius: home.r });
    };

    if (!reduce) {
      section.addEventListener("pointerdown", onDown as EventListener);
      section.addEventListener("pointermove", onMove as EventListener);
      section.addEventListener("pointerleave", onLeave);
      section.addEventListener("values:pick", onPick);
    }

    const onLost = (event: Event) => event.preventDefault();
    view.addEventListener("webglcontextlost", onLost);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      cancelAnimationFrame(queued);
      resize.disconnect();
      seen.disconnect();
      section.removeEventListener("values:change", nudge);
      section.removeEventListener("pointerdown", onDown as EventListener);
      section.removeEventListener("pointermove", onMove as EventListener);
      section.removeEventListener("pointerleave", onLeave);
      section.removeEventListener("values:pick", onPick);
      view.removeEventListener("webglcontextlost", onLost);
      gl.deleteTexture(slabTex);
      gl.deleteBuffer(quad);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [canvasRef, control, reduce]);
}
