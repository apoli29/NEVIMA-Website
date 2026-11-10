import "server-only";
import { translator, type Lang, type Translate } from "../i18n";
import { MARKET, PRICING, type Market, type PageKey, type Pricing } from "./pricing";
import {
  ALWAYS_PAGES,
  REGIONS,
  SECTOR_PAGES,
  pageTypesFor,
  type AudienceId,
  TRANSLATION_NOTE,
  countLanguages,
  countPages,
  labelOf,
  type Answers,
  type Estimate,
  type PagesId,
  type Range,
  type SectorId,
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
  backend: { en: "Back-end features", pt: "Funcionalidades de back end" },
  identity: { en: "Visual identity", pt: "Identidade visual" },
  photo: { en: "Photo shoot", pt: "Sessão fotográfica" },
  seo: { en: "SEO & GEO", pt: "SEO e GEO" },
};

type Line = Estimate["lines"][number];
type Priced = { line: Omit<Line, "id" | "label"> } | { reason: string };

const fixed = (n: number): Range => ({ min: n, max: n });
const down10 = (n: number) => Math.floor(n / 10) * 10;
const up10 = (n: number) => Math.ceil(n / 10) * 10;
/** The website's floor rounds down to 5, like its ceiling up to 5, so the
    sum of the pages' lowest ends is shown as it adds up (user, 2026-11-04:
    205 stays 205). */
const down5 = (n: number) => Math.floor(n / 5) * 5;
/** Ceilings round up to 5, so 380 + 30% reads 495 and not 500. */
const up5 = (n: number) => Math.ceil(n / 5) * 5;

function web(
  a: NonNullable<Answers["web"]>,
  market: Market,
  p: Pricing["web"],
  t: Translate,
  audience: AudienceId = "business",
  sector?: SectorId,
): Priced {
  const personal = audience === "personal";
  const nonprofit = audience === "nonprofit";
  // More than 10 pages is priced like any other website, by the sum of its
  // pages (user, 2026-11-10): "on request" was left from the price by size.

  // Portuguese and English are included; each other language is paid, the
  // same amount however many there are (user, 2026-11-10).
  const others = a.languages.includes("other") ? countLanguages(a.languagesOther ?? "") : 0;
  // What the website is made of first, then what it always includes.
  const notes = [madeOf(a, others, t), t(p.includes), t(p.marginNote)];

  // "Not sure" about the design or the languages (user, 2026-10-27; the
  // texts never change the price since 2026-11-04): the range runs from the price with the cheaper answers
  // to the price with the dearer ones, so it never passes what the dearer
  // answer would have cost on its own.
  const languagesUnsure = a.languages.includes("unsure");
  if (a.design === "unsure" || languagesUnsure) {
    const cheap: typeof a = {
      ...a,
      design: a.design === "unsure" ? "essential" : a.design,
      languages: languagesUnsure ? ["pt", "en"] : a.languages,
    };
    const dear: typeof a = {
      ...a,
      design: a.design === "unsure" ? "advanced" : a.design,
      languages: languagesUnsure ? ["pt", "en", "other"] : a.languages,
      languagesOther: languagesUnsure ? "one more" : a.languagesOther,
    };
    const low = web(cheap, market, p, t, audience, sector);
    const high = web(dear, market, p, t, audience, sector);
    if (!("line" in low)) return low;
    if (!("line" in high)) return high;
    const what = [
      a.design === "unsure" && t("the Advanced design level", "o nível de design Avançado"),
      languagesUnsure && t("one more language", "mais uma língua"),
    ].filter(Boolean);
    // The first note says what the website is made of, from the answers as
    // given rather than the cheaper ones.
    const [, ...rest] = low.line.notes;
    return {
      line: {
        amount: { min: low.line.amount.min, max: high.line.amount.max },
        notes: [
          madeOf(a, others, t),
          ...rest,
          t(
            `Some answers are "not sure", so the upper end also allows for ${what.join(", ")}.`,
            `Algumas respostas são "não sei", por isso o valor mais alto contempla também ${what.join(", ")}.`,
          ),
        ],
        provisional: low.line.provisional || high.line.provisional,
      },
    };
  }

  // The pages' price: the sum of the ranges of the pages, each with its own
  // range by design level (user, 2026-11-04). The lowest ends add up to the
  // floor and the highest to the ceiling; the studio settles the figure
  // inside after the call.
  const advanced = a.design === "advanced";
  const extras = others * p.perLanguage;
  const round5 = (n: number) => Math.round(n / 5) * 5;
  const pageRange = (key: PageKey): [number, number] => {
    const [lo, hi] = p.pages[key];
    // The same amount on both ends: as wide as Essential+, about 1.5x dearer.
    const shift = round5(((lo + hi) / 2) * (p.advancedShift / 100));
    return advanced ? [lo + shift, hi + shift] : [lo, hi];
  };
  const total = (keys: readonly PageKey[], end: 0 | 1) => keys.reduce((sum, key) => sum + pageRange(key)[end], 0);

  const always = ["home", "about", "contact"] as const;
  const chosen = a.pageTypes;
  // The pages and sections we already foresee, without the Home page and the
  // landing page: what a page we cannot foresee is measured against.
  // Each kind of client against its own list (user, 2026-11-05).
  const foreseen: PageKey[] = ["about", "contact", ...pageTypesFor(audience).map((k) => k.id)];
  const lowOf = (k: PageKey) => pageRange(k)[0];
  const highOf = (k: PageKey) => pageRange(k)[1];
  // A page or section written in beyond the list, and "Not sure, you
  // choose", each add the average page: the average of the lowest ends up
  // to the average of the highest, rounded up to 5, so they keep within
  // the 30% every page keeps to (user, 2026-11-04).
  const averageLow = up5(foreseen.reduce((sum, k) => sum + lowOf(k), 0) / foreseen.length);
  const averageHigh = up5(foreseen.reduce((sum, k) => sum + highOf(k), 0) / foreseen.length);
  const written = a.pageMode === "website" ? (a.pageOthers?.length ?? 0) : 0;
  const writtenLow = averageLow;
  const writtenHigh = averageHigh;
  const unsureWeb = a.pageMode === "website" && a.pagesUnsure === true;
  const unsureLow = averageLow;
  const unsureHigh = averageHigh;
  let lows: number;
  let highs: number;
  if (a.pageMode === "landing") {
    lows = total(["landing"], 0);
    highs = total(["landing"], 1);
  } else if (a.pageMode === "website") {
    lows = total([...always, ...chosen], 0) + written * writtenLow + (unsureWeb ? unsureLow : 0);
    highs = total([...always, ...chosen], 1) + written * writtenHigh + (unsureWeb ? unsureHigh : 0);
  } else {
    // Not sure on what is needed: the sector's usual website, its lowest
    // end lowered and its highest raised by the same share, to cover a
    // simpler or a fuller choice (user, 2026-11-10).
    const usual = SECTOR_PAGES[personal ? "personal" : nonprofit ? "nonprofit" : (sector ?? "other")];
    const typical = [...always, ...usual];
    lows = total(typical, 0) * (1 - p.unsurePercent / 100);
    highs = total(typical, 1) * (1 + p.unsurePercent / 100);
    const who = personal
      ? t("projects like yours", "projetos semelhantes")
      : nonprofit
        ? t("associations", "as associações")
        : t("businesses in your sector", "os negócios do setor");
    notes.push(
      t(
        `What is needed is still open, so the range starts from the website ${who} usually have, ${p.unsurePercent}% lower and higher, to allow for a simpler or a fuller choice. We choose the pages together on a call.`,
        `Como o que é necessário ainda está em aberto, o intervalo parte do website que ${who} costumam ter, ${p.unsurePercent}% abaixo e acima, para contemplar uma escolha mais simples ou mais completa. A escolha das páginas faz-se em conjunto, numa reunião.`,
      ),
    );
  }
  const scale = p.pagesMarket[market];
  let min = lows * scale + extras;
  let max = highs * scale + extras;
  if (written > 0) {
    notes.push(
      t(
        "Pages or sections written in outside the list can make the range wider, and the final quote may fall slightly outside this estimate.",
        "Páginas ou secções escritas fora das escolhas podem tornar o intervalo maior, e o orçamento final pode ficar ligeiramente fora desta estimativa.",
      ),
    );
  }
  if (unsureWeb) {
    notes.push(
      t(
        "Since the choice of some pages and sections was left to us, the range is wider than with them chosen.",
        "Como a escolha de algumas páginas e secções ficou a cargo do estúdio, o intervalo é maior do que com elas escolhidas.",
      ),
    );
  }

  // Writing the texts the client does not have is included: whether there
  // are texts or not never changes the price (user, 2026-11-04).
  if (a.texts === "no") {
    notes.push(
      t(
        personal
          ? "Includes writing the website's texts from what you tell us about your project."
          : nonprofit
            ? "Includes writing the website's texts from what you tell us about your association."
            : "Includes writing the website's texts from what you tell us about your business.",
        personal
          ? "Inclui a escrita dos textos do website a partir da informação dada sobre o projeto."
          : nonprofit
            ? "Inclui a escrita dos textos do website a partir da informação dada sobre a associação."
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
        `Doesn't include the domain, which you register in ${personal ? "your own" : nonprofit ? "your association's" : "your business's"} name and pay for directly: about €${p.newDomain.min}–${p.newDomain.max} a year. We guide you through it.`,
        `Não inclui o domínio, registado em ${personal ? "nome próprio" : nonprofit ? "nome da associação" : "nome do negócio"} e pago diretamente: cerca de ${p.newDomain.min}–${p.newDomain.max} € por ano. Acompanhamos todo o processo.`,
      ),
    );
  }

  // A fixed price (the landing page) is rounded up, a range outward.
  // The back-end features are a service of their own since 2026-11-10
  // (user): this is the website alone, what every other service that
  // depends on a price is worked out from.
  const amount = min === max ? { min: up5(min), max: up5(max) } : { min: down5(min), max: up5(max) };
  // With no range there is no upper end to explain.
  const kept = amount.min === amount.max ? notes.filter((n) => n !== t(p.marginNote)) : notes;
  return { line: { amount, notes: kept } };
}

/** What the website is made of, as a sentence: the size, the design level,
    the languages, the texts when they are written for the client, and an
    urgent deadline. "Not sure" answers are said as they are. */
function madeOf(a: NonNullable<Answers["web"]>, others: number, t: Translate) {
  const phrase = frontDetail(a, others, t);
  return `${phrase.charAt(0).toUpperCase()}${phrase.slice(1)}.`;
}

function frontDetail(a: NonNullable<Answers["web"]>, others: number, t: Translate) {
  // A website says how many pages it was counted to (and one more we
  // cannot foresee, when "Other" was ticked).
  const count = countPages(a.pageTypes, a.pageOthers?.length ?? 0);
  const pages =
    a.pageMode === "website"
      ? a.pagesUnsure
        ? t(`${count} pages and sections, plus others we choose`, `${count} páginas e secções, mais outras à escolha do estúdio`)
        : t(`${count} pages and sections`, `${count} páginas e secções`)
      : {
          landing: t("a landing page", "uma landing page"),
          "3": "",
          "4-6": "",
          "7-10": "",
          unsure: t("pages and sections to be defined", "páginas e secções a definir"),
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
function features(a: NonNullable<Answers["web"]>, market: Market, p: Pricing["web"], t: Translate, sector?: string) {
  const k = p.featuresMarket[market];
  const out = { min: 0, max: 0, monthly: 0, monthlyMax: 0, listed: [] as string[], chosen: [] as string[], notes: [] as string[] };
  const add = ([lo, hi]: [number, number], what: string) => {
    out.min += lo * k;
    out.max += hi * k;
    out.listed.push(what);
  };
  const has = (id: (typeof a.features)[number]) => a.features.includes(id);
  const fixedPrice = (n: number): [number, number] => [n, n];
  // A form is priced whatever its emails (one is enough, user 2026-11-04);
  // automated emails have no price yet, and the estimate names them apart
  // (see estimate()).
  const simpleForm = has("forms");
  if (simpleForm) {
    add(fixedPrice(p.features.forms), t("a form", "um formulário"));
    out.chosen.push(t("forms", "formulários"));
  }
  if (has("newsletter")) {
    add(fixedPrice(p.features.newsletter), t("a newsletter sign-up with a welcome email", "uma inscrição na newsletter com email de boas-vindas"));
    out.chosen.push(t("newsletter sign-up", "inscrição na newsletter"));
  }
  if (has("forms") || has("newsletter")) {
    out.chosen.push(a.formKind === "complex" ? t("automated emails", "emails automatizados") : t("manual emails", "emails manuais"));
    if (a.formKind !== "complex") {
      out.notes.push(
        t(
          "With manual emails, one automatic email goes out and the answers are saved in a database; from there, every email is written by hand.",
          "Com emails manuais, é enviado um email automático e as respostas ficam registadas numa base de dados; daí em diante, cada email é escrito à mão.",
        ),
      );
    }
  }
  if (has("booking")) {
    add(fixedPrice(p.features.booking), t("calendar and reservations", "calendarização e reservas"));
    out.chosen.push(t("calendar and reservations", "calendarização e reservas"));
  }
  // The monthly fee runs from maintenance alone (the platforms' free plans
  // are enough) to maintenance plus their paid plans (user, 2026-11-04).
  // Forms and the newsletter share one platform, the calendar is another; a
  // restaurant in Portugal books through its own platform at a fixed fee.
  const mail = has("newsletter") || simpleForm;
  const restaurant = has("booking") && sector === "hospitality" && market === "pt";
  const calendar = has("booking") && !restaurant;
  const upkeep = (mail || calendar ? p.monthly.labour : 0) + (restaurant ? p.monthly.restaurant : 0);
  if (upkeep > 0) {
    const planPrices = [mail ? p.monthly.plans.brevo : 0, calendar ? p.monthly.plans.calcom : 0].filter(Boolean).map(Math.round);
    const plans = (mail ? p.monthly.plans.brevo : 0) + (calendar ? p.monthly.plans.calcom : 0);
    out.monthly = Math.max(5, Math.round((upkeep * k) / 5) * 5);
    out.monthlyMax = Math.max(out.monthly, up5(upkeep * k + plans));
    out.notes.push(
      plans > 0
        ? t(
            `The monthly fee is a range: the lower figure is our maintenance alone, if the platforms' free plans are enough; the higher adds their paid plans (about €${planPrices.join(" and €")} a month with VAT), paid by you directly to the platform. Which one applies is only known once we know the business.`,
            `A mensalidade é um intervalo: o valor mais baixo é só a manutenção, se os planos gratuitos das plataformas chegarem; o mais alto soma os planos pagos (cerca de ${planPrices.join(" € e ")} € por mês, com IVA), pagos diretamente pelo cliente à plataforma. Só se sabe qual se aplica depois de conhecer o negócio.`,
          )
        : t(
            "The monthly fee is the reservation platform's plan, paid by you directly to the platform, plus our upkeep of the reservations.",
            "A mensalidade soma o plano da plataforma de reservas, pago diretamente pelo cliente à plataforma, e a manutenção das reservas.",
          ),
    );
  }
  return out;
}

/** The back-end features as a service of their own (user, 2026-11-10):
    what was the website's "Back end" part, with its monthly fee, raised
    like every one-time service on an urgent deadline (contract v1.13,
    clause 4.5). Automated emails are named apart, on request. */
function backend(a: NonNullable<Answers["web"]>, market: Market, p: Pricing["web"], t: Translate, sector?: string): Priced {
  const f = features(a, market, p, t, sector);
  const rush = a.urgent === "yes" ? 1 + p.urgentPercent / 100 : 1;
  const notes = [`${t("Options chosen: ", "Opções escolhidas: ")}${f.chosen.join(", ")}.`, ...f.notes];
  if (f.monthly) {
    notes.push(
      t(
        "The monthly fee covers the platforms' costs and our maintenance: if, by some miracle, something goes wrong, we fix it.",
        "A mensalidade cobre os custos das plataformas e a manutenção: se, por milagre, alguma coisa correr mal, resolvemos.",
      ),
    );
  }
  return {
    line: {
      amount: { min: Math.round(f.min * rush), max: Math.round(f.max * rush) },
      notes,
      monthly: f.monthly || undefined,
      monthlyMax: f.monthlyMax > f.monthly ? f.monthlyMax : undefined,
    },
  };
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

/** The shoot, raised like every one-time service when the deadline is
    urgent (contract v1.13, clause 4.5). */
function photo(a: NonNullable<Answers["photo"]>, country: Answers["country"], p: Pricing, t: Translate, urgent: boolean): Priced {
  const rush = urgent ? 1 + p.web.urgentPercent / 100 : 1;
  if (country !== "PT") return { reason: t("Shoot outside Portugal", "Sessão fora de Portugal") };
  if (a.region && a.region !== "mainland") {
    const region = labelOf(REGIONS, a.region, t<Lang>("en", "pt"));
    return { reason: t(`Shoot in ${region}`, a.region === "azores" ? `Sessão nos ${region}` : `Sessão na ${region}`) };
  }
  // Not sure: from the first plan's price to the second's.
  if (a.plan === "unsure") {
    return {
      line: {
        amount: { min: Math.round(p.photo.photos * rush), max: Math.round(p.photo["photos-video"] * rush) },
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
  return { line: { amount: fixed(Math.round(p.photo[a.plan] * rush)), notes: [t(p.photoTravel)] } };
}

function search(
  id: "seo",
  plan: SearchPlanId,
  site: Range | undefined,
  p: Pricing,
  t: Translate,
): Priced {
  // The same calculation for every reach and every market (user,
  // 2026-11-10): what changes from one to another is the website's price
  // it is worked out from. International reach was quoted on request until
  // then. Priced from the website we build (user, 2026-11-04): with no
  // price for the site (more than 10 pages) there is none.
  if (!site) return { reason: t("Quoted in your proposal", "Orçamentado na proposta") };
  const { setup, monthlyOfSetup } = p.search;
  // Fixed shares (user, 2026-11-10): the one-time work is a share of the
  // website, the monthly service a share of the one-time work, each worked
  // out on the figures before rounding. The lowest end rounds down to 5 and
  // the highest up, so whatever the final figure inside the website's
  // range, its SEO & GEO stays inside this one. Never under 5.
  const outward = (lo: number, hi: number): Range => {
    const min = Math.max(5, Math.floor(lo / 5) * 5);
    return { min, max: Math.max(min, Math.ceil(hi / 5) * 5) };
  };
  const setupLo = (site.min * setup) / 100;
  const setupHi = (site.max * setup) / 100;
  const first = outward(setupLo, setupHi);
  const month = outward((setupLo * monthlyOfSetup) / 100, (setupHi * monthlyOfSetup) / 100);
  const monthly = month.min;
  const monthlyMax = month.max;
  const perMonth = monthlyMax > monthly ? `${monthly}–${monthlyMax}` : `${monthly}`;
  // How the figures are worked out, said plainly (user, 2026-11-10).
  const pct = (n: number) => (t<Lang>("en", "pt") === "pt" ? String(n).replace(".", ",") : String(n));
  const how = t(
    `Worked out from the website: the one-time work is ${pct(setup)}% of the website's price.`,
    `Calculado a partir do website: o trabalho pontual corresponde a ${pct(setup)}% do valor do website.`,
  ) + (plan === "once"
    ? ""
    : t(
        ` The monthly service is ${pct(monthlyOfSetup)}% of the one-time work.`,
        ` O serviço mensal corresponde a ${pct(monthlyOfSetup)}% do trabalho pontual.`,
      ));
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
        `The monthly service, which keeps the practices as effective as they can be, is optional: €${perMonth} a month. We settle it together.`,
        `O serviço mensal, que mantém as práticas o mais eficazes possível, é opcional: ${perMonth} € por mês. Definimos em conjunto.`,
      ),
      how,
    );
    return { line: { amount: first, notes, provisional: true } };
  }
  if (plan === "monthly") {
    notes.push(
      t(
        "Plus the monthly service, which keeps the practices as effective as they can be.",
        "Mais o serviço mensal, que mantém as práticas o mais eficazes possível.",
      ),
      how,
    );
    return { line: { amount: first, monthly, monthlyMax: monthlyMax > monthly ? monthlyMax : undefined, notes, provisional: true } };
  }
  notes.push(how);
  return { line: { amount: first, notes, provisional: true } };
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
    if (id === "web" && webAnswers) add("web", (m) => web(webAnswers, m, pricing.web, t, answers.audience, answers.sector));
    if (id === "backend" && webAnswers?.features.length) {
      add("backend", (m) => backend(webAnswers, m, pricing.web, t, answers.sector));
    }
    if (id === "identity") add("identity", (m) => identity(webAnswers?.urgent === "yes", m, pricing.web, t));
    if (id === "photo" && photoAnswers) add("photo", () => photo(photoAnswers, answers.country, pricing, t, webAnswers?.urgent === "yes"));
  }
  // SEO and GEO come after the website: they are a share of its price.
  for (const id of answers.services) {
    if (id === "seo" && searchAnswers) {
      const site = out.lines.find((l) => l.id === "web")?.amount;
      const plan = searchAnswers.seoPlan ?? "once";
      // With the website on request, SEO and GEO are quoted for the same reason.
      const why = out.onRequest.find((o) => o.id === "web")?.reason;
      add(id, () => (!site && why ? { reason: why } : search(id, plan, site, pricing, t)));
    }
  }

  // Automated emails have no price yet: they are an item on request of
  // their own, under the back-end features, and the website and the total
  // keep their price (user, 2026-11-10; named under the total since
  // 2026-11-04).
  const mailing = webAnswers?.features.some((f) => f === "forms" || f === "newsletter");
  if (mailing && webAnswers?.formKind === "complex" && out.lines.some((l) => l.id === "backend")) {
    out.onRequest.push({
      id: "automated",
      label: t("Automated emails", "Emails automatizados"),
      reason: t("Price set in your proposal", "Preço definido na proposta"),
    });
  }

  if (out.lines.length) {
    out.total = {
      min: out.lines.reduce((a, l) => a + l.amount.min, 0),
      max: out.lines.reduce((a, l) => a + l.amount.max, 0),
    };
    const monthly = out.lines.reduce((a, l) => a + (l.monthly ?? 0), 0);
    out.monthly = monthly > 0 ? monthly : null;
    const monthlyMax = out.lines.reduce((a, l) => a + (l.monthlyMax ?? l.monthly ?? 0), 0);
    if (monthly > 0 && monthlyMax > monthly) out.monthlyMax = monthlyMax;
  }

  // Each service's time beside its price, and the project's time the sum of
  // them all (user, 2026-11-10). What is on request has its time to be
  // defined with it; on an urgent deadline the time is agreed.
  if (webAnswers?.urgent === "yes") {
    if (out.lines.length || out.onRequest.length) out.timeline = { kind: "agreed" };
  } else if (webAnswers && market) {
    for (const line of out.lines) {
      if (line.id === "identity") line.daysIncluded = true;
      else line.days = daysOf(line.id, webAnswers, answers, market, pricing);
    }
    if (out.lines.length) {
      const sum = (end: "min" | "max") => out.lines.reduce((a, l) => a + (l.days?.[end] ?? 0), 0);
      out.timeline = { kind: "days", min: sum("min"), max: sum("max"), ...(out.onRequest.length ? { partial: true as const } : {}) };
    }
  }

  return out;
}

/* --- how long each service takes ----------------------------------- */

type Pair = readonly [number, number];
/** Working days as whole days: the lowest down, the highest up. */
const dayRange = ([lo, hi]: Pair): Range => ({ min: Math.floor(lo), max: Math.ceil(hi) });

/** Days that grow with the website's pages: a landing page's own figure,
    or the three pages always included and each page on top. "Not sure"
    on what is needed takes the sector's usual website, its lowest end
    lowered and its highest raised by the same share as the price. */
function byPages(
  a: NonNullable<Answers["web"]>,
  d: { landing: Pair; base: Pair; perPage: Pair },
  unsurePercent: number,
  usualPages: number,
): [number, number] {
  if (a.pageMode === "landing") return [d.landing[0], d.landing[1]];
  if (a.pageMode === "website") {
    const extra = countPages(a.pageTypes, a.pageOthers?.length ?? 0, a.pagesUnsure === true) - ALWAYS_PAGES;
    return [d.base[0] + extra * d.perPage[0], d.base[1] + extra * d.perPage[1]];
  }
  const u = unsurePercent / 100;
  return [(d.base[0] + usualPages * d.perPage[0]) * (1 - u), (d.base[1] + usualPages * d.perPage[1]) * (1 + u)];
}

function daysOf(id: ServiceId, a: NonNullable<Answers["web"]>, answers: Answers, market: Market, pricing: Pricing): Range {
  const d = pricing.days;
  const usual = SECTOR_PAGES[
    answers.audience === "personal" ? "personal" : answers.audience === "nonprofit" ? "nonprofit" : (answers.sector ?? "other")
  ].length;
  switch (id) {
    case "web": {
      let [lo, hi] = byPages(a, d.web, pricing.web.unsurePercent, usual);
      // "Not sure" counts on the upper end, as in the price.
      const advanced = 1 + d.web.advancedPercent / 100;
      if (a.design === "advanced") lo *= advanced;
      if (a.design !== "essential") hi *= advanced;
      const others = a.languages.includes("other") ? countLanguages(a.languagesOther ?? "") : 0;
      lo += others * d.web.perLanguage;
      hi += (others + (a.languages.includes("unsure") ? 1 : 0)) * d.web.perLanguage;
      if (a.texts === "no") lo += d.web.writing[0];
      if (a.texts !== "yes") hi += d.web.writing[1];
      return dayRange([lo, hi]);
    }
    case "seo":
      return dayRange(byPages(a, d.seo, pricing.web.unsurePercent, usual));
    case "photo":
      return { min: d.photo, max: d.photo };
    case "backend": {
      const has = (f: (typeof a.features)[number]) => a.features.includes(f);
      const b = d.backend;
      let lo = 0;
      let hi = 0;
      const add = ([l, h]: Pair) => {
        lo += l;
        hi += h;
      };
      if (has("forms")) add([b.form, b.form]);
      if (has("newsletter")) add([b.newsletter, b.newsletter]);
      if (has("forms") || has("newsletter")) add(b.brevo);
      if (has("booking")) add(answers.sector === "hospitality" && market === "pt" ? b.restaurant : b.calcom);
      return dayRange([lo, hi]);
    }
    case "identity":
      return { min: d.identity, max: d.identity };
  }
}
