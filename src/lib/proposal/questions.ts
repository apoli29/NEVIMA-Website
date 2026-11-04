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
  /** SEO and GEO are one service (user, 2026-11-04), kept under the id
      "seo" so that requests already stored still read. */
  { id: "seo", label: "SEO & GEO", pt: "SEO e GEO" },
] as const;
export type ServiceId = (typeof SERVICES)[number]["id"];

/** Who the website is for. A business includes sole traders and the
    self-employed; personal use makes the client a consumer, which the
    contract's annex for "Particulares" covers, and is taken on in
    Portugal only (user, 2026-10-19). */
export const AUDIENCES = [
  { id: "business", label: "A business", pt: "Um negócio" },
  { id: "personal", label: "Personal use", pt: "Uso pessoal" },
] as const;
export type AudienceId = (typeof AUDIENCES)[number]["id"];

export const AUDIENCE_NOTE: Copy = {
  en: "A business includes sole traders and self-employed professionals.",
  pt: "Um negócio inclui empresários em nome individual e profissionais liberais.",
};

/** Personal use outside Portugal: not taken on for now. */
export const PERSONAL_ABROAD: Copy = {
  en: "For now, we only take on personal-use projects in Portugal.",
  pt: "De momento, apenas trabalhamos com projetos de uso pessoal em Portugal.",
};

/** The second level's notes for personal use: visitors rather than a
    business's clients (user, 2026-10-19). */
export const PERSONAL_FEATURE_NOTES: Record<"forms" | "newsletter" | "booking", Copy> = {
  forms: {
    en: "Visitors fill in a form, and you receive their answers.",
    pt: "Os visitantes preenchem um formulário, e as respostas chegam ao projeto.",
  },
  newsletter: {
    en: "Visitors sign up with their email, and each sign-up is saved in a database.",
    pt: "Os visitantes inscrevem-se com o email, e cada inscrição fica registada numa base de dados.",
  },
  booking: {
    en: "Visitors book a time or make a reservation themselves, and each one goes into your calendar.",
    pt: "Os visitantes marcam ou reservam diretamente, e cada marcação entra no calendário do projeto.",
  },
};

/** What the business does. It tells us about the project and, since
    2026-11-04 (user), it orders the page types and suggests a few of them
    (see SECTOR_PAGES); it never changes the price by itself. The ids from
    before the list grew (health, realestate, hospitality, retail,
    professional, other) keep their meaning, so earlier requests still read
    right. */
export const SECTORS = [
  { id: "health", label: "Health", pt: "Saúde" },
  { id: "beauty", label: "Beauty & wellness", pt: "Estética e bem-estar" },
  { id: "realestate", label: "Real estate", pt: "Imobiliário" },
  { id: "hospitality", label: "Restaurants", pt: "Restauração" },
  { id: "lodging", label: "Lodging & tourism", pt: "Alojamento e turismo" },
  { id: "retail", label: "Shop / retail", pt: "Loja / comércio" },
  { id: "professional", label: "Professional services", pt: "Serviços profissionais" },
  { id: "trades", label: "Construction & home services", pt: "Construção e serviços ao domicílio" },
  { id: "sport", label: "Sport & fitness", pt: "Desporto e fitness" },
  { id: "education", label: "Education & training", pt: "Educação e formação" },
  { id: "events", label: "Events & weddings", pt: "Eventos e casamentos" },
  { id: "creative", label: "Creative & photography", pt: "Criativos e fotografia" },
  { id: "nonprofit", label: "Associations & causes", pt: "Associações e causas" },
  { id: "tech", label: "Technology & B2B", pt: "Tecnologia e B2B" },
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

/** Website size. The price is no longer keyed by it (since 2026-11-04 it
    is the sum of the ranges of the pages ticked, see PRICING.web.pages);
    it is kept as a label for the timeline, the texts, SEO/GEO and the
    records. Web design stops at 10 pages; past that is quoted. It is not
    asked: the server works it out from the page types (see pagesFor). */
export const PAGES = [
  { id: "landing", label: "Landing page", pt: "Landing page" },
  { id: "3", label: "3", pt: "3" },
  { id: "4-6", label: "4–6", pt: "4–6" },
  { id: "7-10", label: "7–10", pt: "7–10" },
  { id: "10+", label: "More than 10", pt: "Mais de 10" },
  { id: "unsure", label: "Not sure", pt: "Não sei" },
] as const;
export type PagesId = (typeof PAGES)[number]["id"];

/** What the client wants first (user, 2026-11-04): a landing page or a
    website, with a line saying how they differ; the page types are only
    asked for a website. */
export const PAGE_MODES = [
  {
    id: "landing",
    label: "Landing page",
    pt: "Landing page",
    note: "Everything on a single page.",
    notePt: "Tudo numa única página.",
  },
  {
    id: "website",
    label: "Website",
    pt: "Website",
    note: "Several pages: Home, About, Contact and the pages and sections you choose.",
    notePt: "Várias páginas: Página principal, Sobre nós, Contactos e as páginas e secções escolhidas.",
  },
  /** From the pages always included up to the sector's usual ones. */
  { id: "unsure", label: "Not sure", pt: "Não sei" },
] as const;
export type PageModeId = (typeof PAGE_MODES)[number]["id"];

/** The kinds of page a client can add. One generic list for every sector,
    so no page that matters is left out: the sector only orders it and
    stars a few as usual (SECTOR_PAGES) inside the same list. Nothing is
    ticked beforehand; the Home, About and Contact pages are always
    included, and a website needs at least two more (MIN_CHOSEN). Up to
    three more can be written in, and "not sure" leaves the choice to us. Each kind has its own price range
    (PRICING.web.pages). "Items" and "Items with a page for each" exclude
    each other. Blog is not here (it belongs to SEO), nor is the quote
    request or anything with a form, nor bookings and reservations: those
    are the back-end services, kept apart (user, 2026-11-04). */
export const PAGE_TYPES = [
  // Services in two kinds, one or the other (user, 2026-11-04), named the
  // way the item lists are, so the difference reads at once.
  { id: "services", label: "Services, all on one page or section", pt: "Serviços, todos numa página ou secção" },
  { id: "servicesPages", label: "Services, with a page for each service", pt: "Serviços, com página para cada serviço" },
  { id: "items", label: "List of items, no page for each (products, courses, menu…)", pt: "Lista de itens, sem página para cada um (produtos, cursos, menu…)" },
  { id: "itemsPages", label: "List of items, with a page for each item (properties, rooms, treatments…)", pt: "Lista de itens, com página para cada item (imóveis, quartos, tratamentos…)" },
  { id: "team", label: "Team", pt: "Equipa" },
  { id: "portfolio", label: "Portfolio & case studies", pt: "Portefólio e casos" },
  { id: "gallery", label: "Gallery (photos and videos)", pt: "Galeria (fotografias e vídeos)" },
  { id: "prices", label: "Prices", pt: "Preços" },
  { id: "testimonials", label: "Testimonials", pt: "Testemunhos" },
  { id: "faq", label: "FAQ", pt: "Perguntas frequentes" },
  { id: "events", label: "Events", pt: "Eventos" },
  { id: "process", label: "How it works", pt: "Como funciona" },
  { id: "partners", label: "Partners & brands", pt: "Parceiros e marcas" },
  { id: "work", label: "Work with us", pt: "Trabalhe connosco" },
  { id: "resources", label: "Downloads", pt: "Recursos e descarregáveis" },
] as const;
export type PageTypeId = (typeof PAGE_TYPES)[number]["id"];

/** Home, About and Contact are in every website. */
export const ALWAYS_PAGES = 3;
/** A website must tick at least this many pages besides those (user,
    2026-11-04); the form does not go on without them. */
export const MIN_CHOSEN = 2;
/** Counting stops here: past 10 pages the price is on request. */
export const MAX_PAGES = 10;

/** The two kinds of item list, one or the other. */
export const ITEM_LISTS = ["items", "itemsPages"] as const;
/** The two kinds of services page, one or the other. */
export const SERVICE_PAGES = ["services", "servicesPages"] as const;
/** Pairs that exclude each other: ticking one unticks the other. */
export const EXCLUSIVE_PAIRS = [ITEM_LISTS, SERVICE_PAGES] as const;

/** Per sector: the kinds of page it usually has. They are flagged "usual"
    and put first, never ticked for the client (user, 2026-11-04). Personal
    use, with no sector, is the "personal" row. */
export const SECTOR_PAGES: Record<SectorId | "personal", readonly PageTypeId[]> = {
  health: ["services", "team", "prices", "faq"],
  beauty: ["services", "gallery", "prices", "testimonials"],
  realestate: ["itemsPages", "services", "testimonials", "faq"],
  hospitality: ["items", "gallery", "events", "faq"],
  lodging: ["itemsPages", "gallery", "prices", "faq"],
  retail: ["itemsPages", "faq", "testimonials", "partners"],
  professional: ["services", "team", "portfolio", "faq"],
  trades: ["services", "portfolio", "process", "testimonials"],
  sport: ["services", "prices", "team", "events"],
  education: ["itemsPages", "team", "faq", "events"],
  events: ["services", "gallery", "prices", "portfolio"],
  creative: ["portfolio", "services", "gallery", "process"],
  nonprofit: ["process", "events", "team", "partners"],
  tech: ["services", "portfolio", "resources", "process"],
  other: ["services", "portfolio", "faq", "testimonials"],
  personal: ["portfolio", "gallery", "faq", "process"],
};

/** The size label from how many pages there are (Home, About and Contact
    count). Past 10 it is on request. */
export function pagesBucket(count: number): Exclude<PagesId, "unsure"> {
  if (count <= 1) return "landing";
  if (count <= 3) return "3";
  if (count <= 6) return "4-6";
  if (count <= MAX_PAGES) return "7-10";
  return "10+";
}

/** Up to this many pages or sections can be written in, besides the list
    (user, 2026-11-04). Each widens the estimate (see estimate.ts). */
export const MAX_OTHERS = 3;
/** "Not sure, you choose" counts as this many pages for the size label. */
export const UNSURE_PAGES = 2;

/** How many pages the ticked kinds and the written-in ones come to, for the
    size label. "Not sure, you choose" counts as UNSURE_PAGES. */
export function countPages(types: readonly PageTypeId[], others = 0, unsure = false) {
  return ALWAYS_PAGES + types.length + others + (unsure ? UNSURE_PAGES : 0);
}

/** What a website has chosen, besides Home, About and Contact: ticked kinds,
    written-in pages and "not sure" (which stands for UNSURE_PAGES). It must
    come to MIN_CHOSEN. */
export function chosenCount(types: readonly PageTypeId[], others = 0, unsure = false) {
  return types.length + others + (unsure ? UNSURE_PAGES : 0);
}

/** The size from what was answered: the server works it out from the
    mode and the ticked kinds, and the form does the same for what it
    shows. */
export function pagesFor(mode: PageModeId, types: readonly PageTypeId[], others = 0, unsure = false): PagesId {
  if (mode === "landing") return "landing";
  if (mode === "unsure") return "unsure";
  return pagesBucket(countPages(types, others, unsure));
}

export const LANGUAGES = [
  { id: "pt", label: "Portuguese", pt: "Português" },
  { id: "en", label: "English", pt: "Inglês" },
  { id: "other", label: "Other", pt: "Outras" },
  /** Chosen on its own (user, 2026-10-27): priced for Portuguese and
      English, with room for one more language. */
  { id: "unsure", label: "Not sure", pt: "Não sei" },
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
    note: "Your clients fill in a form, and you receive their answers.",
    notePt: "Os clientes do negócio preenchem um formulário, e as respostas chegam ao negócio.",
  },
  {
    id: "newsletter",
    label: "Newsletter sign-up",
    pt: "Inscrição na newsletter",
    note: "Your clients sign up with their email, and each sign-up is saved in a database.",
    notePt: "Os clientes do negócio inscrevem-se com o email, e cada inscrição fica registada numa base de dados.",
  },
  {
    id: "booking",
    label: "Calendar & reservations",
    pt: "Calendarização e reservas",
    note: "Your clients book a time or make a reservation themselves, and each one goes into your calendar.",
    notePt: "Os clientes do negócio marcam ou reservam diretamente, e cada marcação entra no calendário do negócio.",
  },
] as const;
export type FeatureId = (typeof FEATURES)[number]["id"];

/** Said under forms and the newsletter (user, 2026-11-04). */
export const CONFIRMATION_INCLUDED: Copy = {
  en: "Automatic email confirmation included",
  pt: "Inclui email automático de confirmação",
};

/** How the emails of the forms and the newsletter work (user, 2026-10-29;
    asked for either since 2026-11-04, and named for the emails, not the
    forms). Manual, chosen from the start: one automatic email and the
    answers saved in a database, every email after it written by hand.
    Automated: templates with placeholders, whose price is set later. The
    ids keep their first names ("simple", "complex"), which the database
    and the studio's emails already hold. */
export const FORM_KINDS = [
  {
    id: "simple",
    label: "Manual",
    pt: "Manual",
    note: "One automatic email, and the answers saved in a database. From there, every email is written by hand.",
    notePt: "Um email automático e o registo das respostas numa base de dados. Daí em diante, cada email é escrito à mão.",
  },
  {
    id: "complex",
    label: "Automated",
    pt: "Automatizado",
    note: "Templates with placeholders: the base of each email is already written, and only what changes is filled in. Price set later.",
    notePt: "Modelos com campos variáveis: a base de cada email já está escrita, e só se preenche o que muda. Preço a definir depois.",
  },
] as const;
export type FormKindId = (typeof FORM_KINDS)[number]["id"];

export const FORM_KIND_NOTE: Copy = {
  en: "A form where visitors ask for a date or time, which is then confirmed by hand, is also manual.",
  pt: "Um formulário em que se pede uma data ou hora, confirmada depois manualmente, também é manual.",
};

/** The third level, as one key. */
export const COMPLEX = [
  {
    id: "complex",
    // No name of its own (user, 2026-10-19): the tick stands beside what
    // it covers.
    label: "",
    pt: "",
    note: "An online shop, a client area with login, payments built into the website, or a connection to your internal software (invoicing, CRM…).",
    notePt: "Uma loja online, uma área de cliente com login, pagamentos integrados no website, ou uma ligação a software interno (faturação, CRM…).",
  },
] as const;

/** Said as soon as the third level is ticked, and in place of the
    estimate. */
export const OUT_OF_SCOPE: Copy = {
  en: "Projects like this are beyond what we take on right now. We'd rather tell you that honestly than deliver less than our best.",
  pt: "Projetos assim estão, por agora, fora do que fazemos. Preferimos dizê-lo com honestidade a entregar menos do que o nosso melhor.",
};

/** Two design levels for now (user, 2026-10-17); Advanced about 1.5x Essential+, as wide a range (2026-11-04). */
export const DESIGN = [
  {
    id: "essential",
    label: "Essential+",
    pt: "Essencial+",
    note: "Clean design that works with simple, elegant motion and animation",
    notePt: "Design limpo, que funciona com movimentos e animações simples e elegantes",
  },
  {
    id: "advanced",
    label: "Advanced",
    pt: "Avançado",
    note: "Richer layouts and animation, designed around your brand",
    notePt: "Composições e animações mais ricas, desenhadas à volta da marca",
  },
  /** Priced from Essential+ up to Advanced (user, 2026-10-27). */
  { id: "unsure", label: "Not sure", pt: "Não sei" },
] as const;
export type DesignId = (typeof DESIGN)[number]["id"];

/** Whether the client already has the website's texts. It never changes
    the price: writing them, when there are none, is included (user,
    2026-11-04). */
export const TEXTS = [
  { id: "yes", label: "Yes", pt: "Sim" },
  { id: "no", label: "No", pt: "Não" },
  { id: "unsure", label: "Not sure", pt: "Não sei" },
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
  /** Priced from the first plan up to the second (user, 2026-10-27). */
  { id: "unsure", label: "Not sure", pt: "Não sei" },
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
  /** Priced as one-time, the monthly service shown beside it as optional
      (user, 2026-10-27). */
  { id: "unsure", label: "Not sure", pt: "Não sei" },
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
  audience: AudienceId;
  /** Asked only of a business. */
  sector?: SectorId;
  sectorOther?: string;
  country: CountryId;
  countryOther?: string;
  web?: {
    design: DesignId;
    /** The size the price is keyed by: worked out from the mode and the
        kinds of page on the server (pagesFor), never taken from the form. */
    pages: PagesId;
    pageMode: PageModeId;
    /** A website's ticked kinds of page (the Home and About pages are
        always in), in the list's order. */
    pageTypes: PageTypeId[];
    /** Pages or sections written in besides the list: up to MAX_OTHERS. */
    pageOthers?: string[];
    /** "Not sure, you choose for me" on the pages and sections. */
    pagesUnsure?: true;
    languages: LanguageId[];
    languagesOther?: string;
    /** The second level's items, in the list's order (none is fine). */
    features: FeatureId[];
    /** With forms ticked: simple or complex. */
    formKind?: FormKindId;
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
    /** The one-time or monthly modality of SEO & GEO. */
    seoPlan?: SearchPlanId;
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
    /** Paid each month: SEO & GEO with the monthly service, and the back
        end (its lowest figure). */
    monthly?: number;
    /** The highest monthly figure, when it is a range (the back end: from
        maintenance alone to maintenance plus the platforms' paid plans). */
    monthlyMax?: number;
    /** Shown under the line: what it includes, what it assumes. */
    notes: string[];
    /** The website's price in two parts, when it has a back end (forms or
        a newsletter): what visitors see, and what works behind it. They
        add up to `amount` (user, 2026-10-30). */
    parts?: {
      id: "frontend" | "backend";
      label: string;
      detail: string;
      amount: Range;
      /** The back end's monthly fee, shown in its row (user, 2026-11-04),
          with what it pays for. */
      monthly?: number;
      monthlyMax?: number;
      monthlyNote?: string;
    }[];
    /** The figure rests on prices the studio has not confirmed yet:
        underlined in orange when the form is opened with ?revisao. */
    provisional?: boolean;
  }[];
  onRequest: { id: string; label: string; reason: string }[];
  /** What has no price yet (automated emails): named
      under the total, which they are understood to be on top of (user,
      2026-10-30). */
  later?: string[];
  /** The sum paid up front, or null when nothing could be priced. */
  total: Range | null;
  /** The sum paid each month after the first, when there is any. */
  monthly: number | null;
  /** The highest monthly sum, when some line has a range. */
  monthlyMax?: number;
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
  // Short, with no price (user, 2026-11-04).
  en: "Portuguese and English are included. Other languages are translated by an AI specialised in translation; if anything needs adjusting, we send you a simple document for your corrections.",
  pt: "O português e o inglês estão incluídos. As outras línguas são traduzidas por uma IA especializada em tradução; se algo precisar de ajustes, enviamos um documento simples para as correções.",
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
  /** The language the visitor wants the reply in, picked at the end of
      the form; the site's language when not picked. */
  reply?: "en" | "pt";
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
    search: services.includes("seo"),
  };
}
