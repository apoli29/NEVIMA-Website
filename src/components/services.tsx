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
import { MotionConfig, motion, useReducedMotion, type MotionStyle } from "motion/react";
import { BoomerangMark } from "./boomerang";

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

type Service = {
  id: string;
  title: string;
  /** spelled out under the title where the title is an acronym */
  full?: string;
  body: string;
  /** space-separated RGB, taken from the photos, for the glow the card warms with */
  aura: string;
  /** back to front */
  photos: readonly [string, string, string];
};

const photo = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=320&h=320&fit=crop&auto=format&q=80`;

const SERVICES: Service[] = [
  {
    id: "web-design",
    title: "Web Design",
    body: "Nevima designs websites focused on making businesses stand out. We follow a strategic process to ensure the best results, from analyzing your audience and market to defining web design practices. This way, the final product goes far beyond your business needs and your stakeholders’ expectations. We also take care of the boring, logistical part after design, such as domain registration and deployment.",
    aura: "64 190 214",
    photos: [
      photo("1581291519195-ef11498d1cf2"),
      photo("1636215096587-21982fbf5843"),
      photo("1520445694166-4a2ca1ba362f"),
    ],
  },
  {
    id: "visual-identity",
    title: "Visual Identity",
    body: "This service is provided exclusively as a bundle with our web design service. If you request our web design service and we identify major flaws in your visual identity, we will suggest choosing this bundle over the individual web design service to ensure better results. It only includes the most relevant components of a visual identity, such as logo design and color and typography systems.",
    aura: "226 86 70",
    photos: [
      photo("1699662585308-fcb113a0a4ba"),
      photo("1600832331197-ad575931911b"),
      photo("1595142571206-88f8c64a9845"),
    ],
  },
  {
    id: "seo",
    title: "SEO",
    full: "Search Engine Optimization",
    body: "Regardless of the quality of the web design behind a website, it will only reach the right audience on a wide scale if premium, personalized SEO practices are applied. Nevima delivers this service both for websites designed by us and for external websites. Even though we already apply basic SEO in our web design service, SEO is highly recommended for businesses looking to reach higher positions in their audience’s search results.",
    aura: "218 158 86",
    photos: [
      photo("1614849963640-9cc74b2a826f"),
      photo("1544383835-bda2bc66a55d"),
      photo("1518065896235-a4c93e088e7a"),
    ],
  },
  {
    id: "geo",
    title: "GEO",
    full: "Generative Engine Optimization",
    body: "SEO practices are no longer the only relevant way to reach an audience, as AI is increasingly used to find companies. GEO focuses on getting your business’s name mentioned as a direct source by AI tools, which presents an opportunity to reach an even wider audience.",
    aura: "84 132 255",
    photos: [
      photo("1708311000280-861d2c89305a"),
      photo("1699500518986-f43f798cde1b"),
      photo("1706257038615-2d80b92587b7"),
    ],
  },
];

/* ================================================================== */

/** A choice that is answered at once and acted on a beat later. */
export function useHeldChoice<Id extends string>(reduce: boolean) {
  // `intent` is what the visitor asked for and is shown straight away;
  // `active` is what the layout is doing and follows it a beat later.
  const [intent, setIntent] = useState<Id | null>(null);
  const [active, setActive] = useState<Id | null>(null);
  // Read by the click handler, which can fire again inside the hold,
  // before React has re-rendered with the first click.
  const intentRef = useRef<Id | null>(null);
  const hold = useRef<number | undefined>(undefined);

  const choose = useCallback(
    (id: Id | null) => {
      intentRef.current = id;
      setIntent(id);
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

  useEffect(() => () => window.clearTimeout(hold.current), []);

  useEffect(() => {
    if (intent === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") choose(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [intent, choose]);

  return { intent, active, toggle };
}

export function Services() {
  const reduce = useReducedMotion() ?? false;
  const { intent, active, toggle } = useHeldChoice<string>(reduce);

  // The cards that step aside keep their order down the left column.
  const aside = SERVICES.filter((service) => service.id !== active);

  return (
    <section
      id="services"
      aria-labelledby="services-title"
      // No foot padding: the comparison below brings its own head room, as
      // this section does for the studio above it.
      className="relative z-10 bg-paper pt-(--section-gap)"
    >
      <div className="shell">
        <h2
          id="services-title"
          className="display text-[clamp(2.25rem,4.4vw,3.75rem)] font-light text-ink"
        >
          What we do
        </h2>

        <MotionConfig transition={{ layout: MORPH }}>
          <div
            className={`mt-10 grid grid-cols-1 gap-3 md:mt-14 lg:gap-4 ${
              active ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]" : ""
            }`}
          >
            {SERVICES.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                state={service.id === active ? "active" : active ? "aside" : "idle"}
                intended={intent === service.id}
                row={aside.indexOf(service) + 1}
                layoutKey={active}
                reduce={reduce}
                onToggle={toggle}
              />
            ))}
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
  event.currentTarget.style.setProperty("--mx", `${event.clientX - box.left}px`);
  event.currentTarget.style.setProperty("--my", `${event.clientY - box.top}px`);
}

function ServiceCard({
  service,
  state,
  intended,
  row,
  layoutKey,
  reduce,
  onToggle,
}: {
  service: Service;
  state: CardState;
  intended: boolean;
  row: number;
  /** the open card; the only thing allowed to set the layout moving */
  layoutKey: string | null;
  reduce: boolean;
  onToggle: (id: string) => void;
}) {
  const active = state === "active";
  const bodyId = `service-${service.id}`;
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
      className={`svc-card group relative isolate flex flex-col overflow-hidden text-paper has-[:focus-visible]:outline-1 has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-ink ${PLACEMENT[state]}`}
      // Radius and inner lines set here, not in CSS, so Motion can correct
      // them for the scale while the card is mid-move.
      style={
        {
          borderRadius: 22,
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 0 0 1px rgba(255,255,255,0.05)",
          "--row": row,
          "--aura": service.aura,
        } as MotionStyle
      }
    >
      <span aria-hidden="true" className="svc-aura pointer-events-none absolute inset-0 -z-10" />
      <span aria-hidden="true" className="svc-spot pointer-events-none absolute inset-0 -z-10" />

      <motion.h3 layout={move} {...tie} className={active ? "flex" : "flex flex-1"}>
        <button
          type="button"
          onClick={() => {
            setTurns((n) => n + 1);
            onToggle(service.id);
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
              ? { delay: reduce ? 0 : BODY_IN_S, duration: 0.5, ease: "easeOut" }
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

export function Toggle({ open, turns, reduce }: { open: boolean; turns: number; reduce: boolean }) {
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
          reduce ? { duration: 0 } : { duration: SPIN_S, ease: [0.22, 1, 0.36, 1] }
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

/** One wrapped line: whatever part of the lead fell on it, then the rest. */
type LitLine = { lead: string; body: string };

function LineWords({ line }: { line: LitLine }) {
  return (
    <>
      {line.lead && <strong>{line.lead}</strong>}
      {line.lead && line.body ? " " : null}
      {line.body}
    </>
  );
}

export function Illuminated({
  text,
  lead,
  delayMs,
  reduce,
  className,
}: {
  text: string;
  /** Set in bold ahead of the text and lit with it (the comparison table). */
  lead?: string;
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

  useLayoutEffect(() => {
    if (lit) return;
    const words = ref.current?.querySelectorAll<HTMLElement>("[data-word]");
    if (!words?.length) return;
    const found: LitLine[] = [];
    let top = Number.NaN;
    words.forEach((word) => {
      if (word.offsetTop !== top) {
        found.push({ lead: "", body: "" });
        top = word.offsetTop;
      }
      const line = found[found.length - 1];
      const part = (word.textContent ?? "") + (word.dataset.glued === undefined ? " " : "");
      if (word.dataset.lead === undefined) line.body += part;
      else line.lead += part;
    });
    setLines(found.map((line) => ({ lead: line.lead.trimEnd(), body: line.body.trimEnd() })));
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
              onAnimationEnd={i === lines.length - 1 ? () => setLit(true) : undefined}
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
                    <span data-word="" data-lead="" data-glued={glued ? "" : undefined}>
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
        </>
      )}
    </p>
  );
}
