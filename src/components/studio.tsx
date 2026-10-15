"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 1.05", "end 1"] });
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
    } else if (i === PORTRAITS_AFTER) {
      // "two" and the two of them are held together, with no space the
      // justification could stretch between them: opened, the capsule
      // grows on from where it stands and never slides away from the word.
      out.push(
        <span key="two" className="std-two">
          {word(i)}
          <Portraits progress={scrollYProgress} from={at(i)} reduce={reduce} />
        </span>,
      );
    } else out.push(word(i));
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
   seconds they give a shake, and pointed at (or reached from the
   keyboard) the capsule opens in the line: the two part, "Find out more
   about us" opens out between them and the words make room for it.

   Opening reflows the justified paragraph, so the opened capsule is
   worked out before it is shown (user, 2026-10-15: it opened and closed
   in a loop, thrown back and forth along its line). It is held to "two"
   (see InkStatement), so it only grows on from where it stands. Where
   its opened width sends the next word down a line, it grows on to the
   end of its own line, so the line stays full and the justification
   has no gap to throw open. And it is held open until the pointer is
   clearly away from both where it was and where it now is. A shake
   under way is eased out, not frozen at its tilt. */
function Portraits({
  progress,
  from,
  reduce,
}: {
  progress: MotionValue<number>;
  from: number;
  reduce: boolean;
}) {
  const [open, setOpen] = useState(false);
  const self = useRef<HTMLAnchorElement>(null);
  const shell = useRef<HTMLSpanElement>(null);
  const say = useRef<HTMLSpanElement>(null);
  const words = useRef<HTMLSpanElement>(null);
  // Opened by the pointer, it closes once the pointer is away; from the
  // keyboard, once the focus moves on.
  const by = useRef<"pointer" | "focus">("pointer");
  // Where the capsule stood as it was opened, the width it opens to, and
  // the shake's tilt at that moment.
  const was = useRef<DOMRect | null>(null);
  const width = useRef(0);
  const tilt = useRef("none");

  const show = (how: "pointer" | "focus") => {
    const a = self.current;
    const s = say.current;
    const w = words.current;
    const line = a?.closest("p");
    if (open || !a || !s || !w || !line) return;
    by.current = how;
    was.current = a.getBoundingClientRect();
    tilt.current = shell.current ? getComputedStyle(shell.current).transform : "none";

    // Set open for a moment, with nothing moving and the line ragged: its
    // breaks fall where they will once open, and the room left at the end
    // of the capsule's line can be read.
    const before = getComputedStyle(s);
    const fromMax = before.maxWidth;
    const fromWidth = s.style.width;
    const fromMargin = before.marginLeft;
    s.style.transition = "none";
    line.style.textAlign = "left";
    const own = w.offsetWidth;
    s.style.width = s.style.maxWidth = `${own}px`;
    s.style.marginInline = "0.06em";
    const capsule = a.getBoundingClientRect();
    const next = a.parentElement?.nextElementSibling?.getBoundingClientRect();
    const ends = !!next && next.top >= capsule.bottom;
    const lineEnd = line.getBoundingClientRect().right - parseFloat(getComputedStyle(line).paddingRight);
    width.current = own + (ends ? Math.max(0, Math.floor(lineEnd - capsule.right)) : 0);

    // Back as it stood, closed or still closing, to be opened from there.
    s.style.maxWidth = fromMax;
    s.style.width = fromWidth;
    s.style.marginInline = fromMargin;
    line.style.textAlign = "";
    void s.offsetWidth;
    s.style.transition = "";
    setOpen(true);
  };

  useLayoutEffect(() => {
    const s = say.current;
    if (!s) return;
    // Closing, it keeps its width and its room is taken back to nothing.
    if (!open) {
      s.style.maxWidth = "";
      return;
    }
    s.style.width = s.style.maxWidth = `${width.current}px`;
    s.style.marginInline = "";
    if (!reduce && tilt.current !== "none")
      shell.current?.animate([{ transform: tilt.current }, { transform: "none" }], {
        duration: 320,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      });
  }, [open, reduce]);

  useEffect(() => {
    if (!open) return;
    // A new width sets the line anew: closed, it is worked out again.
    const onResize = () => setOpen(false);
    window.addEventListener("resize", onResize);
    if (by.current === "focus")
      return () => window.removeEventListener("resize", onResize);
    const onMove = (event: PointerEvent) => {
      const now = self.current?.getBoundingClientRect();
      const then = was.current;
      if (!now || !then) return;
      const pad = 18;
      const near = (r: DOMRect) =>
        event.clientX > r.left - pad &&
        event.clientX < r.right + pad &&
        event.clientY > r.top - pad &&
        event.clientY < r.bottom + pad;
      if (!near(now) && !near(then)) setOpen(false);
    };
    const onLeave = () => setOpen(false);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [open]);

  const opacity = useTransform(progress, [from, from + 0.06], [0.35, 1]);
  const scale = useTransform(progress, [from, from + 0.08], [0.82, 1]);
  return (
    <motion.a
      ref={self}
      href="/about"
      className="std-faces"
      data-open={open ? "" : undefined}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") show("pointer");
      }}
      onFocus={(e) => {
        if (e.currentTarget.matches(":focus-visible")) show("focus");
      }}
      onBlur={() => {
        if (by.current === "focus") setOpen(false);
      }}
      style={reduce ? undefined : { opacity, scale }}
      aria-label="Find out more about us"
    >
      <span ref={shell} className="std-faces-in">
        <span className="std-face">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={FOUNDERS[0].photo} alt="" draggable={false} style={{ objectPosition: FOUNDERS[0].focus }} />
        </span>
        <span ref={say} aria-hidden="true" className="std-faces-say">
          <span ref={words}>Find out more about us</span>
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
