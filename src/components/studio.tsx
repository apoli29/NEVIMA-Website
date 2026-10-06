"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ENTER_EASE } from "./enter";
import { PassLink } from "./floating-nav";
import { Illuminated } from "./services";

/* ==================================================================
   Studio

   The section has no title. It opens on a statement set straight on
   the page, two thirds of the shell wide from its left edge, with the
   pillar beside it from lg. The co-founders once hung underneath; on
   2026-10-06 the user moved them to the about page (see
   cofounders.tsx).

   The statement is one sentence in two parts, and the two come in from
   the edges they are set against, towards each other. The first is set
   large and black on the page. The second is smaller, and everything
   after the colon it turns on is run through with a black marker and
   comes back out of it in white: the answer is the one thing on the page
   set out of the ink rather than in it.

   The copy is the service copy turned over for the page, lit rather
   than faded in, so the sections read as one material.
   ================================================================== */

const STATEMENT =
  "Nevima was born from two young people who share a fascination with web development, a field that is part of their academic background.";

/* The pillar, up to and including the colon it turns on. */
const PILLAR =
  "Our pillar is efficiency, because we produce elite results without needing long execution times. The secret is simple:";

/* And what follows it, which is run through with a black marker. */
const PILLAR_MARK = "the know-how we have and the use of the right tools.";

/** How far out of the shell each half of the statement starts, in pixels. */
const ENTER_SHIFT = 56;

/* The light runs down the copy as one read: the pillar picks it up before
   the last line of the statement has finished. */
const STATEMENT_LIGHT_MS = 150;
const PILLAR_LIGHT_MS = 1200;

/* ================================================================== */

export function Studio({ ready }: { ready: boolean }) {
  return (
    <section
      id="studio"
      aria-labelledby="studio-title"
      // No foot padding: the services section below brings its own head
      // room, and the two together would open a gap twice the rhythm. One
      // layer above the services, though: the "Learn more" drop's glass and
      // shadow reach past the foot of this section, and the services'
      // ground, painted after it, was cutting them off.
      className="relative z-[11] bg-paper pt-(--section-gap)"
    >
      <div className="shell">
        <h2 id="studio-title" className="sr-only">
          About Nevima
        </h2>

        <div className="std-wrap flex flex-col gap-11 md:gap-16">
          <Statement ready={ready} />
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/* Statement                                                           */
/* ================================================================== */

function Statement({ ready }: { ready: boolean }) {
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);

  // While the opening plays its stage is fixed and takes no room, so this
  // copy sits at the top of the page right behind the curtain: watched from
  // the start, the light would run where nobody can see it. The watch only
  // begins once the page has been handed back.
  useEffect(() => {
    if (!ready || seen) return;
    const copy = ref.current;
    if (!copy) return;
    const watch = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setSeen(true);
      },
      { threshold: 0.45 },
    );
    watch.observe(copy);
    return () => watch.disconnect();
  }, [ready, seen]);

  const lit = seen || reduce;
  // Each half comes in from the edge it is set against and travels inwards,
  // so the sentence closes on itself. The fade is spent in the first third
  // and the slide carries on under it; the light follows once both have
  // arrived.
  const enter = (from: -1 | 1) => ({
    initial: false as const,
    animate: {
      opacity: lit ? 1 : 0,
      x: lit || reduce ? 0 : from * ENTER_SHIFT,
    },
    transition: {
      opacity: { duration: 0.42, ease: "easeOut" as const },
      x: { duration: 0.95, ease: ENTER_EASE },
    },
  });

  return (
    // From lg the pillar stands beside the statement rather than under it
    // (see .std-lede).
    <div ref={ref} className="std-lede">
      {/* The measure the statement is sized from (see .std-statement). */}
      <motion.div className="std-copy std-measure" {...enter(-1)}>
        <LitCopy
          lit={lit}
          reduce={reduce}
          delayMs={STATEMENT_LIGHT_MS}
          text={STATEMENT}
          className="svc-copy std-ink std-statement"
        />
      </motion.div>
      {/* The second half, smaller, with everything after the colon run
          through with a black marker: the answer the sentence has been
          building to is the only thing on the page set out of black rather
          than in it. */}
      <motion.div className="std-pillar-col" {...enter(1)}>
        <LitCopy
          lit={lit}
          reduce={reduce}
          delayMs={PILLAR_LIGHT_MS}
          text={PILLAR}
          mark={PILLAR_MARK}
          className="svc-copy std-ink std-pillar"
        />
        <LearnMore />
      </motion.div>
    </div>
  );
}

/* An invitation under the pillar: one black drop, the same glass as the
   site's other buttons, reading "Learn more about us" in one weight, one
   run of words, with an arrow. It once split the line in two (the plain
   words beside a heavier link) and the gap and the change of weight
   between them read as mistakes; it is all one link now, to the about
   page. */
function LearnMore() {
  return (
    <div className="mt-3 md:mt-4">
      <PassLink
        href="/about"
        label={
          <>
            Learn more about us
            <span aria-hidden="true" className="ml-2 inline-block">
              &rarr;
            </span>
          </>
        }
        className="cta-drop inline-flex text-[0.875rem] leading-none md:text-[0.9375rem]"
      />
    </div>
  );
}

/* Grey and plain until the copy has been seen. Illuminated reads its lines
   back from the layout the moment it mounts, so it is only mounted once that
   layout is the one the reader gets: before the opening hands the page back
   there is no scrollbar yet, and every measured line would be a little too
   long for the page that follows. */
function LitCopy({
  lit,
  text,
  mark,
  delayMs,
  reduce,
  className,
}: {
  lit: boolean;
  text: string;
  mark?: string;
  delayMs: number;
  reduce: boolean;
  className: string;
}) {
  if (!lit)
    return (
      <p className={className}>
        {text}
        {mark ? " " : null}
        {mark && <mark>{mark}</mark>}
      </p>
    );
  return (
    <Illuminated
      text={text}
      mark={mark}
      delayMs={delayMs}
      reduce={reduce}
      className={className}
    />
  );
}
