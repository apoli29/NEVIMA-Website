# 002 — Replace the slat wipe between sections with a stacked-sheet transition

- **Status**: DONE (2026-11-17; the foot keeps its glow beside sbs-a-in-4)
- **Commit**: ef1f852
- **Severity**: MEDIUM
- **Category**: Missed opportunities (8) / Physicality & origin (3)
- **Estimated scope**: 2 files (`src/app/globals.css`, `src/components/sbs-advanced.tsx`), ~120 lines of CSS, 4 class names in TSX

## Problem

The Advanced Pilar page (the design-levels plate on `/side-by-side` and
`/pt/lado-a-lado`) moves between its five sections with a slat mask: each
incoming section is revealed through 30px horizontal stripes that widen.
On a dark ground, and on sections that are themselves dark (the five kinds,
the foot), the stripes barely read; and nothing happens to the section
being left, so the change has no sense of depth. The user asked for "uma
animação mais avançada, premium, para a transição entre secções".

Current code:

```css
/* src/app/globals.css:4391 — current */
@property --wipe { syntax: "<length>"; inherits: false; initial-value: 0px; }
```

```css
/* src/app/globals.css:4451-4460 — current */
  /* Between sections: each section comes in through slats (Evolve's),
     widening as it arrives; between them the page's own ground, Noite,
     so a section waiting below another reads as dark space, not a block. */
  .sbs-a-page { background: var(--p-noite); }
  .sbs-a-wipe {
    position: relative;
    isolation: isolate;
    -webkit-mask: repeating-linear-gradient(to bottom, #000 0 calc(30px - var(--wipe)), transparent calc(30px - var(--wipe)) 30px);
    mask: repeating-linear-gradient(to bottom, #000 0 calc(30px - var(--wipe)), transparent calc(30px - var(--wipe)) 30px);
  }
```

```css
/* src/app/globals.css:4722-4745 — current */
  .sbs-run .sbs-a-index { animation: sbs-a-wipe-1 var(--sbs-loop) linear infinite; }
  .sbs-run .sbs-a-sheet { animation: sbs-a-wipe-2 var(--sbs-loop) linear infinite; }
  .sbs-run .sbs-a-how { animation: sbs-a-wipe-3 var(--sbs-loop) linear infinite; }
  .sbs-run .sbs-a-foot { animation: sbs-a-wipe-4 var(--sbs-loop) linear infinite; }
  @keyframes sbs-a-wipe-1 { 0%, 22% { --wipe: 30px; … } 27%, 97% { --wipe: 0px; } 98%, 100% { --wipe: 30px; } }
  @keyframes sbs-a-wipe-2 { 0%, 46% { --wipe: 30px; … } 51%, 97% { --wipe: 0px; } 98%, 100% { --wipe: 30px; } }
  @keyframes sbs-a-wipe-3 { 0%, 60% { --wipe: 30px; … } 65%, 97% { --wipe: 0px; } 98%, 100% { --wipe: 30px; } }
  @keyframes sbs-a-wipe-4 { 0%, 86% { --wipe: 30px; … } 90%, 98% { --wipe: 0px; } 99%, 100% { --wipe: 30px; } }
```

How the page moves (do not change it): the page translates on its own CSS
loop, `sbs-a-scroll`, 26s (`--sbs-loop: 26s` on `.sbs-a-page`), with these
holds: hero 0–22%, five kinds 26–46%, table 50–60%, steps 64–86%, foot
89–96%, back to the top by 100%. The four section changes therefore happen
at **22–26%**, **46–50%**, **60–64%** and **86–89%**. Everything animated
must live under `.sbs-run` (absent for reduced motion, where every section
is shown finished).

## Target

A **stacked-sheet** transition, as on Apple's and high-end agency sites:
the section being left is pushed back (it shrinks a little from its top,
darkens and its corners round), while the section arriving rises over it
as a sheet whose rounded top widens to the full page and squares off.

Per change *n* (outgoing section O, incoming section I), over the change's
window [a, b] (e.g. 22–26%):

- **O (outgoing)**: `transform: scale(1) → scale(0.94)` with
  `transform-origin: 50% 0`; a dark veil over it `opacity 0 → 0.5`;
  `clip-path: inset(0 round 0) → inset(0 round 22px)`. Easing
  `cubic-bezier(0.77, 0, 0.175, 1)` (strong ease-in-out: on-screen movement).
- **I (incoming)**: `clip-path: inset(0 4% 0 4% round 28px 28px 0 0) →
  inset(0 0 0 0 round 0)`; its content `translate: 0 48px → 0 0`,
  `opacity 0.4 → 1`. Easing `cubic-bezier(0.23, 1, 0.32, 1)` (strong
  ease-out: entering), starting 0.5% after O starts so the push leads.
- Every value set back between 97% and 100% (all sections are off the
  plate or returning to the top then).

Exact CSS (replaces the `.sbs-a-wipe` rule, the `--wipe` property and the
four `sbs-a-wipe-*` keyframes):

```css
/* target — in place of src/app/globals.css:4451-4460 */
  /* Between sections: stacked sheets. The section being left is pushed
     back (shrinks from its top, darkens, rounds its corners) while the next
     rises over it as a sheet whose rounded top widens to the page and
     squares off (user, 2026-11-17: "mais avançada, premium"). */
  .sbs-a-page { background: var(--p-noite); --a-move: cubic-bezier(0.77, 0, 0.175, 1); --a-enter: cubic-bezier(0.23, 1, 0.32, 1); }
  .sbs-a-sheetx { position: relative; isolation: isolate; transform-origin: 50% 0; }
  .sbs-a-sheetx::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 40;
    pointer-events: none;
    background: #05060c;
    opacity: 0;
  }
```

```css
/* target — in place of src/app/globals.css:4722-4745 */
  /* each change: the section left pushed back, the next one rising */
  .sbs-run .sbs-a-hero  { animation: sbs-a-out-1 var(--sbs-loop) linear infinite; }
  .sbs-run .sbs-a-hero::before  { animation: sbs-a-veil-1 var(--sbs-loop) linear infinite; }
  .sbs-run .sbs-a-index { animation: sbs-a-in-1 var(--sbs-loop) linear infinite, sbs-a-out-2 var(--sbs-loop) linear infinite; }
  .sbs-run .sbs-a-index::before { animation: sbs-a-veil-2 var(--sbs-loop) linear infinite; }
  .sbs-run .sbs-a-sheet { animation: sbs-a-in-2 var(--sbs-loop) linear infinite, sbs-a-out-3 var(--sbs-loop) linear infinite; }
  .sbs-run .sbs-a-sheet::before { animation: sbs-a-veil-3 var(--sbs-loop) linear infinite; }
  .sbs-run .sbs-a-how   { animation: sbs-a-in-3 var(--sbs-loop) linear infinite, sbs-a-out-4 var(--sbs-loop) linear infinite; }
  .sbs-run .sbs-a-how::before   { animation: sbs-a-veil-4 var(--sbs-loop) linear infinite; }
  .sbs-run .sbs-a-foot  { animation: sbs-a-in-4 var(--sbs-loop) linear infinite; }

  /* outgoing: scale and corners (n = 1..4, windows 22-26, 46-50, 60-64, 86-89) */
  @keyframes sbs-a-out-1 { 0%, 22% { scale: 1; clip-path: inset(0 round 0); animation-timing-function: var(--a-move); } 26%, 97% { scale: 0.94; clip-path: inset(0 round 22px); } 98%, 100% { scale: 1; clip-path: inset(0 round 0); } }
  @keyframes sbs-a-out-2 { 0%, 46% { scale: 1; animation-timing-function: var(--a-move); } 50%, 97% { scale: 0.94; } 98%, 100% { scale: 1; } }
  @keyframes sbs-a-out-3 { 0%, 60% { scale: 1; animation-timing-function: var(--a-move); } 64%, 97% { scale: 0.94; } 98%, 100% { scale: 1; } }
  @keyframes sbs-a-out-4 { 0%, 86% { scale: 1; animation-timing-function: var(--a-move); } 89%, 97% { scale: 0.94; } 98%, 100% { scale: 1; } }
  @keyframes sbs-a-veil-1 { 0%, 22% { opacity: 0; animation-timing-function: var(--a-move); } 26%, 97% { opacity: 0.5; } 98%, 100% { opacity: 0; } }
  @keyframes sbs-a-veil-2 { 0%, 46% { opacity: 0; animation-timing-function: var(--a-move); } 50%, 97% { opacity: 0.5; } 98%, 100% { opacity: 0; } }
  @keyframes sbs-a-veil-3 { 0%, 60% { opacity: 0; animation-timing-function: var(--a-move); } 64%, 97% { opacity: 0.5; } 98%, 100% { opacity: 0; } }
  @keyframes sbs-a-veil-4 { 0%, 86% { opacity: 0; animation-timing-function: var(--a-move); } 89%, 97% { opacity: 0.5; } 98%, 100% { opacity: 0; } }

  /* incoming: the rounded sheet widening to the page */
  @keyframes sbs-a-in-1 { 0%, 22.5% { clip-path: inset(0 4% 0 4% round 28px 28px 0 0); animation-timing-function: var(--a-enter); } 26.5%, 97% { clip-path: inset(0 0 0 0 round 0); } 98%, 100% { clip-path: inset(0 4% 0 4% round 28px 28px 0 0); } }
  @keyframes sbs-a-in-2 { 0%, 46.5% { clip-path: inset(0 4% 0 4% round 28px 28px 0 0); animation-timing-function: var(--a-enter); } 50.5%, 97% { clip-path: inset(0 0 0 0 round 0); } 98%, 100% { clip-path: inset(0 4% 0 4% round 28px 28px 0 0); } }
  @keyframes sbs-a-in-3 { 0%, 60.5% { clip-path: inset(0 4% 0 4% round 28px 28px 0 0); animation-timing-function: var(--a-enter); } 64.5%, 97% { clip-path: inset(0 0 0 0 round 0); } 98%, 100% { clip-path: inset(0 4% 0 4% round 28px 28px 0 0); } }
  @keyframes sbs-a-in-4 { 0%, 86.5% { clip-path: inset(0 4% 0 4% round 28px 28px 0 0); animation-timing-function: var(--a-enter); } 89.5%, 98% { clip-path: inset(0 0 0 0 round 0); } 99%, 100% { clip-path: inset(0 4% 0 4% round 28px 28px 0 0); } }
```

Notes on the target:

- An element may carry two animations only if they animate different
  properties: `sbs-a-in-n` animates `clip-path`, `sbs-a-out-n` animates
  `scale` (and, for the hero only, `clip-path` — the hero has no `in`).
  Keep it that way; never let two animations on one element both set
  `clip-path`.
- `scale` is the individual transform property (not `transform`), so it
  does not fight any `transform` set elsewhere on these sections.
- The incoming content's rise (48px) is already covered by the page's own
  translate; do **not** add a second translate to the sections.

## Repo conventions to follow

- Every animation on this page runs on its loop, `var(--sbs-loop)` with
  `linear` and per-keyframe `animation-timing-function`, gated by
  `.sbs-run` — exemplar: `src/app/globals.css`, the block
  `.sbs-run .sbs-a-kind b > span { animation: sbs-a-rise … }` and
  `@keyframes sbs-a-rise { 0%, 24% { …; animation-timing-function: var(--a-ease); } 30%, 97% { … } 98%, 100% { … } }`.
- Custom curves are declared as properties on `.sbs-a-page` (`--a-ease`
  already lives there); add `--a-move` and `--a-enter` beside it.
- Comments say *why* and cite the user and date, in English, as the
  surrounding code does.
- The decision is recorded in `docs/side-by-side-decisions.md` under the
  Advanced rounds, one bullet, dated.

## Steps

1. `src/app/globals.css`: delete the line
   `@property --wipe { syntax: "<length>"; inherits: false; initial-value: 0px; }`.
2. `src/app/globals.css`: replace the `.sbs-a-wipe` comment and rule
   (shown in Problem, lines 4451–4460) with the first target block above.
3. `src/app/globals.css`: replace the four `.sbs-run … sbs-a-wipe-n` lines
   and the four `@keyframes sbs-a-wipe-n` (lines 4722–4745, comment line
   "the slats between sections…" included) with the second target block.
4. `src/components/sbs-advanced.tsx`: on the five section elements, use the
   class `sbs-a-sheetx`:
   - the hero `<div className="sbs-p-hero sbs-a-hero">` →
     `className="sbs-p-hero sbs-a-hero sbs-a-sheetx"`;
   - replace `sbs-a-wipe` with `sbs-a-sheetx` on the elements with
     `sbs-a-index`, `sbs-a-sheet`, `sbs-a-how`, `sbs-p-foot sbs-a-foot`.
5. `src/components/sbs-advanced.tsx`: in the header comment, replace the
   line "- Between sections, violet slats wipe each one in as it arrives."
   with "- Between sections, stacked sheets: the section left is pushed
   back, the next rises over it with a rounded top that widens."
6. `docs/side-by-side-decisions.md`: append one bullet dated 2026-11-17
   describing the stacked-sheet transition and that it replaces the slats.

## Boundaries

- Do NOT touch `sbs-a-scroll` or any hold percentage; the timing of the
  page is settled.
- Do NOT touch the opening (`.sbs-a-intro`, `pilar-metal.tsx`) or the
  Essential+ page (`.sbs-p-*` in `sbs-pilar.tsx`).
- Do NOT use `mask` for this transition, and do NOT animate `width`,
  `height`, `top` or `margin`.
- `.sbs-p-foot` already has an `::after` (grain). The veil uses `::before`;
  if `.sbs-p-foot::before` turns out to be in use, STOP and report.
- Do NOT add dependencies. Do NOT push.
- If any excerpt above no longer matches the file (drift since `ef1f852`),
  STOP and report instead of improvising.

## Verification

- **Mechanical**: `npx tsc --noEmit -p .` passes with no output;
  `grep -n "sbs-a-wipe\|--wipe" src/app/globals.css src/components/sbs-advanced.tsx`
  returns nothing.
- **Feel check** (open `/pt/lado-a-lado`, scroll to "Níveis de design",
  choose Avançado, press the temporary "Pausar" and drag the bar):
  - at 22–26%, 46–50%, 60–64% and 86–89% the section above shrinks a
    little from its top edge, darkens and rounds its corners, while the
    next one rises over it with a rounded top narrower than the page that
    widens to the full width and squares off;
  - the push starts a beat before the rise (0.5% of the loop, ~130ms);
  - no stripes anywhere; no frame where a section is cut by a hard band;
  - between 97% and 100% nothing visible snaps (all reset values are
    applied while the page returns to the top);
  - in DevTools' Animations panel at 10% speed, the incoming sheet's
    corners stay round until it is nearly full width, then square off;
  - with `prefers-reduced-motion: reduce` (Rendering panel), every section
    is shown flat and finished, with no rounding, scaling or veil.
- **Done when**: the four changes read as one sheet sliding over another,
  the user confirms the feel in the plate, and the decision bullet is in
  `docs/side-by-side-decisions.md`.
