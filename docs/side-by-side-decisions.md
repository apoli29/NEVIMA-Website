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
- One loop, `--sbs-loop: 18s` (12s, then 15s, before the Pilar stepper), in CSS keyframes. Both sides are given
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
- 2026-11-16 (user, fourth round): two components the user brought,
  rebuilt in the page's own code and Pilar's colours rather than
  installed (the site has no shadcn, Radix or lucide, and the plate is a
  scaled demonstration page with its own type):
  - Section 1 gains a review strip across the foot of the hero, the whole
    width, short and transparent over the photograph (from a sliding
    testimonial component). It slides a lap a minute and holds under the
    pointer (user's choice, so it reads apart from the template's
    carousel). Six invented clients, as Pilar is: initials, town and kind
    of policy, never a face (user's choice).
  - Section 4 keeps its title and cost, and the four steps become a
    stepper (from a "stepper-04" component): count, a bar with the
    current step in Noite and the steps done in Névoa, the step names,
    the step itself, Back / Continue. While the plate holds on it, it
    walks itself from 1 to 4, read off the loop's progress through the
    Web Animations API; a click takes over until the page goes back to
    the top (user's choice). Its buttons are out of the tab order, the
    plate being hidden from assistive technology.
  - The loop is 18s and the stepper's stop is held longest, so the steps
    have time to be read; the marks in `PilarSteps` must stay inside that
    hold (see the footer entry below for the current values).
- 2026-11-16 (user): Pilar gets a footer, on Noite with a slight
  gradient. A first preview had the uppercase PILAR logotype across the
  foot and two glows; the user asked for no logo and a matter, less
  metallic gradient. It is now one wide, soft Grafite glow from the top
  left with a fine grain over it. On it: "Um mediador. Todas as
  seguradoras." (the old manifesto line, as a signature) with "Pedir
  simulação", the links (insurance, Pilar, office, contact), and a legal
  row with the complaints book. The loop has a fourth, short stop for
  each page's foot (84% to 94%); the stepper's hold is now 47% to 80%,
  marks 55%, 63%, 71%; the template moves in four steps of its own.
- The loop's stops on our side are read off the page: each section
  carries `data-stop`, and `useFit` in `side-by-side.tsx` sets
  `--sbs-stop-1..4` from their tops (never past the foot), because the
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

## The service, second pass (2026-11-15, user)

- The user found the first pass too round for the site ("muitos botões e
  elementos demasiado arredondados ... incoerente com a nossa identidade
  visual"). The site's rule, from the homepage and portfolio decisions:
  rectangles are square (the bar stopped being a pill), cells are ruled
  by hairlines with mono numbers, the look is a gallery's (prints on
  mats, wall labels, a hang); the only round shapes are the drops (the
  CTAs, the values). So everything in these three sections is square
  now: the switch is set as the bar's links are (hairline cells, mono
  numbers, a block of ink sliding under the chosen one), the plate, the
  card, the prompt and its key (the bar's white key with the arrow).
  Only Pilar's own pages inside the plate keep their round buttons,
  being another brand's. The drop CTA stays a drop.
- The code is now one file per section: `sbs-included.tsx`,
  `sbs-service.tsx` (two levels; it re-exports the other two),
  `sbs-personal.tsx`, and `sbs-shared.tsx` for what they share.
- Included, "less technology, more gallery curation, both at once": a
  gallery wall of ten small works, each a print in a thin frame on a
  white mat, the pictogram proofed on its construction grid (used cells
  filled, the rest marked with a point). One light, a beam from the top
  of the wall and a pool on it, moves from work to work in a single
  move; the lit work's frame turns ink and it hangs a little further
  out. Beside it, the wall label: a rule, "N.º" with a counter that turns
  over, the name scrambling into place, the text, and the "Elsewhere"
  line set as a provenance note under a hairline. The time, which the
  user found too plain, follows Pace Gallery (Inspo): ten hairlines, one
  per work, the passed ones in ink, the current one filling; Previous,
  Pause and Next as square keys that fill with ink from the left, as the
  bar's button does. Manual choices no longer stop the wall for good;
  Pause does, and the wall holds while it is pointed at or focused. Less
  motion: it starts paused. References: Pace Gallery and Terakawa Photo
  Office (Awwwards nominee) for the gallery's manners; Linear kept only
  for the scramble. A line beside the title: "Dez coisas que fazem parte
  do serviço de web design."
- Personalization, "a card that is animated, not interactive", holding
  the choice of website or landing page, the pages, and the skeleton
  forming; "an inversion instead of a loop": one card plays it all on
  one CSS clock of 12 s. The pages are ticked one by one (Home, Services,
  Team, Gallery, Contact; Prices, Testimonials and FAQ stay unticked, so
  a choice is seen), each adding a sheet to the skeleton and the count
  under the list ("Uma página." … "Cinco páginas."); then the switch
  moves to Landing page and the sheets draw together into one long page,
  framed, their addresses turned into anchors ("Uma só página, com
  tudo."). At the end a white sheet set to invert (mix-blend difference)
  wipes across the card, as the bar's button fills, and the same clock
  runs backwards in negative, taking the website apart; at its start
  the sheet wipes off and it runs forwards again. Every part is a CSS
  animation of the same length run back and forth (the inverting sheet
  one of twice that length), so nothing can drift; the keyframes are
  written once in `sbs-personal.tsx`. Under the card, the three steps it
  plays, numbered between rules after Terakawa, each lit while it
  happens. The title stands with the user's sentence set against it on
  the right. Less motion: the card shows where it ends.
- The subsection's background, "a similar vibe, more cohesive with the
  site": the mosaic glow became a field of small square points on a
  fine grid, each as bright and as large as the light on it; one light
  rests behind the prompt and two drift, never in step. After FURO's
  dot-matrix lettering and the speaker grille in Drams (Inspo), in the
  site's own pixels. A black veil sits behind the answer so the points
  never cross the words. Drawn at 30 frames a second, only while seen.

## Personalization, third pass (2026-11-16, user)

- The user: the card's grey ground and its Website / Landing page
  buttons (out of shape) were not the site's. The card is now on the
  page's own white, ruled by hairlines, and the switch is the shared one
  (`sbx-switch`, as the bar's cells), played rather than pressed.
- What it plays (user's order): the kinds of business the proposal form
  asks about (SECTORS) float about the card; two seconds later one is
  chosen (it fills with ink as the bar's button fills, takes a tick, the
  rest fall away, and it goes up to the corner); the switch settles on a
  website or a landing page; only then does the frame come in and the
  website put itself together as that kind of business usually has it.
  Three in turn: a restaurant (website: photograph, menu with prices,
  table booking), a clinic (landing page: split hero, three treatments,
  a band to book), an estate agent (website: a search, three houses with
  price and size). The businesses are invented (Maré, Alvor, Casa Norte).
  Titles and buttons are real words; the body is a doctor's hand (a
  generated scrawl drawn on) or empty lines, as the user asked.
- Between two businesses the inverting sheet crosses (kept from the
  second pass), so they alternate in positive and negative instead of
  looping. Driven by one small clock in React (phases float, pick,
  build, out), only while the card is seen; less motion shows the first
  website built.
- The three steps under the card now read: the business, website or
  landing page, the website; each lit while it happens.
- On a phone the board is 5:4 and shows eight businesses (the chosen
  ones always among them).
- The subsection (user): instead of the prompt over lit points, a
  drawing of a video call, as by hand (an SVG turbulence filter gives
  every stroke a tremor): António and Emanuel in one window, the client
  in the other, a dashed line between them. Each time one speaks, a
  cloud rises over them and the line fills from the speaker to the
  listener, who answers, and it fills back. Four lines, in the client's
  voice and ours: "Landing page ou website?" / "Quantos serviços há para
  mostrar?" / "Cinco, cada um com os seus preços." / "Então um website,
  com uma página para cada serviço." The answer and the proposal button
  (the dark drop, on white) sit under the drawing. No dark card: it is
  on the page's white, under a hairline.

## Fourth pass (2026-11-16, user)

- Personalization, "keep the scheme from before": the pages are ticked
  one by one and their sheets stand side by side, then fold into one
  long page; the floating businesses of the third pass are gone. What
  the user had asked for was the inside of each sheet: each page is now
  drawn as that page usually is, with real titles and buttons and the
  body in a doctor's hand (a scrawl written on as the sheet arrives) or
  empty lines: Home (bar, photograph with title and button, three
  pictures, a second block), Services (a mark, a name and a scrawl each,
  a button), Team (four portraits), Gallery (a wall of pictures),
  Contact (fields, a send button, a map with a square pin). Folded into
  a landing page, each becomes a section laid out wide (a container
  query on the sheet's own proportions), only the first keeping the bar.
  The invented business is Alvor, a dental clinic.
- The card is always black, in metal (the user): a brushed dark
  gradient, a highlight at its top edge and a light that crosses it now
  and then. No colour inversion any more; it plays forwards and then
  backwards instead of looping. The choices have no box round them: a
  tick, and the name lit. The sheets are paper-white on the black.
- The call (user: too much of a sketch; a tech company's motion
  graphics with the agency's touch; in a black card as at first): in
  the same black metal with a fine grid fading out, three square tiles
  (António, Emanuel, the client), a ticked line between them. Whoever
  speaks lights up, with a square ring leaving the tile and a level
  meter; their words are typed in a panel over them; the line fills from
  them to the listener, a square point of light running ahead. The
  answer and the light drop sit under a hairline inside the card.
- Included (user chose option A of three, "a smaller card, the same
  look"): two walls side by side, ours (the ten framed works, the light
  moving along them, interactive as before) and theirs (the same ten
  places, mostly a nail and a dashed outline; hosting and SEO hung in
  grey as "pago à parte"), smaller than the single wall was. Under them,
  our wall label and theirs ("Agências tradicionais": "Pago à parte",
  "Contacto indireto" or "Nem sempre incluído", and the site's own
  "Noutros casos" sentence where there is one), then the time. "Nem
  sempre incluído" is the wording wherever the site makes no claim of
  its own; a stronger one is the user's to decide.

## Fifth pass (2026-11-16, user)

- Personalization: two more businesses in the loop, from other sectors,
  after Alvor (a dental clinic): Maré, a restaurant (Home, Menu with
  prices, Bookings with date, time and people, Gallery, Contact) and
  Casa Norte, an estate agent (Home with a search, Homes with price and
  size, Sell in three steps, About, Contact). Each has its own eight
  options with five chosen. The business changes at the end of each way
  back, when the card is empty, and the same elements are kept, so the
  single clock is never broken. The pages are written as kinds
  (home, home-search, list, people, wall, form, homes, steps, about),
  each with its tall and its wide layout.
- The call: the answer above the drawing; under it the portfolio's own
  button (the light drop, words alone, no arrow), "Pedir proposta
  gratuita".
- Included: the walls swapped (theirs first, ours second, and the two
  labels under them in the same order), the names over the walls, and
  the grey walls replaced, both alike, by the black metal of the cards
  below; the lit work's frame turns white, their few hung works are
  dimmed.

## The comparison in grey (2026-11-16, user)

- The comparison, from its title down to the note under the two pages,
  is on one ground: the ground now sits on a wrapper round the header and
  the stage (`.sbs-top`), so there is no seam. A light grey was tried
  first; the user kept the area but wanted the stage's earlier colour
  back (#0b0b0b, the light from the top left, the grain), so the header
  is now white type on it too.
- The two plates are labelled "Designs from other professionals" /
  "Design de outros profissionais" and "Nevima's design" / "Design da
  Nevima" (user's words), in place of "Off-the-shelf template" and
  "nevima". The intro paragraph still speaks of a template; it is the
  user's to change.
- The cards' backgrounds (user: the black metal was too straight and
  square for a site whose own surfaces are gradients and curves); three
  were shown as prints and the user chose two: the walls of Included
  take C, a bent sheet of metal (graphite running to black, one wide
  curved band of light and the fold's edge); the personalization card
  and the call card take A, liquid light (soft blurred pools of light on
  black, drifting slowly, as the footer's light drifts). The fine grid
  on the call card went with it. Both are SVG embedded in the CSS.

## Open

- Nothing open from the clinic version; Pilar settles both questions.

## Sixth pass (2026-11-16, user): the other services

- Built first as a fifth section here and **moved out the same day**, at
  the user's word: each service's own page carries its own plate
  (`service-depth.tsx`, styled `.svd-*`), and the bar's new Services
  menu is the way to all of them. What follows describes the plate as
  it now stands on those pages.
- The three additional services and the one sold inside the web design,
  written from the studio's brief of 2026-11-11 (the WhatsApp text the
  user pasted).
- Shape: one plate per page (first built as four in sequence, "os
  quatro em sequência", the user's pick over an index with a way back).
  Each is a plate taken
  about 60% from a photographic landing page the user sent: the
  photograph with a rounded corner (18px, the bar's radius), the
  service's name laid in the dark at its foot, a white card that
  overlaps its edge carrying the first thing to say and the
  free-proposal button, and a row of three facts set as that page sets
  its figures. Its colour, type and glass are not taken: the
  photographs are the only colour, and everything on and under them is
  the site's black, white, Satoshi and Geist Mono.
- No figures anybody would have to invent: the row under each plate
  carries facts the site already states (Logo / Included, 30 km of Gaia
  / Travel included within), never a number.
- No price (the studio has set none, and the site has never shown one):
  in its place the same free-proposal button the rest of the page uses,
  which opens the form that works the estimate out (user, 2026-11-16).
- SEO and GEO: the studio's text arrived cut off mid-sentence, so the
  title line it gave ("O motor de busca só recomenda websites que
  comuniquem na sua língua") is kept and the body is the about page's
  own answer, already written in both languages (user's pick).
- Photographs, the user's picks from candidates put to him first, and
  served from Unsplash's CDN as the service cards already are, so
  nothing is downloaded into the repository: a red wax seal over old
  letters (Thalia Ruiz) for the visual identity, a watch movement in
  gold on black (Lukas Tennie) for the back end, a lighthouse at dusk
  over water (Evgeni Tcherkasski) for SEO and GEO, a lens head on in
  the dark (Yael Yañez) for the photo shoot. Each carries its credit
  in the corner.
- Still missing from the studio: the back end's tools, how they are
  interlinked, and the prices. The section says what the brief says and
  nothing more — no tool was named that the studio has not named.
- The bar's Services menu (user, 2026-11-16): a cell on the bar in
  place of the Side by side link, dropping a panel in the bar's own
  black with the side-by-side page and the four services that have a
  page. Read from `SERVICES`, so the menu cannot drift from the pages.
  It opens to the hand and to the keyboard, and closes on Escape, on a
  press outside and as focus leaves. Under the fold the bar has no
  links, so the same list is a second block inside the "Menu" panel.
  The service pages keep their own small header, so the menu is not on
  them; their way back is the "All services" button they already had.

## Seventh pass (2026-11-16, user), on the service pages

- The bar is not to change on the way into a service: the small black
  strip those pages carried (the mark and "All services") is gone and
  they carry `FloatingNav`, as every other page does. The Services menu
  is the way back out.
- The plate is set closer to the page the user sent: the photograph
  fills 16:9, the name is laid large over the dark at its foot, and the
  three facts are in a white card that comes over the photograph's foot
  on the right, where that page carries its figures. The lede moved out
  of its own card to under the plate, where it reads at length.
- The free-proposal button is the one the rest of the site presses (the
  black drop with its arrow, as the FAQ's), not the light drop it was
  given first. It sits inside the white card, where a black drop can be
  read; on the photograph it could not.
- The home page's comparison had gone white type on a light ground.
  Not this work: `.cmp-ground` was taken grey along with the
  side-by-side page's own ground in d72104d. Put back to its black.

## Eighth pass (2026-11-16, user): the photograph first

- "A primeira coisa que o utilizador vê é a imagem": the plate is now
  the page's hero, under the bar and before anything is read. Over it,
  at its foot: the kind of service in mono, the service's name as the
  page's `h1`, and under them the line the studio wrote. The facts card
  still comes over its foot on the right, with the free-proposal drop on
  its white.
- The description the service record carries follows the hero, then
  what it includes, then the parts. The lede each plate had became the
  first part, with a head of its own ("What this is for", "Why, even for
  the smallest business", "What SEO is"); the photo shoot's was dropped,
  since it only said again what its description says.
- The hero is 2.1:1 from 1100px, 16:9 from 640px and 4:5 on a phone, and
  clears the bar by no more than it must.
- The facts are not a card laid on the photograph but a bite taken out
  of it (user, 2026-11-16: "como se não tivesse lá algo por cima"): the
  page's own white, flush with the photograph's right and foot, rounded
  where it cuts in and matching the photograph's own curve where it
  leaves, with no border and no shadow. A pixel past the edge, so the
  curve it is cut into never shows along the join. Under 900px there is
  no room for it, and it simply follows the photograph.

## The comparison back to dark, the card's opening, a start in view (2026-11-17, user)

- The dark ground over the whole comparison, title included, and the bent-metal / liquid-light backgrounds had been built on 2026-11-16 but never merged, which is why the live page still showed the old look. They are merged now, with the plates' address bars removed (the address is kept in the markup for screen readers) and the plates a little taller to take that room.
- The personalization card's Website / Landing page switch now fills the side's width in two equal halves and can no longer run past the side's rule on narrower screens.
- The card opens with the areas a business can be in (clinic, restaurant, estate agent, law firm, gym…) floating at three depths on a plain gradient, without the card's patterns. The current business's area is chosen: it turns white and comes to the middle, the others blur away, and the pages are built as before. After one run there and back, the next business's area is chosen. The order is the card's three businesses: dental clinic, restaurant, estate agent.
- The card does nothing until it is at least 30% on screen, so the story is seen from its start; the call card already waited for 40% of itself.

- 2026-11-17 (user): the areas lost their boxes, plain words only (the chosen one brightens and grows a little), and they float closer to the middle of the card, still spread out.
