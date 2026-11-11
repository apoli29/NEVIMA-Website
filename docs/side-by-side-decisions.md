# Side by side — decisions

The page at `/side-by-side` and `/pt/lado-a-lado` (`src/components/side-by-side.tsx`,
styles under `.sbs-*` at the foot of `src/app/globals.css`).

## What it is

- 2026-11-11 (user): a page showing "o design estilo WordPress vs o nosso
  design" — little text, two looping pages for the same company, one as
  another agency would have made it and one as we make it, two or three
  sections each. The comparison on the home page (`comparison.tsx`) says
  the difference in words; this page shows it.
- The two pages are the same invented clinic. They start in the same
  frame and go down the page at the same moments, so the only thing that
  differs is what each does with that time: the template never finishes
  arriving, ours arrives once and holds still.

## How it is built

- Real HTML, not video and not a screenshot: each page is laid out at
  900px (620px under 900px of viewport) and scaled into its plate by
  `--sbs-k`, which a ResizeObserver writes on the plate. The type inside
  is type. Two videos would weigh more than the whole home page, would
  band on the black, and would say the opposite of what the page claims.
- One loop, `--sbs-loop: 12s`, in CSS keyframes. Both sides are given
  `.sbs-run` in the same render, so the two loops begin in the same frame
  and never drift apart. Held while off the screen through
  `offscreen-pause.tsx`; not given at all to anyone who has asked for
  less motion, who sees both pages as they end up.
- The stops are written in each page's own pixels and multiplied by
  `--sbs-k` in the keyframes: `translate` is applied outside `scale`, so
  an unscaled stop moves the page about 1.4× too far (found on 2026-11-11,
  after the first version overshot its own foot).
- There is no fade at the turn of the loop. A first version faded both
  plates out and back, which reads well while it runs but leaves a blank
  white plate whenever the animation is paused or not advancing (off the
  screen, a background tab). The visit now restarts by the page itself
  going back to the top, with the loading bar, the banner and the cookie
  wall resetting with it.
- The miniature pages are `aria-hidden`; each plate is a `<figure>` whose
  caption carries the label and whose `sr-only` line says what the
  demonstration shows, so no lorem reaches a screen reader.

## Settled

- The left side is labelled "Off-the-shelf template" / "Modelo pré-feito",
  not WordPress (decided 2026-11-11, with the user's "segue"): naming a
  product and putting a caricature of it beside our own work is a claim
  about a competitor we cannot stand behind, and the label says the same
  thing truthfully.
- No figures. No load times, no page weights, no scores: any number here
  would be invented, and the page is an argument about honesty. A line
  under the pair says both pages are demonstrations and the clinic is
  invented.
- The clinic is "Verdela", invented, in Porto. Its photographs are the
  studio's own (`/contact/water-1280.webp`, `/about/folds-1280.webp`), so
  nothing was downloaded for a demonstration.
- Indexed (`index: true` in `SEO_PAGES`), unlike the about page and the
  portfolio, which are still moulds.
- On the bar, as its fourth link (user, 2026-11-11: "mete na navbar o
  que fizeste para eu poder clicar"), which settles the 2026-10-11 rule
  the other way. With four links the bar no longer fits a small tablet,
  so it folds into "Menu" at 768px instead of 640px and keeps the links'
  numbers for 1024px and up; the Portuguese labels are what the width is
  measured against, being the longer ones.
- Also a link at the foot of the home page's comparison table,
  "See the same business built twice" / "Ver a mesma empresa construída
  duas vezes" (user, 2026-11-11: the page was built and left unlinked,
  and the user asked for it to be reachable). Not the bar: its links are
  settled (user, 2026-10-11). White mono on the section's black, a
  hairline under it and an arrow that moves on hover.

## Open

- Whether the clinic keeps the name Verdela.
- Whether the demonstration should have a photograph of its own rather
  than borrowing the studio's.
