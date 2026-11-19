# 005 — Our Services: one entrance at a time, each card's loop starting only after its reveal

- **Status**: DONE
- **Commit**: ba0e2cf (branch `design/services-cards-motion`, worktree `../NEVIMA-Website-cards`)
- **Severity**: HIGH
- **Category**: Cohesion & tokens (everything-at-once entrance) / Purpose
- **Estimated scope**: 2 files, ~40 lines

## Problem

When the visitor reaches "Our Services" on the home page, everything in the section moves in the same second (user, 2026-11-19: "aparecem todas as animações ao mesmo tempo, o que não é suposto").

Three things start together, all from the one `seen` flag (`useSeen(ready, "0px 0px -12% 0px")`, `src/components/services.tsx:72`):

1. The rule under the title draws, and the five rows rise, staggered from 0.15 s (`delay = 0.15 + index * ROW_STAGGER_S`, `ROW_STAGGER_S = 0.09`).
2. The showcase frame uncovers **at 0 s with no delay**, a 1.1 s clip plus a 1.6 s scale (`Uncover` in `src/components/exhibit.tsx:98`):

```tsx
/* src/components/services.tsx:296 — current */
<Uncover shown={seen} className="relative aspect-[4/5] bg-ink">
```

3. The card inside the frame starts its own loop on **its own** IntersectionObserver, which ignores the frame's clip-path. So the loop is already running while the card is still hidden, and its first step change (and its CSS transitions) lands in the middle of the reveal:

```tsx
/* src/components/service-cards.tsx:134 — current */
export function ServiceCard({ slug, play = true }: { slug: string; play?: boolean }) {
  const t = useT();
  const reduce = useReducedMotion() ?? false;
  const [ref, inView] = useInView<HTMLElement>(0.3);
  const spec = SPECS[slug];
  const run = play && inView;
  const at = useBeat(spec?.holds ?? [1], run, reduce);
```

The open drawer on phones has the same fault: its card plays as soon as `open` is true (`services.tsx:470-471`), while the drawer is still uncovering it (0.3 s delay + 1.1 s).

## Target

One entrance after another, then the loop:

| t (s, from `seen`) | What moves |
| --- | --- |
| 0 → | title and subtitle (unchanged, they already slide in on `ready`) |
| 0.15 → 0.51 | the rows rise one after another (unchanged) |
| **0.35** | the frame starts to uncover (new delay) |
| **1.45** | the frame is fully uncovered; the card's loop starts **from its first step** |

- A card's loop never runs while it is hidden: `ServiceCard` gets a `startDelay` (ms). When `play` turns true it waits `startDelay`, then runs. When `play` turns false it stops and goes back to step 0, so the next time it is shown it starts from the beginning.
- Showcase: `play={seen}` and `startDelay={1450}` for the first card (0.35 s delay + 1.1 s reveal). Plan 006 sets the delay for cards that come in on a service change.
- Drawer (below 1024px): `play={open}` and `startDelay={1400}` (0.3 s delay + 1.1 s reveal).
- Reduced motion: unchanged. Cards stand on their last step (`useBeat` already returns the last step when `still`), and `Uncover` already has 0 duration under reduced motion. `startDelay` has nothing to do there.

## Repo conventions to follow

- Entrances are `Uncover` / `Rise` / `Rule` from `src/components/exhibit.tsx`, timed by `delay` in seconds. `Uncover` reveals in 1.1 s with `[0.76, 0, 0.24, 1]`.
- The rows' stagger constant is `ROW_STAGGER_S` in `services.tsx`; derive the frame's delay from it rather than hard-coding.
- Timers are cleared in the effect's cleanup, as `useBeat` does (`service-cards.tsx`, top of file).

## Steps

1. `src/components/services.tsx`, near the other timing constants (after `ROW_STAGGER_S`):

   ```tsx
   /** The frame uncovers once the rows have begun to rise, in s. */
   const FRAME_DELAY_S = 0.15 + 2 * ROW_STAGGER_S + 0.02; // 0.35
   /** Uncover's own length, in s (exhibit.tsx). */
   const UNCOVER_S = 1.1;
   ```

2. `src/components/services.tsx`, the `Showcase` frame:

   ```tsx
   <Uncover shown={seen} delay={FRAME_DELAY_S} className="relative aspect-[4/5] bg-ink">
   ```

   and the card inside it (still inside the layers map; plan 006 replaces this map):

   ```tsx
   <ServiceCard
     slug={layer.slug}
     play={seen}
     startDelay={i === 0 ? (FRAME_DELAY_S + UNCOVER_S) * 1000 : 800}
   />
   ```

3. `src/components/services.tsx`, the drawer's card (around line 470):

   ```tsx
   <ServiceCard slug={service.slug} play={open} startDelay={(0.3 + UNCOVER_S) * 1000} />
   ```

4. `src/components/service-cards.tsx`, `ServiceCard`:

   ```tsx
   export function ServiceCard({
     slug,
     play = true,
     startDelay = 0,
   }: {
     slug: string;
     play?: boolean;
     /** ms to wait once `play` turns true: the time it takes to be uncovered */
     startDelay?: number;
   }) {
     const t = useT();
     const reduce = useReducedMotion() ?? false;
     const [ref, inView] = useInView<HTMLElement>(0.3);
     const [armed, setArmed] = useState(false);
     useEffect(() => {
       if (!play) {
         setArmed(false);
         return;
       }
       const id = window.setTimeout(() => setArmed(true), startDelay);
       return () => window.clearTimeout(id);
     }, [play, startDelay]);
     const spec = SPECS[slug];
     const run = armed && inView;
     const at = useBeat(spec?.holds ?? [1], run, reduce, armed);
   ```

5. `src/components/service-cards.tsx`, `useBeat`: add a fourth parameter `armed` and go back to step 0 whenever it turns false:

   ```tsx
   function useBeat(holds: number[], run: boolean, still: boolean, armed: boolean) {
     const [at, setAt] = useState(0);
     useEffect(() => {
       if (!armed) setAt(0);
     }, [armed]);
     useEffect(() => {
       if (!run || still) return;
       const id = window.setTimeout(() => setAt((s) => (s + 1) % holds.length), holds[at]);
       return () => window.clearTimeout(id);
     }, [at, run, still, holds]);
     return still ? holds.length - 1 : at;
   }
   ```

6. Update the header comment of `service-cards.tsx`. The paragraph "Each card runs only while it is on the screen…" becomes: "Each card runs only once it has been uncovered (`startDelay`) and while it is on the screen; hidden, it goes back to its first step. With reduced motion asked for, it stands on its last frame."

7. Add one line to `docs/homepage-decisions.md` (end of file), in the file's own voice: "2026-11-19 (user: every animation in the services came at once): the section enters in turn. The rows rise, the frame uncovers 0.35 s after them, and the card's loop starts from its first step only once the frame is fully open (1.45 s); in a phone's drawer, once the drawer has uncovered it (1.4 s). A card that leaves the screen goes back to its first step."

## Boundaries

- Do NOT touch the five stages inside `service-cards.tsx` (`WebDesign`, `Identity`, `BackEnd`, `SeoGeo`, `PhotoShoot`) or any `.svk-*` CSS.
- Do NOT change `Uncover`, `Rise` or `Rule` in `exhibit.tsx`; pass `delay` only.
- Do NOT change the rows' stagger, the title or the subtitle.
- Do NOT add dependencies.
- If the code at the cited lines does not match (drift since ba0e2cf), STOP and report.

## Verification

- **Mechanical**: `npx tsc --noEmit -p .` passes with no output.
- **Feel check** (dev server `nevima-dev-cards`, port 3011, at 1440x900; the home page's opening needs one click on the black first):
  - Scroll to "Our Services". The rows rise first. The frame starts to uncover a beat later, never before the first row. Nothing inside the card moves until the frame is fully open; then its first step (the web design grid) plays from the start.
  - In DevTools Animations at 10%: the clip of the frame and the first row's rise do not start on the same frame; no `.svk` transition starts before the frame's clip reaches the top.
  - Scroll the section away and back: the card starts again from step 01.
  - Phone (375x812): open a row. The card is still while the drawer uncovers, then starts from step 01.
  - Rendering panel, `prefers-reduced-motion: reduce`: cards show their last step at once, nothing loops.
- **Done when**: on arrival, at no moment are the frame's reveal and the card's loop moving at the same time.
