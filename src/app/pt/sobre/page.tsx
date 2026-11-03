import type { Metadata } from "next";
import { About } from "@/components/about";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("/about", "pt");

export default function AboutPage() {
  return <About />;
}
