"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { SlideIn } from "./enter";
import { useInkAlign } from "./ink-align";

/* ==================================================================
   How we work

   Five stages, but what each one is headed with is a principle, not a
   task: the studio's way of working is the point, and the time a stage
   takes and what the client has at the end of it are the small print,
   in mono, under the words.

   The stages run sideways (the user's ask, 2026-10-06; this section
   once ran down the about page). The section holds still on the screen
   while it is read, and scrolling down slides the row of stages along
   from right to left instead of moving the page; once the last stage
   is in, the page carries on. A black rail runs over the row and fills
   from the left as it slides, with a stop at each stage that is filled
   in once it has been reached: the order is shown that way, rather than
   by numbers on the headings. Each stage stands in a column ruled off
   from the next by a hairline, the way the index is ruled, its name in
   white on the black marker the index's own label wears.
   ================================================================== */

const STAGES = [
  {
    id: "conversation",
    stage: "Conversation",
    principle: "Listen before we design.",
    text: "It starts with a call, not a pitch. We learn how your business works, who it serves and what the website really has to do. If a new website isn’t the answer, we’ll tell you.",
    time: "45 minutes",
    gets: "An honest diagnosis",
  },
  {
    id: "direction",
    stage: "Direction",
    principle: "One direction, argued.",
    text: "We come back with a single proposal for structure and look, with the reasoning behind every choice. Not three options for you to pick from blindly.",
    time: "Week 1",
    gets: "Sitemap and visual direction",
  },
  {
    id: "build",
    stage: "Build",
    principle: "Build in the open.",
    text: "Design and code move together. You follow a live link that changes as we work, and your feedback goes straight to the person making the change.",
    time: "Weeks 2 to 4",
    gets: "A live preview, every day",
  },
  {
    id: "launch",
    stage: "Launch",
    principle: "Launch ready to be found.",
    text: "Domain, SEO and GEO foundations, analytics, and a walk-through so you can edit your own content. Everything is yours: files, code and access.",
    time: "Week 5",
    gets: "The keys to everything",
  },
  {
    id: "after",
    stage: "Follow-up",
    principle: "Stay close after.",
    text: "A month after launch we come back with the first numbers and what we would improve next. Ongoing support is there if you want it, never a condition.",
    time: "Week 9",
    gets: "A first-results report",
  },
] as const;


/** Scrolled pixels per pixel slid: a little more than one, so the row
    moves a touch slower than the page would (the user's ask). */
const SLOW = 1.6;

/* Measured before the first paint in the browser; the server has no
   layout to measure. */
const useIsomorphicLayout = typeof window === "undefined" ? useEffect : useLayoutEffect;

export function Process({ ready }: { ready: boolean }) {
  const reduce = useReducedMotion() ?? false;
  const section = useRef<HTMLElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLOListElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  useInkAlign(titleRef, subRef);

  // How far the row has to travel to bring its last stage in: the extra
  // height the section is given, so one pixel scrolled is one pixel slid.
  const [travel, setTravel] = useState(0);
  useIsomorphicLayout(() => {
    const measure = () => {
      const t = track.current;
      const v = viewport.current;
      if (!t || !v) return;
      // The row starts after the viewport's left padding (the shell's
      // edge), so that much less of the viewport is there to show it.
      const lead = parseFloat(getComputedStyle(v).paddingLeft) || 0;
      setTravel(Math.max(0, Math.ceil(t.scrollWidth - (v.clientWidth - lead))));
    };
    measure();
    const watch = new ResizeObserver(measure);
    if (track.current) watch.observe(track.current);
    if (viewport.current) watch.observe(viewport.current);
    document.fonts?.ready.then(measure);
    return () => watch.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -travel]);

  // Which stages the rail has reached.
  const [reached, setReached] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    // Stop i sits i fifths of the way along the rail.
    const n = Math.min(STAGES.length, Math.floor(p * STAGES.length + 1e-4) + 1);
    setReached((was) => (was === n ? was : n));
  });

  return (
    <section
      ref={section}
      id="how-we-work"
      aria-labelledby="process-title"
      className="relative z-10 bg-paper"
      style={{ height: `calc(100svh + ${Math.round(travel * SLOW)}px)` }}
    >
      {/* The heading and the row as one block, held in the middle of the
          screen under the bar, the row close under the heading. */}
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden pt-[clamp(5.5rem,11svh,7rem)] pb-[clamp(1.5rem,4svh,3rem)]">
        <div className="shell">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
            <SlideIn ready={ready}>
              <h2
                ref={titleRef}
                id="process-title"
                className="display text-[clamp(2.25rem,4.2vw,4.25rem)] text-ink"
              >
                <span className="block font-light">How we work.</span>
                <span className="block font-medium">A short process, on purpose.</span>
              </h2>
            </SlideIn>
            <SlideIn ready={ready} from="right" delay={0.12} className="max-w-[19rem] shrink-0 lg:text-right">
              <p ref={subRef} className="text-[0.9375rem] leading-[1.45] text-balance text-ash">
                It all comes down to one idea: take out everything that
                doesn&rsquo;t move your project forward, and keep you close to
                everything that does.
              </p>
            </SlideIn>
          </div>
        </div>

        {/* The row, set against the shell's left edge and free to run past
            the right edge of the screen; it is slid, not scrolled. */}
        <div ref={viewport} className="prc-viewport mt-[clamp(2.5rem,7svh,4.5rem)]">
          <motion.ol
            ref={track}
            className="prc-track"
            style={{ x: reduce ? 0 : x }}
          >
            {/* The rail over the row: grey for the way still to go, black
                for the way come. */}
            <span aria-hidden="true" className="prc-rail" />
            <motion.span
              aria-hidden="true"
              className="prc-rail prc-rail-fill"
              style={{ scaleX: reduce ? 1 : scrollYProgress }}
            />
            {STAGES.map((stage, i) => (
              <li key={stage.id} aria-labelledby={`stage-${stage.id}`} className="prc-stage">
                <span
                  aria-hidden="true"
                  data-on={reduce || i < reached ? "" : undefined}
                  className="abt-stop prc-stop"
                />
                <p className="mono-label flex">
                  <span className="idx-title">{stage.stage}</span>
                  <span className="sr-only">
                    , stage {i + 1} of {STAGES.length}
                  </span>
                </p>
                <h3
                  id={`stage-${stage.id}`}
                  className="display mt-4 text-[clamp(1.625rem,2.4vw,2.375rem)] leading-[1.02] font-light text-ink md:mt-5"
                >
                  {stage.principle}
                </h3>
                <p className="mt-4 mb-6 text-[clamp(0.9375rem,1.05vw,1.0625rem)] leading-[1.5] text-pretty text-ash md:mt-5">
                  {stage.text}
                </p>
                <dl className="mt-auto grid grid-cols-2 gap-x-4 border-t border-ink/15 pt-3">
                  <div>
                    <dt className="mono-label text-ash-2">Takes</dt>
                    <dd className="mono-label mt-1 text-ink">{stage.time}</dd>
                  </div>
                  <div>
                    <dt className="mono-label text-ash-2">You get</dt>
                    <dd className="mono-label mt-1 text-ink">{stage.gets}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </motion.ol>
        </div>
      </div>
    </section>
  );
}
