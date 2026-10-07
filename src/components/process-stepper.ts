"use client";

import { useEffect, type RefObject } from "react";
import type Lenis from "lenis";
import { useReducedMotion } from "motion/react";

/* ==================================================================
   The How we work stepper

   The section slides its row sideways as the page is scrolled through
   it. Followed gesture by gesture that took dozens of turns of the
   wheel each way, and coming back up through it was a chore (the user's
   accessibility point, 2026-10-07). So inside it a gesture is not
   followed, it is counted: one gesture, of any size, moves the row on to
   its next stop, the way the second screen is drawn open over the
   studio. The stops are a screen of steps apart, never skipping a step,
   and every phase starts at a stop of its own, so a gesture down reads
   the next screenful and a gesture up the one before. At either end the
   page is handed back and scrolls as it always does.

   A trackpad flick is a stream of readings that runs on after the hand
   has stopped; the stream is one gesture. A new one is only taken once
   the page has come to rest and the readings have paused.
   ================================================================== */

/** How long a move between two stops takes, in seconds. */
const MOVE_S = 0.9;
/** The pause in the readings that marks the start of a new gesture. */
const QUIET_MS = 160;
/** A finger has to travel this far for a swipe to count. */
const SWIPE_PX = 28;
/** Near enough to be there. */
const SETTLED = 2;

const ease = (t: number) => 1 - Math.pow(1 - t, 3.2);

export function useProcessStepper(
  section: RefObject<HTMLElement | null>,
  lenis: RefObject<Lenis | null> | undefined,
  /** Where the stops are, as shares of the section's scroll (0 to 1). */
  stops: RefObject<number[]>,
  active: boolean,
) {
  const reduce = useReducedMotion() ?? false;

  useEffect(() => {
    if (!active || reduce) return;

    /** The section's run of the page: where it starts, and how long. */
    const run = () => {
      const s = section.current;
      if (!s) return null;
      const top = s.getBoundingClientRect().top + window.scrollY;
      return { top, span: Math.max(0, s.offsetHeight - window.innerHeight) };
    };
    const here = () => lenis?.current?.targetScroll ?? window.scrollY;

    /** The stop to go to from where the page is, going down or up; null
        to hand the gesture back to the page. */
    const next = (down: boolean) => {
      const r = run();
      if (!r || r.span < 1) return null;
      const y = here();
      // Outside the section, or at its edge going out of it.
      if (y < r.top - SETTLED || y > r.top + r.span + SETTLED) return null;
      if (down && y >= r.top + r.span - SETTLED) return null;
      if (!down && y <= r.top + SETTLED) return null;
      const at = stops.current.map((f) => r.top + f * r.span);
      return down
        ? (at.find((t) => t > y + SETTLED) ?? r.top + r.span)
        : ([...at].reverse().find((t) => t < y - SETTLED) ?? r.top);
    };

    let moving = false;
    let lastReading = 0;
    let armed = true;

    const go = (to: number) => {
      moving = true;
      armed = false;
      const instance = lenis?.current;
      const done = () => {
        moving = false;
      };
      if (instance) {
        instance.scrollTo(to, { duration: MOVE_S, easing: ease, lock: true, force: true, onComplete: done });
      } else {
        window.scrollTo({ top: to, behavior: "smooth" });
        window.setTimeout(done, MOVE_S * 1000);
      }
    };

    /** Whether this reading starts a new gesture. Anything read while
        the row is moving belongs to the gesture that moved it, however
        long a pause the page took to start the move: a slow first frame
        once left a pause that counted as a new gesture, and the rest of
        the flick moved the row on a second stop. */
    const fresh = (now: number) => {
      const quiet = now - lastReading > QUIET_MS;
      lastReading = now;
      if (moving) {
        armed = false;
        return false;
      }
      if (quiet) armed = true;
      return armed;
    };

    const capture = { passive: false, capture: true } as const;

    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      const to = next(event.deltaY > 0);
      if (to === null) return;
      event.preventDefault();
      event.stopPropagation();
      if (fresh(event.timeStamp)) go(to);
    };

    let startY = 0;
    let taken = false;
    const onTouchStart = (event: TouchEvent) => {
      startY = event.touches[0]?.clientY ?? 0;
      taken = false;
    };
    const onTouchMove = (event: TouchEvent) => {
      const by = startY - (event.touches[0]?.clientY ?? 0);
      if (Math.abs(by) < 4) return;
      const to = next(by > 0);
      if (to === null) return;
      // Held still: the swipe is read as one gesture when it ends.
      event.preventDefault();
      if (!taken && !moving && Math.abs(by) > SWIPE_PX) {
        taken = true;
        go(to);
      }
    };

    const DOWN = new Set(["ArrowDown", "PageDown", " ", "Spacebar"]);
    const UP = new Set(["ArrowUp", "PageUp"]);
    const onKey = (event: KeyboardEvent) => {
      const down = DOWN.has(event.key);
      if (!down && !UP.has(event.key)) return;
      const at = event.target as HTMLElement | null;
      if (at?.closest("input, textarea, select, [contenteditable]")) return;
      const to = next(down);
      if (to === null) return;
      event.preventDefault();
      event.stopPropagation();
      if (!moving) go(to);
    };

    window.addEventListener("wheel", onWheel, capture);
    window.addEventListener("touchstart", onTouchStart, { passive: true, capture: true });
    window.addEventListener("touchmove", onTouchMove, capture);
    window.addEventListener("keydown", onKey, true);
    return () => {
      window.removeEventListener("wheel", onWheel, capture);
      window.removeEventListener("touchstart", onTouchStart, true);
      window.removeEventListener("touchmove", onTouchMove, capture);
      window.removeEventListener("keydown", onKey, true);
    };
  }, [active, reduce, section, lenis, stops]);
}
