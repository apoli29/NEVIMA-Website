# Project report template

Every project in the portfolio opens into a report (`src/components/project-report.tsx`). Every report uses the same structure; its content lives in the project's `study` in `src/lib/work.ts`. This file says what goes in each place, which chapters every project gets, which ones only some projects get, and what never goes in.

The structure was designed on 2026-10-12 (user: "a structure that will be used for every report"). It is built from the studio's services and from the phases of How we work, so a report tells the story of the project the way the studio sells it.

## Form

- One sheet: 953px wide (an A4 page at 96dpi, 794px, and a fifth more), as tall as the screen under the two buttons, over the darkened portfolio room. The report runs down inside it as the reader scrolls. The photo that was pressed grows into the sheet.
- Organised by service (user, 2026-10-13): the overview, then one chapter for each service the project took, in the order the services section lists them, each saying only what makes sense for that service, then the outcome.
- Set in the site's own language, not a PDF's and not an app's: black hairlines, the gallery's mono labels (as the second screen's readouts), service names in light Satoshi (as the services list), black boxes for "Main service" / "Additional service" and "Project report" (as the index's label), the services' ticked lists, the client's words on a black panel. No rounded cards, no grey fills.
- The header stays at the top of the sheet: the wordmark and "Project report", the chapters as plain links (the one being read underlined), and a thin reading line along its foot.
- On top, two drops: "Close ×" (white) and, for a live project, "Go to the website ↗" (black). Close, Esc or a click on the dark around the sheet closes it.
- Every service chapter has the same shape: a black rule, the name with its kind of service, then two columns (what was asked and done on the left, the specifics as a hairline list on the right), then what that service needs below.
- On a narrow sheet (under 40rem: phones) the columns fold to one; readouts go two to a row.
- Anything the studio has not filled in yet reads as `[a preencher]`, in grey. Nothing about a client is ever made up.

## The chapters

1. **Overview** (always). The photo across the sheet, the name in white on a black band, the status (green dot when live), the summary (`summary`, justified), four readouts (Sector, Region, Delivered, Start to launch), the services as outlined tags.
2. **Web Design** (always; main service). Left: "The brief" (`startingPoint`) and "What we built" (`approach`). Right: Website type, Pages, Design level; "Its pages" (`sitemap`, tags). Below, three ticked lists: Goals (`goals`), What it does (`features`), Also included (read from the Web Design service itself). Then two readout rows: "How it ran" (the three phases of How we work, `phases`) and "Measured on the live website" (four Lighthouse scores, mobile, out of 100, and the load time, `scores`).
3. **Visual Identity** (if taken). Left: "The idea" (`identity.idea`). Right: Typefaces, Where it is used. Below: the logo on white, on black, and the symbol if there is one; up to five colours (name and hex).
4. **SEO** (if taken). Left: "What we put in place" (`seo.work`, ticked). Right: "The searches it is set up for" (`seo.searches`, tags); Before and After (`seo.before`, `seo.after`), as positions or a share.
5. **GEO** (if taken). Left: "What we put in place" (`geo.work`, ticked). Right: "How it shows in AI answers now" (`geo.presence`).
6. **Photo Shoot** (if taken). Left: "What we photographed" (`shoot.subject`). Right: Photos, Videos. Below: a gallery of six.
7. **The outcome** (always, last). "What changed" (`outcome`) beside the client's words on black (`quote`, signed by role); credits as readouts; the privacy note.

Bsmartish (Web design, Visual identity, SEO, GEO) has seven chapters; Estamento de Gerona (Web design, Visual identity) has four.

## Privacy: what never goes in

- No personal data: no names of the client's staff or customers, no emails, phone numbers or addresses. Region or country only, never a street.
- No commercial data: no prices, no budget, no revenue, no contract terms, no raw traffic or sales numbers.
- Results are shown rounded or as a change (a position, a share, a score), and only results the client has agreed to show.
- The client's words appear only with their written consent, signed by role ("Founder", "Clinic director"), never by full name unless they ask for it.
- Screens of the website show only public pages, never logged-in areas or client data.
- The privacy note at the end of the report says this to the reader.

## Filling one in

1. Add the project's own photos to `public/work/<slug>/` (a cover at 16:9, logos as SVG or PNG on transparent) and point `photo`, `study.identity.logo` and `study.identity.symbol` at them.
2. Fill in the project's fields and its `study` in `src/lib/work.ts`. Leave anything not yet known as `null`; it shows as `[a preencher]`.
3. Scores: run Lighthouse (mobile) on the live website and write the four numbers and the load time.
4. Check the privacy list above before publishing.
