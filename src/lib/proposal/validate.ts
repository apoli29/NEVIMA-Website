import "server-only";
import {
  AUDIENCES,
  COUNTRIES,
  DESIGN,
  FEATURES,
  FORM_KINDS,
  LANGUAGES,
  MAX,
  PAGES,
  PAGE_MODES,
  PAGE_TYPES,
  PHOTO_PLANS,
  REACH,
  REGIONS,
  SEARCH_PLANS,
  SECTORS,
  SERVICES,
  TEXTS,
  YES_NO,
  ITEM_LISTS,
  MIN_CHOSEN,
  MAX_OTHERS,
  chosenCount,
  groupsFor,
  pagesFor,
  type Answers,
  type Contact,
} from "./questions";
import {
  CREDITS,
  DELIVERIES,
  MODELS,
  PARTNER_YES_NO,
  PROJECT_TYPES,
  SCREENS,
  STARTS,
  type PartnerAnswers,
} from "./partner";

/* ==================================================================
   Checking what the browser sent

   Nothing from the form is trusted: every answer is read against the
   list it must come from, free text is trimmed and capped, and a group
   is kept only when its service was chosen. What comes out is a clean
   Answers object, built afresh, never the request body passed along.
   ================================================================== */

type Result<T> = { ok: true; value: T } | { ok: false; error: string };

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const ids = (list: readonly { id: string }[]) => new Set(list.map((item) => item.id));

function one<T extends string>(list: readonly { id: T }[], v: unknown): T | null {
  return typeof v === "string" && ids(list).has(v) ? (v as T) : null;
}

function many<T extends string>(list: readonly { id: T }[], v: unknown): T[] | null {
  if (!Array.isArray(v) || v.length === 0) return null;
  const allowed = ids(list);
  if (!v.every((item) => typeof item === "string" && allowed.has(item))) return null;
  // In the list's own order, each once.
  return list.map((item) => item.id).filter((id) => v.includes(id));
}

/** Trimmed, with runs of whitespace closed up, or null when too long. */
function text(v: unknown, max: number): string | null {
  if (v === undefined || v === null) return "";
  if (typeof v !== "string") return null;
  const clean = v.replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : null;
}

export function readAnswers(raw: unknown): Result<Answers> {
  if (!isObject(raw)) return { ok: false, error: "answers" };

  const services = many(SERVICES, raw.services);
  // Every other service is only offered together with web design.
  if (!services || !services.includes("web")) return { ok: false, error: "services" };
  const audience = one(AUDIENCES, raw.audience);
  if (!audience) return { ok: false, error: "audience" };
  const country = one(COUNTRIES, raw.country);
  if (!country) return { ok: false, error: "country" };
  // Personal use is taken on in Portugal only.
  if (audience === "personal" && country !== "PT") return { ok: false, error: "audience" };

  const answers: Answers = { services, audience, country };
  // What the business does is asked of a business only.
  const sector = audience === "business" ? one(SECTORS, raw.sector) : undefined;
  if (audience === "business" && !sector) return { ok: false, error: "sector" };
  if (sector) answers.sector = sector;
  if (sector === "other") {
    const other = text(raw.sectorOther, MAX.short);
    if (!other) return { ok: false, error: "sectorOther" };
    answers.sectorOther = other;
  }
  if (country === "other") {
    const other = text(raw.countryOther, MAX.short);
    if (!other) return { ok: false, error: "countryOther" };
    answers.countryOther = other;
  }

  const groups = groupsFor(services);

  if (groups.web) {
    const w = isObject(raw.web) ? raw.web : {};
    const design = one(DESIGN, w.design);
    const pageMode = one(PAGE_MODES, w.pageMode);
    const languages = many(LANGUAGES, w.languages);
    const texts = one(TEXTS, w.texts);
    const domain = one(YES_NO, w.domain);
    const urgent = one(YES_NO, w.urgent);
    if (!design || !pageMode || !languages || !texts || !domain || !urgent) {
      return { ok: false, error: "web" };
    }
    // The page types are ticked for a website only: each from the list,
    // once, in the list's order (none is fine: Home and About stay). The
    // size is worked out here, never taken from the form.
    const rawTypes = pageMode === "website" && Array.isArray(w.pageTypes) ? w.pageTypes : [];
    if (!rawTypes.every((v) => typeof v === "string" && ids(PAGE_TYPES).has(v))) {
      return { ok: false, error: "pageTypes" };
    }
    const pageTypes = PAGE_TYPES.map((k) => k.id).filter((id) => rawTypes.includes(id));
    // Up to three pages or sections written in (empty ones dropped), and
    // "not sure, you choose": for a website only.
    const rawOthers = pageMode === "website" && Array.isArray(w.pageOthers) ? w.pageOthers : [];
    if (rawOthers.length > MAX_OTHERS) return { ok: false, error: "pageOthers" };
    const pageOthers: string[] = [];
    for (const o of rawOthers) {
      const clean = text(o, MAX.short);
      if (clean === null) return { ok: false, error: "pageOthers" };
      if (clean) pageOthers.push(clean);
    }
    const pagesUnsure = pageMode === "website" && w.pagesUnsure === true;
    // A website needs at least two pages or sections besides those always
    // included ("not sure" stands for two), and the two kinds of item list
    // exclude each other.
    if (pageMode === "website" && chosenCount(pageTypes, pageOthers.length, pagesUnsure) < MIN_CHOSEN) {
      return { ok: false, error: "pageTypes" };
    }
    if (ITEM_LISTS.every((id) => pageTypes.includes(id))) return { ok: false, error: "pageTypes" };
    const pages = pagesFor(pageMode, pageTypes, pageOthers.length, pagesUnsure);
    // "Not sure" stands alone: it does not go with any language.
    if (languages.includes("unsure") && languages.length > 1) return { ok: false, error: "languages" };
    // The second level: any of its items, none included. Forms come with
    // their kind, and simple ones with how many.
    const rawFeatures = w.features === undefined ? [] : w.features;
    const features = Array.isArray(rawFeatures) && rawFeatures.length === 0 ? [] : many(FEATURES, rawFeatures);
    if (!features) return { ok: false, error: "features" };
    // Forms and the newsletter come with how their emails work.
    const formKind = features.includes("forms") || features.includes("newsletter") ? one(FORM_KINDS, w.formKind) : undefined;
    if (formKind === null) return { ok: false, error: "formKind" };
    // Up to two references, or none when the visitor said they have none.
    const refs = Array.isArray(w.references) ? w.references : [];
    if (refs.length > 2) return { ok: false, error: "references" };
    const references: string[] = [];
    for (const r of refs) {
      const clean = text(r, MAX.url);
      if (clean === null) return { ok: false, error: "references" };
      if (clean) references.push(clean);
    }
    if (!references.length && w.noReferences !== true) return { ok: false, error: "references" };
    answers.web = { design, pages, pageMode, pageTypes, languages, features, texts, references, domain, urgent };
    if (pageOthers.length) answers.web.pageOthers = pageOthers;
    if (pagesUnsure) answers.web.pagesUnsure = true;
    if (formKind) answers.web.formKind = formKind;
    if (w.complex === true) answers.web.complex = true;
    if (!references.length) answers.web.noReferences = true;
    if (languages.includes("other")) {
      const other = text(w.languagesOther, MAX.short);
      if (!other) return { ok: false, error: "languagesOther" };
      answers.web.languagesOther = other;
    }
  }

  if (groups.photo) {
    const p = isObject(raw.photo) ? raw.photo : {};
    const plan = one(PHOTO_PLANS, p.plan);
    const town = text(p.town, MAX.short);
    if (!plan || !town) return { ok: false, error: "photo" };
    answers.photo = { plan, town };
    if (country === "PT") {
      const region = one(REGIONS, p.region);
      if (!region) return { ok: false, error: "region" };
      answers.photo.region = region;
    }
  }

  if (groups.search) {
    const s = isObject(raw.search) ? raw.search : {};
    const reach = one(REACH, s.reach);
    if (!reach) return { ok: false, error: "search" };
    answers.search = { reach };
    if (services.includes("seo")) {
      const plan = one(SEARCH_PLANS, s.seoPlan);
      if (!plan) return { ok: false, error: "seoPlan" };
      answers.search.seoPlan = plan;
    }
    // With web design chosen too, the site is the one being built: its
    // address is not asked and its size is the web answer.
    if (!groups.web) {
      const site = text(s.site, MAX.url);
      const pages = one(PAGES, s.pages);
      if (site === null || !pages) return { ok: false, error: "search" };
      if (site) answers.search.site = site;
      answers.search.pages = pages;
    }
  }

  return { ok: true, value: answers };
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^[+()\d][\d\s().-]{5,24}$/;

/** The business's name is asked of a business (and of the partners'
    form); a client for personal use has none. */
export function readContact(raw: unknown, { company: needsCompany = true } = {}): Result<Contact> {
  if (!isObject(raw)) return { ok: false, error: "contact" };
  const name = text(raw.name, MAX.short);
  const email = text(raw.email, MAX.short);
  const phone = text(raw.phone, 30);
  const company = text(raw.company, MAX.short);
  const message = typeof raw.message === "string" ? raw.message.trim() : raw.message ? null : "";
  if (!name) return { ok: false, error: "name" };
  if (!email || !EMAIL.test(email)) return { ok: false, error: "email" };
  if (!phone || !PHONE.test(phone)) return { ok: false, error: "phone" };
  if (company === null || (needsCompany && !company)) return { ok: false, error: "company" };
  if (message === null || message.length > MAX.message) return { ok: false, error: "message" };
  const reply = raw.reply === "pt" || raw.reply === "en" ? raw.reply : undefined;
  return { ok: true, value: { name, email, phone, company, message, ...(reply ? { reply } : {}) } };
}

/** The partners' answers (development companies): every pick from its
    list, and the stack confirmed as compatible. */
export function readPartner(raw: unknown): Result<PartnerAnswers> {
  if (!isObject(raw)) return { ok: false, error: "answers" };
  const project = one(PROJECT_TYPES, raw.project);
  const screens = one(SCREENS, raw.screens);
  const inspiration = one(PARTNER_YES_NO, raw.inspiration);
  const start = one(STARTS, raw.start);
  const delivery = one(DELIVERIES, raw.delivery);
  const model = one(MODELS, raw.model);
  const credit = one(CREDITS, raw.credit);
  if (!project || !screens || !inspiration || !start || !delivery || !model || !credit) {
    return { ok: false, error: "answers" };
  }
  if (raw.compatible !== "yes") return { ok: false, error: "compatible" };
  const answers: PartnerAnswers = {
    project,
    screens,
    inspiration,
    compatible: "yes",
    start,
    delivery,
    model,
    credit,
    nda: raw.nda === true,
  };
  if (screens === "20+") {
    const estimate = text(raw.screensEstimate, MAX.short);
    if (!estimate) return { ok: false, error: "screensEstimate" };
    answers.screensEstimate = estimate;
  }
  if (inspiration === "yes") {
    const link = text(raw.inspirationLink, MAX.url);
    if (link === null) return { ok: false, error: "inspirationLink" };
    if (link) answers.inspirationLink = link;
  }
  return { ok: true, value: answers };
}
