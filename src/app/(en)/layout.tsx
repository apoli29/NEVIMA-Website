import type { Metadata, Viewport } from "next";
import { SiteRoot } from "@/components/site-root";
import { siteMetadata } from "@/lib/seo";

/* The English pages, at the site's own addresses (see src/lib/i18n.ts).
   The document is shared with the Portuguese pages (site-root.tsx). */

export const metadata: Metadata = siteMetadata("en");

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function EnglishLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <SiteRoot lang="en">{children}</SiteRoot>;
}
