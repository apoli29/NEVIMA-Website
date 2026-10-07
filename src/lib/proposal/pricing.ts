import "server-only";

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
type SearchTable = Record<
  "landing" | "4-6" | "7-10",
  Record<"local" | "national", Record<Market, Monthly>>
>;

export const MARKET = { PT: "pt", ES: "es-it", IT: "es-it", US: "us" } as const;

export const PRICING = {
  web: {
    /** The site by its size. "More than 10" is always on request. */
    pages: {
      landing: { pt: 390, "es-it": 450, us: 685 },
      "4-6": { pt: 670, "es-it": 770, us: 1175 },
      "7-10": { pt: 1090, "es-it": 1255, us: 1910 },
    } satisfies Record<string, ByMarket>,
    /** How long the site takes, in working days, by size. */
    days: {
      landing: [4, 7],
      "4-6": [8, 11],
      "7-10": [12, 16],
    } as Record<"landing" | "4-6" | "7-10", [number, number]>,
    /** What every website comes with, shown under its line. */
    includes:
      "Includes copy and optimised images, your domain for 2 years, hosting for as long as the site is live, and a free call at 25% of the project.",

    /** The visual identity redesign (logo and symbol). */
    identity: { pt: 180, "es-it": 205, us: 315 } satisfies ByMarket,
    /** Portuguese is included everywhere; every other language is paid
        (user: they are not native languages). */
    english: { pt: 45, "es-it": 50, us: 80 } satisfies ByMarket,
    /** Each language typed under "Other". */
    otherLanguage: { pt: 20, "es-it": 25, us: 35 } satisfies ByMarket,
    forms: {
      "0": { pt: 0, "es-it": 0, us: 0 },
      "1": { pt: 30, "es-it": 35, us: 55 },
      "2": { pt: 55, "es-it": 65, us: 95 },
      "3": { pt: 75, "es-it": 85, us: 130 },
    } satisfies Record<string, ByMarket>,
    /** An existing domain (with proof) takes off what the client paid for
        it, €10 to €30 whatever the country. The estimate takes off the
        middle of that (user: "metes a estimativa"). */
    existingDomain: { estimate: 20, min: 10, max: 30 },
    /** Added for an urgent deadline, on the website and its extras. The
        timeline is then agreed between both sides. */
    urgentPercent: 40,
  },

  /** Mainland Portugal only; anywhere else is quoted on request. */
  photo: { photos: 245, "photos-video": 370 },
  /** Shown under the photo line. */
  photoTravel:
    "In some parts of the Porto area and in the rest of the country, travel costs are covered by your business.",

  /** "More than 10" pages and an international reach are on request. */
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
      local: { pt: { first: 300, monthly: 115 }, "es-it": { first: 345, monthly: 130 }, us: { first: 525, monthly: 200 } },
      national: { pt: { first: 390, monthly: 150 }, "es-it": { first: 450, monthly: 175 }, us: { first: 685, monthly: 265 } },
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
      local: { pt: { first: 380, monthly: 155 }, "es-it": { first: 435, monthly: 180 }, us: { first: 665, monthly: 270 } },
      national: { pt: { first: 495, monthly: 200 }, "es-it": { first: 570, monthly: 230 }, us: { first: 865, monthly: 350 } },
    },
  } satisfies SearchTable,
};

export type Pricing = typeof PRICING;
