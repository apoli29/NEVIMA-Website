import type { Metadata } from "next";
import { Portfolio } from "@/components/portfolio";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("/portfolio", "pt");

export default function PortfolioPage() {
  return <Portfolio />;
}
