"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { ENTER_EASE } from "./enter";
import { PassLink } from "./floating-nav";
import { Illuminated } from "./services";

/* ==================================================================
   Studio

   A screen of its own (2026-10-14), full at rest: whatever moves in it
   leaves it full once it has stopped. Composed in two halves (user, same
   day: smaller, justified, half the page, and everything else on the
   right with room to breathe):

   - on the left, the statement, justified, read in ink: it waits in a
     pale grey and each word turns black as the page brings it up, at the
     pace of the scroll. After "two" the co-founders are set into the
     line, two round portraits in colour in a capsule that part when
     pointed at and lead to the about page; its last words are underlined
     by a stroke drawn as they are read;
   - on the right, spread down the statement's height: the "The studio"
     marker with a hairline drawn across and who and where; the pillar,
     its answer run through with the black marker, and "Learn more about
     us"; and at the foot, over a hairline, the two names.

   The co-founders' full plates are on the about page (cofounders.tsx).
   ================================================================== */

const STATEMENT =
  "Nevima is a studio of two young friends who go way back, sharing a fascination with communication and web development. We’re not here to be one more studio doing more of the same: we came with a completely different proposition.";

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
const STROKE_FROM = WORDS.lastIndexOf("completely") - 1;

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

      <motion.div className="std-aside" {...enter(1)}>
        <div>
          <div className="std-head mono-label">
            <span className="idx-title">The studio</span>
            <motion.span
              aria-hidden="true"
              className="std-head-rule"
              initial={false}
              animate={{ scaleX: lit ? 1 : 0 }}
              transition={{ duration: reduce ? 0 : 1.1, delay: 0.2, ease: ENTER_EASE }}
            />
          </div>
          <p className="std-head-note mono-label">Two people &middot; Porto, Portugal</p>
        </div>

        {/* The pillar, with everything after the colon run through with
            a black marker: the answer is the one thing set out of black. */}
        <div>
          <LitCopy
            lit={lit}
            reduce={reduce}
            delayMs={PILLAR_LIGHT_MS}
            text={PILLAR}
            mark={PILLAR_MARK}
            className="svc-copy std-ink std-pillar"
          />
          <LearnMore />
        </div>

        <dl className="std-names mono-label">
          {FOUNDERS.map((f) => (
            <div key={f.name}>
              <dt>{f.name}</dt>
              <dd>Co-founder</dd>
            </div>
          ))}
        </dl>
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
   colour in a capsule, inked in with the words around them, parted a
   little when pointed at, and the way to the about page. */
function Portraits({
  progress,
  from,
  reduce,
}: {
  progress: MotionValue<number>;
  from: number;
  reduce: boolean;
}) {
  const opacity = useTransform(progress, [from, from + 0.06], [0.35, 1]);
  const scale = useTransform(progress, [from, from + 0.08], [0.82, 1]);
  return (
    <motion.a
      href="/about"
      className="std-faces"
      style={reduce ? undefined : { opacity, scale }}
      aria-label="Emanuel Costa and António Policarpo, the co-founders: about us"
    >
      {FOUNDERS.map((f) => (
        <span key={f.name} className="std-face">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={f.photo} alt="" draggable={false} style={{ objectPosition: f.focus }} />
        </span>
      ))}
    </motion.a>
  );
}

/* An invitation under the pillar: one black drop, the same glass as the
   site's other buttons, reading "Learn more about us" in one weight, one
   run of words, with an arrow. It once split the line in two (the plain
   words beside a heavier link) and the gap and the change of weight
   between them read as mistakes; it is all one link now, to the about
   page. */
function LearnMore() {
  return (
    <div className="mt-3 md:mt-4">
      <PassLink
        href="/about"
        label={
          <>
            Learn more about us
            <span aria-hidden="true" className="ml-2 inline-block">
              &rarr;
            </span>
          </>
        }
        className="cta-drop inline-flex text-[0.875rem] leading-none md:text-[0.9375rem]"
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
