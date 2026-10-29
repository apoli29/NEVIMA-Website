/* ==================================================================
   The footer's light, held still, for the emails

   Mail apps run no WebGL, so the light that drifts behind the site's
   footer (BACKDROP in src/components/liquid-lens.tsx) is drawn here
   once, pixel by pixel, with the same field, the same lighting and the
   same "calm" that keeps it low behind the words, and saved as two
   images in public/email/: one behind the top of every email (the
   wordmark, the label and the greeting), one behind its foot (the
   wordmark across it).

   Run after changing the light: node scripts/email-light.mjs
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
function calm(px, py, boxes, depth) {
  let q = 0;
  for (const [x0, y0, x1, y1] of boxes) {
    const dx = Math.max(x0 - px, px - x1, 0);
    const dy = Math.max(y0 - py, py - y1, 0);
    q = Math.max(q, 1 - smoothstep(0, 0.07, Math.hypot(dx, dy)));
  }
  return 1 - depth * q;
}

/* The image is a window onto a footer-sized field, `zoom` of its height
   tall: the site's pools are sized for a footer a screen tall, and the
   email's bands are much lower. Pools and boxes are given as shares of
   the image (0 to 1 across, 0 to 1 up) and placed in that window. */
async function render(file, { width, height, t, zoom, pools: share, boxes: shareBoxes, fade }) {
  const aspect = (width / height) * zoom;
  const pools = share.map(([u, v, r]) => [u * aspect, v * zoom, r]);
  const boxes = shareBoxes.map(([u0, v0, u1, v1]) => [u0 * aspect, v0 * zoom, u1 * aspect, v1 * zoom]);
  const out = Buffer.alloc(width * height * 3);
  for (let row = 0; row < height; row++) {
    const v = 1 - (row + 0.5) / height;
    const py = v * zoom;
    // Into black at the edge the email's black body meets.
    const edge = fade === "bottom" ? smoothstep(0, 0.3, v) : fade === "top" ? smoothstep(0, 0.3, 1 - v) : 1;
    for (let col = 0; col < width; col++) {
      const px = ((col + 0.5) / width) * aspect;
      const light = backdrop(px, py, t, aspect, pools) * calm(px, py, boxes, 0.85) * edge;
      const c = Math.round(Math.min(light, 1) * 255);
      const at = (row * width + col) * 3;
      out[at] = out[at + 1] = out[at + 2] = c;
    }
  }
  await sharp(out, { raw: { width, height, channels: 3 } }).jpeg({ quality: 82, mozjpeg: true }).toFile(file);
  console.log(file, width, height);
}

// Twice the email's 600px column. The top: 600 x 280, the wordmark and
// the label along its top, the greeting low on the left; the light
// gathers on the right, as it drifts round the footer's words.
await render("public/email/light-top.jpg", {
  width: 1200,
  height: 560,
  t: 38,
  zoom: 0.55,
  fade: "bottom",
  pools: [
    [0.78, 0.6, 1],
    [0.95, 0.35, 0.8],
    [0.62, 0.9, 0.7],
    [0.88, 0.85, 0.6],
    [0.4, 0.55, 0.5],
    [0.7, 0.25, 0.6],
  ],
  boxes: [
    [0.04, 0.8, 0.26, 0.96],
    [0.8, 0.82, 0.97, 0.95],
    [0.04, 0.06, 0.55, 0.32],
  ],
});

// The foot: 600 x 340, the wordmark across its middle, the small print
// along its bottom.
await render("public/email/light-foot.jpg", {
  width: 1200,
  height: 680,
  t: 71,
  zoom: 0.6,
  fade: "top",
  pools: [
    [0.2, 0.6, 1],
    [0.5, 0.75, 0.8],
    [0.82, 0.5, 0.9],
    [0.4, 0.35, 0.6],
    [0.95, 0.85, 0.6],
  ],
  boxes: [[0.04, 0.02, 0.96, 0.2]],
});
