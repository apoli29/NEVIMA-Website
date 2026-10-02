"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ENTER_EASE } from "./enter";

/* ==================================================================
   Exhibit

   The pieces the services index and the co-founders are set with, so
   the two read as one catalogue: a hairline drawn in from the left, a
   line of type that rises out of its own baseline, and a watch that
   only starts once the opening has handed the page back (see enter.tsx
   for why).
   ================================================================== */

/** Seen once, and only once the page is the reader's. */
export function useSeen<T extends Element>(
  ready: boolean,
  rootMargin = "0px 0px -18% 0px",
) {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    if (!ready || seen) return;
    const el = ref.current;
    if (!el) return;
    const watch = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setSeen(true);
      },
      { rootMargin },
    );
    watch.observe(el);
    return () => watch.disconnect();
  }, [ready, seen, rootMargin]);

  return [ref, seen] as const;
}

const RISE_S = 1.05;

/** A line of type that comes up out of a slot cut at its own height. The
    slot reaches past the line box by a little each way, so the accents
    over the capitals and the tails under the line are never clipped. */
export function Rise({
  shown,
  delay = 0,
  className,
  children,
}: {
  shown: boolean;
  delay?: number;
  className?: string;
  children: ReactNode;
}) {
  const reduce = useReducedMotion() ?? false;
  return (
    <span
      className={`-my-[0.14em] block overflow-hidden py-[0.14em] ${className ?? ""}`}
    >
      <motion.span
        className="block will-change-transform"
        initial={false}
        animate={{ y: shown || reduce ? "0%" : "112%" }}
        transition={{ duration: reduce ? 0 : RISE_S, delay, ease: ENTER_EASE }}
      >
        {children}
      </motion.span>
    </span>
  );
}

/** A hairline drawn in from the left. Positioned by the caller. */
export function Rule({
  shown,
  delay = 0,
  className,
}: {
  shown: boolean;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion() ?? false;
  return (
    <motion.span
      aria-hidden="true"
      className={`pointer-events-none block h-px origin-left ${className ?? ""}`}
      initial={false}
      animate={{ scaleX: shown || reduce ? 1 : 0 }}
      transition={{ duration: reduce ? 0 : 1.2, delay, ease: [0.65, 0, 0.35, 1] }}
    />
  );
}

/** A photograph uncovered from the foot up, settling as it comes. */
export function Uncover({
  shown,
  delay = 0,
  className,
  children,
}: {
  shown: boolean;
  delay?: number;
  className?: string;
  children: ReactNode;
}) {
  const reduce = useReducedMotion() ?? false;
  const on = shown || reduce;
  return (
    <motion.div
      className={`overflow-hidden ${className ?? ""}`}
      initial={false}
      animate={{ clipPath: on ? "inset(0% 0% 0% 0%)" : "inset(100% 0% 0% 0%)" }}
      transition={{ duration: reduce ? 0 : 1.1, delay, ease: [0.76, 0, 0.24, 1] }}
    >
      <motion.div
        className="size-full"
        initial={false}
        animate={{ scale: on ? 1 : 1.14 }}
        transition={{ duration: reduce ? 0 : 1.6, delay, ease: ENTER_EASE }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
