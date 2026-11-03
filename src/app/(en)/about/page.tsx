import type { Metadata } from "next";
import { About } from "@/components/about";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("/about", "en");

export default function AboutPage() {
  return <About />;
}
