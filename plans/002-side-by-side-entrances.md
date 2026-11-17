# 002 · Side by side: entrances for the section heads, the plates and their controls

- Severity: LOW (missed opportunity: the page below its header appears still)
- Status: TODO
- Written at commit: f5c00d2 (branch design/sbs-levels-pages)
- Chosen by the user on 2026-11-17: items 1 to 4 of the audit.

## Why

The side-by-side page (`/side-by-side`, `/pt/lado-a-lado`) uses the site's own
entrance, `SlideIn` (`src/components/enter.tsx`), only on its header. Every
section below it, and both plates, simply appear. These entrances give the
page one gesture throughout. They play **once per visit**, when each piece
comes into view, never in a loop: the page is a marketing page seen rarely,
so standard motion is right, but nothing must replay or pile up.

## The gesture (do not invent another)

The repo's convention, `SlideIn` in `src/components/enter.tsx`:

```tsx
export const ENTER_EASE = [0.22, 1, 0.36, 1] as const;
const SLIDE_S = 0.95;
const FADE_S = 0.42;
// IntersectionObserver, rootMargin "0px 0px -18% 0px", fires once
// animate={{ opacity: shown ? 1 : 0, x: shown ? 0 : out }}
// opacity: FADE_S, ease "easeOut"; x: SLIDE_S, ENTER_EASE; both with `delay`
```

Reduced motion: `SlideIn` already shows everything at once (`shown = seen || reduce`, `out = 0`). Keep that for everything below.

## Steps

### Step 1 · `SlideIn` learns to rise (`src/components/enter.tsx`)

Add `from?: "left" | "right" | "below"`. For `"below"`:

- start: `y: distance` (default the caller passes 24), `scale: 0.98`, `opacity: 0`
- end: `y: 0`, `scale: 1`, `opacity: 1`
- `y` and `scale` use `SLIDE_S` and `ENTER_EASE`; opacity as today.
- for left/right nothing changes (keep `x`, and pass `y: 0, scale: 1` or leave them out).
- reduced motion: `y: 0`, `scale: 1` from the start.

Only `transform` and `opacity` move. Do not add `will-change`.

### Step 2 · the three section heads (item 1)

Wrap, with `<SlideIn ready>` exactly as the page header does in `src/components/side-by-side.tsx` (lines ~500-512):

- `src/components/sbs-included.tsx` ~line 341: the `<div>` holding the mono label and `<h2 id="sbi-title">` → `<SlideIn ready>`; the `<p className="sbi-lede">` → `<SlideIn ready distance={0} delay={0.08}>`.
- `src/components/sbs-service.tsx` ~line 86: the mono label and `<h2 id="sbl-title">` → `<SlideIn ready>`; the `<p className="mt-7 ...">` under it → `<SlideIn ready distance={0} delay={0.08}>`.
- `src/components/sbs-personal.tsx` ~line 951: the `<div>` with the label and `<h2 id="sbp-title">` → `<SlideIn ready>`; `<p className="sbp-lede">` → `<SlideIn ready distance={0} delay={0.08}>`.

`.sbi-head` and `.sbp-head` are grids (`src/app/globals.css` ~4968): the wrapper must take the place of the element it wraps (pass the wrapped element's grid-relevant class to `SlideIn`'s `className`, or wrap the element's children, never add a third grid child).

### Step 3 · the two plates of the comparison (item 2)

`src/components/side-by-side.tsx`, inside `<div ref={pair} className="sbs-pair">`: wrap each `<Plate>` in `<SlideIn ready from="below" distance={24}>`, the second with `delay={0.09}`. `.sbs-pair` is a grid of two columns from 900px (`globals.css` ~3917): each wrapper becomes the grid item, so nothing else changes. The loop starts as it does today (`useSeen` on the stage); do not tie it to the entrance.

### Step 4 · the levels plate and its switch (item 3)

`src/components/sbs-service.tsx`:

- inside `<figure className="sbl-figure">`, wrap `<div ref={plate} className="sbl-plate" ...>` in `<SlideIn ready from="below" distance={24}>`. Keep `ref={plate}` and the tap handlers on `.sbl-plate` itself (the in-view check and the take-over read it).
- wrap the contents of `<div className="sbl-ctrl">` (the switch and the level's note) in `<SlideIn ready distance={0} delay={0.12}>`. `.sbl-ctrl` keeps its grid area; only its contents are wrapped.

### Step 5 · what is under the plates (item 4)

Rise of 10px, after the plate:

- `side-by-side.tsx`: `<ExploreBar …/>` (when shown) and `<p className="sbs-note mono-label">` → each in `<SlideIn ready from="below" distance={10} delay={0.18}>`.
- `sbs-service.tsx`: `<figcaption className="sbl-caption …">` and `<ExploreBar …/>` → each in `<SlideIn ready from="below" distance={10} delay={0.18}>`. A `figcaption` must stay a direct child of its `figure`: wrap its contents, not the element.

## Out of scope

- Anything inside the plates (the Pilar pages, `.sbs-p-*`, `.sbs-a-*`, `.sbs-c-*`).
- The wall of "Included in the service" (`.sbi-wall`) and the personalization card: they have motion of their own (items 5 and 6 were not chosen).
- No change of copy, colour, size or layout. No new easing or duration.

## Verify

1. `npx tsc --noEmit -p .` passes.
2. `localhost:3008/pt/lado-a-lado` (launch config `nevima-dev-levels`): scroll down slowly. Each head slides in from the left as the header does; each plate rises 24px and settles; the second comparison plate follows the first by about 0.1s; the switch, buttons and notes follow their plate. Nothing replays on scrolling back up.
3. Feel check: slow the animations to 10% in DevTools (Animations panel): the fade is spent in the first third and the move carries on under it; no element jumps at the end.
4. Reduced motion on (DevTools > Rendering > prefers-reduced-motion): everything is simply there.
5. Manual mode still works: "Percorrer à vontade", a tap on a plate, "Abrir em grande".
6. No horizontal scroll at 390px.
