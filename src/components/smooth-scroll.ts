"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
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
let live: Lenis | null = null;

/** The page's Lenis, for code that moves the page itself; null under
    reduced motion. */
export function getLenis() {
  return live;
}

/** Puts the page at `y` at once, Lenis included. */
export function jumpTo(y: number) {
  if (live) live.scrollTo(y, { immediate: true, force: true });
  else window.scrollTo(0, y);
}

/* Holds asked for by things that are not the page, such as the bar's menu
   on a phone: the page they sit on does not know they are open, so they say
   so here and useSmoothScroll adds them to its own lock. The lock itself
   stays in one place. */
const holds = new Set<string>();
const heard = new Set<() => void>();

/** Holds the page still (`on`) or lets it go, under the name `by`. */
export function holdScroll(by: string, on: boolean) {
  if (holds.has(by) === on) return;
  if (on) holds.add(by);
  else holds.delete(by);
  heard.forEach((tell) => tell());
}

/** Whether anything outside the page is holding it still. */
export function scrollHeld() {
  return holds.size > 0;
}

const listen = (tell: () => void) => {
  heard.add(tell);
  return () => heard.delete(tell);
};

export function useSmoothScroll(pageLocked: boolean) {
  const lenis = useRef<Lenis | null>(null);
  const reduce = useReducedMotion();
  const held = useSyncExternalStore(listen, scrollHeld, () => false);
  const locked = pageLocked || held;

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
    live = instance;

    let frame = requestAnimationFrame(function raf(time) {
      instance.raf(time);
      frame = requestAnimationFrame(raf);
    });

    return () => {
      cancelAnimationFrame(frame);
      instance.destroy();
      lenis.current = null;
      if (live === instance) live = null;
    };
  }, [reduce]);

  // Declared after the effect above so it always runs against the instance
  // that effect just built, including the rebuild on mount.
  useEffect(() => {
    const instance = lenis.current;
    if (!instance) {
      // No Lenis with reduced motion, so nothing to stop: the page is held
      // by a class instead (see .scroll-held in globals.css). A class, not
      // an inline overflow, so it cannot undo the opening's own lock.
      if (!locked || reduce === null) return;
      const root = document.documentElement;
      root.classList.add("scroll-held");
      return () => root.classList.remove("scroll-held");
    }
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
