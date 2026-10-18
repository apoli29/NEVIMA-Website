import "server-only";
import {
  COUNTRIES,
  COUNTS,
  DESIGN,
  FEATURES,
  LANGUAGES,
  MAX,
  PAGES,
  PHOTO_PLANS,
  REACH,
  REGIONS,
  SEARCH_PLANS,
  SECTORS,
  SERVICES,
  TEXTS,
  YES_NO,
  groupsFor,
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
  const sector = one(SECTORS, raw.sector);
  if (!sector) return { ok: false, error: "sector" };
  const country = one(COUNTRIES, raw.country);
  if (!country) return { ok: false, error: "country" };

  const answers: Answers = { services, sector, country };
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
    const pages = one(PAGES, w.pages);
    const languages = many(LANGUAGES, w.languages);
    const texts = one(TEXTS, w.texts);
    const domain = one(YES_NO, w.domain);
    const urgent = one(YES_NO, w.urgent);
    if (!design || !pages || !languages || !texts || !domain || !urgent) {
      return { ok: false, error: "web" };
    }
    // The second level: any of its items, none included. A count comes
    // with forms and with automatic emails, which only go with forms or
    // the newsletter.
    const rawFeatures = w.features === undefined ? [] : w.features;
    const features = Array.isArray(rawFeatures) && rawFeatures.length === 0 ? [] : many(FEATURES, rawFeatures);
    if (!features) return { ok: false, error: "features" };
    const forms = features.includes("forms") ? one(COUNTS, w.forms) : undefined;
    if (forms === null) return { ok: false, error: "forms" };
    if (features.includes("emails") && !features.includes("forms") && !features.includes("newsletter")) {
      return { ok: false, error: "emails" };
    }
    const emails = features.includes("emails") ? one(COUNTS, w.emails) : undefined;
    if (emails === null) return { ok: false, error: "emails" };
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
    answers.web = { design, pages, languages, features, texts, references, domain, urgent };
    if (forms) answers.web.forms = forms;
    if (emails) answers.web.emails = emails;
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
    if (services.includes("geo")) {
      const plan = one(SEARCH_PLANS, s.geoPlan);
      if (!plan) return { ok: false, error: "geoPlan" };
      answers.search.geoPlan = plan;
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

export function readContact(raw: unknown): Result<Contact> {
  if (!isObject(raw)) return { ok: false, error: "contact" };
  const name = text(raw.name, MAX.short);
  const email = text(raw.email, MAX.short);
  const phone = text(raw.phone, 30);
  const company = text(raw.company, MAX.short);
  const message = typeof raw.message === "string" ? raw.message.trim() : raw.message ? null : "";
  if (!name) return { ok: false, error: "name" };
  if (!email || !EMAIL.test(email)) return { ok: false, error: "email" };
  if (!phone || !PHONE.test(phone)) return { ok: false, error: "phone" };
  if (!company) return { ok: false, error: "company" };
  if (message === null || message.length > MAX.message) return { ok: false, error: "message" };
  if (raw.consent !== true) return { ok: false, error: "consent" };
  return { ok: true, value: { name, email, phone, company, message, consent: true } };
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
