"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  MotionConfig,
  motion,
  useReducedMotion,
  type MotionStyle,
  type Transition,
} from "motion/react";
import {
  BODY_IN_S,
  Illuminated,
  LIGHT_DELAY_MS,
  MORPH,
  Toggle,
  followPointer,
  useHeldChoice,
} from "./services";
import { ENTER_EASE } from "./enter";
import { PassLink } from "./floating-nav";
import { useSplitReveal } from "./split-reveal";

/* ==================================================================
   Studio

   The section has no title. It opens on a statement set straight on
   the page, two thirds of the shell wide from its left edge, with the
   pillar beside it from lg; the founders sit centred underneath.

   The statement is one sentence in two parts, and the two come in from
   the edges they are set against, towards each other. The first is set
   large and black on the page. The second is smaller, and everything
   after the colon it turns on is run through with a black marker and
   comes back out of it in white: the answer is the one thing on the page
   set out of the ink rather than in it.

   The copy and the cards are the service card again, down to the grain,
   the glow, the boomerang and the copy that is lit rather than faded
   in, so the two sections read as one material.

   The founders do not simply appear. One rectangle four by five fades
   in, grows, is held whole, and divides into the two cards (see
   split-reveal.tsx); the portraits are the last thing to arrive, inside
   the cards the shape left behind.

   Each founder has a card of their own, a thin frame round one portrait,
   and the two stand apart, centred as a pair. Choosing a portrait takes
   the other card away and opens the chosen one out, centred, to take
   that founder's words beside the portrait. The portrait keeps its
   size. The timing is the service card's: answered at once, moved a
   beat later.

   Below lg the open card is full width: the name takes the place beside
   the portrait and the copy runs underneath.
   ================================================================== */

const STATEMENT =
  "Nevima was born from two young people who share a fascination with web development, a field that is part of their academic background.";

/* The pillar, up to and including the colon it turns on. */
const PILLAR =
  "Our pillar is efficiency, because we produce elite results without needing long execution times. The secret is simple:";

/* And what follows it, which is run through with a black marker. */
const PILLAR_MARK = "the know-how we have and the use of the right tools.";

/** How far out of the shell each half of the statement starts, in pixels. */
const ENTER_SHIFT = 56;

/* The light runs down the copy as one read: the pillar picks it up before
   the last line of the statement has finished. */
const STATEMENT_LIGHT_MS = 150;
const PILLAR_LIGHT_MS = 1200;

/* A card coming back after a close waits until the open one is most of the
   way home before it shows. */
const RETURN_S = 0.5;

/* Radius and inner lines set inline, as on the service cards, so Motion can
   correct them for scale while a card is changing width. */
const SURFACE = {
  borderRadius: 22,
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 0 0 1px rgba(255,255,255,0.05)",
};

type FounderId = "ec" | "ap";

type Founder = {
  id: FounderId;
  name: string;
  role: string;
  bio: string;
  skills: readonly string[];
  photo: string;
  sizes: string;
  /** Where a crop sits across the frame. Emanuel is lit from the side and
      looking off to the left, so his crop leaves the room on that side. */
  focus?: string;
  /** space-separated RGB, taken from the photo, for the glow the card warms with */
  aura: string;
};

/* Left to right, as they stand. */
const FOUNDERS: Founder[] = [
  {
    id: "ec",
    name: "Emanuel Costa",
    role: "Co-founder",
    bio: "Emanuel (21) is currently pursuing a degree in Multimedia at ISLA, a historic network of private education institutions in Portugal that stands out in areas such as Management, Finance and Information Technology. Emanuel has freelance experience in professional photo shoots, having already provided that service at weddings, major regional political campaigns and more.",
    skills: [
      "Web structuring and programming",
      "User interface and user experience",
    ],
    photo: "/cofounders/ec.jpeg",
    sizes: "(min-width: 1024px) 460px, 45vw",
    focus: "44% 50%",
    aura: "34 196 112",
  },
  {
    id: "ap",
    name: "António Policarpo",
    role: "Co-founder",
    bio: "António (20) holds a degree in Business Communication from ISCAP, a school recognized as a benchmark in Business Sciences. Freelancing for a real estate company, António was in charge of planning and executing its communication ecosystem, which included the website and social media.",
    skills: [
      "Strategic communication",
      "Corporate identity (brand storytelling)",
      "SEO",
    ],
    photo: "/cofounders/ap.jpeg",
    sizes: "(min-width: 1024px) 460px, 45vw",
    aura: "196 158 128",
  },
];

/* ================================================================== */

export function Studio({ ready }: { ready: boolean }) {
  return (
    <section
      id="studio"
      aria-labelledby="studio-title"
      // No foot padding: the services section below brings its own head
      // room, and the two together would open a gap twice the rhythm.
      className="relative z-10 bg-paper pt-(--section-gap)"
    >
      <div className="shell">
        <h2 id="studio-title" className="sr-only">
          About Nevima
        </h2>

        <div className="std-wrap flex flex-col gap-11 md:gap-16">
          <Statement ready={ready} />
          <Founders ready={ready} />
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/* Statement                                                           */
/* ================================================================== */

function Statement({ ready }: { ready: boolean }) {
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);

  // While the opening plays its stage is fixed and takes no room, so this
  // copy sits at the top of the page right behind the curtain: watched from
  // the start, the light would run where nobody can see it. The watch only
  // begins once the page has been handed back.
  useEffect(() => {
    if (!ready || seen) return;
    const copy = ref.current;
    if (!copy) return;
    const watch = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setSeen(true);
      },
      { threshold: 0.45 },
    );
    watch.observe(copy);
    return () => watch.disconnect();
  }, [ready, seen]);

  const lit = seen || reduce;
  // Each half comes in from the edge it is set against and travels inwards,
  // so the sentence closes on itself. The fade is spent in the first third
  // and the slide carries on under it; the light follows once both have
  // arrived.
  const enter = (from: -1 | 1) => ({
    initial: false as const,
    animate: {
      opacity: lit ? 1 : 0,
      x: lit || reduce ? 0 : from * ENTER_SHIFT,
    },
    transition: {
      opacity: { duration: 0.42, ease: "easeOut" as const },
      x: { duration: 0.95, ease: ENTER_EASE },
    },
  });

  return (
    // From lg the pillar stands beside the statement rather than under it
    // (see .std-lede).
    <div ref={ref} className="std-lede">
      {/* The measure the statement is sized from (see .std-statement). */}
      <motion.div className="std-copy std-measure" {...enter(-1)}>
        <LitCopy
          lit={lit}
          reduce={reduce}
          delayMs={STATEMENT_LIGHT_MS}
          text={STATEMENT}
          className="svc-copy std-ink std-statement"
        />
      </motion.div>
      {/* The second half, smaller, with everything after the colon run
          through with a black marker: the answer the sentence has been
          building to is the only thing on the page set out of black rather
          than in it. */}
      <motion.div className="std-pillar-col" {...enter(1)}>
        <LitCopy
          lit={lit}
          reduce={reduce}
          delayMs={PILLAR_LIGHT_MS}
          text={PILLAR}
          mark={PILLAR_MARK}
          className="svc-copy std-ink std-pillar"
        />
        <LearnMore />
      </motion.div>
    </div>
  );
}

/* An invitation under the pillar, set on the same black bar as the second
   screen's section links: "Learn more" is only words, and "about us" is the
   silver button inside the bar, the one thing to press. There is no page
   about the studio yet, so it goes nowhere for now. */
function LearnMore() {
  return (
    <div className="mt-2 inline-flex items-center gap-2.5 rounded-[12px] bg-ink py-1 pr-1 pl-4 md:mt-3 md:gap-3 md:py-1.5 md:pr-1.5 md:pl-5">
      <span className="text-glow text-[0.8125rem] leading-none text-paper md:text-[0.9375rem]">
        Learn more
      </span>
      <PassLink
        href="#about"
        label="about us"
        className="btn-neu inline-flex rounded-[8px] px-4 py-2 text-[0.8125rem] leading-none md:py-2.5"
        markClassName="text-[#4d4d4d]/35"
      />
    </div>
  );
}

/* Grey and plain until the copy has been seen. Illuminated reads its lines
   back from the layout the moment it mounts, so it is only mounted once that
   layout is the one the reader gets: before the opening hands the page back
   there is no scrollbar yet, and every measured line would be a little too
   long for the page that follows. */
function LitCopy({
  lit,
  text,
  mark,
  delayMs,
  reduce,
  className,
}: {
  lit: boolean;
  text: string;
  mark?: string;
  delayMs: number;
  reduce: boolean;
  className: string;
}) {
  if (!lit)
    return (
      <p className={className}>
        {text}
        {mark ? " " : null}
        {mark && <mark>{mark}</mark>}
      </p>
    );
  return (
    <Illuminated
      text={text}
      mark={mark}
      delayMs={delayMs}
      reduce={reduce}
      className={className}
    />
  );
}

/* ================================================================== */
/* Founders                                                            */
/* ================================================================== */

function Founders({ ready }: { ready: boolean }) {
  const reduce = useReducedMotion() ?? false;
  const { intent, active, toggle, close, tried } = useHeldChoice<FounderId>(reduce);
  // One rectangle four by five, divided into the two cards. The cards are
  // the targets rather than the portraits inside them: a shape that landed
  // on the portrait would have had the card grow a frame around it at the
  // handover, and the whole point of the handover is that there is nothing
  // to see in it.
  const { host, revealed, overlay } = useSplitReveal({ ready });
  // Only a card coming back after a close fades in. On the first render
  // both are simply there.
  const settled = useRef(false);
  useEffect(() => {
    settled.current = true;
  }, []);

  /* The cards move by transform, so the room they take changes at once
     while what is seen of them catches up over the morph. Closing, that
     let the section below jump straight up and cover the bottom of a card
     that was still shrinking. The pair's height is carried from the old
     to the new over the same morph instead, so what follows moves with
     the cards. */
  const room = useRef<HTMLDivElement>(null);
  const lastHeight = useRef<number | null>(null);
  useLayoutEffect(() => {
    const box = room.current;
    const cards = host.current;
    if (!box || !cards) return;
    const to = cards.offsetHeight;
    const from = lastHeight.current;
    lastHeight.current = to;
    if (reduce || from === null || Math.abs(from - to) < 1) return;
    box.style.transition = "none";
    box.style.height = `${from}px`;
    void box.offsetHeight;
    box.style.transition = `height ${MORPH.duration}s cubic-bezier(${MORPH.ease.join(",")})`;
    box.style.height = `${to}px`;
    const release = window.setTimeout(() => {
      box.style.transition = "";
      box.style.height = "";
    }, MORPH.duration * 1000 + 60);
    return () => window.clearTimeout(release);
  }, [active, host, reduce]);

  /* A card left open closes itself once it is wholly off the screen, the
     visitor all the way into the section before or after it; never while
     any of it can still be seen. */
  useEffect(() => {
    const cards = host.current;
    if (!cards || intent === null) return;
    const watch = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) close();
    });
    watch.observe(cards);
    return () => watch.disconnect();
  }, [host, intent, close]);

  // Kept current through anything else that changes the pair's height
  // (a resize), so a morph always starts from what is on the page.
  useEffect(() => {
    const cards = host.current;
    if (!cards) return;
    const watch = new ResizeObserver(() => {
      if (!room.current?.style.height) lastHeight.current = cards.offsetHeight;
    });
    watch.observe(cards);
    return () => watch.disconnect();
  }, [host]);

  return (
    <MotionConfig transition={{ layout: MORPH }}>
      <div ref={room}>
      <div
        ref={host}
        data-beckon={!tried || undefined}
        role="group"
        aria-label="Founders"
        className="std-founders relative"
      >
        {FOUNDERS.map((founder) =>
          active && active !== founder.id ? null : (
            <FounderCard
              key={founder.id}
              founder={founder}
              leaving={intent !== null && intent !== founder.id}
              intended={intent === founder.id}
              open={active === founder.id}
              fadeIn={settled.current}
              revealed={revealed}
              reduce={reduce}
              layoutKey={active}
              onPick={toggle}
            />
          ),
        )}
        {overlay}
      </div>
      </div>
    </MotionConfig>
  );
}

function FounderCard({
  founder,
  leaving,
  intended,
  open,
  fadeIn,
  revealed,
  reduce,
  layoutKey,
  onPick,
}: {
  founder: Founder;
  /** The other founder has been chosen. The card fades inside the hold, so
      it is already gone when it is taken out of the layout. */
  leaving: boolean;
  intended: boolean;
  open: boolean;
  fadeIn: boolean;
  /** the shape that divides into the portraits has handed over */
  revealed: boolean;
  reduce: boolean;
  layoutKey: FounderId | null;
  onPick: (id: FounderId) => void;
}) {
  const [returning, setReturning] = useState(fadeIn);

  return (
    <motion.div
      layout={!reduce}
      // Tied to the open founder, as the service cards are to theirs: the
      // opening handing its stage back moves these cards a screen down the
      // page, and only a choice made in here may set them moving.
      layoutDependency={layoutKey}
      onPointerMove={followPointer}
      initial={fadeIn ? { opacity: 0 } : false}
      // Held out of sight until the shape that divides into these cards is
      // standing on the same pixels, then switched on whole underneath it
      // while it is still opaque. No fade: a crossfade would take the card
      // and the shape through half opacity together and the black would go
      // grey.
      animate={{ opacity: leaving || !revealed ? 0 : 1 }}
      transition={{
        layout: MORPH,
        opacity: leaving
          ? { duration: 0.2, ease: "easeOut" }
          : {
              delay: returning && !reduce ? RETURN_S : 0,
              duration: returning ? 0.5 : 0,
              ease: "easeOut",
            },
      }}
      onAnimationComplete={() => setReturning(false)}
      data-split-target=""
      data-founder={founder.id}
      data-open={open || undefined}
      data-intent={intended}
      // The glow pools under the words, which come in on the side away from
      // the portrait.
      data-side={founder.id === "ap" ? "left" : "right"}
      className="svc-card std-card std-founder relative isolate grid overflow-hidden text-paper"
      style={{ ...SURFACE, "--aura": founder.aura } as MotionStyle}
    >
      <span
        aria-hidden="true"
        className="svc-aura pointer-events-none absolute inset-0 -z-10"
      />
      <span
        aria-hidden="true"
        className="svc-spot pointer-events-none absolute inset-0 -z-10"
      />

      <Portrait
        founder={founder}
        intended={intended}
        open={open}
        revealed={revealed}
        reduce={reduce}
        layoutKey={layoutKey}
        onPick={onPick}
      />

      {open && (
        <Words
          key={founder.id}
          founder={founder}
          intended={intended}
          reduce={reduce}
          layoutKey={layoutKey}
        />
      )}
    </motion.div>
  );
}

function Portrait({
  founder,
  intended,
  open,
  revealed,
  reduce,
  layoutKey,
  onPick,
}: {
  founder: Founder;
  intended: boolean;
  open: boolean;
  revealed: boolean;
  reduce: boolean;
  layoutKey: FounderId | null;
  onPick: (id: FounderId) => void;
}) {
  // One full throw of the boomerang per click, counted rather than toggled,
  // exactly as on the service cards.
  const [turns, setTurns] = useState(0);
  // The boomerang sits in the inner corner of each portrait, so the two face
  // each other across the gap, and an open card's faces its words.
  const corner =
    founder.id === "ec" ? "right-2.5 md:right-3.5" : "left-2.5 md:left-3.5";

  return (
    <motion.div
      layout={reduce ? false : "position"}
      layoutDependency={layoutKey}
      className="std-photo relative"
      style={{ gridArea: "photo" }}
    >
      <button
        type="button"
        onClick={() => {
          setTurns((n) => n + 1);
          onPick(founder.id);
        }}
        aria-expanded={open}
        aria-controls={open ? `founder-${founder.id}` : undefined}
        aria-label={`${founder.name}, ${founder.role}`}
        className="group/photo relative block aspect-[4/5] w-full cursor-pointer overflow-hidden rounded-[inherit] bg-white/5 transition-transform duration-300 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper active:scale-[0.99]"
      >
        <Image
          src={founder.photo}
          alt=""
          fill
          sizes={founder.sizes}
          quality={90}
          loading="eager"
          draggable={false}
          // The last thing to arrive: the card comes back first, black, the
          // shape lifts off it, and only then, a beat later, does the
          // portrait fill it. Set inline rather than as a
          // class so it cannot be caught by the hover that moves the same
          // image on the other axis.
          style={{
            ...(founder.focus ? { objectPosition: founder.focus } : null),
            opacity: revealed ? 1 : 0,
            transition: "opacity 300ms 260ms var(--ease-out-quint)",
          }}
          className="object-cover select-none transition-transform duration-[900ms] ease-out-quint group-hover/photo:scale-[1.03] motion-reduce:transition-none"
        />

        {/* A dark disc under the ring: the bottom of either portrait can be
            white, and the resting boomerang is white too. */}
        <span
          aria-hidden="true"
          className={`absolute bottom-2.5 rounded-full bg-[#0b0b0b]/55 backdrop-blur-md md:bottom-3.5 ${corner}`}
        >
          <Toggle open={intended} turns={turns} reduce={reduce} />
        </span>
      </button>
    </motion.div>
  );
}

function Words({
  founder,
  intended,
  reduce,
  layoutKey,
}: {
  founder: Founder;
  intended: boolean;
  reduce: boolean;
  layoutKey: FounderId | null;
}) {
  const slide = reduce ? false : "position";
  // Up as the service copy comes up; out quickly and inside the hold, so the
  // words are gone before the card they sit in starts to move.
  const transition: Transition = {
    layout: MORPH,
    opacity: intended
      ? { delay: reduce ? 0 : BODY_IN_S, duration: 0.5, ease: "easeOut" }
      : { duration: 0.18 },
  };
  const fade = {
    initial: { opacity: 0 },
    animate: { opacity: intended ? 1 : 0 },
    transition,
  };

  return (
    <>
      <motion.div
        layout={slide}
        layoutDependency={layoutKey}
        {...fade}
        // Below lg the name sits over the copy, so the two share a left edge,
        // and stands beside the portrait with its last line on the
        // portrait's foot, the one line the two share.
        className="std-head min-w-0 self-end px-[calc(var(--pad-x)_-_var(--std-frame))] lg:self-start lg:px-(--pad-x) lg:pt-[calc(var(--pad)*1.15)]"
      >
        <h3 className="display text-[clamp(1.5rem,5.4vw,2.55rem)] leading-[1.06] tracking-[-0.02em] lg:text-[clamp(1.8rem,2.64vw,2.55rem)]">
          {founder.name}
        </h3>
        <p className="mt-1.5 text-[0.875rem] leading-snug text-paper/45">
          {founder.role}
        </p>
      </motion.div>

      <motion.div
        id={`founder-${founder.id}`}
        layout={slide}
        layoutDependency={layoutKey}
        {...fade}
        className="std-body min-w-0 px-[calc(var(--pad-x)_-_var(--std-frame))] pt-[calc(var(--pad)*0.75)] pb-[calc(var(--pad)*1.4)] lg:px-(--pad-x) lg:pt-5"
      >
        <Illuminated
          text={founder.bio}
          delayMs={LIGHT_DELAY_MS}
          reduce={reduce}
          className="svc-copy text-[clamp(1.1875rem,1.5vw,1.4375rem)] leading-[1.12] tracking-[-0.018em]"
        />

        <div className="mt-7 md:mt-9">
          <p className="text-[0.875rem] leading-snug text-paper/45">
            Key skills
          </p>
          <ul className="mt-2.5 space-y-1">
            {founder.skills.map((skill) => (
              <li
                key={skill}
                className="display text-[clamp(1.125rem,1.45vw,1.3125rem)] leading-[1.25] tracking-[-0.01em] text-paper/85"
              >
                {skill}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </>
  );
}
