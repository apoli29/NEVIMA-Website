# Free-proposal form: pages and sections, and how they are priced

Decided 2026-11-04 (user). Code: `src/lib/proposal/questions.ts`, `pricing.ts`, `estimate.ts`, `validate.ts`, `src/components/proposal-steps.tsx`. This replaces the "number of pages" model (size buckets with a floor and a spread).

## Order of the questions

1. First screen: **where the business is based** (country) is the first question of all, then the services, then who the website is for. The market sets every price.
2. Second screen ("Your website"): what the business does (sector), design level, what is needed (landing page / website / not sure), the pages and sections, and only then what the website does (forms, newsletter, complex systems) with its follow-up questions. The forms come after the pages.

## What is needed

- **Landing page**, **Website** or **Not sure**, each with a line saying how they differ.
- Website: Home, About and Contact are always included (shown ticked and locked). **At least 2 more** pages or sections must be chosen, or the form does not go on (the server also refuses). Written-in pages count, and "Not sure, you choose" stands for 2.
- One list of pages and sections for every business, in one order. The sector only puts a **star** on the pages it usually has (`SECTOR_PAGES`), with a small legend below the list. Nothing is ticked beforehand. The two item lists ("items, no page for each" and "items, with a page for each") exclude each other.
- Not in the list: Blog (it belongs to SEO), the quote request (it is a form), bookings and reservations (back-end services, kept apart).
- **Other pages and sections***: three free slots to write in up to three more. **Not sure, I'd rather you choose for me***. The asterisk says: "Writing other sections outside the choices can result in an estimate with a wider range."

## Price

The website's price is the **sum of the ranges of its pages** (Portugal, Essential+), with no base fee on top. Spain and Italy ×1.155 and the USA ×1.75 are ratios derived from the old prices, not given by the user.

| Page | Range |
|---|---|
| Landing page | 205–255 |
| Home | 70–100 |
| About | 40–50 |
| Contact | 5–15 |
| Services | 25–75 |
| Team | 15–25 |
| Prices | 10–20 |
| Testimonials | 15–25 |
| FAQ | 10–25 |
| How it works | 25–40 |
| Partners & brands | 10–20 |
| Work with us | 25–40 |
| Downloads | 5–15 |
| List of items | 20–50 |
| List of items, a page each | 50–90 |
| Portfolio & case studies | 45–85 |
| Gallery (photos and videos) | 20–50 |
| Events | 45–60 |

- **Advanced design** raises each page's range: the lowest ×1.35 and the highest ×1.45, rounded to 5.
- **A page or section written in** adds a range from the lowest to the highest of the pages already foreseen, leaving out the Home page and the landing page (Essential+: 5–90).
- **"Not sure, you choose"** adds a range from the average of all those pages to the average of the two dearest (Essential+: about 33 to 68). The "average" of a page is the middle of its range.
- Both add a note to the estimate saying the range is wider.
- The floor rounds down to 5 and the ceiling up to 5. More than 10 pages is on request.
- **"Not sure" on what is needed** (not the list) goes from Home + About + Contact up to those plus the sector's usual pages.

## What is stored

`pages` is now a bucket worked out on the server (`landing`, `3`, `4-6`, `7-10`, `10+`, `unsure`), used for the timeline, the texts and the SEO/GEO tables and kept in the SQL column `Paginas`. The page types, the written-in pages (`pageOthers`) and `pagesUnsure` are in the answers' JSON (Notion and SQL). "Not sure, you choose" counts as 2 pages for the bucket.

## Open

- Provisional: timeline days and the texts ranges by bucket; the ranges of pages the user did not price (How it works, Work with us, Downloads were given: 25–40, 25–40, 5–15).
- SEO and GEO are one service, "SEO & GEO" (id `seo`; user, 2026-11-04), with one modality question (one-time or one-time + monthly). Priced from the website (provisional): sold only with a website Nevima built; setup = 25% of the website line (floor rounded down and ceiling up to 5); the optional monthly service = 25% of the setup's middle, to the nearest 5 (a single figure). Local and national cost the same; international, a website on request and a country quoted on request make it on request. The old size tables are gone (`PRICING.search` in `pricing.ts`). A form left open from before the change, still sending "geo", is refused.
- Back-end services (Brevo, cal.com, restaurant reservations, per-country platforms, setup + monthly maintenance, a free-plan and a pro-plan scenario) are set aside, with the contract clauses on passwords, 2FA and data processing for the partners and legal review.

## What the website does: back-end prices

Decided 2026-11-04 (user). Set up and configured, in Portugal (other markets scaled by `featuresMarket`: Spain/Italy x1.15, USA x1.75):

- Forms: 55 each (1, 2, 3 = 55, 110, 165; "not sure" 55-165). More than three, and complex ones, are still priced later.
- Newsletter sign-up: 39.
- Calendar and reservations: 95 (new, in the same list of ticks; it is no longer a "complex form").
- Monthly: 40 for calendar and reservations (the user's figure); 10 for forms and newsletter together, one platform account (a suggestion, provisional). Added to the web line as one figure, nearest 5, with a note that the platform's paid plan, if chosen, is paid by the client directly. The two-scenario range (free plan versus pro plan) is not built.
- Still open: which platform for restaurant reservations abroad, and the contract clauses on credentials, 2FA and data processing.
