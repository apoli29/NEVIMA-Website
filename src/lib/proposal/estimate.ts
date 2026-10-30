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
/** Ceilings round up to 5, so 380 + 30% reads 495 and not 500. */
const up5 = (n: number) => Math.ceil(n / 5) * 5;

function web(
  a: NonNullable<Answers["web"]>,
  market: Market,
  p: Pricing["web"],
  t: Translate,
  personal = false,
): Priced {
  if (a.pages === "10+") return { reason: t("More than 10 pages", "Mais de 10 páginas") };
  const notes = [t(p.includes), t(p.marginNote)];

  // Portuguese and English are included; each other language is paid.
  const others = a.languages.includes("other") ? countLanguages(a.languagesOther ?? "") : 0;
  if (others > 3) return { reason: t("More than three additional languages", "Mais de três línguas adicionais") };

  // "Not sure" about the design, the texts or the languages (user,
  // 2026-10-27): the range runs from the price with the cheaper answers
  // to the price with the dearer ones, so it never passes what the dearer
  // answer would have cost on its own.
  const languagesUnsure = a.languages.includes("unsure");
  if (a.design === "unsure" || a.texts === "unsure" || languagesUnsure) {
    const cheap: typeof a = {
      ...a,
      design: a.design === "unsure" ? "essential" : a.design,
      texts: a.texts === "unsure" ? "yes" : a.texts,
      languages: languagesUnsure ? ["pt", "en"] : a.languages,
    };
    const dear: typeof a = {
      ...a,
      design: a.design === "unsure" ? "advanced" : a.design,
      texts: a.texts === "unsure" ? "no" : a.texts,
      languages: languagesUnsure ? ["pt", "en", "other"] : a.languages,
      languagesOther: languagesUnsure ? "one more" : a.languagesOther,
    };
    const low = web(cheap, market, p, t, personal);
    const high = web(dear, market, p, t, personal);
    if (!("line" in low)) return low;
    if (!("line" in high)) return high;
    const what = [
      a.design === "unsure" && t("the Advanced design level", "o nível de design Avançado"),
      languagesUnsure && t("one more language", "mais uma língua"),
      a.texts === "unsure" && t("writing the texts", "a escrita dos textos"),
    ].filter(Boolean);
    // The two parts follow the same ends as the line, with the sentences
    // written from the answers as given.
    const [lf, lb] = low.line.parts ?? [];
    const [hf, hb] = high.line.parts ?? [];
    const parts: Line["parts"] =
      lf && lb && hf && hb
        ? [
            { ...lf, detail: `${t("What visitors see: ", "O que os visitantes veem: ")}${frontDetail(a, others, t)}.`, amount: { min: lf.amount.min, max: hf.amount.max } },
            { ...lb, amount: { min: lb.amount.min, max: hb.amount.max } },
          ]
        : undefined;
    return {
      line: {
        amount: { min: low.line.amount.min, max: high.line.amount.max },
        parts,
        notes: [
          ...low.line.notes,
          t(
            `Some answers are "not sure", so the upper end also allows for ${what.join(", ")}.`,
            `Algumas respostas são "não sei", por isso o valor mais alto contempla também ${what.join(", ")}.`,
          ),
        ],
        provisional: low.line.provisional || high.line.provisional,
      },
    };
  }

  // The pages' range (the same share over the floor for every size).
  // Advanced costs more than Essential+ at both ends alike (user,
  // 2026-10-30).
  const advanced = a.design === "advanced";
  const design = advanced ? 1 + p.advancedPercent / 100 : 1;
  const [fewest, most] = p.pages[a.pages][market];
  const extras = others * p.perLanguage;
  // Advanced is Essential+ ×1.35 unless the size has a price of its own for
  // it; the ceiling keeps the size's share over its floor (none for the
  // landing page, a fixed price for each design level).
  const start = advanced ? (p.advancedFloors[a.pages]?.[market] ?? fewest * design) : fewest;
  let min = start + extras;
  let max = start * (most / fewest) + extras;

  // Writing the texts the client does not have, by the site's size.
  if (a.texts === "no") {
    const [lo, hi] = p.texts[a.pages];
    min += lo * p.textsMarket[market];
    max += hi * p.textsMarket[market];
    notes.push(
      t(
        personal
          ? "Includes writing the website's texts from what you tell us about your project."
          : "Includes writing the website's texts from what you tell us about your business.",
        personal
          ? "Inclui a escrita dos textos do website a partir da informação dada sobre o projeto."
          : "Inclui a escrita dos textos do website a partir da informação dada sobre o negócio.",
      ),
    );
  }

  if (a.urgent === "yes") {
    min *= 1 + p.urgentPercent / 100;
    max *= 1 + p.urgentPercent / 100;
  }
  if (others > 0) notes.push(`*${t(TRANSLATION_NOTE)}`);

  // A client without a domain registers and pays for it directly, in
  // their own name (contract v1.9, clause 13): its cost is shown for
  // reference and never added to the range.
  if (a.domain === "no") {
    notes.push(
      t(
        `Doesn't include the domain, which you register in ${personal ? "your own" : "your business's"} name and pay for directly: about €${p.newDomain.min}–${p.newDomain.max} a year. We guide you through it.`,
        `Não inclui o domínio, registado em ${personal ? "nome próprio" : "nome do negócio"} e pago diretamente: cerca de ${p.newDomain.min}–${p.newDomain.max} € por ano. Acompanhamos todo o processo.`,
      ),
    );
  }

  if (a.pages === "unsure") {
    notes.push(
      t(
        "Estimated for 2 to 7 pages, so the range is wider than with a set number of pages.",
        "Estimado para 2 a 7 páginas, por isso o intervalo é mais largo do que com um número de páginas definido.",
      ),
    );
  }
  // A fixed price (the landing page) is not rounded down.
  const floor = min === max ? min : down10(min);
  const ceiling = min === max ? max : up5(max);

  // What the website receives from its visitors (the second level), each
  // item a range of its own, carried whole: added after the cap, raised
  // with the rest on an urgent deadline.
  const f = features(a, market, p, t);
  const rush = a.urgent === "yes" ? 1 + p.urgentPercent / 100 : 1;
  notes.push(...f.notes);
  const lo = floor + f.min * rush;
  const hi = ceiling + f.max * rush;
  // With no range there is no upper end to explain.
  const kept = lo === hi ? notes.filter((n) => n !== t(p.marginNote)) : notes;
  const amount = lo === hi ? { min: up5(lo), max: up5(hi) } : { min: down10(lo), max: up5(hi) };

  // With a back end the price shows in two parts that add up to the line:
  // the front end is the website itself, the back end what its forms and
  // newsletter do behind it (user, 2026-10-30).
  let parts: Line["parts"];
  if (f.listed.length) {
    const front = lo === hi ? { min: up5(floor), max: up5(floor) } : { min: floor, max: ceiling };
    parts = [
      {
        id: "frontend",
        label: "Front end",
        detail: `${t("What visitors see: ", "O que os visitantes veem: ")}${frontDetail(a, others, t)}.`,
        amount: front,
      },
      {
        id: "backend",
        label: "Back end",
        detail: t(
          `What works behind it: ${f.listed.join(", ")}, plus the automatic emails and the database that saves the answers.`,
          `O que funciona por trás: ${f.listed.join(", ")}, mais os emails automáticos e a base de dados que guarda as respostas.`,
        ),
        amount: { min: amount.min - front.min, max: amount.max - front.max },
      },
    ];
  }
  return { line: { amount, notes: kept, parts, provisional: a.texts === "no" } };
}

/** What the front end is made of, as a phrase: the size, the design level,
    the languages, the texts when they are written for the client, and an
    urgent deadline. "Not sure" answers are said as they are. */
function frontDetail(a: NonNullable<Answers["web"]>, others: number, t: Translate) {
  const pages = {
    landing: t("a landing page", "uma landing page"),
    "4-6": t("4–6 pages", "4–6 páginas"),
    "7-10": t("7–10 pages", "7–10 páginas"),
    unsure: t("2 to 7 pages", "2 a 7 páginas"),
    "10+": "",
  }[a.pages];
  const design = {
    essential: t("Essential+ design", "design Essencial+"),
    advanced: t("Advanced design", "design Avançado"),
    unsure: t("Essential+ or Advanced design", "design Essencial+ ou Avançado"),
  }[a.design];
  const languages = a.languages.includes("unsure")
    ? t("Portuguese, English and possibly one more language", "português, inglês e possivelmente mais uma língua")
    : others > 0
      ? t(`Portuguese, English and ${others} more`, `português, inglês e mais ${others}`)
      : t("Portuguese and English", "português e inglês");
  const items = [
    pages,
    design,
    languages,
    a.texts === "no" && t("writing the texts", "a escrita dos textos"),
    a.texts === "unsure" && t("writing the texts, if needed", "a escrita dos textos, se necessária"),
    a.urgent === "yes" && t("an urgent deadline", "prazo urgente"),
  ].filter(Boolean) as string[];
  return items.join(", ");
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
  const fixedPrice = (n: number): [number, number] => [n, n];
  // Complex forms, and more than three, have no price yet: the estimate
  // lists them apart (see estimate()).
  if (has("forms") && a.formKind === "simple" && a.forms && a.forms !== "more") {
    // Not sure: from one form to three, both ends.
    if (a.forms === "unsure") add([p.features.forms["1"], p.features.forms["3"]], t("1 to 3 simple forms", "1 a 3 formulários simples"));
    else add(fixedPrice(p.features.forms[a.forms]), t(a.forms === "1" ? "1 simple form" : `${a.forms} simple forms`, a.forms === "1" ? "1 formulário simples" : `${a.forms} formulários simples`));
    out.notes.push(
      t(
        "A simple form has one automatic email and its answers saved in a database; from there, the process is manual.",
        "Um formulário simples tem um email automático e o registo das respostas numa base de dados; daí em diante, o processo é manual.",
      ),
    );
  }
  if (has("newsletter")) {
    add(fixedPrice(p.features.newsletter), t("a newsletter sign-up with a welcome email", "uma inscrição na newsletter com email de boas-vindas"));
  }
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
  // Not sure: from the first plan's price to the second's.
  if (a.plan === "unsure") {
    return {
      line: {
        amount: { min: p.photo.photos, max: p.photo["photos-video"] },
        notes: [
          t(
            "Photos only or photos & video: the range runs from one to the other, and we settle it together.",
            "Só fotografia ou fotografia e vídeo: o intervalo vai de uma à outra, e definimos em conjunto.",
          ),
          t(p.photoTravel),
        ],
      },
    };
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
  if (!pages) return { reason: t("Quoted in your proposal", "Orçamentado na proposta") };
  // Not sure about the pages: priced as a mid-sized site.
  const { first, monthly } = p[id][pages === "unsure" ? "4-6" : pages][reach][market];
  const notes = [
    t(
      "One-time: strongest in the short term, its effect fades over the medium to long term.",
      "Pontual: mais forte a curto prazo, o efeito vai-se perdendo a médio e longo prazo.",
    ),
  ];
  // Not sure: priced as one-time, the monthly service beside it as an option.
  if (plan === "unsure") {
    notes.push(
      t(
        `The monthly service, which keeps the practices as effective as they can be, is optional: €${monthly} a month. We settle it together.`,
        `O serviço mensal, que mantém as práticas o mais eficazes possível, é opcional: ${monthly} € por mês. Definimos em conjunto.`,
      ),
    );
    return { line: { amount: fixed(first), notes, provisional: true } };
  }
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
    if (id === "web" && webAnswers) add("web", (m) => web(webAnswers, m, pricing.web, t, answers.audience === "personal"));
    if (id === "identity") add("identity", (m) => identity(webAnswers?.urgent === "yes", m, pricing.web, t));
    if (id === "photo" && photoAnswers) add("photo", () => photo(photoAnswers, answers.country, pricing, t));
    if ((id === "seo" || id === "geo") && searchAnswers) {
      // With web design chosen too, the site's size is the web answer.
      const pages = webAnswers?.pages ?? searchAnswers.pages;
      const plan = (id === "seo" ? searchAnswers.seoPlan : searchAnswers.geoPlan) ?? "once";
      add(id, (m) => search(id, plan, searchAnswers.reach, pages, m, pricing, t));
    }
  }

  // Forms with no price yet (user, 2026-10-29): complex ones, and more than
  // three simple ones. Listed apart, so the total says "plus the items on
  // request" and the visitor knows the price comes later.
  if (webAnswers?.features.includes("forms") && out.lines.some((l) => l.id === "web")) {
    const later = t("Price to be defined later, in your proposal", "Preço a definir depois, na proposta");
    if (webAnswers.formKind === "complex") {
      out.onRequest.push({ id: "forms", label: t("Complex forms", "Formulários complexos"), reason: later });
    } else if (webAnswers.forms === "more") {
      out.onRequest.push({ id: "forms", label: t("More than 3 forms", "Mais de 3 formulários"), reason: later });
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
