# Homepage decision log

What was decided for each part of the homepage, and why. Newest notes sit lower in each list; when two notes disagree, the later one wins. Read the part about a section before changing it.

The Nevima homepage is two screens. Screen one is black with the white wordmark centred.
The first scroll gesture sends the mark flying to the exact slot it occupies in the
floating bar; the bar fades in around it while everything is still black; then the black
lifts off the second screen, which is the WebGPU shard field (`AeroShards`) carrying the
English value proposition. Everything that existed before (Portuguese hero, services,
method, work, pricing, founders, FAQ, contact) was taken off the page on 2026-09-11.

**Why:** The user is rebuilding section by section and wanted a clean slate for the
opening. It has been through three versions: a scroll-scrubbed dissolve, a shard
shatter, and on 2026-09-13 the current single flight, which the user asked for after
rejecting the shatter.

**How to apply:**
- The nav is a black floating bar holding the **white** wordmark, so the mark never
  changes colour. The user briefly asked for a white-to-black fade and then withdrew it
  once the bar was settled as black. Do not reintroduce it. On 2026-09-14 the user made the
  bar square (it was a pill; the Get in touch button was squared with it), the link labels
  full white, and the hover boomerang 24px.
- Opening timing (2026-09-14): the nav links fade in on the curtain's range, together with
  the page, while the bar itself comes in earlier black-on-black under the landed mark (the
  user saw the buttons appearing before the page). The second screen's reveal was made 35%
  faster by scaling the field/curtain/words ranges about the curtain start, keeping the flight
  and the reveal's start time unchanged; the ranges are written in ms via `span()`.
- Hovering any nav item throws the `BoomerangMark` across it, left edge to right edge,
  clipped so it never claims space the item does not already have.
- Scrolling is weighted with Lenis (`src/components/smooth-scroll.ts`), and the hook owns
  the lock: `useSmoothScroll(locked)`. Do not move `stop()`/`start()` back into callers.
  The instance is rebuilt once after mount, so a stop made from outside is silently lost
  and the gesture that triggered the opening lands as a scroll jump on release.
- The old section components still sit in `src/components/` unused. They were deliberately
  not deleted; ask before removing them.
- The navbar and footer labels (Work / Services / Studio / Get in touch) are placeholders
  the user asked for as temporary scaffolding. Do not treat them as settled IA.
- Site copy is English. On 2026-09-18 `lang` was set to `en` (user said "corrige tudo" to an
  a11y audit listing it); the `layout.tsx` metadata/OG text is still Portuguese and untranslated.
- `AeroShards.jsx` is vendored third-party code with a prop configuration the user supplied
  verbatim. Do not edit the component or change those prop values. The user sometimes
  renames these files mid-session; if the dev server cannot resolve `AeroShards.css`,
  check the filenames before assuming a real break.
- Brand assets live in `nevima.identity/`; the cropped wordmarks served to the page are
  `public/nevima-wordmark.svg` (black) and `public/nevima-wordmark-white.svg` (white). They are
  the identity SVGs with only the root tag swapped for a cropped `viewBox="222 591 1103 243"`.
  On 2026-09-14 the identity logo changed (larger, higher ™, so the crop widened from 1079);
  if the identity files change again, regenerate the same way and update `aspect-[1103/243]`
  on the hero slot in home.tsx. `wordmark.tsx` holds an old inline copy, used only by the
  unused `site-chrome.tsx`.
- See "The opening" in CLAUDE.md for how the opening is driven.
- On 2026-09-14 a services section (`src/components/services.tsx`, `#services`) was added
  after the opening: four black cards (Web Design, Visual Identity, SEO, GEO) that split
  into a left column plus one large open card on click (lg and up; below lg the card opens
  in place). The user asked for only a *slight* delay before the move, not a full second,
  and a 1.5s left-to-right, line-by-line light over the description. Visual Identity is sold
  only as a bundle with Web Design. Card photos started hotlinked from Unsplash pending the
  user's OK to download them locally. Copy and image rules: see CLAUDE.md.
- On 2026-09-14 a studio section (`src/components/studio.tsx`, `#studio`) went in between
  the opening and services, which the user now counts as sections 3 and 4. No visible title.
  The statement and pillar sit on the page in ink (the user had their card removed),
  justified; the statement is two thirds of the shell wide from the left. Since 2026-09-14
  the pillar stands beside it from lg, top-aligned, in a 26.4cqw column flush with the shell's
  right edge (shrunk 20% from the full third, then grown 10%; width and type move together
  so the 5-line justified setting holds), sized 6.1cqi of its column; stacked below lg.
  The user checks the top alignment to the pixel and rejected two attempts (box tops + em
  margin). A fixed em margin cannot work: Chrome rounds each font's ascent/descent to whole
  px, so a baseline's place in its box drifts up to ~1px per width. Final method: flex
  `align-items: first baseline`, then the pillar raised with `position: relative; top:
  round(-0.6281em, 1px)`. The user's target is the pillar's top level with the top of the "g"
  in "young" (end of the statement's first line), not with the capitals: g top 0.52em vs the
  pillar first line's highest ink 0.73em, lit stroke included (glyph heights read by
  pixel-scanning a 2000px canvas; canvas measureText bounds are quantized and misled earlier
  work). Recompute if sizes, ratio (2.54098), stroke or either first line change.
- Also 2026-09-14: the founders are now two separate black cards (one portrait each), apart
  by 25% of a portrait's width and centred as a pair; portraits keep their old size from lg
  and shrink to fit below. Choosing one removes the other card and widens the chosen card
  with the words, centred. This replaced the single two-portrait card described below. The statement is 50px at full shell
  width, set in the service copy's bold with a tight 0.99 leading. The user tried a
  right-hung block with the last line flush right and reverted it to the left.
  The founders card is centred, half the shell wide when closed. Clicking a portrait
  (Emanuel left, António right, both 9:16) removes the other one and widens the card evenly
  by one column for that founder's text. The user approved widening over keeping the text
  in the portrait's slot, then asked for less side padding, so the card grows only by what
  the words need. Everything copies the service card
  (surface, boomerang toggle, lit justified copy), and `Illuminated`, `Toggle`,
  `useHeldChoice` and the timings are exported from `services.tsx` for it. The user
  supplied the copy in Portuguese and chose an English translation. Emanuel's photo is a
  low-res landscape frame cropped to 9:16, used only until the user has a better one.
- The statement's size is proportional to its own measure (`cqi`, see `.std-statement` in
  globals.css) because justified type at a viewport-based size opened wide gaps. The ratios
  come from measuring the slack per line; do not swap them back for a `vw` clamp.
- On 2026-09-14 a comparison section (`src/components/comparison.tsx`, `#comparison`) went in
  after services as the last section for now: "The perks of working with us instead of a big
  agency?" (Light) / "Here's the honest comparison." (Medium). The user chose the whole table
  inside one black service-card surface over a black Nevima column on white or a toggle; the
  Nevima column is a raised panel a tone lighter, and the row rules stop at its edge. Nevima
  answers are lit row by row as each row is seen (queued so they descend), agency text stays
  grey. The copy is the user's Portuguese table translated to US English and approved verbatim,
  including the harsh claims about agencies (they declined softening). The user does not want
  the table's format to change between devices: it is the same three-column table everywhere,
  sliding sideways inside the card where it does not fit, with the criterion column pinned
  (their pick over squeezing the columns). Column widths come from the card width, not breakpoints. The bold lead of each
  answer is rendered via an optional `lead` prop added to the shared `Illuminated`. Services
  lost its foot padding so the comparison brings the head room.
- On 2026-09-18 the footer's goo trail was replaced by `LiquidLens`
  (`src/components/liquid-lens.tsx`), modelled on the FUEL Framer template's hero. The lens is
  a WebGL drop that follows the mouse over the *whole* footer: the backdrop and the full-white
  wordmark are magnified, swirled and pulled into a seam rim. The words are only magnified, so
  they stay readable; the user made readability a condition. The drop shrinks smoothly to
  nothing near any footer edge. The backdrop (the user's pick after a V7 Labs reference) is
  black with glossy white light pools, heavily deformed, drifting slowly, with the nearest
  shying from the cursor; both shaders share one GLSL backdrop function so the lens refracts
  it exactly. The mark rises slightly into place on scroll. `goo-trail.tsx` and its CSS are
  unused but kept.
- Footer a11y pass, 2026-09-18: the floating bar slides up (and goes `inert`) once the footer
  reaches it, because on short/narrow screens it covered the email at max scroll. The backdrop
  light is dimmed behind `[data-calm]` text boxes (shader `calm()`), for contrast. The footer
  has "Copy" (email) and "Pause motion" buttons (remembered in localStorage). The lens copy of
  the words now draws live hover colour, underline and focus ring; canvases must only be
  resized via `fit()` — resetting them on every `transitionend` was the hover flicker the user
  reported. The footer is also on `/services/[slug]`. "Work" still points at a missing `#work`.
- On 2026-09-18 the shard field was taken off the second screen (AeroShards stays in the repo,
  unused) and replaced by `PixelField` (`src/components/pixel-field.tsx`), from a user sketch:
  white ground; the brand boomerang huge on the right, elbow pointing left and arms off the
  top/bottom of the right edge, built of grid pixels; pixels continuously fly current→mark
  (landing on the grid) and mark→current. Revised the same day on user feedback: the mark is
  tipped (not "certinha"), with its inner notch kept on screen so it reads as the mark; the
  current is a curl flow field over the *whole* screen with curvy pixel lines (the user wants
  it balanced everywhere, irregular and "artistic, not pragmatic"), and flights cross the screen.
  Then no piece may be square: every piece is an organic curvy shape from families (pebble,
  capsule, bean, drop, crescent, wavy, lopsided), area-normalised so mark pieces and loose
  pieces share one scale; the far side of the screen must feed the mark as much as the near
  side. Latest: the mark is its exact vector silhouette, solid black, with a perfect outline
  (the user rejected a fringe of pieces past the edge as too irregular). Pieces leave only
  from well inside it, as holes of their own shape that close within 0.8s (the user wanted
  the mark ~80% fuller than when holes waited for a replacement); arrivals sink into the
  black. Every piece is long and thin (stretch ~2-3.3); fewer loose pieces.
  Hard rule from the user: modern pixel, never retro/CRT (no scanlines, glow, stepping motion).
  No mouse reaction for now. Tall screens: mark points up along the bottom (user said adapt as
  best as possible).
- 2026-09-18 (later): PixelField was replaced on the second screen by `JellyField`
  (`src/components/jelly-field.tsx`, WebGL2; pixel-field.tsx kept unused). White ground, black
  glossy 3D drops wandering, the boomerang in its old pose as black glass with softened edges,
  drawn as its own layer over the drops so its outline stays intact (user: "boomerang intacto").
  A jelly slab covers the whole screen (ambient swell + CPU spring grid); a moving pointer presses
  an elastic dent that wobbles back (user picked this over ripples). Text stays sharp above it.
  User asked that drops still pass behind the copy but smaller: they shrink near
  `[data-jelly-quiet]` text. The old white wash under the copy was removed.
  Revised same day: 13 drops (9 small screens), each a body + 2 drifting lobes (irregular,
  seeded so they are the same every visit); pointer dent halved (PRESS 2600); the boomerang
  drags itself in from off the right edge to its usual place as the field comes up (props
  `arrive`/`arriveDelay` from home.tsx), with a smear tail and a shove into the jelly.
  Then the user reversed the drop rule: drops must NEVER be behind the copy, spread in a
  balanced way around it (best-candidate bases outside the text box and the mark, wander +
  hard push-out). The user loved the PC look and wanted it kept on other devices: the mark has
  ONE pose everywhere (the old "tall" pose pointing up is gone); below 23/20 aspect
  (`upright` custom variant in globals.css) the mark lies bottom-right and the copy sits high.
  `.h1` also caps at 10.5svh for phones on their side.
  Later: 10 drops (6 small screens), more scattered (no edge-alignment, jitter). Subtitle is
  two sentences on two lines, leading 1.3. Beside it (from 80rem and wide = `broad` variant;
  below it elsewhere) a black mini bar "About us"(#studio) / "Our services"(#services) /
  "Pricing"(#pricing, no target yet — user's choice) with glowing white text (`.text-glow`).
  Then: subtitle +20% (clamp 1.35–1.65rem), second sentence font-medium. The mini bar must
  END flush with the headline's right edge (w-fit headline box, row w-0 min-w-full) AND stay
  BESIDE the subtitle (user rejected it under). The nav is flex-auto (fills to the headline
  edge, justify-between, boomerangs in the gaps); subtitle and nav type scale with
  min(vw, svh) like `.h1`, so it fits beside at 1280x720…1920x1080; it only wraps on
  tablet/phone.
- Studio: under the PILLAR (the user calls the statement "H1" and the pillar "H2") a black bar
  "Learn more" (plain text) holding a silver btn-neu "about us" (#about, no target yet).
  Toggles in founders + services cards blink (`[data-beckon]` on the group, CSS `svc-beckon`:
  one slow, intense flash — fills white with glow, holds — every 3.2s; the user tried a
  double flash, called the look "perfeito", then asked for a single one) until a card in
  that group is opened. Mini-nav text was then cut 20% and its boomerangs grown 20% and
  turned 180° (elbow up); the Learn-more bar was made smaller and its gap to the pillar halved.
  Then: headline→subtitle gap halved (mt 18/24px), mini-nav text +20% back up (15px at
  1440) with more side padding in the bar; still beside and flush at 1280–1920.
- Jelly on the second screen made much stronger (user: must look like clear jelly over the
  whole section, same level everywhere; pointer strength NOT raised): the old 3-sine swell
  was replaced by `wobble()` — 7 standing waves in evenly spread directions, λ 300–540px,
  each swinging on its own clock, analytic slope, WOBBLE=12 (~24px average bend); shading
  on white raised to 0.6, sheen stronger. Tune WOBBLE if the user wants more/less.
- Footer light: 7 pools. On wide footers (aspect > 1.3) three are HELD (small wander,
  `HELD_REACH`) in zones the user circled on a screenshot: left margin beside the address,
  the gap between address and menu just above the mark, right margin beside the services
  (derived from the calm boxes + mark top). The rest are best-candidate. Keep it soft.
- Second screen is now WATER, not jelly (user's aesthetic change): wave-equation springs
  (REST 6, COUPLE 1100, fixed STEP_S 1/120 with catch-up cap + NaN/overflow reset — the old
  frame-sized step blew up below ~40fps and turned the section black), a travelling 8-wave
  `swell()` whose curvature draws pool-floor caustics on the white (CAUSTIC, clamp 0.11).
  A CLICK drops a water drop that rings out; a moving mouse leaves a wake (touches along its
  path, depth ∝ speed; later halved again to WAKE_DEPTH 1.75). Drop layout on WIDE
  screens is now a hand-set table, `WIDE_LAYOUT` (drop index + [x,y] as shares of the
  screen), taken from the user's marked-up screenshots at ~1920x949 — the worked-out
  best-candidate layout shifted with every few px of height, so art-directed tweaks never
  held. Edit that table for future "move this drop" requests. Keeping-clear still applies:
  edges (per-drop `EXTENT`, capped at 1.9×r, + EDGE_MARGIN 16 + MIN_ROAM), the mark
  (MARK_MARGIN 56, nearest clear spot), and the floating bar (no drop under it; measured
  from `header .shell > div`). Upright screens still use the worked-out layout. Later all
  drops were shrunk (DROP_SIZE 0.83) and the WIDE_LAYOUT staggered so no two share a line
  (user: "alinhadas demais"). Upright screens split a big drop (r > 0.07) right of the elbow into
  two at √(0.75/2) radius (together 25% smaller), set well apart. Drops roam, so a
  screenshot never matches the bases pixel for pixel. The user then asked for it gentler: DROP_DEPTH 9, WAKE_DEPTH 3.5 at
  WAKE_SPEED 800px/s; drops slower still (DROP_PACE 0.18) and roaming wider round their
  bases (wander = min(room·0.45, side·0.12)), still pushed out of the copy box. Drops are bent at DROP_BEND 0.45 and the mark at MARK_BEND 0.18 so the mark
  keeps its shape; drops' own motion runs at DROP_PACE 0.3 (user: much slower, smoother).
- The browser's own scrollbar is hidden site-wide (`scrollbar-width: none` + webkit) — the
  user disliked the black-then-white gutter; this replaced `scrollbar-gutter: stable`. The
  scrollbar appearing when the opening released the page narrowed it 15px mid-arrival,
  shifting the copy and re-sizing the jelly field — the "glitch" the user reported. The
  other half: drops were re-laid out every time the measured text box grew (rotating line,
  the 30px rise, fonts), so two drops visibly swapped places. Now `[data-jelly-quiet]` is the
  w-fit copy box, measured with the rise removed, no periodic re-measure; layout runs once
  (verified: 1 before the opening, 0 after). A re-layout (resize) keeps each drop on its
  nearest new base and glides there.
- Comparison heading: "Here's the honest comparison." gets the pillar's black marker in a
  loop (`MarkedLine` + `.cmp-marked`, CSS `cmp-marker`): 0.6s draw L→R, 5s held, 0.6s back
  R→L, 5s off, starting when seen. The user calls this marker "sublinhado".
- Services heading is now `RewriteTitle` (rewrite-title.tsx): "We only do websites" → strike
  "only" → close up → "way more than" opens in → "We do way more than websites", once.
- Founders close no longer gets cut: the pair's wrapper height is animated with MORPH so the
  services section follows the shrinking card. Footer light pools are now based by
  best-candidate away from the words (calm boxes measured from text nodes, not blocks).
- 2026-10-02: titles moved from Raleway to **Satoshi** (user's "manual v2"), self-hosted at
  `fonts/Satoshi/Satoshi-Variable.woff2` (Fontshare, ITF FFL licence alongside), site-wide via
  `--f-title`. The user kept the English H1 copy, not the manual's Portuguese sample. `.h1`
  follows the manual: `--h1-size` clamp(2rem, min(7.5vw, 11svh), 5.75rem), tracking −0.035em,
  second line indented by `.h1-step` (clamp(0px, 10vw − 40px, 160px)). Satoshi is narrower, so
  the links bar no longer fit beside the subtitle; the user chose to shrink subtitle + bar
  (not move the bar under, not exceed 92px): from 80rem they are sized from the headline
  (`--h1-lede`, `--h1-link` in globals.css, linear fits measured off the fonts). Phones' bar
  was tightened to stay flush with the 281px headline at 375px.
- 2026-10-02 (later): second screen redone as a **gallery wall** (user: "curadoria de agência
  criativa / galeria com toque tech"; non-negotiable: the drops and every water effect stay,
  positions may change; boomerang removed). Copy lives in `statement-screen.tsx`: mono readouts
  on top (Studio, Based in Porto + coords, live Lisbon clock, ● Open for projects — the user
  approved Porto and "open"; no founding year), two hairlines with + crosses at column lines,
  an "Exhibit 01 / Water, 2026" museum label top-right, headline + subtitle bottom-left, and a
  numbered index (About us / Our services / Pricing) bottom-right that inks over on hover. The
  black mini bar and its boomerangs are gone, so the old "bar flush with headline" sizing
  (`--h1-lede/--h1-link`) was removed. Mono face: Geist Mono (`--font-mono`, `.mono-label`).
  JellyField has no mark now: drops land one by one with a ripple on arrival (replacing the
  mark's drag-in), keep clear of each `[data-jelly-quiet]` box separately, and only exit
  toward on-screen water. WIDE_LAYOUT was re-hung for this composition.
- Revised same day on user feedback: Exhibit label removed; headline top-left and subtitle
  top-right (right-aligned, wraps under the headline when no room); index bottom-right with
  **Pricing first and kept lit** (black row, green live dot, looping arrow + gleam — user's
  pick over a sequential sweep); readouts moved to a full-width row at the very foot, under
  the index. Navbar: square corners (user), links as hairline-ruled cells with mono numbers,
  CTA a flat white square block (`.nav-cta`) instead of the silver btn-neu (btn-neu stays
  elsewhere). `html` now has `overflow-x: clip` (phones were laid out 427px wide).
- Third pass same day: headline flush left (no second-line indent), max 80px
  (`--h1-size` clamp(2rem, min(6.6vw, 9.6svh), 5rem)); headline and subtitle tops aligned
  via `.trim-cap` (text-box trim to cap height); the rule under the subtitle removed (only
  the one over the readouts remains); navbar thicker (py-3.5 / md:py-[1.125rem]).
  Drops are no longer hand-set: the user's rule is "the section is a square with H1 top-left,
  H2 top-right, index bottom-right — drops spread evenly through the empty space". Layout is
  a deterministic max-min-gap placement (grid search, biggest first, then hill-climb), with
  roaming capped at half the gap to the nearest neighbour. 11 drops on wide, 6 on phones.
- Main CTAs (nav "Get in touch", services "Explore …") are now `.cta-drop` buttons: glass like
  the drops (black; white `.cta-drop-light` on the bar), irregular outline that morphs slowly,
  body + highlight fading in a loop (text never fades). User insisted they be **chunky**: ends
  must stay round and match the type's weight, so radii are in `em`, never %, padding
  0.95em/1.6em, weight 500. The studio's "about us" btn-neu was left as is. The user then
  found them too regular: the glass is now a pseudo-element layer reaching past the box
  asymmetrically, with very different em corner radii morphing (`drop-shape`) and a slow
  tilt (`drop-tilt`); Pass clips its boomerang on its own layer (`rounded-[inherit]`), not
  on the button, so the glass is not cut. The user liked the shape but not the flashing
  white highlight inside: the `::after` highlight layer and its gleam loop were removed;
  only the body's gentle breathing fade remains. Don't reintroduce an inner highlight.
  The studio's "about us" (section 3, in the black "Learn more" bar) is now a white drop too,
  and the bar around it is itself a black drop (`.cta-drop.drop-shell`: no hover swell,
  glass offset in time so the two drops never morph in step). Then the user removed the
  white inner drop: "about us →" is now plain white text inside the black drop.
- Headline endings end with a full stop ("matter." etc.). The rotating ending's mask is
  1.4em tall with -0.24em margin (Satoshi's "g" was being cut at 1.16em); entering line
  starts at y 125%. A page-wide clip check found no other cut glyphs.
- 2026-10-03: no boomerang pass on any CTA (Pass is now a plain link; nav links get an
  underline draw + faint cell lift, `.nav-link`). New logo = the "n" (files from the identity
  delivery, cleaned of metadata, in public/brand/nevima-n-*.svg); used as the favicon
  (src/app/icon.svg) and as the services toggle mark, which spins a full 360° per click and
  rests upright (user asked). The user chose NOT to replace the wordmark in nav/opening/footer.
  Pointer on the water: `HAND = 0.32` (60% less, then 80% of that). Opening: only the logo
  flight was retimed several times; the user's real wish was a faster *reaction*, not a faster
  flight. Now: flight starts 102ms after the gesture (0ms felt abrupt; user asked 50%
  slower), lasts 1278ms (2026-10-03: user asked 25% faster, then 15% slower than that), ease cubicBezier(0.4,0,0.25,1). The bar now fades in during the
  flight's end (black on black) and the curtain starts lifting 200ms after the mark lands
  (user found ~680ms of held black too long; tried 0, then 100, settled on 200). RUN_MS 2242. A left click anywhere on the black also fires the opening (user chose anywhere over arrow-only), and a thin white chevron bobs at the bottom centre as a scroll cue, fading in 0.6s after load and out as the run starts (user picked it over a drawn line or "Scroll" + arrow). Founder rows no longer show "(01)/(02)" before "Co-founder".
  Phones: the subtitle carries `data-jelly-wide`; below 768px drops keep WARP_PAD (32px)
  more from it (shader warp ~23px + refraction), applied after the spread so no other drop
  moves. Note the same warp can let a drop graze the H1 at tablet widths (not fixed; user
  only asked for the H2).
- Subtitle alignment rule (user): every section's side subtitle has the top of its first
  line's ink level with the top of the LAST LETTER of the title's first line (section 2: "t"
  of "that"; services/co-founders: the "s"). Done by `useInkAlign` (src/components/
  ink-align.ts): ink tops pixel-scanned on a canvas, baselines read with a zero-size marker
  prepended to the letter's element (Range rects gave baselines ~3.6px off in tight-leaded
  titles), subtitle moved with `style.translate`; only when beside the title. Verified ≤0.5px
  at 1440x900 and 1280x720. Headers now `lg:items-start`.
- Heading counts removed site-wide (services "(04)", co-founders "(02)"; the `Count`
  component and `.xs-count` are deleted) and the index's "(03)" is gone. User: no numbers
  on titles.
- Index refinements: no numbers on the left, all index rules and the rule over the readouts
  solid black (no + crosses), "Index" in mono white on a black marker (`.idx-title`).
  Founder bios justified everywhere with extra right padding. Pointer effects on the water
  cut 60% (`HAND = 0.4` on click drop and wake depth).
- Same day: services = "índice com montra" (user's pick): sticky framed photo with mono
  caption on the left (shows hovered, else open service; cycles its 3 photos while open),
  four names in one aligned column on the right at ~54px with number + mono line; the
  staircase indents, cursor fan and photo cluster are gone. Co-founders = one shared row grid
  for both (portrait 3 cols, name 3, profile 4, skills 2, all under mono labels on one line),
  no more mirroring; bios ragged (`.xs-ragged`).
- When the user says "secção 2" they mean the shard-field screen ("We build websites that
  create trust"), not the studio section. On 2026-09-18 they wanted it to feel more like a
  design studio (refs: ZINVE Studio, fabrica® Studio: visible column grid, giant two-tone
  wordmark, corner person-card, service index with arrows, + crosshairs) but chose to make
  no aesthetic changes yet.
- Any Motion `layout` element below the opening must carry `layoutDependency`. When the
  opening finishes, the stage goes from `fixed` back into the flow and everything under it
  jumps ~100svh down the document; without a dependency Motion animates that jump, and the
  services cards flew visibly across the second screen (reported by the user 2026-09-14).
- 2026-09-19: phones (shorter side < 600, `SMALL`) get drops 10% bigger (`SMALL_GROW`) and
  spaced 1.2x (`SMALL_SPREAD`) — user asked only for that, declined a hand-set upright layout,
  a smaller mark or drops nearer the words. Only ~3 of the 6 fit beside the mark at 375x812.
  Founders cards below lg: name+role beside the portrait, role baseline flush with the
  portrait's foot (`text-box: trim-end`); bio ragged-left below lg. An open founder card closes
  itself once wholly off screen (IntersectionObserver + `close` from `useHeldChoice`); native
  scroll anchoring keeps the view still as it shrinks above.
- 2026-09-19: the opening's curtain (opacity 0 after the run) was still catching the pointer,
  so the second screen's section links got no hover/click. It now has pointer-events none once
  `phase === "open"`. Those links (`.sec-link`) also show a faint white key (bg white/9%) and a
  stronger glow while hovered, plus a hairline drawn L→R under the word. They do NOT use the boomerang pass (user: the separators are already boomerangs; wanted something different).
- 2026-10-05: comparison table brought in line with the gallery look the site now has. The user kept the colours (near-black card, raised Nevima panel, grey agency text, lit answers) and declined moving it onto white. Changed: square corners (card and panel, `--cmp-radius` 0), column heads in `.mono-label`, the pointer-following light removed (`followPointer` and the `.cmp-card .svc-spot` rule are gone).
- 2026-10-05: every `.cta-drop` now has the about page's joined-drops outline (see `docs/about-decisions.md`, "CTAs, site-wide"). The studio's "Learn more about us" is one `.cta-drop` link; the black `drop-shell` around a plain "Learn more" and a heavier "about us" link is gone (the user flagged the double gap and mixed weights).
- 2026-10-05: the second screen's index has a 4th, last row: "Get your free proposal" (user's pick; it promises a free proposal, so keep that true). Its cue, kept apart from Pricing's, is a typed line with a blinking text cursor (`Typed`, `.idx-caret`), retyped every ~6s, and a plus instead of an arrow. Pressing it turns the index into `ProposalForm` (`src/components/proposal-form.tsx`), built from the index's parts at the index's proportions (user asked): the label marker, hairline rows, the focused row inked like a hovered index row, square chips, and an inked "Send request" row. Fields (user: between minimal and compact): name, email, needs (Web Design / Visual Identity / SEO / GEO), a short message. No backend yet (user: only the form for now): sending opens the visitor's email app addressed to ola@nevima.pt with everything filled in, and the form says so. Close or Esc goes back. The index and the (always mounted, hidden) form share one grid cell, so the `[data-jelly-quiet]` box is the form's height from the first paint: the drops are laid out clear of it once and do not move when it opens. (A first version re-laid the drops on open/close; the user saw the water glitch and the drops spin and stop, and said they must stay intact.) The gateway no longer takes Space/arrow keys typed inside inputs.
- The "Get your free proposal" row is inked like Pricing (user), with its own call: a light passing over it and a very slight swell on one 4.4s clock, out of step with Pricing's gleam (`.idx-ask`). Later the user dropped the typing animation (static words now; `Typed` and `.idx-caret` are gone) and found the swell blurred the words: only the black (`::before`) and the light (`::after`) are scaled now, never the row, so the text stays sharp.
- Index entrance (user: on arrival it showed a lone "INDEX" label over bare rules): rows no longer carry borders; each row's rule is its own element drawn in from the left (`IndexRule`), then its content comes in, top to bottom; the label is uncovered first and a closing rule is drawn last (`ENTRY` timings, after the screen settles). The hidden form is wholly transparent while closed (its foot rule used to show).
- 2026-10-06: the user asked for one or two more drops over the index, every other drop left where it was. The room above the index is the form's (its `[data-jelly-quiet]` box is the form's height), so the user chose to keep the drop there and give the open form a frosted pane (`.prop-pane`: white at 80%, 28px backdrop blur, hairline, soft shadow, standing 24px out round the form like a mat: "fosco, glassmorphism suave, curadoria criativa e de galeria"). In `jelly-field.tsx` the nav carries `data-jelly-perch`; after the usual 11 (6 on phones) are laid out untouched, `PERCHED` drops are set in the block's room above the index, wholly inside the block (`PERCH_INSET`), so the pane always covers them. One, not two: the next drop is too big to fit there, and two would sit level side by side. Phones have no room for it, so none there. The form's field labels are now in the subtitle's second-line tone and weight (`--color-ash`, 500), per the user.
- 2026-10-06: "How we work" moved here from the about page, under the services (before the comparison), and turned sideways (user): `Process` in `src/components/process.tsx` (was about-process.tsx). The section is pinned for `100svh + travel` and vertical scroll slides the row of five stages right-to-left (`useScroll` on the section; travel measured from the track, minus the shell's left inset, so the last stage comes to rest on the shell's right edge). A rail over the row fills with the scroll, and each stage's stop on it fills once reached. Same copy and placeholder figures as before.
- Same day: the co-founders left the studio section for the about page (its second section, before mission and vision). The studio section is now the statement and pillar only. `CoFounders` takes `standalone` (no lead-in margin, h2 title) for its own section.
- How we work, revised (user): the row sits close under the heading and the two are centred as one block in the pinned screen (was pushed to the foot); stages wider and lower (`.prc-stage` up to 36rem wide, min-height up to 17rem); the slide is slower (`SLOW` = 1.6 scrolled px per slid px); stage names in white on the black marker (`.idx-title`) instead of grey mono.
- 2026-10-06 (later): moving the co-founders out left the studio ~360px tall, shorter than the screen, so the stuck second screen came loose half covered and slid away under it (user: the second screen's exit broke and the studio looked cut). The services now sit in the same box as the stuck screen and the studio, so the screen is held until both have closed over it; once the studio's top reaches the top of the screen the water is held still (`useCovered` in home.tsx, `covered` prop on JellyField).
- The studio section is one layer above the services (`z-[11]`): with no foot padding, the "Learn more about us" drop's glass and shadow reach past its foot, and the services' ground was painting over them (user saw the drop cut off).
- How we work: the room between the services and its heading halved (user): the pinned block is hung from the top (pt clamp(5.5rem, 12svh, 7rem)) instead of centred; 298px → 148px at 1440x900. While pinned it now sits under the bar with free room below.

- 2026-10-07, about page: the room between the co-founders and the mission halved (user): the last founder row keeps half its foot (`last:pb-*`) and the mission's head room is `--section-gap × 0.425` (its foot stays at 0.85); 227px → 113px at 1280 wide.
- Values: the drop under the pointer no longer gets a "Click here" callout of its own (user: the moving callouts are cue enough). It still swells.
