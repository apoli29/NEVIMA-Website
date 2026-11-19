# 004 — Back end: the meteor follows the reader's line, not the path's length

- **Status**: DONE (2026-11-19). Executed with one correction: the knots for the gaps are `(g1 - k → turns[0] - k)`, `(g1 + k → turns[1] + k)`, `(g2 - k → turns[2] - k)`, `(g2 + k → turns[3] + k)`, so the vertical legs are exactly 1:1 as Done-when asks; the table below, as first written, put the head up to k ahead on them.
- **Commit**: 6b67bd3 (branch `design/back-end-depth`, worktree `../NEVIMA-Website-be`)
- **Severity**: MEDIUM
- **Category**: Purpose & frequency / Cohesion (scroll-linked motion out of step with the scroll)
- **Estimated scope**: 1 file (`src/components/back-end-motion.tsx`, the `GlowTrail` component), about 40 lines changed; no CSS changes
- **Asked for by the user on 2026-11-19**: "sincroniza melhor a animação com o scroll e o posicionamento do user ao descer no website".

## Problem

On the back-end page (`/services/back-end-features`, `/pt/servicos/funcionalidades-back-end`),
section "Why should small businesses invest in back end solutions?", a small
bright "meteor" runs through the gaps round three staggered cards: down the
first card's left side, right across the gap under it, down the second card's
right side, left across the gap under that, down the third card's left side.

It is driven by the **share of the scroll** mapped straight onto the **share
of the path's length**:

```tsx
// src/components/back-end-motion.tsx — GlowTrail, current
const { scrollYProgress } = useScroll({ target: box, offset: ["start 70%", "end 45%"] });
const place = (p: number) => {
  const path = track.current;
  if (!path || !route.d) return;
  const total = path.getTotalLength();
  const at = Math.max(0, Math.min(1, p)) * total;
  const pt = path.getPointAtLength(at);
  ...
};
useMotionValueEvent(scrollYProgress, "change", place);
```

Measured at 1440×900: the path is about 3,800px long, but only about 1,900px
of scroll drives it, so the head moves about 2px for every 1px scrolled. Worse,
the two horizontal legs (about 1,260px and 1,050px) cross gaps that are only
about 88px tall, yet they take half the scroll. The result, as the user saw it:
while the reader is already in the middle of the second card, the meteor is
still crossing the first gap far above; on the vertical legs it runs ahead of
the page instead of with it. It reads as unrelated to where the user is.

## Target

The meteor's **height on the page follows a fixed reading line in the
viewport**, 55% down from the top, one pixel for one pixel. It is always level
with where the reader is looking, wherever the path goes.

- **Vertical legs**: the head's `y` equals the reading line's `y`, exactly.
- **Horizontal legs**: the crossing happens while the reading line passes the
  gap, widened by a window `k` above and below the gap's middle so the crossing
  is not a flick:
  `k = clamp(80, 0.12 * innerHeight, 140)` pixels.
  So a crossing takes `2k` pixels of scroll (160–280px) and the head is never
  more than `k` pixels off the reading line.
- The mapping is **piecewise linear**, from the reading line's position in the
  box (`Y`) to the distance along the path (`s`), with these knots (all values
  in the box's own pixels, read from the cards, the same way the route is
  read now):

  | Y (reading line, in the box) | s (distance along the path) |
  | --- | --- |
  | `top(c0) + 24` | `0` |
  | `g1 - k` | `L0` (end of leg 0: down the first card's left side) |
  | `g1 + k` | `L0 + L1` (end of leg 1: across the first gap) |
  | `g2 - k` | `L0 + L1 + L2` (end of leg 2: down the second card's right side) |
  | `g2 + k` | `L0 + L1 + L2 + L3` (end of leg 3: across the second gap) |
  | `bottom(c2) - 24` | `total` (end of leg 4) |

  where `g1 = (bottom(c0) + top(c1)) / 2`, `g2 = (bottom(c1) + top(c2)) / 2`,
  and `L0…L4` are the leg lengths already computed as `route.turns`
  (`turns[i]` is the cumulative length at the end of leg `i`).
  Below the first knot `s = 0`; past the last `s = total`.
  If `k` is larger than half a vertical leg (very short cards), clamp `k` to
  `0.45 *` the shortest of `g1 - (top(c0) + 24)`, `g2 - g1`,
  `(bottom(c2) - 24) - g2`, so the knots stay in order.
- **No smoothing and no spring.** The page already scrolls through Lenis, which
  eases the scroll itself; a second spring here would make the head lag behind
  the reading line. Scroll-linked motion follows the scroll 1:1.
- **Fade in and out** instead of popping: the head and both trails take
  `opacity = clamp(0, (Y - (top(c0)+24)) / 60, 1) * clamp(0, ((bottom(c2)-24) - Y) / 60, 1)`.
- The lit card follows the same `s` as now:
  `near = s < (turns[0] + turns[1]) / 2 ? 0 : s < (turns[2] + turns[3]) / 2 ? 1 : 2`.
- Reduced motion: unchanged (the meteor is not drawn at all).

## Repo conventions to follow

- Scroll values come from Motion's `useScroll` and `useMotionValueEvent`
  (package `motion`, imported from `"motion/react"`), as elsewhere in this file
  (`DragRun` and `PriceLine` in the same file).
- Geometry is read in a `useLayoutEffect` with a `ResizeObserver` on the box and
  each card. `GlowTrail` already does this for the route; extend that same
  read, do not add a second observer.
- The SVG is moved by setting attributes on refs (`head.current.setAttribute`,
  `el.style.strokeDashoffset`), never through React state per frame. Keep that.
- Comments in this repo explain *why*, in plain English, and quote the user's
  request with its date. Add one above the new mapping.

## Steps

1. In `GlowTrail`'s `read()` (inside the existing `useLayoutEffect`), also
   compute and store, in the same `setRoute` call:
   - `start = top(c0) + 24`, `end = bottom(c2) - 24`, `g1`, `g2` (already
     computed locally; keep them);
   - `pageTop = el.getBoundingClientRect().top + window.scrollY` (the box's top
     on the page).
   Extend the `route` state type to
   `{ d: string; w: number; h: number; turns: number[]; start: number; end: number; g1: number; g2: number; pageTop: number }`
   and its initial value accordingly (zeros).
   Also call `read()` on `window` `resize` (the box's page position can move
   without the box changing size); remove that listener in the cleanup.
2. Replace the scroll source. Remove
   `const { scrollYProgress } = useScroll({ target: box, offset: ["start 70%", "end 45%"] });`
   and use the window's scroll:
   `const { scrollY } = useScroll();`
3. Rewrite `place` to take the window's `scrollY` (a number) and:
   1. `const Y = scrollY + window.innerHeight * 0.55 - route.pageTop;`
   2. compute `k` as in Target (with the clamp for short legs);
   3. build the knot arrays
      `ys = [start, g1 - k, g1 + k, g2 - k, g2 + k, end]` and
      `ss = [0, turns[0], turns[1], turns[2], turns[3], total]`
      (`total = path.getTotalLength()`; it equals `turns[4]`);
   4. find `s` by linear interpolation of `Y` between the knots (clamped at both
      ends). Write it as a small pure function `along(Y, ys, ss)` at module
      level, above `GlowTrail`, with a one-line comment;
   5. use `s` where `at` is used now (the head's point, both trails'
      dash offsets, and the lit card);
   6. set the opacity from Target on the head (`setAttribute("opacity", …)`)
      and on both trail paths (`style.opacity`), replacing the current
      `p <= 0 || p >= 1 ? "0" : "1"`.
4. Wire it: `useMotionValueEvent(scrollY, "change", place);` and keep the
   existing `useEffect(() => place(scrollY.get()));` so the first frame is
   right.
5. Update the comment block above `GlowTrail`: say that the meteor stays level
   with a reading line 55% down the screen (user, 2026-11-19), crossing each gap
   while that line passes it.
6. Add one paragraph at the end of `docs/back-end-decisions.md` (in Portuguese,
   like the rest of that file) saying the same: the meteor now follows the
   height at which the reader is, a line at 55% of the screen, pixel for pixel,
   and crosses each gap while that line passes it, instead of moving by the
   share of the path's length.

## Boundaries

- Touch only `GlowTrail` in `src/components/back-end-motion.tsx` and the docs
  paragraph. Do NOT touch the CSS (`.be-trail-*` in `src/app/globals.css`), the
  route's shape, the card positions, the trail lengths (90 and 320) or the
  head's look.
- Do NOT add a spring, `useSpring`, smoothing or a library.
- Do NOT change `DragRun`, `PriceLine`, `GainStory` or any other component.
- Work in the worktree `../NEVIMA-Website-be` on branch `design/back-end-depth`,
  never in the main checkout (another session uses it, on another branch).
- If the code does not match the excerpt above (drift since 6b67bd3), STOP and
  report instead of improvising.

## Verification

- **Mechanical**: in `../NEVIMA-Website-be`, `npx tsc --noEmit -p .` prints
  nothing. The dev server for the worktree is `nevima-dev-be` in
  `.claude/launch.json` (port 3009). The page loads with no error badge.
- **Feel check** at 1440×900 and at 375×812, on
  `http://localhost:3009/services/back-end-features`, scrolling slowly with a
  trackpad or wheel through the section:
  - draw a mental line 55% down the screen: the meteor's head stays on it all
    the way down each vertical leg, never ahead and never behind;
  - each horizontal crossing starts a little before the reading line reaches a
    gap and ends a little after it leaves; the head is never more than about
    140px above or below the line;
  - scrolling back up runs the meteor back the same way, with no jump;
  - the head and trails fade in at the top of the first card and out at the foot
    of the third, rather than popping;
  - the card whose edge is lit is the one the meteor is beside;
  - in DevTools (Rendering), with `prefers-reduced-motion: reduce`, there is no
    meteor at all.
  - In DevTools' Performance panel, scrolling through the section shows no
    layout work per frame from `GlowTrail` (only the SVG attribute and style
    writes).
- **Done when**: at any scroll position inside the section, the head's
  on-screen `y` is within `k` of `0.55 * innerHeight` (exactly on it along the
  vertical legs). It can be checked in the console with
  `document.querySelector('.be-trail-head').getBoundingClientRect().top`
  against `innerHeight * 0.55`.
