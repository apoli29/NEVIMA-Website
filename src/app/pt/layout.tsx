import type { Metadata, Viewport } from "next";
import { SiteRoot } from "@/components/site-root";
import { siteMetadata } from "@/lib/seo";

/* The Portuguese pages (see src/lib/i18n.ts): the same pages as the
   English ones, under /pt, with the words of their addresses translated
   and the document declared in Portuguese (site-root.tsx). */

export const metadata: Metadata = siteMetadata("pt");

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function PortugueseLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <SiteRoot lang="pt">{children}</SiteRoot>;
}
