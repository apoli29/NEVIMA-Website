"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

/* ==================================================================
   Rewrite title

   The services heading corrects itself. It arrives as "We only do
   websites"; once it has been read, "only" is struck through, the
   struck word is taken out and the sentence closes up over the gap, and
   then the sentence opens again for "way more than" to come in, so what
   stands is "We do way more than websites". It plays once.

   The two words that change are clipped across only, so the tails of
   the letters still hang below the line, and they sit on the line by
   their tops: with the heading's own line height, that puts their
   baseline exactly on the sentence's.

   A screen reader is given the sentence as it ends. Anyone who has asked
   for less motion is shown only that.
   ================================================================== */

/** From the heading being in view to the strike starting, in ms: long
    enough for its slide in to land and for the first version to be read. */
const READ_MS = 1100;
const STRIKE_S = 0.45;
/** From the strike being drawn to the word being taken out, in ms. */
const STRUCK_MS = 700;
const CLOSE_S = 0.6;
/** From the word being taken out to the new words coming in, in ms. */
const CLOSED_MS = 750;
const OPEN_S = 0.75;
const EASE = [0.65, 0, 0.35, 1] as const;

const FINAL = "We do way more than websites";

export function RewriteTitle({
  ready,
  id,
  className,
}: {
  ready: boolean;
  id?: string;
  className?: string;
}) {
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLHeadingElement>(null);
  // 0 as it arrives, 1 struck, 2 taken out, 3 rewritten.
  const [step, setStep] = useState(0);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    if (!ready || seen || reduce) return;
    const el = ref.current;
    if (!el) return;
    const watch = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setSeen(true);
      },
      { rootMargin: "0px 0px -25% 0px" },
    );
    watch.observe(el);
    return () => watch.disconnect();
  }, [ready, seen, reduce]);

  useEffect(() => {
    if (!seen) return;
    const strike = READ_MS;
    const close = strike + STRUCK_MS;
    const open = close + CLOSED_MS;
    const timers = [
      window.setTimeout(() => setStep(1), strike),
      window.setTimeout(() => setStep(2), close),
      window.setTimeout(() => setStep(3), open),
    ];
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [seen]);

  const at = reduce ? 3 : step;
  // A word that can come and go: clipped across only, set on the line by
  // its top (see above).
  const swap = "inline-block overflow-x-clip whitespace-nowrap align-top";

  return (
    <h2 ref={ref} id={id} className={className}>
      <span className="sr-only">{FINAL}</span>
      <span aria-hidden="true">
        We{" "}
        <motion.span
          className={swap}
          initial={false}
          animate={{ width: at >= 2 ? 0 : "auto", opacity: at >= 2 ? 0 : 1 }}
          transition={{ duration: CLOSE_S, ease: EASE }}
        >
          {/* The space after the word is its own padding, so it goes out
              with the word and leaves one space, not two. */}
          <span className="relative inline-block pr-[0.26em]">
            only
            <motion.span
              className="absolute top-[0.52em] right-[0.26em] left-0 h-[0.06em] origin-left bg-current"
              initial={false}
              animate={{ scaleX: at >= 1 ? 1 : 0 }}
              transition={{ duration: STRIKE_S, ease: EASE }}
            />
          </span>
        </motion.span>
        do{" "}
        <motion.span
          className={swap}
          initial={false}
          animate={{ width: at >= 3 ? "auto" : 0, opacity: at >= 3 ? 1 : 0 }}
          transition={{
            width: { duration: OPEN_S, ease: EASE },
            // The words show once there is room for most of them.
            opacity: { duration: OPEN_S * 0.6, delay: at >= 3 ? OPEN_S * 0.4 : 0 },
          }}
        >
          <span className="inline-block pr-[0.26em]">way more than</span>
        </motion.span>
        websites
      </span>
    </h2>
  );
}
