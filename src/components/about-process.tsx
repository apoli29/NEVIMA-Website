"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import { SlideIn } from "./enter";
import { useInkAlign } from "./ink-align";
import { useSeen } from "./use-seen";

/* ==================================================================
   How we work

   Five stages, but what each one is headed with is a principle, not a
   task: the studio's way of working is the point, and the time a stage
   takes and what the client has at the end of it are the small print,
   in mono, under the words.

   The stages are a sequence, so the order is shown, by a black rail down
   the left that fills as the reader goes down the page, a stop on it at
   each stage, rather than by numbers on the headings. Each stage hangs
   between hairlines, the way the home page's index does: its name in
   the gallery's label face, the principle in the title face, the words
   and the small print beside it.
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

export function AboutProcess() {
  const reduce = useReducedMotion() ?? false;
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const list = useRef<HTMLOListElement>(null);
  useInkAlign(titleRef, subRef);

  // The rail fills from the first stage's top to the last stage's,
  // with the middle of the screen as the reading line.
  const { scrollYProgress } = useScroll({ target: list, offset: ["start 55%", "end 55%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });

  return (
    <section
      id="how-we-work"
      aria-labelledby="process-title"
      className="relative bg-paper pt-(--section-gap)"
    >
      <div className="shell">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
          <SlideIn ready>
            <h2
              ref={titleRef}
              id="process-title"
              className="display text-[clamp(2.25rem,4.2vw,4.25rem)] text-ink"
            >
              <span className="block font-light">How we work.</span>
              <span className="block font-medium">A short process, on purpose.</span>
            </h2>
          </SlideIn>
          <SlideIn ready from="right" delay={0.12} className="max-w-[19rem] shrink-0 lg:text-right">
            <p ref={subRef} className="text-[0.9375rem] leading-[1.45] text-balance text-ash">
              It all comes down to one idea: take out everything that
              doesn&rsquo;t move your project forward, and keep you close to
              everything that does.
            </p>
          </SlideIn>
        </div>

        <div className="relative mt-14 md:mt-20">
          {/* The rail: grey for the way still to go, black for the way come. */}
          <span
            aria-hidden="true"
            className="absolute top-0 bottom-0 left-[3px] w-px bg-ink/15 md:left-[5px]"
          />
          <motion.span
            aria-hidden="true"
            className="absolute top-0 bottom-0 left-[3px] w-px origin-top bg-ink md:left-[5px]"
            style={{ scaleY: reduce ? 1 : fill }}
          />
          <ol ref={list} className="border-t border-ink">
            {STAGES.map((s, i) => (
              <Stage key={s.id} stage={s} index={i} reduce={reduce} />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function Stage({
  stage,
  index,
  reduce,
}: {
  stage: (typeof STAGES)[number];
  index: number;
  reduce: boolean;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const seen = useSeen(ref, { threshold: 0.45 });
  const on = seen || reduce;
  const fade = (delay: number) => ({
    initial: false as const,
    animate: { opacity: on ? 1 : 0, y: on ? 0 : 14 },
    transition: { duration: reduce ? 0 : 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <li
      ref={ref}
      aria-labelledby={`stage-${stage.id}`}
      className="relative grid grid-cols-1 gap-y-4 border-b border-ink/25 py-9 pl-8 md:grid-cols-12 md:gap-x-4 md:py-12 md:pl-10 lg:pl-0"
    >
      {/* The stage's stop on the rail: hollow until it has been reached. */}
      <span
        aria-hidden="true"
        data-on={on ? "" : undefined}
        className="abt-stop absolute top-[2.6rem] left-0 md:top-[3.4rem]"
      />

      <motion.p
        {...fade(0)}
        className="mono-label pt-[0.35em] text-ash-2 md:col-span-3 md:pl-0 lg:col-span-3 lg:pl-10"
      >
        {stage.stage}
        {/* Read as a position in the sequence, not as a title. */}
        <span className="sr-only">, stage {index + 1} of {STAGES.length}</span>
      </motion.p>

      <motion.h3
        {...fade(0.08)}
        id={`stage-${stage.id}`}
        className="display text-[clamp(1.75rem,2.6vw,2.5rem)] leading-[1.02] font-light text-ink md:col-span-9 lg:col-span-4"
      >
        {stage.principle}
      </motion.h3>

      <motion.div {...fade(0.16)} className="md:col-span-9 md:col-start-4 lg:col-span-5 lg:col-start-8">
        <p className="text-[clamp(1rem,1.15vw,1.125rem)] leading-[1.5] text-pretty text-ash">
          {stage.text}
        </p>
        <dl className="mt-5 grid grid-cols-2 gap-x-4 border-t border-ink/15 pt-3">
          <div>
            <dt className="mono-label text-ash-2">Takes</dt>
            <dd className="mono-label mt-1 text-ink">{stage.time}</dd>
          </div>
          <div>
            <dt className="mono-label text-ash-2">You get</dt>
            <dd className="mono-label mt-1 text-ink">{stage.gets}</dd>
          </div>
        </dl>
      </motion.div>
    </li>
  );
}
