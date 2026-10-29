import type { Lang } from "../i18n";
import { firstName } from "./email";
import { hello, phoneChips, PHONES, plain, prose, shell, signoff, slotBlock, slotButton, STUDIO_EMAIL } from "./mail";
import { lisbonTime, slotDay, slotSentence, slotTime } from "./slots";

/* ==================================================================
   The answer to a request: an invitation to a call

   The studio has a proposal and wants to present it on a short call
   (user, 2026-10-29). Two times are offered; each is a button. A click
   opens the meeting page on the site, which books it once confirmed:
   Notion gets the date and "Reunião marcada", and the studio a notice
   (src/app/api/meeting). So the client needs nothing but a click.

   Written in the studio's composer (/interno), which fills the name,
   the company, the language and the two times, and signs the links.
   Without a company (a site for personal use) the call is only to get
   to know each other.
   ================================================================== */

export type Invite = {
  lang: Lang;
  name: string;
  company: string;
  /** The two times, as the studio typed them (slots.ts). */
  slots: [string, string];
  /** Where each button goes; "#" in a preview. */
  links: [string, string];
  siteUrl: string;
};

const phones = PHONES.map((p) => p.label).join(" | ");

const WORDS = {
  en: {
    subject: "We have a proposal for you",
    preheader: "Two times for a short call to present it. Pick one with a click.",
    tag: "Proposal",
    hi: (name: string) => `Hi ${name},`,
    ready: "We have looked carefully at your request and already have a proposal for you!",
    call: (company: string) =>
      `We would like to present it on a short 20 to 30 minute call, which would also be a chance to get to know you${
        company ? ` and ${company}` : ""
      } better. We see this call as essential to delivering a result that fits your preferences and needs as closely as possible.`,
    pick: "So we are suggesting two times for the call. Pick whichever suits you best (just click the time you want):",
    caption: (zone: string) => `${zone} · 20–30 min`,
    other: "If you would rather book it for another time, do not hesitate to get in touch, so we can arrange it:",
    regards: "Best regards,",
    why: "You are receiving this email in answer to the proposal you asked for on our website.",
  },
  pt: {
    subject: "Já temos uma proposta para si",
    preheader: "Dois horários para uma breve chamada em que a apresentamos. Basta escolher um.",
    tag: "Proposta",
    hi: (name: string) => `Olá, ${name}`,
    ready: "Analisámos cuidadosamente o seu pedido e já temos uma proposta para si!",
    call: (company: string) =>
      `Gostaríamos de a apresentar numa breve chamada de 20 a 30 minutos, onde aproveitaríamos também para nos conhecermos melhor${
        company ? ` e para ficarmos a conhecer melhor a empresa ${company}` : ""
      }. Consideramos esta chamada fundamental para entregar um resultado o mais ajustado possível às suas preferências e necessidades.`,
    pick: "Desta forma, propomos dois horários para podermos fazer esta chamada. Esteja à vontade para escolher (basta clicar no horário desejado):",
    caption: (zone: string) => `${zone} · 20–30 min`,
    other: "Caso tenha preferência em agendar para outra altura, não hesite em contactar-nos, para podermos fazer a marcação:",
    regards: "Cumprimentos,",
    why: "Recebeu este e-mail em resposta ao pedido de proposta que fez no nosso website.",
  },
} as const;

export const inviteSubject = (lang: Lang) => WORDS[lang].subject;

export function inviteHtml({ lang, name, company, slots, links, siteUrl }: Invite) {
  const w = WORDS[lang];
  const buttons = slots.map((slot, i) => slotButton(links[i], slotDay(slot, lang), slotTime(slot, lang))).join("");
  return shell({
    lang,
    subject: w.subject,
    preheader: w.preheader,
    tag: w.tag,
    why: w.why,
    siteUrl,
    body: [
      hello(w.hi(firstName(name))),
      prose([w.ready, w.call(company.trim()), w.pick].join("\n\n")),
      slotBlock(buttons, w.caption(lisbonTime(lang))),
      prose(w.other),
      phoneChips(),
      signoff(w.regards, siteUrl),
    ].join(""),
  });
}

export function inviteText({ lang, name, company, slots, links }: Invite) {
  const w = WORDS[lang];
  return plain([
    w.hi(firstName(name)),
    "",
    w.ready,
    "",
    w.call(company.trim()),
    "",
    w.pick,
    "",
    ...slots.map((slot, i) => `- ${slotSentence(slot, lang)} (${lang === "pt" ? "hora de Lisboa" : "Lisbon time"}): ${links[i]}`),
    "",
    `${w.other} ${phones}`,
    "",
    w.regards,
    "nevima",
    STUDIO_EMAIL,
  ]);
}
