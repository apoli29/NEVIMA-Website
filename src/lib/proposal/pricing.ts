import "server-only";

/* ==================================================================
   The price table

   The one file to edit when prices change. It is only ever read on the
   server (by /api/estimate and /api/proposal), so none of it reaches
   the browser.

   Amounts are whole euros. `null` means "not set yet": anything that
   needs a null to be priced is shown to the visitor as "On request",
   never as €0. Until the studio's tables are filled in, every line of
   every estimate reads "On request".
   ================================================================== */

type Price = number | null;
/** A span of weeks, low to high. */
type Weeks = [number, number] | null;
type ByPages = { landing: Price; "4-6": Price; "7-10": Price };

export type Pricing = {
  /** What each country's prices are multiplied by, the tables below
      being Portugal's. A country left null is quoted on request. */
  countryFactor: { PT: number | null; ES: number | null; IT: number | null; US: number | null };

  web: {
    /** The site by its size. "More than 10" is always on request. */
    pages: ByPages;
    /** The visual identity redesign (logo and symbol), on top. */
    identity: Price;
    /** Each language past the first. Languages typed under "Other" are
        quoted on request. */
    extraLanguage: Price;
    /** Each form. */
    perForm: Price;
    /** Registering and setting up a domain, when there is none yet. */
    domainSetup: Price;
    /** Added for an urgent deadline, as a percentage of the web line. */
    urgentPercent: Price;
    /** How long the site takes, by size. */
    weeks: { landing: Weeks; "4-6": Weeks; "7-10": Weeks };
    /** The same on an urgent deadline. */
    urgentWeeks: { landing: Weeks; "4-6": Weeks; "7-10": Weeks };
  };

  /** Mainland Portugal only; anywhere else is quoted on request. */
  photo: { photos: Price; "photos-video": Price };

  /** SEO and GEO are priced the same way: by the site's size, plus a
      step for its reach. "More than 10" pages and an international
      reach are always on request. */
  seo: { pages: ByPages; reach: { local: Price; national: Price } };
  geo: { pages: ByPages; reach: { local: Price; national: Price } };
};

export const PRICING: Pricing = {
  countryFactor: { PT: 1, ES: null, IT: null, US: null },

  web: {
    pages: { landing: null, "4-6": null, "7-10": null },
    identity: null,
    extraLanguage: null,
    perForm: null,
    domainSetup: null,
    urgentPercent: null,
    weeks: { landing: null, "4-6": null, "7-10": null },
    urgentWeeks: { landing: null, "4-6": null, "7-10": null },
  },

  photo: { photos: null, "photos-video": null },

  seo: {
    pages: { landing: null, "4-6": null, "7-10": null },
    reach: { local: null, national: null },
  },
  geo: {
    pages: { landing: null, "4-6": null, "7-10": null },
    reach: { local: null, national: null },
  },
};
