# Animation plans

Written by `improve-animations`. Each plan is self-contained and can be run
by any agent; run them in the order below.

| # | Title | Severity | Status |
| --- | --- | --- | --- |
| 001 | [Replace the slat wipe between sections with a stacked-sheet transition](001-sheet-stack-section-transition.md) | MEDIUM | DONE |
| 002 | [Side by side: entrances for the section heads, the plates and their controls](002-side-by-side-entrances.md) | LOW | TODO |

## Order and dependencies

1. **001**: no dependencies. It touches only the Advanced Pilar page
   (`.sbs-a-*` in `src/app/globals.css`, `src/components/sbs-advanced.tsx`).
2. **002**: no dependencies on 001. It touches the side-by-side page around
   the plates (`enter.tsx`, `side-by-side.tsx`, `sbs-included.tsx`,
   `sbs-service.tsx`, `sbs-personal.tsx`), never inside them.
