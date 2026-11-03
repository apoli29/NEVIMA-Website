import type { Metadata } from "next";
import { Home } from "@/components/home";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("/", "pt");

export default function Page() {
  return <Home />;
}
