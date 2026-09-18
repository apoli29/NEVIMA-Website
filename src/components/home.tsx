"use client";

import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
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
import { Comparison } from "./comparison";
import { Footer } from "./footer";
import { BoomerangMark } from "./boomerang";
import { FloatingNav, PassLink } from "./floating-nav";
import { useGateway } from "./gateway";
import { JellyField } from "./jelly-field";
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
    // each other on a short viewport. On an upright screen the mark lies
    // across the bottom, so the copy is set high instead, above it.
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center pt-24 md:pt-28 upright:items-start upright:pt-[clamp(7rem,19svh,14rem)]">
      {/* data-jelly-quiet: the drops under the jelly keep clear of
          everything in here, links included (see jelly-field.tsx). */}
      <motion.div style={{ y }} data-jelly-quiet className="shell pointer-events-auto relative">
        {/* As wide as the headline's longest line and no wider, so the row
            under it can end exactly where the headline does. */}
        <div className="w-fit max-w-full">
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

        {/* The subtitle and the section links, side by side. The row takes
            no width of its own (w-0) and fills the headline's (min-w-full);
            the links take whatever the subtitle leaves and run to the end of
            it, so they finish flush with the headline. Their type grows with
            the screen as the headline's does, so on any desktop they fit
            beside the subtitle; only on a tablet or a phone, where they
            cannot, do they drop under it, still ending where it ends. */}
        <div className="mt-[1.125rem] flex w-0 min-w-full flex-wrap items-center gap-x-6 gap-y-7 md:mt-6">
          {/* One sentence to a line, set closer than running text, the
              second a little heavier: it is the promise. */}
          <h2 className="lede text-[clamp(1.35rem,min(1.86vw,2.95svh),1.65rem)] font-normal leading-[1.3] text-ash">
            <span className="block">Your brand is a story worth telling.</span>
            <span className="block font-medium">We make sure it doesn&rsquo;t go unnoticed.</span>
          </h2>
          <SectionLinks />
        </div>
        </div>
      </motion.div>
    </div>
  );
}

/* The rest of the page in three words, on a black bar of its own, the
   links lit white on it and spread along it, a small boomerang standing
   in the middle of each space between them. The same pass as the floating
   bar's. Pricing is a placeholder: there is no pricing section yet. */
const SECTION_LINKS = [
  { label: "About us", href: "#studio" },
  { label: "Our services", href: "#services" },
  { label: "Pricing", href: "#pricing" },
];

function SectionLinks() {
  return (
    <nav
      aria-label="Sections"
      className="ml-auto flex max-w-[34rem] flex-auto items-center justify-between gap-1.5 rounded-[14px] bg-ink px-3 py-1.5 md:gap-2 md:px-4 md:py-2"
    >
      {SECTION_LINKS.map((link, i) => (
        <Fragment key={link.href}>
          {i > 0 && (
            // Turned over, so the elbow points up between the words.
            <BoomerangMark width={17} className="w-[17px] shrink-0 rotate-180 text-paper/45 md:w-[19px]" />
          )}
          <PassLink
            href={link.href}
            label={link.label}
            className="text-glow inline-flex px-2 py-2.5 text-[0.84rem] leading-none text-paper md:px-[0.9em] md:py-[0.85em] md:text-[clamp(0.78rem,min(1.056vw,1.68svh),1.02rem)]"
            markClassName="text-paper/70"
          />
        </Fragment>
      ))}
    </nav>
  );
}

/* ================================================================== */
/* The page                                                            */
/* ================================================================== */

type Phase = "waiting" | "running" | "open";

/** How much of the studio has to be up before it starts to read itself out. */
const STUDIO_IN = 0.7;

/* Latched: once the section has been seen, drawing it back down again does
   not unsay it. */
function useStudioIn(ready: boolean) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ready || inView) return;
    const studio = document.getElementById("studio");
    if (!studio) return;
    const check = () => {
      if (studio.getBoundingClientRect().top <= window.innerHeight * (1 - STUDIO_IN)) {
        setInView(true);
      }
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, [ready, inView]);

  return inView;
}

export function Home() {
  const reduce = useReducedMotion() ?? false;
  const progress = useMotionValue(0);
  const [phase, setPhase] = useState<Phase>("waiting");
  const lenis = useSmoothScroll(phase !== "open");
  // The second screen and the studio are not scrolled between: the studio is
  // drawn up over the screen, a share of it per turn of the wheel.
  useGateway(lenis, phase === "open");
  // And what is on the studio waits until most of it is up. A section that
  // began to read itself out while it was still a third of the way onto the
  // screen would be half over before it was properly there.
  const studioIn = useStudioIn(phase === "open");
  // The listeners need the current phase without being torn down and rebuilt
  // by it, and they fire before React has re-rendered.
  const phaseRef = useRef<Phase>("waiting");

  /* --- the flight, measured rather than guessed --------------------- */

  const heroSlot = useRef<HTMLDivElement>(null);
  const navSlot = useRef<HTMLImageElement>(null);
  const [flight, setFlight] = useState<Flight>(PARKED);
  // The bar's mark is a file, and until it is in it has no width to measure
  // against. Without this the first reading is thrown away and the mark is
  // left parked until something else happens to ask for another one.
  const [markReady, setMarkReady] = useState(false);

  useMeasureEffect(() => {
    const measure = () => {
      const hero = heroSlot.current?.getBoundingClientRect();
      const nav = navSlot.current?.getBoundingClientRect();
      if (!hero || !nav || nav.width === 0) return;
      // The mark is drawn at the size it spends the flight closest to and
      // longest at, and the height it will actually take there, read off the
      // bar's copy rather than off the slot it is measured against.
      const height = (hero.width * nav.height) / nav.width;
      setFlight({
        left: hero.left,
        top: hero.top,
        width: hero.width,
        scale: nav.width / hero.width,
        dx: nav.left + nav.width / 2 - (hero.left + hero.width / 2),
        dy: nav.top + nav.height / 2 - (hero.top + height / 2),
      });
    };

    measure();
    // Only while the mark is still waiting: once it has flown, the bar owns
    // its own copy and a stale measurement cannot be seen.
    if (phaseRef.current !== "waiting") return;
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [phase, markReady]);

  const flown = flight.width > 0;
  /* Out of the middle, not into it. The mark rests at its full size and is
     taken down to the bar's, rather than resting at the bar's size and being
     blown up to fill the screen: an <img> of an SVG is rasterised at the size
     it is laid out at, so a mark parked five times smaller than it is drawn
     would spend the whole of the first screen as a five-fold enlargement of a
     bar-sized bitmap. Same measurements, read the other way round; the only
     difference is that the mark is now sharp where it is biggest and softens
     on the way into the bar, which is where the bar's own copy takes over. */
  const markX = useTransform(progress, FLIGHT, [0, flight.dx], { ease: FLIGHT_EASE });
  const markY = useTransform(progress, FLIGHT, [0, flight.dy], { ease: FLIGHT_EASE });
  const markScale = useTransform(progress, FLIGHT, [1, flight.scale], {
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
        onMarkLoad={() => setMarkReady(true)}
        markVisible={phase === "open"}
      />

      <main id="top" className="relative">
        {/* The second screen and the studio share a box, and that is what
            makes the overlap possible: a stuck element can only stay stuck
            inside its own container, so the container has to be the one the
            studio is in. It holds the screen in place for the length of the
            studio and lets it go underneath it. */}
        <div className="relative">
          {/* Stuck, not scrolled. The second screen stays where it is and the
              studio is drawn up over it, which is the whole of what the two
              gestures buy: the page does not travel to the next section, the
              next section closes over this one. It is let go once the studio
              has gone by, so the jelly field is not left running under the
              rest of the page. */}
          {/* bg-paper is load bearing. Mid-transition neither the curtain nor
              the field is fully opaque: their combined alpha dips, and
              whatever is behind reads through. The stage owning its own
              ground closes that window. */}
          {/* data-opening is what locks the page in CSS (globals.css). It is
              rendered on the server, so the lock is there from the first
              paint, before the listeners below exist. */}
          <section
            data-opening={phase === "open" ? undefined : ""}
            className={
              phase === "open"
                ? "sticky top-0 h-[100svh] overflow-hidden bg-paper"
                : "fixed inset-0 z-30 overflow-hidden bg-paper"
            }
          >
          <motion.div
            className="absolute inset-0 z-0"
            style={{ opacity: fieldOpacity }}
            aria-hidden="true"
          >
            {/* The mark drags itself in as the field comes up. */}
            <JellyField
              arrive={phase !== "waiting"}
              arriveDelay={(FIELD_IN[0] * RUN_MS) / 1000}
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

          <Studio ready={studioIn} />
        </div>

        <Services ready={phase === "open"} />
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
            // Centred the way the slot it stands in is centred, so the two
            // renderings are the same box and the handover from one to the
            // other cannot be seen.
            <div className="absolute inset-0 grid place-items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/nevima-wordmark-white.svg"
                alt=""
                draggable={false}
                className="w-[min(78vw,22rem)] select-none md:w-[min(58vw,36rem)]"
              />
            </div>
          )}
        </div>
      )}
    </>
  );
}
