"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { BOOMERANG_PATH } from "./boomerang";

/* ==================================================================
   Pixel field

   The ground of the second screen. It is white, and the boomerang
   stands on its right, tipped as if caught mid-throw and set so large
   that only its elbow and the start of its arms are on the screen, laid
   out on a grid of cells.

   Nothing on it is square. Every piece, in the mark and out of it, is a
   long, thin, curved shape of its own: drawn out, bent, tapered or
   rippled, so no two are alike. In the mark they sit one to a cell,
   inside its exact outline, which is solid black and never broken: a
   piece that leaves shows only as a hole of its own shape, well inside
   the edge, that closes up behind it within a second, and pieces that
   arrive sink into the black. In the current they turn
   slowly and their edges keep moving.

   Loose pieces drift over the whole of the screen on a slow current.
   The current is a flow field made of a few long waves laid across one
   another at odd angles, so it bends everywhere and repeats nowhere, and
   it neither gathers nor thins out anything it carries: pieces spread
   over the screen stay spread. Many travel in short lines, each piece of
   a line starting a little behind the one ahead on the same path, so the
   lines are drawn by the current itself and curl however it curls.

   The current and the mark trade. Pieces are taken out of the current,
   the far ones as often as the near ones, and flown to a gap in the
   mark, settling into its grid; pieces come away from the mark's surface
   and are flown out to anywhere on the screen, where they join the
   current. A flight takes longer the further it has to go, so a piece
   crossing the screen is seen crossing it.

   No old screen in any of it: no scanlines, no glow, no phosphor colour,
   no noise, and nothing moves by steps. The pieces are black and a few
   greys: the ones in the current are smaller, lighter and slower the
   further back they sit, and grow, darken and settle their shape as
   they fly into the mark.

   Everything is drawn on one 2D canvas, and only while the screen can
   be seen. For anyone who has asked for less motion it is drawn once,
   whole, and holds still.

   On a tall screen there is no room beside the copy, so the mark turns
   to point up, still tipped, and stands along the bottom of the screen.
   ================================================================== */

const INK = "#000000";
/** Mark units: the elbow's outer point, before rotation (see boomerang.tsx). */
const ELBOW = { x: 0, y: 58 };
/** How many pieces are traded each way per second. */
const TRADE_PER_S = 16;
/** A flight's length in seconds: a base, and more per screen-width travelled. */
const FLIGHT_BASE = 1.5;
const FLIGHT_PER_WIDTH = 2.4;
/** How long the hole a piece leaves in the mark takes to close, in seconds. */
const HEAL_S = 0.8;
/** The longest line of pieces the current carries together. */
const MAX_TRAIN = 8;
/** Screen area per line of pieces in the current, in square pixels. */
const AREA_PER_TRAIN = 15000;
/** How fast the current runs, in pixels per second, at the front. */
const DRIFT = 44;
/** How many different shapes there are. */
const SHAPES = 64;
/** Points round a shape's edge. */
const EDGE_POINTS = 18;

/* The current's stream function: a handful of long waves at odd angles.
   Its velocity is the curl of this, which is what keeps it from bunching
   pieces up anywhere. Wavelengths are in shares of the screen's height. */
const WAVES = [
  { dir: 0.3, len: 0.95, amp: 1.0, speed: 0.05, phase: 0.0 },
  { dir: 1.9, len: 0.62, amp: 0.8, speed: -0.07, phase: 2.1 },
  { dir: 2.8, len: 0.41, amp: 0.55, speed: 0.09, phase: 4.4 },
  { dir: 4.2, len: 1.35, amp: 0.9, speed: -0.04, phase: 1.3 },
  { dir: 5.3, len: 0.29, amp: 0.3, speed: 0.12, phase: 3.7 },
].map((w) => ({ ...w, kx: Math.cos(w.dir), ky: Math.sin(w.dir) }));

/* ---- shapes ---------------------------------------------------------- */

type Shape = {
  /** Waves round the edge: how many lobes, how deep, where, how fast they move. */
  lobes: { n: number; a: number; p: number; w: number }[];
  /** Drawn out along one axis; one end narrower than the other; bent. */
  stretch: number;
  taper: number;
  bend: number;
  turn: number;
  /** Scales a unit shape to the area of a circle of the same size, so a long
      thin piece and a round one carry the same weight. */
  norm: number;
  /** The furthest its edge reaches from its centre, once normalised. */
  extent: number;
};

const rand = (lo: number, hi: number) => lo + Math.random() * (hi - lo);

/* Families, so the pieces differ in kind and not only in detail: round
   pebbles, long capsules, beans, drops, bent crescents, wavy ones with many
   lobes and lopsided ones. Each is loose enough that no two are alike. */
const FAMILIES = [
  // All long and thin: straight slivers, bent ones, tapering ones, curling
  // ones, rippling ones and lopsided ones.
  () => ({ stretch: rand(2.5, 3.3), taper: rand(-0.2, 0.2), bend: rand(-0.08, 0.08), lobes: [0.04, 0.05, 0.03, 0.02] }),
  () => ({ stretch: rand(2.3, 2.9), taper: rand(-0.15, 0.15), bend: rand(0.2, 0.32), lobes: [0.05, 0.06, 0.04, 0.02] }),
  () => ({ stretch: rand(2.2, 2.8), taper: rand(0.4, 0.6), bend: rand(-0.1, 0.1), lobes: [0.05, 0.05, 0.03, 0.02] }),
  () => ({ stretch: rand(2.2, 2.7), taper: rand(-0.25, 0.25), bend: rand(0.32, 0.42), lobes: [0.04, 0.05, 0.03, 0.02] }),
  () => ({ stretch: rand(2.4, 3), taper: 0, bend: rand(-0.06, 0.06), lobes: [0.03, 0.04, 0.09, 0.05] }),
  () => ({ stretch: rand(2, 2.5), taper: rand(-0.3, 0.3), bend: rand(-0.2, 0.2), lobes: [0.12, 0.1, 0.05, 0.02] }),
];

type Form = Pick<Shape, "lobes" | "stretch" | "taper" | "bend">;

/** A point of a shape's edge at unit size, before it is turned. */
function edge(s: Form, a: number, morph: number) {
  let r = 1;
  for (const l of s.lobes) r += l.a * Math.sin(l.n * a + l.p + l.w * morph);
  const lx = Math.cos(a) * r * s.stretch;
  let ly = (Math.sin(a) * r) / s.stretch;
  ly *= 1 + s.taper * (lx / s.stretch);
  ly += s.bend * ((lx * lx) / s.stretch - s.stretch / 2);
  return { x: lx, y: ly };
}

function makeShape(): Shape {
  const family = FAMILIES[Math.floor(Math.random() * FAMILIES.length)]();
  const base: Form = {
    stretch: family.stretch,
    taper: family.taper * (Math.random() < 0.5 ? -1 : 1),
    bend: family.bend * (Math.random() < 0.5 ? -1 : 1),
    lobes: [2, 3, 4 + Math.floor(Math.random() * 2), 6 + Math.floor(Math.random() * 3)].map((n, i) => ({
      n,
      a: family.lobes[i] * rand(0.55, 1.25),
      p: rand(0, Math.PI * 2),
      w: rand(0.4, 1.1) * (Math.random() < 0.5 ? -1 : 1),
    })),
  };
  // Measured once, at rest: its area (shoelace) and its reach.
  const pts = Array.from({ length: 64 }, (_, i) => edge(base, (i / 64) * Math.PI * 2, 0));
  let area = 0;
  let reach = 0;
  pts.forEach((p, i) => {
    const q = pts[(i + 1) % pts.length];
    area += p.x * q.y - q.x * p.y;
    reach = Math.max(reach, Math.hypot(p.x, p.y));
  });
  const norm = Math.sqrt(Math.PI / Math.max(Math.abs(area) / 2, 0.05));
  return { ...base, turn: rand(0, Math.PI * 2), norm, extent: reach * norm };
}

/** Traces a shape's edge as one smooth closed curve, with the area of a
    circle `size` across. `morph` moves its lobes round it, `spin` turns it. */
function trace(pen: CanvasRenderingContext2D, x: number, y: number, size: number, s: Shape, spin: number, morph: number) {
  const radius = (size / 2) * s.norm;
  const px: number[] = [];
  const py: number[] = [];
  const turn = s.turn + spin;
  const c = Math.cos(turn);
  const sn = Math.sin(turn);
  for (let i = 0; i < EDGE_POINTS; i++) {
    const p = edge(s, (i / EDGE_POINTS) * Math.PI * 2, morph);
    const lx = p.x * radius;
    const ly = p.y * radius;
    px.push(x + lx * c - ly * sn);
    py.push(y + lx * sn + ly * c);
  }
  pen.beginPath();
  pen.moveTo((px[0] + px[1]) / 2, (py[0] + py[1]) / 2);
  for (let i = 1; i <= EDGE_POINTS; i++) {
    const j = i % EDGE_POINTS;
    const k = (i + 1) % EDGE_POINTS;
    pen.quadraticCurveTo(px[j], py[j], (px[j] + px[k]) / 2, (py[j] + py[k]) / 2);
  }
  pen.closePath();
  pen.fill();
}

/* ---- layout ---------------------------------------------------------- */

type Layout = {
  w: number;
  h: number;
  cell: number;
  gap: number;
  markX: number;
  markY: number;
  /** Where the mark is drawn: its centre, its turn and its scale. */
  ox: number;
  oy: number;
  theta: number;
  scale: number;
};

type Floater = {
  x: number;
  y: number;
  depth: number;
  shape: number;
  spin: number;
  spinRate: number;
  alive: boolean;
};

type Flight = {
  fx: number;
  fy: number;
  kx: number;
  ky: number;
  t0: number;
  dur: number;
  depth: number;
  shape: number;
  spin: number;
  /** Landing in the mark: the cell it lands in; -1 when leaving it. */
  cell: number;
  /** Leaving the mark: the piece of the current it becomes. */
  floater: Floater | null;
};

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function layoutFor(w: number, h: number) {
  const tall = w / h < 0.9;
  const cell = Math.round(Math.min(Math.max(Math.min(w, h) / 72, 7), 14));
  const gap = cell >= 10 ? 2 : 1;

  let theta: number;
  let scale: number;
  let elbow: { x: number; y: number };

  if (tall) {
    // Pointing up and to the left, arms leaving past the bottom and the
    // right edge. Small enough that the inside of the elbow is on the
    // screen: without the notch it reads as a hill, not as the mark.
    theta = Math.PI + 0.42;
    scale = Math.min(w * 0.0085, h * 0.0055);
    elbow = { x: w * 0.5, y: h * 0.7 };
  } else {
    // Tipped as if thrown: the elbow points up and to the left, one arm
    // runs out past the top right and the other drops away past the
    // bottom. Large, but not so large that the inside of the elbow leaves
    // the screen: the notch is what makes it the mark and not a blot.
    theta = Math.PI / 2 + 0.36;
    scale = Math.min(h * 0.0058, w * 0.0037);
    elbow = { x: w * 0.735, y: h * 0.47 };
  }

  // The mark's centre, placed so that its elbow lands where it is wanted.
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  const ox = elbow.x - (ELBOW.x * c - ELBOW.y * s) * scale;
  const oy = elbow.y - (ELBOW.x * s + ELBOW.y * c) * scale;

  const cols = Math.ceil(w / cell);
  const rows = Math.ceil(h / cell);

  // Rasterised once at one pixel per cell: a cell belongs to the mark if
  // its centre falls inside the shape.
  const probe = document.createElement("canvas");
  probe.width = cols;
  probe.height = rows;
  const pen = probe.getContext("2d", { willReadFrequently: true });
  const grid = new Int32Array(cols * rows).fill(-1);
  const xs: number[] = [];
  const ys: number[] = [];
  if (pen) {
    pen.setTransform(1 / cell, 0, 0, 1 / cell, 0, 0);
    pen.translate(ox, oy);
    pen.rotate(theta);
    pen.scale(scale, scale);
    pen.fill(new Path2D(BOOMERANG_PATH));
    const data = pen.getImageData(0, 0, cols, rows).data;
    for (let r = 0; r < rows; r++) {
      for (let q = 0; q < cols; q++) {
        if (data[(r * cols + q) * 4 + 3] < 128) continue;
        grid[r * cols + q] = xs.length;
        xs.push(q * cell + cell / 2);
        ys.push(r * cell + cell / 2);
      }
    }
  }

  // Where the mark sits on screen, for weighing how far a piece has to fly.
  let markX = elbow.x;
  let markY = elbow.y;
  if (xs.length) {
    markX = xs.reduce((a, b) => a + b, 0) / xs.length;
    markY = ys.reduce((a, b) => a + b, 0) / ys.length;
  }

  const layout: Layout = { w, h, cell, gap, markX, markY, ox, oy, theta, scale };
  return { layout, cols, rows, grid, xs, ys };
}

export function PixelField({ className }: { className?: string }) {
  const reduce = useReducedMotion() ?? false;
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const view = canvas.current;
    const pen = view?.getContext("2d");
    if (!view || !pen) return;

    const shapes = Array.from({ length: SHAPES }, makeShape);
    // The mark's pieces hold still, so each shape is drawn once, at the
    // mark's size, and stamped.
    let stamps: HTMLCanvasElement[] = [];
    // The mark's own layer, and its outline.
    const layer = document.createElement("canvas");
    const layerPen = layer.getContext("2d");
    const silhouette = new Path2D(BOOMERANG_PATH);

    let L: Layout;
    let cols = 0;
    let rows = 0;
    let grid = new Int32Array(0);
    let xs: number[] = [];
    let ys: number[] = [];
    let filled = new Uint8Array(0);
    /** When each cell's piece left, for closing its hole. */
    let vacatedAt = new Float32Array(0);
    let reserved = new Uint8Array(0);
    let cellShape = new Uint8Array(0);
    let floaters: Floater[] = [];
    let flights: Flight[] = [];
    let dpr = 1;

    const start = performance.now();
    let now = 0;

    /** The current's velocity at a point, in pixels per second. */
    const flow = (x: number, y: number, t: number) => {
      let vx = 0;
      let vy = 0;
      for (const w of WAVES) {
        const k = (Math.PI * 2) / (w.len * L.h);
        const arg = (w.kx * x + w.ky * y) * k + w.speed * t * Math.PI * 2 + w.phase;
        // d/dx and d/dy of amp * sin(arg); velocity is (dpsi/dy, -dpsi/dx).
        const d = w.amp * Math.cos(arg) * k;
        vx += d * w.ky;
        vy -= d * w.kx;
      }
      // Normalised to a steady pace, with a lean to the right so the current
      // as a whole carries towards the mark rather than milling in place.
      const norm = DRIFT / ((Math.PI * 2) / L.h) / 1.6;
      return { x: vx * norm + DRIFT * 0.18, y: vy * norm };
    };

    const cellAt = (x: number, y: number) => {
      const q = Math.floor(x / L.cell);
      const r = Math.floor(y / L.cell);
      if (q < 0 || r < 0 || q >= cols || r >= rows) return -1;
      return grid[r * cols + q];
    };

    const newFloater = (x: number, y: number, depth: number, shape: number, alive: boolean): Floater => ({
      x,
      y,
      depth,
      shape,
      spin: rand(0, Math.PI * 2),
      spinRate: rand(0.15, 0.5) * (Math.random() < 0.5 ? -1 : 1),
      alive,
    });

    /** A line of pieces on the same path, laid back along the current from
        its head, so the current draws the line's curve. */
    const spawnTrain = (x: number, y: number, into: Floater[]) => {
      const depth = Math.random();
      const length = 1 + Math.floor(Math.pow(Math.random(), 0.7) * MAX_TRAIN);
      let px = x;
      let py = y;
      for (let i = 0; i < length; i++) {
        into.push(newFloater(px, py, depth, Math.floor(Math.random() * SHAPES), true));
        const v = flow(px, py, 0);
        const m = Math.hypot(v.x, v.y) || 1;
        px -= (v.x / m) * L.cell * 1.6;
        py -= (v.y / m) * L.cell * 1.6;
      }
    };

    /** A piece of the mark has the area of a circle a little wider than its
        cell, so the mark reads as a close mosaic with only slivers of white
        between its pieces. */
    const markSize = () => L.cell * 1.16;

    const makeStamps = () => {
      const size = markSize();
      stamps = shapes.map((s) => {
        // As big as this shape reaches, which for a long one is well past
        // its cell: the pieces of the mark overlap into one another.
        const side = Math.ceil((s.extent * size + 4) * dpr);
        const stamp = document.createElement("canvas");
        stamp.width = side;
        stamp.height = side;
        const p = stamp.getContext("2d");
        if (p) {
          p.fillStyle = INK;
          trace(p, side / 2, side / 2, size * dpr, s, 0, 0);
        }
        return stamp;
      });
    };

    const build = () => {
      const w = view.offsetWidth;
      const h = view.offsetHeight;
      if (!w || !h) return false;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      view.width = Math.round(w * dpr);
      view.height = Math.round(h * dpr);
      layer.width = view.width;
      layer.height = view.height;

      const made = layoutFor(w, h);
      L = made.layout;
      cols = made.cols;
      rows = made.rows;
      grid = made.grid;
      xs = made.xs;
      ys = made.ys;
      filled = new Uint8Array(xs.length).fill(1);
      vacatedAt = new Float32Array(xs.length);
      reserved = new Uint8Array(xs.length);
      cellShape = Uint8Array.from({ length: xs.length }, () => Math.floor(Math.random() * SHAPES));
      flights = [];
      makeStamps();

      // Spread evenly over the screen: stratified, one line per patch, so
      // there are no clumps and no holes to begin with.
      floaters = [];
      const patch = Math.sqrt(AREA_PER_TRAIN);
      for (let y = 0; y < h; y += patch) {
        for (let x = 0; x < w; x += patch) {
          const px = x + Math.random() * patch;
          const py = y + Math.random() * patch;
          if (cellAt(px, py) >= 0) continue;
          spawnTrain(px, py, floaters);
        }
      }
      return true;
    };

    /** Whether a piece sits well inside the mark: every cell within two of
        it is the mark's and on the screen. Only these ever leave, so the
        hole a piece leaves never reaches the outline, which stays exact. */
    const inner = (i: number) => {
      const q = Math.floor(xs[i] / L.cell);
      const r = Math.floor(ys[i] / L.cell);
      if (q < 2 || r < 2 || q >= cols - 2 || r >= rows - 2) return false;
      for (let dr = -2; dr <= 2; dr++) {
        for (let dq = -2; dq <= 2; dq++) {
          if (grid[(r + dr) * cols + q + dq] < 0) return false;
        }
      }
      return true;
    };

    const flightTime = (fx: number, fy: number, tx: number, ty: number) =>
      FLIGHT_BASE + (Math.hypot(tx - fx, ty - fy) / L.w) * FLIGHT_PER_WIDTH + rand(0, 0.6);

    const curve = (fx: number, fy: number, tx: number, ty: number, t0: number, rest: Omit<Flight, "fx" | "fy" | "kx" | "ky" | "t0" | "dur">): Flight => {
      // Bowed to one side, so a flight is an arc rather than a line.
      const bow = rand(-0.45, 0.45);
      return {
        fx,
        fy,
        kx: (fx + tx) / 2 - (ty - fy) * bow,
        ky: (fy + ty) / 2 + (tx - fx) * bow,
        t0,
        dur: flightTime(fx, fy, tx, ty),
        ...rest,
      };
    };

    /** A piece of the mark comes away and is flown out to anywhere on the
        screen, where it joins the current. */
    const depart = (t: number) => {
      for (let tries = 0; tries < 50; tries++) {
        const i = Math.floor(Math.random() * xs.length);
        if (!filled[i] || reserved[i] || !inner(i)) continue;
        let x = 0;
        let y = 0;
        for (let spot = 0; spot < 12; spot++) {
          x = Math.random() * L.w;
          y = Math.random() * L.h;
          if (cellAt(x, y) < 0) break;
        }
        filled[i] = 0;
        vacatedAt[i] = t;
        // Not alive until it lands: it is carried by the current during the
        // flight, and the flight aims at wherever it has been carried to.
        const floater = newFloater(x, y, Math.random(), cellShape[i], false);
        floater.spin = 0;
        floaters.push(floater);
        flights.push(
          curve(xs[i], ys[i], x, y, t, { depth: floater.depth, shape: cellShape[i], spin: 0, cell: -1, floater }),
        );
        return;
      }
    };

    /** A piece of the current leaves it and flies into the mark, sinking
        into its black. Of a few candidates the one furthest from the mark
        is taken, so the far side of the screen feeds the mark as much as the
        near side. */
    const arrive = (t: number) => {
      let cell = -1;
      for (let tries = 0; tries < 80; tries++) {
        const i = Math.floor(Math.random() * xs.length);
        if (filled[i] && !reserved[i] && inner(i)) {
          cell = i;
          break;
        }
      }
      if (cell < 0 || !floaters.length) return;

      let pick = -1;
      let far = -1;
      for (let tries = 0; tries < 3; tries++) {
        const index = Math.floor(Math.random() * floaters.length);
        const f = floaters[index];
        if (!f.alive || cellAt(f.x, f.y) >= 0) continue;
        const d = Math.hypot(f.x - L.markX, f.y - L.markY);
        if (d > far) {
          far = d;
          pick = index;
        }
      }
      if (pick < 0) return;
      const [f] = floaters.splice(pick, 1);
      reserved[cell] = 1;
      // It keeps its own shape and settles into the cell with it.
      cellShape[cell] = f.shape;
      flights.push(curve(f.x, f.y, xs[cell], ys[cell], t, { depth: f.depth, shape: f.shape, spin: f.spin, cell, floater: null }));
    };

    // Pieces in the current are the same scale as those in the mark, give or
    // take a little for depth; distance shows mostly in how pale they are.
    const look = (depth: number) => ({
      size: markSize() * (0.82 + 0.3 * depth),
      alpha: 0.22 + 0.6 * depth,
    });

    const step = (t: number, dt: number) => {
      const margin = L.cell * 2;
      for (const f of floaters) {
        const v = flow(f.x, f.y, t);
        // Further back is slower, which is all the depth the current needs.
        const pace = 0.55 + 0.45 * f.depth;
        f.x += v.x * pace * dt;
        f.y += v.y * pace * dt;
        f.spin += f.spinRate * dt;
        // Carried off one side, brought back in on the other.
        if (f.x > L.w + margin) f.x -= L.w + margin * 2;
        else if (f.x < -margin) f.x += L.w + margin * 2;
        if (f.y > L.h + margin) f.y -= L.h + margin * 2;
        else if (f.y < -margin) f.y += L.h + margin * 2;
      }
    };

    const draw = (t: number) => {
      pen.setTransform(dpr, 0, 0, dpr, 0, 0);
      pen.clearRect(0, 0, L.w, L.h);
      pen.fillStyle = INK;
      const full = markSize();

      // The mark is solid: its own exact outline, filled, so there is no
      // white in it and nothing breaks its edge. Where a piece has left, the
      // hole it leaves is the piece's own shape, cut out for a moment.
      // Pieces at home are black on black and need no
      // drawing. Drawn on a layer of its own so the holes cut the mark and
      // nothing else.
      if (layerPen) {
        layerPen.setTransform(dpr, 0, 0, dpr, 0, 0);
        layerPen.clearRect(0, 0, L.w, L.h);
        layerPen.globalCompositeOperation = "source-over";
        layerPen.fillStyle = INK;
        layerPen.save();
        layerPen.translate(L.ox, L.oy);
        layerPen.rotate(L.theta);
        layerPen.scale(L.scale, L.scale);
        layerPen.fill(silhouette);
        layerPen.restore();

        // A hole is only seen as the piece lifts out: it closes up behind it,
        // shrinking to nothing, so the mark is never more than lightly
        // marked and is whole again within a second.
        layerPen.globalCompositeOperation = "destination-out";
        for (let i = 0; i < xs.length; i++) {
          if (filled[i]) continue;
          const age = (t - vacatedAt[i]) / HEAL_S;
          if (age >= 1) {
            filled[i] = 1;
            continue;
          }
          const stamp = stamps[cellShape[i]];
          const side = (stamp.width / dpr) * (1 - ease(age));
          layerPen.drawImage(stamp, xs[i] - side / 2, ys[i] - side / 2, side, side);
        }

        layerPen.globalCompositeOperation = "source-over";

        pen.globalAlpha = 1;
        pen.setTransform(1, 0, 0, 1, 0, 0);
        pen.drawImage(layer, 0, 0);
        pen.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      // The current. Positions are not rounded: they glide, turn and keep
      // changing shape.
      for (const f of floaters) {
        if (!f.alive) continue;
        const l = look(f.depth);
        pen.globalAlpha = l.alpha;
        trace(pen, f.x, f.y, l.size, shapes[f.shape], f.spin, t);
      }

      // The flights, growing, darkening and settling their shape towards the
      // mark, and loosening back into the current on the way out.
      const keep: Flight[] = [];
      for (const fl of flights) {
        const raw = Math.min((t - fl.t0) / fl.dur, 1);
        const e = ease(raw);
        const landing = fl.cell >= 0;
        const tx = landing ? xs[fl.cell] : fl.floater!.x;
        const ty = landing ? ys[fl.cell] : fl.floater!.y;
        const u = 1 - e;
        const x = u * u * fl.fx + 2 * u * e * fl.kx + e * e * tx;
        const y = u * u * fl.fy + 2 * u * e * fl.ky + e * e * ty;
        const l = look(fl.depth);
        const k = landing ? e : 1 - e;
        pen.globalAlpha = l.alpha + (1 - l.alpha) * k;
        // Settled means turned home and with its lobes at rest, which is how
        // its stamp in the mark is drawn.
        const spin = landing ? fl.spin * (1 - e) : (fl.floater?.spin ?? 0) * e;
        trace(pen, x, y, l.size + (full - l.size) * k, shapes[fl.shape], spin, t * (1 - k));

        if (raw < 1) {
          keep.push(fl);
        } else if (landing) {
          filled[fl.cell] = 1;
          reserved[fl.cell] = 0;
        } else if (fl.floater) {
          fl.floater.alive = true;
        }
      }
      flights = keep;
      pen.globalAlpha = 1;
    };

    if (!build()) return;

    if (reduce) {
      draw(0);
      const resize = new ResizeObserver(() => build() && draw(0));
      resize.observe(view);
      return () => resize.disconnect();
    }

    let frame = 0;
    let visible = false;
    let owed = 0;
    let last = 0;

    const tick = (stamp: number) => {
      now = (stamp - start) / 1000;
      const dt = last ? Math.min(now - last, 0.1) : 0;
      last = now;
      step(now, dt);
      owed += dt * TRADE_PER_S;
      while (owed >= 1) {
        owed -= 1;
        depart(now);
        arrive(now);
      }
      draw(now);
      frame = visible ? requestAnimationFrame(tick) : 0;
      if (!frame) last = 0;
    };

    const seen = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !frame) frame = requestAnimationFrame(tick);
    });
    seen.observe(view);

    const resize = new ResizeObserver(() => {
      if (build()) draw(now);
    });
    resize.observe(view);

    return () => {
      cancelAnimationFrame(frame);
      seen.disconnect();
      resize.disconnect();
    };
  }, [reduce]);

  return <canvas ref={canvas} aria-hidden="true" className={`block h-full w-full ${className ?? ""}`} />;
}
