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

   Every answer is taken from what the site says elsewhere (the process,
   the proposal form, the services), user 2026-10-13. No prices: those
   only ever come from the estimate.
   ================================================================== */

const EMAIL = "ola@nevima.pt";

const QUESTIONS = [
  {
    id: "two",
    q: "Are two people really enough for my project?",
    a: "For a business website, a landing page or a new visual identity, yes. Modern tools take the repetitive work off our hands, so our time goes into the decisions that matter. If a project ever needs more hands, we bring in specialists we trust and stay your single point of contact.",
  },
  {
    id: "cost",
    q: "How much does a website cost?",
    a: "It depends on its size, its languages, its forms and the services you add. Fill in our free proposal form and you get an estimate straight away; within a few hours we come back with the exact price, always with the reasoning behind it. Prices are set for Portugal, for Spain and Italy, and for the USA; anywhere else is quoted on request.",
  },
  {
    id: "monthly",
    q: "Will I pay a monthly fee?",
    a: "Not for your website: hosting is free for as long as it is live, and basic SEO comes with it. Only SEO and GEO, which are ongoing work, are paid monthly, and only if you choose them.",
  },
  {
    id: "time",
    q: "How long does a website take?",
    a: "From 4 to 7 working days for a landing page to 12 to 16 for a website of 7 to 10 pages. The count starts once we have all your materials; a new visual identity or a photo shoot comes first. Your estimate gives your own project’s timeline, and if you need it sooner, there is an urgent option at an extra cost.",
  },
  {
    id: "process",
    q: "How does it work, from start to finish?",
    a: "You fill in the form and see your estimate. We send you the exact price, then the contract, and start the moment we have your materials. Once part of the website is built, a call shows you where it is heading; at the end, another lets you approve it. Then it goes live.",
  },
  {
    id: "after",
    q: "What if I need changes after launch?",
    a: "We stay on hand. Changes that take us only a few minutes are never charged; for anything bigger, you get a quote before we start.",
  },
  {
    id: "ai",
    q: "Do you use templates or AI?",
    a: "No templates. Modern tools, AI included, yes: they are a large part of why we are fast. Every design decision and every line that goes live is ours, and reviewed by one of us.",
  },
  {
    id: "languages",
    q: "In which languages can my website be?",
    a: "Portuguese is always included; English and any other language are added to the price. Languages other than Portuguese and English are translated by an AI specialised in translation, with over 95% accuracy, and we always send you the final text so you can point out anything you’d like written differently.",
  },
  {
    id: "domain",
    q: "Do I need my own domain?",
    a: "No. If your business doesn’t have one yet, we include it. If you already have yours, its cost is taken off the final price.",
  },
  {
    id: "seo",
    q: "I already have a website. Can you only do its SEO or GEO?",
    a: "No. SEO, GEO and our other additional services are only offered together with a website we design: they work best on a site built for them from the start. If your current website is what holds you back, a new one is where we start.",
  },
  {
    id: "identity",
    q: "Can I hire you only for a visual identity?",
    a: "No. A visual identity is only offered together with a website: an identity shows its worth where people meet your brand first, which today is almost always your website, so we design the two as one.",
  },
  {
    id: "geo",
    q: "What is GEO?",
    a: "Generative Engine Optimization. More and more people turn to AI to find businesses, and GEO raises the chances of yours appearing in AI recommendations and answers, the way SEO does in search results.",
  },
  {
    id: "photo",
    q: "Where do you do photo shoots?",
    a: "In mainland Portugal only. In some parts of the Porto area and in the rest of the country, travel costs are added. The photos and videos are yours outright, free to use anywhere.",
  },
  {
    id: "where",
    q: "Do you only work with businesses in Porto?",
    a: "No. We are based in Porto and work remotely with businesses in Portugal, Spain, Italy and the USA, and anywhere else on request, in Portuguese or English.",
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
