import { ImageResponse } from "next/og";
import { satoshiMedium, wordmark, WORDMARK_RATIO } from "@/lib/brand-image";
import type { Lang } from "@/lib/i18n";
import { SEO_PAGES, seoPage } from "@/lib/seo";

/* ==================================================================
   The image a shared link shows (WhatsApp, LinkedIn, email): 1200×630,
   one per page and language, drawn at build time from the page's line in
   src/lib/seo.ts, so it follows the page's words on its own.

   The footer's black, the wordmark small at the top, and the page's name
   large at the foot in the titles' face: the name is the one thing on
   it, read at a glance in a chat's small preview.
   ================================================================== */

export const dynamic = "force-static";
export const dynamicParams = false;

const LANGS: Lang[] = ["en", "pt"];

const toPath = (page: string[]) => (page.join("/") === "home" ? "/" : `/${page.join("/")}`);

export function generateStaticParams() {
  return SEO_PAGES.flatMap((entry) =>
    LANGS.map((lang) => ({ lang, page: entry.path === "/" ? ["home"] : entry.path.slice(1).split("/") })),
  );
}

export async function GET(_request: Request, { params }: { params: Promise<{ lang: string; page: string[] }> }) {
  const { lang, page } = await params;
  const words = seoPage(toPath(page)).card[lang as Lang];
  const [mark, font] = await Promise.all([wordmark(), satoshiMedium()]);
  // Two lines at most at either size: a short name is set larger.
  const size = words.length <= 16 ? 132 : 104;
  const markHeight = 46;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#000000",
          padding: "72px 80px 80px",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={mark} alt="" width={Math.round(markHeight * WORDMARK_RATIO)} height={markHeight} />
        <div
          style={{
            display: "flex",
            color: "#ffffff",
            fontFamily: font ? "Satoshi" : undefined,
            fontWeight: 500,
            fontSize: size,
            lineHeight: 1.02,
            letterSpacing: "-0.035em",
            maxWidth: 1000,
          }}
        >
          {words}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: font ? [{ name: "Satoshi", data: font, weight: 500, style: "normal" }] : undefined,
    },
  );
}
