import { sendEmail, studioInbox } from "@/lib/proposal/deliver";
import { allow, clientIp, json, readJson } from "@/lib/proposal/guard";
import { readMeeting } from "@/lib/proposal/meeting";
import { getRequest, prop, updatePage } from "@/lib/proposal/notion";
import { slotDate, slotSentence, ZONE } from "@/lib/proposal/slots";

/* A time for the call, confirmed by the client on the meeting page. The
   request's page in Notion gets the date and "Reunião marcada", and the
   studio a notice. Confirming again, or the other time, just moves it:
   the last choice holds, and the studio is told each time. */

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!allow(`meeting:${clientIp(request)}`, 10, 15 * 60_000)) return json({ error: "rate_limited" }, 429);
  const body = (await readJson(request)) as { t?: unknown; h?: unknown } | null;
  const meeting = readMeeting(body?.t);
  if (!meeting) return json({ error: "invalid" }, 400);
  const choice = body?.h === 1 ? 1 : 0;
  const slot = meeting.slots[choice];
  if (slotDate(slot).getTime() < Date.now()) return json({ error: "past" }, 410);

  const page = await getRequest(meeting.page);
  if (!page) return json({ error: "not_found" }, 404);
  if (page.meeting.startsWith(slot)) return json({ ok: true, slot });

  const booked = await updatePage(meeting.page, {
    "Reunião": prop.localDate(slot, ZONE),
    Estado: prop.select("Reunião marcada"),
  });
  if (!booked) return json({ error: "not_configured" }, 503);

  const moved = Boolean(page.meeting);
  await sendEmail({
    to: studioInbox(),
    reply_to: page.email || undefined,
    subject: `${moved ? "Reunião mudada" : "Reunião marcada"}: ${page.name}${page.company ? ` (${page.company})` : ""}`,
    text: [
      `${page.name} ${moved ? "mudou a chamada para" : "escolheu"} ${slotSentence(slot, "pt")} (hora de Lisboa).`,
      "",
      `Email: ${page.email}`,
      `Idioma: ${page.lang}`,
      "",
      "Falta enviar o convite com o link da chamada.",
      "",
      page.url ? `No Notion: ${page.url}` : "",
    ].join("\n"),
  });
  return json({ ok: true, slot });
}
