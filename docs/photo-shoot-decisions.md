# Photo shoot — decisions

The service's page (`/services/photo-shoot`, `/pt/servicos/sessao-fotografica`).
Its hero, facts and first three blocks come from `service-depth.tsx` (see
`docs/side-by-side-decisions.md`); the three sections under them are
`src/components/shoot-sections.tsx`, styled `.sht-*`.

## The brief (user, 2026-11-17)

Five sections were asked for: the before and after, what the session
includes, the packages and prices, the coverage area, and personalization.
Three were built. The other two wait on the studio:

- **Before and after.** It needs pairs of photographs of the same subject,
  one taken carelessly and one by us, and the studio has none. The user
  chose to wait for real pairs rather than stage them with stock
  (2026-11-17). Nothing is in the page until they exist.
- **Packages and prices.** The brief left them as "[inserir pacotes e
  preços]". No figure is invented here, and the user chose to leave the
  section out rather than show one half-filled.

## What was built

- **What the session includes.** Six rows, ruled off one another, each
  with what it is and what it means: the free briefing meeting, art
  direction, the session itself, editing and retouching, delivery in an
  online gallery, and the right to use the photographs. The section's
  title holds still beside them while they go by (`position: sticky`,
  not a scroll library). "Limpa mas compacta", as asked: every
  explanation is read at once, none is hidden behind a click.
- **Where we work.** A map drawn here, not fetched from a map service.
  Mainland Portugal is plotted from real coordinates into kilometres
  (`x = (lon + 9.62) x 85.6`, `y = (42.25 - lat) x 111`), so the thirty
  kilometres around Vila Nova de Gaia are thirty real kilometres against
  the rest of the country, not a ring drawn to look right. The near zone
  is clipped to the land so it never swims out to sea. Two legend rows,
  and pointing at one lights its zone. Above 30 km the page says what
  the form and the price already say — "cobrada ao km, como fica
  definido na proposta" — because the studio has set no rate (user's
  pick, 2026-11-17).
- **Personalization.** Four dials — what is photographed, where, in what
  style, how many — whose words change in place on one clock every
  2.6s while the section is on screen, so the section is read rather
  than waded through. The quantities are qualitative ("poucas e
  certeiras", "uma série", "um catálogo inteiro") because the packages
  that would give numbers are not decided. Under them, the studio's own
  line: "Sem saber o que escolher? Na reunião, ajudamos a definir a
  sessão ideal."

## References

Found through Inspo (the user asked for it) and turned into the site's
own black, white, Satoshi and Geist Mono: UAL and Ferrari for a title
laid straight on the page with no card under it, and Modern Treasury's
and Unkey's node diagrams for the map. None of their colour, type or
glass was taken.

## Second pass (2026-11-17, user): its own page, and room for the photographs

- The page is no longer set from the services' template. It is its own
  (`photo-shoot.tsx`), the way SEO & GEO's is: the plate at its head,
  then one `ToneRoom` whose sections turn from light to dark under the
  tonal veil, headings arriving on the site's own `SlideIn`, and the
  free-proposal drop the whole site presses. The template's grey "Get in
  touch" button and "Back to nevima" link went with it; the bar and
  "Let's work together" are the way on, as everywhere else.
- **An opening**, after the plate: what a session is worth to a brand,
  in two paragraphs, not a wall.
- **A line at the head of every section**, one or two sentences, so the
  reading is led rather than dropped into.
- **The comparison is built** (section 1 of the brief), with places for
  the photographs rather than photographs: three pairs — a product
  (1:1), the team (4:5), the place (3:2) — each on the slider the
  project reports already carry (`BeforeAfter`, project-report.tsx,
  exported for this), so the interaction is the same thing in both
  places. A side whose file is missing says what belongs in it and holds
  its shape; dropping the file in is the whole of the work. The files
  are named in `public/photo-shoot/README.md`.
- **The packages are built** (section 3), as three cards with the middle
  one inverted, each with the four things that tell them apart:
  photographs delivered, how long the session runs, how many places, and
  the delivery time. Every value reads `[a preencher]`, the site's own
  mark for what the studio has not given (TO_FILL), and a line under
  them says so. No price is invented.
- References through Inspo for this pass: Works Studio (three examples
  read side by side with their captions under them) and Luma's pricing
  (three plain cards, the middle one inverted). Nothing of their colour
  or type was taken.
