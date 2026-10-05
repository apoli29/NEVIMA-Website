# About page decision log

What was decided for the about page (`/about`), and why. Same rules as `homepage-decisions.md`: newest notes sit lower, the later one wins, and read a section's part before changing it.

The page was built on 2026-10-05 as a **template**: structure and look are meant to stay, the copy is a stand-in the studio will rewrite. Order: statement on stone, mission and vision, values on the water, how we work, FAQ, then the shared footer. No opening on this page: the bar (`FloatingNav` with no props) is simply there.

The page is `noindex` (`robots: { index: false, follow: true }` in `src/app/about/page.tsx`), asked by the user, while its copy is a stand-in. Remove it when the real copy goes in.

## Routing

- `FloatingNav` takes its opacity props optionally now, and its links are route-aware through `homeSection()` (exported from `floating-nav.tsx`, also used by the footer): `#…` links get `/` in front off the home page, anything else is left alone. The mark links to `/` off the home page.
- The nav's placeholder "Studio" goes to `/about`, as do the home page index's "About us" and the studio section's "about us" (user approved the plan).

## 1. Statement (`about-hero.tsx`)

- Full-screen black-and-white stone photo by Liz Grin (Unsplash), supplied by the user. The original (3130x2075) was uploaded to `main` as `public/lizgrin-…(2).jpg`; it now lives in `public/about/` as grayscale `stone-2400.jpg` and `stone-1280.jpg` (served by `srcset`), and the upload was removed.
- Darkened (`.abt-hero-photo` filter + `.abt-hero-scrim`) with a fine SVG grain (`.abt-grain`).
- Text centred and justified (user's ask), each paragraph's last line centred. Measure held in ems (`.abt-statement`, 25.5em) so justification stays even; a 27em measure was tried and opened bigger holes. Phones allow hyphens.
- Copy is a placeholder. The user offered their reference text (another agency's) as a stand-in; an original draft with the same structure was used instead so no third-party copy ships by accident.
- Lit grey to white with `Illuminated`, once the fonts are in.

- 2026-10-05 (later): the user found the photo looked like a "fundo forçado". Tested a plain dim, a darker spot, a fade into the white page and a soft version; the soft one won: photo at 50% opacity over black, contrast eased (0.82), a 0.8px blur to calm the stone's specks, a light edge vignette, grain down to 0.06, a faint shadow on the words (`.abt-hero-photo`, `.abt-hero-scrim`, `.abt-grain`, `.abt-statement`).
- Temporary: the section was shown three times, on three photos the user uploaded to choose between (`STONE`, `WATER` by Madison Oren, `SWIRL` by Sudhanshu Singh, in `about-hero.tsx`; files in `public/about/`, originals removed from the repo root). Only the first carries the h1; the others light their text when seen. Keep one and delete the other two `<AboutHero>` lines in `about.tsx`. Later the user dropped the water photo (files removed), leaving stone and swirl.
- The statement's light runs 2.5x faster than the service copy's (user): 600ms per paragraph, via the new optional `durationMs` on `Illuminated` (default unchanged, so the home page is untouched).

## 2a. Mission and vision (`about-mission.tsx`)

- White, gallery hang: mission high left (8 cols), vision lower right (cols 6-12), each with a black-marker mono label, a tense label on the right and a hairline drawn in. Copy written from the leverage thesis (the user delegated it). Lit grey to black, ragged (`.abt-ragged`).

## 2b. Values (`about-values.tsx`, `values-water.ts`)

- Same water as the home page's second screen, re-implemented in `values-water.ts` (shader copied by hand from `jelly-field.tsx`; keep the two in step).
- Four drops of similar size, irregular (body + two lobes, seeded). Each sits on a real button (`.abt-val-hit`) with its name as a mono label; the canvas reads the buttons' boxes.
- Clicking one: all four travel (chosen first, the others staggered, slight arc) into one row of 12 blobs sized by `meetFor()` to the real drop's glass box, highlight and outline wobble fade out, then the drawn glass hands over to the real `.cta-drop` (`.abt-val-drop`), which carries the value's name and sentence in white. The user picked "text inside the drop". Pressing the drop or Esc reverses it; focus goes to the drop and back to the chosen button.
- Four drops alone pinched in between one another; spreading all 12 blobs evenly made the joined shape smooth.
- The big drop has its own deeper corners (`val-drop-shape`) so its ends stay round, and breathes only as far as the white CTA does (the black one's fade read as greying out). No inner highlight.
- Values (user delegated content): Less, on purpose / Direct line / Fast, not rushed / Always current.

- 2026-10-05 (later), user's revision: the section is **only the four drops**: no title, subtitle or names (sr-only h2 and button labels remain). The joined shape is now the organic piece the drops form on the canvas, not the CTA drop (user preferred it): no hand-over, outline still wandering at half (`JOINED_WARP`), highlight down to a glint (`JOINED_SPEC`), the value's words fade in on it, sized with a margin so the outline never crosses them. A press anywhere on the water, the piece itself, or Esc parts them.
- Cue to click (user wanted near-certain discovery), three layers: until the first choice one drop at a time swells and strikes a water ring every 2.4s (`BECKON_*`) with a black "Click"/"Tap" tag beside it; the hovered drop swells (`HOVER_SWELL`); over a drop the tag follows the pointer ("Close" over the water once joined). The calling stops for good after the first choice.
- The mission section now has foot padding too, so the vision no longer runs into the values' water.

## 3. How we work (`about-process.tsx`)

- The user asked for the philosophy first, numbers second: each stage is headed with a principle; time and deliverable are mono small print. Order shown by a scroll-filled rail with stops, not numbers on titles. Figures are invented stand-ins (user allowed).

## 4. FAQ (`about-faq.tsx`)

- Sticky heading + "Ask us" drop (mailto) on the left, accordion on the right using the services' "n" toggle (`Chevron`, now exported) and the `xs-*` drawer styles. Answers lit grey to black. Prices (€1,900 / €3,900) and timelines are stand-ins taken from the old draft for the studio to confirm.
