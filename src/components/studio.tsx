"use client";

import { useEffect, useRef, useState } from "react";
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

/* ==================================================================
   Studio

   The section has no title. It opens on a statement set straight on
   the page, two thirds of the shell wide from its left edge, with the
   pillar beside it from lg; the founders sit centred underneath.

   The copy and the cards are the service card again, down to the grain,
   the glow, the boomerang and the copy that is lit rather than faded
   in, so the two sections read as one material.

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

const PILLAR =
  "Our pillar is efficiency, because we produce elite results without needing long execution times. The secret is simple: the know-how we have and the use of the right tools.";

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
  /** A landscape frame cropped to 9:16 is drawn far wider than its box, so
      it is asked for at the width it is drawn at, not the width it shows. */
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
    skills: ["Web structuring and programming", "User interface and user experience"],
    photo: "/cofounders/ec.jpeg",
    sizes: "(min-width: 1024px) 800px, 100vw",
    focus: "44% 50%",
    aura: "34 196 112",
  },
  {
    id: "ap",
    name: "António Policarpo",
    role: "Co-founder",
    bio: "António (20) holds a degree in Business Communication from ISCAP, a school recognized as a benchmark in Business Sciences. Freelancing for a real estate company, António was in charge of planning and executing its communication ecosystem, which included the website and social media.",
    skills: ["Strategic communication", "Corporate identity (brand storytelling)", "SEO"],
    photo: "/cofounders/ap.jpeg",
    sizes: "(min-width: 1024px) 320px, 50vw",
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
          <Founders />
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

  return (
    // From lg the pillar stands beside the statement rather than under it
    // (see .std-lede).
    <div ref={ref} className="std-lede">
      {/* The measure the statement is sized from (see .std-statement). */}
      <div className="std-copy std-measure">
        <LitCopy
          lit={lit}
          reduce={reduce}
          delayMs={STATEMENT_LIGHT_MS}
          text={STATEMENT}
          className="svc-copy std-ink std-statement"
        />
      </div>
      <div className="std-pillar-col">
        <LitCopy
          lit={lit}
          reduce={reduce}
          delayMs={PILLAR_LIGHT_MS}
          text={PILLAR}
          className="svc-copy std-ink std-pillar"
        />
      </div>
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
  delayMs,
  reduce,
  className,
}: {
  lit: boolean;
  text: string;
  delayMs: number;
  reduce: boolean;
  className: string;
}) {
  if (!lit) return <p className={className}>{text}</p>;
  return <Illuminated text={text} delayMs={delayMs} reduce={reduce} className={className} />;
}

/* ================================================================== */
/* Founders                                                            */
/* ================================================================== */

function Founders() {
  const reduce = useReducedMotion() ?? false;
  const { intent, active, toggle } = useHeldChoice<FounderId>(reduce);
  // Only a card coming back after a close fades in. On the first render
  // both are simply there.
  const settled = useRef(false);
  useEffect(() => {
    settled.current = true;
  }, []);

  return (
    <MotionConfig transition={{ layout: MORPH }}>
      <div role="group" aria-label="Founders" className="std-founders">
        {FOUNDERS.map((founder) =>
          active && active !== founder.id ? null : (
            <FounderCard
              key={founder.id}
              founder={founder}
              leaving={intent !== null && intent !== founder.id}
              intended={intent === founder.id}
              open={active === founder.id}
              fadeIn={settled.current}
              reduce={reduce}
              layoutKey={active}
              onPick={toggle}
            />
          ),
        )}
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
      animate={{ opacity: leaving ? 0 : 1 }}
      transition={{
        layout: MORPH,
        opacity: leaving
          ? { duration: 0.2, ease: "easeOut" }
          : { delay: returning && !reduce ? RETURN_S : 0, duration: 0.5, ease: "easeOut" },
      }}
      onAnimationComplete={() => setReturning(false)}
      data-founder={founder.id}
      data-open={open || undefined}
      data-intent={intended}
      // The glow pools under the words, which come in on the side away from
      // the portrait.
      data-side={founder.id === "ap" ? "left" : "right"}
      className="svc-card std-card std-founder relative isolate grid overflow-hidden text-paper"
      style={{ ...SURFACE, "--aura": founder.aura } as MotionStyle}
    >
      <span aria-hidden="true" className="svc-aura pointer-events-none absolute inset-0 -z-10" />
      <span aria-hidden="true" className="svc-spot pointer-events-none absolute inset-0 -z-10" />

      <Portrait
        founder={founder}
        intended={intended}
        open={open}
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
  reduce,
  layoutKey,
  onPick,
}: {
  founder: Founder;
  intended: boolean;
  open: boolean;
  reduce: boolean;
  layoutKey: FounderId | null;
  onPick: (id: FounderId) => void;
}) {
  // One full throw of the boomerang per click, counted rather than toggled,
  // exactly as on the service cards.
  const [turns, setTurns] = useState(0);
  // The boomerang sits in the inner corner of each portrait, so the two face
  // each other across the gap, and an open card's faces its words.
  const corner = founder.id === "ec" ? "right-2.5 md:right-3.5" : "left-2.5 md:left-3.5";

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
        className="group/photo relative block aspect-[9/16] w-full cursor-pointer overflow-hidden rounded-[inherit] bg-white/5 transition-transform duration-300 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper active:scale-[0.99]"
      >
        <Image
          src={founder.photo}
          alt=""
          fill
          sizes={founder.sizes}
          quality={90}
          draggable={false}
          style={founder.focus ? { objectPosition: founder.focus } : undefined}
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
        // Below lg the name sits over the copy, so the two share a left edge.
        className="std-head min-w-0 self-end px-[calc(var(--pad-x)_-_var(--std-frame))] pb-2 sm:pb-3 lg:self-start lg:px-(--pad-x) lg:pt-[calc(var(--pad)*1.15)] lg:pb-0"
      >
        <h3 className="display text-[clamp(1.5rem,5.4vw,2.55rem)] leading-[1.06] tracking-[-0.02em] lg:text-[clamp(1.8rem,2.64vw,2.55rem)]">
          {founder.name}
        </h3>
        <p className="mt-1.5 text-[0.875rem] leading-snug text-paper/45">{founder.role}</p>
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
          <p className="text-[0.875rem] leading-snug text-paper/45">Key skills</p>
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
