import type { MetadataRoute } from "next";
import { absolute, SEO_PAGES } from "@/lib/seo";

/* Every page search engines may list, in both languages, each with its
   other language beside it (the same pairs as each page's hreflang).
   Set from the list in src/lib/seo.ts, so a page appears here the moment
   it is opened to search engines. No dates: the site has no record of
   when each page last changed, and a made-up one (the build's day) makes
   search engines distrust them all (docs/seo-decisions.md). */

export default function sitemap(): MetadataRoute.Sitemap {
  return SEO_PAGES.filter((page) => page.index).flatMap((page) => {
    const languages = { en: absolute(page.path, "en"), "pt-PT": absolute(page.path, "pt") };
    return (["en", "pt"] as const).map((lang) => ({
      url: absolute(page.path, lang),
      alternates: { languages: { ...languages, "x-default": languages.en } },
    }));
  });
}
