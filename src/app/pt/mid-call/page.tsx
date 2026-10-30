import type { Metadata } from "next";
import { MidCall } from "@/components/mid-call";
import { readMidCall } from "@/lib/proposal/meeting";

/* Where the final proposal's two buttons lead (see src/components/mid-call.tsx). */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reunião a meio do projeto",
  robots: { index: false, follow: false },
};

export default async function MidCallPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const { t, a } = await searchParams;
  return <MidCall lang="pt" token={readMidCall(t) ? (t as string) : null} answer={a === "yes" ? "yes" : "no"} />;
}
