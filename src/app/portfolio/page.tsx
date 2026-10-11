import type { Metadata } from "next";
import { Portfolio } from "@/components/portfolio";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "The websites and visual identities Nevima has made, case by case.",
  // Its fields and photos are still stand-ins.
  robots: { index: false, follow: true },
};

export default function PortfolioPage() {
  return <Portfolio />;
}
