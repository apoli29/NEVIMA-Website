import type { Metadata } from "next";
import { ServicePage, serviceMetadata, serviceParams, slugFrom } from "@/components/service-page";

/* One page per service, in Portuguese, under its Portuguese address
   (see service-page.tsx). */

export const dynamicParams = false;

export function generateStaticParams() {
  return serviceParams("pt");
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return serviceMetadata(slugFrom((await params).slug, "pt"), "pt");
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <ServicePage slug={slugFrom((await params).slug, "pt")} lang="pt" />;
}
