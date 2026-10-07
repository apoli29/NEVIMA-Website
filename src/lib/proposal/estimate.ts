import "server-only";
import { PRICING, type Pricing } from "./pricing";
import { REGIONS, labelOf, type Answers, type Estimate, type PagesId, type ServiceId } from "./questions";

/* ==================================================================
   The estimate

   Answers in, lines out. Each chosen service becomes either a priced
   line or an item "on request", with the reason the visitor is shown.
   A service is put on request whole as soon as any part of its price
   is missing from the table, so an estimate is never quietly short.
   ================================================================== */

/** Shown when the table has no figure for something yet. */
const NOT_SET = "Quoted in your proposal";

const LABEL: Record<ServiceId, string> = {
  web: "Web design",
  photo: "Photo & video",
  seo: "SEO",
  geo: "GEO",
};

/** A step's price, or the reason it has none. */
type Priced = { amount: number } | { reason: string };

const sum = (...parts: (number | null)[]) =>
  parts.some((p) => p === null) ? null : parts.reduce<number>((a, p) => a + (p as number), 0);

function web(a: NonNullable<Answers["web"]>, p: Pricing["web"]): Priced {
  if (a.pages === "10+") return { reason: "More than 10 pages" };
  const base = p.pages[a.pages];
  // Portuguese and English are priced; languages typed under "Other" are
  // listed apart, on request (see estimate()).
  const priced = a.languages.filter((l) => l !== "other").length;
  const extraLanguages = priced > 1 ? (p.extraLanguage === null ? null : (priced - 1) * p.extraLanguage) : 0;
  const forms = Number(a.forms);
  const formsPrice = forms > 0 ? (p.perForm === null ? null : forms * p.perForm) : 0;
  const amount = sum(
    base,
    a.identity === "yes" ? p.identity : 0,
    extraLanguages,
    formsPrice,
    a.domain === "no" ? p.domainSetup : 0,
  );
  if (amount === null) return { reason: NOT_SET };
  if (a.urgent === "yes") {
    if (p.urgentPercent === null) return { reason: NOT_SET };
    return { amount: amount * (1 + p.urgentPercent / 100) };
  }
  return { amount };
}

function photo(a: NonNullable<Answers["photo"]>, country: Answers["country"], p: Pricing["photo"]): Priced {
  if (country !== "PT") return { reason: "Shoot outside Portugal" };
  if (a.region && a.region !== "mainland") return { reason: `Shoot in ${labelOf(REGIONS, a.region)}` };
  const amount = p[a.plan];
  return amount === null ? { reason: NOT_SET } : { amount };
}

function search(
  a: NonNullable<Answers["search"]>,
  pages: PagesId | undefined,
  p: Pricing["seo"],
): Priced {
  if (pages === "10+") return { reason: "More than 10 pages" };
  if (a.reach === "international") return { reason: "International reach" };
  if (!pages) return { reason: NOT_SET };
  const amount = sum(p.pages[pages], p.reach[a.reach]);
  return amount === null ? { reason: NOT_SET } : { amount };
}

export function estimate(answers: Answers, pricing: Pricing = PRICING): Estimate {
  const out: Estimate = { currency: "EUR", lines: [], onRequest: [], total: null, timeline: null };

  // Outside the countries priced online, everything is quoted.
  const factor = answers.country === "other" ? null : pricing.countryFactor[answers.country];
  // A listed country with no factor yet is simply not priced yet.
  const countryReason = answers.country === "other" ? "Outside the countries we price online" : NOT_SET;

  const add = (id: ServiceId, priced: Priced) => {
    if (factor === null) {
      out.onRequest.push({ id, label: LABEL[id], reason: countryReason });
    } else if ("amount" in priced) {
      out.lines.push({ id, label: LABEL[id], amount: Math.round(priced.amount * factor) });
    } else {
      out.onRequest.push({ id, label: LABEL[id], reason: priced.reason });
    }
  };

  for (const id of answers.services) {
    if (id === "web" && answers.web) {
      add("web", web(answers.web, pricing.web));
      // Languages typed under "Other" are their own item, unless the
      // whole website is already on request.
      const webPriced = out.lines.some((l) => l.id === "web");
      if (webPriced && answers.web.languages.includes("other")) {
        out.onRequest.push({
          id: "web-languages",
          label: "Website in other languages",
          reason: answers.web.languagesOther ?? "Other languages",
        });
      }
    }
    if (id === "photo" && answers.photo) add("photo", photo(answers.photo, answers.country, pricing.photo));
    if ((id === "seo" || id === "geo") && answers.search) {
      const pages = answers.web?.pages ?? answers.search.pages;
      add(id, search(answers.search, pages, pricing[id]));
    }
  }

  if (out.lines.length) out.total = out.lines.reduce((a, l) => a + l.amount, 0);

  // The website's timeline, whatever the country: it is the work's length.
  if (answers.web && answers.web.pages !== "10+") {
    const table = answers.web.urgent === "yes" ? pricing.web.urgentWeeks : pricing.web.weeks;
    const weeks = table[answers.web.pages];
    if (weeks) out.timeline = { min: weeks[0], max: weeks[1] };
  }

  return out;
}
