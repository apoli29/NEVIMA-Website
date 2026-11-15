# Side by side — decisions

The page at `/side-by-side` and `/pt/lado-a-lado` (`src/components/side-by-side.tsx`,
styles under `.sbs-*` at the foot of `src/app/globals.css`).

## What it is

- 2026-11-11 (user): a page showing "o design estilo WordPress vs o nosso
  design" — little text, two looping pages for the same company, one as
  another agency would have made it and one as we make it, two or three
  sections each. The comparison on the home page (`comparison.tsx`) says
  the difference in words; this page shows it.
- The two pages are the same invented business. They start in the same
  frame and go down the page at the same moments, so the only thing that
  differs is what each does with that time: the template never finishes
  arriving, ours arrives once and holds still.

## How it is built

- Real HTML, not video and not a screenshot: each page is laid out at
  900px (620px under 900px of viewport) and scaled into its plate by
  `--sbs-k`, which a ResizeObserver writes on the plate. The type inside
  is type. Two videos would weigh more than the whole home page, would
  band on the black, and would say the opposite of what the page claims.
- One loop, `--sbs-loop: 15s` (12s until the four-stop Pilar page), in CSS keyframes. Both sides are given
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
- 2026-11-15 (user): the business is "Pilar Seguros", an invented
  insurance broker with its own brand guide (symbol, signatures, palette
  Noite #111525, Grafite #434655, Névoa #A8AABC, Branco). It replaces the
  clinic Verdela on both sides. The English page carries the "Pilar
  Insurance" signature and the Portuguese page "Pilar Seguros": the name
  is never translated, only the descriptor.
- Our side has four sections, chosen for the business: the hero (one
  line on what a broker is, over a pillar), the five kinds of insurance
  as very large words, a band on claims (the moment a broker earns its
  keep), and a manifesto with a closing line.
- Its layout and type follow one reference closely, at the user's
  request ("99,9%" except colours): Wealthsimple's home page, found
  through Inspo as the nearest top-level site in finance. Taken from it:
  the inset white bar with round icons and pill buttons, the centred
  serif line with one outlined button, the column of very large serif
  words, the full-width band with a small signature, a three-line sans
  title and a round arrow, the manifesto under a small mark. The
  reference's colours are not taken; only Pilar's four are used.
- 2026-11-15 (user, second round): sections 3 and 4 follow better, more
  advanced references, also found through Inspo. Section 3 (claims)
  follows Area17: a statement on white ("Quando há um sinistro, quem liga
  à seguradora somos nós...") and then the rain across the width with
  the four steps of a claim stacked on it, the first lit and the rest
  held back. Section 4 follows the AiiD 2026 case studies: half and half,
  the Pilar symbol drawn in pixels on its own 100-unit grid (the cut and
  the core stay empty, as the guide asks) beside a white column with the
  title, the signature and a detail of the pillar; then a summary row
  under a hairline with "Falar com quem compara." and the CTA. The hero
  and the index keep the Wealthsimple layout.
- Type, chosen from Pilar's identity and not from any reference (user,
  2026-11-15, option A of three): Funnel Display for every display line
  (near-square counters and straight-cut terminals, the symbol's flat
  geometry), Plus Jakarta Sans (the brand's) for the rest, IBM Plex Mono
  for the small labels (not Geist Mono, which is nevima's own). Loaded in
  `side-by-side.tsx` only. Newsreader is gone.
- The loop now has four stops (one per section), on a 15s loop; the
  template side moves in three steps of its own to the same moments.
- Photographs, both from Unsplash under its free licence (not Unsplash+),
  turned into Pilar's palette: the pillar by Alejandro Barba
  (unsplash.com/photos/elvAJVysX8w), its sky extended upward so the line
  sits in it (section 4's detail is a crop of the same photograph); the rain on glass by Rama Krushna Behera
  (unsplash.com/photos/vy5aeGxRhok). In `public/side-by-side/`.
- The template side is the same broker as a template would make it:
  "PILAR SEGUROS" in capitals, a seven-item menu with a simulator, three
  identical insurance cards and the stock umbrella.
- The section heights are held the same in both languages (the long
  display lines are split by hand into two), so one pair of stops serves
  both; after a change to our side's copy, measure again and reset
  `--sbs-stop-1` to `--sbs-stop-3` on `.sbs-p-page` (desktop and narrow).
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

- Nothing open from the clinic version; Pilar settles both questions.
