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

| Page | Range (raised 20% twice, 2026-11-04) |
|---|---|
| Landing page | 250–310 |
| Home | 100–145 |
| About | 60–70 |
| Contact | 6–25 |
| Services | 35–110 |
| Team | 25–35 |
| Prices | 12–30 |
| Testimonials | 25–35 |
| FAQ | 12–35 |
| How it works | 35–60 |
| Partners & brands | 12–30 |
| Work with us | 35–60 |
| Downloads | 6–25 |
| List of items | 30–70 |
| List of items, a page each | 70–130 |
| Portfolio & case studies | 65–120 |
| Gallery (photos and videos) | 30–70 |
| Events | 65–85 |

- **Advanced design** moves each page's whole range up by 50% of its middle, rounded to 5 (`advancedShift`; user, 2026-11-04): the same amount on both ends, so the range is as wide as Essential+ and the price about 1.5x. It was the lowest ×1.35 and the highest ×1.45, which made the Advanced range much wider.
- **A page or section written in** adds a range from the lowest to the highest of the pages already foreseen, leaving out the Home page and the landing page (Essential+: 6–130).
- **"Not sure, you choose"** adds a range from the average of all those pages to the average of the two dearest (Essential+: about 47 to 96). The "average" of a page is the middle of its range.
- Both add a note to the estimate saying the range is wider.
- The floor rounds down to 5 and the ceiling up to 5. More than 10 pages is on request.
- **"Not sure" on what is needed** (not the list) goes from Home + About + Contact up to those plus the sector's usual pages.

## What is stored

`pages` is now a bucket worked out on the server (`landing`, `3`, `4-6`, `7-10`, `10+`, `unsure`), used for the timeline, the texts and the SEO/GEO tables and kept in the SQL column `Paginas`. The page types, the written-in pages (`pageOthers`) and `pagesUnsure` are in the answers' JSON (Notion and SQL). "Not sure, you choose" counts as 2 pages for the bucket.

## Open

- Texts never change the price (user, 2026-11-04): the question stays, for the studio to know, and writing them when there are none is included. The texts ranges are gone from `pricing.ts`.
- Provisional: timeline days by bucket; the ranges of pages the user did not price (How it works, Work with us, Downloads were given: 25–40, 25–40, 5–15).
- SEO and GEO are one service, "SEO & GEO" (id `seo`; user, 2026-11-04), with one modality question (one-time or one-time + monthly). Priced from the website (provisional): sold only with a website Nevima built; setup = 25% of the website line (floor rounded down and ceiling up to 5); the optional monthly service = 25% of the setup's middle, to the nearest 5 (a single figure). Local and national cost the same; international, a website on request and a country quoted on request make it on request. The old size tables are gone (`PRICING.search` in `pricing.ts`). A form left open from before the change, still sending "geo", is refused.
- Back-end services (Brevo, cal.com, restaurant reservations, per-country platforms, setup + monthly maintenance, a free-plan and a pro-plan scenario) are set aside, with the contract clauses on passwords, 2FA and data processing for the partners and legal review.

## What the website does: back-end prices

Decided 2026-11-04 (user). Set up and configured, in Portugal (other markets scaled by `featuresMarket`: Spain/Italy x1.15, USA x1.75):

- Form: 55, and one is enough (no count question), whatever its emails. Automated emails are priced later (see below).
- Newsletter sign-up: 39.
- Calendar and reservations: 95 (its own tick, in the same list).
- Monthly, as a range (the user's rule): our labour is always 5 a month, however many platforms; the lowest figure is that alone (the platforms' free plans are enough), the highest adds the platforms' paid plans, which the client pays directly. Which applies is only known once the business is known. Forms and the newsletter share one platform (Brevo); the calendar is another (Cal.com). Plans with 23% VAT, yearly billing, not scaled by market: Brevo 7.79 (Starter 6.33 + VAT), Cal.com 12.83 (Teams 12 USD at about 1.15 USD per EUR + VAT); to confirm. Rounded to 5. Examples in Portugal: form, newsletter or both 5-15; calendar 5-20; form + calendar 5-30. Both platforms offer affiliate programs (Cal.com: 20% discount for the client the first 12 months and 20% recurring commission for us; Brevo: commission to us only); to confirm on their pages and to mention in the contract.
- A restaurant (sector "Restauração") in Portugal books through its own reservation platform: a fixed 40 a month (with its upkeep inside), with no paid-plan scenario; with a form too it is 45-55. Outside Portugal there is no such platform known, so a restaurant is priced like any other business with Cal.com (provisional).
- Every platform, the restaurants' reservation platform included, is paid by the client directly to it; a monthly figure always splits into the platform's plan and our upkeep, and with a free plan only our upkeep is paid (user, 2026-11-04; contract v1.13, clause 15).
- An urgent deadline adds 40% to the project's whole one-time price, the photo shoot included, never to the monthly fees (user, 2026-11-04; contract v1.13, clause 4.5).
- The monthly range is on the web line (`monthly`, `monthlyMax`), with a note explaining it. Since 2026-11-04 it is shown in the back end's row, not beside the web line nor under the total (the total keeps it only when another line, SEO & GEO, has a monthly fee too).
- Open: the reservation platform for restaurants abroad, the exact plan prices, and the contract clauses on credentials, 2FA and data processing.

## How the emails work, and the estimate's back end

Decided 2026-11-04 (user; the three questions put to the user went unanswered, so the recommended options were taken and are open to change).

- The old "What kind of forms?" (Simple / Complex) is now **"How should the emails work?"** / "Como devem funcionar os emails?", asked when **Forms or Newsletter sign-up** is ticked, since it is about the emails, not the forms.
- **Manual** (chosen from the start, the old Simple, same price): one automatic email and the answers saved in a database; every email after it is written by hand. **Automated** (the old Complex): templates with placeholders, the base of each email already written and only what changes filled in; price set later, named under the total as "Automated emails". The form and the newsletter keep their own price with either. The ids stay `simple` / `complex` (database column `TipoFormularios`, studio emails).
- "What is your website's core goal?": the always-included first level ("Present your business / project") is gone; the hint "Each level adds to the one before" became "What works behind the website" / "O que funciona por trás do website", and the levels lost their "+".
- Estimate: the website's Front end and Back end sit right under its name, with the line's notes after them. The part labels are a step smaller than the figures. The back end reads "Options chosen: forms, newsletter sign-up, manual emails." and carries the monthly fee ("Then €5–€15/mo") with "The monthly fee covers the platforms' costs and our maintenance: whenever something goes wrong, we fix it."
- Still to align: the contract (`contratos/contrato-nevima.html`, clause on forms) still speaks of simple and complex forms.
- Third level ("Complex systems behind the website"): ticking it now ends the form on that screen with one message in the middle (we do not take such projects on now) and a "Go back to the form" / "Voltar ao formulário" button; Continue then does nothing (an error under the question) until the tick is taken off. The form no longer jumps to the estimate screen for it.
- The pages a sector usually has carry a small star icon (no more asterisk), with the same star before "Usually chosen…" under the list.

## Page prices raised by 20%

2026-11-04 (user): every page and section range in `pricing.ts` (`web.pages`) was raised by 20%, each end rounded to 5 (the lowest never under 5). On average the ends rose 20.5%; the smallest ends (5, 10) stay where they were after rounding. Landing page 245–305, Home 85–120, About 50–60, Contact 5–20. The Advanced uplift (35% / 45%) and the market ratios are applied on top, as before.

## Page prices raised by 20% again

2026-11-04 (user): every page and section range was raised by another 20%, each end rounded to 5; the ends of 5 and 10, which rounding to 5 would have left unchanged, went to the euro (6 and 12), so every option rose. Landing page 295–365 (then lowered 15% to 250–310, user 2026-11-04), Home 100–145, About 60–70, Contact 6–25. The table above holds the current figures.
