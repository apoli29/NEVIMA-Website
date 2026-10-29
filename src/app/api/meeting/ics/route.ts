import { readMeeting } from "@/lib/proposal/meeting";
import { CALL_MINUTES, slotDate } from "@/lib/proposal/slots";
import { STUDIO_EMAIL } from "@/lib/proposal/mail";

/* The chosen call as a calendar file, for "Add to calendar" on the
   meeting page once the time is booked. Anyone with the link can get
   it, and it holds nothing but the time and the studio's address. */

export const dynamic = "force-dynamic";

const stamp = (date: Date) => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

export function GET(request: Request) {
  const url = new URL(request.url);
  const meeting = readMeeting(url.searchParams.get("t"));
  if (!meeting) return new Response("Not found", { status: 404 });
  const slot = meeting.slots[url.searchParams.get("h") === "1" ? 1 : 0];
  const start = slotDate(slot);
  const end = new Date(start.getTime() + CALL_MINUTES * 60_000);
  const pt = meeting.lang === "pt";
  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//nevima//meeting//PT",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${meeting.page}-${stamp(start)}@nevima.studio`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${pt ? "Chamada com a nevima" : "Call with nevima"}`,
    `DESCRIPTION:${pt ? "Apresentação da proposta (20 a 30 minutos)." : "Presenting the proposal (20 to 30 minutes)."}`,
    `ORGANIZER;CN=nevima:mailto:${STUDIO_EMAIL}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
  return new Response(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="nevima-${pt ? "chamada" : "call"}.ics"`,
      "Cache-Control": "no-store",
    },
  });
}
