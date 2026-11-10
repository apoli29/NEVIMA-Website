import { sendEmail, studioInbox } from "@/lib/proposal/deliver";
import { allow, clientIp, json, readJson } from "@/lib/proposal/guard";
import { readMeeting } from "@/lib/proposal/meeting";
import { addAlert, getRequest, prop, setSteps, updatePage } from "@/lib/proposal/notion";
import { slotDate, slotSentence, ZONE } from "@/lib/proposal/slots";
import { PAST_BOOKING, shortSlot } from "@/lib/proposal/steps";

/* A time for the call, confirmed by the client on the meeting page. The
   request's page in Notion gets the date and "Reunião marcada", and the
   studio a notice. Confirming again, or the other time, just moves it:
   the last choice holds, and the studio is told each time. A request
   already past the booking keeps its state: an old button only moves the
   date. If the notice cannot be sent, the page's "Alertas" says so.

   Then, in a change of their own, the steps (steps.ts): "Marcação"
   Agendada (the call's link still to send), with a line of "Histórico";
   past the booking, only the line. If that change fails, "Alertas" says
   so too: the booking itself stands. */

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
    // "Data da Reunião" in "Pedidos", "Reunião" in "Parceiros".
    [page.meetingKey]: prop.localDate(slot, ZONE),
    Estado: PAST_BOOKING.has(page.state) ? undefined : prop.select("Reunião marcada"),
  });
  if (!booked) return json({ error: "not_configured" }, 503);

  const moved = Boolean(page.meeting);
  const stepped = await setSteps(
    meeting.page,
    page.history,
    PAST_BOOKING.has(page.state) ? {} : { "Marcação": "Agendada" },
    `Chamada ${moved ? "mudada" : "marcada"} para ${shortSlot(slot)}`,
    "cliente",
  );
  const told = await sendEmail({
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
      ...(PAST_BOOKING.has(page.state) ? [`O estado continua em ${page.state}.`] : []),
      "",
      page.url ? `No Notion: ${page.url}` : "",
    ].join("\n"),
  });
  const missing = [
    !told && `Aviso não enviado: horário ${slot.replace("T", " ")}`,
    !stepped && "Marcação por atualizar à mão",
  ].filter(Boolean);
  if (missing.length) await addAlert(meeting.page, page.alerts, missing.join(" · "));
  return json({ ok: true, slot });
}
