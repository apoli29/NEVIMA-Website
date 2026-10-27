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
4. Vercel, Production: `NOTION_TOKEN`, `NOTION_PROPOSALS_DB`, `NOTION_PARTNERS_DB`, `RESEND_API_KEY`; optional `MAIL_FROM` (default `nevima <ola@nevima.studio>`), `NOTIFY_TO` (commas between addresses), `SITE_URL` (default `https://nevima.studio`, where the email's wordmark loads from: `public/email/wordmark.png`). Then redeploy.

The properties' names are in two places that must change together: `scripts/setup-notion.mjs` and `deliver.ts`.

## Decisions

- The databases are the studio's, read in Portuguese: values are written in Portuguese whatever the visitor's language; a property holds the language.
- The first plan was a Google Sheet through an Apps Script web app; it was replaced by Notion (user, 2026-10-27) for the cleaner layout and the board by state (Novo, Contactado, Proposta enviada, Ganho, Perdido).
- The notice to the studio goes by Resend, so there is one place that sends email.
- The confirmation promises no reply time: none is fixed. When one is, add it after the first paragraph, in both languages (`WORDS` in `email.ts`).
- The proposal, follow-ups and outreach are written and sent by hand from Gmail templates; they are not part of the site.
- Logs never carry name, email, phone or message: the logs are not the inbox.
- Notion select options cannot hold commas: they become semicolons.

## Open

- Telegram notice on a new request: optional, not built.
- Whether partners should get a confirmation too.
- The page's body shows the answers as raw JSON; a readable list of them (labels, not ids) would be cleaner.
