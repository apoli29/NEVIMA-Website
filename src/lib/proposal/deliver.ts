import "server-only";
import type { Lang } from "../i18n";
import { confirmationHtml, confirmationSubject, confirmationText, STUDIO_EMAIL, summaryOf } from "./email";
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
import { labelOf, type Answers, type Contact, type Estimate } from "./questions";

/* ==================================================================
   Where simulations and requests go

   A request goes to a Google Sheet through an Apps Script web app
   (docs/apps-script/pedidos.gs), which adds a row to the sheet's tab and
   mails the studio. Only when that worked is the request reported as
   delivered; then a proposal request's visitor gets a confirmation
   through Resend, in the language they used the site in. If the
   confirmation fails the request is still delivered: it is logged
   (without the visitor's details) and the studio replies as usual.

   When the sheet is not configured or does not answer, the request is
   reported as not delivered, so the form tells the visitor and offers to
   send it from their own email app. Nobody is left thinking a request
   reached the studio when it did not.

   Environment variables (set in Vercel, never in the repository):
   - APPS_SCRIPT_URL    the web app's /exec address
   - APPS_SCRIPT_TOKEN  the same secret as the script's TOKEN property
   - RESEND_API_KEY     optional: without it no confirmation is sent
   - MAIL_FROM          optional, defaults to "nevima <ola@nevima.studio>"
   - SITE_URL           optional, defaults to https://nevima.studio; the
                        confirmation loads the wordmark from it

   The sheet is the studio's own, read in Portuguese: its values are
   written in Portuguese whatever the visitor's language, which has a
   column of its own.

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

export async function recordSimulation(simulation: Simulation) {
  console.info("[nevima:simulation]", JSON.stringify(simulation));
}

function totalText(estimate: Estimate) {
  const { total } = estimate;
  return total ? (total.min === total.max ? `${total.min}` : `${total.min}–${total.max}`) : "sob consulta";
}

function timelineText(estimate: Estimate) {
  const { timeline } = estimate;
  if (!timeline) return "";
  return timeline.kind === "days" ? `${timeline.min}–${timeline.max} dias úteis` : "a combinar";
}

/** A proposal request as one flat object, so the script stays a plain
    list of columns. */
function proposalRow(request: ProposalRequest) {
  const { answers, contact, estimate } = request;
  const [services, who, country] = summaryOf(answers, "pt");
  return {
    kind: "proposal",
    at: request.at,
    origin: request.origin,
    lang: request.lang,
    name: contact.name,
    email: contact.email,
    phone: contact.phone,
    company: contact.company,
    services: services.value,
    sector: who.value,
    country: country.value,
    estimate: totalText(estimate),
    monthly: estimate.monthly ?? "",
    timeline: timelineText(estimate),
    message: contact.message,
    answers: JSON.stringify(answers),
  };
}

function partnerRow(request: PartnerRequest) {
  const { answers, contact } = request;
  const pt = (list: Parameters<typeof labelOf>[0], id: string) => labelOf(list, id, "pt");
  return {
    kind: "partner",
    at: request.at,
    lang: request.lang,
    name: contact.name,
    email: contact.email,
    phone: contact.phone,
    company: contact.company,
    project: pt(PROJECT_TYPES, answers.project),
    screens: pt(SCREENS, answers.screens),
    screensEstimate: answers.screensEstimate ?? "",
    inspiration: pt(PARTNER_YES_NO, answers.inspiration),
    inspirationLink: answers.inspirationLink ?? "",
    start: pt(STARTS, answers.start),
    delivery: pt(DELIVERIES, answers.delivery),
    model: pt(MODELS, answers.model),
    credit: pt(CREDITS, answers.credit),
    nda: answers.nda ? "Sim" : "Não",
    message: contact.message,
    answers: JSON.stringify(answers),
  };
}

async function writeToSheet(row: Record<string, unknown>): Promise<boolean> {
  const url = process.env.APPS_SCRIPT_URL;
  const token = process.env.APPS_SCRIPT_TOKEN;
  if (!url || !token) return false;
  try {
    const res = await fetch(url, {
      method: "POST",
      // The script reads the body as text; this type avoids a preflight.
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ ...row, token }),
      redirect: "follow",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      console.error("[nevima:sheet] status", res.status);
      return false;
    }
    const reply = (await res.json()) as { ok?: boolean; error?: string };
    if (!reply.ok) console.error("[nevima:sheet] refused", reply.error);
    return reply.ok === true;
  } catch (error) {
    console.error("[nevima:sheet] failed", error instanceof Error ? error.name : "error");
    return false;
  }
}

async function sendConfirmation(request: ProposalRequest) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  const siteUrl = (process.env.SITE_URL ?? "https://nevima.studio").replace(/\/$/, "");
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.MAIL_FROM ?? `nevima <${STUDIO_EMAIL}>`,
        to: [request.contact.email],
        reply_to: STUDIO_EMAIL,
        subject: confirmationSubject(request.lang),
        html: confirmationHtml(request.answers, request.contact, request.lang, siteUrl),
        text: confirmationText(request.answers, request.contact, request.lang),
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) console.error("[nevima:confirmation] status", res.status);
  } catch (error) {
    console.error("[nevima:confirmation] failed", error instanceof Error ? error.name : "error");
  }
}

/** True once the request has reached the studio. */
export async function deliverRequest(request: ProposalRequest): Promise<boolean> {
  if (!(await writeToSheet(proposalRow(request)))) {
    // Logged without the contact details: the logs are not the inbox.
    console.info(
      "[nevima:request:undelivered]",
      JSON.stringify({ at: request.at, lang: request.lang, answers: request.answers, estimate: request.estimate }),
    );
    return false;
  }
  await sendConfirmation(request);
  return true;
}

/** True once the request has reached the studio. No confirmation goes
    to a partner: we get in touch ourselves. */
export async function deliverPartner(request: PartnerRequest): Promise<boolean> {
  if (!(await writeToSheet(partnerRow(request)))) {
    console.info(
      "[nevima:partner:undelivered]",
      JSON.stringify({ at: request.at, lang: request.lang, answers: request.answers }),
    );
    return false;
  }
  return true;
}
