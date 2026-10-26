import "server-only";
import type { Lang } from "../i18n";
import { AUDIENCES, COUNTRIES, SECTORS, SERVICES, labelOf, type Answers, type Contact } from "./questions";

/* ==================================================================
   The email the visitor gets once the request has reached the studio

   Built as a string of table markup with inline styles, because mail
   apps ignore most of what a web page can do: no web fonts, no CSS
   files, no SVG. The identity is monochrome, so is this: a black band
   with the wordmark, white paper, black type, ash for what is secondary.
   A plain-text version goes with it.

   In the language the visitor used the site in. The Portuguese keeps to
   the site's rule: the reader is never addressed as "tu" or "você", so
   the sentences are impersonal or from the studio's side.

   Nothing in it promises a delay: the studio has not fixed one. When it
   does, say it after the first paragraph, in both languages.
   ================================================================== */

export const STUDIO_EMAIL = "ola@nevima.studio";

const INK = "#000000";
const ASH = "#55534f";
const HAIR = "#e6e5e2";
const FONT = "'Helvetica Neue',Helvetica,Arial,sans-serif";

type Words = {
  subject: string;
  hi: (name: string) => string;
  received: string;
  where: string;
  told: string;
  reply: string;
  why: string;
  use: string;
  business: string;
  country: string;
  services: string;
};

const WORDS: Record<Lang, Words> = {
  en: {
    subject: "We have your request",
    hi: (name) => `Hi ${name},`,
    received: "Your request reached us. Two people read it, and one of us writes your proposal from your answers.",
    where: "The proposal comes to this email address.",
    told: "What you told us",
    reply: "If something changed, or you forgot to mention it, reply to this email. It comes straight to us.",
    why: "You are getting this because you asked for a proposal on our website. We use your details only to answer that request.",
    use: "Use",
    business: "Business",
    country: "Country",
    services: "Services",
  },
  pt: {
    subject: "Recebemos o pedido de proposta",
    hi: (name) => `Olá ${name},`,
    received: "O pedido chegou. É lido por duas pessoas e uma de nós escreve a proposta a partir das respostas.",
    where: "A proposta chega a este endereço de email.",
    told: "O que nos foi indicado",
    reply: "Se algo mudou, ou ficou por dizer, basta responder a este email. A resposta chega diretamente a nós.",
    why: "Este email foi enviado porque foi pedida uma proposta no nosso site. Os dados são usados apenas para responder a esse pedido.",
    use: "Utilização",
    business: "Negócio",
    country: "País",
    services: "Serviços",
  },
};

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const confirmationSubject = (lang: Lang) => WORDS[lang].subject;

/** What the visitor chose, in the words the form used, in a language. */
export function summaryOf(answers: Answers, lang: Lang) {
  const w = WORDS[lang];
  const services = answers.services.map((id) => labelOf(SERVICES, id, lang)).join(", ");
  const country =
    answers.country === "other" ? (answers.countryOther ?? labelOf(COUNTRIES, "other", lang)) : labelOf(COUNTRIES, answers.country, lang);
  const who =
    answers.audience === "personal"
      ? { label: w.use, value: labelOf(AUDIENCES, "personal", lang) }
      : {
          label: w.business,
          value:
            answers.sector === "other"
              ? (answers.sectorOther ?? labelOf(SECTORS, "other", lang))
              : answers.sector
                ? labelOf(SECTORS, answers.sector, lang)
                : labelOf(AUDIENCES, "business", lang),
        };
  return [{ label: w.services, value: services }, who, { label: w.country, value: country }];
}

const firstName = (contact: Contact) => contact.name.split(" ")[0] || contact.name;

export function confirmationText(answers: Answers, contact: Contact, lang: Lang) {
  const w = WORDS[lang];
  return [
    w.hi(firstName(contact)),
    "",
    w.received,
    "",
    w.where,
    "",
    `${w.told}:`,
    ...summaryOf(answers, lang).map((row) => `${row.label}: ${row.value}`),
    "",
    w.reply,
    "",
    "nevima",
    STUDIO_EMAIL,
    "",
    w.why,
  ].join("\n");
}

export function confirmationHtml(answers: Answers, contact: Contact, lang: Lang, siteUrl: string) {
  const w = WORDS[lang];
  const rows = summaryOf(answers, lang)
    .map(
      (row) => `<tr>
          <td width="110" style="padding:10px 16px 10px 0;border-top:1px solid ${HAIR};font:14px/1.4 ${FONT};color:${ASH};white-space:nowrap;vertical-align:top;">${escapeHtml(row.label)}</td>
          <td style="padding:10px 0;border-top:1px solid ${HAIR};font:14px/1.4 ${FONT};color:${INK};vertical-align:top;">${escapeHtml(row.value)}</td>
        </tr>`,
    )
    .join("");

  const p = `margin:0 0 18px;font:16px/1.55 ${FONT};color:${INK};`;

  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>${escapeHtml(w.subject)}</title>
</head>
<body style="margin:0;padding:0;background:#ffffff;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;">
  <tr><td align="center" style="padding:24px 12px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
      <tr><td style="background:#000000;padding:28px 32px;">
        <img src="${siteUrl}/email/wordmark.png" width="150" alt="nevima" style="display:block;border:0;height:auto;width:150px;">
      </td></tr>
      <tr><td style="padding:36px 32px 8px;">
        <p style="${p}">${escapeHtml(w.hi(firstName(contact)))}</p>
        <p style="${p}">${escapeHtml(w.received)}</p>
        <p style="${p}">${escapeHtml(w.where)}</p>
      </td></tr>
      <tr><td style="padding:8px 32px 8px;">
        <p style="margin:0 0 6px;font:600 15px/1.4 ${FONT};color:${INK};">${escapeHtml(w.told)}</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-bottom:1px solid ${HAIR};">
          ${rows}
        </table>
      </td></tr>
      <tr><td style="padding:24px 32px 8px;">
        <p style="${p}">${escapeHtml(w.reply)}</p>
        <p style="margin:0;font:16px/1.55 ${FONT};color:${INK};">nevima<br><a href="mailto:${STUDIO_EMAIL}" style="color:${INK};">${STUDIO_EMAIL}</a></p>
      </td></tr>
      <tr><td style="padding:32px 32px 8px;">
        <p style="margin:0;font:12px/1.5 ${FONT};color:${ASH};">${escapeHtml(w.why)}</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}
