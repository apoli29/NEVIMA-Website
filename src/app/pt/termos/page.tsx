import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { pageMetadata } from "@/lib/seo";
import { TERMS } from "@/lib/legal/terms";

export const metadata: Metadata = pageMetadata(TERMS.slug, "pt");

export default function Page() {
  return <LegalPage record={TERMS} />;
}
