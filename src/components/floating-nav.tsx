"use client";

import type { RefObject } from "react";
import { motion, useReducedMotion, type MotionValue, type Variants } from "motion/react";
import { BoomerangMark } from "./boomerang";

/* ==================================================================
   The bar is a black, square-cornered strip floating clear of the page
   edges. It holds the white wordmark, which is where the opening mark
   flies to, so the slot below is measured rather than guessed.

   The labels are still the placeholders the studio asked for and none
   of them route anywhere yet.
   ================================================================== */

const NAV = [
  { label: "Work", href: "#work" },
  { label: "Services", href: "#services" },
  { label: "Studio", href: "#studio" },
];

/* ==================================================================
   Boomerang pass

   Thrown from the left edge of the item and caught on the right edge,
   never a pixel outside it, and without the item reserving any space
   for it: the track is the full width of the item and carries the mark
   across it, then the mark pulls itself back by exactly its own width,
   so its trailing edge lands flush with the item's.

   Both halves are percentage transforms of their own boxes, so this
   holds at any label length with nothing measured.
   ================================================================== */

const MARK_WIDTH = 24;
const PASS = { duration: 0.72, ease: [0.42, 0, 0.24, 1] } as const;

const track: Variants = {
  rest: { x: "0%" },
  pass: { x: "100%", transition: PASS },
};

const mark: Variants = {
  rest: { x: "0%", rotate: 0, opacity: 0, transition: { duration: 0.2 } },
  pass: {
    x: "-100%",
    rotate: 380,
    opacity: [0, 1, 1, 0],
    transition: {
      ...PASS,
      // Held almost to the edge: the mark has to be seen arriving, not
      // already dissolving halfway across.
      opacity: { duration: PASS.duration, times: [0, 0.14, 0.88, 1] },
    },
  },
};

function Pass({
  href,
  label,
  className,
  markClassName,
}: {
  href: string;
  label: string;
  className: string;
  markClassName: string;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.a
      href={href}
      initial="rest"
      animate="rest"
      whileHover="pass"
      whileFocus="pass"
      // No display utility here on purpose: the caller owns it. Setting one
      // both places leaves Tailwind's source order to decide which wins, and
      // it is not the one written last in the attribute.
      className={`relative isolate items-center justify-center overflow-hidden whitespace-nowrap ${className}`}
    >
      {!reduce && (
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <motion.span
            variants={track}
            className="absolute inset-y-0 left-0 flex w-full items-center"
          >
            <motion.span variants={mark} className={`block ${markClassName}`}>
              <BoomerangMark width={MARK_WIDTH} />
            </motion.span>
          </motion.span>
        </span>
      )}
      {label}
    </motion.a>
  );
}

/* ================================================================== */

export function FloatingNav({
  opacity,
  linksOpacity,
  markRef,
  markVisible,
}: {
  /** The bar. It is black on the black curtain, so it can be fully in
      under the landed mark without anyone seeing it arrive. */
  opacity: MotionValue<number>;
  /** The links. They are what would show on the curtain, so they come in
      with the page rather than with the bar. */
  linksOpacity: MotionValue<number>;
  /** the wordmark slot the opening mark flies into */
  markRef: RefObject<HTMLImageElement | null>;
  markVisible: boolean;
}) {
  return (
    <motion.header
      style={{ opacity }}
      className="pointer-events-none fixed inset-x-0 top-0 z-50 pt-4 md:pt-6"
    >
      {/* Same container as the headline, so the two share a left edge. The
          bar then hangs out of that column by exactly its own padding, which
          puts the wordmark back on the column edge and leaves the difference
          between the gutter and that padding as the float. */}
      <div className="shell">
        <div className="pointer-events-auto -mx-3 flex items-center justify-between gap-4 rounded-[16px] bg-ink px-3 py-2.5 md:-mx-5 md:gap-8 md:px-5 md:py-3 xl:-mx-8 xl:px-8">
          <a
            href="#top"
            aria-label="nevima, home"
            className="flex shrink-0 items-center"
          >
            {/* Held invisible until the opening mark has landed on it, then
                taken over from the flying copy in the same pixels. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={markRef}
              src="/nevima-wordmark-white.svg"
              alt="nevima"
              className="block h-[1.35rem] w-auto md:h-[1.55rem]"
              style={{ opacity: markVisible ? 1 : 0 }}
            />
          </a>

          <motion.nav
            aria-label="Primary"
            style={{ opacity: linksOpacity }}
            className="flex items-center gap-1 md:gap-2"
          >
            {NAV.map((item) => (
              <Pass
                key={item.href}
                href={item.href}
                label={item.label}
                className="hidden px-4 py-2.5 text-[0.9375rem] text-paper sm:inline-flex"
                markClassName="text-paper/70"
              />
            ))}
            {/* Rounded less than the bar, as a shape set inside it. */}
            <Pass
              href="#contact"
              label="Get in touch"
              className="inline-flex rounded-[8px] bg-paper px-5 py-2.5 text-[0.9375rem] leading-none text-ink"
              markClassName="text-ink/30"
            />
          </motion.nav>
        </div>
      </div>
    </motion.header>
  );
}

export { NAV };
