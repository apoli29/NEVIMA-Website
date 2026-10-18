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

/** How many screens or pages (user, 2026-10-18). Past twenty, a field
    asks roughly how many. */
export const SCREENS = [
  { id: "1-10", label: "1–10", pt: "1–10" },
  { id: "11-20", label: "11–20", pt: "11–20" },
  { id: "20+", label: "More than 20", pt: "Mais de 20" },
] as const;
export type ScreensId = (typeof SCREENS)[number]["id"];

/** How soon the work would start (user, 2026-10-18). */
export const STARTS = [
  { id: "week", label: "Less than a week", pt: "Menos de uma semana" },
  { id: "1-2w", label: "1–2 weeks", pt: "1–2 semanas" },
  { id: "3-4w", label: "3–4 weeks", pt: "3–4 semanas" },
  { id: "month+", label: "More than a month", pt: "Mais de 1 mês" },
] as const;
export type StartId = (typeof STARTS)[number]["id"];

/** How long until it is delivered (user, 2026-10-18). */
export const DELIVERIES = [
  { id: "2w", label: "Less than 2 weeks", pt: "Menos de 2 semanas" },
  { id: "2-4w", label: "2–4 weeks", pt: "2–4 semanas" },
  { id: "1-2m", label: "1–2 months", pt: "1–2 meses" },
  { id: "2m+", label: "More than 2 months", pt: "Mais de 2 meses" },
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
  pt: "Tratamos apenas do front end: todo o back end, incluindo o alojamento e a colocação do projeto online, fica a cargo do parceiro. O design faz parte do nosso serviço: criamo-lo com um processo guiado por IA, que nos permite avançar depressa e ajustar com base no feedback. Um design já existente pode servir de inspiração, mas não replicamos designs existentes à letra.",
};

/** Our stack, asked as one question: a partner it does not fit is not
    one we work with. */
export const STACK_QUESTION: Copy = {
  en: "We build with Next.js (React), Tailwind CSS and Motion. Is this compatible with your back end and your hosting, so you can connect it to our front end and run it?",
  pt: "Trabalhamos com Next.js (React), Tailwind CSS e Motion. Esta tecnologia é compatível com o back end e o alojamento do projeto, de forma a ligá-los ao nosso front end e pô-lo a funcionar?",
};

export const NOT_COMPATIBLE: Copy = {
  en: "Then we're not the right fit for this project for now. Thank you for thinking of us.",
  pt: "Nesse caso, por agora, não somos a escolha certa para este projeto. Obrigado pelo interesse na Nevima.",
};

export type PartnerAnswers = {
  project: ProjectTypeId;
  screens: ScreensId;
  /** Past twenty: roughly how many, in the partner's words. */
  screensEstimate?: string;
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
