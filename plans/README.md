# Animation plans

Written by `improve-animations`. Each plan is self-contained and can be run by any agent.

| # | Title | Severity | Status |
| --- | --- | --- | --- |
| [001](001-seo-geo-pixel-seams.md) | Dissolve the SEO & GEO page's section seams into pixels | MEDIUM | RETIRED (user turned the pixels down; replaced by the tonal veil, see docs/seo-geo-decisions.md) |
| [002](002-sheet-stack-section-transition.md) | Replace the slat wipe between sections with a stacked-sheet transition | MEDIUM | DONE |
| [003](003-side-by-side-entrances.md) | Side by side: entrances for the section heads, the plates and their controls | LOW | DONE |

## Order and dependencies

- **001** stands alone.
- **002**: no dependencies. It touches only the Advanced Pilar page
  (`.sbs-a-*` in `src/app/globals.css`, `src/components/sbs-advanced.tsx`).
- **003**: no dependencies on 002. It touches the side-by-side page around
  the plates (`enter.tsx`, `side-by-side.tsx`, `sbs-included.tsx`,
  `sbs-service.tsx`, `sbs-personal.tsx`), never inside them.
