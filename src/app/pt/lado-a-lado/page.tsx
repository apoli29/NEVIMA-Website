import type { Metadata } from "next";
import { SideBySide } from "@/components/side-by-side";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("/side-by-side", "pt");

export default function Page() {
  return <SideBySide />;
}
