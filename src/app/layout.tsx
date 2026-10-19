import type { Metadata, Viewport } from "next";
import { Geist_Mono, Instrument_Sans } from "next/font/google";
import localFont from "next/font/local";
import { CtaGlassFilters } from "@/components/cta-glass";
import { HtmlLang, LANG_SCRIPT } from "@/components/html-lang";
import { OffscreenPause } from "@/components/offscreen-pause";
import { PageWipe } from "@/components/page-wipe";
import { ReturnKeeper } from "@/components/return-keeper";
import { OPENING_SCRIPT } from "@/lib/opened";
import "./globals.css";

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

/* The English site's title and description; the Portuguese pages carry
   their own (src/app/pt/layout.tsx). */
export const metadata: Metadata = {
  metadataBase: new URL("https://nevima.studio"),
  title: {
    default: "nevima — websites and visual identity",
    template: "%s · nevima",
  },
  description:
    "Two people, the right tools: websites and visual identity on a par with much bigger agencies, without the red tape that usually comes with their size.",
  openGraph: {
    title: "nevima — less structure, more reach",
    description:
      "A website and visual identity studio. Two people, zero intermediaries, big-agency results.",
    type: "website",
    locale: "en_US",
    alternateLocale: ["pt_PT"],
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // The language is set again on a /pt page before it is painted (see
    // html-lang.tsx), so the server's "en" is expected to differ there; so
    // is the class, which holds the home page still while its opening
    // plays (OPENING_SCRIPT, src/lib/opened.ts).
    <html lang="en" className={`${title.variable} ${read.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: LANG_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: OPENING_SCRIPT }} />
      </head>
      <body className="antialiased">
        <HtmlLang />
        <CtaGlassFilters />
        <ReturnKeeper />
        <OffscreenPause />
        <PageWipe />
        {children}
      </body>
    </html>
  );
}
