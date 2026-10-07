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
  type ServiceId,
} from "./questions";

/* ==================================================================
   The estimate

   Answers in, lines out. Each chosen service becomes either a priced
   line or an item "on request", with the reason the visitor is shown.
   SEO and GEO are paid monthly: their line carries the first month up
   front and the monthly fee after it.
   ================================================================== */

const LABEL: Record<ServiceId, string> = {
  web: "Web design",
  photo: "Photo & video",
  seo: "SEO",
  geo: "GEO",
};

type Line = Estimate["lines"][number];
type Priced = { line: Omit<Line, "id" | "label"> } | { reason: string };

const euros = (n: number) => `€${n}`;

function web(a: NonNullable<Answers["web"]>, market: Market, p: Pricing["web"]): Priced {
  if (a.pages === "10+") return { reason: "More than 10 pages" };
  const notes = [p.includes];

  // Portuguese is included; English and every other language are paid.
  const others = a.languages.includes("other") ? countLanguages(a.languagesOther ?? "") : 0;
  let amount =
    p.pages[a.pages][market] +
    (a.identity === "yes" ? p.identity[market] : 0) +
    (a.languages.includes("en") ? p.english[market] : 0) +
    others * p.otherLanguage[market] +
    p.forms[a.forms][market];

  if (a.urgent === "yes") amount *= 1 + p.urgentPercent / 100;
  if (others > 0) notes.push(`*${TRANSLATION_NOTE}`);

  // What the client paid for their domain, which does not scale with the
  // country or the deadline: taken off last.
  if (a.domain === "yes") {
    const d = p.existingDomain;
    amount -= d.estimate;
    notes.push(
      `Takes off an estimated ${euros(d.estimate)} for your existing domain: we deduct what you paid for it, ${euros(d.min)} to ${euros(d.max)}, with proof.`,
    );
  }

  return { line: { amount: Math.round(amount), notes } };
}

function photo(a: NonNullable<Answers["photo"]>, country: Answers["country"], p: Pricing): Priced {
  if (country !== "PT") return { reason: "Shoot outside Portugal" };
  if (a.region && a.region !== "mainland") return { reason: `Shoot in ${labelOf(REGIONS, a.region)}` };
  return { line: { amount: p.photo[a.plan], notes: [p.photoTravel] } };
}

function search(
  reach: NonNullable<Answers["search"]>["reach"],
  pages: PagesId | undefined,
  market: Market,
  table: Pricing["seo"],
): Priced {
  if (pages === "10+") return { reason: "More than 10 pages" };
  if (reach === "international") return { reason: "International reach" };
  if (!pages) return { reason: "Quoted in your proposal" };
  const { first, monthly } = table[pages][reach][market];
  return { line: { amount: first, monthly, notes: [] } };
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
    if ((id === "seo" || id === "geo") && searchAnswers) {
      // With web design chosen too, the site's size is the web answer.
      const pages = webAnswers?.pages ?? searchAnswers.pages;
      add(id, (m) => search(searchAnswers.reach, pages, m, pricing[id]));
    }
  }

  if (out.lines.length) {
    out.total = out.lines.reduce((a, l) => a + l.amount, 0);
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
