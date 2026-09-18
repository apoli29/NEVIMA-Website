"use client";

import { useEffect, type RefObject } from "react";
import type Lenis from "lenis";
import { useReducedMotion } from "motion/react";

/* ==================================================================
   The gateway

   Between the second screen and the studio the page is not scrolled,
   it is drawn open. The second screen is stuck to the top (see
   home.tsx) and the studio is pulled up over it; what the wheel does
   here is not carry the page to the next section but open that one
   screen, and it opens further than it is turned.

   Nothing is fired and nothing is snapped. The gesture is followed
   rather than read as a trigger: the studio rises as far as the hand
   asks and keeps rising after it stops, and where it comes to rest is
   never quite where the last one did.

   The weight is not this file's. The gesture is taken off the wheel,
   multiplied, and handed to the same smooth scroll the rest of the page
   runs on, by the same door its own wheel input goes through — so the
   screen is drawn up with the identical duration, easing and drag as
   any other scrolling on the site, and there is no second feel to keep
   in step with the first. All that is done here is the arithmetic
   between the hand and the page.

   Only this one screen is held. Once the studio is up, the page below
   it scrolls the way any page does.
   ================================================================== */

/** Wheel travel that opens the whole screen, in pixels.

    It is set from the gesture, not from the notch. A trackpad answers one
    flick with a long stream of small readings and a wheel with a single
    large one, so a figure that makes a flick or two enough also makes a
    turn of the wheel a fifth of the screen rather than half of it: the
    screen is drawn up, never dealt out in halves. */
const TRAVEL = 635;
/** The same for a finger, which travels further for the same intent. */
const SWIPE_TRAVEL = 894;
/** One key press, as a share of the screen. */
const KEY_STEP = 0.187;

/** How long each step is carried for against the page's own scrolling.

    The only place this parts company with the rest of the site. A screen
    closing over another is read as one move rather than as travel, and a
    move that is watched rather than followed wants to be over: given the
    page's own weighting it sat too long in the middle of itself. Everything
    else about it — the easing, the tail — is still read off the page's own
    scrolling, so the two stay of a piece. */
const SLOW = 0.6;

/** How long the page is held once the screen is fully open, in milliseconds.

    The screen arrives and the page stops on it. Without the pause the last
    of the opening and the first of the ordinary scrolling below run into one
    another, and a section that has just finished closing over another is
    already leaving; with it, the move has an end. It is a beat, not a gate:
    long enough to be an ending, short enough that nobody waits it out. */
const HOLD_MS = 120;

/** What a move is assumed to take when the page is set up to be scrolled by
    a share of what is left rather than over a length of time. */
const LERP_MS = 700;

/** The least a move is carried for, as a share of a full one.

    The step that finishes the opening is usually a short one — whatever was
    left over — and is the one gesture the page cannot let through, so it is
    also the one nothing can be done during. Carried for as long as a full
    step it would hold the page still for over a second before the pause even
    began. Carried for what it actually has to cross, the hold is a beat on
    the end of a short move rather than a wait. */
const SHORTEST = 0.4;

/** Near enough to be there. */
const SETTLED = 0.5;

export function useGateway(lenis: RefObject<Lenis | null>, active: boolean) {
  const reduce = useReducedMotion() ?? false;

  useEffect(() => {
    if (!active || reduce) return;
    const studio = document.getElementById("studio");
    if (!studio) return;

    /** The screen the studio opens over, which is the distance it travels. */
    const cover = () => studio.getBoundingClientRect().top + window.scrollY;

    /** The page is standing on the fully open screen and not to be moved. */
    let holding = false;
    let release: number | undefined;

    const freeIn = (ms: number) => {
      window.clearTimeout(release);
      release = window.setTimeout(() => {
        holding = false;
      }, ms);
    };

    /** Everything is swallowed while the page is being held. */
    const stalled = (event: Event) => {
      if (!holding) return false;
      if (event.cancelable) event.preventDefault();
      event.stopPropagation();
      return true;
    };

    /** Is the screen still opening, for a gesture in this direction? */
    const opening = (instance: Lenis, down: boolean) => {
      // Where the page is headed, not where it has got to: a gesture given
      // while the last one is still running belongs to the screen as much as
      // the one before it did, and waiting for the glide to land would eat it.
      const headed = instance.targetScroll;
      const end = cover();
      if (headed < end - SETTLED) return true;
      // Standing at the seam: down is the page's own business, up comes back
      // in here and closes the screen again.
      return !down && headed <= end + SETTLED;
    };

    /* Handed on through the same call Lenis puts its own wheel through, and
       on the same terms: `programmatic` false, so it counts as a hand on the
       page rather than a jump asked for in code, and the weighting read back
       off the instance so it is the page's own and not a second set of
       numbers to keep in step with it.

       Read back rather than left out: told it is not programmatic, Lenis
       stops supplying its own duration and easing and expects the caller to
       say how the move should be carried. Left out, there is nothing to carry
       it and the page simply arrives. */
    const draw = (instance: Lenis, by: number) => {
      const { lerp, duration, easing } = instance.options;
      const end = cover();
      const from = instance.targetScroll;
      const to = Math.min(Math.max(from + by, 0), end);

      // This is the move that finishes the opening. The page is held from
      // here, through the rest of the glide and for a beat after it lands, so
      // the screen is seen to arrive rather than passed through.
      const arriving = by > 0 && to >= end - SETTLED && from < end - SETTLED;

      // A full step's worth of page, which is what a whole turn of the wheel
      // asks for and what a move is normally carried for.
      const step = (100 / TRAVEL) * end;
      const carry = arriving
        ? Math.max(Math.min(Math.abs(to - instance.animatedScroll) / step, 1), SHORTEST)
        : 1;

      if (arriving) {
        holding = true;
        // Let go on a clock of its own, not on word from the move that it has
        // landed. That word can go astray: the studio's copy arrives partway
        // through this very move, the page grows by what it brings, and Lenis
        // answers the new height by resetting itself — which drops the
        // in-flight move and everything that was waiting on the end of it.
        // Only the first pass mounts that copy, so only the first pass would
        // have been held down until something else happened to come along.
        // Timed from here, the pause cannot outlast the move plus its beat
        // however the move ends.
        const runFor = duration === undefined ? LERP_MS : duration * SLOW * carry * 1000;
        freeIn(runFor + HOLD_MS);
      }

      instance.scrollTo(to, {
        programmatic: false,
        easing,
        // Lenis is driven either by a length of time or by a share of what is
        // left each frame, and whichever of the two the page is set up with is
        // the one that has to be stretched.
        duration: duration === undefined ? undefined : duration * SLOW * carry,
        lerp: lerp === undefined ? undefined : lerp / (SLOW * carry),
        // When word does arrive, it brings the pause forward to where it
        // belongs: a beat after the landing rather than after the whole of
        // the move. Never back the other way — a late word cannot take hold
        // of a page that has already been let go.
        onComplete: arriving ? () => holding && freeIn(HOLD_MS) : undefined,
      });
    };

    /* Captured, not bubbled: Lenis listens for the same gestures on the same
       target, and one that is drawing the screen must not also scroll it by
       its own reckoning on top of ours. */
    const capture = { passive: false, capture: true } as const;

    const onWheel = (event: WheelEvent) => {
      const instance = lenis.current;
      if (!instance) return;
      if (stalled(event)) return;
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      if (!opening(instance, event.deltaY > 0)) return;
      event.preventDefault();
      event.stopPropagation();
      draw(instance, (event.deltaY / TRAVEL) * cover());
    };

    let from = 0;

    const onTouchStart = (event: TouchEvent) => {
      from = event.touches[0]?.clientY ?? 0;
    };

    const onTouchMove = (event: TouchEvent) => {
      const instance = lenis.current;
      if (!instance) return;
      const y = event.touches[0]?.clientY ?? 0;
      const by = from - y;
      from = y;
      if (stalled(event)) return;
      if (!opening(instance, by > 0)) return;
      event.preventDefault();
      draw(instance, (by / SWIPE_TRAVEL) * cover());
    };

    const DOWN_KEYS = new Set(["ArrowDown", "PageDown", "End", " ", "Spacebar"]);
    const UP_KEYS = new Set(["ArrowUp", "PageUp", "Home"]);

    const onKey = (event: KeyboardEvent) => {
      const instance = lenis.current;
      if (!instance) return;
      const down = DOWN_KEYS.has(event.key);
      if (!down && !UP_KEYS.has(event.key)) return;
      if (stalled(event)) return;
      if (!opening(instance, down)) return;
      event.preventDefault();
      event.stopPropagation();
      draw(instance, (down ? 1 : -1) * KEY_STEP * cover());
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
      window.clearTimeout(release);
    };
  }, [active, reduce, lenis]);
}
