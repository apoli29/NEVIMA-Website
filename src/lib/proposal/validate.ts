import "server-only";
import {
  COUNTRIES,
  DESIGN,
  FORMS,
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
    const forms = one(FORMS, w.forms);
    const texts = one(TEXTS, w.texts);
    const domain = one(YES_NO, w.domain);
    const urgent = one(YES_NO, w.urgent);
    if (!design || !pages || !languages || !forms || !texts || !domain || !urgent) {
      return { ok: false, error: "web" };
    }
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
    answers.web = { design, pages, languages, forms, texts, references, domain, urgent };
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
