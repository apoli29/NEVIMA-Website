"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  animate,
  cubicBezier,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "motion/react";
import AeroShards from "../../components/AeroShards";
import { Comparison } from "./comparison";
import { FloatingNav, NAV } from "./floating-nav";
import { Services } from "./services";
import { useSmoothScroll } from "./smooth-scroll";
import { Studio } from "./studio";

/* ==================================================================
   One gesture, one take.

   The opening is not scrubbed. The first scroll gesture is a trigger:
   it starts a clock that runs the whole thing start to finish on its
   own, and nothing the visitor does with the wheel after that touches
   it. The page is held still for the length of the run and handed back
   with the second screen already on it.

   What happens is a single move. The mark does not dissolve; it travels
   from the middle of a black screen to the exact slot it occupies in
   the floating bar, and only once it has landed does the black leave.
   The bar is black too, so the mark stays white throughout and never
   has to change colour to survive the turn.

   The black is a curtain, not a backdrop: the second screen is already
   assembled underneath it and the fade simply lifts it off. That is why
   the bar has to be fully in before the curtain starts to go, otherwise
   the white mark would spend a few frames on white. Only the bar itself
   comes in that early, and it is black on black; its links come in with
   the page, on the curtain's own range, so nothing but the mark is seen
   before the page is.

   Read left to right, zero to one:

   mark   |--------- flight ---------|
   bar                                |-- in --|
   field                                       |-- in --|
   curtain                                      |--- off ---|
   links                                        |--- in ----|
   words                                          |- settle -|
   ================================================================== */

const RUN_MS = 3042;

/** A range on the run's clock, given in milliseconds from the trigger. */
const span = (from: number, to: number): [number, number] => [from / RUN_MS, to / RUN_MS];

const FLIGHT = span(204, 1700);
const BAR_IN = span(1836, 2380);
/* The second screen's arrival runs at 65% of its first length: every range
   from here on was scaled about the moment the curtain starts to lift, so
   the reveal begins exactly when it did and simply takes less time. */
const FIELD_IN = span(2292, 2734);
const CURTAIN_OFF = span(2380, 2910);
const WORDS_IN = span(2512, 3042);

/* Eased at both ends. It leans out of the middle of the screen rather than
   launching, and settles into the bar rather than arriving at it: over a
   five-fold change of scale, the two ends are the only parts anyone reads. */
const FLIGHT_EASE = cubicBezier(0.65, 0, 0.3, 1);

/** Where the mark starts, relative to where it ends. */
type Flight = { left: number; top: number; width: number; dx: number; dy: number; scale: number };

const PARKED: Flight = { left: 0, top: 0, width: 0, dx: 0, dy: 0, scale: 1 };

/* The measurement has to land before the first paint or the mark would be
   drawn twice in two different ways. On the server there is no layout to
   read, and useLayoutEffect would only warn about it. */
const useMeasureEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/* ================================================================== */
/* Screen two — the promise                                            */
/* ================================================================== */

const ENDINGS = ["matter", "create trust", "bring clients", "grab attention"];

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
    // The box is taller than the type so the descenders in "bring" and
    // "grab" clear the mask that the line slides through.
    <span aria-hidden="true" className="relative block h-[1.16em] overflow-hidden">
      <AnimatePresence initial={false}>
        <motion.span
          key={i}
          className="absolute inset-x-0 top-0 block leading-[1.16] whitespace-nowrap"
          initial={reduce ? { opacity: 0 } : { y: "100%", opacity: 0 }}
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

function StatementScreen({
  progress,
  settled,
}: {
  progress: MotionValue<number>;
  settled: boolean;
}) {
  const reduce = useReducedMotion();
  // No fade of its own: the copy is already there and the curtain uncovers
  // it. All it does is finish rising as the last of the black goes.
  const y = useTransform(progress, WORDS_IN, reduce ? [0, 0] : [30, 0]);

  return (
    // Padded clear of the floating bar: the copy centres in what is left of
    // the screen, not under it, which is the only thing that keeps them off
    // each other on a short viewport.
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center pt-24 md:pt-28">
      {/* A soft white wash under the copy: the shard field runs through the
          middle of the screen and black type needs its own ground. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-full bg-[radial-gradient(120%_80%_at_10%_50%,rgba(255,255,255,0.94)_0%,rgba(255,255,255,0.78)_38%,rgba(255,255,255,0)_72%)] md:w-[78%]"
      />

      <motion.div style={{ y }} className="shell pointer-events-auto relative">
        <h1 className="display h1 text-ink">
          <span aria-hidden="true" className="block font-light">
            We build websites that
          </span>
          <span className="block font-medium">
            <RotatingEnding active={settled} />
          </span>
          <span className="sr-only">
            We build websites that matter, create trust, bring clients and grab
            attention.
          </span>
        </h1>

        <h2 className="lede mt-9 max-w-[44ch] font-normal text-ash md:mt-12">
          Your brand is a story worth telling. We make sure it doesn&rsquo;t go
          unnoticed.
        </h2>
      </motion.div>
    </div>
  );
}

/* ================================================================== */
/* Footer                                                              */
/*                                                                     */
/* z-10 keeps it over the fixed shard field but under the opening      */
/* stage, which covers the viewport while the page is held at zero.    */
/* ================================================================== */

function Footer() {
  return (
    <footer id="contact" className="relative z-10 bg-paper">
      <div className="shell border-t border-hair py-14 md:py-16">
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/nevima-wordmark.svg"
              alt="nevima"
              className="h-[1.35rem] w-auto"
            />
            <p className="mt-5 max-w-[34ch] text-[0.9375rem] leading-relaxed text-ash">
              A two person studio building websites and visual identities.
            </p>
          </div>

          <div className="flex flex-col gap-3 md:items-end">
            <a
              href="mailto:ola@nevima.pt"
              className="text-[1.0625rem] text-ink transition-colors duration-300 hover:text-ash"
            >
              ola@nevima.pt
            </a>
            <nav aria-label="Footer" className="flex gap-6">
              {NAV.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-[0.9375rem] text-ash transition-colors duration-300 hover:text-ink"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </div>

        <p className="mt-12 text-[0.8125rem] text-ash-2">
          &copy; {new Date().getFullYear()} nevima
        </p>
      </div>
    </footer>
  );
}

/* ================================================================== */
/* The page                                                            */
/* ================================================================== */

type Phase = "waiting" | "running" | "open";

export function Home() {
  const reduce = useReducedMotion() ?? false;
  const progress = useMotionValue(0);
  const [phase, setPhase] = useState<Phase>("waiting");
  useSmoothScroll(phase !== "open");
  // The listeners need the current phase without being torn down and rebuilt
  // by it, and they fire before React has re-rendered.
  const phaseRef = useRef<Phase>("waiting");

  /* --- the flight, measured rather than guessed --------------------- */

  const heroSlot = useRef<HTMLDivElement>(null);
  const navSlot = useRef<HTMLImageElement>(null);
  const [flight, setFlight] = useState<Flight>(PARKED);

  useMeasureEffect(() => {
    const measure = () => {
      const hero = heroSlot.current?.getBoundingClientRect();
      const nav = navSlot.current?.getBoundingClientRect();
      if (!hero || !nav || nav.width === 0) return;
      setFlight({
        left: nav.left,
        top: nav.top,
        width: nav.width,
        scale: hero.width / nav.width,
        dx: hero.left + hero.width / 2 - (nav.left + nav.width / 2),
        dy: hero.top + hero.height / 2 - (nav.top + nav.height / 2),
      });
    };

    measure();
    // Only while the mark is still waiting: once it has flown, the bar owns
    // its own copy and a stale measurement cannot be seen.
    if (phaseRef.current !== "waiting") return;
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [phase]);

  const flown = flight.width > 0;
  const markX = useTransform(progress, FLIGHT, [flight.dx, 0], { ease: FLIGHT_EASE });
  const markY = useTransform(progress, FLIGHT, [flight.dy, 0], { ease: FLIGHT_EASE });
  const markScale = useTransform(progress, FLIGHT, [flight.scale, 1], {
    ease: FLIGHT_EASE,
  });

  const barOpacity = useTransform(progress, BAR_IN, [0, 1]);
  const curtainOpacity = useTransform(progress, CURTAIN_OFF, [1, 0]);
  // Exactly the curtain's inverse, so the links and the page arrive as one.
  const linksOpacity = useTransform(progress, CURTAIN_OFF, [0, 1]);
  const fieldOpacity = useTransform(progress, FIELD_IN, [0, 1]);

  /* --- the run ------------------------------------------------------ */

  const open = useCallback(() => {
    if (phaseRef.current !== "waiting") return;
    phaseRef.current = "running";
    setPhase("running");
    animate(progress, 1, {
      duration: reduce ? 0.7 : RUN_MS / 1000,
      // Linear on purpose: the clock is flat and each range carries its own
      // curve, so one eased master does not rush the middle.
      ease: "linear",
      onComplete: () => {
        phaseRef.current = "open";
        setPhase("open");
      },
    });
  }, [progress, reduce]);

  useEffect(() => {
    // Lenis is held and released by useSmoothScroll from the same phase.
    if (phase === "open") return;

    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    const previousOverscroll = root.style.overscrollBehavior;
    root.style.overflow = "hidden";
    root.style.overscrollBehavior = "none";
    window.scrollTo(0, 0);

    // Every gesture is swallowed for the length of the run. The first one is
    // also the trigger; the ones after it change nothing, because the run
    // owns its own clock from here.
    const swallow = (event: Event) => {
      event.preventDefault();
      open();
    };

    const SCROLL_KEYS = new Set([
      "ArrowDown",
      "ArrowUp",
      "PageDown",
      "PageUp",
      "Home",
      "End",
      " ",
      "Spacebar",
    ]);
    const onKey = (event: KeyboardEvent) => {
      if (!SCROLL_KEYS.has(event.key)) return;
      event.preventDefault();
      open();
    };

    let touchStart = 0;
    const onTouchStart = (event: TouchEvent) => {
      touchStart = event.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (event: TouchEvent) => {
      event.preventDefault();
      if (Math.abs((event.touches[0]?.clientY ?? 0) - touchStart) > 6) open();
    };

    // Captured, not bubbled: Lenis is listening for the same gestures and the
    // trigger has to be read before anything else has a chance to eat it.
    const capture = { passive: false, capture: true } as const;
    window.addEventListener("wheel", swallow, capture);
    window.addEventListener("touchstart", onTouchStart, { passive: true, capture: true });
    window.addEventListener("touchmove", onTouchMove, capture);
    window.addEventListener("keydown", onKey, true);

    return () => {
      root.style.overflow = previousOverflow;
      root.style.overscrollBehavior = previousOverscroll;
      window.removeEventListener("wheel", swallow, capture);
      window.removeEventListener("touchstart", onTouchStart, true);
      window.removeEventListener("touchmove", onTouchMove, capture);
      window.removeEventListener("keydown", onKey, true);
    };
  }, [phase, open]);

  return (
    <>
      <FloatingNav
        opacity={barOpacity}
        linksOpacity={linksOpacity}
        markRef={navSlot}
        markVisible={phase === "open"}
      />

      <main id="top" className="relative">
        {/* Fixed while the opening owns the viewport, then handed back to the
            flow at the same place: the page is still at zero, so nothing
            moves when it lands. */}
        {/* bg-paper is load bearing. While the stage is fixed it takes up no
            space, so the footer sits at the top of the page behind it, and
            mid-transition neither the curtain nor the field is fully opaque:
            their combined alpha dips and the footer reads through. The stage
            owning its own ground closes that window. */}
        {/* data-opening is what locks the page in CSS (globals.css). It is
            rendered on the server, so the lock is there from the first paint,
            before the listeners below exist. */}
        <section
          data-opening={phase === "open" ? undefined : ""}
          className={
            phase === "open"
              ? "relative h-[100svh] overflow-hidden bg-paper"
              : "fixed inset-0 z-30 overflow-hidden bg-paper"
          }
        >
          <motion.div
            className="absolute inset-0 z-0"
            style={{ opacity: fieldOpacity }}
            aria-hidden="true"
          >
            <AeroShards
              backgroundColor="#ffffff"
              shardColor="#000000"
              accentColor="#000000"
              placement="center"
              flow="stream"
              material="pearl"
              detail="balanced"
              effect="none"
              scale={0.8}
              spread={1}
              depth={1.25}
              speed={1}
              spin={2}
              interaction="repel"
              density={1.5}
              shardSize={0.65}
              stretch={0.7}
              turbulence={2}
              glow={2}
              edgeSoftness={2}
              bloom={1}
              grain={0}
              chromaticAberration={0}
              transitionDuration={1}
              interactionRadius={1.5}
              interactionStrength={0.25}
              rippleIntensity={1}
              holdToGather={true}
              // AeroShards.jsx gives every prop a default except onError, so
              // TS infers it as required. Passing undefined keeps the
              // configuration above exactly as specified.
              onError={undefined}
            />
          </motion.div>

          <StatementScreen progress={progress} settled={phase === "open"} />

          {/* The curtain. Black over a second screen that is already built,
              so lifting it is the whole transition. */}
          <motion.div
            className="absolute inset-0 z-20 bg-ink"
            style={{ opacity: curtainOpacity }}
            aria-hidden="true"
          />

          {/* The slot the mark starts in. Never painted: it exists to be
              measured, so the flight is described in real pixels. */}
          <div className="pointer-events-none absolute inset-0 z-30 grid place-items-center">
            <div
              ref={heroSlot}
              className="invisible aspect-[1103/243] w-[min(78vw,22rem)] md:w-[min(58vw,36rem)]"
            />
          </div>
        </section>

        <Studio ready={phase === "open"} />
        <Services />
        <Comparison ready={phase === "open"} />
      </main>

      <Footer />

      {/* The travelling mark, above everything until it has landed. Before
          the slots are measured it simply sits in the hero, which is also
          what the server renders, so the first paint is never empty. */}
      {phase !== "open" && (
        <div className="pointer-events-none fixed inset-0 z-[60]" aria-hidden="true">
          {flown ? (
            <motion.img
              src="/nevima-wordmark-white.svg"
              alt=""
              draggable={false}
              className="absolute select-none"
              style={{
                left: flight.left,
                top: flight.top,
                width: flight.width,
                x: markX,
                y: markY,
                scale: markScale,
                transformOrigin: "center",
              }}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/nevima-wordmark-white.svg"
              alt=""
              draggable={false}
              className="absolute top-1/2 left-1/2 w-[min(78vw,22rem)] -translate-x-1/2 -translate-y-1/2 select-none md:w-[min(58vw,36rem)]"
            />
          )}
        </div>
      )}
    </>
  );
}
