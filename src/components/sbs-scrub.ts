"use client";

import { useEffect } from "react";

/* ==================================================================
   The plates driven by hand (user, 2026-11-17: "uma versão que permita
   ao cliente fazer ele mesmo o scroll dentro").

   Every page in a plate runs on one CSS loop (sbs-scroll for the
   comparison and Essential+, sbs-a-scroll for Advanced) and every effect
   on it is keyed to that loop's time. By hand, nothing new is animated:
   the visitor's scroll is turned into a moment of the loop and every
   animation on the page is held at that moment. Where the loop moves the
   page, the scroll moves it one for one (the move's own easing is undone,
   so the page follows the wheel or the finger exactly); where the loop
   holds a section, the scroll goes on through the hold with the section
   pinned while its effects play (the steps, the kinds, the opening).

   Every plate inside the container is held at the same moment, so the
   two pages of the comparison stay together, section for section.
   ================================================================== */

type Point = [time: number, stop: number];

/** Each loop's stops in time, to the end of the visit (not the way back
    up): the comparison's (globals.css, sbs-scroll) and Advanced's
    (sbs-a-scroll). */
const LAPS: Record<string, { points: Point[]; ease: [number, number, number, number] }> = {
  "sbs-scroll": {
    points: [[0, 0], [0.13, 0], [0.17, 1], [0.28, 1], [0.32, 2], [0.43, 2], [0.47, 3], [0.8, 3], [0.84, 4], [0.94, 4]],
    ease: [0.22, 1, 0.36, 1],
  },
  "sbs-a-scroll": {
    points: [[0, 0], [0.22, 0], [0.26, 1], [0.46, 1], [0.5, 2], [0.6, 2], [0.64, 3], [0.86, 3], [0.89, 4], [0.96, 4]],
    ease: [0.65, 0, 0.35, 1],
  },
};

/** Scroll given to a hold, in the page's own pixels per whole loop. */
const HOLD = 2600;

/** A cubic-bezier as two functions of its parameter. */
function bezier([x1, y1, x2, y2]: [number, number, number, number]) {
  const at = (a: number, b: number, s: number) => 3 * a * s * (1 - s) ** 2 + 3 * b * s * s * (1 - s) + s ** 3;
  const solve = (target: number, axis: (s: number) => number) => {
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 30; i++) {
      const mid = (lo + hi) / 2;
      if (axis(mid) < target) lo = mid;
      else hi = mid;
    }
    return (lo + hi) / 2;
  };
  const X = (s: number) => at(x1, x2, s);
  const Y = (s: number) => at(y1, y2, s);
  return {
    /** output (share of the distance) for an input (share of the time) */
    out: (x: number) => Y(solve(x, X)),
    /** input (share of the time) for an output (share of the distance) */
    in: (y: number) => X(solve(y, Y)),
  };
}

type Segment = { t0: number; t1: number; v0: number; len: number; move: boolean };

/** The page's loop and its segments, in scroll (the page's pixels). */
function plan(page: HTMLElement) {
  const run = page.getAnimations().find((a) => (a as CSSAnimation).animationName in LAPS) as CSSAnimation | undefined;
  const name = run?.animationName ?? (page.classList.contains("sbs-a-page") ? "sbs-a-scroll" : "sbs-scroll");
  const lap = LAPS[name];
  const stop = (n: number) => (n === 0 ? 0 : Math.abs(parseFloat(getComputedStyle(page).getPropertyValue(`--sbs-stop-${n}`)) || 0));
  const segments: Segment[] = [];
  let v = 0;
  for (let i = 1; i < lap.points.length; i++) {
    const [t0, s0] = lap.points[i - 1];
    const [t1, s1] = lap.points[i];
    const move = s0 !== s1;
    const len = move ? Math.abs(stop(s1) - stop(s0)) : (t1 - t0) * HOLD;
    segments.push({ t0, t1, v0: v, len, move });
    v += len;
  }
  return { segments, length: v, ease: bezier(lap.ease), end: lap.points[lap.points.length - 1][0] };
}

function timeAt(p: ReturnType<typeof plan>, v: number) {
  const at = Math.max(0, Math.min(p.length, v));
  const seg = p.segments.find((s) => at <= s.v0 + s.len) ?? p.segments[p.segments.length - 1];
  const u = seg.len ? (at - seg.v0) / seg.len : 0;
  const x = seg.move ? p.ease.in(u) : u;
  return seg.t0 + x * (seg.t1 - seg.t0);
}

function scrollAt(p: ReturnType<typeof plan>, t: number) {
  if (t >= p.end) return p.length;
  const seg = p.segments.find((s) => t <= s.t1) ?? p.segments[p.segments.length - 1];
  const x = (t - seg.t0) / (seg.t1 - seg.t0);
  return seg.v0 + (seg.move ? p.ease.out(x) : x) * seg.len;
}

/** Every loop animation of a screen's page, with its loop's length. */
function loopsOf(screen: HTMLElement) {
  const page = screen.querySelector<HTMLElement>(".sbs-mini");
  if (!page) return { page: null, anims: [] as Animation[], ms: 0 };
  const ms = parseFloat(getComputedStyle(page).animationDuration) * 1000 || 0;
  const anims = screen.getAnimations({ subtree: true }).filter((a) => a.effect?.getComputedTiming().duration === ms);
  return { page, anims, ms };
}

/** Holds every plate in `container` at the moment the visitor scrolls to
    while `manual` is on, and lets the loops run again when it goes off.
    The newest plate's page measures the scroll (the others follow it to
    the same moment). */
export function usePlateScrub(container: React.RefObject<HTMLElement | null>, manual: boolean, key?: unknown) {
  useEffect(() => {
    const box = container.current;
    if (!box || !manual) return;

    const screens = () => [...box.querySelectorAll<HTMLElement>(".sbs-screen")].filter((s) => s.offsetParent !== null);
    let measured: ReturnType<typeof plan> | null = null;
    let target = 0;
    let current = 0;
    let frame = 0;
    let started = false;

    const seekAll = (t: number) => {
      for (const screen of screens()) {
        const { anims, ms } = loopsOf(screen);
        for (const a of anims) {
          a.pause();
          a.currentTime = t * ms + ((a.effect?.getTiming().delay as number) || 0);
        }
      }
    };

    // Start where the loop was, so taking over moves nothing.
    const start = () => {
      // the newest plate (a level switched in comes after the one leaving)
      const all = screens();
      const first = all[all.length - 1];
      if (!first) return false;
      const { page, anims, ms } = loopsOf(first);
      if (!page || !anims.length || !ms) return false;
      measured = plan(page);
      const run = anims.find((a) => (a as CSSAnimation).animationName in LAPS) ?? anims[0];
      const delay = (run.effect?.getTiming().delay as number) || 0;
      const t = ((((Number(run.currentTime) || 0) - delay) % ms) + ms) % ms / ms;
      target = current = scrollAt(measured, t);
      seekAll(timeAt(measured, current));
      return true;
    };

    const tick = () => {
      frame = requestAnimationFrame(tick);
      if (!started) {
        started = start();
        return;
      }
      if (!measured) return;
      const gap = target - current;
      if (Math.abs(gap) < 0.2) return;
      current += gap * 0.14;
      seekAll(timeAt(measured, current));
    };
    frame = requestAnimationFrame(tick);

    const k = (el: HTMLElement) => parseFloat(getComputedStyle(el).getPropertyValue("--sbs-k")) || 0.5;
    const nudge = (by: number) => {
      if (!measured) return false;
      const next = Math.max(0, Math.min(measured.length, target + by));
      const moved = next !== target;
      target = next;
      return moved;
    };

    // The wheel: a screen's pixel is a page's 1 / k pixels, so the page
    // moves under the wheel as a page in a browser would. At either end
    // the wheel is let go, so the website around it scrolls on.
    const wheel = (e: WheelEvent) => {
      const screen = (e.currentTarget as HTMLElement) ?? box;
      const by = (e.deltaMode === 1 ? e.deltaY * 32 : e.deltaY) / k(screen);
      if (nudge(by)) e.preventDefault();
    };

    // A finger or a held pointer drags the page.
    let drag: { y: number; id: number; k: number } | null = null;
    const down = (e: PointerEvent) => {
      if (e.button !== 0) return;
      const screen = e.currentTarget as HTMLElement;
      drag = { y: e.clientY, id: e.pointerId, k: k(screen) };
      screen.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      nudge((drag.y - e.clientY) / drag.k);
      drag.y = e.clientY;
    };
    const up = (e: PointerEvent) => {
      if (drag && e.pointerId === drag.id) drag = null;
    };

    const bound = screens();
    for (const s of bound) {
      s.addEventListener("wheel", wheel, { passive: false });
      s.addEventListener("pointerdown", down);
      s.addEventListener("pointermove", move);
      s.addEventListener("pointerup", up);
      s.addEventListener("pointercancel", up);
      s.setAttribute("data-lenis-prevent", "");
      s.setAttribute("data-manual", "");
    }

    return () => {
      cancelAnimationFrame(frame);
      for (const s of bound) {
        s.removeEventListener("wheel", wheel);
        s.removeEventListener("pointerdown", down);
        s.removeEventListener("pointermove", move);
        s.removeEventListener("pointerup", up);
        s.removeEventListener("pointercancel", up);
        s.removeAttribute("data-lenis-prevent");
        s.removeAttribute("data-manual");
      }
      // the loops run on from where the visitor left them
      for (const screen of screens()) for (const a of loopsOf(screen).anims) a.play();
    };
  }, [container, manual, key]);
}
