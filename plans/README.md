# Animation plans

Written by `improve-animations`. Each plan is self-contained and can be run by any agent.

| # | Title | Severity | Status |
| --- | --- | --- | --- |
| [001](001-seo-geo-pixel-seams.md) | Dissolve the SEO & GEO page's section seams into pixels | MEDIUM | RETIRED (user turned the pixels down; replaced by the tonal veil, see docs/seo-geo-decisions.md) |
| [002](002-sheet-stack-section-transition.md) | Replace the slat wipe between sections with a stacked-sheet transition | MEDIUM | DONE |
| [003](003-side-by-side-entrances.md) | Side by side: entrances for the section heads, the plates and their controls | LOW | DONE |
| [004](004-meteor-follows-the-reader.md) | Back end: the meteor follows the reader's line, not the path's length | MEDIUM | DONE |
| [005](005-services-entrance-sequence.md) | Our Services: one entrance at a time, each card's loop starting only after its reveal | HIGH | DONE |
| [006](006-services-card-transition.md) | Our Services: a premium change from one service's card to the next | MEDIUM | DONE |

## Order and dependencies

- **001** stands alone.
- **002**: no dependencies. It touches only the Advanced Pilar page
  (`.sbs-a-*` in `src/app/globals.css`, `src/components/sbs-advanced.tsx`).
- **003**: no dependencies on 002. It touches the side-by-side page around
  the plates (`enter.tsx`, `side-by-side.tsx`, `sbs-included.tsx`,
  `sbs-service.tsx`, `sbs-personal.tsx`), never inside them.
- **004**: no dependencies. It touches only `GlowTrail` in
  `src/components/back-end-motion.tsx` (and a paragraph in
  `docs/back-end-decisions.md`), in the worktree `../NEVIMA-Website-be` on
  branch `design/back-end-depth`.
- **005** first. It touches `src/components/services.tsx` (the frame's
  delay, the cards' `play` / `startDelay`) and `src/components/service-cards.tsx`
  (`ServiceCard`, `useBeat`), in the worktree `../NEVIMA-Website-cards` on
  branch `design/services-cards-motion`.
- **006** after 005, which it builds on (`startDelay`, `FRAME_DELAY_S`,
  `UNCOVER_S`). It touches only `src/components/services.tsx` (`Services`'s
  hover intent, `Showcase`, a new `ShowcaseLayer`, the caption).
