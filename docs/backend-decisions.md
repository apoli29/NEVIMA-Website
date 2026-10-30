# Backend: where the forms' answers go

Decided 2026-10-26, changed 2026-10-27 (user), free tools only.

## Flow

1. A form (the bar's overlay, the page's `inline-proposal`, the partners' form) posts to `/api/proposal` or `/api/partner`. The route checks everything again and works the estimate out on the server.
2. `deliverRequest` / `deliverPartner` (`src/lib/proposal/deliver.ts`) make a page in a Notion database (`src/lib/proposal/notion.ts`): "Pedidos" for proposals, "Parceiros" for partners. The answers are the page's properties; the estimate's lines and the raw answers are in the page.
3. Only when Notion took it is the request "delivered". Otherwise the form says so and offers the visitor's own email app (503 `not_configured`).
4. Then, through Resend: a notice to the studio (`ola@nevima.studio`, with the link to the page; replying to it answers the visitor), and, for a proposal request, a confirmation to the visitor (`src/lib/proposal/email.ts`) in the language they used the site in. A failed email never fails the request: the page is in Notion. Partners get no confirmation: we get in touch ourselves.

## Setup

1. notion.so/my-integrations: a new internal integration; its secret is `NOTION_TOKEN`.
2. An empty Notion page, shared with the integration (••• > Connections).
3. `.env.local` (never committed): `NOTION_TOKEN` and `NOTION_PARENT` (the page's address). Then `node --env-file=.env.local scripts/setup-notion.mjs` makes the two databases and prints their ids. Run it once: twice makes them twice.
4. Vercel, Production: `NOTION_TOKEN`, `NOTION_FORM1_LEADS` (proposal requests: "Pedidos"), `NOTION_FORM2_LEADS` (partners: "Parceiros"), `RESEND_API_KEY`; optional `MAIL_FROM` (default `nevima <ola@nevima.studio>`), `NOTIFY_TO` (commas between addresses), `SITE_URL` (default `https://nevima.studio`, where the email's wordmark loads from: `public/email/wordmark.png`). Then redeploy.

The properties' names are in two places that must change together: `scripts/setup-notion.mjs` and `deliver.ts`.

## Decisions

- The databases are the studio's, read in Portuguese: values are written in Portuguese whatever the visitor's language; a property holds the language.
- The language of the reply is picked at the end of the form (user, 2026-10-30): "Reply in / Resposta em", Português or English, right above sending, already set to the site's language so nobody has to answer it. It is not a question: one click for the few who want the other language. It decides the confirmation's language, "Idioma" in Notion (both databases), and so the language the composer writes the invitation and the proposal in, and the call's. The estimate stays in the words the visitor read it in. The studio's notice says it as "Responder em: português / inglês".
- The first plan was a Google Sheet through an Apps Script web app; it was replaced by Notion (user, 2026-10-27) for the cleaner layout and the board by state (Novo, Contactado, Proposta enviada, Ganho, Perdido).
- The notice to the studio goes by Resend, so there is one place that sends email.
- The confirmation promises no reply time: none is fixed. When one is, add it after the first paragraph, in both languages (`WORDS` in `email.ts`).
- The proposal and the invitation to the call are written in the studio's composer (`/interno`, below) since 2026-10-29. Follow-ups and outreach are still written by hand from Gmail.
- Logs never carry name, email, phone or message: the logs are not the inbox.
- Notion select options cannot hold commas: they become semicolons.

## Open

- Telegram notice on a new request: optional, not built.
- Whether partners should get a confirmation too.
- The page's body shows the answers as raw JSON; a readable list of them (labels, not ids) would be cleaner.

## One request per email in 24 hours (user, 2026-10-27)

- A visitor whose email already sent a request in the last 24 hours is refused (409 `already_sent`) with the time left: "We already received a request from this email in the last 24 hours. To send a new one, with changes, wait another 3 h 20 min." (the Portuguese is recast impersonally, as the site never addresses the reader). It holds for both forms, each against its own database: a proposal request and a partner request do not count against each other.
- Checked by asking Notion (`lastRequestSince` in `notion.ts`) for a page with that email, stored in lower case, and a "Recebido" within 24 hours. If Notion cannot answer, the visitor is let through.
- The studio's own test addresses are exempt: `REPEAT_ALLOWED_EMAILS_FORMS` in Vercel, commas between them, kept out of the repository.
- It does not stop someone using another address (or `+tags` on one); the per-IP limit in `guard.ts` is what covers that.

## The meeting before the proposal (user, 2026-10-27)

The studio books a call as soon as a request arrives. Before it, the two partners explore the client's business; on it they go over the choices made: which may be unnecessary, and what was not chosen but could make sense. They arrive with two prices: X (if the client accepts the studio's suggestions) and Y (what the form's answers come to). After the call an email confirms the value, with the contract attached (written and sent by hand from Gmail).

In Notion, to match:

- States, in this order, in both databases: Novo, Contactado, Reunião marcada, Reunião feita, Proposta enviada, Ganho, Perdido.
- "Reunião" (date and time) in both. In "Pedidos" only: "Valor Y (cliente)", "Valor X (sugestões)", "Valor final" (euros) and "Contrato enviado" (a tick). "Estimativa", filled by the site, stays beside them as what the client was shown.
- Each new page in "Pedidos" opens with "Preparação da reunião": three headings to write under (the business; choices to review; what was not chosen and may make sense). Written notes read better in the page than in a cell. Pages made before this have no such headings.
- `scripts/setup-notion.mjs` now also updates a database whose id is in `.env.local`: adds the properties it lacks and puts the states in order, keeping their ids and any option made by hand. Nothing is removed and no request is touched.

Still open: the form's wording still promises "a final proposal"; to be changed to the meeting. (The confirmation email no longer promises the proposal by email: it was rewritten on 2026-10-29.)

## The studio's emails (user, 2026-10-29)

Three emails, one look (`src/lib/proposal/mail.ts`), black as the site's footer (user, 2026-10-29, replacing a first white version): white type, ash for what is secondary, dark hairlines. The footer's light is held still in two pictures 1600px wide (`public/email/light-head.jpg` and `light-foot.jpg`, drawn by `scripts/email-light.mjs` from the same field as `liquid-lens.tsx`, at twice the size and averaged down, with a fine grain against banding). They lie on the email's whole black background, not in its 600px column (user, 2026-10-30: no block may show where it ends), so the light reaches out on both sides and fades into the black before any edge: one behind the top (the wordmark, a mono label in a hairline box, the greeting set large), one behind the foot, where the wordmark (`wordmark-glow.png`, with a glow of its own that fades out before the picture's edge) sits in it. The letter between is plain black, and where images are off or background images are not drawn (Outlook on Windows) it is all plain black. The buttons are the bar's crate turned inside out, as it turns when pointed at: white, the arrow in a black key. Phones are boxed mono chips that call. Tables and inline styles only; Satoshi, Instrument Sans and Geist Mono where the mail app loads web fonts (Apple Mail, iOS), Helvetica and the system's monospace elsewhere (Gmail). The images are in `public/email/`, loaded from `SITE_URL`. Every email has a plain-text version and both languages.

1. **Confirmation** (`email.ts`): automatic, always the same, sent the moment a request is in Notion. The studio's words, with two sentences that repeated each other merged into one. It no longer lists the answers: the studio's text is the whole email.
2. **Invitation to the call** (`invite.ts`): "we have a proposal", a call of 20 to 30 minutes, and two times as buttons, in Lisbon time. A click opens the meeting page (`/meeting`, `/pt/meeting`, `src/components/meeting.tsx`), which shows the time and asks for one more click to book it, so a mail scanner opening the link books nothing. Booking sets "Reunião" (Lisbon time) and "Reunião marcada" in Notion and sends the studio a notice; choosing again moves it, and the studio is told. Once booked, the page offers a calendar file. Without a company (personal use) the call is only "to get to know each other".
3. **Final proposal and contract** (`offer.ts`): after the call. The proposal's paragraph is written each time in the composer; the final value (and a monthly one) is set large with the VAT note ("Isento de IVA (art. 53.º do Código do IVA)", as the contract says it), and the contract goes as a PDF attachment, named in the email. **Its frame is a draft for the partners to approve.**

The meeting page is a single screen like the portfolio: it is reached only from the email, so it has no bar, no `WorkTogether` and no footer, only a black foot with the wordmark. It keeps the site's rule and never addresses the reader.

### The composer: `/interno`

Not linked from anywhere, out of search engines, Portuguese only. One key for both partners (`STUDIO_KEY`); the cookie holds a hash of it for 30 days. The client's email finds the latest request in "Pedidos" and fills the name, company and language (all editable); a Notion page link can be pasted instead. The preview is the email itself, drawn from the same code the server sends.

- **Enviar** sends it through Resend from `MAIL_FROM`, to the client, with a hidden copy to `NOTIFY_TO` (so it is in Gmail too, where the reply lands) and replies to `ola@nevima.studio`. Then Notion: the invitation moves "Novo" to "Contactado"; the proposal sets "Proposta enviada", "Valor final" and, with a contract attached, "Contrato enviado".
- **Copiar para o Gmail** copies the finished email, links signed, to paste into a new Gmail message. Notion is then updated by hand.

Limits:

- Resend's free plan: 100 emails a day, 3000 a month, counting the automatic confirmations and notices.
- Sending from `ola@nevima.studio` needs the domain verified in Resend (DNS records at Hostinger). Until then Resend refuses, and "Copiar para o Gmail" is the way.
- What is sent from the composer is not in Gmail's "Sent": the hidden copy in the inbox stands for it.
- The contract: one PDF of at most 4 MB (Vercel takes no larger request).
- One shared key, no accounts: it keeps out the curious. Changing `STUDIO_KEY` closes every session.
- The time links are signed with `LINKS_SECRET` and carry only the Notion page's id and the two times, never a name or an address. Changing `LINKS_SECRET` breaks every link already sent.
- The page does not stop two clients from taking the same time: the studio offers each one its own times.

Vercel, Production, to add: `STUDIO_KEY` (long), `LINKS_SECRET` (long and random), and `SITE_URL` set to the address the site is really on (while nevima.studio is parked, the Vercel address, or the emails' images and links do not load). Locally, the `nevima-dev-emails` launch configuration runs the site with test keys and no Resend key, so nothing is sent.

Still open:

- The final proposal's frame (subject, opening, how the contract is signed and returned), to be approved by the partners.
- Whether the client should also get an email once the call is booked; for now the page confirms it and the studio sends the call's link by hand.
- At the end of the form, "Contact us now?" with the two phones (asked 2026-10-29, not built).
- Outreach emails to potential clients, for leads (asked 2026-10-29, not built).
