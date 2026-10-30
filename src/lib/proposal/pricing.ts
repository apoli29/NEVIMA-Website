import "server-only";
import type { Copy } from "../i18n";

/* ==================================================================
   The price table

   The one file to edit when prices change. It is only ever read on the
   server (by /api/estimate and /api/proposal), so none of it reaches
   the browser.

   Amounts are whole euros, by market: Portugal, Spain and Italy (one
   column), the USA. Any other country is quoted on request.
   ================================================================== */

export type Market = "pt" | "es-it" | "us";
export type ByMarket = Record<Market, number>;

/** First month, then each month after. */
type Monthly = { first: number; monthly: number };
type Size = "landing" | "4-6" | "7-10" | "unsure";
type SearchTable = Record<
  "landing" | "4-6" | "7-10",
  Record<"local" | "national", Record<Market, Monthly>>
>;

export const MARKET = { PT: "pt", ES: "es-it", IT: "es-it", US: "us" } as const;

/** Every size's ceiling over its floor, in percent. */
const PAGES_SPREAD = 25;
/** A size's floor by market, as its [floor, ceiling] by market. */
const upTo = (floors: ByMarket): Record<Market, [number, number]> => ({
  pt: [floors.pt, floors.pt * (1 + PAGES_SPREAD / 100)],
  "es-it": [floors["es-it"], floors["es-it"] * (1 + PAGES_SPREAD / 100)],
  us: [floors.us, floors.us * (1 + PAGES_SPREAD / 100)],
});

export const PRICING = {
  web: {
    /** The site by its size. "More than 10" is always on request.
        Each size is a floor, and its ceiling is that floor plus
        pagesSpreadPercent, the same for every size (user, 2026-10-30).
        Portugal 290; 380; 580 (Essential+). Spain and Italy, and the USA,
        keep the ratio the old single prices had to Portugal's. */
    pages: {
      landing: upTo({ pt: 290, "es-it": 335, us: 510 }),
      "4-6": upTo({ pt: 380, "es-it": 440, us: 665 }),
      "7-10": upTo({ pt: 580, "es-it": 670, us: 1015 }),
      /** "Not sure": from 2 pages (340 in Portugal, user, 2026-10-29) to
          7, which is where 7–10 starts. Its own range, not a spread. */
      unsure: { pt: [340, 580], "es-it": [395, 670], us: [595, 1015] },
    } satisfies Record<Size, Record<Market, [number, number]>>,
    /** The ceiling of each size over its floor (user, 2026-10-30). */
    pagesSpreadPercent: PAGES_SPREAD,
    /** Each design level is a range of its own: its ceiling is this much
        over its floor (user, 2026-10-30). It stacks with the pages' range. */
    designSpreadPercent: 15,
    /** How long the site takes, in working days, by size. */
    days: {
      landing: [4, 7],
      "4-6": [8, 11],
      "7-10": [12, 16],
      unsure: [6, 14],
    } as Record<Size, [number, number]>,
    /** What every website comes with, shown under its line. Kept in
        step with the contract (clauses 11 and 12). */
    includes: {
      en: "Includes optimised images, a review of the texts you send, free hosting for the first year (then renewed every 6 months) and a free call once part of the website is built.",
      pt: "Inclui imagens otimizadas, a revisão dos textos enviados, alojamento gratuito no primeiro ano (depois renovado de 6 em 6 meses) e uma chamada gratuita quando parte do website já estiver construída.",
    } satisfies Copy,

    /** What the upper end allows for, shown under the website's line. */
    marginNote: {
      en: "The upper end allows for what a form can't foresee: how much content there is to organise, connecting tools you already use (booking, maps, social media), special design requests such as custom illustrations or complex animations, and moving content over from an existing site.",
      pt: "O valor mais alto dá margem para o que um formulário não consegue prever: a quantidade de conteúdo a organizar, a ligação a ferramentas já usadas (marcações, mapas, redes sociais), pedidos especiais de design, como ilustrações personalizadas ou animações complexas, e a passagem de conteúdo de um site que já exista.",
    } satisfies Copy,
    /** The Advanced design level costs this much more than Essential+
        (user, 2026-10-29, was 25). The page prices above are Essential+. */
    advancedPercent: 35,

    /** The visual identity redesign (logo and symbol). */
    identity: { pt: 110, "es-it": 125, us: 195 } satisfies ByMarket,
    /** Portuguese and English are included; each other language costs
        the same, in every country (user, 2026-10-19; contract clause
        11.4). More than three is quoted. */
    perLanguage: 35,
    /** Writing the website's texts when the client has none, as a range
        by the site's size (Portugal; other markets scaled by textsMarket).
        PROVISIONAL: figures to be confirmed by the studio. */
    texts: { landing: [80, 150], "4-6": [150, 300], "7-10": [180, 340], unsure: [120, 320] } as Record<
      Size,
      [number, number]
    >,
    textsMarket: { pt: 1, "es-it": 1.15, us: 1.75 } satisfies Record<Market, number>,
    /** The second level of what a website does (user, 2026-10-29), as
        fixed prices for Portugal; other markets scaled by featuresMarket.
        A simple form is one with a single automatic email and its answers
        saved in a database; from there the process is manual. Anything
        beyond that, and more than three forms, has no price yet: it is
        said so in the estimate. */
    features: {
      /** By how many simple forms. */
      forms: { "1": 70, "2": 125, "3": 160 } as Record<"1" | "2" | "3", number>,
      /** The sign-up, its welcome email and its record in the database. */
      newsletter: 35,
    },
    featuresMarket: { pt: 1, "es-it": 1.15, us: 1.75 } satisfies Record<Market, number>,
    /** What a new domain costs a year, shown to a client without one as
        a reference only: the client registers and pays for it directly,
        in their own name (contract v1.9, clause 13), so it is never
        added to our price. */
    newDomain: { min: 10, max: 30 },
    /** Added for an urgent deadline, on the website and its extras. The
        timeline is then agreed between both sides. */
    urgentPercent: 40,
  },

  /** Mainland Portugal only; anywhere else is quoted on request. */
  photo: { photos: 245, "photos-video": 370 },
  /** Shown under the photo line, as the contract sets it (clause 10.3). */
  photoTravel: {
    en: "Travel within 30 km of Arcozelo is included. Beyond that, it is charged per km, as set in your proposal.",
    pt: "A deslocação até 30 km de Arcozelo está incluída. A partir daí, é cobrada ao km, como fica definido na proposta.",
  } satisfies Copy,

  /** "More than 10" pages and an international reach are on request.
      "first" is the one-time work, "monthly" the optional monthly
      service on top of it. 7–10 pages sit 15% above 4–6. PROVISIONAL:
      to be confirmed by the studio. */
  seo: {
    landing: {
      local: { pt: { first: 150, monthly: 60 }, "es-it": { first: 175, monthly: 70 }, us: { first: 265, monthly: 105 } },
      national: { pt: { first: 195, monthly: 80 }, "es-it": { first: 225, monthly: 90 }, us: { first: 340, monthly: 140 } },
    },
    "4-6": {
      local: { pt: { first: 230, monthly: 90 }, "es-it": { first: 265, monthly: 105 }, us: { first: 405, monthly: 160 } },
      national: { pt: { first: 300, monthly: 115 }, "es-it": { first: 345, monthly: 130 }, us: { first: 525, monthly: 200 } },
    },
    "7-10": {
      local: { pt: { first: 265, monthly: 105 }, "es-it": { first: 305, monthly: 120 }, us: { first: 465, monthly: 185 } },
      national: { pt: { first: 345, monthly: 130 }, "es-it": { first: 395, monthly: 150 }, us: { first: 605, monthly: 230 } },
    },
  } satisfies SearchTable,

  geo: {
    landing: {
      local: { pt: { first: 190, monthly: 80 }, "es-it": { first: 220, monthly: 90 }, us: { first: 335, monthly: 140 } },
      national: { pt: { first: 250, monthly: 105 }, "es-it": { first: 290, monthly: 120 }, us: { first: 440, monthly: 185 } },
    },
    "4-6": {
      local: { pt: { first: 290, monthly: 120 }, "es-it": { first: 335, monthly: 140 }, us: { first: 510, monthly: 210 } },
      national: { pt: { first: 380, monthly: 155 }, "es-it": { first: 435, monthly: 180 }, us: { first: 665, monthly: 270 } },
    },
    "7-10": {
      local: { pt: { first: 335, monthly: 140 }, "es-it": { first: 385, monthly: 160 }, us: { first: 585, monthly: 240 } },
      national: { pt: { first: 435, monthly: 180 }, "es-it": { first: 500, monthly: 205 }, us: { first: 765, monthly: 310 } },
    },
  } satisfies SearchTable,
};

export type Pricing = typeof PRICING;
