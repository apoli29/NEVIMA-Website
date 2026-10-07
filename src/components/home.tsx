"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
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
import { FloatingNav } from "./floating-nav";
import { useGateway } from "./gateway";
import { JellyField } from "./jelly-field";
import { Process } from "./process";
import { ProposalOverlay, ProposalProvider, useProposalController } from "./proposal-flow";
import { Services } from "./services";
import { StatementScreen } from "./statement-screen";
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
   the white mark would spend a few frames on white. The bar comes in
   under the mark while it is still flying, black on black, so it is all
   there the moment the mark lands, and the curtain lifts 200ms later:
   the mark is held in its slot for one beat, no more. The bar's
   links come in with the page, on the curtain's own range, so nothing
   but the mark is seen before the page is.

   Read left to right, zero to one:

   mark   |--------- flight ---------|
   bar                    |-- in ---|
   field                         |-- in --|
   curtain                          |--- off ---|
   links                            |--- in ----|
   words                              |- settle -|
   ================================================================== */
const RUN_MS = 2242;

/** A range on the run's clock, given in milliseconds from the trigger. */
const span = (from: number, to: number): [number, number] => [from / RUN_MS, to / RUN_MS];

/* The mark sets off 102ms after the gesture lands. It once waited 204ms,
   which the user found slow to answer; with no wait at all it answered
   too abruptly, and the user asked for it 50% slower than that, so the
   wait is half the first one. The flight itself runs 1278ms (it went to
   748ms, then 1234ms, then 1481ms, then 1111ms, then 15% slower than
   that). Everything after it keeps its own length; the reveal starts
   200ms after the mark lands (see the diagram above). */
const FLIGHT = span(102, 1380);
const BAR_IN = span(836, 1380);
/* The second screen's arrival runs at 65% of its first length: every range
   from here on was scaled about the moment the curtain starts to lift, so
   the reveal begins exactly when it did and simply takes less time. */
const FIELD_IN = span(1492, 1934);
const CURTAIN_OFF = span(1580, 2110);
const WORDS_IN = span(1712, 2242);

/* Eased at both ends, but quicker out of the start than into the end: it is
   seen to move the moment it is asked to, and still settles into the bar
   rather than arriving at it. Over a five-fold change of scale, the two
   ends are the only parts anyone reads. */
const FLIGHT_EASE = cubicBezier(0.4, 0, 0.25, 1);

/** Where the mark starts, relative to where it ends. */
type Flight = { left: number; top: number; width: number; dx: number; dy: number; scale: number };

const PARKED: Flight = { left: 0, top: 0, width: 0, dx: 0, dy: 0, scale: 1 };

/* The measurement has to land before the first paint or the mark would be
   drawn twice in two different ways. On the server there is no layout to
   read, and useLayoutEffect would only warn about it. */
const useMeasureEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

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

/* The studio's top has reached the top of the screen: the second screen,
   stuck under it, is wholly covered by the studio and the services. */
function useCovered(ready: boolean) {
  const [covered, setCovered] = useState(false);
  useEffect(() => {
    if (!ready) return;
    const studio = document.getElementById("studio");
    if (!studio) return;
    const check = () => {
      const now = studio.getBoundingClientRect().top <= 0;
      setCovered((was) => (was === now ? was : now));
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, [ready]);
  return covered;
}

export function Home() {
  const reduce = useReducedMotion() ?? false;
  const progress = useMotionValue(0);
  const [phase, setPhase] = useState<Phase>("waiting");
  // The free-proposal form, carried out of the index (see proposal-flow.tsx).
  // While it is out, the page behind is held still and out of reach.
  const proposal = useProposalController();
  const lenis = useSmoothScroll(phase !== "open" || proposal.present);
  // The second screen and the studio are not scrolled between: the studio is
  // drawn up over the screen, a share of it per turn of the wheel.
  useGateway(lenis, phase === "open" && !proposal.present);
  // And what is on the studio waits until most of it is up. A section that
  // began to read itself out while it was still a third of the way onto the
  // screen would be half over before it was properly there.
  const studioIn = useStudioIn(phase === "open");
  // Once the studio has closed over the whole of the second screen, the
  // water under it is held still (see JellyField's covered).
  const covered = useCovered(phase === "open");
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
      const next: Flight = {
        left: hero.left,
        top: hero.top,
        width: hero.width,
        scale: nav.width / hero.width,
        dx: nav.left + nav.width / 2 - (hero.left + hero.width / 2),
        dy: nav.top + nav.height / 2 - (hero.top + height / 2),
      };
      // The same reading again is not a change. Without this the trigger
      // re-renders the page a second time on the frame the mark sets off.
      setFlight((prev) =>
        (Object.keys(next) as (keyof Flight)[]).every((k) => prev[k] === next[k]) ? prev : next,
      );
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
  // The words have no fade of their own: the curtain uncovers them. All
  // they do is finish rising as the last of the black goes.
  const wordsRise = useTransform(progress, WORDS_IN, reduce ? [0, 0] : [30, 0]);

  /* --- the run ------------------------------------------------------ */

  /* Scroll, a key, a swipe or a click: whichever comes first fires it. */
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

    // A click anywhere is a trigger too. It is swallowed like the rest: the
    // bar's links are already there under the curtain, invisible, and a
    // click that found one would leave the page before the opening had run.
    const onClick = (event: MouseEvent) => {
      if (event.button !== 0) return;
      event.preventDefault();
      event.stopPropagation();
      open();
    };

    // Captured, not bubbled: Lenis is listening for the same gestures and the
    // trigger has to be read before anything else has a chance to eat it.
    const capture = { passive: false, capture: true } as const;
    window.addEventListener("click", onClick, true);
    window.addEventListener("wheel", swallow, capture);
    window.addEventListener("touchstart", onTouchStart, { passive: true, capture: true });
    window.addEventListener("touchmove", onTouchMove, capture);
    window.addEventListener("keydown", onKey, true);

    return () => {
      root.style.overflow = previousOverflow;
      root.style.overscrollBehavior = previousOverscroll;
      window.removeEventListener("click", onClick, true);
      window.removeEventListener("wheel", swallow, capture);
      window.removeEventListener("touchstart", onTouchStart, true);
      window.removeEventListener("touchmove", onTouchMove, capture);
      window.removeEventListener("keydown", onKey, true);
    };
  }, [phase, open]);

  return (
    <ProposalProvider value={proposal}>
      {/* Everything but the form, put out of reach while the form is out. */}
      <div inert={proposal.present}>
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
            studio and the services, and lets it go underneath them. */}
        <div className="relative">
          {/* Stuck, not scrolled. The second screen stays where it is and the
              studio is drawn up over it, which is the whole of what the two
              gestures buy: the page does not travel to the next section, the
              next section closes over this one. It is held under the studio
              and the services and let go after them; once covered, the jelly
              field under it is held still rather than run for nobody. */}
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
            {/* The drops land on the water as the field comes up. */}
            <JellyField
              arrive={phase !== "waiting"}
              arriveDelay={(FIELD_IN[0] * RUN_MS) / 1000}
              covered={covered}
            />
          </motion.div>

          <StatementScreen rise={wordsRise} settled={phase === "open"} />

          {/* The curtain. Black over a second screen that is already built,
              so lifting it is the whole transition. Lifted, it is still on
              top, so from then on it lets the pointer through to the
              screen's links. */}
          <motion.div
            className="absolute inset-0 z-20 bg-ink"
            style={{
              opacity: curtainOpacity,
              pointerEvents: phase === "open" ? "none" : "auto",
            }}
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
          {/* The services are drawn over the screen too. The studio alone
              is shorter than the screen since the co-founders moved to the
              about page, and a stuck element only stays stuck while its
              box still has room: the screen came loose half covered and
              slid away under the studio instead of being closed over. */}
          <Services ready={phase === "open"} />
        </div>

        <Process ready={phase === "open"} lenis={lenis} />
        <Comparison ready={phase === "open"} />
      </main>

      <Footer />
      </div>

      <ProposalOverlay ctl={proposal} />

      {/* The travelling mark, above everything until it has landed. Before
          the slots are measured it simply sits in the hero, which is also
          what the server renders, so the first paint is never empty. */}
      {phase !== "open" && (
        <div className="pointer-events-none fixed inset-0 z-[60]">
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
                // Its own layer, rasterised once at the size it starts at and
                // only scaled from there. Without it the SVG is redrawn at
                // every step of a five-fold shrink, and the flight stutters.
                willChange: "transform",
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
          <ScrollCue gone={phase !== "waiting"} reduce={reduce} />
        </div>
      )}
    </ProposalProvider>
  );
}

/* The one hint on the black screen: a thin chevron under the mark, drifting
   down and back as if to show which way to go. It comes in after the mark
   has been seen on its own for a moment, and goes the instant the opening
   starts, well before the mark has left the middle. It is a button so the
   opening can be reached from the keyboard; the click itself is read by the
   page's own listener, like any other click on the black. */
function ScrollCue({ gone, reduce }: { gone: boolean; reduce: boolean }) {
  return (
    <motion.button
      type="button"
      aria-label="Scroll to enter"
      className="pointer-events-auto absolute bottom-[max(2rem,env(safe-area-inset-bottom))] left-1/2 -ml-6 grid size-12 cursor-pointer place-items-center text-white/70 transition-colors hover:text-white focus-visible:rounded-full focus-visible:outline focus-visible:outline-1 focus-visible:outline-white/60"
      initial={{ opacity: 0 }}
      animate={{ opacity: gone ? 0 : 1 }}
      transition={gone ? { duration: 0.25 } : { duration: 0.8, delay: 0.6 }}
      style={{ pointerEvents: gone ? "none" : undefined }}
      tabIndex={gone ? -1 : 0}
    >
      <motion.svg
        width="34"
        height="17"
        viewBox="0 0 34 17"
        fill="none"
        aria-hidden="true"
        animate={reduce ? undefined : { y: [0, 6, 0] }}
        transition={{ duration: 2.2, ease: "easeInOut", repeat: Infinity }}
      >
        <path
          d="M1 1.5 17 15.5 33 1.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </motion.svg>
    </motion.button>
  );
}
