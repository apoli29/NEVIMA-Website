import type { Lang } from "../i18n";
import { firstName } from "./email";
import { attachment, boxed, figure, PHONES, phoneChips, plain, prose, shell, signoff, slotBlock, slotButton, STUDIO_EMAIL } from "./mail";

/* ==================================================================
   After the call: the final proposal, with the contract attached

   The frame is the studio's (user, 2026-10-30). In the composer
   (/interno) the studio can add a paragraph of its own under the
   opening, sets the final value (and a monthly one, when there is SEO
   or GEO upkeep) with the VAT note under it, attaches the contract as
   a PDF, named in the email so it is looked for, and writes the
   materials still to come in a box.

   The call midway through the project is the client's to ask for: the
   two buttons lead to the site (src/components/mid-call.tsx), which
   records the answer in Notion and tells the studio, who then emails
   to set a date.
   ================================================================== */

export type Offer = {
  lang: Lang;
  name: string;
  /** An extra paragraph, or empty: blank lines between paragraphs. */
  text: string;
  /** "2 450 €", as typed. */
  total: string;
  /** "40 €/mês", or empty. */
  monthly: string;
  note: string;
  /** The contract's file name, or empty when none is attached. */
  file: string;
  /** The materials still to come, as the studio wrote them, or empty. */
  materials: string;
  /** Where the yes and no buttons go; "#" in a preview. */
  links: [string, string];
  /** The partner who signs it. */
  signer: string;
  siteUrl: string;
};

const WORDS = {
  en: {
    subject: "Your final proposal",
    preheader: "The final proposal and the contract, as agreed on our call.",
    tag: "Final proposal",
    hi: (name: string) => `Hi ${name},`,
    intro: "Thank you for the call and for all the information you shared with us. As agreed, here is our final proposal, as validated on the call.",
    value: "Final value",
    monthly: "/month",
    note: "VAT exempt (art. 53 of the Portuguese VAT Code).",
    file: "Contract attached",
    next: "To go ahead, just reply to this email with the signed contract. If you have any questions, we are glad to answer them, by email or by phone:",
    materials: (list: boolean) => `We will start the project as soon as we have all the materials mentioned on the call${list ? ":" : "."}`,
    mid: "If you opted for a call midway through the project, select the option below and we will soon email you to set a date.",
    midLabel: "Call midway through the project",
    yes: "Yes, I would like it",
    no: "No, it is not needed",
    excited: "We are very excited about this project. Thank you once again!",
    regards: "Best regards,",
    why: "You are receiving this email following our call about the proposal you asked for on our website.",
  },
  pt: {
    subject: "A sua proposta final",
    preheader: "A proposta final e o contrato, como combinado na reunião.",
    tag: "Proposta final",
    hi: (name: string) => `Olá, ${name}`,
    intro: "Agradecemos a reunião e todas as informações que partilhou connosco. Como combinado, enviamos a nossa proposta final, que foi validada na reunião.",
    value: "Valor final",
    monthly: "/mês",
    note: "Isento de IVA (art. 53.º do Código do IVA).",
    file: "Contrato em anexo",
    next: "Para avançar, basta responder a este e-mail com o contrato assinado. Se tiver alguma dúvida, estamos ao dispor para a esclarecer, por e-mail ou por telefone:",
    materials: (list: boolean) => `Iniciamos o projeto assim que tivermos disponíveis todos os materiais mencionados na reunião${list ? ":" : "."}`,
    mid: "Caso tenha optado por fazermos uma reunião a meio do projeto, selecione a opção abaixo e em breve enviamos-lhe um e-mail para marcarmos uma data.",
    midLabel: "Reunião a meio do projeto",
    yes: "Sim, pretendo a reunião",
    no: "Não é necessária",
    excited: "Estamos muito entusiasmados com este projeto. Obrigado mais uma vez!",
    regards: "Cumprimentos,",
    why: "Recebeu este e-mail na sequência da nossa reunião sobre o pedido de proposta que fez no nosso website.",
  },
} as const;

export const offerSubject = (lang: Lang) => WORDS[lang].subject;

/** What the composer starts from, in each language. */
export const offerDefaults = (lang: Lang) => ({ note: WORDS[lang].note });

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

export function offerHtml({ lang, name, text, total, monthly, note, file, materials, links, signer, siteUrl }: Offer) {
  const w = WORDS[lang];
  const list = materials.trim();
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
      prose(w.materials(Boolean(list))),
      list ? boxed(list) : "",
      prose(w.mid),
      slotBlock(slotButton(links[0], w.midLabel, w.yes) + slotButton(links[1], w.midLabel, w.no), ""),
      prose(w.excited),
      signoff(w.regards, siteUrl, signer),
    ].join(""),
  });
}

export function offerText({ lang, name, text, total, monthly, note, file, materials, links, signer }: Offer) {
  const w = WORDS[lang];
  const list = materials.trim();
  return plain([
    w.hi(firstName(name)),
    "",
    w.intro,
    "",
    ...(text.trim() ? [text.trim(), ""] : []),
    ...(total.trim() ? [`${w.value}: ${totalText(total)}${monthly.trim() ? ` ${monthlyText(monthly, lang)}` : ""}`, note.trim(), ""] : []),
    ...(file ? [`${w.file}: ${file}`, ""] : []),
    `${w.next} ${PHONES.map((p) => p.label).join(" | ")}`,
    "",
    w.materials(Boolean(list)),
    ...(list ? [list] : []),
    "",
    w.mid,
    `- ${w.yes}: ${links[0]}`,
    `- ${w.no}: ${links[1]}`,
    "",
    w.excited,
    "",
    w.regards,
    signer,
    "nevima",
    STUDIO_EMAIL,
  ]);
}
