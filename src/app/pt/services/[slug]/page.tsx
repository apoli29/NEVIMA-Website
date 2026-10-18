import type { Metadata } from "next";
import { ServicePage, serviceMetadata, serviceParams } from "@/components/service-page";

/* One page per service, in Portuguese (see service-page.tsx). */

export function generateStaticParams() {
  return serviceParams();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return serviceMetadata((await params).slug, "pt");
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <ServicePage slug={(await params).slug} lang="pt" />;
}
