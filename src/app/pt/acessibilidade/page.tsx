import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { pageMetadata } from "@/lib/seo";
import { ACCESSIBILITY } from "@/lib/legal/accessibility";

export const metadata: Metadata = pageMetadata(ACCESSIBILITY.slug, "pt");

export default function Page() {
  return <LegalPage record={ACCESSIBILITY} />;
}
