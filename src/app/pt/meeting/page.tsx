import type { Metadata } from "next";
import { Meeting } from "@/components/meeting";
import { meetingView } from "@/lib/proposal/meeting-view";

/* Where the invitation's time buttons lead (see src/components/meeting.tsx). */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Marcar a chamada",
  robots: { index: false, follow: false },
};

export default async function MeetingPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const { t, h } = await searchParams;
  return <Meeting lang="pt" view={meetingView(t, h)} />;
}
