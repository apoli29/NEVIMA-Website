import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { alternates } from "@/lib/i18n";
import { PRIVACY } from "@/lib/legal/privacy";

const doc = PRIVACY.doc.pt;

export const metadata: Metadata = {
  title: doc.title,
  description: doc.lede,
  alternates: alternates(PRIVACY.slug, "pt"),
  // Left out of search engines until the studio's address is filled in.
  robots: { index: false, follow: true },
};

export default function Page() {
  return <LegalPage record={PRIVACY} />;
}
