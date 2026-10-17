"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { SlideIn } from "./enter";
import { PassLink } from "./floating-nav";
import { useProposal } from "./proposal-flow";
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
  /** Where to go next: a page, a place on the home page, or the
      free-proposal form, opened here out of the button. */
  link?: { label: string; href: string } | { label: string; proposal: true };
};

const QUESTIONS: readonly Question[] = [
  {
    id: "process",
    q: "How does it work, from start to finish?",
    a: "We explain our whole process from the very start. In short, it goes like this:",
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
    link: { label: "See each step in How we work", href: "/#process" },
  },
  {
    id: "why",
    q: "Why should I choose your services over others?",
    list: [
      { lead: "Direct contact:", text: "you always speak with the two people actually doing the work." },
      { lead: "Transparency:", text: "a price estimate from the very start, and the reasoning behind every exact price we send." },
      { lead: "No hidden costs:", text: "hosting at no cost for as long as your website is live, and basic SEO always included." },
      { lead: "Speed:", text: "websites delivered from 4 working days, without compromising quality." },
      { lead: "Cutting-edge:", text: "the most modern tools and know-how, which deliver better results at lower prices." },
      { lead: "Peace of mind:", text: "we take care of the logistics for you, from the domain and hosting to the legal pages and registering your trademark." },
    ],
  },
  {
    id: "cost",
    q: "How much does a website cost?",
    a: "It depends on your project: its size, its languages, its forms and any additional services you choose. That\u2019s why our free proposal form gives you an estimate straight away, and within a few hours we come back with the exact price, always explaining how we got there. Prices are set for Portugal, for Spain and Italy, and for the USA; for any other country, we quote on request.",
    link: { label: "Get your free proposal", proposal: true },
  },
  {
    id: "reply",
    q: "How soon will you reply after I fill in the form?",
    a: "Within a few hours. We go through your answers and send you the exact price for your project, along with the reasoning behind it.",
  },
  {
    id: "time",
    q: "How long does a website take?",
    a: "It depends on each project, which is why, once you fill in the form, we always give you a personalized timeline. As a rule, the whole process, from the start to the final presentation, takes no more than 18 to 20 working days. It can take longer if you add more services.",
  },
  {
    id: "start",
    q: "When does the service start, and when does it end?",
    a: "We start the moment we have the signed contract and all your materials in hand. The project is complete once you approve the final website in our last call and it goes live. Even so, our support doesn\u2019t end there: we stay on hand for whatever you need.",
  },
  {
    id: "logistics",
    q: "What do I need to handle logistically, and what does Nevima do for me?",
    list: [
      {
        lead: "You:",
        text: "your materials (the photos you already have of your business, your logo and symbol) and the content of your legal pages, which by law must be produced by your business itself.",
      },
      {
        lead: "Us:",
        text: "everything else. That means registering your domain (or connecting the one you already have), hosting your website, putting the legal pages on it and, if applicable, registering your trademark together with you.",
      },
    ],
  },
  {
    id: "hosting",
    q: "Is hosting really free?",
    a: "Yes. We don\u2019t charge you for hosting: it\u2019s free for as long as your website is live with us.",
  },
  {
    id: "monthly",
    q: "Will I pay a monthly fee?",
    a: "Not for your website: hosting is free for as long as it is live, and basic SEO is already included. The only services paid monthly are SEO and GEO, because they are ongoing work, and only if you choose them.",
  },
  {
    id: "domain",
    q: "Do I need my own domain?",
    a: "Yes, every website needs one. If your business doesn\u2019t have one yet, it\u2019s included in our service; if you already have one, we take its cost off the final price.",
  },
  {
    id: "changes",
    q: "How does it work if I want changes?",
    a: "Changes that take us only a few minutes are never charged. For anything bigger, we always agree the price with you before we start. Better still, our process is designed to avoid them: once part of your website is built, we book a free call to show you where it\u2019s heading, and we adjust whatever your feedback calls for. The result? A website made to your taste, far less likely to need changes.",
    link: { label: "See it in How we work", href: "/#process-strategy" },
  },
  {
    id: "ai",
    q: "Do you use AI?",
    a: "Yes, we use AI in our process. As the technology has advanced, it has become an essential tool in our field, boosting both the speed of the process and its value for money.",
  },
  {
    id: "ai-quality",
    q: "If you use AI, doesn\u2019t that lower the quality of your service?",
    a: "No. AI takes the repetitive work off our hands, so our time goes into the decisions that really matter. Every design decision and every line that goes live is ours and reviewed by one of us, and you see the work and give your feedback before anything is launched.",
  },
  {
    id: "seo-geo",
    q: "What are SEO and GEO?",
    a: "SEO (Search Engine Optimization) is what gets a website to the highest positions it can reach in its audience\u2019s searches. A website with poorly worked SEO disappears into the last pages of results, while personalized SEO reaches the first ones. GEO (Generative Engine Optimization) does the same for AI: more and more people turn to it to find businesses, and GEO raises the chances of yours appearing in its recommendations and answers. Basic SEO is included in every website we design.",
  },
  {
    id: "extras",
    q: "Do you offer the additional services separately?",
    a: "As a rule, no: like all our additional services, they are offered together with a website we design. Still, if you have a specific need, get in touch and tell us about it.",
  },
  {
    id: "countries",
    q: "Which countries do you work with?",
    a: "At the moment, our priorities are Portugal, Spain, Italy and the USA. If your business is in another country and you\u2019re interested in working with us, get in touch.",
  },
  {
    id: "languages",
    q: "Which languages can my website be in?",
    a: "Portuguese is always included; English and any other language are added to the price. Languages other than Portuguese and English are translated by an AI specialized in translation, with over 95% accuracy, and we always send you the final text so you can point out anything you\u2019d like written differently.",
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
                    {"proposal" in item.link ? (
                      <ProposalAsk label={item.link.label} />
                    ) : (
                      <PassLink
                        href={item.link.href}
                        label={<Arrowed>{item.link.label}</Arrowed>}
                        className="cta-drop inline-flex text-[0.9375rem] leading-none"
                      />
                    )}
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

function Arrowed({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <span aria-hidden="true" className="ml-2.5 inline-block">
        &rarr;
      </span>
    </>
  );
}

/* "Get your free proposal": the form opens on this page, grown out of
   this button, which keeps its place unseen while the form is out. With
   no form on the page, it goes to the home page's. */
function ProposalAsk({ label }: { label: string }) {
  const proposal = useProposal();
  const button = useRef<HTMLButtonElement>(null);
  const [launched, setLaunched] = useState(false);
  const present = proposal?.present ?? false;
  useEffect(() => {
    if (!present) setLaunched(false);
  }, [present]);
  const look = "cta-drop relative isolate inline-flex items-center justify-center text-[0.9375rem] leading-none whitespace-nowrap";
  if (!proposal) {
    return (
      <a href="/#proposal" className={look}>
        <span className="btn-neu-face">
          <Arrowed>{label}</Arrowed>
        </span>
      </a>
    );
  }
  return (
    <button
      ref={button}
      type="button"
      aria-haspopup="dialog"
      aria-expanded={launched && proposal.open}
      onClick={() => {
        if (!button.current) return;
        setLaunched(true);
        proposal.show(button.current, button.current, false);
      }}
      className={look}
      style={{ visibility: launched && present ? "hidden" : undefined }}
    >
      <span className="btn-neu-face">
        <Arrowed>{label}</Arrowed>
      </span>
    </button>
  );
}
