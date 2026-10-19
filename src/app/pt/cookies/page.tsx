import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { alternates } from "@/lib/i18n";
import { COOKIES } from "@/lib/legal/cookies";

const doc = COOKIES.doc.pt;

export const metadata: Metadata = {
  title: doc.title,
  description: doc.lede,
  alternates: alternates(COOKIES.slug, "pt"),
  // As the other legal pages: out of search engines until the address is in.
  robots: { index: false, follow: true },
};

export default function Page() {
  return <LegalPage record={COOKIES} />;
}
