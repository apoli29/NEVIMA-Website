"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion, type MotionValue } from "motion/react";
import { useInkAlign } from "./ink-align";
import { ProposalForm } from "./proposal-form";

/* ==================================================================
   Screen two, hung as a gallery wall

   The water is the piece on show (see jelly-field.tsx), and the screen
   is set round it the way a room is set round a work. The headline
   hangs in the top left corner and the subtitle answers it from the top
   right; the drops have the room between; the way on through the site
   stands in the bottom right corner, pricing first and lit; and along
   the foot run the readouts, as on a wall text or an instrument (who,
   where, what time it is there, whether the studio is taking work).

   A black hairline runs over the readouts, in the same ink as the
   index's rules. The labels are in a
   monospace, the headline in the title face; between them they carry
   the studio's two sides, the gallery and the machine.

   Everything here is clear of the drops: each block that holds words is
   marked [data-jelly-quiet], and no drop ever passes under one.
   ================================================================== */

// Each one finishes the sentence, so each one ends it.
const ENDINGS = ["matter.", "create trust.", "bring clients.", "grab attention."];

/* Pricing leads, and is the one row kept lit (see .idx-lead). */
const SECTION_LINKS = [
  // A placeholder: there is no pricing section yet.
  { label: "Pricing", href: "#pricing", lead: true },
  { label: "About us", href: "/about", lead: false },
  { label: "Our services", href: "#services", lead: false },
];

/** Where the studio is, as the readout gives it. */
const PLACE = "Porto, Portugal";
const COORDS = "41.16° N  8.63° W";
const ZONE = "Europe/Lisbon";

/* ================================================================== */

export function StatementScreen({
  rise,
  settled,
}: {
  /** How far the words still have to rise into place, in pixels. */
  rise: MotionValue<number>;
  /** The opening has handed the page back. */
  settled: boolean;
}) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLHeadingElement>(null);
  useInkAlign(titleRef, subRef);
  return (
    // Padded clear of the floating bar at the top.
    <div className="pointer-events-none absolute inset-0 z-10 pt-[7.25rem] pb-[clamp(1.25rem,3.5svh,2.75rem)] md:pt-[clamp(8.5rem,17svh,10rem)]">
      <motion.div style={{ y: rise }} className="shell flex h-full flex-col">
        <div className="flex flex-wrap items-start justify-between gap-x-16 gap-y-4">
          {/* As wide as the headline's longest line and no wider, so the
              drops can come up to its right. */}
          <h1
            ref={titleRef}
            data-jelly-quiet
            className="display h1 trim-cap pointer-events-auto w-fit max-w-full shrink-0 text-ink"
          >
            <span aria-hidden="true" className="block font-light">
              We build websites that
            </span>
            <span className="block font-medium">
              <RotatingEnding active={settled} />
            </span>
            <span className="sr-only">
              We build websites that matter. We build websites that create trust.
              We build websites that bring clients. We build websites that grab attention.
            </span>
          </h1>
          {/* One sentence to a line, set closer than running text, the
              second a little heavier: it is the promise. Hung from the top
              right corner, its first line level with the top of the last letter
              of the headline's first line (see ink-align.ts); where there
              is no room beside it, under it, still on the right. */}
          <h2
            ref={subRef}
            data-jelly-quiet
            // Kept further off on a phone (see WARP_PAD in jelly-field.tsx).
            data-jelly-wide
            className="lede trim-cap pointer-events-auto ml-auto text-right text-[1.0625rem] font-normal leading-[1.3] text-ash md:text-[clamp(1.125rem,min(1.45vw,2.4svh),1.375rem)]"
          >
            <span className="block">Your brand is a story worth telling.</span>
            <span className="block font-medium">We make sure it doesn&rsquo;t go unnoticed.</span>
          </h2>
        </div>


        {/* The room the work has, with the way on standing in its bottom
            right corner. */}
        <div className="grid min-h-0 flex-1 grid-cols-12 gap-x-4">
          <SectionIndex settled={settled} />
        </div>

        <WallRule settled={settled} delay={0.2} className="mb-3 md:mb-4" />
        <Readouts settled={settled} />
      </motion.div>
    </div>
  );
}

/* ================================================================== */
/* The readouts along the foot                                          */
/* ================================================================== */

function Readouts({ settled }: { settled: boolean }) {
  return (
    <dl
      data-jelly-quiet
      // One row on a phone too: the studio's name is already in the bar
      // above, and the place and the status are said shorter there.
      className="pointer-events-auto grid grid-cols-3 gap-x-4 md:grid-cols-12"
    >
      <Readout label="Studio" className="max-md:hidden md:col-span-3">
        <Scramble text="Nevima™" active={settled} />
      </Readout>
      <Readout label="Based in" className="md:col-span-5 md:col-start-4">
        <span className="max-md:hidden">
          <Scramble text={PLACE} active={settled} delay={0.08} />
        </span>
        <span className="md:hidden">
          <Scramble text="Porto, PT" active={settled} delay={0.08} />
        </span>
        <span className="hidden text-ash-2 lg:inline">
          {"  "}
          <Scramble text={COORDS} active={settled} delay={0.16} />
        </span>
      </Readout>
      <Readout label="Local time" className="md:col-span-2 md:col-start-9">
        <Clock />
      </Readout>
      <Readout label="Status" className="text-right md:col-span-2 md:col-start-11">
        <span className="inline-flex items-center gap-2">
          <span aria-hidden="true" className="live-dot" />
          <span className="max-md:hidden">
            <Scramble text="Open for projects" active={settled} delay={0.24} />
          </span>
          <span className="md:hidden">
            <Scramble text="Open" active={settled} delay={0.24} />
          </span>
        </span>
      </Readout>
    </dl>
  );
}

function Readout({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <dt className="mono-label text-ash-2">{label}</dt>
      <dd className="mono-label mt-1 whitespace-pre text-ink">{children}</dd>
    </div>
  );
}

/** The time where the studio is, to the second. Blank until the page is
    in the browser: the server's clock is not the reader's. */
function Clock() {
  const [now, setNow] = useState<{ time: string; zone: string } | null>(null);

  useEffect(() => {
    // The offset is read rather than named: Lisbon is GMT in winter and
    // GMT+1 in summer, and the browser knows which it is today.
    const format = new Intl.DateTimeFormat("en-GB", {
      timeZone: ZONE,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZoneName: "shortOffset",
    });
    const tick = () => {
      const parts = format.formatToParts(new Date());
      const part = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
      setNow({
        time: `${part("hour")}:${part("minute")}:${part("second")}`,
        zone: part("timeZoneName"),
      });
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span className="tabular-nums">
      <time>{now?.time ?? "--:--:--"}</time>
      {now && <span className="text-ash-2 max-md:hidden"> {now.zone}</span>}
    </span>
  );
}

/* A readout comes up the way a display does: each character runs through a
   few others before it settles, left to right. The text is there for a
   screen reader from the start; only what is drawn is scrambled. */
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/_-+.";

function Scramble({
  text,
  active,
  delay = 0,
}: {
  text: string;
  active: boolean;
  delay?: number;
}) {
  const reduce = useReducedMotion() ?? false;
  const [shown, setShown] = useState(text);

  useEffect(() => {
    if (!active || reduce) return;
    const start = performance.now() + delay * 1000;
    const per = 28;
    const settleAfter = 260;
    let frame = 0;
    const step = (now: number) => {
      const t = now - start;
      if (t < 0) {
        frame = requestAnimationFrame(step);
        return;
      }
      let done = true;
      const out = Array.from(text, (ch, i) => {
        if (ch === " " || t > settleAfter + i * per) return ch;
        done = false;
        return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }).join("");
      setShown(out);
      if (!done) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [active, reduce, text, delay]);

  return (
    <>
      <span aria-hidden="true">{shown}</span>
      <span className="sr-only">{text}</span>
    </>
  );
}

/* ================================================================== */
/* The rule over the readouts                                           */
/* ================================================================== */

/* A black hairline, drawn in from the left as the screen settles, in the
   same ink as the index's rules above it. */
function WallRule({
  settled,
  delay,
  className,
}: {
  settled: boolean;
  delay: number;
  className?: string;
}) {
  const reduce = useReducedMotion() ?? false;
  const on = settled || reduce;
  return (
    <motion.div
      aria-hidden="true"
      className={`h-px origin-left bg-ink ${className ?? ""}`}
      initial={false}
      animate={{ scaleX: on ? 1 : 0 }}
      transition={{ duration: reduce ? 0 : 1.2, delay, ease: [0.65, 0, 0.35, 1] }}
    />
  );
}

/* ================================================================== */
/* The way on                                                          */
/* ================================================================== */

/* The rest of the page as an index: a name and an arrow to a row,
   between black hairlines, under a title set white on a black marker.
   Pointed at, a row is inked over from the left and its words come out
   of it in white (see .idx-link). Pricing leads and stays inked, with a
   live light before its name and its arrow running on ahead of it, over
   and over (see .idx-lead).

   The last row asks rather than points: "Get your free proposal",
   inked like Pricing, with a light passing over it and a slight swell
   of its black every few seconds (see .idx-ask), and a plus where the
   others have an arrow. Pressed, the
   index turns into the form itself, made of the same rows (see
   proposal-form.tsx), and Close turns it back. The water is told each
   time, so the drops move clear of the taller form. */
const ASK = "Get your free proposal";

/** When each part of the index comes in, in seconds after the screen has
    settled (the rule over the readouts is drawn from 0.2). */
const ENTRY = {
  label: 0.3,
  rows: 0.42,
  step: 0.09,
  ease: [0.22, 1, 0.36, 1] as const,
};

/* A row's black rule, drawn in from the left. */
function IndexRule({ on, reduce, delay }: { on: boolean; reduce: boolean; delay: number }) {
  return (
    <motion.span
      aria-hidden="true"
      className="absolute inset-x-0 top-0 z-10 block h-px origin-left bg-ink"
      initial={false}
      animate={{ scaleX: on ? 1 : 0 }}
      transition={{ duration: reduce ? 0 : 0.6, delay: reduce ? 0 : delay, ease: [0.65, 0, 0.35, 1] }}
    />
  );
}

function SectionIndex({ settled }: { settled: boolean }) {
  const reduce = useReducedMotion() ?? false;
  const on = settled || reduce;
  const [asking, setAsking] = useState(false);
  const askButton = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => {
    setAsking(false);
    // Back on the row that opened it, once the index is up again.
    window.setTimeout(() => askButton.current?.focus({ preventScroll: true }), 260);
  }, []);

  return (
    // The index and the form share one cell, both set at its foot, so the
    // box is always as tall as the taller of the two: the drops are laid
    // out clear of the form from the start and nothing on the water moves
    // when it opens (the user: they must stay as they are).
    <div
      data-jelly-quiet
      className="pointer-events-auto col-span-12 grid self-end pt-6 pb-6 md:pb-8 lg:col-span-4 lg:col-start-9"
    >
      <div className="col-start-1 row-start-1 self-end">
        <ProposalForm open={asking} onClose={close} />
      </div>
      {/* The drops perch above the index itself, not above the form's
          room round it (see jelly-field.tsx). */}
      <motion.nav
        data-jelly-perch
        aria-label="Sections"
        className="col-start-1 row-start-1 self-end"
        initial={false}
        animate={asking ? { opacity: 0, y: 8 } : { opacity: 1, y: 0 }}
        transition={{ duration: asking ? 0.22 : 0.35, delay: asking ? 0 : 0.15 }}
        inert={asking}
        aria-hidden={asking}
        style={{ pointerEvents: asking ? "none" : undefined }}
      >
        {/* The entrance, once the screen has settled, top to bottom as
            one gesture: the label is uncovered from the left, then each
            row's rule is drawn in from the left with its row coming in
            just behind it, and the rule under the last row closes the
            list. Nothing of it shows before its turn: a label over bare
            rules, the rows still to come, was what the user saw first. */}
        <p className="mono-label mb-2.5 flex items-center text-ash-2">
          <motion.span
            className="idx-title"
            initial={false}
            animate={{ clipPath: on ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)" }}
            transition={{ duration: reduce ? 0 : 0.5, delay: reduce ? 0 : ENTRY.label, ease: ENTRY.ease }}
          >
            Index
          </motion.span>
        </p>
        <ol className="relative">
          {[...SECTION_LINKS.map((link) => ({ key: link.href, link })), { key: "ask", link: null }].map(
            ({ key, link }, i) => (
              <li key={key} className="relative">
                <IndexRule on={on} reduce={reduce} delay={ENTRY.rows + i * ENTRY.step} />
                <motion.div
                  initial={false}
                  animate={{ opacity: on ? 1 : 0, x: on ? 0 : 12 }}
                  transition={{
                    duration: reduce ? 0 : 0.6,
                    delay: reduce ? 0 : ENTRY.rows + i * ENTRY.step + 0.12,
                    ease: ENTRY.ease,
                  }}
                >
                  {link ? (
                    <a href={link.href} className={`idx-link ${link.lead ? "idx-lead" : ""}`}>
                      <span className="idx-name flex items-center gap-2.5">
                        {link.lead && <span aria-hidden="true" className="live-dot" />}
                        {link.label}
                      </span>
                      <span aria-hidden="true" className="idx-arrow">
                        <Arrow />
                      </span>
                    </a>
                  ) : (
                    <button
                      ref={askButton}
                      type="button"
                      aria-expanded={asking}
                      aria-controls="proposal-form"
                      onClick={() => setAsking(true)}
                      className="idx-link idx-ask w-full text-left"
                    >
                      <span className="idx-name">{ASK}</span>
                      <span aria-hidden="true" className="idx-arrow">
                        <Plus />
                      </span>
                    </button>
                  )}
                </motion.div>
              </li>
            ),
          )}
          <li aria-hidden="true" className="relative h-px">
            <IndexRule
              on={on}
              reduce={reduce}
              delay={ENTRY.rows + (SECTION_LINKS.length + 1) * ENTRY.step}
            />
          </li>
        </ol>
      </motion.nav>
    </div>
  );
}

function Plus() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" className="block">
      <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}

function Arrow() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" className="block">
      <path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}

/* ================================================================== */
/* The headline's last line                                             */
/* ================================================================== */

function RotatingEnding({ active }: { active: boolean }) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);

  // Held on the first ending until the line is actually on screen, so the
  // visitor never arrives mid-rotation.
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(
      () => setI((v) => (v + 1) % ENDINGS.length),
      2800,
    );
    return () => window.clearInterval(id);
  }, [active]);

  return (
    // The mask the line slides through reaches well below the line, so the
    // tails of the "g" in "bring" and "grab" (Satoshi's run deep) are never
    // cut; the negative margin gives that room back, so the headline is set
    // exactly as if the box were one line tall.
    <span aria-hidden="true" className="relative -mb-[0.24em] block h-[1.4em] overflow-hidden">
      <AnimatePresence initial={false}>
        <motion.span
          key={i}
          className="absolute inset-x-0 top-0 block leading-[1.16] whitespace-nowrap"
          // From past the foot of the mask, which now reaches below the line.
          initial={reduce ? { opacity: 0 } : { y: "125%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { y: "-100%", opacity: 0 }}
          transition={{ duration: reduce ? 0.4 : 0.72, ease: [0.16, 1, 0.3, 1] }}
        >
          {ENDINGS[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
