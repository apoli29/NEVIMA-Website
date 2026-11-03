import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { pageMetadata } from "@/lib/seo";
import { LEGAL_NOTICE } from "@/lib/legal/legal-notice";

export const metadata: Metadata = pageMetadata(LEGAL_NOTICE.slug, "en");

export default function Page() {
  return <LegalPage record={LEGAL_NOTICE} />;
}
