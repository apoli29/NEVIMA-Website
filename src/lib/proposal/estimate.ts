import "server-only";
import { MARKET, PRICING, type Market, type Pricing } from "./pricing";
import {
  REGIONS,
  TRANSLATION_NOTE,
  countLanguages,
  labelOf,
  type Answers,
  type Estimate,
  type PagesId,
  type Range,
  type SearchPlanId,
  type ServiceId,
} from "./questions";

/* ==================================================================
   The estimate

   Answers in, lines out. Each chosen service becomes either a priced
   line or an item "on request", with the reason the visitor is shown.
   Every amount is a range (user, 2026-10-17): two businesses with the
   same answers can still need different work, and the final proposal
   sets the exact figure inside the range. The website carries the
   spread; the photo plans are fixed packages. SEO and GEO carry their
   one-time work up front and, when chosen, the monthly fee after it.
   ================================================================== */

const LABEL: Record<ServiceId, string> = {
  web: "Web design",
  identity: "Visual identity",
  photo: "Photo shoot",
  seo: "SEO",
  geo: "GEO",
};

type Line = Estimate["lines"][number];
type Priced = { line: Omit<Line, "id" | "label"> } | { reason: string };

const fixed = (n: number): Range => ({ min: n, max: n });
const down10 = (n: number) => Math.floor(n / 10) * 10;
const up10 = (n: number) => Math.ceil(n / 10) * 10;

function web(a: NonNullable<Answers["web"]>, market: Market, p: Pricing["web"]): Priced {
  if (a.pages === "10+") return { reason: "More than 10 pages" };
  const notes = [p.includes, p.marginNote];

  // Portuguese is included; every other language counts, English too.
  const others = a.languages.includes("other") ? countLanguages(a.languagesOther ?? "") : 0;
  const extraLanguages = (a.languages.includes("en") ? 1 : 0) + others;
  if (extraLanguages > 3) return { reason: "More than three additional languages" };

  const design = a.design === "advanced" ? 1 + p.advancedPercent / 100 : 1;
  const [fewest, most] = p.pages[a.pages][market];
  const extras =
    (extraLanguages ? p.languages[extraLanguages as 1 | 2 | 3] : 0) +
    p.forms[a.forms][market];

  // The pages' range, and on its ceiling the margin for what the form
  // does not ask.
  let min = fewest * design + extras;
  let max = (most * design + extras) * (1 + p.rangePercent / 100);

  // Writing the texts the client does not have, by the site's size.
  if (a.texts === "no") {
    const [lo, hi] = p.texts[a.pages];
    min += lo * p.textsMarket[market];
    max += hi * p.textsMarket[market];
    notes.push("Includes writing the website's texts from what you tell us about your business.");
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

  // The range is never wider than maxSpreadPercent of its floor (user,
  // 2026-10-17), whatever the margin and the extras add up to.
  const spread = a.pages === "unsure" ? p.unsureSpreadPercent : p.maxSpreadPercent;
  if (a.pages === "unsure") notes.push("Estimated for 3 to 8 pages, so the range is wider than with a set number of pages.");
  const floor = down10(min);
  const ceiling = Math.min(up10(max), down10(floor * (1 + spread / 100)));
  return { line: { amount: { min: floor, max: ceiling }, notes, provisional: a.texts === "no" } };
}

/** The logo and, where it applies, the symbol: a fixed price, raised
    with the website when the deadline is urgent. */
function identity(urgent: boolean, market: Market, p: Pricing["web"]): Priced {
  const amount = p.identity[market] * (urgent ? 1 + p.urgentPercent / 100 : 1);
  return { line: { amount: fixed(Math.round(amount)), notes: ["Logo and, where it applies, symbol."] } };
}

function photo(a: NonNullable<Answers["photo"]>, country: Answers["country"], p: Pricing): Priced {
  if (country !== "PT") return { reason: "Shoot outside Portugal" };
  if (a.region && a.region !== "mainland") return { reason: `Shoot in ${labelOf(REGIONS, a.region)}` };
  return { line: { amount: fixed(p.photo[a.plan]), notes: [p.photoTravel] } };
}

function search(
  id: "seo" | "geo",
  plan: SearchPlanId,
  reach: NonNullable<Answers["search"]>["reach"],
  pages: PagesId | undefined,
  market: Market,
  p: Pricing,
): Priced {
  if (pages === "10+") return { reason: "More than 10 pages" };
  if (reach === "international") return { reason: "International reach" };
  if (!pages) return { reason: "Quoted in your proposal" };
  // Not sure about the pages: priced as a mid-sized site.
  const { first, monthly } = p[id][pages === "unsure" ? "4-6" : pages][reach][market];
  const notes = ["One-time: strongest in the short term, its effect fades over the medium to long term."];
  if (plan === "monthly") {
    notes.push("Plus the monthly service, which keeps the practices as effective as they can be.");
    return { line: { amount: fixed(first), monthly, notes, provisional: true } };
  }
  return { line: { amount: fixed(first), notes, provisional: true } };
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
    if (id === "identity") add("identity", (m) => identity(webAnswers?.urgent === "yes", m, pricing.web));
    if (id === "photo" && photoAnswers) add("photo", () => photo(photoAnswers, answers.country, pricing));
    if ((id === "seo" || id === "geo") && searchAnswers) {
      // With web design chosen too, the site's size is the web answer.
      const pages = webAnswers?.pages ?? searchAnswers.pages;
      const plan = (id === "seo" ? searchAnswers.seoPlan : searchAnswers.geoPlan) ?? "once";
      add(id, (m) => search(id, plan, searchAnswers.reach, pages, m, pricing));
    }
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
