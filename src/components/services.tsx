"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent,
} from "react";
import {
  MotionConfig,
  motion,
  useReducedMotion,
  type MotionStyle,
} from "motion/react";
import { SERVICES, servicePath, type Service } from "@/lib/services";
import { BoomerangMark } from "./boomerang";
import { SlideIn } from "./enter";
import { PassLink } from "./floating-nav";
import { RewriteTitle } from "./rewrite-title";
import { useSplitReveal } from "./split-reveal";

/* ==================================================================
   Services

   Four bars, stacked. Picking one splits the list: the other three
   close up into a column on the left and the chosen one takes the
   right, three rows tall, with its description. Below lg there is no
   room for two columns, so the chosen bar opens where it stands.

   The click is answered at once (the boomerang spins, the card warms)
   and the layout only moves a beat later, so the pause reads as intent
   rather than lag. The move is one FLIP across every card: transforms
   only, nothing is animated through width or height.

   The description is lit rather than faded in. It arrives grey, and a
   soft edge of light runs across it one line at a time, left to right,
   in a second and a half.
   ================================================================== */

/* The timings, the toggle, the lit copy and the choice logic are shared
   with the founders card in studio.tsx, which is built from this card. */
export const HOLD_MS = 220;
export const MORPH = { duration: 0.95, ease: [0.76, 0, 0.24, 1] } as const;

/** The description fades up this far into the move, in seconds. */
export const BODY_IN_S = 0.62;
/** The light starts once the description is mostly up, in milliseconds. */
export const LIGHT_DELAY_MS = 750;
const LIGHT_MS = 1500;
/** How far into one line the next one starts, as a share of a line. */
const LIGHT_OVERLAP = 0.6;

/* ================================================================== */

/** A choice that is answered at once and acted on a beat later. */
export function useHeldChoice<Id extends string>(reduce: boolean) {
  // `intent` is what the visitor asked for and is shown straight away;
  // `active` is what the layout is doing and follows it a beat later.
  const [intent, setIntent] = useState<Id | null>(null);
  const [active, setActive] = useState<Id | null>(null);
  // Whether anything has been opened yet. Until it has, the toggles blink
  // to show that the cards open (see .svc-toggle in globals.css).
  const [tried, setTried] = useState(false);
  // Read by the click handler, which can fire again inside the hold,
  // before React has re-rendered with the first click.
  const intentRef = useRef<Id | null>(null);
  const hold = useRef<number | undefined>(undefined);

  const choose = useCallback(
    (id: Id | null) => {
      intentRef.current = id;
      setIntent(id);
      if (id !== null) setTried(true);
      window.clearTimeout(hold.current);
      if (reduce) {
        setActive(id);
        return;
      }
      hold.current = window.setTimeout(() => setActive(id), HOLD_MS);
    },
    [reduce],
  );

  const toggle = useCallback(
    (id: Id) => choose(intentRef.current === id ? null : id),
    [choose],
  );

  const close = useCallback(() => {
    if (intentRef.current !== null) choose(null);
  }, [choose]);

  useEffect(() => () => window.clearTimeout(hold.current), []);

  useEffect(() => {
    if (intent === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") choose(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [intent, choose]);

  return { intent, active, toggle, close, tried };
}

export function Services({ ready }: { ready: boolean }) {
  const reduce = useReducedMotion() ?? false;
  const { intent, active, toggle, tried } = useHeldChoice<string>(reduce);
  // The four bars arrive as the founders above them do: one shape that
  // divides into them. Same reveal, same language, a column instead of a
  // pair. A tighter blur than the founders': these bars stand a sixteenth
  // of a card apart, and a reach wide enough to hold two portraits would
  // never let them part at all.
  const { host, revealed, overlay } = useSplitReveal({ ready, goo: 8 });

  // The cards that step aside keep their order down the left column.
  const aside = SERVICES.filter((service) => service.slug !== active);

  return (
    <section
      id="services"
      aria-labelledby="services-title"
      // No foot padding: the comparison below brings its own head room, as
      // this section does for the studio above it.
      className="relative z-10 bg-paper pt-(--section-gap)"
    >
      <div className="shell">
        <SlideIn ready={ready}>
          {/* "We only do websites", corrected in place (see rewrite-title.tsx). */}
          <RewriteTitle
            ready={ready}
            id="services-title"
            className="display text-[clamp(2.25rem,4.4vw,3.75rem)] font-light text-ink"
          />
        </SlideIn>

        <MotionConfig transition={{ layout: MORPH }}>
          <div
            ref={host}
            data-beckon={!tried || undefined}
            className={`relative mt-10 grid grid-cols-1 gap-3 md:mt-14 lg:gap-4 ${
              active ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]" : ""
            }`}
          >
            {SERVICES.map((service, i) => (
              <ServiceCard
                key={service.slug}
                service={service}
                index={i}
                state={
                  service.slug === active ? "active" : active ? "aside" : "idle"
                }
                intended={intent === service.slug}
                revealed={revealed}
                row={aside.indexOf(service) + 1}
                layoutKey={active}
                reduce={reduce}
                onToggle={toggle}
              />
            ))}
            {overlay}
          </div>
        </MotionConfig>
      </div>
    </section>
  );
}

/* ================================================================== */
/* Card                                                                */
/* ================================================================== */

type CardState = "idle" | "active" | "aside";

const PLACEMENT: Record<CardState, string> = {
  idle: "",
  active: "lg:col-start-2 lg:row-start-1 lg:row-span-3",
  aside: "lg:col-start-1 lg:[grid-row:var(--row)]",
};

/* Written straight to the element: a light that follows the pointer has no
   business re-rendering React on every move. */
export function followPointer(event: PointerEvent<HTMLElement>) {
  if (event.pointerType !== "mouse") return;
  const box = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty(
    "--mx",
    `${event.clientX - box.left}px`,
  );
  event.currentTarget.style.setProperty("--my", `${event.clientY - box.top}px`);
}

function ServiceCard({
  service,
  index,
  state,
  intended,
  revealed,
  row,
  layoutKey,
  reduce,
  onToggle,
}: {
  service: Service;
  /** where it stands in the list, which is when its photos fall */
  index: number;
  state: CardState;
  intended: boolean;
  /** the shape that divides into the cards has handed over */
  revealed: boolean;
  row: number;
  /** the open card; the only thing allowed to set the layout moving */
  layoutKey: string | null;
  reduce: boolean;
  onToggle: (id: string) => void;
}) {
  const active = state === "active";
  const bodyId = `service-${service.slug}`;
  // One full turn of the boomerang per click, counted rather than toggled so
  // every click spins it the same way round, however quickly they come.
  const [turns, setTurns] = useState(0);
  // The card and its header travel and resize; what sits inside them only
  // travels, so Motion can hold the type and photos at their true scale
  // while the box around them stretches.
  const move = !reduce;
  const slide = reduce ? false : "position";
  // Without a dependency Motion measures on every render, so anything that
  // shifts the section on the page reads as a layout change: the opening
  // handing its stage back to the flow flew the cards up across the second
  // screen. Tied to the open card, only a choice in here can move them.
  const tie = { layoutDependency: layoutKey };

  return (
    <motion.article
      layout={move}
      {...tie}
      onPointerMove={followPointer}
      data-state={state}
      data-intent={intended}
      data-split-target=""
      data-revealed={revealed || undefined}
      // Held out of sight until the shape that divides into these cards is
      // standing on the same pixels, then switched on whole underneath it
      // while it is still opaque. No fade: a crossfade would take the card
      // and the shape through half opacity together and the black would go
      // grey. Set through Motion rather than CSS, because the card writes
      // its own opacity inline and a rule would never reach it.
      initial={false}
      animate={{ opacity: revealed ? 1 : 0 }}
      transition={{ layout: MORPH, opacity: { duration: 0 } }}
      className={`svc-card group relative isolate flex flex-col overflow-hidden text-paper has-[:focus-visible]:outline-1 has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-ink ${PLACEMENT[state]}`}
      // Radius and inner lines set here, not in CSS, so Motion can correct
      // them for the scale while the card is mid-move.
      style={
        {
          borderRadius: 22,
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 0 0 1px rgba(255,255,255,0.05)",
          "--row": row,
          "--card": index,
          "--aura": service.aura,
        } as MotionStyle
      }
    >
      <span
        aria-hidden="true"
        className="svc-aura pointer-events-none absolute inset-0 -z-10"
      />
      <span
        aria-hidden="true"
        className="svc-spot pointer-events-none absolute inset-0 -z-10"
      />

      <motion.h3
        layout={move}
        {...tie}
        className={active ? "flex" : "flex flex-1"}
      >
        <button
          type="button"
          onClick={() => {
            setTurns((n) => n + 1);
            onToggle(service.slug);
          }}
          aria-expanded={active}
          aria-controls={active ? bodyId : undefined}
          className="flex w-full min-w-0 items-center gap-(--gap) px-(--pad-x) py-(--pad) text-left focus-visible:outline-none"
        >
          <motion.span layout={slide} {...tie} className="min-w-0">
            <span className="display block text-[clamp(1.8rem,2.64vw,2.55rem)] leading-[1.06] tracking-[-0.02em]">
              {service.title}
            </span>
            {service.full && (
              <span className="mt-1.5 block text-[0.875rem] leading-snug text-paper/45">
                {service.full}
              </span>
            )}
          </motion.span>

          <motion.span layout={slide} {...tie} className="flex shrink-0">
            <PhotoStack photos={service.photos} />
          </motion.span>

          <motion.span layout={slide} {...tie} className="ml-auto shrink-0">
            <Toggle open={intended} turns={turns} reduce={reduce} />
          </motion.span>
        </button>
      </motion.h3>

      {active && (
        <motion.div
          id={bodyId}
          layout={slide}
          {...tie}
          initial={{ opacity: 0 }}
          // Leaving is quick and happens inside the hold, so the text is gone
          // before the card it sits in starts to move.
          animate={{ opacity: intended ? 1 : 0 }}
          transition={{
            layout: MORPH,
            opacity: intended
              ? {
                  delay: reduce ? 0 : BODY_IN_S,
                  duration: 0.5,
                  ease: "easeOut",
                }
              : { duration: 0.18 },
          }}
          // Straight under the title, not pinned to the foot: the room left
          // below is where the card's glow sits.
          className="-mt-1 px-(--pad-x) pb-[calc(var(--pad)*1.6)]"
        >
          {/* Set like a statement, not a caption: tracked in and tightly led,
              grey and regular until the light reaches it, white and heavy
              once it has passed. */}
          <Illuminated
            text={service.body}
            delayMs={LIGHT_DELAY_MS}
            reduce={reduce}
            className="svc-copy text-[clamp(1.1875rem,1.5vw,1.4375rem)] leading-[1.12] tracking-[-0.018em]"
          />

          {/* The way out of the card and into the service's own page. Set as
              the bar's own call to action, boomerang pass and all, so the
              two read as the same invitation. */}
          <div className="mt-7 md:mt-9">
            <PassLink
              href={servicePath(service.slug)}
              label={`Explore ${service.title}`}
              className="btn-neu inline-flex rounded-[8px] px-5 py-3 text-[0.9375rem] leading-none"
              markClassName="text-[#4d4d4d]/35"
            />
          </div>
        </motion.div>
      )}
    </motion.article>
  );
}

/* ================================================================== */
/* Photos: three small squares, overlapped like a hand of cards         */
/* ================================================================== */

function PhotoStack({ photos }: { photos: readonly string[] }) {
  return (
    <span aria-hidden="true" className="flex">
      {photos.map((src, i) => (
        <span
          key={src}
          className="svc-photo relative block shrink-0 overflow-hidden"
          style={{ zIndex: i + 1, ["--i" as string]: i }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            width={320}
            height={320}
            loading="lazy"
            decoding="async"
            draggable={false}
            className="block size-full object-cover select-none"
          />
        </span>
      ))}
    </span>
  );
}

/* The studio's boomerang, in the circle where a plus would sit. Every click
   throws it three full turns; the circle turning white is what says the card
   is open, so the mark itself never has to change shape. */
const SPIN_TURNS = 3;
const SPIN_S = 2.7;

export function Toggle({
  open,
  turns,
  reduce,
}: {
  open: boolean;
  turns: number;
  reduce: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      data-open={open}
      className="svc-toggle relative grid size-10 place-items-center rounded-full md:size-11"
    >
      <motion.span
        className="block w-5 md:w-[1.375rem]"
        initial={false}
        animate={{ rotate: turns * 360 * SPIN_TURNS }}
        // Thrown, not wound: fast off the hand, easing into the catch.
        transition={
          reduce
            ? { duration: 0 }
            : { duration: SPIN_S, ease: [0.22, 1, 0.36, 1] }
        }
      >
        <BoomerangMark width="100%" className="block" />
      </motion.span>
    </span>
  );
}

/* ================================================================== */
/* Illuminated: the description, lit line by line                      */
/*                                                                     */
/* Lines are whatever the browser wrapped, so they are read back from   */
/* the layout: the words are set once, their tops grouped into lines,   */
/* and each line then gets its own sweep. Once the last one has run the */
/* spans are dropped for plain text, which rewraps freely on resize.    */
/* ================================================================== */

/** One wrapped line: whatever part of the lead fell on it, then the rest,
    then whatever of the marked tail reached it. */
type LitLine = { lead: string; body: string; mark: string };

function LineWords({ line }: { line: LitLine }) {
  return (
    <>
      {line.lead && <strong>{line.lead}</strong>}
      {line.lead && (line.body || line.mark) ? " " : null}
      {line.body}
      {line.body && line.mark ? " " : null}
      {line.mark && <mark>{line.mark}</mark>}
    </>
  );
}

export function Illuminated({
  text,
  lead,
  mark,
  delayMs,
  reduce,
  className,
}: {
  text: string;
  /** Set in bold ahead of the text and lit with it (the comparison table). */
  lead?: string;
  /** Run on under the text and struck through with a marker (the pillar).
      It keeps its own colours, so it is lit as its own ground asks. */
  mark?: string;
  delayMs: number;
  reduce: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [lines, setLines] = useState<LitLine[] | null>(null);
  const [lit, setLit] = useState(reduce);
  // Split after every hyphen as well as at spaces. The browser may break a
  // line inside "cost-benefit", and a word read back whole would put all of
  // it on the line its first half fell on, pushing that line past its edge.
  // A glued piece is followed by the rest of its word, not by a space.
  const pieces = (value: string) =>
    value.split(" ").flatMap((word) => {
      const parts = word.split("-");
      return parts.map((part, i) => {
        const glued = i < parts.length - 1;
        return { piece: glued ? `${part}-` : part, glued };
      });
    });
  const leadPieces = lead ? pieces(lead) : [];
  const markPieces = mark ? pieces(mark) : [];

  useLayoutEffect(() => {
    if (lit) return;
    const words = ref.current?.querySelectorAll<HTMLElement>("[data-word]");
    if (!words?.length) return;
    const found: LitLine[] = [];
    let top = Number.NaN;
    words.forEach((word) => {
      if (word.offsetTop !== top) {
        found.push({ lead: "", body: "", mark: "" });
        top = word.offsetTop;
      }
      const line = found[found.length - 1];
      const part =
        (word.textContent ?? "") +
        (word.dataset.glued === undefined ? " " : "");
      if (word.dataset.lead !== undefined) line.lead += part;
      else if (word.dataset.mark !== undefined) line.mark += part;
      else line.body += part;
    });
    setLines(
      found.map((line) => ({
        lead: line.lead.trimEnd(),
        body: line.body.trimEnd(),
        mark: line.mark.trimEnd(),
      })),
    );
    // Measured once per mount: the card remounts this for every opening.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A resize mid-sweep would leave the measured lines wrong, so it simply
  // finishes the effect.
  useEffect(() => {
    if (lit) return;
    const finish = () => setLit(true);
    window.addEventListener("resize", finish);
    return () => window.removeEventListener("resize", finish);
  }, [lit]);

  const per = lines ? LIGHT_MS / (1 + LIGHT_OVERLAP * (lines.length - 1)) : 0;

  return (
    <p ref={ref} className={className} data-lit={lit}>
      {lit ? (
        <>
          {lead && <strong>{lead}</strong>}
          {lead ? " " : null}
          {text}
          {mark ? " " : null}
          {mark && <mark>{mark}</mark>}
        </>
      ) : lines ? (
        lines.map((line, i) => (
          // The grey line holds the place and is the one read aloud; the
          // lit copy sits exactly over it and the light uncovers it.
          <span key={i} className="svc-line">
            <span>
              <LineWords line={line} />
            </span>
            <span
              aria-hidden="true"
              className="svc-line-lit"
              style={{
                animationDuration: `${per}ms`,
                animationDelay: `${delayMs + i * per * LIGHT_OVERLAP}ms`,
              }}
              onAnimationEnd={
                i === lines.length - 1 ? () => setLit(true) : undefined
              }
            >
              <LineWords line={line} />
            </span>
          </span>
        ))
      ) : (
        <>
          {/* The lead's spaces sit inside its bold, as they do once lit, so
              the words measure at the widths they will be drawn at. */}
          {leadPieces.length > 0 && (
            <>
              <strong>
                {leadPieces.map(({ piece, glued }, i) => (
                  <Fragment key={i}>
                    <span
                      data-word=""
                      data-lead=""
                      data-glued={glued ? "" : undefined}
                    >
                      {piece}
                    </span>
                    {glued || i === leadPieces.length - 1 ? null : " "}
                  </Fragment>
                ))}
              </strong>{" "}
            </>
          )}
          {pieces(text).map(({ piece, glued }, i) => (
            <Fragment key={i}>
              <span data-word="" data-glued={glued ? "" : undefined}>
                {piece}
              </span>
              {glued ? null : " "}
            </Fragment>
          ))}
          {/* Measured inside its own marker, padding and all, or the words
              would be read back at widths they are never drawn at. */}
          {markPieces.length > 0 && (
            <mark>
              {markPieces.map(({ piece, glued }, i) => (
                <Fragment key={i}>
                  <span
                    data-word=""
                    data-mark=""
                    data-glued={glued ? "" : undefined}
                  >
                    {piece}
                  </span>
                  {glued || i === markPieces.length - 1 ? null : " "}
                </Fragment>
              ))}
            </mark>
          )}
        </>
      )}
    </p>
  );
}
