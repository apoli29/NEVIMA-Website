import "server-only";
import type { Copy } from "../i18n";
import type { PageTypeId } from "./questions";

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

type Size = "landing" | "3" | "4-6" | "7-10" | "unsure";

export const MARKET = { PT: "pt", ES: "es-it", IT: "es-it", US: "us" } as const;

/** What a website's pages are priced by. */
export type PageKey = "landing" | "home" | "about" | "contact" | PageTypeId;

export const PRICING = {
  web: {
    /** The website's price is the sum of the ranges of its pages, each a
        [lowest, highest] in Portugal with the Essential+ design (user,
        2026-11-04). A range exists because two businesses with the same
        pages can ask for different work; the studio settles the figure
        inside it after the call. Every kind of page has its own range
        because each asks for a different effort. Always included: Home
        ("home" for a website, "landing" for a landing page, which is the
        Home alone), About and Contact. There is no base fee on top (user).
        Spain, Italy and the USA keep the ratio the old prices had to
        Portugal's (derived, not given). PROVISIONAL: the pages the user
        has not priced yet were suggested. */
    pages: {
      // Each page's highest end is at most 30% over its lowest, keeping the
      // middle it had, both ends rounded up to 5 (user, 2026-11-04); the
      // landing page's ceiling rounded down to stay within the 30%. Then all
      // lowered 12.5%, to 5 (user, 2026-11-04); the smallest (Contact,
      // Downloads, Prices, Partners) became a single figure, since a range
      // to 5 would have kept them where they were. Then those up to 50 raised
      // 12.5% (user, 2026-11-04), to 5: the single figures got their range
      // back, with the top end raised.
      landing: [215, 275],
      home: [105, 130], // +10% (user, 2026-11-04)
      about: [55, 70], // +10% (user, 2026-11-04)
      contact: [15, 20],
      // Services in two kinds (user, 2026-11-04): all on one page or
      // section, or an overview with a page for each service.
      services: [25, 55],
      servicesPages: [55, 85],
      team: [30, 35],
      prices: [20, 25],
      testimonials: [30, 35],
      faq: [25, 30],
      process: [45, 55],
      partners: [20, 25],
      work: [45, 55],
      resources: [15, 20],
      items: [45, 55],
      itemsPages: [80, 100],
      portfolio: [70, 95], // exception: within 40% (user, 2026-11-04)
      gallery: [45, 55],
      events: [60, 75],
      // A non-profit association's pages (user, 2026-11-05).
      projects: [25, 55],
      projectsPages: [45, 70],
      help: [25, 30],
      activities: [40, 65],
      news: [25, 50],
      board: [30, 35],
      transparency: [15, 20],
      supporters: [20, 25],
      impact: [30, 35],
    } satisfies Record<Exclude<PageKey, "other">, [number, number]>,
    /** The Advanced design moves each page's whole range up by this share
        of its middle, rounded to 5, so it costs about 1.5x the Essential+
        and its range is as wide (user, 2026-11-04; it was +35% on the
        lowest end and +45% on the highest, which widened the range). */
    advancedShift: 50,
    /** "Not sure" on what is needed: the sector's usual website (Home,
        About, Contact and the sector's usual pages), its lowest end lowered
        and its highest raised by this share, so the range covers a simpler
        or a fuller choice (user, 2026-11-10). 35% sits near what the
        sectors need to reach their cheapest website (24–43% down) and a
        fuller 9-page one (29–55% up), without going to the extremes. */
    unsurePercent: 35,
    /** Page prices by market, against Portugal. */
    pagesMarket: { pt: 1, "es-it": 1.155, us: 1.75 } satisfies Record<Market, number>,
    /** How long the site takes, in working days, by size. PROVISIONAL. */
    days: {
      landing: [4, 7],
      "3": [6, 9],
      "4-6": [8, 11],
      "7-10": [12, 16],
      unsure: [6, 14],
    } as Record<Size, [number, number]>,
    /** What every website comes with, shown under its line. Kept in
        step with the contract (clauses 11 and 12). */
    includes: {
      en: "Includes optimised images, review of your texts, free hosting (the first contract year, renewed yearly) and, if you wish, a free call once part of the site is built.",
      pt: "Inclui imagens otimizadas, revisão dos textos, alojamento gratuito (1.º ano de contrato, renovado de ano a ano) e, se pedida, uma chamada gratuita com parte do site construída.",
    } satisfies Copy,

    /** What the upper end allows for, shown under the website's line. */
    marginNote: {
      en: "The upper end covers the unforeseen: content volume, connected tools (maps, social media), special design (illustrations, animations), site migration.",
      pt: "O valor mais alto cobre o imprevisto: conteúdo, ferramentas (mapas, redes sociais), design especial (ilustrações, animações) e migração de site.",
    } satisfies Copy,
    /** The visual identity redesign (logo and symbol). */
    // Portugal 85 (user, 2026-11-04; it was 110); the other markets lowered
    // in the same proportion, to 5.
    identity: { pt: 85, "es-it": 95, us: 150 } satisfies ByMarket,
    /** Portuguese and English are included; each other language costs
        the same, in every country (user, 2026-10-19; 25 since 2026-11-05,
        contract v1.15, clause 11.4). */
    perLanguage: 25,
    /* Writing the website's texts, when the client has none, is included:
       whether there are texts or not never changes the price (user,
       2026-11-04; contract v1.14, clause 11.1). */
    /** The second level of what a website does (user, 2026-10-29), as
        fixed prices for Portugal; other markets scaled by featuresMarket.
        A manual form is one with a single automatic email and its answers
        saved in a database; from there every email is written by hand. An
        automated one (templates with placeholders) has its price set in the
        proposal (contract v1.15, clause 15.1). */
    features: {
      /** By how many (manual) forms. */
      forms: 55,
      /** The sign-up, its welcome email and its record in the database. */
      newsletter: 39,
      /** Calendar and reservations, set up and configured. */
      booking: 95,
    },
    /** The back end's monthly fee (user, 2026-11-04). Our labour is always
        10 a month (5 until 2026-11-04), however many platforms. The estimate runs from that alone
        (the free plan is enough) to that plus the platforms' paid plans,
        which the client pays directly. Forms and the newsletter share one
        platform (Brevo), the calendar is another (Cal.com). A restaurant in
        Portugal uses its own reservation platform at a fixed "restaurant"
        fee (with its upkeep inside), with no paid-plan scenario. Labour is
        scaled by featuresMarket; the plans are the platforms' own prices
        with 23% VAT, yearly billing, not scaled: Brevo Starter 6.33 EUR,
        Cal.com Teams 12 USD at about 1.15 USD per EUR (checked 2026-11-04
        on third-party pages: to confirm). */
    monthly: { labour: 10, restaurant: 40, plans: { brevo: 7.79, calcom: 12.83 } },
    featuresMarket: { pt: 1, "es-it": 1.15, us: 1.75 } satisfies Record<Market, number>,
    /** What a new domain costs a year, shown to a client without one as
        a reference only: the client registers and pays for it directly,
        in their own name (contract v1.9, clause 13), so it is never
        added to our price. */
    newDomain: { min: 10, max: 30 },
    /** Added for an urgent deadline, on the project's whole one-time price
        (user, 2026-11-04; contract v1.13, clause 4.5), never on the monthly
        fees. The timeline is then agreed between both sides. */
    urgentPercent: 40,
  },

  /** Mainland Portugal only (user, 2026-11-10): the form and the server
      refuse the shoot anywhere else. */
  photo: { photos: 245, "photos-video": 370 },
  /** Shown under the photo line, as the contract sets it (clause 10.3). */
  photoTravel: {
    en: "Travel within 30 km of Vila Nova de Gaia is included. Beyond that, it is charged per km, as set in your proposal.",
    pt: "A deslocação até 30 km de Vila Nova de Gaia está incluída. A partir daí, é cobrada ao km, como fica definido na proposta.",
  } satisfies Copy,

  /** SEO and GEO are sold only with a website we built, and priced from it
      (user, 2026-11-04) by fixed shares (user, 2026-11-10): the one-time
      work is 22.5% of the website, the monthly service 30% of the one-time
      work. They are ranges only because the website is one; the lowest end
      rounds down to 5 and the highest up, so the real figure is always
      inside. Until 2026-11-10 the shares were ranges themselves (17.5–22.5%
      and 28–30%) with both ends to the nearest 5, which could put the
      highest end under the real figure. Every reach is priced the same way
      (user, 2026-11-10; international was on request). PROVISIONAL. */
  search: { setup: 22.5, monthlyOfSetup: 30 },
};

export type Pricing = typeof PRICING;
