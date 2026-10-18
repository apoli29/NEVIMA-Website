/* ==================================================================
   The free-proposal questions

   Shared by the form (which shows them) and the server (which checks
   the answers against them before pricing anything). Only ids and the
   words shown to the visitor live here: no price is ever in this file,
   because it is bundled into the browser. The prices are in
   pricing.ts, which only the API routes import.

   Every label has its Portuguese beside it (`pt`, and `notePt` for a
   note); `inLang` gives a list in the page's language.
   ================================================================== */

import type { Copy, Lang } from "../i18n";

/** Visual identity and the photo shoot are offered as services of their
    own, though only together with a website (user, 2026-10-17). */
export const SERVICES = [
  { id: "web", label: "Web design", pt: "Web design" },
  { id: "identity", label: "Visual identity", pt: "Identidade visual" },
  { id: "photo", label: "Photo shoot", pt: "Sessão fotográfica" },
  { id: "seo", label: "SEO", pt: "SEO" },
  { id: "geo", label: "GEO", pt: "GEO" },
] as const;
export type ServiceId = (typeof SERVICES)[number]["id"];

/** What the business does. It tells us about the project; it never
    changes the price by itself (what a sector needs is asked as features). */
export const SECTORS = [
  { id: "health", label: "Health & aesthetics", pt: "Saúde e estética" },
  { id: "realestate", label: "Real estate", pt: "Imobiliário" },
  { id: "hospitality", label: "Restaurants & hospitality", pt: "Restauração e hotelaria" },
  { id: "retail", label: "Shop / retail", pt: "Loja / comércio" },
  { id: "professional", label: "Professional services", pt: "Serviços profissionais" },
  { id: "other", label: "Other", pt: "Outro" },
] as const;
export type SectorId = (typeof SECTORS)[number]["id"];

export const COUNTRIES = [
  { id: "PT", label: "Portugal", pt: "Portugal" },
  { id: "ES", label: "Spain", pt: "Espanha" },
  { id: "IT", label: "Italy", pt: "Itália" },
  { id: "US", label: "USA", pt: "EUA" },
  { id: "other", label: "Other", pt: "Outro" },
] as const;
export type CountryId = (typeof COUNTRIES)[number]["id"];

/** Website size. Web design stops at 10 pages; past that is quoted. */
export const PAGES = [
  { id: "landing", label: "Landing page", pt: "Landing page" },
  { id: "4-6", label: "4–6", pt: "4–6" },
  { id: "7-10", label: "7–10", pt: "7–10" },
  { id: "10+", label: "More than 10", pt: "Mais de 10" },
  /** Estimated for 3 to 8 pages, with a wider range (user, 2026-10-17). */
  { id: "unsure", label: "Not sure", pt: "Não sei" },
] as const;
export type PagesId = (typeof PAGES)[number]["id"];

export const LANGUAGES = [
  { id: "pt", label: "Portuguese", pt: "Português" },
  { id: "en", label: "English", pt: "Inglês" },
  { id: "other", label: "Other", pt: "Outras" },
] as const;
export type LanguageId = (typeof LANGUAGES)[number]["id"];

/** What the website has to do, in three levels, each adding to the one
    before (user, 2026-10-18). The first, presenting the business, is
    every website and has no key. The second is ticked item by item and
    priced; the third is one key, and a project that needs it is one the
    studio does not take on for now. */
export const FEATURES = [
  {
    id: "forms",
    label: "Forms",
    pt: "Formulários",
    note: "Your clients fill in a form. You get their answers by email and reply yourself.",
    notePt: "Os teus clientes preenchem um formulário. Recebes as respostas por email e respondes tu.",
  },
  {
    id: "newsletter",
    label: "Newsletter sign-up",
    pt: "Inscrição na newsletter",
    note: "Your clients sign up with their email. You get each sign-up by email and follow up yourself.",
    notePt: "Os teus clientes inscrevem-se com o email. Recebes cada inscrição por email e dás-lhe seguimento tu.",
  },
  {
    id: "emails",
    label: "Automatic emails",
    pt: "Emails automáticos",
    note: "Rather not reply by hand? Each one gets an automatic email, designed in HTML.",
    notePt: "Preferes não responder à mão? Cada um recebe um email automático, desenhado em HTML.",
  },
  {
    id: "bookings",
    label: "Bookings",
    pt: "Marcações",
    note: "Your clients book a time themselves, straight into your calendar.",
    notePt: "Os teus clientes marcam eles próprios uma hora, diretamente no teu calendário.",
  },
] as const;
export type FeatureId = (typeof FEATURES)[number]["id"];

/** How many forms, or how many different automatic emails. More than
    three is quoted in the proposal. */
export const COUNTS = [
  { id: "1", label: "1", pt: "1" },
  { id: "2", label: "2", pt: "2" },
  { id: "3", label: "3", pt: "3" },
  { id: "more", label: "More than 3", pt: "Mais de 3" },
] as const;
export type CountId = (typeof COUNTS)[number]["id"];

/** The third level, as one key. */
export const COMPLEX = [
  {
    id: "complex",
    label: "We need one of these",
    pt: "Precisamos de um destes",
    note: "An online shop, a client area with login, payments built into the website, or a connection to your internal software (invoicing, CRM…).",
    notePt: "Uma loja online, uma área de cliente com login, pagamentos integrados no website, ou uma ligação ao teu software interno (faturação, CRM…).",
  },
] as const;

/** Said as soon as the third level is ticked, and in place of the
    estimate. */
export const OUT_OF_SCOPE: Copy = {
  en: "Projects like this are beyond what we take on right now. We'd rather tell you that honestly than deliver less than our best.",
  pt: "Projetos assim estão, por agora, fora do que fazemos. Preferimos dizer-to com honestidade a entregar menos do que o nosso melhor.",
};

/** Two design levels for now (user, 2026-10-17), 25% apart. */
export const DESIGN = [
  {
    id: "essential",
    label: "Essential+",
    pt: "Essencial+",
    note: "Clean, well-built design with simple, elegant motion",
    notePt: "Design limpo e bem construído, com movimento simples e elegante",
  },
  {
    id: "advanced",
    label: "Advanced",
    pt: "Avançado",
    note: "Richer layouts and animation, designed around your brand",
    notePt: "Composições e animações mais ricas, desenhadas à volta da tua marca",
  },
] as const;
export type DesignId = (typeof DESIGN)[number]["id"];

/** Whether the client already has the website's texts: writing them is
    priced as a range, by the site's size (user, 2026-10-17: yes or no). */
export const TEXTS = [
  { id: "yes", label: "Yes", pt: "Sim" },
  { id: "no", label: "No", pt: "Não" },
] as const;
export type TextsId = (typeof TEXTS)[number]["id"];

export const YES_NO = [
  { id: "yes", label: "Yes", pt: "Sim" },
  { id: "no", label: "No", pt: "Não" },
] as const;
export type YesNo = (typeof YES_NO)[number]["id"];

export const PHOTO_PLANS = [
  {
    id: "photos",
    label: "Photos only",
    pt: "Só fotografia",
    note: "2.5-hour shoot, 20–25 edited photos",
    notePt: "Sessão de 2h30, 20–25 fotografias editadas",
  },
  {
    id: "photos-video",
    label: "Photos & video",
    pt: "Fotografia e vídeo",
    note: "4-hour shoot, 30–40 edited photos, video up to 1 min",
    notePt: "Sessão de 4 horas, 30–40 fotografias editadas, vídeo até 1 min",
  },
] as const;
export type PhotoPlanId = (typeof PHOTO_PLANS)[number]["id"];

/** The shoot is only offered on the mainland; the islands are quoted. */
export const REGIONS = [
  { id: "mainland", label: "Mainland", pt: "Continente" },
  { id: "madeira", label: "Madeira", pt: "Madeira" },
  { id: "azores", label: "Azores", pt: "Açores" },
] as const;
export type RegionId = (typeof REGIONS)[number]["id"];

/** SEO and GEO each come as a one-time set of practices, with a monthly
    service on top if wanted (user, 2026-10-17). */
export const SEARCH_PLANS = [
  {
    id: "once",
    label: "One-time",
    pt: "Pontual",
    note: "A set of practices applied in one go: strongest in the short term, its effect fades over the medium to long term",
    notePt: "Um conjunto de práticas aplicado de uma só vez: mais forte a curto prazo, o efeito vai-se perdendo a médio e longo prazo",
  },
  {
    id: "monthly",
    label: "One-time + monthly",
    pt: "Pontual + mensal",
    note: "Adds monthly work to keep those practices as effective as they can be",
    notePt: "Junta um trabalho mensal que mantém essas práticas o mais eficazes possível",
  },
] as const;
export type SearchPlanId = (typeof SEARCH_PLANS)[number]["id"];

export const REACH = [
  { id: "local", label: "Local", pt: "Local" },
  { id: "national", label: "National", pt: "Nacional" },
  { id: "international", label: "International", pt: "Internacional" },
] as const;
export type ReachId = (typeof REACH)[number]["id"];

/** The answers, as the form sends them and the server reads them. A
    group is present only when its service was chosen. */
export type Answers = {
  services: ServiceId[];
  sector: SectorId;
  sectorOther?: string;
  country: CountryId;
  countryOther?: string;
  web?: {
    design: DesignId;
    pages: PagesId;
    languages: LanguageId[];
    languagesOther?: string;
    /** The second level's items, in the list's order (none is fine). */
    features: FeatureId[];
    /** With forms ticked. */
    forms?: CountId;
    /** With automatic emails ticked (only offered with forms or the
        newsletter): how many different emails. */
    emails?: CountId;
    /** The third level: an online shop, logins, payments, internal
        software. Such a project is not priced. */
    complex?: true;
    texts: TextsId;
    /** Up to two websites whose look the client likes; empty when they
        said they have none. */
    references: string[];
    /** Ticked "I don't have any" instead of giving references. */
    noReferences?: boolean;
    domain: YesNo;
    urgent: YesNo;
  };
  photo?: {
    plan: PhotoPlanId;
    /** Only asked when the business is in Portugal. */
    region?: RegionId;
    town: string;
  };
  search?: {
    /** Not asked when web design is chosen too (the site is being built). */
    site?: string;
    /** Not asked when web design is chosen too: the web answer stands. */
    pages?: PagesId;
    reach: ReachId;
    /** One for each of SEO and GEO that was chosen. */
    seoPlan?: SearchPlanId;
    geoPlan?: SearchPlanId;
  };
};

/** A price as a range: the final proposal sets the exact figure inside
    it (user, 2026-10-17). A fixed price has min equal to max. */
export type Range = { min: number; max: number };

/** What the server sends back for a set of answers. Amounts are whole
    euros. An item the table cannot price is listed under onRequest. */
export type Estimate = {
  currency: "EUR";
  lines: {
    id: ServiceId;
    label: string;
    /** Paid up front (for SEO and GEO, the one-time work). */
    amount: Range;
    /** Paid each month (SEO and GEO with the monthly service). */
    monthly?: number;
    /** Shown under the line: what it includes, what it assumes. */
    notes: string[];
    /** The figure rests on prices the studio has not confirmed yet:
        underlined in orange when the form is opened with ?revisao. */
    provisional?: boolean;
  }[];
  onRequest: { id: string; label: string; reason: string }[];
  /** The sum paid up front, or null when nothing could be priced. */
  total: Range | null;
  /** The sum paid each month after the first, when there is any. */
  monthly: number | null;
  /** The project needs the third level (complex systems): nothing is
      priced, and the visitor is told it is beyond what we take on now. */
  outOfScope?: true;
  /** How long the website takes, when web design was chosen: working
      days, or agreed between both sides on an urgent deadline. */
  timeline: { kind: "days"; min: number; max: number } | { kind: "agreed" } | null;
};

/** Said wherever languages other than Portuguese and English are asked
    for or priced (user). */
export const TRANSLATION_NOTE: Copy = {
  en: "Languages other than Portuguese and English are translated by an AI specialised in translation, with over 95% accuracy. We always send you a final document, so you can point out any sentence you'd like written differently.",
  pt: "As línguas além do português e do inglês são traduzidas por uma IA especializada em tradução, com mais de 95% de precisão. Enviamos-te sempre um documento final, para poderes indicar qualquer frase que prefiras escrita de outra forma.",
};

/** How many languages were typed under "Other": "French, German and
    Dutch" is three. At least one, since "Other" was ticked. */
export function countLanguages(text: string) {
  const parts = text
    .split(/,|;|\/|&|\+|\band\b|\be\b|\by\b/i)
    .map((p) => p.trim())
    .filter(Boolean);
  return Math.max(1, parts.length);
}

export type Contact = {
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
  consent: boolean;
};

/** Limits on free text, shared so the fields and the server agree. */
export const MAX = {
  short: 120,
  url: 200,
  message: 2000,
} as const;

/** An answer as the list names it, in a language. */
export const labelOf = <T extends readonly Option[]>(list: T, id: string, lang: Lang = "en") => {
  const item = list.find((o) => o.id === id);
  return item ? (lang === "pt" ? item.pt : item.label) : id;
};

type Option = { id: string; label: string; pt: string; note?: string; notePt?: string };

/** A list with its labels and notes in a language, as the form shows it. */
export function inLang<T extends Option>(list: readonly T[], lang: Lang) {
  return list.map((o) => ({
    id: o.id as T["id"],
    label: lang === "pt" ? o.pt : o.label,
    note: lang === "pt" ? o.notePt : o.note,
  }));
}

/** Which service groups a set of chosen services asks about, in order. */
export function groupsFor(services: readonly ServiceId[]) {
  return {
    web: services.includes("web"),
    photo: services.includes("photo"),
    search: services.includes("seo") || services.includes("geo"),
  };
}
