"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";

/**
 * The mark is built from the same DNA as the "v" in the nevima wordmark:
 * flat-cut terminals, a single geometric elbow, arms that taper the way the
 * glyph's strokes do. Opened to ~104 degrees it reads as a boomerang while
 * still belonging to the typeface it came from.
 *
 * Drawn centred on (0,0) so it can be rotated without a transform-origin fix.
 */
export const BOOMERANG_PATH =
  "M -124 -43.5 L -29.7 37.15 C -14 65.5, 14 65.5, 29.7 37.15 L 124 -43.5 L 112 -58.5 L 26 3.7 C 12 26.5, -12 26.5, -26 3.7 L -112 -58.5 Z";

const VIEW = "-130 -62 260 124";
/** height / width of the mark, used to centre it on a flight path */
const RATIO = 124 / 260;

type MarkProps = {
  className?: string;
  width?: number | string;
  variant?: "solid" | "outline";
  strokeWidth?: number;
};

export function BoomerangMark({
  className,
  width = 40,
  variant = "solid",
  strokeWidth = 5,
}: MarkProps) {
  return (
    <svg
      viewBox={VIEW}
      width={width}
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <path
        d={BOOMERANG_PATH}
        fill={variant === "solid" ? "currentColor" : "none"}
        stroke={variant === "outline" ? "currentColor" : "none"}
        strokeWidth={variant === "outline" ? strokeWidth : 0}
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Hero throw: out, around, and back to the hand.                      */
/* ------------------------------------------------------------------ */

/**
 * Flight described in fractions of the container, so it survives any viewport.
 * Two versions: a wide arc for landscape heroes, a tighter one for portrait —
 * on a phone the resting point has to clear the headline block below it.
 */
type Flight = { start: [number, number]; curves: [number, number][][] };

const FLIGHT_WIDE: Flight = {
  start: [-0.16, 0.97],
  curves: [
    [
      [0.13, 0.87],
      [0.31, 0.71],
      [0.45, 0.53],
    ],
    [
      [0.58, 0.35],
      [0.75, 0.12],
      [0.9, 0.15],
    ],
    [
      [1.03, 0.17],
      [1.03, 0.45],
      [0.87, 0.51],
    ],
    [
      [0.74, 0.555],
      [0.665, 0.47],
      [0.7, 0.39],
    ],
    [
      [0.718, 0.342],
      [0.752, 0.322],
      [0.766, 0.333],
    ],
  ],
};

const FLIGHT_TALL: Flight = {
  start: [-0.24, 0.9],
  curves: [
    [
      [0.1, 0.86],
      [0.3, 0.78],
      [0.45, 0.66],
    ],
    [
      [0.62, 0.53],
      [0.78, 0.38],
      [0.86, 0.24],
    ],
    [
      [0.96, 0.05],
      [1.1, 0.2],
      [0.95, 0.3],
    ],
    [
      [0.85, 0.37],
      [0.71, 0.33],
      [0.7, 0.235],
    ],
    [
      [0.697, 0.19],
      [0.712, 0.163],
      [0.72, 0.17],
    ],
  ],
};

function flightPath(w: number, h: number) {
  const f = h / w > 1.2 ? FLIGHT_TALL : FLIGHT_WIDE;
  const p = (pt: [number, number]) => `${(pt[0] * w).toFixed(1)} ${(pt[1] * h).toFixed(1)}`;
  return (
    `M ${p(f.start)} ` +
    f.curves.map(([c1, c2, e]) => `C ${p(c1)}, ${p(c2)}, ${p(e)}`).join(" ")
  );
}

export function HeroThrow({ className }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [len, setLen] = useState(0);
  const reduce = useReducedMotion();

  const t = useMotionValue(0);

  // Measure, so the trajectory is always drawn in real pixels.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setBox({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (pathRef.current && box.w > 0) setLen(pathRef.current.getTotalLength());
  }, [box.w, box.h]);

  const throwIt = useCallback(() => {
    if (reduce) {
      t.set(1);
      return;
    }
    t.set(0);
    animate(t, [0, 0.4, 0.7, 1], {
      duration: 3.5,
      times: [0, 0.36, 0.62, 1],
      ease: ["easeOut", "linear", [0.22, 1, 0.36, 1]],
    });
  }, [reduce, t]);

  useEffect(() => {
    if (len === 0) return;
    const id = window.setTimeout(throwIt, 420);
    return () => window.clearTimeout(id);
  }, [len, throwIt]);

  const pointAt = (v: number) => {
    const path = pathRef.current;
    if (!path || len === 0) return { x: 0, y: 0 };
    return path.getPointAtLength(Math.max(0, Math.min(1, v)) * len);
  };

  const x = useTransform(t, (v) => pointAt(v).x);
  const y = useTransform(t, (v) => pointAt(v).y);
  // Four full turns, landing at the angle a boomerang reads best at.
  const rotate = useTransform(t, [0, 1], [-140, 360 * 4 + 52]);
  // Reads as distance: small on the way out, full size back in the hand.
  const scale = useTransform(t, [0, 0.18, 0.55, 0.82, 1], [0.42, 0.78, 0.62, 1.08, 1]);
  const traceOpacity = useTransform(t, [0, 0.06, 0.75, 1], [0, 0.55, 0.5, 0.14]);
  const markOpacity = useTransform(t, [0, 0.04], [0, 1]);

  const size = box.w < 720 ? 64 : box.w < 1100 ? 86 : 104;

  return (
    <div ref={wrapRef} className={className} aria-hidden="true">
      {box.w > 0 && (
        <>
          <svg
            className="absolute inset-0 h-full w-full overflow-visible"
            width={box.w}
            height={box.h}
          >
            {/* pathLength drives the dash offset, so the trace draws itself */}
            <motion.path
              ref={pathRef}
              d={flightPath(box.w, box.h)}
              fill="none"
              stroke="var(--color-chalk)"
              strokeWidth={1.25}
              strokeLinecap="round"
              style={{ pathLength: t, opacity: traceOpacity }}
            />
          </svg>

          <motion.div
            className="absolute top-0 left-0 will-change-transform"
            style={{ x, y, opacity: markOpacity }}
          >
            <motion.button
              type="button"
              onClick={throwIt}
              aria-label="atirar outra vez"
              tabIndex={-1}
              className="block cursor-pointer text-chalk"
              style={{
                rotate,
                scale,
                marginLeft: -size / 2,
                marginTop: (-size * RATIO) / 2,
              }}
            >
              <BoomerangMark width={size} />
            </motion.button>
          </motion.div>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Scroll-driven boomerang: the return, made structural.               */
/* ------------------------------------------------------------------ */

export function ScrollBoomerang({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const rotate = useTransform(scrollYProgress, [0, 1], [-70, 250]);
  const ring = useTransform(scrollYProgress, [0, 1], [40, -140]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1.02, 0.9]);

  return (
    <div ref={ref} className={className} aria-hidden="true">
      <div className="relative aspect-square w-full">
        {/* the return path it never leaves */}
        <motion.div
          style={reduce ? undefined : { rotate: ring }}
          className="absolute inset-[4%] rounded-full border border-dashed border-chalk/22"
        />
        <div className="absolute inset-[13%] rounded-full border border-hair" />
        <div className="absolute inset-0 grid place-items-center">
          <motion.div
            style={reduce ? undefined : { rotate, scale }}
            className="w-[74%]"
          >
            <BoomerangMark
              width="100%"
              variant="outline"
              strokeWidth={1.6}
              className="text-chalk/60"
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
