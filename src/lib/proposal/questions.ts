/* ==================================================================
   The free-proposal questions

   Shared by the form (which shows them) and the server (which checks
   the answers against them before pricing anything). Only ids and the
   words shown to the visitor live here: no price is ever in this file,
   because it is bundled into the browser. The prices are in
   pricing.ts, which only the API routes import.
   ================================================================== */

export const SERVICES = [
  { id: "web", label: "Web design" },
  { id: "photo", label: "Photo & video" },
  { id: "seo", label: "SEO" },
  { id: "geo", label: "GEO" },
] as const;
export type ServiceId = (typeof SERVICES)[number]["id"];

export const COUNTRIES = [
  { id: "PT", label: "Portugal" },
  { id: "ES", label: "Spain" },
  { id: "IT", label: "Italy" },
  { id: "US", label: "USA" },
  { id: "other", label: "Other" },
] as const;
export type CountryId = (typeof COUNTRIES)[number]["id"];

/** Website size. Web design stops at 10 pages; past that is quoted. */
export const PAGES = [
  { id: "landing", label: "Landing page" },
  { id: "4-6", label: "4–6" },
  { id: "7-10", label: "7–10" },
  { id: "10+", label: "More than 10" },
] as const;
export type PagesId = (typeof PAGES)[number]["id"];

export const LANGUAGES = [
  { id: "pt", label: "Portuguese" },
  { id: "en", label: "English" },
  { id: "other", label: "Other" },
] as const;
export type LanguageId = (typeof LANGUAGES)[number]["id"];

export const FORMS = [
  { id: "0", label: "None" },
  { id: "1", label: "1" },
  { id: "2", label: "2" },
  { id: "3", label: "3" },
] as const;
export type FormsId = (typeof FORMS)[number]["id"];

export const YES_NO = [
  { id: "yes", label: "Yes" },
  { id: "no", label: "No" },
] as const;
export type YesNo = (typeof YES_NO)[number]["id"];

export const PHOTO_PLANS = [
  { id: "photos", label: "Photos only", note: "2.5-hour shoot, 20–25 edited photos" },
  { id: "photos-video", label: "Photos & video", note: "4-hour shoot, 30–40 edited photos, video up to 1 min" },
] as const;
export type PhotoPlanId = (typeof PHOTO_PLANS)[number]["id"];

/** The shoot is only offered on the mainland; the islands are quoted. */
export const REGIONS = [
  { id: "mainland", label: "Mainland" },
  { id: "madeira", label: "Madeira" },
  { id: "azores", label: "Azores" },
] as const;
export type RegionId = (typeof REGIONS)[number]["id"];

export const REACH = [
  { id: "local", label: "Local" },
  { id: "national", label: "National" },
  { id: "international", label: "International" },
] as const;
export type ReachId = (typeof REACH)[number]["id"];

/** The answers, as the form sends them and the server reads them. A
    group is present only when its service was chosen. */
export type Answers = {
  services: ServiceId[];
  country: CountryId;
  countryOther?: string;
  web?: {
    identity: YesNo;
    pages: PagesId;
    languages: LanguageId[];
    languagesOther?: string;
    forms: FormsId;
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
  };
};

/** What the server sends back for a set of answers. Amounts are whole
    euros. An item the table cannot price is listed under onRequest. */
export type Estimate = {
  currency: "EUR";
  lines: {
    id: ServiceId;
    label: string;
    /** Paid up front (for SEO and GEO, the first month). */
    amount: number;
    /** Paid each month after the first (SEO and GEO). */
    monthly?: number;
    /** Shown under the line: what it includes, what it assumes. */
    notes: string[];
  }[];
  onRequest: { id: string; label: string; reason: string }[];
  /** The sum paid up front, or null when nothing could be priced. */
  total: number | null;
  /** The sum paid each month after the first, when there is any. */
  monthly: number | null;
  /** How long the website takes, when web design was chosen: working
      days, or agreed between both sides on an urgent deadline. */
  timeline: { kind: "days"; min: number; max: number } | { kind: "agreed" } | null;
};

/** Said wherever languages other than Portuguese and English are asked
    for or priced (user). */
export const TRANSLATION_NOTE =
  "Languages other than Portuguese and English are translated by an AI specialised in translation, with over 95% accuracy. We always send you a final document, so you can point out any sentence you'd like written differently.";

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

export const labelOf = <T extends readonly { id: string; label: string }[]>(list: T, id: string) =>
  list.find((item) => item.id === id)?.label ?? id;

/** Which service groups a set of chosen services asks about, in order. */
export function groupsFor(services: readonly ServiceId[]) {
  return {
    web: services.includes("web"),
    photo: services.includes("photo"),
    search: services.includes("seo") || services.includes("geo"),
  };
}
