import "server-only";
import { MARKET, PRICING, type Market, type Pricing } from "./pricing";
import {
  FEATURES,
  REGIONS,
  TRANSLATION_NOTE,
  countLanguages,
  labelOf,
  type Answers,
  type Estimate,
  type PagesId,
  type Range,
  type ServiceId,
} from "./questions";

/* ==================================================================
   The estimate

   Answers in, lines out. Each chosen service becomes either a priced
   line or an item "on request", with the reason the visitor is shown.
   Every amount is a range (user, 2026-10-17): two businesses with the
   same answers can still need different work, and the final proposal
   sets the exact figure inside the range. The website carries the
   spread; the photo plans are fixed packages. The monthly SEO & GEO
   line carries the first month up front and the monthly fee after it.
   ================================================================== */

const LABEL: Record<ServiceId, string> = {
  web: "Web design",
  photo: "Photo & video",
  seo: "SEO deep-dive",
  monthly: "Monthly SEO & GEO",
};

type Line = Estimate["lines"][number];
type Priced = { line: Omit<Line, "id" | "label"> } | { reason: string };

const fixed = (n: number): Range => ({ min: n, max: n });
const down10 = (n: number) => Math.floor(n / 10) * 10;
const up10 = (n: number) => Math.ceil(n / 10) * 10;

function web(a: NonNullable<Answers["web"]>, market: Market, p: Pricing["web"]): Priced {
  if (a.pages === "10+") return { reason: "More than 10 pages" };
  const notes = [p.includes];

  // Portuguese is included; every other language counts, English too.
  const others = a.languages.includes("other") ? countLanguages(a.languagesOther ?? "") : 0;
  const extraLanguages = (a.languages.includes("en") ? 1 : 0) + others;
  if (extraLanguages > 3) return { reason: "More than three additional languages" };

  const design = a.design === "advanced" ? 1 + p.advancedPercent / 100 : 1;
  const [fewest, most] = p.pages[a.pages][market];
  const extras =
    (a.identity === "yes" ? p.identity[market] : 0) +
    (extraLanguages ? p.languages[extraLanguages as 1 | 2 | 3] : 0) +
    p.forms[a.forms][market];

  // The pages' range, and on its ceiling the margin for what the form
  // does not ask.
  let min = fewest * design + extras;
  let max = (most * design + extras) * (1 + p.rangePercent / 100);

  // Writing the texts the client does not have, by the site's size.
  if (a.texts !== "all") {
    const [lo, hi] = p.texts[a.texts][a.pages];
    min += lo * p.textsMarket[market];
    max += hi * p.textsMarket[market];
    notes.push(
      a.texts === "none"
        ? "Includes writing the website's texts from what you tell us about your business."
        : "Includes writing the texts you don't have yet.",
    );
  }

  if (a.urgent === "yes") {
    min *= 1 + p.urgentPercent / 100;
    max *= 1 + p.urgentPercent / 100;
  }
  if (others > 0) notes.push(`*${TRANSLATION_NOTE}`);

  // The domain we register for a client without one, which does not
  // scale with the country or the deadline: added last.
  if (a.domain === "no") {
    min += p.newDomain.min;
    max += p.newDomain.max;
    notes.push(`Includes registering your domain, about €${p.newDomain.min}–${p.newDomain.max}.`);
  }

  return { line: { amount: { min: down10(min), max: up10(max) }, notes } };
}

function photo(a: NonNullable<Answers["photo"]>, country: Answers["country"], p: Pricing): Priced {
  if (country !== "PT") return { reason: "Shoot outside Portugal" };
  if (a.region && a.region !== "mainland") return { reason: `Shoot in ${labelOf(REGIONS, a.region)}` };
  return { line: { amount: fixed(p.photo[a.plan]), notes: [p.photoTravel] } };
}

function search(
  id: "seo" | "monthly",
  reach: NonNullable<Answers["search"]>["reach"],
  pages: PagesId | undefined,
  market: Market,
  p: Pricing,
): Priced {
  if (pages === "10+") return { reason: "More than 10 pages" };
  if (reach === "international") return { reason: "International reach" };
  if (!pages) return { reason: "Quoted in your proposal" };
  if (id === "seo") {
    return {
      line: {
        amount: fixed(p.seo[pages][reach][market].first),
        notes: ["A few days of in-depth SEO. Its effect is strongest in the first months."],
      },
    };
  }
  const monthly = p.seo[pages][reach][market].monthly + p.geo[pages][reach][market].monthly;
  return {
    line: { amount: fixed(monthly), monthly, notes: ["Keeps your SEO and GEO up to date, month after month."] },
  };
}

export function estimate(answers: Answers, pricing: Pricing = PRICING): Estimate {
  const out: Estimate = {
    currency: "EUR",
    lines: [],
    onRequest: [],
    total: null,
    monthly: null,
    timeline: null,
  };

  // Outside the countries priced online, everything is quoted.
  const market = answers.country === "other" ? null : MARKET[answers.country];

  const add = (id: ServiceId, price: (market: Market) => Priced) => {
    if (!market) {
      out.onRequest.push({ id, label: LABEL[id], reason: "Outside the countries we price online" });
      return;
    }
    const priced = price(market);
    if ("line" in priced) out.lines.push({ id, label: LABEL[id], ...priced.line });
    else out.onRequest.push({ id, label: LABEL[id], reason: priced.reason });
  };

  const { web: webAnswers, photo: photoAnswers, search: searchAnswers } = answers;
  for (const id of answers.services) {
    if (id === "web" && webAnswers) add("web", (m) => web(webAnswers, m, pricing.web));
    if (id === "photo" && photoAnswers) add("photo", () => photo(photoAnswers, answers.country, pricing));
    if ((id === "seo" || id === "monthly") && searchAnswers) {
      // With web design chosen too, the site's size is the web answer.
      const pages = webAnswers?.pages ?? searchAnswers.pages;
      add(id, (m) => search(id, searchAnswers.reach, pages, m, pricing));
    }
  }

  // Each extra feature is quoted in the proposal, not priced here.
  for (const f of webAnswers?.features ?? []) {
    out.onRequest.push({ id: `feature-${f}`, label: labelOf(FEATURES, f), reason: "Quoted in your proposal" });
  }

  if (out.lines.length) {
    out.total = {
      min: out.lines.reduce((a, l) => a + l.amount.min, 0),
      max: out.lines.reduce((a, l) => a + l.amount.max, 0),
    };
    const monthly = out.lines.reduce((a, l) => a + (l.monthly ?? 0), 0);
    out.monthly = monthly > 0 ? monthly : null;
  }

  // The website's timeline, whatever the country: it is the work's length.
  if (webAnswers && webAnswers.pages !== "10+") {
    if (webAnswers.urgent === "yes") out.timeline = { kind: "agreed" };
    else {
      const [min, max] = pricing.web.days[webAnswers.pages];
      out.timeline = { kind: "days", min, max };
    }
  }

  return out;
}
