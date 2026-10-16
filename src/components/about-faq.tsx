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

   The questions are the studio's own list (user, 2026-10-16), the
   answers the studio's where it gave them and otherwise taken from what
   the site says elsewhere (the process, the proposal form, the services).
   No prices: those only ever come from the estimate. Some answers carry
   more than words: a run of steps with arrows, points, or a way on (the
   proposal form, or How we work on the home page, where the step that
   answers the question blinks).
   ================================================================== */

const EMAIL = "ola@nevima.pt";

type Question = {
  id: string;
  q: string;
  /** The answer's words, lit as the service copy is. */
  a?: string;
  /** A short run of steps, set with arrows between them. */
  flow?: readonly string[];
  /** Points, each with an optional lead in bold. */
  list?: readonly { lead?: string; text: string }[];
  /** Where to go next: a page, or a place on the home page. */
  link?: { label: string; href: string };
};

const QUESTIONS: readonly Question[] = [
  {
    id: "process",
    q: "How does it work, from start to finish?",
    a: "In short, from the first form to launch:",
    flow: [
      "Form and estimate",
      "Exact price",
      "Contract",
      "Your materials",
      "Production",
      "Feedback call",
      "Final approval",
      "Launch",
    ],
    link: { label: "See every step in How we work", href: "/#process" },
  },
  {
    id: "why",
    q: "Why should I choose you over other studios?",
    list: [
      { text: "You always talk directly to the two people doing the work." },
      { text: "A price estimate from the start, and the reasoning behind the exact price." },
      { text: "No monthly hosting fee, and basic SEO included." },
      { text: "Fast: from 4 working days for a one-page website." },
      { text: "Cutting-edge tools, for better results at lower prices." },
      { text: "We take care of the logistics: domain, hosting, legal pages and trademark." },
    ],
  },
  {
    id: "cost",
    q: "How much does a website cost?",
    a: "It depends on its size, its languages, its forms and the services you add. Fill in our free proposal form and you get an estimate straight away; within a few hours we come back with the exact price, always with the reasoning behind it. Prices are set for Portugal, for Spain and Italy, and for the USA; anywhere else is quoted on request.",
    link: { label: "Get your free proposal", href: "/#proposal" },
  },
  {
    id: "reply",
    q: "How soon do you reply once I\u2019ve filled in the form?",
    a: "Within a few hours, with the exact price for your project and the reasoning behind it.",
  },
  {
    id: "time",
    q: "How long does a website take?",
    a: "It depends on your project, so after the form we always give you a personalised timeline. As a rule, it takes no more than 18 to 20 working days, from the start to the final presentation. It may take longer if you add more services.",
  },
  {
    id: "start",
    q: "When do you start, and when are you done?",
    a: "We start the moment we have the signed contract and all your materials. We\u2019re done once you\u2019ve approved the finished website in our final call and it\u2019s live. Even then, we stay on hand for whatever you need.",
  },
  {
    id: "logistics",
    q: "What do I need to take care of, and what does Nevima do for me?",
    list: [
      {
        lead: "You:",
        text: "your materials (the photos you already have, your logo and symbol) and the content of your legal pages, which the law requires your business to produce itself.",
      },
      {
        lead: "Us:",
        text: "everything else. That means your domain (registered, or the one you have connected), hosting, putting the legal pages on your website and, if applicable, registering your trademark together with you.",
      },
    ],
  },
  {
    id: "hosting",
    q: "Is hosting really free?",
    a: "Yes. Hosting costs you nothing for as long as your website is live with us.",
  },
  {
    id: "monthly",
    q: "Will I pay a monthly fee?",
    a: "Not for your website: hosting is free for as long as it is live, and basic SEO comes with it. Only SEO and GEO, which are ongoing work, are paid monthly, and only if you choose them.",
  },
  {
    id: "domain",
    q: "Do I need my own domain?",
    a: "Yes, every website needs one. If your business doesn\u2019t have one yet, we include it. If you already have yours, its cost is taken off the final price.",
  },
  {
    id: "changes",
    q: "What if I want changes?",
    a: "Changes that take us only a few minutes are never charged; for anything bigger, you get a quote before we start. To keep changes to a minimum, we give you a free call once part of your website is built: you see where it\u2019s heading, and whatever your feedback calls for, we adjust before we finish.",
    link: { label: "See it in How we work", href: "/#process-strategy" },
  },
  {
    id: "ai",
    q: "Do you use AI?",
    a: "Yes, AI is part of our process. As the technology has moved forward, it has become an essential tool in our field, making the process faster and giving you more for your money.",
  },
  {
    id: "ai-quality",
    q: "If you use AI, doesn\u2019t that make your service worse?",
    a: "No. AI takes the repetitive work off our hands, so our time goes into the decisions that matter. Every design decision and every line that goes live is ours and reviewed by one of us, and you see the work and give your feedback before anything is launched.",
  },
  {
    id: "seo-geo",
    q: "What are SEO and GEO?",
    a: "SEO (Search Engine Optimization) is what gets a website to the highest positions it can reach in its audience\u2019s searches: with poorly worked SEO, a website disappears into the last pages of results; with SEO made for it, it reaches the first. GEO (Generative Engine Optimization) does the same for AI: more and more people turn to AI to find businesses, and GEO raises the chances of yours appearing in its recommendations and answers. Basic SEO comes with every website we design.",
  },
  {
    id: "extras",
    q: "Do you offer the additional services on their own?",
    a: "As a rule, no: they come together with a website we design. But get in touch and tell us what you need.",
  },
  {
    id: "countries",
    q: "Which countries do you work with?",
    a: "Right now, our priorities are Portugal, Spain, Italy and the USA. If you\u2019re in another country and interested, get in touch.",
  },
  {
    id: "languages",
    q: "In which languages can my website be?",
    a: "Portuguese is always included; English and any other language are added to the price. Languages other than Portuguese and English are translated by an AI specialised in translation, with over 95% accuracy, and we always send you the final text so you can point out anything you\u2019d like written differently.",
  },
];

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
  item: Question;
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
            {item.a &&
              (open && !reduce ? (
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
              ))}
            {(item.flow || item.list || item.link) && (
              // Comes in once the words are lit, each time it is opened.
              <div key={opened} className={`faq-more ${item.a ? "mt-5" : ""}`}>
                {item.flow && (
                  <ol className="faq-flow abt-answer">
                    {item.flow.map((step) => (
                      <li key={step}>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                )}
                {item.list && (
                  <ul className="faq-list abt-answer">
                    {item.list.map((point) => (
                      <li key={point.text}>
                        {point.lead && <strong className="font-medium">{point.lead} </strong>}
                        {point.text}
                      </li>
                    ))}
                  </ul>
                )}
                {item.link && (
                  <div className={item.flow || item.list ? "mt-7" : ""}>
                    <PassLink
                      href={item.link.href}
                      label={
                        <>
                          {item.link.label}
                          <span aria-hidden="true" className="ml-2.5 inline-block">
                            &rarr;
                          </span>
                        </>
                      }
                      className="cta-drop inline-flex text-[0.9375rem] leading-none"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.li>
  );
}
