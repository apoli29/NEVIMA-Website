import type { Metadata } from "next";
import { cookies } from "next/headers";
import { StudioComposer, StudioLogin } from "@/components/studio-composer";
import { COOKIE, isStudio } from "@/lib/proposal/studio";

/* The studio's composer, behind its key (src/lib/proposal/studio.ts).
   Not linked from anywhere and kept out of search engines. */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Interno · nevima" },
  robots: { index: false, follow: false },
};

export default async function StudioPage({ searchParams }: { searchParams: Promise<{ porta?: string | string[] }> }) {
  const jar = await cookies();
  if (isStudio(jar.get(COOKIE)?.value)) return <StudioComposer />;
  // Why the door did not open, when the form was sent without the page's script.
  const { porta } = await searchParams;
  return <StudioLogin reason={typeof porta === "string" ? porta : ""} />;
}
