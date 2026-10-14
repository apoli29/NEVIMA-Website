"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

/* ==================================================================
   Liquid edge

   The top of a black section as a liquid surface rather than a ruled
   line (user, 2026-10-14, for the comparison: the black should not just
   arrive). It comes up the screen with a slow, wide swell on it, the
   water of the second screen again, and settles as it rises, until it
   lies perfectly flat once it is well up the screen. While it is still
   moving it takes a little lift from the hand passing near it.

   It lives in a band of its own at the top of the section, above the
   section's ground, so nothing above the section is ever covered: the
   crests only reach the band's top. Done, the band is plain black from
   its foot down and the edge is a straight line.

   Drawn as one SVG path, every frame while the band is on screen and
   not yet still. Without motion the edge is simply flat.
   ================================================================== */

/** Points along the edge; the curve is smoothed between them. */
const POINTS = 56;
const TAU = Math.PI * 2;

/** The swell, from -1 to 1 along the edge: three waves of falling
    size drifting at different speeds, so it never repeats visibly. */
function swell(u: number, t: number) {
  return (
    0.55 * Math.sin(TAU * 1.1 * u + t * 0.55 + 1.3) +
    0.3 * Math.sin(TAU * 2.3 * u - t * 0.8 + 0.4) +
    0.15 * Math.sin(TAU * 4.7 * u + t * 1.25)
  );
}

const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);

export function LiquidEdge({ colour, className }: { colour: string; className?: string }) {
  const reduce = useReducedMotion() ?? false;
  const host = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const path = useRef<SVGPathElement>(null);

  useEffect(() => {
    const box = host.current;
    const view = svg.current;
    const line = path.current;
    if (!box || !view || !line) return;

    let w = 1;
    let h = 1;
    const measure = () => {
      w = Math.max(1, box.clientWidth);
      h = Math.max(1, box.clientHeight);
      view.setAttribute("viewBox", `0 0 ${w} ${h}`);
    };

    // The edge at rest: a straight line along the foot of the band.
    const flat = () => line.setAttribute("d", `M0 ${h - 0.5}H${w}V${h}H0Z`);

    measure();
    flat();
    if (reduce) {
      const ro = new ResizeObserver(() => {
        measure();
        flat();
      });
      ro.observe(box);
      return () => ro.disconnect();
    }

    const pointer = { x: -1e4, y: -1e4 };
    const onMove = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
    };
    // How far the hand's lift has come, eased so it swells and subsides.
    let lift = 0;
    let liftX = 0;

    const ys = new Float64Array(POINTS + 1);
    const draw = (now: number) => {
      const r = box.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 as the edge's foot comes up from under the screen, 1 once it is
      // three fifths of the way up: the swell dies away in between.
      const p = Math.min(Math.max((vh - r.bottom) / (vh * 0.6), 0), 1);
      const calm = easeOut(p);
      const amp = h * 0.92 * (1 - calm);

      const near = pointer.y > r.top - 160 && pointer.y < r.bottom + 160 && pointer.x >= r.left && pointer.x <= r.right;
      lift += ((near ? 1 : 0) - lift) * 0.06;
      if (near) liftX += (pointer.x - r.left - liftX) * 0.12;

      if (amp < 0.25 && lift * (1 - calm) < 0.01) {
        flat();
        return;
      }

      const t = now / 1000;
      const reach = w * 0.09;
      for (let i = 0; i <= POINTS; i++) {
        const x = (i / POINTS) * w;
        const v = swell(i / POINTS, t + p * 3);
        const d = (x - liftX) / reach;
        const bump = lift * (1 - calm) * h * 0.35 * Math.exp(-d * d);
        ys[i] = Math.max(0, h - amp * (0.5 + 0.5 * v) - bump);
      }
      // Smoothed through the midpoints between the points.
      let d = `M0 ${h}L0 ${ys[0]!.toFixed(2)}`;
      for (let i = 0; i < POINTS; i++) {
        const x0 = (i / POINTS) * w;
        const x1 = ((i + 1) / POINTS) * w;
        d += `Q${x0.toFixed(2)} ${ys[i]!.toFixed(2)} ${((x0 + x1) / 2).toFixed(2)} ${((ys[i]! + ys[i + 1]!) / 2).toFixed(2)}`;
      }
      d += `L${w} ${ys[POINTS]!.toFixed(2)}L${w} ${h}Z`;
      line.setAttribute("d", d);
    };

    let frame = 0;
    let shown = false;
    const tick = (now: number) => {
      draw(now);
      frame = shown ? requestAnimationFrame(tick) : 0;
    };
    const seen = new IntersectionObserver(
      ([entry]) => {
        shown = !!entry?.isIntersecting;
        if (shown && !frame) frame = requestAnimationFrame(tick);
      },
      { rootMargin: "200px 0px" },
    );
    seen.observe(box);
    const ro = new ResizeObserver(measure);
    ro.observe(box);
    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      seen.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, [reduce]);

  return (
    <div ref={host} aria-hidden="true" className={className}>
      <svg ref={svg} className="block h-full w-full" preserveAspectRatio="none">
        <path ref={path} fill={colour} />
      </svg>
    </div>
  );
}
