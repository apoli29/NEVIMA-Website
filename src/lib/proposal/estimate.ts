import "server-only";
import { translator, type Lang, type Translate } from "../i18n";
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

   Its words come back in the visitor's language (`lang`, sent with the
   answers); the figures are the same in both.
   ================================================================== */

const LABEL: Record<ServiceId, { en: string; pt: string }> = {
  web: { en: "Web design", pt: "Web design" },
  identity: { en: "Visual identity", pt: "Identidade visual" },
  photo: { en: "Photo shoot", pt: "Sessão fotográfica" },
  seo: { en: "SEO", pt: "SEO" },
  geo: { en: "GEO", pt: "GEO" },
};

type Line = Estimate["lines"][number];
type Priced = { line: Omit<Line, "id" | "label"> } | { reason: string };

const fixed = (n: number): Range => ({ min: n, max: n });
const down10 = (n: number) => Math.floor(n / 10) * 10;
const up10 = (n: number) => Math.ceil(n / 10) * 10;

function web(a: NonNullable<Answers["web"]>, market: Market, p: Pricing["web"], t: Translate): Priced {
  if (a.pages === "10+") return { reason: t("More than 10 pages", "Mais de 10 páginas") };
  const notes = [t(p.includes), t(p.marginNote)];

  // Portuguese is included; every other language counts, English too.
  const others = a.languages.includes("other") ? countLanguages(a.languagesOther ?? "") : 0;
  const extraLanguages = (a.languages.includes("en") ? 1 : 0) + others;
  if (extraLanguages > 3) return { reason: t("More than three additional languages", "Mais de três línguas adicionais") };

  const design = a.design === "advanced" ? 1 + p.advancedPercent / 100 : 1;
  const [fewest, most] = p.pages[a.pages][market];
  const extras = extraLanguages ? p.languages[extraLanguages as 1 | 2 | 3] : 0;

  // The pages' range, and on its ceiling the margin for what the form
  // does not ask.
  let min = fewest * design + extras;
  let max = (most * design + extras) * (1 + p.rangePercent / 100);

  // Writing the texts the client does not have, by the site's size.
  if (a.texts === "no") {
    const [lo, hi] = p.texts[a.pages];
    min += lo * p.textsMarket[market];
    max += hi * p.textsMarket[market];
    notes.push(
      t(
        "Includes writing the website's texts from what you tell us about your business.",
        "Inclui a escrita dos textos do website a partir do que nos contares sobre o teu negócio.",
      ),
    );
  }

  if (a.urgent === "yes") {
    min *= 1 + p.urgentPercent / 100;
    max *= 1 + p.urgentPercent / 100;
  }
  if (others > 0) notes.push(`*${t(TRANSLATION_NOTE)}`);

  // The domain we register for a client without one, which does not
  // scale with the country or the deadline: added last.
  if (a.domain === "no") {
    min += p.newDomain.min;
    max += p.newDomain.max;
    notes.push(
      t(
        `Includes registering your domain, about €${p.newDomain.min}–${p.newDomain.max}.`,
        `Inclui o registo do teu domínio, cerca de ${p.newDomain.min}–${p.newDomain.max} €.`,
      ),
    );
  }

  // The range is never wider than maxSpreadPercent of its floor (user,
  // 2026-10-17), whatever the margin and the extras add up to.
  const spread = a.pages === "unsure" ? p.unsureSpreadPercent : p.maxSpreadPercent;
  if (a.pages === "unsure") {
    notes.push(
      t(
        "Estimated for 3 to 8 pages, so the range is wider than with a set number of pages.",
        "Estimado para 3 a 8 páginas, por isso o intervalo é mais largo do que com um número de páginas definido.",
      ),
    );
  }
  const floor = down10(min);
  const ceiling = Math.min(up10(max), down10(floor * (1 + spread / 100)));

  // What the website receives from its visitors (the second level), each
  // item a range of its own, carried whole: added after the cap, raised
  // with the rest on an urgent deadline.
  const f = features(a, market, p, t);
  const rush = a.urgent === "yes" ? 1 + p.urgentPercent / 100 : 1;
  if (f.listed.length) {
    notes.push(t(`Includes ${f.listed.join(", ")}.`, `Inclui ${f.listed.join(", ")}.`));
  }
  notes.push(...f.notes);
  return {
    line: {
      amount: { min: down10(floor + f.min * rush), max: up10(ceiling + f.max * rush) },
      notes,
      provisional: a.texts === "no",
    },
  };
}

/** The second level's items, priced by the market: their range, how
    they read in the line's note, and what is left for the proposal. */
function features(a: NonNullable<Answers["web"]>, market: Market, p: Pricing["web"], t: Translate) {
  const k = p.featuresMarket[market];
  const out = { min: 0, max: 0, listed: [] as string[], notes: [] as string[] };
  const add = ([lo, hi]: [number, number], what: string) => {
    out.min += lo * k;
    out.max += hi * k;
    out.listed.push(what);
  };
  const has = (id: (typeof a.features)[number]) => a.features.includes(id);
  if (has("forms") && a.forms) {
    if (a.forms === "more") out.notes.push(t("More than 3 forms: quoted in your proposal.", "Mais de 3 formulários: orçamentados na tua proposta."));
    else add(p.features.forms[a.forms], t(a.forms === "1" ? "1 form" : `${a.forms} forms`, a.forms === "1" ? "1 formulário" : `${a.forms} formulários`));
  }
  if (has("newsletter")) add(p.features.newsletter, t("a newsletter sign-up", "uma inscrição na newsletter"));
  if (has("emails") && a.emails) {
    if (a.emails === "more") {
      out.notes.push(t("More than 3 automatic emails: quoted in your proposal.", "Mais de 3 emails automáticos: orçamentados na tua proposta."));
    } else {
      const n = Number(a.emails);
      const [fl, fh] = p.features.emailFirst;
      const [nl, nh] = p.features.emailNext;
      add([fl + nl * (n - 1), fh + nh * (n - 1)], t(n === 1 ? "1 automatic email" : `${n} automatic emails`, n === 1 ? "1 email automático" : `${n} emails automáticos`));
    }
  }
  if (has("bookings")) add(p.features.bookings, t("bookings", "marcações"));
  return out;
}

/** The logo and, where it applies, the symbol: a fixed price, raised
    with the website when the deadline is urgent. */
function identity(urgent: boolean, market: Market, p: Pricing["web"], t: Translate): Priced {
  const amount = p.identity[market] * (urgent ? 1 + p.urgentPercent / 100 : 1);
  return {
    line: {
      amount: fixed(Math.round(amount)),
      notes: [t("Logo and, where it applies, symbol.", "Logótipo e, quando se aplique, símbolo.")],
    },
  };
}

function photo(a: NonNullable<Answers["photo"]>, country: Answers["country"], p: Pricing, t: Translate): Priced {
  if (country !== "PT") return { reason: t("Shoot outside Portugal", "Sessão fora de Portugal") };
  if (a.region && a.region !== "mainland") {
    const region = labelOf(REGIONS, a.region, t<Lang>("en", "pt"));
    return { reason: t(`Shoot in ${region}`, a.region === "azores" ? `Sessão nos ${region}` : `Sessão na ${region}`) };
  }
  return { line: { amount: fixed(p.photo[a.plan]), notes: [t(p.photoTravel)] } };
}

function search(
  id: "seo" | "geo",
  plan: SearchPlanId,
  reach: NonNullable<Answers["search"]>["reach"],
  pages: PagesId | undefined,
  market: Market,
  p: Pricing,
  t: Translate,
): Priced {
  if (pages === "10+") return { reason: t("More than 10 pages", "Mais de 10 páginas") };
  if (reach === "international") return { reason: t("International reach", "Alcance internacional") };
  if (!pages) return { reason: t("Quoted in your proposal", "Orçamentado na tua proposta") };
  // Not sure about the pages: priced as a mid-sized site.
  const { first, monthly } = p[id][pages === "unsure" ? "4-6" : pages][reach][market];
  const notes = [
    t(
      "One-time: strongest in the short term, its effect fades over the medium to long term.",
      "Pontual: mais forte a curto prazo, o efeito vai-se perdendo a médio e longo prazo.",
    ),
  ];
  if (plan === "monthly") {
    notes.push(
      t(
        "Plus the monthly service, which keeps the practices as effective as they can be.",
        "Mais o serviço mensal, que mantém as práticas o mais eficazes possível.",
      ),
    );
    return { line: { amount: fixed(first), monthly, notes, provisional: true } };
  }
  return { line: { amount: fixed(first), notes, provisional: true } };
}

export function estimate(answers: Answers, pricing: Pricing = PRICING, lang: Lang = "en"): Estimate {
  const t = translator(lang);
  const out: Estimate = {
    currency: "EUR",
    lines: [],
    onRequest: [],
    total: null,
    monthly: null,
    timeline: null,
  };

  // A project that needs the third level (an online shop, logins,
  // payments, internal software) is not one we take on for now: nothing
  // is priced, and the form says so.
  if (answers.web?.complex) {
    out.outOfScope = true;
    return out;
  }

  // Outside the countries priced online, everything is quoted.
  const market = answers.country === "other" ? null : MARKET[answers.country];

  const add = (id: ServiceId, price: (market: Market) => Priced) => {
    if (!market) {
      out.onRequest.push({
        id,
        label: t(LABEL[id]),
        reason: t("Outside the countries we price online", "Fora dos países que orçamentamos online"),
      });
      return;
    }
    const priced = price(market);
    if ("line" in priced) out.lines.push({ id, label: t(LABEL[id]), ...priced.line });
    else out.onRequest.push({ id, label: t(LABEL[id]), reason: priced.reason });
  };

  const { web: webAnswers, photo: photoAnswers, search: searchAnswers } = answers;
  for (const id of answers.services) {
    if (id === "web" && webAnswers) add("web", (m) => web(webAnswers, m, pricing.web, t));
    if (id === "identity") add("identity", (m) => identity(webAnswers?.urgent === "yes", m, pricing.web, t));
    if (id === "photo" && photoAnswers) add("photo", () => photo(photoAnswers, answers.country, pricing, t));
    if ((id === "seo" || id === "geo") && searchAnswers) {
      // With web design chosen too, the site's size is the web answer.
      const pages = webAnswers?.pages ?? searchAnswers.pages;
      const plan = (id === "seo" ? searchAnswers.seoPlan : searchAnswers.geoPlan) ?? "once";
      add(id, (m) => search(id, plan, searchAnswers.reach, pages, m, pricing, t));
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
