import type { Lang } from "../i18n";
import { firstName } from "./email";
import { attachment, figure, PHONES, phoneChips, plain, prose, shell, signoff, STUDIO_EMAIL } from "./mail";

/* ==================================================================
   After the call: the final proposal, with the contract attached

   The studio writes the proposal itself in the composer (/interno):
   the text is a field it rewrites for each client, prefilled with the
   paragraph below; the final value (and a monthly one, when there is
   SEO or GEO upkeep) is set large, with the VAT note under it. The
   contract goes as a PDF attachment, named in the email so it is
   looked for.

   The words are a draft for the partners to approve (2026-10-29):
   only the subject and the frame are fixed here; the proposal's own
   paragraph is theirs to write each time.
   ================================================================== */

export type Offer = {
  lang: Lang;
  name: string;
  /** The proposal, as the studio wrote it: blank lines between paragraphs. */
  text: string;
  /** "2 450 €", as typed. */
  total: string;
  /** "40 €/mês", or empty. */
  monthly: string;
  note: string;
  /** The contract's file name, or empty when none is attached. */
  file: string;
  siteUrl: string;
};

const WORDS = {
  en: {
    subject: "Your final proposal",
    preheader: "The final proposal and the contract, as agreed on our call.",
    tag: "Final proposal",
    hi: (name: string) => `Hi ${name},`,
    intro: "Thank you for the call. As agreed, here is our final proposal.",
    text: "After our conversation we adjusted the proposal to the choices we made together. The detail of each service, the timings and the terms are in the attached contract.",
    value: "Final value",
    monthly: "/month",
    note: "VAT exempt (art. 53 of the Portuguese VAT Code).",
    file: "Contract attached",
    next: "To go ahead, just reply to this email with the signed contract. If you have any questions, we are glad to answer them, by email or by phone:",
    regards: "Best regards,",
    why: "You are receiving this email following our call about the proposal you asked for on our website.",
  },
  pt: {
    subject: "A sua proposta final",
    preheader: "A proposta final e o contrato, como combinámos na chamada.",
    tag: "Proposta final",
    hi: (name: string) => `Olá, ${name}`,
    intro: "Obrigado pela conversa. Como combinado, enviamos a nossa proposta final.",
    text: "Depois da chamada, ajustámos a proposta às escolhas que fizemos em conjunto. O detalhe de cada serviço, os prazos e as condições estão no contrato em anexo.",
    value: "Valor final",
    monthly: "/mês",
    note: "Isento de IVA (art. 53.º do Código do IVA).",
    file: "Contrato em anexo",
    next: "Para avançar, basta responder a este e-mail com o contrato assinado. Se tiver alguma dúvida, estamos ao dispor para a esclarecer, por e-mail ou por telefone:",
    regards: "Cumprimentos,",
    why: "Recebeu este e-mail na sequência da nossa chamada sobre o pedido de proposta que fez no nosso website.",
  },
} as const;

export const offerSubject = (lang: Lang) => WORDS[lang].subject;

/** What the composer starts from, in each language. */
export const offerDefaults = (lang: Lang) => ({ text: WORDS[lang].text, note: WORDS[lang].note });

/** "40" becomes "40 €/mês"; anything already carrying a unit is left as it is. */
export function monthlyText(value: string, lang: Lang) {
  const v = value.trim();
  if (!v) return "";
  return /[a-z€]/i.test(v) ? v : `+ ${v} €${WORDS[lang].monthly}`;
}

/** "2450" becomes "2 450 €"; anything already carrying a unit is left as it is. */
export function totalText(value: string) {
  const v = value.trim();
  if (!/^\d+([.,]\d+)?$/.test(v)) return v;
  const [whole, cents] = v.split(/[.,]/);
  return `${whole.replace(/\B(?=(\d{3})+(?!\d))/g, " ")}${cents ? `,${cents.padEnd(2, "0")}` : ""} €`;
}

export function offerHtml({ lang, name, text, total, monthly, note, file, siteUrl }: Offer) {
  const w = WORDS[lang];
  return shell({
    lang,
    subject: w.subject,
    preheader: w.preheader,
    tag: w.tag,
    greeting: w.hi(firstName(name)),
    why: w.why,
    siteUrl,
    body: [
      prose([w.intro, text].join("\n\n")),
      total.trim() ? figure(w.value, totalText(total), monthlyText(monthly, lang), note.trim()) : "",
      file ? attachment(w.file, file) : "",
      prose(w.next),
      phoneChips(),
      signoff(w.regards, siteUrl),
    ].join(""),
  });
}

export function offerText({ lang, name, text, total, monthly, note, file }: Offer) {
  const w = WORDS[lang];
  return plain([
    w.hi(firstName(name)),
    "",
    w.intro,
    "",
    text.trim(),
    "",
    total.trim() && `${w.value}: ${totalText(total)}${monthly.trim() ? ` ${monthlyText(monthly, lang)}` : ""}`,
    total.trim() && note.trim(),
    total.trim() && "",
    file && `${w.file}: ${file}`,
    file && "",
    `${w.next} ${PHONES.map((p) => p.label).join(" | ")}`,
    "",
    w.regards,
    "nevima",
    STUDIO_EMAIL,
  ]);
}
