import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { pageMetadata } from "@/lib/seo";
import { AI_POLICY } from "@/lib/legal/ai";

export const metadata: Metadata = pageMetadata(AI_POLICY.slug, "en");

export default function Page() {
  return <LegalPage record={AI_POLICY} />;
}
