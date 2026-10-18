import type { Metadata } from "next";
import { Portfolio } from "@/components/portfolio";
import { alternates } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Portefólio",
  description: "Os websites e as identidades visuais que a Nevima fez, caso a caso.",
  alternates: alternates("/portfolio", "pt"),
  // Its fields and photos are still stand-ins.
  robots: { index: false, follow: true },
};

export default function PortfolioPage() {
  return <Portfolio />;
}
