"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

/* ==================================================================
   Entrance

   A heading comes in from the edge it is set against and travels
   inwards. The fade is not the move: it is spent in the first third
   and the slide carries on under it, so the words are read arriving
   rather than appearing.

   Nothing is watched until the opening has handed the page back. While
   it plays, its stage is fixed and takes up no room, so every section
   below is stacked at the top of the page behind the curtain: a watch
   started any earlier would run each of these where nobody can see it.
   ================================================================== */

export const ENTER_EASE = [0.22, 1, 0.36, 1] as const;

const SLIDE_S = 0.95;
const FADE_S = 0.42;

export function SlideIn({
  ready,
  from = "left",
  distance = 56,
  delay = 0,
  className,
  children,
}: {
  ready: boolean;
  /** the edge it comes in from */
  from?: "left" | "right";
  /** how far out it starts. Zero is a fade on its own. */
  distance?: number;
  delay?: number;
  className?: string;
  children: ReactNode;
}) {
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    if (!ready || seen) return;
    const el = ref.current;
    if (!el) return;
    const watch = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setSeen(true);
      },
      { rootMargin: "0px 0px -18% 0px" },
    );
    watch.observe(el);
    return () => watch.disconnect();
  }, [ready, seen]);

  const shown = seen || reduce;
  const out = reduce ? 0 : from === "right" ? distance : -distance;

  return (
    <motion.div
      ref={ref}
      className={className}
      // Held at its starting mark rather than animated to it: there is no
      // entrance to play before the section has been seen.
      initial={false}
      animate={{ opacity: shown ? 1 : 0, x: shown ? 0 : out }}
      transition={{
        opacity: { duration: FADE_S, delay, ease: "easeOut" },
        x: { duration: SLIDE_S, delay, ease: ENTER_EASE },
      }}
    >
      {children}
    </motion.div>
  );
}
