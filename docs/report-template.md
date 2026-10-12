# Project report template

Every project in the portfolio opens into a report (`src/components/project-report.tsx`). Every report uses the same structure; its content lives in the project's `study` in `src/lib/work.ts`. This file says what goes in each place, which pages every project gets, which ones only some projects get, and what never goes in.

The structure was designed on 2026-10-12 (user: "a structure that will be used for every report"). It is built from the studio's services and from the phases of How we work, so a report tells the story of the project the way the studio sells it.

## Form

- A4 sheets (210 × 297), white, over the darkened portfolio room, read by scrolling, the way a PDF is previewed. The photo that was pressed grows into the first sheet.
- On top, two drops: "Close ×" (white) and, for a live project, "Go to the website ↗" (black). Close, Esc or a click on the dark around the sheets closes it.
- Every sheet has the same frame: the nevima wordmark and "Project report" at the top, the project's name and "n / total" at the foot, hairlines under and over them.
- Everything is sized against the sheet's own width (`--u`, a hundredth of it), so a sheet is the same document at any size. On a phone the unit has a floor (6.6px), the sheet grows as long as it needs and the columns fold to one.
- Type: titles in Satoshi (medium, tight), text in Instrument Sans; descriptions are justified; the grey `--color-ash` is used for labels and notes. No mono, no numbered titles.
- Anything the studio has not filled in yet reads as `[a preencher]`, in grey. Nothing about a client is ever made up.

## Pages every report has

1. **Cover.** The name (large), the status (Live / In production) as an outlined tag, the summary (`summary`, two or three sentences, justified), the main photo (16:9), then six facts in three columns: Sector, Region, Website type, Pages, Design level, Delivered. Last, the services taken, as outlined tags.
2. **The project.** Two columns: "Where it started" (`startingPoint`: what the business had, what was missing) and "Goals" (`goals`: three or four short lines). Below them, "Our approach" (`approach`: the studio's answer, a few sentences). Last, "How it ran": the three phases of How we work on one line (Proposal and contract, Production, Review and launch) with how long each took (`phases`), and "Start to launch" (`duration`).
3. **The website.** "Its pages" (`sitemap`, as outlined boxes, in the order of the menu). Two columns: "What it does" (`features`) and "Included with it" (read from the Web Design service's own "Also included" list, so it never drifts from the services section). Last, "Measured on the live website": four Lighthouse scores (Performance, Accessibility, Best practices, SEO, mobile, out of 100) and the load time (`scores`).
4. **The outcome** (always last). What changed for the client (`outcome`), the client's words (`quote`, signed by role), credits (Strategy, design and build; Visual identity, if taken; Photography), and the privacy note.

## Pages a report has only if the project took that service

They come between "The website" and "The outcome", in this order.

- **Visual identity** (`identity`): the idea behind it (two or three sentences); the logo on white, on black, and the symbol if there is one; up to five colours (name and hex); the typefaces (a sample, the name and its role); where it is used beyond the website.
- **Search and AI answers.** One page for SEO and GEO, titled by what was taken: "Found on search", "Found in AI answers", or "Found on search and in AI answers".
  - SEO (`seo`): the searches the website is set up for (as tags), what was put in place, and where it stood before and after (as positions or a share).
  - GEO (`geo`): what was put in place, and how the business shows in AI answers now, in a sentence.
- **Photo shoot** (`shoot`): what was photographed, how many photos and videos, and a gallery of six.

Web design is always taken, so pages 1 to 3 and the outcome are always there. Bsmartish (Web design, Visual identity, SEO, GEO) has six pages; Estamento de Gerona (Web design, Visual identity) has five.

## Privacy: what never goes in

- No personal data: no names of the client's staff or customers, no emails, phone numbers or addresses. Region or country only, never a street.
- No commercial data: no prices, no budget, no revenue, no contract terms, no raw traffic or sales numbers.
- Results are shown rounded or as a change (a position, a share, a score), and only results the client has agreed to show.
- The client's words appear only with their written consent, signed by role ("Founder", "Clinic director"), never by full name unless they ask for it.
- Screens of the website show only public pages, never logged-in areas or client data.
- The privacy note at the foot of the last page says this to the reader.

## Filling one in

1. Add the project's own photos to `public/work/<slug>/` (a cover at 16:9, logos as SVG or PNG on transparent) and point `photo`, `study.identity.logo` and `study.identity.symbol` at them.
2. Fill in the project's fields and its `study` in `src/lib/work.ts`. Leave anything not yet known as `null`; it shows as `[a preencher]`.
3. Scores: run Lighthouse (mobile) on the live website and write the four numbers and the load time.
4. Check the privacy list above before publishing.
