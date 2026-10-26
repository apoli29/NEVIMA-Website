# Backend: where the forms' answers go

Decided 2026-10-26 (user), free tools only.

## Flow

1. A form (the bar's overlay, the page's `inline-proposal`, the partners' form) posts to `/api/proposal` or `/api/partner`. The route checks everything again and works the estimate out on the server.
2. `deliverRequest` / `deliverPartner` (`src/lib/proposal/deliver.ts`) send the request to a Google Sheet through an Apps Script web app (`docs/apps-script/pedidos.gs`). The script adds a row to the tab "Pedidos" (proposals) or "Parceiros" (partners) and mails `ola@nevima.studio`, with the visitor's email as reply-to.
3. Only when the sheet took it is the request "delivered". Otherwise the form says so and offers the visitor's own email app (503 `not_configured`).
4. A proposal request's visitor then gets a confirmation through Resend (`src/lib/proposal/email.ts`), in the language they used the site in. A failed confirmation never fails the request. Partners get none: we get in touch ourselves.

## Environment (Vercel; never in the repository)

`APPS_SCRIPT_URL`, `APPS_SCRIPT_TOKEN` (same as the script's `TOKEN`), `RESEND_API_KEY`; optional `MAIL_FROM` (default `nevima <ola@nevima.studio>`), `SITE_URL` (default `https://nevima.studio`, where the email's wordmark is loaded from: `public/email/wordmark.png`).

## Decisions

- The sheet is the studio's, read in Portuguese: values are written in Portuguese whatever the visitor's language; a column holds the language.
- Resend only for the one automatic email. The notice to the studio comes from Apps Script, so a Resend problem never hides a request.
- The confirmation promises no reply time: none is fixed. When one is, add it after the first paragraph, in both languages (`WORDS` in `email.ts`).
- The proposal, follow-ups and outreach are written and sent by hand from Gmail templates; they are not part of the site.
- Logs never carry name, email, phone or message: the logs are not the inbox.

## Open

- Telegram notice on a new request: optional, not built.
- Whether partners should get a confirmation too.
