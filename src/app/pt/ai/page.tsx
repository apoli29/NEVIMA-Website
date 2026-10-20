import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { alternates } from "@/lib/i18n";
import { AI_POLICY } from "@/lib/legal/ai";

const doc = AI_POLICY.doc.pt;

export const metadata: Metadata = {
  title: doc.title,
  description: doc.lede,
  alternates: alternates(AI_POLICY.slug, "pt"),
  // As the other legal pages: out of search engines until the address is in.
  robots: { index: false, follow: true },
};

export default function Page() {
  return <LegalPage record={AI_POLICY} />;
}
