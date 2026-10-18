/* ==================================================================
   The partners' questions

   For development companies that handle the back end and want a studio
   for the front end (user, 2026-10-18): a form of its own, with no
   estimate. These projects vary too much for one, so we talk first and
   then send a fixed quote. Shared by the form and the server, which
   reads the answers against these lists.

   The rules it states: we take care of the front end only; the back end,
   hosting and putting it online included, stays with the partner; the
   design is ours, made with AI, and an existing design can only be
   inspiration, never copied one to one; our stack is Next.js, Tailwind
   CSS and Motion, and a partner it does not fit is not one we work with.
   ================================================================== */

import type { Copy } from "../i18n";

export const PROJECT_TYPES = [
  { id: "website", label: "Website", pt: "Website" },
  { id: "platform", label: "Platform", pt: "Plataforma" },
  { id: "webapp", label: "Web app", pt: "Aplicação web" },
] as const;
export type ProjectTypeId = (typeof PROJECT_TYPES)[number]["id"];

export const SCREENS = [
  { id: "1-5", label: "1–5", pt: "1–5" },
  { id: "6-15", label: "6–15", pt: "6–15" },
  { id: "16-30", label: "16–30", pt: "16–30" },
  { id: "30+", label: "More than 30", pt: "Mais de 30" },
] as const;
export type ScreensId = (typeof SCREENS)[number]["id"];

export const STARTS = [
  { id: "asap", label: "As soon as possible", pt: "O mais depressa possível" },
  { id: "month", label: "Within a month", pt: "Dentro de um mês" },
  { id: "later", label: "Later", pt: "Mais tarde" },
] as const;
export type StartId = (typeof STARTS)[number]["id"];

export const DELIVERIES = [
  { id: "1m", label: "Within a month", pt: "Dentro de um mês" },
  { id: "1-3m", label: "1–3 months", pt: "1–3 meses" },
  { id: "3m+", label: "More than 3 months", pt: "Mais de 3 meses" },
  { id: "flexible", label: "Flexible", pt: "Flexível" },
] as const;
export type DeliveryId = (typeof DELIVERIES)[number]["id"];

export const MODELS = [
  { id: "project", label: "A one-off project", pt: "Um projeto fechado" },
  { id: "ongoing", label: "Ongoing work", pt: "Trabalho contínuo" },
] as const;
export type ModelId = (typeof MODELS)[number]["id"];

export const CREDITS = [
  { id: "credit", label: "Yes, with credit", pt: "Sim, com crédito" },
  { id: "white", label: "No, white label", pt: "Não, sem crédito (white label)" },
] as const;
export type CreditId = (typeof CREDITS)[number]["id"];

export const PARTNER_YES_NO = [
  { id: "yes", label: "Yes", pt: "Sim" },
  { id: "no", label: "No", pt: "Não" },
] as const;
export type PartnerYesNo = (typeof PARTNER_YES_NO)[number]["id"];

/** What the form says before its first question. */
export const PARTNER_INTRO: Copy = {
  en: "We take care of the front end only: everything on the back end, hosting and putting it online included, stays with you. Design is part of our service: we create it with an AI-led process, which lets us move fast and iterate on your feedback. If you already have a design, we can use it as inspiration, but we don't replicate existing designs one to one.",
  pt: "Tratamos só do front end: tudo o que é back end, incluindo o alojamento e pôr o projeto online, fica do vosso lado. O design faz parte do nosso serviço: criamo-lo com um processo guiado por IA, que nos deixa avançar depressa e ajustar ao vosso feedback. Se já tiverem um design, podemos usá-lo como inspiração, mas não replicamos designs existentes à letra.",
};

/** Our stack, asked as one question: a partner it does not fit is not
    one we work with. */
export const STACK_QUESTION: Copy = {
  en: "We build with Next.js (React), Tailwind CSS and Motion. Is this compatible with your back end and your hosting, so you can connect it to our front end and run it?",
  pt: "Trabalhamos com Next.js (React), Tailwind CSS e Motion. Isto é compatível com o vosso back end e o vosso alojamento, para poderem ligá-lo ao nosso front end e pô-lo a funcionar?",
};

export const NOT_COMPATIBLE: Copy = {
  en: "Then we're not the right fit for this project for now. Thank you for thinking of us.",
  pt: "Então, por agora, não somos a escolha certa para este projeto. Obrigado por pensarem em nós.",
};

export type PartnerAnswers = {
  project: ProjectTypeId;
  screens: ScreensId;
  inspiration: PartnerYesNo;
  /** A link to the design or brand guidelines, when there are any. */
  inspirationLink?: string;
  /** Always "yes": a partner whose stack does not fit cannot send. */
  compatible: "yes";
  start: StartId;
  delivery: DeliveryId;
  model: ModelId;
  credit: CreditId;
  nda: boolean;
};
