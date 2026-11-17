# 001 — Dissolve the SEO & GEO page's section seams into pixels

- **Status**: RETIRED (user, 2026-11-16: "demasiado tecnológico"; replaced by the tonal veil)
- **Commit**: e2dec35
- **Severity**: MEDIUM
- **Category**: Missed opportunities (section transitions)
- **Estimated scope**: 1 new file (~140 lines), 1 edited file (~10 lines), a few lines of CSS

## Problem

The SEO & GEO page (`/services/seo`, `/pt/servicos/seo`) alternates hard colour blocks with nothing between them: a dark hero, a white GEO section, a dark chart section, a white price section, then the black "Let's work together". Every seam is a straight cut from `#0b0b0b` to `#ffffff` and back. The user asked for transitions between the sections (2026-11-16) and chose a **pixel dissolve** at **all four seams**.

The sections are composed here:

```tsx
/* src/components/seo-geo.tsx — current, at the foot of the file */
export function SeoGeo({ prices }: { prices: SeoPrice[] }) {
  const t = useT();
  return (
    <>
      <SeoHero t={t} />
      <GeoSection t={t} />
      <Levels t={t} />
      <Price t={t} table={prices} />
    </>
  );
}
```

The page is rendered by `src/components/service-page.tsx` inside `<main>`, followed directly by `<WorkTogether />` (a black section, `bg-ink`, i.e. `#000000`) and `<Footer />`.

Section grounds, exactly:
- `SeoHero` and `Levels`: dark, drawn by `.sbs-ground` (base colour `#0b0b0b`, a faint radial light in the top-left corner and a 10% noise overlay). Their bottom edge reads as `#0b0b0b`.
- `GeoSection` and `Price`: white, `#ffffff` (the page's `bg-paper`).
- `WorkTogether`: `#000000` with a dimmed photo.

## Target

The reference is the pixel mosaic on Locomotive's site (found through Inspo, `locomotive-ca`). It suits this page twice over: its first section turns noise into a readable result, and the site's rule is that pixel looks are modern, never retro (no scanlines, glow or CRT).

Between every two sections there is a **seam**: a band in normal flow, as wide as the page, `ROWS` rows of square cells high. Its own background is the colour of the section **below**. A canvas over it paints some of its cells in the colour of the section **above**. Which cells are painted follows the scroll, both ways. As the seam rises through the screen, the upper colour breaks up into pixels and recedes, ending on a stable, ragged pixel edge. Nothing moves when the page does not scroll.

Exact values:

- **Cell size** `cell = Math.round(Math.min(24, Math.max(14, window.innerWidth / 64)))` CSS px. That is 14px on a phone and 22px at 1440px.
- **Rows** `ROWS = 8`. Seam height `ROWS * cell` px, set inline as `height` on the seam element and recomputed on resize.
- **Columns** `cols = Math.ceil(width / cell)`, where `width` is the seam's `clientWidth`. The last column may overflow; the canvas clips it.
- **Each cell's value**, fixed for the life of the page: `r = 0.62 * (1 - row / (ROWS - 1)) + 0.38 * rand()`, with `row` 0 at the top (the top rows score highest, so they keep the upper colour longest). `rand` is mulberry32 seeded with the seam's `seed` prop, drawn in row-major order, so the pattern is the same on every load:
  ```ts
  function mulberry32(a: number) {
    return () => {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  ```
  Regenerate the values when `cols` changes, still from `seed`.
- **Progress**, linear because the scroll is the clock (no easing on a scroll-linked value): `p = clamp((vh * 0.95 - top) / (vh * 0.55), 0, 1)`, where `top` is the seam's `getBoundingClientRect().top` and `vh` is `window.innerHeight`. It starts when the seam's top is 95% down the screen and is done when that top is 40% down.
- **Threshold** `t = -0.02 + 0.66 * p`. A cell is painted in the upper colour when `r > t`.
  - At `p = 0` every cell is painted, so the seam reads as the upper section running on.
  - At `p = 1` (`t = 0.64`), the top rows are mostly painted and the bottom rows clear: a ragged pixel edge, the resting state.
- **Drawing**: a 2D canvas sized to the seam at `devicePixelRatio`, with the transform scaled by dpr. Each frame: `clearRect`, then one `fillRect(col * cell, row * cell, cell, cell)` per painted cell, in the upper colour. Redraw only when `Math.round(t * 200)` changes from the last frame, so a still or slow scroll costs nothing.
- **Colours** (exact hex, read nothing from CSS):

  | seam | `above` | `below` | `seed` |
  | --- | --- | --- | --- |
  | Hero → GEO | `#0b0b0b` | `#ffffff` | 11 |
  | GEO → Levels | `#ffffff` | `#0b0b0b` | 23 |
  | Levels → Price | `#0b0b0b` | `#ffffff` | 37 |
  | Price → Let's work together | `#ffffff` | `#000000` | 41 |

- **Reduced motion** (`useReducedMotion()` from `motion/react`): draw once at `p = 1` and attach no scroll listener.
- **Only near the screen**: attach the scroll and resize listeners while an `IntersectionObserver` (`rootMargin: "50% 0px"`) reports the seam as intersecting, and remove them when it leaves. Draw once on entering.
- **Before hydration** the canvas is empty and the band shows only its `below` colour. That is acceptable: the seams are off the first screen.
- `aria-hidden="true"` on the seam, `pointer-events: none` on the canvas.

## Repo conventions to follow

- Client components start with `"use client"` and import `useReducedMotion` from `motion/react` (see `src/components/seo-geo.tsx:4`).
- **Scroll-linked effects** use a rAF-queued window `scroll` listener plus a `ResizeObserver` on `document.body`, not `useScroll`. Lenis drives the window's scroll, so `scroll` events fire normally. Imitate `src/components/about-values.tsx:220-279` (`queue()` → `requestAnimationFrame(update)`, passive listener, cleanup that cancels the frame and disconnects the observer).
- Comments in this codebase are prose explaining *why*, in British English, in a block at the top of each component (see the header of `src/components/seo-geo.tsx`). Write one for the new file that names Locomotive as the reference and says the seam follows the scroll both ways.
- Page styles live in `src/app/globals.css` inside `@layer components`. This page's classes are prefixed `.sg-`.

## Steps

1. **Create `src/components/pixel-seam.tsx`** exporting `PixelSeam({ above, below, seed }: { above: string; below: string; seed: number })`. It renders:
   ```tsx
   <div ref={wrap} aria-hidden="true" className="sg-seam" style={{ background: below, height }}>
     <canvas ref={canvas} className="sg-seam-canvas" />
   </div>
   ```
   - Keep `height` in state, computed from `cell` and `ROWS` on mount and on resize. Start at `8 * 18` px (144) so the server render reserves room.
   - Implement the cell values, progress, threshold, drawing, reduced-motion path and IntersectionObserver gating exactly as in **Target**.
   - Keep the cell values in a `useRef<Float32Array>` along with `cols` and `cell`. Rebuild them when `cols` or `cell` changes.
2. **Add the CSS** at the end of the SEO & GEO block in `src/app/globals.css`, inside `@layer components`:
   ```css
   .sg-seam { position: relative; width: 100%; overflow: hidden; }
   .sg-seam-canvas { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
   ```
3. **Place the seams** in `src/components/seo-geo.tsx`. Import `PixelSeam` from `./pixel-seam` and change `SeoGeo`'s return to:
   ```tsx
   <>
     <SeoHero t={t} />
     <PixelSeam above="#0b0b0b" below="#ffffff" seed={11} />
     <GeoSection t={t} />
     <PixelSeam above="#ffffff" below="#0b0b0b" seed={23} />
     <Levels t={t} />
     <PixelSeam above="#0b0b0b" below="#ffffff" seed={37} />
     <Price t={t} table={prices} />
     <PixelSeam above="#ffffff" below="#000000" seed={41} />
   </>
   ```
   The last seam is the last child of `<main>` and sits right above `WorkTogether`. Nothing in `work-together.tsx` or `service-page.tsx` changes.
4. **Close the gaps the seams would leave.** Each seam now does part of the work of the space at the foot of the section above it. In `globals.css`, change the bottom padding of these four classes from `clamp(4.5rem, 9vw, 7.5rem)` to `clamp(2.5rem, 5vw, 4rem)`: `.sg-hero`, `.sg-geo`, `.sg-levels`, `.sg-price`. Change nothing else in them.
5. Add a line under "## The sections" in `docs/seo-geo-decisions.md`: "Seams (2026-11-16, user): a pixel dissolve between every two sections and before Let's work together (`pixel-seam.tsx`), after Locomotive's pixel mosaic; scroll-linked both ways, a ragged pixel edge at rest, drawn still for reduced motion."

## Boundaries

- Do NOT touch `work-together.tsx`, `service-page.tsx`, `footer.tsx` or any other page. The seams are this page's only.
- Do NOT use `useScroll` or Motion for the progress. Use the listener pattern from `about-values.tsx`.
- Do NOT animate `height`, `top` or layout. Only the canvas's pixels change while scrolling.
- Do NOT add glow, scanlines, blur, colour other than the four hex values, or any per-cell transition. Cells flip instantly; the scroll makes the motion.
- Do NOT add dependencies.
- If `SeoGeo`'s return or the four section class names differ from what is quoted here (drift since `e2dec35`), STOP and report instead of improvising.

## Verification

- **Mechanical**: `npx tsc --noEmit -p .` reports nothing, and `npx next build` completes. Do not commit or push.
- **Feel check** (dev server `nevima-dev`, page `/pt/servicos/seo`):
  - Scroll slowly from the hero into GEO. The hero's black breaks up into squares from its lower edge and recedes upward, ending on a stable ragged edge. Scrolling back up rebuilds it in reverse, cell for cell.
  - With the wheel still, nothing changes on any seam.
  - All four seams: the colour at the top of each seam is identical to the section above it, with no visible line or step between them, and the remaining colour matches the section below.
    - On the dark grounds the section has a 10% noise overlay and the seam is solid `#0b0b0b`. Look closely at 100% zoom. If the seam's top edge reads as a line, report it rather than inventing a fix.
  - The edge is the same after a reload (seeded), and different on each of the four seams.
  - At 375×812 the cells are 14px, the seams are 112px high, and `document.documentElement.scrollWidth === 375`.
  - Emulate `prefers-reduced-motion: reduce` (DevTools › Rendering) and reload: every seam shows its resting ragged edge and does not change while scrolling.
  - DevTools Performance: record 5 s of scrolling through all seams. There should be no long tasks attributable to `pixel-seam`, and paint should stay limited to the seam canvases.
- **Done when**: four seams render at the four boundaries listed above, follow the scroll both ways, rest on a seeded ragged edge, stay still for reduced motion, and the build passes.
