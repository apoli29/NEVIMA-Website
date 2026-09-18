"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
} from "motion/react";

/* ==================================================================
   Split reveal

   One shape divides into the several a section is made of. A single
   rectangle fades in and grows, then its parts pull apart: while they
   are close the surface between them holds, thins into a neck and
   snaps, the way one drop separates into two. Only once they are apart
   does the shape resolve and hand over to the cards underneath.

   The neck is not drawn. Every part is blurred into the same layer and
   the result thresholded back to a hard edge, so two parts that are
   near enough read as one body and part of their own accord. A straight
   edge cut at half opacity cannot be moved by blurring it, so each part
   lands exactly on the box it was measured from and only its corners
   round; the blur is taken off at the end, so even those come back.

   The parts are measured from the real elements rather than described,
   which is what lets the same reveal serve two founders standing side
   by side and four service bars stacked down the page.

   Nothing is crossfaded. The parts are the same black as the cards and
   land on the same pixels, so the cards are simply switched on, whole,
   underneath a shape that is still opaque; only then does the shape go.
   Fading one out while the other came in would have taken both through
   half opacity at once, and two half-opaque blacks over white do not
   make a black: the cards went grey in the middle of their own arrival.
   Switched on under cover, there is nothing to dip. What the section
   still has to bring in on `revealed` is what the shape never stood
   for: the portraits, the titles, the photographs.

   The shape is quick to arrive and then held. That pause is the whole
   reading of it: the rectangle has to be seen whole, and understood as
   one thing, before it is seen to be two.

   Read left to right, in milliseconds:

   shape   |- in -|
   hold            |-- held --|
   parts                      |------- apart -------|
   blur                                     |- off -|
   cards                                     |- in -|
   ================================================================== */

/** How far the blur reaches, in pixels. Two parts merge while the gap
    between them is under about 1.35 of it, which is what sets how late
    the neck snaps. Straight edges hold; corners round by about as much,
    so it is also the most a 22px corner can take. */
const GOO = 12;

/** Room round the parts for the blur to fall off in. */
const PAD = 32;

const SHAPE_IN_MS = 281;
/** The rectangle whole and still, before anything divides it. */
const HOLD_MS = 188;
const PARTS_AT_MS = SHAPE_IN_MS + HOLD_MS;
const PARTS_MS = 706;
const BLUR_OFF_MS = 256;
/* The shape comes back to its true edges over the last stretch of the
   parting, so the parts are already crisp when the cards take over. */
const BLUR_OFF_AT_MS = PARTS_AT_MS + PARTS_MS - 225;
const HANDOVER_AT_MS = PARTS_AT_MS + PARTS_MS;
const HANDOVER_MS = 225;
const TOTAL_MS = HANDOVER_AT_MS + HANDOVER_MS;

/* Out of the middle and into place, with the weight at the front: the
   parting is the whole point and it has to be seen leaving, not arriving. */
const APART_EASE = [0.32, 0.72, 0, 1] as const;
const GROW_EASE = [0.22, 1, 0.36, 1] as const;

type Box = { x: number; y: number; w: number; h: number; radius: string };

/* ================================================================== */

export function useSplitReveal({
  ready,
  goo = GOO,
  selector = "[data-split-target]",
}: {
  /** The opening has handed the page back. Nothing is watched before it. */
  ready: boolean;
  goo?: number;
  selector?: string;
}) {
  const reduce = useReducedMotion() ?? false;
  const host = useRef<HTMLDivElement>(null);
  const [boxes, setBoxes] = useState<Box[] | null>(null);
  const [revealed, setRevealed] = useState(false);
  // Read by the observer, which can fire again before React has
  // re-rendered with the first reading.
  const played = useRef(false);

  useEffect(() => {
    if (!ready || played.current) return;
    const el = host.current;
    if (!el) return;

    if (reduce) {
      played.current = true;
      setRevealed(true);
      return;
    }

    const timers: number[] = [];
    const watch = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || played.current) return;
        played.current = true;
        watch.disconnect();

        const frame = el.getBoundingClientRect();
        const found = [...el.querySelectorAll<HTMLElement>(selector)].map((target) => {
          const box = target.getBoundingClientRect();
          return {
            x: box.left - frame.left,
            y: box.top - frame.top,
            w: box.width,
            h: box.height,
            radius: getComputedStyle(target).borderRadius,
          };
        });

        // Nothing to divide: the cards simply arrive.
        if (found.length < 2) {
          setRevealed(true);
          return;
        }

        setBoxes(found);
        timers.push(window.setTimeout(() => setRevealed(true), HANDOVER_AT_MS));
        timers.push(window.setTimeout(() => setBoxes(null), TOTAL_MS + 60));
      },
      // Once the top of the section has risen into the lower fifth of the
      // screen, which is early enough that the shape is whole before it is
      // properly in view and late enough that none of it is spent offscreen.
      { threshold: 0, rootMargin: "0px 0px -20% 0px" },
    );

    watch.observe(el);
    return () => {
      watch.disconnect();
      timers.forEach(window.clearTimeout);
    };
  }, [ready, reduce, selector]);

  const overlay: ReactNode = boxes ? <Shape boxes={boxes} goo={goo} /> : null;

  return { host, revealed, overlay };
}

/* ================================================================== */

function Shape({ boxes, goo }: { boxes: Box[]; goo: number }) {
  // One filter per reveal: two of them share a page and an id is global.
  const filter = `nv-goo-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const blur = useMotionValue(goo);
  const blurNode = useRef<SVGFEGaussianBlurElement>(null);

  // Written straight to the attribute: an SVG filter primitive is not a
  // style, so there is nothing for Motion to drive on its own.
  useMotionValueEvent(blur, "change", (value) => {
    blurNode.current?.setAttribute("stdDeviation", String(value));
  });

  useEffect(() => {
    // Not quite to zero: the threshold needs a soft edge to cut, or the
    // shape comes back with its antialiasing stripped off.
    const run = animate(blur, 0.4, {
      delay: BLUR_OFF_AT_MS / 1000,
      duration: BLUR_OFF_MS / 1000,
      ease: "easeInOut",
    });
    return () => run.stop();
  }, [blur]);

  // The middle of everything the parts cover: where the one shape stands
  // before it divides, and what it grows out of.
  const left = Math.min(...boxes.map((box) => box.x));
  const top = Math.min(...boxes.map((box) => box.y));
  const right = Math.max(...boxes.map((box) => box.x + box.w));
  const bottom = Math.max(...boxes.map((box) => box.y + box.h));
  const cx = (left + right) / 2;
  const cy = (top + bottom) / 2;

  return (
    <motion.div
      aria-hidden="true"
      data-split-overlay=""
      className="pointer-events-none absolute z-[5]"
      style={{ inset: -PAD }}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 1, 0] }}
      transition={{
        duration: TOTAL_MS / 1000,
        times: [0, SHAPE_IN_MS / TOTAL_MS, HANDOVER_AT_MS / TOTAL_MS, 1],
        ease: ["easeOut", "linear", "easeInOut"],
      }}
    >
      <svg aria-hidden="true" style={{ position: "absolute", width: 0, height: 0 }}>
        <filter id={filter} colorInterpolationFilters="sRGB">
          <feGaussianBlur
            ref={blurNode}
            in="SourceGraphic"
            stdDeviation={goo}
            result="soft"
          />
          {/* Alpha only, and steeply: everything under half opacity is
              dropped and everything over it filled, which is what turns
              two blurred parts into one body with a neck. */}
          <feColorMatrix
            in="soft"
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 26 -13"
          />
        </filter>
      </svg>

      <motion.div
        className="absolute inset-0"
        style={{
          filter: `url(#${filter})`,
          transformOrigin: `${cx + PAD}px ${cy + PAD}px`,
        }}
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: SHAPE_IN_MS / 1000, ease: GROW_EASE }}
      >
        {boxes.map((box, i) => (
          <motion.span
            key={i}
            className="absolute block bg-[#0b0b0b]"
            style={{
              left: box.x + PAD,
              top: box.y + PAD,
              width: box.w,
              height: box.h,
              borderRadius: box.radius,
            }}
            initial={{ x: cx - (box.x + box.w / 2), y: cy - (box.y + box.h / 2) }}
            animate={{ x: 0, y: 0 }}
            transition={{
              delay: PARTS_AT_MS / 1000,
              duration: PARTS_MS / 1000,
              ease: APART_EASE,
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}
