import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { alternates } from "@/lib/i18n";
import { LEGAL_NOTICE } from "@/lib/legal/legal-notice";

const doc = LEGAL_NOTICE.doc.pt;

export const metadata: Metadata = {
  title: doc.title,
  description: doc.lede,
  alternates: alternates(LEGAL_NOTICE.slug, "pt"),
  // Left out of search engines until the studio's address is filled in.
  robots: { index: false, follow: true },
};

export default function Page() {
  return <LegalPage record={LEGAL_NOTICE} />;
}
