/* ==================================================================
   The footer's light, held still, for the emails

   Mail apps run no WebGL, so the light that drifts behind the site's
   footer (BACKDROP in src/components/liquid-lens.tsx) is drawn here
   once, pixel by pixel, with the same field, the same lighting and the
   same "calm" that keeps it low behind the words. Two wide pictures in
   public/email/ sit on the email's whole black background, not inside
   its column (user, 2026-10-30): one behind the top (the wordmark, the
   label and the greeting), one behind the foot. The foot's wordmark is
   a picture of its own, with a glow, laid in that light.

   Run after changing the light: node scripts/email-light.mjs
   (with --mark, only the foot's wordmark is drawn again)
   ================================================================== */

import sharp from "sharp";

const fract = (x) => x - Math.floor(x);
const mix = (a, b, t) => a + (b - a) * t;
const smoothstep = (a, b, x) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};
const hash = (x, y) => fract(Math.sin(x * 127.1 + y * 311.7) * 43758.5453);
function noise(x, y) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  return mix(mix(hash(ix, iy), hash(ix + 1, iy), ux), mix(hash(ix, iy + 1), hash(ix + 1, iy + 1), ux), uy);
}
function fbm(x, y) {
  let v = 0;
  let a = 0.5;
  for (let i = 0; i < 3; i++) {
    v += a * noise(x, y);
    x = x * 2.03 + 17.1;
    y = y * 2.03 + 17.1;
    a *= 0.5;
  }
  return v;
}

function field(px, py, t, aspect, pools) {
  const wx = fbm(px * 1.4, py * 1.4 + t * 0.07);
  const wy = fbm(px * 1.4 + 5.2, py * 1.4 - t * 0.06);
  px += (wx - 0.5) * 0.75;
  py += (wy - 0.5) * 0.75;
  const reach = Math.min(0.16 * aspect, 0.22);
  let f = 0;
  pools.forEach(([bx, by, r], i) => {
    const cx = bx + Math.sin(t * (0.07 + 0.013 * i) + i * 1.7) * reach * r;
    const cy = by + Math.cos(t * (0.05 + 0.011 * i) + i * 2.3) * 0.16 * r;
    const ang = i * 1.3 + t * 0.03;
    let qx = px - cx;
    let qy = py - cy;
    [qx, qy] = [Math.cos(ang) * qx - Math.sin(ang) * qy, Math.sin(ang) * qx + Math.cos(ang) * qy];
    qy *= 1.8 + 0.7 * Math.sin(i * 1.9);
    const s = 0.14 + 0.05 * Math.sin(i * 3.1);
    f += Math.exp(-(qx * qx + qy * qy) / (s * s));
  });
  return f;
}

const H = (() => {
  const l = [-0.45, -0.6, 0.66];
  const n = Math.hypot(...l);
  const v = [l[0] / n, l[1] / n, l[2] / n + 1];
  const m = Math.hypot(...v);
  return v.map((c) => c / m);
})();

function backdrop(px, py, t, aspect, pools) {
  const e = 0.004;
  const f = field(px, py, t, aspect, pools);
  let nx = ((f - field(px + e, py, t, aspect, pools)) / e) * 0.05;
  let ny = ((f - field(px, py + e, t, aspect, pools)) / e) * 0.05;
  let nz = 1;
  const len = Math.hypot(nx, ny, nz);
  nx /= len;
  ny /= len;
  nz /= len;
  const gloss = Math.pow(Math.max(nx * H[0] + ny * H[1] + nz * H[2], 0), 36) * smoothstep(0.3, 0.9, f);
  const glow = 1 - Math.exp(-f * 0.8);
  const body = smoothstep(0.4, 1.3, f);
  return Math.min(glow * 0.09 + body * 0.17 + gloss * 0.62, 1);
}

/** Low behind the words: boxes in the image's own units (0 to aspect, 0 to 1, y up). */
function calm(px, py, boxes, depth, soft = 0.07) {
  let q = 0;
  for (const [x0, y0, x1, y1] of boxes) {
    const dx = Math.max(x0 - px, px - x1, 0);
    const dy = Math.max(y0 - py, py - y1, 0);
    q = Math.max(q, 1 - smoothstep(0, soft, Math.hypot(dx, dy)));
  }
  return 1 - depth * q;
}

/* An image is a window onto the field, `zoom` of its height tall, so a
   pool keeps the size it has on the site whatever the image's shape
   (about 580 email pixels to one unit). Pools and boxes are given as
   shares of the image: 0 to 1 across, 0 to 1 up. */
async function render(file, { width, height, t, zoom, pools: share, boxes: shareBoxes = [], soft = 0.07, depth = 0.85, fade }) {
  // Drawn at twice the size and averaged down, so the thin streaks of
  // gloss come out smooth rather than as a pixel staircase.
  const SS = 2;
  const W = width * SS;
  const Hh = height * SS;
  const aspect = (width / height) * zoom;
  const pools = share.map(([u, v, r]) => [u * aspect, v * zoom, r]);
  const boxes = shareBoxes.map(([u0, v0, u1, v1]) => [u0 * aspect, v0 * zoom, u1 * aspect, v1 * zoom]);
  const big = new Float32Array(W * Hh);
  for (let row = 0; row < Hh; row++) {
    const py = (1 - (row + 0.5) / Hh) * zoom;
    for (let col = 0; col < W; col++) {
      const px = ((col + 0.5) / W) * aspect;
      big[row * W + col] = backdrop(px, py, t, aspect, pools) * calm(px, py, boxes, depth, soft);
    }
  }

  // A grain finer than a pixel can show, so the long dark gradients do
  // not break into bands of grey.
  let seed = 7;
  const grain = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647 - 0.5;
  };
  const out = Buffer.alloc(width * height);
  for (let y = 0; y < height; y++) {
    const v = 1 - (y + 0.5) / height;
    // Into black on every side, so the picture has no edge anywhere on
    // the email's black.
    const edgeY = smoothstep(0, fade.bottom, v) * smoothstep(0, fade.top, 1 - v);
    for (let x = 0; x < width; x++) {
      const u = (x + 0.5) / width;
      const edge = edgeY * smoothstep(0, fade.sides, u) * smoothstep(0, fade.sides, 1 - u);
      let sum = 0;
      for (let dy = 0; dy < SS; dy++) for (let dx = 0; dx < SS; dx++) sum += big[(y * SS + dy) * W + x * SS + dx];
      const c = (sum / (SS * SS)) * edge;
      out[y * width + x] = Math.max(0, Math.min(255, Math.round(c * 255 + grain() * 1.6)));
    }
  }
  await sharp(out, { raw: { width, height, channels: 1 } })
    .toColourspace("b-w")
    .jpeg({ quality: 92, mozjpeg: true })
    .toFile(file);
  console.log(file, width, height);
}

/* The wordmark for the foot, on nothing, with a soft glow of its own
   spreading out from it, so it sits in the light behind it rather than
   looking cut out and laid on it. */
async function glowingMark(file, { svg, width, pad, glow, strength }) {
  const glyphs = await sharp(svg, { density: 600 }).resize({ width }).png().toBuffer();
  const meta = await sharp(glyphs).metadata();
  const w = width + pad * 2;
  const h = meta.height + pad * 2;
  const alpha = await sharp({ create: { width: w, height: h, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: glyphs, left: pad, top: pad }])
    .extractChannel("alpha")
    .raw()
    .toBuffer();
  const halo = await sharp(alpha, { raw: { width: w, height: h, channels: 1 } }).blur(glow).raw().toBuffer();
  // Clear at its very edge, so the picture never shows as a box.
  const clear = (n, size) => smoothstep(0, pad * 0.75, Math.min(n, size - 1 - n));
  const rgba = Buffer.alloc(w * h * 4, 255);
  for (let i = 0; i < w * h; i++) {
    const glowing = Math.round(halo[i] * strength * clear(i % w, w) * clear(Math.floor(i / w), h));
    rgba[i * 4 + 3] = Math.max(alpha[i], glowing);
  }
  await sharp(rgba, { raw: { width: w, height: h, channels: 4 } }).png({ compressionLevel: 9 }).toFile(file);
  console.log(file, w, h);
}

/* The email's column is 600px wide in the middle of a black page; the
   pictures are 1600px wide, centred behind it (drawn at twice that), so
   the light reaches out over the black on both sides and fades before
   any edge. In shares of 1600: the column runs 0.3125 to 0.6875, its
   text 0.3325 to 0.6675. */

// Behind the top, 1600 x 520: the wordmark and the label along the top
// of the column, the greeting below them, then the letter, where the
// light is held low.
if (!process.argv.includes("--mark")) await render("public/email/light-head.jpg", {
  width: 3200,
  height: 1040,
  t: 38,
  zoom: 0.62,
  soft: 0.14,
  depth: 0.82,
  fade: { top: 0.08, bottom: 0.4, sides: 0.14 },
  pools: [
    [0.080, 0.55, 1],
    [0.145, 0.78, 0.8],
    [0.210, 0.42, 0.9],
    [0.275, 0.88, 0.7],
    [0.340, 0.66, 1],
    [0.405, 0.5, 0.8],
    [0.470, 0.55, 0.9],
    [0.535, 0.78, 0.7],
    [0.600, 0.42, 1],
    [0.665, 0.88, 0.8],
    [0.730, 0.66, 0.9],
    [0.795, 0.5, 0.7],
    [0.860, 0.55, 1],
    [0.925, 0.78, 0.8],
  ],
  boxes: [
    [0.325, 0.85, 0.41, 0.97],
    [0.615, 0.85, 0.675, 0.97],
    [0.325, 0.5, 0.56, 0.68],
    [0.31, 0, 0.69, 0.46],
  ],
});

// Behind the foot, 1600 x 360: the wordmark across the column, the
// small print along its bottom.
if (!process.argv.includes("--mark")) await render("public/email/light-foot.jpg", {
  width: 3200,
  height: 720,
  t: 71,
  zoom: 0.45,
  soft: 0.1,
  fade: { top: 0.3, bottom: 0.12, sides: 0.14 },
  pools: [
    [0.080, 0.5, 1],
    [0.145, 0.7, 0.8],
    [0.210, 0.38, 0.9],
    [0.275, 0.62, 0.7],
    [0.340, 0.8, 1],
    [0.405, 0.45, 0.8],
    [0.470, 0.5, 0.9],
    [0.535, 0.7, 0.7],
    [0.600, 0.38, 1],
    [0.665, 0.62, 0.8],
    [0.730, 0.8, 0.9],
    [0.795, 0.45, 0.7],
    [0.860, 0.5, 1],
    [0.925, 0.7, 0.8],
  ],
  boxes: [[0.32, 0, 0.68, 0.24]],
});

await glowingMark("public/email/wordmark-glow.png", {
  svg: "public/nevima-wordmark-white.svg",
  width: 1072,
  pad: 64,
  glow: 13,
  strength: 0.34,
});
