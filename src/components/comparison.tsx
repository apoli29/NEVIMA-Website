"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { SlideIn } from "./enter";
import { Illuminated, followPointer } from "./services";

/* The answer to the question above it, run through with the same black
   marker as the pillar in the studio, and not left there: the marker is
   drawn across it left to right, stays five seconds, is drawn back right
   to left, and stays off five seconds, over and over, from the moment the
   heading is seen. The marked copy lies exactly over the plain one and is
   uncovered by a moving clip, so the words go white just where the marker
   has reached them. Held marked for anyone who has asked for less motion. */
function MarkedLine({ text }: { text: string }) {
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLSpanElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    if (seen || reduce) return;
    const el = ref.current;
    if (!el) return;
    const watch = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setSeen(true);
      },
      { rootMargin: "0px 0px -20% 0px" },
    );
    watch.observe(el);
    return () => watch.disconnect();
  }, [seen, reduce]);

  return (
    <span
      ref={ref}
      data-state={reduce ? "held" : seen ? "running" : "waiting"}
      className="cmp-marked"
    >
      <span className="cmp-marked-text">{text}</span>
      <span aria-hidden="true" className="cmp-marked-over">
        <span className="cmp-marked-text cmp-marked-ink">{text}</span>
      </span>
    </span>
  );
}

/* ==================================================================
   Comparison

   The last argument on the page, set as a table on the service card's
   surface: the grain, the corner light, the spot that follows the
   pointer.

   Our column is one raised panel, a tone above the card, from its
   header to the last row. The lines that part the rows run across the
   other two columns and stop at its edge, so the agency's side reads as
   a chain of steps and ours as a single piece.

   The table is the same table at every width. Where its three columns
   stop fitting it slides sideways inside the card, and the criterion
   column stays pinned on the left, so an answer can always be read
   against its row. On a phone that is the criterion and one answer at a
   time.

   The agency's answers are grey and stay grey. Ours arrive grey too and
   are lit, one row at a time and top to bottom, as each comes into view
   (on a phone, once the table has been slid across to them). Rows that
   arrive together are held a beat apart, so the light is seen
   travelling down the column rather than landing everywhere at once.
   It runs once.
   ================================================================== */

/* Radius and inner lines as on the service and founders cards. */
const SURFACE = {
  borderRadius: 22,
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 0 0 1px rgba(255,255,255,0.05)",
};

/** From a row being seen to its light starting, in milliseconds. */
const FIRST_LIGHT_MS = 180;
/** The least time between two rows starting, in milliseconds. */
const STAGGER_MS = 420;

const THEM = "Traditional big agency";

type Row = {
  id: string;
  criterion: string;
  them: string;
  /** set in bold at the head of our answer, as in the brief */
  lead: string;
  us: string;
};

const ROWS: Row[] = [
  {
    id: "contact",
    criterion: "Contact and decision-making",
    them: "Feedback is filtered through multiple intermediaries (account managers and traffic managers). Every change goes through long internal approval chains before it reaches the person who writes the code.",
    lead: "Direct line and immediate decisions:",
    us: "feedback is discussed and applied directly by the people who build, eliminating noise, back-and-forth phone calls and dead time.",
  },
  {
    id: "knowledge",
    criterion: "Knowledge and tools",
    them: "Outdated methods: they keep relying on obsolete tools and aging processes.",
    lead: "Cutting-edge:",
    us: "state-of-the-art tools, constant tracking of how the market evolves and technical expertise that is always up to date.",
  },
  {
    id: "costs",
    criterion: "Costs and budget",
    them: "Disproportionately high for the quality of the final result. Too many people involved drive up the cost of the process, and expensive tools are used inefficiently.",
    lead: "Highly efficient:",
    us: "a rigorous focus on cost-benefit and final quality, eliminating overhead and waste.",
  },
  {
    id: "timelines",
    criterion: "Timelines and development",
    them: "Slow processes, dragged out by approvals and excessive internal bureaucracy.",
    lead: "Significantly faster development:",
    us: "agile execution combined with the smart, efficient use of the best tools.",
  },
  {
    id: "service",
    criterion: "Overall service",
    them: "Formal, slow, corporate, impersonal and distant.",
    lead: "Agile, close, efficient and personalized:",
    us: "a dedicated service, tailored to each client.",
  },
];

/* ================================================================== */

export function Comparison({ ready }: { ready: boolean }) {
  const reduce = useReducedMotion() ?? false;
  const scroller = useRef<HTMLDivElement>(null);
  const answers = useRef<(HTMLTableCellElement | null)[]>([]);
  // When each answer's light starts, counted from the moment its row was
  // seen. Null until it has been.
  const [delays, setDelays] = useState<(number | null)[]>(() =>
    ROWS.map(() => null),
  );
  // Kept outside state so a remounted observer cannot light a row twice or
  // push the queue along for a row that has already gone.
  const handled = useRef(new Set<number>());
  const lastStart = useRef(Number.NEGATIVE_INFINITY);

  // Whether the table has been slid, and whether there is more of it to the
  // right. Written straight to the element, as the pointer light is: the
  // pinned column and the fade at the edge are CSS and need no render.
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const mark = (key: "scrolled" | "more", on: boolean) => {
      const value = String(on);
      if (el.dataset[key] !== value) el.dataset[key] = value;
    };
    const update = () => {
      mark("scrolled", el.scrollLeft > 1);
      mark("more", el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    // The card changing width, and the table inside it settling once the
    // fonts are in, both change how far there is to slide.
    const resize = new ResizeObserver(update);
    resize.observe(el);
    if (el.firstElementChild) resize.observe(el.firstElementChild);
    return () => {
      el.removeEventListener("scroll", update);
      resize.disconnect();
    };
  }, []);

  // Not watched until the opening has handed the page back, for the same
  // reason as the studio statement: Illuminated reads its lines from the
  // layout when it mounts, and before then the page has no scrollbar and
  // every line it measured would be a little too long.
  useEffect(() => {
    if (!ready || reduce) return;
    const watch = new IntersectionObserver(
      (entries) => {
        const now = performance.now();
        const seen = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => {
            watch.unobserve(entry.target);
            return Number((entry.target as HTMLElement).dataset.row);
          })
          .filter((row) => !handled.current.has(row))
          .sort((a, b) => a - b);
        if (!seen.length) return;

        const found = seen.map((row) => {
          handled.current.add(row);
          const start = Math.max(now, lastStart.current + STAGGER_MS);
          lastStart.current = start;
          return [row, Math.round(start - now) + FIRST_LIGHT_MS] as const;
        });
        setDelays((current) => {
          const next = [...current];
          for (const [row, delay] of found) next[row] = delay;
          return next;
        });
      },
      // The slide clips the answers, so on a phone a row counts as seen only
      // once most of our answer has been brought into the card.
      { threshold: 0.6 },
    );
    answers.current.forEach((cell, row) => {
      if (cell && !handled.current.has(row)) watch.observe(cell);
    });
    return () => watch.disconnect();
  }, [ready, reduce]);

  return (
    <section
      id="comparison"
      aria-labelledby="comparison-title"
      className="relative z-10 bg-paper pt-(--section-gap) pb-28 md:pb-40"
    >
      <div className="shell">
        <SlideIn ready={ready}>
          <h2
            id="comparison-title"
            className="display text-[clamp(2.25rem,4.4vw,3.75rem)] leading-[0.98] text-ink"
          >
            <span className="block font-light text-balance">
              The perks of working with us instead of a big agency?
            </span>
            <span className="block font-medium">
              <MarkedLine text="Here’s the honest comparison." />
            </span>
          </h2>
        </SlideIn>

        <SlideIn ready={ready} distance={0} className="mt-10 md:mt-14">
          <div
            onPointerMove={followPointer}
            className="svc-card cmp-card relative isolate overflow-hidden text-paper"
            style={SURFACE}
          >
            <span
              aria-hidden="true"
              className="svc-spot pointer-events-none absolute inset-0 -z-10"
            />

            {/* Focusable so the slide can be driven from the keyboard too. */}
            <div
              ref={scroller}
              tabIndex={0}
              role="region"
              aria-label="Comparison table"
              className="cmp-scroll focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-paper/40"
            >
              <div className="cmp-grid relative">
                <span aria-hidden="true" className="cmp-panel" />

                <table className="cmp-table relative">
                  <caption className="sr-only">
                    Nevima compared with a traditional big agency
                  </caption>
                  <colgroup>
                    <col />
                    <col />
                    <col />
                  </colgroup>

                  <thead>
                    <tr>
                      <th scope="col" className="cmp-crit">
                        Criterion
                      </th>
                      <th scope="col">{THEM}</th>
                      <th scope="col" className="cmp-us">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/nevima-wordmark-white.svg"
                          alt="Nevima"
                          className="cmp-mark"
                        />
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {ROWS.map((row, i) => (
                      <tr key={row.id}>
                        <th
                          scope="row"
                          className="cmp-crit display text-[clamp(1.125rem,1.4vw,1.375rem)] leading-[1.15] tracking-[-0.015em]"
                        >
                          {/* A hyphenated word is kept whole where the column
                            has room for it (see .cmp-keep). */}
                          {row.criterion.split(" ").map((word, w) => (
                            <Fragment key={w}>
                              {w > 0 && " "}
                              {word.includes("-") ? (
                                <span className="cmp-keep">{word}</span>
                              ) : (
                                word
                              )}
                            </Fragment>
                          ))}
                        </th>

                        <td>
                          <p className="cmp-text">{row.them}</p>
                        </td>

                        <td
                          ref={(cell) => {
                            answers.current[i] = cell;
                          }}
                          data-row={i}
                          className="cmp-us"
                        >
                          <Answer row={row} delay={delays[i]} reduce={reduce} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </SlideIn>
      </div>
    </section>
  );
}

/* Grey and plain until its row has been seen, then lit. The plain copy is
   set exactly as Illuminated sets its words, so nothing moves when one
   hands over to the other. */
function Answer({
  row,
  delay,
  reduce,
}: {
  row: Row;
  delay: number | null;
  reduce: boolean;
}) {
  const className = "svc-copy cmp-text cmp-copy";
  if (delay === null && !reduce) {
    return (
      <p className={className}>
        <strong>{row.lead}</strong> {row.us}
      </p>
    );
  }
  return (
    <Illuminated
      text={row.us}
      lead={row.lead}
      delayMs={delay ?? 0}
      reduce={reduce}
      className={className}
    />
  );
}
