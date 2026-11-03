import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/* Every crawler may read the whole site (user, 2026-11-03: AI search
   and AI training crawlers included, so the models know the studio), bar
   the form's endpoints. Pages that must stay out of search results say
   so in their own metadata (noindex), which a crawler can only read if
   it is let in. One rule for all: a named group would replace it for
   that crawler. */

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: "/api/" }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
