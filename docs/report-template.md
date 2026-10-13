# Project report template

Every project in the portfolio opens into a report (`src/components/project-report.tsx`). Every report uses the same structure; its content lives in the project's `study` in `src/lib/work.ts`. This file says what goes in each place, which chapters every project gets, which ones only some projects get, and what never goes in.

The structure was designed on 2026-10-12 (user: "a structure that will be used for every report"). It is built from the studio's services and from the phases of How we work, so a report tells the story of the project the way the studio sells it.

## Form

- One sheet: 953px wide (an A4 page at 96dpi, 794px, and a fifth more), as tall as the screen under the Close button, over the darkened portfolio room. The report runs down inside it as the reader scrolls. The photo that was pressed grows into the sheet.
- Organised by service: the overview, then one chapter for each service the project took, in the order the services section lists them, each with only what that service needs. No closing chapter (user, 2026-10-13).
- Set in the site's own language: black hairlines, the gallery's mono labels, service names in light Satoshi (as the services list), black boxes for "Main service" / "Additional service" and "Project report" (as the index's label), the services' ticked lists. No rounded cards, no grey fills.
- The header stays at the top of the sheet, on one line: the chapters as plain links on the left (the one being read underlined), "Project report" in its black box on the right, a thin reading line along its foot. No wordmark at the top (user); the wordmark signs off the foot of the sheet beside "Back to the top".
- Every service chapter has the same shape: a black rule, the name with its kind of service, then two columns.
- On a narrow sheet (under 40rem: phones) the columns fold to one and the header keeps only the chapters.
- Anything the studio has not filled in yet reads as `[a preencher]`, in grey. Nothing about a client is ever made up.

## The chapters

1. **Overview** (always). The photo across the sheet; the name in white on a black band, with the services taken as outlined tags beside it; the summary (`summary`, justified); "Go to website ↗" (the black drop; at rest, faded, until the website is online). No status, no readouts (user).
2. **Web Design** (always; main service). Left: one justified paragraph about the website (`study.website`). Right: a hairline grid of Design level (`designLevel`), Pages (`pages`) and Languages (`study.languages`). Nothing else (user).
3. **Visual Identity** (if taken). Left: a before-and-after card (`study.identity.before`, `study.identity.after`, two images of the same size): the hand going left shows more of before, going right more of after; from the keyboard it is a slider (arrow keys), on a phone it follows the finger. Right: "The idea" (`study.identity.idea`), the concept explained.
4. **SEO** (if taken). Left: "What we put in place" (`seo.work`, ticked). Right: "The searches it is set up for" (`seo.searches`, tags); Before and After (`seo.before`, `seo.after`), as positions or a share.
5. **GEO** (if taken). Left: "What we put in place" (`geo.work`, ticked). Right: "How it shows in AI answers now" (`geo.presence`).
6. **Photo Shoot** (if taken). Left: "What we photographed" (`shoot.subject`). Right: Photos, Videos. Below: a gallery of six.

Bsmartish (Web design, Visual identity, SEO, GEO) has five chapters; Estamento de Gerona (Web design, Visual identity) has three.

## Privacy: what never goes in

- No personal data: no names of the client's staff or customers, no emails, phone numbers or addresses. Region or country only, never a street.
- No commercial data: no prices, no budget, no revenue, no contract terms, no raw traffic or sales numbers.
- Results are shown rounded or as a change (a position, a share, a score), and only results the client has agreed to show.
- Screens of the website show only public pages, never logged-in areas or client data.

## Filling one in

1. Add the project's own images to `public/work/<slug>/`: the cover photo (wide) and, with Visual Identity, a "before" and an "after" image of the brand at the same size. Point `photo`, `study.identity.before` and `study.identity.after` at them.
2. Fill in the project's fields (`summary`, `designLevel`, `pages`, `services`) and its `study` in `src/lib/work.ts`. Leave anything not yet known as `null`; it shows as `[a preencher]`.
3. Check the privacy list above before publishing.
