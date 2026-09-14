"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { useReducedMotion } from "motion/react";

/**
 * Weighted scrolling. The page follows the wheel with a little inertia instead
 * of snapping to it, which is most of what separates a site that feels built
 * from one that feels assembled.
 *
 * Touch is left native: syncing it adds lag on the one input that already has
 * momentum of its own.
 *
 * `locked` holds the page still while the opening plays. It is applied in its
 * own effect rather than by the caller, because useReducedMotion resolves from
 * null to a boolean just after mount and rebuilds the instance: a stop() the
 * caller made against the first one would be lost, and the gesture that
 * triggered the opening would then be waiting in the new one and land the
 * moment the page is released.
 */
export function useSmoothScroll(locked: boolean) {
  const lenis = useRef<Lenis | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;

    const instance = new Lenis({
      duration: 1.15,
      // A long, shallow tail: still moving after the wheel stops, but settling
      // rather than sliding.
      easing: (t) => 1 - Math.pow(1 - t, 3.6),
      wheelMultiplier: 0.9,
      // In-page links go through the same easing; left to the browser they
      // would jump, and Lenis would then fight the jump back.
      anchors: true,
    });
    lenis.current = instance;

    let frame = requestAnimationFrame(function raf(time) {
      instance.raf(time);
      frame = requestAnimationFrame(raf);
    });

    return () => {
      cancelAnimationFrame(frame);
      instance.destroy();
      lenis.current = null;
    };
  }, [reduce]);

  // Declared after the effect above so it always runs against the instance
  // that effect just built, including the rebuild on mount.
  useEffect(() => {
    const instance = lenis.current;
    if (!instance) return;
    if (locked) {
      instance.stop();
      return;
    }
    // Released pages have usually changed height while locked (the opening
    // stage is fixed and takes up no space), and Lenis caches the old limit.
    instance.resize();
    instance.start();
  }, [locked, reduce]);

  return lenis;
}
