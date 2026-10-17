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
type Size = "landing" | "4-6" | "7-10";
type SearchTable = Record<
  "landing" | "4-6" | "7-10",
  Record<"local" | "national", Record<Market, Monthly>>
>;

export const MARKET = { PT: "pt", ES: "es-it", IT: "es-it", US: "us" } as const;

export const PRICING = {
  web: {
    /** The site by its size. "More than 10" is always on request. */
    /** Each size is a range, from its fewest pages to its most (user,
        2026-10-17: Portugal 290; 420–540; 580–740). Spain and Italy, and
        the USA, keep the ratio the old single prices had to Portugal's. */
    pages: {
      landing: { pt: [290, 290], "es-it": [335, 335], us: [510, 510] },
      "4-6": { pt: [420, 540], "es-it": [485, 620], us: [735, 945] },
      "7-10": { pt: [580, 740], "es-it": [670, 850], us: [1015, 1295] },
    } satisfies Record<Size, Record<Market, [number, number]>>,
    /** How long the site takes, in working days, by size. */
    days: {
      landing: [4, 7],
      "4-6": [8, 11],
      "7-10": [12, 16],
    } as Record<"landing" | "4-6" | "7-10", [number, number]>,
    /** What every website comes with, shown under its line. Kept in
        step with the contract (clauses 11 and 12). */
    includes:
      "Includes optimised images, a review of the texts you send, free hosting for the first year (then renewed every 6 months) and a free call once part of the website is built.",

    /** On top of the pages' own range, the ceiling carries this margin
        for what the form does not ask (user, 2026-10-17: 10 points more
        than the first 20%). */
    rangePercent: 30,
    /** What that margin allows for, shown under the website's line. */
    marginNote:
      "The upper end allows for what a form can't foresee: how much content there is to organise, connecting tools you already use (booking, maps, social media), special design requests such as custom illustrations or complex animations, and moving content over from an existing site.",
    /** The Advanced design level costs this much more than Essential+
        (user, 2026-10-17). The page prices above are Essential+. */
    advancedPercent: 25,

    /** The visual identity redesign (logo and symbol). */
    identity: { pt: 180, "es-it": 205, us: 315 } satisfies ByMarket,
    /** Portuguese is always the language included; the others are priced
        together by how many there are, as the contract sets them (clause
        11.4), the same in every country. More than three is quoted. */
    languages: { 1: 35, 2: 55, 3: 80 } as Record<1 | 2 | 3, number>,
    /** Writing the texts the client does not have, as a range by the
        site's size (Portugal; other markets scaled by textsMarket).
        PROVISIONAL: figures to be confirmed by the studio. */
    texts: {
      some: { landing: [40, 80], "4-6": [80, 150], "7-10": [120, 240] },
      none: { landing: [80, 150], "4-6": [150, 300], "7-10": [240, 450] },
    } as Record<"some" | "none", Record<Size, [number, number]>>,
    textsMarket: { pt: 1, "es-it": 1.15, us: 1.75 } satisfies Record<Market, number>,
    forms: {
      "0": { pt: 0, "es-it": 0, us: 0 },
      "1": { pt: 30, "es-it": 35, us: 55 },
      "2": { pt: 55, "es-it": 65, us: 95 },
      "3": { pt: 75, "es-it": 85, us: 130 },
    } satisfies Record<string, ByMarket>,
    /** A client without a domain pays for the one we register for them
        (contract, clause 13); one who has a domain pays nothing. */
    newDomain: { min: 10, max: 30 },
    /** Added for an urgent deadline, on the website and its extras. The
        timeline is then agreed between both sides. */
    urgentPercent: 40,
  },

  /** Mainland Portugal only; anywhere else is quoted on request. */
  photo: { photos: 245, "photos-video": 370 },
  /** Shown under the photo line, as the contract sets it (clause 10.3). */
  photoTravel: "Travel within 30 km of Arcozelo is included. Beyond that, it is charged per km, as set in your proposal.",

  /** "More than 10" pages and an international reach are on request.
      The SEO deep-dive is priced at seo's "first" column; the monthly
      SEO & GEO service at seo's and geo's monthly fees together.
      PROVISIONAL mapping from the old SEO and GEO tables, to be
      confirmed by the studio. */
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
