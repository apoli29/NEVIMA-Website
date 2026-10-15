"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { ENTER_EASE } from "./enter";
import { Illuminated } from "./services";

/* ==================================================================
   Studio

   A screen of its own (2026-10-14), full at rest, in two halves from lg
   aligned on their last lines (user, same day):

   - on the left, the statement, large and justified, 40% of the page,
     read in ink: it waits in a pale grey and each word turns black as
     the page brings it up, at the pace of the scroll. After "two" the
     co-founders are set into the line, two round portraits in colour in
     a capsule: the section's way to the about page. Its last words are
     underlined by a stroke drawn as they are read;
   - on the right, wider and smaller, the pillar, justified, its answer
     run through with the black marker.

   The co-founders' full plates are on the about page (cofounders.tsx).
   ================================================================== */

/* Soft hyphens in the long words: justified in a narrow column, the
   lines can break inside them rather than open gaps around them. */
const STATEMENT =
  "Nevima is a studio of two young friends who go way back, sharing a fas\u00adci\u00adna\u00adtion with com\u00admu\u00adni\u00adca\u00adtion and web de\u00advel\u00adop\u00adment. We\u2019re not here to be one more studio doing more of the same: we came with a com\u00adplete\u00adly dif\u00adfer\u00adent proposition.";

/* The pillar, up to and including the colon it turns on. */
const PILLAR =
  "Our pillar is efficiency, because we produce elite results without needing long execution times. The secret is simple:";

/* And what follows it, which is run through with a black marker. */
// A non-breaking hyphen: "know-how" is never split across two lines.
const PILLAR_MARK = "the know\u2011how we have and the use of the right tools.";

/** How far out of the shell each half of the statement starts, in pixels. */
const ENTER_SHIFT = 56;

/* The pillar is lit once the section is in sight. */
const PILLAR_LIGHT_MS = 500;

const FOUNDERS = [
  { name: "Emanuel Costa", photo: "/cofounders/ec.jpeg", focus: "44% 45%" },
  { name: "António Policarpo", photo: "/cofounders/ap.jpeg", focus: "50% 48%" },
] as const;

/* The statement's words, and where it is given its two people and its
   stroke. */
const WORDS = STATEMENT.split(" ");
const PORTRAITS_AFTER = WORDS.indexOf("two");
/* "a completely different proposition." */
const STROKE_FROM = WORDS.findIndex((w) => w.startsWith("com\u00adplete")) - 1;

/* ================================================================== */

export function Studio({ ready }: { ready: boolean }) {
  return (
    <section
      id="studio"
      aria-labelledby="studio-title"
      // A section of its own (user, 2026-10-14): a whole screen, the copy
      // held in the middle of it, with at least a section's room above and
      // below, so it stands well clear of the second screen it is drawn
      // over and of the services under it. A little more room on top: the
      // bar hangs over that end. One layer above the services, so the
      // "Learn more" drop's glass and shadow are never cut off by their
      // ground.
      className="relative z-[11] flex min-h-[100svh] flex-col justify-center bg-paper pt-[calc(var(--section-gap)+2rem)] pb-(--section-gap)"
    >
      <div className="shell">
        <h2 id="studio-title" className="sr-only">
          About Nevima
        </h2>

        <div className="std-wrap">
          <Statement ready={ready} />
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
    <div ref={ref} className="std-lede">
      {/* The measure the statement is sized from (see .std-statement). */}
      <motion.div className="std-copy std-measure" {...enter(-1)}>
        <InkStatement reduce={reduce} />
      </motion.div>

      {/* The pillar, with everything after the colon run through with a
          black marker: the answer is the one thing set out of black. */}
      <motion.div className="std-aside" {...enter(1)}>
        <LitCopy
          lit={lit}
          reduce={reduce}
          delayMs={PILLAR_LIGHT_MS}
          text={PILLAR}
          mark={PILLAR_MARK}
          className="svc-copy std-ink std-pillar"
        />
      </motion.div>
    </div>
  );
}

/* The statement, read in ink: each word turns from a pale grey to black
   as the page brings it up, one after another at the pace of the scroll.
   Done, it is simply black. */
function InkStatement({ reduce }: { reduce: boolean }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.95", "end 0.78"] });
  const n = WORDS.length;
  // Each word takes a little longer than its share, so the ink runs on
  // as a soft front rather than word by word in steps.
  const at = (i: number) => i / (n + 2);
  const span = 2.5 / n;

  const word = (i: number) => (
    <InkWord key={i} progress={scrollYProgress} from={at(i)} span={span} reduce={reduce}>
      {WORDS[i]}
    </InkWord>
  );

  const out: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    if (i === STROKE_FROM) {
      // The last words under one stroke, drawn as they are read.
      const under: React.ReactNode[] = [];
      for (let j = i; j < n; j++) under.push(word(j), j < n - 1 ? " " : null);
      out.push(
        <Stroke key="stroke" progress={scrollYProgress} from={at(i + 1)} to={Math.min(1, at(n - 1) + span)} reduce={reduce}>
          {under}
        </Stroke>,
      );
      break;
    } else out.push(word(i));
    if (i === PORTRAITS_AFTER) out.push(<Fragment key="p"> <Portraits progress={scrollYProgress} from={at(i)} reduce={reduce} /></Fragment>);
    if (i < n - 1) out.push(" ");
  }

  return (
    <p ref={ref} className="svc-copy std-statement std-read">
      {out}
    </p>
  );
}

function InkWord({
  progress,
  from,
  span,
  reduce,
  children,
}: {
  progress: MotionValue<number>;
  from: number;
  span: number;
  reduce: boolean;
  children: React.ReactNode;
}) {
  const color = useTransform(progress, [from, from + span], ["rgba(0, 0, 0, 0.14)", "rgba(0, 0, 0, 1)"]);
  return (
    <motion.span className="std-word" style={reduce ? undefined : { color }}>
      {children}
    </motion.span>
  );
}

function Stroke({
  progress,
  from,
  to,
  reduce,
  children,
}: {
  progress: MotionValue<number>;
  from: number;
  to: number;
  reduce: boolean;
  children: React.ReactNode;
}) {
  const draw = useTransform(progress, [from, to], ["0%", "100%"]);
  // Drawn as the span's own background, so it runs on across a line break
  // like the words it is under.
  return (
    <motion.span className="std-stroke" style={reduce ? undefined : ({ "--draw": draw } as never)}>
      {children}
    </motion.span>
  );
}

/* The two of them, set into the line after "two": round portraits in
   colour in a capsule, inked in with the words around them. They are
   the section's way to the about page (user, 2026-10-14): every few
   seconds they give a little shake, and pointed at they part and "Find
   out more about us" comes up between them. The parting is drawn over
   the line, never in it, so the justified text around never moves. */
function Portraits({
  progress,
  from,
  reduce,
}: {
  progress: MotionValue<number>;
  from: number;
  reduce: boolean;
}) {
  // It opens towards the side with room: at the start of a line it
  // grows to the right, at the end to the left, otherwise both ways.
  const [side, setSide] = useState<"both" | "left" | "right">("both");
  const aim = (el: HTMLElement) => {
    const line = el.closest("p")?.getBoundingClientRect();
    const box = el.getBoundingClientRect();
    if (!line) return;
    const reach = box.height * 2.4;
    if (box.left - line.left < reach) setSide("right");
    else if (line.right - box.right < reach) setSide("left");
    else setSide("both");
  };
  const opacity = useTransform(progress, [from, from + 0.06], [0.35, 1]);
  const scale = useTransform(progress, [from, from + 0.08], [0.82, 1]);
  return (
    <motion.a
      href="/about"
      className="std-faces"
      data-side={side}
      style={reduce ? undefined : { opacity, scale }}
      aria-label="Find out more about us"
      onPointerEnter={(e) => aim(e.currentTarget)}
      onFocus={(e) => aim(e.currentTarget)}
    >
      <span className="std-faces-in">
        <span className="std-face">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={FOUNDERS[0].photo} alt="" draggable={false} style={{ objectPosition: FOUNDERS[0].focus }} />
        </span>
        <span aria-hidden="true" className="std-faces-say">
          <span>Find out more about us</span>
        </span>
        <span className="std-face">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={FOUNDERS[1].photo} alt="" draggable={false} style={{ objectPosition: FOUNDERS[1].focus }} />
        </span>
      </span>
    </motion.a>
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
