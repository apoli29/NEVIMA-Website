import "server-only";
import type { Lang } from "../i18n";
import { confirmationHtml, confirmationSubject, confirmationText, STUDIO_EMAIL, summaryOf } from "./email";
import { block, createPage, lastRequestSince, prop } from "./notion";
import {
  CREDITS,
  DELIVERIES,
  MODELS,
  PARTNER_YES_NO,
  PROJECT_TYPES,
  SCREENS,
  STARTS,
  type PartnerAnswers,
} from "./partner";
import { SERVICES, labelOf, type Answers, type Contact, type Estimate, type Range } from "./questions";

/* ==================================================================
   Where simulations and requests go

   A request becomes a page in a Notion database (notion.ts): proposal
   requests in one, partners in another. Only when that worked is the
   request reported as delivered. Then the studio gets a notice by email
   with a link to the page, and a proposal request's visitor gets a
   confirmation, both through Resend. If either email fails the request
   is still delivered: it is logged (without the visitor's details) and
   the page is in Notion.

   When Notion is not configured or does not answer, the request is
   reported as not delivered, so the form tells the visitor and offers to
   send it from their own email app. Nobody is left thinking a request
   reached the studio when it did not.

   Environment variables (set in Vercel, never in the repository):
   - NOTION_TOKEN         the integration's secret
   - NOTION_FORM1_LEADS   the proposals database's id (proposal requests)
   - NOTION_FORM2_LEADS   the partners database's id
   - REPEAT_ALLOWED_EMAILS_FORMS optional: addresses that may send more than
                          one request in 24 hours (commas between them)
   - RESEND_API_KEY       optional: without it no email is sent
   - MAIL_FROM            optional, defaults to "nevima <ola@nevima.studio>"
   - NOTIFY_TO            optional, where the notices go (commas between
                          addresses), defaults to ola@nevima.studio
   - SITE_URL             optional, defaults to https://nevima.studio; the
                          emails load their images from it, and the
                          invitation's links point at it
   - STUDIO_KEY           the key to the studio's composer, /interno
                          (src/lib/proposal/studio.ts)
   - LINKS_SECRET         signs the invitation's time links (meeting.ts)

   Notion is the studio's own, read in Portuguese: its values are written
   in Portuguese whatever the visitor's language, which has a property of
   its own. The databases are made by scripts/setup-notion.mjs, and the
   names of the properties below must stay as it makes them.

   Each simulation is written to the server log as one JSON line, tagged
   [nevima:simulation]. It is anonymous: the answers and the estimate, no
   name, email, phone or IP.
   ================================================================== */

/** Which form on the site the request came from. */
export type Origin = "page" | "overlay" | "other";

export type Simulation = {
  at: string;
  answers: Answers;
  estimate: Estimate;
};

/** With the language the visitor used the site in, to reply in it. */
export type ProposalRequest = Simulation & { contact: Contact; lang: Lang; origin: Origin };

/** A development company asking to work with us on a front end. */
export type PartnerRequest = { at: string; lang: Lang; answers: PartnerAnswers; contact: Contact };

const TIMEOUT_MS = 10_000;

/** The language picked for the reply, as the studio reads it in a notice. */
const REPLY_IN: Record<Lang, string> = { pt: "português", en: "inglês" };

export async function recordSimulation(simulation: Simulation) {
  console.info("[nevima:simulation]", JSON.stringify(simulation));
}

const range = ({ min, max }: Range) => (min === max ? `${min}` : `${min}–${max}`);

function totalText(estimate: Estimate) {
  return estimate.total ? range(estimate.total) : "sob consulta";
}

function timelineText(estimate: Estimate) {
  const { timeline } = estimate;
  if (!timeline) return "";
  return timeline.kind === "days" ? `${timeline.min}–${timeline.max} dias úteis` : "a combinar";
}

/** The estimate, line by line, as the visitor was shown it. */
function estimateLines(estimate: Estimate) {
  const lines = estimate.lines.map(
    (line) => `${line.label}: ${range(line.amount)} €${line.monthly ? ` + ${line.monthly} €/mês` : ""}`,
  );
  const onRequest = estimate.onRequest.map((item) => `Sob consulta: ${item.label}`);
  return [...lines, ...onRequest];
}

function proposalPage(request: ProposalRequest) {
  const { answers, contact, estimate } = request;
  const [, who, country] = summaryOf(answers, "pt");
  const lines = estimateLines(estimate);
  return {
    properties: {
      Nome: prop.title(contact.name),
      Estado: prop.select("Novo"),
      Email: prop.email(contact.email.toLowerCase()),
      Telefone: prop.phone(contact.phone),
      Empresa: prop.text(contact.company),
      "Serviços": prop.multi(answers.services.map((id) => labelOf(SERVICES, id, "pt"))),
      Setor: prop.select(who.value),
      "País": prop.select(country.value),
      Estimativa: prop.text(totalText(estimate)),
      "Mensal (€)": prop.number(estimate.monthly),
      Prazo: prop.text(timelineText(estimate)),
      Mensagem: prop.text(contact.message),
      Idioma: prop.select(request.lang),
      Origem: prop.select(request.origin),
      Recebido: prop.date(request.at),
    },
    children: [
      // Where the studio writes up the business before the call, and what
      // it will bring to it (user, 2026-10-27): the three things the call
      // goes over. The values X and Y are properties above.
      block.heading("Preparação da reunião"),
      block.subheading("O negócio do cliente"),
      block.blank(),
      block.subheading("Escolhas a rever (podem ser desnecessárias)"),
      block.blank(),
      block.subheading("O que não escolheu e pode fazer sentido"),
      block.blank(),
      ...(lines.length ? [block.heading("Estimativa mostrada"), ...lines.map(block.bullet)] : []),
      block.heading("Respostas"),
      block.json(JSON.stringify(answers, null, 2)),
    ],
  };
}

function partnerPage(request: PartnerRequest) {
  const { answers, contact } = request;
  const pt = (list: Parameters<typeof labelOf>[0], id: string) => labelOf(list, id, "pt");
  return {
    properties: {
      Nome: prop.title(contact.name),
      Estado: prop.select("Novo"),
      Email: prop.email(contact.email.toLowerCase()),
      Telefone: prop.phone(contact.phone),
      Empresa: prop.text(contact.company),
      Projeto: prop.select(pt(PROJECT_TYPES, answers.project)),
      "Ecrãs": prop.select(pt(SCREENS, answers.screens)),
      "Ecrãs (estimativa)": prop.text(answers.screensEstimate ?? ""),
      "Inspiração": prop.select(pt(PARTNER_YES_NO, answers.inspiration)),
      Link: prop.text(answers.inspirationLink ?? ""),
      "Início": prop.select(pt(STARTS, answers.start)),
      Entrega: prop.select(pt(DELIVERIES, answers.delivery)),
      Modelo: prop.select(pt(MODELS, answers.model)),
      "Crédito": prop.select(pt(CREDITS, answers.credit)),
      NDA: prop.checkbox(answers.nda),
      Mensagem: prop.text(contact.message),
      Idioma: prop.select(request.lang),
      Recebido: prop.date(request.at),
    },
    children: [block.heading("Respostas"), block.json(JSON.stringify(answers, null, 2))],
  };
}

export type Mail = {
  to: string[];
  bcc?: string[];
  reply_to?: string;
  subject: string;
  text: string;
  html?: string;
  /** Files, their content in base64. */
  attachments?: { filename: string; content: string }[];
};

/** Sends through Resend. True once Resend took it. */
export async function sendEmail(mail: Mail): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.MAIL_FROM ?? `nevima <${STUDIO_EMAIL}>`, ...mail }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) console.error("[nevima:email] status", res.status);
    return res.ok;
  } catch (error) {
    console.error("[nevima:email] failed", error instanceof Error ? error.name : "error");
    return false;
  }
}

/** Where the studio's notices go: NOTIFY_TO, or the studio's address. */
export const studioInbox = () =>
  (process.env.NOTIFY_TO ?? STUDIO_EMAIL)
    .split(",")
    .map((address) => address.trim())
    .filter(Boolean);

/** Where the emails' images and links point. Running locally without
    SITE_URL, the local server itself, on whatever port it took. */
export const siteUrl = () =>
  (
    process.env.SITE_URL ??
    (process.env.NODE_ENV === "development" ? `http://localhost:${process.env.PORT ?? 3000}` : "https://nevima.studio")
  ).replace(/\/$/, "");

/** The notice to the studio: who wrote, and the page in Notion. Replying
    to it answers the visitor. */
function notify(subject: string, lines: string[], page: string, contact: Contact) {
  return sendEmail({
    to: studioInbox(),
    reply_to: contact.email,
    subject,
    text: [
      `Nome: ${contact.name}`,
      `Email: ${contact.email}`,
      `Telefone: ${contact.phone}`,
      ...(contact.company ? [`Empresa: ${contact.company}`] : []),
      "",
      ...lines,
      "",
      "Mensagem:",
      contact.message || "(sem mensagem)",
      "",
      page ? `No Notion: ${page}` : "",
    ].join("\n"),
  });
}

/** One request per email address in this long, in each database (user,
    2026-10-27): so a visitor who has just sent one is not asked to wait
    for nothing, and a list of requests is not filled by one person. */
const REPEAT_WINDOW_MS = 24 * 60 * 60 * 1000;

/** Addresses the limit does not apply to, for trying the forms out:
    REPEAT_ALLOWED_EMAILS_FORMS in Vercel, commas between them. Kept out of the
    repository on purpose. */
function exempt(email: string) {
  return (process.env.REPEAT_ALLOWED_EMAILS_FORMS ?? "")
    .split(",")
    .some((allowed) => allowed.trim().toLowerCase() === email);
}

/** How long, in milliseconds, this email must still wait before it may
    send another request of this kind; 0 when it may send one now. */
export async function waitBefore(kind: "proposal" | "partner", email: string): Promise<number> {
  const address = email.trim().toLowerCase();
  if (exempt(address)) return 0;
  const database = kind === "proposal" ? process.env.NOTION_FORM1_LEADS : process.env.NOTION_FORM2_LEADS;
  const since = new Date(Date.now() - REPEAT_WINDOW_MS).toISOString();
  const last = await lastRequestSince(database, address, since);
  if (!last) return 0;
  return Math.max(0, new Date(last).getTime() + REPEAT_WINDOW_MS - Date.now());
}

/** True once the request has reached the studio. */
export async function deliverRequest(request: ProposalRequest): Promise<boolean> {
  const { properties, children } = proposalPage(request);
  const page = await createPage(process.env.NOTION_FORM1_LEADS, properties, children);
  if (page === null) {
    // Logged without the contact details: the logs are not the inbox.
    console.info(
      "[nevima:request:undelivered]",
      JSON.stringify({ at: request.at, lang: request.lang, answers: request.answers, estimate: request.estimate }),
    );
    return false;
  }

  const { answers, contact, estimate } = request;
  const [services, who, country] = summaryOf(answers, "pt");
  await Promise.all([
    notify(
      `Novo pedido: ${contact.name}${contact.company ? ` (${contact.company})` : ""}`,
      [
        `${services.label}: ${services.value}`,
        `${who.label}: ${who.value} · ${country.label}: ${country.value}`,
        `Estimativa: ${totalText(estimate)} €${estimate.monthly ? ` + ${estimate.monthly} €/mês` : ""}`,
        `Prazo: ${timelineText(estimate)}`,
        `Origem: ${request.origin} · Responder em: ${REPLY_IN[request.lang]}`,
      ],
      page,
      contact,
    ),
    sendEmail({
      to: [contact.email],
      reply_to: STUDIO_EMAIL,
      subject: confirmationSubject(request.lang),
      html: confirmationHtml(contact, request.lang, siteUrl()),
      text: confirmationText(contact, request.lang),
    }),
  ]);
  return true;
}

/** True once the request has reached the studio. No confirmation goes
    to a partner: we get in touch ourselves. */
export async function deliverPartner(request: PartnerRequest): Promise<boolean> {
  const { properties, children } = partnerPage(request);
  const page = await createPage(process.env.NOTION_FORM2_LEADS, properties, children);
  if (page === null) {
    console.info(
      "[nevima:partner:undelivered]",
      JSON.stringify({ at: request.at, lang: request.lang, answers: request.answers }),
    );
    return false;
  }

  const { answers, contact } = request;
  const pt = (list: Parameters<typeof labelOf>[0], id: string) => labelOf(list, id, "pt");
  await notify(
    `Novo parceiro: ${contact.company || contact.name}`,
    [
      `Projeto: ${pt(PROJECT_TYPES, answers.project)} · Ecrãs: ${pt(SCREENS, answers.screens)}`,
      `Início: ${pt(STARTS, answers.start)} · Entrega: ${pt(DELIVERIES, answers.delivery)}`,
      `Modelo: ${pt(MODELS, answers.model)} · Crédito: ${pt(CREDITS, answers.credit)} · NDA: ${answers.nda ? "Sim" : "Não"}`,
      `Responder em: ${REPLY_IN[request.lang]}`,
    ],
    page,
    contact,
  );
  return true;
}
