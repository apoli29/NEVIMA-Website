import type { Metadata } from "next";
import { WebDesign } from "@/components/web-design";
import { findService, servicePath } from "@/lib/services";

/* The main service has a page of its own (web-design.tsx); the other
   services keep the shared one in [slug]. */

const service = findService("web-design")!;

export const metadata: Metadata = {
  title: service.title,
  description: service.body,
  alternates: { canonical: servicePath(service.slug) },
  // Its projects' fields and images are still to be filled in, so search
  // engines are asked to leave it out until they are.
  robots: { index: false, follow: true },
};

export default function WebDesignPage() {
  return <WebDesign />;
}
