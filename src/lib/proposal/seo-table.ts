import "server-only";
import { PRICING } from "./pricing";

/* ==================================================================
   The SEO & GEO page's calculator (seo-geo.tsx): what the one-off work
   and the monthly service cost for a website of each size, worked out
   here on the server so the price tables never reach the browser whole.

   A size is priced as the form prices a website: Home, About and
   Contact, plus the usual pages averaged (the visitor does not choose
   pages here), in Portugal with the Essential+ design. A landing page
   is the landing page's own range. SEO & GEO then follows the form's
   rule exactly (estimate.ts, search()): the one-off work is a share of
   the website, the monthly service a share of the one-off work, the
   lowest end rounded down to 5 and the highest up.
   ================================================================== */

export type SeoPrice = { pages: number; once: [number, number]; monthly: [number, number] };

/** From a landing page (1) to ten pages. */
const SIZES = [1, 3, 4, 5, 6, 7, 8, 9, 10];

/** The pages a website usually adds to Home, About and Contact. */
const USUAL = ["services", "testimonials", "faq", "gallery", "team", "process", "prices", "portfolio"] as const;

function siteRange(pages: number): [number, number] {
  const p = PRICING.web.pages;
  if (pages === 1) return p.landing;
  const n = USUAL.length;
  const lo = USUAL.reduce((s, k) => s + p[k][0] / n, 0);
  const hi = USUAL.reduce((s, k) => s + p[k][1] / n, 0);
  const extra = pages - 3;
  return [p.home[0] + p.about[0] + p.contact[0] + extra * lo, p.home[1] + p.about[1] + p.contact[1] + extra * hi];
}

function outward(a: number, b: number): [number, number] {
  const min = Math.max(5, Math.floor(a / 5) * 5);
  return [min, Math.max(min, Math.ceil(b / 5) * 5)];
}

export function seoPriceTable(): SeoPrice[] {
  const { setup, monthlyOfSetup } = PRICING.search;
  return SIZES.map((pages) => {
    const [lo, hi] = siteRange(pages);
    const sLo = (lo * setup) / 100;
    const sHi = (hi * setup) / 100;
    return {
      pages,
      once: outward(sLo, sHi),
      monthly: outward((sLo * monthlyOfSetup) / 100, (sHi * monthlyOfSetup) / 100),
    };
  });
}
