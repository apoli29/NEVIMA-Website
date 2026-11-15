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
- 2026-11-15 (user, third round): sections 3 and 4 had repeated the
  hero's promise in other words, so each now has a job of its own. The
  hero says what Pilar is and the index what it insures; section 3 shows
  what the client actually gets, and section 4 how it works and what it
  costs (the usual objection to a broker).
  - Section 3, after Wise (its product working beside a heavy capitalised
    title): "Três propostas. Uma folha. Uma recomendação." beside a table
    of three quotes for a home policy, with "A escolha da Pilar" lit in
    Noite: the dearest of the three, and the reason under the price (the
    only one that covers earthquakes). Insurers are A, B, C and the
    prices are invented; no real insurer is named. The page's own note
    already says everything is invented, so no note inside the site.
  - Section 4, after Arweave (a wide-spaced title, plain text, numbered
    tabs with only the first lit): "Quatro passos. Nenhum custo para o
    cliente.", that Pilar is paid by the insurer the client chooses, and
    the four steps (conversation, table, signing, every year: a review
    before each renewal and, in a claim, Pilar makes the call).
  - Gone: the rain photograph, the pixel symbol and the pillar detail
    (Area17 and AiiD rounds). Only the hero photograph remains.
- The loop's stops on our side are read off the page: each section
  carries `data-stop`, and `useFit` in `side-by-side.tsx` sets
  `--sbs-stop-1..3` from their tops (never past the foot), because the
  two languages now differ in height. The CSS values are fallbacks.
- Type, chosen from Pilar's identity and not from any reference (user,
  2026-11-15, option A of three): Funnel Display for every display line
  (near-square counters and straight-cut terminals, the symbol's flat
  geometry), Plus Jakarta Sans (the brand's) for the rest, IBM Plex Mono
  for the small labels (not Geist Mono, which is nevima's own). Loaded in
  `side-by-side.tsx` only. Newsreader is gone.
- The loop now has four stops (one per section), on a 15s loop; the
  template side moves in three steps of its own to the same moments.
- Photograph, from Unsplash under its free licence (not Unsplash+),
  turned into Pilar's palette: the pillar by Alejandro Barba
  (unsplash.com/photos/elvAJVysX8w), its sky extended upward so the line
  sits in it. In `public/side-by-side/`. (The rain on glass by Rama
  Krushna Behera was used in earlier rounds and removed.)
- The template side is the same broker as a template would make it:
  "PILAR SEGUROS" in capitals, a seven-item menu with a simulator, three
  identical insurance cards and the stock umbrella.
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

## The service, under the comparison (2026-11-15)

- The user asked for three more sections under the two websites: what the
  service includes, the two design levels, and personalization ("Procura
  referências para cada secção e faz depois": the choices were delegated,
  and the recommended options below were taken). Built in
  `src/components/sbs-service.tsx`, styled under `.sbi-*`, `.sbl-*`,
  `.sbp-*` and `.sbx-*` at the foot of `globals.css`. Order on the page:
  the comparison (black), Included (white), Two levels (black),
  Personalization (white), then `WorkTogether` (black).
- References, all through Inspo (the Awwwards MCP's element corpus was
  empty): Linear's features page for Included, Lisovskiy's studio site
  for the scrambling letters, Typeform's home page for the prompt over a
  mosaic glow. Their colours are not taken; only the site's black and
  white, Satoshi and Geist Mono.
- Included: "What many charge extra for / is included here." / "O que
  muitos cobram à parte, / aqui está incluído." Ten things, each a raised
  square piece with a pixel pictogram in the middle of a wider field
  whose outer ring fades into the page (Linear's). The lit piece is
  black, lifted, crossed once by a sheen; its explanation stands beside
  the field, the name scrambling into place. It moves on by itself every
  5.2s while it is on screen and the pointer is not on it, and stops for
  good once a piece is chosen. A tablist: arrows, Home and End move
  between pieces.
- Every line in Included is already said elsewhere on the site (the
  about page's questions, the home page's comparison, the form):
  hosting, help with the domain, the free calls, basic SEO, the texts,
  the legal pages, the trademark, direct contact, support after launch,
  the free proposal. Nothing new is promised. Where the site already
  makes the claim about others, it is set under the explanation as
  "Elsewhere:" / "Noutros casos:" (hosting, SEO, direct contact); the
  domain carries what is paid directly instead.
- Two levels (the user had it on stand-by; built as recommended, as a
  visual comparison): "Two levels, / the same care." / "Dois níveis, / o
  mesmo cuidado." One plate with the same Pilar hero at both levels and a
  switch. Essential+ is a clean split that comes in once and holds still;
  Advanced puts the photograph across the page moving slowly, reveals
  the line line by line, builds the symbol piece by piece and lets a light
  follow the pointer. Each level's note is the form's own (questions.ts),
  with a line saying what the demo does. The plate alternates every 7s
  until the switch is touched. On a phone the plate stands between the
  words and the switch. The visual comparison stays (user, 2026-11-15:
  "Fica assim").
- Personalization: "This service is built, above all, / around
  personalization." / "Este serviço tem foco máximo / na
  personalização." A map of a website built from the form's own pages
  (plus Contact), chips to add and remove them, and a switch Website /
  Landing page: at the switch the branches fold into one page, joined
  edge to edge, and their addresses turn into anchors (/servicos becomes
  #servicos). A large line says how many pages it is ("Quatro
  páginas." … "Uma só página, com tudo."). On its own it shows a small
  website, a larger one, and the larger one folded, until the visitor
  takes over.
- The subsection: a client's doubts typed and cleared in a prompt over a
  mosaic glow, in the client's own voice (as the about page's questions
  are), then the answer and the proposal button. The user's "Não sabe o
  que escolher? Não se preocupe. Quando tivermos uma reunião, ajudamos a
  escolher." is recast so the reader is not addressed, after the form's
  own "Sem saber o que escolher? Não há problema": "Sem saber o que
  escolher? Não há problema. / Na reunião que marcamos, ajudamos a
  escolher."
- Every loop here holds still for anyone who asks for less motion, and
  the CSS loops (the slow photograph, the glow, the caret) are held off
  the screen through `offscreen-pause.tsx`.

## Open

- Nothing open from the clinic version; Pilar settles both questions.
