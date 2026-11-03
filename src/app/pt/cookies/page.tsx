import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { pageMetadata } from "@/lib/seo";
import { COOKIES } from "@/lib/legal/cookies";

export const metadata: Metadata = pageMetadata(COOKIES.slug, "pt");

export default function Page() {
  return <LegalPage record={COOKIES} />;
}
