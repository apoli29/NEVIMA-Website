import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { pageMetadata } from "@/lib/seo";
import { PRIVACY } from "@/lib/legal/privacy";

export const metadata: Metadata = pageMetadata(PRIVACY.slug, "en");

export default function Page() {
  return <LegalPage record={PRIVACY} />;
}
