"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { servicePath } from "@/lib/services";
import { SlideIn } from "./enter";
import { PassLink } from "./floating-nav";
import { useInkAlign } from "./ink-align";
import { useProposal } from "./proposal-flow";

/* ==================================================================
   How we work

   The studio's whole process, step by step (the user's brief,
   2026-10-07): eighteen steps in four phases, told to the visitor as
   "you" and "we". Each step keeps the shape the stages had: its name
   on the black marker, a principle in the title face, what happens,
   and who does it in the mono small print. Prices are not here: they
   change by country and the estimate gives them right (user's pick).
   What the studio has not settled yet (the SEO list, the delay before
   launch, the rules for later changes) is left out until it is.

   The steps run sideways (the user's ask, 2026-10-06; this section
   once ran down the about page). The section holds still on the screen
   while it is read, and scrolling down slides the row from right to
   left instead of moving the page; once the last step is in, the page
   carries on. A black rail runs over the row and fills from the left
   as it slides, with a stop at each step that is filled in once it has
   been reached: the order is shown that way, rather than by numbers on
   the headings. Each step stands in a column ruled off from the next
   by a hairline, the way the index is ruled.

   Each phase is headed over its own steps, and its heading holds at the
   left edge while its steps slide by under it, until the next phase
   pushes it off (its name alone: the user dropped the lines under it): wherever the row has got to, the phase it is in is in
   view. The services done only on request are left out of the row until
   the visitor chooses them in the keys over it, and then say so on their
   marker. Calls to action stand where they are asked for by the step: the
   free proposal at the estimate and at the end, a service's own page
   where that service comes in.
   ================================================================== */

type Who = "You" | "Us" | "You and us";

/** The services only done if the client asks for them. */
type Extra = "photo" | "identity" | "seo";
const EXTRAS: { id: Extra; label: string }[] = [
  { id: "photo", label: "Photo shoot" },
  { id: "identity", label: "Visual identity" },
  { id: "seo", label: "SEO & GEO" },
];

type Cta = { proposal: true } | { href: string; label: string };

type Step = {
  id: string;
  name: string;
  principle: string;
  text: string;
  who: Who;
  /** Only if the client asks for it (the brief's "só se requisitado"):
      the extra service it belongs to. Shown only once that service has
      been chosen above the row. */
  extra?: Extra;
  /** Long words: the column is made wider rather than the words cut. */
  wide?: boolean;
  cta?: Cta[];
};

type Phase = {
  id: string;
  name: string;
  /** Kept for the record; the user had the phases headed by their names
      alone (2026-10-07), so neither this nor `takes` is shown. */
  intro: string;
  takes?: string;
  steps: Step[];
};

const explore = (slug: string, title: string): Cta => ({
  href: servicePath(slug),
  label: `Explore ${title}`,
});

const PHASES: Phase[] = [
  {
    id: "proposal",
    name: "Proposal and contract",
    intro:
      "You see what it could cost, we study your request and make a proposal, and we only start once the contract is signed and your materials are in.",
    steps: [
      {
        id: "estimate",
        name: "Estimate",
        principle: "See the price first.",
        text: "You fill in our estimator and get a price range straight away. We confirm the final price once we have talked.",
        who: "You",
        cta: [{ proposal: true }],
      },
      {
        id: "analysis",
        name: "Analysis and a second option",
        principle: "We look before we propose.",
        text: "We study your market (the sector, your competitors, your clients and what they need, the tone to speak in) and your business itself (how it works, its essence, your current visual identity and what could improve) to see whether your plan should change. Then we always bring you a second option, cheaper or dearer, depending on what your website needs.",
        who: "Us",
        wide: true,
      },
      {
        id: "choice",
        name: "Your choice",
        principle: "Both prices, side by side.",
        text: "You choose between the plan you asked for and our second option. If ours adds something you did not ask for, like a blog, you see both prices side by side and why it suits your business. We only suggest what you can keep up.",
        who: "You",
        wide: true,
      },
      {
        id: "contract",
        name: "Contract",
        principle: "Everything agreed in writing.",
        text: "Once the plan is set, we send you the contract. It fixes the approved plan, the price, the list of materials and the rules for changes: the price closes with the plan, and pages added later are charged per page.",
        who: "You and us",
        wide: true,
      },
      {
        id: "materials",
        name: "Your materials",
        principle: "The clock starts with you.",
        text: "You send us what the site needs: logo, photos, videos, information about your business and access. We start once everything is in, and the timeline only counts from that day.",
        who: "You",
      },
    ],
  },
  {
    id: "production",
    name: "Production",
    intro:
      "We start with all your materials in hand, and halfway through we have a free call, to correct course early rather than at the end.",
    takes:
      "Varies by project, from 4 working days for a one-page site, counted from the day all your materials are in.",
    steps: [
      {
        id: "photo",
        name: "Photo shoot",
        extra: "photo",
        principle: "Images of your own.",
        text: "We photograph your business so your site has images of its own: photos only, or photos and video. It is a separate service, priced in your estimate.",
        who: "Us",
      },
      {
        id: "identity",
        name: "Visual identity",
        extra: "identity",
        principle: "Identity first.",
        text: "We create your logo, or your logo and symbol, because the rest of the site rests on it. Priced in your estimate.",
        who: "Us",
        cta: [explore("visual-identity", "Visual Identity")],
      },
      {
        id: "strategy",
        name: "Strategy and first version",
        principle: "Structure before polish.",
        text: "We define the sections of each page and their components, then design and build the base of your site, up to about 25 to 30% of the project.",
        who: "Us",
        cta: [explore("web-design", "Web Design")],
      },
      {
        id: "call",
        name: "Free call",
        principle: "Talk halfway, not at the end.",
        text: "At about 25 to 30%, we have a free call. You already see the strategy and the essence of your site, and you tell us what you like and what you don’t. We align ideas now, so nothing has to change once the site is closed.",
        who: "You and us",
        wide: true,
      },
      {
        id: "finish",
        name: "Finishing the website",
        principle: "Then we finish it.",
        text: "With everything aligned, we complete the design and the build. That closes the web design process.",
        who: "Us",
      },
      {
        id: "seo-basics",
        name: "Basic SEO",
        principle: "Ready to be found.",
        text: "Before launch, we apply the essential SEO practices to your site.",
        who: "Us",
      },
      {
        id: "hosting",
        name: "Hosting and domain",
        principle: "We handle the logistics.",
        text: "Your domain is included for 2 years, and hosting for as long as your site is live, within reasonable use. If you already have a domain, its cost comes off your price, with proof.",
        who: "Us",
      },
    ],
  },
  {
    id: "launch",
    name: "Review and launch",
    intro:
      "Before your site goes live, you can ask for changes (paid), and you decide when SEO and GEO are applied.",
    steps: [
      {
        id: "changes",
        name: "Your changes",
        principle: "Your say before launch.",
        text: "You can ask for changes to the content (text, photos, videos) or to the style. Each kind has its own rule and its own price.",
        who: "You",
      },
      {
        id: "seo-choice",
        name: "SEO and GEO: before or after",
        extra: "seo",
        principle: "Now, or found from day one.",
        text: "You decide whether we apply SEO and GEO before or after launch. Before, your site takes a little longer to go live. After, it goes live straight away.",
        who: "You",
        wide: true,
        cta: [explore("seo", "SEO"), explore("geo", "GEO")],
      },
      {
        id: "seo-before",
        name: "SEO and GEO before launch",
        extra: "seo",
        principle: "Applied, then published.",
        text: "If you chose before, we apply SEO and GEO, and then we publish your site.",
        who: "Us",
      },
      {
        id: "publish",
        name: "Launch",
        principle: "Your site goes live.",
        text: "We put your website online.",
        who: "Us",
      },
    ],
  },
  {
    id: "after",
    name: "After launch",
    intro:
      "With your site live, our work turns to SEO, GEO (if not applied yet) and changes whenever you need them.",
    steps: [
      {
        id: "seo-after",
        name: "SEO and GEO after launch",
        extra: "seo",
        principle: "Growing once you are live.",
        text: "If you chose after, we start once your site is live. Priced in your estimate.",
        who: "Us",
      },
      {
        id: "later-changes",
        name: "Changes along the way",
        principle: "Here when you need us.",
        text: "Once your site is live, you can ask us for occasional changes.",
        who: "You",
      },
    ],
  },
];


/** Scrolled pixels per pixel slid: a little more than one, so the row
    moves a touch slower than the page would (the user's ask). */
const SLOW = 1.6;

/* Measured before the first paint in the browser; the server has no
   layout to measure. */
const useIsomorphicLayout = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** Where a phase stands in the row and how wide its heading is. */
type PhaseBox = { left: number; width: number; head: number };

type Layout = {
  /** How far the row has to travel to bring its last step in. */
  travel: number;
  /** The rail's height in the row: the top of the steps. */
  railTop: number;
  /** The rail's length: the row, less its padding on the right. */
  railWidth: number;
  /** Where each step's stop stands along the rail. */
  stops: number[];
  phases: PhaseBox[];
};

const NO_LAYOUT: Layout = { travel: 0, railTop: 0, railWidth: 1, stops: [], phases: [] };

export function Process({ ready }: { ready: boolean }) {
  const reduce = useReducedMotion() ?? false;
  const section = useRef<HTMLElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLOListElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  useInkAlign(titleRef, subRef);

  // The extra services the visitor has chosen to see: their steps join the
  // row; until then the row is the process every project goes through.
  const [extras, setExtras] = useState<Extra[]>([]);
  const toggle = (id: Extra) =>
    setExtras((was) => (was.includes(id) ? was.filter((e) => e !== id) : [...was, id]));
  const phases = PHASES.map((phase) => ({
    ...phase,
    steps: phase.steps.filter((step) => !step.extra || extras.includes(step.extra)),
  }));
  const stepCount = phases.reduce((n, phase) => n + phase.steps.length, 0);

  const [layout, setLayout] = useState<Layout>(NO_LAYOUT);
  useIsomorphicLayout(() => {
    const measure = () => {
      const t = track.current;
      const v = viewport.current;
      if (!t || !v) return;
      // The row starts after the viewport's left padding (the shell's
      // edge), so that much less of the viewport is there to show it.
      const lead = parseFloat(getComputedStyle(v).paddingLeft) || 0;
      const trail = parseFloat(getComputedStyle(t).paddingRight) || 0;
      const phases = [...t.querySelectorAll<HTMLElement>("[data-phase]")].map((el) => ({
        left: el.offsetLeft,
        width: el.offsetWidth,
        head: el.querySelector<HTMLElement>("[data-phase-head]")?.offsetWidth ?? 0,
      }));
      const steps = [...t.querySelectorAll<HTMLElement>("[data-step]")];
      const first = t.querySelector<HTMLElement>("[data-steps]");
      setLayout({
        travel: Math.max(0, Math.ceil(t.scrollWidth - (v.clientWidth - lead))),
        railTop: first?.offsetTop ?? 0,
        railWidth: Math.max(1, t.scrollWidth - trail),
        stops: steps.map((el) => (el.offsetParent as HTMLElement | null)?.offsetLeft ?? 0).map(
          (base, i) => base + steps[i]!.offsetLeft,
        ),
        phases,
      });
    };
    measure();
    const watch = new ResizeObserver(measure);
    if (track.current) watch.observe(track.current);
    if (viewport.current) watch.observe(viewport.current);
    document.fonts?.ready.then(measure);
    return () => watch.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -layout.travel]);

  // Which stops the rail's fill has reached.
  const [reached, setReached] = useState(1);
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const tip = p * layout.railWidth + 1;
    const n = Math.max(1, layout.stops.filter((at) => at <= tip).length);
    setReached((was) => (was === n ? was : n));
  });

  let index = 0;

  return (
    <section
      ref={section}
      id="how-we-work"
      aria-labelledby="process-title"
      className="relative z-10 bg-paper"
      style={reduce ? undefined : { height: `calc(100svh + ${Math.round(layout.travel * SLOW)}px)` }}
    >
      {/* The heading and the row as one block, the row close under the
          heading, hung from the top clear of the bar. It was centred on the
          screen, which left twice the room the user wanted between the
          services and the heading. */}
      <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden pt-[clamp(5.5rem,12svh,7rem)] pb-[clamp(1.5rem,4svh,3rem)]">
        <div className="shell">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
            <SlideIn ready={ready}>
              <h2
                ref={titleRef}
                id="process-title"
                className="display text-[clamp(2rem,4.2vw,4.25rem)] text-ink"
              >
                <span className="block font-light">How we work.</span>
                <span className="block font-medium">The whole process, in detail.</span>
              </h2>
            </SlideIn>
            <SlideIn ready={ready} from="right" delay={0.12} className="max-w-[19rem] shrink-0 max-md:hidden lg:text-right">
              <p ref={subRef} className="text-[0.9375rem] leading-[1.45] text-balance text-ash">
                It all comes down to one idea: take out everything that
                doesn&rsquo;t move your project forward, and keep you close to
                everything that does.
              </p>
            </SlideIn>
          </div>
        </div>

        {/* The extra services, to be chosen into the row. */}
        <div className="shell mt-[clamp(1rem,3svh,1.75rem)]">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5">
            <p id="prc-extras" className="mono-label text-ink">
              Choose the services you want to see how we handle each one
            </p>
            <div role="group" aria-labelledby="prc-extras" className="flex flex-wrap gap-1.5">
              {EXTRAS.map((extra) => (
                <button
                  key={extra.id}
                  type="button"
                  aria-pressed={extras.includes(extra.id)}
                  onClick={() => toggle(extra.id)}
                  className="prop-chip prc-chip mono-label"
                >
                  <span aria-hidden="true" className="prc-chip-mark">
                    {extras.includes(extra.id) ? "\u2212" : "+"}
                  </span>
                  {extra.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* The row, set against the shell's left edge and free to run past
            the right edge of the screen; it is slid, not scrolled. With
            reduced motion it is simply scrolled sideways. */}
        <div
          ref={viewport}
          className={`prc-viewport mt-[clamp(1rem,3.5svh,2.5rem)] ${reduce ? "overflow-x-auto" : ""}`}
        >
          <motion.ol
            ref={track}
            className="prc-track"
            style={
              {
                x: reduce ? 0 : x,
                "--prc-rail-top": `${layout.railTop}px`,
                "--prc-rail-width": `${layout.railWidth}px`,
              } as never
            }
          >
            {/* The rail over the steps: grey for the way still to go, black
                for the way come. */}
            <span aria-hidden="true" className="prc-rail" />
            <motion.span
              aria-hidden="true"
              className="prc-rail prc-rail-fill"
              style={{ scaleX: reduce ? 1 : scrollYProgress }}
            />
            {phases.map((phase, p) => (
              <li key={phase.id} data-phase aria-labelledby={`phase-${phase.id}`} className="prc-phase">
                <PhaseHead
                  phase={phase}
                  box={layout.phases[p]}
                  x={x}
                  reduce={reduce}
                />
                <ol data-steps className="prc-steps">
                  {phase.steps.map((step) => {
                    const i = index++;
                    return (
                      <StepCard
                        key={step.id}
                        step={step}
                        n={i}
                        count={stepCount}
                        on={reduce || i < reached}
                      />
                    );
                  })}
                </ol>
              </li>
            ))}
            <li className="prc-end">
              <h3 className="display text-[clamp(1.5rem,2.1vw,2.125rem)] leading-[1.02] font-light text-ink">
                It all starts with your estimate.
              </h3>
              <p className="mt-4 text-[clamp(0.9375rem,1vw,1rem)] leading-[1.5] text-pretty text-ash">
                Tell us what you need and see a price range straight away. Your
                proposal is free.
              </p>
              <div className="mt-7">
                <ProposalCta />
              </div>
            </li>
          </motion.ol>
        </div>
      </div>
    </section>
  );
}

/* A phase's heading. Held at the row's left edge while its steps slide by
   under it, and carried off by its own last step once that has gone past. */
function PhaseHead({
  phase,
  box,
  x,
  reduce,
}: {
  phase: Phase;
  box: PhaseBox | undefined;
  x: MotionValue<number>;
  reduce: boolean;
}) {
  const hold = useTransform(x, (v) => {
    if (!box || reduce) return 0;
    const room = Math.max(0, box.width - box.head);
    return Math.min(Math.max(-v - box.left, 0), room);
  });
  return (
    <motion.div data-phase-head className="prc-head" style={{ x: hold }}>
      <h3
        id={`phase-${phase.id}`}
        className="display text-[clamp(1.25rem,1.5vw,1.5rem)] leading-[1.05] font-medium text-ink"
      >
        {phase.name}
      </h3>
    </motion.div>
  );
}

function StepCard({ step, n, count, on }: { step: Step; n: number; count: number; on: boolean }) {
  return (
    <li
      data-step
      aria-labelledby={`step-${step.id}`}
      className={`prc-stage ${step.wide ? "prc-wide" : ""}`}
    >
      <span aria-hidden="true" data-on={on ? "" : undefined} className="abt-stop prc-stop" />
      {/* An extra service says so first, on the same marker. */}
      <p className="mono-label leading-[1.75]">
        <span className="idx-title prc-eyebrow">
          {step.extra && (
            <>
              If you request
              <span aria-hidden="true" className="prc-eyebrow-rule" />
            </>
          )}
          {step.name}
        </span>
        <span className="sr-only">
          , step {n + 1} of {count}
        </span>
      </p>
      <h4
        id={`step-${step.id}`}
        className="display mt-3.5 text-[clamp(1.3125rem,1.9vw,1.875rem)] leading-[1.04] font-light text-ink md:mt-5"
      >
        {step.principle}
      </h4>
      <p className="mt-3 mb-5 text-[clamp(0.875rem,1vw,1rem)] leading-[1.5] text-pretty text-ash md:mt-4 md:mb-6">
        {step.text}
      </p>
      {step.cta && (
        <div className="mt-auto mb-5 flex flex-wrap gap-x-7 gap-y-5 pl-1 md:mb-6">
          {step.cta.map((cta) =>
            "proposal" in cta ? (
              <ProposalCta key="proposal" />
            ) : (
              <PassLink
                key={cta.href}
                href={cta.href}
                label={<Label>{cta.label}</Label>}
                className="cta-drop inline-flex text-[0.875rem] leading-none"
              />
            ),
          )}
        </div>
      )}
      <dl className={`${step.cta ? "" : "mt-auto"} grid grid-cols-2 gap-x-4 border-t border-ink/15 pt-3`}>
        <div>
          <dt className="mono-label text-ash-2">Who</dt>
          <dd className="mono-label mt-1 text-ink">{step.who}</dd>
        </div>
      </dl>
    </li>
  );
}

function Label({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <span aria-hidden="true" className="ml-2 inline-block">
        &rarr;
      </span>
    </>
  );
}

/* "Get your free proposal": the same form the index opens, grown here out
   of this button. The button keeps its place, unseen, while the form is
   out, and the form comes back to it on closing. */
function ProposalCta() {
  const proposal = useProposal();
  const button = useRef<HTMLButtonElement>(null);
  const [launched, setLaunched] = useState(false);
  const present = proposal?.present ?? false;
  useEffect(() => {
    if (!present) setLaunched(false);
  }, [present]);
  if (!proposal) return null;
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
      className="cta-drop relative isolate inline-flex items-center justify-center text-[0.875rem] leading-none whitespace-nowrap"
      style={{ visibility: launched && present ? "hidden" : undefined }}
    >
      <span className="btn-neu-face">
        <Label>Get your free proposal</Label>
      </span>
    </button>
  );
}
