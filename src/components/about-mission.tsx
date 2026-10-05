"use client";

import { useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ENTER_EASE } from "./enter";
import { Illuminated } from "./services";
import { useSeen } from "./use-seen";

/* ==================================================================
   Mission and vision

   Two pieces hung on a white wall, not side by side but staggered, the
   mission high on the left and the vision lower on the right, the way
   a curator hangs two works that answer each other. Each has its wall
   label over it: what it is on the left, the tense it speaks in on the
   right, on a black hairline drawn in as it is seen.

   Both come from the one idea the studio is built on, leverage: size
   does not decide what a business can do. The mission is that idea
   applied to the client today; the vision is the same idea applied to
   the whole market. The type is lit as the rest of the site's copy is,
   grey to black, so the page reads as one material.
   ================================================================== */

const PIECES = [
  {
    id: "mission",
    label: "Mission",
    tense: "What we do, today",
    text: "Give small and medium businesses a website and a brand that perform like a big agency’s work, built directly by the people they talk to, with the right tools and nothing in between.",
    place: "lg:col-span-8",
  },
  {
    id: "vision",
    label: "Vision",
    tense: "Where it leads",
    text: "A web where how a business shows up depends on the quality of its work, not on the size of its budget or its team.",
    place: "lg:col-span-7 lg:col-start-6 lg:mt-[clamp(4rem,9vw,8.5rem)]",
  },
] as const;

export function AboutMission() {
  return (
    <section
      id="mission"
      aria-labelledby="mission-title"
      className="relative bg-paper pt-(--section-gap)"
    >
      <div className="shell">
        <h2 id="mission-title" className="sr-only">
          Mission and vision
        </h2>
        <div className="grid grid-cols-1 gap-y-20 md:gap-y-24 lg:grid-cols-12 lg:gap-x-4 lg:gap-y-0">
          {PIECES.map((piece, i) => (
            <Piece key={piece.id} piece={piece} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Piece({
  piece,
  index,
}: {
  piece: (typeof PIECES)[number];
  index: number;
}) {
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLElement>(null);
  const seen = useSeen(ref, { threshold: 0.4 });
  const on = seen || reduce;

  return (
    <article ref={ref} aria-labelledby={`${piece.id}-label`} className={piece.place}>
      <div className="flex items-baseline justify-between gap-6 pb-3">
        <motion.h3
          id={`${piece.id}-label`}
          className="mono-label text-ink"
          initial={false}
          animate={{ opacity: on ? 1 : 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <span className="idx-title">{piece.label}</span>
        </motion.h3>
        <motion.p
          className="mono-label text-ash-2"
          initial={false}
          animate={{ opacity: on ? 1 : 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          {piece.tense}
        </motion.p>
      </div>
      <motion.div
        aria-hidden="true"
        className="h-px origin-left bg-ink"
        initial={false}
        animate={{ scaleX: on ? 1 : 0 }}
        transition={{ duration: reduce ? 0 : 1.1, ease: [0.65, 0, 0.35, 1] }}
      />
      <motion.div
        className="mt-7 md:mt-9"
        initial={false}
        animate={{ opacity: on ? 1 : 0, y: on ? 0 : 18 }}
        transition={{ opacity: { duration: 0.42 }, y: { duration: 0.95, ease: ENTER_EASE } }}
      >
        {on && !reduce ? (
          <Illuminated
            text={piece.text}
            delayMs={500 + index * 150}
            reduce={reduce}
            className="svc-copy std-ink abt-ragged abt-piece display"
          />
        ) : (
          <p
            data-lit={reduce ? "true" : undefined}
            className="svc-copy std-ink abt-ragged abt-piece display"
          >
            {piece.text}
          </p>
        )}
      </motion.div>
    </article>
  );
}
