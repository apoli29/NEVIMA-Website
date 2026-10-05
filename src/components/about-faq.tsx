"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { SlideIn } from "./enter";
import { PassLink } from "./floating-nav";
import { Chevron, Illuminated, LIGHT_DELAY_MS } from "./services";
import { useSeen } from "./use-seen";

/* ==================================================================
   FAQ

   The questions a clinic, an agency or an independent professional
   asks before hiring a studio of two: is it enough, how long, how much,
   whose is it, and what the services the home page lists actually
   cover. Answered short and straight, in the voice of the comparison.

   The heading and a way to write in stand on the left, held there while
   the list goes by; the questions hang on the right between hairlines,
   as the services do, with the same "n" toggle that spins a full turn
   on every press. One open at a time, and its answer is lit as the
   service copy is, grey to black.

   Figures here (weeks, prices) are stand-ins for the studio to confirm.
   ================================================================== */

const EMAIL = "ola@nevima.pt";

const QUESTIONS = [
  {
    id: "two",
    q: "Are two people really enough for my project?",
    a: "For a business website, a landing page or a new visual identity, yes. Modern tools take the repetitive work off our hands, so our time goes into the decisions that matter. If a project ever needs more hands, we bring in specialists we trust and stay your single point of contact.",
  },
  {
    id: "time",
    q: "How long does a website take?",
    a: "Most websites go live four to six weeks after the first call. The launch date is fixed in the proposal, not loosely estimated, and it only moves if the scope does.",
  },
  {
    id: "cost",
    q: "How much does it cost?",
    a: "Websites start at €1,900, and a website with a new visual identity at €3,900. Every project gets a fixed quote after the first conversation, so you know the full price before anything starts.",
  },
  {
    id: "ai",
    q: "Do you use templates or AI?",
    a: "No templates. Modern tools, AI included, yes: they are a large part of why we are fast. Every design decision and every line that goes live is ours, and reviewed by one of us.",
  },
  {
    id: "own",
    q: "Will the website be mine?",
    a: "Yes. Domain, code, files and access are in your name from day one, and we show you how to edit your own content. You are never locked in with us.",
  },
  {
    id: "seo",
    q: "I already have a website. Can you only do its SEO or GEO?",
    a: "Yes. SEO and GEO are the two services we also take on for websites we didn’t build. We start with an audit and tell you honestly whether the website itself is what holds you back.",
  },
  {
    id: "identity",
    q: "Can I hire you only for a visual identity?",
    a: "No. A visual identity is only offered together with a website: an identity shows its worth where people meet your brand first, which today is almost always your website, so we design the two as one.",
  },
  {
    id: "geo",
    q: "What is GEO?",
    a: "Generative Engine Optimization. More and more people ask AI tools for recommendations, and GEO works on getting your business named as a source in those answers, the way SEO works on search results.",
  },
  {
    id: "where",
    q: "Do you only work with businesses in Porto?",
    a: "No. We are based in Porto and work remotely with clients anywhere, in Portuguese or English.",
  },
] as const;

export function AboutFaq() {
  const reduce = useReducedMotion() ?? false;
  const [open, setOpen] = useState<string | null>(null);
  const list = useRef<HTMLUListElement>(null);
  const seen = useSeen(list, { threshold: 0.1 });

  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="relative bg-paper pt-(--section-gap) pb-28 md:pb-40"
    >
      <div className="shell grid grid-cols-1 gap-y-12 lg:grid-cols-12 lg:gap-x-4">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-32">
            <SlideIn ready>
              <h2
                id="faq-title"
                // A size down from the other titles: it has a third of the
                // shell, and "Straight answers." has to hold on one line.
                className="display text-[clamp(2.25rem,3.4vw,3.5rem)] text-ink"
              >
                <span className="block font-light">Questions.</span>
                <span className="block font-medium">Straight answers.</span>
              </h2>
            </SlideIn>
            <SlideIn ready delay={0.12} distance={0}>
              <p className="mt-5 max-w-[20rem] text-[0.9375rem] leading-[1.45] text-balance text-ash md:mt-6">
                Can&rsquo;t find yours? Write to us and one of the two of us
                will answer, usually the same day.
              </p>
              <div className="mt-7 md:mt-8">
                <PassLink
                  href={`mailto:${EMAIL}`}
                  label={
                    <>
                      Ask us
                      <span aria-hidden="true" className="ml-2.5 inline-block">
                        &rarr;
                      </span>
                    </>
                  }
                  className="cta-drop inline-flex text-[1rem] leading-none"
                />
              </div>
            </SlideIn>
          </div>
        </div>

        <ul
          ref={list}
          data-open={open ? "" : undefined}
          className="xs-list border-t border-ink lg:col-span-8 lg:col-start-5"
        >
          {QUESTIONS.map((item, i) => (
            <Question
              key={item.id}
              item={item}
              index={i}
              open={open === item.id}
              seen={seen}
              reduce={reduce}
              onToggle={() => setOpen((was) => (was === item.id ? null : item.id))}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}

function Question({
  item,
  index,
  open,
  seen,
  reduce,
  onToggle,
}: {
  item: (typeof QUESTIONS)[number];
  index: number;
  open: boolean;
  seen: boolean;
  reduce: boolean;
  onToggle: () => void;
}) {
  const headId = `faq-${item.id}-q`;
  const bodyId = `faq-${item.id}`;
  const [turns, setTurns] = useState(0);
  const [opened, setOpened] = useState(0);
  const on = seen || reduce;

  return (
    <motion.li
      data-open={open ? "" : undefined}
      className="xs-row border-b border-ink/25"
      initial={false}
      animate={{ opacity: on ? 1 : 0, y: on ? 0 : 12 }}
      transition={{ duration: reduce ? 0 : 0.6, delay: 0.05 + index * 0.05, ease: [0.22, 1, 0.36, 1] }}
    >
      <h3>
        <button
          type="button"
          id={headId}
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={() => {
            setTurns((n) => n + 1);
            if (!open) setOpened((n) => n + 1);
            onToggle();
          }}
          className="xs-head grid w-full grid-cols-[1fr_auto] items-center gap-x-6 py-5 text-left md:py-6"
        >
          <span className="xs-name display block text-[clamp(1.25rem,1.75vw,1.625rem)] leading-[1.15] font-normal tracking-[-0.02em] text-ink">
            {item.q}
          </span>
          <Chevron open={open} turns={turns} reduce={reduce} />
        </button>
      </h3>
      <div
        id={bodyId}
        role="region"
        aria-labelledby={headId}
        data-open={open}
        inert={!open}
        className="xs-panel"
      >
        <div>
          <div className="pr-0 pb-8 md:pr-[4.5rem] md:pb-9">
            {open && !reduce ? (
              <Illuminated
                key={opened}
                text={item.a}
                delayMs={LIGHT_DELAY_MS * 0.6}
                reduce={reduce}
                className="svc-copy std-ink abt-ragged abt-answer"
              />
            ) : (
              <p data-lit="true" className="svc-copy std-ink abt-ragged abt-answer">
                {item.a}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.li>
  );
}
