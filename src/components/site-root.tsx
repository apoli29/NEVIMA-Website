import { Geist_Mono, Instrument_Sans } from "next/font/google";
import localFont from "next/font/local";
import { CookieConsent } from "@/components/cookie-consent";
import { CtaGlassFilters } from "@/components/cta-glass";
import { JsonLd } from "@/components/json-ld";
import { OffscreenPause } from "@/components/offscreen-pause";
import { PageWipe } from "@/components/page-wipe";
import { ReturnKeeper } from "@/components/return-keeper";
import { HTML_LANG, type Lang } from "@/lib/i18n";
import { OPENING_SCRIPT } from "@/lib/opened";
import { SCREEN_SCRIPT } from "@/lib/screen";
import { siteGraph } from "@/lib/seo";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "@/app/globals.css";

/* ==================================================================
   The document around every page

   Each language has its own root layout (src/app/(en)/layout.tsx and
   src/app/pt/layout.tsx), so the server writes the page's language into
   the document itself, <html lang="pt-PT"> on a Portuguese page, where a
   search engine and a screen reader read it before any script runs
   (docs/seo-decisions.md). Both are this one document. Going from one
   language to the other loads the page anew, which the foot's switch
   allows for (see return-spot.ts).
   ================================================================== */

/* Titles: Satoshi (manual v2), self-hosted from /fonts. The variable file is
   used so the headline weight is a true Medium (500) and the lighter line
   above it is a real Light (300) rather than a synthesised one. Its range
   starts at 300, so nothing on the page asks for a lighter title. */
const title = localFont({
  src: "../../fonts/Satoshi/Satoshi-Variable.woff2",
  weight: "300 900",
  style: "normal",
  variable: "--f-title",
  display: "swap",
});

/* Everything that is not a title. Open apertures and a tall x-height, which
   is what the supporting line needs at small size on a white ground. */
const read = Instrument_Sans({
  subsets: ["latin"],
  variable: "--f-read",
  display: "swap",
});

/* Labels: the gallery's wall captions and the studio's readouts (where,
   what time, what is on show). A monospace, so figures that change in
   place, like the clock, hold still. */
const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--f-mono",
  display: "swap",
});

export function SiteRoot({
  lang,
  head,
  children,
}: Readonly<{ lang: Lang; head?: React.ReactNode; children: React.ReactNode }>) {
  return (
    // The class holds the home page still while its opening plays
    // (OPENING_SCRIPT, src/lib/opened.ts) and the style carries the
    // screen's height (SCREEN_SCRIPT, src/lib/screen.ts): both are set in
    // the head before the first paint, so they are expected to differ
    // from the server's.
    <html lang={HTML_LANG[lang]} className={`${title.variable} ${read.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: OPENING_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: SCREEN_SCRIPT }} />
        {head}
        <JsonLd data={siteGraph(lang)} />
      </head>
      <body className="antialiased">
        <CtaGlassFilters />
        <ReturnKeeper />
        <OffscreenPause />
        <PageWipe />
        {children}
        <CookieConsent />
        {/* Page speed as visitors feel it (Core Web Vitals), without
            cookies; it only measures once it is switched on in Vercel. */}
        <SpeedInsights />
      </body>
    </html>
  );
}
