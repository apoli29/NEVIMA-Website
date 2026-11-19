# 006 — Our Services: a premium change from one service's card to the next

- **Status**: DONE
- **Commit**: ba0e2cf (branch `design/services-cards-motion`, worktree `../NEVIMA-Website-cards`)
- **Severity**: MEDIUM
- **Category**: Missed opportunities / Interruptibility
- **Depends on**: 005 (uses `ServiceCard`'s `startDelay` and `play`)
- **Estimated scope**: 1 file (`src/components/services.tsx`), ~80 lines; one line in `docs/homepage-decisions.md`

## Problem

From 1024px, the frame beside the services list shows the card of the service pointed at (or open). Today a change of service (`Showcase`, `src/components/services.tsx:272-314`) is a bare clip from the foot laid over the old card, with no exit:

```tsx
/* src/components/services.tsx:284 — current */
const [layers, setLayers] = useState([{ slug, key: 0 }]);
useEffect(() => {
  setLayers((now) =>
    now[now.length - 1].slug === slug
      ? now
      : [...now.slice(-2), { slug, key: now[now.length - 1].key + 1 }],
  );
}, [slug]);
...
<motion.div
  key={layer.key}
  className="absolute inset-0"
  initial={i === 0 || reduce ? false : { clipPath: "inset(100% 0% 0% 0%)", scale: 1.08 }}
  animate={{ clipPath: "inset(0% 0% 0% 0%)", scale: 1 }}
  transition={{
    clipPath: { duration: 0.8, ease: [0.76, 0, 0.24, 1] },
    scale: { duration: 1.3, ease: [0.22, 1, 0.36, 1] },
  }}
  ...
>
  <ServiceCard slug={layer.slug} />
</motion.div>
```

What is wrong with it:

1. **Several loops run at once.** Up to three layers are kept (`slice(-2)` + the new one), and every one mounts a `ServiceCard` that plays. While the pointer runs down the list, two or three cards animate on top of each other under the clip edges.
2. **No hover intent.** `onPoint` fires on `pointerenter` (`services.tsx:382`), so a pointer passing down the list on its way elsewhere fires three or four reveals in a row.
3. **No exit, no continuity.** The old card just sits there until it is covered. Nothing tells the eye that one card has handed over to the next. The caption ("Fig. 0X — name", `services.tsx:315`) changes in one frame.

The user asked (2026-11-19) for "uma animação premium que aparece quando se passa de serviço para serviço".

## Target

One deliberate gesture per change (the project's rule: one continuous move beats an effect), on transform, opacity, clip-path and a light blur only:

- **Hover intent: 110 ms.** Pointing at a row only changes the frame if the pointer stays 110 ms. Leaving the list still clears at once (as now). A click is unchanged and immediate.
- **The incoming card** uncovers from the foot up: `clipPath: inset(100% 0% 0% 0%) → inset(0% 0% 0% 0%)`, **0.7 s**, `[0.77, 0, 0.175, 1]` (strong ease-in-out: it moves on screen). Inside it, the content settles: `scale 1.06 → 1` and `y "4%" → "0%"`, **0.9 s**, `[0.23, 1, 0.32, 1]` (strong ease-out).
- **A line of light rides the clip's edge**: a 1px line, `rgb(255 255 255 / 0.6)`, across the card's width. It travels from the foot to the top with the same 0.7 s `[0.77, 0, 0.175, 1]` (`y "100%" → "0%"` on a full-height wrapper with the line at its top). Its opacity goes `[0, 1, 1, 0]` at times `[0, 0.08, 0.8, 1]`. This echoes the light that passes over the site's black bands (`.svc-folio`).
- **The outgoing card** stays beneath and recedes: `scale 1 → 0.96`, `opacity 1 → 0.4`, `filter: blur(0px) → blur(4px)` (under the 20px budget), **0.6 s**, `[0.23, 1, 0.32, 1]`. Then it is removed. Its loop stops the moment it starts to leave (`play={false}`).
- **The incoming card's loop starts from its first step once uncovered** (`startDelay={700}`).
- **The caption rolls**: "Fig. 0X — name" leaves upwards (`y "0%" → "-100%"`, opacity → 0) while the new one comes up from below (`y "100%" → "0%"`), **0.45 s**, `[0.23, 1, 0.32, 1]`, inside an `overflow: hidden` line.
- **Interruptible**: Motion retargets from the current values, so a new change mid-transition is fine. Never more than one playing card.
- **Reduced motion**: no clip, scale, blur, light line or roll. Plain opacity crossfade, **0.2 s `ease`**; the caption changes at once.

Frequency note: hover on a marketing showcase is occasional, not a hundred times a day, so 0.7 s is within budget for a page section (the audit's marketing-page exemption). The 110 ms intent keeps it from firing on pass-through.

## Repo conventions to follow

- Motion (`motion/react`, v12) is already imported in `services.tsx` (`motion`, `useReducedMotion`); add `AnimatePresence` and `useIsPresent` to that import.
- Curves are written inline as arrays in this file (`[0.76, 0, 0.24, 1]`, `[0.22, 1, 0.36, 1]`). Declare the two new ones as consts near the top of the file, as `LIGHT_DELAY_MS` etc. are:

  ```tsx
  /** Strong ease-in-out, for the card uncovering across the frame. */
  const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const;
  /** Strong ease-out, for what settles and what recedes. */
  const EASE_OUT = [0.23, 1, 0.32, 1] as const;
  ```

- The frame keeps its first entrance (`Uncover` with `FRAME_DELAY_S`, from plan 005). The first card shown must **not** play the change animation: `AnimatePresence initial={false}`.

## Steps

1. Add `AnimatePresence, useIsPresent` to the `motion/react` import in `services.tsx`, and the two easing consts above.

2. Hover intent. In `Services`, replace the direct `setPointed` from rows with a delayed one:

   ```tsx
   const intent = useRef<number | undefined>(undefined);
   const point = useCallback((i: number | null) => {
     window.clearTimeout(intent.current);
     if (i === null) {
       setPointed(null);
       return;
     }
     intent.current = window.setTimeout(() => setPointed(i), 110);
   }, []);
   useEffect(() => () => window.clearTimeout(intent.current), []);
   ```

   - `onPointerLeave={() => setPointed(null)}` on the `<ol>` becomes `onPointerLeave={() => point(null)}`.
   - `onPoint={(on) => setPointed(on && open !== service.slug ? i : null)}` becomes `onPoint={(on) => point(on && open !== service.slug ? i : null)}`.

3. Replace the whole `layers` state, its effect and the `layers.map(...)` inside the frame's `Uncover` with:

   ```tsx
   <Uncover shown={seen} delay={FRAME_DELAY_S} className="relative aspect-[4/5] bg-ink">
     <AnimatePresence initial={false}>
       <ShowcaseLayer key={service.slug} slug={service.slug} seen={seen} reduce={reduce} />
     </AnimatePresence>
   </Uncover>
   ```

   (Keep 005's `startDelay` for the first card: `ShowcaseLayer` takes it from a prop, see step 4.)

4. Add `ShowcaseLayer` under `Showcase` in the same file:

   ```tsx
   /** One service's card in the frame. Coming in it uncovers from the foot
       with a line of light on its edge while its content settles; going
       out it recedes under the next one, its loop stopped (user,
       2026-11-19: a premium change from service to service). */
   function ShowcaseLayer({ slug, seen, reduce }: { slug: string; seen: boolean; reduce: boolean }) {
     const present = useIsPresent();
     // The first card is uncovered by the frame's own entrance; the
     // ones after it by this layer.
     const [first] = useState(() => !seen);
     const startDelay = first ? (FRAME_DELAY_S + UNCOVER_S) * 1000 : 700;

     if (reduce) {
       return (
         <motion.div
           className="absolute inset-0"
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           transition={{ duration: 0.2, ease: "easeInOut" }}
         >
           <ServiceCard slug={slug} play={seen && present} startDelay={0} />
         </motion.div>
       );
     }

     return (
       <motion.div
         className="absolute inset-0"
         initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
         animate={{ clipPath: "inset(0% 0% 0% 0%)", scale: 1, opacity: 1, filter: "blur(0px)" }}
         exit={{
           clipPath: "inset(0% 0% 0% 0%)",
           scale: 0.96,
           opacity: 0.4,
           filter: "blur(4px)",
           transition: { duration: 0.6, ease: EASE_OUT },
         }}
         transition={{ clipPath: { duration: 0.7, ease: EASE_IN_OUT } }}
       >
         <motion.div
           className="size-full"
           initial={{ scale: 1.06, y: "4%" }}
           animate={{ scale: 1, y: "0%" }}
           transition={{ duration: 0.9, ease: EASE_OUT }}
         >
           <ServiceCard slug={slug} play={seen && present} startDelay={startDelay} />
         </motion.div>
         {/* the line of light riding the clip's edge */}
         <motion.div
           aria-hidden="true"
           className="pointer-events-none absolute inset-0"
           initial={{ y: "100%", opacity: 0 }}
           animate={{ y: "0%", opacity: [0, 1, 1, 0] }}
           transition={{
             y: { duration: 0.7, ease: EASE_IN_OUT },
             opacity: { duration: 0.7, times: [0, 0.08, 0.8, 1] },
           }}
         >
           <span className="block h-px w-full bg-white/60" />
         </motion.div>
       </motion.div>
     );
   }
   ```

   Notes for the executor:
   - The exiting layer stays earlier in the DOM; the entering one is appended after it, so it paints on top. Do not add z-index.
   - `initial={{ clipPath: ... }}` is ignored for the very first card because of `AnimatePresence initial={false}`. That is intended: the frame's `Uncover` reveals it.
   - The line of light's wrapper must not be clipped away before it moves: it sits inside the layer, whose clip opens at the same speed, so the line is always exactly on the clip's edge.

5. The caption. Replace the inner content of the `<figcaption>` (`services.tsx:315` onward) with a rolling line:

   ```tsx
   <figcaption className="mono-label mt-3 flex items-baseline justify-between gap-4 text-ash-2">
     <span className="relative flex items-center gap-2 overflow-hidden">
       <span aria-hidden="true" className="block size-[7px] shrink-0 bg-ink" />
       <AnimatePresence initial={false} mode="popLayout">
         <motion.span
           key={service.slug}
           className="flex items-center gap-2"
           initial={reduce ? false : { y: "100%", opacity: 0 }}
           animate={{ y: "0%", opacity: 1 }}
           exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { y: "-100%", opacity: 0 }}
           transition={{ duration: 0.45, ease: EASE_OUT }}
         >
           <span className="text-ink tabular-nums">Fig. 0{index + 1}</span>
           <span>— {service.title}</span>
         </motion.span>
       </AnimatePresence>
     </span>
   </figcaption>
   ```

6. Update the comment above `Showcase` so it describes the new change: hover intent 110 ms; the incoming card uncovers from the foot with a line of light on its edge while its content settles; the outgoing one recedes, blurred, and stops; the caption rolls; reduced motion is a 0.2 s crossfade.

7. Add one line at the end of `docs/homepage-decisions.md`: "2026-11-19 (user: a premium change from service to service): pointing at a row changes the frame after 110 ms. The new card uncovers from the foot (0.7 s, strong ease-in-out) with a line of light on its edge, its content settling from 1.06 (0.9 s); the old one recedes under it to 0.96, dimmed and blurred 4px (0.6 s), its loop stopped; the new loop starts from its first step once uncovered. The caption rolls up to the new name. Never more than one card playing. Reduced motion: a 0.2 s crossfade."

## Boundaries

- Do NOT touch `service-cards.tsx` (plan 005 owns its `startDelay` and `play`), any `.svk-*` CSS, the rows, the drawer, or `exhibit.tsx`.
- Do NOT add dependencies, and do NOT use `layout` / `layoutId` (layout animations run on the main thread; and every Motion `layout` element below the opening must carry `layoutDependency`, CLAUDE.md).
- Do NOT animate `width`, `height`, `top` or `left`.
- If plan 005 is not done (no `startDelay` prop on `ServiceCard`, no `FRAME_DELAY_S` / `UNCOVER_S` in `services.tsx`), STOP and report.

## Verification

- **Mechanical**: `npx tsc --noEmit -p .` passes with no output.
- **Feel check** (dev server `nevima-dev-cards`, port 3011, at 1440x900; click the black once to run the opening, then scroll to "Our Services"):
  - Run the pointer quickly from the top row to the bottom row and off the list: the frame does not flicker through every service. At most it changes once, or not at all.
  - Rest on a row: after about a tenth of a second the new card uncovers from the foot, with a thin line of light on its moving edge. The old card is visibly receding (smaller, dimmer, softly blurred) underneath, never popping off.
  - The new card's drawing does not move until it is fully uncovered; then it plays from step 01.
  - In DevTools, `document.querySelectorAll('#services figure .svk').length` reads 1 once a change has settled, and never more than 2 during one.
  - Change service mid-transition: no jump; the motion retargets.
  - The caption rolls up to the new "Fig. 0X — name"; its line never shows two names overlapping.
  - Animations panel at 10%: the line of light stays exactly on the clip's edge from foot to top and fades at the end.
  - Rendering panel, `prefers-reduced-motion: reduce`: a plain 0.2 s crossfade, no clip, no scale, no blur, no line; the caption swaps at once.
- **Done when**: a service change reads as one hand-over (in from the foot, the old one receding), with one playing card and no pass-through flicker.
