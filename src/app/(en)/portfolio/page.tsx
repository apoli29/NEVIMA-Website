import type { Metadata } from "next";
import { Portfolio } from "@/components/portfolio";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("/portfolio", "en");

export default function PortfolioPage() {
  return <Portfolio />;
}
