# Backend: where the forms' answers go

Decided 2026-10-26, changed 2026-10-27 (user), free tools only.

## Flow

1. A form (the bar's overlay, the page's `inline-proposal`, the partners' form) posts to `/api/proposal` or `/api/partner`. The route checks everything again and works the estimate out on the server.
2. `deliverRequest` / `deliverPartner` (`src/lib/proposal/deliver.ts`) make a page in a Notion database (`src/lib/proposal/notion.ts`): "Pedidos" for proposals, "Parceiros" for partners. The answers are the page's properties; the estimate's lines and the raw answers are in the page.
3. Only when Notion took it is the request "delivered". Otherwise the form says so and offers the visitor's own email app (503 `not_configured`).
4. Then, through Resend: a notice to the studio (`ola@nevima.studio`, with the link to the page; replying to it answers the visitor), and, for a proposal request, a confirmation to the visitor (`src/lib/proposal/email.ts`) in the language they used the site in. A failed email never fails the request: the page is in Notion, and its "Alertas" says which email did not go (user, 2026-10-31; the same for the notices about a booked call and the mid-project answer, and the composer's search shows them). Partners get no confirmation: we get in touch ourselves.

## Setup

1. notion.so/my-integrations: a new internal integration; its secret is `NOTION_TOKEN`.
2. An empty Notion page, shared with the integration (••• > Connections).
3. `.env.local` (never committed): `NOTION_TOKEN` and `NOTION_PARENT` (the page's address). Then `npx tsx --env-file=.env.local scripts/setup-notion.mjs` makes the two databases and prints their ids. Run it once: twice makes them twice. (It runs with `tsx` since 2026-11-09, because it reads the steps' catalogue, `src/lib/proposal/steps.ts`.)
4. Vercel, Production: `NOTION_TOKEN`, `NOTION_FORM1_LEADS` (proposal requests: "Pedidos"), `NOTION_FORM2_LEADS` (partners: "Parceiros"), `RESEND_API_KEY`; optional `MAIL_FROM` (default `nevima <ola@nevima.studio>`), `NOTIFY_TO` (commas between addresses), `SITE_URL` (default `https://nevima.studio`, where the email's wordmark loads from: `public/email/wordmark.png`). Then redeploy.

The properties' names are in two places that must change together: `scripts/setup-notion.mjs` and `deliver.ts`. The columns of "Pedidos" are the exception: their names, options and order are in one catalogue, `src/lib/proposal/steps.ts`, that both read (since 2026-11-09, the client's, the project's and the steps').

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
- "Reunião" (date and time) in both. In "Pedidos" only: "Valor Y (cliente)", "Valor X (sugestões)", "Valor final" (euros); "Contrato enviado" (a tick) until 2026-11-09, when it became the select "Contrato". "Estimativa", filled by the site, stays beside them as what the client was shown.
- Each new page in "Pedidos" opens with "Preparação da reunião": three headings to write under (the business; choices to review; what was not chosen and may make sense). Written notes read better in the page than in a cell. Pages made before this have no such headings.
- `scripts/setup-notion.mjs` now also updates a database whose id is in `.env.local`: adds the properties it lacks and puts the states in order, keeping their ids and any option made by hand. Nothing is removed and no request is touched.

Still open: the form's wording still promises "a final proposal"; to be changed to the meeting. (The confirmation email no longer promises the proposal by email: it was rewritten on 2026-10-29.)

## The studio's emails (user, 2026-10-29)

Three emails, one look (`src/lib/proposal/mail.ts`), black as the site's footer (user, 2026-10-29, replacing a first white version): white type, ash for what is secondary, dark hairlines. The footer's light is held still in two pictures 1600px wide (`public/email/light-head.jpg` and `light-foot.jpg`, drawn by `scripts/email-light.mjs` from the same field as `liquid-lens.tsx`, at twice the size and averaged down, with a fine grain against banding). They lie on the email's whole black background, not in its 600px column (user, 2026-10-30: no block may show where it ends), so the light reaches out on both sides and fades into the black before any edge: one behind the top (the wordmark, a mono label in a hairline box, the greeting set large), one behind the foot, where the wordmark (`wordmark-glow.png`, with a glow of its own that fades out before the picture's edge) sits in it. The letter between is plain black, and where images are off or background images are not drawn (Outlook on Windows) it is all plain black. The buttons are the bar's crate turned inside out, as it turns when pointed at: white, the arrow in a black key. Phones are boxed mono chips that call. Tables and inline styles only; Satoshi, Instrument Sans and Geist Mono where the mail app loads web fonts (Apple Mail, iOS), Helvetica and the system's monospace elsewhere (Gmail). The images are in `public/email/`, loaded from `SITE_URL`. Every email has a plain-text version and both languages.

1. **Confirmation** (`email.ts`): automatic, always the same, sent the moment a request is in Notion. The studio's words, with two sentences that repeated each other merged into one. It no longer lists the answers: the studio's text is the whole email.
2. **Invitation to the call** (`invite.ts`): "we have a proposal", a call of 20 to 30 minutes, and two times as buttons, in Lisbon time. A click opens the meeting page (`/meeting`, `/pt/meeting`, `src/components/meeting.tsx`), which shows the time and asks for one more click to book it, so a mail scanner opening the link books nothing. Booking sets "Reunião" (Lisbon time) and "Reunião marcada" in Notion and sends the studio a notice; choosing again moves it, and the studio is told. A request already at "Reunião feita", "Proposta enviada", "Ganho" or "Perdido" keeps its state (user, 2026-10-31). Once booked, the page offers a calendar file. Without a company (personal use) the call is only "to get to know each other".
3. **Final proposal and contract** (`offer.ts`): after the call, in the studio's words (user, 2026-10-30). An optional paragraph is written in the composer; the final value (and a monthly one) is set large with the VAT note ("Isento de IVA (art. 53.º do Código do IVA)", as the contract says it), the contract goes as a PDF attachment, named in the email, and the materials still to come go in a box the studio writes, shown even when empty (user, 2026-10-31). Two buttons ask whether the client wants the call midway through the project, which is optional: they lead to `/mid-call` (`src/components/mid-call.tsx`), where one more click records "Sim" or "Não" in the Notion property "Reunião a meio" and tells the studio, who emails to set a date. The last answer holds. So this email now needs a linked Notion request and `LINKS_SECRET`.

In the studio's emails the conversations with the client are all "chamada" (user, 2026-10-30); the Notion column kept its name, "Reunião a meio", until 2026-11-09, when it became "Chamada de acompanhamento". The invitation and the proposal are signed by one of the partners, chosen in the composer; the automatic confirmation by the studio. In the invitation the studio's "conhecermos o X melhor" was recast as "nos conhecermos melhor": the form does not ask for a gender, so the "o" or "a" before a name cannot be chosen safely.

The meeting page is a single screen like the portfolio: it is reached only from the email, so it has no bar, no `WorkTogether` and no footer, only a black foot with the wordmark. It keeps the site's rule and never addresses the reader.

### The composer: `/interno`

Not linked from anywhere, out of search engines, Portuguese only. Its first tab, "Como funciona" (`src/components/studio-guide.tsx`, user 2026-10-30), explains the whole process to a partner opening it for the first time (made more detailed the same day, user): every app involved (the site, Vercel, Notion, Resend, Gmail, Hostinger, the client's email and calendar, the video call) and what each is for; the three circuits they make between them (a request arriving, an email sent from here, the client booking the call); and each step from the form to the signed contract, with who does it (Cliente, Automático, Estúdio), the apps it uses, what happens behind it and what it changes in Notion; then the two ways to send and the limits. It opens with a simple version of the process, and after the steps comes every detail of the back end (user, 2026-10-31): what pressing "Enviar" does, who can reach what, failures, who writes what in Notion, security, numbers, the keys, the routes and where data stays. A first visit in a browser opens on it, later ones on the invitation. When the process changes, change the guide with this file. One key for both partners (`STUDIO_KEY`); the cookie holds a hash of it for 30 days. The client's email finds the latest request in "Pedidos" and fills the name, company and language (all editable); a Notion page link can be pasted instead. The preview is the email itself, drawn from the same code the server sends.

- **Enviar** sends it through Resend from `MAIL_FROM`, to the client, with a hidden copy to `NOTIFY_TO` (so it is in Gmail too, where the reply lands) and replies to `ola@nevima.studio`. Then Notion: the invitation moves "Novo" to "Contactado"; the proposal sets "Proposta enviada", "Valor final" and, with a contract attached, "Contrato enviado".
- **Copiar para o Gmail** copies the finished email, links signed, to paste into a new Gmail message. Notion is then updated by hand.

Limits:

- Resend's free plan: 100 emails a day, 3000 a month, counting the automatic confirmations and notices.
- Sending from `ola@nevima.studio` needs the domain verified in Resend (DNS records at Hostinger). Until then Resend refuses, and "Copiar para o Gmail" is the way.
- What is sent from the composer is not in Gmail's "Sent": the hidden copy in the inbox stands for it.
- The contract: one PDF of at most 4 MB (Vercel takes no larger request).
- One shared key, no accounts: it keeps out the curious. Changing `STUDIO_KEY` closes every session.
- The door never does nothing (2026-11-03, after a partner typed the key and saw no change). The session cookie is `SameSite=Lax`, not `Strict`: with `Strict`, opening `/interno` from a link (WhatsApp, an email, Notion) sent no cookie, and neither did the reload after a right key, so the door came back with no word. `Lax` still keeps the cookie off POSTs from other sites. After a right key the page asks `GET /api/studio/login` whether the session stuck and says so when the browser refused it; the key is read from the field itself (password-manager fills count); "A entrar…" shows while it waits, and a lost connection has its own message. Without the page's script the same form posts as a plain form and comes back to `/interno`, with the cookie or with `?porta=<reason>`.
- The time links are signed with `LINKS_SECRET` and carry only the Notion page's id and the two times, never a name or an address. Changing `LINKS_SECRET` breaks every link already sent.
- The page does not stop two clients from taking the same time: the studio offers each one its own times.

Vercel, Production, to add: `STUDIO_KEY` (long), `LINKS_SECRET` (long and random), and `SITE_URL` set to the address the site is really on (while nevima.studio is parked, the Vercel address, or the emails' images and links do not load). Locally, the `nevima-dev-emails` launch configuration runs the site with test keys and no Resend key, so nothing is sent.

Still open:

- Whether the client should also get an email once the call is booked; for now the page confirms it and the studio sends the call's link by hand.
- At the end of the form, "Contact us now?" with the two phones (asked 2026-10-29, not built).
- Outreach emails to potential clients, for leads (asked 2026-10-29, not built).

## SQL Server: a copy of every request (user, 2026-11-01)

Beside Notion, not instead of it: Notion stays where the studio works on a request (states, the meeting, the composer, the 24-hour check), and an Azure SQL database keeps every request as a record that SQL queries can be run on: proposal requests since 2026-11-01, partner requests too since 2026-11-02 (user).

- **Where:** Azure for Students, Azure SQL Database free offer (serverless, paused until next month when the free amount runs out, so nothing is ever charged). Server `nevima-rg-de` in Germany West Central, database `Nevima`, resource group `nevima-rg`. The subscription may only deploy in a few regions (Azure Policy "Allowed resource deployment regions"), and the free offer is not available in Spain Central, where a first, empty server `nevima-sql` was made and then deleted (user, 2026-11-03).
- **Schema:** `scripts/sql/nevima-db.sql`, run whole in the `Nevima` database (VS Code with the SQL Server (mssql) extension, signed in as the server admin). It can be run again: it makes what is missing, adds new columns and updates the procedure and the view, deleting nothing. Partner requests go to `PedidosParceria` (contact, each answer in a column, the raw answers as JSON). One row per proposal request in `PedidosProposta` (contact, every answer in a column of its own, the estimate, and the raw answers as JSON), one row per choice in `PedidoServicos`, `PedidoIdiomas` and `PedidoFuncionalidades`, and `vw_PedidosResumo` to read them.
- **Writing:** `src/lib/proposal/sql.ts`, called from `/api/proposal` and `/api/partner` through `after()`, once the visitor has their answer, so the database never makes anyone wait and never decides whether a request was delivered (Notion still does). The free database pauses when unused and refuses the first connection while it wakes: a refused write is tried again after 20, 40 and 60 seconds (`maxDuration` 240; Hobby with Fluid compute allows 300). Until 2026-11-09 there was one retry after 20 seconds, and a request sent in the evening after a quiet afternoon reached Notion and not SQL: Microsoft gives "about one minute" for a paused database to wake. A request missing from SQL is put back by hand: its Notion page keeps the raw answers under "Respostas" (see **Putting back a missing request**). Failures reach the log as `[nevima:sql]` with the error's code only, never the visitor's details.
- **Access:** the site signs in as `nevima_site`, a contained database user that may only run `dbo.usp_InserirPedidoProposta` and `dbo.usp_InserirPedidoParceria`: it cannot read, change or delete anything. The script grants both every time it runs, once the user exists. The firewall allows every address (Vercel's change from request to request), so the protection is the encrypted connection and that user's password. Reading and deleting is done with the admin account, from the partners' own computers (their IP addresses are added to the firewall).
- **No fixed lists in the tables (2026-11-05):** the client kind (`Publico`) had a CHECK limiting it to business and personal; when the form gained non-profit associations, such a request would have been refused by SQL and kept only in Notion. The CHECK was dropped: a new option in the form must never stop a row being written. The words for each option come from `dbo.Rotulos` instead.
- **Reading (user, 2026-11-05):** `SELECT * FROM dbo.vw_Pedidos ORDER BY Id DESC` and `dbo.vw_Parcerias` list the requests in Portuguese (Lisbon time, the services and the estimate written out); `EXEC dbo.Ficha <Id>` and `EXEC dbo.FichaParceria <Id>` show one request question by question, read from its raw answers, so a new question shows up without a new column. The words come from `dbo.Rotulos`, written from the form's own lists by `npx tsx scripts/sql/rotulos.ts` (run it after changing an option, then run the script again); the questions' names and groups are in `dbo.Perguntas`, in the script. A question added to the form needs its line there to appear in the ficha.
- **Vercel, Production:** `MSSQL_SERVER` (`nevima-rg-de.database.windows.net`), `MSSQL_DATABASE` (`Nevima`), `MSSQL_USER` (`nevima_site`), `MSSQL_PASSWORD`. Without all four nothing is written and nothing fails.

**Putting back a missing request** (as the admin, in a New Query on the Nevima database): copy the JSON under "Respostas" in its Notion page and the contact from the page's properties, then

```sql
DECLARE @Id INT;
EXEC dbo.usp_InserirPedidoProposta            -- dbo.usp_InserirPedidoParceria for a partner
    @Respostas = N'<the JSON from Notion; every ' doubled as ''>',
    @Contacto  = N'{"name":"…","email":"…","phone":"…","company":"…","message":"…"}',
    @Idioma    = 'pt',
    @Origem    = 'other',                       -- not for partners
    @NovoId    = @Id OUTPUT;
UPDATE dbo.PedidosProposta SET CriadoEm = '<Recebido in Notion, in UTC>' WHERE Id = @Id;
EXEC dbo.Ficha @Id;
```

The estimate is not in the JSON, so its columns stay empty for a request put back this way.

Open:

- The privacy policy (`src/lib/legal/privacy.ts`) does not name Microsoft (Azure) among those who receive data, nor Notion or Resend, and still says requests go by email until direct sending is active. To be updated by the partners, in both languages.
- Requests that do not lead to a contract are deleted after 3 months (privacy policy): that now includes their rows in SQL Server (`DELETE FROM dbo.PedidosProposta WHERE Id = …` deletes the choices with them).

## Client tracking, phase 1: a state per step (2026-11-09)

The plan is `docs/client-tracking-plan.md` (and `.pdf`); its section 8 is what phase 1 built. Each step of the process, from the form to the final payment, is a column of its own on the request's row in "Pedidos", with its own states, so one row shows where a client is.

- **One catalogue:** `src/lib/proposal/steps.ts` (no `server-only`, so the script can read it): every step's column (select, date, link, text, tick or formula) with its options and colours, the formulas, the states of "Estado" ("Em projeto" and "Concluído" added, "Pedidos" only: "Parceiros" keeps its states), what a request starts with, what sending the proposal opens, `PAST_BOOKING`, and the history's format.
- **The script** (`scripts/setup-notion.mjs`, with `tsx`): adds the columns a database lacks, then the formulas in a second call; adds the missing options to the steps' selects ("Reunião a meio" gains "Por responder") and to "Estado", always resending the options already there with their ids, so no request loses its value. `--ver` writes nothing and lists what it would add, with how many requests hold each state; `--ensaio` makes a trial "Pedidos (ensaio)" (`--sem-passos`: one with the columns from before); `--base=<id>` updates only that database; `--formulas` resends the formulas.
- **What the site writes** (`notion.ts` `setSteps`, always in a change of its own after what it wrote before, so the steps never stand in the way of what the client or the studio did):
  - a new request: the starting states (Preparação da chamada Por iniciar, Convite Não enviado, Link da chamada Aguarda marcação, Chamada realizada Por efetuar, Proposta Por enviar) and "Histórico". If Notion refuses the page with them (a database without the columns), it is made again without them and the log says `[nevima:notion] sem os passos`;
  - after the two emails: "Confirmação" Enviada or Falhou;
  - the invitation sent from `/interno`: "Convite" Enviado, "Marcação" A aguardar resposta (only "Convite" past the booking);
  - a time booked: "Marcação" Agendada, "Link da chamada" Por enviar (past the booking, only the history line); if that change fails, "Alertas" says "Marcação por atualizar à mão";
  - the proposal sent from `/interno`: "Proposta" Enviada, "Válida até" (today in Lisbon plus 10 days), and, only where still empty, "Reunião a meio" Por responder, "Contrato assinado" Por receber, "Sinal de 25%" Por pedir, "Documento do sinal" Por emitir, "Materiais" Por receber: sending it again takes nothing back;
  - the answer about the follow-up call: a line in "Histórico".
- **"Histórico":** one line per event, `09/11 17:32 · Convite enviado (António)`, on Lisbon's clock, the newest last, the oldest cut past 6000 characters. Who: the partner who signs (first name), "cliente" or "site".
- The composer says "O Notion foi atualizado" only when both changes (the state and the steps) went through.
- `PAST_BOOKING` (a booking never takes a request back from these) now also holds "Em projeto" and "Concluído".
- **Formulas:** "Chamada" writes the weekday and the month in Portuguese itself ("Qui 26 nov, 15:00"), because Notion's `formatDate` writes them in English; "Valor do sinal" writes "612,63 €" with a comma. Read through the API, a formula is worked out in UTC: a summer call shows one hour early there. In the Notion app it should show the viewer's time; to be confirmed in the app with a summer date. Anything that reads the call's time by API (the daily summary, phase 4) reads "Reunião", not the formula.
- Everything else (the steps after the contract, the views, "Ocultar quando vazia", "Responsável", "Motivo de perda", "Spam ou teste") is by hand in Notion.

The columns' order in "Pedidos" (user, 2026-11-09): where the client is (Nome, Estado, Etapa atual, Responsável, Alertas), then what the form brought, then the steps in the order of the process. It is `COLUMN_ORDER` in `steps.ts`, shown in the guide; Notion's API cannot order columns, so the partners drag them by hand.

SQL Server needs no change for this (checked 2026-11-09): the copy keeps what the form brought and never reads or writes Notion, so the new columns neither reach nor break it. The tracking stays in Notion only. The SQL tables' own `Estado` column stays at `novo`: nothing updates it, and it is not the request's state.

Not in phase 1: the invitation's third choice ("contactar-nos"), the "Link da chamada" email, the daily summary, the Google Calendar trial (phases 2 to 5 of the plan).

## "Pedidos" tidied: client, project, follow-up (2026-11-09)

The table had grown to 53 columns, some repeating each other, five of them formulas, and it did not show the project: the form's answers were only in each page's body, as JSON. The user asked for one table in three parts, in this order: the client, the client's project, then the lead's follow-up from the first contact to the signed contract, every step a choice of options (no formula). The names, options and order are in `src/lib/proposal/steps.ts` (`CLIENT_COLUMNS`, `PROJECT_COLUMNS`, `STEP_COLUMNS`, `COLUMN_ORDER`); the plan's tables (`docs/client-tracking-plan.md`, sections 3 and 8.3) are the history of how it got here.

- **The project, a column per answer** (`projectProperties` in `deliver.ts`, sent with the starting steps, so a database without the columns still gets the request): Tipo de site, N.º de páginas, Páginas e secções, Outras páginas, Design, Idiomas do site, Funcionalidades, Emails dos formulários, Textos prontos, Referências, Tem domínio, Urgente, Sessão fotográfica, Local da sessão, SEO e GEO, Alcance, Site atual. The kinds of page have short names without commas (`PAGE_TYPE_NAMES`), because Notion's options cannot hold one. A question not asked leaves its column empty. The six requests already in "Pedidos" were filled the same way, from the JSON in their pages. The JSON stays in each page, under "Respostas".
- **Merged:** "Convite" and "Link da chamada" into "Marcação" (Convite por enviar, A aguardar resposta, Vai contactar-nos, Agendada, Link enviado); "Contrato enviado" and "Contrato assinado" into "Contrato" (Por enviar, Enviado, Assinado); "Reunião a meio" became "Chamada de acompanhamento" (Por responder, Sim, Não).
- **Removed:** the five formulas ("Chamada" repeated "Marcação" and "Reunião"; "Etapa atual" repeated "Estado"; "Valor do sinal", "Materiais até" and "Pagamento até" were after the contract); "Confirmação" ("Alertas" already says when it did not go, and "Histórico" when it did); "Origem" (technical, in English: it stays in the studio's notice); and every step after the contract (deposit, materials, validation call, invoices, payment, receipt, launch, with their dates), with "Em projeto" and "Concluído" in "Estado". The lead ends at "Contrato" Assinado and "Ganho"; what comes after will have a table of its own, like the monthly services (the plan's section 7).
- **What the site writes now:** on arrival, Preparação da chamada Por iniciar, Marcação Convite por enviar, Chamada realizada Por efetuar, Proposta Por enviar; the invitation, Marcação A aguardar resposta; a booking, Marcação Agendada; the proposal, Proposta Enviada, Válida até, Contrato Enviado (with the PDF; without it, Por enviar where still empty; a signed contract is never taken back) and Chamada de acompanhamento Por responder where still empty; the client's answer, Sim or Não there.
- **The script:** `--limpar` moves what the old columns hold into the new ones (`MOVED`, only where those are empty), cuts each select to its options and those still in use, and deletes `REMOVED_COLUMNS`. It runs only once the site that no longer writes those columns is live: the site before it writes "Origem" with every request, and Notion refuses a page with a column it does not have, so the request would not arrive. `--ver` shows what it would move and delete, and how many requests hold a value in each column to delete.
- **Order:** "Estado" sits beside the name (user), so a wide table still shows where each lead is; then the client, the project and the follow-up. Notion's API cannot order columns: they are dragged by hand, following the list in the guide.
