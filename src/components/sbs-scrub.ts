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
   page, its effects follow the scroll; where the loop holds a section,
   the scroll plays the hold's effects (the steps, the kinds, the opening)
   while the page goes on moving (placeAt): the page never stops.

   Every plate inside the container is held at the same moment, so the
   two pages of the comparison stay together, section for section.
   ================================================================== */

type Point = [time: number, stop: number];

/** Each loop's stops in time, to the end of the visit (not the way back
    up): the comparison's (globals.css, sbs-scroll) and Advanced's
    (sbs-a-scroll). */
/* `hold` is the scroll given to a hold, in the page's own pixels per
   whole loop. By hand the scroll is continuous (user, 2026-11-17: a hold
   that took several hundred pixels with nothing moving read as stuck), so
   holds are short; Advanced keeps more, as its holds are where its
   effects play (the flight through the P, the kinds, the steps). */
/* `even`, when set, gives every part of the loop the same scroll per unit
   of time, moves and holds alike, so no effect plays faster than another
   (user, 2026-11-17: on the Advanced page the holds' effects, the flight
   and the kinds, raced by in a few pixels of scroll); the page itself
   still moves on its own continuous course (placeAt). */
/* `auto`, when set, is the part of the loop that plays on its own even by
   hand, the scroll held until it is over: the Advanced page's opening
   (the metal symbol, the flight through the P and the fade), 0-20%
   (user, 2026-11-17: "fica sem poderem dar scroll, acontece normalmente").
   The scroll then starts after it and does not go back into it. */
const LAPS: Record<string, { points: Point[]; ease: [number, number, number, number]; hold: number; even?: number; auto?: number }> = {
  "sbs-scroll": {
    points: [[0, 0], [0.13, 0], [0.17, 1], [0.28, 1], [0.32, 2], [0.43, 2], [0.47, 3], [0.8, 3], [0.84, 4], [0.94, 4]],
    ease: [0.22, 1, 0.36, 1],
    hold: 700,
  },
  "sbs-a-scroll": {
    points: [[0, 0], [0.22, 0], [0.26, 1], [0.46, 1], [0.5, 2], [0.6, 2], [0.64, 3], [0.86, 3], [0.89, 4], [0.96, 4]],
    ease: [0.65, 0, 0.35, 1],
    hold: 1500,
    even: 5200,
    auto: 0.2,
  },
};

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

type Segment = { t0: number; t1: number; v0: number; len: number; move: boolean; stop: number };

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
    const len = lap.even ? (t1 - t0) * lap.even : move ? Math.abs(stop(s1) - stop(s0)) : (t1 - t0) * lap.hold;
    segments.push({ t0, t1, v0: v, len, move, stop: s1 });
    v += len;
  }
  return { segments, length: v, ease: bezier(lap.ease), even: !!lap.even, auto: lap.auto ?? 0, end: lap.points[lap.points.length - 1][0] };
}

function timeAt(p: ReturnType<typeof plan>, v: number) {
  const at = Math.max(0, Math.min(p.length, v));
  const seg = p.segments.find((s) => at <= s.v0 + s.len) ?? p.segments[p.segments.length - 1];
  const u = seg.len ? (at - seg.v0) / seg.len : 0;
  const x = seg.move && !p.even ? p.ease.in(u) : u;
  return seg.t0 + x * (seg.t1 - seg.t0);
}

function scrollAt(p: ReturnType<typeof plan>, t: number) {
  if (t >= p.end) return p.length;
  const seg = p.segments.find((s) => t <= s.t1) ?? p.segments[p.segments.length - 1];
  const x = (t - seg.t0) / (seg.t1 - seg.t0);
  return seg.v0 + (seg.move && !p.even ? p.ease.out(x) : x) * seg.len;
}

/** Where a page stands for a given scroll, in its own pixels: it never
    stops (user, 2026-11-17: by hand the scroll is continuous, and a
    section held still while the scroll went on read as stuck). It passes
    each of its sections at the middle of that section's hold, so the
    hold's effects play while the section is in view, and moves evenly in
    between. Each page uses its own stops, so the two pages of the
    comparison reach the same section together. */
function placeAt(p: ReturnType<typeof plan>, page: HTMLElement, v: number) {
  const stop = (n: number) => (n === 0 ? 0 : Math.abs(parseFloat(getComputedStyle(page).getPropertyValue(`--sbs-stop-${n}`)) || 0));
  const knots: [number, number][] = [[0, 0]];
  // the page stands at the top until any opening that plays on its own is
  // over, so nothing jumps when the scroll takes over from it
  const after = p.auto ? scrollAt(p, p.auto) : 0;
  for (const seg of p.segments) {
    if (seg.move) continue;
    const mid = seg.v0 + seg.len / 2;
    knots.push([seg.stop === 0 ? Math.max(after, mid) : mid, stop(seg.stop)]);
  }
  knots.push([p.length, knots[knots.length - 1][1]]);
  const at = Math.max(0, Math.min(p.length, v));
  for (let i = 1; i < knots.length; i++) {
    const [v0, y0] = knots[i - 1];
    const [v1, y1] = knots[i];
    if (at <= v1) return v1 === v0 ? y1 : y0 + ((at - v0) / (v1 - v0)) * (y1 - y0);
  }
  return knots[knots.length - 1][1];
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
export function usePlateScrub(
  container: React.RefObject<HTMLElement | null>,
  manual: boolean,
  key?: unknown,
  /** share of the wheel or the drag taken (the larger window: 0.85) */
  speed = 1,
) {
  useEffect(() => {
    const box = container.current;
    if (!box || !manual) return;

    const screens = () => [...box.querySelectorAll<HTMLElement>(".sbs-screen")].filter((s) => s.offsetParent !== null);
    let measured: ReturnType<typeof plan> | null = null;
    let target = 0;
    let current = 0;
    let frame = 0;
    let started = false;
    // the opening playing on its own (Advanced), the scroll held meanwhile
    let opening = false;
    let floor = 0;

    // Every effect is held at the loop's moment for this scroll; the page
    // itself is then put where the continuous scroll wants it, by moving
    // the box it sits in by the difference from where the loop has it.
    const seekAll = (v: number) => {
      if (!measured) return;
      const t = timeAt(measured, v);
      for (const screen of screens()) {
        const { page, anims, ms } = loopsOf(screen);
        for (const a of anims) {
          a.pause();
          a.currentTime = t * ms + ((a.effect?.getTiming().delay as number) || 0);
        }
        if (!page || !page.parentElement) continue;
        const kk = parseFloat(getComputedStyle(screen).getPropertyValue("--sbs-k")) || 0.5;
        const looped = parseFloat(getComputedStyle(page).translate.split(" ")[1] ?? "0") || 0;
        const wanted = -placeAt(measured, page, v) * kk;
        page.parentElement.style.transform = `translate3d(0, ${wanted - looped}px, 0)`;
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
      floor = measured.auto ? scrollAt(measured, measured.auto) : 0;
      if (measured.auto && t < measured.auto) {
        // the opening plays on, untouched, and the scroll waits for it
        opening = true;
        for (const screen of screens()) for (const a of loopsOf(screen).anims) a.play();
        target = current = floor;
        return true;
      }
      target = current = Math.max(floor, scrollAt(measured, t));
      seekAll(current);
      return true;
    };

    /** The loop's moment on the newest plate, while it runs. */
    const now = () => {
      const all = screens();
      const { anims, ms } = loopsOf(all[all.length - 1]);
      const run = anims.find((a) => (a as CSSAnimation).animationName in LAPS) ?? anims[0];
      if (!run || !ms) return 0;
      const delay = (run.effect?.getTiming().delay as number) || 0;
      return ((((Number(run.currentTime) || 0) - delay) % ms) + ms) % ms / ms;
    };

    const tick = () => {
      frame = requestAnimationFrame(tick);
      if (!started) {
        started = start();
        return;
      }
      if (!measured) return;
      if (opening) {
        // over when the loop has played to the end of the opening
        if (now() < measured.auto) return;
        opening = false;
        target = current = floor;
        seekAll(current);
        return;
      }
      const gap = target - current;
      if (Math.abs(gap) < 0.2) return;
      // a soft follow, so the page glides after the wheel
      current += gap * 0.1;
      seekAll(current);
    };
    frame = requestAnimationFrame(tick);

    const k = (el: HTMLElement) => parseFloat(getComputedStyle(el).getPropertyValue("--sbs-k")) || 0.5;
    const nudge = (by: number) => {
      if (!measured) return false;
      if (opening) return true;
      const next = Math.max(floor, Math.min(measured.length, target + by * speed));
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
      // the loops run on from where the visitor left them, the page back
      // in the loop's own place
      for (const screen of screens()) {
        const { page, anims } = loopsOf(screen);
        if (page?.parentElement) page.parentElement.style.transform = "";
        for (const a of anims) a.play();
      }
    };
  }, [container, manual, key, speed]);
}
