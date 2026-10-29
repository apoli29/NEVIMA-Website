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

export default async function StudioPage() {
  const jar = await cookies();
  return isStudio(jar.get(COOKIE)?.value) ? <StudioComposer /> : <StudioLogin />;
}
