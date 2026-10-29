import type { Lang } from "../i18n";
import { plain, prose, shell, signoff, STUDIO_EMAIL } from "./mail";
import { AUDIENCES, COUNTRIES, SECTORS, SERVICES, labelOf, type Answers, type Contact } from "./questions";

/* ==================================================================
   The email the visitor gets once the request has reached the studio

   Sent on its own, always the same, the moment the request is in
   Notion (deliver.ts). The words are the studio's (user, 2026-10-29),
   in the language the visitor used the site in. Unlike the site, the
   studio's emails address the reader ("consigo", "esteja à vontade"):
   they are letters to a person by name (user, 2026-10-29; see
   docs/language-decisions.md).

   It promises no reply time: none is fixed. When one is, say it in the
   first paragraph, in both languages.

   The look is shared with the studio's other emails (mail.ts).
   ================================================================== */

export { STUDIO_EMAIL };

type Words = {
  subject: string;
  preheader: string;
  tag: string;
  hi: (name: string) => string;
  body: string;
  thanks: string;
  regards: string;
  why: string;
  use: string;
  business: string;
  country: string;
  services: string;
};

const WORDS: Record<Lang, Words> = {
  en: {
    subject: "We have received your request",
    preheader: "We are going through your answers and will be in touch very soon.",
    tag: "Request received",
    hi: (name) => `Hi ${name},`,
    body: [
      "We have just received your request. We will go through your answers and be in touch very soon.",
      "If there is anything else we can help with in the meantime, just reply to this email.",
    ].join("\n\n"),
    thanks: "Thank you for getting in touch.",
    regards: "Best regards,",
    why: "You are receiving this email because you asked for a proposal on our website. Your details are used only to answer that request.",
    use: "Use",
    business: "Business",
    country: "Country",
    services: "Services",
  },
  pt: {
    subject: "Recebemos o seu pedido",
    preheader: "Vamos analisar as suas respostas e entraremos em contacto muito em breve.",
    tag: "Pedido recebido",
    hi: (name) => `Olá, ${name}`,
    body: [
      "Acabámos de receber o seu pedido. Vamos analisar as suas respostas e entraremos em contacto consigo muito em breve.",
      "Se entretanto pudermos ajudar de alguma outra forma, esteja à vontade para responder a este e-mail.",
    ].join("\n\n"),
    thanks: "Obrigado por entrar em contacto connosco.",
    regards: "Cumprimentos,",
    why: "Recebeu este e-mail porque pediu uma proposta no nosso website. Os seus dados são usados apenas para responder a esse pedido.",
    use: "Utilização",
    business: "Negócio",
    country: "País",
    services: "Serviços",
  },
};

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

/** The name a letter opens with. */
export const firstName = (name: string) => name.trim().split(/\s+/)[0] || name;

export function confirmationText(contact: Pick<Contact, "name">, lang: Lang) {
  const w = WORDS[lang];
  return plain([w.hi(firstName(contact.name)), "", w.body, "", w.thanks, "", w.regards, "nevima", STUDIO_EMAIL, "", w.why]);
}

export function confirmationHtml(contact: Pick<Contact, "name">, lang: Lang, siteUrl: string) {
  const w = WORDS[lang];
  return shell({
    lang,
    subject: w.subject,
    preheader: w.preheader,
    tag: w.tag,
    why: w.why,
    siteUrl,
    greeting: w.hi(firstName(contact.name)),
    body: [prose(`${w.body}\n\n${w.thanks}`), signoff(w.regards, siteUrl)].join(""),
  });
}
