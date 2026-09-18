"use client";

import { useEffect, useRef, type RefObject } from "react";
import { useReducedMotion } from "motion/react";

/* ==================================================================
   Liquid lens

   Two layers over the foot of the page, drawn from one description of
   it, so that what is seen through the drop is exactly what is under it.

   The backdrop is black with light in it: a handful of white pools,
   pulled far out of round by a slow turbulence, each turning and
   wandering on a loop of its own length, and lit as if they had a
   surface, so the light on them is glossy rather than a flat glow. The
   pool nearest the pointer draws away from it. The backdrop is soft all
   over, so it is drawn at half resolution and left to the browser to
   scale up, which only softens it further.

   Over everything is a drop of water that follows the pointer. The drop
   is a dome: at its centre it magnifies what is under it, towards its
   edge it gathers in what lies outside it and squeezes that into a thin
   ring, and at the edge itself there is a seam, which is what makes it
   read as a lens rather than as a smudge. Its canvas paints nothing but
   the drop; everywhere else it is clear, so what is seen there is the
   page itself: sharp, selectable, clickable (the canvas takes no
   pointer). Inside the drop it paints the footer again:

   - the backdrop and the mark, which get the whole of the effect:
     magnified, turned on themselves and pulled into the rim;
   - the words, which are only magnified, never turned, and pulled far
     less, so a line under the drop is bigger and still reads.

   The words are drawn into their copy from the page's own layout, word
   by word, in the page's own fonts and colours, and redrawn whenever the
   footer changes size. A link that is changing (its colour, its
   underline, its focus ring) is redrawn around itself every frame until
   it settles, so the drop shows it as it is, not as it was. The mark has
   a copy of its own and is placed each frame, because it moves while
   the page scrolls.

   Behind the words the light is kept low, so the small print never has
   a pool of it for a ground.

   What makes the drop liquid rather than glass is that it never quite
   holds its shape. It trails the pointer, it is drawn out along the way
   it is moving and gathers back when it stops, and its rim trembles on
   two slow waves of different lengths.

   It never meets the edge of the footer. As the pointer nears any side
   the drop shrinks, reaching nothing at the edge itself, so it is never
   cut off by the section above or the end of the page, and it forms
   again from a point as the pointer comes back in.

   The backdrop runs only while the footer is on screen. For a finger
   there is no drop and the pools do not shy; for anyone who has asked
   for less motion the backdrop is drawn once and holds still, and anyone
   else can hold it still from the footer.
   ================================================================== */

/** The drop's radius, as a share of the mark's height, within bounds. */
const RADIUS = 0.5;
const MIN_RADIUS = 70;
const MAX_RADIUS = 180;
/** How much of its distance to the pointer the drop takes per frame at 60fps. */
const FOLLOW = 0.14;
/** How far in from an edge the drop is at full size, as a share of its radius. */
const EDGE = 1.25;
const MAX_DPR = 2;
/** The backdrop's resolution, in canvas pixels per CSS pixel. */
const BACKDROP_SCALE = 0.5;
/** Where the still backdrop is frozen, in seconds of its loop. */
const STILL_T = 40;
/** How many pools of light there are. */
const POOLS = 7;
/** How far a pool held to one of the open corners of a wide footer may
    wander, as a share of how far a free one does. */
const HELD_REACH = 0.35;
/** How many boxes of words the light is kept away from, at most. */
const CALM_BOXES = 6;
/** How much of the light is taken away behind the words. */
const CALM_DEPTH = 0.82;
/** The room kept around each box of words, in CSS pixels. */
const CALM_PAD = 10;
/** How far past an element's box its repaint reaches: its focus ring,
    its underline and the hanging letters. */
const REPAINT_PAD = 12;

const VERTEX = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = vec2(a_pos.x * 0.5 + 0.5, 0.5 - a_pos.y * 0.5);
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

/* The backdrop, as a function of a point in footer units (the footer's
   height is 1, y runs down). Both layers carry it. */
const BACKDROP = `
uniform float u_t;
uniform float u_aspect;
uniform vec2 u_m;
uniform float u_mk;
// Where each pool is based, in footer units, worked out for the footer's
// shape so the pools spread through the room the words leave.
uniform vec2 u_pool[${POOLS}];
// How far each pool wanders round its base, as a share of the full reach.
uniform float u_poolReach[${POOLS}];

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 3; i++) {
    v += a * noise(p);
    p = p * 2.03 + 17.1;
    a *= 0.5;
  }
  return v;
}

float field(vec2 p) {
  // The turbulence that pulls the pools out of round.
  vec2 w = vec2(fbm(p * 1.4 + vec2(0.0, u_t * 0.07)), fbm(p * 1.4 + vec2(5.2, -u_t * 0.06)));
  p += (w - 0.5) * 0.75;
  float f = 0.0;
  // Each pool wanders round its base, further across a wide footer than a
  // narrow one, and never more than a share of the footer's height.
  float reach = min(0.16 * u_aspect, 0.22);
  for (int i = 0; i < ${POOLS}; i++) {
    float fi = float(i);
    vec2 c = u_pool[i];
    c += vec2(sin(u_t * (0.07 + 0.013 * fi) + fi * 1.7) * reach,
              cos(u_t * (0.05 + 0.011 * fi) + fi * 2.3) * 0.16) * u_poolReach[i];
    // The pointer is shied away from.
    vec2 away = c - u_m;
    c += normalize(away + 0.0001) * 0.18 * exp(-dot(away, away) / 0.05) * u_mk;
    float ang = fi * 1.3 + u_t * 0.03;
    vec2 q = p - c;
    q = vec2(cos(ang) * q.x - sin(ang) * q.y, sin(ang) * q.x + cos(ang) * q.y);
    q *= vec2(1.0, 1.8 + 0.7 * sin(fi * 1.9));
    float s = 0.14 + 0.05 * sin(fi * 3.1);
    f += exp(-dot(q, q) / (s * s));
  }
  return f;
}

float backdrop(vec2 p) {
  float e = 0.004;
  float f = field(p);
  // Lit as a surface: the field is read as height, and a light from the
  // top left catches its slopes.
  vec3 n = normalize(vec3((f - field(p + vec2(e, 0.0))) / e * 0.05,
                          (f - field(p + vec2(0.0, e))) / e * 0.05, 1.0));
  vec3 h = normalize(normalize(vec3(-0.45, -0.6, 0.66)) + vec3(0.0, 0.0, 1.0));
  float gloss = pow(max(dot(n, h), 0.0), 36.0) * smoothstep(0.3, 0.9, f);
  float glow = 1.0 - exp(-f * 0.8);
  float body = smoothstep(0.4, 1.3, f);
  return min(glow * 0.09 + body * 0.17 + gloss * 0.62, 1.0);
}

// The light is kept low behind the words (the boxes the page marks with
// data-calm), falling off softly around them, so the small print always
// stands on something close to black.
uniform vec4 u_calm[${CALM_BOXES}];
float calm(vec2 p) {
  float q = 0.0;
  for (int i = 0; i < ${CALM_BOXES}; i++) {
    vec4 b = u_calm[i];
    vec2 d = max(max(b.xy - p, p - b.zw), 0.0);
    q = max(q, 1.0 - smoothstep(0.0, 0.07, length(d)));
  }
  return 1.0 - ${CALM_DEPTH.toFixed(2)} * q;
}
`;

const BACKDROP_FRAGMENT = `
precision highp float;
varying vec2 v_uv;
${BACKDROP}
void main() {
  vec2 p = vec2(v_uv.x * u_aspect, v_uv.y);
  gl_FragColor = vec4(vec3(backdrop(p) * calm(p)), 1.0);
}`;

const LENS_FRAGMENT = `
precision highp float;
varying vec2 v_uv;
uniform sampler2D u_words;
uniform sampler2D u_mark;
uniform vec4 u_markBox;
uniform vec2 u_res;
uniform vec2 u_p;
uniform vec2 u_v;
uniform float u_r;
${BACKDROP}

vec4 mark(vec2 px) {
  vec2 uv = (px - u_markBox.xy) / u_markBox.zw;
  if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) return vec4(0.0);
  return texture2D(u_mark, uv);
}

void main() {
  vec2 x = v_uv * u_res;
  vec2 d = x - u_p;

  // Drawn out along the way it is moving, narrowed across it.
  float speed = length(u_v);
  vec2 dir = speed > 0.01 ? u_v / speed : vec2(1.0, 0.0);
  float s = 1.0 + min(speed * 0.02, 0.4);
  vec2 q = vec2(dot(d, dir) / s, dot(d, vec2(-dir.y, dir.x)) * sqrt(s));

  // A rim that never quite settles.
  float a = atan(q.y, q.x);
  float R = u_r * (1.0 + 0.035 * sin(3.0 * a + u_t * 1.3) + 0.022 * sin(5.0 * a - u_t * 1.7));
  float r = length(q) / max(R, 0.001);
  if (R < 0.5 || r >= 1.0) {
    gl_FragColor = vec4(0.0);
    return;
  }

  float h = sqrt(1.0 - r * r);

  // The backdrop and the mark: magnified at the centre, pulled in from
  // outside towards the rim, and turned on themselves, most at the centre
  // and not at all at the rim.
  vec2 dm = d * mix(1.0, 0.58, h) * (1.0 + pow(1.0 - h, 3.0) * 0.6);
  float tw = (1.0 - r) * (1.0 - r) * (2.4 + 0.5 * sin(u_t * 0.7));
  float c = cos(tw);
  float sn = sin(tw);
  dm = vec2(c * dm.x - sn * dm.y, sn * dm.x + c * dm.y);

  // The words: magnified and barely pulled, never turned, so they read.
  vec2 dw = d * mix(1.0, 0.8, h) * (1.0 + pow(1.0 - h, 3.0) * 0.18);

  // Calmed at both ends of the refraction: where the light comes from, and
  // under the magnified words it ends up behind.
  vec2 pm = (u_p + dm) / u_res.y;
  vec2 pw = (u_p + dw) / u_res.y;
  vec4 col = vec4(vec3(backdrop(pm) * min(calm(pm), calm(pw))), 1.0);
  vec4 m = mark(u_p + dm);
  col = m + col * (1.0 - m.a);
  vec4 w = texture2D(u_words, (u_p + dw) / u_res);
  col = w + col * (1.0 - w.a);

  // A thin light where the dome meets the surface.
  float rim = smoothstep(0.84, 0.985, r) * (1.0 - smoothstep(0.985, 1.0, r));
  col.rgb = min(col.rgb + rim * 0.16, vec3(1.0));

  // The seam, softened over a pixel and a half so it does not stair-step.
  gl_FragColor = col * (1.0 - smoothstep(1.0 - 1.5 / max(R, 1.0), 1.0, r));
}`;

type Stage = {
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  u: (name: string) => WebGLUniformLocation | null;
  dispose: () => void;
};

/** One canvas, one full-screen quad, one program. */
function stage(view: HTMLCanvasElement, fragment: string): Stage | null {
  const gl = view.getContext("webgl", { premultipliedAlpha: true, antialias: false });
  if (!gl) return null;
  const compile = (type: number, source: string) => {
    const s = gl.createShader(type);
    if (!s) return null;
    gl.shaderSource(s, source);
    gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  };
  const vs = compile(gl.VERTEX_SHADER, VERTEX);
  const fs = compile(gl.FRAGMENT_SHADER, fragment);
  const program = gl.createProgram();
  if (!vs || !fs || !program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);

  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(program, "a_pos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const cache = new Map<string, WebGLUniformLocation | null>();
  return {
    gl,
    program,
    u: (name) => {
      if (!cache.has(name)) cache.set(name, gl.getUniformLocation(program, name));
      return cache.get(name) ?? null;
    },
    dispose: () => {
      gl.deleteBuffer(quad);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    },
  };
}

function texture(gl: WebGLRenderingContext) {
  const t = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return t;
}

const smooth = (e0: number, e1: number, v: number) => {
  const t = Math.min(Math.max((v - e0) / (e1 - e0), 0), 1);
  return t * t * (3 - 2 * t);
};

/** Draws every word and rule in `surface` (outside `skip`) onto `pen`, in
    the surface's own coordinates, as the page lays them out, and in the
    state they are in right now: a link mid-hover is drawn in the colour
    it has reached, with as much of its underline as has grown, and a
    focused one with its ring. */
function drawWords(pen: CanvasRenderingContext2D, surface: HTMLElement, skip: Element | null) {
  const origin = surface.getBoundingClientRect();
  const range = document.createRange();
  const walker = document.createTreeWalker(surface, NodeFilter.SHOW_TEXT);

  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.textContent ?? "";
    const el = node.parentElement;
    if (!el || !text.trim() || (skip && skip.contains(el))) continue;
    // Words that are there only for a screen reader.
    if (el.closest(".sr-only")) continue;
    const style = getComputedStyle(el);
    if (style.visibility === "hidden" || style.display === "none") continue;

    pen.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    pen.fillStyle = style.color;
    pen.letterSpacing = style.letterSpacing === "normal" ? "0px" : style.letterSpacing;
    pen.textBaseline = "alphabetic";

    for (const word of text.matchAll(/\S+/g)) {
      range.setStart(node, word.index);
      range.setEnd(node, word.index + word[0].length);
      const box = range.getBoundingClientRect();
      if (!box.width) continue;
      const m = pen.measureText(word[0]);
      const asc = m.fontBoundingBoxAscent;
      const desc = m.fontBoundingBoxDescent;
      pen.fillText(
        word[0],
        box.left - origin.left,
        box.top - origin.top + (box.height - asc - desc) / 2 + asc,
      );
    }
  }

  for (const el of surface.querySelectorAll<HTMLElement>("*")) {
    if (skip && skip.contains(el)) continue;
    const style = getComputedStyle(el);
    const box = el.getBoundingClientRect();
    const x = box.left - origin.left;
    const y = box.top - origin.top;

    // Hairline rules drawn with a top border (the one above the copyright).
    const rule = parseFloat(style.borderTopWidth);
    if (rule && style.borderTopStyle !== "none") {
      pen.fillStyle = style.borderTopColor;
      pen.fillRect(x, y, box.width, rule);
    }

    // A link's underline, drawn from its origin as far as it has grown.
    const line = getComputedStyle(el, "::after");
    if (line.content !== "none" && line.content !== "normal" && line.position === "absolute") {
      const grown = line.transform === "none" ? 1 : new DOMMatrixReadOnly(line.transform).a;
      const height = parseFloat(line.height);
      if (grown > 0.001 && height) {
        const from = parseFloat(line.transformOrigin);
        pen.fillStyle = line.backgroundColor;
        pen.fillRect(
          x + from * (1 - grown),
          y + box.height - parseFloat(line.bottom) - height,
          box.width * grown,
          height,
        );
      }
    }

    // The keyboard's focus ring.
    if (style.outlineStyle !== "none" && el.matches(":focus-visible")) {
      const width = parseFloat(style.outlineWidth);
      const out = parseFloat(style.outlineOffset) + width / 2;
      pen.strokeStyle = style.outlineColor;
      pen.lineWidth = width;
      pen.strokeRect(x - out, y - out, box.width + out * 2, box.height + out * 2);
    }
  }
}

/** Sets a canvas's size only if it has changed. Setting it at all clears
    the canvas, and a cleared one shown for a single frame is a flicker. */
function fit(view: HTMLCanvasElement, width: number, height: number) {
  if (view.width === width && view.height === height) return false;
  view.width = width;
  view.height = height;
  return true;
}

export function LiquidLens({
  host,
  mark,
  src,
  still = false,
}: {
  host: RefObject<HTMLElement | null>;
  /** The wordmark's element, whose box the mark's copy is placed on. */
  mark: RefObject<HTMLElement | null>;
  src: string;
  /** The visitor has asked for the light to hold still. The drop still
      follows the hand, which is motion they are making themselves. */
  still?: boolean;
}) {
  const reduce = useReducedMotion() ?? false;
  const back = useRef<HTMLCanvasElement>(null);
  const front = useRef<HTMLCanvasElement>(null);
  const held = useRef(still);
  const nudge = useRef<() => void>(() => {});

  useEffect(() => {
    held.current = still;
    nudge.current();
  }, [still]);

  useEffect(() => {
    const surface = host.current;
    const sign = mark.current;
    const backView = back.current;
    const frontView = front.current;
    if (!surface || !sign || !backView || !frontView) return;

    const bg = stage(backView, BACKDROP_FRAGMENT);
    if (!bg) return;
    const pointer =
      !reduce && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const lens = pointer ? stage(frontView, LENS_FRAGMENT) : null;

    let disposed = false;
    let dpr = 1;
    // The backdrop's own clock. It runs only while the backdrop is moving,
    // so holding it still and letting it go again carries on from the same
    // moment rather than jumping ahead.
    let seconds = reduce ? STILL_T : 0;

    // The drop, in CSS pixels of the footer.
    const pos = { x: 0, y: 0 };
    const vel = { x: 0, y: 0 };
    const aim = { x: 0, y: 0 };
    let hovering = false;
    let k = 0;
    let shy = 0;

    // The boxes of words the light is kept away from, in footer units.
    const calm = new Float32Array(CALM_BOXES * 4).fill(-10);
    const measureCalm = () => {
      const origin = surface.getBoundingClientRect();
      const h = Math.max(surface.offsetHeight, 1);
      const range = document.createRange();
      calm.fill(-10);
      surface.querySelectorAll("[data-calm]").forEach((el, i) => {
        if (i >= CALM_BOXES) return;
        // The words themselves, not the blocks they are set in: a block is
        // as wide as the footer on a phone, and would darken all of it.
        let x0 = Infinity;
        let y0 = Infinity;
        let x1 = -Infinity;
        let y1 = -Infinity;
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
          if (!node.textContent?.trim() || node.parentElement?.closest(".sr-only")) continue;
          range.selectNodeContents(node);
          const b = range.getBoundingClientRect();
          if (!b.width || !b.height) continue;
          x0 = Math.min(x0, b.left);
          y0 = Math.min(y0, b.top);
          x1 = Math.max(x1, b.right);
          y1 = Math.max(y1, b.bottom);
        }
        if (!Number.isFinite(x0)) return;
        calm.set(
          [
            (x0 - origin.left - CALM_PAD) / h,
            (y0 - origin.top - CALM_PAD) / h,
            (x1 - origin.left + CALM_PAD) / h,
            (y1 - origin.top + CALM_PAD) / h,
          ],
          i * 4,
        );
      });
      const mark = sign.getBoundingClientRect();
      layoutPools(surface.offsetWidth / h, (mark.top - origin.top) / h);
    };

    /* Where the pools are based. Each is set down in turn at whichever of
       many spots is furthest from the pools already down, from the words
       and from the edges, so they spread through the whole of the room the
       words leave rather than gathering wherever the words are not, which
       on a phone was only round the mark. */
    const pools = new Float32Array(POOLS * 2);
    const poolReach = new Float32Array(POOLS).fill(1);
    const layoutPools = (aspect: number, markTop: number) => {
      let seed = 5;
      const pick = () => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
      };
      const words = (x: number, y: number) => {
        let d = Infinity;
        for (let b = 0; b < CALM_BOXES; b++) {
          const x0 = calm[b * 4];
          if (x0 < -5) continue;
          const dx = Math.max(x0 - x, 0, x - calm[b * 4 + 2]);
          const dy = Math.max(calm[b * 4 + 1] - y, 0, y - calm[b * 4 + 3]);
          d = Math.min(d, Math.hypot(dx, dy));
        }
        return d;
      };
      const placed: [number, number][] = [];
      poolReach.fill(1);

      /* On a wide footer, three of the pools are held to the open ground
         round the words, where the light otherwise never reached: the
         margin left of the address, the gap between the address and the
         mark, below the words, and the margin right of the services. Each
         is found from the columns and the mark, so it follows them at any
         width, and wanders only a little way, so it stays where it is. */
      const col = (b: number) => (calm[b * 4] < -5 ? null : calm.subarray(b * 4, b * 4 + 4));
      const address = col(0);
      const menu = col(1);
      const services = col(2);
      if (aspect > 1.3 && address && menu && services && menu[1] < markTop) {
        const high = markTop * 0.55;
        const held: [number, number][] = [
          [Math.max(address[0] * 0.5, aspect * 0.05), high],
          [(address[2] + menu[0]) / 2, markTop * 0.95],
          [Math.min((services[2] + aspect) / 2, aspect * 0.95), high],
        ];
        for (const spot of held) {
          poolReach[placed.length] = HELD_REACH;
          pools.set(spot, placed.length * 2);
          placed.push(spot);
        }
      }

      for (let i = placed.length; i < POOLS; i++) {
        let best: [number, number] = [aspect * (0.1 + 0.2 * i), 0.5];
        let bestScore = -Infinity;
        for (let tries = 0; tries < 80; tries++) {
          const x = aspect * (0.04 + pick() * 0.92);
          const y = 0.06 + pick() * 0.88;
          let score = Math.min(x, aspect - x, y, 1 - y) * 2.5 + words(x, y) * 1.5;
          for (const [px, py] of placed) score = Math.min(score, Math.hypot(x - px, y - py));
          if (score > bestScore) {
            bestScore = score;
            best = [x, y];
          }
        }
        placed.push(best);
        pools.set(best, i * 2);
      }
    };

    /* ---- backdrop ---- */

    const drawBackdrop = () => {
      const { gl, u } = bg;
      gl.viewport(0, 0, backView.width, backView.height);
      gl.uniform1f(u("u_t"), seconds);
      gl.uniform1f(u("u_aspect"), backView.width / Math.max(backView.height, 1));
      gl.uniform2f(u("u_m"), pos.x / Math.max(surface.offsetHeight, 1), pos.y / Math.max(surface.offsetHeight, 1));
      gl.uniform1f(u("u_mk"), shy);
      gl.uniform4fv(u("u_calm"), calm);
      gl.uniform2fv(u("u_pool"), pools);
      gl.uniform1fv(u("u_poolReach"), poolReach);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const sizeBackdrop = () => {
      fit(
        backView,
        Math.max(1, Math.round(surface.offsetWidth * BACKDROP_SCALE)),
        Math.max(1, Math.round(surface.offsetHeight * BACKDROP_SCALE)),
      );
    };

    /* ---- lens ---- */

    let wordsTex: WebGLTexture | null = null;
    let markTex: WebGLTexture | null = null;
    const words = document.createElement("canvas");
    const wordsPen = words.getContext("2d");
    const sheet = document.createElement("canvas");
    const sheetPen = sheet.getContext("2d");
    // A patch of the words, cut out to be sent on its own.
    const patch = document.createElement("canvas");
    const patchPen = patch.getContext("2d");
    const source = new Image();
    let loaded = false;
    let wordsReady = false;

    if (lens) {
      const { gl, u } = lens;
      gl.uniform1i(u("u_words"), 0);
      gl.uniform1i(u("u_mark"), 1);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      gl.activeTexture(gl.TEXTURE0);
      wordsTex = texture(gl);
      gl.activeTexture(gl.TEXTURE1);
      markTex = texture(gl);
    }

    const clearLens = () => {
      if (!lens) return;
      const { gl } = lens;
      gl.viewport(0, 0, frontView.width, frontView.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    };

    const paintWords = () => {
      if (!lens || !wordsPen) return;
      const { gl } = lens;
      const w = surface.offsetWidth;
      const h = surface.offsetHeight;
      if (!w || !h) return;
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      fit(frontView, Math.round(w * dpr), Math.round(h * dpr));
      fit(words, frontView.width, frontView.height);
      wordsPen.setTransform(dpr, 0, 0, dpr, 0, 0);
      wordsPen.clearRect(0, 0, w, h);
      drawWords(wordsPen, surface, sign);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, wordsTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, words);
      wordsReady = true;
    };

    /** Redraws only the words around one element, and sends only that
        patch: cheap enough to do every frame while a link changes. */
    const repaintAround = (el: Element) => {
      if (!lens || !wordsPen || !patchPen || !wordsReady || !surface.contains(el)) return;
      const { gl } = lens;
      const origin = surface.getBoundingClientRect();
      const b = el.getBoundingClientRect();
      const x0 = Math.max(0, Math.floor((b.left - origin.left - REPAINT_PAD) * dpr));
      const y0 = Math.max(0, Math.floor((b.top - origin.top - REPAINT_PAD) * dpr));
      const x1 = Math.min(words.width, Math.ceil((b.right - origin.left + REPAINT_PAD) * dpr));
      const y1 = Math.min(words.height, Math.ceil((b.bottom - origin.top + REPAINT_PAD) * dpr));
      const pw = x1 - x0;
      const ph = y1 - y0;
      if (pw <= 0 || ph <= 0) return;

      wordsPen.save();
      wordsPen.setTransform(1, 0, 0, 1, 0, 0);
      wordsPen.beginPath();
      wordsPen.rect(x0, y0, pw, ph);
      wordsPen.clip();
      wordsPen.clearRect(x0, y0, pw, ph);
      wordsPen.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawWords(wordsPen, surface, sign);
      wordsPen.restore();

      fit(patch, pw, ph);
      patchPen.clearRect(0, 0, pw, ph);
      patchPen.drawImage(words, x0, y0, pw, ph, 0, 0, pw, ph);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, wordsTex);
      gl.texSubImage2D(gl.TEXTURE_2D, 0, x0, y0, gl.RGBA, gl.UNSIGNED_BYTE, patch);
    };

    const paintMark = () => {
      if (!lens || !sheetPen || !loaded) return;
      const { gl } = lens;
      const w = sign.offsetWidth;
      const h = sign.offsetHeight;
      if (!w || !h) return;
      fit(sheet, Math.round(w * dpr), Math.round(h * dpr));
      sheetPen.clearRect(0, 0, sheet.width, sheet.height);
      sheetPen.drawImage(source, 0, 0, sheet.width, sheet.height);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, markTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sheet);
    };

    const drawLens = (box: DOMRect, radius: number) => {
      if (!lens) return;
      const { gl, u } = lens;
      const markBox = sign.getBoundingClientRect();
      clearLens();
      gl.uniform2f(u("u_res"), frontView.width, frontView.height);
      gl.uniform2f(u("u_p"), pos.x * dpr, pos.y * dpr);
      gl.uniform2f(u("u_v"), vel.x, vel.y);
      gl.uniform1f(u("u_r"), radius * dpr);
      gl.uniform1f(u("u_t"), seconds);
      gl.uniform1f(u("u_aspect"), frontView.width / Math.max(frontView.height, 1));
      gl.uniform2f(u("u_m"), pos.x / Math.max(box.height, 1), pos.y / Math.max(box.height, 1));
      gl.uniform1f(u("u_mk"), shy);
      gl.uniform4fv(u("u_calm"), calm);
      gl.uniform2fv(u("u_pool"), pools);
      gl.uniform1fv(u("u_poolReach"), poolReach);
      gl.uniform4f(
        u("u_markBox"),
        (markBox.left - box.left) * dpr,
        (markBox.top - box.top) * dpr,
        markBox.width * dpr,
        markBox.height * dpr,
      );
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    /* ---- what changes while a link is being pointed at ---- */

    // Elements with a transition running, and how many; and elements that
    // have changed once and need drawing once more.
    const moving = new Map<Element, number>();
    const changed = new Set<Element>();

    /* ---- the one clock ---- */

    let frame = 0;
    let last = 0;
    let visible = false;
    let lensShown = false;

    /** Draws both layers as things stand, without moving anything on. */
    const render = () => {
      const box = frontView.getBoundingClientRect();
      const full = Math.min(Math.max(sign.offsetHeight * RADIUS, MIN_RADIUS), MAX_RADIUS);
      const edge = smooth(0, full * EDGE, Math.min(pos.x, pos.y, box.width - pos.x, box.height - pos.y));
      shy = k * edge;

      drawBackdrop();

      if (lens && loaded && k > 0.002) {
        drawLens(box, full * k * edge);
        lensShown = true;
      } else if (lensShown) {
        k = 0;
        clearLens();
        lensShown = false;
      }
    };

    const tick = (t: number) => {
      const dt = last ? Math.min((t - last) / (1000 / 60), 3) : 1;
      if (!held.current && last) seconds += (t - last) / 1000;
      last = t;

      if (lens) {
        // The pointer is kept in window coordinates and placed on the
        // footer every frame, so the drop stays under it while the page
        // scrolls.
        const box = frontView.getBoundingClientRect();
        const f = 1 - Math.pow(1 - FOLLOW, dt);
        const nx = pos.x + (aim.x - box.left - pos.x) * f;
        const ny = pos.y + (aim.y - box.top - pos.y) * f;
        // Smoothed, so a jerk of the hand stretches the drop without snapping it.
        const g = 1 - Math.pow(1 - 0.2, dt);
        vel.x += ((nx - pos.x) / dt - vel.x) * g;
        vel.y += ((ny - pos.y) / dt - vel.y) * g;
        pos.x = nx;
        pos.y = ny;
        k += ((hovering ? 1 : 0) - k) * (1 - Math.pow(1 - 0.09, dt));

        for (const el of moving.keys()) changed.add(el);
        for (const el of changed) repaintAround(el);
        changed.clear();
      }

      render();

      // Held still and left alone, there is nothing to draw until
      // something changes.
      const busy = !held.current || hovering || k > 0.002 || moving.size > 0;
      frame = visible && busy ? requestAnimationFrame(tick) : 0;
      if (!frame) last = 0;
    };

    const wake = () => {
      if (reduce || frame || !visible || disposed) return;
      frame = requestAnimationFrame(tick);
    };
    nudge.current = wake;

    let queued = 0;
    const repaint = () => {
      if (queued) return;
      queued = requestAnimationFrame(() => {
        queued = 0;
        if (disposed) return;
        sizeBackdrop();
        measureCalm();
        paintWords();
        paintMark();
        // Drawn at once, in the same frame as any resize, so a cleared
        // canvas is never what gets shown.
        render();
      });
    };

    if (lens) {
      source.onload = () => {
        if (disposed) return;
        loaded = true;
        repaint();
      };
      source.src = src;
    }
    // The words are drawn, and measured, in the page's fonts, so they wait for them.
    document.fonts.ready.then(() => !disposed && repaint());
    repaint();

    const resize = new ResizeObserver(repaint);
    resize.observe(surface);
    resize.observe(sign);

    // A label that changes (the copy button, the motion button) moves the
    // words beside it too.
    const edits = new MutationObserver(repaint);
    edits.observe(surface, { subtree: true, childList: true, characterData: true });

    const seen = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      wake();
    });
    seen.observe(surface);

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      aim.x = event.clientX;
      aim.y = event.clientY;
      if (!hovering) {
        hovering = true;
        // The drop forms where the pointer is, rather than swimming in
        // from wherever it was last left.
        if (k < 0.05) {
          const box = frontView.getBoundingClientRect();
          pos.x = aim.x - box.left;
          pos.y = aim.y - box.top;
          vel.x = 0;
          vel.y = 0;
        }
      }
      wake();
    };
    const onLeave = () => {
      hovering = false;
      wake();
    };
    const onRun = (event: TransitionEvent) => {
      const el = event.target as Element;
      moving.set(el, (moving.get(el) ?? 0) + 1);
      wake();
    };
    const onEnd = (event: TransitionEvent) => {
      const el = event.target as Element;
      const left = (moving.get(el) ?? 1) - 1;
      if (left > 0) moving.set(el, left);
      else moving.delete(el);
      // Drawn once more, in the state it came to rest in.
      changed.add(el);
      wake();
    };
    // A focus ring comes and goes without a transition.
    const onFocus = (event: FocusEvent) => {
      changed.add(event.target as Element);
      wake();
    };
    const onLost = (event: Event) => {
      event.preventDefault();
      loaded = false;
    };

    if (lens) {
      surface.addEventListener("pointermove", onMove);
      surface.addEventListener("pointerleave", onLeave);
      surface.addEventListener("transitionrun", onRun);
      surface.addEventListener("transitionend", onEnd);
      surface.addEventListener("transitioncancel", onEnd);
      surface.addEventListener("focusin", onFocus);
      surface.addEventListener("focusout", onFocus);
      frontView.addEventListener("webglcontextlost", onLost);
    }

    return () => {
      disposed = true;
      nudge.current = () => {};
      cancelAnimationFrame(frame);
      cancelAnimationFrame(queued);
      resize.disconnect();
      edits.disconnect();
      seen.disconnect();
      surface.removeEventListener("pointermove", onMove);
      surface.removeEventListener("pointerleave", onLeave);
      surface.removeEventListener("transitionrun", onRun);
      surface.removeEventListener("transitionend", onEnd);
      surface.removeEventListener("transitioncancel", onEnd);
      surface.removeEventListener("focusin", onFocus);
      surface.removeEventListener("focusout", onFocus);
      frontView.removeEventListener("webglcontextlost", onLost);
      if (lens) {
        lens.gl.deleteTexture(wordsTex);
        lens.gl.deleteTexture(markTex);
        lens.dispose();
      }
      bg.dispose();
    };
  }, [host, mark, src, reduce]);

  return (
    <>
      <canvas
        ref={back}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 h-full w-full"
      />
      <canvas
        ref={front}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 h-full w-full"
      />
    </>
  );
}
