"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { SlideIn } from "./enter";
import { FloatingNav } from "./floating-nav";
import { Footer } from "./footer";
import { useInkAlign } from "./ink-align";
import { useSmoothScroll } from "./smooth-scroll";
import { PROJECTS, STATUS_LABEL, shown, workPath, type Project } from "@/lib/work";

/* ==================================================================
   The web design page

   The main service's own page, in three parts: the work so far, hung as
   plates in one closed frame (user: it must read as one held piece, not
   loose down the page); what every website comes with; and how changes
   are handled once a site is live.

   The frame is built from the home page's index: the black label, black
   hairlines, mono field names. Its images are left empty until the
   studio has them, and every field it has not filled in reads TO_FILL.
   ================================================================== */

export function WebDesign() {
  useSmoothScroll(false);
  return (
    <>
      <FloatingNav />
      <main id="top" className="relative bg-paper">
        <Work />
        <Perks />
        <Changes />
      </main>
      <Footer />
    </>
  );
}

/** A section's heading: the title on the left and, from lg, its subtitle
    beside it on the right, levelled with the title's first line. */
function Heading({
  id,
  as: Tag = "h2",
  light,
  medium,
  sub,
}: {
  id: string;
  as?: "h1" | "h2";
  light: string;
  medium?: string;
  sub: string;
}) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  useInkAlign(titleRef, subRef);
  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
      <SlideIn ready>
        <Tag ref={titleRef} id={id} className="display text-[clamp(2.25rem,4.2vw,4.25rem)] text-ink">
          <span className="block font-light">{light}</span>
          {medium && <span className="block font-medium">{medium}</span>}
        </Tag>
      </SlideIn>
      <SlideIn ready from="right" delay={0.12} className="max-w-[19rem] shrink-0 lg:text-right">
        <p ref={subRef} className="text-[0.9375rem] leading-[1.45] text-balance text-ash">
          {sub}
        </p>
      </SlideIn>
    </div>
  );
}

/* --- the work ------------------------------------------------------------ */

function Work() {
  return (
    <section
      id="work"
      aria-labelledby="web-design-title"
      className="relative pt-[calc(var(--section-gap)+2.5rem)]"
    >
      <div className="shell">
        <Heading
          id="web-design-title"
          as="h1"
          light="Web Design."
          sub="Our work so far, what every website includes, and how changes work once yours is live."
        />

        {/* One closed frame, so the work reads as a single held piece. */}
        <div className="wk-frame mt-12 md:mt-16">
          <div className="wk-bar">
            <p className="mono-label">
              <span className="idx-title">Selected work</span>
            </p>
            <p className="mono-label text-ash-2">
              {PROJECTS.length} {PROJECTS.length === 1 ? "project" : "projects"}
            </p>
          </div>
          <ul className="wk-plates">
            {PROJECTS.map((project, i) => (
              <li key={project.slug} className="wk-cell">
                <Plate project={project} figure={i + 1} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Plate({ project, figure }: { project: Project; figure: number }) {
  const live = project.status === "live";
  return (
    <Link href={workPath(project.slug)} className="wk-plate group">
      {/* Left empty until the studio has the project's images. */}
      <div className="wk-image" aria-hidden="true">
        <span className="mono-label wk-fig">Fig. 0{figure}</span>
      </div>
      <div className="mt-5 flex items-baseline justify-between gap-4 md:mt-6">
        <h3 className="display text-[clamp(1.5rem,2.2vw,2.125rem)] leading-[1.02] font-medium tracking-[-0.025em] text-ink">
          {project.name}
        </h3>
        <span aria-hidden="true" className="wk-arrow">
          <svg viewBox="0 0 16 16" width="16" height="16" fill="none" className="block">
            <path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.25" />
          </svg>
        </span>
      </div>
      <dl className="wk-fields mt-4 md:mt-5">
        <Field name="Sector" value={shown(project.sector)} />
        <Field name="Scope" value={shown(project.scope)} />
        <Field name="Status" value={STATUS_LABEL[project.status]} quiet={!live} />
      </dl>
    </Link>
  );
}

export function Field({
  name,
  value,
  quiet = false,
}: {
  name: string;
  value: string;
  /** set in grey, for a state rather than a fact */
  quiet?: boolean;
}) {
  return (
    <div className="wk-field">
      <dt className="mono-label text-ash-2">{name}</dt>
      <dd className={quiet ? "text-ash" : "text-ink"}>{value}</dd>
    </div>
  );
}

/* --- what every website includes ------------------------------------------ */

const PERKS = [
  {
    light: "Free hosting,",
    medium: "for life.",
    text: "We host your website at no cost, for as long as it is online.",
  },
  {
    light: "Built",
    medium: "to be found.",
    text: "Every website we make follows basic SEO practices, so yours doesn’t get lost among Google’s results.",
  },
  {
    light: "A free call,",
    medium: "a quarter of the way in.",
    text: "When your project is 25–30% done, we call you to go through where it stands. We learn what you want while it is still easy to change, so the finished website is made to your taste and goes live sooner, with no changes needed afterwards.",
  },
] as const;

function Perks() {
  const reduce = useReducedMotion() ?? false;
  const list = useRef<HTMLOListElement>(null);
  // The fill's tip is the line a little under the middle of the screen:
  // it starts down the rail as the list's top crosses it, and is at the
  // foot as the list's foot does.
  const { scrollYProgress } = useScroll({ target: list, offset: ["start 65%", "end 65%"] });

  // Where each stop sits down the rail, as a share of its length, so a stop
  // fills once the tip has reached it.
  const [stops, setStops] = useState<number[]>([]);
  useEffect(() => {
    const ol = list.current;
    if (!ol) return;
    const measure = () => {
      const box = ol.getBoundingClientRect();
      if (!box.height) return;
      setStops(
        [...ol.querySelectorAll<HTMLElement>("[data-stop]")].map((stop) => {
          const b = stop.getBoundingClientRect();
          return (b.top + b.height / 2 - box.top) / box.height;
        }),
      );
    };
    measure();
    const watch = new ResizeObserver(measure);
    watch.observe(ol);
    return () => watch.disconnect();
  }, []);

  const [reached, setReached] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const n = stops.filter((at) => at <= p + 0.001).length;
    setReached((was) => (was === n ? was : n));
  });

  return (
    <section id="included" aria-labelledby="included-title" className="relative pt-(--section-gap)">
      <div className="shell">
        <Heading
          id="included-title"
          light="Why choose our"
          medium="web design service?"
          sub="All of this comes with every website we design, at no extra cost."
        />
        {/* How we work's rail, stood upright (user): the rail down the left,
            grey for the way still to go and black for the way come, a stop
            at each statement that fills as the black reaches it. */}
        <ol ref={list} className="wk-steps mt-12 md:mt-16">
          <span aria-hidden="true" className="wk-rail" />
          <motion.span
            aria-hidden="true"
            className="wk-rail wk-rail-fill"
            style={{ scaleY: reduce ? 1 : scrollYProgress }}
          />
          {PERKS.map((perk, i) => (
            <li key={perk.medium} className="wk-step">
              <h3 className="wk-step-title display text-[clamp(2rem,3.1vw,3.125rem)] leading-[1] text-ink">
                <span
                  aria-hidden="true"
                  data-stop
                  data-on={reduce || i < reached ? "" : undefined}
                  className="abt-stop wk-stop"
                />
                <span className="block font-light">{perk.light}</span>
                <span className="block font-medium">{perk.medium}</span>
              </h3>
              <p className="max-w-[40ch] text-[1rem] leading-[1.5] text-ash">{perk.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* --- changes after launch -------------------------------------------------- */

const CHANGES = [
  {
    id: "content",
    label: "Content",
    what: "Text, photos or videos.",
    price: "Quoted, and agreed with you.",
    how: "We book a call to note what you want to change.",
  },
  {
    id: "style",
    label: "Style",
    what: "3D, animations, effects, sections, colors or typography.",
    price: "Quoted, and agreed with you.",
    how: "We book a call to note what you want to change.",
  },
] as const;

function Changes() {
  return (
    <section
      id="changes"
      aria-labelledby="changes-title"
      className="relative pt-(--section-gap) pb-28 md:pb-40"
    >
      <div className="shell">
        <Heading
          id="changes-title"
          light="Still want changes?"
          medium="Don’t worry, we handle everything."
          sub="We never charge for changes that take us only a few minutes. Anything bigger is paid, and the price is always agreed with you before we start."
        />
        <div className="wk-frame mt-12 md:mt-16">
          <ul className="wk-plates">
            {CHANGES.map((change) => (
              <li key={change.id} className="wk-cell wk-change">
                <p className="mono-label">
                  <span className="idx-title">{change.label}</span>
                </p>
                <h3 className="display mt-6 text-[clamp(1.5rem,2.2vw,2.125rem)] leading-[1.05] font-light tracking-[-0.025em] text-ink md:mt-8">
                  {change.what}
                </h3>
                <dl className="wk-fields mt-6 md:mt-8">
                  <Field name="Price" value={change.price} />
                  <Field name="How" value={change.how} />
                </dl>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
